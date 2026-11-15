# HIVEBREAKER Industrial Progression Plan

Status: **proposal, no game code changed yet.** This reconciles the current base system with the 11-resource Abyssal inventory before any implementation.

Goal: finding an ore is only the beginning. Each new material needs new technology: machines, power and multi-machine chains. Rare resources take real industrial investment.

---

## 1. What exists today (preserve and migrate)

| System | Current behavior |
|---|---|
| Mined ores | Copper, Iron, Diamond, Gold (relic), Core, plus scrap from all rock and hive shells |
| Base buildings | Storage Box (port), Crusher (2 ore → 3 crushed), Smelter (ore/crushed → bar). Chain by adjacency, no belts |
| Marks | MK1–MK5. MK currently unlocks ores: MK1 copper, MK2 iron, MK3 gold, MK4 diamond, MK5 core |
| Bars | Copper Bar, Iron Bar, Gold Bar, Cut Diamond, Core Ingot |
| Spending | Forge rig upgrades, building marks, base upgrades and expansion cost scrap plus bars by tier |
| Visual assets | 11 Abyssal GLB blocks (iron, copper, coal, rare, silicon, uranium, steel, plate, circuit, cell, rod) |

**Resolved:** the MK ore gate stays, and specialized machines and power are added on top. Marks also improve throughput.

---

## 2. Reconciled resource list (all Hivebreaker ores kept + Abyssal ores added)

**Decided:** keep every existing Hivebreaker ore and add the missing Abyssal ones. Coal and Uranium are new mineable ores. Power travels by adjacency only. Marks keep the ore gate **and** specialized machines are required too.

### Raw (mined)
| Resource | Source | Status | Model |
|---|---|---|---|
| Copper Ore | Near start | Existing | copper ✓ |
| Iron Ore | 16m+ | Existing | iron ✓ |
| **Coal** | Stone and basalt layers, common | **New** · fuel and steel input | coal ✓ |
| **Silicon** | 40m+ | **New** · wafers for circuits | silicon ✓ |
| Diamond Ore | 32m+ | Existing · Cut Diamond (tier 4) | **diamond ✗ needs model** |
| Gold Relic | Rare, 12m+ | Existing · free rig upgrade + Gold Bar | **gold ✗ needs model** |
| Core Ore | 60m+ | Existing · Core Ingot (tier 5) | **core ✗ needs model** |
| **Rare Ore** | 90m+ | **New** · Energy Cells | rare ✓ |
| **Uranium** | 120m+ | **New** · fuel rods | uranium ✓ |

Until the three missing models exist, Diamond, Gold and Core keep their current stand-in visuals (silicon, cell, rare). Obsidian keeps a plain material.

### Intermediates
Crushed ores, Washed concentrates, Silicon Wafer, Enriched Uranium.

### Products
| Product | Recipe (machine) | Model |
|---|---|---|
| Copper Plate | Copper → Furnace | plate ✓ |
| Iron Plate | Iron → Furnace | **iron_plate ✗** |
| Steel | Iron Plate + Coal → Steel Mill | steel ✓ |
| Gold Bar | Gold → Crusher → Washer → Furnace | **gold_bar ✗** |
| Silicon Wafer | Silicon → Crusher → Washer → Electric Smelter | **silicon_wafer ✗** |
| Circuit | Copper Plate + Silicon Wafer + Gold Bar → Assembler | circuit ✓ |
| Cut Diamond | Diamond → Crusher → Washer → Gem Cutter (power) | **cut_diamond ✗** |
| Fuel Rod | Enriched Uranium + Steel → Rod Fabricator | rod ✓ |
| Core Ingot | Core → Crusher → Washer → Arc Furnace (reactor power) | **core_ingot ✗** |
| Energy Cell | Refined Rare + Circuit → Plasma Refinery | cell ✓ |

### Byproducts
| Byproduct | From | Useful for / disposal |
|---|---|---|
| Slag | Furnace, Steel Mill | Crusher → Gravel → needed for base expansion "Reinforced Floor"; or Incinerator |
| Ash | Coal Generator | Washer filter media; or Incinerator |
| Sludge | Washer | Must go to a Settling Tank (returns water + scrap). If full, the washer stops |
| Depleted Uranium | Centrifuge | Armor plating (hull upgrade input) |
| Nuclear Waste | Reactor | **Must** go to a Waste Vault. If the vault is full the reactor shuts down; a leaking reactor damages nearby machines |

Clogged byproducts stall the chain (output buffer full), so players have to plan disposal.

---

## 3. Power

- Machines that need power draw it from the **grid**. The grid is every building touching another (same adjacency chains as items, no wires or belts). Power poles can bridge gaps later if needed.
- **Coal Generator:** burns coal, gives medium power, makes ash.
- **Reactor:** burns fuel rods, gives large power, makes nuclear waste.
- **Battery Bank:** stores surplus so the grid keeps running while generators refuel.
- Under-powered grids run every powered machine slower (proportional), never at zero output from rounding.
- The base HUD shows power produced vs. used.

---

## 4. Machines (each with its own visual identity)

| Machine | Power | In → Out | Look |
|---|---|---|---|
| Storage Box | – | port to storage | wooden crate, gold bands (existing) |
| Furnace | none (burns coal or scrap) | copper/iron ore → plate, + slag | brick, glowing mouth (existing smelter) |
| Crusher | low | ore → 1.5× crushed; slag → gravel | rollers, hazard hopper (existing) |
| Washer | low | crushed → concentrate, + sludge | water tank, spinning drum, blue glow |
| Settling Tank | none | sludge → scrap | round open tank |
| Coal Generator | **makes power** | coal → power, + ash | smokestack, red coils |
| Steel Mill | medium | iron plate + coal → steel, + slag | tall blast furnace, white-hot glow |
| Electric Smelter | medium | silicon concentrate → wafer | sleek steel box, cyan heat strip |
| Assembler | medium | plate + wafer + gold → circuit | robot arm over a pad, green indicator |
| Centrifuge | high | uranium concentrate → enriched + depleted | spinning cylinder, yellow trefoil |
| Rod Fabricator | medium | enriched + steel → fuel rod | press with green-glowing rods |
| Reactor | **makes power** | rods → power, + nuclear waste | dome, pulsing green core |
| Waste Vault | – | stores nuclear waste (finite) | hazard-striped bunker |
| Plasma Refinery | very high | rare concentrate + circuit → energy cell | magenta plasma ring |
| Incinerator | low | slag/ash → nothing | chimney with flame |
| Battery Bank | – | stores power | stacked cells, charge bars |

**Marks (MK1–MK5):** improve throughput (speed, buffers, power efficiency) **and** keep the existing ore gate: a machine's mark limits which ore tier it accepts (MK1 copper/coal, MK2 iron/silicon, MK3 gold/diamond, MK4 core/rare, MK5 uranium). Rare ores therefore need both the right machine chain and upgraded marks.

---

## 5. Process chains (what "meaningful investment" looks like)

1. **Copper/Iron (start):** Vault → Furnace → Box. No power. Slag needs a crusher or incinerator.
2. **Steel:** Furnace (iron plate) + coal from storage → Steel Mill → Box. Needs a Coal Generator on the grid.
3. **Silicon:** Crusher → Washer (+ Settling Tank for sludge) → Electric Smelter → wafer.
4. **Circuits:** Assembler fed by copper plate + wafer + gold, at least 3 machines upstream.
5. **Uranium:** Crusher → Washer → Centrifuge → Rod Fabricator (+ steel) → rods. A Reactor burns rods, and needs a Waste Vault.
6. **Rare → Energy Cell:** Crusher → Washer → Centrifuge → Plasma Refinery (needs reactor-level power + circuits).

Each step unlocks a building in the Forge's tech tree (extends the existing upgrade tree): Furnace → Coal Generator → Steel Mill → Washer → Electric Smelter → Assembler → Centrifuge → Rod Fabricator → Reactor → Plasma Refinery.

---

## 6. Spending tiers (re-mapped)

| Tier | Old material | New material |
|---|---|---|
| 1 | Copper Bar | Copper Plate |
| 2 | Iron Bar | Iron Plate, then Steel |
| 3 | Gold Bar | Gold Bar + Circuit |
| 4 | Cut Diamond | Cut Diamond + Fuel Rod |
| 5 | Core Ingot | Core Ingot + Energy Cell |

Rig upgrades, building marks, base upgrades and expansion keep the same tree and prices, with the tier materials swapped.

---

## 7. Save compatibility (migration on load)

- All ores keep their ids and counts.
- Copper Bar → Copper Plate, Iron Bar → Iron Plate; Gold Bar, Cut Diamond and Core Ingot stay as they are.
- Existing Smelter buildings become Furnaces at the same mark; Crushers and Storage Boxes stay.
- No progress is lost.

---

## 8. Implementation phases

1. **Data model and migration:** item registry, recipe table, machine table, save migration. MK becomes throughput-only. Furnace replaces Smelter (same chain behavior).
2. **Power grid:** coal ore in the world, Coal Generator, grid by adjacency, power HUD, under-power slowdown.
3. **Multi-machine chains and byproducts:** Washer, Settling Tank, Steel Mill, Electric Smelter, Assembler, Incinerator; slag/ash/sludge handling.
4. **Nuclear and rare:** uranium ore, Centrifuge, Rod Fabricator, Reactor, Waste Vault, Plasma Refinery, Battery Bank.
5. **Re-tier spending and balance:** swap Forge/mark/expansion costs to the new tier materials; tune rates.

Each phase ships playable, with its own commit and play link.

## Decisions (2026-11-15)
- Keep all Hivebreaker ores; add Coal, Silicon, Rare and Uranium as mineable ores.
- Power by adjacency only.
- Marks keep the ore gate and also raise throughput; specialized machines are required on top.
- Missing models are generated by extending `tools/generate_abyssal_ore_blocks.py` (see `docs/ASSET_REQUEST.md`).
