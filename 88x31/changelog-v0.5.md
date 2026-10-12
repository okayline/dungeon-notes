# 88x31 cLuB — Dev Changelog — v0.5

Detailed changelog for the 88x31 game (public repo: okayline/88x31, live at 88x31-d65.pages.dev).
The public repo keeps a shorter, general changelog. Newest first. Times are Hawaii time (HST).

---

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
