/**
 * CMS Model Schema Registry
 *
 * Provides single-point dynamic resolution for all active NWW CMS model schemas.
 */

import * as blog from './blog/schema.js';
import * as project from './project/schema.js';
import * as service from './service/schema.js';
import * as caseStudy from './case-study/schema.js';
import * as faq from './faq/schema.js';
import * as testimonial from './testimonial/schema.js';
import * as tool from './tool/schema.js';
import * as article from './article/schema.js';
import * as pageConfig from './page-config/schema.js';

export const MODELS = {
  blog,
  project,
  service,
  'case-study': caseStudy,
  faq,
  testimonial,
  tool,
  article,
  'page-config': pageConfig,
};

/**
 * Resolves a model schema module by name or alias.
 *
 * @param {string} name
 * @returns {typeof blog | null}
 */
export function getModel(name) {
  if (!name) return null;
  const key = String(name).toLowerCase().trim().replace(/_/g, '-');
  return MODELS[key] || null;
}

/**
 * Returns all registered model names.
 *
 * @returns {string[]}
 */
export function listModels() {
  return Object.keys(MODELS);
}
