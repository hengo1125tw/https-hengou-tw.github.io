import assert from "node:assert/strict";

const FAST_PHASE_MS = 15000;
const FAST_INTERVAL_MS = 800;
const SLOW_INTERVAL_MS = 2500;
const MAX_MS = 60000;

function simulate(savedAtMs) {
  const polls = [];
  let now = 0;
  while (now <= MAX_MS) {
    polls.push({ at: now, token: "fixed-token", ts: now + polls.length });
    if (savedAtMs <= now) return { saved: true, polls };
    if (now === MAX_MS) break;
    const interval = now < FAST_PHASE_MS ? FAST_INTERVAL_MS : SLOW_INTERVAL_MS;
    now = Math.min(MAX_MS, now + interval);
  }
  return { saved: false, polls };
}

for (const seconds of [5, 15, 30, 45, 60]) {
  const result = simulate(seconds * 1000);
  assert.equal(result.saved, true, `${seconds}s saved must be confirmed`);
  assert.ok(result.polls.length <= 40, `${seconds}s polling must not create a request storm`);
  assert.equal(new Set(result.polls.map(item => item.token)).size, 1, "requestToken must remain fixed");
  assert.equal(new Set(result.polls.map(item => item.ts)).size, result.polls.length, "every cache buster must differ");
  assert.ok(result.polls.at(-1).at >= seconds * 1000, "polling must stop only after saved");
}

const overSixty = simulate(60001);
assert.equal(overSixty.saved, false);
assert.equal(overSixty.polls.at(-1).at, 60000);
assert.ok(overSixty.polls.length <= 40);
console.log("PR7 polling performance checks passed (5/15/30/45/60/timeout)");
