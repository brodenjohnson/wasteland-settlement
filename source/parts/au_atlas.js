/* =====================================================================
   AU_ATLAS: the place registry (docs/WORLD_DESIGN.md), discovery, map markers
   with danger pips, a counter per region, found logs and pictures in the codex,
   and a cap on how many maps are kept in memory.
   ===================================================================== */
const REGIONS = {
  1: { name: 'The Valley and Wastes', map: 'wastes', band: [1, 6] },
  2: { name: 'The Hull Coast', map: 'tidewrack', band: [4, 9] }
};
const PLACE_KIND_NAMES = { friendly: 'Friendly', hostile: 'Hostile camp', dungeon: 'Dungeon', find: 'Find', landmark: 'Landmark', secret: 'Secret', lair: 'Lair', hub: 'Town' };
const portalAt = id => () => { const p = state.mapFlags[id] && state.mapFlags[id].portal; return p ? { x: p.x, y: p.y } : null; };
const siteAt = key => () => { const s = sitePos(key); return { x: s.x / TS, y: s.y / TS }; };
const ruinAt = kind => () => { const r = ruins.find(q => q.kind === kind); return r ? { x: r.x0 + r.w / 2, y: r.y0 + r.h / 2 } : null; };
// at(): where the place is on the Wastes, in tiles. map: the map you enter. reveal: how close you must get (tiles).
const PLACES = [
  { id: 'hull', name: 'The Hull', region: 1, kind: 'hub', danger: 1, loot: 'trade', map: 'hull', at: portalAt('hull'), reveal: 14, hub: true,
    hook: 'A town built around a ship that ran aground. Shops, a doctor, a bed. Nobody shoots at you here.' },
  { id: 'depot', name: 'Depot Office', region: 1, kind: 'find', danger: 1, loot: 'supplies', at: siteAt('depot'), reveal: 10,
    hook: 'A freight office in the Scrapyard. Somebody left the paperwork for you.' },
  { id: 'pump', name: 'Pump House', region: 1, kind: 'find', danger: 2, loot: 'supplies', at: siteAt('pump'), reveal: 10,
    hook: 'A pump house in the marsh. Whoever kept it kept a ledger.' },
  { id: 'ashtower', name: 'The Ash Tower', region: 1, kind: 'landmark', danger: 2, loot: 'radio', at: siteAt('bunker'), reveal: 30,
    hook: 'A radio mast you can see from half the map, with a bunker underneath.' },
  { id: 'spine', name: 'The Spine', region: 1, kind: 'dungeon', size: 'large', danger: 3, loot: 'radio', map: 'spine', at: siteAt('bunker'), reveal: 0, hidden: true,
    hook: 'A service tunnel under the Ash Tower. The cable on the wall hums.' },
  { id: 'greybridge', name: 'Greybridge Depot', region: 1, kind: 'lair', danger: 3, loot: 'weapons', map: 'camp', at: ruinAt('armoury'), reveal: 8, hidden: true,
    hook: 'An old cargo yard run by a man who keeps a cage for the ones who owe him.' },
  { id: 'deepcut', name: 'Deepcut', region: 1, kind: 'dungeon', size: 'large', danger: 4, loot: 'materials', map: 'deepcut', at: portalAt('deepcut'), reveal: 8, hidden: true,
    hook: 'A collapsed quarry mine. Something big lives at the bottom.' },
  { id: 'hollow', name: 'The Hollow', region: 1, kind: 'dungeon', size: 'small', danger: 3, loot: 'weapons', map: 'hollow', at: portalAt('hollow'), reveal: 8, hidden: true,
    hook: 'Caves under the pines. A warden held the last room.' },
  { id: 'megamart', name: 'MegaMart', region: 1, kind: 'dungeon', size: 'large', danger: 3, loot: 'supplies', map: 'megamart', at: portalAt('megamart'), reveal: 8, hidden: true,
    hook: 'A collapsed megastore. The staff are still on shift.' },
  { id: 'pylon3', name: 'Pylon 3', region: 1, kind: 'dungeon', size: 'small', danger: 3, loot: 'radio', map: 'pylon3', at: portalAt('pylon3'), reveal: 8, hidden: true,
    hook: 'A radio station in the north. The air is hot with more than static.' },
  { id: 'tidewrack', name: 'The Tidewrack', region: 2, kind: 'landmark', danger: 3, loot: 'supplies', map: 'tidewrack', at: () => null, reveal: 0, hidden: true,
    hook: 'A drowned coast of fog and salt. The tide decides which streets exist.' }
];
const PLACE_BY_ID = Object.fromEntries(PLACES.map(p => [p.id, p]));
for (const p of PLACES) if (!PLACE_LORE[p.name]) PLACE_LORE[p.name] = p.hook;
state.places = {};
function placeState(id) { return state.places[id]; }
function placeSeen(id) { return !!(state.places[id] && state.places[id].seen); }
function regionOf() { for (const [k, r] of Object.entries(REGIONS)) if (r.map === state.map) return +k; return 0; }
function regionCount(rg) { const list = PLACES.filter(p => p.region === rg); return { found: list.filter(p => placeSeen(p.id)).length, total: list.length }; }

/* ---------- Markers: a discovered place is a marker, so tracking and the compass just work ---------- */
function placeMarker(pl) {
  const pos = pl.at && pl.at(); if (!pos || pl.region !== 1) return;
  let m = state.markers.find(q => q.placeId === pl.id) || state.markers.find(q => q.kind === 'rumour' && ((q.poi && q.poi.name === pl.name) || q.label === pl.name));
  if (!m) { m = { id: ++markSeq, kind: 'rumour', tracked: false }; state.markers.push(m); }
  Object.assign(m, { placeId: pl.id, tx: pos.x, ty: pos.y, label: pl.name, revealed: true, poi: { x: pos.x, y: pos.y, name: pl.name } });
}
function discoverPlace(id, quiet) {
  const pl = PLACE_BY_ID[id]; if (!pl || placeSeen(id)) return false;
  state.places[id] = Object.assign(state.places[id] || {}, { seen: true, day: clockDay() });
  placeMarker(pl);
  codexFind('places', pl.name, pl.name, 1, true);
  if (!quiet) {
    state.stinger = { title: pl.name, sub: (PLACE_KIND_NAMES[pl.kind] || '') + '   ' + REGIONS[pl.region].name, danger: pl.danger, t: 0 };
    sfx('levelup'); skillXp('exploring', 8);
  }
  return true;
}
let atlasT = 0;
function updateDiscovery(dt) {
  atlasT -= dt;
  if (atlasT > 0 || state.title) return;
  atlasT = 0.5;
  const p = state.player, tx = p.x / TS, ty = p.y / TS;
  for (const pl of PLACES) {
    if (placeSeen(pl.id)) continue;
    if (pl.map && (state.map === pl.map || (pl.map === 'hull' && state.map.startsWith('hull_')))) { discoverPlace(pl.id); continue; }
    if (state.map !== 'wastes' || pl.region !== 1 || !pl.reveal) continue;
    const pos = pl.at(); if (pos && Math.hypot(pos.x - tx, pos.y - ty) < pl.reveal) discoverPlace(pl.id);
  }
}
{ const o = updateStorm; updateStorm = function (dt) { o(dt); updateDiscovery(dt); if (state.stinger && (state.stinger.t += dt) > 4.5) state.stinger = null; }; }
// a place you have already found does not come back as a rumour
{ const o = poiList; poiList = function () { const seen = new Set(PLACES.filter(p => placeSeen(p.id)).map(p => p.name)); return o().filter(q => !seen.has(q.name)); }; }

// old saves: count what the save already shows, quietly
function backfillPlaces() {
  const v = state.visitedMaps || {}, q = state.qflags || {};
  const had = { depot: q['read:Dispatch Slip'] || q['read:Brass Tag'], pump: q['read:Pump Ledger'], ashtower: q['read:Signal Tape'] || v.spine, hull: q.hull_found };
  for (const pl of PLACES) if (!placeSeen(pl.id) && ((pl.map && v[pl.map]) || had[pl.id] || (pl.map === 'hull' && Object.keys(v).some(k => k.startsWith('hull_'))))) discoverPlace(pl.id, true);
  for (const pl of PLACES) if (placeSeen(pl.id)) placeMarker(pl);
}
{ const o = serialize; serialize = function () { const d = o(); d.places = state.places; return d; }; }
{ const o = loadGame; loadGame = function () {
  const d = state.pendingLoad, ok = o();
  if (ok) { state.places = (d && d.places) || {}; state.stinger = null; backfillPlaces(); }
  return ok;
}; }

/* ---------- Drawing: pips on the big map, the counter, the stinger ---------- */
function drawPips(x, y, n, size) {
  const s = size || 3, gap = s + 1, x0 = x - (5 * gap - 1) / 2;
  for (let k = 0; k < 5; k++) { ctx.fillStyle = '#000'; ctx.fillRect(x0 + k * gap - 0.5, y - 0.5, s + 1, s + 1); ctx.fillStyle = k < n ? (n >= 4 ? '#e8503a' : n >= 3 ? '#e8a04a' : '#e8d84a') : '#3a332c'; ctx.fillRect(x0 + k * gap, y, s, s); }
}
{ const o = drawMarkersBig; drawMarkersBig = function (px, py, S) {
  o(px, py, S);
  for (const m of state.markers) {
    const pl = m.placeId && PLACE_BY_ID[m.placeId]; if (!pl || !placeSeen(pl.id)) continue;
    drawPips(px + 6 + m.tx / W * S, py + 6 + m.ty / H * S + 19, pl.danger, 4);
  }
}; }
{ const o = drawBigMapExtras; drawBigMapExtras = function (px, py, S) {
  o(px, py, S);
  const rg = regionOf(); if (!rg) return;
  const c = regionCount(rg), txt = REGIONS[rg].name + ': ' + c.found + ' of ' + c.total + ' places found';
  ctx.font = '10px ' + MONO; const tw = ctx.measureText(txt).width + 14;
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(px + 10, py + 10, tw, 18);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffe9b0'; ctx.fillText(txt, px + 17, py + 19.5);
}; }
{ const o = drawHUD; drawHUD = function (label) {
  o(label);
  const st = state.stinger; if (!st || state.title) return;
  const w = window.innerWidth, a = Math.min(1, st.t / 0.4, (4.5 - st.t) / 0.8);
  ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.globalAlpha = Math.max(0, a);
  const y = 118;
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(w / 2 - 190, y - 22, 380, 70);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#b8a890'; ctx.fillText('DISCOVERED', w / 2, y - 10);
  ctx.font = '18px ' + MONO; ctx.fillStyle = '#000'; ctx.fillText(st.title, w / 2 + 1, y + 9); ctx.fillStyle = '#ffe9b0'; ctx.fillText(st.title, w / 2, y + 8);
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#c8b8a0'; ctx.fillText(st.sub, w / 2, y + 28);
  drawPips(w / 2, y + 38, st.danger, 4);
  ctx.restore();
}; }

/* ---------- Found logs: everything you have read, by thread ---------- */
const LOG_THREADS = ['The Eleven', 'The broadcast', 'The Long Table', 'The Meridian Trust', 'Capacity', 'While they slept', 'Local stories'];
const DOC_THREAD = { 'Folded Note': 'The Eleven', 'Dispatch Slip': 'The Eleven', 'Pump Ledger': 'The Eleven', 'Signal Tape': 'The broadcast', 'Director Log 2': 'The Eleven', 'Director Log 3': 'The Eleven',
  'The Long Table': 'The Long Table', 'Minutes of the Vote': 'The Long Table', 'Director Code Card': 'The Long Table' };
function foundLogs() {
  const out = [];
  for (const n of Object.keys(DOCS)) out.push({ id: 'doc:' + n, thread: DOC_THREAD[n] || (/^Tag Card/.test(n) ? 'The Eleven' : 'Local stories'), title: DOCS[n].title || n, read: !!state.qflags['read:' + n], open() { closePanels(); state.reading = n; } });
  for (const [id, D] of Object.entries(DUNGEONS)) if (D.term && SCRIPTS[D.term]) out.push({ id: 'term:' + id, thread: 'Local stories', title: 'Terminal, ' + D.name, read: !!state.qflags['read:Terminal ' + id], open() { closePanels(); startDialogue(D.term); } });
  return out;
}
function threadCounts() {
  const logs = foundLogs(), out = {};
  for (const t of LOG_THREADS) { const l = logs.filter(g => g.thread === t); if (l.length) out[t] = { read: l.filter(g => g.read).length, total: l.length }; }
  return out;
}

/* ---------- The codex: places from the registry, found logs, and pictures ---------- */
CODEX_TABS.push('Found logs');
{ const o = codexUniverse; codexUniverse = function () {
  const lists = o();
  for (const pl of PLACES) if (!lists[3].some(e => e.key === pl.name)) lists[3].push({ key: pl.name, label: pl.name, found: placeSeen(pl.id) || !!state.codex.places[pl.name] });
  const logs = foundLogs(), counts = threadCounts(), rows = [];
  for (const t of LOG_THREADS) {
    if (!counts[t]) continue;
    rows.push({ key: 'thread:' + t, label: '-- ' + t + '  ' + counts[t].read + '/' + counts[t].total, found: true, hdr: true });
    for (const g of logs.filter(q => q.thread === t)) rows.push({ key: g.id, label: '   ' + g.title, found: g.read });
  }
  lists.push(rows);
  return lists;
}; }
function codexPicture(tab, key, x, y) {
  const box = (w, h) => { ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x - 4, y - 4, w + 8, h + 8); ctx.strokeStyle = 'rgba(233,226,212,0.2)'; ctx.strokeRect(x - 3.5, y - 3.5, w + 7, h + 7); };
  ctx.imageSmoothingEnabled = false;
  if (tab === 0 && ENEMY_SPR[key]) {
    const sp = ENEMY_SPR[key], img = makeSprite('E|' + key + '|0', sp.w, sp.h, c => sp.paint(c, 0)), k = Math.max(1, Math.floor(Math.min(96 / sp.w, 96 / sp.h)));
    box(96, 96); ctx.drawImage(img, x + (96 - sp.w * k) / 2, y + (96 - sp.h * k) / 2, sp.w * k, sp.h * k);
  } else if (tab === 2) {
    const n = [...survivors, ...settlers, ...encNpcs].find(q => q.name === key && q.look); if (!n) return;
    const img = npcSprite(n, 0); box(96, 96); ctx.drawImage(img, x + (96 - 66) / 2, y + (96 - 93) / 2, 66, 93);
  } else if (tab === 3 && state.map === 'wastes') {
    const pl = PLACES.find(p => p.name === key), pos = pl && pl.at && pl.at(); if (!pos || pl.region !== 1) return;
    const r = 14, sx = Math.max(0, Math.min(W - 2 * r, pos.x - r)), sy = Math.max(0, Math.min(H - 2 * r, pos.y - r)), k = mini.width / W;
    box(96, 96); ctx.drawImage(mini, sx * k, sy * k, 2 * r * k, 2 * r * k, x, y, 96, 96);
    ctx.fillStyle = '#ffd36b'; ctx.fillRect(x + (pos.x - sx) / (2 * r) * 96 - 2, y + (pos.y - sy) / (2 * r) * 96 - 2, 4, 4);
  }
  ctx.imageSmoothingEnabled = true;
}
{ const o = codexDetail; codexDetail = function (tab, key, dx, y, dw) {
  if (tab === 4) return logDetail(key, dx, y, dw);
  const pl = tab === 3 && PLACES.find(p => p.name === key);
  if (tab === 0 || tab === 2 || pl) codexPicture(tab, key, dx + dw - 100, y - 6);
  const narrow = (tab === 0 || tab === 2 || pl) ? dw - 116 : dw;
  o(tab, key, dx, y, narrow);
  if (pl) {
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = '10px ' + MONO; ctx.fillStyle = '#b8a890';
    const yy = y + 150;
    ctx.fillText(REGIONS[pl.region].name + '    ' + (PLACE_KIND_NAMES[pl.kind] || ''), dx, yy);
    ctx.fillText('Danger', dx, yy + 18); drawPips(dx + 70, yy + 16, pl.danger, 5);
    if (pl.hub) { ctx.fillStyle = '#8fd0ff'; ctx.fillText('A hub: somewhere to rest and trade.', dx, yy + 36); }
  }
}; }
function logDetail(key, dx, y, dw) {
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  if (key.startsWith('thread:')) {
    const t = key.slice(7), c = threadCounts()[t] || { read: 0, total: 0 };
    ctx.font = '15px ' + MONO; ctx.fillStyle = '#ffe9b0'; ctx.fillText(t, dx, y); y += 26;
    ctx.font = '11px ' + MONO; ctx.fillStyle = '#e8dcc0'; ctx.fillText(c.read + ' of ' + c.total + ' found.', dx, y); y += 22;
    ctx.fillStyle = '#b8a890'; wrapText(c.read < c.total ? 'There is more of this one out there.' : 'You have found every piece of this one so far.', dw).forEach(l => { ctx.fillText(l, dx, y); y += 15; });
    return;
  }
  const g = foundLogs().find(q => q.id === key); if (!g) return;
  ctx.font = '15px ' + MONO; ctx.fillStyle = '#ffe9b0'; ctx.fillText(g.title, dx, y); y += 24;
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#b8a890'; ctx.fillText(g.thread, dx, y); y += 24;
  if (g.id.startsWith('doc:')) { const d = DOCS[g.id.slice(4)]; ctx.font = '11px ' + MONO; ctx.fillStyle = '#e8dcc0'; d.text.split('\n').forEach(par => { (par ? wrapText(par, dw) : ['']).forEach(l => { if (y < window.innerHeight - 90) { ctx.fillText(l, dx, y); y += 15; } }); }); y += 10; }
  button(dx, Math.min(y, window.innerHeight - 100), 150, 24, g.id.startsWith('doc:') ? 'Read it again' : 'Use the terminal again', () => g.open());
}

/* ---------- Memory: keep only the last few maps; the rest are packed like a save ---------- */
const MAP_KEEP = 3, mapRecent = [];
function evictMaps() {
  for (const k of Object.keys(STASH)) {
    if (k === 'wastes' || k === state.map || mapRecent.slice(-MAP_KEEP).includes(k)) continue;
    SAVED[k] = packMap(STASH[k], state.mapFlags[k]); SAVED[k].drops = STASH[k].drops; delete STASH[k];
  }
}
{ const o = switchMap; switchMap = function (id, tx, ty) {
  const from = state.map, drops = SAVED[id] && SAVED[id].drops;
  o(id, tx, ty);
  if (drops && state.map === id) state.drops = drops;
  for (const k of [from, id]) { const i = mapRecent.indexOf(k); if (i >= 0) mapRecent.splice(i, 1); mapRecent.push(k); }
  evictMaps();
}; }

Object.assign(DBG, { PLACES, REGIONS, discoverPlace, placeSeen, regionCount, backfillPlaces, foundLogs, threadCounts, codexUniverse, codexDetail, switchMap, poiList, evictMaps, mapRecent, drawPips });
