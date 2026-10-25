# Testimonial Model Specification (`Testimonial`)

The `Testimonial` module stores verified client reviews, star ratings, professional designations, and client avatars.

---

## 1. Endpoints

- **Mount Path:** `/api/testimonial` (Public & Auth)
- **Paginate (List):** `GET /api/testimonial/paginate`
- **Read by ID:** `GET /api/testimonial/read-one/:id`
- **Create Testimonial:** `POST /api/testimonial/create-one`
- **Update Testimonial:** `PUT /api/testimonial/update-one/:id`
- **Delete Testimonial:** `DELETE /api/testimonial/delete-one/:id`
- **Revalidation Tag:** `cms:testimonial`

---

## 2. Mongoose Schema Details

From `edu-manage-be/src/features/testimonial/testimonial.model.js`:

| Field | Type | Required | Constraints / Notes |
| :--- | :--- | :--- | :--- |
| `author` | `String` | **Yes** | Client full name (e.g., "Sarah Jenkins"). |
| `designation` | `String` | **Yes** | Job title (e.g., "VP of Marketing"). |
| `institution` | `String` | **Yes** | Company / Organization name (e.g., "Stripe Inc."). |
| `avatar` | `String` | **Yes** | Public image URL for avatar picture. |
| `content` | `String` | **Yes** | Review quote or recommendation body text. |
| `rating` | `Number` | **Yes** | Star rating integer: `1` to `5`. |
| `status` | `String` | Optional | Enum: `['active', 'inactive']`. Default: `'active'`. |
| `isDeleted` | `Boolean` | Optional | Soft-delete flag (default: `false`). |

---

## 3. Seeder JSON Payload Example

File: `project-docs/cms-seed/testimonial-sarah-jenkins.json`

```json
{
  "author": "Sarah Jenkins",
  "designation": "Chief Marketing Officer",
  "institution": "Apex Logistics",
  "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop",
  "content": "Next Web Works transformed our digital infrastructure. Their precision engineering and modern design elevated our conversion rate by over 40% in the first quarter.",
  "rating": 5,
  "status": "active"
}
```
