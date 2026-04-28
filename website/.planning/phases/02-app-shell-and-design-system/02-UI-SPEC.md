---
phase: 02
slug: app-shell-and-design-system
status: approved
shadcn_initialized: false
preset: none
created: 2026-03-24
reviewed_at: 2026-03-24
---

# Phase 02 — UI Design Contract

> Visual and interaction contract for frontend phases. This Phase 2 contract locks the kiosk shell, shared primitives, and shell-level token extensions. It does not design feature-complete shopper or admin screens.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none |
| Icon library | lucide-react |
| Font | Primary UI: Manrope; shopper display accent only: Cormorant Garamond |

### Phase 2 Intent

- Phase 2 turns the Phase 1 placeholder into a durable shell and primitive system.
- The result must feel like kiosk infrastructure for a premium retail prototype, not a finished dashboard and not a feature gallery.
- The shell must preserve a dominant central stage for future Unity-led try-on rendering.
- Shopper and admin must share structure discipline, not visual identity.
- No UI kit, no component registry, and no generic admin-template patterns are allowed to shape the product.

### Continuity from Phase 1

- Phase 1 decisions remain locked: semantic CSS variables, fixed spacing scale, fixed typography roles, reserved accent usage, reduced-motion support, and shopper/admin theme separation.
- Phase 2 may extend tokens and utilities only where shell layout and shared primitives require it.
- Phase 2 must evolve the existing scaffold in `src/app/` and `src/styles/`; it must not replace the architecture or re-bootstrap the shell.

---

## Shopper Shell Composition

### Shopper Shell Zones

The shopper shell is fixed to a **two-layer composition plus internal overlay lanes**:

1. **Top shell band**
   - Persistent horizontal band at the top of the shell.
   - Purpose: brand presence, privacy reassurance, shell-level status, and one controlled action cluster.
   - It is not a navigation bar and not a route header.
   - It must not hold dense menus, tab bars, breadcrumbs, or multiple competing CTAs.

2. **Main shell row**
   - Composed of:
     - **Protected stage viewport** as the dominant center region
     - **Context rail** on the right edge only
   - No permanent left shopper rail is allowed in Phase 2.
   - The right rail is the only persistent secondary region in shopper mode.

3. **Overlay lanes inside the stage**
   - Reserved lanes anchored inside the stage viewport near the top and bottom edges.
   - Purpose: future low-chrome overlays such as garment identity, fit summary, or contextual controls.
   - Overlays must hug the stage edges, not float through the stage center.

### Shopper Stage Protection Rules

- The protected stage must occupy at least **64% of the usable shell width** at kiosk scale.
- Target shopper composition at kiosk widths is approximately:
  - stage: **70% to 78%**
  - right context rail: **320px to 384px**, never beyond **18%** of usable width
- No persistent shopper shell element may overlap the central stage core.
- The stage core is a protected rectangle inside the stage viewport:
  - inset from stage edges by the stage safe-area token
  - reserved for future Unity rendering and the garment silhouette zone
- Shopper shell chrome must read as framing around the stage, never as the primary content.

### Shopper Band Rules

- Shopper top band height is fixed by token and should visually read as slim, not toolbar-dense.
- Allowed content:
  - brand label
  - privacy/status reassurance
  - shell-level context label
  - a single compact action cluster
- Not allowed:
  - search bars
  - tab systems
  - breadcrumb trails
  - analytics chips
  - multi-action command rows

### Shopper Rail Rules

- The shopper right rail exists for contextual support surfaces only.
- It may host:
  - current-context summaries
  - shell placeholder panels
  - later state-specific secondary actions
- It must not become:
  - a navigation tree
  - a commerce sidebar
  - a scrolling dashboard feed
  - a second primary stage

---

## Admin Shell Composition

### Admin Shell Zones

The admin shell is fixed to a **three-zone operational composition**:

1. **Command bar**
   - Persistent horizontal top band.
   - Purpose: mode identity, section label, operational status cluster, and command cluster.

2. **Navigation rail**
   - Persistent left rail.
   - Purpose: section switching and structural orientation only.
   - It must stay visibly separate from shopper chrome.

3. **Workspace row**
   - Center **workspace canvas** plus optional right **inspector rail**.
   - The workspace is the primary admin content region.
   - The inspector is secondary and may collapse when not needed.

### Admin Density Model

- Admin is denser than shopper, but still kiosk-readable.
- Default admin composition rules:
  - internal spacing defaults to `md`
  - grouped control spacing uses `md` and `lg`
  - shell gaps use `lg` and `xl`
  - stronger dividers and clearer panel segmentation than shopper mode
- Admin should feel operational and efficient, not luxurious.
- Admin must avoid display-font emphasis, oversized hero copy, and translucent presentation panels as the dominant pattern.

### Admin Width Rules

- Target kiosk composition at admin widths is approximately:
  - left nav rail: **240px to 288px**
  - center workspace: **minimum 52%** of usable width
  - right inspector: **280px to 360px** when present
- When the inspector is not used, its width returns to the center workspace.
- The admin shell should scan horizontally, but must not collapse into a grid of equally weighted dashboard cards.

---

## Large-Display Kiosk Rules

### Display Targets

- Primary target: **1920x1080**
- Design intent also needs to hold for large 32-inch-class displays viewed from standing distance.
- Secondary target: lower-resolution development environments without changing the kiosk mental model.

### Safe-Area Behavior

- Shopper shell outer padding:
  - inline: `clamp(32px, 2.5vw, 48px)`
  - block: `clamp(24px, 2vw, 40px)`
- Admin shell outer padding:
  - inline: `clamp(24px, 2vw, 32px)`
  - block: `clamp(20px, 1.8vw, 28px)`
- Shopper stage safe inset:
  - default `48px`
  - minimum `32px` in compact widths
- Overlay elements must respect the stage safe inset and remain anchored to stage edges.

### Composition Rules

- Treat the display as a stage with surrounding control surfaces.
- Shopper shell uses edge chrome and central emptiness deliberately.
- Admin shell uses explicit zoning and clearer information hierarchy, but still respects kiosk reading distance.
- No later phase may introduce a full-width shopper dashboard grid, persistent left shopper navigation, or a top-nav-heavy web-app layout.

---

## Low-Resolution Development Fallback

### Shopper Fallback

- At widths below **1440px**, the shopper shell keeps the same zoning but tightens spacing and narrows the right rail.
- At widths below **1280px**:
  - the stage remains first and full-width
  - the right context rail stacks **below** the stage
  - the top shell band may wrap into two rows
- The shopper shell must not switch to:
  - hamburger navigation
  - drawer-heavy mobile patterns
  - stacked equal-weight cards replacing the stage

### Admin Fallback

- At widths below **1440px**, admin rails compress but remain visible.
- At widths below **1280px**:
  - the right inspector moves below the workspace
  - the left nav rail may compact, but must remain structurally visible
  - the command bar may wrap
- Admin fallback still reads as an operational console, not a tablet/mobile app.

### Universal Fallback Rule

- Lower-resolution fallback is a **compressed kiosk shell**, not a different product layout system.

---

## Shared Primitive Inventory

### Shell and Layout Primitives

| Primitive | Responsibility |
|----------|----------------|
| `ShellFrame` | Owns viewport height, backdrop, shell padding, and mode-aware frame behavior |
| `ShellBand` | Top-level shell band for brand, shell status, and a constrained action cluster |
| `StageViewport` | Protected shopper stage surface with internal safe area and overlay lanes |
| `ContextRail` | Secondary edge rail for shopper context and shell support surfaces |
| `AdminNavRail` | Persistent structural navigation rail for admin mode |
| `WorkspaceCanvas` | Primary admin workspace container for operational content |
| `InspectorRail` | Secondary admin inspection/details region |
| `OverlayLane` | Edge-anchored stage overlay container, never center-stage content |

### Surface and Content Primitives

| Primitive | Responsibility |
|----------|----------------|
| `Panel` | Base bordered surface for grouped content in either mode |
| `PanelHeader` | Standard header row for section title, optional support text, and action slot |
| `Badge` | Compact semantic label for status, context, or mode markers |
| `Divider` | Explicit visual separation in admin mode and restrained separation in shopper mode |

### Interactive Primitives

| Primitive | Responsibility |
|----------|----------------|
| `Button` | Primary, secondary, quiet, and destructive actions with consistent focus and target size |
| `IconButton` | Compact icon-led action with the same focus and minimum hit-area rules as `Button` |
| `FocusRing` or focus utility | Shared visible focus treatment applied consistently across primitives |

### Primitive Scope Limits

- These primitives are structural and generic.
- They must not encode:
  - garment behavior
  - session logic
  - measurement formatting
  - fit semantics
  - backend/runtime states
  - admin business workflows

---

## Semantic Token Extensions Required

Phase 1 already provides the base color, text, border, accent, radius, shadow, and motion tokens. Phase 2 must add the following semantic tokens to support the shell and primitives cleanly.

### Surface and Border Tokens

- `--color-surface-overlay`
- `--color-surface-ghost`
- `--color-surface-strong`
- `--color-text-secondary`
- `--color-text-inverse`
- `--color-border-subtle`
- `--color-border-strong`
- `--color-accent-contrast`

### Focus Tokens

- `--color-focus-ring-inner`
- `--color-focus-ring-outer`
- `--focus-ring-width-inner`
- `--focus-ring-width-outer`

### Layout Tokens

- `--shell-frame-pad-inline`
- `--shell-frame-pad-block`
- `--shell-band-height`
- `--shell-gap`
- `--shopper-stage-safe-inset`
- `--shopper-context-rail-width`
- `--shopper-overlay-lane-height`
- `--admin-nav-rail-width`
- `--admin-inspector-width`
- `--admin-command-bar-height`

### Primitive Tokens

- `--control-min-height`
- `--control-pad-inline`
- `--radius-badge`
- `--radius-overlay`
- `--shadow-overlay`
- `--shadow-float`

### Motion Tokens

- `--motion-shell-enter`
- `--motion-shell-exit`
- `--motion-overlay-enter`
- `--motion-overlay-exit`
- `--motion-easing-emphasized`

### Token Rules

- Token names stay semantic and mode-aware through existing alias mapping.
- No raw hex values should appear in JSX for shell or primitive behavior.
- Shopper/admin values may differ, but token names must stay shared where the meaning is shared.

---

## Spacing Scale

Declared values remain fixed from Phase 1:

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Hairline gaps, badge internals, icon separation |
| sm | 8px | Compact control spacing |
| md | 16px | Default primitive padding and row spacing |
| lg | 24px | Section grouping and band spacing |
| xl | 32px | Shell gaps and major panel spacing |
| 2xl | 48px | Shopper stage safe inset and large shell padding |
| 3xl | 64px | Maximum kiosk breathing room, not default panel padding |

Exceptions: none

### Spacing Rules

- Shopper mode defaults to `lg`, `xl`, and `2xl`.
- Admin mode defaults to `md`, `lg`, and `xl`.
- If a layout feels cramped, solve it with shell structure before inventing new spacing tokens.

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 18px | 400 | 1.5 |
| Label | 16px | 600 | 1.4 |
| Heading | 32px | 600 | 1.2 |
| Display | 56px | 600 | 1.05 |

### Typography Rules

- Shopper shell may use display typography sparingly in placeholder/demo states only.
- Admin shell must not use display typography.
- Shell band copy should primarily use label and body roles.
- Long paragraphs are not allowed in shell-level regions.

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#0E0E10` | Shopper canvas and stage-adjacent background |
| Secondary (30%) | `#1A1B20` | Shopper panel and overlay surfaces |
| Accent (10%) | `#C6A56A` | Shopper focus, active state, restrained emphasis only |
| Destructive | `#C45A48` | Destructive actions only |

Accent reserved for: shopper focus ring, one primary action per region, active selection state, privacy reassurance emphasis

### Admin Color Direction

- Admin keeps the existing cooler palette:
  - canvas `#0F161D`
  - panel `#18212A`
  - accent `#5B8FB9`
- Admin accent is operational emphasis, not luxury brand language.
- Admin shells should rely more on border hierarchy and zoning than glow or translucency.

### Color Rules

- Shopper shell remains dark and warm.
- Admin shell remains cooler and more explicit.
- Do not introduce a third primary shell identity.
- Do not use accent as the default fill for every button or badge.

---

## Interaction and Focus Rules

### Keyboard and Mouse Contract

- All shell-level interactive elements must be reachable by keyboard in visible reading order.
- Focus order must follow the visual zone order:
  - shell band
  - primary content region
  - secondary rails or inspector regions
- Hover may enhance affordance, but nothing important may exist only on hover.
- Toggle-like shell controls must expose pressed/selected semantics explicitly.

### Focus Treatment

- Focus-visible treatment is mandatory for all interactive primitives.
- Focus must use the shared semantic focus system, not browser-default outlines alone.
- Focus rings must remain visible on dark surfaces and elevated surfaces.
- Focus appearance must be consistent between `Button`, `IconButton`, shell mode toggles, rail items, and future interactive panels.

### Target Sizes

- Minimum interactive target: **48x48px**
- Compact icon actions still inherit the same hit target through padding or wrapper sizing.

### Interaction Anti-Patterns

- No hover-only controls
- No tiny pill toggles below target size
- No hidden keyboard shortcuts as the only interaction path
- No dense admin toolbar clusters that collapse into unlabeled icons

---

## Motion Rules

### Motion Scope

- Motion in Phase 2 is limited to shell transitions and primitive feedback.
- Allowed motion:
  - shell-mode transition
  - panel and rail reveal
  - overlay lane reveal
  - button/selection state transition

### Motion Style

- Shopper:
  - fade plus restrained translate
  - no large-scale sliding of the full stage
  - no bounce, spring overshoot, or theatrical wipe
- Admin:
  - faster, flatter, more functional
  - emphasis on clarity over flourish

### Motion Limits

- The stage viewport itself should remain visually stable.
- Whole-screen motion should be avoided.
- Reduced-motion mode removes nonessential transforms and falls back to opacity/state changes only.

---

## Copywriting Contract

Phase 2 locks shell-level messaging only. Product-state copy belongs to later phases.

| Element | Copy |
|---------|------|
| Shopper shell placeholder heading | Stage Reserved |
| Shopper shell placeholder body | Shell and layout only. Live try-on content arrives in later phases. |
| Shopper shell support label | Context Rail |
| Admin shell placeholder heading | Admin Shell |
| Admin shell placeholder body | Operational layout only. Tools and system workflows arrive in later phases. |
| Destructive shell-demo confirmation | Reset Preview: Clears shell demo selections only. |

### Copy Tone Rules

- Shopper shell copy:
  - calm
  - brief
  - outcome-oriented
  - privacy-safe
- Admin shell copy:
  - concise
  - operational
  - non-decorative
- Shell copy must not imply:
  - real session state
  - real garment selection
  - real fit outputs
  - real backend/runtime readiness

---

## Allowed Placeholders in Phase 2

### Allowed

- Generic shell headings and region labels
- Primitive showcase content
- Neutral placeholder panels proving shell density and hierarchy
- Developer/demo mode switch between shopper and admin shell presentation
- Stage marker content that explicitly states the region is reserved for later rendering work

### Not Allowed

- Real welcome-screen messaging
- Real detection guidance
- Real catalog browsing content
- Real try-on HUD content
- Real fit or measurement content
- Real admin health/log/calibration content
- Real backend connectivity states

### Placeholder Rule

- If a placeholder could be mistaken for a product screen, it is too specific for Phase 2.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| none | none | not applicable |

---

## Fixed Rules For Later Phases

- Shopper mode keeps the protected central stage and right-side contextual support model.
- Shopper mode may add temporary state-specific overlays, but not a permanent left navigation rail.
- Admin mode keeps a command bar, left navigation rail, and workspace-first composition.
- All later screens must fit into the Phase 2 shell zones rather than inventing unrelated page frames.
- Later phases may populate the shell, but may not turn it into a commerce storefront, SaaS dashboard, or analytics console.
- Shared primitives remain generic; domain meaning belongs in later feature modules.
- Unity remains visually central in try-on states and may not be crowded out by React chrome.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-03-24
