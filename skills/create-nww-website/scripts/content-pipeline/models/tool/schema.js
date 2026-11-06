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
  title: z.string().min(2, 'Tool title must be at least 2 characters').optional(),
  name: z.string().min(2, 'Tool name must be at least 2 characters').optional(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case'),
  description: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  primaryKeyword: z.string().optional(),
  searchIntent: z.string().optional(),
  secondaryKeywords: z.array(z.string()).optional(),
  canonicalUrl: z.string().optional(),
  schemaType: z.string().optional(),
  applicationCategory: z.string().optional(),
  pricing: z.string().optional(),
  icon: z.string().optional(),
  categorySlug: z.string().optional(),
  categoryName: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'pending', 'published', 'archived']).default('published'),
  order: z.number().default(0),
  publishedAt: z.string().optional(),
  postedAt: z.string().optional(),
}).refine(data => data.title || data.name, {
  message: "Either 'title' or 'name' must be provided",
  path: ['title'],
});

export const seedSchema = z.strictObject({
  title: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  content: z.string().min(1, 'Content must contain HTML rich-text'),
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
  status: z.enum(['draft', 'pending', 'published', 'archived']),
  order: z.number(),
  postedAt: z.string(),
  editTimeFields: z.literal(true),
  author_name: z.string().optional(),
  author_image: z.string().nullable().optional(),
  cover_image: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  metadata: z.strictObject({
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
});

export function toSeedPayload(fm, htmlBody, faqs = []) {
  const title = (fm.title || fm.name || '').trim();
  const metadata = {};
  if (fm.categorySlug || fm.categoryName) metadata.category = fm.categorySlug || fm.categoryName;
  if (fm.tags) metadata.tags = fm.tags;

  return {
    title,
    slug: fm.slug.trim(),
    content: htmlBody.trim(),
    description: (fm.description || '').trim(),
    before_content: htmlBody.trim(),
    after_content: '',
    metaTitle: (fm.metaTitle || title).trim(),
    metaDescription: (fm.metaDescription || fm.description || '').trim(),
    icon: fm.icon || null,
    tags: fm.tags || [],
    faqs: faqs.length > 0 ? faqs : [],
    status: fm.status || 'published',
    order: fm.order || 0,
    postedAt: fm.postedAt || fm.publishedAt || new Date().toISOString(),
    editTimeFields: true,
    author_name: 'Editorial Team',
    author_image: null,
    cover_image: null,
    image: null,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
  };
}
