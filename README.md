# The Willow Book

A live guestbook for personal events. Guests scan a QR code, leave a note, photos, or one short video, and it appears on a live guestbook — no guest login. Hosts sign in with Google or email to create and keep guestbooks; the host link still works as a spare key.

Supported event types: **wedding**, **birthday**, **graduation**, **religious milestone**, and **other**.

Live site: https://toastboard.web.app/

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Neutral marketing hub |
| `/login` | Host sign-in (Google or email) |
| `/account` | Signed-in host’s guestbook list |
| `/weddings`, `/birthdays`, `/graduations`, `/religious-milestones` | Type-specific landing pages |
| `/create` | Create a guestbook (requires host sign-in; optional `?type=` for event type) |
| `/e/:slug` | Guest submission page |
| `/e/:slug/guestbook` | Live guestbook |
| `/e/:slug/manage` | Host moderation (host link or signed-in owner) |
| `/terms`, `/privacy` | Legal pages |

## Run locally

```bash
pnpm install
cp .env.example .env.local
# Set AUTH_SECRET in .env.local (required for sign-in)
pnpm dev
```

Then open http://localhost:3000. By default the app talks to the live `toastboard` Firebase project.

Host sign-in needs **Firebase Auth** enabled in the console (Google + Email/Password) and `AUTH_SECRET` in `.env.local`. For token verification locally, set `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` from a Firebase service account, or use emulators.

### Local Firebase emulators

Use emulators when you want to develop without touching production data.

1. Install functions deps once: `pnpm install --dir functions`
2. Make sure the CLI project matches the app: `firebase use default` (should print `toastboard`)
3. Start emulators: `pnpm emulators` (UI at http://127.0.0.1:4000)
4. Seed emulator data: `TOASTBOARD_EMULATORS=1 pnpm seed`
5. Run the app against emulators: `pnpm dev:emu`

If the Firestore tab in the Emulator UI looks empty, check the project selector in the top-left — it must be **toastboard**, not an old alias like `toastboard-guestbook`. Restart emulators after changing `firebase use`.

Emulator ports are defined in `firebase.json` (Auth `9099`, Firestore `8080`, Storage `9199`, Functions `5001`). Override seed targets with `FIRESTORE_EMULATOR_HOST`, `FIREBASE_STORAGE_EMULATOR_HOST`, and `FIREBASE_FUNCTIONS_EMULATOR_HOST` if needed.

#### Video uploads and the Functions emulator

Short-video uploads need **Auth, Firestore, Storage, Functions, and the Emulator UI** running together (`pnpm emulators` starts all five). Install functions dependencies first: `pnpm install --dir functions`.

- **`ffmpeg-static` must match your OS/architecture.** If you change machines or see ffmpeg spawn errors, reinstall functions deps so the bundled binary matches.
- **Gen2 Storage event delivery can vary by Firebase CLI version.** The `transcodeUploadedVideo` trigger may not fire locally even when raw uploads succeed. If that happens:
  1. Run unit tests: `cd functions && pnpm test` (path parsing, codec eligibility, URL helpers).
  2. Perform a controlled smoke test in a **non-production** Firebase project (not production guestbook data): upload a small MP4 and WebM, confirm processing → ready/failed, guestbook playback, and host hide cleanup.
- **Inspect structured function logs** for `video_remux` or `video_transcode` (and `video_transcode_recovered` for duplicate-delivery recovery). They include the slug, message ID, generation, input extension, and audio flag—never the download token. Before launch, confirm: function has zero min instances, processing messages reach a terminal state, output is H.264/AAC (when audio exists) at width ≤1280 with `faststart`, direct client writes to final `{messageId}.mp4` are denied by rules, and raw `{messageId}-raw.*` objects are removed after processing or host moderation.

Manual end-to-end on emulators: submit photo-only, video-only, and text-only messages; watch processing → ready/failed in the guestbook, lightbox, and slideshow; hide during processing and after ready; confirm Firestore `isHidden` plus JPEG, final MP4, and raw object cleanup in Storage.

### Seed production demos

```bash
pnpm seed
```

seeds four stable demo guestbooks (wedding, birthday, graduation, religious milestone) from `src/content/demoCatalog.json` and writes the Maya & James wedding host URL to `.demo-host-url`.

## Deploy

The Next.js app runs on **Firebase App Hosting** (server-rendered — required for host sign-in). Firestore rules, Storage rules, and Cloud Functions deploy separately.

1. Create an App Hosting backend linked to this repo (Firebase console or CLI).
2. Store secrets in Google Secret Manager: `AUTH_SECRET`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (see [`apphosting.yaml`](apphosting.yaml)).
3. Deploy backend rules and functions:

```bash
pnpm deploy
```

4. Deploy the web app:

```bash
pnpm deploy:app
```

Point `toastboard.web.app` at the App Hosting backend when ready. Until then, use the App Hosting URL from the Firebase console.

Local production preview:

```bash
pnpm preview
```

Runs `next build` then `next start` on port 3456.
