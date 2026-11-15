# Asset request: missing ore, product and byproduct blocks

For: whoever extends `tools/generate_abyssal_ore_blocks.py` (ChatGPT or Claude).
Context: `docs/INDUSTRY_PLAN.md`. The game already loads every `assets/ores/glb/*_ore_block.glb` listed in `assets/ores/manifest.json`.

## Rules (match the existing 11)
- Same style as the current generator: dark stone core cube about 1 × 1 × 1, centered at the origin, pixel "ore" squares on all six faces, chipped stone accents, embedded PBR materials, GLB output.
- File name: `<id>_ore_block.glb` in `assets/ores/glb/`. The id must be lowercase with underscores.
- Add every new entry to the `ORES` list in the generator **and** to `assets/ores/manifest.json` (id, label, category, file).
- Do not change the existing 11 models, `index.html`, or any game logic.
- After generating, run `python tools/pack_ore_models.py` so `assets/ores/ore_models.js` includes the new models (the play link needs it), then commit the generator, manifest, GLBs and `ore_models.js`.

## Models to add (16)

### Raw ores (kind `raw`: irregular vein pixels)
| id | label | colour (RGB) | notes |
|---|---|---|---|
| diamond | Diamond | (90, 232, 236) | bright cyan gem pixels; add a few white (235, 255, 255) sparkle highlights |
| gold | Gold | (255, 204, 40) | rich yellow nuggets with (255, 240, 150) highlights |
| core | Core | (232, 46, 34) | molten red veins, slightly emissive look; highlights (255, 140, 90) |

### Products (manufactured: clean shapes plus a top mark, like steel/plate/circuit)
| id | label | colour (RGB) | suggested pattern / top mark |
|---|---|---|---|
| iron_plate | Iron Plate | (168, 176, 188) | like `plate` but cool grey, with a rivet in each corner |
| gold_bar | Gold Bar | (255, 196, 38) | two stacked trapezoid ingots on top, shiny (metallic 0.6) |
| silicon_wafer | Silicon Wafer | (82, 120, 210) | thin round wafer disc on top with a grid of small squares |
| cut_diamond | Cut Diamond | (120, 245, 250) | faceted gem (stacked shrinking boxes) on top, very low roughness |
| core_ingot | Core Ingot | (230, 60, 40) | ingot on top with a glowing orange (255, 150, 60) center line |

### Byproducts (dull, rough, roughness 0.9)
| id | label | colour (RGB) | notes |
|---|---|---|---|
| slag | Slag | (92, 78, 70) | lumpy, uneven pixels, a few dark (40, 34, 30) pits |
| ash | Ash | (128, 128, 124) | pale grey, speckled light and dark pixels |
| sludge | Sludge | (86, 104, 48) | murky green-brown, glossy drips on the sides |
| depleted_uranium | Depleted Uranium | (88, 112, 74) | dull olive version of uranium, no bright highlights |
| nuclear_waste | Nuclear Waste | (150, 236, 60) | hazard look: yellow (240, 200, 30) / black stripes on one band, bright green glowing core pixels |

### World blocks without models (optional, lower priority)
| id | label | colour (RGB) | notes |
|---|---|---|---|
| obsidian | Obsidian | (30, 24, 44) | glassy black-purple, low roughness, faint violet highlights |
| scrap | Scrap | (120, 112, 100) | mixed rusty metal bits on stone |
| hive_chitin | Hive Chitin | (77, 51, 72) | organic plates with purple veins (tier 1 hive shell) |

## Copy-paste prompt for ChatGPT

> In the HIVEBREAKER repo, read `docs/ASSET_REQUEST.md` and `tools/generate_abyssal_ore_blocks.py`. Extend the generator to add the 16 models listed in the request (3 raw ores, 5 products, 5 byproducts, and the 3 optional world blocks), using the same voxel style, sizes and file naming as the existing 11. Add any new pattern kinds you need (for example `gem`, `ingot`, `wafer`, `waste`) inside the generator. Update `assets/ores/manifest.json`. Run `python tools/generate_abyssal_ore_blocks.py`, then `python tools/pack_ore_models.py`. Commit the generator, manifest, all GLBs and `assets/ores/ore_models.js`. Do not edit `index.html` or any game logic.
