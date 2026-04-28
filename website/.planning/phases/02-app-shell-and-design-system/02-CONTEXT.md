# Phase 2: App Shell and Design System - Context

**Gathered:** 2026-03-24
**Status:** Ready for UI workflow

<domain>
## Phase Boundary

Phase 2 defines and implements the kiosk-first app shell, theme foundations, large-display layout rules, and shared visual primitives that later shopper and admin work will build on. It uses the existing Phase 1 scaffold and token baseline, but does not introduce domain state logic, backend adapters, Unity integration, feature-complete shopper screens, or feature-complete admin workflows.

</domain>

<decisions>
## Implementation Decisions

### Shell boundary and deliverables
- **D-01:** Phase 2 must build on the existing Phase 1 scaffold rather than revisiting bootstrap, replacing the architecture skeleton, or re-planning completed foundation work.
- **D-02:** The deliverable is a reusable shell and design-system layer only: app-shell structure under `src/app/`, shared layout and primitive components under `src/components/`, and theme/token wiring under `src/styles/`.
- **D-03:** Phase 2 must stay free of domain stores, session-state logic, backend transport code, Unity bridge code, and runtime-mode orchestration; those remain in later phases.
- **D-04:** Phase 2 may use placeholder content only where needed to prove shell structure and component behavior, but it must not become a disguised implementation of welcome, catalog, try-on, fit, or admin feature screens.

### Kiosk layout model
- **D-05:** The shell must read as a large-display kiosk composition, not a stretched laptop web app and not a SaaS dashboard.
- **D-06:** The visual center of the screen remains dominant and reserved for the future try-on stage; persistent chrome must live at the edges and remain subordinate.
- **D-07:** Any persistent shopper-side rail or utility region must stay narrow enough that the stage clearly remains the hero area; Phase 1 large-display shell rules remain in force.
- **D-08:** Shell primitives should be organized around stable kiosk zones rather than page-by-page layouts: frame, stage, optional rail, overlay band, and utility/status surfaces.
- **D-09:** Lower-resolution development behavior should degrade cleanly without collapsing into a mobile-card stack or a desktop dashboard pattern.

### Visual identity and theme separation
- **D-10:** Shopper and admin experiences must continue as distinct visual systems with no style leakage; shopper stays premium and restrained, admin stays operational and cooler.
- **D-11:** Phase 1 token decisions remain locked inputs for Phase 2: semantic CSS variables, shopper/admin namespaces, Manrope plus restrained Cormorant usage, the fixed spacing scale, the fixed type roles, reserved accent usage, and reduced-motion support.
- **D-12:** Phase 2 should deepen the existing token system only where the shell and primitives need more semantic aliases; it must not replace the token architecture with a third-party UI-kit design language.
- **D-13:** Continue with custom primitives and the existing stack rather than introducing a component library that would impose generic product patterns.

### Interaction and accessibility baseline
- **D-14:** Keyboard and mouse remain first-class from the shell upward; all shared interactive primitives must expose visible focus states and usable hover/press/focus behavior by default.
- **D-15:** Shared primitives should assume large-display readability and 48x48 minimum hit targets from the start.
- **D-16:** Motion in Phase 2 is for shell transitions, panel/overlay reveals, and confirmation only; it must remain restrained and never compete with the future Unity stage.

### Primitive scope
- **D-17:** The primitive set for this phase should cover the common building blocks already called for in the roadmap: buttons, panels, badges, rails, overlays, focus treatment, and shell/layout utilities.
- **D-18:** Primitives must stay generic and reusable; no catalog cards, fit widgets, measurement modules, degraded-state messaging, or admin feature panels belong in this phase.
- **D-19:** Shopper shell primitives should bias toward calm framing and minimal chrome; admin shell primitives may be denser and more explicit, but still belong to the same structural system.

### Admin boundary in Phase 2
- **D-20:** Phase 2 may define the admin shell look and layout language, but not admin authentication, system-health behavior, calibration tools, log viewers, or catalog-management workflows.
- **D-21:** Any mode switching used during Phase 2 remains a shell/demo affordance only, not a final admin access design.

### the agent's Discretion
- Exact component filenames and primitive API shapes, as long as they preserve the shell/primitives boundary.
- Exact semantic token additions needed to support shell composition, as long as the Phase 1 token contract remains intact.
- Exact animation implementations and Framer Motion usage, as long as reduced-motion behavior and restrained motion rules are preserved.
- Exact low-resolution layout adaptation details, as long as the result still reads as a kiosk shell rather than a SaaS/mobile layout.

</decisions>

<specifics>
## Specific Ideas

- Keep the center stage visually dominant for later Unity-led try-on rendering.
- Treat the shell as a controlled kiosk frame, not a route-heavy application scaffold.
- Keep scope honest to a local-first, privacy-first, upper-body prototype rather than implying mature backend or rendering capabilities.
- Preserve the existing Phase 1 shell direction: stage-first shopper framing, clearly separate admin mode, semantic token wiring, and system-level focus/reduced-motion behavior.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and repo constraints
- `AGENTS.md` — Repo-wide product truth, architectural rules, privacy constraints, kiosk model, and stack expectations.
- `docs/UI_SPEC.md` — Primary UX/product source of truth for shopper states, admin separation, degraded behavior, Unity boundary, and large-display interaction rules.

### Project planning
- `.planning/PROJECT.md` — Current project framing, active requirements, and locked project-level decisions.
- `.planning/REQUIREMENTS.md` — `SHELL-01` through `SHELL-03` and adjacent scope boundaries that define this phase.
- `.planning/ROADMAP.md` — Phase 2 goal, success criteria, and plan breakdown.
- `.planning/STATE.md` — Current project position and mandated Phase 2 workflow order.

### Prior phase decisions
- `.planning/phases/01-foundation-bootstrap/01-CONTEXT.md` — Locked Phase 1 scope boundary and exclusions that Phase 2 must respect.
- `.planning/phases/01-foundation-bootstrap/01-UI-SPEC.md` — Locked foundation token, typography, spacing, motion, copy, and shell rules that Phase 2 inherits.
- `.planning/phases/01-foundation-bootstrap/01-03-SUMMARY.md` — What the scaffold already implemented in `src/` and `src/styles/`.

### Repo-local workflow
- `.codex/config.toml` — Repo-local Codex/GSD config and enabled workflow gates.
- `.codex/get-shit-done/workflows/discuss-phase.md` — Discussion workflow being followed for this context.
- `.codex/get-shit-done/workflows/ui-phase.md` — The next workflow that will convert these decisions into a Phase 2 UI contract.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/shell/AppShell.tsx` — Current shell placeholder already expresses a frame, stage region, rail region, and shopper/admin mode split that Phase 2 should evolve rather than discard blindly.
- `src/app/shell/shellMode.ts` — Existing typed shell-mode seam for shopper/admin visual switching.
- `src/styles/tokens.css` — Existing semantic token source of truth with separate shopper/admin namespaces and current shell aliases.
- `src/styles/globals.css` — Existing base layer for focus-visible treatment, typography utility classes, shell layout utilities, and reduced-motion handling.
- `tailwind.config.ts` — Current semantic Tailwind mapping for color, spacing, typography, radius, shadow, and motion tokens.
- `src/app/App.test.tsx` — Existing shell smoke tests that can be extended as Phase 2 firms up the shell and primitive contract.

### Established Patterns
- Shell mode is currently represented with a `data-shell-mode` attribute and CSS-variable aliasing rather than separate style systems embedded in JSX.
- The scaffold already favors semantic utility usage (`bg-surface-*`, `text-text-*`, etc.) over raw color values.
- The current shell composition is stage-first with a subordinate rail; this is directionally aligned with the kiosk requirement and should be refined, not reversed.
- Phase 1 intentionally kept the shell free of domain behavior; Phase 2 should preserve that separation.

### Integration Points
- `src/app/App.tsx` should remain the shallow application entry while `src/app/shell/` grows into the durable shell boundary.
- `src/components/` should receive the reusable primitives and layout building blocks introduced in this phase.
- `src/styles/` should remain the token and system-style source of truth for shell and primitive behavior.
- `src/app/App.test.tsx` and follow-on component tests should verify shell landmarks, mode separation, focus treatment, and keyboard/mouse affordances without introducing domain-state dependencies.

</code_context>

<deferred>
## Deferred Ideas

- Explicit shopper state-machine behavior and deterministic reset orchestration — Phase 3.
- Unity command/event boundaries and rendering integration surfaces — Phase 3 and Phase 4.
- Demo, integration, and degraded runtime messaging logic — Phase 4.
- Feature-complete shopper screens such as welcome, detection, catalog, try-on, fit details, and session end — Phase 5.
- Protected admin access flow, health panels, calibration tools, logs, and catalog management workflows — Phase 6.
- Domain-specific components such as garment cards, fit widgets, measurement panels, and degraded-state overlays — later UI-heavy phases tied to real feature work.

</deferred>

---
*Phase: 02-app-shell-and-design-system*
*Context gathered: 2026-03-24*
