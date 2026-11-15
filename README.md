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
- **Ore:** mining drops ore, which buys rig upgrades (drill power, speed, reach, yield, magnet, hull, scanner). Gold relic blocks give a free upgrade.
- **Weapon upgrades:** kills drop tech cores. Each level-up offers 3 weapon upgrades: split shot, ricochet, piercing, explosive rounds, chain lightning, gun drones and more.
- **Enemy squads:** stalkers, spitters, brutes, flyers and queens gather at their hive, hunt as a group once you're spotted, flank, keep their distance, retreat to heal, and dig toward you.
- **Hives:** a destroyed hive regrows one tier stronger, and hives you've found send raids from areas you've already visited.
