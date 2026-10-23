# NANO PITCH (nano-pitch) — Dev Changelog — v0.1–v0.11.2

Detailed changelog for Daily Pitch (repo okayline/nano-pitch): one daily 4-point cutthroat Pitch game, the same deal for everyone, against bots. Its `pitch_` tables are in the moba-beat D1. The public repo keeps a short `CHANGELOG.md`; the design is `pitch/daily-pitch-design.md` in the project files. Newest first. Times are Hawaii time (HST), from the commit times.

v0.1–v0.6 were written after the fact (Oct 22) from the commit messages. v0.7–v0.9.1 come from the public `CHANGELOG.md` and the commit messages. v0.9.2–v0.9.6 were written from the working session that built them, so they include what the owner asked for and what went wrong. Every version went straight to `main` with no PR. The game is called NANO PITCH on the page since v0.8; live at pitch.88x31.app (Worker `nano-pitch`, `pitch_` tables in the moba-beat D1). Newest first. Times are Hawaii time (HST).

**Words (set by the owner on Oct 22):** a *round* is one deal (6 tricks); a *hand* is one trick (each playing seat plays one card); a *game* is rounds until someone reaches 11. The page says Round / "takes hand". The code still uses `hand` for a round and `trick` for a hand (engine `HAND = 6`).

---

(v0.10 and v0.11 have no entry here yet; see the public `CHANGELOG.md`.)

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
