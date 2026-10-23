# TriviaMoba: design

Trivia in three MOBA lanes, and the game SCATTER.EXE folds into ("two halves of the same game", owner, Oct 23 2026 HST). Worked out with the owner on the night of Oct 23 2026 (HST). Status tags: BUILT, DECIDED, LEANING, OPEN. Per-release detail is in `changelog-v0.1.md` (this folder).

## The day

- **DECIDED** One shared day for everyone: the same prompts and questions, picked from the shared registry's chain head at 00:00 UTC. **BUILT** for the crowd prompts (v0.3: the day's `crowd` ledger entry). Trivia questions are still random per game in the page.
- **DECIDED** Write (SCATTER.EXE's half): two "name something…" prompts a day; your answers become a later day's crowd. Optional for now (maybe required later). **BUILT** in the backend (`POST /api/write`); the page doesn't call it yet.
- **BUILT** (v0.6) Play: three lanes (spokes), 5 spaces each. Every round you tap a lane's start pad to choose it; no menus, no round limit. The game is to fill ONE spoke (owner Oct 23: "no round cap", "you choose the lane by pushing the button pad the user starts out on", "the game is to fill ONE spoke"). In each lane, its 2nd and 4th questions of every 5 are crowd rounds ("match the crowd"; no "dodge" rounds).

## Lanes: topic and action in one

- **BUILT** (v0.4, `public/engine/lanes.js`) Each lane is a topic and an action, named like MOBA stats. Chosen each round (v0.6):
  - **STR**: the physical world: the human body, the moon, planet Earth. A right answer **attacks**: pushes you forward 2.
  - **INT**: hard science and tech. A right answer moves INT forward 1 **and** heals +1 in the lane you pick: you hover a start pad to see "+1" ("+2" on INT's own pad, since INT moves too) and tap it (owner, Oct 23: "int always moves forward a square with a right answer AND it gets a heal"). History: heal +1 in the lane you pick (v0.6), +2 (v0.6), +1 again (v0.6.1, "way too fast"), push 1 plus heal 1 (v0.7). INT healing itself fills in 3 rights, the same as STR.
  - **DEF**: history, for now (the owner finds it cliché; "defense" in every sense was offered and set aside). A right answer pushes forward 2, like STR, and places a **shield** on any lane you pick; it blocks the next wave there. Won at the tower like the other two (owner, Oct 23).
- **DECIDED** (v0.5, owner Oct 23) No calls: CLUTCH, FEED and TILT are gone ("the action the player does is STR/INT/DEF, clutch/feed/tilt is too much on top"). A right answer pushes +2 (STR, DEF) or heals +1 (INT); a wrong answer costs 0 beyond the wave.
- **DECIDED** No hero stats/weights for now ("just thinking about the systems themselves"). The stat words are the lanes, so the stat layer stays empty.
- **DECIDED** Questions are straight "get it right or not" trivia, narrow, never generic or cliché. No negative questions, answers or headlines (no bad vibes).

## The map

- **BUILT** (v0.4) Player vs. map, not player vs. ghost. No tug of war.
- **BUILT** (v0.4) Creep waves: a wrong answer lets the map's wave push you back 1 space and costs nothing else (owner: "wave should push back so it ends up −1"); a right answer beats the wave and does the lane's action. A shield (from DEF) blocks one wave.
- **BUILT** (v0.4) The board is flipped: the common goal is the hub at the top; the lanes start at the edges, you start on your lit start pad (space 0), and tiles light up as you move in. Reaching space 5 takes that lane's tower by the goal and wins the game. Your own tower as a shield was offered and not chosen.
- **OPEN** Wave size and tuning: a 1-space wave each round on a 5-space lane may be harsh.

## The ghost

- **DECIDED** (Oct 23, later the same night) No ghost anywhere in the page: "all ghost references should be gone from the UI and game". The backend keeps its data. Earlier the same night: the ghost was another player's run compared on the board; that is now gone from the game.

## Crowd data

- **BUILT** 10 prompts with real counts from ProtoQA (CC BY 4.0, credit in README). Real players' written answers add to the counts and replace them over time. Made-up house counts were turned down.

## Open

1. INT's right answer: push 1 and heal 1 in any lane you pick (v0.7). **Balance later** (owner, Oct 23: "leave it as is with a note to balance"): healing INT itself moves INT 2, as fast as STR, though the owner also said the game is "way too fast"; STR and DEF fill in 3 rights; STR is the plainest spoke (STR/turrets idea below). Simulations: 50/70/90% right, rounds to win STR 8.0/4.7/3.4, DEF 6.6/4.3/3.3, INT self 8.0/4.7/3.4. Game speed: "way too fast" (owner, Oct 23), not tuned beyond INT. STR is the plainest spoke (DEF does the same push and also shields): the owner's idea, "STR can maybe kill turrets faster or something when we get there", is LEANING, not built (no turrets in the game yet).
2. Wave size.
3. The trivia question bank and its daily pick. A public seed lets anyone work out the day's questions early; a secret seed (as in Pitch) or commit-reveal is probably needed for trivia (not decided).
4. Hiding the crowd counts on the day's ledger entry (commit-reveal): left for now.
5. DEF's topic.
