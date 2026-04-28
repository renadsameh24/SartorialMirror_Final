# Phase 7: Verification and Hardening - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 7 audits, verifies, and hardens the completed front-end across shopper flow, admin flow, runtime/demo/integration seams, reset/privacy behavior, degraded-state behavior, and keyboard-first operation. It proves the existing implementation is trustworthy before handoff. It does not redesign the approved shell, state, selector, runtime, shopper, or admin architecture unless a concrete correctness, reliability, accessibility, or maintainability issue requires a contained fix.

</domain>

<decisions>
## Implementation Decisions

### Hardening posture
- **D-01:** Phase 7 is verification-first. Prefer targeted tests, audits, and contained hardening fixes over redesign or feature expansion.
- **D-02:** The approved Phase 1-6 architecture remains frozen: shell geometry, store boundaries, selector/read-model boundaries, runtime orchestration, shopper flow, and admin flow are preserved unless a specific defect proves a local change is necessary.
- **D-03:** Hardening changes are allowed only when they close a real correctness, reliability, accessibility, or maintainability gap surfaced by audit or verification.

### Verification strategy
- **D-04:** Stay on the current local-first verification stack: Vitest, React Testing Library, typecheck, and production build remain the primary automated gates.
- **D-05:** Prioritize critical-path proof over blanket coverage. Phase 7 should expand tests where behavior is still assumed or only lightly exercised, not chase broad file-by-file parity.
- **D-06:** Final Phase 7 sign-off requires both automated proof and a focused manual verification checklist for kiosk-realistic behaviors that are awkward to prove purely through store/component tests.

### Priority hardening areas
- **D-07:** Highest priority is the cross-phase boundary surface: shopper state transitions, deterministic reset/privacy behavior, runtime lifecycle and stale-event handling, degraded derivation and recovery, and admin/shopper separation.
- **D-08:** Keyboard-first behavior must be explicitly verified for the critical shopper and admin paths rather than inferred from click-only tests or native semantics alone.
- **D-09:** Runtime seam verification must cover both demo and integration paths, including adapter startup, snapshot loading, transport normalization, send-failure handling, and recovery behavior.
- **D-10:** Degraded behavior must be verified as a calm orthogonal layer: blocking vs non-blocking states, recovery to ready states, and non-technical shopper copy boundaries.

### Completion standard
- **D-11:** Final completion means the app is green on `npm run test -- --run`, `npm run typecheck`, and `npm run build`, with any Phase 7 regressions fixed inside the existing architecture.
- **D-12:** Phase 7 must verify that shopper reset remains authoritative and data-minimizing: no stale runtime/unity/catalog event may repopulate cleared shopper state, and no shopper data may leak into post-reset or admin access surfaces.
- **D-13:** Phase 7 should not introduce CI, cloud-dependent test infrastructure, or speculative device-lab workflows unless a hardening finding makes a small addition unavoidable.

### the agent's Discretion
- Exact test-file splits and whether new assertions live in existing suites or new focused Phase 7 suites.
- Exact balance between unit-level, component-level, and critical-path tests, as long as the locked priority areas are fully covered.
- Whether lightweight helper utilities are added to reduce repeated store/runtime test setup.
- Whether a minimal coverage report is added only if it is nearly free and does not drag the phase into tooling redesign.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product truth and repo constraints
- `AGENTS.md` — repo-wide product truth, privacy rules, architecture boundaries, kiosk interaction model, and local-first constraints.
- `docs/UI_SPEC.md` — primary product and UX source of truth for shopper flow, admin separation, degraded behavior, Unity boundary, and privacy reset.

### Project planning state
- `.planning/PROJECT.md` — current project framing, core value, and local-first scope.
- `.planning/REQUIREMENTS.md` — `QUAL-01`, `QUAL-02`, `QUAL-03` plus the earlier v1 requirements that Phase 7 is verifying.
- `.planning/ROADMAP.md` — official Phase 7 goal, success criteria, and plan breakdown.
- `.planning/STATE.md` — current milestone state showing Phases 1-6 completed and Phase 7 next.
- `.planning/config.json` — repo-local workflow configuration and enabled verification gates.

### Prior phase decisions that remain locked
- `.planning/phases/01-foundation-bootstrap/01-CONTEXT.md` — Phase 1 boundary and deferred verification/tooling notes.
- `.planning/phases/02-app-shell-and-design-system/02-CONTEXT.md` — locked shell/design-system boundary.
- `.planning/phases/02-app-shell-and-design-system/02-UI-SPEC.md` — approved kiosk shell geometry, focus rules, and primitive contract.
- `.planning/phases/03-state-model-and-typed-contracts/03-CONTEXT.md` — locked state/store/reset boundary.
- `.planning/phases/03-state-model-and-typed-contracts/03-CONTRACT-SPEC.md` — canonical shopper/admin state, reset, selectors, commands, and ports.
- `.planning/phases/04-integration-seams-and-runtime-modes/04-CONTRACT-SPEC.md` — runtime orchestration, normalization, degraded derivation, read-model, and lifecycle rules.
- `.planning/phases/05-shopper-flow-screens/05-CONTEXT.md` — locked shopper-flow continuity and reset-confirmation rules.
- `.planning/phases/05-shopper-flow-screens/05-UI-SPEC.md` — approved shopper phase-to-shell mappings and keyboard/mouse expectations.
- `.planning/phases/06-admin-surface/06-CONTEXT.md` — locked admin access, non-overlap, and catalog-curation boundaries.
- `.planning/phases/06-admin-surface/06-UI-SPEC.md` — approved admin access flow, shell mappings, and staff interaction rules.

### Prior implementation summaries to preserve
- `.planning/phases/01-foundation-bootstrap/01-01-SUMMARY.md` — install/bootstrap baseline.
- `.planning/phases/01-foundation-bootstrap/01-02-SUMMARY.md` — tooling/config baseline.
- `.planning/phases/01-foundation-bootstrap/01-03-SUMMARY.md` — initial shell/token scaffold baseline.
- `.planning/phases/04-integration-seams-and-runtime-modes/04-01-SUMMARY.md` — runtime bootstrap and demo seams.
- `.planning/phases/04-integration-seams-and-runtime-modes/04-02-SUMMARY.md` — integration adapters, normalization, and stale-event guarding.
- `.planning/phases/04-integration-seams-and-runtime-modes/04-03-SUMMARY.md` — degraded derivation, runtime read models, and lifecycle hardening.
- `.planning/phases/05-shopper-flow-screens/05-01-SUMMARY.md` — active-phase renderer boundary and idle/detection delivery.
- `.planning/phases/05-shopper-flow-screens/05-02-SUMMARY.md` — catalog flow, selector additions, and garment-only try-on gating.
- `.planning/phases/05-shopper-flow-screens/05-03-SUMMARY.md` — try-on / fit-details stability and derived fit-subscription constraint.
- `.planning/phases/05-shopper-flow-screens/05-04-SUMMARY.md` — UI-local post-reset confirmation and full shopper-flow verification baseline.
- `.planning/phases/06-admin-surface/06-01-SUMMARY.md` — PIN-gated admin access and dashboard baseline.
- `.planning/phases/06-admin-surface/06-02-SUMMARY.md` — calibration/logs workspaces and selector/read-model boundary.
- `.planning/phases/06-admin-surface/06-03-SUMMARY.md` — catalog curation surface, minimal runtime observer, and full admin-flow verification baseline.

### Existing implementation seams to audit and extend
- `src/app/App.tsx` — runtime bootstrap entry and mode handoff.
- `src/app/runtime/createAppRuntime.ts` — authoritative runtime orchestration and session/reset sequencing.
- `src/app/runtime/createRuntimeDependencies.ts` — mode-specific dependency resolution.
- `src/lib/sessionReset/resetSession.ts` — centralized deterministic shopper reset.
- `src/lib/sessionReset/resettableStores.ts` — shopper reset scope and order.
- `src/lib/runtime/applyInboundEvent.ts` — normalized store-write boundary.
- `src/lib/runtime/staleEventGuard.ts` — stale-session protection.
- `src/lib/runtime/degradedDerivation.ts` — degraded issue derivation and shopper-safe guidance.
- `src/lib/runtime/readModels.ts` — cross-domain readiness and degraded read surface.
- `src/screens/shopper/ShopperFlow.test.tsx` — existing full shopper-flow baseline.
- `src/screens/admin/AdminFlow.test.tsx` — existing full admin-flow baseline.
- `src/adapters/runtime/createIntegrationRuntimePort.ts` — integration runtime seam needing direct verification.
- `src/adapters/unity/createIntegrationUnityPort.ts` — integration Unity seam needing direct verification.
- `src/adapters/catalog/createIntegrationCatalogPort.ts` — integration catalog seam needing direct verification.
- `src/adapters/runtime/runtimeTransport.ts` — transport wrapper seam needing failure/recovery verification.
- `src/adapters/unity/unityTransport.ts` — transport wrapper seam needing failure/recovery verification.
- `src/adapters/catalog/catalogSnapshotLoader.ts` — snapshot load seam needing failure-path verification.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/runtime/createAppRuntime.test.ts` and `src/app/runtime/runtimeLifecycle.test.ts`: existing runtime lifecycle baseline already proves startup idempotence, restart cleanup, stale-event ignore, and admin catalog refresh reuse.
- `src/lib/runtime/*.test.ts`: normalization, stale-event guard, degraded derivation, and read-model test seams already exist and should be extended instead of replaced.
- `src/screens/shopper/*.test.tsx` and `src/screens/admin/*.test.tsx`: screen-level tests already cover the main shopper/admin happy paths and provide strong anchors for Phase 7 critical-path hardening.
- `src/mocks/catalog/catalogFixtures.ts`, `src/mocks/runtime/runtimeFixtures.ts`, `src/mocks/unity/unityFixtures.ts`, and `src/mocks/admin/adminFixtures.ts`: deterministic local fixtures already exist for demo/runtime/admin verification.

### Established Patterns
- Runtime orchestration is centralized in `createAppRuntime()`; adapters stay store-free and presentation stays selector/read-model driven.
- Shopper phase rendering is active-phase only through `ShopperPhaseRenderer`, which avoids React 19 + Zustand loop issues by not mounting every shopper screen at once.
- Post-reset confirmation is UI-local through `usePostResetConfirmation()` and intentionally decoupled from shopper-scoped stores.
- Admin access is separate from shopper state and enforced through a local PIN-gated access model plus idle-only entry rules.

### Integration Points
- Add or extend tests in `src/app/runtime/`, `src/lib/runtime/`, `src/lib/sessionReset/`, `src/screens/shopper/`, `src/screens/admin/`, and `src/adapters/` rather than introducing a separate verification subsystem.
- Hardening fixes should stay near the audited seam: runtime lifecycle in `src/app/runtime/`, event normalization in `src/lib/runtime/`, and interaction correctness in the relevant screen/feature modules.
- Manual verification should exercise the existing demo/integration bootstrap seam instead of inventing alternate runtime entry paths.

</code_context>

<specifics>
## Specific Ideas

- Treat the current suite as a strong baseline, not proof of completion. The repo already passes `npm run test -- --run`, `npm run typecheck`, and `npm run build`; Phase 7 should close the highest-risk remaining gaps rather than re-prove what is already explicit.
- The current highest-signal uncovered areas are direct integration-adapter/transport verification, explicit keyboard-only critical-path tests, failure-path send/load handling, and degraded recovery cases that go beyond happy-path assertions.
- Keep the product honest to a local kiosk prototype: demo mode remains first-class, integration mode is verified through seams and local transports, and no cloud-first or commerce-style verification scope is added.

</specifics>

<deferred>
## Deferred Ideas

- CI coverage thresholds or hosted pipeline gates — defer unless a concrete Phase 7 finding proves they are the smallest fix.
- Browser E2E infrastructure such as Playwright — defer unless critical keyboard/runtime behavior cannot be proven with the existing local test stack plus manual checklist.
- Broad visual redesign or shell restructuring — out of scope unless a hard blocker is found.
- Full WCAG audit beyond the critical-path keyboard/focus/privacy checks — defer to a follow-on quality pass unless blocking issues surface during Phase 7.

</deferred>

---
*Phase: 07-verification-and-hardening*
*Context gathered: 2026-03-24*
