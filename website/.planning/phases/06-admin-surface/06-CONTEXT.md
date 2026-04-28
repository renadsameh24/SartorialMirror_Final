# Phase 6: Admin Surface - Context

**Gathered:** 2026-03-24
**Status:** Ready for UI/spec and planning

<domain>
## Phase Boundary

Phase 6 delivers the separate staff-facing operational surface on top of the completed shell, shopper flow, stores, selectors, runtime orchestration, and reset model. It implements protected admin access, an operational dashboard, and staff workflows for local system health, calibration, logs, and local catalog curation. It does not redesign shopper flows, weaken privacy reset, introduce cloud-first operations, or expand into full product authoring.

</domain>

<decisions>
## Implementation Decisions

### Admin access and protection
- **D-01:** Admin access is staff-only and protected by a local PIN gate.
- **D-02:** The public shopper/admin shell toggle must not remain the real production access path.
- **D-03:** Admin entry cannot overlap an active shopper session.
- **D-04:** Entering admin requires an explicit shopper end/reset first; shopper reset remains privacy-first and authoritative.
- **D-05:** Admin access should build on the existing `AdminAccessState` model (`hidden | requested | granted`) rather than introducing shopper-facing auth or cloud identity.

### Admin workspace structure
- **D-06:** Build on the existing Phase 2 admin shell composition: command bar, left navigation rail, center workspace, and optional right inspector rail.
- **D-07:** The admin dashboard is a real landing workspace, not placeholder chrome. It should provide summary status plus navigation into catalog, calibration, and logs.
- **D-08:** Admin remains operational and kiosk-local, not consumer-facing and not dashboard-template SaaS.

### Data and presentation boundaries
- **D-09:** Admin UI must continue consuming stores, selectors, and read models, not raw transport payloads or adapter events directly in JSX.
- **D-10:** Shopper and admin remain structurally and visually separate; Phase 6 must not redesign shopper shell or shopper screens.
- **D-11:** Runtime and adapter details stay behind the existing typed seams and orchestration boundaries; any admin-facing operational summaries should be normalized before reaching presentation.

### Catalog management scope
- **D-12:** Phase 6 catalog management is limited to local operational curation only.
- **D-13:** Supported catalog curation actions in Phase 6 are:
  - enable or disable garments
  - category assignment
  - ordering
  - default variant
  - default size/color selection
  - refresh snapshot
- **D-14:** Phase 6 does not include full product authoring, asset upload, or cloud inventory management.
- **D-15:** Catalog management must stay honest to the current local-first kiosk prototype and the existing catalog domain, not expand into commerce or CMS behavior.

### Contract and runtime extension rules
- **D-16:** Phase 6 may introduce only a minimal contract extension for admin catalog actions where it is strictly needed.
- **D-17:** Any contract extension must remain typed, local-first, and narrowly scoped to the approved admin catalog curation actions; it must not reopen the broader runtime seam architecture.
- **D-18:** Admin calibration, health refresh, log refresh, and any approved catalog actions should continue to flow through typed ports, adapters, orchestration, stores, selectors, and read models in that order.

### the agent's Discretion
- Exact PIN-entry interaction pattern and local validation UX, as long as it is clearly staff-only and never shopper-facing by default.
- Exact dashboard summary composition and inspector usage, as long as dashboard remains a true landing workspace and section hub.
- Exact panel/component splits under `src/screens/`, `src/features/`, and `src/components/` as long as the shell, store, and runtime boundaries remain intact.

</decisions>

<specifics>
## Specific Ideas

- The current proof-only admin frame in `src/app/shell/AdminShell.tsx` should evolve into the real admin surface rather than being replaced wholesale.
- Dashboard summary should likely surface at least: overall health posture, calibration state, catalog freshness, and recent log visibility before staff drill into section-specific work.
- Admin entry should feel deliberate and operational, not like a casual shell-mode switch.
- Because admin cannot overlap an active shopper session, the transition into admin should visibly confirm that the shopper session has already been ended and cleared first.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and repo constraints
- `AGENTS.md` — Repo-wide product truth, privacy rules, architecture boundaries, admin separation, and local-first scope.
- `docs/UI_SPEC.md` — Source of truth for admin/staff separation, privacy model, kiosk constraints, and local operational reality.

### Project planning
- `.planning/PROJECT.md` — Project framing, active admin requirement, and local-first operational scope.
- `.planning/REQUIREMENTS.md` — `ADMIN-01`, `ADMIN-02`, and `ADMIN-03`.
- `.planning/ROADMAP.md` — Official Phase 6 goal, success criteria, and plan structure.
- `.planning/STATE.md` — Current project position and next workflow step after discussion.

### Prior locked phase decisions
- `.planning/phases/02-app-shell-and-design-system/02-CONTEXT.md` — Locked shell/design-system boundary and admin-shell scope from Phase 2.
- `.planning/phases/02-app-shell-and-design-system/02-UI-SPEC.md` — Approved admin shell composition, density, and width rules.
- `.planning/phases/03-state-model-and-typed-contracts/03-CONTEXT.md` — Locked store/reset boundary and admin state ownership.
- `.planning/phases/03-state-model-and-typed-contracts/03-CONTRACT-SPEC.md` — Canonical admin state shape, store ownership, and typed contract surface.
- `.planning/phases/04-integration-seams-and-runtime-modes/04-CONTRACT-SPEC.md` — Runtime orchestration, normalized operational state, degraded derivation, and reset-safe event handling.
- `.planning/phases/05-shopper-flow-screens/05-CONTEXT.md` — Locked shopper-flow continuity and explicit non-overlap with admin work.
- `.planning/phases/05-shopper-flow-screens/05-04-SUMMARY.md` — Confirms shopper flow and reset confirmation are complete before Phase 6 begins.

### Existing code seams
- `src/app/shell/AdminShell.tsx` — Existing admin shell composition to evolve, not replace.
- `src/app/shell/AppShell.tsx` — Current shopper/admin shell split and current temporary access path that Phase 6 must replace for production behavior.
- `src/app/shell/ShellModeToggle.tsx` — Proof-only toggle that must stop being the real production admin entry path.
- `src/stores/admin/adminStore.ts` — Existing admin operational state store.
- `src/stores/admin/selectors.ts` — Existing admin UI-safe selector seam.
- `src/stores/systemHealth/systemHealthStore.ts` — Normalized operational status owner for health-facing admin surfaces.
- `src/stores/systemHealth/selectors.ts` — Health selectors available to admin summary and operational panels.
- `src/stores/catalog/catalogStore.ts` — Existing catalog entity and selection store whose domain must not be redesigned casually.
- `src/stores/catalog/selectors.ts` — Existing catalog read surface to build on for admin curation views.
- `src/app/runtime/createAppRuntime.ts` — Current runtime orchestration layer and reset sequencing that Phase 6 must preserve.
- `src/lib/sessionReset/resetSession.ts` — Authoritative shopper reset contract.
- `src/adapters/contracts/commands.ts` — Existing admin command surface and location for any strictly minimal extension.
- `src/adapters/contracts/ports.ts` — Existing typed port boundaries that must remain the only adapter-facing seams.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/shell/AdminShell.tsx` already defines the command bar, nav rail, workspace, and inspector composition Phase 6 should populate with real operational UI.
- `src/components/shell/AdminNavRail.tsx`, `src/components/shell/WorkspaceCanvas.tsx`, and `src/components/shell/InspectorRail.tsx` already provide the structural shell slots for the admin surface.
- `src/components/primitives/*` already gives Phase 6 reusable operational surfaces, buttons, badges, headers, and dividers without introducing a new component system.
- `src/stores/admin/adminStore.ts` already owns active section, calibration state, access state, and selected log entry.
- `src/stores/systemHealth/*` already owns normalized operational status and health signals suitable for dashboard and health panels.

### Established Patterns
- Presentation remains selector- and read-model-driven; adapters and transport payloads do not belong in JSX.
- Shopper reset is centralized and authoritative through `src/lib/sessionReset/`.
- Runtime orchestration lives in `src/app/runtime/createAppRuntime.ts`; adapters do not write stores directly.
- Admin shell already exists as a separate structural surface, but its current content is proof-only and must be replaced with real operational content.

### Integration Points
- `src/app/shell/` remains the shell boundary for admin access and high-level mode composition.
- `src/screens/` should host admin state-level screens or section-level workspace composition.
- `src/features/` should host operational modules such as dashboard summaries, health panels, calibration panels, log views, and catalog-management submodules.
- `src/stores/admin/`, `src/stores/systemHealth/`, and `src/stores/catalog/` are the primary state domains Phase 6 will read and extend.
- `src/adapters/contracts/commands.ts` and related port/orchestration code are the only approved places for narrowly scoped admin catalog-action contract work if planning proves it necessary.

</code_context>

<deferred>
## Deferred Ideas

- Full product authoring for garments and variants.
- Asset upload pipelines and media management.
- Cloud inventory synchronization or remote staff tooling.
- Shopper/admin concurrent operation or background admin overlays during an active shopper session.
- Any broad contract/runtime redesign beyond a strictly minimal admin catalog-action extension.

</deferred>

---
*Phase: 06-admin-surface*
*Context gathered: 2026-03-24*
