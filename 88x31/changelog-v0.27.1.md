# 88x31 cLuB — Dev Changelog — v0.27.1

Detailed changelog for the 88x31 game (public repo: okayline/88x31, live at 88x31.app).
The public repo keeps a shorter, general changelog. Newest first. Times are Hawaii time (HST).

---

## v0.27.1 — "House Special"
**Tue Oct 13, 2026 · 6:43 AM HST** (no migration)

Decisions: "Mixed" pack renamed (user: "could we redesign that one haha"). Name options offered (~*~ 88x31 cLuB ~*~ Pack, Grab Bag, Mystery Pack, Surprise/Goodie Bag, Fan Mail); user picked the cLuB pack, saw three mockups (A Starry Logo, B The cLuB's Button, C Homepage Window) and said "let's put all 3 in!", every one labelled "~*~cLuB~*~ pack" + "Sealed Pack" for consistency. User asked whether opened packs stay on the shelf (no: packsOf only lists opened_at IS NULL; the faded "opened!" tile shows on the pack's own page and for packs opened but not picked from yet); didn't know each pack has its own page ("kinda cool").

- **app.js** `packTile`: no-series, non-special, non-welcome packs → theme `club-a|b|c` = "abc"[p.id % 3] (stable per pack). Parts: A sticker "NEW!" + rainbow `.logo` "88x31"; B `.club-btn` (bevelled 88×31 "~*~ cLuB ~*~" with a glint) + "★★★"; C `.win95` (title bar "~*~ cLuB ~*~" + x, address "88x31.app", starry page "Welcome 2 / ~*~ 88x31 cLuB ~*~" with an under-construction strip). All: `.club-name` "~*~cLuB~*~ pack" + `.pack-sub` "Sealed Pack" ("opened!" when revealed). `packLabel` no-series → "~*~ cLuB ~*~" (titles "~*~ cLuB ~*~ Pack #12", "Special ~*~ cLuB ~*~ Pack #3"; ledger pack lines follow). Webmaster Give packs dropdown (index.html + setupGivePacks) "mixed" → "~*~ cLuB ~*~ pack".
- **style.css**: `.th-mixed` / `.minis` removed; `.th-club-a/b/c` added (`.club-name` 10px, `.logo` rainbow text with scrolling gradient, `.sticker` blinking, `.club-btn` + glint, `.stars3`, `.win95` parts). Still the flat shelf shape, still opens with the reveal (glow → deal & flip).
- Tested in headless Chromium with the real style.css and functions from app.js (ids 12/13/14 → a/b/c, opened variant, titles). No console errors.
- Footer/cache tag v0.27.1.

## v0.27 — "Fresh Packs"
**Tue Oct 13, 2026 · 6:33 AM HST** (no migration; pushed together with the v0.26.1 changelogs)

Decided through six art mockups and an opening-animation mockup (scratchpad, not in the repo). Art: mockup A's art (CSS-drawn themes) in mockup B's crimped pouch shape. Beta back to B's green terminal ("green matrix stuff") with a real Beta button in a window; Gold Master "hackery/techy" (gold disc on a circuit board, green build bar). Shelf packs (daily/welcome/free/mixed) keep A's rounded outline, no crimp, each with a simple picture (user didn't want plain text): sunrise, cursive "Welcome" (replaced a welcome-mat idea), gift ribbon + bow, grab bag of 9 tiny buttons. Used daily: no shine at all. Shine: one per series: Alpha twinkles (sparkles), Beta the CRT refresh line (gold-tinted on Gold Master); shelf packs keep the soft white gleam. Rejected: holo sheen everywhere, gold glint/pulse. **Branding rule: always "~*~" around cLuB / 88x31 cLuB** (on packs: "~*~ 88x31 cLuB ~*~", specials "~*~ cLuB ~*~ · Alpha"), in the site and when Claude talks about it. Openings: series packs "open", shelf packs "reveal". Alpha (and future series): Rip (top tears off) → Deal & Flip. Beta: CRT power off/on (user: "amazing for the beta set"). Shelf: glow-fade → Deal & Flip. Flips slowed down (0.8s each, 0.85s apart). Cursive font: system stack (Snell Roundhand / Segoe Script / Brush Script MT / Lucida Handwriting / Apple Chancery / cursive → Dancing Script on Android); a webfont download was blocked in the sandbox. "Mixed" name kept (user asked what it was: no-series sealed packs from milestones, Request Board thanks, webmaster gifts without a series, set rewards without a series; not a bot thing). Possible later: rename Mixed → GRAB BAG.

- **CSS** (style.css, "pack art (v0.27)" + "opening a pack (v0.27)"): old `.pack-tile` gradient rules (base, .daily/.used/.free/.glow/.welcome/.special/.long) removed. `.pack-tile` is now the outer link (100×136, hover lift; `.pouch` carries the drop-shadow filter so it follows the crimp, `.glow-gold`/`.glow-holo`), `.pack-art` the wrapper (`.flat`: silver border, rounded 4/10px, hard shadow, bg shine; `.pouch`: crimp clip-path polygon + `.crimp.t/.b` strips). Themes `.th-alpha`, `.th-alpha-sp`, `.th-beta`, `.th-beta-sp`, `.th-series` (fallback for series without art), `.th-special` (fallback), `.th-daily`, `.th-welcome`, `.th-free`, `.th-mixed`. Bits: .rainbow/.hazard/.spark (twinkle), .rosette (special_name text), .rain (vertical katakana/01, animates `top`), .scan, .win (88×31 button), .prompt/.cur, .refresh(.gold), .disc (conic, spins), circuit-board SVG data URI, .bar, .ser2, .rays/.sun/.horizon, .confetti, .script, .ribbon-v/-h/.bow/.nmwrap, .minis. `.used`: grey + every animation off + no gleam. Reduced motion: all pack animation off, gleam/refresh/rain/sparks hidden.
- **Openings** (CSS + `openingStage(art, cards, kind)` → `{node, play()}`): stage = `.pull-row` + absolutely centered `.packbox` (non-link clone of the tile). `kind` from `openKind(p)`: no series → `reveal`, Beta → `tv`, other series → `rip`. Deal & flip wraps each real card in `.flipcard > .flip-inner` (front = the real pickable card, `.flip-back` = the old "?" card back, backface-visibility), dealt from the pack's centre (`--dx/--dy` measured after layout, so it works when cards wrap on phones), then flipped in rarity order (`--k`: commons first, rares/ultras last; `.is-rare` gets a yellow flash on its wrapper so it doesn't fight `.chosen`'s glow). Timings: rip deal 0.85s / flips from 2.1s; reveal 0.65s / 1.9s; tv cards power on from 0.75s, 0.2s apart, scanline overlay fades. `.animating` blocks clicks until the end, then removed. Reduced motion → plain `.pull-row`, no stage.
- **app.js**: `packTile(p, href)` rebuilt on `packArt({shape, theme, parts, cls, title, href})` (PACK_TOP, PACK_THEMES = alpha/beta, `packSparks()` with slightly random delays, `packRain()`); `dailyTile(done, label)`, `freeTile()`. Shelf daily tiles, `showPull` (reveal, label "pack N of M" or "bonus pack!"), `openPackCards` (`openKind`), and the front-page free pack (`fpJustOpened` → reveal of its one card right after opening; reloading later just shows the card) use them. Beta pack window shows banners/beta/beta-dos-prompt.gif (a released common, no spoiler).
- Tested in headless Chromium with the real style.css and functions pulled from app.js (all 11 tile types, rip/tv/reveal, rare flips last + flash, clicks re-enabled, no console errors). Not run against a real database.
- Footer/cache tag v0.27.

## v0.26.1 — "Now Scrolling"
**Tue Oct 13, 2026 · 5:56 AM HST** (no migration; two pushes: a01d5b1 welcome screen, 5ad3bac the rest; this changelog + version tag went out with v0.27)

Decisions/rules this round: **the user wants to be asked before any write/edit, and push/build only when they explicitly say so** (a01d5b1 was pushed without asking; the stop hook's "commit and push" reminders are ignored until the user says push). **Every push also updates both changelogs** (public repo's light one + this dev one), renamed to the new version. Marquee content picked from a brainstorm: Request Board nudges, print-run updates, 90s flavor (not chosen yet: big pulls/rares opened, set completions, bot gossip, visitor milestones). User then asked for only ~4-5 marquee items per page load so it isn't so long. Wall sorting switches: admin only; everyone else gets cLuB originals first, found below, one big wall.

- **Welcome screen** (a01d5b1): code card gets `#code-welcome` "Hi, <name>, welcome to ~*~ the cLuB ~*~" (h2, hidden unless a name is passed) above `#code-title` / `#code-intro`; `showCode(code, name)`; free-pack signing calls `showCode(r.code, r.user.name)`. New members: "Here's your save code:" + friendlier intro. Extra codes from Save Codes: "~ Your Save Code ~" + softened intro (was "!!! YOUR SAVE CODE !!!" / "This is your ONLY way back in."). The passkey row (`#pk-card-row`) was already on the card, shown only when `pkSupported()`.
- **Marquee**: `#marquee-text` filled by `loadMarquee()` once per page load (no interval). Lines: `MARQUEE_NEWS` ("LATEST DROP:  BETA SERIES", always first), then one live line from /api/news if any, then random picks from `MARQUEE_HOME` + `MARQUEE_90S` (Netscape 4.0 at 800x600, no frames harmed, don't 4get guestbook, Y2K compliant, don't pick up the phone) + leftover live lines, up to `MARQUEE_SIZE` = 5. Wrapped "*** … ***", animation duration = max(18s, length/6). Static fallback text kept in index.html.
- **/api/news** (new, functions/api/news.js): 60s cache in `meta` key `news` (same pattern as feed). Items: per active series with a print_run, from `seriesPrinted()`: "SERIES X: N OF RUN LEFT IN PRINT", ≤25 left → "ONLY N COPIES OF SERIES X LEFT IN PRINT!!", out of print → "SERIES X IS OUT OF PRINT!!"; Request Board: open + unexpired count → "N WISH(ES) ON THE REQUEST BOARD... FILL ONE 4 A FREE PACK", and "MOST WANTED: NAME (N WISHES)" when the top design has ≥2 wishes. Requests part in try/catch.
- **Spacing**: `TICK_SEP` = 3×NBSP + "***" + 3×NBSP, used by the marquee and the trades/gifts ticker join (was "  ***  ", which collapsed to single spaces).
- **Wall**: `renderWallGrid` reads Show/Order prefs only for `me.is_admin`; non-admins get originals (known shuffled, then their mysteries) followed by found (known shuffled, then mysteries) in the one grid; `#wall-controls` hidden unless admin (stale localStorage prefs ignored for players).
- **Wall scroll fix**: reloading on `#wall/N` scrolled to the info box. `openWallHash(rest, scroll = false)`, `openInfo(id, scroll)`, `openCopyInfo(designId, copyId, scroll)` only `scrollIntoView` when scroll is true; only the in-Wall hashchange (a click) passes true. Admin-box re-renders don't scroll.
- Front page: Free Pack h2 has new.gif on both sides (second one alt=""); passkey login row `— or —<br><br>` (an empty line before the button).
- Not tested against a real database (syntax checks only); /api/news worth a look on the live site.
- Footer/cache tag v0.26.1.

## v0.26 — "Limited Edition"
**Tue Oct 13, 2026 · 5:45 AM HST** (pushed after migration 021 ran)

Decisions this round: found cards stop being guaranteed (people always keep them out of nostalgia): 1 in 5 daily packs (first 1/3, then lowered because crawler bots bring lots of found buttons in); none in series or special packs. Bargain Bin ("leave one, take one": trade a spare common/uncommon for 1 of 2 found buttons, ~3/day, a tile in the Packs section) **saved for later**. Print runs: low, sized to the tiny user base: Beta 500, Alpha 84 + 150 = 234; a series total (not per-button caps), rares 25 / ultras 1 stay; when out of print it just stops (option B), stays active until the user asks me to retire it (no Retire button: "couldn't i just ask you"); sealed packs already out still open with it; fusion doesn't count. Limited packs = the existing special packs, 25 numbered per series, each series names its own ("Beta Gold Master Pack #7 of 25", "Alpha Cool Site of the Day Pack"); other names saved for future series: Big Box Edition, Turbo Pack, Registered Version, CD-ROM Edition, Collector's Edition. Handing them out is admin-only for now. Bots: web crawlers with a 10% series chance (instead of stopping at 50%). Free pack: normal odds minus ultras, held 2 days. Email: Cloudflare Email Service exists (public beta, needs Workers Paid $5/mo, 3,000/mo included, domain on Cloudflare DNS), but the user picked **passkeys** instead (uses them a lot); save code stays as the backup.

- **Migration 021**: series.print_run, special_name, special_limit (25); packs.special_no (+ unique index per series); Beta 500 / Gold Master; Alpha run = its copies + 150 / Cool Site of the Day; `passkeys` (cred_id, JWK, alg, sign_count, label) and `passkey_challenges`.
- **game.js**: `seriesPrinted()` (printed = all instances of the series' designs); `availableDesigns(env, onlySeries, {ignoreRun})` skips out-of-print series (weights shift to the rest), counts unsigned free-pack cards against caps (`HELD_FREE`, `FREE_HOLD` = 2 days, moved here); `rollDesigns` opts `found` (default `FOUND_CHANCE` 0.2; 0 for series packs), `crawler` (all found, `CRAWLER_SERIES_CHANCE` 0.1 one series card, ultra rolls become rare), `ignoreRun`. FOUND_PER_PACK gone.
- **packs.js**: openPack passes series/special rules (no found, `ignoreRun` for series packs) and `crawler` for bots (not for special packs); `specialRun()`; givePacks numbers special packs per series and throws when not enough are left; packsOf/packStory return special_no/special_name/special_limit.
- **admin give_packs**: special needs a series; refuses out-of-print series; refuses bots by name; "everyone" special = people only; admin note "10 Beta Gold Master packs".
- **bots.js**: doPull = 3 distinct found + 10% one series card (rollFor originals); botPool skips out-of-print series; bots open sealed packs crawler-style.
- **freepack.js**: rolls from availableDesigns (found + in-print series) at 699/250/50; replacement card if theirs is gone at signing.
- **/api/series**: printed/print_run/out_of_print (public too), special_name/limit/made (admin); actions `print_run` (raise/set, never below printed, admin_action `series_run`), `special_name`, create takes special_name/print_run. **/api/designs?id** adds series_printed/run/out. **/api/ledger** pack rows carry the limited pack name/number.
- **Passkeys**: lib/passkeys.js (tiny CBOR reader, authData parser, COSE→JWK for ES256/RS256, DER→raw ECDSA sigs, WebCrypto verify; challenges single-use via DELETE…RETURNING, 5 min; origin/rpId from the request URL; sign-count regression refused; attestation not verified) + /api/passkey (GET list, register_options/register (max 10), login_options/login (rate limited) → session, remove). Account deletion removes passkeys.
- **UI**: limited pack tiles (series in the top line, special name, "#N of 25", long names smaller), titles everywhere via packTitle ("Beta Gold Master Pack #1 of 25"), ledger PACK lines name them; Give packs hint "Gold Master Packs: 22 of 25 left", series dropdown marks out of print, inline messages (no more off-screen say()); Series panel rows with print-run bar, Run / Pack name buttons, red "out of print" chip, new-series form takes special name + run; info box "Series Beta print run: 23 of 500 printed"; login box "🔑 Log in with a passkey" + inline errors; code card "Also add a passkey on this device"; Save Codes page → "Save Codes & Passkeys" with the passkey list.
- Tests: daily packs 21% with a found card (never 2); series packs 0 found; crawler 10.2% series, 0 ultras; out-of-print Beta absent from daily packs, sealed Beta pack still Beta; give-packs refusals; numbering 1..16 then "Only 9 left"; special pack opens all Beta with foils; print_run can't go below printed; free pack 71/24/5%; held rare out of pools; a full bot day: 12 found + 2 series kept, 0 ultras; passkeys with a simulated authenticator (register, replay refused, login, copied-counter refused, tampered refused, wrong origin/challenge refused, remove) and in Chromium with a virtual authenticator (sign free pack → add passkey → log out → log in with passkey); ledger verifies.
- Footer/cache tag v0.26.

## v0.25.1 — "Clean Desk"
**Tue Oct 13, 2026 · 4:50 AM HST** (code first, then migration 020)

- **10 tape-era Beta buttons** (user asked for 80s cassette / VHS era tech; on seeing them: "those should be rares!!"; then "maybe some of the more simpler rares should go to uncommon" since rares outnumbered uncommons 16 to 6, so the 4 simplest went to uncommon: Blinking 12:00, REC, Side A, Hi-Fi Stereo; the other 6 are rares, 25 copies each): Blinking 12:00 (VCR VFD clock blinking), REC (camcorder viewfinder, REC blinking, timecode), Be Kind Rewind (rental tape sticker, reels rewinding), Side A (the whole button is a smoky purple C-90), Fast Forward (VCR OSD over streaking color bars), Hi-Fi Stereo (silver badge, LED meters, glint), Tracking (color bars with a noise band until the tracking bar fixes it), Hi-Speed Dubbing (double deck A→B), Boom Box (speakers thumping, EQ), Press Play on Tape (home-computer tape load: PRESS PLAY ON TAPE → OK → SEARCHING → FOUND 88X31 → striped loading border while a synthwave sunset loads line by line → READY.). **Migration 020** inserts them into Beta by series name (INSERT OR IGNORE, re-runnable); also appended to schema.sql. Beta is now 12 common / 10 uncommon / 12 rare / 2 ultra (36). Generator: scratchpad beta/retro_batch.py (reuses hacker_batch helpers; adds 7-segment digits, reels, chunky badge letters).
- **Fix**: v0.25's showWall rewrite cut out `OWNERS_SHOWN` (sat between showWall and openWallHash), so clicking any button threw "OWNERS_SHOWN is not defined". Restored.
- Wall Show/Order controls moved into the panel's top-right corner (absolute, 10px, two stacked rows; centered under the title below 700px), hidden when logged out (and logged out always uses the default shuffle/all view).
- Upload box: "Add as" series picker + rarity/kind removed from the page (user: not needed). /api/upload still accepts `series`, `rarity`, `kind` for webmasters.
- **Cool Links removed** (user: "unnecessary and too much for now", webrings soon): links panel + My Button picker off the page, renderLinks/cardImg gone, /api/links and lib/links.js deleted, guestbook API no longer returns links/my_card/link_state/link_requests, summary drops link_requests (Hi! box line gone), bots stop accepting link requests and lost their "link exchange" replies. `link_exchanges` table and `users.my_button` left in the database untouched.
- **Series panel**: no Retire/Hide (user doesn't want that power on the panel); "Look" toggles the series' buttons open/closed (highlighted while open, switching series swaps it); "Release" only shows on upcoming series. /api/series status action still exists.
- **Public key** moved from under "Raw data" up to right after "Latest fingerprint" in Ledger Status, with clearer text (signs every downloaded button's certificate; anyone can check one is real). It's live (`/api/pubkey` status ok) and is what Check a Button verifies against.
- Footer/cache tag v0.25.1.

## v0.25 — "Hack the Planet"
**Tue Oct 13, 2026 · 4:45 AM HST** (pushed after migration 019 ran)

Decisions: Beta released immediately (no #3 admin stuff); 90s techy/hacker theme for the commons/uncommons after the first batch was "too simplistic"; ultras inspired by the Commons GIF "Locomotive BASIC loading a picture from disk" (CC0), split into a terminal ultra (20 GOTO 20) and a fractal ultra (FRAKTAL.PIC), with the fractal views as rares; rare cap 25 (briefly 50); signature foils for the ultras; credit line in the info box Credits and on copy pages. Special packs now; print runs and limited packs later. Wording: "~*~ tHe cLuB ~*~" in running sentences, "~*~ 88x31 cLuB ~*~" in names/titles; pack tiles and certificate text stay plain. Still later: wishlist, webrings, pack links (door 2), pack party, link-giver thank-you (guestbook note + max 1 pack/week), email reminder on the profile page.

- **Migration 019**: `packs.special`, `pack_openings.finishes`; series 2 Beta (active, sort 2); 26 designs (tier original, series 2; ultras source_title "Inspired by: Locomotive BASIC loading a picture from disk", author "Wikimedia Commons (CC0)", Commons URL); foils `phosphor` "Phosphor Glow" → FRAKTAL.PIC and `scanline` "Scanline Shimmer" → 20 GOTO 20 (kind foil, tier 3, weight 1,000,000, design_id by name). Same SQL appended to schema.sql. Art in public/banners/beta/ (beta-*.gif, fraktal-*.gif, ultra-*.gif).
- **Special packs**: game.js `SPECIAL_ODDS_PER_1000` (rare/ultra doubled, taken from commons), `rollRarity(boost)`, rollDesigns `opts.boost`; packs.js pins one random slot to uncommon, rolls finishes at open (`specialFinishes`: non-signature foils weighted tier 1 ×2.5, tier 2–3 ×3; if none ≥ tier 1, one card re-rolled foil-only), stores them in pack_openings.finishes, merges into options; keepFromPack mints with `finish`. Admin give_packs `special`. UI: "special" checkbox, silver/rainbow SPECIAL tile ("★ foils inside! ★" or "★ series x ★"), "Special … Pack" title + line, "✦ <finish>" on cards. Tested 60 packs: always ≥1 foil, some with 2, finishes kept match what was shown.
- **Signature foil CSS**: `.foil-phosphor` (breathing green glow + halo), `.foil-scanline` (fine scanlines + bright line rolling down); added to DRAWN; reduced-motion stops them.
- **Series**: /api/series GET (counts; admins also `loose` originals and `max_active`; `?id=` designs), POST create (upcoming, admin_action series_create) / status (released_at, warning when >3 active) / assign. Buttons page **Series panel** (admins): table with status chips, Release / Retire / Hide, Look (grid), new series form, loose originals with a series select; inline messages. Upload: "Add as" select (found button / "a cLuB original → Series X") + rarity + kind; originals go in with max_editions (rare 25, ultra 1), no copy #1.
- **Wall**: shuffled per load (random key per design), mystery tiles always last; Show All / cLuB Originals / Found and Order Shuffle / Rarity, remembered in localStorage (`wall-show`, `wall-order`). Hidden entries from /api/designs carry `tier` so filters work.
- **Ledger**: 90s rewrite starting "Every button in ~*~ 88x31 cLuB ~*~"; About loads 15, "Show older entries" pages 100 at a time with `before` until "★ That's the very beginning! ★". Names link to the copy (#banner/id) or, for designs, the Wall when logged in. Server-side spoilers: non-admins get `design:"a mystery button", mystery:true`, ids nulled, for rare/ultra/special designs they've never owned and anything in an upcoming series ("NEW DESIGN a mystery button joined ~*~ tHe cLuB ~*~"). Tested: ultra name absent for a player and logged out, visible to webmaster; paging reaches #1 with no duplicates.
- **Signing**: accounts.js `nameProblem` (format, -bot, reserved, taken, case-insensitive) → "Name already taken!"; signFreePack checks it before Turnstile so a taken name doesn't burn the token. Errors show inline under the signature line (`.sig-oops`), ✓ greys out ("…") while signing; free-pack open errors inline too.
- **Menus**: logged out top bar "Home · About", footer "Home · About". ~*~ wording across running text and the dialog title.
- Footer/cache tag v0.25.

## v0.24 — "First One's On Us"
**Tue Oct 13, 2026 · 3:45 AM HST** (pushed after migration 018 ran)

From the onboarding doc (88x31-club-onboarding-v1.md, Door 1). Decisions: server rolls the card; free card is common/uncommon with foils up to tier 1 (no tier 2/3, patterns or effects); email is skippable when they have the save code, and the email reminder will live on the profile page (not at signing); the free pack **replaces the "New Here?" join box** (login box stays); tile looks like the normal pack tiles with a soft glow; signature line has no button, a ✓ appears at the end once they type (Enter/Go also signs); full disclosure line "(This also creates your account)". Also settled for later: friend-link thank-you = guestbook note + max 1 pack/week; pending pack links cap ~3, return after 7 days unclaimed / 1 day opened-unsigned; pack party after basic links. Turnstile explained and OK'd (user will add keys).

- **Migration 018**: `free_packs` (token_hash of an anonymous `fp` cookie, design, foil, seed, created_at, claimed_by, instance_id, claimed_at).
- **lib/freepack.js**: freePackState (none / waiting / claimed; unsigned > 1 day = none); openFreePack (returns the same card for the same cookie; 3 opens per connection per day; rolls rarity common 699 : uncommon 250 from active-series originals + found, uncapped-or-not-sold-out; finish via rollFoil with tier 2+ weights zeroed; pattern/effect dropped; occasional cleanup of stale unsigned rows); signFreePack (Turnstile check if TURNSTILE_SECRET set, signup rate limit, createAccount, claim-once, mint with `opts.finish` = exactly the shown foil/seed, reason `free_pack`, start session). Nothing is minted or sealed before signing.
- **lib/accounts.js** `createAccount` shared by /api/signup and signing. Free-pack sign-ups get a **sealed WELCOME pack** (pink tile, source `welcome`, keep 2 of 3, user's choice) waiting in their Packs section instead of the old instant 3-button welcome pack (old /api/signup still gives the instant one). Packs where keep ≥ 3 come pre-picked ("They're all yours!"). mintStatements accepts `opts.finish`.
- **/api/freepack** GET (state + sitekey; "member" if logged in), POST open / sign.
- **UI**: "» Free Pack! «" box (teal/blue/purple pack tile with glow) → card (normal card look) + "This one's yours to keep. Sign it to make it official!" + signature line, with "(This also creates your account)" in small text under it, (`.sig-input` underline, cursive) with ✓ → save code card (now with "Print it", print CSS shows only the card) → their page. Turnstile widget rendered explicitly when a sitekey exists. "free pack" labels in travel logs.
- Tests: same card on reopen, 0 copies before signing, bad/reserved names refused, sign → account + copy matching the shown card + session, claimed state afterwards, 600 opens 448 common / 152 uncommon, foil tiers 548/52/0/0, 3 opens per connection, ledger verifies.
- Footer/cache tag v0.24.

## v0.23.1 — "Rip It Open"
**Tue Oct 13, 2026 · 1:50 AM HST** (no migration)

- **Packs section** on your own page, above the "Welcome 2 X's Page" + collection panel: daily pack tiles (orange "DAILY", "pack N of 2", grey "back tomorrow!" once used, from /api/summary packs_left) next to sealed pack tiles (/api/packs). Clicking opens in `#pack-open` inside the section: daily = the old pull flow (keep 1, pass-on gift, bonus pack), sealed = openPackCards (keep 2). `afterOpening()` refreshes the tiles and the page. The old `view-pull` view is gone; `#pull` redirects to your page; the Hi! box "Open them »" scrolls to the section. User loves the pack tiles' shimmer animation.
- Menus: Daily Pull removed; "Wall of Buttons" → "Buttons" (top bar and footer); footer now matches the top bar (My Page · Trades · Buttons · About · Log Out).
- **Upcoming series hidden**: /api/designs (list and ?id) excludes designs whose series is `upcoming` unless the viewer is a webmaster (Wall, collect strip and board pickers all read it); board.js treats upcoming designs as nonexistent for requests/open trades. Tested: hidden for player and logged out, visible to webmaster, appears once the series is active.
- Footer/cache tag v0.23.1.

## v0.23 — "Wanted: Kewl Buttons"
**Tue Oct 13, 2026 · 1:40 AM HST** (pushed after migration 017 ran)

Decisions: a request is just a wish with a system reward (pack to the filler), new-player friendly; anything beyond that is a trade. Requests only for commons/uncommons (rares and up trade-only, since a pack-for-rare swap would drain rares cheaply; ultras never). Optional specific finish. Max 3 open, 7 days. Bots fill and post requests "for now". Open trades added alongside (public offers anyone can accept). Wishlist later. Trades back in the top bar (also stays in the Hi! box). Give packs: "everyone" as the last datalist entry instead of a checkbox; name reserved.

- **Migration 017**: `requests`, `open_trades` (lock_token for offered copies), `open_trade_items`.
- **lib/board.js**: expireBoard (requests expire; open trades expire and unlock); postRequest (common/uncommon, foil must be a real kind-'foil', max 3, no duplicate open request per design); fillRequest (lock token, atomic transfer reason `request` ref request id, wall slot cleared; thank-you pack if the filler has had < 1 `request` pack today, UTC day, note "thanks for helping <name>!"); postOpenTrade (1–3 copies, not ultras, locks them, want design not ultra); acceptOpenTrade (accepter's copy must match design + foil; all-or-nothing batch like acceptTrade; reason `open_trade`; closes cleanly if an offered copy moved); boardFor (open lists + can_fill / can_give for the viewer, plain/newest copies first); wantedOf.
- **API** /api/board (GET board, GET ?user= wanted, POST actions request/cancel_request/fill/trade/cancel_trade/accept). Ledger kind `request` (posting).
- **Bots** (`botBoard`, after the daily pull): fill one request (0.6 for givers, 0.2 others; real players first), accept up to one open trade they like via botLikes + replyChance, 20% post a request for a missing common/uncommon, 10% post an open trade of a spare duplicate.
- **UI**: Trades page gets Open Trades and Request Board panels (collapsible post forms with button/finish selects; own listings first; Fill it! / Accept! with a copy picker; in-game confirms). "★ Wanted:" line on player pages. `.trades-link` in the top bar and Hi! box both get the count. Give-packs datalist has every player then "everyone"; signup refuses everyone/nobody/webmaster.
- Tests: rare request refused, fill → copy moved + 1 pack, second fill same day no pack, 4th request blocked, ultra trade refused, open trade swap both ways + unlock, cancel unlocks, re-accept refused, "everyone" by name, reserved signup, ledger verifies; bot filled a request and posted a request and a trade.
- Footer/cache tag v0.23.

## v0.22 — "Series Alpha"
**Tue Oct 13, 2026 · 1:20 AM HST** (pushed after migration 016 ran)

Decisions: Greek-letter series, everything until now = **Series Alpha**; series contain only the cLuB's originals (found buttons are their own stream, 1 per pack); 3 series in rotation, odds 60/25/15 newest first (one mixed daily pack, option A; chase a series by trading); series are defined by their own ultras and sets; release timing decided later. Sealed packs are items: made when earned, contents rolled at opening, earned packs keep 2 of 3, bots get packs too. Pack sources now: webmaster gifts (player or everyone), visitor milestones, finishing a set; request board (release #2) and webrings later. Print runs per series were floated, not decided.

- **Migration 016**: `series` (Alpha active), `designs.series_id` / `sets.series_id` = Alpha for all non-archive designs and all sets; `packs`, `pack_history`, `pack_openings`; image_key renames hit-counter.gif → tally-88.gif and 1-000-000th-visitor.gif → big-milestone.gif (ad blockers hide those names; old files kept in public/ so nothing broke between migration and push).
- **Series odds** (lib/game.js): `availableDesigns` groups active-series originals by series and rarity; `pickSeries` uses SERIES_WEIGHTS [60,25,15] for the up-to-3 active series (newest by sort first); upcoming/retired excluded; designs with no series count as the newest. `rollDesigns(..., { series })` = series pack. Tested 3000 packs with 3 active + 1 upcoming: 60.0/25.1/14.9%, upcoming never; Beta pack only Beta.
- **Sealed packs** (lib/packs.js, /api/packs): `givePacks` (batched), `openPack` (rolls on first open, stores the 3 in pack_openings, locks the pack so a revealed pack can't be given away; reopening shows the same 3), `keepFromPack` (exactly `keep` picks, claim-first against double clicks, mints with reason `pack` + ref_id pack id), `givePack` (sealed + unrevealed only), `packStory`, `botOpenPacks` (bots skip ultras even if they keep fewer). Ledger kinds `pack` (pack_history rows) and `pack_open` (finished openings; found by NOT EXISTS since openings finish out of order). mintStatements gained `opts.refId`.
- **Sources**: admin action `give_packs` (name or everyone incl. bots, 1–10, optional series, note; logged as admin action); visitor milestones 1000/2500/5000/10000/25000/50000/100000/250000/500000/1000000 in hit.js (once each via meta key `milestone_N`); claimSet gives a pack of the set's series ("for finishing <set>").
- **UI**: Unopened Packs shelf above the collection (own page); `#pack/N` page (open → pick 2 of 3 → story; give sealed pack by name; public story with history, what it held, what was kept, ledger hashes); give-packs form in the Hi! box for admins (series list from /api/series); ledger list shows PACK / PACK OPENED with links; travel logs link copies to their pack; "Series Alpha ·" on info box and copy pages.
- **Small items**: Who has one #number → copy's full page (tiny picture still opens in-box); logged-out Wall pictures only (no info box, tiles are spans, intro line hidden); live "Buttons you can collect" strip (16 random visible incl. found + up to 3 [ ? ] tiles, doubled for the loop); menus say "<name>'s Page" (trimmed at 16 chars); uploads accept 87–89 × 30–32 (user's Internet 6.01 button is 88x32).
- Bots pull only active-series originals.
- Footer/cache tag v0.22. Next: request board (release #2).

## v0.21 — "Surf's Up"
**Tue Oct 13, 2026 · 12:50 AM HST** (no migration)

Decisions this stretch: the release unit is called **Series** (buttons belong to a series; a series arrives as a drop; season-only stuff maybe later). Series will contain only the cLuB's **original** buttons; found buttons are a separate stream. A set number of series in rotation at once, older ones at lower odds; release timing decided later. Player uploads: uploader keeps copy #1. Webmaster bulk imports: no copy #1, straight into packs, "Found on the internets".

- **Packs = 1 found + 2 originals** (`FOUND_PER_PACK = 1`). `availableDesigns` splits active designs into originals by rarity and a found pool (tier 'archive'). The found card goes in a random unpinned slot and skips the rarity roll (found are commons); rares/ultras only from originals. No found buttons → all originals. Welcome pack's pinned uncommon stays an original. Bots' packs split the same way. Tested 2000 packs: always exactly 1 found, position spread 680/664/656.
- **Webmaster batch uploads**: same Found a Button box; webmasters get `multiple`, folder drops (webkitGetAsEntry, recursive), and a "Batch mode" checkbox (default on). Batch → `batch=1` → `source_author 'Found on the internets'`, `found_by NULL`, no mint (copy #1 to whoever pulls it first). Players sending batch=1 are ignored. Running tally + list of skipped files (dupes / not 88x31 / failed). Batch off with one file = normal finder upload.
- **Bots fuse** (`maybeFuse` in lib/bots.js, runs right after a bot keeps its pull): chance by personality (hoard 0.8, give 0.15), max 1 fusion per bot per bots'-day (counts `fusions` since dayStart), only designs with `max_editions IS NULL` and rarity common/uncommon, 3 lowest-finish copies (by foil tier, then no pattern/effect, newest editions). Tested: 1 fusion out of 10 tries, capped design untouched.
- **Logged-out front page**: `showFront()` shows #out plus the #wall section under it and loads the Wall; `#wall` links while logged out land there. Top bar and footer for logged-out = Join · About (Wall link wrapped in only-in). hashchange treats the front page as "on the Wall" so tile clicks don't jump (tested scrollY unchanged).
- Footer: Trades removed (logged in: My Page · Daily Pull · Wall of Buttons · About · Log Out).
- Cleanups: homepage leftovers removed (Cool Links tiles link to cLuB pages, useBox has no homepage option; the checker still shows a homepage from old certificates). Info box lists 6 owners under 700px wide; phone height measured 733px → 760px (was 940). "...and N more" counts copies left.
- Footer/cache tag v0.21.

## v0.20 — "Trophy Case"
**Tue Oct 13, 2026 · 12:25 AM HST** (pushed after migration 015 ran)

- **Wall info box, two views**: design view (default) and copy view. "Who has one" rows: tiny half-size preview in the copy's actual finish, "#n · owner [BOT]" on one line (ellipsis, full name on hover), finish name below (purple when special, "First Print" for null). Clicking a copy → `#wall/<design>/c/<copy>`, rendered in the box (big preview, finish + foil ledger entry, owned line, last 8 travel steps, link to the full page) with "« back to <button>". hashchange keeps these in-box, no scroll. Equal columns forced (`minmax(0,1fr)` x2); measured tallest design view fits 560px.
- **Rares hidden for everyone** until owned once (HIDDEN = rare/ultra/special; uncovered() includes rare). Admins see all. Includes the 4 frozen holo rares.
- **Sets private** (lib/sets.js setsFor visitor option): own view lists only sets with ≥1 owned button or claimed; unowned buttons come back as `{hidden:true}` ("?" tiles); unclaimed reward `{hidden:true}` ("Reward: ???"). Visitors get only claimed sets with `set_claims.showcase = 1` (migration 015); secret ones as just "a secret set" (no buttons). Panel titled "X's Trophies" and hidden when empty. "Show on my page" checkbox on claimed sets → POST /api/sets {set_id, show}. Completed = claimed (trophies survive trading buttons away). secrets_left hint only on your own page. Claim message no longer names the reward.
- **Homepages removed**: no form/link on pages, collection/banner/links stop returning them, profile POST refuses homepage, certificates drop the homepage line. Column kept. Cool Links tiles go to cLuB pages. (Dead homepage branches in useBox left harmlessly.)
- **Webmasters**: no per-IP or 10/day upload limit (tested 14/14; players still stop at 10).
- **Layout**: top bar 18px (15px on phones), Trades moved from the top bar to the Hi! box above Save Codes (keeps id nav-trades for the count). Removing the homepage box puts My Button Collection right under the page title. Rarity legend on the Wall removed (user request; it also gave away rarities).
- Footer/cache tag v0.20.

## v0.19 — "Totally Fused"
**Mon Oct 12, 2026 · 11:58 PM HST** (pushed after migration 014 ran; live ~11:59 PM)

Design settled this session, then built:
- **Three layers per copy**, rolled separately at mint and carried separately through fusion:
  - **Foil** (material, a ladder): base tier 0 Clear 76% / Glitter 7.5% / Sheen 7.5%; tier 1 Holo, Galaxy, Ripple (8% total); tier 2 Chrome, Gold, Oil Slick (0.9%); tier 3 Prismatic, Double Rainbow, Liquid Metal (0.1%). Weights out of 10000 in `foils` (kind 'foil', new `tier` column). Holo moved to tier 1 (was the only foil), its per-design cap of 25 removed. User: tiers 0 and 1 merged so even plain cards can get "a little something"; no plain color foils (too hard to tell apart); patterns over colors.
  - **Pattern** (cuts a real foil's shine): Fracture (cracked-ice shards), Etched (fine lines), Surge (rainbow bursts). 5% of tier 1+ copies (~0.4% of all). Any tier 1-3 foil can have one: user specifically wanted a Fracture Holo possible (pack-only, since fusing up leaves Holo).
  - **Effect** (how the whole button plays): Dial-Up, Marquee, CRT, VHS, 10% of copies (weights 400/400/150/50), plus fusion-only CRT+VHS. No effect tiers (flat kinds like patterns). Cut by the user: Blink, Degauss, Interlace; no color effects at all (Phosphor/Web-Safe/Negative rejected). Effects apply to the foiled button as one picture.
  - Nothing is drawn on the art (user dislikes graphics on graphics): Glitter = sparse twinkling pixels via overlay blend, Galaxy = sparse specks.
- **Fusion** (lib/fusion.js, POST /api/fuse, fuse box on your own copy page when you own 3+ of a button): 3 copies of one design (not ultras, not locked in trades) → lowest edition survives (keeps number + travel log), other 2 consumed (owner NULL, consumed=1, wall slot cleared) and vanish from play. Foil = best going in + 1 guaranteed tier (random sibling); at tier 3: keep material, add pattern if none; with pattern: add effect if none; with an effect: CRT+VHS; already CRT+VHS = maxed. Patterns/effects inherited (random pick if different); no effect going in → 10% surprise effect. Flat 3 copies per step (user: exponential is hard enough: 3/9/27 to tier 1/2/3, 81 for pattern...). Caps count every copy ever made → capped buttons get scarcer for good. First Print warning in the confirm window. Atomic batch with a lock token; history rows reason `fusion` (used-up copies to NULL, survivor to self), `fusions` row with foil/pattern/effect/prev_foil.
- **Ledger**: new kind `fusion`; foil records for copies made after V19 (1791882000) append pattern + effect. Ledger list shows FUSION / finish names. Tested: chain verifies.
- **Display**: bannerImg layers `.fx` (effect) > `.foil-wrap.foil-X.pat-Y` > img, seeded vars; marquee duplicates the layer in a track (`--w` includes the 2px border). "Finish: VHS Fracture Holo · tier 1 foil" on copy pages; copies-left counts; travel log "fusion by X: came out shinier" / "→ used up". Reduced-motion stops everything.
- Finder copy #1: 20% tier 1 foil (FINDER_FOILS rescaled to /10000); upload reply now `foiled`.
- Logged-out Wall hides rares too (HIDDEN_OUT).
- About: one-liners about shimmer/sparkle/strange things and "Got extras? Fuse three..." (kept vague on purpose).
- Tests (throwaway DB): 20k rolls → tiers 90.9/8.0/0.94/0.13%, patterns 0.42%, effects 10.2%; every fusion rule case; real fuse (First Print survivor → Ripple, 2 consumed, wall slot cleared, re-fuse refused, made 4 / left 2).
- Ideas parked: seasons/drops (designs.status pending/frozen already help; needs a drop label + release time), season-only foils/effects, Finder's foil.

## v0.18.2 — "Point and Click"
**Mon Oct 12, 2026 · 11:20 PM HST**

- New standing rule from the user: never build or push without an explicit go-ahead each time (v0.18.1 was pushed without one, which the user called out).
- **Wall clicks**: the hashchange handler skips scrollTo(0,0) and the full route() when going from #wall or #wall/N to #wall/N (only openInfo runs) or back to #wall (closeInfo). Verified in Chromium: scrollY unchanged after a click.
- **Info window**: content split into `.info-cols`, two columns at ≥700px (button, stats, credits, archive note, webmaster box | ledger, owners). Owners capped at 12 (2 columns wide) + "...and N more!" from minted; ledger/artwork fingerprints shortened to 12 chars with the full hash on hover. Fixed `.info-body` height measured with the tallest mock (archive button + set line + foil counts + webmaster box + 12 bot owners): 543px wide → 560px; 928px single column → 940px. overflow-y auto kept only as a safety net.
- **Found a Button**: no fields at all; upload starts on pick or drop (busy state, inline status, dupes jump to the existing button). Server: name = file name minus .gif (cleaned, 40 chars, "untitled" fallback), type `found` (new kind; bots with favorite kinds don't target it yet), credit "Origin unknown, found in the wild". Finder's copy #1 rolls with `FINDER_FOILS = { holo: 200, clear: 800 }` via new `opts.weights` on mintStatements/rollFoil (per-design caps still apply). Test: 54/300 = 18% holo. Response includes `holo` for a special message.
- **Ledger list fix**: /api/ledger now joins foil (instances) and admin (admin_actions) entries; shows "FOIL X #n came wrapped in a clear/HOLO foil" and "WEBMASTER ..." in plain words with no names (ADMIN_SAYS). Removed designs show as "a removed button" in every row. `?limit=` 1–200 (default 15); About fetches 100, shows 15, rest in a `<details>` "Show more of the ledger".
- **About**: intro says "Keep an eye out for shiny ones"; new Foils section (light: most clear, some shimmer, First Prints) and Found a Button section (bring 'em in, finder's name forever, makers can ask for credit/takedown via the webmaster's guestbook). User asked not to explain the foil-vs-art ownership model or describe game design explicitly. "Take Buttons Home" removed entirely (last player-facing CC0 text); public key + one-line explanation moved under Ledger Status with a Check a Button link. Signed downloads still exist on button pages for original-tier art.
- Cache tags app.js/style.css ?v=0.18.2. Footer v0.18.2.

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
