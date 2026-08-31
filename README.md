# Toastboard

A live guestbook for personal events with no sign-up, no login, and no email. Guests scan a QR code, leave a note or photo, and it appears on a live wall. The host link is the credential.

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

### Seed production demos

```bash
pnpm seed
```

seeds four stable demo guestbooks (wedding, birthday, graduation, religious milestone) from `src/content/demoCatalog.json` and writes the Maya & James wedding host URL to `.demo-host-url`.

## Deploy

```bash
pnpm deploy
```
