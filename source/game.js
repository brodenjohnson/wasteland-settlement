
(() => {
'use strict';

/* =====================================================================
   CONFIG - every tunable number lives here so balancing is a one-line fix.
   Survival rates are defined now but switched on in chunk 4.
   ===================================================================== */
const CONFIG = {
  tile: 16,
  zoom: 3,
  mapW: 60,
  mapH: 60,
  seed: 1337,
  player: { speed: 78, size: 10, reach: 28, craftRange: 56 },
  inventory: { slots: 20, stackSize: 50 },
  tools: {
    names: ['Bare hands', 'Scrap', 'Iron', 'Steel'],
    power: [20, 34, 50, 100],
    cooldown: [0.55, 0.45, 0.38, 0.3],
    colors: ['#e0b48a', '#8a8d94', '#d4dae2', '#f2c14e']
  },
  time: { dayLengthSec: 300, startHour: 7, fastMultiplier: 12 },
  survival: {
    active: true,
    foodDrainPerGameHour: 2.5,
    waterDrainPerGameHour: 4,
    starvationDamagePerSec: 1.2,
    thirstDamagePerSec: 1.8,
    radDamagePerSec: 1.5,
    regenPerSec: 0.6,
    regenMinFoodWater: 30,
    drinkRestore: 25,
    drinkRadDirty: 15,
    ambientRad: 0.15,
    ruinRad: 0.45,
    shoreRad: 0.5,
    greenRad: -0.35,
    baseRad: -1.0,
    baseZoneRadius: 10,
    radProtection: 0
  }
};

const TS = CONFIG.tile, W = CONFIG.mapW, H = CONFIG.mapH;
const BASE = { x: 30, y: 30 };

/* =====================================================================
   WORLD - tiles, objects, generation
   ===================================================================== */
const T = { GROUND: 0, DIRT: 1, WATER: 2, RUBBLE: 3, ROAD: 4, GRASS: 5, SPRING: 6 };
const O = { NONE: 0, TREE: 1, SCRAP: 2, ROCK: 3, ORE: 4, CRATE: 5, BUSH: 6 };
const TILE_NAMES = ['Wasteland', 'Workable dirt', 'Irradiated water', 'Rubble', 'Cracked road', 'Regrowth', 'Clean spring'];
const OBJ_NAMES = ['', 'Dead tree', 'Scrap pile', 'Boulder', 'Iron deposit', 'Supply crate', 'Berry bush'];

/* What each resource gives, which tool works it, and the minimum tool tier. */
const RES = {
  [O.TREE]:  { name: 'Dead tree',    item: 'Wood',     tool: 'axe',     minTier: 0, hp: 100, yield: [3, 5], color: '#6b4a2b' },
  [O.SCRAP]: { name: 'Scrap pile',   item: 'Scrap',    tool: 'pickaxe', minTier: 0, hp: 80,  yield: [3, 5], color: '#a9acb3' },
  [O.ROCK]:  { name: 'Boulder',      item: 'Stone',    tool: 'pickaxe', minTier: 1, hp: 120, yield: [3, 4], color: '#8d8a83' },
  [O.ORE]:   { name: 'Iron deposit', item: 'Iron ore', tool: 'pickaxe', minTier: 2, hp: 160, yield: [2, 3], color: '#e29a55' },
  [O.CRATE]: { name: 'Supply crate', item: 'loot', tool: 'pickaxe', minTier: 0, hp: 1, yield: [0, 0], color: '#d6a84a', crate: true },
  [O.BUSH]:  { name: 'Berry bush', item: 'Berries', tool: 'axe', minTier: 0, hp: 40, yield: [3, 4], color: '#c0392b' }
};
const ITEM_COL = { 'Wood': '#8a5a2b', 'Scrap': '#8a8d94', 'Stone': '#7a7770', 'Iron ore': '#a8532a', 'Metal plate': '#b9c2cc', 'Scrap Axe': '#8a8d94', 'Scrap Pickaxe': '#8a8d94', 'Iron Axe': '#d4dae2', 'Iron Pickaxe': '#d4dae2', 'Berries': '#c0392b', 'Canned food': '#b5b5a8', 'Rad tabs': '#7fbf3f', 'Rad-Away': '#5fd0d6' };

/* Click a consumable in the bag to use it */
const ITEM_USE = { 'Berries': { food: 8, water: 2 }, 'Canned food': { food: 30 }, 'Rad tabs': { rad: -35 }, 'Rad-Away': { rad: -60 } };

/* Regrowth zones: radiation recovers here. Some have a clean spring. */
const GREEN_ZONES = [
  { x: 14, y: 28, r: 5.5, spring: true },
  { x: 48, y: 35, r: 4.5, spring: false },
  { x: 30, y: 53, r: 5, spring: true }
];

/* Hot spots: heavy radiation, with a crate at the centre as the reward for the risk */
const HOT_SPOTS = [
  { x: 20, y: 18, r: 3.2 }, { x: 38, y: 47, r: 3.2 }, { x: 55, y: 27, r: 3.2 }, { x: 6, y: 22, r: 3 }
];
const HOT_LOOT = [
  { items: [{ name: 'Metal plate', qty: 4 }, { name: 'Rad-Away', qty: 1 }] },
  { items: [{ name: 'Iron ore', qty: 3 }, { name: 'Canned food', qty: 2 }] },
  { items: [{ name: 'Metal plate', qty: 3 }, { name: 'Rad-Away', qty: 1 }, { name: 'Canned food', qty: 1 }] },
  { items: [{ name: 'Iron ore', qty: 4 }, { name: 'Rad-Away', qty: 2 }] }
];
const ITEM_STACK = { 'Scrap Axe': 1, 'Scrap Pickaxe': 1, 'Iron Axe': 1, 'Iron Pickaxe': 1 };

/* Tools are bag items. Your working tier is the best one you are carrying, so they drop when you die. */
const TOOL_ITEMS = {
  'Scrap Axe': { type: 'axe', tier: 1 }, 'Scrap Pickaxe': { type: 'pickaxe', tier: 1 },
  'Iron Axe': { type: 'axe', tier: 2 }, 'Iron Pickaxe': { type: 'pickaxe', tier: 2 }
};

/* Tech tree v1. A recipe with an unlock stays locked until you find that blueprint in a ruin. */
const STATION_NAMES = { workbench: 'Workbench', forge: 'Forge' };
const BLUEPRINTS = { forge: 'Forge Plans', ironwork: 'Ironwork Manual', medicine: 'Field Medicine Notes' };
const RECIPES = [
  { id: 'workbench', name: 'Workbench', station: null, place: 'workbench', cost: { 'Wood': 10, 'Scrap': 6 }, unlock: null },
  { id: 'scrap_axe', name: 'Scrap Axe', station: 'workbench', gives: { 'Scrap Axe': 1 }, cost: { 'Wood': 4, 'Scrap': 6 }, unlock: null },
  { id: 'scrap_pick', name: 'Scrap Pickaxe', station: 'workbench', gives: { 'Scrap Pickaxe': 1 }, cost: { 'Wood': 4, 'Scrap': 6 }, unlock: null },
  { id: 'forge', name: 'Forge', station: 'workbench', place: 'forge', cost: { 'Stone': 12, 'Scrap': 8, 'Wood': 4 }, unlock: 'forge' },
  { id: 'plate', name: 'Metal Plate', station: 'forge', gives: { 'Metal plate': 1 }, cost: { 'Scrap': 5 }, unlock: 'ironwork' },
  { id: 'iron_axe', name: 'Iron Axe', station: 'forge', gives: { 'Iron Axe': 1 }, cost: { 'Wood': 4, 'Metal plate': 4 }, unlock: 'ironwork' },
  { id: 'iron_pick', name: 'Iron Pickaxe', station: 'forge', gives: { 'Iron Pickaxe': 1 }, cost: { 'Wood': 4, 'Metal plate': 4 }, unlock: 'ironwork' },
  { id: 'radtabs', name: 'Rad Tabs', station: 'workbench', gives: { 'Rad tabs': 1 }, cost: { 'Berries': 6, 'Scrap': 2 }, unlock: 'medicine' }
];

/* One supply crate per ruin, in the order the ruins are generated: NW, SW, SE, N, E */
const CRATE_LOOT = [
  { bp: 'ironwork', items: [{ name: 'Scrap', qty: 8 }, { name: 'Wood', qty: 4 }] },
  { items: [{ name: 'Scrap', qty: 10 }, { name: 'Stone', qty: 4 }, { name: 'Canned food', qty: 2 }] },
  { bp: 'medicine', items: [{ name: 'Wood', qty: 10 }, { name: 'Scrap', qty: 8 }, { name: 'Stone', qty: 6 }, { name: 'Canned food', qty: 2 }] },
  { items: [{ name: 'Scrap', qty: 12 }, { name: 'Wood', qty: 6 }, { name: 'Canned food', qty: 1 }] },
  { bp: 'forge', items: [{ name: 'Wood', qty: 6 }, { name: 'Scrap', qty: 6 }, { name: 'Canned food', qty: 1 }] }
];

const tiles = new Uint8Array(W * H);
const shade = new Uint8Array(W * H);
const objs = new Uint8Array(W * H);
const reserved = new Uint8Array(W * H);
const structs = new Map();
const crateLoot = new Map();
const radMap = new Float32Array(W * H);
const ruins = [];

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function generate() {
  const rng = mulberry32(CONFIG.seed);
  const noise = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) noise[i] = rng();
  for (let i = 0; i < W * H; i++) shade[i] = Math.floor(rng() * 4);

  // Cracked road running east to west
  for (let x = 0; x < W; x++) {
    for (const y of [40, 41]) {
      if (rng() > 0.12) tiles[y * W + x] = T.ROAD;
    }
  }

  // Irradiated pond
  const px = 46, py = 13;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const d = Math.hypot(x - px, (y - py) * 1.2);
    if (d < 4.2 + noise[y * W + x] * 1.6) tiles[y * W + x] = T.WATER;
  }

  // Workable dirt patch where the first base goes
  for (let y = BASE.y - 6; y <= BASE.y + 6; y++) for (let x = BASE.x - 7; x <= BASE.x + 7; x++) {
    const dx = (x - BASE.x) / 6.5, dy = (y - BASE.y) / 5.5;
    const i = y * W + x;
    if (dx * dx + dy * dy < 1 + (noise[i] - 0.5) * 0.5) tiles[i] = T.DIRT;
  }

  // Ruined buildings
  function ruin(x0, y0, w, h) {
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
      const edge = (x === x0 || x === x0 + w - 1 || y === y0 || y === y0 + h - 1);
      if (!edge) continue;
      const i = y * W + x;
      reserved[i] = 1;
      if (rng() < 0.18) continue; // crumbled gap
      tiles[i] = T.RUBBLE;
    }
    // guaranteed doorways (two tiles wide) so you can always get in
    const dx = x0 + 2 + Math.floor(rng() * (w - 5));
    for (let k = 0; k < 2; k++) tiles[(y0 + h - 1) * W + dx + k] = T.GROUND;
    const dy = y0 + 2 + Math.floor(rng() * (h - 5));
    for (let k = 0; k < 2; k++) tiles[(dy + k) * W + x0] = T.GROUND;
    ruins.push({ x0, y0, w, h });
  }
  ruin(8, 8, 9, 7);
  ruin(10, 46, 11, 8);
  ruin(44, 44, 10, 9);
  ruin(24, 6, 8, 6);
  ruin(42, 24, 8, 7);

  // Regrowth zones: green patches with clean springs and berry bushes
  for (const z of GREEN_ZONES) {
    for (let y = Math.max(1, Math.floor(z.y - z.r - 2)); y <= Math.min(H - 2, Math.ceil(z.y + z.r + 2)); y++) {
      for (let x = Math.max(1, Math.floor(z.x - z.r - 2)); x <= Math.min(W - 2, Math.ceil(z.x + z.r + 2)); x++) {
        const i = y * W + x;
        if (tiles[i] !== T.GROUND) continue;
        const d = Math.hypot(x - z.x, y - z.y);
        if (d < z.r + (noise[i] - 0.5) * 1.6) tiles[i] = T.GRASS;
        if (z.spring && d < 1.4 && tiles[i] === T.GRASS) tiles[i] = T.SPRING;
      }
    }
  }
  for (const z of GREEN_ZONES) {
    let n = 0, t = 0;
    while (n < 6 && t < 400) {
      t++;
      const x = Math.floor(z.x - z.r + rng() * z.r * 2), y = Math.floor(z.y - z.r + rng() * z.r * 2);
      if (x < 1 || y < 1 || x >= W - 1 || y >= H - 1) continue;
      const i = y * W + x;
      if (tiles[i] === T.GRASS && !objs[i]) { objs[i] = O.BUSH; n++; }
    }
  }

  // Hot spots: nothing else spawns there, and a crate sits at the centre
  HOT_SPOTS.forEach((hs, k) => {
    for (let y = Math.floor(hs.y - hs.r - 1); y <= Math.ceil(hs.y + hs.r + 1); y++) {
      for (let x = Math.floor(hs.x - hs.r - 1); x <= Math.ceil(hs.x + hs.r + 1); x++) {
        if (x < 1 || y < 1 || x >= W - 1 || y >= H - 1) continue;
        if (Math.hypot(x - hs.x, y - hs.y) < hs.r + 1) reserved[y * W + x] = 1;
      }
    }
    const ci = hs.y * W + hs.x;
    if (tiles[ci] === T.GROUND && !objs[ci]) { objs[ci] = O.CRATE; crateLoot.set(ci, HOT_LOOT[k]); }
  });

  // Impassable edge of the zone
  for (let x = 0; x < W; x++) { tiles[x] = T.RUBBLE; tiles[(H - 1) * W + x] = T.RUBBLE; }
  for (let y = 0; y < H; y++) { tiles[y * W] = T.RUBBLE; tiles[y * W + W - 1] = T.RUBBLE; }

  // Scatter objects on open wasteland, keeping the base area clear
  function place(kind, count, minDist = 8) {
    let placed = 0, tries = 0;
    while (placed < count && tries < 6000) {
      tries++;
      const x = 1 + Math.floor(rng() * (W - 2));
      const y = 1 + Math.floor(rng() * (H - 2));
      const i = y * W + x;
      if (tiles[i] !== T.GROUND || objs[i] || reserved[i]) continue;
      if (Math.hypot(x - BASE.x, y - BASE.y) < minDist) continue;
      objs[i] = kind;
      placed++;
    }
  }
  place(O.TREE, 70);
  place(O.ROCK, 25);
  place(O.SCRAP, 30);
  place(O.ORE, 10, 14);

  // Extra scrap inside each ruin
  for (const r of ruins) {
    let n = 0, t = 0;
    while (n < 4 && t < 200) {
      t++;
      const x = r.x0 + 1 + Math.floor(rng() * (r.w - 2));
      const y = r.y0 + 1 + Math.floor(rng() * (r.h - 2));
      const i = y * W + x;
      if (tiles[i] === T.GROUND && !objs[i]) { objs[i] = O.SCRAP; n++; }
    }
  }

  // One supply crate inside each ruin
  ruins.forEach((r, idx) => {
    for (let t = 0; t < 200; t++) {
      const x = r.x0 + 2 + Math.floor(rng() * (r.w - 4));
      const y = r.y0 + 2 + Math.floor(rng() * (r.h - 4));
      const i = y * W + x;
      if (tiles[i] === T.GROUND && !objs[i]) { objs[i] = O.CRATE; crateLoot.set(i, CRATE_LOOT[idx]); break; }
    }
  });

  computeRadiation();
}

function solidAt(tx, ty) {
  if (tx < 0 || ty < 0 || tx >= W || ty >= H) return true;
  const i = ty * W + tx;
  const t = tiles[i];
  return t === T.WATER || t === T.SPRING || t === T.RUBBLE || objs[i] !== O.NONE || structs.has(i);
}

function collides(x, y, s) {
  const h = s / 2;
  const x0 = Math.floor((x - h) / TS), x1 = Math.floor((x + h - 0.001) / TS);
  const y0 = Math.floor((y - h) / TS), y1 = Math.floor((y + h - 0.001) / TS);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
    if (solidAt(tx, ty)) return true;
  }
  return false;
}

/* =====================================================================
   GAME STATE
   ===================================================================== */
const spawn = { x: (BASE.x + 0.5) * TS, y: (BASE.y + 0.5) * TS };
const state = {
  player: {
    x: spawn.x, y: spawn.y, aimX: 1, aimY: 0,
    health: 100, food: 100, water: 100, radiation: 0,
    inventory: new Array(CONFIG.inventory.slots).fill(null)
  },
  corpse: null,
  swing: null, swingCd: 0, particles: [], floats: [], damage: new Map(), shake: new Map(),
  invOpen: false, craftOpen: false, placing: null, unlocked: new Set(), uiRects: [], radRate: 0,
  lastReachMsg: -10, lastFullMsg: -10, mwx: 0, mwy: 0,
  elapsed: 0,
  timeMult: 1,
  gameMinutes: CONFIG.time.startHour * 60,
  msg: '', msgT: 0
};

function toast(text, secs = 4) { state.msg = text; state.msgT = secs; }

/* =====================================================================
   INPUT
   ===================================================================== */
const keys = {};
const mouse = { x: 0, y: 0, down: false };
const zoomSteps = [2, 3, 4, 5];
let zoomLevel = CONFIG.zoom;

window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  keys[k] = true;
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'tab'].includes(k)) e.preventDefault();
  if (e.repeat) return;
  if (k === 't') { state.timeMult = state.timeMult === 1 ? CONFIG.time.fastMultiplier : 1; toast(state.timeMult === 1 ? 'Time: normal' : 'Time: fast forward'); }
  if (k === 'g') { addTestScrap(); }
  if (k === 'i' || k === 'tab') { state.invOpen = !state.invOpen; if (state.invOpen) state.craftOpen = false; }
  if (k === 'c') { state.craftOpen = !state.craftOpen; if (state.craftOpen) { state.invOpen = false; state.placing = null; } }
  if (k === 'escape') { state.invOpen = false; state.craftOpen = false; state.placing = null; }
  if (k === 'u') { unlockAllTest(); }
  if (k === 'k') { die(); }
});
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; mouse.down = false; });
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mousedown', e => {
  if (e.button === 2) { state.placing = null; return; }
  if (e.button !== 0) return;
  if (state.craftOpen || state.invOpen) { uiClick(e.clientX, e.clientY); return; }
  if (state.placing) { tryPlace(); return; }
  mouse.down = true;
});
window.addEventListener('mouseup', e => { if (e.button === 0) mouse.down = false; });
window.addEventListener('contextmenu', e => e.preventDefault());
window.addEventListener('wheel', e => {
  const idx = zoomSteps.indexOf(zoomLevel);
  const next = Math.min(zoomSteps.length - 1, Math.max(0, idx + (e.deltaY < 0 ? 1 : -1)));
  zoomLevel = zoomSteps[next];
  resize();
}, { passive: true });

/* =====================================================================
   PLAYER, DEATH AND THE CORPSE RUN
   ===================================================================== */
/* Inventory: fixed slots, stacks up to CONFIG.inventory.stackSize. addItem returns what didn't fit. */
function addItem(name, qty, inv = state.player.inventory) {
  const max = ITEM_STACK[name] || CONFIG.inventory.stackSize;
  for (const s of inv) {
    if (s && s.name === name && s.qty < max) {
      const n = Math.min(max - s.qty, qty);
      s.qty += n; qty -= n;
      if (!qty) return 0;
    }
  }
  for (let i = 0; i < inv.length && qty > 0; i++) {
    if (!inv[i]) { const n = Math.min(max, qty); inv[i] = { name, qty: n }; qty -= n; }
  }
  return qty;
}
function spaceFor(name, qty) {
  const clone = state.player.inventory.map(s => s && { ...s });
  return addItem(name, qty, clone) === 0;
}
function usedSlots() { return state.player.inventory.filter(Boolean).length; }

function addTestScrap() {
  addItem('Wood', 30); addItem('Scrap', 30); addItem('Stone', 15); addItem('Berries', 10);
  toast('Added test materials: 30 wood, 30 scrap, 15 stone, 10 berries');
}

/* Test key: unlock every blueprint without hunting through the ruins */
function unlockAllTest() {
  for (const k of Object.keys(BLUEPRINTS)) state.unlocked.add(k);
  toast('All blueprints unlocked (test)');
}

/* Your working tool tier is the best matching tool in the bag. Bare hands are tier 0. */
function toolTier(type) {
  let best = 0;
  for (const s of state.player.inventory) {
    const ti = s && TOOL_ITEMS[s.name];
    if (ti && ti.type === type && ti.tier > best) best = ti.tier;
  }
  return best;
}

function die(reason) {
  const p = state.player;
  // Dying again before recovering your last corpse loses that stash for good
  if (state.corpse && state.corpse.items.length) toast((reason || 'You died.') + ' Your previous stash is gone for good.', 5);
  else toast((reason || 'You died.') + ' Run back to your marker to get your gear.', 5);
  state.corpse = { x: p.x, y: p.y, items: p.inventory.filter(Boolean).map(s => ({ ...s })) };
  p.inventory = new Array(CONFIG.inventory.slots).fill(null);
  p.x = spawn.x; p.y = spawn.y;
  p.health = 100; p.food = 100; p.water = 100; p.radiation = 0;
}

/* Harvesting: aim at a resource within reach, hold the mouse button to swing. */
function getTarget() {
  const tx = Math.floor(state.mwx / TS), ty = Math.floor(state.mwy / TS);
  if (tx < 0 || ty < 0 || tx >= W || ty >= H) return null;
  const i = ty * W + tx, kind = objs[i];
  const p = state.player;
  if (!kind) {
    const tt = tiles[i];
    if (tt !== T.WATER && tt !== T.SPRING) return null;
    const dd = Math.hypot((tx + 0.5) * TS - p.x, (ty + 0.5) * TS - p.y);
    return { tx, ty, i, kind: 0, res: { name: tt === T.WATER ? 'Irradiated water' : 'Clean spring', item: 'water', drink: true, dirty: tt === T.WATER, minTier: 0, tool: 'axe' }, dist: dd, tier: 0, inReach: dd <= CONFIG.player.reach, canHarvest: true };
  }
  const res = RES[kind];
  const dist = Math.hypot((tx + 0.5) * TS - p.x, (ty + 0.5) * TS - p.y);
  const tier = toolTier(res.tool);
  return { tx, ty, i, kind, res, dist, tier, inReach: dist <= CONFIG.player.reach, canHarvest: tier >= res.minTier };
}

function burst(x, y, color, n) {
  for (let k = 0; k < n; k++) {
    const a = Math.random() * Math.PI * 2, s = 20 + Math.random() * 40;
    state.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 25, life: 0.35, color });
  }
}

function updateHarvest(dt) {
  state.swingCd = Math.max(0, state.swingCd - dt);
  if (state.swing) { state.swing.t += dt; if (state.swing.t >= state.swing.dur) state.swing = null; }
  if (!mouse.down || state.invOpen || state.craftOpen || state.placing || state.swingCd > 0) return;
  const t = getTarget();
  if (!t) return;
  const cfg = CONFIG.tools, res = t.res, cx = (t.tx + 0.5) * TS, cy = (t.ty + 0.5) * TS;
  if (!t.inReach) {
    if (state.elapsed - state.lastReachMsg > 1.5) { toast('Too far away. Step closer.', 1.5); state.lastReachMsg = state.elapsed; }
    return;
  }
  if (res.drink) { drinkFrom(t); return; }
  if (res.crate) { openCrate(t); state.swingCd = 0.3; return; }
  const cd = cfg.cooldown[t.tier];
  state.swingCd = cd;
  state.swing = { t: 0, dur: cd * 0.85, tool: res.tool, tier: t.tier };
  if (!t.canHarvest) {
    toast('Needs a ' + cfg.names[res.minTier] + ' ' + res.tool + ' or better.', 2);
    burst(cx, cy, '#9a9a9a', 4);
    return;
  }
  if (!spaceFor(res.item, res.yield[1])) { toast('Bag full.', 1.5); state.swing = null; return; }
  let d = state.damage.get(t.i);
  if (!d) { d = { hp: res.hp, max: res.hp }; state.damage.set(t.i, d); }
  d.hp -= cfg.power[t.tier];
  state.shake.set(t.i, 0.18);
  burst(cx, cy, res.color, 5);
  if (d.hp <= 0) {
    const qty = res.yield[0] + Math.floor(Math.random() * (res.yield[1] - res.yield[0] + 1));
    objs[t.i] = O.NONE;
    state.damage.delete(t.i);
    addItem(res.item, qty);
    state.floats.push({ x: cx, y: t.ty * TS, text: '+' + qty + ' ' + res.item, color: '#ffd36b', life: 1.2 });
    burst(cx, cy, res.color, 12);
    buildMinimap();
  }
}

function updateEffects(dt) {
  for (const pt of state.particles) { pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.vy += 140 * dt; pt.life -= dt; }
  state.particles = state.particles.filter(pt => pt.life > 0);
  for (const f of state.floats) { f.y -= 14 * dt; f.life -= dt; }
  state.floats = state.floats.filter(f => f.life > 0);
  for (const [k, v] of state.shake) { if (v - dt <= 0) state.shake.delete(k); else state.shake.set(k, v - dt); }
}

function updatePlayer(dt) {
  const p = state.player, cfg = CONFIG.player;
  let dx = 0, dy = 0;
  if (keys['w'] || keys['arrowup']) dy -= 1;
  if (keys['s'] || keys['arrowdown']) dy += 1;
  if (keys['a'] || keys['arrowleft']) dx -= 1;
  if (keys['d'] || keys['arrowright']) dx += 1;
  if (dx && dy) { dx *= Math.SQRT1_2; dy *= Math.SQRT1_2; }
  const step = cfg.speed * dt;
  const nx = p.x + dx * step;
  if (!collides(nx, p.y, cfg.size)) p.x = nx;
  const ny = p.y + dy * step;
  if (!collides(p.x, ny, cfg.size)) p.y = ny;

  // Corpse pickup
  const c = state.corpse;
  if (c && Math.hypot(c.x - p.x, c.y - p.y) < 10) {
    const had = c.items.length, left = [];
    for (const item of c.items) {
      const rem = addItem(item.name, item.qty);
      if (rem) left.push({ name: item.name, qty: rem });
    }
    c.items = left;
    if (left.length) {
      if (state.elapsed - state.lastFullMsg > 3) { toast('Bag full. Some gear is still on the marker.'); state.lastFullMsg = state.elapsed; }
      return;
    }
    toast(had ? 'Gear recovered.' : 'Marker cleared. You weren\u2019t carrying anything.');
    state.corpse = null;
  }
}

/* =====================================================================
   TIME AND LIGHT
   ===================================================================== */
function updateTime(dt) {
  state.elapsed += dt;
  const minsPerSec = 1440 / CONFIG.time.dayLengthSec;
  state.gameMinutes += dt * minsPerSec * state.timeMult;
}
function clockHour() { return (state.gameMinutes % 1440) / 60; }
function clockDay() { return Math.floor(state.gameMinutes / 1440) + 1; }
function darkness(h) {
  if (h >= 7 && h < 18) return 0;
  if (h >= 18 && h < 21) return (h - 18) / 3;
  if (h >= 21 || h < 4) return 1;
  return 1 - (h - 4) / 3;
}
function fmtClock() {
  const h = clockHour();
  const hh = Math.floor(h), mm = Math.floor((h - hh) * 60);
  return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
}

/* =====================================================================
   RENDERING
   ===================================================================== */
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const lightCv = document.createElement('canvas');
const lctx = lightCv.getContext('2d');
let dpr = 1, scale = 3;

function resize() {
  dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  lightCv.width = canvas.width;
  lightCv.height = canvas.height;
  scale = Math.max(1, Math.round(zoomLevel * dpr));
}
window.addEventListener('resize', resize);

const COL = {
  ground: ['#6b5f47', '#716549', '#665a42', '#6d6149'],
  dirt:   ['#4a3626', '#503b2a', '#46321f', '#4d3828'],
  water:  ['#3f6b3a', '#477a41', '#3b6436', '#437238'],
  rubble: ['#3c3a38', '#454240', '#383634', '#403e3b'],
  road:   ['#3a3a3c', '#3f3f42', '#37373a', '#3c3c3f'],
  grass:  ['#5a7a3a', '#628440', '#557437', '#5e7e3c'],
  spring: ['#3f93b8', '#4aa3c8', '#3a8bb0', '#449bc0']
};

function drawTile(tx, ty, t, s, time) {
  const x = tx * TS, y = ty * TS;
  let col;
  switch (t) {
    case T.DIRT: col = COL.dirt[s]; break;
    case T.WATER: col = COL.water[s]; break;
    case T.RUBBLE: col = COL.rubble[s]; break;
    case T.ROAD: col = COL.road[s]; break;
    case T.GRASS: col = COL.grass[s]; break;
    case T.SPRING: col = COL.spring[s]; break;
    default: col = COL.ground[s];
  }
  ctx.fillStyle = col;
  ctx.fillRect(x, y, TS, TS);

  if (t === T.GROUND && s === 0) { ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(x + 3, y + 5, 2, 1); }
  if (t === T.GROUND && s === 2) { ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(x + 9, y + 10, 3, 1); }
  if (t === T.DIRT) { ctx.fillStyle = 'rgba(0,0,0,0.14)'; ctx.fillRect(x, y + 4 + (s % 2) * 6, TS, 1); }
  if (t === T.ROAD && s === 1) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + 4, y + 3, 1, 8); ctx.fillRect(x + 5, y + 10, 4, 1); }
  if (t === T.RUBBLE) {
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(x + 2 + s, y + 3, 4, 3);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + 8, y + 9, 5, 4);
  }
  if (t === T.WATER) {
    const phase = (Math.floor(time * 1.5) + tx + ty) % 2;
    ctx.fillStyle = 'rgba(190,255,120,0.18)';
    ctx.fillRect(x + 3 + phase * 6, y + 4, 4, 1);
    ctx.fillRect(x + 8 - phase * 5, y + 11, 3, 1);
  }
  if (t === T.SPRING) {
    const ph2 = (Math.floor(time * 1.5) + tx + ty) % 2;
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.fillRect(x + 3 + ph2 * 6, y + 5, 4, 1);
    ctx.fillRect(x + 8 - ph2 * 5, y + 10, 3, 1);
  }
  // radiation tints and the safe-camp boundary
  const rr = radMap[ty * W + tx];
  if (t === T.GROUND && rr >= 0.85) {
    ctx.fillStyle = 'rgba(170,230,60,' + (0.16 + 0.1 * Math.sin(time * 3 + tx + ty)) + ')';
    ctx.fillRect(x, y, TS, TS);
  } else if (t === T.GROUND && rr >= 0.4) {
    ctx.fillStyle = 'rgba(150,170,60,0.07)'; ctx.fillRect(x, y, TS, TS);
  }
  if (rr <= -0.9) {
    ctx.fillStyle = 'rgba(127,224,192,0.4)';
    if (tx + 1 < W && radMap[ty * W + tx + 1] > -0.9) ctx.fillRect(x + TS - 1, y, 1, TS);
    if (tx > 0 && radMap[ty * W + tx - 1] > -0.9) ctx.fillRect(x, y, 1, TS);
    if (ty + 1 < H && radMap[(ty + 1) * W + tx] > -0.9) ctx.fillRect(x, y + TS - 1, TS, 1);
    if (ty > 0 && radMap[(ty - 1) * W + tx] > -0.9) ctx.fillRect(x, y, TS, 1);
  }
  if (t === T.GRASS && (s === 1 || s === 3)) {
    ctx.fillStyle = s === 1 ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)';
    ctx.fillRect(x + 4, y + 6, 1, 3); ctx.fillRect(x + 10, y + 4, 1, 3);
  }
}

function drawObject(kind, tx, ty, s) {
  const x = tx * TS, y = ty * TS;
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.fillRect(x + 3, y + 13, 10, 3);
  if (kind === O.TREE) {
    ctx.fillStyle = '#3a2a1c';
    ctx.fillRect(x + 7, y + 4, 2, 11);
    const f = (s & 1) ? -1 : 1;
    ctx.fillRect(x + (f > 0 ? 8 : 3), y + 5, 5, 1);
    ctx.fillRect(x + (f > 0 ? 4 : 8), y + 8, 4, 1);
    ctx.fillRect(x + (f > 0 ? 11 : 4), y + 3, 1, 3);
    ctx.fillRect(x + (f > 0 ? 4 : 11), y + 6, 1, 3);
    ctx.fillRect(x + 7, y + 2, 1, 3);
  } else if (kind === O.SCRAP) {
    ctx.fillStyle = '#8a8d94'; ctx.fillRect(x + 2, y + 8, 12, 6);
    ctx.fillStyle = '#6e7178'; ctx.fillRect(x + 4, y + 5, 7, 5);
    ctx.fillStyle = '#a9acb3'; ctx.fillRect(x + 9, y + 9, 4, 3);
    ctx.fillStyle = '#a8532a'; ctx.fillRect(x + 3, y + 11, 4, 2);
    ctx.fillStyle = '#c9c9cf'; ctx.fillRect(x + 6, y + 6, 2, 1);
  } else if (kind === O.ROCK) {
    ctx.fillStyle = '#7a7770'; ctx.fillRect(x + 3, y + 8, 10, 6);
    ctx.fillStyle = '#8d8a83'; ctx.fillRect(x + 5, y + 6, 6, 3);
    ctx.fillStyle = '#5f5c56'; ctx.fillRect(x + 3, y + 12, 10, 2);
  } else if (kind === O.ORE) {
    ctx.fillStyle = '#56534e'; ctx.fillRect(x + 2, y + 7, 12, 7);
    ctx.fillStyle = '#6a665f'; ctx.fillRect(x + 4, y + 4, 8, 4);
    ctx.fillStyle = '#a8532a'; ctx.fillRect(x + 4, y + 9, 3, 2); ctx.fillRect(x + 9, y + 6, 3, 2); ctx.fillRect(x + 7, y + 11, 4, 2);
    ctx.fillStyle = '#e29a55'; ctx.fillRect(x + 5, y + 9, 1, 1); ctx.fillRect(x + 10, y + 6, 1, 1);
  } else if (kind === O.CRATE) {
    ctx.fillStyle = '#7a5a30'; ctx.fillRect(x + 2, y + 5, 12, 9);
    ctx.fillStyle = '#9a7440'; ctx.fillRect(x + 2, y + 5, 12, 3);
    ctx.fillStyle = '#3b2a1c'; ctx.fillRect(x + 2, y + 9, 12, 1); ctx.fillRect(x + 7, y + 5, 2, 9);
    ctx.fillStyle = '#d6a84a'; ctx.fillRect(x + 7, y + 8, 2, 2);
  } else if (kind === O.BUSH) {
    ctx.fillStyle = '#3f6e2e'; ctx.fillRect(x + 2, y + 6, 12, 8);
    ctx.fillStyle = '#4f8a3a'; ctx.fillRect(x + 4, y + 4, 8, 6);
    ctx.fillStyle = '#c0392b'; ctx.fillRect(x + 4, y + 8, 2, 2); ctx.fillRect(x + 9, y + 6, 2, 2); ctx.fillRect(x + 11, y + 10, 2, 2);
  }
}

function drawBaseMarker(time) {
  const bx = BASE.x * TS, by = BASE.y * TS;
  // bedroll
  ctx.fillStyle = '#7a3b2e'; ctx.fillRect(bx + 2, by + 6, 11, 5);
  ctx.fillStyle = '#d8cdb5'; ctx.fillRect(bx + 2, by + 6, 3, 5);
  // campfire ring
  const fx = (BASE.x + 2) * TS, fy = BASE.y * TS;
  ctx.fillStyle = '#58554f';
  ctx.fillRect(fx + 3, fy + 9, 10, 4);
  ctx.fillStyle = '#26211c'; ctx.fillRect(fx + 5, fy + 10, 6, 2);
  const flick = Math.floor(time * 8) % 3;
  ctx.fillStyle = '#f26f21'; ctx.fillRect(fx + 6, fy + 6 - flick, 4, 5 + flick);
  ctx.fillStyle = '#ffd36b'; ctx.fillRect(fx + 7, fy + 8 - flick, 2, 3 + flick);
}

function drawPlayer(p, aim) {
  const x = Math.round(p.x), y = Math.round(p.y);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x - 5, y + 4, 10, 3);
  ctx.fillStyle = '#2f7f8a'; ctx.fillRect(x - 4, y - 3, 8, 8);
  ctx.fillStyle = '#e0b48a'; ctx.fillRect(x - 3, y - 8, 6, 6);
  ctx.fillStyle = '#2a1d14'; ctx.fillRect(x - 3, y - 8, 6, 2);
  ctx.fillStyle = '#20252b'; ctx.fillRect(x - 4, y + 5, 3, 2); ctx.fillRect(x + 1, y + 5, 3, 2);
  const sw = state.swing;
  if (sw) {
    const prog = Math.min(1, sw.t / sw.dur);
    const ext = 4 + Math.sin(prog * Math.PI) * 7;
    if (sw.tier === 0) {
      ctx.fillStyle = CONFIG.tools.colors[0];
      ctx.fillRect(Math.round(x + aim.x * ext) - 1, Math.round(y - 1 + aim.y * ext) - 1, 3, 3);
    } else {
      ctx.fillStyle = '#6b4a2b';
      for (let k = 3; k <= ext; k++) ctx.fillRect(Math.round(x + aim.x * k), Math.round(y - 1 + aim.y * k), 1, 1);
      ctx.fillStyle = CONFIG.tools.colors[sw.tier];
      ctx.fillRect(Math.round(x + aim.x * ext) - 1, Math.round(y - 1 + aim.y * ext) - 2, 3, 4);
    }
  } else {
    ctx.fillStyle = '#1b1b1b';
    for (let k = 3; k <= 8; k++) ctx.fillRect(Math.round(x + aim.x * k), Math.round(y - 1 + aim.y * k), 1, 1);
  }
}

function drawCorpse(c, time) {
  const x = Math.round(c.x), y = Math.round(c.y);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x - 5, y + 3, 10, 3);
  ctx.fillStyle = '#d8cdb5';
  ctx.fillRect(x - 1, y - 7, 2, 11);
  ctx.fillRect(x - 4, y - 4, 8, 2);
  const pulse = 0.35 + 0.35 * Math.sin(time * 4);
  ctx.strokeStyle = `rgba(232,0,61,${pulse + 0.3})`;
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 8.5, y - 9.5, 17, 17);
}

function lerpColor(a, b, t) { return a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(','); }

function hole(sx, sy, r, strength) {
  const g = lctx.createRadialGradient(sx, sy, r * 0.15, sx, sy, r);
  g.addColorStop(0, `rgba(0,0,0,${strength})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  lctx.fillStyle = g;
  lctx.beginPath(); lctx.arc(sx, sy, r, 0, Math.PI * 2); lctx.fill();
}

function drawLighting(transX, transY, d) {
  if (d <= 0.01) return;
  const col = lerpColor([70, 35, 40], [5, 9, 32], d);
  lctx.setTransform(1, 0, 0, 1, 0, 0);
  lctx.globalCompositeOperation = 'source-over';
  lctx.clearRect(0, 0, lightCv.width, lightCv.height);
  lctx.fillStyle = `rgba(${col},${d * 0.84})`;
  lctx.fillRect(0, 0, lightCv.width, lightCv.height);
  lctx.globalCompositeOperation = 'destination-out';
  const p = state.player;
  hole(p.x * scale - transX, p.y * scale - transY, 80 * scale, 0.95);
  hole((BASE.x + 2.5) * TS * scale - transX, (BASE.y + 0.6) * TS * scale - transY, 70 * scale, 0.9);
  for (const [si, st] of structs) {
    if (st.type === 'forge') hole(((si % W) + 0.5) * TS * scale - transX, (Math.floor(si / W) + 0.5) * TS * scale - transY, 45 * scale, 0.8);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(lightCv, 0, 0);
}

/* Minimap, pre-rendered once at 2px per tile */
const mini = document.createElement('canvas');
function buildMinimap() {
  mini.width = W * 2; mini.height = H * 2;
  const m = mini.getContext('2d');
  const cols = ['#6b5f47', '#503b2a', '#4a8a44', '#555250', '#3a3a3c', '#4f8a3a', '#5ab4d6'];
  const objCols = [null, '#3b2a1c', '#b8b8c0', '#8d8a83', '#e29a55', '#d6a84a', '#4f8a3a'];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x;
    m.fillStyle = cols[tiles[i]];
    m.fillRect(x * 2, y * 2, 2, 2);
    if (radMap[i] >= 0.85) { m.fillStyle = 'rgba(210,230,60,0.85)'; m.fillRect(x * 2, y * 2, 2, 2); }
    if (objs[i]) { m.fillStyle = objCols[objs[i]]; m.fillRect(x * 2, y * 2, 2, 2); }
  }
  m.strokeStyle = 'rgba(127,224,192,0.8)'; m.lineWidth = 1;
  m.beginPath(); m.arc(BASE.x * 2 + 1, BASE.y * 2 + 1, CONFIG.survival.baseZoneRadius * 2, 0, Math.PI * 2); m.stroke();
}

function bar(x, y, label, val, color) {
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(x, y, 150, 12);
  ctx.fillStyle = color; ctx.fillRect(x + 1, y + 1, 148 * Math.max(0, Math.min(1, val / 100)), 10);
  ctx.fillStyle = '#e9e2d4'; ctx.font = '10px ui-monospace, Menlo, Consolas, monospace';
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.fillText(label, x + 5, y + 6.5);
}

function drawHUD(mTile) {
  const w = window.innerWidth, h = window.innerHeight;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const p = state.player;
  state.uiRects = [];
  bar(12, 12, 'Health', p.health, '#c0392b');
  bar(12, 28, 'Food', p.food, '#f26f21');
  bar(12, 44, 'Water', p.water, '#3b82c4');
  bar(12, 60, 'Radiation', p.radiation, '#7fbf3f');
  const rr = state.radRate;
  const zone = rr <= -0.9 ? 'Safe camp' : rr < 0 ? 'Regrowth' : rr >= 0.9 ? 'Hot spot' : rr >= 0.4 ? 'Ruins' : 'Wasteland';
  ctx.textAlign = 'right'; ctx.fillStyle = rr < 0 ? '#9fe8c8' : rr >= 0.9 ? '#ffd36b' : '#e9e2d4';
  ctx.fillText(zone + (rr >= 0 ? ' +' : ' ') + rr.toFixed(2) + '/s', 158, 66.5);
  ctx.textAlign = 'left';

  ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(12, 78, 150, 42);
  ctx.fillStyle = '#e9e2d4'; ctx.font = '10px ui-monospace, Menlo, Consolas, monospace';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('Bag: ' + usedSlots() + '/' + CONFIG.inventory.slots + ' slots  (I)', 17, 87.5);
  ctx.fillText('Axe: ' + CONFIG.tools.names[toolTier('axe')], 17, 100);
  ctx.fillText('Pickaxe: ' + CONFIG.tools.names[toolTier('pickaxe')], 17, 112);

  // clock + minimap
  const hr = clockHour();
  const label = 'Day ' + clockDay() + '  ' + fmtClock() + (state.timeMult > 1 ? '  >>' : '');
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(w - 132, 12, 120, 18);
  ctx.fillStyle = hr >= 18 || hr < 6 ? '#9fb4ff' : '#ffd36b';
  ctx.font = '11px ui-monospace, Menlo, Consolas, monospace'; ctx.textAlign = 'center';
  ctx.fillText(label, w - 72, 21.5);
  ctx.drawImage(mini, w - 132, 34, 120, 120);
  ctx.strokeStyle = 'rgba(233,226,212,0.5)'; ctx.lineWidth = 1; ctx.strokeRect(w - 131.5, 34.5, 119, 119);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(w - 132 + (p.x / TS) * 2 - 1.5, 34 + (p.y / TS) * 2 - 1.5, 3, 3);
  if (state.corpse) { ctx.fillStyle = '#e8003d'; ctx.fillRect(w - 132 + (state.corpse.x / TS) * 2 - 1.5, 34 + (state.corpse.y / TS) * 2 - 1.5, 3, 3); }

  // hover info
  ctx.textAlign = 'left';
  ctx.font = '10px ui-monospace, Menlo, Consolas, monospace';
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(12, h - 52, 440, 40);
  ctx.fillStyle = '#e9e2d4';
  ctx.fillText(mTile, 18, h - 42);
  ctx.fillStyle = '#b9b09d';
  ctx.fillText('WASD move  |  hold click to swing  |  I bag  |  C craft  |  wheel zoom', 18, h - 30);
  ctx.fillText('T fast time  |  U test unlock plans  |  G test materials  |  K test death', 18, h - 19);

  // toast
  if (state.msgT > 0) {
    ctx.globalAlpha = Math.min(1, state.msgT);
    ctx.font = '12px ui-monospace, Menlo, Consolas, monospace';
    const tw = ctx.measureText(state.msg).width + 24;
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(w / 2 - tw / 2, h - 90, tw, 26);
    ctx.fillStyle = '#e9e2d4'; ctx.textAlign = 'center';
    ctx.fillText(state.msg, w / 2, h - 77);
    ctx.globalAlpha = 1;
  }
  if (state.invOpen) drawInventory(w, h);
  if (state.craftOpen) drawCrafting(w, h);
}

function drawInventory(w, h) {
  const cols = 5, rows = Math.ceil(CONFIG.inventory.slots / cols), cell = 46, pad = 12;
  const pw = cols * cell + pad * 2 - 4, ph = rows * cell + 68;
  const px = Math.round(w / 2 - pw / 2), py = Math.round(h / 2 - ph / 2);
  ctx.fillStyle = 'rgba(12,10,8,0.92)'; ctx.fillRect(px, py, pw, ph);
  ctx.strokeStyle = 'rgba(233,226,212,0.35)'; ctx.lineWidth = 1; ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.font = '12px ui-monospace, Menlo, Consolas, monospace';
  ctx.fillStyle = '#e9e2d4'; ctx.fillText('Bag  ' + usedSlots() + '/' + CONFIG.inventory.slots, px + pad, py + 20);
  let hover = null;
  for (let i = 0; i < CONFIG.inventory.slots; i++) {
    const cx = px + pad + (i % cols) * cell, cy = py + 36 + Math.floor(i / cols) * cell;
    ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(cx, cy, cell - 4, cell - 4);
    const s = state.player.inventory[i];
    if (mouse.x >= cx && mouse.x < cx + cell - 4 && mouse.y >= cy && mouse.y < cy + cell - 4) {
      hover = s;
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.strokeRect(cx + 0.5, cy + 0.5, cell - 5, cell - 5);
    }
    if (s) {
      ctx.fillStyle = ITEM_COL[s.name] || '#cccccc'; ctx.fillRect(cx + 9, cy + 7, 24, 22);
      ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(cx + 9, cy + 7, 24, 5);
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(cx + 9, cy + 25, 24, 4);
      state.uiRects.push({ x: cx, y: cy, w: cell - 4, h: cell - 4, fn: () => useItem(i) });
      const ti = TOOL_ITEMS[s.name];
      if (ti) {
        ctx.fillStyle = '#ffffff'; ctx.font = '11px ui-monospace, Menlo, Consolas, monospace'; ctx.textAlign = 'center';
        ctx.fillText(ti.type === 'axe' ? 'AX' : 'PK', cx + 21, cy + 18);
        ctx.textAlign = 'left';
      }
      ctx.font = '10px ui-monospace, Menlo, Consolas, monospace'; ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff'; ctx.fillText(String(s.qty), cx + cell - 7, cy + cell - 11);
      ctx.textAlign = 'left';
    }
  }
  ctx.font = '10px ui-monospace, Menlo, Consolas, monospace';
  ctx.fillStyle = '#b9b09d';
  ctx.fillText(hover ? hover.name + ' x' + hover.qty : 'Click a slot to eat or use it. I or Esc to close.', px + pad, py + ph - 14);
}

/* ---------- Crafting, stations and crates ---------- */
function countItem(name) {
  let n = 0;
  for (const s of state.player.inventory) if (s && s.name === name) n += s.qty;
  return n;
}
function canAfford(cost) { return Object.keys(cost).every(k => countItem(k) >= cost[k]); }
function takeItems(cost) {
  const inv = state.player.inventory;
  for (const name of Object.keys(cost)) {
    let need = cost[name];
    for (let i = 0; i < inv.length && need > 0; i++) {
      const s = inv[i];
      if (s && s.name === name) { const n = Math.min(s.qty, need); s.qty -= n; need -= n; if (s.qty <= 0) inv[i] = null; }
    }
  }
}
function stationNear(type) {
  const p = state.player;
  for (const [si, st] of structs) {
    if (st.type !== type) continue;
    const dx = ((si % W) + 0.5) * TS - p.x, dy = (Math.floor(si / W) + 0.5) * TS - p.y;
    if (Math.hypot(dx, dy) <= CONFIG.player.craftRange) return true;
  }
  return false;
}
function recipeStatus(r) {
  if (r.unlock && !state.unlocked.has(r.unlock)) return { ok: false, why: 'Needs ' + BLUEPRINTS[r.unlock] };
  if (r.station && !stationNear(r.station)) return { ok: false, why: 'Needs a ' + STATION_NAMES[r.station] + ' nearby' };
  if (!canAfford(r.cost)) return { ok: false, why: 'Missing materials' };
  return { ok: true, why: 'Ready' };
}
function tryCraft(r) {
  const st = recipeStatus(r);
  if (!st.ok) { toast(st.why + '.', 2); return; }
  if (r.place) {
    state.placing = r.id; state.craftOpen = false;
    toast('Click to place the ' + r.name + '. Right-click or Esc to cancel.', 5);
    return;
  }
  const snap = state.player.inventory.map(s => s && { ...s });
  takeItems(r.cost);
  let left = 0;
  for (const k of Object.keys(r.gives)) left += addItem(k, r.gives[k]);
  if (left) { state.player.inventory = snap; toast('Bag full.', 2); return; }
  state.floats.push({ x: state.player.x, y: state.player.y - 14, text: 'Crafted ' + r.name, color: '#7fff7f', life: 1.4 });
}
function placeValid(tx, ty) {
  if (tx < 1 || ty < 1 || tx >= W - 1 || ty >= H - 1) return false;
  const i = ty * W + tx, t = tiles[i];
  if (t === T.WATER || t === T.SPRING || t === T.RUBBLE || objs[i] || structs.has(i)) return false;
  const p = state.player;
  const dx = (tx + 0.5) * TS - p.x, dy = (ty + 0.5) * TS - p.y;
  if (Math.abs(dx) < 14 && Math.abs(dy) < 14) return false;
  return Math.hypot(dx, dy) <= 72;
}
function tryPlace() {
  const r = RECIPES.find(x => x.id === state.placing);
  if (!r) { state.placing = null; return; }
  const tx = Math.floor(state.mwx / TS), ty = Math.floor(state.mwy / TS);
  if (!placeValid(tx, ty)) { toast('Cannot place that here. Pick a clear tile close to you.', 2); return; }
  if (!canAfford(r.cost)) { toast('Missing materials.', 2); state.placing = null; return; }
  takeItems(r.cost);
  structs.set(ty * W + tx, { type: r.place });
  state.placing = null;
  toast(r.name + ' placed.', 2.5);
}
function uiClick(x, y) {
  for (const r of state.uiRects) {
    if (x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) { r.fn(); return; }
  }
}
function openCrate(t) {
  const loot = crateLoot.get(t.i) || { items: [] };
  const clone = state.player.inventory.map(s => s && { ...s });
  for (const it of loot.items) {
    if (addItem(it.name, it.qty, clone)) { toast('Bag too full to open this crate.', 2); return; }
  }
  for (const it of loot.items) addItem(it.name, it.qty);
  objs[t.i] = O.NONE; crateLoot.delete(t.i);
  const cx = (t.tx + 0.5) * TS;
  state.floats.push({ x: cx, y: t.ty * TS, text: loot.items.map(it => '+' + it.qty + ' ' + it.name).join('  '), color: '#ffd36b', life: 1.8 });
  burst(cx, (t.ty + 0.5) * TS, '#d6a84a', 12);
  if (loot.bp && !state.unlocked.has(loot.bp)) {
    state.unlocked.add(loot.bp);
    toast('Blueprint found: ' + BLUEPRINTS[loot.bp] + '. New recipes unlocked (C).', 6);
  }
  buildMinimap();
}

function drawStruct(st, tx, ty) {
  const x = tx * TS, y = ty * TS;
  ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(x + 1, y + 13, 14, 3);
  if (st.type === 'workbench') {
    ctx.fillStyle = '#5a3b1c'; ctx.fillRect(x + 2, y + 10, 2, 5); ctx.fillRect(x + 12, y + 10, 2, 5);
    ctx.fillStyle = '#8a5a2b'; ctx.fillRect(x + 1, y + 6, 14, 4);
    ctx.fillStyle = '#a87a45'; ctx.fillRect(x + 1, y + 6, 14, 1);
    ctx.fillStyle = '#c9ced6'; ctx.fillRect(x + 4, y + 4, 5, 2);
    ctx.fillStyle = '#8a8d94'; ctx.fillRect(x + 10, y + 4, 3, 2);
  } else if (st.type === 'forge') {
    const fl = Math.floor(state.elapsed * 6) % 3;
    ctx.fillStyle = '#55524c'; ctx.fillRect(x + 10, y, 4, 4);
    ctx.fillStyle = '#6a665f'; ctx.fillRect(x + 1, y + 3, 14, 12);
    ctx.fillStyle = '#4a4742'; ctx.fillRect(x + 1, y + 12, 14, 3);
    ctx.fillStyle = '#1c1410'; ctx.fillRect(x + 4, y + 7, 8, 6);
    ctx.fillStyle = '#f26f21'; ctx.fillRect(x + 5, y + 9 - fl, 6, 4 + fl);
    ctx.fillStyle = '#ffd36b'; ctx.fillRect(x + 7, y + 10 - fl, 2, 3 + fl);
  }
}

/* ---------- Survival, radiation and consumables ---------- */
function computeRadiation() {
  const S = CONFIG.survival;
  const inRuin = new Uint8Array(W * H);
  for (const r of ruins) {
    for (let y = r.y0 - 1; y <= r.y0 + r.h; y++) for (let x = r.x0 - 1; x <= r.x0 + r.w; x++) {
      if (x >= 0 && y >= 0 && x < W && y < H) inRuin[y * W + x] = 1;
    }
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, t = tiles[i];
    let rate = S.ambientRad;
    if (inRuin[i]) rate = S.ruinRad;
    let shore = false;
    if (t !== T.WATER) {
      for (let dy = -2; dy <= 2 && !shore; dy++) for (let dx = -2; dx <= 2; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < W && ny < H && tiles[ny * W + nx] === T.WATER) { shore = true; break; }
      }
    }
    if (shore) rate = Math.max(rate, S.shoreRad);
    for (const hs of HOT_SPOTS) {
      const d = Math.hypot(x - hs.x, y - hs.y);
      if (d < hs.r) rate = Math.max(rate, 0.9 + 0.9 * (1 - d / hs.r));
    }
    if (t === T.GRASS || t === T.SPRING) rate = S.greenRad;
    if (Math.hypot(x - BASE.x, y - BASE.y) <= S.baseZoneRadius) rate = S.baseRad;
    radMap[i] = rate;
  }
}

function updateSurvival(dt) {
  const S = CONFIG.survival, p = state.player;
  if (!S.active) return;
  const gameHours = dt * (1440 / CONFIG.time.dayLengthSec) * state.timeMult / 60;
  p.food = Math.max(0, p.food - S.foodDrainPerGameHour * gameHours);
  p.water = Math.max(0, p.water - S.waterDrainPerGameHour * gameHours);
  const tx = Math.floor(p.x / TS), ty = Math.floor(p.y / TS);
  const base = radMap[ty * W + tx] || 0;
  state.radRate = base > 0 ? base * (1 - S.radProtection) : base;
  p.radiation = Math.max(0, Math.min(100, p.radiation + state.radRate * dt));
  let dmg = 0;
  if (p.food <= 0) dmg += S.starvationDamagePerSec;
  if (p.water <= 0) dmg += S.thirstDamagePerSec;
  if (p.radiation >= 100) dmg += S.radDamagePerSec;
  if (dmg > 0) p.health -= dmg * dt;
  else if (p.food >= S.regenMinFoodWater && p.water >= S.regenMinFoodWater && p.radiation < 60) p.health = Math.min(100, p.health + S.regenPerSec * dt);
  if (p.health <= 0) {
    const why = p.radiation >= 100 ? 'radiation poisoning' : p.water <= 0 ? 'thirst' : p.food <= 0 ? 'starvation' : 'your wounds';
    die('You died of ' + why + '.');
  }
}

function drinkFrom(t) {
  const S = CONFIG.survival, p = state.player;
  state.swingCd = 0.6;
  if (p.water >= 99.5 && !t.res.dirty) { toast('You are not thirsty.', 1.5); return; }
  p.water = Math.min(100, p.water + S.drinkRestore);
  const cx = (t.tx + 0.5) * TS;
  if (t.res.dirty) {
    p.radiation = Math.min(100, p.radiation + S.drinkRadDirty);
    state.floats.push({ x: cx, y: t.ty * TS, text: '+Water  +Rad', color: '#b6e85a', life: 1.2 });
    burst(cx, (t.ty + 0.5) * TS, '#8fd04a', 6);
  } else {
    state.floats.push({ x: cx, y: t.ty * TS, text: '+Water', color: '#7ac8ff', life: 1.2 });
    burst(cx, (t.ty + 0.5) * TS, '#9fdcff', 6);
  }
}

function useItem(i) {
  const p = state.player, s = p.inventory[i];
  if (!s) return;
  const u = ITEM_USE[s.name];
  if (!u) { toast(s.name + ' cannot be used.', 1.5); return; }
  if (u.food) p.food = Math.min(100, p.food + u.food);
  if (u.water) p.water = Math.min(100, p.water + u.water);
  if (u.rad) p.radiation = Math.max(0, p.radiation + u.rad);
  s.qty -= 1;
  if (s.qty <= 0) p.inventory[i] = null;
  state.floats.push({ x: p.x, y: p.y - 14, text: 'Used ' + s.name, color: '#7fff7f', life: 1.2 });
}

function drawRadVignette() {
  const p = state.player;
  const a = Math.max(0, (p.radiation - 40) / 60) * 0.5;
  const lo = p.health < 35 ? (35 - p.health) / 35 * 0.5 : 0;
  if (a <= 0.01 && lo <= 0.01) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const w = canvas.width, h = canvas.height, r = Math.hypot(w, h) / 2;
  const g = ctx.createRadialGradient(w / 2, h / 2, r * 0.45, w / 2, h / 2, r);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(' + (lo > a ? '200,20,30' : '120,200,40') + ',' + Math.max(a, lo) + ')');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
}

function drawPlacementGhost() {
  if (!state.placing) return;
  const r = RECIPES.find(x => x.id === state.placing);
  if (!r) return;
  const tx = Math.floor(state.mwx / TS), ty = Math.floor(state.mwy / TS);
  const ok = placeValid(tx, ty);
  ctx.globalAlpha = 0.65; drawStruct({ type: r.place }, tx, ty); ctx.globalAlpha = 1;
  ctx.strokeStyle = ok ? 'rgba(127,255,127,0.95)' : 'rgba(255,90,70,0.95)'; ctx.lineWidth = 1 / scale * 1.5;
  ctx.strokeRect(tx * TS + 0.5, ty * TS + 0.5, TS - 1, TS - 1);
}

function drawCrafting(w, h) {
  const rowH = 46, pw = 440, ph = RECIPES.length * rowH + 74;
  const px = Math.round(w / 2 - pw / 2), py = Math.max(8, Math.round(h / 2 - ph / 2));
  ctx.fillStyle = 'rgba(12,10,8,0.94)'; ctx.fillRect(px, py, pw, ph);
  ctx.strokeStyle = 'rgba(233,226,212,0.35)'; ctx.lineWidth = 1; ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.font = '12px ui-monospace, Menlo, Consolas, monospace'; ctx.fillStyle = '#e9e2d4';
  ctx.fillText('Crafting', px + 14, py + 20);
  ctx.font = '10px ui-monospace, Menlo, Consolas, monospace'; ctx.fillStyle = '#b9b09d';
  ctx.textAlign = 'right';
  ctx.fillText('Blueprints found: ' + state.unlocked.size + '/' + Object.keys(BLUEPRINTS).length, px + pw - 14, py + 20);
  ctx.textAlign = 'left';
  RECIPES.forEach((r, k) => {
    const x = px + 10, y = py + 38 + k * rowH, rw = pw - 20, rh = rowH - 4;
    const st = recipeStatus(r);
    const locked = !!(r.unlock && !state.unlocked.has(r.unlock));
    const hover = mouse.x >= x && mouse.x < x + rw && mouse.y >= y && mouse.y < y + rh;
    ctx.fillStyle = st.ok ? (hover ? 'rgba(127,255,127,0.22)' : 'rgba(127,255,127,0.12)') : 'rgba(255,255,255,0.05)';
    ctx.fillRect(x, y, rw, rh);
    if (st.ok) { ctx.strokeStyle = 'rgba(127,255,127,0.6)'; ctx.strokeRect(x + 0.5, y + 0.5, rw - 1, rh - 1); }
    ctx.globalAlpha = locked ? 0.6 : 1;
    ctx.font = '12px ui-monospace, Menlo, Consolas, monospace'; ctx.fillStyle = '#e9e2d4';
    ctx.fillText(r.name, x + 10, y + 13);
    ctx.font = '10px ui-monospace, Menlo, Consolas, monospace'; ctx.fillStyle = '#b9b09d';
    ctx.textAlign = 'right'; ctx.fillText(r.station ? STATION_NAMES[r.station] : 'By hand', x + rw - 10, y + 13); ctx.textAlign = 'left';
    let cx = x + 10;
    if (locked) {
      ctx.fillStyle = '#d6a84a';
      ctx.fillText('Locked. ' + st.why + ', found in the ruins.', cx, y + 30);
    } else {
      for (const name of Object.keys(r.cost)) {
        const have = countItem(name), need = r.cost[name];
        const txt = name + ' ' + have + '/' + need + '   ';
        ctx.fillStyle = have >= need ? '#9fdc8f' : '#e07a6a';
        ctx.fillText(txt, cx, y + 30);
        cx += ctx.measureText(txt).width;
      }
      if (!st.ok && st.why !== 'Missing materials') {
        ctx.fillStyle = '#d6a84a'; ctx.textAlign = 'right';
        ctx.fillText(st.why, x + rw - 10, y + 30); ctx.textAlign = 'left';
      }
    }
    ctx.globalAlpha = 1;
    state.uiRects.push({ x, y, w: rw, h: rh, fn: () => tryCraft(r) });
  });
  ctx.font = '10px ui-monospace, Menlo, Consolas, monospace'; ctx.fillStyle = '#b9b09d';
  ctx.fillText('Stand near a station to use its recipes. C or Esc to close.', px + 14, py + ph - 14);
}

function drawDamageBar(tx, ty, d) {
  const x = tx * TS + 2, y = ty * TS - 2;
  ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(x - 1, y - 1, 14, 4);
  ctx.fillStyle = '#ffd36b'; ctx.fillRect(x, y, Math.max(0, 12 * d.hp / d.max), 2);
}

function drawEffects() {
  for (const pt of state.particles) {
    ctx.globalAlpha = Math.max(0, pt.life / 0.35);
    ctx.fillStyle = pt.color;
    ctx.fillRect(Math.round(pt.x), Math.round(pt.y), 2, 2);
  }
  ctx.globalAlpha = 1;
  ctx.font = '8px ui-monospace, Menlo, Consolas, monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const f of state.floats) {
    ctx.globalAlpha = Math.min(1, f.life);
    ctx.fillStyle = '#000000'; ctx.fillText(f.text, Math.round(f.x) + 0.5, Math.round(f.y) + 0.5);
    ctx.fillStyle = f.color; ctx.fillText(f.text, Math.round(f.x), Math.round(f.y));
  }
  ctx.globalAlpha = 1;
}

function render() {
  const p = state.player;
  const vw = canvas.width / scale, vh = canvas.height / scale;
  const worldW = W * TS, worldH = H * TS;
  let camX = worldW <= vw ? (worldW - vw) / 2 : Math.max(0, Math.min(worldW - vw, p.x - vw / 2));
  let camY = worldH <= vh ? (worldH - vh) / 2 : Math.max(0, Math.min(worldH - vh, p.y - vh / 2));
  const transX = Math.round(camX * scale), transY = Math.round(camY * scale);
  camX = transX / scale; camY = transY / scale;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#0b0908';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  ctx.setTransform(scale, 0, 0, scale, -transX, -transY);

  const tx0 = Math.max(0, Math.floor(camX / TS)), ty0 = Math.max(0, Math.floor(camY / TS));
  const tx1 = Math.min(W - 1, Math.floor((camX + vw) / TS)), ty1 = Math.min(H - 1, Math.floor((camY + vh) / TS));

  // ground layer
  for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
    const i = ty * W + tx;
    drawTile(tx, ty, tiles[i], shade[i], state.elapsed);
  }
  drawBaseMarker(state.elapsed);
  if (state.corpse) drawCorpse(state.corpse, state.elapsed);

  // aim direction toward the mouse
  const mwx = (mouse.x * dpr + transX) / scale, mwy = (mouse.y * dpr + transY) / scale;
  state.mwx = mwx; state.mwy = mwy;
  let ax = mwx - p.x, ay = mwy - p.y;
  const al = Math.hypot(ax, ay) || 1;
  p.aimX = ax / al; p.aimY = ay / al;

  // objects and player, row by row so things overlap in the right order
  const playerRow = Math.floor(p.y / TS);
  for (let ty = ty0; ty <= ty1 + 1; ty++) {
    if (ty <= ty1) for (let tx = tx0; tx <= tx1; tx++) {
      const i = ty * W + tx;
      if (objs[i]) {
        const sh = state.shake.get(i);
        if (sh) { ctx.save(); ctx.translate(Math.round(Math.sin(sh * 70)), 0); drawObject(objs[i], tx, ty, shade[i]); ctx.restore(); }
        else drawObject(objs[i], tx, ty, shade[i]);
        const dm = state.damage.get(i);
        if (dm) drawDamageBar(tx, ty, dm);
      }
      const st = structs.get(i);
      if (st) drawStruct(st, tx, ty);
    }
    if (ty === playerRow) drawPlayer(p, { x: p.aimX, y: p.aimY });
  }

  drawEffects();
  drawPlacementGhost();

  // tile under the cursor
  const mtx = Math.floor(mwx / TS), mty = Math.floor(mwy / TS);
  let mLabel = 'Out of bounds';
  if (mtx >= 0 && mty >= 0 && mtx < W && mty < H) {
    const i = mty * W + mtx;
    const tg = getTarget();
    let ring = 'rgba(255,255,255,0.75)';
    mLabel = (objs[i] ? OBJ_NAMES[objs[i]] + ' on ' : '') + TILE_NAMES[tiles[i]] + '  (' + mtx + ', ' + mty + ')';
    if (tg) {
      const need = tg.res.minTier === 0 ? 'any tool' : CONFIG.tools.names[tg.res.minTier] + ' ' + tg.res.tool;
      mLabel = tg.res.drink ? tg.res.name + (tg.res.dirty ? '  (click to drink, adds radiation)' : '  (click to drink)') : tg.res.crate ? 'Supply crate  (click to open)' : tg.res.name + ' (' + tg.res.item + ')  needs ' + need;
      ring = !tg.inReach ? 'rgba(180,180,180,0.7)' : tg.canHarvest ? 'rgba(127,255,127,0.95)' : 'rgba(255,150,60,0.95)';
    }
    ctx.strokeStyle = ring; ctx.lineWidth = 1 / scale * 1.5;
    ctx.strokeRect(mtx * TS + 0.5, mty * TS + 0.5, TS - 1, TS - 1);
  }

  drawLighting(transX, transY, darkness(clockHour()));
  drawRadVignette();
  drawHUD(mLabel);
}

/* =====================================================================
   MAIN LOOP
   ===================================================================== */
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  updateTime(dt);
  updatePlayer(dt);
  updateHarvest(dt);
  updateEffects(dt);
  updateSurvival(dt);
  if (state.msgT > 0) state.msgT -= dt;
  render();
  requestAnimationFrame(frame);
}

generate();
buildMinimap();
resize();
toast('Chunk 4: survival is live. Radiation builds outside camp, so watch the bar and head home to recover.', 7);
requestAnimationFrame(frame);
})();
