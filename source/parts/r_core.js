/* =====================================================================
   CORE 8: energy and stamina, structure kits, plumbing, settlers that carry
   ===================================================================== */
Object.assign(state.player, { energy: 100, stamina: 100 });
Object.assign(state, { exhausted: false, sprinting: false, staminaDelay: 0, faint: null, reading: null, intro: null, kitSlot: null, kitHold: -1, kitArmed: false, kitJustPlaced: false, lastSel: 0, tiredWarn: 0 });

/* ---------- Rest and stamina ---------- */
function maxStamina() { return 60 + 0.4 * state.player.energy; }
function moveMult() { const p = state.player; return (state.sprinting ? 1.6 : 1) * (p.energy < 20 ? 0.9 : 1) * (state.exhausted ? 0.85 : 1); }
function updateVitals(dt) {
  const p = state.player, gh = dt * (1440 / CONFIG.time.dayLengthSec) * effMult() / 60;
  if (state.sleeping) p.energy = Math.min(100, p.energy + 14 * gh);
  else p.energy = Math.max(0, p.energy - 3 * gh * settings.drain);
  if (state.faint) {
    state.faint.t -= dt;
    if (state.faint.t <= 0) { state.faint = null; p.energy = 20; toast('You come to. Your head is pounding.', 3.5); }
  } else if (p.energy <= 0 && !state.sleeping) { state.faint = { t: 7 }; state.sprinting = false; toast('You collapse from exhaustion.', 3); }
  if (p.energy > 35) state.tiredWarn = 0;
  else if (p.energy <= 30 && state.tiredWarn < 1) { state.tiredWarn = 1; toast('You are getting tired. Sleep at your bedroll tonight.', 4); }
  else if (p.energy <= 12 && state.tiredWarn < 2) { state.tiredWarn = 2; toast('You can barely keep your eyes open.', 4); }
  const want = keys['shift'] && p.moving && !state.exhausted && p.stamina > 0 && !state.faint && !state.sleeping;
  state.sprinting = !!want;
  const maxS = maxStamina();
  if (state.sprinting) {
    p.stamina = Math.max(0, p.stamina - 22 * (1 - 0.02 * (skillLevel('exploring') - 1)) * dt); state.staminaDelay = 0.7;
    if (p.stamina <= 0) { state.exhausted = true; toast('Out of breath.', 1.5); }
  } else { state.staminaDelay = Math.max(0, state.staminaDelay - dt); if (!state.staminaDelay) p.stamina = Math.min(maxS, p.stamina + (p.moving ? 12 : 22) * dt); }
  if (p.stamina > maxS) p.stamina = maxS;
  if (state.exhausted && p.stamina >= 30) state.exhausted = false;
  updateKit(); updateStory(dt);
}
{ const o = updateSurvival; updateSurvival = function (dt) { o(dt); updateVitals(dt); }; }
{ const o = updatePlayer; updatePlayer = function (dt) { if (state.faint) { state.player.moving = false; return; } o(dt); }; }
{ const o = updateActions; updateActions = function (dt) { if (state.faint) return; o(dt); }; }
{ const o = die; die = function (r) { o(r); const p = state.player; p.energy = Math.max(p.energy, 60); p.stamina = 100; state.faint = null; state.exhausted = false; }; }
{ const o = loadGame; loadGame = function () {
  const ok = o(); if (!ok) return ok;
  try { const d = JSON.parse(localStorage.getItem(SAVE_KEY)); state.player.energy = d.player.energy == null ? 100 : d.player.energy; } catch (e) { state.player.energy = 100; }
  state.player.stamina = maxStamina(); state.faint = null; state.exhausted = false; return ok;
}; }
function drawFatigue() {
  const p = state.player, W2 = canvas.width, H2 = canvas.height;
  if (state.faint) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(0,0,0,' + Math.min(0.92, 0.5 + state.faint.t * 0.1) + ')'; ctx.fillRect(0, 0, W2, H2);
    ctx.fillStyle = '#c8b8a0'; ctx.font = (14 * dpr) + 'px ' + MONO; ctx.textAlign = 'center'; ctx.fillText('z z z', W2 / 2, H2 / 2); return;
  }
  if (p.energy >= 35 || state.sleeping) return;
  const t = (35 - p.energy) / 35, lid = t * 0.3 * (0.55 + 0.45 * Math.sin(state.elapsed * 0.9));
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = 'rgba(6,4,12,' + (0.85 * Math.max(0, lid) / 0.3 * 0.7) + ')';
  ctx.fillRect(0, 0, W2, H2 * lid); ctx.fillRect(0, H2 * (1 - lid), W2, H2 * lid);
}
{ const o = drawLowHealth; drawLowHealth = function () { o(); drawFatigue(); }; }

/* ---------- Structure kits: craft at a bench, build anywhere ---------- */
const KIT_BY_NAME = {};
RECIPES.filter(r => r.place).forEach(r => { const nm = 'Kit: ' + r.name; KIT_BY_NAME[nm] = r; ITEM_COL[nm] = '#c8a062'; ITEM_DESC[nm] = 'A packed up ' + r.name + '. Put it on the hotbar, then click to build it anywhere. No station needed.'; });
{ const o = isHotbarable; isHotbarable = function (n) { return /^Kit: /.test(n) || o(n); }; }
{ const o = iconKind; iconKind = function (n) { return /^Kit: /.test(n) ? 'kit' : (typeof DOCS !== 'undefined' && DOCS[n]) ? 'doc' : n === 'Brass Tag' ? 'tag' : o(n); }; }
function craftKit(r) {
  const st = recipeStatus(r);
  if (!st.ok) { toast(st.why + '.', 2); return; }
  const nm = 'Kit: ' + r.name, mult = r.layer ? 4 : 1, cost = {};
  for (const k of Object.keys(r.cost)) cost[k] = r.cost[k] * mult;
  if (!canAfford(cost)) { toast('Missing materials for ' + mult + '.', 2); return; }
  if (!spaceFor(nm, mult)) { toast('Bag full.', 2); return; }
  takeItems(cost); addItem(nm, mult); sfx('craft');
  skillXp('crafting', 1 + (r.tier || 1)); questEvent('kit:' + r.id);
  state.floats.push({ x: state.player.x, y: state.player.y - 14, text: 'Packed ' + (mult > 1 ? mult + ' ' : '') + 'kit: ' + r.name, color: '#7fff7f', life: 1.4 });
}
{ const o = drawCrafting; drawCrafting = function (w, h) {
  o(w, h);
  const list = RECIPES.filter(r => r.cat === CRAFT_TABS[state.craftTab]), sel = list.find(r => r.id === state.craftSel) || list[0];
  if (!sel || !sel.place) return;
  const listW = 540, pw = listW + 244 + 28, ph = 44 + 30 + 7 * 46 + 40, px = Math.round(w / 2 - pw / 2), py = Math.max(46, Math.round(h / 2 - ph / 2));
  button(px + listW + 16, py + ph - 106, 242, 24, recipeUnlocked(sel) ? 'Craft kit' + (sel.layer ? ' x4' : '') + ' (build it anywhere)' : 'Locked', () => craftKit(sel), false);
}; }
function updateKit() {
  if (state.sel !== state.lastSel) { state.lastSel = state.sel; state.kitHold = -1; }
  const s = selItem(), kit = s && KIT_BY_NAME[s.name];
  if (state.kitArmed && !state.placing && !state.moving) { if (state.kitJustPlaced) state.kitJustPlaced = false; else state.kitHold = state.sel; state.kitArmed = false; state.kitSlot = null; }
  if (kit && !anyMenuOpen() && !state.moving && !state.faint && state.kitHold !== state.sel) {
    if (state.placing !== kit.id) { state.placing = kit.id; state.kitSlot = state.sel; state.kitArmed = true; if (!state.placeRot) state.placeRot = 0; }
  } else if (state.kitArmed && state.placing && (!kit || state.kitSlot !== state.sel)) { state.placing = null; state.kitArmed = false; state.kitSlot = null; }
}
{ const o = tryPlace; tryPlace = function () {
  const r = placingRecipe();
  if (!r || state.kitSlot == null || state.moving) return o();
  const tx = Math.floor(state.mwx / TS), ty = Math.floor(state.mwy / TS), i = ty * W + tx;
  const b0 = structs.get(i), f0 = floors[i], r0 = roofs[i], saved = r.cost;
  r.cost = {}; o(); r.cost = saved;
  if (structs.get(i) !== b0 || floors[i] !== f0 || roofs[i] !== r0) {
    const slot = state.kitSlot, s = state.player.inventory[slot];
    if (s) { s.qty -= 1; if (s.qty <= 0) state.player.inventory[slot] = null; }
    state.kitJustPlaced = true;
    if (!state.player.inventory[slot]) { state.placing = null; state.kitSlot = null; state.kitArmed = false; state.kitJustPlaced = false; }
  }
}; }

/* ---------- Plumbing: pipe purified water from a purifier to a sink ---------- */
Object.assign(STRUCT_HP, { pipe: 40, sink: 80 });
Object.assign(STATION_NAMES, { pipe: 'Pipe', sink: 'Sink' });
NONSOLID.add('pipe');
RECIPES.push(
  { id: 'pipe', cat: 'Build', name: 'Pipe', station: null, place: 'pipe', repeat: true, cost: { 'Metal plate': 1, 'Scrap': 1 }, skill: ['crafting', 6], tier: 3, unlock: null },
  { id: 'sink', cat: 'Build', name: 'Sink', station: null, place: 'sink', cost: { 'Metal plate': 3, 'Scrap': 6, 'Stone': 4 }, skill: ['crafting', 6], tier: 3, unlock: null }
);
Object.assign(RECIPE_DESC, {
  pipe: 'Lay pipe from a purifier. Click and drag to run a line. Connects to sinks and other pipes.',
  sink: 'Fill bottles and watering cans, or drink, with purified water. Needs a pipe run back to a water purifier.'
});
['pipe', 'sink'].forEach(id => { const r = RECIPES.find(q => q.id === id); KIT_BY_NAME['Kit: ' + r.name] = r; ITEM_COL['Kit: ' + r.name] = '#c8a062'; ITEM_DESC['Kit: ' + r.name] = 'A packed up ' + r.name + '. Put it on the hotbar, then click to build it anywhere.'; if (TIER_LISTS[3]) TIER_LISTS[3].push(id); });
function pipeLike(j) { const s = structs.get(j); return s && (s.type === 'pipe' || s.type === 'purifier' || s.type === 'sink') ? 1 : 0; }
function pipeMask(tx, ty) { const i = ty * W + tx; return (tx > 0 && pipeLike(i - 1) ? 1 : 0) | (tx + 1 < W && pipeLike(i + 1) ? 2 : 0) | (ty + 1 < H && pipeLike(i + W) ? 4 : 0) | (ty > 0 && pipeLike(i - W) ? 8 : 0); }
function paintPipe(c, back, mask) {
  const L = mask & 1, Rr = mask & 2, D = mask & 4, U = mask & 8, horiz = L || Rr, vert = U || D;
  if (horiz || !vert) { const x0 = L ? 0 : 4, x1 = Rr ? 16 : 12; R(c, '#6c7682', x0, 6, x1 - x0, 4); R(c, '#9aa6b2', x0, 6, x1 - x0, 1); R(c, '#3d444c', x0, 9, x1 - x0, 1); }
  if (vert) { const y0 = U ? 0 : 4, y1 = D ? 16 : 12; R(c, '#6c7682', 6, y0, 4, y1 - y0); R(c, '#9aa6b2', 6, y0, 1, y1 - y0); R(c, '#3d444c', 9, y0, 1, y1 - y0); }
  if (horiz && vert) { R(c, '#8a96a2', 5, 5, 6, 6); R(c, '#aab4be', 5, 5, 6, 1); R(c, '#4a525a', 5, 10, 6, 1); }
  else if (!horiz && !vert) { R(c, '#8a96a2', 4, 5, 8, 6); R(c, '#4a525a', 4, 10, 8, 1); }
}
function paintSink(c) {
  R(c, '#4a3320', 1, 7, 14, 9); R(c, '#6b4a2b', 1, 7, 14, 2); R(c, '#3a2816', 7, 10, 1, 5); R(c, '#3a2816', 1, 15, 14, 1);
  R(c, '#d9dee3', 2, 5, 12, 4); R(c, '#aeb6bf', 2, 8, 12, 1); R(c, '#5a8fb8', 4, 6, 8, 2); R(c, '#8fc4e8', 5, 6, 3, 1);
  R(c, '#7a828c', 7, 2, 2, 4); R(c, '#9aa4ae', 7, 2, 4, 1); R(c, '#9aa4ae', 10, 2, 1, 2);
}
STRUCT_SPR.pipe = { h: 16, paint: paintPipe };
STRUCT_SPR.sink = { h: 16, paint: paintSink };
function sinkConnected(i) {
  const seen = new Set([i]), q = [i];
  while (q.length) {
    const c = q.pop(), s = structs.get(c);
    if (s && s.type === 'purifier') return true;
    for (const n of [c - 1, c + 1, c - W, c + W]) if (n >= 0 && n < W * H && !seen.has(n) && pipeLike(n)) { seen.add(n); q.push(n); }
  }
  return false;
}
{ const o = getTarget; getTarget = function () {
  const t = o(); if (t) return t;
  const tx = Math.floor(state.mwx / TS), ty = Math.floor(state.mwy / TS);
  if (tx < 0 || ty < 0 || tx >= W || ty >= H) return null;
  const i = ty * W + tx, st = structs.get(i);
  if (st && st.type === 'sink') { const p = state.player, dist = Math.hypot((tx + 0.5) * TS - p.x, (ty + 0.5) * TS - p.y); return { tx, ty, i, dist, inReach: dist <= CONFIG.player.reach, canHarvest: true, tier: 0, kind: 0, res: { name: 'Sink', item: 'water', purifier: true, sink: true, minTier: 0, tool: 'axe' } }; }
  return null;
}; }
{ const o = doTargetAction; doTargetAction = function (t) {
  if (t.res && t.res.sink && !sinkConnected(t.i)) { toast('This sink is not piped to a water purifier.', 2.5); state.actCd = 0.8; return; }
  o(t);
}; }

/* ---------- Settlers carry what they gather to the chest ---------- */
function carryTotal(s) { let n = 0; if (s.carry) for (const c of s.carry) n += c.qty; return n; }
function carryAdd(s, name, qty) { s.carry = s.carry || []; const c = s.carry.find(q => q.name === name); if (c) c.qty += qty; else s.carry.push({ name, qty }); }
function nearestChestTo(s) { let best = null, bd = 1e9; for (const c of chestList()) { const d = Math.hypot(((c.i % W) + 0.5) * TS - s.x, (Math.floor(c.i / W) + 0.5) * TS - s.y); if (d < bd) { bd = d; best = c; } } return best; }
function carryBusy(s, dt, cap) {
  const tot = carryTotal(s);
  if (!tot) { s.depositNow = false; s.carryT = 0; return false; }
  s.carryT = (s.carryT || 0) + dt;
  if (tot < cap && !s.depositNow && s.carryT < 20) return false;
  const ch = nearestChestTo(s);
  if (!ch) { for (const c of s.carry) state.drops.push({ x: s.x, y: s.y, name: c.name, qty: c.qty, t: 0 }); s.carry = []; s.depositNow = false; return false; }
  if (s.task && s.task.i !== undefined) claimed.delete(s.task.i);
  s.task = null; s.workT = 0;
  const [gx, gy] = adjacentSpot(ch.i), ccx = ((ch.i % W) + 0.5) * TS, ccy = (Math.floor(ch.i / W) + 0.5) * TS;
  if (Math.hypot(s.x - ccx, s.y - ccy) > 22 && !settlerGo(s, gx, gy, dt, 40)) return true;
  const stored = [];
  for (const c of s.carry) { const left = storeItem(c.name, c.qty); stored.push((c.qty - left) + ' ' + c.name); if (left) state.drops.push({ x: s.x, y: s.y + 6, name: c.name, qty: left, t: 0 }); }
  state.floats.push({ x: s.x, y: s.y - 22, text: 'Stored ' + stored.join(', '), color: '#9fe8ff', life: 1.6 });
  s.carry = []; s.depositNow = false; s.carryT = 0; return true;
}
{ const o = haulerTick; haulerTick = function (s, dt) { if (carryBusy(s, dt, 8)) return; o(s, dt); }; }
{ const o = farmerTick; farmerTick = function (s, dt) { if (carryBusy(s, dt, 6)) return; o(s, dt); }; }
{ const o = fisherTick; fisherTick = function (s, dt) { if (carryBusy(s, dt, 4)) return; o(s, dt); }; }
{ const o = idleWander; idleWander = function (s, dt) { if (carryTotal(s) > 0) { s.depositNow = true; return; } o(s, dt); }; }
{ const o = settlerStatus; settlerStatus = function (s) { const t = o(s); return carryTotal(s) > 0 ? t + '  (carrying ' + s.carry.map(c => c.qty + ' ' + c.name).join(', ') + ')' : t; }; }
{ const o = drawNpc; drawNpc = function (n) {
  o(n);
  if (n.kind === 'settler' && carryTotal(n) > 0) {
    const c = n.carry[0], top = n.y + 7 - 33;
    drawIcon(c.name, Math.round(n.x - 4), Math.round(top - 6), 8);
    ctx.font = '7px ' + MONO; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff6e4'; ctx.fillText(String(carryTotal(n)), Math.round(n.x + 5), Math.round(top - 2));
  }
}; }

