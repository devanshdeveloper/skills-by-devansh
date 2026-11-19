# Gate 5: Demo Subdomain Rulebook

## 1. Purpose
Provision a dedicated branded demo subdomain (`<project>-demo.nextwebworks.in`) pointing to the hosted PoC, guide manual DNS record creation at the user's DNS provider, verify SSL certificate issuance, and enable the live Demo CTA on the landing page via an approval-gated merge.

---

## 2. Entry Conditions
1. Gate 4 is approved; the landing page is merged to `main` with the demo CTA disabled.
2. `poc/<project>/state.json` reflects `currentGate: 5` with status `in_progress`.
3. Cloud hosting project for the PoC is active (Vercel or Netlify).

---

## 3. Steps
1. **Target Subdomain Formulation:**
   Construct the target subdomain: `<project>-demo.nextwebworks.in`.
   Wildcard domains (`*.nextwebworks.in`) are strictly prohibited.
2. **Domain Provisioning via Cloud CLI:**
   - **For Vercel:**
     Execute:
     `vercel domains add <project>-demo.nextwebworks.in <vercel-project>`
     Then inspect domain requirements:
     `vercel domains inspect <project>-demo.nextwebworks.in`
   - **For Netlify:**
     Execute equivalent domain alias commands:
     `netlify domains:create <project>-demo.nextwebworks.in` or configure domain alias via CLI.
   > [!IMPORTANT]
   > Never guess DNS record types, names, or target endpoints. All values must come directly from CLI inspection output.
3. **Prompt for DNS Provider & Generate Runbook:**
   Ask the user what DNS provider hosts `nextwebworks.in` (e.g. Cloudflare, Route53, Namecheap, GoDaddy).
   Generate explicit, tailored configuration instructions in `poc/<project>/gate-5-demo-subdomain/dns-instructions.md`:
   - **Type:** CNAME (or A if apex/flattened)
   - **Name / Host:** `<project>-demo`
   - **Target / Value:** Exact endpoint from CLI inspection (e.g. `cname.vercel-dns.com`)
   - **TTL:** Auto or 60s
   - **Proxy Status:** DNS-only (gray-clouded) if using Cloudflare to prevent SSL handshake conflicts.
4. **User DNS Configuration & SSL Verification:**
   The user applies the record in their DNS management console.
   The user manually tests `https://<project>-demo.nextwebworks.in` until it resolves with a valid, trusted SSL/TLS certificate.
5. **Record Verified Domain:**
   Write `poc/<project>/gate-5-demo-subdomain/domain-record.md`.
   Update `urls.demo` in `state.json`:
   `node <path>/poc-state.mjs set-field urls.demo "https://<project>-demo.nextwebworks.in"`
6. **Enable Landing Page Demo CTA in `nextwebworks-website`:**
   In `nextwebworks-website`:
   - Check out branch: `git checkout -b poc/<project>-enable-demo-cta`
   - Update `site/app/poc/<project>/page.js`: enable the "Launch Live Demo" button and set its destination to `urls.demo`.
   - Add changelog entry in `CHANGELOG.md` and bump patch version.
   - Commit and push to origin for Vercel preview verification. Do NOT merge to `main`.
7. **Compile Evidence & Pause:**
   Draft `poc/<project>/gate-5-demo-subdomain/evidence.md`.
   Run `node <path>/poc-state.mjs set-status 5 awaiting_approval`. Present evidence and pause for approval.
8. **Merge on Approval:**
   Upon receiving `APPROVE GATE 5`, merge `poc/<project>-enable-demo-cta` to `main` in `nextwebworks-website` and advance state.

---

## 4. Output Files
All files are written strictly to `poc/<project>/gate-5-demo-subdomain/`:
- `dns-instructions.md`: Provider-specific DNS record table and configuration steps.
- `domain-record.md`: Cloud platform domain inspection log, target host, SSL status, and resolved URL.
- `evidence.md`: Summary of domain verification, preview deployment link with active CTA, and merge instructions.

---

## 5. Evidence to Present
Present `poc/<project>/gate-5-demo-subdomain/evidence.md` containing:
- Target subdomain: `https://<project>-demo.nextwebworks.in`.
- CLI inspection output confirming domain assignment to PoC project.
- Provider DNS record details (Type, Host, Target).
- SSL certificate validity confirmation.
- Vercel preview link demonstrating the now-active "Launch Demo" button.
- Active state confirmation (`Gate 5 awaiting_approval`).

---

## 6. Manual Checklist for Me
- [ ] Add the DNS record to the DNS provider dashboard.
- [ ] Open `https://<project>-demo.nextwebworks.in` in a browser and verify valid SSL padlock.
- [ ] Verify the demo subdomain renders the live hosted PoC application.
- [ ] Review the Vercel preview for `poc/<project>-enable-demo-cta`.
- [ ] Click the "Launch Demo" button on the preview landing page and verify it routes to the subdomain.

---

## 7. Reject Handling
1. If DNS fails to propagate, SSL errors persist, or CLI configuration encounters an error, user notes the issue.
2. Run `node <path>/poc-state.mjs reject 5 "<dns/domain issue>"`.
3. Agent inspects platform diagnostics and updates `dns-instructions.md`.
4. Once resolved and verified, update `domain-record.md` and `evidence.md`, reset status to `awaiting_approval`, and re-present.

---

## 8. Exit Condition
- Subdomain `https://<project>-demo.nextwebworks.in` resolves with valid SSL.
- Landing page Demo CTA is verified working on preview branch.
- The user explicitly types `APPROVE GATE 5` in chat.
- Branch `poc/<project>-enable-demo-cta` is merged to `main` in `nextwebworks-website`.
- `node <path>/poc-state.mjs approve 5 "APPROVE GATE 5"` executes successfully, advancing `currentGate` to 6.
