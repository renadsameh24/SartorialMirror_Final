# Phase 1: Foundation Bootstrap - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-24
**Phase:** 1-Foundation Bootstrap
**Areas discussed:** foundation boundary, stack and tooling, quality baseline, scaffold minimum, folder structure, phase exclusions

---

## Foundation boundary

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal runnable scaffold | Bootable app shell, toolchain configs, and folder structure only | ✓ |
| Feature-leaning scaffold | Includes early shopper/admin placeholders and domain modules | |
| Infra-heavy scaffold | Includes CI, deployment, and broader workflow automation immediately | |

**User's choice:** Minimal runnable scaffold
**Notes:** Phase 1 must stay honest to greenfield bootstrap. It proves the app can boot and be developed safely without leaking into shopper flow or UI-system work.

---

## Stack and tooling

| Option | Description | Selected |
|--------|-------------|----------|
| Repo-default stack | React, TypeScript, Vite, Zustand, Tailwind CSS, Framer Motion | ✓ |
| Modified stack | Change core framework or styling approach during foundation | |
| Overbuilt stack | Add workspace, server layer, or UI kit during scaffold | |

**User's choice:** Repo-default stack
**Notes:** Keep the stack exactly aligned to `AGENTS.md`, use npm for the initial scaffold, and do not add router-first, UI-kit-first, or cloud-first assumptions.

---

## Quality baseline

| Option | Description | Selected |
|--------|-------------|----------|
| Local quality baseline | Lint, format, type-check, and minimal test harness in Phase 1; CI later | ✓ |
| Delay quality tooling | Add lint/format/test setup in a later hardening phase | |
| Full automation now | Add CI, hooks, and broad verification in foundation | |

**User's choice:** Local quality baseline
**Notes:** Formatting, linting, type-checking, and test scaffold are part of foundation. Hosted CI and heavier automation are deferred.

---

## Scaffold minimum

| Option | Description | Selected |
|--------|-------------|----------|
| Bootable placeholder | Entry file, app root, global style entry, config files, and empty module directories | ✓ |
| Shell-first scaffold | Early layout primitives and design tokens included immediately | |
| Feature-first scaffold | Shopper/admin screens and domain flows included during Phase 1 | |

**User's choice:** Bootable placeholder
**Notes:** The scaffold may include a minimal app root so Vite runs, but it must not decide Phase 2 UI or later feature behavior.

---

## Folder structure

| Option | Description | Selected |
|--------|-------------|----------|
| Full planned layout now | Create all top-level future folders from the start | ✓ |
| Narrow startup layout | Only create folders needed for immediate scaffold, add others later | |
| Domain-packed layout | Organize by features immediately, before baseline patterns exist | |

**User's choice:** Full planned layout now
**Notes:** Create the future-facing `src/` skeleton now so later planning lands in stable locations and avoids reorganizing foundational paths.

---

## Phase exclusions

| Option | Description | Selected |
|--------|-------------|----------|
| Strict exclusion | No screens, no design system, no domain stores, no runtime adapters, no CI/deployment | ✓ |
| Moderate exclusion | Allow some early UI/system work inside foundation | |
| Flexible exclusion | Let planner pull later-phase work into foundation if convenient | |

**User's choice:** Strict exclusion
**Notes:** Phase 1 should reserve boundaries and prove the local scaffold, not borrow scope from later phases.

---

## the agent's Discretion

- Exact dependency versions
- Exact config-file extension choices
- Minimal placeholder copy shown by the bootable scaffold

## Deferred Ideas

- CI pipeline setup
- Storybook or component playground
- Playwright or E2E browser automation
- Electron packaging
- Shopper/admin visual systems and design tokens
- Unity messaging and backend adapter implementation
