# Gate 2: Find Candidates Rulebook

## 1. Goal
Map the technologies, architectural layers, and cross-cutting concerns detected in Gate 1 to real, existing best-practice skills in the open `skills.sh` ecosystem. Query the `skills.sh` leaderboard and use `npx skills find <query>` via the `find-skills` skill. Plainly report findings without fabricating non-existent packages, and propose repository-local rules where no community skill exists.

---

## 2. Entry Criteria
1. Gate 1 is approved (`currentGate: 2`).
2. `detectedStack` is populated in `best-practices/state.json`.

---

## 3. Steps

1. **Map Search Queries:**
   - For each detected technology and concern, construct specific, targeted search queries:
     - **Framework:** e.g., `nextjs`, `react-best-practices`, `vue-best-practices`, `svelte-core-bestpractices`.
     - **Styling:** e.g., `tailwind-css-patterns`, `css-architecture`.
     - **Data Layer / ORM:** e.g., `supabase-postgres-best-practices`, `prisma`, `drizzle`.
     - **AI SDK:** e.g., `vercel-ai-sdk`, `openai`.
     - **Security:** e.g., `security-best-practices`, `better-auth-security-best-practices`, `web-security`.
     - **Performance:** e.g., `web-performance`, `react-performance`, `bundle-optimization`.
     - **Accessibility:** e.g., `accessibility`, `a11y-patterns`, `web-quality-audit`.
     - **SEO:** e.g., `seo-metadata`, `sitemap-robots`.
     - **Code Quality / Architecture:** e.g., `typescript-best-practices`, `coding-standards`.
   - If an optional focus argument was passed (e.g. `security`, `performance`), prioritize queries within that domain.

2. **Check Leaderboard First:**
   - Cross-reference queries with established, highly-installed community skills on the `skills.sh` leaderboard:
     - `vercel-labs/agent-skills@vercel-react-best-practices` (~916K installs)
     - `vercel-labs/agent-skills@web-design-guidelines` (~883K installs)
     - `supabase/agent-skills@supabase-postgres-best-practices` (~492K installs)
     - `cloudflare/skills@workers-best-practices` (~150K installs)
     - `better-auth/skills@better-auth-best-practices` (~133K installs)
     - `currents-dev/playwright-best-practices-skill@playwright-best-practices` (~109K installs)
     - `mcollina/skills@fastify-best-practices` (~105K installs)
     - `cursor/plugins@typescript-best-practices` (~11.5K installs)
     - `openai/skills@security-best-practices` (~12.9K installs)
     - `addyosmani/web-quality-skills@best-practices` (~32K installs)

3. **Execute Search via `find-skills`:**
   - Execute CLI search commands for stack-specific queries:
     ```bash
     DISABLE_TELEMETRY=1 npx skills find <query>
     ```
   - Optionally scope to known high-reputation organizations using `--owner`:
     ```bash
     DISABLE_TELEMETRY=1 npx skills find <query> --owner vercel-labs
     DISABLE_TELEMETRY=1 npx skills find <query> --owner better-auth
     ```

4. **Zero-Fabrication & Fallback Rule:**
   - **NEVER invent or hallucinate skill names, package slugs, or install counts.**
   - If a CLI search returns 0 results or errors out, report the missing coverage plainly:
     *"No community skill found for `<technology/concern>`. Would you like to create a repository-local rule under `.agents/rules/<concern>.md` instead?"*
   - Record the gap plainly in the candidates report.

5. **Compile Candidate Roster:**
   - Assemble candidate items into a raw table recording:
     - Skill Name
     - Package Identifier (`<owner>/<repo>@<skill>`)
     - Source URL on `skills.sh`
     - Technology / Concern Addressed
     - Total Installs
   - Save candidate items in `best-practices/state.json` under `candidateSkills`.
   - Author `best-practices/gate-2-find-candidates/candidate-roster.md`.

6. **Update State & Present:**
   - Set Gate 2 status to `awaiting_approval` in `best-practices/state.json`.
   - Present candidate roster and approval question in chat, then pause.

---

## 4. Output Files
- `<target-repo>/best-practices/gate-2-find-candidates/candidate-roster.md`: Full catalog of discovered candidate skills across all stack dimensions.
- `<target-repo>/best-practices/state.json`: Updated `candidateSkills` list.

---

## 5. Evidence to Present & Approval Question
Present `best-practices/gate-2-find-candidates/candidate-roster.md` containing:
- Discovered candidate table grouped by architectural concern.
- Real install counts and package identifiers.
- Identified coverage gaps where no community skill exists.

> "Do you approve the Gate 2 Candidate Roster? (Reply with **`APPROVE GATE 2`** to advance to Gate 3 (Vet & Shortlist), or provide candidate additions/removals)."
>
> [!TIP]
> **Context Compaction:** You can run `/compact` to compact conversation history and maintain context window headroom for Gate 3.

---

## 6. Manual Checklist for Me
- [ ] Confirm all listed candidate skills are real packages discovered via CLI or leaderboard.
- [ ] Verify install counts match reality.
- [ ] Confirm no external skills have been installed or run yet.
- [ ] Verify coverage covers key technologies detected in Gate 1.

---

## 7. Reject Handling
1. If the user suggests specific community skills or github repos, add them to `candidateSkills` in `state.json`.
2. If the user excludes certain technologies or candidates, remove them from the list.

---

## 8. Exit Criteria
- `candidateSkills` is populated and verified.
- User explicitly replies `APPROVE GATE 2`.
- Advance `currentGate` to 3 in `best-practices/state.json`.
