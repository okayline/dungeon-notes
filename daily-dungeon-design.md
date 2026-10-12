# Daily Dungeon — Design Doc

How the game plays and why. Current as of **v1.02**: wing-based levels, a climb out of a pit on the moon's clock, breath, live presence, and the exchange (a player economy, traded at a screen in every dead end).

One file, no version suffix; git history is the version history. Ideas that are not built and not yet settled live in `theorycrafting-notes.md`. Exact per-release detail lives in `CHANGELOG.md`.

**A note on history.** v0.70 to v0.78 rebuilt the game as "one room a day" (a single room, two doors on one wall, no going back). v0.80 rolled that back to the wing floors of v0.62 and kept the layers added on top: the pit, the moon's quarters, the open sky, the title feed. Nothing below describes the one-room game; the changelog has it.

---

# Part 1: The premise and the daily loop

**The premise.** KURA wakes in a pit and climbs out. The pit is four levels deep: **B4F** at the bottom, then B3F, B2F, B1F, then the surface (**1F**) and on upward with no top. The dark rises from below, a level at a time, on the moon's clock (Part 9). There is no ceiling anywhere: looking up shows the night sky and the real moon.

**One key a day.** One real-world day gives one **key**, spent by:
- unlocking a **locked** door (the game's main action), or
- going on **STANDBY** (resting instead of moving).

Unlocking only opens the door; she walks through when the player chooses, and open doors stay walkable. Everything else is free of the key: searching, turning, walking between rooms already open, looking up, talking to the party or to demons, using items, the altar, scrying the moon. The gate is a single boolean, `today(st).stepped`. (The key was called a "charge" from v0.70 to v0.81; it is "key" and "unlock" everywhere again since v0.82.)

**Breath (v0.83).** What limits how fast she acts within a day. Six breaths (`BREATH_MAX`), shown as the bar under the map, which closes in from both sides as they are spent and is gone at zero.
- **Costs:** a search (walls, doors, archways, a terminal, a fixture) and a scry take one; using an item from the bag takes one; a step into another room or up the stairs takes half (`STEP_BREATH`). Turning, looking up, unlocking, talking and fighting take none.
- **At zero** she can't search, use an item (except in a fight, where it is never refused) or step (except when running from a demon). "KURA is out of breath."
- **Pressing on makes the wait longer (v0.98).** Each refused try (a search, a step, the bag) pushes the recovery back half a second, to at most ten seconds past the usual wait. A held key counts once; clicks always count.
- **It comes back in real time,** starting 2 seconds after the last one spent, slower the emptier it got: climbing from n to n+1 takes `[10, 8, 6, 4, 3, 2]` seconds, so about 35 seconds from empty and a few seconds from a small dip. It follows KURA from room to room and refills while the page is closed.
- **On screen (v1.01-v1.02):** the bar is one white run with a dark square at each end, 20 columns, closing in up to 10 a side; what is left keeps its dark ends. It is nudged about two thirds of a column on the page so it sits in the middle of its panel. A `>` and a `<` press on it for one second whenever a breath is spent; while she is out, a countdown beside it shows the seconds until she can act again.
- **The dots over it** count the other way from the bar: one when rested, one more for each breath spent, seven when out, three columns apart and centered over the bar (they grow from the middle as the bar closes), drawn half again as big. (Until v1.01 the bar was drawn from the moon's phase shapes and a dot marked today's phase.)
- Heat (Part 3) is separate and is what total searching costs; breath caps the rate.

**STANDBY** spends the day's key without moving (blocked while a demon is in the room). On the *following* rollover a STANDBY night triggers "camp" effects:
- every standing party member restored to full HP/MP and full Patience,
- taint reset to 0,
- the room's heat cleared,
- the loop-detection counter reset,
- any camp-triggered PROGRAM jobs run (COMPILER, CACHE; Part 7),
- and that night's omen gets **banked**.

**Omen banking (Hold Omen / Release Omen):** a STANDBY night banks that day's omen in `st.bankedOmen`: one slot, a newer held day overwrites the old one. The banked omen waits until the player releases it (`useBankedOmen`), which applies it in place of that day's natural omen; it's gone at the next sunrise. A scheduling tool, not a reroll.
- **Cooldown:** releasing starts a flat **7-real-day** cooldown before KURA can hold again. The cost sits on Release, not Hold.
- **UI:** one morphing button with its own `H` key in the bag's pinned foot block: `Hold Omen`, `Release Omen`, `Hold Omen (Nd)` while cooling, or greyed when it can't be used.

Every action runs `sync()` first, which also: halves every room's heat overnight, decays taint by 1, restores 3 Patience to each party member, heals a little HP, rolls that day's bonus/void room (Part 8), and checks the level's deadline. Missing it ends the run (Part 9).

**Controls.** Under the view: `[  ^  ]` walks through the door she faces (at a bare wall it searches) and `[ < ]  N  [ > ]` turn, with the compass letter between. The bottom bar is `[T]ALK [I]NVOKE [S]EARCH [M]OON`. `[M]OON` looks up at the sky and, pressed again, level; while she looks up `[S]EARCH` reads `[S]CRY`. `[F]IGHT` left the bar in v0.93: it lives in the fight box, where it is used.

**The three log lines** (v0.89 on). Top: the flavor line (the place, the party, a demon's words, and a question with its `[Y]ES [N]O [S]ILENT`). Middle: what KURA just did. Bottom: a line typed out as if at a terminal (Part 11).

**How a search plays out** (page-side, v1.02 "Hold Your Breath"). Each of the three log lines has its own voice: line 1 the party, line 2 KURA, line 3 the rest of the pit.
- **Line 2:** the lead-in ("KURA searches the WEST wall...", "KURA listens at the door", "KURA scries the moon...", "KURA reaches for the screen") and three dots, one at a time; only then does the search happen, so a demon, a find or a terminal never appears the instant the key is pressed.
- **A good find waits longer:** a RARE thing or the stairs gets three more dots, a MYTHIC or MOON thing five.
- **Line 1, good finds only:** while those dots run, someone standing in the party reacts ("PIXIE leans closer.", "ELF goes quiet."; "KURA holds her breath." with nobody). It lasts until her next action. The party only reacts when something good is coming, so the reaction is the tell.
- **The result is typed** a letter at a time (30 ms), a sentence at a time with a one-second beat between, in a color for what it is: grey for nothing or a common or uncommon thing, silver for SILVER, blue for rare, bright gold for mythic and the deep find, lavender for a moon thing.
- **Line 3** goes quiet (a bare `>`) for every search. After a good find it says one whole line from the pit, held six seconds: others on her level right now hear it ("On this level, someone else stops to listen."), or the dark does ("Somewhere above, the dark shifts."); the moon and the stairs have their own lines. Then it goes back to its round.
- **The "KURA FOUND" box** opens only for good finds (RARE, MYTHIC, MOON, the stairs), after the typing. Lesser things go into the bag on line 2 alone.
- There are no glows, dimming or other effects anywhere: a standing rule.

---

# Part 2: Levels, wings & rooms

- A level has `KINDS = [den, bay, relay, vault, forge, altar]`, plus two kinds never dealt into the rotation: `archive` (the bonus room) and `void` (its opposite).
- A level lasts `days` (3 to 7: the days left in its moon quarter when she arrives, capped at 7), giving `pairs = days - 1` door-offers.
- **The deck:** the six kinds are shuffled twice and concatenated, retried until no pair repeats a kind, then dealt two at a time, one offer per wing. **The last offer is a wildcard:** one door of a kind rolled from the private seed, never part of the shared deck.
- **Wings:** every wing is exactly three spaces: K (the room entered), P (a passage) and X (a dead end), as a chain (K, P, X) or a star (K to P, K to X). Every wing but the last hangs **two locked doors** off K or P. Unlocking one seals the other for good.
- **The last wing** has one door (the wildcard's) and hides the stairs up in its passage or dead end. The stairs are found by searching their wall, then walked through like a door.
- **The dead end is the exchange room (v1.00).** Every dead end with no other kind has the exchange's screen in one wall (Part 12), the same for everyone on the level, and is named for it: Exchange, Xchange, Trade floor, Market end, Ticker room, Trading gap, Swap room.
- **Painted doors:** some walls carry a false door. Trying it costs nothing and keeps the key.
- **Lure room:** about 60% of levels hide one locker (`?`) in a wing's dead end.
- **Two seeds:** the shared `seed` (from the lunar epoch and the level's height) picks wing shapes and which two kinds are offered together; the private `pseed` (re-rolled every level) picks which kind is behind which door, where things hide, the wildcard's kind, and bonus/void placement.
- Floor format `v: 11`. A save from another format starts a new run.

---

# Part 3: Room kinds, searching & heat

Each kind-room (den/bay/relay/vault/forge) hides a **fixture** behind one wall, found by searching like anything else, usable once a day:

| Kind | Fixture effect |
|---|---|
| Den (CYBER-DEN) | Heats the room to at least 60% of max: "the room stirs" |
| Bay (RECHARGE BAY) | Safe room (no encounters); fixture heals the party ⅓ max HP |
| Relay (SIGNAL RELAY) | Reveals a clue naming the wing's *other* offered kind |
| Vault (DATA VAULT) | `R(40,110) × levels climbed` SILVER |
| Forge (FORGE-NODE) | Clears taint to 0, ends a trip |
| Altar (MATRIX ALTAR) | No fixture: an offering terminal in a wall (Part 7) |

Room type names are never shown. Each room has a flavor name in the slot under the map ("Soft room", "Walkway", "Dead end"); while she looks up the slot reads THE SKY or THE MOON.

**Archive** (bonus room, at most one a level): a locker, two items and silver, no demons; items roll RARE 35% / UNCOMMON 65%; silver doubled; entering yields a friendly PROGRAM. **Void:** two demons, nothing else; entering spawns a hostile demon, corrupted unless it is a program or a unique. Both are placed by the daily roll in Part 8, and since v1.00 always in a wing's passage (never the dead end, never the stairs wing).

**Where things hide:** behind the walls with no door (never a door, never the altar's terminal wall, never the exchange screen's wall). There is no floor or ceiling to search. Ordinary rooms hide a shuffled mix of demons, items and silver; a passage only items or silver; a dead end also holds the scrap that names one of the wing's two doors (never which).

**Searching** is NetHack-style: each hidden thing needs `5–10` base search-points, scaled **×1.5 per prior find on that wall**. Each search adds up to about 1.9 points, scaled by the day's omen, the room's heat tier (calm rooms yield more), a rested-day bonus (×1.25 the day after a STANDBY night), and moon fullness (up to ×1.35 at full). About a third of rooms hide a much deeper MYTHIC find (20–50 points).

**Item rarity on a find** (`rollItem`): `rare = 8% × the omen's loot multiplier`, else `32%` uncommon, else common. Found money reads "N SILVER, loose in the rubble." (`R(20,150)`); the word "coins" was retired in v0.92.

**Doors** can't be searched for hidden things but give something up: a locked door has about a 55% chance of a sense-clue toward the kind behind it (warm: Den/Forge, hum: Bay/Altar, cold and static: Vault/Relay); a painted door gives itself away; a sealed door reads as sealed; an open archway describes the room beyond without naming it.

**Heat** is per room: each search adds 1 (scaled by the omen), up to 24 (`HEAT_MAX + 4`; the top tier is named "wrong"), and it raises the encounter chance and lowers search yield. It halves overnight and is cleared by a STANDBY night. It is not shown. (v0.81 briefly showed it on the moon strip and cooled it in real time; v0.83 gave the strip to breath and put heat back as it was.)

---

# Part 4: Combat & demons

**Encounters** never trigger in a Bay or a passage. Elsewhere, chance per search is `(1/24 + (1/4 − 1/24) × min(1, heat/20)) × moon multiplier` — roughly 4% cold up to 25% at max heat, scaled 0.8×–1.25× by moon phase.

**Demon HP:** `round((16 + 9 × floor depth + R(0,8)) × unique multiplier × (1.15 if corrupted))`. Named uniques (e.g. ATOM SLASHER) carry their own HP/hit multipliers and can be flagged untalkable.

**FIGHT:** each standing member rolls `R(1,4) + floor(level/2)`, summed into the hit; demon HP drops by the total. While KURA is tripping, a third of her blows land on a random hurt ally instead (double damage, never fatal) — otherwise her hit is doubled.

**Demon's turn:** targets KURA 40% of the time when she's alive, otherwise a random standing member. Damage is `max(1, round(R(2, ceil(HP/3)) × moon rage multiplier × unique hit multiplier × 0.67 if a WATCHDOG is present))`. KURA hitting 0 HP ends the run.

**TALK:** a demon listens with probability up to 95%, built from a moon curve (most willing at new moon, least at full moon) × 0.7 if corrupted × the day's omen talk multiplier × a stance multiplier (1.5 same-alignment / 1 neutral / 0.6 opposite). Programs always listen. A demon that doesn't listen has a 50% chance to get angry and attack instead. One that does listen asks 2–3 yes/no questions before sizing up (Part 5).

**RUN:** 50/50 whether the demon blocks the way (can't retry that encounter) or KURA gets away. The ways out are an open door, found stairs, or a locked door. A locked door takes the day's key **only if she gets through**: a blocked run costs nothing but the demon's blow. Running costs a breath if she has one and is never refused for want of one. Difficulty everywhere in this Part scales with *levels climbed in the run* (`st.climb`), not the level's name, so a late start high in the pit meets first-level demons.

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
| Skipping | −1 | once per return, if any real day passed with no key spent and no STANDBY |

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

**Scrying the moon (v0.72; `[S]CRY` since v0.87).** `[M]OON` looks up at the night sky with the real moon at today's phase. Scrying her asks, once a night; it costs a breath, no heat, and nothing wanders in. With probability `[0, .15, .5, .85, 1, .85, .5, .15]` by phase she shows what one of the still-locked doors hides (this room's, or failing that any seen on the level), never which door; otherwise she keeps her counsel. A new moon never answers and doesn't use the night's ask.

**Bonus room and THE VOID are live again (v0.80).** Since v1.00 they take over a wing's passage only (the dead end holds the exchange), never in the stairs wing; the streak trigger and the moon-weighted roll above place them. Their placement is private per account.

**Omen banking** (Hold/Release, its cap of 1 and the 7-day cooldown) is described in Part 1.

---


# Part 9: Run structure, the moon's quarters & scoring

A new run starts KURA at 30/30 HP, 8/8 MP, alignment NEUTRAL/0, with a starting trio of folklore allies and a small kit (2–3 COMMON items, 1 UNCOMMON, and a small chance, 0.5% MYTHIC else 3% RARE, of a bonus rare).

**The dark rises by the moon.** The lunar month is cut into four equal quarters (`quarterOf`, about 7.4 days each), each named for the moon it opens with. A level belongs to one quarter and is lost when it ends; being still on it the next day ends the run ("The moon turned. The dark rose and closed over KURA."). Sundays no longer matter.

| Quarter | Opens with | Level | Height | Lunar days |
|---|---|---|---|---|
| 1st | New Moon | B4F | 1 | 1–8 |
| 2nd | First Quarter | B3F | 2 | 9–15 |
| 3rd | Full Moon | B2F | 3 | 16–23 |
| 4th | Last Quarter | B1F | 4 | 24–29 |

**Where a run wakes** (`startSlot`): on the level the dark has reached. If fewer than two days of the quarter are left, she wakes one level higher with the whole next quarter ahead (in the month's last two days, on next month's B4F). Everyone playing in the same quarter is on the same level.

**Climbing.** The next level always belongs to the next quarter, so leaving early banks the rest of this one. From B1F she "climbs out of the pit, into open air": 1F. Nothing ends there yet; the run carries on upward, quarter by quarter, across months.

**Two numbers:** `st.height` is the level (1 = B4F, 5 = 1F); `st.climb` is how far into the run she is (1 on the level she woke on). Difficulty, the demon ladder and the board's count all follow `climb`.

**Scoring** tracks levels climbed, real days survived, and turns; the leaderboard ranks by levels climbed, then days, then earliest post (turns are shown, never ranked). Posting needs an ended run and a 3–10 character name, once per run. A finished run also reports plain counts and the demon that ended it, for the title's totals (Part 11).

**The end-of-run page** (v0.87) lists the run's counts and, under them, the level laid out a day to a column: `[v]`, a `< >` per two-door day, `[?]`, `[^]`; how many of each day's three rooms she walked into; and the room she took that day, by feel. The door she didn't open is always `?`, and so are the days ahead: the offers are the same for everyone on the level, so the page must not give them away.

**Decided, not built:** getting out is a finish (the monthly game can be won); past the surface is the endgame, with no top; two boards (this moon: who got out and how fast, then levels climbed, resetting each month; all time: highest past the surface). See the theorycrafting notes.

---

# Part 10: Async multiplayer

## Goal
Everyone feels like they're in the same place, without players being able to spoil it for each other, and with little hard-coded determinism.

## Status

| Piece | State |
|---|---|
| Shared shape / private contents, private map rotation | Shipped v0.56–v0.57; back since v0.80 |
| Everyone in a quarter on the same level | Shipped v0.77 |
| Faction seasons | Shipped v0.60 / v0.62 |
| Title totals and rumor cards (`/feed`) | Shipped v0.73 / v0.74 |
| Daily presence: who is in the pit, by level (`/here`) | Shipped v0.85 |
| Events that say where and who (`news`) | Shipped v0.90 |
| Bots: ten scripted players, daily | Running since Oct 11 (dungeon-notes `bots/`) |
| Live presence (right now, by level; counts only) | Shipped v1.00 (polling; Durable Objects deferred) |
| The exchange: player economy, offers, codes, stash | Shipped v1.00; the Worker picks the thing since v1.01 |
| Admin presence (`[H]ERE` in the X-mode board) | Shipped v1.02 |
| Things left for other players (notes, bones, wards) | Designed, not built |
| Monthly and all-time boards, the finish at the surface | Decided, not built |

## What is shared, what is private

- **Shared** (`seedFrom(epoch, height)`): the level, each wing's shape, and which two kinds are offered together day by day; the demon cast and loot pool; the omens and the moon.
- **Private (`pseed`):** which kind is behind which door, where things hide, the wildcard, bonus/void placement, every roll of a search or a fight, and the minimap's rotation.

**Lazy and client-side.** Shape and offers are a pure hash of their inputs: every client computes the same answer with no network call.

**The minimap** is the room map: visited rooms outlined, `#` a locked door, an arrow for her facing, `[v]` where she came up and `[^]` found stairs. Each player's is rotated or mirrored by one of eight private transforms (`floor.sym`), so "the east door" means nothing to another player. The compass in the game is each player's own.

## Presence (v0.85, live since v1.00)

A device with a living run POSTs `/here` `{ id, level }`. The id is 24 random hex characters kept in the browser (nothing personal); one row a device in `present`, overwritten. Bots' ids start `bot` (a page's never can).
- **Daily:** the first save of each day, as before. The feed returns how many devices were seen this moon, how many in the last 24 hours, and how many on each level (bots counted). "Players seen" on the title is this count; "Names carved on the board" is the separate count of names on finished runs.
- **Live (v1.00):** while a run is on screen, the tab is visible and a key or click came in the last 10 minutes, a ping every 3 minutes. A known device costs the Worker one row read and is rewritten at most every 2 minutes (or when its level changes); only a new id pays for the sender limit and the 60-day cleanup.
- **Right now** = seen in the last 5 minutes, bots left out, worked out at most once a minute per Worker instance and returned by every `/here` reply and by `/feed`. Counts only, never who or where.
- **Shown:** title cards `In the pit right now: N` and `On B3F right now: N` (plain, like the other numbers); in a run the typed line says it in sentences ("Three others are on this level with you."), her own device not counted. Nothing shows at zero.
- **Admin (v1.02):** `GET /admin/here` with the admin key lists every device seen this moon (a short piece of its id, level, how long ago, bot or not) and the counts; never the sender hash. In the game: X-mode board, `[H]ERE`.
- **Why polling, not Durable Objects:** for counts, Durable Objects add only seconds of freshness, at several times the work and a less predictable free-tier cost. They are kept for when something needs two players at the same moment (live trade handshakes).
- **Free tier:** an active player sends about 20 pings an hour; about 1,000 daily players fit the 100,000 writes a day.

## Events (v0.74, located since v0.90)

When one of thirteen moments happens (a gift thrown back, a demon's first question, a corrupted demon restored, a trickster running off, a pleased altar, a pact, a silent answer, a deep find, someone leaving, a fall, reaching the surface, last words), the game sends a tag and a few small fields: level, day on the level, room kind, lean, party size, levels into the run, the demon involved, the moon's phase, and the run's name. The Worker checks each field against a fixed shape, keeps the newest 20 of each tag in `news`, and returns them without the name: names are stored for later use and never sent out. Cost: no extra requests; a few hundred small rows in all.

## Bots

Ten scripted players (HAL, R2D2, C3PO, DATA, MARVIN, BENDER, GORT, TARS, WALLE, ROSIE, each with "-bot") take one day's turn each in the real rules, from a GitHub Actions timer in dungeon-notes, three sittings a day. Each has a temperament and a way of handling breath; some skip days. Seven play a pinned build (`bots/roster.json`), three canaries play the latest. They post scores, events and the presence ping like any player, and keep a save, a diary and a shared `SUMMARY.md` (whose header names the pinned and latest versions and the newest real turn on file).
- **Kept off the leaderboards** (names ending `-bot`), but counted in the feed's totals, season tallies and daily presence; left out of the live count.
- **At the exchange (v1.00):** each has a key, reports its finds and trades by temperament (`TRADE` in `bot.js`: some give things away, some hoard, one takes everything). The Worker's `BOTS_PUBLIC` switch (`wrangler.toml`, "1" since v1.00) puts their trades in the live market with players, anonymously, to populate it; "0" keeps them to a market only the admin key can see.


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
- **Live presence** — built in v1.00 with plain polling (see Presence above). Durable Objects (free tier 100,000 requests/day, 5GB SQLite storage) stay the plan for anything that needs two players at the same moment.
- **Player-to-player economy** — built in v1.00, the favorite piece of the whole design. See below. Silver is not traded.
- **Full server-authoritative gameplay / real accounts** — rejected for now. Would solve cheating cleanly but means every action round-trips to a server and the game stops being a static client — too big a shift from the low-friction, mostly-client-side feel wanted. There's also a hard technical reason: Cloudflare Workers' free tier caps CPU time at 10ms per request, nowhere near enough to replay a whole run server-side to verify a submission. That's part of why the hybrid/event-sourced trust model below is the right fit, not just a scope preference.

## Player identity & economy (the exchange, v1.00)

**As built:**
- **What trades:** only RARE, MYTHIC and MOON things. Silver does not trade, and is run-only.
- **The key is in the password.** A long random key (48 hex) kept in the browser and copied into every run, so the password carries it; the `[P]ASS` box warns that whoever has the password has the stash. Loading a password with another key switches the browser to it (the replace prompt says so). The Worker keeps only the key's SHA-256.
- **Finds are witnessed.** When a tradeable thing lands in the bag, the page tells the Worker at once (`/eco/find`); a thing only exists in the ledger if the Worker saw it found. The page decides *that* something of a tier turned up; since v1.01 the Worker rolls its own dice for *which* thing of that tier it is, and the page renames its copy (the found box waits up to 1.2 s for it).
- **Limits:** per key a day RARE 3, MYTHIC 2, MOON 1; per sender (hashed address) a day 6/3/2; MOON finds at most 2 a lunar month per key (3 per sender), and only from waxing gibbous to waning gibbous; at most 5 new keys a day per sender. A refused or offline find stays an ordinary item in the bag.
- **Where things are:** RARE and MYTHIC are run-only: in a living run's bag, and they die with the run like everything else. A MOON thing the Worker counts goes straight to the **stash**, which keeps between runs.
- **Taking a MOON thing into a run** is a one-way door: it leaves the stash and the economy for good, so using one can't be undone by editing a save. At most one MOON thing a quarter that someone *else* found (bought, or given); your own finds are not capped.
- **Offers:** one thing, asking for nothing (a gift), any thing of a tier, or one named thing; public (in the market and the title feed) or private (by code only). A code is `XXX-XXX`. At most 3 open per key. Every offer closes, strictly, when the moon's quarter ends: the thing goes back (MOON to the stash, the rest to the run's bag if that run still lives). An offer dies with its run, like the bag. Taking one moves the thing to the taker (MOON to the stash, else into the bag) and the payment to the maker (a delivery their run picks up).
- **One run at a time** per key: a request from a new run retires the old one (its bag things and offers end). A retired run can't come back.
- **Anonymous:** offers, trades and the feed never say who.
- **Known softness:** the Worker can't see inside a run, so a cheater can still claim that a find of a tier happened (capped by the limits, never more than an honest player's daily best), and can use a thing locally and keep it locally. Nothing in the ledger is ever created or doubled. Making it impossible would take the server running the game (ruled out; the free tier's 10 ms CPU cap alone forbids it). A middle step, the Worker secretly deciding what each player's level holds, was discussed and not taken.
- **Tables:** `eco_owners`, `eco_items` (`bag`, `stash`, `escrow`, `gone`, `dead`), `eco_offers` (`open`, `taken`, `cancelled`, `closed`, `dead`), `eco_retired`. Endpoints: `/eco/find`, `/eco/mine`, `/eco/market`, `/eco/peek`, `/eco/offer`, `/eco/cancel`, `/eco/take`, `/eco/withdraw`, `/eco/end`.

**The thinking behind it (pre-v1.00), kept for reference:**

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

# Part 11: Title screen, the typed line & the feed

**The title** is shown first on every load; `CONTINUE` is the explicit resume. Top to bottom (v0.94):
- The in-game moon/date header (v0.99): `LUNAR DAY d/29  <kanji> <PHASE>`, then the weekday, date and time. The day counts the lunar month from 1 to 29 (the 29.53-day month rounded down to a steady 29), the same number the EPOCH line shows. The phase's Japanese name sits beside its English one: 新月, 三日月, 上弦, 十三夜, 満月, 十六夜, 下弦, 二十六夜 (the last is the traditional "twenty-sixth night"; v0.99.1 replaced a word that isn't in the dictionary). Kanji are drawn at 80% size in a two-cell box so the frame stays at 80 columns.
- **The wordmark** in block letters (the dev's own lettering), eight rows, with a fixed waxing crescent to its left (v0.96: seven rows by thirteen columns, flat blue, the lettering's own dotted block on its inner edge; the same every day, a phase-following version left for later).
- Under it, side by side:
  - **The level as a line of days** (`levelBones`): a dashed line of this quarter's lunar days with a branch off each, above and below in turn. Today's number is in brackets; days that haven't come show `?` and no branch. The shape is rolled from the lunar month and the quarter alone, so it is the same for everyone and different each quarter; it carries no information about the rooms. Heading underneath (v0.99): `B4F - 新月 New Moon - Lunar Days 1-8`, the quarter's kanji (新月, 上弦, 満月, 下弦) beside its name, laid out so "Lunar Days" starts in the same column for every quarter.
  - **RUMORS AND SECRETS:** a scrolling list of cards, six rows.
- **Three facts:** LEVEL (the level the dark has reached and when it takes it), EPOCH, LEAN.
- **Menu:** `[N]EW RUN   [C]ONTINUE   [B]OARD   [?] ABOUT`.
- **The `[?]` page** (v0.97) opens with a plain intro (what the game is, the weekly limits and the shared floors) and leaves the rest to find out; THIS RUN sits in a bordered box.

**Testing cheats and hosting (v0.95).** `X` (infinite steps) and `Shift+X` (the clock a day ahead) ask the Worker's `/admin` for the admin key; a cheated run can't post a score. The itch.io build is a separate zip of the same files with VT323 loaded by the FontFace API and the cheats blocked outright; every itch zip needs that lock. The Worker allows the GitHub Pages and itch.io origins, and bot names (ending `-bot`) are hidden from the board.

**Number cards.** Exact, anonymous counts for the lunar month: last fall, runs ended, in the pit right now and on each level right now (v1.00; no bots), players seen, in the pit today, on each level today, names carved on the board, turns, pacts and the share that lasted, demons beaten / spoken to / joined, the demon with the most falls, doors unlocked, STANDBY nights, levels climbed, the moon asked and answered, times out of breath, SILVER and rare finds, wall searches, gifts refused, silent answers. With no network: the moon's week and the days to the next, when the dark takes the level, days to the full moon, the new-moon line, omen streaks. A card shows only above zero.

**Rumor cards.** One vague line per recent event, never quoting the game except a demon's last words, which are quoted and never attributed.

**Market cards (v1.00).** The newest public offers and the latest trades, nobody named: `MARKET: a moonstone, for any RARE. Code K7Q-2MX`, `Traded: x, for y`, `Given away: x`. They also ride the typed line's news of everyone else.

**One request:** the title reads everything from `GET /feed`.

**The typed line** (the bottom log line in a run, v0.91). A `>` and then a sentence typed a letter at a time (about eight a second, a breath at punctuation); it holds five seconds with the `_` blinking, is deleted a letter at a time, waits two seconds, and the next is typed. It carries the run's status reports as they change, and otherwise two lines about this run to one about everyone else:
- **This run** (about thirty, each only when it applies): rooms of the level walked, days before the dark takes it, today's key, who walks with her, who has fallen or is hurt or is running out of patience, pacts, demons met and beaten, talks, gifts, silences, searches and finds, longest stay at one wall, rare finds, things broken, doors, levels, STANDBY nights, a held omen, the moon, times out of breath.
- **Everyone else:** how many others are on her level right now and today, in sentences that rotate every ten minutes ("Three others are on this level with you.", "You are not alone down here. Two others on this level."; v1.00), then the market and the located rumors, her own level first ("On this level, day 2: A CHROME ONI struck a traveler down.").
- **During a search** it goes quiet, and after a good find it says one whole line from the pit (Part 1, v1.02).
- It never says KURA (that name belongs to the action line), ends every line with a full stop or a trailing ` . . .`, and is fed from the last title-screen load.
- It replaced a scrolling ticker (v0.89, v0.90.1) that the dev tried and dropped.

**The fight screens** unfold a beat at a time and can't be skipped: the opening (art, name, lines, `[ OK ]`, 0.45 s apart) and the ending (0.7 s apart).

# Part 12: The exchange room

Every dead end has the exchange's screen in one wall (`exchDir`: never a door wall or the stairs wall; nothing hides behind it). The room is named for it (Part 2). A dead end laid out before v1.00 that still hides something behind that wall searches normally until it is empty.

- **The wall screen** is a size up from the altar's terminal, with two slots under it. It reads `EXCHANGE ^ 3 ON OFFER` over a moving market line. The arrow follows the line's trend, looking again about every 1.5 seconds. The line is a random walk, decoration rather than prices; the page repaints only those cells (the rules draw them as U+2800 blanks).
- **Using it:** SEARCH or `[^]` at it, free and even out of breath ("KURA touches the screen. The market wakes.").
- **The window,** over the view like INVOKE's:
  - **Header:** "EXCHANGE   Offers close end of quarter (5d)".
  - **Screen:** a ticker of the market's offers, right to left a letter at a time, over the same moving line.
  - **MARKET:** public offers; ENTER takes one, paying with a matching thing when it asks for one.
  - **YOURS:** your open offers (ENTER cancels) and MAKE AN OFFER: a thing, what it asks for, public or private.
  - **STASH:** "Special things go here." ENTER takes one into the run, for good.
  - **CODE:** type an offer's code to see it and take it.
  - "..." shows until the market first answers. [ESC] leaves.
- **No button.** The exchange is only reachable from a dead end (no `[E]XCHANGE` on the bar; it had one briefly before v1.00 shipped).
- **The admin** (X inside the window asks for the admin key, without the testing cheats) sees the bots' offers when `BOTS_PUBLIC` is off.
- The rules are Part 10's "Player identity & economy".

# Part 13: Open questions

- **Balance, unplayed by a human since the rollback:** breath shared between searching, items, scrying and walking; heat with breath capping the search rate; quarter-length levels on the wing floors. The bots' first day suggested breath, not heat, is now the limit on searching, and that fights are rare.
- **The finish at the surface, the endgame and the two boards** (Part 9): decided, not built. What is at the top is open.
- **Things left for others:** dead ends as a signal room (fixed-phrase notes, tallies of which door people took, bones) was discussed; nothing chosen. Since v1.00 the dead end holds the exchange, so a signal room would share it. Cosmetic-only or functional is still open.
- **A shared map of the level** beyond the title's line: a readout and a tree were mocked up and set aside; the line of days is what shipped.
- **Player names in events:** stored, unused. Whether the feed ever shows them.
- **More from live presence:** a listening-post room, something small when several players are on a level at once; to decide once there are real numbers.
- **The exchange:** prices and balance unknown until people trade; whether the bots stay in the live market (`BOTS_PUBLIC`) once people play; Durable Objects if trades ever need two players at once; a full server-run game is the only way to make forged finds impossible (ruled out).
- **Dissonance** (Part 5): the Give action, the omen tie-in, combo skills.
- **Alignment tag naming** (Part 6): no decision.
- **Omen banking** (Part 1): whether Hold should cost something; a named buff for the day after a held day.
- **The moon's odds** (Part 8): first guesses, kept "for now".
- **The countdown beside the breath bar** is rarely seen; kept.
- **Bots** on the leaderboards: settled, they are hidden (names ending `-bot`).
- **Faction season reward**, the rumor wordings (the dev means to rewrite them), KURA's own last words.
