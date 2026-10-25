# Contact Us Model Specification (`WebsiteContactUs`)

The `WebsiteContactUs` module captures inbound inquiries from client-facing contact forms.

---

## 1. Endpoints

- **Public Frontend Form Submission:** `POST /api/form/:id/submit`
  *(Where `:id` is the public `Form` document ID. This route is unauthenticated when `form.isPublic === true`).*
- **Admin Inquiries Mount Path:** `/api/website-contact-us` (Authenticated routes only)
- **Paginate Inquiries (Admin):** `GET /api/website-contact-us/paginate`
- **Read Single Inquiry (Admin):** `GET /api/website-contact-us/read-one/:id`
- **Create Inquiry (Admin):** `POST /api/website-contact-us/create-one`
- **Update Status:** `PUT /api/website-contact-us/update-one/:id`
- **Delete Inquiry:** `DELETE /api/website-contact-us/delete-one/:id`

---

## 2. Form Storage Modes & Schema Compatibility

In `edu-manage-be`, form submissions to `POST /api/form/:id/submit` support two distinct storage modes based on the target `Form` configuration:

### Mode A: Dynamic FormResponse (Recommended for Custom Forms)
When `form.model` is null or omitted, submitted fields are saved flexibly into `FormResponse.responses: [{ field, value }]`. This allows arbitrary form shapes (e.g., `fullName`, `email`, `organization`, `inquiryType`, `message`) without Mongoose schema validation failures.

### Mode B: Relational WebsiteContactUs Model
When `form.model = "WebsiteContactUs"`, the backend attempts `Models.WebsiteContactUs.create(...)`. The Mongoose schema strictly requires all five fields:

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

### Example: Relational `WebsiteContactUs` Mode
```json
{
  "firstName": "Alexander",
  "lastName": "Vance",
  "email": "alex.vance@enterprise.com",
  "phone": "+1-415-555-0182",
  "message": "We would like to request an architecture review and commercial proposal for our fleet charging infrastructure rollout."
}
```

### Example: Dynamic `FormResponse` Mode
```json
{
  "fullName": "Alexander Vance",
  "email": "alex.vance@enterprise.com",
  "organization": "Vance Dynamics",
  "phone": "+1-415-555-0182",
  "inquiryType": "Fleet Architecture Review",
  "message": "We would like to request an architecture review and commercial proposal."
}
```

*Email Dispatch Notice:* Submissions are saved directly to MongoDB. The backend does NOT automatically dispatch email alerts upon submission via `EmailHelper`. Direct transactional email alerts should be handled via a Next.js Server Action or API route (e.g., Resend) if immediate inbox delivery is needed.
