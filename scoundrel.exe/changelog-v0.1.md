# scoundrel.exe — Dev Changelog — v0.1

Detailed changelog for scoundrel.exe (public repo: okayline/scoundrel.exe): a daily seeded Scoundrel
(Zach Gage & Kurt Bieg) where everyone plays the same deck each UTC day. The public repo keeps a
shorter changelog. Newest first. Times are Hawaii time (HST).

---

## v0.1.0 — "Shuffle Up"
**Wed Oct 14, 2026 · 3:37 AM HST** (engine only, no backend yet)

Decisions: user wanted a Scoundrel game; Claude checked existing versions (iOS, Steam, itch.io ports; none with a shared daily deck) and suggested angles. User picked a standalone daily seeded game (same deck for everyone, one ranked run a day), not part of Daily Dungeon (Scoundrel's chance of losing clashes with DDDD's "never sad" rule; DDDD has its own minigame ideas). Agreed: server deals (browser never sees the deck), moves checked server-side, UTC rollover, cookie players with an optional name and optional save code/passkey later, share card + leaderboard, replays later. Backend first, screen last; aesthetic leaning DDDD-sibling (terminal/ASCII), not 88x31. Name: scoundrel.exe (user made the repo).

- `engine/scoundrel.js`: pure, immutable, JSON state. 44-card deck (C/S 2–14 monsters, D 2–10 weapons, H 2–10 potions). Seeded shuffle: cyrb128 → sfc32 (15 warm-up draws), Fisher–Yates. `newGame(seed, rules)`, `apply(state, action)` → `{ state, events }` (throws `IllegalMove`), `legalActions`, `canSkip`, `canUseWeaponOn`, `replay(seed, actions)`, `publicView` (no deck order; deckCount, deckMonsters), `shareMarks` (per room: ↷ skip > ✊ bare > ⚔ weapon > ♥ heal > ·).
- Actions: `{type:"skip"}`, `{type:"take", card:i}`, `{type:"take", card:i, bare:true}`.
- Rules: room refills to 4 once ≤1 card left and the deck has cards; at the end the room runs down. Skip only with a full untouched room, deck non-empty, not after a skip (reset on a played-through room). New weapon discards old weapon + its kills. Weapon limit default "lower" (strict, published rules), option "lowerOrEqual". Potions: first per room heals (cap 20), later ones wasted. Death: score = health − sum of monsters left in room + deck. Win: health, + last card's value if it was a potion and health is 20 (counts even a wasted potion; `potionBonus` option).
- `engine/daily.js`: `dailySeed(secret, day)` = hex HMAC-SHA256(secret, "daily:YYYY-MM-DD") via Web Crypto; `utcDay`, `dayNumber(day, launchDay)`, `msUntilNextDay`.
- `play.mjs`: terminal player (1–4 take, auto bare-handed when the weapon can't hit; b1–b4 bare; s skip; q quit), prints share marks at the end.
- Tests (node --test): 18 pass, incl. 2,000 random full games checking all 44 cards stay accounted for, health ≤ 20, win > 0 / loss ≤ 0, and `replay` reproduces state exactly.
