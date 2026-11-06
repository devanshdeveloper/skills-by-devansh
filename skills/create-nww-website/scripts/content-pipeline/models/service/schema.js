/**
 * Authoritative Zod Schema for NWW CMS Service Model
 *
 * Single source of truth for Service frontmatter and Mongoose seed payloads.
 * Backend route: POST /api/website-service/create-one
 */

import { z } from 'zod';

export const modelName = 'Service';
export const resourceSlug = 'website-service';

export const frontmatterSchema = z.strictObject({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case'),
  description: z.string().min(5, 'Short description is required'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
  industry: z.string().optional(),
  portfolio: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  cover_image: z.string().optional(),
  coverImageAlt: z.string().optional(),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
  order: z.number().default(0),
});

export const seedSchema = z.strictObject({
  title: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().min(5),
  content: z.string().min(1),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  industry: z.string().optional(),
  portfolio: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  cover_image: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  status: z.enum(['draft', 'published', 'archived']),
  order: z.number(),
  editTimeFields: z.literal(true),
});

export function toSeedPayload(fm, htmlBody) {
  return {
    title: fm.title.trim(),
    slug: fm.slug.trim(),
    description: fm.description.trim(),
    content: htmlBody.trim(),
    metaTitle: (fm.metaTitle || fm.title).trim(),
    metaDescription: (fm.metaDescription || fm.description).trim(),
    industry: fm.industry,
    portfolio: fm.portfolio,
    attachments: fm.attachments || [],
    cover_image: fm.cover_image || null,
    image: fm.image || fm.cover_image || null,
    status: fm.status || 'published',
    order: fm.order || 0,
    editTimeFields: true,
  };
}

