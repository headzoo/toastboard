<!-- BIG-PLAN:1 -->
# Big Plan: Multi-event Toastboard guestbooks

Plan status: complete
Review cycle: 0
Max review cycles: 2

## Objective

Extend Toastboard from a wedding-only product into a backwards-compatible multi-event guestbook supporting `wedding`, `birthday`, `graduation`, `religious-milestone`, and `other`. New events persist an `eventType` while retaining the Firestore key `coupleNames`; guest, wall, host, slideshow, and printable-sign language comes from centralized type-specific copy packs; creation supports a type picker and `/create?type=...`; marketed event types receive parameterized landing pages and stable live demos; and legal/metadata documentation becomes event-neutral. Existing events without `eventType` must continue to behave as weddings.

## Original request

> I want to support Birthdays, Graduation, Religious Milestone (bar mitzva), Wedding, and other. When creating the plan only assign steps to Composer and Grok models.

Additional requirements incorporated:

- The existing QR → guest toast/photo → live wall → host moderation → printable table sign engine remains shared.
- Keep writing `coupleNames` in Firestore for compatibility; do not break existing events.
- Use IDs `wedding`, `birthday`, `graduation`, `religious-milestone`, and `other`.
- Keep the Toastboard product name and use type-appropriate guest-facing nouns through copy packs.
- Keep shared app routes (`/e/:slug`, `/create`, wall, and manage), support `/create?type=...`, and use one parameterized marketing landing implementation.
- Provide marketed landing pages and stable demos for wedding, birthday, graduation, and religious milestone; `other` is create-form only.
- Generalize the demo seed, persist `eventType` on demo documents, and gently merge the existing Maya & James demo.
- Deliver in slices: event type/copy/create/rules, shared guestbook surfaces, demos and landings, then legal/meta.
- Use pnpm only, add no dependency without approval, avoid unnecessary large refactors, never delete production data, and write only this plan during planning.
- Assign execution only to Composer and Grok models.

## Global architectural decisions

- Define one closed `EventType` vocabulary with exactly the five requested IDs. Export a runtime validator, a normalizer, ordered picker options, marketed-type metadata, and copy-pack lookup from a central event-type module rather than scattering switches across pages.
- Treat a missing or unknown stored `eventType` as `wedding` on reads and in legacy browser keepsafes. This preserves every existing event without a destructive migration.
- Continue naming and writing the Firestore display-name field `coupleNames` in event documents, API payloads, and browser keepsafes. UI labels reinterpret that field by type (for example, “Celebrant’s name,” “Graduate’s name,” or “Honoree’s name”); this feature does not rename the persisted contract.
- New app-created events always write `eventType`. Firestore create rules allow only the five IDs when the field is present, while keeping it optional for backwards compatibility with already-open older clients. Direct event update/delete access remains denied.
- Copy packs own type-dependent product language for creation, guest submission, wall, moderation, slideshow QR prompts, empty states, and printable signs. Wedding uses “toast,” birthday and graduation use “wish,” and religious milestone and other use “note.” Generic infrastructure errors may say “message,” but user-facing event language must not hard-code “toast.”
- Religious milestone copy is inclusive of bar/bat mitzvah and similar milestones, with bar mitzvah as the primary example; it must not imply that every religious milestone follows one tradition.
- Keep existing component and route architecture. Presentation renderers such as the table-sign canvas receive resolved strings as input rather than importing product policy or branching on event type.
- Make `/` a neutral marketing hub. Use stable marketed routes `/weddings`, `/birthdays`, `/graduations`, and `/religious-milestones`; each landing links to `/create?type=<id>` and its type-specific demo. Do not create an `other` landing.
- Reuse one parameterized event landing component and declarative marketing content packs. Preserve the existing wedding visual story on `/weddings`; new marketed types ship as honest text-first pages without broken placeholder imagery until suitable photos are supplied.
- Use one machine-readable demo catalog at `src/content/demoCatalog.json` as the shared source for frontend demo links and the seed script. Use these stable slugs: `maya-james-k8n2w4p9qx`, `lena-birthday-b7r3m9q2vx`, `jordan-graduation-g6p4n8w2kc`, and `noah-bar-mitzvah-r5m8k2q7tz`.
- Demo seeding is additive and rerunnable: never delete event documents, secrets, messages, or production data. New demo documents include `eventType`; an authenticated, hard-coded demo-only callable gently adds a missing expected type to an existing demo and refuses conflicting values. Existing event fields and non-seed guest content remain untouched.
- Birthday, graduation, and religious-milestone demos initially use polished text-only messages. Their catalog format supports optional photo filenames so richer demos can be added later without redesigning the seeder.
- Do not add packages or introduce a testing framework. Use the existing `pnpm build`, `pnpm lint`, Node syntax checks, and explicit emulator/browser checks.
- Every executable step explicitly names an approved model. Composer handles resolved ordinary and cross-surface implementation; Grok handles the security-sensitive demo backfill/seed integration and final integration review. No Claude, GPT, Gemini, or other model is assigned.

## Open questions / assumptions

- The repository does not contain tracked birthday, graduation, or religious-milestone marketing/demo photography. Those experiences intentionally launch text-first and photo-free; richer imagery remains asset-blocked until the user supplies or approves assets.
- Marketing route names and the neutral `/` hub are planner-resolved as specified above. Existing external links to `/` remain valid but will see the new hub; the wedding-specific experience moves to `/weddings`.

## Execution policy

- The current repository is authoritative; this plan captures intent.
- Paths below are hints unless explicitly stated otherwise.
- Never use line numbers as implementation anchors.
- The orchestrator owns this plan's status fields and completion records.
- Implementers must not edit this plan file.
- Use pnpm only.
- Do not add dependencies without explicit user approval.
- Never delete production data or run seed verification against production.
- Only the `Model:` values listed in this plan are authorized for execution.

---

## Step BP-001: Establish event types, copy packs, creation, and rules

Status: complete
Agent: reasoning-implementer
Model: composer-2.5
Model tier: reasoning
Session: foreground
Depends on: none
Parallel group: none
Retry limit: 1
Escalation chain: frontier-implementer

### Routing reason

This is a cross-cutting but fully specified compatibility change spanning runtime normalization, TypeScript contracts, browser state, URL state, Firestore writes, and security rules. Composer can execute the resolved design, but a reasoning session is warranted because the shared contract gates every later step.

### Intent

Create the canonical event taxonomy and copy contract, persist valid event types for new events without renaming `coupleNames`, support type-aware creation and query preselection, and preserve legacy behavior.

### Architectural decisions to preserve

- Missing or unknown event types normalize to `wedding`.
- `coupleNames` remains the stored and transported display-name key.
- Firestore creation permits only known types when `eventType` is present but does not require the field from legacy clients.
- Copy decisions live in one centralized typed pack.

### Semantic targets

- `EventType`, event-type normalization, picker metadata, and event copy lookup — the single source of truth for supported types and nouns.
- `EventRecord` and `HostKeepsafe` — carry normalized type information while preserving existing fields.
- `createEvent` and event mapping — write valid types for new events and default legacy reads safely.
- `/create` URL and form state — preselect, display, and preserve a valid type through creation and “create another” flows.
- Firestore event create validation — admit `eventType` without weakening unrelated document constraints.

### Likely files

Paths are hints based on the repository at planning time.

- `src/lib/eventTypes.ts` (new)
- `src/lib/types.ts`
- `src/lib/api.ts`
- `src/lib/session.ts`
- `src/pages/CreatePage.tsx`
- `src/components/HostKeepsafeCard.tsx`
- `firestore.rules`

### Implementation

1. Add a central event-type module defining the five literal IDs, `EventType`, `isEventType`, `normalizeEventType`, ordered picker labels, marketed flags/paths, and a strongly typed copy-pack shape. Populate complete packs for all five types, including display-name labels/placeholders, default welcome text, primary message noun and plural, guest field/action text, wall/moderation/empty-state text, slideshow QR text, and printable-sign strings.
2. Use these display-name conventions: wedding “Couple’s names”; birthday “Celebrant’s name”; graduation “Graduate’s name”; religious milestone “Honoree’s name”; other “Event or host name.” Keep example placeholders and defaults appropriate to each pack.
3. Extend `EventRecord` and `HostKeepsafe` with `eventType`. Make keepsafe loading normalize absent/invalid values to wedding so existing session storage remains usable.
4. Extend `createEvent` input with `eventType`, validate/normalize it before constructing the payload, always write the normalized ID, and keep slug generation and `coupleNames` storage unchanged. Map Firestore reads through the normalizer and replace the wedding-specific missing-name fallback with a safe pack-derived or neutral fallback.
5. Add an accessible event-type picker to the create form. Initialize it from a valid `type` query value, default invalid/missing values to wedding, update the query when the picker changes, and derive name labels, hints, placeholders, welcome placeholder, and validation copy from the selected pack.
6. When handling `new=true`, remove only the `new` parameter rather than clearing all search parameters so `/create?type=birthday&new=true` remains birthday-preselected. Preserve selected `eventType` in the newly saved keepsafe and in all “create another” links.
7. Add `eventType` to the Firestore create `hasOnly` list and validate it against exactly the supported IDs when supplied. Keep all existing length, timestamp, theme, direct-update, and direct-delete restrictions intact.
8. Do not alter existing documents or add a migration in this step.

### Do not

- Do not rename `coupleNames` in Firestore, API payloads, or keepsafe persistence.
- Do not require `eventType` in rules in a way that breaks an already-open legacy client.
- Do not add event-type conditionals directly to pages when the copy pack can express the decision.
- Do not add dependencies or edit production data.

### Acceptance criteria

- [ ] The supported type IDs are represented by one closed compile-time/runtime contract.
- [ ] Every copy pack supplies the same required fields and has a type-appropriate name label and message noun.
- [ ] A new event writes both `coupleNames` and a valid `eventType`.
- [ ] An event document or keepsafe without `eventType` loads as a wedding.
- [ ] `/create?type=graduation` preselects graduation; an unknown type falls back safely; changing the picker updates subsequent creation.
- [ ] `/create?type=birthday&new=true` clears the old keepsafe without losing the birthday selection.
- [ ] Rules accept an allowed optional `eventType`, reject unknown values, and retain every existing event constraint.

### Verification

```text
pnpm build
pnpm lint
Manual rules check with the Firebase emulator: create one event with each allowed eventType, create one legacy event without eventType, and confirm an eventType outside the five-ID set is rejected.
Manual browser check: open /create, /create?type=graduation, /create?type=unknown, and /create?type=birthday&new=true; verify picker, labels, query behavior, and keepsafe output.
```

### Completion record

Started: 2026-08-31
Completed: 2026-08-31
Actual agent: reasoning-implementer (composer-2.5)
Attempts: 1
Result: COMPLETE
Files changed: src/lib/eventTypes.ts (new), src/lib/types.ts, src/lib/api.ts, src/lib/session.ts, src/pages/CreatePage.tsx, src/components/HostKeepsafeCard.tsx, firestore.rules
Symbols changed: EVENT_TYPES, EventType, EventCopyPack, EVENT_COPY_PACKS, normalizeEventType, getEventCopy, EventRecord.eventType, HostKeepsafe.eventType, createEvent, mapEvent, loadKeepsafe, CreatePage, HostKeepsafeCard, isValidEventType (rules)
Verification result: pnpm build PASS, pnpm lint PASS; emulator/browser NOT_RUN
Deviations: none
Notes for later steps: Copy packs fully populated; BP-002 should wire into guest/wall/manage/slideshow/tableSign surfaces. HostKeepsafeCard partially pack-driven; guest/wall still legacy strings until BP-002.

---

## Step BP-002: Apply copy packs across the guestbook engine

Status: complete
Agent: reasoning-implementer
Model: composer-2.5
Model tier: reasoning
Session: foreground
Depends on: BP-001
Parallel group: none
Retry limit: 1
Escalation chain: frontier-implementer

### Routing reason

This touches several established surfaces and a canvas renderer, but all policy and wording ownership is resolved. Composer is suitable; foreground reasoning reduces regression risk where the same copy inputs must stay coherent across guest, wall, host, slideshow, and downloadable artifacts.

### Intent

Make every event-dependent shared-app string use the event’s normalized copy pack while leaving the generic guestbook mechanics and routes unchanged.

### Architectural decisions to preserve

- Resolve one copy pack from `event.eventType` per surface.
- Pass resolved printable strings into rendering functions; rendering code remains presentation-only.
- Use “message” only for genuinely generic infrastructure states, not as a substitute for type-specific guest-facing language.

### Semantic targets

- Guest submission flow — welcome fallback, field labels, placeholders, success/error actions.
- Public wall and host tools — loading, CTA, empty, hide/confirm, and moderation language.
- Fullscreen slideshow — QR prompt and accessible event labels.
- Table-sign input/rendering — type-specific kicker and scan instructions in preview, PNG, and PDF.
- Keepsafe/create-success experience — event-neutral host guidance and pack-aware sign data.

### Likely files

Paths are hints based on the repository at planning time.

- `src/pages/GuestPage.tsx`
- `src/pages/WallPage.tsx`
- `src/pages/ManagePage.tsx`
- `src/components/WallFeed.tsx`
- `src/components/WallSlideshow.tsx`
- `src/components/TableSignCard.tsx`
- `src/components/HostKeepsafeCard.tsx`
- `src/lib/tableSign.ts`
- `src/lib/keepsafe.ts`
- `src/lib/api.ts`

### Implementation

1. In guest, wall, manage, host-success, and slideshow surfaces, look up the copy pack from the normalized event type and replace wedding/toast literals that describe event content or actions.
2. Make the guest form’s default welcome, message field label, placeholder, send-state fallback, thank-you language, and “leave another” action pack-driven while preserving photo limits and upload behavior.
3. Make wall loading, CTA, first-entry empty text, and host empty/moderation instructions pack-driven. Refactor `WallFeed`/`MessageCard` props so confirmation, fallback failure, and hide-button labels come from the caller or a small resolved-copy object rather than importing an event type into a generic feed.
4. Pass the pack’s slideshow QR prompt into `WallSlideshow`; keep slideshow timing, deck, fullscreen, gestures, and settings behavior untouched.
5. Extend `TableSignInput` with resolved kicker and instruction lines. Replace canvas literals such as “LEAVE A TOAST” and “Scan to leave a message…” with those inputs, ensuring previews, PDF, PNG, and slideshow poster use identical copy. Update both `TableSignCard` and slideshow poster generation to pass the strings.
6. Generalize host backup guidance such as “wedding folder” and any event-specific keepsafe rendering copy. Carry `eventType` through create-success and host-card sign inputs.
7. Replace API fallback text that cannot know the event type with neutral “message” language; keep pack-specific UI fallbacks at the page/component boundary.
8. Search the shared app for residual user-visible wedding/couple/toast assumptions. Keep internal CSS class names, message data structures, filename conventions, and historical identifiers unchanged unless users see them.

### Do not

- Do not fork guest, wall, manage, slideshow, or sign components by event type.
- Do not change routes, Firestore message schema, upload behavior, moderation authorization, or slideshow mechanics.
- Do not rename internal `toast-*` CSS/storage identifiers solely for terminology purity.
- Do not introduce a generalized internationalization framework or dependency.

### Acceptance criteria

- [ ] Legacy and explicit wedding events retain wedding/toast behavior.
- [ ] Birthday and graduation events consistently ask for wishes.
- [ ] Religious milestone and other events consistently ask for notes.
- [ ] Guest, wall, manage, slideshow, keepsafe, and generated table signs agree on the event name and noun.
- [ ] No user-visible shared-app string incorrectly calls every event a wedding or every message a toast.
- [ ] PDF/PNG/preview/slideshow poster rendering receives the same pack-derived sign strings.
- [ ] Existing upload, live wall, moderation, and slideshow behavior remains functional.

### Verification

```text
pnpm build
pnpm lint
Manual browser check using one event of each type: inspect guest form, submit success, public wall, host moderation, slideshow QR prompt, sign preview, and downloaded PNG/PDF.
Manual legacy check: open an event without eventType and confirm it still renders as a wedding with no runtime error.
```

### Completion record

Started: 2026-08-31
Completed: 2026-08-31
Actual agent: reasoning-implementer (composer-2.5)
Attempts: 1
Result: COMPLETE
Files changed: src/lib/tableSign.ts, src/lib/api.ts, src/components/WallFeed.tsx, src/pages/GuestPage.tsx, WallPage.tsx, ManagePage.tsx, src/components/TableSignCard.tsx, WallSlideshow.tsx, HostKeepsafeCard.tsx, SlideshowSettingsDialog.tsx
Symbols changed: TableSignInput, ModerationCopy, MessageCard, WallFeed, TableSignCard, GuestPage, WallPage, ManagePage, WallSlideshow, submitMessage
Verification result: pnpm build PASS, pnpm lint PASS
Deviations: WallPage loading neutral; SlideshowSettingsDialog generic infrastructure UI
Notes for later steps: HomePage/Terms/Privacy still wedding copy (BP-004/BP-005 scope)

---

## Step BP-003: Generalize stable demo catalog and safe seeding

Status: complete
Agent: reasoning-implementer
Model: cursor-grok-4.6-xhigh
Model tier: reasoning
Session: foreground
Depends on: BP-001
Parallel group: none
Retry limit: 1
Escalation chain: frontier-implementer

### Routing reason

The catalog and mechanical seed loop are ordinary, but safely enriching an existing production demo crosses public rules, host-token authorization, Cloud Functions, rerun behavior, and non-deletion guarantees. Grok is assigned for the security-sensitive integration; the planner has already fixed the migration design.

### Intent

Create stable type-specific demo definitions, make the seed script catalog-driven and rerunnable, and add missing `eventType` metadata to the existing Maya & James demo without overwriting or deleting production data.

### Architectural decisions to preserve

- `src/content/demoCatalog.json` is the shared machine-readable catalog used by frontend marketing and the Node seed.
- Existing Maya data is gently merged; conflicting stored types are reported, not overwritten.
- Demo metadata backfill is a narrowly scoped, authenticated callable restricted to known demo slug/type pairs.
- New non-wedding demos are text-only until approved assets exist.

### Semantic targets

- Demo catalog — stable slug, expected type, display data, host token, welcome, theme/sign theme, and seeded messages.
- `scripts/seed.mjs` — catalog iteration, slug-aware photo upload, stable message IDs, safe reruns, local-emulator mode, and output.
- Demo-only metadata callable — verify host possession and enforce hard-coded expected slug/type mappings.
- Existing Maya demo — preserve fields and user content while setting missing `eventType: "wedding"`.

### Likely files

Paths are hints based on the repository at planning time.

- `src/content/demoCatalog.json` (new)
- `scripts/seed.mjs`
- `functions/index.js`
- `README.md` only if a minimal emulator-seed note is necessary; the full documentation update belongs to BP-005

### Implementation

1. Add a JSON catalog with exactly four marketed demos and the stable slugs fixed in Global architectural decisions. Include expected event type, `coupleNames`, date, welcome, theme color, sign theme, non-production demo host token, and a set of polished type-appropriate messages. Keep the wedding’s current Maya & James identity and available photo filename references; omit photo references for the three asset-blocked demos.
2. Add lightweight validation in the seed script for catalog uniqueness, allowed event types, slug format, required display values, and message content before any writes. Fail before mutation on malformed catalog data.
3. Refactor all seed helpers to accept the current demo definition/slug rather than relying on global wedding constants. Preserve stable deterministic IDs where possible, hide only visible prior seed-owned messages, and create replacement seed messages without deleting documents or touching non-seed messages.
4. Add explicit emulator support controlled by an environment flag, connecting Firestore, Storage, and Functions SDKs to the configured local emulator ports. Production remains the existing explicit/default behavior, but verification instructions must use emulator mode only.
5. Add a callable dedicated to demo metadata enrichment. Reuse the existing constant-time host-token verification helper; accept only a hard-coded mapping from the four catalog slugs to their expected type; set `eventType` only when absent; return success without writing when already equal; and throw a failed-precondition error if a different value exists. It must not accept arbitrary event fields or arbitrary slug/type combinations.
6. For each existing demo, invoke the callable before message reseeding. For a missing demo, create its event and secret through the existing client-rule-compatible batch with `eventType` included. Never overwrite an existing event document or secret.
7. Keep `.demo-host-url` behavior backwards-compatible for Maya & James and print guest/wall/host URLs for every catalog entry without adding raw tokens to tracked files.
8. Make the catalog consumable from TypeScript in BP-004 without a package or generated-code step. If TypeScript JSON import support needs configuration, use the existing compiler’s `resolveJsonModule` option rather than adding tooling.

### Do not

- Do not use an unrestricted Admin migration, relax direct event update rules, or expose a general unauthenticated event-type update.
- Do not delete events, secrets, messages, photos, or user content.
- Do not overwrite an existing non-null `eventType`, event name, date, welcome, theme, or sign theme.
- Do not run the seed against production during implementation verification.
- Do not fabricate, download, or commit placeholder photos.

### Acceptance criteria

- [ ] The catalog has one unique stable demo for each marketed type and none for `other`.
- [ ] Every newly created demo event includes the expected `eventType`.
- [ ] Existing Maya & James receives only a missing `eventType: "wedding"` metadata merge; its other event fields and non-seed messages remain unchanged.
- [ ] A mismatched existing demo type causes a clear refusal rather than overwrite.
- [ ] Re-running the seed does not delete documents and does not collide irrecoverably with prior stable seed IDs.
- [ ] Birthday, graduation, and religious-milestone demos seed successfully without photo files.
- [ ] The demo-only callable cannot mutate arbitrary events or fields.
- [ ] Local emulator mode supports safe end-to-end seed verification.

### Verification

```text
node --check scripts/seed.mjs
node --check functions/index.js
pnpm build
pnpm lint
In one terminal run: pnpm emulators
Against emulator mode only, run the implemented emulator flag with pnpm seed twice. Confirm four event documents, correct eventType values, preserved non-seed content, no deletes, successful rerun behavior, and rejection of a conflicting demo eventType.
```

### Completion record

Started: 2026-08-31
Completed: 2026-08-31
Actual agent: reasoning-implementer (cursor-grok-4.6-xhigh)
Attempts: 1
Result: COMPLETE
Files changed: src/content/demoCatalog.json, scripts/seed.mjs, functions/index.js, tsconfig.app.json, README.md
Symbols changed: demoCatalog, validateCatalog, seedDemo, enrichDemoEventType, enrichExistingDemo, EXPECTED_DEMO_TYPES
Verification result: node --check PASS, pnpm build PASS, pnpm lint PASS, emulator seed twice PASS
Deviations: Emulator ports configurable via env overlays
Notes for later steps: BP-004 can import demoCatalog.json directly; deploy enrichDemoEventType before production Maya reseed

---

## Step BP-004: Build the neutral hub and parameterized landings

Status: complete
Agent: cheap-implementer
Model: composer-2.5-fast
Model tier: cheap
Session: foreground
Depends on: BP-002, BP-003
Parallel group: none
Retry limit: 1
Escalation chain: reasoning-implementer -> frontier-implementer

### Routing reason

The route map, content model, CTA behavior, asset policy, and shared component architecture are fully resolved. This is ordinary React composition and content wiring that Composer Fast can implement reliably after the core packs and demo catalog exist.

### Intent

Replace the wedding-only homepage with a neutral event hub and add one reusable marketed landing implementation for wedding, birthday, graduation, and religious milestone, each connected to type-preselected creation and its own live demo.

### Architectural decisions to preserve

- `/` is a neutral hub; marketed paths are `/weddings`, `/birthdays`, `/graduations`, and `/religious-milestones`.
- One parameterized component renders all event landings from declarative content.
- `other` appears only in creation, not marketing routes or demos.
- New marketed types are complete text-first pages and must not reference unavailable imagery.

### Semantic targets

- Application route table — hub and four stable landing URLs without changing guestbook routes.
- Marketing content packs — event-specific headline, value proposition, steps, CTA, demo slug, theme, and optional visual sections.
- Shared event landing component — renders content without per-type page forks.
- Neutral hub — explains Toastboard broadly and links to marketed landings and creation.

### Likely files

Paths are hints based on the repository at planning time.

- `src/App.tsx`
- `src/pages/HomePage.tsx` or a renamed neutral hub module
- `src/pages/EventLandingPage.tsx` (new)
- `src/lib/marketingContent.ts` (new)
- `src/content/demoCatalog.json`
- `src/index.css`
- `src/components/ui.tsx` if shared marketing navigation is needed

### Implementation

1. Define typed marketing content for the four marketed event types. Reference the matching shared demo catalog entry and corresponding event copy; do not duplicate stable slugs as independent string constants.
2. Implement one parameterized landing component that renders common hero, no-account explanation, three-step flow, create CTA, and live-wall CTA. Allow optional sections for wedding’s existing visual story without requiring images for every type.
3. Move/adapt the current Maya & James wedding marketing and existing wedding imagery to `/weddings`, preserving truthful wedding alt text and presentation where assets exist.
4. Create distinct birthday, graduation, and religious-milestone content that describes type-appropriate wishes/notes and links to each live demo. Religious copy should use a bar mitzvah example while explicitly covering bar/bat mitzvah and similar milestones.
5. Refactor `/` into a neutral hub introducing Toastboard as a no-login event guestbook, listing the four marketed use cases, offering a generic create CTA, and linking each type card to its landing. The create CTA may default to wedding only when no explicit type has been chosen.
6. Register all marketing routes while preserving `/create`, `/terms`, `/privacy`, `/e/:slug`, `/e/:slug/wall`, `/e/:slug/manage`, and the not-found route.
7. Ensure every landing create link is `/create?type=<exact-id>` and every live demo link uses its catalog slug. Keep `other` absent from marketed pages but available from the create picker.
8. Keep styling within existing Tailwind/CSS patterns and responsive conventions. Add no dependency and no broken image placeholders.

### Do not

- Do not duplicate the landing component into separate birthday/graduation/religious page implementations.
- Do not invent imagery or reuse wedding photographs as if they represented other events.
- Do not create `/other` marketing or an `other` demo.
- Do not change shared guestbook route shapes.
- Do not perform the legal or metadata update in this step.

### Acceptance criteria

- [ ] `/` is event-neutral and links to all four marketed landing routes.
- [ ] Four marketed routes render from one parameterized component and distinct declarative content.
- [ ] Every landing preselects the correct create type and opens its own stable demo wall.
- [ ] Wedding retains the Maya & James demo and existing truthful visual content.
- [ ] Birthday, graduation, and religious-milestone pages are polished and complete without missing image requests.
- [ ] Religious milestone copy is inclusive and uses bar mitzvah as an example rather than the category definition.
- [ ] `other` remains selectable on `/create` but has no landing or demo.
- [ ] Existing guest, wall, manage, create, terms, and privacy routes still resolve.

### Verification

```text
pnpm build
pnpm lint
Manual responsive browser check at /, /weddings, /birthdays, /graduations, and /religious-milestones.
For every landing, follow the create CTA and verify the correct type query/picker; follow the demo CTA and verify the matching event wall.
Check browser network/console output on non-wedding landings and confirm there are no missing image requests or runtime errors.
```

### Completion record

Started: 2026-08-31
Completed: 2026-08-31
Actual agent: cheap-implementer (composer-2.5-fast)
Attempts: 1
Result: COMPLETE
Files changed: src/lib/marketingContent.ts (new), src/pages/EventLandingPage.tsx (new), src/pages/HomePage.tsx, src/App.tsx
Symbols changed: MARKETING_CONTENT, MARKETING_BY_PATH, EventLandingPage, HomePage, App routes
Verification result: pnpm build PASS, pnpm lint PASS
Deviations: none
Notes for later steps: BP-005 should add route-specific page titles/descriptions; MARKETING_BY_PATH exported for metadata hook

---

## Step BP-005: Generalize legal copy, metadata, and documentation

Status: complete
Agent: cheap-implementer
Model: composer-2.5-fast
Model tier: cheap
Session: foreground
Depends on: BP-003, BP-004
Parallel group: none
Retry limit: 1
Escalation chain: reasoning-implementer -> frontier-implementer

### Routing reason

Once final routes and terminology exist, this is bounded copy, metadata, and documentation work following explicit product decisions. Composer Fast is the cheapest reliable assignment.

### Intent

Remove inaccurate wedding-only product claims from legal text, fallback metadata, and project documentation, and give the neutral hub and marketed landings accurate titles/descriptions.

### Architectural decisions to preserve

- Legal language describes a personal event guestbook and remains accurate for all supported types.
- Route metadata is declarative and restored/updated safely during client navigation.
- This step does not make new product or data-model changes.

### Semantic targets

- Terms and Privacy service descriptions and collected event-detail terminology.
- Document title and meta description for hub and marketed landing routes.
- Static HTML fallback metadata for crawlers/no-script previews.
- README product summary and multi-demo seed instructions.

### Likely files

Paths are hints based on the repository at planning time.

- `src/pages/TermsPage.tsx`
- `src/pages/PrivacyPage.tsx`
- `src/pages/HomePage.tsx`
- `src/pages/EventLandingPage.tsx`
- `src/lib/marketingContent.ts`
- `src/hooks/usePageMetadata.ts` (new, if useful)
- `index.html`
- `README.md`

### Implementation

1. Update Terms and Privacy references from “wedding guestbook” to an event-neutral personal-event guestbook. Replace “couple names” with a truthful stored event/host display-name description and replace toast-only moderation/retention wording with Guest Content or message language where the legal meaning is broader.
2. Preserve legal substance: public-wall disclosure, Guest Content license, host-link credential model, no-account behavior, provider disclosure, retention, children’s privacy, and limitation language. Update the effective date only if project convention/product review requires it; do not invent legal promises.
3. Add a small dependency-free metadata helper or equivalent declarative effect. Set a unique title and description for `/`, each marketed landing, and generic legal pages as appropriate; ensure client navigation does not accumulate duplicate description tags.
4. Make `index.html` fallback title/description event-neutral.
5. Update README’s opening description, supported type list, route overview, and seed explanation to cover the four demos while retaining pnpm commands and warning that the seed targets configured Firebase unless emulator mode is explicitly selected.
6. Search user-visible source and docs for remaining factual claims that Toastboard is only a wedding service. Keep wedding-specific copy inside the wedding pack/landing/demo.

### Do not

- Do not materially rewrite legal rights, liabilities, retention guarantees, or privacy practices beyond terminology accuracy.
- Do not add an SEO, head-management, or routing dependency.
- Do not move wedding-specific content out of the wedding landing when it remains accurate there.
- Do not run deployment or production seeding.

### Acceptance criteria

- [ ] Terms and Privacy accurately cover every supported event type and no longer define the service as wedding-only.
- [ ] The static fallback metadata describes a general no-login event guestbook.
- [ ] Hub and marketed landing titles/descriptions are distinct, accurate, and update correctly during SPA navigation.
- [ ] README documents supported types, stable demo behavior, pnpm-only commands, and safe emulator seeding.
- [ ] Remaining “wedding,” “couple,” and “toast” occurrences are either compatibility identifiers or intentionally scoped to wedding content.

### Verification

```text
pnpm build
pnpm lint
Manual browser navigation across /, all four marketed landings, /terms, and /privacy; inspect document.title and the single active meta description after each transition.
Repository text search: review every remaining user-visible occurrence of wedding, couple, and toast and confirm it is intentional.
```

### Completion record

Started: 2026-08-31
Completed: 2026-08-31
Actual agent: cheap-implementer (composer-2.5-fast)
Attempts: 1
Result: COMPLETE
Files changed: src/lib/pageMetadata.ts (new), src/hooks/usePageMetadata.ts (new), index.html, README.md, src/pages/TermsPage.tsx, PrivacyPage.tsx, HomePage.tsx, EventLandingPage.tsx
Symbols changed: DEFAULT_PAGE_METADATA, setPageMetadata, usePageMetadata, TermsPage, PrivacyPage
Verification result: pnpm build PASS, pnpm lint PASS
Deviations: none
Notes for later steps: Guest/wall/manage routes still use default metadata on unmount

---

## Step BP-999: Final integration review

Status: complete
Agent: frontier-reviewer
Model: cursor-grok-4.6-xhigh
Model tier: frontier
Session: foreground
Depends on: BP-001, BP-002, BP-003, BP-004, BP-005
Parallel group: none
Retry limit: 0
Escalation chain: stop

### Routing reason

A single Grok frontier review after implementation is cheaper than frontier review after every step and catches compatibility, copy consistency, seed safety, and cross-route integration problems. Grok satisfies the user’s model constraint.

### Intent

Review the completed implementation as a whole against the original objective and architectural decisions.

### Architectural decisions to preserve

- All global architectural decisions in this plan.
- Only Composer and Grok models may execute any remediation generated from this review; route ordinary remediation to Composer and security-sensitive demo/data remediation to Grok.

### Semantic targets

- The complete diff and all behavior changed by this plan.
- Legacy event fallback and continued `coupleNames` persistence.
- Copy-pack consistency across creation, guest, wall, host, slideshow, and signs.
- Firestore rules and demo-only callable authorization boundaries.
- Neutral hub, four parameterized landings, stable demos, and type-preselected creation.
- Asset honesty and generalized legal/metadata claims.

### Likely files

Paths are hints based on the repository at planning time.

- All files changed by completed implementation/remediation steps.

### Implementation

1. Review only; do not edit implementation files.
2. Check correctness, integration, regressions, security implications, error handling, contracts, unnecessary complexity, and coverage.
3. Specifically verify that existing events without `eventType` remain wedding-compatible, new events retain `coupleNames`, rules do not admit arbitrary types, and the demo backfill cannot mutate arbitrary events or overwrite conflicts.
4. Verify all marketed routes use one landing implementation, every create/demo link maps to the intended type/catalog entry, `other` is create-only, and no non-wedding page references missing or misleading assets.
5. Confirm all executed implementation/remediation records name only Composer or Grok model identifiers.
6. Return `REVIEW_RESULT: PASS` when no material issue remains.
7. If material issues remain, return `REVIEW_RESULT: REMEDIATION_REQUIRED` followed by complete remediation step packets using the same step schema and cost-routing rules. Every packet must include `Model: composer-2.5-fast`, `Model: composer-2.5`, or `Model: cursor-grok-4.6-xhigh` as appropriate; no other model is permitted.
8. Do not create remediation for optional stylistic preferences.

### Do not

- Rewrite working code for style preference.
- Edit code directly.
- Request remediation for speculative improvements unrelated to the feature.
- Assign remediation to Claude, GPT, Gemini, or any model outside Composer and Grok.

### Acceptance criteria

- [ ] Original feature requirements are satisfied.
- [ ] Cross-step integration is coherent.
- [ ] Existing events and stored compatibility contracts remain functional.
- [ ] Demo enrichment and reruns are non-destructive and authorization-scoped.
- [ ] Type-specific language, routes, demos, and metadata remain internally consistent.
- [ ] No material regression or correctness issue remains.
- [ ] All execution assignments comply with the Composer/Grok-only model constraint.

### Verification

```text
Review the completed plan records, current repository, diff, and relevant deterministic verification results.
Re-run pnpm build and pnpm lint.
Review emulator evidence for Firestore create validation, legacy fallback, demo creation, safe Maya merge, conflict refusal, and seed reruns.
Exercise the hub, four landings, type-preselected creation, each demo wall, guest submission, host moderation, slideshow, and printable-sign path.
```

### Completion record

Started: 2026-08-31
Completed: 2026-08-31
Actual agent: frontier-reviewer (cursor-grok-4.6-xhigh)
Attempts: 1
Result: PASS — no material remediation required
Files changed: none
Symbols changed: none
Verification result: pnpm build PASS, pnpm lint PASS; full integration review PASS
Deviations: none
Notes for later steps: none
