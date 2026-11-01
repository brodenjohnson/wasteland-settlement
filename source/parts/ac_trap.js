/* =====================================================================
   AC_TRAP: "The Kind Stranger". A betrayal, a cage, an escape, a kingpin.
   The first side mission with a boss fight and a real choice at the end.
   ===================================================================== */
ZONE_NAMES.push('Greybridge Depot');
PLACE_LORE['Greybridge Depot'] = 'An old cargo yard run by a man called Varro. Forty people owe him, and there is a cage for the ones who do not.';
Object.assign(WEAPONS, { 'Shiv': { kind: 'melee', dmg: 14, cd: 0.3, reach: 18, kb: 90, col: '#9a9aa2' }, "Kingpin's Cleaver": { kind: 'melee', dmg: 54, cd: 0.5, reach: 28, kb: 260, col: '#d6a84a' } });
for (const k of ['Shiv', "Kingpin's Cleaver"]) { ITEM_STACK[k] = 1; ITEM_COL[k] = WEAPONS[k].col; }
ITEM_TIER["Kingpin's Cleaver"] = 3; ITEM_TIER['Shiv'] = 0;
ITEM_DESC['Shiv'] = 'A sharpened spoon with a rag handle. It will do, for now.'; ITEM_DESC["Kingpin's Cleaver"] = 'Varro kept this on the wall behind his chair. It has had a great deal of use.';
Object.assign(ENEMY_TYPES, { kingpin: { name: 'Varro, the Kingpin', hp: 620, dmg: 24, speed: 42, size: 14, aggro: 280, atkCd: 1.0, xp: 220, structMult: 3, boss: true } });
Object.assign(ENEMY_SPR, { kingpin: { w: 24, h: 34, paint: (c, f) => { paintHuman2(c, f, { legs: '#2a2420', body: '#6a1a1a', skin: '#b88a6a', eye: '#20160f', plate: '#d6a84a', club: true, bulk: true, hair: '#14100c', accent: '#d6a84a' }); R(c, '#e8c24a', 5, 12, 9, 1); R(c, '#e8c24a', 8, 13, 3, 2); R(c, '#e8c24a', 9, 14, 1, 1); } } });
DROPS.kingpin = [{ n: 'Caps', c: 1, a: 60, b: 100 }, { n: "Kingpin's Cleaver", c: 1, a: 1, b: 1 }, { n: 'Metal plate', c: 1, a: 3, b: 5 }];
CREATURE_LORE.kingpin = 'Runs the depot on debts and fear, and has not been told no in a very long time.';
state.confiscated = null;

/* ---------- Capture, escape and the return of your things ---------- */
function applyCapture() {
  const p = state.player, saved = { inv: p.inventory.map(s => s ? Object.assign({}, s) : null), equip: Object.assign({}, p.equip) };
  state.confiscated = saved;
  p.inventory.fill(null); for (const k of Object.keys(p.equip)) p.equip[k] = null;
  const def = MAPDEFS.camp, cell = def.cell, fl = state.mapFlags.camp = state.mapFlags.camp || {};
  fl.trapped = true; p.x = (cell.x + 0.5) * TS; p.y = (cell.y + 0.5) * TS; p.health = Math.max(20, p.health * 0.6);
  bloodSpray(p.x, p.y - 6, 0.2, -0.3, 6); sfx('hurt'); state.shakeT = 0.6;
}
function restoreGear() {
  const sv = state.confiscated, p = state.player;
  if (!sv) { toast('Empty shelves. Somebody got here first.', 2.5); return; }
  const cur = p.inventory.filter(Boolean).map(s => Object.assign({}, s));
  p.inventory.length = 0; for (const s of sv.inv) p.inventory.push(s);
  for (const k of Object.keys(p.equip)) p.equip[k] = sv.equip[k] || null;
  for (const s of cur) { if (spaceFor(s.name, s.qty)) addItem(s.name, s.qty); else state.drops.push({ x: p.x, y: p.y + 6, name: s.name, qty: s.qty, t: 0 }); }
  state.confiscated = null; questEvent('gear:back'); sfx('pickup'); toast('You pull your pack out from under a rotten blanket. Everything is still there.', 4);
}
function standDown() {
  for (let i = enemies.length - 1; i >= 0; i--) { burst(enemies[i].x, enemies[i].y - 4, '#777', 4); enemies.splice(i, 1); }
  for (const sp of state.spawnPts) { sp.respawnAt = 1e12; sp.e = null; }
  const fl = state.mapFlags.camp = state.mapFlags.camp || {}; fl.varroResolved = true; toast('The camp loses its nerve. Nobody else is coming for you.', 4);
}
function alarm() {
  const p = state.player;
  [['gunner', -90, -40], ['gunner', 90, -30], ['scrapper', -80, 50], ['gunner', 100, 60]].forEach(([t, dx, dy]) => { const e = spawnEnemy(t, p.x + dx, p.y + dy, {}); e.aggro = true; });
}
function rumourCamp() {
  const r = ruins.find(q => q.kind === 'armoury') || ruins[0], x = r.x0 + r.w / 2, y = r.y0 + r.h / 2;
  state.markers.forEach(m => { m.tracked = false; });
  state.markers.push({ id: ++markSeq, kind: 'rumour', tx: x, ty: y, label: 'Greybridge Depot', revealed: true, poi: { x, y, name: 'Greybridge Depot' }, tracked: true });
  toast('Marked on your map: Greybridge Depot.', 3);
}
{ const o = applyEffect; applyEffect = function (e, c) {
  if (e === 'capture') applyCapture(); else if (e === 'standdown') standDown(); else if (e === 'alarm') alarm(); else if (e === 'rumourCamp') rumourCamp(); else o(e, c);
}; }
{ const o = die; die = function (r) {
  const was = !!state.confiscated; o(r);
  if (was) { restoreGear(); toast('You wake on your own bedroll. Your gear is beside you. Somebody dumped you here, and that was somebody\u2019s idea of a joke.', 6); }
}; }

/* ---------- The camp ---------- */
{ const o = useInteract; useInteract = function (it, i) {
  const fl = state.mapFlags.camp = state.mapFlags.camp || {};
  if (it.kind === 'remains') {
    if (fl.shiv) { toast('Nothing else in here but flies.', 2); return; }
    fl.shiv = true; addItem('Shiv', 1); addItem('Bandage', 2); toast('Under the remains: a sharpened spoon with a rag handle, and two clean bandages. Somebody planned for this.', 5); sfx('pickup');
  } else if (it.kind === 'cagedoor') {
    if (!fl.shiv) { toast('Locked. There might be something useful in here with you.', 3); return; }
    fl.cageOpen = true; structs.delete(i); INTERACT.delete(i); sfx('break'); toast('You work the rusted latch with the shiv. It gives.', 3.5); questEvent('camp:escaped');
  } else if (it.kind === 'gear') restoreGear();
  else o(it, i);
}; }
{ const o = drawInteract; drawInteract = function (i, tx, ty, time) {
  const it = INTERACT.get(i);
  if (!it) return;
  const x = tx * TS, y = ty * TS;
  if (it.kind === 'remains') { ctx.drawImage(makeSprite('rem|0', 16, 9, c => DECOR_SPR.corpse.paint(c, 1)), x, y + 4); }
  else if (it.kind === 'gear') { ctx.drawImage(makeSprite('gearpile', 16, 16, c => { R(c, '#5a4a3a', 2, 8, 12, 6); R(c, '#7a6a52', 3, 6, 9, 4); R(c, '#3a3a40', 9, 4, 4, 3); R(c, '#8a8d94', 4, 5, 6, 1); R(c, '#a8532a', 5, 9, 3, 2); }), x - 1, y - 1); }
  else if (it.kind === 'cagedoor') { /* the wall itself is the door */ }
  else { o(i, tx, ty, time); return; }
  ctx.fillStyle = 'rgba(255,233,176,' + (0.5 + 0.3 * Math.sin(time * 4)) + ')'; ctx.fillRect(x + 7, y - 9, 2, 2);
}; }
MAPDEFS.camp = {
  id: 'camp', name: 'Greybridge Depot', zone: 10, theme: 'factory', seed: 7788, rooms: 6, dark: 0.55, rad: 0.05, layout: 'line', density: 1, skipRooms: [1, 2, 3],
  mobs: [['gunner', 3], ['scrapper', 3], ['hound', 1]], props: ['barrel', 'debris', 'table', 'sack', 'bones'],
  entry() { const r = this.rooms_[0]; return { x: r.cx - 1, y: r.cy }; },
  target() { const r = this.rooms_ && this.rooms_[5]; return r ? { x: (r.cx + 0.5) * TS, y: (r.cy + 0.5) * TS, label: 'Varro' } : null; },
  setup(rooms) {
    const fl = state.mapFlags.camp = state.mapFlags.camp || {};
    const at = (r, dx, dy) => (r.cy + dy) * W + r.cx + dx;
    INTERACT.set(at(rooms[0], -3, 0), { kind: 'portal', up: true, label: 'The side door out', to: 'wastes', get tx() { return state.mapFlags.camp.portal ? state.mapFlags.camp.portal.x : 0; }, get ty() { return state.mapFlags.camp.portal ? state.mapFlags.camp.portal.y + 1 : 0; } });
    const r2 = rooms[2], ix = r2.cx - 3, iy = r2.cy; this.cell = { x: ix, y: iy };
    for (let y = iy - 2; y <= iy + 2; y++) for (let x = ix - 2; x <= ix + 2; x++) {
      tiles[y * W + x] = T.FLOOR;
      if (Math.abs(x - ix) === 2 || Math.abs(y - iy) === 2) { if (fl.cageOpen && x === ix + 2 && y === iy) continue; structs.set(y * W + x, newStruct('scrapwall')); }
    }
    if (!fl.cageOpen) INTERACT.set(iy * W + ix + 2, { kind: 'cagedoor', label: 'Cage door', hidden: false });
    INTERACT.set((iy - 1) * W + ix - 1, { kind: 'remains', label: "Someone's remains", hidden: fl.shiv });
    INTERACT.set(at(rooms[3], 0, -2), { kind: 'gear', label: () => state.confiscated ? 'Your confiscated gear' : 'Empty shelves' });
    MAP_LIGHTS.push({ x: (rooms[0].cx + 0.5) * TS, y: (rooms[0].cy + 0.5) * TS, r: 120 }, { x: (r2.cx + 0.5) * TS, y: (r2.cy + 0.5) * TS, r: 110 }, { x: (rooms[3].cx + 0.5) * TS, y: (rooms[3].cy + 0.5) * TS, r: 110 }, { x: (rooms[5].cx + 0.5) * TS, y: (rooms[5].cy + 0.5) * TS, r: 150 });
    const r5 = rooms[5];
    state.spawnPts.push({ type: 'kingpin', x: (r5.cx + 3.5) * TS, y: (r5.cy + 0.5) * TS, e: null, respawnAt: fl.varroResolved || fl.varroBeaten ? 1e12 : 0, hidden: false });
    for (let k = 0; k < 2; k++) state.spawnPts.push({ type: 'gunner', x: (r5.cx - 2 + k * 2 + 0.5) * TS, y: (r5.cy - 2 + 0.5) * TS, e: null, respawnAt: fl.varroResolved ? 1e12 : 0, hidden: false });
    const ci = (r5.cy + 2) * W + r5.cx - 4; if (!objs[ci]) { objs[ci] = O.CRATE; crateLoot.set(ci, rollLoot(Math.random, true)); }
  },
  after() {
    const fl = state.mapFlags.camp || {};
    if (fl.varroBeaten && !fl.varroResolved) { const r5 = this.rooms_[5]; spawnBeatenVarro((r5.cx + 3.5) * TS, (r5.cy + 0.5) * TS); }
  },
  onArrive() {
    const fl = state.mapFlags.camp = state.mapFlags.camp || {};
    if (fl.arrived) return;
    fl.arrived = true; state.qflags['camp:entered'] = true;
    if (state.qflags.mara_exposed) startDialogue('camp_alert'); else if (state.quests.stranger || state.qflags.camp_known) startDialogue('camp_trap');
  }
};
{ const o = updateTransition; updateTransition = function (dt) {
  const tr = state.transition, wasOut = !!tr && tr.phase === 'out'; o(dt);
  if (wasOut && state.transition && state.transition.phase === 'in') { const d = MAPDEFS[state.map]; if (d && d.onArrive) setTimeout(() => d.onArrive(), 450); }
}; }

/* ---------- The boss ---------- */
function spawnBeatenVarro(x, y) {
  survivors.push({ id: 900, kind: 'survivor', wounded: true, boss: true, name: 'Varro (beaten)', bio: 'On his knees in his own yard.', skills: { farm: 0, guard: 3, haul: 0 }, look: npcLook(900), x, y, home: { x, y }, wander: 0, wx: x, wy: y, dirx: -1, walkT: 0, scared: false });
}
function bossTick(dt) {
  if (state.map !== 'camp') return;
  const fl = state.mapFlags.camp = state.mapFlags.camp || {}, p = state.player;
  for (const e of enemies) {
    if (e.type !== 'kingpin') continue;
    const mx = e.maxHp || 744, dist = Math.hypot(e.x - p.x, e.y - p.y);
    if (!fl.varroTalked && dist < 190) { fl.varroTalked = true; startDialogue('varro_intro'); return; }
    if (!e.p1 && e.hp < mx * 0.66) { e.p1 = true; state.floats.push({ x: e.x, y: e.y - 30, text: 'Boys!', color: '#ff7a5a', life: 1.4 }); toast('Varro whistles. Two more come running.', 3); for (let k = 0; k < 2; k++) { const g = spawnEnemy('gunner', e.x + (k ? 50 : -50), e.y + 40, {}); g.aggro = true; } }
    if (!e.p2 && e.hp < mx * 0.33) { e.p2 = true; e.rally = 9999; e.cd = 0; state.floats.push({ x: e.x, y: e.y - 30, text: 'ENOUGH', color: '#ff4a3a', life: 1.6 }); toast('Varro drops the act. He is going to kill you now.', 3.5); state.shakeT = 0.5; sfx('horn'); }
    if (!e.sur && e.hp <= mx * 0.13 && e.hp > 0) {
      e.sur = true; const i = enemies.indexOf(e); if (i >= 0) enemies.splice(i, 1);
      const sp = state.spawnPts[e.spawnIdx]; if (sp) { sp.respawnAt = 1e12; sp.e = null; }
      fl.varroBeaten = true; spawnBeatenVarro(e.x, e.y); toast('Varro goes down on one knee. The yard goes quiet.', 4); sfx('thunder'); return;
    }
  }
}
{ const o = updateEnemies; updateEnemies = function (dt) { bossTick(dt); o(dt); }; }
{ const o = killEnemy; killEnemy = function (e) { o(e); if (e.type === 'kingpin') { const fl = state.mapFlags.camp = state.mapFlags.camp || {}; fl.varroResolved = true; state.qflags.varro_dead = true; questEvent('varro:done'); toast('Varro is dead. The camp loses its nerve.', 4); standDown(); } }; }
function drawBossBar(w) {
  const b = enemies.find(e => e.type === 'kingpin' && Math.hypot(e.x - state.player.x, e.y - state.player.y) < 420);
  if (!b || state.title) return;
  const mx = b.maxHp || 744, f = Math.max(0, b.hp / mx), bw = 360, x = Math.round(w / 2 - bw / 2), y = 64;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); panel(x - 8, y - 8, bw + 16, 34, 0.9);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '11px ' + MONO; ctx.fillStyle = '#ffe9b0'; ctx.fillText(ENEMY_TYPES.kingpin.name, w / 2, y + 4);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x, y + 14, bw, 6); ctx.fillStyle = b.p2 ? '#ff4a3a' : '#c0392b'; ctx.fillRect(x, y + 14, bw * f, 6);
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x + bw * 0.33, y + 13, 1, 8); ctx.fillRect(x + bw * 0.66, y + 13, 1, 8);
}
{ const o = drawStorm; drawStorm = function () { o(); drawBossBar(window.innerWidth); }; }
{ const o = openTalk; openTalk = function (npc) {
  if (npc.boss && SCRIPTS.varro_surrender) { startDialogue('varro_surrender', npc); return; }
  if (npc.stranger && SCRIPTS.mara_ask) { startDialogue('mara_ask', npc); return; }
  o(npc);
}; }

/* ---------- The camp's front door, and the quest ---------- */
function campPortalEntry() {
  return { kind: 'portal', label: 'Boarded-up loading bay', to: 'camp', tx: -1, ty: -1,
    locked: () => state.qflags.camp_known ? null : 'A boarded-up loading bay. You have no reason to go in.',
    onEnter() { questEvent('camp:enter'); } };
}
function setCampPortal(into) {
  const fl = state.mapFlags.camp = state.mapFlags.camp || {};
  if (!fl.portal) {
    const r = ruins.find(q => q.kind === 'armoury') || ruins[0];
    let spot = null;
    for (let rr = 0; rr < 6 && !spot; rr++) for (let dy = -rr; dy <= rr && !spot; dy++) for (let dx = -rr; dx <= rr && !spot; dx++) {
      const x = r.x0 + (r.w >> 1) + dx, y = r.y0 + (r.h >> 1) + dy, i = y * W + x;
      if (x > r.x0 && y > r.y0 && x < r.x0 + r.w - 1 && y < r.y0 + r.h - 1 && tiles[i] === T.FLOOR && !objs[i] && !(into || INTERACT).has(i)) spot = { x, y, i };
    }
    if (!spot) return;
    fl.portal = spot;
  }
  (into || INTERACT).set(fl.portal.i, campPortalEntry());
}
{ const o = placeStorySites; placeStorySites = function () { o(); setCampPortal(); }; }
{ const o = loadGame; loadGame = function () {
  const ok = o();
  if (ok && state.mapFlags.camp && state.mapFlags.camp.portal) { const tgt = state.map === 'wastes' ? INTERACT : (STASH.wastes && STASH.wastes.interact); if (tgt) tgt.set(state.mapFlags.camp.portal.i, campPortalEntry()); }
  return ok;
}; }
if (SITE_DEFS.bunker.tile !== undefined) setCampPortal();
QUEST_DEFS.push({ id: 'stranger', title: 'The Kind Stranger', giver: 'Mara Quill', desc: 'A woman needs help digging her brother out of the Greybridge Depot. Her boots are very clean.',
  steps: [
    { id: 'enter', text: 'Find the Greybridge Depot', event: 'camp:enter', target: () => { const f = state.mapFlags.camp; return f && f.portal ? { x: (f.portal.x + 0.5) * TS, y: (f.portal.y + 0.5) * TS, label: 'Greybridge Depot' } : null; } },
    { id: 'out', text: 'Get out of the cage', check: () => !!(state.qflags.mara_exposed || (state.mapFlags.camp && state.mapFlags.camp.cageOpen)) },
    { id: 'gear', text: 'Get your gear back', check: () => !!state.qflags['camp:entered'] && !state.confiscated },
    { id: 'varro', text: 'Deal with Varro', event: 'varro:done' }
  ], reward: { xp: 240, items: [{ name: 'Rad-Away', qty: 2 }, { name: 'Pistol rounds', qty: 12 }] }, next: [] });
Object.assign(DBG, { useInteract, applyCapture, restoreGear, standDown, alarm, bossTick, setCampPortal, spawnBeatenVarro, drawBossBar });
