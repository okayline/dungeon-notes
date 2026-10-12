# Daily Dungeon — Theorycrafting Notes
**v10 — Oct 11 2026**

Ideas that are **not built and not yet settled**. Anything shipped, or settled enough to build from, lives in `daily-dungeon-design.md`; per-release detail lives in the changelogs. As of this pass the game is at **v1.02** (wing-based levels again since v0.80, a climb out of a pit on the moon's quarters, breath, a title screen with a live feed, live presence, the exchange in every dead end, and ten bots playing and trading daily).

Moved out in v10 (shipped in v1.00-v1.02, now in the design doc): live presence and the admin view (Part 10), the player economy and the exchange room (Parts 10 and 12), the search cadence (Part 1).

Moved out since v6, because they shipped or were settled: faction seasons (design doc Part 10), the title screen including its unbuilt stages 4–5 (Part 11), Dissonance and its open pieces (Part 5), alignment tag renames (Part 6), and the Hold/Release Omen consolidation (Part 1). The read-budget rules for any async feature are in the design doc's Part 10 as well.

These are working notes, not a spoiler-safe document.

---

## 1. Multiplayer / async ideas (none built)

The leaderboard and faction seasons already give async players some shared context. This section is about going further. The design doc's Part 10 lists the same ideas in one line each; the detail is here.

### Bones (highest interest, explicitly wanted)
NetHack-style: when a run ends, keep a small server-side snapshot (name, floor, party, cause of death, last words) attached to a **level and room kind** (the offers are shared, the doors are private, so bones have to live on the shared side to make sense across players). Later players in that room can find the remains: fixed flavor, maybe recoverable loot, never free text.

### Ghost demons
A dead player's party member reappears as a nameable wild encounter (`PIPEDREAM's PIXIE`), keeping its personality and alignment, recruitable by someone else. The existing pact record (name, floor, day, active) already holds most of the data this needs.

### Counts by level
The monthly counters shipped in v0.73 (design doc Part 11). Not built: the same tallies split by level (falls on B3F this moon), which would be more keys in the same table.

### Ghost routes (not started)
- Since v0.77 everyone playing in a moon quarter is on the same level with the same offers, which is most of what a "shared floor-week" asked for. Sharing which door is which would still be a spoiler, so that part would have to be a **separate challenge mode**.
- Softer version: record a compact **route** per run (room/day/search counts, a few hundred bytes, never the full log) and show faint traces of other players on the same level ("`PIPEDREAM` was here, day 3"). Informational only, so forgeable routes don't matter much.

### Bones, ghost routes and shared wards are one shape
All three are the same record: small, anonymous, keyed to a level and room, read once a day inside the one-packet budget. Whichever is built first makes the other two cheap. That doesn't decide which goes first, only narrows the cost of building more than one.

---

## 2. Free actions & the Elbereth-style ward (none built)

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

### More free actions beyond search/turn
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

### The ward (Elbereth, reskinned)
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

### Shared visibility within the quarter
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

## 3. ASCII first-person view mockups (exploration, not committed)

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

## 4. Leaderboard notes

- Any new board-adjacent idea (bones, ghosts, counters) should extend the existing Worker and schema, which already handle name and run-id validation, per-sender rate limiting, and the admin delete path. Don't stand up a second one.
- Full run-replay verification isn't possible under the free plan's 10ms CPU cap, which is why scores are openly unprovable. The $5/month paid plan, not a VPS, would be the way to unlock it if it's ever worth doing.
- A richer board UI (Cleared / Dead / Graveyard tabs, pagination, a "YOU — #N of M" row) was mocked up once. Low priority; it will come naturally as bones and the other async pieces get built.

---

## 5. A named buff for the day after a held day

Deferred and deliberately undesigned. There is already a real mechanic the player is never told about: `st.restedDay` gives a 25% search-effectiveness bonus the day after a held day. A named buff should be that bonus made legible, not a second one stacked on top.

---

## 6. Dead ends as a place for other players (discussed, nothing chosen)

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

## 7. The escape: what is decided and not yet built

Built in v0.77 and kept through the v0.80 rollback: the pit (B4F up to the surface), levels lost at the moon's quarters, waking on the level the dark has reached, play continuing past the surface. That also retired the late-week start rule.

Still to build, as agreed:
- **Getting out is a finish.** Reaching the surface completes the monthly climb; the player can stop there or go on.
- **Past the surface is the endgame,** with no top. It could be harder as well as longer (corruption from the first day, the bonus room and THE VOID back, less time a level).
- **Two boards.** This moon: who got out and how fast, then by levels climbed; resets each lunar month. All time: the highest anyone has climbed past the surface.
- **Open:** what is at the top; drawing the moon larger in the sky view the higher she is.

---

## 8. A map of the shared level (tried several ways)

The offers and wing shapes are shared, so a level could be drawn for everyone. What was tried on Oct 11:
- A sideways strip (`[v]----< >----< >...[?]--[^]`) with room counts and the offers by feel. It shipped only on the end-of-run page, cut down to the room she took each day, because showing the week's offers would spoil them.
- An upright "readout" with block bars, and a "circuit" with a node a room: liked the look, "doesn't look like a map".
- Trees (symmetric, asymmetric, twiggy): set aside.
- **What shipped (v0.93):** a line of the quarter's lunar days with a decorative branch off each, future days masked. It is the level's mark, not a map.

Things learned: every wing has exactly three rooms, so "size" can't be shown honestly; and anything that draws wing shapes lets a player work out their own map rotation. A later step that needs the Worker: marks on each day for how many players are there (the presence ping already carries the level; it would need the day).

---

## 9. Other ideas from the same session

- **What could take `[F]IGHT`'s old slot on the bar** (left empty): `[W]AIT` for STANDBY (the day's other big choice, currently buried in the bag), `[G]IVE`, `[R]EST` (get breath back faster at a cost such as heat), `[L]ISTEN` (a quieter, less informative search).
- **Live presence:** built in v1.00 (design doc Part 10). Still open: a listening-post room, something small when several players are on a level at once.
- **Names in the feed:** events now store the run's name. "HAL-BOT fell on B4F to a CHROME ONI" would make the typed line a world of people; it ends anonymity and needs the board's name filter.
- **Per-level counts on the title** beyond presence (falls on B3F this moon).
- **Breath levers:** a bigger bar, a faster refill, search time that grows as she tires (built in v0.84, removed), a `[R]EST` action.

---

## Open questions

1. Bones or ghost demons next, now that faction seasons are built?
2. Should a fully shared level (same doors for everyone) ever exist as a separate challenge mode, given the spoiler problem?
3. Does the game still want an endgame distinction between Mythic and Moon rarity, now that the structure has changed so much from the original weekly-floor design?
4. Ward materials: are chalk, salt or a match consumed on use, and which existing junk items double as them?
5. Does the data-demon "firewall mark" need its own flavor and materials, or just a different name on the same mechanic?
6. Shared wards, and by extension bones and ghost routes: cosmetic-only trace, or functional for whoever finds it? A blanket rule ("anything visible to other players is flavor-only, never mechanical") would settle all three at once. Not adopted without your go-ahead.
