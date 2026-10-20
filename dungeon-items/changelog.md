# dungeon-items: dev changelog

The shared core every game binds to: the item table, the copy registry, marks and the shared accounts (one Worker, D1 `items-db`). It has no player-facing version and no public changelog; this file is the record. Newest first. Times are Hawaii time (HST).

**Backfilled Oct 19 2026** from the git history, the README, `ACCOUNTS.md` and the live `items-db` (queried read-only). Dates and commit ids are from git; "why" lines come from commit messages and docs, so they are the short version. Migrations 001 to 005 are all run on the live database. New entries go at the top, with the migration (if any) and the test count.

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
