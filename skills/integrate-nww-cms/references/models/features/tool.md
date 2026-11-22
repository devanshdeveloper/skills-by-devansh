# WebsiteTool & ToolCategory Model Reference

> **Collections:** `website-tools`, `website-tool-categories`  
> **Endpoints:** `/api/website-tool`, `/api/website-tool-category`  
> **Scope:** Interactive Tools & Calculators Directory  

## 1. Schema Specifications

### `WebsiteToolCategory`
- **`name`**: String (Category name, required)
- **`slug`**: String (required, unique)
- **`description`**: String
- **`icon`**: String (Image upload URL)

### `WebsiteTool`
- **`title`**: String (Tool title, required)
- **`slug`**: String (required, unique)
- **`tagline`**: String
- **`description`**: String
- **`icon`**: String (Image upload URL)
- **`url`**: String (Destination or embed URL)
- **`category`**: ObjectId ref to `WebsiteToolCategory`
- **`tags`**: Array of ObjectIds referencing `WebsiteTag`
- **`pricingModel`**: String (`Free`, `Freemium`, `Paid`)
- **`status`**: Enum (`draft`, `published`, `archived`)
