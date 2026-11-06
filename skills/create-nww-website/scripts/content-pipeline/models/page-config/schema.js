/**
 * Authoritative Zod Schema for NWW CMS Page Config Model
 *
 * Single source of truth for WebsitePageConfig frontmatter and Mongoose seed payloads.
 * Backend route: POST /api/website-page-config/create-one
 */

import { z } from 'zod';

export const modelName = 'PageConfig';
export const resourceSlug = 'website-page-config';

export const frontmatterSchema = z.strictObject({
  title: z.string().min(2, 'Page title must be at least 2 characters'),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case'),
  path: z.string().startsWith('/', 'Path must start with /'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  noIndex: z.boolean().default(false),
  noFollow: z.boolean().default(false),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  twitterCard: z.enum(['summary', 'summary_large_image']).default('summary_large_image'),
  structuredDataType: z.enum(['WebPage', 'AboutPage', 'ContactPage', 'FAQPage', 'Organization']).default('WebPage'),
  showCTA: z.boolean().default(true),
  ctaHeadline: z.string().optional(),
  ctaSubtext: z.string().optional(),
  ctaButtonText: z.string().default('Get Started'),
  ctaButtonLink: z.string().default('/contact'),
  ctaSecondaryButtonText: z.string().optional(),
  ctaSecondaryButtonLink: z.string().optional(),
  heroBadge: z.string().optional(),
  heroHeadline: z.string().optional(),
  heroSubtext: z.string().optional(),
  headerVariant: z.enum(['default', 'transparent', 'minimal', 'hidden']).default('default'),
  showFooter: z.boolean().default(true),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
});

export const seedSchema = z.strictObject({
  title: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  path: z.string().startsWith('/'),
  status: z.enum(['draft', 'published', 'archived']),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  noIndex: z.boolean(),
  noFollow: z.boolean(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().nullable().optional(),
  twitterCard: z.enum(['summary', 'summary_large_image']),
  structuredDataType: z.enum(['WebPage', 'AboutPage', 'ContactPage', 'FAQPage', 'Organization']),
  showCTA: z.boolean(),
  ctaHeadline: z.string().optional(),
  ctaSubtext: z.string().optional(),
  ctaButtonText: z.string(),
  ctaButtonLink: z.string(),
  ctaSecondaryButtonText: z.string().optional(),
  ctaSecondaryButtonLink: z.string().optional(),
  heroBadge: z.string().optional(),
  heroHeadline: z.string().optional(),
  heroSubtext: z.string().optional(),
  headerVariant: z.enum(['default', 'transparent', 'minimal', 'hidden']),
  showFooter: z.boolean(),
  faqs: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).optional(),
  editTimeFields: z.literal(true),
});

export function toSeedPayload(fm, htmlBody, faqs = []) {
  return {
    title: fm.title.trim(),
    slug: fm.slug.trim(),
    path: fm.path.trim(),
    status: fm.status || 'published',
    metaTitle: (fm.metaTitle || fm.title).trim(),
    metaDescription: (fm.metaDescription || '').trim(),
    canonicalUrl: fm.canonicalUrl || '',
    keywords: fm.keywords || [],
    noIndex: Boolean(fm.noIndex),
    noFollow: Boolean(fm.noFollow),
    ogTitle: fm.ogTitle || fm.metaTitle || fm.title,
    ogDescription: fm.ogDescription || fm.metaDescription || '',
    ogImage: fm.ogImage || null,
    twitterCard: fm.twitterCard || 'summary_large_image',
    structuredDataType: fm.structuredDataType || 'WebPage',
    showCTA: fm.showCTA !== false,
    ctaHeadline: fm.ctaHeadline || '',
    ctaSubtext: fm.ctaSubtext || '',
    ctaButtonText: fm.ctaButtonText || 'Get Started',
    ctaButtonLink: fm.ctaButtonLink || '/contact',
    ctaSecondaryButtonText: fm.ctaSecondaryButtonText || '',
    ctaSecondaryButtonLink: fm.ctaSecondaryButtonLink || '',
    heroBadge: fm.heroBadge || '',
    heroHeadline: fm.heroHeadline || '',
    heroSubtext: fm.heroSubtext || '',
    headerVariant: fm.headerVariant || 'default',
    showFooter: fm.showFooter !== false,
    faqs: faqs.length > 0 ? faqs : [],
    editTimeFields: true,
  };
}

