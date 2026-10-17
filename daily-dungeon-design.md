# Daily Digital Demon Dungeon: design

As of **v1.14** (Oct 17 2026). The previous, much longer version of this file is in git history.

**What this is.** What the game is for and how it plays, in plain words. It does not repeat exact numbers: those live in `rules.js` and `floor.js`, and when the doc and the code disagree, the code is right and the doc is wrong. Per-release detail is in `CHANGELOG.md` (this repo). Unbuilt ideas are in `theorycrafting-notes.md` and `daily-dungeon-heat-notes.md`. Voice rules are in `voice-guide.md`.

**Tags.** BUILT is in the game. PARKED is built but switched off. DECIDED is agreed but not built. LEANING means a direction, not a decision. OPEN means undecided.

---

## 1. The game

KURA wakes in a pit four levels deep: B4F at the bottom, then B3F, B2F, B1F, then the surface (1F). There is no ceiling; looking up shows the real night sky and the real moon.

The clock is the lunar month. It is cut into four quarters, each level belongs to one quarter, and the dark takes a level when the real quarter moon arrives (about 7.4 days apart). Not being on the next level by then ends the run. The goal for now is to **survive one cycle** (about four weeks). What happens past the surface is OPEN (section 15).

One key a day. Everyone playing in a quarter is on the same level with the same rooms, but which door is which is private to each player. The game shows how many others are down there, never who.

The party is KURA plus up to three others. It starts with ELF, PIXIE and CU SITH. Demons can join when there is room.

## 2. Principles

These are the rules you have set. Check new ideas against them.

- **Shared clock, private contents.** The level and the day's offers are the same for everyone. What is behind a door, where things hide and every roll are private.
- **Never sad.** The player should never feel sad or like they made a bad choice. Rooms are different, not better or worse. Bad outcomes come from not listening to clues, not from the choice itself. A gamble that misses gives nothing and never costs anything.
- **Good against good.** Choices pair two good things (WORD offers, party questions, the moon's offers). Never YES/NO, never one clearly lower. Nothing negative or fighting between party members.
- **What a room turns out to be is random.** It does not lean to help the party.
- **Everything is in the game.** No browser dialogs. Anything significant is a popup the player clicks through. Ask before adding a popup, an input window or an animation. No text glow, ever.
- **No friction at the start.** No name entry (a run gets a funny placeholder; the name is typed when posting). No accounts needed to play.
- **Anonymous.** Fixed phrases, never free text. Counts of others, never who.
- **Every line must be spoken by someone clear.** Line 1 of the log is flavor, line 3 is status. A period in typed text is a full one-second stop.
- **The test for every system and line:** does it change what the player does next?

## 3. A day of play

**The key.** One a day. It is spent by unlocking a locked door or by going on STANDBY (resting). Unlocking only opens the door; she walks in when the player chooses, and open doors stay open and free to walk. Everything else is free of the key.

**Breath.** What limits the pace inside a day. Eight breaths, back in real time (about 20 seconds from empty, a second or two from a small dip). A search costs 1. Looking up at the moon costs 1. Using a bag item costs 1. An AURA read of a room or door costs half the bar. A WORD with the party costs half a breath, and a step into another room a quarter. Turning, unlocking and fighting are free. At zero she can't search, use an item or step (running from a demon is never refused). Pressing on while out of breath makes the wait a little longer.

**STANDBY.** Spends the key without moving (not with a demon in the room). The next dawn the party is restored, taint and the room's heat are cleared, and camp jobs run (section 9).

**Overnight, for everyone.** Heat in every room halves, taint drops by 1, patience comes back, a little HP heals, party members go out and find things, the bonus-room roll is made, and the level deadline is checked.

**Controls.** Under the view: `[ ^ ]` walks through the door she faces (at a bare wall it searches) and `[ < ] N [ > ]` turn. The bar is `[W]ORD [A]URA [I]NVOKE [S]EARCH [M]OON`. In a fight it is `[F]IGHT [W]ORD [A]URA [R]UN`.

**The three log lines.** Line 1 is flavor (the place, the party, a demon's words). Line 2 is what KURA just did. Line 3 is a status line typed out as if at a terminal. A search plays out slowly: dots first, then the result typed in a color for what it is. A good find waits longer, and the party reacts before it appears, so the reaction is the tell.

## 4. The level

**Wings.** A level is a run of wings, one per day. Every wing is three spaces: the room entered, a passage and a dead end. Every wing but the last hangs two locked doors, each leading to a different kind of room. Unlocking one seals the other for good. The last wing has one door (a wildcard kind) and hides the stairs up.

**The deck.** The six room kinds are shuffled and dealt two at a time, one pair per wing. Everyone on a level sees the same pair. Which kind is behind which door is private.

**Room kinds.** Each hides a fixture behind one wall, found by searching, usable once a day.

| Kind | What it does |
|---|---|
| Den | Heats the room: more demons, a bit of risk |
| Bay | A safe room (no encounters); its fixture heals the party |
| Relay | Gives a clue naming the wing's other offered kind |
| Vault | SILVER |
| Forge | Clears taint |
| Altar | No fixture. A terminal that takes an offering |

Room kinds are never named on screen. Each room gets a flavor name (Soft room, Walkway, and so on).

**The dead end is a signal room.** It has a small gift box (found by searching: take what the last visitor left and leave something small, COMMON or UNCOMMON, in its place) and scratch marks showing how many others took each of the wing's two doors, never which is which. This is the main multiplayer touchpoint and the one you've said to develop further.

**The Archive and the Void.** A rare bonus room (items and silver, no demons) and its opposite (demons only). They come from a private daily roll, or are guaranteed by an omen streak (section 10). Never in a dead end or the stairs wing.

**The lure locker.** About 60% of levels hide a locker in a wing's dead end, usually a RARE item and sometimes a MYTHIC, and at the full moon half the time a MOON item.

**Door clues.** A locked door sometimes gives a hint of what is behind it (warm, soft, cold) when searched. AURA on a door always gives a hunch.

**Minimap.** One character per room. Each player's is rotated or mirrored privately, so "the east door" means nothing to someone else.

## 5. Searching and heat

Searching works like NetHack: each hidden thing needs a few search points, and each search adds up to about 2, scaled by the day's omen, how hot the room is (calm rooms yield more), a rested-day bonus and the fullness of the moon. Finding more on one wall gets harder. Some rooms hide a much deeper MYTHIC find.

**Heat** is per room. Each search warms it. The hotter it is, the likelier a demon comes: about 1 search in 24 when cold up to about 1 in 4 at the hottest, scaled by the moon. Bays and passages never get encounters. A demon dying, being recruited, leaving, or KURA running past it cools the room by a third. Heat halves overnight.

The player sees heat only after an AURA read of the room: the map brackets turn from pale yellow to red for a while. A room first reaching tier 2 heat (12 or more) is the only thing that wears the party's patience.

**Safe or gamble** (BUILT). Sometimes a sure small thing is offered next to a bigger one that only lands part of the time: in a hot room, at a worn wall, on demon offers (by personality), and from the moon on fuller nights. A miss gives nothing and says something silly.

## 6. Demons and fights

**Who appears** depends on how deep the run is: data and hardware demons early, hybrids in the middle, folklore deep. Programs (friendly software) turn up now and then, and a few named uniques exist. Late in a level's week some demons come corrupted (glitched name, forced CHAOS, tougher); talking one down restores it.

**FIGHT.** Each standing member hits, the party's total comes off the demon, and the demon hits back (at KURA four times in ten). KURA at 0 HP ends the run. The moon changes damage: demons hit hardest at the full moon.

**WORD with a demon.** A conversation. A demon that listens might join, leave in peace (sometimes with a gift), offer two things from its pockets (take one), or notice a good item in the bag. One that doesn't listen may get angry. An angry demon can be calmed by a good item. Demons listen most at the new moon and least at the full. Programs always listen.

**AURA in a fight** reads the demon (how loud it is, what it carries) in KURA's voice and is free.

**RUN.** About even odds that the demon blocks the way. A blocked run costs only the demon's blow, and a locked door takes the key only if she gets through.

**Rewards.** A beaten demon gives ICHOR and one or two things from its own pockets (3 to 5 things, filled the first time it is seen). No SILVER and no moon things.

Difficulty follows how far into the run she is, not the level's name.

## 7. The party

**WORD with a member** costs half a breath. A member is picked (leaning toward whoever is low on patience or hasn't been talked to). Over a day the yield falls with each WORD, then they are talked out. What can happen, in order: a check-in for someone low on patience; a truce between a LAW and CHAOS member; an offer (never on the first WORD with a member, rarer after); a confidence; or banter, sometimes a small heal. Now and then two members talk and KURA listens, and after a good many talks a member asks a question with two good answers.

**Offers** are always two things from the member's own pockets (or one asked for from your bag), one taken. A full bag makes it a swap. Some are wrapped, a gamble that is the real thing about half the time. Members refill their pockets a little each night.

**Patience** is the party's mood, not a fuse. It sits at 5 each dawn and WORD can lift it to 7. The only thing that wears it is a room first reaching tier 2 heat (each demon member loses 1). At zero a member goes quiet and content. Nobody snaps, strikes or leaves.

**Recruiting.** Through WORD. Programs join more readily. CHAOS or HAUGHTY demons never take the plain "join." A full party offers a swap.

## 8. Alignment and aura

**Alignment** is one hidden score from -6 (LAW) to +6 (CHAOS). Choices nudge it: patient searching a little toward LAW, searching a hot room, fighting and running toward CHAOS, talking and restoring toward LAW, recruiting toward the demon's side. Early choices count more than later ones. The tag shows as the *natural half* (KPT, STR, FRL for LAW, NEUTRAL, CHAOS) and flips at thresholds so it doesn't flicker.

**Names.** Everything has a two-word name: a machine half (SIGNAL, HUM, STATIC) and a natural half (KEPT, STRAY, FERAL). Data and tech things are the machine half, folklore and spirit things the natural half, and hybrids take both.

**Aura.** KURA's aura is her lean plus the alignment and tier of what is in her bag. The total sets a loudness: QUIET, NOTICED or LOUD. Louder auras draw demons more often and toward the loudest side, and raise the moon's answer odds. AURA is the verb that reads all of this: out of a fight it reads a room or a door, in a fight a demon.

## 9. Items

**Tiers** are COMMON, UNCOMMON, RARE, MYTHIC and MOON. The shared item list (dungeon-items) also knows prototype, relic and ultra, but 4Dungeon never deals those. Every item has an alignment and a nature, but only RARE and above move KURA's own lean when found. Offering any item at the altar does.

**The bag** holds 9. A tenth asks what to leave. INVOKE lists the bag and ICHOR. A few UNCOMMON items have uses (a heal, a revive, a candle that cools a room). Most items have no use, and fiddling with one reveals something about it after enough tries ("Something rattles inside"), and a few break.

**ICHOR** heals fallen members (and standing ones less). KURA can drink it, which adds taint: at 3 she starts seeing things, at 6 she trips for 50 to 100 actions (melee doubled, risk of hitting an ally, the turn counter lies). Taint drops by 1 a night or clears at a Forge or after STANDBY.

**The altar** takes one offering a day per room: an item (or SILVER). The result depends on the item's alignment, and gives a boon: the wing's door clue (LAW), breath refill and a heal (CHAOS), or a few breaths otherwise.

**Camp jobs.** On a STANDBY night, if the right program is in the party: COMPILER turns two COMMON items into an UNCOMMON, CACHE duplicates a COMMON.

**Shared items (v1.14).** The item list comes from the shared dungeon-items table, and finds are queued as numbered registry copies. The page has an INVENTORY screen for sending copies home to 88x31. This is display only: the run's bag is not tied to the registry, and visiting items do nothing in play yet.

## 10. The moon and the omens

**Phases.** Eight, from the real synodic month. The moon changes how often demons come (0.8x at new, 1.25x at full), how hard they hit, how willing they are to listen (best at new, worst at full), the odds of a bonus room, and how fragile spirit items are.

**[M]OON.** Looking up shows the real sky above her (named bright stars, the moon where she really is) and costs a breath. The first look of a night may bring an offer from the moon: a pair of good things, take one, now or never. Odds go from none at the new moon to 85% at the full (higher with a LOUD aura). Later looks get a word and then quiet. When the real moon is below the horizon she says so.

**Omens.** One per real day, the same for everyone, never rerolled. About half the days are ordinary. The rest are one of eight: more data demons, more folklore demons, double heat, harder finds, easier finds, easier talk, half heat, three times the rare chance. Six of the eight lean LAW or CHAOS, three each. **Streaks:** three days running with the same lean guarantees a room that day (LAW an Archive, CHAOS the Void). Each side comes about once every 190 days. The second day of a matching run reads "The pattern is repeating."

## 11. Runs and scoring

A run starts KURA at 30 HP, level 1, alignment NEUTRAL, with a small kit. It wakes on the level the dark has reached; if fewer than two days of the quarter are left, one level higher with a whole quarter ahead.

Climbing is always to the next quarter's level, so leaving early banks the rest of the current one. From B1F she climbs out to 1F and the run goes on upward, quarter by quarter. Nothing ends at the surface yet.

**Score** is levels climbed, then real days survived, then earliest post. Turns are shown but never ranked. Posting needs an ended run and a name of 3 to 10 characters, once per run. Scores can't be proven (the free server plan can't replay a run), so the board is for fun.

## 12. The shared world

- **Presence** BUILT. Counts of others on the level and in the pit, now and today. Never who.
- **Events and rumors** BUILT. Fixed moments post anonymous news, and the title screen turns them into vague rumors.
- **Bots** BUILT. Ten scripted players take a turn each day through the real rules, and are hidden from the board (names end in `-bot`).
- **Faction seasons** BUILT. Each ended run adds its level to its final side for the lunar month, and NEUTRAL runs go to the side that is behind. Cosmetic only, and forgeable.
- **Gift box and door tallies** BUILT (section 4).
- **Accounts** BUILT (v1.13). One account (save codes and passkeys) covers 4Dungeon, 88x31, irl-dungeon and dawn-baton.
- **Bones, ghost demons, route traces, shared wards** DECIDED to be considered, not built. House rule under discussion: anything visible to other players is flavor only, never mechanical.

## 13. Title and typed line

The title shows the moon header, a wordmark, a line of the quarter's days, six rows of rumor and number cards, and `[N]EW RUN [C]ONTINUE [B]OARD [?] ABOUT`. A card shows only when its number is above zero. The `[?]` page says what the game is and leaves the rest to find out. The typed line (line 3) carries status in sentences, about two lines about this run for every one about everyone else.

## 14. Parked

Built and switched off. Details are in the changelog.

- **The exchange** (player market for RARE and up, stash, offers by code), `EXCHANGE_ON = false` since v1.04 (built v1.00 to v1.01). Parked as too complicated for too little reason; the gift box replaced it.
- **Hold Omen** (bank a STANDBY night's omen), hidden in the page.
- **Disguises**, `DISGUISE_ON = false`.
- **Painted (false) doors**, `PAINTED_DOORS = false`.
- **Dissonance and the old patience costs** (snapping, leaving, the last-chance question), unreachable since v1.12.

## 15. Decided, not built

- **Getting out is a finish.** Reaching the surface completes the monthly climb. Two boards: this moon (who got out and how fast, resetting each month) and all time.
- **WORD as a real decision.** Party members offer a pair of good things by personality (the gruff one breath or healing, the dreamy one an item or a lean). The first TALK of the day becomes a pick by personality.
- **AURA reads places and demons only.** The door hunch folds into searching a locked door.
- **The gift box carries the left item's alignment**, so the next player gets a hint of who was there (from the heat notes).
- **Glitch mechanic** (the 3D view glitches, then the UI, tied to data monsters turning CHAOS): low priority, maybe only at higher levels.
- **Heat on the minimap** as wavy walls (leaning), and cracks or scratches in the 3D art (later).

## 16. Systems under review

Redesigning the systems is the top priority, and balance comes after it. These are your statements from Oct 17:

- The game feels like it has **no tension or stakes**.
- The **goal at the top is fuzzy**; the main goal for now is survive one cycle.
- **Playing on a phone is awkward** for both 4Dungeon and irl-dungeon.

**What each system gives the player today.** The test is the question in section 2: does it change what they do next?

| System | What exists | Concern |
|---|---|---|
| SILVER | Found in walls, the vault fixture and the lure locker | Its only use is offering it at the altar |
| ICHOR | From demon wins, heals members, drinking it causes taint and tripping | You report it goes unused |
| Taint and TRIP | Comes only from drinking ICHOR | Depends on ICHOR being used |
| Heat | More demons, worse yields, cooled by a third when a demon is dealt with, shown only after AURA | Overlaps breath. The bots' first day (Oct 11) suggested breath, not heat, is what limits searching |
| Breath | Caps the pace | Does many jobs |
| Patience | WORD raises it, heat tier 2 lowers it, nothing happens at zero | Almost no stakes left |
| Alignment | Hidden score, shapes demons and truces | Few visible consequences |
| SEARCH, AURA, WORD, MOON | Four verbs that all spend breath and give a line of text | They overlap |
| Faction seasons | Cosmetic tally | Forgeable, with no reward |

**Floated, not decided.** These came up in conversation and are proposals, not agreed.

- *Stakes without sadness.* Stakes could come from what the run has built up (the party, what she carries, the run's history), so there is something to lose that isn't a penalty. The month-long clock already does part of this.
- *The moon as the one dial every system reads.* Mentioned as a direction, nothing decided.
- *A phone screen budget.* About 60 columns by 20 rows, with a bar of thumb buttons under the screen. 4Dungeon's view and a stacked panel layout would need a separate phone mode, and irl-dungeon may want its own "glance" screen. Landscape may fit the current 80 columns.
- *Wall-read heat, the moon's real position mattering to [M]OON, bright stars with alignment.* From the heat notes, each with open questions (the sky depends on where the player is, so a fixed sky would be needed).

**Open.** What is at the top. How much heat is danger and how much is reward. Whether looking up costs a breath when the moon has set. Whether the exchange or a lighter form of it ever returns. The wording of rumors and KURA's last words. Whether Hold Omen returns.
