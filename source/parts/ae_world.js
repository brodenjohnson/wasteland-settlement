/* =====================================================================
   AE_WORLD: the Hollowclaw, four new places to explore, terminals, and
   things to find out in the open
   ===================================================================== */
ZONE_NAMES.push('Deepcut', 'The Hollow', 'MegaMart', 'Pylon 3');
Object.assign(PLACE_LORE, {
  'Deepcut': 'A quarry mine that went under the old riverbed. The shift logs stop at day eleven.',
  'The Hollow': 'A cave system under the pines. The dogs went in. The dogs came out.',
  'MegaMart': 'A megastore that kept its doors shut until the event was over. The event is not over.',
  'Pylon 3': 'A relay station that carries a broadcast it did not write. The operator\u2019s chair is still warm.'
});
Object.assign(WEAPONS, { 'Hollowclaw Talon': { kind: 'melee', dmg: 58, cd: 0.4, reach: 25, kb: 280, col: '#c8c0a8' }, "Warden's Crossbow": { kind: 'gun', dmg: 52, cd: 0.85, speed: 300, range: 250, ammo: 'Bolts', col: '#6a5a3a' } });
Object.assign(ARMOUR, { 'Loss Prevention Vest': { slot: 'body', dmg: 0.26, rad: 0.05, col: '#2a3a5a' }, 'Lead-Lined Coat': { slot: 'body', dmg: 0.12, rad: 0.5, col: '#6a7078' } });
for (const k of ['Hollowclaw Talon', "Warden's Crossbow", 'Loss Prevention Vest', 'Lead-Lined Coat', 'Hollowclaw Hide']) { ITEM_STACK[k] = k === 'Hollowclaw Hide' ? 20 : 1; ITEM_COL[k] = (WEAPONS[k] || ARMOUR[k] || { col: '#8a8a70' }).col; ITEM_TIER[k] = 3; }
Object.assign(ITEM_DESC, { 'Hollowclaw Talon': 'A claw as long as a forearm, bound with wire. It still looks hungry.', "Warden's Crossbow": 'A hunter\u2019s crossbow, kept oiled for a very long time by somebody who is no longer around.', 'Loss Prevention Vest': 'Padded, reflective and surprisingly good at stopping things.', 'Lead-Lined Coat': 'Heavy as a door and warm as a cellar. Excellent against radiation.', 'Hollowclaw Hide': 'Thick, scarred and hard to cut. Somebody will pay for it.' });
{ const o = overlayBody; overlayBody = function (c, name, dir, side) {
  const col = ARMOUR[name] && ARMOUR[name].col, tx = side ? 5 : 3, tw = side ? 8 : 12;
  if (name === 'Loss Prevention Vest') { R(c, col, tx, 11, tw, 9); R(c, '#d6c84a', tx, 14, tw, 1); R(c, '#d6c84a', tx, 17, tw, 1); R(c, shade(col, 30), tx + 1, 11, 3, 5); R(c, '#14120f', tx, 19, tw, 1); }
  else if (name === 'Lead-Lined Coat') { R(c, col, tx - 1, 11, tw + 2, 11); R(c, shade(col, 30), tx, 12, tw, 2); R(c, shade(col, -30), tx, 17, tw, 4); R(c, '#14120f', tx + (tw >> 1), 11, 1, 11); R(c, '#3a3d42', tx, 15, tw, 1); }
  else o(c, name, dir, side);
}; }
Object.assign(ENEMY_TYPES, { hollowclaw: { name: 'The Hollowclaw', hp: 900, dmg: 34, speed: 62, size: 15, aggro: 320, atkCd: 0.9, xp: 320, structMult: 4, boss: true } });
function paintHollowclaw(c, f) {
  c.translate(0, 1); const l = f ? 2 : 0;
  R(c, '#3a4038', 0, 12, 6, 3); R(c, '#4a5248', 2, 11, 5, 2); R(c, '#2a2e28', 0, 13, 2, 2);
  R(c, '#454d44', 5, 6, 18, 10); R(c, '#565e54', 6, 6, 16, 3); R(c, '#3a4038', 5, 14, 18, 3);
  for (let k = 0; k < 5; k++) { R(c, '#2a2e28', 8 + k * 3, 3 + (k % 2), 2, 4); R(c, '#4a524a', 8 + k * 3, 3 + (k % 2), 1, 1); }
  R(c, '#3a4038', 7 + l, 15, 4, 7); R(c, '#3a4038', 15 - l, 15, 4, 7); R(c, '#2a2e28', 6 + l, 21, 6, 2); R(c, '#2a2e28', 14 - l, 21, 6, 2);
  R(c, '#3a4038', 21, 9, 3, 9); R(c, '#454d44', 22, 9, 2, 5); R(c, '#d8d0c0', 22, 17, 1, 5); R(c, '#d8d0c0', 24, 17, 1, 5); R(c, '#d8d0c0', 26, 16, 1, 5);
  R(c, '#565e54', 22, 2, 10, 9); R(c, '#454d44', 22, 8, 10, 3); R(c, '#c8c0a8', 22, -1, 2, 4); R(c, '#c8c0a8', 29, -1, 2, 4); R(c, '#e8c24a', 27, 4, 2, 2); R(c, '#14120f', 28, 5, 1, 1);
  R(c, '#14120f', 24, 9, 8, 2); R(c, '#e8e0d0', 25, 10, 1, 2); R(c, '#e8e0d0', 28, 10, 1, 2); R(c, '#e8e0d0', 31, 10, 1, 1); R(c, '#7d1418', 26, 11, 3, 1);
}
Object.assign(ENEMY_SPR, { hollowclaw: { w: 34, h: 26, paint: paintHollowclaw } });
DROPS.hollowclaw = [{ n: 'Hollowclaw Talon', c: 1, a: 1, b: 1 }, { n: 'Hollowclaw Hide', c: 1, a: 3, b: 4 }, { n: 'Raw Meat', c: 1, a: 5, b: 7 }, { n: 'Metal plate', c: 1, a: 3, b: 5 }];
CREATURE_LORE.hollowclaw = 'It was a man once, or a bear, or something that wanted to be both. It does not run you down. It waits until you are tired, and then it is very quick.';
function hollowTick(dt) {
  const p = state.player;
  for (const e of enemies) {
    if (e.type !== 'hollowclaw') continue;
    const mx = e.maxHp || 1200, dist = Math.hypot(e.x - p.x, e.y - p.y);
    e.dashCd = (e.dashCd === undefined ? 3 : e.dashCd) - dt;
    if (e.dashT > 0) {
      e.dashT -= dt; const a = Math.atan2(p.y - e.y, p.x - e.x), v = e.p2 ? 330 : 270, nx = e.x + Math.cos(a) * v * dt, ny = e.y + Math.sin(a) * v * dt;
      if (!collides(nx, e.y, 13)) e.x = nx; if (!collides(e.x, ny, 13)) e.y = ny; e.dirx = Math.cos(a) >= 0 ? 1 : -1; e.walkT += dt * 3;
      if (dist < 24 && !e.hitDash) { e.hitDash = true; hurtPlayer(Math.round(scaledStats(e).dmg * 1.4), 'The Hollowclaw', Math.cos(a), Math.sin(a)); e.dashT = 0; }
    } else if (e.dashCd <= 0 && dist < 230 && dist > 50) { e.dashT = 0.55; e.dashCd = e.p2 ? 2.6 : 4; e.hitDash = false; state.floats.push({ x: e.x, y: e.y - 36, text: '!', color: '#ff4a3a', life: 0.6 }); sfx('sting'); }
    if (!e.p1 && e.hp < mx * 0.55) { e.p1 = true; state.shakeT = 0.7; sfx('thunder'); toast('The Hollowclaw roars. The walls answer it.', 3.5); for (let k = 0; k < 2; k++) { const s = spawnEnemy('stalker', e.x + (k ? 60 : -60), e.y + 30, {}); s.aggro = true; } }
    if (!e.p2 && e.hp < mx * 0.28) { e.p2 = true; e.rally = 9999; state.floats.push({ x: e.x, y: e.y - 40, text: 'RAGE', color: '#ff4a3a', life: 1.6 }); toast('It has stopped playing.', 3); state.shakeT = 0.6; }
  }
}
{ const o = updateEnemies; updateEnemies = function (dt) { hollowTick(dt); o(dt); }; }
{ const o = drawBossBar; drawBossBar = function (w) {
  const b = enemies.find(e => ENEMY_TYPES[e.type].boss && e.type !== 'kingpin' && Math.hypot(e.x - state.player.x, e.y - state.player.y) < 460);
  if (b && !state.title) {
    const mx = b.maxHp || 1200, f = Math.max(0, b.hp / mx), bw = 360, x = Math.round(w / 2 - bw / 2), y = 64;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); panel(x - 8, y - 8, bw + 16, 34, 0.9);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '11px ' + MONO; ctx.fillStyle = '#ffe9b0'; ctx.fillText(ENEMY_TYPES[b.type].name + '   Lv ' + b.lvl, w / 2, y + 4);
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x, y + 14, bw, 6); ctx.fillStyle = b.p2 ? '#ff4a3a' : '#c0392b'; ctx.fillRect(x, y + 14, bw * f, 6);
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x + bw * 0.28, y + 13, 1, 8); ctx.fillRect(x + bw * 0.55, y + 13, 1, 8);
  } else o(w);
}; }

/* ---------- Terminals: the dead leave logs ---------- */
{ const o = useInteract; useInteract = function (it, i) {
  if (it.kind === 'terminal') { state.qflags['read:Terminal ' + it.id] = true; if (SCRIPTS[it.script]) startDialogue(it.script); sfx('click'); return; }
  o(it, i);
}; }
{ const o = drawInteract; drawInteract = function (i, tx, ty, time) {
  const it = INTERACT.get(i);
  if (it && it.kind === 'terminal') {
    const x = tx * TS, y = ty * TS;
    ctx.drawImage(makeSprite('terminal', 16, 16, c => { R(c, '#2a2c30', 2, 4, 12, 11); R(c, '#44484e', 2, 4, 12, 2); R(c, '#0c1612', 4, 6, 8, 6); R(c, '#4aff8a', 5, 7, 6, 1); R(c, '#2ac86a', 5, 9, 4, 1); R(c, '#4aff8a', 5, 11, 5, 1); R(c, '#6a6e76', 5, 13, 6, 1); }), x - 1, y - 3);
    ctx.fillStyle = 'rgba(255,233,176,' + (0.5 + 0.3 * Math.sin(time * 4)) + ')'; ctx.fillRect(x + 7, y - 9, 2, 2); return;
  }
  o(i, tx, ty, time);
}; }
{ const L = (id, extra) => extra; }

/* ---------- Four places to explore ---------- */
const DUNGEONS = {
  deepcut: { name: 'Deepcut', zid: 6, zone: 11, theme: 'cave', rooms: 5, dark: 0.82, rad: 0.15, seed: 1101, density: 1, mobs: [['stalker', 2], ['husk', 2], ['bloater', 1]], props: ['bones', 'debris', 'barrel', 'corpse'], reward: 'Hollowclaw Talon', boss: 'hollowclaw', term: 'term_deepcut', label: 'Mine shaft down to Deepcut' },
  hollow: { name: 'The Hollow', zid: 2, zone: 12, theme: 'cave', rooms: 5, dark: 0.85, rad: 0.05, seed: 1102, density: 0, mobs: [['stalker', 2], ['glowrat', 2], ['spitter', 1]], props: ['bones', 'debris', 'log', 'corpse'], reward: "Warden's Crossbow", elite: 'brute', term: 'term_hollow', label: 'A cave mouth under the pines' },
  megamart: { name: 'MegaMart', zid: 4, zone: 13, theme: 'mart', rooms: 6, dark: 0.7, rad: 0.2, seed: 1103, density: 1, mobs: [['husk', 3], ['scrapper', 2], ['gunner', 1]], props: ['shelf', 'table', 'sack', 'barrel', 'corpse'], reward: 'Loss Prevention Vest', elite: 'brute', term: 'term_megamart', label: 'Smashed automatic doors' },
  pylon3: { name: 'Pylon 3', zid: 3, zone: 14, theme: 'vault', rooms: 5, dark: 0.78, rad: 0.3, seed: 1104, density: 1, mobs: [['gunner', 2], ['husk', 2], ['sniper', 1]], props: ['debris', 'table', 'barrel', 'sign', 'corpse'], reward: 'Lead-Lined Coat', elite: 'sniper', term: 'term_pylon3', label: 'Service door at the base of the pylon' }
};
for (const [id, D] of Object.entries(DUNGEONS)) {
  MAPDEFS[id] = {
    id, name: D.name, zone: D.zone, theme: D.theme, seed: D.seed, rooms: D.rooms, dark: D.dark, rad: D.rad, layout: 'line', density: D.density, mobs: D.mobs, props: D.props,
    entry() { const r = this.rooms_[0]; return { x: r.cx - 1, y: r.cy }; },
    target() { const r = this.rooms_ && this.rooms_[this.rooms_.length - 1]; return r ? { x: (r.cx + 0.5) * TS, y: (r.cy + 0.5) * TS, label: D.name + ', the far end' } : null; },
    setup(rooms) {
      const fl = state.mapFlags[id] = state.mapFlags[id] || {}, at = (r, dx, dy) => (r.cy + dy) * W + r.cx + dx, last = rooms[rooms.length - 1];
      INTERACT.set(at(rooms[0], -3, 0), { kind: 'portal', up: true, label: 'Back up to the surface', to: 'wastes', get tx() { return state.mapFlags[id].portal ? state.mapFlags[id].portal.x : 0; }, get ty() { return state.mapFlags[id].portal ? state.mapFlags[id].portal.y + 1 : 0; } });
      MAP_LIGHTS.push({ x: (rooms[0].cx + 0.5) * TS, y: (rooms[0].cy + 0.5) * TS, r: 130 }, { x: (last.cx + 0.5) * TS, y: (last.cy + 0.5) * TS, r: 150 });
      INTERACT.set(at(rooms[Math.min(2, rooms.length - 2)], 0, -2), { kind: 'terminal', id, script: D.term, label: 'Terminal' });
      const ci = (last.cy - 2) * W + last.cx - 3; if (!objs[ci]) { objs[ci] = O.CRATE; const loot = rollLoot(mulberry32(D.seed + 7), true); loot.items.push({ name: D.reward, qty: 1 }); crateLoot.set(ci, loot); }
      if (D.boss) state.spawnPts.push({ type: D.boss, x: (last.cx + 2.5) * TS, y: (last.cy + 0.5) * TS, e: null, respawnAt: fl.bossDead ? 1e12 : 0, hidden: false });
      if (D.elite) state.spawnPts.push({ type: D.elite, x: (last.cx + 2.5) * TS, y: (last.cy + 0.5) * TS, e: null, respawnAt: 0, hidden: false });
    }
  };
}
{ const o = killEnemy; killEnemy = function (e) { o(e); if (e.type === 'hollowclaw') { const fl = state.mapFlags.deepcut = state.mapFlags.deepcut || {}; fl.bossDead = true; toast('The Hollowclaw is dead. The mine is very quiet.', 4); state.qflags.hollowclaw_dead = true; } }; }
function dungeonSpot(zid) {
  const z = ZONES.find(q => q.zid === zid); if (!z) return null;
  for (let r = 4; r < 26; r++) for (let k = 0; k < 24; k++) {
    const a = k / 24 * 6.283 + r * 0.3, x = Math.round(z.x + Math.cos(a) * r), y = Math.round(z.y + Math.sin(a) * r), i = y * W + x;
    if (x < 6 || y < 6 || x >= W - 6 || y >= H - 6 || objs[i] || structs.has(i) || ![T.GROUND, T.GRASS, T.DIRT, T.ASH, T.ROAD].includes(tiles[i])) continue;
    let ok = true; for (let dy = -1; dy <= 1 && ok; dy++) for (let dx = -1; dx <= 1; dx++) { const t = tiles[(y + dy) * W + x + dx], o2 = objs[(y + dy) * W + x + dx]; if (t === T.WATER || t === T.CLIFF || t === T.RUBBLE || o2) ok = false; }
    if (ok) return { x, y, i };
  }
  return null;
}
function setDungeonPortals(into) {
  for (const [id, D] of Object.entries(DUNGEONS)) {
    const fl = state.mapFlags[id] = state.mapFlags[id] || {};
    if (!fl.portal) { const s = dungeonSpot(D.zid); if (!s) continue; fl.portal = s; }
    (into || INTERACT).set(fl.portal.i, { kind: 'portal', label: D.label, to: id, tx: -1, ty: -1, onEnter() { state.qflags['entered:' + id] = true; skillXp('exploring', 6); } });
  }
}
{ const o = placeStorySites; placeStorySites = function () { o(); setDungeonPortals(); }; }
{ const o = loadGame; loadGame = function () {
  const ok = o();
  if (ok) { const tgt = state.map === 'wastes' ? INTERACT : (STASH.wastes && STASH.wastes.interact); if (tgt) for (const [id, D] of Object.entries(DUNGEONS)) { const fl = state.mapFlags[id]; if (fl && fl.portal) tgt.set(fl.portal.i, { kind: 'portal', label: D.label, to: id, tx: -1, ty: -1, onEnter() { state.qflags['entered:' + id] = true; skillXp('exploring', 6); } }); } }
  return ok;
}; }
setDungeonPortals();

/* ---------- Things to find out in the open ---------- */
function addWorldPOIs() {
  const rng = mulberry32(31337), spots = [];
  const free = (x, y) => { for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const i = (y + dy) * W + x + dx; if (objs[i] || ![T.GROUND, T.GRASS, T.DIRT, T.ASH].includes(tiles[i])) return false; } return true; };
  for (let n = 0; n < 4000 && spots.length < 16; n++) {
    const x = 8 + Math.floor(rng() * (W - 16)), y = 8 + Math.floor(rng() * (H - 16)), i = y * W + x;
    if (zoneMap[i] === 1 || Math.hypot(x - ORIGIN.x, y - ORIGIN.y) < 30 || !free(x, y)) continue;
    if (spots.some(s => Math.hypot(s.x - x, s.y - y) < 18)) continue;
    if (ruins.some(r => x > r.x0 - 6 && x < r.x0 + r.w + 6 && y > r.y0 - 6 && y < r.y0 + r.h + 6)) continue;
    spots.push({ x, y });
  }
  spots.forEach((s, k) => {
    const kind = k % 2 ? 'convoy' : 'camp', cx = s.x * TS + 8, cy = s.y * TS + 8;
    const crate = (dx, dy, rich) => { const i = (s.y + dy) * W + s.x + dx; if (!objs[i]) { objs[i] = O.CRATE; crateLoot.set(i, rollLoot(rng, rich)); } };
    if (kind === 'convoy') {
      crate(0, 0, false); crate(2, 1, false); if (rng() < 0.6) crate(-2, 1, true);
      for (let j = 0; j < 6; j++) decor.push({ kind: ['debris', 'tyre', 'bones', 'barrel', 'corpse'][Math.floor(rng() * 5)], x: cx + (rng() - 0.5) * 72, y: cy + (rng() - 0.5) * 48, v: Math.floor(rng() * 3), ph: 0 });
      for (let j = 0; j < 2; j++) state.spawnPts.push({ type: ['scrapper', 'gunner', 'hound'][Math.floor(rng() * 3)], x: cx + (rng() - 0.5) * 80, y: cy + (rng() - 0.5) * 60, e: null, respawnAt: 0, hidden: rng() < 0.4 });
    } else {
      crate(0, 0, true); crate(1, -1, false);
      for (let j = 0; j < 5; j++) decor.push({ kind: ['table', 'barrel', 'sack', 'bones', 'debris'][Math.floor(rng() * 5)], x: cx + (rng() - 0.5) * 64, y: cy + (rng() - 0.5) * 44, v: Math.floor(rng() * 3), ph: 0 });
      for (let j = 0; j < 4; j++) state.spawnPts.push({ type: ['gunner', 'scrapper', 'scrapper', 'sniper'][j], x: cx + (rng() - 0.5) * 100, y: cy + (rng() - 0.5) * 80, e: null, respawnAt: 0, hidden: false });
    }
    state.mapFlags.poi = state.mapFlags.poi || { list: [] }; state.mapFlags.poi.list.push({ x: s.x, y: s.y, kind });
  });
}
addWorldPOIs();
Object.assign(DBG, { DUNGEONS, hollowTick, dungeonSpot, setDungeonPortals, addWorldPOIs });
