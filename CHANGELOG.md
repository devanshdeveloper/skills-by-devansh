# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-21

### Added
- **create-nextjs-website**: Single-file runbook to scaffold modern Next.js App Router websites with TypeScript and Tailwind CSS.
- **create-nww-website**: 12-stage human-gated website build pipeline with optional NWW CMS integration, responsive image optimizer, and stock image sourcing.
- **nww**: Fast shortcut alias to start the Next Web Website (NWW) site creation pipeline.
- **publish**: Maintainer-only release automation and preflight validation suite enforcing the 10-gate safety architecture.
- **skills.manifest.json**: Authoritative manifest defining publishable and internal skills.
- **publish.config.json**: Authoritative publish configuration defining approved remote allowlists, branch restrictions, and security guardrails.

### Security & Privacy
- Enforced strict preflight checks (G1 through G10) blocking accidental secret leaks, un-gitignored context files, and unapproved remotes.
