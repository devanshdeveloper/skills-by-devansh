# Legal Policies Model Reference

> **Endpoints:** `/api/website-privacy-policy`, `/api/website-terms-and-conditions`, `/api/website-refund-policy`  
> **Scope:** Dynamic Compliance & Legal Documents  

## 1. Schema Specifications

- **`title`**: String (Policy heading)
- **`content`**: String (Legal prose HTML from editor)
- **`version`**: String (e.g. `1.0.0`)
- **`effectiveDate`**: Date
- **`lastUpdated`**: Date
- **`status`**: Enum (`draft`, `published`, `archived`)
