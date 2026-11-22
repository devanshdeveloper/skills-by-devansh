# WebsiteGallery Model Reference

> **Collection:** `website-galleries`  
> **Endpoint:** `/api/website-gallery`  
> **Scope:** Visual Media Albums & Portfolios  

## 1. Schema Specifications

- **`title`**: String (Album title, required)
- **`slug`**: String (required, unique)
- **`description`**: String
- **`images`**: Array of Strings (Uploaded media URLs)
- **`status`**: Enum (`draft`, `published`, `archived`)
