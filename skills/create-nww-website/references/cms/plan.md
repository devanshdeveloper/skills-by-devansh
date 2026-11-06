# Plan (`WebsitePlan`) Model & Integration Specification

This reference provides the unified technical specification for the NWW CMS `WebsitePlan` model, including its data contract, pricing table page implementation, and companion seeder workflows.

## Table of Contents
- [1. Model](#1-model)
- [2. Implementation on Pricing Page [Exact Code without the JSX]](#2-implementation-on-pricing-page-exact-code-without-the-jsx)
- [3. Running the Seeder [Exact Code without the JSX]](#3-running-the-seeder-exact-code-without-the-jsx)

---

## 1. Model

The NWW CMS stores subscription packages and pricing tiers in MongoDB under the `WebsitePlan` collection (accessed via REST slug `website-plan`).

### Schema Fields & Types

```typescript
interface PlanPrice {
  price: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  billingCycle: 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
}

interface PlanFeature {
  name: string;
  description?: string;
  enabled: boolean;
}

interface PlanItem {
  _id: string;
  name: string;                                         // Plan name (required, unique)
  description?: string;                                 // Tier summary
  price: PlanPrice[];                                   // Multi-cycle pricing configurations
  features: PlanFeature[];                              // Feature checklist
  status: 'draft' | 'published';                        // Status ('published' for live website)
  trialDays?: number;                                   // Free trial duration in days (default: 0)
  recommended?: boolean;                                // Highlighted "Most Popular" badge
  isCustomPlan?: boolean;                               // Enterprise / custom quote tier
  website: string;                                      // Scoped Website ObjectId
  user: string;                                         // Admin/tenant owner ObjectId
  isDeleted?: boolean;                                  // Soft-delete flag
}
```

---

## 2. Implementation on Pricing Page [Exact Code without the JSX]

### Server Component Implementation (`site/app/pricing/page.js`)

```javascript
// site/app/pricing/page.js
import { Plan, SEOHelper } from '@/lib/cms';

export const ensureStatic = 'navigation';

export const metadata = SEOHelper.generateMetadata({
  title: 'Pricing & Plans | Transparent Subscriptions',
  description: 'Choose the right tier for your team. Flexible monthly and annual billing with no hidden fees.',
  path: '/pricing',
});

export default async function PricingPage() {
  'use cache';

  const plans = await Plan.getAll();

  const formattedPlans = plans.map((p) => ({
    id: p._id,
    name: p.name,
    description: p.description,
    monthlyPrice: p.price.find((pr) => pr.billingCycle === 'monthly')?.price || 0,
    yearlyPrice: p.price.find((pr) => pr.billingCycle === 'yearly')?.price || 0,
    currency: p.price[0]?.currency || 'USD',
    features: p.features || [],
    recommended: Boolean(p.recommended),
    isCustom: Boolean(p.isCustomPlan),
  }));

  return (
    <main data-section="pricing-index">
      {/* Presentation JSX receives { formattedPlans } */}
    </main>
  );
}
```

---

## 3. Running the Seeder [Exact Code without the JSX]

The Plan content operations are managed via the companion `content-pipeline` CLI operating on JSON files in `project-docs/client-review/gate-5-cms-content/plans/` (or compiled from MDX).

### 1. Validate & Dry Run
```bash
node skills/create-nww-website/scripts/content-pipeline/index.js push \
  --dir project-docs/client-review/gate-5-cms-content/plans \
  --model plan
```

### 2. Live Seeding
```bash
# Live insertion of plan seeds (requires --apply)
node skills/create-nww-website/scripts/content-pipeline/index.js push \
  --dir project-docs/client-review/gate-5-cms-content/plans \
  --model plan \
  --apply
```

### 3. Updating an Existing Plan
```bash
node skills/create-nww-website/scripts/content-pipeline/index.js update \
  --model plan \
  --id "65f8a123bc45de6789012345" \
  --file update.json
```

### 4. Deleting a Plan
```bash
node skills/create-nww-website/scripts/content-pipeline/index.js delete \
  --model plan \
  --id "65f8a123bc45de6789012345"
```

