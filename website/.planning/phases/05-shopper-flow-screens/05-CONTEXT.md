# Phase 5: Shopper Flow Screens - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 5 delivers the shopper-facing kiosk screens on top of the completed shell, state, selectors, runtime read models, demo fixtures, and privacy-reset orchestration. It fills the fixed shopper flow of `idle -> detection -> catalog -> tryOn -> fitDetails -> sessionEnd` without redesigning shell composition, store ownership, typed contracts, or runtime seams. Admin workflows remain out of scope.

</domain>

<decisions>
## Implementation Decisions

### Flow and shell continuity
- **D-01:** Shopper flow remains the fixed finite state sequence `idle -> detection -> catalog -> tryOn -> fitDetails -> sessionEnd`.
- **D-02:** Shopper screens must fit into the existing shopper shell zones only: top band, protected center stage, right context rail, and overlay lanes.
- **D-03:** Phase 5 must replace Phase 2 proof content with real shopper UI, not redesign the shell frame or introduce shopper routes outside the fixed phase model.
- **D-04:** Unity remains the visual hero in try-on-related phases; React chrome stays restrained and stage-safe.

### Detection and entry behavior
- **D-05:** Detection remains auto-advance; there is no manual continue step between `detection` and `catalog`.
- **D-06:** Try-on entry requires garment selection only.
- **D-07:** Size and color variants may default during catalog or try-on entry and remain editable inside `tryOn`.

### Fit details and session-end behavior
- **D-08:** `fitDetails` is rendered as a right-rail takeover / expanded rail mode while the protected stage remains intact.
- **D-09:** Session reset remains immediate and privacy-first.
- **D-10:** Session-end visibility is provided by a short-lived post-reset confirmation surface decoupled from shopper-scoped data.

### Runtime and degraded presentation
- **D-11:** Shopper screens consume selectors and shopper-safe runtime read models; they must not consume adapter payloads or transport details directly.
- **D-12:** Degraded behavior remains orthogonal to the shopper phase model and surfaces only through shopper-safe read models and guidance.
- **D-13:** Shopper-facing text must stay local-first, upper-body honest, privacy-safe, and free of AI/transport jargon.

### the agent's Discretion
- Exact screen/file splits between `src/screens/`, `src/features/`, and shell-local composition helpers.
- Exact component names for screen-local shopper modules, as long as shell and store boundaries remain intact.
- Exact motion treatments and copy variations, as long as they stay within the Phase 2 token contract and the copy rules locked by the Phase 5 UI-SPEC.

</decisions>

<specifics>
## Specific Ideas

- Detection should feel like a calm transition state, not a gated form.
- Catalog should use the protected stage for curated browsing and the right rail for selected-item context plus the try-on action.
- Try-on should keep the center stage visually clear and put richer measurement and fit content into the rail.
- Fit details should feel like a deeper explanation mode inside the same shell, not a new page frame.
- Post-reset confirmation must prove deletion without relying on retained shopper measurements, selection, or fit data.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and repo rules
- `AGENTS.md` — repo-wide product truth, privacy rules, kiosk model, architecture rules, and shell constraints.
- `docs/UI_SPEC.md` — primary product and UX source of truth for the shopper states, Unity boundary, degraded behavior, and privacy reset.

### Project planning
- `.planning/PROJECT.md` — project framing, active requirements, and local-first scope.
- `.planning/REQUIREMENTS.md` — `SHOP-01` through `SHOP-08` plus adjacent privacy and degraded constraints.
- `.planning/ROADMAP.md` — official Phase 5 goal, success criteria, and plan breakdown.
- `.planning/STATE.md` — current project state, noting that older completion metadata may lag the existing artifacts.
- `.planning/config.json` — repo-local workflow config with UI phase enabled.

### Prior phase decisions
- `.planning/phases/02-app-shell-and-design-system/02-CONTEXT.md` — locked shell/design-system boundary.
- `.planning/phases/02-app-shell-and-design-system/02-UI-SPEC.md` — approved shopper shell zones, stage protection rules, and primitive inventory.
- `.planning/phases/03-state-model-and-typed-contracts/03-CONTEXT.md` — locked state/store/reset boundary.
- `.planning/phases/03-state-model-and-typed-contracts/03-CONTRACT-SPEC.md` — canonical shopper state machine, selectors, store ownership, and reset contract.
- `.planning/phases/04-integration-seams-and-runtime-modes/04-CONTRACT-SPEC.md` — runtime read models, degraded derivation, command sequencing, and reset-safe event handling.

### Existing implementation seams
- `src/app/shell/ShopperShell.tsx` — fixed shopper shell composition that Phase 5 must populate rather than redesign.
- `src/stores/session/sessionStore.ts` — authoritative shopper phase machine.
- `src/stores/catalog/selectors.ts` — catalog selection and readiness selectors for shopper screens.
- `src/stores/measurements/selectors.ts` — shopper-safe measurement display selectors.
- `src/stores/fit/selectors.ts` — shopper-safe fit summary and alternative-size selectors.
- `src/lib/runtime/readModels.ts` — derived shopper-safe runtime read models for detection, catalog, Unity, measurements, fit, and degraded state.
- `src/app/runtime/createAppRuntime.ts` — current runtime orchestration and immediate-reset sequencing.
- `src/lib/sessionReset/resetSession.ts` — centralized deterministic shopper reset coordinator.

### Repo-local workflow
- `.codex/get-shit-done/workflows/discuss-phase.md` — discussion workflow that informed this context.
- `.codex/get-shit-done/workflows/ui-phase.md` — UI contract workflow now being executed.
- `.codex/get-shit-done/templates/UI-SPEC.md` — base UI-SPEC template structure.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/shell/ShopperShell.tsx` — fixed top band, protected stage, right rail, and overlay lanes ready for real shopper composition.
- `src/components/primitives/*` — buttons, panels, badges, dividers, and focus treatment already exist and should be reused.
- `src/lib/runtime/readModels.ts` — already exposes shopper-safe readiness and degraded summaries for screen composition.
- `src/mocks/catalog/catalogFixtures.ts`, `src/mocks/runtime/runtimeFixtures.ts`, and `src/mocks/unity/unityFixtures.ts` — provide realistic demo coverage for shopper flows without inventing new data seams.

### Established Patterns
- Presentation stays prop- and selector-driven; adapters and contracts do not belong in JSX.
- Degraded issues and guidance are derived centrally and consumed as read models, not hand-authored in screens.
- Reset is immediate and centralized, so any visible session-end confirmation must be decoupled from shopper-scoped store data.

### Integration Points
- `src/screens/` is available for state-level shopper screens.
- `src/features/` is available for shopper modules such as garment selection, fit detail content, and measurement presentation.
- `src/app/shell/ShopperShell.tsx` remains the presentation frame that screen composition plugs into.

</code_context>

<deferred>
## Deferred Ideas

- Admin access and operational workflows — Phase 6.
- New store types, new shopper phases, or runtime/source-mode redesign — out of scope for Phase 5.
- Shopper accounts, history, pricing, commerce flows, or full-body-specific UX — out of scope for v1.

</deferred>

---
*Phase: 05-shopper-flow-screens*
*Context gathered: 2026-03-24*
