# The Willow Book — agent branding guide

## Product vs house brand

- **Product name:** The Willow Book — use this in UI copy, page titles, metadata, and legal text when referring to the service. Use “a Willow Book” (drop *The*) when the name takes an article or works as an adjective (“a Willow Book guestbook”).
- **House brand:** Keepwell & Bell — appears in the logo lockup; do not use as the primary product name in UI copy.
- **Logo asset:** `public/images/logo.png` — lockup reads "The Willow Book by Keepwell & Bell".

## What not to rename

Leave these as infrastructure identifiers (still say `toastboard` technically):

- Firebase project ID, storage bucket, auth domain
- Env vars (`NEXT_PUBLIC_TOASTBOARD_EMULATORS`, `TOASTBOARD_EMULATORS`, `TOASTBOARD_ORIGIN`)
- localStorage / session keys (`toastboard:*`)
- Demo host tokens, package names, Cloud Functions temp filenames
- Live domain URLs (`toastboard.web.app`) until a domain cutover is planned

---

# Keepwell & Bell — Brand Voice & Style Guide

## The core principle

Keepwell & Bell is presented the way Betty Crocker, Uncle Ben's, Sara Lee, or Dr. Bronner's are presented: a name that carries values and craft, not a biography. Nobody asks "who is Uncle Ben?" because the branding never opens that door. Our job is the same — every word on the site should describe a *standard*, never a *person* or a *history*. The moment copy implies a checkable fact (a year, a city, a face, a quote), we've invited scrutiny we don't want.

**One-line test before publishing any copy:** *Does this sentence describe what we value, or does it describe who we are and where we came from?* Only the first is allowed.

---

## Voice

- **Warm, plain-spoken, quietly confident.** Not twee, not corporate. Think a well-made card shop, not a SaaS landing page.
- **Institutional "we," never individual "I" or named founders.** "We believe..." / "We hold..." — never "Bell always said" or "our founder's philosophy."
- **Present tense, standards-oriented.** "We set high standards" (ongoing practice) rather than "We were founded on the idea that..." (origin story).
- **Short sentences. Real words.** Avoid startup-speak ("seamless," "frictionless," "solution") — this brand should sound like it predates that vocabulary entirely.
- **Craft over technology.** Talk about paper, keepsakes, care, and attention — not features, apps, or software, even though the product is one.

## Do

- Speak about **values and craft**: "we set high standards," "we seek fine craftsmanship," "we believe a kind word is worth keeping"
- Use **the Keepwell & Bell name as an adjective/standard**: "the Keepwell & Bell standard," "built the Keepwell & Bell way"
- Let **product details do the storytelling**: paper textures, typography, the ritual of a keepsake — sensory and tactile language works harder than narrative here
- Keep claims **timeless and unfalsifiable**: "we've always believed..." implies continuity without a date attached
- Let **imagery carry regional feeling** (see Vermont section below) — never caption or state a location

## Don't

- Don't name Keepwell or Bell as individuals, give them pronouns, quote them, or attribute a personal belief to either name specifically
- Don't state a founding year, city, or origin anecdote ("founded in a small workshop in...")
- Don't create an "About the Founders" page with photos, bios, or invented history
- Don't use founder-style first-person singular ("I started this because...")
- Don't explicitly say "Vermont" or name any specific place — see below
- Don't over-explain the name's meaning — if a visitor wonders "who is Keepwell & Bell?" for a beat and then moves on without needing an answer, that's success

---

## Sample lines by section

**Homepage hero / tagline**
> Every kind word, kept.
> A quiet place to keep the words a moment deserves.

**About page on this site (`/about`) — about The Willow Book, not the house brand**
> The Willow Book is a live guestbook for a gathering. Guests leave a note, a photo, or a short video — without making an account to do it.
>
> The Willow Book is our answer to a simple question: how do you keep the words people say at your table, without asking them to sign in to say them?
>
> Close with Keepwell & Bell only as attribution/standard (“made the Keepwell & Bell way”), never as the page’s subject. House-brand “Our Standards” copy belongs on keepwellandbell.com, not here.

**Product intro (The Willow Book)**
> The Willow Book is our answer to a simple question: how do you keep the words people say at your table, without asking them to sign in to say them?

**Footer**
> Keepwell & Bell — quietly, carefully made.

**Empty state (no messages yet in a guestbook)**
> Nothing kept here yet. The first word is always the best one.

**Error / 404 page**
> This page wandered off. Everything else is right where we left it.

**Host "save your link" screen**
> Keep this safe — it's the only key we'll ever give you.

---

## The Vermont feeling (visual only, never verbal)

Vermont is never named, written, or implied in copy. It lives entirely in imagery and material texture:

- **Palette**: cream, birch white, deep forest green, barn red as an accent only, muted gold
- **Textures**: cotton paper, wax seals, pressed botanicals, linen, twine — handmade-object textures rather than glossy/digital ones
- **Imagery motifs**: maple leaves, wildflowers, orchards, quiet farmhouse tables, mason jars, wood grain — used sparingly, as accents (like the envelope/heart mark), not as literal scenery photos
- **Typography**: serif display faces (already using Fraunces) paired with a humble, slightly rustic script for accents (the "by" in the logo) — avoid anything that reads modern-digital
- **What to avoid**: no skylines, no modern interiors, no visible technology in imagery, nothing that reads "startup office" or "city." If a photo or illustration could be mistaken for a big-city stationery brand, it's off-brand.

The test: someone looking at the site should feel like they've stumbled onto a small, well-loved paper goods company somewhere quiet and green — without ever being told where.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
