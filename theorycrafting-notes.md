# Daily Dungeon — Theorycrafting Notes
**v6 — Oct 10 2026**

This file only holds ideas from this chat that are **not** (yet) in the real
build. The actual game lives in the `daily-dungeon` repo and its own
`CHANGELOG.md`/internal changelog is the source of truth for anything built —
this doc doesn't repeat or re-derive what's already shipped, since the two
would just drift apart. As of the last changelog shared here, the game is at
**v0.57.3** (STA[N]DBY moved into INVOKE as two pseudo-items, Hold Omen and
Release Omen — same mechanism as before, just relocated) and has diverged
from a lot of the original brainstorming below
(wings instead of fixed weekly floors, a shared/private seed split, patience
instead of a separate Dissonance meter, the CELL charge system built and then
removed again, a live Cloudflare leaderboard, etc.).

**Changelog policy, confirmed this pass:** the public-facing `CHANGELOG.md`
stays spoiler-free and minimal (accurate, but not a mechanism dump); the
internal `dungeon-notes` changelog stays comprehensive. This doc follows the
same spirit — it's working notes, not a spoiler-safe document.

What follows is just the still-open stuff.

---

## 1. Multiplayer / async ideas (none built)

The leaderboard (Cloudflare Worker + D1, `leaderboard/` in the repo, live
since v0.53) already gives async players *some* shared context — this
section is about going further.

### Bones (highest interest — explicitly wanted)
NetHack-style: when a run ends, keep a small server-side snapshot (name,
floor, party, cause of death, last words) attached to a **floor depth**,
not coordinates (since layouts are now split shared-topology/private-detail
per v0.56-57, bones would need to live on the shared-seed side to make
sense across players). Later players at that depth can find the remains —
fixed flavor + maybe recoverable loot, never free text.

### Ghost demons
A dead player's party member reappears as a nameable wild encounter
(`PIPEDREAM's PIXIE`), keeping its personality/alignment, recruitable by
someone else. The existing pact-recording (name, floor, day, active —
v0.47) already holds most of the data this would need.

### Weekly counts / faction seasons (easy, same infra as the leaderboard)
- One small counters table: period + key + number (e.g. `2026-W41` /
  `B2F_deaths`). Incremented in the same submission the leaderboard already
  does at run end — no new write path.
- **Faction season:** every ended run's final alignment tag adds a
  floor-weighted point to LAW/NEU/CHA; log shows which side is leading
  (`412 runs ended on B2F this week`). Reward should be cosmetic (an omen
  voice tweak, a board title) so nobody needs it to play well.
- Season length: could be a calendar period, or computed from a known
  lunar reference the same way `epochIndex()` already does for the shared
  floor seed (v0.56) — reuse, don't reinvent.

### Shared floor-week / ghost routes (bigger lift, not started)
- Full shared layout (same rooms/doors for everyone in a period) reintroduces
  the spoiler problem the v0.57 minimap-transform fix was specifically built
  to avoid — so this would likely need to be a **separate challenge mode**,
  not the main game.
- Softer version: record a compact **route** per run (room/day/search
  counts, a few hundred bytes — never the full adventure log) and show
  faint traces of other players on the same depth ("`PIPEDREAM` was here,
  day 3"). Purely informational/cosmetic, can't affect your own run, so
  forgeable routes don't matter much.

### Read-budget rules for any of the above (agreed approach)
1. **One packet per player per day** (or per floor arrival, since descending
   is free) — not one request per room. Cache client-side; only refetch on
   day/floor change.
2. **Every query indexed, every query `LIMIT`ed** — no `COUNT(*)` over the
   runs table (keep running totals in the counters table instead), no
   `ORDER BY RANDOM()` (bucket rows with a precomputed random bucket number
   instead and query by bucket).
- At an estimated ~30 rows per daily packet, this stays nowhere near
  Cloudflare's free-tier daily caps even at thousands of daily players;
  revisit shared caching only if that changes.

### New observation this pass: bones / ghost-routes / shared wards are one shape
Bones (above), ghost routes (above), and the new shared-ward-visibility idea
in section 2 are all, mechanically, the same record: small, anonymous,
keyed to a floor depth, read once a day as part of the existing one-packet
budget. None of them need their own infra category — whichever one gets
built first effectively makes the other two cheap. Doesn't change *which*
to build first (still open question 1 below), just narrows the engineering
cost of building more than one.

---

## 2. Free actions & the Elbereth-style ward (none built)

Came up together since **Mark** (below) and the ward are really the same
idea. Everything in this section is unlimited and free — same category as
SEARCH and turning, not the daily move.

**Note this pass:** with the CELL/charge system fully removed (v0.57.1) and
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
  documentation, so it's left as open question 8 below rather than
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

## 4. Leaderboard infra notes (superseded by the real build, kept for context)

An earlier Worker+D1 design from this chat (ranked by fewest/most turns,
separate cleared/dead boards, a `score` column) was superseded once the
real leaderboard shipped in v0.53 with different, simpler rules: **ranked
by deepest floor, then most days survived, then earliest post** — turns are
shown as a column but deliberately never ranked on (to avoid rewarding
search-spam). Worth remembering if this area comes up again: the real
Worker already handles name/run-id validation, per-sender rate limiting,
and an admin delete path gated on `freeSteps`/an admin key — any new
leaderboard idea (bones, ghosts, faction counters) should extend that
Worker/schema rather than stand up a second one.

Cloudflare free-plan ceiling worth remembering: **no full run-replay
verification** is feasible under the 10ms/request CPU cap on the free
plan — hence "scores can't be proven" being called out explicitly in the
real Worker's own comments. Moving to the $5/mo paid plan (not a VPS) would
be the way to unlock that later, if it's ever worth doing.

A richer, tabbed leaderboard UI (Cleared / Dead / Graveyard tabs,
pagination, a "YOU — #N of M" standing row) was also mocked up at one
point — **low priority for now**; a fuller UI will come naturally as the
multiplayer/bones/faction-season ideas above actually get built, rather
than being designed ahead of that.

---

## 5. Title screen (not built — mockup only)

Reuses the real in-game frame's zones rather than being a separate layout,
so no new screen structure is needed — just new content in the same slots.
Mocked at 80 columns to match the real game.

**Top box (moon + date header):** unchanged, exactly the real in-game header.
No new work.

**3D-view slot:** a static centered wordmark ("DAILY DIGITAL DEMON DUNGEON"
+ a one-line tagline) stands in for the dungeon view, since there's no run
yet. Pure decoration, nothing to wire up.

**Log box (3 lines):** repurposed as cold, stable facts that don't change
until the day rolls over — these are the direct "day xx of the week, x days
left, day xx of the current epoch" numbers requested:
```
> WEEK      TUE, day 2 of 7  -  5 days left, this floor closes SUN
> EPOCH     epoch 14, day 9 of 29  -  new shape in 20 days
> LEAN      this week leans CHAOS   [||||||||.........]  35 / 65
```
All three are already computable from existing code — `epochIndex()`/
`utcDay()` (v0.56) give the epoch numbers, the existing week/deadline logic
gives the floor numbers. Faction lean is the only new piece (needs the
faction-season counters from section 1 above).

**Sidebar slot — "RUMORS AND SECRETS":** this is where PARTY/MAP/ALIGN
normally render; repurposed as a pinned header (`RUMORS AND SECRETS` + a
rule line) with a **scrolling, auto-advancing list of cards** underneath —
only the cards move, the header stays put. Cards are a **mix of two kinds**,
shuffled together (capped at two of the same kind in a row so it never
settles into a visible pattern):

- **Hard-number cards** — exact counts, anonymized (no player names, no
  rankings): e.g. `Last fall: 3 hours ago`, `Deepest floor: B4F`,
  `Turns logged: 1,842`, `Players seen: 312`, `Pacts: 118 made, 54 ended`,
  `Items broken: 67`, `TRIPs reported: 9`, `Longest wall search: 61x`,
  `Gifts refused: 23`, `Answered [S]ILENT: 441x`, `Faction lean: CHAOS 65%`,
  and the day's shared omen as one of these cards too (`Omen: "The wires
  remember."` — the real, current-day omen, same one the top box's line 1
  would show once a run starts).
- **Rumor cards** — vaguer, atmosphere-first lines that **reference** an
  in-game event or attitude without quoting the actual triggering line
  (so they don't spoil or duplicate the game's own flavor text), e.g.:
  `A demon rejected a traveler's paltry gift.` / `Someone was asked if they
  trust the dark.` / `A corrupted voice turned, and was made whole again.`
  / `Something ran off laughing, gift in hand.` / `An altar considered an
  offering, and was pleased.` / `A stranger walked in, uninvited.` /
  `Silence, offered instead of an answer.` / `A wall gave up its secret,
  after many tries.` One deliberate exception: **last words are quoted
  verbatim but never attributed** — `The dungeon whispered, "my Mom is
  going to be SO mad."` — framed as the dungeon speaking, not as a named
  player's death.
- One blank line between every card regardless of kind. Multi-line cards
  (most rumors) wrap to the sidebar's width; single-line cards (most
  stats) don't.
- Exact scroll speed is a "see it running before tuning it" call — not
  decided yet.

**Menu bar:** `[N]EW RUN   [C]ONTINUE   [B]OARD   [?] ABOUT` — same
bracket-letter convention as the real in-game action bar.

### New infra this would need

- **Hard-number cards** need the same precomputed-counter approach as
  section 1's weekly counts/faction seasons — incremented once at run
  submission, read as a single row, never a `COUNT(*)` scan. Several
  (deepest floor, last fall) could piggyback on the existing live
  leaderboard/graveyard tables with an indexed `LIMIT 1` query instead of
  needing anything new.
- **Rumor cards need a new, separate "ambient events" channel** — and
  deliberately a much lighter-weight one than the leaderboard, since
  nothing here needs to be provable:
  - The client pings a tiny event (**a type tag + which flavor line/outcome
    fired + a timestamp — no player ID, no name**) whenever one of the
    listed moments happens in someone's real game: a gift refusal, a
    corrupted-demon restoration, a trickster demon running off, an altar's
    `:)`/`:|`/`:(` reaction, a party member leaving, a deep-cache find, a
    `[S]ILENT` answer, a fall (for the last-words case specifically).
  - The server keeps the last N of each event type; the title screen pulls
    a handful at random to build the day's rumor cards from.
  - **Forging a fake event is cheap and that's fine here** — unlike the
    leaderboard, nothing downstream trusts these for ranking or rewards,
    so the worst case of abuse is a silly line in a flavor feed, not a
    cheated score. That makes this considerably easier to greenlight than
    anything leaderboard-adjacent.
  - Last-words specifically: pull the actual `LAST_WORDS`/`LAST_ANY` string
    that fired on a real fall, display it quoted, attribute it to nobody.

---

## 6. Not built yet: Dissonance (cross-alignment party tension)  *(low priority — design settled this pass, not yet in `rules.js`)*

Still no `rules.js` equivalent — **design question resolved** in a different
chat on this project, now written up in `daily-dungeon-design.md` Part 5:
folds into the real **patience** system (v0.24+, warn-then-snap-or-leave,
v0.52's `p.warned` one-free-warning behavior) rather than a second hidden
value, confirming the lean this section already had. Full mechanism (an
alignment-gap number per member-pair, three new wear sources — fighting,
skipping a day, lingering in a hot room — scaled by gap size, and a
CALM/STRAINED/FRACTURING read-out that's just Patience's own level relabeled)
lives in that doc, not repeated here.

Two pieces from this section **were not yet carried into that writeup** and
stay open:
- **Power/combo skills** (PING + REDCAP: a strike that always finds its
  target; CRON + BANSHEE: a scheduled scream) as the reward side of running
  a mixed party — exact pairings/effects still TBD, now flagged in v3's open
  questions too.
- **Neutral as the bridge** — whether a `[NEU]` member's naturally smaller
  gap (1, vs. 2 for an opposite pair) reads as enough of a discount on its
  own, or needs an explicit extra one, to give the middle tag a combat
  payoff beyond easy recruiting from both sides.

The opposite-alignment-recruit brake and the "mixed shouldn't strictly
dominate, careless mixed should struggle by mid-dungeon" tuning goal are
both carried over into v3 as-is (the brake turns out to already exist via
ordinary recruiting's alignment lean, no new work needed there).

---

## 7. Not built yet: alignment tag renames  *(low priority)*

Current real tag is `[LAW] / [NEU] / [CHA]` (now sitting between SILVER and
ICHOR per v0.46.1, with a directional `<NEU]`/`[NEU>` pull indicator on the
action that just happened). No rename has been picked. Options discussed,
if ever wanted:

**Same meaning, more setting-specific labels:**
- `[SYS] / [NEU] / [OLD]` — the system vs. the old layer (my pick, fits
  "magic was here first")
- `[COR] / [NEU] / [STR]` — corp vs. street
- `[COD] / [NEU] / [RUN]` — code vs. rune
- `[ORD] / [NEU] / [WLD]` — order vs. wild

**Different axis entirely** (would need new monster-affinity rules, not a
drop-in rename): data-vs-flesh, talk-vs-fight, careful-vs-reckless,
sun-vs-moon, debt (`[OWE]/[EVN]/[OWN]`).

Not decided either way — purely a "would this read better" question.

---

## 8. Not built yet: Hold/Release Omen consolidation  *(new this pass)*

v0.57.3 moved STA[N]DBY into the INVOKE bag as two separate pseudo-items,
Hold Omen and Release Omen — same mechanism as before (`st.held` →
`sync()`'s `st.bankedOmen`), just relocated. Floated as a possible next
step, **not yet built, not yet confirmed:**

- Collapse the two bag entries into a single morphing slot: shows "HOLD
  OMEN" normally, becomes "RELEASE OMEN" once one's banked, then greys out
  for a cooldown period after release.
- Open mechanical questions, unresolved as of this pass: does the cooldown
  start at release (not at hold)? Is "a week" a flat 7 real days, or tied
  to the calendar week? Neither has been confirmed yet.
- Paired with this: a deferred, intentionally-not-designed-yet "named buff"
  for the day after a held day — exact buff TBD later. Note: there's
  already a real, currently-undocumented-to-the-player mechanic this could
  build on — `st.restedDay` gives a 25% search-effectiveness bonus the day
  after a held day (visible in `search()`'s `worth` calculation). Any named
  buff designed later should probably be this made legible, not a second
  unrelated bonus stacked on top of it.

---

## Open questions (still open after the v0.57.3 changelog)

1. Bones vs. ghost demons vs. faction seasons — which first, if any? (Note:
   whichever ships first makes the other two, plus shared wards, cheaper —
   see section 1's infra note.)
2. Should shared floor-weeks ever exist as a separate challenge mode,
   given the spoiler problem?
3. Does the real build still want an "endgame" distinction between Mythic
   and Moon rarity, now that the room/floor structure has changed so much
   from the original weekly-floor design?
4. Title screen: is the ambient-events channel worth building before the
   hard-number counters, or the reverse — which gives more "alive" feel
   per unit of work?
5. Title screen: scroll speed/pause-on-hover, and whether cards should ever
   repeat within one sitting or guarantee a full cycle before looping.
6. Ward materials: should chalk/salt/a match be consumed on use, and which
   existing junk items double as them?
7. Does the data-demon "firewall mark" counterpart to the ward need its
   own distinct flavor/materials, or just a different name on the same
   mechanic?
8. Shared wards (and, by extension, bones/ghost-routes): cosmetic-only
   trace (safer, simpler) vs. actually functional for other players that
   week (needs real abuse-proofing) — which first? **Flagged this pass:** a
   blanket house rule ("anything visible to other players is flavor-only,
   never mechanical") would settle this question for all three at once —
   worth deciding as policy rather than case-by-case, but not adopted here
   without your go-ahead.
9. ~~Is Dissonance worth building separately, or does patience already cover it?~~ — resolved this pass: folds into patience, written up in `daily-dungeon-design.md` Part 5. Still open from section 6: the cross-alignment combo-skill pairings, and whether NEUTRAL needs an explicit extra discount beyond its naturally smaller gap.  *(low priority)*
10. Which alignment-tag rename, if any — or keep `[LAW]/[NEU]/[CHA]`?  *(low priority)*
11. Hold/Release Omen consolidation (section 8): cooldown-from-release vs.
    cooldown-from-hold, and 7-flat-days vs. calendar week — unconfirmed,
    not yet built.
