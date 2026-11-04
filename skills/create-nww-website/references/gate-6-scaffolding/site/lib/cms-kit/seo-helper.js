// skills/create-nww-website/references/gate-6-scaffolding/cms-kit/seo-helper.js: copy-ready CMS kit source. Do not edit site copies in place.

import { SiteConfig } from './site-config.js';

/**
 * Universal SEO metadata and structured data (JSON-LD) generator.
 * Builds complete OpenGraph, Twitter, and Schema.org objects with full field coverage.
 */
export class SEOHelper {
  /**
   * Generates a complete Next.js Metadata object with full OpenGraph and Twitter parity.
   *
   * @param {object} options
   * @param {string} options.title - Document and OpenGraph title
   * @param {string} [options.description=''] - Document and OpenGraph description
   * @param {string} [options.path='/'] - Relative route path (e.g. '/blog/my-post')
   * @param {string} [options.image] - Hero or OpenGraph preview image URL
   * @param {string} [options.type='website'] - OpenGraph type ('website' | 'article')
   * @param {string} [options.publishedTime] - ISO timestamp for article publication
   * @param {string} [options.modifiedTime] - ISO timestamp for article modification
   * @param {string[]} [options.authors=[]] - Article author names
   * @param {string[]} [options.tags=[]] - Article tags / keywords
   * @param {any[]} [options.parentImages=[]] - Inherited parent OpenGraph images
   * @returns {import('next').Metadata} Complete metadata object
   */
  static generateMetadata(options) {
    const {
      title,
      description = '',
      path = '/',
      image,
      type = 'website',
      publishedTime,
      modifiedTime,
      authors = [],
      tags = [],
      parentImages = [],
    } = options;

    const siteName = SiteConfig.getName();
    const baseUrl = SiteConfig.getUrl();
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const canonicalUrl = `${baseUrl}${cleanPath}`;
    const defaultImage = `${baseUrl}/assets/og-default.webp`;
    const resolvedImage = image
      ? (image.startsWith('http') ? image : `${baseUrl}${image.startsWith('/') ? image : `/${image}`}`)
      : defaultImage;

    const imageObjects = [
      { url: resolvedImage, width: 1200, height: 630, alt: title },
      ...parentImages,
    ];

    const metadata = {
      title,
      description,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName,
        type,
        images: imageObjects,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [resolvedImage],
      },
    };

    if (type === 'article') {
      if (publishedTime) metadata.openGraph.publishedTime = publishedTime;
      if (modifiedTime) metadata.openGraph.modifiedTime = modifiedTime;
      if (authors.length > 0) metadata.openGraph.authors = authors;
      if (tags.length > 0) metadata.openGraph.tags = tags;
    }

    return metadata;
  }

  /**
   * Serializes structured data into an HTML-safe JSON-LD payload.
   * Can accept either a raw schema object or a type name with options.
   * Escapes '<' as '\\u003c' to prevent script breakouts (XSS) in HTML parsers.
   *
   * @param {string|object} typeOrSchema - Schema.org type name or raw schema object
   * @param {object} [data={}] - Options used when typeOrSchema is a type string
   * @returns {{ __html: string, schema: object }} Object ready for dangerouslySetInnerHTML
   */
  static generateJSONLD(typeOrSchema, data = {}) {
    if (!typeOrSchema) return { __html: '{}', schema: {} };

    let schema;
    if (typeof typeOrSchema === 'string') {
      const k = typeOrSchema.toLowerCase();
      const builders = {
        article: () => SEOHelper.buildArticleSchema({ ...data, type: typeOrSchema }),
        blogposting: () => SEOHelper.buildArticleSchema({ ...data, type: typeOrSchema }),
        newsarticle: () => SEOHelper.buildArticleSchema({ ...data, type: typeOrSchema }),
        project: () => SEOHelper.buildProjectSchema(data),
        creativework: () => SEOHelper.buildProjectSchema(data),
        faq: () => SEOHelper.buildFAQSchema(data.faqs || data, data),
        faqpage: () => SEOHelper.buildFAQSchema(data.faqs || data, data),
        organization: () => SEOHelper.buildOrganizationSchema(data),
        localbusiness: () => SEOHelper.buildLocalBusinessSchema(data),
        website: () => SEOHelper.buildWebSiteSchema(data),
        breadcrumb: () => SEOHelper.buildBreadcrumbSchema(data.items || data, data),
        breadcrumblist: () => SEOHelper.buildBreadcrumbSchema(data.items || data, data),
        service: () => SEOHelper.buildServiceSchema(data),
        product: () => SEOHelper.buildProductSchema(data),
        review: () => SEOHelper.buildReviewSchema(data),
        testimonial: () => SEOHelper.buildReviewSchema(data),
        person: () => SEOHelper.buildPersonSchema(data),
      };
      schema = (builders[k] || (() => SEOHelper.buildWebPageSchema({ ...data, type: typeOrSchema })))();
    } else if (typeOrSchema && typeof typeOrSchema === 'object') {
      if (typeOrSchema['@context'] || typeOrSchema['@type']) schema = typeOrSchema;
      else if (typeOrSchema.type) return SEOHelper.generateJSONLD(typeOrSchema.type, typeOrSchema);
      else schema = { '@context': 'https://schema.org', ...typeOrSchema };
    } else {
      schema = {};
    }

    const cleanedSchema = JSON.parse(JSON.stringify(schema));
    return {
      __html: JSON.stringify(cleanedSchema).replace(/</g, '\\u003c'),
      schema: cleanedSchema,
    };
  }

  /**
   * Builds complete Schema.org Article / BlogPosting structured data.
   */
  static buildArticleSchema(data = {}) {
    const siteUrl = SiteConfig.getUrl();
    const siteName = SiteConfig.getName();
    const path = data.path || (data.slug ? `/blog/${data.slug}` : '/blog');
    const canonicalUrl = data.url || `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const defaultImage = `${siteUrl}/assets/og-default.webp`;
    const images = Array.isArray(data.image) ? data.image : [data.image || data.cover_image || defaultImage].filter(Boolean);
    const authorName = data.author?.name || data.author_name || (typeof data.author === 'string' ? data.author : 'Editorial Team');

    return {
      '@context': 'https://schema.org',
      '@type': data.type || 'BlogPosting',
      headline: data.title || data.headline || '',
      alternativeHeadline: data.alternativeHeadline,
      description: data.summary || data.description || data.metaDescription || '',
      image: images,
      datePublished: data.postedAt || data.datePublished || data.createdAt,
      dateModified: data.lastUpdatedAt || data.updatedAt || data.dateModified || data.postedAt || data.createdAt,
      author: {
        '@type': 'Person',
        name: authorName,
        url: data.author?.url || `${siteUrl}/about`,
        ...(data.author?.image ? { image: data.author.image } : {}),
        ...(data.author?.jobTitle ? { jobTitle: data.author.jobTitle } : {}),
      },
      publisher: {
        '@type': 'Organization',
        name: siteName,
        url: siteUrl,
        logo: { '@type': 'ImageObject', url: data.publisherLogo || `${siteUrl}/assets/logo.png` },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
      url: canonicalUrl,
      articleSection: data.metadata?.category || data.category || data.articleSection,
      keywords: Array.isArray(data.metadata?.tags || data.tags) ? (data.metadata?.tags || data.tags).join(', ') : (data.tags || data.keywords),
      articleBody: data.content ? String(data.content).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 5000) : undefined,
      wordCount: data.content ? String(data.content).replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length : undefined,
      inLanguage: data.inLanguage || 'en-US',
      isAccessibleForFree: data.isAccessibleForFree !== false,
      copyrightYear: new Date(data.postedAt || data.createdAt || Date.now()).getFullYear(),
    };
  }

  /**
   * Builds complete Schema.org CreativeWork / Project structured data.
   */
  static buildProjectSchema(data = {}) {
    const siteUrl = SiteConfig.getUrl();
    const siteName = SiteConfig.getName();
    const path = data.path || (data.slug ? `/projects/${data.slug}` : '/projects');
    const canonicalUrl = data.url || `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const defaultImage = `${siteUrl}/assets/project-default.webp`;
    const images = Array.isArray(data.image) ? data.image : [data.cover_image || data.image || defaultImage].filter(Boolean);

    return {
      '@context': 'https://schema.org',
      '@type': data.type || 'CreativeWork',
      name: data.title || data.name || '',
      headline: data.title || data.headline || '',
      description: data.summary || data.description || data.metaDescription || '',
      image: images,
      dateCreated: data.year ? String(data.year) : undefined,
      datePublished: data.postedAt || data.datePublished || data.createdAt,
      dateModified: data.updatedAt || data.lastUpdatedAt || data.postedAt || data.createdAt,
      author: { '@type': 'Organization', name: data.client || siteName },
      creator: { '@type': 'Organization', name: siteName, url: siteUrl },
      publisher: { '@type': 'Organization', name: siteName, url: siteUrl },
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
      url: canonicalUrl,
      genre: data.metadata?.category || data.category || 'Case Study',
      keywords: Array.isArray(data.metadata?.technologies || data.technologies || data.tags)
        ? (data.metadata?.technologies || data.technologies || data.tags).join(', ')
        : (data.technologies || data.tags),
      inLanguage: data.inLanguage || 'en-US',
    };
  }

  /**
   * Builds complete Schema.org FAQPage structured data.
   */
  static buildFAQSchema(faqs = [], data = {}) {
    const items = Array.isArray(faqs) ? faqs : (data.faqs || []);
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: items.map((faq) => ({
        '@type': 'Question',
        name: faq.question || faq.title || faq.name || '',
        acceptedAnswer: { '@type': 'Answer', text: faq.answer || faq.content || faq.text || '' },
      })),
    };
  }

  /**
   * Builds complete Schema.org Organization structured data.
   */
  static buildOrganizationSchema(data = {}) {
    const siteUrl = SiteConfig.getUrl();
    const siteName = SiteConfig.getName();
    return {
      '@context': 'https://schema.org',
      '@type': data.type || 'Organization',
      name: data.name || siteName,
      legalName: data.legalName,
      url: data.url || siteUrl,
      logo: data.logo ? { '@type': 'ImageObject', url: data.logo } : `${siteUrl}/assets/logo.png`,
      image: data.image || `${siteUrl}/assets/og-default.webp`,
      description: data.description,
      email: data.email,
      telephone: data.phone || data.telephone,
      address: data.address ? {
        '@type': 'PostalAddress',
        streetAddress: data.address.street || data.address.streetAddress,
        addressLocality: data.address.city || data.address.addressLocality,
        addressRegion: data.address.state || data.address.addressRegion,
        postalCode: data.address.zip || data.address.postalCode,
        addressCountry: data.address.country || data.address.addressCountry,
      } : undefined,
      sameAs: Array.isArray(data.sameAs || data.socials) ? (data.sameAs || data.socials) : undefined,
      contactPoint: (data.phone || data.email) ? {
        '@type': 'ContactPoint',
        telephone: data.phone || data.telephone,
        email: data.email,
        contactType: data.contactType || 'customer support',
        availableLanguage: data.availableLanguage || ['English'],
      } : undefined,
    };
  }

  /**
   * Builds complete Schema.org LocalBusiness structured data.
   */
  static buildLocalBusinessSchema(data = {}) {
    const org = SEOHelper.buildOrganizationSchema({ ...data, type: data.type || 'LocalBusiness' });
    return {
      ...org,
      priceRange: data.priceRange || '$$',
      geo: data.geo ? {
        '@type': 'GeoCoordinates',
        latitude: data.geo.latitude || data.geo.lat,
        longitude: data.geo.longitude || data.geo.lng,
      } : undefined,
      openingHoursSpecification: Array.isArray(data.openingHours) ? data.openingHours.map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: h.dayOfWeek || h.days,
        opens: h.opens,
        closes: h.closes,
      })) : undefined,
    };
  }

  /**
   * Builds complete Schema.org WebSite structured data.
   */
  static buildWebSiteSchema(data = {}) {
    const siteUrl = SiteConfig.getUrl();
    const siteName = SiteConfig.getName();
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: data.name || siteName,
      url: data.url || siteUrl,
      description: data.description,
      publisher: { '@type': 'Organization', name: siteName, url: siteUrl },
      potentialAction: data.searchUrl ? {
        '@type': 'SearchAction',
        target: `${data.searchUrl}{search_term_string}`,
        'query-input': 'required name=search_term_string',
      } : undefined,
      inLanguage: data.inLanguage || 'en-US',
    };
  }

  /**
   * Builds complete Schema.org WebPage structured data.
   */
  static buildWebPageSchema(data = {}) {
    const siteUrl = SiteConfig.getUrl();
    const siteName = SiteConfig.getName();
    const path = data.path || (data.slug ? (data.slug === 'home' ? '/' : `/${data.slug}`) : '/');
    const canonicalUrl = data.url || `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
    return {
      '@context': 'https://schema.org',
      '@type': data.type || 'WebPage',
      name: data.title || data.name || 'Page',
      headline: data.headline || data.title,
      description: data.description || data.metaDescription,
      url: canonicalUrl,
      isPartOf: { '@type': 'WebSite', name: siteName, url: siteUrl },
      primaryImageOfPage: data.image ? { '@type': 'ImageObject', url: data.image } : undefined,
      inLanguage: data.inLanguage || 'en-US',
    };
  }

  /**
   * Builds complete Schema.org BreadcrumbList structured data.
   */
  static buildBreadcrumbSchema(items = []) {
    const siteUrl = SiteConfig.getUrl();
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: (Array.isArray(items) ? items : []).map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name || item.title || '',
        item: item.url ? (item.url.startsWith('http') ? item.url : `${siteUrl}${item.url.startsWith('/') ? item.url : `/${item.url}`}`) : undefined,
      })),
    };
  }

  /**
   * Builds complete Schema.org Service structured data.
   */
  static buildServiceSchema(data = {}) {
    const siteUrl = SiteConfig.getUrl();
    const siteName = SiteConfig.getName();
    const path = data.path || (data.slug ? `/services/${data.slug}` : '/services');
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: data.title || data.name || '',
      serviceType: data.serviceType || data.category || 'Professional Service',
      description: data.description || data.summary || '',
      provider: { '@type': 'Organization', name: siteName, url: siteUrl },
      areaServed: data.areaServed || 'Worldwide',
      url: data.url || `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`,
      image: data.image || data.cover_image,
      offers: data.price ? { '@type': 'Offer', price: data.price, priceCurrency: data.priceCurrency || 'USD' } : undefined,
    };
  }

  /**
   * Builds complete Schema.org Product structured data.
   */
  static buildProductSchema(data = {}) {
    const siteUrl = SiteConfig.getUrl();
    const siteName = SiteConfig.getName();
    const path = data.path || (data.slug ? `/products/${data.slug}` : '/products');
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: data.title || data.name || '',
      description: data.description || data.summary,
      image: data.image || data.cover_image,
      sku: data.sku,
      brand: { '@type': 'Brand', name: data.brand || siteName },
      offers: data.price ? {
        '@type': 'Offer',
        price: data.price,
        priceCurrency: data.priceCurrency || 'USD',
        availability: data.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: data.url || `${siteUrl}${path.startsWith('/') ? path : `/${path}`}`,
      } : undefined,
    };
  }

  /**
   * Builds complete Schema.org Review structured data.
   */
  static buildReviewSchema(data = {}) {
    const siteUrl = SiteConfig.getUrl();
    const siteName = SiteConfig.getName();
    return {
      '@context': 'https://schema.org',
      '@type': 'Review',
      author: { '@type': 'Person', name: data.author || data.name || 'Client' },
      reviewBody: data.content || data.quote || data.message || '',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: data.rating || data.ratingValue || 5,
        bestRating: 5,
        worstRating: 1,
      },
      itemReviewed: { '@type': 'Organization', name: siteName, url: siteUrl },
      datePublished: data.postedAt || data.createdAt || data.datePublished,
    };
  }

  /**
   * Builds complete Schema.org Person structured data.
   */
  static buildPersonSchema(data = {}) {
    const siteUrl = SiteConfig.getUrl();
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: data.name || '',
      jobTitle: data.jobTitle || data.role,
      image: data.image || data.avatar,
      url: data.url || (data.slug ? `${siteUrl}/team/${data.slug}` : undefined),
      sameAs: Array.isArray(data.sameAs) ? data.sameAs : undefined,
    };
  }
}
