// Run: node weapons/test.js — sanity checks for the weapons module.
const W = require('./weapons.js');
const assert = (c, m) => { if (!c) { console.error('FAIL:', m); process.exit(1); } };

// rolling + stats for every base, rarity, prefix and attachment
for (const base of Object.keys(W.BASES)) for (let r = 0; r < W.RARITIES.length; r++) {
  const w = W.newWeapon({ base, rarity: r, level: 5, prefix: r % W.PREFIXES.length });
  for (const type of Object.keys(W.ATTACHMENTS)) { if (!W.attach(w, W.newAttachment({ type, rarity: r }))) break; }
  const s = W.weaponStats(w);
  assert(isFinite(s.dmg) && s.dmg > 0 && isFinite(W.dps(w)), `stats ${base} r${r}`);
  assert(w.attachments.length === W.RARITIES[r].slots, `slots ${base} r${r}`);
  const shot = W.fire(w, { x: 0, z: 0, angle: 0 }, { dmgMult: 2 });
  assert(shot.projectiles.length >= 1 && shot.projectiles.every(p => isFinite(p.vx) && p.damage > 0), `fire ${base}`);
}
// uniques
for (const k of Object.keys(W.UNIQUES)) { const u = W.rollUnique(W.UNIQUES[k].source, { tier: 10 }); assert(W.dps(u) > 0 && W.describe(u).length > 3, 'unique ' + k); }
// meteor perk every 6th shot
const tec = W.rollUnique('brute', {}); tec.unique = 'tectonic'; tec.base = 'plasma';
let met = 0; for (let i = 0; i < 12; i++) met += W.fire(tec, { x: 0, z: 0, angle: 0, targetX: 5, targetZ: 0 }).meteors.length;
assert(met === 2, 'meteor every 6th shot');
// rarity gates
let high = 0; for (let i = 0; i < 20000; i++) if (W.rollRarity({ tier: 1 }) > 5) high++;
assert(high === 0, 'no tiers above Mythic at tier 1');
let ex = 0; for (let i = 0; i < 200000; i++) if (W.rollRarity({ tier: 40, luck: .5 }) >= 6) ex++;
assert(ex > 0, 'deep tiers unlock');
// fuse & merge
const f = W.fuse([0, 1, 2].map(() => W.newAttachment({ type: 'scope', rarity: 2 })));
assert(f && f.item.rarity === 3 && f.item.type === 'scope', 'fuse attachments');
const g = W.fuse([0, 1, 2].map(() => W.newWeapon({ rarity: 4, level: 10 })));
assert(g && g.item.rarity === 5 && g.item.level === 11, 'fuse guns');
assert(W.fuse([W.newWeapon({ rarity: 1 }), W.newWeapon({ rarity: 2 }), W.newWeapon({ rarity: 1 })]) === null, 'fuse rejects mixed rarity');
const a = W.newWeapon({ base: 'smg', rarity: 3, level: 8, prefix: 1 }), b = W.newWeapon({ base: 'smg', rarity: 3, level: 6, prefix: 1 });
const m = W.merge(a, b); assert(m && m.item.level === 13, 'merge');
// JSON round trip
const saved = JSON.parse(JSON.stringify(W.strip(a))); assert(W.dps(saved) === W.dps(a), 'save/load');
console.log('All weapon tests passed.');
const demo = W.newWeapon({ tier: 20, luck: .3 }); W.attach(demo, W.newAttachment({ tier: 20 }));
console.log(W.describe(demo).join('\n'));
