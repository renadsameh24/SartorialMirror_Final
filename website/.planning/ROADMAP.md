# Roadmap: The Sartorial Mirror

## Overview

This roadmap turns a greenfield repository and a detailed product spec into a buildable front-end for a privacy-first smart mirror prototype. The sequence prioritizes foundation first, then the kiosk shell, explicit state and contracts, runtime seams, the shopper experience, a separate admin surface, and verification that the behavior is trustworthy under both normal and degraded conditions.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation Bootstrap** - Establish the repository, toolchain, and architectural skeleton for the smart-mirror front-end.
- [ ] **Phase 2: App Shell and Design System** - Build the kiosk shell, shared primitives, and premium visual tokens for shopper and admin modes.
- [ ] **Phase 3: State Model and Typed Contracts** - Implement explicit session state, domain stores, and typed Unity/backend interfaces.
- [ ] **Phase 4: Integration Seams and Runtime Modes** - Add demo adapters, live integration seams, and calm degraded-state handling.
- [ ] **Phase 5: Shopper Flow Screens** - Deliver the end-to-end shopper journey from welcome through privacy reset.
- [ ] **Phase 6: Admin Surface** - Deliver the protected operational UI for staff workflows and local system control.
- [ ] **Phase 7: Verification and Hardening** - Prove critical behavior with automated checks and close the highest-risk gaps before broader iteration.

## Phase Details

### Phase 1: Foundation Bootstrap
**Goal**: Create the initial front-end repository foundation, development toolchain, and folder structure needed to build the product without leaking transport, rendering, or state concerns across layers.
**Depends on**: Nothing (first phase)
**UI hint**: no
**Requirements**: FOUND-01, FOUND-02, FOUND-03
**Success Criteria** (what must be TRUE):
1. Developers can install dependencies and start the project locally from a documented baseline.
2. TypeScript, build, styling, lint, and test tooling exist for the intended stack.
3. The codebase has the planned layered structure for presentation, state, adapters, utilities, and mocks.
**Plans**: 3 plans

Plans:
- [x] 01-01: Create `package.json`, `.gitignore`, and repository-level scripts for dev, build, lint, and test workflows.
- [x] 01-02: Add `tsconfig.json`, Vite config, Tailwind/PostCSS config, lint config, and test runner config for the chosen stack.
- [x] 01-03: Establish the `src/` directory architecture and placeholder module boundaries without implementing product screens.

### Phase 2: App Shell and Design System
**Goal**: Build the kiosk-first application shell, theme tokens, typography, motion primitives, and reusable UI building blocks for shopper and admin experiences.
**Depends on**: Phase 1
**UI hint**: yes
**Requirements**: SHELL-01, SHELL-02, SHELL-03
**Success Criteria** (what must be TRUE):
1. The app shell reads well on a large display and does not feel like a stretched desktop SaaS layout.
2. Shopper and admin experiences use distinct visual systems without style leakage.
3. Shared primitives expose focus treatment and keyboard or mouse interaction affordances by default.
**Plans**: 3 plans

Plans:
- [ ] 02-01: Create app-shell files under `src/app/` and shared layout primitives under `src/components/`.
- [ ] 02-02: Define shopper and admin design tokens in `src/styles/` and wire theme primitives into the shell.
- [ ] 02-03: Build accessible base components for buttons, panels, badges, rails, overlays, and focus handling.

### Phase 3: State Model and Typed Contracts
**Goal**: Encode the shopper journey as an explicit state model and define typed contracts for catalog, measurement, fit, health, admin, Unity, and backend interactions.
**Depends on**: Phase 2
**UI hint**: no
**Requirements**: STATE-01, STATE-02, STATE-03, STATE-04
**Success Criteria** (what must be TRUE):
1. Shopper state transitions are explicit and do not rely on route-heavy consumer web patterns.
2. Domain state is separated into typed stores with deterministic reset behavior.
3. Unity and backend messages flow through typed adapters instead of directly through screen components.
**Plans**: 3 plans

Plans:
- [ ] 03-01: Create shared domain types in `src/types/` and state containers in `src/stores/`.
- [ ] 03-02: Implement session reset orchestration and domain selectors under `src/lib/` and `src/stores/`.
- [ ] 03-03: Define typed command and event contracts in `src/adapters/` for Unity, backend, and local data sources.

### Phase 4: Integration Seams and Runtime Modes
**Goal**: Make the app usable in demo, integration, and degraded runtime modes through isolated adapters, mocks, and resilient UI-state wiring.
**Depends on**: Phase 3
**UI hint**: yes
**Requirements**: MODE-01, MODE-02, MODE-03, MODE-04
**Success Criteria** (what must be TRUE):
1. The application can run end-to-end in demo mode using local mock data.
2. Live backend and Unity inputs can be wired in through adapter seams without rewriting the presentation layer.
3. Partial or delayed runtime signals trigger calm degraded-state behavior rather than blocking or noisy failure states.
**Plans**: 3 plans

Plans:
- [ ] 04-01: Add mock fixtures and demo adapters under `src/mocks/` and `src/adapters/`.
- [ ] 04-02: Create integration-mode adapter boundaries for WebSocket events, Unity bridge messages, and local catalog data.
- [ ] 04-03: Implement degraded-state orchestration, guidance banners, and runtime-mode switching hooks.

### Phase 5: Shopper Flow Screens
**Goal**: Deliver the full shopper-facing kiosk experience across welcome, detection, catalog, live try-on, fit details, and session end states.
**Depends on**: Phase 4
**UI hint**: yes
**Requirements**: SHOP-01, SHOP-02, SHOP-03, SHOP-04, SHOP-05, SHOP-06, SHOP-07, SHOP-08
**Success Criteria** (what must be TRUE):
1. A shopper can move through the complete try-on session using only keyboard and mouse.
2. The Unity view remains the visual hero while catalog, fit, and privacy UI stay readable and restrained.
3. Session end clearly confirms deletion and returns the kiosk to a clean welcome state.
**Plans**: 4 plans

Plans:
- [ ] 05-01: Build `WelcomeScreen` and `DetectionScreen` with guidance, readiness, and session-start controls.
- [ ] 05-02: Build `CatalogScreen`, garment selection features, and local-size or color selection flows.
- [ ] 05-03: Build `TryOnScreen`, `MeasurementPanel`, `FitConfidenceWidget`, `SizeRecommendationBadge`, and `FitDetailsPanel`.
- [ ] 05-04: Build `SessionEndScreen`, privacy reset confirmation, and shopper-flow orchestration across all states.

### Phase 6: Admin Surface
**Goal**: Deliver a separate staff-facing operational interface for health visibility, calibration, logs, and local catalog management.
**Depends on**: Phase 5
**UI hint**: yes
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-03
**Success Criteria** (what must be TRUE):
1. Staff can enter a protected admin mode that is visibly separate from shopper mode.
2. Admin users can inspect health, logs, and calibration controls without exposing them to shoppers.
3. Admin users can manage the local garment catalog through the operational interface.
**Plans**: 3 plans

Plans:
- [ ] 06-01: Build admin access flow and separate admin shell components.
- [ ] 06-02: Build `SystemHealthPanel`, `CalibrationPanel`, and `LogViewer` with typed operational data models.
- [ ] 06-03: Build `CatalogManager` and local catalog-management workflows.

### Phase 7: Verification and Hardening
**Goal**: Add automated and manual verification for state correctness, runtime resilience, and keyboard-first behavior before broader implementation expansion.
**Depends on**: Phase 6
**UI hint**: no
**Requirements**: QUAL-01, QUAL-02, QUAL-03
**Success Criteria** (what must be TRUE):
1. Critical shopper state transitions and session reset behavior are covered by automated tests.
2. Demo, integration, and degraded runtime adapters are exercised by automated checks.
3. Key screens and components preserve keyboard-first interaction behavior under test.
**Plans**: 3 plans

Plans:
- [ ] 07-01: Add store and state-machine tests for session, catalog, measurement, fit, and reset flows.
- [ ] 07-02: Add adapter and degraded-mode tests for mock, integration, and recovery paths.
- [ ] 07-03: Add component-level and critical-path verification for shopper and admin interaction behavior.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation Bootstrap | 3/3 | Completed | 2026-03-24 |
| 2. App Shell and Design System | 0/3 | Not started | - |
| 3. State Model and Typed Contracts | 0/3 | Not started | - |
| 4. Integration Seams and Runtime Modes | 0/3 | Not started | - |
| 5. Shopper Flow Screens | 0/4 | Not started | - |
| 6. Admin Surface | 0/3 | Not started | - |
| 7. Verification and Hardening | 0/3 | Not started | - |
