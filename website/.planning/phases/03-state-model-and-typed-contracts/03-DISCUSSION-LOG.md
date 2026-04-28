# Phase 3: State Model and Typed Contracts - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-03-24
**Phase:** 03-state-model-and-typed-contracts
**Areas discussed:** store topology, shopper flow model, reset boundary, external contract shape

---

## Store Topology

| Option | Description | Selected |
|--------|-------------|----------|
| Monolithic app store | Keep all domains in one global state container with broad setters | |
| Distinct domain stores with shared reset orchestration | Separate session, catalog, measurements, fit, health, admin, degraded, and UI mode while coordinating reset centrally | ✓ |
| Local component state plus ad hoc lifting | Continue storing orchestration state near components and wire upward only when needed | |

**User's choice:** Recommended default selected from repo context: distinct domain stores with shared reset orchestration.
**Notes:** `AGENTS.md`, `docs/UI_SPEC.md`, and `STATE-02` all favor clear state boundaries over a monolithic or component-local approach.

---

## Shopper Flow Model

| Option | Description | Selected |
|--------|-------------|----------|
| Explicit finite shopper states plus orthogonal degraded state | Model the shopper journey directly and keep degraded conditions separate from the primary flow | ✓ |
| Route-per-screen consumer flow | Use page-like routing as the main experience driver | |
| Implicit view flags spread across stores | Derive screens from many booleans without a canonical state machine | |

**User's choice:** Recommended default selected from repo context: explicit finite shopper states plus orthogonal degraded state.
**Notes:** The repo repeatedly specifies a session-based kiosk state machine and rejects route-heavy consumer-web modeling.

---

## Reset Boundary

| Option | Description | Selected |
|--------|-------------|----------|
| Central reset orchestrator clearing only session-scoped shopper state | Coordinate deterministic privacy reset across stores while preserving non-shopper operational data | ✓ |
| Per-store reset methods with no coordinator | Let each domain clear itself independently when asked | |
| Full application wipe on session end | Clear every store, including catalog definitions and operational state | |

**User's choice:** Recommended default selected from repo context: central reset orchestrator clearing only session-scoped shopper state.
**Notes:** Privacy reset must be deterministic, but the local catalog and operational health are app-scoped inputs rather than shopper history.

---

## External Contract Shape

| Option | Description | Selected |
|--------|-------------|----------|
| Type-first ports with separate Unity, backend, and catalog contracts | Define discriminated unions and command interfaces before any runtime implementation | ✓ |
| Implement adapters first and infer types later | Start with live code and let types emerge from implementation | |
| Shared loosely typed event bus in the UI layer | Send raw payloads through presentation-facing code and normalize later | |

**User's choice:** Recommended default selected from repo context: type-first ports with separate Unity, backend, and catalog contracts.
**Notes:** `STATE-03`, the roadmap, and the Unity boundary rules all require explicit seams before live integration starts.

---

## the agent's Discretion

- Exact file names and module splits for stores, selectors, and contract definitions.
- Whether shared status primitives are generic or domain-specialized, as long as partial/ready/unavailable semantics remain explicit.

## Deferred Ideas

- Runtime mode implementation and degraded orchestration.
- Live Unity/backend adapter implementation.
- Shopper/admin feature screen construction.
- Admin protection and access workflows.

---

*Phase: 03-state-model-and-typed-contracts*
*Discussion log generated: 2026-03-24*
