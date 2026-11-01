/* =====================================================================
   BATCH 2 DATA: gear, farming, combat, raids
   ===================================================================== */
Object.assign(CONFIG, {
  hotbar: 9,
  combat: { iframes: 0.5, xpBase: 25, xpPerLevel: 25, maxLevel: 10, hpPerLevel: 5, dmgPerLevel: 0.05, dmgResCap: 0.8, radResCap: 0.9 },
  farm: { canCapacity: 20, tillCd: 0.35, plantCd: 0.25, waterCd: 0.25 },
  sleep: { mult: 40, fromHour: 20, toHour: 5 },
  raids: { firstDay: 2, everyDays: 2, startHour: 19, endHour: 23 }
});
CONFIG.inventory.slots = 27;

const WEAPONS = {
  'Rusty Pipe':    { kind: 'melee', dmg: 14, cd: 0.45, reach: 20, kb: 140, col: '#8a7a6a' },
  'Scrap Machete': { kind: 'melee', dmg: 22, cd: 0.40, reach: 23, kb: 150, col: '#a9acb3' },
  'Iron Cleaver':  { kind: 'melee', dmg: 36, cd: 0.50, reach: 25, kb: 200, col: '#d4dae2' },
  'Scrap Pistol':  { kind: 'gun', dmg: 24, cd: 0.50, speed: 230, range: 170, ammo: 'Pistol rounds', col: '#6a6a74' }
};

const ARMOUR = {
  'Scrap Helmet':  { slot: 'head', dmg: 0.06, rad: 0,    col: '#8a8d94' },
  'Scrap Vest':    { slot: 'body', dmg: 0.12, rad: 0,    col: '#7a7d84' },
  'Scrap Greaves': { slot: 'legs', dmg: 0.08, rad: 0,    col: '#6e7178' },
  'Scrap Boots':   { slot: 'feet', dmg: 0.04, rad: 0,    col: '#5e6168' },
  'Iron Helm':     { slot: 'head', dmg: 0.10, rad: 0,    col: '#cfd5dd' },
  'Iron Plate':    { slot: 'body', dmg: 0.20, rad: 0,    col: '#bcc3cc' },
  'Iron Greaves':  { slot: 'legs', dmg: 0.14, rad: 0,    col: '#aab1ba' },
  'Iron Boots':    { slot: 'feet', dmg: 0.08, rad: 0,    col: '#99a0a9' },
  'Hazmat Hood':   { slot: 'head', dmg: 0.02, rad: 0.18, col: '#d6c84a' },
  'Hazmat Suit':   { slot: 'body', dmg: 0.03, rad: 0.30, col: '#e0d24c' },
  'Hazmat Pants':  { slot: 'legs', dmg: 0.02, rad: 0.18, col: '#cdbf44' },
  'Rubber Boots':  { slot: 'feet', dmg: 0.02, rad: 0.12, col: '#3a6ea8' },
  'Lead Pendant':  { slot: 'acc',  dmg: 0,    rad: 0.08, col: '#8f98a6' },
  'Spiked Bracer': { slot: 'acc',  dmg: 0.05, rad: 0,    col: '#a8532a' }
};
const SLOT_NAMES = { head: 'Head', body: 'Body', legs: 'Legs', feet: 'Feet', acc: 'Accessory' };
const SLOT_ORDER = ['head', 'body', 'legs', 'feet', 'acc'];

const CROPS = {
  'Radish Seeds': { id: 'radish', produce: 'Radish', days: 3, regrow: 0, col: '#d4506a' },
  'Potato Seeds': { id: 'potato', produce: 'Potato', days: 5, regrow: 0, col: '#c9a45a' },
  'Tomato Seeds': { id: 'tomato', produce: 'Tomato', days: 6, regrow: 2, col: '#d94a3a' }
};

Object.assign(TOOL_ITEMS, { 'Hoe': { type: 'hoe', tier: 1 }, 'Watering Can': { type: 'can', tier: 1 } });
Object.assign(ITEM_COL, {
  'Cloth': '#b8a888', 'Bandage': '#e8e0d0', 'Pistol rounds': '#d6a84a', 'Hoe': '#8a8d94', 'Watering Can': '#7a8aa0',
  'Radish': '#d4506a', 'Potato': '#c9a45a', 'Tomato': '#d94a3a',
  'Radish Seeds': '#d4506a', 'Potato Seeds': '#c9a45a', 'Tomato Seeds': '#d94a3a'
});
for (const k of Object.keys(WEAPONS)) ITEM_COL[k] = WEAPONS[k].col;
for (const k of Object.keys(ARMOUR)) ITEM_COL[k] = ARMOUR[k].col;
Object.assign(ITEM_USE, {
  'Radish': { food: 14 }, 'Potato': { food: 24 }, 'Tomato': { food: 16, water: 8 }, 'Bandage': { heal: 25 }
});
for (const k of [...Object.keys(TOOL_ITEMS), ...Object.keys(WEAPONS), ...Object.keys(ARMOUR)]) ITEM_STACK[k] = 1;
Object.assign(BLUEPRINTS, { hazmat: 'Hazmat Patterns', firearms: 'Firearms Primer' });

const ITEM_DESC = {
  'Wood': 'Raw material.', 'Scrap': 'Raw material.', 'Stone': 'Raw material.', 'Iron ore': 'Raw ore. Needs smelting tech later.',
  'Metal plate': 'Smelted from scrap at a forge.', 'Cloth': 'Rags and fabric. Used for bandages and hazmat gear.',
  'Berries': 'Eat for a little food.', 'Canned food': 'Eat for good food.', 'Rad tabs': 'Eat to cut radiation.', 'Rad-Away': 'Strong radiation cleanser.',
  'Bandage': 'Use to heal.', 'Pistol rounds': 'Ammo for pistols. Scarce.',
  'Hoe': 'Till dirt so seeds can be planted.', 'Watering Can': 'Water tilled soil. Refill at a clean spring or purifier.',
  'Radish': 'Quick crop. Eat for food.', 'Potato': 'Filling crop. Eat for food.', 'Tomato': 'Keeps producing. Eat for food and water.'
};

const ENEMY_TYPES = {
  glowrat:  { name: 'Glowrat',   hp: 22, dmg: 6,  speed: 58, size: 8,  aggro: 90,  atkCd: 0.9, xp: 4 },
  hound:    { name: 'Ash Hound', hp: 38, dmg: 9,  speed: 66, size: 10, aggro: 130, atkCd: 1.0, xp: 8 },
  husk:     { name: 'Husk',      hp: 90, dmg: 18, speed: 32, size: 12, aggro: 110, atkCd: 1.3, xp: 22 },
  scrapper: { name: 'Scrapper',  hp: 55, dmg: 12, speed: 46, size: 10, aggro: 140, atkCd: 1.0, xp: 15 },
  gunner:   { name: 'Gunner',    hp: 42, dmg: 9,  speed: 40, size: 10, aggro: 170, atkCd: 1.7, xp: 18, ranged: true, keep: 80 }
};
const DROPS = {
  glowrat:  [{ n: 'Scrap', c: 0.4, a: 1, b: 2 }],
  hound:    [{ n: 'Scrap', c: 0.3, a: 1, b: 2 }, { n: 'Canned food', c: 0.1, a: 1, b: 1 }],
  husk:     [{ n: 'Cloth', c: 0.6, a: 1, b: 3 }, { n: 'Rad tabs', c: 0.15, a: 1, b: 1 }, { n: 'Iron ore', c: 0.3, a: 1, b: 2 }],
  scrapper: [{ n: 'Scrap', c: 0.8, a: 2, b: 4 }, { n: 'Cloth', c: 0.4, a: 1, b: 2 }, { n: 'Pistol rounds', c: 0.15, a: 1, b: 3 }],
  gunner:   [{ n: 'Scrap', c: 0.6, a: 1, b: 3 }, { n: 'Pistol rounds', c: 0.45, a: 2, b: 4 }, { n: 'Canned food', c: 0.2, a: 1, b: 1 }]
};
const STRUCT_HP = { workbench: 120, forge: 160, purifier: 100, barricade: 90 };
STATION_NAMES.purifier = 'Water Purifier';
STATION_NAMES.barricade = 'Barricade';

const tilled = new Uint8Array(W * H);
const wet = new Uint8Array(W * H);
const crops = new Map();
const enemies = [];
let nextEnemyId = 1;

function stackMax(name) { return ITEM_STACK[name] || CONFIG.inventory.stackSize; }
function iconKind(name) {
  const ti = TOOL_ITEMS[name]; if (ti) return ti.type;
  const w = WEAPONS[name]; if (w) return w.kind === 'gun' ? 'pistol' : 'melee';
  const a = ARMOUR[name]; if (a) return a.slot;
  if (CROPS[name]) return 'seed';
  if (name === 'Pistol rounds') return 'ammo';
  if (name === 'Radish' || name === 'Potato' || name === 'Tomato' || name === 'Berries') return 'produce';
  if (name === 'Canned food') return 'tin';
  if (name === 'Rad tabs' || name === 'Rad-Away' || name === 'Bandage') return 'med';
  return 'material';
}

/* Recipes: cat decides the crafting tab. A recipe with unlock stays locked until that blueprint is found. */
const CRAFT_TABS = ['Build', 'Tools', 'Weapons', 'Armour', 'Supplies'];
const RECIPES = [
  { id: 'workbench', cat: 'Build', name: 'Workbench', station: null, place: 'workbench', cost: { 'Wood': 10, 'Scrap': 6 }, unlock: null },
  { id: 'barricade', cat: 'Build', name: 'Barricade', station: null, place: 'barricade', cost: { 'Wood': 4, 'Scrap': 2 }, unlock: null },
  { id: 'forge', cat: 'Build', name: 'Forge', station: 'workbench', place: 'forge', cost: { 'Stone': 12, 'Scrap': 8, 'Wood': 4 }, unlock: 'forge' },
  { id: 'purifier', cat: 'Build', name: 'Water Purifier', station: 'forge', place: 'purifier', cost: { 'Metal plate': 3, 'Scrap': 8, 'Stone': 4 }, unlock: 'ironwork' },

  { id: 'scrap_axe', cat: 'Tools', name: 'Scrap Axe', station: 'workbench', gives: { 'Scrap Axe': 1 }, cost: { 'Wood': 4, 'Scrap': 6 }, unlock: null },
  { id: 'scrap_pick', cat: 'Tools', name: 'Scrap Pickaxe', station: 'workbench', gives: { 'Scrap Pickaxe': 1 }, cost: { 'Wood': 4, 'Scrap': 6 }, unlock: null },
  { id: 'hoe', cat: 'Tools', name: 'Hoe', station: 'workbench', gives: { 'Hoe': 1 }, cost: { 'Wood': 3, 'Scrap': 5 }, unlock: null },
  { id: 'can', cat: 'Tools', name: 'Watering Can', station: 'workbench', gives: { 'Watering Can': 1 }, cost: { 'Scrap': 8, 'Wood': 2 }, unlock: null },
  { id: 'iron_axe', cat: 'Tools', name: 'Iron Axe', station: 'forge', gives: { 'Iron Axe': 1 }, cost: { 'Wood': 4, 'Metal plate': 4 }, unlock: 'ironwork' },
  { id: 'iron_pick', cat: 'Tools', name: 'Iron Pickaxe', station: 'forge', gives: { 'Iron Pickaxe': 1 }, cost: { 'Wood': 4, 'Metal plate': 4 }, unlock: 'ironwork' },

  { id: 'machete', cat: 'Weapons', name: 'Scrap Machete', station: 'workbench', gives: { 'Scrap Machete': 1 }, cost: { 'Wood': 3, 'Scrap': 8 }, unlock: null },
  { id: 'cleaver', cat: 'Weapons', name: 'Iron Cleaver', station: 'forge', gives: { 'Iron Cleaver': 1 }, cost: { 'Metal plate': 5, 'Wood': 3 }, unlock: 'ironwork' },
  { id: 'pistol', cat: 'Weapons', name: 'Scrap Pistol', station: 'forge', gives: { 'Scrap Pistol': 1 }, cost: { 'Metal plate': 4, 'Scrap': 6, 'Wood': 2 }, unlock: 'firearms' },
  { id: 'rounds', cat: 'Weapons', name: 'Pistol Rounds x4', station: 'forge', gives: { 'Pistol rounds': 4 }, cost: { 'Metal plate': 1, 'Scrap': 2 }, unlock: 'firearms' },

  { id: 'scrap_helm', cat: 'Armour', name: 'Scrap Helmet', station: 'workbench', gives: { 'Scrap Helmet': 1 }, cost: { 'Scrap': 8, 'Wood': 1 }, unlock: null },
  { id: 'scrap_vest', cat: 'Armour', name: 'Scrap Vest', station: 'workbench', gives: { 'Scrap Vest': 1 }, cost: { 'Scrap': 14, 'Wood': 2 }, unlock: null },
  { id: 'scrap_greaves', cat: 'Armour', name: 'Scrap Greaves', station: 'workbench', gives: { 'Scrap Greaves': 1 }, cost: { 'Scrap': 10 }, unlock: null },
  { id: 'scrap_boots', cat: 'Armour', name: 'Scrap Boots', station: 'workbench', gives: { 'Scrap Boots': 1 }, cost: { 'Scrap': 6, 'Wood': 1 }, unlock: null },
  { id: 'iron_helm', cat: 'Armour', name: 'Iron Helm', station: 'forge', gives: { 'Iron Helm': 1 }, cost: { 'Metal plate': 4 }, unlock: 'ironwork' },
  { id: 'iron_plate', cat: 'Armour', name: 'Iron Plate', station: 'forge', gives: { 'Iron Plate': 1 }, cost: { 'Metal plate': 8, 'Scrap': 4 }, unlock: 'ironwork' },
  { id: 'iron_greaves', cat: 'Armour', name: 'Iron Greaves', station: 'forge', gives: { 'Iron Greaves': 1 }, cost: { 'Metal plate': 6 }, unlock: 'ironwork' },
  { id: 'iron_boots', cat: 'Armour', name: 'Iron Boots', station: 'forge', gives: { 'Iron Boots': 1 }, cost: { 'Metal plate': 4 }, unlock: 'ironwork' },
  { id: 'haz_hood', cat: 'Armour', name: 'Hazmat Hood', station: 'workbench', gives: { 'Hazmat Hood': 1 }, cost: { 'Cloth': 4, 'Scrap': 2 }, unlock: 'hazmat' },
  { id: 'haz_suit', cat: 'Armour', name: 'Hazmat Suit', station: 'workbench', gives: { 'Hazmat Suit': 1 }, cost: { 'Cloth': 8, 'Scrap': 3 }, unlock: 'hazmat' },
  { id: 'haz_pants', cat: 'Armour', name: 'Hazmat Pants', station: 'workbench', gives: { 'Hazmat Pants': 1 }, cost: { 'Cloth': 5, 'Scrap': 2 }, unlock: 'hazmat' },
  { id: 'rubber_boots', cat: 'Armour', name: 'Rubber Boots', station: 'workbench', gives: { 'Rubber Boots': 1 }, cost: { 'Cloth': 3, 'Scrap': 4 }, unlock: 'hazmat' },
  { id: 'lead_pendant', cat: 'Armour', name: 'Lead Pendant', station: 'forge', gives: { 'Lead Pendant': 1 }, cost: { 'Metal plate': 2, 'Scrap': 3 }, unlock: 'ironwork' },
  { id: 'bracer', cat: 'Armour', name: 'Spiked Bracer', station: 'workbench', gives: { 'Spiked Bracer': 1 }, cost: { 'Scrap': 6, 'Wood': 1 }, unlock: null },

  { id: 'bandage', cat: 'Supplies', name: 'Bandage', station: null, gives: { 'Bandage': 1 }, cost: { 'Cloth': 2 }, unlock: null },
  { id: 'radtabs', cat: 'Supplies', name: 'Rad Tabs', station: 'workbench', gives: { 'Rad tabs': 1 }, cost: { 'Berries': 6, 'Scrap': 2 }, unlock: 'medicine' },
  { id: 'plate', cat: 'Supplies', name: 'Metal Plate', station: 'forge', gives: { 'Metal plate': 1 }, cost: { 'Scrap': 5 }, unlock: 'ironwork' }
];

/* One supply crate per ruin (NW, SW, SE, N, E) and one per hot spot. */
const CRATE_LOOT = [
  { bp: 'ironwork', items: [{ name: 'Scrap', qty: 8 }, { name: 'Wood', qty: 4 }, { name: 'Radish Seeds', qty: 4 }, { name: 'Cloth', qty: 2 }] },
  { items: [{ name: 'Scrap', qty: 10 }, { name: 'Stone', qty: 4 }, { name: 'Canned food', qty: 2 }, { name: 'Potato Seeds', qty: 3 }, { name: 'Cloth', qty: 2 }] },
  { bp: 'medicine', items: [{ name: 'Wood', qty: 10 }, { name: 'Scrap', qty: 8 }, { name: 'Stone', qty: 6 }, { name: 'Canned food', qty: 2 }, { name: 'Cloth', qty: 3 }] },
  { items: [{ name: 'Scrap', qty: 12 }, { name: 'Wood', qty: 6 }, { name: 'Canned food', qty: 1 }, { name: 'Tomato Seeds', qty: 2 }, { name: 'Pistol rounds', qty: 3 }] },
  { bp: 'forge', items: [{ name: 'Wood', qty: 6 }, { name: 'Scrap', qty: 6 }, { name: 'Canned food', qty: 1 }, { name: 'Radish Seeds', qty: 2 }] }
];
const HOT_LOOT = [
  { bp: 'hazmat', items: [{ name: 'Metal plate', qty: 4 }, { name: 'Rad-Away', qty: 1 }, { name: 'Cloth', qty: 4 }] },
  { items: [{ name: 'Iron ore', qty: 3 }, { name: 'Canned food', qty: 2 }, { name: 'Pistol rounds', qty: 4 }] },
  { bp: 'firearms', items: [{ name: 'Metal plate', qty: 3 }, { name: 'Rad-Away', qty: 1 }, { name: 'Canned food', qty: 1 }, { name: 'Pistol rounds', qty: 4 }] },
  { items: [{ name: 'Iron ore', qty: 4 }, { name: 'Rad-Away', qty: 2 }, { name: 'Tomato Seeds', qty: 3 }, { name: 'Cloth', qty: 3 }] }
];

