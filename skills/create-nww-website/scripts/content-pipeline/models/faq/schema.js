/**
 * Authoritative Zod Schema for NWW CMS FAQ Model
 *
 * Single source of truth for FAQ frontmatter and Mongoose seed payloads.
 * Backend route: POST /api/faq/create-one
 */

import { z } from 'zod';

export const modelName = 'FAQ';
export const resourceSlug = 'faq';

export const frontmatterSchema = z.strictObject({
  question: z.string().min(2, 'Question must be at least 2 characters'),
  answer: z.string().optional(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case'),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
  order: z.number().default(0),
});

export const seedSchema = z.strictObject({
  question: z.string().min(2),
  answer: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  status: z.enum(['draft', 'published', 'archived']),
  order: z.number(),
  editTimeFields: z.literal(true),
  metadata: z.strictObject({
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export function toSeedPayload(fm, htmlBody) {
  const answer = (fm.answer || htmlBody).trim();
  const metadata = {};
  if (fm.category) metadata.category = fm.category;
  if (fm.tags) metadata.tags = fm.tags;

  return {
    question: fm.question.trim(),
    answer,
    slug: fm.slug.trim(),
    status: fm.status || 'published',
    order: fm.order || 0,
    editTimeFields: true,
    metadata,
  };
}

