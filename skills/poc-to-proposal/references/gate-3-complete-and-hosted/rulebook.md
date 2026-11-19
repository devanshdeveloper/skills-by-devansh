# Gate 3: Complete and Hosted Rulebook

## 1. Purpose
Verify that the PoC is 100% scope-complete against the Gate 1 frozen specification and operational in a live hosted cloud environment with database and storage dependencies verified.

---

## 2. Entry Conditions
1. Gate 2 is approved with all manual screens verified and zero open defects.
2. `poc/<project>/state.json` reflects `currentGate: 3` with status `in_progress`.
3. Application is deployed to its production or staging cloud infrastructure.

---

## 3. Steps
1. **Scope Completeness Verification:**
   Cross-examine the deployed codebase against every in-scope feature and success metric recorded in `poc/<project>/gate-1-freeze-scope/scope.md`. Confirm no planned PoC feature is missing or stubbed out.
2. **Platform & Runtime Detection:**
   Inspect repository configuration files (`vercel.json`, `.vercel`, `netlify.toml`, `.platform`, etc.) to determine the live hosting provider (typically Vercel or Netlify).
3. **Infrastructure & Integration Audit:**
   - Audit connected persistence layer (e.g. Supabase, MongoDB Atlas, Neon PostgreSQL, PlanetScale).
   - Audit blob storage or media storage (e.g. S3, Cloudflare R2, Vercel Blob).
   - Verify connection health without executing automated penetration testing.
4. **Environment Variable Hygiene (Names Only):**
   Extract and log environment variable **NAMES ONLY** required to operate the service.
   > [!CAUTION]
   > Never write, print, or commit raw secret values, API keys, passwords, or tokens. Only record variable identifiers (e.g. `DATABASE_URL`, `JWT_SECRET`, `S3_BUCKET`).
5. **Record Hosting Metadata:**
   Write `poc/<project>/gate-3-complete-and-hosted/hosting-record.md`.
   Update `state.json` field `urls.prod` using `node <path>/poc-state.mjs set-field urls.prod "<live-url>"`.
6. **Compile Evidence & Pause:**
   Draft `poc/<project>/gate-3-complete-and-hosted/evidence.md`.
   Run `node <path>/poc-state.mjs set-status 3 awaiting_approval`.
   Instruct the user to open and verify the live URL in their browser, then stop and await human confirmation.

---

## 4. Output Files
All files are written strictly to `poc/<project>/gate-3-complete-and-hosted/`:
- `hosting-record.md`: Hosting platform details, deployment URL, verified database/storage services, and sanitized environment variable name manifest.
- `evidence.md`: Scope completeness matrix, live URL link, infrastructure health summary, and human verification instructions.

---

## 5. Evidence to Present
Present `poc/<project>/gate-3-complete-and-hosted/evidence.md` containing:
- Feature-by-feature scope completeness verification table.
- Detected hosting platform (Vercel, Netlify, or custom container).
- Live application URL (`urls.prod`).
- Sanitized list of environment variable names (zero secret values).
- Database and storage connectivity confirmation.
- Active state confirmation (`Gate 3 awaiting_approval`).

---

## 6. Manual Checklist for Me
- [ ] Open the live application URL in a web browser.
- [ ] Test the primary user workflow end-to-end on the live environment.
- [ ] Verify database reads and writes succeed on the deployed instance.
- [ ] Verify asset/file uploads succeed against connected cloud storage.
- [ ] Confirm no mock or stub data is serving live production routes.

---

## 7. Reject Handling
1. If deployment fails, routes crash, or cloud connections are broken, user provides feedback.
2. Run `node <path>/poc-state.mjs reject 3 "<hosting issue summary>"`.
3. Agent remediates build, runtime, or hosting configuration in the PoC codebase.
4. User re-deploys or triggers a fresh cloud build.
5. Update `hosting-record.md` and `evidence.md`, reset status to `awaiting_approval`, and re-present.

---

## 8. Exit Condition
- Live application is fully accessible over HTTPS.
- User manually confirms the live deployment operates cleanly.
- The user explicitly types `APPROVE GATE 3` in chat.
- `node <path>/poc-state.mjs approve 3 "APPROVE GATE 3"` executes successfully, advancing `currentGate` to 4.
