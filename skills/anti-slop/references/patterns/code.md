# Code Slop Reference

Catalog of redundant AI coding artifacts, obvious comments, dead blocks, and superfluous wrappers with their exact removal actions.

---

## Patterns & Removal Rules

### 1. Narrating & Obvious Comments (`code-narrating-comments`)
* **Detection**: Low-value comments that merely restate self-evident syntax or component names:
  * `// Render header component`
  * `// Handle button click`
  * `// Return JSX`
  * `// Main page container component`
  * `// Import dependencies`
  * `// Initialize state`
  * `// Effect for data fetching`
* **Rule**: Delete the comment line. Maintain legitimate technical comments explaining non-obvious algorithms or business constraints.

### 2. Dead / Commented-Out Code Blocks (`code-dead-jsx-block`)
* **Detection**: Commented-out JSX markup (`{/* <Card ...> */}`), disabled component imports, or dead hook declarations left behind after editing.
* **Rule**: Delete the commented-out code blocks cleanly.

### 3. Inline Styles Duplicating Utility Classes (`code-duplicate-inline-style`)
* **Detection**: Inline `style={{ ... }}` properties duplicating layout or display declarations already provided by Tailwind/CSS classes on the same element (e.g. `className="flex" style={{ display: 'flex' }}`).
* **Rule**: Delete the redundant inline style attribute. Retain the utility class.

### 4. Redundant Single-Child React Fragments (`code-redundant-fragment`)
* **Detection**: `<> ... </>` React Fragments wrapping a single child element without keys or siblings.
* **Rule**: Unwrap the fragment; render the single child element directly.

### 5. Orphaned Imports & Variable Declarations (`code-unused-declarations`)
* **Detection**: Leftover component or icon imports created when slop elements were deleted.
* **Rule**: Delete the unused import statement or unused variable declaration.
