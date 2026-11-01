/* =====================================================================
   Z_MAPS: several maps. The overworld ("wastes") and dungeon-style maps share
   the same arrays. Leaving a map stashes it, entering one swaps it in.
   ===================================================================== */
const MAP_ARR = { tiles, shade_, objs, reserved, tilled, wet, radMap, zoneMap, floors, roofs };
const STASH = {}, SAVED = {}, INTERACT = new Map(), MAP_LIGHTS = [], MAPDEFS = {};
state.map = 'wastes'; state.mapFlags = state.mapFlags || {}; state.transition = null; state.visitedMaps = { wastes: true };
ZONE_NAMES.push('The Spine', 'The Tidewrack');
Object.assign(PLACE_LORE, {
  'The Spine': 'A service tunnel under the Ash Tower. Dark, cold, and the cable on the wall is humming.',
  'The Tidewrack': 'A drowned coast of fog and salt. The tide decides which streets exist.'
});
const THEMES = {
  tunnel: { [T.CLIFF]: ['#33363b', '#3a3d43', '#2e3135', '#43464d', '#25282c'], [T.FLOOR]: ['#4a4c51', '#52555a', '#44464b', '#5a5c61', '#3a3c40'] },
  cave: { [T.CLIFF]: ['#2c2723', '#332e29', '#27221f', '#3b3530', '#1e1a17'], [T.FLOOR]: ['#4a3d30', '#524436', '#43372b', '#5a4b3c', '#372d23'] },
  vault: { [T.CLIFF]: ['#2a3338', '#313b41', '#252d32', '#38444b', '#1c2327'], [T.FLOOR]: ['#4d5a60', '#566469', '#46535a', '#5f6e75', '#3b464b'] },
  mart: { [T.CLIFF]: ['#4e463e', '#564e45', '#463f38', '#5f564c', '#37312b'], [T.FLOOR]: ['#8a8478', '#928c80', '#827c70', '#9a9488', '#6f6a60'] },
  coast: { [T.CLIFF]: ['#2e3438', '#353c41', '#292f33', '#3d454a', '#1f2528'], [T.FLOOR]: ['#6a6658', '#716d5f', '#625e51', '#7a7567', '#4e4b41'] },
  factory: { [T.CLIFF]: ['#3f302a', '#473730', '#382a24', '#51403a', '#2a1f1b'], [T.FLOOR]: ['#59504a', '#625850', '#524a44', '#6a6058', '#443d38'] }
};
const clamp01 = (v, a, b) => Math.max(a, Math.min(b, v));
function cloneCanvas(c) { const n = document.createElement('canvas'); n.width = c.width; n.height = c.height; n.getContext('2d').drawImage(c, 0, 0); return n; }
function snapshotMap() {
  const s = { arrays: {}, ground: groundCv, wd: waterDepth, fog: cloneCanvas(miniFog) };
  for (const k in MAP_ARR) s.arrays[k] = MAP_ARR[k].slice();
  s.structs = new Map(structs); s.crops = new Map(crops); s.saplings = new Map(saplings); s.crateLoot = new Map(crateLoot);
  s.decor = decor.slice(); s.ruins = ruins.slice(); s.hot = HOT_SPOTS.slice(); s.oases = OASES.slice();
  s.survivors = survivors.slice(); s.settlers = settlers.slice(); s.encNpcs = encNpcs.slice();
  s.spawnPts = state.spawnPts; s.drops = state.drops; s.interact = new Map(INTERACT); s.lights = MAP_LIGHTS.slice();
  return s;
}
function applyMap(s) {
  for (const k in MAP_ARR) MAP_ARR[k].set(s.arrays[k]);
  const fill = (m, src) => { m.clear(); for (const [k, v] of src) m.set(k, v); };
  fill(structs, s.structs); fill(crops, s.crops); fill(saplings, s.saplings); fill(crateLoot, s.crateLoot); fill(INTERACT, s.interact);
  const arr = (a, src) => { a.length = 0; for (const v of src) a.push(v); };
  arr(decor, s.decor); arr(ruins, s.ruins); arr(HOT_SPOTS, s.hot); arr(OASES, s.oases); arr(survivors, s.survivors); arr(settlers, s.settlers); arr(encNpcs, s.encNpcs); arr(MAP_LIGHTS, s.lights);
  groundCv = s.ground; waterDepth = s.wd; state.spawnPts = s.spawnPts; state.drops = s.drops;
  const f = miniFog.getContext('2d'); f.globalCompositeOperation = 'source-over'; f.clearRect(0, 0, miniFog.width, miniFog.height); f.drawImage(s.fog, 0, 0);
}
function emptyMap(def) {
  tiles.fill(T.CLIFF); objs.fill(0); reserved.fill(0); tilled.fill(0); wet.fill(0); floors.fill(0); roofs.fill(0); zoneMap.fill(def.zone); radMap.fill(def.rad || 0);
  structs.clear(); crops.clear(); saplings.clear(); crateLoot.clear(); INTERACT.clear(); MAP_LIGHTS.length = 0;
  decor.length = 0; ruins.length = 0; HOT_SPOTS.length = 0; OASES.length = 0; survivors.length = 0; settlers.length = 0; encNpcs.length = 0;
  state.spawnPts = []; state.drops = [];
}
function genDungeonMap(def) {
  const rng = mulberry32(def.seed);
  emptyMap(def);
  for (let i = 0; i < W * H; i++) shade_[i] = Math.floor(rng() * 4);
  const carve = (x, y, w, h) => { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) if (xx > 2 && yy > 2 && xx < W - 3 && yy < H - 3) tiles[yy * W + xx] = T.FLOOR; };
  const rooms = [];
  let x = 9, cy = 64;
  for (let k = 0; k < def.rooms; k++) {
    const w = def.rw ? def.rw[0] + Math.floor(rng() * def.rw[1]) : 9 + Math.floor(rng() * 5), h = def.rh ? def.rh[0] + Math.floor(rng() * def.rh[1]) : 7 + Math.floor(rng() * 4);
    cy = clamp01(cy + Math.floor((rng() - 0.5) * 16), 22, 104);
    const r = { x, y: cy - (h >> 1), w, h, cx: x + (w >> 1), cy };
    carve(r.x, r.y, w, h); rooms.push(r);
    x += w + (def.gap ? def.gap[0] + Math.floor(rng() * def.gap[1]) : 6 + Math.floor(rng() * 3));
  }
  for (let k = 0; k < rooms.length - 1; k++) {
    const a = rooms[k], b = rooms[k + 1];
    carve(Math.min(a.cx, b.cx), a.cy - 1, Math.abs(b.cx - a.cx) + 3, 3);
    carve(b.cx - 1, Math.min(a.cy, b.cy), 3, Math.abs(b.cy - a.cy) + 3);
  }
  const props = def.props || ['debris', 'bones', 'barrel'];
  rooms.forEach((r, k) => {
    const n = 4 + Math.floor(rng() * 5);
    for (let j = 0; j < n; j++) { const px = r.x + 1 + Math.floor(rng() * (r.w - 2)), py = r.y + 1 + Math.floor(rng() * (r.h - 2)); decor.push({ kind: props[Math.floor(rng() * props.length)], x: px * TS + 8, y: py * TS + 12, v: Math.floor(rng() * 3), ph: rng() * 6 }); }
    if (k > 0 && rng() < 0.55) { const px = r.x + 1 + Math.floor(rng() * (r.w - 2)), py = r.y + 1 + Math.floor(rng() * (r.h - 2)), i = py * W + px; if (!objs[i]) { objs[i] = O.CRATE; crateLoot.set(i, rollLoot(rng, true)); } }
    if (k > 0 && k < rooms.length - 1 && !(def.skipRooms && def.skipRooms.includes(k))) {
      const count = 1 + Math.floor(k / 2) + (def.density || 0);
      for (let j = 0; j < count; j++) {
        let t = 0, roll = rng() * def.mobs.reduce((a, m) => a + m[1], 0);
        for (const m of def.mobs) { if (roll < m[1]) { t = m[0]; break; } roll -= m[1]; }
        const px = r.x + 1 + Math.floor(rng() * (r.w - 2)), py = r.y + 1 + Math.floor(rng() * (r.h - 2));
        state.spawnPts.push({ type: t, x: (px + 0.5) * TS, y: (py + 0.5) * TS, e: null, respawnAt: 0, hidden: false });
      }
    }
  });
  def.rooms_ = rooms;
  if (def.setup) def.setup(rooms, rng);
  return rooms;
}
function generateMapInto(id) {
  const def = MAPDEFS[id], keepPal = {};
  (def.gen || genDungeonMap)(def);
  for (const t of [T.CLIFF, T.FLOOR]) keepPal[t] = PAL[t];
  const th = THEMES[def.theme] || {};
  for (const t of Object.keys(th)) PAL[t] = th[t];
  buildGround();
  for (const t of Object.keys(keepPal)) PAL[t] = keepPal[t];
  const f = miniFog.getContext('2d'); f.globalCompositeOperation = 'source-over'; f.clearRect(0, 0, miniFog.width, miniFog.height); f.fillStyle = 'rgba(8,6,10,0.97)'; f.fillRect(0, 0, miniFog.width, miniFog.height);
}
function packMap(s, flags) {
  return { objs: b64(s.arrays.objs), crateLoot: [...s.crateLoot], spawnPts: s.spawnPts.map(sp => ({ type: sp.type, x: sp.x, y: sp.y, respawnAt: sp.respawnAt, hidden: sp.hidden })), fog: s.fog.toDataURL(), flags };
}
function applyPacked(p) {
  unb64(p.objs, objs);
  crateLoot.clear(); for (const [i, l] of p.crateLoot) crateLoot.set(i, l);
  state.spawnPts = p.spawnPts.map(sp => ({ type: sp.type, x: sp.x, y: sp.y, respawnAt: sp.respawnAt, hidden: sp.hidden, e: null }));
  const img = new Image(); img.onload = () => { const f = miniFog.getContext('2d'); f.globalCompositeOperation = 'source-over'; f.clearRect(0, 0, miniFog.width, miniFog.height); f.drawImage(img, 0, 0); }; img.src = p.fog;
}
function curDark() { const d = MAPDEFS[state.map]; return d && d.dark || 0; }
function switchMap(id, tx, ty) {
  const from = state.map;
  if (from === id) return;
  for (const sp of state.spawnPts) if (sp.e) { sp.e = null; sp.respawnAt = state.gameMinutes; }
  STASH[from] = snapshotMap();
  enemies.length = 0; state.projs.length = 0; state.particles.length = 0; state.floats.length = 0; claimed.clear(); badUntil.clear(); state.fish = null; state.moving = null; state.talk = null; state.trade = null;
  if (STASH[id]) applyMap(STASH[id]);
  else {
    generateMapInto(id);
    if (SAVED[id]) { applyPacked(SAVED[id]); state.mapFlags[id] = SAVED[id].flags || {}; delete SAVED[id]; }
    if (MAPDEFS[id] && MAPDEFS[id].after) MAPDEFS[id].after();
  }
  state.map = id; state.visitedMaps[id] = true;
  CAMP.active = id === 'wastes' && !!state.hearth;
  if (tx < 0 && MAPDEFS[id] && MAPDEFS[id].entry) { const e = MAPDEFS[id].entry(); tx = e.x; ty = e.y; }
  const p = state.player; p.x = (tx + 0.5) * TS; p.y = (ty + 0.5) * TS; p.kbx = 0; p.kby = 0;
  roofRegion = new Set(); roofFade = 0; buildMinimap();
  state.zone = zoneMap[ty * W + tx];
}
function enterMap(id, tx, ty) { if (!state.transition) state.transition = { phase: 'out', t: 0, id, tx, ty }; }
function updateTransition(dt) {
  const tr = state.transition;
  if (!tr) return;
  tr.t += dt; state.iframes = Math.max(state.iframes, 0.6);
  if (tr.phase === 'out' && tr.t >= 0.35) { switchMap(tr.id, tr.tx, tr.ty); tr.phase = 'in'; tr.t = 0; }
  else if (tr.phase === 'in' && tr.t >= 0.45) state.transition = null;
}
function drawTransition() {
  const tr = state.transition;
  if (!tr) return;
  const a = tr.phase === 'out' ? Math.min(1, tr.t / 0.35) : Math.max(0, 1 - tr.t / 0.45), W2 = canvas.width, H2 = canvas.height;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(0,0,0,' + a + ')'; ctx.fillRect(0, 0, W2, H2);
}
{ const o = drawStorm; drawStorm = function () { o(); drawTransition(); }; }
{ const o = movePlayer; movePlayer = function (mx, my) { if (state.transition) return; o(mx, my); }; }
{ const o = updateStorm; updateStorm = function (dt) { o(dt); updateTransition(dt); if (state.map !== 'wastes') state.stormI = 0; }; }
{ const o = updateHearth; updateHearth = function (dt) { if (state.map !== 'wastes') return; o(dt); }; }
{ const o = updateRaids; updateRaids = function () { if (state.map !== 'wastes') return; o(); }; }
{ const o = updateMarkers; updateMarkers = function (dt) { if (state.map !== 'wastes') return; o(dt); }; }
{ const o = compassTarget; compassTarget = function () { return state.map !== 'wastes' ? (MAPDEFS[state.map] && MAPDEFS[state.map].target ? MAPDEFS[state.map].target() : null) : o(); }; }
{ const o = killEnemy; killEnemy = function (e) { const sp = e.spawnIdx >= 0 ? state.spawnPts[e.spawnIdx] : null; o(e); if (state.map !== 'wastes' && sp) sp.respawnAt = 1e12; }; }
{ const o = die; die = function (r) {
  const from = state.map; o(r);
  if (state.corpse) state.corpse.map = from;
  if (from !== 'wastes') { state.transition = null; switchMap('wastes', Math.floor(spawn.x / TS), Math.floor(spawn.y / TS)); }
}; }
function corpseHere() { return !!state.corpse && (state.corpse.map || 'wastes') === state.map; }
function mapName() { const d = MAPDEFS[state.map]; return d ? d.name : null; }

/* ---------- Things you can use: stairs, hatches, relays ---------- */
function paintStairs(c, up) { R(c, '#1c1c20', 0, 0, 16, 16); for (let k = 0; k < 4; k++) { const y = up ? 12 - k * 3 : k * 3 + 1; R(c, k % 2 ? '#6a6a72' : '#7e7e86', 2 + k, y, 12 - k * 2, 3); R(c, '#3a3a40', 2 + k, y + 3, 12 - k * 2, 1); } R(c, '#e8c24a', 0, 0, 16, 1); R(c, '#e8c24a', 0, 15, 16, 1); }
function paintRelay(c, on) { R(c, '#2a2c30', 3, 2, 10, 14); R(c, '#44484e', 3, 2, 10, 2); R(c, '#14161a', 5, 5, 6, 5); R(c, on ? '#7fff9a' : '#a83a2a', 6, 6, 4, 3); R(c, on ? '#c8ffd4' : '#e8604a', 6, 6, 1, 1); R(c, '#6a6e76', 5, 12, 6, 2); R(c, '#e8c24a', 7, 12, 2, 1); }
function drawInteract(i, tx, ty, time) {
  const it = INTERACT.get(i);
  if (!it) return;
  const x = tx * TS, y = ty * TS;
  if (it.kind === 'relay') { const on = !!it.done; ctx.drawImage(makeSprite('relay|' + on, 16, 16, c => paintRelay(c, on)), x - 1, y - 5); }
  else { const up = it.up; ctx.drawImage(makeSprite('stairs|' + !!up, 16, 16, c => paintStairs(c, up)), x - 1, y - 1); }
  if (!it.hidden) { ctx.fillStyle = 'rgba(255,233,176,' + (0.5 + 0.3 * Math.sin(time * 4)) + ')'; ctx.fillRect(x + 7, y - 9, 2, 2); }
}
{ const o = getTarget; getTarget = function () {
  const t = o(), tx = Math.floor(state.mwx / TS), ty = Math.floor(state.mwy / TS);
  if (tx < 0 || ty < 0 || tx >= W || ty >= H || (t && t.res && t.res.talk)) return t;
  const i = ty * W + tx, it = INTERACT.get(i);
  if (!it) return t;
  const dist = Math.hypot((tx + 0.5) * TS - state.player.x, (ty + 0.5) * TS - state.player.y);
  return { tx, ty, i, dist, inReach: dist <= CONFIG.player.reach + 8, canHarvest: true, tier: 0, kind: 0, res: { name: typeof it.label === 'function' ? it.label() : it.label, item: '', interact: it, minTier: 0, tool: 'axe' } };
}; }
{ const o = doTargetAction; doTargetAction = function (t) {
  if (t.res && t.res.interact) { state.actCd = 0.5; useInteract(t.res.interact, t.i); return; }
  o(t);
}; }
function useInteract(it, i) {
  if (it.kind === 'portal') {
    const reason = it.locked ? it.locked() : null;
    if (reason) { toast(reason, 3.5); sfx('click'); return; }
    if (state.raid) { toast('Raiders are at your gates. You cannot leave now.', 3); return; }
    if (it.onEnter) it.onEnter();
    sfx('open'); enterMap(it.to, it.tx, it.ty);
  } else if (it.kind === 'relay') {
    if (it.done) { toast('This relay is already running.', 2); return; }
    it.done = true; const fl = state.mapFlags[state.map] = state.mapFlags[state.map] || {}; fl.relays = (fl.relays || 0) + 1; (fl['r' + it.n] = true);
    MAP_LIGHTS.push({ x: ((i % W) + 0.5) * TS, y: (Math.floor(i / W) + 0.5) * TS, r: 120 });
    toast('Relay ' + fl.relays + ' of 3 humming. The lights come up.', 3.5); sfx('levelup'); state.shakeT = 0.3;
    if (fl.relays >= 3) toast('All three are up. Something at the far end has unlocked.', 5);
    questEvent('relay:' + it.n);
  }
}
Object.assign(DBG, { getTarget, doTargetAction, enterMap, switchMap, MAPDEFS, STASH, SAVED, INTERACT, MAP_LIGHTS, snapshotMap, applyMap, packMap, curDark, mapName, corpseHere, genDungeonMap, useInteract });

/* ---------- The Spine ---------- */
MAPDEFS.spine = {
  id: 'spine', name: 'The Spine', zone: 8, theme: 'tunnel', seed: 4471, rooms: 6, dark: 0.86, rad: 0.1, layout: 'line', density: 0,
  mobs: [['husk', 3], ['stalker', 1], ['bloater', 0.5]], props: ['debris', 'bones', 'barrel', 'sign'],
  entry() { const r = this.rooms_[0]; return { x: r.cx - 1, y: r.cy }; },
  target() { const r = this.rooms_ && this.rooms_[5]; return r ? { x: (r.cx + 0.5) * TS, y: (r.cy + 0.5) * TS, label: 'The far end' } : null; },
  setup(rooms) {
    const fl = state.mapFlags.spine = state.mapFlags.spine || {};
    const at = (r, dx, dy) => (r.cy + dy) * W + r.cx + dx;
    INTERACT.set(at(rooms[0], -3, 0), { kind: 'portal', up: true, label: 'Stairs up to the Ash Tower', to: 'wastes', get tx() { return state.towerPortal ? state.towerPortal.x : 0; }, get ty() { return state.towerPortal ? state.towerPortal.y + 1 : 0; } });
    [1, 3, 4].forEach((k, n) => {
      const i = at(rooms[k], 0, -2), it = { kind: 'relay', n: n + 1, label: () => 'Relay panel ' + (n + 1) + (it.done ? ' (running)' : ''), done: !!fl['r' + (n + 1)] };
      INTERACT.set(i, it);
      if (it.done) MAP_LIGHTS.push({ x: ((i % W) + 0.5) * TS, y: (Math.floor(i / W) + 0.5) * TS, r: 120 });
    });
    MAP_LIGHTS.push({ x: (rooms[0].cx + 0.5) * TS, y: (rooms[0].cy + 0.5) * TS, r: 130 });
    INTERACT.set(at(rooms[5], 3, 0), { kind: 'portal', label: 'Sealed hatch to the coast', to: 'tidewrack', tx: -1, ty: -1, locked: () => ((state.mapFlags.spine && state.mapFlags.spine.relays) || 0) < 3 ? 'The hatch is dead. The three relay panels along the tunnel are not running.' : (MAPDEFS.tidewrack ? null : 'The hatch opens onto fog and salt air. The coast is not ready yet. Come back soon.'), onEnter() { questEvent('spine:end'); } });
  }
};
function setTowerPortal(spot) {
  state.towerPortal = spot;
  INTERACT.set(spot.i, { kind: 'portal', label: 'Stairs down. Do not take the stairs.', to: 'spine', tx: -1, ty: -1, locked: () => state.qflags.chapterOne ? null : 'Rubble blocks the stairs. You have not found a reason to go down yet.', onEnter() { questEvent('spine:enter'); } });
}
function placeTowerPortal() {
  INTERACT.clear();
  const s = SITE_DEFS.bunker;
  if (s.tile === undefined) return;
  const d = s.def, cx = s.tile % W, cy = Math.floor(s.tile / W);
  let spot = null;
  for (let r = 2; r < 8 && !spot; r++) for (let dy = -r; dy <= r && !spot; dy++) for (let dx = -r; dx <= r && !spot; dx++) {
    const x = cx + dx, y = cy + dy, i = y * W + x;
    if (x > d.x && y > d.y && x < d.x + d.w - 1 && y < d.y + d.h - 1 && tiles[i] === T.FLOOR && !objs[i] && !INTERACT.has(i)) spot = { x, y, i };
  }
  if (spot) setTowerPortal(spot);
}
{ const o = placeStorySites; placeStorySites = function () { o(); placeTowerPortal(); }; }
QUEST_DEFS.push({ id: 'stairs', title: 'Do Not Take the Stairs', giver: 'The Pump Ledger', desc: 'The ledger said to take the tag and leave the stairs alone. The tape said the coast was next. Under the Ash Tower, the stairs go down a very long way.',
  steps: [
    { id: 'down', text: 'Take the stairs under the Ash Tower', event: 'spine:enter' },
    { id: 'relays', text: 'Restart the three relay panels in the Spine', check: () => !!(state.mapFlags.spine && state.mapFlags.spine.relays >= 3), target: () => MAPDEFS.spine.target() },
    { id: 'end', text: 'Open the hatch at the far end', event: 'spine:end' }
  ], reward: { xp: 140, items: [{ name: 'Rad-Away', qty: 2 }, { name: 'Pistol rounds', qty: 8 }] }, next: [] });
{ const q = QUEST_DEFS.find(d => d.id === 'signal'); if (q && !q.next.includes('stairs')) q.next.push('stairs'); }

/* ---------- Saving and loading across maps ---------- */
{ const o = serialize; serialize = function () {
  const inDun = state.map !== 'wastes';
  let cur = null;
  if (inDun) { cur = snapshotMap(); applyMap(STASH.wastes); }
  const d = o();
  if (inDun) applyMap(cur);
  d.map = state.map; d.mapFlags = state.mapFlags; d.visited = state.visitedMaps; d.towerPortal = state.towerPortal; d.mapStates = {};
  for (const id of Object.keys(state.visitedMaps)) {
    if (id === 'wastes') continue;
    if (id === state.map) d.mapStates[id] = packMap(cur, state.mapFlags[id]);
    else if (STASH[id]) d.mapStates[id] = packMap(STASH[id], state.mapFlags[id]);
    else if (SAVED[id]) d.mapStates[id] = SAVED[id];
  }
  return d;
}; }
{ const o = loadGame; loadGame = function () {
  const d = state.pendingLoad;
  if (state.map !== 'wastes' && STASH.wastes) { applyMap(STASH.wastes); state.map = 'wastes'; }
  for (const k of Object.keys(STASH)) delete STASH[k];
  for (const k of Object.keys(SAVED)) delete SAVED[k];
  const ok = o();
  if (!ok || !d) return ok;
  state.map = 'wastes'; CAMP.active = false; state.transition = null;
  state.mapFlags = d.mapFlags || {}; state.visitedMaps = d.visited || { wastes: true }; state.towerPortal = d.towerPortal || null;
  INTERACT.clear(); if (state.towerPortal) setTowerPortal(state.towerPortal);
  for (const id of Object.keys(d.mapStates || {})) SAVED[id] = d.mapStates[id];
  if (d.map && d.map !== 'wastes') switchMap(d.map, Math.floor(d.player.x / TS), Math.floor(d.player.y / TS));
  return ok;
}; }
