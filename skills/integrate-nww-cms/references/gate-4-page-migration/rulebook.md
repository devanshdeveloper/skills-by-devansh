# Gate 4: Page-by-Page Migration

> **Gate ID:** `4`  
> **Gate Name:** `page-migration`  
> **Execution Mode:** Incremental, Component-Preserving Content Substitution  
> **State Transition:** `pending` -> `in_progress` -> `awaiting_approval` -> `approved`  

---

## 1. Objective & Non-Negotiable Invariants

Gate 4 migrates existing Next.js pages from hardcoded strings, local Markdown, or third-party data sources to NWW CMS data—**one page per approval cycle**.

> [!IMPORTANT]
> **Preserve Existing Design & Layout Verbatim:**
> - NEVER rewrite, redesign, restyle, or alter existing JSX layout trees, container widths, flex/grid hierarchies, or Tailwind classes.
> - Tailwind CSS only. Creating new `.css`, `.scss`, or CSS module files is strictly forbidden.
> - Existing section components (e.g., `HeroSection`, `FeaturesSection`, `FaqAccordion`) must be retained; only their text/content props are replaced with CMS data expressions.

> [!IMPORTANT]
> **CMS Fallback & Resilience Invariant:**
> Pages must NEVER blank out or throw fatal rendering exceptions if the CMS backend is unreachable or returns `null`. Every CMS data access expression must supply safe fallback values:
> ```typescript
> const headline = pageConfig?.heroHeadline ?? "Default Hero Headline";
> const faqs = (pageConfig?.faqs && pageConfig.faqs.length > 0) ? pageConfig.faqs : FALLBACK_FAQS;
> ```

> [!IMPORTANT]
> **Image Approval Discipline:**
> - The agent must NEVER pick, suggest, synthesize, or assign images autonomously.
> - All image slots must remain placeholders (e.g. `data-placeholder="image"`, `/placeholder.svg`, or CSS skeleton) until explicit human approval.
> - Approvals are stored strictly **ONE file per page** under `.nww-cms/images/<page-slug>.json`. Storing multiple pages in a single image file is strictly prohibited.

> [!IMPORTANT]
> **Iterative Per-Page Approval Barrier:**
> Migrating a page requires explicit human review and sign-off before starting the next page. After all pages are migrated, advancing to Gate 5 requires:
> `APPROVE GATE 4`

> [!TIP]
> **Context Compaction:**
> At each page migration milestone and upon final Gate 4 completion, run `/compact` to maintain context window headroom.

---

## 2. Image Approval File Format (`.nww-cms/images/<page-slug>.json`)

For each page, create a dedicated image definition file:

```json
{
  "pageSlug": "home",
  "route": "/",
  "approvedAt": "2026-11-22T14:00:00Z",
  "slots": [
    {
      "slotId": "hero-banner",
      "component": "HeroSection",
      "status": "approved",
      "url": "https://assets.example.com/cdn/hero-banner.webp",
      "alt": "Acme industrial platform overview",
      "width": 1920,
      "height": 1080
    },
    {
      "slotId": "feature-1-thumbnail",
      "component": "FeatureCard",
      "status": "placeholder",
      "url": "/placeholder.svg",
      "alt": "Placeholder feature thumbnail",
      "width": 600,
      "height": 400
    }
  ]
}
```

---

## 3. Step-by-Step Migration Cycle (Per Page)

### Step 1: Select Target Page
Select the next unmigrated page from `.nww-cms/state.json`:

```bash
node <path-to-skill>/scripts/cms-state.mjs status
```

### Step 2: Establish Fallbacks & Image Placeholders
1. Inspect the target page component (e.g. `app/page.tsx` or `pages/index.tsx`).
2. Extract existing hardcoded copy into a co-located or local fallback dictionary:
   ```typescript
   const FALLBACK_CONTENT = {
     heroHeadline: "Existing Hardcoded Headline",
     heroSubtext: "Existing hardcoded subtext description...",
     ctaButtonText: "Get Started",
     faqs: [ /* existing hardcoded FAQs */ ]
   };
   ```
3. Create `.nww-cms/images/<page-slug>.json` listing all image slots with `status: "placeholder"`.

### Step 3: Wire CMS Data Fetcher
In App Router (Server Component):
```typescript
import { PageConfig, SEOHelper } from '@/lib/cms';

export default async function Page() {
  const pageConfig = await PageConfig.readOne('home');

  const headline = pageConfig?.heroHeadline || FALLBACK_CONTENT.heroHeadline;
  const subtext = pageConfig?.heroSubtext || FALLBACK_CONTENT.heroSubtext;
  const faqs = (pageConfig?.faqs && pageConfig.faqs.length > 0) ? pageConfig.faqs : FALLBACK_CONTENT.faqs;

  return (
    <main>
      <HeroSection headline={headline} subtext={subtext} />
      {/* Existing sections preserved verbatim */}
      <FaqSection items={faqs} />
    </main>
  );
}
```

In Pages Router:
```typescript
import { PageConfig } from '@/lib/cms';

export async function getStaticProps() {
  const pageConfig = await PageConfig.readOne('home');
  return {
    props: { pageConfig },
    revalidate: 60,
  };
}

export default function Page({ pageConfig }: { pageConfig: any }) {
  // Same fallback resolution
}
```

### Step 4: Verify Migration & Record State
1. Run local build or lint check to ensure zero TypeScript or compilation errors.
2. Mark page migrated in state:
   ```bash
   node <path-to-skill>/scripts/cms-state.mjs mark-page-migrated <page-slug>
   ```
3. Document page migration in `.nww-cms/pages/<page-slug>/migration-log.md`.
4. Present migrated diff to user for per-page review.
5. If image assets are approved by human, record:
   ```bash
   node <path-to-skill>/scripts/cms-state.mjs approve-image <page-slug> .nww-cms/images/<page-slug>.json
   ```

### Step 5: Complete All Pages & Request Gate 4 Sign-Off
Once every route in the mapping table has been migrated:
1. Set status to `awaiting_approval`:
   ```bash
   node <path-to-skill>/scripts/cms-state.mjs set-status 4 awaiting_approval
   ```
2. Request Gate 4 approval in chat:
   ```markdown
   > [!IMPORTANT]
   > All pages have been migrated to NWW CMS data with fallback safety.
   > To proceed to Gate 5 (SEO and Structured Data), respond with:
   > `APPROVE GATE 4`
   >
   > [!TIP]
   > **Context Compaction:** You can run `/compact` to compact conversation history and maintain context window headroom for Gate 5.
   ```
3. Upon receiving `APPROVE GATE 4`:
   ```bash
   node <path-to-skill>/scripts/cms-state.mjs approve 4 "APPROVE GATE 4"
   ```
