# Daily Dungeon — Design Doc

How the game plays and why: the daily loop, floors and rooms, combat, the party, alignment, items, omens, run structure, async multiplayer, and the title screen. Current as of **v0.62.2**.

One file, no version suffix; git history is the version history. Ideas that are not built and not yet settled live in `theorycrafting-notes.md`. Exact per-release detail lives in `CHANGELOG.md`.

---

# Part 1: Core daily loop

One real-world day = one "step." A step is spent by:
- Opening a **locked** door (the game's main action), or
- Going on **STANDBY** (resting instead of moving)

Everything else — searching, turning, talking to party or demons, using items, visiting the altar — is free and unlimited within a day. The gate is a single boolean, `today(st).stepped`: once true, no further locked door can be opened until the next real-day rollover. Already-open doors stay walkable regardless.

**STANDBY** spends the day's step without moving (blocked if a demon encounter is in progress). It's a deeper rest than an ordinary night: on the *following* rollover, a STANDBY night triggers "camp" effects —
- every standing party member restored to full HP/MP and full Patience,
- taint reset to 0,
- current room's heat cleared,
- the loop-detection counter reset,
- any camp-triggered PROGRAM jobs run (COMPILER, CACHE — see Part 7),
- and that night's omen gets **banked**.

**Omen banking (Hold Omen / Release Omen):** a STANDBY night banks that day's omen in `st.bankedOmen` — one slot, a newer held day overwrites the old one, no stacking. The banked omen waits until the player releases it (`useBankedOmen`), which applies it in place of that day's natural omen; it's gone at the next sunrise. This is a scheduling tool, not a reroll: bank a day that happened to roll a good omen, then cash it in right before a floor or demon that matters.
- **Cooldown:** releasing starts a flat **7-real-day** cooldown before KURA can hold again (`st.omenCooldownDay` against `st.day`, a count of real days, so skipped days still count). The cost sits on Release, not Hold. A calendar-week cooldown was rejected: it would let a player release right before the week's reset for close to no cost.
- **UI:** one morphing button with its own `H` key, in the bag's foot block beside `[ENTER] use` and `[C]LOSE` (pinned there, so it stays visible however long the list is). It is not a numbered item. The label carries the state: `Hold Omen`, `Release Omen`, or `Hold Omen (Nd)` greyed out while cooling. The explanation lives only in the `?` menu.

Every action runs `sync()` first, which also: halves every room's heat overnight, decays taint by 1, restores 3 Patience to each party member, heals a little HP to the party, rolls that day's bonus/void room placement (Part 8), and checks the floor's deadline — missing it ends the run (Part 9).


---

# Part 2: Floor & room generation

- A floor has `KINDS = [den, bay, relay, vault, forge, altar]` — six ordinary room kinds — plus two kinds that are never dealt into the normal rotation: `archive` (bonus room) and `void` (anti-bonus room).
- A floor runs for `days = 7` (clamped 3–7), giving `pairs = days - 1 = 6` door-offer events across the week.
- **The deck:** the six kinds are shuffled twice and concatenated, retried until no adjacent pair repeats a kind, then split into offers of two kinds each — one offer per wing, dealt one wing at a time across the week. **The last offer is a wildcard**, not part of the shared deck at all: a single kind rolled from the private per-account seed. This is the "Day-7 wildcard" — because it never touches the shared deck, it's immune to the elimination-by-subtraction problem the other kinds have (see Part 10 for why that's considered harmless there anyway).
- **Wings:** each non-final wing is three rooms — K (entered room), P (a passage), X (a dead end) — in either a "chain" (K→P→X) or "star" (K→P, K→X) layout, chosen at random, with every non-final wing hanging **two locked doors** off K or P. Opening one seals the other permanently.
- **The final wing** has a single door (the wildcard's) and hides the stairs down in its passage or dead end.
- **Lure room:** roughly 60% of floors get one hidden locker (`?`), placed in a random wing's dead end (or entered room if there's no dead end).
- **Stairs direction** and each room's grid position are fixed per floor (keyed off the shared seed), not randomized per player.
- Two seeds drive all of this, split exactly along the shared/private line Part 10 describes: the shared `seed` picks wing topology and which two kinds pair up where; the private `pseed` (re-rolled every floor) picks which paired kind lands in which slot, hidden-item placement, the wildcard's actual kind, and bonus/void placement.

---

# Part 3: Room kinds & searching

Each kind-room (den/bay/relay/vault/forge) hides a **fixture** behind one wall — found by searching like anything else, usable once per real day once found:

| Kind | Fixture effect |
|---|---|
| Den (CYBER-DEN) | Heats the room to at least 60% of max — "the room stirs," more demons and better finds |
| Bay (RECHARGE BAY) | Safe room (never spawns encounters); fixture heals the party ⅓ max HP |
| Relay (SIGNAL RELAY) | Reveals a clue naming the wing's *other* offered kind |
| Vault (DATA VAULT) | `R(40,110) × floor depth` SILVER |
| Forge (FORGE-NODE) | Clears taint to 0, ends a trip |
| Altar (MATRIX ALTAR) | No fixture — an offering terminal instead (Part 7) |

**Archive** (bonus room, one per floor max): pile is rewritten to a locker + 2 items + silver, no demons; items roll RARE 35%/UNCOMMON 65% instead of the normal tiers; silver is doubled. Entering always yields a free, friendly PROGRAM.

**Void** (anti-bonus): mirror image — pile becomes two demons, no items/silver; entering always spawns a hostile demon, corrupted unless it's a program or a unique.

**Pile contents**, ordinary (non-bonus/void) rooms: a shuffled mix of demon/demon/item/item/silver for the entered room and dead end (1–3 and 0–2 items respectively), item/silver only for the passage (0–1).

**Item rarity on a find** (`rollItem`): `rare = 8% × omen's loot multiplier`, else `32%` uncommon, else common — so rare chance ranges roughly 8%–24% depending on the day's omen. Silver found by searching is `R(20,150)`.

**Searching** is NetHack-style and unlimited: each hidden thing in a wall needs `5–10` base search-points, scaled **×1.5 per prior find already taken from that wall** (walls "tire" the more you've pulled from them). Each search contributes up to ~1.9 points, scaled by the day's omen, the room's heat tier (calm rooms yield more per search than hot ones), a rested-day bonus (×1.25, the day after a STANDBY night), and moon fullness (up to ×1.35 at full moon). About a third of rooms hide a much deeper MYTHIC find (20–50 points) behind the same mechanic.

Doors can't be searched directly, but leak atmosphere instead: a locked door has a ~55% chance of a sense-clue toward the kind behind it (warm → Den/Forge, hum → Bay/Altar, cold/static → Vault/Relay), a false door gives itself away, a sealed door reads as sealed, and an open door's description (never naming the kind) hints at what's inside.

---

# Part 4: Combat & demons

**Encounters** never trigger in a bay or passage. Elsewhere, chance per search is `(1/24 + (1/4 − 1/24) × min(1, heat/20)) × moon multiplier` — roughly 4% cold up to 25% at max heat, scaled 0.8×–1.25× by moon phase.

**Demon HP:** `round((16 + 9 × floor depth + R(0,8)) × unique multiplier × (1.15 if corrupted))`. Named uniques (e.g. ATOM SLASHER) carry their own HP/hit multipliers and can be flagged untalkable.

**FIGHT:** each standing member rolls `R(1,4) + floor(level/2)`, summed into the hit; demon HP drops by the total. While KURA is tripping, a third of her blows land on a random hurt ally instead (double damage, never fatal) — otherwise her hit is doubled.

**Demon's turn:** targets KURA 40% of the time when she's alive, otherwise a random standing member. Damage is `max(1, round(R(2, ceil(HP/3)) × moon rage multiplier × unique hit multiplier × 0.67 if a WATCHDOG is present))`. KURA hitting 0 HP ends the run.

**TALK:** a demon listens with probability up to 95%, built from a moon curve (most willing at new moon, least at full moon) × 0.7 if corrupted × the day's omen talk multiplier × a stance multiplier (1.5 same-alignment / 1 neutral / 0.6 opposite). Programs always listen. A demon that doesn't listen has a 50% chance to get angry and attack instead. One that does listen asks 2–3 yes/no questions before sizing up (Part 5).

**RUN:** 50/50 whether the demon blocks the escape (can't retry that encounter) or KURA gets away; a locked door still costs the day's step either way.

**Corruption** only becomes possible in the back half of a floor's week, scaling from 0% up to `(10% + 30% × remaining-week progress) × ½ for non-data families`. A corrupted demon gets a glitched name (first vowel swapped for a symbol), forced CHAOS alignment, and +15% HP; talking it down (mood reaching ≥1) restores its real name/alignment and gives a 60% chance it then offers to join. Programs and uniques are never corrupted.

**Demon families and their floor-depth weighting** (data/hardware/hybrid/folklore):

| Depth | data | hardware | hybrid | folklore |
|---|---|---|---|---|
| B1F | 7 | 3 | 0 | 0 |
| B2F | 4 | 5 | 1 | 0 |
| B3F | 1 | 3 | 5 | 2 |
| B4F+ | 0 | 1 | 4 | 6 |

Modifiers on top: a flat 3% chance of ATOM SLASHER, 7% chance of a free PROGRAM; repeatedly searching the same wall (4+) boosts data/hardware; lingering in a room (30+ actions) boosts folklore/hybrid; the day's omen can multiply either pairing (Part 8).

**Win rewards:** ICHOR (`R(5,30) + 3×depth`), 50% chance of silver (`R(8,40)×depth`), 25% chance of a rolled item, and a small moon-phase chance of a MOON-tier drop that only exists around full moon.

---

# Part 5: Party, Patience & recruiting

**Patience** caps at 5 per non-KURA member. It drops from over-talking in a day, breaking items (worse for a member who's a fan of that item), fidgeting, looping the same action, drinking ichor, and disliked question answers. It recovers +3 overnight, fully on a STANDBY/camp night, or +1 for confiding.

At 0 Patience, a second push has a 50% chance to **snap**: a CHAOS-aligned member strikes KURA (never fatally) and stays; a LAW or NEUTRAL member **leaves the party for good**. A "last chance" prompt can head this off — saying yes mends +3 Patience; saying no risks a persona-dependent chance of leaving outright (HAUGHTY/PRIM/SLY essentially always leave on a no, GRUFF rarely does).

**Recruiting:** after a demon listens and answers 2–3 questions, it sizes up. Programs join at 90% odds with a good mood, 40% at neutral. Ordinary demons may instead ask for a gift first (more likely for haughty or dreamy personas to skip straight to asking), or offer to join directly at up to ~50% odds scaling with mood — except CHAOS-aligned "tricksters," who rarely join even when pleased (10–30%) and are more likely to demand more or run off with a gift.

Gift pricing runs on a taste matrix by family (tech/both/spirit/plain/silver preferences differ by family — hardware loves silver, folklore loves spirit items and dislikes tech, hybrid is the generalist), with alignment match/mismatch nudging the value ±2 and a reaction scale from hate (rejects and attacks) through meh (keeps asking, up to 3 times) to like/love.

The party caps at **4** (KURA + 3). A demon that wants to join a full party offers a swap instead — the player picks who to send away (KURA can't be swapped) or declines and the demon leaves.

**Dissonance (shipped v0.59):** the risk side of mixed-alignment parties. It is the same number as Patience, not a second meter. Every standing member (KURA included, via her own alignment) has a gap against every other standing member — same alignment 0, one side NEUTRAL 1, LAW vs CHAOS 2 — and a member's tension is the worst gap against anyone else standing, computed live.

Three wear sources feed that tension into the member's Patience, on top of Patience's ordinary drains:

| Source | Gap 1 | Gap 2 | When |
|---|---|---|---|
| Fighting | −1 | −2 | every fight **round** |
| Lingering | 0 | −1 | each time the stay in a hot room (heat tier 2+) crosses another 30 actions |
| Skipping | 0 | −1 | once per return, if any real day passed with no step and no STANDBY (days away count) |

**Read-out:** no separate tracker; Patience's own level doubles as the Dissonance read — **CALM** (3–5), **STRAINED** (1–2), **FRACTURING** (0, the existing warn-then-snap/leave zone). A member at 0 with tension present gives an alignment-flavored line instead of the ordinary tired one, so the player can tell the two causes apart. Snap behavior is unchanged: CHAOS members strike and stay, LAW/NEUTRAL leave.

**Numbers are placeholders, with two known problems:**
- The starting party is mixed by default (ELF and CU SITH are CHAOS; PIXIE and a fresh KURA are NEUTRAL), so every ally sits at gap 1 from the first fight. All three go from 5 Patience to 0 in five fight rounds, about two ordinary fights. Needs a decision: lower fight wear at gap 1, apply it once per fight instead of per round, or exempt the starting trio from each other.
- Skip wear (1) loses to the nightly +3 regen even at the worst gap, so an unmanaged party doesn't erode on its own yet.

Tuning targets are unchanged: mixed parties shouldn't strictly dominate pure ones, and a careless mixed party should collapse by around floor 3.

**Settled but not built:**
- **Give** — handing an item to a party member to restore their Patience, priced by the same taste matrix demon gifts use (bigger for a fan of that item's nature). The proactive way to defuse a fracturing pair.
- **Omen tie-in** — e.g. a `calm` day boosting a tense pair's regen. Deferred with the wider omen-balancing thread.
- **Cross-alignment combo skills** — the payoff side: fixed pairings that only exist with an opposing pair in the party (examples floated: PING + REDCAP, a strike that always finds its target; CRON + BANSHEE, a scheduled scream). Pure parties get smaller, steady perks instead. Pairings and effects TBD.
- **NEUTRAL as the bridge** — a NEUTRAL member's gap is never worse than 1, which the formula gives for free. Open: whether that reads as "the easy teammate" on its own or needs an explicit extra discount.

An opposite-alignment recruit nudging KURA's own alignment toward it (a brake on mixing) already exists: recruiting leans KURA toward the new member (Part 6).

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

**Omen banking** (Hold/Release, its cap of 1 and the 7-day cooldown) is described in Part 1.

---

# Part 9: Run structure & scoring

A new run starts KURA at 30/30 HP, 8/8 MP, alignment reset to NEUTRAL/0, with a starting trio of folklore allies and a small starting kit (2–3 COMMON items, 1 UNCOMMON, and a small chance — 0.5% MYTHIC, else 3% RARE — of a bonus rare starting item).

**Deadlines:** the first floor's door closes this coming Sunday (or the Sunday after, if fewer than 2 days remain when the run starts); every floor after that closes exactly a week after it's reached. Missing a deadline ends the run outright (no death blow, just "the week ended"); KURA's HP hitting 0 in combat ends it immediately.

**Scoring** tracks floor depth reached, real days survived, and turns taken; the leaderboard ranks by floor depth, then days survived, then earliest post (turns are shown but not ranked on). Posting requires the run to have ended and a valid 3–10 character name, and happens once per run.

The end-of-run summary covers floor/days/turns/steps/searches, final alignment and lean, heat/hottest room touched, demons met/beaten/talked-down/recruited/restored/escaped, items found/broken, ICHOR fed/drunk and trips taken, silver collected, the final party roster, and the full pact history (including members who later left).

---

# Part 10: Async multiplayer

## Goal
Everyone feels like they're playing "the same" dungeon, without players being able to spoil it for each other (no "vault's behind the north door, second wing" callouts), and with little hard-coded determinism.

## Status

| Piece | State |
|---|---|
| Shared shape / private contents | Shipped v0.56 |
| Private minimap rotate/mirror | Shipped v0.57 |
| Faction seasons (tally + `/season`) | Shipped v0.60; Worker live since Oct 11 2026 |
| Faction lean on the title screen | Shipped v0.62 |
| Live presence, player economy | Accepted, not built |
| Notes, bones, echoes, traces, altar gifts | Not built |
| World boss, season title, epoch board, sighting log, one-time loot | Not scheduled |

## Core idea: shared shape, private contents

A floor is two layers.

- **Shape (shared)** — structure that gives away nothing useful on its own: wing count and topology, which kinds pair into a locked-door offer, the per-wing room grid, stairs direction. Seeded from `(seasonEpoch, floorDepth, wingIndex)`. The demon roster, loot pool, clue text and omens are shared too: useful prep info, but you still have to find them.
- **Contents (private per account)** — everything that would turn the shape into a walkthrough: which paired kind lands in which slot, where items hide, the wildcard's kind, bonus/void placement, and the door-to-compass mapping. Seeded from `pseed`, re-rolled every floor, so two players' vocabulary for "where something is" never overlaps, even across one player's own alt accounts.

**Lazy, per-wing, entirely client-side.** The shape is a pure hash of its inputs, so it gives the same answer for the first player to reach a wing and the thousandth. Each wing is computed on demand; there is no "roll the floor" step and **zero network calls**. Players are "in the same dungeon" because they solve the same math with the same inputs, not because anything synchronized them.

**Why not a fully shared layout:** if the same door means the same room for everyone, any message between players is a spoiler. Splitting shape from contents keeps the shared feeling (same wings, same demon cast, same loot) while making coordinates meaningless outside one account.

**Rejected alternatives:**
- *"One room a day"* (no wings, one room and a binary door choice per day). It would fix a pacing complaint, but with no space to walk through there is no coordinate left to protect, and the shared-map feeling was the part worth keeping.
- *Shared kinds and connections only*, or shared layouts as a separate weekly challenge mode. Superseded by the split above.

## Season epoch

**Epoch = the real lunar month** (~29.5 days), from the same date-to-moon math the game already uses; it advances on its own. A new epoch is a full, unrelated reshuffle of every floor's shape (a hash input changed), which gives the "this month's dungeon" framing.

**Mid-floor stability (the "calendar bug" fix):** the epoch is stamped into the save on floor arrival and that floor's shape reads the stamp, so a rollover mid-floor can't reshuffle it. Only the next floor picks up the new epoch.

## The deck and the wildcard

The dealing itself is in Part 2. Two privacy notes belong here:
- **Elimination is harmless.** Once most pairs are seen, the rest are deducible by subtraction. That reveals *what* is left, never *where*, the same safety category as the demon roster.
- **The last offer is a private wildcard**, never part of the shared deck, so the final day can't be predicted or talked about by anyone.

## Bonus room privacy

Mechanics and odds are in Part 8. The roll is private, per player, per day. Per-day beats per-week because a week would leave something shareable ("there's a bonus room this week"); a daily private roll leaves nothing that transfers. Saying "I got one today" is safe for the opposite reason shared content is safe: shared content is globally true, a private roll is true of nobody else's board.

## Minimap

The existing grid minimap, unchanged visually, with a per-account, per-floor rigid transform: one of the 8 rotations/mirrors of a rectangle, stamped at floor arrival and applied to both the map draw and the door labels. The map stays internally coherent and does not spin while exploring. Two players' minimaps are never comparable; accepted, since "same dungeon" was always about shared content.

Set aside: an abstract node-graph minimap (the only option that could be pixel-identical, but a rendering rebuild for a cosmetic gain), and a heading-up rotating minimap (cheapest, but it spins with every turn). The choice was purely a rendering one; generation is identical either way.

## Faction seasons

**Season = one lunar epoch**, reusing `epochIndex()`.

**Scoring:** every ended run adds `floorNum(run)` points to its final alignment's side for the current epoch. A NEUTRAL run is the **kingmaker**: its points go to whichever of LAW/CHAOS is behind, and on an exact tie they go nowhere. This keeps a lopsided season contested and gives NEUTRAL a reason to exist in the metagame.

**Storage:** `faction_season (epoch, side, count)`, two rows per epoch (`LAW`, `CHAOS`). NEUTRAL never has a row.

**Write path:** inside the existing `POST /score` (`tallyFaction()`), only when the score row is new, so a retried post can't double-count. LAW/CHAOS is a blind upsert; NEUTRAL is one conditional `UPDATE`, which avoids a race between two NEUTRAL runs.

**Read path:** `GET /season` returns `{epoch, law, chaos}`. It is its own endpoint for now because there is nothing to batch it with; once notes/bones/echoes exist it should fold into the one-packet-a-day fetch (see Read budget).

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

- **One data packet per player per day.** Fetched once when a player first acts on a new day or descends to a new floor, cached client-side keyed by (day, floor), only re-fetched when either changes. On fetch failure, proceed with an empty/stale packet — never block play.
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

**Status:** stages 1–3 shipped (v0.62, fixed up in v0.62.1): the scaffold, the three no-new-backend cards, and the scroll. Stage 4 (more hard-number cards) and stage 5 (rumor cards) are not built.

Shown first on every load, even with a run in progress; `CONTINUE` is the explicit resume. It reuses the in-game frame's zones with new content, at the same 80 columns.

- **Top box:** the real in-game moon/date header (shared code, `headerLines()`).
- **3D-view slot:** a static wordmark, `DAILY DIGITAL` / `DEMON DUNGEON` / `a daily dungeon crawl`.
- **Log box:** three cold facts that hold until the day rolls over:
  ```
  > WEEK      TUE, day 2 of 7  -  5 days left, this floor closes SUN
  > EPOCH     epoch 14, day 9 of 29  -  new shape in 20 days
  > LEAN      this season leans CHAOS   [||||||||.........]  35 / 65
  ```
  WEEK is pure calendar math (a floor always closes the coming Sunday), not a countdown to one save's deadline. EPOCH's denominator is held at 29, so an epoch's last day clamps instead of reading "day 30 of 29". LEAN reads `/season`; a tie reads EVEN, and an empty epoch reads "no votes logged yet this epoch".
- **Sidebar, "RUMORS AND SECRETS":** a pinned header over a scrolling list of cards, one blank line between cards, long cards wrapped at a space. One line every 1.4 seconds, no pause-on-hover, fixed order per page load, a full cycle before any repeat.
- **Menu bar:** `[N]EW RUN   [C]ONTINUE   [B]OARD   [?] ABOUT`. NEW RUN skips the confirm when there is nothing to lose. ABOUT carries `[P]ASSWORD` even before a run exists, so a run can be brought in from another device; loading one goes straight into it.

**Cards shipped:** today's omen, deepest floor (the board's `/top?n=1`), faction lean.

**Stage 4 — more hard-number cards (not built).** Exact counts, anonymized, no names or rankings: `Last fall: 3 hours ago`, `Turns logged: 1,842`, `Players seen: 312`, `Pacts: 118 made, 54 ended`, `Items broken: 67`, `TRIPs reported: 9`, `Longest wall search: 61x`, `Gifts refused: 23`, `Answered [S]ILENT: 441x`. These need new counters threaded through scattered client actions: plumbing, not design.

**Stage 5 — rumor cards (not built).** Atmosphere-first lines that *reference* an in-game event without quoting its triggering line, so they neither spoil nor duplicate the game's own text: `A demon rejected a traveler's paltry gift.` / `Someone was asked if they trust the dark.` / `A corrupted voice turned, and was made whole again.` / `Something ran off laughing, gift in hand.` / `An altar considered an offering, and was pleased.` / `A stranger walked in, uninvited.` / `Silence, offered instead of an answer.` / `A wall gave up its secret, after many tries.` One exception: **last words are quoted verbatim but never attributed** (`The dungeon whispered, "my Mom is going to be SO mad."`). When mixed with number cards, cap at two of the same kind in a row.

Rumor cards need a new, deliberately light **ambient-events channel**: a tiny ping (type tag + which outcome fired + timestamp; no player ID, no name) whenever a listed moment happens in a real game — a gift refusal, a corrupted-demon restoration, a trickster running off, an altar reaction, a party member leaving, a deep-cache find, a `[S]ILENT` answer, a fall (for last words). The server keeps the last N of each type and the title pulls a handful at random. Forging one is cheap and harmless: nothing downstream trusts these for ranking or reward.

# Part 12: Open questions

- **Dissonance balance (Part 5):** the starting party's gap-1 fight wear, skip wear losing to regen, and all exact numbers. Also the Give action's mechanics, the omen tie-in, combo-skill pairings, and whether NEUTRAL needs an extra discount.
- **Alignment tag naming (Part 6):** no decision.
- **Omen banking (Part 1):** whether Hold should cost something too, whether a cap above 1 is worth it, and whether banking a bad omen is ever worth it. Also a possible named buff for the day after a held day (see theorycrafting notes).
- **Omen streaks (Part 8):** no in-game buildup cue yet, and CHAOS streaks are about 3x as common as LAW streaks.
- **Bonus-room roll (Part 8):** flat vs. smoothed toward exactly twice a month.
- **Wing topology:** the menu of shapes (chain, branch, loop, maybe one more) and whether variety implies variable wing size (fixed at 3 today).
- **Async build order:** which of bones, echoes, traces, notes, and the lighter-lift ideas comes next. A blanket rule ("anything visible to other players is flavor-only, never mechanical") would settle the cosmetic-vs-functional question for all of them at once; not adopted.
- **Economy:** trade-offer UX and secret-key export/backup (copy/paste vs. QR).
- **Live presence:** granularity and the Durable Object design.
- **Schemas** for bones/echo/trace/counter rows.
- **Replay verification:** whether it is ever worth the Workers paid tier.
- **Title screen (Part 11):** the exact list of ambient-event triggers and the counters stage 4 needs.
- **Faction season reward:** what the leading side actually gets.
