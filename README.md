# Toastboard

A wedding guestbook with no sign-up, no login, and no email. Guests scan a QR code, leave a toast or a photo, and it appears on a live wall. The host link is the credential.

Live site: https://toastboard.web.app/

## Run locally

```bash
pnpm install
pnpm dev
```

Then open http://localhost:5173. The app talks to the `toastboard` Firebase project.

```bash
pnpm seed
```

seeds the Maya & James demo wall and writes the private host URL to `.demo-host-url`.

## Deploy

```bash
pnpm deploy
```

