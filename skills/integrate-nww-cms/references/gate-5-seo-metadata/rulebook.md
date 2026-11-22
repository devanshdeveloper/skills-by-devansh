# Gate 5: SEO & Structured Data from CMS

> **Gate ID:** `5`  
> **Gate Name:** `seo-metadata`  
> **Execution Mode:** Metadata Unification & Structured Data Validation  
> **State Transition:** `pending` -> `in_progress` -> `awaiting_approval` -> `approved`  

---

## 1. Objective & Non-Negotiable Invariants

Gate 5 unifies all Search Engine Optimization (SEO), Open Graph social previews, canonical URLs, crawler directives, and Schema.org JSON-LD structured data using dynamic NWW CMS fields.

> [!IMPORTANT]
> **Valid JSON-LD Invariant:**
> - All Schema.org structured data emitted from `WebsitePageConfig.jsonLd` or model helpers must be validated as syntactically valid JSON before rendering.
> - Structured data rendered into `<script type="application/ld+json">` must be safely sanitized with `<` escaped as `\u003c` to eliminate XSS injection risks.

> [!IMPORTANT]
> **Complete OpenGraph Parity:**
> Avoid shallow merge drops in Next.js metadata by generating complete OpenGraph dictionaries (`title`, `description`, `url`, `siteName`, `images`, `type`).

> [!IMPORTANT]
> **Human Approval Barrier:**
> Advancing to Gate 6 requires the exact verbatim phrase:
> `APPROVE GATE 5`

> [!TIP]
> **Context Compaction:**
> At the conclusion of Gate 5 evidence presentation, run `/compact` to compact conversation history and preserve context window headroom for Gate 6.

---

## 2. Implementation Specifications

### 2.1 Next.js App Router (`app/`)
In App Router pages, export `generateMetadata` consuming `PageConfig.readOne()`:

```typescript
import type { Metadata } from 'next';
import { PageConfig, SEOHelper } from '@/lib/cms';

export async function generateMetadata(): Promise<Metadata> {
  const pageConfig = await PageConfig.readOne('home');
  return SEOHelper.generateMetadata(pageConfig, 'Home');
}

export default async function Page() {
  const pageConfig = await PageConfig.readOne('home');
  const safeJsonLd = pageConfig?.jsonLd ? SEOHelper.safeJsonLd(pageConfig.jsonLd) : null;

  return (
    <>
      {safeJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd }}
        />
      )}
      <main>
        {/* Page Sections */}
      </main>
    </>
  );
}
```

### 2.2 Dynamic Blog / Article SEO (`app/blog/[slug]/page.tsx`)
```typescript
import type { Metadata } from 'next';
import { Blog, SiteConfig } from '@/lib/cms';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await Blog.readOne(slug);
  const siteName = SiteConfig.getName();
  const siteUrl = SiteConfig.getUrl();

  if (!post) {
    return { title: `Post Not Found | ${siteName}` };
  }

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.title;
  const canonical = `${siteUrl}/blog/${post.slug}`;

  return {
    title: `${title} | ${siteName}`,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      type: 'article',
      publishedTime: post.postedAt,
      modifiedTime: post.lastUpdatedAt || post.postedAt,
      authors: post.author_name ? [post.author_name] : [],
      images: post.cover_image ? [{ url: post.cover_image }] : (post.image ? [{ url: post.image }] : []),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.cover_image ? [post.cover_image] : [],
    },
  };
}
```

### 2.3 Dynamic Sitemap (`app/sitemap.ts`)
```typescript
import type { MetadataRoute } from 'next';
import { PageConfig, Blog, SiteConfig } from '@/lib/cms';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = SiteConfig.getUrl();
  const pages = await PageConfig.paginate();
  const blogs = await Blog.paginate();

  const staticEntries: MetadataRoute.Sitemap = pages
    .filter(p => !p.noIndex && p.status === 'published')
    .map(p => ({
      url: `${siteUrl}/${p.slug === 'home' ? '' : p.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: p.slug === 'home' ? 1.0 : 0.8,
    }));

  const blogEntries: MetadataRoute.Sitemap = blogs
    .filter(b => b.status === 'published')
    .map(b => ({
      url: `${siteUrl}/blog/${b.slug}`,
      lastModified: b.lastUpdatedAt ? new Date(b.lastUpdatedAt) : new Date(b.postedAt || Date.now()),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

  return [...staticEntries, ...blogEntries];
}
```

---

## 3. Step-by-Step Procedure

### Step 1: Validate Existing & Planned JSON-LD
Run `jsonld-validator.mjs` against page configuration structured data:

```bash
node <path-to-skill>/scripts/cms-state.mjs set-status 5 in_progress
node <path-to-skill>/scripts/jsonld-validator.mjs --audit
```

### Step 2: Implement Dynamic Metadata & JSON-LD Injection
1. Update root layout or page components with `generateMetadata()` (App Router) or `<Head>` (Pages Router).
2. Wire `WebsitePageConfig.jsonLd` into page headers with safe `\u003c` escaping.
3. Wire dynamic blog metadata for all detail routes.
4. Update or create `app/sitemap.ts` (or `pages/sitemap.xml.ts`) consuming CMS slugs.
5. Update `app/robots.ts` (or `public/robots.txt`) ensuring standard indexing while pointing to canonical sitemap.

### Step 3: Run SEO Audit & Write Report (`.nww-cms/seo-audit.md`)
Compile an audit document verifying:
- Title and description lengths conform to Google Search Central recommendations (title: 50–60 chars, description: 120–160 chars).
- Canonical URLs match canonical domain without trailing slashes.
- Robots directives respect `pageConfig.noIndex` and `pageConfig.noFollow`.
- JSON-LD parses without errors and validates Schema.org structure.

### Step 4: Present Evidence & Request Approval
1. Set Gate 5 status to `awaiting_approval`:
   ```bash
   node <path-to-skill>/scripts/cms-state.mjs set-status 5 awaiting_approval
   ```
2. Present `.nww-cms/seo-audit.md` in chat.
3. Prompt user for Gate 5 approval:
   ```markdown
   > [!IMPORTANT]
   > Please review `.nww-cms/seo-audit.md`. To proceed to Gate 6 (Revalidation and Handoff), respond with:
   > `APPROVE GATE 5`
   >
   > [!TIP]
   > **Context Compaction:** You can run `/compact` to compact conversation history and maintain context window headroom for Gate 6.
   ```
4. Upon receiving `APPROVE GATE 5`:
   ```bash
   node <path-to-skill>/scripts/cms-state.mjs approve 5 "APPROVE GATE 5"
   ```
