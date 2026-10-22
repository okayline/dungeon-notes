# moba-beat — Dev Changelog — v0.1–v0.9.4

Detailed changelog for moba-beat (public repo: okayline/moba-beat): a rhythm micro-MOBA auto-battler, daily and async.
Worker `moba-beat` (connected to the repo: a push to `main` deploys it) + D1 `moba-beat` (id 8ced4f17-0ae0-4852-b02c-5003d7f08c5d).
The public repo keeps a short changelog. The design is in `design.md` here. Newest first. Times are Hawaii time (HST), from the commit times.
Nothing of the game itself is built yet: so far it is the ledger, the day's seal and the beat.

---

## v0.9.4 — "More Sounds"
**Wed Oct 21, 2026 · 7:11 PM HST** (merged as okayline/moba-beat PR #4; no migration)

### Decisions (the owner's)
- Owner: "all the different songs sound like using the exact same instruments", "can you use all the samples we have", then "one pack per kit, days seed picks which kit ... and the beat pattern".
- Owner on the chord pad: "literally every song starts with the same synth tone ... please its driving me crazy", then "take that instrument out and never use it again", then "no browser oscillators ever, only samples". I first moved the pad to measure 2 instead of removing it; he caught that ("you just put it on the second measure"), and it was removed fully.
- Owner on the fight: turn-based, one measure per turn, three heroes a side on one shared bar, CLUTCH / FEED / TILT as the button you press on beat 4. The full decisions are in `design.md`.

### What was built
- `public/beat.js`: the day picks which recording of each drum its kit plays (`VOICES`, `VOICE_BYTE`); `HAT_RATE` pitches the one shared hi-hat per kit. Removed: the pad (`PADS`, `PAD_LOW`), `THUMP_KITS`. The key and chords stay as the ledger page's record.
- `public/app.js`: `sample()` plays everything, the cue is `samples/cue.wav`. Removed: `tone`, `drum`, `padChord`, `hz` and every oscillator.
- `public/samples/`: one pack per kit (CC0, Boochi44/free-drum-samples), README with sources. Removed: the 13 single samples per kit.
- `public/fight.js` + `test/fight.test.mjs`: the fight as a pure function, not wired into the page. It has the flat +10% per level; the 3x3 twists and A/B upgrades are only in `design.md` and in `mockup/` here.
- `mockup/`: source of the playable fight mockup (artifact), numbers all guesses.

### Tests
- 33 pass (`npm test`).

### Not checked
- How any of it sounds by ear on my side (the owner played the Kit Lab and the mockup), the live deploy of v0.9.4, phone timing.

---

## v0.9.3 — "Kick Alone"
**Wed Oct 21, 2026 · 5:54 PM HST** (merged as okayline/moba-beat PR #3)

### Decisions (the owner's)
- Owner: "for house, you are playing the bass every beat, not the kick. The kick is unchanging, low drum hit", then "the kick should be a thump!", "it sounds like double hits in general", "one clean kick on beats 1 2 3 and 4, nothing else on the kick", "take the bass synth out for now too". Then "YOU MADE HOUSE MUSIC" and "super fun to groove to the Bounce one".
- I measured the sampled house kick: 67 Hz but gone in 0.04 s, a short click. The first fix (bass on the off-beats, the longer bounce kick) was replaced by a made thump after "it should be a thump".

### What was built
- `public/app.js`: house's kick is a made thump, `tone(t, 150, 45, 0.08, 0.3, 0.9)` (a sine that drops from 150 to 45 Hz), the same every time; `THUMP_KITS` (in `beat.js`) lists the kits that do it. The bass synth (`bassNote`, `BASS_SOUND`) and its scheduling are gone.
- `public/beat.js`: `BASS`, `BASS_NOTE`, `BASS_LOW` and the `bass` array in `beat()` are gone (git history has them); house keeps only the day pattern's off-beat hats (`fourOnTheFloor`), not its off-beat kicks, which sat next to the beat kicks and doubled them. `KIT_DRUMS.house` is snare and hat; the sampled house kick (`public/samples/house/kick.wav`) is deleted.
- Tests: 26 pass. The bass checks are gone; the tap-sound test accepts a made thump.

### Not checked
- How the thump sounds beyond what the owner said in the Kit Lab (a copy of the song maker with a kit picker, https://claude.ai/artifact/YbE6VZVoYyJ883LzgoKnaC), the live deploy, and whether the double hits he heard were the off-beat kicks (the likely cause) or the kick and snare together on beat 2 (still there).

## v0.9.2 — "House, Tech House, Boom Bap and Bounce"
**Wed Oct 21, 2026 · 5:43 PM HST** (merged as okayline/moba-beat PR #2; the public CHANGELOG.md says 5:55 PM, which is wrong, and was not fixed)

### Decisions (the owner's)
- Owner: "house: kick on all 4 beats, snare on 2 and 4", "hip hop: snare on 2 and 4". Beat 4 is silent so the player can tap into it, so I put it to him on a card; he chose "Your tap makes the sound": beat 4 stays silent and the tap plays the kit's sound. Owner: "oh I wasn't thinking of the game! haha".
- Owner on trap: "I don't like trap, it's too slow", then "make trap into hip-hop bpm", then "i decided against trap again HAHA ... hip hop bpm, but not boom bap". He chose West Coast bounce ("OMG MUSTARD"). Hip-hop became boom bap ("boom bap!!! yessss").
- Owner: "can we have the daily seed randomize all this stuff every day?" The seed picks the kit, tempo, key, progression, bass, and each kit's drum variations. Owner asked if there were enough variations; I counted and suggested more hat and bass variety, not built.
- Owner: "for house, do you know tech-house?", references Vintage Culture and Cassian, "its always 128 locked", "can we do both normal house, and tech house?". Four kits. Owner: "no need to rename" (the boom bap kit stays `hip-hop` in the code).
- Sources read: Beats to Rapon (boom bap kicks at 1, 7, 9, 12 of 16 steps, snare 5 and 13), Violet Recording, Rappad (Mustard about 110 BPM, kick on 1 and the "and" of 3, snare on 2 and 4, open hats), EDMProd (tech house 125 to 128 BPM, clap on 2 and 4, hat on the off-beats), MusicRadar (kick on every quarter note). I could not open the Vintage Culture or Cassian pages, so tech house is built from the articles, not from those DJs.

### What was built
- `public/beat.js`: `STYLES` is `hip-hop`, `house`, `bounce`, `tech-house` (byte 20 mod 4). Each kit makes its drums from the day's three patterns A, B and C (`pick`, value mod 108; mod 32 for the kits below):
  - `boomBap(pick)` (hip-hop): snare on beat 2, hats on every eighth, kick on beat 1 and the day's others from the "a" of 1, "and" of 2, beat 3, "and" of 3, "a" of 3 (5 bits; fewer than 2 gets the "and" of 2 and beat 3).
  - `fourOnTheFloor(hits)` (house): kick on beats 1, 2 and 3, snare on beat 2, and the pattern's off-beat hats and kicks.
  - `bounce(pick)`: clap on beat 2, kick on 1 and the "and" of 3, hats on every eighth with one possibly open, 3 extra kicks (the "a" of 1, 2, 3) by bits.
  - `techHouse(pick)`: kick on 1, 2 and 3, clap on beat 2, closed hats on the off-beats only, 2 syncopated hats and one open hat by bits.
  - `TEMPO` per kit: hip-hop 80 to 100, house 128, bounce 90 to 100, tech-house 128. `TAP` (what the tap plays): snare, kick, clap, kick. `KIT_DRUMS`: the samples each kit loads. `BASS` for bounce (as trap had it) and tech-house (root on the off-beats 0.5, 1.5, 2.5, 3.5).
  - Removed: `PATTERNS`-driven drums for hip-hop, a shared tempo range, the trap kit.
- `public/app.js`: the tap plays `TAP[style]` (was always the clap); samples load from `KIT_DRUMS` (was a fixed four); reverb and bass sound for bounce and tech-house. `public/samples/`: `electro` renamed `house`; `bounce` and `tech-house` added; `trap` removed; the hip-hop and house clap files removed (nothing plays them); `README.md` lists the sources, all CC0 from Boochi44/free-drum-samples (bounce: bounce-kick-02, clap-01, closed hat, open hat from 02-bounce; tech-house: hard-kick-03, clap-01, closed hat, open hat from 01-hard-trap).
- Tests: 26 pass (from 21). New: boom bap, house, bounce and tech-house drum rules, every kit's tap sound is one of its samples, tempo by kit. The hand-worked pattern test now checks `pattern()` by hand and a house day's off-beats.

### Checks
- 20,000 random seeds gave 20,000 different songs (kit, tempo, key, chords, drums, bass, wind-ups). Whole-song drum variations seen in 30,000 seeds: about 6,300 in hip-hop, 7,700 in house, 9,800 in trap (before it was removed); one bass rhythm per kit.
- The page's script parsed with `node --check`; the Kit Lab artifact (a copy of the song maker with a kit picker) was published but not opened in a browser.

### Not checked
- How any of it sounds (no one listened yet), the live deploy, and whether tech house sounds like Vintage Culture or Cassian.

## v0.9.1 — "Trap"
**Wed Oct 21, 2026 · 5:23 PM HST** (merged as okayline/moba-beat PR #1)

### Decisions (the owner's)
- Owner: "can we take the disco sound out?", then "it sounds too dorky", then "can we still do another genre with the samples we have?". I found the pack's unused 01 Hard Trap kit and made a trap kit; the download of four samples was blocked until he approved it ("yeah if you request it").
- Owner: "trap should be slower maybe, look up normal trap beats" and "hip hop is like 70-90 bpm?". Sources: trap is written at 130 to 160 but feels like 65 to 80 (half-time), hip-hop is mostly 85 to 95. Per-kit tempo ranges: hip-hop 80 to 100, trap 70 to 85, electro 128 ("it's the house tempo").

### What was built
- `public/beat.js`: `TEMPO` per kit (was one 70 to 130 range from `BPM_MIN` and `BPM_MAX`); `STYLES` hip-hop, electro, trap; trap bass (root on beat 1, 1.75, fifth on 2.5). Removed: the disco kit, its octave-bounce bass (and the octave note), its reverb and bass sound, its samples, `BPM_MIN` and `BPM_MAX`.
- `public/samples/trap/` (hard-kick-01, hard-snare-01, closed hat, clap-01 from 01-hard-trap); `public/app.js` trap reverb (0.8 s) and bass sound.
- Tests: 21 pass; a trap tempo test by hand.

### Not checked
- How it sounds, the live deploy.

## v0.9 — "Same You"
**Wed Oct 21, 2026 · 12:01 PM HST** (migration 002_accounts.sql run on the live D1 database before the push)

### Decisions (the owner's)
- Owner: "can you do the shared accounts?", then "umm look at dawn-baton maybe". Built after Dawn Baton's version (no names, no legacy save-code table, no HOME cookie).

### What was built
- `src/worker.js`: `ACCOUNTS` service binding (dungeon-items `Accounts` entrypoint) next to `REGISTRY`. Routes copied from dawn-baton src/worker.js "save codes and passkeys": `GET /api/account` ({player, id, codes, passkeys, devices}), `POST /api/codes` (new, remove), `POST /api/load`, `POST /api/passkey` (register_options, register, login_options, login, remove), `POST /api/logout` (only with a way back in). Game name `moba-beat`. Logging in reuses the account's player here, else this browser's player if it has no account, else a new one (rate-limited, 20 an hour per hashed IP); each loaded device gets its own session token.
- Players: the cookie token is now 32 random bytes (base64url) and only its SHA-256 is stored (`players.token_hash`, `sessions.token_hash`). A v0.8 player, whose plain token was stored, is found by it once and upgraded to the hash. The routes moved into one table with an error type (`Oops`), as in Dawn Baton. Removed: the plain token column, the UUID token.
- Migration `002_accounts.sql`: `ALTER TABLE players RENAME COLUMN token TO token_hash`; `sessions`; `rate_limits`. `schema.sql` matches. Live: 1 player (the owner) and 1 run before; columns checked after.
- `public/account.js`: the Account panel (button in the header), after Dawn Baton's accountScreen: player number and devices, a new save code shown once with Copy and Download, save codes and passkeys with Forget, log in with a code or a passkey, log out. After logging in or out the page shows that player's sealed run.
- `public/version.js` v0.9.

### Checks
- Tests (with a stand-in Accounts copied from clutch-feed-tilt's tests): save code, loading on a second device (own token, 2 devices), passkey added there and seen on the first, logout, passkey login back to player 1, no second player made, logout refused without a way in; the v0.8 plain token found and upgraded; migrations equal schema.sql column by column. 20 pass.
- Headless end to end against the real Worker code: sealed run, save code made and shown, logout, log back in with the code as player 1 with today's sealed run shown; no page errors.

### Not checked
- Real passkeys on beat.88x31.app; the live Accounts service with moba-beat (first use).

## v0.8 — "On the Record"
**Wed Oct 21, 2026 · 11:52 AM HST** (migration 001_runs.sql run on the live D1 database before the push)

### Decisions (the owner's)
- Owner: "can we make a ledger page and is there anything to do with the registry?" I suggested: save runs first, then a ledger page, then registry checkpoints. Owner: "yep lets do that please!"

### What was built
- Runs: `POST /api/run {day, taps}`. Taps are ms from the song's first beat; the server works out the day's music (`public/beat.js`, moved from `src/`) and scores the taps with `public/score.js`, the page's own scoring. Refused: another day's beat (409), taps that aren't a list, more than 128, or outside -3 s to the end of the song (400). The first finished run of a player's day is sealed: a `runs` row and a ledger entry `{day, player, taps, perfect, good, miss}` in one D1 batch; later runs answer `{sealed: false, run, today}`. `/api/today` also returns your sealed run.
- Players: a random token in an `mb` cookie (HttpOnly, Secure, SameSite=Lax, 400 days), made on your first run; table `players (id, token, created_at)`. No names, no save codes yet. Records hold the id.
- `public/chain.js`: `GENESIS`, `sha256`, `verifyChain`, shared by `src/ledger.js` and the ledger page. `dayEntry` now returns `{hash, sealed}`; new `runInsert`.
- `public/ledger.html`, `ledger.js`: entries newest first, 50 at a time; a day shows its kit, BPM, key and chords from `beat(hash)` and the registry head; a run shows the player number, score and tap count; "Check the chain" pages through every entry and runs `verifyChain` in the browser. The game page's "See the ledger" goes there. Removed: the link to raw `/api/ledger`.
- Registry: `REGISTRY` service binding to dungeon-items (`Registry` entrypoint, as Dawn Baton, scoundrel.exe and aura-farm). After a day is sealed and after every sealed run, `checkpoint(env)` reads the whole chain, checks it, and sends `{game: "moba-beat", entries, head}` (copied from aura-farm's). A refusal or a registry that's away is logged and never stops a run.
- Migration `001_runs.sql` (players, runs with UNIQUE (player_id, day)); `schema.sql` matches. Run on the live database through the Cloudflare connector, then checked: ledger, players and runs with the expected columns.
- `public/version.js` v0.8.

### Checks
- `test/worker.test.mjs`: the day hash by hand from GENESIS; a run with the first target skipped and the second 50 ms late scores exactly that (n - 2 perfect, 1 good, 1 miss); the run's hash is SHA-256(day hash | record) with player 1; the cookie's shape; practice not sealed; a second player chains after the first run; four refusals; checkpoints sent at 1 and 2 entries; the migrations build the same tables as schema.sql. 18 pass.
- End to end in headless Chromium against the real Worker code with an in-memory database: round 1 "Sealed on the ledger." with the server's score equal to the page's; round 2 "Practice"; the ledger page listed both entries and "All 2 entries check out."; no page errors.

### Not checked
- The live registry accepting the first moba-beat checkpoint (only a stand-in); the cookie on the live domain; the ledger page on the live site before the push.

## v0.7 — "Real Kits"
**Wed Oct 21, 2026 · 11:35 AM HST** (no migration)

### Decisions (the owner's)
- The owner linked https://github.com/Boochi44/free-drum-samples and said "yeah can we try!". Its README: "All samples in this repository are released under the Creative Commons Zero (CC0 1.0) license"; many are derived from Edward Loveall's TR-808 recordings (CC0).

### What was built
- `public/samples/<kit>/{kick,snare,hat,clap}.wav`, 12 files, about 540 KB in all (a visit loads one kit, 44 to 253 KB). Hip-hop: 03-soulful-vintage kick-01, snare-01, closed hat-01, clap-01 (22.05 kHz, 0.25 s each). Electro: 02-bounce kick-01, snare-01, closed hat-01, clap-01. Disco: 02-bounce kick-02, 02-bounce claps/cp as the snare, 03-soulful-vintage open hat-01, 01-hard-trap clap-01. `public/samples/README.md` records the source and license.
- `public/app.js`: the AudioContext is made at load (paused), the day's four samples are fetched and decoded before Play is enabled; Play resumes the context. `sample()` plays a buffer through the bus (reverb and compressor). Removed: the synthesized kick, snare, hat and clap (`KITS`, `noise`). The cue, bass and chords are still oscillators.
- `public/version.js` v0.7.

### Checks
- Headless Chromium over a local server: all four disco samples returned 200, Play enabled after loading, a full round finished, no page errors. 16 tests pass. The playtest artifact was published with the 12 sample files beside it.

### Not checked
- How the samples sound with the reverb and the bass (the owner's ears); load time on a slow phone.

## v0.6 — "By Ear"
**Wed Oct 21, 2026 · 11:30 AM HST** (no migration; today's sealed hash is unchanged, but what it plays changed again)

### Decisions (the owner's)
- "can you remove 'clap on 4' explainer text", then "can you remove parry 2 beats after a wind up text": no help text left.
- "i think we shouldn't show the full beat until afterwards?" I answered that the beat is derivable from the public day hash and sent whole by `/api/today`; the owner chose "hide the grid please!" (hidden in the page only, not secret).
- The sound was "too 'beep boop' robotic" and "each beat/note is completely distinct". Options I gave: samples, a continuous layer, reverb, groove, humanizing, mixing, envelopes. The owner picked the continuous layer and reverb, "as long as the continuous layer isn't just one note the entire time", "use music theory please", and asked whether 8 measures should all differ: I recommended a drum loop with fills, A A A B | A A A C, from the standard 8-measure shapes (loop with fills, period, AABA). "build!"
- The owner: questions get answers, building and pushing only when asked.

### What was built
- `src/beat.js`: drums in A A A B | A A A C (bytes 0, 1, 2 mod 108; a fill equal to A moves to the next pattern). Harmony: key = byte 3 mod 12 (semitones above C, major), progression = byte 4 mod 6 from I V vi IV, I vi IV V, vi IV I V, I IV vi V, ii V I IV, I iii IV V; played twice, measure 8 replaced by I; every first half ends on IV or V. `chords` (root, quality), `pad` (the triad from C4, one per measure, held 4 beats), `bass` from `BASS[style]`: hip-hop root 0, root 1.5, fifth 2.5; electro root 0, 0.75, 1.5, fifth 2.25, root 2.5; disco octave bounce on every eighth but beat 4 (3.5 is allowed); each note holds until the next; from C2. Nothing starts on beat 4. `beat()` now returns `key, chords, bass, pad` too. Removed: one independent pattern per measure.
- `public/app.js`: one bus with a dry path, a convolver reverb from decaying noise (hip-hop 0.6 s at 0.16, electro 0.9 s at 0.14, disco 1.5 s at 0.22) and a compressor (-18 dB, 3:1). Bass synth per kit (sine 500 Hz lowpass, sawtooth 700, square 900), triangle pad at 0.035 per note with a swell. The grid and key (`#reveal`) are hidden during play and shown with the results. Removed: the help line, the grid before playing.
- `public/version.js` v0.6.

### Checks
- Tests by hand: the A A A B | A A A C drums, a fill that would equal A, key of D with I V vi IV (D A Bm G D A Bm D), the first hip-hop bass notes with their lengths, the D major and B minor triads, nothing starting on beat 4 in any kit, every progression's measure 4 on IV or V. 16 pass.
- Headless: grid hidden before and during play, shown after, hidden again on Play again; no page errors. Today: disco in F, 95 BPM, F B♭ Dm C F B♭ Dm F. The owner played the playtest: "i like that a lot".

### Not checked
- The mix by ear on more than the owner's device; the page against the live Worker before the push.

## v0.5 — "Your Beat"
**Wed Oct 21, 2026 · 11:16 AM HST** (no migration; today's sealed hash is unchanged, but what it plays changed)

### Decisions (the owner's)
- The beat that played was "perfectly on beat"; the owner wanted a daily melody over a fixed beat, scored against the metronome, with the tempo set by the seed, "70-150bpm or something", and "the player shouldn't be able to hear the fixed beat".
- "the melody shouldn't change perfectly on beat either": I first offset notes by 0 to 3 sixteenths, then tried a set of rhythms; the owner said the offset was the biggest problem and asked to "un-offset it". The owner then landed on "you let them hear 3 beats and they have to hit the 4th", and "less of a melody and more of a 'beat' like drumbeat". The melody was removed.
- "this game should basically be rhythm tengoku for GBA". Research (Wikipedia Rhythm Tengoku; Retronauts on Lockstep; a DEV article on judgement windows): sound over visuals, teach then twist (on-beat to off-beat), remixes, Try Again / OK / Superb. The owner chose "cue then wait" and "123 clap" from the pattern list: enemy wind-ups to parry, and the squad's 1-2-3 with the player's clap.
- More beats ("can we get more possible beats?"), then a cap at 130 BPM, the yellow box moved to beat 4, then "no 4 at all"; three kits ("hip-hop, electro, disco"); "take out 90% of explainer text"; a countdown "-3, -2, -1, 1, 2" on the same tempo; 32 measures tried and called "too long" and the owner meant unique measures, so 8 unique measures.
- Timing: windows were widened to 50 / 120 ms after "widen the focus", then the owner said "dont change anything about the timing"; they are back at 35 / 80 ms.
- Owner: questions are questions; build and push only when asked to.

### What was built
- `src/beat.js` `beat(hash)` returns `{measures: 8, bpm, style, hits, cues, targets}`. Bytes 0 to 7: one pattern per measure, value mod 108, read as digits base 3, 2, 3, 2, 3 for the "and" of 1 (nothing, hat, kick), beat 2 (snare, kick), the "and" of 2, beat 3 (kick, snare), the "and" of 3; beat 1 is always a kick; nothing on beat 4. Byte 10: bit m means a wind-up in measure m + 1 (never measure 1; none means the last measure), cue on beat 1, lands WAIT = 2 beats later; bytes 21 + m pick the ghost unit. Bytes 18, 19: tempo 70 + (value mod 61), so 70 to 130 BPM. Byte 20: style hip-hop, electro or disco. `targets`: a clap on every beat 4 and a parry where each wind-up lands. Removed: rest/normal/strong beats, `TAPS`, melodies, 80 to 120 BPM.
- `public/score.js`: `score(targets, taps)` and `grade(err)`, perfect within 35 ms, good within 80 ms, nearest tap within 250 ms; written to be shared with the server later.
- `public/app.js`: everything scheduled on the Web Audio clock and taps timed on it; three synthesized kits (`KITS`), the player's clap at tap time, the enemy cue (two square blips, the same in every kit); a 3-beat silent countdown shown as -3, -2, -1, then 1, 2, 3 and nothing on beat 4; the measure playing is outlined; a ghost unit leans in while winding up; a good parry pushes the ghost back, a good clap makes your squad glow; results as one dot per target (round clap, square parry) with totals and the average offset. Removed: the audible metronome, the line-by-line results, most explanatory copy.
- `public/version.js` v0.5.

### Checks
- Headless Chromium with timed key presses: grades and misses matched the press times (a skipped target is a miss, parries not pressed are misses); the countdown read "", -3, -2, -1, 1, 2, 3, "", 1, 2, 3; no sideways scroll at 390 px; no page errors. A 32-measure run scored all 32 claps. A playtest copy with today's real beat was published as a private artifact for the owner, who played it.
- Today's hash 4db34841... now gives disco at 95 BPM, wind-ups in measures 3, 5, 6 and 8.

### Not checked
- The kits by ear; device audio delay (no calibration yet); the page against the live Worker before the push.

## v0.4 — "Lights Off"
**Wed Oct 21, 2026 · 10:41 AM HST** (no migration)

### Decisions (the owner's)
- Owner asked for a page or visual, then "can we do a modern style not the ascii style please", "remember its also going to be a moba auto battler", and "can we do dark mode please, and put a version number on it somewhere".
- I made the page always dark (no light theme, no following the device setting).

### What was built
- `public/index.html`, `style.css`, `app.js`: the lane (your squad blue on the left, the ghost squad coral on the right; Clutch diamond, Feed circle, Tilt triangle, working names), today's beat as 16 bars in 4 measures (strong tall amber, normal light, rest hollow) with a key and the BPM, and a Play/Stop button. Play clicks once a beat with Web Audio (880 Hz on strong, 520 Hz on normal, nothing on a rest) at the day's BPM, moves a highlight along the bars, and pulses the squads on each beat (more on strong). Reduced motion: no pulsing. The fight is not built; a line on the page says so.
- Colours: page #151a2e, lane #1f2640, text #e7ebf5, muted #98a2b8, your squad #5b82ff, ghost #ff6b8a, strong #ffb020. Font: the device's system font (Avenir Next, Segoe UI, system-ui); a custom font couldn't be downloaded in the workspace.
- `public/version.js` `VERSION = "v0.4"`, shown next to the name. New test: it matches the newest `CHANGELOG.md` entry.
- `wrangler.jsonc`: serves `public/` as static assets, `/api/*` goes to the Worker first (as CFT). Removed: JSON-only answers at `/`.

### Checks
- Headless Chromium against a stand-in `/api/today` (a real beat, 118 BPM): no sideways scroll at 390 px or 1280 px, no page errors; after Play and about 1.9 s the highlight was on beat 4, as the tempo gives. A first look showed the first bar of each measure squeezed (a margin inside the grid); the bars are now grouped by measure and even.

### Not checked
- The sound by ear; the page against the live Worker.

## v0.3 — "The Beat"
**Wed Oct 21, 2026 · 10:34 AM HST** (no migration; local until pushed)

### Decisions (the owner's)
- Owner: "16 beats , 4 beats x 4 measures". The beat is built from the day's ledger hash.
- Owner: "just dont worry about edge cases" (said while the ledger was being built): no retries, fallbacks or races handled beyond the unique indexes.

### What was built
- `src/beat.js` `beat(hash)`: bytes 0 to 15 of the hash are one per beat; value mod 4 is 0 rest, 1 or 2 normal, 3 strong. Beat 1 of every measure is never a rest (a rest there becomes normal). Byte 16 sets the tempo: 80 + byte mod 41, so 80 to 120 BPM. Pure, no database or network.
- `GET /api/today` now answers `{day, registry, hash, bpm, beats}`.
- The tempo range and the shares (about a quarter rest, a half normal, a quarter strong) are first guesses, not tuned by playing.

### Tests
- A beat worked out by hand from chosen bytes (including 7 and 251, both 3 mod 4, and a rest on beat 1 that becomes normal); the tempo for bytes 0, 1, 40, 41, 82 and 255; same hash same beat. `/api/today` returns the beat made from its own hash. 9 pass.

## v0.2 — "Day One"
**Wed Oct 21, 2026 · 10:29 AM HST** (commit a31e155; no migration)

### Decisions (the owner's)
- Owner, on the beat's source: "the shared beat is the ledger seed from something!", "all the games feed one beat is good", "i dont want to use CFT", then "registrys chain head!".
- Considered and not used: CFT's own day entry as the source (the owner doesn't want it tied to CFT); one other game's checkpoint (Dawn Baton's lap); mixing in the moon phase (it is a function of the date, so it adds no randomness; kept as a possible dial for the beat's feel, not built); mixing the date in by hand (not needed: the day entry's record holds the date and its hash holds the previous hash).
- Fixed at 00:00 UTC: the beat uses the registry head as of midnight, so it is known to everyone from midnight and can't be changed by that day's play.

### What was built
- `src/registry.js` `registryHeadAt(day)`: pages `https://88x31.app/api/registry/ledger?limit=100` (newest first, `&before=` the last id) and takes the first entry whose `at` is before 00:00 UTC of the day; 64 zeros if the registry had none.
- `src/ledger.js` `dayEntry(db, day, getRegistryHead, t)`: record `{"day", "registry"}`, `hash = SHA-256(prev + "|" + record)`. The registry is read only when the day is first sealed.
- `GET /api/today`: `{day, registry, hash}`.

### Tests
- A fake registry of 250 entries: the head is entry 120, found 130 entries back; none before the cut gives GENESIS. `/api/today` seals once and reads the registry once.

### Not checked
- No call to the live registry route or the live Worker; whether a Worker can fetch 88x31.app.

## v0.1 — "The Ledger"
**Wed Oct 21, 2026 · 10:26 AM HST** (commits 5ab137e, 49559f5; schema run on the live D1 database)

### Decisions (the owner's)
- Owner: "lets make the ledger!!" and the rhythm game "has its own ledger" like the other games.
- Worker name `moba-beat`; the owner created the Worker and the database and connected the Worker to the repo.

### What was built
- `src/ledger.js`: `GENESIS`, `sha256`, `head`, `dayEntry`, `verifyChain` (chain helpers copied from aura-farm `src/ledger.js`).
- `schema.sql`: table `ledger` (`prev_hash` UNIQUE, `hash` UNIQUE) and the unique index `ledger_one_day` (one `day` entry per day).
- The schema was run on the live `moba-beat` D1 database through the Cloudflare connector (two statements), then checked: table `ledger` and index `ledger_one_day` exist.
- `wrangler.jsonc` (Worker `moba-beat`, D1 binding `DB`) and `src/worker.js` with `GET /api/ledger?before=&limit=` (newest first, up to 100). Removed: the Cloudflare "Hello world" starter, which the first deploy replaced.

### Tests
- A day's hash by hand with node:crypto, sealed once, chained from GENESIS; days differ with the same registry head; `verifyChain` finds a changed record; `/api/ledger` order, `limit`, `before` and 404.
