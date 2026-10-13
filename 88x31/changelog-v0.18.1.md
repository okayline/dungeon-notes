# 88x31 cLuB — Dev Changelog — v0.18.1

Detailed changelog for the 88x31 game (public repo: okayline/88x31, live at 88x31.app).
The public repo keeps a shorter, general changelog. Newest first. Times are Hawaii time (HST).

---

## v0.18.1 — "Hold Still"
**Mon Oct 12, 2026 · 11:00 PM HST**

- User report: picking a GIF in Found a Button "did nothing". Local Chromium test showed the picker/preview working, so likely causes: messages (e.g. wrong-size warning) went to #msg at the top of the page, out of view; and/or a cached old app.js with the new index.html.
- Fixes: inline `#add-status` line in the form for every upload message (loading, wrong size, unreadable, adding, server errors); `app.js?v=0.18.1` / `style.css?v=0.18.1` cache-busting (bump the tag on future releases); listener via addEventListener.
- Layout: form moved out of the left wall column to below the info window (single-column layout, so info now sits above upload). Info body fixed height 360px (300px under 560px wide), scrolls inside.
- Preview centered; auto-suggested name follows the picked file until the user types (`data-auto`).
- Footer v0.18.1.

## v0.18 — "Shiny Happy Buttons"
**Mon Oct 12, 2026 · 10:47 PM HST**

Big model change: the art is a shared design nobody owns; the **foil** is the owned layer on each copy. Lets the cLuB carry real GeoCities-era buttons (archive tier) without claiming the art. Only moves forward: no existing copy or ledger entry was rewritten.

- **Migration 013_foils_uploads.sql** (must run on live D1; additive only):
  - `foils` registry: id, name, effect, params JSON, weight (/1000), max_per_design, design_id (signature foil), rarities JSON, status, sort. Seeded: clear (920), holo (80, cap 25 per design).
  - `instances.foil`, `instances.foil_seed`. NULL foil = **First Print** (every pre-v0.18 copy).
  - `designs.tier` (original | permissioned | archive; existing = original), `designs.found_by`, `designs.original_image_key` (kept while removed).
  - `design_images` (uploaded GIF bytes in D1), `users.upload_blocked`, `admin_actions`.
  - Froze the 4 baked holo designs (`status = 'frozen'`: Bodacious/Cool Site!/Radical!/Synthwave Holo). Not in pulls (pull/mint require `active`), still on the Wall with a "❄ Frozen" note. Gold/Rainbow/Moonlight/Blacklight/Golden Egg/Golden Floppy/Kimono art variants untouched.
- **Foil roll** (`rollFoil` in lib/game.js): weighted over active foils allowed for the design (signature lock, rarity list, per-design cap); falls back to clear. `mintStatements` is now async and rolls the foil + a random 31-bit seed; callers in pull, bots, welcome pack updated. Set rewards get clear. Tested: 300 mints on one design → 25 holo (cap hit), rest clear.
- **Ledger**: two new kinds, sealed from tables like the others: `foil` (["foil", instance, design, edition, foil, seed, at]) and `admin` (["admin", id, admin, action, design, user, note, at]). Design records for designs created after V18 (1791878400 = Oct 12 2026 10 PM HST) append `tier, found_by`; older records keep their shape. Full chain verify OK in test (736 entries across all 4 kinds).
- **Found a Button** (POST /api/upload, multipart): real GIF87a/89a with an 88x31 logical screen, ≤100 KB, SHA-256 dedupe against designs.image_hash (dupe → link to existing; removed dupes stay out), 10/day per player + 30/day per IP. Lands as tier archive, rarity common (never ultra), license "Not relicensed", author "Origin unknown, found in the wild" unless given; optional source URL. Finder gets copy #1 (reason `found`) with a rolled foil. Image served by GET /api/img?d=N (removed → 302 to the tombstone). Form lives on the Wall of Buttons (members only), with preview + size warning.
- **Webmaster kill switch** (POST /api/admin, is_admin only; box on the Wall info window and button pages):
  - remove_design: status `removed`, image_key → banners/removed.gif (new 88x31 tombstone), original key saved. Leaves pulls at once; copies stay with owners and show "Removed by request" with credits hidden. Admins still see the real name.
  - restore_design: back to active (old holo designs go back to frozen).
  - block_uploader / unblock_uploader: `users.upload_blocked`; typing "all" in the block window also removes every archive design they found.
  - Everything goes in admin_actions → sealed as kind `admin`. /api/me now returns is_admin.
- **No more CC0 billing**: CC0 lines removed from the info window, "Use this button" box, button checker, README; the certificate no longer has a license line. "Use this button" + signed downloads only for tier original (server enforces in /api/download).
- Archive buttons show an "From the archive" note: found by X, not relicensed, "Is this yours? Sign <webmaster>'s guestbook" (webmaster = first non-bot admin, i.e. kura).
- **Display**: `bannerImg` wraps foiled copies in `.foil-wrap.foil-<effect>`, with `--foil-angle`/`--foil-delay` from the seed so each copy shimmers differently. Only effects in FOIL_EFFECTS are drawn (holo for now); unknown effects show clear, so new foil rows can be added before their look exists. Holo = rainbow gradient sweep, screen blend, respects reduced motion. Button page shows "★ First Print ★" or "Foil: X" with its ledger fingerprint; info window lists special copies by foil.
- Endpoints now returning foil/foil_seed: collection, banner, guestbook gifts, summary, trades, links. designs?id returns tier, found_by, foil counts, webmaster.
- Decisions this session: drop CC0 as a headline; archive tier allowed (Netscape Now! included, user's call); uploads free/open for now, obscene-upload handling later (CSAM scanning tool on Cloudflare suggested); foil kinds/effects to decide later; sets + foils deferred.
- Footer v0.18. Public changelog renamed changelog-v0.18.md.

## v0.17.1 — "Webmaster Mode"
**Mon Oct 12, 2026 · 7:28 PM HST**

- Admins see every hidden button: `uncovered()` in /api/designs returns an always-true set when `viewer.is_admin` (currentUser already selects is_admin).
- To make an account admin: `npx wrangler d1 execute 88x31-db --remote --command="UPDATE users SET is_admin = 1 WHERE name = 'kura'"` (user's kura account).
- is_admin could later gate a private admin page.
- Footer v0.17.1.

## v0.17 — "56K of Pure Fun"
**Mon Oct 12, 2026 · 7:27 PM HST**

- 20 original buttons (`tools/make_batch5.py`, license Original, author 88x31), added via add_banner (seed_new_banners.sql now 40 rows; 50 designs total):
  - Common (10): Cyber Cafe (webring), New Mail! (guestbook), 56K Modem (webring), HTML 4 Life (construction), Virtual Pet (guestbook), CD-ROM (counter), Lava Lamp (neon), Have a Nice Day (guestbook; file have-a-nice-day.gif), MIDI On (neon), Cool Site! (neon).
  - Uncommon (3): Ink Pen (guestbook, writes "sign my book!"), Webring Hub (webring), 1,000,000th Visitor (counter, red/yellow flashing).
  - Rare, cap 25, variants: Lava Lamp Blacklight, CD-ROM Rainbow, Have a Nice Day Gold, Virtual Pet Golden Egg, Cool Site! Holo (shared `foil()` sweep + rainbow double border).
  - Ultra, cap 1: Millennium Fireworks (divider; 6 seeded bursts over a gold "* 2000 *", 16f), The Golden Floppy (construction; variant of Save Often, "Gold"; gold foil sweep, 14f). Hidden on the Wall until owned (v0.16 rule).
- Odds unchanged; with 2 more ultras in the pool, the 0.1% ultra roll now picks among up to 4 unclaimed ultras.
- Not yet in any set (possible future sets: "Dial-Up Days", "Desk Toys").
- Footer v0.17.

## v0.16 — "???"
**Mon Oct 12, 2026 · 7:23 PM HST**

- Hidden buttons on the Wall: rarities `ultra` and `special` (set rewards) = 7 designs. `/api/designs` reads the viewer and returns `{ id, hidden: true }` (no name/image/rarity) unless the viewer has ever been on the receiving end of an ownership_history row for a copy of that design ("uncovered"; stays uncovered after giving it away). `?id=` returns `{ hidden: true }` for those. Holos stay visible.
- Wall: mystery tiles ("?" on dark stripes, dashed border) sorted last; info window shows "A mystery button!" + one of 8 random teaser lines (MYSTERY_LINES). Count line is just "N buttons and counting!" (mystery count removed at the user's request). Wall cache reset on login/logout.
- News ticker no longer names ultras ("found a one-of-a-kind ULTRA button!").
- Decided: owners' pages still show their ultras/rewards publicly, so you can discover secrets through friends.
- Tested (throwaway DB): logged out 7/30 hidden with no names leaked; after space finds Sakura it's visible to space (6 hidden); still visible after gifting it away; holos visible to all.
- Footer v0.16.

## v0.15.1 — "Window Shopping"
**Mon Oct 12, 2026 · 7:18 PM HST**

- Wall info window is no longer a modal: `aside#info-win` lives in the Wall panel. Tried a 2/3 + 1/3 layout with a sticky side window, then settled (user's pick) on full width below the grid. Empty state "↑ Click any button above…"; selected tile gets a yellow outline; clicking scrolls the window into view (`block: nearest`); x resets it. Owners list in 3 columns (2 on phones). Big image scales to fit (`max-width: 100%`), long links/hashes wrap.
- Fix: `.dialog-window`'s 340px max-width overrode the info window; now `#info-win.info-window { width: 100%; max-width: none }`.
- Footer v0.15.1.

## v0.15 — "Wall of Fame"
**Mon Oct 12, 2026 · 7:10 PM HST**

**Wall of Buttons** (`#wall`, public)
- `/api/designs` (all active + reward designs with minted counts) and `/api/designs?id=N` (design row, its ledger 'design' entry, sets it's part of / reward for, with secret sets named "a secret set", and up to 60 copies by edition with owners).
- Grid sorted common → uncommon → rare → ultra → special, with a border legend (special = orange). Clicking opens a gray "info window" (`#info-win`, title bar + x, Escape/backdrop click closes, deep link `#wall/ID` via replaceState on close): 3x image, variant line, rarity/type, copies "n of cap", reward-only note, sets, credits + original link + CC0 download, ledger entry + fingerprints, "Who has one" list.
- About's credits list removed (points to the Wall); `/api/credits` now unused by the UI.

**My Page**
- Nav renamed My Guestbook → My Page; title "Welcome 2 X's Page"; guestbook panel titled "» Guestbook «".
- Top bar restyled to match the footer (transparent, site font, 13px) and links: My Page - Daily Pull - Trades - Wall of Buttons - About - Log Out (`.only-in`); logged out: Join the cLuB! - Wall of Buttons - About (`.only-out`). Footer has the same links; old placeholder footer links (Sign/View my Guestbook, Email Me) removed; `.logout-link` / `.my-page-link` wired by class.
- Hi box: only on your own page (shown by showPage when mine); two-column grid (news left; Save Codes / Check a Button / Visit a page right, bold to match), stacks on phones; last gift got/given show the button image (summary API returns image_key + rarity). Daily Pull removed from the box (it's in the top bar).

**Public pages**
- `#u/NAME` and `#banner/ID` render for logged-out visitors (APIs were already public). Visitors get "Join the cLuB" prompts instead of the sign form, trade panel and link swap; owner-only bits hidden; link requests only rendered for the owner.
- Public/other-player view is pared down via `body.on-page` (`setPageMode` on route/hashchange: hash `#u/x` where x isn't you, or logged out): hides `.site-extra` (green marquee, under-construction block, news ticker, button strip, visitor counter, webring); shows `.page-banner` "~*~ Welcome 2 X's Page ~*~" between the rainbow bars; collection before the homepage link (flex order). Your own logged-in page is unchanged (verified identical render height).

**Fixes**
- Stray "null" text: `Element.prototype.append` patched to skip null/undefined/false, so optional pieces never print (seen on banner pages before).
- Secret-set wording in info window.
- Footer v0.15.

## v0.14 — "Gotta Link 'Em All"
**Mon Oct 12, 2026 · 6:48 PM HST**

**Domain**
- 88x31.app live on Cloudflare (zone + Pages custom domain), confirmed serving v0.13. Old `88x31-d65.pages.dev` forwards client-side (`location.replace` when hostname matches exactly; preview hosts unaffected; zero Function cost) + `<link rel="canonical">`. Cloudflare Bulk Redirects would be the server-side alternative.

**Sets (lib/sets.js, migration 012, seed_sets.sql)**
- `sets` gains slug (unique), secret, reward_design_id, sort. `set_claims(user_id, set_id, instance_id, claimed_at)` PK(user, set).
- Sets: Webmaster Starter Kit (5: Sign My Guestbook, Webring Member, Hit Counter, Email Me!!, Best Viewed 800x600), Neon Lights (6: Neon Nite, Surf the Web, Bodacious, Radical!, Synthwave, Mix Tape), Under Construction (3: Under Construction, Made with Notepad, Save Often), Island Time (2: Island Life, Island Life Moonlight), Holo Hunter SECRET (3 holos). Seed matches designs by name.
- Rule: own every design in the set at once (unconsumed copies); claim once; keep the buttons; bots refused. Claim batch: INSERT OR IGNORE set_claims guarded by an owns-all count → mint reward (`changes() = 1` chain) → history reason `set_reward` → backfill set_claims.instance_id. Editions = finishing order.
- Secret sets hidden from `setsFor` until complete or claimed; API returns `secrets_left` for the hint.
- Reward designs: rarity `special`, status `reward` (excluded from pulls and bot pools by `status = 'active'` filters). `add_banner.py` gained `--status` and the `special` rarity. 1200 test pulls rolled 0 reward designs.
- Reward art (`tools/make_rewards.py`, original): Island Time Complete (sun setting, 6f), We Built It! (hard hat + blinking check, 2f), Neon Master (neon flicker, 10f), Certified Webmaster (spinning wireframe globe, rainbow WEBMASTER, scrolling marquee, sparkles, gold shimmer frame, 16f; the "cool" one), Holo Hunter (trophy + rainbow holo sweep, 12f).
- UI simplified at the user's request (to revisit later): one `<details>` line per set ("Name have/total" + Claim reward! / ★ done!), expand to see buttons (missing ones grayscale) and the reward name. Dashboard line when sets are ready.

**Link exchange (lib/links.js, /api/links)**
- `users.my_button`; `link_exchanges(from_user, to_user, status pending|accepted)`. Actions request/accept/decline/remove; requesting someone who already asked you = accept.
- Card = My Button if still owned, else first arranged wall button, else newest (`cardSql`, correlated per row). Cool Links show cards linking to homepage (or guestbook). Owner: My Button chooser, pending requests (Swap!/No thanks), unlink (in-game confirm). Visitors: Swap links! / sent / accept / linked + unlink.
- Bots accept link requests on `check` visits with their replyChance.
- Guestbook API now reads the viewer (link_state, link_requests for owner, my_card). Summary: sets_ready, link_requests.

**Home**
- Logged-in default route is your own guestbook; [Home] removed from the top bar (My Guestbook - Trades - About - Log Out); Daily Pull via the dashboard and #pull.

**Ideas noted for set rewards beyond buttons:** unlockable guestbook themes, name badges/titles, bonus packs, guestbook decorations (sparkle cursor, animated frames, MIDI player icon), first-finisher hall of fame.
- Footer v0.14.

## v0.13 — "Hi, Welcome Back!"
**Mon Oct 12, 2026 · 6:26 PM HST**

- v0.12.1 result: `/api/pubkey` → `status: "ok"` (user's browser; my fetch tool showed stale responses for several minutes, so trust the user's browser for live checks). Signed download verified end to end; user opened the GIF in Notepad and saw the stamp (the stray char after "art:" is the 255-byte sub-block length marker).
- Layout: logged-in menu split in two. Top: slim one-line `nav.top-bar` [Home] - [My Guestbook] - [Trades (n)] - [About] - [Log Out]. Under the second rainbow hr: `section#dash` "Hi, name!" with summary list, [Daily Pull] [Save Codes] [Check a Button], and the visit search. Both shown by `showTop` whenever logged in (hidden on the save-code card).
- `/api/summary`: packs left today (regular packs only, bonus `#b` excluded), open trade offers, last gift received / given (reasons guestbook, pass_on, gift, trade), guestbook messages today, button count. Refreshed on login, on returning Home, and after keeping a pack.
- News ticker tried at the top of the page, then moved back above "Buttons you can collect" (kept the yellow "NEWS:" tag).
- Guestbook themes (migration 011 `users.theme`): starry (default), geo (classic gray, Times), hacker, bubblegum, ocean, goth, construction (dashed borders), vapor. CSS custom properties `--gb-panel/text/ink/link/edge` applied as `.gb-<name>` on `#view-page`. Swatch picker under your own collection; saved via `/api/profile {theme}` (whitelisted). Bots get persona themes (h4x0r hacker, kawaii bubblegum, skater construction, dave geo, angel vapor, goth goth, webmaster ocean), filled by `ensureBots` when theme is null.
- "Arrange my wall" moved to the bottom right of the collection panel.
- Pull form: gift options first, "No thanks" last (still default); button reads "Keep <name>!" or "Keep <name> & send the gift!", updating live.
- Stale-content fix: `loadSeq` counter in showPage/showBanner; content cleared to "Loading..." immediately, late responses discarded. hashchange scrolls to top.
- [Home] added.
- Domain: user registered **88x31.app** (Oct 12). Plan: add zone to Cloudflare, point registrar nameservers at Cloudflare, then Pages → Custom domains. pages.dev keeps working; sessions are per-host so players log in once on the new domain. Certificates embed the request origin, so new ones will say 88x31.app.
- Footer v0.13.

## v0.12.1 — "Plug It Back In"
**Mon Oct 12, 2026 · 6:02 PM HST**

- After setting `SIGNING_KEY` (PowerShell pipe, then re-set via `cmd /c "node make_key.mjs | npx wrangler pages secret put ..."`) and a successful redeploy, `/api/pubkey` still returned `{"key":null}`. Secret shows in dashboard as Secret / Value encrypted.
- `privateJwk` now tolerates mangled input: strips NULs (UTF-16 piped as bytes) and BOM, trims, falls back to extracting the first `{...}`, then to regex-picking `d` and `x` (handles PowerShell stripping quotes). Tested: clean, BOM, CRLF, single-quoted, quotes stripped, UTF-16 all sign + verify.
- `keyStatus(env)` → "missing" | "unreadable" | "ok"; `/api/pubkey` returns `{ key, status }` for diagnosis.
- Footer v0.12.1.

## v0.12 — "Take Me Home"
**Mon Oct 12, 2026 · 5:50 PM HST**

**Decisions**
- All cLuB art is CC0 (no forced attribution; let it spread organically).
- Option A: owners get a signed, stamped download; anyone can download the plain CC0 picture. Right-click/screenshot always works anyway; a screenshot strips the hidden block and is just the free picture.
- The file is a dated certificate, not the asset: copies are byte-identical, so "the one" is the ledger entry. Only the owning account can gift/trade/stamp/download-signed. The secret key is never in the file, only the signature.
- Planned next: upload-as-seed ("Barcode Battler") generated buttons; image hashed in the browser, never uploaded or shown.

**Certificates (lib/cert.js)**
- Ed25519 via WebCrypto. Secret `SIGNING_KEY` (private JWK) set as a Pages secret; made by `tools/make_key.mjs` piped into `wrangler pages secret put` so it's never displayed. Public key = JWK `x`, shown on About and at `/api/pubkey`.
- Stamp: "88x31 cLuB certificate v1" + `key: value` lines (copy, button "#n of cap", issued_to, homepage, ledger "#id hash" of the transfer that gave the current owner the copy, issued_at ISO, page URL, art credit, license CC0) + `sig: base64` over everything above it.
- `addGifComment` inserts a comment extension (0x21 0xFE, 255-byte sub-blocks) right after header + LSD + global color table, sets GIF89a; existing credit comment kept. `readGifComments` parses extensions and image descriptors.
- `/api/download?id=N` (owner only, 403 otherwise; 503 if no key): seals the ledger, builds the stamp, fetches the static GIF via `env.ASSETS.fetch`, returns attachment `<image-file>-<edition>.gif`.
- `/api/verify {stamp}`: checks signature, returns fields, the copy's current owner, and whether the stamped ledger entry id+hash still matches.
- Checker page `#check` (public): reads the GIF in the browser (duplicate of readGifComments in app.js), sends only the stamp text. Messages for no certificate / not genuine / genuine (issued to X, owned now by Y, ledger ok).
- Tests: stamped GIFs identical in frames and pixels to originals (+~218 bytes), identify OK; editing issued_to fails; stamp signed with another key fails; non-owner download 403; after gifting, verify shows issued_to space / owner sam.

**Homepage + wall**
- Migration 010: `users.homepage`; `idx_wall_instance`. `/api/profile {homepage}`: http/https only, adds https:// if missing, needs a dotted host, ≤200 chars. Shown on guestbooks as "★ Visit my homepage ★" (rel noopener nofollow ugc).
- `/api/wall {order}`: rewrites wall_slots for owned copies. Collection API orders by slot then newest. Transfers and accepted trades delete the moved copy's wall slot.
- Arrange mode: pointer events (mouse + touch), elementFromPoint to reorder, links disabled while arranging, Save/Cancel.

**UI / copy**
- "Use this button" box on banner pages: owner signed download, plain download, copy-paste snippet (owner can link to homepage or the copy page; owner snippet references their own `name-edition.gif`).
- About page rewritten in a light 90s voice; new "Take Buttons Home" section; ledger text updated for daily full checks. Nav + footer "Check a Button". Pull text "Each pack has 3 buttons".
- Footer v0.12.

## v0.11 — "Defrag"
**Mon Oct 12, 2026 · 5:20 PM HST**

D1 usage review (Oct 11): well under 1% of free limits (5M rows read/day, 100k written/day, 5 GB; 100k Functions requests/day shared with Daily Dungeon's Worker; static assets free). Fixed the three things that would grow:

- **Incremental ledger verification.** Migration 009 adds `meta(key, value, updated_at)`. `verifyLedger` stores a checkpoint `{id, hash, full_at}` and normally only verifies entries with `id > checkpoint` (after confirming the checkpoint row's hash is unchanged; if not, falls back to a full walk). A full walk from genesis runs when the last one is >24h old (first visitor of the day pays it) or on `{ full: true }`. Test (325 entries): first check full; repeat reads 0 new rows; an edit to entry 50 is missed by the quick check and caught by the next full check; tampering with the checkpoint entry is caught immediately.
- **Ticker.** Migration 009 adds `idx_history_reason(reason, id)`. `/api/feed` now runs one indexed query per reason (guestbook, pass_on, gift; LIMIT 10 each, confirmed `SEARCH ... USING COVERING INDEX idx_history_reason`) and finds ultra finds starting from ultra designs (a handful of rows). The JSON response is cached in `meta('feed')` for 60s.
- **Bot accounts.** `ensureBots` does one `SELECT ... WHERE name IN (7 names)`; writes only if a bot is missing or not flagged. Saves ~14 writes per bot action (~400-500/day).
- Bot simulation re-run: 35 actions per bot day (2 pulls each), 0 duplicate claims.
- Footer v0.11.

## v0.10 — "Breaking News"
**Sun Oct 11, 2026 · 10:32 PM HST**

- `/api/feed`: last 25 ownership_history rows that are gifts (`guestbook`, `pass_on`, `gift`) or ultra finds (`daily`/`welcome` with rarity ultra), plus the last 10 accepted trades (one line per trade, both sides from trade_items), merged by time, top 20.
- Front-page ticker ("~ Recent Trades & Gifts ~", above the button strip): yellow-on-black scrolling crawl, items joined with "***", animation duration scaled to text length (≥20s), refreshes every 3 min; static/wrapping under reduce-motion. Visible logged out.
- Player search: removed the always-visible player list box (it also had a bug printing "null" after real players' names, from passing null to DOM `append`). Briefly built a custom type-ahead dropdown, then removed it: the browser's native `<datalist>` suggestions were already what was wanted. `loadPlayers()` now only fills the datalist.
- Hit Counter card showed no image in a screenshot; the GIF is valid (8 frames, deltas) and unchanged since v0.2. Probably still loading; user had left the page. Watch for it.
- Footer v0.10.

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
