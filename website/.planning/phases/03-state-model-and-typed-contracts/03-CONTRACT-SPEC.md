---
phase: 03
slug: state-model-and-typed-contracts
status: approved
artifact: contract-spec
created: 2026-03-24
reviewed_at: 2026-03-24
---

# Phase 03 - State Contract Specification

> Implementation contract for Phase 3. This file locks the typed state, event, command, selector, reset, and port surfaces that planning and implementation must follow. It is intentionally code-adjacent, but it is not adapter implementation.

---

## Contract Intent

- Preserve the completed Phase 2 shell and primitive system as presentation-only.
- Add explicit typed orchestration for the shopper kiosk flow.
- Keep Unity, backend/runtime, and catalog seams isolated behind ports.
- Centralize deterministic privacy reset for all shopper-scoped state.
- Stay honest to a local-first, upper-body prototype with a small local catalog and partial-data tolerance.

---

## Locked Inputs

| Area | Locked decision |
|------|-----------------|
| Shopper primary states | `idle`, `detection`, `catalog`, `tryOn`, `fitDetails`, `sessionEnd` |
| State containers | `session`, `catalog`, `measurements`, `fit`, `systemHealth`, `admin`, `degraded`, `uiMode` |
| UI mode | `uiMode` is separate from shopper session state |
| Degraded behavior | Partial and degraded conditions are orthogonal state, not primary shopper states |
| Reset | Session reset is centralized and deterministic |
| External seams | Unity, backend/runtime, and catalog are separate type-first ports |
| Selector placement | Selectors are colocated with each store |
| Status model strategy | Use lightly specialized status models per domain, not one abstract global base |
| Presentation boundary | `AppShell`, `ShopperShell`, and `AdminShell` stay presentation-only |

---

## Recommended File Surface

This phase should plan against the following documentation-to-code mapping:

| Area | Target path |
|------|-------------|
| Shared utility types | `src/types/shared.ts` |
| Domain entities | `src/types/domain/*.ts` or `src/types/*.ts` |
| Session and shopper flow | `src/stores/session/*` |
| Catalog state | `src/stores/catalog/*` |
| Measurement state | `src/stores/measurements/*` |
| Fit state | `src/stores/fit/*` |
| System health state | `src/stores/systemHealth/*` |
| Admin state | `src/stores/admin/*` |
| Degraded state | `src/stores/degraded/*` |
| UI mode state | `src/stores/uiMode/*` |
| Reset coordination | `src/lib/sessionReset/*` |
| Port contracts | `src/adapters/contracts/*` |

Exact file names remain flexible, but these ownership boundaries are locked.

---

## Shared Utility Types

The contract should use a small shared vocabulary rather than raw strings spread across stores.

```ts
type IsoTimestamp = string;
type SessionId = string;
type GarmentId = string;
type GarmentVariantId = string;
type CategoryId = string;
type ColorId = string;
type SizeCode = string;
type MeasurementId = string;
type LogEntryId = string;
type CalibrationProfileId = string;

type UiMode = 'shopper' | 'admin';
type ShopperPhase =
  | 'idle'
  | 'detection'
  | 'catalog'
  | 'tryOn'
  | 'fitDetails'
  | 'sessionEnd';

type DataSource = 'unity' | 'runtime' | 'catalog' | 'app';
type AvailabilityState = 'available' | 'unavailable';
type ShopperInputMethod = 'keyboard' | 'mouse' | 'gesture' | 'voice';
type MeasurementUnit = 'cm';
```

Rules:

- `IsoTimestamp` stays string-based at the contract layer; parsing is an implementation detail.
- `sessionId` is optional on inbound envelopes because some app- or catalog-level updates are not session-scoped.
- Session identity must support both frontend-created and runtime-provided values, with frontend-created IDs as the default initial path.
- IDs remain opaque strings; do not encode business meaning into them.

---

## Canonical Domain Entities

### Catalog and garment entities

```ts
type CatalogLoadStatus = 'idle' | 'loading' | 'ready' | 'partial' | 'unavailable';
type CatalogItemStatus = 'active' | 'hidden' | 'unavailable';
type GarmentSilhouette = 'upper-body';

type GarmentCategory = {
  id: CategoryId;
  label: string;
  sortOrder: number;
};

type GarmentColorOption = {
  id: ColorId;
  label: string;
  swatchHex?: string;
  variantId: GarmentVariantId;
  availability: AvailabilityState;
};

type GarmentSizeOption = {
  code: SizeCode;
  label: string;
  availability: AvailabilityState;
};

type Garment = {
  id: GarmentId;
  sku: string;
  name: string;
  categoryId: CategoryId;
  silhouette: GarmentSilhouette;
  status: CatalogItemStatus;
  description?: string;
  heroImageUrl?: string;
  availableSizes: GarmentSizeOption[];
  availableColors: GarmentColorOption[];
  defaultVariantId?: GarmentVariantId;
};
```

Locked boundary:

- The catalog model is local-product oriented, not commerce oriented.
- No pricing, reviews, inventory counts, checkout metadata, or shopper history fields are allowed.
- `silhouette` is locked to `upper-body` in v1.

### Selection entities

```ts
type GarmentSelection = {
  garmentId: GarmentId;
  variantId?: GarmentVariantId;
  sizeCode?: SizeCode;
  colorId?: ColorId;
  selectedAt: IsoTimestamp;
};

type CatalogFocus = {
  categoryId?: CategoryId;
  highlightedGarmentId?: GarmentId;
};
```

Locked boundary:

- Selection is shopper-session data and must reset.
- Catalog definitions persist; shopper selection does not.

### Measurement entities

```ts
type MeasurementStatus = 'idle' | 'collecting' | 'partial' | 'ready' | 'unavailable';
type MeasurementKey =
  | 'chest'
  | 'waist'
  | 'shoulderWidth'
  | 'sleeveLength'
  | 'torsoLength';

type MeasurementSample = {
  id: MeasurementId;
  key: MeasurementKey;
  label: string;
  valueCm: number | null;
  unit: MeasurementUnit;
  source: 'runtime';
  capturedAt: IsoTimestamp;
};

type MeasurementSnapshot = {
  status: MeasurementStatus;
  samples: MeasurementSample[];
  lastUpdatedAt?: IsoTimestamp;
};
```

Locked boundary:

- Measurements are upper-body only in v1.
- All canonical upper-body measurement keys exist in v1 types, even when individual values are still `null`.
- The shopper UI consumes plain-language labels and values, not raw model diagnostics.

### Fit entities

```ts
type FitStatus = 'idle' | 'pending' | 'partial' | 'ready' | 'unavailable';
type FitBand = 'bestFit' | 'slightlyTight' | 'slightlyLoose' | 'notRecommended';
type FitConfidenceBand = 'low' | 'medium' | 'high';

type FitRecommendation = {
  garmentId: GarmentId;
  evaluatedSize?: SizeCode;
  recommendedSize?: SizeCode;
  fitBand?: FitBand;
  confidenceBand?: FitConfidenceBand;
  confidenceScore?: number;
  summary: string;
  reasons: string[];
  alternativeSize?: SizeCode;
  alternativeGarmentId?: GarmentId;
  updatedAt: IsoTimestamp;
};
```

Locked boundary:

- The contract exposes qualitative fit output for UI use.
- The fit domain may retain an internal numeric confidence score for mapping and diagnostics.
- The shopper UI must not depend on raw numeric confidence values.

### Health and degraded entities

```ts
type HealthStatus = 'healthy' | 'warning' | 'degraded' | 'offline';
type SystemSurface = 'camera' | 'runtime' | 'unity' | 'catalog';

type HealthSignal = {
  surface: SystemSurface;
  status: HealthStatus;
  summary: string;
  updatedAt: IsoTimestamp;
};

type GuidanceTone = 'neutral' | 'assistive' | 'warning';
type GuidanceScope = 'detection' | 'tryOn' | 'fit' | 'system';

type GuidanceMessage = {
  id: string;
  scope: GuidanceScope;
  tone: GuidanceTone;
  title: string;
  body: string;
  actionLabel?: string;
  actionIntent?: 'retry' | 'reposition' | 'continue' | 'dismiss';
  createdAt: IsoTimestamp;
};

type DegradedStatus = 'clear' | 'attention' | 'degraded';

type DegradedIssue = {
  id: string;
  surface: SystemSurface;
  status: DegradedStatus;
  shopperVisible: boolean;
  summary: string;
  guidanceId?: string;
  detectedAt: IsoTimestamp;
};
```

Locked boundary:

- Degraded state is a side-channel on top of the primary shopper flow.
- Guidance copy stays shopper-safe and free of pipeline jargon.

### Admin operational entities

```ts
type AdminSection = 'dashboard' | 'catalog' | 'calibration' | 'logs';
type AdminAccessState = 'hidden' | 'requested' | 'granted';
type CalibrationStatus = 'idle' | 'required' | 'inProgress' | 'ready' | 'failed';

type CalibrationState = {
  status: CalibrationStatus;
  activeProfileId?: CalibrationProfileId;
  lastCompletedAt?: IsoTimestamp;
};

type OperationalLogEntry = {
  id: LogEntryId;
  level: 'info' | 'warning' | 'error';
  source: SystemSurface | 'admin';
  message: string;
  timestamp: IsoTimestamp;
};

type AdminOperationalState = {
  access: AdminAccessState;
  activeSection: AdminSection;
  calibration: CalibrationState;
  selectedLogEntryId?: LogEntryId;
};
```

Locked boundary:

- This contract covers operational state shape only.
- Admin authentication mechanics remain out of scope for Phase 3.

---

## Shopper State Machine

### Canonical shopper machine

```ts
type ShopperStateNode =
  | { phase: 'idle' }
  | { phase: 'detection'; sessionId: SessionId }
  | { phase: 'catalog'; sessionId: SessionId }
  | { phase: 'tryOn'; sessionId: SessionId }
  | { phase: 'fitDetails'; sessionId: SessionId }
  | { phase: 'sessionEnd'; sessionId: SessionId; resetPending: boolean };
```

### Allowed transitions

| From | To | Trigger | Notes |
|------|----|---------|-------|
| `idle` | `detection` | `startSession` | Creates new shopper session |
| `detection` | `catalog` | `markDetectionReady` | Readiness is explicit |
| `catalog` | `tryOn` | `confirmSelection` | Requires selected garment |
| `tryOn` | `catalog` | `returnToCatalog` | Keeps current selection unless changed later |
| `tryOn` | `fitDetails` | `openFitDetails` | No route change model |
| `fitDetails` | `tryOn` | `returnToTryOn` | Preserves current fit snapshot |
| `detection` | `sessionEnd` | `endSession` | Shopper can exit early |
| `catalog` | `sessionEnd` | `endSession` | Shopper can exit early |
| `tryOn` | `sessionEnd` | `endSession` | Shopper can exit early |
| `fitDetails` | `sessionEnd` | `endSession` | Shopper can exit early |
| `sessionEnd` | `idle` | `completeReset` | Only after centralized reset finishes |

Locked rules:

- No route-driven state changes.
- No implicit jump from `idle` straight to `catalog` or `tryOn`.
- `sessionEnd` is a real machine state, not a side effect hidden inside `endSession`.

### Transition API

```ts
type SessionTransitionApi = {
  startSession(input: ShopperInputMethod): void;
  markDetectionReady(): void;
  confirmSelection(): void;
  returnToCatalog(): void;
  openFitDetails(): void;
  returnToTryOn(): void;
  endSession(): void;
  completeReset(): void;
};
```

API rules:

- Transition functions are app/store actions, not adapter implementations.
- Preconditions are validated in the session layer.
- Ports may be notified by orchestration code, but the session store remains the source of truth for shopper phase.

---

## Store Boundaries and Responsibilities

| Store | Owns | Must not own | Reset behavior |
|------|------|--------------|----------------|
| `session` | shopper phase, `sessionId`, transition API, reset lifecycle flags | garment data, measurements, health snapshots | clears |
| `catalog` | catalog status, category list, garment entities, current selection, catalog focus | shopper phase, fit explanations, system health | entities persist, selection and focus clear |
| `measurements` | measurement status, current snapshot, last update timestamp | catalog data, fit recommendation, health | clears |
| `fit` | fit status, current recommendation, fit explanation copy | raw measurements ownership, shopper phase | clears |
| `systemHealth` | system-level health signals and timestamps | shopper-visible degraded messaging queue | persists |
| `admin` | admin operational view state, calibration state, log selection | shopper flow, shopper session lifecycle | persists |
| `degraded` | active degraded issues, shopper-safe guidance queue, dismissals | canonical health snapshot ownership | clears shopper-session issues; app-level issues may persist if marked non-session |
| `uiMode` | active mode (`shopper` or `admin`) and shell-level toggling | shopper phase, admin access implementation | persists |

Locked ownership rules:

- Each store exposes its own selectors beside its own state.
- Presentation components consume selectors/read models, not whole stores.
- No store should directly parse adapter payloads in JSX-facing code.

---

## Selector and Read-Model Boundaries

Selectors are colocated with each store and are the only UI-safe read surface for presentation consumers.

### Session selectors

```ts
type SessionSelectors = {
  selectShopperPhase(): ShopperPhase;
  selectSessionId(): SessionId | null;
  selectCanStartSession(): boolean;
  selectCanEndSession(): boolean;
  selectResetPending(): boolean;
};
```

### Catalog selectors

```ts
type CatalogSelectors = {
  selectCatalogStatus(): CatalogLoadStatus;
  selectVisibleCategories(): GarmentCategory[];
  selectVisibleGarments(): Garment[];
  selectActiveSelection(): GarmentSelection | null;
  selectSelectionReadyForTryOn(): boolean;
};
```

### Measurement selectors

```ts
type MeasurementSelectors = {
  selectMeasurementStatus(): MeasurementStatus;
  selectMeasurementSnapshot(): MeasurementSnapshot | null;
  selectDisplayMeasurements(): MeasurementSample[];
};
```

### Fit selectors

```ts
type FitSelectors = {
  selectFitStatus(): FitStatus;
  selectCurrentRecommendation(): FitRecommendation | null;
  selectFitSummary(): string | null;
  selectAlternativeSize(): SizeCode | null;
};
```

### System health and degraded selectors

```ts
type SystemHealthSelectors = {
  selectHealthSignals(): HealthSignal[];
  selectWorstSystemStatus(): HealthStatus | null;
};

type DegradedSelectors = {
  selectActiveGuidance(): GuidanceMessage[];
  selectShopperVisibleIssues(): DegradedIssue[];
  selectHasBlockingDegradedIssue(): boolean;
};
```

### Admin and UI mode selectors

```ts
type AdminSelectors = {
  selectAdminState(): AdminOperationalState;
  selectCalibrationState(): CalibrationState;
  selectVisibleLogs(): OperationalLogEntry[];
};

type UiModeSelectors = {
  selectUiMode(): UiMode;
  selectIsShopperMode(): boolean;
  selectIsAdminMode(): boolean;
};
```

Selector rules:

- Selectors may compose within the same domain and through explicit read-model helpers in `src/lib/`, but not through ad hoc component joins.
- Screen and shell components must not read raw inbound event envelopes.
- Selectors return UI-safe data only: resolved labels, fit summaries, visible lists, and booleans for affordances.

---

## Session Reset Contract

### Reset coordinator

The reset coordinator is a shared orchestration utility under `src/lib/sessionReset/`. It is the only authority that can complete a shopper session wipe.

### Reset initiator

- `session.endSession()` transitions the machine into `sessionEnd`.
- The reset coordinator then executes deterministic clearing.
- `session.completeReset()` is called only after the coordinator finishes.

### Reset order

1. Lock the machine in `sessionEnd` and mark `resetPending = true`.
2. Clear session-scoped degraded issues and guidance.
3. Clear fit state.
4. Clear measurement state.
5. Clear catalog selection and focus.
6. Clear session identity and return the machine to `idle`.
7. Mark `resetPending = false`.

### What clears

| Area | Clears on session reset |
|------|-------------------------|
| Session | `sessionId`, shopper phase context, transition-local flags |
| Catalog | `GarmentSelection`, shopper focus, any session-scoped preview context |
| Measurements | full current snapshot and measurement status back to idle |
| Fit | full recommendation and fit explanation state |
| Degraded | shopper-session issues, dismissals, shopper guidance queue |

### What persists

| Area | Persists across shopper session reset |
|------|---------------------------------------|
| Catalog definitions | garment entities, category entities, catalog availability snapshot |
| System health | latest local health snapshot |
| Admin | admin operational view state |
| UI mode | current app mode |

### Reset semantics

- Reset is deterministic: the same inputs produce the same cleared state.
- Reset is centralized: stores may expose `reset()` methods, but only the coordinator orders them.
- Reset is privacy-first: any shopper-derived measurement, fit, and selection data is treated as disposable.
- Full app reset is explicitly out of scope for Phase 3; this contract defines shopper session reset only.

---

## Inbound Event Contracts

All inbound updates use a shared envelope.

```ts
type InboundEventEnvelope<
  TType extends string,
  TSource extends DataSource,
  TPayload,
> = {
  type: TType;
  source: TSource;
  timestamp: IsoTimestamp;
  sessionId?: SessionId;
  payload: TPayload;
};
```

### Runtime inbound events

```ts
type RuntimeInboundEvent =
  | InboundEventEnvelope<
      'runtime.user.detected',
      'runtime',
      { detectionState: 'detected'; guidance?: GuidanceMessage[] }
    >
  | InboundEventEnvelope<
      'runtime.user.lost',
      'runtime',
      { detectionState: 'lost'; guidance?: GuidanceMessage[] }
    >
  | InboundEventEnvelope<
      'runtime.scan.completed',
      'runtime',
      { readyForCatalog: boolean }
    >
  | InboundEventEnvelope<
      'runtime.measurements.updated',
      'runtime',
      { snapshot: MeasurementSnapshot }
    >
  | InboundEventEnvelope<
      'runtime.fit.updated',
      'runtime',
      { recommendation: FitRecommendation }
    >
  | InboundEventEnvelope<
      'runtime.guidance.updated',
      'runtime',
      { messages: GuidanceMessage[] }
    >
  | InboundEventEnvelope<
      'runtime.health.updated',
      'runtime',
      { signals: HealthSignal[] }
    >;
```

### Unity inbound events

```ts
type UnityRenderState = 'idle' | 'rendering' | 'delayed' | 'ready' | 'unavailable';

type UnityInboundEvent =
  | InboundEventEnvelope<
      'unity.render.stateUpdated',
      'unity',
      { renderState: UnityRenderState; activeGarmentId?: GarmentId; activeSizeCode?: SizeCode }
    >
  | InboundEventEnvelope<
      'unity.frame.updated',
      'unity',
      { renderState: UnityRenderState }
    >;
```

### Catalog inbound events

```ts
type CatalogInboundEvent =
  | InboundEventEnvelope<
      'catalog.snapshot.updated',
      'catalog',
      { status: CatalogLoadStatus; categories: GarmentCategory[]; garments: Garment[] }
    >
  | InboundEventEnvelope<
      'catalog.snapshot.unavailable',
      'catalog',
      { status: 'unavailable' }
    >;
```

Locked event rules:

- Each source has its own union.
- Event names stay source-qualified.
- Payloads carry already-normalized front-end contract types, not raw transport payloads.
- No event contract may assume cloud-only or full-body capabilities.

---

## Outbound Command Contracts

Outbound commands are typed intents emitted by orchestration code. Ports consume only the subsets relevant to them.

```ts
type BaseCommand<TType extends string, TPayload> = {
  type: TType;
  sessionId?: SessionId;
  payload: TPayload;
};
```

### Shopper commands

```ts
type ShopperCommand =
  | BaseCommand<'shopper.session.start', { input: ShopperInputMethod }>
  | BaseCommand<'shopper.session.end', { reason: 'userRequested' | 'timeout' | 'systemReset' }>
  | BaseCommand<'shopper.catalog.selectGarment', { garmentId: GarmentId }>
  | BaseCommand<'shopper.catalog.selectSize', { sizeCode: SizeCode }>
  | BaseCommand<'shopper.catalog.selectColor', { colorId: ColorId; variantId?: GarmentVariantId }>
  | BaseCommand<'shopper.navigation.openCatalog', {}>
  | BaseCommand<'shopper.navigation.openFitDetails', {}>
  | BaseCommand<'shopper.navigation.returnToTryOn', {}>;
```

### Admin commands

```ts
type AdminCommand =
  | BaseCommand<'admin.calibration.start', { profileId?: CalibrationProfileId }>
  | BaseCommand<'admin.calibration.cancel', {}>
  | BaseCommand<'admin.health.refresh', {}>
  | BaseCommand<'admin.logs.refresh', {}>
  | BaseCommand<'admin.catalog.refresh', {}>;
```

Locked command rules:

- Commands express intent only; they do not define transport.
- Shopper navigation commands may remain app-local today, but the contract preserves them as explicit intents.
- Admin commands cover operational control only, not authentication workflows.

---

## Port Interfaces

Ports are the only integration-facing surfaces Phase 3 should define.

### Runtime port

```ts
interface RuntimePort {
  subscribe(listener: (event: RuntimeInboundEvent) => void): () => void;
  send(command: Extract<ShopperCommand | AdminCommand,
    | { type: 'shopper.session.start' }
    | { type: 'shopper.session.end' }
    | { type: 'admin.calibration.start' }
    | { type: 'admin.calibration.cancel' }
    | { type: 'admin.health.refresh' }
    | { type: 'admin.logs.refresh' }
  >): Promise<void>;
}
```

### Unity port

```ts
interface UnityPort {
  subscribe(listener: (event: UnityInboundEvent) => void): () => void;
  send(command: Extract<ShopperCommand,
    | { type: 'shopper.catalog.selectGarment' }
    | { type: 'shopper.catalog.selectSize' }
    | { type: 'shopper.catalog.selectColor' }
    | { type: 'shopper.session.end' }
  >): Promise<void>;
}
```

### Catalog port

```ts
interface CatalogPort {
  loadSnapshot(): Promise<Extract<CatalogInboundEvent, { type: 'catalog.snapshot.updated' }>>;
  subscribe?(listener: (event: CatalogInboundEvent) => void): () => void;
}
```

Port rules:

- No React component should call transport APIs directly.
- Ports return normalized contract types only.
- `CatalogPort` defines both the required snapshot load surface and the optional subscription surface in Phase 3.
- Phase 3 defines interfaces and ownership only; Phase 4 supplies implementations.

---

## Planner-Locked Boundaries

### Store and type boundaries

- `session` owns the shopper machine and reset lifecycle only.
- `catalog` owns entities plus shopper selection, but not session phase.
- `measurements` owns upper-body measurement snapshots only.
- `fit` owns recommendation output and explanation-ready copy only.
- `systemHealth` owns operational health signals only.
- `degraded` owns shopper-visible degraded issues and guidance only.
- `admin` owns operational admin state only.
- `uiMode` owns shell mode only.

### Event, command, and port boundaries

- Inbound events always use the shared envelope.
- Runtime, Unity, and catalog each have separate event unions.
- Commands are typed intents, not transport payloads.
- Ports are the only integration boundary and accept only relevant command subsets.

### Reset semantics

- Only the shared reset coordinator completes a shopper session wipe.
- Shopper session reset clears session, selection, measurement, fit, and shopper-scoped degraded data.
- Catalog definitions, system health, admin operational state, and `uiMode` persist across shopper reset.

---

## Remaining Ambiguities Before Planning

None blocking.

Frozen for implementation planning:

1. Session ID creation and runtime-adoption helpers live under `src/lib/session/sessionId.ts`.
2. Catalog normalization stays outside the Phase 3 port contract surface; Phase 3 ports expose normalized types and Phase 4 adapters may add transport-specific mapping helpers.

---

## Planning Readiness

This spec is sufficient for Phase 3 planning if the planner treats it as a locked contract artifact alongside:

- `AGENTS.md`
- `docs/UI_SPEC.md`
- `.planning/phases/03-state-model-and-typed-contracts/03-CONTEXT.md`
- `.planning/phases/02-app-shell-and-design-system/02-UI-SPEC.md`

Implementation must not exceed these boundaries until Phase 4 and Phase 5.
