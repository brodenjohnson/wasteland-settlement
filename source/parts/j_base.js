/* =====================================================================
   BASE BUILDING AND SETTLERS
   Walls, gates, storage, bunk beds, lamps and guard posts. Survivors you can recruit.
   ===================================================================== */
const settlers = [], survivors = [];
const claimed = new Map();
const badUntil = new Map();
const JOBS = ['Idle', 'Farmer', 'Guard', 'Hauler'];
const LIGHT_R = { forge: 45, lamp: 62, guardpost: 36 };
Object.assign(STRUCT_HP, { wall: 110, scrapwall: 220, gate: 130, chest: 90, bunk: 90, guardpost: 240, lamp: 40 });
Object.assign(STATION_NAMES, { wall: 'Wooden Wall', scrapwall: 'Scrap Wall', gate: 'Gate', chest: 'Storage Chest', bunk: 'Bunk Bed', guardpost: 'Guard Post', lamp: 'Lamp' });
RECIPES.push(
  { id: 'wall', cat: 'Build', name: 'Wooden Wall', station: null, place: 'wall', repeat: true, cost: { 'Wood': 3 }, unlock: null },
  { id: 'scrapwall', cat: 'Build', name: 'Scrap Wall', station: 'workbench', place: 'scrapwall', repeat: true, cost: { 'Scrap': 4, 'Wood': 1 }, unlock: null },
  { id: 'gate', cat: 'Build', name: 'Gate', station: 'workbench', place: 'gate', repeat: true, cost: { 'Wood': 6, 'Scrap': 4 }, unlock: null },
  { id: 'chest', cat: 'Build', name: 'Storage Chest', station: null, place: 'chest', cost: { 'Wood': 12, 'Scrap': 4 }, unlock: null },
  { id: 'bunk', cat: 'Build', name: 'Bunk Bed', station: null, place: 'bunk', cost: { 'Wood': 8, 'Cloth': 4 }, unlock: null },
  { id: 'guardpost', cat: 'Build', name: 'Guard Post', station: 'workbench', place: 'guardpost', cost: { 'Wood': 10, 'Scrap': 12, 'Stone': 4 }, unlock: null },
  { id: 'lamp', cat: 'Build', name: 'Lamp', station: null, place: 'lamp', repeat: true, cost: { 'Scrap': 2, 'Wood': 1 }, unlock: null }
);
function newStruct(type) {
  const s = { type, hp: STRUCT_HP[type] };
  if (type === 'chest') s.slots = new Array(27).fill(null);
  if (type === 'bunk') s.owner = null;
  return s;
}

/* solidAt and collides now know about gates: friendly walkers pass through, enemies do not */
function solidAt(tx, ty, friendly) {
  if (tx < 0 || ty < 0 || tx >= W || ty >= H) return true;
  const i = ty * W + tx, t = tiles[i];
  if (t === T.WATER || t === T.SPRING || t === T.RUBBLE || t === T.CLIFF || objs[i] !== O.NONE) return true;
  const st = structs.get(i);
  if (st) return !(friendly && st.type === 'gate');
  return false;
}
function collides(x, y, s, friendly) {
  const h = s / 2;
  const x0 = Math.floor((x - h) / TS), x1 = Math.floor((x + h - 0.001) / TS);
  const y0 = Math.floor((y - h) / TS), y1 = Math.floor((y + h - 0.001) / TS);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (solidAt(tx, ty, friendly)) return true;
  return false;
}

/* ---------- Structure art ---------- */
function paintWallW(c) {
  for (let x = 0; x < 16; x += 4) {
    const top = 5 + ((x >> 2) % 2) * 2;
    R(c, '#6b4a2b', x, top + 2, 4, 24 - top - 2); R(c, '#8a6238', x, top + 2, 1, 24 - top - 2); R(c, '#4a3320', x + 3, top + 2, 1, 24 - top - 2);
    R(c, '#6b4a2b', x + 1, top, 2, 3); R(c, '#a07848', x + 1, top, 1, 1);
  }
  R(c, '#3b2a1c', 0, 13, 16, 2); R(c, '#3b2a1c', 0, 19, 16, 2); R(c, '#8a8d94', 1, 13, 1, 1); R(c, '#8a8d94', 14, 19, 1, 1);
}
function paintWallS(c) {
  R(c, '#6e7178', 0, 6, 16, 18); R(c, '#8a8d94', 0, 6, 16, 3);
  for (let x = 0; x < 16; x += 3) { R(c, '#a9acb3', x, 9, 1, 15); R(c, '#5a5d64', x + 2, 9, 1, 15); }
  R(c, '#a8532a', 2, 14, 4, 3); R(c, '#c4703a', 2, 14, 2, 1); R(c, '#a8532a', 10, 18, 3, 4); R(c, '#3e4046', 0, 22, 16, 2);
  R(c, '#2a2a30', 0, 3, 16, 1); for (let x = 1; x < 16; x += 4) { R(c, '#2a2a30', x, 2, 1, 2); R(c, '#c9c9cf', x, 2, 1, 1); }
}
function paintGate(c) {
  R(c, '#3b2a1c', 0, 4, 3, 20); R(c, '#3b2a1c', 13, 4, 3, 20); R(c, '#4a3320', 0, 3, 16, 3);
  R(c, '#7a5a30', 3, 7, 5, 17); R(c, '#7a5a30', 8, 7, 5, 17); R(c, '#9a7440', 3, 7, 5, 1); R(c, '#9a7440', 8, 7, 5, 1);
  R(c, '#2a2a30', 3, 11, 10, 1); R(c, '#2a2a30', 3, 18, 10, 1); R(c, '#8a8d94', 7, 14, 2, 3); R(c, '#d6a84a', 7, 15, 2, 1);
}
function paintChest(c) {
  R(c, '#3a2816', 1, 12, 14, 3); R(c, '#7a5a30', 1, 6, 14, 8); R(c, '#9a7440', 1, 6, 14, 3); R(c, '#b08a50', 2, 6, 5, 1);
  R(c, '#3b2a1c', 1, 9, 14, 1); R(c, '#8a8d94', 2, 6, 2, 8); R(c, '#8a8d94', 12, 6, 2, 8); R(c, '#d6a84a', 7, 8, 2, 3); R(c, '#14120f', 8, 9, 1, 1);
}
function paintBunk(c) {
  R(c, '#4a3320', 0, 2, 2, 16); R(c, '#4a3320', 14, 2, 2, 16); R(c, '#6b4a2b', 0, 2, 16, 2);
  R(c, '#6b4a2b', 1, 8, 14, 2); R(c, '#7a8a9a', 2, 4, 12, 4); R(c, '#e8e0d0', 2, 4, 4, 3);
  R(c, '#6b4a2b', 1, 14, 14, 2); R(c, '#9a4a3a', 2, 10, 12, 4); R(c, '#e8e0d0', 2, 10, 4, 3); R(c, '#3a2816', 0, 17, 16, 1);
}
function paintGuard(c) {
  R(c, '#3b2a1c', 1, 22, 3, 18); R(c, '#3b2a1c', 12, 22, 3, 18); R(c, '#4a3320', 3, 28, 10, 2); R(c, '#4a3320', 3, 34, 10, 2);
  R(c, '#6b4a2b', 0, 16, 16, 7); R(c, '#9a7440', 0, 16, 16, 2); R(c, '#4a3320', 0, 21, 16, 2);
  R(c, '#3b2a1c', 1, 7, 2, 10); R(c, '#3b2a1c', 13, 7, 2, 10); R(c, '#8a2a22', 0, 3, 16, 5); R(c, '#b03a30', 0, 3, 16, 2); R(c, '#6a1a14', 0, 7, 16, 1);
  R(c, '#14120f', 4, 10, 8, 5); R(c, '#d6a84a', 6, 12, 2, 1); R(c, '#4a3320', 7, 0, 1, 4); R(c, '#c0392b', 8, 0, 4, 2);
}
function paintLamp(c) {
  R(c, '#2a2a30', 7, 10, 2, 18); R(c, '#4a4a54', 7, 10, 1, 18); R(c, '#2a2a30', 5, 26, 6, 2);
  R(c, '#3a3a42', 4, 4, 8, 7); R(c, '#ffd36b', 5, 5, 6, 5); R(c, '#fff2b0', 6, 6, 3, 3); R(c, '#2a2a30', 3, 3, 10, 2);
}
Object.assign(STRUCT_SPR, {
  wall: { h: 24, paint: paintWallW }, scrapwall: { h: 24, paint: paintWallS }, gate: { h: 24, paint: paintGate },
  chest: { h: 16, paint: paintChest }, bunk: { h: 20, paint: paintBunk }, guardpost: { h: 40, paint: paintGuard }, lamp: { h: 28, paint: paintLamp }
});
function drawStruct(st, tx, ty) {
  const spec = STRUCT_SPR[st.type];
  if (!spec) return;
  shadowAt(tx * TS + 8, ty * TS + 14, 14);
  ctx.drawImage(structSprite(st.type), tx * TS - 1, ty * TS - (spec.h - 16) - 1);
  if (st.type === 'forge') {
    const fl = Math.floor(state.elapsed * 6) % 3;
    ctx.fillStyle = '#f26f21'; ctx.fillRect(tx * TS + 5, ty * TS + 3 - fl + 7, 6, 5 + fl);
    ctx.fillStyle = '#ffd36b'; ctx.fillRect(tx * TS + 7, ty * TS + 5 - fl + 7, 2, 3 + fl);
  }
  if (st.type === 'lamp' || st.type === 'guardpost') {
    const cy = st.type === 'lamp' ? ty * TS - 8 : ty * TS - 18;
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(tx * TS + 8, cy, 0, tx * TS + 8, cy, 22);
    g.addColorStop(0, 'rgba(255,200,100,' + (0.26 + 0.05 * Math.sin(state.elapsed * 5 + tx)) + ')'); g.addColorStop(1, 'rgba(255,170,60,0)');
    ctx.fillStyle = g; ctx.fillRect(tx * TS - 14, cy - 22, 44, 44);
    ctx.globalCompositeOperation = 'source-over';
  }
  if (st.hp !== undefined && st.hp < STRUCT_HP[st.type]) {
    const x = tx * TS + 2, y = ty * TS - (spec.h - 16) - 3;
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(x - 1, y - 1, 14, 4);
    ctx.fillStyle = '#e8503a'; ctx.fillRect(x, y, Math.max(0, 12 * st.hp / STRUCT_HP[st.type]), 2);
  }
}

/* ---------- Storage helpers ---------- */
function addToArr(arr, name, qty) {
  const max = ITEM_STACK[name] || CONFIG.inventory.stackSize;
  for (let i = 0; i < arr.length; i++) { const s = arr[i]; if (s && s.name === name && s.qty < max) { const n = Math.min(max - s.qty, qty); s.qty += n; qty -= n; if (!qty) return 0; } }
  for (let i = 0; i < arr.length && qty > 0; i++) if (!arr[i]) { const n = Math.min(max, qty); arr[i] = { name, qty: n }; qty -= n; }
  return qty;
}
function chestList() { const out = []; for (const [i, st] of structs) if (st.type === 'chest') out.push({ i, st }); return out; }
function storeItem(name, qty) {
  for (const c of chestList()) { qty = addToArr(c.st.slots, name, qty); if (!qty) return 0; }
  return qty;
}
function chestCount(name) { let n = 0; for (const c of chestList()) for (const s of c.st.slots) if (s && s.name === name) n += s.qty; return n; }
function chestTake(name, qty) {
  let got = 0;
  for (const c of chestList()) for (let k = 0; k < c.st.slots.length && got < qty; k++) {
    const s = c.st.slots[k];
    if (s && s.name === name) { const n = Math.min(s.qty, qty - got); s.qty -= n; got += n; if (s.qty <= 0) c.st.slots[k] = null; }
  }
  return got;
}
function chestFood() { for (const n of ['Canned food', 'Potato', 'Tomato', 'Radish', 'Berries']) if (chestCount(n) > 0) return n; return null; }
function chestSlotClick(chest, i, btn) {
  const arr = chest.slots, s = arr[i], cur = state.cursor;
  if (btn === 2) { if (s) { const left = addItem(s.name, s.qty); if (left < s.qty) { s.qty = left; if (s.qty <= 0) arr[i] = null; } } return; }
  if (!cur) { if (s) { state.cursor = s; arr[i] = null; } return; }
  if (!s) { arr[i] = cur; state.cursor = null; return; }
  if (s.name === cur.name && stackMax(s.name) > 1) { const n = Math.min(stackMax(s.name) - s.qty, cur.qty); s.qty += n; cur.qty -= n; if (cur.qty <= 0) state.cursor = null; return; }
  arr[i] = cur; state.cursor = s;
}
function quickStore(i) {
  const ch = state.structs_open_chest ? null : null;
  const st = structs.get(state.chestOpen);
  if (!st || !st.slots) return;
  const s = state.player.inventory[i];
  if (!s) return;
  const left = addToArr(st.slots, s.name, s.qty);
  if (left < s.qty) { s.qty = left; if (s.qty <= 0) state.player.inventory[i] = null; }
}
function deconstruct(i) {
  const st = structs.get(i);
  if (!st) return;
  const r = RECIPES.find(q => q.place === st.type);
  const cx = ((i % W) + 0.5) * TS, cy = (Math.floor(i / W) + 0.5) * TS;
  if (r) for (const k of Object.keys(r.cost)) { const q = Math.floor(r.cost[k] * 0.6); if (q > 0) state.drops.push({ x: cx + (Math.random() - 0.5) * 8, y: cy + 4, name: k, qty: q, t: 0 }); }
  if (st.slots) for (const s of st.slots) if (s) state.drops.push({ x: cx + (Math.random() - 0.5) * 10, y: cy + 5, name: s.name, qty: s.qty, t: 0 });
  if (st.type === 'bunk' && st.owner !== null) { const s = settlers.find(q => q.id === st.owner); if (s) s.bed = null; }
  structs.delete(i);
  if (state.chestOpen === i) { state.chestOpen = null; }
  burst(cx, cy, '#8a6a4a', 8);
  toast('Deconstructed ' + STATION_NAMES[st.type] + '. Some materials dropped.', 2.5);
}

/* ---------- Survivors you can find and recruit ---------- */
const SURVIVOR_DEFS = [
  { name: 'Marta Voss', ruin: 'outpost', bio: 'Ran the greenhouse at the old valley co-op until the roof came down. Still carries a packet of seeds in her pocket.', skills: { farm: 3, guard: 0, haul: 1 } },
  { name: 'Dex Harlan', ruin: 'shed', n: 0, bio: 'Quarry foreman. Knows every rock in the Scrapyard and holds a grudge against every raider in it.', skills: { farm: 0, guard: 2, haul: 3 } },
  { name: 'Wren Alvarez', ruin: 'cabin', bio: 'Scavenger who grew up in the pines. Quiet, quick, and good at not being seen.', skills: { farm: 1, guard: 1, haul: 3 } },
  { name: 'Old Tomas', ruin: 'hut', n: 0, bio: 'Kept bees before the bombs. Insists the bees survived somewhere. Grows a mean tomato.', skills: { farm: 2, guard: 0, haul: 1 } },
  { name: 'Ripley Cho', ruin: 'bunker', bio: 'Former soldier holed up in the ash bunker. Hasn\u2019t slept properly in a year.', skills: { farm: 0, guard: 3, haul: 1 } },
  { name: 'Sam Oduya', ruin: 'shed', n: 1, bio: 'Mechanic. Can fix almost anything, as long as someone else carries the parts.', skills: { farm: 0, guard: 1, haul: 3 } },
  { name: 'Lena Fischer', ruin: 'house', n: 0, bio: 'Used to cook for a whole street. Misses salt more than people.', skills: { farm: 2, guard: 0, haul: 2 } },
  { name: 'Boone Keller', ruin: 'house', n: 1, bio: 'Trapper from the forest edge. Steady hands, steady aim, few words.', skills: { farm: 0, guard: 2, haul: 1 } },
  { name: 'Priya Nair', ruin: 'shack', n: 0, bio: 'Nurse who patched people up in the marsh until the water turned. Calm in a crisis.', skills: { farm: 1, guard: 1, haul: 2 } },
  { name: 'Juno Park', ruin: 'hut', n: 1, bio: 'Courier who ran supplies between the ruins. Knows the roads better than anyone alive.', skills: { farm: 0, guard: 1, haul: 3 } }
];
const SKIN = ['#e8bc90', '#c99a72', '#a8764e', '#7a5238'], HAIR = ['#2a1d14', '#5a3a28', '#8a6a3a', '#c8c0b0', '#14120f', '#a8502a'];
const TOPS = ['#4a6a8a', '#8a4a4a', '#5a7a4a', '#8a7a3a', '#6a4a7a', '#4a7a7a', '#7a5a3a'];
function npcLook(seed) {
  const r = k => hash2(seed, k, 700 + k);
  return { skin: SKIN[Math.floor(r(1) * SKIN.length)], hair: HAIR[Math.floor(r(2) * HAIR.length)], body: TOPS[Math.floor(r(3) * TOPS.length)], legs: ['#3a3a44', '#4a3a2a', '#2f3a2f'][Math.floor(r(4) * 3)], accent: ['#c0392b', '#d6a84a', '#5a9ad6'][Math.floor(r(5) * 3)] };
}
function makeSurvivors() {
  survivors.length = 0; settlers.length = 0;
  const used = {};
  SURVIVOR_DEFS.forEach((d, idx) => {
    const list = ruins.filter(r => r.kind === d.ruin);
    const r = list[Math.min(list.length - 1, d.n || 0)] || list[0];
    if (!r) return;
    for (let t = 0; t < 120; t++) {
      const x = r.x0 + 1 + Math.floor(hash2(idx, t, 801) * (r.w - 2)), y = r.y0 + 1 + Math.floor(hash2(t, idx, 802) * (r.h - 2));
      if (tiles[y * W + x] === T.FLOOR && !objs[y * W + x] && !used[y * W + x]) {
        used[y * W + x] = 1;
        survivors.push({ id: 100 + idx, name: d.name, bio: d.bio, skills: d.skills, look: npcLook(idx + 3), x: (x + 0.5) * TS, y: (y + 0.5) * TS, home: { x: (x + 0.5) * TS, y: (y + 0.5) * TS }, wander: 0, wx: 0, wy: 0, dirx: 1, walkT: 0, scared: false, kind: 'survivor' });
        break;
      }
    }
  });
}
function bestJob(sk) { return sk.farm >= sk.guard && sk.farm >= sk.haul ? 'Farmer' : sk.guard >= sk.haul ? 'Guard' : 'Hauler'; }
function freeBed() { for (const [i, st] of structs) if (st.type === 'bunk' && st.owner === null) return { i, st }; return null; }
function bedCount() { let n = 0; for (const [, st] of structs) if (st.type === 'bunk') n++; return n; }
function recruit(npc) {
  const bed = freeBed();
  if (!bed) { toast('No free bed. Build a Bunk Bed (C, Build tab) first.', 3.5); return false; }
  const ix = survivors.indexOf(npc); if (ix >= 0) survivors.splice(ix, 1);
  const hp = 50 + 10 * npc.skills.guard;
  const s = { id: npc.id, name: npc.name, bio: npc.bio, skills: npc.skills, look: npc.look, x: npc.x, y: npc.y, dirx: npc.dirx, walkT: 0, hunger: 80, health: hp, maxHealth: hp, job: bestJob(npc.skills), bed: bed.i, state: 'follow', task: null, path: null, pathT: 0, cd: 0, flash: 0, workT: 0, kind: 'settler', say: null, sayT: 0, wander: 0, wx: npc.x, wy: npc.y, starveT: 0 };
  bed.st.owner = s.id;
  settlers.push(s);
  toast(npc.name + ' joins your settlement as a ' + s.job.toLowerCase() + '.', 4);
  return true;
}
function dismissSettler(s) {
  const ix = settlers.indexOf(s); if (ix < 0) return;
  settlers.splice(ix, 1);
  if (s.bed !== null && structs.get(s.bed)) structs.get(s.bed).owner = null;
  for (const [i, id] of claimed) if (id === s.id) claimed.delete(i);
  s.kind = 'survivor'; s.home = { x: s.x, y: s.y };
  toast(s.name + ' leaves.', 3);
}
function hurtSettler(s, dmg) {
  s.health -= dmg; s.flash = 0.15;
  state.floats.push({ x: s.x, y: s.y - 20, text: '-' + Math.round(dmg), color: '#ff9a6a', life: 0.8 });
  if (s.health <= 0) {
    const ix = settlers.indexOf(s); if (ix >= 0) settlers.splice(ix, 1);
    if (s.bed !== null && structs.get(s.bed)) structs.get(s.bed).owner = null;
    for (const [i, id] of claimed) if (id === s.id) claimed.delete(i);
    toast(s.name + ' was killed.', 4);
    burst(s.x, s.y - 6, '#a83a30', 12);
    if (state.talk === s) state.talk = null;
  }
}
function npcReply(npc, topic) {
  if (npc.kind === 'survivor') {
    if (topic === 'bio') return npc.bio;
    if (topic === 'skills') return 'I can ' + [npc.skills.farm ? 'grow things (' + npc.skills.farm + '/3)' : '', npc.skills.guard ? 'hold a line (' + npc.skills.guard + '/3)' : '', npc.skills.haul ? 'haul and scavenge (' + npc.skills.haul + '/3)' : ''].filter(Boolean).join(', ') + '.';
    return 'Who\u2019s there? ...You\u2019re not one of them. Do you have somewhere safe?';
  }
  if (topic === 'bio') return npc.bio;
  if (topic === 'status') {
    if (npc.hunger < 30) return 'I\u2019m starving. Is there any food in the chests?';
    if (npc.health < npc.maxHealth * 0.5) return 'I\u2019m hurt, but I\u2019ll cope.';
    return npc.job === 'Idle' ? 'Give me something to do and I\u2019ll do it.' : 'All good. Busy with my ' + npc.job.toLowerCase() + ' work.';
  }
  return 'Hey, boss.';
}

/* ---------- Settler AI ---------- */
function nearestFoe(x, y, r) {
  let best = null, bd = r;
  for (const e of enemies) { if (e.hidden) continue; const d = Math.hypot(e.x - x, e.y - y); if (d < bd) { bd = d; best = e; } }
  return best;
}
function settlerGo(s, gx, gy, dt, speed) {
  const dx = gx - s.x, dy = gy - s.y, d = Math.hypot(dx, dy);
  if (d < 5) return true;
  let wx = gx, wy = gy;
  if (!lineClear(s.x, s.y, gx, gy, true)) {
    s.pathT -= dt;
    if (!s.path || s.pathT <= 0) { s.path = findPath(s.x, s.y, gx, gy, 5000, true); s.pathT = 1; }
    if (s.path && s.path.length) { while (s.path.length > 1 && Math.hypot(s.path[0][0] - s.x, s.path[0][1] - s.y) < 6) s.path.shift(); wx = s.path[0][0]; wy = s.path[0][1]; }
  } else s.path = null;
  const ex = wx - s.x, ey = wy - s.y, el = Math.hypot(ex, ey) || 1, mv = Math.min(speed * dt, d);
  const nx = ex / el * mv, ny = ey / el * mv;
  if (!collides(s.x + nx, s.y, 10, true)) s.x += nx;
  if (!collides(s.x, s.y + ny, 10, true)) s.y += ny;
  if (Math.abs(nx) > 0.01) s.dirx = nx > 0 ? 1 : -1;
  s.walkT += dt;
  return false;
}
function claim(i, s) { claimed.set(i, s.id); }
function claimedByOther(i, s) { const id = claimed.get(i); return id !== undefined && id !== s.id; }
function adjacentSpot(i) {
  const tx = i % W, ty = Math.floor(i / W);
  const opts = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  return [(tx + 0.5) * TS + 0, (ty + 0.5) * TS + 12];
}
function updateSettlers(dt) {
  const p = state.player, gh = dt * (1440 / CONFIG.time.dayLengthSec) * effMult() / 60;
  const dk = darkness(clockHour());
  for (const s of settlers.slice()) {
    s.flash = Math.max(0, s.flash - dt); s.cd = Math.max(0, s.cd - dt); s.sayT = Math.max(0, s.sayT - dt);
    s.hunger = Math.max(0, s.hunger - 1.5 * gh);
    if (s.hunger <= 0) { s.starveT += dt; if (s.starveT > 3) { hurtSettler(s, 2); s.starveT = 0; } }
    else if (s.health < s.maxHealth && s.hunger > 25) s.health = Math.min(s.maxHealth, s.health + 0.5 * dt);
    if (settlers.indexOf(s) < 0) continue;
    if (state.talk === s) continue;
    const foe = nearestFoe(s.x, s.y, 190);
    // newly recruited: follow you home
    if (s.state === 'follow') {
      if (Math.hypot(s.x - BASE.x * TS, s.y - BASE.y * TS) < 21 * TS) { s.state = 'home'; }
      else { const d = Math.hypot(p.x - s.x, p.y - s.y); if (d > 34) settlerGo(s, p.x, p.y, dt, 56); continue; }
    }
    // guards fight
    if (s.job === 'Guard' && foe) {
      const d = Math.hypot(foe.x - s.x, foe.y - s.y);
      const gun = s.skills.guard >= 2 && chestCount('Pistol rounds') > 0;
      if (gun && d < 130 && d > 40 && s.cd <= 0 && lineClear(s.x, s.y, foe.x, foe.y, true)) {
        chestTake('Pistol rounds', 1);
        const a = Math.atan2(foe.y - s.y, foe.x - s.x);
        state.projs.push({ x: s.x, y: s.y - 8, vx: Math.cos(a) * 230, vy: Math.sin(a) * 230, dmg: 14 + 4 * s.skills.guard, life: 0.7, hostile: false, from: s.name });
        s.cd = 1.1; s.dirx = Math.cos(a) >= 0 ? 1 : -1;
      } else if (d > 16) settlerGo(s, foe.x, foe.y, dt, 54);
      else if (s.cd <= 0) { damageEnemy(foe, 9 + 4 * s.skills.guard, (foe.x - s.x) / (d || 1), (foe.y - s.y) / (d || 1), 120); s.cd = 0.9; }
      continue;
    }
    if (s.job !== 'Guard' && foe && Math.hypot(foe.x - s.x, foe.y - s.y) < 100) {
      const bed = s.bed !== null ? structs.get(s.bed) : null;
      const tx = s.bed !== null ? ((s.bed % W) + 0.5) * TS : BASE.x * TS, ty = s.bed !== null ? (Math.floor(s.bed / W) + 0.5) * TS + 10 : BASE.y * TS;
      settlerGo(s, tx, ty, dt, 64); continue;
    }
    // hungry: raid the chest
    if (s.hunger < 40) {
      const food = chestFood();
      if (food) {
        const c = chestList()[0];
        const gx = ((c.i % W) + 0.5) * TS, gy = (Math.floor(c.i / W) + 0.5) * TS + 12;
        if (settlerGo(s, gx, gy, dt, 46)) { const got = chestTake(food, 1); if (got) { const u = ITEM_USE[food]; s.hunger = Math.min(100, s.hunger + Math.max(20, (u.food || 10) * 1.6)); s.say = 'Thanks for the food.'; s.sayT = 2; } }
        continue;
      }
    }
    // night: go to bed
    if (dk > 0.7 && s.bed !== null && structs.get(s.bed)) {
      const gx = ((s.bed % W) + 0.5) * TS, gy = (Math.floor(s.bed / W) + 0.5) * TS + 12;
      settlerGo(s, gx, gy, dt, 40); continue;
    }
    if (s.job === 'Farmer') { farmerTick(s, dt); continue; }
    if (s.job === 'Hauler') { haulerTick(s, dt); continue; }
    if (s.job === 'Guard') { guardIdle(s, dt); continue; }
    idleWander(s, dt);
  }
}
function idleWander(s, dt) {
  s.wander -= dt;
  if (s.wander <= 0) { s.wander = 2 + Math.random() * 4; const a = Math.random() * 6.283, r = 18 + Math.random() * 70; s.wx = BASE.x * TS + Math.cos(a) * r + 28; s.wy = BASE.y * TS + Math.sin(a) * r * 0.8; if (solidAt(Math.floor(s.wx / TS), Math.floor(s.wy / TS), true)) { s.wx = s.x; s.wy = s.y; } }
  settlerGo(s, s.wx, s.wy, dt, 26);
}
function guardIdle(s, dt) {
  let post = null, bd = 1e9;
  for (const [i, st] of structs) if (st.type === 'guardpost') { const d = Math.hypot(((i % W) + 0.5) * TS - s.x, (Math.floor(i / W) + 0.5) * TS - s.y); if (d < bd) { bd = d; post = i; } }
  if (post !== null) { settlerGo(s, ((post % W) + 0.5) * TS + (s.id % 2 ? 14 : -14), (Math.floor(post / W) + 0.5) * TS + 14, dt, 36); }
  else { const gx = BASE.x * TS + (s.id % 2 ? 25 : 0) * TS, gy = BASE.y * TS + (s.id % 2 ? 0 : -25) * TS; settlerGo(s, gx - 20, gy + 20, dt, 36); }
}
function farmerTick(s, dt) {
  if (!s.task) {
    let best = null, bd = 1e9;
    for (const [i, c] of crops) {
      if (claimedByOther(i, s) || (badUntil.get(i) || 0) > state.elapsed) continue;
      const ripe = cropRipe(c), kind = ripe ? 'harvest' : (!wet[i] ? 'water' : null);
      if (!kind) continue;
      const d = Math.hypot(((i % W) + 0.5) * TS - s.x, (Math.floor(i / W) + 0.5) * TS - s.y) - (ripe ? 120 : 0);
      if (d < bd) { bd = d; best = { kind, i }; }
    }
    if (!best && chestList().length) {
      const seed = Object.keys(CROPS).find(k => chestCount(k) > 0);
      if (seed) {
        for (let i = 0; i < W * H && !best; i++) if (tilled[i] && !crops.has(i) && !objs[i] && !structs.has(i) && !claimedByOther(i, s) && (badUntil.get(i) || 0) > state.elapsed === false) best = { kind: 'plant', i, seed };
      }
    }
    if (best) { s.task = best; s.workT = 0; s.taskT = 0; claim(best.i, s); } else { idleWander(s, dt); return; }
  }
  const t = s.task, [gx, gy] = adjacentSpot(t.i), tcx = ((t.i % W) + 0.5) * TS, tcy = (Math.floor(t.i / W) + 0.5) * TS;
  s.taskT = (s.taskT || 0) + dt;
  if (s.taskT > 25) { claimed.delete(t.i); badUntil.set(t.i, state.elapsed + 90); s.task = null; s.taskT = 0; return; }
  if (Math.hypot(s.x - tcx, s.y - tcy) > 24 && !settlerGo(s, gx, gy, dt, 40)) return;
  s.workT += dt;
  if (s.workT < 1.1 - 0.15 * s.skills.farm) return;
  const c = crops.get(t.i);
  if (t.kind === 'water' && c && !wet[t.i]) { wet[t.i] = 1; burst(((t.i % W) + 0.5) * TS, (Math.floor(t.i / W) + 0.5) * TS, '#7ac8ff', 5); }
  else if (t.kind === 'harvest' && c && cropRipe(c)) {
    const def = CROPS[c.seed], seeds = 1 + (Math.random() < 0.5 ? 1 : 0);
    if (chestList().length) { storeItem(def.produce, 1); storeItem(c.seed, seeds); }
    else { state.drops.push({ x: s.x, y: s.y, name: def.produce, qty: 1, t: 0 }); }
    if (def.regrow) c.age = def.days - def.regrow; else crops.delete(t.i);
    state.floats.push({ x: s.x, y: s.y - 20, text: '+1 ' + def.produce, color: '#ffd36b', life: 1.2 });
  } else if (t.kind === 'plant' && !c && chestTake(t.seed, 1)) { crops.set(t.i, { seed: t.seed, age: 0 }); burst(((t.i % W) + 0.5) * TS, (Math.floor(t.i / W) + 0.5) * TS, '#6b9046', 4); }
  claimed.delete(t.i); s.task = null; s.workT = 0;
}
const HAUL_KINDS = new Set([O.TREE, O.ROCK, O.SCRAP, O.BUSH, O.PINE]);
function haulerTick(s, dt) {
  if (!chestList().length) { idleWander(s, dt); return; }
  if (!s.task) {
    let best = null, bd = 1e9;
    for (let y = BASE.y - 22; y <= BASE.y + 22; y++) for (let x = BASE.x - 22; x <= BASE.x + 22; x++) {
      if (x < 1 || y < 1 || x >= W - 1 || y >= H - 1) continue;
      const i = y * W + x;
      if (!HAUL_KINDS.has(objs[i]) || claimedByOther(i, s) || zoneMap[i] !== 1 || (badUntil.get(i) || 0) > state.elapsed) continue;
      const d = Math.hypot((x + 0.5) * TS - s.x, (y + 0.5) * TS - s.y);
      if (d < bd) { bd = d; best = i; }
    }
    if (best === null) { idleWander(s, dt); return; }
    s.task = { kind: 'haul', i: best }; s.workT = 0; s.taskT = 0; claim(best, s);
  }
  const t = s.task;
  if (!HAUL_KINDS.has(objs[t.i])) { claimed.delete(t.i); s.task = null; return; }
  const [gx, gy] = adjacentSpot(t.i), tcx = ((t.i % W) + 0.5) * TS, tcy = (Math.floor(t.i / W) + 0.5) * TS;
  s.taskT = (s.taskT || 0) + dt;
  if (s.taskT > 25) { claimed.delete(t.i); badUntil.set(t.i, state.elapsed + 90); s.task = null; s.taskT = 0; return; }
  if (Math.hypot(s.x - tcx, s.y - tcy) > 24 && !settlerGo(s, gx, gy, dt, 40)) return;
  s.workT += dt;
  if (Math.random() < dt * 5) burst(((t.i % W) + 0.5) * TS, (Math.floor(t.i / W) + 0.5) * TS, RES[objs[t.i]].color, 1);
  if (s.workT < 8 - 1.0 * s.skills.haul) return;
  const res = RES[objs[t.i]], qty = res.yield[0] + Math.floor(Math.random() * (res.yield[1] - res.yield[0] + 1));
  objs[t.i] = O.NONE; state.damage.delete(t.i);
  storeItem(res.item, qty);
  state.floats.push({ x: s.x, y: s.y - 20, text: '+' + qty + ' ' + res.item, color: '#ffd36b', life: 1.2 });
  claimed.delete(t.i); s.task = null; s.workT = 0;
}

/* Survivors wander a little and get scared when monsters are close */
function updateSurvivors(dt) {
  for (const n of survivors) {
    n.scared = !!nearestFoe(n.x, n.y, 130);
    n.wander -= dt;
    if (n.wander <= 0) { n.wander = 2 + Math.random() * 3; const a = Math.random() * 6.283; n.wx = n.home.x + Math.cos(a) * 12; n.wy = n.home.y + Math.sin(a) * 8; }
    const d = Math.hypot(n.wx - n.x, n.wy - n.y);
    if (d > 3 && !n.scared) { const nx = (n.wx - n.x) / d * 12 * dt, ny = (n.wy - n.y) / d * 12 * dt; if (!collides(n.x + nx, n.y + ny, 10, true)) { n.x += nx; n.y += ny; n.walkT += dt; if (Math.abs(nx) > 0.01) n.dirx = nx > 0 ? 1 : -1; } }
  }
}

/* ---------- Enemies now also go after settlers ---------- */
function updateEnemies(dt) {
  const p = state.player;
  const playerSafe = (radMap[Math.floor(p.y / TS) * W + Math.floor(p.x / TS)] || 0) <= -0.9;
  for (const e of enemies.slice()) {
    const d = ENEMY_TYPES[e.type];
    let dpx = p.x - e.x, dpy = (p.y - 3) - e.y, dist = Math.hypot(dpx, dpy);
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
    // pick the nearest living target: you or a settler
    let tgt = { x: p.x, y: p.y - 3, settler: null, dist };
    for (const s of settlers) { const sd = Math.hypot(s.x - e.x, (s.y - 3) - e.y); if (sd < tgt.dist - 8 && sd < d.aggro + 20) tgt = { x: s.x, y: s.y - 3, settler: s, dist: sd }; }
    const sees = tgt.dist < d.aggro && !state.sleeping;
    let goalX = null, goalY = null, struct = null, chasing = false;
    const tSafe = tgt.settler ? false : playerSafe;
    if (e.raid) {
      if (sees) { goalX = tgt.x; goalY = tgt.y; chasing = true; }
      else {
        struct = nearestStruct(e.x, e.y);
        if (struct) { goalX = struct.x; goalY = struct.y; } else { goalX = p.x; goalY = p.y - 3; chasing = true; tgt = { x: p.x, y: p.y - 3, settler: null, dist }; }
      }
    } else if (e.ambush) { goalX = tgt.x; goalY = tgt.y; chasing = true; }
    else if (sees && !tSafe && homeDist < 260) { goalX = tgt.x; goalY = tgt.y; chasing = true; }
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
      const tdx = tgt.x - e.x, tdy = tgt.y - e.y, tdl = Math.hypot(tdx, tdy) || 1;
      if (!d.ranged && realGl <= d.size / 2 + 12 && e.cd <= 0) {
        if (tgt.settler) hurtSettler(tgt.settler, d.dmg); else hurtPlayer(d.dmg, d.name, tdx / tdl, tdy / tdl);
        e.cd = d.atkCd; e.lunge = 0.2;
      } else if (d.ranged && realGl < d.aggro && e.cd <= 0 && lineClear(e.x, e.y, tgt.x, tgt.y)) {
        const a = Math.atan2(tdy, tdx) + (Math.random() - 0.5) * 0.2;
        state.projs.push({ x: e.x, y: e.y - 4, vx: Math.cos(a) * 130, vy: Math.sin(a) * 130, dmg: d.dmg, life: 1.6, hostile: true, from: d.name });
        e.cd = d.atkCd; e.lunge = 0.12;
      }
    } else if (struct && realGl <= 17 && e.cd <= 0) { hurtStruct(struct.i, d.dmg); e.cd = d.atkCd; e.lunge = 0.2; }
  }
}

/* ---------- Picking things under the mouse: now includes people and chests ---------- */
function getTarget() {
  const tx = Math.floor(state.mwx / TS), ty = Math.floor(state.mwy / TS);
  const p = state.player;
  for (const n of survivors.concat(settlers)) {
    if (Math.hypot(state.mwx - n.x, state.mwy - (n.y - 10)) < 12) {
      const dist = Math.hypot(n.x - p.x, n.y - p.y);
      return { tx: Math.floor(n.x / TS), ty: Math.floor(n.y / TS), i: -1, dist, inReach: dist <= 44, canHarvest: true, tier: 0, kind: 0, res: { name: n.name, talk: true, npc: n, item: '', minTier: 0, tool: 'axe' } };
    }
  }
  if (tx < 0 || ty < 0 || tx >= W || ty >= H) return null;
  const i = ty * W + tx;
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
  if (st && st.type === 'chest') return { ...base, kind: 0, res: { name: 'Storage Chest', item: '', chest: true, minTier: 0, tool: 'axe' } };
  const cr = crops.get(i);
  if (cr && cropRipe(cr)) return { ...base, kind: 0, res: { name: CROPS[cr.seed].produce + ' (ripe)', item: CROPS[cr.seed].produce, crop: true, minTier: 0, tool: 'axe' } };
  return null;
}
function openTalk(npc) { closePanels(); state.talk = npc; state.talkLine = npcReply(npc, 'hello'); }
function openChest(i) { closePanels(); state.invOpen = true; state.chestOpen = i; }
function doTargetAction(t) {
  const res = t.res, sel = selItem(), isCan = sel && sel.name === 'Watering Can';
  if (res.talk) { openTalk(res.npc); state.actCd = 0.5; mouse.down = false; return; }
  if (res.chest) { openChest(t.i); state.actCd = 0.5; mouse.down = false; return; }
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
function newStructPlace(type) { return newStruct(type); }

/* ---------- Drawing people ---------- */
function npcSprite(n, frame) {
  const o = { legs: n.look.legs, body: n.look.body, skin: n.look.skin, eye: '#20160f', hair: n.look.hair, accent: n.look.accent };
  return makeSprite('N|' + n.id + '|' + frame, 22, 31, c => paintHuman2(c, frame, o));
}
function drawNpc(n) {
  const frame = Math.floor(n.walkT * 6) % 2;
  let spr = npcSprite(n, frame);
  if (n.flash > 0) spr = whiteSprite('N|' + n.id + '|' + frame, spr);
  const bottom = n.y + 7;
  shadowAt(n.x, bottom - 1, 14);
  drawFlipped(spr, n.x, bottom, n.dirx < 0);
  const top = bottom - 33;
  if (n.kind === 'survivor') {
    ctx.fillStyle = n.scared ? '#ff7a6a' : '#ffd36b'; ctx.font = '12px ' + MONO; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(n.scared ? '!' : '?', Math.round(n.x), Math.round(top - 2 + Math.sin(state.elapsed * 4)));
  } else {
    const icon = n.job === 'Farmer' ? 'Hoe' : n.job === 'Guard' ? 'Rusty Pipe' : n.job === 'Hauler' ? 'Scrap' : null;
    if (icon) drawIcon(icon, Math.round(n.x - 4), Math.round(top - 6), 8);
    if (n.health < n.maxHealth) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(Math.round(n.x) - 8, Math.round(top - 2), 16, 4);
      ctx.fillStyle = '#6fd26a'; ctx.fillRect(Math.round(n.x) - 7, Math.round(top - 1), 14 * n.health / n.maxHealth, 2);
    }
    if (n.sayT > 0 && n.say) {
      ctx.font = '5px ' + MONO; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const tw = ctx.measureText(n.say).width + 6;
      ctx.fillStyle = '#ebe9df'; ctx.fillRect(Math.round(n.x - tw / 2), Math.round(top - 14), tw, 7);
      ctx.fillStyle = '#34343c'; ctx.fillText(n.say, Math.round(n.x), Math.round(top - 10));
    }
  }
  if (Math.hypot(state.mwx - n.x, state.mwy - (n.y - 10)) < 12) {
    ctx.font = '5px ' + MONO; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const tw = ctx.measureText(n.name).width + 6;
    ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(Math.round(n.x - tw / 2), Math.round(top - 12), tw, 7);
    ctx.fillStyle = '#ffe9b0'; ctx.fillText(n.name, Math.round(n.x), Math.round(top - 8));
  }
}

/* ---------- Panels: talking, the settler list, the chest ---------- */
function wrapText(text, maxW) {
  const words = text.split(' '), lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur);
  return lines;
}
function button(x, y, w, h, label, fn, on) {
  const over = mouse.x >= x && mouse.x < x + w && mouse.y >= y && mouse.y < y + h;
  ctx.fillStyle = on ? 'rgba(127,255,127,0.2)' : over ? 'rgba(255,211,107,0.22)' : 'rgba(255,255,255,0.07)'; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = on ? 'rgba(127,255,127,0.7)' : over ? '#ffd36b' : 'rgba(233,226,212,0.3)'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  ctx.font = '10px ' + MONO; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff6e4'; ctx.fillText(label, x + w / 2, y + h / 2 + 0.5);
  state.uiRects.push({ x, y, w, h, fn });
}
function drawTalk(w, h) {
  const n = state.talk;
  if (!n) return;
  const pw = 560, ph = 178, px = Math.round(w / 2 - pw / 2), py = h - ph - 70;
  panel(px, py, pw, ph, 0.96);
  ctx.fillStyle = '#2a1a22'; ctx.fillRect(px + 12, py + 12, 72, 72);
  const spr = npcSprite(n, 0);
  ctx.drawImage(spr, 3, 1, 18, 18, px + 14, py + 14, 68, 68);
  ctx.strokeStyle = '#2a1018'; ctx.strokeRect(px + 12.5, py + 12.5, 71, 71);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.font = '14px ' + MONO; ctx.fillStyle = '#ffe9b0'; ctx.fillText(n.name, px + 98, py + 22);
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#b8a890';
  const sk = n.skills;
  ctx.fillText((n.kind === 'settler' ? 'Settler, ' + n.job.toLowerCase() : 'Survivor') + '   Farm ' + sk.farm + '  Guard ' + sk.guard + '  Haul ' + sk.haul, px + 98, py + 40);
  ctx.font = '12px ' + MONO; ctx.fillStyle = '#e8dcc0';
  wrapText(state.talkLine || '', pw - 114).slice(0, 4).forEach((l, k) => ctx.fillText(l, px + 98, py + 62 + k * 16));
  const by = py + ph - 34;
  if (n.kind === 'survivor') {
    if (n.scared) { ctx.fillStyle = '#ff9a8a'; ctx.font = '11px ' + MONO; ctx.fillText('They are too frightened to talk. Clear the monsters nearby first.', px + 98, by - 8); }
    else {
      button(px + 12, by, 120, 24, 'Who are you?', () => { state.talkLine = npcReply(n, 'bio'); });
      button(px + 138, by, 120, 24, 'What can you do?', () => { state.talkLine = npcReply(n, 'skills'); });
      const free = freeBed();
      button(px + 264, by, 170, 24, free ? 'Join my settlement' : 'Join (needs a free bed)', () => { if (recruit(n)) state.talk = null; }, !!free);
    }
    button(px + pw - 100, by, 88, 24, 'Leave', () => { state.talk = null; });
  } else {
    button(px + 12, by, 110, 24, 'How are you?', () => { state.talkLine = npcReply(n, 'status'); });
    button(px + 128, by, 100, 24, 'Backstory', () => { state.talkLine = npcReply(n, 'bio'); });
    button(px + 234, by, 150, 24, 'Job: ' + n.job + ' (change)', () => { n.job = JOBS[(JOBS.indexOf(n.job) + 1) % JOBS.length]; n.task = null; state.talkLine = 'Okay. ' + (n.job === 'Idle' ? 'Taking it easy.' : n.job + ' it is.'); });
    button(px + 390, by, 70, 24, 'Dismiss', () => { dismissSettler(n); state.talk = null; });
    button(px + pw - 100, by, 88, 24, 'Leave', () => { state.talk = null; });
  }
}
function drawSettlersPanel(w, h) {
  const pw = 520, rowH = 54, rows = Math.max(1, settlers.length), ph = 70 + rows * rowH;
  const px = Math.round(w / 2 - pw / 2), py = Math.max(8, Math.round(h / 2 - ph / 2));
  panel(px, py, pw, ph, 0.96);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = '12px ' + MONO; ctx.fillStyle = '#e9e2d4';
  ctx.fillText('Settlers   ' + settlers.length + ' of ' + bedCount() + ' beds   Chests ' + chestList().length, px + 14, py + 20);
  if (!settlers.length) { ctx.font = '11px ' + MONO; ctx.fillStyle = '#b9b09d'; ctx.fillText('No settlers yet. Find survivors in ruins (they show a ? above their heads).', px + 14, py + 50); }
  settlers.forEach((s, k) => {
    const y = py + 38 + k * rowH, x = px + 10;
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(x, y, pw - 20, rowH - 6);
    ctx.drawImage(npcSprite(s, 0), 3, 1, 18, 18, x + 4, y + 4, 40, 40);
    ctx.font = '12px ' + MONO; ctx.fillStyle = '#ffe9b0'; ctx.textAlign = 'left'; ctx.fillText(s.name, x + 52, y + 12);
    ctx.font = '10px ' + MONO; ctx.fillStyle = '#b8a890'; ctx.fillText(s.task ? 'Working: ' + s.task.kind : s.state === 'follow' ? 'Following you home' : 'Idle', x + 52, y + 27);
    bar(x + 52, y + 33, 80, 'HP', s.health / s.maxHealth * 100, '#c0392b', '');
    bar(x + 138, y + 33, 80, 'Fed', s.hunger, '#f26f21', '');
    button(x + 270, y + 8, 130, 24, 'Job: ' + s.job, () => { s.job = JOBS[(JOBS.indexOf(s.job) + 1) % JOBS.length]; s.task = null; });
    button(x + 406, y + 8, 84, 24, 'Dismiss', () => dismissSettler(s));
  });
}
function drawChestPanel(w, h) {
  const st = structs.get(state.chestOpen);
  if (!st || !st.slots) { state.chestOpen = null; return; }
  const cols = 9, cell = 40, pad = 14, pw = pad * 2 + 112 + cols * cell + 6, ph = 168;
  const ipy = Math.max(8, Math.round(h / 2 - 326 / 2)) + 100;
  const px = Math.round(w / 2 - pw / 2), py = ipy - ph - 8;
  panel(px, py, pw, ph, 0.95);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = '12px ' + MONO; ctx.fillStyle = '#e9e2d4';
  ctx.fillText('Storage chest', px + pad, py + 18);
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#b9b09d'; ctx.fillText('Settlers eat food from here, farmers and haulers fill it. Right-click a bag item to store it.', px + pad + 100, py + 18);
  const gx = px + pad + 112 - 100, gy = py + 30;
  let hover = null, hx = 0, hy = 0;
  for (let i = 0; i < st.slots.length; i++) {
    const r = Math.floor(i / cols), c = i % cols, x = gx + c * cell + 100, y = gy + r * cell;
    const it = st.slots[i], over = mouse.x >= x && mouse.x < x + cell - 4 && mouse.y >= y && mouse.y < y + cell - 4;
    slotFrame(x, y, cell - 4, it, false, over);
    if (over && it) { hover = it; hx = x; hy = y; }
    if (it) {
      drawIcon(it.name, x + 4, y + 4, 28, it);
      if (it.qty > 1) { ctx.font = '10px ' + MONO; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillStyle = '#000'; ctx.fillText(String(it.qty), x + cell - 4, y + cell - 4); ctx.fillStyle = '#fff'; ctx.fillText(String(it.qty), x + cell - 5, y + cell - 5); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; }
    }
    state.uiRects.push({ x, y, w: cell - 4, h: cell - 4, fn: btn => chestSlotClick(st, i, btn) });
  }
  if (hover && !state.cursor) drawTooltip(hover, hx + 44, hy - 6, w);
}

