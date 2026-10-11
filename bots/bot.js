// The bots: a handful of scripted players who each take one day's turn in the real game, every day.
// Run by .github/workflows/bots.yml. Each bot keeps its run in bots/saves/NAME.json and a diary in bots/diary/.
//
//   node bots/bot.js --pinned DIR --latest DIR [--slot N | --all] [--only NAME] [--dry] [--force]
//
// DIR is a checkout of the game (rules.js, screen.js, floor.js). A bot plays the build its roster entry names:
// "pinned" (a fixed commit, so the game can change without breaking them) or "latest" (the canaries).
// --dry plays without touching the Worker or the save files. --force plays even if the bot has played today.
const fs = require("fs"), path = require("path");
const HERE = __dirname, WORKER = "https://daily-dungeon-board.ddddungeon.workers.dev", ORIGIN = "https://okayline.github.io";
const args = process.argv.slice(2), arg = k => { const i = args.indexOf(k); return i < 0 ? null : args[i + 1]; }, flag = k => args.includes(k);
const roster = JSON.parse(fs.readFileSync(path.join(HERE, "roster.json"), "utf8"));
const DIRS = { pinned: arg("--pinned"), latest: arg("--latest") || arg("--pinned") };
const DRY = flag("--dry"), FORCE = flag("--force"), ONLY = arg("--only"), SLOT = flag("--all") || arg("--slot") === null ? null : Number(arg("--slot"));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pick = a => a[Math.floor(Math.random() * a.length)];
const CW = ["N", "E", "S", "W"];
const games = {};
function game(build) {
  if (!games[build]) { const d = path.resolve(DIRS[build] || DIRS.pinned); games[build] = { R: require(path.join(d, "rules.js")), S: require(path.join(d, "screen.js")) }; }
  return games[build];
}
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Pacific/Honolulu" }).format(new Date());

// HOW EACH BOT PLAYS. Numbers are odds (0 to 1) unless noted.
//   fight / talk / run : what it reaches for when a demon is in the room (the rest goes to whichever is left)
//   yes                : how often it says yes to a question (silent: how often it says nothing instead)
//   join               : how often it lets a demon join
//   gift               : how often it pays when a demon wants something
//   searches           : most searches it will make in one room in one day
//   breath             : pace (never below 5), burst (empty it, then wait for all of it), half (stop at 3),
//                        quit (stop after `searches`, never wait), spam (keep pressing into the block, then leave),
//                        random
//   listen             : how often it listens at a locked door before choosing
//   hold               : how often it goes on STANDBY instead of unlocking a door
//   skip               : how often it doesn't show up at all
//   stairs             : early (climb the moment they are found), late (only on the level's last two days), any
//   moon               : how often it looks up and asks
//   actions            : about how many things it does in a day
const STYLE = {
  "HAL-bot":    { fight: .5, talk: .5, run: 0, yes: .3, silent: .3, join: .6, gift: .5, searches: 8, breath: "pace", listen: 1, hold: .05, skip: 0, stairs: "late", moon: .5, actions: 70 },
  "R2D2-bot":   { fight: .5, talk: .4, run: .1, yes: .7, silent: 0, join: .8, gift: .6, searches: 18, breath: "burst", listen: .7, hold: 0, skip: 0, stairs: "late", moon: .3, actions: 110 },
  "C3PO-bot":   { fight: .15, talk: .35, run: .5, yes: .5, silent: .1, join: .5, gift: .9, searches: 5, breath: "half", listen: .8, hold: .35, skip: .15, stairs: "any", moon: .2, actions: 45 },
  "DATA-bot":   { fight: .15, talk: .85, run: 0, yes: .6, silent: .05, join: 1, gift: .8, searches: 7, breath: "pace", listen: .9, hold: .05, skip: 0, stairs: "late", moon: .4, actions: 70 },
  "MARVIN-bot": { fight: .4, talk: .3, run: .3, yes: .15, silent: .5, join: .2, gift: .2, searches: 2, breath: "quit", listen: .1, hold: .2, skip: .25, stairs: "any", moon: .05, actions: 25 },
  "BENDER-bot": { fight: .6, talk: .3, run: .1, yes: .8, silent: 0, join: .5, gift: .1, searches: 14, breath: "spam", listen: .3, hold: 0, skip: .05, stairs: "any", moon: .1, actions: 90 },
  "GORT-bot":   { fight: 1, talk: 0, run: 0, yes: .2, silent: .6, join: .3, gift: 0, searches: 10, breath: "burst", listen: .3, hold: 0, skip: 0, stairs: "any", moon: 0, actions: 80 },
  "TARS-bot":   { fight: .5, talk: .3, run: .2, yes: .6, silent: 0, join: .6, gift: .5, searches: 9, breath: "pace", listen: .6, hold: 0, skip: 0, stairs: "early", moon: .2, actions: 70 },
  "WALLE-bot":  { fight: .3, talk: .6, run: .1, yes: .8, silent: 0, join: .9, gift: .7, searches: 30, breath: "burst", listen: .8, hold: .05, skip: 0, stairs: "late", moon: .9, actions: 140 },
  "ROSIE-bot":  { fight: .34, talk: .33, run: .33, yes: .5, silent: .2, join: .5, gift: .5, searches: 10, breath: "random", listen: .5, hold: .1, skip: .1, stairs: "any", moon: .3, actions: 70 },
};

async function post(pathname, body) {
  if (DRY) return { dry: true };
  try {
    const r = await fetch(WORKER + pathname, { method: "POST", headers: { "content-type": "application/json", origin: ORIGIN }, body: JSON.stringify(body) });
    let d = {}; try { d = await r.json(); } catch (e) {}
    return { status: r.status, ...d };
  } catch (e) { return { error: String(e.message || e) }; }
}

// One bot's day. Returns what happened, for the diary and the summary.
async function play(name, build) {
  const { R, S } = game(build), k = STYLE[name], file = path.join(HERE, "saves", name + ".json");
  const note = { name, build, version: S.VERSION, lines: [], n: { searches: 0, blocked: 0, waited: 0, fights: 0, talks: 0, runs: 0, unlocks: 0, moves: 0, moon: 0, holds: 0, climbs: 0 } };
  const say = t => { if (t && note.lines[note.lines.length - 1] !== t) note.lines.push(t); };
  const fresh = () => R.setName(R.reset({}), name);
  let st = null;
  try { st = JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) {}
  if (st && st.botDay === today() && !FORCE) { note.skipped = "already played today"; return finish(); }
  if (Math.random() < k.skip && !FORCE) { note.skipped = "did not show up"; return finish(); }
  const want = fresh();
  if (!st) { st = want; say("(a new run begins)"); }
  else if (!st.dungeon || !st.dungeon.floor || st.dungeon.floor.v !== want.dungeon.floor.v) { st = want; say("(the build changed shape under it: a new run begins)"); }
  else if (st.dead && (st.submitted || st.postTries >= 3)) { st = want; say("(a new run begins)"); }
  st = R.tick(st);                                        // catch up with the real date: a new day, or a missed deadline
  say(st.log);

  let slept = 0; const SLEEP_BUDGET = 75000;              // real seconds spent waiting for breath, at most, per day
  const breath = () => (R.breath ? R.breath(st) : 6);
  const waitFor = async n => { while (breath() < n && slept < SLEEP_BUDGET) { await sleep(500); slept += 500; note.n.waited += 0.5; } return breath() >= n; };
  const seen = {};                                        // searches made per room today
  const here = () => st.dungeon.at;
  const stairsDir = () => { let d = null, s = st; for (let i = 0; i < 4; i++) { if (s.view && s.view.end === "stairs") d = s.facing; s = R.turn(s, "R"); } return d; };
  const daysLeft = () => (st.dungeon.deadline !== undefined && st.today ? st.dungeon.deadline - st.today.date : 9);
  const face = dir => { for (let i = 0; i < 4 && st.facing !== dir; i++) st = R.turn(st, "R"); };
  let roomsToday = 0, spamHits = 0;

  for (let i = 0; i < k.actions * 3 && !st.dead; i++) {
    if (i >= k.actions && !st.encounter && !st.question) break;
    // 1. Anything waiting on an answer.
    if (st.question) { st = R.reply(st, Math.random() < k.silent ? "silent" : Math.random() < k.yes); say(st.log); continue; }
    if (st.altar && st.altar.open) { const g = R.altarGifts(st), j = g.findIndex(x => x.ok); st = R.altarGive(st, j >= 0 && Math.random() < k.gift && !st.altar.used ? j : null); say(st.log); continue; }
    const e = st.encounter;
    if (e) {
      if (e.stage === "chat") st = R.answer(st, Math.random() < k.silent ? "silent" : Math.random() < k.yes);
      else if (e.stage === "join") st = R.answer(st, Math.random() < k.join);
      else if (e.stage === "swap") st = R.swap(st, Math.random() < .5 ? null : 1 + Math.floor(Math.random() * (st.party.length - 1)));
      else if (e.stage === "gift") { const g = R.gifts(st), j = g.findIndex(x => x.ok); st = R.give(st, j >= 0 && Math.random() < k.gift ? j : null); }
      else if (e.stage === "offer") st = R.offerGive(st, null);
      else {
        const r = Math.random(), a = R.available(st), ways = CW.filter(x => a[x]);
        if (r < k.run && ways.length && !e.ranTried) { st = R.go(st, pick(ways)); note.n.runs++; }
        else if (r < k.run + k.talk) { st = R.talk(st); note.n.talks++; }
        else { st = R.fight(st); note.n.fights++; }
      }
      for (const l of st.round || []) say("  " + l);
      continue;
    }
    // 2. The stairs, if this bot is ready to leave.
    const sd = stairsDir();
    if (sd && (k.stairs === "early" || (k.stairs === "late" ? daysLeft() <= 1 : Math.random() < .25 || daysLeft() <= 1))) {
      const was = st.floor; st = R.go(st, sd); if (st.floor !== was) { note.n.climbs++; roomsToday = 0; } say(st.log); continue;
    }
    const a = R.available(st), r = Math.random();
    const open = CW.filter(x => a.door[x] && !a.locked[x] && a[x] && x !== sd), locked = CW.filter(x => a.locked[x] && a[x]), bare = CW.filter(x => !a.door[x]);
    const done = (seen[here()] || 0) >= k.searches, keyLeft = !(st.today && st.today.stepped);
    // 3. Asking the moon, now and then.
    if (r < k.moon / 20 && breath() >= 1) { st = R.turn(st, "U"); st = R.search(st); note.n.moon++; say(st.log); say(st.extra); st = R.turn(st, "U"); continue; }
    // 4. Searching this room, the way this bot handles its breath.
    if (!done && bare.length && r < .7) {
      const b = breath(); let go = true;
      if (k.breath === "pace") go = b >= 5 || await waitFor(5);
      else if (k.breath === "burst") go = b >= 1 || await waitFor(6);
      else if (k.breath === "half") go = b > 3 || (seen[here()] = k.searches, false);
      else if (k.breath === "quit") go = b >= 1;
      else if (k.breath === "spam") { if (b < 1 && ++spamHits > 2) { seen[here()] = k.searches; spamHits = 0; go = false; } }
      else if (k.breath === "random") go = Math.random() < .8 || await waitFor(1 + Math.floor(Math.random() * 6));
      if (go) {
        if (!bare.includes(st.facing) || Math.random() < .2) face(pick(bare));
        const before = st.log; st = R.search(st);
        if (/out of breath|needs a moment|catches her breath/.test(st.log)) note.n.blocked++; else { note.n.searches++; seen[here()] = (seen[here()] || 0) + 1; }
        if (st.log !== before) say(st.log);
      }
      continue;
    }
    // 5. A locked door: listen, then spend the day's key on it (or go on STANDBY instead).
    if (locked.length && keyLeft && (done || r > .9)) {
      if (Math.random() < k.hold) { st = R.hold(st); note.n.holds++; say(st.log); continue; }
      if (Math.random() < k.listen && breath() >= 1) for (const x of locked) { face(x); st = R.search(st); say(st.log); }
      const x = pick(locked); st = R.go(st, x); note.n.unlocks++; say(st.log); continue;
    }
    // 6. Otherwise wander through an open door, or turn and look.
    if (open.length && (done || r > .85) && roomsToday < 12) { const at = here(); st = R.go(st, pick(open)); if (here() !== at) { note.n.moves++; roomsToday++; } say(st.log); continue; }
    if (done && !open.length && !locked.length) break;   // nothing left to do here today
    st = R.turn(st, Math.random() < .5 ? "L" : "R");
  }

  // The day is over: send what the game left to send, and post the score if the run ended.
  // (what the Worker said to each is kept, so the summary shows whether the rumor events are landing)
  const evs = (st.events || []).slice(-4); let evOk = 0, evBad = "";
  for (const ev of evs) { const r = await post("/event", ev); if (r.ok || r.status === 200) evOk++; else evBad = String(r.error || r.status || "?"); }
  note.events = evs.length ? `${evOk}/${evs.length} sent${evBad ? " (" + evBad + ")" : ""}: ${evs.map(e => e.t).join(", ")}` : "none";
  delete st.events;
  if (st.dead && !st.submitted) {
    say(st.log);
    const res = await post("/score", { ...R.score(st), name: st.playerName || name.toUpperCase(), version: S.VERSION });
    if (res.ok) st.submitted = { name: st.playerName, rank: res.rank }; else st.postTries = (st.postTries || 0) + 1;
    note.posted = res.ok ? `posted, rank ${res.rank}` : `post failed (${res.error || res.status || "dry run"})`;
  }
  // "Someone is here": the same daily ping the page sends, with this bot's own id.
  if (!st.dead) { st.botId = st.botId || [...Array(24)].map(() => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join(""); const r = await post("/here", { id: st.botId, level: st.height || 1 }); note.here = r.ok ? "ok" : String(r.error || r.status || "?"); }
  st.botDay = today();
  note.st = st;
  if (!DRY) { fs.mkdirSync(path.join(HERE, "saves"), { recursive: true }); fs.writeFileSync(file, JSON.stringify(st)); }
  return finish();

  function finish() {
    const s = note.st || st;
    note.row = s && s.dungeon ? { level: s.floor, climbed: (s.climb || 1) - 1, day: s.day || 1, turns: s.steps || 0, alive: !s.dead, party: (s.party || []).filter(p => p.hp > 0).map(p => p.name).join(", "), align: s.align, last: String(s.log || "").replace(/^> /, "") } : null;
    return note;
  }
}

(async () => {
  const notes = [];
  for (const b of roster.bots) {
    if (ONLY && b.name !== ONLY) continue;
    if (SLOT !== null && !ONLY && b.slot !== SLOT) continue;
    if (!STYLE[b.name]) { console.log("no style for", b.name); continue; }
    let n;
    try { n = await play(b.name, b.build); }
    catch (e) { n = { name: b.name, build: b.build, crashed: String(e && e.stack || e).split("\n").slice(0, 4).join(" | "), lines: [], n: {} }; }
    notes.push(n);
    console.log(`${n.name} [${n.build}${n.version ? " " + n.version : ""}]`, n.crashed ? "CRASHED " + n.crashed : n.skipped || `${n.row.level} day ${n.row.day}${n.row.alive ? "" : " DEAD"}  ${JSON.stringify(n.n)}${n.posted ? "  " + n.posted : ""}`);
    if (DRY) continue;
    // The diary: what the bot saw today, in the game's own words.
    if (!n.skipped) {
      fs.mkdirSync(path.join(HERE, "diary"), { recursive: true });
      const head = `\n## ${today()}  -  ${n.crashed ? "CRASHED" : `${n.row.level}, day ${n.row.day}${n.row.alive ? "" : ", the run ended"}`}  (${n.build} ${n.version || ""})\n\n`;
      const body = n.crashed ? n.crashed + "\n" : n.lines.slice(-60).map(l => l.replace(/^> /, "")).join("\n") + "\n" + (n.posted ? `\n${n.posted}\n` : "");
      fs.appendFileSync(path.join(HERE, "diary", n.name + ".md"), head + "```\n" + body + "```\n");
    }
    await sleep(1500);                                    // the Worker limits how fast one sender may post
  }
  if (DRY) return;
  // The summary: every bot's latest state, plus today's counts for the ones that just played.
  const sumFile = path.join(HERE, "summary.json"); let sum = {};
  try { sum = JSON.parse(fs.readFileSync(sumFile, "utf8")); } catch (e) {}
  for (const n of notes) if (n.skipped === "already played today") continue; else if (!n.skipped) sum[n.name] = { date: today(), build: n.build, version: n.version, crashed: n.crashed || null, row: n.row || null, n: n.n, posted: n.posted || null, events: (n.events || "none") + (n.here ? "; here: " + n.here : "") };
    else sum[n.name] = { ...(sum[n.name] || { build: n.build }), skipped: `${today()}: ${n.skipped}` };
  fs.writeFileSync(sumFile, JSON.stringify(sum, null, 1));
  const rows = roster.bots.map(b => { const s = sum[b.name]; if (!s || !s.date) return `| ${b.name} | ${b.build} | - | | | | | | | | | ${s && s.skipped ? "skipped " + s.skipped : "not played yet"} |`;
    const r = s.row || {}, c = s.n || {};
    return `| ${b.name} | ${s.build} ${s.version || ""} | ${s.date} | ${s.crashed ? "CRASHED" : r.level + (r.alive ? "" : " (dead)")} | ${r.climbed ?? ""} | ${r.day ?? ""} | ${r.turns ?? ""} | ${c.searches ?? 0} / ${c.blocked ?? 0} / ${Math.round(c.waited ?? 0)}s | ${c.fights ?? 0} / ${c.talks ?? 0} / ${c.runs ?? 0} | ${c.unlocks ?? 0} / ${c.holds ?? 0} / ${c.climbs ?? 0} | ${s.events || ""} | ${s.crashed || (r.last || "").slice(0, 70)}${s.posted ? " [" + s.posted + "]" : ""}${s.skipped && s.skipped.slice(0, 10) >= s.date ? " (skipped " + s.skipped + ")" : ""} |`; });
  fs.writeFileSync(path.join(HERE, "SUMMARY.md"), `# Bots: where everyone is\n\nUpdated ${today()} (Honolulu). Pinned build: \`${roster.pinned}\`. Canaries play the latest code.\n\n` +
    "| Bot | Build | Last played | Level | Climbed | Day | Turns | Searches / blocked / waited | Fights / talks / runs | Unlocks / holds / climbs | Rumor events | Last line |\n|---|---|---|---|---|---|---|---|---|---|---|---|\n" + rows.join("\n") + "\n");
})();
