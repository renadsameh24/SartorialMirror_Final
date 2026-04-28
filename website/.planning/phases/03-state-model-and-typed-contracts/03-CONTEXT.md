# Phase 3: State Model and Typed Contracts - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 3 defines the typed front-end orchestration layer that sits between the completed shell/primitives and future runtime or screen work. It introduces explicit state containers for shopper flow and domain data, deterministic session reset rules, and type-first contracts for Unity, backend/runtime, and local data seams. It does not implement backend adapters, Unity integration, runtime mode switching, or feature-complete shopper or admin screens.

</domain>

<decisions>
## Implementation Decisions

### State architecture
- **D-01:** Phase 3 must build on the existing Phase 2 shell and primitive system without revisiting shell composition, visual tokens, or bootstrap decisions.
- **D-02:** The shopper journey remains route-light and event-driven. Model the primary shopper flow as an explicit finite state sequence: `idle`, `detection`, `catalog`, `tryOn`, `fitDetails`, and `sessionEnd`.
- **D-03:** Do not add a separate state-machine framework in this phase. Use strict TypeScript unions, typed transition helpers, and Zustand state containers so the model stays local-first, testable, and easy to evolve.

### Store boundaries
- **D-04:** Create distinct typed state containers for `session`, `catalog`, `measurements`, `fit`, `systemHealth`, `admin`, `degraded`, and `uiMode`.
- **D-05:** Treat `uiMode` (`shopper | admin`) as an app-shell concern separate from the shopper session machine. Admin protection and access rules remain Phase 6 scope.
- **D-06:** Treat degraded and partial conditions as orthogonal typed state, not as replacement shopper screens or route-level flow states.

### Reset and privacy model
- **D-07:** Centralize session reset in a single reset orchestrator that coordinates multi-store clearing and the return to the welcome state.
- **D-08:** Session reset must clear all shopper session data deterministically: session identity and phase, readiness or detection progress, garment and variant selection, measurement snapshots, fit results, shopper guidance, and transient degraded notices.
- **D-09:** App-scoped operational data may survive shopper reset when it is not shopper-specific, including local catalog definitions and system health snapshots. Reset clears shopper-derived selections and views, not the underlying local source data.

### Typed contracts and adapter seams
- **D-10:** Define external boundaries as type-first ports and discriminated unions before any live implementation work. Keep Unity contracts, backend/runtime contracts, and local catalog contracts as separate seams.
- **D-11:** Inbound contracts must represent data quality explicitly with typed states such as `idle`, `pending`, `partial`, `ready`, and `unavailable`, or domain-specific equivalents. UI-facing types must not expose raw backend or ML pipeline jargon.
- **D-12:** Outbound command shapes should cover only the v1 intents already implied by the product spec: session start or end, garment or variant selection, shopper navigation intents between catalog/try-on/fit-details, and admin operational intents such as calibration or health refresh. Phase 3 defines these shapes only; Phase 4 implements transport behavior.

### the agent's Discretion
- Exact file splits and naming under `src/types/`, `src/stores/`, `src/lib/`, and `src/adapters/`.
- Whether selectors live beside each store or in dedicated selector modules.
- Whether shared status primitives are fully generic or lightly specialized per domain, as long as partial/ready/unavailable semantics remain explicit.

</decisions>

<specifics>
## Specific Ideas

- Preserve the existing `AppShell`, `ShopperShell`, and `AdminShell` composition and move typed orchestration underneath it rather than reworking the shell.
- Keep the state model honest to a local-first, privacy-first, upper-body kiosk prototype: no shopper persistence, no cloud assumptions, no fake backend maturity, and no feature screens hidden inside Phase 3.
- The current proof-only `mode` state in `src/app/App.tsx` is the natural seam to migrate into a typed `uiMode` store during this phase.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product truth and repo rules
- `AGENTS.md` - repo-wide product, privacy, architecture, Unity-boundary, and state-layer rules.
- `docs/UI_SPEC.md` - source of truth for shopper states, degraded behavior, Unity/backend event assumptions, and required domain/state categories.

### Project planning
- `.planning/PROJECT.md` - current project framing, active requirements, and locked project-level decisions.
- `.planning/REQUIREMENTS.md` - `STATE-01` through `STATE-04` plus adjacent mode and shopper constraints that shape this phase.
- `.planning/ROADMAP.md` - official Phase 3 goal, success criteria, and plan breakdown.
- `.planning/STATE.md` - current milestone/session state and required workflow order.
- `.planning/config.json` - repo-local workflow configuration showing `discuss` mode and enabled planning gates.

### Prior phase decisions
- `.planning/phases/01-foundation-bootstrap/01-CONTEXT.md` - locked foundation boundary and architectural scaffolding decisions.
- `.planning/phases/02-app-shell-and-design-system/02-CONTEXT.md` - locked Phase 2 shell and design-system boundary.
- `.planning/phases/02-app-shell-and-design-system/02-UI-SPEC.md` - approved shell zones, stage protection rules, and primitive inventory that Phase 3 must preserve.
- `.planning/phases/02-app-shell-and-design-system/02-03-SUMMARY.md` - what Phase 2 actually implemented in the shell and primitive layer.

### Existing implementation seams
- `src/app/App.tsx` - current root app seam with proof-only mode state.
- `src/app/shell/AppShell.tsx` - top-level shell composition and mode split.
- `src/app/shell/ShopperShell.tsx` - shopper shell structure that future state should drive without redesigning.
- `src/app/shell/AdminShell.tsx` - admin shell structure that future admin state should drive without redesigning.
- `src/app/shell/shellMode.ts` - existing typed shell-mode seam.
- `src/components/primitives/index.ts` - current shared primitive surface available to later state-driven screens.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/App.tsx`: shallow application entry that can shift from local `useState` to store-backed `uiMode` orchestration.
- `src/app/shell/AppShell.tsx`, `src/app/shell/ShopperShell.tsx`, `src/app/shell/AdminShell.tsx`: stable presentation shells that should consume read models rather than own domain behavior.
- `src/components/shell/*`: existing shell zones already encode the kiosk layout boundary that Phase 3 must keep intact.
- `src/components/primitives/*`: buttons, panels, badges, dividers, and focus treatment are already ready for later state-driven composition.

### Established Patterns
- Shell mode currently lives as a small typed seam (`shopper` or `admin`) rather than route wiring; this matches the planned `uiMode` store direction.
- Shopper and admin presentation are already visually separated through shell composition and semantic styling rather than feature logic.
- The codebase is intentionally free of domain state, adapters, and runtime seams today, so Phase 3 can define those cleanly without legacy migration.

### Integration Points
- `src/stores/` should own typed state containers for session and domain state.
- `src/lib/` should own reset orchestration, transition helpers, and derived selectors/read models.
- `src/types/` should own shared domain entities plus Unity/backend/catalog contract types.
- `src/adapters/` should hold interface definitions and port contracts only in this phase, with live implementations deferred.

</code_context>

<deferred>
## Deferred Ideas

- Demo-mode fixtures, runtime mode switching, and degraded-state orchestration belong to Phase 4.
- Live Unity bridge behavior, backend transport implementation, and local data-source implementations belong to Phase 4.
- Feature-complete shopper screens and their state-driven composition belong to Phase 5.
- Protected admin access flow and operational admin workflows belong to Phase 6.

</deferred>

---
*Phase: 03-state-model-and-typed-contracts*
*Context gathered: 2026-03-24*
