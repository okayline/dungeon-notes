# 88x31 cLuB — Dev Changelog — v0.35–v0.38

Detailed changelog for the 88x31 game (public repo: okayline/88x31, live at 88x31.app).
The public repo keeps a shorter, general changelog. Newest first. Times are Hawaii time (HST). Older: `changelog-v0.34.md`.

---

## v0.38 — "Theme Wall"
**Sat Oct 17, 2026 · 9:30 PM HST** (migration `028_theme_walls.sql`, not yet run on the live database; run it before the push)

Decisions (owner): everyone in a ring sees every pin on its wall, seen or not (the group wall is where you meet buttons you haven't seen). Name clash with `wall_slots` (a player's own button order): new tables, "Theme Wall" in the UI. Lock at the Monday 00:00 UTC rollover, not "Sunday". Rare theme types are fine for now. Players don't make rings (too much for now): the webmaster makes them. The ★ for a theme match is a row above the wall (one per on-theme button), not on the buttons. Design doc: `88x31-club-weekly-loop-v1.md`.

- **Pins are checked when drawn, not hooked.** `wall_pins` holds (wall, member, copy, x, y). `wallPins` shows a pin only while `instances.owner_id` is still the member, `consumed = 0` and `locked != -1` (away); otherwise the spot draws empty and the x/y stay reserved. Nothing in trades, gifts, fusion, trade-in or travel was touched. A button that goes away and comes home before the lock is back in its spot. A trade-locked copy (`locked > 0`) still shows (still owned) but can't be newly pinned.
- **Tables** (`028`): `rings.is_default`; `ring_walls` (ring, week, theme, size, slots, `locked_at`, `snapshot`; unique per ring and week); `wall_pins` (PK wall + user); a unique index on `ring_members (ring_id, user_id)`. `rings` / `ring_members` already existed unused; `ring_members.position` is the seat number and a leaving member's `user_id` is nulled (seat kept).
- **Weeks and lock** (`lib/themewall.js`): week = whole weeks since Mon Jan 5 1970 00:00 UTC (`weekOf`, `weekStart`, `weekEnd`). `lockEndedWalls` runs on every `/api/me`, on `sealLedger`, and on every Theme Wall request: walls with `week < now` get `locked_at = weekEnd(week)` (the rollover, whenever it actually ran) and a `snapshot` of what was showing then. So the snapshot is the state at the first request after the rollover, usually minutes. A wall nobody used is locked with a NULL snapshot and is never sealed.
- **Theme** (`themeFor`): nothing stored. The six types (neon, webring, guestbook, counter, construction, divider; never `found`) are shuffled per 6-week cycle (seeded by the cycle) and played in order; if a cycle would open with the last cycle's last type, its first two swap. So it never repeats two weeks running and every type comes up once per six. The wall stores its own copy of the theme. A match is `type == theme` or `type == 'found'`.
- **Canvas** (`canvasSize`): square, slots = members + 2 (default rings: at least 8 + 2, since they fill up over the week), area = slots x 88 x 31 x 4, side rounded up to a multiple of 5 (a full ring is 335 px). Fixed when the wall is made (first look of the week).
- **Rings.** `ensureDefaultRing` (on the first Theme Wall look): a player in no ring goes into the fullest default ring with a free seat (8 seats), else a new "~*~cLuB~*~ Ring #N". Default rings are owned by the webmaster so `deleteAccount` never deletes them. Bots are not in rings yet. `accounts.js` also deletes a player's pins.
- **Placement.** `placePin` (server, the last word): any pixel in bounds is fine (edge snapping lands off-grid); a drop on top of someone lands in the nearest free spot (grid spots plus spots flush against other pins, empty reserved spots included); a full wall refuses. The page (`twSnap`): 5 px grid, then flush against a neighbour's edge within 6 px; a drag onto somebody stays at the last free spot. Arrow keys / buttons nudge 5 px (Shift: 1). Saves 250 ms after a nudge, at once after a drag. Fixed size, no rotation, no scale; stored in wall pixels, drawn at `min(2, fits)`.
- **API** `/api/themewall`: GET (`ring`, `week`) gives the wall, pins (with the copy's finish so `bannerImg` draws them), members and your rings; POST `pin` (copy optional when moving) and `unpin`. This week only; members only. Looking calls `markSeen` on the shown designs, like visiting a page.
- **Ledger.** New kind `wall`: record `["wall", id, ring, week, theme, size, [[user, copy, design, x, y], ...], locked_at]` (ids only, empty spots have null copy and design), sealed once per locked wall that has a snapshot. The ledger line: "<ring>'s Theme Wall (NEON) was locked with N buttons on it", linking to the wall.
- **Ring admin** (`functions/api/rings.js`, page `#rings`, webmasters only; linked from the Theme Wall): GET lists every ring with its members and this week's wall (spots up of spots); POST `create`, `rename`, `delete` (type the ring's name; finished walls are sealed into the ledger first, then seats, walls and pins go), `add` and `remove` a player by name (bots refused; a player can be in any number of rings; removing empties the seat and takes their pin off this week's open wall, other rings untouched). Each action goes to `admin_actions` and the ledger vaguely, with no names (`ring_create`, `ring_rename`, `ring_delete`, `ring_add`, `ring_remove` in `ADMIN_SAYS`). Automatic "cLuB Ring #N" rings still fill for players in no ring (shown as "auto"), and can be renamed, emptied or closed like any other. A wall's size is fixed when it is first opened for the week (members + 2), so people added after that only fit in the spare spots.
- **Stars.** `twDraw` counts the pins whose `match` is true and draws that many ★ in a row between the heading and the canvas ("☆ no on-theme buttons yet" at zero); nothing is drawn on a pin any more (the picker still marks matches). The roster keeps its ★.
- **Page.** `#themewall` (and `#themewall/<ring>/<week>` for earlier weeks), a nav link, the last-day warning, a picker for your buttons (theme matches first, ★; locked or away ones greyed), a "Who's up" list. How to Play has a Theme Wall section. Footer v0.38.
- Checked: `node --check`; a 0.2 s node test on an in-memory SQLite with the real `schema.sql` (week boundaries, 600 weeks of themes, canvas sizes, placement, the ring admin actions and their refusals, default ring filling to 8 and the ninth starting a new ring, pins going empty on trade / fusion / away and coming back, lock timing, frozen snapshot, empty wall not sealed, the real GET / POST handlers with sessions, ledger sealing and chain verification, the ledger API's SQL); and a headless Chromium run at 390 px with a mock API (drawing, ★, dragging with grid snap, arrow keys, the picker, no page errors from the new code). Found and fixed by the test: the member's name and the button's name were both `name` in one query.
- Not built: bots in rings, joining or making your own rings, the forced send, fill tags, scoring, shapes, rewards.

## v0.37.2 — "A Few More Mysteries"
**Sat Oct 17, 2026 · 11:12 AM HST** (no migration)

Owner: "add maybe like 20 more ? blocks" and "show a couple found buttons" on the logged-out Wall.

- `functions/api/designs.js`: logged out, a design is a mystery only when it isn't common (found commons are sent with their pictures again, as before v0.37).
- `renderWallGrid` logged out: the cLuB commons, 2 random found buttons and 25 random ? tiles (was 5), spliced in at random. The count line still says the full number.
- Footer and cache tags 0.37.2. `node --check` only.

## v0.37.1 — "Five Mysteries"
**Sat Oct 17, 2026 · 10:58 AM HST** (no migration)

Owner, after trying v0.37: a Single given to himself opened fine; the logged-out Wall worked but "the huge blank wall seems intimidating".

- **Logged-out Wall** (`renderWallGrid`, page only): the API still sends every design with the mysteries marked (v0.37's rule); with no `me` the grid keeps the known tiles and splices in 5 random mystery tiles at random places. The count line still says the full number.
- **Packs unselectable**: `.pack-tile` and everything in it get `user-select: none` and `-webkit-touch-callout: none`.
- **Give packs "who"**: the text box and its datalist became a `<select name="name" id="givepack-names">`: "pick a player..." (empty), "★ everyone ★", then every player from `/api/players` (people first, bots marked [bot]); `loadPlayers` keeps the current pick when it refills. The server side is unchanged (`name` or "everyone").
- **Fixed (owner's screenshot): foiled and effect buttons on a phone.** v0.37's phone rule forced `width: 100%` on the img and on `.foil-wrap`/`.fx`, but those wrappers are sized from `--w`/`--h` (and the marquee track is twice `--w`), so they came out cropped or blown up. The rule is gone; `showPage` now works out the scale (`min(2, what fits two to a row)` under 480px, else 2) and passes it to `bannerImg`, which sizes every layer from it. Checked as a screenshot at 390px with a plain, a holo, a marquee and a holo + dial-up copy.
- **Top marquee lines.** `MARQUEE_90S` gains 10 (You've got mail, under construction 4ever, 14.4K modem, the information superhighway, no blink tags...); new `MARQUEE_BUTTONS` (10 lines about buttons: 88 x 31 pixels, foils, fusing, ultras 1 of 1, found buttons, the streak and the ~*~cLuB~*~ Single...). Each load also adds "BUTTON SPOTTED: NAME (RARITY)" from a design the viewer can see, and "N BUTTONS AND COUNTING" joins the random pool (one more `/api/designs` call per page load). `MARQUEE_SIZE` 5 to 6. Plus "1337 h4x0rZ oNLy" (owner's).
- **"You have found..."** (`#found-line`) is picked each page load from `FOUND_LINES`: the owner's found, stumbled upon, discovered, surfed onto, plus wandered into, dialed into, been linked to, arrived at, uncovered, "Welcome, web surfer, to...", "Your search returned...", unlocked.
- Footer v0.37.1; css/js cache tags 0.37.1. `node --check` only; not rendered in a browser.

## v0.37 — "Plain Windows"
**Sat Oct 17, 2026 · 10:25 AM HST** (no migration)

Decisions (owner): take back the collapsible windows ("have them be normal"); a logged-out visitor should see fewer buttons on the Wall than a logged-in player (who only sees what they've seen); Ledger lines should lead with the card ("CARD was opened by USER, because the card is the main thing").

- **Folding removed.** The whole v0.31.1/v0.32.2/v0.34.5 folding section of `app.js` (`foldKey`, `isFoldHead`, `foldBody`, `setFold`, `prepFold`, `applyFolds`, `toggleFold`, the click and key handlers, the MutationObserver) and the `.fold-*` rules in `style.css`. The » « headings stay as decoration. Old `fold-*` keys in players' localStorage are now unused.
- **Wall, logged out** (`functions/api/designs.js`): a design is a mystery unless it is an original-tier common (was: only rare, prototype, ultra and special were mysteries). On the live catalog that is 36 shown and 433 as "?" (375 archive commons and 16 uncommons became mysteries). The info-window path (`?id=`) uses the same rule. Logged-in players are unchanged (seen-only, v0.30).
- **Ledger lines** (`ledgerItem`): card or pack first, then who. Transfers use `MOVED[reason](copy, to, from)` (18 reasons; an unknown one reads "X went to USER (reason)"); `ledUser(name)` links a name to its page. Fusion "X #n was fused from 3 copies by USER, now FINISH!"; foil "X #n came with a GOLD finish for USER!"; request "X was wished for by USER on the request board"; pack "Sealed pack #n was made for USER (source)" / "was traded|stamped|given to A by B" / "was opened by USER!"; design "X (rarity) was found by USER and joined ~*~ tHe cLuB ~*~". WEBMASTER lines unchanged. The bold kind labels (PACK, FUSION, FOIL...) are gone from the line.
- **Free Packs on the streak** (owner: "give Free Packs to the players on day 4 and 6"; chose the one-card kind). Migration `027_free_sealed_packs.sql`: `packs.cards` (default 3). `streakReward` (and the page's `streakDay`) pay `free` on days 4 and 6 of week 1 and of every later week; `touchStreak` gives `{ count: 1, cards: 1 }`, and `rewardOnce` passes `cards` and `keep = cards` to `givePacks`. `openPack` on a `cards = 1` pack rolls one card with `rollFreeCard` and its finish with the new `freeFinish` (both in `lib/freepack.js`, exported; the front page's free pack uses the same `freeFinish` now), stored in `pack_openings.finishes` so `keepFromPack` mints it with that finish. Pack lists select `p.cards`; the page names such a pack "Free Pack" ("free pack · 1 card" on the tile), says "keep 1 of 1", and the streak track shows it on days 4 and 6. How to Play updated.
- **Free Pack looks** (owner: "simple and classy, 90's geocities, no shine"; three shown as screenshots before release): `packTile` for `cards === 1` picks `fp-a|b|c` by pack id % 3, with class `still-art` (no `pack-shine` animation) and no `gleam`. a: cream guestbook page, navy double rule, Georgia italic "Free Pack", "thanks 4 visiting!"; b: navy starfield (static radial-gradient dots) with a Win95-bevel grey box "FREE / PACK" in Times; c: white page, blue underlined "Free Pack", groove rule, visited-purple "[ 1 card ]", "« prev · ring · next »". Then, owner: "a little more attractive or fun": a gets a rotated red FREE stamp (where the quill was), a plum name and a green-on-black hit counter (`visitor 000042`); b a crescent moon, rainbow gradient text on FREE and a yellow NEW! starburst (clip-path) under the box; c a rainbow rule and an "✉ e-mail me!" link. All static. Then: "Free Pack" bolder on all three (a 19px 900 with a pink drop, b's FREE 19px 900 and PACK bold navy, c 18px bold), and the owner's standing rule, **always ~*~ around cLuB / 88x31 cLuB**: every pack top reads "~*~ 88x31 cLuB ~*~", and the ledger's found line says "added to ~*~ tHe cLuB ~*~". **Renamed** (owner: "technically, everything is a free pack"; "pack" sounds like more than one card; chose "~*~cLuB~*~ Single" over Bit Pack, Byte Pack, Floppy, 1-Up, Postcard, Pixel Pack): the shelf name (`packLabel`), the tile sub ("single · 1 card"), the dashboard and streak track lines, How to Play; the looks read "Single" (a, with a "1 CARD" stamp), "~*~cLuB~*~ / SINGLE" in the box (b) and "Single" (c). The front page's logged-out Free Pack keeps its name. Then "~*~cLuB~*~" above "Single" on a and c too (`.fp-club`), as b already had; a drops its "1 card inside" (the stamp says it) so it fits. Internal names (`cards = 1`, reward `free`, `th-fp-*`) unchanged. The streak track's day 4 and 6 preview is look a.
- **Collection at 2x** (owner chose 2x over 1.5x so the pixels stay even): `bannerImg(b, 2)` on the page's collection grid only. Under 480px wide the tiles are half the row each (`calc(50% - 4px)`, image width 100%), so a phone shows two per row at a little under 2x; at a full 2x it was one per row. Checked as a screenshot at 390px with 12 real banners; foiled and effect buttons at that size not checked.
- **Visitors** were already shown only on your own page (`showVisitors` returns unless `mine`): other people don't see items visiting from 4Dungeon. No change.
- **Button strip on phones** (owner: it doesn't scroll on mobile). The `prefers-reduced-motion` block stopped `.strip-track`; phones often have Reduce Motion on (the same reason the two text tickers were already exempt). It now keeps moving there. The loop was `translateX(-940px)` regardless of how many buttons the track held; it is `-50%` now (the track holds its buttons twice). Checked in Chromium at 390px with Reduce Motion on: 75 px in 1.5 s.
- **Bottom menu**: the Trades link removed (the `.trades-link` code handles none); class `bottom-bar`, 18px like `.top-bar` (15px under 560px), links don't break mid-word.
- **Effects much rarer** (owner: "a LOT of effects rolls ... i thought they were supposed to be the most rare thing"). `EFFECT_CHANCE` 0.10 to 0.0005 (1 in 2,000 new copies), under tier 3 foils' 0.1%. `FUSE_EFFECT_CHANCE` (10% on a fusion with no effect going in) and fusion's effect ladder are unchanged, so fusing is the way to an effect. Copies already made keep theirs.
- **Fair Play**: tier 2 row "Tier 2 (Chrome, Gold, ???)" (Oil Slick hidden like tier 3's); the "Some real foils also get a pattern ... effects ... Finding a button first ..." paragraph removed. Panel order at the bottom: The Ledger, Ledger Status (with the latest entries), Bitcoin Receipts (its step 3 now points at the Latest fingerprint "above").
- **Give packs** (webmaster): the pack list gains "~*~cLuB~*~ Single (1 card)" and "Welcome pack" (`kind:single` / `kind:welcome` option values). `give_packs` takes `kind`: a Single is `{ source: "webmaster", cards: 1, keep: 1 }`, a Welcome pack `{ source: "welcome", keep: 2 }` (note defaults to "welcome to the cLuB!"); neither with a series or special. The admin action note names them.
- Footer v0.37; css/js cache tags 0.37.
- Checked: `node --check`; every ledger kind and 5 transfer reasons rendered in node with stand-ins for the DOM helpers. Not rendered in a browser.

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
