# CLUTCH FEED TILT — Dev Changelog — v0.1–v0.5.6

Detailed changelog for CLUTCH FEED TILT (public repo: okayline/clutch-feed-tilt, cft.88x31.app): a daily seeded ASCII
corridor shooter. One corridor per UTC day, the same for everyone; your squad of 4 falls, then you're 1v3; the run is
called CLUTCH, FEED or TILT. Worker `clutch-feed-tilt` + D1 `cft-db`. The public repo keeps a short changelog.
Newest first. Times are Hawaii time (HST), from the commit times.

---

## v0.5.6 — "Slow Pan"
**Wed Oct 21, 2026 · 9:04 AM HST** (no migration)

### Decisions (the owner's)
- Owner, after v0.5.4: "OOH THE TURN IS MUCH BETTER" then "just a lot slower?". Read as "make the turn a lot slower" (my reading, said in the reply).

### What was built
- `TURN_TIME` in `public/app.js` went from 0.8 to 2.4 s, the time the v0.5.2 turn took while walking its 3 tiles at 1.25 tiles/s. Each of the 6 jumps holds for 0.4 s (6 frames at 15 fps). Removed: the 0.8 s turn.

### Tests
- No new test. 9 pass.

## v0.5.5 — "Every Shot"
**Wed Oct 21, 2026 · 9:03 AM HST** (no migration)

### Decisions (the owner's)
- Owner: "i think shots should matter even when you are just walking. you should lower your accuracy if you are just shooting randomly maybe" and "it should make you tilt if you just shoot randomly maybe".

### What was built
- `shoot()` in `public/app.js`: every click is a shot (`P.shots++`, a log line, and a miss adds to `P.streak`, which drives the TILT meter and crosshair shake). Removed: the early return that made a click free when no enemy was out or stepping.
- `label()` is unchanged (TILT if shots > 2.5 x hits), so random shots now push a run toward TILT.
- `MAX_SHOTS` in `src/worker.js` went from 500 to 2000, since clicking while walking can pass 500 and the run would then fail the "possible" check and not be sealed. That's my call, not the owner's; listed in the reply.

### Findings
- Playwright on the playtest copy: 5 clicks at the start while walking gave shots 5, hits 0, log 5, streak 5, and the panel showed `SHOTS 05 ... ACC 0%` and `TILT [#####]`. With shots set to 1234 the panel line is still 80 columns.

### Tests
- No new test. 9 pass.

## v0.5.4 — "Pan"
**Wed Oct 21, 2026 · 9:02 AM HST** (no migration)

### Decisions (the owner's)
- Owner: "the wall characters still move a lot", "only have the vertical lines move when turning, no horizontal", "nothing inbetween the vertical panel borders should be moving at all".

### What was built
- `along(path, s, e = 0)` in `public/engine/corridor.js`: you face the way the stretch you are on goes. On the centre of a room where the rails turn you still face the way in, and `e` (0 to 1) turns you `floor(e * TURN_STEPS) / TURN_STEPS` of the way round. New `turns(path)`: the path indexes where the rails turn. Removed: the eased turn over the 3 tiles around the centre.
- `step()` in `public/app.js`: you walk to the centre of the next turning room (`P.turns`), stop, and turn there over `TURN_TIME = 0.8` s (6 jumps, 2 frames each at 15 fps), then walk on. Turns wait while enemies are out, as walking did.
- `render()`: the projection is cylindrical. Column x looks `(x + 0.5 - 47) * COL` round from your facing, with `COL = 15° / 21`, so the view is 67.1° wide (was 2·atan(0.66) = 66.8°). Rays are unit length, so the DDA depth is the true distance. A 15° jump moves the whole picture exactly 21 columns.
- Wall panels: each face of a wall block is drawn flat, as tall as `H / distance to the face's middle`, one RAMP character all over (by that distance), `_` on its top and bottom rows within 12 tiles, and `|` on its first column (when the face differs from the column to its left) within 9 tiles. Removed: wall height by per-column depth, and seams at `frac < 0.06 || frac > 0.94` of the hit.
- Floor dots: the axis is from the rails (`along(path, s)`, no turn), not the facing, so it doesn't flip halfway through a turn.
- Enemies: placed by angle from your facing (`atan2` less the facing, over `COL`) and sized by true distance; skipped when more than 90° off. `e.sd` (used by `shoot()` against `zbuf`) is now true distance, like `zbuf`.

### Findings
- Playwright on the playtest copy, frozen on the first turning room's centre at each of the 6 steps: the view text of each step, shifted 21 columns, matched the next step everywhere in columns 25–69 of rows 0–19 except the crosshair (10 to 13 cells, which stays put on screen).
- A scripted run (random clicks) walked through both turns of that map (rooms 2 and 4) and finished TILT at s = 42.

### Tests
- The `along()` test is rewritten: `turns()` is `[1]`; on the centre it faces 0° at e = 0, 45° at 0.5, 75° at 0.99; past it 90°. 9 pass.

## v0.5.3 — "Fifteen"
**Wed Oct 21, 2026 · 8:58 AM HST** (no migration)

### Decisions (the owner's)
- Owner: "hmmm, when its turning, the walls are all moving, they all have moving characters all over them. could you make them more static?" then "there's still a lot of motion, could you actually make it like 15fps ?"

### What was built
- `loop()` in `public/app.js`: steps and draws only when 1000/15 ms (less 2 ms of slack) have passed since the last drawn frame, so 15 frames a second. `dt` is now capped at 0.1 s (was 0.05, below one 15 fps frame). A MutationObserver on `#screen` counted 15 updates a second in Chromium. Removed: drawing on every animation frame.
- Wall shading in `render()`: the RAMP character, the seam cut-off (9), the top and bottom edge cut-off (12) and the dim/trail colours now use the distance from you to the centre of the wall block the ray hit, not the ray's perpendicular depth. Turning on the spot doesn't change that distance, so each block keeps its character through a turn. Seams were already at fixed spots on the walls. Removed: per-column depth bands, which slid across the walls when the facing changed.
- `TURN_STEPS = 6` is unchanged.

### Tests
- No new test (drawing only). 9 pass. Checked with Playwright screenshots at six points through the first turn of the playtest map.

## v0.5.2 — "Stutter"
**Wed Oct 21, 2026 · 8:51 AM HST** (no migration)

### Decisions (the owner's)
- Owner: "WOW both the gun AND the turn look great. can you make the turn not so smooth, a little more stuttered/low fps?"

### What was built
- `along()` in `public/engine/corridor.js`: the eased turn fraction is rounded to `TURN_STEPS = 6` steps, so a 90° turn goes 0, 15, 30 ... 90°. Through a turn at s = 5 to 9 (centre 7) the heading came out 0 0 0 0 0 15 30 30 45 60 60 75 90 90 90 90 90 at quarter-tile steps. Where you stand still moves smoothly; only the facing jumps. The frame rate itself is unchanged.
- Removed: the smooth turn.

### Tests
- The `along()` test now also checks every heading through a turn is a whole number of 15° steps. 9 pass.

## v0.5.1 — "Rib Lines"
**Wed Oct 21, 2026 · 8:49 AM HST** (no migration)

### Decisions (the owner's)
- Owner: "can you put more lines on the top going vertically down the gun".

### What was built
- `GUN` rows 2 and 3 in `public/app.js`: `/:|  |:\` and `/: |  | :\`. The `|` pair runs up from the rear sight's notch to the front sight; the `:` lines run beside the slide's edges toward the front. Removed: the empty top of the slide.

### Findings
- Checked locally (Playwright): pointer in the middle of the view; no page errors. Not checked on a phone. A real Glock's slide top is plain; these lines are drawn for the look, not copied from the gun.

### Tests
- 9 pass.

## v0.5 — "Wings"
**Wed Oct 21, 2026 · 8:46 AM HST** (no migration)

### Decisions (the owner's)
- Owner: "can we import the 4dungeon minimap and wing generator into this. and have the ledger make a map that has turns in it?" and "it will still be on-rails". Picked "Two steps: map first" on the card: this release is the map, the turning view and the minimap, still seeded by the date; the ledger-made seed is the next step.
- Owner: "can we share the wing code? or what's up with reusing the code". There is no shared place for code (each repo builds and deploys alone); 4Dungeon's `floor.js` has the wing logic mixed with room kinds, offers, lures and bonus rooms. My recommendation, given to the owner: copy irl-dungeon's trimmed copy byte for byte now, and decide on a shared repo (git submodule) separately. Not checked: whether Workers Builds fetches submodules.

### What was built
- `public/engine/floor.js`: irl-dungeon `public/floor.js` (db6e8d5) copied unchanged; `cmp` against it is clean. CLAUDE.md says not to edit it here.
- `public/engine/corridor.js` `corridor(seed)`: `FLOOR.generate(seed, seed, { days: 3 })` (4 wings), then at every offer the seed opens one of the two locked doors (`growDoor`) until none is left. The rails are the shortest way through open doors from room 0 to the stairs room (4 to 7 rooms over 2,000 seeds, median 6; 35 tiles at the median, the old corridor was 39). Each room is 7 x 7 tiles: wall on its edge, 5 x 5 inside, a 3-wide door through the edge to every built neighbour; a locked door nobody opened stays wall. Rooms off the rails (dead ends) are open to look into.
- Enemies: one in the 2nd or 3rd room on the rails, two in the last room. Each waits in a 1-tile notch in a wall with no door that isn't the one you came in by: a side wall 2 tiles past the room's centre, or the far wall's middle; it steps 1.35 tiles into the room. `s` is how far along the rails it is; you stop 4 short of it and it steps out within 4.2, as before.
- `along(path, s)`: where you are and the way you face; at a room where the rails turn you turn with them over the 3 tiles around its centre (smoothstep).
- `public/app.js`: the raycaster faces any way (`dir` from `along`, the plane to your right; was fixed facing +y, which also drew the world mirrored). Rays step both ways on both axes. Enemies are placed by depth along the facing and the plane. Floor dots run along whichever axis you face more (no lines scroll toward you). The run is `P.s` along the rails (was `P.y`).
- Minimap (`minimap()`): 4Dungeon's, from floor.js, in the squad panel's 6 empty rows: the rooms of the rails you've passed, door gaps, `#` for locked doors, an arrow for your facing, `@` in bright. floor.js draws hallways out of every doorless wall of room 0 (an irl-dungeon rule), so it is handed the floor with every room number moved up by one.
- Removed: the 7 x 46 straight corridor (`MW`, `ML`, `START`, `END`), its alcoves and the fixed-forward camera.

### Findings
- Checked locally (Playwright, today's seed 4261358203, 2026-10-21): a scripted run clicking across the middle of the view killed all 3 and ended TILT at s = 42 with no page errors; screenshots along the way show the rooms, doors and the minimap. Not looked at on a phone. Not looked at mid-turn frame by frame.
- First try used `days: 4` (5 wings, 5 to 9 rooms): a run took about 40 s of walking. Cut to 3.
- Enemies first stepped 0.85 into the room and stood near the edge of the view; now 1.35.

### Tests
- The corridor test now checks, for 5 seeds: at least 4 rooms; every step on the rails is one room N/E/S/W through open tiles; the rails turn at least once; 3 enemies, each in an open notch stepping onto an open tile. New: `along()` on a hand-made east-then-south path (halfway along, at the turn facing south-east, after it facing south). 9 pass.

## v0.4.4 — "Sight Line"
**Wed Oct 21, 2026 · 8:47 AM HST** (no migration)

### Decisions (the owner's)
- Owner: "keep the one you made, it feels great to shoot" (v0.4.3, over a still of a fixed 45° viewmodel that was not built in). Asked for a bit of barrel in front; I added a muzzle over the front sight as a first v0.4.4, then the owner said "can you make it like it was before ... for the gun barrel". That commit was never pushed and was dropped (both repos), not reverted.
- Owner then sent a sketch: an outline rising from the rear sight's outer edges, stepping up to a small top at the front sight, and "make it accurate to reality? of what that slight angle would look like?"

### What was built
- `GUN` in `public/app.js`, top 4 rows: the top of the slide seen from a little above, `_.||._` (front end with the front sight post), then `/      \` and `/        \` widening toward you, then the rear sight across the slide's back edge, `_/_o_|  |_o_\_`. 18 x 11 (was 18 x 9). The top 4 rows flash gold when it fires (was 2).
- How the shape was worked out: a box model of a Glock 17 in mm (slide 186 x 25.5 x 30, sights, frame, guard, grip at 22°) ray-cast into the game's 94 x 34 view with the walls' projection (71 columns and 34 rows per unit at depth 1), eye 15 cm behind the slide and 4 cm above its top, looking along the bore. The top of the slide came out 3 to 4 rows tall, 12 columns wide at the back and about 5 at the front (0.45 of the width); the drawing keeps those proportions at the gun's 16-column slide. The front sight (3.6 mm) is under one column at that distance, so it is drawn as `||`. The script is not in the repo.
- Removed: `_||_` (the front sight in the notch) and `___o|    |o___`.

### Findings
- Checked locally (Playwright): pointer in the middle of the view; no page errors. Not checked on a phone.

### Tests
- 8 pass.

## v0.4.3 — "Cover Plate"
**Wed Oct 21, 2026 · 8:35 AM HST** (no migration)

### Decisions (the owner's)
- Owner: "yeah way better with the gun! can it not move up and down so much? and a bit more detailed (but accurate)? you can make it bigger if necessary."

### What was built
- `GUN` in `public/app.js`: 18 x 9 (was 14 x 7). Top to bottom: front sight post in the rear notch (`_||_`), rear sight with its two white dots (`___o|    |o___`), the slide's top edge (`|==============|`), the slide cover plate on its back (a box inside the slide), the slide's bottom, the frame (`|__________|`), the top of the textured grip (`|########|`).
- `render()`: the gun is one row lower only once `|lean| > GUN_SWING / 2`, plus one row while it fires. Removed: the `round(lean² / 32)` dip (up to 2 rows).

### Findings
- Checked locally (Playwright): pointer at 2%, 30%, 50% and 98%; at 50% the gun sits on the bottom 9 rows, at 98% one row lower; no page errors. Not checked on a phone. The drawing is from my memory of a Glock's back, not from a reference picture.

### Tests
- 8 pass.

## v0.4.2 — "Glock"
**Wed Oct 21, 2026 · 8:33 AM HST** (no migration)

### Decisions (the owner's)
- Owner: "gun could you make it more stiff? have the sides more straight. also, could you base the design off a real gun?"

### What was built
- `GUN` in `public/app.js`: a Glock 17 seen from behind, 14 x 7: front sight post in the rear sight's notch (`_||_`), rear sight, slide serrations (`|========|`), slide, frame (`|___##___|`), top of the grip. Every side is `|`.
- `render()`: the gun is drawn as one block, offset by `lean` (still at most 8 cells, `(P.gx - W / 2) * 0.2`) and dipping `round(lean² / 32)` rows. Removed: the per-row skew and the `/` `\` barrel from v0.4.1, and the flared `/##\` drawing.

### Findings
- Checked locally (Playwright): pointer at 2%, 30%, 50% and 98% across the view; the gun moved as one piece, 2 rows lower at both edges; no page errors. Not checked on a phone.

### Tests
- 8 pass.

## v0.4.1 — "Swing"
**Wed Oct 21, 2026 · 8:24 AM HST** (no migration)

### Decisions (the owner's)
- Owner: "for the gun, could it not move so much, and have it attached at the middle of the screen and like move in an arc?"

### What was built
- `render()` in `public/app.js`: the gun's bottom row stays centred at `W / 2`. `lean = clamp((P.gx - W / 2) * 0.2, ±GUN_SWING)` with `GUN_SWING = 8`; each row shifts by `lean * (rows above the grip) / 6`, so the muzzle moves most and the grip not at all; the gun drops `round(lean² / 32)` rows (2 at full swing); the two barrel rows draw `/` or `\` once `|lean| > 2`. `P.gx` still eases toward the pointer in `step()`.
- Removed: the whole gun following the pointer across the view (v0.3.7).

### Findings
- First try was a 12-cell swing with `lean² / 48` and `* 0.3`: at full swing the gun dropped 3 rows and most of it went below the view. Cut to the numbers above.
- Checked locally (Playwright): pointer at 2%, 30%, 50% and 98% across the view; the muzzle leaned 8 left, 4 left, straight and 8 right; no page errors. Not checked on a phone.

### Tests
- 8 pass (no new test: the page code has no tests).

## v0.4 — "Sealed"
**Wed Oct 21, 2026 · 8:11 AM HST** (migration 002, not yet run live)

### Decisions (the owner's)
- Owner: "can we work on a ledger?" I proposed the smallest version and the owner picked "Build the smallest version" on the decision card: a `runs` table and a ledger, `POST /api/run`, the page sends the run and shows today's sealed run, one test. Not in it: a public ledger page, the registry checkpoint, ghosts from real runs.
- Told the owner before building: the run is played in the browser with frame-time countdowns (`e.fire -= dt`), so the server can't replay it the way scoundrel.exe does (`G.replay`). A sealed record is what the page reported, checked only for being possible. A made-up possible run sent with curl would be sealed.

### What was built
- `migrations/002_ledger.sql` and `schema.sql`: `runs` (player_id, day, label, hp, shots, hits; `UNIQUE (player_id, day)`) and `ledger` (kind, day, run_id, record, `prev_hash UNIQUE`, `hash UNIQUE`; unique index on run_id for kind 'run').
- `src/ledger.js`: `GENESIS`, `sha256`, `head`, `chainInsert`, `isUnique`, copied from aura-farm `src/ledger.js`. `chainInsert` finds the run id by (player, day) with `INSERT ... SELECT ... FROM runs`, so the entry goes in only if the run did. `verifyChain` was left out (nothing calls it yet).
- `src/worker.js` `POST /api/run {day, hp, shots, hits, log}`: 409 if `day` isn't today's UTC day or the player already sealed today; 400 unless HP 0-3, shots 0-500, hits <= shots, hits = every enemy (3) when alive and fewer when dead, one `[t, col, row, hit]` per shot with times not going backwards, and hit flags adding up to `hits`. The label comes from `label()` on the server, never from the page. The run row and the ledger entry are one D1 batch; a `prev_hash` clash retries from the new head up to 3 times. Makes a player if there is none (`needPlayer`). Record: `{day, player, hp, shots, hits, label, log}` (player id, never the name).
- `GET /api/today` also returns `run`: your sealed run today with its entry number and hash, or null.
- `public/app.js`: `finish()` calls `seal()`; the status row says SEALING..., SEALED: LEDGER ENTRY #n or NOT SEALED., and a log line gives the entry and the first 8 hex of its hash, or the server's error. `showSealed()` shows today's sealed run on load (its banner, stats, everyone down) instead of a new run. The end banner moved to `endBanner()`.
- `public/index.html`: note says one run a day.
- Removed: the RUN IT BACK button with its `.controls` and `button` CSS (nothing else used them), unlimited runs, "RUNS AREN'T SAVED YET.", the schema comment calling names "two-word" (they're gamer tags since v0.3.1).

### Findings
- Checked locally (Playwright, Node server with SQLite for D1, no Accounts): left the run alone until the enemies killed me; it sealed as FEED, entry shown in the log. Reloaded: the sealed FEED banner and "TODAY'S RUN IS SEALED" showed, no new run. No page errors. A won run was not played through in the browser (the test covers CLUTCH). Not checked on a phone.
- My first log line was longer than the 77 characters a log line fits, so it was cut; shortened before the commit.
- The run timer keeps counting after a run ends (it did before too: `P.t += dt` comes before the `P.done` check). On the sealed view it counts from page load, not the run's time. Not changed.
- Switching to another player with a save code during the day doesn't reload today's run; a finished run then gets a 409 if that player already sealed today. Not changed.
- Migration 002 has to be run on the live `cft-db` before this is pushed.

### Tests
- One new test: impossible runs are refused (log disagrees with hits, wrong log length, dead with every enemy down, yesterday's day), the server's label wins over the page's, hashes match `node:crypto` SHA-256(prev + "|" + record) from GENESIS and then from the first entry, one run a day, `/api/today` shows the sealed run. The migrations test now runs 001 and 002. 8 pass.

## v0.3.8 — "Over the Gun"
**Wed Oct 21, 2026 · 8:02 AM HST** (no migration)

### Decisions (the owner's)
- Owner: "the crosshair shouldn't be able to go underneath the gun".

### What was built
- `GUN` moved to the top of `public/app.js`; `aimAt()` stops the crosshair's row at `H - GUN.length - 2` (row 25), so its bottom arm (one row below) is still above the gun's top row (27). Was `H - 2`.
- Removed: the crosshair being able to sit behind the gun.

### Findings
- My first edit put a `//` comment before the closing `};` of `aimAt`, which broke the whole page script ("Unexpected end of input"). `npm test` still passed because no test loads `app.js`. Found by loading the page in a browser, fixed with `node --check`, before the commit. There is no test or check that would catch this again.
- Checked locally: mouse at the very bottom of the view puts the crosshair on row 25.

### Tests
- 7 pass.

## v0.3.7 — "Big Gun"
**Wed Oct 21, 2026 · 8:00 AM HST** (no migration)

### Decisions (the owner's)
- Owner: "can you have the gun at the bottom, a little bigger, and follow the crosshair from left to right?" and "could you not have the horizontal lines scroll downwards on the floor".

### What was built
- `render()` in `public/app.js`: the gun is a 7-row, 14-column drawing at the bottom of the view, centred on `P.gx`, which `step()` eases toward the pointer column (`P.gx += (P.aim - P.gx) * min(1, dt * 14)`). It drops a row and its barrel turns gold while the gun flashes. Was 3 rows, fixed at the right.
- The floor grid keeps the lines running along the corridor (`fx < 0.05`) and drops the cross lines (`fy < 0.07`), which moved toward you as you walked.
- Removed: the small fixed gun and the cross lines on the floor.

### Findings
- Checked locally: the gun's left edge was at column 8 with the mouse at 15% of the view and 74 at 85%; no page errors. Not checked on a phone.
- While the USER panel is open the run is paused, so the gun stays where it was.

### Tests
- 7 pass.

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
