---
phase: 05
slug: shopper-flow-screens
status: approved
shadcn_initialized: false
preset: none
created: 2026-03-24
reviewed_at: 2026-03-24
---

# Phase 05 — UI Design Contract

> Visual and interaction contract for the shopper-facing kiosk flow. This contract populates the existing shopper shell with real shopper UI for `idle`, `detection`, `catalog`, `tryOn`, `fitDetails`, and `sessionEnd` without redesigning shell composition, stores, contracts, or runtime seams.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none |
| Icon library | lucide-react |
| Font | Primary UI: Manrope; shopper display accent only: Cormorant Garamond |

### Phase 5 Intent

- Replace the shell-only proof surfaces with real shopper-facing screens.
- Keep the existing shopper shell zones intact: top band, protected stage, right context rail, and overlay lanes.
- Keep Unity visually central in `tryOn` and `fitDetails`.
- Keep degraded behavior orthogonal and shopper-safe through read models and guidance.
- Stay honest to a local-first, upper-body kiosk prototype with a small local catalog.

### Continuity from Phases 2-4

- Phase 2 shell geometry remains locked from `.planning/phases/02-app-shell-and-design-system/02-UI-SPEC.md`.
- Phase 3 state/store/reset contracts remain locked from `.planning/phases/03-state-model-and-typed-contracts/03-CONTRACT-SPEC.md`.
- Phase 4 runtime read models and degraded derivation remain locked from `.planning/phases/04-integration-seams-and-runtime-modes/04-CONTRACT-SPEC.md`.
- This phase may add shopper presentation and phase orchestration only. It must not add admin workflows, new shopper phases, or runtime transport concerns in JSX.

---

## Spacing Scale

Declared values remain fixed from earlier UI contracts:

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Badge internals, icon gaps |
| sm | 8px | Compact control spacing |
| md | 16px | Default row and control spacing |
| lg | 24px | Group spacing inside shopper modules |
| xl | 32px | Rail and stage module spacing |
| 2xl | 48px | Large stage-safe offsets and roomy shopper composition |
| 3xl | 64px | Exceptional hero spacing only |

Exceptions: none

### Spacing Rules

- Shopper screens should default to `lg`, `xl`, and `2xl`, not dense dashboard spacing.
- Stage overlays stay compact and edge-anchored.
- Richer explanatory content belongs in the rail before it expands into the stage center.

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 18px | 400 | 1.5 |
| Label | 16px | 600 | 1.4 |
| Heading | 32px | 600 | 1.2 |
| Display | 56px | 600 | 1.05 |

### Typography Rules

- `Display` is reserved for `idle` and the short-lived post-reset confirmation only.
- `Heading` and `Body` should carry most shopper guidance and fit explanation.
- Rail content must stay readable from standing distance and avoid long paragraphs.
- Fit details and degraded guidance use plain language, not technical language.

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#0E0E10` | Shopper canvas, stage-adjacent background |
| Secondary (30%) | `#1A1B20` | Rail panels, overlays, secondary surfaces |
| Accent (10%) | `#C6A56A` | Primary shopper CTA, active selection, privacy emphasis, focus |
| Destructive | `#C45A48` | End-session actions only |

Accent reserved for: `Start Session`, selected garment/variant emphasis, one primary action per region, focus rings, privacy reassurance emphasis

### Color Rules

- `tryOn` and `fitDetails` must preserve stage clarity; accent may not become a floating HUD color flood.
- Degraded attention states use semantic shopper-safe surfaces, not alarm-red full-screen treatments.
- Session-end confirmation should read as calm deletion confirmation, not failure.

---

## Locked Shopper Flow

| Phase | Transition Model | Locked Decision |
|-------|------------------|-----------------|
| `idle` | app starts here and returns here after reset | primary entry point |
| `detection` | auto-advances when ready | no manual continue |
| `catalog` | enters after detection readiness | try-on entry requires garment selection only |
| `tryOn` | main value moment | size/color stay editable here |
| `fitDetails` | separate phase rendered inside the same shell | right-rail takeover / expanded rail mode |
| `sessionEnd` | immediate reset side effect | visible confirmation happens post-reset and is decoupled from shopper data |

---

## Locked Phase-to-Shell Mappings

| Phase | Top Band | Protected Center Stage | Right Context Rail | Overlay Lanes |
|-------|----------|------------------------|--------------------|---------------|
| `idle` | brand + privacy reassurance | welcome hero + start CTA + live stage impression | privacy/input summary | empty by default |
| `detection` | phase label + privacy reassurance + end session | positioning guidance and live stage impression | simple readiness checklist + guidance | minimal status only |
| `catalog` | phase label + end session | garment browsing grid with category controls | selected garment, variant controls, try-on CTA | lightweight context only |
| `tryOn` | current garment context + end session | Unity hero view | measurements, fit summary, variant editing, navigation actions | compact garment/status overlays |
| `fitDetails` | fit-details context + back action + end session | same Unity hero view, unchanged | expanded explanatory fit rail takeover | minimal garment/status context only |
| `sessionEnd` | confirmation label only | post-reset deletion confirmation surface | subdued privacy summary only | cleared |

---

## Exact Shopper Screen Composition

### Idle

**Purpose:** invite the shopper to begin and establish trust.

**Top band**
- Brand label.
- Short privacy reassurance.
- No admin affordances, no mode switching, no dense command cluster.

**Protected center stage**
- Live stage impression or connected visual surface if available.
- Centered welcome hero with one display heading, one short supporting sentence, and one primary `Start Session` action.
- No multi-step tutorial and no technical operational copy.

**Right context rail**
- Brief privacy summary.
- Keyboard/mouse-first prompt.
- Optional calm status note only when app-scoped degraded guidance exists.

**Overlay lanes**
- Empty by default.
- If used, top lane may show a passive privacy badge only.
- Bottom lane remains empty.

**Selectors / read models**
- `selectCanStartSession()`
- `readDegradedState()`

**Guidance and status messaging**
- Default supporting copy: shopper-safe, privacy-first, and invitation-led.
- App-scoped issues may appear as calm secondary notes in the rail only.
- No raw operational status lists or surface names.

**Interaction**
- `Enter` / `Space` activates `Start Session`.
- Mouse click activates `Start Session`.

### Detection

**Purpose:** confirm presence and guide positioning until the flow auto-advances.

**Top band**
- Phase label: `Detection`.
- Privacy reassurance remains visible.
- Quiet `End Session` action.

**Protected center stage**
- Live stage impression with a clear positioning frame or target zone.
- Center-safe guidance card that explains how to stand, not how the pipeline works.
- No manual continue button.

**Right context rail**
- Three-step readiness checklist:
  - step into view
  - square shoulders to the display
  - hold position while detection settles
- One primary guidance block sourced from the detection read model.

**Overlay lanes**
- Top lane: compact state chip only (`Waiting`, `Positioning`, transient `Ready` if visible before auto-advance).
- Bottom lane: optional single-line assistance hint only.

**Selectors / read models**
- `selectCanEndSession()`
- `readDetectionReadiness()`
- `readDegradedState()`

**Guidance and status messaging**
- `waitingForUser`: “Step back into view to continue.”
- `positioning`: “Hold position while detection settles.”
- `readyToAdvance`: brief transient success copy only; no shopper click is required.
- Blocking degraded guidance stays in plain language and stays tied to the current shopper task.

**Interaction**
- `Esc` or explicit end action may end the session if the product maps an end shortcut later; mouse must always have an explicit end control.
- No gesture-only affordances.

### Catalog

**Purpose:** allow the shopper to browse the small local garment set and choose a garment.

**Top band**
- Phase label: `Select Garment`.
- One quiet `End Session` action.
- No marketplace chrome, no pricing, no inventory counters.

**Protected center stage**
- Curated catalog layout for roughly 10-15 garments.
- Category controls at the top of the stage-safe area.
- Garment cards in a restrained grid or card rail.
- Selected garment is visually highlighted in the stage, not only in the rail.

**Right context rail**
- Selected garment summary.
- Size and color controls when present.
- Primary `Try On` action.
- Supporting copy only for the selected garment or the “choose a garment” empty state.

**Overlay lanes**
- Top lane: current category or catalog readiness context only.
- Bottom lane: optional compact keyboard hints only.
- Overlay lanes must not become a second rail of controls.

**Selectors / read models**
- `selectCanEndSession()`
- `selectCatalogStatus()`
- `selectVisibleCategories()`
- `selectVisibleGarments()`
- `selectActiveSelection()`
- `selectSelectionReadyForTryOn()`
- `readCatalogReadiness()`
- `readDegradedState()`

**Guidance and status messaging**
- No selection: “Choose a garment to continue.”
- Catalog unavailable: stage shows a calm unavailable state; `Try On` is disabled.
- Catalog partial: stage still renders available garments; missing items do not become technical warnings.

**Interaction**
- Keyboard focus order: category controls -> garment list -> rail controls -> `Try On`.
- Mouse and keyboard both operate category, garment, size, and color selection.

### TryOn

**Purpose:** deliver the primary value moment while keeping Unity central.

**Top band**
- Current garment identity.
- Current size if selected.
- Quiet `End Session` action.

**Protected center stage**
- Unity-rendered try-on view remains the hero.
- The center safe area stays visually clear.
- No rail-like text stacks inside the stage center.

**Right context rail**
- Compact garment summary.
- Editable size and color controls.
- Measurement panel.
- Fit summary and recommendation.
- Primary `Fit Details` action.
- Secondary `Back to Catalog` action.
- Quiet `End Session` action if needed locally in the rail.

**Overlay lanes**
- Top lane: garment name + size chip only.
- Bottom lane: compact fit or render state summary only.
- No multi-button overlay rows.

**Selectors / read models**
- `selectCanEndSession()`
- `selectActiveSelection()`
- `selectMeasurementStatus()`
- `selectDisplayMeasurements()`
- `selectCurrentRecommendation()`
- `selectFitSummary()`
- `selectAlternativeSize()`
- `readUnityRenderReadiness()`
- `readMeasurementReadiness()`
- `readFitReadiness()`
- `readDegradedState()`

**Guidance and status messaging**
- Unity delayed: compact non-blocking attention copy.
- Measurements partial: keep visible available values; do not replace the whole panel with an error state.
- Fit partial: keep plain-language summary and state that more data may improve it.
- Unity unavailable or measurement/fit blocking states: stage and rail remain usable, but the UI must clearly say confidence is reduced.

**Interaction**
- Variant edits happen in the rail, not through a modal.
- `Back to Catalog` returns to the catalog state without clearing the current selection.

### FitDetails

**Purpose:** explain the current fit in plain language without abandoning the try-on shell.

**Top band**
- Phase label: `Fit Details`.
- Current garment context.
- Quiet `Back to Try-On` action.
- Quiet `End Session` action.

**Protected center stage**
- Same Unity hero view as `tryOn`.
- No new stage frame, route, or full-screen takeover.

**Right context rail**
- Full rail takeover / expanded rail mode.
- Content order:
  - fit summary headline
  - plain-language explanation
  - reasons list
  - recommended size and current size comparison
  - optional `Apply Recommended Size` action when `alternativeSize` exists
  - optional alternative garment module only when `alternativeGarmentId` resolves to a current catalog garment
  - `Back to Try-On` action

**Overlay lanes**
- Top lane: garment and size context only.
- Bottom lane: minimal fit status chip only when helpful.

**Selectors / read models**
- `selectCanEndSession()`
- `selectActiveSelection()`
- `selectDisplayMeasurements()`
- `selectCurrentRecommendation()`
- `selectFitSummary()`
- `selectAlternativeSize()`
- `readMeasurementReadiness()`
- `readFitReadiness()`
- `readDegradedState()`
- `readUnityRenderReadiness()`

**Guidance and status messaging**
- Fit details copy must explain outcome, not mechanism.
- If fit is unavailable, the rail switches to a calm fallback explanation with a clear path back to `tryOn`.
- If measurements are partial, the rail says the current explanation may change as more data settles.

**Interaction**
- `Back to Try-On` is the canonical return path.
- Variant edits that apply a recommended size may happen here, but full browsing stays in `catalog`.

### SessionEnd

**Purpose:** make deletion visible without delaying or weakening immediate privacy reset.

**Top band**
- Confirmation label only.
- No shopper-specific data.

**Protected center stage**
- Post-reset confirmation surface shown after local reset is already complete.
- Display heading and one-line confirmation body only.
- No garment, fit, or measurement recap.

**Right context rail**
- Subdued privacy summary only.
- No prior-session detail.

**Overlay lanes**
- Cleared.

**Selectors / read models**
- No shopper-scoped selectors.
- This surface is driven by a shell-local confirmation state triggered by the reset-completion edge.
- It may read `selectCanStartSession()` only to confirm the app is back in idle.

**Guidance and status messaging**
- Required copy confirms local deletion plainly.
- No warnings from the prior shopper session may survive into this surface.

**Interaction**
- Non-dismissible.
- No primary action while visible.

---

## Locked Shopper Screen Data Boundaries

### Allowed selector families

| Domain | Allowed shopper-facing selectors |
|-------|-----------------------------------|
| Session | `selectShopperPhase`, `selectCanStartSession`, `selectCanEndSession` |
| Catalog | `selectCatalogStatus`, `selectVisibleCategories`, `selectVisibleGarments`, `selectActiveSelection`, `selectSelectionReadyForTryOn` |
| Measurements | `selectMeasurementStatus`, `selectDisplayMeasurements` |
| Fit | `selectFitStatus`, `selectCurrentRecommendation`, `selectFitSummary`, `selectAlternativeSize` |
| Runtime read models | `readDetectionReadiness`, `readCatalogReadiness`, `readUnityRenderReadiness`, `readMeasurementReadiness`, `readFitReadiness`, `readDegradedState`, `selectReadyToAdvance` |

### Forbidden shopper-facing inputs

- Raw contract events from `src/adapters/contracts/*`
- Raw transport wrappers from `src/adapters/runtime/*`, `src/adapters/unity/*`, or `src/adapters/catalog/*`
- Raw `confidenceScore`
- Raw `systemHealth.operationalStatuses` or `HealthSignal[]` rendered directly in shopper JSX
- Direct store-object reads that bypass selectors/read models

### Boundary rules

- Shopper screens compose selector outputs and read models only.
- Any cross-domain joining belongs in screen orchestration helpers or runtime read models, not inline JSX condition trees.
- Admin selectors and admin operational state are not shopper-screen inputs in Phase 5.

---

## Variant Editing Behavior Inside TryOn

- Entering `tryOn` requires a selected garment only.
- If the selected garment exposes a `defaultVariantId`, the UI should prefill that color/variant when no explicit color has been chosen yet.
- If only one size is available, the UI should prefill it.
- If multiple sizes or colors are available and none is selected yet, the rail shows editable controls immediately; the shopper is not forced back to `catalog`.
- Variant edits write through existing catalog store actions first and rely on the existing runtime orchestration to send Unity commands.
- Failed Unity delivery never silently reverts the chosen size or color.

---

## FitDetails Rail Takeover Behavior

- `fitDetails` replaces the compact `tryOn` rail with an expanded explanatory rail.
- The rail takeover does not create a new page frame or route.
- The stage stays visually stable and continues to show the Unity view.
- `Apply Recommended Size` is allowed when an `alternativeSize` exists.
- Alternative garment content appears only when `alternativeGarmentId` resolves cleanly against the current catalog snapshot; otherwise it is omitted.

---

## Session-End Confirmation Behavior and Timing

- Local shopper reset remains immediate and authoritative.
- After reset completes and the shopper flow returns to idle, the app shows a post-reset confirmation surface for exactly `2400ms`.
- During this `2400ms` window:
  - the normal idle welcome hero is replaced by the confirmation surface
  - the `Start Session` CTA is hidden or disabled
  - no shopper-scoped data is rendered
- After `2400ms`, the app returns to the normal idle screen automatically.
- If app-scoped degraded issues still exist, they may appear again once the normal idle screen returns.

Required confirmation copy:
- Heading: `Session ended.`
- Body: `Measurements and garment selections were cleared on this device.`

---

## Locked Degraded and Guidance Presentation Rules

### Global rules

- Degraded behavior stays orthogonal to the primary shopper phase model.
- Guidance is action-oriented and shopper-safe.
- No stack traces, transport errors, raw confidence numbers, or AI/ML terminology are allowed.

### Phase-specific rules

| Phase | Presentation Rule |
|-------|-------------------|
| `idle` | show only calm app-scoped status notes; never show a technical preflight panel |
| `detection` | primary guidance appears in stage-safe content and rail checklist; blocking issues never become full-screen alarms |
| `catalog` | unavailable catalog replaces the grid with a calm unavailable state; right-rail selection context remains secondary |
| `tryOn` | Unity delayed stays non-blocking and compact; Unity unavailable or measurement/fit unavailability must be honest but not visually noisy |
| `fitDetails` | fallback explanation lives inside the expanded rail; shopper always has a clear path back to `tryOn` |
| post-reset confirmation | prior session guidance is gone; only app-scoped issues may reappear after the confirmation window ends |

### Guidance sourcing

- Detection uses `readDetectionReadiness().primaryGuidance` first.
- Other shopper phases use `readDegradedState().primaryGuidance`.
- Screens may add phase-specific framing around guidance, but not rewrite technical meaning into transport language.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Idle primary CTA | Start Session |
| Detection default guidance | Stand centered in the frame to continue. |
| Catalog empty-state heading | Choose a garment |
| Catalog empty-state body | Select one item to begin the try-on view. |
| Try-on secondary action | Back to Catalog |
| Fit-details return action | Back to Try-On |
| End-session destructive action | End Session |
| End-session confirmation | End Session: Clears current measurements and garment selections. |

### Copy Tone Rules

- Shopper copy must stay calm, direct, and premium.
- Use outcome language, not pipeline language.
- Keep instructions short and immediately actionable.
- Avoid blame language such as “you failed detection.”
- Avoid commerce language such as pricing, stock pressure, ratings, or checkout urgency.

---

## Exact Placeholder Boundaries vs Real Shopper UI

### Real shopper UI in Phase 5

- Real shopper states and transitions for `idle`, `detection`, `catalog`, `tryOn`, `fitDetails`, and post-reset confirmation
- Real catalog browsing driven from the catalog store
- Real size/color editing driven from existing selection actions
- Real measurements, fit summaries, and shopper-safe degraded guidance driven from selectors/read models
- Real end-session confirmation tied to actual local reset timing

### Still placeholder or omitted in Phase 5

- Admin workflows and admin shell content
- Shopper accounts, history, pricing, reviews, inventory pressure, or checkout
- Shopper-facing runtime/source-mode switches
- Raw operational health consoles or debugging panels
- Fake full-body or cloud-first claims
- Alternative garment content when no current catalog garment resolves for the provided ID
- Any fake replay or recap of cleared shopper measurements after reset

### Honesty rule

- If a live visual surface is unavailable in `idle` or `detection`, the stage may fall back to a calm neutral stage surface and truthful guidance.
- The UI must never fake a richer sensing or rendering capability than the current runtime actually provides.

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
