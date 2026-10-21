import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { start } from './preview.mjs';

const projectRoot = path.resolve(process.argv[2] || process.cwd());
const base = path.join(projectRoot, 'project-docs/client-review');
const conceptRoot = path.join(base, 'gate-2-design-theory');
const concepts = fs.readdirSync(conceptRoot, { withFileTypes: true })
  .filter(entry => entry.isDirectory() && fs.existsSync(path.join(conceptRoot,entry.name,'index.html')))
  .map(entry => ({ slug: entry.name, name: entry.name }));
assert.ok(concepts.length, 'No concept pages found.');
const report = { checkedAt: new Date().toISOString(), browser:'Chrome via Playwright', checks:[], violations:[] };
const server = await start(projectRoot,0);
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch({channel:'chrome',headless:true});
  const context = await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const page = await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400) errors.push(`${r.status()} ${r.url()}`);});
  await page.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
  for(const c of concepts){
    const url=`${origin}/gate-2-design-theory/${c.slug}/index.html`;
    await page.goto(url);
    await page.evaluate(()=>{localStorage.clear();});
    await page.reload();
    await page.evaluate(()=>document.fonts.ready);
    assert.equal(await page.locator('h1').count(),1);
    const missing=await page.evaluate(()=>[...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.getElementById(a.getAttribute('href').slice(1))).map(a=>a.href));
    assert.deepEqual(missing,[]);
    const folder=path.join(base,'gate-2-design-theory',c.slug);
    for(const width of [320,390,768,1024,1440]){
      await page.setViewportSize({width,height:1000});
      const overflow=await page.evaluate(()=>({document:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
      assert.ok(overflow.document<=overflow.viewport,`${c.slug} overflow at ${width}: ${JSON.stringify(overflow)}`);
      report.checks.push(`${c.slug}: no horizontal overflow at ${width}px`);
    }
    await page.screenshot({path:path.join(folder,'preview.png')});
    await page.screenshot({path:path.join(folder,'proof-desktop.png'),fullPage:true});
    for(const mode of ['light','dark']){
      if(mode==='dark') await page.getByRole('button',{name:'Use dark theme'}).click();
      assert.equal(await page.locator('html').getAttribute('data-theme'),mode);
      for(const width of [1440,390]){
        await page.setViewportSize({width,height:1000});
        const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
        report.violations.push(...axe.violations.map(v=>({concept:c.slug,mode,width,id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({html:n.html,summary:n.failureSummary}))})));
        await page.screenshot({path:path.join(folder,`proof-${width===390?'mobile':'desktop'}-${mode}.png`),fullPage:true});
      }
    }
    await page.reload();
    assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
    await page.getByRole('button',{name:'Use light theme'}).click();
    const disclosure=page.locator('main details').last();
    if(await disclosure.count()) {
      const wasOpen=await disclosure.evaluate(el=>el.open);
      await disclosure.locator('summary').focus();
      await page.keyboard.press('Enter');
      assert.equal(await disclosure.evaluate(el=>el.open),!wasOpen);
    }
    await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:undefined,configurable:true}));
    await page.getByRole('button',{name:'Copy my decision'}).click();
    assert.match(await page.locator('.copy-status').innerText(),/selected/);
    const selection=await page.locator('#decision-text').evaluate(el=>el.value.substring(el.selectionStart,el.selectionEnd));
    assert.ok(selection.length>20);
    const themeTarget=await page.locator('.theme-toggle').boundingBox();
    assert.ok(themeTarget.height>=44);
    report.checks.push(`${c.slug}: themes persist; disclosure works; offline copy fallback selects decision; theme target >=44px`);
    const offline=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844},offline:true});
    const filePage=await offline.newPage();
    await filePage.goto(pathToFileURL(path.join(folder,'index.html')).href);
    await filePage.evaluate(()=>document.fonts.ready);
    assert.ok(await filePage.locator('main h1').isVisible());
    assert.ok((await filePage.locator('main').innerText()).length>100);
    if(await filePage.locator('main details').count()) {
      const last=filePage.locator('main details').last();
      const wasOpen=await last.evaluate(el=>el.open);
      await last.locator('summary').click();
      assert.equal(await last.evaluate(el=>el.open),!wasOpen);
    }
    await offline.close();
    report.checks.push(`${c.slug}: file:// offline load and native disclosures work without JavaScript`);
    console.log(`Checked ${c.name}`);
  }
  for(const pathname of ['/gate-2-design-theory/index.html','/index.html','/credits.html']){
    await page.goto(origin+pathname);
    for(const width of [390,1440]){
      await page.setViewportSize({width,height:1000});
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
      report.violations.push(...axe.violations.map(v=>({page:pathname,width,id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({html:n.html,summary:n.failureSummary}))})));
    }
    const broken=await page.evaluate(async()=>{
      const links=[...new Set([...document.querySelectorAll('a[href]')].map(a=>a.href).filter(h=>h.startsWith(location.origin)&&!h.includes('#')))];
      return (await Promise.all(links.map(async url=>({url,status:(await fetch(url)).status})))).filter(r=>r.status!==200);
    });
    assert.deepEqual(broken,[]);
    report.checks.push(`${pathname}: local navigation and responsive layouts pass`);
  }
  await page.goto(origin+'/gate-2-design-theory/');
  await page.screenshot({path:path.join(base,'gate-2-design-theory/proof-hub-desktop.png'),fullPage:true});
  await page.goto(origin+'/');
  await page.screenshot({path:path.join(base,'proof-desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:path.join(base,'proof-mobile.png'),fullPage:true});
  report.browserErrors=errors;
  if(!errors.length) report.checks.push('No browser JavaScript errors or HTTP asset errors.');
  fs.mkdirSync(path.join(conceptRoot,'_checks'),{recursive:true});
  fs.writeFileSync(path.join(conceptRoot,'_checks/qa.json'),JSON.stringify(report,null,2));
  assert.deepEqual(errors,[]);
  assert.equal(report.violations.length,0,`${report.violations.length} accessibility violations; see gate-2-design-theory/_checks/qa.json`);
  console.log(`${report.checks.length} checks passed; zero automated WCAG A/AA violations.`);
} finally {
  if(browser) await browser.close();
  server.close();
}
