# Daily Pitch (nano-pitch) — Dev Changelog — v0.1–v0.6

Detailed changelog for Daily Pitch (repo okayline/nano-pitch): one daily 4-point cutthroat Pitch game, the same deal for everyone, against bots. Its `pitch_` tables are in the moba-beat D1. The public repo keeps a short `CHANGELOG.md`; the design is `pitch/daily-pitch-design.md` in the project files. Newest first. Times are Hawaii time (HST), from the commit times.

Written after the fact (Oct 22) from the commit messages. Every version went straight to `main` with no PR. The owner's decisions behind each version are not recorded here.

---

## v0.6 — "Open Book"
**Wed Oct 21, 2026 · 9:59 PM HST** (091092e)
- **Added:** a ledger page with an in-browser chain check; after every seal (day, daily game, practice game) a checkpoint of the ledger head goes to the shared registry (new `REGISTRY` binding).
- **Changed:** page styles moved to `public/style.css`.
- **Removed:** the inline `<style>` block in `index.html`.

## v0.5 — "Neon Table"
**Wed Oct 21, 2026 · 9:53 PM HST** (aee4c32)
- **Added:** aura-farm-style page (dark purple glow, real card faces, gradient button, phone first). The table plays lagspike, mogger99 and tiltproof (TILT.EXE gamer tags) with emoji profile pics.
- **Removed:** the 80-column screen and the VT323 font.

## v0.4 — "The Table Remembers"
**Wed Oct 21, 2026 · 9:39 PM HST** (d23643d, migration 004)
- **Added:** players' bids are filed by hand type; a bot follows the crowd once 5 players held that type, from a snapshot taken at the start of each day that the day's ledger entry commits to.
- **Removed:** nothing named in the commit; card play unchanged.

## v0.3.1
**Wed Oct 21, 2026 · 9:30 PM HST** (530486e)
- **Fixed:** a saved game whose moves no longer replay (bots changed in v0.2) made the Worker return 500. An unfinished game now starts over with a message; a sealed one says it can't be shown.

## v0.3
**Wed Oct 21, 2026 · 9:25 PM HST** (254fc8a, migrations 002 and 003)
- **Added:** a day is one game to 11 (rotating dealer, tie plays on), hand results between hands, a final screen and a field of places; practice games on random deals after the daily game, sealed as kind "practice".
- **Changed/removed:** the PITCHER label is now BIDDER.

## v0.2
**Wed Oct 21, 2026 · 9:05 PM HST** (abca980)
- **Changed:** all bot seats bid their estimate.
- **Removed:** the per-seat offset `BOT_OFFSET`.

## v0.1
**Wed Oct 21, 2026 · 8:51 PM HST** (0867ceb; rules engine in 0f3d8a9, 8:40 PM)
- **Added:** `public/engine/pitch.js` (seeded deal, bidding with the dealer forced to 2, legal plays, tricks, High/Low/Jack/Game scoring, replay from seed + actions, the bots); `engine/daily.js` (day seed = HMAC-SHA256(secret, "daily:" + day), as scoundrel.exe, plus `seedHash` for the ledger); the Worker (secret-seed deal, sealed hands, field summary, accounts), the 80-column page, `pitch_` tables (`schema.sql`, `migrations/001_pitch.sql`), tests (17 engine tests in 0f3d8a9).
- **Removed:** nothing (first version).
