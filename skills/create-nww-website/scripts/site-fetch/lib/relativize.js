'use strict';

const path = require('node:path');
const { URL } = require('node:url');

function createOfflineShim(nakedHost, prefix) {
  return `
  <script>
    /* Offline Mirror Guard: Suppress file:// CORS and framework hydration crashes in Chrome */
    window.onerror = function() { return true; };
    window.onunhandledrejection = function(e) { if (e && e.preventDefault) e.preventDefault(); };

    (function() {
      var legacyHost = "${nakedHost}";
      var localPrefix = "${prefix}";

      try {
        var origAssign = window.location.assign ? window.location.assign.bind(window.location) : null;
        var origReplace = window.location.replace ? window.location.replace.bind(window.location) : null;
        if (origAssign) {
          window.location.assign = function(target) {
            if (typeof target === 'string' && (target.indexOf(legacyHost) !== -1 || target.startsWith('/'))) {
              console.warn('[Offline Guard] Blocked programmatic redirect to live site:', target);
              return;
            }
            origAssign(target);
          };
        }
        if (origReplace) {
          window.location.replace = function(target) {
            if (typeof target === 'string' && (target.indexOf(legacyHost) !== -1 || target.startsWith('/'))) {
              console.warn('[Offline Guard] Blocked programmatic replace to live site:', target);
              return;
            }
            origReplace(target);
          };
        }
      } catch(e) {}

      document.addEventListener('click', function(e) {
        var anchor = e.target && e.target.closest ? e.target.closest('a') : null;
        if (!anchor) return;
        var href = anchor.getAttribute('href');
        if (!href || /^(#|mailto:|tel:|javascript:)/.test(href)) return;

        var isLegacy = false;
        var pathname = '', search = '', hash = '';

        if (legacyHost && href.indexOf(legacyHost) !== -1) {
          isLegacy = true;
          try {
            var u = new URL(href.startsWith('//') ? ('https:' + href) : href);
            pathname = u.pathname;
            search = u.search || '';
            hash = u.hash || '';
          } catch(err) { isLegacy = false; }
        } else if (href.startsWith('/') && !href.startsWith('//')) {
          isLegacy = true;
          try {
            var u = new URL(href, window.location.href);
            pathname = u.pathname;
            search = u.search || '';
            hash = u.hash || '';
          } catch(err) { isLegacy = false; }
        }

        if (isLegacy) {
          e.preventDefault();
          e.stopPropagation();
          var clean = pathname.replace(/^\\/+|\\/+$/g, '').replace(/\\.(html?|php|asp|aspx)$/i, '');
          var dest = clean ? (localPrefix + clean + '/index.html' + search + hash) : (localPrefix + 'index.html' + search + hash);
          console.log('[Offline Guard] Intercepted link to live website. Navigating locally to:', dest);
          window.location.href = dest;
        }
      }, true);
    })();
  </script>
  <style id="antigravity-offline-reset">
    /* Force page visibility and dismiss blocking preloaders in local Chrome offline browsing */
    html, body {
      visibility: visible !important;
      opacity: 1 !important;
      display: block !important;
    }
    #preloader, .preloader, [class*="preloader"], [id*="preloader"],
    [class*="loading-screen"], [id*="loading-screen"], [class*="loader-wrapper"],
    .page-loader, #page-loader {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
  </style>`;
}

function resolveUrlToLocal(rawVal, { assetMap, baseOrigin, nakedHost, prefix }) {
  if (!rawVal || typeof rawVal !== 'string') return rawVal;
  const trimmed = rawVal.trim();

  if (/^(#|mailto:|tel:|javascript:|data:)/.test(trimmed)) {
    return trimmed;
  }

  if (assetMap.has(trimmed)) {
    return prefix + assetMap.get(trimmed).replace(/^\/+/, '');
  }

  let urlObj = null;
  let isSameSite = false;

  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    try {
      urlObj = new URL(trimmed, baseOrigin);
      isSameSite = true;
    } catch {
      return trimmed;
    }
  } else if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('//')) {
    try {
      const full = trimmed.startsWith('//') ? ('https:' + trimmed) : trimmed;
      urlObj = new URL(full);
      const host = urlObj.hostname.toLowerCase().replace(/^www\./, '');
      if (nakedHost && (host === nakedHost || host.endsWith('.' + nakedHost))) {
        isSameSite = true;
      }
    } catch {
      return trimmed;
    }
  } else if (!trimmed.includes(':') && !trimmed.startsWith('//')) {
    const cleanRelative = trimmed.split('?')[0].split('#')[0].replace(/\/+$/, '');
    const search = trimmed.includes('?') ? '?' + trimmed.split('?')[1].split('#')[0] : '';
    const hash = trimmed.includes('#') ? '#' + trimmed.split('#')[1] : '';

    if (cleanRelative === '' || cleanRelative === '.' || cleanRelative === './') {
      return `${prefix}index.html${search}${hash}`;
    }

    const lastSegment = cleanRelative.split('/').pop();
    if (!lastSegment.includes('.')) {
      return `${cleanRelative}/index.html${search}${hash}`;
    }
    return trimmed;
  }

  if (!isSameSite || !urlObj) {
    return trimmed;
  }

  if (assetMap.has(urlObj.href)) {
    return prefix + assetMap.get(urlObj.href).replace(/^\/+/, '');
  }
  if (assetMap.has(urlObj.pathname)) {
    return prefix + assetMap.get(urlObj.pathname).replace(/^\/+/, '');
  }

  const pathname = urlObj.pathname;
  const search = urlObj.search || '';
  const hash = urlObj.hash || '';
  const cleanPath = pathname.replace(/^\/+|\/+$/g, '').replace(/\.(html?|php|asp|aspx)$/i, '');

  if (!cleanPath) {
    return `${prefix}index.html${search}${hash}`;
  }

  if (/\.[a-zA-Z0-9]{2,5}$/.test(pathname) && !/\.(html?|php|asp|aspx)$/i.test(pathname)) {
    return `${prefix}${cleanPath}${search}${hash}`;
  }

  return `${prefix}${cleanPath}/index.html${search}${hash}`;
}

function relativizeHtmlForOfflineMirror(html, pageRelHtmlPath, assetMap, baseOrigin) {
  let updated = html
    .replace(/<base\s+[^>]*>/gi, '')
    .replace(/<meta\s+[^>]*http-equiv=["']?Content-Security-Policy["']?[^>]*>/gi, '')
    .replace(/<meta\s+[^>]*http-equiv=["']?refresh["']?[^>]*>/gi, '');

  const pageDepth = pageRelHtmlPath === 'index.html' ? 0 : pageRelHtmlPath.split('/').length - 1;
  const prefix = pageDepth === 0 ? './' : '../'.repeat(pageDepth);

  let nakedHost = '';
  try {
    nakedHost = new URL(baseOrigin).hostname.toLowerCase().replace(/^www\./, '');
  } catch {}

  const ctx = { assetMap, baseOrigin, nakedHost, prefix };

  // Replace harvested asset URLs across document
  for (const [rawUrl, localRelPath] of assetMap.entries()) {
    const relativeTarget = prefix + localRelPath.replace(/^\/+/, '');
    const escapedUrl = rawUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    updated = updated.replace(new RegExp(escapedUrl, 'g'), relativeTarget);

    try {
      const u = new URL(rawUrl);
      if (u.origin === baseOrigin && u.pathname && u.pathname !== '/') {
        const escapedRootRel = u.pathname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        updated = updated.replace(new RegExp(`(["'])${escapedRootRel}(["'\\?#])`, 'g'), `$1${relativeTarget}$2`);
      }
    } catch {}
  }

  // Rewrite link, action, and data navigation attributes
  updated = updated.replace(/\b(href|action|data-href|data-url|data-link)=["']([^"']*)["']/gi, (match, attrName, attrVal) => {
    return `${attrName}="${resolveUrlToLocal(attrVal, ctx)}"`;
  });

  // Rewrite srcset attributes
  updated = updated.replace(/\bsrcset=["']([^"']+)["']/gi, (match, srcsetContent) => {
    const parts = srcsetContent.split(',').map(part => {
      const trimmedPart = part.trim();
      const spaceIdx = trimmedPart.indexOf(' ');
      if (spaceIdx === -1) {
        return resolveUrlToLocal(trimmedPart, ctx);
      }
      const urlPart = trimmedPart.slice(0, spaceIdx);
      const descriptor = trimmedPart.slice(spaceIdx);
      return resolveUrlToLocal(urlPart, ctx) + descriptor;
    });
    return `srcset="${parts.join(', ')}"`;
  });

  // Neutralize type="module" on local scripts
  updated = updated.replace(/<script\s+([^>]*?)type=["']module["']([^>]*?)>/gi, '<script $1data-offline-module=""$2>');

  // Inject offline hardening shim
  const offlineShim = createOfflineShim(nakedHost, prefix);
  if (updated.includes('</head>')) {
    updated = updated.replace('</head>', `${offlineShim}\n</head>`);
  } else if (updated.includes('<body')) {
    updated = updated.replace('<body', `${offlineShim}\n<body`);
  } else {
    updated = `${offlineShim}\n${updated}`;
  }

  return updated;
}

module.exports = {
  resolveUrlToLocal,
  relativizeHtmlForOfflineMirror
};
