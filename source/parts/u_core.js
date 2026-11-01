/* =====================================================================
   U_CORE: dismissing, repairs, minimap, pinned recipes, slower levelling,
   stuck settlers, tools in hand, guards on towers
   ===================================================================== */
state.pins = [];
const DBG = {};
JOBS.push('Builder');

/* ---------- Slower levelling, smaller perks, tougher enemies ---------- */
Object.assign(CONFIG.combat, { xpBase: 60, xpPerLevel: 45, hpPerLevel: 3, dmgPerLevel: 0.025 });
SKILLS.combat.perk = l => '+' + Math.round((l - 1) * 2) + '% damage';
for (const k of Object.keys(ENEMY_TYPES)) ENEMY_TYPES[k].dmg = Math.round(ENEMY_TYPES[k].dmg * 1.15);
Object.assign(DIFFS.relaxed, { enemyScale: 0.85 }); Object.assign(DIFFS.normal, { enemyScale: 1 }); Object.assign(DIFFS.harsh, { enemyScale: 1.25 });
{ const o = spawnEnemy; spawnEnemy = function (type, x, y, opts) {
  const e = o(type, x, y, opts);
  const sc = 1.2 * ((DIFFS[settings.diff] || DIFFS.normal).enemyScale || 1);
  e.maxHp = e.hp = Math.round(e.hp * sc);
  return e;
}; }

/* ---------- Dismissing a settler: they head home to where you found them ---------- */
{ const o = recruit; recruit = function (npc) {
  const r = o(npc);
  if (r) { const s = settlers.find(q => q.id === npc.id); if (s) { s.origin = npc.origin || { x: npc.x, y: npc.y }; if (npc.jobXp) s.jobXp = npc.jobXp; s.dismissed = false; } }
  return r;
}; }
dismissSettler = function (s) {
  const ix = settlers.indexOf(s);
  if (ix < 0) return;
  settlers.splice(ix, 1);
  if (s.bed !== null && structs.get(s.bed)) structs.get(s.bed).owner = null;
  for (const [i, id] of claimed) if (id === s.id) claimed.delete(i);
  if (s.carry && s.carry.length) for (const c of s.carry) state.drops.push({ x: s.x, y: s.y + 6, name: c.name, qty: c.qty, t: 0 });
  const o = s.origin || { x: (BASE.x + 24) * TS, y: BASE.y * TS };
  Object.assign(s, { kind: 'survivor', carry: [], bed: null, task: null, path: null, state: null, x: o.x, y: o.y, home: { x: o.x, y: o.y }, scared: false, dismissed: true });
  survivors.push(s);
  state.floats.push({ x: state.player.x, y: state.player.y - 20, text: s.name.split(' ')[0] + ' heads home', color: '#ffd36b', life: 1.8 });
  toast(s.name + ' packs up and heads back to where you found them. Their job levels are kept if they rejoin.', 5);
};
{ const o = npcReply; npcReply = function (npc, kind) {
  if (npc.dismissed && kind === 'hello') return 'Changed your mind? Get me a bed and I will come back. I have not forgotten how to do my job.';
  return o(npc, kind);
}; }

/* ---------- Repairs ---------- */
Object.assign(TOOL_ITEMS, { 'Hammer': { type: 'hammer', tier: 1 } });
ITEM_STACK['Hammer'] = 1; ITEM_COL['Hammer'] = '#8a6a3a';
ITEM_DESC['Hammer'] = 'Hold click on a damaged structure to repair it. Costs a little of what it was built from.';
{ const r = rc('hammer', 'Tools', 'Hammer', 'workbench', { 'Wood': 2, 'Scrap': 4 }, { gives: { 'Hammer': 1 } }); r.tier = 1; }
RECIPE_DESC.hammer = 'Repairs damaged walls, gates and stations. Hold click on the damage. Builders use one too.';
function structMax(st) { return STRUCT_HP[st.type] || st.maxHp || st.hp; }
{ const o = hurtStruct; hurtStruct = function (i, dmg) { const st = structs.get(i); if (st && !st.maxHp) st.maxHp = STRUCT_HP[st.type] || st.hp; o(i, dmg); }; }
function repairStep(i, byPlayer) {
  const st = structs.get(i);
  if (!st) return false;
  const mx = structMax(st);
  if (st.hp >= mx) return false;
  const r = RECIPES.find(q => q.place === st.type);
  let mat = 'Scrap', n = 1;
  if (r) { let bq = 0; for (const k of Object.keys(r.cost)) if (r.cost[k] > bq) { bq = r.cost[k]; mat = k; } n = Math.max(1, Math.ceil(bq * 0.12)); }
  if (byPlayer) { if (countItem(mat) < n) { toast('Repairs need ' + n + ' ' + mat + '.', 2); return false; } takeItems({ [mat]: n }); }
  else { if (chestCount(mat) < n) return false; chestTake(mat, n); }
  st.hp = Math.min(mx, st.hp + mx * 0.15);
  const cx = ((i % W) + 0.5) * TS, cy = Math.floor(i / W) * TS;
  state.floats.push({ x: cx, y: cy, text: '+' + Math.round(mx * 0.15), color: '#9fdc8f', life: 0.8 });
  burst(cx, cy + 8, '#c8b88a', 4); sfx('place');
  return true;
}
{ const o = getTarget; getTarget = function () {
  const t = o(), s = selItem();
  if (s && s.name === 'Hammer' && (!t || !t.res || !t.res.talk)) {
    const tx = Math.floor(state.mwx / TS), ty = Math.floor(state.mwy / TS);
    if (tx >= 0 && ty >= 0 && tx < W && ty < H) {
      const i = ty * W + tx, st = structs.get(i);
      if (st && st.hp < structMax(st)) {
        const dist = Math.hypot((tx + 0.5) * TS - state.player.x, (ty + 0.5) * TS - state.player.y);
        return { tx, ty, i, dist, inReach: dist <= CONFIG.player.reach, canHarvest: true, tier: 0, kind: 0, res: { name: 'Repair ' + (STATION_NAMES[st.type] || st.type), item: '', repair: true, minTier: 0, tool: 'hammer' } };
      }
    }
  }
  return t;
}; }
{ const o = doTargetAction; doTargetAction = function (t) {
  if (t.res && t.res.repair) { if (repairStep(t.i, true)) skillXp('crafting', 1); state.actCd = 0.4; return; }
  o(t);
}; }
{ const o = updateRaids; updateRaids = function () {
  const had = !!state.raid; o();
  if (had && !state.raid) {
    let n = 0; for (const [, st] of structs) if (st.hp < structMax(st) * 0.95) n++;
    if (n) toast('The raid is over. ' + n + ' structure' + (n > 1 ? 's' : '') + ' damaged. Repair them with a Hammer, or set a settler to Builder.', 7);
  }
}; }
function builderTick(s, dt) {
  if (!s.task) {
    let best = null, bd = 1e9;
    for (const [i, st] of structs) {
      if (st.hp >= structMax(st) * 0.97 || claimedByOther(i, s) || (badUntil.get(i) || 0) > state.elapsed) continue;
      const d = Math.hypot(((i % W) + 0.5) * TS - s.x, (Math.floor(i / W) + 0.5) * TS - s.y);
      if (d < bd) { bd = d; best = i; }
    }
    if (best === null) { idleWander(s, dt); return; }
    s.task = { kind: 'repair', i: best }; s.workT = 0; claim(best, s);
  }
  const st = structs.get(s.task.i);
  if (!st || st.hp >= structMax(st) * 0.99) { claimed.delete(s.task.i); s.task = null; return; }
  const [gx, gy] = adjacentSpot(s.task.i);
  if (!settlerGo(s, gx, gy, dt, 42)) return;
  s.workT += dt;
  if (s.workT > 1.1) {
    s.workT = 0;
    if (repairStep(s.task.i, false)) settlerXp(s, 'Builder', 2);
    else { claimed.delete(s.task.i); badUntil.set(s.task.i, state.elapsed + 40); s.task = null; }
  }
}
{ const o = settlerStatus; settlerStatus = function (s) { if (s.job === 'Builder') { const t = s.task ? 'Repairing the camp' : 'Nothing to repair'; return carryTotal(s) > 0 ? t + '  (carrying ' + s.carry.map(c => c.qty + ' ' + c.name).join(', ') + ')' : t; } return o(s); }; }

/* ---------- Settlers on the maps ---------- */
function drawMiniExtras(mx, my, MS) {
  ctx.fillStyle = '#7fe08a';
  for (const s of settlers) ctx.fillRect(mx + s.x / (W * TS) * MS - 1, my + s.y / (H * TS) * MS - 1, 2, 2);
  if (typeof drawMarkersMini === 'function') drawMarkersMini(mx, my, MS);
}
function drawBigMapExtras(px, py, S) {
  const k = S / (W * TS);
  for (const s of settlers) { ctx.fillStyle = '#000'; ctx.fillRect(px + 6 + s.x * k - 3, py + 6 + s.y * k - 3, 6, 6); ctx.fillStyle = '#7fe08a'; ctx.fillRect(px + 6 + s.x * k - 2, py + 6 + s.y * k - 2, 4, 4); }
  if (typeof drawMarkersBig === 'function') drawMarkersBig(px, py, S);
}

/* ---------- Pinned recipes ---------- */
function togglePin(id) {
  const i = state.pins.indexOf(id);
  if (i >= 0) state.pins.splice(i, 1);
  else { if (state.pins.length >= 3) state.pins.shift(); state.pins.push(id); }
}
function drawRightStack(w, y0) {
  let y = y0;
  if (typeof drawBuffChips === 'function') y = drawBuffChips(w, y);
  ctx.textBaseline = 'middle';
  for (const id of state.pins) {
    const r = RECIPES.find(q => q.id === id);
    if (!r) continue;
    const names = Object.keys(r.cost), hh = 22 + names.length * 12 + (r.station ? 12 : 0);
    panel(w - 190, y, 182, hh, 0.85);
    ctx.textAlign = 'left'; ctx.font = '10px ' + MONO; ctx.fillStyle = '#ffe9b0'; ctx.fillText('Pinned: ' + r.name, w - 182, y + 11);
    let yy = y + 24;
    for (const n of names) { const have = countItem(n), need = r.cost[n]; ctx.fillStyle = have >= need ? '#9fdc8f' : '#e07a6a'; ctx.fillText(n, w - 182, yy); ctx.textAlign = 'right'; ctx.fillText(have + ' / ' + need, w - 16, yy); ctx.textAlign = 'left'; yy += 12; }
    if (r.station) { const near = stationNear(r.station); ctx.fillStyle = near ? '#9fdc8f' : '#d6a84a'; ctx.fillText((near ? 'At ' : 'Needs ') + STATION_NAMES[r.station], w - 182, yy); }
    y += hh + 6;
  }
  return y;
}

/* ---------- Stuck settlers ---------- */
function freeSpotNear(x, y, maxR) {
  for (let r = 2; r <= maxR; r += 2) for (let a = 0; a < 6.283; a += 0.5) { const nx = x + Math.cos(a) * r, ny = y + Math.sin(a) * r; if (!collides(nx, ny, 10, true)) return [nx, ny]; }
  return null;
}
function unstick(s, gx, gy) {
  s.stuckN = (s.stuckN || 0) + 1; s.stuckT = 0.4; s.path = null; s.pathT = 0;
  if (collides(s.x, s.y, 10, true)) { const f = freeSpotNear(s.x, s.y, 30); if (f) { s.x = f[0]; s.y = f[1]; return; } }
  if (s.stuckN % 3 === 0) {
    const p = findPath(s.x, s.y, gx, gy, 9000, true);
    if (p && p.length > 2) { const w = p[Math.min(p.length - 1, 3)]; if (!collides(w[0], w[1], 10, true)) { s.x = w[0]; s.y = w[1]; return; } }
  }
  if (s.stuckN % 3 === 1) { const a = Math.random() * 6.283; if (!collides(s.x + Math.cos(a) * 6, s.y + Math.sin(a) * 6, 10, true)) { s.x += Math.cos(a) * 6; s.y += Math.sin(a) * 6; } }
  if (s.stuckN >= 6) {
    if (s.task && s.task.i !== undefined) { claimed.delete(s.task.i); badUntil.set(s.task.i, state.elapsed + 60); }
    s.task = null; s.workT = 0; s.stuckN = 0;
    const f = freeSpotNear(gx, gy, 24); if (f) { s.x = f[0]; s.y = f[1]; }
  }
}
{ const o = settlerGo; settlerGo = function (s, gx, gy, dt, speed) {
  const rgx = gx, rgy = gy;
  if (collides(gx, gy, 10, true)) {
    const key = Math.round(gx) + ',' + Math.round(gy);
    if (s._gk !== key) { s._gk = key; s._gv = freeSpotNear(gx, gy, 30); }
    if (s._gv) { gx = s._gv[0]; gy = s._gv[1]; }
  }
  const ox = s.x, oy = s.y, r = o(s, gx, gy, dt, speed);
  if (r) { s.stuckT = 0; s.stuckN = 0; return r; }
  const moved = Math.hypot(s.x - ox, s.y - oy);
  if (moved < speed * dt * 0.3) s.stuckT = (s.stuckT || 0) + dt; else s.stuckT = Math.max(0, (s.stuckT || 0) - dt * 2);
  if (s.stuckT > 1.0) unstick(s, gx, gy);
  return r;
}; }

/* ---------- Tools in hand, guards on the towers ---------- */
function toolFor(n) {
  const t = n.task;
  if (n.job === 'Farmer') return t && t.kind === 'water' ? 'Watering Can' : 'Hoe';
  if (n.job === 'Hauler') { const o = t && t.i !== undefined ? objs[t.i] : 0; return o === O.TREE || o === O.PINE || o === O.REDWOOD ? 'Scrap Axe' : (o === O.ROCK || o === O.ORE ? 'Scrap Pickaxe' : (t ? null : 'Scrap Axe')); }
  if (n.job === 'Fisher') return 'Fishing Rod';
  if (n.job === 'Builder') return 'Hammer';
  if (n.job === 'Guard') return n.skills && n.skills.guard >= 2 && chestCount('Pistol rounds') > 0 ? 'Scrap Pistol' : 'Rusty Pipe';
  return null;
}
function drawSettlerTool(n, x, y, up) {
  const tool = toolFor(n);
  if (!tool || !(TOOL_ITEMS[tool] || WEAPONS[tool])) return;
  const k = iconKind(tool), gun = k === 'pistol';
  const spr = makeSprite('h|' + tool, 16, 16, g => iconTo(g, tool, 0, 0, 16, null));
  const working = !!n.task && (n.workT || 0) > 0.05 && !n.sleeping, d = n.dirx >= 0 ? 1 : -1;
  let rot = (gun ? (d > 0 ? 0 : Math.PI) : Math.PI / 2 * d * 0.4 + (d > 0 ? 0 : 0));
  if (working && !gun) rot += Math.sin(state.elapsed * 11) * 0.9 * d;
  ctx.save(); ctx.translate(Math.round(x + d * 5), Math.round(y - 6 - (up || 0)));
  if (gun) { if (d < 0) ctx.scale(-1, 1); ctx.drawImage(spr, -4, -9); }
  else { ctx.rotate(rot); ctx.drawImage(spr, -9, -17); }
  ctx.restore();
}
{ const o = drawNpc; drawNpc = function (n) {
  if (n.kind === 'settler' && n.onPost) return;
  o(n);
  if (n.kind === 'settler') drawSettlerTool(n, n.x, n.y, 0);
}; }
{ const o = updateSettlers; updateSettlers = function (dt) { for (const s of settlers) s.onPost = false; o(dt); }; }
{ const o = guardIdle; guardIdle = function (s, dt) {
  o(s, dt);
  let post = null, bd = 1e9;
  for (const [i, st] of structs) if (st.type === 'guardpost') { const d = Math.hypot(((i % W) + 0.5) * TS - s.x, (Math.floor(i / W) + 0.5) * TS - s.y); if (d < bd) { bd = d; post = i; } }
  if (post !== null && bd < 26) { s.onPost = true; s.postI = post; s.dirx = s.id % 2 ? -1 : 1; }
}; }
function drawTowerGuards() {
  for (const s of settlers) {
    if (!s.onPost || s.postI === undefined) continue;
    const px = ((s.postI % W) + 0.5) * TS, py = (Math.floor(s.postI / W) + 0.5) * TS;
    const frame = 0, spr = npcSprite(s, frame), bottom = py - 6;
    drawFlipped(spr, px, bottom, s.dirx < 0);
    drawSettlerTool(s, px, bottom - 6, 0);
  }
}

Object.assign(DBG, { settlerGo, dismissSettler, repairStep, structMax, toolFor, unstick, togglePin, builderTick, drawTowerGuards, settlerStatus, survivors, settlers, freeSpotNear });
