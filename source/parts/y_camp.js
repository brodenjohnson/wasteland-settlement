/* =====================================================================
   Y_CAMP: base anywhere. The bedroll is the hearth. It makes the safe zone,
   and the zone grows with the camp.
   ===================================================================== */
const ORIGIN = { x: BASE.x, y: BASE.y };
const CAMP = { active: false, r2: 0, r: 0 };
state.hearth = null;
const CAMP_RADII = [8, 12, 16, 22, 28, 36];
function campRadius() { return CAMP_RADII[Math.min(CAMP_RADII.length, settlementLevel()) - 1]; }
function inCampTile(i) {
  if (!CAMP.active) return false;
  const dx = (i % W) - BASE.x, dy = Math.floor(i / W) - BASE.y;
  return dx * dx + dy * dy <= CAMP.r2;
}
function campRadAt(i, base) { return inCampTile(i) ? CONFIG.survival.baseRad : base; }
inBase = function () { const p = state.player; return Math.hypot(p.x / TS - BASE.x, p.y / TS - BASE.y) < (CAMP.active ? CAMP.r + 3 : 12); };
let hearthT = 0;
function updateHearth(dt) {
  hearthT -= dt;
  if (hearthT > 0 || state.title) return;
  hearthT = 0.25;
  let h = null, any = null;
  for (const [i, st] of structs) if (st.type === 'bedroll') { if (!any) any = i; if (st.hearth) { h = i; break; } }
  if (h === null && any !== null) { h = any; structs.get(h).hearth = true; }
  if (h === null) { if (state.hearth) { state.hearth = null; CAMP.active = false; toast('Your hearth is gone. The ground out here is no longer safe.', 4); } return; }
  const hx = h % W, hy = Math.floor(h / W), first = !state.hearth;
  if (!state.hearth || state.hearth.i !== h) {
    state.hearth = { i: h, x: hx, y: hy }; BASE.x = hx; BASE.y = hy; spawn.x = (hx + 0.5) * TS; spawn.y = (hy + 0.5) * TS;
    if (first && !state.qflags.hearthPlaced) { state.qflags.hearthPlaced = true; state.nextRaidDay = Math.max(state.nextRaidDay, clockDay() + 2); toast('Your bedroll is now the hearth. The ground around it is safe, and the safe zone grows as your camp does.', 7); sfx('levelup'); }
    state.tilled && 0;
  }
  const r = campRadius();
  if (CAMP.r && r > CAMP.r) toast('Your camp has grown. The safe zone is now ' + r + ' tiles across.', 5);
  CAMP.active = true; CAMP.r = r; CAMP.r2 = r * r;
}
{ const o = updateStorm; updateStorm = function (dt) { o(dt); updateHearth(dt); }; }
{ const o = updateRaids; updateRaids = function () { if (!state.hearth) return; o(); }; }
{ const q = QUEST_DEFS.find(d => d.id === 'welcome'); q.steps.unshift({ id: 'hearth', text: 'Place your bedroll where you want to live. The ground around it becomes safe', check: () => !!state.hearth }); }
function drawCampRing(cx, cy, scale) {
  if (!CAMP.active) return;
  ctx.strokeStyle = 'rgba(127,224,192,0.85)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, CAMP.r * scale, 0, Math.PI * 2); ctx.stroke();
}
{ const o = drawMiniExtras; drawMiniExtras = function (mx, my, MS) { drawCampRing(mx + (BASE.x + 0.5) / W * MS, my + (BASE.y + 0.5) / H * MS, MS / W); o(mx, my, MS); }; }
{ const o = drawBigMapExtras; drawBigMapExtras = function (px, py, S) { drawCampRing(px + 6 + (BASE.x + 0.5) / W * S, py + 6 + (BASE.y + 0.5) / H * S, S / W); o(px, py, S); }; }
Object.assign(DBG, { CAMP, inCampTile, campRadius, updateHearth, ORIGIN, CAMP_RADII });
