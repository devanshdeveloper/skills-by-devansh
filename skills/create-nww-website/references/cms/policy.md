# Legal Policies (`Policy`) Model & Integration Specification

This reference provides the unified technical specification for the NWW CMS Legal Policy modules (`WebsitePrivacyPolicy`, `WebsiteTermsAndConditions`, and `WebsiteRefundPolicy`), including their data contracts, Server Component page implementations, Core Web Vitals rules, dynamic sitemaps, and companion seeder workflows.

## Table of Contents
- [1. Model & Architecture](#1-model--architecture)
- [2. Implementation on Legal Policy Pages [Exact Code without the JSX]](#2-implementation-on-legal-policy-pages-exact-code-without-the-jsx)
- [3. Structured Data & SEO Rules [Exact Code without the JSX]](#3-structured-data--seo-rules-exact-code-without-the-jsx)
- [4. Running the Seeder [Exact Code without the JSX]](#4-running-the-seeder-exact-code-without-the-jsx)

---

## 1. Model & Architecture

The NWW CMS stores tenant legal disclosures across three dedicated backend models:
- **Privacy Policy:** `WebsitePrivacyPolicy` (`/api/website-privacy-policy`)
- **Terms and Conditions:** `WebsiteTermsAndConditions` (`/api/website-terms-and-conditions`)
- **Refund Policy:** `WebsiteRefundPolicy` (`/api/website-refund-policy`)

### Schema Fields & Types

```typescript
interface LegalPolicyItem {
  _id: string;                                          // MongoDB ObjectId string
  content: string;                                      // Full legal document markdown / rich-text HTML (required)
  status?: 'draft' | 'published' | 'archived';          // Publication lifecycle (default: 'draft')
  website?: string;                                     // Scoped Website ObjectId
  user: string;                                         // Admin/tenant owner ObjectId
  isDeleted?: boolean;                                  // Soft-delete flag (default: false)
  createdAt?: string;                                   // ISO 8601 creation timestamp
  updatedAt?: string;                                   // ISO 8601 modification timestamp
}
```

---

## 2. Implementation on Legal Policy Pages [Exact Code without the JSX]

### Server Component Implementation (`site/app/privacy/page.js`)

```javascript
// site/app/privacy/page.js
import { notFound } from 'next/navigation';
import { Policy } from '@/lib/cms';
import { Schema } from '@/components/seo/Schema';

// Enforce build-time static validation
export const ensureStatic = 'navigation';

export async function generateMetadata() {
  return Policy.generateMetadata('privacy');
}

export default async function PrivacyPolicyPage() {
  'use cache';

  const policy = await Policy.getPrivacyPolicy();

  if (!policy) {
    notFound();
  }

  // Structured Data (JSON-LD)
  const jsonLd = Policy.generateJSONLD(policy, 'privacy');

  // Return data payload to legal presentation layer
  return (
    <article data-section="legal-policy-detail">
      <Schema schema={jsonLd} />
      {/* Presentation JSX receives { content: policy.content, updatedAt: policy.updatedAt } */}
    </article>
  );
}
```

### Server Component Implementation (`site/app/terms/page.js`)

```javascript
// site/app/terms/page.js
import { notFound } from 'next/navigation';
import { Policy } from '@/lib/cms';
import { Schema } from '@/components/seo/Schema';

export const ensureStatic = 'navigation';

export async function generateMetadata() {
  return Policy.generateMetadata('terms');
}

export default async function TermsPage() {
  'use cache';

  const policy = await Policy.getTerms();

  if (!policy) {
    notFound();
  }

  const jsonLd = Policy.generateJSONLD(policy, 'terms');

  return (
    <article data-section="legal-policy-detail">
      <Schema schema={jsonLd} />
      {/* Presentation JSX receives { content: policy.content, updatedAt: policy.updatedAt } */}
    </article>
  );
}
```

---

## 3. Structured Data & SEO Rules [Exact Code without the JSX]

Legal pages must export valid Schema.org `DigitalDocument` metadata with canonical references and publication dates:

```javascript
// site/lib/cms-kit/policy.js JSON-LD snippet
export function generatePolicySchema(policy, type) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DigitalDocument',
    name: `Official ${type === 'privacy' ? 'Privacy Policy' : type === 'terms' ? 'Terms and Conditions' : 'Refund Policy'}`,
    dateModified: policy.updatedAt || policy.createdAt || new Date().toISOString(),
  };
}
```

---

## 4. Running the Seeder [Exact Code without the JSX]

The standalone Legal Policy seeder scripts reside in `skills/create-nww-website/references/cms/seeders/policy/` and accept a `--type <privacy|terms|refund>` flag.

### 1. Validate & Dry Run
```bash
# Validates policy content without network writes
node skills/create-nww-website/references/cms/seeders/policy/insert.js \
  --type privacy \
  --dir project-docs/client-review/gate-5-cms-content/policies/privacy \
  --dry-run
```

### 2. Live Seeding
```bash
# Live insertion of privacy policy
node skills/create-nww-website/references/cms/seeders/policy/insert.js \
  --type privacy \
  --dir project-docs/client-review/gate-5-cms-content/policies/privacy

# Live insertion of terms and conditions
node skills/create-nww-website/references/cms/seeders/policy/insert.js \
  --type terms \
  --dir project-docs/client-review/gate-5-cms-content/policies/terms

# Live insertion of refund policy
node skills/create-nww-website/references/cms/seeders/policy/insert.js \
  --type refund \
  --dir project-docs/client-review/gate-5-cms-content/policies/refund
```

### 3. Updating an Existing Policy
```bash
# Update fields for an existing policy by MongoDB ObjectId
node skills/create-nww-website/references/cms/seeders/policy/update.js \
  --type privacy \
  --id "65f8a123bc45de6789012345" \
  --file project-docs/client-review/gate-5-cms-content/policies/privacy/update.json
```

### 4. Deleting a Policy
```bash
# Delete a policy by MongoDB ObjectId
node skills/create-nww-website/references/cms/seeders/policy/delete.js \
  --type privacy \
  --id "65f8a123bc45de6789012345"
```

### 5. Policy Implementation Binary QA Checklist
- [ ] **Static Guardrail:** `ensureStatic = 'navigation'` is exported from `privacy/page.js`, `terms/page.js`, and `refund/page.js`.
- [ ] **Canonical URL:** `generateMetadata` exports `alternates.canonical` pointing to `/privacy`, `/terms`, or `/refund`.
- [ ] **Structured Data:** Valid `DigitalDocument` JSON-LD rendered with `<` Unicode escaping (`\u003c`).
- [ ] **INP Architecture:** Legal policy routes are 100% Server Components with zero root `'use client'` hydration.
- [ ] **Dynamic Sitemap:** `app/sitemap.js` queries `Policy.getSitemap()` and sets priority `0.3` for all legal entries.

