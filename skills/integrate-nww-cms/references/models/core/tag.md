# WebsiteTag Model Reference

> **Collection:** `website-tags`  
> **Endpoint:** `/api/website-tag`  
> **Scope:** Unified Categorization Taxonomy  

## 1. Schema Specifications

- **`name`**: String (Display title, required)
- **`slug`**: String (URL-safe identifier, required, unique)
- **`color`**: String (Hex code or Tailwind badge color)
- **`type`**: Enum (`blog`, `portfolio`, `service`, `tool`)
- **`status`**: Enum (`active`, `archived`)

> [!NOTE]
> All content models with tags (Blog, Portfolio, Service, Tool) store ObjectId references to documents in this collection.
