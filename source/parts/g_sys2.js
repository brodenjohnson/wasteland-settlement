/* =====================================================================
   SYSTEMS 2: pathfinding, ambushes, hidden enemies, zones, raids, hotbar rules
   ===================================================================== */
const pfStamp = new Uint32Array(W * H), pfPar = new Int32Array(W * H), pfQ = new Int32Array(W * H);
let pfId = 0;
const PF_DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
function findPath(sx, sy, gx, gy, cap) {
  const s = Math.floor(sy / TS) * W + Math.floor(sx / TS);
  const gtx = Math.floor(gx / TS), gty = Math.floor(gy / TS);
  pfId++;
  let qh = 0, qt = 0, found = -1, nodes = 0;
  pfQ[qt++] = s; pfStamp[s] = pfId; pfPar[s] = -1;
  while (qh < qt && nodes < cap) {
    const cur = pfQ[qh++]; nodes++;
    const cx = cur % W, cy = (cur / W) | 0;
    if (Math.abs(cx - gtx) <= 1 && Math.abs(cy - gty) <= 1) { found = cur; break; }
    for (let k = 0; k < 8; k++) {
      const dx = PF_DIRS[k][0], dy = PF_DIRS[k][1], nx = cx + dx, ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const ni = ny * W + nx;
      if (pfStamp[ni] === pfId || solidAt(nx, ny)) continue;
      if (dx && dy && (solidAt(cx + dx, cy) || solidAt(cx, cy + dy))) continue;
      pfStamp[ni] = pfId; pfPar[ni] = cur; pfQ[qt++] = ni;
    }
  }
  if (found < 0) return null;
  const out = [];
  for (let c = found; c !== s && c >= 0; c = pfPar[c]) out.push([((c % W) + 0.5) * TS, (((c / W) | 0) + 0.5) * TS]);
  out.reverse();
  return out;
}
function lineClear(x0, y0, x1, y1) {
  const dx = x1 - x0, dy = y1 - y0, n = Math.ceil(Math.hypot(dx, dy) / 6);
  for (let k = 1; k < n; k++) if (solidAt(Math.floor((x0 + dx * k / n) / TS), Math.floor((y0 + dy * k / n) / TS))) return false;
  return true;
}
function steerGoal(e, goalX, goalY, dt, cap) {
  if (lineClear(e.x, e.y, goalX, goalY)) { e.path = null; return [goalX, goalY]; }
  e.pathT -= dt;
  if (!e.path || e.pathT <= 0) { e.path = findPath(e.x, e.y, goalX, goalY, cap || 4500); e.pathT = 0.8; }
  if (e.path && e.path.length) {
    while (e.path.length > 1 && Math.hypot(e.path[0][0] - e.x, e.path[0][1] - e.y) < 6) e.path.shift();
    return e.path[0];
  }
  return [goalX, goalY];
}

function spawnEnemy(type, x, y, opts = {}) {
  const d = ENEMY_TYPES[type];
  const e = { id: nextEnemyId++, type, x, y, hp: d.hp, maxHp: d.hp, cd: 0.5 + Math.random(), dirx: 1, flash: 0, kbx: 0, kby: 0, walkT: Math.random() * 5,
    raid: !!opts.raid, ambush: !!opts.ambush, hidden: !!opts.hidden, home: { x, y }, spawnIdx: opts.spawnIdx !== undefined ? opts.spawnIdx : -1,
    wander: 0, wx: x, wy: y, stuck: 0, sideT: 0, sideDir: 1, path: null, pathT: 0, lunge: 0, life: 0 };
  enemies.push(e);
  return e;
}
function revealEnemy(e) {
  e.hidden = false; e.lunge = 0.25; e.cd = 0.3;
  burst(e.x, e.y - 4, '#4a6a3a', 10); burst(e.x, e.y - 4, '#8aaa5a', 6);
  state.shakeT = Math.max(state.shakeT, 0.18);
  if (state.elapsed - state.lastJumpMsg > 4) { toast('Something leaps out at you!', 2); state.lastJumpMsg = state.elapsed; }
}
function updateSpawns() {
  const p = state.player;
  state.spawnPts.forEach((sp, idx) => {
    if (sp.e && !enemies.some(e => e.id === sp.e)) { sp.e = null; sp.respawnAt = state.gameMinutes + 1800; }
    if (!sp.e && state.gameMinutes >= sp.respawnAt && Math.hypot(sp.x - p.x, sp.y - p.y) > 260) {
      sp.e = spawnEnemy(sp.type, sp.x, sp.y, { spawnIdx: idx, hidden: sp.hidden }).id;
    }
  });
}

function updateEnemies(dt) {
  const p = state.player;
  const playerSafe = (radMap[Math.floor(p.y / TS) * W + Math.floor(p.x / TS)] || 0) <= -0.9;
  for (const e of enemies.slice()) {
    const d = ENEMY_TYPES[e.type];
    const dpx = p.x - e.x, dpy = (p.y - 3) - e.y, dist = Math.hypot(dpx, dpy);
    if (e.hidden) { if (dist < 46 && !state.sleeping) revealEnemy(e); else continue; }
    if (!e.raid && !e.ambush && dist > 430) continue;
    e.cd = Math.max(0, e.cd - dt); e.flash = Math.max(0, e.flash - dt); e.sideT = Math.max(0, e.sideT - dt); e.lunge = Math.max(0, e.lunge - dt);
    if (e.ambush) {
      e.life += dt * (playerSafe ? 7 : 1);
      if (dist > 440 || e.life > 75) { const ix = enemies.indexOf(e); if (ix >= 0) enemies.splice(ix, 1); continue; }
    }
    if (e.kbx || e.kby) {
      moveEnemy(e, e.kbx * dt, e.kby * dt);
      const f = Math.pow(0.002, dt); e.kbx *= f; e.kby *= f;
      if (Math.abs(e.kbx) < 3) e.kbx = 0;
      if (Math.abs(e.kby) < 3) e.kby = 0;
    }
    const homeDist = Math.hypot(e.home.x - e.x, e.home.y - e.y);
    const sees = dist < d.aggro && !state.sleeping;
    let goalX = null, goalY = null, struct = null, chasing = false;
    if (e.raid) {
      if (sees) { goalX = p.x; goalY = p.y - 3; chasing = true; }
      else {
        struct = nearestStruct(e.x, e.y);
        if (struct) { goalX = struct.x; goalY = struct.y; } else { goalX = p.x; goalY = p.y - 3; chasing = true; }
      }
    } else if (e.ambush) { goalX = p.x; goalY = p.y - 3; chasing = true; }
    else if (sees && !playerSafe && homeDist < 260) { goalX = p.x; goalY = p.y - 3; chasing = true; }
    else if (homeDist > 24) { goalX = e.home.x; goalY = e.home.y; e.hp = Math.min(e.maxHp, e.hp + 6 * dt); }
    else {
      e.wander -= dt;
      if (e.wander <= 0) { e.wander = 1 + Math.random() * 2; const a = Math.random() * 6.283; e.wx = e.home.x + Math.cos(a) * 14; e.wy = e.home.y + Math.sin(a) * 14; }
      if (Math.hypot(e.wx - e.x, e.wy - e.y) > 3) { goalX = e.wx; goalY = e.wy; }
    }
    if (goalX === null) continue;
    const wp = steerGoal(e, goalX, goalY, dt, e.raid ? 12000 : 4500);
    let gx = wp[0] - e.x, gy = wp[1] - e.y;
    const gl = Math.hypot(gx, gy) || 1;
    gx /= gl; gy /= gl;
    const realGl = Math.hypot(goalX - e.x, goalY - e.y);
    let speed = d.speed * (e.ambush ? 1.15 : 1);
    if (d.ranged && chasing) {
      if (realGl < d.keep - 12) { gx = -gx; gy = -gy; }
      else if (realGl < d.keep + 12) speed = 0;
    }
    const stopDist = struct ? 15 : (chasing && !d.ranged ? d.size / 2 + 8 : 0);
    if (realGl <= stopDist) speed = 0;
    if (e.sideT > 0) { const ox = -gy * e.sideDir, oy = gx * e.sideDir; gx = ox; gy = oy; }
    if (speed > 0) {
      const mv = speed * dt;
      const moved = moveEnemy(e, gx * mv, gy * mv);
      if (!moved) { e.stuck += dt; if (e.stuck > 0.25) { e.sideT = 0.5; e.sideDir = Math.random() < 0.5 ? 1 : -1; e.stuck = 0; } } else e.stuck = 0;
      if (Math.abs(gx) > 0.2) e.dirx = gx > 0 ? 1 : -1;
      e.walkT += dt;
    }
    if (chasing) {
      if (!d.ranged && realGl <= d.size / 2 + 12 && e.cd <= 0) { hurtPlayer(d.dmg, d.name, dpx / (dist || 1), dpy / (dist || 1)); e.cd = d.atkCd; e.lunge = 0.2; }
      else if (d.ranged && realGl < d.aggro && e.cd <= 0 && lineClear(e.x, e.y, p.x, p.y)) {
        const a = Math.atan2(dpy, dpx) + (Math.random() - 0.5) * 0.2;
        state.projs.push({ x: e.x, y: e.y - 4, vx: Math.cos(a) * 130, vy: Math.sin(a) * 130, dmg: d.dmg, life: 1.6, hostile: true, from: d.name });
        e.cd = d.atkCd; e.lunge = 0.12;
      }
    } else if (struct && realGl <= 17 && e.cd <= 0) { hurtStruct(struct.i, d.dmg); e.cd = d.atkCd; e.lunge = 0.2; }
  }
}

/* ---------- Zones, gloom and ambushes ---------- */
const AMBUSH_POOLS = { 0: ['hound', 'glowrat'], 2: ['hound', 'hound', 'husk', 'glowrat'], 3: ['hound', 'husk'], 4: ['scrapper', 'gunner', 'hound'], 5: ['glowrat', 'glowrat', 'husk'], 6: ['scrapper', 'gunner'], 7: ['scrapper', 'glowrat'] };
function updateZone(dt) {
  const p = state.player, tx = Math.floor(p.x / TS), ty = Math.floor(p.y / TS);
  const i = ty * W + tx, z = zoneMap[i] || 0;
  revealFog(tx, ty);
  if (z !== state.zone) { state.zone = z; state.banner = { text: ZONE_NAMES[z], t: 3.6 }; }
  if (state.banner) { state.banner.t -= dt; if (state.banner.t <= 0) state.banner = null; }
  state.shakeT = Math.max(0, state.shakeT - dt);
  const inCamp = (radMap[i] || 0) <= -0.9;
  const zd = z === 2 ? 0.3 : z === 5 ? 0.12 : z === 3 ? 0.16 : z === 4 ? 0.07 : 0;
  state.zDark += (zd - state.zDark) * Math.min(1, dt * 1.2);
  const ZD = ZONES.find(q => q.zid === z) || { danger: 0.55 };
  if (inCamp || state.sleeping) { state.threat = Math.max(0, state.threat - dt * 2); state.ambushWarn = 0; return; }
  const night = darkness(clockHour()) > 0.5 ? 1.5 : 1;
  state.threat += dt * ZD.danger * night * (p.moving ? 1 : 0.35);
  if (state.ambushWarn > 0) {
    state.ambushWarn -= dt;
    if (Math.random() < dt * 18) burst(p.x + (Math.random() - 0.5) * 220, p.y + (Math.random() - 0.5) * 140, '#5a7a4a', 2);
    if (state.ambushWarn <= 0) fireAmbush(z);
  } else if (state.threat > state.threatLimit && !enemies.some(e => e.ambush)) {
    state.ambushWarn = 1.8;
    toast('Something is moving in the undergrowth...', 3);
  }
}
function fireAmbush(z) {
  state.threat = 0; state.threatLimit = 32 + Math.random() * 36;
  const p = state.player, pool = AMBUSH_POOLS[z] || AMBUSH_POOLS[0];
  const n = 2 + Math.floor(Math.random() * 2) + (darkness(clockHour()) > 0.5 ? 1 : 0);
  let made = 0;
  for (let k = 0; k < 120 && made < n; k++) {
    const a = Math.random() * 6.283, dd = 165 + Math.random() * 45;
    const x = p.x + Math.cos(a) * dd, y = p.y + Math.sin(a) * dd;
    const tx = Math.floor(x / TS), ty = Math.floor(y / TS);
    if (tx < 3 || ty < 3 || tx >= W - 3 || ty >= H - 3 || solidAt(tx, ty) || (radMap[ty * W + tx] || 0) <= -0.9) continue;
    const e = spawnEnemy(pool[Math.floor(Math.random() * pool.length)], x, y, { ambush: true });
    e.cd = 0.4; made++;
  }
  if (made) { toast('Ambush!', 2); state.shakeT = 0.45; }
}

/* ---------- Raids now walk in from outside the valley walls ---------- */
function startRaid(day) {
  const n = Math.min(12, 3 + Math.floor(day * 0.9));
  const pool = day < 3 ? ['glowrat', 'hound'] : day < 5 ? ['hound', 'scrapper'] : day < 8 ? ['scrapper', 'scrapper', 'gunner', 'hound'] : ['scrapper', 'gunner', 'husk'];
  let baseAng = Math.random() * 6.283;
  for (let t = 0; t < 60; t++) {
    const tx = Math.round(BASE.x + Math.cos(baseAng) * 34), ty = Math.round(BASE.y + Math.sin(baseAng) * 34);
    if (tx > 4 && ty > 4 && tx < W - 4 && ty < H - 4 && !solidAt(tx, ty)) break;
    baseAng = Math.random() * 6.283;
  }
  let made = 0;
  for (let k = 0; k < n * 60 && made < n; k++) {
    const a = baseAng + (Math.random() - 0.5) * 0.9, rr = 31 + Math.random() * 7;
    const x = Math.round(BASE.x + Math.cos(a) * rr), y = Math.round(BASE.y + Math.sin(a) * rr);
    if (x < 3 || y < 3 || x >= W - 3 || y >= H - 3 || solidAt(x, y)) continue;
    spawnEnemy(pool[Math.floor(Math.random() * pool.length)], (x + 0.5) * TS, (y + 0.5) * TS, { raid: true });
    made++;
  }
  const sx = Math.cos(baseAng), sy = Math.sin(baseAng);
  const dirName = Math.abs(sx) > Math.abs(sy) ? (sx > 0 ? 'east' : 'west') : (sy > 0 ? 'south' : 'north');
  state.raid = { total: made, dirName };
  toast('Raiders are coming from the ' + dirName + '! Hold the gates.', 7);
}

/* ---------- Inventory rules: the hotbar only holds things you can use ---------- */
function isHotbarable(name) { return !!(TOOL_ITEMS[name] || WEAPONS[name] || CROPS[name] || ITEM_USE[name]); }
function addItem(name, qty, inv = state.player.inventory) {
  const max = ITEM_STACK[name] || CONFIG.inventory.stackSize;
  const lo = isHotbarable(name) ? 0 : CONFIG.hotbar;
  for (let i = lo; i < inv.length; i++) {
    const s = inv[i];
    if (s && s.name === name && s.qty < max) { const n = Math.min(max - s.qty, qty); s.qty += n; qty -= n; if (!qty) return 0; }
  }
  for (let i = lo; i < inv.length && qty > 0; i++) {
    if (!inv[i]) { const n = Math.min(max, qty); inv[i] = { name, qty: n }; qty -= n; }
  }
  return qty;
}
function putItem(item) {
  if (stackMax(item.name) > 1) return addItem(item.name, item.qty) === 0;
  const inv = state.player.inventory, lo = isHotbarable(item.name) ? 0 : CONFIG.hotbar;
  for (let i = lo; i < inv.length; i++) if (!inv[i]) { inv[i] = item; return true; }
  return false;
}
function invSlotClick(i, btn) {
  const inv = state.player.inventory, s = inv[i], cur = state.cursor;
  if (btn === 2) { if (s) useItem(i); return; }
  if (!cur) { if (s) { state.cursor = s; inv[i] = null; } return; }
  if (i < CONFIG.hotbar && !isHotbarable(cur.name)) { toast('The hotbar only holds tools, weapons, seeds and food or medicine.', 2.5); return; }
  if (!s) { inv[i] = cur; state.cursor = null; return; }
  if (s.name === cur.name && stackMax(s.name) > 1) {
    const room = stackMax(s.name) - s.qty, n = Math.min(room, cur.qty);
    s.qty += n; cur.qty -= n;
    if (cur.qty <= 0) state.cursor = null;
    return;
  }
  inv[i] = cur; state.cursor = s;
}

