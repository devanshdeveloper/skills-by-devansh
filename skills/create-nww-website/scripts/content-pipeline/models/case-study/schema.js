/**
 * Authoritative Zod Schema for NWW CMS Case Study Model
 *
 * Single source of truth for Case Study frontmatter and Mongoose seed payloads.
 * Backend route: POST /api/website-case-study/create-one
 */

import { z } from 'zod';

export const modelName = 'CaseStudy';
export const resourceSlug = 'website-case-study';

export const frontmatterSchema = z.strictObject({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case'),
  clientName: z.string().min(1, 'Client name is required'),
  clientLogo: z.string().optional(),
  description: z.string().min(5, 'Executive summary is required'),
  challenge: z.string().min(5, 'Challenge description is required'),
  solution: z.string().min(5, 'Solution description is required'),
  results: z.string().min(5, 'Results / ROI description is required'),
  image: z.string().min(1, 'Showcase image is required'),
  imageAlt: z.string().optional(),
  industry: z.string().optional(),
  services: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
  order: z.number().default(0),
});

export const seedSchema = z.strictObject({
  title: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  clientName: z.string().min(1),
  clientLogo: z.string().optional(),
  description: z.string().min(5),
  challenge: z.string().min(5),
  solution: z.string().min(5),
  results: z.string().min(5),
  content: z.string().optional(),
  image: z.string().min(1),
  industry: z.string().optional(),
  services: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'archived']),
  order: z.number(),
  editTimeFields: z.literal(true),
});

export function toSeedPayload(fm, htmlBody) {
  return {
    title: fm.title.trim(),
    slug: fm.slug.trim(),
    clientName: fm.clientName.trim(),
    clientLogo: fm.clientLogo || '',
    description: fm.description.trim(),
    challenge: fm.challenge.trim(),
    solution: fm.solution.trim(),
    results: fm.results.trim(),
    content: htmlBody.trim(),
    image: fm.image,
    industry: fm.industry,
    services: fm.services || [],
    tags: fm.tags || [],
    status: fm.status || 'published',
    order: fm.order || 0,
    editTimeFields: true,
  };
}

