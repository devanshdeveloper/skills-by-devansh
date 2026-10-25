1. The gate 2 design theory variations will be sent to the client. we do not want the copy the prompt section.

2. We always need a public deployment to forward to the client this is a must do. we cannot use the local host deployment.

3. While making the gate 2 design theory variations, please use html + tailwind css + jQuery. this will save the future tokens



4. I wanna change the folder structure completely
- project-docs\client-review\gate-1-tech-stack\
1. project-docs\client-review\gate-2-design-theory
2. project-docs\client-review\gate-3-page-list
3. project-docs\client-review\gate-4-seo-strategy
4. project-docs\client-review\gate-5-page-specs
5. project-docs\client-review\gate-5-cms-requirements
6. project-docs\client-review\gate-5-cms-schema
7. project-docs\client-review\gate-5-cms-content
8. project-docs\client-review\gate-8-final-verification

5. Delete all the other modes than markdown, we had three modes now it will be only 1. remove next.js and html modes in the gate 5.

6. delete page-design-notes.md file generation. we do not need this file.

7. delete these skill load  DISABLE_TELEMETRY=1 npx skills add https://github.com/anthropics/knowledge-work-plugins --skill seo-audit. 
  DISABLE_TELEMETRY=1 npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices
  DISABLE_TELEMETRY=1 npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-composition-patterns
  DISABLE_TELEMETRY=1 npx skills add https://github.com/vercel-labs/agent-skills --skill web-design-guidelines
  DISABLE_TELEMETRY=1 npx skills add https://github.com/vercel-labs/openreview --skill next-best-practices
  DISABLE_TELEMETRY=1 npx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill design-system
  DISABLE_TELEMETRY=1 npx skills add https://github.com/heygen-com/hyperframes --skill gsap

8. Do not create any additional markdown files unless stated. Also state each section for the markdown. do not write a single markdown more than stated. if its not needed don't generate it. 

9. In the stage 4. Ask the client for any tool connection before proceding.

10. project-docs\layout-system.md should be inside the gate folder. also it should only have one section Shared Components

11. Any file should not limit the file size of the scanfolding next.js site. it should be as small as possible but not limit the features of the page.

12. it should create any other markdown unless stated. last time it created project-docs\migration-inventory.md and this seems irravent.
Another irrevalant file "project-docs\editor-handover-outline.md"
Another irrevalant file "project-docs\context-update.md"

13. If the user says it is a site migration, crawl and archive the previous website into `previous-site/` BEFORE Gate 1 (in Stage 0).
We will put all the previous site content there before technical architecture begins:
Such as screenshots, stripped markdown from html, full html with proper folder conventions like `previous-site/<slug>/index.html`, and `sitemap-legacy.xml`.

14. If the CMS context seems incomplete. create a file project-docs\client-review\gate-5-cms-requirements/list.md and do not proceed to the cms schema and content untill this is fixed.

15. In the root folder. generate a .env.example file for the user to put the creds for any connection like seo stretegory or email client connection

16. Ask the user in the beginning to send client email with approval on each stage

17. create a .env.example in the site folder with all the variables it needs on the scanfolding

18. do not procced to the scanfolding if there is any cms requirements to be solved.

19. you can handover a prompt to the user inside the cms requirement folder, the user will paste that prompt in the cms agentic ide to get you answers. do not write a write prompt. read only prompt

20. for any client context things, create a new folder called client-context/ and put it there. for example client-answers.md or anything which is a input from the client. 

21. if a client ask for revision in any gate. do not create a extra markdown. do make changes directly to the existing. 

if you think its worth taking a note of the requirement.
create a folder client-requirements/ and put it there.

22. Make sure we have a explict good system of the deployment to the github (html variation files) and vercel (next.js) with email sending integration.

23. Add options for GSAP animations: `disabled`, `low`, `medium`, `high`, `max`, and `ultra`.
- If `disabled`: do not load the GSAP skills and do not install or import the GSAP library in the Next.js site.
- `low` & `medium`: subtle micro-interactions or standard modern agency motion.
- `high`, `max`, and `ultra`: research docs and examples from internet and add comprehensive reference guide with production-ready Next.js code examples (`references/gsap-animation-tiers.md`).

24. Add a common Node.js script (`skills/create-nww-website/scripts/site-fetch/index.js`) for fetching a website completely.
Use the same script for fetching examples (references) and previous site (migration).
The script fetches at least each and every page type with `content.md`, `index.html`, and `screenshot.png`.

25. In HTML + Tailwind CSS + jQuery generation (Gate 2 variations), use normal CSS in a `<style>` block when cards are repeating instead of duplicating inline Tailwind class strings, saving tokens.
26. When that same card structure goes into the `site/` Next.js App Router codebase, use the Tailwind `@apply` rule (in `site/app/globals.css`) to keep components clean and within line limits.
27. Provide an install and one-shot run command without telemetry (`DISABLE_TELEMETRY=1 npx skills ...`) for every skill.

