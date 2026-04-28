# The Sartorial Mirror

## What This Is

The Sartorial Mirror is a greenfield front-end project for a privacy-first smart mirror and screen-based virtual try-on system used by retail shoppers and store staff. It is an on-device React UI shell around a Unity rendering surface, built as a session-based kiosk experience with explicit privacy reset, typed integration seams, and graceful degraded behavior for an upper-body prototype.

## Core Value

A shopper can complete a calm, privacy-safe try-on session with clear fit feedback and deterministic local data reset, without depending on perfect backend or rendering conditions.

## Requirements

### Validated

- [x] Phase 1 delivered the front-end foundation bootstrap: npm installable repo, strict TS/Vite/Tailwind/Vitest/ESLint/Prettier setup, locked `src/` scaffold, token foundation, and a bootable shopper/admin shell placeholder.

### Active

- [ ] Establish a production-minded front-end foundation for React, TypeScript, Vite, Zustand, Tailwind CSS, and Framer Motion.
- [ ] Build a premium kiosk shell and design system that separates shopper and admin experiences.
- [ ] Model the shopper journey as an explicit state machine with deterministic session reset.
- [ ] Support demo, integration, and degraded runtime modes through typed adapters and mocks.
- [ ] Deliver the full shopper flow from welcome through privacy reset for a local upper-body try-on prototype.
- [ ] Deliver a separate admin surface for local operations, catalog management, calibration, and health visibility.
- [ ] Verify state correctness, degraded behavior, and keyboard-first usability through automated checks.

### Out of Scope

- Persistent shopper accounts, measurement history, or cloud save flows — the product is session-based and privacy-first.
- Checkout, cart, payment, pricing emphasis, and marketplace-style browsing — the product is a try-on experience, not e-commerce.
- Full-body fidelity, cloud-first infrastructure, or speculative multi-user scaling — the current scope is an upper-body local prototype.
- Gesture-only or voice-only interaction — keyboard and mouse must remain first-class in v1.
- End-user exposure of AI, pose estimation, reconstruction, or backend internals — the interface should present outcomes, not pipeline jargon.

## Context

- The repository is greenfield outside local planning/tooling files: there is no `src/`, `package.json`, `tsconfig.json`, or existing front-end code to preserve.
- `docs/UI_SPEC.md` is the product and UX source of truth for shopper states, admin separation, degraded behavior, privacy reset, and Unity boundaries.
- `AGENTS.md` defines the intended stack and architecture: React, TypeScript, Vite, Zustand, Tailwind CSS, Framer Motion, layered module separation, and a calm premium visual direction.
- Unity owns garment rendering. React owns session orchestration, UI state, catalog selection, fit presentation, and privacy messaging.
- Runtime maturity must support three modes from the start: demo mode, local integration mode, and degraded mode.
- Planning will follow the repo-local GSD flow: `gsd-discuss-phase` → `gsd-ui-phase` → `gsd-plan-phase` before implementation-heavy frontend phases.

## Constraints

- **Privacy**: Local-first processing, explicit session end, and deterministic session data wipe are mandatory product features.
- **Scope**: Version 1 is an upper-body, small-catalog, kiosk-style prototype with a local operational environment.
- **Interaction**: Keyboard and mouse must fully operate the product; gesture and voice can only be future enhancements.
- **Architecture**: Unity remains an isolated rendering surface; React must not absorb rendering internals or backend transport details into components.
- **Design**: Shopper UI must feel premium, restrained, and fashion-forward; admin UI must be operational and visibly separate.
- **Reliability**: The UI must stay calm and usable when tracking, measurements, fit outputs, or Unity updates are partial or delayed.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Treat the repository as greenfield and skip `gsd-map-codebase` | There is no existing application code to analyze, only product specs and local planning tooling | ✓ Good |
| Use `AGENTS.md` and `docs/UI_SPEC.md` as the bootstrap seed inputs | They already define the product truth, stack, architecture, and UX boundaries for v1 | ✓ Good |
| Keep planning docs tracked in git | The repo-local workflow defaults to `commit_docs: true`, and planning artifacts are the current primary deliverable | — Pending |
| Use `interactive` mode with `standard` granularity and balanced models | The project is substantial enough to benefit from approvals and explicit roadmap phases without over-fragmenting work | — Pending |
| Keep `workflow.research`, `workflow.plan_check`, `workflow.verifier`, and `workflow.ui_phase` enabled for later phases | Later frontend work needs design locking and verification even though initial bootstrap skipped separate domain research | — Pending |
| Skip initial domain research during bootstrap | The product direction is already specified in repo-local documents, and no repo-local search providers are available in this environment | ✓ Good |
| Organize the roadmap into seven phases: foundation, shell, state, integration, shopper, admin, verification | This matches the user’s requested sequence and keeps v1 scope honest to the prototype | — Pending |
| Preserve the existing repo-specific `AGENTS.md` instead of regenerating a generic project guide | Local repo instructions are the source of truth and should not be overwritten by a generic bootstrap step | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-24 after Phase 1 completion*
