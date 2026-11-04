# Feature (`Feature`) Model & Integration Specification

This reference provides the unified technical specification for the NWW CMS `Feature` model, including its data contract, product feature showcase implementation, and companion seeder workflows.

## Table of Contents
- [1. Model](#1-model)
- [2. Implementation on Section Component [Exact Code without the JSX]](#2-implementation-on-section-component-exact-code-without-the-jsx)
- [3. Running the Seeder [Exact Code without the JSX]](#3-running-the-seeder-exact-code-without-the-jsx)

---

## 1. Model

The NWW CMS stores core platform and product features in MongoDB under the `Feature` collection (accessed via REST slug `feature`).

### Schema Fields & Types

```typescript
interface FeatureItem {
  _id: string;                                          // MongoDB ObjectId string
  name: string;                                         // Feature title / name (required)
  description?: string;                                 // Feature benefit / description
  icon?: string;                                        // Icon asset URL or SVG identifier
  status: 'active' | 'inactive';                        // Workflow status
  isDeleted?: boolean;                                  // Soft-delete flag
}
```

---

## 2. Implementation on Section Component [Exact Code without the JSX]

```javascript
// Landing page Features grid section
import { Feature } from '@/lib/cms';

export async function LandingFeaturesSection({ limit = 8 }) {
  const { items: features } = await Feature.paginate({ limit });

  const featureCards = features.map((f) => ({
    id: f._id,
    title: f.name || f.title,
    description: f.description || '',
    icon: f.icon || '/assets/icons/feature-default.svg',
  }));

  return (
    <section data-section="landing-features">
      {/* Presentation JSX receives { featureCards } */}
    </section>
  );
}
```

---

## 3. Running the Seeder [Exact Code without the JSX]

The standalone Feature seeder scripts reside in `skills/create-nww-website/references/cms/seeders/feature/` and operate on JSON files in `project-docs/client-review/gate-5-cms-content/features/`.

### 1. Validate & Dry Run
```bash
node skills/create-nww-website/references/cms/seeders/feature/insert.js \
  --dir project-docs/client-review/gate-5-cms-content/features \
  --dry-run
```

### 2. Live Seeding
```bash
node skills/create-nww-website/references/cms/seeders/feature/insert.js \
  --dir project-docs/client-review/gate-5-cms-content/features
```

