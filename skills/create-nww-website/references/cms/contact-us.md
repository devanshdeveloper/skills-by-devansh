
# Contact Us Module & Integration Specification

This reference provides the unified technical specification for the NWW CMS `WebsiteContactUs` module, including its data contract, Server Component page implementation, Next.js Server Action submission handler, security rules, and companion seeder workflows.

## Table of Contents
- [1. Model & Architecture (Module vs. Forms)](#1-model--architecture-module-vs-forms)
- [2. Implementation on Contact Page [Exact Code without the JSX]](#2-implementation-on-contact-page-exact-code-without-the-jsx)
- [3. Implementation of Server Action Handler [Exact Code without the JSX]](#3-implementation-of-server-action-handler-exact-code-without-the-jsx)
- [4. Running the Seeder [Exact Code without the JSX]](#4-running-the-seeder-exact-code-without-the-jsx)

---

## 1. Model & Architecture (Module vs. Forms)

The NWW CMS provides two distinct architectural mechanisms for capturing inbound visitor messages:

### Direct Module: `WebsiteContactUs` (Target for this Runbook)
- **REST Route Slug:** `website-contact-us`
- **Backend Endpoints:**
  - `POST /api/website-contact-us/create-one` (Direct creation of contact inquiry)
  - `GET /api/website-contact-us/paginate` (Admin listing of inquiries)
  - `GET /api/website-contact-us/read-one/:id` (Single inquiry view)
  - `PUT /api/website-contact-us/update-one/:id` (Update inquiry status)
  - `DELETE /api/website-contact-us/delete-one/:id` (Soft/hard delete inquiry)
- **Behavior:** Strictly validates standard business inquiry fields in MongoDB. Ideal for dedicated Contact pages, VIP consultation forms, and standard inquiries.

### Generic Forms Engine (`/api/form/:id/submit`)
- Dynamically stores arbitrary questionnaire answers in `FormResponse.responses: [{ field, value }]` keyed to a specific form ID. Used when arbitrary dynamic surveys or lead magnets are required.

---

### Schema Fields & Types

```typescript
interface WebsiteContactUsInquiry {
  _id: string;                                          // MongoDB ObjectId string
  firstName: string;                                    // Sender first name (required)
  lastName: string;                                     // Sender last name (required)
  email: string;                                        // Sender email address (valid email format, required)
  phone: string;                                        // Sender telephone number (required)
  message: string;                                      // Message body text (required)
  status: 'pending' | 'replied' | 'closed';             // Workflow status (default: 'pending')
  user?: string;                                        // Tenant user ObjectId reference
  website?: string;                                     // Website ObjectId reference
  isDeleted?: boolean;                                  // Soft-delete flag (default: false)
  editTimeFields?: boolean;                             // Must be true when specifying custom timestamps
  createdAt?: string;                                   // ISO 8601 creation timestamp
  updatedAt?: string;                                   // ISO 8601 modification timestamp
}
```

### Security Rule: Server-Side Execution Only
Inquiries submitted via `POST /api/website-contact-us/create-one` require the `CMS_TOKEN` authorization header. Because `CMS_TOKEN` is a write-capable credential, **it must never be exposed to the browser bundle**. All submissions must execute through a **Next.js Server Action** or an internal API route (`site/app/api/contact/route.js`).

---

## 2. Implementation on Contact Page [Exact Code without the JSX]

### Server Component Implementation (`site/app/contact/page.js`)

```javascript
// site/app/contact/page.js
import { ContactUs } from '@/lib/cms';
import { Schema } from '@/components/seo/Schema';

// Enforce build-time static validation for page chrome
export const ensureStatic = 'navigation';

export const metadata = ContactUs.generateMetadata({
  title: 'Contact Us | Get in Touch',
  description: 'Reach out to discuss your project, request a consultation, or speak with our engineering team.',
  path: '/contact',
});

export default async function ContactPage() {
  'use cache';

  // Company contact details and metadata
  const contactInfo = {
    email: 'contact@example.com',
    phone: '+1 (555) 019-2834',
    address: {
      street: '100 Innovation Way, Suite 400',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      country: 'United States',
    },
    hours: 'Monday – Friday: 9:00 AM – 6:00 PM PST',
  };

  // Structured Data via ContactUs model helper
  const jsonLd = ContactUs.generateJSONLD({
    title: 'Contact Us',
    email: contactInfo.email,
    phone: contactInfo.phone,
    address: contactInfo.address,
  });

  // Return data payload to page presentation layer
  return (
    <main data-section="contact-page">
      <Schema schema={jsonLd} />
      {/* Presentation JSX receives contactInfo and renders Client Form Component */}
    </main>
  );
}
```

---

## 3. Implementation of Server Action Handler [Exact Code without the JSX]

### Server Action Implementation (`site/app/contact/actions.js`)

```javascript
// site/app/contact/actions.js
'use server';

import { ContactUs } from '@/lib/cms';

/**
 * Handles contact form submissions directly from Client Components.
 * Executes strictly on the server to protect CMS_TOKEN.
 *
 * @param {any} prevState
 * @param {FormData|object} formData
 * @returns {Promise<{ success: boolean, message?: string, error?: string, id?: string }>}
 */
export async function handleContactSubmission(prevState, formData) {
  try {
    // Extract fields from FormData or plain object
    const rawData = formData instanceof FormData
      ? Object.fromEntries(formData.entries())
      : formData;

    const firstName = String(rawData.firstName || '').trim();
    const lastName = String(rawData.lastName || '').trim();
    const email = String(rawData.email || '').trim().toLowerCase();
    const phone = String(rawData.phone || '').trim();
    const message = String(rawData.message || '').trim();

    // Field-level validation
    if (!firstName || firstName.length < 2) {
      return { success: false, error: 'First name is required (min 2 characters).' };
    }
    if (!lastName || lastName.length < 2) {
      return { success: false, error: 'Last name is required (min 2 characters).' };
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, error: 'A valid email address is required.' };
    }
    if (!phone || phone.length < 7) {
      return { success: false, error: 'A valid phone number is required.' };
    }
    if (!message || message.length < 10) {
      return { success: false, error: 'Message must contain at least 10 characters.' };
    }

    // Submit directly to NWW CMS via class helper ContactUs.submit
    const result = await ContactUs.submit({
      firstName,
      lastName,
      email,
      phone,
      message,
    });

    return {
      success: true,
      message: 'Thank you for reaching out! Our team will contact you shortly.',
      id: result?.id,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'An unexpected error occurred while sending your message. Please try again.',
    };
  }
}
```

---

## 4. Running the Seeder [Exact Code without the JSX]

The standalone Contact Us seeder scripts reside in `skills/create-nww-website/references/cms/seeders/contact-us/` and operate on JSON files in `project-docs/client-review/gate-5-cms-content/contact-us/`.

### 1. Validate & Dry Run
```bash
# Validates schema rules, required fields, and email format without network writes
node skills/create-nww-website/references/cms/seeders/contact-us/insert.js \
  --dir project-docs/client-review/gate-5-cms-content/contact-us \
  --dry-run
```

### 2. Live Seeding Test Inquiries
```bash
# Live insertion of seed inquiries into WebsiteContactUs
node skills/create-nww-website/references/cms/seeders/contact-us/insert.js \
  --dir project-docs/client-review/gate-5-cms-content/contact-us
```

### 3. Updating an Inquiry Status
```bash
# Update inquiry status to 'replied' or 'closed' by MongoDB ObjectId
node skills/create-nww-website/references/cms/seeders/contact-us/update.js \
  --id "65f8a123bc45de6789012345" \
  --file project-docs/client-review/gate-5-cms-content/contact-us/status-update.json
```

### 4. Deleting an Inquiry
```bash
# Delete an inquiry by MongoDB ObjectId
node skills/create-nww-website/references/cms/seeders/contact-us/delete.js \
  --id "65f8a123bc45de6789012345"
```

### 5. Contact Us Implementation Binary QA Checklist
- [ ] **Static Guardrail:** `ensureStatic = 'navigation'` is exported from `contact/page.js`.
- [ ] **Canonical URL:** `generateMetadata` exports `alternates.canonical` pointing to `/contact`.
- [ ] **Structured Data:** Valid `ContactPage` JSON-LD rendered with `<` Unicode escaping (`\\u003c`).
- [ ] **Server Action Protection:** Form submission calls `'use server'` action; `CMS_TOKEN` is never exposed in client bundles.
- [ ] **Validation:** All 5 fields (`firstName`, `lastName`, `email`, `phone`, `message`) validate before dispatch.
- [ ] **Accessible UX:** Form inputs include explicit `<label>`, ARIA invalid states, and clear submission feedback messages.
