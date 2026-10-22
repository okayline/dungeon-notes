// MOCKUP fight engine: a playtest copy of the draft rules in design.md. Every number is a guess.
export const CLASSES = ["DPS", "SUPPORT", "TANK"];                 // hero 0, 1, 2
export const BTN = ["CLUTCH", "FEED", "TILT"];
export const BAR = 100, LOOPS = 3, PER_LOOP = 8;
const HIT = { perfect: 20, good: 10, miss: 0 }, HEAL = { perfect: 12, good: 6, miss: 0 }, WEAKEN = { perfect: 0.5, good: 0.75, miss: 1 };
const THROUGH = { perfect: 0, good: 0.5, miss: 1 }, LEVEL = { perfect: 1, good: 0.5, miss: 0 };
const MULT = { DPS: { CLUTCH: 1.5, FEED: 0.5, TILT: 1 }, SUPPORT: { CLUTCH: 0.5, FEED: 1.5, TILT: 1 }, TANK: { CLUTCH: 0.5, FEED: 1, TILT: 1.5 } };
export const TEXT = {
  DPS: { CLUTCH: "big hit", FEED: "small heal, boosts your next CLUTCH", TILT: "weaken + small hit" },
  SUPPORT: { CLUTCH: "small hit + small heal", FEED: "big heal", TILT: "weaken + next hero gets half a level" },
  TANK: { CLUTCH: "small hit, ignores your weakening", FEED: "heal + clears your weakening", TILT: "big weaken" },
};
export const UPS = {
  DPS: [[["Combo", "each perfect in a row adds 10% to your next CLUTCH"], ["Rush", "a press up to 35 ms early counts as perfect; an early perfect CLUTCH hits 25% harder"]],
    [["Crit", "every 3rd perfect in a row hits double"], ["Echo", "a perfect CLUTCH hits again at half strength"]],
    [["Overdrive", "after 3 perfects in a row, your next press is a perfect and 50% harder"], ["Burst", "a streak of 4 perfects deals 10 damage at once"]]],
  SUPPORT: [[["Steady", "a good press keeps your streak"], ["Wide good", "your good window is 20 ms wider"]],
    [["Warm-up", "each press in a row that isn't a miss adds 10% to your FEED heal"], ["Second chance", "after a miss, your next press counts as at least good"]],
    [["Pass the beat", "a perfect FEED gives your next hero a full level"], ["Safety net", "after 3 non-miss presses in a row, a miss counts as good"]]],
  TANK: [[["Brace", "your good window for parries is 20 ms wider"], ["Counter", "a perfect parry sends 5 damage back"]],
    [["Hold the line", "once a loop, a good parry blocks like a perfect"], ["Early parry", "a parry up to 35 ms early counts as perfect"]],
    [["Wall", "after 3 perfect parries in a row, the next hit is fully blocked"], ["Sync", "a perfect parry gives the TANK half a level"]]],
};

export function newState() {
  const two = (f) => [f(), f()];
  return { bars: [BAR, BAR], weak: [1, 1], boost: [1, 1], levels: two(() => [0, 0, 0]), ups: two(() => [[], [], []]),
    streak: [0, 0], run: [0, 0], last: ["", ""], pstreak: [0, 0], wall: [false, false], hold: two(() => [-1, -1, -1]), loop: 0, log: [], over: false };
}
const heroOf = (i) => Math.floor(i / 2) % 3;
export const turnSide = (i) => i % 2;
// who parries on turn i: the hero who acted on the other side's previous turn
const parryHero = (i) => (i >= 1 ? heroOf(i - 1) : 0);

export function windows(S, side, hero, kind) {
  const c = CLASSES[hero], u = S.ups[side][hero], w = { good: 80, early: false };
  if (kind === "act") { if (c === "SUPPORT" && u[0] === "B") w.good = 100; if (c === "DPS" && u[0] === "B") w.early = true; }
  else { if (c === "TANK" && u[0] === "A") w.good = 100; if (c === "TANK" && u[1] === "B") w.early = true; }
  return w;
}
export function gradeErr(err, w) {
  if (err === null || err === undefined) return "miss";
  const a = Math.abs(err);
  if (a <= 35 || (w.early && err < 0 && a <= 70)) return "perfect";
  return a <= w.good ? "good" : "miss";
}
const clamp = (x) => Math.max(0, Math.min(BAR, x));

// One turn. t = { button: "CLUTCH"|"FEED"|"TILT"|null, err: ms or null (the acting press), parryErr: ms or null }.
export function playTurn(S, i, t) {
  const side = turnSide(i), other = 1 - side, hero = heroOf(i), cls = CLASSES[hero], u = S.ups[side][hero], ev = [];
  const b = t.button;
  let g = b ? gradeErr(t.err, windows(S, side, hero, "act")) : "miss";
  const early = g === "perfect" && t.err !== null && t.err < -35;
  if (g === "miss" && cls === "SUPPORT") {
    if (u[1] === "B" && S.last[side] === "miss") { g = "good"; ev.push("Second chance: counts as good"); }
    else if (u[2] === "B" && S.run[side] >= 3) { g = "good"; ev.push("Safety net: counts as good"); }
  }
  let power = 1;
  if (cls === "DPS" && u[2] === "A" && S.streak[side] >= 3 && b) { g = "perfect"; power = 1.5; S.streak[side] = 0; ev.push("Overdrive!"); }

  // the other side's parry, pressed by the hero who just acted for them
  let pg = "miss", ph = parryHero(i), through = 1;
  if (b && b !== "FEED") {
    const pu = S.ups[other][ph], pc = CLASSES[ph];
    pg = gradeErr(t.parryErr, windows(S, other, ph, "parry"));
    if (pg === "good" && pc === "TANK" && pu[1] === "A" && S.hold[other][ph] !== S.loop) { pg = "perfect"; S.hold[other][ph] = S.loop; ev.push("Hold the line"); }
    through = THROUGH[pg];
    if (S.wall[other]) { through = 0; S.wall[other] = false; ev.push("Wall blocks it"); }
    if (pg === "perfect") {
      S.pstreak[other]++;
      if (pc === "TANK" && pu[0] === "B") { S.bars[side] = clamp(S.bars[side] - 5); ev.push("Counter: 5 back"); }
      if (pc === "TANK" && pu[2] === "B") S.levels[other][ph] += 0.5;
      if (pc === "TANK" && pu[2] === "A" && S.pstreak[other] >= 3) { S.wall[other] = true; S.pstreak[other] = 0; }
    } else S.pstreak[other] = 0;
  }

  if (b === "CLUTCH") {
    let d = HIT[g] * MULT[cls].CLUTCH * S.boost[side] * (cls === "TANK" ? 1 : S.weak[side]) * power;
    S.weak[side] = 1; S.boost[side] = 1;
    if (cls === "DPS" && u[0] === "A") d *= 1 + 0.1 * S.streak[side];
    if (cls === "DPS" && u[0] === "B" && early) d *= 1.25;
    if (cls === "DPS" && u[1] === "A" && g === "perfect" && (S.streak[side] + 1) % 3 === 0) { d *= 2; ev.push("Crit!"); }
    let total = Math.round(d * through);
    if (cls === "DPS" && u[1] === "B" && g === "perfect") { total += Math.round(d * 0.5 * through); ev.push("Echo"); }
    S.bars[other] = clamp(S.bars[other] - total);
    if (cls === "SUPPORT" && g !== "miss") S.bars[side] = clamp(S.bars[side] + 4);
    ev.unshift(`CLUTCH ${g}: ${total} damage` + (pg !== "miss" || through < 1 ? ` (parry ${pg})` : ""));
  } else if (b === "FEED") {
    let h = HEAL[g] * MULT[cls].FEED;
    if (cls === "SUPPORT" && u[1] === "A") h *= 1 + 0.1 * S.run[side];
    if (cls === "DPS" && g !== "miss") S.boost[side] = 1.25;
    if (cls === "TANK" && g !== "miss") S.weak[side] = 1;
    if (cls === "SUPPORT" && u[2] === "A" && g === "perfect") S.levels[side][(hero + 1) % 3] += 1;
    const gain = Math.round(h);
    S.bars[side] = clamp(S.bars[side] + gain);
    ev.unshift(`FEED ${g}: +${gain}`);
  } else if (b === "TILT") {
    const amt = (1 - WEAKEN[g]) * (cls === "TANK" ? 1.5 : 1) * through;
    if (amt > 0) S.weak[other] = 1 - Math.min(0.9, amt);
    let hit = 0;
    if (cls === "DPS") { hit = Math.round((g === "perfect" ? 5 : g === "good" ? 3 : 0) * through); S.bars[other] = clamp(S.bars[other] - hit); }
    if (cls === "SUPPORT" && g !== "miss") S.levels[side][(hero + 1) % 3] += 0.5;
    ev.unshift(`TILT ${g}: enemy's next CLUTCH x${S.weak[other].toFixed(2)}` + (hit ? `, ${hit} damage` : "") + (pg !== "miss" ? ` (parry ${pg})` : ""));
  } else ev.unshift("No press: nothing happens");

  if (g === "perfect") S.streak[side]++;
  else if (!(cls === "SUPPORT" && u[0] === "A" && g === "good")) S.streak[side] = 0;
  S.run[side] = g === "miss" ? 0 : S.run[side] + 1;
  S.last[side] = g;
  if (cls === "DPS" && u[2] === "B" && S.streak[side] >= 4) { S.bars[other] = clamp(S.bars[other] - 10); S.streak[side] = 0; ev.push("Burst: 10 damage"); }
  S.levels[side][hero] += LEVEL[g];
  if (S.bars[0] <= 0 || S.bars[1] <= 0) S.over = true;
  const rec = { turn: i, side, hero, button: b, grade: g, parry: pg, ev, bars: [...S.bars] };
  S.log.push(rec);
  return rec;
}
// how many upgrade picks this hero has not spent yet
export const owed = (S, side, hero) => Math.max(0, Math.min(3 - S.ups[side][hero].length, Math.floor(S.levels[side][hero]) - S.ups[side][hero].length));
export const pick = (S, side, hero, ab) => { if (owed(S, side, hero) > 0) S.ups[side][hero].push(ab); };
export const winner = (S) => (S.bars[0] === S.bars[1] ? null : S.bars[0] > S.bars[1] ? 0 : 1);
