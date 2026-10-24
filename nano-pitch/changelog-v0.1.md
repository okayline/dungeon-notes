# NANO PITCH (nano-pitch) — Dev Changelog — v0.1–v0.12.5

Detailed changelog for Daily Pitch (repo okayline/nano-pitch): one daily 4-point cutthroat Pitch game, the same deal for everyone, against bots. Its `pitch_` tables are in the moba-beat D1. The public repo keeps a short `CHANGELOG.md`; the design is `pitch/daily-pitch-design.md` in the project files. Newest first. Times are Hawaii time (HST), from the commit times.

v0.1–v0.6 were written after the fact (Oct 22) from the commit messages. v0.7–v0.9.1 come from the public `CHANGELOG.md` and the commit messages. v0.9.2–v0.9.6 were written from the working session that built them, so they include what the owner asked for and what went wrong. Every version went straight to `main` with no PR. The game is called NANO PITCH on the page since v0.8; live at pitch.88x31.app (Worker `nano-pitch`, `pitch_` tables in the moba-beat D1). Newest first. Times are Hawaii time (HST).

**Words (set by the owner on Oct 22):** a *round* is one deal (6 tricks); a *hand* is one trick (each playing seat plays one card); a *game* is rounds until someone reaches 11. The page says Round / "takes hand". The code still uses `hand` for a round and `trick` for a hand (engine `HAND = 6`).

---

v0.10 and v0.11 below are copied from the public `CHANGELOG.md` (no commit hashes looked up, no owner quotes). v0.11.3–v0.12.5 are from the Oct 23 working session and the commit messages.

## v0.12.5
**Fri Oct 23, 2026 · 7:55 AM HST** (c8f4296)
- **Owner:** "can you remove the shadow please" (picture of the rounds grid's left block).
- **Cause:** `.rleft` in `public/style.css` had `box-shadow: 6px 0 6px -4px rgba(0,0,0,.6)` (the soft edge from when the rounds slid under sticky columns).
- **Changed:** deleted that one `box-shadow`. Removed: the dark shadow on the right edge of the pic and total block.
- **Checked:** 45 tests pass. **Not checked:** how it looks in the real app.

## v0.12.4
**Fri Oct 23, 2026 · 7:53 AM HST** (a1911ea, pushed with v0.12.1–v0.12.3)
- **Owner:** sent a picture of the earlier lavender bar and said "make it look like this please".
- **Changed:** `.rscroll` scroll bar is a slim lavender pill (`var(--dim)`, 10 px high, rounded) with a transparent track and no arrows. Chrome and Safari get it from `::-webkit-scrollbar` rules; Firefox gets `scrollbar-width: thin; scrollbar-color: var(--dim) transparent` through `@supports not selector(::-webkit-scrollbar)`. Removed: the browser's default thin bar look on this grid (white track, arrows). Firefox cannot make the rounded pill shape.
- **Checked:** rendered with the real `style.css` in headless Chromium (scroll bars switched on); 45 tests pass. **Not checked:** Firefox; the live game on the owner's device (she later said "the scrollbar is good").

## v0.12.3
**Fri Oct 23, 2026 · 7:53 AM HST** (a1911ea)
- **Owner:** "can you make it work in firefox please".
- **Cause:** v0.12.2 moved the bar with `::-webkit-scrollbar-track { margin-left: 64px }`, which only Chrome and Safari read.
- **Changed:** the rounds grid is split in two (`public/app.js`, `public/style.css`): `.rleft` holds the pic and total columns and does not scroll; `.rscroll` holds only the round columns, so its bar starts under round 1 in every browser. `fitGrid()` now measures the wrapper `.rwrap` and caps `.rscroll` at the whole rounds that fit. Rows are fixed at 16 px (header) and 30 px, so the two blocks line up. Removed: the sticky left columns (`.c0`/`.c1` positioned over the grid) and the Chrome-only 64 px track margin.
- **Checked:** mock page with the real `style.css` in headless Chromium at 420 px wide with 8 rounds: six rounds fit, the scroller was capped at 264 px with 352 px of content, so it scrolls; rows lined up. 45 tests pass. **Not checked:** Firefox (not installed here); the real app.

## v0.12.2
**Fri Oct 23, 2026 · 7:53 AM HST** (a1911ea)
- **Owner:** "can you please make the bottom scroll bar not go all the way ? it should stop under the round 1 column. also could you push the player scores a few pixels to the left pleas[e]". I read "stop under round 1" as the bar starting there, not ending there.
- **Changed:** the bar starts under round 1 (a 64 px left margin on the scroll bar track, Chrome and Safari only; replaced in v0.12.3); the totals got `padding-right: 8px`, about 4 px further left. Removed: the bar's full-width track under the pic and total.
- **Checked:** 45 tests pass. **Not checked:** the real app.

## v0.12.1
**Fri Oct 23, 2026 · 7:53 AM HST** (a1911ea)
- **Owner:** "there's a bug when sometimes i click a card to play and it hangs a long time. then i click again and it plays", then "yes can you please investigate card click hang" and "fix it please".
- **Cause (not reproduced in a browser; read from the code):** a browser click needs the button to go down and come up on the same element. `draw()` rebuilds every card (`$app.innerHTML`, `public/app.js` line 311) and the chat redraws every 1–4 s while the replay redraws after each move (`PACE.move` 1300 ms, line 80). A redraw between press and release removes the pressed card, so the click goes nowhere and the card looks stuck.
- **Changed:** a `pointerdown` handler plays a playable card or an enabled bid on the press (left button only); the `click` that follows within 700 ms is ignored for cards and bids (`/^[bc]\d/`) so a move can't play twice. Removed: nothing (a click alone, such as from the keyboard, still plays).
- **Checked:** 45 tests pass; `node --check`. **Not checked:** in a browser, so the hang is not confirmed gone. The tests don't cover the page.

## v0.12
**Fri Oct 23, 2026 · 7:43 AM HST** (03f83a6)
- **Owner:** "can i get a way to see the hand history? maybe in the Ledger page?", then "trick summaries please" (each time the four seats play one card), "show me a mockup of what it looks like please", and "dont just put the newest entry on the top. order the whole list from newest to oldest starting from the top".
- **Added:** `GET /api/hands?daily=0|1&n=N` (`src/worker.js`): rebuilds the player's own finished game from its saved moves and returns each round's bids, tricks (who played what, who took it), High/Low/Jack/Game and scores. 404 "You haven't finished that game." for a stranger, another player or an unfinished game (everyone who plays game N holds the same deal, so opening it early would give the cards away); 410 if the game can no longer be rebuilt. The ledger marks `mine` on the player's own result and daily entries. `public/ledger.js` adds a "Show hands" button per own game; rounds and tricks are newest first. Test: "your hands" in `test/worker.test.mjs`. Removed: nothing.
- **Checked:** 45 tests pass; mockup rendered in headless Chromium and sent to the owner. **Not checked:** the live ledger page.

## v0.11.6
**Fri Oct 23, 2026 · 7:18 AM HST** (aaf218d, with v0.11.4 and v0.11.5)
- **Owner:** screenshot and "there's also a bug where the card gets stuck in the up animation. maybe related??".
- **Cause:** v0.11.2's `hot` class on the card under the mouse was only taken off at the next redraw.
- **Changed:** `mouseover` removes `hot` from the card the mouse left at once; `mouseleave` clears `hotCard` and the class. Removed: the card staying up after the mouse has left.
- **Checked:** not recorded. **Not checked:** whether the "click hangs" bug is the same cause (it was not; see v0.12.1).

## v0.11.5
**Fri Oct 23, 2026 · 7:18 AM HST** (aaf218d)
- **Owner:** "have the chat say that stuff, to all the players on their turns too".
- **Changed:** `moveLines()` adds one friendly turn line (`turnLine`) after each bot's bid or card, from the same `IDLE` pools, never the same words twice in a row. Removed: nothing.

## v0.11.4
**Fri Oct 23, 2026 · 7:18 AM HST** (aaf218d)
- **Owner:** "when the player is sat out, and the turn goes to them dont have it highlight their cards, only their name for a second then move on", "i want the chat to run constantly, WITHOUT it sounding mean", "\"tick tock\" stuff like that. going against the tone completely", then "take out all the bad ones you suggested but keep the skull emoji and \"bruh\"".
- **Changed:** seats get an `out` class; `.table:has(.seat.turn:not(.out)) .seat:not(.turn) .backs i` so the other seats' cards don't dim on a sat-out seat's turn. The `IDLE` chat pools are friendly ("you got this", "good luck", "take your time", "nice"...). Removed from the chat: "come on", "pass?", "go 4 coward", "bid bid bid", "tick tock", "waiting lol", "play it", "ur turn", "no pressure", and after tricks and rounds "rip", "ez", "L", "told u". Kept: "💀" and "bruh".
- **Checked:** not recorded.

## v0.11.3
**Fri Oct 23, 2026 · 7:05 AM HST** (a1cc4d2)
- **Owner:** "can you take out the Daily Pitch explanation text please !!", then "for the first one, can you do the suggestions".
- **Removed:** the result-screen line "The table hasn't seen enough rounds like these yet."; the Account page paragraph about guests, "Logged in on N devices" and save codes (with its "No player here yet", "Guest" and "A save code or passkey brings your game to another device" sentences); the paragraph at the top of the ledger page explaining the chain. Added: nothing.
- **Checked:** not recorded.

## v0.11.2
**Fri Oct 23, 2026 · 2:45 AM HST** (23edea2)
- **Owner:** "(the card bounce thing still happens)" after v0.11.1, then "push the nano pitch fix please".
- **Cause:** `draw()` rebuilds the whole table with `$app.innerHTML` (`public/app.js` line 301), several times while the bots move and the chat talks (`chatOn`, `replay` stages). Each rebuild made fresh card buttons at rest, so the hovered card dropped and lifted again.
- **Changed:** `hotCard` (like `hotBid`) holds the `data-k` of the playable card under the mouse (`mouseover`; cleared on `mouseleave` and in `send`); the hand draws that card with class `hot`, and `.hand .pc.ok.hot` lifts like `:hover`. Removed: the drop on every redraw.
- **Checked:** stand-in page with the real `style.css` in headless Chromium, pointer resting mid-card with half-pixel jitter, hand rebuilt every ~250 ms: before, the card was not fully lifted in 31 of 160 samples (down to rest); after, 0 of 160. 44 tests pass.
- **Not checked:** the real app in a browser; the live site after deploy.

## v0.11.1
**Fri Oct 23, 2026 · 2:39 AM HST** (f3f2939)
- **Owner:** "when i mouse hover over my card, the card jumps up and down (animation)?", then "push that for now".
- **Cause:** `.hand .pc.ok:hover { transform: translateY(-6px); }` (`public/style.css` line 109) moves the hovered card itself, so a pointer on its bottom 6 px loses the hover when it lifts, and it drops back.
- **Added:** `.hand .pc.ok::after`, a 6 px invisible strip under each playable card that lifts with it. Removed: the flicker at the bottom edge.
- **Checked:** stand-in page in headless Chromium, pointer 2 px above the bottom edge with half-pixel jitter: 66 position changes in about 2 s before, 2 after. 44 tests pass.
- **Not checked:** the real app; the redraw cause (found and fixed in v0.11.2).

## v0.11 (from the public CHANGELOG)
**Fri Oct 23, 2026**
- Result screen: more room under the rounds grid and a thinner scroll bar; the rounds grid shows whole rounds only (six fit on a 390 px phone).
- Round card back to centred over the blurred table, chat keeps going behind it. Removed: the pinned card and the strip of four boxes.
- Names: a visitor with no save code or passkey gets a random name from the start (server rolls and signs it), kept in the browser and sent only when they make a save code or passkey. Removed: "You" for new players, the server storing a guest's name on first move, and the second copy of the name-fetching code.
- Chat never goes quiet: a viewer talks every few seconds while it's your turn and during the round card. Removed: the silence on your turn and the four-line limit.
- You can bid or play the moment your name lights up. Removed: the pause before your cards were clickable.
- Table: tiny cards for the High, Jack and Low trump and a Game-points number each seat holds so far this round. Removed: nothing.
- Ledger: every hash shown whole; footer in Hawaii 24-hour time. Removed: the 12-character shortened hash and its hover text.

## v0.10 (from the public CHANGELOG)
**Fri Oct 23, 2026**
- Daily game: once a UTC day after your game you play that day's Daily game (same cards, same bots for everyone; #1 is Oct 23, 2026), counted on its own, never interrupting a game in progress. Added: Daily games, their own field and results tally, a `daily` ledger entry and row.
- Fixed: the arrow and "your bid" went blank when your turn came; now they stay from the last bot's move.
- Table: finished-trick cards no longer dim. Scoreboard: score next to the emoji, name under. Chat: six made-up viewers comment on tricks, bids of 4 and how rounds end; spade and club cards are blue. Round card: chat continues, "This round" as a strip of four boxes.
- Ledger: finished games show the player's name, the four totals with table names, the game's field so far and the Daily game's day. Registry checkpoints carry the game's public facts. Result screen: losers in black and white, bigger winner name, "Your score each round" as a four-seat grid.
- Removed (each of the above replaced something): the three bots as trick commenters, the one-line "This round" row and Bid row on the round card, the fixed table names on ledger rows, the "... WINS" headline, the colour on losers' cards.

## v0.9.6
**Thu Oct 22, 2026 · 11:06 PM HST** (76d8b0f)
- **Changed:** nothing shows in the middle of the table when nobody has the turn.
- **Removed:** "folds" from the chat's pass words (it was never asked for: it came with the v0.9 chat; a pass now reads "passes", "nope" or "hmm...next"), the 🤖 fallback in the middle, and the ✅ / 💥 over the round summary that the first v0.9.5 build added.

## v0.9.5
**Thu Oct 22, 2026 · 10:50 PM HST** (816ef6b; rebuild commit 97963f3 at 10:53 PM)
- **Added:** an arrow in the middle of the table pointing at whose move it is (⬇️ you, ⬅️ West, ⬆️ North, ➡️ East), 💤 on a sitting-out seat during play, and ✅ made / 💥 set over the round summary (the owner asked for an arrow and "other emojis for events"; the choice of 💤 ✅ 💥 and the "bidding" text kept under it was mine, not approved first).
- **Fixed:** the turn highlight lit you after East played, hopped to a sitting-out West after your card ended the hand, then came back to you. `trickEvents` now drops the skip events after the last card of a finished hand, so the turn goes straight to the next leader. Side effect: a seat that only ever sits after the last card of a hand gets its "Sat out" label once the first hand of the round is over (`frame` uses the round's `out`).
- **Fixed:** the face-down cards of seats not on turn were dimmed with `opacity: .5` per card, so overlapping cards showed each other's stripes through. They are now darkened with `filter: brightness(.55)` (the opacity rule dated from v0.9.2/v0.9.3).
- **Removed:** the 🤖 in the middle of the table; the half-transparent dimmed cards; the extra hop of the highlight to a sitting-out seat after a finished hand.
- **Release note:** the Workers build of 816ef6b failed with no log visible to us (the GitHub check run only links to the dashboard); an empty commit (97963f3, pushed on "push" but not asked for as a separate step) rebuilt it and it succeeded.
- **Reverted before release:** a first guess at "make the cards facing down solid" (plain fill, no overlap) was wrong and was rolled back unpushed.

## v0.9.4
**Thu Oct 22, 2026 · 10:37 PM HST** (3a52ab1)
- **Fixed:** the chat jumped when new lines arrived. Rows animated as if bottom-anchored while the box was top-anchored and growing; the feed is now a fixed-height box (108px) with the newest line at the bottom (`justify-content: flex-end`), so a new line pushes the older ones up. Reproduced with a position sampler (23 jumps before, 0 after).
- **Changed:** the chat carries over between rounds (`feedHtml` prepends the lines of earlier rounds from `history`); it fades out at the top (the first line almost gone, full strength by line 4).
- **Changed:** a seat that sits out gets one quick hop of the turn (`PACE.skip`, 350 ms) and its "Sat out" stays up for the rest of the round; the label is no longer dimmed with the seat's cards.
- **Changed:** your name is on the scoreboard instead of "You"; a bot dealt the same name as you is renamed (`botName`, a deterministic hash of the cast name).
- **Removed:** the two-beat pause on a sat-out seat, "Sat out" showing for one trick only, "You" on the scoreboard, and two seats with the same name.
- **Reverted:** a fixed-height feed and a skip of no-op redraws added earlier in the session without being asked were reverted when the owner said the chat animation looked fine; the fixed-height box came back here after the jump was reproduced.

## v0.9.3
**Thu Oct 22, 2026 · 10:22 PM HST** (eee1f26)
- **Changed:** the round summary is a pop-up (`.popup`) over a table that stays on screen (the last replay frame is kept as `frozen`). Header "GAME 3, ROUND 8: SET!" (or "MADE IT!") with "Name bid 3 in ♠ and got SET!" on the line below; no chip on the right.
- **Added:** chat reactions after tricks ("nr", "nt", "oof", emojis; likelier after a trick with a ten or the trump jack); chat lines arrive in three stages after each move (the move, its follow-ups, the chatters), at a jittered time picked from the move's place in the round so a replay or reload chats the same; seven lines; your own cards are back in it as "You: K♦"; "nope" and "hmm...next" read as said ("Name: nope").
- **Changed:** the bidder's line after the bidding says "bids 2", and is left out after "stuck 2" (the owner reported "wins 2" as wrong for a forced bid); names in the chat are bolder.
- **Changed:** the sit-out beat: the turn lands on the seat, a beat later its "Sat out" shows over its cards, then the turn moves on, including at the end of a round (the owner reported the round ending straight after North played with East sitting out).
- **Changed:** the Pass/2/3/4 bar is inside the table panel above your name line; the highest bid's chip is always lit and never dimmed; your cards dim a little when it's your turn to bid; names and status text stay on one line; the version number sits right under the table.
- **Removed:** the full-screen summary, "ROUND 8 OVER" and the Trump chip; the bar under the panel; the dimmed bid chip; "wins 2"; the line after "stuck 2"; the stepped dimming of the top chat lines; every line of explainer text under the game panel ("Your lead names trump", "Sealed on the ledger.", "The bots changed...").

## v0.9.2
**Thu Oct 22, 2026 · 9:53 PM HST** (53f5549)
- **Rules:** a seat dealt no trump sits out the round (no cards, "Sat out"; cards never played don't count towards Game). Engine: when the first lead names trump, `s.out = dealt.map(no trump)`; `nextIn` skips out seats; a trick is the size of the active seats; `view()` carries `counts` and `out`, `summary()` carries `out`. The Low point goes to the seat that *played* the lowest trump (`points[low.seat]++`); Game points still go to the trick winner. Bots: `estimate` counts a lone 2 or 3 of trump as a Low point. Games saved before this release replay under the new rules.
- **Removed:** Low going to whoever won the trick holding the lowest trump; bots chasing a trick just because a very low trump (3 or lower) is in it (that clause of the bot's `point` check at `botPlay`; it was removed as a consequence of the Low rule and not discussed with the owner at the time).
- **Wrong turns (same session):** the owner's "the player without trump doesn't play the round" was built three different ways (a hand, a trick, a hand again) before the words were defined; it was rolled back and rebuilt once "round = one deal" was settled.
- **Changed:** "hand" (a deal) is "round" everywhere you read it, and the chat says "takes hand" for a trick; the subtitle shows the round whose result is on screen; the chat text is bold again, actions read "Cracked Icon folds" with no colon and card plays and emoji keep it; names never wrap; face-down cards twice as big; an empty row under the cards on the table and under your hand; the final headline is the winner's name and "WINS"; Ledger and Account links read "Back  Account" / "Back  Ledger".
- **Removed:** the colon on actions, every "You:" line (restored in v0.9.3), the "Play a card" hint, "YOU BEAT THE TABLE" and "THE TABLE WINS", and the old link order.

## v0.9.1
**Thu Oct 22, 2026 · 9:19 PM HST** (5d2ff81)
- **Changed:** the subtitle reads "Thu, Oct 22 · Game #N · Hand N" again (date on the device); the chat dims towards the top again.
- **Removed:** the v0.9 subtitle with no date and the v0.9 chat with every line at full strength.

## v0.9 — "Any Game"
**Thu Oct 22, 2026 · 9:14 PM HST** (a0e908c; migration 006_games.sql, then 007_drop_days_and_practice.sql once live)
- **Added:** numbered games (1, 2, 3...), each fixing its deal, played in order by everyone, one at a time; one Play button on the final screen; the table's memory of bids is saved with each game when it is first asked for (`pitch_deals`), so a game's bots never change; a finished game seals a ledger result (game number, player, hands, totals, hash of the moves, never the cards). New tables `pitch_games`, `pitch_deals`, and the ledger's `game_no`.
- **Changed:** your cards sit inside the table panel under your name; your name replaces "You" on your seat with your status to its right; bigger seat names and face-down cards; a negative score's bar is red; each chat message arrives on its own; the words vary ("slaps down", "drops", "serves", "leads", "opens", "nope", "folds", "goes 3", "gets their 3", "W"); the bid panel stays on the bid you last pointed at; Reroll name.
- **Removed:** the daily game, practice games and New game, "Today's game" and "Next deal in" (and the one-game-a-day gate), day entries on the ledger and the seed reveal for new games (older entries stay), the date in the header, the game you had unfinished under the old model, the fade-out and name glow in the chat, the plain "plays" on every move, the Bidder chip, the big profile pic menu, and names longer than 12 characters.

## v0.8 — "New Faces"
**Thu Oct 22, 2026 · 8:35 PM HST** (39edfd1; migration 005_names.sql)
- **Added:** the page's name is NANO PITCH; each game seats three bots with random gen-z names and profile pics (aura-farm's lists) and a personality or none (safe: a point under its count; bold: 3 straight to 4; crowd: follows the crowd after 3 players, not 5); bots sometimes post just an emoji after a move; a random name and a profile pic for each player (Account page, new name any time); Log out; games any time via New game; "Game #N" counter in the header and in the sealed record.
- **Changed:** when you can't follow the suit led, any card is legal; the table's height no longer jumps; each score's bar sits below it and a negative bar runs left out of its frame; the seat to move stays bright and the others dim; Pass is preselected; the bid chip reads "bid 2 in ♦"; the chat shows the last 5 moves with profile pics; less waiting after East plays and after a trick.
- **Removed:** the fixed lagspike, mogger99 and tiltproof; being forced to play trump; "Finish today's game first."; the Tricks chip, the "Hand N / first to 11" line, the fire icon on the bid chip, the always-lit 4, the "pass" labels left under every seat after the bidding, the small "Log out of this browser" link and "Back to the game" on the Ledger.

## v0.7.1
**Thu Oct 22, 2026 · 7:24 PM HST** (05d36ce)
- **Changed:** the move list moved into the table's top right corner, like stream chat: the newest 5 moves, no panel behind them, older ones fading.
- **Removed:** the move list panel under your hand.

## v0.7 — "Slow Hand"
**Thu Oct 22, 2026 · 7:20 PM HST** (b78fc31)
- **Added:** moves play out one at a time (1.3 s apart; a finished trick stays 2.75 s with the winning card lit), the last trick before the round result, and the bids before yours at the start of each round; taps and keys wait until the moves have played; a move list under your hand.
- **Changed:** the PASS and bid buttons sit above the bidder line, which shows the bidder, the bid and the trump suit together.
- **Removed:** the Trump chip on the table screen (the suit is on the bidder line; the result screen still shows trump), and the jump from your move straight to the table after every bot had played.

## Open (not fixed)
- Oct 22, 10:58 PM HST: the owner's screenshot showed their own chip as "bid 2" when they were the dealer and the other three had passed (a forced 2), and says it used to read "stuck 2". Not reproduced: the engine flags the dealer's forced bid (`forced: true`) in every version since v0.7.1, `bidText` shows "stuck 2" for it, and a real-Worker run on a local fake D1 showed "stuck 2" for the whole round, also after a reload. Cause not found; the live data for that round was not checked.

## v0.6 — "Open Book"
**Wed Oct 21, 2026 · 9:59 PM HST** (091092e)
- **Added:** a ledger page with an in-browser chain check; after every seal (day, daily game, practice game) a checkpoint of the ledger head goes to the shared registry (new `REGISTRY` binding).
- **Changed:** page styles moved to `public/style.css`.
- **Removed:** the inline `<style>` block in `index.html`.

## v0.5 — "Neon Table"
**Wed Oct 21, 2026 · 9:53 PM HST** (aee4c32)
- **Added:** aura-farm-style page (dark purple glow, real card faces, gradient button, phone first). The table plays lagspike, mogger99 and tiltproof (TILT.EXE gamer tags) with emoji profile pics.
- **Removed:** the 80-column screen and the VT323 font.

## v0.4 — "The Table Remembers"
**Wed Oct 21, 2026 · 9:39 PM HST** (d23643d, migration 004)
- **Added:** players' bids are filed by hand type; a bot follows the crowd once 5 players held that type, from a snapshot taken at the start of each day that the day's ledger entry commits to.
- **Removed:** nothing named in the commit; card play unchanged.

## v0.3.1
**Wed Oct 21, 2026 · 9:30 PM HST** (530486e)
- **Fixed:** a saved game whose moves no longer replay (bots changed in v0.2) made the Worker return 500. An unfinished game now starts over with a message; a sealed one says it can't be shown.

## v0.3
**Wed Oct 21, 2026 · 9:25 PM HST** (254fc8a, migrations 002 and 003)
- **Added:** a day is one game to 11 (rotating dealer, tie plays on), hand results between hands, a final screen and a field of places; practice games on random deals after the daily game, sealed as kind "practice".
- **Changed/removed:** the PITCHER label is now BIDDER.

## v0.2
**Wed Oct 21, 2026 · 9:05 PM HST** (abca980)
- **Changed:** all bot seats bid their estimate.
- **Removed:** the per-seat offset `BOT_OFFSET`.

## v0.1
**Wed Oct 21, 2026 · 8:51 PM HST** (0867ceb; rules engine in 0f3d8a9, 8:40 PM)
- **Added:** `public/engine/pitch.js` (seeded deal, bidding with the dealer forced to 2, legal plays, tricks, High/Low/Jack/Game scoring, replay from seed + actions, the bots); `engine/daily.js` (day seed = HMAC-SHA256(secret, "daily:" + day), as scoundrel.exe, plus `seedHash` for the ledger); the Worker (secret-seed deal, sealed hands, field summary, accounts), the 80-column page, `pitch_` tables (`schema.sql`, `migrations/001_pitch.sql`), tests (17 engine tests in 0f3d8a9).
- **Removed:** nothing (first version).
