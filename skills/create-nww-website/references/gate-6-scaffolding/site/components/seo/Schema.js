/**
 * Schema.js
 *
 * Universal Schema.org JSON-LD structured data component for Next.js App Router applications.
 *
 * Safely serializes and renders structured data scripts in React Server Components,
 * escaping literal '<' characters to '\u003c' to prevent script-injection / XSS attacks.
 *
 * Supports:
 * - Direct schema objects (e.g. from Blog.generateJSONLD(post), PageConfig.generateJSONLD(config))
 * - Pre-formatted SEOHelper outputs ({ __html, schema })
 * - Arrays of schemas (automatically consolidated under @graph)
 * - Custom raw JSON-LD objects
 *
 * @example
 * // 1. Blog Post Schema:
 * import { Schema } from '@/components/seo/Schema';
 * import { Blog } from '@/lib/cms';
 *
 * const jsonLd = Blog.generateJSONLD(post);
 * return (
 *   <article>
 *     <Schema schema={jsonLd} />
 *     <h1>{post.title}</h1>
 *   </article>
 * );
 *
 * @example
 * // 2. Multiple Schemas (Article + Breadcrumb):
 * <Schema schema={[articleSchema, breadcrumbSchema]} />
 */

/**
 * Safely formats and escapes a schema payload for inclusion in a script tag.
 *
 * @param {any} input - Raw schema object, array of schemas, or SEOHelper output
 * @returns {string|null} Escaped JSON string safe for __html
 */
export function formatJsonLd(input) {
  if (!input) return null;

  // 1. If already generated via SEOHelper.generateJSONLD ({ __html, schema })
  if (typeof input === 'object' && typeof input.__html === 'string') {
    return input.__html;
  }

  // 2. If passed as a pre-serialized string
  if (typeof input === 'string') {
    return input.replace(/</g, '\\u003c');
  }

  // 3. Handle arrays: wrap in Schema.org @graph
  let payload = input;
  if (Array.isArray(input)) {
    if (input.length === 0) return null;
    payload = {
      '@context': 'https://schema.org',
      '@graph': input.map((item) => {
        if (item && typeof item === 'object') {
          // If item has its own @context, strip it inside @graph
          const { '@context': _, ...rest } = item;
          return rest;
        }
        return item;
      }),
    };
  } else if (typeof input === 'object') {
    // 4. Ensure @context is present if not already declared
    if (!input['@context'] && !input['@graph']) {
      payload = {
        '@context': 'https://schema.org',
        ...input,
      };
    }
  }

  try {
    const cleaned = JSON.parse(JSON.stringify(payload));
    return JSON.stringify(cleaned).replace(/</g, '\\u003c');
  } catch (err) {
    console.error('[Schema] Failed to serialize JSON-LD:', err);
    return null;
  }
}

/**
 * React Server Component to inject safe Schema.org JSON-LD structured data.
 *
 * @param {object} props
 * @param {object|array|string} [props.schema] - Primary schema object or array of schemas
 * @param {object|array|string} [props.jsonLd] - Alias for schema
 * @param {object|array|string} [props.data] - Alias for schema
 * @param {string} [props.id] - Optional script ID
 * @returns {JSX.Element|null} <script type="application/ld+json"> tag or null
 */
export function Schema({ schema, jsonLd, data, ...rest }) {
  const target = schema || jsonLd || data;
  const safeHtml = formatJsonLd(target);

  if (!safeHtml) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
      {...rest}
    />
  );
}

export default Schema;

