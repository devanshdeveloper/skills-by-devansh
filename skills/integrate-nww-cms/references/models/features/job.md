# WebsiteJob Model Reference

> **Collection:** `website-jobs`  
> **Endpoint:** `/api/website-job`  
> **Scope:** Career Postings & Hiring Directory  

## 1. Schema Specifications

- **`title`**: String (Role title, required)
- **`slug`**: String (required, unique)
- **`department`**: String (e.g. `Engineering`, `Design`, `Operations`)
- **`location`**: String (`Remote`, `Hybrid`, `On-site`)
- **`type`**: Enum (`full-time`, `part-time`, `contract`, `internship`)
- **`description`**: String (Role overview HTML)
- **`requirements`**: Array of Strings
- **`status`**: Enum (`active`, `closed`, `draft`)
