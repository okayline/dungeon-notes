# moba-beat: design

A rhythm micro-MOBA auto-battler, daily and async. Worked out in a theorycrafting talk on Oct 21 2026 (HST). It has nothing to do with CLUTCH FEED TILT: its own repo (okayline/moba-beat), Worker, database and ledger. Status tags: BUILT, DECIDED, LEANING, OPEN.

## The idea

You pick a squad, the squad fights a ghost on its own, and you tap your units on the beat to make them crit. The player has two jobs: choose the squad, then decide on every beat who gets the crit.

## The loop and the squad

- **DECIDED** An auto-battler: the fight is a deterministic simulation, easy to replay on the server, with no live connection.
- **LEANING** Three roles with a counter loop between them (CLUTCH, FEED, TILT are the working names; the card game "Hand of 6" used the same loop and was dropped as too close to Aura Farm's FARM). A squad is 3 units.
- **LEANING** Each role has its own feel when it acts: CLUTCH rare and huge, FEED fast and small, TILT erratic with high reward and a harsher miss.
- **OPEN** The roster, the win condition (kill the squad, or hold an objective), fight length (60 to 90 seconds seems right, not tried), the name and look.

## The beat and the tap

- **DECIDED** One shared beat runs through the fight. Tapping a unit exactly on the beat makes its next action a crit. One crit per beat, so each beat is a choice: who gets it (a big hit, a chain, a heal, a parry on an enemy).
- **DECIDED** 16 beats: 4 measures of 4, looping. Each beat is a rest (no crit can land), normal or strong (a bigger crit). Beat 1 of each measure is never a rest.
- **LEANING** Enemy units can be tapped on the beat too, to interrupt or parry; the counter loop gives a bonus against the role it beats.
- **LEANING** Several off-beat taps in a row make the squad tilt, so spamming doesn't work.
- **OPEN** The loop is learnable, which can make it easy. Ideas: shift the pattern each repeat by hashing the hash; more units pulsing than beats allow. Not tried.
- **OPEN** Timing windows, and how taps are logged. The log should be whole milliseconds (`[ms, unit id]`), not 15-per-second ticks, since rhythm judgment is tighter than that.

## Where the beat comes from

- **BUILT** The ledger. The day's entry holds the date and the shared registry's chain head as of 00:00 UTC; the hash of that entry is the beat. It is fixed from midnight, differs every day, and anyone can recompute it from the public registry.
- **BUILT** `beat(hash)`: 16 beats and a tempo of 80 to 120 BPM (see `changelog-v0.1.md`). The shares of rest, normal and strong, and the tempo range, are guesses.
- **DECIDED, not built** The game feeds the registry back with a checkpoint (entry count and head), like Dawn Baton and scoundrel.exe. The beat only uses the registry as of the day before, so today's play shapes tomorrow's music and nothing loops.
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
