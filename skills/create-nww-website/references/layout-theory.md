# Layout Theory & Section Architecture Specification

Stage 5 deconstructs every page from `project-docs/page-list.md` into discrete, responsive section blueprints grounded in live reference research.

Deliverables are saved per-page to `page-specs/<slug>/layout.md` and across pages to `project-docs/layout-system.md`.

---

## Research Protocol

1. **Live-Fetch Reference Layouts:** Fetch liked and disliked reference websites before drawing structural conclusions. Extract section orders, hero patterns, grid systems, and content density changes.
2. **Attribution:** Clearly attribute each section's structural choice to a client-provided reference, agent-sourced research, or the page's primary conversion CTA.
3. **Research Bounds:** Maximum 3 fetches per page type across references, and 25 fetches total. If a URL blocks access, mark as "unverified" and fall back to the client's description.

---

## Component Architecture & Promotion Rule (2+ Pages)

To keep code maintainable, avoid duplicate components, and prevent monolithic files:
1. **Route-Specific Components:**
   - Section components unique to a page live in `site/app/<route>/_components/<SectionName>.js`.
   - Thin page server component (`page.js`) must remain **<= 80 lines**.
   - Section components must remain **<= 250 lines** (hard limit 300).
   - Every section file must open with the section comment:
     ```javascript
     // section: <id>
     ```
2. **Shared Component Promotion Rule (2+ Pages):**
   - Any component reused across **2 or more pages** (or global shell elements like Nav, Footer, and `ResponsiveImage`) is promoted to `site/components/`.
   - The components directory is **flat**: `site/components/<ComponentName>.js`. Client animation wrappers reside in `site/components/motion/<WrapperName>.js`. Nested directories like `ui/` or `shared/` are not used.

---

## Deliverable Structure 1: Per-Page Layout Blueprint (`page-specs/<slug>/layout.md`)

Each page in `project-docs/page-list.md` receives a dedicated blueprint file:

```markdown
# Layout Blueprint: [Page Name] ([Static | Dynamic])
Route: /route-path
Layout pattern: [e.g. Single-column narrative scroll with sticky visual]
Heading hierarchy & Links: Planned single H1 location, H2/H3 sequence, internal links, breadcrumbs

## Section-by-Section Breakdown

### Section 1: `home-s1-hero`
- Section Name: Hero
- Content: Value proposition headline, subheadline, dual action buttons, hero visual
- Layout notes: Two-column desktop (60/40 text vs visual), stacking vertically on mobile. Generous vertical padding.
- Why this section/order: Client reference analysis (Aesop hero structure)
- Component type: Server Component (renders Client Component wrapper for motion)
- Component file: `site/app/(marketing)/_components/HeroSection.js`
- Scope: page-local
- Motion intent: hero entrance: orchestrates the page's one bold moment (smooth staggered entrance).
- Content capacity:
  - Headline: max 70 chars
  - Subhead: max 160 chars
  - Button text: max 25 chars
  - Media: 1 image, aspect ratio `--ratio-hero`, role: `LCP candidate`

### Section 2: `home-s2-social-proof`
- Section Name: Social Proof
- Content: Partner logos and client validation badges
- Layout notes: Full-width container, horizontal flex wrap with grayscale filter
- Why this section/order: Builds credibility immediately following hero
- Component type: Server Component
- Component file: `site/app/(marketing)/_components/SocialProofSection.js`
- Scope: page-local
- Motion intent: static by design (no gratuitous movement)
- Content capacity:
  - Logos: 5–8 items, role: `icon`

[... Repeat for all sections on this page ...]

## Responsive Notes
- Notes on sticky elements, desktop-to-mobile grid collapsing, and mobile drawer transitions.

## Consistency Check
- Validates that spacing tokens and layout rhythms align with adjacent pages.
```

---

## Deliverable Structure 2: Cross-Page Layout System (`project-docs/layout-system.md`)

`project-docs/layout-system.md` documents shared system components:

```markdown
# Cross-Page Layout System

## Research Log
- Sources fetched and page counts analyzed during research.

## Shared Components (Reused across 2+ pages)
- `Nav`: Global sticky navigation header. Text fields: Nav links, CTA label. Capacity: links <= 20 chars. Media: Logo variant.
- `Footer`: Global site footer. Text fields: Company summary, column link labels, copyright. Capacity: summary <= 150 chars. Media: Reversed logo variant.
- `CTABanner`: Pre-footer conversion callout. Text fields: Heading, subhead, button label. Capacity: heading <= 60 chars, subhead <= 140 chars.
- `ResponsiveImage`: Manifest-driven image component rendering srcset, sizes, and LQIP blur placeholders.

## Layout Inconsistencies Resolved
- Explicit resolutions for conflicting patterns discovered during multi-page research.
```

---

## Taste & Motion Rules

- **Motion Discipline:** Every section defaults to `static by design`. At most **one section per page** may be designated as the "bold moment" (typically the hero).
- **Ban Uniform Entrances:** Do not apply uniform fade-and-slide-up animations across all sections of a page.
- **Server-Rendered Presence:** All text and layout containers must be fully present in initial server-rendered HTML. Animations run strictly post-hydration.

---

## Gate 5 Review Checklist

Before presenting to the user for Gate 5 sign-off:
- [ ] Every page in `page-list.md` has a blueprint at `page-specs/<slug>/layout.md`.
- [ ] Cross-page shared components cataloged in `project-docs/layout-system.md`.
- [ ] Component promotion rule strictly enforces 2+ pages into flat `site/components/`.
- [ ] Motion intent defaults to `static by design` with at most one bold moment per page.
- [ ] Every section defines exact content capacity and media roles (exactly one LCP candidate).
- [ ] User approves Layout Theory before initiating Stage 6 (Content & Assets).
