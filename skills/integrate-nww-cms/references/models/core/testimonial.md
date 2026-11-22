# Testimonial Model Reference

> **Collection:** `testimonials`  
> **Endpoint:** `/api/testimonial`  
> **Scope:** Customer Reviews & Social Proof  

## 1. Schema Specifications

- **`name`**: String (Reviewer name, required)
- **`role`**: String (Job title / position)
- **`company`**: String (Organization name)
- **`content`**: String (Review quote / body text, required)
- **`image`**: String (Reviewer avatar photo URL)
- **`rating`**: Number (1 to 5 stars)
- **`featured`**: Boolean
- **`status`**: Enum (`draft`, `published`, `archived`)

## 2. Server Component Fetch Pattern

```typescript
import { Testimonial } from '@/lib/cms';

export default async function ReviewsSection() {
  const reviews = await Testimonial.paginate();
  return <TestimonialCarousel reviews={reviews} />;
}
```
