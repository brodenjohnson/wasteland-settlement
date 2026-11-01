/* =====================================================================
   AD_POLISH: text size, camp-wide crafting, auto-rotating doors, settlers who
   visibly eat, better watering cans, removing soil and saplings, enemy levels
   ===================================================================== */
if (settings.textScale === undefined) settings.textScale = 1.2;
{ const fd = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'font');
  Object.defineProperty(ctx, 'font', { configurable: true, get() { return fd.get.call(this); },
    set(v) { if (typeof v === 'string') v = v.replace(/(\d+(?:\.\d+)?)px/, (m, n) => (Math.round(parseFloat(n) * (settings.textScale || 1) * 10) / 10) + 'px'); fd.set.call(this, v); } }); }

/* ---------- One workbench serves the whole camp ---------- */
{ const o = stationNear; stationNear = function (type) {
  if (o(type)) return true;
  if (!CAMP.active || state.map !== 'wastes') return false;
  const p = state.player;
  if (!inCampTile(Math.floor(p.y / TS) * W + Math.floor(p.x / TS))) return false;
  const types = STATION_ALIAS[type] || [type];
  for (const [si, st] of structs) if (types.includes(st.type) && inCampTile(si)) return true;
  return false;
}; }

/* ---------- Doors turn to face the wall they are set into ---------- */
function autoRot(type, tx, ty, rot) {
  if (type !== 'gate') return rot;
  const i = ty * W + tx, L = tx > 0 && wallLike(i - 1), R2 = tx + 1 < W && wallLike(i + 1), U = ty > 0 && wallLike(i - W), D = ty + 1 < H && wallLike(i + W);
  if ((L || R2) && !(U || D)) return 0;
  if ((U || D) && !(L || R2)) return 2;
  return rot;
}

/* ---------- Settlers eat where you can see them ---------- */
{ const o = drawNpc; drawNpc = function (n) {
  o(n);
  if (n.kind === 'settler' && n.eating) {
    drawIcon(n.eating, Math.round(n.x + (n.dirx >= 0 ? 2 : -10)), Math.round(n.y - 23 + Math.sin(state.elapsed * 9) * 1.5), 9);
    if (Math.random() < 0.08) burst(n.x + (n.dirx >= 0 ? 4 : -4), n.y - 12, '#d8c8a0', 1);
  }
}; }
{ const o = settlerStatus; settlerStatus = function (s) { return s.eating ? 'Eating ' + s.eating : o(s); }; }

/* ---------- Watering cans ---------- */
const CAN_DEF = { 'Watering Can': { cap: 20, area: 1 }, 'Large Watering Can': { cap: 50, area: 3 }, 'Pressure Can': { cap: 90, area: 9 } };
function isCanName(n) { return !!CAN_DEF[n]; }
function canCap(it) { return (CAN_DEF[it.name] || CAN_DEF['Watering Can']).cap; }
Object.assign(TOOL_ITEMS, { 'Large Watering Can': { type: 'can', tier: 1 }, 'Pressure Can': { type: 'can', tier: 1 } });
for (const k of ['Large Watering Can', 'Pressure Can']) { ITEM_STACK[k] = 1; ITEM_COL[k] = '#7a8aa0'; ITEM_TIER[k] = k === 'Pressure Can' ? 2 : 1; }
ITEM_DESC['Large Watering Can'] = 'Holds 50 and soaks three tiles in a row.'; ITEM_DESC['Pressure Can'] = 'Holds 90 and soaks a 3 by 3 patch in one go.';
{ const a = rc('can2', 'Tools', 'Large Watering Can', 'workbench', { 'Scrap': 10, 'Metal plate': 1 }, { gives: { 'Large Watering Can': 1 } }); a.tier = 2;
  const b = rc('can3', 'Tools', 'Pressure Can', 'forge', { 'Metal plate': 4, 'Cloth': 3, 'Scrap': 6 }, { gives: { 'Pressure Can': 1 } }); b.tier = 3; }
RECIPE_DESC.can2 = 'A bigger tank and a wider spout. Soaks three tiles at once.'; RECIPE_DESC.can3 = 'Pressurised. Soaks a 3 by 3 patch and holds almost five times the water of the first one.';
refillCan = function (can) { can.water = canCap(can); state.actCd = 0.6; state.floats.push({ x: state.player.x, y: state.player.y - 16, text: 'Can filled', color: '#7ac8ff', life: 1.2 }); };
function waterArea(can, tx, ty) {
  const a = (CAN_DEF[can.name] || CAN_DEF['Watering Can']).area, list = [];
  if (a === 1) list.push([tx, ty]); else if (a === 3) { for (let k = -1; k <= 1; k++) list.push([tx + k, ty]); } else { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) list.push([tx + dx, ty + dy]); }
  let n = 0;
  for (const [x, y] of list) {
    if (x < 0 || y < 0 || x >= W || y >= H) continue;
    const i = y * W + x;
    if (!tilled[i] || wet[i] || !(can.water > 0)) continue;
    can.water -= 1; wet[i] = 1; n++; burst((x + 0.5) * TS, (y + 0.5) * TS, '#7ac8ff', 5);
  }
  if (n) { skillXp('farming', 0.4 * n); state.swing = { t: 0, dur: 0.2, tool: 'can', tier: 1 }; sfx('drink'); }
}

/* ---------- Remove soil, crops and saplings (X) ---------- */
{ const o = tryDeconstruct; tryDeconstruct = function () {
  const tx = Math.floor(state.mwx / TS), ty = Math.floor(state.mwy / TS), i = ty * W + tx, p = state.player;
  if (tx < 0 || ty < 0 || tx >= W || ty >= H || structs.has(i) || roofs[i] || floors[i]) return o();
  if (!crops.has(i) && !saplings.has(i) && !tilled[i]) return o();
  if (Math.hypot((tx + 0.5) * TS - p.x, (ty + 0.5) * TS - p.y) > 64) { toast('Too far away.', 1.5); return; }
  const cx = (tx + 0.5) * TS, cy = (ty + 0.5) * TS;
  if (crops.has(i)) { const c = crops.get(i); crops.delete(i); state.drops.push({ x: cx, y: cy, name: c.seed, qty: 1, t: 0 }); toast('Pulled up the crop. You kept a seed.', 2); }
  else if (saplings.has(i)) { saplings.delete(i); state.drops.push({ x: cx, y: cy, name: 'Sapling', qty: 1, t: 0 }); toast('Dug up the sapling.', 2); }
  else { tilled[i] = 0; wet[i] = 0; toast('Smoothed the soil back over.', 2); }
  burst(cx, cy, '#6b4a2b', 6); sfx('place');
}; }

/* ---------- Enemies keep pace with you, and bosses stay ahead ---------- */
CONFIG.tools.names = ['basic', 'sturdy', 'heavy'];
const LVL_OFF = { glowrat: [-2, 0], hound: [-1, 0], stalker: [-1, 1], spitter: [-1, 1], scrapper: [-1, 1], gunner: [0, 1], sapper: [0, 1], bloater: [0, 2], husk: [0, 2], brute: [1, 3], sniper: [1, 3], chief: [3, 5], kingpin: [4, 6], hollowclaw: [5, 7] };
{ const o = spawnEnemy; spawnEnemy = function (type, x, y, opts) {
  const e = o(type, x, y, opts), off = LVL_OFF[type] || [0, 1], pl = state.player.level;
  const lv = Math.max(1, pl + off[0] + Math.floor(Math.random() * (off[1] - off[0] + 1)));
  const bossy = ENEMY_TYPES[type].boss || type === 'chief';
  e.lvl = lv; e.maxHp = e.hp = Math.round(e.hp * (1 + 0.05 * (lv - 1))); e._dm = 1 + (bossy ? 0.015 : 0.025) * (lv - 1);
  return e;
}; }
function scaledStats(e) {
  const base = ENEMY_TYPES[e.type];
  if (!e._dm || e._dm === 1) return base;
  if (!e._d || e._d.__b !== base) e._d = Object.assign({}, base, { dmg: Math.round(base.dmg * e._dm), __b: base });
  return e._d;
}
{ const o = killEnemy; killEnemy = function (e) { const bonus = Math.max(0, (e.lvl || 1) - state.player.level) * 0.12, xp = ENEMY_TYPES[e.type].xp; o(e); if (bonus > 0) skillXp('combat', xp * bonus); }; }
{ const o = drawEnemy; drawEnemy = function (e) {
  o(e);
  if (e.hidden || !e.lvl || Math.hypot(e.x - state.player.x, e.y - state.player.y) > 150) return;
  const d = ENEMY_TYPES[e.type], spec = ENEMY_SPR[e.type], diff = e.lvl - state.player.level;
  ctx.font = '7px ' + MONO; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
  const y = Math.round(e.y + d.size / 2 + 2 - spec.h - 7), txt = 'Lv ' + e.lvl;
  ctx.fillStyle = '#000'; ctx.fillText(txt, Math.round(e.x) + 0.5, y + 0.5);
  ctx.fillStyle = diff >= 4 ? '#ff4a3a' : diff >= 2 ? '#ff9a4a' : diff <= -2 ? '#7fbf7f' : '#f0e6cc'; ctx.fillText(txt, Math.round(e.x), y);
}; }
const OLD_NAMES = [['Scrap ' + 'Axe', 'Rusty Hatchet'], ['Scrap ' + 'Pickaxe', 'Rusty Pick'], ['Iron ' + 'Axe', 'Woodcutter Axe'], ['Iron ' + 'Pickaxe', 'Miners Pick'], ['Steel ' + 'Axe', 'Chopper'], ['Steel ' + 'Pickaxe', 'Drill Pick'],
  ['Scrap ' + 'Machete', 'Machete'], ['Iron ' + 'Cleaver', 'Combat Cleaver'], ['Steel ' + 'Cleaver', 'Chain Cleaver'], ['Scrap ' + 'Pistol', 'Pipe Pistol'], ['Scrap ' + 'SMG', 'Rattler SMG'], ['Spiked ' + 'Bat', 'Nail Board'],
  ['Scrap ' + 'Helmet', 'Raider Helmet'], ['Scrap ' + 'Vest', 'Raider Vest'], ['Scrap ' + 'Greaves', 'Raider Leggings'], ['Scrap ' + 'Boots', 'Raider Boots'],
  ['Iron ' + 'Helm', 'Metal Helmet'], ['Iron ' + 'Plate', 'Metal Armour'], ['Iron ' + 'Greaves', 'Metal Leg Guards'], ['Iron ' + 'Boots', 'Metal Boots'],
  ['Steel ' + 'Helm', 'Combat Helmet'], ['Steel ' + 'Plate', 'Combat Armour'], ['Steel ' + 'Greaves', 'Combat Leg Guards'], ['Steel ' + 'Boots', 'Combat Boots'],
  ['Padded ' + 'Cap', 'Patchwork Cap'], ['Padded ' + 'Jacket', 'Patchwork Jacket'], ['Padded ' + 'Trousers', 'Patchwork Trousers'], ['Padded ' + 'Shoes', 'Patchwork Shoes']];
function migrateNames(d) { let s = JSON.stringify(d); for (const [a, b] of OLD_NAMES) s = s.split('"' + a + '"').join('"' + b + '"'); return JSON.parse(s); }
{ const o = loadGame; loadGame = function () { if (state.pendingLoad) state.pendingLoad = migrateNames(state.pendingLoad); return o(); }; }
Object.assign(DBG, { migrateNames, stationNear, autoRot, waterArea, scaledStats, CAN_DEF, LVL_OFF });
