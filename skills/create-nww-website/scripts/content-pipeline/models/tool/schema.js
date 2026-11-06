/**
 * Authoritative Zod Schema for NWW CMS Tool Model
 *
 * Single source of truth for Interactive Tool frontmatter and Mongoose seed payloads.
 * Backend route: POST /api/website-tool/create-one
 */

import { z } from 'zod';

export const modelName = 'Tool';
export const resourceSlug = 'website-tool';

export const frontmatterSchema = z.strictObject({
  title: z.string().min(2, 'Tool title must be at least 2 characters'),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case'),
  description: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
  icon: z.string().optional(),
  categorySlug: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
  order: z.number().default(0),
});

export const seedSchema = z.strictObject({
  title: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().optional(),
  before_content: z.string().optional(),
  after_content: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  icon: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  faqs: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).optional(),
  status: z.enum(['draft', 'published', 'archived']),
  order: z.number(),
  editTimeFields: z.literal(true),
});

export function toSeedPayload(fm, htmlBody, faqs = []) {
  return {
    title: fm.title.trim(),
    slug: fm.slug.trim(),
    description: (fm.description || '').trim(),
    before_content: htmlBody.trim(),
    after_content: '',
    metaTitle: (fm.metaTitle || fm.title).trim(),
    metaDescription: (fm.metaDescription || fm.description || '').trim(),
    icon: fm.icon || null,
    tags: fm.tags || [],
    faqs: faqs.length > 0 ? faqs : [],
    status: fm.status || 'published',
    order: fm.order || 0,
    editTimeFields: true,
  };
}
