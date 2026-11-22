# WebsiteFAQ Model Reference

> **Collection:** `website-faqs`  
> **Endpoint:** `/api/website-faq`  
> **Scope:** Common Inquiries & Accordions  

## 1. Schema Specifications

- **`question`**: String (required)
- **`answer`**: String (required)
- **`category`**: String (e.g. `billing`, `technical`, `general`)
- **`order`**: Number
- **`status`**: Enum (`draft`, `published`, `archived`)

> [!NOTE]
> FAQs can also be embedded directly within `WebsitePageConfig.faqs` for page-scoped accordions.
