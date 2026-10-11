# Daily Dungeon — Design Doc

This is the general design doc, covering how the game actually plays: the daily loop, floor/room generation, combat, demons, Patience, alignment, items, omens, and run structure. It folds in what used to be a separate async-multiplayer-focused doc (now Part 10 below) alongside the core-mechanics writeup that didn't have a home before.

One file, no version suffix — git history is the version history. Earlier drafts (a prior `v1`/`v2`/`v3` filename scheme) existed briefly but were dropped in favor of just editing this file in place and letting commits carry the history; look at the commit log or `git log -p` on this path for anything an older revision said differently.

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

**Omen banking:** if yesterday was a STANDBY day, `st.bankedOmen` is set to that day's omen (one slot — a new banked day simply overwrites whatever was already held, no stacking). The player can later choose to apply the banked omen retroactively instead of today's natural one (`useBankedOmen`); it's one-shot and clears at the next sunrise whether spent or not. This is a scheduling tool: bank a day that happened to roll a good omen, then cash it in right before a floor or demon that matters, rather than a reroll.

**Hold/Release cooldown (shipped v0.58):** releasing a banked omen also starts a flat **7-real-day** cooldown before KURA can hold again (`st.omenCooldownDay`, checked against `st.day` — a count of real days elapsed, so skipped days still count against it). This is the offsetting cost on *Release*, not Hold — a calendar-week version was considered and rejected, since it would let a player release right before the week's reset for close to no cost. In the bag (INVOKE), Hold Omen and Release Omen share one morphing control: Hold Omen normally, Release Omen once a day's banked, greyed out (with the days left folded into its own label) during the cooldown.

**Hold/Release UI (shipped v0.61/v0.61.1):** moved out of the numbered item list entirely, into its own dedicated button + `H` key on the bag's bottom action bar, alongside [ENTER] use and [C]LOSE — it no longer takes up a numbered slot or bumps a found item down. No explanatory text in the bag itself anymore; the button's own label carries the state (`Hold Omen` / `Release Omen` / `Hold Omen (Nd)` while cooling), full explanation lives in the `?` help menu only.

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

**Dissonance (design only, settled on folding into Patience — not yet built):** the risk side of mixed-alignment parties, named Dissonance, and **decided to be the same underlying value as Patience above, not a second hidden number** (a separate theorycrafting thread on this project reached the same lean independently: "fold into patience, don't build a second meter"). Every standing member (KURA included, since she has her own alignment too) has an alignment-gap against every other standing member — same alignment = 0, one side NEUTRAL = 1, LAW vs CHAOS = 2 — and that gap is what Dissonance tracks: a member's tension is the gap against whoever in the current roster they clash with hardest.

Three new wear sources feed into that member's ordinary Patience, on top of the drains Patience already has (over-talking, breaking items, nagging, disliked answers, etc.), scaled by gap size — bigger for an opposite pair than a neutral-adjacent one:
- **Fighting** while tension is present.
- **Skipping a day** — letting a real day pass with no step at all, not even STANDBY — while tension exists. The point is an unmanaged mixed party gets worse even when nothing is actively happening, not only during fights.
- **Lingering in a hot room** while tense, a smaller repeating tick the longer the stay.

Exact wear amounts are TBD/balance-later; the tuning targets stay what they were — mixed parties shouldn't strictly dominate pure ones, and a careless mixed party should collapse by around floor 3.

**Read-out:** no separate state tracker — Patience's own level doubles as the Dissonance read, per tense member:
- **CALM** — Patience 3–5
- **STRAINED** — Patience 1–2
- **FRACTURING** — Patience 0 (the existing warn-then-snap/leave zone)

The one addition this needs on top of Patience as it already works: the warning line should read as alignment-driven (not generic talk-fatigue flavor) when tension is actually what zeroed the member out, so the player can tell the two causes apart. Snap behavior itself needs no change — CHAOS members already strike-and-stay, LAW/NEUTRAL already leave outright, which is already the "mixed parties are riskier" payoff this wanted.

**Comes down via:** nightly regen (already generic/party-wide); a new **give** action — handing an item directly to a party member (not a demon or the altar) to restore their Patience, priced/scaled the same taste-matrix way demon gifts already are (bigger effect on a member who's a fan of that item's nature) — giving a player a way to defuse a fracturing pair proactively rather than just waiting out the night; and omens, once the omen-balancing thread resumes (a `calm`-type day boosting the regen a tense pair gets, say) — deferred for now rather than designed here.

**Already solved, no new work needed:** "an opposite-alignment recruit should nudge KURA's own alignment toward it, as a brake" — recruiting already does this (Part 6: joining leans KURA toward the new member's alignment).

**The payoff side — not yet mechanically specced, carried over from the same theorycrafting thread:** right now this section is all risk; a mixed party should get something for running that risk, or there's no reason to ever do it on purpose.
- **Cross-alignment combo skills** — fixed pairings that only exist with an opposing pair in the party (e.g. a data member + a folklore member unlocking a move neither gets alone), as the reward side of carrying the extra Patience wear. Pure-alignment parties would get smaller, steady perks instead rather than nothing. Exact pairings/effects TBD.
- **NEUTRAL as the bridge:** a NEUTRAL member should take much less of the gap-based wear than a LAW or CHAOS one does (their gap to either side is 1, not 2, which the tension formula above already gives them for free — worth confirming that's enough of a difference to actually read as "the easy teammate," or whether NEUTRAL needs an explicit extra discount on top). Gives the middle tag a combat-relevant payoff beyond easier recruiting from both sides, which right now is its only edge.

---

# Part 6: Alignment system

KURA's alignment is one hidden float, `alignScore`, clamped to **[-6, +6]** — negative is LAW, positive is CHAOS. Actions nudge it by fixed amounts: searching patiently −0.03, searching a hot room +0.2, talking −0.15, fighting +0.3 (killing +0.6), paying silver −0.4, offering an item +0.4, running +0.15, finding a LAW/CHAOS-aligned relic ∓0.3, drinking ichor +0.8, restoring a corrupted demon −0.5, and recruiting a demon nudges toward *its* alignment.

Each real shift decays in weight the more choices pile up (`weight = max(0.4, 1 − 0.02×(shift count − 1))`) — early choices count fully, later ones shrink toward a 40% floor, so alignment is mostly set by a run's first meaningful decisions rather than its last.

Thresholds use hysteresis to avoid flickering: `score ≤ −3` → LAW, `≥ 3` → CHAOS, `|score| ≤ 1` → back to NEUTRAL; between 1 and 3 the existing tag holds. A tell line fires on an actual flip, and a separate near-flip line ("Something is pulling at you.") fires once at `|score| ≥ 2.4` while still NEUTRAL.

A demon's own alignment comes from its family (data → LAW, folklore → CHAOS, hardware/hybrid → NEUTRAL) with a handful of named outliers. `stance()` compares KURA's alignment to a demon's (same/neutral/opposite) and feeds both talk odds (Part 4) and gift pricing (Part 5).

**Alignment tag naming (not yet decided):** the current `[LAW]`/`[NEU]`/`[CHA]`-style bracket tag has several renaming and re-axis options on the table, carried over from a separate design session:

- **Renames, same mechanic:** `[SYS]`/`[NEU]`/`[OLD]` (system vs. the old layer), `[COR]`/`[NEU]`/`[STR]` (corp vs. street), `[COD]`/`[NEU]`/`[RUN]` (code vs. rune), `[ORD]`/`[NEU]`/`[WLD]` (order vs. wild).
- **Different driving axes:** data vs. flesh (augmentation-tied), talk vs. fight (driven by how encounters resolve), careful vs. reckless (driven by heat behavior), sun vs. moon (driven by day/night timing), debt (driven by offerings/deals/bribes).
- **Finer-grained options considered:** a 5-step tag, or two side-by-side axes (Law/Chaos + Light/Dark) — both cost more UI space and complexity than the current single bracket.
- **Recommendation given, no decision made:** `[SYS]`/`[NEU]`/`[OLD]` if just renaming (keeps all existing mechanics as-is), or talk-vs-fight if a genuinely different driving axis is wanted — it fits the recruiting-focused core loop particularly well.

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

**STANDBY omen banking** (Part 1) lets a player hold a good day's omen and spend it later instead of the natural one — a scheduling decision, not a reroll. Shipped with a hold cap of exactly 1 (a new banked day overwrites the old one, no stacking) and, as of v0.58, a flat 7-real-day cooldown on holding again after a release. Whether a bigger cap or decay is worth adding is still open.

---

# Part 9: Run structure & scoring

A new run starts KURA at 30/30 HP, 8/8 MP, alignment reset to NEUTRAL/0, with a starting trio of folklore allies and a small starting kit (2–3 COMMON items, 1 UNCOMMON, and a small chance — 0.5% MYTHIC, else 3% RARE — of a bonus rare starting item).

**Deadlines:** the first floor's door closes this coming Sunday (or the Sunday after, if fewer than 2 days remain when the run starts); every floor after that closes exactly a week after it's reached. Missing a deadline ends the run outright (no death blow, just "the week ended"); KURA's HP hitting 0 in combat ends it immediately.

**Scoring** tracks floor depth reached, real days survived, and turns taken; the leaderboard ranks by floor depth, then days survived, then earliest post (turns are shown but not ranked on). Posting requires the run to have ended and a valid 3–10 character name, and happens once per run.

The end-of-run summary covers floor/days/turns/steps/searches, final alignment and lean, heat/hottest room touched, demons met/beaten/talked-down/recruited/restored/escaped, items found/broken, ICHOR fed/drunk and trips taken, silver collected, the final party roster, and the full pact history (including members who later left).

---

# Part 10: Async multiplayer

*(Originally the main thread of a separate async-multiplayer design session, folded in here as this doc grew into the single general design doc, covering how the shared-shape/private-contents system lets every player feel like they're in "the same" dungeon without being able to spoil it for each other.)*

## Goal
Add asynchronous multiplayer — everyone feels like they're playing "the same" dungeon — without letting players spoil the experience for each other (no "vault's behind the north door, second wing" callouts), and while keeping the amount of hard-coded determinism low.

## Status: what's shipped
- The shape/contents split is live: floor **shape** (wing count/topology, room-kind pairings, the per-wing room grid) is seeded from `(seasonEpoch, floorDepth)`, identical for every player while that lunar epoch lasts, generated lazily per-wing. Floor **contents** — which paired kind lands in which slot, where each room's hidden pile is, and the Day-7 wildcard's kind — come from a second, private per-account seed (`pseed`, rerolled every floor).
- The door-to-compass-direction mapping is private too: a per-account rotate/mirror transform means two players on the same shared wing see the same rooms in the same true layout, but each account's own fixed (one of 8) rotation/mirror, so a callout like "the vault's north door, second wing" doesn't line up between accounts.
- **Faction seasons (v0.60):** the Worker/D1 side is live — every ended run tallies a floor-weighted point to LAW/CHAOS for the current lunar epoch, NEUTRAL runs kingmaking to whichever side is behind. Nothing player-visible yet; the title screen's `LEAN` bar (Part 11) is what will actually display it.
- **Deferred by scope decision, not forgotten:** the lighter-lift shared-experience ideas, the harder ideas (live presence, player-to-player economy), and the notes/bones/leavings ideas below all still need new backend/Worker/D1 work.

## Core idea: shared shape, private contents

Split a floor into two layers:

- **Shape (shared)** — the stuff that defines the floor's structure but gives away nothing useful on its own:
  - Wing count, which wings pair into a locked-door offer, which wing is last, which wing hides the stairs, which hides the dead-end clue
  - Each wing's internal room-to-room topology (chain, branch, loop, etc. — a small fixed menu of shapes, rolled rather than always the same room→passage→dead-end template)
  - Room-kind roster and pairings for the floor (e.g. "Vault pairs with Forge this floor") — safe to share since it says nothing about *where*. (Mostly — the Bonus room is the one private exception.)
  - Demon roster for the floor (which demons exist, families, personalities, corruption state) — genuinely useful shared prep info, but requires actually finding them
  - Loot pool available on the floor
  - Clue/flavor text, omens

  All of this is seeded off `(seasonEpoch, floorDepth, wingIndex, ...)` — a deterministic function, computed lazily the first time any player reaches that floor, not pre-rolled in bulk at the start of a season.

- **Contents/presentation (private per account)** — everything that would turn the shared shape into a walkthrough if shared:
  - Which room kind actually lands in which wing *slot*
  - Which demon is in which slot
  - Where items are hidden
  - Door-to-compass-direction mapping (which physical door is "north" for this player)
  - Order the week presents wing choices in

  All seeded off something private to the account (+ floor, re-rolled every floor), so two players' vocabulary for describing "where something is" never overlaps — including across a single player's own alt accounts, since there's no shared coordinate system to decode.

**Generation is fully lazy, per-wing, and entirely client-side.** The shape function is a pure deterministic hash of `(epoch, floorDepth, wingIndex)`, so it doesn't matter *when* it's evaluated — `hash(epoch, 2, 3)` gives the identical answer whether it's computed for the first player to ever reach that wing or the thousandth, on day one of the epoch or day twenty. That means there's no "roll the whole floor at the start of the week" step at all: each wing's shape is simply computed fresh, on demand, the moment any given player actually reaches it. And because every input (epoch from the real date via the existing moon-phase math, floor depth and wing index from the player's own save) is already available locally, **this whole layer needs zero network calls** — no server round-trip, no central authority deciding what a wing looks like and broadcasting it. Two players end up "in the same dungeon" purely because they're independently solving the same math problem with the same inputs, not because anything synchronized them. (This only holds within one epoch — cross an epoch boundary between two players' visits and the inputs genuinely diverge, giving unrelated shapes, which is the intended "this month's dungeon" framing. The private per-account presentation layer is a second, separate deterministic function on top of this, also entirely local, also needing no server.)

**Considered and rejected: a "one room a day" pivot** (dropping wings entirely — one room + a binary door choice per day, searching walls/ceiling/floor, no free wandering within a floor). Would have solved a real pacing complaint (walking around with no payoff feels cliché) but was rejected because it removes the spatial structure this whole shared-shape design depends on — once there's no space to walk through, there's no coordinate left to protect. Keeping wings, since the shared-experience-over-a-real-map feeling was the part worth protecting.

**Also considered and superseded:** a simpler "fully shared seeded floor" with a patched-on mitigation (share room *kinds* and door connections only; keep stairs, items, and encounters rolled per-player), or alternatively spinning shared layouts off into a separate "weekly challenge" mode with its own board. The shared-shape/private-contents system above is the fuller, chosen answer to the same underlying problem.

## Why this beats a fully shared layout

A fully shared/seeded layout (same map for everyone, same door = same room) was the first idea, but it means *any* communication between players — a message, a note, a Discord post — becomes a spoiler, since "second wing, north door" means the same thing to everyone. Splitting shape from contents keeps the "we're all in the same dungeon" feeling (same wing count/shapes, same demon cast, same loot) while making coordinates themselves meaningless outside one account.

## Season epoch

**Epoch = the real lunar calendar / lunar month** (~29.5 days), not a manually-bumped counter. Reuses the date→moon-phase math the game already has; the epoch just advances on its own schedule whenever the real moon rolls into a new cycle. Fits the game's existing real-calendar-driven design (daily step, weekly deadlines, moon-linked find rates) and gives the shared floor content a natural in-world framing ("this month's dungeon").

Because the seed is a hash, including epoch isn't a partial influence — changing any single input (including epoch) produces a wholly new, uncorrelated shape (avalanche property of seeded hashes). So a new lunar month means a full, unrelated reshuffle of every floor's shape, not a gradual drift.

**Mid-floor stability ("calendar bug" fix):** since epoch changes over real time, a floor's shape must not be recomputed live from "today's epoch" while a player is on it — that would let a lunar-month rollover reshuffle a floor's shape out from under a player mid-traversal. Fix: stamp the epoch into the player's save the moment they arrive on a floor, and have that floor's shape generation read the stamped value for the rest of their time on it. Only the next floor, generated fresh on arrival, picks up wherever the moon actually is by then.

## Room-kind dealing (the "deck")

Normal (non-bonus) dealing is a shared, deterministic process, seeded the same as everything else in the shape layer:
- Shuffle the floor's 6 room kinds (seeded by `epoch + floorDepth`).
- Deal 2 kinds on the first deal-day (a wing's two-door offer).
- Reshuffle the remaining 4 (same deterministic seed-chain), deal 2 on the next deal-day.
- The last 2 go together on the final deal-day.
- Three deal-events, six kinds, no repeats, identical sequence for every player this floor.

**Elimination note:** in a 6-kind/3-pair deck, once a player has seen 2 of the 3 pairs (4 of 6 kinds), the last pair is deducible by subtraction regardless of how reveal is paced. Decided this is harmless — it only reveals *what's* left, never *where* it is, same safety category as the demon roster or loot pool.

**Day 7 (the week's last day) is a private, per-player wildcard** — independently rolled per account, not drawn from the shared deck at all. This was chosen specifically so the final day can't be predicted or talked about by anyone (closes the elimination gap entirely for that slot, since it was never part of the visible deck to begin with).

## Bonus room

**Rolled privately, per player, per day.** Each day, before that day's normal (shared) deal happens, privately roll whether a bonus room triggers for this player, this day. Two independent sources, either can fire a bonus/void room, both stop once one lands or is already waiting on the floor (see Part 8 for the exact mechanics and odds, now shipped):
1. **Guaranteed, not boosted:** the day a 3-day LAW/CHAOS omen streak *freshly* completes, it's a 100% trigger, no roll at all. LAW guarantees a bonus room, CHAOS guarantees THE VOID.
2. **The ordinary roll, bonus-only (void never comes from this one):** capped at one per floor, plus never two days running, and at most twice a real lunar month. Odds follow the real moon (3%–7%, averaging ~5%), landing around 1.3 bonus floors/month.

If it triggers: the bonus/void room takes over the wing's passage or dead-end slot (the room with no kind of its own), the next wing built after the day's roll hits. All six ordinary kinds still get offered every floor; nothing is bumped out.

**Why per-day beats per-week for privacy:** per-week still left something nominally shareable ("there's a bonus room this week"). Per-day removes even that — there's no stable "this week" concept to compare, and a player can't predict tomorrow's roll today, so nothing meaningfully transfers even as casual chat.

**Why "there's a bonus room" is safe to say even though it's private, for a different reason than the shared stuff is safe:** shared content (demon roster, loot pool) is safe because it's globally true — sharing it hands someone accurate prep info. A private roll is safe because it's *not* globally true of anything — one player's "I got one today" says nothing determinate about anyone else's board. Both are safe to talk about, via opposite mechanisms.

## Minimap handling

The minimap renders the shared shape graph, but direction is privately scrambled — so the grid-based minimap (wall glyphs, door states, facing arrow — unchanged visually) isn't pixel-identical between players even though the underlying wing count/shapes/content are.

**Shipped: the existing grid-based minimap exactly as it always looked, with a per-account persistent rotate/mirror transform.** Each account+floor gets one of the 8 rigid transforms of a rectangle (4 rotations × optional mirror), applied uniformly to the whole floor's grid coordinates, computed once at floor arrival and read by both the minimap draw and the door-to-key input resolution. Keeps the map internally coherent (adjacent doors stay adjacent, corners still make sense) and keeps the minimap visually **fixed and non-rotating** while the player is on a floor. Two players' minimaps are never literally comparable as a result — accepted, since the game's "same dungeon" guarantee was always about shared *content* (demons, loot, kind pairings), not a literal pixel match.

Two alternatives were considered and set aside at design time:
- **Topology-only/abstract minimap** (a node-graph layout instead of the grid, no compass meaning at all) — the only option that could be pixel-identical between players, but it's a real rendering rebuild for a benefit judged mostly cosmetic.
- **Heading-up / "N = current facing," live-rotating minimap** — technically the cheapest backend option, and would make the compass-scrambling problem disappear by construction rather than being hidden. Set aside specifically for feel — preferred a minimap that stays visually stable while exploring a floor, over one that spins with every turn.

One clarifying note worth keeping: **switching between these three options was purely a rendering decision, not a map-generation one.** The underlying shared-shape generation (wings, topology, pairing) is identical regardless of which of the three draws it — only the projection step changes.

## Lighter-lift shared-experience ideas (not yet scheduled)

- **World bosses** — one demon identity (name, stats, dialogue) fixed for the whole epoch, same for every player, elevating the existing named-demon pattern (ATOM SLASHER) into something with a season-long reputation.
- **Season title/flavor** — a generated name + theme line per lunar epoch ("The Hollow Moon"), shown on a title/log screen. Cheap (just a seeded phrase generator), gives the community a shared handle for "this month."
- **Epoch-scoped leaderboard** — a board that resets each lunar month alongside the all-time one, reusing the existing scoring/posting pipeline. Pairs well with the shared-shape system since "furthest into this month's dungeon" is a meaningful, non-spoiler stat.
- **Aggregate community stats / weekly counts** — a running tally across all players this epoch (total demons beaten, silver found, "412 runs ended on B2F this week," etc.), shown as flavor or tied to a threshold that nudges next epoch's generation slightly. No location info, no individual callouts possible.
- **Faction seasons** — shipped v0.60 (Worker/D1 side; no display yet), picked to build first ahead of bones/ghost demons/weekly counts. See its own writeup below.
- **Sighting log for named/rare demons** — anonymized "spotted on B5F" posts (floor depth only, which the leaderboard already exposes) when a player meets the epoch's world boss or a MYTHIC find.
- **One-time shared loot** — a rare locker that exists once per floor-epoch; first player to open it gets it, later players see "emptied by [name]." Needs an atomic "first wins" write.
- **Considered and not pursued: shared room heat.** Letting a room's heat persist across all players in a floor-epoch was judged the most expensive of these ideas — needs real per-room state shared across every player — and was dropped rather than designed further.

## Faction seasons (shipped v0.60 — Worker/D1 side only, no display yet)

Picked to build first, ahead of bones, ghost demons, and the other weekly-counts ideas.

**Season length: a lunar epoch** — the same ~29.5-day cycle that already reseeds the shared floor shape (`epochIndex()`), reusing existing math rather than standing up a second, unrelated clock. A season starts and ends exactly when a new epoch does.

**Scoring:** every ended run adds a floor-weighted point to its final alignment tag — `floorNum(run)` points go to LAW or CHAOS. A NEUTRAL run's point is the **kingmaker**: it goes to whichever of LAW/CHAOS currently has fewer points this epoch, nudging a lopsided season back toward contested rather than letting one side run away with it — giving NEUTRAL a real, dynamic reason to exist in the season metagame beyond easier recruiting from both sides. On an exact tie, a NEUTRAL run's point simply isn't added to either side — nothing to fix if nobody's behind.

**Storage:** one small counters table, `(period, key) -> count` — the same generic shape any of the other weekly-counts ideas would use (`period` is just a string: a calendar-week label for some counters, the epoch index for this one). For faction seasons specifically: **two rows per epoch**, keyed `LAW`/`CHAOS` — not three, since in the kingmaker model NEUTRAL never has a tally of its own, its point always lands on an existing row.

**Write path (shipped):** piggybacks on a run's existing leaderboard submission — no new endpoint, just more logic (`tallyFaction()`) inside the same `POST /score` Worker call that already posts a score, built exactly as scoped. LAW/CHAOS runs are a blind upsert (`count = count + floorNum`). The NEUTRAL case is a single conditional `UPDATE` — D1 handles it cleanly — rather than a SELECT-then-UPDATE round trip, closing the race this section flagged between two NEUTRAL runs landing close together. Also guarded against double-tallying a retried post of the same run (only fires when the leaderboard insert actually added a new row).

**Read path (shipped differently than planned):** built as its own `GET /season` endpoint instead of riding along in the title screen's one-packet-a-day fetch — there's nothing yet to batch it *with*, since notes/bones/echoes don't exist in code. This is a known, deliberate deviation from the read-budget section below, not an oversight: once any of those other async features actually get built, `/season` should fold into the shared packet endpoint rather than staying its own request.

**Display:** the title screen's `LEAN` bar (`this week leans CHAOS [||||||||.........] 35/65`) is the natural home for this — already mocked as a two-sided bar, which fits the kingmaker model cleanly since there are only ever two rows to split between.

**Reward:** cosmetic only — a board title, an omen-voice shift for the leading faction. Nobody needs to win the season to play well; it's flavor, not power.

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
- **Rough budget estimate:** a packet of ~10 counters + 3 faction rows + 10 notes/bones + 5 echoes ≈ 30 rows read; at 1,000 daily players that's ~30,000 rows/day against a 5,000,000 cap — not a concern until well into tens-of-thousands-of-daily-players territory.
- Explicitly **not** a fix for anti-cheat — forged local saves could still inflate what gets posted into notes/bones/counters; that's mitigated only by keeping all of this cosmetic/low-power and by the event-sourced economy ledger above, not by the read-budget rules.

## Notes, bones, and other things players leave behind

- **Left messages / Souls-style notes** — attached to a room *kind*, not a room *location*. Should use **fixed phrase lists, not free text** — prevents both abuse and accidental spoilers.
- **Bones (NetHack-style)** — on run end, keep a snapshot (name, floor, cause of death, party, last words); later players who reach that floor depth find the remains, with fixed loot and flavor text.
- **Demon echoes** — a demon that corrupted/killed someone in one run can re-spawn (reskinned, maybe carrying a trace of the original player's name) as a wandering demon in someone else's run.
- **Route traces** (lighter cousin of the rejected ghost-replay idea) — a compact breadcrumb (room, day, search count) surfaced as a faint minimap trace or a line like "[name] was here, day 3." Since "room" here means a canonical shape-layer slot, showing a trace meaningfully still requires translating it through the viewer's own private kind/compass assignment — treat as a "maybe, at small scope."
- **Altar gifts** — a player can leave a COMMON/UNCOMMON item at an altar for a stranger to find later; kept low-rarity deliberately, to limit how much a forged save could abuse it.
- **More frequent leaderboard posts** — post progress on each floor descent, not just run-end, so the board becomes a live "who's where" feed.

---

# Part 11: Title screen (design settled, not yet built)

Reuses the real in-game frame's zones rather than inventing a new layout — just new content in the same slots, mocked at 80 columns to match the real game.

**Top box (moon + date header):** unchanged, exactly the real in-game header. No new work.

**3D-view slot:** a static centered wordmark ("DAILY DIGITAL DEMON DUNGEON" + a one-line tagline) stands in for the dungeon view, since there's no run yet. Pure decoration, nothing to wire up.

**Log box (3 lines):** repurposed as cold, stable facts that don't change until the day rolls over:
```
> WEEK      TUE, day 2 of 7  -  5 days left, this floor closes SUN
> EPOCH     epoch 14, day 9 of 29  -  new shape in 20 days
> LEAN      this week leans CHAOS   [||||||||.........]  35 / 65
```
WEEK/EPOCH are already computable from existing code (`epochIndex()`/`utcDay()`, the existing week/deadline logic). LEAN is the one new piece, and is now unblocked — it reads straight off Part 10's faction-season counters (the current epoch's two LAW/CHAOS rows), which is exactly why that got built first.

**Sidebar slot — "RUMORS AND SECRETS":** where PARTY/MAP/ALIGN normally render; repurposed as a pinned header (`RUMORS AND SECRETS` + a rule line) with a scrolling, auto-advancing list of cards underneath — only the cards move, the header stays put. Cards are a mix of two kinds, shuffled together (capped at two of the same kind in a row so it never settles into a visible pattern):

- **Hard-number cards** — exact counts, anonymized (no player names, no rankings): `Last fall: 3 hours ago`, `Deepest floor: B4F`, `Turns logged: 1,842`, `Players seen: 312`, `Pacts: 118 made, 54 ended`, `Items broken: 67`, `TRIPs reported: 9`, `Longest wall search: 61x`, `Gifts refused: 23`, `Answered [S]ILENT: 441x`, `Faction lean: CHAOS 65%`, and the day's real shared omen as one of these cards too.
- **Rumor cards** — vaguer, atmosphere-first lines that *reference* an in-game event without quoting the actual triggering line, so they don't spoil or duplicate the game's own flavor text: `A demon rejected a traveler's paltry gift.` / `Someone was asked if they trust the dark.` / `A corrupted voice turned, and was made whole again.` One deliberate exception: **last words are quoted verbatim but never attributed** — framed as the dungeon speaking, not a named player's death.
- One blank line between every card regardless of kind. Multi-line cards (most rumors) wrap to the sidebar's width; single-line cards (most stats) don't.

**Scroll behavior (settled this pass):** medium/slow speed — readable without feeling static. No pause-on-hover for now (may revisit later). Cards show a full cycle before any repeat, rather than looping/repeating early within one sitting.

**Menu bar:** `[N]EW RUN   [C]ONTINUE   [B]OARD   [?] ABOUT` — same bracket-letter convention as the real in-game action bar.

**New infra, and build order (settled this pass): hard-number cards first.** They're the cheaper half — most of them read off counters that already exist or are now settled (the live leaderboard/graveyard tables via an indexed `LIMIT 1` query, the faction-season counters from Part 10) — same precomputed-counter approach as the weekly-counts idea, incremented once at run submission, never a `COUNT(*)` scan. Rumor cards are the bigger lift: they need a new, deliberately lightweight "ambient events" channel with nothing behind it yet — a tiny ping (a type tag + which flavor line/outcome fired + a timestamp, no player ID, no name) sent whenever a listed moment happens in someone's real game (a gift refusal, a corrupted-demon restoration, a trickster running off, a party member leaving, a fall for the last-words case). The server keeps the last N of each event type; the title screen pulls a handful at random to build the day's rumor cards from. Forging a fake event here is cheap and that's fine — unlike the leaderboard, nothing downstream trusts these for ranking or rewards, so the worst case of abuse is a silly line in a flavor feed, not a cheated score.

# Part 12: Open questions / not yet decided

- Exact menu of wing-internal topology shapes (chain, branch, loop, + maybe one more) and whether topology variety implies variable wing size (currently fixed at 3 spaces per wing).
- Whether/how to layer demon echoes, notes/bones, route traces, or the lighter-lift async ideas (world boss, season title, epoch leaderboard, faction seasons, sighting log, one-time loot) on top of the core system, and in what build order.
- Trade-offer UX (how two players actually connect to trade) and secret-key export/backup UX (copy/paste vs. QR code).
- Live-presence granularity and exact Durable Object design for it.
- Exact schema for bones/echo/trace/counter rows (sketched conceptually, not laid out field-by-field).
- Whether/when server-side replay verification is ever worth the Workers Paid tier, vs. accepting event-sourced "believability checks" indefinitely.
- Final alignment tag naming (Part 6) — no decision made.
- Dissonance (Part 5): merge-into-Patience is decided, naming/read-out is decided (CALM/STRAINED/FRACTURING on Patience's own scale). Still open: exact wear numbers for fight/skip-day/linger, the alignment-flavored warning-line text, the new give-to-party-member action's mechanics, the omen tie-in (deferred alongside the broader omen-balancing thread), the cross-alignment combo-skill pairings/effects, and whether NEUTRAL needs an explicit extra discount on top of its naturally smaller gap.
- STANDBY-banked-omen balance (Part 1/8): cap is 1, decay/expiry still unexplored, and whether banking a bad omen is ever worth it is still open. The offsetting-cost question is partly answered as of v0.58 (a flat 7-real-day cooldown on holding again after a release) — open now is only whether Hold itself should ever cost something too, and whether a bigger cap is worth it.
- Telegraphing for the omen-streak room unlock (Part 8) — the streak itself is shipped, but no in-game buildup cue exists yet. Also worth revisiting the LAW/CHAOS lean mapping, since it currently makes CHAOS streaks ~3x more common than LAW streaks.
- Exact daily probability curve for the ordinary bonus-room roll (flat vs. smoothed to land closer to exactly-twice-a-month).
- Title screen (Part 11): layout, scroll behavior, and build order (hard-number cards before the ambient-events channel) are all settled. Still open: the exact full list of ambient-event trigger types to wire up, and whether a bigger/different set is worth adding once the channel exists.
