/* =====================================================================
   AF_FARM: crop tiers, farming and cooking perks, new dishes, a drying rack,
   buried pipes and sprinklers, more floors and a thatch roof
   ===================================================================== */
const buried = new Uint8Array(W * H); MAP_ARR.buried = buried;

/* ---------- Crops by tier ---------- */
Object.assign(CROPS, {
  'Corn Seeds': { id: 'corn', produce: 'Corn', days: 7, regrow: 0, col: '#e8c24a', tier: 2, lvl: 3 },
  'Bean Seeds': { id: 'beans', produce: 'Beans', days: 5, regrow: 2, col: '#6a8a3a', tier: 2, lvl: 3 },
  'Pumpkin Seeds': { id: 'pumpkin', produce: 'Pumpkin', days: 9, regrow: 0, col: '#e8803a', tier: 3, lvl: 5, yield: 2 },
  'Glowmelon Seeds': { id: 'glowmelon', produce: 'Glowmelon', days: 10, regrow: 0, col: '#9be870', tier: 3, lvl: 5 },
  'Healroot Seeds': { id: 'healroot', produce: 'Healroot', days: 12, regrow: 3, col: '#7fc8a8', tier: 4, lvl: 7 }
});
for (const k of ['Radish Seeds', 'Potato Seeds', 'Tomato Seeds']) { CROPS[k].tier = k === 'Tomato Seeds' ? 2 : 1; CROPS[k].lvl = k === 'Tomato Seeds' ? 2 : 1; }
Object.assign(ITEM_COL, { 'Corn': '#e8c24a', 'Beans': '#6a8a3a', 'Pumpkin': '#e8803a', 'Glowmelon': '#9be870', 'Healroot': '#7fc8a8', 'Corn Seeds': '#c8a83a', 'Bean Seeds': '#7a9a4a', 'Pumpkin Seeds': '#c8803a', 'Glowmelon Seeds': '#7fc860', 'Healroot Seeds': '#6aa88a',
  'Roast Corn': '#e8b040', 'Bean Mash': '#a8804a', 'Corn Chowder': '#e8d070', 'Pumpkin Stew': '#e8803a', 'Melon Juice': '#b8f090', 'Healroot Tonic': '#8ae0b8', 'Jerky': '#8a4a32', 'Dried Fish': '#b8a070' });
Object.assign(ITEM_USE, { 'Corn': { food: 10 }, 'Beans': { food: 7 }, 'Pumpkin': { food: 14 }, 'Glowmelon': { food: 5, water: 20, rad: 5 }, 'Healroot': { food: 2, heal: 6 },
  'Roast Corn': { food: 26 }, 'Bean Mash': { food: 30 }, 'Corn Chowder': { food: 58 }, 'Pumpkin Stew': { food: 74, heal: 8 }, 'Melon Juice': { water: 32, rad: -12 }, 'Healroot Tonic': { heal: 40, rad: -25 }, 'Jerky': { food: 34 }, 'Dried Fish': { food: 30 } });
Object.assign(FOOD_BUFFS, { 'Roast Corn': [['rush', 120]], 'Bean Mash': [['warm', 150]], 'Corn Chowder': [['hearty', 300], ['warm', 300]], 'Pumpkin Stew': [['hearty', 300], ['mend', 200]], 'Melon Juice': [['ward', 150]], 'Healroot Tonic': [['mend', 180], ['broth', 150]], 'Jerky': [['warm', 180]], 'Dried Fish': [['hearty', 150]] });
for (const n of ['Roast Corn', 'Bean Mash', 'Corn Chowder', 'Pumpkin Stew', 'Melon Juice', 'Healroot Tonic', 'Jerky', 'Dried Fish']) ITEM_DESC[n] = (ITEM_DESC[n] || '') + '  Buff: ' + FOOD_BUFFS[n].map(([b, s]) => BUFFS[b].name + ' (' + BUFFS[b].text + ', ' + Math.round(s / 60 * 10) / 10 + ' min)').join(', ');
Object.assign(ITEM_DESC, { 'Corn': 'Sweet, filling and worth growing for the chowder.', 'Beans': 'Regrows if you leave the plant alone. Mash them or stew them.', 'Pumpkin': 'Heavy, slow and worth the wait. Each plant gives two.', 'Glowmelon': 'Faintly radioactive and very wet. Juice it to take the sting out.', 'Healroot': 'A bitter root that closes cuts. The base of a good tonic.',
  'Corn Seeds': 'Needs Farming level 3.', 'Bean Seeds': 'Needs Farming level 3. Regrows.', 'Pumpkin Seeds': 'Needs Farming level 5. Two pumpkins per plant.', 'Glowmelon Seeds': 'Needs Farming level 5.', 'Healroot Seeds': 'Needs Farming level 7. Regrows.',
  'Jerky': 'Dried meat. Keeps for ever and has no radiation.', 'Dried Fish': 'Salted and dried. Keeps for ever.' });
Object.assign(VALUE, { 'Corn': 11, 'Beans': 8, 'Pumpkin': 22, 'Glowmelon': 26, 'Healroot': 40, 'Corn Seeds': 6, 'Bean Seeds': 5, 'Pumpkin Seeds': 12, 'Glowmelon Seeds': 14, 'Healroot Seeds': 22,
  'Roast Corn': 20, 'Bean Mash': 18, 'Corn Chowder': 44, 'Pumpkin Stew': 58, 'Melon Juice': 36, 'Healroot Tonic': 70, 'Jerky': 24, 'Dried Fish': 22 });
for (const k of Object.keys(VALUE)) if (CROPS[k] || ITEM_USE[k]) ITEM_STACK[k] = ITEM_STACK[k] || 30;

/* ---------- Farming and cooking perks ---------- */
const FARM_PRODUCE = new Set(Object.values(CROPS).map(c => c.produce));
const COOKED = new Set(Object.keys(FOOD_BUFFS));
{ const o = itemValue; itemValue = function (name) {
  let v = o(name);
  if (FARM_PRODUCE.has(name) && skillLevel('farming') >= 8) v = Math.round(v * 1.15);
  if (COOKED.has(name) && skillLevel('cooking') >= 7) v = Math.round(v * 1.2);
  return v;
}; }
{ const o = addBuff; addBuff = function (id, secs) { o(id, secs * (1 + 0.05 * (skillLevel('cooking') - 1))); }; }
SKILLS.farming.perk = l => Math.round((l - 1) * 10) + '% extra harvest' + (l >= 4 ? ', +1 seed' : '') + (l >= 6 ? ', hardy crops' : '') + (l >= 8 ? ', market eye' : '') ;
SKILLS.cooking.perk = l => Math.round((l - 1) * 8) + '% extra serving, meal buffs last ' + Math.round((l - 1) * 5) + '% longer' + (l >= 7 ? ', chef\u2019s cut (+20% sale value)' : '');
Object.assign(DBG, { FARM_PRODUCE, COOKED });

/* ---------- Dishes and the drying rack ---------- */
Object.assign(STRUCT_HP, { rack: 70, sprinkler: 60 }); Object.assign(STATION_NAMES, { rack: 'Drying Rack', sprinkler: 'Sprinkler', pipe_buried: 'Buried Pipe', floor_tile: 'Tile Floor', floor_concrete: 'Concrete Floor', floor_carpet: 'Carpet', roof_thatch: 'Thatch Roof' });
NONSOLID.add('pipe_buried');
const mk = (id, cat, name, station, cost, gives, tier, skill) => { const r = rc(id, cat, name, station, cost, Object.assign({ gives, tier }, skill ? { skill } : {})); return r; };
mk('cook_corn', 'Cooking', 'Roast Corn', 'campfire', { 'Corn': 1 }, { 'Roast Corn': 1 }, 1);
mk('cook_beans', 'Cooking', 'Bean Mash', 'campfire', { 'Beans': 2 }, { 'Bean Mash': 1 }, 1);
mk('cook_chowder', 'Cooking', 'Corn Chowder', 'stove', { 'Corn': 2, 'Potato': 1 }, { 'Corn Chowder': 1 }, 2, ['cooking', 3]);
mk('cook_pumpkin', 'Cooking', 'Pumpkin Stew', 'stove', { 'Pumpkin': 1, 'Potato': 1, 'Beans': 1 }, { 'Pumpkin Stew': 1 }, 3, ['cooking', 4]);
mk('cook_melon', 'Cooking', 'Melon Juice', 'stove', { 'Glowmelon': 1, 'Empty Bottle': 1 }, { 'Melon Juice': 1 }, 3, ['cooking', 4]);
mk('cook_tonic', 'Cooking', 'Healroot Tonic', 'stove', { 'Healroot': 2, 'Empty Bottle': 1 }, { 'Healroot Tonic': 1 }, 4, ['cooking', 6]);
mk('cook_jerky', 'Cooking', 'Jerky', 'rack', { 'Raw Meat': 2 }, { 'Jerky': 2 }, 2);
mk('cook_dried', 'Cooking', 'Dried Fish', 'rack', { 'Raw Fish': 2 }, { 'Dried Fish': 1 }, 2);
rc('rack', 'Build', 'Drying Rack', 'workbench', { 'Wood': 6, 'Scrap': 4 }, { place: 'rack', tier: 2 });
rc('sprinkler', 'Build', 'Sprinkler', 'workbench', { 'Metal plate': 2, 'Scrap': 6 }, { place: 'sprinkler', tier: 3, skill: ['crafting', 4] });
rc('pipe_buried', 'Build', 'Buried Pipe', 'workbench', { 'Scrap': 2 }, { place: 'pipe_buried', layer: 'buried', repeat: true, tier: 3, skill: ['crafting', 4] });
rc('floor_tile', 'Structure', 'Tile Floor', null, { 'Stone': 2, 'Scrap': 1 }, { place: 'floor_tile', layer: 'floor', fl: 3, repeat: true, tier: 2 });
rc('floor_concrete', 'Structure', 'Concrete Floor', null, { 'Stone': 3 }, { place: 'floor_concrete', layer: 'floor', fl: 4, repeat: true, tier: 2 });
rc('floor_carpet', 'Structure', 'Carpet', null, { 'Cloth': 2 }, { place: 'floor_carpet', layer: 'floor', fl: 5, repeat: true, tier: 1 });
rc('roof_thatch', 'Structure', 'Thatch Roof', null, { 'Wood': 1, 'Cloth': 1 }, { place: 'roof_thatch', layer: 'roof', rf: 3, repeat: true, tier: 1 });
Object.assign(RECIPE_DESC, { rack: 'Hang meat and fish here to dry. Dried food keeps for ever and carries no radiation.', sprinkler: 'Waters every tilled tile within three tiles. Connect it to a purifier with pipes and it never runs dry.', pipe_buried: 'A pipe that runs underground, so it can pass under walls, floors and whole buildings. Joins up with surface pipes.',
  floor_tile: 'Checkerboard tile. Easy to keep clean.', floor_concrete: 'Poured grey concrete with expansion seams.', floor_carpet: 'A faded red carpet. It makes a room feel like a room.', roof_thatch: 'Bundled straw. Cheap, light and surprisingly dry.' });
['rack', 'sprinkler'].forEach(id => { const r = RECIPES.find(q => q.id === id); KIT_BY_NAME['Kit: ' + r.name] = r; ITEM_COL['Kit: ' + r.name] = '#c8a062'; ITEM_DESC['Kit: ' + r.name] = 'A packed up ' + r.name + '. Put it on the hotbar, then click to set it down.'; ITEM_STACK['Kit: ' + r.name] = 1; });
STRUCT_SPR.rack = { h: 16, paint: c => { R(c, '#6b4a2b', 2, 4, 2, 11); R(c, '#6b4a2b', 12, 4, 2, 11); R(c, '#8a6a3b', 2, 4, 12, 2); R(c, '#8a6a3b', 3, 9, 10, 1); R(c, '#8a4a32', 4, 6, 2, 5); R(c, '#9a5638', 7, 6, 2, 4); R(c, '#7a3e2a', 10, 6, 2, 5); R(c, '#3a2a1a', 2, 14, 12, 1); } };
STRUCT_SPR.sprinkler = { h: 16, paint: c => { R(c, '#3a3d44', 5, 13, 6, 2); R(c, '#5a5d64', 7, 6, 2, 8); R(c, '#8a8d94', 5, 4, 6, 3); R(c, '#c8c8d0', 5, 4, 6, 1); R(c, '#7ac8ff', 7, 2, 2, 1); R(c, '#7ac8ff', 3, 3, 1, 1); R(c, '#7ac8ff', 12, 3, 1, 1); } };
STRUCT_SPR.pipe_buried = { h: 16, paint: c => { R(c, 'rgba(110,150,180,0.8)', 0, 6, 16, 4); R(c, 'rgba(170,200,225,0.9)', 0, 6, 16, 1); R(c, 'rgba(60,90,120,0.9)', 0, 9, 16, 1); R(c, 'rgba(60,90,120,0.9)', 7, 5, 2, 6); } };
const FLOOR_KINDS = [null, 'wood', 'stone', 'tile', 'concrete', 'carpet'], FLOOR_REC = [null, 'floor_wood', 'floor_stone', 'floor_tile', 'floor_concrete', 'floor_carpet'], ROOF_REC = [null, 'roof_wood', 'roof_scrap', 'roof_thatch'];
function paintFloorTile(c, v) { for (let y = 0; y < 16; y += 4) for (let x = 0; x < 16; x += 4) R(c, ((x + y) / 4 + v) % 2 ? '#8a8d84' : '#a8aaa0', x, y, 4, 4); R(c, 'rgba(0,0,0,0.18)', 0, 15, 16, 1); R(c, 'rgba(0,0,0,0.18)', 15, 0, 1, 16); }
function paintFloorConcrete(c, v) { R(c, '#7d7f80', 0, 0, 16, 16); R(c, '#8a8c8c', 0, 0, 16, 1); R(c, '#6a6c6e', 0, 15, 16, 1); R(c, '#6a6c6e', 7 + (v % 2), 0, 1, 16); for (let k = 0; k < 4; k++) R(c, '#74767a', (k * 5 + v * 3) % 15, (k * 7 + v * 2) % 15, 2, 1); }
function paintFloorCarpet(c, v) { R(c, '#7a2e30', 0, 0, 16, 16); R(c, '#8a3a3a', 1, 1, 14, 14); R(c, '#a8803a', 1, 1, 14, 1); R(c, '#a8803a', 1, 14, 14, 1); R(c, '#a8803a', 1, 1, 1, 14); R(c, '#a8803a', 14, 1, 1, 14); R(c, '#6a2428', 4, 4, 8, 8); R(c, '#a8803a', 7, 7, 2, 2); }
const FLOOR_PAINT = { wood: paintFloorWood, stone: paintFloorStone, tile: paintFloorTile, concrete: paintFloorConcrete, carpet: paintFloorCarpet };
STRUCT_SPR.floor_tile = { h: 16, paint: c => paintFloorTile(c, 0) }; STRUCT_SPR.floor_concrete = { h: 16, paint: c => paintFloorConcrete(c, 0) }; STRUCT_SPR.floor_carpet = { h: 16, paint: c => paintFloorCarpet(c, 0) };
STRUCT_SPR.roof_thatch = { h: 16, paint: c => paintRoof(c, 0, 15, 3) };

/* ---------- Buried pipes: drawing, removing ---------- */
function drawBuried(i, tx, ty) {
  const x = tx * TS, y = ty * TS, L = tx > 0 && (buried[i - 1] || pipeLike(i - 1)), Rr = tx + 1 < W && (buried[i + 1] || pipeLike(i + 1)), U = ty > 0 && (buried[i - W] || pipeLike(i - W)), D = ty + 1 < H && (buried[i + W] || pipeLike(i + W));
  ctx.globalAlpha = 0.5; ctx.fillStyle = '#8fb4d0';
  ctx.fillRect(x + 6, y + 6, 4, 4);
  if (L) ctx.fillRect(x, y + 6, 6, 4); if (Rr) ctx.fillRect(x + 10, y + 6, 6, 4); if (U) ctx.fillRect(x + 6, y, 4, 6); if (D) ctx.fillRect(x + 6, y + 10, 4, 6);
  ctx.fillStyle = '#2a4a66'; ctx.fillRect(x + 7, y + 7, 2, 2); ctx.globalAlpha = 1;
}
{ const o = drawGroundOverlay; drawGroundOverlay = function (tx, ty, time) { o(tx, ty, time); const i = ty * W + tx; if (buried[i]) drawBuried(i, tx, ty); }; }
{ const o = tryDeconstruct; tryDeconstruct = function () {
  const tx = Math.floor(state.mwx / TS), ty = Math.floor(state.mwy / TS), i = ty * W + tx, p = state.player;
  if (tx >= 0 && ty >= 0 && tx < W && ty < H && buried[i] && !structs.has(i) && !roofs[i] && !floors[i] && !crops.has(i) && !saplings.has(i) && !tilled[i]) {
    if (Math.hypot((tx + 0.5) * TS - p.x, (ty + 0.5) * TS - p.y) > 64) { toast('Too far away.', 1.5); return; }
    buried[i] = 0; state.drops.push({ x: (tx + 0.5) * TS, y: (ty + 0.5) * TS, name: 'Scrap', qty: 1, t: 0 }); sfx('break'); toast('Dug up the buried pipe.', 1.8); return;
  }
  o();
}; }

/* ---------- Sprinklers ---------- */
let sprinkT = 0; const sprinkConn = new Map();
function runSprinklers(dt) {
  sprinkT -= dt; if (sprinkT > 0) return; sprinkT = 1.5;
  for (const [i, s] of structs) {
    if (s.type !== 'sprinkler') continue;
    let c = sprinkConn.get(i); if (!c || state.elapsed - c.t > 4) { c = { ok: sinkConnected(i), t: state.elapsed }; sprinkConn.set(i, c); }
    s.on = c.ok;
    if (!c.ok) continue;
    const tx = i % W, ty = Math.floor(i / W);
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { if (dx * dx + dy * dy > 10.5) continue; const j = (ty + dy) * W + tx + dx; if (j >= 0 && j < W * H && tilled[j]) wet[j] = 1; }
    for (let k = 0; k < 5; k++) { const a = Math.random() * 6.283, r = 10 + Math.random() * 38; burst((tx + 0.5) * TS + Math.cos(a) * r, (ty + 0.5) * TS + Math.sin(a) * r * 0.8, '#7ac8ff', 1); }
  }
}
{ const o = updateStorm; updateStorm = function (dt) { o(dt); if (!state.title) runSprinklers(dt); }; }
{ const o = drawStruct; drawStruct = function (st, tx, ty) {
  o(st, tx, ty);
  if (st.type === 'sprinkler') { const ok = st.on; ctx.fillStyle = ok ? '#4aff8a' : '#ff5a4a'; ctx.fillRect(tx * TS + 7, ty * TS + 1, 2, 2); }
}; }
Object.assign(DBG, { CROPS, RECIPES, skillLevel, skillXp, itemValue, sinkConnected, buried, runSprinklers, drawBuried, FLOOR_KINDS, ROOF_REC, FLOOR_REC });
