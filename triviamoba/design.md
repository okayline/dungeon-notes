# TriviaMoba: design

Trivia in three MOBA lanes, and the game SCATTER.EXE folds into ("two halves of the same game", owner, Oct 23 2026 HST). Worked out with the owner on the night of Oct 23 2026 (HST). Status tags: BUILT, DECIDED, LEANING, OPEN. Per-release detail is in `changelog-v0.1.md` (this folder).

## The day

- **DECIDED** One shared day for everyone: the same prompts and questions, picked from the shared registry's chain head at 00:00 UTC. **BUILT** for the crowd prompts (v0.3: the day's `crowd` ledger entry). Trivia questions are still random per game in the page.
- **DECIDED** Write (SCATTER.EXE's half): two "name something…" prompts a day; your answers become a later day's crowd. Optional for now (maybe required later). **BUILT** in the backend (`POST /api/write`); the page doesn't call it yet.
- **DECIDED** Play: three lanes (spokes), 5 spaces each, all 5 rounds always played: 3 trivia rounds and 2 crowd rounds ("match the crowd"; no "dodge" rounds).

## Lanes: topic and action in one

- **DECIDED** Each lane is a topic and an action, named like MOBA stats:
  - **STR**: the physical world: the human body, the moon, planet Earth. A right answer **attacks**: pushes you forward, sized by the call.
  - **INT**: hard science and tech. A right answer **heals**: gains back a lost space in the lane you're furthest behind in (not its own lane, or it would be STR by another name).
  - **DEF**: history, for now (the owner finds it cliché; "defense" in every sense was offered and set aside). A right answer **blocks** that round's wave.
- **DECIDED** CLUTCH, FEED and TILT stay as the calls: how big a risk you take on each answer, in every lane.
- **DECIDED** No hero stats/weights for now ("just thinking about the systems themselves"). The stat words are the lanes, so the stat layer stays empty.
- **DECIDED** Questions are straight "get it right or not" trivia, narrow, never generic or cliché. No negative questions, answers or headlines (no bad vibes).

## The map

- **DECIDED** Player vs. map, not player vs. ghost. No tug of war.
- **DECIDED** Creep waves: every round the map's wave pushes your marker back 1 space. STR right beats it and pushes forward; DEF right blocks it (no ground lost, none gained); a wrong answer lets it through.
- **DECIDED** The tower is the goal: reaching space 5 takes the far tower and wins the lane. (The towers are drawn today but "Flavor only, it changes no rules": `public/index.html` line 334.) Your own tower as a shield was offered and not chosen.
- **OPEN** Wave size and tuning: a 1-space wave each round on a 5-space lane may be harsh.

## The ghost

- **DECIDED** The ghost is a real player's earlier run of the same day's questions, sealed on the ledger. It plays the map on its own track and never moves your marker; you compare how far you each got.
- **DECIDED** The ghost shows on the board only; the bottom panels (draft, rounds, results) never mention it. **BUILT** (v0.3.1, UI text only).
- Today's prototype still has the old rule: your push minus the ghost's scripted push (`resolve`, line 497 `var net = mine - theirs`), with 3 scripted rounds a lane (not 5).

## Crowd data

- **BUILT** 10 prompts with real counts from ProtoQA (CC BY 4.0, credit in README). Real players' written answers add to the counts and replace them over time. Made-up house counts were turned down.

## Open

1. INT's heal in detail: what if no lane is behind?
2. Wave size; whether the call changes the wave.
3. The trivia question bank and its daily pick. A public seed lets anyone work out the day's questions early; a secret seed (as in Pitch) or commit-reveal is probably needed for trivia (not decided).
4. Hiding the crowd counts on the day's ledger entry (commit-reveal): left for now.
5. DEF's topic.
