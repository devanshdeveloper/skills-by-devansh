# Blog Model Reference

> **Collection:** `blogs`  
> **Endpoint:** `/api/blog`  
> **Scope:** Editorial Articles & Company News  

## 1. Schema Specifications

- **`title`**: String (required)
- **`slug`**: String (required, unique, slugified)
- **`content`**: String (HTML body from rich text editor)
- **`image`**: String (thumbnail image upload URL)
- **`cover_image`**: String (banner / hero image upload URL)
- **`author_name`**: String
- **`author_image`**: String (avatar URL)
- **`author_id`**: String / ObjectId ref
- **`postedAt`**: Date
- **`lastUpdatedAt`**: Date
- **`metaTitle`**: String
- **`metaDescription`**: String
- **`tags`**: Array of ObjectIds referencing `WebsiteTag`
- **`status`**: Enum (`draft`, `pending`, `published`, `rejected`, `archived`)

## 2. Server Component Fetch Pattern

```typescript
import { Blog } from '@/lib/cms';

export default async function BlogIndexPage() {
  const posts = await Blog.paginate({ status: 'published' });
  return <BlogGrid posts={posts} />;
}
```
