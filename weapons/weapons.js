/*
 HIVEBREAKER WEAPONS — ported from HORDEFALL's loot system (guns only, no magic).
 Engine-agnostic: pure data + rules. Works in the browser (global `HBWeapons`) and in Node (require).

 What it gives you
   - 16 gun bases × 11 rarities × 21 prefixes × 5 elements × levels  → effectively infinite combos
   - 15 attachments (1–7 slots per gun, more slots at higher rarity)
   - 15 named Unique guns with special perks, dropped by specific sources (queen, hive, brute, elite, any)
   - Fusing: 3 items of the same rarity → 1 item of the next rarity ("combine for better quality")
   - Merging: 2 copies of the same gun → 1 gun with more levels
   - fire(): turns a trigger pull into a list of projectile specs your engine spawns
   - Save-friendly: items are plain JSON

 Depth ("tier")
   Hivebreaker has no waves, so every roll takes `tier` = how deep/far/hard the player is
   (e.g. distance from spawn / 25, or block level). Tier raises item level, high-rarity odds and
   unlocks the rarities above Mythic. Prestige can be passed in to unlock them sooner.

 Quick start
   const w = HBWeapons.newWeapon({ tier: 5, luck: 0.2 });       // random gun
   const a = HBWeapons.newAttachment({ tier: 5 });              // random attachment
   HBWeapons.attach(w, a);                                      // true if a slot was free
   const shots = HBWeapons.fire(w, { x, z, angle }, { dmgMult: 1.3, rateMult: 1, critBonus: 0 });
   for (const p of shots.projectiles) spawnBullet(p);           // your Babylon code
   const cd = HBWeapons.cooldown(w, { rateMult: 1 });           // seconds until it can fire again
*/
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HBWeapons = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  let rand = Math.random;
  const rnd = (a, b) => a + rand() * (b - a);
  const pick = arr => arr[Math.floor(rand() * arr.length)];

  // ---------------------------------------------------------------- ELEMENTS
  // Your engine applies these on hit (see elementOnHit()).
  const ELEMENTS = [
    { id: 'none',   name: '',       color: null },
    { id: 'fire',   name: 'Fire',   color: 0xff6a2a }, // burn: 35% of hit as damage/sec for 3s
    { id: 'ice',    name: 'Ice',    color: 0x7fd8ff }, // slow: 55% speed for 2.2s
    { id: 'shock',  name: 'Shock',  color: 0xb48cff }, // 30%: arcs to 2 nearby enemies for 50%
    { id: 'poison', name: 'Poison', color: 0x7dff5a }, // stacking DoT: +25% of hit per sec, decays 15%/s
    { id: 'void',   name: 'Void',   color: 0x9b30ff }, // executes enemies under 18% HP (6% for bosses)
  ];

  // ---------------------------------------------------------------- GUN BASES
  // dmg per projectile, rate = shots/sec, spd = units/sec, range = units, aoe = blast radius
  const BASES = {
    pistol:   { name: 'Pistol',          dmg: 12,  rate: 3,   spd: 40,  spread: .03, range: 22, color: 0xffe08a },
    smg:      { name: 'SMG',             dmg: 6,   rate: 10,  spd: 42,  spread: .12, range: 20, color: 0xffd27a },
    shotgun:  { name: 'Shotgun',         dmg: 8,   rate: 1.4, spd: 34,  spread: .32, pellets: 6, range: 14, color: 0xffb35a },
    rifle:    { name: 'Assault Rifle',   dmg: 11,  rate: 6,   spd: 50,  spread: .05, range: 26, color: 0xfff2a0 },
    sniper:   { name: 'Sniper',          dmg: 70,  rate: .8,  spd: 90,  pierce: 4, range: 42, color: 0xffffff, size: .3 },
    minigun:  { name: 'Minigun',         dmg: 5,   rate: 18,  spd: 45,  spread: .17, range: 22, color: 0xffc060 },
    rocket:   { name: 'Rocket Launcher', dmg: 40,  rate: .9,  spd: 24,  aoe: 4, range: 30, color: 0xff7040, size: .4 },
    flamer:   { name: 'Flamethrower',    dmg: 3,   rate: 24,  spd: 15,  spread: .28, range: 9, pierce: 3, element: 1, color: 0xff6a2a, size: .45 },
    laser:    { name: 'Laser',           dmg: 9,   rate: 8,   spd: 80,  pierce: 2, range: 30, color: 0xff3060, size: .18 },
    rail:     { name: 'Railgun',         dmg: 150, rate: .5,  spd: 140, pierce: 99, range: 50, color: 0x60f0ff, size: .3 },
    crossbow: { name: 'Crossbow',        dmg: 30,  rate: 1.5, spd: 55,  pierce: 2, range: 30, color: 0xd0b080 },
    plasma:   { name: 'Plasma Cannon',   dmg: 25,  rate: 2,   spd: 28,  aoe: 2.5, range: 24, color: 0x40ffd0, size: .4 },
    // deeper bases: unlock by tier (or prestige)
    tesla:    { name: 'Tesla Rifle',     dmg: 14,  rate: 5,   spd: 60,  spread: .04, range: 24, element: 3, perk: 'storm',   color: 0xb48cff, unlock: 8 },
    swarmer:  { name: 'Swarm Launcher',  dmg: 22,  rate: 3,   spd: 20,  spread: .4, pellets: 3, aoe: 2, range: 30, perk: 'homing', color: 0xff9050, size: .35, unlock: 14 },
    disc:     { name: 'Disc Thrower',    dmg: 35,  rate: 1.8, spd: 30,  pierce: 4, range: 30, perk: 'ricochet', color: 0x99ffff, size: .5, unlock: 20 },
    annih:    { name: 'Annihilator',     dmg: 30,  rate: 3,   spd: 35,  pellets: 8, aoe: 1.5, range: 22, perk: 'spiral', color: 0xff3d5a, size: .35, unlock: 28 },
  };

  // ---------------------------------------------------------------- RARITIES (ordered by power)
  // mult = damage multiplier, slots = attachment slots, weight = base drop weight, minTier = unlock depth
  const RARITIES = [
    { name: 'Common',       color: '#b8bfd0', mult: 1,   slots: 1, weight: 50 },
    { name: 'Uncommon',     color: '#5be37d', mult: 1.3, slots: 2, weight: 28 },
    { name: 'Rare',         color: '#4aa8ff', mult: 1.7, slots: 2, weight: 14 },
    { name: 'Epic',         color: '#c06bff', mult: 2.3, slots: 3, weight: 6 },
    { name: 'Legendary',    color: '#ffa53a', mult: 3.2, slots: 4, weight: 1.6 },
    { name: 'Mythic',       color: '#ff3d5a', mult: 4.8, slots: 5, weight: .3 },
    { name: 'Exotic',       color: '#7dff4d', mult: 6.5, slots: 5, weight: .09,   minTier: 10, minPrestige: 1 },
    { name: 'Celestial',    color: '#7ec8ff', mult: 9,   slots: 6, weight: .025,  minTier: 18, minPrestige: 1 },
    { name: 'Divine',       color: '#ffe066', mult: 13,  slots: 6, weight: .007,  minTier: 26, minPrestige: 2 },
    { name: 'Eternal',      color: '#ffffff', mult: 19,  slots: 7, weight: .0018, minTier: 35, minPrestige: 3 },
    { name: 'Transcendent', color: '#ff2bd6', mult: 28,  slots: 7, weight: .0004, minTier: 45, minPrestige: 4 },
  ];
  const UNIQUE_RARITY = 6;       // Uniques roll at Exotic power…
  const ASCENDANT_MULT = 1.7;    // …and Ascendant copies hit 1.7× harder on top.

  // ---------------------------------------------------------------- PREFIXES
  const PREFIXES = [
    ['', s => {}], ['Rapid', s => s.rate *= 1.35], ['Heavy', s => { s.dmg *= 1.5; s.rate *= .8; }], ['Piercing', s => s.pierce += 2],
    ['Twin', s => { s.pellets += 1; s.spread += .05; }], ['Volatile', s => s.aoe = Math.max(s.aoe, 1.5) * 1.3], ['Blazing', s => s.element = 1], ['Frozen', s => s.element = 2],
    ['Shocking', s => s.element = 3], ['Venomous', s => s.element = 4], ['Vampiric', s => s.leech += .02], ['Lucky', s => s.crit += .1],
    ['Long', s => s.range *= 1.4], ['Swift', s => s.spd *= 1.4], ['Scatter', s => { s.pellets += 2; s.spread += .15; s.dmg *= .8; }], ['Precise', s => { s.spread *= .4; s.crit += .05; }],
    ['Brutal', s => s.critMult += .75], ['Ancient', s => { s.dmg *= 1.3; s.rate *= 1.1; }], ['Cursed', s => { s.dmg *= 2.1; s.rate *= .7; }], ['Overcharged', s => { s.rate *= 1.2; s.spd *= 1.2; }],
    ['Void-Touched', s => { s.element = 5; s.dmg *= 1.15; }],
  ];

  // ---------------------------------------------------------------- ATTACHMENTS (power m = rarity index + 1)
  const ATTACHMENTS = {
    scope:  { name: 'Scope',            desc: m => `+${20 * m}% range, +${4 * m}% crit`,      apply: (s, m) => { s.range *= 1 + .2 * m; s.crit += .04 * m; } },
    mag:    { name: 'Extended Mag',     desc: m => `+${14 * m}% fire rate`,                   apply: (s, m) => s.rate *= 1 + .14 * m },
    barrel: { name: 'Long Barrel',      desc: m => `+${15 * m}% damage, +${10 * m}% velocity`, apply: (s, m) => { s.dmg *= 1 + .15 * m; s.spd *= 1 + .1 * m; } },
    sight:  { name: 'Laser Sight',      desc: m => `tighter spread, +${3 * m}% crit`,         apply: (s, m) => { s.spread *= Math.pow(.75, m); s.crit += .03 * m; } },
    split:  { name: 'Splitter',         desc: m => `+${Math.ceil(m / 2)} projectiles`,        apply: (s, m) => { s.pellets += Math.ceil(m / 2); s.spread += .06; s.dmg *= .9; } },
    expl:   { name: 'Explosive Rounds', desc: m => `shots explode (+${(.45 * m).toFixed(1)} radius)`, apply: (s, m) => s.aoe = Math.max(s.aoe, 1) + .45 * m },
    pen:    { name: 'Penetrator',       desc: m => `+${m} pierce`,                            apply: (s, m) => s.pierce += m },
    chip:   { name: 'Overclock Chip',   desc: m => `+${8 * m}% damage & fire rate`,           apply: (s, m) => { s.rate *= 1 + .08 * m; s.dmg *= 1 + .08 * m; } },
    siph:   { name: 'Blood Siphon',     desc: m => `+${(.8 * m).toFixed(1)}% lifesteal`,      apply: (s, m) => s.leech += .008 * m },
    hollow: { name: 'Hollow Points',    desc: m => `+${25 * m}% crit damage`,                 apply: (s, m) => s.critMult += .25 * m },
    rfire:  { name: 'Fire Rune',        desc: () => 'Fire element: burns',                    apply: (s, m) => { s.element = 1; s.dmg *= 1 + .04 * m; } },
    rice:   { name: 'Frost Rune',       desc: () => 'Ice element: slows',                     apply: (s, m) => { s.element = 2; s.dmg *= 1 + .04 * m; } },
    rshock: { name: 'Storm Rune',       desc: () => 'Shock element: chains',                  apply: (s, m) => { s.element = 3; s.dmg *= 1 + .04 * m; } },
    rpois:  { name: 'Venom Rune',       desc: () => 'Poison element: stacking DoT',           apply: (s, m) => { s.element = 4; s.dmg *= 1 + .04 * m; } },
    rvoid:  { name: 'Void Rune',        desc: () => 'Void element: executes weakened foes',   apply: (s, m) => { s.element = 5; s.dmg *= 1 + .06 * m; } },
  };

  // ---------------------------------------------------------------- PERKS (Unique guns + deep bases)
  // Your engine implements the on-hit side; fire() already handles spiral/meteor/homing flags.
  const PERKS = {
    homing:   'Projectiles steer toward the nearest enemy (turn rate ~8 rad/s).',
    ricochet: 'On hit, redirect toward the nearest OTHER enemy within 12 units; uses pierce as bounces.',
    split:    'On hit, spawn 4 shards in a star (40% damage, short life, no perk).',
    storm:    'Every hit arcs lightning to up to 3 enemies within 6 units for 50% damage.',
    spiral:   'Ignores aim: pellets fire evenly around 360°, rotating over time (handled in fire()).',
    meteor:   'Every 6th shot calls a meteor at the target for 3× damage (fire() returns it in `meteors`).',
    vampire:  'Critical hits heal the shooter for 1.5% max HP.',
    nova:     '18% chance on hit to explode for 60% damage in a 3-unit radius.',
  };

  // ---------------------------------------------------------------- UNIQUE GUNS
  // source: who drops it — 'queen', 'hive' (destroyed hive), 'brute', 'elite' or 'any'
  const UNIQUES = {
    verdict:  { name: "Queen's Verdict",  base: 'rocket',   perk: 'split',    source: 'queen', desc: 'Rockets burst into shrapnel',          apply: s => { s.dmg *= 1.4; s.aoe += 1; } },
    ironoath: { name: 'Iron Oath',        base: 'minigun',  perk: 'ricochet', source: 'queen', desc: 'Every round ricochets to a new foe',   apply: s => { s.pierce += 3; } },
    butcher:  { name: "Butcher's Bill",   base: 'shotgun',  perk: 'vampire',  source: 'queen', desc: 'Crits heal 1.5% max HP',               apply: s => { s.pellets += 3; s.crit += .15; } },
    brood:    { name: 'Brood Seeker',     base: 'smg',      perk: 'homing',   source: 'hive',  desc: 'Venom rounds hunt their prey',         apply: s => { s.rate *= 1.3; s.element = 4; } },
    kiss:     { name: "Hive's Kiss",      base: 'crossbow', perk: 'split',    source: 'hive',  desc: 'Bolts split into venom shards',        apply: s => { s.element = 4; s.rate *= 1.5; } },
    hivemind: { name: 'Hivemind',         base: 'laser',    perk: 'storm',    source: 'hive',  desc: 'Every hit arcs lightning',             apply: s => { s.rate *= 1.2; s.element = 3; } },
    unstop:   { name: 'Unstoppable',      base: 'rail',     perk: 'nova',     source: 'brute', desc: 'Every hit erupts in fire',             apply: s => { s.dmg *= 1.5; } },
    tectonic: { name: 'Tectonic',         base: 'plasma',   perk: 'meteor',   source: 'brute', desc: 'Every 6th shot calls a meteor',        apply: s => { s.aoe += 1.5; } },
    bulwark:  { name: 'Bulwark Breaker',  base: 'sniper',   perk: 'ricochet', source: 'brute', desc: 'Ricochets with crushing crits',        apply: s => { s.pierce += 3; s.critMult += 1; } },
    horizon:  { name: 'Event Horizon',    base: 'plasma',   perk: 'spiral',   source: 'elite', desc: 'Spirals void orbs in every direction', apply: s => { s.element = 5; s.pellets = 10; s.rate *= 1.6; } },
    singular: { name: 'Singularity',      base: 'sniper',   perk: 'storm',    source: 'elite', desc: 'Void lightning on every hit',          apply: s => { s.element = 5; s.pierce += 10; } },
    suns:     { name: 'Thousand Suns',    base: 'flamer',   perk: 'nova',     source: 'elite', desc: 'Flames explode into novas',            apply: s => { s.range *= 1.6; s.dmg *= 2; } },
    seven:    { name: 'Lucky Seven',      base: 'pistol',   perk: 'ricochet', source: 'any',   desc: 'Ricochets with absurd crit odds',      apply: s => { s.crit += .3; s.rate *= 1.6; s.pierce += 2; } },
    swarm:    { name: 'Swarm Engine',     base: 'minigun',  perk: 'homing',   source: 'any',   desc: 'A storm of homing rounds',             apply: s => { s.rate *= 1.2; } },
    reaper:   { name: 'Grim Harvest',     base: 'shotgun',  perk: 'nova',     source: 'any',   desc: 'Void blasts on every hit',             apply: s => { s.element = 5; } },
  };

  // ---------------------------------------------------------------- ROLLING
  // ctx: { tier=1, luck=0 (0.25 = +25%), prestige=0, bonus=0, minRarity=0 }
  const C = ctx => Object.assign({ tier: 1, luck: 0, prestige: 0, bonus: 0, minRarity: 0 }, ctx || {});
  function rarityUnlocked(i, ctx) { const r = RARITIES[i]; return !r.minTier || ctx.tier >= r.minTier || (r.minPrestige != null && ctx.prestige >= r.minPrestige); }
  function rollRarity(ctx) {
    ctx = C(ctx);
    const w = RARITIES.map((r, i) => (i < ctx.minRarity || !rarityUnlocked(i, ctx)) ? 0
      : r.weight * (1 + (ctx.luck + ctx.bonus) * i * .35) * (i >= 3 ? 1 + ctx.tier * .03 : 1));
    let x = rand() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < w.length; i++) { x -= w[i]; if (x <= 0 && w[i] > 0) return i; }
    return Math.max(ctx.minRarity, 0);
  }
  const itemLevel = ctx => Math.max(1, Math.floor(ctx.tier * .8) + Math.floor(rnd(0, 3)));
  function newWeapon(opts) {
    const ctx = C(opts); opts = opts || {};
    const bases = Object.keys(BASES).filter(k => !BASES[k].unlock || ctx.tier >= BASES[k].unlock || ctx.prestige * 7 >= BASES[k].unlock);
    return {
      kind: 'weapon',
      base: opts.base || pick(bases),
      rarity: opts.rarity != null ? opts.rarity : rollRarity(ctx),
      level: opts.level || itemLevel(ctx),
      prefix: opts.prefix != null ? opts.prefix : (rand() < .25 ? 0 : Math.floor(rand() * PREFIXES.length)),
      attachments: [],
    };
  }
  function newAttachment(opts) {
    const ctx = C(opts); opts = opts || {};
    return { kind: 'attachment', type: opts.type || pick(Object.keys(ATTACHMENTS)), rarity: opts.rarity != null ? opts.rarity : rollRarity(ctx) };
  }
  // A random drop: 58% gun, 42% attachment.
  function rollLoot(opts) { return rand() < .58 ? newWeapon(opts) : newAttachment(opts); }
  // Unique gun from a source ('queen','hive','brute','elite','any'). Ascendant chance ~2% (8% from 'elite').
  function rollUnique(source, opts) {
    const ctx = C(opts);
    let pool = Object.keys(UNIQUES).filter(k => UNIQUES[k].source === (source || 'any'));
    if (!pool.length) pool = Object.keys(UNIQUES);
    const key = pick(pool), U = UNIQUES[key];
    const asc = rand() < (source === 'elite' ? .08 : .02) * (1 + ctx.luck * .5 + ctx.bonus);
    return { kind: 'weapon', base: U.base, rarity: UNIQUE_RARITY, level: Math.max(1, Math.floor(ctx.tier * .9) + 2), prefix: 0, attachments: [], unique: key, ascendant: asc };
  }

  // ---------------------------------------------------------------- STATS
  function weaponStats(w) {
    const b = BASES[w.base], r = RARITIES[w.rarity];
    const s = {
      dmg: b.dmg * r.mult * (1 + .15 * (w.level - 1)) * (w.ascendant ? ASCENDANT_MULT : 1),
      rate: b.rate * (1 + w.rarity * .06), spd: b.spd, spread: b.spread || 0, pellets: b.pellets || 1,
      pierce: b.pierce || 0, range: b.range, aoe: b.aoe || 0, element: b.element || 0,
      crit: .05, critMult: 2, leech: 0, size: b.size || .22, color: b.color, perk: b.perk || null,
    };
    PREFIXES[w.prefix][1](s);
    if (w.unique) { const U = UNIQUES[w.unique]; U.apply(s); s.perk = U.perk; if (s.perk === 'ricochet') s.pierce = Math.max(s.pierce, 3); }
    for (const a of w.attachments) ATTACHMENTS[a.type].apply(s, a.rarity + 1);
    if (s.element) s.color = ELEMENTS[s.element].color;
    return s;
  }
  // Estimated damage per second (for comparing guns in UI).
  function dps(w) { const s = weaponStats(w); return s.dmg * s.pellets * s.rate * (1 + s.crit * (s.critMult - 1)) * (s.aoe ? 1.6 : 1) * (1 + Math.min(s.pierce, 5) * .15); }
  function name(item) {
    if (item.kind === 'attachment') return ATTACHMENTS[item.type].name;
    if (item.unique) return (item.ascendant ? '✦ ' : '') + UNIQUES[item.unique].name;
    const p = PREFIXES[item.prefix][0]; return (p ? p + ' ' : '') + BASES[item.base].name;
  }
  function rarityName(item) { return item.unique ? (item.ascendant ? 'Ascendant' : 'Unique') : RARITIES[item.rarity].name; }
  function rarityColor(item) { return item.unique ? (item.ascendant ? '#ff9cf5' : '#2ff5c8') : RARITIES[item.rarity].color; }
  function describe(item) {
    if (item.kind === 'attachment') return `${RARITIES[item.rarity].name} ${ATTACHMENTS[item.type].name}: ${ATTACHMENTS[item.type].desc(item.rarity + 1)}`;
    const s = weaponStats(item), lines = [`${rarityName(item)} ${name(item)} · Lv ${item.level}`,
      `DMG ${s.dmg.toFixed(0)} × ${s.pellets} · ${s.rate.toFixed(1)}/s · DPS ~${dps(item).toFixed(0)}`,
      `Range ${s.range.toFixed(0)} · Pierce ${s.pierce}${s.aoe ? ' · Blast ' + s.aoe.toFixed(1) : ''}${s.element ? ' · ' + ELEMENTS[s.element].name : ''}`,
      `Crit ${(s.crit * 100).toFixed(0)}% ×${s.critMult.toFixed(2)}${s.leech ? ' · Lifesteal ' + (s.leech * 100).toFixed(1) + '%' : ''}`];
    if (item.unique) lines.push('★ ' + UNIQUES[item.unique].desc);
    else if (s.perk) lines.push('★ ' + PERKS[s.perk]);
    lines.push(`Attachments ${item.attachments.length}/${slots(item)}`);
    return lines;
  }

  // ---------------------------------------------------------------- CRAFTING
  const slots = w => RARITIES[w.rarity].slots + (w.unique ? 0 : 0);
  function attach(w, a) { if (w.attachments.length >= slots(w)) return false; w.attachments.push(a); return true; }
  function detach(w, index) { return w.attachments.splice(index, 1)[0] || null; }
  const salvageValue = it => Math.floor(4 * (it.rarity + 1) ** 2 + (it.level || 0) + (it.attachments ? it.attachments.reduce((t, a) => t + salvageValue(a), 0) : 0)) * (it.unique ? 5 : 1);
  const upgradeCost = w => Math.floor(12 * (w.level + 1) * (1 + w.rarity * .5));
  function upgrade(w) { w.level++; return w; }
  // FUSE: give exactly 3 items of the same kind and rarity (not Uniques). Returns the new item, or null.
  //  - 3 attachments of the same type → that type, next rarity; mixed types → random type, next rarity
  //  - 3 guns → the best gun's base & prefix at the next rarity, average level + 1, attachments returned in `leftovers`
  function fuse(items, opts) {
    if (!items || items.length !== 3) return null;
    const k = items[0].kind, r = items[0].rarity;
    if (items.some(i => i.kind !== k || i.rarity !== r || i.unique) || r >= RARITIES.length - 1) return null;
    if (k === 'attachment') {
      const same = items.every(i => i.type === items[0].type);
      return { item: { kind: 'attachment', type: same ? items[0].type : pick(items).type, rarity: r + 1 }, leftovers: [] };
    }
    const best = items.slice().sort((a, b) => dps(b) - dps(a))[0];
    const lvl = Math.round(items.reduce((t, i) => t + i.level, 0) / 3) + 1;
    const leftovers = items.flatMap(i => i.attachments);
    return { item: { kind: 'weapon', base: best.base, rarity: r + 1, level: lvl, prefix: best.prefix, attachments: [] }, leftovers };
  }
  // MERGE: two copies of the same gun (same base, rarity, prefix, unique) → one gun with ~75% of the combined levels.
  function canMerge(a, b) { return a.kind === 'weapon' && b.kind === 'weapon' && a.base === b.base && a.rarity === b.rarity && a.prefix === b.prefix && (a.unique || null) === (b.unique || null) && !!a.ascendant === !!b.ascendant; }
  function merge(a, b) {
    if (!canMerge(a, b)) return null;
    const out = JSON.parse(JSON.stringify(a)); out.level = Math.max(a.level, b.level) + Math.ceil(Math.min(a.level, b.level) * .75);
    const all = a.attachments.concat(b.attachments).sort((x, y) => y.rarity - x.rarity);
    out.attachments = all.slice(0, slots(out));
    return { item: out, leftovers: all.slice(slots(out)) };
  }

  // ---------------------------------------------------------------- FIRING
  // origin: { x, z, angle (radians, toward target), targetX?, targetZ? }  (y is up; use x/z on your ground plane)
  // mods:   { dmgMult=1, rateMult=1, rangeMult=1, critBonus=0, critMultBonus=0, extraProjectiles=0, time=seconds }
  // Returns { projectiles: [...], meteors: [{x,z,damage,delay}] }. Each projectile:
  //   { x, z, angle, vx, vz, speed, damage, life, pierce, aoe, element, size, color, crit, perk, leech, homing }
  function fire(w, origin, mods) {
    mods = Object.assign({ dmgMult: 1, rateMult: 1, rangeMult: 1, critBonus: 0, critMultBonus: 0, extraProjectiles: 0, time: 0 }, mods || {});
    const s = weaponStats(w), crit = rand() < s.crit + mods.critBonus;
    const damage = s.dmg * mods.dmgMult * (crit ? s.critMult + mods.critMultBonus : 1);
    const n = s.pellets + mods.extraProjectiles, spread = n > 1 ? Math.max(s.spread, .08 + mods.extraProjectiles * .02) : s.spread;
    const range = s.range * mods.rangeMult, out = { projectiles: [], meteors: [] };
    w._shots = (w._shots || 0) + 1;
    for (let p = 0; p < n; p++) {
      const a = s.perk === 'spiral' ? mods.time * 2.5 + p / n * Math.PI * 2
        : origin.angle + (n > 1 ? (p / (n - 1) - .5) * spread * 2 : 0) + rnd(-spread, spread) * .5;
      out.projectiles.push({
        x: origin.x + Math.cos(a) * .6, z: origin.z + Math.sin(a) * .6, angle: a,
        vx: Math.cos(a) * s.spd, vz: Math.sin(a) * s.spd, speed: s.spd, damage, life: range / s.spd,
        pierce: s.pierce, aoe: s.aoe, element: s.element, size: s.size * (crit ? 1.4 : 1), color: s.color,
        crit, perk: s.perk, leech: s.leech, homing: s.perk === 'homing',
      });
    }
    if (s.perk === 'meteor' && w._shots % 6 === 0) {
      const tx = origin.targetX != null ? origin.targetX : origin.x + Math.cos(origin.angle) * range * .7;
      const tz = origin.targetZ != null ? origin.targetZ : origin.z + Math.sin(origin.angle) * range * .7;
      out.meteors.push({ x: tx, z: tz, damage: damage * 3, delay: .7, radius: 3 });
    }
    return out;
  }
  // Seconds between trigger pulls.
  function cooldown(w, mods) { return 1 / (weaponStats(w).rate * ((mods && mods.rateMult) || 1)); }
  // What an element does when a projectile hits (your engine applies it to the enemy).
  function elementOnHit(element, damage, isBoss) {
    switch (element) {
      case 1: return { burnDps: damage * .35, burnTime: 3 };
      case 2: return { slow: .45, slowTime: 2.2 };
      case 3: return { chainChance: .3, chainCount: 2, chainRange: 5, chainDamage: damage * .5 };
      case 4: return { poisonAdd: damage * .25, poisonDecay: .15 };
      case 5: return { executeBelow: isBoss ? .06 : .18 };
      default: return {};
    }
  }

  // ---------------------------------------------------------------- SAVE / LOAD
  // Items are plain JSON. strip() removes runtime counters before saving.
  function strip(item) { const o = JSON.parse(JSON.stringify(item)); delete o._shots; return o; }
  function setRandom(fn) { rand = fn || Math.random; }

  return {
    ELEMENTS, BASES, RARITIES, PREFIXES: PREFIXES.map(p => p[0]), ATTACHMENTS, UNIQUES, PERKS,
    rollRarity, newWeapon, newAttachment, rollLoot, rollUnique,
    weaponStats, dps, name, rarityName, rarityColor, describe,
    slots, attach, detach, salvageValue, upgradeCost, upgrade, fuse, canMerge, merge,
    fire, cooldown, elementOnHit, strip, setRandom,
  };
});
