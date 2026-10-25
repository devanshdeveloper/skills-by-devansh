# Product Model Specification (`Product`)

The `Product` module manages physical goods, digital assets, catalog entries, custom fields, and tiered price points.

---

## 1. Endpoints

- **Mount Path:** `/api/product`
- **Paginate (List):** `GET /api/product/paginate` (Supports `?category=:categoryId`)
- **Read by Slug:** `GET /api/product/read-one-by-slug/:slug`
- **Read by ID:** `GET /api/product/read-one/:id`
- **Create Product:** `POST /api/product/create-one`
- **Slug Generator:** `POST /api/product/generate-slug` (Body: `{ "title": "..." }`)
- **Update Product:** `PUT /api/product/update-one/:id`
- **Delete Product:** `DELETE /api/product/delete-one/:id`
- **Revalidation Tag:** `cms:product`

---

## 2. Mongoose Schema Details

From `edu-manage-be/src/features/product/product.model.js`:

| Field | Type | Required | Constraints / Notes |
| :--- | :--- | :--- | :--- |
| `name` | `String` | **Yes** | Product name / title. |
| `user` | `ObjectId` | **Yes** | Ref `User` (tenant owner). |
| `slug` | `String` | Optional | Hyphenated unique URL slug. |
| `categories` | `[ObjectId]` | Optional | Refs to `Category` models. |
| `description` | `String` | Optional | HTML or plain text description. |
| `images` | `[String]` | Optional | Array of direct image URLs. |
| `price` | `Number` | Optional | Primary retail selling price. |
| `purchasePrice` | `Number` | Optional | Cost of goods / supplier price. |
| `prices` | `Array` | Optional | Tiered pricing rules by quantity or customer class. |
| `sku` | `String` | Optional | Stock Keeping Unit identifier. |
| `hsn` | `String` | Optional | Harmonized System of Nomenclature code. |
| `sortPriority` | `Number` | Optional | Display sort order (default: `0`). |
| `featured` | `Boolean` | Optional | Highlight in featured carousels (default: `false`). |
| `fields` | `Array` | Optional | Custom attributes: `[{ label: String, value: Mixed }]`. |
| `hidden` | `Boolean` | Optional | Hide from store front (default: `false`). |
| `status` | `String` | Optional | Enum: `['active', 'inactive']`. Default: `'active'`. |

---

## 3. Seeder JSON Payload Example

File: `project-docs/cms-seed/product-smart-controller.json`

```json
{
  "name": "Altus II Fast Charger",
  "slug": "altus-ii-fast-charger",
  "description": "Enterprise-grade Level 3 DC fast charging station engineered for fleet transit depots.",
  "images": [
    "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1000&h=800&fit=crop"
  ],
  "price": 12500,
  "sku": "ALT-II-DCFC",
  "featured": true,
  "status": "active",
  "fields": [
    { "label": "Power Output", "value": "180 kW" },
    { "label": "Connector Type", "value": "CCS-1 / NACS" },
    { "label": "Efficiency", "value": "96.5%" }
  ]
}
```
