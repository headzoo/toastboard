# The Willow Book

A live guestbook for personal events. Guests scan a QR code, leave a note, photos, or one short video, and it appears on a live guestbook — no guest login. Hosts sign in with Google or email to create and keep guestbooks; the host link still works as a spare key.

Supported event types: **wedding**, **birthday**, **graduation**, **religious milestone**, and **other**.

Live site: https://preview.thewillowbook.com/

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

See [`.env.example`](.env.example) for all environment variables.

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

The Next.js app runs on **Vercel**. Firebase provides Auth, Firestore, Storage, and Cloud Functions only — not web hosting.

### Web app (Vercel)

1. Import this repo in Vercel (framework: **Next.js**, package manager: **pnpm**).
2. Set environment variables in the Vercel project (Production, and Preview if desired):

| Variable | Production value |
| --- | --- |
| `AUTH_SECRET` | Random string (`openssl rand -base64 32`) |
| `AUTH_TRUST_HOST` | `true` |
| `AUTH_URL` | `https://preview.thewillowbook.com` |
| `FIREBASE_CLIENT_EMAIL` | Service account `client_email` from Firebase |
| `FIREBASE_PRIVATE_KEY` | Service account `private_key` (paste as one line; `\n` is fine) |

3. Add custom domain **`preview.thewillowbook.com`** in Vercel → Domains and point DNS at Vercel (CNAME to `cname.vercel-dns.com` or A records per Vercel’s instructions).
4. Deploy via git push or `vercel deploy`.

For preview deployments on `*.vercel.app`, add each preview hostname to Firebase Auth **Authorized domains** (or add them as you use them).

Local production preview before pushing:

```bash
pnpm preview
```

Runs `next build` then `next start` on port 3456.

### Firebase (rules + functions)

Deploy Firestore rules, indexes, Storage rules, and Cloud Functions:

```bash
pnpm deploy
```

This does **not** deploy the web app.

### Firebase Console (one-time)

1. **Authentication → Sign-in method:** enable Google and Email/Password.
2. **Authentication → Settings → Authorized domains:** add `preview.thewillowbook.com`, `localhost`, and any Vercel preview hostnames you use.
3. **Project settings → Service accounts → Generate new private key:** use the JSON for `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` in Vercel.

### Post-deploy checks

- `/` loads on `preview.thewillowbook.com`
- `/login/` — Google and email sign-in work
- `/create/` redirects when signed out
- `/api/auth/session` returns 200 (not `MissingSecret`)
- Creating a guestbook writes `ownerUid`; `/account/` lists it
- Host moderation and video upload still work (Functions CORS is already enabled)

### Legacy Firebase Hosting

`toastboard.web.app` previously served a static export. Web hosting is removed from [`firebase.json`](firebase.json). Disable or delete the old Firebase Hosting site in the console if it still serves stale files.
