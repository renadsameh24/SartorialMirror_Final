# AGENTS.md

## Project
The Sartorial Mirror front-end.

This repository contains the front-end application for a privacy-first smart mirror / screen-based virtual try-on system. The app is a state-driven retail experience, not a generic web dashboard and not a traditional e-commerce site.

The front-end is responsible for:
- shopper session flow
- garment browsing and selection
- fit/measurement presentation
- privacy messaging
- degraded-state handling
- admin/staff operational UI

The front-end is **not** responsible for:
- garment rendering physics
- pose estimation logic
- body reconstruction logic
- backend business logic
- persistent shopper profiles
- cloud-first workflows

Unity is the rendering surface for the try-on visualization.
React owns the UI shell and state orchestration around it.

---

## Primary Goal
Build a premium, production-minded front-end that feels elegant, calm, fast, and privacy-safe, while remaining honest to the current backend maturity and prototype scope.

Prioritize:
1. clarity
2. buildability
3. state correctness
4. graceful degradation
5. future extensibility

---

## Codex + GSD Workflow
Before planning or implementing work in this repository:

- Read and follow this `AGENTS.md` as the primary repo instruction file.
- Also consult the project-scoped Codex configuration in `.codex/config.toml`.
- Use any relevant GSD-installed skills, agent roles, and prompt workflows available under `.codex/`.
- Prefer the repo-local GSD setup over any global defaults when working in this project.
- When a task benefits from the GSD workflow, use the appropriate `/prompts:gsd-*` flow for discussion, planning, execution, and verification.
- Do not ignore repo instructions in favor of generic agent behavior.
- Treat `docs/UI_SPEC.md` as the product and UX source of truth for front-end work.

---

## Source of Truth
Follow these rules in order:

1. `docs/UI_SPEC.md` is the main product and UX specification.
2. This `AGENTS.md` defines repo-wide implementation rules.
3. Existing code patterns should be respected unless they conflict with the spec.
4. Do not invent product behavior that contradicts the smart-mirror session model.

If something is unclear, choose the option that is:
- simpler
- more local-first
- more privacy-preserving
- easier to test
- less dependent on backend perfection

---

## Product Model
This app is a **session-based state machine**.

The core shopper states are:
1. Idle / Welcome
2. Detection / Positioning
3. Catalog / Garment Selection
4. Live Try-On
5. Fit Details
6. Session End / Privacy Reset

There is also a separate admin/staff mode.

Do **not** model the shopper experience like a normal route-heavy SaaS application.

Routes may exist for technical separation, but the shopper experience itself must behave like a controlled kiosk flow.

---

## Design Intent
The UI should feel:
- premium
- restrained
- modern
- fashion-forward
- trustworthy
- calm under failure

Avoid:
- dashboard clutter
- startup-style analytics aesthetics
- loud gradients
- gimmicky animations
- gaming UI tropes
- overexplaining the underlying AI/ML pipeline

The user should experience outcomes, not technical internals.

---

## Privacy Rules
Privacy is a product feature.

Always reinforce:
- local-first processing
- session-based use
- explicit session end
- session data wipe/reset

Never add:
- shopper accounts
- persistent personal history
- cloud save flows
- email capture
- social sharing
- unnecessary storage of personal body data

Session reset must be deterministic and obvious in code.

---

## Interaction Rules
Version 1 must work fully with:
- keyboard
- mouse

Gesture and voice may be supported later, but must never be the only usable interaction path.

All key actions must be operable without gesture input.

---

## Scope Rules
Current product reality is closer to:
- screen-based prototype
- upper-body-first experience
- small local garment catalog
- local processing pipeline
- real-time or near-real-time system feedback

Do not overengineer for:
- full-body perfection
- large-scale commerce features
- multi-user cloud infrastructure
- speculative future hardware behavior

Build for the current product, while leaving clean extension points for later.

---

## Tech Stack
Default stack unless explicitly changed by repo code:
- React
- TypeScript
- Vite
- Zustand
- Tailwind CSS
- Framer Motion

Prefer:
- strict typing
- small composable components
- isolated adapters
- clear state boundaries
- reusable design tokens

Avoid:
- large monolithic components
- weak typing
- ad hoc global state
- unstructured CSS
- hidden coupling between UI and backend messages

---

## Architecture Rules
Use a layered structure:

### 1. Presentation Layer
Reusable visual components and screens.

### 2. State Layer
Zustand stores or equivalent typed state containers for:
- session state
- garment/catalog state
- measurement state
- fit recommendation state
- system health state
- admin state
- degraded state
- UI mode state

### 3. Integration Layer
Typed adapters for:
- WebSocket events
- local/mock data
- Unity bridge/container
- admin/system APIs if present

### 4. Utilities
Formatting, mapping, validation, and pure helpers.

Do not mix backend transport details directly into visual components.

---

## Unity Boundary
Unity is a rendering surface, not a child component that owns product logic.

The front-end may:
- host/display the Unity surface
- send typed commands
- receive typed events
- react to rendering state

The front-end must **not**:
- embed rendering logic into React
- fake ownership of pose/AR internals
- tightly couple UI state to Unity implementation details

Keep the Unity integration isolated behind a clean interface.

---

## Backend Integration Rules
Assume the backend may exist in 3 levels of maturity:

### Demo Mode
Mock data, mock measurements, mock garments, mock fit outputs.

### Integration Mode
Real events from backend / local services.

### Degraded Mode
Partial, delayed, or missing data.

The UI must gracefully support all three.

Never assume:
- perfect measurements
- perfect tracking
- perfect connectivity
- instant backend readiness

Handle partial states calmly and explicitly.

---

## UX Rules
Each screen should have one primary job.

### Welcome
Invite the session start and establish trust.

### Detection
Guide positioning and confirm readiness.

### Catalog
Enable garment browsing and selection with minimal friction.

### Try-On
Show the visualization clearly and keep overlays minimal.

### Fit Details
Explain fit in plain language.

### Session End
Confirm completion and deletion/reset.

Do not overload screens with secondary actions.

---

## Admin Rules
Admin/staff UI must remain visually and structurally separate from shopper UI.

Admin may include:
- catalog management
- calibration tools
- health/status visibility
- local operational controls
- logs/error visibility

Admin must not feel like the consumer experience.

Do not leak admin complexity into shopper mode.

---

## Code Quality Rules
Always prefer:
- strict TypeScript
- readable naming
- predictable file structure
- low coupling
- pure helpers where possible
- explicit loading/error/empty/degraded states
- reusable components over duplication

When implementing:
- do not leave placeholder logic unexplained
- do not invent API contracts without typing them clearly
- do not silently swallow state transitions
- do not hardcode magic values without naming them

---

## File and Folder Expectations
Prefer a clean structure similar to:

```text
src/
  app/
  screens/
  components/
  features/
  stores/
  adapters/
  lib/
  hooks/
  types/
  mocks/
  styles/

Suggested organization:

screens/ for full state-level screens
components/ for reusable UI pieces
features/ for domain-specific UI modules
stores/ for Zustand stores
adapters/ for backend/Unity/event connectors
types/ for shared types
mocks/ for demo mode fixtures and simulators
Testing Expectations

Code should be easy to test for:

state transitions
event handling
degraded-state behavior
session reset correctness
measurement display updates
fit recommendation updates
admin access separation

Prefer deterministic logic and pure mappings where possible.

Do Not Do These

Do not add:

carts
checkout flows
authentication for shoppers
saved user wardrobes
social features
cloud profile assumptions
route-heavy multipage consumer web patterns
engineering debug panels in shopper mode
technical AI jargon in end-user copy

Do not optimize for investor-demo theatrics over usable product behavior.

Prompt/Task Execution Rules

When asked to implement a feature:

inspect relevant existing files first
preserve architecture consistency
avoid unnecessary rewrites
keep changes scoped
explain assumptions in comments only when necessary
prefer incremental implementation over speculative expansion

When asked to generate code:

produce buildable code
do not output pseudo-code unless explicitly requested
wire mock mode where backend is not ready
leave clean extension points for live integration

When asked to plan:

give concrete file-level steps
identify dependencies
identify risks and degraded cases
keep the plan grounded in current repo reality
Default Behavior for Missing Details

If a requirement is underspecified:

choose the simpler implementation
choose the more privacy-safe implementation
choose the more testable implementation
choose the one that preserves separation between shopper UI, admin UI, backend logic, and Unity rendering

Do not invent complexity for its own sake.

Final Standard

Everything in this repo should feel like it belongs in a serious prototype for a premium retail technology product.

That means:

elegant UI
disciplined architecture
explicit states
reliable reset behavior
graceful fallback handling
realistic integration boundaries

Build something that is impressive because it is clear, well-structured, and trustworthy — not because it is flashy.