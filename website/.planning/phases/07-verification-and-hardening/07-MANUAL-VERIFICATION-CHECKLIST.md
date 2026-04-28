# Phase 7 Manual Verification Checklist

## Setup

- [ ] Launch the app in demo mode and confirm the shopper shell boots to the idle welcome state.
- [ ] If local integration transports are available, run one integration-mode smoke pass and confirm the app still boots without shell or routing drift.
- [ ] Confirm the catalog loads from the local snapshot and shopper mode starts without admin UI leaking into the shell.

## Shopper Flow

- [ ] Complete the full shopper flow in order: `Idle` -> `Detection` -> `Catalog` -> `Try-On` -> `Fit Details` -> `Session Ended` -> automatic return to `Idle`.
- [ ] Verify detection guidance stays plain-language and never exposes transport, websocket, score, or payload jargon.
- [ ] Verify catalog browsing works with the local garment set and variant controls stay within catalog and try-on surfaces only.
- [ ] Verify the try-on stage remains visually primary while overlays stay restrained and readable.
- [ ] Verify fit details explain the current size in plain language and provide a clear route back to try-on.

## Reset and Privacy

- [ ] End the shopper session and confirm the session-ended confirmation appears before the welcome state returns.
- [ ] Verify the confirmation states that measurements and garment selections were cleared on the device.
- [ ] Verify no prior garment name, measurement value, fit copy, or size recommendation appears on the confirmation surface.
- [ ] After reset, verify shopper selections, measurements, fit output, and session identity are gone while catalog definitions still exist.
- [ ] After reset, enter admin mode and confirm no prior shopper garment, fit, or measurement data appears anywhere in admin access or admin sections.

## Degraded and Recovery

- [ ] Simulate or trigger `catalog unavailable`, confirm the shopper sees calm local-status copy, then recover the catalog and confirm browsing is restored.
- [ ] Simulate or trigger Unity `delayed` or `unavailable`, confirm the shopper sees calm recovery guidance, then recover Unity and confirm the stale guidance clears.
- [ ] Simulate or trigger measurement `partial` or `unavailable`, confirm fit messaging degrades calmly, then recover measurements and confirm readiness returns.
- [ ] Simulate or trigger fit `partial` or `unavailable`, confirm the shopper keeps readable non-technical messaging, then recover fit output and confirm stale degraded guidance is gone.
- [ ] If using integration mode, confirm stale pre-reset session events do not repopulate cleared shopper data after restart or reset.

## Admin Access and Separation

- [ ] Confirm `Staff Access` appears only when shopper mode is idle or post-reset.
- [ ] Start a shopper session and confirm admin entry is blocked until the explicit shopper end/reset path completes.
- [ ] Open admin access and confirm the six-digit local PIN gate appears inside the admin shell, not a shopper shell overlay.
- [ ] Verify admin mode stays structurally separate from shopper mode and does not show shopper fit, measurement, or session language.
- [ ] Verify returning from admin restores the shopper shell without carrying admin controls into shopper mode.

## Keyboard and Focus

- [ ] Complete the shopper critical path using keyboard only: start session, wait through detection readiness, select a garment, change size or color, enter try-on, open fit details, return, and end the session.
- [ ] Complete the admin critical path using keyboard only: open staff access, enter the six-digit PIN, move to catalog, select a garment row, save a curation change, and return to shopper mode.
- [ ] Verify focus remains visible on real interactive targets including shopper garment cards, catalog row buttons, and the admin PIN entry surface.
- [ ] Verify `Enter`, `Space`, and `Backspace` behave correctly on the focused controls used in the shopper and admin critical paths.

## Readable Copy and Status

- [ ] Verify shopper-facing degraded and readiness copy stays readable from standing distance and avoids technical transport or AI jargon.
- [ ] Verify privacy and reset copy remains explicit, local-first, and concise.
- [ ] Verify admin copy stays operational and local-device oriented rather than shopper-facing or cloud-auth language.
- [ ] Verify no shopper-facing surface includes commerce copy such as checkout, reviews, price emphasis, or inventory jargon.

## Final Sign-Off

- [ ] Run the targeted automated suites touched during Phase 7 and confirm they are green.
- [ ] Run `npm run test -- --run` and confirm the full test suite is green.
- [ ] Run `npm run typecheck` and confirm it passes cleanly.
- [ ] Run `npm run build` and confirm the production build succeeds.
- [ ] Complete this checklist after the automated gates above and record any observed blocker before handoff.
