/**
 * Authoritative Zod Schema for NWW CMS Editorial Article Model
 *
 * Single source of truth for Editorial Article frontmatter and Mongoose seed payloads.
 * Backend route: POST /api/article/create-one
 */

import { z } from 'zod';

export const modelName = 'Article';
export const resourceSlug = 'article';

export const frontmatterSchema = z.strictObject({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
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
      name: z.string().optional(),
      role: z.string().optional(),
      image: z.string().optional(),
    }),
  ]).optional(),
});

export const seedSchema = z.strictObject({
  title: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  content: z.string().min(1),
  status: z.enum(['draft', 'pending', 'published', 'archived']),
  postedAt: z.string(),
  order: z.number(),
  editTimeFields: z.literal(true),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  cover_image: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  author_name: z.string().optional(),
  author_image: z.string().nullable().optional(),
  metadata: z.strictObject({
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export function toSeedPayload(fm, htmlBody) {
  const metadata = {};
  if (fm.category) metadata.category = fm.category;
  if (fm.tags) metadata.tags = fm.tags;

  const authorName = typeof fm.author === 'string'
    ? fm.author
    : fm.author?.name || 'Editorial Team';

  const authorImage = typeof fm.author === 'object'
    ? fm.author?.image || null
    : null;

  return {
    title: fm.title.trim(),
    slug: fm.slug.trim(),
    content: htmlBody.trim(),
    status: fm.status || 'published',
    postedAt: fm.postedAt || new Date().toISOString(),
    order: fm.order || 0,
    editTimeFields: true,
    metaTitle: (fm.metaTitle || fm.title).trim(),
    metaDescription: (fm.metaDescription || '').trim(),
    cover_image: fm.cover_image || null,
    image: fm.image || fm.cover_image || null,
    author_name: authorName,
    author_image: authorImage,
    metadata,
  };
}
