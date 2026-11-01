/* =====================================================================
   PLAYER STATS, ITEMS, ACTIONS
   ===================================================================== */
function maxHealth() { return 100 + CONFIG.combat.hpPerLevel * (state.player.level - 1); }
function dmgScale() { return 1 + CONFIG.combat.dmgPerLevel * (state.player.level - 1); }
function effMult() { return state.sleeping ? CONFIG.sleep.mult : state.timeMult; }
function armourStats() {
  let dmg = 0, rad = 0;
  const eq = state.player.equip;
  for (const k of SLOT_ORDER) { const it = eq[k], a = it && ARMOUR[it.name]; if (a) { dmg += a.dmg; rad += a.rad; } }
  return { dmg: Math.min(CONFIG.combat.dmgResCap, dmg), rad: Math.min(CONFIG.combat.radResCap, rad) };
}
function xpNeeded(l) { return CONFIG.combat.xpBase + CONFIG.combat.xpPerLevel * (l - 1); }
function gainXp(n) {
  const p = state.player;
  if (p.level >= CONFIG.combat.maxLevel) return;
  p.xp += n;
  while (p.level < CONFIG.combat.maxLevel && p.xp >= xpNeeded(p.level)) {
    p.xp -= xpNeeded(p.level); p.level++;
    p.health = Math.min(maxHealth(), p.health + 20);
    toast('Survivor level ' + p.level + '. More health and damage.', 4);
    state.floats.push({ x: p.x, y: p.y - 18, text: 'LEVEL UP', color: '#ffd36b', life: 1.8 });
  }
}
function selItem() { return state.player.inventory[state.sel]; }
function selToolTier(type) {
  const s = selItem(), ti = s && TOOL_ITEMS[s.name];
  return ti && ti.type === type ? ti.tier : 0;
}
function toolTier(type) { return selToolTier(type); }

function addTestScrap() {
  addItem('Wood', 30); addItem('Scrap', 30); addItem('Stone', 15); addItem('Berries', 10); addItem('Cloth', 10);
  toast('Added test materials: wood, scrap, stone, berries, cloth');
}
function testGearKit() {
  const can = { name: 'Watering Can', qty: 1, water: CONFIG.farm.canCapacity };
  putItem(can);
  for (const n of ['Hoe', 'Scrap Axe', 'Scrap Pickaxe', 'Scrap Pistol', 'Scrap Machete', 'Scrap Helmet', 'Scrap Vest', 'Hazmat Hood']) putItem({ name: n, qty: 1 });
  addItem('Pistol rounds', 12); addItem('Radish Seeds', 6); addItem('Bandage', 3);
  toast('Added test gear kit');
}
function unlockAllTest() {
  for (const k of Object.keys(BLUEPRINTS)) state.unlocked.add(k);
  toast('All blueprints unlocked (test)');
}

function equipFromBag(i) {
  const p = state.player, s = p.inventory[i], a = ARMOUR[s.name];
  const prev = p.equip[a.slot];
  p.equip[a.slot] = { name: s.name, qty: 1 };
  p.inventory[i] = prev || null;
  toast('Equipped ' + s.name + '.', 1.5);
}
function useItem(i) {
  const p = state.player, s = p.inventory[i];
  if (!s) return;
  if (ARMOUR[s.name]) { equipFromBag(i); return; }
  const u = ITEM_USE[s.name];
  if (!u) { toast(s.name + ' cannot be eaten or used. Select it with 1-9 and left-click.', 2); return; }
  if (u.heal && p.health >= maxHealth() - 0.5 && !u.food && !u.rad) { toast('You are not hurt.', 1.5); return; }
  if (u.food) p.food = Math.min(100, p.food + u.food);
  if (u.water) p.water = Math.min(100, p.water + u.water);
  if (u.rad) p.radiation = Math.max(0, p.radiation + u.rad);
  if (u.heal) p.health = Math.min(maxHealth(), p.health + u.heal);
  s.qty -= 1;
  if (s.qty <= 0) p.inventory[i] = null;
  state.floats.push({ x: p.x, y: p.y - 14, text: 'Used ' + s.name, color: '#7fff7f', life: 1.2 });
}

/* Items in the bag UI: left-click picks up and puts down, right-click uses or equips */
function invSlotClick(i, btn) {
  const inv = state.player.inventory, s = inv[i], cur = state.cursor;
  if (btn === 2) { if (s) useItem(i); return; }
  if (!cur) { if (s) { state.cursor = s; inv[i] = null; } return; }
  if (!s) { inv[i] = cur; state.cursor = null; return; }
  if (s.name === cur.name && stackMax(s.name) > 1) {
    const room = stackMax(s.name) - s.qty, n = Math.min(room, cur.qty);
    s.qty += n; cur.qty -= n;
    if (cur.qty <= 0) state.cursor = null;
    return;
  }
  inv[i] = cur; state.cursor = s;
}
function equipSlotClick(slot, btn) {
  const p = state.player, cur = state.cursor, worn = p.equip[slot];
  if (btn === 2) { if (worn && putItem(worn)) p.equip[slot] = null; return; }
  if (!cur) { if (worn) { state.cursor = worn; p.equip[slot] = null; } return; }
  const a = ARMOUR[cur.name];
  if (!a || a.slot !== slot) { toast('That does not go in the ' + SLOT_NAMES[slot].toLowerCase() + ' slot.', 1.5); return; }
  p.equip[slot] = cur; state.cursor = worn || null;
}
function uiClick(x, y, btn) {
  for (const r of state.uiRects) {
    if (x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) { r.fn(btn); return; }
  }
}

function die(reason) {
  const p = state.player;
  if (state.corpse && state.corpse.items.length) toast((reason || 'You died.') + ' Your previous stash is gone for good.', 5);
  else toast((reason || 'You died.') + ' Run back to your marker to get your gear.', 5);
  const items = p.inventory.filter(Boolean).map(s => ({ ...s }));
  if (state.cursor) { items.push({ ...state.cursor }); state.cursor = null; }
  for (const k of SLOT_ORDER) if (p.equip[k]) { items.push({ ...p.equip[k] }); p.equip[k] = null; }
  state.corpse = { x: p.x, y: p.y, items };
  p.inventory = new Array(CONFIG.inventory.slots).fill(null);
  p.x = spawn.x; p.y = spawn.y;
  p.health = maxHealth(); p.food = 100; p.water = 100; p.radiation = 0; p.kbx = 0; p.kby = 0;
  state.iframes = 1.5; state.sleeping = false; state.invOpen = false; state.craftOpen = false; state.placing = null;
  addItem('Rusty Pipe', 1);
}

/* ---------- Target under the mouse ---------- */
function getTarget() {
  const tx = Math.floor(state.mwx / TS), ty = Math.floor(state.mwy / TS);
  if (tx < 0 || ty < 0 || tx >= W || ty >= H) return null;
  const i = ty * W + tx, p = state.player;
  const dist = Math.hypot((tx + 0.5) * TS - p.x, (ty + 0.5) * TS - p.y);
  const base = { tx, ty, i, dist, inReach: dist <= CONFIG.player.reach, canHarvest: true, tier: 0 };
  const kind = objs[i];
  if (kind) {
    const res = RES[kind], tier = selToolTier(res.tool);
    return { ...base, kind, res, tier, canHarvest: tier >= res.minTier };
  }
  const tt = tiles[i];
  if (tt === T.WATER || tt === T.SPRING) {
    return { ...base, kind: 0, res: { name: tt === T.WATER ? 'Irradiated water' : 'Clean spring', item: 'water', drink: true, dirty: tt === T.WATER, spring: tt === T.SPRING, minTier: 0, tool: 'axe' } };
  }
  if (tx === BASE.x && ty === BASE.y) return { ...base, kind: 0, res: { name: 'Bedroll', item: '', bed: true, minTier: 0, tool: 'axe' } };
  const st = structs.get(i);
  if (st && st.type === 'purifier') return { ...base, kind: 0, res: { name: 'Water Purifier', item: 'water', purifier: true, minTier: 0, tool: 'axe' } };
  const cr = crops.get(i);
  if (cr && cropRipe(cr)) return { ...base, kind: 0, res: { name: CROPS[cr.seed].produce + ' (ripe)', item: CROPS[cr.seed].produce, crop: true, minTier: 0, tool: 'axe' } };
  return null;
}

function burst(x, y, color, n) {
  for (let k = 0; k < n; k++) {
    const a = Math.random() * Math.PI * 2, s = 20 + Math.random() * 40;
    state.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 25, life: 0.35, color });
  }
}

function tooFar() {
  if (state.elapsed - state.lastReachMsg > 1.5) { toast('Too far away. Step closer.', 1.5); state.lastReachMsg = state.elapsed; }
}

function updateActions(dt) {
  state.actCd = Math.max(0, state.actCd - dt);
  state.iframes = Math.max(0, state.iframes - dt);
  state.hurtT = Math.max(0, state.hurtT - dt);
  state.muzzle = Math.max(0, state.muzzle - dt);
  if (state.swing) { state.swing.t += dt; if (state.swing.t >= state.swing.dur) state.swing = null; }
  if (state.slash) { state.slash.t += dt; if (state.slash.t >= state.slash.dur) state.slash = null; }
  if (!mouse.down || state.invOpen || state.craftOpen || state.placing || state.sleeping || state.actCd > 0) return;
  const sel = selItem(), w = sel && WEAPONS[sel.name];
  const t = getTarget();
  if (t && t.inReach) { doTargetAction(t); return; }
  if (t && !w) { tooFar(); return; }
  if (w) { if (w.kind === 'melee') attackMelee(w); else fireGun(w); return; }
  if (sel) tileActions(sel);
}

function doTargetAction(t) {
  const res = t.res, sel = selItem(), isCan = sel && sel.name === 'Watering Can';
  if (res.drink) {
    if (isCan && res.spring) { refillCan(sel); return; }
    if (isCan) { toast('Irradiated water would poison crops. Use a clean spring or a purifier.', 3); state.actCd = 0.8; return; }
    drinkFrom(t); return;
  }
  if (res.purifier) { if (isCan) refillCan(sel); else drinkPurified(t); return; }
  if (res.bed) { trySleep(); state.actCd = 0.8; return; }
  if (res.crate) { openCrate(t); state.actCd = 0.3; return; }
  if (res.crop) { harvestCrop(t); return; }
  harvestResource(t);
}

function harvestResource(t) {
  const cfg = CONFIG.tools, res = t.res, cx = (t.tx + 0.5) * TS, cy = (t.ty + 0.5) * TS;
  const cd = cfg.cooldown[t.tier];
  state.actCd = cd;
  state.swing = { t: 0, dur: cd * 0.85, tool: res.tool, tier: t.tier };
  if (!t.canHarvest) {
    toast('Needs a ' + cfg.names[res.minTier] + ' ' + res.tool + ' or better. Select one with 1-9.', 2.5);
    burst(cx, cy, '#9a9a9a', 4);
    return;
  }
  if (!spaceFor(res.item, res.yield[1])) { toast('Bag full.', 1.5); state.swing = null; return; }
  let d = state.damage.get(t.i);
  if (!d) { d = { hp: res.hp, max: res.hp }; state.damage.set(t.i, d); }
  d.hp -= cfg.power[t.tier];
  state.shake.set(t.i, 0.18);
  burst(cx, cy, res.color, 5);
  if (d.hp <= 0) {
    const qty = res.yield[0] + Math.floor(Math.random() * (res.yield[1] - res.yield[0] + 1));
    objs[t.i] = O.NONE;
    state.damage.delete(t.i);
    addItem(res.item, qty);
    state.floats.push({ x: cx, y: t.ty * TS, text: '+' + qty + ' ' + res.item, color: '#ffd36b', life: 1.2 });
    burst(cx, cy, res.color, 12);
    buildMinimap();
  }
}

function refillCan(can) {
  can.water = CONFIG.farm.canCapacity;
  state.actCd = 0.6;
  state.floats.push({ x: state.player.x, y: state.player.y - 16, text: 'Can filled', color: '#7ac8ff', life: 1.2 });
}
function drinkPurified(t) {
  const p = state.player;
  state.actCd = 0.6;
  if (p.water >= 99.5) { toast('You are not thirsty.', 1.5); return; }
  p.water = Math.min(100, p.water + CONFIG.survival.drinkRestore);
  state.floats.push({ x: (t.tx + 0.5) * TS, y: t.ty * TS, text: '+Water', color: '#7ac8ff', life: 1.2 });
}

/* ---------- Farming ---------- */
function cropRipe(c) { return c.age >= CROPS[c.seed].days; }
function tillable(tx, ty) {
  const i = ty * W + tx, t = tiles[i];
  if (objs[i] || structs.has(i)) return false;
  return t === T.DIRT || ((t === T.GROUND || t === T.GRASS) && radMap[i] <= -0.9);
}
function consumeSel() {
  const p = state.player, s = p.inventory[state.sel];
  s.qty -= 1;
  if (s.qty <= 0) p.inventory[state.sel] = null;
}
function tileActions(sel) {
  const p = state.player, F = CONFIG.farm;
  const tx = Math.floor(state.mwx / TS), ty = Math.floor(state.mwy / TS);
  if (tx < 1 || ty < 1 || tx >= W - 1 || ty >= H - 1) return;
  const i = ty * W + tx, cx = (tx + 0.5) * TS, cy = (ty + 0.5) * TS;
  if (Math.hypot(cx - p.x, cy - p.y) > CONFIG.player.reach + 8) { tooFar(); return; }
  if (sel.name === 'Hoe') {
    if (!tillable(tx, ty)) { toast('You can only till dirt, or ground inside camp.', 2); state.actCd = 0.4; return; }
    if (tilled[i]) { state.actCd = 0.15; return; }
    tilled[i] = 1; state.actCd = F.tillCd;
    state.swing = { t: 0, dur: 0.25, tool: 'hoe', tier: 1 };
    burst(cx, cy, '#5a4230', 6);
  } else if (CROPS[sel.name]) {
    if (!tilled[i] || crops.has(i) || objs[i] || structs.has(i)) { toast('Plant seeds in empty tilled soil.', 2); state.actCd = 0.4; return; }
    crops.set(i, { seed: sel.name, age: 0 });
    consumeSel();
    state.actCd = F.plantCd;
    burst(cx, cy, '#6b9046', 5);
  } else if (sel.name === 'Watering Can') {
    if (!tilled[i]) { state.actCd = 0.15; return; }
    if (!(sel.water > 0)) { toast('Can is empty. Fill it at a clean spring or a purifier.', 2.5); state.actCd = 0.7; return; }
    if (wet[i]) { state.actCd = 0.15; return; }
    sel.water -= 1; wet[i] = 1; state.actCd = F.waterCd;
    state.swing = { t: 0, dur: 0.2, tool: 'can', tier: 1 };
    burst(cx, cy, '#7ac8ff', 6);
  }
}
function harvestCrop(t) {
  const cr = crops.get(t.i), c = CROPS[cr.seed];
  const seeds = 1 + Math.floor(Math.random() * 2);
  if (!spaceFor(c.produce, 1) || !spaceFor(cr.seed, seeds)) { toast('Bag full.', 1.5); state.actCd = 0.5; return; }
  addItem(c.produce, 1); addItem(cr.seed, seeds);
  const cx = (t.tx + 0.5) * TS;
  state.floats.push({ x: cx, y: t.ty * TS, text: '+1 ' + c.produce + '  +' + seeds + ' seeds', color: '#ffd36b', life: 1.4 });
  burst(cx, (t.ty + 0.5) * TS, c.col, 8);
  if (c.regrow) cr.age = c.days - c.regrow; else crops.delete(t.i);
  state.actCd = 0.3;
}
function newDayTick() {
  let ripened = 0;
  for (const [i, c] of crops) {
    if (wet[i]) { const before = cropRipe(c); c.age += 1; if (!before && cropRipe(c)) ripened++; }
  }
  wet.fill(0);
  if (crops.size) toast(ripened ? 'A new day. ' + ripened + ' crop' + (ripened > 1 ? 's' : '') + ' ripened.' : 'A new day. Remember to water your crops.', 4);
}

/* ---------- Sleep ---------- */
function sleepBlockReason() {
  const h = clockHour(), p = state.player;
  if (!(h >= CONFIG.sleep.fromHour || h < CONFIG.sleep.toHour)) return 'You can only sleep from ' + CONFIG.sleep.fromHour + ':00 to 0' + CONFIG.sleep.toHour + ':00.';
  if (state.raid || (h >= CONFIG.raids.startHour && clockDay() >= state.nextRaidDay)) return 'Raiders are about. You cannot sleep.';
  if (enemies.some(e => Math.hypot(e.x - p.x, e.y - p.y) < 200)) return 'Something is close. You cannot sleep.';
  return null;
}
function trySleep() {
  const why = sleepBlockReason();
  if (why) { toast(why, 2.5); return; }
  state.sleeping = true; mouse.down = false;
  toast('Sleeping...', 2);
}
function wakeUp() {
  const p = state.player;
  state.sleeping = false;
  p.health = Math.min(maxHealth(), p.health + 30);
  toast('You wake up. Day ' + clockDay() + ' begins.', 4);
}

/* ---------- Combat ---------- */
function hurtPlayer(raw, src, nx, ny) {
  const p = state.player;
  if (state.iframes > 0 || state.sleeping) return;
  const dmg = Math.max(1, Math.round(raw * (1 - armourStats().dmg)));
  p.health -= dmg;
  state.iframes = CONFIG.combat.iframes; state.hurtT = 0.25;
  p.kbx += nx * 110; p.kby += ny * 110;
  state.floats.push({ x: p.x, y: p.y - 14, text: '-' + dmg, color: '#ff6a5a', life: 0.9 });
  burst(p.x, p.y - 4, '#b03030', 5);
  if (p.health <= 0) die('You were killed by a ' + src + '.');
}
function hurtStruct(i, dmg) {
  const st = structs.get(i);
  if (!st) return;
  st.hp -= dmg;
  const cx = ((i % W) + 0.5) * TS, cy = (Math.floor(i / W)) * TS;
  state.floats.push({ x: cx, y: cy, text: '-' + Math.round(dmg), color: '#ffb36b', life: 0.7 });
  burst(cx, cy + 8, '#8a6a4a', 4);
  if (st.hp <= 0) {
    structs.delete(i);
    toast('Your ' + STATION_NAMES[st.type] + ' was destroyed!', 4);
    burst(cx, cy + 8, '#8a6a4a', 14);
  }
}
function damageEnemy(e, dmg, nx, ny, kb) {
  e.hp -= dmg; e.flash = 0.12; e.kbx = nx * kb; e.kby = ny * kb; e.aggro = true;
  state.floats.push({ x: e.x, y: e.y - 12, text: String(Math.round(dmg)), color: '#ffffff', life: 0.8 });
  burst(e.x, e.y - 4, '#a83a30', 5);
  if (e.hp <= 0) killEnemy(e);
}
function killEnemy(e) {
  const idx = enemies.indexOf(e);
  if (idx >= 0) enemies.splice(idx, 1);
  const d = ENEMY_TYPES[e.type];
  gainXp(d.xp);
  for (const dr of DROPS[e.type] || []) {
    if (Math.random() < dr.c) {
      const qty = dr.a + Math.floor(Math.random() * (dr.b - dr.a + 1));
      state.drops.push({ x: e.x + (Math.random() - 0.5) * 8, y: e.y + (Math.random() - 0.5) * 6, name: dr.n, qty, t: 0 });
    }
  }
  burst(e.x, e.y - 4, '#a83a30', 12);
  if (e.spawnIdx >= 0 && state.spawnPts[e.spawnIdx]) { const sp = state.spawnPts[e.spawnIdx]; sp.e = null; sp.respawnAt = state.gameMinutes + 1800; }
}
function attackMelee(w) {
  const p = state.player, ax = p.aimX, ay = p.aimY;
  state.actCd = w.cd;
  state.slash = { t: 0, dur: 0.18, ax, ay, reach: w.reach };
  state.swing = { t: 0, dur: w.cd * 0.7, tool: 'melee', tier: 1 };
  for (const e of enemies.slice()) {
    const ex = e.x - p.x, ey = (e.y - 3) - p.y, dist = Math.hypot(ex, ey);
    const size = ENEMY_TYPES[e.type].size;
    if (dist > w.reach + size / 2 + 2) continue;
    if (dist > 7 && (ex * ax + ey * ay) / dist < 0.25) continue;
    damageEnemy(e, w.dmg * dmgScale() * (0.9 + Math.random() * 0.2), ex / (dist || 1), ey / (dist || 1), w.kb);
  }
}
function fireGun(w) {
  const p = state.player;
  if (countItem(w.ammo) <= 0) { toast('Out of ' + w.ammo.toLowerCase() + '.', 1.5); state.actCd = 0.4; return; }
  takeItems({ [w.ammo]: 1 });
  const a = Math.atan2(p.aimY, p.aimX) + (Math.random() - 0.5) * 0.06;
  state.projs.push({ x: p.x + p.aimX * 8, y: p.y - 3 + p.aimY * 8, vx: Math.cos(a) * w.speed, vy: Math.sin(a) * w.speed, dmg: w.dmg * dmgScale(), life: w.range / w.speed, hostile: false, from: 'You' });
  state.actCd = w.cd; state.muzzle = 0.08;
  p.kbx -= p.aimX * 40; p.kby -= p.aimY * 40;
}
function updateProjs(dt) {
  const p = state.player;
  for (let k = state.projs.length - 1; k >= 0; k--) {
    const pr = state.projs[k];
    pr.x += pr.vx * dt; pr.y += pr.vy * dt; pr.life -= dt;
    const tx = Math.floor(pr.x / TS), ty = Math.floor(pr.y / TS);
    if (pr.life <= 0 || tx < 0 || ty < 0 || tx >= W || ty >= H) { state.projs.splice(k, 1); continue; }
    const i = ty * W + tx, len = Math.hypot(pr.vx, pr.vy) || 1;
    if (structs.has(i)) { if (pr.hostile) hurtStruct(i, pr.dmg); burst(pr.x, pr.y, '#d6a84a', 3); state.projs.splice(k, 1); continue; }
    if (tiles[i] === T.RUBBLE || objs[i] === O.ROCK || objs[i] === O.ORE) { burst(pr.x, pr.y, '#c8c8c8', 3); state.projs.splice(k, 1); continue; }
    if (pr.hostile) {
      if (Math.hypot(p.x - pr.x, (p.y - 3) - pr.y) < 7) { hurtPlayer(pr.dmg, pr.from, pr.vx / len, pr.vy / len); state.projs.splice(k, 1); }
    } else {
      for (const e of enemies) {
        if (Math.hypot(e.x - pr.x, (e.y - 4) - pr.y) < ENEMY_TYPES[e.type].size / 2 + 3) {
          damageEnemy(e, pr.dmg, pr.vx / len, pr.vy / len, 130);
          state.projs.splice(k, 1);
          break;
        }
      }
    }
  }
}

/* ---------- Enemies ---------- */
function spawnEnemy(type, x, y, opts = {}) {
  const d = ENEMY_TYPES[type];
  const e = { id: nextEnemyId++, type, x, y, hp: d.hp, maxHp: d.hp, cd: 0.5 + Math.random(), dirx: 1, flash: 0, kbx: 0, kby: 0, walkT: Math.random() * 5,
    raid: !!opts.raid, home: { x, y }, spawnIdx: opts.spawnIdx !== undefined ? opts.spawnIdx : -1, wander: 0, wx: x, wy: y, stuck: 0, sideT: 0, sideDir: 1 };
  enemies.push(e);
  return e;
}
function moveEnemy(e, dx, dy) {
  const s = ENEMY_TYPES[e.type].size;
  let moved = false;
  if (dx && !collides(e.x + dx, e.y, s)) { e.x += dx; moved = true; }
  if (dy && !collides(e.x, e.y + dy, s)) { e.y += dy; moved = true; }
  return moved;
}
function nearestStruct(x, y) {
  let best = null, bd = 1e9;
  for (const [i] of structs) {
    const sx = ((i % W) + 0.5) * TS, sy = (Math.floor(i / W) + 0.5) * TS;
    const d = Math.hypot(sx - x, sy - y);
    if (d < bd) { bd = d; best = { i, x: sx, y: sy }; }
  }
  return best;
}
function updateEnemies(dt) {
  const p = state.player;
  const playerSafe = (radMap[Math.floor(p.y / TS) * W + Math.floor(p.x / TS)] || 0) <= -0.9;
  for (const e of enemies.slice()) {
    const d = ENEMY_TYPES[e.type];
    e.cd = Math.max(0, e.cd - dt); e.flash = Math.max(0, e.flash - dt); e.sideT = Math.max(0, e.sideT - dt);
    if (e.kbx || e.kby) {
      moveEnemy(e, e.kbx * dt, e.kby * dt);
      const f = Math.pow(0.002, dt); e.kbx *= f; e.kby *= f;
      if (Math.abs(e.kbx) < 3) e.kbx = 0;
      if (Math.abs(e.kby) < 3) e.kby = 0;
    }
    const dpx = p.x - e.x, dpy = (p.y - 3) - e.y, dist = Math.hypot(dpx, dpy);
    const homeDist = Math.hypot(e.home.x - e.x, e.home.y - e.y);
    const sees = dist < d.aggro && !state.sleeping;
    let goalX = null, goalY = null, struct = null, chasing = false;
    if (e.raid) {
      if (sees) { goalX = p.x; goalY = p.y - 3; chasing = true; }
      else {
        struct = nearestStruct(e.x, e.y);
        if (struct) { goalX = struct.x; goalY = struct.y; } else { goalX = p.x; goalY = p.y - 3; chasing = true; }
      }
    } else if (sees && !playerSafe && homeDist < 220) { goalX = p.x; goalY = p.y - 3; chasing = true; }
    else if (homeDist > 24) { goalX = e.home.x; goalY = e.home.y; e.hp = Math.min(e.maxHp, e.hp + 6 * dt); }
    else {
      e.wander -= dt;
      if (e.wander <= 0) { e.wander = 1 + Math.random() * 2; const a = Math.random() * 6.283; e.wx = e.home.x + Math.cos(a) * 14; e.wy = e.home.y + Math.sin(a) * 14; }
      if (Math.hypot(e.wx - e.x, e.wy - e.y) > 3) { goalX = e.wx; goalY = e.wy; }
    }
    if (goalX === null) continue;
    let gx = goalX - e.x, gy = goalY - e.y;
    const gl = Math.hypot(gx, gy) || 1;
    gx /= gl; gy /= gl;
    let speed = d.speed;
    if (d.ranged && chasing) {
      if (gl < d.keep - 12) { gx = -gx; gy = -gy; }
      else if (gl < d.keep + 12) speed = 0;
    }
    const stopDist = struct ? 15 : (chasing && !d.ranged ? d.size / 2 + 8 : 0);
    if (gl <= stopDist) speed = 0;
    if (e.sideT > 0) { const ox = -gy * e.sideDir, oy = gx * e.sideDir; gx = ox; gy = oy; }
    if (speed > 0) {
      const mv = speed * dt;
      const moved = moveEnemy(e, gx * mv, gy * mv);
      if (!moved) { e.stuck += dt; if (e.stuck > 0.25) { e.sideT = 0.6; e.sideDir = Math.random() < 0.5 ? 1 : -1; e.stuck = 0; } } else e.stuck = 0;
      if (Math.abs(gx) > 0.2) e.dirx = gx > 0 ? 1 : -1;
      e.walkT += dt;
    }
    if (chasing) {
      if (!d.ranged && gl <= d.size / 2 + 12 && e.cd <= 0) { hurtPlayer(d.dmg, d.name, dpx / (dist || 1), dpy / (dist || 1)); e.cd = d.atkCd; }
      else if (d.ranged && gl < d.aggro && e.cd <= 0) {
        const a = Math.atan2(dpy, dpx) + (Math.random() - 0.5) * 0.2;
        state.projs.push({ x: e.x, y: e.y - 4, vx: Math.cos(a) * 130, vy: Math.sin(a) * 130, dmg: d.dmg, life: 1.6, hostile: true, from: d.name });
        e.cd = d.atkCd;
      }
    } else if (struct && gl <= 17 && e.cd <= 0) { hurtStruct(struct.i, d.dmg); e.cd = d.atkCd; }
  }
}

/* Ambient spawn points: ruins, hot spots and the open wasteland. Killed enemies come back after a while. */
function makeSpawns() {
  const rng = mulberry32(CONFIG.seed + 99);
  const add = (type, x, y) => { state.spawnPts.push({ type, x: (x + 0.5) * TS, y: (y + 0.5) * TS, e: null, respawnAt: 0 }); };
  const spot = (x0, y0, w, h) => {
    for (let t = 0; t < 100; t++) {
      const x = x0 + Math.floor(rng() * w), y = y0 + Math.floor(rng() * h);
      if (!solidAt(x, y)) return [x, y];
    }
    return null;
  };
  const ruinTypes = [['scrapper', 'gunner'], ['glowrat', 'glowrat', 'hound'], ['scrapper', 'scrapper'], ['hound', 'hound'], ['glowrat', 'glowrat']];
  ruins.forEach((r, idx) => {
    for (const type of ruinTypes[idx] || []) { const s = spot(r.x0 + 1, r.y0 + 1, r.w - 2, r.h - 2); if (s) add(type, s[0], s[1]); }
  });
  const huskCounts = [1, 2, 2, 1];
  HOT_SPOTS.forEach((hs, k) => {
    for (let n = 0; n < huskCounts[k]; n++) { const s = spot(Math.floor(hs.x - 3), Math.floor(hs.y - 3), 6, 6); if (s) add('husk', s[0], s[1]); }
  });
  for (let n = 0; n < 8; n++) {
    for (let t = 0; t < 100; t++) {
      const x = 2 + Math.floor(rng() * (W - 4)), y = 2 + Math.floor(rng() * (H - 4));
      if (Math.hypot(x - BASE.x, y - BASE.y) < 16 || solidAt(x, y) || tiles[y * W + x] !== T.GROUND) continue;
      add(n % 2 ? 'hound' : 'glowrat', x, y);
      break;
    }
  }
  state.spawnPts.forEach((sp, idx) => { const e = spawnEnemy(sp.type, sp.x, sp.y, { spawnIdx: idx }); sp.e = e.id; });
}
function updateSpawns() {
  const p = state.player;
  state.spawnPts.forEach((sp, idx) => {
    if (sp.e && !enemies.some(e => e.id === sp.e)) { sp.e = null; sp.respawnAt = state.gameMinutes + 1800; }
    if (!sp.e && state.gameMinutes >= sp.respawnAt && Math.hypot(sp.x - p.x, sp.y - p.y) > 220) {
      sp.e = spawnEnemy(sp.type, sp.x, sp.y, { spawnIdx: idx }).id;
    }
  });
}

/* ---------- Raids ---------- */
const SIDE_NAMES = ['north', 'east', 'south', 'west'];
function startRaid(day) {
  const n = Math.min(10, 2 + Math.floor(day * 0.9));
  const pool = day < 3 ? ['glowrat', 'hound'] : day < 5 ? ['hound', 'scrapper'] : day < 8 ? ['scrapper', 'scrapper', 'gunner', 'hound'] : ['scrapper', 'gunner', 'husk'];
  const side = Math.floor(Math.random() * 4);
  let made = 0;
  for (let k = 0; k < n * 20 && made < n; k++) {
    const along = 4 + Math.floor(Math.random() * (side % 2 === 0 ? W - 8 : H - 8)), depth = 2 + Math.floor(Math.random() * 4);
    const x = side === 1 ? W - 1 - depth : side === 3 ? depth : along, y = side === 0 ? depth : side === 2 ? H - 1 - depth : along;
    if (solidAt(x, y)) continue;
    spawnEnemy(pool[Math.floor(Math.random() * pool.length)], (x + 0.5) * TS, (y + 0.5) * TS, { raid: true });
    made++;
  }
  state.raid = { total: made, side };
  toast('Raiders are coming from the ' + SIDE_NAMES[side] + '! Defend your camp.', 7);
}
function updateRaids() {
  const day = clockDay(), h = clockHour();
  if (!state.raid && !state.sleeping && day >= state.nextRaidDay && h >= CONFIG.raids.startHour && h < CONFIG.raids.endHour) startRaid(day);
  if (state.raid && !enemies.some(e => e.raid)) {
    state.raid = null; state.raidsSurvived++;
    state.nextRaidDay = day + CONFIG.raids.everyDays;
    toast('Raid repelled. Next one in about ' + CONFIG.raids.everyDays + ' days.', 5);
  }
}

/* ---------- Player movement, corpse and drops ---------- */
function movePlayer(mx, my) {
  const p = state.player, size = CONFIG.player.size;
  if (mx && !collides(p.x + mx, p.y, size)) p.x += mx;
  if (my && !collides(p.x, p.y + my, size)) p.y += my;
}
function updatePlayer(dt) {
  const p = state.player, cfg = CONFIG.player;
  if (state.sleeping) { p.moving = false; return; }
  let dx = 0, dy = 0;
  if (keys['w'] || keys['arrowup']) dy -= 1;
  if (keys['s'] || keys['arrowdown']) dy += 1;
  if (keys['a'] || keys['arrowleft']) dx -= 1;
  if (keys['d'] || keys['arrowright']) dx += 1;
  p.moving = !!(dx || dy);
  if (dx && dy) { dx *= Math.SQRT1_2; dy *= Math.SQRT1_2; }
  const step = cfg.speed * dt;
  movePlayer(dx * step + p.kbx * dt, dy * step + p.kby * dt);
  const f = Math.pow(0.001, dt); p.kbx *= f; p.kby *= f;
  if (p.moving) p.walkT += dt;

  const c = state.corpse;
  if (c && Math.hypot(c.x - p.x, c.y - p.y) < 10) {
    const had = c.items.length, left = [];
    for (const item of c.items) {
      const rem = addItem(item.name, item.qty);
      if (rem) left.push({ name: item.name, qty: rem });
    }
    c.items = left;
    if (left.length) {
      if (state.elapsed - state.lastFullMsg > 3) { toast('Bag full. Some gear is still on the marker.'); state.lastFullMsg = state.elapsed; }
    } else {
      toast(had ? 'Gear recovered.' : 'Marker cleared. You weren\u2019t carrying anything.');
      state.corpse = null;
    }
  }

  for (let k = state.drops.length - 1; k >= 0; k--) {
    const dr = state.drops[k];
    dr.t += dt;
    const ddx = p.x - dr.x, ddy = (p.y - 2) - dr.y, dist = Math.hypot(ddx, ddy);
    if (dist < 36 && dist > 0) { dr.x += ddx / dist * 60 * dt; dr.y += ddy / dist * 60 * dt; }
    if (dist < 8 && spaceFor(dr.name, dr.qty)) {
      addItem(dr.name, dr.qty);
      state.floats.push({ x: p.x, y: p.y - 14, text: '+' + dr.qty + ' ' + dr.name, color: '#ffd36b', life: 1.1 });
      state.drops.splice(k, 1);
    } else if (dr.t > 180) state.drops.splice(k, 1);
  }
}

function updateTime(dt) {
  state.elapsed += dt;
  const minsPerSec = 1440 / CONFIG.time.dayLengthSec;
  state.gameMinutes += dt * minsPerSec * effMult();
  const d = clockDay();
  if (d !== state.lastDay) { state.lastDay = d; newDayTick(); }
  if (state.sleeping) { const h = clockHour(); if (h >= 6 && h < 12) wakeUp(); }
}

