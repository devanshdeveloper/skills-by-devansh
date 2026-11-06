/**
 * Semantic Markdown/MDX to HTML Rich-Text Renderer
 *
 * Converts markdown body into semantic HTML expected by the NWW CMS
 * backend and extracts structured FAQ items.
 */

/**
 * Escapes HTML characters for safe text insertion.
 *
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Extracts structured FAQ items from markdown content.
 *
 * @param {string} markdown
 * @returns {Array<{ question: string, answer: string }>}
 */
export function extractFaqs(markdown) {
  const faqs = [];
  const faqHeaderMatch = markdown.match(/##\s+(?:Frequently Asked Questions|FAQ|FAQs)[\s\S]*$/i);
  if (!faqHeaderMatch) return faqs;

  const faqSection = faqHeaderMatch[0];
  const items = faqSection.split(/\n###\s+/);

  for (let i = 1; i < items.length; i++) {
    const rawItem = items[i];
    const firstNewline = rawItem.indexOf('\n');
    if (firstNewline === -1) continue;

    const question = rawItem.slice(0, firstNewline).trim();
    const answer = rawItem.slice(firstNewline + 1).trim();

    if (question && answer) {
      faqs.push({
        question: question.replace(/^[#\s]+/, '').trim(),
        answer: answer.replace(/\n+/g, ' ').trim(),
      });
    }
  }

  return faqs;
}

/**
 * Renders inline markdown syntax (bold, italic, links, code) to HTML.
 *
 * @param {string} text
 * @returns {string}
 */
export function renderInline(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
}

/**
 * Converts markdown text into semantic HTML rich-text string.
 *
 * @param {string} markdown
 * @returns {string}
 */
export function markdownToHtml(markdown) {
  if (!markdown) return '';

  const lines = markdown.split(/\r?\n/);
  const htmlParts = [];
  let inList = false;
  let listType = 'ul';
  let inCodeBlock = false;
  let codeBuffer = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Code blocks
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        htmlParts.push(`<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        if (inList) {
          htmlParts.push(`</${listType}>`);
          inList = false;
        }
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Blank lines
    if (!trimmed) {
      if (inList) {
        htmlParts.push(`</${listType}>`);
        inList = false;
      }
      continue;
    }

    // Headings
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      if (inList) {
        htmlParts.push(`</${listType}>`);
        inList = false;
      }
      const level = headingMatch[1].length;
      const text = renderInline(headingMatch[2]);
      htmlParts.push(`<h${level}>${text}</h${level}>`);
      continue;
    }

    // Blockquotes
    if (trimmed.startsWith('>')) {
      if (inList) {
        htmlParts.push(`</${listType}>`);
        inList = false;
      }
      const bqText = renderInline(trimmed.replace(/^>\s*/, ''));
      htmlParts.push(`<blockquote>${bqText}</blockquote>`);
      continue;
    }

    // Unordered lists
    const ulMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        if (inList) htmlParts.push(`</${listType}>`);
        htmlParts.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      htmlParts.push(`<li>${renderInline(ulMatch[1])}</li>`);
      continue;
    }

    // Ordered lists
    const olMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      if (!inList || listType !== 'ol') {
        if (inList) htmlParts.push(`</${listType}>`);
        htmlParts.push('<ol>');
        inList = true;
        listType = 'ol';
      }
      htmlParts.push(`<li>${renderInline(olMatch[1])}</li>`);
      continue;
    }

    // Paragraph
    if (inList) {
      htmlParts.push(`</${listType}>`);
      inList = false;
    }

    htmlParts.push(`<p>${renderInline(trimmed)}</p>`);
  }

  if (inList) {
    htmlParts.push(`</${listType}>`);
  }
  if (inCodeBlock) {
    htmlParts.push(`<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
  }

  return htmlParts.join('\n');
}
