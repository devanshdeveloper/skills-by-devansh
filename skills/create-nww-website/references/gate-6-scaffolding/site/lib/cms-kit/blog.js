// skills/create-nww-website/references/gate-6-scaffolding/cms-kit/blog.js: copy-ready CMS kit source. Do not edit site copies in place.

import { ContentHelper } from './content-helper.js';
import { SEOHelper } from './seo-helper.js';
import { SiteConfig } from './site-config.js';

/**
 * Universal Blog model helper for article querying, pagination, SEO metadata, sitemaps, and feeds.
 */
export class Blog {
  /**
   * Fetches a single blog article by slug. Defensively filters out future-dated posts.
   *
   * @param {string} slug - Unique article slug
   * @returns {Promise<any|null>} Article object or null if not found or future-dated
   */
  static async readOne(slug) {
    if (!slug) return null;
    const cleanSlug = encodeURIComponent(String(slug).trim().toLowerCase());
    const res = await ContentHelper.fetch(
      `/api/blog/paginate?slug=${cleanSlug}&status=published`,
      { resource: 'blog' }
    );

    const items = res?.data?.items || res?.items || (Array.isArray(res) ? res : []);
    const post = items[0] || null;
    if (!post) return null;

    // Defensive future-dated post guard
    const pubDate = post.postedAt || post.published_at || post.createdAt;
    if (pubDate && new Date(pubDate) > new Date()) {
      return null;
    }

    return post;
  }

  /**
   * Fetches paginated blog articles with optional category and tag filtering.
   *
   * @param {object} [options={}]
   * @param {number} [options.page=1] - 1-based page index
   * @param {number} [options.limit=10] - Number of items per page
   * @param {string} [options.category] - Filter by category slug
   * @param {string} [options.tag] - Filter by tag slug
   * @returns {Promise<{ items: Array<any>, total: number, page: number, totalPages: number }>}
   */
  static async paginate(options = {}) {
    const { page = 1, limit = 10, category, tag } = options;
    let query = `/api/blog/paginate?status=published&page=${page}&limit=${limit}`;
    if (category) query += `&category=${encodeURIComponent(category)}`;
    if (tag) query += `&tag=${encodeURIComponent(tag)}`;

    const res = await ContentHelper.fetch(query, { resource: 'blog' });
    const rawItems = res?.data?.items || res?.items || (Array.isArray(res) ? res : []);
    const now = new Date();

    const items = rawItems.filter((post) => {
      const pubDate = post.postedAt || post.published_at || post.createdAt;
      if (!pubDate) return true;
      return new Date(pubDate) <= now;
    });

    const total = res?.pagination?.totalDocuments ?? res?.data?.total ?? items.length;
    const totalPages = res?.pagination?.totalPages ?? res?.data?.totalPages ?? Math.max(1, Math.ceil(total / limit));

    return {
      items,
      total,
      page,
      totalPages,
    };
  }

  /**
   * Retrieves all published article slugs for Next.js generateStaticParams.
   *
   * @returns {Promise<string[]>} Array of slug strings
   */
  static async getSlugs() {
    const res = await Blog.paginate({ page: 1, limit: 500 });
    return res.items.map((item) => item.slug).filter(Boolean);
  }

  /**
   * Retrieves related articles sharing category or tags, excluding the current article.
   *
   * @param {object} currentPost - Current article document
   * @param {number} [limit=3] - Maximum related articles to return
   * @returns {Promise<Array<any>>} Sibling articles
   */
  static async getRelated(currentPost, limit = 3) {
    if (!currentPost) return [];
    const category = currentPost.category || currentPost.metadata?.category;
    const res = await Blog.paginate({ page: 1, limit: limit + 5, category });
    const currentId = currentPost._id || currentPost.id;

    return res.items
      .filter((item) => (item._id || item.id) !== currentId && item.slug !== currentPost.slug)
      .slice(0, limit);
  }

  /**
   * Builds complete Next.js Metadata for an article detail page.
   *
   * @param {string} slug - Article slug
   * @returns {Promise<import('next').Metadata>} Complete article metadata
   */
  static async generateMetadata(slug) {
    const post = await Blog.readOne(slug);
    if (!post) {
      return {
        title: 'Article Not Found',
      };
    }

    const title = post.metaTitle || post.title;
    const description = post.metaDescription || post.summary || post.excerpt || '';
    const image = post.cover_image || post.image;
    const publishedTime = post.postedAt || post.published_at || post.createdAt;
    const modifiedTime = post.lastUpdatedAt || post.updated_at || publishedTime;
    const authorName = post.author?.name || post.author_name || 'Editorial Team';
    const tags = Array.isArray(post.tags) ? post.tags : (post.metadata?.tags || []);

    return SEOHelper.generateMetadata({
      title,
      description,
      path: `/blog/${post.slug}`,
      image,
      type: 'article',
      publishedTime,
      modifiedTime,
      authors: [authorName],
      tags,
    });
  }

  /**
   * Generates a Schema.org BlogPosting structured data object with full field coverage.
   *
   * @param {object} post - Article document
   * @returns {object} BlogPosting JSON-LD object
   */
  static generateJSONLD(post) {
    if (!post) return {};
    return SEOHelper.buildArticleSchema(post);
  }

  /**
   * Compiles dynamic sitemap entries for all published articles.
   *
   * @param {string} [baseUrl] - Optional origin override
   * @returns {Promise<Array<{ url: string, lastModified: Date, changeFrequency: string, priority: number }>>}
   */
  static async getSitemap(baseUrl) {
    const origin = (baseUrl || SiteConfig.getUrl()).replace(/\/+$/, '');
    const res = await Blog.paginate({ page: 1, limit: 500 });

    return res.items.map((post) => {
      const dateVal = post.lastUpdatedAt || post.updated_at || post.postedAt || post.published_at;
      return {
        url: `${origin}/blog/${post.slug}`,
        lastModified: dateVal ? new Date(dateVal) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      };
    });
  }

  /**
   * Generates a markdown feed for AI indexing (llms.txt compatible format).
   *
   * @param {string} [baseUrl] - Optional origin override
   * @returns {Promise<string>} Structured Markdown string
   */
  static async getLLMsTxt(baseUrl) {
    const siteName = SiteConfig.getName();
    const origin = (baseUrl || SiteConfig.getUrl()).replace(/\/+$/, '');
    const res = await Blog.paginate({ page: 1, limit: 100 });

    let markdown = `# ${siteName}\n\n`;
    markdown += `> ${siteName} Knowledge Base and Articles\n\n`;
    markdown += `## Articles\n\n`;

    for (const post of res.items) {
      const summary = post.summary || post.excerpt || post.metaDescription || '';
      markdown += `- [${post.title}](${origin}/blog/${post.slug})${summary ? `: ${summary}` : ''}\n`;
    }

    return markdown;
  }
}

