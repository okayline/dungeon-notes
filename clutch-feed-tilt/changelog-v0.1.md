# CLUTCH FEED TILT — Dev Changelog — v0.1–v0.3.6

Detailed changelog for CLUTCH FEED TILT (public repo: okayline/clutch-feed-tilt, cft.88x31.app): a daily seeded ASCII
corridor shooter. One corridor per UTC day, the same for everyone; your squad of 4 falls, then you're 1v3; the run is
called CLUTCH, FEED or TILT. Worker `clutch-feed-tilt` + D1 `cft-db`. The public repo keeps a short changelog.
Newest first. Times are Hawaii time (HST), from the commit times.

---

## v0.3.6 — "Boxed In"
**Wed Oct 21, 2026 · 7:55 AM HST** (no migration)

### Decisions (the owner's)
- Owner sent a screenshot of the CLUTCH box with no words. I read it as the box looking wrong (my reading, not confirmed): it had no right border, and the text sat left of centre.

### What was built
- `showBanner()` in `public/app.js`: every line is padded to the box width with the text centred and closed with `|`. The width is the longest line plus 4.
- Removed: the 1.6x width for the "big" style (there is no `.big` rule in the CSS, so the box was wider than its text) and the open right side.

### Tests
- 7 pass. Checked the 1v3 box text as rendered: all rows the same width.

## v0.3.5 — "Log Lines"
**Wed Oct 21, 2026 · 7:52 AM HST** (no migration)

### Decisions (the owner's)
- Owner: "can you make it match 4dungeon's layout please, with the 3 log lines yes". Then: "once any text box pops up i cant click it off" and "the crosshair starts going crazy waving back and forth as the run goes on or as i click more".

### What was built
- `frame()` in `public/app.js`: under the view, `+===+`, three log lines, `+---+`, the status/buttons row, `+===+` (4Dungeon's bottom, daily-dungeon `screen.js:443-466`). The screen is 27 rows, was 23. The log lines are the kill feed (last 3, up to 77 characters); the squad panel keeps its 6 blank rows where the feed was.
- `.banner[hidden] { display: none }`: `.banner` had `display: flex`, which beat the `hidden` attribute, so an empty full-view overlay was always there (it only worked because it had `pointer-events: none`). With clicks now going to the banner, it would have eaten every shot. The whole banner area closes on `pointerdown`.
- `shoot()`: a click with no enemy stepping out or out fires the gun (flash) but doesn't count as a shot, a miss or tilt. v0.3.3 counted those, so early clicks piled up the miss streak.
- Jitter: `(min(5, streak) - 1) * 0.7` per sine pair, was `(streak - 1) * 1.4` with no cap, so it grew without limit. The most it moves now is about 5.6 cells.
- Removed: the kill feed panel, shots counted with nothing to shoot at, the uncapped jitter, the always-present overlay.

### Findings
- Checked locally: 27 rows, all 80 wide, no page errors. An early click: SHOTS 00. The 1v3 box closed from a click in its corner. Many misses: TILT meter full, no errors. Not looked at on a phone beyond the row count.
- Not changed: the banner can still cover a shot meant for an enemy while the 1v3 box is up (about 1.6 s); a click closes it.

### Tests
- 7 pass.

## v0.3.4 — "Aim Up"
**Wed Oct 21, 2026 · 7:45 AM HST** (3f41327, no migration)

### Decisions (the owner's)
- Owner: the crosshair only moved sideways; "crosshair follow mouse". Earlier the same morning: keep the game on rails ("yeah on rails may be good"), so no movement controls.

### What was built
- `public/app.js`: `P.aimY` (starts at `H / 2 - 1`); `aimAt(ev)` sets both `P.aim` and `P.aimY` from the pointer, `P.aimY` kept inside rows 1 to `H - 2`. The crosshair is drawn at `Math.round(P.aimY)` instead of the fixed row `Math.floor(H / 2) - 1`.
- `render()` stores each enemy's drawn rows as `e.sy = [top, bot]`; `shoot(col, row)` needs `row` inside `e.sy[0] - 1 .. e.sy[1]` as well as the column test. The shot log is now `[t, col, row, hit]`.
- Removed: the fixed crosshair row and column-only hits.

### Findings
- Checked in a local browser (Playwright, fake D1/Accounts): mouse at 15% and 80% of the view put the crosshair on rows 5 and 27; 12 clicks along the top edge in the 1v3 all missed; a sweep across the body band hit. No page errors. Not checked on a phone.

### Tests
- 7 pass (no new test: the page code has no tests).

## v0.3.3 — "Trigger Happy"
**Wed Oct 21, 2026 · 7:43 AM HST** (523d3cf, no migration)

### Decisions (the owner's)
- Owner: "the 3d part doesn't really respond to my clicks". Reproduced: `shoot()` returned while `P.phase === "push"` (the first ~5 s), so SHOTS stayed 00. Owner: "lets start with letting clicks shoot".

### What was built
- `shoot()` returns only when the run is over. Shots in the push count as misses (no enemy is out yet), so they add to SHOTS, lower ACC and fill the TILT meter, and can make a won run TILT.
- Removed: the push phase ignoring clicks.

### Tests
- 7 pass. Checked locally: SHOTS went up from the first clicks while "YOUR SQUAD PUSHES IN" showed.

## v0.3.2 — "Click Away"
**Wed Oct 21, 2026 · 7:42 AM HST** (dbecaa0, no migration)

### Decisions (the owner's)
- Owner: "i cant click the text boxes away in the 3d view".

### What was built
- `.banner pre` takes pointer events; a `pointerdown` on it hides the banner and sets `bannerT = 0`. The `.banner` box around it still lets clicks through, so only the box itself closes, and that click is not a shot.
- Removed: the end-of-run box (bannerT Infinity) staying until RUN IT BACK.

### Findings and shortcuts
- My first commit had `public/engine/version.js` emptied by my edit script (opened for writing before reading); the version test failed, the file was restored and the commit amended before anything was pushed.
- Checked locally: played to FEED, clicked the box: hidden, SHOTS still 00. CLUTCH and TILT boxes not clicked.

### Tests
- 7 pass.

## v0.3.1 — "Same Size"
**Wed Oct 21, 2026 · 7:38 AM HST** (f202202, no migration)

### Decisions (the owner's)
- Owner: "can you make the window the same size as the 4Dungeon and scoundrel windows? ... i think its 2x as big now?" and "can we get names like lagspike, mogger99 or tiltproof?"

### What was built
- `public/index.html`: 4Dungeon's sizing (daily-dungeon index.html): `.game` font `clamp(6px, calc((100vw - 32px) / 49), 22px)`, line-height 1.05; at max-width 700px, 4px side padding and `calc((100vw - 8px) / 32.5)`. `.view`, `.banner`, `.panel` at `top: 3.15em; height: 17.85em` (3 and 17 rows x 1.05).
- `src/names.js`: 40 lowercase words (lagspike, tiltproof, mogger, ragequit, ...), 4 in 10 get a two-digit number (mogger99). Longest is 11 + 2 characters, under the 16 limit.
- Removed: the JS `fit()` that measured a `#measure` span to set the font size, and the CamelCase PREFIXES x NOUNS list from v0.3. Existing names stay until rerolled.

### Findings
- Measured locally: desktop 1100 wide, font 21.8px, frame 697 x 526px; phone 390 wide, font 11.75px, frame 376px. Not compared side by side with the live 4Dungeon page.

### Tests
- The name test now expects `/^[a-z][a-z0-9]{3,15}$/`. 7 pass.

## v0.3 — "Gamer Tags"
**Wed Oct 21, 2026 · 7:35 AM HST** (4d74785, no migration)

### Decisions (the owner's)
- Owner: "can we get a name reroll button please hehe and can you make it fps gamer names???"

### What was built
- `src/names.js` `giveName(env, p, { reroll })`: picks a name nobody has (`name_key` is UNIQUE, lowercase), up to 40 tries; `POST /api/name` rerolls (401 with no player). [REROLL NAME] in the USER panel; the squad panel shows the new name at once.
- Removed: the two-word names for new players.

### Tests
- One new test: names are unique, a reroll changes the name and `name_key` follows it.

## v0.2.1 — "Version Tag"
**Wed Oct 21, 2026 · 7:33 AM HST** (f27f966, no migration)

- Owner: "can you add a version # to the app page". `public/engine/version.js` `VERSION`, shown under the frame at the right (`.ver`). A test checks the newest CHANGELOG.md heading matches it. Removed: nothing on screen before.

## v0.2 — "Log In"
**Wed Oct 21, 2026 · 7:21–7:32 AM HST** (57e6ca8, d694c3a, 328cb09; migration 001)

### Decisions (the owner's)
- Owner: "can you add login and passkey stuff?" The USER panel opens inside the 3D view like 4Dungeon's, not over the whole screen like scoundrel.exe. Save code: COPY and DOWNLOAD as .txt like scoundrel.exe. No text glow. The game sits lower and in the middle of the window.

### What was built
- Shared Accounts (dungeon-items `Accounts` entrypoint, service binding `ACCOUNTS`), game name `clutch-feed-tilt`, cookie `cft`: `GET /api/account`, `POST /api/codes`, `/api/load`, `/api/passkey`, `/api/logout`. Code copied from aura-farm. Passkeys need an 88x31.app host, so `CANONICAL_HOST` sends *.workers.dev to cft.88x31.app.
- `public/account.js`: the USER panel (4Dungeon accountBox layout, sticky title and message, [BUTTONS] inline), WebAuthn helpers from aura-farm, no browser popups. The run pauses while it's open. [U]SER in the status bar and the U key; frame buttons use `pointerdown` because the frame is redrawn every animation frame.
- D1 `cft-db` (id c901f5df-a8cc-4ce2-afd9-774282c20d52), created 7:20 AM HST; `migrations/001_players.sql` (players, sessions, rate_limits) run live. `wrangler.jsonc` route cft.88x31.app.
- Removed: text-shadow on bright and gold text, the fixed top gap, and the game running without a database.

### Tests
- Save codes, passkeys and logout against fake D1 + fake Accounts (copied from aura-farm's tests); migrations build the same tables as `schema.sql`.

## v0.1 — "1v3"
**Wed Oct 21, 2026 · 7:16 AM HST** (ddefd11, no database)

### Decisions (the owner's)
- A game of its own built on the CLUTCH > FEED > TILT trio (from Aura Farm), FPS angle. One seeded corridor per UTC day, the same for everyone. Teammates are ghosts of other players' saved runs (yesterday's for the first player, bots as fallback); they fall and leave you 1v3. Run named CLUTCH (won, shots <= 2.5 x hits), TILT (won, more misses), FEED (died). One run a day, replays unlock tomorrow, runs sealed on a hash-chain ledger (not built yet). Look: 4Dungeon's 80-column frame and VT323, the 3D view as an ASCII raycaster. Page first, new repo.

### What was built
- `public/engine/corridor.js` (pure rules): 7 x 46 map, 3 enemies in alcoves, `corridor(seed)` with mulberry32, `label()`.
- `src/worker.js` `GET /api/today`: UTC day and seed = first 4 bytes of SHA-256("cft:" + day).
- `public/app.js`: raycaster at 94 x 34 half-size characters inside the 47 x 17 view, the frame, squad and kill feed panel, banners, the TILT jitter.

### Shortcuts
- Teammates are stand-in names from a fixed list, scripted to die; runs aren't saved; no ledger yet.
