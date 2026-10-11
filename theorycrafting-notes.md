# Daily Dungeon — Theorycrafting Notes
**v7 — Oct 11 2026**

Ideas that are **not built and not yet settled**. Anything shipped, or settled enough to build from, lives in `daily-dungeon-design.md`; per-release detail lives in the changelogs. As of this pass the game is at **v0.62.2**.

Moved out since v6, because they shipped or were settled: faction seasons (design doc Part 10), the title screen including its unbuilt stages 4–5 (Part 11), Dissonance and its open pieces (Part 5), alignment tag renames (Part 6), and the Hold/Release Omen consolidation (Part 1). The read-budget rules for any async feature are in the design doc's Part 10 as well.

These are working notes, not a spoiler-safe document.

---

## 1. Multiplayer / async ideas (none built)

The leaderboard and faction seasons already give async players some shared context. This section is about going further. The design doc's Part 10 lists the same ideas in one line each; the detail is here.

### Bones (highest interest, explicitly wanted)
NetHack-style: when a run ends, keep a small server-side snapshot (name, floor, party, cause of death, last words) attached to a **floor depth**, not coordinates (layouts are split shared-shape/private-contents, so bones have to live on the shared side to make sense across players). Later players at that depth can find the remains: fixed flavor, maybe recoverable loot, never free text.

### Ghost demons
A dead player's party member reappears as a nameable wild encounter (`PIPEDREAM's PIXIE`), keeping its personality and alignment, recruitable by someone else. The existing pact record (name, floor, day, active) already holds most of the data this needs.

### Weekly counts
Deaths by floor and similar tallies, in the same counters table shape faction seasons use, keyed by calendar week (`2026-W41` / `B2F_deaths`) and incremented in the run-end submission the board already makes.

### Shared floor-week / ghost routes (bigger lift, not started)
- A fully shared layout (same rooms and doors for everyone in a period) brings back the spoiler problem the private minimap was built to avoid, so it would have to be a **separate challenge mode**, not the main game.
- Softer version: record a compact **route** per run (room/day/search counts, a few hundred bytes, never the full log) and show faint traces of other players at the same depth ("`PIPEDREAM` was here, day 3"). Informational only, so forgeable routes don't matter much.

### Bones, ghost routes and shared wards are one shape
All three are the same record: small, anonymous, keyed to a floor depth, read once a day inside the one-packet budget. Whichever is built first makes the other two cheap. That doesn't decide which goes first, only narrows the cost of building more than one.

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

### More free actions beyond search/turn
- **Listen:** quieter than search — gives a noise-type tell (repetition vs.
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
- **Ask the room a question:** rare, moon-gated yes/no tell.

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

### Shared visibility within the week
- A ward written in a room could be visible to other players who reach
  that same floor depth during the same week — not functional for them,
  just visible, like a trace that "someone wrote something here."
- Slots directly into the existing multiplayer/read-budget framework
  (section 1): same shape as a bones/ghost-route record — small,
  anonymous, attached to a floor depth, read as part of the one-packet-
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

## Open questions

1. Bones or ghost demons next, now that faction seasons are built?
2. Should shared floor-weeks ever exist as a separate challenge mode, given the spoiler problem?
3. Does the game still want an endgame distinction between Mythic and Moon rarity, now that the floor structure has changed so much from the original weekly-floor design?
4. Ward materials: are chalk, salt or a match consumed on use, and which existing junk items double as them?
5. Does the data-demon "firewall mark" need its own flavor and materials, or just a different name on the same mechanic?
6. Shared wards, and by extension bones and ghost routes: cosmetic-only trace, or functional for whoever finds it? A blanket rule ("anything visible to other players is flavor-only, never mechanical") would settle all three at once. Not adopted without your go-ahead.
