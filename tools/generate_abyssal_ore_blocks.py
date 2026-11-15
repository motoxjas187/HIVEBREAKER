#!/usr/bin/env python3
"""Generate the HIVEBREAKER Abyssal Industries voxel ore GLB assets.
Requires: pip install trimesh numpy
Run from repository root: python tools/generate_abyssal_ore_blocks.py
"""
from pathlib import Path
import trimesh

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "ores" / "glb"
OUT.mkdir(parents=True, exist_ok=True)

ORES = [
    ("iron", (150,157,169), "raw"),
    ("copper", (198,111,55), "raw"),
    ("coal", (48,53,62), "raw"),
    ("rare", (157,67,220), "raw"),
    ("silicon", (70,143,231), "raw"),
    ("uranium", (91,218,49), "raw"),
    ("steel", (177,190,202), "steel"),
    ("plate", (210,135,82), "plate"),
    ("circuit", (52,199,108), "circuit"),
    ("cell", (235,183,57), "cell"),
    ("rod", (65,218,133), "rod"),
]
STONE, HIGHLIGHT, DARK = (48,55,65), (71,80,91), (24,29,36)

def add_box(scene, name, color, center, size, metallic=0.04, roughness=0.72):
    mesh = trimesh.creation.box(extents=size)
    mesh.apply_translation(center)
    mesh.visual.material = trimesh.visual.material.PBRMaterial(
        name=name, baseColorFactor=[*color,255],
        metallicFactor=metallic, roughnessFactor=roughness)
    scene.add_geometry(mesh, geom_name=name)

def build(name, color, kind):
    scene = trimesh.Scene()
    add_box(scene, "dark_stone_core", STONE, (0,0,0), (1,1,1))
    # Pixelated strata and chipped corner accents.
    for y in (-.34,.34):
        add_box(scene, "dark_seam", DARK, (0,y,0), (1.004,.035,1.004))
    for p in [(-.34,.28,.503),(.32,-.28,.503),(-.40,-.34,-.503),
              (.36,.30,-.503),(.503,.28,.32),(.503,-.30,-.34),
              (-.503,.31,-.30),(-.503,-.28,.34),(-.32,.503,.28),
              (.34,.503,-.30),(.32,-.503,.31),(-.34,-.503,-.28)]:
        if abs(p[2])>.5: size=(.13,.13,.035)
        elif abs(p[0])>.5: size=(.035,.13,.13)
        else: size=(.13,.035,.13)
        add_box(scene,"stone_chip",HIGHLIGHT,p,size)

    patterns = {
      "raw":[[(-.22,.18),(-.10,.18),(-.10,.06),(.02,.06),(.02,-.06),(.14,-.06),(.14,-.18)],
             [(-.28,-.12),(-.16,-.12),(-.04,0),(.08,0),(.20,.12)],
             [(-.18,.22),(-.06,.10),(.06,.10),(.06,-.02),(.18,-.14)]],
      "steel":[[(-.25,.22),(-.13,.22),(-.01,.22),(.11,.22),(.23,.22)],
               [(-.25,-.22),(-.13,-.22),(-.01,-.22),(.11,-.22),(.23,-.22)]],
      "plate":[[(-.25,.22),(-.13,.22),(.13,.22),(.25,.22)]],
      "circuit":[[(-.24,.18),(-.12,.18),(0,.18),(.12,.18),(.24,.18),
                  (-.24,0),(.24,0),(-.24,-.18),(-.12,-.18),(0,-.18),(.12,-.18),(.24,-.18)]],
      "cell":[[(-.12,.24),(0,.24),(.12,.24),(-.12,.12),(0,.12),(.12,.12),
               (-.12,0),(0,0),(.12,0),(-.12,-.12),(0,-.12),(.12,-.12)]],
      "rod":[[(-.06,.28),(-.06,.16),(-.06,.04),(-.06,-.08),(-.06,-.20),(-.06,-.28)]]
    }
    faces=[("z",.514),("z",-.514),("x",.514),("x",-.514),("y",.514),("y",-.514)]
    pattern=patterns[kind]
    for fi,(axis,sign) in enumerate(faces):
        for j,(u,v) in enumerate(pattern[fi % len(pattern)]):
            s=.13 if kind=="rod" else (.105 if kind=="raw" else .09)
            if axis=="z": center=(u,v,sign); size=(s,s,.035)
            elif axis=="x": center=(sign,v,u); size=(.035,s,s)
            else: center=(u,sign,v); size=(s,.035,s)
            add_box(scene,"ore_pixel",color,center,size, .15 if kind in ("steel","plate") else .03,
                    .48 if kind!="raw" else .78)
            if j%3==0 and kind in ("raw","circuit","cell"):
                hi=tuple(min(255,int(c*1.22+12)) for c in color)
                c=list(center); c[{"x":0,"y":1,"z":2}[axis]] += sign*.018
                add_box(scene,"ore_pixel_highlight",hi,c,tuple(v*.42 for v in size))
    # Top-side identifying marks for manufactured resource blocks.
    if kind=="steel":
        add_box(scene,"steel_bar_mark",(218,226,233),(0,.515,0),(.48,.035,.10),.35,.35)
    elif kind=="plate":
        add_box(scene,"plate_mark",(235,169,111),(0,.515,0),(.62,.035,.40),.25,.4)
        add_box(scene,"plate_center",DARK,(0,.537,0),(.12,.012,.12))
    elif kind=="circuit":
        add_box(scene,"circuit_chip",(25,79,53),(0,.522,0),(.27,.035,.27))
        add_box(scene,"circuit_core",(157,239,181),(0,.545,0),(.12,.025,.12),.2,.35)
    elif kind=="cell":
        add_box(scene,"cell_cap",(255,221,106),(0,.522,0),(.30,.035,.30),.2,.35)
        add_box(scene,"cell_center",DARK,(0,.545,0),(.12,.02,.12))
    elif kind=="rod":
        add_box(scene,"rod_channel",(23,74,55),(0,.515,0),(.18,.035,.68))
        add_box(scene,"rod_highlight",(151,255,190),(0,.54,0),(.08,.02,.52),.15,.4)
    scene.export(OUT / f"{name}_ore_block.glb", file_type="glb")

if __name__ == "__main__":
    for ore in ORES:
        build(*ore)
    print(f"Generated {len(ORES)} GLB ore blocks in {OUT}")
