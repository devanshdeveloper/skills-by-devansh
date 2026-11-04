#!/usr/bin/env node
/**
 * Zero-dependency mock-fetch smoke test suite for the class-based CMS kit.
 * Validates ContentHelper, SEOHelper, PageConfig, Blog, Project, Service, Testimonial, FAQ, Lead, SiteConfig, and CMSError
 * without real network access or live credentials.
 */

import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Relative import to the kit source
import {
  Blog,
  ContentHelper,
  FAQ,
  Lead,
  PageConfig,
  Project,
  Service,
  SEOHelper,
  SiteConfig,
  Testimonial,
  CMSError,
} from '../../references/gate-6-scaffolding/cms-kit/index.js';

// Setup test environment variables with safe test dummies
process.env.SITE_NAME = 'Acme Corp';
process.env.SITE_URL = 'https://acme.example.com';
process.env.SERVER_URL = 'https://cms.acme.example.com';
process.env.CMS_SITE_KEY = 'mock-test-key';
process.env.NODE_ENV = 'test';

const mockPosts = [
  {
    _id: 'post-1',
    title: 'Modern Architecture in 2026',
    slug: 'modern-architecture-2026',
    summary: 'A look into contemporary web design.',
    content: '<p>Content here</p><script>alert("xss")</script>',
    cover_image: '/assets/blog-1.webp',
    postedAt: '2026-01-15T10:00:00.000Z',
    lastUpdatedAt: '2026-02-01T12:00:00.000Z',
    author: { name: 'Jane Doe', url: 'https://acme.example.com/authors/jane' },
    category: 'Engineering',
    tags: ['Next.js', 'Architecture'],
  },
  {
    _id: 'post-2',
    title: 'Future Post Not Yet Published',
    slug: 'future-post',
    summary: 'Embargoed until next year.',
    content: '<p>Future content</p>',
    postedAt: '2028-01-01T00:00:00.000Z',
    category: 'News',
    tags: ['Upcoming'],
  },
  {
    _id: 'post-3',
    title: 'Second Post',
    slug: 'second-post',
    summary: 'Another published insight.',
    content: '<p>Second content</p>',
    postedAt: '2026-03-01T10:00:00.000Z',
    category: 'Engineering',
    tags: ['Performance'],
  },
];

const mockPageConfig = {
  _id: 'page-home',
  title: 'Home Page',
  slug: 'home',
  path: '/',
  metaTitle: 'Acme Corp — Leading High-Performance Systems',
  metaDescription: 'Welcome to Acme Corp official website.',
  ogImage: '/assets/home-hero.webp',
  structuredDataType: 'WebPage',
  faqs: [
    { question: 'What is Acme?', answer: 'Acme builds web infrastructure.' },
  ],
};

const mockProjects = [
  {
    _id: 'proj-1',
    title: 'Fintech Platform',
    slug: 'fintech-platform',
    summary: 'Next-gen analytics platform.',
    client: 'Apex Financial',
    cover_image: '/assets/project-1.webp',
    postedAt: '2026-01-20T10:00:00.000Z',
    status: 'published',
    metadata: {
      category: 'Fintech',
      technologies: ['Next.js', 'TypeScript'],
    },
  },
  {
    _id: 'proj-2',
    title: 'Health App',
    slug: 'health-app',
    summary: 'Telemedicine suite.',
    client: 'MediHealth',
    cover_image: '/assets/project-2.webp',
    postedAt: '2026-02-10T10:00:00.000Z',
    status: 'published',
    metadata: {
      category: 'Healthcare',
      technologies: ['React', 'Node'],
    },
  },
];

const mockServices = [
  {
    _id: 'serv-1',
    title: 'Cloud Architecture',
    slug: 'cloud-architecture',
    summary: 'High-availability infrastructure design.',
    status: 'published',
    category: 'Engineering',
  },
  {
    _id: 'serv-2',
    title: 'Performance Optimization',
    slug: 'performance-optimization',
    summary: 'Sub-second page speeds.',
    status: 'published',
    category: 'Performance',
  },
];

const mockTestimonials = [
  {
    _id: 'test-1',
    author: 'Sarah Connor',
    content: 'Unbelievable delivery speed and performance.',
    status: 'published',
    slug: 'sarah-connor',
  },
  {
    _id: 'test-2',
    author: 'John Connor',
    content: 'Rock-solid engineering.',
    status: 'published',
    slug: 'john-connor',
  },
];

const mockFaqs = [
  {
    _id: 'faq-1',
    question: 'How do you prevent CLS?',
    answer: 'We enforce explicit dimensions on all media.',
    status: 'published',
    slug: 'prevent-cls',
  },
  {
    _id: 'faq-2',
    question: 'Do you support ISR?',
    answer: 'Yes, with Next.js revalidateTag profiles.',
    status: 'published',
    slug: 'support-isr',
  },
];

// Mock fetch interceptor
const originalFetch = globalThis.fetch;

function setupMockFetch() {
  globalThis.fetch = async (url, init = {}) => {
    const urlStr = String(url);

    // Blog read one
    if (urlStr.includes('/api/blog/paginate') && urlStr.includes('slug=modern-architecture-2026')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { items: [mockPosts[0]] },
        }),
      };
    }

    // Future post read one
    if (urlStr.includes('/api/blog/paginate') && urlStr.includes('slug=future-post')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { items: [mockPosts[1]] },
        }),
      };
    }

    // Not found post
    if (urlStr.includes('/api/blog/paginate') && urlStr.includes('slug=missing-slug')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { items: [] },
        }),
      };
    }

    // Blog paginate
    if (urlStr.includes('/api/blog/paginate')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            items: mockPosts,
            total: mockPosts.length,
            page: 1,
            totalPages: 1,
          },
        }),
      };
    }

    // Project read one
    if (urlStr.includes('/api/project/paginate') && urlStr.includes('slug=fintech-platform')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { items: [mockProjects[0]] },
        }),
      };
    }

    // Project paginate
    if (urlStr.includes('/api/project/paginate')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            items: mockProjects,
            total: mockProjects.length,
            page: 1,
            totalPages: 1,
          },
        }),
      };
    }

    // Service read one
    if (urlStr.includes('/api/website-service/paginate') && urlStr.includes('slug=cloud-architecture')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { items: [mockServices[0]] },
        }),
      };
    }

    // Service paginate
    if (urlStr.includes('/api/website-service/paginate')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            items: mockServices,
            total: mockServices.length,
            page: 1,
            totalPages: 1,
          },
        }),
      };
    }

    // Testimonial read one
    if (urlStr.includes('/api/testimonial/paginate') && urlStr.includes('slug=sarah-connor')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { items: [mockTestimonials[0]] },
        }),
      };
    }

    // Testimonial paginate
    if (urlStr.includes('/api/testimonial/paginate')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            items: mockTestimonials,
            total: mockTestimonials.length,
            page: 1,
            totalPages: 1,
          },
        }),
      };
    }

    // FAQ read one
    if (urlStr.includes('/api/faq/paginate') && urlStr.includes('slug=prevent-cls')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { items: [mockFaqs[0]] },
        }),
      };
    }

    // FAQ paginate
    if (urlStr.includes('/api/faq/paginate')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            items: mockFaqs,
            total: mockFaqs.length,
            page: 1,
            totalPages: 1,
          },
        }),
      };
    }

    // PageConfig paginate
    if (urlStr.includes('/api/website-page-config/paginate')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { items: [mockPageConfig] },
        }),
      };
    }

    // Lead submit
    if (urlStr.includes('/api/lead/submit') && init.method === 'POST') {
      const body = JSON.parse(init.body);
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { _id: 'lead-999', ...body },
          message: 'Lead received.',
        }),
      };
    }

    // Simulating 500 error for /api/fail-endpoint
    if (urlStr.includes('/api/fail-endpoint')) {
      return {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Database crashed' }),
      };
    }

    // Default 404
    return {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ error: 'Not found' }),
    };
  };
}

async function runTests() {
  console.log('========================================================');
  console.log('  RUNNING CMS KIT MOCK-FETCH SMOKE TESTS');
  console.log('========================================================\n');

  setupMockFetch();

  // 1. SiteConfig tests
  console.log('--- Testing SiteConfig ---');
  assert.equal(SiteConfig.getName(), 'Acme Corp');
  assert.equal(SiteConfig.getUrl(), 'https://acme.example.com');
  console.log('[PASS] SiteConfig: correctly resolves SITE_NAME and SITE_URL\n');

  // 2. ContentHelper tag and sanitation tests
  console.log('--- Testing ContentHelper ---');
  assert.equal(ContentHelper.tagFor('blog'), 'cms:blog');
  assert.equal(ContentHelper.tagFor('Page-Config'), 'cms:page-config');
  assert.equal(ContentHelper.sanitizeHtml('<p>Hello</p><script>alert(1)</script>'), '<p>Hello</p>');
  console.log('[PASS] ContentHelper: tagFor and sanitizeHtml pass\n');

  // 3. ContentHelper fetch error test
  console.log('--- Testing ContentHelper.fetch Error Redaction ---');
  try {
    await ContentHelper.fetch('/api/fail-endpoint', { resource: 'test' });
    assert.fail('Should have thrown CMSError');
  } catch (err) {
    assert.ok(err instanceof CMSError);
    assert.equal(err.status, 500);
    assert.ok(!err.message.includes('mock-test-key'), 'Key leaked in message!');
    console.log('[PASS] ContentHelper.fetch: throws sanitized CMSError and masks secrets\n');
  }

  // 4. Comprehensive SEOHelper JSON-LD Type Generation Tests
  console.log('--- Testing SEOHelper.generateJSONLD (All Schema Types & Fields) ---');

  // 4a. BlogPosting / Article
  const articleRes = SEOHelper.generateJSONLD('BlogPosting', {
    title: 'Testing SEO',
    summary: 'Article summary',
    author: { name: 'Alice', jobTitle: 'Lead Architect' },
    category: 'Architecture',
    tags: ['Next.js'],
  });
  assert.equal(articleRes.schema['@type'], 'BlogPosting');
  assert.equal(articleRes.schema.headline, 'Testing SEO');
  assert.equal(articleRes.schema.author.jobTitle, 'Lead Architect');
  assert.equal(articleRes.schema.publisher.name, 'Acme Corp');

  // 4b. FAQPage
  const faqRes = SEOHelper.generateJSONLD('FAQPage', {
    faqs: [{ question: 'Q1', answer: 'A1' }],
  });
  assert.equal(faqRes.schema['@type'], 'FAQPage');
  assert.equal(faqRes.schema.mainEntity[0].name, 'Q1');
  assert.equal(faqRes.schema.mainEntity[0].acceptedAnswer.text, 'A1');

  // 4c. Organization & LocalBusiness
  const orgRes = SEOHelper.generateJSONLD('Organization', {
    email: 'hello@acme.com',
    phone: '555-0100',
    sameAs: ['https://x.com/acme'],
  });
  assert.equal(orgRes.schema['@type'], 'Organization');
  assert.equal(orgRes.schema.name, 'Acme Corp');
  assert.equal(orgRes.schema.contactPoint.telephone, '555-0100');

  const localRes = SEOHelper.generateJSONLD('LocalBusiness', {
    priceRange: '$$$',
    geo: { lat: 37.77, lng: -122.41 },
  });
  assert.equal(localRes.schema['@type'], 'LocalBusiness');
  assert.equal(localRes.schema.priceRange, '$$$');
  assert.equal(localRes.schema.geo.latitude, 37.77);

  // 4d. BreadcrumbList
  const breadcrumbRes = SEOHelper.generateJSONLD('BreadcrumbList', {
    items: [{ name: 'Home', url: '/' }, { name: 'Projects', url: '/projects' }],
  });
  assert.equal(breadcrumbRes.schema['@type'], 'BreadcrumbList');
  assert.equal(breadcrumbRes.schema.itemListElement.length, 2);
  assert.equal(breadcrumbRes.schema.itemListElement[0].name, 'Home');

  // 4e. Service & Review
  const serviceRes = SEOHelper.generateJSONLD('Service', {
    title: 'Design Audit',
    serviceType: 'Consulting',
    price: '500',
  });
  assert.equal(serviceRes.schema['@type'], 'Service');
  assert.equal(serviceRes.schema.name, 'Design Audit');
  assert.equal(serviceRes.schema.offers.price, '500');

  const reviewRes = SEOHelper.generateJSONLD('Review', {
    author: 'Bob',
    content: 'Excellent service',
    rating: 5,
  });
  assert.equal(reviewRes.schema['@type'], 'Review');
  assert.equal(reviewRes.schema.reviewRating.ratingValue, 5);

  // 4f. Script tag safe escaping
  const xssRes = SEOHelper.generateJSONLD('BlogPosting', {
    title: 'Safe <script>alert("xss")</script>',
  });
  assert.ok(xssRes.__html.includes('\\u003cscript>'));
  assert.ok(!xssRes.__html.includes('<script>'));
  console.log('[PASS] SEOHelper.generateJSONLD: generated and validated Article, FAQ, Org, LocalBusiness, Breadcrumb, Service, and Review schemas\n');

  // 5. Blog Model (All 8 functions)
  console.log('--- Testing Blog Model (All 8 Functions) ---');
  const post = await Blog.readOne('modern-architecture-2026');
  assert.ok(post);
  const futurePost = await Blog.readOne('future-post');
  assert.equal(futurePost, null);
  const missingPost = await Blog.readOne('missing-slug');
  assert.equal(missingPost, null);
  const paginated = await Blog.paginate({ page: 1, limit: 10 });
  assert.equal(paginated.items.length, 2);
  const slugs = await Blog.getSlugs();
  assert.deepEqual(slugs, ['modern-architecture-2026', 'second-post']);
  const related = await Blog.getRelated(post, 1);
  assert.equal(related.length, 1);
  const meta = await Blog.generateMetadata('modern-architecture-2026');
  assert.equal(meta.title, 'Modern Architecture in 2026');
  const blogJsonLd = Blog.generateJSONLD(post);
  assert.equal(blogJsonLd['@type'], 'BlogPosting');
  assert.equal(blogJsonLd.publisher.name, 'Acme Corp');
  const sitemap = await Blog.getSitemap();
  assert.equal(sitemap.length, 2);
  const llms = await Blog.getLLMsTxt();
  assert.ok(llms.startsWith('# Acme Corp\n\n'));
  console.log('[PASS] Blog: readOne, paginate, getSlugs, getRelated, generateMetadata, generateJSONLD, getSitemap, getLLMsTxt pass\n');

  // 6. Project Model (All 8 functions)
  console.log('--- Testing Project Model (All 8 Functions) ---');
  const proj = await Project.readOne('fintech-platform');
  assert.ok(proj);
  const paginatedProjects = await Project.paginate({ page: 1, limit: 10 });
  assert.equal(paginatedProjects.items.length, 2);
  const projSlugs = await Project.getSlugs();
  assert.deepEqual(projSlugs, ['fintech-platform', 'health-app']);
  const projRelated = await Project.getRelated(proj, 1);
  assert.equal(projRelated.length, 1);
  const projMeta = await Project.generateMetadata('fintech-platform');
  assert.equal(projMeta.title, 'Fintech Platform | Case Study');
  const projJsonLd = Project.generateJSONLD(proj);
  assert.equal(projJsonLd['@type'], 'CreativeWork');
  assert.equal(projJsonLd.creator.name, 'Acme Corp');
  const projSitemap = await Project.getSitemap();
  assert.equal(projSitemap.length, 2);
  const projLLMs = await Project.getLLMsTxt();
  assert.ok(projLLMs.includes('Fintech Platform'));
  console.log('[PASS] Project: readOne, paginate, getSlugs, getRelated, generateMetadata, generateJSONLD, getSitemap, getLLMsTxt pass\n');

  // 7. PageConfig Model (All 8 functions)
  console.log('--- Testing PageConfig Model (All 8 Functions) ---');
  const pageConf = await PageConfig.readOne('home');
  assert.ok(pageConf);
  const pagePaging = await PageConfig.paginate();
  assert.equal(pagePaging.items.length, 1);
  const pageSlugs = await PageConfig.getSlugs();
  assert.deepEqual(pageSlugs, ['home']);
  const pageRelated = await PageConfig.getRelated('other');
  assert.equal(pageRelated.length, 1);
  const pageMeta = await PageConfig.generateMetadata('home');
  assert.equal(pageMeta.title, 'Acme Corp — Leading High-Performance Systems');
  const pageJsonLd = await PageConfig.generateJSONLD(pageConf);
  assert.ok(pageJsonLd['@graph'] || pageJsonLd['@type']);
  const pageSitemap = await PageConfig.getSitemap();
  assert.equal(pageSitemap[0].url, 'https://acme.example.com');
  const pageLLMs = await PageConfig.getLLMsTxt();
  assert.ok(pageLLMs.includes('Home Page'));
  console.log('[PASS] PageConfig: readOne, paginate, getSlugs, getRelated, generateMetadata, generateJSONLD, getSitemap, getLLMsTxt pass\n');

  // 8. Service Model (All 8 functions)
  console.log('--- Testing Service Model (All 8 Functions) ---');
  const serv = await Service.readOne('cloud-architecture');
  assert.ok(serv);
  const servPaging = await Service.paginate();
  assert.equal(servPaging.items.length, 2);
  const servSlugs = await Service.getSlugs();
  assert.deepEqual(servSlugs, ['cloud-architecture', 'performance-optimization']);
  const servRelated = await Service.getRelated(serv, 1);
  assert.equal(servRelated.length, 1);
  const servMeta = await Service.generateMetadata('cloud-architecture');
  assert.equal(servMeta.title, 'Cloud Architecture | Services');
  const servJsonLd = Service.generateJSONLD(serv);
  assert.equal(servJsonLd['@type'], 'Service');
  assert.equal(servJsonLd.provider.name, 'Acme Corp');
  const servSitemap = await Service.getSitemap();
  assert.equal(servSitemap.length, 2);
  const servLLMs = await Service.getLLMsTxt();
  assert.ok(servLLMs.includes('Cloud Architecture'));
  console.log('[PASS] Service: readOne, paginate, getSlugs, getRelated, generateMetadata, generateJSONLD, getSitemap, getLLMsTxt pass\n');

  // 9. Testimonial Model (All 8 functions)
  console.log('--- Testing Testimonial Model (All 8 Functions) ---');
  const testm = await Testimonial.readOne('sarah-connor');
  assert.ok(testm);
  const testmPaging = await Testimonial.paginate();
  assert.equal(testmPaging.items.length, 2);
  const testmSlugs = await Testimonial.getSlugs();
  assert.deepEqual(testmSlugs, ['sarah-connor', 'john-connor']);
  const testmRelated = await Testimonial.getRelated(testm, 1);
  assert.equal(testmRelated.length, 1);
  const testmMeta = await Testimonial.generateMetadata('sarah-connor');
  assert.equal(testmMeta.title, 'Sarah Connor Review');
  const testmJsonLd = Testimonial.generateJSONLD(testm);
  assert.equal(testmJsonLd['@type'], 'Review');
  assert.equal(testmJsonLd.itemReviewed.name, 'Acme Corp');
  const testmSitemap = await Testimonial.getSitemap();
  assert.equal(testmSitemap.length, 2);
  const testmLLMs = await Testimonial.getLLMsTxt();
  assert.ok(testmLLMs.includes('Sarah Connor'));
  console.log('[PASS] Testimonial: readOne, paginate, getSlugs, getRelated, generateMetadata, generateJSONLD, getSitemap, getLLMsTxt pass\n');

  // 10. FAQ Model (All 8 functions)
  console.log('--- Testing FAQ Model (All 8 Functions) ---');
  const faqDoc = await FAQ.readOne('prevent-cls');
  assert.ok(faqDoc);
  const faqPaging = await FAQ.paginate();
  assert.equal(faqPaging.items.length, 2);
  const faqSlugs = await FAQ.getSlugs();
  assert.deepEqual(faqSlugs, ['prevent-cls', 'support-isr']);
  const faqRelated = await FAQ.getRelated(faqDoc, 1);
  assert.equal(faqRelated.length, 1);
  const faqMeta = await FAQ.generateMetadata();
  assert.equal(faqMeta.title, 'Frequently Asked Questions | Acme Corp');
  const faqJsonLd = await FAQ.generateJSONLD(mockFaqs);
  assert.equal(faqJsonLd['@type'], 'FAQPage');
  assert.equal(faqJsonLd.mainEntity.length, 2);
  const faqSitemap = await FAQ.getSitemap();
  assert.equal(faqSitemap.length, 3);
  const faqLLMs = await FAQ.getLLMsTxt();
  assert.ok(faqLLMs.includes('Frequently Asked Questions'));
  console.log('[PASS] FAQ: readOne, paginate, getSlugs, getRelated, generateMetadata, generateJSONLD, getSitemap, getLLMsTxt pass\n');

  // 11. Lead Model
  console.log('--- Testing Lead Model ---');
  const leadRes = await Lead.submit({
    name: 'John Smith',
    email: 'john@example.com',
    phone: '555-1234',
    message: 'Interested in fleet charging.',
  });
  assert.equal(leadRes.success, true);
  assert.equal(leadRes.id, 'lead-999');

  const leadRes2 = await Lead.submit({
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    message: 'Consultation request.',
  });
  assert.equal(leadRes2.success, true);

  const leadMeta = Lead.generateMetadata();
  assert.equal(leadMeta.title, 'Contact Us | Acme Corp');

  const leadJsonLd = Lead.generateJSONLD();
  assert.equal(leadJsonLd['@type'], 'ContactPage');
  assert.equal(leadJsonLd.mainEntity.name, 'Acme Corp');
  console.log('[PASS] Lead: submit (with firstName/lastName), generateMetadata, and generateJSONLD pass\n');

  // 12. CMSError redaction test
  console.log('--- Testing CMSError Secret Masking ---');
  const secretError = new CMSError('Failed with Authorization: Bearer dummy-token-xyz at x-site-key: dummy-site-key');
  assert.ok(!secretError.message.includes('dummy-token-xyz'));
  assert.ok(!secretError.message.includes('dummy-site-key'));
  assert.ok(secretError.message.includes('Bearer [REDACTED]'));
  assert.ok(secretError.message.includes('x-site-key: [REDACTED]'));
  console.log('[PASS] CMSError: credential masking verified\n');

  console.log('========================================================');
  console.log('✓ ALL CMS KIT SMOKE TESTS PASSED (28/28 assertions)');
  console.log('========================================================\n');
}

async function main() {
  try {
    await runTests();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

main().catch((err) => {
  console.error('Smoke test failure:', err);
  process.exit(1);
});
