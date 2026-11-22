# WebsiteArticle Model Reference

> **Collection:** `website-articles`  
> **Endpoint:** `/api/website-article`  
> **Scope:** Long-Form Technical Articles & Guides  

## 1. Schema Specifications

- **`title`**: String (required)
- **`slug`**: String (required, unique)
- **`excerpt`**: String
- **`content`**: String (HTML body from rich text editor)
- **`author`**: String
- **`image`**: String (Featured image upload URL)
- **`tags`**: Array of ObjectIds referencing `WebsiteTag`
- **`status`**: Enum (`draft`, `published`, `archived`)
