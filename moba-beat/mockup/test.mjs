import { newState, playTurn, owed, pick, winner, BTN, UPS, CLASSES } from "./engine.mjs";
import assert from "node:assert/strict";
let seed = 12345; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const errs = [() => 0, () => (rnd() - 0.5) * 120, () => null, () => -50, () => 60];
for (let game = 0; game < 3000; game++) {
  const S = newState();
  for (let i = 0; i < 24 && !S.over; i++) {
    const b = rnd() < 0.05 ? null : BTN[Math.floor(rnd() * 3)];
    const t = { button: b, err: errs[Math.floor(rnd() * 5)](), parryErr: errs[Math.floor(rnd() * 5)]() };
    const rec = playTurn(S, i, t);
    assert.ok(S.bars.every((x) => Number.isFinite(x) && x >= 0 && x <= 100), JSON.stringify(S.bars));
    assert.ok(S.levels.flat().every(Number.isFinite) && S.weak.every((x) => x > 0 && x <= 1));
    if (i % 8 === 7) for (const side of [0, 1]) for (let h = 0; h < 3; h++) while (owed(S, side, h) > 0) pick(S, side, h, rnd() < 0.5 ? "A" : "B");
    if (i % 8 === 7) S.loop++;
  }
  assert.ok([0, 1, null].includes(winner(S)));
}
// hand check: DPS perfect CLUTCH, no parry: 20 x 1.5 = 30
let S = newState(); playTurn(S, 0, { button: "CLUTCH", err: 0, parryErr: null }); assert.equal(S.bars[1], 70);
// ghost TANK... hero 0 on turn 1 is a DPS: CLUTCH perfect, my parry perfect: 0 damage
S = newState(); playTurn(S, 1, { button: "CLUTCH", err: 0, parryErr: 0 }); assert.equal(S.bars[0], 100);
// SUPPORT FEED perfect: 12 x 1.5 = 18, from a hurt bar
S = newState(); S.bars[0] = 50; playTurn(S, 2, { button: "FEED", err: 0, parryErr: null }); assert.equal(S.bars[0], 68);
assert.equal(UPS.DPS.length, 3);
console.log("engine ok");
