# Daily Digital Demon Dungeon: design

As of **v1.27.1** (Oct 17 2026), with the gate review of Oct 18 in section 16. Earlier versions of this file are in git history.

Sections 17 and 18 are the former `theorycrafting-notes.md` (v11, Oct 17) and `daily-dungeon-heat-notes.md` (Oct 15), moved here on Oct 23 2026 with their text unchanged except heading levels. The originals are in `archive/`.

**What this is.** What the game is for and how it plays, in plain words. It does not repeat exact numbers: those live in `rules.js` and `floor.js`, and when the doc and the code disagree, the code is right and the doc is wrong. Per-release detail is in `CHANGELOG.md` (this repo). Unbuilt ideas are in sections 17 (theorycrafting) and 18 (heat, verbs and patience) of this file; the move to the server is in `4dungeon-server-move.md`. Voice rules are in `voice-guide.md`.

**Tags.** BUILT is in the game. PARKED is built but switched off. DECIDED is agreed but not built. LEANING means a direction, not a decision. OPEN means undecided.

---

## 1. The game

KURA wakes in a pit four levels deep: B4F at the bottom, then B3F, B2F, B1F, then the surface (1F). There is no ceiling; looking up shows the real night sky and the real moon.

The clock is the lunar month. It is cut into four quarters, each level belongs to one quarter, and the dark takes a level when the real quarter moon arrives (about 7.4 days apart). Not being on the next level by then ends the run. The goal for now is to **survive one cycle** (about four weeks). What happens past the surface is OPEN, and the owner doesn't want to think about it yet.

One key a day. Everyone playing in a quarter is on the same level with the same rooms, but which door is which is private to each player. The game shows how many others are down there, never who.

The party is KURA plus up to three others. It starts with ELF, PIXIE and CU SITH. Demons can join when there is room.

**Where it runs** (BUILT, v1.19 to v1.24). At dungeon.88x31.app the server keeps each player's run and plays every move with the same rules the page has; the page only draws. The page is never sent the run's secrets (the seeds, what is behind each door, what each wall hides). Anywhere else (itch.io, a file) the page plays the run by itself, as it always did. A run on the server can't be changed from the browser.

## 2. Principles

These are the rules you have set. Check new ideas against them.

- **Shared clock, private contents.** The level and the day's offers are the same for everyone. What is behind a door, where things hide and every roll are private.
- **Never sad.** The player should never feel sad or like they made a bad choice. Rooms are different, not better or worse. Bad outcomes come from not listening to clues, not from the choice itself. A gamble that misses gives nothing and never costs anything.
- **Good against good.** Choices pair two good things (offers, party questions). Never YES/NO, never one clearly lower. Nothing negative or fighting between party members.
- **What a room turns out to be is random.** It does not lean to help the party.
- **Everything is in the game.** No browser dialogs. Anything significant is a popup the player clicks through. Ask before adding a popup, an input window or an animation. No text glow, ever.
- **No friction at the start.** No name entry (a run gets a funny placeholder; the name is typed when posting). No account needed to play: the first NEW RUN makes a guest.
- **Anonymous.** Fixed phrases, never free text. Counts of others, never who.
- **Every line must be spoken by someone clear.** Line 1 of the log is flavor, line 3 is status. A period in typed text is a full one-second stop.
- **The test for every system and line:** does it change what the player does next?
- **A new system comes with a cut list** (Oct 17): what it replaces, and what is deleted the same day. If that list can't be written, it is just another system. The gate in section 16 adds two questions to this: what the new thing touches, and whether it would still be wanted in four weeks.

## 3. A day of play

**The key.** One a day, spent by unlocking a locked door. Unlocking only opens the door; she walks in when the player chooses, and open doors stay open and free to walk. Everything else is free of the key. (STANDBY, which spent the key on resting, was removed in v1.16.)

**Breath.** What limits the pace inside a day: eight breaths, coming back in real time. A search, a look at the moon and using a bag item cost 1; a TALK with the party half; a step a quarter; alone, TALK's room or door read costs half the bar. Turning, unlocking and fighting are free. **On the server breath is off (always full) until it is retuned for the new feel** (owner's call, Oct 17).

**Overnight, for everyone.** Heat in every room halves, taint (DRUNK) drops, a little HP heals, party members go out and find things, program members do their camp jobs, the bonus-room roll is made, and the level deadline is checked.

**Controls.** Under the view: `[ ^ ]` walks through the door she faces (at a bare wall it searches) and `[ < ] N [ > ]` turn. The bar is `[T]ALK [I]NVOKE [S]EARCH [M]OON`. In a fight it is `[F]IGHT [T]ALK [R]UN`. At the stairs, numbers pick up to two things, S or Enter shows them, and Esc steps back (v1.26). A left or right tap made while the server is answering is kept and played after it (v1.27.1).

**The three log lines.** Line 1 is flavor (the place, the party, a demon's words). Line 2 is what KURA just did. Line 3 is a status line typed out as if at a terminal. A search plays out slowly: dots first, then the result typed in a color for what it is. A good find waits longer, and the party reacts before it appears, so the reaction is the tell. (On the server the search is asked for when the dots start, so the wait hides inside them.)

## 4. The level

**Wings.** A level is a run of wings, one per day. Every wing is three spaces: the room entered, a passage and a dead end. Every wing but the last hangs two locked doors, each leading to a different kind of room. Unlocking one seals the other for good. The last wing has one door (a wildcard kind) and holds the stairs up. The stairs are found on entering their room (no searching since v1.26); stepping onto them opens the offering to the Moon (section 15).

**The deck.** The six room kinds are shuffled and dealt two at a time, one pair per wing. Everyone on a level sees the same pair. Which kind is behind which door is private.

**Room kinds.** Each hides a fixture behind one wall, found by searching, usable once a day.

| Kind | What it does |
|---|---|
| Den | Heats the room: more demons, a bit of risk |
| Bay | A safe room (no encounters); its fixture heals the party |
| Relay | Gives a clue naming the wing's other offered kind |
| Vault | SILVER |
| Forge | Clears taint (DRUNK) |
| Altar | No fixture. A terminal set in a wall, only drawn (it takes nothing and answers nothing) |

Room kinds are never named on screen. Each room gets a flavor name (Soft room, Walkway, and so on).

**The dead end is a signal room.** It has a small gift box (found by searching: take what the last visitor left and leave something small, COMMON or UNCOMMON, in its place) and scratch marks showing how many others took each of the wing's two doors, never which is which. This is the main multiplayer touchpoint and the one you've said to develop further.

**The Archive and the Void.** A rare bonus room (items and silver, no demons) and its opposite (demons only). They come from a private daily roll, or are guaranteed by an omen streak (section 10). Never in a dead end or the stairs wing.

**The lure locker.** About 60% of levels hide a locker in a wing's dead end, usually a RARE item and sometimes a MYTHIC, and at the full moon half the time a MOON item.

**Door clues.** A locked door sometimes gives a hint of what is behind it (warm, soft, cold) when searched. TALK alone at a door gives a hunch.

**Minimap.** One character per room. Each player's is rotated or mirrored privately, so "the east door" means nothing to someone else. After an AURA read the room brackets show heat, pale yellow to red, for a while.

## 5. Searching and heat

Searching works like NetHack: each hidden thing needs a few search points, and each search adds up to about 2, scaled by the day's omen, how hot the room is (calm rooms yield more) and the fullness of the moon. Every room hides 1 to 3 items (half the rooms 1, 35 in 100 two, 15 in 100 three), on top of whatever demons and coins it hides, spread over its walls. Finding more on one wall gets harder. Some rooms hide a much deeper MYTHIC find.

**Heat** is per room. Each search warms it. The hotter it is, the likelier a demon comes: about 1 search in 24 when cold up to about 1 in 4 at the hottest, scaled by the moon and KURA's loudness. Bays and passages never get encounters. A demon dying, being recruited, leaving, or KURA running past it cools the room by a third. Heat halves overnight. A room crossing tier 2 heat makes the demon members go quiet for the day (VIBES, section 7).

**Safe or gamble** (BUILT). Sometimes a sure small thing is offered next to a bigger one that only lands part of the time: in a hot room, at a worn wall, on demon and party offers (wrapped gifts, by personality), and from the moon on fuller nights. A miss gives nothing and says something silly.

## 6. Demons and fights

**Who appears** depends on how deep the run is: data and hardware demons early, hybrids in the middle, folklore deep. Programs (friendly software) turn up now and then, and a few named uniques exist. Late in a level's week some demons come corrupted (glitched name, forced CHAOS, tougher); talking one down restores it.

**FIGHT.** Each standing member hits, the party's total comes off the demon, and the demon hits back (at KURA four times in ten). KURA at 0 HP ends the run. The moon changes damage: demons hit hardest at the full moon.

**TALK with a demon.** A conversation. A demon that listens might join, leave in peace (sometimes leaving ICHOR, sometimes a gift), offer two things from its pockets (take one), or notice a good item in the bag. One that doesn't listen may get angry. An angry demon can be calmed by a good item. Demons listen most at the new moon and least at the full. Programs always listen. The first TALK of a fight also says how the demon comes off (its alignment).

**RUN.** About even odds that the demon blocks the way. A blocked run costs only the demon's blow, and a locked door takes the key only if she gets through.

**Rewards.** A beaten demon fills the ICHOR flask and gives one or two things from its own pockets (3 to 5 things, filled the first time it is seen). No SILVER and no moon things.

Difficulty follows how far into the run she is, not the level's name. Demons and the party sometimes remark on what KURA has done lately (her tags, section 8).

## 7. The party

**TALK with a member** (was WORD until v1.15) costs half a breath. A member is picked (leaning toward whoever is quiet or hasn't been talked to). Over a day the yield falls with each TALK (16 a day with one member), then they are talked out. What can happen: a check-in for a quiet member; a truce between a LAW and CHAOS member; an offer (never on the first TALK with a member, rarer after); a confidence; or banter, sometimes a small heal. Now and then two members talk and KURA listens. With nobody standing beside her, TALK is KURA reading the room or the door she faces.

**Offers** are always two things from the member's own pockets (or one asked for from your bag), one taken. Some are wrapped, a gamble that is the real thing about half the time. Members refill their pockets a little each night.

**VIBES** (was patience until v1.15) is the party's mood, and it only grows: talks, questions and confiding raise it, nothing lowers it. A room crossing tier 3 heat (the hottest) makes demon members go quiet (the old tired lines) for the rest of the day; a night's sleep or a check-in TALK brings them back. Nobody snaps, strikes or leaves.

**Recruiting.** Through TALK. Programs join more readily. CHAOS or HAUGHTY demons never take the plain "join." A full party offers a swap.

## 8. Alignment and aura

**Tags** (v1.15). KURA's choices that matter (fighting, killing, giving, restoring, breaking things, running) leave a tag; she keeps her last six. Tags pull toward LAW or CHAOS, and her colour drifts back when she acts differently. Tiny nudges (a search) leave none. Flip lines and the "something is pulling at you" tell still fire.

**Names.** Everything has a two-word name: a machine half (SIGNAL, HUM, STATIC) and a natural half (KEPT, STRAY, FERAL). Data and tech things are the machine half, folklore and spirit things the natural half, and hybrids take both.

**Aura.** KURA's aura is a volume and a colour, hidden. Volume: KURA, each standing member, the things in her bag by tier, and half the room's heat. Colour: the biggest pile of LAW, NEUTRAL or CHAOS among her tags, her party and her things. Volume sets a loudness: QUIET, NOTICED or LOUD. Louder auras draw demons more often and toward the loudest side, and raise the moon's answer odds. The AURA button is gone (v1.15); reading the air is part of TALK.

## 9. Items

**Tiers** are COMMON, UNCOMMON, RARE, MYTHIC and MOON. The shared ladder across the games is common, uncommon, rare, prototype, relic, ultra (1-of-1), plus moon; 4Dungeon's six old MYTHIC items keep their name (forward only), new top-tier dungeon items will be relics, and 4Dungeon never deals prototype or ultra (88x31 is their home game). Every item has an alignment and a nature. **Marks** (v1.25 to v1.27): each numbered copy remembers what happened to it: the moon phase it came under, how it was got (found in a wall, from a demon, a friend's gift, from a stranger), the levels it was carried up, and real-sky occasions (section 10). INVOKE shows them under the description. The Moon can **bless** a copy, which counts it one tier higher for aura, the altar and breaking (not yet for demon taste or the box-gift check).

**The bag** has no limit (v1.37; it held 9 before). INVOKE lists the bag, the ICHOR flask and SILVER. A few UNCOMMON items have uses (a heal, a revive, a candle that cools a room). Most items have no use, and fiddling with one reveals something about it after enough tries ("Something rattles inside"), and a few break.

**ICHOR** (v1.16) is a flask KURA always carries, holding a fixed amount. It fills from a fallen demon and from a demon that parts in peace, and the party drinks from it to heal. KURA can drink it herself, which makes her DRUNK (was "taint"): at 3 she starts seeing things, at 6 she trips for a while (melee doubled, risk of hitting an ally, the turn counter lies). It wears off overnight, at a Forge, or with SILVER.

**SILVER** (v1.16) is found in walls, the vault fixture and the lure locker. Spent from the bag, it cools the room to nothing and clears what clouds KURA (DRUNK, and quiet members); its price goes up with the level.

**The altar room** (Oct 20) is empty for now: its terminal is drawn on one wall but takes no offering, and its wall is searched like any other. The offering (an item or SILVER for a lean shift and a boon) is gone. More room types are planned later.

**Camp jobs.** Every night, if the right program is in the party: COMPILER turns two COMMON items into an UNCOMMON, CACHE duplicates a COMMON.

**Shared items** (v1.14 to v1.23). The item list comes from the shared dungeon-items table. **Every find in the bag is its own numbered copy** in the shared registry from the moment she picks it up (v1.23, kept by the server in the run); when it leaves for good (used up, broken, given, left behind) that exact copy is used up there. A thing handed to a party member keeps its copy and marks (v1.27); handed to a demon, it is still used up. MAIL (in INVOKE) lists the copies you hold and sends them home to your 88x31; 88x31 buttons you send here arrive in the bag as **visitors**, which can't be broken or offered, can be asked for, and always come back. Visiting items do nothing special in play yet.

## 10. The moon and the omens

**Phases.** Eight, from the real synodic month. The moon changes how often demons come (0.8x at new, 1.25x at full), how hard they hit, how willing they are to listen (best at new, worst at full), the odds of a bonus room, and how fragile spirit items are.

**[M]OON.** Looking up shows the real sky above her (named bright stars, the moon where she really is) and costs a breath. Every look with the moon up says her wish for the quarter, plainly (section 15). Her old offers of two things were removed in v1.26. When she has set, or there is no level, she only chatters, and when the real moon is below the horizon she says so.

**Omens.** One per real day, the same for everyone, never rerolled. About half the days are ordinary. The rest are one of eight: more data demons, more folklore demons, double heat, harder finds, easier finds, easier talk, half heat, three times the rare chance. Six of the eight lean LAW or CHAOS, three each. **Streaks:** three days running with the same lean guarantees a room that day (LAW an Archive, CHAOS the Void). The second day of a matching run reads "The pattern is repeating."

**Occasions** (v1.27). Some real-sky days leave a mark on whatever is found that day: a blue moon, a supermoon, the Thirteenth Moon, a real eclipse (a table to 2040), an equinox or solstice, a mirror day (month equals day). They are marks only, not a new system. INVOKE's first line names the rarest one that fits.

## 11. Runs and scoring

A run starts KURA at 30 HP, level 1, with a small kit. It wakes on the level the dark has reached, however late in the quarter; a late start gets a shorter floor, one wing for each day left (a floor can be 1 to 7 days).

Climbing is always to the next quarter's level, so leaving early banks the rest of the current one. It is done at the stairs by showing the Moon up to two things (v1.26); anything passes, and the only way to fail is not making it out before the dark rises. From B1F she climbs out to 1F and the run goes on upward, quarter by quarter. Nothing ends at the surface yet.

**Score** is levels climbed, then real days survived, then earliest post. Turns are shown but never ranked. Posting needs an ended run and a name of 3 to 10 characters, once per run. The page still posts the score itself; with the run now on the server, a posted score can be checked against the real run (not built yet).

## 12. The shared world

- **Presence** BUILT. Counts of others on the level and in the pit, now and today. Never who.
- **Events and rumors** BUILT. Fixed moments post anonymous news (sent by the server since v1.22), and the title screen turns them into vague rumors.
- **Bots** BUILT. Ten scripted players take a turn each day through the rules, and are hidden from the board (names end in `-bot`). They still play their pinned builds locally; the owner may stop or rerun them.
- **Faction seasons** BUILT, **DECIDED to cut** (Oct 17): cosmetic, forgeable, unrewarded. How pleased the moon is could become the monthly tally instead (section 15).
- **Gift box and door tallies** BUILT (section 4).
- **Accounts** BUILT (v1.13). One account (save codes and passkeys) covers 4Dungeon, 88x31, irl-dungeon, scoundrel.exe and dawn-baton. Admin is a flag on the player (`players.admin`), not a key.
- **Bones, ghost demons, route traces, shared wards** DECIDED to be considered, not built. House rule under discussion: anything visible to other players is flavor only, never mechanical.

## 13. Title and typed line

The title shows the moon header, a wordmark, a line of the quarter's days, six rows of rumor and number cards, and `[N]EW RUN [C]ONTINUE [B]OARD [?] ABOUT`. CONTINUE shows only when there is a run to go back to. A card shows only when its number is above zero. The `[?]` page says what the game is and leaves the rest to find out. The typed line (line 3) carries status in sentences, about two lines about this run for every one about everyone else.

## 14. Parked and removed

Built and switched off, or taken out. Details are in the changelog.

- **The exchange** (player market for RARE and up), `EXCHANGE_ON = false` since v1.04. Parked as too complicated for too little reason; the gift box replaced it.
- **Hold Omen** (bank a night's omen), dormant code behind `HOLD_OMEN_ON = false`; nothing reaches it since STANDBY went.
- **Disguises**, `DISGUISE_ON = false`. **Painted (false) doors**, `PAINTED_DOORS = false`.
- **Removed:** STANDBY and its camp (v1.16), the AURA button (v1.15), patience wear and snapping (v1.12, v1.15), the lean score (v1.15, replaced by tags), the cloud save and run codes (v1.18, v1.21: the run lives on the server), the moon's offers of two things and the stairs search (v1.26: the wish and the offering replace them).

## 15. The direction (Oct 17)

The owner's own diagnosis: systems keep getting built without meaning or purpose; items are meaningless; the game has no tension or stakes; the four-week goal is the only pressure. What came out of the conversation:

- **Provenance** DECIDED ("provenance is in"). Every copy remembers what it has been through: where it was found and under which moon, who carried it, what it was given for, what it survived. It lives in the shared registry, so the story follows the copy into any game. It is the same idea as KURA's tags, used on things. The groundwork is built (v1.23: each bag item is a specific copy). Shown to the player; never names other players. What a run's marks can claim is only as true as the server says, which is now the case.
- **What does the Moon want?** LEANING. The sealed stairs become the moon's judgment: each quarter she wants something, and the player has to work out what and appease her. Her wish is phrased in histories, not items ("something that has seen a full moon", "something given, not found", "something carried up from below", "something a demon held"), so the player has to *make* the answer by carrying things through the right moments. [M]OON becomes how you learn it (cryptic when she's dim, nearly plain when she's bright). She can be pleased in degrees, never failed. This would replace finding hidden stairs by searching.
- **Her wish is personal** LEANING ("shared clock, private contents"), from a **shared vocabulary of histories** LEANING, so a storied item someone leaves in a gift box can be exactly what a stranger's moon wants.
- **Walls as the space** LEANING. A day in a small space should be full: walls have depth, and hold traces (old marks) that hint at the moon's wish.
- **The game becomes an item-gathering puzzle** OPEN: the owner likes it ("it fills in a LOT of gaps") and is thinking it over. The check: histories should come from doing dungeon things (a fight survived while holding it, a demon talked down, a hot room), so gathering *is* the dungeon.
- **The cut list for provenance** (drafted Oct 17, not agreed item by item): cut the hidden stairs search, the lean nudge from RARE+ finds, CACHE (a copy with no history clashes with provenance), the unbuilt "gift box carries alignment"; merge tags and item marks into one history; read alignment off marks; fiddling reveals old marks; repurpose the altar (it adds a mark), COMPILER (the merged item inherits both histories), the moon's offers (hints toward her wish), the Relay's clue (hints at the wish), the locker and the Archive and Void (unusual histories).
- **Cross-game item gameplay** DECIDED for later, after the redesign.

### The Moon's wish and marks (decided Oct 17, evening)

- **Marks** DECIDED; backend BUILT (dungeon-items migration 005, live). A mark is one thing that happened to a numbered copy, kept in the shared registry, shown in the item's description in INVOKE. Each verb makes its own kind of history: SEARCH finds, TALK gives, time leaves sky marks. Starting set:
  - night marks: the eight moon phases (stamped when the item comes to the bag);
  - deed marks: found in a wall, given by a party member, taken from a demon, left by a stranger in a gift box, carried up a level;
  - base attributes (already on every item): alignment, nature, and tier (common, uncommon and rare only, for now).
- **Her wish** DECIDED. Each quarter she asks for three qualities: one night mark, one deed mark, one base attribute. Her wish is personal, and plain (she says it outright; dim-means-cryptic is PARKED for later, since it would give new players less at the start of a month). The night mark only asks for phases still ahead in that quarter. The deed is only one she can still get: from a wall or a demon, or from a friend while a night is left (she no longer asks for "from a stranger", which needs another player's box). The base is not checked.
- **The offering** DECIDED. At the stairs, at the end of the quarter, the player offers her up to **two** items. She judges the whole offering (a quality counts if any offered item has it), only on what is visible: no hidden weights from her fullness, VIBES or tags.
- **Anything passes.** The only way to fail is not making it out before the dark rises.
  - 0 qualities: she lets you through, no mark, nothing given.
  - 1 or 2: the items get **"answered the Moon"**, and she shows you **the path not taken** (what was behind the doors you didn't open).
  - all 3: also **"blessed by the Moon"** on one item: it counts one tier higher. Blessings stack, capped by the ladder (common 3, uncommon 2, rare 1, up to mythic). A mark, never a swap, so the copy keeps its number and history.
- **She keeps nothing**; the items come back to the bag.
- **Stairs** BUILT (v1.26): no longer found by searching (the game is now finding the right items, not the stairs); sealed behind her judgment. The Altar room is kept as an empty room (its offering was cut Oct 20); room types are to be revisited later.
- **Occasions** DECIDED, each one only a mark (no new system): blue moons, real eclipses, supermoons at perigee, solstices and equinoxes, the Thirteenth Moon (a year with 13 full moons, every few years), and mirror days (month equals day, 1/1 to 12/12, on the omen clock). Coincidence occasions too: everyone on a level taking the same door, even tallies, a first copy or copy #100, a 1-of-1 changing hands, a round number of players down at once.
- **"Never sad," rebalanced** DECIDED: no choice is ever wrong and a miss never costs, but time can carry stakes and poignancy.
- **Built (v1.27, Oct 17):** blessings count (aura, altar, breaking); the right copy leaves the bag (slot-matched); things handed to a friend keep their copy and marks; the kit, moon gifts, hollow insides, COMPILER and CACHE now carry marks (CACHE stays); occasion marks (blue moon, supermoon, Thirteenth Moon, eclipses 2026-2040, equinox, solstice, mirror day); first/hundredth copy marks.
- **Open issues, saved for later (Oct 17, after v1.27):**
  - Demons: a thing handed to a demon is used up, so it loses its copy and marks when the demon gives it back or joins. Idea: carry the copy in the demon's pocket like a friend's.
  - Run end: leftover bag and pocket copies are never used up in the registry (they stay held by the player). Idea: use up every copy still held when a run ends or restarts. Check what the account page shows for them.
  - A friend who dies or leaves with your thing leaves its copy unspent until the run resets.
  - Blessings do not yet change demon taste (`affinity`) or the box-gift check.
  - Coincidence occasions (same door for everyone, even tallies, round player counts): need a shared server-side counter (counts only, no player ids); the action's reply returns the count it just made, and the mark goes on what was found at that moment. A door tally route and the recent-players window already exist. A 1-of-1 changing hands waits for relics.
  - Supermoons come from the game's mean moon, so some real ones are missed (Jan 3 2026). Eclipse table ends 2040.
  - No v1.27 screenshot (README image is still v1.26). Title feed: the three frozen "moon" cards go when it is redone.
  - Visitors from 88x31 and finds from before v1.25 stay unmarked.
- **Later:** bones (endings become gifts), the dark rising as a shared in-game event. **Not now:** weather; the Moon keeping items.
- **Built:** marks stamped and shown in INVOKE (v1.25); the wish, the + pip, the sealed stairs with [S]HOW and her judgment (v1.26). The moon's offers of two things were removed in v1.26.

Still decided from before, not built: **getting out is a finish** (two boards, this moon and all time); **the glitch mechanic** (low priority); **heat on the minimap** as wavy walls (leaning).

## 16. Systems under review

Redesigning the systems is the top priority, and balance comes after it. TALK, tags, aura and heat were overhauled on Oct 17 (v1.15 to v1.16) and get tuned another day.

| System | What exists | Concern |
|---|---|---|
| Items | 46 dungeon items, numbered copies, a few uses | Marks and the Moon's wish are built (v1.25 to v1.27); watch whether they give items a reason in play |
| The goal | Survive four weeks | No tension or stakes; what is at the top is open |
| Breath | Off on the server | Needs retuning for the server's feel |
| ICHOR, SILVER | Both have uses since v1.16 | Watch whether they get used now |
| Heat | More demons, cooled by dealing with them, seen after a read | How much is danger and how much reward |
| Tags and aura | Hidden volume and colour | Few visible consequences yet; provenance can make them readable |
| SEARCH, TALK, MOON | Three verbs that spend breath and give a line | MOON states the Moon's wish since v1.26 |
| The start | Slow, because the game is a slow burn | Onboarding later, after the fundamental systems |
| Phones | Fits since v1.17 | Still awkward for both 4Dungeon and irl-dungeon |

### The gate (Oct 18)

Before a new system or verb is built, three one-line answers go here: **what does it add, what does it take away, what does it touch?** If still unsure: would it still be wanted in four weeks? The cutting so far has come after building (STANDBY in v1.16, the moon's offers in v1.26); the gate is a short look before.

A first pass over what is unbuilt or unsettled, read from these notes only (no code looked at). Every verdict is SUGGESTED, not agreed.

| Item | Adds | Takes away / touches | Suggested |
|---|---|---|---|
| Fix the leaks: demon pockets, run-end copies, a friend who leaves keeping your copy | Nothing new for the player | Ends "handed to a demon = used up", which erases marks | Do first. No new concept; provenance is only as true as the record |
| Coincidence occasions (same door for everyone, even tallies, round player counts) | Surprise marks | Needs a shared counter (counts only, no player ids) | Wait. With one player on a level it cannot fire yet |
| Bones and ghost demons | A run's ending leaves something for others | Needs other players and names | Wait. If built, make it provenance: items from a dead run arrive with their history |
| Free actions and the ward (Listen, Knock, Mark, Combine, Leave an offering, Elbereth) | New verbs | Blurs the three verbs (SEARCH, TALK, MOON) | Cut or park. Marks and the stairs offering already cover "Mark" and "Leave an offering"; the theorycrafting notes predate the provenance direction |
| Breath retune | Pacing | Limits searching; touches the goal | Ask what job it has now that the Moon's wish gives the goal. If there is no answer, leave it off |
| Item-gathering puzzle (section 15, still marked OPEN) | A purpose for items | Touches everything | The big decision, and the one that answers "items are meaningless". Owner, Oct 18: "that is the main loop of the game". Section 15's status is left as OPEN until the owner says to change it. Test by playing before building more |

The "wait" rows mostly wait for the same thing: other players. 4Dungeon has one player, so the test that matters now is playing the four weeks.

**Open.** What is at the top. How much heat is danger and how much is reward. Whether looking up costs a breath when the moon has set. The wording of rumors and KURA's last words. Whether Hold Omen returns.

---

## 17. Theorycrafting notes (ideas not built and not settled)
**v11 — Oct 17 2026** (game at v1.24)

Ideas that are **not built and not yet settled**. Anything shipped, or settled enough to build from, lives in `daily-dungeon-design.md`; per-release detail lives in the changelogs.

**Since v10 (Oct 11, at v1.02), now in the design doc and no longer open here:** the signal room in every dead end, with the gift box and the door tallies (part 6, built v1.10 to v1.12; the exchange it was going to hold is parked); STANDBY, which part 9's `[W]AIT` idea assumed, was removed (v1.16); the free-action breath question (part 2) waits on breath, which is off on the server until it is retuned; the rested-day bonus (part 5) went with STANDBY. The Oct 17 direction (provenance, the moon's wish, walls as the space) is in the design doc's section 15, not here.

These are working notes, not a spoiler-safe document.

---

### 1. Multiplayer / async ideas (none built)

The leaderboard and faction seasons already give async players some shared context. This section is about going further. The design doc's Part 10 lists the same ideas in one line each; the detail is here.

#### Bones (highest interest, explicitly wanted)
NetHack-style: when a run ends, keep a small server-side snapshot (name, floor, party, cause of death, last words) attached to a **level and room kind** (the offers are shared, the doors are private, so bones have to live on the shared side to make sense across players). Later players in that room can find the remains: fixed flavor, maybe recoverable loot, never free text.

#### Ghost demons
A dead player's party member reappears as a nameable wild encounter (`PIPEDREAM's PIXIE`), keeping its personality and alignment, recruitable by someone else. The existing pact record (name, floor, day, active) already holds most of the data this needs.

#### Counts by level
The monthly counters shipped in v0.73 (design doc Part 11). Not built: the same tallies split by level (falls on B3F this moon), which would be more keys in the same table.

#### Ghost routes (not started)
- Since v0.77 everyone playing in a moon quarter is on the same level with the same offers, which is most of what a "shared floor-week" asked for. Sharing which door is which would still be a spoiler, so that part would have to be a **separate challenge mode**.
- Softer version: record a compact **route** per run (room/day/search counts, a few hundred bytes, never the full log) and show faint traces of other players on the same level ("`PIPEDREAM` was here, day 3"). Informational only, so forgeable routes don't matter much.

#### Bones, ghost routes and shared wards are one shape
All three are the same record: small, anonymous, keyed to a level and room, read once a day inside the one-packet budget. Whichever is built first makes the other two cheap. That doesn't decide which goes first, only narrows the cost of building more than one.

---

### 2. Free actions & the Elbereth-style ward (none built)

Came up together since **Mark** (below) and the ward are really the same
idea. Everything in this section is unlimited and free — same category as
SEARCH and turning, not the daily move.

**Note:** with the CELL/charge system fully removed (v0.57.1) and
the only remaining daily budget being the single locked-door step, adding
more free actions here no longer raises the old "does this eat into my
charge" design question — there's nothing left for a free action to compete
with. Doesn't change the designs below, just means they're lower-risk to
add than when this list was first drafted.

**Update, v0.83 on:** that is no longer quite true. Searching, scrying, using an item and stepping between rooms now cost **breath** (design doc Part 1), so any new action here needs a decision: does it take a breath? Listen and Knock probably should; Mark and Read probably not.

#### More free actions beyond search/turn
- **Listen** (a form of this shipped in v0.72 as listening at the doors; this is the in-room version)**:** quieter than search — gives a noise-type tell (repetition vs.
  lingering) without raising much heat. A softer, less precise read than
  what search already gives.
- **Knock:** narrows a secret's rough location, but is loud — adds more
  heat than an ordinary search.
- **Mark:** scratch a symbol on a wall or floor, purely a player note
  ("I've exhausted this wall"). Near-zero cost, and the same scratch
  mechanically becomes the ward below once it's meant to do something.
- **Combine:** fixed recipes only, not open crafting — e.g. a dead pager +
  red thread → a named hybrid item, matching the existing item-flavor
  naming style.
- **Leave an offering:** a cheaper, ordinary-wall version of the altar's
  GIVE — drop an item at a corner for a small effect (a little heat
  cooled, a recruit calmed slightly).
- **Read/inspect an item:** flavor-only unless it has a hidden property —
  NetHack-style identify-by-use.
- **Pray / call out:** an alignment-flavored gamble — could draw a friendly
  or hostile demon depending on the player's tag and the room's heat.
- **Ask the room a question:** rare, moon-gated yes/no tell. Asking the moon herself shipped in v0.72 (design doc Part 8).

#### The ward (Elbereth, reskinned)
- Write a ward on the current room's floor; some monsters flee or
  hesitate when they try to attack while it holds.
- **Materials matter:** bare fingers = weak/fragile; chalk, grave salt, a
  burned match = stronger, slower to smudge. Gives existing junk items (a
  tin of matches, a jar of grave salt) a real mechanical use.
- **Writing can fail/garble** — shown softly, e.g. "the letters came out
  crooked," rather than silently failing with no feedback.
- **Who respects it, mapped onto the existing monster ladder:**
  - Folklore/Chaos-leaning demons respect it fully (old names scare old
    things).
  - Hybrids respect it partially (a chance to ignore it).
  - Data/Law-leaning demons ignore it outright — would need a parallel
    "lock" or "firewall mark" that only works on them, so both halves of
    the 70/30 split get their own version of this.
  - Bosses ignore it, or are only slowed.
  - Could tie into alignment: an opposite-alignment monster might be less
    impressed by a given player's ward than a same-alignment one.
- **Smudges over time:** each time it scares something off, a chance it
  fades; attacking while standing on it erases it immediately (keeps it
  strictly defensive).
- **Interacts with existing systems:** writing should cost a little heat,
  not be free of any cost. A strong ward should make resting/skipping in a
  hot room meaningfully safer (a large cut to the wandering-encounter
  roll) — the natural answer to "I need to rest somewhere dangerous."
- **Discoverability:** finding a scratched name while searching, or a
  half-erased ward "someone else" left, is a good way to teach the
  mechanic exists without an explicit tutorial.

#### Shared visibility within the quarter
- A ward written in a room could be visible to other players who reach
  that same room on the same level during the same moon quarter — not functional for them,
  just visible, like a trace that "someone wrote something here."
- Slots directly into the existing multiplayer/read-budget framework
  (section 1): same shape as a bones/ghost-route record — small,
  anonymous, attached to a level and room, read as part of the one-packet-
  a-day fetch. No new infra category needed, just another record type.
- Open design fork, **still undecided — flagged for you, not resolved
  here:** is the ward cosmetic-only when seen by someone else (safer,
  simpler), or actually functional for whoever finds it (needs real
  abuse-proofing)? A tempting shortcut would be a blanket house rule —
  "anything visible to other players is flavor-only, never mechanical" —
  which would answer this *and* pre-empt the same question coming up again
  for bones/ghost-routes. That's a real design decision, not just
  documentation, so it's left as open question 6 below rather than
  adopted here.

---

### 3. ASCII first-person view mockups (exploration, not committed)

Pure-visual exploration from this chat, 58×17, done before any real
screenshots were shared — the actual game's look (per the changelog's
`screenshots/v0.XX.png` references) may well have diverged. Keeping the
notes in case they're useful as a style reference:

- **Door view:** bold riveted back wall (`====`/`||`), thin smooth
  diagonals (`` `-. ``/`.-'`) for side walls/ceiling/floor (steep single-step
  `\`/`/` were tried first and looked jagged — the shallow multi-column
  version reads better), a small door pad (`.--.`/`|88|`/`'*-'`), and
  `[ :  : ]`-style slide-door handles pulled in tight to the center seam.
- **Wall (turn) views:** same frame; a horizontal pipe-with-valve run across
  the facing wall for a "blank wall" look; the wall you just turned from
  shows as a narrow door-frame sliver in the near-side strip (mirrored
  correctly for left vs. right turns — the near end of the strip is always
  the side closer to the viewer).
- Not yet drawn: stairs-down in this same bold style, multiple "blank wall"
  variants (so a plain wall and a secret-holding wall look identical until
  searched), the wall directly behind the player.

---

### 4. Leaderboard notes

- Any new board-adjacent idea (bones, ghosts, counters) should extend the existing Worker and schema, which already handle name and run-id validation, per-sender rate limiting, and the admin delete path. Don't stand up a second one.
- Full run-replay verification isn't possible under the free plan's 10ms CPU cap, which is why scores are openly unprovable. The $5/month paid plan, not a VPS, would be the way to unlock it if it's ever worth doing.
- A richer board UI (Cleared / Dead / Graveyard tabs, pagination, a "YOU — #N of M" row) was mocked up once. Low priority; it will come naturally as bones and the other async pieces get built.

---

### 5. A named buff for the day after a held day

Deferred and deliberately undesigned. There is already a real mechanic the player is never told about: `st.restedDay` gives a 25% search-effectiveness bonus the day after a held day. A named buff should be that bonus made legible, not a second one stacked on top.

---

### 6. Dead ends as a place for other players (discussed, nothing chosen)

Every wing has a dead end; it holds the scrap that names one of the wing's two doors, and since v1.00 the exchange's screen (design doc Part 12), so any of the ideas below would share the room with it. Because wing shapes are shared, "the dead end of day 3's wing" is the same place for everyone on a level, which makes it a natural mailbox. Ideas floated:
- **A message wall:** fixed-phrase notes, picked from a list, never typed.
- **Bones:** a marker when a run ends on that level (a name, a day, last words), searchable for a small find.
- **Tallies:** scratches for how many took each of that day's two doors. Popular, not which is which.
- **A listening post:** the one room where she hears the rest of the level ("three others are on this level tonight").
- **A cache:** leave one item, take what the last person left.
- **A quiet room:** breath comes back faster and nothing wanders in.

The suggestion on the table was to combine the wall, the tallies and the listening post into a "signal room", keeping the scrap. Open: whether leaving a mark costs anything (a breath, the key), how long marks last, flavor or true hints. Backend: one small table keyed by level, day and wing, read once on entering.

(The bonus room and THE VOID, parked through the one-room releases, are live again since v0.80 and no longer a to-do.)

---

### 7. The escape: what is decided and not yet built

Built in v0.77 and kept through the v0.80 rollback: the pit (B4F up to the surface), levels lost at the moon's quarters, waking on the level the dark has reached, play continuing past the surface. That also retired the late-week start rule.

Still to build, as agreed:
- **Getting out is a finish.** Reaching the surface completes the monthly climb; the player can stop there or go on.
- **Past the surface is the endgame,** with no top. It could be harder as well as longer (corruption from the first day, the bonus room and THE VOID back, less time a level).
- **Two boards.** This moon: who got out and how fast, then by levels climbed; resets each lunar month. All time: the highest anyone has climbed past the surface.
- **Open:** what is at the top; drawing the moon larger in the sky view the higher she is.

---

### 8. A map of the shared level (tried several ways)

The offers and wing shapes are shared, so a level could be drawn for everyone. What was tried on Oct 11:
- A sideways strip (`[v]----< >----< >...[?]--[^]`) with room counts and the offers by feel. It shipped only on the end-of-run page, cut down to the room she took each day, because showing the week's offers would spoil them.
- An upright "readout" with block bars, and a "circuit" with a node a room: liked the look, "doesn't look like a map".
- Trees (symmetric, asymmetric, twiggy): set aside.
- **What shipped (v0.93):** a line of the quarter's lunar days with a decorative branch off each, future days masked. It is the level's mark, not a map.

Things learned: every wing has exactly three rooms, so "size" can't be shown honestly; and anything that draws wing shapes lets a player work out their own map rotation. A later step that needs the Worker: marks on each day for how many players are there (the presence ping already carries the level; it would need the day).

---

### 9. Other ideas from the same session

- **What could take `[F]IGHT`'s old slot on the bar** (left empty): `[W]AIT` for STANDBY (the day's other big choice, currently buried in the bag), `[G]IVE`, `[R]EST` (get breath back faster at a cost such as heat), `[L]ISTEN` (a quieter, less informative search).
- **Live presence:** built in v1.00 (design doc Part 10). Still open: a listening-post room, something small when several players are on a level at once.
- **Names in the feed:** events now store the run's name. "HAL-BOT fell on B4F to a CHROME ONI" would make the typed line a world of people; it ends anonymity and needs the board's name filter.
- **Per-level counts on the title** beyond presence (falls on B3F this moon).
- **Breath levers:** a bigger bar, a faster refill, search time that grows as she tires (built in v0.84, removed), a `[R]EST` action.

---

### Open questions

1. Bones or ghost demons next, now that faction seasons are built?
2. Should a fully shared level (same doors for everyone) ever exist as a separate challenge mode, given the spoiler problem?
3. Does the game still want an endgame distinction between Mythic and Moon rarity, now that the structure has changed so much from the original weekly-floor design?
4. Ward materials: are chalk, salt or a match consumed on use, and which existing junk items double as them?
5. Does the data-demon "firewall mark" need its own flavor and materials, or just a different name on the same mechanic?
6. Shared wards, and by extension bones and ghost routes: cosmetic-only trace, or functional for whoever finds it? A blanket rule ("anything visible to other players is flavor-only, never mechanical") would settle all three at once. Not adopted without your go-ahead.

---

## 18. Heat, verbs and patience notes

Oct 15 2026, written at v1.11. Ideas are marked **decided**, **leaning**, **proposed** (suggested, not confirmed) or **open**.

**Status at v1.24 (Oct 17).** Built from these notes: a demon cools the room by a third when dealt with, heat colour on the map after a read, the safe-versus-gamble choices (v1.12); patience wear removed and patience renamed VIBES, with a quiet day instead of tension (v1.12, v1.15); WORD renamed TALK, and the AURA button folded into TALK (v1.15). Still open below: wavy minimap walls, WORD pairs by personality, what MOON does when she has set, and the split between heat as danger and heat as reward.

### Decisions at a glance

- **Heat:** a demon cools the room after you deal with it. No heat gauge. Searches in a hot room get a slower, heavier rhythm. Minimap walls are the leading way to show it (leaning).
- **Patience:** something you build. Tension is removed. It only drops in a hot room. The bottom is CONTENT, with no negative feelings, no snapping and no leaving. Nagging remarks stay as flavor only.
- **WORD:** always a decision, with no wrong answer. The two options give different kinds of equal-value good. Members offer different pairs by personality. Options are clearly labeled.
- **Safe versus gamble:** appears on demon offers, on a worn wall (more often in hot rooms), on the moon at fuller phases, and in a hot room. Not on low breath.
- **Not doing:** AURA as an on/off mode (too much programming for now), a +2 versus +1 match system, or letting the player pick which member to talk to (needs UI changes).
- **Box at the end of a wing:** develop it more, as the multiplayer interaction.

### Heat: what it does now

From the internal changelog:

- Every search warms the room (v0.18).
- A demon's chance per search goes from about 1 in 24 in a cold room to about 1 in 4 in a hot one.
- Heat halves overnight. It is the only cooling (real-time cooling was tried in v0.81 and reverted in v0.83).
- Lingering in a hot room wears on clashing party members (v0.59). This is being reworked, see Patience below.
- The player only sees it through the AURA room read (three tiers) and "it's warm" lines. The moon-strip gauge went away when breath replaced it.

**The problem:** once a room is hot, demons keep coming and nothing cools it. The player also can't tell whether more demons is good or bad, because demons are both a threat and loot (they carry things and drop them when beaten).

### Heat ideas

1. **A demon cools the room after you deal with it.** (**decided**: "that makes sense".) Fight, WORD or run, then heat drops by a chunk. A hot room becomes a cycle (push, something comes, you handle it, you can search again) instead of a pile-up.
2. **Heat changes who shows up, not what they hold.** (**open**.) A hotter room draws louder, older demons (the aura "pull" already does this). Louder demons carry a bit more. Nothing is made from nothing, which fits the fact that pockets are filled on first look.
3. **No gauge.** (**decided**: too easy.) Replace the "it's warm" flavor lines where possible, since the goal is less text, not more.

### Making heat visible without a gauge

- **Minimap walls** (**leaning**, liked it). Rooms you've visited keep their own heat, so the map would also show which rooms were left hot.
- **Search rhythm** (**decided**: slower when hot, "oppressive"). Keep it small: only the dots, roughly 200 ms each up to 300 to 400 ms at the hottest. The old search pause that grew with heat (up to 2 s, v0.81) was removed in v0.83, so this should stay light.
- **3D panel art** (**later**): cracks and scratch marks creeping across the walls, dust on the floor, or warped door frames. It must be static (the standing rule: no glow or dimming).
- Other options, not chosen: faster cursor blink, a mark by a party member's name, a word change in the room-name slot.

#### Wavy walls on the minimap

Three steps, matching the three heat tiers:

| Tier | Horizontal walls | Vertical walls |
|------|------------------|----------------|
| Cool | `-` (as now) | `\|` (as now) |
| Warm | `~` | `\|` |
| Hot | `~` | alternating `(` and `)` |

```
+~~~~~~~+
(       (
)       )
(       (
+~~~~~~~+
```

- Corners stay `+` so the room still reads as a box.
- For vertical walls, pick `(` or `)` by the row number (odd rows one, even rows the other), so two rooms sharing a wall line up with no seams.
- Other pairs: `/` and `\` (sharper zigzag), `{` and `}` (softer curl). `:` would read as a broken wall, not a wavy one.
- Check the characters in the page font (VT323) before committing. `~`, `(` and `)` are plain and should be safe.
- Static only. A shimmer would be an animation, so ask first.

### AURA, MOON and WORD

**The problem:** all three work the same way (press a button, spend breath, get a line of text, sometimes pick one of two things). Splitting them by topic alone doesn't help, because a player still can't feel the difference.

Overlaps found in the changelog: MOON's offer includes a door hunch (AURA's job), WORD's banter includes lines about your aura, and MOON and WORD both end in "pick one of two things".

**WORD becomes a decision** (**leaning**, "could work"):

- It reuses the party question flow from v1.10 (`[1]` or `[2]` buttons, two answers, patience effects), so it is mostly data changes.
- **No wrong answer** (**decided**): both options are good.
- **Different kinds of equal-value good** (**decided**): for example patience for the member, breath for you, an alignment lean, or an item. You can't have both, which is the trade-off.
- **Members offer pairs by personality** (**decided**): the personality decides which pair appears, not which one wins. For example the gruff one usually offers breath or healing and the dreamy one offers an item or a lean. Current personalities: ELF is PRIM, PIXIE is DREAMY, CU SITH is GRUFF, and recruits take their family's personality.
- **Clear labels** (**decided**): each option says plainly what it gives, so a player can judge by what they need.
- **Skill is reading your own situation** (**proposed**): low breath makes the breath option worth more, a member close to the bottom makes patience worth more, and so on. Nobody ever gets "the lower one".
- The aura banter lines would leave WORD (**proposed**).

**Not chosen:** a +2 versus +1 match system (a player would feel bad about the lower one), and letting the player pick which member to talk to (needs UI changes).

**AURA:**

- **No on/off toggle mode** (**decided**, for now).
- Still open: take AURA off the button bar by folding it into things you already do (door hunch into listening at a door, room read into a free line on entering a room, demon read onto the screen where the demon appears), or split by target (AURA for places and things, WORD for demons, party chatter happens by itself). Neither is chosen yet.

**MOON:**

- Today pressing [M]OON looks up, costs one breath and runs her answer. The remaining interaction is the breath cost, the pick-one-of-two offer, and repeat lines.
- **Non-interactive idea** (**leaning**, "maybe"): looking up is the only action, and she does something or not by phase and position. Open: does looking up cost a breath or is it free? What happens when she has set (the changelog doesn't say whether she can still answer)?
- The hunch option in her offers goes if MOON becomes a boon, since AURA covers hunches (**proposed**).

### Safe versus gamble choices

A choice between a small sure gain and a bigger gain that only sometimes lands. A fizzle gives nothing, never a penalty. It is only available sometimes, depending on context.

- **Hot room** (**decided**).
- **Demon offers** (**decided**): for example a SLY demon holds out a sure small thing against a mystery one.
- **A worn wall** (**decided**): keep searching as usual, or dig deep for a better chance of a big find at the cost of more heat. Appears more often in hot rooms.
- **The moon on fuller nights** (**decided**): a safe gift next to a rarer one that might not come through.
- **Low breath** (**decided: no**).

### Patience (rework)

**Today** (from the changelog): patience is the only stored meter. Tension is not stored; it is worked out from alignment gaps (LAW against CHAOS is the big gap) and wears patience in fights with a clashing pair, in hot rooms, and on skipped days (that last one loses to the nightly regen). Patience also drops from nagging remarks, fiddling with items, breaking things a member loves, and CHAOS members lashing out. At zero a member can snap or leave. It currently drains too fast and members get upset (**decided**: dislikes that).

**New shape** (**decided** unless marked):

1. **Remove tension** as a source of wear (the alignment-gap check).
2. **Patience only drops in a hot room.** Nagging, fiddling, breaking things and lash-outs no longer cost patience. The nagging remarks stay as flavor.
3. **Patience builds up** from WORD, offers, truces and a night's rest, as now. Offers and confides already open up at higher patience.
4. **The bottom is CONTENT.** No snapping, no lash-outs, no leaving. A content member goes calm and a bit less chatty, then returns to normal with a WORD or a night's rest (the calm and less chatty detail is **proposed**).
5. **Reword the tired and tense lines** so they sound content, not unhappy (follow-up).

A hot room now does two jobs: it wears on the party, and it brings more of the safe-versus-gamble choices.

### Summary of the rest of the talk

- **README opening paragraph.** Merged the repeated parts and dropped "seeded". Two versions: a plain one and a shorter, moodier one. Kept "the same for every player", and used "floor" for the place and "quarter" for the time.
- **Weak points raised:**
  - Items have alignment and inventories, but few real meanings yet.
  - Breath does a lot of jobs. You rebalanced it to stop spam and give actions a cost.
  - The information verbs (search, AURA, MOON) overlap.
  - WORD could only help, so it risked becoming a button you just press.
  - The real sky and the box are the most distinctive things, but they connect to little else.
- **The box (end of a wing).** (**decided**: develop it more; it's the multiplayer interaction.) Idea: what you leave could carry its item's alignment, so the next player gets a hint of who was there.
- **Connecting the sky to mechanics:**
  - Make the moon's real position matter to [M]OON (**leaning**). Open: her silent or just weaker when set, since some players' schedules never line up.
  - Give bright stars an alignment that pulls demons and items. Watch out: a player's sky depends on where they are, so this needs one fixed sky for everyone.
  - Mark box items with the star that was highest when left.
- **Information overload.** Three text lines plus on-screen events. Realized most of the information points at hidden systems (alignment, heat) that don't carry much weight. Each system either gets real, visible consequences or gets shrunk or cut, along with the lines that point at it. Test for every line: does it change what the player does next?

### Next steps (open)

- Choose how much of heat's effect is danger and how much is reward, and how much a demon cools the room.
- Decide whether to add the "louder demons carry more" link.
- Pick the minimap wall style and test the characters in the page font.
- Define the WORD pairs for each personality (which rewards each member tends to offer) and write the labels.
- Decide whether looking up at the moon costs a breath, and what happens when she has set.
- Decide how to separate AURA from WORD now that WORD is a decision (fold AURA into other actions, or split by target).
- Patience: remove tension, remove the other costs, add the CONTENT bottom, and reword the tired and tense lines.
- Set where and how often the safe-versus-gamble choices appear.
- Go through every on-screen line with the "does it change a decision?" test.
