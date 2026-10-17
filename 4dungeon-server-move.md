# 4Dungeon: moving the run to the server

Oct 17 2026, written at v1.18. A plan, nothing built. The redesign (provenance, the moon's wish, cuts) is separate and comes after.

**Goal.** The Worker holds each player's run and runs the rules; the page sends actions and draws what comes back. Same game, same behavior, except breath (below). This is the scoundrel.exe shape.

**Out of scope (owner's call).** itch.io (dungeon.88x31.app is the home), the bots (stop or rerun them later), old saves (runs start fresh), breath tuning, any design change.

## What was measured

- One action done the server's way (load the saved run, act, save it): median 0.2 ms, 95th percentile 0.4 ms. A new run: 1 to 2 ms. The free plan allows 10 ms. Measured in Node, not on Cloudflare. Script: `cpu.js` from the Oct 17 session (not in a repo).
- A saved run is about 3 KB.

## What the code looks like

- `rules.js` (3,760 lines) is already "run in, action, run out", and never touches the page, storage or network. The bots prove it.
- It loads `floor.js`, `items.js` and `screen.js` (the clock, `TIME.now`, lives in screen.js), and `sky.js` for the moon's position. The Worker bundles all five.
- The page's main dispatcher (`index.html` around line 2728) sends every button through one place. About ten other calls sit elsewhere: `keepItem`, `useItem`, `giveIchor`, `reply`, `boxFound`, `useSilver`, `welcomeVisitor`, `takeAway`, `setName`, `tick`.
- `st.clockOffset` shifts the game's clock from inside the run. On the server it must be admin only, or anyone could set their own date.
- Randomness (about 94 rolls) moves to the server with the rules, so a run can't be scouted or re-rolled.

## Stages, each shippable on its own

**1. One action list (page only, no behavior change).** BUILT in v1.19 (`act.js`).
A new `act.js`: `apply(st, action)`, where an action is `{ type, arg }` and every rules call above becomes one entry. The page calls `apply` locally for everything. Shipping this alone proves the action list is complete before any server work.

**2. The Worker runs it.** BUILT in v1.20 (`leaderboard/game.js`); the field split moves to stage 3, where the page switches over.
- Table `runs (player PRIMARY KEY, state, steps, updated)` in the board's D1.
- Players: a signed-in account's 4Dungeon player, or a guest player made on first visit (a token kept by the page, like `dd-token`), so there is still no friction at the start.
- `POST /run`: load or start the player's run. `POST /act { n, action }`: `n` is the step count the page last saw, so a double-send is ignored (scoundrel's `n`). Both answer with the run.
- **Breath is off on the server**: always full, until it's retuned for the new feel.
- **Admin is a flag on the player** (`admin = 1`, set by hand, like scoundrel.exe), not the `x-admin-key` header the page sends today. The admin tools all stay, as admin-only actions.
- Before this stage: split the ~35 run fields the page writes itself (found in v1.19) into page-only display state and run state.

**3. The page talks to it.** BUILT in v1.21 (server mode at dungeon.88x31.app; the page's own fields and the rules' queues are split in `adopt()`).
The dispatcher sends the action and plays the beat it already plays (dots, typing) while it waits, then draws the answer. A failed request gets a line in the game's voice and a retry, never a browser dialog.

**4. Fold in what the page does today.** 4a BUILT in v1.22 (finds, used-up items, tallies and events sent by the server after it answers). 4b BUILT in v1.23 (`st.copies`: each find in the bag is its registry copy).
Once the server holds the run: finds go to the registry from `/act` directly (no `st.finds` queue), and so do used-up items and visitors. The cloud save, SAVE and GET code, and the run-code loader go away, because the run already lives on the server. The gift box and tallies keep their routes. **This is also where each bag slot becomes a registry copy, which provenance needs.**

**5. Later: keep secrets on the server.**
The server sends only what the screen needs (scoundrel's `publicView`), never the seeds or what is behind doors. It needs a pass over what `screen.js` reads, so it comes after the move works.

## A free gain

With the run on the server, a posted score can be checked against the real run. The board stops being "for fun, unprovable."

## Open

1. Guest players: **decided**, cleaned up after some idle time (how long is open).
2. Admin tools that edit a run (the clock offset, debug): **decided**, all kept, as admin-only actions.
3. Where the game API lives: **decided**, on `dungeon.88x31.app/api/*` (same origin, cookie login, like the other games). First step: one test route (`/api/ping`) answering there before anything depends on it. The workers.dev routes stay alive through the switch. Keep `wrangler.toml` at the repo root (the v1.13 lesson).
