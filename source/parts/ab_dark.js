/* =====================================================================
   AB_DARK: the dark pass. Gore with a setting, a content warning, persistent
   blood and bodies, grimmer text and a washed-out palette.
   ===================================================================== */
if (settings.gore === undefined) settings.gore = 'full';
if (settings.grim === undefined) settings.grim = true;
state.blood = []; state.gibs = [];
const gore = () => settings.gore || 'full';
const BLOOD = ['#6a0f12', '#7d1418', '#8c1a1c', '#5a0c10'];
DECOR_SPR.corpse = { w: 16, h: 9, nv: 3, outline: true, paint: (c, v) => { const coats = ['#5a4a3a', '#4a5a6a', '#6a3a30'], skin = '#b88a6a';
  R(c, '#6a0f12', 2, 5, 12, 3); R(c, coats[v % 3], 3, 2, 8, 5); R(c, shade(coats[v % 3], -30), 3, 6, 8, 1); R(c, skin, 11, 3, 4, 3); R(c, '#2a1810', 11, 3, 4, 1); R(c, '#3a3a40', 0, 3, 3, 2); R(c, '#3a3a40', 1, 6, 3, 2); R(c, '#8c1a1c', 8, 4, 2, 2); } };
DECOR_SPR.bloodpool = { w: 14, h: 8, nv: 2, outline: false, paint: (c, v) => { R(c, '#5a0c10', 2, 2, 10, 5); R(c, '#6a0f12', 1, 3, 12, 3); R(c, '#7d1418', 4, 3, 5, 2); if (v) R(c, '#7d1418', 10, 1, 3, 2); } };
function darkenWorld() {
  const rng = mulberry32(90210);
  for (const r of ruins) {
    const n = Math.floor(rng() * 3);
    for (let k = 0; k < n; k++) { const x = (r.x0 + 1 + Math.floor(rng() * Math.max(1, r.w - 2))) * TS + 8, y = (r.y0 + 1 + Math.floor(rng() * Math.max(1, r.h - 2))) * TS + 12; decor.push({ kind: 'bloodpool', x, y, v: Math.floor(rng() * 2), ph: 0 }); decor.push({ kind: 'corpse', x, y: y - 1, v: Math.floor(rng() * 3), ph: 0 }); }
  }
  for (const h of HOT_SPOTS) for (let k = 0; k < 3; k++) { const a = rng() * 6.283, d = rng() * h.r * 0.8; decor.push({ kind: 'bones', x: (h.x + Math.cos(a) * d) * TS, y: (h.y + Math.sin(a) * d) * TS, v: Math.floor(rng() * 3), ph: 0 }); }
}
darkenWorld();

/* ---------- Blood, bodies and gibs ---------- */
function addDecal(x, y, r) {
  if (gore() === 'off') return;
  const pix = []; r *= 1.5; const n = 12 + Math.floor(r * 4);
  for (let k = 0; k < n; k++) { const a = Math.random() * 6.283, d = Math.random() * r; pix.push([Math.round(Math.cos(a) * d), Math.round(Math.sin(a) * d * 0.62), Math.random() < 0.45 ? 3 : Math.random() < 0.6 ? 2 : 1, Math.floor(Math.random() * 4)]); }
  state.blood.push({ k: 'd', x, y, pix, born: state.gameMinutes, map: state.map });
  if (state.blood.length > 420) state.blood.shift();
}
function bloodSpray(x, y, nx, ny, n) {
  if (gore() === 'off') { burst(x, y, '#9a9a9a', 3); return; }
  for (let k = 0; k < n; k++) { const a = Math.atan2(ny, nx) + (Math.random() - 0.5) * 1.3, s = 30 + Math.random() * 60; state.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 18, life: 0.4 + Math.random() * 0.25, color: BLOOD[Math.floor(Math.random() * 4)] }); }
  addDecal(x - nx * 6, y + 4 - ny * 3, 5 + n * 0.5); if (n > 5) addDecal(x + nx * 9, y + 5 + ny * 4, 4);
}
function spawnGibs(x, y, n) {
  if (gore() !== 'full') return;
  for (let k = 0; k < n; k++) { const a = Math.random() * 6.283, s = 40 + Math.random() * 70; state.gibs.push({ x, y: y - 6, z: 6 + Math.random() * 6, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.6, vz: 40 + Math.random() * 60, size: Math.random() < 0.3 ? 3 : 2, col: BLOOD[Math.floor(Math.random() * 4)], map: state.map }); }
  addDecal(x, y + 2, 16); addDecal(x + 8, y, 10); addDecal(x - 9, y + 3, 9);
}
function addCorpse(e) {
  if (gore() !== 'full') return;
  state.blood.push({ k: 'c', type: e.type, x: e.x, y: e.y, flip: Math.random() < 0.5, born: state.gameMinutes, map: state.map });
  const cs = state.blood.filter(b => b.k === 'c');
  if (cs.length > 40) state.blood.splice(state.blood.indexOf(cs[0]), 1);
}
function corpseSprite(type) {
  const sp = ENEMY_SPR[type]; if (!sp) return null;
  return makeSprite('corpse|' + type, sp.w, sp.h, c => { sp.paint(c, 0); c.globalCompositeOperation = 'source-atop'; c.fillStyle = 'rgba(40,0,0,0.42)'; c.fillRect(0, 0, sp.w + 4, sp.h + 4); c.globalCompositeOperation = 'source-over'; }, false);
}
function updateBlood(dt) {
  for (let k = state.gibs.length - 1; k >= 0; k--) {
    const g = state.gibs[k]; g.x += g.vx * dt; g.y += g.vy * dt; g.z += g.vz * dt; g.vz -= 260 * dt; g.vx *= 0.985; g.vy *= 0.985;
    if (g.z <= 0) { g.z = 0; if (Math.abs(g.vz) > 30) { g.vz = -g.vz * 0.35; g.vx *= 0.6; g.vy *= 0.6; } else { addDecal(g.x, g.y, 2.5); state.gibs.splice(k, 1); } }
  }
  const old = state.gameMinutes - 2400;
  if (state.blood.length && state.blood[0].born < old) state.blood = state.blood.filter(b => b.born >= old);
}
function drawBlood(camX, camY, vw, vh) {
  const now = state.gameMinutes;
  for (const b of state.blood) {
    if (b.map !== state.map || b.x < camX - 40 || b.x > camX + vw + 40 || b.y < camY - 40 || b.y > camY + vh + 40) continue;
    const age = now - b.born, a = age < 1440 ? 1 : Math.max(0, 1 - (age - 1440) / 960);
    ctx.globalAlpha = a * (b.k === 'd' ? 0.82 : 1);
    if (b.k === 'd') { for (const q of b.pix) { ctx.fillStyle = BLOOD[q[3]]; ctx.fillRect(Math.round(b.x + q[0]), Math.round(b.y + q[1]), q[2], q[2]); } }
    else { const sp = corpseSprite(b.type); if (sp) { ctx.save(); ctx.translate(Math.round(b.x), Math.round(b.y + 2)); ctx.rotate(b.flip ? Math.PI / 2 : -Math.PI / 2); ctx.drawImage(sp, -sp.width / 2, -sp.height + 4); ctx.restore(); } }
  }
  ctx.globalAlpha = 1;
  for (const g of state.gibs) { if (g.map !== state.map) continue; ctx.fillStyle = g.col; ctx.fillRect(Math.round(g.x), Math.round(g.y - g.z), g.size, g.size); }
}
{ const o = damageEnemy; damageEnemy = function (e, dmg, nx, ny, kb) {
  const hp0 = e.hp; o(e, dmg, nx, ny, kb);
  bloodSpray(e.x, e.y - 4, nx || 0.01, ny || 0.01, Math.min(10, 3 + Math.round(dmg / 8)));
  if (e.hp <= 0) {
    const over = -e.hp, mx = e.maxHp || ENEMY_TYPES[e.type].hp;
    if (over > mx * 0.45 || dmg > 50) { spawnGibs(e.x, e.y, 8 + Math.floor(Math.random() * 6)); sfx('splat'); }
    else { addDecal(e.x, e.y + 3, 13); addDecal(e.x + 6, e.y + 5, 8); addDecal(e.x - 7, e.y + 2, 7); addCorpse(e); }
  }
}; }
{ const o = hurtPlayer; hurtPlayer = function (a, b, c, d) { const h0 = state.player.health; o(a, b, c, d); if (state.player.health < h0) bloodSpray(state.player.x, state.player.y - 6, c || 0.01, d || 0.01, 4 + Math.min(6, Math.round((h0 - state.player.health) / 4))); }; }
{ const o = hurtSettler; hurtSettler = function (s, dmg) { const h0 = s.health; o(s, dmg); if (s.health < h0) bloodSpray(s.x, s.y - 6, 0.3, -0.2, 4); }; }
{ const o = sfx; sfx = function (name, arg) { if (name === 'splat') { if (AUD.ac && !AUD.muted && gore() !== 'off') { aNoise(0.18, 0.28, 'lowpass', 900, 120); aTone(80, 0.2, 'sine', 0.22, 40); } return; } o(name, arg); }; }
{ const o = killEnemy; killEnemy = function (e) { if (gore() !== 'off') sfx('splat'); o(e); }; }
{ const o = updateStorm; updateStorm = function (dt) { o(dt); updateBlood(dt); }; }

/* the player's own wounds show on the sprite */
function woundLevel() { if (gore() === 'off') return 0; const f = state.player.health / maxHealth(); return f < 0.3 ? 2 : f < 0.6 ? 1 : 0; }
{ const o = plookSig; plookSig = function () { return o() + '|w' + woundLevel(); }; }
{ const o = playerExtras; playerExtras = function (c, dir, look) {
  o(c, dir, look);
  const w = woundLevel();
  if (!w) return;
  const col = '#7d1418', dk = '#5a0c10';
  if (dir === 0) { R(c, col, 5, 13, 3, 2); R(c, dk, 6, 14, 2, 2); R(c, col, 10, 16, 2, 3); if (w > 1) { R(c, col, 4, 17, 4, 2); R(c, dk, 11, 12, 2, 4); R(c, col, 7, 3, 1, 4); R(c, dk, 12, 2, 2, 1); } }
  else if (dir === 1) { R(c, col, 6, 14, 3, 3); R(c, dk, 9, 17, 2, 2); if (w > 1) { R(c, col, 5, 18, 4, 2); R(c, dk, 10, 13, 2, 3); } }
  else { R(c, col, 7, 13, 3, 2); R(c, dk, 9, 16, 2, 3); if (w > 1) { R(c, col, 6, 17, 4, 2); R(c, dk, 11, 3, 1, 4); } }
}; }

/* ---------- Washed-out palette ---------- */
function drawGrim() {
  if (!settings.grim || state.title) return;
  const W2 = canvas.width, H2 = canvas.height;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = 'rgba(128,128,128,0.2)'; ctx.fillRect(0, 0, W2, H2);
  ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(182,178,190,1)'; ctx.fillRect(0, 0, W2, H2);
  ctx.globalCompositeOperation = 'source-over';
  const r = Math.hypot(W2, H2) / 2, g = ctx.createRadialGradient(W2 / 2, H2 / 2, r * 0.55, W2 / 2, H2 / 2, r);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.34)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W2, H2);
}
{ const o = drawStorm; drawStorm = function () { drawGrim(); o(); }; }

/* ---------- A darker voice ---------- */
Object.assign(CREATURE_LORE, {
  glowrat: 'It ate something it should not have, and then it ate its litter. The eyes glow because nothing else in there still works.',
  hound: 'A dog that remembers people as food and as masters, and cannot tell which memory is which.',
  husk: 'It still wears a coat. It still walks to the door at dusk. There is nobody left in there to open it.',
  scrapper: 'A raider with a club. Takes what it cannot scrap, and does not stop at things.',
  gunner: 'A raider with a pistol who would rather not get close. The ones who do tend to regret it.',
  stalker: 'Lean, dark and patient. It does not hurry. It has watched a lot of people stop running.',
  sapper: 'A raider in a vest of dynamite and a look of settled calm. It does not want to fight you. It wants your wall, and it will take you with it.',
  brute: 'Used to be somebody\u2019s bodyguard. Now it is somebody\u2019s door-breaker, and no longer particular about whose.',
  sniper: 'Keeps its distance and its patience. You will not hear the one that gets you.',
  bloater: 'Swollen with whatever the marsh gave it. Pop it and the air turns to rot.',
  spitter: 'Spits something that burns going in and glows coming out.',
  chief: 'Leads from the middle, and has eaten better than anyone else in the warband for a very long time.'
});
Object.assign(PLACE_LORE, {
  'The Wastes': 'Open ground between everything else. Mild radiation, ambushes, and now and then a stranger with something to sell and nothing to lose.',
  'Home Valley': 'An open valley with a spring and a few trees. Nothing here is safe until you make it so.',
  'Whisper Pines': 'Dense forest. Dark under the canopy, and things wait in it until you are close enough to smell.',
  'The Ashlands': 'Grey flats in the north-east where the ash never settles. Ash hounds roam here, and so does what is left of the people who tried to cross.',
  'Fallen City': 'Broken towers in the east. Rich crates, raiders, and bodies that have not been touched in years.',
  'Toxic Marsh': 'Irradiated shallows in the south-east. The water is not for drinking and the mud is not for walking, and people do both.',
  'The Quarry': 'Stone and iron ore in the south. Good for materials, and for being buried in.',
  'The Scrapyard': 'Heaps of scrap and a few buildings still standing. Somebody lived here recently. Not all of them left.'
});
{ const o = die; die = function (r) { const msgs = ['The wasteland keeps what it takes.', 'Nobody saw. Nobody was going to.', 'You are very still. Your things are where you fell.', 'It was quick. That is the kindest thing anyone could say about it.']; o(r || msgs[Math.floor(Math.random() * msgs.length)]); if (gore() !== 'off') { addDecal(state.corpse ? state.corpse.x : state.player.x, (state.corpse ? state.corpse.y : state.player.y) + 3, 11); } }; }

/* ---------- Content warning and settings ---------- */
function drawWarning(w, h) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = '#08060a'; ctx.fillRect(0, 0, w, h);
  const pw = 600, ph = 410, px = Math.round(w / 2 - pw / 2), py = Math.round(h / 2 - ph / 2);
  panel(px, py, pw, ph, 0.98);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '20px ' + MONO; ctx.fillStyle = '#e8503a'; ctx.fillText('Mature content', w / 2, py + 34);
  ctx.font = '12px ' + MONO; ctx.fillStyle = '#e8dcc0';
  const lines = ['This game is for adults, 18 and over.', '', 'It contains graphic violence and gore, death, loss,', 'cruelty, addiction, the end of the world and what', 'people do to each other afterwards.', '', 'It does not contain sexual content.', '', 'You can turn the gore down, or off, at any time', 'in Settings.'];
  lines.forEach((l, k) => ctx.fillText(l, w / 2, py + 82 + k * 20));
  const lab = { off: 'Off', some: 'Some', full: 'Full' };
  button(px + 90, py + 308, 420, 34, 'Gore: ' + lab[gore()] + '   (click to change)', () => { settings.gore = gore() === 'full' ? 'some' : gore() === 'some' ? 'off' : 'full'; saveSettings(); });
  button(px + 90, py + 352, 420, 38, 'I am 18 or over. Continue.', () => { settings.cwSeen = true; saveSettings(); }, true);
}
{ const o = drawTitle; drawTitle = function (w, h) { if (!settings.cwSeen) { drawWarning(w, h); return; } o(w, h); }; }
Object.assign(DBG, { addDecal, bloodSpray, spawnGibs, addCorpse, drawBlood, woundLevel, gore, drawGrim });
