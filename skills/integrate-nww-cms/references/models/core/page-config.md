# WebsitePageConfig Model Reference

> **Collection:** `website-page-configs`  
> **Endpoint:** `/api/website-page-config`  
> **Scope:** Pure Page-Level Configuration Contract  

## 1. Schema & Standing Architectural Decisions

- **Zero `path` Field:** Document resolution is strictly handled by `slug` (e.g. `read-one-by-slug/:slug`).
- **Zero `structuredDataType` Field:** Legacy enum removed; replaced by `jsonLd` string field.
- **Valid JSON-LD String:** `jsonLd` accepts valid Schema.org JSON-LD string only.
- **Embedded FAQs:** `faqs` is an embedded subdocument array: `[{ question: String, answer: String }]`.
- **Hero Micro-Copy Overrides:** `heroBadge`, `heroHeadline`, `heroSubtext`.
- **CTA Controls:** `showCTA`, `ctaHeadline`, `ctaSubtext`, `ctaButtonText`, `ctaButtonLink`, `ctaSecondaryButtonText`, `ctaSecondaryButtonLink`.
- **Layout Flags:** `headerVariant` (`default` | `transparent` | `minimal` | `hidden`), `showFooter`, `banner: { enabled, text, link }`.
- **Arbitrary Metadata:** `metadata: Map<String, Any>` for custom bento grids, stats, or metrics.

## 2. Server Component Fetch Pattern

```typescript
import { PageConfig } from '@/lib/cms';

export default async function Page() {
  const config = await PageConfig.readOne('home');
  // Pass to components with fallback safety
}
```
