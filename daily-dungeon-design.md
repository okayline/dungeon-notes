# Daily Dungeon — Design Doc

How the game plays and why. Current as of **v0.77**: one room a day, two doors on one wall, a climb out of a pit on the moon's clock.

One file, no version suffix; git history is the version history. Ideas that are not built and not yet settled live in `theorycrafting-notes.md`. Exact per-release detail lives in `CHANGELOG.md`.

---

# Part 1: The premise and the daily loop

**The premise.** KURA wakes in a pit and climbs out. The pit is four levels deep: **B4F** at the bottom, then B3F, B2F, B1F, then the surface (**1F**) and on upward with no top. The dark rises from below, a level at a time, on the moon's clock (Part 9). The moon is overhead in every room: there is no ceiling, only the night sky. "Higher is always north": the doors onward are always in the north wall, and the map and the long view both grow upward.

**One room a day.** KURA stands in exactly one room. Its north wall holds two locked doors, LEFT and RIGHT: an offer of two rooms. One real-world day gives one **charge**, spent by:
- opening one of the two doors (the other **seals for good**), or
- going on **STANDBY** (resting instead of moving).

Opening a door only opens it; stepping through is free and happens when the player chooses, and it is one-way: the door shuts behind her and there is no going back. Everything else is free and unlimited: searching, listening at the doors, turning, looking up or down, talking to the party or to demons, using items, the altar, asking the moon.

The gate is a single boolean, `today(st).stepped`: once true, no further locked door opens until the next real-day rollover.

**STANDBY** spends the day's charge without moving (blocked while a demon is in the room). On the *following* rollover a STANDBY night triggers "camp" effects:
- every standing party member restored to full HP/MP and full Patience,
- taint reset to 0,
- the room's heat cleared,
- the loop-detection counter reset,
- any camp-triggered PROGRAM jobs run (COMPILER, CACHE; Part 7),
- and that night's omen gets **banked**.

With no going back to a Recharge Bay or a Forge, a camp night is one of the few ways to heal. It costs a day of the level's time.

**Omen banking (Hold Omen / Release Omen):** a STANDBY night banks that day's omen in `st.bankedOmen`: one slot, a newer held day overwrites the old one. The banked omen waits until the player releases it (`useBankedOmen`), which applies it in place of that day's natural omen; it's gone at the next sunrise. A scheduling tool, not a reroll.
- **Cooldown:** releasing starts a flat **7-real-day** cooldown before KURA can hold again (`st.omenCooldownDay` against `st.day`). The cost sits on Release, not Hold.
- **UI:** one morphing button with its own `H` key in the bag's pinned foot block. It is always there: `Hold Omen`, `Release Omen`, `Hold Omen (Nd)` while cooling, or greyed when it can't be used (the charge is spent, a demon is here).

Every action runs `sync()` first, which also: halves the room's heat overnight, decays taint by 1, restores 3 Patience to each party member, heals a little HP, and checks the level's deadline. Missing it ends the run (Part 9).

**Controls.** At the foot of the view: the word for what `[ ^ ]` will do here (LISTEN, OPEN, ENTER, SEARCH, USE, OFFER, CONSULT, CLIMB), `[ ^ ]` itself (also the up arrow), and `[ < ]  N  [ > ]` to turn, with the compass letter between. `[ < LEFT ]` and `[ RIGHT > ]` flank the word while both doors are locked (keys Q and E). The bottom bar holds `[F]IGHT [T]ALK [I]NVOKE [S]EARCH LOOK_[U]P`; looking steps through sky, floor, level (U), and D looks down. The slot under the map names what she faces (TWO DOORS, BARE WALL, THE MOON...).

---

# Part 2: Levels & rooms

- A level has `KINDS = [den, bay, relay, vault, forge, altar]`. Two more, `archive` (the bonus room) and `void`, are **parked** (Part 8).
- A level lasts `days` (3 to 7, the days left in its moon quarter when she arrives, capped at 7), giving `pairs = days - 1` offers.
- **The deck:** the six kinds are shuffled twice and concatenated, retried until no pair repeats a kind, then dealt two at a time, one offer per room. The pairs and their order are **shared** (seeded from the lunar epoch and the level's height). **The last door is a wildcard**: one door of a kind rolled from the private seed, never part of the shared deck.
- **Rooms** are built the moment their door is unlocked. A room is `{ doors: { L, R } | { C } | {}, hidden, stage, exits, clueKind, ahead: "N", back: "S", from, side, kind }`. Every room faces the same way: doors north, the way back south, east and west bare.
- **The run of rooms:** rooms at `stage < pairs` have two doors; the room at `stage === pairs` has one, the wildcard, and hides the **stairs up**; the wildcard room (`stage === pairs + 1`) has no doors and hides stairs of its own. So the stairs are reachable after `pairs` door-days, leaving one spare day: for a STANDBY, a missed day, or the wildcard room.
- **What a room hides:** 2 to 4 things from `[demon, demon, item, item, silver]`, a **scrap** (`clue`) that names what one of its doors is (never which), the **locker** (`lure`) in one room on about 60% of levels, and the stairs in the last rooms. A Recharge Bay's demons become items.
- **Private (`pseed`, re-rolled per level):** which kind is behind the left door and which behind the right, where everything hides, the wildcard's kind. **Shared (`seed`):** only the offers.

---

# Part 3: Room kinds, searching & listening

Each kind-room (den/bay/relay/vault/forge) hides a **fixture** in one bare wall, found by searching like anything else, usable once a day:

| Kind | Fixture effect |
|---|---|
| Den (CYBER-DEN) | Heats the room to at least 60% of max: "the room stirs" |
| Bay (RECHARGE BAY) | Safe room (no encounters); fixture heals the party ⅓ max HP |
| Relay (SIGNAL RELAY) | Reveals the kind of the door the room's scrap doesn't cover |
| Vault (DATA VAULT) | `R(40,110) × levels climbed` SILVER |
| Forge (FORGE-NODE) | Clears taint to 0, ends a trip |
| Altar (MATRIX ALTAR) | No fixture: an offering terminal in a bare wall (Part 7) |

Room type names are never shown to the player. A room has a flavor name ("Soft room", "Ash room"), said once as she steps in.

**Where things hide:** in the bare walls (east and west; south too in a level's first room) and the floor. Nothing hides overhead. The fixture is always in a wall. The stairs up are in a bare wall and are always the first thing that wall gives up.

**Searching** is NetHack-style and unlimited: each hidden thing needs `5–10` base search-points, scaled **×1.5 per prior find on that face**. Each search adds up to about 1.9 points, scaled by the day's omen, the room's heat tier (calm rooms yield more), a rested-day bonus (×1.25 the day after a STANDBY night), and moon fullness (up to ×1.35 at full). About a third of rooms hide a much deeper MYTHIC find (20–50 points).

**Item rarity on a find** (`rollItem`): `rare = 8% × the omen's loot multiplier`, else `32%` uncommon, else common. Silver found by searching is `R(20,150)`.

**Listening at the doors.** Searching the door wall listens at each locked door in turn and says which ("The left door. Warm air breathes along the bottom."). It **always** gives a hint. The senses overlap on purpose (warm: Den/Forge, hum: Bay/Altar, cold and static: Vault/Relay), so a hint narrows a door to two kinds. With the scrap, the Relay and the moon, that is the evidence for the day's one choice; every extra search for more of it heats the room.

**Heat** is per room: each search adds 1 (max 20), halves overnight, and raises the encounter chance. All of a day's searching is now in one room, so it climbs faster than it did across a wing.

---

# Part 4: Combat & demons

**Encounters** never trigger in a Bay. Elsewhere, chance per search is `(1/24 + (1/4 − 1/24) × min(1, heat/20)) × moon multiplier` — roughly 4% cold up to 25% at max heat, scaled 0.8×–1.25× by moon phase.

**Demon HP:** `round((16 + 9 × floor depth + R(0,8)) × unique multiplier × (1.15 if corrupted))`. Named uniques (e.g. ATOM SLASHER) carry their own HP/hit multipliers and can be flagged untalkable.

**FIGHT:** each standing member rolls `R(1,4) + floor(level/2)`, summed into the hit; demon HP drops by the total. While KURA is tripping, a third of her blows land on a random hurt ally instead (double damage, never fatal) — otherwise her hit is doubled.

**Demon's turn:** targets KURA 40% of the time when she's alive, otherwise a random standing member. Damage is `max(1, round(R(2, ceil(HP/3)) × moon rage multiplier × unique hit multiplier × 0.67 if a WATCHDOG is present))`. KURA hitting 0 HP ends the run.

**TALK:** a demon listens with probability up to 95%, built from a moon curve (most willing at new moon, least at full moon) × 0.7 if corrupted × the day's omen talk multiplier × a stance multiplier (1.5 same-alignment / 1 neutral / 0.6 opposite). Programs always listen. A demon that doesn't listen has a 50% chance to get angry and attack instead. One that does listen asks 2–3 yes/no questions before sizing up (Part 5).

**RUN:** 50/50 whether the demon blocks the way (can't retry that encounter) or KURA gets away. The ways out are an open door, found stairs, or a locked door. A locked door takes the day's charge **only if she gets through**: a blocked run costs nothing but the demon's blow. Once the charge is spent and no door stands open, there is usually no running at all. Difficulty everywhere in this Part scales with *levels climbed in the run* (`st.climb`), not the level's name, so a late start high in the pit meets first-level demons.

**Corruption** only becomes possible in the back half of a floor's week, scaling from 0% up to `(10% + 30% × remaining-week progress) × ½ for non-data families`. A corrupted demon gets a glitched name (first vowel swapped for a symbol), forced CHAOS alignment, and +15% HP; talking it down (mood reaching ≥1) restores its real name/alignment and gives a 60% chance it then offers to join. Programs and uniques are never corrupted.

**Demon families and their floor-depth weighting** (data/hardware/hybrid/folklore):

| Levels into the run | data | hardware | hybrid | folklore |
|---|---|---|---|---|
| 1st | 7 | 3 | 0 | 0 |
| 2nd | 4 | 5 | 1 | 0 |
| 3rd | 1 | 3 | 5 | 2 |
| 4th+ | 0 | 1 | 4 | 6 |

Modifiers on top: a flat 3% chance of ATOM SLASHER, 7% chance of a free PROGRAM; repeatedly searching the same wall (4+) boosts data/hardware; lingering in a room (30+ actions) boosts folklore/hybrid; the day's omen can multiply either pairing (Part 8).

**Win rewards:** ICHOR (`R(5,30) + 3×depth`), 50% chance of silver (`R(8,40)×depth`), 25% chance of a rolled item, and a small moon-phase chance of a MOON-tier drop that only exists around full moon.

---

# Part 5: Party, Patience & recruiting

**Patience** caps at 5 per non-KURA member. It drops from over-talking in a day, breaking items (worse for a member who's a fan of that item), fidgeting, looping the same action, drinking ichor, and disliked question answers. It recovers +3 overnight, fully on a STANDBY/camp night, or +1 for confiding.

At 0 Patience, a second push has a 50% chance to **snap**: a CHAOS-aligned member strikes KURA (never fatally) and stays; a LAW or NEUTRAL member **leaves the party for good**. A "last chance" prompt can head this off — saying yes mends +3 Patience; saying no risks a persona-dependent chance of leaving outright (HAUGHTY/PRIM/SLY essentially always leave on a no, GRUFF rarely does).

**Recruiting:** after a demon listens and answers 2–3 questions, it sizes up. Programs join at 90% odds with a good mood, 40% at neutral. Ordinary demons may instead ask for a gift first (more likely for haughty or dreamy personas to skip straight to asking), or offer to join directly at up to ~50% odds scaling with mood — except CHAOS-aligned "tricksters," who rarely join even when pleased (10–30%) and are more likely to demand more or run off with a gift.

Gift pricing runs on a taste matrix by family (tech/both/spirit/plain/silver preferences differ by family — hardware loves silver, folklore loves spirit items and dislikes tech, hybrid is the generalist), with alignment match/mismatch nudging the value ±2 and a reaction scale from hate (rejects and attacks) through meh (keeps asking, up to 3 times) to like/love.

The party caps at **4** (KURA + 3). A demon that wants to join a full party offers a swap instead — the player picks who to send away (KURA can't be swapped) or declines and the demon leaves.

**Dissonance (shipped v0.59, retuned v0.75):** the risk side of mixed-alignment parties. It is the same number as Patience, not a second meter. Every standing member (KURA included, via her own alignment) has a gap against every other standing member (same alignment 0, one side NEUTRAL 1, LAW vs CHAOS 2), and a member's tension is the worst gap against anyone else standing, computed live.

Only an opposite pair (gap 2) wears at all; a gap of 1 costs nothing, so **NEUTRAL is the bridge**:

| Source | Gap 2 | When |
|---|---|---|
| Fighting | −1 | once, when a fight is won (not every round) |
| Lingering | −1 | each time the stay in a hot room (heat tier 2+) crosses another 30 actions |
| Skipping | −1 | once per return, if any real day passed with no charge spent and no STANDBY |

The starting party (ELF and CU SITH are CHAOS, PIXIE and a fresh KURA are NEUTRAL) is at peace until KURA herself turns LAW or a LAW demon joins. Each source is 1 point against a night's +3, so tension erodes a party only if it is fed every day.

**Read-out:** Patience's own level doubles as the Dissonance read: **CALM** (3–5), **STRAINED** (1–2), **FRACTURING** (0, the existing warn-then-snap/leave zone). A member at 0 with tension present gives an alignment-flavored line. Snap behavior is unchanged: CHAOS members strike and stay, LAW/NEUTRAL leave.

**Settled but not built:**
- **Give**: handing an item to a party member to restore their Patience, priced by the taste matrix.
- **Omen tie-in**: e.g. a `calm` day boosting a tense pair's regen.
- **Cross-alignment combo skills**: fixed pairings that only exist with an opposing pair in the party (floated: PING + REDCAP, CRON + BANSHEE). Pure parties get smaller, steady perks.

Recruiting already leans KURA toward the new member's alignment (Part 6), a brake on mixing.

---

# Part 6: Alignment system

KURA's alignment is one hidden float, `alignScore`, clamped to **[-6, +6]** — negative is LAW, positive is CHAOS. Actions nudge it by fixed amounts: searching patiently −0.03, searching a hot room +0.2, talking −0.15, fighting +0.3 (killing +0.6), paying silver −0.4, offering an item +0.4, running +0.15, finding a LAW/CHAOS-aligned relic ∓0.3, drinking ichor +0.8, restoring a corrupted demon −0.5, and recruiting a demon nudges toward *its* alignment.

Each real shift decays in weight the more choices pile up (`weight = max(0.4, 1 − 0.02×(shift count − 1))`) — early choices count fully, later ones shrink toward a 40% floor, so alignment is mostly set by a run's first meaningful decisions rather than its last.

Thresholds use hysteresis to avoid flickering: `score ≤ −3` → LAW, `≥ 3` → CHAOS, `|score| ≤ 1` → back to NEUTRAL; between 1 and 3 the existing tag holds. A tell line fires on an actual flip, and a separate near-flip line ("Something is pulling at you.") fires once at `|score| ≥ 2.4` while still NEUTRAL.

A demon's own alignment comes from its family (data → LAW, folklore → CHAOS, hardware/hybrid → NEUTRAL) with a handful of named outliers. `stance()` compares KURA's alignment to a demon's (same/neutral/opposite) and feeds both talk odds (Part 4) and gift pricing (Part 5).

**Alignment tag naming (not decided):** the current tag is `[LAW]`/`[NEU]`/`[CHA]`, between SILVER and ICHOR, with a `<`/`>` pull mark on the action that just leaned it.

- **Renames, same mechanic:** `[SYS]`/`[NEU]`/`[OLD]` (the system vs. the old layer), `[COR]`/`[NEU]`/`[STR]` (corp vs. street), `[COD]`/`[NEU]`/`[RUN]` (code vs. rune), `[ORD]`/`[NEU]`/`[WLD]` (order vs. wild).
- **Different driving axes** (need new demon-affinity rules, not a drop-in): data vs. flesh, talk vs. fight, careful vs. reckless, sun vs. moon, debt (`[OWE]`/`[EVN]`/`[OWN]`).
- **Finer-grained:** a 5-step tag, or two side-by-side axes (Law/Chaos + Light/Dark) — both cost more UI space than the single bracket.
- **Recommendation on file, no decision:** `[SYS]`/`[NEU]`/`[OLD]` if just renaming; talk-vs-fight if a different axis is wanted, since it fits the recruiting-focused loop.

---

# Part 7: Items, ICHOR, altar & camp

**Rarity tiers:** COMMON, UNCOMMON, RARE, MYTHIC, MOON (12/12/12/6/4 items per catalog). Only RARE and up carry a LAW/CHAOS/NEUTRAL alignment — finding or offering one nudges KURA's alignment accordingly (Part 6).

**ICHOR** heals a fallen party member at 3 ICHOR/HP, a standing one at 1 ICHOR/HP. KURA herself can't be fed ICHOR, but can drink it directly: 10 ICHOR for +5 HP, +1 taint, and a CHAOS nudge.
- Taint thresholds: at 3, random "seeing things" lines start appearing; at 6, a forced TRIP for 50–100 actions (or until she sleeps). Tripping doubles melee damage but risks hitting an ally, may flip a demon-question answer, triples deep-find speed, and makes the turn counter unreliable. Coming down costs real HP. Taint decays 1/night, or clears instantly on a Forge fixture use or STANDBY/camp night.

**Breaking items** (ones with no defined use) has tier-based odds — 8% COMMON down to 0% for MOON items — that can't even trigger before a minimum number of uses (10 tries for COMMON up to effectively never for MOON). Spirit-natured items are 1.5× more fragile at full moon, 0.5× at new moon. A party member who's a "fan" of the item's nature can snatch it away once before it breaks. Breaking heats the room, leans alignment, and costs every standing member 1 Patience.

**Usable UNCOMMON items** include a medicine vial (heal ⅓ max HP), prayer cloth (small revive-and-heal), and a black candle (−8 room heat).

**Altar (MATRIX ALTAR):** an offering terminal rather than a searchable fixture — offers silver (`20 × floor depth`, if affordable) or up to five carried items as a gift, priced the same way a demon mid-recruitment would price them (Part 5's taste matrix).

**Camp jobs** (only on a STANDBY/camp night, and only if the right PROGRAM is in the party): COMPILER merges two COMMON items into one random UNCOMMON; CACHE duplicates a COMMON item.

---

# Part 8: Omens & moon phases

The daily omen is a deterministic function of the real UTC calendar day — identical for every player, immune to reload-rerolling, and the same mechanism the floor-shape layer (Part 10) and the async design lean on. About half of days roll `"none"` (no effect); the rest are one of eight keyed effects, four of which also carry a LAW/CHAOS lean:

| Key | Effect | Lean |
|---|---|---|
| data | ×2 data/hardware demon weight | LAW |
| folk | ×2 folklore/hybrid demon weight | CHAOS |
| heat | ×2 heat gain from searching | — |
| hard | ×0.5 search "worth" (finds harder) | LAW |
| easy | ×1.6 search "worth" | CHAOS |
| talk | ×1.6 talk-listen chance | — |
| calm | ×0.5 heat gain | — |
| loot | ×3 rare-item chance | CHAOS |

**Streaks:** three consecutive real days sharing the same lean (LAW or CHAOS) trigger a **100% guaranteed** room the day the streak first completes — not a probability boost — LAW guarantees an Archive (bonus) room, CHAOS guarantees THE VOID. Because CHAOS has three qualifying omen keys against LAW's two, the streaks aren't symmetric: simulated over 20,000 days, LAW streaks land around 1-in-513 days, CHAOS around 1-in-160 — noticeably more common. Flagged as a tuning knob, not yet addressed. The "rare and telegraphed" design goal is only half-met: the streak itself is rare, but no in-game buildup cue exists yet to signal one is forming.

**The ordinary (non-streak) bonus roll** is separate and private per account: capped at twice a real lunar month, never two days running, odds following the real moon (3% at new moon up to 7% at full) — averaging out to roughly 1.3 bonus floors a month before the cap even binds. This path only ever produces the Archive, never the Void.

**Moon phases** (8, from the real synodic month) drive several independent curves:

| Phase | new | waxing cres. | 1st qtr | waxing gib. | full | waning gib. | last qtr | waning cres. |
|---|---|---|---|---|---|---|---|---|
| Encounter chance ×| 0.8 | 0.9 | 1.0 | 1.1 | 1.25 | 1.1 | 1.0 | 0.9 |
| Bonus-room odds | 3% | 4% | 5% | 6% | 7% | 6% | 5% | 4% |
| Demon damage × | 0.8 | 0.9 | 1.0 | 1.15 | 1.3 | 1.15 | 1.0 | 0.9 |
| Talk success × | 0.7 | 0.55 | 0.45 | 0.3 | 0.1 | 0.3 | 0.45 | 0.55 |

Demons talk most easily at new moon and hit hardest at full moon — opposite curves by design. Full moon also raises the moon-drop chance on a kill, gives a 50% chance of a MOON-tier item from the lure locker instead of the usual roll, and makes spirit-natured items more fragile.

**Asking the moon (v0.72).** Looking up shows the night sky with the real moon at today's phase. SEARCHing her asks, once a night, free (no heat, nothing wanders in). With probability `[0, .15, .5, .85, 1, .85, .5, .15]` by phase she shows what one of the room's still-locked doors hides, never which door; otherwise she keeps her counsel. A new moon never answers and doesn't use the night's ask.

**Bonus room and THE VOID are parked (`BONUS_ROOMS = false`).** They took over a wing's passage or dead end, which one-room levels don't have. The streak trigger and the moon-weighted roll described above are still in the code, dormant, and neither room appears. To be redesigned.

**Omen banking** (Hold/Release, its cap of 1 and the 7-day cooldown) is described in Part 1.

---

# Part 9: Run structure, the moon's quarters & scoring

A new run starts KURA at 30/30 HP, 8/8 MP, alignment NEUTRAL/0, with a starting trio of folklore allies and a small kit (2–3 COMMON items, 1 UNCOMMON, and a small chance, 0.5% MYTHIC else 3% RARE, of a bonus rare).

**The dark rises by the moon.** The lunar month is cut into four equal quarters (`quarterOf`, about 7.4 days each). Each level of the pit belongs to one quarter and is lost when it ends: at the half moon, the full moon, the waning half, the new. A level's last day is the day its quarter ends; being still on it the next day ends the run ("the week ended" is gone; the dark closes over her). Sundays no longer matter.

**Where a run wakes** (`startSlot`): on the level the dark has reached.

| Moon's quarter | Wakes on | Height |
|---|---|---|
| First (new to half) | B4F | 1 |
| Second (half to full) | B3F | 2 |
| Third (full to waning half) | B2F | 3 |
| Last (waning half to new) | B1F | 4 |

If fewer than two days of the quarter are left, she wakes one level higher with the whole next quarter ahead (in the month's last two days, on next month's B4F). Everyone playing in the same quarter is on the same level, which is what the shared room (Part 10) will build on.

**Climbing.** The next level always belongs to the next quarter, so leaving early banks the rest of this one. From B1F she "climbs out of the pit, into open air": 1F. Nothing ends there yet; the run carries on upward, quarter by quarter, across months.

**Two numbers:** `st.height` is the level (1 = B4F, 5 = 1F); `st.climb` is how far into the run she is (1 on the level she woke on). Difficulty, the demon ladder and the board's count all follow `climb`.

**Scoring** tracks levels climbed, real days survived, and turns; the leaderboard ranks by levels climbed, then days, then earliest post (turns are shown, never ranked). Posting needs an ended run and a 3–10 character name, once per run. A finished run also reports a few plain counts for the title screen's totals (Part 11).

**THE PATH (v0.75)** sits at the top of the log: the whole run as a tree of choices, level by level, four to a row. Each level grows upward from where she came up; at every room a fork, one arm to the next room and the other to an `x`, the door not taken. Rooms carry a mark for what they were like (`"` warm, `~` quiet, `:` signal, `$` cold, `*` ash, `&` glow), never a name. Every level of the run is kept (about 100 bytes each). Meant to move to the end-of-run screen only, eventually.

**Decided, not built:** getting out is a finish (the monthly game can be won); past the surface is the endgame, with no top; two boards (this moon: who got out and how fast, then levels climbed, resetting each month; all time: highest past the surface). See the theorycrafting notes.

---

# Part 10: Async multiplayer

## Goal
Everyone feels like they're in the same place, without players being able to spoil it for each other, and with little hard-coded determinism.

## Status

| Piece | State |
|---|---|
| Shared offers / private rooms | Shipped v0.56, simplified for one-room in v0.70 |
| Everyone in a quarter on the same level | Shipped v0.77 |
| Faction seasons (tally, `/season`, title LEAN) | Shipped v0.60 / v0.62; Worker live |
| Title totals and rumor cards (`/stats`, `/event`, `/feed`) | Shipped v0.73 / v0.74; Worker live |
| The shared room: notes, bones, wards left for others | Designed, not built |
| Monthly and all-time boards, the finish at the surface | Decided, not built |
| Live presence, player economy | Accepted, not built |
| Bots that play the live game | Planned, not built |

## What is shared, what is private

- **Shared:** which two kinds are offered together each day of a level, for everyone on that level this lunar month (`seedFrom(epoch, height)`); the demon cast and loot pool; the omens and the moon; and, since v0.77, the level itself.
- **Private (`pseed`):** which kind is behind the left door and which behind the right, where things hide, the wildcard, every roll of a search or a fight.

The layout holds nothing to protect any more: every room is the same shape and faces north. That retired the minimap's rotate/mirror transform (v0.57), the self-avoiding path and the compass privacy work. A callout like "it's behind the left door" is useless to another player because left and right are shuffled per player.

**Lazy and client-side.** Offers are a pure hash of their inputs: every client computes the same answer with no network call.

**The shared room (next step, not built).** On a given day, everyone on a level stands in one of the same two rooms. Things left for others (fixed-phrase notes, bones, wards) attach to that room, keyed by month, level, day and kind: one small table, one fetch a day, a few thousand rows a day at most. Notes use fixed phrases, never free text. A thing "by the forge door" is stored by kind and drawn on each viewer's own side.

## The map

The in-game map is the path of choices, upright: the doors ahead on the top row, a row for the mark of which way she is turned, her room in the middle, two rooms behind her, each a step left or right of the next, with an `x` where the door not taken would have led. It mirrors the view (left is left) and "higher is north". A sideways version was considered and dropped for that reason.


## Faction seasons

**Season = one lunar epoch**, reusing `epochIndex()`.

**Scoring:** every ended run adds `floorNum(run)` points to its final alignment's side for the current epoch. A NEUTRAL run is the **kingmaker**: its points go to whichever of LAW/CHAOS is behind, and on an exact tie they go nowhere. This keeps a lopsided season contested and gives NEUTRAL a reason to exist in the metagame.

**Storage:** `faction_season (epoch, side, count)`, two rows per epoch (`LAW`, `CHAOS`). NEUTRAL never has a row.

**Write path:** inside the existing `POST /score` (`tallyFaction()`), only when the score row is new, so a retried post can't double-count. LAW/CHAOS is a blind upsert; NEUTRAL is one conditional `UPDATE`, which avoids a race between two NEUTRAL runs.

**Read path:** `GET /feed` returns the season, the title totals, the highest climb and the latest ambient events in one response; `GET /season` remains for older clients.

**Display:** the title screen's LEAN line and its Faction lean card (Part 11).

**Reward (not built):** cosmetic only — a board title, an omen-voice shift for the leading side. Nobody needs to win the season to play well.

**Known softness:** scores aren't provable and one sender can post five an hour at up to 20 points each, so the tally is forgeable. Acceptable while the reward is cosmetic.

## Lighter-lift shared ideas (not scheduled)

- **World boss** — one demon identity fixed for the whole epoch, same for everyone, extending the named-demon pattern (ATOM SLASHER).
- **Season title** — a generated name and theme line per epoch ("The Hollow Moon") on the title/log screen.
- **Epoch-scoped leaderboard** — a board that resets each lunar month beside the all-time one.
- **Aggregate counts** — running epoch tallies (demons beaten, "412 runs ended on B2F this week"), as flavor or as a threshold that nudges the next epoch. Same counters table shape as faction seasons, keyed by calendar week.
- **Sighting log** — anonymized "spotted on B5F" posts for the world boss or a MYTHIC find.
- **One-time shared loot** — a rare locker that exists once per floor-epoch; first to open it wins, later players see "emptied by [name]." Needs an atomic first-wins write.
- **Dropped: shared room heat** — needs per-room state shared across every player; the most expensive idea here.

## Harder ideas considered, and the calls made

- **Ghost replays** — rejected. Recording a full run as a canonical-shape action sequence and replaying it as an AI party member/rival in someone else's run, translated through their private transform. Interesting but heavy and redundant with the notes/demon-echo ideas already in scope. (A lighter cousin — passive route *traces*, not full replays — is noted under Notes/leavings below.)
- **Live presence** — accepted. A signal that another player is active on the same floor depth right now (not location). Needs something beyond simple request/response Workers; landed on **Cloudflare Durable Objects**, which has a genuine free tier (100,000 requests/day, 5GB SQLite storage) — fits the existing Cloudflare-only stack with no separate server needed.
- **Player-to-player economy (items/silver)** — accepted, favorite piece of the whole design. See below.
- **Full server-authoritative gameplay / real accounts** — rejected for now. Would solve cheating cleanly but means every action round-trips to a server and the game stops being a static client — too big a shift from the low-friction, mostly-client-side feel wanted. There's also a hard technical reason: Cloudflare Workers' free tier caps CPU time at 10ms per request, nowhere near enough to replay a whole run server-side to verify a submission. That's part of why the hybrid/event-sourced trust model below is the right fit, not just a scope preference.

## Player identity & economy

**Identity: a self-custodied secret key, not an account.** A long random key generated client-side the first time a player touches the economy — conceptually the same pattern as the existing `[P]ASS` run-password system, just longer-lived and higher-entropy. No email, no login screen, no password reset flow. Losing the key loses the economy identity, same tradeoff as losing a run password today; acceptable for a low-friction solo project. (Considered and set aside: social login — still "an account," just outsourced. Device-bound-only identity — breaks cross-device trading. Blockchain — the only useful piece it offers is a public/private keypair for self-custodied identity, which can be had directly via ordinary browser crypto with none of the fees, wallet-UX friction, or NFT/crypto-asset regulatory baggage a real chain would drag in.)

**Trust model: hybrid.** Local saves stay fully client-editable — a player can hack their own save all they want, and it's harmless, same as any single-player save-edit, because it never touches the economy. Economy-eligible items only enter the system via real-time find-events posted to the Worker as they happen (same shape as the existing score-posting flow, with similar plausibility/rate-limit checks) — the Worker's D1 ledger, never the local save, is authoritative for anything tradeable. Trading moves entries within that server-held ledger only. (This event-sourced approach is also the practical workaround for the 10ms CPU cap noted above — verifying a small, contemporaneous event is cheap; replaying a whole run to verify a save is not.)

**Worker scope estimate:** roughly 1.5–2x the size of the existing leaderboard Worker — a couple new D1 tables (item ledger, trades), 3–4 new endpoints (post a find-event, create/accept a trade offer, fetch a ledger), and bearer-style auth (compare the request's secret key against the D1 record, same pattern as the existing `x-admin-key` check). Not a different hosting model, just more of the same kind of work already done.

**Hosting:** the whole stack — leaderboard, economy ledger, trades, and live presence — can plausibly stay on Cloudflare Workers + D1 + Durable Objects, all with usable free tiers, no separate rented server needed even at the "real server-authoritative" end of the spectrum, since Durable Objects are built for exactly that kind of per-session stateful coordination. ([Cloudflare Durable Objects pricing](https://developers.cloudflare.com/durable-objects/platform/pricing))

**Free-tier numbers worth keeping on hand:**
- Workers: 100,000 requests/day, ~1,000 requests/minute burst cap, 10ms CPU time per request, limits reset daily at 00:00 UTC.
- D1: 100,000 rows written/day, 5,000,000 rows read/day, 5GB storage.
- Durable Objects: 100,000 requests/day, 13,000 GB-s compute/day, 5M SQLite rows read/day, 100,000 rows written/day, 5GB storage — all free.
- When a VPS would actually be warranted: full server-authoritative simulation, true long-lived/real-time connections, wanting a conventional relational DB for heavy queries beyond D1's comfort zone, or a usage scale where Cloudflare's metered pricing would exceed a flat VPS cost — judged to be far beyond where this game would start.

## Read-budget / scaling strategy (for when the game has real traffic)

Not urgent at current scale, but cheap to build in from the start:

- **One data packet per player per day.** Fetched once when a player first acts on a new day or climbs to a new level, cached client-side keyed by (day, floor), only re-fetched when either changes. On fetch failure, proceed with an empty/stale packet — never block play.
- **Every query indexed and limited.** Matching D1 index for every `WHERE`/`ORDER BY` column set; every query carries a `LIMIT`. No `COUNT(*)` over a full table — incrementally-updated counter rows instead. No `ORDER BY RANDOM()` — instead assign each record a random "bucket" number at write time and rotate which bucket the daily packet pulls from.
- **Batch writes at run-end / event-post time** rather than many small writes.
- **Rough budget estimate:** a packet of ~10 counters + 2 faction rows + 10 notes/bones + 5 echoes ≈ 30 rows read; at 1,000 daily players that's ~30,000 rows/day against a 5,000,000 cap — not a concern until well into tens-of-thousands-of-daily-players territory.
- Explicitly **not** a fix for anti-cheat — forged local saves could still inflate what gets posted into notes/bones/counters; that's mitigated only by keeping all of this cosmetic/low-power and by the event-sourced economy ledger above, not by the read-budget rules.

## Notes, bones, and other things players leave behind

- **Left messages / Souls-style notes** — attached to a room *kind*, not a room *location*. Should use **fixed phrase lists, not free text** — prevents both abuse and accidental spoilers.
- **Bones (NetHack-style)** — on run end, keep a snapshot (name, floor, cause of death, party, last words); later players who reach that floor depth find the remains, with fixed loot and flavor text.
- **Demon echoes** — a demon that corrupted/killed someone in one run can re-spawn (reskinned, maybe carrying a trace of the original player's name) as a wandering demon in someone else's run.
- **Route traces** (lighter cousin of the rejected ghost-replay idea) — a compact breadcrumb (room, day, search count) surfaced as a faint minimap trace or a line like "[name] was here, day 3." Since "room" here means a canonical shape-layer slot, showing a trace meaningfully still requires translating it through the viewer's own private kind/compass assignment — treat as a "maybe, at small scope."
- **Altar gifts** — a player can leave a COMMON/UNCOMMON item at an altar for a stranger to find later; kept low-rarity deliberately, to limit how much a forged save could abuse it.
- **More frequent leaderboard posts** — post progress on each floor descent, not just run-end, so the board becomes a live "who's where" feed.

---

# Part 11: Title screen

Shown first on every load, even with a run in progress; `CONTINUE` is the explicit resume. It reuses the in-game frame's zones at the same 80 columns. All five stages are shipped.

- **Top box:** the real in-game moon/date header.
- **3D-view slot:** a static wordmark, `DAILY DIGITAL` / `DEMON DUNGEON` / `a daily dungeon crawl`.
- **Log box:** three facts that hold until the day rolls over:
  ```
  > LEVEL     B4F  -  7 days left, closes SUN, at the half moon
  > EPOCH     epoch 331, day 1 of 29  -  new shape in 28 days
  > LEAN      this season leans CHAOS   [||||||||.........]  35 / 65
  ```
  LEVEL is the level the dark has reached and when it takes it; with under two days left it says new runs wake a level higher.
- **Sidebar, "RUMORS AND SECRETS":** a pinned header over a scrolling list of cards, one blank line between cards, long cards wrapped. One line every 1.4 seconds, fixed order per load.
- **Menu bar:** `[N]EW RUN   [C]ONTINUE   [B]OARD   [?] ABOUT`. ABOUT carries `[P]ASSWORD` even before a run exists.

**Number cards (v0.73).** Exact, anonymous counts for the current lunar month, from every run posted to the board: last fall, runs ended, players seen, turns logged, pacts made and ended, items broken, TRIPs, longest wall search, gifts refused, SILENT answers; plus today's omen, the faction lean and the most levels climbed. A card shows only once its number is above zero. A finished run reports its counts with its score; the Worker adds them to `counters (period, key, count)`, capped per run.

**Rumor cards (v0.74).** When one of twelve moments happens in a run, the game sends the Worker a tag and nothing else (no name, no run, no free text): a gift thrown back, a demon's first question, a corrupted demon restored, a trickster running off, a pleased altar, a pact, a silent answer, a deep find, someone leaving, a fall, reaching the surface, and a beaten demon's last words (sent as an index into the game's own list). The Worker keeps the newest 20 of each, 30 an hour per sender. The title turns them into vague lines that refer to the moment without quoting the game; last words are quoted and never attributed. Numbers and rumors are mixed, never more than two of a kind in a row. Forging one is cheap and harmless: nothing ranks on these.

**One request:** the title reads everything from `GET /feed`.

**The fight-end screen (v0.74)** unfolds a beat at a time (art, last words, verdict, each line, `[ OK ]`), 0.7s apart, and closes only from `[ OK ]`.

# Part 12: Open questions

- **Balance of one-room:** heat in a single room, no running once the charge is spent, no going back to heal. Unplayed.
- **The finish at the surface, the endgame and the two boards** (Part 9): decided, not built. What is at the top is open.
- **Bonus room and THE VOID** (Part 8): parked, need a new home.
- **Dissonance** (Part 5): exact numbers, the Give action, the omen tie-in, combo skills.
- **Alignment tag naming** (Part 6): no decision.
- **Omen banking** (Part 1): whether Hold should cost something, a cap above 1, a named buff for the day after a held day.
- **Omen streaks** (Part 8): parked with the rooms they trigger; CHAOS streaks are about 3x as common as LAW streaks.
- **The moon's odds** (Part 8): first guesses, kept "for now".
- **The shared room** (Part 10): cosmetic-only or functional for whoever finds a thing. A blanket rule ("anything visible to other players is flavor-only") would settle it for notes, bones and wards at once; not adopted.
- **Economy and presence:** trade-offer UX, key backup; presence was planned on Durable Objects here, while the bot-testing notes chose a simpler heartbeat. Unresolved.
- **Bots:** whether they count toward the board and totals.
- **Faction season reward**, the rumor wordings (the dev means to rewrite them), KURA's own last words, the broken half-digital walls.
