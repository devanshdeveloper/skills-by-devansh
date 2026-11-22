# WebsiteEvent Model Reference

> **Collection:** `website-events`  
> **Endpoint:** `/api/website-event`  
> **Scope:** Webinars, Workshops & Company Events  

## 1. Schema Specifications

- **`title`**: String (Event title, required)
- **`slug`**: String (required, unique)
- **`description`**: String (Rich text summary)
- **`startDate`**: Date
- **`endDate`**: Date
- **`location`**: String (`Online`, or physical venue address)
- **`url`**: String (Registration / stream link)
- **`image`**: String (Event cover image upload URL)
- **`status`**: Enum (`draft`, `published`, `archived`)
