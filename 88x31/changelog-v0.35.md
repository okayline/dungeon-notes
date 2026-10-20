# 88x31 cLuB — Dev Changelog — v0.35–v0.46.4

Detailed changelog for the 88x31 game (public repo: okayline/88x31, live at 88x31.app).
The public repo keeps a shorter, general changelog. Newest first. Times are Hawaii time (HST). Older: `changelog-v0.34.md`.

---

## v0.46.4
**Tue Oct 20, 2026 · 2:10 AM HST** (no migration)

Decisions (owner, thread on the streak track, Oct 20): asked why the same rare kept coming up ("my third drop of this exact button"), then "could you do the fewer repeat rares thing please", then "can you just make it lower the odds of ones you already own (a lot), but not completely skip?". So: a weight, not a filter.
- **`rollDesigns` (`lib/game.js`)** takes `opts.userId`. It reads the player's rare designs (`instances.owner_id = ?`, `consumed = 0`, `designs.rarity = 'rare'`) once per roll. When a card rolls a rarity, the pick among that rarity's designs is weighted: an owned design has `OWNED_WEIGHT = 0.1`, any other 1, so an owned rare is 1 in 10 as likely as an unowned one (`pickLessOwned`). Only rares count as owned; commons, uncommons, prototypes and ultras roll as before. Removed: every design of a rarity being equally likely whatever you owned. With no `userId` the old `randInt` pick is used, unchanged.
- **Rarity odds are untouched.** The 8% rare roll (`ODDS_PER_1000`) is the same, so a pack has the same chance of holding a rare; only which rare changes. If you own all of a series' rares, they are equally likely again (all weights 0.1). A copy used up in a fusion (`consumed = 1`) does not count as owned.
- **Callers passing `userId`:** `functions/api/pull.js` (the daily pack and the bonus pack's fresh pack) and `openPack` in `lib/packs.js` (sealed packs: club, series, special, webmaster, streak). Not passed: `giveWelcomePack` (a new player owns nothing), and the one-card Free Pack, which rolls through `rollFreeCard` in `lib/freepack.js` (it can still deal a rare you own: not asked for, left alone).
- **Why the repeats happened (finding, no code change):** a rare is 8% of an ordinary card; Beta takes 70.6% of ordinary cards (series weights 60/25 with two active); 12 Beta rares are equally likely; a daily card is an ordinary button 93.3% of the time. So one named rare is about 0.44% per daily card, 2.6% a day for 2 packs; a Beta series pack is about 0.67% per card; special packs are boosted (rare 11%, one guaranteed). Three of one rare is unlikely from daily packs alone. Not known: how many packs the player had opened.
- **Effects (finding, no code change):** `EFFECT_CHANCE = 0.0005` (1 in 2,000, `lib/game.js:180`) since v0.37 (Oct 17, 10:25 AM HST), and the live `/api/odds` reports the same. From the public ledger (all 1,542 entries): 16 of 191 new copies before v0.37 had an effect (about 8%, the old 10%), 1 of 138 after it. The one is the owner's Y2K Ready #6 (Dial-Up, streak pack, Oct 20), which is plausible luck at 1 in 2,000 (about 1 in 15 for one or more in 138 copies). Fusion is the other source (`FUSE_EFFECT_CHANCE` 10%).
- **Checked:** `node --check` on the three files; a scratch script (not committed) on Node SQLite with a throwaway schema: 12 rares in one series, 11 owned (one more owned but consumed): the unowned one came up 47.5% of 20,000 single-rare rolls (expected 1/(1+1.1) = 47.6%); with no `userId` it came up 8.3% (expected 8.3%); owning all 12 still shows all 12. No test suite in this repo.
- **Not checked:** the live site; the real database; how the Fair Play page words this (it has no line for it, so there is nothing to say yet: not asked for).
- `public/index.html`: v0.46.4.

## v0.46.3
**Tue Oct 20, 2026 · 1:57 AM HST** (no migration)

Decisions (owner, Oct 20): "for this part, could we have it so it keeps going past day 7? maybe keeps going indefinitely?" (a screenshot of the dashboard's visit streak track). The server already paid streak packs forever (`streakReward`: from day 8 on, the 3rd to 7th day of every week pay out), so this is the display only. Picked: a rolling window, not a wider track.
- **`streakChart` (`public/app.js`):** the track is always 7 cells: the 3 days before today, today, and the 3 days ahead, starting no earlier than day 2 (`start = Math.max(2, n - 3)`, `for d < start + 7`). Removed: stopping at day 7 and then drawing whole weeks (days 8-14, 15-21...), which hid the days just behind you. Day 1 is still not drawn (v0.34.8).
- **`streakDays` (`lib/progress.js`):** looks up the packs you got on only those past days (`start = Math.max(2, n - 3)`), instead of the whole week so far. Removed: the week-based start (`n - ((n - 1) % 7)`).
- **Day 100 and up:** today's circle gets `.sk-wide` (`public/style.css`: `width: auto; padding: 0 3px; border-radius: 10px`) so three digits fit.
- **Rewards unchanged.** Because later days now show, you can see that days 8 and 9, 15 and 16 and so on pay nothing (the first two days of each week after the first; they draw as a "·"). That is how `streakReward` has always worked.
- **Checked:** `node --check public/app.js`; `lib/progress.js` imports. The real page in headless Chromium (Playwright) with stubbed API responses at streak days 1, 5, 7, 8, 12, 30 and 104: no page errors; the cell numbers, the circled day and the "Come back..." line were right each time (e.g. day 104 showed 101-107). Screenshots: project files `88x31-streak-track/streak-days-1-to-104.png`. No test suite in this repo.
- **Not checked:** a phone-width screen; the live site; real streak packs from the database (the screenshots used made-up packs).
- `public/index.html`: v0.46.3.

## v0.46.1
**Tue Oct 20, 2026 · 1:33 AM HST**

Decision (owner, thread on the registry link, Oct 20): the copy page keeps its link (no per-button registry page), with the text "Shared item registry: Item Name (item 49, copy #1)".
- `public/app.js` `showBanner`: the registry link's text is now `${b.name} (item N, copy #M)`. Removed: "this copy's page". Same target `/registry?item=&copy=`.
- Mystery rule: this page already shows `b.name` in its heading to every viewer, logged out included (`/api/banner` doesn't hide names), so the link shows nothing new. The registry page itself still shows rare-and-up 88x31 buttons as "a mystery button". Tombstones show "Removed by request".
- **Checked:** `node --check public/app.js`. No test suite in this repo. **Not checked:** how it looks on screen before the push.
- `public/index.html`: v0.46.1.

## v0.46
**Tue Oct 20, 2026 · 12:55 AM HST** (migration 029, run before the push; needs dungeon-items' HTTP `addMark` live first). Migration 029 run by the owner in the D1 console (Oct 20, 12:34 AM HST), then pushed to main.

Decisions (owner, thread "shared registry ideas", Oct 20): "every game writes marks", "let's stamp as much info as possible !", "yeah can we work on 88x31 marks next?". The 4Dungeon side chose "once per copy" for lived-through marks; the same here.
- **Step 7 of `syncRegistry` (`lib/registry.js`): marks.** With the budget left after steps 1-6, oldest instances first, for a copy the registry has with its owner here (`registry_copy > 0`, not spent or consumed, not away `locked != -1`, `owner_id = registry_owner`) whose marks were never stamped or whose `ownership_history` has grown since. `copyMarks(c, hist)` lists [kind, value]:
  - night: the moon's phase at `instances.created_at` (`PHASE_MARK[moonIndex]`) and each occasion that day (`occasions`).
  - how it came, from the first history row: pack `pulled_pack`, free_pack `free_pack`, welcome/starter `welcome_gift`, daily `daily_pick`, pass_on `passed_on`, set_reward `set_reward`, admin `from_webmaster` (found uploads aren't on the ladder).
  - copy #1 / #100: `first_copy` / `hundredth_copy` (the shared number, as 4Dungeon and irl-dungeon).
  - finish: `first_print` when `foil` is NULL; `foil_<id>` unless clear; `pattern_<id>`; `effect_<id>` (ids lowercased, other characters to `_`, 40 max).
  - lived, from later rows with a `to_user`: trade `traded`, gift `gifted`, guestbook `guestbook_gift`, request `filled_request`, fusion `fused` (the survivor). away/home are already moves; trade_in uses the copy up.
  - Each value once per copy (key `inst:<id>:<value>`). A fusion that changes the finish adds a history row, so the new foil/pattern/effect is stamped too, beside the old ones.
- **`instances.registry_marks`** (migration 029, also in `schema.sql`): JSON `{ h, v }`, the last history id read and the values stamped. A pass that runs out of budget keeps `h` as it was, so the copy comes back. A refused mark is logged and not asked again (as refused births are).
- **`lib/sky.js`** (new): `moonIndex` and `occasions` copied from `daily-dungeon/screen.js` v1.33; irl-dungeon has the same copy (v0.22). Three copies of one eclipse table: a fix goes in all three.
- **Backfill:** every existing registered copy gets marks over the next passes (about 24 marks a pass at the default budget of 30, once a minute at most; the webmaster's `registry_sync` uses 120). Existing copies are marked with their *current* finish, which for a fused copy is the upgraded one.
- **Not checked:** the live database (how many copies, so how long the backfill takes and how many ledger entries it adds); whether 88x31's mystery rule should hide finish marks on rares and up on the public ledger (the page shows the sentence, e.g. "a mystery button #3 has a Gold foil", but not the button).
- **Checked:** no test suite in this repo. A scratch script (not committed) ran `syncRegistry` on `schema.sql` in Node SQLite with a fake registry: a pack copy made on Aug 12 2026 (a real solar eclipse, so a new moon) and traded got new, eclipse_solar, pulled_pack, first_copy, foil_holo, pattern_etched, effect_crt_vhs, traded; a welcome First Print on Oct 26 got full, welcome_gift, first_print; a second pass made no calls; a later gift and trade added gifted and traded once; a budget that ran out mid-copy finished on the next pass.
- `public/index.html`: v0.46.

## v0.45.1
**Mon Oct 19, 2026 · 10:10 PM HST** (no migration)

Decisions (owner): "no text glow ever".
- **Registry pictures** (`functions/api/img.js`): the registry stores every 88x31 button's picture as `/api/img?d=<design>` (`lib/registry.js` `IMAGE`), but the route only served uploads (`design_images`), so all 89 registered built-in buttons answered with `banners/removed.gif` (bug since v0.35, first visible on the v0.45 registry page). A design with no uploaded bytes now 302s to its own `image_key` file (never to an `api/img` key, so no loop); removed designs and unknown ids still get `removed.gif`. Checked with a stand-in database (built-in, upload, removed, upload key without bytes, unknown) and that all 89 registered `image_key` files exist in `public/banners`; live lookups read-only. Not checked on the deployed site.
- **No glow on the Singles**: removed the blurred `text-shadow` on `.tw`, `.th-bl-c .tiara`, `.th-bl-c .xo` and the glow half of `.bl .chrome`'s `drop-shadow` (the 1px white offset stays). Not touched: 12 older text glows elsewhere in `style.css` (not asked for).
- `public/index.html` 0.45 to 0.45.1.

## v0.45 — "Bling Bling"
**Mon Oct 19, 2026 · 10:00 PM HST** (no migration)

Decisions (owner): the cLuB Singles' three quiet homepage looks "are not doing it", redo them as 90s Blingee kawaii; three quieter 90s GeoCities Single looks were drawn too but are **saved for later, not added** (`/mnt/project-files/club-singles/geocities-saved/`). The registry ledger page gets 88x31's look, with 4Dungeon items in 4Dungeon's ASCII style, and a button's page and its registry page link both ways.

`public/index.html` 0.44 to 0.45 (footer and the `?v=` cache-busters).
- **cLuB Singles** (`packTile`, the `p.cards === 1` branch in `public/app.js`): looks `bl-a` Glitter Heart (hot pink, CSS heart with a face), `bl-b` Strawberry Milk (lavender/mint check, rainbow SiNGLE bubble), `bl-c` Midnight Tiara (plum, tiara, xoxo); still picked by `id % 3`. Each has a flickering glitter layer (`.glit`), a rhinestone edge (`.stones`) and four twinkles (`.tw`); an opened Single's sticker says "opened!". Removed: looks `fp-a`/`fp-b`/`fp-c` (guestbook paper, starry grey box, white link page), all their `.th-fp-*` CSS and `.pack-tile.still-art`, which only they used.
- **Registry links**: `/api/banner` also returns `instances.registry_copy`; a button's page shows "Shared item registry: this copy's page" under On the Ledger once the copy is registered (`registry_copy > 0`). New `GET /api/registry/button?item=&copy=` (`functions/api/registry/button.js`) finds the copy by `designs.registry_item` and `instances.registry_copy` and redirects to `/#banner/<id>`; an unknown copy goes to `/registry?item=&copy=`. The registry page (dungeon-items) links to it from an 88x31 button's copy page.
- Checked: `node --check` on the changed files; the redirect with a stand-in database (found, unknown, bad input); the lookup query on the live `88x31-db` (read-only: item 47 copy 4 finds instance 28); Singles screenshots from the real `packTile` and `style.css` in Chromium. Not checked: phones, and the deployed site. No test file (88x31 has none).

## v0.44 — "Open Ledger"
**Mon Oct 19, 2026 · 8:15 PM HST** (no migration)

`public/index.html` 0.43 to 0.44 (the footer and the `?v=` cache-busters on `style.css` and `app.js`, so browsers fetch the new `app.js`).
- **The shared registry's ledger on 88x31.app** (owner's ask: don't show the dungeon-items Worker's own address): `GET /registry` (the page), `GET /api/registry/ledger` and `GET /api/registry/copy` (`functions/registry.js`, `functions/api/registry/*.js`, `lib/registry-view.js`), plus `GET /api/registry/head` (for 88x31-anchors) and `GET /api/items` (for 4Dungeon's `tools/sync-items.mjs`) the same way. Each asks the dungeon-items Worker through the existing `ACCOUNTS` binding for the same path and hands back the answer; only the parameters the registry reads are forwarded (`before`, `limit`, `item`, `copy`); GET only, no key, nothing written. 4Dungeon's HISTORY `[L]EDGER` links here. Checked with the real Worker code over a stand-in database: page, ledger and copy answer, extra parameters are dropped, a missing copy answers 404 and no binding answers 503, no player id in the output, and the page renders and its row links work in Chromium; not run on Cloudflare. No new test file (88x31 has none).
- **24-hour time everywhere** (owner's ask, all games): `public/app.js` has one helper, `when24`, and the ledger stamp (`fmtStamp`), guestbook times (`fmtWhen`), the cLuB certificate's issue time and the wall's lock time use it (were the browser default, 12-hour in US locales: "9:52:13 PM"). Dates alone are unchanged. `node --check` passes; there is no test for page text.

## v0.43 — "Click Here to Enter"
**Sat Oct 17, 2026 · 11:30 PM HST**

Decisions (owner): the wall picker shows every button the player has in a fixed-height box ("it's ok to have the scroller if they have that many"); the line above the title no longer all starts with "You have", and must include "*dial-up noises* Connecting...".

- **Wall picker**: `.tw-grid` is 130 px high with `overflow-y: auto` (`overscroll-behavior: contain`); every button is drawn (no cap). Random order, buttons in a trade or away last; if it has to scroll (`scrollHeight > clientHeight`) it is redrawn with the week's theme matches first. Replaces the v0.41 "only what fits" trimming.
- **Opening lines** (`FOUND_LINES`, one random per page load): "You have found...", "You have dialed into...", "You have unlocked...", "You have surfed onto...", "Welcome, web surfer, to...", "*dial-up noises* Connecting...", "Buffering... buffering... buffering...", "Loading... 97%...", "Surfin' the information superhighway", "Click here to enter...", "Your search returned...", "Greetings from...", "Now entering...", "This site is best viewed at...", "Transmission received from...", "You've got buttons!" (the owner's 16 picks from a longer list).
- Checked: headless Chromium with 80 mock buttons (all 80 in the box, theme matches first, drag from the box still puts a button up).

## v0.42 — "Right Where You Are"
**Sat Oct 17, 2026 · 11:18 PM HST**

Decisions (owner): opening a pack must take the player to the cards (on mobile too), "maybe above the Packs panel"; guestbook stamped buttons bigger; the button collection centered in its panel.

- **Pack opening**: the old code asked the page to scroll (`block: "nearest"`) while the box still said "Loading...", so once the cards appeared below the fold nothing scrolled again. `#pack-open` is now its own `.panel` above the Packs panel (empty = hidden), and `showPull`, `openPackCards` and re-clicking an opened pack call `scrollIntoView({ block: "start" })` after the cards are in place (`scroll-margin-top: 8px`). Daily, sealed and bonus packs all use it.
- **Guestbook stamps**: a stamped button is `bannerImg(..., 2)` (sealed-pack stamps unchanged).
- **Collection**: `#page-collection { justify-content: center }`; on a phone it is still two to a row.
- Checked: headless Chromium at 390 px with the page scrolled to the bottom (the pack box lands at the top of the viewport, above the Packs panel) and at 900 px (59 px gaps on both sides of the collection; stamps drawn at about 172 px).

## v0.41 — "Stay Put"
**Sat Oct 17, 2026 · 11:05 PM HST**

Decisions (owner): the picker box is a fixed height with no scrolling; when a player has more buttons than fit, show the ones that fit the week's theme first (the owner accepts that this hints at the theme; otherwise a fresh random handful each time); a blank line under the lock / LAST DAY line; hopping between rings in the footer webring must not jump the page to the top.

- **Picker** (`twDraw`): `.tw-grid` is 130 px high, `overflow: hidden`; up to 150 buttons are drawn and the ones that don't fit are removed by measuring `offsetTop` (one layout pass). Order: a random shuffle, buttons in a trade or away last; if anything was cut, it is redrawn with theme matches (`twMatch`) first. Players with many buttons can't reach the rest from the picker (offered: arrows or swipe to page through).
- **Lock line**: `.tw-lock` has 1.6em of space under it.
- **Webring hops**: the `hashchange` handler skips `scrollTo(0, 0)` when both the old and new hash are `#themewall...`, and `route()` doesn't move the webring panel back to the footer when the target is a ring page, so the layout doesn't shift while the next ring loads (headless: the scroll position was identical before and after Next).
- Checked: headless Chromium with 80 mock buttons (9 shown, all theme matches, no inner scroll), the scroll position kept across Next, the panel staying under the wall.

## v0.40 — "Drag It Over"
**Sat Oct 17, 2026 · 10:58 PM HST**

Decisions (owner): the wall is drag and drop only, no buttons, with a long-press to pick up (and it has to work with a mouse on a PC); no explainer text anywhere on the wall page; earlier / later week links off "for now" (the owner has ideas for later); every wall the same size; new players go straight into a ring at signup; the webring panel under the wall panel; no stars (or theme-first ordering) in the picker.

- **Drag and drop** (`twHold`, `twCarry`, `twDraw`): the tray of your buttons is always shown under the wall (no "Put up a button" / "Change button" / arrow / "Take it down" buttons). A touch press has to be held 350 ms (a 10 px move first means scrolling; the phone buzzes on pick-up); a mouse picks up after 3 px. While carrying: a fixed-position ghost (`.tw-carried`) follows the pointer, a dashed preview shows the snapped, non-overlapping landing spot, touchmove is blocked so the page doesn't scroll. Drop on the wall: `pin` with instance + x/y (replaces your button; the server still has the last word on overlap). Pick up your own pin: drop on the wall to move it, drop on the tray (red dashed outline) to take it down, drop elsewhere to leave it. Arrow keys still nudge a focused pin. Mouse presses `preventDefault` so the browser's own picture-drag doesn't start; `dragstart` is blocked too. Found by the headless test: my ghost class clashed with the existing "your spot" label class (`tw-ghost`), renamed.
- **Wall page:** the tray hint, the "Every button of the <type> type adds a ★!" line and the earlier / later week links are removed (the week pages still exist at their links); the lock / LAST DAY line stays; no "locked" after the week label on old weeks; no "back to my ring" in the visiting line; `first_week` is in the GET reply for when the links return.
- **One wall size:** `canvasSize()` is a constant 335 px square, 10 slots, for every ring (older walls keep theirs). Rings over about 10 members get crowded; around 25 refuse new pins ("The wall is full"). Rings admin text updated.
- **Signup:** `createAccount` calls `ensureDefaultRing`, so a new player is in "~*~cLuB~*~ Ring #1" at once (the fullest default ring with a seat: #1 until it has 8, then #2, ...). Not the owner's literal "Ring #1 for everyone", because the fixed wall would fill; offered to lift the cap. Players who signed up earlier are still grouped on their first look.
- **Webring panel:** moved into the ring page under the wall panel (`webringTo`); back in the footer on every other page.
- Checked: node tests (fixed size, signup into Ring #1 then #2, joining, ring admin, API + ledger) and headless Chromium (mouse drag from the tray puts a button up with a preview, mouse drag of your pin onto the tray takes it down, simulated long-press touch puts one up, no leftover ghosts, webring placement both ways).

## v0.39 — "Everybody Gets One"
**Sat Oct 17, 2026 · 10:40 PM HST**

Decisions (owner): the daily pack has no "send to nobody" option, but it shouldn't be friction either: a drop-down (no typing) of players or "Random person", not a form. Rejected: a dealt list of three recipients, a "thanks" note back, extra choices. The button already remembers it was passed on from A to B (an `ownership_history` row with reason `pass_on`, shown in the ledger as "passed on to B by A"), so nothing new is stored. The owner will watch the print runs: twice as many copies come out of every daily pack. Fill tags are being rethought (the "Finishes the Ocean set!!" and ★ tags tell the player the answer, so the puzzle is gone); built on branch `fill-tags`, not merged. The "prediction mechanic" line in the design doc is not the owner's (they don't like it).

- **`POST /api/pull`**: one of the other two always goes out. `pass` defaults to the first other card that isn't the BONUS card; `to` is a name or `__random__` (the default). Random = a real player other than you, recently seen (14 days) first, then a bot only if no real player exists and the card isn't an ultra. A named bot recipient is refused for an ultra ("An ultra can only go to a real player."). The reply now has `to` (the recipient's name). Taking the BONUS PACK card skips all of this.
- **Page** (`showPull`): "No thanks, let the other two go" is gone; the first of the other two is pre-selected (radio, switchable); "Send it to" is a `<select>` with "🎲 Random person" first, then real players, then bots marked [bot], never you. After keeping: "Kept, and <name> got your gift!". Footer v0.39.
- Checked: a node test on an in-memory SQLite with the real schema (no pass and no recipient still sends one, to a real player; ultra to a bot refused; common to a bot fine; to yourself refused; one `pass_on` row written).

## v0.38 — "Theme Wall"
**Sat Oct 17, 2026 · 9:30 PM HST** (migration `028_theme_walls.sql`; pushed to main before the migration was run, so the Theme Wall and Rings pages answer with an error until it is; everything else, the Ledger page included, works without it)

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
- **Ring admin** (`functions/api/rings.js`, page `#rings`, webmasters only; linked from the Theme Wall): GET lists every ring with its members and this week's wall (spots up of spots); POST `create`, `rename`, `delete` (type the ring's name; finished walls are sealed into the ledger first, then seats, walls and pins go), `add` and `remove` a player by name (bots refused; a player can be in any number of rings; removing empties the seat and takes their pin off this week's open wall, other rings untouched). Ring upkeep is not written to the ledger or `admin_actions` (owner's choice); only a locked wall's snapshot is sealed there. Automatic "cLuB Ring #N" rings still fill for players in no ring (shown as "auto"), and can be renamed, emptied or closed like any other. A wall's size is fixed when it is first opened for the week (members + 2), so people added after that only fit in the spare spots.
- **Stars.** `twDraw` counts the pins whose `match` is true and draws that many ★ in a row right-justified over the canvas (same width), so they grow from right to left (a dim ☆ at zero, no count text); the theme line reads "Every button of the <type> type adds a ★!" and the lock line "The wall locks <local time>, then resets for next week's theme!" (with "★ LAST DAY! ★" in front on the last day); the explainer text under the wall (drag hint, picker intro) is gone; nothing is drawn on a pin any more (the picker still marks matches). The roster keeps its ★.
- **Page.** `#themewall` (and `#themewall/<ring>/<week>` for earlier weeks), a nav link, the last-day warning, a picker for your buttons (theme matches first, ★; locked or away ones greyed), a "Who's up" list. How to Play has a Theme Wall section. Footer v0.38.
- Checked: `node --check`; a 0.2 s node test on an in-memory SQLite with the real `schema.sql` (week boundaries, 600 weeks of themes, canvas sizes, placement, the ring admin actions and their refusals, default ring filling to 8 and the ninth starting a new ring, pins going empty on trade / fusion / away and coming back, lock timing, frozen snapshot, empty wall not sealed, the real GET / POST handlers with sessions, ledger sealing and chain verification, the ledger API's SQL); and a headless Chromium run at 390 px with a mock API (drawing, ★, dragging with grid snap, arrow keys, the picker, no page errors from the new code). Found and fixed by the test: the member's name and the button's name were both `name` in one query.
- Not built: bots in rings, joining or making your own rings, the forced send, fill tags, scoring, shapes, rewards.
- **Later that evening (same version).**
  - *Layout:* the Theme Wall page is now the ring's **Webring** page: title "~*~ <ring name>'s Webring ~*~", member count on its own line, a "~*~ Theme Wall ~*~" subhead (blank line above) over "This week's theme" plus a rotating 90s flavor line (`TW_FLAVOR`, 8 for construction, 5 for each other type). The lock / LAST DAY line, "Every button of the <type> type adds a ★!" and "« earlier week" moved below the wall. The "Ring:" label is gone, and the nav link is removed.
  - *Footer webring* (`#webring`): shows the ring's name, a 100x100 dashed placeholder for a future ring logo, a taller panel; Prev / Next step through rings, Random jumps, List Rings expands a list (Join removed). `GET /api/themewall?list=1` returns the rings (no side effects).
  - *Public rings:* any logged-in player can open any ring's wall (`guest: true`, not editable, no `markSeen`). Optional privacy: the ids in `meta.private_rings` (JSON list, no migration) are visible only to members and webmasters (a guest asking gets "No such ring."); Rings admin has Make private / Make public (`visibility` action). Nothing is private by default.
  - *Bot rings* (`lib/bots.js`): `ensureBotRings` makes, once (meta key `bot_rings`, needs a non-bot webmaster), "Bot Hangout" (the common ring; the webmaster adds themselves) and "Bots Only", all 7 bots in both. Bots can be added to rings in the admin now. New daily bot action `wall` (`doWall`, appended after `check` so earlier due times don't move): pins a random owned copy (70% a theme match if they have one) on each of the bot's rings' open walls, re-pinning if the copy is gone. Bot walls lock and seal like any other.
  - *Bot bursts fixed:* the scheduler is lazy (runs on page loads), so a quiet spell led to all overdue actions firing in one request (up to 15 in a minute in the ledger). Now one action per call and at least `BOT_GAP` = 90 s between actions (claimed through `meta.bot_gap`); overdue actions trickle out over later page loads, and ones more than about a day overdue are dropped.
  - Checked: node tests (bot rings once only, wall pins idempotent, guest view, listing, private toggle, admin adding bots) and a headless screenshot of the page and footer.
- **Next round (same version).**
  - *Trades page:* a "Start a Trade" panel at the top (a dropdown of every player, bots marked, a "Trade!" button). It moves the existing `#trade-panel` (the builder from people's pages) into `#tp-slot`, loads that player's collection, and opens the builder; `tradeHomeBack()` puts it back when a profile is drawn.
  - *Wall of Buttons:* for a logged-in non-webmaster, the buttons they've uncovered are drawn first, then at most `2 x columns + 2` ? tiles (columns measured from the grid), and the count line reads "...and more! We have N buttons and counting!" when ? tiles were left out. Webmaster and logged-out views are unchanged.
  - *Joining rings:* per-ring join type, `closed` (default, webmaster adds people), `open` (a "Join this ring!" button on the ring page), or `request` ("Request to join", then Approve / Decline under the ring in Rings admin). Stored in `meta.ring_join` (`{ types, requests }`; no migration, like `private_rings`); deleting a ring clears its entries because ring ids can be reused. API: `POST /api/themewall` actions `join` and `cancel_request`; `POST /api/rings` actions `join_type`, `approve`, `decline`. Bots can't join; private rings can't be joined. No notification to the requester.
  - *Trade History* (`GET /api/trades`): now also lists Request Board fills (`requests.status = 'filled'`, either side), newest first within the 25 shown: "you filled X's request for Y" / "X filled your request for Y". The thank-you pack isn't mentioned (the request row doesn't record it).
  - *Dashboard:* the "Last gift you got / gave" pictures are `zoom: 2`.
  - Checked: node tests for joining (closed refuses, request, approve, already a member, open), the history data both ways, and headless Chromium for the wall cap (5 known + 8 ? at 390 px), the trade dropdown opening the builder, and the Join button.

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
