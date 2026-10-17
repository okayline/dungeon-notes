# 88x31 cLuB — Dev Changelog — v0.35–v0.36

Detailed changelog for the 88x31 game (public repo: okayline/88x31, live at 88x31.app).
The public repo keeps a shorter, general changelog. Newest first. Times are Hawaii time (HST). Older: `changelog-v0.34.md`.

---

## v0.36 — "Visiting Hours"
**Sat Oct 17, 2026 · 4:55 AM HST** (no migration; needs dungeon-items `0ef474e` for `whereIs` and item details in `heldBy`)

Decisions (owner): items move between your OWN games first (trades between players later). Cross-game gameplay was
planned (an 88x31 button acting as a 4Dungeon item, a relic on the wall) but is deferred until 4Dungeon's systems redesign,
so visitors are display only. A button that leaves is "away, not gone" (same copy when it returns), chosen over "truly leaves"
(which would re-mint a new copy on return). First pair: 88x31 ↔ 4Dungeon.

- `lib/travel.js`: `sendButton(env, userId, instanceId)` checks ownership, `registry_item`, `registry_copy > 0` and
  `registry_owner = userId` (else "not in the shared registry yet"), finds the account's 4Dungeon player (`acc().accountOf` →
  `playerFor(..., "4dungeon")`), locks the copy with `AWAY = -1` in `instances.locked` (`WHERE locked = 0`), then registry
  `moveCopy` 88x31 → 4dungeon; on failure the lock is undone. Then deletes its `wall_slots` row and adds an
  `ownership_history` row (`reason 'away'`, from = to = owner) so it's sealed into this game's ledger.
- Every existing action (trades, open trades, fusion, gifts, requests) only takes `locked = 0`, so AWAY blocks them all with
  no changes there; trade/fusion tokens are positive, so -1 never clashes with their unlock sweeps. `/api/wall` skips
  `locked = -1`.
- `settleReturns(env, userId?, limit)`: for AWAY copies, registry `whereIs`; when held in 88x31 again it sets `locked = 0`,
  `owner_id` and `registry_owner` to that player, and logs `reason 'home'`. Runs from `/api/travel` GET (your collection)
  and as step 6 of the background registry pass (5 a pass). The mirror's moves and spends skip `locked = -1`.
- `/api/travel`: GET `{ visitors }` (registry `heldBy` for you, items whose source isn't 88x31) after settling returns;
  POST `send` (a button) and `send_back` (a visitor → your 4Dungeon). Bots can't send.
- Page: tiles of away buttons get `.away` (faded) and "· away"; `travelBox(b)` on your own original button: "Send to my
  4Dungeon" (asks first) or the away note; `showVisitors` adds "» Visiting from 4Dungeon «" with `.visitor-card`s and
  "Send back". `HOW.away` / `HOW.home` in the travel log. `/api/banner` returns `locked` and `registry_item`.
- Footer v0.36; css/js cache tags 0.36 (they were still 0.34.12 through v0.35).
- Tested end to end in node (88x31 schema + the real dungeon-items Worker code behind a fake binding): send, wall cleared,
  can't send twice, the mirror doesn't move it, comes home with `away`/`home` history, a dungeon item visits and goes back,
  the shared chain verifies. Not rendered in a browser.

## v0.35 — "One Big List"
**Sat Oct 17, 2026 · 4:25 AM HST** (migration `026_shared_registry.sql`, run on the live database before the push)

Decisions (owner): one rarity ladder for every game, same names everywhere: common · uncommon · rare · prototype · relic ·
ultra, plus moon. Ultra keeps its name in every game ("it's a special item so it retains its identity") and is 1-of-1.
Relic is the dungeons' top tier; 88x31 never deals relics, but they can turn up here. Prototype and ultra are only made
in 88x31 (their home game) and can travel; going forward only (old 4Dungeon mythics stay mythic). Specials (quest rewards)
stay 88x31-only and never go on the shared list. Archive/found uploads stay off until credit is decided. 88x31's ledger stays
the master; the shared registry mirrors it.

- `lib/registry.js` `syncRegistry(env, { budget })`, one pass: (1) eligible designs (`tier = 'original'`, rarity on the
  ladder, status active/frozen/removed) → `addItems` then `itemIds` → `designs.registry_item`; (2) unregistered copies,
  oldest edition first, born to their FIRST owner (earliest `ownership_history.to_user`, else `owner_id`), key `inst:<id>`;
  (3) owner changed → one `moveCopy` to the current owner (owners in between skipped; this ledger has them); (4) consumed →
  `spendCopy`; (5) frozen/removed designs retired there once all their copies are in. A refusal sets `registry_copy = 0` and
  is logged; an unreachable registry stops the pass.
- Runs in the background from `/api/me` (`syncIfDue`: the `meta` row `registry_sync` is claimed, at most once a minute, 30
  calls) and from `POST /api/admin { action: "registry_sync" }` (120 calls). Over HTTP: `POST /rpc/registry/<method>` on the
  dungeon-items Worker through the `ACCOUNTS` binding with `ACCOUNTS_KEY`; that door always acts as 88x31.
- Migration 026 columns: `designs.registry_item`, `designs.registry_retired`, `instances.registry_copy`, `registry_owner`,
  `registry_spent`, index `idx_instances_registry`.
- First live passes: 89 original designs linked (36 common, 16 uncommon, 19 rare, 8 prototype, 6 ultra, 4 frozen rare),
  copies filling in, none refused.
- Tested in node against the real dungeon-items registry code: backfill, a trade, a fusion, a frozen design retired, no
  specials or uploads, the chain verifies, a second pass does nothing.
- Shared accounts merged the same day (owner's request): kura's account now covers 88x31, 4Dungeon, irl-dungeon and
  dawn-baton; space keeps its own (old passkey removed, save code kept); Hobo (a friend) untouched.
