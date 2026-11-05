const fs = require('node:fs');
const path = require('node:path');

/**
 * Loads environment variables from .env files if not already present in process.env
 */
function resolveEnvConfig(projRoot, customEnvPath) {
  let serverUrl = process.env.SERVER_URL;
  let cmsToken = process.env.CMS_TOKEN;

  if (serverUrl && cmsToken) {
    return {
      serverUrl: serverUrl.replace(/\/$/, ''),
      cmsToken,
      siteKey: cmsToken
    };
  }

  const candidatePaths = [
    customEnvPath ? path.resolve(customEnvPath) : null,
    path.join(projRoot, 'site', '.env.local'),
    path.join(projRoot, 'site', '.env'),
    path.join(projRoot, '.env.local'),
    path.join(projRoot, '.env')
  ].filter(Boolean);

  for (const envPath of candidatePaths) {
    if (serverUrl && cmsToken) break;
    if (!fs.existsSync(envPath)) continue;

    try {
      const content = fs.readFileSync(envPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const match = trimmed.match(/^([A-Za-z0-9_]+)\s*=\s*(.*)$/);
        if (match) {
          const key = match[1];
          let val = match[2].trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (key === 'SERVER_URL' && !serverUrl) serverUrl = val;
          if (key === 'CMS_TOKEN' && !cmsToken) cmsToken = val;
        }
      }
    } catch (_) {
      // Non-fatal if optional env file cannot be read
    }
  }

  return {
    serverUrl: (serverUrl || 'https://api.nextwebworks.in').replace(/\/$/, ''),
    cmsToken: cmsToken || '',
    siteKey: cmsToken || ''
  };
}

module.exports = { resolveEnvConfig };

