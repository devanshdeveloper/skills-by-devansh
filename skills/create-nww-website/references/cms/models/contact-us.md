# Contact Us Model Specification (`WebsiteContactUs`)

The `WebsiteContactUs` module captures inbound inquiries from client-facing contact forms.

---

## 1. Endpoints

- **Mount Path:** `/api/website-contact-us`
- **Submit Form (Public / Frontend):** `POST /api/website-contact-us/:id/submit`
  *(Where `:id` is the Website contact form ID).*
- **Paginate Inquiries (Admin):** `GET /api/website-contact-us/paginate`
- **Read Single Inquiry (Admin):** `GET /api/website-contact-us/read-one/:id`
- **Create Inquiry (Admin):** `POST /api/website-contact-us/create-one`
- **Update Status:** `PUT /api/website-contact-us/update-one/:id`
- **Delete Inquiry:** `DELETE /api/website-contact-us/delete-one/:id`

---

## 2. Mongoose Schema Details

From `edu-manage-be/src/features/website/contact-us/website-contact-us.model.js`:

| Field | Type | Required | Constraints / Notes |
| :--- | :--- | :--- | :--- |
| `firstName` | `String` | **Yes** | Sender first name. |
| `lastName` | `String` | **Yes** | Sender last name. |
| `email` | `String` | **Yes** | Sender email address. |
| `phone` | `String` | **Yes** | Sender telephone number. |
| `message` | `String` | **Yes** | Message body text. |
| `status` | `String` | Optional | Enum: `['pending', 'replied', 'closed']`. Default: `'pending'`. |
| `user` | `ObjectId` | **Yes** | Tenant user reference. |
| `website` | `ObjectId` | Optional | Ref to `Website` record. |
| `isDeleted` | `Boolean` | Optional | Soft-delete flag (default: `false`). |

---

## 3. Public Frontend Submission Payload

```json
{
  "firstName": "Alexander",
  "lastName": "Vance",
  "email": "alex.vance@enterprise.com",
  "phone": "+1-415-555-0182",
  "message": "We would like to request an architecture review and commercial proposal for our fleet charging infrastructure rollout."
}
```
*Email Notifications:* Alerts are dispatched directly by the CMS backend based on client settings configured inside the CMS dashboard.
