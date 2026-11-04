# Inbound Lead & Form Submission (`Lead`) Specification

This reference provides the unified technical specification for capturing inbound visitor leads, consultation requests, and dynamic form submissions, including data contracts, Server Action handlers, spam protection rules, and verification.

## Table of Contents
- [1. Model & Architecture](#1-model--architecture)
- [2. Implementation on Consultation / Inbound Lead Page [Exact Code without the JSX]](#2-implementation-on-consultation--inbound-lead-page-exact-code-without-the-jsx)
- [3. Implementation of Server Action Handler [Exact Code without the JSX]](#3-implementation-of-server-action-handler-exact-code-without-the-jsx)
- [4. Running the Seeder & Testing Submission [Exact Code without the JSX]](#4-running-the-seeder--testing-submission-exact-code-without-the-jsx)

---

## 1. Model & Architecture

The NWW CMS provides two architectural approaches for capturing inbound visitor leads:
1. **Direct Contact Inquiries:** Handled via `WebsiteContactUs` (`/api/website-contact-us/create-one`).
2. **Dynamic Inbound Leads / Questionnaires:** Handled via the forms engine (`/api/form/:id/submit`) or CRM `Lead` endpoint (`/api/lead/create-one`).

### Schema Fields & Types

```typescript
interface LeadPayload {
  name: string;                                         // Visitor full name (required)
  email: string;                                        // Valid visitor email address (required)
  phone?: string;                                       // Optional telephone / WhatsApp contact
  message?: string;                                     // Inquiry details or project requirements
  service?: string;                                     // Target service interest
  metadata?: Record<string, any>;                       // Custom form fields, campaign UTMs, or referral tags
}
```

---

## 2. Implementation on Consultation / Inbound Lead Page [Exact Code without the JSX]

### Server Component Implementation (`site/app/consultation/page.js`)

```javascript
// site/app/consultation/page.js
import { SEOHelper } from '@/lib/cms';

export const ensureStatic = 'navigation';

export const metadata = SEOHelper.generateMetadata({
  title: 'Book a Consultation | Strategic Advisory',
  description: 'Schedule a tailored discovery consultation with our technical and product architecture team.',
  path: '/consultation',
});

export default function ConsultationPage() {
  return (
    <main data-section="consultation-page">
      {/* Presentation JSX rendered here */}
    </main>
  );
}
```

---

## 3. Implementation of Server Action Handler [Exact Code without the JSX]

### Server Action Implementation (`site/app/actions/lead.js`)

```javascript
// site/app/actions/lead.js
'use server';

import { Lead } from '@/lib/cms';

export async function submitConsultationRequest(prevState, formData) {
  // 1. Honeypot check for bot filtering
  const honeypot = formData.get('bot_field');
  if (honeypot) {
    return { success: true, message: 'Inquiry received.' }; // Silent discard
  }

  // 2. Extract and sanitize inputs
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const phone = String(formData.get('phone') || '').trim();
  const message = String(formData.get('message') || '').trim();
  const service = String(formData.get('service') || '').trim();

  if (!name || !email) {
    return { success: false, error: 'Name and email are required fields.' };
  }

  try {
    const result = await Lead.submit({
      name,
      email,
      phone,
      message,
      metadata: { service, source: 'consultation-page' },
    });

    return { success: true, id: result.id, message: 'Consultation request submitted successfully.' };
  } catch (err) {
    return { success: false, error: err.message || 'Failed to submit consultation request.' };
  }
}
```

---

## 4. Running the Seeder & Testing Submission [Exact Code without the JSX]

Testing inbound form submissions uses `skills/create-nww-website/references/cms/seeders/form/submit.js`.

### 1. Test Ingestion Payload with Dry Run
```bash
# Validates form payload JSON file without network call
node skills/create-nww-website/references/cms/seeders/form/submit.js \
  --form-id "65f8a123bc45de6789012345" \
  --file project-docs/client-review/gate-5-cms-content/forms/test-lead.json \
  --dry-run
```

### 2. Live Test Submission
```bash
# Sends live test submission to backend form ingestion
node skills/create-nww-website/references/cms/seeders/form/submit.js \
  --form-id "65f8a123bc45de6789012345" \
  --file project-docs/client-review/gate-5-cms-content/forms/test-lead.json
```

### 3. Lead Implementation Binary QA Checklist
- [ ] **Honeypot Shield:** Inbound forms include a hidden `bot_field` that silently discards automated submissions.
- [ ] **Server Validation:** Form inputs are validated on the server side prior to dispatching to backend endpoints.
- [ ] **Zero Credential Exposure:** Client components submit strictly through Server Actions; never expose API keys or tokens in client JS bundles.

