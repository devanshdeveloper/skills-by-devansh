'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { extractInternalLinksFromPage } = require('./routes');

async function extractAssetsFromPageDom(page, pageUrl, baseUrl) {
  try {
    return await page.evaluate(({ pageUrl, baseUrl }) => {
      const assets = [];

      // 1. <img> tags and srcsets
      document.querySelectorAll('img').forEach((img) => {
        const src = img.currentSrc || img.src || img.getAttribute('data-src') || img.getAttribute('data-original');
        if (src && !src.startsWith('data:')) {
          assets.push({ url: src, alt: img.alt || '', naturalWidth: img.naturalWidth || 0, naturalHeight: img.naturalHeight || 0, type: 'image', tagName: 'img' });
        }
        const srcset = img.getAttribute('srcset') || img.getAttribute('data-srcset');
        if (srcset) {
          srcset.split(',').forEach((part) => {
            const u = part.trim().split(/\s+/)[0];
            if (u && !u.startsWith('data:')) assets.push({ url: u, alt: img.alt || '', naturalWidth: 0, naturalHeight: 0, type: 'image', tagName: 'srcset' });
          });
        }
      });

      // 2. <picture><source> elements
      document.querySelectorAll('picture source').forEach((srcEl) => {
        const srcset = srcEl.getAttribute('srcset');
        if (srcset) {
          srcset.split(',').forEach((part) => {
            const u = part.trim().split(/\s+/)[0];
            if (u && !u.startsWith('data:')) assets.push({ url: u, alt: '', naturalWidth: 0, naturalHeight: 0, type: 'image', tagName: 'picture-source' });
          });
        }
      });

      // 3. Stylesheets, favicons, meta images, and scripts
      document.querySelectorAll('link[rel*="stylesheet"], link[rel*="icon"]').forEach((l) => {
        if (l.href && !l.href.startsWith('data:')) assets.push({ url: l.href, alt: '', naturalWidth: 0, naturalHeight: 0, type: l.rel.includes('stylesheet') ? 'stylesheet' : 'icon', tagName: 'link' });
      });
      document.querySelectorAll('meta[property*="image"], meta[name*="image"]').forEach((m) => {
        const c = m.getAttribute('content');
        if (c && !c.startsWith('data:')) assets.push({ url: c, alt: '', naturalWidth: 0, naturalHeight: 0, type: 'image', tagName: 'meta-image' });
      });
      document.querySelectorAll('script[src]').forEach((s) => {
        if (s.src && !s.src.startsWith('data:')) assets.push({ url: s.src, alt: '', naturalWidth: 0, naturalHeight: 0, type: 'script', tagName: 'script' });
      });

      // 4. Downloadable documents & SVG links
      document.querySelectorAll('a[href]').forEach((a) => {
        if (!a.href) return;
        if (/\.(pdf|docx?|xlsx?|pptx?)$/i.test(a.href)) {
          assets.push({ url: a.href, alt: a.innerText.trim(), naturalWidth: 0, naturalHeight: 0, type: 'document', tagName: 'a-doc' });
        } else if (/\.svg$/i.test(a.href)) {
          assets.push({ url: a.href, alt: a.innerText.trim(), naturalWidth: 0, naturalHeight: 0, type: 'image', tagName: 'a-svg' });
        }
      });

      // 5. Background styles
      document.querySelectorAll('[style*="background"]').forEach((el) => {
        const m = (el.getAttribute('style') || '').match(/url\(['"]?(.*?)['"]?\)/i);
        if (m && m[1] && !m[1].startsWith('data:')) {
          assets.push({ url: m[1], alt: '', naturalWidth: 0, naturalHeight: 0, type: 'image', tagName: 'bg-style' });
        }
      });

      return assets;
    }, { baseUrl, pageUrl });
  } catch {
    return [];
  }
}

async function capturePageArtifacts(browser, pageUrl, slug, pageRelHtmlPath, outDir, timeoutMs = 25000) {
  const fullPageHtmlPath = path.join(outDir, pageRelHtmlPath);
  const targetDir = path.dirname(fullPageHtmlPath);
  fs.mkdirSync(targetDir, { recursive: true });

  console.log(`\n  -> Capturing [${slug}] (${pageUrl})`);

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  const networkBuffers = new Map();
  page.on('response', async (res) => {
    try {
      const resUrl = res.url();
      if (!resUrl.startsWith('http') || res.status() < 200 || res.status() >= 300) return;
      const ct = (res.headers()['content-type'] || '').toLowerCase();
      const isAsset = ct.includes('image') || ct.includes('javascript') || ct.includes('css') ||
        ct.includes('font') || ct.includes('pdf') || ct.includes('svg') ||
        /\.(png|jpe?g|svg|webp|gif|css|js|woff2?|ttf|eot|pdf|ico)$/i.test(resUrl.split('?')[0]);
      if (isAsset && !networkBuffers.has(resUrl)) {
        const body = await res.body().catch(() => null);
        if (body && body.length > 0) {
          networkBuffers.set(resUrl, { buffer: body, contentType: ct, url: resUrl });
        }
      }
    } catch {}
  });

  try {
    try {
      await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: timeoutMs });
    } catch {
      await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
    }

    await page.waitForTimeout(1500);
    try { await page.evaluate(() => document.fonts.ready); } catch {}

    // Scroll through page to trigger lazy-loaded images
    try {
      const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      const steps = Math.min(16, Math.ceil(scrollHeight / 700));
      for (let i = 0; i < steps; i++) {
        await page.mouse.wheel(0, 700);
        await page.waitForTimeout(150);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(600);
    } catch {}

    const renderedHtml = await page.content();
    const pageTitle = await page.title();
    const finalUrl = page.url();

    const markdownBody = await page.evaluate(() => {
      const clone = document.body.cloneNode(true);
      const toRemove = ['script', 'style', 'noscript', 'iframe', 'svg', '#onetrust-consent-sdk', '.cookie-banner', '#cookie-notice', '[id*="cookie"]', '[class*="cookie"]'];
      toRemove.forEach(sel => clone.querySelectorAll(sel).forEach(el => el.remove()));

      const lines = [];
      function walk(node) {
        if (!node) return;
        if (node.nodeType === Node.TEXT_NODE) {
          const t = node.textContent.trim();
          if (t) lines.push(t);
          return;
        }
        if (node.nodeType !== Node.ELEMENT_NODE) return;

        const tag = node.tagName.toLowerCase();
        const txt = (node.innerText || node.textContent || '').trim();
        if (/^h[1-6]$/.test(tag)) {
          if (txt) lines.push(`\n${'#'.repeat(parseInt(tag[1], 10))} ${txt}\n`);
          return;
        }
        if (tag === 'p') {
          if (txt) lines.push(`\n${txt}\n`);
          return;
        }
        if (tag === 'li') {
          if (txt) lines.push(`- ${txt}`);
          return;
        }
        if (tag === 'a' && node.href && txt && !node.closest('p') && !node.closest('li')) {
          lines.push(`[${txt}](${node.href})`);
          return;
        }
        if (tag === 'img' && node.alt) {
          lines.push(`![${node.alt.trim()}](${node.src || ''})`);
          return;
        }
        for (const c of node.childNodes) walk(c);
      }

      walk(clone);
      return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    });

    const mdHeader = `# ${pageTitle || slug}\n\n**Source URL:** ${finalUrl}\n**Captured Date:** ${new Date().toISOString().split('T')[0]}\n**Page Slug:** \`${slug}\`\n\n---\n\n`;
    const mdPath = path.join(targetDir, 'content.md');
    fs.writeFileSync(mdPath, mdHeader + markdownBody + '\n', 'utf-8');

    const screenshotPath = path.join(targetDir, 'screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const domAssets = await extractAssetsFromPageDom(page, pageUrl, pageUrl);
    const internalLinks = await extractInternalLinksFromPage(page, pageUrl);

    console.log(`     ✓ content.md saved (${fs.statSync(mdPath).size} bytes)`);
    console.log(`     ✓ screenshot.png captured (${fs.statSync(screenshotPath).size} bytes)`);
    console.log(`     ✓ Identified ${domAssets.length} asset slot(s) on page`);

    return {
      slug,
      pageUrl,
      finalUrl,
      pageTitle,
      pageRelHtmlPath,
      targetDir,
      renderedHtml,
      domAssets,
      internalLinks,
      networkBuffers,
      status: 'success'
    };
  } catch (err) {
    console.error(`     ✗ Failed to capture ${pageUrl}: ${err.message}`);
    return {
      slug,
      pageUrl,
      pageRelHtmlPath,
      targetDir,
      status: 'error',
      error: err.message,
      domAssets: [],
      internalLinks: [],
      networkBuffers: new Map()
    };
  } finally {
    await page.close();
    await context.close();
  }
}

module.exports = {
  extractAssetsFromPageDom,
  capturePageArtifacts
};
