# scoundrel.exe — Dev Changelog — v0.1–v0.8

Detailed changelog for scoundrel.exe (public repo: okayline/scoundrel.exe): a daily seeded Scoundrel
(Zach Gage & Kurt Bieg) where everyone plays the same deck each UTC day. The public repo keeps a
shorter changelog. Newest first. Times are Hawaii time (HST).

---

## v0.8.8 — "Steady Screen"
**Thu Oct 15, 2026 · 10:25 AM HST** (no migration)

Decisions: after v0.8.7 the user said clicks still felt awkward, the cursor sometimes turned from a hand to an arrow over a card, hovers sometimes didn't register, and the squeeze animation stalled. Claude traced it to `draw()` rebuilding the whole `<pre>` via `innerHTML` every second (the countdown) and on every hover change (the little v), which replaces every element under the pointer. The old pointerdown/pointerup `draw()` calls (and the `.pressed` class, removed in v0.8.7) were a workaround for that same cause. The user approved fixing the redraw itself; the reprint-everything design is kept. The 900 ms NEXT ROOM pause is deliberate and was left alone.

- `html()` now returns one html string per line. `draw()` wraps each line in `<span class="ln">` and, when the mode and line count are unchanged, rewrites only the lines whose html differs from `shown` (the countdown line, the v row). Everything else stays the same DOM element. Mode change or a different line count still does a full rewrite. The name-box value/focus restore is unchanged.
- Squeeze: `pulseK` and its `draw()` hook are gone. `squeeze(k)` adds `.pulse` straight to the `[data-k]` elements on a registered click or key (1–4, not busy) and removes it after 260 ms, so it plays at once instead of after the server answers, and a redraw can't cut it short.
- The preview line under each card (`hint` row) now carries the slot key and the class `dim clk`; `html()` treats `clk` like `card` (pointer cursor, no button highlight, stays dim).
- `index.html` app.js cache tag 0.8.6 → 0.8.8 (it had been stale since v0.8.6). Footer v0.8.8.
- Checked in headless Chromium with the server mocked and a free-play run: old v0.8.6 removed 708 DOM nodes in 3 s idle and replaced the hovered card; v0.8.8 removed 9 and kept the card. 0 non-pointer samples over a card plus its preview line. Click took the card, squeeze class applied. Tests 39/39.

## v0.8.7 — "Click Through"
**Thu Oct 15, 2026 · 10:20 AM HST** (no migration)

Decisions: user reported clicking a card sometimes does nothing and needing 2–3 clicks. Claude found two causes from reading the code (not browser-reproduced): (1) the card shrank on press, (2) clicks made while a move was in flight were silently ignored. User asked for both fixes.

- Cause 1: `pointerdown` called `draw()` and `draw()` added `.pressed` (`display: inline-block; transform: scale(0.85)`) to the held card. Pressing near an edge could leave the cursor outside the shrunken card at `pointerup`, so `closest("[data-k]")` found nothing and `key()` never ran. The 1s redraw and hover redraw swapping the node mid-press made it worse. Fix: removed the `draw()` calls on pointerdown/pointerup, the `.pressed` line in `draw()` and the `.pressed` CSS rule. Press is still tracked with `downK`; the click still needs press and release over the same key.
- Click feedback: on a registered 1–4 click (not busy) `pointerup` sets `pulseK` for 250 ms, same as the keyboard path (the `.pulse` squeeze after the pick).
- Cause 2: `take()` returned at once when `busy` (the server call plus the 900 ms NEXT ROOM pause). Fix: `queued = { slot, turn }` holds one click made while busy; `act()` plays it after `busy = false; draw()` only if still playing, mode is game and `run.view.turn` equals the queued turn (a slot means a different card in the next room). Cleared on a fresh `take()`, on error and on run end. A second click on a card already taken is a no-op (empty slot). Clicks during the NEXT ROOM pause hit no card (cards are hidden), so they are not queued.
- Footer v0.8.7. (The app.js cache tag in index.html was NOT bumped in this version and stayed 0.8.6 until v0.8.8.) Tests 39/39. Not browser-checked.

## v0.8.6 — "Countdown"
**Wed Oct 14, 2026 · 6:47 AM HST** (no migration)

Decisions: user wanted the top right back to the countdown it showed before v0.8.5, labeled NEXT DECK DEALT IN.

- `header()` right side: `NEXT DECK DEALT IN ${countdown()}` on the title, game and end screens (was `nowStamp()`; before v0.8.5 the title showed the date and other screens `NEXT DEAL hh:mm:ss`). `nowStamp()` still exists but `header()` no longer uses it.
- Footer v0.8.6, app.js cache tag 0.8.6. Tests 39/39.

## v0.8.5 — "Battle Log"
**Wed Oct 14, 2026 · 6:44 AM HST** (no migration)

Decisions: user asked for SLAIN under CAN HIT, admins to see every ledger entry, and the header as `SCOUNDREL.EXE // NAME // SCREEN` with `DATE // TIME UTC` on the right (then tightened: two spaces around the left //, one around the right). Discussed free play vs the daily (user worried free play would be played instead): kept as built; Claude argued against a harder learning run and suggested teaching instead (first-time tips in the learning run, a one-line cause of death); not built. User asked for a fight history built from the share marks: marks under ROOMS plus a detailed line at the bottom right. The per-room card line was hard to read, so it became the last action in words, then the last two actions, newest next to LAST, with move numbers. Right panel lines fixed by the user: 7 = SLAIN (blank until a kill), 8 open, HEAL on 9.

- Engine: `roomHistory(seed, actions, rules)` → `[{ turn, mark, steps, done }]`, steps `{ type: skip | fight | heal | potion_wasted | equip, card?, armed? }` (only cards the player saw; skipped cards aren't listed). `shareMarks` now = `roomHistory(...).filter(done).map(mark)` (same output; tests unchanged).
- Worker: `runView` adds `history: G.roomHistory(game.seed, game.log)` (the seed itself is never sent). Ledger: a move is shown in full if it's yours, the day is over, or `player.admin`.
- Free play: `freeView` adds the same `history`.
- UI left: `HISTORY  ↷ ⚔ ⚔ ‼` under the ROOMS bar after a blank line (done rooms only; spaces dropped past 18 rooms).
- UI right, 17 lines: HP / – / HP bar / – / BLADE ... hits up to N / CAN HIT / SLAIN (or blank) / – / HEAL / SKIP / – / IN DECK ×3 / – / `LAST #14 ⚔ slew 7♠` / `     #13 ♥ healed with 4♥`. Words: ⚔ slew X, ‼ fought X bare, ♥ healed with X, wasted X, picked up X, skipped the room. Move number = place in the flattened steps (one step per move).
- Header (title, game, end): `header()` splits the left on 3+ spaces and joins `[SCOUNDREL.EXE, NAME|GUEST, screen]` with `  //  `; right is `nowStamp()` = `WED OCT 14 2026 // 16:32 UTC` (the NEXT DEAL countdown is gone from game/end; the title still has NEXT DEAL IN). If too wide (long names), the left separators squeeze to ` // `. Other screens keep their own headers.
- Footer v0.8.5, app.js cache tag 0.8.5. Tests 39/39; roomHistory smoke-tested. Not browser-checked.

## v0.8.4 — "Free Play"
**Wed Oct 14, 2026 · 6:35 AM HST** (no migration)

Decisions: user asked how hard a non-ranked free mode with random seeds would be (Claude: easy, the engine already runs in the browser). User: local "best free score" is fine, it must never touch anything else, admin restart keeps replaying the daily. Claude recommended unlocking free play after the daily (keeps the daily the main event, keeps the front page short), with one free run for brand-new players to learn the rules; user agreed.

- Engine moved: `engine/scoundrel.js` → `public/engine/scoundrel.js` (served as a static asset); `engine/scoundrel.js` is now `export * from "../public/engine/scoundrel.js"`, so the Worker, ledger, tests and play.mjs import paths are unchanged.
- Free play is client-only: `startFree()` dynamic-imports the engine (`./engine/scoundrel.js?v=<version>`), seeds `G.newGame` with 64 random bits (`crypto.getRandomValues`), and keeps the run in `freeRun` = `{ free: true, state, day, n, status, score, view, marks }` (same shape as the server's `runView`). `act()` uses `freeMove()` (`G.apply` locally) instead of POST /api/move; never writes `T.run`. Nothing is sent to the server.
- Availability: `canFree()` = today's ranked run is done, OR (no finished ranked run in /api/history, no run today or unfinished, and localStorage `scoundrel.learned` unset). Starting a free run before the daily sets `scoundrel.learned`. `freeOpen()` also allows picking a left free run back up. `everPlayed` comes from GET /api/history at startup. (A new browser with no localStorage on an account that has finished runs is covered by history; a guest who clears storage before their first daily could get the learning run again: harmless.)
- UI: title bar gains `[F]REE PLAY` when open. Header `SCOUNDREL.EXE   FREE PLAY` on game and end screens. In a free run ESC → title (`leaveFree()` restores `run = T.unfinished || T.run`); [R]ESTART ignored. Free end screen: `BEST FREE <n>` instead of RANK; bar `[F]REE PLAY AGAIN` (when open) `[ESC] TITLE`; no share, no board, no name prompt. Best score in localStorage `scoundrel.bestFree` (try/catch).
- README: file list and a free play note. Footer v0.8.4, app.js cache tag 0.8.4. Tests 39/39; engine smoke-tested from public/. Not browser-checked.

## v0.8.3 — "Sign Here"
**Wed Oct 14, 2026 · 6:20 AM HST** (no migration)

Decisions: user wanted the click to push in on press and pop out on release (instead of the squeeze after), the cards centered between the panel's two sides, and more flavor lines in the DDDD tone (dark, cyberpunk). Flavor count was 33 (Claude first said 35). User's guest run didn't show on the board: by design the board needs a name, but since v0.8.0 guests had no way to set one ([U]SER is hidden for guests). User chose a "Put your name on the board?" prompt at the end of a run. LEFT 8 HEALTH read like HP; user picked `IN DECK`, then asked for "HEALTH CARDS".

- Press effect: `pointerdown` on a card (data-k 1–4) redraws with `.pressed` (inline-block, scale 0.85, 0.08 s transition) on that card's spans; `draw()` re-adds it while `downK` is held (survives the 1 s clock redraw); `pointerup` clears and redraws, then takes the card if released on the same one. The post-take `pulse` moved to keydown only (keys 1–4).
- Cards centered: `pad = "  "` at the start of the pick row, the 5 card rows, the label row and the hint row (42 wide in the 47-wide left side).
- Flavor: +35 lines across all 11 groups (now 68), written by Claude in the dark/cyberpunk tone (not taken from DDDD's text).
- End of run, guest (no name, not admin): `showEnd()` opens the name screen with `back = "end"`; title `PUT YOUR NAME ON THE BOARD?`, bar `[ENTER] SAVE  [ESC] NO THANKS`; both return to the end screen (save reloads the board). Naming the guest's cookie player makes them a normal player; their run counts from then on.
- Right panel: `IN DECK  15 DEMONS / 4 BLADES / 8 HEALTH CARDS` (numbers right-aligned, singular when 1).
- Footer v0.8.3, app.js cache tag 0.8.3. Tests 39/39. Not browser-checked.

## v0.8.2 — "Click Means Click"
**Wed Oct 14, 2026 · 6:12 AM HST** (no migration)

Decisions: user asked for a [B]OARD button on the ledger, a pause between rooms ("Next room...."), and the blade's KILLS list moved away from under BLADE and renamed (Claude picked SLAIN over "slayed"). Then: HP bar down one line, LEFT counts into the right panel. Claude explained a blade's strength never drops (only its reach), and proposed `hits up to N`; user picked it. For the dungeon bar (counted cards seen out of 44), Claude offered ROOMS or DEMONS; user picked ROOMS. User reported clicks on cards (and SKIP ROOM) sometimes not registering and asked for a visual click confirmation.

- Missed clicks, cause: `$screen.innerHTML` is rebuilt every second (the clock) and on card hover, so mousedown and mouseup could land on different elements and the browser never fired `click`. Fix: `pointerdown` records the `data-k` under the pointer, `pointerup` fires `key(k)` if it's the same key. Applies to every button and card.
- Card squeeze: `take()` sets `pulseK = String(k + 1)` for 250 ms; `draw()` adds `.pulse` to every `[data-k=pulseK]` span (inline-block, scale 1 → 0.85 → 1 over 0.25 s). Keyboard 1–4 too.
- Next room pause: in `act()`, if the reply is still playing and `view.turn` changed, `between = true`, draw (cards blank, `NEXT ROOM...` on the pick row), wait 900 ms, then apply the reply. Still `busy` during the pause.
- ROOMS bar replaces DUNGEON: rooms ≈ `turn + ceil(deckCount / 3)` (skips can add one), 18-wide bar, `room 05 of ~14`.
- Right panel: HP, blank, HP bar; `BLADE  9♦  hits up to 6` (anything / nothing when dull); CAN HIT line kept (now says the same; user may drop it); KILLS line removed, `SLAIN  <last 5>` after SKIP only once the blade has a kill; `LEFT` demons / blades / health, one per line, at the bottom. The LEFT line under the ROOMS bar is gone.
- Ledger bar: `[B]OARD` → `go("board")` + `loadBoard(boardDay || T.day)`.
- Footer v0.8.2, app.js cache tag 0.8.2. Tests 39/39. Not browser-checked.

## v0.8.1 — "Name Tag"
**Wed Oct 14, 2026 · 5:59 AM HST** (no migration)

Decisions: user wanted the player name visible somewhere (top header) and a way to see the board and ledger from the play screen. Claude first added [TAB] BOARD and [L]EDGER to the game bar; user said the ledger should just live inside the board, and ESC needs no "TITLE" label. User asked for both changelogs (public CHANGELOG.md and this one) and the in-game version to be updated on every push.

- UI: `header()` shows `<screen title>   <NAME>` (uppercased, or GUEST) on every screen that uses it. Game bar: `[1-4] TAKE  [B]ARE HANDS  [S]KIP ROOM  [TAB] BOARD  [?]  [ESC]`. Tab key mapped (`KEYS.Tab = "tab"`); in a run, tab → `go("board")` + `loadBoard(run.day)`; board's [L]EDGER and ESC work as before (ESC returns to the run via `back`).
- Footer v0.8.1 (v0.8.0 shipped with the footer still saying v0.7.3 and the cache tag 0.7.3, fixed here), app.js cache tag 0.8.1. Tests 39/39.

## v0.8.0 — "Fewer Doors"
**Wed Oct 14, 2026 · 5:55 AM HST** (no migration)

Decisions: user came back from the break with friction complaints: too many menus, 3 clicks to log in with a passkey (front page → PLAYER → LOG IN → PASSKEY), no way out of a run to the main menu. Asked to remove the WHO'S PLAYING? box; wanted [P]LAY instead of [ENTER] PLAY, PLAYER → [U]SER, [H]ELP → [?], and fewer options overall. Agreed mockup: front page 4 options; LEDGER moves inside BOARD; guest [L]OG IN opens the passkey prompt directly with the save code box as fallback; the PLAYER/USER page is only for managing a logged-in account. User also asked Claude to check the previous bot's recent code: server side of v0.7.x looked fine; leftovers noted (unused `whoRows`/`whoOk`; the workers.dev redirect only covers /api/ since `run_worker_first` is /api/* only).

- UI: `guestBox()` → always false (name box off; `whoRows`/`whoOk` left in, unused). Title bar logged in: `[P]LAY|[P] CONTINUE|[P] YOUR RUN  [B]OARD  [U]SER  [?]`; guest: `[P]LAY  [L]OG IN  [B]OARD  [?]`. Keys on title: p/enter → `jackIn()`, b → board, l (guest only) → `quickLogIn()`, u (named only) → account. `quickLogIn()`: sets `loginBack = "title"`; no WebAuthn → loadcode screen; else `loadWithPasskey()` (now returns true/false), and on failure/cancel → loadcode screen. Loadcode ESC → `loginBack` (title or the load screen). Game bar gained [?] and [ESC] TITLE; ESC in a run (when not in bare-hands mode) → title, run resumes with [P] CONTINUE. Help closes with ? as well as h.
- Tests 39/39. Not browser-checked.

## v0.7.3 — "Brackets Back"
**Wed Oct 14, 2026 · 5:42 AM HST** (no migration)

Decisions: user hadn't asked for the brackets to be dropped from the guest front-page menu in v0.7.2 ("stop doing things i dont ask you to do"); restored. User also reported typing "kura" in the front-page box didn't work: most likely "That name is taken" (the old KURA player still exists); fix is deleting it or logging in from PLAYER. The game is on a break after this push.

- UI: guest bar back to `[ENTER] PLAY  [ESC] PLAY AS GUEST  [B]OARD  [L]EDGER  [H]ELP  [P]LAYER` (the last four still click-only while the name box has the keyboard). Footer v0.7.3, app.js cache tag 0.7.3. Tests 39/39.

## v0.7.2 — "Who's Playing?"
**Wed Oct 14, 2026 · 5:38 AM HST** (no migration)

Decisions: user asked whether the logged-out ENTER page could also be a log-in screen; Claude mocked "name or save code" + TAB passkey, then a click-to-focus box on the front page. User: no clicking, no friction; the separate who's-playing page is unnecessary; the front page's third log line should be "Who's playing?" with the already-open name box. A first version with save-code/passkey log-in in the box was stopped by the user ("no,") and simplified to just the name box, as asked.

- UI: mode `who` removed. `guestBox()` = title screen and no name: the log area shows log lines 1–2 (or the name error in red on line 2) and line 3 `WHO'S PLAYING?   NAME: [input w16]`, focused on every draw. ENTER: name → POST /api/name → `jackIn()` (start, continue or end); empty → `jackIn()` as a guest. ESC → `jackIn()` as a guest. Typing passes through to the box (only Enter/Escape are caught); the bar is `[ENTER] PLAY  [ESC] PLAY AS GUEST  BOARD  LEDGER  HELP  PLAYER` with the last four click-only. `jackIn()` no longer asks for a name. The 1 s clock skips redrawing the title while the box has text. `logRow(i)` helper.
- Tests 39/39 (no server change). Browser-checked: typing right away across a clock tick → game as KURA; ESC → game as a guest. Footer v0.7.2, app.js cache tag 0.7.2.

## v0.7.1 — "New Address"
**Wed Oct 14, 2026 · 5:27 AM HST** (no migration)

Decisions: user asked for a .txt download of the save code, [K]EY → PASS[K]EY, a shorter end-of-run menu (no LEDGER or PLAYER, keep the leaderboard), [S]HARE instead of "[C]OPY SHARE". Website: Claude advised against hosting on itch.io (iframe on itch's domain makes the player cookie third-party and passkeys awkward); own domain + an itch page as a shopfront. User chose a subdomain of 88x31.app because of passkeys (they're bound to the address; if the domain is lost they all stop working, save codes are the fallback; Related Origins only helps while you still own the old domain). User set up https://scoundrel.88x31.app in the dashboard (checked live: page + /api/today). User chose to make fresh KURA/dev players on the new domain instead of carrying save codes over (`DELETE FROM players WHERE name_key IN ('kura','dev')`, then admin on the new dev).

- wrangler.jsonc: `routes: [{ pattern: "scoundrel.88x31.app", custom_domain: true }]`, var `CANONICAL_HOST`. Worker: any `*.workers.dev` request → 301 to `https://CANONICAL_HOST` + path + query.
- UI: newcode screen `[D]OWNLOAD .TXT` → Blob download `scoundrel-save-code[-name].txt` (CRLF; code, the site origin, how to log in P/L/C, keep it private, date). PASS[K]EY on the player and log-in screens. End bar `[S]HARE [B]OARD [ESC] TITLE` (+ [R]ESTART for admins); board `[S]HARE`. After adding a passkey with no save codes: "Make a [S]AVE CODE too, as a backup."
- Tests 39/39 (new: workers.dev → 301 with path and query kept; the real host is served). Download checked in Chromium. Footer v0.7.1, app.js cache tag 0.7.1.

## v0.7.0 — "Who Goes There?" (includes v0.6.2, never pushed on its own)
**Wed Oct 14, 2026 · 5:10 AM HST** (no migration)

Decisions: user got tangled in admin setup: had made KURA admin (all runs uncounted), made "Dev" in a private window and then couldn't take "dev" in a real window (gave `DELETE FROM players WHERE name_key = 'dev'`). User was frustrated ("we should be working on the game right now"); Claude kept admin as-is (no new modes). User now has an admin account and wanted to log out and back in. User: [ENTER] JACK BACK IN + [A]CCOUNT confusing ("you can start a game without having an account?") and naming on the account screen awkward. Agreed mockups: name prompt on the title when a guest presses ENTER, PLAYING AS on the title, ENTER = PLAY / CONTINUE / YOUR RUN, [P]LAYER screen with [L]OG OUT / [L]OG IN (user's pick over [O]UT), passkey key becomes [K]EY. No separate logout button elsewhere. From v0.6.2: admin tag, CAN HIT wording, [D]ELETE (user's pick over [X]/[F]ORGET).

- **v0.6.2** (UI): `frame()` puts " ADMIN · DOESN'T COUNT " (`.admintag`, inverted white) in the top border of every screen when `T.admin`. Blade panel: `CAN HIT anything` (no kills) / `CAN HIT 2 to <rank(ceiling − 1)>` / `CAN HIT nothing (dull)` when ceiling ≤ 2 (strict rule). Account [F]ORGET → [D]ELETE.
- **POST /api/logout**: refuses (400) unless the player has a save code or passkey. Deletes this cookie's `sessions` row; if the cookie was the first device's `players.token_hash`, that's replaced with the hash of a fresh random token. Clears the cookie (Max-Age=0). No player: just clears the cookie.
- UI: mode `who` (title screen with the log rows replaced by `WHO'S PLAYING? NAME:` input + hint; [ENTER] OK saves the name then starts, empty name or [ESC] PLAY AS GUEST starts as a guest). `jackIn()` asks only when `!T.name` and no run exists yet; the rest moved to `startRun()`. Title: PLAYING AS name / "guest"; ENTER label PLAY / CONTINUE / YOUR RUN; [P]LAYER (A still works). Account screen titled PLAYER: bar [N]AME [S]AVE CODE [K]EY [D]ELETE [L]OG OUT|IN [ESC]; `loggedIn()` = player with a name, code or passkey; log out needs L twice and a code/passkey; after log out `/api/today` reloads as a guest. Load screens renamed LOG IN; messages "Logged in as X."
- Tests 38/38 (new: logout refused without a code, logout of the first device and of a second device, other device stays in, log back in with the code). Browser-checked: guest title, who prompt → game, logout refused → code → logout → guest → log in. Footer v0.7.0, app.js cache tag 0.7.0.

## v0.6.1 — "Stay Put"
**Wed Oct 14, 2026 · 4:51 AM HST** (no migration)

Decisions: user: when cards are taken, the rest shouldn't move left and become the new 1 and 2; they should stay in place and keep their number. Claude put the slots in the engine (derived state, so layout survives reloads and devices) instead of the UI only. Also answered a rules question mid-build: room with 2 blades after taking 2 cards and a used skip means you must equip one (5♦ over 4♦); mentioned a possible "discard a blade" house rule, not built.

- engine: state `slots` (4 card codes or null). `deal()` fills empty slots left to right with drawn cards; a take nulls that card's slot; a skip clears all 4 before the new deal. publicView `slots`: per slot an index into `room` or null. Actions still index `room[]`, so stored runs, replays and the ledger are unchanged.
- UI: game screen draws slots 0–3 (empty slot = 9 blank columns, no label, no hover v); keys/clicks 1–4 are slots, mapped to the room index in `take()`; bar always "[1-4] TAKE".
- Tests 37/37 (new engine test: take 3S then 5S leaves 2S _ 4S _, third take refills to 6S 7S 4S 8S; new game and skip give [0,1,2,3]). Browser-checked. Footer v0.6.1, app.js cache tag 0.6.1.

## v0.6.0 — "Off the Record"
**Wed Oct 14, 2026 · 4:44 AM HST** (no migration; ledger wipe `DELETE FROM ledger` to run after deploy)

Decisions: user didn't like tester switches being sealed on the ledger; Claude proposed practice/dev modes, user found it all too complicated ("we've already made way too many modes... it's been ok in every other game so far"). Claude owned the overcomplication (it came from trying to keep admin play "fair" on the ledger). Final: admin mode only, admin runs don't count (never on the ledger or leaderboard), tester removed entirely, ledger reset. Practice and dev modes were never built.

- Worker: tester removed (no /api/tester, no tester in queries or responses). POST /api/restart is admin-only and just deletes today's run and calls start() (no void entry). In /api/move, admins get no ledger entries (batch is only the UPDATE). Leaderboard top, counts and rank exclude `p.admin = 1`; `you.admin`. Run-id-never-reused insert kept (an admin's deleted run may have been sealed before they were admin).
- src/ledger.js: voidRecord/testerRecord and their kinds removed; note that admin runs are never sealed.
- UI: no [T]EST; `[R]ESTART` for admins on game and end bars, single press; title "KURA (ADMIN)", end "RANK ADMIN RUN (doesn't count)"; account flags show ADMIN only. Ledger text for void/tester removed (wiped anyway).
- players.tester stays in the database unused (002 already ran).
- Tests 36/36: tester tests replaced by one admin test (403 for non-admins, 3 restarts with the same deck, no ledger rows for the admin, chain verifies, admin off the board and the count). Browser-checked admin restart from the end screen and mid-run.

## v0.5.0 — "Take It With You"
**Wed Oct 14, 2026 · 4:33 AM HST** (migrations 003_admin.sql and 004_saves.sql: need running, then `UPDATE players SET admin = 1 WHERE name_key = 'kura'`)

Decisions: user wanted an in-game tester switch instead of wrangler commands ("can you give me an in game switch please"). Claude: only admins see it (else anyone gets unlimited plays), admin set once by command, each switch sealed on the ledger. User asked how the server knows who's kura ("cant anyone put 'kura' in?"): identity is the cookie token, names are unique labels; the one-time command finds the row by name. Catch: admin lives in one browser's cookie, so the user asked for save codes and passkeys (ported from 88x31).

- **Admin** (migration 003): `players.admin`. POST /api/tester {on} (403 unless admin): batch `UPDATE players SET tester = ? WHERE id = ? AND tester = ?` + ledger `tester` entry `{kind, day, player, on, t}` guarded `EXISTS(player has the new value)`; no-op if already that value. /api/today and /api/start return `admin`. Title bar: `[T]EST ON/OFF` (inverted when on); "[H]OW TO PLAY" → "[H]ELP" for room. Ledger text "switched tester ON/OFF".
- **Saves** (migration 004): `sessions (token_hash PK, player_id, created_at, seen_at)` = extra devices (the first device keeps players.token_hash); `save_codes (id, player_id, code_hash UNIQUE, created_at, last_used_at)`, max 5; `passkeys (id, player_id, cred_id UNIQUE, public_key JWK, alg, sign_count, label, created_at, last_used_at)`; `passkey_challenges (challenge PK, player_id, kind, expires_at)`; `rate_limits (key, window_start, count)`. findPlayer checks players.token_hash then sessions.
- src/saves.js (from 88x31 lib/auth.js): codes 20 chars from 23456789ABCDEFGHJKMNPQRSTUVWXYZ (rejection sampling), grouped by 4, hash = SHA-256("code:" + normalized); `newSession` (new cookie token row); `rateLimit` fixed window per hashed IP.
- src/passkeys.js: 88x31 lib/passkeys.js with user_id → player_id, rp name "scoundrel.exe", user handle "scoundrel:<id>", label name or "player <id>". rpId/origin from the request URL.
- Routes: GET /api/account (codes/passkeys metadata, devices = 1 + sessions); POST /api/codes {new|remove}; POST /api/load {code} (10 / 15 min, sets a new session cookie); POST /api/passkey {register_options, register (≤ 10), login_options, login (20 / 15 min, new session cookie), remove}. Library errors become 400s.
- UI: [A]CCOUNT replaces [N]AME on title and end. Screens account (stats, numbered codes then passkeys, [N]AME [S]AVE CODE [P]ASSKEY [L]OAD [F]ORGET+number [ESC]), newcode (shown once, [C]OPY), load ([C]ODE / [K]EY, key off if no WebAuthn), loadcode (in-game input, maxlength 29). After loading, /api/today reloads and the title says "Loaded X on this browser." Input text survives redraws only on the same screen (`drawnMode`). WebAuthn glue copied from 88x31 public/app.js (fromB64/toB64/deviceName/pkOops).
- Tests 37/37 (new: code load on a 2nd device continues the same run, flags follow, 5-code cap, removed code fails, codes never in /api/account; guessing hits 429 on the 11th try; a software ES256 authenticator in the test (hand-built CBOR + DER signature): register, load on another browser, replayed answer refused, forged signature refused; admin switch seals on/off). Browser-checked: save code across two Chromium contexts, and passkey add + load with Chrome's CDP virtual authenticator (credential copied to a second context).

## v0.4.0 — "Again!"
**Wed Oct 14, 2026 · 4:25 AM HST** (migration migrations/002_tester.sql: needs running, then `UPDATE players SET tester = 1 WHERE name_key = 'kura'`)

Decisions: user asked for "a flag to be able to play unlimited times". Claude made it a per-player tester flag rather than a global switch: unlimited restarts on today's deck, testers left off the leaderboard (they'd know the deck), restarts sealed on the ledger. R must be pressed twice. Heads-up given: flagging kura also drops run #1 (-117) off the board.

- Migration 002: `players.tester INTEGER NOT NULL DEFAULT 0` (also in schema.sql).
- Worker: findPlayer/needPlayer select `tester`; /api/today and /api/start return `tester`. **POST /api/restart** (403 unless tester): batch `DELETE runs WHERE id = ? AND moves = ?` + ledger `void` entry guarded `NOT EXISTS (run)`, prev_hash retry ≤ 8, then `start()`. Leaderboard top, counts and your rank exclude `p.tester = 1`; `you.tester` flag.
- Run ids are never reused: /api/start inserts `id = MAX(MAX(runs.id), MAX(ledger.run_id)) + 1` (SQLite would otherwise reuse a deleted max rowid and collide with the old run's sealed (run_id, n)).
- Ledger: kind `void` `{kind, day, player, run, moves, status, t}`, always open; shown as "TESTER RESTART · threw away a run (N moves)".
- UI: `[R]ESTART` on game and end bars for testers (armed = inverted; any other key disarms), title "PLAYING AS KURA (TESTER)", end "RANK TESTER RUN (not ranked)". `showEnd` skips if the run is playing again (restart during the 1.4 s death pause).
- Tests 33/33 (new: 403 for non-testers, same deck after restart, mid-run restart, 2 voids, chain verifies, 3 distinct run ids, testers off the board and the count). Browser-checked locally. Footer v0.4.0, app.js cache tag 0.4.0.

## v0.3.0 — "Paper Trail"
**Wed Oct 14, 2026 · 4:20 AM HST** (migration migrations/001_ledger.sql: needs running right after the push)

Decisions: after v0.2 deployed, DAILY_SECRET first read as "not set": user had set it (likely empty via PowerShell paste); fixed by piping the value (`"..." | npx wrangler secret put DAILY_SECRET --name scoundrel-exe`). User played run #1 (-117, A♠ room 8). UI: user wanted the DDDD aesthetic, 80-col ASCII; mockups approved ("LOVE how it looks with the DDDD bones"). No emoji; keep ⚔ and ♥ as text glyphs. Fight mark: user chose ‼ ("!!" for now). No glow or visual effects. Color: none except the suit in the middle of cards; ♥ red, ♦ blue (user liked diamonds blue), ♠ ♣ plain. ICHOR renamed HEALTH (too confusing). Screen was short: now 27 rows like DDDD (47×17 play area). Clickable cards with a "v" above on hover. Ledger like 88x31: one big chain for everyone, descriptive records, hidden until the day is over (user: "hide it until the day is over").

- **public/index.html + app.js**: one `<pre>`, lines as segment lists `{t, c, k, input}`; `frame()` with "~" stretch rows so every screen is H = 27 rows; symbols `[⚔‼♥♠♣♦↷█░·…]` wrapped in `.g` (inline-block, width 1ch, line-height 0), ⚔ and ‼ get U+FE0E. VT323 copied from daily-dungeon (fonts/OFL.txt), DDDD palette vars. Only color: `.card.s-heart` (--demon) and `.card.s-diamond` (--moon); all text classes map to --fg; armed button is white-inverted. No text-shadow anywhere. Screens: title (logo, deck #, runners, countdown, playing as), game (left 47: room/deck line, hover row with "v", 4 cards, labels [n]DEMON/BLADE/HEALTH, preview "⚔ -3" / "‼ -12" / "+5 HP" / "WASTED" / "EQUIP", DUNGEON bar n/44, LEFT counts; right 26: HP + 20-cell bar, BLADE, KILLS (last 5), HITS BELOW n, HEAL ready/used, SKIP ready/why), end (killing/last card, DELETED/CLEARED, score, rank, route marks), board (12 rows + you, share card panel, ←/→ days), ledger, help, name (in-game input, no browser dialogs). Log: 2 status lines + 1 flavor line. Keys: Enter, 1–4, B (arm bare), S, H/?, L, N, C, Esc, ←/→; clicks via data-k. Cards use class `clk` (no hover highlight), mouseover sets `hoverK`. 1 s clock redraw; new deck at UTC midnight reloads /api/today.
- **engine**: fight events carry `weapon`; publicView adds skippedLastRoom, takenThisRoom, last (lastTaken), deckWeapons, deckPotions; shareMarks bare-hands mark is ‼ (was ✊). VERSION 0.3.0.
- **worker**: `fixMarks` turns stored ✊ (and ×) into ‼ on the way out (run #1's marks).
- **Ledger** (src/ledger.js, migration 001): table `ledger (id, kind deal|move|run, day, player_id, run_id, n, record, prev_hash UNIQUE, hash UNIQUE, created_at)` + partial unique indexes: one deal per day, one move per (run_id, n), one run end per run. hash = SHA-256(prev_hash + "|" + record), GENESIS 64 zeros. Records (JSON objects): deal `{kind, day, seed_hash = SHA-256(seed), t}`; move `{kind, day, player, run, n, room (turn before), action take|take_bare|skip, card, events [[skip,[codes]] | [equip,code,[dropped]] | [heal,code,amount] | [wasted,code] | [fight,code,bladeCode|null,damage] | [deal,turn,[codes]]], hp [before, after], t}`; run `{kind, day, player, run, status, score, hp, room, moves, demons_left, t}`. `ensureDeal` on /api/start and every move. Moves: `env.DB.batch([UPDATE runs ... WHERE moves = n, INSERT move ... WHERE EXISTS(run has n+1 moves), (INSERT run end)])`; UNIQUE prev_hash conflict → rebuild on the new head and retry (≤ 8); other UNIQUE (double-send) → 409. GET /api/ledger?before&limit (≤100, default 15): newest first, names joined at read time; today's (or later) move entries of other players come back `hidden` with only room + take/skip; deals, run ends, your own moves and past days include the full record.
- Tests 32/32 (3 new: chain verifies entry by entry + sealed HP matches engine replay + run end score; triple-sent move sealed once, no fork; hidden for others/anon, paging, open after the day). Fake D1 gained `batch()` as a real transaction. Rendered every screen in headless Chromium against a local server (all lines 80 cols, 27 rows, no errors).
- Runs played before v0.3 (incl. run #1) have no ledger entries; the ledger starts at the first start/move after the migration.

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
