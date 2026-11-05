const fs = require('node:fs');
const path = require('node:path');
const { validateAndFormatSeedPayload, slugify } = require('./schema');

/**
 * Parses simple YAML frontmatter and body from markdown text
 * Supports strings, numbers, booleans, arrays, and 1-level nested objects.
 *
 * @param {string} rawText
 * @returns {{ frontmatter: Record<string, any>, body: string }}
 */
function parseFrontmatter(rawText) {
  const match = rawText.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: (rawText || '').trim() };
  }

  const yamlBlock = match[1];
  const body = match[2].trim();
  const frontmatter = {};

  const lines = yamlBlock.split(/\r?\n/);
  let currentKey = null;
  let isCurrentObject = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Array item indented under currentKey: e.g. "  - tag1"
    const arrayItemMatch = line.match(/^\s+-\s+(.*)$/);
    if (arrayItemMatch) {
      let val = arrayItemMatch[1].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (currentKey && Array.isArray(frontmatter[currentKey])) {
        frontmatter[currentKey].push(val);
      }
      continue;
    }

    // Nested object property: e.g. "  name: Author Name"
    const objPropMatch = line.match(/^\s+([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (objPropMatch && currentKey && isCurrentObject) {
      const propKey = objPropMatch[1];
      let propVal = objPropMatch[2].trim();
      if ((propVal.startsWith('"') && propVal.endsWith('"')) || (propVal.startsWith("'") && propVal.endsWith("'"))) {
        propVal = propVal.slice(1, -1);
      }
      frontmatter[currentKey][propKey] = propVal;
      continue;
    }

    // Top-level key: e.g. "title: My Headline"
    const keyMatch = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (keyMatch) {
      currentKey = keyMatch[1];
      let rawVal = keyMatch[2].trim();

      // Inline array: e.g. ["tag1", "tag2"]
      if (rawVal.startsWith('[') && rawVal.endsWith(']')) {
        const inner = rawVal.slice(1, -1).trim();
        frontmatter[currentKey] = inner
          ? inner.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''))
          : [];
        isCurrentObject = false;
      } else if (rawVal === '') {
        // Lookahead to check if next line is an array item or nested object
        const nextLine = lines[i + 1] || '';
        if (nextLine.match(/^\s+-\s+/)) {
          frontmatter[currentKey] = [];
          isCurrentObject = false;
        } else if (nextLine.match(/^\s+[A-Za-z0-9_-]+\s*:/)) {
          frontmatter[currentKey] = {};
          isCurrentObject = true;
        } else {
          frontmatter[currentKey] = '';
          isCurrentObject = false;
        }
      } else {
        if ((rawVal.startsWith('"') && rawVal.endsWith('"')) || (rawVal.startsWith("'") && rawVal.endsWith("'"))) {
          rawVal = rawVal.slice(1, -1);
        } else if (rawVal === 'true') {
          rawVal = true;
        } else if (rawVal === 'false') {
          rawVal = false;
        } else if (/^\d+$/.test(rawVal)) {
          rawVal = parseInt(rawVal, 10);
        }
        frontmatter[currentKey] = rawVal;
        isCurrentObject = false;
      }
    }
  }

  return { frontmatter, body };
}

/**
 * Renders inline markdown formatting to HTML
 */
function inlineMarkdown(text) {
  if (!text) return '';
  return text
    // Images: ![alt](url)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />')
    // Links: [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Bold: **text** or __text__
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    // Italic: *text* or _text_
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    // Inline code: `code`
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Strikethrough: ~~text~~
    .replace(/~~([^~]+)~~/g, '<del>$1</del>');
}

/**
 * Converts rich markdown text into clean semantic HTML without external dependencies
 *
 * @param {string} md
 * @returns {string}
 */
function markdownToHtml(md) {
  if (!md) return '';

  // 1. Extract and preserve code blocks
  const codeBlocks = [];
  let text = md.replace(/```([a-zA-Z0-9_-]*)\r?\n([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const cls = lang ? ` class="language-${lang}"` : '';
    codeBlocks.push(`<pre><code${cls}>${escaped}</code></pre>`);
    return `\n\n<!--CODE_BLOCK_${idx}-->\n\n`;
  });

  // 2. Extract and preserve tables
  const tables = [];
  text = text.replace(/((?:^|\n)\|[^\n]+\|\r?\n\|[-:\s|]+\|\r?\n(?:\|[^\n]+\|\r?\n?)+)/g, (match) => {
    const idx = tables.length;
    const lines = match.trim().split(/\r?\n/).map(l => l.trim());
    if (lines.length < 3) return match;

    const headers = lines[0].slice(1, -1).split('|').map(c => c.trim());
    const rows = lines.slice(2).map(l => l.slice(1, -1).split('|').map(c => c.trim()));

    let tableHtml = '<table>\n<thead>\n<tr>';
    headers.forEach(h => { tableHtml += `<th>${inlineMarkdown(h)}</th>`; });
    tableHtml += '</tr>\n</thead>\n<tbody>\n';
    rows.forEach(r => {
      tableHtml += '<tr>';
      r.forEach(c => { tableHtml += `<td>${inlineMarkdown(c)}</td>`; });
      tableHtml += '</tr>\n';
    });
    tableHtml += '</tbody>\n</table>';
    tables.push(tableHtml);
    return `\n\n<!--TABLE_BLOCK_${idx}-->\n\n`;
  });

  // 3. Line-by-line block processing
  const lines = text.split(/\r?\n/);
  const outputBlocks = [];
  let paragraphLines = [];
  let currentList = null; // 'ul' | 'ol' | null
  let quoteLines = [];

  function flushParagraph() {
    if (paragraphLines.length > 0) {
      const pText = paragraphLines.join(' ').trim();
      if (pText) {
        outputBlocks.push(`<p>${inlineMarkdown(pText)}</p>`);
      }
      paragraphLines = [];
    }
  }

  function flushList() {
    if (currentList) {
      outputBlocks.push(`</${currentList}>`);
      currentList = null;
    }
  }

  function flushQuote() {
    if (quoteLines.length > 0) {
      const qText = quoteLines.join(' ').trim();
      if (qText) {
        outputBlocks.push(`<blockquote><p>${inlineMarkdown(qText)}</p></blockquote>`);
      }
      quoteLines = [];
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Blank line
    if (!trimmed) {
      flushParagraph();
      flushList();
      flushQuote();
      continue;
    }

    // Code block placeholder
    if (trimmed.startsWith('<!--CODE_BLOCK_')) {
      flushParagraph();
      flushList();
      flushQuote();
      outputBlocks.push(trimmed);
      continue;
    }

    // Table block placeholder
    if (trimmed.startsWith('<!--TABLE_BLOCK_')) {
      flushParagraph();
      flushList();
      flushQuote();
      outputBlocks.push(trimmed);
      continue;
    }

    // Heading: # H1, ## H2, etc.
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      flushQuote();
      const level = headingMatch[1].length;
      const hText = headingMatch[2].trim();
      outputBlocks.push(`<h${level}>${inlineMarkdown(hText)}</h${level}>`);
      continue;
    }

    // Horizontal Rule
    if (/^(?:---|\*\*\*|___)$/.test(trimmed)) {
      flushParagraph();
      flushList();
      flushQuote();
      outputBlocks.push('<hr />');
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('>')) {
      flushParagraph();
      flushList();
      quoteLines.push(trimmed.replace(/^>\s?/, ''));
      continue;
    } else {
      flushQuote();
    }

    // Unordered List
    const ulMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (ulMatch) {
      flushParagraph();
      if (currentList && currentList !== 'ul') flushList();
      if (!currentList) {
        outputBlocks.push('<ul>');
        currentList = 'ul';
      }
      outputBlocks.push(`<li>${inlineMarkdown(ulMatch[1].trim())}</li>`);
      continue;
    }

    // Ordered List
    const olMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      flushParagraph();
      if (currentList && currentList !== 'ol') flushList();
      if (!currentList) {
        outputBlocks.push('<ol>');
        currentList = 'ol';
      }
      outputBlocks.push(`<li>${inlineMarkdown(olMatch[1].trim())}</li>`);
      continue;
    }

    // Regular prose paragraph line
    flushList();
    paragraphLines.push(trimmed);
  }

  flushParagraph();
  flushList();
  flushQuote();

  let html = outputBlocks.join('\n\n');

  // Restore code blocks
  html = html.replace(/<!--CODE_BLOCK_(\d+)-->/g, (_, idx) => codeBlocks[parseInt(idx, 10)]);

  // Restore tables
  html = html.replace(/<!--TABLE_BLOCK_(\d+)-->/g, (_, idx) => tables[parseInt(idx, 10)]);

  return html;
}

/**
 * Extracts structured FAQ items from markdown if an FAQ section is present
 */
function extractFaqsFromMarkdown(body) {
  const faqs = [];
  const faqSectionMatch = body.match(/##\s+(?:Frequently Asked Questions|FAQ|FAQs)([\s\S]*?)(?=\n##\s+|$)/i);
  if (!faqSectionMatch) return faqs;

  const sectionContent = faqSectionMatch[1];
  const qMatches = sectionContent.split(/\r?\n###\s+/);

  for (let i = 1; i < qMatches.length; i++) {
    const chunk = qMatches[i].trim();
    const firstLineEnd = chunk.indexOf('\n');
    if (firstLineEnd === -1) {
      faqs.push({ question: chunk.trim(), answer: '' });
    } else {
      const q = chunk.slice(0, firstLineEnd).trim();
      const a = chunk.slice(firstLineEnd).trim();
      if (q && a) {
        faqs.push({
          question: q,
          answer: a.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim()
        });
      }
    }
  }
  return faqs;
}

/**
 * Converts a single markdown file into a standardized NWW CMS seed payload
 *
 * @param {string} filePath - Path to markdown file
 * @param {object} [options] - Overrides (status, model, etc.)
 * @returns {object} Formatted and validated seed payload
 */
function convertMarkdownFileToSeedPayload(filePath, options = {}) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Markdown file not found: ${filePath}`);
  }

  const rawText = fs.readFileSync(filePath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(rawText);

  // Derive directory context (e.g. client-context/blog/post-slug/content.md -> post-slug)
  const dirName = path.basename(path.dirname(filePath));
  const fallbackTitle = dirName.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const title = frontmatter.title || frontmatter.name || fallbackTitle;
  const slug = (frontmatter.slug || '').trim() || (dirName !== 'client-context' ? dirName : slugify(title));

  // Extract structured FAQs
  const extractedFaqs = extractFaqsFromMarkdown(body);
  const combinedFaqs = Array.isArray(frontmatter.faqs) && frontmatter.faqs.length > 0
    ? frontmatter.faqs
    : extractedFaqs;

  // Convert markdown to rich HTML
  const htmlContent = markdownToHtml(body);

  // Author extraction
  let authorObj = undefined;
  if (frontmatter.author && typeof frontmatter.author === 'object') {
    authorObj = frontmatter.author;
  } else if (frontmatter.author) {
    authorObj = { name: String(frontmatter.author) };
  } else if (frontmatter.author_name) {
    authorObj = { name: frontmatter.author_name, image: frontmatter.author_image || null };
  }

  // Cover image normalization
  const coverImage = frontmatter.coverImage || frontmatter.cover_image || frontmatter.image || null;

  const rawPayload = {
    title,
    slug,
    content: htmlContent,
    status: options.status || frontmatter.status || 'published',
    category: frontmatter.category || frontmatter.categorySlug || undefined,
    tags: frontmatter.tags || [],
    metaTitle: frontmatter.metaTitle || title,
    metaDescription: frontmatter.metaDescription || frontmatter.description || frontmatter.excerpt || undefined,
    author: authorObj,
    author_name: frontmatter.author_name || (authorObj && authorObj.name) || undefined,
    author_image: frontmatter.author_image || (authorObj && authorObj.image) || undefined,
    cover_image: coverImage,
    image: coverImage,
    postedAt: frontmatter.publishedAt || frontmatter.postedAt || new Date().toISOString(),
    faqs: combinedFaqs,
    metadata: Object.assign({}, frontmatter.metadata || {}, {
      category: frontmatter.category || frontmatter.categorySlug || undefined,
      tags: frontmatter.tags || []
    })
  };

  return validateAndFormatSeedPayload(rawPayload, options);
}

/**
 * Scans a source directory for all content markdown files and compiles them into seed JSON files
 *
 * @param {string} sourceDir - Directory containing markdown files (e.g. client-context/blog)
 * @param {string} outputDir - Directory to write JSON seeds (e.g. project-docs/client-review/gate-5-cms-content/blog)
 * @param {object} [options] - Conversion options
 * @returns {{ count: number, files: string[], payloads: object[] }}
 */
function buildSeedsFromMarkdownDirectory(sourceDir, outputDir, options = {}) {
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Source directory does not exist: ${sourceDir}`);
  }

  // Collect all content markdown files
  const mdFiles = [];
  const ignoredFileNames = new Set([
    'architecture.md',
    'spec.md',
    'specs.md',
    'plan.md',
    'open-questions.md',
    'asset-manifest.md',
    'answers.md',
    'checklist-state.md',
    'router-state.md',
    'readme.md'
  ]);

  function scan(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const hasContentMd = entries.some(e => e.isFile() && e.name.toLowerCase() === 'content.md');

    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scan(full);
      } else if (entry.isFile()) {
        const lower = entry.name.toLowerCase();
        if (hasContentMd) {
          if (lower === 'content.md') {
            mdFiles.push(full);
          }
        } else if (lower.endsWith('.md') && !ignoredFileNames.has(lower)) {
          mdFiles.push(full);
        }
      }
    }
  }

  scan(sourceDir);

  if (mdFiles.length === 0) {
    return { count: 0, files: [], payloads: [] };
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const generatedFiles = [];
  const payloads = [];

  for (const file of mdFiles) {
    const payload = convertMarkdownFileToSeedPayload(file, options);
    const outFile = path.join(outputDir, `${payload.slug}.json`);
    fs.writeFileSync(outFile, JSON.stringify(payload, null, 2), 'utf-8');
    generatedFiles.push(outFile);
    payloads.push(payload);
  }

  // Generate manifest in output directory
  const manifest = {
    generatedAt: new Date().toISOString(),
    count: payloads.length,
    items: payloads.map(p => ({
      title: p.title,
      slug: p.slug,
      status: p.status,
      category: p.metadata?.category || null,
      file: `${p.slug}.json`
    }))
  };

  fs.writeFileSync(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');

  return {
    count: payloads.length,
    files: generatedFiles,
    payloads
  };
}

module.exports = {
  parseFrontmatter,
  markdownToHtml,
  inlineMarkdown,
  extractFaqsFromMarkdown,
  convertMarkdownFileToSeedPayload,
  buildSeedsFromMarkdownDirectory
};
