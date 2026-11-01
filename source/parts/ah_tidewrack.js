/* =====================================================================
   AH_TIDEWRACK: the coast. Tides, fog, a lighthouse, a drowned town, a wreck
   field, the Listeners, and a door that does not open yet.
   ===================================================================== */
/* ---------- Creatures ---------- */
Object.assign(ENEMY_TYPES, {
  wrackcrab: { name: 'Wrack crab', hp: 60, dmg: 12, speed: 52, size: 10, aggro: 150, atkCd: 0.9, xp: 14, structMult: 1 },
  drowned: { name: 'The Drowned', hp: 110, dmg: 18, speed: 30, size: 12, aggro: 160, atkCd: 1.4, xp: 26, structMult: 1 },
  zealot: { name: 'Listener zealot', hp: 75, dmg: 15, speed: 46, size: 11, aggro: 220, atkCd: 1.2, xp: 24, structMult: 1 },
  wrackmother: { name: 'The Wrack Mother', hp: 650, dmg: 14, speed: 34, size: 16, aggro: 220, atkCd: 1.1, xp: 240, structMult: 3, boss: true }
});
Object.assign(LVL_OFF, { wrackcrab: [-1, 1], drowned: [0, 2], zealot: [0, 1], wrackmother: [3, 5] });
Object.assign(ENEMY_SPR, {
  wrackcrab: { w: 16, h: 10, paint: (c, f) => { R(c, '#a8503a', 3, 3, 10, 5); R(c, '#c26a4a', 4, 3, 8, 2); R(c, '#c26a4a', 0 + f, 1, 3, 3); R(c, '#c26a4a', 13 - f, 1, 3, 3); R(c, '#8a3a2a', 0 + f, 1, 1, 1); R(c, '#8a3a2a', 15 - f, 1, 1, 1); for (let k = 0; k < 3; k++) { R(c, '#7a3326', 3 + k * 2 + (f ? 1 : 0), 8, 1, 2); R(c, '#7a3326', 10 + k - (f ? 1 : 0), 8, 1, 2); } R(c, '#e8e0d0', 5, 2, 1, 1); R(c, '#e8e0d0', 10, 2, 1, 1); R(c, '#14120f', 5, 3, 1, 1); R(c, '#14120f', 10, 3, 1, 1); } },
  wrackmother: { w: 32, h: 22, paint: (c, f) => { R(c, '#8a3a2a', 5, 6, 22, 11); R(c, '#a8503a', 6, 6, 20, 4); R(c, '#c26a4a', 8, 6, 8, 2); for (let k = 0; k < 5; k++) R(c, '#6a2a1e', 8 + k * 4, 4 + (k % 2), 2, 3);
    R(c, '#a8503a', 0 + f, 2, 7, 7); R(c, '#a8503a', 25 - f, 2, 7, 7); R(c, '#6a2a1e', 3 + f, 2, 2, 4); R(c, '#6a2a1e', 27 - f, 2, 2, 4);
    for (let k = 0; k < 4; k++) { R(c, '#6a2a1e', 6 + k * 3 + (f ? 1 : 0), 17, 2, 4); R(c, '#6a2a1e', 17 + k * 3 - (f ? 1 : 0), 17, 2, 4); }
    R(c, '#e8c24a', 11, 4, 2, 2); R(c, '#e8c24a', 19, 4, 2, 2); R(c, '#14120f', 12, 5, 1, 1); R(c, '#14120f', 20, 5, 1, 1); R(c, '#14120f', 13, 12, 6, 2); R(c, '#e8e0d0', 14, 13, 1, 1); R(c, '#e8e0d0', 17, 13, 1, 1); } },
  drowned: { w: 24, h: 34, paint: (c, f) => { paintHuman2(c, f, { legs: '#2a3a3a', body: '#3a4a4a', skin: '#8aa8a0', eye: '#c8f0e0', hair: '#2a4a3a', hunch: true }); R(c, '#2a5a3a', 6, 12, 1, 6); R(c, '#2a5a3a', 11, 14, 1, 5); R(c, '#3a7a4a', 8, 22, 1, 5); } },
  zealot: { w: 24, h: 34, paint: (c, f) => { paintHuman2(c, f, { legs: '#2a2a30', body: '#4a5a6a', skin: '#b09a8a', eye: '#14120f', hood: '#5a6a7a', accent: '#c8c8d0', club: true }); } }
});
Object.assign(DROPS, { wrackcrab: [{ n: 'Raw Meat', c: 0.6, a: 1, b: 2 }, { n: 'Scrap', c: 0.4, a: 1, b: 2 }], drowned: [{ n: 'Cloth', c: 0.6, a: 1, b: 3 }, { n: 'Scrap', c: 0.5, a: 1, b: 3 }, { n: 'Rad tabs', c: 0.15, a: 1, b: 1 }], zealot: [{ n: 'Bandage', c: 0.4, a: 1, b: 2 }, { n: 'Pistol rounds', c: 0.5, a: 3, b: 6 }, { n: 'Cloth', c: 0.5, a: 1, b: 2 }],
  wrackmother: [{ n: 'Crabshell Vest', c: 1, a: 1, b: 1 }, { n: 'Raw Meat', c: 1, a: 5, b: 7 }, { n: 'Metal plate', c: 1, a: 3, b: 4 }] });
Object.assign(CREATURE_LORE, { wrackcrab: 'Grown fat on the wrecks. It does not hunt so much as defend a wreck, and every wreck is its.', drowned: 'It walked into the water and kept walking. It has come back up to see whether anyone followed.', zealot: 'A Listener who stopped asking what the voice wanted and started doing it.', wrackmother: 'The oldest thing on the coast. It has been eating the wrecks for longer than there have been wrecks to eat.' });
Object.assign(ARMOUR, { 'Crabshell Vest': { slot: 'body', dmg: 0.30, rad: 0.15, col: '#a8503a' } });
ITEM_STACK['Crabshell Vest'] = 1; ITEM_COL['Crabshell Vest'] = '#a8503a'; ITEM_TIER['Crabshell Vest'] = 3; ITEM_DESC['Crabshell Vest'] = 'Overlapping plates of crab shell, laced together. It smells terrible and it works.';
{ const o = overlayBody; overlayBody = function (c, name, dir, side) {
  if (name === 'Crabshell Vest') { const tx = side ? 5 : 3, tw = side ? 8 : 12; R(c, '#a8503a', tx, 11, tw, 10); for (let k = 0; k < 3; k++) { R(c, '#c26a4a', tx, 11 + k * 3, tw, 1); R(c, '#7a3326', tx, 13 + k * 3, tw, 1); } R(c, '#c26a4a', tx - 1, 11, 2, 3); R(c, '#c26a4a', tx + tw - 1, 11, 2, 3); }
  else o(c, name, dir, side);
}; }
{ const o = updateEnemies; updateEnemies = function (dt) {
  for (const e of enemies) if (e.type === 'wrackmother' && !e.p1 && e.hp < (e.maxHp || 900) * 0.5) { e.p1 = true; state.shakeT = 0.5; sfx('thunder'); toast('The Wrack Mother screams. The wrecks answer.', 3.5); for (let k = 0; k < 3; k++) { const s = spawnEnemy('wrackcrab', e.x + (k - 1) * 46, e.y + 36, {}); s.aggro = true; } }
  o(dt);
}; }

/* ---------- Items, logs and the tag count ---------- */
Object.assign(DOCS, {
  'Director Log 2': { title: 'Director Log 2', text: 'Log two. The reserve will not take everyone. That is not a policy. It is arithmetic. We have agreed that we will not discuss the arithmetic in front of the people it is about.' },
  'Director Log 3': { title: 'Director Log 3', text: 'Log three. I have been asked to decide who the Rest are. I have decided to let the system decide. I want it on the record that I knew that was also a decision.' }
});
for (const n of ['Director Log 2', 'Director Log 3', 'Manifest Case']) { STORY_ITEMS.add(n); ITEM_COL[n] = n === 'Manifest Case' ? '#2a2a30' : '#c8c0a0'; ITEM_STACK[n] = 1; }
ITEM_DESC['Director Log 2'] = ITEM_DESC['Director Log 3'] = 'Readable. Open your bag and right-click it.'; ITEM_DESC['Manifest Case'] = 'Black, waterproof, brass corners. Heavier than it looks. Odile is waiting for it.';
function tagsHeld() { let n = 0; for (let i = 1; i <= 10; i++) if (countItem('Tag Card ' + i) > 0) n++; return n; }
QUEST_DEFS.push({ id: 'lamplighter', title: 'The Lamplighter', giver: 'Odile Marr', desc: 'Odile wants a black case that went down with a supply barge in the Wreck Fields. It can only be reached at low tide.',
  steps: [ { id: 'case', text: 'Recover the Manifest Case from the Wreck Fields at low tide', check: () => countItem('Manifest Case') >= 1 || !!state.qflags.lamplighter_done, target: () => tideTarget(3) },
           { id: 'give', text: 'Bring the case to Odile at Lamp Cove', event: 'lamp:given', target: () => tideTarget(1) } ],
  reward: { xp: 200, items: [{ name: 'Bandage', qty: 3 }] }, next: ['quorum'] });
QUEST_DEFS.push({ id: 'quorum', title: 'Quorum', giver: 'Odile Marr', desc: 'The Cradle will not open for one hand. Six of the eleven tags must be carried to the door.',
  steps: [ { id: 'tags', text: 'Carry six Tag Cards', check: () => tagsHeld() >= 6 },
           { id: 'chapel', text: 'Get past the Listeners at Chapel Row', check: () => !!state.qflags.chapel_open, target: () => tideTarget(4) },
           { id: 'console', text: 'Read the console at the Cradle door', event: 'console:read', target: () => tideTarget(5) } ],
  reward: { xp: 400, items: [{ name: 'Medkit', qty: 2 }] }, next: [] });
function tideTarget(k) { const r = MAPDEFS.tidewrack.rooms_ && MAPDEFS.tidewrack.rooms_[k]; return state.map === 'tidewrack' && r ? { x: (r.cx + 0.5) * TS, y: (r.cy + 0.5) * TS, label: ['', 'Lamp Cove', 'Saltmere', 'Wreck Fields', 'Chapel Row', 'The Breakwater'][k] } : null; }

/* ---------- Tides and fog ---------- */
const flood = new Set(); let tideHigh = false, tideSeen = null;
function tideIsHigh() { return ((state.gameMinutes / 60) % 12) < 6; }
function tideTimeLeft() { const m = (state.gameMinutes % 360); return Math.round(360 - m); }
{ const o = collides; collides = function (x, y, size, isPlayer) {
  if (o(x, y, size, isPlayer)) return true;
  if (tideHigh && flood.size && state.map === 'tidewrack') { const h = (size || 8) / 2 - 1; for (const [dx, dy] of [[-h, -h], [h, -h], [-h, h], [h, h]]) if (flood.has(Math.floor((y + dy) / TS) * W + Math.floor((x + dx) / TS))) return true; }
  return false;
}; }
function dryNear(tx, ty) { for (let r = 1; r < 14; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const i = (ty + dy) * W + tx + dx; if (tiles[i] === T.FLOOR && !flood.has(i) && !structs.has(i) && !INTERACT.has(i)) return { x: tx + dx, y: ty + dy }; } return null; }
function updateTide(dt) {
  if (state.map !== 'tidewrack') { tideSeen = null; return; }
  tideHigh = tideIsHigh();
  if (tideSeen === null) tideSeen = tideHigh; else if (tideSeen !== tideHigh) { tideSeen = tideHigh; toast(tideHigh ? 'The tide is coming in. The wreck fields will be under water.' : 'The tide is going out. The sea floor is showing.', 4); sfx('thunder'); }
  const p = state.player, i = Math.floor(p.y / TS) * W + Math.floor(p.x / TS);
  if (tideHigh && flood.has(i)) { const d = dryNear(i % W, Math.floor(i / W)); if (d) { p.x = (d.x + 0.5) * TS; p.y = (d.y + 0.5) * TS; toast('The tide catches you and throws you up the shingle.', 3); state.shakeT = 0.4; p.health = Math.max(1, p.health - 8); } }
}
{ const o = drawGroundOverlay; drawGroundOverlay = function (tx, ty, time) {
  o(tx, ty, time);
  if (state.map !== 'tidewrack') return;
  const i = ty * W + tx; if (!flood.has(i)) return;
  const x = tx * TS, y = ty * TS;
  if (tideHigh) { ctx.fillStyle = 'rgba(34,84,104,0.86)'; ctx.fillRect(x, y, TS, TS); ctx.fillStyle = 'rgba(200,236,244,0.35)'; for (let k = 0; k < 2; k++) ctx.fillRect(x + ((k * 7 + time * 6 + tx * 3) % 14), y + 3 + k * 7 + Math.sin(time * 2 + tx + k) * 1.5, 5, 1); }
  else { ctx.fillStyle = 'rgba(70,130,150,0.16)'; ctx.fillRect(x, y, TS, TS); if (((tx * 7 + ty * 3 + Math.floor(time)) % 9) === 0) { ctx.fillStyle = 'rgba(220,240,246,0.3)'; ctx.fillRect(x + 4, y + 6, 6, 1); } }
}; }
{ const o = updateStorm; updateStorm = function (dt) { o(dt); if (!state.title) updateTide(dt); }; }
{ const o = drawStorm; drawStorm = function () {
  o();
  if (state.map !== 'tidewrack' || state.title) return;
  const w = window.innerWidth, h = window.innerHeight, t = performance.now() / 1000;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  for (let k = 0; k < 8; k++) { const cx = ((t * (5 + k * 1.7) + k * 210) % (w + 500)) - 250, cy = (k * 97 + Math.sin(t * 0.2 + k) * 40) % h; const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 260); g.addColorStop(0, 'rgba(205,218,224,0.13)'); g.addColorStop(1, 'rgba(205,218,224,0)'); ctx.fillStyle = g; ctx.fillRect(cx - 260, cy - 260, 520, 520); }
  const mins = tideTimeLeft(), hh = Math.floor(mins / 60), mm = mins % 60;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '11px ' + MONO; ctx.fillStyle = tideHigh ? '#9fd8ff' : '#e8d8a0';
  ctx.fillText((tideHigh ? 'High tide' : 'Low tide') + ', turns in ' + hh + 'h ' + mm + 'm', w / 2, 24);
}; }

/* ---------- Sprites for the place ---------- */
Object.assign(DECOR_SPR, {
  lighthouse: { w: 26, h: 58, nv: 1, outline: false, paint: c => { R(c, '#3a3a3e', 2, 52, 22, 6); R(c, '#55575c', 4, 50, 18, 3);
    for (let k = 0; k < 6; k++) { const w = 14 - Math.floor(k * 0.8), x = 13 - (w >> 1); R(c, k % 2 ? '#a8a49c' : '#7d2a2a', x, 46 - k * 6, w, 6); R(c, 'rgba(0,0,0,0.25)', x, 51 - k * 6, w, 1); }
    R(c, '#3a3a3e', 6, 8, 14, 3); R(c, '#1c1c20', 8, 11, 10, 6); R(c, '#ffe9a0', 9, 12, 8, 4); R(c, '#fff6c8', 11, 13, 4, 2); R(c, '#55575c', 7, 5, 12, 3); R(c, '#7d2a2a', 9, 2, 8, 3); R(c, '#3a3a3e', 12, 0, 2, 3); R(c, '#14120f', 11, 40, 4, 8); } },
  wreck: { w: 40, h: 22, nv: 1, outline: false, paint: c => { R(c, '#2a2118', 2, 10, 36, 9); R(c, '#3a2e22', 3, 9, 34, 4); R(c, '#4a3c2c', 4, 9, 32, 1); for (let k = 0; k < 7; k++) R(c, '#241a12', 4 + k * 5, 10, 1, 8); R(c, '#2a2118', 14, 2, 2, 9); R(c, '#2a2118', 26, 4, 2, 7); R(c, '#6a6a60', 14, 3, 1, 5); R(c, '#14120f', 8, 14, 5, 3); R(c, '#3a5a4a', 6, 17, 10, 2); R(c, '#3a5a4a', 24, 18, 8, 2); } },
  cradledoor: { w: 44, h: 36, nv: 1, outline: false, paint: c => { R(c, '#2a2e32', 2, 2, 40, 34); R(c, '#3a4046', 4, 4, 36, 30); R(c, '#4a5258', 6, 6, 32, 26); R(c, '#2a2e32', 14, 10, 16, 16); R(c, '#6a727a', 16, 12, 12, 12); R(c, '#2a2e32', 21, 12, 2, 12); R(c, '#2a2e32', 16, 17, 12, 2); R(c, '#e8c24a', 20, 16, 4, 4);
    for (let k = 0; k < 4; k++) { R(c, '#7d1418', 6, 8 + k * 7, 4, 2); R(c, '#7d1418', 34, 8 + k * 7, 4, 2); } R(c, '#14120f', 2, 34, 40, 2); } }
});

/* ---------- The map ---------- */
const TIDE_NAMES = ['The Landing', 'Lamp Cove', 'Saltmere', 'Wreck Fields', 'Chapel Row', 'The Breakwater'];
MAPDEFS.tidewrack = {
  id: 'tidewrack', name: 'The Tidewrack', zone: 9, theme: 'coast', seed: 5521, rooms: 6, dark: 0.34, rad: 0.05, layout: 'line', density: 1, rw: [12, 4], rh: [10, 5], gap: [3, 2], skipRooms: [1, 4],
  mobs: [['wrackcrab', 3], ['drowned', 2]], props: ['debris', 'bones', 'sign', 'barrel', 'log'],
  entry() { const r = this.rooms_[0]; return { x: r.cx - 1, y: r.cy }; },
  target() { const q = state.quests; const k = !state.qflags.lamplighter_done ? (state.qflags.lamplighter_started ? (countItem('Manifest Case') ? 1 : 3) : 1) : !state.qflags.chapel_open ? 4 : 5; return tideTarget(k); },
  setup(rooms) {
    const fl = state.mapFlags.tidewrack = state.mapFlags.tidewrack || {}, at = (r, dx, dy) => (r.cy + dy) * W + r.cx + dx, tl = (r, dx, dy) => ({ x: (r.cx + dx + 0.5) * TS, y: (r.cy + dy + 0.5) * TS });
    const [r0, r1, r2, r3, r4, r5] = rooms;
    INTERACT.set(at(r0, -3, 0), { kind: 'portal', up: true, label: 'Hatch back to the Spine', to: 'spine', get tx() { const s = MAPDEFS.spine.rooms_ && MAPDEFS.spine.rooms_[5]; return s ? s.cx + 2 : 0; }, get ty() { const s = MAPDEFS.spine.rooms_ && MAPDEFS.spine.rooms_[5]; return s ? s.cy : 0; } });
    MAP_LIGHTS.push({ x: (r0.cx + 0.5) * TS, y: (r0.cy + 0.5) * TS, r: 130 });
    // Lamp Cove: the lighthouse and Odile
    for (let dy = -1; dy <= 0; dy++) for (let dx = 3; dx <= 4; dx++) tiles[at(r1, dx, dy)] = T.CLIFF;
    decor.push({ kind: 'lighthouse', x: (r1.cx + 4) * TS, y: (r1.cy + 1) * TS - 1, v: 0, ph: 0 });
    MAP_LIGHTS.push({ x: (r1.cx + 3.5) * TS, y: (r1.cy - 2.5) * TS, r: 230 }, { x: (r1.cx + 0.5) * TS, y: (r1.cy + 0.5) * TS, r: 120 });
    const od = tl(r1, 1, 1); survivors.push({ id: 910, kind: 'survivor', odile: true, name: 'Odile Marr', bio: 'The Warden. Unit 12. She only answers what she is asked.', skills: { farm: 0, guard: 3, haul: 0 }, look: npcLook(910), x: od.x, y: od.y, home: { x: od.x, y: od.y }, wander: 0, wx: od.x, wy: od.y, dirx: -1, walkT: 0, scared: false });
    // Saltmere: ruined stubs and a harbour terminal
    for (let k = 0; k < 4; k++) { const sx = r2.x + 2 + k * 3, sy = r2.y + 2 + ((k * 5) % (r2.h - 4)); for (let dx = 0; dx < 2; dx++) tiles[sy * W + sx + dx] = T.CLIFF; }
    INTERACT.set(at(r2, 0, -2), { kind: 'terminal', id: 'saltmere', script: 'term_saltmere', label: 'Harbour terminal' });
    // Wreck Fields: the sea floor, a wreck, the case, the culvert
    flood.clear(); for (let y = r3.cy + 1; y <= r3.y + r3.h - 2; y++) for (let x = r3.x + 1; x <= r3.x + r3.w - 2; x++) flood.add(y * W + x);
    decor.push({ kind: 'wreck', x: (r3.cx - 2) * TS, y: (r3.cy + 4) * TS, v: 0, ph: 0 }, { kind: 'wreck', x: (r3.cx + 3) * TS, y: (r3.cy + 2) * TS, v: 0, ph: 0 });
    if (!fl.caseTaken) INTERACT.set(at(r3, 1, 3), { kind: 'case', label: 'Half-buried black case' });
    INTERACT.set((r3.y + r3.h - 2) * W + r3.x + 1, { kind: 'culvert', label: 'Culvert grate' });
    state.spawnPts.push({ type: 'wrackmother', x: (r3.cx + 4.5) * TS, y: (r3.cy + 0.5) * TS, e: null, respawnAt: fl.motherDead ? 1e12 : 0, hidden: false });
    // Chapel Row: a boarded door and three who guard it
    if (!fl.chapelOpen) {
      for (let dy = -1; dy <= 1; dy++) structs.set((r4.cy + dy) * W + (r5.x - 2), newStruct('scrapwall'));
      INTERACT.set(r4.cy * W + (r5.x - 2), { kind: 'chapelgate', label: 'Boarded door' });
      for (let k = 0; k < 3; k++) { const p = tl({ cx: r5.x - 5, cy: r4.cy }, 0, k - 1); survivors.push({ id: 920 + k, kind: 'survivor', listener: true, name: 'A Listener', bio: 'She does not look at you. She looks just past your shoulder.', skills: { farm: 0, guard: 2, haul: 0 }, look: npcLook(920 + k), x: p.x, y: p.y, home: { x: p.x, y: p.y }, wander: 0, wx: p.x, wy: p.y, dirx: 1, walkT: 0, scared: false }); }
    }
    MAP_LIGHTS.push({ x: (r4.cx + 0.5) * TS, y: (r4.cy + 0.5) * TS, r: 110 });
    // The Breakwater: the console and the door
    decor.push({ kind: 'cradledoor', x: (r5.x + r5.w - 4) * TS, y: (r5.cy + 1) * TS, v: 0, ph: 0 });
    INTERACT.set(at(r5, -1, 0), { kind: 'console', label: 'Antechamber console' });
    INTERACT.set(at(r5, r5.w - 6 - (r5.w >> 1), 1), { kind: 'cradledoor', label: 'The Cradle door' });
    MAP_LIGHTS.push({ x: (r5.cx + 0.5) * TS, y: (r5.cy + 0.5) * TS, r: 150 });
  }
};
{ const o = useInteract; useInteract = function (it, i) {
  const fl = state.mapFlags.tidewrack = state.mapFlags.tidewrack || {};
  if (it.kind === 'case') {
    if (tideIsHigh()) { toast('The case is under water. The tide will have to go out.', 3); return; }
    fl.caseTaken = true; INTERACT.delete(i); addItem('Manifest Case', 1); sfx('pickup'); toast('You dig the case out of the silt. It is much heavier than it looks.', 4);
  } else if (it.kind === 'culvert') {
    if (tideIsHigh()) { toast('The culvert is under water.', 2.5); return; }
    const r5 = MAPDEFS.tidewrack.rooms_[5]; state.player.x = (r5.x + 2.5) * TS; state.player.y = (r5.cy + 3.5) * TS; toast('You crawl on your elbows through a pipe that smells of a hundred years. You come out on the far side of the Listeners.', 5); state.qflags.culvert_used = true; state.qflags.chapel_open = true;
  } else if (it.kind === 'chapelgate') { toast('A boarded door. The Listeners are standing in front of it. Try talking to them.', 3); }
  else if (it.kind === 'cradledoor') { toast('A vault door the size of a house. It does not move. The recording said not yet.', 4); }
  else if (it.kind === 'console') { const ok = tagsHeld() >= 6; startDialogue(ok ? 'term_console_ok' : 'term_console_short'); }
  else o(it, i);
}; }
function openChapel() {
  const fl = state.mapFlags.tidewrack = state.mapFlags.tidewrack || {}, r4 = MAPDEFS.tidewrack.rooms_[4], r5 = MAPDEFS.tidewrack.rooms_[5];
  fl.chapelOpen = true; for (let dy = -1; dy <= 1; dy++) { const i = (r4.cy + dy) * W + (r5.x - 2); structs.delete(i); INTERACT.delete(i); }
  sfx('break'); toast('The boards come down.', 3);
}
{ const o = applyEffect; applyEffect = function (e, c) {
  if (e === 'openchapel') { for (let k = survivors.length - 1; k >= 0; k--) if (survivors[k].listener) survivors.splice(k, 1); openChapel(); }
  else if (e === 'chapelfight') { const L = survivors.filter(s => s.listener); L.forEach(s => { const z = spawnEnemy('zealot', s.x, s.y, {}); z.aggro = true; }); const z = spawnEnemy('zealot', state.player.x + 60, state.player.y, {}); z.aggro = true; for (let k = survivors.length - 1; k >= 0; k--) if (survivors[k].listener) survivors.splice(k, 1); openChapel(); }
  else if (e === 'tagtoast') toast('Tags verified: ' + tagsHeld() + ' of 11. Yours does not count.', 4);
  else o(e, c);
}; }
{ const o = openTalk; openTalk = function (npc) {
  if (npc.odile) { startDialogue(state.qflags.odile_met ? 'odile_hub' : 'odile_intro', npc); return; }
  if (npc.listener) { startDialogue('listener_gate', npc); return; }
  o(npc);
}; }
{ const o = killEnemy; killEnemy = function (e) { o(e); if (e.type === 'wrackmother') { const fl = state.mapFlags.tidewrack = state.mapFlags.tidewrack || {}; fl.motherDead = true; toast('The Wrack Mother is dead. The wrecks are very quiet.', 4); } }; }
Object.assign(DBG, { useInteract, questEvent, applyEffect, tagsHeld, tideIsHigh, flood, updateTide, tideTarget, openChapel });
