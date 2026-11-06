/**
 * Authoritative Zod Schema for NWW CMS Testimonial Model
 *
 * Single source of truth for Testimonial frontmatter and Mongoose seed payloads.
 * Backend route: POST /api/testimonial/create-one
 */

import { z } from 'zod';

export const modelName = 'Testimonial';
export const resourceSlug = 'testimonial';

export const frontmatterSchema = z.strictObject({
  name: z.string().min(2, 'Author name must be at least 2 characters'),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case'),
  role: z.string().optional(),
  company: z.string().optional(),
  quote: z.string().optional(),
  rating: z.number().min(1).max(5).default(5),
  avatar: z.string().optional(),
  avatarAlt: z.string().optional(),
  companyLogo: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
  order: z.number().default(0),
});

export const seedSchema = z.strictObject({
  name: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  role: z.string().optional(),
  company: z.string().optional(),
  content: z.string().min(1),
  rating: z.number().min(1).max(5),
  avatar: z.string().nullable().optional(),
  companyLogo: z.string().nullable().optional(),
  status: z.enum(['draft', 'published', 'archived']),
  order: z.number(),
  editTimeFields: z.literal(true),
});

export function toSeedPayload(fm, htmlBody) {
  const content = (fm.quote || htmlBody).trim();
  return {
    name: fm.name.trim(),
    slug: fm.slug.trim(),
    role: fm.role || '',
    company: fm.company || '',
    content,
    rating: fm.rating || 5,
    avatar: fm.avatar || null,
    companyLogo: fm.companyLogo || null,
    status: fm.status || 'published',
    order: fm.order || 0,
    editTimeFields: true,
  };
}

