---
phase: 01
slug: foundation-bootstrap
status: approved
shadcn_initialized: false
preset: none
created: 2026-03-24
reviewed_at: 2026-03-24
---

# Phase 01 — UI Design Contract

> Visual and interaction contract for frontend phases. This Phase 1 contract locks the foundation-level visual system only. It does not design shopper or admin feature screens.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none |
| Icon library | lucide-react |
| Font | Primary UI: Manrope; Display accent for shopper-facing hero moments: Cormorant Garamond |

### Foundation Intent

- Phase 1 establishes token infrastructure and shell rules, not a final component system.
- Phase 1 should use CSS variables plus Tailwind theme extension as the token source of truth.
- Tokens must be mode-aware from the start: shopper tokens and admin tokens live in the same system, but remain visibly separate.
- No third-party UI kit should shape the product’s visual identity in foundation. Reusable primitives belong in Phase 2.

### Token Architecture

- Define semantic CSS variables first, not hardcoded utility-only color values.
- Minimum token families for Phase 1:
  - surface
  - text
  - border
  - accent
  - destructive
  - focus
  - spacing
  - radius
  - shadow
  - motion
- Token namespaces must support at least:
  - `shopper-*`
  - `admin-*`
  - shared semantic aliases for global shell behavior
- Tailwind should consume semantic aliases, not raw hex values spread through JSX later.

---

## Spacing Scale

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Hairline gaps, icon-to-label micro spacing |
| sm | 8px | Tight internal control spacing |
| md | 16px | Default content spacing and control padding |
| lg | 24px | Section padding and grouped control spacing |
| xl | 32px | Primary layout gutters and panel spacing |
| 2xl | 48px | Large-display shell padding and major group separation |
| 3xl | 64px | Hero spacing, shell safe-zone offsets, stage-to-sidebar separation |

Exceptions: none

### Spacing Rules

- All layout spacing must resolve to the declared scale.
- Shopper mode should visually breathe; default to `md`, `lg`, and `xl` before adding more density.
- Admin mode may use denser compositions, but still stays on the same scale.
- Avoid nested spacing improvisation. If spacing pressure appears, solve through layout structure rather than adding new token values.

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 18px | 400 | 1.5 |
| Label | 16px | 600 | 1.4 |
| Heading | 32px | 600 | 1.2 |
| Display | 56px | 600 | 1.05 |

### Typography Direction

- Use Manrope for all functional UI, labels, controls, admin surfaces, and body copy.
- Use Cormorant Garamond only for shopper-facing display moments that need a luxury/fashion signal.
- Admin mode must not use the display accent font.
- Only two font weights are allowed across the system in Phase 1: `400` and `600`.
- Do not introduce additional font sizes in Phase 1.

### Typography Rules

- Shopper typography should feel restrained and premium, not loud or editorial-chaotic.
- Admin typography should feel operational, efficient, and plainspoken.
- Avoid all-caps for long labels; reserve uppercase only for short utility labels or status chips if needed later.
- Body copy should favor sentence case and short line lengths.

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#0E0E10` | Shopper background, global canvas, stage-adjacent surfaces |
| Secondary (30%) | `#1A1B20` | Shopper panels, cards, overlays, rails |
| Accent (10%) | `#C6A56A` | Shopper primary CTA, active selection, focus ring, privacy reassurance emphasis |
| Destructive | `#C45A48` | Destructive actions only |

Accent reserved for: shopper primary action, active state indicator, keyboard focus ring, privacy-status emphasis, selected garment/size highlight

### Shopper Visual Baseline

- Shopper mode is dark, premium, restrained, and high-contrast without looking glossy or neon.
- Backgrounds should use near-black and graphite surfaces, not flat pure black everywhere.
- Metallic warmth comes from the single restrained accent, not gradients or bright decorative hues.
- Glass/translucency is allowed only if it improves visual layering over the Unity stage and remains subtle.

### Admin Visual Baseline

- Admin mode must not reuse the shopper gold accent as its visual signature.
- Admin surfaces should shift cooler and more operational: charcoal, slate, steel, and muted information colors.
- Admin emphasis color should be treated as operational status, not brand luxury.
- Admin shell should prefer clearer boundaries, stronger dividers, and more explicit density management than shopper mode.

### Color Rules

- Shopper and admin themes must be separate token sets, not one palette with minor tweaks.
- Accent color must never be applied to every interactive element.
- Status/severity colors should stay semantic and restrained.
- Avoid purple, gaming-neon, and marketing-gradient aesthetics.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | Start Session |
| Empty state heading | Session Not Ready |
| Empty state body | Position yourself in view or ask staff for help to continue. |
| Error state | Local connection interrupted. Reposition or retry to continue. |
| Destructive confirmation | End Session: This clears current measurements and returns to welcome. |

### Copy Tone Principles

- Shopper copy must be calm, direct, and reassuring.
- Admin copy must be concise, operational, and unromantic.
- Do not use AI/ML jargon, biometrics jargon, or cloud language in shopper mode.
- Error copy must explain the problem in plain language and include the next step.
- CTA labels must stay verb+noun or explicit action phrases; no `Submit`, `OK`, or `Continue` without context.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| none | none | not applicable |

---

## Layout Principles

### Large-Display Kiosk Rules

- Design against a primary kiosk target of 1920x1080 and ensure the shell degrades cleanly to a lower-resolution development environment.
- Treat the screen as a stage, not a dashboard.
- Reserve the visual center for the primary experience area; chrome belongs at the edges.
- Use generous outer padding:
  - shopper shell default: `xl` to `2xl`
  - admin shell default: `lg` to `xl`
- Favor horizontal compositions with calm edge rails over stacked mobile-like cards.
- Any persistent rail must remain subordinate to the stage area and should not dominate more than roughly one-fifth of the screen width.
- Text blocks should stay readable at standing distance; avoid dense paragraphs and narrow low-contrast sidebars.

### Shell Composition

- The base shell must support three zones:
  - global frame
  - primary stage/content region
  - optional peripheral rail or utility region
- Shopper shell should prioritize center-stage framing.
- Admin shell should prioritize scanability and explicit zoning.
- Layout decisions in later phases must respect these shell zones rather than inventing one-off page structures.

---

## Motion Principles

### Motion Tokens

- `motion-fast`: 120ms
- `motion-standard`: 180ms
- `motion-slow`: 240ms

### Motion Rules

- Motion exists for confirmation, transition, privacy wipe/reset, and state readiness.
- Default motion style is fade, translate, and scale-with-restraint. No bounce, elastic overshoot, or playful spring behavior in shopper mode.
- Shopper motion should feel smooth and premium; admin motion should feel mostly functional.
- Motion must never compete with the Unity stage.
- Reduced-motion behavior is mandatory from the start:
  - remove nonessential transforms
  - keep state changes legible through opacity and structure instead

---

## Accessibility and Readability

- Core text on dark surfaces must target strong contrast suitable for standing-distance reading.
- Minimum interactive target size: 48x48px.
- Focus states must be visible without relying on browser defaults alone.
- Focus indication should use the reserved focus/accent system, not arbitrary outlines.
- Labels and controls must remain usable with keyboard only.
- Avoid low-contrast placeholder text as a primary communication tool.
- Avoid text blocks longer than roughly 60 characters per line in shopper-facing shell copy when displayed at kiosk scale.
- Shopper-critical status messaging must be readable without requiring proximity to the display.

---

## Base App Shell Contract

The following must exist before Phase 2 begins:

1. Global token definitions for shopper/admin themes in a single source of truth.
2. Font loading and fallback strategy for the locked typography system.
3. Global background, text, border, focus, shadow, radius, and motion tokens wired into the app shell.
4. A root shell structure that can switch cleanly between shopper and admin visual modes.
5. Global focus-visible treatment aligned to the reserved accent/focus rules.
6. Global typography classes or token mappings for body, label, heading, and display roles.
7. A minimal bootable surface that proves the shell can render with the locked theme rules, without introducing feature layouts.
8. Safe-area layout utilities for stage region, peripheral rail region, and shell padding.
9. Reduced-motion support hooks at the styling/system layer.

The following must NOT exist yet:

- final shopper screens
- admin dashboard layouts
- domain-specific cards or panels
- fit widgets
- catalog UI
- live try-on overlays
- runtime mode messaging logic

---

## Fixed Rules For Later Phases

- Shopper mode remains dark and premium with a restrained warm accent.
- Admin mode remains operational and visually separate from shopper mode.
- No later phase may introduce a third visual identity for the main product surfaces.
- The spacing scale, font-size count, and font-weight count are fixed unless a later explicit planning update changes them.
- Accent color remains reserved and cannot become the default color for all controls.
- Shell layouts must preserve a center-stage content model suitable for Unity-led experiences.
- Copy must remain calm, plainspoken, and free of technical internals in shopper mode.

---

## Risks and Ambiguities

- Font licensing and delivery method are not yet frozen; implementation planning should confirm self-hosted vs package-based loading for the selected fonts.
- Admin semantic palette needs exact token values during implementation planning, but its direction is already fixed: cooler, operational, and separate from shopper luxury cues.
- The exact root shell mode switch mechanism is not yet specified; planning should decide whether this is route-based, shell-state-based, or environment-gated without changing the visual contract.
- The placeholder scaffold in Phase 1 must stay visually neutral enough not to pre-empt Phase 2 screen design.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-03-24
