# Wishing Wall

A live guestbook for personal events with no sign-up, no login, and no email. Guests scan a QR code, leave a note, photos, or one short video, and it appears on a live wall. The host link is the credential.

Supported event types: **wedding**, **birthday**, **graduation**, **religious milestone**, and **other**.

Live site: https://toastboard.web.app/

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Neutral marketing hub |
| `/weddings`, `/birthdays`, `/graduations`, `/religious-milestones` | Type-specific landing pages |
| `/create` | Create a guestbook (optional `?type=` for event type) |
| `/e/:slug` | Guest submission page |
| `/e/:slug/wall` | Live wall |
| `/e/:slug/manage` | Host moderation (host link required) |
| `/terms`, `/privacy` | Legal pages |

## Run locally

```bash
pnpm install
pnpm dev
```

Then open http://localhost:5173. By default the app talks to the live `toastboard` Firebase project.

### Local Firebase emulators

Use emulators when you want to develop without touching production data.

1. Install functions deps once: `pnpm install --dir functions`
2. Make sure the CLI project matches the app: `firebase use default` (should print `toastboard`)
3. Start emulators: `pnpm emulators` (UI at http://127.0.0.1:4000)
4. Seed emulator data: `TOASTBOARD_EMULATORS=1 pnpm seed`
5. Run the app against emulators: `pnpm dev:emu`

If the Firestore tab in the Emulator UI looks empty, check the project selector in the top-left — it must be **toastboard**, not an old alias like `toastboard-guestbook`. Restart emulators after changing `firebase use`.

Emulator ports are defined in `firebase.json` (Firestore `8080`, Storage `9199`, Functions `5001`). Override seed targets with `FIRESTORE_EMULATOR_HOST`, `FIREBASE_STORAGE_EMULATOR_HOST`, and `FIREBASE_FUNCTIONS_EMULATOR_HOST` if needed.

#### Video uploads and the Functions emulator

Short-video uploads need **Firestore, Storage, Functions, and the Emulator UI** running together (`pnpm emulators` starts all four). Install functions dependencies first: `pnpm install --dir functions`.

- **`ffmpeg-static` must match your OS/architecture.** If you change machines or see ffmpeg spawn errors, reinstall functions deps so the bundled binary matches.
- **Gen2 Storage event delivery can vary by Firebase CLI version.** The `transcodeUploadedVideo` trigger may not fire locally even when raw uploads succeed. If that happens:
  1. Run unit tests: `cd functions && pnpm test` (path parsing, codec eligibility, URL helpers).
  2. Perform a controlled smoke test in a **non-production** Firebase project (not production guestbook data): upload a small MP4 and WebM, confirm processing → ready/failed, wall playback, and host hide cleanup.
- **Inspect structured function logs** for `video_remux` or `video_transcode` (and `video_transcode_recovered` for duplicate-delivery recovery). They include the slug, message ID, generation, input extension, and audio flag—never the download token. Before launch, confirm: function has zero min instances, processing messages reach a terminal state, output is H.264/AAC (when audio exists) at width ≤1280 with `faststart`, direct client writes to final `{messageId}.mp4` are denied by rules, and raw `{messageId}-raw.*` objects are removed after processing or host moderation.

Manual end-to-end on emulators: submit photo-only, video-only, and text-only messages; watch processing → ready/failed on the wall, lightbox, and slideshow; hide during processing and after ready; confirm Firestore `isHidden` plus JPEG, final MP4, and raw object cleanup in Storage.

### Seed production demos

```bash
pnpm seed
```

seeds four stable demo guestbooks (wedding, birthday, graduation, religious milestone) from `src/content/demoCatalog.json` and writes the Maya & James wedding host URL to `.demo-host-url`.

## Deploy

```bash
pnpm deploy
```
