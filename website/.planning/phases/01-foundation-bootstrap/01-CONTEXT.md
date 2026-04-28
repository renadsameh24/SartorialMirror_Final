# Phase 1: Foundation Bootstrap - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 establishes the minimum runnable front-end foundation for a greenfield React kiosk application: repository package setup, TypeScript and Vite bootstrap, Tailwind and PostCSS wiring, lint and formatting rules, a minimal test runner scaffold, and the initial source tree that matches the planned architecture. It does not deliver shopper screens, admin screens, design-system polish, domain state logic, live integrations, or feature-complete UI behavior.

</domain>

<decisions>
## Implementation Decisions

### Foundation boundary
- **D-01:** Phase 1 includes only the minimum scaffold required to boot, type-check, lint, format, and run tests locally for a single front-end app package.
- **D-02:** Phase 1 may include a minimal bootable app entry and placeholder shell so the toolchain can run, but it must not implement shopper flow screens, admin workflows, or domain behavior.
- **D-03:** Phase 1 must create the architectural skeleton for future work, not feature code disguised as scaffold.

### Stack and tooling
- **D-04:** The Phase 1 stack is locked to React, TypeScript, Vite, Zustand, Tailwind CSS, and Framer Motion, matching repo-wide instructions.
- **D-05:** Use npm for the initial scaffold to minimize prerequisites in a single-package repo.
- **D-06:** Use a single-package front-end setup, not a monorepo or multi-app workspace.
- **D-07:** Do not add React Router in Phase 1; the shopper experience remains state-driven, and technical routing can be reconsidered only when later phases need it.
- **D-08:** Use ESLint for linting and Prettier for formatting in Phase 1 to keep the quality baseline familiar and low-friction.
- **D-09:** Use Vitest with React Testing Library and jsdom as the minimal test harness; end-to-end tooling stays out of Phase 1.

### Quality baseline
- **D-10:** Formatting, linting, type-checking, and a minimal test runner belong in Phase 1 because they are part of the repo foundation, not later hardening.
- **D-11:** CI automation does not belong in Phase 1; keep verification local-first now and revisit hosted CI after the app has meaningful behavior to verify.
- **D-12:** Pre-commit hooks and heavy workflow automation are out of Phase 1 unless they are nearly free to add and do not expand scope beyond the local scaffold baseline.

### Scaffold minimum
- **D-13:** Phase 1 should create root config files needed to run the app and local quality commands: `package.json`, TypeScript config, Vite config, Tailwind/PostCSS config, ESLint config, Prettier config, test config, `index.html`, and `.gitignore`.
- **D-14:** Phase 1 should create a minimal `src/` bootstrap with an entry file, top-level app file, global stylesheet entry, and placeholder directories for later modules.
- **D-15:** Phase 1 must not define design tokens, screen layouts, reusable UI primitives, or feature-specific components beyond what is strictly needed to prove the scaffold boots.

### File and folder structure
- **D-16:** Create the future-facing source layout from the start: `src/app`, `src/screens`, `src/components`, `src/features`, `src/stores`, `src/adapters`, `src/lib`, `src/hooks`, `src/types`, `src/mocks`, and `src/styles`.
- **D-17:** Keep `src/components` generic and reusable; do not create shopper/admin-specific visual systems in Phase 1.
- **D-18:** Keep Unity isolated behind future adapter boundaries; Phase 1 only reserves the integration location under `src/adapters` and does not implement Unity messaging.
- **D-19:** Add an `@/*` path alias to `src/*` during scaffold setup to keep future imports stable from the start.

### Scope exclusions
- **D-20:** Exclude shopper screens, admin screens, state-machine behavior, domain stores, mock garment data, and degraded-state UX from Phase 1; those belong to Phases 2-6.
- **D-21:** Exclude cloud services, remote APIs, authentication providers, hosted analytics, and any cloud-first assumptions from Phase 1.
- **D-22:** Exclude Electron packaging, Storybook, Playwright, and release/deployment workflows from Phase 1 unless later planning explicitly pulls them in.

### the agent's Discretion
- Exact package versions should use stable compatible releases at implementation time rather than being frozen in this context file.
- The exact Node LTS floor can be selected at implementation time as long as it matches current stable Vite and toolchain support.
- The exact filenames for config variants (`.js` vs `.mjs`, split `tsconfig` files vs a single root config) can follow current Vite and toolchain conventions as long as the locked stack and boundary stay intact.
- The minimal placeholder content shown by the bootable app can stay extremely plain; it only needs to confirm the scaffold runs.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and architecture
- `AGENTS.md` — Repo-wide source of truth for scope, architecture, Unity boundary, privacy rules, and default stack.
- `docs/UI_SPEC.md` — Product truth for the smart-mirror session model, runtime constraints, shopper/admin separation, and kiosk UX expectations.

### Project planning
- `.planning/PROJECT.md` — High-level project context, constraints, and locked bootstrap decisions.
- `.planning/REQUIREMENTS.md` — Phase 1 requirements `FOUND-01` through `FOUND-03` and v1 scope boundaries.
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria, and future phase separation.
- `.planning/STATE.md` — Current project position and repo-local planning workflow state.

### Repo-local workflow
- `.codex/config.toml` — Repo-local Codex and GSD configuration, including agent inventory and hooks.
- `.codex/get-shit-done/workflows/discuss-phase.md` — Local discussion workflow that defines how context should be captured for planning.
- `.codex/get-shit-done/workflows/plan-phase.md` — Local planner workflow that will consume this context next.
- `.codex/get-shit-done/workflows/ui-phase.md` — Frontend UI contract workflow to apply before later UI-heavy phases.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No application code exists yet; there are no reusable UI, state, adapter, or utility assets to preserve.

### Established Patterns
- The only established patterns are documentary: layered architecture from `AGENTS.md`, session-state-machine product modeling from `docs/UI_SPEC.md`, and repo-local GSD planning flow from `.planning/` plus `.codex/`.

### Integration Points
- Future scaffold entry point should begin at `src/main.tsx` and a top-level app module under `src/app/`.
- Future Unity and backend boundaries should be reserved under `src/adapters/`, but left unimplemented in Phase 1.
- Future domain state should be reserved under `src/stores/`, but left unimplemented in Phase 1.

</code_context>

<specifics>
## Specific Ideas

- Keep the scaffold local-first and boring on purpose; Phase 1 exists to make later phases safer, not to look impressive.
- Prefer a single bootable web app package over early workspace complexity.
- Keep the Phase 1 runtime placeholder free of shopper/admin UX decisions so Phase 2 can own the shell and design language cleanly.
- Treat keyboard and mouse requirements as future-facing constraints on scaffold choices, not as a reason to implement interactions early.

</specifics>

<deferred>
## Deferred Ideas

- Design tokens, typography, motion system, and visual primitives — Phase 2.
- Explicit shopper state machine, domain stores, and typed commands/events — Phase 3.
- Mock data, runtime mode switching, and degraded-state behavior — Phase 4.
- Shopper screens and privacy reset UX — Phase 5.
- Admin access model and operational screens — Phase 6.
- Automated behavior coverage beyond a minimal test harness, plus CI/E2E tooling — Phase 7 or later.

</deferred>

---
*Phase: 01-foundation-bootstrap*
*Context gathered: 2026-03-24*
