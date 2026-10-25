# FAQ Model Specification (`FAQ`)

The `FAQ` module manages frequently asked questions and answers grouped by topic or category.

---

## 1. Endpoints

- **Mount Path:** `/api/faq` (Public & Auth)
- **Paginate (List):** `GET /api/faq/paginate` (Supports `?category=:category`)
- **Read by ID:** `GET /api/faq/read-one/:id`
- **Create FAQ:** `POST /api/faq/create-one`
- **Update FAQ:** `PUT /api/faq/update-one/:id`
- **Delete FAQ:** `DELETE /api/faq/delete-one/:id`
- **Revalidation Tag:** `cms:faq`

---

## 2. Mongoose Schema Details

From `edu-manage-be/src/features/faq/faq.model.js`:

| Field | Type | Required | Constraints / Notes |
| :--- | :--- | :--- | :--- |
| `question` | `String` | **Yes** | FAQ Question text. |
| `answer` | `String` | **Yes** | FAQ Answer text (supports markdown or rich text). |
| `category` | `String` | **Yes** | Category identifier (e.g., "General", "Billing", "Technical"). |
| `status` | `String` | Optional | Enum: `['active', 'inactive']`. Default: `'active'`. |
| `isDeleted` | `Boolean` | Optional | Soft-delete flag (default: `false`). |

---

## 3. Seeder JSON Payload Example

File: `project-docs/cms-seed/faq-on-demand-revalidation.json`

```json
{
  "question": "How quickly do changes published in the CMS appear on the live website?",
  "answer": "Changes reflect instantly. The CMS fires an on-demand ISR webhook to our Next.js edge runtime upon save, invalidating cached tags in real time without waiting for full site rebuilds.",
  "category": "Technical",
  "status": "active"
}
```
