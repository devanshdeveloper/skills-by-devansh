# WebsiteContactUs Model Reference

> **Collection:** `website-contact-uses`  
> **Endpoint:** `POST /api/website-contact-us/:id/submit`  
> **Scope:** Inbound Contact Form Submissions  

## 1. Schema Specifications

- **`firstName`**: String (required)
- **`lastName`**: String
- **`email`**: String (required, validated email)
- **`phone`**: String
- **`message`**: String (required)
- **`website`**: ObjectId ref to Website
- **`user`**: ObjectId ref to Account
- **`status`**: Enum (`new`, `in-progress`, `resolved`, `spam`)

## 2. Next.js Server Action Submission Pattern

```typescript
'use server';

export async function submitContact(formData: FormData) {
  const payload = {
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    message: formData.get('message'),
  };

  const serverUrl = process.env.SERVER_URL;
  const siteId = process.env.NEXT_PUBLIC_WEBSITE_ID;

  const res = await fetch(`${serverUrl}/api/website-contact-us/${siteId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return res.ok;
}
```
