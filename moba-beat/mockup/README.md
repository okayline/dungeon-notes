# moba-beat fight mockup

Source of the playable fight mockup (artifact https://claude.ai/artifact/P7xjL7QukaUJn1RBXVhozX, Oct 21 2026). Every fight number in `engine.mjs` is a guess.
`node build.mjs` inlines `moba-beat/public/beat.js`, `engine.mjs` and the samples into `playtest.html` (paths in `build.mjs` point at the author's checkout). `node test.mjs` runs the engine checks.
This engine has the 3x3 class twists and 18 upgrades; `moba-beat/public/fight.js` does not (it still has the flat level bonus).
