// skills/create-nww-website/references/gate-6-scaffolding/cms-kit/project.js: copy-ready CMS kit source. Do not edit site copies in place.

import { ContentHelper } from './content-helper.js';
import { SEOHelper } from './seo-helper.js';
import { SiteConfig } from './site-config.js';

/**
 * Project (Portfolio) model helper providing class-based static query and formatting methods.
 */
export class Project {
  /**
   * Fetches a single published project document by its slug.
   *
   * @param {string} slug - Unique project slug
   * @returns {Promise<any|null>} Project document or null if not found
   */
  static async readOne(slug) {
    if (!slug) return null;
    const cleanSlug = encodeURIComponent(String(slug).trim().toLowerCase());

    const res = await ContentHelper.fetch(
      `/api/project/paginate?slug=${cleanSlug}&status=published`,
      { resource: 'project' }
    );

    const items = res?.data?.items || res?.items || (Array.isArray(res) ? res : []);
    const project = items[0] || null;

    if (!project) return null;
    if (project.status && project.status !== 'published') return null;

    return project;
  }

  /**
   * Fetches a paginated list of published projects with optional taxonomy filtering.
   *
   * @param {object} [options={}] - Query options
   * @param {number} [options.page=1] - Page number (1-indexed)
   * @param {number} [options.limit=12] - Number of items per page
   * @param {string} [options.status='published'] - Workflow status filter
   * @param {string} [options.category] - Filter by category / industry
   * @param {string} [options.technology] - Filter by technology tag
   * @returns {Promise<{ items: any[], total: number, page: number, limit: number, totalPages: number }>}
   */
  static async paginate({ page = 1, limit = 12, status = 'published', category, technology } = {}) {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));

    let query = `/api/project/paginate?page=${p}&limit=${l}&status=${status}`;
    if (category) query += `&category=${encodeURIComponent(category)}`;
    if (technology) query += `&technology=${encodeURIComponent(technology)}`;

    const res = await ContentHelper.fetch(query, { resource: 'project' });

    const rawItems = res?.data?.items || res?.items || (Array.isArray(res) ? res : []);
    const total = res?.data?.total || res?.pagination?.totalDocuments || res?.total || rawItems.length;
    const totalPages = res?.data?.totalPages || res?.pagination?.totalPages || Math.ceil(total / l) || 1;

    return {
      items: rawItems,
      total,
      page: p,
      limit: l,
      totalPages,
    };
  }

  /**
   * Fetches slugs for published projects to supply Next.js generateStaticParams.
   *
   * @param {object} [options={}] - Query options
   * @param {number} [options.limit=100] - Max slugs to fetch
   * @returns {Promise<string[]>} Array of slug strings
   */
  static async getSlugs({ limit = 100 } = {}) {
    const { items } = await Project.paginate({ page: 1, limit });
    return items.map((p) => p.slug).filter(Boolean);
  }

  /**
   * Retrieves related projects sharing category or technologies, excluding the current item.
   *
   * @param {object} currentProject - Current project document
   * @param {number} [limit=3] - Maximum related projects to return
   * @returns {Promise<Array<any>>} Sibling portfolio items
   */
  static async getRelated(currentProject, limit = 3) {
    if (!currentProject) return [];
    const category = currentProject.category || currentProject.metadata?.category;
    const res = await Project.paginate({ page: 1, limit: limit + 5, category });
    const currentId = currentProject._id || currentProject.id;

    return res.items
      .filter((item) => (item._id || item.id) !== currentId && item.slug !== currentProject.slug)
      .slice(0, limit);
  }

  /**
   * Generates dynamic Next.js Metadata for a single project route segment.
   *
   * @param {string} slug - Project slug
   * @param {object} [options={}] - Additional metadata options
   * @param {any[]} [options.parentImages=[]] - Inherited parent OpenGraph images
   * @returns {Promise<import('next').Metadata>} Complete metadata object
   */
  static async generateMetadata(slug, { parentImages = [] } = {}) {
    const project = await Project.readOne(slug);
    if (!project) {
      return {
        title: 'Project Not Found',
        robots: { index: false, follow: false },
      };
    }

    const title = project.metaTitle || `${project.title} | Case Study`;
    const description = project.metaDescription || project.summary || `Learn how we delivered ${project.title}.`;
    const image = project.image || project.cover_image;

    return SEOHelper.generateMetadata({
      title,
      description,
      path: `/projects/${project.slug}`,
      image,
      parentImages,
      type: 'article',
    });
  }

  /**
   * Generates Schema.org CreativeWork structured data for a project with full field coverage.
   *
   * @param {object} project - Project document
   * @returns {object} Schema.org CreativeWork JSON-LD object
   */
  static generateJSONLD(project) {
    if (!project) return {};
    return SEOHelper.buildProjectSchema(project);
  }

  /**
   * Builds dynamic sitemap entries for all published projects.
   *
   * @param {string} [siteUrl] - Base site URL fallback
   * @returns {Promise<Array<{ url: string, lastModified: Date, changeFrequency: string, priority: number }>>}
   */
  static async getSitemap(siteUrl) {
    const baseUrl = (siteUrl || SiteConfig.getUrl()).replace(/\/$/, '');
    const { items } = await Project.paginate({ page: 1, limit: 100 });

    return items.map((project) => ({
      url: `${baseUrl}/projects/${project.slug}`,
      lastModified: new Date(project.updatedAt || project.createdAt || Date.now()),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));
  }

  /**
   * Generates a markdown feed for AI indexing (llms.txt compatible format).
   *
   * @param {string} [siteUrl] - Base site URL fallback
   * @returns {Promise<string>} Structured Markdown string
   */
  static async getLLMsTxt(siteUrl) {
    const siteName = SiteConfig.getName();
    const baseUrl = (siteUrl || SiteConfig.getUrl()).replace(/\/$/, '');
    const { items } = await Project.paginate({ page: 1, limit: 100 });

    let markdown = `# ${siteName} Case Studies\n\n`;
    markdown += `> Portfolio projects and client deliverable case studies for ${siteName}.\n\n`;
    markdown += `## Projects\n\n`;

    for (const project of items) {
      const summary = project.summary || project.metaDescription || '';
      const client = project.client ? ` (${project.client})` : '';
      markdown += `- [${project.title}](${baseUrl}/projects/${project.slug})${client}${summary ? `: ${summary}` : ''}\n`;
    }

    return markdown;
  }
}
