---
phase: 04
slug: integration-seams-and-runtime-modes
status: approved
artifact: contract-spec
created: 2026-03-24
reviewed_at: 2026-03-24
---

# Phase 04 - Runtime Integration Contract Specification

> Implementation contract for Phase 4. This file locks the runtime composition root, adapter implementation boundaries, normalized event-to-store mapping, degraded derivation, read-model surfaces, and command/reset sequencing that planning and implementation must follow. It is intentionally code-adjacent, but it is not adapter implementation.

---

## Contract Intent

- Preserve the completed Phase 2 shell and protected stage composition as presentation-only.
- Preserve the approved Phase 3 stores, selectors, reset semantics, and type-first port contracts as the authoritative runtime-facing state layer.
- Add one runtime orchestration layer that makes the app usable in `demo` and `integration` source modes without leaking transport details into presentation.
- Treat degraded behavior as a derived operational layer on top of the shopper flow, not as a peer app mode or new shopper phase.
- Stay honest to a local-first, upper-body kiosk prototype with a small local catalog, deterministic privacy reset, and partial-data tolerance.

---

## Locked Inputs

| Area | Locked decision |
|------|-----------------|
| Runtime source mode | `demo` or `integration` only |
| Degraded model | derived operational layer, not a peer app mode |
| Runtime ownership | one app runtime orchestrator owns startup, subscriptions, teardown, normalization, and store writes |
| Mode selection | bootstrap/config driven; manual switching is dev-only or admin-only |
| Operational status | normalized Unity/runtime status is stored through existing operational state and exposed through selectors/read models |
| Detection readiness | derived read model, not a new shopper phase |
| Store boundary | Phase 3 stores remain authoritative; Phase 4 does not redesign store ownership |
| Contract boundary | `RuntimePort`, `UnityPort`, and `CatalogPort` remain the only adapter-facing seams |
| Presentation boundary | `AppShell`, `ShopperShell`, `AdminShell`, and Phase 2 shell zones remain presentation-only |
| Reset | local shopper reset stays deterministic, centralized, and transport-independent |

---

## Recommended File Surface

This phase should plan against the following documentation-to-code mapping:

| Area | Target path |
|------|-------------|
| Runtime bootstrap/config/orchestrator | `src/app/runtime/*` |
| Runtime port implementations | `src/adapters/runtime/*` |
| Unity port implementations | `src/adapters/unity/*` |
| Catalog port implementations | `src/adapters/catalog/*` |
| Runtime normalization and mapping helpers | `src/lib/runtime/*` |
| Demo fixtures and simulators | `src/mocks/runtime/*`, `src/mocks/unity/*`, `src/mocks/catalog/*` |
| Store-local selector additions | existing `src/stores/*/selectors.ts` modules |

Exact file names remain flexible, but these ownership boundaries are locked.

---

## Runtime Composition Root Responsibilities

Phase 4 introduces a single runtime composition root. It is the only layer allowed to sit between adapter implementations and store writes.

### The runtime composition root must:

- resolve the runtime source mode before adapter startup
- instantiate the `RuntimePort`, `UnityPort`, and `CatalogPort` implementations for the selected source mode
- own bootstrap, subscription wiring, teardown, restart, and stale-subscription cleanup
- load the initial catalog snapshot and establish optional catalog subscriptions
- subscribe to runtime and Unity inbound events
- normalize inbound events into store-safe writes and shopper-safe degraded issues
- sequence outbound commands and local side effects for session start/end and shopper selection flows
- guard against stale session-scoped events after reset or runtime restart

### The runtime composition root must not:

- render UI
- contain shopper/admin screen markup or shell composition logic
- expose raw transport payloads to selectors or components
- bypass Phase 3 store ownership boundaries
- weaken or delay local privacy reset semantics

---

## Adapter Implementation Boundaries

Adapters implement ports. They do not own presentation, store writes, or shopper state transitions.

### `RuntimePort` implementations

- implement only the `RuntimePort` contract already defined in Phase 3
- integration-mode implementations may use local WebSocket, IPC, or equivalent local transport
- demo-mode implementations simulate the same `RuntimeInboundEvent` union deterministically
- normalize transport payloads into Phase 3 contract events before handing them to the orchestrator
- may send only the command subset already allowed by `RuntimePort`
- must not import stores, selectors, React components, or shell code

### `UnityPort` implementations

- implement only the `UnityPort` contract already defined in Phase 3
- integration-mode implementations may use a Unity bridge, `postMessage`, or equivalent local integration transport
- demo-mode implementations simulate Unity render lifecycle and selection acknowledgement through `UnityInboundEvent`
- normalize transport payloads into Phase 3 contract events before handing them to the orchestrator
- may send only the command subset already allowed by `UnityPort`
- must not infer shopper flow, catalog entities, or fit semantics beyond the typed command surface

### `CatalogPort` implementations

- implement only the `CatalogPort` contract already defined in Phase 3
- integration mode reads from a local catalog source such as JSON, SQLite, or equivalent local snapshot source
- demo mode returns deterministic local fixtures through the same contract surface
- optional `subscribe()` is allowed only for local source change streams; it is not required when load-once is sufficient
- must not own shopper selection, phase transitions, or degraded messaging decisions

### Universal adapter rules

- adapters emit normalized contract events only
- adapters never write stores directly
- adapters never import from `src/app/`, `src/components/`, or selector modules
- adapters do not invent backend capabilities outside the existing typed seams

---

## Runtime Bootstrap and Teardown API

Phase 4 must expose one bootstrap-facing API for the app runtime.

```ts
type RuntimeSourceMode = 'demo' | 'integration';

type AppRuntimeBootstrapConfig = {
  sourceMode: RuntimeSourceMode;
  allowManualSwitching?: boolean;
  manualSwitchAudience?: 'dev' | 'admin';
};

type AppRuntimeDependencies = {
  runtimePort: RuntimePort;
  unityPort: UnityPort;
  catalogPort: CatalogPort;
};

type AppRuntime = {
  start(): Promise<void>;
  stop(): Promise<void>;
  restart(nextConfig?: Partial<AppRuntimeBootstrapConfig>): Promise<void>;
  getSourceMode(): RuntimeSourceMode;
};

declare function createAppRuntime(
  config: AppRuntimeBootstrapConfig,
  deps: AppRuntimeDependencies,
): AppRuntime;
```

Rules:

- `sourceMode` is resolved before the shopper flow consumes runtime-derived read models.
- `allowManualSwitching` defaults to `false`.
- manual switching must never appear in shopper-facing runtime UI.
- `start()` is idempotent and safe to call once during app bootstrap.
- `stop()` tears down subscriptions, timers, and orchestrator-local state; it does not implicitly clear app-scoped data.
- `restart()` is implemented as `stop()` followed by `start()` with the next resolved config.
- runtime bootstrap never changes `uiMode`; shell mode remains a separate concern.

---

## Event Normalization and Mapping Rules

Normalization happens after a port emits a contract event and before any store write occurs.

### General normalization rules

- components never consume inbound event envelopes directly
- the orchestrator is the only layer allowed to translate inbound events into store writes
- normalization may derive shopper-safe summaries, operational statuses, degraded issues, and guidance IDs
- session-scoped events with a non-matching `sessionId` are ignored once a new session is active or reset completes
- app-scoped events such as catalog availability and non-session health updates may still apply after reset
- late events must never repopulate cleared shopper state from a prior session

### Runtime inbound event mapping

| Event | Normalized meaning | Store writes | Must not write |
|------|--------------------|-------------|----------------|
| `runtime.user.detected` | shopper is present and detectable in the active detection flow | update normalized operational runtime/camera status; clear blocking detection issue; set detection guidance if provided | no catalog entities, no fit, no `uiMode` |
| `runtime.user.lost` | shopper presence is lost during detection or active try-on | update normalized operational runtime/camera status; create or refresh session-scoped detection issue; set guidance if provided | no direct `session` reset, no catalog writes |
| `runtime.scan.completed` with `readyForCatalog: true` | detection is complete and the shopper can advance | call `session.markDetectionReady()` when the machine is in `detection`; clear detection-scoped degraded issues; update normalized runtime status | no catalog entity mutation |
| `runtime.scan.completed` with `readyForCatalog: false` | shopper is still in positioning or scan is incomplete | keep session in `detection`; create or refresh detection issue/guidance | no forced phase advance |
| `runtime.measurements.updated` | normalized measurement snapshot changed | write `measurements` snapshot and status; derive measurement degraded issues as needed | no session transition, no fit write |
| `runtime.fit.updated` | normalized fit recommendation changed | write `fit` recommendation and status; derive fit degraded issues as needed | no catalog entity write, no `uiMode` |
| `runtime.guidance.updated` | shopper-safe guidance messages changed | replace relevant shopper guidance in `degraded` for the active session scope | no session transition, no health overwrite |
| `runtime.health.updated` | normalized system health snapshot changed | write `systemHealth`; derive degraded issues/guidance for shopper-visible surfaces | no raw transport payload storage in presentation-facing state |

### Unity inbound event mapping

| Event | Normalized meaning | Store writes | Must not write |
|------|--------------------|-------------|----------------|
| `unity.render.stateUpdated` | current render lifecycle and active visual state changed | write normalized Unity operational status through existing operational state; derive unity degraded issues and guidance | no direct catalog selection write, no fit write |
| `unity.frame.updated` | render heartbeat changed without a catalog/state mutation | refresh normalized Unity operational status timestamp and derived degraded state | no shopper phase transition |

### Catalog inbound event mapping

| Event | Normalized meaning | Store writes | Must not write |
|------|--------------------|-------------|----------------|
| `catalog.snapshot.updated` | latest local catalog snapshot is available | write catalog entities and status; update normalized catalog operational status; clear catalog-unavailable issues | no session phase transition, no selection reset |
| `catalog.snapshot.unavailable` | catalog source is unavailable or unreadable | write `catalog.status = unavailable`; create catalog degraded issue; update operational catalog status | no forced session reset, no entity deletion from previous good snapshot unless implementation explicitly reloads a new empty snapshot |

### Catalog update safety rule

Catalog snapshot updates must not silently clear the shopper's current selection. If a refreshed catalog makes the selected garment or variant unusable, the orchestrator surfaces a degraded/catalog issue and leaves the session-scoped selection untouched until the shopper changes it or reset occurs.

---

## Exact Store-Write Boundaries Per Event Family

Runtime truth is split intentionally across ports, the orchestrator, existing stores, and selectors/read models.

| Layer | Owns |
|------|------|
| Ports | typed event and command surface only |
| Adapter implementations | transport parsing, local transport calls, fixture emission, port behavior |
| Runtime orchestrator | adapter startup, subscriptions, teardown, normalization, store writes, stale-event guards, command sequencing |
| Existing stores | durable normalized state only |
| Selectors/read models | shopper-safe derived state only |
| Presentation | rendering from read models only |

### Locked store-write ownership

| Store | Phase 4 may write | Phase 4 must not write from adapters/orchestrator |
|------|--------------------|-----------------------------------------------|
| `session` | detection-to-catalog advancement and session-end sequencing through existing actions only | new shopper phases, raw transport state, screen-local flags |
| `catalog` | entities, status, shopper selection and focus through existing actions | shopper phase, runtime health, Unity render state |
| `measurements` | normalized measurement snapshot and measurement status | raw detection state, fit, catalog data |
| `fit` | normalized recommendation and fit status | raw measurement ownership, shopper phase |
| `systemHealth` | normalized operational surface statuses and health summaries for `camera`, `runtime`, `unity`, and `catalog` | shopper-visible guidance queue, shopper-specific selection or fit data |
| `degraded` | shopper-visible issues, guidance, dismissals, and session-scoped degraded derivation | canonical catalog entities, shopper phase, raw transport payloads |
| `admin` | no Phase 4 shopper-flow event should write admin workflows | shopper flow state |
| `uiMode` | no runtime event may change shell mode | shopper phase, admin access rules |

---

## Degraded Issue Taxonomy and Derivation Rules

Phase 4 must derive a small canonical set of shopper-safe degraded issues. These are generated by the orchestrator from normalized contract events and operational status, not entered manually by presentation components.

| Issue family | Surface | Default status | Shopper visible | Blocking rule |
|-------------|---------|----------------|-----------------|---------------|
| `detection.userMissing` | `camera` or `runtime` | `degraded` | yes | blocks only while shopper is in `detection` |
| `detection.positioning` | `camera` or `runtime` | `attention` | yes | non-blocking guidance unless scan cannot complete |
| `runtime.disconnected` | `runtime` | `degraded` | yes | blocks active shopper phases except `idle` and completed reset |
| `catalog.unavailable` | `catalog` | `degraded` | yes | blocks catalog browsing and try-on entry when no valid snapshot is available |
| `unity.delayed` | `unity` | `attention` | yes | non-blocking; shopper may continue while render catches up |
| `unity.unavailable` | `unity` | `degraded` | yes | blocks confidence in live try-on rendering |
| `measurements.partial` | `runtime` | `attention` | yes | non-blocking; measurements may still be shown partially |
| `measurements.unavailable` | `runtime` | `degraded` | yes | blocks measurement-dependent fit details |
| `fit.partial` | `runtime` | `attention` | yes | non-blocking; plain-language fit messaging may still be partial |
| `fit.unavailable` | `runtime` | `attention` or `degraded` | yes | blocks fit-detail confidence when no usable recommendation exists |

### Degraded derivation rules

- `systemHealth` owns normalized operational surface truth.
- `degraded` owns shopper-visible issue derivation and guidance only.
- blocking is a derived read-model property, not a stored field.
- shopper-visible degraded copy must stay plain-language and action-oriented.
- raw confidence numbers, transport errors, stack traces, and ML jargon are not allowed in shopper-facing degraded summaries.
- session-scoped degraded issues clear during `resetSession()`.
- app-scoped degraded issues may persist when marked non-session-scoped, such as catalog source degradation.

---

## Shopper-Safe Read Models

Phase 4 must expose runtime-derived read models without exposing raw event envelopes or transport payloads.

```ts
type DetectionReadinessReadModel = {
  state: 'inactive' | 'waitingForUser' | 'positioning' | 'readyToAdvance';
  blocking: boolean;
  primaryGuidance: GuidanceMessage | null;
};

type CatalogReadinessReadModel = {
  state: 'idle' | 'loading' | 'partial' | 'ready' | 'unavailable';
  blocking: boolean;
};

type UnityRenderReadinessReadModel = {
  state: 'idle' | 'rendering' | 'delayed' | 'ready' | 'unavailable';
  blocking: boolean;
  summary: string | null;
};

type MeasurementReadinessReadModel = {
  state: 'idle' | 'collecting' | 'partial' | 'ready' | 'unavailable';
  blocking: boolean;
};

type FitReadinessReadModel = {
  state: 'idle' | 'pending' | 'partial' | 'ready' | 'unavailable';
  blocking: boolean;
};

type DegradedReadModel = {
  severity: 'clear' | 'attention' | 'degraded';
  blocking: boolean;
  visibleIssues: DegradedIssue[];
  primaryGuidance: GuidanceMessage | null;
};
```

### Locked derivation rules

- `DetectionReadinessReadModel` is derived from the current `session` phase plus detection-scoped degraded issues and normalized operational runtime/camera status.
- `CatalogReadinessReadModel` is derived from `catalog.status` plus catalog degraded blocking state.
- `UnityRenderReadinessReadModel` is derived from normalized operational Unity status plus Unity degraded issues; it must not expose raw Unity payloads.
- `MeasurementReadinessReadModel` is derived from `measurements.status` plus measurement degraded issues.
- `FitReadinessReadModel` is derived from `fit.status` plus fit degraded issues.
- `DegradedReadModel` is derived from shopper-visible issues and guidance; blocking is true when the current shopper task cannot proceed safely or honestly.
- these read models may compose existing store selectors, but presentation must consume the read models rather than re-deriving transport behavior inline.

---

## Outbound Command Sequencing and Reset

Phase 4 must lock command sequencing so local privacy reset stays authoritative.

### Session start sequencing

1. A shopper start intent enters the app through existing session actions.
2. The orchestrator calls `session.startSession(input)` immediately so the app owns a frontend-created `sessionId`.
3. The orchestrator sends `shopper.session.start` through `RuntimePort` using the active session ID.
4. Catalog availability is not re-owned by session start; catalog bootstrap remains app-scoped.
5. If the runtime start command fails, the shopper remains in local detection flow and the orchestrator surfaces degraded/runtime guidance rather than rolling the session back automatically.

### Garment and variant command sequencing

1. Shopper selection writes through the existing `catalog` store actions first.
2. The orchestrator sends `shopper.catalog.selectGarment`, `shopper.catalog.selectSize`, or `shopper.catalog.selectColor` through `UnityPort`.
3. Failed Unity command delivery surfaces degraded/unity state; it does not silently revert shopper selection.
4. Navigation intents such as open catalog or fit details remain app-local orchestration intents unless a later phase proves transport involvement is necessary.

### Session end and reset sequencing

1. Session end intent calls `session.endSession()` first so the machine enters `sessionEnd`.
2. The orchestrator sends `shopper.session.end` to `RuntimePort` and `UnityPort` as a best-effort side effect using the active session ID.
3. Local `resetSession()` runs without waiting for transport acknowledgements.
4. After reset completes, late session-scoped events for the prior session are ignored.
5. App-scoped catalog or health updates may still apply after reset.
6. No transport failure is allowed to prevent shopper-derived data from being wiped locally.

### Manual runtime restart sequencing

- runtime restart is a dev/admin-only control path
- restart tears down subscriptions before new ones are installed
- restart must not create duplicate subscribers or stale event writes
- restart does not weaken shopper reset guarantees

---

## Demo Fixture and Simulator Requirements

Demo mode must be capable of exercising the full shopper path before live backend maturity exists.

### Required catalog fixtures

- a small local catalog of roughly 10-15 upper-body garments
- at least 2 categories
- mixed size and color availability
- at least one unavailable or hidden garment state for degraded and filtering checks

### Required measurement fixtures

- one ready snapshot containing all five canonical upper-body measurement keys
- one partial snapshot with at least one `null` measurement value
- one unavailable path

### Required fit fixtures

- one ready recommendation with qualitative fit and confidence bands
- one partial recommendation
- one unavailable recommendation path

### Required operational fixtures

- healthy, warning, degraded, and offline health signals across `camera`, `runtime`, `unity`, and `catalog`
- Unity render progression across `idle`, `rendering`, `delayed`, `ready`, and `unavailable`

### Required simulator scenarios

1. happy path from `idle` through `sessionEnd`
2. shopper detected, then lost, then recovered in detection
3. catalog unavailable at bootstrap, then recovered
4. Unity delayed during live try-on, then recovered
5. measurements partial, followed by fit partial
6. session reset followed by stale late events that must be ignored

### Simulator safety rules

- simulator controls are dev-only or admin-only
- simulator behavior must use the same port contracts as integration mode
- no shopper-facing debug panel is allowed in the kiosk experience

---

## Planner-Locked Boundaries

### Runtime and orchestrator boundaries

- one app runtime orchestrator owns startup, subscriptions, teardown, normalization, and store writes
- adapters implement ports only
- selectors and read models remain the only shopper-safe presentation surface
- mode selection is bootstrap/config driven; manual switching is not shopper-facing

### Event-mapping boundaries

- runtime events may write `session`, `measurements`, `fit`, `systemHealth`, and `degraded` only through normalized mappings
- Unity events may write normalized operational state and degraded derivation only
- catalog events may write catalog entities/status plus operational and degraded catalog state only
- adapters never write stores directly

### Degraded and read-model boundaries

- degraded remains derived operational state, not a shopper phase or app mode
- blocking is derived from issue taxonomy and current shopper task
- detection readiness is a derived read model, not a new phase
- Unity render readiness is exposed through selectors/read models, not raw transport data

### Command and reset boundaries

- local session start owns the initial session ID
- local session end and `resetSession()` are authoritative for privacy wipe
- outbound end-session commands are best-effort side effects, not prerequisites for local reset
- late stale events never repopulate cleared shopper state

---

## Remaining Ambiguities Before Planning

Not blocking, but the planner must resolve these explicitly:

1. Whether the normalized operational status written through `systemHealth` is implemented as enriched health snapshots only or through a small helper shape beside the existing signal list, while staying inside the same store ownership boundary.
2. The exact transient behavior of `readyToAdvance` in detection: whether it is visible only momentarily before catalog entry or persisted until the phase transition completes.
3. Whether catalog subscription is required in v1 integration mode or whether load-once plus explicit refresh is sufficient for the local kiosk prototype.

---

## Planning Readiness

This spec is sufficient for Phase 4 planning if the planner treats it as a locked contract artifact alongside:

- `AGENTS.md`
- `docs/UI_SPEC.md`
- `.planning/phases/03-state-model-and-typed-contracts/03-CONTEXT.md`
- `.planning/phases/03-state-model-and-typed-contracts/03-CONTRACT-SPEC.md`
- `.planning/phases/02-app-shell-and-design-system/02-UI-SPEC.md`

Implementation must not exceed these boundaries until Phase 5 shopper screens begin.
