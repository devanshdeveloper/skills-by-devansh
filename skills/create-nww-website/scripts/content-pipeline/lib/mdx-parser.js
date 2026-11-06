/**
 * Native MDX and Frontmatter Parser
 *
 * Extracts frontmatter and parses structural markdown/MDX elements (headings,
 * images, links, assets) without external dependencies.
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * Parses YAML frontmatter into a JavaScript object.
 * Supports strings, numbers, booleans, inline arrays, bullet lists, and 1-level nested objects.
 *
 * @param {string} yamlBlock
 * @returns {Record<string, any>}
 */
export function parseYamlFrontmatter(yamlBlock) {
  const result = {};
  const lines = yamlBlock.split(/\r?\n/);
  let currentKey = null;
  let isCurrentObject = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Bullet array item: "  - value"
    const arrayMatch = line.match(/^\s+-\s+(.*)$/);
    if (arrayMatch && currentKey) {
      let val = arrayMatch[1].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (val === 'true') val = true;
      else if (val === 'false') val = false;
      else if (/^\d+$/.test(val)) val = parseInt(val, 10);

      if (!Array.isArray(result[currentKey])) {
        result[currentKey] = [];
      }
      result[currentKey].push(val);
      continue;
    }

    // 1-level nested object property: "  name: value"
    const nestedMatch = line.match(/^\s+([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (nestedMatch && currentKey && isCurrentObject) {
      const propKey = nestedMatch[1];
      let propVal = nestedMatch[2].trim();
      if ((propVal.startsWith('"') && propVal.endsWith('"')) || (propVal.startsWith("'") && propVal.endsWith("'"))) {
        propVal = propVal.slice(1, -1);
      }
      if (propVal === 'true') propVal = true;
      else if (propVal === 'false') propVal = false;
      else if (/^\d+$/.test(propVal)) propVal = parseInt(propVal, 10);
      else if (propVal === '') propVal = null;

      result[currentKey][propKey] = propVal;
      continue;
    }

    // Top-level key: "key: value"
    const keyMatch = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (keyMatch) {
      currentKey = keyMatch[1];
      let rawVal = keyMatch[2].trim();

      // Inline array: "[item1, item2]"
      if (rawVal.startsWith('[') && rawVal.endsWith(']')) {
        const inner = rawVal.slice(1, -1).trim();
        result[currentKey] = inner
          ? inner.split(',').map(s => {
              const cleaned = s.trim().replace(/^['"]|['"]$/g, '');
              if (cleaned === 'true') return true;
              if (cleaned === 'false') return false;
              if (/^\d+$/.test(cleaned)) return parseInt(cleaned, 10);
              return cleaned;
            })
          : [];
        isCurrentObject = false;
      } else if (rawVal === '') {
        // Lookahead to check if next line is array item or nested property
        const nextLine = lines[i + 1] || '';
        if (nextLine.match(/^\s+-\s+/)) {
          result[currentKey] = [];
          isCurrentObject = false;
        } else if (nextLine.match(/^\s+[A-Za-z0-9_-]+\s*:/)) {
          result[currentKey] = {};
          isCurrentObject = true;
        } else {
          result[currentKey] = '';
          isCurrentObject = false;
        }
      } else {
        if ((rawVal.startsWith('"') && rawVal.endsWith('"')) || (rawVal.startsWith("'") && rawVal.endsWith("'"))) {
          rawVal = rawVal.slice(1, -1);
        } else if (rawVal === 'true') {
          rawVal = true;
        } else if (rawVal === 'false') {
          rawVal = false;
        } else if (rawVal === 'null') {
          rawVal = null;
        } else if (/^-?\d+$/.test(rawVal)) {
          rawVal = parseInt(rawVal, 10);
        } else if (/^-?\d+\.\d+$/.test(rawVal)) {
          rawVal = parseFloat(rawVal);
        }
        result[currentKey] = rawVal;
        isCurrentObject = false;
      }
    }
  }

  return result;
}

/**
 * Parses an MDX file from disk or string into frontmatter and body.
 *
 * @param {string} content - Raw MDX content
 * @param {string} [filePath] - Optional file path for asset resolution
 * @returns {{
 *   frontmatter: Record<string, any>,
 *   body: string,
 *   raw: string,
 *   headings: Array<{ level: number, text: string }>,
 *   images: Array<{ alt: string, src: string, hasAlt: boolean }>,
 *   links: Array<{ text: string, href: string }>,
 *   localAssets: string[]
 * }}
 */
export function parseMDX(content, filePath = '') {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  let frontmatter = {};
  let body = content;

  if (match) {
    frontmatter = parseYamlFrontmatter(match[1]);
    body = match[2].trim();
  }

  // Extract headings
  const headings = [];
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  let hMatch;
  while ((hMatch = headingRegex.exec(body)) !== null) {
    headings.push({
      level: hMatch[1].length,
      text: hMatch[2].trim(),
    });
  }

  // Extract images: Markdown ![alt](src) and JSX <img src="..." alt="..." /> or <Image ... />
  const images = [];
  const mdImgRegex = /!\[(.*?)\]\((.*?)\)/g;
  let imgMatch;
  while ((imgMatch = mdImgRegex.exec(body)) !== null) {
    const alt = imgMatch[1].trim();
    const src = imgMatch[2].trim().split(/\s+/)[0]; // strip optional title
    images.push({
      alt,
      src,
      hasAlt: alt.length > 0,
    });
  }

  const jsxImgRegex = /<(?:img|Image)\b([^>]*?)\/?>/gi;
  let jsxMatch;
  while ((jsxMatch = jsxImgRegex.exec(body)) !== null) {
    const attrs = jsxMatch[1];
    const srcMatch = attrs.match(/src=["'](.*?)["']/i);
    const altMatch = attrs.match(/alt=["'](.*?)["']/i);
    const src = srcMatch ? srcMatch[1].trim() : '';
    const alt = altMatch ? altMatch[1].trim() : '';
    images.push({
      alt,
      src,
      hasAlt: alt.length > 0,
    });
  }

  // Frontmatter referenced images
  if (frontmatter.cover_image && typeof frontmatter.cover_image === 'string') {
    images.push({
      alt: frontmatter.coverImageAlt || frontmatter.cover_image_alt || 'Cover image',
      src: frontmatter.cover_image,
      hasAlt: Boolean(frontmatter.coverImageAlt || frontmatter.cover_image_alt),
    });
  }
  if (frontmatter.image && typeof frontmatter.image === 'string') {
    images.push({
      alt: frontmatter.imageAlt || frontmatter.image_alt || 'Featured image',
      src: frontmatter.image,
      hasAlt: Boolean(frontmatter.imageAlt || frontmatter.image_alt),
    });
  }

  // Extract links: [text](href)
  const links = [];
  const linkRegex = /\[(.*?)\]\((.*?)\)/g;
  let linkMatch;
  while ((linkMatch = linkRegex.exec(body)) !== null) {
    const text = linkMatch[1].trim();
    const href = linkMatch[2].trim();
    if (!href.startsWith('#')) {
      links.push({ text, href });
    }
  }

  // Filter local asset references (starts with ./ or ../)
  const localAssets = [];
  const dir = filePath ? path.dirname(filePath) : '';
  for (const img of images) {
    if (img.src && (img.src.startsWith('./') || img.src.startsWith('../'))) {
      const resolved = dir ? path.resolve(dir, img.src) : img.src;
      localAssets.push(resolved);
    }
  }

  return {
    frontmatter,
    body,
    raw: content,
    headings,
    images,
    links,
    localAssets,
  };
}

/**
 * Reads and parses an MDX file from disk.
 *
 * @param {string} filePath
 * @returns {ReturnType<typeof parseMDX>}
 */
export function readAndParseMDX(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  return parseMDX(content, filePath);
}

