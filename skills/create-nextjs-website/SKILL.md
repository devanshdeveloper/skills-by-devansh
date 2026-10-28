---
name: create-nextjs-website
description: Scaffold modern Next.js web applications with App Router, TypeScript, and production-ready structure. Use when the user asks to create, scaffold, or initialize a new Next.js website or web application with App Router, TypeScript, and clean component architecture.
---

# create-nextjs-website

> [!IMPORTANT]
> **Do Not Edit Skill Files:** Skill files are immutable runbooks. Never edit skill files directly; instead, request changes with a prompt.

Guide for AI agents to scaffold, configure, and develop modern Next.js web applications.

---

## Quick Start

### 1. Install & Update (Hard Pull Latest Skills)

```bash
DISABLE_TELEMETRY=1 npx skills add devanshdeveloper/skills-by-devansh --skill create-nextjs-website -y
```

> **New Chat / Session Rule:** If starting in a **new chat** or continuing in a fresh session, always **hard pull / update** the latest skills to ensure you have the latest scaffolding conventions:
> ```bash
> DISABLE_TELEMETRY=1 npx skills update create-nextjs-website -y
> # Or hard re-fetch directly from GitHub:
> DISABLE_TELEMETRY=1 npx skills add devanshdeveloper/skills-by-devansh --skill create-nextjs-website -y
> ```

Or run without installing (one-shot):

```bash
DISABLE_TELEMETRY=1 npx skills use devanshdeveloper/skills-by-devansh@create-nextjs-website
```

> **Tip (Windows PowerShell):** Use `$env:DISABLE_TELEMETRY="1"; npx skills update create-nextjs-website -y`

### 2. Starter Prompt

Copy and paste into your AI assistant (Antigravity, Cursor, Claude Code, or Codex CLI) (if starting in a new chat, run the hard pull update command above first):

````markdown
Activate the create-nextjs-website skill and scaffold a new project in the current directory.

Project details:
- Project Name: [e.g. my-portfolio]
- Language: [TypeScript or JavaScript]
- Styling: [e.g. Tailwind CSS / Vanilla CSS / CSS Modules]
- Package Manager: [npm / pnpm / bun]
- Pages / Routes needed: [e.g. Home, About, Projects, Contact]
- Special requirements: [e.g. dark mode toggle, blog via MDX, i18n, auth]

Please scaffold the Next.js App Router project, configure layout and metadata, and verify the dev server starts cleanly.
````

---

## When to Use


- When the user asks to create or scaffold a new Next.js website or web application.
- When initializing a project with Next.js App Router, TypeScript, and clean component architecture.
- When setting up core routing, layouts, metadata, and production styling for a web project.

## Steps

1. **Pre-flight & Environment Check (New Chat Rule & Skill Immutability)**:
   - **Do not edit skill files directly**: Skill files are immutable runbooks. Instead, request changes with a prompt.
   - If starting in a new chat, verify or hard pull the latest skill release: `DISABLE_TELEMETRY=1 npx skills update create-nextjs-website -y`.
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

