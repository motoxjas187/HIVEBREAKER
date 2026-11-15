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
