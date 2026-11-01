> OUTDATED. Written around session 8. It covers items, creatures, raids, the crafting tree, quests and survivors up to then. It does NOT cover the map engine, dialogue engine, dark pass, saves, Tidewrack, farming, livestock, arsenal or the Hull. Use it as a seed, and trust the code over this file.

# Wasteland Settlement: Wiki Notes

Running log of everything in the game that deserves a wiki page. Updated at the end of each session. Anything marked TBC still needs a real number or a story. Nothing here is invented, so gaps are gaps.

Page types to build later (Eastward Wiki style): Items, Characters, Locations, Creatures, Structures, Mechanics, Quests, Blueprints, Lore.

---

## Characters (survivors)

Each needs a backstory, a voice, and a personal quest hook. Stories are all TBC.

| Name | Found at | Farm | Guard | Haul | Story |
|---|---|---|---|---|---|
| Marta Voss | Outpost ruin | 3 | 0 | 1 | TBC |
| Dex Harlan | Shed | 0 | 2 | 3 | TBC |
| Wren Alvarez | Cabin | 1 | 1 | 3 | TBC |
| Old Tomas | Hut | 2 | 0 | 1 | TBC |
| Ripley Cho | Bunker | 0 | 3 | 1 | TBC |
| Sam Oduya | Shed | 0 | 1 | 3 | TBC |
| Lena Fischer | House | 2 | 0 | 2 | TBC |
| Boone Keller | House | 0 | 2 | 1 | TBC |
| Priya Nair | Shack | 1 | 1 | 2 | TBC |
| Juno Park | Hut | 0 | 1 | 3 | TBC |

Notes for later: each survivor is scared (!) if a monster is within 130px, so the area has to be cleared before recruiting. Recruiting needs a free bunk.

---

## Locations

- **Home Valley (base)**: tile (28, 98). Cliff-walled, two gates (north, east). Radiation-free (-1.0/s). Has a clean spring pond about 10 tiles from the starting bed.
- **Whisper Pines**: forest, (30, 42). Hidden enemies, dark.
- **Ashlands**: (88, 24).
- **Fallen City**: (102, 54).
- **Toxic Marsh**: (100, 102).
- **Quarry**: (70, 114).
- **Scrapyard**: (64, 78).
- 18 named ruins (outpost, office, shed, cabin, hut, bunker, armoury, house, pump, shack), each with a garrison and 1 to 2 crates. Names TBC.
- 6 hot spots (acid-green glow, radiation up to +1.8/s, rich crates).
- 4 oases and springs.

---

## Creatures

| Name | HP | Damage | Speed | Aggro | XP | Notes |
|---|---|---|---|---|---|---|
| Glowrat | 22 | 6 | 58 | 90 | 4 | Glowing eyes |
| Ash Hound | 38 | 9 | 66 | 130 | 8 | |
| Husk | 90 | 18 | 32 | 110 | 22 | Bulky, green glow |
| Scrapper | 55 | 12 | 46 | 140 | 15 | Club |
| Gunner | 42 | 9 | 40 | 170 | 18 | Ranged, keeps distance |

Behaviours worth a page: hidden spawns in forest and marsh (burst out at 46px), ambushes, dusk raids from Day 2.

---

## Items

### Weapons
| Name | Type | Damage | Cooldown | Notes |
|---|---|---|---|---|
| Rusty Pipe | Melee | 14 | 0.45 | Starter weapon |
| Scrap Machete | Melee | 22 | 0.40 | Scrap grade |
| Iron Cleaver | Melee | 36 | 0.50 | Iron grade |
| Scrap Pistol | Gun | 24 | 0.50 | Pistol rounds, range 170 |

### Armour sets
- **Scrap**: rusty grey, defence only. Stats TBC.
- **Iron**: polished steel, red plume, pauldrons. Stats TBC.
- **Hazmat**: yellow suit, goggles, blue boots, radiation shield first. Stats TBC.
- Accessories: Lead Pendant (radiation), Spiked Bracer (damage).

### Water and bottles
| Item | Water | Radiation |
|---|---|---|
| Lake or marsh water (direct) | restores | +15 |
| Spring water (direct or bottled) | 35 | +4 |
| Dirty Water (bottled) | 30 | +15 |
| Purified Water (bottled) | 45 | +1.5 |

- Empty Bottle: 3 scrap makes 2.
- Sapling: dropped by trees, plants on open ground, grows in 3 days.

### Crops
Radish (3 days), Potato (5), Tomato (6, regrows). Harvest returns 1 produce and 1 to 2 seeds.

### Medicine
Rad-Away (-60 radiation), Rad Tabs (-35).

---

## Structures

| Structure | HP | Notes |
|---|---|---|
| Workbench | 120 | Craft station |
| Forge | 160 | Craft station |
| Purifier | 100 | Must be built beside water |
| Barricade | 90 | Decoy |
| Wooden Wall | 110 | Connects to neighbours |
| Scrap Wall | 220 | |
| Gate | 130 | Friendlies pass, enemies blocked |
| Chest | 90 | 27 slots, settlers use it |
| Bunk | 90 | One per settler |
| Guard Post | 240 | Guards patrol to it |
| Lamp | 40 | Night light |
| Wood Floor, Stone Floor | n/a | Decorative, walkable |
| Wooden Roof, Scrap Roof | n/a | Fades when you are under it, blocks storm radiation |

Deconstruct returns 60% of materials.

---

## Mechanics

- **Death**: drop everything at a corpse marker, respawn at base. Dying again loses the old stash.
- **Radiation**: armour rad-shield reduces it. At 100 rad you take 1.5 damage/s.
- **Radiation storms**: every 3 to 5 days, starting around Day 3, daytime only. 14s warning, 45s storm, 10s fade. About +0.8 rad/s even in the valley, zero under a roof. Afterwards new rocks, scrap, ore, berry bushes and a couple of crates appear. Trees and structures are never affected.
- **Ambush meter**: builds while exploring, faster at night and in dangerous zones.
- **Raids**: from Day 2, every 2 days at dusk, scaling by day.
- **Farming**: crops grow only on days they were watered.
- **Shared storage**: chest contents count for crafting inside the valley.
- **Low health**: screen desaturates and reddens below 60%.

---

## Blueprints (where found)

- Forge Plans: outpost ruin east of camp
- Ironwork Manual: Scrapyard office
- Field Medicine Notes: forest cabin
- Hazmat Patterns: hot spot at (20, 18)
- Firearms Primer: east hot spot or city armoury

---

## Crafting tree (generated from the game)

Costs are as of this build. Unlock notes: some recipes need a blueprint, some open by skill level, some need a station nearby.

### Tier 1: Scavenger

| Recipe | Category | Cost | Unlock |
|---|---|---|---|
| Workbench | Build | 10 Wood, 6 Scrap | none |
| Barricade | Defence | 4 Wood, 2 Scrap | none |
| Scrap Axe | Tools | 4 Wood, 6 Scrap | station: workbench |
| Scrap Pickaxe | Tools | 4 Wood, 6 Scrap | station: workbench |
| Hoe | Tools | 3 Wood, 5 Scrap | station: workbench |
| Watering Can | Tools | 8 Scrap, 2 Wood | station: workbench |
| Scrap Machete | Weapons | 3 Wood, 8 Scrap | station: workbench |
| Scrap Helmet | Armour | 8 Scrap, 1 Wood | station: workbench |
| Scrap Vest | Armour | 14 Scrap, 2 Wood | station: workbench |
| Scrap Greaves | Armour | 10 Scrap | station: workbench |
| Scrap Boots | Armour | 6 Scrap, 1 Wood | station: workbench |
| Spiked Bracer | Armour | 6 Scrap, 1 Wood | station: workbench |
| Bandage | Supplies | 2 Cloth | none |
| Wooden Wall | Structure | 3 Wood | none |
| Storage Chest | Build | 12 Wood, 4 Scrap | none |
| Bunk Bed | Build | 8 Wood, 4 Cloth | none |
| Lamp | Decor | 2 Scrap, 1 Wood | none |
| Wood Floor | Structure | 1 Wood | none |
| Wooden Roof | Structure | 2 Wood | none |
| Empty Bottles x2 | Supplies | 3 Scrap | none |
| Bedroll | Build | 4 Cloth, 2 Wood | none |
| Campfire | Build | 6 Wood, 4 Stone | none |
| Fishing Rod | Tools | 3 Wood, 2 Scrap, 1 Cloth | station: workbench |
| Cooked Fish | Cooking | 1 Raw Fish | station: campfire |
| Cooked Glowfish | Cooking | 1 Glowfish | station: campfire |
| Baked Potato | Cooking | 1 Potato | station: campfire |
| Berry Mash | Cooking | 4 Berries | station: campfire |

### Tier 2: Forge Age

| Recipe | Category | Cost | Unlock |
|---|---|---|---|
| Forge | Build | 12 Stone, 8 Scrap, 4 Wood | blueprint: forge; or crafting level 3; station: workbench |
| Water Purifier | Build | 3 Metal plate, 8 Scrap, 4 Stone | blueprint: ironwork; or crafting level 4; station: forge |
| Iron Axe | Tools | 4 Wood, 4 Metal plate | blueprint: ironwork; or crafting level 4; station: forge |
| Iron Pickaxe | Tools | 4 Wood, 4 Metal plate | blueprint: ironwork; or crafting level 4; station: forge |
| Iron Cleaver | Weapons | 5 Metal plate, 3 Wood | blueprint: ironwork; or crafting level 4; station: forge |
| Scrap Pistol | Weapons | 4 Metal plate, 6 Scrap, 2 Wood | blueprint: firearms; or combat level 5; station: forge |
| Pistol Rounds x4 | Weapons | 1 Metal plate, 2 Scrap | blueprint: firearms; or combat level 5; station: forge |
| Iron Helm | Armour | 4 Metal plate | blueprint: ironwork; or crafting level 4; station: forge |
| Iron Plate | Armour | 8 Metal plate, 4 Scrap | blueprint: ironwork; or crafting level 4; station: forge |
| Iron Greaves | Armour | 6 Metal plate | blueprint: ironwork; or crafting level 4; station: forge |
| Iron Boots | Armour | 4 Metal plate | blueprint: ironwork; or crafting level 4; station: forge |
| Hazmat Hood | Armour | 4 Cloth, 2 Scrap | blueprint: hazmat; or crafting level 6; station: workbench |
| Hazmat Suit | Armour | 8 Cloth, 3 Scrap | blueprint: hazmat; or crafting level 6; station: workbench |
| Hazmat Pants | Armour | 5 Cloth, 2 Scrap | blueprint: hazmat; or crafting level 6; station: workbench |
| Rubber Boots | Armour | 3 Cloth, 4 Scrap | blueprint: hazmat; or crafting level 6; station: workbench |
| Lead Pendant | Armour | 2 Metal plate, 3 Scrap | blueprint: ironwork; or crafting level 4; station: forge |
| Rad Tabs | Supplies | 6 Berries, 2 Scrap | blueprint: medicine; or farming level 3; station: workbench |
| Metal Plate | Supplies | 5 Scrap | blueprint: ironwork; or crafting level 4; station: forge |
| Scrap Wall | Structure | 4 Scrap, 1 Wood | station: workbench |
| Gate | Structure | 6 Wood, 4 Scrap | station: workbench |
| Guard Post | Defence | 10 Wood, 12 Scrap, 4 Stone | station: workbench |
| Stone Floor | Structure | 2 Stone | none |
| Scrap Roof | Structure | 2 Scrap, 1 Wood | none |
| Stove | Build | 12 Scrap, 3 Metal plate, 6 Stone | blueprint: kitchen; or cooking level 3; station: workbench |
| Stone Wall | Structure | 6 Stone, 1 Scrap | or gathering level 3; station: workbench |
| Spike Trap | Defence | 8 Scrap, 4 Wood | or combat level 3; station: workbench |
| Rug | Decor | 4 Cloth | or crafting level 2 |
| Table | Decor | 8 Wood | or crafting level 2 |
| Chair | Decor | 5 Wood | or crafting level 2 |
| Potted Plant | Decor | 3 Scrap, 1 Sapling | or crafting level 2 |

### Tier 3: Settlement

| Recipe | Category | Cost | Unlock |
|---|---|---|---|
| Anvil | Build | 8 Metal plate, 6 Stone, 6 Scrap | blueprint: anvil; or crafting level 6; station: forge |
| Clinic Bed | Build | 12 Wood, 10 Cloth, 2 Metal plate | blueprint: medicine; or crafting level 5; station: workbench |
| Scrap Turret | Defence | 6 Metal plate, 14 Scrap, 4 Stone | blueprint: fort; or combat level 6; station: forge |
| Bookshelf | Decor | 12 Wood, 3 Cloth | or crafting level 4; station: workbench |
| Banner | Decor | 6 Cloth, 3 Wood | or crafting level 4; station: workbench |
| Steel Ingot | Supplies | 3 Iron ore, 2 Scrap | blueprint: steel; or crafting level 6; station: forge |
| Medkit | Supplies | 4 Cloth, 1 Rad tabs, 2 Bandage | or crafting level 5; station: clinic |
| Veg Stew | Cooking | 1 Potato, 1 Radish, 1 Tomato | station: stove |
| Fish Stew | Cooking | 2 Raw Fish, 1 Potato, 1 Tomato | station: stove |
| Tomato Soup | Cooking | 2 Tomato, 1 Purified Water | station: stove |

### Tier 4: Industry

| Recipe | Category | Cost | Unlock |
|---|---|---|---|
| Steel Wall | Structure | 2 Steel Ingot, 2 Metal plate | blueprint: fort; or crafting level 7; station: anvil |
| Steel Axe | Tools | 3 Steel Ingot, 3 Wood | blueprint: steel; or crafting level 7; station: anvil |
| Steel Pickaxe | Tools | 3 Steel Ingot, 3 Wood | blueprint: steel; or crafting level 7; station: anvil |
| Steel Cleaver | Weapons | 5 Steel Ingot, 2 Wood | blueprint: steel; or crafting level 7; station: anvil |
| Hunting Rifle | Weapons | 5 Steel Ingot, 4 Metal plate, 3 Wood | blueprint: firearms; or combat level 7; station: anvil |
| Steel Helm | Armour | 4 Steel Ingot | blueprint: steel; or crafting level 7; station: anvil |
| Steel Plate | Armour | 8 Steel Ingot, 2 Cloth | blueprint: steel; or crafting level 7; station: anvil |
| Steel Greaves | Armour | 6 Steel Ingot | blueprint: steel; or crafting level 7; station: anvil |
| Steel Boots | Armour | 4 Steel Ingot | blueprint: steel; or crafting level 7; station: anvil |

## Quests (journal)

### A Roof and a Fire

From: The Valley. Reward: 60 XP, 3 Canned food, 2 Bandage.

- Gather 10 wood and 6 scrap
- Build a Workbench (C, Build tab)
- Craft a Scrap Axe
- Craft a Hoe and a Watering Can
- Till some soil and plant a seed
- Build a Bunk Bed and a Storage Chest
- Find a survivor and bring them home

### Clean Water

From: Your own throat. Reward: 45 XP, 4 Empty Bottle.

- Unlock the forge (blueprint, or Crafting level 3)
- Build a Water Purifier beside the pond
- Fill a bottle at the purifier

### Mouths to Feed

From: Your settlers. Reward: 50 XP, 4 Potato Seeds, 4 Tomato Seeds.

- Craft a Fishing Rod
- Catch a fish
- Cook something at a campfire
- Watch a settler eat from the chest

### Hold the Gate

From: The cliffs. Reward: 90 XP, 8 Pistol rounds, 10 Scrap.

- Build 8 wall pieces
- Build a Gate
- Build a Guard Post
- Survive a raid

### Something to Sell

From: A stranger on the road. Reward: 60 XP, 50 Caps.

- Meet a travelling merchant
- Sell something to them
- Buy something from them

### Beyond the Gates

From: Curiosity. Reward: 70 XP, 1 Rad-Away, 6 Cloth.

- Visit 3 different regions
- Open a supply crate in the wild

Story and characters: not written yet. This is the next job after the build chunks.

## Systems added in session 6

- **Menu hub**: tabs for Inventory, Crafting, Map, Progress, Journal, Settlement, Codex, Settings. Esc opens the pause menu (resume, save, load, menu, settings, return to title).
- **Settings**: sound, volume, pause in menus, settler death (return after a day by default, or permanent), difficulty (Relaxed, Normal, Harsh), screen shake, low health effect, autosave.
- **Difficulty presets**: Relaxed 0.6x hunger and thirst, 0.7x raids, 0.7x radiation. Harsh 1.4x, 1.4x, 1.25x.
- **Save and load**: autosave each morning, manual save, saved to browser storage.
- **Progress tab**: level, stats, seven skills (Gathering, Farming, Crafting, Combat, Fishing, Cooking, Exploring) and the whole crafting tree with locked recipes visible.
- **Settlement tab**: settlers, jobs (Farmer, Guard, Hauler, Fisher), per-job levels that rise with use, comfort rating that speeds up work, defences and storage summary.
- **Codex**: creatures, items, people and places fill in as the player meets them. Meant to feed the real wiki.
- **Fishing**: cast at water with a rod, click when the line twitches. Settlers can fish too.
- **Cooking**: campfire first, stove and later stations unlock more meals.
- **Encounters**: travellers, wounded survivors, caches and travelling merchants appear while exploring.
- **Trading**: merchants buy at about half value. Sell food, scrap and crops for caps.
- **Moving built items**: F picks up a structure and puts it somewhere else, including the starting bedroll.
- **Quick-stack**: Q (or the button) moves bag items the open chest already holds.
- **Downed settlers**: knocked out for a day then back, unless permanent death is on.

## Story: chapter one (DRAFT, to be rewritten in the story pass)

Premise: you wake in the valley with a note from yourself. Three missions, each in a different part of the map. The chain ends on a cliffhanger pointing north-west, past the map edge.

### Third Drawer

From: A note in your handwriting.

You woke in the valley with nothing but a note in your coat, written in your own hand, by someone who clearly knew a lot more than you do. It points to a depot office in the scrapyard.

- Read the note (open your bag, right-click it)
- Find the Depot Office in the Scrapyard
- Open the crate in the Depot Office
- Read the Dispatch Slip

Reward: 80 XP, 2 Bandage, 2 Canned food.

### The Pump House

From: The Dispatch Slip.

Eleven in, eleven out, and a ledger at the pump house in the Toxic Marsh. The water out there is not for drinking, so pack something for the radiation.

- Reach the Pump House in the Toxic Marsh
- Find the pump ledger
- Read the Pump Ledger

Reward: 110 XP, 2 Rad-Away, 3 Metal plate.

### The Signal

From: The Pump Ledger.

Four digits on the back of the brass tag: 4471. The tower in the ashlands still answers on it. Whatever is up there knows who you are.

- Reach the bunker under the Ash Tower, in the Ashlands
- Open the radio room crate (it wants your brass tag)
- Listen to the Signal Tape

Reward: 180 XP, 2 Rad-Away, 10 Pistol rounds.

### Documents (full text)

**Folded Note** (A note, folded small)

> If you are reading this, it worked and you remember nothing. Good. That was the plan.
> >
> > Do not go to the city. Do not trust the radio.
> >
> > Start with the depot office in the scrapyard. Third drawer. The tag in there will fit your wrist.
> >
> > The valley is safe because I made it safe. Plant the seeds. Keep them alive. They matter more than you do.
> >
> > Sorry about the headache.
> >
> > You

**Dispatch Slip** (Depot Dispatch, Form 11-B)

> Eleven in. Eleven out.
> One valley, one gate, one pump.
> >
> > Tags issued to all eleven. Unit 11 to collect last.
> >
> > The pump house keeps the ledger. Water first, questions after.
> >
> > Authorised by: [name blacked out]

**Pump Ledger** (Pump House 4, water log)

> Day 1. Eleven on the register. Eleven asleep.
> >
> > Day 212. Power failing. Water still clean. Pump running off the old valley feed.
> >
> > Day 380. Register says eleven. I count ten in the ruins. One is missing and I know which.
> >
> > Day 381. Tag numbers are stamped on the wall. Four digits scratched on the back of each: 4471. The tower in the ashlands still answers on it. Take the tag. Do not take the stairs.

**Signal Tape** (Tape 11, Ash Tower)

> ... wake group acknowledged. Seed stock confirmed. Eleven tags, one answering.
> >
> > Unit 11, if you are hearing this: you did not do this to yourself. You asked us to do it to you.
> >
> > The coast is the next stop. Bring the seeds. Bring the ten.
> >
> > Do not trust the radio.
> >
> > That is us. That is the radio.

Story threads worth a page each: the eleven tags and ten survivors (one is missing, and it is you), the valley as a deliberate refuge, the seed stock, the radio, the coast. All of it is placeholder until the story pass.

## Systems added in session 7

- **Rest and stamina**: Rest drains over the day and refills by sleeping. Low rest slows you down, and at zero you collapse and wake up weakened. Hold Shift to sprint (about 1.5 times walking speed), which drains stamina. Run it dry and you are winded until it recovers.
- **Kits**: craft a structure at its station as a kit, carry it, and build it anywhere. Select the kit in your hotbar to place it.
- **Plumbing**: Pipes and Sinks, unlocked by crafting skill. A sink works while a connected line of pipes reaches a water purifier. Cut a pipe and the sink stops working. Fill bottles and watering cans at the sink.
- **Settlers carry what they gather**: haulers, farmers and fishers carry resources to the nearest chest. You can see the item and count above their head, and in the Settlement tab.
- **Music**: generated, no files. Changes mood between day, night and danger. Own on/off in Settings.

## Creatures (updated, 12 types)

Health shown is base. In game it is multiplied by 1.2 and by the difficulty setting.

| Name | HP | Damage | Speed | Notices from | XP | Ranged |
|---|---|---|---|---|---|---|
| Glowrat | 22 | 7 | 58 | 90 | 4 | no |
| Ash Hound | 38 | 10 | 66 | 130 | 8 | no |
| Husk | 90 | 21 | 32 | 110 | 22 | no |
| Scrapper | 55 | 14 | 46 | 140 | 15 | no |
| Gunner | 42 | 10 | 40 | 170 | 18 | yes |
| Stalker | 34 | 11 | 86 | 150 | 11 | no |
| Sapper | 30 | 0 | 64 | 200 | 14 | no |
| Brute | 170 | 26 | 28 | 120 | 36 | no |
| Sniper | 36 | 24 | 36 | 240 | 26 | yes |
| Bloater | 62 | 15 | 24 | 90 | 20 | no |
| Spitter | 40 | 8 | 36 | 150 | 17 | yes |
| Raid Chief | 380 | 22 | 38 | 230 | 130 | no |

Behaviours: Stalkers bite and retreat. Sappers run at walls and explode (90 damage to structures in a small radius). Brutes do 2.5 times damage to structures. Snipers keep their distance and shoot slow, hard shots. Bloaters leave a radiation cloud when killed. Spitters shoot slow acid that adds radiation. The Raid Chief rallies nearby raiders for a speed boost, and killing the chief makes the raid run.

## Raid types

| Type | From day | Size | Note |
|---|---|---|---|
| A scavenger band | 1 | x1 | Hold the gates. |
| A swarm of vermin | 2 | x1.7 | Lots of them, and fast. Keep your back to a wall. |
| Breachers | 4 | x0.9 | They carry charges. Keep them off your walls. |
| A gun crew | 5 | x0.9 | Snipers will pick at your guards. |
| A warband under a Raid Chief | 6 | x1.2 | Drop the chief and the rest will break. |

Every fifth raid from day 6 is a warband under a Raid Chief, arriving from two sides.

## Weapons (updated)

| Weapon | Type | Damage | Cooldown | Notes |
|---|---|---|---|---|
| Rusty Pipe | melee | 14 | 0.45 | reach 20 |
| Scrap Machete | melee | 22 | 0.4 | reach 23 |
| Iron Cleaver | melee | 36 | 0.5 | reach 25 |
| Scrap Pistol | gun | 24 | 0.5 | ammo: Pistol rounds |
| Steel Cleaver | melee | 52 | 0.5 | reach 26 |
| Hunting Rifle | gun | 52 | 0.95 | ammo: Pistol rounds |
| Spear | melee | 24 | 0.55 | reach 34 |
| Crowbar | melee | 21 | 0.38 | reach 22 |
| Spiked Bat | melee | 30 | 0.5 | reach 23 |
| Fire Axe | melee | 40 | 0.62 | reach 25 |
| Sledgehammer | melee | 62 | 1 | reach 25 |
| Raider Blade | melee | 46 | 0.42 | reach 27 |
| Revolver | gun | 36 | 0.75 | ammo: Pistol rounds |
| Scrap SMG | gun | 11 | 0.13 | ammo: Pistol rounds |
| Sawn-off Shotgun | gun | 11 | 1.15 | 5 pellets, ammo: Shells |
| Pump Shotgun | gun | 13 | 0.95 | 6 pellets, ammo: Shells |
| Crossbow | gun | 38 | 0.95 | ammo: Bolts |

Loot only (not craftable): Fire Axe, Raider Blade, Revolver, Pump Shotgun, the Riot set, Raider Totem. Chiefs, brutes, snipers, gunners and some crates drop them.

## Armour (updated)

| Piece | Slot | Defence | Radiation shield |
|---|---|---|---|
| Scrap Helmet | head | 6% | 0% |
| Scrap Vest | body | 12% | 0% |
| Scrap Greaves | legs | 8% | 0% |
| Scrap Boots | feet | 4% | 0% |
| Iron Helm | head | 10% | 0% |
| Iron Plate | body | 20% | 0% |
| Iron Greaves | legs | 14% | 0% |
| Iron Boots | feet | 8% | 0% |
| Hazmat Hood | head | 2% | 18% |
| Hazmat Suit | body | 3% | 30% |
| Hazmat Pants | legs | 2% | 18% |
| Rubber Boots | feet | 2% | 12% |
| Lead Pendant | acc | 0% | 8% |
| Spiked Bracer | acc | 5% | 0% |
| Steel Helm | head | 14% | 0% |
| Steel Plate | body | 26% | 0% |
| Steel Greaves | legs | 18% | 0% |
| Steel Boots | feet | 11% | 0% |
| Padded Cap | head | 3% | 0% |
| Padded Jacket | body | 8% | 0% |
| Padded Trousers | legs | 5% | 0% |
| Padded Shoes | feet | 2% | 0% |
| Riot Helmet | head | 11% | 0% |
| Riot Vest | body | 20% | 0% |
| Riot Greaves | legs | 14% | 0% |
| Riot Boots | feet | 8% | 0% |
| Gas Mask | head | 2% | 26% |
| Lead Apron | body | 10% | 40% |
| Runner Wraps | acc | 0% | 0% |
| Geiger Band | acc | 0% | 12% |
| Raider Totem | acc | 8% | 0% |

Runner Wraps also add 20% stamina recovery.

## The ten survivors (DRAFT, story pass will rewrite)

Each wears a tag numbered 1 to 10. You are tag 11. Each has a request that starts a journal entry, and finishing it gives a reward, +1 to one job skill, and a Tag Card with a fragment of the larger story.

### Marta Voss

Ran the greenhouse at the old valley co-op until the roof came down. Still carries a packet of seeds in her pocket. Tag 1 is on her wrist and she does not remember putting it there.

**Quest: The Last Packet.** "I have one packet left and it is not enough. Grow me some tomatoes, bring me three, and I will tell you what the label on the case said."

- Grow three Tomatoes
- Give Marta three Tomatoes

Reward: 60 XP, 6 Tomato Seeds, 1 Tag Card 1.

### Dex Harlan

Quarry foreman. Knows every rock in the Scrapyard and holds a grudge against every raider in it. Tag 2. His crew is gone and he will not say how.

**Quest: Dex’s Grudge.** "Raiders took my crew. Put five of them down and bring me stone for a marker. Ten pieces. Then I will talk."

- Defeat five raiders
- Give Dex ten Stone

Reward: 80 XP, 1 Sledgehammer, 1 Tag Card 2.

### Wren Alvarez

Scavenger who grew up in the pines. Quiet, quick, and good at not being seen. Tag 3. She woke first and has been walking ever since.

**Quest: Eyes in the Pines.** "I walked the whole map looking for the others. If you want to know what I found, walk it yourself. The pines, the ashlands and the city. Then I will sketch you something."

- Visit Whisper Pines, the Ashlands and Fallen City

Reward: 70 XP, 1 Runner Wraps, 1 Tag Card 3.

### Old Tomas

Kept bees before the bombs. Insists the bees survived somewhere. Grows a mean tomato. Tag 4, which he finds hilarious, because he never signed up for anything.

**Quest: The Bees Survived.** "They survived somewhere. I would bet my boots. Bring me six berries and put a pot of something green on the table. The bees like a garden."

- Give Tomas six Berries
- Place a Pot in the camp

Reward: 60 XP, 4 Wild Honey, 1 Tag Card 4.

### Ripley Cho

Bunker engineer with an engineer’s patience for bad plans. Tag 5. She trusts concrete, steel and very little else.

**Quest: Hold the Line.** "I will tell you about the bunker. First put two guard towers up and get through a raid. I want to see how you hold a line."

- Build two Guard Posts
- Survive a raid

Reward: 110 XP, 1 Riot Helmet, 1 Riot Vest, 1 Tag Card 5.

### Sam Oduya

Drove trucks for the depot and knows every road that is still a road. Tag 6. Keeps a spare tyre in his bag, out of habit.

**Quest: Parts and Pieces.** "I can fix a truck if you can find me the bits. Twelve scrap and three metal plate. A truck is just a road you carry with you."

- Give Sam twelve Scrap
- Give Sam three Metal plate

Reward: 70 XP, 1 Revolver, 1 Tag Card 6.

### Lena Fischer

Medic. Steady hands and an unsteady memory. Tag 7. She has stitched herself up twice since waking and is not proud of either.

**Quest: Field Clinic.** "Give me a clinic and bandages and I will be useful. I would also like to stop stitching myself up."

- Build a Clinic
- Give Lena three Bandages

Reward: 90 XP, 2 Medkit, 1 Tag Card 7.

### Boone Keller

Security. Big, careful, and ashamed of something he will not name. Tag 8. He keeps his back to a wall.

**Quest: Dead Man’s Ledger.** "There is a Husk walking out there that I think I used to know. Put it down and bring me ten rounds. I will not ask you to do the rest."

- Defeat a Husk
- Give Boone ten Pistol rounds

Reward: 100 XP, 1 Scrap SMG, 1 Tag Card 8.

### Priya Nair

Radio technician. Can hear a signal through a wall. Tag 9. She does not like the broadcast and will not say why.

**Quest: Dead Air.** "The broadcast is not a signal. It is a recording. Get me scrap and two plates so I can build a receiver, then take me to the tower. In spirit. Go and stand under it."

- Give Priya six Scrap
- Give Priya two Metal plate
- Stand under the Ash Tower

Reward: 120 XP, 1 Geiger Band, 1 Tag Card 9.

### Juno Park

The youngest of the ten. Cooked for the wake group. Tag 10. She asks everyone the same question: did you eat?

**Quest: Something Warm.** "Did you eat? Cook three proper meals, and bring me a stew. Any stew. I want to see if you remember how."

- Cook three meals
- Give Juno a stew

Reward: 70 XP, 1 Padded Jacket, 2 Wild Honey, 1 Tag Card 10.

### Tag Cards (full text)

**Tag Card 1.** Marta Voss. Seed keeper. The case was labelled in your hand: “Not for eating. Not yet.” She never opened it, and she thinks that was a mistake.

**Tag Card 2.** Dex Harlan. Quarry foreman. The raiders did not come until the radio started. He counted nine voices on the first night, and ten the next.

**Tag Card 3.** Wren Alvarez. Scout. She woke first, by three weeks, and found a mark on every ruin door: an eleven, scratched with something sharp. She did not scratch them.

**Tag Card 4.** Tomas. Beekeeper. Not a soldier, not a scientist. Someone put him on the list because the programme needed bees. He asks who decided that, and whether you remember.

**Tag Card 5.** Ripley Cho. Bunker engineer. She says the bunker under the tower was built from plans with your signature on them. She asks you not to take that as an accusation.

**Tag Card 6.** Sam Oduya. Driver. He remembers a delivery manifest with eleven names and a twelfth line crossed out in thick black ink.

**Tag Card 7.** Lena Fischer. Medic. The sleepers were not frozen. They were kept under, and woken one by one. She wants to know why the last one was kept under longest.

**Tag Card 8.** Boone Keller. Security. His orders were to watch Unit 11. He fell asleep on watch, or someone made him. He wants you to know he never meant to lose you.

**Tag Card 9.** Priya Nair. Radio. The voice reading the call sign on the tape is one she has heard in person. She will not say whose.

**Tag Card 10.** Juno Park. The youngest. She cooked for the wake group and remembers a table set for eleven. One place was never touched. It was always yours.

## Systems added in session 8

- **Dismissing a settler**: they head back to where you found them. Job levels are kept. They can rejoin when you have a free bed.
- **Repairs**: a Hammer repairs damaged structures (15% health per hit, a little material). Settlers on the Builder job do it from your chests.
- **Pinned recipes**: up to three pinned recipes show live material counts on the right of the screen.
- **Slower levelling**: level XP needs are about double. Health per level 3, damage per level 2.5%. Enemies have 20% more health and 15% more damage.
- **Stuck settlers**: goals inside solid tiles shift to a free tile. Settlers who stay stuck are nudged, re-routed, then moved clear.
- **Tools in hand and towers**: farmers, haulers, fishers, builders and guards hold the right tool. Guards on duty stand on guard posts.
- **Food buffs**: cooked meals give timed buffs (Hearty, Warm Belly, Sugar Rush, Rad Ward, Iodine Broth, Strong, Mending, Honeyed). Raw fish, glowfish and raw meat add radiation.
- **Markers and compass**: click the big map to drop a marker, again to track, again to remove. Rumours appear as "?" and reveal a real location when you get near. A compass on the HUD points at the tracked marker or current quest.
- **Camp level**: Camp, Outpost, Hamlet, Settlement, Village, Town. Points come from settlers, beds, towers, walls, comfort, clinic, purifier, roofs and raids survived. Levels 2 to 4 unlock the stove, rugs and decor, stone walls and traps (2), bookshelf, clinic, turret, anvil, meat stew (3), steel walls (4).
- **Settlers on the maps**: green dots on the minimap and big map.

## Ideas parked for later

- Trade routes between settlements
- Companions and pets
- Seasons and weather beyond radiation storms
- Music
- Vehicles

## Session log

- **Sessions 1 to 5**: core game, art passes, open world, settlers, base building, sound, rotation, roofs, bottles, saplings, storms.
- **Session 6**: menu hub, settings, save and load, journal and first quests, settler job levels, fishing, cooking, encounters, trading, tiered crafting tree, moving structures, clinics and defences, codex, quick-stack, difficulty presets.
- **Session 7**: rest and stamina, kits, plumbing, settler carrying, music, chapter one (three missions).
- **Session 8**: dismissing, repairs and Builder job, pinned recipes, slower levelling, stuck-settler fix, tools and towers, food buffs, markers and compass, camp level, new mobs and raid types, weapons, armour and loot, ten survivor stories.
- **Next**: story pass.
