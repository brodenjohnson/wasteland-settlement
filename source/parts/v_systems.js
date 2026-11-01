/* =====================================================================
   V_SYSTEMS: food buffs, map markers and compass, settlement level
   ===================================================================== */
state.buffs = []; state.markers = []; state.settleLvl = 1;

/* ---------- Food that does something ---------- */
const BUFFS = {
  hearty: { name: 'Hearty', col: '#e8a04a', fx: { stamRegen: 0.3 }, text: '+30% stamina recovery' },
  warm: { name: 'Warm Belly', col: '#d8704a', fx: { restSave: 0.25 }, text: 'tire 25% slower' },
  rush: { name: 'Sugar Rush', col: '#d84a8a', fx: { sprint: 0.25, speed: 0.04 }, text: 'sprinting costs 25% less, +4% speed' },
  ward: { name: 'Rad Ward', col: '#9be870', fx: { radRes: 0.25 }, text: '+25% radiation resistance' },
  broth: { name: 'Iodine Broth', col: '#6ad0c8', fx: { radRes: 0.4, stamRegen: 0.15 }, text: '+40% radiation resistance, +15% stamina recovery' },
  strong: { name: 'Strong', col: '#e8503a', fx: { dmg: 0.12 }, text: '+12% damage' },
  mend: { name: 'Mending', col: '#7fe08a', fx: { regen: 0.8 }, text: 'heal slowly' },
  sweet: { name: 'Honeyed', col: '#e8c24a', fx: { stamRegen: 0.35, speed: 0.05 }, text: '+35% stamina recovery, +5% speed' }
};
const FOOD_BUFFS = {
  'Cooked Fish': [['hearty', 120]], 'Cooked Glowfish': [['ward', 90]], 'Baked Potato': [['warm', 150]], 'Berry Mash': [['rush', 120]],
  'Veg Stew': [['hearty', 240], ['warm', 240]], 'Fish Stew': [['broth', 300], ['hearty', 240]], 'Tomato Soup': [['ward', 180], ['mend', 120]],
  'Roast Meat': [['strong', 180]], 'Meat Stew': [['strong', 300], ['mend', 180]], 'Wild Honey': [['sweet', 240]]
};
Object.assign(ITEM_COL, { 'Raw Meat': '#b04a4a', 'Roast Meat': '#a8602f', 'Meat Stew': '#9a4a2a', 'Wild Honey': '#e8c24a' });
Object.assign(ITEM_USE, {
  'Raw Fish': { food: 8, rad: 5 }, 'Glowfish': { food: 8, rad: 12 }, 'Golden Carp': { food: 12, rad: 3 },
  'Raw Meat': { food: 14, rad: 8 }, 'Roast Meat': { food: 38, heal: 5 }, 'Meat Stew': { food: 80, heal: 14 }, 'Wild Honey': { food: 18 }
});
Object.assign(ITEM_DESC, { 'Raw Meat': 'Eat it raw and you will feel it later. Cook it.', 'Roast Meat': 'Seared over a fire. Strong and filling.', 'Meat Stew': 'Meat, potato and tomato. Properly hearty.', 'Wild Honey': 'The bees survived somewhere, after all.' });
ITEM_DESC['Raw Fish'] = 'A little food and a little radiation. Cook it.'; ITEM_DESC['Glowfish'] = 'Raw, it carries a lot of radiation. Cook it.';
for (const [n, list] of Object.entries(FOOD_BUFFS)) ITEM_DESC[n] = (ITEM_DESC[n] || '') + '  Buff: ' + list.map(([b, s]) => BUFFS[b].name + ' (' + BUFFS[b].text + ', ' + Math.round(s / 60 * 10) / 10 + ' min)').join('; ') + '.';
{ const r1 = rc('cook_meat', 'Cooking', 'Roast Meat', 'campfire', { 'Raw Meat': 1 }, { gives: { 'Roast Meat': 1 } }); r1.tier = 1;
  const r2 = rc('cook_meatstew', 'Cooking', 'Meat Stew', 'stove', { 'Raw Meat': 2, 'Potato': 1, 'Tomato': 1 }, { gives: { 'Meat Stew': 1 } }); r2.tier = 3; }
RECIPE_DESC.cook_meat = 'Sear raw meat over a fire. Much safer, and you get the Strong buff.'; RECIPE_DESC.cook_meatstew = 'Rich and filling. Strong and Mending for a good while.';
DROPS.glowrat.push({ n: 'Raw Meat', c: 0.3, a: 1, b: 1 }); DROPS.hound.push({ n: 'Raw Meat', c: 0.55, a: 1, b: 2 });
function buffFx(name) {
  let v = 0;
  state.buffs = state.buffs.filter(b => b.until > state.elapsed);
  for (const b of state.buffs) v += (BUFFS[b.id].fx[name] || 0);
  if (name === 'stamRegen' && state.player.equip.acc === 'Runner Wraps') v += 0.2;
  return v;
}
function addBuff(id, secs) {
  const b = state.buffs.find(q => q.id === id);
  if (b) b.until = Math.max(b.until, state.elapsed + secs); else state.buffs.push({ id, until: state.elapsed + secs });
}
{ const o = useItem; useItem = function (i) {
  const s = state.player.inventory[i], nm = s && s.name, q = s ? s.qty : 0;
  o(i);
  const s2 = state.player.inventory[i];
  if (nm && FOOD_BUFFS[nm] && (!s2 || s2.name !== nm || s2.qty < q)) {
    FOOD_BUFFS[nm].forEach(([b, secs]) => addBuff(b, secs));
    toast(FOOD_BUFFS[nm].map(([b]) => BUFFS[b].name).join(' and ') + '.', 2.5);
  }
}; }
{ const o = dmgScale; dmgScale = function () { return o() * (1 + buffFx('dmg')); }; }
{ const o = moveMult; moveMult = function () { return o() * (1 + buffFx('speed')); }; }
{ const o = updateSurvival; updateSurvival = function (dt) { o(dt); const rg = buffFx('regen'), p = state.player; if (rg && p.health < maxHealth() && !state.sleeping) p.health = Math.min(maxHealth(), p.health + rg * dt); }; }
function drawBuffChips(w, y) {
  state.buffs = state.buffs.filter(b => b.until > state.elapsed);
  ctx.textBaseline = 'middle';
  for (const b of state.buffs) {
    const def = BUFFS[b.id], left = Math.ceil(b.until - state.elapsed);
    panel(w - 190, y, 182, 18, 0.85);
    ctx.fillStyle = def.col; ctx.fillRect(w - 188, y + 3, 3, 12);
    ctx.textAlign = 'left'; ctx.font = '10px ' + MONO; ctx.fillStyle = '#ffe9b0'; ctx.fillText(def.name, w - 180, y + 9.5);
    ctx.textAlign = 'right'; ctx.fillStyle = '#b8a890'; ctx.fillText(Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0'), w - 16, y + 9.5);
    y += 21;
  }
  return y;
}

/* ---------- Markers, rumours and the compass ---------- */
const KIND_NAMES = { outpost: 'Old outpost', office: 'Derelict office', shed: 'Collapsed shed', cabin: 'Pine cabin', hut: 'Hermit hut', bunker: 'Sealed bunker', armoury: 'Armoury', house: 'Empty house', pump: 'Pump house', shack: 'Roadside shack' };
const MARK_COLS = ['#4aa8ff', '#e8c24a', '#e86aa8', '#7fe08a'];
function poiList() {
  const out = [];
  for (const r of ruins) out.push({ x: r.x0 + r.w / 2, y: r.y0 + r.h / 2, name: KIND_NAMES[r.kind] || 'Ruin' });
  for (const h of HOT_SPOTS) out.push({ x: h.x, y: h.y, name: 'Hot spot' });
  for (const o of OASES) out.push({ x: o.x, y: o.y, name: 'Clean spring' });
  return out;
}
function addRumour(poi) {
  const list = poiList().filter(p => !state.markers.some(m => m.poi && Math.hypot(m.poi.x - p.x, m.poi.y - p.y) < 3) && Math.hypot(p.x - state.player.x / TS, p.y - state.player.y / TS) > 18);
  if (poi && (!poi.name || poi.name === 'Something')) poi = poiList().find(p => Math.hypot(p.x - poi.x, p.y - poi.y) < 4) || { x: poi.x, y: poi.y, name: 'Something' };
  if (!poi) poi = list[Math.floor(Math.random() * list.length)];
  if (!poi) return false;
  state.markers.push({ id: ++markSeq, kind: 'rumour', tx: poi.x + (Math.random() - 0.5) * 7, ty: poi.y + (Math.random() - 0.5) * 7, label: '?', revealed: false, poi: { x: poi.x, y: poi.y, name: poi.name }, tracked: false });
  return true;
}
let markSeq = 0, markT = 0;
function updateMarkers(dt) {
  markT -= dt;
  if (markT > 0 || state.title) return;
  markT = 0.5;
  markSeq = Math.max(markSeq, ...state.markers.map(m => m.id), 0);
  if (state.qflags.storyInit && !state.qflags.rumoursInit) { state.qflags.rumoursInit = true; addRumour(); addRumour(); }
  const p = state.player;
  for (const m of state.markers) {
    if (m.kind !== 'rumour' || m.revealed) continue;
    if (Math.hypot(m.poi.x - p.x / TS, m.poi.y - p.y / TS) < 15) {
      m.revealed = true; m.tx = m.poi.x; m.ty = m.poi.y; m.label = m.poi.name;
      toast('Rumour confirmed: ' + m.poi.name + '.', 3.5); sfx('pickup'); skillXp('exploring', 4);
    }
  }
}
{ const o = newDayTick; newDayTick = function () { o(); if (state.markers.filter(m => m.kind === 'rumour' && !m.revealed).length < 4 && Math.random() < 0.6) addRumour(); }; }
function mapClick(px, py, S) {
  const mx = mouse.x - (px + 6), my = mouse.y - (py + 6);
  if (mx < 0 || my < 0 || mx > S || my > S) return;
  for (const m of state.markers) {
    if (Math.hypot(mx - m.tx / W * S, my - m.ty / H * S) < 8) {
      if (m.tracked && m.kind === 'mine') { state.markers.splice(state.markers.indexOf(m), 1); toast('Marker removed.', 1.5); }
      else { const on = !m.tracked; state.markers.forEach(q => { q.tracked = false; }); m.tracked = on; toast(on ? 'Tracking ' + m.label + '. See the compass.' : 'Stopped tracking.', 2); }
      return;
    }
  }
  if (state.markers.filter(m => m.kind === 'mine').length >= 12) { toast('That is plenty of markers. Remove one first.', 2); return; }
  state.markers.forEach(q => { q.tracked = false; });
  const n = state.markers.filter(m => m.kind === 'mine').length + 1;
  state.markers.push({ id: ++markSeq, kind: 'mine', tx: mx / S * W, ty: my / S * H, label: 'Marker ' + n, tracked: true });
  toast('Marker dropped and tracked. See the compass.', 2.5); sfx('place');
}
function drawMarkersBig(px, py, S) {
  state.uiRects.push({ x: px + 6, y: py + 6, w: S, h: S, fn: () => mapClick(px, py, S) });
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '10px ' + MONO;
  for (const m of state.markers) {
    const x = px + 6 + m.tx / W * S, y = py + 6 + m.ty / H * S;
    if (m.kind === 'rumour' && !m.revealed) {
      ctx.strokeStyle = m.tracked ? '#ffd36b' : 'rgba(255,211,107,0.7)'; ctx.setLineDash([2, 2]); ctx.beginPath(); ctx.arc(x, y, 8, 0, 6.283); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#ffd36b'; ctx.fillText('?', x, y + 0.5);
    } else {
      const col = m.kind === 'rumour' ? '#ffd36b' : MARK_COLS[m.id % 4];
      ctx.fillStyle = '#000'; ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x + 5, y); ctx.lineTo(x, y + 6); ctx.lineTo(x - 5, y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y - 5); ctx.lineTo(x + 4, y); ctx.lineTo(x, y + 5); ctx.lineTo(x - 4, y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#000'; ctx.fillText(m.label, x + 1, y + 13); ctx.fillStyle = '#fff6e4'; ctx.fillText(m.label, x, y + 12);
    }
    if (m.tracked) { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, 10 + Math.sin(state.elapsed * 4) * 1.5, 0, 6.283); ctx.stroke(); }
  }
}
function drawMarkersMini(mx, my, MS) {
  for (const m of state.markers) {
    const x = mx + m.tx / W * MS, y = my + m.ty / H * MS;
    ctx.fillStyle = m.kind === 'rumour' ? '#ffd36b' : MARK_COLS[m.id % 4];
    ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
    if (m.tracked) { ctx.strokeStyle = '#fff'; ctx.strokeRect(x - 3.5, y - 3.5, 7, 7); }
  }
}
function compassTarget() {
  const m = state.markers.find(q => q.tracked);
  if (m) return { x: (m.tx + 0.5) * TS, y: (m.ty + 0.5) * TS, label: m.label };
  if (typeof currentTarget === 'function') { const t = currentTarget(); if (t) return t; }
  return null;
}
function drawCompass(cx, cy) {
  const p = state.player, r = 15, t = compassTarget();
  ctx.fillStyle = 'rgba(20,12,18,0.88)'; ctx.beginPath(); ctx.arc(cx, cy, r + 2, 0, 6.283); ctx.fill();
  ctx.strokeStyle = 'rgba(233,226,212,0.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, r + 1.5, 0, 6.283); ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '8px ' + MONO; ctx.fillStyle = '#b8a890';
  ctx.fillText('N', cx, cy - r + 3); ctx.fillText('S', cx, cy + r - 2); ctx.fillText('E', cx + r - 3, cy + 0.5); ctx.fillText('W', cx - r + 3, cy + 0.5);
  if (t) {
    const a = Math.atan2(t.y - p.y, t.x - p.x), tracked = state.markers.some(q => q.tracked);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(a);
    ctx.fillStyle = tracked ? '#7fd0ff' : '#ffd36b'; ctx.beginPath(); ctx.moveTo(r - 4, 0); ctx.lineTo(-3, -3); ctx.lineTo(-1, 0); ctx.lineTo(-3, 3); ctx.closePath(); ctx.fill();
    ctx.restore();
    const d = Math.round(Math.hypot(t.x - p.x, t.y - p.y) / TS);
    ctx.font = '8px ' + MONO; ctx.fillStyle = '#e8dcc0'; ctx.fillText(d + ' tiles', cx, cy + r + 9);
  } else { ctx.fillStyle = '#6a5e50'; ctx.fillRect(cx - 1, cy - 1, 2, 2); }
}

/* ---------- Settlement level ---------- */
const SL_NAMES = ['Camp', 'Outpost', 'Hamlet', 'Settlement', 'Village', 'Town'], SL_STEPS = [0, 14, 34, 60, 95, 140];
const SL_REQ = { stove: 2, rug: 2, table: 2, chair: 2, banner: 2, pot: 2, stonewall: 2, trap: 2, bookshelf: 3, clinic: 3, turret: 3, anvil: 3, steelwall: 4, cook_meatstew: 3 };
let slCache = { t: -9, pts: 0 };
function settlementPoints() {
  if (state.elapsed - slCache.t < 1.5) return slCache.pts;
  let walls = 0, roofed = 0;
  for (const [, st] of structs) if (WALLTYPES.has(st.type)) walls++;
  for (let i = 0; i < roofs.length; i++) if (roofs[i]) roofed++;
  const sc = t => structCount([t]);
  const pts = settlers.length * 3 + bedCount() * 1.5 + Math.floor(walls / 6) + sc('gate') + sc('guardpost') * 3 + sc('turret') * 4 + sc('trap') * 0.5 + sc('lamp') * 0.5 + sc('chest')
    + (sc('clinic') ? 6 : 0) + sc('purifier') * 4 + sc('sink') * 2 + comfort() * 2 + Math.min(10, roofed / 10) + state.raidsSurvived * 2 + (sc('campfire') ? 2 : 0) + (sc('stove') ? 3 : 0);
  slCache = { t: state.elapsed, pts };
  return pts;
}
function computedLevel() { const pts = settlementPoints(); let l = 1; for (let k = 1; k < SL_STEPS.length; k++) if (pts >= SL_STEPS[k]) l = k + 1; return l; }
function settlementLevel() { return Math.max(state.settleLvl || 1, computedLevel()); }
function settlementLabel() {
  const l = settlementLevel(), pts = Math.floor(settlementPoints());
  return 'Level ' + l + ' ' + SL_NAMES[l - 1] + (l < SL_STEPS.length ? '  (' + pts + ' / ' + SL_STEPS[l] + ')' : '  (max)');
}
function slOk(r) { return !SL_REQ[r.id] || settlementLevel() >= SL_REQ[r.id]; }
{ const o = recipeUnlocked; recipeUnlocked = function (r) { return o(r) && slOk(r); }; }
{ const o = unlockText; unlockText = function (r) {
  const t = o(r);
  if (slOk(r)) return t;
  const s = 'camp level ' + SL_REQ[r.id] + ' (' + SL_NAMES[SL_REQ[r.id] - 1] + ')';
  return t ? t + ', plus ' + s : s;
}; }
let slT = 0;
function updateSettlementLevel(dt) {
  slT -= dt;
  if (slT > 0 || state.title) return;
  slT = 1.5;
  const c = computedLevel();
  if (c > (state.settleLvl || 1)) {
    state.settleLvl = c;
    const un = Object.keys(SL_REQ).filter(id => SL_REQ[id] === c).map(id => (RECIPES.find(r => r.id === id) || { name: id }).name);
    toast('Your camp is now a ' + SL_NAMES[c - 1] + ' (level ' + c + ').' + (un.length ? ' Unlocked: ' + un.join(', ') + '.' : ''), 7);
    sfx('levelup'); state.floats.push({ x: state.player.x, y: state.player.y - 24, text: SL_NAMES[c - 1].toUpperCase(), color: '#ffd36b', life: 2 });
  }
}
{ const o = updateStorm; updateStorm = function (dt) { o(dt); updateMarkers(dt); updateSettlementLevel(dt); }; }
Object.assign(DBG, { addBuff, buffFx, BUFFS, FOOD_BUFFS, addRumour, updateMarkers, settlementPoints, settlementLevel, settlementLabel, compassTarget, SL_REQ });
