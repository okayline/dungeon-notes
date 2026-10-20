# dungeon-items: dev changelog

The shared core every game binds to: the item table, the copy registry, marks and the shared accounts (one Worker, D1 `items-db`). It has no player-facing version and no public changelog; this file is the record. Newest first. Times are Hawaii time (HST).

**Backfilled Oct 19 2026** from the git history, the README, `ACCOUNTS.md` and the live `items-db` (queried read-only). Dates and commit ids are from git; "why" lines come from commit messages and docs, so they are the short version. Migrations 001 to 005 are all run on the live database. New entries go at the top, with the migration (if any) and the test count.


## Oct 20, 9:28 AM HST: one ledger entry for a moment many copies share, `addMarks` (with Daily Dungeon v1.38; not pushed)
- min, after seeing #801-#804 as four "ran from a fight" entries: "Can we have each moment be one entry however many items im carrying that haven't seen the event before?"
- `src/registry.js` `addMarks(db, { copies: [{ itemId, copy, key }], holder, kind, value, t? })` and `Registry.addMarks`: one read (`json_each` over the list) checks every copy (theirs, not used up, its key unused) and gets its next mark number; one batch inserts every copy's `marks` row (`INSERT ... SELECT FROM json_each`, so one bound value, under D1's 100-parameter limit) and ONE ledger entry, kind `mark`, record `{ k: "mark", copies: [{ item, copy, n }], kind, value, game }`. Returns `{ ok, marked, already, skipped }`: a copy whose key already made its mark counts in `already`, a used-up, unknown or someone else's copy is skipped with its reason, nothing new means no entry. Up to 300 copies (`MARKS_AT_ONCE`). No blessings (one copy's ladder: `addMark`). Retries on a clash like `addMark`.
- `src/public-ledger.js`: `copyStory` also finds entries whose `copies` list holds the copy (so a thing's own page, and 4Dungeon's INVOKE history through `copyStory`, still show it). `shape` names every item in `items` (and `item` when there is one). `/ledger` writes "TORCH #1, BONE CHARM #1 and LANTERN #1 ran from a fight, in 4Dungeon." (`was`/`is`/`has` become `were`/`are`/`have` for more than one), each name linking to its copy, under "4DUNGEON · ITEMS MARKED" ("copies marked" for other games); on a copy's page the top line gives that copy's mark number.
- Not changed: `addMark` and the 88x31 HTTP door; 88x31 and irl-dungeon still mark one copy at a time (not checked whether they ever mark many at once). Entries already on the ledger stay as they are.
- No migration (no table change). Removed: nothing here. 78 tests pass (1 new: three copies, one used up: two `marks` rows numbered 2 and 1 from raw SQL, one hand-written record and its SHA-256, verify ok, a retry adds nothing, the copy's story has the entry, a blessing refused). `/ledger` and a copy's page checked in headless Chromium with the real `publicLedger`/`copyStory` output from a test database; no page errors.
- Deploy this before 4Dungeon v1.38: until then 4Dungeon's `addMarks` calls fail after the answer and are only logged (those marks would not be retried).
- Not checked: `json_each` on the live D1.

## Oct 20, 9:00 AM HST: a run's moments on the ledger, `sealRun` (with Daily Dungeon v1.36; pushed to main)
- min (thread "4Dungeon user page"): "i'd like to keep track of things about the players run on the shared registry maybe !", "yeah let's do the smallest version. and we shouldn't write every action.", then the moments: talked down, joined, climbed, the Moon's offering, entering and leaving the pit (and the end).
- `src/registry.js` `sealRun(db, { game, playerId, run, moment, detail, t? })` and `Registry.sealRun`: one ledger entry, kind `run`, record `{ k: "run", game, run, moment, detail }`, for a game with no ledger of its own (scoundrel.exe uses `checkpoint` because it has one). `run` is the game's fingerprint of the run (8-64 of `[a-z0-9]`), `moment` a short word, `detail` the checkpoint's `detailOk` shape plus a whole-number `turn`. A run's moment on one turn is sealed once (same record: `{ ok: true, created: false }`; other facts: refused). The check reads `json_extract` on the record with no index (fine at today's size). player_id is the real player (unpublished).
- `/ledger` (`momentWords`), in 4Dungeon's ASCII frame with its own heading per moment: INTO THE PIT "KURA woke at the bottom of the pit on B3F, day 1, under a new moon."; DEMON APPEASED "THE HOUND was appeased on B3F, day 2, under a waxing crescent moon."; DEMON JOINED; LEVEL CLIMBED "KURA climbed to B2F, ..."; OFFERING "KURA made an offering to the Moon on B1F, ... The Moon blessed one of her things."; OUT OF THE PIT "KURA climbed out of the pit, into open air, ..."; RUN OVER "KURA fell on 1F to THE HOUND, day 9, under a full moon. 4 levels climbed, 6 demons beaten, 512 turns." `heading()` looks up `run_<moment>` first. Other games' moments read "<game> sealed a moment of a run."
- Comments: `ledger.js`, `schema.sql` (the `kind` list). No migration (`kind` is free text).
- Removed: nothing. 77 tests pass (1 new: the hand-written record and its SHA-256, once per turn, other facts refused, a later turn is a new entry, a bad fingerprint or a missing turn refused, verify ok). Page checked in headless Chromium with all seven moments mocked.
- Deploy this before 4Dungeon v1.36: until then 4Dungeon's calls fail after the answer and are only logged.
- Not changed: the page's subtitle still says "Every copy ever made, moved, marked or used up".

## Oct 20, 3:41 AM HST: "what happened" headings on the ledger page (pushed to main, live on 88x31.app/registry)
- Owner (thread "Game headings on registry entries"): "can we put one of those for 88x31 entries and for 4dungeon entries?", picked option B (what happened) for every game, then "button traveled", "item in bag", "item left bag", and normal capitals for Dawn Baton.
- `src/public-ledger.js` `heading()`: every entry gets a heading above its number in its game's words. 88x31: "88x31 · new button", "button traveled", "button arrived", "button gone", "button marked". 4Dungeon (all capitals): "4DUNGEON · ITEM FOUND", "ITEM IN BAG", "ITEM LEFT BAG", "ITEM MARKED". irl-dungeon: "new find", "find marked", "find arrived", "find used up". Dawn Baton: "Dawn Baton · Baton made", "Baton came home". scoundrel.exe (lowercase): "run cleared" or "run deleted". A move between games is headed by the game it went to; anything else gets plain words ("new copy", "copy marked").
- Removed: the fixed "Dawn Baton · checkpoint" and "scoundrel.exe · run" headings (added earlier tonight, 0a6531a and 0f45f05), "button changed hands", "ITEM INTO THE BAG", "ITEM LEFT THE BAG", and the uppercase style on Dawn Baton's checkpoint heading.
- No migration. 76 tests pass (no new test: wording only). Commits c82f9dd, 8014de8, 318b8a7.

## Oct 20, 2:55 AM HST: Registry checkpoints (with Dawn Baton v0.24 and scoundrel.exe v0.8.10; migration 006 run on live items-db by the owner in the D1 console first)
- Owner (Oct 20, HST): no separate Bitcoin stamp per game; "i want everything on the shared registry, that's the point of it"; Dawn Baton once a day, scoundrel.exe after every run, and the stamps visible on the registry ledger page.
- `registry.js` `checkpoint(db, { game, entries, head })` and `Registry.checkpoint`: one ledger entry, kind `checkpoint`, player_id 0, record `{ k, game, entries, head }`. A repeat of the game's last checkpoint adds nothing; fewer entries, or the same count with another fingerprint, is refused. `/ledger` said "<game>'s own ledger reached N entries" (since replaced, below). README: a Checkpoints section.
- No migration (the ledger's `kind` is free text). Finding: the "last checkpoint for this game" lookup has no index (`kind`, `game` aren't indexed); fine at today's size.
- Later: an optional `detail` (up to 12 keys of whole numbers, short words or lists of up to 24), shown on `/ledger`: Dawn Baton's checkpoints in its own panel style with the lap line, a 24-colour bar and the tune; scoundrel.exe's in the 4Dungeon ASCII frame with the run line (gold when cleared). Colours are only used when they are `#rrggbb`.
- Then (owner): the "<game>'s own ledger reached N entries" line is removed. The detail is now one sentence in the game's voice: Dawn Baton "Lap 12 came home, and 3 people passed the baton along. 2 bands went unheld." (no bot count); scoundrel.exe in the owner's wording, "Day #1: A Scoundrel was DELETED in Room 12. 11 Demons still in the deck. Score -91 after 32 moves." (no longer all capitals) A checkpoint without detail reads "<game> sealed its ledger here." Removed: the separate lap and run lines and the `.lap` style.
- Then (owner chose "Name beside entry"): migration 006 adds `ledger.name` (NULL or 1-40 characters), written with a checkpoint and never changed (the append-only trigger still holds; checked on a copy of the old schema). `checkpoint` takes `name` (letters, numbers, spaces, - _ .), `chainInsert` writes it, the hash still covers the record alone, and `/api/registry/ledger` returns it. scoundrel.exe's sentence uses the name in place of "A Scoundrel". Also fixed a misplaced `itemIds` comment in `rpc.js`. One more test; 76 pass. Run 006 on live `items-db` before the push.
- Removed: nothing. 75 tests pass (two new).
## Oct 20, 1:18 AM HST: `info()` in one batch (with Dawn Baton v0.22)
- Owner (passkeys thread): the Dawn Baton account page was slow after logging in; "you can build it and push it".
- `src/accounts.js` `info()`: the account check plus the codes, passkeys and games reads go in one `db.batch` (one database trip instead of four). Same answers, same 404 for a missing account. Every game's account page calls it. Removed: the four sequential reads.
- `test/helpers.mjs`: the fake D1's `batch` returns `results` for a `SELECT`, as D1 does (it used to return only `meta`).
- No migration. 73 tests pass, plus a hand check on hand-built rows.

## Oct 20, 12:40 AM HST: mark words for 4Dungeon v1.33 and irl-dungeon v0.22; 88x31 can mark (built on branch claude/project-thread-ecf8mr; on main, pushed with 88x31 v0.46)
- Owner (thread "shared registry ideas"): "can you add the dungeon-items words, and how do we let 88x31 stamp marks ? can you do the mark call thing?"
- `/ledger` words (`src/public-ledger.js` `DEED`): in_locker "was in a hidden locker", in_archive "was in the Archive", deep_stone "was deep in the stone", beat_demon "saw a demon fall", talked_down "saw a demon talked down", fled_fight "ran from a fight", through_door "went through a locked door", found_outside "was found outside, in the real world"; `on_b4f`..`on_b1f` / `on_1f` read "was picked up on B4F" (a regex with `[0-9]`, not `\d`: the page is a JS template string, which would eat the backslash). Removed: the fallback "got a mark in X: ..." wording for these values (it stays for unknown ones).
- HTTP door (`src/registry-http.js`): `addMark` (only when `holder.game` is 88x31, as `moveCopy` and `spendCopy` check; the registry's own check then requires that player to hold the copy) and `marksOf` (public anyway via the copy page). Nothing was removed. No migration (marks are migration 005).
- README: the HTTP door's call list; "Only 4Dungeon stamps marks" now names irl-dungeon too and says 88x31 can but doesn't yet.
- Later: words for 88x31 v0.46's marks (pulled_pack, free_pack, welcome_gift, daily_pick, passed_on, set_reward, from_webmaster, first_print, traded, gifted, guestbook_gift, filled_request, fused "survived a fusion") and its finishes (`finishWords`: foil_/pattern_/effect_ + the id title-cased, "has an Oil Slick foil", "has a CRT+VHS effect"); README says 88x31 marks since v0.46.
- Later (owner: "for mystery buttons can you hide the foil too? ... came with some kind of foil"): on `/ledger`, a mystery button's foil_/pattern_/effect_ mark reads "came with some kind of foil" (pattern, effect). The sealed record (in `/api/registry/ledger` and the copy route) still holds the value, as it holds the item id, since the hashes are built from it.
- Tests: 72 pass (1 new: 88x31 marks its own player's copy, a retry gives the same mark, a 4dungeon holder and another player are refused, marksOf reads it, one ledger entry). Page words checked by running the page's `markWords` in Node.

## Oct 20, 12:26 AM HST: The Dawn Baton (with Dawn Baton v0.20)
- `seed/dawn-baton.json`: one item, The Dawn Baton (`dawn-baton` / `baton`, relic, so only Dawn Baton can make copies). Owner's ask: Dawn Baton writes its daily baton into the registry, one copy per lap. Not seeded on the live `items-db` yet.
- `Registry` entrypoint gains `itemIds(game, keys)` (the existing `registry.js` function the HTTP door already used), so Dawn Baton looks its item up by key instead of hard-coding an id. README: the call and a Dawn Baton section. Removed: nothing.
- No migration. 72 tests pass (one new: the seed is one relic, `itemIds` finds it, `lap:1` gives back the same copy, another game can't make one).

## Oct 19, 10:35 PM HST: public views hide 88x31's non-commons (pushed to main)
- `src/public-ledger.js` `isMystery`, applied to the registry ledger, a copy's story and `/api/items` (only `source` and `hidden: true` come back): first 88x31's rares and up (c13de79), then everything but commons (01a9f22), the same as 88x31's logged-out Wall (88x31's own side is its v0.45.2). The page calls a hidden copy "a mystery button". Sealed records and hashes are unchanged; every 4Dungeon item still shows in full.
- Removed: the narrower "rare, prototype, ultra" `MYSTERY` list, so 88x31 uncommons are hidden too. README line and one test updated. No migration. Backfilled Oct 20 from the git history; test count not recorded in the commits.

## Oct 19, 10:10 PM HST: ledger page text sizes, no glow (pushed to main with 88x31 v0.45.1)
- Owner: the 4Dungeon panels' text was much bigger than the 88x31 panels'; make them the same, medium. Both now use 16px for the line, 13px for the details, 11px for the hashes and 22px for a copy's name (were 17/13/11/24 and 19/19/15/28 for 4Dungeon). VT323 gets `size-adjust: 130%` so it reads the same size; if it fails to load, the fallback monospace is the same px. Removed: every text glow on the 4Dungeon panels and pages (owner: "no text glow ever").
- The button pictures that showed "removed by request" were 88x31's `/api/img` (fixed there, v0.45.1); nothing changed here for it. No migration. 70 tests pass.

## Oct 19, 10:00 PM HST: the ledger page's new look (pushed to main with 88x31 v0.45)
- `/ledger` (served on 88x31.app at `/registry`) now has 88x31's look (starfield, ridge panels, Times title). Owner's asks: theme like 88x31; a 4Dungeon item's panels, and its own copy page, in 4Dungeon's black ASCII style (VT323 loaded from dungeon.88x31.app, a `+====+` rule above and below, `|` down each side). "4Dungeon item" means `items.source = '4dungeon'`, wherever the copy was made.
- Each entry is a sentence: made "came into the world in X", a move inside one game "changed hands in X" (88x31 trades were "moved from 88x31 to 88x31"), spend "was used up in X. It is gone.", marks in words after 4Dungeon's own (`rules.js` DEED/PHASE/OCC/MOON words), e.g. "came from a demon", "was found under a first quarter moon". Each shows the item's rarity, type, alignment, nature, home game, note and picture, the mark number, the sealed record and both full hashes. A copy page keeps the "~*~ Item Registry ~*~" header with the item name in bold in the top panel, and an 88x31 button links to `88x31.app/api/registry/button`. Owner's call: no "copies made so far" line (it is today's count, not the entry's).
- `GET /api/registry/ledger` and the copy route's entries now carry the item's `note, alignment, nature, type, image, source` beside `name, rarity` (not part of the sealed record). Still no player ids, holders or mark keys (a mark key holds the player id).
- Removed: the grey monospace look, the 16-character hashes and the "got a mark in X: deed, found wall" wording. No migration. 70 tests pass (one new: the ledger's item details with no player id; the page test now also checks that the page's script parses, which caught a lost `\n` escape in the template string while building).

## Oct 19, 8:15 PM HST: 24-hour times (pushed to main)
- The `/ledger` page's "The whole ledger" link goes to the page's own path (was a fixed `/ledger`), so the page works when 88x31.app serves it at `/registry`.
- The `/ledger` page shows every time as 24-hour (`hourCycle: "h23"`, with seconds); was the browser's default, 12-hour in US locales. Owner's ask: 24-hour time in all games. No migration. 69 tests pass.

## Oct 19, 8:00 PM HST: Open registry ledger (pushed to main with 4Dungeon v1.29 and Dawn Baton v0.18)
- Added `GET /api/registry/ledger?before=&limit=` (newest first, up to 100 entries: id, kind, game, record, prev_hash, hash, date, item name) and a page at `/ledger` that reads it. Owner's call (Oct 20): the ledgers should be open and readable. The `player_id` column is never selected, and records already hold no player ids; times are shown as dates only, as in irl-dungeon. The item name is added beside the record and is not part of the sealed text.
- Same day: `GET /api/registry/copy?item=&copy=` (the item, the game that made it, moves, used up or not, and every ledger entry about that copy, oldest first; no holder) and the same page at `/ledger?item=&copy=`; each ledger line links to its copy. This is the "look up a copy's history" half of the Moon's-wish direction; 4Dungeon does not link to it yet. Uses `json_extract` over the ledger (a full scan; fine at this size).
- Later the same day (owner's ask): every entry now carries its exact time (`at`, seconds; the page shows it in the viewer's own time zone) in place of the date-only `date` field, and one copy's page lists newest first like the ledger (was oldest first). Dawn Baton's ledger page shows date and time too. Removed: the `date` field.
- Then (for 4Dungeon's HISTORY screen): `copyStory(itemId, copy)` on the `Registry` service-binding entrypoint, the same code as the copy route, which now also carries `of` (how many copies of the item exist) and `born_at`. Removed: the copy route's own query (`copyHistory` is now a thin wrapper over `copyStory`). 69 tests pass (one new: `copyStory` rpc test).
- Removed: nothing else. This replaces the README's "Not public" statement for the ledger; `/api/registry/head` stays. Still not public: copy holders and the `copies` table (no route).
- No migration. 68 tests pass (two new: no player id in the output, newest first, paging, hashes rebuilt by hand with node:crypto; the copy route returns only that copy's entries and no holder).

## Oct 18, 9:08 PM HST: docs and test fix (7857f59)
- CLAUDE.md gets the project's 12 working rules. README item count corrected (98 became 135, counted on the live table), "no game stamps marks" corrected (4Dungeon has since v1.25), `ACCOUNTS.md` lists all games using it.
- `test/ladder.test.mjs`: the "migration 004 runs on the old layout" test built the old layout from `HEAD:schema.sql`, which stopped being old once marks arrived. It now uses `dd6d80c^:schema.sql`. 66 tests pass.

## Oct 18, 7:18 PM HST: Registry head (e4f28f9)
- `GET /api/registry/head`: entry count, newest hash and copy count (no holders, no copies), so `88x31-anchors` can timestamp the registry ledger on Bitcoin every hour.

## Oct 17, 6:13 PM HST: Marks (a7fa204, migration 005)
- New `marks` table: append-only history per numbered copy. Kinds `night`, `deed`, `moon`; each mark sealed on the ledger in the same batch; records never name a player.
- Registry gains `addMark` and `marksOf`; `heldBy` carries each copy's marks. Blessings capped by the ladder (common 3, uncommon 2, rare 1).
- Live now: 8 marks, all from 4Dungeon (5 deed, 3 night). The HTTP door (88x31) has no mark calls.

## Oct 17, 4:52 AM HST: Registry reads (0ef474e)
- `heldBy` carries item details, `whereIs` looks up a copy. 88x31's HTTP door can only look up its own copies. A seed test checks 4Dungeon's generated `items.js` against the table.

## Oct 17, 4:23 AM HST: Shared rarity ladder (dd6d80c, migration 004)
- Rarities: common, uncommon, rare, prototype, relic, ultra, plus moon. Ultra is 1-of-1. Prototype, relic and ultra copies can only be born in the item's home game. Old 4Dungeon `mythic` items keep `mythic`.
- Spent copies (`copies.spent`): used up in their game, stay on the ledger, never move again.
- 88x31 registry over HTTP: `POST /rpc/registry/<method>` with the shared `x-accounts-key`; always acts as 88x31.
- Migration 004 rebuilds `items` and `copies` (keeps every row, id and ledger entry). Live items afterwards include 88x31's rares, prototypes and ultras (135 items today).

## Oct 17, 1:46 to 2:04 AM HST: Shared accounts (migration 003)
- 01:46 CLAUDE.md testing rule lightened (2 to 3 minutes at most).
- 01:49 (4e943d1) `Accounts` Worker entrypoint: save codes (up to 5 per account, hash only) and passkeys (up to 10, RP ID `88x31.app`, so one passkey works on every `*.88x31.app` game), with a per-game link to each player (`account_players`).
- 01:50 `ACCOUNTS.md` design note. 01:53 `scripts/import-passkeys.mjs` to bring a game's old passkeys and codes in (same hashing, so old codes work as they are). 01:56 deleting a game's player unlinks it.
- 02:04 Accounts over HTTP with a shared key (`ACCOUNTS_KEY`) for Pages sites (88x31).
- Deploy order used: migration 003, then this Worker, then the games.

## Oct 15, 10:26 PM HST: Copy registry (acf4ff6, migration 002)
- Numbered copies of every item across all games, with holder (game + that game's player id), and one SHA-256 hash chain of every birth and move, written in the same D1 batch as the copy it records. Triggers: copies never deleted, numbers count up with no gaps, a retired item makes no new copies, the ledger can't be edited.
- Games reach it through the `Registry` entrypoint (service binding). The read API stays public with no route for copies.
- Known limit (still true): the chain can't show that its newest entries were dropped; the head is kept elsewhere (88x31-anchors, and dungeon-notes `registry/ledger-heads.md`).

## Oct 15, 8:40 PM HST: 88x31 buttons (f8b87a1)
- Filter, `scripts/sync-88x31.mjs`, and a snapshot of 88x31's 52 original-tier commons and uncommons (ids 47 to 98).

## Oct 15, 8:32 PM HST: The shared item table (94d43ba, migration 001)
- Schema with guards (items never deleted, id/source/source_key/rarity/created_at never change, ids only count up), the public read API (`GET /api/items`, `/api/items/:id`), 4Dungeon's 46 items seeded from `rules.js` (ids 1 to 46), tests.

## Not done / open (as of Oct 19)
- 4Dungeon reads a generated `items.js` snapshot (`tools/sync-items.mjs`), not the live table.
- A button removed from 88x31's catalog isn't retired automatically.
- The HTTP door has no mark calls.
- Idea noted in the overview, not decided: renaming the repo to dungeon-core.
