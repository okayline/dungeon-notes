# moba-beat: design

A rhythm micro-MOBA auto-battler, daily and async. Worked out in a theorycrafting talk on Oct 21 2026 (HST). It has nothing to do with CLUTCH FEED TILT: its own repo (okayline/moba-beat), Worker, database and ledger. Status tags: BUILT, DECIDED, LEANING, OPEN.

## The idea

You pick a squad, the squad fights a ghost on its own, and you tap your units on the beat to make them crit. The player has two jobs: choose the squad, then decide on every beat who gets the crit.

## The loop and the squad

- **DECIDED** An auto-battler: the fight is a deterministic simulation, easy to replay on the server, with no live connection.
- **LEANING** Three roles with a counter loop between them (CLUTCH, FEED, TILT are the working names; the card game "Hand of 6" used the same loop and was dropped as too close to Aura Farm's FARM). A squad is 3 units.
- **LEANING** Each role has its own feel when it acts: CLUTCH rare and huge, FEED fast and small, TILT erratic with high reward and a harsher miss.
- **OPEN** The roster, the win condition (kill the squad, or hold an objective), fight length (60 to 90 seconds seems right, not tried), the name and look.

## The beat and the tap (Rhythm Tengoku for GBA)

- **DECIDED** The model is Rhythm Tengoku (GBA): play by sound, cues you answer, a beat you never hear. The owner: "this game should basically be rhythm tengoku for GBA".
- **BUILT** A daily song over a hidden metronome: drums play beats 1, 2 and 3 of every measure and beat 4 is silent; the player claps on 4. 8 measures shaped A A A B | A A A C (a loop with fills). A bassline and soft chords play a real progression in the day's key, ending home; nothing new starts on beat 4. Reverb and a compressor. Tempo 70 to 130 BPM. One of three kits a day: hip-hop, electro, disco, played from CC0 drum samples (Boochi44/free-drum-samples). The grid is hidden until you've played (in the page only).
- **BUILT** Cue, then wait: in about half the measures (never the first) an enemy winds up on beat 1 and its attack lands 2 beats later; the player taps then to parry.
- **BUILT** Scoring against the hidden beat: perfect within 35 ms, good within 80 ms (owner: don't change the timing). A countdown -3, -2, -1 on the same tempo, then 1, 2, 3 shown and nothing on 4.
- **IDEAS** Other parries: different wait lengths, double strikes, fake-outs, off-beat landings, counters, role-based wind-ups (Clutch slow and huge, Feed quick, Tilt off-beat). Other Tengoku patterns: on-beat to off-beat switch (attack vs defend), copy the call (answer the ghost), a twist halfway, a weekly remix.
- **OPEN** Try Again / OK / Superb ratings; device delay calibration; whether each day becomes its own minigame.

## Where the beat comes from

- **BUILT** The ledger. The day's entry holds the date and the shared registry's chain head as of 00:00 UTC; the hash of that entry is the beat. It is fixed from midnight, differs every day, and anyone can recompute it from the public registry.
- **BUILT** `beat(hash)`: the day's drumbeat, wind-ups, kit and tempo (see `changelog-v0.1.md`).
- **BUILT** The game feeds the registry back with a checkpoint (entry count and head) after every seal, like Dawn Baton and scoundrel.exe. The beat only uses the registry as of the day before, so today's play shapes tomorrow's music and nothing loops.
- **BUILT** Runs: the server scores the taps against the hidden beat; the first run of a player's day is sealed (taps and score), later ones are practice. Players are a cookie token, no names yet. A ledger page lists days and runs and checks the chain in the browser.
- **OPEN** The moon phase as a dial on the beat's feel (sparser and slower toward a new moon, denser and faster toward a full one). It adds no randomness, only a slow arc over the month. Not built; leave out if it makes days feel too different.

## Async and verification

- **DECIDED** You fight a ghost: another player's sealed squad plus their tap log, replayed. The first player of the day fights a bot ghost. A run is sealed on the game's own ledger with the squad and the taps, so the server can replay it and anyone can re-score it.
- **DECIDED** Only your own taps are live; everything else is replayed, so async works without anyone online together.
- Costs: the ghost can't react to you; you only get your own result at first; with few players the ghost pool is small (older sealed runs fill it).
- Replay shows a run was possible under the rules, not that a human played it. A script can tap perfectly.
- **OPEN** Latency: browsers and devices differ, so tap times may need a calibration step or a wide grace window. Sound needs a first tap to start.

## Considered and not used

- The beat from CLUTCH FEED TILT's ledger, or from one other game's checkpoint (Dawn Baton's lap): the registry head covers every game.
- A conductor lane UI with approach rings: the shared beat replaces it, so the units are the notes.
- A card version ("Hand of 6"): too similar to Aura Farm's FARM.

## Build order

1. BUILT The ledger and the day's seal (v0.1, v0.2).
2. BUILT The beat from the hash (v0.3).
3. Next: the roster and the counter loop on paper, then the fight simulation, then tapping and scoring from the tap log, then the game's checkpoint to the registry.
