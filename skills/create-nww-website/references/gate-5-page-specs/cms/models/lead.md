# Lead & Inquiry Capture Model Specification (`Lead`)

The `Lead` module powers newsletter signups, CTA inquiry popups, downloadable resource captures, and pre-sales leads.

---

## 1. Endpoints

- **Mount Path:** `/api/lead` (Public & Auth)
- **Submit Lead (Public / Frontend):** `POST /api/lead/submit`
  *(Headers: `Content-Type: application/json`)*
- **Paginate Leads (Admin):** `GET /api/lead/paginate`
- **Read Single Lead (Admin):** `GET /api/lead/read-one/:id`
- **Create Lead (Admin):** `POST /api/lead/create-one`
- **Update Lead (Admin):** `PUT /api/lead/update-one/:id`
- **Delete Lead (Admin):** `DELETE /api/lead/delete-one/:id`

---

## 2. Public Submission Payload Schema

For client website forms (newsletters, demo requests, consultation forms):

```json
{
  "email": "lead@enterprise.com",
  "name": "Jane Doe",
  "phone": "+1-555-0144",
  "course": "General Inquiry",
  "source": "Website Hero CTA",
  "user": "<TENANT_USER_ID>"
}
```

---

## 3. Mongoose Schema Details

From `edu-manage-be/src/features/lead/lead.model.js`:
- Manages full CRM status tracking (`new`, `contacted`, `qualified`, `proposal_sent`, `won`, `lost`).
- Stores communication logs, activity notes, and follow-up reminders directly inside the CMS dashboard CRM pipeline.
