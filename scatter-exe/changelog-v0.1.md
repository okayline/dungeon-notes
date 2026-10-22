# SCATTER.EXE — Dev Changelog — v0.1.0–v0.1.1

Detailed changelog for SCATTER.EXE (repo okayline/scatter-exe): a daily Scattergories-style game, one letter and 8 categories a UTC day, 2:00 to write. Its `scatter_` tables are in the moba-beat D1. The public repo keeps a short `CHANGELOG.md`. Newest first. Times are Hawaii time (HST), from the commit times.

Written after the fact (Oct 22) from the commit messages; the owner's decisions are not recorded here.

---

## v0.1.1 — "Right Table"
**Thu Oct 22, 2026 · 12:22 AM HST** (scatter-exe PR #1, merge f0bf6cc; no migration)
- **Changed:** the live Worker was bound to `scatter-db` (made empty by the first build), while `scatter_players`, `scatter_rate_limits`, `scatter_sheets` and `scatter_ledger` were already made in moba-beat. It now binds moba-beat, with the `scatter_` prefix in every query, `schema.sql`, `migrations/001_init.sql`, README and CLAUDE.md.
- **Removed:** the `scatter-db` binding and its empty database id.
- The code shipped in PR #1 without a version bump; VERSION 0.1.1 and the public changelog entry came in a later PR.
- **Tests:** 7 pass.

## v0.1.0 — "First Letter"
**Wed Oct 21, 2026 · 10:18 PM HST** (080e011)
- **Added:** the day's ledger entry picks one letter (not Q, X or Z) and 8 of the design doc's 150 categories from the hash before it; a category comes back only when the list runs out. START keeps the start time on the server; answers must be blank or start with the letter (red box on the page, refused by the server); the sheet is sealed on the hash chain in the same D1 batch, once, within 2:00 plus 10 seconds.
- **Not built:** scoring, results, accounts, registry checkpoints.
- **Removed:** nothing (first version).
