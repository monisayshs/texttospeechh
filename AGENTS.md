# TextToSpeechH AI — Universal AI Agent Guide

> **Note to AI Assistants:** This document is your entry point. Read this file completely before taking any action. It defines project identity, architecture rules, production safety constraints, decision routing, standard workflow, and self-updating protocols.

---

## Document Ownership & Metadata

| Property | Value |
|----------|-------|
| **Document Purpose** | Single entry point for all AI coding assistants (ChatGPT, Claude, Gemini, DeepSeek, Cursor, Windsurf, Aider, etc.) |
| **Owner** | Repository Maintainers |
| **Update Trigger** | Architecture change, new document added, workflow sequence updated, safety rule added |
| **Update Frequency** | Low — updated only when core rules or document map changes |
| **Last Verified** | 2026-08-07 |
| **Verified Against** | `api/index.js`, `dev-server.js`, `vercel.json`, `src/services/*`, `src/providers/*`, `src/seo/*`, `public/*` |
| **Related Documents** | [SESSION.md](SESSION.md), [PROJECT_STATE.md](PROJECT_STATE.md), [CONTEXT.md](CONTEXT.md), [DECISIONS.md](DECISIONS.md) |

---

## Source of Truth Policy

> **Source of Truth Notice:** If this document or any other documentation file conflicts with the implementation in source code, **the source code is authoritative**. Documentation exists to accelerate understanding, not to replace inspection of the code.

---

## Mandatory Code Editing Rule

Before modifying or adding code to any subsystem, every AI agent **MUST** follow these 4 steps:

1. **Read AGENTS.md** (for safety rules and global context)
2. **Read the relevant docs** (via the AI Decision Tree)
3. **Inspect the actual source code** (verify symbols, signatures, and runtime logic)
4. **Modify the code** (minimal diff footprint, evidence-justified edits)

Never rely on documentation alone. Documentation is guidance; the source code is authoritative.

---

## 1. Repository Identity

- **Project Name**: TextToSpeechH AI
- **Repository**: `monisayshs/texttospeechh`
- **Production URL**: `https://www.texttospeechh.com`
- **Runtime**: Node.js (Vanilla / CommonJS, no heavy web framework)
- **Deployment Platform**: Vercel (Serverless Functions v2 + Static Asset Edge CDN)
- **Current Version**: `1.0.0`
- **Architecture Style**: Modular Monolith on Serverless Edge
- **Current Status**: Live (Implemented, Ready for Review)

---

## 2. Project Philosophy

Every architectural and implementation choice in this repository should align with these core principles:

1. **Performance First**: Every byte and millisecond matters. Defer non-critical assets (analytics, third-party widgets). Prefer native Node.js APIs over heavy npm dependencies to keep serverless cold starts minimal (< 200ms).
2. **SEO First**: Organic search is the primary engine of user acquisition. Every page must be canonicalized, schema-enriched (JSON-LD), responsive, and accessible. Never break URL paths — always 301 redirect legacy paths.
3. **Simplicity & Stability**: Prefer raw Node.js standard libraries (`http`, `fs`, `url`, `path`) over frameworks like Express. Failover gracefully (e.g., LoadBalancer TTS provider fallback) rather than returning uncaught 500 errors to users.
4. **Backward Compatibility**: Preserve existing API signatures, public routes, and redirect rules. Never remove a 301 redirect unless replacing it with an equivalent or better target.
5. **Documentation is Part of the Code**: Code changes and documentation updates happen in the same commit/task. An un-documented architectural change is an incomplete change.
6. **Avoid Unnecessary Dependencies**: Every added `npm` package increases bundle size, security surface, and cold start penalty. Justify any new dependency strictly.
7. **Continuous Repository Learning**: Every completed task is an opportunity to improve the repository's intelligence. Capture recurring patterns, workflow optimizations, and lessons learned so future AI agents never repeat solved problems.

---

## 3. AI Decision Tree (Task Routing)

Use this decision matrix to determine which specific documentation files to read after completing startup steps:

```
Task Type               → Required Secondary Context Documents
───────────────────────────────────────────────────────────────────────────────
Simple fix / typo       → AGENTS.md only
Resume active task      → SESSION.md → TASKS.md
SEO / Page / Schema     → docs/seo-system.md
Deployment / Build      → docs/deployment.md
API / Endpoint work     → docs/api-reference.md
TTS / Queue / Provider  → docs/architecture.md
Bug / Production Issue  → SESSION.md → PROJECT_STATE.md → DECISIONS.md
Business / Philosophy   → CONTEXT.md
Architecture Change     → docs/architecture.md → DECISIONS.md
```

---

## 4. Standard AI Workflow & Autonomous Task Classification

Every AI agent working in this repository **MUST** follow this 12-step sequence:

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Read AGENTS.md (Identity, Philosophy, Safety Rules, Routing) │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Read SESSION.md (Check working state & progress)             │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Read PROJECT_STATE.md (If doing state work or system tasks)  │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Read task-specific docs (via AI Decision Tree)               │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. Inspect actual implementation in source code                 │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. Modify code carefully with minimal diff footprint            │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. Run verification (Local server test on port 3000)            │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. Update documentation (docs/* files if API/SEO changed)       │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 9. Update SESSION.md (Step completed, next step, current state) │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 10. Update PROJECT_STATE.md (Only if permanent state changed)   │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 11. Update CHANGELOG.md (Keep a Changelog format entry)         │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 12. Commit / Finalize work summary                              │
└─────────────────────────────────────────────────────────────────┘
```

### 4.1 Intelligent Task Classification & Context Loading Protocol

Before starting any task, perform the following 6-step workflow automatically:

1. **Step 1 — Classify the User Request**: Automatically detect affected repository domain(s): `SEO`, `Deployment`, `API`, `Architecture`, `Frontend`, `Backend`, `Content`, `Security`, `Performance`, `Analytics`, `Documentation`, `Testing`, `Infrastructure`. If multiple systems are involved, classify all of them.
2. **Step 2 — Load Only Relevant Context**: Load the minimum required documentation using the AI Decision Tree (e.g., `SEO` → `docs/seo-system.md`, `Deployment` → `docs/deployment.md`). Never load all documents unless necessary.
3. **Step 3 — Inspect Source Code**: Documentation is guidance only. Always inspect the actual source code implementation before making changes. Source code is authoritative.
4. **Step 4 — Expand Context Automatically**: If a task affects multiple systems (e.g. adding a new language page), automatically inspect all connected subsystems (`SEO`, `Sitemap`, `Schema`, `API`, `Routing`, `Analytics`) without waiting for the user to list every file.
5. **Step 5 — Detect Side Effects**: Before making changes, check which intelligence files must be updated (`CHANGELOG.md`, `PROJECT_STATE.md`, `SESSION.md`, `TASKS.md`, `docs/*`, `README.md`). Update only the affected documents.
6. **Step 6 — Ask Questions Only When Necessary**: Minimize questions. Only ask if the user's goal is ambiguous, multiple valid implementations exist, or a decision permanently alters architecture.

> **Guiding Principle**: The user describes **WHAT** they want. The AI determines **HOW** to perform it by understanding the repository. Maximize autonomous reasoning and verify assumptions against source code before making changes.

---

## 5. Production Safety Rules

- **Vercel Routes Integrity**: Never modify `vercel.json` routes without verifying route order. Specific static/API routes must appear before catch-all wildcards.
- **301 Redirect Preservation**: Never delete entries in `AUTO_REDIRECT_MAP` in `src/api/seoHandler.js` or `programmaticPages.js`. SEO equity will be lost.
- **No Express or Heavy Frameworks**: Do not install Express, Fastify, or Nest. Serverless functions must remain lightweight functions exporting `async (req, res) => {}`.
- **IndexNow Error Safety**: IndexNow requests (`scripts/notify-indexnow.js`) must always remain non-blocking (best-effort try/catch). Post-deploy steps must never fail a Vercel build due to IndexNow HTTP errors.
- **Local Dev Server Parity**: Ensure any router change in `api/index.js` works in `dev-server.js` (port 3000) and vice versa.
- **File System Scoping**: Serverless environments only allow writing to `/tmp`. Never write generated files outside `/tmp` at runtime.

---

## 6. Coding & Style Rules

- **Module System**: CommonJS (`require` / `module.exports`). Do not mix ESM `import/export` syntax in core API handlers unless configured in Node runtime options.
- **Naming Conventions**:
  - Files: `camelCase.js` (e.g., `loadBalancer.js`, `seoHandler.js`)
  - Classes: `PascalCase` (e.g., `QueueService`, `EdgeProvider`)
  - Functions & Variables: `camelCase`
  - Constants: `UPPER_SNAKE_CASE` (e.g., `AUTO_REDIRECT_MAP`, `DOMAIN`)
- **Error Handling**: Always wrap async handler logic in `try/catch`. Never leave unhandled promise rejections that crash Node.js process. Return standard 500 error pages (`get500Page()`) for unhandled route errors.
- **Sanitization & Security**: Pass all user inputs through `securityService.js` (rate limiting, input length validation, file extension checks).

---

## 7. Self-Updating Protocol

Documentation maintenance is mandatory. Whenever you make a change to the repository, immediately update the corresponding intelligence documents:

| Code Change Area | Documents You MUST Update |
|------------------|---------------------------|
| Any code edit or feature | [CHANGELOG.md](CHANGELOG.md), [SESSION.md](SESSION.md) |
| Architecture / Tech stack decision | [DECISIONS.md](DECISIONS.md), [docs/architecture.md](docs/architecture.md) |
| New or updated API endpoint | [docs/api-reference.md](docs/api-reference.md) |
| New SEO route, schema, or sitemap | [docs/seo-system.md](docs/seo-system.md), [PROJECT_STATE.md](PROJECT_STATE.md) |
| Vercel config, env vars, or scripts | [docs/deployment.md](docs/deployment.md) |
| Product roadmap or known issue change | [PROJECT_STATE.md](PROJECT_STATE.md), [TASKS.md](TASKS.md) |

### 7.1 Continuous Repository Learning Protocol

Every completed task is an opportunity to make the repository more intelligent. Whenever a recurring problem, workflow improvement, architectural lesson, or operational pattern is discovered:

1. **Update DECISIONS.md**: Log any new architectural decision (ADR) or operational lesson learned.
2. **Update AGENTS.md**: Refine global rules, workflow steps, or safety constraints if a better execution pattern is identified.
3. **Update PROJECT_STATE.md**: Update technical debt, system status, or permanent project knowledge if permanent state changed.
4. **Update docs/***: Update deep documentation files (`architecture.md`, `seo-system.md`, `api-reference.md`, `deployment.md`) if subsystem implementations changed.

> **Core Rule**: Future AI agents must benefit from the work of previous AI agents. Never repeat solved problems; continuously compound repository intelligence over time.

---

## 8. Document Index

Below is the complete inventory of intelligence documents in this repository:

| Document | Purpose | Scope / Location |
|----------|---------|------------------|
| [AGENTS.md](AGENTS.md) | Universal AI Agent Guide & Rules | Root |
| [README.md](README.md) | Human Overview & Developer Guide | Root |
| [CONTEXT.md](CONTEXT.md) | Business Identity, Mission & Vision | Root |
| [SESSION.md](SESSION.md) | Ephemeral AI Session Working Memory | Root |
| [PROJECT_STATE.md](PROJECT_STATE.md) | Permanent Project Memory & Status | Root |
| [TASKS.md](TASKS.md) | Task Backlog (TODO / IN PROGRESS / BLOCKED / DONE) | Root |
| [CHANGELOG.md](CHANGELOG.md) | Release & Modification Log | Root |
| [DECISIONS.md](DECISIONS.md) | Architectural Decisions & Lessons Learned | Root |
| [docs/architecture.md](docs/architecture.md) | Technical Design & ASCII Diagram | `docs/` |
| [docs/seo-system.md](docs/seo-system.md) | Hub-and-Spoke SEO System & IndexNow | `docs/` |
| [docs/api-reference.md](docs/api-reference.md) | Backend & Serverless API Documentation | `docs/` |
| [docs/deployment.md](docs/deployment.md) | Vercel Deployment & Recovery Workflow | `docs/` |
