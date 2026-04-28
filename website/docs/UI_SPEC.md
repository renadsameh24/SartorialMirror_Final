ACT AS:
You are a principal front-end architect, senior product designer, and systems-minded UI engineer. Your bar is Apple-level clarity, luxury retail restraint, and production-grade software discipline. You do not produce vague concept art. You produce a front-end build specification that can be implemented cleanly and integrated with a real backend.

PROJECT:
Build the front-end application for THE SARTORIAL MIRROR, an intelligent virtual try-on system for retail.

This is not a generic website.
This is not an e-commerce storefront.
This is not a mobile app.
This is an on-device, privacy-first, state-driven retail interface for a smart mirror / screen-based fitting experience.

==================================================
1. PRODUCT TRUTH
==================================================

The Sartorial Mirror is a real-time virtual try-on system that:
- detects a user standing in front of the display
- extracts body measurements locally
- lets the user browse a small local garment catalog
- overlays the selected garment on the live user view via Unity rendering
- shows fit confidence and size recommendation
- allows the user to end the session
- permanently clears session data after session end
- provides a separate admin/staff interface for operational management

The experience must feel:
- immediate
- premium
- privacy-safe
- calm
- obvious
- retail-ready

This is a session-based smart fitting experience intended to reduce friction in clothing selection and improve confidence in size choice.

==================================================
2. HARD PRODUCT CONSTRAINTS
==================================================

These are non-negotiable and must shape the UI architecture:

1. Local-first privacy
All user body and session data are processed locally.
No cloud-first assumptions.
No shopper accounts.
No session history retained for the shopper.

2. Prototype maturity
The current implementation focus is a screen-based upper-body prototype.
Do not hardwire the experience around a fully mature full-body mirror-only setup.
Design for expansion later without forcing that complexity now.

3. Interaction realism
The formal implemented interaction path today must support:
- keyboard session start
- keyboard and mouse garment browsing/selection
Gesture and voice should be treated as enhancement-ready input layers, not as the only way the product works.

4. Performance
The UI must be designed for a live try-on system with a target of roughly 20–30 FPS overall visualization quality.
Never design interaction flows that depend on long loading interruptions.

5. Small local catalog
Assume approximately 10–15 preloaded garments in a local database at this stage.
Do not design for massive infinite-scroll commerce catalog patterns.

6. Architecture separation
Unity handles the AR / virtual garment rendering layer.
The front-end application handles:
- session flow
- UI chrome
- garment selection
- fit information
- privacy messaging
- admin tools
- local operational controls
Do not make the React UI responsible for garment physics or AR rendering internals.

==================================================
3. CRITICAL CORRECTIONS TO PREVIOUS DESIGN BRIEFS
==================================================

Apply these corrections deliberately:

- Do NOT make gesture-first the only real interaction model.
- Do NOT assume full-body fidelity is available in version 1.
- Do NOT design the customer flow like a normal multi-page web app.
- Do NOT copy mislabeled requirement section names literally if the actual behavior suggests a cleaner state model.
- Do NOT expose AI, SMPL, body reconstruction, or technical pipeline jargon to end users.
- Do NOT create UX that depends on backend perfection; the UI must degrade gracefully.

==================================================
4. EXPERIENCE PRINCIPLES
==================================================

Every design decision must pass these principles:

1. Invisible complexity
Users see results, not the pipeline.

2. Privacy as a premium feature
The interface should make local processing and deletion feel reassuring and elegant, not legalistic.

3. One job per screen
Each state has a single primary purpose.

4. Fast retail flow
A first-time user should be able to move from welcome to try-on with minimal hesitation.

5. Elegant fallback
If tracking confidence, measurements, or rendering lag, the interface remains calm and usable.

6. Shopper UI vs admin UI separation
Customer-facing design is dark, luxurious, and emotionally calm.
Admin-facing design is operational, efficient, and unmistakably different.

==================================================
5. WHAT THE SHOPPER UI MUST INCLUDE
==================================================

Design the shopper experience as a strict state machine with these primary states:

A. IDLE / WELCOME
B. DETECTION / POSITIONING
C. CATALOG / GARMENT SELECTION
D. LIVE TRY-ON
E. FIT DETAILS
F. SESSION END / PRIVACY RESET

Also support a separate admin access flow.

--------------------------------------------------
STATE A — IDLE / WELCOME
--------------------------------------------------

Purpose:
Attract attention, establish trust, and invite the user to begin.

Must include:
- live user reflection / live camera impression
- clear Start Session prompt
- premium local-processing privacy reassurance
- visually calm brand-led presentation
- zero clutter

Design intent:
A person walking by should immediately understand that this is a smart fitting experience.

Do not include:
- menus
- tutorial walls
- complex instructions
- technical wording
- social proof widgets
- commerce pricing blocks

--------------------------------------------------
STATE B — DETECTION / POSITIONING
--------------------------------------------------

Purpose:
Guide the user into a valid stance and communicate that the system is reading them successfully.

Must include:
- visual body detection confirmation such as outline, skeleton, or body-lock feedback
- simple corrective guidance if position is invalid
- calm prompts for lighting, distance, and posture issues
- visible progression from “detected” to “ready”

Must not include:
- raw diagnostic text
- technical confidence numbers
- alarming error treatment
- heavy red warning states

Design tone:
Reassuring, precise, and slightly magical.

--------------------------------------------------
STATE C — CATALOG / GARMENT SELECTION
--------------------------------------------------

Purpose:
Let the user browse and select from the local garment set.

Must include:
- a small curated catalog layout optimized for ~10–15 garments
- clear visual distinction between categories and garments
- keyboard and mouse navigation support as first-class behavior
- size and color selection where available
- visible selected-item context
- load-state behavior that feels instant and polished

Recommended layout:
- left rail or top band for category/filter context
- central garment grid or card rail
- focused selection drawer / action region

Do not include:
- checkout
- cart
- pricing emphasis
- review stars
- inventory counts
- endless marketplace patterns

--------------------------------------------------
STATE D — LIVE TRY-ON
--------------------------------------------------

Purpose:
Deliver the primary product value moment.

Must include:
- Unity-rendered try-on view as the visual hero
- garment identity
- current selected size
- extracted measurements in clear readable format
- fit confidence / fit quality signal
- recommended size output
- next actions: change size, return to catalog, see fit details, end session

Important:
The UI layer must treat Unity as a rendering surface, not as an editable React child.
The React layer should never attempt to own the AR logic.

HUD behavior:
Use minimal overlays, preserve the center viewing area, and avoid obscuring the garment visualization.

--------------------------------------------------
STATE E — FIT DETAILS
--------------------------------------------------

Purpose:
Give the user confidence in decision-making.

Must include:
- readable explanation of why the current garment/size fits or does not fit
- suggestion for alternative size when needed
- optional alternative garment recommendation if backend provides it
- clean back path to live try-on

Tone:
Human, plain language, no scientific jargon.

--------------------------------------------------
STATE F — SESSION END / PRIVACY RESET
--------------------------------------------------

Purpose:
Make session completion and data deletion explicit.

Must include:
- clear confirmation that the session has ended
- clear indication that measurements and session data were deleted
- automatic return to welcome state
- visually meaningful deletion/reset moment

Must not include:
- shopper recap history
- data export
- email capture
- cloud save
- “come back later to see your history”

==================================================
6. ADMIN / STAFF EXPERIENCE
==================================================

Create a completely separate operational interface for staff.

Admin must include:
- catalog management
- calibration controls
- system status / health visibility
- performance/error logging visibility
- session metrics in anonymized form
- admin authentication or protected access

Admin must look different from shopper UI.
It should feel like a control surface, not a luxury retail display.

Do not let shopper styling leak into admin.
Do not let admin complexity leak into shopper flow.

==================================================
7. WHAT THE UI MUST NOT INCLUDE
==================================================

Do not build any of the following into the shopper experience:

- shopper login/account creation
- cloud profile saving
- persistent measurement history across sessions
- sharing to social media
- checkout/cart/payment
- cloud upload language
- biometric history browsing
- complex settings menus
- backend/internal AI model details
- engineering debug panels in shopper mode
- any interaction flow that becomes unusable without gestures
- assumptions that full-body or perfect 3D data always exists

==================================================
8. FAILURE, FALLBACK, AND DEGRADED STATES
==================================================

The front-end must be robust against partial backend maturity.

Support these three runtime modes:

1. DEMO MODE
Uses mock data for measurements, garments, recommendations, and health metrics.

2. INTEGRATION MODE
Uses live WebSocket/backend events and real local catalog data.

3. DEGRADED MODE
Used when:
- pose confidence is low
- measurements are incomplete
- Unity view is delayed
- camera is connected but calibration is weak
- fit data is partial

In degraded mode:
- keep the UI calm
- preserve navigation
- show user-safe guidance
- avoid exposing stack traces or system jargon
- make it clear that repositioning or retrying may improve results

==================================================
9. DATA AND BACKEND INTEGRATION ASSUMPTIONS
==================================================

Design the UI around local inter-process or local-network integration.

Assume:
- WebSocket communication from local processing/backend
- local garment data source (SQLite or JSON)
- Unity output embedded or displayed alongside the UI shell
- system health / logs available locally

Build the front-end so it can consume:
- user detected / lost
- scan complete
- frame update
- measurements update
- fit recommendation update
- system health update
- guidance / recoverable error events

The front-end should also send commands such as:
- start session
- end session
- select garment
- change size
- change color
- trigger calibration
- admin actions as allowed

==================================================
10. RECOMMENDED FRONT-END ARCHITECTURE
==================================================

Build a production-grade front-end with this recommended stack:

- React
- TypeScript
- Vite
- Zustand for local state
- Framer Motion for UI transitions
- Tailwind CSS or a structured design-token CSS system
- Electron only if desktop kiosk packaging/local FS/admin workflows require it

Architectural rules:
- shopper state machine must be explicit
- all UI states must be testable independently
- all external inputs must go through typed adapters
- Unity integration must be isolated
- session data must be wiped on every session end
- no external HTTP calls unless explicitly required later by architecture review

==================================================
11. DESIGN SYSTEM DIRECTION
==================================================

Create a design language that feels:

- dark
- premium
- restrained
- fashion-forward
- precise
- trustworthy

Visual direction:
- dark background palette
- high contrast but not harsh
- subtle glass or translucent UI only where useful
- elegant typography
- very controlled accent color use
- refined motion, never playful gimmicks

Use motion for:
- confirmation
- detection
- state transition
- privacy wipe/reset
- fit data arrival

Avoid:
- neon overload
- gaming UI tropes
- startup dashboard aesthetics
- busy gradients
- toy-like animations

==================================================
12. ACCESSIBILITY AND INPUT MODEL
==================================================

Support these input layers:

Required for V1:
- keyboard
- mouse

Enhancement-ready:
- gesture
- voice

All interactive elements must:
- have focus states
- be operable without gesture input
- have clear primary action mapping
- remain readable from standing distance on a large screen

Design for large-display readability first, not laptop-density UI.

==================================================
13. RESPONSIVE TARGETS
==================================================

Primary target:
- large kiosk / smart mirror style display
- visually optimized for 32-inch class screen
- high readability at distance

Secondary dev target:
- lower-resolution development/testing environment

Do not make the layout feel like a desktop SaaS app stretched onto a big screen.

==================================================
14. COMPONENT LIST TO BUILD
==================================================

Build the complete UI using reusable components, including at minimum:

- WelcomeScreen
- DetectionScreen
- CatalogScreen
- TryOnScreen
- FitDetailsPanel
- SessionEndScreen
- AdminLogin
- AdminDashboard
- SystemHealthPanel
- CatalogManager
- CalibrationPanel
- LogViewer
- GlobalSessionController
- PrivacyStatusBadge
- GuidanceBanner
- FitConfidenceWidget
- MeasurementPanel
- SizeRecommendationBadge
- GarmentCard
- GarmentSelector
- EmptyState
- DegradedStateOverlay

==================================================
15. STORE / STATE MODEL
==================================================

Implement clear state separation:

- session state
- garment/catalog state
- measurement state
- fit recommendation state
- system health state
- admin state
- UI mode state
- degraded/fallback state

The shopper flow should be event-driven, not route-driven in the traditional web sense.

==================================================
16. CODING RULES
==================================================

Code quality expectations:
- strict TypeScript typing
- clean component boundaries
- no giant monolithic screen files
- typed backend event models
- graceful error handling
- deterministic session clear/reset
- mock adapters for frontend-first development
- reusable design tokens
- no unexplained magic constants

Also provide:
- mock data fixtures
- demo mode switch
- event simulator for backend messages
- clear file structure
- comments only where they add real value

==================================================
17. TESTING EXPECTATIONS
==================================================

Design and code so the following can be tested cleanly:

- user detected -> state transition
- invalid positioning -> guidance shown
- scan complete -> catalog available
- garment selected -> try-on state entered
- measurement update -> UI refreshes cleanly
- fit recommendation update -> badge/panel updates
- end session -> data wiped -> return to welcome
- backend disconnect -> degraded mode
- admin authentication -> admin tools visible
- catalog edit in admin -> reflected in local catalog source

==================================================
18. DELIVERABLE EXPECTATION
==================================================

Produce a front-end codebase that feels like a serious prototype for a billion-dollar retail technology product, but remains honest to the current project scope.

That means:
- premium design
- realistic integration boundaries
- strong privacy UX
- robust state management
- graceful fallback behavior
- no speculative overengineering beyond what the backend and current prototype stage can support

FINAL INSTRUCTION:
Do not give me a vague design concept.
Give me a complete, production-minded front-end implementation plan and code structure for this product.
Every screen, state, component, interaction, and data edge case must be explicitly accounted for.
Optimize for buildability, clarity, and future expansion from upper-body screen prototype to fuller smart mirror deployment.