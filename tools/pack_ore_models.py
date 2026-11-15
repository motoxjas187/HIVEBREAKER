#!/usr/bin/env python3
"""Pack assets/ores/glb/*.glb into assets/ores/ore_models.js (base64) so hosts that
cannot serve .glb files can still load the models. Run after generate_abyssal_ore_blocks.py."""
import base64, json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
GLB = ROOT / "assets" / "ores" / "glb"
data = {p.name.replace("_ore_block.glb", ""): base64.b64encode(p.read_bytes()).decode() for p in sorted(GLB.glob("*_ore_block.glb"))}
out = ROOT / "assets" / "ores" / "ore_models.js"
out.write_text("window.ORE_GLB_DATA=" + json.dumps(data, separators=(",", ":")) + ";\n")
print(f"Packed {len(data)} models into {out} ({out.stat().st_size // 1024} KB)")
