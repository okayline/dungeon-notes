# AURA FARMING SIMULATOR: NO CAP BATTLE EDITION 2027 — Dev Changelog — v0.1–v0.2.1

Detailed changelog for aura-farm (public repo: okayline/aura-farm): an async bluffing card game built from 4Dungeon's
AURA and VIBES. Live at aura.88x31.app (Worker `aura-farm`, D1 `aura-db`). The public repo keeps a shorter changelog.
Design doc: https://claude.ai/artifact/9CGedPpAUHQ6wAD9cxGRfg (kept up to date with every decision). Newest first.
Times are Hawaii time (HST).

---

## v0.4 — "Three Styles" (committed, not pushed)
**Tue Oct 20, 2026 · 8:45 PM HST** (no migration)

### Decisions (the owner's)
- "i think somwhere along the way it got too complicated? ... i think paring it with the 52 card deck might have been
  a mistake. can we go back to the 3 qualities only ?"
- I proposed 6 each of DRIP/RIZZ/MOG plus 2 CAPs, no numbers, rounds won decide, and everything else kept. ryan:
  "sounds a lot simpler!!! yeah can we pivot and do this please".

### What was built
- **Rules (`public/engine/aura.js`).**
  - `DECK` has 20 codes: D1-D6, R1-R6, M1-M6, X1, X2. `BEATS` is D>R>M>D.
  - `faceOff(a, b)`: a CAP loses to any style, two CAPs draw, same style draws.
  - `totals()` counts rounds won.
  - `RULES = 2` is written on every new ledger record. Records without it used the 54-card deck (git history before
    v0.4 re-deals them).
  - Removed: `SUIT`, `RANKS`, `aura()`, `worth()`, YAP, and the `untouched` bonus and its caption (with no numbers
    there is no best card).
- **Server (`src/worker.js`).** `duelView` reads the ledger record in its existing batch. For a done duel whose record
  lacks `rules: 2`, it shows `shown`/`mine` from the record (`lineups ?? flipped`), sets `hands: null`, and takes
  `pot`/`flipped` from the record. Live had 2 such duels (ryan's own tests, ledger entries 1-2).
- **Page.**
  - A card shows its style name, a big emoji and "beats 💎/😏/🗿" (a CAP says "loses to all"). Old codes like "QH" show
    as text.
  - A "Rounds: you N · them N" line sits under the caption.
  - FARM's emoji is now 🌾, because 🗿 is MOG's. Removed: the `--C` (YAP orange) colour.
- **Other.** README and design doc updated: cards section, style table (YAP row and rank table deleted), stare-down
  steps, Decided list and the scoring table ("untouched" row deleted). `VERSION` is 0.4.

### Findings (100,000 random deals, random lineups)
- 22.2% of duels end even (it was about 7% with the 54-card deck), and 24.3% of rounds are draws.
- The challenger wins 38.9% and the taker 38.9%.
- 44.8% of 5-card hands hold a CAP (about 1 in 6 before), so NO CAP will be much more common.
- Raised with ryan once, not changed.

### Tests
- 20 pass. The engine tests were rewritten with hand-worked 3-style examples. One new worker test: an old-rules duel
  is shown from its record, with no hands.
- Browser check: the planner shows style cards, the taker's duel shows the rounds-won line, and there were no page
  errors.

## v0.3.1–v0.3.3
**Tue Oct 20, 2026 · 8:20–8:28 PM HST** (no migrations)

### Decisions (the owner's)
- "for the random names, could we get gen-z slang name generator? haha"
- "the whole site feels heavy or laggy... is there anything we could do?" I recommended instant tabs and one D1 trip
  per call; ryan: "yeah can we do the first two please!"
- One-of-each moves per plan: I advised against it, because a forced DIP makes every poster fold (`play()` ends on any
  DIP). Not built.
- Planning round 2 was hard ("i don't know what i'm responding to"). Per-round picks by the poster would bring back
  waiting. Ghost duels (both sides play recorded moves) still need a first mover who plans blind, which ryan agreed was
  the problem. ryan picked showing the card for each round: "let's try that ! showing the cards".

### What was built
- **v0.3.1:** `src/names.js` now has 40 slang adjectives and 40 nouns, giving 1,466 pairs of 16 characters or fewer.
  Existing names are kept. The test's name check was loosened to any 2-16 characters ("NPC" is all caps).
- **v0.3.2, server.** Each call's reads are one `env.DB.batch`:
  - `/today` batches aura, VIBES and the duels list.
  - `/board` batches the list and everyone's aura (`aurasStmt`, now joined with names).
  - `/leaderboard` is one query.
  - `duelView` batches names and VIBES.
  - `findPlayer` is one UNION over players and sessions.
  - Removed: `auraOn`, `aurasOn`, `vibesOf` and `namesOf` (replaced by statement builders: `auraStmt`, `aurasStmt`,
    `vibesStmt`, `namesFrom`, `vibesFrom`).
- **v0.3.2, page.**
  - `showTab` draws at once from the tab's cache (or "Loading…"), then fetches only that tab.
  - `refreshMe` updates the header in the background after actions.
  - Removed: `loadTab`, and the /today fetch on every tab switch.
  - Test fake D1 `batch` now returns rows for reads, like D1.
- **v0.3.3:** `planPicker(mine)` shows one round at a time, with that round's card and three move buttons. Planned
  rounds are listed as "Round N · card → move" (tap to replan). Changing the lineup resets the plan. Removed: the 3x3
  move grid.

### Findings
- Headless Chromium, locally, a tab switch took about 60 ms. With 120 ms added per API call it took about 220 ms, and
  after v0.3.2 about 45 ms whatever the delay. Scrolling caused no layout or style recalculation.
- D1 trips per call (local count): /today 2 (3 when `seen_at` is written), /board 2 (findPlayer, then one batch),
  /leaderboard 1, /ledger 1.

### Tests
- 19 pass. Browser check: a full duel with the new planner, a save-code login, no page errors, and 1 checkpoint sent.

## v0.3 — "Play the Plan"
**Tue Oct 20, 2026 · 8:25 PM HST** (migration `002_plans.sql`, run on the live aura-db through the Cloudflare connector at 8:16 PM HST, before the push; checked: c_plan added, 3 columns gone, duels 1-3 expired)

### Decisions (the owner's)
- ryan got stuck on a live duel waiting for the other side's pick: "oh, this isn't asynchronous?? this is live", then
  "is there a way to make the gameplay faster? not turn-based ... save the user's cards as a pattern and match it up
  against another user's pattern later?"
- Recommended: the poster saves a 3-move plan and the taker plays it live. Rejected: both sides plan, because then the
  taker has no decisions after picking cards. ryan: "yeah you play against the plan!"
- On the taker's edge (they react to earlier flips, the plan can't): kept, with standing aura as the poster's side of
  the trade. ryan: "ok yeah let's build this and see how it goes !"
- "can you also put text glow back like you had it before please haha... tone it down on the large white text".

### What was built
- **Server (`src/worker.js`).**
  - `post` takes `plan` (3 moves from `A.MOVES`, else 400) and stores it in `duels.c_plan`.
  - `lockIn` passes the plan to `commitment(cards, salt, plan)` (`src/ledger.js`), which is now
    sha256("cards|plan|salt") for the poster and sha256("cards|salt") for the taker, as before.
  - `move` is taker-only; the poster gets 400. It calls the new `playRound(env, d, takerMove)`, which pairs
    `[plan[n], takerMove]`, plays it, and either finishes the duel or saves the round under the `n` guard.
  - `settleStale` DIPs a taker who left halfway, against the plan's move for that round.
  - `duelView` gives the poster their `plan`, and the taker gets `reads` and `vibes`. `/today` live rows have
    `yourMove = side === 1`. `vibes` is taker-only.
  - The ledger record gains `plan`, revealed at a showdown or tie like the lineups.
  - Removed: `resolve` (it waited for both picks), the `COL` helper, `myMove`/`theyMoved`, and the poster's peeks.
- **Database.**
  - `schema.sql`: added `c_plan`; removed `c_move`, `t_move` and `c_reads`.
  - `migrations/002_plans.sql` sets open and live duels to expired (they have no plan) and sets `taken_at` on the open
    ones, so their standing aura stops at the migration. It then adds `c_plan` and drops the three columns.
  - Tested on the v0.1 schema plus 001: the columns match schema.sql afterwards. Live had 2 open duels and 1 live one
    (#3, ryan against himself), which will be cancelled with nothing paid.
- **Page (`public/app.js`).**
  - The post screen has a "Your plan" picker: 3 rows of LOCK IN / FARM / DIP. Post needs 3 cards and 3 moves.
  - The taker's move buttons are always on. The caption shows the last round ("They 🗿 FARM · you 🔒 LOCK IN").
  - The poster sees their plan on the open or live screen.
  - Removed: the 10-second polling, "waiting on them", and "picking…".
- **Glow (`public/index.html`).**
  - The v0.1 file is back, from ef69f86.
  - Softer: `.title`, a new `.big.glow` rule for headings, `.go`'s text-shadow and `.pot .n`.
  - Removed: v0.2's toned-down values everywhere else.
- **Other.** `VERSION` is 0.3, and v0.2.2 (reroll) was folded into the v0.3 CHANGELOG entry since it was never pushed.
  README updated. Design doc: the stare-down and async sections describe the plan, and "Decided" gains the plan and
  random names.

### Tests
- 19 pass.
  - The whole-duel test now posts with a plan: a short plan gets 400, the taker can't see the plan, the poster can't
    move, and a round plays at once. The poster's commitment checks against sha256("cards|farm,lock,lock|salt").
  - The reset test now checks a taker who left halfway is DIPped and loses.
- Browser check: posted with plan FARM/LOCK/FARM, the taker played 3 rounds in a row ("AURA FARMED. +40,000 aura"),
  1 checkpoint was sent, and there were no page errors.
- Not checked: how often posters lose against live takers, and the live site.

## v0.2.2 — "Reroll" (released inside v0.3)
**Tue Oct 20, 2026 · 8:08 PM HST** (no migration)

### Decisions (the owner's)
- "can you make the random name reroll optiton, and not have the user able to input it ?"

### What was built
- `POST /api/name` now ignores its body and calls `giveName(env, player, { reroll: true })` (`src/names.js`), which
  picks a free two-word pair different from the current one. This is the same as scoundrel.exe's reroll.
- Removed: typed names, `NAME_RE`, `RESERVED` and the `prompt()` box.
- The "you" screen's "change name" became "🎲 reroll name", and the note line shows "You're <name> now."
- `names.js` comments were updated. `VERSION` is 0.2.2.
- Existing names are kept until rerolled. Live aura-db has one player, id 1, named "kura" (typed at v0.1), and it stays
  as it is.

### Tests
- 19 pass. One is new: posting a typed name gets a random two-word name instead, different from the old one.
- Browser check: the reroll button changed the header name ("Shy Tide" to "Amber Finch"), with no page errors.

## v0.2.1 — "Name Tag"
**Tue Oct 20, 2026 · 8:03 PM HST** (no migration)

### Decisions (the owner's)
- "could you put a version number somewhere on the app page please? (is it there already ?)". It wasn't: a search of
  `public/` and `src/` for "version" found nothing, and CHANGELOG.md was the only place with a version.

### What was built
- `public/engine/version.js` (new) exports `VERSION = "0.2.1"`, the same pattern as dawn-baton's `engine/version.js`.
- `public/app.js` `draw()` shows `v0.2.1` in small, dim text at the bottom of every screen.
- CHANGELOG: v0.2 is dated Oct 20 2026 HST (released), and there is a new v0.2.1 entry. Removed: nothing.

### Tests
- 18 pass. One is new: the newest CHANGELOG heading matches `VERSION`.
- Browser check: "v0.2.1" was seen at the bottom of the "you" screen.

## v0.2 — "Way Back In"
**Tue Oct 20, 2026 · 7:55 PM HST** (pushed 8:01 PM HST) (migration `001_accounts.sql`, run on the live aura-db through the Cloudflare connector at 8:00 PM HST, before the push)

### Decisions (the owner's)
- "yeah can we do all that next please!!!", meaning hooking up the shared Accounts, sending a registry checkpoint after
  each finished duel, and writing this changelog.
- "can you tone down the text glow a little bit please 😅" (v0.1 was built with as much glow as wanted, by request).

### What was built
- **Accounts (`src/worker.js`, "save codes and passkeys" section).** Copied from scoundrel.exe's section, without its
  `save_codes` import, because this game never had codes of its own.
  - Routes: `GET /api/account`; `POST /api/codes {action: new|remove}`; `/api/load {code}`;
    `/api/passkey {action: register_options|register|login_options|login|remove}`; `/api/logout` (refused until the
    player has a save code or passkey).
  - Game name is `aura-farm`. Bindings in `wrangler.jsonc`: `ACCOUNTS` → dungeon-items `Accounts` and `REGISTRY` →
    dungeon-items `Registry`.
  - `findPlayer` now also checks `sessions`, where a device loaded later gets its own token.
  - `newSession` and `rateLimit` (20 new players per IP per hour when logging in) are inlined, copied from scoundrel
    `src/saves.js`.
- **Tables.** `sessions` and `rate_limits` were added to `schema.sql` and to `migrations/001_accounts.sql`. The migration
  is written one statement per line with no comments, because the D1 console said "No sql statements detected" for the
  commented schema.sql at v0.1.
- **Page (`public/app.js`).** A "you" screen opens when you tap your name, or "log in", at the top.
  - It holds: change name, a list of save codes and passkeys with forget/remove, "New save code" (shown once, with
    Copy and Download .txt), "Add a passkey", "Log in as another player" (code box, or passkey), and "log out of this
    browser".
  - The WebAuthn helpers (`fromB64`, `toB64`, `pkOops`, `deviceName`) were copied from scoundrel.exe.
  - Removed: tapping the name no longer opens the rename prompt straight away.
- **Registry checkpoint (`checkpoint()` in `src/worker.js`).** Copied from scoundrel.exe.
  - `finish()` calls it after a duel's batch saves.
  - It runs `verifyChain` over the ledger up to that duel's entry, then sends
    `REGISTRY.checkpoint({game: "aura-farm", entries, head, detail})`.
  - The detail is: `day`, `duel`, `result`, `rounds`, `pot`, `winner` ("challenger" | "taker" | null), `aura` (both
    deltas) and `bonuses` (names only).
  - It sends no name and no player id. Captions are left out because they contain characters the registry's word rule
    refuses (`!`, `,`, `+`).
  - Wrapped in try/catch: a missing or refusing registry never blocks a duel.
- **Glow (`public/index.html`).**
  - Kept but softer: `.glow`, `.title`, `.me b`, `.card .r`, `.pot .n` and `.cap` now have smaller blur and half
    opacity.
  - Removed: text-shadow on `.title small`, `.card .s`, `.mv`, `.go` and `.tab.on`.
  - Box-shadows on cards and halos were not changed.
- **Docs.** README gained an Accounts/registry note and the migrations rule. CHANGELOG gained a v0.2 entry, and v0.1 is
  now dated Oct 20 2026 HST.

### Findings
- The owner reported slow tab changes and asked whether D1 was reading or writing too much.
- In a local count on a made-up busy day (6 players, 18 challenges), statements per call were:

  | Call | Statements | Writes |
  | --- | --- | --- |
  | `/api/today` | 23 | 2 |
  | `/api/board` | 32 | 2 |
  | `/api/leaderboard` | 21 | 1 |
  | `/api/ledger` | 3 | 1 |

  - No full-table scans (EXPLAIN QUERY PLAN).
  - Every tab click makes two of these calls, one after the other.
- Live aura-db at the time held 1 player, 3 duels and 0 ledger rows (4 rows read for the count).
- Likely cause, not measured from Hawaii: many sequential round trips to a WNAM (SJC) database.
  - The board and leaderboard query name and aura once per row.
  - `auraLife` re-sums every duel each time.
  - Every request writes `players.seen_at` and runs `settleStale`.
- The owner: "yes please, could you do that". Built in v0.2:
  - `aurasFrom(rows, day)` works out wins, losses and standing from one day's duel rows in JS.
  - `auraOn` is now 1 query (UNION ALL over the c_id and t_id indexes); before it was 2.
  - `aurasOn(env, day)` is 1 query for everyone, through the `(status, day)` index. A first version used
    `day = ? AND status != 'draft'`, which EXPLAIN showed as a full scan, so it uses `status IN (...)` instead.
  - `namesOf(ids)` is one `IN` query for up to 100 ids.
  - The board and leaderboard went from 1+2N or 1+3N queries to 2-3 queries.
  - `/today` builds live rows from the row itself (no `duelView`) and joins the opponent's name.
  - `findPlayer` writes `seen_at` (players and sessions) only when it is 15 minutes old or more (`SEEN_EVERY` = 900; ryan picked 15 minutes over an hour).
  - `settleStale` runs once per UTC day per Worker instance (`settledDay`), and again if it hit its 20-duel limit.
  - The page loads `/today` and the tab in parallel (`Promise.all`).
  - Removed: `auraLife` and `/today`'s `life` field (the page never read it), `nameOf`, and `standingOn`.
- Same count after the change:

  | Call | Statements | Writes |
  | --- | --- | --- |
  | `/api/today` | 4 | 0 (1 when seen_at is 15 minutes old) |
  | `/api/board` | 3 | 0 |
  | `/api/leaderboard` | 2 | 0 |
  | `/api/ledger` | 1 | 0 |

  No full scans. A Board tab click went from 55 statements in two calls one after the other to 7 statements in two
  calls at the same time.

### Tests
- 17 pass. Three are new: an ordinary click writes no `seen_at` within 15 minutes; a checkpoint per finished duel with public facts and no player; and a save code loading the
  player on a second device, then logout refused without a way in, logout allowed after, and passkey login back in.
- Fake Accounts and Registry were copied from scoundrel.exe's tests.
- Browser check (local worker plus node:sqlite, headless Chromium, 390 px wide): made a save code in one browser, logged
  in with it in another, and both showed the same player; no page errors. Screenshot of a live duel with the softer glow
  looked right.
- Not checked: real passkeys (the tests use a fake), the live site, the real Accounts and Registry services.

### Still open (raised once, no action)
- Midnight UTC cuts late duels short (a missing pick counts as a DIP).
- Impact isn't on some phones, so the fallback is Arial Black.
- Extras, not done: add aura-farm to dungeon-items `ACCOUNTS.md` "Games using it", and give it a friendly name on the
  registry page (it shows the raw game name until then).

## v0.1 — "Stand There"
**Tue Oct 20, 2026 · 7:35–7:43 PM HST** (schema.sql run by the owner in the D1 console)

### Decisions (the owner's, from the design talk)
- **Game.** An aura-battling game from 4Dungeon's AURA and VIBES: "who stands around and looks the coolest?". It is a
  bluffing card game with hidden information, and async first because of the player base.
- **Deck.**
  - A standard 52 plus 2 jokers, which are CAPs worth 0.
  - Suits are styles: DRIP♦ > RIZZ♥ > MOG♠ > YAP♣ > DRIP ("YAP roasts DRIP"). Neutral pairs are DRIP/MOG and RIZZ/YAP.
  - Ranks are aura: 2-4=1, 5-7=2, 8-10=3, J/Q=4, K/A=5.
  - A card whose style beats the card it faces counts double.
- **Duel.**
  - You're dealt 5 from a seeded deck and lock in 3, in order. Both 5-card hands are face up.
  - Each round both players pick LOCK IN / FARM / DIP in secret, then the picks and the round's cards flip together.
  - FARM doubles the pot (at most once a round). DIP pays the pot from before this round's FARM. If both DIP, nothing
    is paid. An exact tie is a MUTUAL MOG.
- **Meme numbers.** The pot starts at 10,000. Bonuses:

  | Bonus | Amount |
  | --- | --- |
  | NO CAP (win holding a CAP) | +500,000 |
  | untouched | +100,000 |
  | dipped a winner | -100,000 |
  | crashed out | -1,000,000 |

- **VIBES.** 1 a day, +1 per chosen DIP, max 3. They buy a peek at one unflipped card. The "is it above 3?" ask was
  removed before release: "VIBES should only be one thing!"
- **Standing aura.** +1,000 an hour while a challenge stands, counted once. Up to 3 open challenges.
- **Name and look.** Named "AURA FARMING SIMULATOR: NO CAP BATTLE EDITION 2027". Mockup 1, "aura glow", was chosen:
  modern rather than ASCII, emojis, with text glow allowed.
- **Ledger.** One hash-chained entry per finished duel.

### What was built
- Worker plus static assets plus D1, like scoundrel.exe.
- `public/engine/aura.js` holds the rules, shared by the worker and the page.
- `src/worker.js`: cookie players, draft/post/take, secret moves, VIBES peeks, standing aura, daily reset (a missing
  pick counts as a DIP and earns no VIBES), leaderboard and ledger.
- `src/ledger.js`: the chain helpers (from scoundrel.exe). Lineups are committed as sha256(cards|salt) and revealed only
  at a showdown or tie.
- `src/names.js`: from scoundrel.exe.
- Tables: players, duels, vibes, ledger.

### Tests
- 14: 11 engine tests and 3 end-to-end tests with node:sqlite standing in for D1.
