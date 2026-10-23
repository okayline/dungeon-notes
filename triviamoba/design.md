# TriviaMoba: design

Trivia in three MOBA lanes, and the game SCATTER.EXE folds into ("two halves of the same game", owner, Oct 23 2026 HST). Worked out with the owner on the night of Oct 23 2026 (HST). Status tags: BUILT, DECIDED, LEANING, OPEN. Per-release detail is in `changelog-v0.1.md` (this folder).

## The day

- **DECIDED** One shared day for everyone: the same prompts and questions, picked from the shared registry's chain head at 00:00 UTC. **BUILT** for the crowd prompts (v0.3: the day's `crowd` ledger entry). Trivia questions are still random per game in the page.
- **DECIDED** Write (SCATTER.EXE's half): two "name something…" prompts a day; your answers become a later day's crowd. Optional for now (maybe required later). **BUILT** in the backend (`POST /api/write`); the page doesn't call it yet.
- **DECIDED** Play: three lanes (spokes), 5 spaces each, all 5 rounds always played: 3 trivia rounds and 2 crowd rounds ("match the crowd"; no "dodge" rounds).

## Lanes: topic and action in one

- **BUILT** (v0.4, `public/engine/lanes.js`) Each lane is a topic and an action, named like MOBA stats. Played in order DEF, STR, INT:
  - **STR**: the physical world: the human body, the moon, planet Earth. A right answer **attacks**: pushes you forward, sized by the call.
  - **INT**: hard science and tech. A right answer **heals** +1: in the INT lane itself first, then your lowest lane once INT's tower is taken (owner, Oct 23).
  - **DEF**: history, for now (the owner finds it cliché; "defense" in every sense was offered and set aside). A right answer pushes forward by the call, like STR, and places a **shield** on any lane you pick; it blocks the next wave there. Won at the tower like the other two (owner, Oct 23).
- **DECIDED** CLUTCH, FEED and TILT stay as the calls: how big a risk you take on each answer, in every lane.
- **DECIDED** No hero stats/weights for now ("just thinking about the systems themselves"). The stat words are the lanes, so the stat layer stays empty.
- **DECIDED** Questions are straight "get it right or not" trivia, narrow, never generic or cliché. No negative questions, answers or headlines (no bad vibes).

## The map

- **BUILT** (v0.4) Player vs. map, not player vs. ghost. No tug of war.
- **BUILT** (v0.4) Creep waves: a wrong answer lets the map's wave push you back 1 space, on top of the call's penalty (CLUTCH −2, FEED 0, TILT −1); a right answer beats the wave and does the lane's action. A shield (from DEF) blocks one wave.
- **BUILT** (v0.4) The board is flipped: the common goal is the hub at the top; the lanes start at the edges, you start on your lit start pad (space 0), and tiles light up as you move in. Reaching space 5 takes that lane's tower by the goal and wins the lane. Your own tower as a shield was offered and not chosen.
- **OPEN** Wave size and tuning: a 1-space wave each round on a 5-space lane may be harsh.

## The ghost

- **DECIDED** The ghost is a real player's earlier run of the same day's questions, sealed on the ledger. It plays the map on its own track and never moves your marker; you compare how far you each got.
- **DECIDED** The ghost shows on the board only; the bottom panels (draft, rounds, results) never mention it. **BUILT** (v0.3.1, UI text only).
- **BUILT** (v0.4) The prototype's ghost is a scripted 5-round run per lane on its own track (a dashed ring on the board).

## Crowd data

- **BUILT** 10 prompts with real counts from ProtoQA (CC BY 4.0, credit in README). Real players' written answers add to the counts and replace them over time. Made-up house counts were turned down.

## Open

1. INT's heal: built as its own lane first, then the lowest lane (first on a tie); "this mechanic might change".
2. Wave size; whether the call changes the wave.
3. The trivia question bank and its daily pick. A public seed lets anyone work out the day's questions early; a secret seed (as in Pitch) or commit-reveal is probably needed for trivia (not decided).
4. Hiding the crowd counts on the day's ledger entry (commit-reveal): left for now.
5. DEF's topic.
