# irl-dungeon — Dev Changelog — v0.01–v0.04

Detailed changelog for irl-dungeon (public repo: okayline/irl-dungeon): 4Dungeon in the real world. Every H3
resolution-10 cell (about 100 m) is a dungeon that grows over time, using 4Dungeon's floor generator, screen and
minimap. Live at irl.88x31.app. Companion to Daily Digital Demon Dungeon.
The public repo keeps a shorter changelog (`CHANGELOG.md`). Newest first. Times are Hawaii time (HST).

---

## v0.04 — "Street Door"
**Thu Oct 15, 2026 · 7:08 PM HST** (migration 002: `places`; run on the live DB through the Cloudflare connector before the push, checked against `schema.sql`)

Decisions: the user's desktop and phone both block browser location, so the game was unplayable for them, and they find the location prompt slightly invasive. Options offered: (1) a rough start from the server plus walking between cells, (2) a travel-plausibility check, (3) a home cell with movement capped over time, (4) physical markers. The user chose 1 and 2 and refused 3 ("i dont want to restrict their physical movements"). This reverses the v0.03 note that an IP-area fallback was refused: the user is now fine with the server inferring roughly where a player is, rather than asking the device. Asked and answered: cells are changed by walking out of a cell's start room (not a [M]OVE panel or typed id); the guess is ~1 km (H3 resolution 7); an implausible claim can be walked but earns no credit ("play, no credit") rather than being refused or only noted. Also this session: first finder confirmed as the first to walk a whole wing (open question removed); the live address is irl.88x31.app (open question removed); README/DESIGN/code comments brought up to v0.03 (they still described the private seed).

- `public/place.js`: `guessCell(cf)` (Cloudflare's IP lat/long → res-7 area → its res-10 centre child; coordinates dropped; blank/garbage → null), `neighbour(cell, dir)` (of the six touching hexes, the one closest to the N/E/S/W bearing), `cellKm`. Found by a test: `Number("")` is 0, so a blank position landed players at 0,0 in the Gulf of Guinea; fixed.
- `src/travel.js` (new): `travelCheck(last, cell, at)` — credited if distance ≤ 2 km slack + 150 km/h × elapsed; else `{ok:false, waitSec}`; `waitText`.
- `src/worker.js`: `GET /api/here` (no player made, nothing stored). `theRun` runs the travel check: a credited claim overwrites the player's row in `places`, a refused one changes nothing. `/api/run` returns `credit` (and `waitSec`); `/api/unlock` and `/api/walk` refuse with 403 without credit (the key is not spent).
- `public/walk.js`: a wall in room 0 returns `leave: <dir>`. `public/screen.js`: the ahead line says "the way out, to the next cell" for those walls. `public/index.html`: starts at `?cell=`, else the server's guess; handles `leave` by arriving in the neighbour's start room facing the same way. L (browser location) kept as optional.
- Tests: `test/travel.test.mjs` (9, expected values from h3-js directly and a hand-written haversine/bearing) and one in `test/screen.test.mjs`. 133 pass. Mutation checks run this time, each made a test fail: no credit check on unlock / on walk, refused claims moving the last place, no speed limit, 50 km slack, guess at full precision, neighbour ignoring direction, no way out of the start room, every wall a way out.
- Checked in a real browser (Chromium via playwright, location permission not granted) against the real Worker with SQLite and a fake `cf` position in Honolulu: started in the guessed cell, turned to a start-room wall, stepped into the next cell west.
- Known: a start room only has walls on some sides, so a direction may need a zigzag. The page still doesn't call `/api/run`, so `places` fills only once the page uses the routes. Open: 150 km/h (a flight waits about a day for credit); whether a brand-new player's first claim should count for less.

## v0.03 — "Shared Halls"
**Thu Oct 15, 2026 · 6:42 PM HST** (migration 001: `unlocks`, `completions`, `wing_firsts`; run on the live DB before the push)

Decisions: the key is spent by stepping into a locked door (4Dungeon's way, no button); the user said "dont add new things without asking". First finder is the first person to walk every room of a wing, sent as one request per wing (the visited set), anonymous for now; the finder's player id stays in `wing_firsts` and the ledger's private column so a name can be added later. One public ledger, private state in ordinary tables. Local-day rule for the key (browser sends its UTC offset, server uses its own clock, forward-only). Then, new this release: the user wants the dungeon the same for everyone because physical reality is shared, so the private seed (`pseed`) and the `cell_runs` table were dropped; `generate` now defaults `pseed = seed`, so the map rotation and direction labels are the same for all. A fallback start cell (random, IP area, home cell) was proposed by me and refused: location tied to a real place is the point. Admin tools were asked about, then postponed by the user.

- `src/game.js` (new): `buildFloor(cell, doors)`, `wingKey`, `finishedWings` (validates the visited list: at most 200 integers, built rooms, includes the start, connected). `public/floor.js`: `lockedDoors`, `growDoor` (doors by number).
- `src/worker.js`: `POST /api/run`, `/api/unlock` (120/h; refused tries don't spend the key; `tz_check` match/mismatch/unknown from `request.cf.timezone`, soft only), `/api/walk` (240/h; completion rows, `wing_firsts` and the ledger entry in one batch, retry on a chain clash).
- Tests: `test/game.test.mjs` (23): cells, one key a day, sealed pair, bad offsets, the time zone check, replay, completing a wing, first finder, a six-way race giving exactly one finder and one ledger entry, refused walks. `test/helpers.mjs` `browser()` takes `cf`. 123 tests pass. Mutation checks on the new routes were not run.
- Not done: the page client (unlock by stepping, wing completion request); the page does not use the routes yet. Open: what rooms hold, season length, layers going down, anchoring the ledger head, real-world safety wording, names for first finders, IP-versus-cell location flag (discussed, not built).

## v0.02 — "Way Back"
**Thu Oct 15, 2026 · 6:14 PM HST** (no migration)

Decisions: the user asked for the account screen to copy 4Dungeon, as a menu button in the bottom bar ([S]AVE, so U stays free for [U]NLOCK), then for it to pop up inside the 3D view, then to drop the explaining lines to make room, and to include a download-as-text-file option with the shown save code. 4Dungeon itself saves with a text PASSWORD, a different system, so the look and in-view panel are 4Dungeon's (the bag's `placeInView` arithmetic: one column in, six rows down, 47 by 17) and the logic is Dawn Baton's account screen. Also discussed, not built: one public ledger chain plus ordinary private tables (recommended) instead of two chains; first finder as "first person to walk every tile of a wing" (needs the server to record visits).

- `public/account.js` (new): `openSave(root, {onChange, onClose, fetchApi})` draws the panel: save codes (make; shown once with `DOWNLOAD AS A TEXT FILE`; list with Forget, up to 5), passkeys (add, list, forget), log in with a code or a passkey, log out. Title row sticky at the top, message row sticky at the foot; the rest scrolls. `b64`/`unb64` are Dawn Baton's.
- `public/index.html`: `#save` panel (`.viewpop`), `placeInView`, `S` key and the `[S]AVE` button; while it is open the game keys are ignored and Esc closes it. `public/screen.js`: keys line now `[L]OCATE   [S]AVE`.
- Checked in a real browser (`test/e2e/save.py`, by hand: needs python3 playwright) against the real Worker with SQLite for D1 and a Chromium virtual authenticator: code made, listed, forgotten; second browser logs in with the code (2 devices); wrong code refused; passkey added, cookies cleared, passkey login; fresh player has no log out; Esc closes; game keys ignored while open; no page errors. The download file was read back and contains the code. Not tried on a real phone. Tests 97/97 (one new: the byte helpers against Node's base64url).
- Not done: the first phone still could not find its location (the second phone worked, so it is that phone's settings). A location test page was built and dropped at the user's request.

## v0.01 — "First Steps"
**Thu Oct 15, 2026 · 5:58 PM HST** (new database `irl-dungeon-db`, `schema.sql` loaded once; no migrations yet)

The first release of the rebuild. The earlier irl-dungeon (v0.08, last commit 7930476 at 5:26 AM the same day) was
removed in full (35ea4f9) after an audit found foundation problems, and none of its code was reused: the user asked for
everything to be copied from 4Dungeon and the sibling games instead.

Decisions (the user's, in order):
- Every cell is a dungeon; a cell offers a fresh wing every day; the first finder is credited in the ledger forever;
  old season layers are kept, never deleted.
- The daily key opens one locked door. Walking, and any open cell or open doorway, is free and unlimited. The key and
  the door choice are personal; community doors are "way down the line".
- No breath, no demons, no combat. Rooms are empty for now.
- Layers go sideways first, with room to go down later ("not too quickly"). Season length is unknown, so nothing
  assumes it (4Dungeon's moon quarter, about 7.4 days, is a working guess only).
- "Today" for the key is the player's local day, not UTC (option 1 below; a cell-based time zone lookup was ruled
  out for now because an accurate table is tens of MB).
- Use the real h3-js library for location rather than writing H3 ourselves.
- Custom domain irl.88x31.app.

### Foundation (b790d55, built from Dawn Baton's proven pieces)
- `src/ledger.js`: one SHA-256 hash chain, `hash = SHA-256(prev_hash + "|" + record)`, genesis 64 zeros, `prev_hash
  UNIQUE` so the chain cannot fork and two writers racing for the head cannot both win. `seal` retries up to 8 times
  and reports "sealed" or "duplicate"; `chainInserts` puts an entry in the same D1 batch as the change it records;
  `verifyChain` returns `{ok, count, head}` or `{ok:false, at}`. Known limit: dropping the newest entries is
  undetectable without a copy of the head kept outside the database.
- `src/worker.js`: cookie players created lazily (new players rate limited, 20/hour per address), save codes (10 tries
  per 15 minutes), passkeys (20 per 15 minutes), `/api/account`, `/api/codes`, `/api/load`, `/api/passkey`,
  `/api/logout`, `/api/ledger` (id, kind, record, hashes and a date; never who or the time) and `/api/verify` (cap
  10,000 rows). POSTs must be `application/json` (415 otherwise). The cookie parse is exact: a valid token with junk
  after it is no cookie (a test found a prefix match let `TOKEN!` in).
- `src/saves.js` is identical to Dawn Baton's; `src/passkeys.js` is Dawn Baton's with only the names changed. Passkeys
  use hand-rolled CBOR/COSE and ES256/RS256 checks, single-use challenges and a sign-count check (synced passkeys
  send count 0, so the single-use challenge is the replay defense).
- `schema.sql`: players, ledger, sessions, save_codes, passkeys, passkey_challenges, rate_limits. No game tables.
- Privacy rules carried over: the public ledger shows a date, never an exact time or a player id (`player_id` is its
  own column); the server only ever sees cell ids.

### The floor (ff27b19, 915e0e6)
- `public/floor.js` started as a verbatim copy of daily-dungeon's `floor.js` (commit 43cebc2; only the module wrapper
  differed, checked with a diff) and was then trimmed to empty rooms: removed room kinds, demons, items, silver, clues,
  the locker, bonus and void rooms, painted doors and the heat map. Kept: the wing layout code, the two-locked-doors
  rule with sealing (`isSealed`), the shared `seed` (shape) and private `pseed` (here only the per-player map rotation
  `sym`). It lives in `public/` because the page and, later, the Worker both use it. Wing and door code is meant to
  stay identical to 4Dungeon's; fixes go in both repos.
- Added `seedFor(cell, layer)`: FNV-1a over `irl|<cell>|<layer>`. Provisional: layer is 0 until seasons exist, and
  the server will use the same function to check unlocks.
- Findings from walking 4Dungeon's generator (found while testing, not changed):
  - a full walk builds days+1 wings, not the four its header says;
  - wings are three spaces, except about 0.03% that fall back to one space;
  - `floor.stuck` (a wing that could not be laid out) is reachable although the code comment says "never reached in
    practice": 1 of 6,000 floors with one walking policy, 29 of 20,000 with another (days 6 to 7 only so far). Worth
    fixing in 4Dungeon too.
- To check an unlock on the server, the Worker will need the shared seed and the player's `pseed`/`sym`, because door
  direction labels are rotated per player.

### Local day (a4a7195, 2ab643c)
- `src/day.js`: the browser sends only its UTC offset in minutes; the server applies it to its own clock. Offsets
  outside UTC-12:00 to UTC+14:00 (and non-integers) are refused, so a claimed day is always within one of the UTC day.
  `dayFor` never goes back before the player's last key day, so flying west cannot give a second key.
- `zoneOffset(tz, now)` and `offsetCheck(claimed, tz, now)` compare the claimed offset with the time zone Cloudflare
  infers from the IP (`request.cf.timezone`), as a soft signal that never blocks. Not wired to anything yet: there is
  no key action to record it on.
- Not built: option 3, a time zone from the cell itself (precise tables are tens of MB; a long walk can also cross a
  zone boundary mid-day, which the forward-only rule would have to cover).

### The screen (7caef2e)
- `public/screen.js`: 4Dungeon's 80-column frame (daily-dungeon `screen.js`, 43cebc2), extracted piece by piece:
  constants, `renderView`, the clock helpers, `headerLines`, `finishFrame`. Removed party, HP/MP, silver, ichor, breath,
  the title screen, sky, fights, bag and every menu item the game does not have. The right panel shows only real things
  (cell id, wing and room type, wings built, ROOM n, the map). Three log lines: what is here, what you just did, what
  is ahead. The keys line is the only menu: turn, walk, locate.
- `minimap` in `public/floor.js` is 4Dungeon's, without its locker and stairs marks. It draws only rooms you have been
  in; the window is 5 rows by 29 columns centered on you, so rooms more than one row-pair or three columns away do not
  show (4Dungeon's own behavior).
- `public/walk.js`: turning is free; a step goes through the door you face; a locked door says "The door is locked."
  and opens nothing. Nothing builds another wing without the key.
- `public/index.html`: every character outside plain ASCII sits in a box one cell wide (a kanji, two), so the frame stays
  straight in whatever font the browser falls back to (it was not, before this was added). The private `pseed` is kept
  in `localStorage` (`irl-pseed`) so the map does not rotate between visits.
- `?cell=<id>` shows any cell without being there.

### Location (73a81cf, 7b9ee2f)
- `public/place.js`: position to a resolution-10 cell id with h3-js, then the coordinates are dropped. `cellFromLatLng`
  refuses non-finite and out-of-range values; `isCell` accepts only real resolution-10 ids; `locate` asks the browser.
- `public/vendor/h3-js.es.js` (Uber's h3-js 4.x ES build, Apache-2.0, unedited) with `h3-js-LICENSE.txt` and a
  `README.txt` (download date, SHA-256s, how to update). The file does not state its version. It embeds its memory
  initializer, so its one `XMLHttpRequest` is not reached; a headless-browser run of the page made requests to its own
  origin only, and none contained the coordinates. The shell could not download it (the proxy allows only registries
  and GitHub); the user downloaded and attached it.
- The user's phone sat on "Finding you..." forever. Cause (as far as can be told without the device): the browser's
  own location timeout starts only after the permission question is answered, so a hidden question (an in-app browser,
  a blocked site) never times out. Fix: our own 25-second give-up covering the whole wait, a "blocked for this site"
  message from `navigator.permissions` when it is denied, and a "No answer, try a regular browser" message. Whether
  this was the user's actual cause is not confirmed.

### Version (90d0424)
- `VERSION = "v0.01"` in `public/screen.js`, shown small under the screen's lower right (as in 4Dungeon). A test checks
  it equals the newest `CHANGELOG.md` entry.

### Hosting
- D1 `irl-dungeon-db` (id 9728ba1a-49a9-4ebb-8a2e-af1146508a59, Oceania) created with the Cloudflare tools and loaded
  with `schema.sql`. `wrangler.jsonc` points at it. The Worker is `irl-dungeon` (it was first created as
  `irl-dungeon-db` by mistake, then renamed in the dashboard), connected to the GitHub repo, so a push to `main` is a
  release.
- An older D1 database named `irl-dungeon` (id dd8ebe3a-2c52-4a61-a099-9989c041a629, created Oct 15 4:15 AM HST) still
  exists with the old v0.08 tables (`wings`, `private_ledger`, `public_ledger`, `signatures`, and the shared
  account tables). The user believed it was deleted. Untouched; safe to delete in the dashboard.
- Custom domain irl.88x31.app was added to the Worker (first typed as 88x33 by mistake; "Server not found" was the
  typo, nothing else).
- Pushes: 6268e17 (about 5:38 PM), 73a81cf (about 5:52 PM) and 90d0424 (about 5:58 PM). Only the last carries the
  version number.

### Tests
- 96 tests, `npm test` (Node 22, built-in SQLite standing in for D1). Expected values come from independent sources
  (`node:crypto`, hand-built bytes, raw SQL, `Date.UTC`, a BigInt FNV-1a, a haversine distance, H3's documented
  example). Dozens of deliberate mutations were tried (removing a rule on purpose and checking a test fails); one
  survives as an equivalent mutant (the chain's separate prev-hash check, which the hash recompute already covers) and
  one more (dropping the second rounding in `zoneOffset`) changes nothing observable.
- Page code is checked in headless Chromium with a stubbed geolocation (allowed and denied), not on a real phone.

### Open
- What rooms hold; how long a season is; when layers start going down.
- The server side of the key: unlocking a door, sealed in the ledger, with the day rule and the IP cross-check.
- How many days a floor lasts (currently `FLOOR.DAYS`, 7).
- Anchoring the ledger head outside the database; real-world safety wording; whether signing a find stays.
- Whether the Worker validates cell ids with h3-js or a simpler check.
