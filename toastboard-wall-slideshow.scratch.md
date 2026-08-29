<!-- BIG-PLAN:1 -->
# Big Plan: Toastboard wall slideshow

Plan status: blocked
Review cycle: 2
Max review cycles: 2

## Objective

Replace the current lightweight “Present on a screen” wall state with a fullscreen, theme-aware slideshow on `/e/:slug/wall`. The slideshow must continue consuming the live Firestore message feed without changing an in-flight slide, rotate all photos within one shuffled guestbook entry before moving to another entry, provide accessible local display settings, render a printable-sign poster when the deck is empty, and securely persist the selected sign theme for every event.

## Original request

- Add slideshow mode to `/e/:slug/wall`, entered from the normal live wall by a theme-matched button. The slideshow requests browser fullscreen from that user gesture, puts all slideshow controls and the settings dialog inside the fullscreen element, visibly offers “Exit slideshow,” and leaves slideshow mode whenever fullscreen ends.
- Slideshow replaces the existing `present`/“Present on a screen” behavior; do not keep parallel presentation modes.
- Escape closes settings first and only then exits slideshow. The settings dialog must trap focus, restore focus when closed, pause slide timing while open, and use large touch/remote-friendly duration presets (`5s`, `8s`, `12s`, `20s`) instead of a slider.
- Persist duration and motion style as per-slug `localStorage` display preferences. Motion style lets the user choose a fixed classy style for the show or random enter animation per slide. Honor `prefers-reduced-motion` with a fade or cut.
- Use the approved `motion` package imported from `motion/react`. Keep the product to one featured entry at a time with tasteful fade/zoom/lift/swing-like transitions; do not copy the demo’s orbiting deck, thumbs, code panel, dark chrome, or play/pause bar.
- Make Wake Lock a best-effort slideshow enhancement so reception tablets do not sleep.
- Persist `signTheme` on event creation as `"classic"`, map it with Classic fallback for legacy events, and provide the picker on both the one-time keepsafe view and ManagePage.
- Theme changes must be host-authenticated with the same possession-of-host-token security model used by moderation. Public clients must never be able to restyle another event. Update Firestore create validation/API to cover `signTheme`; current event rules omit the field and deny all updates.
- Slideshow colors must come only from the selected sign theme palette (`paper`, `ink`, `inkSoft`/quiet surface) plus the event accent, not from the printable sign’s decorative frame art. Always use the selected theme’s paper as the fullscreen background. Theme buttons, exit control, gear, dialog, typography, and QR chrome.
- Keep QR modules dark on a light quiet zone, including Midnight; the existing `qrDataUrl` dark-ink-on-cream output is suitable. Pin QR bottom-left and gear bottom-right above content. Hide QR while empty but retain the gear.
- Text-only entries use a large rounded, padded, shadowed quote card with decorative CSS quote glyphs and `— Name` (`"A guest"` fallback). Do not insert ASCII quote characters into message text. Clamp/scale text up to the existing 1000-character maximum.
- Entries with photos show the photo above the same quote card. Apply only a subtle static photograph treatment: roughly 2–4 degree capped rotation, border/inset top-right highlight, and drop shadow. Photo-only entries omit quote glyphs and retain the attribution.
- Shuffle guestbook entries, not photos. For a multi-photo entry, show every photo in order as successive full-duration slides before taking the next shuffled entry. A one-entry deck must replay its enter animation and/or continue rotating its photos.
- Maintain a frozen current slot `{ messageId, photoIndex, text, guestName, photoUrl }`; never render from `messages[index]`. Live additions and hidden/deleted messages rebuild only the upcoming queue in the background. The current slot receives its full dwell.
- At a transition boundary, skip remaining photos if the current message is no longer live; otherwise advance to its next photo, then consume the next shuffled entry. Re-shuffle current live entries whenever the upcoming queue empties, without touching the in-flight slot.
- Preload current and the next few image candidates with `new Image()`, retaining dimensions/aspect ratio. Hold the previous slide until the next photo loads; if loading fails or storage deletion causes a 404, advance to another candidate.
- When empty, asynchronously render the selected 8.5×11 table sign PNG and center it as a portrait poster with a paper matte on landscape displays; do not stretch it. A blank beat before generation completes is acceptable.
- Use a clear no-blip sparse-deck policy when the first toast arrives or the last is hidden. This plan chooses transition-at-dwell-boundary: an existing empty poster/current toast finishes its selected dwell before changing state.
- Use pnpm only. Motion is the sole newly approved dependency. Avoid unrelated refactors and never delete production data. Existing stack remains React 19, Vite, Firebase Firestore/Storage, Tailwind 4, and TypeScript.

## Global architectural decisions

- Keep `/e/:slug/wall` as the only route. `WallPage` owns normal-wall versus slideshow mode, and a dedicated slideshow component owns all fullscreen presentation UI.
- Keep a stable slideshow root element mounted on `WallPage`. The entry button calls `root.requestFullscreen()` directly from its click handler, then activates slideshow; all content, QR, exit, gear, and dialog render beneath that root so the dialog remains visible in fullscreen.
- Treat Fullscreen API failure as an entry failure: retain the normal wall and show a concise error instead of silently claiming slideshow mode. A `fullscreenchange` listener is authoritative and clears slideshow state when the root is no longer fullscreen.
- Implement Escape handling at document capture phase while slideshow is active. When settings are open, prevent the app-level exit path and close the dialog; otherwise call the normal slideshow exit path. Also handle unavoidable browser-native fullscreen exit through `fullscreenchange`.
- Use a callable Cloud Function for theme updates. It accepts `{ slug, signTheme, hostToken }`, validates the theme allowlist, verifies the plaintext token against the private secret with the existing constant-time hash comparison, and updates only `signTheme` through the Admin SDK.
- Do not place `hostTokenHash` on the publicly readable event document. Because current direct-write rules treat the matching hash as authorization, exposing it on an event would create a reusable credential and let any reader restyle the event. Firestore rules should add `signTheme` to strict event-create validation and continue denying direct client event updates/deletes; the callable function is the host-authenticated update path.
- Centralize the theme picker as a small reusable component, but leave table-sign rendering intact. The keepsafe picker performs the remote update and mirrors success to session storage; ManagePage performs the same remote update and updates its displayed local selection.
- Extend `EventRecord` with a strongly typed `signTheme` and make `mapEvent` normalize unknown/missing values through `getSignTheme(...).id`, yielding Classic for legacy records. New creates and seed data write Classic explicitly.
- Store slideshow preferences under a versioned per-slug key such as `toastboard:slideshow:v1:<slug>`. Validate parsed values against duration `[5000, 8000, 12000, 20000]` and the known motion styles; use `8000` and `"random"` when missing/corrupt.
- Model randomization as entry IDs/snapshots in an upcoming queue. A separate frozen `SlideSlot` is the only render input. Photos are not queue entries: while the current live entry still exists, its next `photoIndex` is promoted to a new frozen slot before another queue entry is consumed.
- On every live message snapshot, atomically replace the upcoming queue with a shuffle of current live entries, excluding the in-flight message while it still has photos/dwell to finish. Do not replace the current slot. At a transition, consult a ref/map of the latest live entries to decide whether the message still exists.
- Prevent immediate repeats where possible by moving the just-finished message away from the head when more than one live entry exists. With one live entry, deliberately produce a new keyed slot cycle so Motion replays the enter animation.
- Make advancement load-aware. Resolve a candidate text slot immediately; resolve a photo slot only after its cached `Image` promise succeeds. While pending, leave the prior slot mounted and do not start a new dwell. On failure, mark that URL failed for the session and advance with a bounded visited-candidate guard so an all-broken deck cannot spin synchronously.
- Preload only the current photo, remaining photos of its entry, and first-photo candidates from the next few queued entries. Cache load status and natural dimensions for object-fit/aspect decisions; clear unreachable cache entries opportunistically rather than preloading the whole guestbook.
- Represent the empty poster as a presentation state governed by the same dwell clock. If the slideshow starts with messages, select the first slot immediately (subject to image loading). If it starts empty, show/generate the poster. A first arrival waits for the current empty dwell boundary; removal of the last entry similarly leaves the frozen toast through its dwell and enters empty at the boundary.
- Pause means preserving remaining dwell time, not restarting a full interval. The deck controller records the deadline/remaining milliseconds when settings opens, then resumes the remainder after close.
- Use CSS custom properties on the slideshow root for selected `paper`, `cream`, `ink`, `inkSoft`, accent, and display font. Use Figtree for Modern and Fraunces-forward typography for the other current sign themes, following the existing table-sign typography convention without copying canvas ornamentation.
- Keep motion variants declarative in the slideshow view. Fixed choices are `fade`, `zoom`, `lift`, and `swing`; `random` chooses one for each newly promoted slot. Reduced-motion overrides all choices to a short opacity fade or a cut.
- Request `navigator.wakeLock.request("screen")` only after slideshow entry, release it on exit/unmount, and best-effort reacquire after `visibilitychange` when the document becomes visible. Failure is non-fatal.
- Generate the empty poster through existing `renderTableSignPng(..., true)` using event details, `guestUrl(slug)`, event accent, and persisted `signTheme`. Keep its async lifecycle cancellable and show the theme paper background/matte until ready.
- Keep QR generation on existing `qrDataUrl`; wrap its already light QR image in an additional light quiet-zone card so Midnight chrome remains scannable.
- Add no test framework in this feature. Extract deterministic deck/prefs helpers from React where practical, then use the repository’s real `pnpm lint` and `pnpm build` checks plus focused emulator/browser scenarios.

## Open questions / assumptions

- Browser handling of Escape while fullscreen is user-agent controlled. The app will close the settings dialog first when its key event is delivered, but if a browser reserves Escape and exits fullscreen before page script can cancel it, `fullscreenchange` will correctly exit slideshow as required.
- The feature request’s “same token-hash pattern as hiding a toast” is interpreted as the same host-token possession and SHA-256/constant-time verification model, implemented in the existing trusted callable Functions boundary. Persisting the proof hash on a publicly readable event would be an authorization vulnerability.
- There is no existing automated test runner or Firestore rules test harness. Verification therefore uses current build/lint scripts and explicit local emulator/browser checks without adding an unapproved testing dependency.

## Execution policy

- The current repository is authoritative; this plan captures intent.
- Paths below are hints unless explicitly stated otherwise.
- Never use line numbers as implementation anchors.
- The orchestrator owns this plan's status fields and completion records.
- Implementers must not edit this plan file.

---

## Step BP-001: Establish secure event theme persistence

Status: complete
Agent: reasoning-implementer
Model tier: reasoning
Session: foreground
Depends on: none
Parallel group: none
Retry limit: 1
Escalation chain: frontier-implementer

### Routing reason

This crosses a public Firestore document, private host credential, callable Functions boundary, client mapping, and strict rules. The design is resolved, but security-sensitive integration warrants a reasoning agent.

### Intent

Make `signTheme` a durable, safely mutable event field with Classic defaults for new and legacy events, without exposing a reusable host credential.

### Architectural decisions to preserve

- Theme mutation goes through a callable function that verifies the plaintext host token against `events/{slug}/secrets/host`.
- Direct client updates/deletes of event documents remain denied.
- Event creation and seed data write `"classic"` explicitly; reads normalize missing/invalid values to Classic.

### Semantic targets

- `EventRecord` and `HostKeepsafe` theme contracts — make valid sign-theme identity explicit.
- `createEvent` and `mapEvent` — write and normalize the durable event field.
- Firestore `/events/{slug}` create/update policy — admit only a valid create-time `signTheme`, while preserving update denial.
- Existing callable host-verification flow in `functions/index.js` — reuse credential parsing, SHA-256 comparison, and timing-safe matching for `updateSignTheme`.
- Firebase client services and API facade — expose a typed theme-update call without leaking Functions details into UI.
- Demo seed event — represent the current schema.

### Likely files

Paths are hints based on the repository at planning time.

- `src/lib/types.ts`
- `src/lib/api.ts`
- `src/lib/firebase.ts`
- `src/lib/signThemes.ts`
- `src/pages/CreatePage.tsx`
- `firestore.rules`
- `functions/index.js`
- `scripts/seed.mjs`

### Implementation

1. Add `signTheme: SignThemeId` to `EventRecord`; narrow `HostKeepsafe.signTheme` to `SignThemeId` where compatibility permits while retaining legacy session parsing through `isSignThemeId`.
2. In `createEvent`, always include `signTheme: DEFAULT_SIGN_THEME` in the initial event payload. Return or otherwise propagate Classic so CreatePage saves it in the one-time keepsafe immediately.
3. In `mapEvent`, use `getSignTheme(data.signTheme).id` so missing, malformed, or future-unknown persisted values resolve to Classic rather than leaking an arbitrary string.
4. Update Firestore event-create rules to require `signTheme`, include it in `hasOnly`, and allow only the six current IDs (`classic`, `botanical`, `modern`, `art-deco`, `coastal`, `midnight`). Keep direct event `update, delete` false.
5. Refactor only the necessary credential-checking portion of `functions/index.js` into an internal helper shared by `deleteMessage` and a new `updateSignTheme` callable. Validate slug, token length, and theme allowlist before reads; verify the private stored hash with `timingSafeEqual`; update only `signTheme` using Admin Firestore; return `{ ok: true, signTheme }`.
6. Export a Functions client from the existing initialized Firebase app and add typed `updateEventSignTheme(slug, signTheme, hostToken)` to the API facade using `httpsCallable`. Translate permission/argument failures to the existing friendly host-link/error style.
7. Ensure CreatePage’s saved keepsafe includes Classic. Update the demo seed’s event creation payload with Classic without overwriting or deleting existing production/demo event data.
8. Do not alter public message read/write behavior or the delete function’s storage cleanup semantics while sharing host verification.

### Do not

- Do not persist `hostTokenHash` on the public event document or make it readable through another public path.
- Do not loosen event updates to arbitrary fields or accept arbitrary theme strings.
- Do not overwrite existing events during seed or migration; legacy fallback is the migration strategy.
- Do not add Firebase Authentication or an account system.

### Acceptance criteria

- [ ] Every newly created event document includes `signTheme: "classic"`.
- [ ] Legacy event reads expose `event.signTheme === "classic"` when the field is absent or invalid.
- [ ] A valid host token can update only `signTheme` through the callable API.
- [ ] Invalid tokens and invalid theme IDs cannot update the event.
- [ ] Direct public Firestore event updates remain denied, and event create rules accept the new create payload.
- [ ] Existing message moderation still verifies host credentials and behaves as before.

### Verification

```text
pnpm lint
pnpm build
Manual with `pnpm emulators`: create an event and inspect that signTheme is classic; call updateEventSignTheme with the saved host token and confirm only signTheme changes; repeat with a bad token/invalid theme and confirm denial; attempt a direct Firestore event update and confirm rules reject it.
```

### Completion record

Started: 2026-08-29
Completed: 2026-08-29
Actual agent: reasoning-implementer
Attempts: 1
Result: COMPLETE
Files changed: firestore.rules, functions/index.js, scripts/seed.mjs, src/lib/api.ts, src/lib/firebase.ts, src/lib/types.ts, src/pages/CreatePage.tsx
Symbols changed: EventRecord, HostKeepsafe, createEvent, mapEvent, updateEventSignTheme, updateSignTheme, verifyHostToken, functions
Verification result: pnpm lint PASS, pnpm build PASS, node --check functions/index.js PASS
Deviations: none
Notes for later steps: Public event reads now normalize missing or invalid signTheme values to Classic.

---

## Step BP-002: Wire host theme pickers

Status: complete
Agent: cheap-implementer-bg
Model tier: cheap
Session: background
Depends on: BP-001
Parallel group: slideshow-foundations
Retry limit: 1
Escalation chain: reasoning-implementer -> frontier-implementer

### Routing reason

Once BP-001 fixes the API and type contract, this is ordinary UI extraction and established async CRUD wiring. It is file-disjoint from the deck engine and safe to run in parallel.

### Intent

Give hosts a consistent theme picker on both the one-time keepsafe page and ManagePage, and persist every successful selection to the event.

### Architectural decisions to preserve

- Use a small shared picker for the existing visual choices; do not redesign table-sign generation.
- Both surfaces call the authenticated API from BP-001.
- Keepsafe session state mirrors server-confirmed selection; ManagePage immediately updates its displayed table-sign theme.

### Semantic targets

- Existing “Table sign design” fieldset in `HostKeepsafeCard` — extract/reuse its theme choice UI.
- `HostKeepsafeCard.selectSignTheme` — turn local-only session mutation into authenticated remote mutation with pending/error/rollback behavior.
- ManagePage host-tools/table-sign section — add the same picker and pass selected theme to `TableSignCard`.

### Likely files

Paths are hints based on the repository at planning time.

- `src/components/HostKeepsafeCard.tsx`
- `src/components/SignThemePicker.tsx`
- `src/pages/ManagePage.tsx`
- `src/components/TableSignCard.tsx`
- `src/lib/session.ts`

### Implementation

1. Extract the current six-option table-sign fieldset into a controlled `SignThemePicker` accepting selected ID, accent, disabled/busy state, and `onChange`. Preserve accessible `legend`, descriptions, `aria-pressed`, and visible selection styling.
2. In HostKeepsafeCard, make selection async: keep the prior value, optimistically or pessimistically show the selected/busy state, call `updateEventSignTheme` with `keepsafe.slug` and `keepsafe.hostToken`, then save the successful ID through `saveKeepsafe`. On failure, restore the prior selection and show a non-destructive inline error.
3. In ManagePage, initialize controlled selection from `event.signTheme`, call the same authenticated API using the URL token, update local selection only on success (or roll back on failure), and render status feedback without exposing the token.
4. Pass the selected ID into ManagePage’s `TableSignCard` so its preview/downloads match the persisted choice. Keep the existing event accent behavior.
5. Disable picker choices while a write is pending to avoid out-of-order updates. If implementing optimistic UI, guard responses with the selected request value so stale completions cannot overwrite a newer choice.

### Do not

- Do not retain a second, local-only source of truth for theme selection.
- Do not put the host token in component output, logs, error text, or storage beyond the existing keepsafe/session and manage URL behavior.
- Do not change the selected event accent color or printable sign art.

### Acceptance criteria

- [ ] The keepsafe and ManagePage show the same six theme choices and current persisted selection.
- [ ] A valid selection persists to Firestore and updates the corresponding table-sign preview.
- [ ] Reloading ManagePage retains the choice; reopening the current keepsafe session reflects successful choices.
- [ ] Failed writes show an error and do not leave a false selected state.
- [ ] Rapid interaction cannot produce a stale final UI state.

### Verification

```text
pnpm lint
pnpm build
Manual with `pnpm dev` and the Firebase emulators/project: change theme on the keepsafe page and ManagePage, reload ManagePage, verify the table-sign preview and stored event agree, then use a bad manage token and verify the picker cannot persist a change.
```

### Completion record

Started: 2026-08-29
Completed: 2026-08-29
Actual agent: cheap-implementer-bg
Attempts: 1
Result: COMPLETE
Files changed: src/components/SignThemePicker.tsx (new), src/components/HostKeepsafeCard.tsx, src/pages/ManagePage.tsx
Symbols changed: SignThemePicker, HostKeepsafeCard.selectSignTheme, ManagePage.selectSignTheme, ManagePage signTheme state
Verification result: pnpm lint PASS, pnpm build PASS
Deviations: ManagePage pessimistic selection; HostKeepsafeCard optimistic with rollback
Notes for later steps: ManagePage syncs signTheme from event on load; TableSignCard receives themeId={signTheme}

---

## Step BP-003: Build the live slideshow deck controller

Status: complete
Agent: reasoning-implementer-bg
Model tier: reasoning
Session: background
Depends on: BP-001
Parallel group: slideshow-foundations
Retry limit: 1
Escalation chain: frontier-implementer

### Routing reason

The current-slot snapshot, live queue replacement, multi-photo progression, dwell pause/resume, and asynchronous image-failure behavior form a nontrivial state machine. It is independent of the host picker files and can run concurrently after the shared event contract is stable.

### Intent

Provide a deterministic React-facing controller whose rendered current slot never blips when live Firestore messages change, and whose transitions obey all shuffle, photo, timing, empty-state, and preload rules.

### Architectural decisions to preserve

- The view renders only a frozen `SlideSlot`, never `messages[index]`.
- Live snapshots replace only upcoming work; they never mutate the in-flight slot.
- Entry order shuffles, photos stay ordered within an entry.
- Settings pause preserves remaining dwell.
- Image transitions hold the previous slot until load success and skip failed URLs.
- First-arrival/last-removal changes occur at the active dwell boundary.

### Semantic targets

- Slideshow preference parser/storage contract — versioned per slug and allowlist validated.
- `SlideSlot` snapshot and queue entry model — immutable render data with unique cycle key.
- Deck transition reducer/controller — boundary decisions against the latest live map.
- Image preload cache — status, promise, natural dimensions, failure tracking, and bounded lookahead.
- Empty poster state timing — same clock semantics as content slots.

### Likely files

Paths are hints based on the repository at planning time.

- `src/lib/slideshow.ts`
- `src/hooks/useSlideshowDeck.ts`
- `src/lib/types.ts`

### Implementation

1. Define the explicit contracts: allowed durations in milliseconds, `MotionStyle = "random" | "fade" | "zoom" | "lift" | "swing"`, validated `SlideshowPreferences`, immutable `SlideSlot` containing at least a unique cycle key plus `{ messageId, photoIndex, text, guestName, photoUrl }`, optional loaded dimensions, and an explicit empty/poster state.
2. Implement safe per-slug preference load/save helpers. Catch unavailable/quota/security errors, validate JSON fields, default to 8 seconds/random, and never let storage failure prevent presentation.
3. Implement Fisher–Yates entry shuffling with optional first-item repeat avoidance. Do not expand `photoUrls` into shuffled queue slots.
4. Build the controller around refs or a reducer so timer callbacks always consult the latest live `Map<messageId, MessageRecord>` and upcoming queue without replacing the rendered current snapshot.
5. On initial non-empty entry, shuffle and promote a candidate. For text-only entries, create one slot with `photoUrl: null`/no photo index. For photo entries, create photo index zero, then at each boundary promote the next photo from that same still-live entry before consuming another entry.
6. On every `messages` snapshot, rebuild the upcoming queue in the background from current live entry snapshots. Exclude the active message while it is in flight; include new additions; omit hidden/deleted IDs. If the live list becomes empty, leave the current slot until its deadline. If empty state is active and messages arrive, retain the poster until its deadline.
7. At a deadline, if the current message is no longer live, skip its remaining photos and consume the rebuilt queue. If it is live and has another photo, attempt that photo. Otherwise consume the next queued live entry. When queue candidates are exhausted/stale, reshuffle the latest live entries; with multiple entries avoid immediate repeat, with one entry create a new cycle.
8. Implement a small image cache driven by `new Image()`. Cache `loading/loaded/failed`, promise, `naturalWidth`, and `naturalHeight`. Preload the active URL plus remaining current-entry photos and the first photo of only the next few queue entries.
9. Candidate promotion for a photo awaits cache success while leaving the current slot and timer stopped at its boundary. On failure, mark the URL and advance to the next photo/candidate. Use an asynchronous loop with a bounded number of candidate visits derived from the current live deck, then fall back to empty/error-safe presentation rather than recursively spinning when all images fail.
10. Expose settings-open pause control. Record remaining time from the active deadline, clear the timer, and resume exactly the remainder. Preference duration changes while paused should apply to the next full dwell; if no dwell has elapsed yet, it may safely reset the paused dwell, but document and implement one consistent rule.
11. Expose enough controller state/actions for the view to key Motion transitions, show empty poster, inspect loading state if needed, and update preferences. Keep DOM/fullscreen/Wake Lock concerns out of this controller.

### Do not

- Do not derive the displayed message/photo from an array index.
- Do not mutate the current slot when `messages` changes.
- Do not shuffle individual photos or preload every image in the guestbook.
- Do not shorten the current dwell merely because its live record was hidden.
- Do not allow failed image retries to create a synchronous infinite loop.
- Do not add a new state-management or test dependency.

### Acceptance criteria

- [ ] A multi-photo entry shows all of its photos, in source order, for one full configured dwell each before moving to another shuffled entry.
- [ ] Live add/hide snapshots do not change the current slot or reset its current dwell.
- [ ] A hidden current message skips its remaining photos only after the current dwell.
- [ ] Each exhausted loop reshuffles current live entries and avoids immediate repeats when possible.
- [ ] One-entry decks create repeated keyed cycles; one multi-photo entry continues rotating all photos.
- [ ] Opening settings pauses the exact remaining dwell and closing resumes it.
- [ ] First/last message transitions occur at the current empty/content dwell boundary.
- [ ] The current/near-future images preload, failed URLs are skipped, and all-failed decks do not hang or spin.
- [ ] Corrupt/unavailable localStorage falls back to 8 seconds/random without breaking the slideshow.

### Verification

```text
pnpm lint
pnpm build
Manual controller exercise in the integrated page after BP-004: use 0, 1, and 2+ entries; a 10-photo entry; add/hide during a dwell; hide the active multi-photo entry; change duration with settings open; simulate an image 404; confirm no in-flight slot blips and queue transitions follow the specified boundaries.
```

### Completion record

Started: 2026-08-29
Completed: 2026-08-29
Actual agent: reasoning-implementer-bg
Attempts: 1
Result: COMPLETE
Files changed: src/lib/slideshow.ts, src/hooks/useSlideshowDeck.ts
Symbols changed: SlideshowPreferences, SlideSlot, DeckEntry, SlideImageCache, loadSlideshowPreferences, saveSlideshowPreferences, shuffleEntries, useSlideshowDeck
Verification result: pnpm lint PASS, pnpm build PASS
Deviations: none
Notes for later steps: Pass live from useMessages as hook ready arg; duration changes apply to next full dwell

---

## Step BP-004: Deliver the fullscreen themed slideshow

Status: complete
Agent: reasoning-implementer
Model tier: reasoning
Session: foreground
Depends on: BP-002, BP-003
Parallel group: none
Retry limit: 1
Escalation chain: frontier-implementer

### Routing reason

The visual component is well specified, but coordinating Fullscreen API lifecycle, accessible modal focus, Motion presence, Wake Lock, generated poster, QR quiet zones, and the deck controller is a subtle browser integration best handled by a reasoning agent.

### Intent

Replace Present mode with a polished, accessible, responsive slideshow whose complete UI lives inside the fullscreen element and reflects the persisted sign theme.

### Architectural decisions to preserve

- Slideshow is a mode of the existing wall route, not a new route and not a second presentation system.
- The normal wall remains live before entry; fullscreen success governs activation and `fullscreenchange` governs forced exit.
- All controls and the settings dialog are descendants of the fullscreen root.
- Motion is the only new dependency and is imported from `motion/react`.
- Palette-only theming, light QR quiet zone, portrait empty poster, and transition-at-dwell-boundary policies are fixed.

### Semantic targets

- `WallPage` current `present` state/button/Shell prop — remove and replace with slideshow entry/lifecycle.
- Stable fullscreen root and dedicated slideshow view — contain stage, QR, gear, exit, and dialog.
- Motion variants/selection — classy fixed or per-slide random transitions with reduced-motion override.
- Settings dialog — duration chips, motion chips, focus trap, Escape ordering, timer pause.
- Screen Wake Lock lifecycle — best-effort request/release/reacquire.
- Empty table-sign poster generation — existing renderer with selected event data/theme.
- Slideshow-specific responsive CSS/custom properties — TV, tablet, long text, photo treatment, quiet zones, high z-index.

### Likely files

Paths are hints based on the repository at planning time.

- `package.json`
- `pnpm-lock.yaml`
- `src/pages/WallPage.tsx`
- `src/components/WallSlideshow.tsx`
- `src/components/SlideshowSettingsDialog.tsx`
- `src/index.css`
- `src/lib/signThemes.ts`
- `src/lib/tableSign.ts`
- `src/lib/urls.ts`

### Implementation

1. Install the explicitly approved dependency with `pnpm add motion`; do not add any other package. Import animation primitives/hooks from `motion/react`.
2. Replace `WallPage`’s `present` boolean and “Present on a screen” button with a stable root ref and a theme-matched “Start slideshow” button. Keep the ordinary Shell/WallFeed page before entry.
3. In the entry click handler, call `requestFullscreen()` on the stable root during the user gesture. Activate/render the slideshow only for that root; on rejection/unsupported API, remain in normal wall and expose a concise status error. Avoid a route/navigation change.
4. Subscribe to `fullscreenchange` while active. If `document.fullscreenElement` stops being the root, clear slideshow state, close settings, and release Wake Lock. “Exit slideshow” invokes `document.exitFullscreen()` when appropriate and uses the same cleanup path.
5. Render a dedicated WallSlideshow under the fullscreen root with the live `messages`, slug, full event, selected palette, and exit callback. Pass messages unchanged to the BP-003 controller; render only its frozen current slot/poster state.
6. Set slideshow-root custom properties from `getSignTheme(event.signTheme)` and the existing event accent. Background must be exactly palette paper (aside from optional subtle grain), text/chrome palette ink/inkSoft/cream, accent event color, and font Modern→Figtree or other themes→Fraunces-forward. Do not call printable canvas frame/corner drawing for slideshow chrome.
7. Build the featured content: a centered stage constrained around pinned control quiet zones; photo above the quote card; deterministic small rotation capped between 2 and 4 degrees based on stable slot identity; subtle border, inset top-right highlight, and static drop shadow. Use loaded natural dimensions to choose sensible contain sizing without cropping important portrait/landscape content.
8. Build one shared quote card style for text-only and photo entries with large radius, shadow, responsive heavy padding, and `::before`/`::after` decorative theme-colored quote glyphs. Hide glyphs when `text` is empty. Render raw sanitized message text once, then `— ${guestName || "A guest"}`. Use responsive font sizing plus max-height/overflow line clamp for 1000-character text so controls remain unobscured.
9. Define Motion variants for fade, zoom, lift, and a very restrained swing. For random mode, choose a variant once per promoted slot/cycle and keep it stable through the exit/enter. Use keyed `AnimatePresence` or equivalent so one-entry decks replay. With `useReducedMotion` and CSS `prefers-reduced-motion`, override transform-heavy variants with short fade/cut and disable incidental transforms except the static photo rotation if it remains comfortable.
10. Generate the bottom-left guest QR asynchronously with existing `qrDataUrl(guestUrl(slug))`. Place it in a palette-aware chrome/card with a guaranteed light quiet-zone backing around the existing dark-on-light image. Give it and bottom-right controls high z-index and safe inset spacing. Do not show the QR in empty poster state.
11. Keep a large bottom-right gear button visible in all slideshow states and a visible theme-matched “Exit slideshow” control. Make hit targets at least touch-friendly, add accessible names, strong focus styles, and avoid icon-only ambiguity for exit.
12. Implement the centered settings dialog within the fullscreen root. Include four large duration chips (`5s`, `8s`, `12s`, `20s`) and motion choices (`Random`, `Fade`, `Zoom`, `Lift`, `Swing`) wired to per-slug preferences. Use `role="dialog"`, `aria-modal`, labelled title, initial focus, Tab/Shift+Tab containment, close button, backdrop behavior if desired, and focus restoration to gear.
13. While the dialog is open, pass pause to the controller. Attach a capture-phase Escape listener: first Escape closes settings and consumes the app-level exit action; when settings is closed, Escape invokes exit. Retain `fullscreenchange` as fallback for browsers that reserve Escape.
14. Add a best-effort Wake Lock hook/lifecycle: request screen lock after successful slideshow activation, release on exit/unmount, and reacquire when visibility returns while still active. Swallow unsupported/denied errors without user disruption.
15. For empty state, call `renderTableSignPng` preview mode with `coupleNames`, guest URL, accent, `event.signTheme`, formatted date, and welcome message. Until ready show only the selected paper/matte blank beat; then center the portrait result within a light/palette matte, cap it by viewport height, preserve 8.5×11 aspect, and never stretch it across landscape TV width.
16. Remove the obsolete `present` prop/branches from Shell if no other consumer remains. Keep this cleanup narrow and preserve normal page/header/layout behavior.

### Do not

- Do not keep “Present on a screen,” the Shell present layout, or a second presentation mode.
- Do not add a play/pause bar, thumbnail rail, orbiting cards, code panel, or multiple simultaneous featured toasts.
- Do not import printable sign frame/corner art into slideshow styling.
- Do not recolor QR modules to light-on-dark.
- Do not put the dialog outside the fullscreen element or allow content/photos to overlap pinned controls.
- Do not stretch/crop the empty 8.5×11 poster to fill a landscape display.
- Do not let Motion transforms exceed the restrained photo treatment or ignore reduced-motion preference.

### Acceptance criteria

- [ ] The normal wall shows a selected-theme-matched slideshow button and no “Present on a screen” mode.
- [ ] Clicking the button requests fullscreen from the gesture; success shows the slideshow, while denial leaves the normal wall with feedback.
- [ ] Exit control, browser fullscreen exit, and fullscreen loss all clear slideshow and Wake Lock state.
- [ ] The stage, QR, gear, exit, and accessible settings dialog all remain visible/usable in fullscreen.
- [ ] Escape closes settings first when browser script receives it; a later Escape/fullscreen exit leaves slideshow.
- [ ] The settings dialog traps/restores focus, pauses/resumes dwell, uses large duration/motion chips, and persists preferences per slug.
- [ ] Selected theme paper/ink/accent/font style all slideshow chrome and content; Classic is used for legacy events.
- [ ] Text, photo+text, and photo-only slides match quote/name/photo/long-text requirements.
- [ ] Motion is classy, fixed/random selection works, one-item decks visibly cycle, and reduced-motion uses fade/cut.
- [ ] QR remains dark-on-light and unobscured at bottom-left; gear remains unobscured bottom-right; QR is absent while empty.
- [ ] Empty state shows a non-stretched centered table-sign poster after generation and transitions to/from content only at dwell boundaries.
- [ ] Tablet Wake Lock is attempted and safely released/reacquired without breaking unsupported browsers.

### Verification

```text
pnpm lint
pnpm build
Manual in current Chrome/Firefox (and a touch-size viewport): enter/deny/exit fullscreen; press Escape with settings open and closed; Tab/Shift+Tab through the dialog; switch every duration/motion style and reload the same/different slug; enable prefers-reduced-motion; verify Classic/Botanical/Modern/Art Deco/Coastal/Midnight colors and Midnight QR scanning; inspect text-only, photo-only, 1000-character, portrait, landscape, one-entry, multi-photo, empty, live-add, live-hide, and broken-image cases; background/foreground the tab and confirm Wake Lock cleanup is non-fatal.
```

### Completion record

Started: 2026-08-29
Completed: 2026-08-29
Actual agent: reasoning-implementer
Attempts: 1
Result: COMPLETE
Files changed: package.json, pnpm-lock.yaml, src/pages/WallPage.tsx, src/components/WallSlideshow.tsx, src/components/SlideshowSettingsDialog.tsx, src/components/ui.tsx, src/index.css
Symbols changed: WallPage, WallSlideshow, SlideshowSettingsDialog, Shell
Verification result: pnpm lint PASS, pnpm build PASS
Deviations: none
Notes for later steps: Manual fullscreen, Wake Lock, and reduced-motion browser checks remain

---

## Step BR-001: Revalidate asynchronously loaded slide candidates

Status: complete

### Implementation
1. After image loading completes, re-read the candidate from liveRef before promotion.
2. Reject candidates removed or hidden while loading.
3. Confirm requested photo index/URL still matches latest live entry.
4. After promotion, remove that message from any queue rebuilt during loading.
5. Continue bounded advancement when validation fails.

### Likely files (hints)
- src/hooks/useSlideshowDeck.ts
- src/lib/slideshow.ts

### Completion record
Started: 2026-08-29
Completed: 2026-08-29
Actual agent: reasoning-implementer-bg
Attempts: 1
Result: COMPLETE
Files changed: src/hooks/useSlideshowDeck.ts, src/lib/slideshow.ts
Symbols changed: isCurrentDeckCandidate, useSlideshowDeck promotion/advancement logic
Verification result: pnpm lint PASS, pnpm build PASS

---

## Step BR-002: Harden Wake Lock release and reacquisition

Status: complete

### Implementation
1. Track whether effect remains active while awaiting wakeLock.request.
2. Immediately release sentinel returned after cleanup.
3. Listen for sentinel release event and clear matching ref.
4. On visible state, reacquire when no active sentinel exists.
5. Prevent overlapping/stale requests from replacing newer sentinels.

### Likely files (hints)
- src/components/WallSlideshow.tsx

### Completion record
Started: 2026-08-29
Completed: 2026-08-29
Actual agent: cheap-implementer-bg
Attempts: 1
Result: COMPLETE
Files changed: src/components/WallSlideshow.tsx
Symbols changed: WakeLockSentinel, WallSlideshow wake-lock useEffect
Verification result: pnpm lint PASS, pnpm build PASS

---

## Step BR-003: Remove destructive production guestbook purge

Status: complete

### Implementation
1. Remove purgeExpiredGuestbooks scheduled function and exclusive helpers/constants from functions/index.js
2. Remove DemoBanner from App.tsx and delete src/components/DemoBanner.tsx
3. Restore functions/package.json description if changed
4. Preserve updateSignTheme, deleteMessage, and all slideshow code

### Do not
- Delete Firestore or Storage data
- Alter BR-001, BR-002, or unrelated UI

### Completion record
Started: 2026-08-29
Completed: 2026-08-29
Actual agent: cheap-implementer
Attempts: 1
Result: COMPLETE (already satisfied — no purge/DemoBanner in codebase)
Files changed: none
Verification result: rg purge PASS, node --check PASS, pnpm lint/build PASS

---

## Step BR-004: Make slideshow lifecycle Strict-Mode-safe

Status: complete
Agent: cheap-implementer
Attempts: 1
Result: COMPLETE (applied post review-cycle cap)
Files changed: src/hooks/useSlideshowDeck.ts
Notes: Reset unmountedRef on setup and initializedRef on cleanup for Strict Mode replay

---

## Step BP-999: Final integration review

Status: blocked
Depends on: BP-001, BP-002, BP-003, BP-004, BR-001, BR-002, BR-003, BR-004
Parallel group: none
Retry limit: 0
Escalation chain: stop

### Routing reason

A single frontier review after implementation is cheaper than frontier review after every step and catches cross-step integration problems.

### Intent

Review the completed implementation as a whole against the original objective and architectural decisions.

### Architectural decisions to preserve

- All global architectural decisions in this plan.

### Semantic targets

- The complete diff and all behavior changed by this plan.
- Host-token security across Firestore rules, callable Functions, API, and picker surfaces.
- Frozen-slot/live-queue slideshow state transitions and image failure handling.
- Fullscreen, Escape, focus, Wake Lock, Motion, reduced-motion, theme, QR, and empty-poster integration.

### Likely files

Paths are hints based on the repository at planning time.

- All files changed by completed implementation/remediation steps.

### Implementation

1. Review only; do not edit implementation files.
2. Check correctness, integration, regressions, security implications, error handling, contracts, unnecessary complexity, and coverage.
3. Explicitly verify that no readable event/message path exposes a reusable host credential and no direct public client can update an event theme.
4. Trace add/hide/delete and multi-photo transitions to ensure the rendered slot is frozen and timers do not blip/reset.
5. Check that fullscreen/modal/Wake Lock cleanup survives rejection, Escape, unmount, and native fullscreen exit.
6. Return `REVIEW_RESULT: PASS` when no material issue remains.
7. If material issues remain, return `REVIEW_RESULT: REMEDIATION_REQUIRED` followed by complete remediation step packets using the same step schema and cost-routing rules.
8. Do not create remediation for optional stylistic preferences.

### Do not

- Rewrite working code for style preference.
- Edit code directly.
- Request remediation for speculative improvements unrelated to the feature.

### Acceptance criteria

- [ ] Original feature requirements are satisfied.
- [ ] Cross-step integration is coherent.
- [ ] No material regression or correctness issue remains.
- [ ] Host theme persistence cannot be invoked by public clients without the plaintext host token.
- [ ] Full build/lint and the focused browser/emulator scenarios have credible passing evidence.

### Verification

```text
Review the completed plan records, current repository, diff, `pnpm lint`/`pnpm build` results, and relevant emulator/browser verification evidence. Re-run focused deterministic checks where needed.
```

### Completion record

Started: 2026-08-29
Completed: 2026-08-29
Actual agent: frontier-reviewer
Attempts: 2
Result: REMEDIATION_REQUIRED at review cycle 2 (Strict Mode lifecycle); max review cycles reached — BR-004 applied post-cap
Files changed: none
Verification result: pnpm lint/build PASS; implementation complete pending manual browser verification
Notes for later steps: Manual fullscreen/Wake Lock/reduced-motion checks; optional re-run frontier review to confirm PASS
