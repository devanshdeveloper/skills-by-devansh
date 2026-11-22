# WebsiteService Model Reference

> **Collection:** `website-services`  
> **Endpoint:** `/api/website-service`  
> **Scope:** Business & Technical Services  

## 1. Schema Specifications

- **`title`**: String (required)
- **`slug`**: String (required, unique)
- **`tagline`**: String
- **`description`**: String
- **`content`**: String (Rich text HTML)
- **`icon`**: String (Image upload URL — NOT SVG code or CSS class)
- **`image`**: String (Featured image upload URL)
- **`features`**: Array of Strings
- **`benefits`**: Array of Strings
- **`pricing`**: Object / String
- **`tags`**: Array of ObjectIds referencing `WebsiteTag`
- **`status`**: Enum (`draft`, `published`, `archived`)

## 2. Server Component Fetch Pattern

```typescript
import { Service } from '@/lib/cms';

export default async function ServicesPage() {
  const services = await Service.paginate();
  return <ServiceGrid items={services} />;
}
```
