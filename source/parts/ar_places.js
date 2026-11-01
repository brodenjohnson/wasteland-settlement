/* =====================================================================
   AR_PLACES: where the ways in sit, how players hear about the Hull, and
   keeping the town safe. Also hands the wiki its pictures.
   ===================================================================== */
VALUE['Hollowclaw Hide'] = 60;

/* ---------- The Hull is safe ground: nothing ambushes you in town ---------- */
const inTown = () => state.map === 'hull' || state.map.startsWith('hull_');
{ const o = updateZone; updateZone = function (dt) {
  if (!inTown()) return o(dt);
  state.threat = 0; state.ambushWarn = 0; o(dt); state.threat = 0;
  for (let k = enemies.length - 1; k >= 0; k--) if (!enemies[k].hidden) enemies.splice(k, 1);
}; }

/* ---------- Ways in at the edges of the map, with roads that lead to them ---------- */
const EDGE_SPOTS = { hull: [118, 118], megamart: [120, 60], pylon3: [100, 11] };
function spotNear(x0, y0) {
  for (let r = 0; r < 7; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
    const x = x0 + dx, y = y0 + dy, i = y * W + x;
    if (x < 3 || y < 3 || x >= W - 3 || y >= H - 3 || structs.has(i) || [T.WATER, T.CLIFF, T.RUBBLE].includes(tiles[i])) continue;
    for (let yy = -1; yy <= 1; yy++) for (let xx = -1; xx <= 1; xx++) objs[(y + yy) * W + x + xx] = 0;
    return { x, y, i };
  }
  return null;
}
function clearRoadObjs() { for (let i = 0; i < W * H; i++) if (tiles[i] === T.ROAD && objs[i] && (i % W > 96 || Math.floor(i / W) < 16)) objs[i] = 0; }
function moveEdgePortals(into) {
  for (const [id, [x, y]] of Object.entries(EDGE_SPOTS)) {
    const fl = state.mapFlags[id] = state.mapFlags[id] || {};
    if (fl.edge) continue;
    if (fl.portal && into) into.delete(fl.portal.i);
    const s = spotNear(x, y); if (s) { fl.portal = s; fl.edge = true; }
  }
  clearRoadObjs();
}
{ const o = placeStorySites; placeStorySites = function () { moveEdgePortals(null); o(); }; }
{ const o = loadGame; loadGame = function () {
  const ok = o();
  if (ok && Object.keys(EDGE_SPOTS).some(id => !(state.mapFlags[id] && state.mapFlags[id].edge))) {
    const into = state.map === 'wastes' ? INTERACT : (STASH.wastes && STASH.wastes.interact);
    if (into) { moveEdgePortals(into); setDungeonPortals(into); setHullPortal(into); }
  }
  return ok;
}; }

/* ---------- Hearing about the Hull ---------- */
function markHull(why) {
  const p = state.mapFlags.hull && state.mapFlags.hull.portal;
  if (!p || state.qflags.hull_marked) return false;
  state.qflags.hull_marked = true;
  state.markers.push({ id: ++markSeq, kind: 'rumour', tx: p.x, ty: p.y, label: 'The Hull', revealed: true, poi: { x: p.x, y: p.y, name: 'The Hull' }, tracked: false });
  if (why) toast(why, 6);
  return true;
}
{ const o = updateZone; updateZone = function (dt) {
  o(dt);
  if (state.map === 'wastes' && state.zone === 5 && !state.qflags.hull_marked) markHull('Smoke on the horizon, south-east, past the marsh. Somebody is living out there. It is on your map: The Hull.');
}; }
{ const o = npcReply; npcReply = function (npc, topic) {
  if (npc.kind === 'merchant' && topic === 'road' && !state.qflags.hull_marked && markHull()) return 'Heading anywhere near the coast? There is a town out past the marsh, built around a ship that ran aground. The Hull. Proper shops, a doctor, a bed. Follow the road south-east until it runs out. (They mark it on your map.)';
  return o(npc, topic);
}; }
// the ways in can turn up in rumours, like any ruin
{ const o = poiList; poiList = function () {
  const out = o();
  for (const [id, D] of Object.entries(DUNGEONS)) { const fl = state.mapFlags[id]; if (fl && fl.portal) out.push({ x: fl.portal.x, y: fl.portal.y, name: D.name }); }
  const h = state.mapFlags.hull && state.mapFlags.hull.portal; if (h && !state.qflags.hull_marked) out.push({ x: h.x, y: h.y, name: 'The Hull' });
  return out;
}; }

/* ---------- Pictures and places for the wiki ---------- */
function wikiArt() {
  const items = {}, creatures = {};
  const names = new Set([...Object.keys(VALUE), ...Object.keys(ITEM_DESC), ...Object.keys(WEAPONS), ...Object.keys(ARMOUR), ...Object.keys(BP_ITEMS)]);
  for (const n of names) { if (STORY_ITEMS.has(n)) continue; const c = document.createElement('canvas'); c.width = c.height = 48; const g = c.getContext('2d'); try { iconTo(g, n, 0, 0, 48); items[n] = c.toDataURL(); } catch (e) { /* no icon */ } }
  for (const t in ENEMY_SPR) { if (!ENEMY_TYPES[t]) continue; const sp = ENEMY_SPR[t]; try { creatures[t] = makeSprite('E|' + t + '|0', sp.w, sp.h, c => sp.paint(c, 0)).toDataURL(); } catch (e) { /* no sprite */ } }
  return { items, creatures };
}
function wikiWhere() {
  const out = {};
  for (const s of survivors) if (s.name) { const z = zoneMap[Math.floor(s.y / TS) * W + Math.floor(s.x / TS)] || 0; out[s.name] = ZONE_NAMES[z]; }
  for (const id of ['hull', ...Object.keys(DUNGEONS)]) { const p = state.mapFlags[id] && state.mapFlags[id].portal; if (p) out['portal:' + id] = [p.x, p.y, ZONE_NAMES[zoneMap[p.i] || 0]]; }
  return out;
}
Object.assign(DBG, { wikiArt, wikiWhere, markHull, inTown, spotNear, decorKinds: () => decor.map(d => d.kind) });
