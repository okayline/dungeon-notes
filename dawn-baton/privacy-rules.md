# Dawn Baton: privacy rules

Written Thu Oct 15, 2026 (HST) from what the code does today, so each rule can be checked against `src/worker.js`,
`src/ledger.js`, `src/weather.js`, `src/saves.js` and `schema.sql`. Update it when a feature changes what is stored or shown.

## Principles

1. Players pick from lists. No free text, no pictures, so nothing a player types can identify them.
2. Rough location is used, never kept. Only the resulting band is saved.
3. Contents of a stamp stay hidden until its lap is over.
4. A name is two words from a list, and the player decides whether stamps show it.
5. No accounts, emails or phone numbers. A player is a cookie, plus an optional save code or passkey.

## What is stored

- **players:** hash of the cookie token, band, when the band was last set, the two name words, the show-my-name choice,
  created and last-seen times.
- **sessions, save codes, passkeys:** hashes of tokens and codes, a passkey's public key and label, created/used times.
- **rate limits:** a hash of IP plus the action, with a count. Rows older than a day are swept out. The IP itself is not kept.
- **ledger:** every stamp and gap: lap, band, the picked indices, sky, the exact time it was sealed, and a player id
  (a number, not a name). It is append-only and permanent.
- **band_sky:** weather for empty bands. Not about any player.

## What is used but not kept

- **Rough location** (latitude and longitude rounded to whole degrees, from the request): sunrise and sunset, the sky
  word for a stamp, and the band suggested to a first-time player. The sky lookup sends the rounded coordinates to Open-Meteo.
- **Browser clock offset:** the fallback band guess in the picker. It stays in the browser.

## What others can see, and when

| What | Who | When |
|---|---|---|
| That a band has a stamp, which band, when it was sealed | anyone | straight away |
| Colors, notes, words, sky of a stamp | anyone | once its lap is over |
| The player's two-word name on a stamp | anyone | once the lap is over, only if they chose to show it |
| Which band is yours | you | always |
| The previous band's stamp (colors, notes, words) and a loose "a while ago" | the next player | during their window |
| Exact time of the previous stamp, and who made it | nobody | not shown to the next player |

## Checklist for a new feature

- Does it add free text or anything a player types? If yes, stop.
- Does it store a place, a device, an IP, or a time that wasn't stored before? Say why, and for how long.
- Could two things already public be combined to point at one person? Check bands with one player first.
- Does it show something before its lap is over? It should not.
- Can the player turn it off or hide it?
- If it goes into the ledger, it is there forever, so check it twice.

## Known gaps (found while writing this)

1. **A player's stamps can be linked across laps.** `/api/ledger` returns the whole sealed record for finished laps, and
   each stamp record holds the player's id. Anyone can follow one id over time: which band, what time each lap, and when
   they moved bands, even when that player has chosen not to show their name. No names or locations leak, but it is a
   history per player. Fix options: leave the id out of the sealed record (the chain still works going forward, old
   entries stay as they are), or seal a salted hash that changes each lap. The "mine" marker would need another way to
   find your own stamp. Not changed yet; needs a decision.
2. **Exact seal times are public**, including for a lap in progress. Rounding them to the hour would be enough for
   the game's needs. Not changed yet; needs a decision.
3. **Thin bands.** With few players, "a stamp in band -7 at 6 AM" can be one person. Hiding contents until the lap is
   over limits this; bots fill empty bands, which helps a little. Nothing to fix, just keep it in mind.
