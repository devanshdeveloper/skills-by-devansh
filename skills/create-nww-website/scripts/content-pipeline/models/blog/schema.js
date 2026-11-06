/**
 * Authoritative Zod Schema for NWW CMS Blog Model
 *
 * Single source of truth for Blog frontmatter and Mongoose seed payloads.
 * Backend route: POST /api/blog/create-one
 */

import { z } from 'zod';

export const modelName = 'Blog';
export const resourceSlug = 'blog';

/**
 * Strict Zod schema for Blog MDX frontmatter.
 * Rejects any unrecognized keys.
 */
export const frontmatterSchema = z.strictObject({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  primaryKeyword: z.string().optional(),
  searchIntent: z.enum(['Informational', 'Commercial', 'Transactional', 'Navigational']).optional(),
  secondaryKeywords: z.array(z.string()).optional(),
  canonicalUrl: z.string().optional(),
  schemaType: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'pending', 'published', 'archived']).default('published'),
  postedAt: z.string().optional(),
  cover_image: z.string().optional(),
  coverImageAlt: z.string().optional(),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  order: z.number().default(0),
  author: z.union([
    z.string(),
    z.strictObject({
      mode: z.enum(['manual', 'existing']).optional(),
      name: z.string().optional(),
      role: z.string().optional(),
      image: z.string().optional(),
      url: z.string().optional(),
    }),
  ]).optional(),
});

/**
 * Zod schema validating the final compiled seed JSON (round-trip validation).
 */
export const seedSchema = z.strictObject({
  title: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  content: z.string().min(1, 'Content must contain HTML rich-text'),
  status: z.enum(['draft', 'pending', 'published', 'archived']),
  postedAt: z.string(),
  editTimeFields: z.literal(true),
  order: z.number(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  cover_image: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  author_name: z.string().optional(),
  author_image: z.string().nullable().optional(),
  author: z.object({
    mode: z.string().optional(),
    name: z.string().optional(),
    role: z.string().optional(),
    image: z.string().nullable().optional(),
    url: z.string().optional(),
  }).optional(),
  faqs: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).optional(),
  metadata: z.strictObject({
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

/**
 * Transforms validated MDX frontmatter + HTML body into Mongoose seed payload.
 *
 * @param {z.infer<typeof frontmatterSchema>} fm
 * @param {string} htmlBody
 * @param {Array<{ question: string, answer: string }>} [faqs]
 * @returns {z.infer<typeof seedSchema>}
 */
export function toSeedPayload(fm, htmlBody, faqs = []) {
  const metadata = {};
  if (fm.category) metadata.category = fm.category;
  if (fm.tags) metadata.tags = fm.tags;

  const authorName = typeof fm.author === 'string'
    ? fm.author
    : fm.author?.name || 'Editorial Team';

  const authorObj = typeof fm.author === 'object'
    ? {
        mode: fm.author.mode || 'manual',
        name: fm.author.name || 'Editorial Team',
        role: fm.author.role,
        image: fm.author.image || null,
        url: fm.author.url,
      }
    : {
        mode: 'manual',
        name: authorName,
      };

  return {
    title: fm.title.trim(),
    slug: fm.slug.trim(),
    content: htmlBody.trim(),
    status: fm.status || 'published',
    postedAt: fm.postedAt || new Date().toISOString(),
    editTimeFields: true,
    order: fm.order || 0,
    metaTitle: (fm.metaTitle || fm.title).trim(),
    metaDescription: (fm.metaDescription || '').trim(),
    cover_image: fm.cover_image || null,
    image: fm.image || fm.cover_image || null,
    author_name: authorName,
    author_image: authorObj.image || null,
    author: authorObj,
    faqs: faqs.length > 0 ? faqs : [],
    metadata,
  };
}
