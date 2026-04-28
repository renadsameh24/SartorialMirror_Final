# Phase 6: Admin Surface - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `06-CONTEXT.md` — this log preserves the authoritative choices that froze the discussion.

**Date:** 2026-03-24
**Phase:** 06-admin-surface
**Areas discussed:** admin access model, session overlap rules, admin landing workspace, catalog management boundary, contract-extension limits, privacy/presentation boundary

---

## Admin Access Model

| Option | Description | Selected |
|--------|-------------|----------|
| Staff-only local PIN gate | Admin entry is protected locally and reserved for staff | ✓ |
| Public shell toggle | Shopper/admin mode switch remains directly available in the shell | |
| Shopper-style account sign-in | Admin access uses a fuller auth/account flow | |

**Locked decision:** Admin access is staff-only and protected by a local PIN gate.
**Notes:** The public shopper/admin toggle must not remain the real production access path.

---

## Session Overlap Rules

| Option | Description | Selected |
|--------|-------------|----------|
| Explicit shopper end/reset required before admin entry | Admin cannot overlap a live shopper session | ✓ |
| Allow admin entry during active shopper session | Staff may enter admin without ending the shopper flow | |
| Background admin overlay | Admin tools appear on top of shopper mode | |

**Locked decision:** Admin entry cannot overlap an active shopper session.
**Notes:** Entering admin requires an explicit shopper end/reset first, and shopper reset remains privacy-first and authoritative.

---

## Admin Landing Workspace

| Option | Description | Selected |
|--------|-------------|----------|
| Real dashboard landing | Dashboard is a real summary workspace and navigation hub | ✓ |
| Section-only shell | No real dashboard; nav immediately routes into functional sections | |
| Placeholder dashboard | Keep dashboard as proof content only | |

**Locked decision:** Admin dashboard is a real landing workspace.
**Notes:** It must provide summary plus navigation into catalog, calibration, and logs.

---

## Catalog Management Boundary

| Option | Description | Selected |
|--------|-------------|----------|
| Local operational curation only | Staff can curate local catalog behavior without full authoring | ✓ |
| Full product authoring | Create/edit garments, media, and product data broadly | |
| Cloud inventory management | Sync and manage a remote/global inventory system | |

**Locked decision:** Phase 6 catalog management is local operational curation only.
**Included actions:**
- enable/disable garments
- category assignment
- ordering
- default variant
- default size/color
- refresh snapshot

**Excluded actions:**
- full product authoring
- asset upload
- cloud inventory management

---

## Contract Extension Limits

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal contract extension only where strictly needed | Add the smallest typed admin catalog action surface needed | ✓ |
| No contract changes at all | Force all admin work into existing contracts regardless of fit | |
| Broad admin contract expansion | Add a large new admin transport surface up front | |

**Locked decision:** Phase 6 may introduce only a minimal contract extension for admin catalog actions where strictly needed.
**Notes:** This must not reopen the broader runtime seam architecture.

---

## Privacy and Presentation Boundary

| Option | Description | Selected |
|--------|-------------|----------|
| Selector/read-model driven admin UI | Admin UI consumes stores, selectors, and read models only | ✓ |
| Raw transport-driven admin JSX | Components read adapter payloads directly | |
| Mixed boundary | Some admin components bypass normalization for convenience | |

**Locked decision:** Admin UI must continue consuming stores/selectors/read models, not raw transport payloads.
**Notes:** Shopper reset remains authoritative and Phase 6 must not redesign shopper flows.

---

## the agent's Discretion

- Exact PIN UX and section-level composition details remain open for the UI/spec step.
- Exact panel/component file splits remain open for planning.

## Deferred Ideas

- Full garment/product authoring workflows
- Asset upload and media management
- Cloud inventory tools
- Concurrent shopper and admin operation
- Broad runtime/transport redesign

---

*Phase: 06-admin-surface*
*Discussion log generated: 2026-03-24*
