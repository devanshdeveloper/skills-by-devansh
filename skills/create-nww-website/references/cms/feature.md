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

The Feature content operations are managed via the companion `content-pipeline` CLI operating on JSON files in `project-docs/client-review/gate-5-cms-content/features/` (or compiled from MDX).

### 1. Validate & Dry Run
```bash
node skills/create-nww-website/scripts/content-pipeline/index.js push \
  --dir project-docs/client-review/gate-5-cms-content/features \
  --model feature
```

### 2. Live Seeding
```bash
node skills/create-nww-website/scripts/content-pipeline/index.js push \
  --dir project-docs/client-review/gate-5-cms-content/features \
  --model feature \
  --apply
```

### 3. Updating an Existing Feature
```bash
node skills/create-nww-website/scripts/content-pipeline/index.js update \
  --model feature \
  --id "65f8a123bc45de6789012345" \
  --file update.json
```

### 4. Deleting a Feature
```bash
node skills/create-nww-website/scripts/content-pipeline/index.js delete \
  --model feature \
  --id "65f8a123bc45de6789012345"
```

