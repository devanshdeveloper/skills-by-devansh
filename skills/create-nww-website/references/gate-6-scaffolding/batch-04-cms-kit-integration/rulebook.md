# Batch 04: CMS Client Kit & Dynamic Route Integrations

**Batch Code:** `batch-04-cms-kit-integration`  
**Stage:** Stage 6 Scaffolding, Foundation Build & Landing Page Showcase  
**Parent Reference:** [../runbook.md](../runbook.md)  

---

## 1. Role & Purpose

Batch 04 wires the class-based CMS data client layer (`site/lib/cms/`), implements the on-demand ISR revalidation webhook handler, establishes dynamic blog routes, and sets up the stock credits attribution page (if stock images were used).

---

## 2. Preconditions & Input Sources

1. **CMS Mode:** Checked from `client-context/answers/batch-01-core-identity/answers.md` (`cms: cms` vs `cms: none`).
2. **Stock Provenance:** Checked from `project-docs/stock-provenance.json` (compiled during Gate 5).
3. **Batch 03 Completed:** Foundation shell, asset pipeline, and scoped rules in place.

> **Mode Branching Rule:** If `cms: none` and zero stock images were sourced, skip directly to **[Batch 05: Route Scaffolding](../batch-05-route-scaffolding/rulebook.md)**.

---

## 3. Execution Protocol

### Step 1: Install Class-Based CMS Kit (`site/lib/cms/`)
If `cms: cms`:
Copy the class-based CMS library from `references/gate-6-scaffolding/site/lib/cms-kit/` directly into `site/lib/cms/`:

```bash
# Copy library files
cp -r skills/create-nww-website/references/gate-6-scaffolding/site/lib/cms-kit/* site/lib/cms/
```

The kit exposes:
- `Blog` (`readOne`, `paginate`, `generateMetadata`, `generateJSONLD`)
- `ContentHelper` (tenant resolution, cache tags, fetch wrapper)
- Multi-module models (`Service`, `Project`, `Faq`, `Testimonial`, `Lead`, `Policy`)

### Step 2: Implement On-Demand ISR Webhook Handler
Implement `site/app/api/revalidate/route.js` handling POST webhooks with `REVALIDATE_SECRET` validation per [cms-kit.md](cms-kit.md):

```javascript
import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const secret = request.headers.get('x-revalidate-secret');
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  const { tag } = await request.json();
  if (!tag) {
    return NextResponse.json({ message: 'Missing tag' }, { status: 400 });
  }

  revalidateTag(tag);
  return NextResponse.json({ revalidated: true, tag, now: Date.now() });
}
```

### Step 3: Wire Dynamic Blog Routes
If the website includes a blog module:
1. **Blog Index (`site/app/blog/page.js`):**
   - Implements server-side paginated querying via `Blog.paginate()`.
   - Exports metadata and renders `<BlogList />` and `<Pagination />`.
2. **Blog Detail (`site/app/blog/[slug]/page.js`):**
   - Implements `generateStaticParams()` pre-rendering published slugs.
   - Exports dynamic SEO metadata via `Blog.generateMetadata()`.
   - Injects Article JSON-LD via `Blog.generateJSONLD()`.
   - Renders article content with fallback handling (`notFound()`).

### Step 4: Stock Image Credits Attribution (Conditional)
If stock imagery from Pixabay, Pexels, or Unsplash was sourced in Gate 5:
- Generate `site/app/credits/page.js` rendering attribution tables from `project-docs/stock-provenance.json`.
- Link `/credits` in `Footer.js`.
- Ensure all Unsplash image tags declare `referrerPolicy="no-referrer-when-downgrade"`.

---

## 4. Deliverables Checklist

- [ ] `site/lib/cms/` class-based library operational (if CMS active).
- [ ] `site/app/api/revalidate/route.js` on-demand ISR webhook route implemented.
- [ ] `site/app/blog/page.js` and `site/app/blog/[slug]/page.js` wired with metadata and JSON-LD (if blog model used).
- [ ] `site/app/credits/page.js` generated and linked in footer (if stock images sourced).

---

## 5. Next Batch Handover

Proceed immediately to **[Batch 05: Route Scaffolding & Master QA Checklist](../batch-05-route-scaffolding/rulebook.md)** to generate the QA checklist, scaffold all remaining application route stubs, and emit the site manifest.

