# TriviaMoba — Dev Changelog — v0.1–v0.7

Detailed changelog for TriviaMoba (repo okayline/triviamoba, renamed from trivial-moba): trivia in three MOBA lanes. Worker `triviamoba`, connected to the repo. Since v0.3 a Worker with a backend in the moba-beat D1 (sharing SCATTER.EXE's tables); the page shows its version since v0.3.1. v0.1–v0.2 were numbered here from the commits. Newest first. Times are Hawaii time (HST).

Written after the fact (Oct 22) from the commit messages; the owner's decisions are not recorded here.

---

## v0.7
**Fri Oct 23, 2026 · 4:36 AM HST** (not pushed when written)
- **Owner:** "does int move forward a square when it gives a heal??", Claude: only if you heal INT's own lane; owner: "int always moves forward a square with a right answer AND it gets a heal".
- **Changed:** `lanes.js`: a right INT answer moves INT `INT_PUSH` (1) and heals `target` `HEAL` (1); new `healGain(target)` (2 for INT's own pad, else 1) used by the pad's "+N" and the heal glow; reveal verdict "Pushed, healed X", its note names both markers. Tests hand-worked: `[0,1,1]`, `[0,1,3]`, `[1,1,4]`, `[1,2,5]`.
- **Simulation (20,000 games, one right-answer rate, fixed strategies), rounds to win at 50/70/90% right:** STR 8.0/4.7/3.4, DEF 6.6/4.3/3.3, INT healing itself 8.0/4.7/3.4 (the same as STR, since it moves 2 per right answer), INT healing the other lane that is furthest 10.0/7.2/5.6.
- **Flagged to the owner:** healing INT itself moves INT 2, which is the speed the owner had just backed away from ("way too fast").
- **Not checked:** how it feels at the owner's accuracy; mixed strategies.
- **Owner:** "leave it as is with a note to balance please? and push what you have!" Left as built; the balance note is in `design.md` (open item 1).

## v0.6.1
**Fri Oct 23, 2026 · 4:33 AM HST** (not pushed when written)
- **Owner:** "the game is way too fast already, we need to slow it down. the INT heal should only be +1". Before that Claude tried DEF at +1 (`DEF_PUSH`) on the owner's "yes please" and simulated it: DEF only, shielding itself, took 12.6/7.5/5.6 rounds at 50/70/90% right against STR's 8.0/4.7/3.4, so Claude reverted it uncommitted and recommended leaving DEF at +2 (owner did not pick it up).
- **Changed:** `HEAL` 2 → 1 in `lanes.js` (the page text and the heal glow read `LANES.HEAL`); the INT test is back to hand-worked +1 spaces. **Removed:** the +2 heal.
- **Open:** "too fast" is wider than INT: with +2 pushes a DEF or STR lane fills in 3 rights.

## v0.6 — "One Spoke"
**Fri Oct 23, 2026 · 4:25 AM HST** (d7d42ed, 4d4fe31, 316e5d8; pushed 16ed460..316e5d8)
- **Owner:** "each round, the player should be able to choose which spoke they want to go down"; Claude warned that with every lane still 5 rounds the choice would only change the order and proposed 15 rounds with no per-lane cap; the owner: "no round cap. no menus, you choose the lane by pushing the button pad the user starts out on. and the game is to fill ONE spoke". "you like that one? haha": Claude said it likes it and flagged INT.
- **Changed:** `lanes.js`: `fresh()` has no `taken` (a lane is won while its marker is on space 5), new `winner(st)` and `isCrowd(n)`; INT's heal goes to the lane you pick (`target`), +2 after the later change below. Page: new `pick` phase; each start pad is a button (`data-act="lane"`, `role="button"`, `tabindex`, Enter/Space) in that phase; the board's markers, shadows and creeps ignore taps; all lanes are drawn bright in the pick phase; the result shows "You win", the tower and the round count.
- **Removed:** `ROUNDS`, `laneDone`, `S.round`, `healTarget` (INT's "then the lowest lane"), `taken`, `CROWD_ROUNDS` per-lane-round check in the page, "N of 3 lanes won", "Next lane", "round N of 5", the draft note's "DEF first, then STR, then INT, 5 rounds each", their tests.
- **Owner (mid-build):** "yeah choose the lane to heal with INT. you mouseover the starting button pad and it shows (+1) and you press it to heal". Built: a `heal` phase after a right INT answer; the pads become buttons (`data-act="heal"`) with an SVG `+1` that shows on hover or keyboard focus; `play(st, lane, right, target)` heals `target`.
- **Owner:** "when you mouseover the starting pad, have it light up the cell that would be filled with the heal? also have it light up the starting cell pad circle", then "light up = glow from around the edges". Built: in the heal phase the next tile of each lane gets `nx l<i>`; CSS `:has(.pad.p<i>:hover)` (and `:focus-visible`) gives it and the pad a `drop-shadow` glow in the lane colour and the tile a lane-coloured stroke; `.fanboard { overflow: visible }` so the glow isn't clipped. First try filled the cell with the lane colour; the owner meant a glow. **Removed:** the pad's `brightness(1.35)` hover.
- **Owner:** "+1 centered on the pad please". The `+1` text moved from inside the pad group (12 px below centre, under the marker) to the `tokens` layer at `proj(pad)`, shown by `:has(.pad.p<i>:hover)`. Measured in Chromium: its centre is within 0.1 px of the pad's top face at 1280 and 390 px.
- **Owner:** "why does INT need more rights??"; Claude: it is `HEAL = 1` against `PUSH = 2`, from the owner's own numbers, and ran a simulation (20,000 games per cell, `lanes.js` as written, one right-answer rate for all questions, fixed strategies): average rounds to win at 50%/70%/90% right: STR 8.0/4.7/3.4, DEF 6.6/4.3/3.3, INT healing itself +1 30.1/10.6/6.1 (+2: 8.0/4.7/3.4), INT healing the furthest lane +1 10.0/7.1/5.6 (+2: 6.0/4.3/3.3). Owner: "yes INT heal +2. also STR can maybe kill turrets faster or something when we get there" (noted in `design.md`, not built). **Changed:** `HEAL` 2; the pad shows "+2", the reveal says "Healed X +2", and the heal glows every cell it would fill (up to 2). **Removed:** the hard-coded "+1" text.
- **Fixed:** `answeredLine` had no full stop after "Correct: X" (the notes read "Correct: Tungsten Marker on space 1"); the header line under the title still said "5 rounds a lane".
- **Left:** the DEF shield picker (three buttons in the panel) after a right DEF answer: not asked to change.
- **Not checked:** balance (with INT at +2 every spoke fills in 3 rights; STR is the plainest); that 25 trivia and 10 crowd questions don't run out in a long game (the pools reset and repeat).

## v0.5.3
**Fri Oct 23, 2026 · 4:17 AM HST** (06b5704; pushed with v0.6)
- **Owner:** saw the question "how long does it take sun to reach the earth" (it was the moonlight one), asked Claude to look it up, then "yeah change it please".
- **Looked up:** Wikipedia "Moonlight": "Moonlight takes approximately 1.26 seconds to reach Earth's surface"; Universe Today: sunlight "8 minutes and 20 seconds"; 384,400 km ÷ 299,792 km/s = 1.28 s worked by hand. Moonlight is mostly reflected sunlight, so "from the Sun" it is about 8 minutes, which made the old wording disputable.
- **Changed:** the STR question text to "About how long does light take to travel from the Moon to Earth?" (answers unchanged). **Removed:** the wording "moonlight take to reach Earth".
- **Not checked:** the other 14 questions against sources.

## v0.5.2
**Fri Oct 23, 2026 · 4:15 AM HST** (c020c2a; pushed with v0.6)
- **Owner:** "can we get rid of 'How did you know? i guessed it' after the question".
- **Removed:** in `index.html`: the three-chip "How did you get it? (no points either way)" block on the reveal and the crowd rounds' "Nothing to look up on this one." note, `S.honesty`, the `honest` click handler, the result's "Declared: …" line, and the `.chips`/`.chip` CSS. Nothing in the tests or backend used it.

## v0.5.1
**Fri Oct 23, 2026 · 4:13 AM HST** (4c083ac; pushed with v0.6)
- **Owner:** "can the tower go next to panel 3 instead of panel 1". Claude read it as the goal's tower (the one in the owner's crop, beside the tile next to the hub) and left the edge tower alone; the middle tile is panel 3 counted from either end.
- **Changed:** `tower(i, D0 + 15, …)` → `tower(i, D0 + 75, …)` in `renderBoard` (the centre of tile 3).

## v0.5
**Fri Oct 23, 2026 · 4:10 AM HST** (8f3d759, 16ed460; pushed 1b3913a..16ed460)
- **Owner:** "we have to get rid of the clutch/feed/tilt menu from the bottom"; "the action the player does is STR/INT/DEF, clutch/feed/tilt is too much on top"; "right pushes +2, wrong 0, int heals +1"; asked whether the wave still pushes back, "wave should push back so it ends up -1". Claude first asked what a fixed push should be (+1 would make every tower need 5 of 5 right) and then what "wrong 0" meant.
- **Changed:** `lanes.js`: `play(st, lane, right, shieldLane)`, `PUSH` 2, `HEAL` 1, `WAVE` 1; a wrong answer is the wave alone (a shield blocks it). Page: `ask()` goes straight from "Lock lineup" and "Next" to the question; no explainer text under the lane line (owner: "no explainer text under DEF HISTORY line").
- **Removed:** `ACTION` (the per-lane explainer text), the `call` phase and `renderCall`, `CALLS`, `S.calls`, the `.calls`/`.call`/`.k-*`/`.tag` CSS and the `--clutch`/`--tilt` colours, the TILT coin flip (`heads`), `RIGHT`/`WRONG` in `lanes.js`, the "called …" tags on the question and reveal, and the old tests for the calls.
- **Owner:** "can you make the towers 100% opaque please"; the towers sat in the lane group (`.fan`, opacity .6 unless it is the lane in play); now their own group with class `twr` at opacity 1.
- **Tests:** 14 pass, with lane tests rewritten from hand-worked spaces (e.g. DEF 0→2, shield on STR, wave blocked, then −1).

## v0.4.1
**Fri Oct 23, 2026 · 4:05 AM HST** (1b3913a; pushed ef010cf..1b3913a)
- **Owner:** after the chunky tiles (v0.4, `HALF` 24, `PAD_R` 32) the three lanes' innermost tiles overlapped near the goal; "if we put the lanes further out from the goal, will it fix the clipping?", then "yes please!".
- **Checked first on a copy:** D0 30, 50 and 62 with the frame grown to match: overlapping tile boxes between lanes 2, 0, 0 (screen bounding boxes, a rough test); board 750×363, 353, 349 px at 1280.
- **Changed:** `D0` 30 → 50, `viewBox` to fit (`-43 4 486 229`); the whole drawing is inside the frame at 390 and 1280 px. VERSION v0.4.1. Removed: the overlap.
- **Tests:** 14 pass. **Not checked:** the live site.

## v0.4 — "Creep Waves"
**Fri Oct 23, 2026 · 4:10 AM HST** (not pushed when written)
- **Owner's decisions (this night, in `design.md`):** lanes are topic and action in one: DEF (history, "for now"), STR (body, moon, Earth), INT (hard science and tech); player vs. map with creep waves, no tug of war; the ghost is a separate run compared on the board; the tower is the goal; INT heals "the lane the person is in first, then the lowest lane if their own lane is full" ("this mechanic might change"); right answers move "how you suggested" (CLUTCH +2, FEED +1, TILT +3 or −1); DEF places a shield on a lane you choose; DEF is played first. No hero weights ("just thinking about the systems themselves").
- **Raised before building (rule 17):** with "DEF right only blocks", the DEF lane could never be won; the owner's answer was shields you place on any lane, and Claude proposed "DEF is won by holding space 3", built as such (not explicitly confirmed by the owner). Lanes are played one at a time (`next` handler), so DEF first lets its shields matter.
- **Added:** `public/engine/lanes.js` (`play`, `healTarget`, `won`, constants), loaded by the page as a plain script and by `test/lanes.test.mjs` (5 tests, spaces worked by hand). Page: lane names and colours, 15 questions (5 per lane, written by Claude, facts not checked against sources), a shield picker after a right DEF answer, the ghost's dashed ring and "ghost: space N" on the board, per-lane result rows, v0.4.
- **Wrong answer:** the call's penalty (CLUTCH −2, FEED 0, TILT −1) plus the wave −1, unless the lane has a shield (it blocks the wave and is used up). Spaces stay 1 to 5. A taken tower stays taken.
- **Removed:** `match`, `pushOf`, the tug of war (`mine - theirs`), hero weights and their bar CSS (`.bars`, `.bar`), the SCI/ART/PLC/POP categories and their 20 questions, `imp` (the random mystery round), the early lane end at space 1 or 5, "Draw", net push.
- **Same night, before any push (owner, with a sketch of the board turned upside down):** "flip upside down, the lanes should start spread out and go towards the common goal at the top", "have the players start at the edges and move inward", "the cells light up as they go in", "start on the start pad, and it should be lit as well", "dont change how DEF is won. they can just choose to give their shield to anyone. but they still push forward and go to the goal like the other two". Built: `proj` flips y with the hub at the top (`HUB.y` 42, draw order reversed), space n sits CELL·(5 − n) from the goal so space 1 is outermost, the start pad (space 0) is lit and holds your marker at the start, the goal's tower is the one by the hub, the hub reads GOAL. In `lanes.js`: `START` 0, spaces 0–5, DEF right pushes by the call like STR plus the shield, every lane is won when its tower is taken. Removed: DEF "won by holding space 3" (Claude's proposal, now dropped), starting on space 3, "held"/"Lane held", "YOU" on the hub. Claude asked once which of two readings the sketch meant; the owner said both.
- **Owner, same night:** "move the ?, all ghost references should be gone from the UI and game". Removed from the page: `GHOST`, `ghostState`, the dashed ring and the ghost's emoji/"?" on the start pad, "ghost:" on the lane rows and result rows, `.gmk`, `.base.*` and `.btn.ghost` CSS (unused), the `gh` class (now `far`), and the ghost in the header, README and CLAUDE.md. The backend (crowd counts, ledger) is untouched. A crowd prompt's own text ("…a ghost might turn on and off") stays.
- **Checked:** 14 tests pass (the lane tests rewritten for the start pad). Headless Chromium at 430 px, three full games (all right, all wrong, mixed): 15 rounds each, shields placed, INT healing another lane once its tower was taken, no page errors; the only "ghost" in the bottom panels was a crowd prompt's text.
- **Not checked:** the trivia facts against sources; how hard a game feels; the live site.

## v0.3.1
**Fri Oct 23, 2026 · 3:24 AM HST** (a5bf422, 6797a04, 91b12b5; not pushed when written)
- **Owner:** "can you please put the version number on the app page, lower right hand", then "have it sit underneath the main game panel frame on the lower right".
- **Added:** `<div class="ver">` inside `.wrap` after `#stage`, `justify-self: end`, small grey mono; `test/version.test.mjs` (the page's version equals the newest `CHANGELOG.md` heading). A first try pinned it to the corner (`position: fixed`), which floated over the hero cards on a phone; replaced the same night.
- **Owner:** "i dont like the idea of play 'against' a ghost", then "leave the ghost stuff on the screen with the spokes the game board screen, but take it out of all the trivia stuff, trivia results, etc. all the bottom screens", "just take it off the UI", "leave all the functionality and backend the same". Claude first misread it as removing the ghost from the board and asked about new rules; the owner corrected it.
- **Changed (text only; `resolve`, `laneWinner` and the board unchanged):** draft note without the ghost's lineup and `GHOST_HISTORY` (removed); crowd note "You score if you match the crowd"; reveal "The crowd picked X", verdicts "Pushed back" and "Lane lost"; the ghost's column on the reveal removed; result rows without "vs" the ghost's hero.
- **Owner:** "please get rid of huge 'Not this time', shouldn't be there according to style guide. you even said it yourself" (Claude had picked that wording, flagged it as its own, and built it anyway). Now no big headline when more lanes were lost; "You win" and "Draw" stay.
- **Checked:** headless Chromium at 1280 and 390 px; a full game clicked through and every bottom panel scanned for "ghost" (only hit: the quiz answer "The Ghost"); a forced loss shows no headline. 9 tests pass.
- **Not checked:** the live site. Left: the header line "one scripted ghost"; the result note still says "N lost" and a negative net push.

## v0.3 — "The Crowd"
**Fri Oct 23, 2026 · 3:18 AM HST** (d3687b9, e617df1, 1b63862; pushed de48cd0..1b63862)
- **Owner's decisions (this night):** SCATTER.EXE and TriviaMoba are "two halves of the same game", named TriviaMoba; each spoke is 5 spaces, all 5 always played, 3 trivia and 2 "match the ghost" crowd rounds (no "dodge" rounds); the ghost is a real player; writing is optional for now; data in SCATTER.EXE's tables; "can we do the backend database stuff first"; a shared daily seed, then "can you take the seed from the shared registry"; secret seed and commit-reveal for the counts discussed and left for now; trivia questions should be straight, narrow, not generic or cliché; no negative questions or bad vibes.
- **Crowd data:** searched for open crowd-answer data (ProtoQA, Battig & Montague, Banks & Connell, Small World of Words, Wikimedia pageviews/Wikidata); only ProtoQA has a clear license (CC BY 4.0) and counts. The owner picked 10 prompts from it (4 of their own picks plus 6 timeless, no-bad-vibes ones; dated answers dropped). House-made counts were offered and turned down as not real; a "4 others said" label for made-up counts was argued against.
- **Page (d3687b9):** `MYSTERY` holds the 10 prompts with their top 4 counts; the ghost's pick is drawn by the counts. Removed: the 6 made-up mystery questions and "always the weirdest answer". Credit line in README.
- **Backend (e617df1):** `src/worker.js`, `src/ledger.js` (helpers copied from scatter-exe), `public/engine/crowd.js`, `schema.sql`, `migrations/001_crowd.sql`, `wrangler.jsonc` (main, ASSETS, `DB` = moba-beat). Shares `scatter_players`, `scatter_rate_limits` and the `scatter_ledger` chain; new tables `scatter_writes`, `scatter_counts` and ledger kinds `crowd` (the day's 2 write and 6 crowd prompts, counts frozen) and `write` (a player's two answers, sealed with the counts in one batch). `GET /api/today`, `POST /api/write`. SCATTER.EXE's `scatter_sheets` untouched. Removed: the static-only config.
- **Seed (1b63862):** `src/registry.js` copied from moba-beat; the pick is SHA-256("triviamoba|" + day + "|" + registry head at 00:00 UTC). Removed: picking from this ledger's own head (steerable by writing before midnight).
- **Migration:** `001_crowd.sql` run on the live moba-beat D1 (2 indexes, 2 tables) through the Cloudflare D1 API before the push, each statement succeeded.
- **Tests:** 8 pass (pick, keys, snapshot, day sealing from the registry, write sealed once with node:crypto hashes, today frozen and tomorrow including it, a 503 when the registry can't be read, migration matches schema).
- **Not checked:** the deploy; real D1 (tests use Node's SQLite); two games appending to one chain under load. The page doesn't call the API yet.

## v0.2 — "Towers and Creeps"
**Thu Oct 22, 2026 · 12:16 AM HST** (39d6331)
- **Added:** the board is 5 raised tiles per lane seen from above, tilted, with flavor towers (they fall when a lane is won) and creeps; 0 or 1 mystery round per lane (no right answer, you score by matching the ghost's pick); the 3-rounds-a-lane tug of war.
- **Removed:** the single question per lane, the flat fan lines and the wedge outline.

## v0.1 — "Three Lanes"
**Thu Oct 22, 2026 · 12:09 AM HST** (bfba871)
- **Added:** one static page with 6 creature heroes, 20 gamer and silly questions, CLUTCH/FEED/TILT calls, a scripted ghost and the third-of-a-wheel board; `wrangler.jsonc` (static assets), README.md, CLAUDE.md.
- **Removed:** nothing (empty repo).
