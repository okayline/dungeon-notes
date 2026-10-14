# scoundrel.exe — Dev Changelog — v0.1–v0.2

Detailed changelog for scoundrel.exe (public repo: okayline/scoundrel.exe): a daily seeded Scoundrel
(Zach Gage & Kurt Bieg) where everyone plays the same deck each UTC day. The public repo keeps a
shorter changelog. Newest first. Times are Hawaii time (HST).

---

## v0.2.0 — "Same Deal"
**Wed Oct 14, 2026 · 3:46 AM HST** (new D1 database scoundrel-db: schema.sql already run by user; DAILY_SECRET set)

Decisions: user built a Cloudflare **Worker** named `scoundrel-exe` (Workers Builds, connected to the repo) rather than Pages, so the app is a Worker with static assets. First deploy failed (engine-only repo had no wrangler config): expected. User created scoundrel-db (id 75e13945-0776-4fb0-bbaf-8e89119a7d59), ran schema.sql (downloaded from chat; repo not pushed yet), set DAILY_SECRET. Backend first, screen later; least friction: cookie players, name optional.

- `wrangler.jsonc`: main src/worker.js, assets dir public with `run_worker_first: ["/api/*"]`, D1 binding DB, var LAUNCH_DAY "2026-10-14" (day #1). Secret DAILY_SECRET.
- `schema.sql`: `players (id, token_hash UNIQUE, name, name_key UNIQUE lowercase, created_at, seen_at)`; `runs (player_id, day UTC, actions JSON, moves, status playing|won|dead, score, health, marks, started_at, finished_at, UNIQUE(player_id, day))`; index runs_board (day, status, score DESC, finished_at). Decks are never stored: seed = dailySeed(secret, day), run replayed from actions on each request.
- `src/worker.js`: cookie `sx` (32 random bytes base64url, HttpOnly Secure SameSite=Lax, 400 days); DB keeps SHA-256 of it. Players created only by /api/start or /api/name (`needPlayer`), never by GETs. Routes: GET /api/today (day info, run via publicView, `unfinished` = yesterday's still-playing run), POST /api/start (INSERT OR IGNORE → one run per player per day), POST /api/move {day, n, action} (day must be today or yesterday; n must equal stored moves; action whitelisted to skip/take{card,bare}; engine IllegalMove → 422; save is `UPDATE ... WHERE moves = n` so double-sends get 409; on finish stores score, health, marks, finished_at), POST /api/name (2–16 chars `^[A-Za-z0-9][A-Za-z0-9_.\- ]{0,14}[A-Za-z0-9_.\-]$`, spaces collapsed, reserved list, unique by name_key → 409), GET /api/leaderboard?day= (top 100 named finished runs by score DESC, finished_at ASC; counts played/won/playing; `you` rank counts unnamed runs too; past days return seed; future/bad days 400), GET /api/share?day= (text: "scoundrel.exe #N", "cleared ♥H · score S" or "died · score S", marks in rows of 7, site origin), GET /api/history (last 30). No DAILY_SECRET → 500 with a clear error rather than dealing a guessable deck.
- `public/index.html`: placeholder test page (green on black, plain buttons per legal action, log, leaderboard, name box, copy share text). Not the real screen.
- `test/worker.test.mjs`: 11 tests, Worker against node:sqlite as a D1 stand-in (same deck for everyone and = engine, one run a day, illegal/out-of-step/other-day/no-cookie moves refused, full runs scored exactly like the engine, ties by finish time, unnamed counted not listed, names, past seeds public, yesterday's run finishable, no-secret error). 29/29 pass. Also played a full run in headless Chromium against a local Node server (no errors). wrangler itself couldn't be run in the workspace (npm registry unreachable), so first real D1 run is the deploy.
- README: Setup, how the daily game works, API.

## v0.1.0 — "Shuffle Up"
**Wed Oct 14, 2026 · 3:37 AM HST** (engine only, no backend yet)

Decisions: user wanted a Scoundrel game; Claude checked existing versions (iOS, Steam, itch.io ports; none with a shared daily deck) and suggested angles. User picked a standalone daily seeded game (same deck for everyone, one ranked run a day), not part of Daily Dungeon (Scoundrel's chance of losing clashes with DDDD's "never sad" rule; DDDD has its own minigame ideas). Agreed: server deals (browser never sees the deck), moves checked server-side, UTC rollover, cookie players with an optional name and optional save code/passkey later, share card + leaderboard, replays later. Backend first, screen last; aesthetic leaning DDDD-sibling (terminal/ASCII), not 88x31. Name: scoundrel.exe (user made the repo).

- `engine/scoundrel.js`: pure, immutable, JSON state. 44-card deck (C/S 2–14 monsters, D 2–10 weapons, H 2–10 potions). Seeded shuffle: cyrb128 → sfc32 (15 warm-up draws), Fisher–Yates. `newGame(seed, rules)`, `apply(state, action)` → `{ state, events }` (throws `IllegalMove`), `legalActions`, `canSkip`, `canUseWeaponOn`, `replay(seed, actions)`, `publicView` (no deck order; deckCount, deckMonsters), `shareMarks` (per room: ↷ skip > ✊ bare > ⚔ weapon > ♥ heal > ·).
- Actions: `{type:"skip"}`, `{type:"take", card:i}`, `{type:"take", card:i, bare:true}`.
- Rules: room refills to 4 once ≤1 card left and the deck has cards; at the end the room runs down. Skip only with a full untouched room, deck non-empty, not after a skip (reset on a played-through room). New weapon discards old weapon + its kills. Weapon limit default "lower" (strict, published rules), option "lowerOrEqual". Potions: first per room heals (cap 20), later ones wasted. Death: score = health − sum of monsters left in room + deck. Win: health, + last card's value if it was a potion and health is 20 (counts even a wasted potion; `potionBonus` option).
- `engine/daily.js`: `dailySeed(secret, day)` = hex HMAC-SHA256(secret, "daily:YYYY-MM-DD") via Web Crypto; `utcDay`, `dayNumber(day, launchDay)`, `msUntilNextDay`.
- `play.mjs`: terminal player (1–4 take, auto bare-handed when the weapon can't hit; b1–b4 bare; s skip; q quit), prints share marks at the end.
- Tests (node --test): 18 pass, incl. 2,000 random full games checking all 44 cards stay accounted for, health ≤ 20, win > 0 / loss ≤ 0, and `replay` reproduces state exactly.
