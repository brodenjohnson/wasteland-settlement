/* =====================================================================
   W_CONTENT: new mobs, raid types, weapons, armour, loot, survivor stories
   ===================================================================== */
state.cnt = state.cnt || {}; state.clouds = [];

/* ---------- Mobs ---------- */
Object.assign(ENEMY_TYPES, {
  stalker: { name: 'Stalker', hp: 34, dmg: 11, speed: 86, size: 10, aggro: 150, atkCd: 0.8, xp: 11, flank: true },
  sapper: { name: 'Sapper', hp: 30, dmg: 0, speed: 64, size: 10, aggro: 200, atkCd: 1, xp: 14, special: true },
  brute: { name: 'Brute', hp: 170, dmg: 26, speed: 28, size: 14, aggro: 120, atkCd: 1.6, xp: 36, structMult: 2.5 },
  sniper: { name: 'Sniper', hp: 36, dmg: 24, speed: 36, size: 10, aggro: 240, atkCd: 2.6, xp: 26, ranged: true, keep: 150, projSpeed: 300, projLife: 1.2 },
  bloater: { name: 'Bloater', hp: 62, dmg: 15, speed: 24, size: 12, aggro: 90, atkCd: 1.8, xp: 20 },
  spitter: { name: 'Spitter', hp: 40, dmg: 8, speed: 36, size: 10, aggro: 150, atkCd: 2.0, xp: 17, ranged: true, keep: 90, projSpeed: 95, projLife: 2.2, projRad: 7 },
  chief: { name: 'Raid Chief', hp: 380, dmg: 22, speed: 38, size: 14, aggro: 230, atkCd: 1.1, xp: 130, structMult: 2 }
});
Object.assign(DROPS, {
  stalker: [{ n: 'Scrap', c: 0.3, a: 1, b: 2 }, { n: 'Raw Meat', c: 0.5, a: 1, b: 2 }],
  sapper: [{ n: 'Scrap', c: 0.8, a: 2, b: 4 }, { n: 'Metal plate', c: 0.15, a: 1, b: 1 }],
  brute: [{ n: 'Scrap', c: 0.9, a: 3, b: 6 }, { n: 'Cloth', c: 0.5, a: 2, b: 3 }, { n: 'Sledgehammer', c: 0.07, a: 1, b: 1 }, { n: 'Fire Axe', c: 0.06, a: 1, b: 1 }],
  sniper: [{ n: 'Pistol rounds', c: 0.6, a: 3, b: 5 }, { n: 'Scrap', c: 0.5, a: 1, b: 3 }, { n: 'Hunting Rifle', c: 0.04, a: 1, b: 1 }, { n: 'Riot Helmet', c: 0.04, a: 1, b: 1 }],
  bloater: [{ n: 'Raw Meat', c: 0.4, a: 1, b: 2 }, { n: 'Rad tabs', c: 0.25, a: 1, b: 1 }],
  spitter: [{ n: 'Raw Meat', c: 0.35, a: 1, b: 1 }, { n: 'Rad tabs', c: 0.15, a: 1, b: 1 }],
  chief: [{ n: 'Caps', c: 1, a: 40, b: 80 }, { n: 'Raider Blade', c: 0.5, a: 1, b: 1 }, { n: 'Pump Shotgun', c: 0.4, a: 1, b: 1 }, { n: 'Riot Vest', c: 0.5, a: 1, b: 1 }, { n: 'Metal plate', c: 1, a: 4, b: 6 }]
});
DROPS.scrapper.push({ n: 'Crowbar', c: 0.04, a: 1, b: 1 }, { n: 'Spiked Bat', c: 0.03, a: 1, b: 1 });
DROPS.gunner.push({ n: 'Revolver', c: 0.03, a: 1, b: 1 }, { n: 'Shells', c: 0.25, a: 2, b: 4 }, { n: 'Sawn-off Shotgun', c: 0.02, a: 1, b: 1 });
Object.assign(CREATURE_LORE, {
  stalker: 'Lean, dark and patient. It bites and backs off, bites and backs off, until you are tired.',
  sapper: 'A raider in a vest of dynamite. It does not want to fight you. It wants your wall.',
  brute: 'A raider the size of a door. Walls are the only thing it respects, and only briefly.',
  sniper: 'Keeps its distance and its patience. Will pick at your guards from the treeline.',
  bloater: 'A swollen thing that drifts through the marsh. Pop it and the air turns bad.',
  spitter: 'Spits something that burns on the way in and glows on the way out.',
  chief: 'Leads the warband from the middle. Take the chief and the rest lose their nerve.'
});
function paintHoundC(c, f, p) {
  c.translate(0, 1); const lg = f ? 2 : 0;
  R(c, p.a, 0, 4, 5, 2); R(c, p.a, 1, 2 + (lg ? 1 : 0), 3, 2); R(c, p.b, 0, 5, 3, 1);
  R(c, p.b, 4, 5, 15, 4); R(c, p.a, 4, 8, 15, 5); R(c, p.c, 5, 8, 12, 1); R(c, p.d, 4, 12, 15, 1);
  for (let k = 0; k < 5; k++) R(c, p.b, 7 + k * 2, 5, 1, 2);
  R(c, p.a, 18, 3, 7, 7); R(c, p.e, 18, 1, 3, 3); R(c, p.b, 22, 7, 4, 3); R(c, '#14120f', 25, 7, 1, 2);
  R(c, p.eye, 21, 4, 2, 2); R(c, '#ffffff', 21, 4, 1, 1); R(c, '#e8e0d0', 22, 10, 1, 2); R(c, '#e8e0d0', 24, 10, 1, 1);
  R(c, p.b, 5 + lg, 13, 3, 4); R(c, p.b, 9 - lg, 13, 3, 4); R(c, p.b, 15 + lg, 13, 3, 4); R(c, p.b, 19 - lg, 13, 3, 4);
}
function paintBloater(c, f) {
  c.translate(0, 1); const p = f ? 1 : 0;
  R(c, '#4a6a3a', 3, 3, 14, 12); R(c, '#6a9a4a', 4, 2, 12, 3); R(c, '#8aba5a', 5, 3, 5, 2); R(c, '#3a5a2a', 3, 13, 14, 2);
  R(c, '#b6e85a', 6, 6, 3, 3); R(c, '#b6e85a', 11, 8, 3, 3); R(c, '#e8ff9a', 6, 6, 1, 1); R(c, '#e8ff9a', 11, 8, 1, 1);
  R(c, '#1a1a10', 7, 4, 2, 2); R(c, '#1a1a10', 11, 4, 2, 2);
  R(c, '#3a5a2a', 4, 15 + p, 3, 3); R(c, '#3a5a2a', 13, 15 + (1 - p), 3, 3); R(c, '#3a5a2a', 8, 16, 3, 2);
}
function paintSpitter(c, f) {
  c.translate(0, 1); const l = f ? 1 : 0;
  R(c, '#5a6a2a', 0, 8, 4, 2); R(c, '#6a7a3a', 2, 6, 14, 6); R(c, '#8a9a52', 3, 6, 12, 1); R(c, '#4a5a22', 2, 11, 14, 1);
  R(c, '#7a8a42', 14, 4, 6, 6); R(c, '#ffe94a', 17, 5, 2, 2); R(c, '#14120f', 18, 5, 1, 1); R(c, '#c8e84a', 14, 9, 4, 3); R(c, '#e8ff7a', 15, 9, 2, 1);
  R(c, '#4a5a22', 4 + l, 12, 3, 3); R(c, '#4a5a22', 12 - l, 12, 3, 3);
}
const HUM = (o, extra) => (c, f) => { paintHuman2(c, f, o); if (extra) extra(c, f); };
Object.assign(ENEMY_SPR, {
  stalker: { w: 27, h: 18, paint: (c, f) => paintHoundC(c, f, { a: '#3a4048', b: '#2a3038', c: '#4a5058', d: '#1e242a', e: '#161a1e', eye: '#e8e03a' }) },
  sapper: { w: 22, h: 31, paint: HUM({ legs: '#4a4a3a', body: '#a8601f', skin: '#c9a07a', eye: '#20160f', hood: '#2a2a2a', accent: '#e8c24a', mask: '#5a5a62' }, (c, f) => { R(c, '#c0392b', 4, 13, 2, 6); R(c, '#c0392b', 8, 13, 2, 6); R(c, '#c0392b', 12, 13, 2, 6); R(c, '#e8e0d0', 4, 12, 10, 1); R(c, f ? '#ffe9a0' : '#e8c24a', 9, 10, 1, 2); }) },
  brute: { w: 24, h: 33, paint: HUM({ legs: '#3a3030', body: '#5a3a3a', skin: '#b88a6a', eye: '#20160f', plate: '#6a6d74', mask: '#3a3a40', club: true, bulk: true }) },
  sniper: { w: 28, h: 31, paint: HUM({ legs: '#3a3f48', body: '#4a5260', skin: '#c9a07a', eye: '#20160f', hood: '#2a3038', mask: '#8a8a90', accent: '#c0392b' }, c => { R(c, '#2a2a30', 12, 15, 14, 2); R(c, '#6a6a74', 22, 14, 4, 1); R(c, '#3b2a1c', 12, 17, 3, 3); R(c, '#8a8a94', 13, 15, 8, 1); }) },
  bloater: { w: 20, h: 19, paint: paintBloater },
  spitter: { w: 24, h: 15, paint: paintSpitter },
  chief: { w: 24, h: 34, paint: HUM({ legs: '#2a2a2a', body: '#8a2a2a', skin: '#b88a6a', eye: '#20160f', plate: '#c8a040', mask: '#2a2a2a', accent: '#d6a84a', club: true, bulk: true, hair: '#c0392b' }, c => { R(c, '#c0392b', 1, 12, 3, 12); R(c, '#e05a4a', 1, 12, 1, 12); R(c, '#d6a84a', 6, -1, 1, 2); R(c, '#d6a84a', 9, -2, 1, 3); R(c, '#d6a84a', 12, -1, 1, 2); }) }
});
function explodeSapper(e, d) {
  const ix = enemies.indexOf(e); if (ix >= 0) enemies.splice(ix, 1);
  for (const [i] of structs) { const sx = ((i % W) + 0.5) * TS, sy = (Math.floor(i / W) + 0.5) * TS; if (Math.hypot(sx - e.x, sy - e.y) < 34) hurtStruct(i, 90); }
  const p = state.player; if (Math.hypot(p.x - e.x, p.y - e.y) < 32) hurtPlayer(26, 'Sapper', (p.x - e.x) / 20, (p.y - e.y) / 20);
  for (const s of settlers) if (Math.hypot(s.x - e.x, s.y - e.y) < 32) hurtSettler(s, 26);
  burst(e.x, e.y - 4, '#ffb347', 20); burst(e.x, e.y - 4, '#555', 10); state.shakeT = Math.max(state.shakeT, 0.3); sfx('break'); sfx('thunder');
  if (e.spawnIdx >= 0 && state.spawnPts[e.spawnIdx]) { const sp = state.spawnPts[e.spawnIdx]; sp.e = null; sp.respawnAt = state.gameMinutes + 1800; }
}
function specialAI(e, d, dt, dist) {
  if (e.type !== 'sapper') return false;
  if (!e.raid && !e.ambush && dist > d.aggro) return false;
  const p = state.player; let gx = p.x, gy = p.y - 3, st = null;
  if (e.raid) { st = nearestStruct(e.x, e.y); if (st) { gx = st.x; gy = st.y; } }
  const wp = steerGoal(e, gx, gy, dt, 12000); let vx = wp[0] - e.x, vy = wp[1] - e.y; const l = Math.hypot(vx, vy) || 1; vx /= l; vy /= l;
  const real = Math.hypot(gx - e.x, gy - e.y);
  if (real > 14) {
    e.fuse = 0; const mv = d.speed * dt, moved = (!collides(e.x + vx * mv, e.y, d.size) ? (e.x += vx * mv, true) : false) | (!collides(e.x, e.y + vy * mv, d.size) ? (e.y += vy * mv, true) : false);
    if (!moved) { e.stuck += dt; if (e.stuck > 0.3) { e.sideT = 0.5; e.stuck = 0; } } else e.stuck = 0;
    if (Math.abs(vx) > 0.2) e.dirx = vx > 0 ? 1 : -1; e.walkT += dt;
  } else { e.fuse = (e.fuse || 0) + dt; e.flash = Math.floor(state.elapsed * 12) % 2 ? 0.1 : 0; if (e.fuse > 0.7) explodeSapper(e, d); }
  return true;
}
function chiefRally(dt) {
  for (const c of enemies) {
    if (c.type !== 'chief') continue;
    c.rallyT = (c.rallyT || 3) - dt;
    if (c.rallyT <= 0) { c.rallyT = 7; let n = 0; for (const o of enemies) if (o !== c && o.raid && Math.hypot(o.x - c.x, o.y - c.y) < 170) { o.rally = 3; n++; } if (n) state.floats.push({ x: c.x, y: c.y - 30, text: 'RALLY', color: '#ff7a5a', life: 1.2 }); }
  }
  for (const o of enemies) if (o.rally > 0) o.rally -= dt;
}
{ const o = updateEnemies; updateEnemies = function (dt) { chiefRally(dt); o(dt); }; }
{ const o = killEnemy; killEnemy = function (e) {
  const wasChief = e.type === 'chief' && e.raid, x = e.x, y = e.y;
  o(e);
  state.cnt['k:' + e.type] = (state.cnt['k:' + e.type] || 0) + 1;
  if (['scrapper', 'gunner', 'sniper', 'sapper', 'brute', 'chief'].includes(e.type)) state.cnt.kRaider = (state.cnt.kRaider || 0) + 1;
  if (e.type === 'bloater') { state.clouds.push({ x, y, r: 34, t: 9 }); toast('The bloater bursts. Stay out of the green.', 3); }
  if (wasChief) { toast('The chief falls. The raiders lose their nerve and run.', 5); state.routAt = state.elapsed + 3.5; }
}; }
{ const o = updateRaids; updateRaids = function () {
  if (state.routAt && state.elapsed > state.routAt) { state.routAt = 0; for (let i = enemies.length - 1; i >= 0; i--) if (enemies[i].raid) { burst(enemies[i].x, enemies[i].y - 4, '#888', 5); enemies.splice(i, 1); } }
  const had = !!state.raid; o();
  if (had && !state.raid) state.cnt.raidsDone = (state.cnt.raidsDone || 0) + 1;
}; }
function updateClouds(dt) {
  const p = state.player;
  for (let i = state.clouds.length - 1; i >= 0; i--) {
    const c = state.clouds[i]; c.t -= dt;
    if (c.t <= 0) { state.clouds.splice(i, 1); continue; }
    if (Math.hypot(p.x - c.x, p.y - c.y) < c.r) p.radiation = Math.min(100, p.radiation + 4 * dt * (1 - armourStats().rad) * (1 - Math.min(0.9, buffFx('radRes'))));
  }
}
function drawToxicClouds() {
  for (const c of state.clouds) {
    const a = Math.min(1, c.t / 3) * 0.32;
    const g = ctx.createRadialGradient(c.x, c.y - 4, 2, c.x, c.y - 4, c.r);
    g.addColorStop(0, 'rgba(150,230,60,' + a + ')'); g.addColorStop(1, 'rgba(110,190,40,0)');
    ctx.fillStyle = g; ctx.fillRect(c.x - c.r, c.y - c.r - 4, c.r * 2, c.r * 2);
  }
}
{ const o = updateStorm; updateStorm = function (dt) { o(dt); updateClouds(dt); varySpawns(); }; }
function varySpawns() {
  if (state.qflags.spawnVar || state.title || !state.spawnPts.length) return;
  state.qflags.spawnVar = true;
  const table = { 2: [['stalker', 0.3]], 3: [['stalker', 0.3], ['spitter', 0.15]], 4: [['sniper', 0.25], ['sapper', 0.15], ['brute', 0.12]], 5: [['bloater', 0.35], ['spitter', 0.25]], 6: [['brute', 0.25]], 7: [['sapper', 0.2], ['brute', 0.2]] };
  for (const sp of state.spawnPts) {
    if (!['glowrat', 'hound', 'scrapper', 'gunner'].includes(sp.type)) continue;
    const z = zoneMap[Math.floor(sp.y / TS) * W + Math.floor(sp.x / TS)], list = table[z];
    if (!list) continue;
    let r = Math.random();
    for (const [t, c] of list) { if (r < c) { sp.type = t; break; } r -= c; }
  }
}

/* ---------- Raid types ---------- */
const RAID_KINDS = {
  scavs: { name: 'A scavenger band', mult: 1, minDay: 0, hint: 'Hold the gates.', pool: day => day < 3 ? ['glowrat', 'hound'] : day < 5 ? ['hound', 'scrapper', 'stalker'] : day < 8 ? ['scrapper', 'scrapper', 'gunner', 'hound', 'stalker'] : ['scrapper', 'gunner', 'husk', 'stalker'] },
  swarm: { name: 'A swarm of vermin', mult: 1.7, minDay: 2, hint: 'Lots of them, and fast. Keep your back to a wall.', pool: () => ['glowrat', 'glowrat', 'glowrat', 'hound', 'stalker'] },
  breach: { name: 'Breachers', mult: 0.9, minDay: 4, hint: 'They carry charges. Keep them off your walls.', pool: () => ['sapper', 'sapper', 'brute', 'scrapper'] },
  guns: { name: 'A gun crew', mult: 0.9, minDay: 5, hint: 'Snipers will pick at your guards.', pool: () => ['gunner', 'gunner', 'sniper', 'scrapper'] },
  siege: { name: 'A warband under a Raid Chief', mult: 1.2, minDay: 6, hint: 'Drop the chief and the rest will break.', pool: () => ['scrapper', 'gunner', 'brute', 'sapper', 'sniper'] }
};
function pickRaid(day) {
  state.raidCount = (state.raidCount || 0) + 1;
  if (state.raidCount % 5 === 0 && day >= 6) return RAID_KINDS.siege;
  const opts = Object.keys(RAID_KINDS).filter(k => k !== 'siege' && day >= RAID_KINDS[k].minDay);
  return RAID_KINDS[opts[Math.floor(Math.random() * opts.length)]];
}
function raidExtras(RK, baseAng) {
  if (RK !== RAID_KINDS.siege) return 0;
  let made = 0;
  const spawnAt = (ang, type) => {
    for (let k = 0; k < 80; k++) {
      const a = ang + (Math.random() - 0.5) * 0.6, rr = 31 + Math.random() * 6, x = Math.round(BASE.x + Math.cos(a) * rr), y = Math.round(BASE.y + Math.sin(a) * rr);
      if (x < 3 || y < 3 || x >= W - 3 || y >= H - 3 || solidAt(x, y)) continue;
      spawnEnemy(type, (x + 0.5) * TS, (y + 0.5) * TS, { raid: true }); made++; return;
    }
  };
  spawnAt(baseAng, 'chief');
  const second = baseAng + 1.7;
  for (let k = 0; k < 4; k++) spawnAt(second, ['scrapper', 'gunner', 'brute', 'sapper'][k % 4]);
  return made;
}

/* ---------- Weapons ---------- */
Object.assign(WEAPONS, {
  'Spear': { kind: 'melee', dmg: 24, cd: 0.55, reach: 34, kb: 130, col: '#a89a7a' }, 'Crowbar': { kind: 'melee', dmg: 21, cd: 0.38, reach: 22, kb: 160, col: '#7a2a2a' },
  'Spiked Bat': { kind: 'melee', dmg: 30, cd: 0.5, reach: 23, kb: 210, col: '#8a6a4a' }, 'Fire Axe': { kind: 'melee', dmg: 40, cd: 0.62, reach: 25, kb: 230, col: '#c0392b' },
  'Sledgehammer': { kind: 'melee', dmg: 62, cd: 1.0, reach: 25, kb: 420, col: '#7a7d84' }, 'Raider Blade': { kind: 'melee', dmg: 46, cd: 0.42, reach: 27, kb: 210, col: '#d8dce4' },
  'Revolver': { kind: 'gun', dmg: 36, cd: 0.75, speed: 270, range: 210, ammo: 'Pistol rounds', col: '#6a6a74' },
  'Scrap SMG': { kind: 'gun', dmg: 11, cd: 0.13, speed: 250, range: 150, ammo: 'Pistol rounds', col: '#5a5a62' },
  'Sawn-off Shotgun': { kind: 'gun', dmg: 11, pellets: 5, spread: 0.45, cd: 1.15, speed: 230, range: 95, ammo: 'Shells', col: '#6a5a4a' },
  'Pump Shotgun': { kind: 'gun', dmg: 13, pellets: 6, spread: 0.35, cd: 0.95, speed: 250, range: 120, ammo: 'Shells', col: '#5a4a3a' },
  'Crossbow': { kind: 'gun', dmg: 38, cd: 0.95, speed: 280, range: 230, ammo: 'Bolts', col: '#7a5a3a' }
});
for (const k of ['Spear', 'Crowbar', 'Spiked Bat', 'Fire Axe', 'Sledgehammer', 'Raider Blade', 'Revolver', 'Scrap SMG', 'Sawn-off Shotgun', 'Pump Shotgun', 'Crossbow']) { ITEM_STACK[k] = 1; ITEM_COL[k] = WEAPONS[k].col; }
Object.assign(ITEM_COL, { 'Shells': '#c0392b', 'Bolts': '#a89a7a' });
Object.assign(ITEM_DESC, {
  'Spear': 'Long reach. Poke things from a safe distance.', 'Crowbar': 'Quick and cheap. Opens things, too.', 'Spiked Bat': 'Heavy knockback.', 'Fire Axe': 'A proper chop. Found on brutes.',
  'Sledgehammer': 'Slow, and it hits like a door slamming.', 'Raider Blade': 'The chief carried this. It is balanced better than it deserves to be.',
  'Revolver': 'Six rounds of confidence. Hits hard.', 'Scrap SMG': 'Spits pistol rounds quickly. Hungry for ammo.', 'Sawn-off Shotgun': 'Spreads shot. Devastating up close, useless at range.',
  'Pump Shotgun': 'Six pellets per shot. Needs shells.', 'Crossbow': 'Quiet and accurate. Uses bolts you can make yourself.', 'Shells': 'Shotgun shells.', 'Bolts': 'Crossbow bolts.'
});
{ const o = iconKind; iconKind = function (n) { return n === 'Shells' || n === 'Bolts' ? 'ammo' : o(n); }; }
{ const o = fireGun; fireGun = function (w) {
  if (!w.pellets) return o(w);
  const p = state.player;
  if (countItem(w.ammo) <= 0) { toast('Out of ' + w.ammo.toLowerCase() + '.', 1.5); state.actCd = 0.4; return; }
  takeItems({ [w.ammo]: 1 });
  const a0 = Math.atan2(p.aimY, p.aimX);
  for (let k = 0; k < w.pellets; k++) { const a = a0 + (Math.random() - 0.5) * w.spread; state.projs.push({ x: p.x + p.aimX * 8, y: p.y - 3 + p.aimY * 8, vx: Math.cos(a) * w.speed, vy: Math.sin(a) * w.speed, dmg: w.dmg * dmgScale(), life: w.range / w.speed, hostile: false, from: 'You' }); }
  state.actCd = w.cd; state.muzzle = 0.1; p.kbx -= p.aimX * 70; p.kby -= p.aimY * 70; state.shakeT = Math.max(state.shakeT, 0.05);
}; }
{ const rs = [
  ['spear', 'Weapons', 'Spear', 'workbench', { 'Wood': 3, 'Scrap': 2 }, 'Spear', 1], ['crowbar', 'Weapons', 'Crowbar', 'workbench', { 'Scrap': 6 }, 'Crowbar', 1],
  ['spiked_bat', 'Weapons', 'Spiked Bat', 'workbench', { 'Wood': 3, 'Scrap': 6, 'Metal plate': 1 }, 'Spiked Bat', 2], ['crossbow', 'Weapons', 'Crossbow', 'workbench', { 'Wood': 4, 'Scrap': 6, 'Cloth': 2 }, 'Crossbow', 2],
  ['sawnoff', 'Weapons', 'Sawn-off Shotgun', 'forge', { 'Metal plate': 3, 'Wood': 2 }, 'Sawn-off Shotgun', 2], ['scrap_smg', 'Weapons', 'Scrap SMG', 'anvil', { 'Metal plate': 4, 'Scrap': 8 }, 'Scrap SMG', 3],
  ['sledge', 'Weapons', 'Sledgehammer', 'anvil', { 'Steel Ingot': 2, 'Wood': 3 }, 'Sledgehammer', 3]];
  for (const [id, cat, name, st, cost, gives, tier] of rs) { const r = rc(id, cat, name, st, cost, { gives: { [gives]: 1 } }); r.tier = tier; }
  const a1 = rc('bolts', 'Weapons', 'Bolts x6', 'workbench', { 'Wood': 1, 'Scrap': 2 }, { gives: { 'Bolts': 6 } }); a1.tier = 2;
  const a2 = rc('shells', 'Weapons', 'Shells x6', 'forge', { 'Scrap': 3, 'Cloth': 1 }, { gives: { 'Shells': 6 } }); a2.tier = 2; }

/* ---------- Armour ---------- */
Object.assign(ARMOUR, {
  'Padded Cap': { slot: 'head', dmg: 0.03, rad: 0, col: '#b89a6a' }, 'Padded Jacket': { slot: 'body', dmg: 0.08, rad: 0, col: '#b08a5a' }, 'Padded Trousers': { slot: 'legs', dmg: 0.05, rad: 0, col: '#a68252' }, 'Padded Shoes': { slot: 'feet', dmg: 0.02, rad: 0, col: '#8a6a42' },
  'Riot Helmet': { slot: 'head', dmg: 0.11, rad: 0, col: '#3a4a6a' }, 'Riot Vest': { slot: 'body', dmg: 0.2, rad: 0, col: '#34425e' }, 'Riot Greaves': { slot: 'legs', dmg: 0.14, rad: 0, col: '#2e3a54' }, 'Riot Boots': { slot: 'feet', dmg: 0.08, rad: 0, col: '#28324a' },
  'Gas Mask': { slot: 'head', dmg: 0.02, rad: 0.26, col: '#5a6a3a' }, 'Lead Apron': { slot: 'body', dmg: 0.1, rad: 0.4, col: '#7a8088' },
  'Runner Wraps': { slot: 'acc', dmg: 0, rad: 0, col: '#c8a06a' }, 'Geiger Band': { slot: 'acc', dmg: 0, rad: 0.12, col: '#6a8a6a' }, 'Raider Totem': { slot: 'acc', dmg: 0.08, rad: 0, col: '#a8301a' }
});
for (const k of ['Padded Cap', 'Padded Jacket', 'Padded Trousers', 'Padded Shoes', 'Riot Helmet', 'Riot Vest', 'Riot Greaves', 'Riot Boots', 'Gas Mask', 'Lead Apron', 'Runner Wraps', 'Geiger Band', 'Raider Totem']) { ITEM_STACK[k] = 1; ITEM_COL[k] = ARMOUR[k].col; }
Object.assign(ITEM_TIER, { 'Spear': 1, 'Crowbar': 1, 'Spiked Bat': 2, 'Crossbow': 2, 'Sawn-off Shotgun': 2, 'Scrap SMG': 2, 'Sledgehammer': 2, 'Fire Axe': 3, 'Raider Blade': 3, 'Revolver': 3, 'Pump Shotgun': 3,
  'Padded Cap': 1, 'Padded Jacket': 1, 'Padded Trousers': 1, 'Padded Shoes': 1, 'Riot Helmet': 3, 'Riot Vest': 3, 'Riot Greaves': 3, 'Riot Boots': 3, 'Gas Mask': 2, 'Lead Apron': 2, 'Runner Wraps': 1, 'Geiger Band': 2, 'Raider Totem': 3 });
ITEM_DESC['Runner Wraps'] = 'Bandaged ankles. Stamina recovers 20% faster.'; ITEM_DESC['Geiger Band'] = 'A wrist band that clicks and shields a little.'; ITEM_DESC['Raider Totem'] = 'A charm of bone and wire. Hits a little harder.';
ITEM_DESC['Lead Apron'] = 'Heavy, ugly and good against radiation.'; ITEM_DESC['Gas Mask'] = 'Filters a lot of the bad air.';
{ const rs = [
  ['pad_cap', 'Padded Cap', { 'Cloth': 3 }, 1], ['pad_jacket', 'Padded Jacket', { 'Cloth': 6, 'Scrap': 1 }, 1], ['pad_trousers', 'Padded Trousers', { 'Cloth': 4 }, 1], ['pad_shoes', 'Padded Shoes', { 'Cloth': 3 }, 1],
  ['gas_mask', 'Gas Mask', { 'Metal plate': 2, 'Cloth': 3, 'Rad tabs': 1 }, 3], ['lead_apron', 'Lead Apron', { 'Metal plate': 5, 'Cloth': 4 }, 3], ['runner_wraps', 'Runner Wraps', { 'Cloth': 3, 'Scrap': 1 }, 1], ['geiger_band', 'Geiger Band', { 'Metal plate': 1, 'Scrap': 3 }, 2]];
  for (const [id, name, cost, tier] of rs) { const r = rc(id, 'Armour', name, tier >= 3 ? 'forge' : 'workbench', cost, { gives: { [name]: 1 } }); r.tier = tier; } }
function stylePaint(c, name, parts) { const col = ARMOUR[name].col; parts(col); }
{ const o = overlayHead; overlayHead = function (c, name, dir, side) {
  const col = ARMOUR[name] && ARMOUR[name].col;
  if (name === 'Padded Cap') { R(c, col, 3, 0, 12, 5); R(c, shade(col, 24), 4, 0, 8, 1); R(c, shade(col, -30), 3, 4, 12, 1); R(c, shade(col, -16), 8, 0, 1, 4); }
  else if (name === 'Riot Helmet') { R(c, col, 3, 0, 12, 8); R(c, shade(col, 36), 4, 0, 5, 1); R(c, shade(col, -34), 3, 7, 12, 1); if (dir === 0) { R(c, '#8ac8e0', 5, 4, 8, 3); R(c, '#ffffff', 6, 4, 2, 1); } else if (side) { R(c, '#8ac8e0', 9, 4, 5, 3); R(c, '#ffffff', 10, 4, 1, 1); } }
  else if (name === 'Gas Mask') { R(c, col, 3, 0, 12, 6); R(c, shade(col, 24), 4, 0, 8, 1); if (dir === 0) { R(c, '#2a2a2a', 5, 4, 8, 4); R(c, '#aee0e8', 5, 4, 3, 2); R(c, '#aee0e8', 10, 4, 3, 2); R(c, '#8a8a90', 7, 6, 4, 4); R(c, '#4a4a50', 8, 8, 2, 1); } else if (side) { R(c, '#2a2a2a', 9, 4, 5, 4); R(c, '#aee0e8', 10, 4, 3, 2); R(c, '#8a8a90', 12, 6, 3, 4); } }
  else o(c, name, dir, side);
}; }
{ const o = overlayBody; overlayBody = function (c, name, dir, side) {
  const col = ARMOUR[name] && ARMOUR[name].col, tx = side ? 5 : 3, tw = side ? 8 : 12;
  if (name === 'Padded Jacket') { R(c, col, tx, 11, tw, 9); R(c, shade(col, 24), tx + 1, 11, tw - 2, 1); R(c, shade(col, -24), tx, 15, tw, 1); R(c, shade(col, -24), tx, 18, tw, 1); R(c, '#e8dcc0', tx + (tw >> 1), 11, 1, 9); }
  else if (name === 'Riot Vest') { R(c, col, tx, 11, tw, 9); R(c, shade(col, 34), tx + 1, 11, 3, 5); R(c, shade(col, -28), tx, 16, tw, 1); R(c, '#d6c84a', tx, 14, tw, 1); R(c, '#14120f', tx, 19, tw, 1); }
  else if (name === 'Lead Apron') { R(c, col, tx - 1, 11, tw + 2, 10); R(c, shade(col, 30), tx, 12, tw, 3); R(c, shade(col, -30), tx, 16, tw, 4); R(c, '#14120f', tx + 1, 11, 1, 10); R(c, '#14120f', tx + tw - 2, 11, 1, 10); R(c, '#d6c84a', tx + (tw >> 1) - 1, 13, 2, 2); }
  else o(c, name, dir, side);
}; }
{ const o = overlayLeg; overlayLeg = function (c, name, x, w, lift) {
  const col = ARMOUR[name] && ARMOUR[name].col;
  if (name === 'Padded Trousers') { R(c, col, x, 20, w, 5 - lift); R(c, shade(col, 22), x, 20, w, 1); R(c, shade(col, -24), x, 23, w, 1); }
  else if (name === 'Riot Greaves') { R(c, col, x, 20, w, 6 - lift); R(c, shade(col, 34), x, 20, w, 1); R(c, shade(col, 34), x + 1, 23, w - 2, 2); R(c, '#14120f', x, 22, w, 1); }
  else o(c, name, x, w, lift);
}; }
{ const o = overlayFoot; overlayFoot = function (c, name, x, w, lift) {
  const col = ARMOUR[name] && ARMOUR[name].col, y = 25 - lift;
  if (name === 'Padded Shoes') { R(c, col, x - 1, y, w + 2, 3); R(c, shade(col, 26), x - 1, y, w + 2, 1); R(c, '#e8dcc0', x, y + 1, 2, 1); }
  else if (name === 'Riot Boots') { R(c, col, x - 1, y - 2, w + 2, 5); R(c, shade(col, 34), x - 1, y - 2, w + 2, 1); R(c, '#14120f', x - 1, y + 2, w + 2, 1); }
  else o(c, name, x, w, lift);
}; }
{ const o = rollLoot; rollLoot = function (rng, rich) {
  const r = o(rng, rich);
  if (rng() < (rich ? 0.3 : 0.07)) {
    const pool = ['Spear', 'Crowbar', 'Spiked Bat', 'Shells', 'Padded Jacket', 'Runner Wraps', 'Gas Mask', 'Geiger Band', 'Riot Helmet', 'Riot Boots', 'Revolver', 'Sawn-off Shotgun', 'Bolts'];
    const n = pool[Math.floor(rng() * pool.length)]; r.items.push({ name: n, qty: n === 'Shells' || n === 'Bolts' ? 4 : 1 });
  }
  return r;
}; }

/* ---------- Survivor stories: a bio, a request and a card for each of the ten ---------- */
const BIO2 = {
  'Marta Voss': 'Ran the greenhouse at the old valley co-op until the roof came down. Still carries a packet of seeds in her pocket. Tag 1 is on her wrist and she does not remember putting it there.',
  'Dex Harlan': 'Quarry foreman. Knows every rock in the Scrapyard and holds a grudge against every raider in it. Tag 2. His crew is gone and he will not say how.',
  'Wren Alvarez': 'Scavenger who grew up in the pines. Quiet, quick, and good at not being seen. Tag 3. She woke first and has been walking ever since.',
  'Old Tomas': 'Kept bees before the bombs. Insists the bees survived somewhere. Grows a mean tomato. Tag 4, which he finds hilarious, because he never signed up for anything.',
  'Ripley Cho': 'Bunker engineer with an engineer\u2019s patience for bad plans. Tag 5. She trusts concrete, steel and very little else.',
  'Sam Oduya': 'Drove trucks for the depot and knows every road that is still a road. Tag 6. Keeps a spare tyre in his bag, out of habit.',
  'Lena Fischer': 'Medic. Steady hands and an unsteady memory. Tag 7. She has stitched herself up twice since waking and is not proud of either.',
  'Boone Keller': 'Security. Big, careful, and ashamed of something he will not name. Tag 8. He keeps his back to a wall.',
  'Priya Nair': 'Radio technician. Can hear a signal through a wall. Tag 9. She does not like the broadcast and will not say why.',
  'Juno Park': 'The youngest of the ten. Cooked for the wake group. Tag 10. She asks everyone the same question: did you eat?'
};
const SURV_QUESTS = {
  'Marta Voss': { id: 'sq_marta', title: 'The Last Packet', intro: 'I have one packet left and it is not enough. Grow me some tomatoes, bring me three, and I will tell you what the label on the case said.', hint: 'Grow tomatoes (they take six days) and bring her three.',
    steps: [{ id: 'have', text: 'Grow three Tomatoes', check: () => countItem('Tomato') >= 3 }, { id: 'give', text: 'Give Marta three Tomatoes', give: { name: 'Tomato', qty: 3 } }], reward: { xp: 60, items: [{ name: 'Tomato Seeds', qty: 6 }, { name: 'Tag Card 1', qty: 1 }] }, perk: s => { s.skills.farm += 1; } },
  'Dex Harlan': { id: 'sq_dex', title: 'Dex\u2019s Grudge', intro: 'Raiders took my crew. Put five of them down and bring me stone for a marker. Ten pieces. Then I will talk.', hint: 'Defeat five raiders (scrappers, gunners, snipers, sappers, brutes) and bring ten Stone.',
    steps: [{ id: 'kill', text: 'Defeat five raiders', check: () => since('sq_dex', 'kRaider') >= 5 }, { id: 'give', text: 'Give Dex ten Stone', give: { name: 'Stone', qty: 10 } }], reward: { xp: 80, items: [{ name: 'Sledgehammer', qty: 1 }, { name: 'Tag Card 2', qty: 1 }] }, perk: s => { s.skills.guard += 1; } },
  'Wren Alvarez': { id: 'sq_wren', title: 'Eyes in the Pines', intro: 'I walked the whole map looking for the others. If you want to know what I found, walk it yourself. The pines, the ashlands and the city. Then I will sketch you something.', hint: 'Visit Whisper Pines, The Ashlands and Fallen City.',
    steps: [{ id: 'walk', text: 'Visit Whisper Pines, the Ashlands and Fallen City', check: () => ['Whisper Pines', 'The Ashlands', 'Fallen City'].every(n => state.codex.places[n]) }], reward: { xp: 70, items: [{ name: 'Runner Wraps', qty: 1 }, { name: 'Tag Card 3', qty: 1 }] }, perk: s => { s.skills.haul += 1; addRumour(); addRumour(); } },
  'Old Tomas': { id: 'sq_tomas', title: 'The Bees Survived', intro: 'They survived somewhere. I would bet my boots. Bring me six berries and put a pot of something green on the table. The bees like a garden.', hint: 'Give him six Berries and place a Pot somewhere in camp.',
    steps: [{ id: 'give', text: 'Give Tomas six Berries', give: { name: 'Berries', qty: 6 } }, { id: 'pot', text: 'Place a Pot in the camp', check: () => hasStruct('pot') }], reward: { xp: 60, items: [{ name: 'Wild Honey', qty: 4 }, { name: 'Tag Card 4', qty: 1 }] }, perk: s => { s.skills.farm += 1; } },
  'Ripley Cho': { id: 'sq_ripley', title: 'Hold the Line', intro: 'I will tell you about the bunker. First put two guard towers up and get through a raid. I want to see how you hold a line.', hint: 'Build two Guard Posts and survive a raid.',
    steps: [{ id: 'towers', text: 'Build two Guard Posts', check: () => structCount(['guardpost']) >= 2 }, { id: 'raid', text: 'Survive a raid', check: () => since('sq_ripley', 'raidsDone') >= 1 }], reward: { xp: 110, items: [{ name: 'Riot Helmet', qty: 1 }, { name: 'Riot Vest', qty: 1 }, { name: 'Tag Card 5', qty: 1 }] }, perk: s => { s.skills.guard += 1; } },
  'Sam Oduya': { id: 'sq_sam', title: 'Parts and Pieces', intro: 'I can fix a truck if you can find me the bits. Twelve scrap and three metal plate. A truck is just a road you carry with you.', hint: 'Bring him twelve Scrap and three Metal plate.',
    steps: [{ id: 'scrap', text: 'Give Sam twelve Scrap', give: { name: 'Scrap', qty: 12 } }, { id: 'plate', text: 'Give Sam three Metal plate', give: { name: 'Metal plate', qty: 3 } }], reward: { xp: 70, items: [{ name: 'Revolver', qty: 1 }, { name: 'Tag Card 6', qty: 1 }] }, perk: s => { s.skills.haul += 1; } },
  'Lena Fischer': { id: 'sq_lena', title: 'Field Clinic', intro: 'Give me a clinic and bandages and I will be useful. I would also like to stop stitching myself up.', hint: 'Build a Clinic and bring her three Bandages.',
    steps: [{ id: 'clinic', text: 'Build a Clinic', check: () => hasStruct('clinic') }, { id: 'give', text: 'Give Lena three Bandages', give: { name: 'Bandage', qty: 3 } }], reward: { xp: 90, items: [{ name: 'Medkit', qty: 2 }, { name: 'Tag Card 7', qty: 1 }] }, perk: s => { s.skills.guard += 1; state.unlocked.add('medicine'); } },
  'Boone Keller': { id: 'sq_boone', title: 'Dead Man\u2019s Ledger', intro: 'There is a Husk walking out there that I think I used to know. Put it down and bring me ten rounds. I will not ask you to do the rest.', hint: 'Defeat a Husk and bring him ten Pistol rounds.',
    steps: [{ id: 'husk', text: 'Defeat a Husk', check: () => since('sq_boone', 'k:husk') >= 1 }, { id: 'give', text: 'Give Boone ten Pistol rounds', give: { name: 'Pistol rounds', qty: 10 } }], reward: { xp: 100, items: [{ name: 'Scrap SMG', qty: 1 }, { name: 'Tag Card 8', qty: 1 }] }, perk: s => { s.skills.guard += 1; } },
  'Priya Nair': { id: 'sq_priya', title: 'Dead Air', intro: 'The broadcast is not a signal. It is a recording. Get me scrap and two plates so I can build a receiver, then take me to the tower. In spirit. Go and stand under it.', hint: 'Bring her six Scrap and two Metal plate, then stand at the Ash Tower.',
    steps: [{ id: 'scrap', text: 'Give Priya six Scrap', give: { name: 'Scrap', qty: 6 } }, { id: 'plate', text: 'Give Priya two Metal plate', give: { name: 'Metal plate', qty: 2 } }, { id: 'tower', text: 'Stand under the Ash Tower', check: nearSite('bunker', 7), target: siteTarget('bunker') }], reward: { xp: 120, items: [{ name: 'Geiger Band', qty: 1 }, { name: 'Tag Card 9', qty: 1 }] }, perk: s => { s.skills.haul += 1; } },
  'Juno Park': { id: 'sq_juno', title: 'Something Warm', intro: 'Did you eat? Cook three proper meals, and bring me a stew. Any stew. I want to see if you remember how.', hint: 'Cook three meals, then give her a Veg Stew, Fish Stew or Meat Stew.',
    steps: [{ id: 'cook', text: 'Cook three meals', check: () => since('sq_juno', 'cooked') >= 3 }, { id: 'give', text: 'Give Juno a stew', give: { any: ['Veg Stew', 'Fish Stew', 'Meat Stew'], qty: 1 } }], reward: { xp: 70, items: [{ name: 'Padded Jacket', qty: 1 }, { name: 'Wild Honey', qty: 2 }, { name: 'Tag Card 10', qty: 1 }] }, perk: s => { s.skills.farm += 1; } }
};
const TAG_CARDS = [
  'Marta Voss. Seed keeper. The case was labelled in your hand: \u201cNot for eating. Not yet.\u201d She never opened it, and she thinks that was a mistake.',
  'Dex Harlan. Quarry foreman. The raiders did not come until the radio started. He counted nine voices on the first night, and ten the next.',
  'Wren Alvarez. Scout. She woke first, by three weeks, and found a mark on every ruin door: an eleven, scratched with something sharp. She did not scratch them.',
  'Tomas. Beekeeper. Not a soldier, not a scientist. Someone put him on the list because the programme needed bees. He asks who decided that, and whether you remember.',
  'Ripley Cho. Bunker engineer. She says the bunker under the tower was built from plans with your signature on them. She asks you not to take that as an accusation.',
  'Sam Oduya. Driver. He remembers a delivery manifest with eleven names and a twelfth line crossed out in thick black ink.',
  'Lena Fischer. Medic. The sleepers were not frozen. They were kept under, and woken one by one. She wants to know why the last one was kept under longest.',
  'Boone Keller. Security. His orders were to watch Unit 11. He fell asleep on watch, or someone made him. He wants you to know he never meant to lose you.',
  'Priya Nair. Radio. The voice reading the call sign on the tape is one she has heard in person. She will not say whose.',
  'Juno Park. The youngest. She cooked for the wake group and remembers a table set for eleven. One place was never touched. It was always yours.'
];
TAG_CARDS.forEach((t, i) => { const n = 'Tag Card ' + (i + 1); DOCS[n] = { title: 'Tag ' + (i + 1), text: t }; STORY_ITEMS.add(n); ITEM_COL[n] = '#c8a040'; ITEM_DESC[n] = 'Readable. Open your bag and right-click it.'; });
function since(qid, key) { const qs = state.quests[qid]; return (state.cnt[key] || 0) - (((qs && qs.base) || {})[key] || 0); }
for (const [nm, q] of Object.entries(SURV_QUESTS)) QUEST_DEFS.push({ id: q.id, title: q.title, giver: nm, desc: BIO2[nm], steps: q.steps.map(s => ({ id: s.id, text: s.text, check: s.give ? (() => !!state.qflags['give:' + q.id + ':' + s.id]) : s.check, target: s.target })), reward: q.reward, next: [] });
{ const o = startQuest; startQuest = function (id) { o(id); const qs = state.quests[id]; if (qs) qs.base = Object.assign({}, state.cnt); }; }
{ const o = tryCraft; tryCraft = function (r) { const before = state.cnt.cooked || 0; const inv = JSON.stringify(state.player.inventory.map(s => s && s.qty)); o(r); if (r.cat === 'Cooking' && JSON.stringify(state.player.inventory.map(s => s && s.qty)) !== inv) state.cnt.cooked = before + 1; }; }
{ const o = questTick; questTick = function () {
  o();
  for (const [nm, q] of Object.entries(SURV_QUESTS)) {
    const qs = state.quests[q.id];
    if (qs && qs.status === 'done' && !state.qflags['perk:' + q.id]) {
      state.qflags['perk:' + q.id] = true;
      const s = settlers.find(x => x.name === nm) || survivors.find(x => x.name === nm);
      if (s) { q.perk(s); toast(nm.split(' ')[0] + ' feels more capable. Their story is in your bag.', 5); } else q.perk({ skills: { farm: 0, guard: 0, haul: 0 } });
    }
  }
}; }
function startSurvQuest(n, q) { startQuest(q.id); state.pinned = q.id; state.talkLine = q.intro; }
let talkTickT = 0;
{ const o = drawTalk; drawTalk = function (w, h) {
  o(w, h);
  if (performance.now() - talkTickT > 300) { talkTickT = performance.now(); questTick(); }
  const n = state.talk;
  if (!n || (n.kind !== 'settler' && n.kind !== 'survivor') || n.scared) return;
  const q = SURV_QUESTS[n.name]; if (!q) return;
  const pw = 600, ph = 184, px = Math.round(w / 2 - pw / 2), py = h - ph - 70, by = py + ph - 34 - 30, qs = state.quests[q.id];
  if (n.kind === 'survivor' && !n.wounded) return;
  if (!qs) button(px + 12, by, 200, 22, 'Ask about their past', () => startSurvQuest(n, q), true);
  else if (qs.status === 'active') {
    const step = q.steps.find(s => s.give && !qs.done[s.id] && !state.qflags['give:' + q.id + ':' + s.id]);
    if (step) {
      const g = step.give, nm = g.any ? (g.any.find(a => countItem(a) >= g.qty) || g.any[0]) : g.name, have = countItem(nm) >= g.qty;
      button(px + 12, by, 260, 22, 'Hand over ' + g.qty + ' ' + nm, () => { if (countItem(nm) < g.qty) { state.talkLine = 'You are short. ' + q.hint; return; } takeItems({ [nm]: g.qty }); questEvent('give:' + q.id + ':' + step.id); sfx('pickup'); state.talkLine = 'Thank you. That helps.'; }, have);
    } else { ctx.font = '10px ' + MONO; ctx.fillStyle = '#d6a84a'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(q.hint, px + 12, by + 11); }
  } else { ctx.font = '10px ' + MONO; ctx.fillStyle = '#7fbf7f'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('Their story is told. Read their tag card in your bag.', px + 12, by + 11); }
}; }
let biosApplied = false;
function applyBios() {
  if (biosApplied) return; biosApplied = true;
  for (const n of survivors.concat(settlers)) if (BIO2[n.name]) n.bio = BIO2[n.name];
}
{ const o = updateStorm; updateStorm = function (dt) { o(dt); applyBios(); }; }
{ const o = loadGame; loadGame = function () { const r = o(); biosApplied = false; return r; }; }
Object.assign(DBG, { questEvent, questTick, startQuest, SURV_QUESTS, RAID_KINDS, explodeSapper, specialAI, since, startSurvQuest, BIO2, TAG_CARDS, ENEMY_TYPES, WEAPONS, ARMOUR, RECIPES, pickRaid, varySpawns });
