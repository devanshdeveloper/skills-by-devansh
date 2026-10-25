# Page List & Information Architecture Specification

Stage 3 builds the complete sitemap, route hierarchy, and navigation structure. The output file `project-docs/client-review/gate-3-page-list/page-list.md` is formatted as a **markdown checklist** that serves as the single source of truth for page completion throughout Stages 6, 7, and 8.

Do NOT generate `page-design-notes.md`. Do not create any additional markdown files.

---

## Deliverable Structure (`project-docs/client-review/gate-3-page-list/page-list.md`)

`project-docs/client-review/gate-3-page-list/page-list.md` must be formatted as an actionable markdown checklist organized into 5 logical categories:

```markdown
# Page List & Master Build Tracker

## Core Pages
- [ ] Home
  - Slug: home
  - Route: /
  - Content owner: client
  - Purpose: Primary conversion hub communicating core UVP and guiding visitors to lead capture.
  - Key sections: Hero, Social Proof, Capabilities Grid, How It Works, Testimonials, FAQ, CTA Banner
  - Primary CTA: Book a Discovery Call -> /contact
  - Source signal: Client inspiration reference
  - Type: Static
  - Template group: none

- [ ] About Us
  - Slug: about
  - Route: /about
  - Content owner: client
  - Purpose: Communicate mission, founding story, leadership credentials, and corporate values.
  - Key sections: Hero, Mission Statement, Company Timeline, Leadership Grid, Culture & Values, CTA Banner
  - Primary CTA: Join Our Team -> /careers
  - Source signal: Standard service business
  - Type: Static
  - Template group: none

## Dynamic / Templated Pages
- [ ] Blog Post Template (1 per article, ~25 entries expected)
  - Slug: blog-post
  - Route: /blog/[slug]
  - Content owner: client
  - Purpose: Editorial thought leadership, organic topical authority, and lead capture.
  - Key sections: Article Hero, Sticky Table of Contents, HTML Rich Text Body, Author Bio, Related Articles Grid, Newsletter CTA
  - Primary CTA: Subscribe to Insights -> /newsletter
  - Source signal: Standard editorial template
  - Type: Dynamic
  - Template group: Blog
  - Data source: cms
  - Entries expected: 25

## Secondary / Utility Pages
- [ ] Contact & Inquiries
  - Slug: contact
  - Route: /contact
  - Content owner: client
  - Purpose: Direct lead capture and client consultation booking.
  - Key sections: Contact Hero, Direct Form Component, Office Locations, Support Channels
  - Primary CTA: Submit Inquiry -> /api/website-contact-us/:id/submit
  - Source signal: Corporate intake
  - Type: Static
  - Template group: none

## Utility / System Pages
- [ ] 404 Not Found
  - Slug: not-found
  - Route: app/not-found.js
  - Content owner: agency
  - Purpose: Graceful handling of missing routes and redirecting lost traffic back into navigation.
  - Key sections: Headline, Explanatory Message, Search Bar / Quick Links
  - Primary CTA: Return Home -> /
  - Source signal: Standard Next.js convention
  - Type: Static
  - Template group: none

- [ ] 500 Server Error
  - Slug: error
  - Route: app/error.js
  - Content owner: agency
  - Purpose: Graceful error boundary recovery.
  - Key sections: Error Notice, Retry Button
  - Primary CTA: Try Again -> window.location.reload()
  - Source signal: Standard Next.js convention
  - Type: Static
  - Template group: none

## Legal / Compliance Pages
- [ ] Privacy Policy
  - Slug: privacy-policy
  - Route: /privacy-policy
  - Content owner: client (agency drafts labeled skeleton)
  - Purpose: Regulatory GDPR/CCPA data disclosure.
  - Key sections: Policy Header, Information Collection, Cookies, User Rights, Contact Information
  - Primary CTA: Contact Privacy Officer -> /contact
  - Source signal: Compliance requirement
  - Type: Static
  - Template group: Legal

- [ ] Terms of Service
  - Slug: terms
  - Route: /terms
  - Content owner: client (agency drafts labeled skeleton)
  - Purpose: Governing agreement for site usage.
  - Key sections: Agreement Terms, Intellectual Property, Limitation of Liability, Governing Law
  - Primary CTA: None
  - Source signal: Compliance requirement
  - Type: Static
  - Template group: Legal
```

---

## Tracking and Preservation Rules

1. **Single Source of Completion:** The router's `page-list.md` checkboxes (`- [x] Page Name`) are the single official record of page completion.
2. **Preserve Checkbox State:** When updating or regenerating this file, always preserve existing checked states. Never reset completed checkboxes.
3. **Deprecating Pages:** If a page is removed during client review, strike through the item rather than silently deleting it:
   ```markdown
   - ~~[ ] Careers~~ (removed per client request)
   ```
4. **Batch Approvals for Template Groups:** Pages sharing an identical `Template group` (e.g., `Legal`) may be built and approved in batch after the first representative page of that group has been individually approved.

---

## Gate 3 Review Checklist

Before presenting to the user for Gate 3 sign-off:
- [ ] Every core, secondary, dynamic, utility, and compliance page is cataloged.
- [ ] Routes follow Next.js App Router kebab-case conventions.
- [ ] Dynamic pages specify data source (`cms` or `site/data`) and expected entry count.
- [ ] User approves `project-docs/client-review/gate-3-page-list/page-list.md` before initiating Stage 4 (SEO Strategy).
- [ ] Zero unstated markdown files were generated (no `page-design-notes.md`).
