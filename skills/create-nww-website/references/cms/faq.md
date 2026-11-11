# FAQ (`FAQ`) Model & Integration Specification

This reference provides the unified technical specification for the NWW CMS `FAQ` model, including its data contract, FAQs page implementation, Schema.org `FAQPage` structured data injection, and companion seeder workflows.

> [!IMPORTANT]
> **Hard Invariants — High FAQ Density & Zero Cross-Page Duplication:**
> 1. **High FAQ Density:** Every FAQ route (such as `/faqs`) and in-page FAQ section must enforce **High FAQ Density** with a **minimum of 10 to 15 comprehensive, substantive FAQs**. Shallow 1-sentence answers or thin lists (<10 items) are strictly prohibited.
> 2. **Multi-Sentence Informational Depth:** Answers must be comprehensive paragraphs explaining technical architecture, pricing nuances, service-specific workflows, onboarding steps, and user objections.
> 3. **Zero Cross-Page Duplicate FAQs:** When multiple pages feature FAQ sections (e.g. Home FAQ vs Service FAQ vs `/faqs`), each page's FAQ set must be 100% unique to that specific page's topic. Reusing identical questions or answers across pages is strictly prohibited.

## Table of Contents
- [1. Model](#1-model)
- [2. Implementation on Model List Page [Exact Code without the JSX]](#2-implementation-on-model-list-page-exact-code-without-the-jsx)
- [3. Implementation on Single Model Page / Accordion [Exact Code without the JSX]](#3-implementation-on-single-model-page--accordion-exact-code-without-the-jsx)
- [4. Running the Seeder [Exact Code without the JSX]](#4-running-the-seeder-exact-code-without-the-jsx)

---

## 1. Model

The NWW CMS stores frequently asked questions under the `FAQ` collection (accessed via REST slug `faq`).

### Schema Fields & Types

```typescript
interface FAQItem {
  _id: string;                                          // MongoDB ObjectId string
  question: string;                                     // FAQ question text (required)
  answer: string;                                       // FAQ answer markdown or rich-text HTML (required)
  category?: string;                                    // Topic grouping (e.g. "General", "Billing", "Technical")
  order?: number;                                       // Display priority weight (default: 0)
  status: 'draft' | 'published' | 'archived';           // Workflow status ('published' for live website)
  website?: string;                                     // Scoped Website ObjectId
  user: string;                                         // Admin/tenant owner ObjectId
  isDeleted?: boolean;                                  // Soft-delete flag (default: false)
  createdAt?: string;                                   // ISO 8601 creation timestamp
  updatedAt?: string;                                   // ISO 8601 modification timestamp
}
```

---

## 2. Implementation on Model List Page [Exact Code without the JSX]

### Server Component Implementation (`site/app/faqs/page.js`)

```javascript
// site/app/faqs/page.js
import { FAQ, SEOHelper } from '@/lib/cms';
import { Schema } from '@/components/seo/Schema';

// Enforce build-time static validation
export const ensureStatic = 'navigation';

export const metadata = SEOHelper.generateMetadata({
  title: 'Frequently Asked Questions | Help & FAQ',
  description: 'Find answers to common questions about our platform, services, implementation timelines, and security.',
  path: '/faqs',
});

export default async function FAQsIndexPage({ searchParams }) {
  'use cache';

  const params = await searchParams;
  const category = params?.category || undefined;

  // Fetches published FAQs
  const { items: faqs } = await FAQ.paginate({ limit: 50, category });

  // Generate Schema.org FAQPage structured data
  const jsonLd = FAQ.generateJSONLD(faqs);

  // Group FAQs by category for presentation
  const groupedFaqs = faqs.reduce((acc, item) => {
    const cat = item.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push({
      id: item._id,
      question: item.question,
      answer: item.answer,
    });
    return acc;
  }, {});

  // Return data payload to page presentation layer
  return (
    <main data-section="faqs-index">
      <Schema schema={jsonLd} />
      {/* Presentation JSX receives { groupedFaqs, faqs } */}
    </main>
  );
}
```

---

## 3. Implementation on Single Model Page / Accordion [Exact Code without the JSX]

For in-page accordions embedded inside service or landing pages:

```javascript
// In-page FAQ section integration
import { FAQ } from '@/lib/cms';
import { Schema } from '@/components/seo/Schema';

export async function PageFAQSection({ category = 'General' }) {
  // Enforces High FAQ Density (10-15+ substantive FAQs)
  const { items: faqs } = await FAQ.paginate({ limit: 15, category });
  const jsonLd = FAQ.generateJSONLD(faqs);

  return (
    <section data-section="page-faqs">
      <Schema schema={jsonLd} />
      {/* Presentation JSX receives faqs */}
    </section>
  );
}
```

---

## 4. Running the Seeder [Exact Code without the JSX]

The FAQ content operations are managed via the companion `content-pipeline` CLI operating on JSON files in `project-docs/client-review/gate-5-cms-content/faqs/` (or compiled from MDX).

### 1. Validate & Dry Run
```bash
# Validates schema rules, question and answer without network writes
node skills/create-nww-website/scripts/content-pipeline/index.js push \
  --dir project-docs/client-review/gate-5-cms-content/faqs \
  --model faq
```

### 2. Live Seeding
```bash
# Live insertion of FAQ seeds (requires --apply)
node skills/create-nww-website/scripts/content-pipeline/index.js push \
  --dir project-docs/client-review/gate-5-cms-content/faqs \
  --model faq \
  --apply
```

### 3. Updating an Existing FAQ
```bash
# Update fields for an existing FAQ by MongoDB ObjectId (dry-run default, add --apply for live write)
node skills/create-nww-website/scripts/content-pipeline/index.js update \
  --model faq \
  --id "65f8a123bc45de6789012345" \
  --file project-docs/client-review/gate-5-cms-content/faqs/faq-update.json
```

### 4. Deleting an FAQ
```bash
# Delete an FAQ by MongoDB ObjectId (dry-run default, add --apply for live delete)
node skills/create-nww-website/scripts/content-pipeline/index.js delete \
  --model faq \
  --id "65f8a123bc45de6789012345"
```

### 5. FAQ Implementation Binary QA Checklist
- [ ] **FAQ Volume:** Minimum **10 comprehensive, substantive questions and answers** rendered per FAQ page or in-page FAQ section.
- [ ] **Static Guardrail:** `ensureStatic = 'navigation'` is exported from `faqs/page.js`.
- [ ] **Structured Data:** Valid `FAQPage` JSON-LD rendered with `<` Unicode escaping (`\u003c`).
- [ ] **Accessible Accordion:** Accordion triggers apply `aria-expanded` and `aria-controls` attributes correctly.
- [ ] **Dynamic Sitemap:** `app/sitemap.js` includes `/faqs` with priority `0.6`.

