# WebsiteCaseStudy Model Reference

> **Collection:** `website-case-studies`  
> **Endpoint:** `/api/website-case-study`  
> **Scope:** Enterprise Proof & Client Outcomes  

## 1. Schema Specifications

- **`title`**: String (required)
- **`slug`**: String (required, unique)
- **`client`**: String (Client brand name)
- **`industry`**: String / Industry ref
- **`summary`**: String (Executive overview)
- **`challenge`**: String (The business bottleneck)
- **`solution`**: String (The technical implementation)
- **`results`**: Array of Objects: `[{ metric: String, label: String }]` (e.g. `+340%`, `Revenue Growth`)
- **`testimonial`**: Object / Testimonial ref
- **`image`**: String (Hero proof image upload URL)
- **`tags`**: Array of ObjectIds referencing `WebsiteTag`
- **`status`**: Enum (`draft`, `published`, `archived`)
