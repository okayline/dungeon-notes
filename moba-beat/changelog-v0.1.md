# moba-beat — Dev Changelog — v0.1–v0.6

Detailed changelog for moba-beat (public repo: okayline/moba-beat): a rhythm micro-MOBA auto-battler, daily and async.
Worker `moba-beat` (connected to the repo: a push to `main` deploys it) + D1 `moba-beat` (id 8ced4f17-0ae0-4852-b02c-5003d7f08c5d).
The public repo keeps a short changelog. The design is in `design.md` here. Newest first. Times are Hawaii time (HST), from the commit times.
Nothing of the game itself is built yet: so far it is the ledger, the day's seal and the beat.

---

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
