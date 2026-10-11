# Daily Dungeon: detailed changelog (internal)

The full version, with every number, odd and hidden rule. NOT for the public repo: this file is in `.gitignore`.
The public one is `CHANGELOG.md` (vague on purpose: no odds, no hidden mechanics, no room names).

## v0.61.1 - Oct 10 2026, 21:15 HST

![v0.61.1](screenshots/v0.61.1.png)

- **Follow-up patch to v0.61's Hold Omen button, both dev-requested fixes made in the same pass.**
  - **Moved from the `INVOKE` header down to the bottom action bar**, as its own line directly above `[1-9] choose  [ENTER] use  [C]LOSE`, instead of sharing a line with them. Reason: the `#inv` popup is hard-sized to exactly 47 columns via `placeInView()` (it overlays the 3D view area), and `"[1-9] choose  [ENTER] use  [H] Release Omen  [C]LOSE"` alone runs 49 characters, 54 for the cooldown case with its day count (`"[H] Hold Omen (7d)"`) -- both well past the ~45-character usable width after padding. This was a real overflow bug caught only by taking an actual screenshot of the popup, not just syntax-checking or headlessly reading `textContent` (which doesn't show layout clipping). Fixed by giving the hold/release line its own `div` ahead of the existing `help` line, rather than trying to abbreviate the labels to fit -- `help` stays the flex container's last child so the CSS that pins it to the box's foot (`.viewpop pre > div:last-child { margin-top: auto }`) still works unchanged.
  - **Removed the explanatory caption entirely** (`"[H] stays put today and banks tonight's omen..."` etc. from the previous pass) -- per the dev's follow-up ask to drop the mechanic description from the Invoke screen, leaving just the button. The cooldown's day-count, previously only in that now-removed caption, is folded into the button's own label instead (`"Hold Omen (4d)"`) so that information isn't lost, just relocated onto the label.
  - **`?` menu's `[H]` line simplified twice in direct response to dev feedback**: first trimmed from a 4-line mechanic explanation down to one line with dot-padding matching the other entries' style, then -- after the dev pointed out they'd given the exact text to use in quotes -- stripped the dot-padding entirely to match verbatim: `"  [H] Hold Omen, or Release Omen once one's banked"`.
  - **Tested:** full Playwright re-run against the actual page after the layout change (not assumed-safe from the earlier pass) -- all three button states (available/release/cooling) confirmed on their own line with correct text, click and `H` both still trigger correctly from the new position, a blank click still closes the bag without false-triggering `holdAction()`, and a save state engineered so `RULES.available(save).hold` is genuinely `false` (today already spent) confirmed the `holdBtn`-null fallback renders the single plain bottom line with no leftover empty row. Zero console/page errors. Screenshot retaken post-fix and visually confirmed nothing clips at the real 47-column width (the first screenshot attempt, pre-fix, is what caught the bug in the first place).

## v0.61 - Oct 10 2026, 20:30 HST

- **Hold Omen / Release Omen pulled out of the numbered inventory list entirely, into its own header button + `H` key, per the dev's explicit call ("should be an actual button, not take up an inventory slot!").**
  - **`index.html`:** `showInv()` no longer `unshift()`s a pseudo-item for Hold Omen/Release Omen/cooldown into `invList` -- that block is replaced with a plain `holdBtn` object (`{ label, action: "hold"|"release", cooling? }`) computed from the same `RULES.available(save)`/`save.bankedOmen`/`save.useBanked` checks as before, just not fed into the list. Rendered as a `<span class="btn" data-hold>` appended to the `INVOKE` header row (`[H] Hold Omen` / `[H] Release Omen`, `btn off` class while cooling), plus a one-line caption underneath carrying the same explanatory text the old item description used to show. New `holdAction()` function holds the actual behavior (open `holdBox()` to confirm Hold, or run `RULES.useBankedOmen()` directly for Release), called from a new `data-hold` branch in the `#inv` click handler and a new `key === "h"` branch in its keydown handler -- both checked before the generic line-select logic. `useInv()` and the per-item description ternary had their now-dead `it.holdOmen`/`it.omen`/`it.cooling` branches removed (nothing in `RULES.inventory()`'s real items ever set those fields; they only ever came from the pseudo-item this change removes).
  - **Net effect:** the numbered list (1-9) now only ever contains real found items (plus ICHOR at the top, unchanged) -- Hold/Release Omen can never again bump a found item out of a slot or off the visible 1-9 range.
  - **`?` help menu:** the `[I]NVOKE` sub-lines rewritten to describe `[H]` as "its own button, not a numbered slot" rather than a selectable bag entry.
  - **Tested:** a Playwright session driving the real page (served over a local static HTTP server, not a mock) through a genuine new-run flow: (1) fresh run -- `[H] Hold Omen` button present, clicking it and pressing `H` both correctly open the `GO ON STANDBY?` confirm box, confirming it sets `today.held = true` same as before; (2) numbered rows start cleanly at 1 with no Hold/Release text ever appearing in a `[data-i]` row; (3) a hand-crafted `bankedOmen`/`useBanked` localStorage state renders `[H] Release Omen`, and clicking it actually calls through to `RULES.useBankedOmen()` (`useBanked` flips to `true`); (4) a hand-crafted `omenCooldownDay` state renders greyed (`btn off`) with the correct days-left caption, and clicking it while cooling is a confirmed no-op (bag stays open, no confirm box, state untouched); (5) clicking blank space elsewhere in the header (not the button itself) still closes the bag via the click-anywhere-closes behavior below, without false-triggering `holdAction()`. Zero console/page errors across all runs. Inline-script syntax checked via `new Function()` on the extracted script, same pattern as prior passes.

- **`?` help menu's KEYS list reordered into straight alphabetical order by key letter**, per the dev's request. Movement arrows (`^`, `< >`), the door-state symbols (`+`, `x`), and the `1-8` gift-pick entry stay grouped at the top as before -- they aren't lettered keybinds, so there's no sensible place to slot them into A-Z order. The lettered entries now read B, C, F/T, G, G, I, L, P, R(eset), R(un), S(earch), S(ilent), Y/N -- note this does split the old YES/NO + SILENT grouping (they used to sit together as the two ways to answer a question) since SILENT's `S` now sorts ahead of `Y`; a deliberate tradeoff for the alphabetical order asked for.

- **All five full-screen popups (About, Log, Invoke, Codex, Leaderboard) now close on a click anywhere on them**, not just their `[C]LOSE` button -- previously About/Log/Invoke/Codex had an explicit comment stating a blank click does nothing ("never a click anywhere" / "no click-to-close here"), which is the behavior being reversed here per the dev's request ("all of the full-screen popups can be clickable to close"). Each handler's existing interactive targets (buttons, item/tab rows, the log's name-submit text field) are checked first and keep their own behavior unchanged; only the final "nothing matched" fallthrough now closes instead of no-op'ing. The `#found` dialog (name entry, party questions, replay) was deliberately left alone -- it's a required-decision box with no close concept, not a dismissible view.
  - **`leaderboard`'s `#board` popup** had no other interactive elements at all (admin row-select/delete there is keyboard-only), so its handler simplified to an unconditional `() => toggleBoard(false)` on any click.

## v0.60 - Oct 10 2026, 20:30 HST

- **Faction seasons added, per the kingmaker design settled in `daily-dungeon-design.md` Part 10 -- picked to build first ahead of bones/ghost demons/weekly counts.** Season = one lunar epoch, reusing `epochIndex()` (re-derived independently in the Worker rather than importing game code: same `Date.UTC(2000,0,6,18,14)` ref and `29.530588853` synodic-month constant as `screen.js`, since the Worker and the client must agree on epoch boundaries without sharing a module).
  - **`rules.js`:** `score(st)` now reports `align: String(st.align || "NEUTRAL").toUpperCase()` alongside the existing `run/floor/days/demons/turns` fields. The game itself has zero knowledge of the season counters -- it just reports the one fact (final lean) the Worker needs, same separation as everything else the leaderboard already scrapes off a finished run.
  - **`leaderboard/schema.sql`:** new `faction_season (epoch INTEGER, side TEXT, count INTEGER, PRIMARY KEY(epoch, side))` -- two rows per epoch (`LAW`/`CHAOS`), additive via `CREATE TABLE IF NOT EXISTS` so an existing deployment just needs the schema file re-run once.
  - **`leaderboard/worker.js`:** `tallyFaction(db, align, floorPts)`, called from the existing `POST /score` handler (no new write endpoint, per the design doc's "piggyback" call) -- and only on a genuinely new row (`ins.meta.changes` truthy), so a client retrying the same run after a flaky response can't double-tally a season point on top of the existing `INSERT OR IGNORE` dedup.
    - **LAW/CHAOS:** a single upsert, `INSERT ... ON CONFLICT (epoch, side) DO UPDATE SET count = count + ?`. Pure blind increment, no read.
    - **NEUTRAL (the kingmaker):** first, two `INSERT ... ON CONFLICT DO NOTHING` upserts guarantee both rows exist for the epoch at 0 if this is its first-ever faction-relevant run. Then one conditional `UPDATE ... WHERE count = (SELECT MIN(count) ...) AND (SELECT COUNT(DISTINCT count) ...) = 2` -- with exactly two rows per epoch, this touches the single row sitting at the epoch's minimum when they're not tied, and writes nothing when `COUNT(DISTINCT count) = 1` (tied). Single atomic statement, avoiding the SELECT-then-UPDATE race the design doc flagged between two NEUTRAL runs landing close together.
    - Unknown/missing `align` (e.g. an old cached client without the field) just skips the tally silently -- never rejects the score post itself, since the leaderboard's real job (ranking the run) is unrelated to this cosmetic layer.
  - **New `GET /season` endpoint** (not in the original "no new endpoint" scope, which only covered the *write* path) -- returns `{epoch, law, chaos}` for the current epoch, defaulting absent rows to 0/0 (a legitimate tied state, not an error). This is what the title screen's `LEAN` bar will read from when that's built.
  - **`leaderboard/README.md`:** one-line note that an existing deployment needs `npx wrangler d1 execute daily-dungeon-board --remote --file=schema.sql` re-run to pick up the new table.
  - **Tested:** a standalone `node:sqlite` harness running the exact SQL strings used by `tallyFaction` (not a mock -- the literal query text) through 9 scenarios: blind LAW/CHAOS increments, NEUTRAL correctly favoring whichever side is behind, exact-tie no-op, the specific edge case of a NEUTRAL run being the *very first* faction-relevant post of a fresh epoch (both rows don't exist yet -- confirmed this still resolves to a tie/no-op, not a crash or a wrong default), and an unrecognized align tag touching nothing. All 9 passed. Separately, confirmed `RULES.score()` includes the new `align` field via a bootstrapped-dungeon smoke test (`RULES.talk()` → real `st.dungeon`, same pattern as the Dissonance tests below). `node -c` on both changed files.
  - **Not yet done:** anything player-visible. This is pure plumbing -- no title-screen display, no season reset/rollover notice, no reward. Those are Part 11's job (title screen, queued next) and the "cosmetic reward" line in the design doc (board title / omen-voice shift), both still open.

## v0.59 - Oct 10 2026, 20:05 HST

- **Dissonance added to `rules.js`, folded straight into the existing `patience` number rather than a second hidden value — the fold-in call made earlier this session in the design doc (Part 5).** Every standing member (KURA included, via `st.align`) has a gap against every other: same alignment 0, one side NEUTRAL 1, opposite LAW/CHAOS 2. A member's tension is the worst gap against anyone else currently standing (`hp > 0`), computed live rather than cached (`memberAlign`, `alignGap`, `tensionOf` — all private, module-scope, inserted right after the existing `STANCE_TALK` const).
  - Three wear sources, each table keyed by gap size (1 or 2; gap 0 is always 0 and absent from the tables):
    - **Fighting** (`fight()`): `DISSONANCE_FIGHT = { 1: 1, 2: 2 }`, applied once per fight resolution via `wearTension(st, DISSONANCE_FIGHT)` right after the existing `lean()`/`win()` calls.
    - **Lingering in a hot room** (`act()`): `DISSONANCE_LINGER = { 1: 0, 2: 1 }`, fires once per `LINGER_AT` (30) crossed, gated on `heatTier(rs.heat) >= 2` — mirrors the existing linger-tracking shape (`rs.linger++`) rather than adding a parallel counter.
    - **Skipping a real day** (`sync()`): `DISSONANCE_SKIP = { 1: 0, 2: 1 }`, fires once per `sync()` call where `!st.today.stepped && !held` — i.e. not even a STANDBY hold covered the day.
  - `wearTension(st, table)` iterates `st.party`, skips dead/missing members, floors at 0 same as every other patience decrement in the file (`Math.max(0, (p.patience ?? PATIENCE) - w)`).
  - **New tell, not a new flag:** `chat()`'s line-selection ternary gained `p.patience === 0 && tensionOf(st, p) > 0` ahead of the existing `p.patience <= 2` branch, pulling from two new tables (`PARTY_TENSE` / `FAMILY_TENSE`, same per-member/per-family shape as `PARTY_TIRED`/`FAMILY_TIRED`) instead of the ordinary zero-patience tired line. Computed live at display time — no `p.tense` flag (one was tried, then removed as redundant: nothing needs to *clear* it, since `tensionOf()` is just as cheap to call again).
  - **Known, intentional imbalance** (flagged in the design doc as TBD, not a bug): `DISSONANCE_SKIP`'s max value (1) loses outright to the nightly +3 patience regen, even at the worst possible alignment gap — a skipped day with max tension still nets +2 patience. Mechanism is wired correctly (verified it does fire); it just doesn't yet erode an unmanaged party on its own. Fight and linger wear are large enough to matter in-session; skip wear is a placeholder pending balance.
  - **Not implemented** (per the design doc's own "still open" framing): give-to-party-member easing tension, any omen tie-in, cross-alignment combo-skill payoffs, an explicit NEUTRAL bridge discount beyond its naturally smaller gap.
  - **Tested:** `node -c rules.js` syntax check. Direct `RULES` module simulation (bootstrapping a real `st.dungeon` via `RULES.talk(st)` → `ensureFloor()`, since a hand-built fake dungeon object crashes `RS()`): confirmed fight-wear scales by gap (opposite pair -2/round, neutral-adjacent -1/round, same-alignment -0/round), the `PARTY_TENSE`/`FAMILY_TENSE` line correctly replaces the ordinary tired line when tension (not talk fatigue) is the reason for zero patience, the control case (no tension → ordinary tired line unchanged) still holds, and linger-wear fires exactly once per `LINGER_AT` crossed. 200-trial × 40-action fuzz (randomized alignments, random fight/talk/go/search/turn/tick) = 8000 actions, 0 crashes — confirms the new `act()` hook, which now runs on every single action in the game, introduced no regressions elsewhere.

## v0.58 - Oct 10 2026, 18:55 HST

![v0.58](screenshots/v0.58.png)

- **Hold Omen / Release Omen consolidated into one morphing bag slot, with a new flat-7-real-day cooldown on holding again.** Design call made this pass: calendar-week cooldown was considered and rejected — it would let a player wait until near the week's reset to release at effectively no cost (release Saturday, back to full strength Sunday), which isn't a real cost at all. Flat 7 real days from the moment of release was chosen instead, matching the shape every other personal resource in the game already uses (patience, the rested-day search bonus, the locked-door budget) — private, self-timed, never tied to the shared weekly floor cycle.
  - **`rules.js`:** new `onOmenCooldown(st) = st.omenCooldownDay !== undefined && (st.day - st.omenCooldownDay) < 7`. `st.day` is the right clock for this — it's already real days elapsed since the run started (`st.day = t - st.startDay + 1` where `t = utcDay()`), so a skipped day still counts against the cooldown, same as it already does for everything else keyed off `st.day`. `useBankedOmen()` now sets `st.omenCooldownDay = st.day` the moment a banked omen is released (not when it was held). `available(st).hold` now also requires `!onOmenCooldown(st)`. Two new fields on the `available()` result for the UI: `omenCoolingDown` (should the bag show the greyed slot right now) and `omenCooldownDays` (how many real days left). `omenCoolingDown` deliberately excludes the case where Release Omen itself should still be showing (`bankedOmen !== undefined && !st.useBanked`) — without that exclusion, the slot would show nothing at all on the exact day of release, since `bankedOmen` isn't cleared until the next `sync()`. `omenCooldownDay` added to `reset()`'s new-run field-wipe list. `debugInfo()`'s row2 gained an `OMEN COOLDOWN Nd` entry, shown only while active.
  - **`index.html`:** the two separate `showInv()` unshifts (Hold Omen / Release Omen) collapsed into one `if (save) { ... }` block with three mutually exclusive branches in priority order: Release Omen (if one's banked and unspent) → Hold Omen (if `available(save).hold`) → a greyed Hold Omen entry tagged `cooling: true` (if `available(save).omenCoolingDown`), showing `"Spent recently. N real days left before KURA can hold again."` A cooling entry renders with the existing `.btn.off` class (same dim style already used elsewhere, e.g. sealed-door buttons) instead of inventing new CSS. `useInv()` gained an early `if (it.cooling) return;` guard so selecting it does nothing (no popup, no action) — Enter is simply inert, consistent with it being unselectable rather than an error state. Detail-text ternary gained an `it.cooling` branch (`"Not available yet."`) ahead of the `it.holdOmen` branch, since a cooling item also has `holdOmen: true` set and would otherwise fall into the "asks to confirm" text. Help menu gained a one-line note under the existing Hold Omen/Release Omen entries: `"(releasing greys Hold Omen out for 7 real days after)"`.
  - **Not changed:** the known rough edge from v0.57.3 (declining the Hold Omen confirmation drops to the main screen instead of reopening the bag) is still there — untouched by this pass.
  - **Tested:** direct `rules.js` simulation stepping through hold → sync (banks the omen) → release → day-by-day through the full window, confirming `available().hold` goes `true → false → … → true` and `omenCooldownDays` counts down `7 → 1 → 0` across exactly 7 real days (day 2 release, available again on day 9 — verified via `SMT.setSkew`). 300-run fuzz across 5 timezones and random clock-skew, randomly holding/releasing every few days, `available()` and `renderScreen()` called every turn — 0 crashes. `new Function()` syntax-check on the extracted inline script. Playwright screenshot of a mid-cooldown save confirming the greyed "Hold Omen" entry, its detail text with the correct day count, and that it's visually dimmed in the bag list.

## v0.57.3 - Oct 10 2026, 03:25 HST

![v0.57.3](screenshots/v0.57.3.png)

- **HOLD moved into INVOKE as two pseudo-items, same pattern as the existing ICHOR/THE HELD DAY entries (`index.html`).** `showInv()` now unshifts `{ name: "Hold Omen", holdOmen: true, ... }` whenever `RULES.available(save).hold` is true, above `{ name: "Release Omen", omen: true, ... }` (renamed from THE HELD DAY — same `omen:true` mechanism, same `RULES.useBankedOmen` call, unchanged behavior) and above ICHOR. Unshift order: ICHOR first, then Hold Omen, then Release Omen last, so the final list reads Release Omen, Hold Omen, ICHOR, ...items — the two time-sensitive omen actions sit above the currency-like one.
  - **Hold Omen keeps its confirmation popup, by the dev's explicit call** (bag items are normally immediate-on-Enter, this one isn't): `useInv()` special-cases `it.holdOmen` to close the bag and open the existing `holdBox()` ("GO ON STANDBY?") instead of running the action directly. The "yes" path is unchanged plumbing — `answerConfirm()` sets `holdOK = true` and calls `act("hold")`, which still falls through to `RULES.hold(save)` via the generic `: RULES[name](save)` dispatch at the end of the big action ternary, exactly as it did when STA[N]DBY was a border button. Declining returns to the main screen rather than reopening the bag (same as every other confirm box in this codebase — `restoreBoxes()` doesn't know to reopen INVOKE); noted as a minor UX rough edge, not fixed this pass.
  - Border (`screen.js`): `STA[N]DBY` text removed from the bottom-border line entirely (not just un-wired) — the earlier v0.57.2 pass had only removed `index.html`'s click/key wiring for it, which left the bare, now-dead-looking `STA[N]DBY ` label still rendering in the border until this pass caught it in a screenshot check. `const free = ..., daily = cell.padEnd(15) + "STA[N]DBY "` → just `const free = " [F]IGHT [T]ALK [I]NVOKE [S]EARCH"`, right side of that line now blank.
  - `index.html` cleanup alongside the border change: the `.replace("STA[N]DBY", b(...))` border-button wiring, the `n: "hold"` key binding, and the now-unused `.btn[data-act=hold]` CSS nudge rule are all removed. The `[?]` help menu's standalone `STA[N]DBY ....` line moved to sit under `[I]NVOKE`, split into two lines (`Hold Omen` / `Release Omen`) describing what each does.
  - Tested: `new Function()` syntax-check on the extracted inline script (still passes), 300-run fuzz (5 timezones, random skew, `renderScreen()` called every turn) at 0 crashes, and a Playwright screenshot pass confirming: the bag shows both new entries with correct detail text, selecting Hold Omen opens the same "GO ON STANDBY?" box as before, and the border's bottom-right is now blank with no leftover dead text.

## v0.57.2 - Oct 10 2026, 03:20 HST

![v0.57.2](screenshots/v0.57.2.png)

- **Removed the `CELL [#]` indicator from `screen.js`'s bottom border**, per the dev's follow-up call right after v0.57.1: with the charge system itself gone, a visible gauge for it was no longer meaningful. `const free = ..., cell = ..., daily = cell.padEnd(15) + "STA[N]DBY "` simplified to `const free = ..., daily = "STA[N]DBY "` — `STA[N]DBY` now fills the space CELL used to occupy, right-aligned same as before. No `index.html` changes needed: nothing there referenced the `CELL` text (it was pure `screen.js` border rendering, not parsed/replaced elsewhere). The gate itself (`today(st).stepped`) is untouched — still exactly one locked door a day, just silent about it on screen now. `debugInfo()`'s CELL line (the hidden infinite-steps cheat readout) was left as-is; that's dev tooling, not player-facing UI.
- Confirmed the dev's mental model directly: HOLD is kept specifically because it's the STANDBY-omen-banking trigger, not a flavor button — reconfirmed this wasn't touched by either v0.57.1 or this change.
- Tested: 300-run fuzz (5 timezones, random skew) through real `go()`/`search()`/`fight()` play, now also calling `renderScreen()` every turn to exercise the border layout math directly (not just the action logic) — 0 crashes, border stays a clean 80 columns.

## v0.57.1 - Oct 10 2026, 03:15 HST

![v0.57.1](screenshots/v0.57.1.png)

- **Removed the CELL charge/spare/discharge system from `rules.js`, per the dev's explicit "don't need it" call.** `today(st).stepped` (one boolean per real day) is still the only gate, now ungated by anything else:
  - **`discharge()` deleted outright.** It turned out to be dead code already — `index.html`'s combat key map (`{ f: "fight", t: "talk", g: "offer", i: "invoke", r: "run" }`) never included a `d` binding and no button rendered it, so the only way to trigger it was `act("discharge")` directly, which nothing in the UI called. Its `dischargeBox()`, `dischargeOK`, the `act()` branch, and the `[D]ISCHARGE` help-menu line are all gone from `index.html` too. `win(st, lines, burned)`'s now-dead third parameter (the "burned out, better drops" branch discharge used to trigger) is removed — `win(st, lines)`, flat 50%/25% silver/item odds, matching its old non-discharge values.
  - **The "spare charge" catch-up mechanic is gone.** `sync()` no longer computes `away`/`earned` or sets `st.spare`; skipping a real day is just a day with no door opened, same as any other skipped day now — no more banking a second door-open for the next visit. `go()`'s `spareUse` branch is deleted; the locked-door gate is now just `(locked || fals) && today(st).stepped && !st.freeSteps`.
  - `reset()`'s field-cleanup list, `debugInfo()`'s CELL row, `available()`'s `spent` calc, and the STANDBY summary line (`chargeLeft`-adjacent `A spare cell is stored` text) all had their spare references stripped.
  - `chargeLeft` dropped from the exported API (it only existed for the discharge button's "day's charge or the spare" wording).
  - `index.html`'s door-open confirmation popup no longer branches on spare ("USE THE SPARE CELL..." wording removed, always "POWER THE ___ DOOR?").
  - `screen.js`'s bottom-border CELL indicator is a single `[#]`/`[ ]` slot instead of two (`CELL [#][+]` → `CELL [#]`); `.padEnd(15)` already absorbs the shorter string so the border's column math didn't need touching.
  - **HOLD (STA[N]DBY) is untouched and still shares the same one-per-day `today.stepped` flag** — confirmed this is load-bearing, not just a flavor button: `hold()` setting `today.held = true` is what `sync()` reads the next real day to trigger STANDBY (banking that day's omen into `st.bankedOmen`, usable later as THE HELD DAY in INVOKE). So the day's one action is still "open a locked door, or go on STANDBY, not both" — removing CELL's complexity didn't touch that trade-off, only the spare/discharge layers on top of it.
  - Tested: 300-run fuzz across 5 timezones and random clock-skew with `freesteps` on (0 crashes, matching prior sessions' baseline), plus a second 300-run pass with `freesteps` OFF driving real `go()`/`search()`/`fight()` play — the one-door gate (`"> The door won't cycle..."`) fired 2,784 times across those runs with 0 crashes, confirming the simplified gate blocks correctly in ordinary play, not just in isolation. Confirmed `st.spare` is `undefined` after a multi-day skip (no catch-up banked) and `RULES.discharge`/`RULES.chargeLeft` are `undefined` from the module.

## v0.57 - Oct 10 2026, 03:00 HST

![v0.57](screenshots/v0.57.png)

- **Minimap/compass privacy: a fixed per-floor rotate/mirror transform, confined entirely to `floor.js`.** `generate()` now stamps `floor.sym = Math.floor(prand() * 8)` once, from the floor-level private `prand` stream (same "stamp once" slot as `lureStage`) — one of the 8 elements of the dihedral group D4 (4 rotations × optional mirror). `symTransform(sym)` (module-level, also exported for tests) returns `{ dir(d), pos(r,c) }`: `dir` relabels a raw N/E/S/W key to its transformed label, `pos` applies the matching linear map to a raw grid position. The two are kept in lockstep by construction (mirror flips the column index, then rotation steps the direction index forward by `sym % 4` in the fixed N→E→S→W cyclic order, matching a 90° clockwise vector rotation `(dr,dc) → (dc,-dr)` applied the same number of times) — verified by a 1500-trial fuzz test asserting, for every door in every generated floor, that the neighbor's transformed position equals this room's transformed position plus the transformed direction's offset, and that the neighbor's door back is the exact opposite transformed label (0 failures across 84,136 door checks, varied `days`/`streak` options).
  - All of the actual layout math — `floor.pos`, `floor.cells`, `book()`, the `attempt()`/`out()` placement search, halo/roomy packing — stays entirely in raw/untransformed terms, untouched. Only the final `room.r`/`room.c`/`doors`/`falseDoors` written into `floor.rooms[i]` at the end of `buildWing()`'s per-room loop go through `T.dir`/`T.pos` — i.e. generation (shared, seed-driven) and display (private, pseed-driven) are cleanly separated: the transform is a pure relabeling pass over what's about to be shown, never an input to how the floor is laid out.
  - One subtlety this surfaced: `buildWing`'s `back` (the wall the new wing's first room was entered through, used to seed `used.K` so the layout search doesn't reuse that wall) used to read `from.dir`, which `grow()` passes straight from the caller — and the caller is `rules.js`, calling with `st.facing`, which is now a *transformed* label by the time it reaches here. Fixed by sourcing `back` from `floor.exits[k].dir` instead (the RAW direction the parent wing recorded when it booked this room as one of its exits, already in raw terms, never read anywhere else) — `OPP[floor.exits[k].dir]` instead of `OPP[from.dir]`. `from.dir` is otherwise unused inside `buildWing` now.
  - Nothing outside `floor.js` changed. `rules.js` (`stairsDir`, `altarDir`, `isLocked`, `isSealed`, `kindBehind`, `LEFT`/`RIGHT` turning, `go`/`search`/`available`) and `screen.js`/`index.html`'s minimap rendering and FACE display all already treated door/facing labels as opaque, mutually-consistent keys with no hardcoded real-world-direction assumption — confirmed by reading every `.doors`/`.r`/`.c`/`facing` usage site before shipping, not just by testing. `arrive()`'s default facing (`Object.keys(floor.rooms[0].doors)[0]`) picks up the transform automatically since room 0 is finalized through the same per-room loop as everything else.
  - Backward compatible with zero migration: `symTransform` treats `sym == null` as identity (`sym || 0`). An in-progress floor from before this shipped has no `sym` field; any *new* wing built on that same floor (the player continuing an existing run) still renders unrotated, exactly as it already looked. Only floors generated fresh after this update (next floor arrival) get an actual 1-of-8 stamp.
  - Tested: the 1500-trial structural fuzz above, plus a from-scratch smoke run through the real `RULES` action API (`reset`/`go`/`search`/`fight`/`available`) with `freesteps` on, confirming no exceptions across floor arrivals, searching, fighting and door traversal with transformed labels live end-to-end (a bot script's in-combat deaths were its own AI shortcomings, not a code fault — same bot dies the same way on unmodified `main`).
- **Omen-streak bonus/void trigger reworked: guaranteed, not a probability boost (dev correction of the v0.56.1 note below, which had it as `+0.15` on the daily roll).** `rules.js`'s `sync()` bonus/void block now has two fully independent sources, both gated by the same `!bonusRolled && !antiRolled && !pendingBonus && !pendingAnti` guards so a floor never gets more than one:
  1. **Fresh-streak guarantee, 100%, no roll at all.** `const streakNow = omenStreak(st.omenDay), streakYesterday = omenStreak(st.omenDay - 1); const freshStreak = streakNow && streakNow !== streakYesterday ? streakNow : null;` — fires only the day a streak *first* turns true (not every day it continues holding), so once per streak occurrence, not once a day for its whole run. `freshStreak === "LAW"` sets `pendingBonus`; `"CHAOS"` sets `pendingAnti`. No monthly cap, no cooldown — a 3-day streak is already rare on its own (LAW ≈1/513 days, CHAOS ≈1/160 days, from the earlier-session simulation), independent of rule 2 below.
  2. **Ordinary roll, bonus-only (void never comes from this path), moon-weighted.** `const MOON_BONUS = [0.03, 0.04, 0.05, 0.06, 0.07, 0.06, 0.05, 0.04];` (new `rules.js` const, same shape/indexing as the existing `MOON_PULL` encounter-odds multiplier, by `moon()` phase index) replaces the flat 7%. Still capped at 1/floor, plus the two balance rules from the same session: never two days running (`st.lastBonusDay === undefined || utcDay() - st.lastBonusDay > 1`) and at most 2 a real lunar month (`st.bonusEpoch`/`st.bonusCount`, reset when `epochNow()` changes). Averages ~5% over real moon data (not 7% flat), so long-run frequency is **≈1.3/month** before the monthly cap even binds (200,000-trial standalone-logic-replica sim, not the full game loop — `RULES.hold()` in a loop hits the floor-turnover test-harness bug noted in the v0.56 session notes, where a stalled run freezes `sync()`'s day-rollover forever) — confirmed by the dev as fine ("under twice a month is perfect"), even though it undershoots the doc's original "twice a month" phrasing slightly.
  - `reset()`'s per-run field-cleanup list gained `"bonusEpoch", "bonusCount", "lastBonusDay"`. `debugInfo()`'s row 3 gained `BONUS ${st.bonusCount||0}/2` plus `+PEND`/`+PEND(void)` flags.

## v0.56.1 - Oct 10 2026, 02:00 HST

![v0.56.1](screenshots/v0.56.1.png)

- **`[U]SE DAY` removed from the bottom border; THE HELD DAY added to INVOKE instead (`index.html`).** `showInv()` unshifts a pseudo-item (`{ name: "THE HELD DAY", omen: true, ... }`, same pattern as the existing ICHOR pseudo-item) onto the bag list whenever `save.bankedOmen !== undefined && !save.useBanked`. `useInv()` branches on `it.omen` to call `RULES.useBankedOmen(save)` instead of `RULES.useItem`. The `u` global key binding is gone; it's selected/used the same way any bag item is (`[1-9]`/click, `[ENTER]`). `screen.js`'s `bankReady`/conditional `[U]SE DAY` logic in the system-button row is removed entirely — that row is back to the fixed `" [?] [L]OG [R]ESET "` it always was.
- **Anti-bonus room renamed `husk` → `void` (THE VOID), everywhere:** `floor.js`'s `ANTI_KIND`, `rules.js`'s `ROOM`/`ARCH_DESC`/`ENTER_BY_KIND` entries and `enterKind`'s branch. Pure rename, no mechanical change — flavor text untouched (fits the new name fine as-is).
- **Bonus/anti-bonus room roll cadence fixed to match the design doc (per real day, not per wing-unlock).** This was a pre-existing mismatch flagged in the v0.56 notes, not something that changed in v0.56 itself. Moved the actual probability roll out of `floor.js`'s `buildWing` and into `rules.js`'s `sync()`, on the same day-rollover branch that stamps `omenDay`/banks the omen: once per real day, if the floor hasn't already rolled (or isn't already waiting on) a bonus/anti room, roll `Math.random() < 0.07 + (streak === "LAW" ? 0.15 : 0)` for a bonus, else (CHAOS streak only) `Math.random() < 0.15` for an anti. A hit sets `floor.pendingBonus`/`floor.pendingAnti` (not `Math.random` on the floor object directly — plain `Math.random()`, not a seeded `prand`, since this is a one-shot daily event with nothing that ever needs to replay deterministically). `buildWing` no longer rolls at all; it just checks `floor.pendingBonus`/`pendingAnti` and clears the flag once placed, same slot-eligibility rules as before (`stage > 0`, needs an open X/P slot, never swaps a hinted door).
  - **Re-tuned the odds for the new cadence, not just ported the old numbers.** The old 10%/15% figures were sized for maybe 2-3 roll-opportunities per floor (once per wing-unlock). At a daily cadence a floor can see up to 7 rolls (one per day, floors last a week), so the old 10% would have made a bonus room show up on ~52% of floors — way more than the doc's "roughly twice a month" target. Picked 7%/day instead: simulated (pure probability, no game state) at 200,000 trial floors, 7%/day capped at one hit per 7-day floor lands at ~40% of floors getting one, which against ~4.3 floors/month works out to ~1.7 bonus floors/month — matches "twice a month" closely. The streak boost (+15pp on LAW days, 15% flat anti-roll on CHAOS days) is unchanged from v0.56, just moved to the daily roll instead of the wing-build roll.
  - Verified end-to-end: manually set `pendingBonus`/`pendingAnti` on a floor, fully BFS-explored it via `FLOOR.grow`, confirmed the flag gets consumed (cleared, `bonusRolled`/`antiRolled` set) and the room actually appears with the right kind. Also re-ran the 300-floor timezone/skew fuzz — 0 crashes.
- **Screenshot:** real Playwright render again, this time of the INVOKE screen open with THE HELD DAY selected, to show the new placement specifically.

## v0.56 - Oct 10 2026, 01:41 HST

![v0.56](screenshots/v0.56.png)

- **Shared floor shape / private contents split (`floor.js`):** `generate(seed, pseed, opts)` now takes two seeds. `seed` (shared, `seedFrom(epochIndex, floorNum)`) still drives wing topology, the room-grid layout, door positions and the floor's kind-pairing offers — same generation code as before, just explicitly fed from the shared `rand` stream. `pseed` (private per-account, `st.pseed`, rolled once in `reset()`) drives a new `prand` stream per wing (`rng((floor.pseed ^ Math.imul(stage+7, 0x9e3779b1)) >>> 0)`), used for: which paired kind lands in which slot (`shuffleWith(floor.offers[...], prand)`, was `rand`), each room's hidden-item pile (keyed off `floor.pseed` now, was `floor.seed`), the Day-7 wildcard kind, and the bonus/anti-bonus room roll.
- **Bug fixed in passing:** the Day-7 wildcard kind was being drawn from the shared `rand`, not `prand` — silently identical across every player despite the design calling for it to be private. Moved to `prand`.
- **`floor.v` bumped 6 → 7** (schema changed: added `pseed`, `streak`). **Bug fixed in passing:** `index.html`'s save-compat gate (`s.dungeon.floor.v === 5`) was already stale before this session — `floor.js` had been writing `v: 6` for a while, so the gate never matched and every page load was silently discarding the save and starting fresh, regardless of this release. Bumped the gate to `=== 7`.
- **`epochIndex(date)` / `utcDay(date)` added to `screen.js`:** `epochIndex` reuses the existing moon-phase reference-date/synodic-month math, floored to a whole lunar-month count (the design doc's "season epoch" — feeds the shared floor seed). `utcDay` is `floor(now/86400000)`, a pure UTC calendar day (feeds the omen, below). Both exported on the module API.
- **Omen: calendar-shared, not per-run-random (`rules.js`).** Dropped `st.omenSalt` entirely. `omen(t)` is always called with `effectiveOmenDay(st)` = `st.useBanked && st.bankedOmen !== undefined ? st.bankedOmen : st.omenDay`. `st.omenDay` stamps to `utcDay()` once per real-day rollover inside `sync()` — same "stamp once, hold till the next rollover" pattern as the existing `st.floorEpoch` fix — so each player's own local midnight still flips it for them, but the underlying value is one shared UTC-day sequence (`omenOf(day)`, through the existing `hash()`/`OMENS` table, unchanged). Verified via `SMT.setSkew()` two-timezone sim: max 1-day mismatch window near either player's midnight, resolves every rollover, never permanently desyncs, never touches the streak calc (which reads the date directly).
  - Test-harness gotcha hit along the way, not a game bug: `RULES.reset()` overwrites `st.tz` via `TIME.zone()` (the container's real system tz), so simulating a specific timezone means setting `st.tz` *after* `reset()`, not before.
- **Omen lean + 3-day streak:** `lean: "LAW"` on `data`/`hard`, `lean: "CHAOS"` on `folk`/`easy`/`loot` (everything else unleaned, breaks a streak — my mapping, not pre-specified). `omenStreak(day)` checks `omenOf(day).lean === omenOf(day-1).lean === omenOf(day-2).lean`, returns `"LAW"`/`"CHAOS"`/`null`, pure function of the date, nothing stored. Because CHAOS has 3 qualifying keys to LAW's 2, the streaks aren't symmetric: simulated over 20,000 days, LAW ≈ 1-in-513, CHAOS ≈ 1-in-160. Worth revisiting.
- **Streak → room odds (`floor.js`, inside `buildWing`):** the existing private per-wing bonus roll (1-in-10, once per floor, never swaps a hinted-door room) goes from flat `prand() < 0.10` to `prand() < 0.10 || (floor.streak === "LAW" && prand() < 0.15)` — a LAW streak adds a second, independent 15% roll on top, doesn't replace the base one. `antiN` (new) only rolls at all when `floor.streak === "CHAOS"`, at `prand() < 0.15`, only on a wing that didn't already roll bonus. Both cap at one per floor (`floor.bonusRolled`/`floor.antiRolled`); a floor's `streak` is stamped once at arrival, so it's never both a LAW and a CHAOS streak at once.
- **THE HUSK (`ANTI_KIND = "husk"`):** mirror of the bonus room (`archive`). Pile: strips `item`/`silver`, adds two `demon`s, reshuffles — demon-heavy, loot-stripped (the archive's pile does the opposite: strips `demon`/`item`/`silver`, adds `lure`+2 `item`+`silver`). `enterKind`'s `"husk"` branch guarantees an encounter on first entry if one isn't already set, corrupted via the same `isProgram(base) && !UNIQUE[base]` gate the rest of the corruption logic uses, HP formula matches ordinary encounters (`16 + 9*floorNum + R(0,8)`). Tell on entry: "Stripped shelves. Something shifts in the dark at the back." `ARCH_DESC.husk` and `ENTER_BY_KIND.husk` added, mirroring `archive`'s entries.
- **STANDBY omen banking:** `hold()` sets `today(st).held = true`. In `sync()`, when a new day rolls over and the previous day was `held`, `st.bankedOmen = st.omenDay` (the day just finished) before `st.omenDay` advances; cap is exactly 1 — a new held day overwrites whatever was already banked, no stacking, no decay. `useBankedOmen(st)` (new, mirrors `hold`'s shape) sets `st.useBanked = true`, consumed (deleted) the next time `sync()` crosses a day boundary. `available(st).useBankedOmen` gates on `st.bankedOmen !== undefined && !st.useBanked`. Also fixed the existing "tomorrow preview" STANDBY voice line (shown the morning after a held day) to read `omen(st.omenDay + 1).text` instead of the old salt-based expression, so it's now an accurate preview of tomorrow's real shared omen, not flavor-random.
- **`[U]SE DAY` button (`screen.js`/`index.html`):** appended to the system-button row only when `st.bankedOmen !== undefined && !st.useBanked` (`bankReady`), so most runs never see it. Verified it never breaks the strict 80-column render check in either state. Key binding `u` (`b` was already `"board"`). No dispatch special-casing needed — `useBankedOmen` isn't shadowed by any existing `if` branch, falls through to the generic `RULES[name](save)` call.
- **Fixture-wall near-miss (`search()`):** added `FIXTURE_NOISES`, a separate 3-line pool used specifically when the near-miss noise lands on the wall actually holding the floor's fixture (`w.fixtureDir === dir && pile.includes("fixture") && !found.includes("fixture")`). Ordinary near-misses elsewhere unaffected.
- **Floor-entry flavor:** new `floorArrivalLine(st)` wraps the existing `atmosphere(st)` and appends up to two extra clauses: a 50%-chance family-dominance hint (`FAMILY_HINT[dominantFamily(floorNum(st))]`, picks the LADDER weight-table's top family for the floor's depth bracket) and, when `fl.streak` is set, a fixed streak line (`STREAK_LINE.LAW`/`.CHAOS`). Wired into the three floor-arrival call sites (`ensureFloor()`, the stairs-descent branch, new-game creation); two other, unrelated `atmosphere(st)` calls (door-unlock-within-floor, ordinary room entry) deliberately left alone.
- **`debugInfo(st)`:** new `OMEN` row shows the resolved omen key plus `(banked)`/`+BANK` tags.
- **Testing:** 500-floor fuzz (random seed/pseed/streak, full BFS walk via `FLOOR.grow`) — 0 crashes, stairs always placed, avg 40.1 rooms explored. A second 300-floor fuzz at session wrap-up, scattered across timezones/skew offsets — 0 crashes. Shared/private seed comparison confirmed: same `seed` + different `pseed` → identical `offers` pairing and wing-0 topology, different slot-kind assignment, different wildcard. Changelog screenshot taken via a real headless-Chromium render (Playwright) of a hand-built save state (not a mock), specifically to show the new `[U]SE DAY` button live.
- **Known gap, not addressed this session:** the design doc's per-account minimap/compass rotate-mirror transform ("Minimap handling — decided") still isn't built. Doors' compass directions still come from the shared `rand`, so a callout like "the vault's north door" is still a real cross-player spoiler today. See the design doc's status note.
- **Save compatibility intentionally broken** this release (floor schema v6→v7, omen storage reshaped) — agreed with the dev beforehand.

## v0.55 - Oct 8 2026, 04:14 HST

![v0.55](screenshots/v0.55.png)

- **Popups never close on a stray click:** the log, about page, codex, board and bag close only via their button ([C]LOSE / [ESC] CLOSE, a real `[data-close]`) or key; the confirm box ignores stray clicks; `#found` closes only on its [ OK ]. About links (codex/pass/board) close the page and open their target.
- **Victory screen:** shows only the "falls" line (no "party strikes", no "Something is pulling at you"); the last words no longer carry the enemy name (`"quote"` only).
- **Player name:** stored upper-case (`setName`); "POSTED AS" upper-cases too. A name that fails the rules shows a warning line with the reasons; the name popup's sine wave animates.
- **End screen post row:** `[P]OST YOUR HIGH SCORE AS NAME` (P or Enter posts), `[B]OARD` on the next line.

## v0.54 - Oct 8 2026, 04:01 HST

![v0.54](screenshots/v0.54.png)

- **Player name:** asked at the start of every run (fresh page, old save with no name, after every [R]ESET): a `#found` popup (`mode "name"`, input prefilled with the last name, 3 to 10 of `A-Z a-z 0-9 space _ . -`, Enter or [ENTER] BEGIN). Nothing else takes keys until it is set (`needsName()`). Stored as `st.playerName`; `reset` sets `st.needName = true` and keeps the old name as the default (`RULES.setName`). The sidebar shows it as the first party row's label in place of KURA (upper-case, cut to 8 columns; stats stay KURA's); the PARTY header is unchanged. KURA stays everywhere else. The leaderboard post uses it: `POST YOUR SCORE AS NAME  [ENTER] SEND  [B]OARD`, no name box at the end.
- **Altar dialogue:** the terminal speaks before it asks. `ALTAR_TALK` has 8 scripts of 5 to 7 lines (never the same one twice in a row in a room: `RS.altarScript`), each ending in an ask to give. The terminal's own lines scroll in from the right and stop at the left (long lines scroll until their end shows); a click, Enter or Space brings the next line (`altarNext`, `st.altar.page`), B or Esc leaves. The gift list only shows on the last line. A terminal already fed today keeps its quiet screen. The answer ("THANK YOU.") still types.
- **Fight text:** the blinking `_` now also follows the last line while the box waits for your choice (and on question screens), not just between lines.
- **Last words:** `win()` sets `st.lastLine` (cleared at the next round) instead of adding it to the round text; the victory screen shows it on the line under the art with a blank line before "THE WAY IS CLEAR" (only when the screen is a win; the art slot is a row or two shorter).
- **Leaderboard Worker:** the pre-check (OPTIONS) now answers a bodiless 204 (the old one returned a body with a 204, which Cloudflare turns into a 500, so every post failed in the browser); CORS is `*` on every answer so the page can read why it was refused; `ALLOW_ORIGIN` takes several comma-separated pages and is enforced by the Worker (a refused page gets `{"error":"origin","seen":"..."}`). The game now says the real reason (page not allowed, slow down, bad name, bad score, or the HTTP status). The [B]OARD button left the bottom border; the board stays in the [?] menu, the B key and the end-of-run log.
- **End-of-run log:** the buttons ([D]OWNLOAD, C[O]PY, [C]LOSE) and the post row come first, then the epitaph and totals, then the ADVENTURE LOG heading and entries, with [R]ESET last. A run in progress keeps its heading first.
- **Painted door press:** unchanged this time (painted doors stay off).
## v0.53 - Oct 8 2026, 03:30 HST

![v0.53](screenshots/v0.53.png)

- **Leaderboard (Cloudflare Worker + D1, `leaderboard/` in the game repo):** ranked by deepest floor, then most days survived, then earliest post. TURNS are shown as a column and never ranked (spam). One entry per run (`st.runId`, a 16-char id made in `reset`); `RULES.score(st)` gives `{run, floor, days, demons, turns}` (real `st.steps`, not the on-screen TURN). `LEADERBOARD_URL` in index.html is `https://daily-dungeon-board.ddddungeon.workers.dev`; empty means every board button stays hidden (`SMT.setBoard`).
- **Worker checks:** name 3 to 10 of `A-Z a-z 0-9 space _ . -`; run id `[a-z0-9]{8,40}`; floor 1 to 20 and not above days; days 1 to 400; demons at most 40 a day; turns at most 5000 a day; 5 posts an hour per sender (hashed IP, used only for this); `ALLOW_ORIGIN` must match the page's Origin on POST (wrangler.toml, currently `https://okayline.github.io`); optional `BLOCKLIST` of name words (empty). Scores can't be proven (saves are local), so these only stop casual junk.
- **Where it shows:** [B]OARD in the bottom border (`SMT.setBoard`), B on the main screen, a `[B]OARD` line in the [?] menu keys list (click or B). After a run ends the log shows `POST YOUR SCORE  NAME [____] [ENTER] SEND`; after posting it says `POSTED AS NAME. RANK N.`
- **Admin delete:** in X mode (`save.freeSteps`) the board lets up/down pick a row and D delete it: `DELETE /score?id=N` with header `x-admin-key` matching the Worker secret `ADMIN_KEY` (`wrangler secret put`). The key is asked once and kept in localStorage (`dd-admin`). Clicking no longer closes the board in X mode.
- **Bag (INVOKE):** closes only with `[C]LOSE` (button or C), I or Esc; clicking outside no longer closes it. `[I] closes` left the header. The ICHOR picker's Esc still goes back to the bag.
- **Adventure log:** buttons are `[D]OWNLOAD   C[O]PY   [C]LOSE` (O copies, C closes; L and Esc still close; a click on the log still closes it).
- **Text selection:** `body { user-select: none }`; textareas, inputs and `#log pre` stay selectable.
- **Floor arrival:** line 3 on a new floor and on descending is `atmosphere(st)` now (it used to repeat the deadline already on the status line).
- **Roster spreadsheet:** rebuilt with `roster/make.sh` (no sheet changes this time).

## v0.52 - Oct 8 2026, 02:58 HST

![v0.52](screenshots/v0.52.png)

- **Painted doors parked:** `PAINTED_DOORS = false` in floor.js stops new floors from generating false doors. The code, `isFalse` handling and `FALSE_GO` lines stay; floors saved earlier can still hold them. I tried making a press spend the charge and pay a stash (15 to 50 silver times the floor, 30% an item, once per door), then took it back: too hard to balance for now. A painted door press still keeps the charge.
- **Painted door remark:** pressing one clears the stale line 3 and a living party member may comment (`FALSE_SAY`: ELF 2 lines, PIXIE "It's not a room, it's not a door, it's not anything!", CU SITH wordless 2).
- **The ? room entry line:** walking into the room holding the unfound locker (`floor.lure`, no `"lure"` in its `found`) replaces "a cleared room"/"a new room" with one of three lines ("The room feels like it is holding its breath." and two more). Only on walk-ins, not on the door-unlock step.
- **Minimap outline grid:** `.wall` opacity 0.4 to 0.6 (colour unchanged).
- **Party patience warning:** `snap()`: at 0 patience the first push only warns (`p.warned`, they show their tired line); from the second push on the old 50% snap or leave applies. `warned` clears when patience rises above 0. Applies to talking, looping and fidgeting.
- **Victory screen:** closes only on [ OK ] (click on the button, or Enter); clicking elsewhere, Space and Esc no longer close it. It also ignores any close for 900 ms after it appears (`doneAt`).
- **Run end log:** `[R]ESET begins a new run.` is now the last line of the log (and of the download and copy text).
- **Roster spreadsheet:** new `Omens` sheet (9 omens, 34 lines, each with its effect: ordinary, data x2, folk x2, heat x2, hard 0.5 find, easy 1.6 find, talk 1.6, calm 0.5 heat, loot x3). `roster/make.sh` exports `OMENS` to the dump.

## v0.51 - Oct 8 2026, 02:34 HST

![v0.51](screenshots/v0.51.png)

- **Fight text pacing:** each round's lines wait for a click, Enter or Space before the next one (`replayTimer = -1` sentinel; a blinking `_` marks the wait). The demon's lines come first (`round(..., demonFirst)`; `fight()` passes true), then "The party strikes. -N". Blows still resolve party first; only the display order changed. If the enemy dies, only the party/win lines show. The enemy's bar drops when "The party strikes" shows (`partyIdx`), KURA's when the demon's `-N HP` line shows (`hitIdx`).
- **CU SITH is wordless:** `VOICE.beast`, `DEMON_ASK.beast`, `beast()`, `famOf()`, `said()`: no quoted speech in fights, talks or the wild-CU SITH folklore voice. Verified over 500 simulated fights and talks.
- **ICHOR picker:** Enter on ICHOR opens a party list (name and HP, nothing on the right; up/down, 1-9 or click; Enter or a second click gives; Esc back). `giveIchor(st, idx)`: KURA (idx 0) still drinks (`drinkIchor`, 10 ICHOR, +5 HP, TAINT). A wounded demon heals 1 HP per ICHOR (3 if down). A full-health demon takes it for 3 ICHOR: CHAOS demons get `p.buzz` (+2 to its blows until the next sleep; cleared in the sleep step), everyone else just gets a line. `[D]RINK` is gone; `feedIchor` is still exported but unused.
- **Last words:** `lastWords(e)` in `win()`, after the "falls. +N ICHOR" line. `LAST_WORDS` has 5-6 lines per family (data/hardware/hybrid/folklore), plus `LAST_ANY` ("my Mom is going to be SO mad.") for every family. CU SITH uses `LAST_BEAST` (2 wordless lines).
- **Break arrival popup:** when a demon comes after you break something, `st.round` is cut to its first line (the stance line pushed [ OK ] off the box).
- **Roster spreadsheet:** `roster/make.sh` in this repo rebuilds `daily-dungeon-characters.xlsx` from the game's current `rules.js`; it now includes last words. Rebuilt on every commit.

## v0.50 - Oct 8 2026, 01:31 HST

![v0.50](screenshots/v0.50.png)

- **Fixtures (rooms no longer pay out on entry):** den, bay, relay, vault and forge rooms hide a `"fixture"` at the front of one wall's pile (`w.fixtureDir`; it takes the normal 5 to 10 points, so about 3 to 8 searches). `FIXTURE[kind]` is the find line ("... It can be used."). Once found, a SEARCH of that wall uses it (`useFixture`), once per day per room (`RS.fixtureDay`): den raises the room's heat to 60% of max; bay heals a third (`heal(st, 1/3)`); relay shows the other door's clue (the relay no longer gives it on entry); vault gives 40 to 110 silver times the floor; forge clears taint and TRIP. The old half-strength return rule is gone. The altar terminal and the bonus room's program encounter still happen as before. Entry still shows a flavor line (`st.tell`).
- **Party entry lines (`partyEnter`):** every room entry (new or revisit) draws a line from a living party member (never the same speaker twice in a row). ELF, PIXIE and CU SITH have 2 lines per kind (`ENTER_BY_KIND`: den, bay, relay, vault, forge, altar, archive, hall, dead, plain). Recruits and programs use their family's lines (`PARTY_ENTER`) only if none of the three is alive. It replaces the room's own `tell`; KURA alone keeps the tell. A heat tell can still take line 3 first.
- **Minimap:** the locked door KURA faces is drawn flat white (`.door.focus`, `#ffffff`, no glow) at the cell next to `@` on her facing side. Normal `#` stays `#8f8f8a`.
- **Turn text:** facing an open door now uses `SEE.arch` (4 lines); locked, painted and sealed doors keep `SEE.door`. Turn buttons are `[ < ]` and `[ > ]` (col 16, the pair stays centered).
- **Bottom stat row:** `NAME` padded to 11, then `TURN 0000`, then `DAY 01`; no gaps vary with the name (10-character names used to shift the others one column).
- **Demon talk:** `e.left = R(2, 3)` (was R(1, 2)), so a demon asks at least 2 questions before the gift roll (data 10%, hardware 30%, hybrid 40%, folklore 45%, scaled by personality). A guard ends the questions if the pool runs out. Three questions that sounded like requests were replaced: hardware "do you have a charger? anything?" became "do you remember being plugged in?", hybrid "Would you trade a memory for a secret?" became "Do you keep secrets?", folklore "Have you come with an offering?" became "Have you come to stay?".

## v0.49 - Oct 8 2026, 01:10 HST

![v0.49](screenshots/v0.49.png)

- **Unlock opens only:** `go()` onto a locked door (not in a fight) spends the day's charge or the spare, calls `FLOOR.grow` (builds the wing, seals the other offer), sets facing and logs "The X door cycles open. The way is clear." KURA does not move; a now-open door is free. Running through a locked door in a fight still moves her. Fixed a double spend of the spare in that running path.
- **Search costs:** each thing needs 5 to 10 points (was 2 to 5) and every find already taken on that wall multiplies the next cost by 1.5. Fallback need 7 (was 3). The noise hint starts at 3 points (was 2). Average searches per find on one wall: bad day 0.6/search: 11.4, 16.0, 22.4 (1st, 2nd, 3rd); average 1.1: 6.8, 9.3, 13.6; good 1.5: 5.1, 6.8, 10.0; best 1.9: 4.3, 5.8, 8.3. Old average: 3.2 per find at 1.1. Walls hold 0/1/2/3 things in 39.8/43.6/13.6/2.9% of cases (300 runs; stairs counted as a thing); about a third of rooms hide a deep item (20 to 50 points).
- **Minimap:** open doors are blank (were `=` and `‖`); the facing arrow is not drawn over a `#`.
- **Fight popup:** body text is the last 2 lines (`maxLines = 2`); `[D]ISCHARGE` removed from the box and the `D` key (the `discharge()` rule is still in `rules.js`, unreachable). KURA gets a 10-block HP bar (party[0].hp / hpmax) under the enemy's, name padded to line up; it updates on the final frame of a round.
- **Silence tolerance:** pushed in v0.48.1.
- **Cheat menu (X):** `debugInfo` returns three lines: room/stairs/exits, cell/hidden/terminal/heat/enc, loop/linger/lean/taint/day. It is left-aligned in `#cheat`, one line up (same row as the build number, which sits under the screen at the right).
- **Public changelog:** older entries rewritten to remove heat, loop, dread, taint, patience, odds and similar details. Full text lives in this file's older entries.

## v0.48.1 - Oct 8 2026, 00:24 HST

![v0.48.1](screenshots/v0.48.1.png)

- **Rename (player-visible only):** "Daily Digital Demon Dungeon" in the page title, help header (padStart now 71-30-7-13, row stays 71 wide), adventure-log export header, README. Internal strings (save key `daily-dungeon-run`, log filename), comments, `archive/`, and the repo name are unchanged.
- **Silence tolerance (demon talk):** the first `[S]ILENT` answer to a demon never lowers its mood (`d = max(d, 0)`, so HAUGHTY is forgiven once), and if it was on its last question it gets one more (`e.left += 1`). `e.quiet` counts silences; later ones use the normal persona effect. Tested: after one silence the talk continues 100%; after up to 3 silences HAUGHTY ended 272/500 and PRIM 467/500, none angry.

## v0.48 - Oct 8 2026, 00:14 HST

![v0.48](screenshots/v0.48.png)

- **Room names (bottom stat row):** `NAME  TURN 0000  DAY 01`, upper-cased, max 11 characters. Room 0 = "Stairs up"; the room holding the found stairs = "Stairs down". Otherwise a kind-flavored name, memoized per room in `RS(d,i).name`, unique per floor (falls back to the plain list, then repeats). Never says warm/cold or the real type. Lists: den (Snug, Burrow, Musty), bay (Quiet, Soft, Still), relay (Tone, Static, Dish), vault (Heavy, Sealed, Hushed), forge (Ash, Solder, Soot), altar ("The altar"), archive (Drive, Rack, Spin), all "... room"; passages: Passageway, Conduit, Crawlway, Corridor, Walkway, Service way; dead ends: Dead end, Sealed end; plain: 32 "<Adjective> room" names.
- **Cell:** `CELL [#][ ]` two one-char slots: first = today's step used (# once stepped and no free steps), second = a spare step held (+).
- **Open door / arch search line** (was Unreleased): "An arch to another room. It <sense of the room beyond>." Senses by kind (never the name): den warm, bay quiet and humming, relay thin tone and ticking, vault cold and dry, forge solder and cooling metal, altar glowing and listening, archive blinking lights; passage narrow and bare, dead end closes in, plain room bare and quiet. Longest line is 77 characters. Locked door: "A locked door." plus a hint or filler.
- **Party reply on line 3:** `st.talkLine` marks the reply set by `reply()`; `act()` blanks it on the next action if still unchanged.
- **Public changelog:** sanitized (no odds, drop rates, room names, hidden mechanics).

## v0.47 - Oct 7 2026, 23:51 HST

![v0.47](screenshots/v0.47.png)

Talking, programs, corrupted demons, and rooms that describe themselves.

- **Demon talk, gift asks:** after its questions a demon asks for a gift with a chance by family: data 10%, hardware 30%, hybrid 40%, folklore 45%, times a personality factor (HAUGHTY x1.4, PRIM x0.6, DREAMY x0.5; capped at 90%). Otherwise the talk ends: with mood 1 or more and a non-CHAOS demon (HAUGHTY needs mood 2) it offers to join (20% plus 10% per extra mood point, max 50%), else it leaves ("is content" if mood >= 1, "loses interest" otherwise).
- **Third answer, `[S]ILENT`** (key S): for a demon's question it moves mood by personality (GRUFF +1, DREAMY +1, SLY 50% +1 else 0, PRIM 0, HAUGHTY -1). Only counts on a question; at any other stage it means NO.
- **Personalities:** five (GRUFF, HAUGHTY, SLY, PRIM, DREAMY), fixed by a hash of the demon's name within its family's list (data: PRIM/SLY; hardware: GRUFF/DREAMY; hybrid: SLY/HAUGHTY/GRUFF; folklore: HAUGHTY/GRUFF/SLY). Party: ELF is PRIM, PIXIE DREAMY, CU SITH GRUFF.
- **Alignment pull from answers:** questions tagged LAW or CHAOS pull -0.25 / +0.25 toward the side the answer sides with. Recruits are recorded as pacts (name, floor, day, active); ended when they leave; the run summary lists them and a Restored count.
- **Party talk:** `[S]ILENT` on party questions (patience: GRUFF +1, DREAMY +1, SLY 50% +1, PRIM 0, HAUGHTY -1). A member with patience 1 to 2 asks "Anything else you want to say?" 40% of chats: YES +3 patience and a lean; NO makes them leave (HAUGHTY, PRIM, SLY always; DREAMY 80%; GRUFF 40%, else stays at 0); SILENT costs 2 patience (GRUFF 1). A member with patience 4 or more confides 15% of chats (HAUGHTY 8%, DREAMY 25%), 2 to 3 lines each, once each in order, +1 patience. Chat wears patience after 6 talks a day (HAUGHTY 5, DREAMY 8). The "remember my name" question is HAUGHTY only. Long questions were shortened so the three buttons fit on log line 3 (the buttons are `[Y]ES  [N]O  [S]ILENT`).
- **Programs (LAW, family data, recruitable):** WATCHDOG (blows against the party x0.67), PATCH (heals everyone 1/8 max HP after a fight; a corrupted demon starts at mood 1), CACHE (at camp, copies one COMMON item), SCAN (30% of finds, shows a clue about a door), COMPILER (at camp, two COMMON items become one UNCOMMON). Each demon encounter has a 7% chance to be a program not already in the party; programs always listen, start at mood 1, never ask for gifts, and offer to link 90% (mood 1+), 40% (mood 0), else leave.
- **Corrupted demons:** from the midpoint of the floor's week on: data 10% rising to 40% on the last day, other families half that. CHAOS, 15% more HP, glitched name (first vowel becomes a symbol), listen chance x0.7. After the questions: mood 1 or more restores it (real name, original alignment, -0.5 lean, 60% offer to join, else it leaves), otherwise the noise takes it again and it attacks.
- **Rooms:** entry lines are flavor only, no room names or effects spelled out. The bonus room (THE ARCHIVE) no longer gives its item on entry: a random program not in the party is always waiting (a talkable encounter), and its wall piles are a locker, two items, and silver, with no demons; item finds there are UNCOMMON or RARE (35% RARE), silver doubled. Search lines: a locked door starts "A locked door." with a 55% hint appended; an open arch gets a sense line (see Unreleased).

## v0.46.1 - Oct 7 2026, 23:21 HST

![v0.46.1](screenshots/v0.46.1.png)

Alignment between SILVER and ICHOR, and questions answered beside the question.

- **Alignment tag:** `[NEU]` now sits between SILVER and ICHOR (`< [LAW]` or `[CHA] >` when the last action pulled that way). It tightens to `<[LAW]` when the amounts are big and drops out when there is no room. The bottom row keeps just TURN and DAY.
- **Questions:** `[Y]ES   [N]O` sit at the right end of log line 3, beside the question, instead of in the bottom bar. STA[N]DBY stays put.

## v0.46 - Oct 7 2026, 23:19 HST

![v0.46](screenshots/v0.46.png)

Fight popups get art space, a clearer cell, and a party exit that always says so.

- **Fight popups:** "APPEARS" and "THE WAY IS CLEAR" keep the same art frame the fight box has.
- **Cell:** `CELL [##]` when charged and `CELL [  ]` when spent, so the spare `[+]` stays put.
- **A party member leaving** now always gets its popup, even when a find was already open (it waits its turn).

## v0.45 - Oct 7 2026, 23:09 HST

![v0.45](screenshots/v0.45.png)

The spare cell on screen, a cleaner minimap, and bonus rooms on unlock.

- **Spare cell:** the bottom bar shows `CELL [#]` (ready) or `CELL [ ]` (spent), with `[+]` when a spare is banked.
- **Minimap:** side walls are no longer clipped at the window edge, doors inside one wing are plain gaps, and a passage cell is blank (just `@`, `^` or `v` when you stand in it).
- **Bonus room:** the 1 in 10 roll now happens on each unlock, once per floor, and lands on a wing's dead end or passage.
- **Questions:** `[Y]ES` and `[N]O` no longer glow or change color, line up with the bar, and flash twice.
- The help page calls it `[P]ASSWORD`.

## v0.44 - Oct 7 2026, 22:34 HST

![v0.44](screenshots/v0.44.png)

A longer week, charge instead of keys, camp, discharge, drops, and the open-door arch.

- **The week:** the six room types are dealt twice into pairs, one pair offered each day. The last day is a wildcard door of a random type. The floor's length follows the days left (3 to 7), and the stairs sit in the wing opened on the second-to-last day.
- **Bonus room:** each time a door is unlocked there is a 1 in 10 chance that one of the new wing's open rooms is THE ARCHIVE (one rare item). Once per floor.
- **Charge:** the day's key is now a charge in a cell. A day nobody played banks one spare cell (one at most), which can open one more door.
- **Camp:** STANDBY restores everyone standing, clears taint, refills patience and cools the room; the next morning's dream line hints at tomorrow's omen.
- **Discharge:** `[D]ISCHARGE` in a fight spends the day's charge (or the spare) on one blow that ends most fights, after a confirm popup.
- **Demons drop things:** silver about half the time and an item about a quarter; a discharge kill drops more.
- **Open doors are a big double-line arch** with the room left empty. A passage is `) (` on the minimap (`)@(` when you stand in it), and the grid outline is dimmer.
- `[P]ASS` moved to the help page, next to `[C]ODEX`. The log page has a gap under its heading. TURN has four digits and DAY two.

## v0.43 - Oct 7 2026, 21:45 HST

![v0.43](screenshots/v0.43.png)

Minimap and door tiles, plus a few fixes.

- **Minimap:** the grid outline is dimmer. Locked doors are `#`, a sealed door is plain wall, a passage is `] [`, and the `[:]` mark is gone. The facing arrow stays.
- **Open doors in the 3D view** show the empty frame with the dark beyond, instead of a knob.
- **A blocked run opens a popup** ("PING blocked your way.") that waits for `[ OK ]`.
- **A new run rerolls the omens.** The invoke result line is plain white, not gold, and STA[N]DBY sits a touch lower.

## v0.42 - Oct 7 2026, 21:23 HST

![v0.42](screenshots/v0.42.png)

Searching, running, and a tidier top box.

- **Searching takes work.** Each wall thing needs 2 to 5 searches, with progress per search. Finds are worth more on a full moon, with a good omen, when rested, and early in the day's tiers. A noise hint ("KURA hears something") replaces the warm-wall line.
- **Item quality is hidden** from the player everywhere.
- **Running is one attempt per fight.** After it fails, `[R]UN` dims.
- **The omen moved into the moon box**, in quotes, left-justified on the bottom line, next to the `^^^`. Omen lines were shortened to fit.
- **The log page** has the heading on top and the buttons right-aligned below it. `[C]ODEX` is gone from the bottom bar.
- `[  ^  ]` never greys out, the `^` is centered, and STA[N]DBY sits a touch lower.

## v0.41 - Oct 7 2026, 20:59 HST

![v0.41](screenshots/v0.41.png)

A pass over the code, fixing what a review found, plus a few small changes.

- **A party member leaving opens a popup** (`[ OK ]`), wherever it happens. `[  ^  ]` is two spaces each side with a bigger `^`, and the lines no longer shift on that row.

- **Safer boxes and keys.** In the unlock box only Enter or Y says yes (a compass letter, or a held key, no longer confirms and spends the key); everything else is no. A new box replaces any stale one (so a cancelled standby can't run when you confirm a door). Clicking a field in the password box no longer closes it, buttons behind an open box do nothing, dim buttons do nothing (the step button still searches a wall), and cancelling a question brings back the fight or altar box.
- **New runs start clean.** Reset clears the last run's taint, item wear, pending question, altar and counters. A run that dies at the deadline no longer keeps a live demon or question.
- **Hidden things fixed.** Items are spread over a room's walls properly (the wall picker was stuck on one wall), and an Altar room no longer hides things behind its terminal.
- **Saves.** A corrupt or older save is kept aside instead of overwritten; a password must actually run before it can replace your run; a bad frame no longer freezes the screen.
- **Smaller fixes.** A waiting party question survives a reload; YES/NO in the swap stage keeps the text; a question lapses when a demon steps in; demons you already have don't turn up as strangers; real choices (not patient searching) wear down the alignment weighting; wing building finds a layout sooner; the cached `Date` header is corrected for age.
- **Buttons.** `[C]ODEX` and `[P]ASS` are on the bottom bar; popups are marked as dialogs and Tab and F-keys work.
- Dead code removed.

## v0.40 - Oct 7 2026, 19:57 HST

![v0.40](screenshots/v0.40.png)

- **The minimap outlines the rooms you've been in** with dim `+ - |` walls (neighbors share a wall). The wall is opened at every door, so a doorway reads `+ ‖ +` and the corners next to it turn into `-` or `|`. Open doors are `=` `‖`, locked or false ones `+`, sealed ones `x`.
- **A new demon says so first.** The fight box opens on `NAME APPEARS` with an `[ OK ]` (ignored for the first moment), so a run of key presses can't charge into the fight unseen.
- **`[   ^   ]`** is a little narrower again, with a bigger `^` (no glow).

## v0.39 - Oct 7 2026, 19:48 HST

![v0.39](screenshots/v0.39.png)

- **Everything asks in the game.** STANDBY, a new run and loading a password are in-game boxes now (no browser dialogs). The password box has `[ COPY ]`, `[ LOAD ]` and `[ CLOSE ]`.
- **Significant events are popups.** A hit, a party member who has had enough, leaves or joins, a new floor, the week ending and warnings open a box that waits for `[ OK ]`, so spamming can't click through them.
- **`[R]UN` is a button in the fight box.** It takes any open way (unlocked doors first), no matter which way KURA faces. In a fight `[<]` `[>]` and `[  ^  ]` are dimmed and do nothing, and the blinking RUN label is gone.
- **Yes/No fixes:** a party member's answer now shows at once instead of the old question staying up. Blinking buttons stay clickable while dark.
- **`[  ^  ]`** is wider (`[    ^    ]`), and facing a bare wall it searches that wall. STA[N]DBY stays lit with the X cheat on.

## v0.38 - Oct 7 2026, 19:31 HST

![v0.38](screenshots/v0.38.png)

- **`[  ^  ]`** is a new, wider forward button (7 characters, same type size as `[<]` `[>]`, no scaling or glow); RUN moved over to make room.
- **Yes/No in the bar.** A party member's `[Y]ES` / `[N]O` question now sits at the right of the bottom bar (replacing STA[N]DBY) so it never covers the log; searching and moving wait for the answer. Demon questions stay in the fight popup.
- **Items that break get a popup** (`IT BROKE`), listing anything that was inside, and it waits for `[ OK ]`. If something came to see what broke, the fight opens after it.
- **INVOKE:** the `[ENTER] use` row stays at the foot of the bag so it no longer jumps up a line when you use or switch items.
- **Line 1 never says the day** (line 2 already shows it). Item descriptions no longer show an alignment.

## v0.37 - Oct 7 2026, 19:13 HST

![v0.37](screenshots/v0.37.png)

- **Back to the two-door choice: floors are built from wings.** A floor is four wings of three spaces each (a room, a passage and a dead end) joined by open doors, so you can walk a wing freely. Each wing but the last has two locked doors out of it: an offer of two rooms. The six room kinds are dealt out over the floor's three offers, so every kind is offered once. Open one door (one key a day) and the other **seals** for good (`x` on the map and the door, dimmed). A wing is built when its door is unlocked. This replaces the random branching map and the hidden path.
- **Clues are the puzzle.** SEARCHing a locked door sometimes gives a faint hint of what's behind it (the senses overlap: warm for the Den and the Forge, a hum for the Bay and the Altar, cold and static for the Vault and the Relay). Each wing's **dead end hides a big clue**: a scrap that says outright what one of its two doors is, never which door. The Signal Relay now gives the other door's clue.
- **False doors.** About 4 wings in 10 have a door that looks locked (`+`) but is only paint. It asks the same popup, costs no key, and searching it gives it away.
- **Passages** are now free spaces inside a wing: no kind, at most one find, and never a demon (the dread answer can't come in either).
- **The stairs** are hidden in the last wing's passage or dead end. The old distance clues, the hidden path and the glowing `?` are gone; a visited room still shows `?` while its locker is unfound (about 6 floors in 10 have one, in a dead end).
- **Fixes and polish:** the find popup only closes on its `[ OK ]` (Enter or a click); a party member's `[Y]ES`/`[N]O` question waits for an answer; `[^]` matches `[<]` `[>]` (no glow, same size); the X cheat info is on two lines (with each wing's exits and clue); the fight popup has a blank line under the names; a `[C]ODEX` link sits at the top of the `[?]` page; the help text explains `+` and `x`.
- Runs saved before this change start over.

## v0.36 - Oct 7 2026, 18:45 HST

![v0.36](screenshots/v0.36.png)

- **One key a day, and a floor that grows.** The day's one move is now one *new door*. Opening a locked door uses the day's key (a popup asks first: "UNLOCK THE EAST DOOR?"); a door that's already open is free, so you can walk back through rooms you've cleared as much as you like. With the key spent, a locked door stays shut. `STA[N]DBY` spends the key and earns the deeper rest, as before.
- **Locked doors show.** On the map an unopened door is a `+`; on the door itself in the 3D view the knob becomes a `+`.
- **A bigger, branching map (up to 12 rooms), built a door at a time.** Rooms are no longer in a line or an L: each has 1 or 2 new doors (the start room 2 or 3), on a 5x5 grid. Nothing past the door exists until it's opened, and then the room's kind is rolled with no thought for the party.
- **The stairs are fixed from the start.** Each floor hides a path of 2 to 4 doors to the stairs (shorter when fewer days are left, so a floor can always be finished). A room on the path always has one door onward, plus others that lead elsewhere, so some doors get closer and some don't. About 6 floors in 10 also hide a locker (`?`) one door off the path; its `?` glows on the map until found.
- **Clues come from elsewhere.** A stairs or locker clue only appears two or three doors away, never in the room or next to the room it's about; the stairs room looks like any other. The Signal Relay points along the real path.
- **Passages.** Two places in five are a narrow passage: no kind, 0 or 1 hidden things, two more locked doors, and no demons at all (none hidden, none wander in, not even a dread answer). On the map a visited passage is `[:]`.
- **Revisits do half.** Coming back to a Den, Bay, Forge or Altar once a day works at half strength: the Den starts half as hot, the Bay heals half as much, the Forge halves taint without ending a TRIP, and an Altar that's already taken an offering shifts you half as much.
- **Fight popup.** The art frame is on top, then the enemy's name and HP bar with `ROUND #` at the right, then `> KURA` and the text, indented in from the edge.
- Runs saved before this change start over (the floors work differently now). Fixed a few lines that were too long for the log.

## v0.35 - Oct 7 2026, 18:03 HST

![v0.35](screenshots/v0.35.png)

- **Under the hood: each room keeps its own record.** Everything the game remembers about a room (visited, what's been found, heat, linger, the daily marks for the room kinds and the Altar, its wall contents) now lives in one place per room, instead of five lists that all assumed three rooms. Nothing about how the game plays changes. It's the groundwork for a bigger, branching map. Runs saved the old way convert themselves the first time they load, with every value kept.

## v0.34 - Oct 7 2026, 17:53 HST

![v0.34](screenshots/v0.34.png)

- **Six kinds of rooms.** Rooms 1 and 2 of each new floor get a different one of six kinds (older floors are unchanged). Names never show; each does its one thing when you walk in, with its own line:
  - Den: starts hot, so demons come easily.
  - Bay: safe (no demons) and heals the party by a third.
  - Relay: points toward the stairs.
  - Vault: coin.
  - Forge: clears ICHOR taint and ends a TRIP.
  - Altar: see below.
  The Den, Bay, Forge and Altar work again when you come back, once a day. The rest are one-time finds. Gear, shield, key and repair parts are still placeholders.
- **The Altar is a terminal in the wall.** Face it (it draws in the 3D view) and `[S]EARCH` or `[G]IVE` to wake it. Its screen types a greeting (`> INPUT?`, `> ...?`, `> Hello.`) over a drifting sine wave. Offer an item or SILVER (once a day, always lost) and it answers with a face (`:)` `:|` `:(`) and the wave goes excited, easy or flat. The offering quietly shifts KURA's lean (an aligned item pulls toward its own alignment, a rarer one harder; SILVER or a plain item pulls back toward the middle). Nothing says which way.
- **`STA[N]DBY`, a third choice for the day** beside going forward and back. It spends the day's step, and the next morning's rest is deeper: another fifth of HP, party patience restored, the room cooled again, the loop cleared. A day you just don't step gets nothing extra.
- **The moon strip**: the eight phases as blocks (lit on the right while waxing) on the line above `ALIGN`, with a `.` over today's.
- **`[S]EARCH` works on a door** (and the stairs): it still finds nothing, but it counts as an action, so line 1 changes, line 3 holds, and spamming it feeds the loop.
- `[^]` has no glow. `[P]ASS` moved off the bottom border (the `P` key and the `[?]` help still have it).
- **Cheats:** `X` toggles infinite steps (and shows the room and counters under the screen), `Shift+X` jumps a day.

## v0.33 - Oct 7 2026, 16:45 HST

![v0.33](screenshots/v0.33.png)

- **Text lines hold for two turns and two seconds.** Line 3 stays on screen until KURA has taken two more actions and two seconds have passed, so fast clicking can't skip past it. Warnings (a demon, damage, a closing way down, game over) still replace it at once.
- **One loop counter.** Doing the same thing over and over is now a single count for everything (searching, turning, walking, items, fighting, talking). The old separate streak is gone. Searching a wall still counts at half. The party gets restless as before.
- **Lingering counts every action in a room**, and the trigger is now 30.
- **Dread, when KURA is alone.** Repeat the same action about 8 times and the room starts to whisper. At 15 she starts TRIPPING. At 25, something answers: ATOM SLASHER (it can't be talked to, tough and hits hard). Company keeps the dark away.

## v0.32 - Oct 7 2026, 16:19 HST

![v0.32](screenshots/v0.32.png)

- **The block moon was backwards.** Waxing is now lit on the right and waning on the left, as in the northern sky, so today's waning crescent shows its sliver on the left.
- **The fight box moved into the 3D view**, like the bag, so the party panel and map stay in sight (and `[^] RUN` and the turn buttons stay clickable under it). It has a faint empty slot at the top for art later, a `>` that points at KURA when it's your move and at the demon while its lines play, and `ROUND N` at the right end of the button row. A round plays back one line at a time; click or act to skip it.
- **`[G]IVE` replaces `[I]NVOKE` in the fight box** (`[I]NVOKE` on the bottom menu still opens the bag, and closing it from the menu now brings the fight box back). GIVE opens the gift list straight away, with `[B]ACK` to close it for free. A demon that is already fighting mostly doesn't care: it stands down rarely (under 9%, and sometimes offers to join), holds its blow about a quarter of the time, and otherwise takes the gift only to break it or throw it away and strike anyway. A gift it hates is lost the same way, and the demon stops listening. Every family has new voice lines for it.
- The blinking `[^]` and `RUN` glow less.
- VT323 now ships with the game (`fonts/`, with its license), so the page no longer loads anything from Google.

## v0.31 - Oct 7 2026, 15:01 HST

![v0.31](screenshots/v0.31.png)

- The README is shorter and punchier: what the game feels like, not how every system works.
- The fight box reads `[F]IGHT [T]ALK [I]NVOKE`: INVOKE opens the bag mid-fight (using something, then back to the fight), and RUN is gone from the box. Running is still the `[^]` step (or the up arrow) through a door.
- The LOG page (and the end-of-run log) has `[D]OWNLOAD`, which saves the log as a text file, and `[COPY]`, which copies it to the clipboard. The text includes the end-of-run stats when the run is over.
- Nothing breaks early any more: an item can't break before 10 tries (COMMON), 12 (UNCOMMON), 20 (RARE) or 40 (MYTHIC). After that each try has the same small chance as before, so a common thing lasts about 20 tries on average.
- The `[^]` step button glows more softly, and when it's spent (or facing a wall) it dims to a dark blue.
- In a fight, the way out flashes: `[^]` blinks with RUN beside it when KURA faces an open way, and the turn buttons blink when she faces a wall (turn to find a door). Nothing flashes once today's step is spent.

## v0.30 - Oct 6 2026, 20:58 HST

![v0.30](screenshots/v0.30.png)

- The `[^]` step button is drawn bigger and glows, since it's the one move of the day.
- The omen on the ceiling has carets pointing in: `> "The stone dreams of the sea." <`.
- Talking to the party is much easier on them: plain chatter only starts to wear their patience after about 7 talks each in a day (around 30 for the whole party). Questions, fiddling with junk and repeating yourself still wear on them as before.
- **ICHOR is the party's medicine.** It sits at the top of INVOKE: Enter feeds the wounded demons (about 1 ICHOR per HP; bringing back a fallen one costs three times as much). It doesn't work on KURA, who is human.
- **KURA can drink it anyway** (`[D]RINK` in INVOKE, 10 ICHOR): it heals her a little, pulls her hard toward CHAOS, unsettles the party ("PIXIE: "KURA?? Spit it OUT."", "HUMAN INTEGRITY: 97%."), and leaves TAINT, which fades a point each night. One drink gives her a buzz ("KURA can feel it in her teeth."): her blows land harder. After 3 she starts seeing things ("The walls are breathing with her.").
- **TRIP, the first status effect.** At 6 drinks' worth of taint KURA TRIPS (`KURA*` in the party panel) for 50-100 actions, or until she sleeps. She strikes twice as hard, but a third of her blows go wild and hit the party ("KURA swings at the WIRE WITCH... and hits CU SITH."), never knocking anyone out. She sometimes answers demons the opposite of what she meant, strange thoughts crowd line 3, deep finds come three times as easily, she can read binary on her own, and the TURN counter can't be trusted: it sometimes counts backwards. Coming down hard costs her a third of her HP.
- The CODEX button moved from INVOKE to the top of the LOG page (C still opens it anywhere).
- The stray `|` to the right of `[S]EARCH` on the menu bar is gone.

## v0.29 - Oct 6 2026, 20:36 HST

![v0.29](screenshots/v0.29.png)

- **The omen moved to the top of the 3D view**, centered across the ceiling. A long omen wraps onto a second row, so the walls always show. The moon panel's bottom row is back to just the `^^^` marker, and the frame under the 3D view is gone, so the screen is back to its old height.
- "The moon is day 26, waning crescent." is now one of the status reports on log line 1.
- **Things are much harder to break by hand:** about 12 tries on average for COMMON things, 17 for UNCOMMON, 33 for RARE and 100 for MYTHIC (MOON things still never break). The party's patience goes as it gets close instead: reactions are rare at first and come more and more often the longer KURA keeps at it, and the break itself costs everyone a point of patience (more for whoever loved the thing).
- Searching while facing a door has a few different replies now ("KURA checks the hinges. Old, but only hinges."), never the same twice in a row.
- **Doing the same thing over and over gets noticed.** Searching the same wall again and again, turning round and round, or searching a door: after a few repeats the party starts to say something, more often the longer it goes on, and each remark costs that member a point of patience. "PIXIE: "Are you CRAZY? What are you DOING??"", "ELF: "You have searched that wall a hundred times."", "CU SITH lies down. It knows this will take a while.", "LOOP DETECTED."
- **The party asks questions.** Talking to a member in a calm room, about 1 time in 4 they ask KURA something instead, and big `[Y]ES | [N]O` buttons appear on the right side of the log box (or press Y / N). "PIXIE: "Can I have the next shiny thing?"", "ELF: "Do you trust me?"", "CU SITH drops a bone at KURA's feet. Throw it?", "QUERY: IS THIS A TEST? Y / N". Answers change their patience (a kind answer can win some back), some lean KURA's alignment, and each gets a reply. Doing anything else lets the question lapse.
- Party remarks about doing the same thing over and over now take longer to start.
- **Demons talk before they bargain.** A demon that listens now sizes KURA up with a question or two first, each family its own way ("QUERY: ARE YOU HUMAN? Y / N", "do you have a charger? anything?", "Do you hear the wires sing too?", "Do you fear me?"), answered `[Y]ES` / `[N]O` in the fight box. Answers it likes put it in a better mood (gifts go further and it's likelier to join); two it dislikes and it loses its temper and strikes. Then it asks for a gift as before.
- Data demons sometimes slip into binary (real ASCII, if you decode it): `01001000 01001001`, and one even asks a question in it. Only a data demon in the party can read binary: with one along, each binary line comes with a translation (`01001000 01001001  [PACKET: "HI"]`); without one, it's just 1s and 0s.
- Fixed the right border of a log line sitting one cell short in the page font (an apostrophe, as in "Today's", wasn't exactly one cell wide). Each log line's text now sits in a box exactly 78 cells wide.

## v0.28 - Oct 6 2026, 20:03 HST

![v0.28](screenshots/v0.28.png)

- **About page** (`[?]` in the bottom border, or the ? key): the build number, what the game is, a few numbers from this run (floor, day, turns, alignment, demons met, items found) and how full the codex is. The full stats still only show at the end of a run.
- **SEARCH is `[S]` now** (it was A). With the NSEW buttons gone, the compass keys are retired too: the day's step is `[^]` or the up arrow, and in a fight the up arrow or R runs.
- About has a guide to every key.
- **The omen has its own frame** under the 3D view: centered, with arrows on the edges that grow inward when the omen is short (`||>  "Count the doors."  <||`). It no longer sits on log line 1.
- **Log line 1 is a status report** that changes every 5-10 actions. Mostly news ("First floor. 5 days until the way down closes.", "Day 6 on this floor. The way down closes tomorrow.", "First floor. 2 of 3 rooms surveyed. Stairs unconfirmed.", "Day 3. Party wounded."), mixed with a detached conditions readout: the air (the room's heat, as temperature), a smell, a sound or the light ("Conditions: humid. Odor of mold. Dripping, distant."). It updates right away when the heat changes, on a new day or floor, and on the last day. A fight leaves copper in the air; a break, smoke.
- One omen reworded: "The deep remembers a name. Yours...soon."
- The build number shows small under the screen's lower right corner.
- The bottom border reads `[?] [L]OG [P]ASS [R]ESET`. BACKUP is now `[P]ASS`, the run's password like old console games (copy it to keep or move the run; paste one in to continue it), and RST is spelled out as `[R]ESET`.
- **The adventure log keeps everything you read:** each day's omen, every action, everything said and done in a fight or a talk, and line 3 whenever it changes (party replies, finds, warnings). Follow-up lines sit indented under the action they belong to. Hidden numbers stay out.
- **Items can break.** Trying to use something that does nothing can break it ("comes apart in KURA's hands"), and every try is a roll: one battery survives a dozen tries, the next snaps on the first. COMMON things break 30% of the time per try, UNCOMMON 22%, RARE 10%, MYTHIC 3%, and MOON things never break. Junk is hollow, though: when a COMMON thing breaks there's a 1 in 10 chance something was inside (1 in 12 for UNCOMMON), and it pops up like a find: usually more junk, 35% of the time a RARE, 5% a MYTHIC. Breaking things has consequences:
  - **Noise.** Fiddling makes a little noise and breaking makes a lot: the room heats up, and something may "come to see what broke."
  - **Alignment.** Breaking things leans CHAOS. Breaking a LAW relic is a big CHAOS act; breaking a CHAOS relic leans LAW, like getting rid of something dangerous.
  - **The party cares what you break.** Break something a member loves (folklore: old spirit things; data and hardware: tech; hybrids: half-and-half things) and they take it hard: "ELF: "That was older than you."", "PIXIE: "You BROKE it!"", "CU SITH whines at the pieces.", "ASSET DESTROYED.", costing extra patience. Once per kind of item, one of them may stop you: "ELF catches KURA's wrist. "Not that one.""
  - **The moon.** Spirit things are more fragile under a full moon and tougher at the new moon, and things turn up inside junk more often at the new moon.
  - The codex counts how many of each item you've broken, and the end-of-run stats list items broken and how many had something inside.
  
  The party notices fiddling too: "What are you doing?", "It's not going to do anything.", and it wears on their patience like being talked at, up to snapping.
- Each changelog entry now comes with a screenshot of that build.
- The README is up to date with how the game plays now.

## v0.27 - Oct 6 2026, 19:16 HST

![v0.27](screenshots/v0.27.png)

- **A block moon** sits at the far left of the top panel, showing today's phase: lit columns fill in as it waxes and empty as it wanes, and on the page the lit part glows and slowly breathes. The phase bar shifts over to make room.
- **The day's step is the `[^]` button** above the facing letter in the 3D view: it walks KURA the way she faces (dimmed when that's a wall or the step is spent). The NSEW buttons are gone from the bottom right, which is kept free for answering the party later. The N/S/E/W keys still work, and in a fight `[R]UN` handles escaping.
- `[C]ODEX` left the bottom border; it's still in INVOKE (and on the C key).
- **The end-of-run log has the whole run's stats:** floor reached, days, turns, steps walked, searches, alignment and its hidden lean, heat (here and hottest), demons met, beaten, talked to, gifted, recruited and escaped, party talks, items found, SILVER and ICHOR, and who was left in the party.
- On a run's first day, taking the step asks twice: "GO WEST?" and then "ARE YOU REALLY SURE? This is your only move for the day."
- The fight box has a `[R]UN` button (or R): KURA runs through the door she faces, or another open one. It's dimmed when today's step is already spent.
- When the run ends, the adventure log opens by itself (after the fight box is closed), topped with where and when it ended: "THE RUN IS OVER. B2F, day 4, turn 61."

## v0.26 - Oct 6 2026, 16:02 HST

- Trying to use an item that does nothing still counts a TURN, like any other action.
- **Runs that got ahead of the real date snap back.** Old X presses (the hidden testing cheat) or a wrong device clock could push a run's calendar days ahead, and the rewind guard then locked that in. Once the page knows the real time, such a run snaps back to today once ("The calendar shudders and settles on today."), and a deadline further out than next week's Sunday is pulled in. RST always starts a run on the real calendar now.

## v0.25 - Oct 6 2026, 15:54 HST

- **The game uses the real time, not the device's.** When the page loads it asks the server for the time and goes by that, so a wrong or changed device clock can't move the game forward or back. If the server can't be reached (offline), it falls back to the device clock, still guarded against rewinding.
- **Days follow the player's own midnight.** A new run counts days in the timezone of the device that starts it: the clock, the date, the daily step and the Sunday deadlines are all local. The run keeps that timezone, so traveling mid-run can't add or skip a day. Runs started before this, and the chat run, stay on Honolulu time.
- Using an item from INVOKE shows the result on log line 2 in gold, instead of inside the INVOKE box.
- The clock shows the timezone after the time (`15:51 HST`, `EDT`, or `GMT+9` where there's no short name).

## v0.24 - Oct 6 2026, 15:42 HST

- **Talking reads the room.** When KURA talks to the party, the answer follows the room's heat: easy chatter when it's calm, then uneasy ("Lower your voice. The room is waking."), nervous ("Something keeps breathing. It isn't us."), and finally just wrong ("PIXIE tries to answer. Her voice won't come.") as it heats up. Each member answers in their own way; recruited demons in their family's voice ("MULTIPLE SIGNALS. ORIGIN: EVERYWHERE.").

- **Patience.** Party members get tired of being talked to. Each talk wears down the one who answers: after a few they get short ("ELF: "Must you?"", "RATE LIMIT EXCEEDED."), then irritated ("PIXIE sticks out her tongue."), then they ignore KURA ("CU SITH pretends to be asleep."). A night's rest gives some patience back. A dangerous room still outranks being annoyed. Keep pushing someone with no patience left and they snap: CHAOS members lash out at KURA ("CU SITH bites KURA's hand. Not hard. Hard enough."), never fatally; LAW and NEUTRAL ones leave the party ("SESSION TERMINATED.", "PIXIE: "FINE. Bye!"").
- Nervous replies are less explicit too ("MULTIPLE SIGNALS. ORIGIN: EVERYWHERE.", "WARNING: TRACE DETECTED.").

## v0.23 - Oct 6 2026, 15:31 HST

- **TALK with no demon around** talks to the party. Someone answers on line 3: PIXIE chatters, ELF is aloof, CU SITH answers without words, and recruited demons speak in their family's voice ("QUERY NOT UNDERSTOOD. RETRY?"). Now and then something that isn't the party answers instead ("A voice below counts to seven, then stops."), more often under a full moon. Alone, KURA hears only the walls, or the voice.
- INVOKE: `[ENTER] use` and `[C]ODEX` can be clicked, and what happened shows right in the box. Items with no use yet say "KURA turns the spent battery over. Nothing happens." and aren't spent.
- The minimap sits one row higher, so KURA is centered in the map box.

## v0.22 - Oct 6 2026, 15:20 HST

- **Demons ask for anything.** A demon that listens asks for a gift, and KURA picks from a list: SILVER, any item she carries, or nothing. How it reacts depends on what it gets:
  - **Taste by family.** Data and hardware demons like tech junk, hardware loves SILVER, hybrids love things that are both machine and spirit (most RARE items), and folklore likes old spirit things and hates tech. Data demons hate spirit things too.
  - **Worth.** Rarer items are worth more, and a relic of the demon's own alignment is worth extra (an opposite one, less).
  - **Reactions.** Hated gifts get thrown back and the demon attacks ("Wires and plastic? You insult me."). Too little and it keeps it and asks for more ("A crumb. Where's the rest?"), up to three times before it leaves with everything. Enough and it may offer to join; well over and it almost always does.
- **CHAOS demons are tricksters.** They rarely join, even when pleased: mostly they demand more ("More. MORE.") or run off laughing with the gift. Only a great gift sometimes wins one over.
- Giving SILVER leans KURA toward LAW; giving items leans CHAOS, or toward a relic's own alignment.
- **INVOKE opens inside the 3D view** instead of over the whole screen, so the party, map and log stay visible. Pick an item with the number keys or arrows (or click it) and a box below shows what it is and what it does; Enter (or clicking it again) uses it.
- KURA starts each run with 2-3 pieces of COMMON junk and one UNCOMMON item, so there's something to give the first demon. Very rarely there's more: 1 run in 40 starts with a RARE item and 1 in 200 with a MYTHIC ("Her bag feels heavier than it should.").
- **CODEX** (`[C]`, in the bottom border): an encyclopedia of every demon met and item found, with `[D]EMONS` and `[I]TEMS` tabs. Unknown entries show as `???`. Demon entries have the family, alignment, a line of its voice, what it wants, and how often it's been met and recruited. Item entries have rarity, alignment, which families love or hate it, and how it pulls KURA. The codex survives RST, so it fills up across runs.

## v0.21 - Oct 6 2026, 15:00 HST

- **Recruiting.** KURA is the only human; ELF, PIXIE and CU SITH are demons too, and any demon can join. TALK goes in steps: the demon decides whether to listen (moon, omen and alignment), names its price, KURA answers `[Y]ES` or `[N]O`, and once paid it may offer to join. With a full party (KURA plus 3), you choose who to send away, or keep everyone.
- **Each family speaks and bargains its own way.** Data demons talk in system messages and just want a task ("ASSIGN TASK? Y / N", "TASK RECEIVED. LINKED TO USER."). Haunted hardware speaks in corrupted memory and wants SILVER ("ERROR 404: owner not found"). Hybrids mix the two and take a SILVER toll ("ACCESS GRANTED, traveler."). Folklore speaks in old words and wants an offering from the inventory.
- **Alignments.** Every demon is LAW (data, clean machines), NEUTRAL (hybrids, haunted hardware) or CHAOS (folklore), with a few outliers. The encounter box shows how it sees KURA: "KURA is recognized." (same), "Undecided." (neutral) or "bares its teeth." (opposite). Same-alignment demons listen more and charge less; opposite ones listen less and charge more.
- **KURA's alignment moves with her choices.** A hidden score shifts with nearly every action: talking, paying SILVER and taking tasks lean LAW, as does patient searching; fighting, finishing demons off, giving offerings, running, and searching a room that's already hot lean CHAOS. Recruits pull hardest, toward their own alignment. Early choices weigh more than late ones. The ALIGN tag only flips at a threshold ("The system takes notice. [LAW]" / "The old things take notice. [CHA]"), returns to [NEU] near the middle ("KURA finds her balance."), and "Something is pulling at you." warns once when a flip is close.
- **The ALIGN tag shows each action's pull.** A bracket turns into a glowing arrow for the action that just happened: `<NEU]` pulled toward LAW, `[NEU>` toward CHAOS. Only bigger pulls show an arrow: tiny nudges like searching a cool room move the score quietly.
- **High-rarity items have alignments.** RARE, MYTHIC and MOON items are LAW, NEUTRAL or CHAOS (commons and uncommons have none), shown in INVOKE and in the found popup. Finding a LAW or CHAOS relic tugs KURA toward it; offering one to a demon pulls toward the relic's alignment, and a demon offered a relic of its own alignment is pleased and joins more often (an opposite one, less often).
- A new run now resets KURA's alignment fully.
- PIXIE, ELF and CU SITH can now also turn up as wild demons.
- Long demon names are shortened in the party panel (STATIC BANSHEE shows as S.BANSHE).
- Fixed the right border on the clock line sticking out past the rest of the frame (the weekday kanji was taking more than its two cells).

## v0.20 - Oct 6 2026, 14:35 HST

- The Japanese weekday kanji sits left of the date (`火 TUE OCT 06 2026`).
- The moon panel's marker row carries a short moon update: "The moon is day 26, waning crescent." It sits on whichever side the `^^^` marker isn't.

## v0.19 - Oct 6 2026, 14:24 HST

- The game never goes back in time: setting the device clock earlier than a day the run has already seen leaves the game on that day ("The calendar won't turn back."), so a day can't be redone and a deadline can't be dodged.
- `?` lockers are much rarer: about 1 floor in 4.
- Confirming a step is now a popup: "GO EAST? This uses today's one step." with `[ YES ]` (Enter, Y, or the same direction again) and `[ NO ]` (Esc or anything else).
- Good omens: "The halls are sleeping." (heat rises half as fast) and "The deep is generous today." (rare finds three times as likely), alongside the existing good ones for finding secrets and talking.
- Omens are always in quotes. Ordinary days get mysterious lines too ("Count the doors. Then count them again."), so every day reads like an omen; they just carry no effect.

## v0.18 - Oct 6 2026, 14:13 HST

- **Daily omens** on line 1: one per real day, seeded from the date, always true. About half are ordinary days; the rest make data or folklore demons more common, make heat rise faster, make secrets harder or easier to find, or make demons easier to talk down.
- **Heat:** every search warms the room. Encounter odds climb from about 1 in 24 per search when cold to about 1 in 4 at the hottest. Heat halves each night and never fully resets. Line 3 tells you when it rises ("Your footsteps sound louder than before." / "Something in the walls goes quiet." / "The room is listening."), and "The room settles." when it cools.
- **Noise:** searching the same wall again and again draws data demons (and data tells: a dial tone, counting, SIGNAL DETECTED); lingering in one room draws older things (wet iron, humming, salt underfoot).
- **Demon ladder by depth:** pure data near the top (PING, DAEMON, CRON, NULL, PACKET, WORM, TRACER), then haunted hardware, then hybrids (CHROME HOUND, WIRE WITCH, KITSUNE.EXE…), then folklore (REDCAP, BANSHEE, TROLL…) deeper down.
- **Rarity tiers:** COMMON, UNCOMMON, RARE, MYTHIC, MOON, each with its own color in the found box and inventory. Searches mostly turn up commons, sometimes uncommons, rarely rares. New RARE hybrids (a rune scratched into a circuit board, a rosary of fiber optic beads, a sealed jar humming faintly…). Deep caches hold MYTHIC relics; lockers hold RARE or MYTHIC items.
- **Taking the stairs down is free:** it no longer uses the day's step.
- More search misses ("Old tally marks, in groups of five."), and a true near-miss: "The wall is warmer than the others." only when that wall still hides something.
- The moon shows up on line 3 now and then. The black candle now cools the room it's lit in.

- During a fight, the directions you can run through glow white, with a `RUN?` label above them; the long explanation in the fight box is gone.
- Popup boxes close with `[ OK ]` (click it, or press Enter, Space or Esc).
- The `?` is now a hidden locker holding a rare item ("A locker holds a black pearl."). Only under a full moon can it hold a moon drop instead (half the time). Shops and special rooms behind it come later.
- New demons: half old folklore (GHOUL, ONI, KAPPA, LAMIA…), half born in the city's wires (GLITCH, STATIC, CHROMEDOG, WIREWRAITH, NEON ONI, DATAGHOUL, RUST KAPPA, BLACK ICE).
- ATOM SLASHER: a rare named demon (3% of encounters), twice as tough, hits harder, and won't talk.

## v0.17 - Oct 6 2026, 11:06 HST

- SE[A]RCH moved to the free actions on the left, since it can be used any number of times.
- The day's step buttons are spelled out: `[N]ORTH [S]OUTH [E]AST [W]EST`.
- When a search turns something up, a gold-bordered box says what KURA found (with its note) and waits for Enter, Space, Esc or a click. Holding A won't skip past it.
- Real encounters. A demon that turns up (in a wall, or wandering in) stays until it's dealt with, in a box showing its name and HP bar. Each round, choose:
  - `[F]IGHT`: everyone still standing strikes, then the demon strikes back. Beat it for ICHOR (and, under a bright moon, maybe a rare drop).
  - `[T]ALK`: it may listen and leave (sometimes with a gift), ask for SILVER, or laugh and refuse to talk again. Demons listen best at new moon and almost never at full moon.
  - Run through a door: during a fight the open directions in the menu glow red. Stepping through one uses the day's step either way; half the time KURA gets away into that room, otherwise the demon blocks the door and strikes. With the step already spent, there's no running.
- Demons hit harder under a brighter moon. If KURA falls, the run is over. Using an item mid-fight is free.
- Moving takes two presses: the first lights the button gold and asks "Use today's step to go NORTH? Press [N] again.", the second moves. Anything else, or six seconds, cancels.

## v0.16 - Oct 6 2026, 10:48 HST

- Deep caches: about one room in three hides something rare deep inside one wall, found only 1 in 35 per search. That wall can stay silent for 30, 40, 50 tries and then give.
- Moon drops: demons that fall under a gibbous moon (10%) or a full moon (25%) sometimes leave a rare item behind.
- `[I]NVOKE` (or I) opens the inventory: every item KURA carries, with counts and a short note. Press a number or click to use one; using an item is free.
- 20 more common finds, old-dungeon things (a rusted iron key, a jar of grave salt) and ruined-city tech (a dead pager, a cracked phone, a neon tube fragment, a VR visor). Just for keeping, each with a short note.
- Usable for now: a vial of medicine (heals everyone by a third), a strip of prayer cloth (raises fallen allies a little), a stub of black candle. Keepsakes and rares can be looked at but not used yet.

## v0.15 - Oct 6 2026, 10:31 HST

- Demons can kill. Every demon fight (hidden or wandering) can drop party members to 0 HP, and if KURA falls, the run is over. A night's rest heals a fifth of everyone's HP.
- SEARCH works on the wall KURA faces. Each wall has its own hidden things (the stairs are always behind the wall they open in), so turn to try another wall. Doors can't be searched, and SE[A]RCH dims while facing one.
- The look controls are spaced out: `[<]  W  [>]`.
- Party rows give names one more column and fit three-digit HP and MP (`KURA     L99 999/999 450/999`).
- The adventure log records every action now: steps, every search (empty ones too), turns, walls and new days, each tagged with its day and turn (`D005 T012  KURA turns to face NORTH. Bare stone.`). It keeps the last 20,000 entries; a BACKUP code carries the last 300.
- Turning now says what KURA sees on line 2: "KURA turns to face WEST. A warped door in its frame." Only what the 3D view already shows (wall, door, or found stairs), in a few different words each.

## v0.14 - Oct 6 2026, 10:17 HST

- Search lines no longer show a try count ("KURA searches. Nothing.").
- The third line drifts: besides changing with each step and new day, it has a chance to change after any search or turn, so it isn't frozen all day.
- The third line has more to say: party chatter ("PIXIE hums an old song, off key."), how hurt members are holding up ("CU SITH is breathing hard."), demon sounds that grow more common under a bright moon, and ambient sounds. Faint clues still turn up now and then.
- The controls under the 3D view only look around now: `[<]` and `[>]` (and the left/right arrow keys) turn KURA, and `[^]` is gone. Moving is only `[N] [S] [E] [W]`.
- The minimap shows which way KURA faces with an arrow beside her room: `[@]>` east, `<[@]` west, `^` above for north, `v` below for south. It covers the door mark on that side.

## v0.13 - Oct 6 2026, 10:00 HST

- Anyone can play on the page: each player's run is saved in their own browser and saves itself after every action. A first visit starts a fresh run. No accounts or tokens.
- `[L]OG` shows the run's adventure log, newest first: every step, find, new day and descent. Empty searches are left out.
- `[B]ACKUP` shows the run as a save code to copy. Pasting a code restores that run, for backups or moving to another device.
- `[R]ST` asks before ending a run. LOAD is gone; the repo's `save.json` is now only the chat run (`/smt-screen`).

## v0.12 - Oct 6 2026, 10:00 HST

- Days follow the real calendar (Honolulu time). The day's step comes back at midnight, DAY counts real days since the run began, and the map header shows today's real weekday.
- Each floor's way down closes at the end of a Sunday. A new run's first floor closes this Sunday (or next Sunday if fewer than 3 days are left). Taking the stairs early gives bonus days: the next floor closes the Sunday after next.
- On the last day, the third line warns that the way down closes tonight. Miss the deadline and the run is over.
- NE[X]T is gone from the screen. The X key still jumps the game a day ahead, as a hidden testing cheat.

## v0.11 - Oct 6 2026, 09:48 HST

- One step per day. `[N] [S] [E] [W]` take the day's step through the door on that side (or down the stairs once found), and dim once used. Turning and the free actions are unlimited.
- Searching works like NetHack: unlimited, but each search has only a small chance (1 in 5) to turn up the room's next hidden thing, and an empty room never answers. The log counts the tries ("KURA searches (12). Nothing."). Each search also risks a wandering demon, rare at new moon and common at full moon.
- New bottom menu: free actions on the left (`[F]IGHT [T]ALK [I]NVOKE`, not built yet; INVOKE replaces SUMMON), daily actions on the right after a divider. ITEM, MAGIC, COMP, EQUIP and GO are gone; `[^]` under the 3D view still steps forward.
- `NE[X]T` (key X) ends the day, standing in for real midnight. After the 7th day on a floor without taking the stairs, the run is over.
- The map header shows the floor's weekday, MON to SUN (`MAP  B3F  WED`). SUN is the last day to find the stairs. For now it follows the floor's day count; later a floor will start on a real Monday.
- STEP on the bottom line is renamed TURN, to match DAY. It still counts every action: steps, searches and turning.
- Keys: N S E W step, A search, arrows turn and step forward, X next day, L load, R reset.

## v0.10 - Oct 6 2026, 09:25 HST

- New minimap symbols, one per room: `[@]` KURA, `[^]` the way up, `[v]` the stairs down once found, `[?]` the lure, `[ ]` a visited room. Doors are `=` between rooms side by side and `‖` between stacked rooms. The facing direction lives in the turn controls and FACE instead of the map.
- The saved game's map is redrawn in the new style.
- `[^]` (GO) into a wall now stops with a message like "KURA walks into solid stone." No day is spent, and KURA no longer spins to the next door.
- The end of the week is now deadly: if the stairs aren't taken by the 7th day on a floor, the next action ends the run. The party falls to 0 HP, the view goes dark, and only RST starts over. (This replaces the old placeholder that dropped KURA to the next floor.)
- The three log lines each have one job. Line 1 (moon and demons) changes once per real day. Line 2 describes KURA's latest action: moving, searching, turning, walking into a wall. Line 3 is flavor, with the occasional faint clue, and changes when a day passes.
- FACE on the bottom line is replaced by STEP, a count of every action KURA has taken: GO, SEARCH and turning (`STEP 012`). Bumping a wall doesn't count.

## v0.9 - Oct 6 2026, 09:15 HST

- Turn controls at the foot of the 3D view: `[^]` walks forward, `[<]` and `[>]` turn, and the letter between them shows which way KURA faces. Click them or use the arrow keys.
- Turning writes "KURA turns to face EAST." (free, no day spent), so direction words show up in actions as well as movement.
- The "[L]OAD returns to the saved game" note under the screen is gone.
- The first log line is now a mysterious word on the moon, the demons or both ("Demons drowse in the corners.", "The moon is a white eye, wide open."), with no phase number since the moon bar shows it. Five versions per phase, changing with each new day.

## v0.8 - Oct 6 2026, 08:16 HST

- The save status moved into the bottom border (`SAVED 2026-10-06` or a gold `NOT SAVED`), so all three log lines are free for the game.
- Log lines only name a direction when stating a character's action, such as "KURA goes WEST into a new room". Doors and hints never give a direction away; the map, the room view and FACE show where things are.
- Doors are only counted when KURA first searches a room ("A single door." / "Two doors.").
- Turning no longer writes a log line. After GO or SEARCH, the third line is atmosphere. About half the time it carries a faint clue about the room or the door KURA faces (a hollow floor, a cold draft, a glint), never a direction.
- The save status shows for a few seconds after loading or playing, then fades back into the border.
- The clock's colon blinks more slowly.

## v0.7 - Oct 6 2026, 08:02 HST

- The clock is live: the colon blinks every second and the time changes the moment the minute turns over.
- The minimap is centered on KURA: her room stays in the middle and the floor moves around her.
- The README links to the playable page.

## v0.6 - Oct 6 2026, 07:53 HST

- The game now plays on real floors. The minimap, the room view and the second log line all follow KURA.
- `[G]O` (or the up arrow) walks through the door KURA faces, or down the stairs once they're found. Facing a wall, GO turns to the next way out instead. The left and right arrows turn KURA. Turning is free.
- `SE[A]RCH` (or A) turns up the next hidden thing in the room: demons (damage and ICHOR), items, SILVER, the `?` or the stairs. A room with nothing left can't be searched.
- GO and SEARCH each use up a day. NEXT picks a day's action by itself, as a testing shortcut.
- If the week runs out without finding the stairs, the floor gives way and KURA falls to the next floor (a placeholder rule).
- RST starts a new run on a fresh B1F.
- MAG is now ICHOR.

## v0.5 - Oct 6 2026, 07:43 HST

- Floor generation in the new `floor.js`. Each floor is 3 rooms in a 3x3 grid, joined by doors in a line or an L. KURA starts in the up-stairs room.
- The stairs down are hidden in one of the other rooms. Every room hides 1-3 things (demons, items, SILVER, the stairs, sometimes the `?`), and searching turns them up one at a time. Walking straight to the stairs room and searching it always fits in the 7-day week.
- Most floors have a `?`: a shop, special room or rare item, shown in the dark until it's found.
- New minimap for floors: only rooms KURA has been in are drawn, as `[   ]`, with doors `╫` (side by side) and `═` (stacked). Floors aren't wired into NEXT or the save yet.
- MACCA is now SILVER.

## v0.4 - Oct 6 2026, 06:57 HST

- `[N]EXT`, `[L]OAD` and `[R]ST` buttons in the bottom border of the page. Click them or press N, L or R.
- NEXT rerolls a placeholder room (random map, room view, HP/MP, MACCA, MAG) and RST starts a new run. Both happen only in your browser and are never saved; a `NOT SAVED` note shows until you LOAD.
- LOAD reloads the saved game from GitHub.
- Random rolls live in the new `rules.js`.

## v0.3 - Oct 6 2026, 06:42 HST

- New fog-of-war minimap: visited rooms are `□`, unexplored rooms stay hidden, and a lone gold `?` waits in the dark (a lure, not the exit).
- Stairs: `⋰↑` up, `↓⋱` down.
- Text is soft white instead of green-tinted, KURA's arrow is pure white, and the screen is slightly bigger on computers.
- Map symbols are boxed to exactly one character so the right border stays straight in any font; plain characters like `?` and the arrow use the retro screen font.

## v0.2 - Oct 6 2026, 05:59 HST

- MACCA and MAG share one line; the party panel uses the full width.
- KURA is drawn on the minimap as an arrow showing the facing direction (`^ > v <`), and the bottom line reads `ALIGN [NEU]  FACE E  DAY 004`.
- The page refreshes once a minute and picks up new saves without reloading.

## v0.1 - Oct 6 2026, 05:43 HST

- First screen on the web: an 80-column Shin Megami Tensei-style dungeon screen drawn from `save.json`, with the live Honolulu date, time and moon phase.
- The same drawing code (`screen.js`) is used by the web page, the `/smt-screen` chat command and the morning screen.
