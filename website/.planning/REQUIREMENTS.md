# Requirements: The Sartorial Mirror

**Defined:** 2026-03-24
**Core Value:** A shopper can complete a calm, privacy-safe try-on session with clear fit feedback and deterministic local data reset, without depending on perfect backend or rendering conditions.

## v1 Requirements

### Foundation

- [x] **FOUND-01**: Developer can install dependencies and start the front-end project locally using documented scripts.
- [x] **FOUND-02**: Project includes strict TypeScript, Vite, Tailwind/PostCSS, linting, and test tooling configured for the intended stack.
- [x] **FOUND-03**: Source tree follows the layered structure from `AGENTS.md` so presentation, state, adapters, and utilities stay separated.

### App Shell

- [ ] **SHELL-01**: UI shell is optimized for large kiosk display readability rather than laptop-density layout.
- [ ] **SHELL-02**: Shopper and admin visual systems use separate tokens and primitives so admin complexity does not leak into shopper mode.
- [ ] **SHELL-03**: Shared interactive primitives expose clear focus states and support keyboard and mouse as first-class inputs.

### State and Contracts

- [ ] **STATE-01**: Shopper experience is driven by an explicit state machine for welcome, detection, catalog, try-on, fit details, and session end.
- [ ] **STATE-02**: Session, catalog, measurement, fit, health, admin, degraded, and UI mode state live in distinct typed state containers.
- [ ] **STATE-03**: Frontend-to-Unity and frontend-to-backend events and commands are defined through typed contracts before live integration.
- [ ] **STATE-04**: Session reset logic is centralized and deterministically clears session-scoped data.

### Runtime Modes

- [ ] **MODE-01**: UI can run in demo mode using local mock garments, measurements, fit recommendations, and health signals.
- [ ] **MODE-02**: UI can switch to integration mode through isolated adapters without rewriting presentation components.
- [ ] **MODE-03**: UI enters a calm degraded mode when tracking, measurements, fit data, or Unity updates are partial or delayed.
- [ ] **MODE-04**: Shopper-facing degraded messaging avoids stack traces, raw confidence numbers, and technical jargon.

### Shopper Flow

- [ ] **SHOP-01**: Shopper can start a session from the welcome state with keyboard or mouse.
- [ ] **SHOP-02**: Shopper receives simple positioning guidance and a clear ready state during detection.
- [ ] **SHOP-03**: Shopper can browse a small local garment catalog and select garment, size, and color where available.
- [ ] **SHOP-04**: Try-on view presents Unity as the visual hero with minimal overlay chrome.
- [ ] **SHOP-05**: Try-on view shows garment identity, selected size, measurements, fit confidence, and size recommendation.
- [ ] **SHOP-06**: Shopper can open a fit details view that explains fit in plain language and offers an alternate size when needed.
- [ ] **SHOP-07**: Shopper can end the session and see explicit confirmation that session data was deleted before returning to welcome.
- [ ] **SHOP-08**: Shopper mode contains no accounts, persistent history, cart, checkout, or social sharing flows.

### Admin

- [ ] **ADMIN-01**: Staff can access a protected admin mode that is structurally separate from shopper mode.
- [ ] **ADMIN-02**: Admin mode shows local system health, logs or error visibility, and calibration controls.
- [ ] **ADMIN-03**: Admin mode supports local garment catalog management.

### Verification

- [ ] **QUAL-01**: Automated tests cover core shopper state transitions and deterministic session reset behavior.
- [ ] **QUAL-02**: Automated tests cover adapter event handling across demo, integration, and degraded runtime modes.
- [ ] **QUAL-03**: Automated checks verify key screens and components preserve keyboard-first interaction behavior.

## v2 Requirements

### Input Enhancements

- **NEXT-01**: Shopper can optionally use gesture shortcuts in addition to keyboard and mouse.
- **NEXT-02**: Shopper can optionally use voice prompts for session guidance and navigation.

### Expanded Try-On Scope

- **NEXT-03**: System supports fuller-body try-on states beyond the upper-body prototype.
- **NEXT-04**: Fit details can recommend alternate garments when backend recommendation data is mature enough.

### Packaging and Operations

- **NEXT-05**: Application can be packaged for kiosk desktop deployment when local operational workflows require it.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Shopper login or account creation | Conflicts with privacy-first, session-based product model |
| Persistent measurement history | Conflicts with deterministic reset and local-only session scope |
| Cart, checkout, and payment flows | Not part of the smart fitting prototype value proposition |
| Social sharing or email capture | Unnecessary for v1 and weakens privacy positioning |
| Cloud-first synchronization | Current scope assumes local processing and local operations |
| Full-body perfection | Prototype scope is explicitly upper-body-first |
| Gesture-only or voice-only interaction | Keyboard and mouse are non-negotiable in v1 |
| Shopper-facing debug or AI pipeline panels | Violates the calm premium UX and exposes internals |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Completed |
| FOUND-02 | Phase 1 | Completed |
| FOUND-03 | Phase 1 | Completed |
| SHELL-01 | Phase 2 | Pending |
| SHELL-02 | Phase 2 | Pending |
| SHELL-03 | Phase 2 | Pending |
| STATE-01 | Phase 3 | Pending |
| STATE-02 | Phase 3 | Pending |
| STATE-03 | Phase 3 | Pending |
| STATE-04 | Phase 3 | Pending |
| MODE-01 | Phase 4 | Pending |
| MODE-02 | Phase 4 | Pending |
| MODE-03 | Phase 4 | Pending |
| MODE-04 | Phase 4 | Pending |
| SHOP-01 | Phase 5 | Pending |
| SHOP-02 | Phase 5 | Pending |
| SHOP-03 | Phase 5 | Pending |
| SHOP-04 | Phase 5 | Pending |
| SHOP-05 | Phase 5 | Pending |
| SHOP-06 | Phase 5 | Pending |
| SHOP-07 | Phase 5 | Pending |
| SHOP-08 | Phase 5 | Pending |
| ADMIN-01 | Phase 6 | Pending |
| ADMIN-02 | Phase 6 | Pending |
| ADMIN-03 | Phase 6 | Pending |
| QUAL-01 | Phase 7 | Pending |
| QUAL-02 | Phase 7 | Pending |
| QUAL-03 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-24*
*Last updated: 2026-03-24 after initial definition*
