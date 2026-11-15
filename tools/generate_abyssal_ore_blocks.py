#!/usr/bin/env python3
"""Generate HIVEBREAKER Abyssal voxel ore, product and byproduct GLB assets.
Requires: pip install trimesh
Run from repository root: python tools/generate_abyssal_ore_blocks.py
"""
from pathlib import Path
import trimesh

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "ores" / "glb"
OUT.mkdir(parents=True, exist_ok=True)

# Keep the original 11 entries and their pattern kinds intact.
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
    # Additional raw ores
    ("diamond", (90,232,236), "gem_raw"),
    ("gold", (255,204,40), "gold_raw"),
    ("core", (232,46,34), "core_raw"),
    # Manufactured products
    ("iron_plate", (168,176,188), "iron_plate"),
    ("gold_bar", (255,196,38), "ingot"),
    ("silicon_wafer", (82,120,210), "wafer"),
    ("cut_diamond", (120,245,250), "cut_gem"),
    ("core_ingot", (230,60,40), "core_ingot"),
    # Byproducts
    ("slag", (92,78,70), "slag"),
    ("ash", (128,128,124), "ash"),
    ("sludge", (86,104,48), "sludge"),
    ("depleted_uranium", (88,112,74), "depleted"),
    ("nuclear_waste", (150,236,60), "waste"),
    # Optional world blocks
    ("obsidian", (30,24,44), "obsidian"),
    ("scrap", (120,112,100), "scrap"),
    ("hive_chitin", (77,51,72), "chitin"),
]
STONE, HIGHLIGHT, DARK = (48,55,65), (71,80,91), (24,29,36)

def add_box(scene, name, color, center, size, metallic=0.04, roughness=0.72, emissive=None):
    mesh = trimesh.creation.box(extents=size)
    mesh.apply_translation(center)
    material = trimesh.visual.material.PBRMaterial(
        name=name, baseColorFactor=[*color,255],
        metallicFactor=metallic, roughnessFactor=roughness)
    if emissive:
        material.emissiveFactor = [c / 255 for c in emissive]
    mesh.visual.material = material
    scene.add_geometry(mesh, geom_name=name)

def build(name, color, kind):
    scene = trimesh.Scene()
    add_box(scene, "dark_stone_core", STONE, (0,0,0), (1,1,1))
    for y in (-.34,.34):
        add_box(scene, "dark_seam", DARK, (0,y,0), (1.004,.035,1.004))
    for p in [(-.34,.28,.503),(.32,-.28,.503),(-.40,-.34,-.503),
              (.36,.30,-.503),(.503,.28,.32),(.503,-.30,-.34),
              (-.503,.31,-.30),(-.503,-.28,.34),(-.32,.503,.28),
              (.34,.503,-.30),(.32,-.503,.31),(-.34,-.503,-.28)]:
        size=(.13,.13,.035) if abs(p[2])>.5 else ((.035,.13,.13) if abs(p[0])>.5 else (.13,.035,.13))
        add_box(scene,"stone_chip",HIGHLIGHT,p,size)

    patterns = {
      "raw":[[(-.22,.18),(-.10,.18),(-.10,.06),(.02,.06),(.02,-.06),(.14,-.06),(.14,-.18)],
             [(-.28,-.12),(-.16,-.12),(-.04,0),(.08,0),(.20,.12)],
             [(-.18,.22),(-.06,.10),(.06,.10),(.06,-.02),(.18,-.14)]],
      "steel":[[(-.25,.22),(-.13,.22),(-.01,.22),(.11,.22),(.23,.22)],
               [(-.25,-.22),(-.13,-.22),(-.01,-.22),(.11,-.22),(.23,-.22)]],
      "plate":[[(-.25,.22),(-.13,.22),(.13,.22),(.25,.22)]],
      "circuit":[[(-.24,.18),(-.12,.18),(0,.18),(.12,.18),(.24,.18),(-.24,0),(.24,0),(-.24,-.18),(-.12,-.18),(0,-.18),(.12,-.18),(.24,-.18)]],
      "cell":[[(-.12,.24),(0,.24),(.12,.24),(-.12,.12),(0,.12),(.12,.12),(-.12,0),(0,0),(.12,0),(-.12,-.12),(0,-.12),(.12,-.12)]],
      "rod":[[(-.06,.28),(-.06,.16),(-.06,.04),(-.06,-.08),(-.06,-.20),(-.06,-.28)]],
      "gem_raw":[[(-.18,.18),(-.06,.18),(.06,.06),(.18,-.06),(.06,-.18),(-.06,-.18),(-.18,-.06)],
                 [(-.12,.12),(0,.24),(.12,.12),(.24,0),(.12,-.12),(0,-.24),(-.12,-.12)]],
      "gold_raw":[[(-.22,.12),(-.10,.24),(.02,.12),(.14,.24),(.26,.12),(.14,0),(.02,-.12),(-.10,0)],
                  [(-.18,-.12),(-.06,0),(.06,-.12),(.18,0)]],
      "core_raw":[[(-.24,.18),(-.12,.06),(0,.06),(.12,-.06),(.24,-.18)],
                  [(-.18,-.18),(-.06,-.06),(.06,-.06),(.18,.06)]],
      "iron_plate":[[(-.25,.22),(.25,.22),(-.25,-.22),(.25,-.22)]],
      "ingot":[[(-.25,.12),(-.13,.12),(.13,.12),(.25,.12),(-.25,-.12),(-.13,-.12),(.13,-.12),(.25,-.12)]],
      "wafer":[[(u,v) for u in (-.18,-.06,.06,.18) for v in (-.18,-.06,.06,.18)]],
      "cut_gem":[[(-.12,.18),(0,.24),(.12,.18),(.20,0),(.12,-.18),(0,-.24),(-.12,-.18),(-.20,0)]],
      "core_ingot":[[(-.24,.12),(-.12,.12),(0,.12),(.12,.12),(.24,.12),(-.24,-.12),(-.12,-.12),(0,-.12),(.12,-.12),(.24,-.12)]],
      "slag":[[(-.24,.18),(-.12,.06),(0,.18),(.12,.06),(.24,-.06),(.12,-.18),(-.12,-.18)],
              [(-.18,-.12),(-.06,.12),(.06,-.06),(.18,.18)]],
      "ash":[[(-.24,.18),(-.12,.06),(0,.18),(.12,-.06),(.24,-.18),(-.12,-.18)],
             [(-.18,0),(0,-.12),(.18,.12)]],
      "sludge":[[(-.24,.18),(-.12,.06),(0,-.06),(.12,-.18),(.24,-.18)],
                [(-.18,-.12),(-.06,0),(.06,.12),(.18,.12)]],
      "depleted":[[(-.22,.18),(-.10,.18),(-.10,.06),(.02,.06),(.02,-.06),(.14,-.06),(.14,-.18)]],
      "waste":[[(-.24,.18),(-.12,.18),(0,.18),(.12,.18),(.24,.18),(-.24,-.18),(-.12,-.18),(0,-.18),(.12,-.18),(.24,-.18)]],
      "obsidian":[[(-.24,.18),(-.12,.06),(0,.18),(.12,.06),(.24,-.06),(.12,-.18),(-.12,-.18)]],
      "scrap":[[(-.24,.18),(-.06,.12),(.12,.18),(.24,0),(-.12,-.12),(.12,-.18)]],
      "chitin":[[(-.24,.18),(-.12,.06),(0,.18),(.12,.06),(.24,-.18),(.06,-.12),(-.12,-.18)]],
    }
    faces=[("z",1),("z",-1),("x",1),("x",-1),("y",1),("y",-1)]  # unit sign; centers use sign*.514
    pattern=patterns[kind]
    dull = kind in ("slag","ash","sludge","depleted","waste")
    roughness = .9 if dull else (.16 if kind in ("gem_raw","cut_gem","obsidian") else (.42 if kind not in ("raw","gold_raw","core_raw") else .78))
    metallic = .6 if kind in ("steel","plate","iron_plate","ingot","core_ingot","obsidian","scrap") else (.12 if kind in ("wafer","cut_gem") else .03)
    for fi,(axis,sign) in enumerate(faces):
        for j,(u,v) in enumerate(pattern[fi % len(pattern)]):
            s=.13 if kind=="rod" else (.105 if kind in ("raw","gem_raw","gold_raw","core_raw","depleted") else .09)
            if kind in ("slag","ash","sludge","waste","scrap","chitin"): s=.12
            if axis=="z": center=(u,v,sign*.514); size=(s,s,.035)
            elif axis=="x": center=(sign*.514,v,u); size=(.035,s,s)
            else: center=(u,sign*.514,v); size=(s,.035,s)
            pixel_color=color
            if kind=="ash" and j%2: pixel_color=(74,76,75)
            if kind=="slag" and j%3==0: pixel_color=(40,34,30)
            if kind=="scrap" and j%2: pixel_color=(151,75,42)
            if kind=="chitin" and j%3==0: pixel_color=(133,79,129)
            glow = color if kind in ("core_raw","waste","chitin") else None
            add_box(scene,"ore_pixel",pixel_color,center,size,metallic,roughness,glow)
            if kind=="raw" and j%3==0:
                hi=tuple(min(255,int(c*1.22+12)) for c in color)
                c=list(center); c[{"x":0,"y":1,"z":2}[axis]] += sign*.018
                add_box(scene,"ore_pixel_highlight",hi,c,tuple(v*.42 for v in size))
            if kind=="gem_raw" and j%2==0:
                c=list(center); c[{"x":0,"y":1,"z":2}[axis]] += sign*.018
                add_box(scene,"gem_sparkle",(235,255,255),c,tuple(v*.32 for v in size),.05,.15)
            if kind=="gold_raw" and j%2==0:
                c=list(center); c[{"x":0,"y":1,"z":2}[axis]] += sign*.018
                add_box(scene,"gold_glint",(255,240,150),c,tuple(v*.4 for v in size),.45,.22)
            if kind=="core_raw" and j%2==0:
                c=list(center); c[{"x":0,"y":1,"z":2}[axis]] += sign*.018
                add_box(scene,"molten_highlight",(255,140,90),c,tuple(v*.4 for v in size),.05,.28,(255,90,35))
            if kind=="waste" and j%2==0:
                c=list(center); c[{"x":0,"y":1,"z":2}[axis]] += sign*.018
                add_box(scene,"waste_glow",(105,255,40),c,tuple(v*.42 for v in size),.02,.25,(80,255,25))

    # Existing manufactured top marks remain unchanged.
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
    elif kind=="iron_plate":
        add_box(scene,"iron_plate_top",(200,210,222),(0,.515,0),(.62,.035,.40),.55,.38)
        for x in (-.25,.25):
            for z in (-.15,.15):
                add_box(scene,"plate_rivet",(95,105,118),(x,.54,z),(.055,.025,.055),.7,.28)
    elif kind=="ingot":
        add_box(scene,"gold_ingot_lower",color,(0,.53,0),(.62,.10,.34),.6,.22)
        add_box(scene,"gold_ingot_upper",(255,224,100),(0,.60,0),(.48,.08,.27),.6,.18)
    elif kind=="wafer":
        add_box(scene,"wafer_disc",(82,120,210),(0,.525,0),(.66,.035,.66),.25,.24)
        for x in (-.22,-.11,0,.11,.22):
            for z in (-.22,-.11,0,.11,.22):
                add_box(scene,"wafer_grid",(150,190,255),(x,.548,z),(.025,.012,.025),.2,.25)
    elif kind=="cut_gem":
        for level,scale in enumerate((.48,.34,.20,.08)):
            add_box(scene,"diamond_facet",(150+level*20,255,255),(0,.52+level*.045,0),(scale,.045,scale),.05,.08)
    elif kind=="core_ingot":
        add_box(scene,"core_ingot_top",color,(0,.53,0),(.62,.10,.34),.45,.25,(255,70,25))
        add_box(scene,"core_ingot_glow",(255,150,60),(0,.59,0),(.48,.018,.055),.05,.2,(255,110,35))
    elif kind=="sludge":
        for x,z in ((-.22,.22),(.20,.12),(.12,-.22)):
            add_box(scene,"sludge_drip",color,(x,-.36,z),(.08,.25,.08),.0,.25)
    elif kind=="waste":
        for x in (-.22,.22):
            add_box(scene,"hazard_stripe",(240,200,30),(x,-.05,.518),(.10,.16,.025),.0,.9)
            add_box(scene,"hazard_black",(20,22,18),(x+.05,-.05,.519),(.035,.16,.026),.0,.9)
    elif kind=="obsidian":
        add_box(scene,"obsidian_glint",(105,75,145),(0,.515,0),(.42,.025,.08),.1,.12)
    elif kind=="scrap":
        for x,z in ((-.2,-.18),(.18,.12),(.05,-.25)):
            add_box(scene,"rusty_scrap",(151,75,42),(x,.53,z),(.14,.08,.10),.45,.7)
    elif kind=="chitin":
        for x in (-.2,0,.2):
            add_box(scene,"chitin_plate",(96,61,91),(x,.53,0),(.16,.07,.42),.0,.82)
    scene.export(OUT / f"{name}_ore_block.glb", file_type="glb")

if __name__ == "__main__":
    for ore in ORES:
        build(*ore)
    print(f"Generated {len(ORES)} GLB models in {OUT}")
