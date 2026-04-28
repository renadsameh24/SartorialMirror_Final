# Phase 7: Verification and Hardening - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-24
**Phase:** 07-verification-and-hardening
**Areas discussed:** hardening posture, verification depth, runtime seam coverage, keyboard-first proof, final sign-off model

---

## Hardening Posture

| Option | Description | Selected |
|--------|-------------|----------|
| Verification-first hardening | Preserve approved architecture, prove behavior, and apply only contained fixes for real findings | ✓ |
| Redesign-driven quality pass | Reopen shell/state/runtime structure to preemptively simplify future work | |
| Feature-expansion polish pass | Mix new product capability with hardening work | |

**User's choice:** Verification-first hardening
**Notes:** The user explicitly constrained Phase 7 toward audit, verification, and hardening while preserving the approved architecture unless a real issue proves change is necessary.

---

## Verification Depth

| Option | Description | Selected |
|--------|-------------|----------|
| Critical-path expansion on current local stack | Extend the existing Vitest/RTL/typecheck/build baseline where proof is still thin | ✓ |
| Blanket coverage sweep | Chase broad file-by-file test coverage regardless of risk | |
| New infrastructure first | Add CI/E2E/coverage tooling before extending the current suites | |

**User's choice:** Critical-path expansion on current local stack
**Notes:** Current local verification already passes cleanly. Phase 7 should close the highest-risk gaps first rather than spending the phase on tooling churn.

---

## Runtime Seam Coverage

| Option | Description | Selected |
|--------|-------------|----------|
| Focus on boundary-risk seams | Verify runtime lifecycle, integration adapters/transports, failure paths, stale-event guards, and degraded recovery | ✓ |
| Demo-only confidence | Rely mostly on the existing demo-path coverage | |
| Broad transport redesign | Rework adapter/runtime shape before verifying it | |

**User's choice:** Focus on boundary-risk seams
**Notes:** The approved runtime architecture remains locked. The main remaining risks are direct integration-adapter proof, command/load failure handling, and recovery behavior after degraded conditions clear.

---

## Keyboard-First Proof

| Option | Description | Selected |
|--------|-------------|----------|
| Explicit keyboard-only critical-path tests | Verify start, navigate, select, submit, return, and admin PIN flows without relying on mouse clicks | ✓ |
| Implicit semantic confidence | Treat button semantics and click-based tests as sufficient | |
| Manual-only keyboard audit | Skip automated keyboard assertions and rely only on later UAT | |

**User's choice:** Explicit keyboard-only critical-path tests
**Notes:** Repo rules and product constraints make keyboard-first operation non-negotiable. Current tests are strong but still lean heavily on click-driven flows in key paths.

---

## Final Sign-Off Model

| Option | Description | Selected |
|--------|-------------|----------|
| Automated gates plus focused manual checklist | Green local suite, build/typecheck, and a concise kiosk-realistic manual verification pass | ✓ |
| Automated-only sign-off | Treat tests/build/typecheck as sufficient for handoff | |
| Broad device-lab / infra expansion | Add heavier deployment or multi-environment verification during Phase 7 | |

**User's choice:** Automated gates plus focused manual checklist
**Notes:** This keeps the phase honest to a local kiosk prototype while still acknowledging that a few behaviors are best confirmed through operator-style verification.

---

## the agent's Discretion

- Exact placement of new assertions and whether to extend existing suites or add new focused Phase 7 suites.
- Whether a lightweight coverage report is worth adding if it materially helps target remaining gaps without causing tooling churn.
- Exact manual checklist structure and artifact format.

## Deferred Ideas

- CI coverage thresholds and hosted verification pipelines.
- Browser E2E infrastructure.
- Broad visual or architectural redesign.
- Full accessibility audit outside the keyboard/focus/privacy critical path.
