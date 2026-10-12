# 88x31 cLuB — Dev Changelog — v0.9

Detailed changelog for the 88x31 game (public repo: okayline/88x31, live at 88x31-d65.pages.dev).
The public repo keeps a shorter, general changelog. Newest first. Times are Hawaii time (HST).

---

## v0.9 — "Will Trade 4 Holos"
**Sun Oct 11, 2026 · 10:23 PM HST**

**Trading (lib/trades.js, /api/trades, /api/trades/act; migration 008)**
- `trades` gains `lock_token` and `expires_at` (7 days). Up to 3 buttons per side; both sides required (gifts are for one-sided giving); ultras excluded on both sides.
- Propose: one batch locks each offered button with the trade's token (`locked = token WHERE owner AND locked = 0`), inserts the trade only if all N got locked, inserts trade_items via the token, and releases partial locks if the trade wasn't created.
- Only the offerer's buttons are locked; the receiver's aren't (prevents griefing by spamming offers). Accept re-checks them atomically.
- Accept (one batch): lock the wanted buttons with a second token (still owned, free, not ultra); flip status to accepted only if both lock counts match; write ownership_history rows (reason `trade`, ref_id = trade id) guarded on `accepted`; swap owners and unlock by token; release token-2 locks if it didn't go through. If it fails, the trade is closed as cancelled and the offer's locks released.
- Decline (receiver) / cancel (offerer) close and unlock; `expireTrades()` runs before reads and on accept.
- Account deletion now unlocks buttons held by the player's open trades (both directions) before deleting trades.
- Collection API returns `locked`; the gift picker hides locked buttons; the trade builder greys them out.
- `/api/me` returns `trades_waiting`; nav shows "Trades (n)" in yellow. Guestbook API returns accepted trades for the page owner, rendered as "⇄ TRADE" entries merged with messages by time.
- Tests (13 checks, throwaway SQLite): one-sided/ultra/other's-button/double-locked offers refused; offerer can't accept; swap + unlock correct; double accept refused; moved-button accept closes cleanly and unlocks; cancel permissions; expiry unlocks; ledger verifies.

**Bots and trades**
- Each persona has a `trades` style; value = common 1 / uncommon 3 / rare 10 (+2 favorite type): greedy (h4x0r, dave: only if strictly ahead, never give rares), fair (skater, webmaster: get ≥ give), soft (kawaii, angel: get ≥ ½·give, 90%), rares-only (goth). `botLikes` exported for testing; matrix verified.
- Bots answer during `check` visits; `replyChance` decides whether they look at offers that visit (forgetful bots can take days).

**Packs**
- `PULLS_PER_DAY = 2` (lib/game.js). Pack keys: "YYYY-MM-DD", "YYYY-MM-DD#2"; one open at a time. Pull page shows "Pack n of 2 today". Bots get `pull2` actions too.
- Bonus packs: `BONUS_CHANCE = 0.05` per regular pack; one slot becomes the `BONUS` marker (-1). Picking it closes the pack and creates "YYYY-MM-DD#bN" right away (not counted toward the daily limit, never contains another bonus). Can't be gifted. Bots don't get bonus cards. Tested with Math.random forced.

**UI**
- In-game dialog window (`ask()` / `askText()`, navy title bar, gray beveled body, no dimming, Enter/Escape) replaces every confirm()/prompt(): gift stamping (shows the button at 2x), trade accept, remove save code, name a new code, delete account.
- Ledger timestamps (`toLocaleString`) on the About page, banner travel logs and "Design recorded". About ledger list is now two lines per entry (small time + fingerprint, then the description at 14px) with wrapping.
- Footer version v0.9.

## v0.8 — "Be Kind, Rewind"
**Sun Oct 11, 2026 · 10:11 PM HST**

**Buttons (8 new; 25 designs total)**
- From public-domain Openclipart art by j4p4n (`tools/remix_batch3.py`, sources in `sources/openclipart/`):
  - Synthwave (/detail/301642, common, neon): crop on the striped sun + script; magenta grid pixels (r>150, b>150, g<120) brightness-pulsed over 8 frames (0.75-1.25x).
  - Synthwave Holo (rare 25): same pulse + rainbow foil sweep, 12 frames.
  - Island Life (/detail/302821, common, divider): 1640px-wide center crop of the sunset and palms, static.
  - Island Life Moonlight (rare 25): full-res recolor by hue class: white stripes → (40,44,90), blue-violet palms → (14,12,34), ocean → (20,50,80), pixels inside the sun circle → pale moon gradient, warm sky → night gradient; 14 twinkling stars in the upper band, 8 frames.
- Original art drawn in Pillow (`tools/make_originals.py`, license "Original", author 88x31), all common:
  - Mix Tape (neon): cassette with reels rotating 60° per frame, scribbled label.
  - Y2K Ready (counter): LCD clock 11:59 1999 → 12:00 2000, READY lights up, blinking check.
  - Save Often (construction): floppy + 8-step progress bar. (Text overflowed twice; final is DejaVu Bold 8, measured and centered.)
  - Aliens Welcome (webring): saucer bobbing ±2px, beam on alternate frames, twinkling stars.
- All added via `tools/add_banner.py` (credits in GIF comment); `seed_new_banners.sql` now has 15 INSERT OR IGNORE lines (safe to re-run).

**Other**
- Footer shows the version (`<span id="version">v0.8</span>`); bump it on every release.
- `/api/players`: all users (real first, then bots) with button counts, limit 500. Shown as a filterable, clickable list under "Visit a guestbook" (filters on input), plus a `<datalist id="player-names">` used by the visit box and the daily-pull "Send it to" box.
- Bots count on the visitor counter: each bot action increments `counters('visits')` in the same batch as `last_seen`.
- Discussed: no formal friend system for now; clickable names + gifts are the social graph. Link exchange is the planned friends feature.

## v0.7 — "brb mom needs the phone"
**Sun Oct 11, 2026 · 9:53 PM HST**

**Staggered bots**
- Replaced the once-a-day `bots_day` claim with per-action scheduling. Each bot has `hours` (HST, end may pass midnight): 1337h4X0R 20-27, xX_KaWaII_xX 15-22, SkAt3rDuDe 10-18, DiAl_Up_DaVe 19-25, AnGeLbAbY 14-21, GoThIcRaVeN 22-28, WeBmAsTeR_Ray 7-17.
- `schedule(bot, day, dayStart)`: seeded RNG (FNV-1a hash of name|day → xorshift-style mixer) picks due times inside the window for `pull`, `sign1..N`, and `check`. Same schedule on every request.
- Bot day runs on Hawaii time (`botDay()`); each call also evaluates the previous bot day so actions scheduled past midnight still run.
- Migration 007: `bot_runs(bot_id, day, action, done_at, PK(bot_id, day, action))`; each due action is claimed with `INSERT OR IGNORE` before running, so concurrent requests can't double-run it. `counters('bots_day')` is now unused.
- Gift cap (4/day to real players) now counted from ownership_history since the bot day started (`giftsToRealToday`), since actions are spread over many requests.
- Actions only run when someone visits, so a quiet stretch means a small catch-up burst on the next visit.

**Check-messages visit (`check` action)**
- Reads entries on the bot's guestbook since its previous check (or the last ~day). For each new author (max 5 messages): signs back with chance `replyChance` using persona `replies` lines. Reply rates: kawaii 0.95, angel 0.9, skater 0.7, webmaster 0.6, h4x0r 0.5, dave 0.35 ("modem died"), goth 0.3.
- Replies use the day key `"<date>:reply"` so a bot can both sign and answer the same page on one day (bug found in testing: same-day signatures were blocking replies).
- Thank-you gift: if the incoming message carried a gift, chance `thankGiftChance` to stamp one back (givers prefer holos for real players; hoarders never give rares), within the daily cap.
- Spare swap: 50% chance to give a duplicate copy (never ultra; hoarders keep rares) to a random other bot (reason `gift`).
- Migration 007 also adds `users.last_seen`; updated after every bot action. Bot guestbooks show "<bot> was last online N hours ago" (`ago()` helper). Only bots expose last_seen in the API.

**UI**
- "Stamp a Gift!" button next to "Sign Guestbook!" opens a grid of your buttons; picking one shows "Stamping: [img] name #n [remove]" and the button becomes "Change Gift". Replaces the dropdown.
- Banner page ownership line: "Owned by X · received from Y as a guestbook gift on DATE" (or "found in a daily pull", "in their welcome pack", "from a former player").

**Tests (throwaway SQLite, fake clock stepping 30 min over 26 h)**
- Actions spread through the day (7:30, 8:30, 11:00 ... 00:30, 03:00 HST), 0 duplicate claims, 28 actions per bot day.
- With a player signing kawaii (with gift), goth and dave: kawaii replied 3/3 runs, goth 1/3, dave 0/3.
- Today (Oct 11) the bots already ran under the v0.6 system, so they get one extra round on deploy day.

## v0.6 — "You've Got Bots"
**Sun Oct 11, 2026 · 9:45 PM HST**

**Bots (lib/bots.js)**
- 7 bot accounts with 90s personas: 1337h4X0R-bot (l33t, keeps rarest, hoards holos), xX_KaWaII_xX-bot (":3", random, gives holos, gift chance 0.6), SkAt3rDuDe-bot (neon, gives), DiAl_Up_DaVe-bot (counter, hoards), AnGeLbAbY-bot (guestbook, gives), GoThIcRaVeN-bot (rarest, hoards), WeBmAsTeR_Ray-bot (construction, gives). Each has 5 slang guestbook lines and a signs-per-day count (1-3).
- Migration 006: `users.is_bot` column; `counters('bots_day')` stores the last bot day as YYYYMMDD. Bot accounts are created lazily (`INSERT OR IGNORE`) with no save codes, so nobody can log in as them.
- Wake-up: `/api/me` (every page load) calls `runBotsIfDue` via `context.waitUntil`, so the page doesn't wait. A conditional `UPDATE counters SET value = today WHERE value < today` claims the day; only one request wins.
- Bot pulls: 3 cards rolled from a bot-only pool. No ultras ever; a capped design (rares) is only eligible while minted < cap/2, so bots can take at most half of any holo run. Odds are the normal table minus the ultra slot. Kept card chosen by persona (rarest / favorite type / random). 40% chance to pass one of the other two on.
- Guestbook signing: each bot signs `signs` pages, targeting a real player 60% of the time when any exist, otherwise another bot. Gift chance per signature; hoarders never give rares; givers offer a holo first when signing a real player's page. Gifts use the normal locked transfer batch, so they show in travel logs and the ledger. Same one-per-page-per-day rule (duplicates skipped).
- Cap: at most 4 gifts (pass-ons + stamped) to real players per bot day, total.
- Ledger sealed at the end of the bot day.
- Signup now rejects names ending in `-bot` (reserved).

**Showing bots**
- `userByName` returns `is_bot`; collection API returns `owner.is_bot`; guestbook API returns `author_is_bot`.
- Bot guestbooks show a green "[BOT]" note ("plays once a day, can never win ultras"); bot messages carry a [BOT] tag.
- "show bot messages" checkbox on every guestbook: toggles a `hide-bots` class (CSS hides `.from-bot` entries); choice saved in localStorage (`show-bots`), wrapped in try/catch, default on.

**Test (throwaway SQLite, node:sqlite shim of D1)**
- First call ran the day; second call same day returned false. 7 bots created; 12 copies kept (7 common, 3 uncommon, 2 rare); 0 ultras; 13 guestbook entries; exactly 4 gifts to the 2 test players; ledger 30 entries, verified.

## v0.5 — "Welcome 2 the cLuB"
**Sun Oct 11, 2026 · 9:35 PM HST**

- Homepage title and browser tab renamed to `~*~ 88x31 cLuB ~*~`.
- Star background now fixed: moved from `body { background-image }` to a `body::before` layer with `position: fixed; inset: 0; z-index: -1`, so page content scrolls over a still starfield. Chosen over `background-attachment: fixed` because iOS Safari ignores that. Reduce-motion users get the plain dark sky (`body::before { background-image: none }`).
- Ledger list on the About page pluralizes copy counts ("1 copy" for ultras instead of "1 copies").
- Changelogs split: detailed dev log here in dungeon-notes/88x31/, general one in the public repo.

## v0.4 — "Holo Foil & Gold Leaf"
**Sun Oct 11, 2026 · 9:27 PM HST** · commit `e3fb638`

**Buttons (7 new, all from public-domain Openclipart art)**
- Bodacious (j4p4n, /detail/290006): common, unlimited. Tight crop on the word; background hue cycles in 4 frames while the orange/yellow lettering is masked out of the shift.
- Bodacious Holo: rare, cap 25. Rainbow foil band screen-blended diagonally across 12 frames, faint foil tint, 3 twinkles per frame, rainbow double border.
- Radical! (Briana83 "Crazy Star", /detail/219559): common. Star rotates 360/7° over 8 frames (seamless loop for a 7-point star), crop loose enough to read as a star with points cut off; "RADICAL!" in DejaVu Sans Bold 13 with 1px black outline.
- Radical! Holo: rare, cap 25. Same foil sweep; text cycles rainbow colors.
- Four Kimono Ladies (j4p4n, /detail/213114): common. Whole strip, center-cropped to 88:31.
- Four Kimono Ladies Gold Leaf: ULTRA, cap 1. Pale background pixels (r>200, g>185, b>170, |r-b|<60) replaced at full size with a gold-leaf texture (24px sheet squares + noise), then shrunk; gold shimmer line crosses once per loop; gold double frame.
- Four Kimono Ladies Sakura: ULTRA, cap 1. Original colors, 9 drifting pink petals over 16 frames, light pink foil sweep + pink glaze, pink/white frame.
- Remix scripts: `tools/remix_batch1.py`, `tools/remix_batch2.py`; sources and credits kept in `sources/openclipart/` (CREDITS.md).

**Rarity & odds**
- New `ultra` rarity. Odds moved to per-1000 (`ODDS_PER_1000` in lib/game.js): common 699 · uncommon 250 · rare 50 · ultra 1. Displayed as 69.9 / 25 / 5 / 0.1 %.
- If a rarity's pool is empty (e.g. both ultras claimed), the roll falls back to common.
- Decided: an ultra shown in a pull but not kept goes back into the pool (copies are only minted on keep/pass).
- Variant links stored in `designs.stats` JSON: `{"variant_of": "...", "variant": "Holo"}`; banner page shows "✦ Holo version of Bodacious ✦".
- Ultra styling: magenta border + white outline; "ULTRA RARE" on banner pages.

**Credits & sources**
- Migration 005: `designs` gains `source_title`, `source_author`, `source_url`, `license`. Placeholders marked `license='Original'`, author `88x31`.
- `tools/add_banner.py`: checks 88x31, refuses NC/ND licenses, writes a GIF comment extension with the credit line, appends to `seed_new_banners.sql` (with `--variant-of`, `--variant`, `--cap`; default caps rare 50, ultra 1).
- `/api/credits` endpoint; About page Credits section; banner page "Art:" line + link to original.

**Ledger moved to its own table**
- Migration 005 adds `ledger(id, kind, ref_id, record, prev_hash, hash, created_at, UNIQUE(kind, ref_id))`.
- `kind='design'` records: `["design", id, name, type, rarity, max_editions, image_hash, source_title, source_author, source_url, license, created_at]`.
- `kind='transfer'` records: `["transfer", id, instance_id, from_user, to_user, reason, ref_id, created_at]`.
- `hash = SHA-256(prev_hash + "|" + record)`, genesis = 64 zeros.
- Sealing merges unsealed designs + ownership_history by time (designs first on ties). Each INSERT only succeeds if the chain head still equals the expected prev hash, so concurrent sealers can't fork the chain.
- Migration 004's per-row columns on ownership_history are now unused (left in place on the live DB).
- Chain rebuilt once on deploy: head changed from `4fffb517…` to `271015a9…` (21 entries: 17 designs + 4 transfers).
- Banner page: design ledger entry #, design fingerprint, artwork fingerprint, chain check, and a ledger # + fingerprint on every travel-log step. `/api/banner` seals before reading.

**Ops notes**
- First attempt at the seed failed with "table designs has no column named source_title": 005 hadn't applied (likely a raw.githubusercontent.com lag right after the push). D1 rolled back cleanly; re-running 005 then the seed worked.

## v0.3 — "The Ledger Remembers"
**Sun Oct 11, 2026 · 8:51 PM HST** · commit `903e1c3`

- Hash-chained ownership ledger over `ownership_history` (migration 004: `record`, `prev_hash`, `hash` columns). Tested: tampering with one record breaks verification at that entry; account deletion (blanking live user ids) doesn't, because records freeze numeric ids.
- About page (`#about`, works logged out): explains the game and ledger, live chain status, latest fingerprint, 15 most recent entries; `/api/ledger`.
- Visitor counter: `counters` table (migration 003), `/api/hit` (POST increments via `INSERT … ON CONFLICT DO UPDATE … RETURNING`, GET reads). Counted once per browser session (`sessionStorage`); 30/hour per IP before it stops bumping.
- Delete My Account (`DELETE /api/account`, confirm by typing your name): one batch deletes guestbook entries written/received, daily pulls, wall slots, trades, rings owned; blanks user in ownership history, ring members, designs.creator_id, reports; retires owned copies (`owner_id NULL, consumed 1`, edition numbers stay used). Gifts already given stay with recipients; travel logs show "a former player."
- Daily pull: gift choice changed from a dropdown to radio buttons with banner thumbnails; "Send it to" only appears when a gift is chosen. Kept card glows (pulsing yellow/magenta → cyan/magenta box-shadow) with a "★ KEEPING THIS 1 ★" tag; reduce-motion disables the pulse.
- Page widened 640 → 720px so three pull cards fit in one row.
- Global `[hidden] { display: none !important }` so author styles can't un-hide elements.
- Fixed: after signup the hash route switched to the guestbook and hid the save-code card. Now uses `history.replaceState` after "OK, I saved it!".

## v0.2 — "Welcome 2 My Guestbook"
**Sun Oct 11, 2026 · 8:38 PM HST** · commit `91b7b2d`

- 10 placeholder banners drawn in Pillow (`tools/make_placeholders.py`), 6 animated; rares capped at 50.
- Welcome pack at signup: 3 designs, slot 3 forced uncommon.
- Daily pull (migration 002 `daily_pulls`): 3 design ids rolled once per UTC day and stored; keep 1; optionally pass one of the others to a named player. Claim is a conditional UPDATE (status open → done) so double-clicks can't double-keep; kept copy minted first, pass-on only after; if the kept design sold out in between, the pull reopens.
- Minting: `INSERT … SELECT` with next edition = MAX+1 and the cap check in the same statement; history row via `last_insert_rowid()` guarded by `changes() = 1`.
- Transfers: lock with a random per-transfer token (`locked = token`), guarded statements run only while that token holds, then hand over and unlock — all in one D1 batch.
- Guestbooks (`guestbook_entries`, one signature per page per author per UTC day): sign with a message and optionally stamp one of your banners as a gift; it moves to the page owner and stays shown by the message.
- Guestbook = each player's profile page: collection on top, messages below. Footer "View/Sign my Guestbook" wired up.
- Banner detail page with travel log.
- Front page: looping twinkling star tile, floating boxes (drop shadow), marquee, scrolling button strip, flashing NEW!, real animated "Under Construction" bar (from GifCities, decoration only).

## v0.1 — "Under Construction"
**Sun Oct 11, 2026 · 8:05 PM HST** · commits `3c7bf0c`, `5b8a48e`

- Cloudflare Pages + Pages Functions + D1 (`88x31-db`, id 47bef71e-…). Repo public.
- Save-code accounts: 20 chars from a 31-symbol alphabet (no 0/O/1/I/L), ~99 bits; only SHA-256 hashes stored; up to 5 codes per account; sessions as hashed cookie tokens (30 days, HttpOnly, Secure, SameSite=Lax); rate limits on login (10/15 min) and signup (5/hour) by hashed IP.
- Full schema: users, save_codes, sessions, rate_limits, designs, instances, ownership_history, trades, trade_items, wall_slots, rings, ring_members, sets, set_designs, fusions, reports.
- Old-homepage look (Comic Sans, rainbow hr, webring bar, counter, "best viewed in 800x600").
- Deploy note: first project got created as a Worker (failed with an auth error); recreated through the Pages tab.
