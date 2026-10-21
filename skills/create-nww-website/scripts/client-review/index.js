#!/usr/bin/env node

/**
 * Client Review Generator & Listing Hub Updater
 *
 * Scans `project-docs/client-review/` and generates/updates:
 * 1. `gate-2-design-theory/index.html` (Gate 2 concept comparison & slug listing)
 * 2. `index.html` (Root review portal)
 *
 * Usage:
 *   node skills/create-nww-website/scripts/client-review/index.js [projectRoot]
 */

const fs = require('node:fs');
const path = require('node:path');

const projectRoot = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const preserveHubs = process.argv.includes('--preserve-hubs');
const reviewBase = path.join(projectRoot, 'project-docs', 'client-review');
const gate2Dir = path.join(reviewBase, 'gate-2-design-theory');

function getDirectories(srcPath) {
  if (!fs.existsSync(srcPath)) return [];
  return fs.readdirSync(srcPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.') && !dirent.name.startsWith('_'))
    .map(dirent => dirent.name);
}

function extractMetadata(htmlPath, conceptName, slug) {
  if (!fs.existsSync(htmlPath)) {
    return {
      title: conceptName,
      lead: 'Visual direction and design review page.',
      badge: conceptName
    };
  }
  const content = fs.readFileSync(htmlPath, 'utf-8');
  const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
  const h1Match = content.match(/<h1>([^<]+)<\/h1>/i);
  const leadMatch = content.match(/<p class="lead">([^<]+)<\/p>/i);
  const badgeMatch = content.match(/<span class="badge">([^<]+)<\/span>/i);

  return {
    title: titleMatch && /^(Concept|Option)\s+\d/i.test(titleMatch[1]) ? titleMatch[1].trim() : (h1Match ? h1Match[1].trim() : (titleMatch ? titleMatch[1].trim() : conceptName)),
    lead: leadMatch ? leadMatch[1].trim() : 'Visual direction and design review page.',
    badge: badgeMatch ? badgeMatch[1].trim() : conceptName
  };
}

function generateGate2Hub(concepts) {
  const conceptCards = concepts.map(c => {
    return `
      <div class="concept-card">
        <div class="card-header">
          <span class="badge">${c.meta.badge}</span>
          <h2>${c.meta.title}</h2>
          <p class="lead">${c.meta.lead}</p>
        </div>
        <div class="card-footer">
          <div class="slug-actions">
            <a href="${c.name}/index.html" class="slug-btn">Experience Full Page Design →</a>
          </div>
        </div>
      </div>
    `;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gate 2: Design Theory & Concept Review Hub</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      --bg: #F8F9FA;
      --surface: #FFFFFF;
      --surface-subtle: #F1F3F5;
      --border: #E2E8F0;
      --text: #0F172A;
      --text-muted: #475569;
      --accent: #D97706;
      --accent-soft: #FEF3C7;
      --radius: 12px;
      --shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
    }
    body { font-family: var(--font-sans); background: var(--bg); color: var(--text); line-height: 1.6; padding: 40px 20px 80px; }
    .wrapper { max-width: 1040px; margin: 0 auto; }
    .top-nav { margin-bottom: 24px; }
    .top-nav a { display: inline-flex; align-items: center; gap: 6px; color: var(--accent); font-weight: 600; font-size: 14px; text-decoration: none; }
    .top-nav a:hover { text-decoration: underline; }
    .header { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 36px 32px; box-shadow: var(--shadow); margin-bottom: 32px; }
    .badge { display: inline-block; background: var(--accent-soft); color: var(--accent); font-size: 13px; font-weight: 700; padding: 4px 12px; border-radius: 999px; margin-bottom: 12px; }
    h1 { font-size: 32px; font-weight: 800; line-height: 1.25; margin-bottom: 12px; letter-spacing: -0.02em; }
    .lead { font-size: 17px; color: var(--text-muted); line-height: 1.6; }
    .status-bar { display: flex; align-items: center; gap: 10px; margin-top: 20px; padding: 12px 16px; background: var(--surface-subtle); border-radius: 8px; font-size: 14px; font-weight: 600; color: #92400E; }
    .status-dot { width: 10px; height: 10px; border-radius: 50%; background: #F59E0B; }

    /* Concept Listing Grid */
    .concepts-grid { display: grid; grid-template-columns: 1fr; gap: 24px; margin-top: 32px; }
    .concept-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 28px 32px; box-shadow: var(--shadow); display: flex; flex-direction: column; justify-content: space-between; }
    .concept-card h2 { font-size: 22px; font-weight: 700; margin-bottom: 8px; color: var(--text); }
    .concept-card p.lead { font-size: 15px; margin-bottom: 16px; }
    .card-footer { border-top: 1px solid var(--border); padding-top: 16px; margin-top: 12px; }
    .slug-actions { display: flex; flex-wrap: wrap; gap: 12px; }
    .slug-btn { display: inline-flex; align-items: center; gap: 6px; background: var(--accent); color: #FFFFFF; font-size: 13px; font-weight: 700; padding: 8px 16px; border-radius: 6px; text-decoration: none; transition: opacity 0.15s ease; }
    .slug-btn:hover { opacity: 0.9; }

    /* Decision Protocol Banner */
    .decision-banner { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 28px 32px; margin-top: 40px; }
    .decision-banner h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
    .decision-banner p { font-size: 14px; color: var(--text-muted); line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="top-nav">
      <a href="../index.html">← Back to Project Review Portal</a>
    </div>

    <div class="header">
      <span class="badge">Pipeline Gate 2</span>
      <h1>Gate 2: Design Theory & Concept Review</h1>
      <p class="lead">Compare the distinct visual identities developed for this project. Each concept features dedicated day and night browser mockups, friendly token swatches, typography samples, and reference influences.</p>
      <div class="status-bar">
        <span class="status-dot"></span>
        <span>Gate Status: Awaiting Client Selection before proceeding to Stage 3 (Page List & Sitemap)</span>
      </div>
    </div>

    <div class="concepts-grid">
      ${conceptCards}
    </div>

    <div class="decision-banner">
      <h3>How to Make Your Decision</h3>
      <p>1. Open each concept review page above to evaluate the typography, color system, and live day/night preview.<br>
         2. When you find the direction that best fits your goals, use the "Copy My Decision" button at the bottom of that page.<br>
         3. Paste your confirmation into our chat to approve Gate 2 and begin Stage 3.</p>
    </div>
  </div>
</body>
</html>
`;
}

function generateRootPortal(gate2Exists) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Client Review Portal</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      --bg: #F8F9FA;
      --surface: #FFFFFF;
      --border: #E2E8F0;
      --text: #0F172A;
      --text-muted: #475569;
      --accent: #D97706;
      --accent-soft: #FEF3C7;
      --radius: 12px;
      --shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
    }
    body { font-family: var(--font-sans); background: var(--bg); color: var(--text); line-height: 1.6; padding: 48px 20px 80px; }
    .wrapper { max-width: 860px; margin: 0 auto; }
    .header { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 36px 32px; box-shadow: var(--shadow); margin-bottom: 32px; }
    .badge { display: inline-block; background: var(--accent-soft); color: var(--accent); font-size: 13px; font-weight: 700; padding: 4px 12px; border-radius: 999px; margin-bottom: 12px; }
    h1 { font-size: 32px; font-weight: 800; line-height: 1.25; margin-bottom: 8px; }
    .lead { font-size: 16px; color: var(--text-muted); }
    .gates-list { display: flex; flex-direction: column; gap: 16px; }
    .gate-item { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; box-shadow: var(--shadow); display: flex; align-items: center; justify-content: space-between; }
    .gate-info h3 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
    .gate-info p { font-size: 14px; color: var(--text-muted); }
    .gate-link { background: var(--accent); color: #FFFFFF; font-weight: 700; font-size: 13px; padding: 10px 18px; border-radius: 6px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <span class="badge">Project Review Hub</span>
      <h1>Client Design & Milestone Portal</h1>
      <p class="lead">Welcome to your project's visual review portal. Access stage deliverables, review visual direction concepts, and submit milestone sign-offs.</p>
    </div>

    <div class="gates-list">
      <div class="gate-item">
        <div class="gate-info">
          <h3>Gate 2: Design Theory & Concept Review</h3>
          <p>Explore full visual identity concepts, live day & night previews, and submit your palette selection.</p>
        </div>
        <div>
          ${gate2Exists ? '<a href="gate-2-design-theory/index.html" class="gate-link">Enter Gate 2 Hub →</a>' : '<span style="color:var(--text-muted);font-size:13px;">Pending</span>'}
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

function run() {
  console.log(`[Client Review Generator] Inspecting: ${reviewBase}`);
  if (!fs.existsSync(gate2Dir)) {
    console.log(`Gate 2 directory not found at: ${gate2Dir}. Creating...`);
    fs.mkdirSync(gate2Dir, { recursive: true });
  }

  const conceptNames = getDirectories(gate2Dir);
  console.log(`Found ${conceptNames.length} concept(s): ${conceptNames.join(', ') || 'None'}`);

  const concepts = conceptNames.map(name => {
    const conceptDir = path.join(gate2Dir, name);
    let htmlPath = path.join(conceptDir, 'index.html');
    if (!fs.existsSync(htmlPath)) {
      const slugs = getDirectories(conceptDir);
      if (slugs.length > 0) {
        htmlPath = path.join(conceptDir, slugs[0], 'index.html');
      }
    }
    const meta = extractMetadata(htmlPath, name);

    return {
      name,
      meta
    };
  });

  // Sort concepts numerically by concept or option number (Concept 1, Option 1, etc.)
  concepts.sort((a, b) => {
    function getOrder(c) {
      const text = `${c.meta.badge} ${c.meta.title} ${c.name}`;
      const match = text.match(/(?:concept|option)\s*(\d+)/i);
      return match ? parseInt(match[1], 10) : 999;
    }
    const orderA = getOrder(a);
    const orderB = getOrder(b);
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name);
  });

  // Generate Gate 2 Hub
  const gate2HubHtml = generateGate2Hub(concepts);
  const gate2HubPath = path.join(gate2Dir, 'index.html');
  if (!preserveHubs || !fs.existsSync(gate2HubPath)) {
    fs.writeFileSync(gate2HubPath, gate2HubHtml, 'utf-8');
    console.log(`✓ Generated: ${path.relative(projectRoot, gate2HubPath)} (${gate2HubHtml.length} bytes)`);
  } else console.log('Preserved authored Gate 2 hub.');

  // Generate Root Review Portal
  const rootPortalHtml = generateRootPortal(true);
  const rootPortalPath = path.join(reviewBase, 'index.html');
  if (!preserveHubs || !fs.existsSync(rootPortalPath)) {
    fs.writeFileSync(rootPortalPath, rootPortalHtml, 'utf-8');
    console.log(`✓ Generated: ${path.relative(projectRoot, rootPortalPath)} (${rootPortalHtml.length} bytes)`);
  } else console.log('Preserved authored review portal.');

  console.log('[Client Review Generator] Complete.');
}

run();
