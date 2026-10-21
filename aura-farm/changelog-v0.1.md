# AURA FARMING SIMULATOR: NO CAP BATTLE EDITION 2027 — Dev Changelog — v0.1–v0.37

Detailed changelog for aura-farm (public repo: okayline/aura-farm): an async bluffing game built from 4Dungeon's AURA
(cards in v0.1-v0.5, three sealed styles since v0.6). Live at aura.88x31.app (Worker `aura-farm`, D1 `aura-db`). The public repo keeps a shorter changelog.
Design doc: https://claude.ai/artifact/9CGedPpAUHQ6wAD9cxGRfg (kept up to date with every decision). Newest first.
Times are Hawaii time (HST).

---

v0.24 to v0.37 were written up afterwards from the commit diffs (`8b81ced` to `9acfe34`); the screens were not run in a
browser for these notes.

## v0.37: Oct 21, 3:20 AM HST: reload stays on the same tab; only the top 3 leaderboard portraits glow (PR #20, `9acfe34`)
- `public/app.js` `syncAddress`: The Farm, Today and Ledger put `?tab=board|top|ledger` in the address (replaceState);
  a farm is still `?farm=N` and Home the bare address. On load, `?tab=` opens that tab unless `?farm=` is there too.
  Removed: reloads always landing on Home.
- `boardOfDay`: the portrait halo glow is `[18, 11, 5][i] ?? 0`, so places 1-3 glow less each and 4 and below don't.
  Removed: the same glow on every row.

## v0.36: Oct 21, 3:10 AM HST: each row in The Farm says how long the farm has been up (PR #19, `d56dc91`)
- `src/worker.js` `board`: each row has `up`, the seconds it has stood (from the server, so the phone's clock doesn't
  matter). `public/app.js` `upText`: "Up for 5 hrs" ("min" in the first hour, "hr" for one), under FLEX or FARMING, and
  the 20-second timer updates it (`data-upfor`). Removed: nothing.
- Test: "The Farm lists…" also checks `up` is [7200, 3600, 0] for farms an hour apart.

## v0.35: Oct 21, 3:08 AM HST: no "DRIP beats RIZZ…" in the FLEX Details panel (PR #19, `a153052`)
- `takeInfo`: removed the sentence "DRIP 💎 beats RIZZ 😏, RIZZ 😏 beats MOG 🗿, MOG 🗿 beats DRIP 💎." The style cards
  above it still say what each beats (v0.14). Added: nothing.

## v0.34: Oct 21, 3:08 AM HST: The Farm lists whoever has been farming the longest first (PR #19, `9f995dc`)
- `board`: `ORDER BY d.posted_at, d.id` (oldest first). Removed: `ORDER BY d.posted_at DESC` (newest first).
- New test: three farms posted an hour apart come back oldest first.

## v0.33: Oct 21, 3:05 AM HST: the home screen's farm panels are a size bigger (PR #18, `805bd5f`)
- `.item.home` (index.html): padding 17px 16px, radius 16px, 18px text, 14px small text, on Home's list only. Removed:
  the smaller size there. The Farm, Today and Ledger lists are unchanged.

## v0.32: Oct 21, 3:04 AM HST: "Earned so far" in an open farm's Details (PR #18, `61867db`)
- `earnText`: 10,000 for each whole hour since the farm went up, capped at 24 hours, updated by the timer
  (`data-earn`). It counts this farm on its own, so farms up together each show the full amount, while the player's
  total counts overlapping time once. Removed: nothing.

## v0.31: Oct 21, 3:03 AM HST: three explainer sentences removed (PR #18, `729e454`)
- Removed from the open farm page: "Nobody has taken it yet. It comes down on its own when the time is up.", "Farms up
  at the same time earn once, not twice." and "Sealed with this fingerprint of your style…". Removed from the FLEX
  panel: "Sealed with this fingerprint of their style…". The fingerprints stay. Added: nothing.

## v0.30: Oct 21, 3:03 AM HST: details panels start rolled up; a farm opens at its top (PR #18, `e998852`)
- `rolled()` in app.js: the FLEX Details, the open farm's Details and the finished farm's Results are `<details>`
  panels that start closed. Which are open is kept in `openBoxes` while the same screen redraws and cleared when a
  different farm (or the You screen) opens. Opening a different farm scrolls to the top. Removed: the panels always
  open, and the page keeping the list's scroll position.

## v0.29: Oct 21, 3:00 AM HST: a panel of public info under the FLEX button (PR #18, `975dc49`)
- `takeInfo`: farm number, who put it up, put up / comes down, time left, stood for, if you win / lose / same style,
  your aura today, your farms up (of 3), the "beats" sentence (removed again in v0.35) and their style's fingerprint.
  Their style is never in it. Removed: nothing. The commit says an "earned so far" line under FARMING on The Farm was
  dropped before release.

## v0.28: Oct 21, 2:57 AM HST: profile pics on the AURA LEADERBOARD; Ledger heading "Legends of AURA" (PR #18, `d90ca82`)
- `boardOfDay`: `halo(pic(name))` beside each name. `ledgerTab`: heading "Legends of AURA". Removed: rows with only rank
  and name, and the heading "The ledger". The tab itself is still called "Ledger".

## v0.27: Oct 21, 2:34-2:37 AM HST: a bigger bottom menu; profile pics from the name (PR #17, `8d89d81`, `3297a31`)
- Tabs: the emoji (28px) above the name (16px); `.app` bottom padding 90px to 118px.
  Removed: emoji and name on one small line.
- `pic(name)`: one of 24 emojis by an FNV-1a hash of the lower-cased name, so a player has the same one on every screen
  and redraw. Used on The Farm, the take screen, the face-off and the open farm page. Removed: 😎 for everyone else and
  🧍 for you. A renamed player gets a new pic (it follows the name, not the player id).
- The finished farm's Results panel has margin-top 30px (was 14px).

## v0.26: Oct 21, 2:28-2:31 AM HST: a finished farm's page is detailed (on main, no PR: `ab8f56f`, `34c27fd`, `87f90f7`, `e87158e`)
- `pastDetails`: Result, put up by / taken by with style and aura each, put up, taken, stood for, rules version, both
  players' latest styles, and each side's commitment with "then showed STYLE|salt" from the sealed record. Hidden
  (`.detail.wait`) until the reveal ends (`reveal.js` `end` removes it). `farmView` sends `takenAt`, and `left` only
  while open. Removed: the face-off with only the seal under it.
- Tried and removed inside v0.26: past-game cards on Home with WON/LOST/TIE, both styles, farm number and time
  (`ab8f56f`, trimmed in `87f90f7`, gone in `e87158e`), and an explainer paragraph about salts above the proof. Home's
  cards are as in v0.25.
- The open farm page no longer says "Only you can see it" (`34c27fd`).
- Test: `takenAt - postedAt` is the 2 h 1 min the farm stood; a finished farm's `left` is null.

## v0.25: Oct 21, 2:26 AM HST: time left on a farm; your open farm's page filled in (on main, no PR: `7e1e6b5`)
- `farmView` and `/api/today` rows send `left` (seconds to the 24-hour end) and `postedAt`. The page stores when the
  answer arrived (`_t`) and a 20-second timer rewrites only the `[data-end]`, `[data-since]` and `[data-bar]` spans;
  when one runs out it refetches that farm (or `/api/today`). Home shows "+10,000 an hour · 21h 40m left".
- `openFarmPage`: Farm #N, "(name) is farming", time left, a progress bar, the sealed style with what it beats and loses
  to, and a panel: put up, comes down, up for, earning, at most +240,000, aura today, farms up of 3, record, fingerprint.
  Removed: the bare "Farming" panel and card.
- Test: a new farm has 86,400 s left; after 2 h 1 min both the Home row and the farm page count down to match.

## v0.24: Oct 21, 2:22 AM HST: spacing around the line and caption; the reveal's emoji no longer drops (on main, no PR: `8b81ced`)
- `.cap` gets `margin: 22px 0`. Removed: the tighter spacing.
- `reveal.js` `pos`: the flying copy is centred on the emoji itself, leaving out the card's bottom padding. Removed: the
  copy starting about 10px low and popping back up.

Tests at v0.37 (`5fb74d8`): `npm test` 18 pass, 0 fail, run for these notes with the history fetched
(`git fetch --depth=300 origin main`). Live site not checked.

## v0.23: Oct 21, 1:45 AM HST: the farm page shows its whole ledger entry again (v0.17's aura-farm half; on main as `fd3694a`, no PR)
- min, after the rollback: "yeah i think the 'switch anyway?' thing messed it up. so can we skip that one. can we do 0.17?"
  v0.16 is skipped for good; min later: "can we not do anything about that logging out stuff? that was a bad thread".
- `src/worker.js` `farmView`: `ledger` is `{ entry, record, prev, hash }` (one more subselect, `prev_hash`, in the same
  query). `public/app.js` `seal`: "📜 Ledger entry #N", "On The Registry ›", then "record … / prev … / hash …" in small
  monospace (`.seal` in index.html). Removed: the hash shown alone in a `<code>` line. Same code as v0.17's `fa84e18`,
  ported onto v0.22 (no `leaveOk`, no browser confirm).
- NOT built: v0.17's dungeon-items half (an Aura Farm registry panel opening `https://aura.88x31.app/?farm=N` when
  tapped anywhere, and its seal lines removed). The registry page still only links "Farm #N" at the start of the
  sentence (`src/public-ledger.js` line 344, seen, not changed).
- VERSION 0.23. Test: the take test checks `ledger` against raw SQL and that sha256(prev + "|" + record) = hash
  (node:crypto). 17 pass; with a shallow clone the migration test fails on `git show a35b001:schema.sql` (needs the
  history: `git fetch --depth=300 origin main`), on the code before this change too. Checked in headless Chromium at
  390 px with a mocked /api: the three lines show, no standalone hash, no sideways scroll, no page errors. Not checked:
  the live site.

## v0.22: Oct 21, 1:30 AM HST: more random names (live, PR #16)
- From the public CHANGELOG and the commits (`a957a85` to `84d2e41`); the code was not re-read for these notes.
- 22 new first words and 17 new last words. Removed: the old last words Bean, Cat, Rat, Pigeon, Raccoon, Possum, Frog,
  Shrimp and Capybara (the animals). `src/names.js`.

## v0.21: Oct 21, 1:24 AM HST: each browser keeps its own player (live, PR #15)
- From the public CHANGELOG, commit `d2507bc` and the comments in `src/worker.js` (lines 109, 451-471, 533-544); the
  behaviour was not run for these notes.
- A browser's own player (one with no save code or passkey) is remembered in a second cookie while the browser is logged
  in as someone else; log out goes back to it. If that player was deleted or has since got a save code or passkey, log
  out starts fresh. Removed: a new empty player after every log out.

## v0.20: Oct 21, 1:18 AM HST: log out on one tap; forget/remove ask in the page (live, PR #14)
- From the public CHANGELOG, commit `d8ef6e3` and `public/app.js` line 12 (`ask`); not run for these notes.
- Log out takes one tap. Forgetting a save code and removing a passkey ask "are you sure?" on the page itself (Yes / No).
  Removed: the browser pop-ups for all three.

## v0.18 and v0.19: Oct 21, about 12:48 and 12:56 AM HST: log-out changes (NOT live)
- v0.18 (`d78b14b`): log out set the cookie to "out", and `needPlayer` refused to make a player for a logged-out browser
  until it logged in. v0.19 (`2a5e65f`): the browser's own player kept in a second cookie (`afh`), log out switched back to
  it; removed v0.18's log-in-first ask and v0.16's confirm.
- Both were reverted (`f801bc6`, `3719077`: "Revert Merge pull request #10 / #11"). Then `d755476` rolled the whole tree back
  to v0.15, which also removed v0.16 and v0.17. The commit messages give no reason. v0.20 and v0.21 came after, on v0.15.

## v0.17: Oct 21, 12:40 AM HST: the farm page carries its whole ledger entry; registry panels open it (with dungeon-items) (ROLLED BACK in `d755476`, not live; the aura-farm half came back as v0.23)
- min: "in the shared registry, if i click on the panel can it link to the game ledger entry? like
  https://aura.88x31.app/?farm=33" and "in the shared registry panel there is tons of text for the record and hashes. is
  there any way to put that info on the ledger entry page instead?"
- `src/worker.js` `farmView`: `ledger` now has `record` (the sealed JSON string, exactly as hashed) and `prev` as well
  as `entry` and `hash` (same one-trip SELECT). `public/app.js` `seal`: "📜 Ledger entry #N" and "On The Registry ›",
  then "record … / prev … / hash …" in small monospace (`.seal` in index.html). Removed: the hash on its own line.
- dungeon-items `src/public-ledger.js`: an aura-farm checkpoint panel with a farm number opens
  https://aura.88x31.app/?farm=N when tapped anywhere (links inside still work), and drops its seal lines. Note: those
  were the registry's own record/prev/hash for that checkpoint, not the farm's; they're still in /api/registry/ledger,
  but no longer shown on the page. The farm page shows the farm's own ledger entry.
- Test: the take test checks `ledger` against raw SQL and that sha256(prev + "|" + record) = hash (node:crypto).
- VERSION 0.17. 15 tests pass (dungeon-items 81). Checked in Chromium with mocked APIs: the farm page shows the entry;
  the registry panel has no seal lines and a tap goes to https://aura.88x31.app/?farm=33. Not checked: the live sites.

## v0.16: Oct 21, 12:35 AM HST: "Switch anyway?" before leaving an unsaved player (ROLLED BACK in `d755476`, not live; min: "i think the 'switch anyway?' thing messed it up", skipped for good)
- min: "it doesnt remember me in the browser? it's giving me a new account every time". Live aura-db: Crunchy Opp
  (08:55 UTC), Unbothered Ghost (09:50), Rare Frog (10:21) and Mid Himbo (10:30) were each made by FARM AURA and never
  used again. Cause, confirmed with min: logging in as kura with a save code switches the cookie, and the unsaved player
  (no save code or passkey) is then unreachable; "log out of this browser" afterwards leaves no player, so the next FARM
  AURA makes a new one (`needPlayer`). No bug in the cookie (same as scoundrel.exe's).
- On min's ask ("can you delete rare frog?"): deleted live player 5 Rare Frog and its 3 open farms (#37-#39); none were
  on the ledger. Crunchy Opp and Unbothered Ghost have finished farms on the ledger, so they stay.
- min: "yeah do "switch anyway?" please". `public/app.js` `leaveOk()`: before "Log in" with a code or "Use passkey",
  if this browser's player has no save code or passkey, confirm("<name> has no save code or passkey. If you switch, you
  won't be able to get back to it. Switch anyway?"). Uses the account already loaded on the you screen. It also asks in
  the one case where nothing is lost (the code's account has no player here yet, so `enter` keeps this one), which is
  harmless. Removed: nothing.
- VERSION 0.16. 15 tests pass. Checked in Chromium with a mocked /api: no code + cancel = no login; no code + OK = login;
  player with a code = no question. Not checked: the live site; whether the other games have the same gap.

## v0.15: Oct 21, 12:30 AM HST: farms stay up 24 hours (not pushed)
- min: "how do we tie this game into the real world time? first of all, i dont think the farms should expire at 00:00
  UTC haha. i think they should be up for 24 hours"
- Chosen by min (decision card, "On the day it happens"): aura still counts by UTC day (the AURA LEADERBOARD and "aura today" stay daily),
  and each thing counts on the day it happens: standing hours split at midnight, a win or loss on the day the farm was
  taken (before: the day it was posted). Side effect: standing rounds down to full hours per day, so a farm standing
  23:30-00:30 earns 0 for each day.
- `public/engine/aura.js`: `LIFE = 24 * 3600`. `src/worker.js`: `farmEnd(d)` = posted_at + LIFE. Expiry
  (`settleStale`) is now `posted_at <= now - LIFE`, at most once a minute per Worker instance (was once per UTC day);
  every read checks the time itself too (board, take, the take UPDATE's `AND posted_at > ?`, `farmView`, `/api/today`
  rows), so a farm is never shown or taken past its 24 hours. Max 3 open counts farms up now, not farms posted today.
  `aurasFrom` clips spans to the day and counts deltas by `taken_at`; `auraStmt`/`aurasStmt` read farms posted that
  day or the day before (`day IN (?, ?)`). `/api/today` lists open farms, farms taken today, and farms expired in the
  last day. `deadline` is the farm's 24-hour end. No schema change and no migration (schema.sql comments only).
  README updated. Removed: the midnight UTC expiry and "3 a day".
- Test: the 3-farm/expiry test now checks a farm is still up and takeable past midnight, gone at 24 hours, and ann's
  aura on each day against hand-worked values (Jan 1: first take + 16h = 160,000; Jan 2: second take + 8h = 80,000).
- VERSION 0.15. 15 tests pass. Not checked: the live site; the design doc still says farms end at midnight UTC.

## v0.14: Oct 21, 12:20 AM HST: "beats X" under each style card (not pushed)
- min (screenshot of Home): "on this screen somewhere, can we have an explanation of what beats what? maybe just the
  emoji > emoji, or RIZZ > MOG or something?" I first built one line under "+10,000 Aura per hour" ("💎 DRIP > 😏 RIZZ >
  🗿 MOG > 💎 DRIP"); min: "hmm how about over each button an explanation?" So the line is gone and each card has a label; then "could you put it below the box, above FLEX?" and "can i see without the RIZZ and MOG words ?"
  (v0.7 removed "beats 😏" from inside each card; this puts it back, under the card.)
- `public/app.js` `styles()`: a row of "beats <emoji>" labels, read off `A.BEATS`, in the same 3-column grid
  under the cards, above FARM AURA / FLEX. `styles()` is used on Home and the FLEX screen, so both have it. `public/index.html`: `.cards.beats`
  centred, -4px margin-top. Removed: the one-line `beatsLine()` (never pushed).
- VERSION 0.14. 15 tests pass. Checked in Chromium with a mocked /api: labels sit under the right cards on Home and FLEX.
  Not checked: the live site.

## v0.13: Oct 21, 12:15 AM HST: a farm's address is ?farm=N; back buttons work (not pushed)
- min (screenshot of Home's finished rows): "when i click on these cards, what screen does that open? can that open the
  registry or ledger entry instead?" Answer: they already open the farm, which is its ledger entry page (v0.10), the same
  page the Ledger tab opens, with "On The Registry ›" at the bottom. Nothing changed there.
- min: "how come i can't see the ?farm=N links when i click it?" then "yeah, and then if i press back, it will work
  properly?" Tapping only fetched the farm; `?farm=N` was read once on load and never written.
- `public/app.js`: `openFarm(id, step = true)` pushes `?farm=N` (state `{ farm }`) after a tap; a load from a link or
  a browser back/forward opens in place (`step` false). `syncAddress()` in `draw()` replaces the address to match the
  screen (a farm: `?farm=N`; a tab or the you screen: bare). In-game "back" calls `history.back()` when we pushed the
  step, otherwise shows the tab. A `popstate` listener opens `?farm=N` or shows the tab. Removed: nothing.
- VERSION 0.13. 15 tests pass. Checked in Chromium with a mocked /api: tap row, browser back, forward, game back,
  row then Ledger tab, a ?farm=7 link and game back from it all land on the right screen and address. Not checked: the
  live site.

## v0.12: Oct 21, 12:05 AM HST: your Farming rows show their style; space above the ledger entry (pushed)
- min: "could you put an emoji of what it's actually farming, next to "Farming" text ?" and "could you put a couple blank
  lines above "Ledger entry" line please ? and push"
- `src/worker.js` `/api/today`: an open or expired farm's row carries `style` (c_style) when you posted it (side 0);
  /api/today only ever answers the cookie's own player, and /api/board is unchanged, so no one else sees it.
- `public/app.js`: an open row reads "Farming 😏"; the emoji at the right is now for finished rows only. `seal` has
  margin-top 3em. Removed: nothing.
- VERSION 0.12. 15 tests pass (one new assert: the poster's /api/today row has the style). Not checked: the live site.

## v0.11: Oct 21, 12:02 AM HST: "+10,000 an hour"; "On The Registry" lands on the farm's entry (pushed)
- min: "could this say +10,000 an hour" (screenshot of the Farming rows); "for the On the Registry link, it doesn't link
  to the actual registry entry?"; "can you push what you have when you can too please !"
- `public/app.js`: an open farm's row says `+${HOUR} an hour`. Removed: the bare "10,000 an hour".
- `public/app.js` `seal`: the link is https://88x31.app/registry?head=<this farm's ledger hash>. The farm's checkpoint
  carries that hash as `head` (`checkpoint` in `src/worker.js` sends the hash of the farm's own entry), so the registry
  finds the entry without a new column. Correction: in v0.10 I said this needed the registry entry id and a migration.
  It doesn't. With dungeon-items (`?head=`) and 88x31 v0.46.13 (forwards `head`); deploy those first. A farm whose
  checkpoint never reached the registry gets "That isn't on the registry yet." Removed: the link to the top of the registry.
- VERSION 0.11. 15 tests pass. Not checked: the live site.

## v0.10 — "Every Farm Has a Page"
**Tue Oct 20, 2026 · 11:55 PM HST** (pushed with dungeon-items)

### Decisions (the owner's)
- min: "could we have it say (username)'s AURA FARM" (Home's heading). Uses the player's name as it is (lowercase stays
  lowercase); no name yet shows "AURA FARM".
- The Today tab's title: min asked for "AURA MASTERS or what is something funny"; I offered MAIN CHARACTERS,
  AURA-ISTOCRACY, AURA KINGS, NO NPCs ALLOWED; min: "AURA LEADERBOARD for now. boring! haha".
- min: "the bottom menu Home The Farm, can we make the text bigger please".
- min: "can we somehow connect whatever page i click on here, with the ledger entries (do they have a page? theres
  nothing to click on in Ledger page), with the registry entries?" then, with the finished-farm screen: "this page should
  be the ledger entry page?" So the farm screen is the entry's page.
- Not built (my opinion, said to min): a link from a farm to its exact registry entry. The game doesn't learn the
  registry's entry id (`checkpoint` answers `{ ok, created }`), so it would need dungeon-items to return it, aura-farm
  to store it (a migration) and 88x31's pass-through to forward a new parameter. The farm links to The Registry's top.

### What was built
- **`public/app.js`**: Home's heading `${name}'s AURA FARM`; Today's title AURA LEADERBOARD (was "Most aura today");
  Ledger tab entries are buttons (`look:<farm>`) that open the farm; the finished farm shows `seal(v)`: "📜 Ledger entry
  #N", the full fingerprint and "On The Registry ›" (https://88x31.app/registry); `?farm=N` on the address opens that
  farm after loading; someone who wasn't in the farm (`side` -1) sees it from the winner's side (draw: the taker's)
  with both names. Removed: "Most aura today", the non-tappable ledger rows, "you" on other people's farms.
- **`src/worker.js`** `farmView`: also returns `ledger: { entry, hash }` for a finished farm (two more subselects in
  the same query).
- **`public/index.html`**: `.tab` 15 px (was 12 px), `white-space: nowrap`; fits at 360 and 390 px.
- `VERSION` 0.10, CHANGELOG updated. No migration.

### Tests
- 15 pass (the take test checks `ledger` against the row's id and hash from raw SQL).
- Browser check (headless Chromium, mocked API): Ledger tab, tapping an entry, the spectator view with the seal, and
  `?farm=16`; the tab bar at 360 and 390 px. No page errors. Not checked: the live site.

---

## v0.9 — "FLEX"
**Tue Oct 20, 2026 · 11:45 PM HST** (pushed with dungeon-items, which must deploy first)

### Decisions (the owner's)
- min started a thread "for some animations"; I suggested animating the reveal after taking a farm, and mocked up three
  (Flip, Slam, Glow up) at https://claude.ai/artifact/WM4HGFmPJ1cDaf184WeKAn. min: "the other players card is face down
  and it flips and reveals? i like the animation in #1." Then: "can we animate the emojis interacting ... if DRIP wins,
  the diamond rains on the other emoji?"
- Matchup bits, tuned by min over several rounds: RIZZ win = 😏 grows and sways, "not wink, and not send the heart"; MOG
  sits there, then shakes and crumbles. MOG win = 🗿 leans in "just a little bit", gets big and holds still; DRIP
  crumbles. MUTUAL MOG = first "they should just stare at each other and .... thats it", then "no need the . . . .", then
  "one side stay the same and sparkle, then other side sparkle, then MUTUAL MOG", then "only one or two sparkles".
  Everything "20% slower".
- Lines: min asked for "text lines that describe the win, like MOG couldn't handle the RIZZ.", then "a few different
  lines for each one", edited mine (e.g. "MOG blushed. gg, out-RIZZed.", "Two DRIPS. One Love.", "A DRIPPY / MOGGY /
  RIZZY standoff."), asked for more, and edited five of those. Eight per matchup.
- Timing of the text, min's: the line first, a beat, AURA FARMED., a beat, +100,000 aura; a beat between a line's two
  sentences and two after the line; "stamp down but only bounce back a tiny bit"; the amount bigger, on the same line
  but vertically centred against AURA FARMED.
- Other asks: "instead of STARE DOWN can we have it say FLEX?"; on the finished screen "take out the emoji history line",
  "put the AURA FARMED +100,000 in the middle of screen", "an empty line under the emoji in the card".
- min: "could you make the ledger remember those words and history too? the shared registry?" I read it as: seal each
  farm's line in its ledger entry and send it with the registry checkpoint.

### What was built
- **`public/engine/aura.js`**: `LINES` (DR, RM, MD, tie; tie lines use {S} for the style and {Y} for DRIPPY/RIZZY/MOGGY)
  and `line([a, b], farmId)`, which picks by `farmId % 8`. Every line fits the registry's word rule (checked by a test).
- **`src/worker.js`**: `take` seals `line` in the ledger record; `farmView` returns the sealed `line` (farms before v0.9
  have none); `checkpoint` sends `line` in the detail when the record has one. The card-duel branch of `farmView` reuses
  the record it already parsed. No migration: the record is JSON.
- **`public/reveal.js`** (new): plays once, right after FLEX, with the Web Animations API. Their card starts face down
  (`.card.back` in a `.slot`), wobbles and flips; copies of both emoji in a fixed `.fx` layer play the matchup bit;
  then the loser drains (and gets `.lost`), the winner's card glows, and the line's sentences, "AURA FARMED." and the
  amount stamp in (scale 1.6 to 0.96 to 1). Times are the mockup's x1.25 (`PACE`). Phones set to reduce motion get the
  finished screen at once. While it plays, a background refresh redraws only the header (`refreshMe`).
  Removed: the CSS-only flip from earlier the same night (21fef85: `--t` delays, keyframes in `index.html`).
- **`public/app.js`**: FLEX on the board row and the take button (was STARE DOWN); the finished screen has no record
  line, puts the cap (line + caption, cut into sentences) between the two cards, and the Ledger tab shows each farm's line.
  Removed: `recordLine` on the finished screen, the `.face .small` CSS.
- **`public/index.html`**: `.card .e` gets 20 px under the emoji; `.cap .why`, `.cap .bit` (inline-block, middle),
  `.cap .amt` 30 px; `.slot`, `.card.back`, `.fx`, `.shard`.
- `VERSION` 0.9, CHANGELOG and README updated.

### Tests
- 15 pass (new: `line` for each matchup and a draw, hand-written strings, and every line matches the registry's word
  rule; the take test checks the sealed `line` and the view's `line`; the checkpoint test checks `line` in the detail).
- Browser check (headless Chromium, 390 px, mocked API): FLEX then the reveal for DRIP>RIZZ, MOG>DRIP, RIZZ>MOG and a
  draw, screenshots at 1.2 to 10.5 s, no page errors. Not checked: a real phone, the Impact font (the fallback font
  wraps "+100,000 aura"), the live site.

---

## v0.8 — "Home and The Farm"
**Tue Oct 20, 2026 · 10:50 PM HST** (built and committed locally, not pushed)

### Decisions (the owner's)
- min: "i think 'board' should be 'The Farm', and the current 'Farm' should be .. Home?" Done as asked, with 🏠 Home and 🌾 The Farm as the tab icons (my pick).

### What was built
- **Page.** The tab bar is 🏠 Home, 🌾 The Farm, 🏆 Today, 📜 Ledger, and the open-farms screen's title is "The Farm". The Home screen keeps its "AURA FARM" title. Removed: the tab names "Farm" and "Board" and the title "The board". README says "The Farm tab".
- **FARM AURA stays on Home.** min: "if i click MOG then FARM AURA, it takes me to a different screen. can it not take
  me to a different screen please". The button posts the farm and refreshes the list ("Farming · 10,000 an hour");
  tapping the row still opens the farm. Removed: the jump to the farm screen after posting (`view = ...` in the
  `farm` action).
- **Finished-farm screen.** min: "on this screen could you please center it and make it look nicer please". I made two
  columns; min saw it and asked: "could you have it vertically stacked like before? and maybe black and white the one
  that lost?" So it is a centered stack (`.duel`, `.face` in `index.html`): the other player's avatar, name, record and
  style card, then yours, with "Farm #N" above and the caption below. The loser's block is grayscale and dimmed
  (`.face.lost`); a draw greys nobody. Removed: the left-aligned rows, the right-aligned "Farm #N", the `shown` wrapper
  for this screen, and the short-lived two-column layout.
- `VERSION` 0.8, CHANGELOG updated.

### Tests
- 14 pass. Browser check (390 px): the tab bar fits, The Farm shows its title, picking MOG and tapping FARM AURA stays on Home with the farm in the list, no page errors. Not checked: the live site.

---

## v0.7 — "Fewer Labels"
**Tue Oct 20, 2026 · 10:35 PM HST** (built and committed locally, not pushed; migration 005 not run on live aura-db)

### Decisions (the owner's)
- min, after trying v0.6: "hehe this is kinda weirdly fun. can we get rid of VIBES mechanic for now. can we get rid of
  'beats X' on all the cards? and add a place that explains 'MOG beats DRIP'". I read "for now" as: delete it (the
  working rules say delete, don't park); it can come back as a new thing later.

### What was built
- **Page.** I first added a "Who beats who" panel (min asked for a place that explains it), then min saw the board row
  with 😏🗿🗿 and asked: "no, less labels in general. Get rid of 'Who beats who' and 'the same style is a draw'. maybe
  delete all the explainer text under AURA FARM, or make it very very short and simple?" So the panel is gone. The Farm
  tab has one line, min's wording ("+10,000 Aura per hour while your Farm is up", the number from `A.STAND_PER_HOUR`); the Board, Today and Ledger tabs, the take screen and
  your own farm show only their title. Farm list lines say "N an hour" instead of a sentence.
  Removed: "beats X" on every style, the "Who beats who" panel (`rules()`), the unused `STAKE` constant in `app.js`, `A.label` in `aura.js` (only the panel used
  it), the peek button and text, the 👀 VIBES counter in the header, the `.card .s` CSS, and every explainer paragraph.
  The rules are still in the README. Easy to put back if players are lost.
- **Passkey login (You screen).** min: put "Log in with a passkey" on the right instead of text below the save code
  place, then (after I put a "Passkey" chip beside "Log in"): "put the passkey button where it belongs", meaning the
  row with New save code and Add a passkey. Then: "is there a way to make it fit on one line?" The row is "🔑 New code", "👆 Add passkey",
  "👆 Use passkey", with 12 px text and a 6 px gap (`.keys` in `index.html`) so it fits at 390 px.
  Removed: the "or log in with a passkey" link, the chip beside "Log in", and the longer labels ("New save code", "Add a passkey").
- **Server (`src/worker.js`).** Removed: `POST /api/vibes`, `vibesStmt`, `vibesFrom`, the loser's +1 VIBES insert in
  `take`, and `vibes` / `peek` in `/api/today` and `farmView` (which now batches two statements instead of four).
  `aura.js` loses `VIBES_START` and `VIBES_MAX`.
- **Database (`migrations/005_no_vibes.sql`, `schema.sql`).** `DROP TABLE peeks; DROP TABLE vibes;`. The Worker no longer
  reads either table, so v0.7 runs whether or not 005 has been run; 005 is cleanup and loses the day's VIBES balances.
- `VERSION` 0.7, CHANGELOG and README updated.

### Tests
- 14 pass. The whole-farm test now checks there is no peek and `/api/vibes` is a 404; the VIBES assertions are gone.
  The migration test applies 004 then 005 to the v0.5 schema and compares with `schema.sql`.
- Browser check (headless Chromium, 390 px): the Farm tab shows the one line, the You screen shows the passkey chip in the
  save code row, no page errors. Not re-run after the trim: a full farm and take.
- Not checked: the live site.

---

## v0.6 — "AURA FARM"
**Tue Oct 20, 2026 · 10:20 PM HST** (built and committed locally, not pushed; migration 004 not run on live aura-db)

### Decisions (the owner's)
- min: "the card-based gameplay isnt working out for me maybe. what are some other ideas, keeping the async and ledger
  aspects?" I offered four (Hold the Spot, Blind Flex, Stare-down, Fit Check). min chose #1, said "i really liked
  MOG / FIT / RIZZ but the cards just didnt seem right", picked a secret style, then (after I built Hold the Spot
  locally and raised its leak: a fixed pose is given away by any result) "this isn't entirely working for me either".
  Asked what the best moment is, min: "maybe flexing. choosing which out of DRIP/RIZZ/MOG to play against the other
  player." I proposed Flex Off (one sealed style each, public record of revealed styles): "ooh this one sounds
  interesting!!". Name: "maybe it's FARM !! because while it's up, the person is gaining currency"; "yeah let's build
  it as FARM". Wording from min: "AURA FARM" as the action, "Your time is up", "Someone mogged your aura" (then "i dont
  like 'mogged your aura'"); chose COOKED from my list ("i like COOKED !").
- The Hold the Spot build (one spot, reigns, tries, sealed misses) was committed locally as f7760d6 and dropped before
  any push: `git reset --hard a35b001`, then rebuilt on v0.5. Nothing of it was ever live.
- My picks, built as stated and easy to change: win +100,000 / lose -100,000 / draw 0 (first built at 10,000); standing 10,000 an hour (first 1,000) while a
  farm is untaken, 3 open a day, expiring at midnight UTC ("Your time is up": my reading of min's phrase); VIBES = the
  taker spends 1 to see one style the poster did NOT pick (random of the two, stored, so asking again shows the same
  one; I proposed "peek at their most-played style" but the public record already shows that), +1 per farm lost, max 3;
  the record is a player's latest 10 revealed styles, both roles, newest first; captions AURA FARMED / COOKED /
  MUTUAL MOG.

### What was built
- **Rules (`public/engine/aura.js`).** `RULES = 4`. `farm(a, b)` returns `{winner, how, deltas}`; `caption`;
  `record(rows)`; `STYLES`, `isStyle`, `label`, `RECORD = 10`. `standing` unchanged. Removed: `DECK`, `deal`, the
  sfc32 `rng`, `lineupCards`, `faceOff`, `totals`, `duel`, `ROUNDS`, `BONUS`, the CAP and its emoji, `isCap`, `style`
  (the card helper), and the NO CAP / TOTAL MOG captions.
- **Ledger (`src/ledger.js`).** `commitment(style, salt)` = sha256("D|salt"). `chainInsert` takes `farmId` and writes
  kind "farm" into `farm_id`. Record: `{kind: "farm", rules, day, farm, players, commits, styles, salts, result, winner,
  deltas, caption, t}`. Removed: the lineup commitment (`cards.join(",")`).
- **Server (`src/worker.js`).** Routes: `POST /api/farm {style}` (post, sealed, 3 open a day in one guarded INSERT),
  `GET /api/farm?id=`, `GET /api/board` (each poster's `record`), `POST /api/take {id, style}` (one batch: farm done,
  ledger entry, loser's VIBES; retries on a ledger-head clash; then the checkpoint), `POST /api/vibes {id}`.
  `recordsStmt` reads any number of players' latest styles in one query (`json_each`). `farmView` shows the poster
  their own sealed style, others never; a taker sees VIBES and their peek; a done farm shows both styles, captions
  and both records; a card duel finished before v0.6 shows its cards and captions from its ledger record.
  Checkpoint detail: `{day, farm, result, styles, winner: "poster" | "taker" | null, aura}`.
  `/api/today` lists your farms, and your expired ones for a day. Removed: `draft`, `post`, `duel`, `duelView`,
  `cardsOf`, `lockIn`, `duelSeed`, `hmacHex`, the `DAILY_SECRET` check (the secret can stay set on Cloudflare
  harmlessly, or be deleted), and the lineup/hands/peeks-by-round logic.
- **Database (`migrations/004_aura_farm.sql`, `schema.sql`).** `duels` becomes `farms`: open and draft duels are
  expired, `c_slots` and `t_slots` dropped, `c_style` and `t_style` added, indexes renamed `farms_*`. `ledger.duel_id`
  becomes `farm_id`. `peeks` is rebuilt as `(farm_id, player_id, not_style)`. Every old ledger row and finished duel
  stays as sealed. Removed: draft status, the card columns, the old `peeks`.
- **Page.** Tabs: Farm, Board, Today, Ledger. The Farm tab has the three style buttons, "🌾 AURA FARM" and your farms
  ("Farming", "vs name" with the caption, "Your time is up"). The board shows each poster's record as emoji. A taker
  sees the poster's record, a peek button, the three styles and "😤 STARE DOWN". The result shows both styles and
  the caption, with each side's record. Removed: the 5-card pick screen, card faces and backs, the round-by-round
  result, and their CSS.
- `VERSION` 0.6; CHANGELOG, README and the `wrangler.jsonc` secret comment updated.

### Tests
- 14 pass (5 engine, 9 worker). Hand-worked: all six wins, draws, captions, the record, standing; a whole farm (post,
  peek is DRIP or MOG for a RIZZ farm and free the second time, take, VIBES 2 and 0, both commitments and the hash
  recomputed with node:crypto, records on the board, leaderboard 100,000 and -80,000); a draw earns no VIBES; the 3-farm
  limit and midnight expiry ("Your time is up" for two farms); a checkpoint per farm with exact details; migration
  004 run on the v0.5 schema (from git) keeps a sealed duel and its ledger row, expires an open one, and ends with the
  same tables and column order as `schema.sql`. Removed: the card, deal, lineup, CAP and old-rules tests.
- Browser check (headless Chromium, 390 px, local Node server + node:sqlite): post RIZZ, two hours later a second
  player peeks ("It's not DRIP"), takes with DRIP and wins; the first player sees COOKED and -80,000; a third sees the
  first player's record (😏) on the board; the ledger tab drew; 1 checkpoint; no page errors.
- Not checked: the live site, the real Accounts and Registry, real phones, and how the registry page shows the new
  checkpoint details.

### Before it can go live (needs the owner)
- Run migration 004 on live aura-db, then push. The migration cancels any open challenges (nothing paid) and renames
  tables; old duel history stays.

---

## v0.5 — "Cards vs Cards"
**Tue Oct 20, 2026 · 8:50 PM HST** (migration 003, run on live aura-db before the push)

### Decisions (the owner's)
- "i think that the player actions are too much maybe. can it just be, the player picks 3 out of 5 cards, and the
  cards order. and then that cards order can battle another player card's order? the card vs. the card ?"
- Asked how the bluff survives; ryan: "hmm, no let's just have bluffing be the order they pick. can you build that
  version please!" Then: "you can push too!"
- My picks, built as stated and easy to change: win +10,000 / lose -10,000; TOTAL MOG (3-0) +100,000; NO CAP (the
  winner's 3 include the CAP) +500,000; VIBES = the taker spends 1 to see the poster's card for one round before
  taking, earned 1/day and +1 per duel lost (max 3); 1 CAP, so 19 cards.

### What was built
- **Rules (`public/engine/aura.js`).** `RULES = 3`. `DECK` is D1-D6, R1-R6, M1-M6, X1. New `duel(a, b)` returns
  `{winner, how: "win"|"tie", won, deltas, bonuses}`; `STAKE = 10000`; `BONUS = {totalMog, noCap}`. Captions: NO CAP,
  TOTAL MOG, AURA FARMED, MOGGED, MUTUAL MOG. `faceOff` no longer has a two-CAPs case. Removed: `MOVES`, `START_POT`,
  `play()`, `done()`, `crashedOut`, `dippedWinner`, and the DIP captions.
- **Ledger (`src/ledger.js`).** `commitment(cards, salt)` = sha256("cards|salt") for both sides. Removed: the `plan`
  argument (older records' poster commitments covered "cards|plan|salt"; noted in the file header).
- **Server (`src/worker.js`).**
  - `take` decides the duel in one batch: UPDATE to done (guarded `status = 'open'`), the ledger insert and the
    loser's +1 VIBES, both guarded on `id, status 'done', t_id, ended_at`. It retries on a UNIQUE clash (ledger head),
    then sends the registry checkpoint. Record: rules 3, players, seed, commits, lineups, salts (always revealed),
    result, winner, won, deltas, bonuses, caption, t. Checkpoint detail: `{day, duel, result, score, winner, aura,
    bonuses}`.
  - `/api/vibes {id, slot}` works on an open challenge for anyone but the poster (makes a player if needed). It
    charges only for a round not already peeked at (`NOT EXISTS` in the UPDATE, then the peek INSERT `WHERE changes() = 1`).
  - `duelView`: an open challenge shows a non-poster their VIBES and peeks; a done duel shows `lineups`, `result` and
    `captions`. Older-rules records show `lineups ?? flipped` padded with nulls, and their own captions.
  - `settleStale` only expires drafts and open challenges.
  - Removed: `/api/move`, `playRound`, `finish`, live-duel handling, the `'live'` status, and `t_reads`.
- **Database (`migrations/003_cards_vs_cards.sql`).** Expires draft/open/live duels (they were dealt from the 20-card
  deck) and sets `taken_at` so standing stops. Drops `c_plan`, `moves`, `n`, `t_reads`. Adds `peeks (duel_id,
  player_id, slot)`. Checked locally: v0.4 schema + 003 gives the same `duels`, `peeks` and `vibes` columns as the new
  `schema.sql`.
- **Page.** The pick screen for a taker has a row of their 3 as ? cards to peek at. The result screen shows their 3
  above yours with YOU / THEM / DRAW per face-off, "rounds N-N" and the caption. The ledger tab shows lineups as emoji
  and the score. Removed: the planner, move buttons, the pot, `MOVE_WORD`, and the `.pot`, `.moves`, `.mv` and
  `.card.ghost` CSS.

### Findings (200,000 random deals, random lineups)
- 23.2% of duels are a MUTUAL MOG; 10.0% are TOTAL MOG; 4.0% are NO CAP.
- 26.2% of hands hold the CAP; the CAP is played in 31.7% of duels.

### Tests
- 16 pass (8 engine, 8 worker). Engine tests rewritten with hand-worked lineups. The whole-duel worker test works out
  the result with its own beats table, and checks peeks, the VIBES for losing, and both commitments with node:crypto.
- Browser check (Playwright, local Node server + node:sqlite): post, peek, take, result screen, ledger tab, save code
  on a second browser. No page errors.

---

## v0.4 — "Three Styles" (pushed with v0.5)
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
- Midnight UTC cuts late duels short (a missing pick counts as a DIP). (Update Oct 21: no longer true. Card duels were
  replaced by farms in v0.6, and since v0.15 a farm stays up 24 hours from when it is posted.)
- Impact isn't on some phones, so the fallback is Arial Black.
- Extras, not done: add aura-farm to dungeon-items `ACCOUNTS.md` "Games using it" (Oct 21: `ACCOUNTS.md` has no mention
  of aura, so still open), and give it a friendly name on the registry page (Oct 21: done, `sayGame` in dungeon-items
  `src/public-ledger.js` line 132 has "aura-farm": "Aura Farm").

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
