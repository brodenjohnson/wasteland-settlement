/* =====================================================================
   BASE 2: rotation, flooring and roofs, bottles and water, shared storage,
   saplings, radiation storms
   ===================================================================== */
const floors = new Uint8Array(W * H), roofs = new Uint8Array(W * H), saplings = new Map();
const FLOORBLOCK = new Set(['grass', 'dry', 'fern', 'flower', 'debris', 'reed', 'mushroom', 'log', 'bones']);
Object.assign(CONFIG.survival, { drinkRadSpring: 4, drinkRadPurified: 1.5 });
Object.assign(ITEM_COL, { 'Empty Bottle': '#cfe6ee', 'Spring Water': '#6ac0e8', 'Dirty Water': '#8aa04a', 'Purified Water': '#9fe8ff', 'Sapling': '#4f8a3a' });
Object.assign(ITEM_USE, { 'Spring Water': { water: 35, rad: 4 }, 'Dirty Water': { water: 30, rad: 15 }, 'Purified Water': { water: 45, rad: 1.5 } });
Object.assign(ITEM_DESC, {
  'Empty Bottle': 'Fill it at any water. Click water or a purifier with it selected.', 'Spring Water': 'Clean-ish. A little radiation.',
  'Dirty Water': 'Irradiated. Drinks well, hurts later.', 'Purified Water': 'The cleanest water you can get. Barely any radiation.',
  'Sapling': 'Plant on open ground. Grows into a tree in a few days.'
});
Object.assign(STATION_NAMES, { floor_wood: 'Wood Floor', floor_stone: 'Stone Floor', roof_wood: 'Wooden Roof', roof_scrap: 'Scrap Roof' });
CRAFT_TABS.splice(1, 0, 'Structure');
RECIPES.forEach(r => { if (['wall', 'scrapwall', 'gate', 'barricade'].includes(r.id)) r.cat = 'Structure'; });
RECIPES.push(
  { id: 'floor_wood', cat: 'Structure', name: 'Wood Floor', station: null, place: 'floor_wood', layer: 'floor', fl: 1, repeat: true, cost: { 'Wood': 1 }, unlock: null },
  { id: 'floor_stone', cat: 'Structure', name: 'Stone Floor', station: null, place: 'floor_stone', layer: 'floor', fl: 2, repeat: true, cost: { 'Stone': 2 }, unlock: null },
  { id: 'roof_wood', cat: 'Structure', name: 'Wooden Roof', station: null, place: 'roof_wood', layer: 'roof', rf: 1, repeat: true, cost: { 'Wood': 2 }, unlock: null },
  { id: 'roof_scrap', cat: 'Structure', name: 'Scrap Roof', station: null, place: 'roof_scrap', layer: 'roof', rf: 2, repeat: true, cost: { 'Scrap': 2, 'Wood': 1 }, unlock: null },
  { id: 'bottles', cat: 'Supplies', name: 'Empty Bottles x2', station: null, gives: { 'Empty Bottle': 2 }, cost: { 'Scrap': 3 }, unlock: null }
);
function isHotbarable(name) { return !!(TOOL_ITEMS[name] || WEAPONS[name] || CROPS[name] || ITEM_USE[name] || name === 'Sapling' || name === 'Empty Bottle'); }
{ const o = iconKind; iconKind = function (n) { return /Water$|Bottle$/.test(n) ? 'bottle' : n === 'Sapling' ? 'sapling' : o(n); }; }

/* ---------- Structures can rotate; walls connect to their neighbours ---------- */
function wallLike(j) { const s = structs.get(j); return s && (s.type === 'wall' || s.type === 'scrapwall' || s.type === 'gate' || s.type === 'guardpost') ? 1 : 0; }
function wallMask(tx, ty) { const i = ty * W + tx; return (tx > 0 && wallLike(i - 1) ? 1 : 0) | (tx + 1 < W && wallLike(i + 1) ? 2 : 0) | (ty + 1 < H && wallLike(i + W) ? 4 : 0) | (ty > 0 && wallLike(i - W) ? 8 : 0); }
function structSprite(type, rot, mask) {
  const spec = STRUCT_SPR[type];
  rot = rot || 0; mask = mask || 0;
  return makeSprite('s|' + type + '|' + rot + '|' + mask, 16, spec.h, c => {
    c.save();
    if (rot & 1) { c.translate(16, 0); c.scale(-1, 1); }
    spec.paint(c, rot >= 2, mask);
    c.restore();
  });
}
function paintWallW2(c, back, mask) {
  const L = mask & 1, Rr = mask & 2, V = (mask & 12) && !L && !Rr;
  const plank = (x, w) => { R(c, '#6b4a2b', x, 5, w, 19); R(c, '#8a6238', x, 5, 1, 19); R(c, '#4a3320', x + w - 1, 5, 1, 19); R(c, '#6b4a2b', x + 1, 3, Math.max(1, w - 2), 3); R(c, '#a07848', x + 1, 3, 1, 1); };
  plank(6, 4);
  if (L) for (let x = 0; x < 6; x += 3) plank(x, 3);
  if (Rr) for (let x = 10; x < 16; x += 3) plank(x, 3);
  const x0 = L ? 0 : 6, x1 = Rr ? 16 : 10;
  R(c, '#3b2a1c', x0, 12, x1 - x0, 2); R(c, '#3b2a1c', x0, 18, x1 - x0, 2);
  if (V) { R(c, '#8a6238', 7, 0, 2, 5); R(c, '#6b4a2b', 5, 2, 6, 3); R(c, '#a07848', 5, 2, 6, 1); }
}
function paintWallS2(c, back, mask) {
  const L = mask & 1, Rr = mask & 2;
  const panel2 = (x, w) => { R(c, '#6e7178', x, 6, w, 18); R(c, '#8a8d94', x, 6, w, 3); for (let k = x; k < x + w; k += 3) { R(c, '#a9acb3', k, 9, 1, 15); R(c, '#5a5d64', k + 2, 9, 1, 15); } };
  panel2(5, 6);
  if (L) panel2(0, 5);
  if (Rr) panel2(11, 5);
  R(c, '#a8532a', 6, 14, 3, 3); R(c, '#c4703a', 6, 14, 2, 1); R(c, '#3e4046', L ? 0 : 5, 22, (Rr ? 16 : 11) - (L ? 0 : 5), 2);
  const a = L ? 0 : 5, b = Rr ? 16 : 11;
  R(c, '#2a2a30', a, 3, b - a, 1); for (let x = a + 1; x < b; x += 4) { R(c, '#2a2a30', x, 2, 1, 2); R(c, '#c9c9cf', x, 2, 1, 1); }
}
function paintGateV(c) {
  R(c, '#3b2a1c', 5, 3, 6, 21); R(c, '#4a3320', 5, 2, 6, 3); R(c, '#7a5a30', 6, 6, 4, 18); R(c, '#9a7440', 6, 6, 1, 18);
  R(c, '#2a2a30', 6, 11, 4, 1); R(c, '#2a2a30', 6, 18, 4, 1); R(c, '#8a8d94', 9, 14, 1, 3); R(c, '#d6a84a', 9, 15, 1, 1);
}
function paintBunkV(c) {
  R(c, '#4a3320', 1, 0, 14, 20); R(c, '#6b4a2b', 2, 1, 12, 18); R(c, '#7a8a9a', 3, 6, 10, 12); R(c, '#9aaabb', 3, 6, 10, 2);
  R(c, '#e8e0d0', 4, 2, 8, 4); R(c, '#cfc6b4', 4, 5, 8, 1); R(c, '#5a6a7a', 3, 13, 10, 5); R(c, '#3a2816', 1, 19, 14, 1);
}
function paintWorkbenchBack(c) {
  R(c, '#4a3320', 2, 10, 2, 6); R(c, '#4a3320', 12, 10, 2, 6); R(c, '#6b4a2b', 2, 13, 12, 1);
  R(c, '#8a5a2b', 1, 6, 14, 5); R(c, '#a87a45', 1, 6, 14, 1); R(c, '#6b4220', 1, 10, 14, 1); R(c, '#5a5d64', 6, 3, 4, 4); R(c, '#8a8d94', 6, 3, 4, 1);
}
function paintForgeBack(c) {
  R(c, '#55524c', 10, 0, 4, 5); R(c, '#6a665f', 10, 0, 1, 5);
  R(c, '#4a4742', 1, 14, 14, 6); R(c, '#6a665f', 1, 5, 14, 11); R(c, '#7a766f', 1, 5, 14, 2); R(c, '#55524c', 1, 14, 14, 2);
  R(c, '#5a5650', 3, 8, 10, 1); R(c, '#4a463f', 3, 12, 10, 1); R(c, '#8a8d94', 4, 9, 2, 2);
}
STRUCT_SPR.wall = { h: 24, paint: paintWallW2 };
STRUCT_SPR.scrapwall = { h: 24, paint: paintWallS2 };
STRUCT_SPR.gate = { h: 24, paint: (c, back) => { if (back) paintGateV(c); else paintGate(c); } };
STRUCT_SPR.bunk = { h: 24, paint: (c, back) => { if (back) paintBunkV(c); else paintBunk(c); } };
STRUCT_SPR.chest = { h: 16, paint: (c, back) => { paintChest(c); if (back) { R(c, '#7a5a30', 6, 7, 4, 4); R(c, '#9a7440', 6, 7, 4, 1); R(c, '#8a8d94', 3, 7, 2, 2); R(c, '#8a8d94', 11, 7, 2, 2); } } };
STRUCT_SPR.workbench = { h: 16, paint: (c, back) => { if (back) paintWorkbenchBack(c); else paintWorkbench(c); } };
STRUCT_SPR.forge = { h: 20, paint: (c, back) => { if (back) paintForgeBack(c); else paintForge(c); } };
{ const o = STRUCT_SPR.purifier.paint; STRUCT_SPR.purifier = { h: 20, paint: (c, back) => { o(c); if (back) { R(c, '#5a6068', 2, 9, 12, 8); R(c, '#78808a', 2, 9, 12, 1); R(c, '#a8532a', 6, 12, 4, 1); R(c, '#3e4046', 5, 13, 6, 3); } } }; }
function newStruct(type, rot) {
  const s = { type, hp: STRUCT_HP[type], rot: rot || 0 };
  if (type === 'chest') s.slots = new Array(27).fill(null);
  if (type === 'bunk') s.owner = null;
  return s;
}

/* ---------- Floors and roofs ---------- */
function paintFloorWood(c, v) {
  const tones = ['#9a7440', '#8a6838'];
  for (let y = 0; y < 16; y += 4) { R(c, tones[((y >> 2) + v) & 1], 0, y, 16, 3); R(c, '#4a3320', 0, y + 3, 16, 1); R(c, '#4a3320', (v * 5 + y * 3) % 12 + 2, y, 1, 3); R(c, '#b08a50', 1, y, 6, 1); }
  R(c, '#6a4a28', 3 + v, 5, 2, 1);
}
function paintFloorStone(c, v) {
  R(c, '#7a7a78', 0, 0, 16, 16); R(c, '#8a8a88', 0, 0, 16, 7); R(c, '#4a4a48', 0, 7, 16, 1); R(c, '#4a4a48', 0, 15, 16, 1);
  R(c, '#4a4a48', v % 2 ? 4 : 10, 0, 1, 7); R(c, '#4a4a48', v % 2 ? 11 : 3, 8, 1, 7);
  R(c, '#9a9a98', 1, 1, 4, 1); R(c, '#9a9a98', 9, 9, 4, 1); R(c, '#686866', 6 + v, 4, 2, 1);
}
function floorSprite(kind, v) { return makeSprite('f|' + kind + '|' + v, 16, 16, c => (kind === 'wood' ? paintFloorWood : paintFloorStone)(c, v), false); }
function drawFloorTile(i, tx, ty) {
  const v = Math.floor(hash2(tx, ty, 91) * 4);
  ctx.drawImage(floorSprite(floors[i] === 1 ? 'wood' : 'stone', v), tx * TS - 1, ty * TS - 1);
}
function paintRoof(c, v, mask, scrap) {
  const base = scrap ? ['#6e7178', '#7a7d84', '#60636a'] : ['#8a4a32', '#9a5638', '#7a3e2a'];
  const L = mask & 1, Rr = mask & 2, D = mask & 4, U = mask & 8;
  for (let y = 0; y < 16; y += 3) {
    R(c, base[((y / 3 | 0) + v) % 3], 0, y, 16, 3); R(c, shade(base[0], -30), 0, y + 2, 16, 1);
    const off = ((y / 3 | 0) % 2) * 4; for (let x = off; x < 16; x += 8) R(c, shade(base[1], 14), x, y, 1, 3);
  }
  if (!U) R(c, shade(base[1], 34), 0, 0, 16, 2);
  if (!D) { R(c, shade(base[2], -34), 0, 13, 16, 3); R(c, 'rgba(0,0,0,0.3)', 0, 15, 16, 1); }
  if (!L) R(c, shade(base[2], -30), 0, 0, 1, 16);
  if (!Rr) R(c, shade(base[2], -30), 15, 0, 1, 16);
}
function roofSprite(kind, mask, v) { return makeSprite('r|' + kind + '|' + mask + '|' + v, 16, 16, c => paintRoof(c, v, mask, kind === 2), false); }
function roofMask(tx, ty) { const i = ty * W + tx; return (tx > 0 && roofs[i - 1] ? 1 : 0) | (tx + 1 < W && roofs[i + 1] ? 2 : 0) | (ty + 1 < H && roofs[i + W] ? 4 : 0) | (ty > 0 && roofs[i - W] ? 8 : 0); }
STRUCT_SPR.floor_wood = { h: 16, paint: c => paintFloorWood(c, 0) };
STRUCT_SPR.floor_stone = { h: 16, paint: c => paintFloorStone(c, 0) };
STRUCT_SPR.roof_wood = { h: 16, paint: c => paintRoof(c, 0, 15, false) };
STRUCT_SPR.roof_scrap = { h: 16, paint: c => paintRoof(c, 0, 15, true) };
let roofRegion = new Set(), roofFade = 0, lastRoofTile = -1;
function floodRoof(start) {
  const set = new Set([start]), q = [start];
  while (q.length && set.size < 800) { const c = q.pop(); for (const n of [c - 1, c + 1, c - W, c + W]) if (n >= 0 && n < W * H && roofs[n] && !set.has(n)) { set.add(n); q.push(n); } }
  return set;
}
function updateRoofFade(dt) {
  const p = state.player, pi = Math.floor(p.y / TS) * W + Math.floor(p.x / TS), inside = roofs[pi] > 0;
  if (inside && pi !== lastRoofTile) { lastRoofTile = pi; if (!roofRegion.has(pi)) roofRegion = floodRoof(pi); }
  if (!inside) lastRoofTile = -1;
  roofFade += ((inside ? 1 : 0) - roofFade) * Math.min(1, dt * 6);
  if (!inside && roofFade < 0.02) { roofRegion = new Set(); roofFade = 0; }
}
function drawRoofs(camX, camY, vw, vh) {
  const tx0 = Math.max(0, Math.floor(camX / TS) - 1), tx1 = Math.min(W - 1, Math.floor((camX + vw) / TS) + 1);
  const ty0 = Math.max(0, Math.floor(camY / TS)), ty1 = Math.min(H - 1, Math.floor((camY + vh) / TS) + 2);
  for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
    const i = ty * W + tx;
    if (!roofs[i]) continue;
    ctx.globalAlpha = roofRegion.has(i) ? 1 - 0.9 * roofFade : 1;
    ctx.drawImage(roofSprite(roofs[i], roofMask(tx, ty), Math.floor(hash2(tx, ty, 92) * 3)), tx * TS - 1, ty * TS - 11);
  }
  ctx.globalAlpha = 1;
}

/* ---------- Placement, now with rotation, floors and roofs ---------- */
function waterAdjacent(tx, ty) {
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const x = tx + dx, y = ty + dy; if (x >= 0 && y >= 0 && x < W && y < H) { const t = tiles[y * W + x]; if (t === T.WATER || t === T.SPRING) return true; } }
  return false;
}
function placeValid(tx, ty) {
  if (tx < 1 || ty < 1 || tx >= W - 1 || ty >= H - 1) return false;
  const i = ty * W + tx, t = tiles[i], p = state.player;
  const r = RECIPES.find(q => q.id === state.placing);
  if (t === T.WATER || t === T.SPRING || t === T.RUBBLE || t === T.CLIFF) return false;
  const dx = (tx + 0.5) * TS - p.x, dy = (ty + 0.5) * TS - p.y;
  if (Math.hypot(dx, dy) > 96) return false;
  if (r && r.layer === 'floor') return !objs[i] && !tilled[i] && !crops.has(i) && !floors[i] && !saplings.has(i);
  if (r && r.layer === 'roof') return !roofs[i];
  if (objs[i] || structs.has(i) || saplings.has(i)) return false;
  if (Math.abs(dx) < 14 && Math.abs(dy) < 14) return false;
  if (r && r.place === 'purifier' && !waterAdjacent(tx, ty)) return false;
  return true;
}
function tryPlace() {
  const r = RECIPES.find(x => x.id === state.placing);
  if (!r) { state.placing = null; return; }
  const tx = Math.floor(state.mwx / TS), ty = Math.floor(state.mwy / TS), i = ty * W + tx;
  if (!placeValid(tx, ty)) { toast(r.place === 'purifier' ? 'The purifier has to be built right next to water.' : 'Cannot place that here. Pick a clear tile close to you.', 2.2); return; }
  if (!canAfford(r.cost)) { toast('Missing materials.', 2); state.placing = null; return; }
  takeItems(r.cost);
  if (r.layer === 'floor') floors[i] = r.fl;
  else if (r.layer === 'roof') roofs[i] = r.rf;
  else structs.set(i, newStruct(r.place, state.placeRot));
  sfx('place');
  if (!r.repeat || !canAfford(r.cost)) { state.placing = null; toast(r.name + ' placed.', 2.5); }
}
function updatePlaceDrag() {
  if (!state.placing || !mouse.down) return;
  const r = RECIPES.find(q => q.id === state.placing);
  if (!r || !r.repeat) return;
  const ti = Math.floor(state.mwy / TS) * W + Math.floor(state.mwx / TS);
  if (ti !== state.lastPlaceTile) { state.lastPlaceTile = ti; tryPlace(); }
}
function drawPlacementGhost() {
  if (!state.placing) return;
  const r = RECIPES.find(x => x.id === state.placing);
  if (!r) return;
  const tx = Math.floor(state.mwx / TS), ty = Math.floor(state.mwy / TS);
  const ok = placeValid(tx, ty);
  ctx.globalAlpha = 0.65;
  if (r.layer === 'roof') ctx.drawImage(roofSprite(r.rf, roofMask(tx, ty), 0), tx * TS - 1, ty * TS - 11);
  else if (r.layer === 'floor') ctx.drawImage(floorSprite(r.fl === 1 ? 'wood' : 'stone', 0), tx * TS - 1, ty * TS - 1);
  else drawStruct({ type: r.place, rot: state.placeRot }, tx, ty);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = ok ? 'rgba(127,255,127,0.95)' : 'rgba(255,90,70,0.95)'; ctx.lineWidth = 1 / scale * 1.5;
  ctx.strokeRect(tx * TS + 0.5, ty * TS + 0.5, TS - 1, TS - 1);
}
function refundDrops(recipeId, cx, cy) {
  const r = RECIPES.find(q => q.id === recipeId);
  if (r) for (const k of Object.keys(r.cost)) { const q = Math.floor(r.cost[k] * 0.6); if (q > 0) state.drops.push({ x: cx + (Math.random() - 0.5) * 8, y: cy + 4, name: k, qty: q, t: 0 }); }
}
function deconstruct(i) {
  const st = structs.get(i);
  if (!st) return;
  const r = RECIPES.find(q => q.place === st.type);
  const cx = ((i % W) + 0.5) * TS, cy = (Math.floor(i / W) + 0.5) * TS;
  if (r) refundDrops(r.id, cx, cy);
  if (st.slots) for (const s of st.slots) if (s) state.drops.push({ x: cx + (Math.random() - 0.5) * 10, y: cy + 5, name: s.name, qty: s.qty, t: 0 });
  if (st.type === 'bunk' && st.owner !== null) { const s = settlers.find(q => q.id === st.owner); if (s) s.bed = null; }
  structs.delete(i);
  if (state.chestOpen === i) state.chestOpen = null;
  burst(cx, cy, '#8a6a4a', 8); sfx('break');
  toast('Deconstructed ' + STATION_NAMES[st.type] + '. Some materials dropped.', 2.5);
}
function tryDeconstruct() {
  const tx = Math.floor(state.mwx / TS), ty = Math.floor(state.mwy / TS), i = ty * W + tx, p = state.player;
  if (Math.hypot((tx + 0.5) * TS - p.x, (ty + 0.5) * TS - p.y) > 64) { toast('Too far away.', 1.5); return; }
  const cx = (tx + 0.5) * TS, cy = (ty + 0.5) * TS;
  if (structs.has(i)) deconstruct(i);
  else if (roofs[i]) { refundDrops(roofs[i] === 1 ? 'roof_wood' : 'roof_scrap', cx, cy); roofs[i] = 0; sfx('break'); }
  else if (floors[i]) { refundDrops(floors[i] === 1 ? 'floor_wood' : 'floor_stone', cx, cy); floors[i] = 0; sfx('break'); }
  else toast('Hover a structure, floor or roof within reach and press X to remove it.', 2.5);
}

/* ---------- Anything in your chests counts while you are inside the valley ---------- */
function inBase() { const p = state.player; return Math.hypot(p.x / TS - BASE.x, p.y / TS - BASE.y) < 22.5; }
function countItem(name) {
  let n = 0;
  for (const s of state.player.inventory) if (s && s.name === name) n += s.qty;
  if (inBase()) n += chestCount(name);
  return n;
}
function takeItems(cost) {
  const inv = state.player.inventory;
  for (const name of Object.keys(cost)) {
    let need = cost[name];
    for (let i = 0; i < inv.length && need > 0; i++) {
      const s = inv[i];
      if (s && s.name === name) { const n = Math.min(s.qty, need); s.qty -= n; need -= n; if (s.qty <= 0) inv[i] = null; }
    }
    if (need > 0 && inBase()) chestTake(name, need);
  }
}
function tryCraft(r) {
  const st = recipeStatus(r);
  if (!st.ok) { toast(st.why + '.', 2); return; }
  if (r.place) {
    state.placing = r.id; state.craftOpen = false; state.placeRot = 0;
    toast('Click to place the ' + r.name + '. R rotates, right-click or Esc cancels.', 5);
    return;
  }
  for (const k of Object.keys(r.gives)) if (!spaceFor(k, r.gives[k])) { toast('Bag full.', 2); return; }
  takeItems(r.cost);
  for (const k of Object.keys(r.gives)) addItem(k, r.gives[k]);
  sfx('craft');
  state.floats.push({ x: state.player.x, y: state.player.y - 14, text: 'Crafted ' + r.name, color: '#7fff7f', life: 1.4 });
}

/* ---------- Water is never free of radiation, but some is much cleaner ---------- */
function drinkFrom(t) {
  const S = CONFIG.survival, p = state.player;
  state.actCd = 0.6;
  const rad = t.res.dirty ? S.drinkRadDirty : S.drinkRadSpring;
  if (p.water >= 99.5 && !t.res.dirty) { toast('You are not thirsty.', 1.5); return; }
  p.water = Math.min(100, p.water + S.drinkRestore);
  p.radiation = Math.min(100, p.radiation + rad);
  const cx = (t.tx + 0.5) * TS;
  state.floats.push({ x: cx, y: t.ty * TS, text: '+Water  +' + rad + ' Rad', color: t.res.dirty ? '#b6e85a' : '#7ac8ff', life: 1.2 });
  burst(cx, (t.ty + 0.5) * TS, t.res.dirty ? '#8fd04a' : '#9fdcff', 6);
}
function drinkPurified(t) {
  const p = state.player, S = CONFIG.survival;
  state.actCd = 0.6;
  if (p.water >= 99.5) { toast('You are not thirsty.', 1.5); return; }
  p.water = Math.min(100, p.water + S.drinkRestore);
  p.radiation = Math.min(100, p.radiation + S.drinkRadPurified);
  sfx('drink');
  state.floats.push({ x: (t.tx + 0.5) * TS, y: t.ty * TS, text: '+Water  +' + S.drinkRadPurified + ' Rad', color: '#9fe8ff', life: 1.2 });
}
function fillBottle(name) {
  const p = state.player, s = selItem();
  if (!s || s.name !== 'Empty Bottle') return;
  state.actCd = 0.45;
  if (!spaceFor(name, 1) && s.qty > 1) { toast('Bag full.', 1.5); return; }
  s.qty -= 1; if (s.qty <= 0) p.inventory[state.sel] = null;
  addItem(name, 1);
  sfx('drink');
  state.floats.push({ x: p.x, y: p.y - 16, text: '+1 ' + name, color: '#9fe8ff', life: 1.2 });
}
{ const o = useItem; useItem = function (i) {
  const s = state.player.inventory[i], nm = s && s.name, q = s ? s.qty : 0;
  o(i);
  const s2 = state.player.inventory[i];
  if (nm && ITEM_USE[nm] && (!s2 || s2.name !== nm || s2.qty < q)) {
    if (/Water$/.test(nm)) { sfx('drink'); addItem('Empty Bottle', 1); } else sfx('eat');
  }
}; }

/* ---------- Saplings: trees come back ---------- */
function saplingOk(tx, ty) {
  if (tx < 2 || ty < 2 || tx >= W - 2 || ty >= H - 2) return false;
  const i = ty * W + tx, t = tiles[i];
  return (t === T.GROUND || t === T.GRASS || t === T.DIRT || t === T.ASH) && !objs[i] && !structs.has(i) && !crops.has(i) && !saplings.has(i) && !tilled[i] && !floors[i] && !reserved[i];
}
function plantSapling(i) { saplings.set(i, { age: 0 }); }
function paintSapling(c, age) {
  if (age < 2) { R(c, '#5a3a22', 7, 11, 2, 3); R(c, '#3f7a3c', 5, 8, 3, 3); R(c, '#5fae4a', 8, 7, 3, 3); R(c, '#86cc66', 6, 8, 1, 1); }
  else { R(c, '#5a3a22', 7, 8, 2, 7); R(c, '#3f7a3c', 3, 5, 5, 4); R(c, '#5fae4a', 8, 3, 5, 5); R(c, '#86cc66', 4, 5, 2, 2); R(c, '#3f7a3c', 6, 1, 4, 5); R(c, '#86cc66', 9, 4, 2, 1); }
}
function drawSapling(sp, tx, ty) { ctx.drawImage(makeSprite('sp|' + (sp.age >= 2 ? 1 : 0), 16, 16, c => paintSapling(c, sp.age)), tx * TS - 1, ty * TS - 1); }
function growSaplings() {
  let grown = 0;
  for (const [i, sp] of saplings) {
    sp.age += 1;
    if (sp.age >= 3 && !objs[i] && !structs.has(i)) { objs[i] = tiles[i] === T.GRASS ? O.PINE : O.TREE; saplings.delete(i); grown++; }
  }
  if (grown) buildMinimap();
}
{ const o = newDayTick; newDayTick = function () { o(); growSaplings(); }; }

/* ---------- Radiation storms: rare, harsh, and they reshuffle the wasteland ---------- */
function stormRadAt() {
  const I = state.stormI;
  if (I < 0.05) return 0;
  const p = state.player, i = Math.floor(p.y / TS) * W + Math.floor(p.x / TS);
  if (roofs[i]) return 0;
  return 1.8 * I * (1 - armourStats().rad);
}
function updateStorm(dt) {
  const day = clockDay(), h = clockHour(), st = state.storm;
  state.flashT = Math.max(0, state.flashT - dt);
  if (!st) {
    state.stormI = Math.max(0, state.stormI - dt * 0.3);
    if (day >= state.nextStormDay && h >= 9 && h < 16 && !state.sleeping && !state.raid) {
      state.storm = { phase: 'warn', t: 0 };
      toast('Dark clouds roll in. A radiation storm is coming. Get under a roof!', 7); sfx('thunder');
    }
    return;
  }
  st.t += dt;
  const target = st.phase === 'warn' ? Math.min(0.4, st.t / 30) : st.phase === 'active' ? 1 : 0;
  state.stormI += (target - state.stormI) * Math.min(1, dt * (st.phase === 'pass' ? 0.5 : 0.8));
  if (st.phase === 'warn' && st.t > 14) { st.phase = 'active'; st.t = 0; toast('RADIATION STORM. Stay under cover.', 5); }
  else if (st.phase === 'active' && st.t > 45) { st.phase = 'pass'; st.t = 0; toast('The storm is passing...', 4); }
  else if (st.phase === 'pass' && st.t > 10) { state.storm = null; state.nextStormDay = day + 3 + Math.floor(Math.random() * 3); stormAftermath(); }
  if (state.stormI > 0.5 && Math.random() < dt * 0.2) { state.flashT = 0.22; sfx('thunder'); }
}
function stormAftermath() {
  let made = 0, crates = 0;
  for (let n = 0; n < 1200 && made < 70; n++) {
    const x = 3 + Math.floor(Math.random() * (W - 6)), y = 3 + Math.floor(Math.random() * (H - 6)), i = y * W + x;
    if (reserved[i] || objs[i] || structs.has(i) || floors[i] || tilled[i] || crops.has(i) || saplings.has(i)) continue;
    const z = zoneMap[i], t = tiles[i];
    if (Math.hypot(x - BASE.x, y - BASE.y) < 7) continue;
    if (z === 1 && made > 14) continue;
    let kind = 0; const r = Math.random();
    if (t === T.GROUND || t === T.ASH) kind = r < 0.5 ? O.ROCK : r < 0.88 ? O.SCRAP : ((z === 3 || z === 6 || z === 0) ? O.ORE : O.ROCK);
    else if (t === T.GRASS) kind = r < 0.65 ? O.BUSH : O.ROCK;
    if (!kind) continue;
    objs[i] = kind; made++;
  }
  for (let n = 0; n < 300 && crates < 2; n++) {
    const x = 4 + Math.floor(Math.random() * (W - 8)), y = 4 + Math.floor(Math.random() * (H - 8)), i = y * W + x;
    if (reserved[i] || objs[i] || zoneMap[i] === 1 || (tiles[i] !== T.GROUND && tiles[i] !== T.ASH)) continue;
    objs[i] = O.CRATE; crateLoot.set(i, rollLoot(Math.random, false)); crates++;
  }
  buildMinimap();
  toast('The storm has passed. New rocks, scrap and supplies litter the wasteland.', 6);
}
function drawStorm() {
  const I = state.stormI;
  if (I < 0.02 && state.flashT <= 0) return;
  const W2 = canvas.width, H2 = canvas.height;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (I >= 0.02) {
    ctx.fillStyle = 'rgba(70,100,46,' + (0.3 * I) + ')'; ctx.fillRect(0, 0, W2, H2);
    ctx.strokeStyle = 'rgba(200,255,150,' + (0.22 * I) + ')'; ctx.lineWidth = Math.max(1, dpr);
    ctx.beginPath();
    for (let k = 0; k < 70; k++) {
      const sp = 500 + hash2(k, 1, 5) * 400, x = ((hash2(k, 2, 6) * W2 * 1.4 + state.elapsed * sp) % (W2 * 1.4)) - W2 * 0.2, y = ((hash2(k, 3, 7) * H2 + state.elapsed * sp * 0.5) % H2);
      ctx.moveTo(x, y); ctx.lineTo(x - 26 * dpr, y - 11 * dpr);
    }
    ctx.stroke();
  }
  if (state.flashT > 0) { ctx.fillStyle = 'rgba(220,255,210,' + (state.flashT * 2.2) + ')'; ctx.fillRect(0, 0, W2, H2); }
}

/* a few small hooks used by patches */
function stepKind() { const p = state.player, i = Math.floor(p.y / TS) * W + Math.floor(p.x / TS); return floors[i] ? 'floor' : tiles[i]; }

