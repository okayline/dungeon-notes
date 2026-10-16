# Dawn Baton — Dev Changelog — v0.1–v0.9

Detailed changelog for Dawn Baton (public repo: okayline/dawn-baton): a daily check-in game synced to the real
sun. 24 fixed solar bands, one baton that travels west once a day, one picked-from-lists stamp per player per lap,
all on one SHA-256 hash chain. Companion to Daily Digital Demon Dungeon. The public repo keeps a shorter changelog.
Newest first. Times are Hawaii time (HST).

---

## v0.9 — "The Big Picture"
**Thu Oct 15, 2026 · 2:35 PM HST** (no migration)

Decisions: the user asked for a real-time globe with the bands sectioned out, liked a first draft shown in chat, then asked for it on the Planet tab, not draggable, and then a light country outline map for context. The globe is a fixed view: it follows the baton by itself and has no controls. The outline had to be shipped with the site, not loaded from another website. The user also set a rule this session: say what is about to be added and wait for a yes before adding things that were not asked for.

- Globe (`drawGlobe`, `GLOBE_COL` in `index.html`): an orthographic projection on a 2D canvas, drawn per pixel. Each pixel is mapped back to a latitude and longitude, then to its band (`offset = round(lon / 15)`, with -12 folded into +12 and `index = 12 - offset`), coloured from the real status of that band in `/api/planet` (`open` gold, `stamped` and `bot` blue, `unheld` very dark, `waiting` slate; odd bands 10% lighter), then darkened by how far the pixel is from daylight (sun position from the day of the year and the UTC time; a soft edge at the terminator). Band boundaries are darkened one pixel wide. Band numbers sit on the equator, green for the player's own band. A white ring marks the point under the sun.
- View: fixed 20 degree tilt, centred on the newest open band (or on the latest band that has been stamped or gone unheld if none are open, or band 0). Redrawn every 30 seconds while the Planet tab is showing (`globeTimer`, stopped when the tab changes). No pointer handlers and no buttons.
- Bug found in the first draft: with a fractional device pixel ratio (such as 1.33) the canvas size was not a whole number, so most pixels were never written and the picture came out as stripes. The size is now `Math.round(360 * dpr)`. Checked at 1.33 and 2.
- Outlines: `public/world.json`, 289 rings and 9,267 points in 95 KB, as flat `[lon, lat, lon, lat, ...]` arrays rounded to 0.1 degree with steps under 0.4 degrees dropped. The source is the public-domain (Unlicense) `johan/world.geo.json` `countries.geo.json`. `mkworld.mjs` converted it (not kept in the repo). Shared borders are drawn twice, which is not noticeable. Loaded once with `fetch("/world.json")` and drawn as a pale 1px line on the visible half only, under the band numbers. If the file does not load, the globe is drawn without it. The data is coarse: small islands and fine coastline are missing.
- Environment notes: the npm registry could not be reached from the sandbox and `raw.githubusercontent.com` was refused (403), so the data was taken with a shallow `git clone` of the public repo instead.
- Tests 38/38. There are no tests for the globe (it is all drawing code). Checked with Playwright and a stubbed API; not looked at on a real phone.

## v0.8 — "Moving Notes"
**Thu Oct 15, 2026 · 2:20 PM HST** (no migration)

Decisions: the user wanted the Settle and Lean pitches to move every day, and chose the "melody that wanders" over a plain new key each day, with the pitch based only on the notes the player can hear (the last three). The quote on the last-band card stays the reply to "Morning, sunshine ☀️" and, when that was skipped, falls back to one of the player's other picks (a random-from-everything quote was considered and rejected because it stops the replies working as replies). The user wants account names to be a Shuffle button only, no dropdowns and no explainer line, and the starry background off the Yesterday lap bar with empty cells left see-through. Process note: the user said Claude must explain what it is about to add and wait for a yes. Claude had built a three-note sliding window for Yesterday's tune without being asked; it was reverted to one run through the whole lap.

- Pitch (`index.html`, all client-side): `stepFrom` (Settle one step toward home, floored at home; Lean one step away; a rest holds), `walkIdx`, `freqAt(lap, i)` (home = C4 raised by `(lap * 5) % 12` semitones, steps along the scale `[0, 2, 4, 7, 9, 12, 14, 16]` and capped at its end) and `noteFreq(lap, before, note)` (null for a rest). `tone()` now takes a frequency instead of a note name.
- Catch: the ▶ button plays `heard` (last three notes, now one every 0.55 s instead of 0.9) with each pitch following from the notes before it; Settle/Lean buttons sound one step from where `heard` ends. Yesterday: "Play the tune" walks the whole lap from home, 0.25 s per note as before.
- Checked in a headless browser: on lap 118 with heard = settle, rest, lean, Settle lands near 294 Hz and Lean near 370 Hz; lap 119 shifts both up a fourth; three Leans climb 330, 370, 440 Hz. Not listened to by ear.
- Last-band quote: when `phrase` is empty and any of feeling, gesture or sign-off exists, one of them (chosen from the stamp's own indices, so the same one every time) becomes the quote and is removed from the chips.
- Account: the two selects and Save name are gone; Shuffle picks a random pair, posts it, retries with the server's `suggestion` if the pair is taken, and reloads. The "Two words, from lists…" line is removed.
- Removed the `.sky` star CSS and the twinkle animation; the lap bar's empty cells show the panel colour.
- Tests 38/38. There are no tests for the pitch maths because it lives in the page, not the engine.

## v0.7 — "Vibe Check"
**Thu Oct 15, 2026 · 2:05 PM HST** (no migration)

Decisions: the user wants helper text kept off the screens ("they always put extra explaining sentences in there"), so every hint line under a question and the line under the band picker were removed. Questions and answers are to be casual, a little jokey, a little gen-z but not too much, and never about leaving or goodbyes. Rejected: "Land it, or leave it hanging?" (got the user stuck; back to "Does the tune settle, or lean?"), "Any last words?", and a different question every day (a previous session found it needs too many answers to write). Direction for later, not built: mostly fixed questions plus one weekly question, cycling "What's in your bag today?", "What's your superpower today?" and "What's the small win today?" (the week would come from the lap number, so nothing extra is stored). The user likes the no-context chips on Yesterday ("mid-yawn" with no "you caught me" in front) and wants half morning and half not-morning answers.

- Questions (`ASK` in `index.html`): color "What color is your morning?", note "Does the tune settle, or lean?", phrase "Morning, sunshine ☀️", feeling "Vibe check?", gesture "You caught me…", signoff "What are you bringing today?". Hints are gone; only the "You're first this lap: any line will do." line remains when nobody has stamped.
- Answers (`engine/baton.js`): `PHRASES` (20, 10 morning and 10 not), `FEELINGS` (14), `GESTURES` (12, 6 and 6) and `SIGNOFFS` (10, "a good song", "snacks, obviously", "one (1) plan" and so on) were all rewritten in place. Positions and counts are unchanged.
- Ledger caution: stamps store list positions, so lap 1's sealed stamps now read in the new wording. That is harmless a few hours after launch. From here on, new wording must be appended to the end of a list and existing entries left alone.
- `NOTE_WORD` in `index.html` shows Resolve/Tension as Settle/Lean on the Catch buttons, the Yesterday chips and tooltips, and the legend. The stored and API values are still `resolve` and `tension`, so sealed stamps and sounds are unaffected.
- Last-band card: the "+9 · a while ago" line moved to the top of the card.
- Removed the "Every slot is optional. Your stamp seals when you pass it." line.
- Tests 38/38. Checked in a headless browser with a stubbed API at 440px wide.

## v0.6 — "One of a Kind"
**Thu Oct 15, 2026 · 1:33 PM HST** (migration `005_band_sky.sql`, applied to the live database through the Cloudflare connector at about 1:31 PM, before the push)

Decisions: the user did not want numbers on duplicate names ("just reroll the name"), and said crowding can be dealt with when it happens. The user asked for a version number on the site and for two changelogs kept up to date on every push, and asked that Claude push only when told (the user talks a lot, then builds): Claude builds locally as asked and commits, and pushes (and writes the changelog entries) only on an explicit say.

- `setName`: no tag arithmetic any more. It tries `UPDATE players SET name_a, name_b`; the unique index `players_name` (name_a, name_b, name_tag) rejects a pair someone else holds (`name_tag` is always 0 now). On that UNIQUE failure nothing is saved and the reply is `409 { error, suggestion: { a, b } }`, where `freeName(db)` tries up to 30 random pairs for one nobody has. Saving your own current pair is a no-op; moving to another pair frees the old one.
- `Oops` gained `.extra`, merged into the error JSON (used for `suggestion`).
- UI: on a `suggestion` the two selects switch to it and a line says it was taken; the player presses Save name again or Shuffle. Nothing is forced on them.
- `nameText(a, b)` no longer takes a tag; `/api/account` `name` is `{ a, b, text }`. The `name_tag` column stays (the live database already has it) but is unused.
- Version: `engine/version.js` exports `VERSION` ("0.6"). `/api/today` returns `version`; `catchScreen` writes "Dawn Baton v0.6" into the footer. Footer has bottom padding so the admin bar doesn't cover it.
- New test: `today` reports `VERSION`, and the newest `## v…` heading in `CHANGELOG.md` equals it, so the two can't drift.
- `CLAUDE.md` in the repo records the push routine (bump `VERSION`, add the public entry, add this entry, push both).
- Tests 31/31 at this point. The reroll UI (selects switching to the suggestion) is not browser-checked.

Later in the same batch (decisions: the user wanted hidden-then-shown previous-band info with no captions, "I just don't like explicitly labeling everything"; fixed questions per slot with a weekly rotating question still to come; empty lap cells transparent over stars after pastel, stripes and dark fills were rejected; the tune stays in the previous-band section because it is part of what that player left):

- Stamp slots: `ASK` in `index.html` gives each slot a question and hint; "Start the strand." when you're first. Choosing Resolve/Tension calls `tone()`.
- Audio: one shared `AudioContext`, `live` oscillator set, `stopSound()`. The Catch ▶ plays `heard` (last 3 notes, 0.9 s apart, null = rest) and toggles to ■; the Yesterday "Play the tune"/"Stop the tune" toggle does the same for the lap.
- `today.heard` = notes of the last 3 earlier stamps (oldest first). `today.prev` = color, note, phrase, feeling, gesture, signoff, sky, plus `offset` (band number, no label) and `ago` ("just now" under 15 min, "a while ago" under 3 h, else "hours ago"). Never band label, name, exact time, hash, player or bot flag. Two existing tests updated for the new fields.
- Yesterday: `lapN` navigation (◀ ▶, bounded by `first`/`lastClosedLap`), missed-lap message with `next` window, strand entries numbered `#N · label · name`, quote on top with a 30px weather icon on the right, time to the second plus minutes into the window, color swatch (dashed box if none), chips for note/feeling/gesture/sign-off.
- Lap bar: `.sky` starry background with twinkle (reduced motion respected), 24 cells at hsl 62%/60% (frost unchanged), empty cells transparent, a weather icon row (gaps get a dimmed `fillSky` icon), a note-symbol row, a key. Counts and caption lines removed.
- `band_sky` table (migration 005, `schema.sql`): one Open-Meteo request for a stand-in city per band (`BAND_CITIES`), cached per (lap, band), never in the ledger. Real Open-Meteo calls are untested (the sandbox can't reach it); failures fall back to "unknown".
- Tests 38/38. Browser checks done with Playwright and a stubbed API; the "+9 · a while ago" line is not checked at phone width.

## v0.5 — "Two Words"
**Thu Oct 15, 2026 · 12:33 PM HST** (migration `004_names.sql`, applied to the live database through the Cloudflare connector at about 12:32 PM, before the push)

Decisions: the user chose two word lists first, with codex words usable in names later. Claude proposed (and the user accepted) storing a name as word ids rather than text so codex ids can be added without migrating. Other options were discussed and not taken: word plus number, three words, glyph and color, dawn-themed pairs, assigned, anonymous, earned names. The user later chose unique names with no numbers (v0.6); v0.5 shipped with numbered duplicates ("Quiet Heron 2").

- `engine/baton.js`: `NAME_ADJECTIVES` (40) and `NAME_NOUNS` (40); ids are `adj:N` / `noun:N`; `nameWord(id)`, `nameText(a, b, tag)`, `checkName(a, b)` (first must be `adj:`, second `noun:`, both known). Lists are append-only because the ids are stored.
- `players` gains `name_a`, `name_b`, `name_tag`, `signs` (default 1) and unique index `players_name` on (name_a, name_b, name_tag) where name_a is not null.
- `POST /api/name {a, b, signs}`: creates the player if needed; duplicate pairs got the next `name_tag` (retry up to 6 times on a UNIQUE race). `/api/account` returns `name` and `names` (the two lists) and `signs`.
- Names are not sealed. `lapView` looks up `name_a/name_b/signs` for the players on a closed lap's stamps at read time (one `IN (...)` query) and adds `name` (null for gaps, bots and players who turned signing off). A test checks no name text or `adj:`/`noun:` appears in any ledger record.
- Bug found by the tests: a brand-new player picking a name first got `player: false` back, because `account(ctx)` read the cookie that the same response was only just setting. `setName` now passes the player row to `account(ctx, known)`.
- UI: Account tab "Your name" panel (two selects, Shuffle, Save name, "Show my name on my stamps" checkbox); strand rows show the name; admin fixtures include names. The real name lists are kept from the first `/api/account` for the preview fixtures.
- Tests 30/30.

## v0.4 — "Sky and Slots"
**Thu Oct 15, 2026 · 12:30 PM HST** (migration `003_admin.sql`, applied live through the Cloudflare connector before the push; player 2, the one with the user's passkey and save code, was set `admin = 1` by hand)

Decisions: the user asked what feelings, gestures and sign-offs are (Claude: extra optional pick-from-a-list slots; reply phrase answers the line before), asked for the sunrise and day-length line, and for an admin mode that shows every screen without touching the ledger or anything in the game, on the X key as in the Dungeon. Mid-build the user asked for a save code download button and for the name to be Dawn Baton. Claude recommended two-word list names over typed names (open text is the risk); not built in this version.

- Slots (`engine/baton.js`): `PHRASES` 20, `FEELINGS` 14, `GESTURES` 12, `SIGNOFFS` 10. A stamp stores indices (null = blank). `checkStamp` returns `{color, note, phrase, feeling, gesture, signoff}` and refuses an out-of-range or non-integer index. `stampRecord` carries all four (old records without them read back as null). Bots pick each slot from a hash of the lap and band, left blank about 1 in 4 (phrase) or 1 in 3 (the rest).
- `view()` returns the slots; `/api/today` returns `lists`, and the line before is shown with its extras. Yesterday has a strand (first 6 with a phrase, plus yours, "Show all").
- Sun (`engine/sun.js`, NOAA's general solar calculation): `sunDay(lat, lon, ms)` → rise/set (UTC ms), length, or polar "day"/"night" when `cosH` is outside ±1; `sunEvent(lon, ms)` finds the local solar day holding an equinox (declination changes sign) or a solstice (declination slope changes sign); `sunReport` adds the change from yesterday's length. Based on the request's rough place (`coarsePlace`: Cloudflare's lat/lon rounded to a degree; `env.GEO` overrides for tests and local dev; never stored). Honolulu on Oct 15 gives 06:27 HST rise and 11h 40m day.
- Admin: `players.admin`; `/api/account` returns `admin`. X (not in a text field) opens a bar with 18 made-up scenarios: Catch (no band, waiting, open with a line before, open and first, already passed, equinox, polar night), Yesterday (full lap, mostly unheld, you missed it, none yet), Planet (mid-lap, just started, last bands, not started), Account (new player, codes and a passkey, just made a code). In preview `api()` refuses every write with "Preview mode: nothing was sent." and every read comes from fixtures; X again closes it. Checked in headless Chromium with the API mocked: 18 scenarios, 0 page errors, 0 network writes.
- Save code download: "Download as a text file" in the new-code panel (`dawn-baton-save-code.txt`, with the address and a "keep this private" note).
- Rename Band Baton → Dawn Baton in the page title, header, passkey name, README, docs and tests. (The working copy already had most of the rename applied when Claude got to it.)
- Fixes: `[hidden]` was being overridden by `#adm { display: flex }`, so the admin bar stayed on screen after closing; added `[hidden]{display:none!important}`. The first Honolulu sunrise test expectation (06:19) was wrong from memory; checked by hand to 06:27.
- Tests 26/26.

## v0.3 — "Home Address"
**Thu Oct 15, 2026 · 12:18 PM HST** (no migration)

Decisions: the user chose `dawn.88x31.app`, then asked if lap 1 could start sooner than the original Oct 17 launch time; Claude confirmed the ledger was empty (0 rows) before moving `LAUNCH_START`, because changing it later would invalidate sealed laps.

- `wrangler.jsonc`: route `dawn.88x31.app` (custom domain) and `CANONICAL_HOST`, so a dashboard-only domain isn't dropped by a later deploy. `*.workers.dev` requests get a 301 to the canonical host (passkeys belong to one address). Test added.
- `LAUNCH_START` 2026-10-17T18:00Z → 2026-10-15T18:00Z (the date-line band's 06:00 solar sunrise). With it, Honolulu (band 22, solar UTC-10) opens 22 hours in: Oct 16 6:00 AM HST.
- Deploys now come from the GitHub repo through Cloudflare (Workers Builds, deploy command `npx wrangler deploy`, project name `dawn-baton`); the user's own `database_id` edit to `wrangler.jsonc` is commit 3a9472d.
- Tests 18/18.

## v0.2 — "Keys"
**Thu Oct 15, 2026 · 12:13 PM HST** (migration `002_saves.sql`, applied live through the Cloudflare connector before the push)

Decisions: the user asked for save codes and passkeys; Claude ported them from scoundrel.exe unchanged except for names. Passkeys only work on the exact address they were made on; a save code is the backup.

- `src/saves.js` (save codes `K7QM-2XPA-9RTD-HV4C-8NBE`: 20 characters from a 31-symbol alphabet, only the hash is stored, up to 5 per player; `newSession` for extra devices; `rateLimit` per hashed IP) and `src/passkeys.js` (WebAuthn with WebCrypto and a small CBOR reader; rp name "Dawn Baton"). Tables: `sessions`, `save_codes`, `passkeys`, `passkey_challenges`, `rate_limits`.
- `player(ctx)` now finds a player by `players.token_hash` or a `sessions` row. Routes: `/api/account`, `/api/codes`, `/api/load` (10 tries per 15 minutes), `/api/passkey`, `/api/logout` (needs a save code or passkey first).
- Account tab with the same flows. Passkey registration and login are not browser-tested (the tests cover options, the failure path, and everything around them).
- Tests 17/17.

## v0.1 — "First Light"
**Thu Oct 15, 2026 · 11:55 AM HST** (migration `001_init.sql`, applied by the user with `wrangler d1 execute baton-db --remote --file=schema.sql`)

Decisions (from the design conversation, notes in `docs/`): 24 fixed solar bands of 15° (objective, never redrawn); a lap is one trip of the baton around the planet, starting at the date-line band's 06:00 solar sunrise and moving one band an hour; each band has a catch window; a stamp is picked from lists only; the sky report is automatic; contents are hidden until a lap closes; one ledger, not two; thin bands get bots or show as unheld. Reused from scoundrel.exe: `chainInserts`-style sealing, the cookie player, D1 batch transactions, the fake-D1 test harness.

- `engine/baton.js`: `BANDS` 24, `WINDOW_H` 2; band index 0 = solar UTC+12 … 23 = UTC-11; `bandFromLon`/`bandFromOffset` (−12 joins +12); `lapStart`, `opensAt`, `closesAt`, `lapClosesAt` (last band's window end, 25 h after the lap starts), `currentLap`, `lastClosedLap`, `windowFor`. 12 mood colors, notes (resolve, tension), 8 sky words, `skyFromWmo`.
- Ledger (`src/ledger.js`): one chain, kinds `lap`, `stamp`, `gap`; `hash = SHA-256(prev_hash + "|" + record)`; `seal` retries up to 8 times when another writer took the head; unique indexes `ledger_one_lap`, `ledger_one_band` (a band holds a lap once: stamp or gap) and `ledger_one_player`. Records hold player ids, never names, coarse place or raw weather. `verifyChain` for tests.
- Worker: cookie players (only token hashes stored), lazy `settle()` on every request (opens laps and seals any band whose window ended with no stamp: a deterministic bot stamp from `sha256(BOT_SECRET|lap|band)` when `BOTS=1`, otherwise a `gap`). Routes `today`, `band`, `stamp`, `planet`, `lap`, `ledger`. You see the line before yours only inside your own window; the ledger hides contents of laps still in progress.
- Weather (`src/weather.js`): Open-Meteo from Cloudflare's rough location, any failure is "unknown". Open-Meteo's free tier is non-commercial: check before the game earns money.
- Three screens (Catch, Yesterday, Planet) in the 88x31 style from the mockups. `docs/` holds the design notes and the three mockups; the payoff mockup's "unheld" row still shows a sentence (noted in the doc, not fixed).
- Tests 12/12.
