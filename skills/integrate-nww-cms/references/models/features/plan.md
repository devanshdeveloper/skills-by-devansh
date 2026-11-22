# WebsitePlan Model Reference

> **Collection:** `website-plans`  
> **Endpoint:** `/api/website-plan`  
> **Scope:** Pricing Tiers & Subscription Packages  

## 1. Schema Specifications

- **`name`**: String (Tier name, required, e.g. `Starter`, `Growth`, `Enterprise`)
- **`slug`**: String (required, unique)
- **`price`**: Number / String
- **`interval`**: Enum (`monthly`, `yearly`, `one-time`)
- **`description`**: String
- **`features`**: Array of Strings (Bullet points)
- **`isPopular`**: Boolean (Highlights tier)
- **`status`**: Enum (`draft`, `published`, `archived`)
