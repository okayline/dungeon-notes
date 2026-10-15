# Daily Dungeon: heat, verbs and patience notes

Oct 15 2026, written at v1.11. Ideas are marked **decided**, **leaning**, **proposed** (suggested, not confirmed) or **open**.

## Decisions at a glance

- **Heat:** a demon cools the room after you deal with it. No heat gauge. Searches in a hot room get a slower, heavier rhythm. Minimap walls are the leading way to show it (leaning).
- **Patience:** something you build. Tension is removed. It only drops in a hot room. The bottom is CONTENT, with no negative feelings, no snapping and no leaving. Nagging remarks stay as flavor only.
- **WORD:** always a decision, with no wrong answer. The two options give different kinds of equal-value good. Members offer different pairs by personality. Options are clearly labeled.
- **Safe versus gamble:** appears on demon offers, on a worn wall (more often in hot rooms), on the moon at fuller phases, and in a hot room. Not on low breath.
- **Not doing:** AURA as an on/off mode (too much programming for now), a +2 versus +1 match system, or letting the player pick which member to talk to (needs UI changes).
- **Box at the end of a wing:** develop it more, as the multiplayer interaction.

## Heat: what it does now

From the internal changelog:

- Every search warms the room (v0.18).
- A demon's chance per search goes from about 1 in 24 in a cold room to about 1 in 4 in a hot one.
- Heat halves overnight. It is the only cooling (real-time cooling was tried in v0.81 and reverted in v0.83).
- Lingering in a hot room wears on clashing party members (v0.59). This is being reworked, see Patience below.
- The player only sees it through the AURA room read (three tiers) and "it's warm" lines. The moon-strip gauge went away when breath replaced it.

**The problem:** once a room is hot, demons keep coming and nothing cools it. The player also can't tell whether more demons is good or bad, because demons are both a threat and loot (they carry things and drop them when beaten).

## Heat ideas

1. **A demon cools the room after you deal with it.** (**decided**: "that makes sense".) Fight, WORD or run, then heat drops by a chunk. A hot room becomes a cycle (push, something comes, you handle it, you can search again) instead of a pile-up.
2. **Heat changes who shows up, not what they hold.** (**open**.) A hotter room draws louder, older demons (the aura "pull" already does this). Louder demons carry a bit more. Nothing is made from nothing, which fits the fact that pockets are filled on first look.
3. **No gauge.** (**decided**: too easy.) Replace the "it's warm" flavor lines where possible, since the goal is less text, not more.

## Making heat visible without a gauge

- **Minimap walls** (**leaning**, liked it). Rooms you've visited keep their own heat, so the map would also show which rooms were left hot.
- **Search rhythm** (**decided**: slower when hot, "oppressive"). Keep it small: only the dots, roughly 200 ms each up to 300 to 400 ms at the hottest. The old search pause that grew with heat (up to 2 s, v0.81) was removed in v0.83, so this should stay light.
- **3D panel art** (**later**): cracks and scratch marks creeping across the walls, dust on the floor, or warped door frames. It must be static (the standing rule: no glow or dimming).
- Other options, not chosen: faster cursor blink, a mark by a party member's name, a word change in the room-name slot.

### Wavy walls on the minimap

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

## AURA, MOON and WORD

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

## Safe versus gamble choices

A choice between a small sure gain and a bigger gain that only sometimes lands. A fizzle gives nothing, never a penalty. It is only available sometimes, depending on context.

- **Hot room** (**decided**).
- **Demon offers** (**decided**): for example a SLY demon holds out a sure small thing against a mystery one.
- **A worn wall** (**decided**): keep searching as usual, or dig deep for a better chance of a big find at the cost of more heat. Appears more often in hot rooms.
- **The moon on fuller nights** (**decided**): a safe gift next to a rarer one that might not come through.
- **Low breath** (**decided: no**).

## Patience (rework)

**Today** (from the changelog): patience is the only stored meter. Tension is not stored; it is worked out from alignment gaps (LAW against CHAOS is the big gap) and wears patience in fights with a clashing pair, in hot rooms, and on skipped days (that last one loses to the nightly regen). Patience also drops from nagging remarks, fiddling with items, breaking things a member loves, and CHAOS members lashing out. At zero a member can snap or leave. It currently drains too fast and members get upset (**decided**: dislikes that).

**New shape** (**decided** unless marked):

1. **Remove tension** as a source of wear (the alignment-gap check).
2. **Patience only drops in a hot room.** Nagging, fiddling, breaking things and lash-outs no longer cost patience. The nagging remarks stay as flavor.
3. **Patience builds up** from WORD, offers, truces and a night's rest, as now. Offers and confides already open up at higher patience.
4. **The bottom is CONTENT.** No snapping, no lash-outs, no leaving. A content member goes calm and a bit less chatty, then returns to normal with a WORD or a night's rest (the calm and less chatty detail is **proposed**).
5. **Reword the tired and tense lines** so they sound content, not unhappy (follow-up).

A hot room now does two jobs: it wears on the party, and it brings more of the safe-versus-gamble choices.

## Summary of the rest of the talk

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

## Next steps (open)

- Choose how much of heat's effect is danger and how much is reward, and how much a demon cools the room.
- Decide whether to add the "louder demons carry more" link.
- Pick the minimap wall style and test the characters in the page font.
- Define the WORD pairs for each personality (which rewards each member tends to offer) and write the labels.
- Decide whether looking up at the moon costs a breath, and what happens when she has set.
- Decide how to separate AURA from WORD now that WORD is a decision (fold AURA into other actions, or split by target).
- Patience: remove tension, remove the other costs, add the CONTENT bottom, and reword the tired and tense lines.
- Set where and how often the safe-versus-gamble choices appear.
- Go through every on-screen line with the "does it change a decision?" test.
