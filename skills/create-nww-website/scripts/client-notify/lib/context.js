const fs = require('node:fs');
const path = require('node:path');

function parseRouterState(projDocs = path.join(process.cwd(), 'project-docs')) {
  const routerPath = path.join(projDocs, 'router-state.md');
  if (!fs.existsSync(routerPath)) return { stage: 2, gate: 'Gate 2', status: 'In Review', projectName: 'Website Project' };
  const content = fs.readFileSync(routerPath, 'utf-8');

  const stageMatch = content.match(/Current Stage:[\s*_]*Stage\s*(\d+)/i);
  const gateMatch = content.match(/Gate Status:[\s*_]*([^(\n]+)/i);
  const projectMatch = content.match(/Project:[\s*_]*([^\n]+)/i);

  // Check for live URL (prioritize GitHub Pages review URL over CMS backend)
  const ghPagesMatch = content.match(/https?:\/\/[a-zA-Z0-9.-]+\.github\.io[^\s)\],`"*<>]*/i);
  const fallbackUrlMatch = content.match(/https?:\/\/[^\s)\],`"*<>]+/i);
  const urlMatch = ghPagesMatch || fallbackUrlMatch;

  return {
    stage: stageMatch ? parseInt(stageMatch[1], 10) : 2,
    gate: gateMatch ? gateMatch[1].trim() : 'Gate 2',
    projectName: projectMatch ? projectMatch[1].replace(/[*_]/g, '').trim() : 'Website Project',
    liveUrl: urlMatch ? urlMatch[0] : null
  };
}

function parseClientDetails(projectRoot = process.cwd()) {
  const batch01Path = path.join(projectRoot, 'client-context', 'answers', 'batch-01-core-identity', 'answers.md');
  const batch07Path = path.join(projectRoot, 'client-context', 'answers', 'batch-07-seo-analytics-governance', 'answers.md');
  let content = '';
  if (fs.existsSync(batch01Path)) content += fs.readFileSync(batch01Path, 'utf-8') + '\n';
  if (fs.existsSync(batch07Path)) content += fs.readFileSync(batch07Path, 'utf-8');

  if (!content) {
    return { name: 'Client', email: '', company: '' };
  }

  const nameMatch = content.match(/Client Name:\s*([^\n]+)/i) ||
                    content.match(/Project Name:\s*([^\n—\-]+)/i);
  const emailMatch = content.match(/(?:Email|Contact Email):\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);

  const rawName = nameMatch ? nameMatch[1].replace(/[*_]/g, '').trim() : 'Client';

  return {
    name: rawName,
    email: emailMatch ? emailMatch[1].trim() : '',
    company: ''
  };
}

function parseConceptFromHtml(htmlPath, dir) {
  let title = dir;
  let desc = '';
  let order = 999;

  if (fs.existsSync(htmlPath)) {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const leadMatch = html.match(/<p class="lead">([^<]+)<\/p>/i);
    const rawTitle = titleMatch ? titleMatch[1].trim() : (h1Match ? h1Match[1].trim() : dir);
    title = rawTitle;
    if (leadMatch) desc = ` (${leadMatch[1].trim().replace(/\.$/, '')})`;
    const numMatch = rawTitle.match(/(?:concept|option)[-\s]*(\d+)/i) || dir.match(/(?:concept|option)[-\s]*(\d+)/i);
    if (numMatch) order = parseInt(numMatch[1], 10);
  }

  return { title, desc, order, dir };
}

function getGate2OptionsSummary(projRoot = process.cwd()) {
  try {
    const gate2Dir = path.join(projRoot, 'project-docs', 'client-review', 'gate-2-design-theory');
    if (fs.existsSync(gate2Dir)) {
      const dirs = fs.readdirSync(gate2Dir, { withFileTypes: true })
        .filter(d => d.isDirectory() && !d.name.startsWith('.') && !d.name.startsWith('_'))
        .map(d => d.name);
      if (dirs.length > 0) {
        const conceptList = dirs.map(dir => parseConceptFromHtml(path.join(gate2Dir, dir, 'index.html'), dir));

        conceptList.sort((a, b) => {
          if (a.order !== b.order) return a.order - b.order;
          return a.dir.localeCompare(b.dir);
        });

        return conceptList.map(c => `  • ${c.title}${c.desc}`).join('\n');
      }
    }
  } catch (_) {}

  return `  • Variation 1: The Modernist Architect (Grounded asymmetric grid and bold editorial headlines)\n` +
         `  • Variation 2: The Technical Minimalist (High-density clean structure and focused conversion cues)\n` +
         `  • Variation 3: The Editorial Storyteller (Warm tactile palette, serif display, and progressive narrative arc)`;
}

module.exports = {
  parseRouterState,
  parseClientDetails,
  parseConceptFromHtml,
  getGate2OptionsSummary
};

