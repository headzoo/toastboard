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

Then open http://localhost:5173. The app talks to the `toastboard` Firebase project.

```bash
pnpm seed
```

seeds four stable demo guestbooks (wedding, birthday, graduation, religious milestone) from `src/content/demoCatalog.json` and writes the Maya & James wedding host URL to `.demo-host-url`.

To seed against local emulators (`pnpm emulators`) instead of production:

```bash
TOASTBOARD_EMULATORS=1 pnpm seed
```

That flag talks to the emulator ports in `firebase.json` (override with `FIRESTORE_EMULATOR_HOST`, `FIREBASE_STORAGE_EMULATOR_HOST`, and `FIREBASE_FUNCTIONS_EMULATOR_HOST` if needed).

## Deploy

```bash
pnpm deploy
```
