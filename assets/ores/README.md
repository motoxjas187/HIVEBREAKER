# Abyssal Ore Block Asset Pack

This folder contains the source generator and manifest for the 11 voxel-style resource blocks.

## Assets
Run `python tools/generate_abyssal_ore_blocks.py` from the repository root. It creates 11 standalone GLB files in `assets/ores/glb/`.

The models are centered at the origin and approximately 1 x 1 x 1 units, with embedded materials. They are visual assets only; no mining, collision, inventory, or processing logic is included.

## Babylon.js
Load a generated model with:

```js
const result = await BABYLON.SceneLoader.ImportMeshAsync(
  "", "./assets/ores/glb/", "iron_ore_block.glb", scene
);
```

Import the glTF loader in your project as required by its Babylon.js build.

## In the game
`index.html` loads these models with Babylon's glTF loader (visual only; resource and mining logic are unchanged):

| Model | Used for |
|---|---|
| copper | Copper Ore blocks |
| iron | Iron Ore blocks |
| silicon | Diamond Ore blocks |
| cell | Gold Relic blocks |
| rare | Core Ore blocks |
| coal | Obsidian blocks |
| plate | Copper Bar (base product) |
| steel | Iron Bar |
| rod | Gold Bar |
| circuit | Cut Diamond |
| uranium | Core Ingot |

Products fly from smelters to storage, and each Storage Box shows the last product it received on its lid. If the models fail to load, the game falls back to its built-in pixel textures.
