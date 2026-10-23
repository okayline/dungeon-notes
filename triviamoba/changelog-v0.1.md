# TriviaMoba — Dev Changelog — v0.1–v0.3.1

Detailed changelog for TriviaMoba (repo okayline/triviamoba, renamed from trivial-moba): trivia in three MOBA lanes. Worker `triviamoba`, connected to the repo. Since v0.3 a Worker with a backend in the moba-beat D1 (sharing SCATTER.EXE's tables); the page shows its version since v0.3.1. v0.1–v0.2 were numbered here from the commits. Newest first. Times are Hawaii time (HST).

Written after the fact (Oct 22) from the commit messages; the owner's decisions are not recorded here.

---

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
