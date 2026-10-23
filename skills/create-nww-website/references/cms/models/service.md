# Website Service Model Specification (`WebsiteService`)

The `WebsiteService` module manages agency/corporate services, core deliverables, industry alignments, and portfolio case studies.

---

## 1. Endpoints

- **Mount Path:** `/api/website-service`
- **Paginate (List):** `GET /api/website-service/paginate`
- **Query by Slug:** `GET /api/website-service/paginate?slug=:slug&limit=1`
- **Read by ID:** `GET /api/website-service/read-one/:id`
- **Create Service:** `POST /api/website-service/create-one`
- **Slug Generator:** `POST /api/website-service/generate-slug` (Body: `{ "title": "..." }`)
- **Update Service:** `PUT /api/website-service/update-one/:id`
- **Delete Service:** `DELETE /api/website-service/delete-one/:id`
- **Revalidation Tag:** `cms:service`

---

## 2. Mongoose Schema Details

From `edu-manage-be/src/features/website/service/website-service.model.js`:

| Field | Type | Required | Constraints / Notes |
| :--- | :--- | :--- | :--- |
| `title` | `String` | **Yes** | Service title (e.g., "Full-Stack Web Development"). |
| `slug` | `String` | **Yes** | Hyphenated unique URL slug. |
| `description` | `String` | **Yes** | Summary description for cards and SEO. |
| `content` | `String` | **Yes** | HTML rich-text service page content. |
| `industry` | `ObjectId` | **Yes** | Relational reference to `Industry` model. |
| `portfolio` | `ObjectId` | **Yes** | Relational reference to `Portfolio` model. |
| `attachments` | `[String]` | **Yes** | Array of image/document URLs. |
| `status` | `String` | Optional | Enum: `['draft', 'published', 'archived']`. Default: `'draft'`. |
| `user` | `ObjectId` | **Yes** | Ref `User` (tenant admin). |
| `website` | `ObjectId` | Optional | Ref `Website`. |
| `isDeleted` | `Boolean` | Optional | Soft-delete flag (default: `false`). |

---

## 3. Seeder JSON Payload Example

File: `project-docs/cms-seed/service-web-development.json`

```json
{
  "title": "Enterprise Web Development",
  "slug": "enterprise-web-development",
  "description": "High-performance Next.js web applications engineered for speed, conversion, and global scale.",
  "content": "<p>We design and engineer bespoke web platforms leveraging the Next.js App Router, headless CMS architecture, and edge revalidation.</p>",
  "status": "published",
  "attachments": [
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop"
  ]
}
```
*Note:* During seeding, `industry` and `portfolio` references can be linked by ID or populated through relational seed chains.
