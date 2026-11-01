# Crafting and settlement progression: plan

Status: **approved and built in 0.11.0** (2026-11-01). Code: `parts/at_progression.js`. Test: `tests/t254.py`. The recipe table below was the proposal; the code is the source of truth (the wiki's Crafting page is generated from it).

## Decided

- Each camp level unlocks a station, and each tier station switches a crafting tier on across the camp.
- **Workbench, Forge, Anvil, Machine Shop, Generator, Stove, Campfire, Rack** work from anywhere inside the camp zone (as now).
- **Weapon Bench, Armour Bench and the new Medical Station** must be used in person: walk up and click the station to open its menu, which lists only what it makes.
- Weapons and ammo are made only at the Weapon Bench. Armour and accessories only at the Armour Bench. Medicine only at the Medical Station.
- **Blueprints** are for unique items only. The old generic blueprints (Forge Plans, Ironwork Manual and the rest) stop gating anything.
- **Crafting skill** no longer gates recipes. It lowers material costs and gives a chance of a better-made item.
- **Cooking and Husbandry** keep their skill gates on dishes and animal care (they are their own lines, not gear).
- **Old saves**: nothing is taken away. Stations already built keep working. New recipes follow the new rules.
- **The Hull** still sells higher-tier gear, behind Hull reputation, as a shortcut.
- **Raids** scale gently with camp level as well as the day.
- **Perks on level-up** are saved for later.
- Town station name: **Machine Shop**.

## What each camp level unlocks

| Camp level | Points (now) | Unlocks | Crafting tier |
|---|---|---|---|
| 1 Camp | 0 | Workbench, Weapon Bench, Armour Bench, Medical Station, Drying Rack, Feed Trough, walls, gate, guard post | **Scavenger** |
| 2 Outpost | 14 | Stove, Water Purifier, stone walls, furniture (as now) | Comfort, cooking and clean water |
| 3 Hamlet | 34 | **Forge**, Clinic Bed | **Forge Age** (once a Forge is built) |
| 4 Settlement | 60 | **Anvil**, turrets, pipes, sinks and sprinklers | **Settlement** (once an Anvil is built) |
| 5 Village | 95 | **Generator** | Powers the Machine Shop. Turrets in camp fire 25% faster |
| 6 Town | 140 | **Machine Shop** (needs a Generator in camp) | **Industry** (once both are built) |

Why the purifier moved to Outpost: clean water is survival, not progression, and the early quest Clean Water should not wait for Hamlet.

## New things

| New | What it does | Made at | Tier |
|---|---|---|---|
| Medical Station | Bandages, Rad Tabs, Rad-Away, Medkits, Trauma Kits, Beast Tonic. Must be used in person | Workbench | Camp |
| Rad-Away (now craftable) | Strips 60 radiation, as now | Medical Station | Settlement |
| Trauma Kit | Heals 140 in one go | Medical Station | Industry |
| Generator | Needed by the Machine Shop. Turrets fire 25% faster | Workbench | Village |
| Machine Shop | Turns steel ingots into Machined Parts. Switches on Industry | Workbench | Town |
| Machined Parts | The Industry material (steel ingot plus scrap) | Machine Shop | Industry |

**Sleeping and the Clinic Bed**
- You can sleep at any hour, in any bed, as long as no enemies are near. At night you sleep until 5:00 as now. In the day you sleep until you are rested, or until you stop.
- A **Stop sleeping** button shows whenever you are asleep.
- Sleeping in a **Clinic Bed** heals you as you sleep (about 25 health a game hour). Settlers resting in one heal too.

**Unique blueprints (proposal, art needed for each)**

| Blueprint | Found | Makes | Station, tier |
|---|---|---|---|
| Whisper | The Hollow, end room | A quiet pistol: high damage, slow, no noise | Weapon Bench, Forge Age |
| Breaker | Deepcut, after the Hollowclaw | A two-handed maul that knocks enemies back hard | Weapon Bench, Settlement |
| Debt Collector | Varro's cache at Greybridge | A double-barrel shotgun | Weapon Bench, Settlement |
| Leadweave Cloak | Pylon 3, end room | Body armour with the best radiation shield in the game | Armour Bench, Settlement |
| Harpooner's Coat | The Tidewrack, Wreck Fields at low tide | Body armour that shrugs off the Drowned and crabs | Armour Bench, Settlement |
| Guild Plate | Tinkers' Guildhall, Hull reputation 5 | The best armour set short of a frame suit | Armour Bench, Industry |

## Pacing

On my count a typical camp by the time of the Chapter Two bosses (4 settlers, 5 bunks, a dozen walls, a gate, a guard post, a purifier, two chests, campfire and stove, the three benches, a little furniture, some roofs, four raids survived and a small field) scores about 65: just past Settlement (60). So Forge Age (Hamlet, 34) arrives well before those bosses. I would keep the thresholds and add a test that scores three sample camps (early, mid, late) so any future change shows its effect.

## Raids

Raid size is multiplied by 0.85 at Camp, rising 0.07 a level to 1.2 at Town. From Settlement up, a raid can include one tougher fighter. Nothing else changes.

## The Progress screen (P)

- The crafting tree is laid out by camp level: each row shows its gate (for example "Hamlet, 34 points, then build a Forge"), whether it is locked, ready or done, and what it opens.
- A **Next step** box at the top: "Your camp has 21 of 34 points. Building a Forge opens Forge Age."
- Camp level and points, with what is earning the most.
- Hovering a recipe shows where it is made and what is missing.

## Also to fix

- Two recipes share the id `banner` (Banner and Raider Banner). One shadows the other.
- The early quest Clean Water says "Unlock the forge (blueprint, or Crafting level 3)". It becomes "Reach Outpost".
- The wiki: crafting, settlement, items and quests pages, and the progression rules in CLAUDE.md.

## Every recipe: where it is made and its tier

Cooking is left out (unchanged). Buildings and stations are in the camp level table above. "Old gate" shows what used to unlock it, which no longer applies.

### Weapons

| Recipe | Made at | Tier | Notes |
|---|---|---|---|
| Machete | Weapon Bench | Scavenger | was Workbench |
| Combat Cleaver | Weapon Bench | Forge Age | was Forge; old gate: blueprint ironwork or crafting 4 |
| Pipe Pistol | Weapon Bench | Forge Age | was Forge; old gate: blueprint firearms or combat 5 |
| Pistol Rounds x4 | Weapon Bench | Forge Age | was Forge; old gate: blueprint firearms or combat 5 |
| Chain Cleaver | Weapon Bench | Industry | was Anvil; old gate: blueprint steel or crafting 7 |
| Hunting Rifle | Weapon Bench | Industry | was Anvil; old gate: blueprint firearms or combat 7 |
| Spear | Weapon Bench | Scavenger | was Workbench |
| Crowbar | Weapon Bench | Scavenger | was Workbench |
| Nail Board | Weapon Bench | Scavenger | was Workbench |
| Crossbow | Weapon Bench | Forge Age | was Workbench |
| Sawn-off Shotgun | Weapon Bench | Forge Age | was Forge |
| Rattler SMG | Weapon Bench | Settlement | was Anvil |
| Sledgehammer | Weapon Bench | Settlement | was Anvil |
| Bolts x6 | Weapon Bench | Scavenger | was Workbench |
| Shells x6 | Weapon Bench | Forge Age | was Forge |
| Rebar Club | Weapon Bench | Scavenger | was Workbench |
| Zip Gun | Weapon Bench | Scavenger | was Workbench |
| Cattle Prod | Weapon Bench | Forge Age | old gate: crafting 3 |
| Skull Mace | Weapon Bench | Settlement | old gate: crafting 4 |
| Road Rifle | Weapon Bench | Settlement | old gate: combat 4 |
| Scatter Pipe | Weapon Bench | Forge Age | old gate: combat 4 |
| Ripsaw | Weapon Bench | Industry | old gate: crafting 6 |
| Harpoon Gun | Weapon Bench | Industry | old gate: combat 6 |

### Armour

| Recipe | Made at | Tier | Notes |
|---|---|---|---|
| Raider Helmet | Armour Bench | Scavenger | was Workbench |
| Raider Vest | Armour Bench | Scavenger | was Workbench |
| Raider Leggings | Armour Bench | Scavenger | was Workbench |
| Raider Boots | Armour Bench | Scavenger | was Workbench |
| Metal Helmet | Armour Bench | Forge Age | was Forge; old gate: blueprint ironwork or crafting 4 |
| Metal Armour | Armour Bench | Forge Age | was Forge; old gate: blueprint ironwork or crafting 4 |
| Metal Leg Guards | Armour Bench | Forge Age | was Forge; old gate: blueprint ironwork or crafting 4 |
| Metal Boots | Armour Bench | Forge Age | was Forge; old gate: blueprint ironwork or crafting 4 |
| Hazmat Hood | Armour Bench | Forge Age | was Workbench; old gate: blueprint hazmat or crafting 6 |
| Hazmat Suit | Armour Bench | Forge Age | was Workbench; old gate: blueprint hazmat or crafting 6 |
| Hazmat Pants | Armour Bench | Forge Age | was Workbench; old gate: blueprint hazmat or crafting 6 |
| Rubber Boots | Armour Bench | Forge Age | was Workbench; old gate: blueprint hazmat or crafting 6 |
| Lead Pendant | Armour Bench | Forge Age | was Forge; old gate: blueprint ironwork or crafting 4 |
| Spiked Bracer | Armour Bench | Scavenger | was Workbench |
| Combat Helmet | Armour Bench | Industry | was Anvil; old gate: blueprint steel or crafting 7 |
| Combat Armour | Armour Bench | Industry | was Anvil; old gate: blueprint steel or crafting 7 |
| Combat Leg Guards | Armour Bench | Industry | was Anvil; old gate: blueprint steel or crafting 7 |
| Combat Boots | Armour Bench | Industry | was Anvil; old gate: blueprint steel or crafting 7 |
| Patchwork Cap | Armour Bench | Scavenger | was Workbench |
| Patchwork Jacket | Armour Bench | Scavenger | was Workbench |
| Patchwork Trousers | Armour Bench | Scavenger | was Workbench |
| Patchwork Shoes | Armour Bench | Scavenger | was Workbench |
| Gas Mask | Armour Bench | Settlement | was Forge |
| Lead Apron | Armour Bench | Settlement | was Forge |
| Runner Wraps | Armour Bench | Scavenger | was Workbench |
| Geiger Band | Armour Bench | Forge Age | was Workbench |
| Welder Mask | Armour Bench | Forge Age | old gate: crafting 3 |
| Tyre Harness | Armour Bench | Forge Age | old gate: crafting 3 |
| Hose Greaves | Armour Bench | Forge Age | old gate: crafting 3 |
| Work Boots | Armour Bench | Forge Age | old gate: crafting 3 |
| Skull Helm | Armour Bench | Settlement | old gate: crafting 4 |
| Bone Harness | Armour Bench | Settlement | old gate: crafting 4 |
| Spiked Leggings | Armour Bench | Settlement | old gate: crafting 4 |
| Bone Boots | Armour Bench | Settlement | old gate: crafting 4 |
| Hockey Helm | Armour Bench | Settlement | old gate: crafting 5 |
| Plate Duster | Armour Bench | Settlement | old gate: crafting 5 |
| Chain Greaves | Armour Bench | Settlement | old gate: crafting 5 |
| Steel Toe Boots | Armour Bench | Settlement | old gate: crafting 5 |
| Skull Necklace | Armour Bench | Forge Age | old gate: crafting 3 |

### Tools

| Recipe | Made at | Tier | Notes |
|---|---|---|---|
| Rusty Hatchet | Workbench | Scavenger |  |
| Rusty Pick | Workbench | Scavenger |  |
| Hoe | Workbench | Scavenger |  |
| Watering Can | Workbench | Scavenger |  |
| Woodcutter Axe | Workbench | Forge Age | was Forge; old gate: blueprint ironwork or crafting 4 |
| Miners Pick | Workbench | Forge Age | was Forge; old gate: blueprint ironwork or crafting 4 |
| Fishing Rod | Workbench | Scavenger |  |
| Chopper | Machine Shop | Industry | was Anvil; old gate: blueprint steel or crafting 7 |
| Drill Pick | Machine Shop | Industry | was Anvil; old gate: blueprint steel or crafting 7 |
| Hammer | Workbench | Scavenger |  |
| Large Watering Can | Workbench | Forge Age |  |
| Pressure Can | Workbench | Settlement | was Forge |

### Supplies

| Recipe | Made at | Tier | Notes |
|---|---|---|---|
| Bandage | Medical Station | Scavenger | was By hand |
| Rad Tabs | Medical Station | Forge Age | was Workbench; old gate: blueprint medicine or farming 3 |
| Metal Plate | Forge | Forge Age | old gate: blueprint ironwork or crafting 4 |
| Empty Bottles x2 | By hand | Scavenger |  |
| Steel Ingot | Anvil | Settlement | was Forge; old gate: blueprint steel or crafting 6 |
| Medkit | Medical Station | Settlement | was clinic; old gate: crafting 5 |
| Animal Feed x3 | Workbench | Scavenger |  |
| Animal Feed x5 | Workbench | Forge Age |  |
| Beast Tonic | Medical Station | Settlement | was clinic; old gate: husbandry 3 |
| Cloth from Hide | Workbench | Scavenger |  |

### Structure

| Recipe | Made at | Tier | Notes |
|---|---|---|---|
| Wooden Wall | By hand | Scavenger |  |
| Scrap Wall | Workbench | Forge Age |  |
| Gate | Workbench | Scavenger |  |
| Wood Floor | By hand | Scavenger |  |
| Stone Floor | By hand | Forge Age |  |
| Wooden Roof | By hand | Scavenger |  |
| Scrap Roof | By hand | Forge Age |  |
| Stone Wall | Workbench | Forge Age | old gate: gathering 3 |
| Steel Wall | Workbench | Industry | was Anvil; old gate: blueprint fort or crafting 7 |
| Tile Floor | By hand | Forge Age |  |
| Concrete Floor | By hand | Forge Age |  |
| Carpet | By hand | Scavenger |  |
| Thatch Roof | By hand | Scavenger |  |
| Tyre Wall | Workbench | Scavenger |  |

### Defence

| Recipe | Made at | Tier | Notes |
|---|---|---|---|
| Barricade | By hand | Scavenger |  |
| Guard Post | Workbench | Scavenger |  |
| Spike Trap | Workbench | Forge Age | old gate: combat 3 |
| Scrap Turret | Workbench | Settlement | was Forge; old gate: blueprint fort or combat 6 |

### Decor

| Recipe | Made at | Tier | Notes |
|---|---|---|---|
| Lamp | By hand | Scavenger |  |
| Rug | By hand | Forge Age | old gate: crafting 2 |
| Table | By hand | Forge Age | old gate: crafting 2 |
| Chair | By hand | Forge Age | old gate: crafting 2 |
| Bookshelf | Workbench | Settlement | old gate: crafting 4 |
| Banner | Workbench | Settlement | old gate: crafting 4 |
| Potted Plant | By hand | Forge Age | old gate: crafting 2 |
| Skull Pike | Workbench | Scavenger |  |
| Barrel Fire | Workbench | Scavenger |  |
| Raider Banner | Workbench | Scavenger (camp level 2) |  |
