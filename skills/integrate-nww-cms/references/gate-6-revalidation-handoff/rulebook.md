# Gate 6: Revalidation and Handoff

> **Gate ID:** `6`  
> **Gate Name:** `revalidation-handoff`  
> **Execution Mode:** Webhook Configuration, Rollback Documentation & Manual Test Delivery  
> **State Transition:** `pending` -> `in_progress` -> `awaiting_approval` -> `approved`  

---

## 1. Objective & Non-Negotiable Invariants

Gate 6 configures on-demand ISR revalidation webhooks, prepares disaster-recovery rollback instructions, and delivers an exhaustive **manual test checklist** for every migrated page.

> [!IMPORTANT]
> **Verified Revalidation Support:**
> Revalidation webhooks ARE supported by the NWW CMS backend (verified in `edu-manage-be/src/helpers/notifySite.js`).
> - The CMS backend automatically dispatches an asynchronous `POST` webhook to `website.revalidation_webhook` whenever content is created, updated, or deleted.
> - Webhook headers: `Authorization: Bearer <REVALIDATE_SECRET>`, `Content-Type: application/json`.
> - Payload: `{ "resource": "blog", "operation": "update", "timestamp": 1732278000000 }`.
> - The Next.js site handles this at `/api/revalidate`.
>
> *(Note: The NWW CMS backend does NOT provide a native draft-preview API. Preview must rely on standard Next.js staging/preview deployments with robots noindex).*

> [!IMPORTANT]
> **No Automated Tests Constraint:**
> Per workflow discipline, do not generate unit, integration, or e2e test scripts. Verification is performed manually by the human operator using the delivered manual test checklist.

> [!IMPORTANT]
> **Human Approval Barrier:**
> Final completion requires the exact verbatim phrase:
> `APPROVE GATE 6`

---

## 2. Revalidation Webhook Route Implementation

### App Router (`app/api/revalidate/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import crypto from 'node:crypto';
import { ALLOWED_RESOURCES, tagFor } from '@/lib/cms';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const secret = process.env.REVALIDATE_SECRET;

  if (!secret) {
    console.error('[Revalidate] REVALIDATE_SECRET is not configured on server.');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const providedToken = authHeader.slice(7).trim();

  // Constant-time comparison to prevent timing attacks
  const tokenHash = crypto.createHash('sha256').update(providedToken).digest();
  const secretHash = crypto.createHash('sha256').update(secret).digest();

  if (!crypto.timingSafeEqual(tokenHash, secretHash)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const resource = String(body.resource || '').toLowerCase().trim();

    if (!ALLOWED_RESOURCES.includes(resource as any)) {
      return NextResponse.json(
        { error: `Invalid resource. Must be one of: ${ALLOWED_RESOURCES.join(', ')}` },
        { status: 400 }
      );
    }

    const tag = tagFor(resource);
    revalidateTag(tag);

    console.log(`[Revalidate] Successfully purged cache tag: ${tag}`);
    return NextResponse.json({ revalidated: true, tag, timestamp: Date.now() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Invalid request body' }, { status: 400 });
  }
}
```

---

## 3. Rollback Runbook (`.nww-cms/handoff.md`)

Document clear rollback and recovery procedures:
1. **Fallback Content Safety Net:** If the CMS backend suffers downtime or latency, the application remains fully online rendering hardcoded fallback dictionaries embedded during Gate 4.
2. **Git Rollback:** Every gate was applied in atomic steps. To roll back an individual page or the CMS client entirely:
   ```bash
   git log --oneline -n 10
   git revert <commit-hash>
   ```
3. **Environment Toggle:** Setting `CMS_TOKEN=""` causes `cmsFetch` to gracefully log a warning and return `null`, automatically activating client fallback content without breaking the page.

---

## 4. Manual Test Checklist Per Migrated Page

Deliver an exhaustive, non-automated test checklist for the operator:

```markdown
# Manual Verification Checklist

## Global Chrome & Shell Verification
- [ ] Brand name renders correctly from `SITE_NAME` in Navigation and Footer.
- [ ] Theme toggles, navigation links, and mobile drawer function without visual regression.
- [ ] Zero missing CSS classes or layout shift (CLS) compared to pre-migration baseline.

## Per-Page Layout & Content Verification

### Route: `/` (Homepage)
- [ ] Hero headline and badge load dynamic copy from `WebsitePageConfig.hero*`.
- [ ] Fallback test: Temporarily change `CMS_TOKEN` to invalid string -> Verify homepage loads fallback content with 0 fatal errors.
- [ ] Accordion FAQs expand and collapse properly; answers match CMS content.
- [ ] CTA banner headline, button text, and destination link match CMS config.
- [ ] Verified that all image placeholders render or display approved assets from `.nww-cms/images/home.json`.

### Route: `/about`
- [ ] Story and mission copy load from CMS data access helper.
- [ ] Team cards / custom sections preserve original Tailwind layout.
- [ ] Fallback copy displays gracefully on simulated network timeout.

### Route: `/blog` and `/blog/[slug]`
- [ ] Blog index displays published posts list with titles, dates, and excerpt thumbnails.
- [ ] Blog detail route (`/blog/[slug]`) renders rich HTML body text with proper typography (`prose` classes).
- [ ] Dynamic tags display correctly matching `WebsiteTag` colors.

## SEO & Schema Verification
- [ ] Inspect `<head>` on homepage: Title, meta description, and canonical URL match CMS.
- [ ] View Page Source: `<script type="application/ld+json">` contains valid Schema.org structure with `<` escaped as `\u003c`.
- [ ] Open Graph preview: Inspect `og:title`, `og:description`, and `og:image`.
- [ ] Navigate to `/sitemap.xml`: Verify all published CMS slugs are present.
- [ ] Navigate to `/robots.txt`: Verify valid crawl directives and sitemap URL.

## On-Demand Revalidation Webhook Verification
- [ ] Execute test curl to revalidation endpoint with invalid token -> Assert HTTP 401:
  `curl -i -X POST -H "Authorization: Bearer bad-token" -H "Content-Type: application/json" -d '{"resource":"blog"}' http://localhost:3000/api/revalidate`
- [ ] Execute test curl with valid `REVALIDATE_SECRET` -> Assert HTTP 200 `{ "revalidated": true, "tag": "cms:blog" }`.
```

---

## 5. Gate 6 Sign-Off

1. Set Gate 6 status to `awaiting_approval`:
   ```bash
   node <path-to-skill>/scripts/cms-state.mjs set-status 6 awaiting_approval
   ```
2. Present `.nww-cms/handoff.md` and the manual test checklist in chat.
3. Prompt user for Gate 6 approval:
   ```markdown
   > [!IMPORTANT]
   > Please review `.nww-cms/handoff.md` and the manual verification checklist.
   > To finalize the integration and complete Gate 6, respond with:
   > `APPROVE GATE 6`
   ```
4. Upon receiving `APPROVE GATE 6`:
   ```bash
   node <path-to-skill>/scripts/cms-state.mjs approve 6 "APPROVE GATE 6"
   ```
