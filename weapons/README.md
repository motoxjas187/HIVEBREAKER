# Weapons module (from HORDEFALL)

`weapons.js` is HORDEFALL's gun and loot system as a standalone, engine-agnostic module. It has guns only, no magic. It handles the data and rules: rolling loot, stats, attachments, fusing, and turning a trigger pull into projectile specs. Hivebreaker's Babylon.js code decides what bullets look like and how they collide.

Run the checks with `node weapons/test.js`.

## What's inside
| | Count | Notes |
|---|---|---|
| Gun bases | 16 | Pistol, SMG, Shotgun, Assault Rifle, Sniper, Minigun, Rocket Launcher, Flamethrower, Laser, Railgun, Crossbow and Plasma Cannon, plus deeper unlocks: Tesla Rifle (tier 8), Swarm Launcher (14), Disc Thrower (20) and Annihilator (28) |
| Rarities | 11 | Common → Mythic, then Exotic (tier 10), Celestial (18), Divine (26), Eternal (35) and Transcendent (45). Prestige unlocks them sooner |
| Prefixes | 21 | Rapid, Heavy, Piercing, Twin, Volatile, elemental prefixes, Vampiric, Cursed and more |
| Attachments | 15 | Scope, Extended Mag, Long Barrel, Laser Sight, Splitter, Explosive Rounds, Penetrator, Overclock Chip, Blood Siphon, Hollow Points and 5 element runes. A gun holds 1–7, depending on rarity |
| Elements | 5 | Fire (burn), Ice (slow), Shock (chain), Poison (stacking), Void (execute) |
| Unique guns | 15 | Named guns with perks, dropped by `queen`, `hive`, `brute`, `elite` or `any`. There's a 2–8% chance of an **Ascendant** copy (1.7×) |
| Perks | 8 | homing, ricochet, split, storm, spiral, meteor, vampire, nova |

**Combining for better quality:**
- `fuse([a,b,c])` takes 3 items of the same rarity and returns 1 item of the next rarity. Three attachments of the same type keep that type.
- `merge(a,b)` takes two copies of the same gun and returns one gun with more levels.

## Load it
```html
<script src="weapons/weapons.js"></script>   <!-- before the game script -->
```
This creates the global `HBWeapons`.

## "Tier" = how deep the player is
Hivebreaker has no waves, so every roll takes a `tier`. It should come from block level or distance from spawn, for example `tier = 1 + distanceFromStart / 25`. Tier raises item level and the odds of high rarities, and it unlocks the tiers above Mythic.
```js
const ctx = { tier, luck: G.luck || 0, prestige: G.pl || 0 };
const drop    = HBWeapons.rollLoot(ctx);               // gun (58%) or attachment (42%)
const gun     = HBWeapons.newWeapon(ctx);              // force a gun
const part    = HBWeapons.newAttachment(ctx);          // force an attachment
const special = HBWeapons.rollUnique('queen', ctx);    // queen kill → Unique gun
```

## Firing (Babylon example)
```js
// every frame, for each equipped gun
gun._cd = (gun._cd || 0) - dt;
if (target && gun._cd <= 0) {
  gun._cd = HBWeapons.cooldown(gun, { rateMult: G.rateMult });
  const angle = Math.atan2(target.z - player.z, target.x - player.x);
  const shot = HBWeapons.fire(gun, { x: player.x, z: player.z, angle, targetX: target.x, targetZ: target.z },
                              { dmgMult: G.dmgMult, critBonus: G.crit, time: G.time });
  for (const p of shot.projectiles) spawnBullet(p);    // sphere at (p.x, 1, p.z), move by (p.vx, p.vz) * dt for p.life seconds
  for (const m of shot.meteors) queueMeteor(m);        // explode m.radius around (m.x, m.z) after m.delay seconds
}
```
**Each projectile:** `{ x, z, vx, vz, speed, damage, life, pierce, aoe, element, size, color, crit, perk, leech, homing }`

**On hit, your bullet code does this:**
1. Deal `p.damage`. If `p.aoe > 0`, damage everything within `p.aoe` and remove the bullet.
2. Otherwise lower `p.pierce` by 1, and remove the bullet when it drops below 0.
3. Apply `HBWeapons.elementOnHit(p.element, p.damage, isBoss)`. It returns burn, slow, chain, poison or execute info.
4. Heal the player by `p.damage * p.leech`.
5. Handle the perk (the full text is in `HBWeapons.PERKS[p.perk]`):
   - `homing`: steer toward the nearest enemy each frame.
   - `ricochet`: on hit, point the bullet at the nearest other enemy within 12 units.
   - `split`: spawn 4 shards at 40% damage.
   - `storm`: arc 50% damage to 3 enemies within 6 units.
   - `vampire`: on crit, heal 1.5% of max HP.
   - `nova`: 18% chance to explode for 60% damage in a 3-unit radius.
   - `spiral` and `meteor` are already handled inside `fire()`.

## UI helpers
- `HBWeapons.name(item)`, `rarityName(item)` and `rarityColor(item)` return the display name and colors.
- `HBWeapons.describe(item)` returns an array of lines (stats, perk, attachments) for a tooltip or armory card.
- `HBWeapons.dps(item)` is for "better or worse" comparisons.
- `attach(gun, part)` returns false if the gun is full. `detach(gun, i)` removes an attachment.
- `upgradeCost(gun)` and `upgrade(gun)` handle leveling with ore. `salvageValue(item)` gives the scrap value.

## Saving
Items are plain JSON. Use `JSON.stringify(HBWeapons.strip(item))` to save and `JSON.parse` to load. Nothing else is needed.
