'use strict';

const fs = require('node:fs');
const path = require('node:path');

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
  checkAndAdviseGitignore
};
