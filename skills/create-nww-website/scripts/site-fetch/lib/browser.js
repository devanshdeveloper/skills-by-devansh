'use strict';

const fs = require('node:fs');
const path = require('node:path');

let chromium = null;

function resolveChromium() {
  if (chromium) return chromium;

  const candidatePaths = [
    'playwright',
    path.join(process.cwd(), 'node_modules', 'playwright'),
    path.join(process.cwd(), 'site', 'node_modules', 'playwright'),
    path.join(__dirname, '..', '..', 'client-review', 'node_modules', 'playwright')
  ];

  for (const c of candidatePaths) {
    try {
      const pw = require(c);
      if (pw && pw.chromium) return (chromium = pw.chromium);
    } catch {}
  }

  const npxCache = path.join(process.env.LOCALAPPDATA || '', 'npm-cache', '_npx');
  if (fs.existsSync(npxCache)) {
    for (const h of fs.readdirSync(npxCache)) {
      try {
        const pw = require(path.join(npxCache, h, 'node_modules', 'playwright'));
        if (pw && pw.chromium) return (chromium = pw.chromium);
      } catch {}
    }
  }

  return null;
}

async function launchBrowser() {
  const cr = resolveChromium();
  if (!cr) {
    console.error('Playwright Chromium is required for full-page rendering and screenshots.');
    console.error('Install via: npx --yes playwright install chromium');
    process.exit(1);
  }
  return await cr.launch({ channel: 'chrome', headless: true });
}

module.exports = {
  resolveChromium,
  launchBrowser
};
