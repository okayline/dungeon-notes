# moba-beat — Dev Changelog — v0.1–v0.4

Detailed changelog for moba-beat (public repo: okayline/moba-beat): a rhythm micro-MOBA auto-battler, daily and async.
Worker `moba-beat` (connected to the repo: a push to `main` deploys it) + D1 `moba-beat` (id 8ced4f17-0ae0-4852-b02c-5003d7f08c5d).
The public repo keeps a short changelog. The design is in `design.md` here. Newest first. Times are Hawaii time (HST), from the commit times.
Nothing of the game itself is built yet: so far it is the ledger, the day's seal and the beat.

---

## v0.4 — "Lights Off"
**Wed Oct 21, 2026 · 10:41 AM HST** (no migration)

### Decisions (the owner's)
- Owner asked for a page or visual, then "can we do a modern style not the ascii style please", "remember its also going to be a moba auto battler", and "can we do dark mode please, and put a version number on it somewhere".
- I made the page always dark (no light theme, no following the device setting).

### What was built
- `public/index.html`, `style.css`, `app.js`: the lane (your squad blue on the left, the ghost squad coral on the right; Clutch diamond, Feed circle, Tilt triangle, working names), today's beat as 16 bars in 4 measures (strong tall amber, normal light, rest hollow) with a key and the BPM, and a Play/Stop button. Play clicks once a beat with Web Audio (880 Hz on strong, 520 Hz on normal, nothing on a rest) at the day's BPM, moves a highlight along the bars, and pulses the squads on each beat (more on strong). Reduced motion: no pulsing. The fight is not built; a line on the page says so.
- Colours: page #151a2e, lane #1f2640, text #e7ebf5, muted #98a2b8, your squad #5b82ff, ghost #ff6b8a, strong #ffb020. Font: the device's system font (Avenir Next, Segoe UI, system-ui); a custom font couldn't be downloaded in the workspace.
- `public/version.js` `VERSION = "v0.4"`, shown next to the name. New test: it matches the newest `CHANGELOG.md` entry.
- `wrangler.jsonc`: serves `public/` as static assets, `/api/*` goes to the Worker first (as CFT). Removed: JSON-only answers at `/`.

### Checks
- Headless Chromium against a stand-in `/api/today` (a real beat, 118 BPM): no sideways scroll at 390 px or 1280 px, no page errors; after Play and about 1.9 s the highlight was on beat 4, as the tempo gives. A first look showed the first bar of each measure squeezed (a margin inside the grid); the bars are now grouped by measure and even.

### Not checked
- The sound by ear; the page against the live Worker.

## v0.3 — "The Beat"
**Wed Oct 21, 2026 · 10:34 AM HST** (no migration; local until pushed)

### Decisions (the owner's)
- Owner: "16 beats , 4 beats x 4 measures". The beat is built from the day's ledger hash.
- Owner: "just dont worry about edge cases" (said while the ledger was being built): no retries, fallbacks or races handled beyond the unique indexes.

### What was built
- `src/beat.js` `beat(hash)`: bytes 0 to 15 of the hash are one per beat; value mod 4 is 0 rest, 1 or 2 normal, 3 strong. Beat 1 of every measure is never a rest (a rest there becomes normal). Byte 16 sets the tempo: 80 + byte mod 41, so 80 to 120 BPM. Pure, no database or network.
- `GET /api/today` now answers `{day, registry, hash, bpm, beats}`.
- The tempo range and the shares (about a quarter rest, a half normal, a quarter strong) are first guesses, not tuned by playing.

### Tests
- A beat worked out by hand from chosen bytes (including 7 and 251, both 3 mod 4, and a rest on beat 1 that becomes normal); the tempo for bytes 0, 1, 40, 41, 82 and 255; same hash same beat. `/api/today` returns the beat made from its own hash. 9 pass.

## v0.2 — "Day One"
**Wed Oct 21, 2026 · 10:29 AM HST** (commit a31e155; no migration)

### Decisions (the owner's)
- Owner, on the beat's source: "the shared beat is the ledger seed from something!", "all the games feed one beat is good", "i dont want to use CFT", then "registrys chain head!".
- Considered and not used: CFT's own day entry as the source (the owner doesn't want it tied to CFT); one other game's checkpoint (Dawn Baton's lap); mixing in the moon phase (it is a function of the date, so it adds no randomness; kept as a possible dial for the beat's feel, not built); mixing the date in by hand (not needed: the day entry's record holds the date and its hash holds the previous hash).
- Fixed at 00:00 UTC: the beat uses the registry head as of midnight, so it is known to everyone from midnight and can't be changed by that day's play.

### What was built
- `src/registry.js` `registryHeadAt(day)`: pages `https://88x31.app/api/registry/ledger?limit=100` (newest first, `&before=` the last id) and takes the first entry whose `at` is before 00:00 UTC of the day; 64 zeros if the registry had none.
- `src/ledger.js` `dayEntry(db, day, getRegistryHead, t)`: record `{"day", "registry"}`, `hash = SHA-256(prev + "|" + record)`. The registry is read only when the day is first sealed.
- `GET /api/today`: `{day, registry, hash}`.

### Tests
- A fake registry of 250 entries: the head is entry 120, found 130 entries back; none before the cut gives GENESIS. `/api/today` seals once and reads the registry once.

### Not checked
- No call to the live registry route or the live Worker; whether a Worker can fetch 88x31.app.

## v0.1 — "The Ledger"
**Wed Oct 21, 2026 · 10:26 AM HST** (commits 5ab137e, 49559f5; schema run on the live D1 database)

### Decisions (the owner's)
- Owner: "lets make the ledger!!" and the rhythm game "has its own ledger" like the other games.
- Worker name `moba-beat`; the owner created the Worker and the database and connected the Worker to the repo.

### What was built
- `src/ledger.js`: `GENESIS`, `sha256`, `head`, `dayEntry`, `verifyChain` (chain helpers copied from aura-farm `src/ledger.js`).
- `schema.sql`: table `ledger` (`prev_hash` UNIQUE, `hash` UNIQUE) and the unique index `ledger_one_day` (one `day` entry per day).
- The schema was run on the live `moba-beat` D1 database through the Cloudflare connector (two statements), then checked: table `ledger` and index `ledger_one_day` exist.
- `wrangler.jsonc` (Worker `moba-beat`, D1 binding `DB`) and `src/worker.js` with `GET /api/ledger?before=&limit=` (newest first, up to 100). Removed: the Cloudflare "Hello world" starter, which the first deploy replaced.

### Tests
- A day's hash by hand with node:crypto, sealed once, chained from GENESIS; days differ with the same registry head; `verifyChain` finds a changed record; `/api/ledger` order, `limit`, `before` and 404.
