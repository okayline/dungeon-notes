# Daily Dungeon — Design Theorycraft

Covers async multiplayer (the main thread), plus two other systems discussed in a separate session: alignment-tag naming and the Dissonance mechanic. Where the two sessions covered overlapping ground (shared-seed floors, infra choices), this file keeps whichever session's conclusion is more fully worked out and notes where the other session's ideas got folded in or superseded.

---

# Part 1: Async multiplayer

## Goal
Add asynchronous multiplayer — everyone feels like they're playing "the same" dungeon — without letting players spoil the experience for each other (no "vault's behind the north door, second wing" callouts), and while keeping the amount of hard-coded determinism low.

## Status: what shipped in v0.56 (this session)

**Shipped:** the shape/contents split, for real, in the live game.
- Floor **shape** (wing count/topology, room-kind pairings, the 3x3-per-wing room grid) is now seeded from `(seasonEpoch, floorDepth)`, identical for every player while that lunar epoch lasts — generated lazily per-wing exactly as described below.
- Floor **contents** — which paired kind lands in which slot, where each room's hidden item/pile is, and the Day-7 wildcard's kind — now come from a second, private per-account seed (`pseed`, rerolled every floor), per the "Contents/presentation (private per account)" list below.
- Fixed a pre-existing bug along the way: the Day-7 wildcard's kind was being drawn from the *shared* seed, even though this doc already called for it to be private (see "Day 7 ... is a private, per-player wildcard" below). It's private now.

**Not shipped — a real gap, not a minor one:** the **door-to-compass-direction mapping is still shared**, not private. See "Minimap handling" below — the per-account rotate/mirror transform that section calls "decided" was never actually built (not this session, not before it). Concretely: two players on the same shared wing right now would still see the same compass layout (same room behind the same N/S/E/W door), so a callout like "the vault's north door, second wing" is still a real spoiler today. Closing this is probably the single highest-priority remaining piece of Part 1, since it's the main threat model the whole shape/contents split exists to prevent.

**Not shipped, by scope decision (not forgotten):** everything under "Lighter-lift shared-experience ideas," "Harder ideas considered" (live presence, player-to-player economy), and "Notes, bones, and other things players leave behind" below — all need new backend/Worker/D1 work and were explicitly deferred for a later session. Parts 2 (alignment naming) and 3 (Dissonance) are separate, unrelated design threads and were also out of scope this session.

**Known pre-existing mismatch, not touched this session:** the "Bonus room" section below describes a private roll made fresh *every day*. The shipped game actually rolls it once per wing, at the moment a wing's door is unlocked (so once-or-twice per floor, not once per day) — this predates this session and wasn't part of the shape/contents work, just noticed in passing. Worth reconciling doc vs. code at some point.

## Core idea: shared shape, private contents

Split a floor into two layers:

- **Shape (shared)** — the stuff that defines the floor's structure but gives away nothing useful on its own:
  - Wing count, which wings pair into a locked-door offer, which wing is last, which wing hides the stairs, which hides the dead-end clue
  - Each wing's internal room-to-room topology (chain, branch, loop, etc. — a small fixed menu of shapes, rolled rather than always the same room→passage→dead-end template)
  - Room-kind roster and pairings for the floor (e.g. "Vault pairs with Forge this floor") — safe to share since it says nothing about *where*. (Mostly — see Bonus room below for the one private exception.)
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

**Generation is fully lazy, per-wing, and entirely client-side.** The shape function is a pure deterministic hash of `(epoch, floorDepth, wingIndex)`, so it doesn't matter *when* it's evaluated — `hash(epoch, 2, 3)` gives the identical answer whether it's computed for the first player to ever reach that wing or the thousandth, on day one of the epoch or day twenty. That means there's no "roll the whole floor at the start of the week" step at all: each wing's shape is simply computed fresh, on demand, the moment any given player actually reaches it — same "nothing past the door exists until it's opened" principle the game already follows, just confirmed compatible with staying shared. And because every input (epoch from the real date via the existing moon-phase math, floor depth and wing index from the player's own save) is already available locally, **this whole layer needs zero network calls** — no server round-trip, no central authority deciding what a wing looks like and broadcasting it. Two players end up "in the same dungeon" purely because they're independently solving the same math problem with the same inputs, not because anything synchronized them. (This only holds within one epoch, by design — cross an epoch boundary between two players' visits and the inputs genuinely diverge, giving unrelated shapes, which is the intended "this month's dungeon" framing, not a gap in the guarantee. The private per-account presentation layer — kind-to-slot, compass direction — is a second, separate deterministic function on top of this, also entirely local, also needing no server.)

**Considered and rejected: a "one room a day" pivot** (dropping wings entirely — one room + a binary door choice per day, searching walls/ceiling/floor, no free wandering within a floor). Would have solved a real pacing complaint (walking around with no payoff feels cliché) but was rejected because it removes the spatial structure this whole shared-shape design depends on — once there's no space to walk through, there's no coordinate left to protect, and most of the private-geometry work (kind-per-slot scrambling, compass scrambling, the minimap debate below) becomes moot. Keeping wings, since the shared-experience-over-a-real-map feeling was the part worth protecting. If the walking-feels-cliché complaint resurfaces, it likely needs a fix that doesn't remove the space itself (e.g. making walking cost or reward something), not a removal of wings.

**Also considered (from a separate session) and superseded by the above:** a simpler "fully shared seeded floor" with a patched-on mitigation (share room *kinds* and door connections only; keep stairs, items, and encounters rolled per-player), or alternatively spinning shared layouts off into a separate "weekly challenge" mode with its own board. The shared-shape/private-contents system above is the fuller, chosen answer to the same underlying problem — no separate challenge mode needed.

## Why this beats a fully shared layout

A fully shared/seeded layout (same map for everyone, same door = same room) was the first idea, but it means *any* communication between players — a message, a note, a Discord post — becomes a spoiler, since "second wing, north door" means the same thing to everyone. Splitting shape from contents keeps the "we're all in the same dungeon" feeling (same wing count/shapes, same demon cast, same loot) while making coordinates themselves meaningless outside one account.

## Season epoch

**Epoch = the real lunar calendar / lunar month** (~29.5 days), not a manually-bumped counter. Reuses the date→moon-phase math the game already has (block moon, 8-phase tracking); the epoch just advances on its own schedule whenever the real moon rolls into a new cycle. Fits the game's existing real-calendar-driven design (daily step, weekly deadlines, moon-linked find rates) and gives the shared floor content a natural in-world framing ("this month's dungeon").

Because the seed is a hash, including epoch isn't a partial influence — changing any single input (including epoch) produces a wholly new, uncorrelated shape (avalanche property of seeded hashes). So a new lunar month means a full, unrelated reshuffle of every floor's shape, not a gradual drift.

**Mid-floor stability ("calendar bug" fix):** since epoch changes over real time, a floor's shape must not be recomputed live from "today's epoch" while a player is on it — that would let a lunar-month rollover reshuffle a floor's shape out from under a player mid-traversal. Fix: stamp the epoch into the player's save the moment they arrive on a floor (`st.floorEpoch = currentLunarEpoch()`), and have that floor's shape generation read `st.floorEpoch` for the rest of their time on it. Only the next floor, generated fresh on arrival, picks up wherever the moon actually is by then.

## Room-kind dealing (the "deck")

Normal (non-bonus) dealing is a shared, deterministic process, seeded the same as everything else in the shape layer:
- Shuffle the floor's 6 room kinds (seeded by `epoch + floorDepth`).
- Deal 2 kinds on the first deal-day (a wing's two-door offer).
- Reshuffle the remaining 4 (same deterministic seed-chain), deal 2 on the next deal-day.
- The last 2 go together on the final deal-day.
- Three deal-events, six kinds, no repeats, identical sequence for every player this floor.

**Elimination note:** in a 6-kind/3-pair deck, once a player has seen 2 of the 3 pairs (4 of 6 kinds), the last pair is deducible by subtraction regardless of how reveal is paced (e.g. revealing only 2 days ahead at a time doesn't prevent this). Decided this is harmless — it only reveals *what's* left, never *where* it is, same safety category as the demon roster or loot pool.

**Day 7 (the week's last day) is a private, per-player wildcard** — independently rolled per account, not drawn from the shared deck at all. This was chosen specifically so the final day can't be predicted or talked about by anyone (closes the elimination gap entirely for that slot, since it was never part of the visible deck to begin with).

## Bonus room

Reworked from earlier ideas (season-level, then week-level) to: **rolled privately, per player, per day.**

- Each day, before that day's normal (shared) deal happens, privately roll whether a bonus room triggers for this player, this day. Tuned to land around twice a month on average (flat or smoothed daily probability, TBD).
- If it triggers: one of that day's two offered slots becomes the bonus room instead of its normal kind. The bumped kind is simply not offered this floor for that player (not deferred elsewhere).
- If it doesn't trigger: the day plays out exactly per the shared deck.
- Day 7 (the private wildcard) is unaffected by bonus-room logic either way.
- Bonus room should be strictly better than a normal room (reward-wise) — fine to do, since nothing about it is comparable or coordinated between players.

**Why per-day beats per-week for privacy:** per-week still left something nominally shareable ("there's a bonus room this week"). Per-day removes even that — there's no stable "this week" concept to compare, and a player can't predict tomorrow's roll today, so nothing meaningfully transfers even as casual chat.

**Why "there's a bonus room" is safe to say even though it's private, for a different reason than the shared stuff is safe:** shared content (demon roster, loot pool) is safe because it's globally true — sharing it hands someone accurate prep info. A private roll is safe because it's *not* globally true of anything — one player's "I got one today" says nothing determinate about anyone else's board. Both are safe to talk about, via opposite mechanisms.

**Accepted tradeoff:** this makes the room-kind roster no longer strictly identical for every player every floor (a bonus-room day privately swaps one kind out for that player only). Fine — it's rare per-player, and reads as a nice personal variation rather than a broken shared-experience guarantee.

## Minimap handling — decided, not yet implemented

(See the status note near the top of Part 1 — this section describes the intended design; the game doesn't do this yet. Doors' compass directions and grid layout still come from the shared seed.)

The minimap renders the shared shape graph, but direction is still privately scrambled — so a literal grid-based minimap (as currently built, with wall glyphs, door states, facing arrow) won't be pixel-identical between players even though the underlying wing count/shapes/content are.

**Decided: keep the existing grid-based minimap exactly as it looks today, with a per-account persistent rotate/mirror transform.** Each account+floor gets one of the 8 rigid transforms of a rectangle (4 rotations × optional mirror — the dihedral group of a rectangle), applied uniformly to the whole floor's grid coordinates, computed once at floor arrival (same "stamp it once, read it thereafter" pattern as the epoch fix above) and referenced by both the minimap draw and the door-to-key input resolution from one shared source. Keeps the map internally coherent (adjacent doors stay adjacent, corners still make sense) and keeps the minimap visually *stable* while the player is on a floor, at the cost of two players' minimaps never being literally comparable — accepted, since the game's "same dungeon" guarantee was always about shared *content* (demons, loot, kind pairings), not a literal pixel match.

Two alternatives were considered and set aside:
- **Topology-only/abstract minimap** (a node-graph layout instead of the grid, no compass meaning at all) — the only option that could be pixel-identical between players, but it's a real rendering rebuild (new layout algorithm, new facing concept), not a reskin, for a benefit judged mostly cosmetic.
- **Heading-up / "N = current facing," live-rotating minimap** — technically the cheapest backend option (no persisted state at all, derived live from the facing variable the 3D view already tracks), and would make the compass-scrambling problem disappear by construction rather than being hidden. Set aside specifically for feel — preferred a minimap that stays visually stable while exploring a floor, over one that spins with every turn (even though only the minimap would be new there — the 3D view already behaves like this today).

One clarifying note worth keeping: **switching between these three options is purely a rendering decision, not a map-generation one.** The underlying shared-shape generation (wings, topology, pairing) is identical regardless of which of the three draws it — only the projection step changes.

## Lighter-lift shared-experience ideas (not yet scheduled)

- **World bosses** — one demon identity (name, stats, dialogue) fixed for the whole epoch, same for every player, elevating the existing named-demon pattern (ATOM SLASHER) into something with a season-long reputation.
- **Season title/flavor** — a generated name + theme line per lunar epoch ("The Hollow Moon"), shown on a title/log screen. Cheap (just a seeded phrase generator), gives the community a shared handle for "this month."
- **Epoch-scoped leaderboard** — a board that resets each lunar month alongside the all-time one, reusing the existing scoring/posting pipeline. Pairs well with the shared-shape system since "furthest into this month's dungeon" is a meaningful, non-spoiler stat.
- **Aggregate community stats / weekly counts** — a running tally across all players this epoch (total demons beaten, silver found, "412 runs ended on B2F this week," etc.), shown as flavor (e.g. on log line 1) or tied to a threshold that nudges next epoch's generation slightly. No location info, no individual callouts possible. Cheap to build: one counter table (period, key, count), incremented alongside existing run-end/find-event submissions, read through a cached endpoint — same pattern as the leaderboard.
- **Faction seasons** — each run's final alignment tag (LAW/NEU/CHA) contributes a point to its faction, weighted by floor reached, tallied over a lunar epoch (ties neatly into the epoch already being lunar). A neutral run's point could go to whichever faction is currently behind, giving Neutral a purpose in the season metagame. Reward is cosmetic — a title, an omen-voice shift for the leading faction. Same cheap counter-table implementation as the stat above.
- **Sighting log for named/rare demons** — anonymized "spotted on B5F" posts (floor depth only, which the leaderboard already exposes) when a player meets the epoch's world boss or a MYTHIC find.
- **One-time shared loot** — a rare locker that exists once per floor-epoch; first player to open it gets it, later players see "emptied by [name]." Needs an atomic "first wins" write — a D1 conditional update, or (nicely) the same Durable Object already planned for live presence.
- **Considered and not pursued: shared room heat.** Letting a room's heat persist across all players in a floor-epoch (a "tragedy of the commons" effect) was judged the most expensive of these ideas — needs real per-room state shared across every player, not just an append-only log or counter — and was dropped rather than designed further.

## Harder ideas considered, and the calls made

- **Ghost replays** — rejected. Recording a full run as a canonical-shape action sequence and replaying it as an AI party member/rival in someone else's run, translated through their private transform. Interesting but heavy (needs a shape-space action encoder/translator) and redundant with the notes/demon-echo ideas already in scope. (A lighter cousin — passive route *traces*, not full replays — is noted under Notes/leavings below, with the same translation caveat in smaller form.)
- **Live presence** — accepted. A signal that another player is active on the same floor depth right now (not location). Needs something beyond simple request/response Workers; landed on **Cloudflare Durable Objects**, which has a genuine free tier (100,000 requests/day, 5GB SQLite storage) — fits the existing Cloudflare-only stack with no separate server needed.
- **Player-to-player economy (items/silver)** — accepted, favorite piece of the whole design. See below.
- **Full server-authoritative gameplay / real accounts** — rejected for now. Would solve cheating cleanly but means every action (search, move, fight) round-trips to a server and the game stops being a static client — too big a shift from the low-friction, mostly-client-side feel wanted. (There's also a hard technical reason full server-side *replay verification* specifically isn't viable cheaply: Cloudflare Workers' free tier caps CPU time at 10ms per request, nowhere near enough to replay a whole run server-side to check a submission. That's part of why the hybrid/event-sourced trust model below — verify small real-time events, not whole-save replays — is the right fit, not just a scope preference.)

## Player identity & economy

**Identity: a self-custodied secret key, not an account.** A long random key generated client-side the first time a player touches the economy — conceptually the same pattern as the existing `[P]ASS` run-password system, just longer-lived and higher-entropy. No email, no login screen, no password reset flow. Losing the key loses the economy identity, same tradeoff as losing a run password today; acceptable for a low-friction solo project. (Considered and set aside: social login — still "an account," just outsourced. Device-bound-only identity — breaks cross-device trading. Blockchain — the only useful piece it offers is a public/private keypair for self-custodied identity, which can be had directly via ordinary browser crypto with none of the fees, wallet-UX friction, or NFT/crypto-asset regulatory baggage a real chain would drag in.)

**Trust model: hybrid.** Local saves stay fully client-editable — a player can hack their own save all they want, and it's harmless, same as any single-player save-edit, because it never touches the economy. Economy-eligible items only enter the system via real-time find-events posted to the Worker as they happen (same shape as the existing score-posting flow, with similar plausibility/rate-limit checks) — the Worker's D1 ledger, never the local save, is authoritative for anything tradeable. Trading moves entries within that server-held ledger only. (This event-sourced approach is also the practical workaround for the 10ms CPU cap noted above — verifying a small, contemporaneous event is cheap; replaying a whole run to verify a save is not.)

**Worker scope estimate:** roughly 1.5–2x the size of the existing leaderboard Worker — a couple new D1 tables (item ledger, trades), 3–4 new endpoints (post a find-event, create/accept a trade offer, fetch a ledger), and bearer-style auth (compare the request's secret key against the D1 record, same pattern as the existing `x-admin-key` check). Not a different hosting model, just more of the same kind of work already done.

**Hosting:** the whole stack — leaderboard, economy ledger, trades, and live presence — can plausibly stay on Cloudflare Workers + D1 + Durable Objects, all with usable free tiers, no separate rented server needed even at the "real server-authoritative" end of the spectrum, since Durable Objects are built for exactly that kind of per-session stateful coordination. ([Cloudflare Durable Objects pricing](https://developers.cloudflare.com/durable-objects/platform/pricing))

**Free-tier numbers worth keeping on hand** (Workers/D1 figures from a separate session, not independently re-verified this session, so worth a quick doc-check before relying on them at implementation time):
- Workers: 100,000 requests/day, ~1,000 requests/minute burst cap, 10ms CPU time per request, limits reset daily at 00:00 UTC.
- D1: 100,000 rows written/day, 5,000,000 rows read/day, 5GB storage.
- Durable Objects (re-verified this session): 100,000 requests/day, 13,000 GB-s compute/day, 5M SQLite rows read/day, 100,000 rows written/day, 5GB storage — all free.
- When a VPS would actually be warranted: full server-authoritative simulation (though Durable Objects could plausibly cover this too), true long-lived/real-time connections (also a Durable Objects fit), wanting a conventional relational DB for heavy queries beyond D1's comfort zone, or a usage scale where Cloudflare's metered pricing would exceed a flat VPS cost — judged to be far beyond where this game would start. No VPS need identified for anything in this doc.

## Read-budget / scaling strategy (for when the game has real traffic)

Not urgent at current scale, but cheap to build in from the start:

- **One data packet per player per day.** Fetched once when a player first acts on a new day or descends to a new floor (descending is free and can happen mid-day), cached client-side keyed by (day, floor), only re-fetched when either changes. On fetch failure, proceed with an empty/stale packet — never block play. Packet contents: this epoch's counts/faction standing, a handful of notes/bones for the current floor depth, a few demon echoes for that depth, any log-worthy news lines. The leaderboard screen stays a separate, on-demand request.
- **Every query indexed and limited.** Matching D1 index for every `WHERE`/`ORDER BY` column set; every query carries a `LIMIT`. No `COUNT(*)` over a full table — track totals as incrementally-updated counter rows instead. No `ORDER BY RANDOM()` (scans the whole table) — instead assign each note/bones/echo record a random "bucket" number (e.g. 0–49) at write time, query `WHERE floor = ? AND bucket = ? LIMIT n`, and rotate which bucket the daily packet pulls from for variety.
- **Batch writes at run-end / event-post time** rather than many small writes, as a separate fix for the write-side limit (distinct from the read-budget rules above).
- **Rough budget estimate** (not Cloudflare-verified, just a sanity-check math exercise): a packet of ~10 counters + 3 faction rows + 10 notes/bones + 5 echoes ≈ 30 rows read; at 1,000 daily players that's ~30,000 rows/day against a 5,000,000 cap, and ~1–2 requests/player/day against a 100,000 request cap — not a concern until well into tens-of-thousands-of-daily-players territory, at which point precomputed/shared snapshot caching would be the next step.
- Explicitly **not** a fix for anti-cheat — forged local saves could still inflate what gets posted into notes/bones/counters; that's mitigated only by keeping all of this cosmetic/low-power and by the event-sourced economy ledger (see Trust model above), not by the read-budget rules.

## Notes, bones, and other things players leave behind

- **Left messages / Souls-style notes** — attached to a room *kind*, not a room *location*, so they add flavor without leaking position. Should use **fixed phrase lists, not free text** — prevents both abuse (harassment, spam) and accidental spoilers (a free-text note could describe a location even if the system doesn't track one).
- **Bones (NetHack-style)** — a concrete version of the above: on run end, keep a snapshot (name, floor, cause of death, party, last words); later players who reach that floor depth find the remains, with fixed loot and flavor text. Attaches to floor depth only, compatible with the private-geometry system since depth is shared but slot/compass aren't.
- **Demon echoes** — a demon that corrupted/killed someone in one run can re-spawn (reskinned, maybe carrying a trace of the original player's name, e.g. a `[name]'s PIXIE` naming convention) as a wandering demon in someone else's run. No coordinates involved, no spoiler risk.
- **Route traces (lighter cousin of the rejected ghost-replay idea)** — instead of a full replayable action sequence, store just a compact breadcrumb (room, day, search count) and surface it as a faint minimap trace or a line like "[name] was here, day 3." Purely informational, can't affect the viewer's own run. Note: since "room" here means a canonical shape-layer slot, showing a trace meaningfully still requires translating it through the viewer's own private kind/compass assignment — smaller-scale version of the same translation problem that got ghost replays rejected, so treat as a "maybe, at small scope" rather than a settled yes.
- **Altar gifts** — a player can leave a COMMON/UNCOMMON item at an altar for a stranger to find later; kept low-rarity deliberately, to limit how much a forged save could abuse it.
- **More frequent leaderboard posts** — post progress on each floor descent, not just run-end, so the board becomes a live "who's where" feed.

## Open questions / not yet decided

- Exact menu of wing-internal topology shapes (chain, branch, loop, + maybe one more) and whether topology variety implies variable wing size (currently fixed at 3 spaces per wing)
- Exact daily probability curve for bonus room (flat vs. smoothed to land closer to exactly-twice-a-month)
- Whether/how to layer demon echoes, notes/bones, route traces, or the lighter-lift ideas (world boss, season title, epoch leaderboard, faction seasons, sighting log, one-time loot) on top of the core system, and in what build order
- Trade-offer UX (how two players actually connect to trade — a code to exchange, an open marketplace, etc.) and secret-key export/backup UX (copy/paste vs. QR code)
- Live-presence granularity (just "someone's on this floor depth" vs. something richer) and exact Durable Object design for it
- Exact schema for bones/echo/trace/counter rows (sketched conceptually, not laid out field-by-field)
- Whether/when server-side replay verification is ever worth the Workers Paid tier (~$5/mo minimum for extended CPU time), vs. accepting event-sourced "believability checks" indefinitely

---

# Part 2: Alignment tag naming (separate session, not yet decided)

Exploring alternatives to the current Law/Neutral/Chaos `[NEU]`-style bracket tag.

**Renames (same mechanic, new labels):**
- `[SYS]` / `[NEU]` / `[OLD]` — system vs. the old layer ("magic was here first")
- `[COR]` / `[NEU]` / `[STR]` — corp vs. street
- `[COD]` / `[NEU]` / `[RUN]` — code vs. rune
- `[ORD]` / `[NEU]` / `[WLD]` — order vs. wild

**Different axes (would change what actually drives the score):**
- Data vs. flesh `[DAT]`/`[MIX]`/`[FLS]` — tied to augmentation/chrome
- Talk vs. fight `[PAX]`/`[NEU]`/`[WAR]` — driven by how encounters are resolved
- Careful vs. reckless `[CAU]`/`[MID]`/`[RSH]` — driven by heat behavior
- Sun vs. moon `[SUN]`/`[DSK]`/`[MON]` — driven by day/night timing
- Debt `[OWE]`/`[EVN]`/`[OWN]` — driven by offerings/deals/bribes

**Finer-grained options considered:** a 5-step tag, or two side-by-side axes (Law/Chaos + Light/Dark). Both cost more UI space and complexity than the current single bracket.

**Recommendation given, no final decision made:** `[SYS]`/`[NEU]`/`[OLD]` if just renaming (keeps all existing mechanics), or talk-vs-fight if a genuinely different driving axis is wanted (fits the recruiting-focused core loop particularly well).

---

# Part 3: Dissonance mechanic (design only, not yet built)

The risk side of cross-alignment parties — mixed-alignment parties are the most powerful but should also be the riskiest to run.

- **Builds from:** fights, skipped days, and lingering in hot rooms, while the party contains opposing alignments. Rises faster the bigger the alignment gap (Law+Chaos worse than Law+Neutral).
- **Effects at rising levels:** a member acts out of turn → refuses a command → sits out a fight → (at the top) leaves or turns on the party. Always preceded by a warning line, in the game's existing voice-line style.
- **Read by the player as:** a simple state (`CALM` / `STRAINED` / `FRACTURING`) plus flavor lines, not a visible number.
- **Comes down via:** resting, calming items, certain recruits, fitting omens.
- **Tuning goals:** mixed parties shouldn't strictly dominate pure ones; a careless mixed party should collapse by around floor 3; an opposite-alignment recruit should nudge the player's own alignment toward it, acting as a natural brake against snowballing into one extreme.
- **Overlap flagged with the existing Patience system:** Patience already tracks per-member wear, warnings, snapping, and leaving — Dissonance covers very similar ground. Leaning toward **merging Dissonance into Patience** (an alignment-gap adds extra wear specifically between opposed members) rather than building and maintaining a second, fully separate hidden value. Not yet decided.

---

# Part 4: Omen system (mechanical integration, this session)

Starting point: the daily omen already exists and quietly nudges invisible math (heat rise, find rates, demon commonality, talk-down odds). This session's goal was to give it some actual gameplay weight beyond that passive layer, without making it skill-based (read-the-signs) or just more flavor text.

**Omen stays calendar-seeded, not per-player RNG.** Confirmed/kept as-is: the daily omen is a deterministic function of the real calendar date, same as the floor-shape layer in Part 1. Every player sees the same omen on the same real day. This is what makes the streak mechanic below meaningful as a *shared* event rather than a personal stat.

**Shipped in v0.56.** The omen now keys off a pure UTC calendar day (`floor(now / 86400000)`) — identical for every player at every instant — replacing the old per-run random salt. Each client "stamps" (caches) the currently-true value once, at the exact moment of its own local midnight, and holds it until the next one, so it still reads as "resets at midnight, your time" even though it's one shared sequence underneath. Net effect: a bounded, predictable, recurring lag of at most one day near each player's own midnight (verified by simulation) — never more than that, and it never affects the streak or any other shared/authoritative logic, only what a given player happens to be looking at in that window.

## STANDBY banking (Variant B — delayed use)

Gives the STANDBY (rest/skip-the-day) action a real strategic payoff instead of just forfeiting a day.

- Choosing STANDBY on any day banks that day's omen (good or bad) into a holding slot, capped at 1–2 banked omens (TBD).
- A banked omen can be spent on a later day **instead of** that day's natural omen, at the player's choice.
- Lets a player who knows a tough floor/demon is coming deliberately take an off day specifically because it rolled a great omen, bank it, and cash it in right before the encounter that matters — a scheduling decision, not a reroll.
- **Needs balance work later:** cap size, whether banked omens decay/expire, whether banking a bad omen is ever worth doing (insurance vs. hoarding), and whether STANDBY should have any other cost to offset how strong banking-a-great-omen could become.
- **Shipped in v0.56:** cap of exactly 1 (a new held day simply overwrites whatever was already banked — no stacking). Spent via a new `[U]SE DAY` button/key, which only appears when there's something banked to spend. The bank is consumed only if actually used; otherwise it just sits there indefinitely. The "TBD" balance questions above are still open — this is a first-cut implementation, not a tuned one.

## Omen streaks → shared room unlocks

- Three consecutive LAW-leaning omen days (shared, global) unlocks a **bonus room** opportunity.
- Three consecutive CHAOS-leaning omen days unlocks an **anti-bonus room** (a bad/risky room) opportunity.
- **Stacks alongside the existing private per-day bonus-room roll (Part 1) rather than replacing it** — the private roll stays untouched so players keep their personal "I got a bonus room today" moments; the streak-unlocked room is a separate, rarer, shared event layered on top. Rationale: replacing the private roll would read as a loss ("well, there goes our bonus room") rather than a new layer of content.
- Should be **rare and telegraphed** — since the streak is shared, there's room to foreshadow it building (the streak is the same for everyone, so a buildup cue isn't a spoiler) before it actually unlocks.
- Ties into the existing faction-season idea (Part 1's Lighter-lift list) — a LAW-trending stretch of the real calendar is now visibly "why" the bonus room opened that week, same underlying signal driving two systems.

**Shipped in v0.56.** Each omen key got a LAW/CHAOS/neutral lean tag (an original call made during implementation, not pre-specified): `data`/`hard` lean LAW, `folk`/`easy`/`loot` lean CHAOS, everything else is neutral and breaks a streak. `omenStreak(day)` checks whether `day`, `day-1`, `day-2` all share a lean — pure function of the date, no stored state needed. On a LAW streak, the existing private bonus-room roll (still per-wing-door-unlock, see the status note above — not per-day) gets a flat +15% boost on top of its normal ~10%. On a CHAOS streak, a new room kind — **THE HUSK**, the anti-bonus mirror of the bonus room ("the archive") — becomes eligible at 15%, exclusively during the streak; its hidden-item pile is skewed toward extra demon encounters and away from loot, and the first visit guarantees a dangerous (possibly corrupted) demon encounter, mirroring how the archive guarantees a friendly recruitable PROGRAM.

Because LAW only has 2 qualifying keys against CHAOS's 3, the two streaks are not equally rare: simulated over 20,000 days, LAW streaks land around 1-in-513 days and CHAOS streaks around 1-in-160 — noticeably more CHAOS than LAW. Flagged as a tuning knob, not yet addressed; the "rare and telegraphed" goal above is only half-met as shipped (rare, yes; no telegraphing/buildup cue was built this session — a player currently has no in-game signal that a streak is building toward 3).

## Flavor additions (small, queued for later alongside other text work)

- **Fixture-wall tell:** a near-miss-style flavor line on whichever wall actually holds a hidden fixture, matching the existing "warmer than the others" tell pattern. **Shipped in v0.56.**
- **Floor-entry flavor lines:** an arrival line hinting at which demon family dominates the floor's roster (e.g. "the halls feel old here" for folklore-heavy, "wires hum beneath the floor" for data-heavy) without naming anything specific — same "hint, don't tell" vocabulary the game already uses for room-kind senses. **Shipped in v0.56**, and also carries the streak state when one is active ("the pattern holds"/"the pattern breaks").

---

# Open items carried over, not yet resolved anywhere in this doc

- Final alignment tag naming (Part 2) — no decision made.
- Whether Dissonance should merge into Patience or stay a separate system (Part 3).
- **The per-account door-to-compass/minimap transform (Part 1, "Minimap handling") is still unbuilt.** This is the main unresolved piece of Part 1 now that shape/contents are shipped — without it, comparing compass-based room callouts between players is still a real spoiler, which was the thing Part 1 set out to prevent in the first place.
- The pre-existing Bonus-room cadence mismatch (doc says per-day, code does per-wing-door-unlock) — not caused by this session, not yet reconciled either way.
- STANDBY-banked-omen balance (Part 4) — cap is now 1 (shipped), but decay/expiry, whether banking bad omens is worth it, and whether STANDBY needs an offsetting cost are all still open.
- Telegraphing for the omen-streak room unlock (Part 4) — the streak itself shipped, but no in-game buildup cue exists yet, so "rare and telegraphed" is only half-true as shipped. Also worth revisiting the LAW/CHAOS lean mapping, since it currently makes CHAOS streaks ~3x more common than LAW streaks.
- Everything listed under Part 1's own open-questions section above.
