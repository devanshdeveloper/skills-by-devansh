# Next Web Works (NWW) CMS Models & Website Modules Catalog

This document provides the definitive catalog of all 25 modules defined in `WebsiteModules` within the NWW CMS backend (`edu-manage-be`), their permission hierarchy, endpoint patterns, and data model mappings.

---

## 1. WebsiteModules Enum Registry

Defined in `src/constants/modules/WebsiteModules.js`:

```javascript
const WebsiteModules = {
    Dashboard: "Dashboard",
    Article: "Article",
    CaseStudy: "Case Study",
    ContactUs: "Contact Us",
    WebsiteEvent: "Website Event",
    WebsitePlan: "Website Plan",
    Gallery: "Gallery",
    Industry: "Industry",
    WebsiteJob: "Website Job",
    Portfolio: "Portfolio",
    Service: "Service",
    Blog: "Blog",
    Testimonials: "Testimonials",
    Features: "Features",
    Documentation: "Documentation",
    Faqs: "FAQs",
    PrivacyPolicy: "Privacy Policy",
    TermsAndConditions: "Terms & Conditions",
    RefundPolicy: "Refund Policy",
    Users: "Users",
    Roles: "Roles",
    Tickets: "Tickets",
    LiveSupport: "Live Support",
    FeatureRequests: "Feature Requests",
    Settings: "Settings",
};
```

### Permissions Hierarchy
- **`UserTypes.Website` (Website Site Token):** Inherits default CRUD permissions across all assigned website modules.
- **`CMS_SITE_KEY`:** A JWT token issued for the website tenant user. It is accepted by all authenticated routes across all website modules.
- **Backend Bypass:** The backend permission middleware explicitly permits `UserTypes.Website` tokens to access and operate on all website-facing content.

---

## 2. Complete Endpoints Matrix

Mount root is `/api`, mounted in `src/index.js` via `UnauthenticatedRoutes` and `AuthenticatedRoutes`.

| Module | Canonical Resource Key | Mount Path | Paginate (List) | Read Single | Create Route | Slug Generator | Delete Route |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Blog** | `blog` | `/api/blog` | `GET /api/blog/paginate` | `GET /api/blog/read-one-by-slug/:slug`<br>`GET /api/blog/read-one/:id` | `POST /api/blog/create-one` | `POST /api/blog/generate-slug` | `DELETE /api/blog/delete-one/:id` |
| **Article** | `article` | `/api/website-article` | `GET /api/website-article/paginate` | `GET /api/website-article/read-one/:id` | `POST /api/website-article/create-one` | `POST /api/website-article/generate-slug` | `DELETE /api/website-article/delete-one/:id` |
| **Service** | `service` | `/api/website-service` | `GET /api/website-service/paginate` | `GET /api/website-service/read-one/:id` | `POST /api/website-service/create-one` | `POST /api/website-service/generate-slug` | `DELETE /api/website-service/delete-one/:id` |
| **Portfolio** | `portfolio` | `/api/website-portfolio` | `GET /api/website-portfolio/paginate` | `GET /api/website-portfolio/read-one/:id` | `POST /api/website-portfolio/create-one` | `POST /api/website-portfolio/generate-slug` | `DELETE /api/website-portfolio/delete-one/:id` |
| **Case Study** | `case-study` | `/api/website-case-study` | `GET /api/website-case-study/paginate` | `GET /api/website-case-study/read-one/:id` | `POST /api/website-case-study/create-one` | `POST /api/website-case-study/generate-slug` | `DELETE /api/website-case-study/delete-one/:id` |
| **Industry** | `industry` | `/api/website-industry` | `GET /api/website-industry/paginate` | `GET /api/website-industry/read-one/:id` | `POST /api/website-industry/create-one` | `POST /api/website-industry/generate-slug` | `DELETE /api/website-industry/delete-one/:id` |
| **Job (Careers)** | `job` | `/api/website-job` | `GET /api/website-job/paginate` | `GET /api/website-job/read-one/:id` | `POST /api/website-job/create-one` | `POST /api/website-job/generate-slug` | `DELETE /api/website-job/delete-one/:id` |
| **Event** | `event` | `/api/website-event` | `GET /api/website-event/paginate` | `GET /api/website-event/read-one/:id` | `POST /api/website-event/create-one` | `POST /api/website-event/generate-slug` | `DELETE /api/website-event/delete-one/:id` |
| **Gallery** | `gallery` | `/api/website-gallery` | `GET /api/website-gallery/paginate` | `GET /api/website-gallery/read-one/:id` | `POST /api/website-gallery/create-one` | `POST /api/website-gallery/generate-slug` | `DELETE /api/website-gallery/delete-one/:id` |
| **Website Plan** | `plan` | `/api/website-plan` | `GET /api/website-plan/paginate` | `GET /api/website-plan/read-one/:id` | `POST /api/website-plan/create-one` | *None* | `DELETE /api/website-plan/delete-one/:id` |
| **Contact Us** | `contact-us` | `/api/website-contact-us` | `GET /api/website-contact-us/paginate` | `GET /api/website-contact-us/read-one/:id` | `POST /api/website-contact-us/create-one` | `POST /api/website-contact-us/generate-slug` | `DELETE /api/website-contact-us/delete-one/:id` |
| **Privacy Policy** | `privacy-policy` | `/api/website-privacy-policy` | `GET /api/website-privacy-policy/paginate` | `GET /api/website-privacy-policy/read-one/:id` | `POST /api/website-privacy-policy/create-one` | *None* | `DELETE /api/website-privacy-policy/delete-one/:id` |
| **Terms & Conditions** | `terms-and-conditions` | `/api/website-terms-and-conditions` | `GET /api/website-terms-and-conditions/paginate` | `GET /api/website-terms-and-conditions/read-one/:id` | `POST /api/website-terms-and-conditions/create-one` | *None` | `DELETE /api/website-terms-and-conditions/delete-one/:id` |
| **Refund Policy** | `refund-policy` | `/api/website-refund-policy` | `GET /api/website-refund-policy/paginate` | `GET /api/website-refund-policy/read-one/:id` | `POST /api/website-refund-policy/create-one` | *None* | `DELETE /api/website-refund-policy/delete-one/:id` |
| **Testimonial** | `testimonial` | `/api/testimonial` | `GET /api/testimonial/paginate` | `GET /api/testimonial/read-one/:id` | `POST /api/testimonial/create-one` | *None* | `DELETE /api/testimonial/delete-one/:id` |
| **FAQ** | `faq` | `/api/faq` | `GET /api/faq/paginate` | `GET /api/faq/read-one/:id` | `POST /api/faq/create-one` | *None* | `DELETE /api/faq/delete-one/:id` |
| **Feature** | `feature` | `/api/feature` | `GET /api/feature/paginate` | `GET /api/feature/read-one/:id` | `POST /api/feature/create-one` | *None* | `DELETE /api/feature/delete-one/:id` |
| **Documentation** | `documentation` | `/api/documentation` | `GET /api/documentation/paginate` | `GET /api/documentation/read-one/:id` | `POST /api/documentation/create-one` | *None* | `DELETE /api/documentation/delete-one/:id` |
| **Product** | `product` | `/api/product` | `GET /api/product/paginate` | `GET /api/product/read-one-by-slug/:slug`<br>`GET /api/product/read-one/:id` | `POST /api/product/create-one` | `POST /api/product/generate-slug` | `DELETE /api/product/delete-one/:id` |
| **Lead (Inquiry)** | `lead` | `/api/lead` | `GET /api/lead/paginate` | `GET /api/lead/read-one/:id` | `POST /api/lead/submit` (Public)<br>`POST /api/lead/create-one` | *None* | `DELETE /api/lead/delete-one/:id` |
| **Page Config** | `page-config` | `/api/website-page-config` | `GET /api/website-page-config/paginate` | `GET /api/website-page-config/read-one-by-slug/:slug`<br>`GET /api/website-page-config/read-one/:id` | `POST /api/website-page-config/create-one` | *None* | `DELETE /api/website-page-config/delete-one/:id` |

---

## 3. Standard Route Architecture

All modules in `edu-manage-be` adhere to the standardized Express helper conventions:
1. **Pagination:** `GET /paginate?page=1&limit=10&search=<term>` returns `{ success: true, data: [...], pagination: { total, page, limit, pages } }`.
2. **Slug Filtering:** While only `Blog` and `Product` have dedicated `/read-one-by-slug/:slug` routes, all other modules supporting slugs can be queried via:
   ```
   GET /api/website-<module>/paginate?slug=<slug>&limit=1
   ```
3. **Creation:** `POST /create-one` accepts standard JSON body, sets default fields, and returns `201 Created` with `{ success: true, data: { _id, ... } }`.
4. **Collision Handling:** MongoDB unique indexes trigger `409 Conflict` handled by `ResponseHelper`.
5. **Slug Generation:** Modules with a slug generator route inspect MongoDB for collisions and return a guaranteed unique increment (`slug-1`, `slug-2`, etc.).

---

## 4. Models Reference Index

Individual specifications, Mongoose schemas, and seed payloads are documented in:

1. [Blog Model Specification](blog.md) — Managed articles, rich text, authors, FAQs, and `metadata` category/tag mapping.
2. [Article Model Specification](article.md) — Multi-author editorial articles, industry & service relations.
3. [Service Model Specification](service.md) — Website services, portfolio linkages, and rich attachments.
4. [Product Model Specification](product.md) — E-commerce and catalog products, price ranges, variants, and custom fields.
5. [Testimonial Model Specification](testimonial.md) — Client quotes, star ratings (1–5), institutions, and avatars.
6. [FAQ Model Specification](faq.md) — Frequently asked questions grouped by string categories.
7. [Lead & Inquiries Specification](lead.md) — Public lead capture (`/api/lead/submit`) and CRM pipeline tracking.
8. [Contact Us Specification](contact-us.md) — Public contact form (`/api/website-contact-us/:id/submit`) and inbound messages.
9. [Case Study Model Specification](case-study.md) — Client success stories, metrics, tags, and media attachments.
10. [Portfolio Model Specification](portfolio.md) — Creative work showcase, image galleries, and industry categorization.
11. [Industry Model Specification](industry.md) — Target market verticals, icons, and landing content.
12. [Job (Careers) Model Specification](job.md) — Employment openings, date windows, geographic locations, and requirements.
13. [Event Model Specification](event.md) — Scheduled conferences, webinars, start/end timestamps, and venue locations.
14. [Gallery Model Specification](gallery.md) — Curated image collections with titles and descriptions.
15. [Website Plan Model Specification](plan.md) — Pricing tiers, billing cycles, feature toggles, and trial settings.
16. [Legal Policies Specification](policy.md) — Privacy Policy, Terms & Conditions, and Refund Policy rich-text documents.
17. [Documentation Model Specification](documentation.md) — Technical guides, knowledge base docs, and hierarchical order.
18. [Feature Model Specification](feature.md) — Product and service feature highlights with icons.
19. [Page-Level Config Model Specification](page-config.md) — Dynamic page builder, SEO metadata overrides, shell layouts, and section re-ordering.
