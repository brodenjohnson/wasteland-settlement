# World design: the atlas

Status: Phase 0 draft, 2026-11-01. Nothing here is built. Sections marked **Decide** need Broden's answer before Phase 1.
Measurements come from `tests/t260.py` (the spike) and `tools/balance.py` (the balance model). Re-run both after big changes.

## 1. What Phase 0 found

### Spike numbers
Measured in headless Chromium on Broden's machine. Headless Chrome draws in software, so frame times are several times worse than a real browser. Read them as relative, not absolute.

| What | Number | What it means |
|---|---|---|
| Generating a map (29 maps: dungeons, Hull, interiors) | mean 235 ms, worst 404 ms (`camp`) | A region is one more map of the same kind. The fade already covers 350 ms of black. A region at 400 to 800 ms is fine with the fade held until it is ready. |
| Render, the Wastes | 25 to 36 ms a frame (headless) | Clearing every object off the map changes it by about 3 ms. Object count is not the cost, so denser regions are safe. |
| Render, the Tidewrack | 43 to 57 ms a frame (headless) | Full-screen effects (sea fog, light) are the cost. Watch region weather and fog, not prop count. |
| Memory: each visited map keeps its ground image | 16 MB each, 480 MB after visiting 30 maps | **The real risk, and it exists today.** A player who walks through every Hull building holds about half a gigabyte of images. Seven regions and their dungeons would be worse. Fix in Phase 1a: keep at most the current map, the Wastes and the last two maps in memory; pack the rest the way saves already do and rebuild their ground on return. |
| Save, fresh character | 190 KB raw, 25 KB gzipped | |
| Save after visiting 29 maps | 1.1 MB raw, 136 KB gzipped | Each map adds about 32 KB raw, mostly its whole object grid (22 KB) and its fog image (9 KB). |
| Save, projected worst case: about 90 maps (7 regions, 35 dungeons, the Hull) | about 3.5 MB raw, about 450 KB gzipped per slot | Saves go to IndexedDB, gzipped (localStorage only if IndexedDB fails). IndexedDB allows hundreds of MB, so this is fine. I was wrong earlier about a 5 MB limit. Optional saving: store each map's objects as changes from the seed, which would cut most of the 22 KB. Not needed yet. |

### What the balance model says
`python tools/balance.py` (live) and `--proposal` (to level 20). Melee, best gear of the tier, one enemy, every hit lands.

- **Up to tier 2 gear the game is as the old balance notes describe:** a husk takes about 2 seconds to kill and 9 to 14 to kill you; a boss is close at level 2 with four medkits.
- **From tier 3 (Settlement) armour reaches 78% damage reduction, just under the 80% cap, and fights stop being dangerous.** At level 10 a brute needs 30 seconds to kill you and you need 2 to kill it. Bosses need two minutes. Only packs of three still threaten a low-level player. This is a balance problem in the live game, not only a world problem.
- **Raising enemy levels alone does almost nothing.** Under today's formula a level 20 brute takes 26 seconds to kill an armoured player against 39 for a level 1. Health climbs, but damage barely does and armour eats it. Level bands would mean nothing.
- **The fix the model supports:** above level 10, enemy damage grows 6% a level (not 2.5%), and armour stops less against them: 4% less of its rating per level above 10, down to 60% at level 20. Nothing changes at or below level 10. With that, a fully armoured brute fight lasts about 30 seconds in the Valley, 24 in the Dustbowl, 17 on the Ridge, 15 in the Foundry Belt, 10 in Meridian City and 8 in the Deep. Region gear (section 6) brings it back up for a player who has done the work.

## 2. The atlas

Seven regions, each its own 128 by 128 map, built one per release in this order. The Hull is the junction.

| # | Region | Levels | Joined by | Feel | Hub | Ten |
|---|---|---|---|---|---|---|
| 1 | The Valley and Wastes | 1 to 6 | Hull west gangway (exists) | What is there now, enlarged | The Hull, a roadhouse | Marta, Tomas, Dex, Boone, Priya, Ripley |
| 2 | The Hull Coast (with the Tidewrack) | 4 to 9 | Hull harbour ferry; the Spine hatch (exists) | Salt, fog, rust, tide | Lamp Cove, a fish market | Juno |
| 3 | The Dustbowl | 6 to 11 | Hull east gate | Dry lake beds, dust storms, rail lines, grain silos | A rail depot town | Sam |
| 4 | The Foundry Belt | 9 to 14 | A tunnel from the Dustbowl | Smelters, slag, glowing runoff. Needs radiation protection | A union hall | none |
| 5 | The Ridge | 8 to 13 | A pass from the Dustbowl | Cold, pines, an old observatory, snow on the tops | A monastery hostel | Lena, Wren |
| 6 | Meridian City | 12 to 18 | A bridge from the Foundry Belt | The Trust's own city: towers, a stadium camp, clean streets nobody cleans | The stadium market | none |
| 7 | The Deep | 15 and up | A lift shaft under Meridian City | Service levels under the city and the Cradle's supply lines | none (dungeon country) | none |

Region 5 is built before 4 in level terms but after it in the release order (decision 3 keeps the order). The Ridge's band starts lower so a player who skips the Foundry can still progress.

**Layout inside a region.** A dense core (the hub and the safest places), a medium ring, sparse edges where the dangerous places sit. Every edge has something: a seam, a landmark, a boss lair or a secret. Roads run hub to seam, and a road always leads somewhere worth going.

**Seams.** A seam is a portal (`INTERACT` kind `portal`) on each side, with a sign. A seam is built in the release that builds the region behind it, never earlier.

## 3. Places

### The registry
One table, `PLACES`, in a new module. Each entry is data:

```js
{ id: 'st_anselms', name: "St Anselm's", region: 1, kind: 'dungeon',   // friendly | hostile | dungeon | find | landmark | secret | lair | hub
  size: 'large', template: 'bunker', theme: 'hospital', map: 'st_anselms', // map: the MAPDEFS id, or null for an open-world find
  at: { x: 92, y: 48 },            // fixed for existing places; new Region 1 places are placed from the world seed (section 9)
  band: [4, 6], danger: 3,          // enemy level band, and the pips shown on the marker (1 to 5)
  loot: 'medical', unique: 'Surgeon Kit Blueprint',
  hook: 'The ward sister still does rounds.',
  logs: ['ans_rota', 'ans_triage'],  // lore piece ids (section 8)
  rumour: 'They say the hospital lights come on at night.',
  hidden: true, unlock: null,       // hidden until a rumour or until you get close; unlock: a condition string (dialogue format)
  hub: false, art: 'hospital_gate' }
```

Saved state per place, in `state.places[id]`: `{ seen, entered, cleared, looted, logs }` plus the refill clock for its containers. New state, so old saves start with it empty and discovery fills in on load from what they have already visited (`state.visitedMaps`, quest flags).

### Mix per region (about 20, fewer when the region calls for it)
About 3 friendly, 2 or 3 hostile camps with a leader, 5 dungeons (1 or 2 large, 3 or 4 small), about 7 open-world finds, 1 or 2 landmarks, 1 secret, 1 boss lair. Fewer, stronger places beat filling the count.

### Region 1, draft list
Existing places keep their spot and behaviour. New ones are marked *new*.

| Place | Kind | Danger | Loot | Hook |
|---|---|---|---|---|
| Home Valley spring | find | 1 | food | Clean water, and a pump that is older than it should be |
| Marta's greenhouse | friendly | 1 | farm | Marta, and a case she will not talk about |
| Depot Office | find | 1 | supplies | The Brass Tag and the Dispatch Slip (story) |
| Pump House | find | 2 | supplies | The ledger (story) |
| Ash Tower and bunker | landmark | 2 | radio | The tape; the stairs to the Spine |
| Greybridge Depot | hostile (lair) | 3 | weapons | Varro (the Kind Stranger) |
| Deepcut | dungeon, large | 4 | materials | The Hollowclaw |
| The Hollow | dungeon, small | 3 | weapons | The Warden's Crossbow, Whisper blueprint |
| MegaMart | dungeon, large | 3 | supplies | Husks in uniform, the Loss Prevention Vest |
| Pylon 3 | dungeon, small | 3 | radio | The Lead-Lined Coat, Leadweave blueprint |
| The Hull (gangway) | hub | 1 | trade | The town |
| *Gilly's Roadhouse* | hub, friendly | 1 | food | On the main road. A bed, a cook, travellers' rumours. The Valley's fast travel point away from camp |
| *St Anselm's* | dungeon, large | 3 | medical | A hospital in Fallen City. A ward sister who still does rounds |
| *Depot 9* | dungeon, small | 2 | materials | A truck garage. Sam's old job sheet |
| *The Tallyman's Yard* | hostile | 3 | weapons | A raider who keeps count of everyone he has killed on a wall |
| *Saltlick Camp* | hostile | 2 | supplies | Raiders who sell water they poisoned upstream |
| *The Listening Post* | friendly (shrine) | 1 | none | A roadside Listener shrine. Early warning that the broadcast has followers |
| *Drifters under the overpass* | friendly | 1 | trade | Rumours, a fire, someone who wants a favour |
| *The Number Eleven caches* | secret | 1 | mixed | Wren's marks lead to caches past you left for the ten (canon: the bible, Wren's clue) |
| *The Greybridge span* | landmark | 1 | none | The broken bridge, visible from half the map |
| *Open finds (6 to 8)* | find | 1 to 3 | varied | A school bus with the teacher's roll; a weather station still logging; a flooded underpass; a hanging tree with a ledger nailed to it; a farmhouse with a locked root cellar; a crashed water tanker |

That is about 25 with the finds. Phase 3 trims it to the best 20.

## 4. Danger, enemy levels and loot

### Enemy level comes from the place
Today `spawnEnemy` (parts/ad_polish.js) sets every enemy to the player's level plus `LVL_OFF`. New rule:
- Each region and each place has a band, `[lo, hi]`. Danger tier 1 sits at the bottom of the band, tier 5 at the top.
- An enemy's level is the place's level plus its `LVL_OFF` roll, as now.
- **Region 1 keeps a soft floor:** never below the player's level minus 2, so the Valley never becomes a walkover.
- Raids at camp keep today's rule (player-based, scaled by camp level), since the camp is where the player lives.

**What this does to a level 10 character in Region 1:** today ordinary enemies there are level 8 to 13 and bosses 13 to 16. Under the new rule ordinary enemies sit at 8 or 9 (the floor does most of the work) and bosses at about 9 to 12, depending on the place's band. Easier, which is the point of a gradient, but never trivial.

### Above level 10 (from the model, section 1)
- Enemy damage per level: 2.5% up to level 10 (as now), 6% a level after that.
- Armour piercing: armour works at full rating against enemies up to level 10, then 4% less per level, to 60% at level 20.
- XP per kill: today it is flat per enemy type. Above level 10 it grows 10% a level (`xp x (1 + 0.1 x (level - 10))`), so levels 11 to 20 pace out. Below 10, unchanged.

### Danger pips and foreshadowing
Pips show on a place's map marker once discovered. In the world: skull pikes and bodies on the approach to tier 4 and 5, radiation glow at hot sites, warning signs (hand-painted, in the locals' voice) at tier 3 and up.

### Loot profiles
| Profile | Common | Rare |
|---|---|---|
| medical | bandages, rad tabs, chems | medkits, trauma kits, a medical blueprint |
| weapons | ammo, weapon parts | a weapon of the region's tier |
| materials | scrap, metal, wire | machined parts, steel |
| farm | food, seeds | rare seeds, livestock feed |
| radio | electronics, batteries | a map fragment, a keycard |
| lab | chems, rad gear | a blueprint |
| supplies | mixed | a named oddity |
| trade | none (people) | rumours, vendors |

**Uniques persist** (one-off items and blueprints are flagged when taken). **Ordinary containers refill** three in-game days after being emptied. **Decide:** whether old saves' Region 1 crates refill too. I recommend yes: it is new loot, nothing is taken away.

## 5. Gear beyond tier 4
Crafting tiers stop at Industry (tier 4) and settlement building stays in Region 1 (decision 7). So later regions bring **found gear**: region weapons and armour that drop or sit in lairs, a step above tier 4 (about 15% better), and uniques with blueprints that craft at the Machine Shop. Each later region has a speciality: the Foundry Belt has radiation gear, the Ridge has cold-weather gear and rifles, Meridian City has the Trust's own security kit.

**Radiation gate for the Foundry Belt:** ambient radiation there is set so a player needs about 50% radiation resistance to stay long. Today a Lead-Lined Coat plus a Gas Mask gives 76%, so this is a gear check, not a level check.

## 6. Levels 1 to 20 and perks

### The curve
Levels 1 to 10 are exactly today's (`xpNeeded(l) = 60 + 45 x (l - 1)`, 2,160 XP to reach 10). The same line continues to 20: 465 XP for 10 to 11, up to 870 for 19 to 20, 8,835 XP in total, so 11 to 20 costs about three times 1 to 10.

| Per level | 1 to 10 (now) | 11 to 20 (proposal) |
|---|---|---|
| Max health | +3 | +2 |
| Damage | +2.5% | +1.5% |
| At level 20 | | 147 health, x1.375 damage |

Gentler stat growth above 10, because perks (below) and found gear carry the rest. Skills stay capped at 10.

### Perks
Skills already have "perks" (the bonuses at skill levels 1, 2, 4, 6, 8 and 10 shown in the Progress screen and the wiki). To avoid two things with one name, I suggest calling the new picks **Traits**. **Decide** the name.

- A trait pick at every even level: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20. Ten picks.
- **Old characters get their picks for levels already reached**, banked, chosen from the Progress screen. A level 10 character starts with five.
- About 16 traits in four groups. Some have two ranks. Effects are small; no trait is needed for the story. Some open optional content (a secret door, a better rumour).

| Group | Traits |
|---|---|
| Fighting | Heavy Hands (+4% damage, 2 ranks), Thick Skin (+3% armour, ignores the cap by 3%, 2 ranks), Second Wind (once a fight, heal 25% at low health), Steady Hands (guns reload and aim faster) |
| Surviving | Iron Gut (less radiation and sickness from food and dirty water), Rad Sponge (+10% radiation resistance, 2 ranks), Pack Mule (+carry), Light Sleeper (wake before an ambush) |
| Scavenging | Scrounger (an extra roll on ordinary containers), Lockworks (open keycard doors without the card; some secrets), Haggler (better prices), Salvager (more parts from breaking gear) |
| Wayfinding | Pathfinder (fast travel costs less time and food), Long Sight (places reveal from further away), Night Eyes (see further in the dark), Old Roads (rumours mark a place outright) |

Model numbers assume two damage picks then two toughness picks above 10.

## 7. Seams and fast travel

### Seams
- Hull west gangway to Region 1 (exists). Hull harbour ferry to Region 2 (built with Region 2). Hull east gate to Region 3 (built with Region 3). Region 3 tunnel to 4, Region 3 pass to 5, Region 4 bridge to 6, Region 6 lift to 7.
- The Spine hatch to the Tidewrack stays. When Region 2 is built, the Tidewrack becomes part of it, joined to the Hull Coast by road. Every quest that reads `state.map === 'tidewrack'` is checked and kept working.

### Fast travel
- **From the map screen (M):** click a discovered hub marker, confirm the cost.
- **Hubs:** the Hull (from first entry), your camp, roadhouses, settlement-like friendly places, anything with `hub: true`.
- **Cost in game time:** walking time at normal pace along the distance, times 0.8 (you know the way), plus 90 minutes for each seam crossed. The route between regions goes through the seam graph (shortest path).
- **Food and water:** drained as if that much time had passed (the normal drain, run in one step). Traits can cut it (Pathfinder).
- **Blocked:** an enemy within about 220 px (the same rule as sleeping), a raid running or due, a storm, inside any dungeon or interior, while carrying more than you can.
- **What it is not:** it does not skip discovery. You must have stood at the hub.

## 8. Lore: threads, rules and samples

Rules from the brief: 3 to 6 lines, ordinary voices, no exposition. Each piece has an id, a thread, a place, a form (terminal, note, diary, gravestone, tape) and optional effects (Memory, a map marker, a keycard code, a hidden entrance, a rumour, a survivor clue). Roughly one in four does something. Everything read goes to **Found logs** in the Codex, grouped by thread with a count each ("The broadcast 3 of 9").

### Threads (proposed)
| Thread | What it tells sideways | Where it lives |
|---|---|---|
| The Meridian Trust | What the Trust built and how it talked about it | Site offices, signage, Meridian City |
| The Long Table | The dinner, the vote, who sat where (never the names; canon keeps them for Chapter Four) | Caterers, staff, the Hull's archive later |
| The Eleven | Small traces of the Wake Group before they slept | The Valley, the Spine, Region 2 |
| The broadcast | What people heard, what they did about it | Everywhere, more near the coast |
| Capacity | Numbers that do not add up: blankets, rations, pods | Supply depots, the Foundry Belt, the Deep |
| While they slept | What ordinary people did in the war and after | Everywhere: the main thread, and the biggest |
| Local stories | One place's own small story | Each place |

Canon checks: nothing names the Architects or the vote's names before Chapter Four. Nothing says what is in Marta's case before Chapter Three. Odile is never mentioned by name before Chapter Two.

### Samples (for judging the voice)
**The Meridian Trust.** A laminated card, a site office in the Valley.
> MERIDIAN TRUST: SITE 2
> Visitors must be accompanied at all times.
> Do not discuss capacity with contractors.
> If asked what we are building, it is a farm.
> It is a farm.

**The broadcast.** A note taped to a radio.
> Same names every night at 2:14. Gav says it's a recording.
> Gav also said the water was fine.
> I've started saying the names along with it.
> Don't tell Gav.

**While they slept.** A gravestone, hand-cut.
> KERRY ANNE DOYLE
> fed the street for nine weeks
> on two bags of rice
> and a lie about how many were left

**Capacity.** A delivery docket, a depot in the Dustbowl.
> DELIVERY: thermal blankets, 2,372 standard, 640 premium.
> RECEIVED: all.
> Driver asked what makes a blanket premium.
> Was told: the person under it.

**The Long Table.** A caterer's invoice, the Hull.
> Long Table dinner. Eleven covers.
> Wine: yes. Dessert: no, at the host's request.
> Unit 11 did not eat. Unit 11 did the seating plan.
> Breakages: one glass, thrown.

The docket's numbers add up to the Cradle's 3,012, and 640 is the Architects and Beneficiaries together. A player who has opened the case can work that out. One who has not just finds it strange.

## 9. Save compatibility
- New Region 1 places are placed from the world seed onto free tiles outside the camp radius, recorded in `state.mapFlags.places`, and added on load for old saves. They never touch a tile the player built on; if the seeded spot is taken, the search moves outward. Same pattern as `moveEdgePortals` in parts/ar_places.js.
- New state (`state.places`, traits, found logs, fast travel) has defaults; old saves load with them empty and back-filled where the save already shows progress.
- Later regions are new maps, so they cannot clash with anything old.
- The enemy-level change touches no saved data.
- The memory fix (section 1) changes what is kept in memory, not what is saved.

## 10. The ten: a chain, part of the main story

### What is built today (checked in the code, 2026-11-01)
All ten spawn in open ruins in Region 1: Marta (the Wastes), Dex (the Scrapyard), Wren, Tomas and Juno (Whisper Pines), Ripley (the Ashlands), Sam (the Quarry), Lena and Boone (Fallen City), Priya (the Toxic Marsh). Each has a favour (`SURV_QUESTS`), mostly a camp task: grow tomatoes, build guard posts, bring scrap. The favour starts when you talk to them and pays their Tag Card, but it is not needed to recruit them. The old STORY.md list (Dex at Deepcut, Wren in the Hollow and so on) was the bible's plan, not the build.

### Proposal
- **A survivor joins only once their mission is done.** The six who stay in Region 1 keep their current favours as missions (they work without recruiting and are already written). The four who move get new missions tied to their place.
- **A quest line, "The Ten", in the main-story section of the journal.** Finishing one survivor's mission gives the clue to the next: something they saw, a note, a map. The clue puts a marker on the map.
- **The chain guides; it does not lock.** You can still stumble on anyone. Meeting someone early just skips their clue. **Decide:** strict order or a guide (I recommend a guide).
- **Constraint:** Chapter Two needs six tags at the Tidewrack. Six are in Region 1 and Juno is at the Tidewrack, so seven are reachable before the Quorum.
- **The Long Table ending needs all eleven tags** (the bible). The four in later regions make the best ending something you travel for.

| # | Survivor | Where (new) | Region | Mission | Clue to the next |
|---|---|---|---|---|---|
| 1 | Marta | Her greenhouse (as now) | 1 | The Last Packet (as now) | She saw an old man in the pines talking to an empty hive |
| 2 | Tomas | Whisper Pines (as now) | 1 | The Bees Survived (as now) | A beekeeper's map with a quarry marked "loud at night" |
| 3 | Dex | The Scrapyard, near Deepcut (as now) | 1 | Dex's Grudge (as now) | He took a raider's ledger; it lists a man in a shop uniform who would not fight |
| 4 | Boone | Fallen City, near the MegaMart (as now) | 1 | Dead Man's Ledger (as now) | He heard a woman on a radio in the marsh, answering the broadcast |
| 5 | Priya | The Toxic Marsh (as now) | 1 | Dead Air (as now) | She hears a soldier's call sign from the Ashlands every night |
| 6 | Ripley | The Ashlands (as now) | 1 | Hold the Line (as now) | "The courier went to the coast. Follow the hatch." Points at the Spine |
| 7 | Juno | The Tidewrack, with the Listeners | 2 | Something Warm, moved to Chapel Row's kitchen | A Hull trucker who owes her money went east |
| 8 | Sam | A rail depot in the Dustbowl | 3 | New: get a dead locomotive's parts back from raiders who strip it | A field hospital up on the Ridge sent for parts |
| 9 | Lena | A field hospital on the Ridge | 5 | New: hold the hospital through a night of the cold-sick | A scout keeps leaving elevens on the hospital door |
| 10 | Wren | The observatory on the Ridge | 5 | New: walk her circuit of marks with her; the last mark is a cache past you left | The end of the chain, and the last tag |

Wren's marks are canon (the bible: elevens on every ruin door, leading to caches you left for the ten), which makes her the right last link. The Number Eleven caches in Region 1 (section 3) seed her thread early.

**While a survivor's region is not built**, they stay where they are today and the clue points there. **Old saves:** anyone already recruited, any favour already done and any tag already held stands. Someone met but not recruited needs their mission done. Someone not yet met moves when their region ships.

## 11. Phases
- **Phase 1a, places:** registry, migration of the existing places, discovery, markers and pips, the counter, Found logs, Codex pictures, the memory fix.
- **Phase 1b, levels:** curve to 20, traits, place-set enemy levels with the Region 1 floor, armour piercing and damage above 10, XP above 10, the balance model's numbers.
- **Phase 2, dungeon templates:** caves, bunker grid, tower, compound, tunnel, arena.
- **Phase 3, Region 1 enlarged:** about 20 places, roads, landmarks, lore, the Roadhouse, fast travel, "The Ten" for the six in Region 1.
- **Phase 4 onward:** one region per release with its seam, its part of the chain, its gear speciality.

## 12. Questions for Broden (block Phase 1)
1. **Armour above level 10.** Armour piercing and the faster damage growth apply only to enemies above level 10. OK?
2. **The live tier 3 problem.** Settlement-tier armour already makes Region 1 easy. Leave it (Region 1 is meant to get easy) or trim it (for example, cap armour at 70% instead of 80%)? I lean to leaving it and letting later regions do the work.
3. **Region 1's soft floor** (enemies never below your level minus 2). OK?
4. **Trait** as the name, and banked picks for existing characters. OK?
5. **The survivor chain:** a guide (recommended) or strict order? And moving Juno to the Tidewrack, Sam to the Dustbowl, Lena and Wren to the Ridge, each only when their region ships.
6. **Crate refill** in old saves' Region 1 crates. Yes (recommended) or no?
7. **The lore voice.** Do the five samples sound right?
