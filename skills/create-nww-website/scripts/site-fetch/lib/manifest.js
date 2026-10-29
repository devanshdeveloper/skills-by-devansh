'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');

function generateSitemapXml(urls, outputPath) {
  const xmlItems = urls.map(u => `  <url>\n    <loc>${u}</loc>\n    <changefreq>monthly</changefreq>\n  </url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlItems}\n</urlset>\n`;
  fs.writeFileSync(outputPath, xml, 'utf-8');
}

function generateManifest({ targetUrl, limitMode, selectedPages, allDiscovered, capturedPages, catalog, manifestPath }) {
  const imageAssets = catalog.filter(a => a.qualityStatus === 'high-res' || a.qualityStatus === 'needs-replacement');
  const vectorAssets = catalog.filter(a => a.qualityStatus === 'vector');
  const docAssets = catalog.filter(a => a.qualityStatus === 'document');
  const highResAssets = catalog.filter(a => a.qualityStatus === 'high-res');

  const manifestData = {
    targetUrl,
    crawledAt: new Date().toISOString(),
    limitMode,
    selectedPages: limitMode === 'selected' ? selectedPages : undefined,
    totalPagesDiscovered: allDiscovered.length,
    pagesCaptured: capturedPages.filter(p => p.status === 'success').length,
    routes: allDiscovered,
    pages: capturedPages.map(p => ({
      slug: p.slug,
      url: p.pageUrl,
      htmlFile: p.pageRelHtmlPath,
      title: p.pageTitle || p.slug,
      status: p.status
    })),
    assets: catalog,
    stats: {
      totalAssetsHarvested: catalog.length,
      imagesCount: imageAssets.length,
      vectorsCount: vectorAssets.length,
      documentsCount: docAssets.length,
      highResCount: highResAssets.length,
      needsReplacementCount: imageAssets.length - highResAssets.length
    }
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2) + '\n', 'utf-8');
  return manifestData;
}

function parseReferencesFromBrief(answersPath) {
  if (!fs.existsSync(answersPath)) return [];
  const text = fs.readFileSync(answersPath, 'utf-8');
  const q12Match = text.match(/Liked References \(Q12\):([\s\S]*?)(?:##|- \*\*Disliked|\n\n##)/i);
  if (!q12Match) return [];

  const refs = [];
  for (const line of q12Match[1].split('\n')) {
    const urlMatch = line.match(/https?:\/\/[^\s\)\],]+/i);
    if (!urlMatch) continue;

    const rawUrl = urlMatch[0];
    const u = new URL(rawUrl);
    const domain = u.hostname.replace(/^www\./i, '').toLowerCase();
    const cleanUrl = `${u.protocol}//${u.hostname}${u.pathname}`;

    const nameMatch = line.match(/\d+\.\s*([^:]+):/i);
    const name = nameMatch ? nameMatch[1].trim() : domain;

    refs.push({ name, requestedUrl: rawUrl, cleanUrl, domain });
  }

  return refs;
}

function generateSourcesMd(allResults, outDir) {
  const rows = allResults.map(({ ref, records }) => {
    const successRecords = records.filter(r => r.status === 'success');
    const filesStr = records.length > 0
      ? records.map(r => r.status === 'success'
        ? `${r.slug}/index.html<br>${r.slug}/content.md<br>${r.slug}/screenshot.png`
        : `${r.slug}: Error (${r.error || 'Failed'})`
      ).join('<br><br>')
      : 'Capture error';
    const statusStr = successRecords.length > 0
      ? `**Captured (${successRecords.length} page type(s))**`
      : '**Capture failed**';
    return `| \`${ref.domain}\` | ${ref.name} | \`${ref.requestedUrl}\` | ${filesStr} | 1440 × 900 px | ${statusStr} |`;
  }).join('\n');

  const sourcesContent = `# Design Reference Sources & Capture Audit

> **Usage Notice:** All third-party HTML, text, and screenshots saved in this directory are external reference material collected solely for internal design analysis and benchmarking. Their text, markup, code, and images must never be reused, copied, or incorporated into the client's website.

**Recorded Date:** ${new Date().toISOString().split('T')[0]}  
**Project:** Client Reference Inventory  
**Scope:** Design References (\`${outDir}/<domain>/<slug>/\`)  

---

## 1. Reference Capture Inventory

| Domain | Site Name | Source URL | Captured Files | Viewport | Status & Notes |
|---|---|---|---|---|---|
${rows}

---

## 2. Capture Environment & Compliance
- **Engine:** Playwright / Headless Chromium
- **Artifacts:** Verbatim post-hydration DOM (\`index.html\`), stripped markdown (\`content.md\`), full screenshot (\`screenshot.png\`)
- **Compliance:** Internal visual & spatial analysis only. Zero copying of text, classes, or code.
`;

  const sourcesPath = path.join(outDir, 'sources.md');
  fs.writeFileSync(sourcesPath, sourcesContent, 'utf-8');
  return sourcesPath;
}

function checkAndAdviseGitignore(outDir, autoAppend = false) {
  try {
    const resolvedOut = path.resolve(outDir);
    const targetDirName = path.basename(resolvedOut);
    const candidatePaths = [
      path.join(process.cwd(), '.gitignore'),
      path.join(path.dirname(resolvedOut), '.gitignore')
    ];
    const gitignorePath = candidatePaths.find(p => fs.existsSync(p));
    const relGitignore = gitignorePath ? path.relative(process.cwd(), gitignorePath) || '.gitignore' : '.gitignore';

    if (!gitignorePath) {
      console.log(`  • [Git Hygiene] Advice: Create a .gitignore and add '${targetDirName}/' to keep large scraped assets out of git.\n`);
      return;
    }

    const content = fs.readFileSync(gitignorePath, 'utf-8');
    const isIgnored = content.split(/\r?\n/).some(l => {
      const t = l.trim();
      return t === targetDirName || t === `${targetDirName}/` || t === `/${targetDirName}/` || t === `/${targetDirName}`;
    });

    if (isIgnored) {
      console.log(`  ✓ [Git Hygiene] Confirmed: '${targetDirName}/' is ignored in ${relGitignore}\n`);
    } else if (autoAppend) {
      const appendText = (content.endsWith('\n') ? '' : '\n') + `\n# Legacy site offline mirror & harvested assets\n${targetDirName}/\n`;
      fs.appendFileSync(gitignorePath, appendText, 'utf-8');
      console.log(`  ✓ [Git Hygiene] Automatically added '${targetDirName}/' to ${relGitignore}\n`);
    } else {
      console.log(`  • [Git Hygiene] Advice: Add '${targetDirName}/' to ${relGitignore} to prevent committing large legacy assets.\n`);
    }
  } catch {}
}

module.exports = {
  generateSitemapXml,
  generateManifest,
  parseReferencesFromBrief,
  generateSourcesMd,
  checkAndAdviseGitignore
};
