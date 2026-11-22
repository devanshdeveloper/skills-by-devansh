# WebsitePortfolio Model Reference

> **Collection:** `website-portfolios`  
> **Endpoint:** `/api/website-portfolio`  
> **Scope:** Client Projects & Showcase Work  

## 1. Schema Specifications

- **`title`**: String (required)
- **`slug`**: String (required, unique)
- **`client`**: String
- **`description`**: String
- **`content`**: String (Rich text HTML)
- **`image`**: String (Main cover image URL)
- **`gallery`**: Array of Strings (Image URLs)
- **`services`**: Array of Strings / Service refs
- **`tags`**: Array of ObjectIds referencing `WebsiteTag`
- **`featured`**: Boolean (default `false`)
- **`liveUrl`**: String
- **`completedAt`**: Date
- **`status`**: Enum (`draft`, `published`, `archived`)

## 2. Server Component Fetch Pattern

```typescript
import { Portfolio } from '@/lib/cms';

export default async function PortfolioPage() {
  const projects = await Portfolio.paginate();
  return <ProjectGrid projects={projects} />;
}
```
