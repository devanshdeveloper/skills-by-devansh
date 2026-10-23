# Blog Model Specification (`Blog`)

The `Blog` module is the primary managed editorial content model in NWW CMS, with rich HTML text, author attribution, FAQ embeds, and SEO metadata.

---

## 1. Endpoints

- **Mount Path:** `/api/blog` (Public: `/api/blog/public`)
- **Paginate (List):** `GET /api/blog/paginate` (Public: `GET /api/blog/public/paginate`)
- **Read by Slug:** `GET /api/blog/read-one-by-slug/:slug` (Public: `GET /api/blog/public/read-by-slug/:slug`)
- **Read by ID:** `GET /api/blog/read-one/:id`
- **Create Post:** `POST /api/blog/create-one`
- **Slug Generator:** `POST /api/blog/generate-slug` (Body: `{ "title": "..." }`)
- **Update Post:** `PUT /api/blog/update-one/:id`
- **Delete Post:** `DELETE /api/blog/delete-one/:id` or `DELETE /api/blog/soft-delete-one/:id`
- **Revalidation Tag:** `cms:blog`

---

## 2. Mongoose Schema Details

From `edu-manage-be/src/features/blog/blog.model.js`:

| Field | Type | Required | Constraints / Notes |
| :--- | :--- | :--- | :--- |
| `title` | `String` | **Yes** | Min length: 2 characters (trimmed). |
| `slug` | `String` | **Yes** | Unique index (`unique: true`). Kebab-case (`/^[a-z0-9]+(?:-[a-z0-9]+)*$/`). |
| `content` | `String` | **Yes** | HTML rich-text body. |
| `status` | `String` | Optional | Enum: `['draft', 'pending', 'published', 'rejected', 'archived']`. Default: `'draft'`. |
| `cover_image` | `String` | Optional | Banner/hero image URL (1200x630px). |
| `image` | `String` | Optional | Card thumbnail and OG hero image URL. |
| `order` | `Number` | Optional | Display order sort priority (default: `0`). |
| `metaTitle` | `String` | Optional | SEO title (defaults to `title`). |
| `metaDescription` | `String` | Optional | SEO meta description (defaults to 155-char clean excerpt). |
| `author_name` | `String` | Optional | Author display name. |
| `author_image` | `String` | Optional | Author avatar URL. |
| `author_id` | `ObjectId` | Optional | Points to internal `User` record. |
| `author` | `Object` | Optional | Sugar object unpacked by backend: `{ mode: 'manual', name, image }`. |
| `faqs` | `Array` | Optional | `[{ question: String, answer: String }]`. |
| `postedAt` | `Date` | Optional | Publication timestamp. |
| `editTimeFields` | `Boolean` | Optional | Must be set to `true` when manually passing `postedAt`. |
| `metadata` | `Map` | Optional | `Map<String, Mixed>` for arbitrary fields. |
| `user` | `ObjectId` | Auto | Associating user/tenant. |

### Strict Mode Category & Tags Rule
The `Blog` Mongoose schema does **not** have top-level `category` or `tags` properties. To persist categories and tags, they **must be placed inside `metadata`**:
```json
"metadata": {
  "category": "Technology",
  "tags": ["nextjs", "web-dev", "cms"]
}
```

---

## 3. Seeder JSON Payload Example

File: `project-docs/cms-seed/blog-scaling-enterprise-nextjs.json`

```json
{
  "title": "Scaling Enterprise Next.js Applications",
  "slug": "scaling-enterprise-nextjs-applications",
  "content": "<p>Enterprise Next.js architectures require strict revalidation and caching layers to guarantee sub-second delivery under peak traffic.</p><h2>On-Demand Revalidation</h2><p>Using tag-based on-demand ISR enables real-time content publication with zero rebuild overhead.</p>",
  "status": "published",
  "cover_image": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=630&fit=crop",
  "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop",
  "author_name": "Devansh",
  "author_image": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
  "metaTitle": "Scaling Enterprise Next.js Applications | NWW",
  "metaDescription": "Learn how to build scalable Next.js applications using tag-based ISR and headless CMS integration.",
  "faqs": [
    {
      "question": "What is the recommended revalidation strategy?",
      "answer": "Tag-based on-demand ISR triggered via the POST /api/revalidate webhook."
    }
  ],
  "postedAt": "2026-10-23T00:00:00.000Z",
  "editTimeFields": true,
  "metadata": {
    "category": "Engineering",
    "tags": ["nextjs", "web-dev", "architecture"]
  }
}
```
