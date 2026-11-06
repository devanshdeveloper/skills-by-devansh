/**
 * Authoritative Zod Schema for NWW CMS Policy Model
 *
 * Single source of truth for Policy frontmatter and Mongoose seed payloads.
 * Backend route: POST /api/policy/create-one
 */

import { z } from 'zod';

export const modelName = 'Policy';
export const resourceSlug = 'policy';

export const frontmatterSchema = z.strictObject({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  primaryKeyword: z.string().optional(),
  searchIntent: z.string().optional(),
  canonicalUrl: z.string().optional(),
  schemaType: z.string().optional(),
  publishedAt: z.string().optional(),
  postedAt: z.string().optional(),
  status: z.enum(['draft', 'pending', 'published', 'archived']).default('published'),
  order: z.number().default(0),
});

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
  canonicalUrl: z.string().optional(),
});

export function toSeedPayload(fm, htmlBody) {
  return {
    title: fm.title.trim(),
    slug: fm.slug.trim(),
    content: htmlBody.trim(),
    status: fm.status || 'published',
    postedAt: fm.postedAt || fm.publishedAt || new Date().toISOString(),
    editTimeFields: true,
    order: fm.order || 0,
    metaTitle: (fm.metaTitle || fm.title).trim(),
    metaDescription: (fm.metaDescription || '').trim(),
    canonicalUrl: fm.canonicalUrl || `/${fm.slug}`,
  };
}
