# Daily Dungeon: detailed changelog (internal), v1.01 down to v0.75

An older part of the detailed changelog, moved here from `CHANGELOG.md` unchanged. Newest first. NOT for the public repo.

## v1.01 - The House Rolls - Oct 11 2026, 17:15 HST

![v1.01](screenshots/v1.01.png)

Game commit `41d7581`; bots `9366e68`. **Needs the Worker redeployed** (`worker.js` only; no schema change). Folds in the v1.00.2 changes, which were never pushed on their own.

- **The Worker picks the thing (option A).** `/eco/find` keeps the claimed tier but rolls `crypto.getRandomValues` over that tier's catalog for which thing it is, stores that, and returns it as `name`.
  - **Page:** `ecoScan` renames the bag's copy (and `ecoSeen`, and the log line that named it). `foundBox` waits for pending finds (`ecoWait`), at most 1.2 s, then shows the Worker's pick. A stashed MOON thing is listed as "(kept in the stash)".
  - **Bots** rename the same way, so the next `/eco/mine` doesn't count the renamed thing as gone.
  - A cheater can still claim that a find of a tier happened, but can no longer choose which thing.
- **Tighter limits.**
  - Per key a day: RARE 3 / MYTHIC 2 / MOON 1 (was 4/2/1). Per sender a day: RARE 6 / MYTHIC 3 / MOON 2 (was 8/4/2).
  - New: at most 2 MOON finds a lunar month per key and 3 per sender (`ECO_MOON_MONTH`, counted from `epochStart()`).
  - Refusals say "enough today" / "enough this moon"; the find stays a plain local item.
- **Exchange window.**
  - **Header:** "EXCHANGE   Offers close end of quarter (Nd)", falling back to "Offers close end of quarter" when the days don't fit (43 columns).
  - **Loading:** until the market first answers (`ex.loaded`), the list shows "..." in its place. Before, an extra "..." line sat over "Nothing on offer right now." (said before the answer came), and everything moved up when it went away.
  - **STASH tab:** empty reads "Special things go here."; the withdraw prompt and a used cap ("This quarter's one from someone else is used.") no longer name MOON. The cap text is swapped on the page, so the Worker's own message is not shown.
- **Room names:** a dead end with no kind takes `NAMES_BY_KIND.exchange`: Exchange, Xchange, Trade floor, Market end, Ticker room, Trading gap, Swap room (Bourse and Trading pit tried and dropped). A dead end named "Dead end"/"Sealed end" before v1.00 is renamed from this list.
- **The wall screen's arrow** (`EXW.up`) re-evaluates every 20 beats (about 2.2 s), comparing now with six steps back, and keeps its way on a tie. Before, it followed each step.
- **Breath bar** (`screen.js`): `PHASE`'s moon shapes are no longer used for it. It is `▓` + `█`×n + `▓` over columns 3-22 (20 wide), closing in up to 10 columns a side (`shut = round((6 - breath) / 6 * 10)`), and what is left keeps a `▓` at each end. The dot above still marks today's phase. On the page, row 21's strip is wrapped in a span nudged `left: .65ch`: measured, the bar's middle sat 5 px (about two thirds of a column) left of the panel's, and now matches it to the pixel.
- **`VERSION`** to v1.01.
- **Testing (light):** the Worker's pick and the new limits on a local SQLite copy (MOON claims came back as other MOON things; a key's third MOON find in a month refused; a fourth RARE in a day refused); the page parses; Chromium screenshots of the exchange window, the room name and the bar, no page errors. Not checked: the found box's wait against the live Worker, the bots' renaming.

## v1.00.1 - Where the Moon Things Go - Oct 11 2026, 16:55 HST

![v1.00.1](screenshots/v1.00.1.png)

- **The stash line** (`ecoScan`, when the Worker counts a MOON find and it leaves the bag) read "... goes to the stash. [E]XCHANGE keeps it." from before the exchange moved into the dead ends and lost its button. It now reads "... goes to the stash. The exchange screens keep it." (76 columns at the longest name, "A shard of pale moonlight"). A stale `[E]XCHANGE` code comment renamed too. Commit `384721a`. No Worker change.
- **`VERSION`** to v1.00.1. **Testing (light):** the line on the run screen in Chromium, no page errors.

## v1.00 - 100 - Oct 11 2026, 16:42 HST

![v1.00](screenshots/v1.00.png)

Live presence and the exchange (the player economy). Game commit `42515ad`; bots `716f464`. **Needs the Worker redeployed** with the new `schema.sql` run against D1 and `BOTS_PUBLIC = "1"` added under `[vars]` in the dev's own `wrangler.toml`.

- **Live presence.**
  - **Page:** `pingLive` sends `/here` every 3 min (`LIVE_EVERY`) only while a run is on screen, the tab is visible and a key or click came in the last 10 min (`LIVE_IDLE`); checked every 30 s and on `visibilitychange`. The daily ping is unchanged and writes the same row.
  - **Worker `/here`:** a known id costs one row read and is rewritten only when its level changed or it is 2+ min old (`PRESENCE_WRITE_GAP`). Only a new id pays for the 40-ids-a-day sender check (now indexed, `present_who_idx`) and the 60-day cleanup.
  - **"Right now"** = `at` within 300 s, ids not starting `bot`, worked out at most once a minute per Worker instance (`liveNow`, in memory) and returned by every `/here` reply and by `/feed` as `here.now`. Bots keep counting in the daily totals.
  - **Title cards** (plain): `In the pit right now: N`, `On B3F right now: N`.
  - **Typed line** (sentences, `PRESENCE.nowMine` / `todayMine`): four wordings for right now and two for today, rotating every 10 min, small numbers spelled out, her own device not counted ("Three others are on this level with you.").
- **The key:** `ddd.key` in localStorage (48 hex), copied into every save as `save.key`, so the password carries it. A loaded password's key becomes the browser's; the REPLACE THIS RUN box says so when it differs. The PASSWORD box warns "whoever has it has your stash". The Worker keeps only `SHA-256(key + ":daily-dungeon-exchange")`.
- **Finds (`/eco/find`):**
  - `ecoScan` (on every save) diffs RARE/MYTHIC/MOON names in the bag against `save.ecoSeen` and posts each new one; a new run (`ecoRun !== runId`) starts counting from its kit.
  - **Limits:** per key per UTC day RARE 4 / MYTHIC 2 / MOON 1; per sender (IP hash) RARE 8 / MYTHIC 4 / MOON 2; MOON only at moon phases 3-5; at most 5 new keys a day per sender. Bots skip the sender limits.
  - An accepted MOON find goes straight to the stash and leaves the bag ("... goes to the stash. [E]XCHANGE keeps it."). Refused or offline finds stay plain local items. Cheated runs send nothing; a dead run sends `/eco/end` once.
- **Ledger (D1):** `eco_owners`, `eco_items` (states `bag` / `stash` / `escrow` / `gone` / `dead`), `eco_offers` (open / taken / cancelled / closed / dead), `eco_retired`.
  - A key has one run at a time; a request from a new run retires the old (bag things die, offers die, an escrowed MOON thing goes back to the stash). A retired run is refused.
  - `/eco/mine` takes the bag's names and marks ledger bag things no longer in the bag as `gone`; returns stash, bag, open offers, deliveries (`fresh`), news of taken offers, `moonCap`, `quarterEnd`.
- **Offers:** one thing, asking `""` (gift), `tier:X` or `name:...`; codes `XXX-XXX` from a 31-letter alphabet, typed loosely (case and dash ignored).
  - At most 3 open per key.
  - **Close strictly at quarter end** (`ecoQuarter`, the same math as `quarterOf`). The thing comes back: MOON to the stash, the rest to the run's bag if that run still lives, else it dies.
  - An offer dies with its run (rule A: a RARE/MYTHIC in an offer is lost like the bag).
  - Taking moves the offered thing to the taker (MOON to the stash, else into the run's bag) and the payment to the maker the same way (a delivery to their run).
- **MOON cap:** `withdraw` (stash to run, one-way, the thing leaves the economy for good) is limited to one MOON thing a quarter that someone else found (`eco_owners.moon_q`). Own finds are not capped.
- **Bots:** `BOTS_PUBLIC = "1"` puts bot offers in everyone's market and lets bots take players' offers (all anonymous). `"0"` keeps them to a bots-only market the admin key can see (X inside the exchange window asks for the admin key without turning the testing cheats on).
  - `bot.js` gives each bot an exchange key, reports finds, picks up deliveries and trades by temperament (`TRADE`), with a new Exchange column in SUMMARY.md.
  - Bot presence ids start `bot`. The summary header names the pinned/latest versions and the newest real turn on file.
- **The exchange room:**
  - **The wall:** every dead end with no kind (`exchDir`: not a door wall, not the stairs wall, `(seed + i*13) % free`) has a screen in one wall, view end `exchange`. `walls()` hides nothing there.
  - **Older dead ends:** a dead end laid out before v1.00 that still hides something behind that wall searches normally until it's empty (`exchHere`).
  - **Opening:** SEARCH or [^] at it is free, even out of breath, with the lead "KURA reaches for the screen" and the log "KURA touches the screen. The market wakes." The rules set `st.exchangeOpen`; the page opens the window.
  - **The wall screen:** 27 by 7 with two slots under it. Its inner cells are drawn as U+2800 and swapped by the page for `EXCHANGE ^/v  N ON OFFER` and a 4-row market line.
  - **The market line** is a random walk (`EXW`, a step every 3 beats of 110 ms), decoration only. The window shows the same line, 3 rows, under a right-to-left ticker of the market's offers (one letter every 220 ms).
- **The window:** tabs MARKET / YOURS / STASH / CODE, as INVOKE's box (43 columns of text). [ESC] leaves. The bottom bar has no exchange button and no E key.
- **Bonus room and THE VOID** now take a wing's passage (`floor.js` `bonusSlot = P`), never the dead end and never the stairs wing.
- **Title feed:** `market` in `/feed` (newest 3 public offers, last 3 trades, open count). Cards: `MARKET: a moonstone, for any RARE. Code K7Q-2MX`, `Traded: x, for y`, `Given away: x`. They also ride the typed line's news.
- **`VERSION`** to v1.00.
- **Testing (light):**
  - The Worker on a local SQLite copy (29 checks: finds and limits, gifts and swaps by code, deliveries, the MOON cap, the bot market, quarter-end closing, retired runs).
  - In Chromium with that Worker: a find, a swap, the stash, a withdraw and the other side's delivery.
  - The dead-end screen and window opening.
  - Live pings with a fake clock.
  - Not checked: the bots' trading against a real Worker, other browsers, a full run.
- **Known softness:** the page still decides what a find is; the Worker only decides whether it counts (forged finds are capped by the limits, not stopped). Worker-rolled finds are planned for v1.01. A cheater's save can still use a thing locally and keep it locally; nothing in the ledger is created or doubled.

## v0.99.4 - One Line for the Moon - Oct 11 2026, 13:45 HST

![v0.99.4](screenshots/v0.99.4.png)

- **`levelBones` drops the floor row above the moon line** (the LEVEL line under the frame already shows it, as the dev noticed). The heading is the one moon line, pinned to the second row from the foot of the 8-row panel with a blank row under it (`8 - rows.length - 2` filler rows, then the line, then ""). The branches below the line stay one row deep from v0.99.3 (the dev chose to keep them). Net effect: one more blank row between the line of days and the heading than in v0.99.3.
- **`VERSION`** to v0.99.4. **Testing (light):** `renderTitle` for 1,772 days (about 60 lunar months) with the strict 80-column check, the line on one row with a blank above and below each time; a Chromium screenshot, no page errors. Not checked: other browsers.

## v0.99.3 - Room Below the Moon - Oct 11 2026, 13:40 HST

![v0.99.3](screenshots/v0.99.3.png)

- **`levelBones` keeps a blank row under the two heading lines** (the dev wanted one open row between the moon line and the rule below). The drawing used up to 6 of the panel's 8 rows (4 above and including the line, up to 2 below), which left none, so the branches **below** the line are now always one row deep with no twig (`put(y0 + 1, x + 1, "\\")` then the `_` run at `y0 + 1`); the rolls (`h`, `twig`, `t2`) are still made, so the branches above the line are unchanged and no player's shape moves above the line. The drawing is now at most 5 rows; the filler is `8 - rows.length - 3` blank rows, then the floor, the moon line, and one blank row, so the heading is on the same row every day. Commit follows v0.99.2's `6be62be`.
- **`VERSION`** to v0.99.3. **Testing (light):** `renderTitle` for 1,772 days (about 60 lunar months) with the strict 80-column check, the heading on one row with its blank row each time; a Chromium screenshot, no page errors. Not checked: other browsers.

## v0.99.2 - Two Lines for the Moon - Oct 11 2026, 13:35 HST

![v0.99.2](screenshots/v0.99.2.png)

- **`levelBones`'s heading is two rows pinned to the bottom of the left panel (8 rows under the wordmark):** ` B3F` (left-aligned, one column in), then `2nd QTR - 上弦 WAX HALF - Lunar Days 9-15`, a fixed 43-column block centered (name padded to 9, days to 5, so "- Lunar Days" lines up for every quarter). Names are now NEW MOON / WAX HALF / FULL MOON / WANE HALF (was the long forms), prefixed by `1st`..`4th QTR`. Blank rows between the drawing and the heading fill to keep the last two rows fixed; before, the heading moved up a row on days with no lower branch (86 of 1,182 days tried). Tried and dropped: a one-line heading (49 columns against the 47-column panel; dropping a space or the comma was too cramped).
- **`VERSION`** to v0.99.2. **Testing (light):** `renderTitle` for 1,182 days (about 40 lunar months) with the strict 80-column check, the heading on the same row every time; Chromium screenshot of the 2nd quarter, no page errors. Not checked: other browsers.

## v0.99.1 - The Twenty-Sixth Night - Oct 11 2026, 13:10 HST

![v0.99.1](screenshots/v0.99.1.png)

- **`PKANJI`'s last entry is 二十六夜** (was 有明月, which the dev found has no dictionary entry; 十三夜 and 十六夜 were confirmed there). 二十六夜 is the traditional night-count name for the waning crescent (the 26th-night moon vigils, 二十六夜待ち; ja.wikipedia 月待塔). Header reads `LUNAR DAY 25/29  二十六夜 WANE CRESC`; the strict width check passes for all frames. `VERSION` to v0.99.1.

## v0.99 - Moon in Kanji - Oct 11 2026, 13:00 HST

![v0.99](screenshots/v0.99.png)

- **The header (`headerLines` in `screen.js`) reads `LUNAR DAY d/29  <kanji> <PHASE>`** instead of `MOON  n/8  <PHASE>`. Commit `dc3b577`. No Worker change.
  - **Day:** new `epochDay(now)` gives the day of the lunar month (1 to 29; the 29.53-day month rounded down to a steady 29, as the title's EPOCH line already did) and `epochLine` now uses it, so the header and the title cannot disagree. "LUNAR DAY" is exactly as long as the old "MOON  DAY", so nothing else on the row moved. The reason: the old `0/8` was the phase number (0 = new) and sat beside the title's "day 1 of 29" and "Lunar Days 1-8", which read as a mismatch.
  - **Phase kanji** (`PKANJI`): 新月, 三日月, 上弦, 十三夜, 満月, 十六夜, 下弦, 有明月, indexed by `moonIndex`. Picked with the dev from a table they supplied (新月 shingetsu, 三日月 mikazuki, 半月 hangetsu, 満月 mangetsu), with 上弦 and 下弦 for the two quarters so each has its own word, and the traditional night-count names (十三夜 and 十六夜 for the gibbous phases, 有明月 for the waning crescent) for the three the table lacked. Those last three are to be checked against a source. The dev's first paste had 親月 (a typo for 新月) and called 上弦 and 下弦 crescents; the header names 上弦 as the first quarter and 下弦 as the last. (A quarter-of-the-month kanji for the header was built and dropped: next to a phase name it read as a contradiction on days like 8 and 21.)
  - **Width:** each kanji is one character but two columns, so the header's padding subtracts the kanji's length; `finishFrame` (strict in node) passes for every phase across two lunar months. Three-character names fit with room to spare.
- **The title's heading names its quarter in kanji** (`levelBones`): `B3F - 上弦 First Quarter - Lunar Days 9-15`, using 新月 / 上弦 / 満月 / 下弦 for the four quarters. The heading is one fixed-width block (name padded to 13, days to 5, then centered by columns with the new `colsOf`), so "- Lunar Days" starts in the same column (28) for all four quarters. `renderTitle` pads the left panel's rows by columns now, not characters.
- **Kanji at 80%** (`.kanji .g { font-size: 0.8em }`): the weekday, the phase and the quarter. The box stays two cells wide, so the frame is unchanged. The page wraps every CJK character on the title (`/([一-鿿])/g`) and in the header, not just the weekday.
- **`VERSION`** to v0.99. **Testing (light):** the title and header for every phase and quarter in node (the strict width check), and in Chromium for a waxing gibbous day, no page errors. Not checked: a full run on every phase, other browsers or fonts (the kanji fall back to the system's Japanese font; the sandbox's was Noto Sans JP).

## v0.98 - Short of Breath - Oct 11 2026, 12:40 HST

![v0.98](screenshots/v0.98.png)

- **Mashing while out of breath lengthens the wait** (`rules.js`, `index.html`). Commit `8c9e73d`. No Worker change.
  - **Rule:** every refused try (a search, a step into another room, using the bag; never a fight's bag use, which is never refused) calls `nudgeBreath`, which moves `st.breath.at` back `BREATH_NUDGE = 500` ms, to at most `BREATH_NUDGE_MAX = 10000` ms past `now + BREATH_WAIT`. So the extra is capped at ten seconds on top of the usual wait (the usual wait from empty is about 12 s: the 2 s hold plus 10 s to climb from 0 to 1, so the worst case is about 22 s). The two clamps in `breathNow` and `breathNext` (`Math.min(b.at, now + BREATH_WAIT)`, which stopped a jumped-back clock stranding her) were loosened to allow it.
  - **Held keys count once:** `RULES.holding(e.repeat)` is set around `act(k)` in the keydown handler; a repeat press is ignored by `nudgeBreath`. Clicks on buttons always count.
  - **Tested** in the browser: timer 11.3 s then +0.5 s a press (less the 0.25 s between presses); one press plus eight repeats adds one nudge; thirty more presses stop at about 21.9 s. The bots wait out their breath rather than press on, so they are not affected.
- **The marker over the breath bar counts the breath the other way** (`renderScreen` in `screen.js`, `colorizeTitle`'s row 20 in `index.html`). One dot when `breathNow > 4`, two for 1 to 4, three (". . .") when under 1 (out of breath, the same moment the timer shows). The first dot stays at the old single dot's column (`1 + 3*idx + DOT`) and the others follow to its right, two columns apart. The page's half-column shift for the quarter phases now applies to every dot (`/\./g`).
- **Search lines:** the opening is `KURA searches the SOUTH wall...` with three dots typed one at a time and no spaces (was ` . . .`), the result follows on the same line (`... A TRACER wanders in!`), and the heading the page splits the result from (`/^> KURA (searches|scries) the [^.]+\.+/`, in the beat code and in `colorizeTitle`) takes the longer run of dots. `rules.js`'s `where` is `...`; the short form is `KURA searches NORTH... text`; scrying the moon or sky ends in `...` too. Door listening still shows only its result.
- **The `>` and `<` on the breath bar** (shown for a second after a search) were covered by the bar's blocks, which are drawn 1.3x wide. They are now `.mk` spans (`position:relative; z-index:1`), the `>` nudged 0.25 ch left and 1 px up and the `<` 0.5 ch + 2 px right and 1 px up, so they clear the bar, sit level with each other and have the same gap on each side.
- **`VERSION`** to v0.98. **Testing (light):** the run screen in Chromium, no page errors; not a full run, not other browsers.

## v0.97 - Plain Words - Oct 11 2026, 11:59 HST

![v0.97](screenshots/v0.97.png)

- **The `[?]` page (`showAbout` in `index.html`) has a new intro and a boxed THIS RUN.** Commit in the game repo (see its log). No Worker change.
  - **Intro:** the dev wanted the old paragraph ("Each level is four wings. Three times, two locked doors offer two rooms... dead ends hold the big clues") to explain less. Now seven lines: "A dungeon crawler you play on the real lunar calendar." / you wake at the bottom of a pit and the dark rises with the moon / everyone shares the same floor, each floor closes when its quarter of the moon ends, find the stairs / the moon and the demons are real, some talk, some fight / search all you like, but be careful digging too deep / "Come back tomorrow." Wording went through several rounds: "one key a day" and "one door a day" were dropped from the first line because they sit oddly beside "climb" (a run only climbs once a level closes); "about a week", "KURA" (now "you") and "some are lying" were cut.
  - **THIS RUN** is a box in the page's frame characters (`framed()`: `+- THIS RUN ---+`, `|` rows, `+---+`), 71 columns like the divider. The rows are the same `two()` lines as before.
- **`VERSION`** to v0.97. **Testing (light):** the page with a run open (no errors, all box lines 71 wide); the title and run screens untouched.

## v0.96 - Crescent Over the Gate - Oct 11 2026, 11:40 HST

![v0.96](screenshots/v0.96.png)

- **A fixed waxing crescent on the title screen** (`screen.js` `renderTitle`, `index.html` `colorizeTitle`). Commit `e12aa13`. No Worker change.
  - **Art:** seven rows by thirteen columns of `▀ ▄ █ ▓` (lit on the right, the northern-sky waxing side the header's moon box already uses), generated once from a disc minus an offset disc at the screen's real cell shape (a column is about 0.38 of a row), then hard-coded as `CRESCENT`. The two cells along the inner edge of each row are the lettering's own dotted block `▓`.
  - **Layout:** the moon, a three-column gap and the 56-column lettering sit as one group in the 78-column band (`CRES_COL = 3`, so the lettering moves right by 19); the two lettering lines are still centered on each other. The moon takes banner rows 1 to 7 (`CRES_ROW = 1`), the rows the lettering fills. `SMT.CRES` (`w`, `row`, `col`, `rows`) tells the page where it is.
  - **Page:** the moon's cells get `.cres` (the moon blue, flat). The dotted ones are also `.wm`, boxed like the lettering's own. No glow and no animation (the header box's `.lit` breathes; this does not), so the dots are exactly the lettering's dark.
  - **Same every day.** The phase-following version (new, full and the rest, each with its own art) was offered and left for later.
- **Also:** `VERSION` to v0.96. The header and banner images (a larger header and a 1920x480 itch banner of the crescent beside the lettering) are not in the repo.
- **Testing (light):** the title renders with no page errors and every line still passes the 80-column check; a screenshot at 1000x760. Not checked: a full run, other browsers.

## v0.95 - The Locked Drawer - Oct 11 2026, 10:51 HST

![v0.95](screenshots/v0.95.png)

- **The X testing cheats ask for the admin key.** Commits `270d6ad` (game) and `432d050` (Worker). **Needs a Worker redeploy** (worker only; no schema change).
  - **Page (`index.html`):** `X` (infinite steps) and `Shift+X` (the clock a day ahead) go through `adminGate()`. It reads `dd-admin` from `localStorage` (the same slot the board's delete uses) and asks the Worker `GET /admin` with it. A right key keeps the cheats unlocked for the page load (`adminOK`); a missing or rejected key shows `prompt("Admin key:")`, a wrong answer shows "That key was not accepted." and the key is dropped; no answer from the Worker shows "Could not reach the board." A right key is stored. Until the Worker is redeployed the check 404s, so the keys fail with "not accepted".
  - **Worker:** `GET /admin` (header `x-admin-key`): 200 `{ok}` when the key equals the `ADMIN_KEY` secret and the page's origin is allowed, otherwise 403. No attempt limit, so the key should be long.
  - **Cheated runs are marked.** `st.cheated` is set by `freesteps()` (when turned on) and `next()`. It stops the score post (the page's `submitScore`, and the end page shows "THIS RUN USED A TESTING CHEAT AND CAN'T BE POSTED." in place of the post button) and suppresses events and the presence ping, as infinite steps already did. It is page-side: a direct POST to the Worker is still possible, as it always was.
  - **Old saves:** on load and each tick, with no unlocked admin, a save with infinite steps still on has it switched off and the run marked (`sweepCheats`); a leftover clock offset marks the run and stays until reality catches up, as before.
  - **New run (`reset`):** the flag is cleared, unless infinite steps (the one cheat that carries over) is still on.
  - **Deleting a board row** (`D` in the board) still needs X mode and the key; it now has the key stored from unlocking.
  - **Bots** are unchanged: they call the rules directly and never use the cheats.
- **Testing (light):** the Worker's `/admin` with a fake environment (right key, wrong key, no key, another website, no secret set); browser checks with a mock Worker of a wrong key, cancel, the right key, the same session (no second prompt, `Shift+X` moves the clock), a reload (silent re-check), and a stale stored key (asked again); a cheated dead run (no post button, the message) against a clean one (post button); and `reset`'s flag. Not checked: Firefox, and the real Worker (not redeployed when this was written).
- **Also today, no game change:**
  - `README.md` rewritten for the wing-based game (`83ce1f4`).
  - **Bots are off the board** (`584675b`, Worker): `/top`, a player's rank and the "names carved" count skip names ending in `-bot`; their scores still feed the season, counters, deepest and last fall, and their events and presence are untouched. A person named "...-bot" only hides themselves.
  - **itch.io:** `ALLOW_ORIGIN` also lists `https://html-classic.itch.zone`, the host itch serves the HTML5 build from. A score posted from the itch page ranked 8th.
  - **The itch build is a separate zip, not the repo's files:** `index.html` carries VT323 loaded from bytes with the FontFace API (a Firefox extension that blocked fonts had broken the page's font file, which is what first looked like an itch problem), and the testing cheats are blocked outright (`X` and `adminGate` return at once: no prompt, no admin request). Every itch zip needs that lock.
- **No new design-doc changes yet** (the doc is only updated on request).

## v0.94 - The Name in Lights - Oct 11 2026, 09:15 HST

![v0.94](screenshots/v0.94.png)

- **Wordmark in block letters, full width** (`screen.js` `renderTitle`). Commit `0ab1a92`. The dev pasted their own lettering for DAILY DIGITAL / DEMON DUNGEON (44 and 54 columns wide; the left panel is 47). Tried first as a mockup with the gap closed to one space and the wide line overlapping the frame bar and the divider: rejected. Built as the full-width layout: the first nine rows of the main area are one 78-column band (`TOP = 9`: four rows, a blank, three rows, a blank) with both lines centred; the remaining eight rows are split as before, the level line on the left and the rumor sidebar on the right.
  - The sidebar's card window is now `VH - TOP - 2` = 6 rows (was 15). The tagline "a daily dungeon crawl" is gone.
  - The level line exactly fills its eight rows (three above the spine, the spine, two below, a blank, the heading). It cannot grow taller.
  - **Page:** rows 6 to 13 box each of `▀▄█▓▌▐` into a one-cell span (`.cell.wm`), as the moon's glyphs are, with the fallback font's glyph scaled to 0.82 wide. VT323 has none of these characters, so their exact weight depends on the machine's fallback font.
- **Heading under the drawing,** worded "B4F - New Moon - Lunar Days 1-8" (`86d1dd1`, `2b0473f`): title case, "Lunar Days", and placed one row below the lowest branch showing, so it can sit a row or two lower later in a quarter.
- **Testing (light):** the title printed as text for several dates (every row 80 wide); a browser screenshot of the real title; a new run still starts from it. The mockups were images only.

## v0.93 - The Line of Days - Oct 11 2026, 08:57 HST

![v0.93](screenshots/v0.93.png)

- **The level as a branching line on the title** (`screen.js` `levelBones`). Commits `e3c6bff`, `9552d47`, and the heading commit. From the dev's sketch: a dashed spine with a branch off each day, above and below in turn. Heading: "B4F  -  new moon  -  days 1-8" (level, the moon the quarter opens with: new moon / first quarter / full moon / last quarter, and the lunar day range). The wordmark moved up to rows 1, 2 and 4; the heading is on row 7 and the drawing on rows 9 to 15.
  - **Days** are lunar days by the same count as the EPOCH line (`floor(days into the epoch) + 1`, 1 to 29): quarter q runs from `ceil(q * 29.53 / 4) + 1` to `ceil((q + 1) * 29.53 / 4)` (8, 7, 8 and 6 days). Today's number is in brackets.
  - **Shape** is rolled from `(epoch, q)` only (a small mulberry generator), so it is the same for everyone and changes each quarter: each branch 1 or 2 steps high, a 1 to 4 character twig, sometimes a second small one. It carries no information: every wing has three rooms.
  - **Masked future:** a day after today shows `?` and no branch. Its rolls are still consumed, so visible branches never change as days are uncovered.
  - The line can show 8 days where a level's run has at most 7 door-days; left as is.
  - The title's quarter card now reads "The new moon's week. The next in N days." to match the naming.
- **The search beat now comes before the search** (v0.92.1, `0314797`). The dev saw a demon appear with no delay. The dots used to play only when nothing else opened. Now the page shows the lead-in (built from the facing: "KURA searches the WEST wall", "KURA listens at the door", "KURA scries the moon / sky"), adds three dots at 200 ms, and only then calls the rules; a demon, a find or the terminal opens at about 0.8 s. With no popup, a multi-sentence result still follows a sentence at a time. Out of breath: no beat.
- **`[F]IGHT` removed from the bottom bar** (`f77f311`): the bar is `[T]ALK [I]NVOKE [S]EARCH [M]OON`. The fight box keeps its own button and the F key. The dev considered STANDBY, GIVE, REST and LISTEN for the slot and chose to leave it empty.
- **Typed line:** a finished line holds 5 s (was 3.2); every line ends in a full stop unless it already ends in one or a quote; six kinds trail off with " . . ." (the dark taking the level, walking alone, a member fallen, badly hurt, running out of patience, an omen in reserve).
- **Testing (light):** the title line printed for several dates and quarters (two-digit days, the mask on days 1, 4 and 7) and seen in a browser screenshot; a browser run that waited for both an ordinary result and a demon (its box opened 0.81 s after the key). Not checked in the browser: the typed line's endings and hold, the bar after `[F]IGHT` left, a find or the terminal after the dots.

## v0.92 - In Color - Oct 11 2026, 08:38 HST

![v0.92](screenshots/v0.92.png)

- **Result colors.** Commits `f40e594` to `b6d36cd`. `resultClass()` picks a class for the result text: `q-plain` (`--trail` grey: nothing, or a COMMON or UNCOMMON item), `q-silver` (`#d6e8ff`: SILVER), `q-rare` (`#6aa6e8`), `q-mythic` (`#f5c542`: a MYTHIC item or the deep find), `q-moon` (`#c9b6ff`: a MOON item). No glow. Settled with the dev over several swatches: rare was tried in green and went back to the traditional blue; mythic went from the border gold `#e3b341` to a brighter gold ("more shiny"); moon went from the header's moon blue to lavender (cyan was the other finalist); silver was made cooler and brighter after it proved nearly identical to the log's off-white.
- **Where the result shows changed three times and ended on the action line.** v0.91.1 put it on the top line; a popup had been tried before that (v0.88). Final (`6abf4ff`): the middle line reads "KURA searches the WEST wall. RESULT" and only RESULT is wrapped in the quality's span (`colorize`, row `lines.length - 5`). The top line is untouched. `resultBox()` and the result popup are removed. **The find popup ("KURA FOUND") stays**, at the dev's explicit request.
- **The beat is dots, then sentences** (`6abf4ff`, `504be0b`). After a search with a breath to spend and nothing else opening: the line shows the lead-in without its full stop, adds " ." three times at 200 ms, then the result one sentence at a time, 550 ms apart ("A crack." ... "It goes nowhere."). Input is ignored until the last sentence. A one-sentence result takes 0.8 s, two about 1.4 s. At a door, where the log has no "KURA searches" sentence, the lead-in is "KURA listens at the door" and the whole line then appears uncolored. A search that opens the find popup has no beat.
- **"Coins" is gone** (`c91ba19`): `reveal` now says "N SILVER, loose in the rubble."; the find popup's check for that line was updated to match.
- **Typed line:** letters 80 to 150 ms (about eight a second), 120 ms on a space, 420 ms after punctuation; a 2.2 s pause on a bare `> _` (blinking) between lines.
- **Testing (light):** browser checks of the class and computed color for dust, a common item, a rare item, SILVER, and the deep find; of the dots and the sentence-by-sentence reveal with timings; and that the top line is unchanged by a search. Not checked: a MYTHIC or MOON item by name, a find popup after the SILVER rewording, the typed line's new pause.

## v0.91.1 - A Slow Hand - Oct 11 2026, 08:16 HST

![v0.91](screenshots/v0.91.png)

- **Search result on its own line.** Commit `4926ceb`. In `draw()`, when the saved log reads "> KURA searches/scries the X. RESULT", the middle line is drawn as the first sentence and RESULT is drawn on the top line in place of the flavor text. Display only: `save.log` is restored at once and the history keeps the whole sentence. Not split during the 0.8 s beat, for a dead run, or while a party question holds the top line. A find (`KURA finds`, `A locker holds`, `Coins in the rubble`, `Deep in the stone`) sets `resultGold` and the top line gets `.logline.gold` (the popup gold, no glow).
  - The result sits **above** the action because the line below is the typed news. Flagged to the dev as possibly reading backwards; the alternative is to swap the two.
- **Typed line.** Slower: letters 110 to 200 ms (about six a second), 170 ms on a space, 520 ms after punctuation; deletion one character per 45 ms (was two per 18 ms); gap 0.7 s. A persistent `> ` prefix. Width 72. It never says KURA: status lines have "KURA is" / "KURA" rewritten to "She is" / "she".
- **Run news rewritten** (`0f38d44`). Dropped as shallow or already on screen: SILVER, lean, bare day and turn. About thirty lines, each only when it applies: rooms of the level walked, days before the dark takes it, today's key, who walks with her, who has fallen, who is badly hurt, who is running out of patience (patience 2 or less), pacts holding, demons met / beaten / run from, talks, gifts and refusals, silences, party remarks, confidences, searches and finds, longest stay at one wall (5 or more), rare finds, things broken, doors and rooms, levels climbed, STANDBY nights, a held omen, fixtures, offerings, ICHOR, the moon, out of breath, things in the bag.
  - **Mix:** two of hers, then one of the others' (others on her level today, then located rumors), repeating; the shorter list wraps. The others' list is only three or four items until located events accumulate.
- **Testing (light):** browser checks of the split lines, the gold class, the typing rate (13 letters in 2 s) and the feed list with made-up counts. The slower delete was not watched on screen.

## v0.91 - Typed - Oct 11 2026, 08:08 HST

![v0.91](screenshots/v0.91.png)

- **Typed line in place of the ticker.** Commit `d72f8e1`. The dev tried a gliding scroll (`37e9b11`, built and never pushed alone: sub-character `translateX` on every animation frame) and then asked for a terminal instead. A `setTimeout` state machine (`typeStep`) cycles gap, type, hold, delete: letters at 35 to 90 ms, 70 ms on a space, 260 ms after punctuation; the finished line holds 3.2 s with the `_` blinking (`.wait`); it is deleted two characters every 18 ms; 0.5 s gap. Lines are cut at 74 characters. Only `#ticker`'s HTML is rewritten. Content is unchanged from v0.90: a new status report goes next whenever one is waiting, otherwise `tickerFeed()` in turn.
  - The first build broke the page outright: a leftover `}` and `requestAnimationFrame(tickerFrame)` from the scroll code stopped the script loading, and `tickerHtml` as a `const` was read before its declaration on the first frame. Caught by the browser check; fixed (a function declaration and `var`).
- **A beat before a search's result** (`6d302e5`): with instant results the popup felt too fast. The search runs at once, but for 0.8 s the middle log line shows only the lead-in ("KURA searches the SOUTH wall.", "KURA scries the moon.", or "KURA listens at the door." where the log has no such sentence) with a blinking `_`; then the full line is restored and the result box opens. Keys are ignored during the beat; the minute timer skips its save.
- **`[M]OON` fixed in place:** `[S]CRY` is padded to `[S]EARCH`'s width in `screen.js`.
- **Worker** was redeployed for v0.90 at about 07:59; `/feed` then showed presence at 11 (the dev and ten bots), no names in any event, and only old-style events so far. The `news` table has not been seen to take a write yet.
- **Testing (light):** browser checks of the beat (lead-in with cursor, a key ignored, then the box; the scry version; the bar text in both states) and of one full type, hold, delete, type cycle (about 6 s for a 40-character line). Not checked: the typed line during a fight or under a popup.

## v0.90 - News From This Level - Oct 11 2026, 07:58 HST

![v0.89](screenshots/v0.89.png)

- **Events carry where and who.** Commit `598c5b1`. **Needs a Worker redeploy (schema and worker).**
  - **Game (`rules.js` `ev`):** every event now also has `lv` (level height), `d` (day on the level), `k` (room kind, or hall / dead / plain), `a` (lean: L, N, C), `p` (party members standing, not counting KURA), `c` (levels into the run), `dm` (the demon in the room, if any), `m` (moon phase 0 to 7) and `n` (the run's name).
  - **Worker:** a new table `news (id, type, v, made, who, x)`; `x` is a JSON object of the fields that passed their checks (each is validated against a fixed shape and silently dropped otherwise; the name also goes through the leaderboard's blocklist). `/event` writes to `news` and rate-limits against it; the newest 20 per tag are kept as before. `/feed` reads `news` and tops up from the old `events` table while `news` fills. **The name is stored but never returned by `/feed`**: the dev wants it "for later".
  - A new table instead of new columns on `events`, so `schema.sql` stays safe to run again (no ALTER).
  - **Cost:** no extra requests and no extra rows; a row grows from about 50 to about 120 bytes and the table stays at a few hundred rows.
- **The ticker's content changed** (v0.89.1, `e6f4c31`, never pushed alone): no month totals or calendar lines. It alternates one item about this run (name, day, turn, level; who is with her; demons met, beaten and fled; pacts; searches and finds; doors; levels; SILVER; lean; the moon; out of breath; each only above zero) with one about others (how many others are on her level today, then the rumors). Status reports still join the tape as they change. Speed 200 ms a character (5 a second), was 140.
- **Located rumors on the ticker:** `rumorCards(level)` sorts events from her level first and prefixes "On this level, day N:" or "On B3F, day N:"; a fall with a demon reads "A CHROME ONI struck a traveler down." Events without a level (the old rows) show as before. The title screen's rumor cards are unchanged.
- **Bots** send the new fields automatically once pinned to this commit.
- **Testing (light):** the Worker file loads; a node run produced an event with all the fields; one browser check with a stand-in feed showed the located lines and the slower speed. The real Worker is untested until redeployed; until then `/event` posts with extra fields are still accepted by the old Worker (it ignores them), so nothing breaks.
- **No new screenshot;** the entry reuses v0.89's.

## v0.89 - The Ticker - Oct 11 2026, 07:50 HST

![v0.89](screenshots/v0.89.png)

- **The log's three lines are reordered** (`screen.js`): top, the flavor line (`extra`: atmosphere, party and demon lines, tells, and a question with its `[Y]ES [N]O [S]ILENT`); middle, the action log; bottom, the status report. The page's question buttons moved to the top row (`lines.length - 6`).
- **The bottom line is a ticker** (`index.html`). Commits `56ff272`, `61ba9db`. A tape string is extended as needed and shown through a 76-character window in `<span id="ticker">`, advanced one character every 140 ms (about 7 a second). Only that span's text is rewritten; `draw()` re-renders it at the current position, so nothing jumps. It does not pause for popups or fights.
  - **What goes on the tape:** each new status report (`save.status`, as it changes), and between them the title feed's lines in turn (`worldLines`: number cards, rumors, moon lines), separated by `   //   `. The dev chose `//` over `+++`, a centered dot and others.
  - `report()` no longer mixes "Elsewhere:" lines into the status line, and the page no longer writes `save.world`.
  - In node and for the bots the bottom row is simply the status line: the ticker is page-only.
- **The "searching . . ." moment is removed** (v0.88.2, `a8d343d`, never pushed alone), at the dev's request "for now". Every search lands at once and its result box opens straight away (about 18 ms in the check). `searchWait` is gone.
- **Noted by the dev:** the out-of-breath countdown is rarely seen, because the result box stops rapid searching and the bar refills meanwhile. Left in.
- **Testing (light):** one browser check of an instant search, and one of the new layout with a stand-in feed (rows in the new order, the ticker advancing over several seconds, every row 80 wide). Not checked: a party question on the top line, the ticker during a fight, the `//` separator on screen (a string change after the check; the screenshot still shows `+++`).

## v0.88.1 - Plain Boxes - Oct 11 2026, 07:39 HST

![v0.88](screenshots/v0.88.png)

- **Popup text.** Commit `b3336f6`. `resultBox()` strips a leading "KURA searches the X wall." / "KURA scries the moon / the sky." so only the result shows; the log line keeps the full sentence. A first version printed a literal "null" line (the absent moon line went through `String()`); fixed before push.
- **No glow on any box.** The `box-shadow` on `.foundbox` (the floating find, break, confirm and result boxes) is removed; the gold border stays. The in-frame fight box never had one. Part of the dev's standing "no visual effects" rule.
- **Countdown meaning changed.** `RULES.breathNext` now returns the time until she has one whole breath, and only while she has less than one; otherwise null and the cells are blank. The dev asked for "seconds until the player is allowed to take the next breath"; read as "until she can search again". With half-breath steps she can still step at 0.5 while the countdown shows.
- **Testing (light):** one browser check: the box has no shadow and reads "Nothing but dust." / "No moon tonight. No one to ask."; the timer is blank at 5 breaths, 11.8s at zero and 8.8s three seconds later. The other boxes were not opened after the glow was removed (a one-line CSS deletion).
- **Screenshot** reuses v0.88's file, retaken with the plain result box.

## v0.88 - Half a Breath - Oct 11 2026, 07:34 HST

![v0.88](screenshots/v0.88.png)

- **Steps cost half a breath.** Commit `00cba0e`. `STEP_BREATH = 0.5`; `spendBreath(st, amount = 1)`. `st.breath.n` can now sit on a half. Regeneration climbs to the next whole number, taking that share of `BREATH_BACK[floor(n)]` (`breathStep`): from 5.5, one second after the 2-second wait. A step is refused below 0.5; a search, a scry and an item still need and take a whole one. The bar's `round((6 - breath) / 6 * 9)` copes with halves.
- **Countdown.** `RULES.breathNext(st)` returns the milliseconds until the next breath is back (null when full). The page writes it into a five-cell `<span id="breathT">` at the right end of the strip's row (panel columns 24 to 28) as `2.8s`, and a 100 ms timer updates only that span's text: the screen is not redrawn for it. Blank at full breath, on the title, and for a dead run.
- **`>` `<` for every breath** (v0.87.1, `e593c87`, never pushed alone): `draw()` compares `save.breathNow` with the last frame's and calls `squeeze()` on any drop, and also when a new out-of-breath line appears at zero. So steps and items press the bar too, and anything made to cost breath later will.
- **Result popup replaces the waiting cursor.** The dev found the swallowed key press broke the flow and asked to try a popup. `resultBox()` reuses the find box (`mode = "found"`, closed only by its `[ OK ]`: Enter or a click): the log line wrapped at 38, plus the moon's own line after a scry when she answered or kept her counsel. Not shown when the search opened something else (a find, a fight, a question, the terminal), and not for an out-of-breath refusal, which only shows its line. `contWait`, the `_` rendering and its capture listeners are removed.
  - It is the same number of presses as the cursor was; the difference is that only Enter or a click closes it, and it covers part of the view. To be judged in play.
- **Testing (light):** browser checks of a step (5.5, the marks, the countdown 2.8 / 2.1 / 1.4 / 0.5, then full) and of the popup (a wall result, another key leaves it open, Enter closes it, a scry result). After the last fix (dropping a stray atmosphere line from the scry box) it was not re-run. Not checked: the bag's refusal line, a refused step, the out-of-breath case with the popup code.

## v0.87 - Scry - Oct 11 2026, 07:27 HST

![v0.87](screenshots/v0.87.png)

- **`[M]OON` and `[S]CRY`.** Commit `f559147`. The bar reads `[F]IGHT [T]ALK [I]NVOKE [S]EARCH [M]OON`; `[M]OON` (key M) toggles `st.look`, replacing `LOOK_[U]P` / `LOOK_[D]OWN` and the U and D keys (down arrow still looks level). While looking up the search button reads `[S]CRY`, same S key, and the log says "KURA scries the moon / the sky". The dev considered PURSUE, AUGUR, WISH, CHERISH and DIVINATE; chose MOON "for now" and SCRY.
- **Breath is spent on more things (`rules.js`).**
  - **Steps** (`2ebc2ab`'s sibling `40f899f`): every `go()` that moves her to another room, and climbing the stairs, calls `spendBreath`. At zero the move is refused ("KURA is out of breath. She stays where she is."). Unlocking a door is not a step and costs none. Running from a demon is never refused; it takes a breath if she has one.
  - **Using an item** (`2ebc2ab`): `useItem` takes a breath and is refused at zero ("The bag can wait."), except in a fight, where it is never refused. ICHOR, gifts and altar offerings are separate actions and cost none.
  - Fighting, talking, turning and looking cost none.
  - **Balance:** six breaths now cover searching, scrying, items and walking. Crossing a wing and back is four or five. Untested by a human; the bar size (`BREATH_MAX`) and the refill table are the levers.
- **Every search waits and every door search takes the moment** (`b8e0438`, `324aa70`). Page-side: any non-look search with a breath to spend shows "KURA is searching . . ." ("listening" at a locked door), including open archways and sealed doors. Every other search (scrying, out of breath) lands at once and waits with the `_`. No cursor when the search opened a popup, a fight, a question or the terminal.
- **Breath bar centred** (`324aa70`): the strip and its phase dot start one column into the panel instead of three, so the drawn part (the strip's columns 5 to 21) sits mid-panel.
- **The level on the end-of-run page** (`324aa70`, `f3ab1fe`, `7940fa4`): `RULES.levelMap(st)`, shown under the stats when the run is dead. One column a day: `[v]`, `< >` per two-door day, `[?]`, `[^]`; "seen" is rooms entered out of the wing's three (`-` if never reached); "took" is the feel word of the room she opened that day; "left" is always `?`; "^ here" marks the wing she ended in.
  - The dev's mockup had a "rooms" row with varied counts; in the real floors every wing has exactly three rooms, so that row became "seen".
  - First build showed both offered rooms for every day; the dev pointed out that dying early would reveal the week's shared offers, so it now shows only the room she took.
  - Also removed a leftover call to the deleted `RULES.pathView`, which logged a caught TypeError every time the log opened (since v0.80).
- **Shared-map mockups** (title screen, tree and readout versions) were tried and set aside twice today; nothing built.
- **Testing (light):** node checks of the bar text, breath draining on item use and on steps (with refusals at zero), and the map from generated runs; browser checks of M / S / Enter / the MOON button, of an archway search (the moment, then breath 6 to 5), and of the end page. Not checked in the browser: the bag's refusal line, a refused step.
- **Bots:** the 06:50 re-run failed at "Save the day" (it was a re-run of the first run, so it started from a snapshot with no saves and collided). The workflow now checks out `main` and rebases with the bots' files winning. A fresh forced run was started at about 07:07; result not seen yet.

## v0.86 - Wait For It - Oct 11 2026, 07:03 HST

![v0.86](screenshots/v0.86.png)

- **Click to continue after a search.** Commits `141a3e2`, `2e52611`. Page-side (`index.html`): after a wall search or a listen lands, `contWait` is set and the log's middle line ends in a blinking `_` (the existing `.wait` class), drawn in place of one trailing space so the row stays 78 wide. Any click (a capture listener on `document`) or key (except Shift, Tab and F-keys) clears it and does nothing else. Not set when the search opened a popup, started a fight, or raised a question.
  - **Out of breath** now takes the same path: the refusal shows at once (no "searching" moment), then waits with the `_`.
  - Still instant with no cursor: an open archway, and asking the moon.
- **`>` `<` on the breath bar for one second.** `screen.js` draws them at either end of what is left of the strip only when `st.squeeze` is set; the page sets it for a frame inside `draw()` while `Date.now() < squeezeUntil` and deletes it straight after, so it is never saved. `squeeze()` starts the second when a search lands (or is refused) and schedules the redraw that removes them. First built as always-on while the bar was closed; the dev wanted them only as a brief pop on the key press.
- **Cost in presses:** a search is now press, 1 to 2 seconds, press. Noted for balance.
- **Testing (light):** the strip printed at each breath; one browser check of the cursor (first key only dismisses, second acts; rows stay 80 wide) and one of the marks (absent during the wait, present on landing, gone 1.2 s later; out-of-breath line waits with the cursor). The marks on an empty bar were not observed, only the code path.
- **Screenshot** was taken before the marks became momentary; it shows the waiting cursor.
- **Also today (dungeon-notes only):** the bots workflow moved to `actions/checkout@v5` and `actions/setup-node@v5` after a Node 20 deprecation warning; untested until the next run.

## v0.85 - Word From Elsewhere - Oct 11 2026, 06:47 HST

![v0.85](screenshots/v0.85.png)

- **Presence, daily version.** Commit `9fe611c`. **Needs a Worker redeploy (schema and worker).**
  - **Page (`index.html` `pingHere`):** once per local day, a device with a living run POSTs `/here` `{ id, level }`. `id` is 24 random hex characters kept in `localStorage` (`ddd.device`); `ddd.here` holds the last day pinged. Nothing personal; not sent while the testing cheat is on, or for a dead run. Called from `flushEvents`, so it rides the first save of the day.
  - **Worker:** new table `present (id PRIMARY KEY, level, at, who)`, one row a device, overwritten. `/here` validates `id` (`[a-z0-9]{12,40}`) and `level` (1 to 60), allows a sender at most 40 other fresh ids in 24 hours (the bots share a sender), and prunes rows older than 60 days. `/feed` adds `here: { month, today, levels: [{ level, n }] }` (rows since the epoch began; rows in the last 24 hours, by level), `names` (distinct names in `scores` since the epoch began), and `deadliest: { name, n }`.
  - **Live presence later** is the same ping on a shorter interval plus a "last five minutes" count; `at` is already a timestamp.
- **"Players seen" now means devices seen this moon** (`here.month`). The old count (distinct senders that posted a score) is no longer shown; "Names carved on the board" replaces it for finished runs. The `players` counter and `seen` table are still written, unused.
- **New counts reported with a score (`rules.js` `score().stats`):** `beaten`, `talks` (demonTalks), `joined` (recruited), `unlocks`, `standby`, `climbs` (floors), `moon` (moonAsked), `moonYes` (new tally `moonAnswered`), `breath` (new tally `breathOut`, once per run of blocked presses), `silver` (silverFound), `rare` (new tally: any RARE, MYTHIC or MOON item gained). Worker caps added to `STAT_CAPS`. `killer` (the demon that struck KURA down, `st.killer`) goes at the top level and becomes a `k:NAME` counter; the feed returns only the top one. The counters read limit went from 40 to 400 rows.
- **New title cards:** Players seen, In the pit today, On B4F today (per level, up to four), Names carved on the board, Pacts that lasted (percent), the counts above, Most falls. With no network: the moon's quarter and days to the next, "The dark takes B4F in N days", days to the full moon, "The moon is new. She answers no one tonight." on a new moon, and "LAW/CHAOS omens, three days running." on a streak. Day counts use whole calendar days, the same as the LEVEL line. Cards still hide at zero.
- **Log line 1 carries the feed.** The page lends its card lines to the run as `st.world` (moon lines as they are, everything else prefixed "Elsewhere: ", 74 characters at most). `report()` uses one a quarter of the time it isn't an air report or the last day's news. The lines are from the last title-screen load, so they are as old as the session.
- **Bots:** they also send `/here`, each with its own id, once the pinned build is moved to this commit.
- **Testing (light):** the Worker file loads; one browser check with a stand-in `/feed` showed every new card, one `/here` ping with a 24-character id, and a world line on log line 1. The real Worker was not exercised: it cannot be reached from here and is not redeployed yet. Until it is, the new cards simply don't show and the ping gets "not found".

## v0.84 - Searching . . . - Oct 11 2026, 06:18 HST

![v0.83](screenshots/v0.83.png)

- **The searching line.** Commits `f12face`, `1243590`, and the stretch commit. Page-side only (`index.html` `act`): a search at a bare wall shows "> KURA is searching", adds " ." three times, then runs the real search; at a locked (or painted) door the word is "listening". Step time is `250 + (6 - breath) * 50` ms, four steps: 1.0 s in all at full breath, 2.0 s on the last breath. Input is ignored meanwhile; the breath and minute timers skip their redraws. The line is drawn only: never saved, never in the history.
  - Instant, with no line: an open doorway, looking up (the moon), out of breath, in a fight, with a question pending.
  - **Standing rule from the dev: no dimming or visual effects, ever.** Only the log line changes. Written into the code comment too.
  - The rules and the bots are untouched: bots still search instantly.
- **Bug fix (`rules.js` `search`, present since v0.62):** searching an open arch twice could filter its single line out of the pool and log "> undefined". The pool now falls back to itself when nothing else is left.
- **No new screenshot:** nothing visible changed except a log line in motion; the entry reuses v0.83's.
- **Testing (light):** one browser check of the dots sequence, and one that timed it: searching 1013 ms at full breath, listening 1216 ms a breath down, searching 1406 ms two down; arches and out-of-breath presses instant; no page errors. The arch fix was not re-run in the browser.
- **Bots went live this morning** (dungeon-notes `bots/`, commit `1edc847`): ten scripted players on a daily GitHub Actions timer, seven pinned to `088df27` (v0.83), three canaries on latest. First run started by hand by the dev; result not yet seen.

## v0.83 - Breath - Oct 11 2026, 05:46 HST

![v0.83](screenshots/v0.83.png)

- **Breath: KURA's own tiredness, shown on the moon strip.** Commit `088df27`. Replaces v0.81's use of room heat for the strip; the dev wanted "click fast 5-6 times and the bar disappears, then regenerates", personal to KURA, named BREATH.
  - **Rules (`rules.js`):** `BREATH_MAX = 6`. `st.breath = { n, at }` (absent when full): `n` breaths as of instant `at` (ms), which is when the next starts coming back. `spendBreath` sets `at = now + BREATH_WAIT` (2000 ms). `breathNow(st, write)` catches up: climbing from `n` to `n + 1` takes `BREATH_BACK[n]` seconds, `[10, 8, 6, 4, 3, 2]`, so emptier is slower. From empty: 12, 20, 26, 30, 33, 35 seconds for breaths 1 to 6 (measured). Real time, so it also refills while the page is closed.
  - **What spends one:** every `search()` (walls, listening at a door, waking a terminal, using a fixture, `[ ^ ]` at a bare wall) and asking the moon (only when she is actually asked). Not moving, turning, looking, talking, fighting, or searching during a fight (already refused).
  - **At zero:** `search()` returns early with "KURA is out of breath." / "KURA needs a moment." / "Not yet. KURA catches her breath." No turn is spent.
  - **The strip (`screen.js`):** `st.breathNow` (set in `show`) closes `round((6 - breath) / 6 * 9)` columns a side around the drawn middle; nothing left at 0.
  - **The page (`index.html`):** a 250 ms timer compares `RULES.breath(save)` (read-only) with what is shown and redraws when it changes. `RULES.breath` is new in the api. `breath` is cleared on reset.
- **Heat reverted to v0.80 behaviour.** `cool()`, `COOL_MS` and `rs.heatAt` are removed: heat only halves overnight again and is not shown. Asking the moon adds no heat.
- **The search pause is removed.** Commit `0224bcb`. The dev did not like it; the "KURA searches..." line went with it.
- **Balance note:** breath caps the rate of searching (about 6 in a burst, then roughly one every 2 to 4 seconds if kept near full), not the total. Heat is still the cost of total searching.
- **Testing (light):** one node check (six searches drain it, the 7th and 8th are refused, refill times above) and one browser check (seven fast presses empty the strip and block; it reopens with no input; searching works again; no page errors).

## v0.82 - The Key - Oct 11 2026, 05:34 HST

![v0.82](screenshots/v0.82.png)

- **"Charge" is "key" again; doors "unlock".** Commits `da121a3`, `ffff04e`. Every player-facing line in `rules.js` and `index.html`: the door prompt ("UNLOCK THE NORTH DOOR?", "This uses today's key."), the unlock and refusal log lines, the painted-door lines, STANDBY's prompt, the status report ("Today's key spent / in hand"), the About text, and the debug row (`KEY spent/ready`). Code names are unchanged (`today.stepped`, `freeSteps`). "Recharge Bay" keeps its name.
- **The [?] page rebuilt.** KEYS is generated from a list so every label is dot-padded to one column (the `[H]` line had no dots); the two `[G]IVE` lines merged; `[Y]ES [N]O [S]ILENT` on one line; the password entry on one line; a MARKS section for `+`, `#`, `x`, `[v] [^]`. All lines fit the 71-column box. "Each floor" is "Each level".
- **v0.81.1, folded in here (never pushed alone):**
  - `b150111`: the moon strip closes around the middle of what is drawn (columns 5 to 21 of 24), `round(heat / 24 * 9)` columns a side, so it no longer looks lopsided.
  - `134ec11`: the dimming and wait cursor during a slow search are removed at the dev's request ("no dimming, no reload; please ask before you add things like that"). The middle log line shows "> KURA searches..." for the wait instead; it is drawn only, never saved or added to the history.
- **Process note:** ask before adding any visual effect that wasn't requested.
- **Testing (light):** the strip printed at nine heat levels; one browser check of the search line (shown during the wait, opacity 1, replaced by the result); one browser look at the [?] page. The renamed log lines were not played through, and the public screenshot predates the last line trims.

## v0.81 - The Moon Closes - Oct 11 2026, 05:24 HST

![v0.81](screenshots/v0.81.png)

- **Heat is now visible, cools in real time, and slows searching.** Commit `9d9c12f` (plus `b9bb753`, the end-screen wording). The dev asked for "tiredness" shown on the moon strip; we reused room heat so nothing new is tracked beyond a timestamp.
  - **Cooling (`rules.js` `cool`, called at the top of `sync`):** every room with heat loses 1 point per 60,000 ms of real time (`COOL_MS`), using `rs.heatAt` (ms of the last point lost; set in `heatUp` when a room first warms). Works while the page is closed; the page's once-a-minute `tick` applies it while open. The overnight halving and the STANDBY clear are unchanged and stack with it. A full room (24) is calm in 24 minutes.
  - **The strip (`screen.js`):** `st.heatNow` (set in `show`) blanks `round(heat / 2)` columns, capped at 12, from each end of the 24-column phase strip. The dot over today's phase is untouched. Note the strip already has blank cells at the new-moon end, so the closing can look lopsided at low heat.
  - **The pause (`index.html` `act`):** a search in a room at heat 5 or more waits `min(2000, (heat - 4) / 20 * 2000)` ms before it lands; input is ignored meanwhile and the screen dims slightly (`body.tired`). No pause in a fight, while looking up, or below heat 5. `[ ^ ]` at a bare wall counts as a search. The pause is page-side only: the rules and the bots are unaffected.
  - **Asking the moon** now calls `heatUp(st, 2)` when she is actually asked (not on a new moon, not on a repeat the same night).
  - **Not changed:** heat still caps at `HEAT_MAX + 4` = 24 and the top tier is still named "wrong"; both were checked at the dev's request and are as designed (same in v0.62).
  - **Balance note:** cooling at 1 a minute is far faster than the old overnight-only halving, so heat is much less of a threat than it was. Rate chosen by the dev "for now"; raising heat per search is the lever if it proves too easy.
- **Testing (light):** one node check (strip at heat 0/6/12/22, 5 minutes of cooling takes 22 to 17) and one browser check (searches took about 0.5s, 0.9s, 1.3s, 1.7s as the strip closed; no page errors). The moon's 2 heat was not observed: it is a new moon today, so she can't be asked.

## v0.80 - Back to the Wings - Oct 11 2026, 05:06 HST

![v0.80](screenshots/v0.80.png)

- **Rolled back to the wing floor, keeping the newer layers.** Commit `f2f511c`. At the dev's request: "roll back the one room thing and go back to the wing-based, shared floor multiplayer version". Floor format `v: 11`; older saves are refused and start fresh.
  - **How it was built:** branch from `63fabda` (v0.62.2), cherry-pick `5647f1b` (v0.73), `0b6f2e8` (v0.74), `ab10448` (v0.75), `fda09bf` (v0.77) and `fe47609` (fight opening), skipping `5d2dee8` (v0.70) and `3ab00ec` (v0.72), resolving each conflict toward the wing code; then the four code files were copied onto `main` as one commit. `leaderboard/` came out identical to main's.
  - **Back from v0.62.2:** `floor.js` whole (wings, passages, dead ends, false doors, wildcard, bonus/void placement), movement and `go(st, dir)` by compass direction, the room minimap with its per-player rotate/mirror, room names in the slot under the map, `[  ^  ]` as `forward` (walk through the faced door; a bare wall searches), stairs found in their wall via `stairsDir`.
  - **Kept from v0.70-v0.78:** pit levels and `st.height` / `st.climb` / `levelName`; quarter deadlines (`arrive(st, height, n)`, `startSlot`, `quarterDeadline`), with `streak` passed to `FLOOR.generate` again; title numbers, rumor cards, `/feed`; fight-end and fight-opening pacing; Dissonance `{1:0, 2:1}` once per fight won; greyed Hold Omen button; a blocked run through a locked door keeps the charge (`today.stepped` set only on getting through).
  - **Sky and moon, re-fitted:** `st.look` is only `"U"` now. `turn(st, "U")` toggles; turning or moving clears it. `show` returns `view: { look: "U" }` and `renderLook` draws it. SEARCH (or `[ ^ ]`) while looking up calls `askMoon`: same odds `[0, .15, .5, .85, 1, .85, .5, .15]`, once per run-day; it picks from the kinds behind this room's still-locked doors, or failing that any locked door of a visited room. The map slot reads THE SKY / THE MOON. Bottom bar `LOOK_[U]P` / `LOOK_[D]OWN`; keys U, and D or down arrow to look level again.
  - **Bonus room and THE VOID are on again:** there is no `BONUS_ROOMS` flag in this code; the streak guarantee and the moon-weighted roll run as in v0.62.
  - **Removed:** two-door wall (`renderDoors` is left in `screen.js`, unused), floor view, `actLabel` / `facingLabel`, `[ ENTER ]` labels, choice-path minimap, `pathView` / `floorPath` / `st.path`.
  - **Wording:** map marks flipped for the climb (`[v]` where she came up, `[^]` found stairs); death line "The moon turned. The dark rose and closed over KURA."; About text rewritten.
- **Testing (light, as asked):** one node run (25 random runs with free steps, 2,500 actions each, 9 seconds: no exceptions, every screen row 80 wide, levels climbed, the moon asked 946 times) and one browser pass (new run, search, look up, ask the moon, turn, walk into a locked door and get the charge prompt; no page errors).
- **Not checked:** actually opening a door and walking wings in the browser, a fight in the browser, the bonus/void rooms, a deadline death, the title screen beyond loading. Balance is as v0.62 plus quarter-length levels (3 to 7 days).
- **Docs are now behind:** `daily-dungeon-design.md` was rewritten for one-room at v0.77 a few hours ago and no longer matches. To be redone when asked.

## v0.78 - A Word on the Button - Oct 11 2026, 04:52 HST

![v0.78](screenshots/v0.78.png)

- **The action word moved inside the button.** Commits `5c73e80`, `4bd90eb`, `09239fb`. `screen.js`: row VH-2 draws `[ ${st.actLabel} ]` centred on column 23 (fallback `[ ^ ]` with no label); the separate word on row VH-3 is gone. `index.html` wraps `/\[ (LISTEN|OPEN|ENTER|SEARCH|USE|OFFER|CONSULT|CLIMB|\^) \]/` on rows 21-22 as the `do` button. The `.caret2` enlarged caret is no longer used (the CSS rule remains).
  - `[ < LEFT ]` / `[ RIGHT > ]` stay on row VH-3: they don't fit beside the wider button.
  - **Opened door:** for an L or R door in state `open`, row VH-3 shows `[ ENTER ]` under it (col 9 or 28), wired to `go-L` / `go-R`. While that is showing, the centre button is a plain `[ ^ ]` (still `do`, still enters) so there aren't two ENTERs. The lone C door has no label under it, so the centre button keeps `[ ENTER ]` there.
- **The fight's opening unfolds in beats.** Commit `fe47609`. `encounterBox` intro mode groups its rows (art slot, `NAME APPEARS`, each said line, `[ OK ]`) and reveals them 450ms apart via `visibility`, same technique as the end screen (700ms there). `introTimer` blocks `introOK` until the last beat; after it, a 100ms guard. Only the first showing unfolds (`introSeen = runId:steps:name`); a redraw shows it whole. Not skippable, at the dev's request.
- **Testing:** one short browser check per change (labels at doors/sky/wall; beats in order and an early press ignored; ENTER under the right door). The plain `[ ^ ]` beside ENTER was not seen on screen by the check, only inferred from the code.
- **Docs:** the design doc and theory notes were brought up to v0.77 just before this (dungeon-notes `24e3197`).

## v0.77 - Out of the Pit - Oct 11 2026, 03:03 HST

![v0.77](screenshots/v0.77.png)

- **The theme turns over: a climb out of a pit, on the moon's clock.** Commit `fda09bf`. There is no v0.76: a wording-only climb (floors `1F`, `2F`...) was committed locally under that number and folded in here once the dev asked for B4F at the bottom and the quarter rule. Floor format `v: 10`.
  - **Why:** the dev noticed the map and THE PATH grow upward while a dungeon implies going down, and that a sky overhead makes no sense underground. Of six directions offered, they chose "escape": you are at the bottom and trying to get out; the deadline is the dark rising behind you.
  - **Levels (`rules.js`):** `st.height` is levels up from the bottom of the pit (1 = B4F ... 4 = B1F, 5 = the surface, `1F`, and on); `levelName(h)`. `st.climb` is how far into the run she is (1 on the level she woke on, +1 per climb), and `floorNum(st)` now returns it: every difficulty formula, the demon ladder and `score().floor` follow the run, not the level's name, so a late start isn't thrown in at the deep end.
  - **Quarters (`screen.js`):** `quarterOf(date)` / `quarter(n)` give `{ n, q, epoch, end }` from the same new-moon reference as `epochIndex`, with `QLEN = 29.530588853 / 4` days. `QUARTER_END = ["the half moon", "the full moon", "the waning half moon", "the new moon"]`.
  - **Deadlines:** `quarterDeadline(st, n)` is the local day the quarter ends on, and a level's last day. `arrive(st, height, n)` stamps `st.floorEpoch = quarter(n).epoch` (so a level's shared offers follow the month its quarter is in) and `dungeon.quarter = n`. `sundayOf`-based deadlines and `firstDeadline()` are gone; `nowMs(st)` keeps the X cheat's day offset working.
  - **Where a run wakes:** `startSlot(st)` takes the current quarter, or the next one if fewer than two days of it are left; `height = q + 1`. So first quarter B4F, last quarter B1F, and a start in the last two days of the month wakes on next month's B4F. This is the "late starters get a shorter pit" rule and it retires the late-week start rule noted for revisiting.
  - **Climbing:** the next level is always `dungeon.quarter + 1`, so leaving early banks the rest of the quarter (a clean climb from the bottom reaches the surface with days in hand, and the bank keeps growing past it). Climbing from `height` 4 logs "KURA climbs out of the pit, into open air. 1F." and raises the ambient event `out` (new Worker tag; needs a redeploy to be accepted). Nothing ends: past the surface the run carries on, quarter by quarter, across months.
  - **The stairs up** are in a bare wall: `walls()` unshifts `stairs` onto one of the room's bare walls and records `stairsDir`; `atStairs(st)` is "found, and facing that wall" (`D` only as a fallback when a room has no bare wall). The view's old `stairs` end art is back in use; `actLabel` gives `CLIMB`, the label slot `STAIRS UP`. Internally the way is still id `"D"`.
  - **Wording:** "the way up closes", "climbs to", "Stairs lead up", summary "floors climbed"; lines about things "below" are kept, since the dark is below now. Map and THE PATH: `[v]` where she came up, `[^]` where she went up.
  - **Title screen:** the WEEK line is LEVEL: `B4F  -  7 days left, closes SUN, at the half moon`, or `closes tonight. New runs wake a level higher.` The card is "Most levels climbed: N". **Board (stopgap):** the column is LEVELS and shows `score().floor`, the levels climbed in a run.
  - **Tested lightly:** Node: where a run wakes across a whole month, a full climb from B4F past the surface with the days banked at each step, the status lines, a short strict-width fuzz; one Playwright load of the title and a new run. Zero page errors.
- **Decided with the dev, not built yet:** one run in two parts. The climb out is the monthly game and can be won; past the surface is the endgame with no top (endgame and "endless mode" are the same thing; such runs carry on across months). Two boards: this moon (who got out and how fast, then levels climbed; resets each lunar month) and all time (highest past the surface). A late starter can get out but ranks below a longer climb. Also open: what is at the top, and drawing the moon larger the higher she is.

## v0.75 - The Path - Oct 11 2026, 02:42 HST

![v0.75](screenshots/v0.75.png)

- **Commit `ab10448`.** A v0.74.1 with most of this sat locally through several rounds with the dev and was folded in here before any push; there is no v0.74.1.
- **THE PATH (`rules.js` `pathView(st)`, shown at the top of `[L]OG`).** The four-week / whole-run view from the bot-testing notes, built as a forking tree at the dev's ask.
  - **Recording:** `floorPath(d)` walks back from her room through `room.from`, giving `[{ s: side, k: kind }]` (both absent for a floor's first room). On taking the stairs, `go()` pushes `{ f, a: arrived, e: deadline, left, rooms }` onto `st.path`; the floor she is on is read live. About 100 bytes a floor (a simulated six-floor run: 991 bytes), so every floor is kept. `path` is cleared by `reset()`.
  - **Drawing:** four floors to a row, 19 columns each (76 wide, the worst case of seven steps one way fits). Rooms on even rows from the bottom, two columns left or right of the last by the side taken; on the odd row between, a `\ /` fork under each offer room (a `|` under the lone wildcard door); an `x` on the child's row where the other door would have led. `[^]` first room, `[@]` her room, `[v]` the last room of a finished floor.
  - **Marks, never names:** `"` warm (den), `~` quiet (bay), `:` signal (relay), `$` cold (vault), `*` ash (forge), `&` glow (altar); the legend lists only the marks that appear. The current room and a floor's last room show `@`/`v` in place of their mark.
  - **To move later (dev):** to the end-of-run screen only. A sideways version was considered and dropped.
- **Controls, settled after four passes:** compass letter between `[ < ]` and `[ > ]` again; `st.actLabel` centred above `[ ^ ]` on row `VH - 3`, flanked by `[ < LEFT ]`/`[ RIGHT > ]` while both doors are locked; the `[ ENTER ]`/`[ OPEN ]`/`[ DESCEND ]` overlays removed (the word is a `do` button). Looking moved to the bottom bar: `LOOK_[U]P`, or `LOOK_[D]OWN` while she looks at the sky (underscore by the dev's ask). Keys: U cycles, D looks down, Q/E the left/right door (they were A/D for one release), W/Enter enter, up arrow `do`.
- **`minimap()`:** doors on row 0, her room on row 2 (`ME`), two rooms behind her; the facing mark has row 1 to itself when she faces the doors.
- **Dissonance retuned (`rules.js`):** `DISSONANCE_FIGHT = { 1: 0, 2: 1 }` (was `{ 1: 1, 2: 2 }`), and `wearTension()` is called from `fight()` only when the demon falls (was every round). Gap 1 now costs nothing anywhere (linger and skip were already 0 at gap 1), so NEUTRAL is the bridge and the starting party (CHAOS, NEUTRAL, CHAOS beside a NEUTRAL KURA) takes no tension wear. Checked: four long fights with a NEUTRAL KURA leave all three at 5; with KURA held at LAW, ELF and CU SITH drop about 1 per fight and PIXIE stays at 5. The dev's report that prompted it: PIXIE left after being talked to once (two fights had zeroed her).
- **Hold Omen:** `showInv()` falls back to a greyed, inert `Hold Omen` button whenever none of the live states applies (the charge is spent, a demon is here). Before, the button vanished once the day's door was opened, which read as the feature being gone.
- **Fight-end screen:** the click/Enter skip added in v0.74 is removed; `closeFound()` returns while `doneTimer` is running, so it closes only from `[ OK ]` after the last beat.
- **README screenshot** points back at v0.72's in-game shot (v0.75's is the log).
- **Tested lightly:** Node prints of the tree and the Dissonance check; three short Playwright passes over the controls, the bag and the log. Zero page errors.
