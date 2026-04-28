---
phase: 06
slug: admin-surface
status: approved
shadcn_initialized: false
preset: none
created: 2026-03-24
reviewed_at: 2026-03-24
---

# Phase 06 — UI Design Contract

> Visual and interaction contract for the staff-facing admin surface. This contract populates the existing admin shell with real operational UI for access, dashboard, catalog curation, calibration, and logs without redesigning shopper flow, shell composition, stores, contracts, or runtime seams beyond strictly minimal admin extensions.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none |
| Icon library | lucide-react |
| Font | Primary UI: Manrope only; no shopper display accent in admin mode |

### Phase 6 Intent

- Replace the proof-only admin shell content with a real local operational surface.
- Keep the Phase 2 admin shell composition intact: command bar, left nav rail, workspace canvas, optional inspector rail.
- Keep the admin surface implementation-oriented, operational, and kiosk-local rather than decorative or dashboard-template driven.
- Preserve shopper privacy and reset authority. Admin access must only happen after the shopper session has already been ended and cleared.
- Keep admin JSX on stores, selectors, and read models only. No raw transport payloads, no adapter events, and no runtime seam leakage in presentation.

### Continuity from Phases 2-5

- Phase 2 shell geometry remains locked from `.planning/phases/02-app-shell-and-design-system/02-UI-SPEC.md`.
- Phase 3 state/store/contracts remain locked from `.planning/phases/03-state-model-and-typed-contracts/03-CONTRACT-SPEC.md`.
- Phase 4 runtime/read-model boundaries remain locked from `.planning/phases/04-integration-seams-and-runtime-modes/04-CONTRACT-SPEC.md`.
- Phase 5 shopper flow and reset confirmation remain locked from `.planning/phases/05-shopper-flow-screens/05-UI-SPEC.md`.
- Phase 6 may add only the smallest admin-specific selector/read-model and contract surface needed to render and operate the staff UI honestly.

---

## Spacing Scale

Declared values remain fixed from prior UI contracts:

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Badge internals, status icon gaps |
| sm | 8px | Compact inline control spacing |
| md | 16px | Default control padding and dense operational rows |
| lg | 24px | Section grouping and panel interiors |
| xl | 32px | Workspace gaps and shell spacing |
| 2xl | 48px | Large workspace separation only |
| 3xl | 64px | Exceptional spacing only; not default admin panel padding |

Exceptions: none

### Spacing Rules

- Admin defaults to `md`, `lg`, and `xl`; it is denser than shopper but still kiosk-readable.
- Summary panels use `lg` internal spacing, not shopper-style hero spacing.
- Data rows, selectors, and curation forms must stay aligned to a consistent operational rhythm rather than freeform card padding.
- Inspector content should read as secondary detail, not as a full second workspace.

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 18px | 400 | 1.5 |
| Label | 16px | 600 | 1.4 |
| Heading | 32px | 600 | 1.2 |
| Display | 56px | 600 | 1.05 |

### Typography Rules

- Admin mode uses Manrope only; no Cormorant Garamond and no luxury-display treatment.
- `Display` is not used for routine admin sections. It is allowed only on the dedicated PIN gate heading if implementation needs one oversized identity moment.
- Section titles and panel titles should rely on `Heading` and `Label`, not oversized hero copy.
- Logs, timestamps, and operational summaries should remain concise and scannable rather than paragraph-heavy.

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#0F161D` | Admin canvas and command-bar background |
| Secondary (30%) | `#18212A` | Primary panels, rails, workspace surfaces |
| Accent (10%) | `#5B8FB9` | Focus, selected nav item, one primary action per region, operational emphasis |
| Destructive | `#C45A48` | End/reset confirmations, disable confirmations, destructive controls only |

Accent reserved for: selected nav state, `Unlock Admin`, one section-primary action, focus rings, and compact operational emphasis chips

### Color Rules

- Admin remains cooler and more explicit than shopper mode; it must not inherit shopper gold as its operating accent.
- Status colors must stay semantic and restrained. Use chips, bordered surfaces, and compact emphasis instead of warning-siren panels.
- No analytics-neon charts, no purple gradients, and no glossy “control center” theatrics.
- Critical warnings can use stronger borders and destructive accents, but the UI should still feel calm and deliberate.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | Unlock Admin |
| Empty state heading | No Operational Data Yet |
| Empty state body | Local operational data will appear here when the device reports it. Refresh or return after the next local update. |
| Error state | Local admin access is unavailable right now. End the shopper session, then try again. |
| Destructive confirmation | End shopper session first: This clears current shopper measurements and selections before staff access. |

### Staff Copy Rules

- Staff copy is concise, operational, and plainspoken.
- Admin UI may name operational surfaces directly as `Camera`, `Runtime`, `Unity`, and `Catalog`.
- Avoid raw payload labels, JSON terms, stack traces, protocol jargon, and shopper-facing luxury language as default UI copy.
- All destructive or state-changing actions must say what changes locally on this device.
- Labels should be verb-led and explicit: `Refresh Snapshot`, `Start Calibration`, `Return to Shopper`, `Save Curation`.

---

## Locked Admin Access Flow

### Access Model

- Admin access is a dedicated local PIN-gated access surface.
- The public shell-mode toggle is proof-only and must not be the production access path.
- Admin access is available only when the shopper flow is already back in its reset-safe idle state.
- Admin entry is blocked whenever `selectCanEndSession()` is still `true` or shopper state is otherwise active.

### Access Entry Rules

1. The shopper experience exposes only a subdued `Staff Access` utility entry point.
2. `Staff Access` may appear only when shopper state is idle or immediately post-reset; it must not appear as a primary shopper CTA.
3. If staff attempts admin entry while a shopper session is active through any local trigger, the UI must first require the explicit shopper end/reset path. It may not bypass reset.
4. Once reset completes, the admin access surface becomes available and the staff PIN flow begins.

### PIN Access Surface

- The PIN gate uses the existing admin shell frame, not a separate app layout.
- **Command bar**
  - left: `Staff Access` mode label
  - right: `Return to Shopper` quiet action only
- **Left nav rail**
  - visible but disabled; shows the four admin sections as locked destinations
- **Workspace canvas**
  - centered access card with:
    - heading: `Staff access`
    - support copy explaining that shopper data has already been cleared and a local PIN is required
    - six masked PIN cells
    - numeric keypad
    - quiet `Cancel` action
    - primary `Unlock Admin` action
- **Inspector rail**
  - hidden on the PIN gate

### PIN Interaction Rules

- PIN is exactly six numeric digits.
- Keyboard and mouse are both first-class:
  - keyboard digits `0-9` fill cells
  - `Backspace` removes the last digit
  - `Enter` submits when six digits are present
  - on-screen keypad supports mouse selection
- `Unlock Admin` stays disabled until all six digits are present.
- Invalid PIN clears the entered digits and shows one inline error message:
  - `PIN not recognized. Try again or return to shopper mode.`
- No shopper data is shown anywhere on the access surface.
- No account name, cloud login, or remote identity language is allowed.

---

## Admin Shell Composition

### Fixed Admin Shell Zones

1. **Command bar**
   - persistent top operational band
   - mode identity, section title, operational status summary cluster, and 1-2 global/section actions
2. **Left navigation rail**
   - only structural section switching
   - sections are fixed: `Dashboard`, `Catalog`, `Calibration`, `Logs`
3. **Workspace canvas**
   - primary task region for the active section
4. **Inspector rail**
   - secondary detail region
   - hidden on the PIN gate
   - optional on dashboard and calibration
   - expected on catalog and logs when an item is selected

### Admin Width and Density Rules

- Continue using the Phase 2 shell widths already encoded in tokens and globals:
  - nav rail: `clamp(240px, 15vw, 288px)`
  - inspector rail: `clamp(280px, 18vw, 360px)`
  - command bar height: `80px`
- At widths below `1280px`, inspector stacks below the workspace per the existing shell rules; the information hierarchy must remain the same.
- Workspace must not degrade into an equal-weight analytics card wall.

---

## Locked Admin Section-to-Shell Mappings

| Surface | Command Bar | Left Nav Rail | Workspace Canvas | Inspector Rail |
|---------|-------------|---------------|------------------|----------------|
| `access` | staff-access label + return action | visible but disabled | PIN gate card | hidden |
| `dashboard` | mode label + worst-status summary + quick action cluster | active section nav | summary workspace + quick links | optional detail for selected summary |
| `catalog` | section label + snapshot status + refresh/save actions | active section nav | catalog curation list and status summary | selected-garment curation editor |
| `calibration` | section label + calibration status + start/cancel action | active section nav | calibration controls, checklist, and current status | optional run/profile detail |
| `logs` | section label + warning/error counts + refresh action | active section nav | operational log list with filter controls | selected log detail |

### Navigation Rules

- Section switching belongs only in the left nav rail.
- The command bar must not become a second nav system.
- `Return to Shopper` stays in the command bar and is available only after admin is unlocked.
- A section may expose one primary quick action in the command bar; secondary actions belong in the workspace or inspector.

---

## Exact Workspace Composition

### Dashboard

**Purpose:** give staff one landing workspace that summarizes the local device state and routes into the four admin sections.

**Command bar**
- left cluster:
  - `Operational Mode` badge
  - section title: `Dashboard`
  - short support copy: local device status only
- right cluster:
  - worst-status chip
  - `Refresh Health` quiet action
  - `Return to Shopper` quiet action

**Left nav rail**
- fixed section list:
  - Dashboard
  - Catalog
  - Calibration
  - Logs
- selected item uses accent state and stronger border treatment

**Workspace canvas**
- top summary row with four real summary panels:
  - `Health Summary`
  - `Calibration Summary`
  - `Catalog Summary`
  - `Log Summary`
- bottom quick-links row with buttons or linked panels into:
  - `Open Catalog`
  - `Open Calibration`
  - `Open Logs`
- each summary panel contains:
  - one title
  - one primary status line
  - 2-3 compact supporting facts
  - one linked action into the related section
- no charts, no vanity KPIs, no fake graphs

**Inspector rail**
- optional
- default content when nothing is selected:
  - current access state
  - local device note
  - most urgent operational note
- when a summary panel is selected, inspector shows the deeper summary detail for that domain

### Catalog

**Purpose:** curate local garment availability and curation metadata for the kiosk catalog.

**Command bar**
- left:
  - section title: `Catalog`
  - snapshot freshness/status chip
- right:
  - `Refresh Snapshot`
  - `Save Curation` primary action
  - `Return to Shopper`

**Workspace canvas**
- top row:
  - catalog summary strip with counts
  - filter controls for category and enabled/disabled state
- main body:
  - garment list/table with columns:
    - garment name
    - category
    - status
    - order
    - default variant summary
    - default size/color summary
  - row selection opens the inspector editor
- empty state is operational:
  - explain no local garments are available to curate
  - offer `Refresh Snapshot`

**Inspector rail**
- selected garment curation editor only
- content order:
  - garment identity
  - enabled/disabled toggle
  - category assignment control
  - ordering controls
  - default variant selector
  - default size selector
  - default color selector
  - `Save Curation`
  - `Discard Changes`

### Calibration

**Purpose:** let staff start, monitor, or cancel local calibration operations without exposing low-level transport details.

**Command bar**
- left:
  - section title: `Calibration`
  - current calibration status chip
- right:
  - `Start Calibration` primary action when allowed
  - `Cancel Calibration` destructive/quiet action only when in progress
  - `Return to Shopper`

**Workspace canvas**
- top status panel:
  - current calibration status
  - active profile if present
  - last completed time if present
- main control panel:
  - short checklist of prerequisites derived from normalized health/readiness
  - primary action area for start/cancel
  - progress/support text in plain staff language
- fallback state remains calm:
  - if calibration is unavailable, say what local prerequisite is missing

**Inspector rail**
- optional
- used for:
  - active profile detail
  - last completed run detail
  - last failure note

### Logs

**Purpose:** show recent local operational logs in a staff-readable workspace.

**Command bar**
- left:
  - section title: `Logs`
  - warning/error count chip cluster
- right:
  - `Refresh Logs`
  - `Return to Shopper`

**Workspace canvas**
- top row:
  - level filters
  - source filters
  - newest-entry timestamp summary
- main body:
  - log list/table with columns:
    - level
    - source
    - message
    - timestamp
- selecting a row opens the inspector detail
- no raw JSON viewer, no protocol dumps, no developer debug console styling

**Inspector rail**
- selected log detail only
- content order:
  - level and source
  - timestamp
  - full message
  - related operational surface summary if available

---

## Locked Selector and Read-Model Boundaries

### Access Surface

The access surface may consume:
- `selectCanStartSession()`
- `selectCanEndSession()`
- `selectAdminState()`
- `selectUiMode()`

Required derived read model:
- `readAdminAccessGate()`
  - returns whether admin entry is allowed, blocked by active shopper session, or currently granted

### Dashboard

Dashboard may consume:
- `selectAdminState()`
- `selectCalibrationState()`
- `selectVisibleLogs()`
- `selectHealthSignals()`
- `selectOperationalStatuses()`
- `selectWorstSystemStatus()`
- `selectWorstOperationalReadiness()`
- `selectCatalogStatus()`
- `selectVisibleGarments()`
- `selectVisibleCategories()`

Required derived read models:
- `readAdminDashboardSummary()`
- `readHealthSummaryCard()`
- `readCalibrationSummaryCard()`
- `readCatalogCurationSummary()`
- `readLogSummaryCard()`

### Catalog

Catalog may consume:
- `selectAdminState()`
- `selectCatalogStatus()`
- `selectVisibleCategories()`
- `selectVisibleGarments()`
- `selectGarmentById()`

Required derived read models:
- `readAdminCatalogWorkspace()`
- `readAdminCatalogInspector()`
- `readCatalogCurationSummary()`

### Calibration

Calibration may consume:
- `selectAdminState()`
- `selectCalibrationState()`
- `selectHealthSignals()`
- `selectOperationalStatuses()`
- `selectOperationalStatus(surface)`

Required derived read models:
- `readCalibrationWorkspace()`
- `readCalibrationSummaryCard()`

### Logs

Logs may consume:
- `selectAdminState()`
- `selectVisibleLogs()`
- `selectOperationalStatuses()`

Required derived read models:
- `readLogWorkspace()`
- `readLogSummaryCard()`

### Boundary Rules

- Admin sections must not consume adapter contract events, transport wrappers, or raw runtime payloads directly.
- Cross-domain presentation joins belong in admin read models or selector helpers, not inline JSX.
- Any new admin read model must stay normalized and UI-safe, returning summaries, counts, statuses, and selected-item detail rather than raw envelopes.

---

## Inspector Usage Rules

- Inspector is hidden on the PIN access surface.
- Dashboard inspector is optional and detail-driven. It opens only when a summary card is selected or when the implementation has a clear “most urgent issue” detail to show.
- Catalog inspector is the primary selected-garment curation surface.
- Calibration inspector is optional secondary detail only.
- Logs inspector is the primary selected-log detail surface.
- Inspector must never duplicate the entire workspace. It exists for selected-item detail, not a second full panel stack.

---

## Admin Command and Quick-Action Placement

### Command Bar

Allowed content:
- mode label
- section title
- status summary chips
- one section-primary action
- one quiet refresh or secondary action
- `Return to Shopper`

Not allowed:
- dense filter bars
- multi-row command matrices
- section navigation duplication
- raw debug controls

### Workspace

Workspace-local actions belong inside the workspace when they affect:
- filters
- selected rows
- staged curation edits
- calibration prerequisites
- log selection

### Inspector

Inspector-local actions belong in the inspector when they affect only the selected item:
- save/discard selected garment curation
- clear selected log detail
- view selected calibration detail

---

## Summary Presentation Rules

### Health Summary

- Must use normalized operational statuses and health signals only.
- Show per-surface status for `Camera`, `Runtime`, `Unity`, and `Catalog`.
- Lead with human-readable summaries, not transport phrases.
- Dashboard summary may show the worst status first, then compact per-surface chips.

### Calibration Summary

- Must show:
  - current calibration status
  - active profile if present
  - last completed time if present
- If unavailable, explain which prerequisite is missing in local operational terms.

### Catalog Summary

- Must show:
  - garment count
  - enabled/disabled count
  - category count
  - snapshot freshness/status
- Must not show pricing, sales, inventory, or commerce analytics.

### Log Summary

- Must show:
  - recent error count
  - recent warning count
  - latest log timestamp
- Must not present logs as a consumer-facing “activity feed.”

---

## Catalog Curation Interaction Rules

### Curation Metadata Boundary

Default size/color must be represented through a small admin curation metadata shape layered alongside the catalog domain, not by distorting shopper-facing garment entities.

The curation layer may hold:
- enabled/disabled state
- category assignment override where needed
- sort order
- default variant
- default size code
- default color id

### Interaction Model

- Curation is row-selection plus inspector editing, not full-table inline editing.
- A garment row must be selected before inspector curation controls appear.
- Inspector edits are staged locally for the selected garment.
- Committed changes happen through explicit `Save Curation`.
- `Discard Changes` resets inspector fields to the last committed local state.
- `Refresh Snapshot` is a command-bar action. If unsaved inspector edits exist, refresh must require explicit confirmation before discarding staged changes.

### Ordering Rules

- Ordering uses deterministic controls, not freeform drag-first behavior.
- Preferred control pattern:
  - `Move Up`
  - `Move Down`
  - visible order value
- Keyboard and mouse must both operate ordering controls.

### Enable/Disable Rules

- Enable/disable is a first-class control in the inspector and visible status in the list.
- Disabling a garment must require clear status language but not a heavy destructive modal unless implementation determines the action is high-risk.
- Disabled garments remain visible in admin curation lists.

### Default Variant / Size / Color Rules

- Default variant selection is independent from shopper session state.
- Default size and default color are curated metadata, not transient shopper selections.
- If the current default variant no longer supports the curated default size or color, the inspector must show the mismatch and require staff to choose a valid replacement before saving.

### Out-of-Scope Catalog Actions

The catalog section must not include:
- create garment
- delete garment
- upload media
- edit shopper-facing marketing copy as a content-management workflow
- remote/cloud synchronization tooling

---

## Placeholder Boundaries vs Real Admin UI

### Must Be Real in Phase 6

- PIN-gated admin access surface
- real dashboard summary cards
- real left-nav section switching
- real catalog curation workspace and inspector
- real calibration status and controls
- real log list and selected-log detail

### Placeholder/Fallback Allowed

- empty states when no local data exists
- unavailable states when the local snapshot or operational data is missing
- subdued “not yet reported” messaging when a local subsystem has not produced data yet

### Not Allowed

- Phase 2 proof copy such as “Operational layout only”
- fake charts or invented KPIs
- shopper-style hero framing
- transport payload dumps, raw JSON viewers, or protocol diagnostics as the default admin UI

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| none | none | not applicable |

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-03-24
