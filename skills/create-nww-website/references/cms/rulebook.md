# NWW CMS Architecture & Directory Index

This reference serves as the master directory index for the NWW CMS integration architecture. It defines the drop-in library modules copied during **Stage 6 Scaffolding**, the standalone CLI seeders used during **Stage 5 Batch 4**, and the authoritative model runbooks.

---

## 1. Class-Based Library (`cms-kit/`) -> Next.js Copy Instructions

During **Stage 6 Scaffolding (Step 5)**, copy `skills/create-nww-website/references/gate-6-scaffolding/cms-kit/` directly into `site/lib/cms/`:

```bash
cp -r skills/create-nww-website/references/gate-6-scaffolding/cms-kit/* site/lib/cms/
```

### Module Inventory (`site/lib/cms/`)
- `site-config.js` — Single source of truth for site identity (`SiteConfig.getName()`) and origin domain resolution (`SiteConfig.getUrl()`). Reads canonical `SITE_NAME`.
- `content-helper.js` — Low-level HTTP data access layer (`ContentHelper.fetch`, `ContentHelper.tagFor`, `ContentHelper.sanitizeHtml`). Injects Bearer token, attaches Next.js cache tags, and wraps network errors.
- `error.js` — Sanitized error subclass (`CMSError`) stripping secret tokens and keys from error messages and traces.
- `seo-helper.js` — Universal SEO metadata (`SEOHelper.generateMetadata`) and structured data (`SEOHelper.generateJSONLD`) with safe `\u003c` escaping.
- `page-config.js` — Pure page-level configuration model (`PageConfig.readOne`, `PageConfig.paginate`, `PageConfig.getSlugs`, `PageConfig.getRelated`, `PageConfig.generateMetadata`, `PageConfig.generateJSONLD`, `PageConfig.getSitemap`, `PageConfig.getLLMsTxt`).
- `blog.js` — Blog model helper (`Blog.readOne`, `Blog.paginate`, `Blog.getSlugs`, `Blog.getRelated`, `Blog.generateMetadata`, `Blog.generateJSONLD`, `Blog.getSitemap`, `Blog.getLLMsTxt`).
- `project.js` — Project (Portfolio) model helper (`Project.readOne`, `Project.paginate`, `Project.getSlugs`, `Project.getRelated`, `Project.generateMetadata`, `Project.generateJSONLD`, `Project.getSitemap`, `Project.getLLMsTxt`).
- `service.js` — Service model helper (`Service.readOne`, `Service.paginate`, `Service.getSlugs`, `Service.getRelated`, `Service.generateMetadata`, `Service.generateJSONLD`, `Service.getSitemap`, `Service.getLLMsTxt`).
- `testimonial.js` — Testimonial model helper (`Testimonial.readOne`, `Testimonial.paginate`, `Testimonial.getSlugs`, `Testimonial.getRelated`, `Testimonial.generateMetadata`, `Testimonial.generateJSONLD`, `Testimonial.getSitemap`, `Testimonial.getLLMsTxt`).
- `faq.js` — FAQ model helper (`FAQ.readOne`, `FAQ.paginate`, `FAQ.getSlugs`, `FAQ.getRelated`, `FAQ.generateMetadata`, `FAQ.generateJSONLD`, `FAQ.getSitemap`, `FAQ.getLLMsTxt`).
- `contact-us.js` — Contact inquiry model helper (`ContactUs.submit`, `ContactUs.generateMetadata`, `ContactUs.generateJSONLD`).
- `lead.js` — Legacy lead capture helper (`Lead.submit`, `Lead.generateMetadata`, `Lead.generateJSONLD`).
- `tool.js` — Interactive tool helper (`Tool.readOne`, `Tool.paginate`, `Tool.getSlugs`, `Tool.getRelated`, `Tool.generateMetadata`, `Tool.generateJSONLD`, `Tool.getSitemap`, `Tool.getLLMsTxt`).
- `tool-category.js` — Tool category taxonomy helper (`ToolCategory.readOne`, `ToolCategory.paginate`, `ToolCategory.getSlugs`, `ToolCategory.generateMetadata`, `ToolCategory.generateJSONLD`, `ToolCategory.getSitemap`, `ToolCategory.getLLMsTxt`).
- `case-study.js` — Case study helper (`CaseStudy.readOne`, `CaseStudy.paginate`, `CaseStudy.getSlugs`, `CaseStudy.generateMetadata`, `CaseStudy.generateJSONLD`, `CaseStudy.getSitemap`, `CaseStudy.getLLMsTxt`).
- `feature.js` — Platform features helper (`Feature.paginate`, `Feature.getAll`).
- `job.js` — Careers & job openings helper (`Job.readOne`, `Job.paginate`, `Job.getSlugs`, `Job.generateMetadata`, `Job.generateJSONLD`, `Job.getSitemap`).
- `event.js` — Events & webinars helper (`Event.readOne`, `Event.paginate`, `Event.getSlugs`, `Event.generateMetadata`, `Event.generateJSONLD`, `Event.getSitemap`).
- `plan.js` — Subscription pricing tiers helper (`Plan.paginate`, `Plan.getAll`).
- `gallery.js` — Visual media albums helper (`Gallery.readOne`, `Gallery.paginate`, `Gallery.getSlugs`, `Gallery.generateMetadata`, `Gallery.getSitemap`).
- `article.js` — Editorial articles helper (`Article.readOne`, `Article.paginate`, `Article.getSlugs`, `Article.generateMetadata`, `Article.generateJSONLD`, `Article.getSitemap`).
- `industry.js` — Industry solution vertical helper (`Industry.readOne`, `Industry.paginate`, `Industry.getSlugs`, `Industry.generateMetadata`, `Industry.generateJSONLD`, `Industry.getSitemap`, `Industry.getLLMsTxt`).
- `portfolio.js` — Showcase portfolio works helper (`Portfolio.readOne`, `Portfolio.paginate`, `Portfolio.getSlugs`, `Portfolio.generateMetadata`, `Portfolio.generateJSONLD`, `Portfolio.getSitemap`, `Portfolio.getLLMsTxt`).
- `policy.js` — Dynamic legal policies helper (`Policy.getPrivacyPolicy`, `Policy.getTerms`, `Policy.getRefundPolicy`, `Policy.readOne`, `Policy.generateMetadata`, `Policy.generateJSONLD`, `Policy.getSitemap`).
- `tag.js` — Taxonomies and tag badges helper (`Tag.paginate`, `Tag.dropdown`, `Tag.readOne`).
- `user-event.js` — Visitor telemetry & event tracking helper (`UserEvent.track`, `UserEvent.pageView`).
- `index.js` — Unified barrel export enabling clean imports: `import { Blog, Project, Service, Testimonial, FAQ, PageConfig, SiteConfig, SEOHelper, ContactUs, Lead, Tool, ToolCategory, CaseStudy, Feature, Job, Event, Plan, Gallery, Article, Industry, Portfolio, Policy, Tag, UserEvent } from '@/lib/cms'`.

---

## 2. Seeders (`seeders/`) -> Model Data Ingestion

Standalone CLI utilities executed during **Stage 5 Batch 4** to validate and push seed JSON files from `project-docs/client-review/gate-5-cms-content/<model>/` into the live CMS database:

> [!NOTE]
> **Source Content Ingestion:** Initial draft content, articles, and tool specifications are authored in modular directories under `client-context/<model>/.../content.md` (e.g. `client-context/blog/<blog-slug>/content.md`, `client-context/tool/<category-slug>/<tool-slug>/content.md`) with co-located image assets during Stage 4 SEO Strategy or Stage 0 intake. These provide the source copy, frontmatter, and assets converted into seed records.

### Shared Seeder Engine
- `seeders/lib/seeder-base.js` — Universal CLI runner providing argument parsing (`--dir`, `--file`, `--dry-run`, `--auto-slug`), `.env.local` resolution, and HTTP lifecycle methods.

### Dedicated Model Seeders
- `seeders/blog/` — `insert.js`, `update.js`, `delete.js`
- `seeders/project/` — `insert.js`, `update.js`, `delete.js`
- `seeders/contact-us/` — `insert.js`, `update.js`, `delete.js`
- `seeders/page-config/` — `insert.js`, `update.js`, `delete.js`
- `seeders/service/` — `insert.js`, `update.js`, `delete.js`
- `seeders/testimonial/` — `insert.js`, `update.js`, `delete.js`
- `seeders/faq/` — `insert.js`, `update.js`, `delete.js`
- `seeders/feature/` — `insert.js`, `update.js`, `delete.js`
- `seeders/case-study/` — `insert.js`, `update.js`, `delete.js`
- `seeders/tool/` — `insert.js`, `update.js`, `delete.js`
- `seeders/tool-category/` — `insert.js`, `update.js`, `delete.js`
- `seeders/job/` — `insert.js`, `update.js`, `delete.js`
- `seeders/event/` — `insert.js`, `update.js`, `delete.js`
- `seeders/plan/` — `insert.js`, `update.js`, `delete.js`
- `seeders/gallery/` — `insert.js`, `update.js`, `delete.js`
- `seeders/article/` — `insert.js`, `update.js`, `delete.js`
- `seeders/industry/` — `insert.js`, `update.js`, `delete.js`
- `seeders/portfolio/` — `insert.js`, `update.js`, `delete.js`
- `seeders/policy/` — `insert.js`, `update.js`, `delete.js` (accepts `--type privacy|terms|refund`)
- `seeders/tag/` — `insert.js`, `update.js`, `delete.js`
- `seeders/form/` — `submit.js` (Generic form submission tester)

---

## 3. Model Instruction Files

Authoritative model runbooks strictly following the 4-section architecture: (1) Model Schema, (2) List Page Server Component [Exact Code without JSX], (3) Single Page Server Component / Action [Exact Code without JSX], and (4) Running the Seeder:

- [blog.md](blog.md) — Blog model schema, list page Server Component, single post page with `generateStaticParams`, and blog seeder runner.
- [project.md](project.md) — Portfolio Project model schema, list page Server Component, single project page with `generateStaticParams`, and project seeder runner.
- [contact-us.md](contact-us.md) — Direct `WebsiteContactUs` module schema, contact page Server Component, Server Action submission handler, and contact-us seeder runner.
- [page-config.md](page-config.md) — Pure page-level `WebsitePageConfig` schema, Next.js page metadata/FAQ injection, shell/layout controls, and seeder runner.
- [service.md](service.md) — Service model schema, services list page Server Component, single service page with `generateStaticParams`, and service seeder runner.
- [faq.md](faq.md) — FAQ model schema, FAQs index Server Component, in-page accordion integration, FAQPage JSON-LD, and FAQ seeder runner.
- [testimonial.md](testimonial.md) — Testimonial review model schema, testimonials index Server Component, in-page review showcase, and testimonial seeder runner.
- [case-study.md](case-study.md) — CaseStudy model schema, enterprise case studies list, single narrative page with metrics, and case-study seeder runner.
- [tool.md](tool.md) — Interactive WebsiteTool model schema, tools index Server Component, single tool page with `generateStaticParams`, and tool seeder runner.
- [tool-category.md](tool-category.md) — Hierarchical WebsiteToolCategory model schema, category index Server Component, single category page with `generateStaticParams`, and category seeder runner.
- [feature.md](feature.md) — Platform features schema, landing page features grid integration, and feature seeder runner.
- [job.md](job.md) — WebsiteJob model schema, careers index Server Component, single job detail page, JobPosting schema, and job seeder runner.
- [event.md](event.md) — WebsiteEvent model schema, events calendar Server Component, single event detail page, Event schema, and event seeder runner.
- [plan.md](plan.md) — WebsitePlan pricing schema, multi-cycle pricing table Server Component, and plan seeder runner.
- [gallery.md](gallery.md) — Gallery album schema, media grid Server Component, single album viewer, and gallery seeder runner.
- [article.md](article.md) — Editorial Article schema with author credits, articles list Server Component, single article reader, and article seeder runner.
- [industry.md](industry.md) — Industry solution verticals schema, sector capabilities list, single industry page, and industry seeder runner.
- [portfolio.md](portfolio.md) — Showcase Portfolio works schema, media gallery, tag relationships, and portfolio seeder runner.
- [policy.md](policy.md) — Dynamic legal policy schemas (Privacy, Terms, Refund), Server Component legal pages, DigitalDocument schema, and policy seeder runner.
- [tag.md](tag.md) — WebsiteTag taxonomy schema, category filtering UI Server Component, dynamic tag routes, and tag seeder runner.
- [user-event.md](user-event.md) — WebsiteUserEvent visitor telemetry, client interaction tracking, and server-side ingestion handler.
- [lead.md](lead.md) — Inbound Lead and consultation requests, Server Action submission with honeypot anti-spam, and form testing.
