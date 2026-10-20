# Dawn Baton — Dev Changelog — v0.1–v0.17

Detailed changelog for Dawn Baton (public repo: okayline/dawn-baton): a daily check-in game synced to the real
sun. 24 fixed solar bands, one baton that travels west once a day, one picked-from-lists stamp per player per lap,
all on one SHA-256 hash chain. Companion to Daily Digital Demon Dungeon. The public repo keeps a shorter changelog.
Newest first. Times are Hawaii time (HST).

---

## v0.24 — "One Record"
**Tue Oct 20, 2026 · 2:31 AM HST** (no migration; needs dungeon-items with `Registry.checkpoint` deployed first)

### Decisions (the owner's)
- Owner (Oct 20, HST): no separate Bitcoin stamp per game; "i want everything on the shared registry, that's the point of it"; Dawn Baton once a day, scoundrel.exe after every run, and the stamps visible on the registry ledger page.

### What was built
- `src/worker.js` `ledgerCheckpoint`, run after `batonCopy` on each request in its own try/catch: once the last closed lap's band-23 entry is sealed, reads the ledger up to that entry, checks it with `verifyChain`, and sends `REGISTRY.checkpoint({ game: "dawn-baton", entries, head })`. Fixed to that entry, so a retry sends the same values and the registry adds nothing. A `WeakMap` per database remembers the lap once the registry took it.
- Removed: `GET /api/ledger/head` and its test (v0.23), and the Dawn Baton line in 88x31-anchors `stamp.py` (no receipts had been made). Also removed from 88x31-anchors: `__pycache__/stamp.cpython-313.pyc`, which I committed by mistake in v0.23's push.

- Later (owner: "more information about the baton"): the checkpoint carries `detail` from `lapDetail`: lap, people, bots, unheld, the 24 colours as hex (null for none) and the tune (s/l/- a band). All already public on Yesterday once the lap closes. One more test (hex checked against Python colorsys); 47 tests pass. Then (owner: "take out # of bots"): `bots` removed from the detail; the test now checks it is absent. 47 tests pass.

### Tests
- The head-route test is replaced by one checkpoint test: none while the lap is open, exactly one at close, equal to the count and hash up to the band-23 row (from raw SQL); it fails if the call is removed. 46 tests pass.

## v0.23 — "Proof of Dawn"
**Tue Oct 20, 2026 · 2:22 AM HST** (no migration; the 88x31-anchors change must go on main only after this is deployed)

### Decisions (the owner's)
- Dawn Baton's ledger gets the same hourly Bitcoin timestamp as the 88x31 ledger and the shared registry (Oct 20, HST). Not written into the shared registry: bots and unheld bands have no player, a mark needs a copy that exists and is held, and 25 entries a day would push the registry past its 10,000-entry chain check in about a year.

### What was built
- `src/worker.js` `ledgerHead`, route `GET /api/ledger/head`: reads the whole ledger, checks the chain with `verifyChain`, returns `{ ok, entries, head }` (the newest hash, or 64 zeros when empty) or `{ ok: false, broken_at }`. No contents, no players.
- 88x31-anchors `stamp.py`: a third `Ledger("Dawn Baton", https://dawn.88x31.app/api/ledger/head, "dawn-baton")`. Receipts go in `dawn-baton/`, with their own `log.md`. A failure there doesn't stop the other two ledgers (the script already fails at the end). README there: "Three ledgers".
- Dawn Baton README: "hourly OpenTimestamps anchoring" removed from "Not yet".

### Findings and shortcuts
- Checked locally: `fetch_head` parses the new shape and the three ledger list is right. `ots` isn't installed in the sandbox, so no real receipt was made; the first one comes from the Action's next run after both repos are on main.
- Other chains not anchored yet: irl-dungeon (`/api/verify` returns a head) and scoundrel.exe (a ledger route, no head route found). 4Dungeon: no own chain found.
- Removed: nothing.

### Tests
- One new test: `/api/ledger/head` equals the last row's hash and the row count, and a record edited by hand makes it answer `ok: false` at that entry. 46 tests pass.

## v0.22 — "Quick Key"
**Tue Oct 20, 2026 · 1:18 AM HST** (no migration; ships with the dungeon-items `info()` batch below)

### Decisions (the owner's)
- The Account tab was slow to load after a passkey login; batch the account reads and push it (Oct 20, HST, thread on passkeys: "yeah can you do that? ... you can build it and push it").

### What was built
- Counted from the code, not timed: after a passkey login `GET /api/account` made about 11 sequential database or Accounts trips (player lookup 4, `accountFor` 2, `info` 4, the device count 1).
- dungeon-items `src/accounts.js` `info()`: the account check and its three reads (codes, passkeys, games) go in one `db.batch`, so one trip instead of four. Every game's account page calls it. The fake D1 in its `test/helpers.mjs` now returns rows for a `SELECT` in a batch, as D1 does.
- `src/worker.js` `account()`: the device count runs alongside `accountFor` + `info` (`Promise.all`) instead of after them.
- Removed: three sequential trips in `info()` and one wait in `account()`. Nothing on screen changed.

### Findings and shortcuts
- Not changed: `player()` still makes up to 4 sequential trips (token lookup, sessions lookup, two `seen_at` writes), and `accountFor` still reads `accountOf` and the legacy `save_codes` one after the other.
- Not measured after the change; the check is timing a logged-in `/api/account` on the live site.

### Tests
- No new test (no new rule). 45 tests pass here; dungeon-items 73 pass, plus a hand check of `info()` on hand-built rows (an account with one code, one passkey, two games; and a missing account gives 404).

## v0.21 — "Quick Dawn"
**Tue Oct 20, 2026 · 12:51 AM HST** (no migration)

### Decisions (the owner's)
- Tab clicks felt slow; make them faster (Oct 20, HST). "Opens in" on Catch gets seconds and milliseconds.

### What was built
- Timed from the build sandbox against the live site (v0.20): the page 0.34s, a route that never touches the database (`/api/nope`) 0.17s, `today`/`planet`/`lap` 0.86 to 1.17s. So about 0.75s a click was database round trips: `settle()` (two laps, each a seal attempt that fails on the unique index, plus a read of the sealed bands; about 6 sequential trips by my count) and v0.20's `batonCopy` (one more).
- `src/worker.js`: `settle()` remembers per database (a `WeakMap` on `env.DB`) the key `currentLap:bandsClosed` it last finished, and returns at once when it is unchanged; it only has work when a lap opens or a window closes. `batonCopy` remembers the last closed lap that had no baton left to make. A failed run sets neither, so it retries. If Workers hands each request a new `env.DB` object the memory just never hits: slower, not wrong (sealing and `birth` are repeat-safe).
- `public/index.html`: `load()` puts "Loading…" in a tab that has never been filled; `durMs` and a 47 ms timer make the Catch "Opens in" line show h, m, s and ms (tabular digits, paused while the page is hidden). The other countdowns still tick every 30 s in whole minutes.

### Findings and shortcuts
- Not changed: `players.seen_at` is still written on every request, and Catch can still wait up to 2 s on Open-Meteo in the player's own open window.
- Not measured after the change (the check is the same timing against the live site once deployed).
- Removed: the per-request lap sweep when nothing has closed.

### Tests
- One new test: settle's band sweep runs once, not again at the same moment or a few minutes later, and runs again once bands have closed. It fails if the early return is removed. 45 tests pass.

## v0.20 — "Keepsake"
**Tue Oct 20, 2026 · 12:26 AM HST** (migration 007; needs dungeon-items' baton seeded on `items-db` first)

### Decisions (the owner's)
- Dawn Baton writes its baton into the shared registry every day: a real item, `relic`, one numbered copy per lap (Oct 20, HST). From the write-up `analysis/dawn-baton-registry.md` in the project files. The "pass something along to a stranger" idea stays on hold.

### What was built
- `wrangler.jsonc`: a second service binding, `REGISTRY` (dungeon-items, entrypoint `Registry`).
- `src/worker.js` `batonCopy`, run after `settle` on every request inside its own try/catch: finds the oldest closed lap that has a human stamp, has its last band (index 23) sealed, and has no `lap_copies` row. The holder is one of that lap's human stampers (ordered by band), index `parseInt(hash[0..8], 16) % count` of the band-23 entry's hash, so anyone can check it from the public ledger. Looks up the item id once with `REGISTRY.itemIds("dawn-baton", ["baton"])`, then `REGISTRY.birth({ itemId, game: "dawn-baton", playerId, key: "lap:<n>" })` and saves the row. One lap per request. Laps already closed before this version get their copies too, oldest first, made now (not back-dated).
- `GET /api/lap` gains `baton: { item, copy }`, only for the player who got it (null for everyone else). Yesterday shows "You carried this lap's baton home" with a link to `https://88x31.app/registry?item=&copy=`.
- `migrations/007_lap_copies.sql` and `schema.sql`: `lap_copies (lap, item_id, copy, player_id, made_at)`.

### Findings and shortcuts
- A lap with no human stamper makes no copy (a copy needs a real player, and numbers can't skip), so copy numbers count held laps, not days.
- If the item isn't seeded or the registry refuses, every request retries one RPC and logs it. Fine at today's traffic.
- Not checked: the registry link on 88x31.app (taken from dungeon-items' changelog, "served on 88x31.app at `/registry`").
- Removed: nothing.

### Tests
- One new test (fake registry): no copy while the lap is open, one copy at close for the stamper picked from the band-23 hash (worked out from raw SQL in the test), only that player sees `baton`, no second birth on a later request, a lap with nobody makes none. 44 tests pass.

## v0.19 — "Twenty-Four"
**Mon Oct 19, 2026 · 8:15 PM HST** (no migration)

`engine/version.js` 0.18 to 0.19, matching `CHANGELOG.md`; 43 tests pass.
- **24-hour time everywhere** (owner's ask, all games): `hm`, `hms` and the new ledger page's stamps use `hourCycle: "h23"` (were `hour: "numeric"`, 12-hour in US locales; the ledger stamp was the locale default). `clock()` moved from `hour12: false` to `hourCycle: "h23"`, which never prints "24:05" after midnight. No test covers page text; syntax checked. Removed: nothing.

## v0.18 — "Open Book"
**Mon Oct 19, 2026 · 8:00 PM HST** (no migration)

### Decisions (the owner's)
- The ledgers should be open and readable (Oct 19, HST): Dawn Baton gets a ledger page. Every entry shows its exact time, newest first.

### What was built
- `public/index.html`: a Ledger section and a footer link. It reads the existing `GET /api/ledger?limit=40&before=` (40 an entry page, an "Older" button), and lists laps, stamps and unheld bands newest first with the local date and time and the first 12 characters of each entry's `prev_hash` and `hash`. A stamp in the lap that is still open shows only its band ("hidden until the lap is over"); the Worker already withholds its contents. Band names are `solar UTC+n` (band index 12 minus the index).
- `engine/version.js` 0.17 to 0.18, matching `CHANGELOG.md`.

### Findings and shortcuts
- No Worker change: the route and its hiding rule were already there, the page just never used them. Removed: nothing.

### Tests
- No new test (page-only change; checked in headless Chromium with a stubbed `/api/ledger`, no page errors). 43 tests pass.

## v0.17 — "One Key"
**Sat Oct 17, 2026 · 2:45 AM HST** (no migration here; migration 003 ran on the shared `items-db`)

### Decisions (the owner's)
- One passkey for all the games on `88x31.app`; accounts live in dungeon-items; "wire in the last two".

### What was built
- Save codes and passkeys moved out of this Worker into the `Accounts` entrypoint of dungeon-items (service binding `ACCOUNTS`). This game keeps its own players, cookie and sessions; the account says which player here is whose (`account_players` in `items-db`, game name `dawn-baton`). `src/passkeys.js` was removed; `src/saves.js` keeps the token, session and rate-limit helpers.
- Logging in (code or passkey) gives an account; `enter` uses the account's player here, else this browser's own player if it has no account, else makes one.
- Players from before: their `save_codes` rows move to the account the first time the player is seen (`accountFor`), then the rows are deleted. A not-yet-moved code still logs in. Old passkey rows are left unused.

### Findings and shortcuts
- Passkeys made here before can't carry over: a passkey is bound to its exact address and the shared one is `88x31.app`. Their owners have save codes.
- `ACCOUNTS.md` in dungeon-items has the whole design.

### Tests
- The game's own tests run against a stand-in for the accounts service (`fakeAccounts` in the test file); the real accounts code and its passkey crypto are tested in dungeon-items.
- Added: old code moves over once; login reuses or links the right player; a passkey adds and logs in; with no `ACCOUNTS` binding the game answers 503.

## v0.16 — "Next Up"
**Thu Oct 15, 2026 · 4:22 PM HST** (no migration)

Decisions: the user's swatches looked dark and dull on their screen. A palette redo was mocked up (sunrise and soft pastels) and then dropped: the cause was a dark-mode browser extension on their side, and the colors were fine. The fix is a `color-scheme: dark` declaration so dark-mode features leave the page alone; extensions such as Dark Reader may still ignore it. On Yesterday, a picked stamp takes the "Your stamp" spot at the top and the player's own stamp drops into the list at its natural place, still outlined (the proof line only shows while the player's stamp is on top). After passing the baton, and on Yesterday's "didn't catch" card, the next window shows as a live countdown with the local time (same "23h 40m" format as the other countdowns).

- Page: `<meta name="color-scheme" content="dark">` in the head (also makes the browser draw the band dropdown, checkbox and scrollbar in dark style; not looked at on a real device). `cdText` gained a `"next"` kind ("Your next window is in 15h 00m at 7:18 AM."), used by the Passed state in `catchScreen` and by the didn't-catch card in `payoffScreen`; the 30 second ticker keeps both live. `nextWindow` was removed (unused). Passed card wording changed.
- Yesterday: `#top` holds the "Your stamp" box (`myBox`) or the picked stamp; `strandRender(sel)` swaps it. With a pick from another band, the list continues after the picked stamp and wraps (the picked one is not repeated); picking your own band or nothing keeps the old behaviour.
- Words (in place): "Fresh day, let's go!" to "New day, fresh start!", "talking to my coffee" to "sipping coffee", "waving at the sun" to "mid-workout", "a good song" to "good music", "a long walk" to "a friend".
- Tests 41/41 (none cover page code). Checked in a headless browser with stubbed data; not tried on a real phone or the live site.

## v0.15 — "Fresh Words"
**Thu Oct 15, 2026 · 4:00 PM HST** (no migration)

Decisions: the user raised that players' privacy is the hardest thing to balance, so the rules were written down (`privacy-rules.md`, in this repo) and checked against the code. That found that finished stamp records, which `/api/ledger` publishes, held the player's id, so anyone could follow one id across laps (band, time, band moves) even if the player hid their name. The user had earlier asked about a public and a private ledger. The fix keeps one chain: the sealed record no longer holds the id, and who stamped lives only in the ledger table's own `player_id` column, which no endpoint publishes (a second ledger would only add a second chain to keep in sync). The user chose not to round public seal times to the hour. Words: the user reworded most replies and six vibe-check words, and asked for three more "bringing" answers. A 2 hour band grace period was tried and dropped (the user said it invites abuse); it stays 1 hour.

- Privacy: `stampRecord` (`src/ledger.js`) no longer writes `player`. `parse` in `src/worker.js` takes `player` from the row's `player_id` column, so "mine", names and streaks work as before. Stamps sealed before this release keep their id in the record forever (changing them would break the chain), so the earlier laps stay linkable. Test added: the public ledger shows no player id, and your own stamp and name are still found.
- Replies (`PHRASES`, rewritten in place, 20 entries): the last two ("Right back at you, early bird.", "Onwards!!") became "Let's goo!" and "We got this.", so every saved index still points at a reply. Vibe check (`FEELINGS`, in place): restless to excited, cranky to vibey, misty to cooked, giddy to pretty good, thankful to blessed, a bit off to chill. Bringing (`SIGNOFFS`): "one (1) plan" to "exactly (1) plan", "my comfy hoodie" to "comfy hoodie", and "blind faith", "a dollar and a dream", "a smile" appended (13 entries). Stamps already sent show the new words in the same slots.
- Tests 41/41. The stamp panel was checked in a headless browser with stubbed data (all lists wrap fine); not tried on a real phone or the live site.

## v0.14 — "Tune Your Band"
**Thu Oct 15, 2026 · 3:45 PM HST** (migration 006, run on the live baton-db before the push)

Decisions: a player's band should follow where they are, but not be locked hard, since people travel and rough location is wrong sometimes. Chosen by the user: suggest the band from rough location (option 1) and limit changes (option 3), with extra friction on changing. Rejected: setting it automatically, a hard lock, and exact browser location. Rules: a first-time player gets their location's band preselected (not saved until they press the button); the first pick can be fixed within 1 hour; after that a change is locked for 7 days; the same band is never an error; players from before the migration get one free change. The first-join card is titled "Tune your band" (was "Find your band"); the user wants no labels and no explainer lines, so the suggestion is not labelled and the lock is not explained on first pick. A README for players (longer How to Play) sits above the developer notes.

- Migration `006_band_lock.sql`: `ALTER TABLE players ADD COLUMN band_set_at INTEGER` (seconds). Run on the live database through the Cloudflare D1 tool after checking the column was missing, and the column was checked present afterwards. `schema.sql` updated.
- Server: `bandChangeAt(me, t)` returns when a change is next allowed (null if allowed). `setBand` returns 403 "You can change your band again in N day(s)." while locked; inside the grace hour it keeps the original `band_set_at`, so the lock runs from the first pick. `/api/today` returns `suggest` (offset from rough location, first-time players only). `/api/account` returns `band: { offset, canChangeAt }`.
- Page: `bandPicker(cur, suggest)` preselects the suggestion. Account's "Your band" card shows the band, then "Change band…" reveals the picker, whose Change button asks `confirm()` first. While locked it shows "You can change it again on <date>" with no controls.
- Found while testing: a pure-longitude guess puts Honolulu (157.9 W) in solar UTC-11, one band west of the -10 where the user plays. Not changed yet; a Honolulu player would see -11 preselected.
- Tests 40/40 (two new: lock timing, location suggestion). Page behavior checked in a headless browser with stubbed data (cancelling the confirm sends nothing). Not tried on a real phone or the live site.

## v0.13 — "Your Dawn"
**Thu Oct 15, 2026 · 3:30 PM HST** (no migration)

Decisions: the Catch globe should turn slower (1.2 degrees a second, was 2). "Your dawn" is for information about you and your dawn, not settings, so the band picker moves to Account. The user picked local time and the streak from a list of options (other ideas not taken: who holds the baton in words, lap number, seasonal moment, neighbours, last stamp colour). Layout chosen by the user, top to bottom: countdown (bigger, bold), "SOLAR UTC-10, 15:25 local time" (24 hour clock), sunrise and sunset, day length with the change since yesterday, streak. The baton's number goes under the gold baton dot in the strip and nowhere else (replaces a "baton is in -7" line).

- Rotation: `G.lam -= 0.3` degrees per 250 ms tick (was 0.5).
- Server (`src/worker.js`): `streakOf(ctx, playerId, last)` counts consecutive laps the player stamped, back from `last`: the current lap if the window is open and they have stamped, else the lap before. It reads `ledger` (`kind = 'stamp'`), so no migration. `/api/today` returns `streak`. `/api/account` returns `band: { offset }` (null with no band) so Account can show the picker.
- Page: `catchScreen` builds the new "Your dawn" lines; `sunLine` now emits the sunrise/sunset line and the day length line separately (also used by "Today's sun" on the no-band screen). `data-clock` spans update every 30 seconds beside the countdown ticker. The old "opens at (weekday time)" suffix on the countdown was dropped, and the separate window-times line was tried and removed. `wireBand` reloads Account when used there. Strip: `bandNo(i)` under the lead dot (row 3, or row 4 when it is also the player's band, under "Here").
- Streak is untested against a real database. Tests 38/38 (none cover page code or the streak query). Checked in a headless browser with stubbed data; not tried on a real phone or the live site.

## v0.12 — "How To"
**Thu Oct 15, 2026 · 3:20 PM HST** (no migration)

Decisions: the user found the game heavy and asked for a How To. It is one separate page (not a pop-up), opened from a "How to Play" link in the footer beside the version ("Dawn Baton v0.12 · How to Play"); a [ ? ] tab was tried first and moved. Wording was drafted in chat and edited by the user: the opener says it is a game about connecting with people through the Sun's real position, "band" is used everywhere (not "slice"), Settle and Lean are not explained, and "Tap Catch" was dropped. The user expects to rewrite it later. Waiting bands were mocked up in five colours and the user chose pale gray (the old dark slate read as night). The globe's sun marker is now a sun emoji so the white ring only means "you".

- `helpScreen()` fills a new `#help` section with five cards (What is this?, Your band, Catch it, Yesterday, The globe). `show("help")` is reached from `#howto` in the footer; the globe panel is hidden on that screen like on Account. The footer is now `<span id="ver">` plus the link, so the version text can be set without wiping the link.
- `GLOBE_COL.waiting` is `[120, 124, 140]` (was `[56, 60, 112]`). The sun marker is `fillText("\u2600\uFE0F")` at the sun's point (visible half only), 18 css px.
- The "Here" ring in the strip is already 2px white in the code; the user's screenshot showed it dim, which was not reproduced. Worth checking on a phone.
- Tests 38/38 (none cover page code). Checked in a headless browser with stubbed data; not tried on a real phone or the live site.

## v0.11 — "Slow Turn"
**Thu Oct 15, 2026 · 3:05 PM HST** (no migration)

Decisions: changing your band should update the globe at once. On Yesterday, picking a band or stamp brings that stamp to the top of the strand list (right under the player's own stamps), keeping the order after it. No dimming or lighting change on Yesterday when a band is picked (the user asked for the lighting to stay the same). The Catch globe turns slowly when untouched, first resting at the player's band (the user asked for about 3 seconds; 8 was tried first), and should redraw less (fine motion not needed).

- Band change (`wireBand`): clears `G.dragged` and `G.auto`, reloads Catch and calls `refreshGlobe()`, so the globe re-centres on the new band.
- Yesterday: `pickBand` only toggles `G.sel` (white edge) and turns the globe; the sun is no longer moved to that band's sunrise. `strandRender(sel)` rotates the list so the picked band comes first and the rest follow in order, wrapping round; `expanded` keeps the "show all" state.
- Catch rotation: an interval every 250 ms moves `G.lam` by 0.5 degrees (about 2 degrees a second, 4 redraws a second), only on the Catch tab, with the globe on the player's point of view, the page visible, and reduced-motion off. `busyUntil` pauses it: 3 s after arriving on Catch (`refreshGlobe`), 0.5 s spin + 3 s after tapping the white dot or any `spinTo`, and 3.5 s after any drag event.
- Tests 38/38 (none cover page code). Timing checked in a headless browser with stubbed data: 0 degrees moved in the first 2 s, turning after 3 s. Not tried on a real phone or the live site.

## v0.10 — "Look Around"
**Thu Oct 15, 2026 · 2:55 PM HST** (no migration)

Decisions: one shared globe above Catch, Yesterday and Planet and none on Account, tilted 10 degrees (20 and straight-on were compared as pictures). Yesterday colours the globe from the lap that is showing, and tapping a band or a stamp turns it. For Catch the user chose the globe centred on the player over centred on the baton, wanted the baton shown when it is on the far side (edge arrow and a strip of dots were mocked up, the strip won), liked a gold outline on the baton's bands drawn dotted when they are on the far side, and asked for a slow drag. Countdown lines go in "Your dawn" (the "opens at … stays open 2 hours" wording is gone). Every dot in the strip turns the globe; the white dot is home and the gold lead dot is the baton. Words: the line "The white ring is where the sun is straight overhead." was dropped (the user dislikes explainer lines), and the "Back to my band" button was dropped once the white dot did the same job. The Planet globe is not draggable (user's call earlier); only the Catch globe is, and only sideways, so vertical swipes still scroll the page on a phone.

- Structure (`index.html`): `drawGlobe(cv, g)` now takes a state `g = { cols, mine, lam, sunMs, sel, baton, pov }`. `liveState(bands)` builds today's state from `/api/planet` (colours by status, centred on the newest open band); `lapState(l)` builds a finished lap from `l.stamps` (each band in its mood colour from `palette`, blue if it has no colour, dark for gaps; the sun is drawn at the lap start, or at that band's opening time when one is picked). `G` holds what is on screen. `refreshGlobe()` runs on tab changes and every 30 seconds (not on Yesterday, where the lap is fixed). The panel is `#gw`; the old Planet-only globe panel and the sun line under it were removed.
- Tilt 10 degrees (`phi0`). White edge for the picked band is painted about 2 screen pixels thick (`T = round(2 * dpr)`), to match the ring on the strip's "you" dot. Gold baton edges (`g.baton`, Catch only) are drawn as the two outer meridians of the open bands: solid where they face us, dotted (`setLineDash`) where they are on the far side.
- Catch: centred on the player's band (`mine` in `/api/planet`); with no band chosen it stays on the baton. Drag moves longitude at half speed (`k * 0.5`; 100 px is about 16 degrees), `touch-action: pan-y`. A drag survives the 30 second refresh (`G.dragged`). Strip (`drawStrip`, `#strip`): 24 cells in band order, dot per band by status, the player's band ringed in white, "baton" over the newest open band and "Here" under the player's band; each cell is a tap target with `data-b`. Countdown: `cdText` and `dur`, updated every 30 seconds through `[data-cd]` without redrawing the screen.
- Yesterday: lap-bar cells and strand entries carry `data-b`; `pickBand` turns the globe (500 ms, shortest way round, `spinTo`), edges the band in white and re-lights the sun at that band's sunrise; tapping again returns. The page scrolls the globe into view when needed.
- Bugs found while building, all fixed: the live refresh could finish after the lap was ready and paint over it (now checked again after the request returns); the strip first assigned to the global `open` and replaced `window.open` (now a local); a stray comma after an edit broke the whole page script (caught by a syntax check, not by the test suite, which never loads `index.html`).
- Tests 38/38 (none cover the page's drawing code). Checked in a headless browser with stubbed API data, including every strip dot, drag, refresh, tab changes and fractional pixel ratios; not tried on a real phone and not listened to or looked at on the live site.

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
