# AURA FARMING SIMULATOR: NO CAP BATTLE EDITION 2027 — Dev Changelog — v0.1–v0.2

Detailed changelog for aura-farm (public repo: okayline/aura-farm): an async bluffing card game built from 4Dungeon's
AURA and VIBES. Live at aura.88x31.app (Worker `aura-farm`, D1 `aura-db`). The public repo keeps a shorter changelog.
Design doc: https://claude.ai/artifact/9CGedPpAUHQ6wAD9cxGRfg (kept up to date with every decision). Newest first.
Times are Hawaii time (HST).

---

## v0.2 — "Way Back In" (committed, not pushed)
**Tue Oct 20, 2026 · 7:55 PM HST** (migration `001_accounts.sql`: it must run on the live aura-db before the push)

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
