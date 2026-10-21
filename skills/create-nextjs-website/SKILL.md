---
name: create-nextjs-website
description: Scaffold modern Next.js web applications with App Router, TypeScript, and production-ready structure. Use when the user asks to create, scaffold, or initialize a new Next.js website or web application with App Router, TypeScript, and clean component architecture.
---

# create-nextjs-website

Guide for AI agents to scaffold, configure, and develop modern Next.js web applications.

## When to Use

- When the user asks to create or scaffold a new Next.js website or web application.
- When initializing a project with Next.js App Router, TypeScript, and clean component architecture.
- When setting up core routing, layouts, metadata, and production styling for a web project.

## Steps

1. **Pre-flight & Environment Check**:
   - Inspect the target directory to confirm it is empty or safe for project initialization.
   - Verify Node.js (`>=20.9.0`) and npm availability.

2. **Scaffold Next.js Application**:
   - Initialize the project non-interactively using `create-next-app`:
     ```bash
     npx -y create-next-app@latest ./ --typescript --eslint --app --src-dir --import-alias "@/*" --use-npm
     ```
   - Confirm project structure with `src/app/`, `public/`, `tsconfig.json`, and `package.json`.

3. **Configure Layout & Metadata**:
   - Set up `src/app/layout.tsx` with semantic HTML5 structure, Google Fonts (e.g., Inter), and descriptive metadata (`title`, `description`, OpenGraph tags).
   - Establish global styling tokens and baseline resets in `src/app/globals.css`.

4. **Develop Component Architecture**:
   - Organize reusable UI elements in `src/components/` (e.g., Navbar, Footer, Hero, Cards).
   - Ensure components use clean typing and responsive layout patterns.

5. **Local Validation**:
   - Test development build using `npm run dev` or run a production build check with `npm run build`.
   - Confirm no TypeScript compilation errors or broken links exist.

