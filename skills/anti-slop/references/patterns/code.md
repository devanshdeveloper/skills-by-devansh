# Code Slop Reference

Catalog of redundant AI coding artifacts, obvious comments, dead blocks, and superfluous wrappers with their exact removal actions.

---

## Patterns & Removal Rules

### 1. Narrating & Obvious Comments (`code-narrating-comments`)
* **Name**: Narrating & Obvious Comments
* **What it looks like**: Low-value comments that merely restate self-evident syntax or component names (e.g. `// Render header component`, `// Handle button click`, `// Return JSX`, `// Main page container component`, `// Import dependencies`, `// Initialize state`, `// Effect for data fetching`).
* **How to find it**: Single-line comments matching `// (Render|Return|Handle|Main|Import|Initialize|Effect) ...`.
* **Action**: Delete the comment line. Maintain legitimate technical comments explaining non-obvious algorithms or business constraints.
* **Keep when**: Comment explains a non-trivial algorithm, performance optimization, or external API workaround.
* **Added YYYY-MM**: 2026-11

### 2. Dead / Commented-Out Code Blocks (`code-dead-jsx-block`)
* **Name**: Dead / Commented-Out Code Blocks
* **What it looks like**: Commented-out JSX markup (`{/* <Card ...> */}`), disabled component imports, or dead hook declarations left behind after editing.
* **How to find it**: Commented JSX blocks matching `\{\/\*\s*<[A-Za-z0-9_-]+[\s\S]*?<\/[A-Za-z0-9_-]+>\s*\*\/}`.
* **Action**: Delete the commented-out code blocks cleanly.
* **Keep when**: Block is an explicitly annotated development fixture or reference example.
* **Added YYYY-MM**: 2026-11

### 3. Inline Styles Duplicating Utility Classes (`code-duplicate-inline-style`)
* **Name**: Inline Styles Duplicating Utility Classes
* **What it looks like**: Inline `style={{ ... }}` properties duplicating layout or display declarations already provided by Tailwind/CSS classes on the same element (e.g. `className="flex" style={{ display: 'flex' }}`).
* **How to find it**: Elements combining display or position classes with identical inline style values.
* **Action**: Delete the redundant inline style attribute. Retain the utility class.
* **Keep when**: Style applies dynamic calculated runtime values (e.g. coordinates, dimensions).
* **Added YYYY-MM**: 2026-11

### 4. Redundant Single-Child React Fragments (`code-redundant-fragment`)
* **Name**: Redundant Single-Child React Fragments
* **What it looks like**: `<> ... </>` React Fragments wrapping a single child element without keys or siblings.
* **How to find it**: Fragment tags wrapping a single DOM or component node.
* **Action**: Unwrap the fragment; render the single child element directly.
* **Keep when**: Fragment is keyed in a list map or accepts properties.
* **Added YYYY-MM**: 2026-11

### 5. Orphaned Imports & Variable Declarations (`code-orphaned-import`)
* **Name**: Orphaned Imports & Variable Declarations
* **What it looks like**: Unused icon imports, component symbols, or data variables left orphaned after slop elements are deleted.
* **How to find it**: Import statements or local declarations whose referenced identifiers no longer appear in the file.
* **Action**: Delete the unused import statement or variable declaration cleanly.
* **Keep when**: Symbol is exported for use by other modules.
* **Added YYYY-MM**: 2026-11
