# moba-beat: design

A rhythm micro-MOBA auto-battler, daily and async. Worked out in a theorycrafting talk on Oct 21 2026 (HST). It has nothing to do with CLUTCH FEED TILT: its own repo (okayline/moba-beat), Worker, database and ledger. Status tags: BUILT, DECIDED, LEANING, OPEN.

## The idea

Two squads of 3 heroes take turns, one measure each, you play against a ghost (another player's recorded run), and on your turn you press one of three buttons on beat 4. Each turn the player has two jobs: choose the ability, then land it on the beat.

## The loop and the squad

- **DECIDED** An auto-battler: the fight is a deterministic simulation, easy to replay on the server, with no live connection.
- **DECIDED** A squad is 3 heroes, the same on both sides: a DPS, a SUPPORT and a TANK, who take turns in order (hero 1, 2, 3, then hero 1 again). There are three buttons, CLUTCH, FEED and TILT, and on beat 4 the button you press is the action the active hero does. Any hero can use any button; there is no pick before and no separate TAP button. The press sets the timing grade and the choice in one move. Removed from the note: the roles on units, the counter loop between them, and each role's own feel. No deep mechanics for now.
- **LEANING** The buttons: CLUTCH hits the enemy's bar, FEED refills your own bar, TILT weakens the enemy's next CLUTCH. The grade (perfect or good) sets how strong the effect is. Numbers not set. Each class has its own version of each button (3 classes x 3 buttons, so a DPS pressing FEED does something different from a SUPPORT pressing FEED). Each button keeps its base job and each class adds one twist:

| | CLUTCH (hit) | FEED (heal) | TILT (weaken) |
|---|---|---|---|
| DPS | big hit | small heal, and your next CLUTCH is stronger | weaken, plus a small hit |
| SUPPORT | small hit, plus a small heal | big heal | weaken, plus your next hero gets half a level |
| TANK | small hit that ignores a weakening on you | medium heal, and it clears a weakening on you | big weaken |

Each class's strongest button is DPS = CLUTCH, SUPPORT = FEED, TANK = TILT. No numbers yet; the table would live in `fight.js` as data. No negative effects on yourself (a miss only does nothing and gives no level).
- **OPEN** The roster, fight length (60 to 90 seconds seems right, not tried), the name and look. (The win condition is in "The fight" below: a bar empties, or the fuller bar wins.)

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
- **BUILT** Runs: the server scores the taps against the hidden beat; the first run of a player's day is sealed (taps and score), later ones are practice. Players are a cookie token (hashed) with save codes and passkeys from the shared Accounts; no names yet. A ledger page lists days and runs and checks the chain in the browser.
- **OPEN** The moon phase as a dial on the beat's feel (sparser and slower toward a new moon, denser and faster toward a full one). It adds no randomness, only a slow arc over the month. Not built; leave out if it makes days feel too different.

## Async and verification

- **DECIDED** You fight a ghost: another player's saved run, like an Aura Farm farm that stands until it is taken. A run saves, for each of that player's turns, which ability they hit and when they tapped. It is sealed on the game's own ledger. The first player of the day fights a bot ghost.
- **DECIDED** Only your own taps are live. On the ghost's turns its saved moves replay; on yours you choose live. The fight is a pure function of both logs, so the server can replay it and get the same result, and async works without anyone online together.
- Costs: the ghost can't react to you; you only get your own result at first; with few players the ghost pool is small (older sealed runs fill it).
- Replay shows a run was possible under the rules, not that a human played it. A script can tap perfectly.
- **OPEN** Latency: browsers and devices differ, so tap times may need a calibration step or a wide grace window. Sound needs a first tap to start.

## The fight: turns, one measure each, over several loops

The owner is also drawing from Osu! Tatakae! Ouendan (DS): the side-versus-side idea and the shared health bar.

Worked out Oct 21 2026 (HST), in the build-order step "the fight simulation". Nothing here is built.

- **DECIDED** The song plays several times per fight (3 or 4 loops). One run of the song is only 15 to 24 seconds (8 measures at 80 to 128 BPM), too short for a fight (60 to 90 seconds). Looping also lets the player learn the song by ear, which fits Rhythm Tengoku and the hidden grid.
- **DECIDED** Turn-based, slow: the measures alternate sides and each measure is one unit's turn. The drums play beats 1 to 3 as the lead-in, and beat 4 is the acting unit's action. Yours are measures 1, 3, 5, 7 of a loop and the ghost's are 2, 4, 6, 8, so each side has 4 turns per loop. The fills (B and C in A A A B | A A A C) land on the ghost's turns.
- **DECIDED** A squad is 3 units. Its turns go unit 1, 2, 3, then unit 1 again in the loop's 4th turn. The turn order continues in the next loop (to be decided: whether it restarts at unit 1 or carries on).
- **DECIDED** The defender taps. On the ghost's turn the ghost's unit winds up and attacks (the existing cue on beat 1, landing on beat 3 or 4: to be decided) and you tap to parry. On your turn the ghost does not act, and your beat-4 tap is your unit's action.
- **DECIDED** You see the ghost's move only when it plays: a cue on beat 1 of its measure (with the ability's icon), landing 2 beats later on beat 3 (the existing wind-up wait), and you parry on the landing beat. The ghost's whole script is not shown ahead of time, and there is no pre-play: you choose only on your own turn.
- **DECIDED** Growth: each hero levels up from its own presses. A perfect gives it 1 level, a good half a level, a miss none. Parries level no one. In a fight of 3 loops each hero acts 4 times, so a level is at most 4. This is how the rhythm and the MOBA part meet. There is no flat bonus per level any more (removed from the plan; `fight.js` still has `LEVEL_BONUS` until the upgrades are coded): the growth is the upgrades below. Depth beyond this (a roster to draft from, items) is not decided.
- **DECIDED** Level-up picks happen in a break of at most 2 measures after loop 1 and after loop 2, always on the beat: the break starts at a measure's end and the song comes back on beat 1. Every whole level a hero earned since the last break is one pick between two upgrades (A or B), the next tier of that hero's class list below; each option upgrades one cell of the 3x3 table; a pick not made in time is filled with A. Nothing pauses and there are no turns in the break, so tap times stay in song time. The picks are saved with the run, so a later player's ghost fights with the same upgrades. The drums keep playing in the break, stripped down (what is left in is not decided: for example only the kick and the snare or clap). Open: what the A and B upgrades are, and how it feels on a phone.
- **LEANING** The upgrade lists, each option upgrading one cell of the 3x3 table (draft wording, no numbers settled; tier 3 is only reachable with near-perfect play):
  - DPS (theme: momentum and burst, upgrades tied to the rhythm): tier 1: A = Combo (each perfect in a row adds 10% to your next CLUTCH; a press that isn't perfect resets it), B = Rush (a press up to 35 ms early still counts as a perfect, and an early perfect hits 25% harder; this widens one hero's window, which the owner's "don't change the timing windows" rule is about for the base game). Tier 2: A = Crit (every 3rd perfect in a row hits double), B = Echo (a perfect CLUTCH hits again at half strength). Tier 3: A = Overdrive (after 3 perfects in a row your next press counts as a perfect and hits 50% harder), B = Burst (a streak of 4 perfects deals 10 damage at once).
  - SUPPORT (theme: steadiness and forgiveness): tier 1: A = Steady (a good press keeps your streak instead of resetting it), B = Wide good (this hero's good window grows by 20 ms). Tier 2: A = Warm-up (each press in a row that isn't a miss adds 10% to your FEED heal), B = Second chance (after a miss, your next press counts as at least a good). Tier 3: A = Pass the beat (a perfect FEED gives your next hero a full level), B = Safety net (after 3 presses in a row that aren't misses, your next miss counts as a good).
  - TANK (theme: defense timing): tier 1: A = Brace (this hero's good window for parries grows by 20 ms), B = Counter (a perfect parry sends 5 damage back). Tier 2: A = Hold the line (one good parry per loop blocks as much as a perfect), B = Early parry (a parry up to 35 ms early counts). Tier 3: A = Wall (after 3 perfect parries in a row, the next enemy hit is fully blocked), B = Sync (a perfect parry gives the TANK half a level).
  - Wide good, Brace, Early parry, Rush widen one hero's window; the owner's "don't change the timing windows" is about the base game (flagged, not confirmed).
- **DECIDED** The hero who just acted also parries: on the ghost's turn right after your turn, the parry is pressed by the hero who acted on your turn, so that hero's parry upgrades apply. (Parries still level no one.)
- **DECIDED** The drums are the shared song and are nobody's attacks.
- **DECIDED** Everything is scored against the same hidden metronome (tap minus target, `score.js`): your action taps, your parries, and the ghost's replayed taps. A sloppy ghost hits for less than a tight one, and your parry is graded against the beat, not against the ghost's own tap time (see "Considered and not used").
- **DECIDED** One health bar per side, shared by its 3 units, like Ouendan's life bar, instead of HP on each unit: the squad's actions lower the other side's bar, and an unparried ghost attack lowers yours. The fight ends when a bar is empty, or the fuller bar wins when the loops end. The units have no HP of their own and act the same way. Not decided: whether the bar also drains a little each turn, as in Ouendan.
- **OPEN** Damage, the bar's size, the roster, whether the same wind-up in the same measure each loop lets parries be memorised, the tap log growing with loops (`MAX_TAPS` in `src/worker.js` was not checked), and device latency calibration.
- Costs: the ghost never reacts to you.

## Considered and not used

- The beat from CLUTCH FEED TILT's ledger, or from one other game's checkpoint (Dawn Baton's lap): the registry head covers every game.
- A conductor lane UI with approach rings: the shared beat replaces it, so the units are the notes.
- Scoring a parry against the ghost's own saved tap time instead of the metronome: it is possible (both are ms from the song's start in the same timeline), but a defender cannot react to a 30 ms deviation, so it punishes the sloppiness of the ghost, not the defender.
- A card version ("Hand of 6"): too similar to Aura Farm's FARM.

## Build order

1. BUILT The ledger and the day's seal (v0.1, v0.2).
2. BUILT The beat from the hash (v0.3).
3. Next: the fight simulation (turns, one bar per side, three abilities), then tapping and scoring from the tap log, then the game's checkpoint to the registry.
