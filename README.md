# Toastboard

A wedding guestbook with no sign-up, no login, and no email. Guests scan a QR code, leave a toast or a photo, and it appears on a live wall. The host link is the credential.

## Run locally

```bash
pnpm install
pnpm dev
```

Then open http://localhost:5173. The app talks to the `toastboard-guestbook` Firebase project.

```bash
pnpm seed
```

seeds the Maya & James demo wall and writes the private host URL to `.demo-host-url`.

## Deploy

```bash
pnpm deploy
```

Live site: https://toastboard-guestbook.web.app

Cloud Functions (`functions/index.js`, `deleteMessage`) are ready for Blaze. On Spark, host hide uses Firestore rules: the client hashes the host token and rules compare it to a write-only `secrets/host` document.
