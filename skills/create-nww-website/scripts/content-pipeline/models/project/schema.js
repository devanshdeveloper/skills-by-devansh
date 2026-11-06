/**
 * Authoritative Zod Schema for NWW CMS Project (Portfolio) Model
 *
 * Single source of truth for Project frontmatter and Mongoose seed payloads.
 * Backend route: POST /api/project/create-one
 */

import { z } from 'zod';

export const modelName = 'Project';
export const resourceSlug = 'project';

export const frontmatterSchema = z.strictObject({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case'),
  client: z.string().optional(),
  summary: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
  liveUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  year: z.union([z.string(), z.number()]).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  results: z.array(z.string()).optional(),
  cover_image: z.string().optional(),
  coverImageAlt: z.string().optional(),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  status: z.enum(['draft', 'pending', 'published', 'archived']).default('published'),
  order: z.number().default(0),
  postedAt: z.string().optional(),
});

export const seedSchema = z.strictObject({
  title: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  content: z.string().optional(),
  client: z.string().optional(),
  summary: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  liveUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  year: z.union([z.string(), z.number()]).optional(),
  cover_image: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  gallery: z.array(z.string()).optional(),
  status: z.enum(['draft', 'pending', 'published', 'archived']),
  order: z.number(),
  postedAt: z.string(),
  editTimeFields: z.literal(true),
  metadata: z.strictObject({
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    technologies: z.array(z.string()).optional(),
    results: z.array(z.string()).optional(),
  }),
});

export function toSeedPayload(fm, htmlBody) {
  const metadata = {};
  if (fm.category) metadata.category = fm.category;
  if (fm.tags) metadata.tags = fm.tags;
  if (fm.technologies) metadata.technologies = fm.technologies;
  if (fm.results) metadata.results = fm.results;

  return {
    title: fm.title.trim(),
    slug: fm.slug.trim(),
    content: htmlBody.trim(),
    client: fm.client || '',
    summary: fm.summary || '',
    metaTitle: (fm.metaTitle || fm.title).trim(),
    metaDescription: (fm.metaDescription || fm.summary || '').trim(),
    liveUrl: fm.liveUrl || '',
    githubUrl: fm.githubUrl || '',
    year: fm.year || new Date().getFullYear(),
    cover_image: fm.cover_image || null,
    image: fm.image || fm.cover_image || null,
    gallery: Array.isArray(fm.gallery) ? fm.gallery : [],
    status: fm.status || 'published',
    order: fm.order || 0,
    postedAt: fm.postedAt || new Date().toISOString(),
    editTimeFields: true,
    metadata,
  };
}
