# HIVEBREAKER

An endless dig-and-shoot roguelite in true 3D (Babylon.js), built for phones in landscape.

You start in a 4×4 pocket in an infinite world of solid rock covered by fog of war. Dig out, find the procedurally buried alien hives, and destroy them. Destroyed hives grow back once they're out of view, and they send raids that tunnel after you.

## Play
Open `index.html` in a modern browser. It loads Babylon.js from a CDN, so it needs an internet connection.

## Controls
- **Touch:** the left side of the screen is a floating move stick (push into rock to dig). The right side is a floating aim stick that fires and drills.
- **Keyboard/mouse:** WASD to move, the mouse aims, click to fire and drill, and the wheel zooms.
- **AUTO** auto-targets the nearest visible enemy. **RIG** opens the mining-upgrade shop. **HIGH/LOW** switches graphics quality.

## Systems
- **Blocks:** every block shows its health like Brickbreaker. Health scales with distance from the start and with run time.
- **Cargo and base:** mining fills a limited cargo hold with scrap and ore (copper, iron, diamond, gold, core). Recall (⌂ BASE, 3 s, interrupted by damage) to the base level, deposit at **Storage**, smelt ore into bars at the **Smelter** (keeps running while you mine), and forge rig upgrades at the **Forge** from scrap plus bars (copper → iron → gold → diamond → core as levels rise). The **Armory Rack** upgrades guns; the **Deploy Pad** returns you to where you recalled and holds Prestige. Dying loses 90% of carried cargo; base storage is safe. Gold relic blocks still give a free upgrade.
- **Base building:** at base, ▦ BUILD places Storage Boxes, Crushers and Smelters on the tile you face. Buildings link to the tiles touching them, with no belts: Vault or Storage Box → Crusher (2 ore → 3 crushed) → Smelter → Storage Box. Products flow on their own, even while you mine. Buildings upgrade to MK5; the Forge sells Overclock, a faster Recall Beacon and Base Expansion (needs prestige, very expensive).
- **Upgrade tree:** each rig upgrade needs its parent first (Drill Power → Drill Speed → Drill Reach, Drill Power → Ore Yield, Hull → Scanner, Cargo Pod → Magnet). Crushers, base upgrades, building marks and expansion are gated the same way.
- **Guns and attachments:** kills drop loot from HORDEFALL's weapon system (`weapons/weapons.js`): 16 gun bases, 11 rarities, 21 prefixes, 15 attachments and 5 elements. Loot quality scales with distance from the start, run time and prestige. Queens, brutes, elites and hives drop Unique guns with special perks.
- **Armory (⚔ ARMS):** equip 2 guns that fire together, attach and detach parts, upgrade gun levels with ore, fuse 3 items of the same rarity into the next rarity, merge 2 copies of a gun into a higher level, auto-fuse and salvage. The armory is saved and kept through death and prestige.
- **Enemy squads:** stalkers, spitters, brutes, flyers and queens gather at their hive, hunt as a group once you're spotted, flank, keep their distance, retreat to heal, and dig toward you.
- **Hives:** a destroyed hive regrows one tier stronger, and hives you've found send raids from areas you've already visited.
