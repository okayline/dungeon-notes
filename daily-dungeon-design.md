# Daily Digital Demon Dungeon: design

As of **v1.27.1** (Oct 17 2026), with the gate review of Oct 18 in section 16. Earlier versions of this file are in git history.

**What this is.** What the game is for and how it plays, in plain words. It does not repeat exact numbers: those live in `rules.js` and `floor.js`, and when the doc and the code disagree, the code is right and the doc is wrong. Per-release detail is in `CHANGELOG.md` (this repo). Unbuilt ideas are in `daily-dungeon-heat-notes.md` and `theorycrafting-notes.md`; the move to the server is in `4dungeon-server-move.md`. Voice rules are in `voice-guide.md`.

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
| Altar | No fixture. A terminal that takes an offering |

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

**Offers** are always two things from the member's own pockets (or one asked for from your bag), one taken. A full bag makes it a swap. Some are wrapped, a gamble that is the real thing about half the time. Members refill their pockets a little each night.

**VIBES** (was patience until v1.15) is the party's mood, and it only grows: talks, questions and confiding raise it, nothing lowers it. A room crossing tier 3 heat (the hottest) makes demon members go quiet (the old tired lines) for the rest of the day; a night's sleep or a check-in TALK brings them back. Nobody snaps, strikes or leaves.

**Recruiting.** Through TALK. Programs join more readily. CHAOS or HAUGHTY demons never take the plain "join." A full party offers a swap.

## 8. Alignment and aura

**Tags** (v1.15). KURA's choices that matter (fighting, killing, giving, restoring, breaking things, running) leave a tag; she keeps her last six. Tags pull toward LAW or CHAOS, and her colour drifts back when she acts differently. Tiny nudges (a search) leave none. Flip lines and the "something is pulling at you" tell still fire.

**Names.** Everything has a two-word name: a machine half (SIGNAL, HUM, STATIC) and a natural half (KEPT, STRAY, FERAL). Data and tech things are the machine half, folklore and spirit things the natural half, and hybrids take both.

**Aura.** KURA's aura is a volume and a colour, hidden. Volume: KURA, each standing member, the things in her bag by tier, and half the room's heat. Colour: the biggest pile of LAW, NEUTRAL or CHAOS among her tags, her party and her things. Volume sets a loudness: QUIET, NOTICED or LOUD. Louder auras draw demons more often and toward the loudest side, and raise the moon's answer odds. The AURA button is gone (v1.15); reading the air is part of TALK.

## 9. Items

**Tiers** are COMMON, UNCOMMON, RARE, MYTHIC and MOON. The shared ladder across the games is common, uncommon, rare, prototype, relic, ultra (1-of-1), plus moon; 4Dungeon's six old MYTHIC items keep their name (forward only), new top-tier dungeon items will be relics, and 4Dungeon never deals prototype or ultra (88x31 is their home game). Every item has an alignment and a nature. **Marks** (v1.25 to v1.27): each numbered copy remembers what happened to it: the moon phase it came under, how it was got (found in a wall, from a demon, a friend's gift, from a stranger), the levels it was carried up, and real-sky occasions (section 10). INVOKE shows them under the description. The Moon can **bless** a copy, which counts it one tier higher for aura, the altar and breaking (not yet for demon taste or the box-gift check).

**The bag** holds 9. A tenth asks what to leave. INVOKE lists the bag, the ICHOR flask and SILVER. A few UNCOMMON items have uses (a heal, a revive, a candle that cools a room). Most items have no use, and fiddling with one reveals something about it after enough tries ("Something rattles inside"), and a few break.

**ICHOR** (v1.16) is a flask KURA always carries, holding a fixed amount. It fills from a fallen demon and from a demon that parts in peace, and the party drinks from it to heal. KURA can drink it herself, which makes her DRUNK (was "taint"): at 3 she starts seeing things, at 6 she trips for a while (melee doubled, risk of hitting an ally, the turn counter lies). It wears off overnight, at a Forge, or with SILVER.

**SILVER** (v1.16) is found in walls, the vault fixture and the lure locker. Spent from the bag, it cools the room to nothing and clears what clouds KURA (DRUNK, and quiet members); its price goes up with the level. It can also be offered at the altar.

**The altar** takes one offering a day per room: an item (or SILVER). The result depends on the item's alignment, and gives a boon: the wing's door clue (LAW), breath and a heal (CHAOS), or a few breaths otherwise.

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
- **Stairs** BUILT (v1.26): no longer found by searching (the game is now finding the right items, not the stairs); sealed behind her judgment. The Altar room may fold into it later; left as it is for now.
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
