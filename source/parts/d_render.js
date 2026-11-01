/* =====================================================================
   RENDER: ground overlay, lighting, world pass, HUD and panels
   ===================================================================== */
function drawGroundOverlay(tx, ty, time) {
  const i = ty * W + tx, t = tiles[i], x = tx * TS, y = ty * TS;
  if (t === T.WATER || t === T.SPRING) {
    const ph = (Math.floor(time * 1.6) + tx * 3 + ty) % 3;
    ctx.fillStyle = t === T.WATER ? 'rgba(200,255,130,0.22)' : 'rgba(255,255,255,0.28)';
    ctx.fillRect(x + 2 + ph * 4, y + 4, 4, 1); ctx.fillRect(x + 9 - ph * 3, y + 10, 3, 1);
    ctx.fillStyle = t === T.WATER ? 'rgba(210,255,150,0.4)' : 'rgba(255,255,255,0.5)';
    const wat = k => k === T.WATER || k === T.SPRING;
    if (ty > 0 && !wat(tiles[i - W])) ctx.fillRect(x, y, TS, 1);
    if (ty + 1 < H && !wat(tiles[i + W])) ctx.fillRect(x, y + TS - 1, TS, 1);
    if (tx > 0 && !wat(tiles[i - 1])) ctx.fillRect(x, y, 1, TS);
    if (tx + 1 < W && !wat(tiles[i + 1])) ctx.fillRect(x + TS - 1, y, 1, TS);
  }
  if (tilled[i]) {
    ctx.fillStyle = wet[i] ? 'rgba(28,18,10,0.66)' : 'rgba(62,42,26,0.58)';
    ctx.fillRect(x, y, TS, TS);
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillRect(x + 1, y + 3, 14, 1); ctx.fillRect(x + 1, y + 7, 14, 1); ctx.fillRect(x + 1, y + 11, 14, 1);
    ctx.fillStyle = wet[i] ? 'rgba(110,170,220,0.2)' : 'rgba(255,220,170,0.1)';
    ctx.fillRect(x + 1, y + 4, 14, 1); ctx.fillRect(x + 1, y + 8, 14, 1); ctx.fillRect(x + 1, y + 12, 14, 1);
    ctx.fillStyle = 'rgba(14,8,4,0.45)';
    if (ty > 0 && !tilled[i - W]) ctx.fillRect(x, y, TS, 1);
    if (ty + 1 < H && !tilled[i + W]) ctx.fillRect(x, y + TS - 1, TS, 1);
    if (tx > 0 && !tilled[i - 1]) ctx.fillRect(x, y, 1, TS);
    if (tx + 1 < W && !tilled[i + 1]) ctx.fillRect(x + TS - 1, y, 1, TS);
  }
  const rr = radMap[i];
  if (t === T.GROUND && rr >= 0.85) {
    ctx.fillStyle = 'rgba(170,230,60,' + (0.05 + (rr - 0.85) * 0.2 + 0.05 * Math.sin(time * 3 + tx + ty)) + ')';
    ctx.fillRect(x, y, TS, TS);
    if (hash2(tx, ty, 41) < 0.12) { const a = (Math.floor(time * 2) + tx) % 2; ctx.fillStyle = 'rgba(210,255,120,0.55)'; ctx.fillRect(x + 3 + a * 6, y + 5 + a * 3, 1, 1); }
  } else if (t === T.GROUND && rr >= 0.4) {
    ctx.fillStyle = 'rgba(150,170,60,0.07)'; ctx.fillRect(x, y, TS, TS);
  }
  if (rr <= -0.9) {
    ctx.fillStyle = 'rgba(127,224,192,0.3)';
    const dash = ((tx + ty) & 1) === 0;
    if (dash) {
      if (tx + 1 < W && radMap[i + 1] > -0.9) ctx.fillRect(x + TS - 1, y + 2, 1, 12);
      if (tx > 0 && radMap[i - 1] > -0.9) ctx.fillRect(x, y + 2, 1, 12);
      if (ty + 1 < H && radMap[i + W] > -0.9) ctx.fillRect(x + 2, y + TS - 1, 12, 1);
      if (ty > 0 && radMap[i - W] > -0.9) ctx.fillRect(x + 2, y, 12, 1);
    }
  }
  const cr = crops.get(i);
  if (cr) drawCrop(cr, tx, ty);
}

function drawLighting(transX, transY, d) {
  if (d <= 0.01) return;
  const col = lerpColor([70, 35, 40], [5, 9, 32], d);
  lctx.setTransform(1, 0, 0, 1, 0, 0);
  lctx.globalCompositeOperation = 'source-over';
  lctx.clearRect(0, 0, lightCv.width, lightCv.height);
  lctx.fillStyle = 'rgba(' + col + ',' + (d * 0.84) + ')';
  lctx.fillRect(0, 0, lightCv.width, lightCv.height);
  lctx.globalCompositeOperation = 'destination-out';
  const p = state.player;
  hole(p.x * scale - transX, p.y * scale - transY, 80 * scale, 0.95);
  hole((BASE.x + 2.5) * TS * scale - transX, (BASE.y + 0.6) * TS * scale - transY, 70 * scale, 0.9);
  for (const [si, st] of structs) {
    if (st.type === 'forge') hole(((si % W) + 0.5) * TS * scale - transX, (Math.floor(si / W) + 0.5) * TS * scale - transY, 45 * scale, 0.8);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(lightCv, 0, 0);
  ctx.globalCompositeOperation = 'lighter';
  const glow = (wx, wy, r, a) => {
    const sx = wx * scale - transX, sy = wy * scale - transY, rr = r * scale;
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, rr);
    g.addColorStop(0, 'rgba(255,140,50,' + a + ')'); g.addColorStop(1, 'rgba(255,140,50,0)');
    ctx.fillStyle = g; ctx.fillRect(sx - rr, sy - rr, rr * 2, rr * 2);
  };
  glow((BASE.x + 2.5) * TS, (BASE.y + 0.6) * TS, 58, 0.24 * d);
  for (const [si, st] of structs) if (st.type === 'forge') glow(((si % W) + 0.5) * TS, (Math.floor(si / W) + 0.5) * TS, 38, 0.22 * d);
  ctx.globalCompositeOperation = 'source-over';
}

function drawProjs() {
  for (const pr of state.projs) {
    const len = Math.hypot(pr.vx, pr.vy) || 1, nx = pr.vx / len, ny = pr.vy / len;
    ctx.fillStyle = pr.hostile ? 'rgba(255,120,80,0.5)' : 'rgba(255,230,140,0.5)';
    ctx.fillRect(Math.round(pr.x - nx * 4), Math.round(pr.y - ny * 4), 2, 2);
    ctx.fillStyle = pr.hostile ? '#ff8a5a' : '#ffe08a';
    ctx.fillRect(Math.round(pr.x - 1), Math.round(pr.y - 1), 3, 2);
  }
  if (state.muzzle > 0) {
    const p = state.player;
    ctx.fillStyle = '#fff2b0';
    ctx.fillRect(Math.round(p.x + p.aimX * 13 - 2), Math.round(p.y - 3 + p.aimY * 13 - 2), 4, 4);
    ctx.fillStyle = '#ffb040';
    ctx.fillRect(Math.round(p.x + p.aimX * 16 - 1), Math.round(p.y - 3 + p.aimY * 16 - 1), 2, 2);
  }
}
function drawSlash() {
  const s = state.slash;
  if (!s) return;
  const p = state.player, base = Math.atan2(s.ay, s.ax), pr = s.t / s.dur;
  ctx.fillStyle = 'rgba(255,255,255,' + (0.85 * (1 - pr)) + ')';
  for (let k = 0; k <= 10; k++) {
    const a = base + ((k / 10) - 0.5) * 1.9 + (pr - 0.5) * 0.8;
    const r = s.reach * (0.75 + 0.2 * Math.sin(k / 10 * Math.PI));
    ctx.fillRect(Math.round(p.x + Math.cos(a) * r - 1), Math.round(p.y - 3 + Math.sin(a) * r - 1), 2, 2);
  }
}
function drawDrops() {
  for (const d of state.drops) {
    const bob = Math.round(Math.sin(state.elapsed * 4 + d.x) * 1.2);
    shadowAt(d.x, d.y + 4, 7);
    drawIcon(d.name, Math.round(d.x - 4), Math.round(d.y - 5 + bob), 8);
  }
}

function describeMouse() {
  const tx = Math.floor(state.mwx / TS), ty = Math.floor(state.mwy / TS);
  if (tx < 0 || ty < 0 || tx >= W || ty >= H) return { label: 'Out of bounds', ring: 'rgba(255,255,255,0.4)', tx, ty, ok: false };
  const i = ty * W + tx, tg = getTarget();
  let label = TILE_NAMES[tiles[i]] + (tilled[i] ? ' (tilled)' : '') + '  (' + tx + ', ' + ty + ')';
  let ring = 'rgba(255,255,255,0.75)';
  const cr = crops.get(i);
  if (cr && !cropRipe(cr)) { const c = CROPS[cr.seed]; label = c.produce + '  day ' + cr.age + '/' + c.days + (wet[i] ? ', watered' : ', needs water'); }
  if (tg) {
    const res = tg.res;
    if (res.drink) label = res.name + (res.dirty ? '  (click to drink, adds radiation)' : '  (click to drink)');
    else if (res.bed) label = 'Bedroll  (click to sleep, nights only)';
    else if (res.purifier) label = 'Water Purifier  (click to drink, or fill a watering can)';
    else if (res.crop) label = res.name + '  (click to harvest)';
    else if (res.crate) label = 'Supply crate  (click to open)';
    else label = res.name + ' (' + res.item + ')  needs ' + (res.minTier === 0 ? 'any tool' : CONFIG.tools.names[res.minTier] + ' ' + res.tool);
    ring = !tg.inReach ? 'rgba(180,180,180,0.7)' : tg.canHarvest ? 'rgba(127,255,127,0.95)' : 'rgba(255,150,60,0.95)';
  }
  return { label, ring, tx, ty, ok: true };
}

function render() {
  const p = state.player;
  const vw = canvas.width / scale, vh = canvas.height / scale;
  const worldW = W * TS, worldH = H * TS;
  let camX = worldW <= vw ? (worldW - vw) / 2 : Math.max(0, Math.min(worldW - vw, p.x - vw / 2));
  let camY = worldH <= vh ? (worldH - vh) / 2 : Math.max(0, Math.min(worldH - vh, p.y - vh / 2));
  const transX = Math.round(camX * scale), transY = Math.round(camY * scale);
  camX = transX / scale; camY = transY / scale;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#0b0908';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  ctx.setTransform(scale, 0, 0, scale, -transX, -transY);
  ctx.drawImage(groundCv, 0, 0);

  const tx0 = Math.max(0, Math.floor(camX / TS)), ty0 = Math.max(0, Math.floor(camY / TS));
  const tx1 = Math.min(W - 1, Math.floor((camX + vw) / TS)), ty1 = Math.min(H - 1, Math.floor((camY + vh) / TS));
  for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) drawGroundOverlay(tx, ty, state.elapsed);
  drawBaseMarker(state.elapsed);
  drawDrops();
  if (state.corpse) drawCorpse(state.corpse, state.elapsed);

  const mwx = (mouse.x * dpr + transX) / scale, mwy = (mouse.y * dpr + transY) / scale;
  state.mwx = mwx; state.mwy = mwy;
  const ax = mwx - p.x, ay = mwy - (p.y - 3), al = Math.hypot(ax, ay) || 1;
  p.aimX = ax / al; p.aimY = ay / al;

  const playerRow = Math.floor((p.y + 5) / TS);
  for (let ty = ty0; ty <= ty1 + 1; ty++) {
    if (ty <= ty1) for (let tx = tx0; tx <= tx1; tx++) {
      const i = ty * W + tx;
      if (objs[i]) {
        const sh = state.shake.get(i);
        if (sh) { ctx.save(); ctx.translate(Math.round(Math.sin(sh * 70)), 0); drawObject(objs[i], tx, ty, shade_[i]); ctx.restore(); }
        else drawObject(objs[i], tx, ty, shade_[i]);
        const dm = state.damage.get(i);
        if (dm) drawDamageBar(tx, ty, dm);
      }
      const st = structs.get(i);
      if (st) drawStruct(st, tx, ty);
    }
    for (const e of enemies) if (Math.floor((e.y + ENEMY_TYPES[e.type].size / 2) / TS) === ty) drawEnemy(e);
    if (ty === playerRow) drawPlayer(p);
  }
  drawProjs();
  drawSlash();
  drawEffects();
  drawPlacementGhost();

  const mi = describeMouse();
  if (mi.ok) {
    ctx.strokeStyle = mi.ring; ctx.lineWidth = 1 / scale * 1.5;
    ctx.strokeRect(mi.tx * TS + 0.5, mi.ty * TS + 0.5, TS - 1, TS - 1);
  }

  drawLighting(transX, transY, darkness(clockHour()));
  drawRadVignette();
  if (state.sleeping) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = 'rgba(4,6,16,0.82)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  drawHUD(mi.label);
}

/* ---------- HUD ---------- */
const MONO = 'ui-monospace, Menlo, Consolas, monospace';
function panel(x, y, w, h, a) {
  ctx.fillStyle = 'rgba(18,14,12,' + (a === undefined ? 0.78 : a) + ')'; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(233,226,212,0.22)'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(x + 1, y + 1, w - 2, 1);
}
function bar(x, y, w, label, val, color, right) {
  const f = Math.max(0, Math.min(1, val / 100));
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(x, y, w, 12);
  ctx.fillStyle = color; ctx.fillRect(x + 1, y + 1, (w - 2) * f, 10);
  ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(x + 1, y + 1, (w - 2) * f, 3);
  ctx.font = '10px ' + MONO; ctx.textBaseline = 'middle';
  ctx.textAlign = 'left'; ctx.fillStyle = '#f4efe4'; ctx.fillText(label, x + 5, y + 6.5);
  if (right) { ctx.textAlign = 'right'; ctx.fillText(right, x + w - 5, y + 6.5); }
}
function hotbarLayout(w, h) {
  const n = CONFIG.hotbar, cell = 36, gap = 4, total = n * cell + (n - 1) * gap;
  return { x0: Math.round(w / 2 - total / 2), y0: h - cell - 14, cell, gap, n, total };
}
function hotbarHit(mx, my) {
  const L = hotbarLayout(window.innerWidth, window.innerHeight);
  for (let i = 0; i < L.n; i++) {
    const x = L.x0 + i * (L.cell + L.gap);
    if (mx >= x && mx < x + L.cell && my >= L.y0 && my < L.y0 + L.cell) return i;
  }
  return -1;
}
function drawHotbar(w, h) {
  const L = hotbarLayout(w, h), inv = state.player.inventory;
  panel(L.x0 - 6, L.y0 - 6, L.total + 12, L.cell + 12, 0.7);
  for (let i = 0; i < L.n; i++) {
    const x = L.x0 + i * (L.cell + L.gap), y = L.y0, s = inv[i], on = i === state.sel;
    ctx.fillStyle = on ? 'rgba(255,211,107,0.18)' : 'rgba(255,255,255,0.06)'; ctx.fillRect(x, y, L.cell, L.cell);
    ctx.strokeStyle = on ? '#ffd36b' : 'rgba(233,226,212,0.2)'; ctx.lineWidth = on ? 2 : 1;
    ctx.strokeRect(x + (on ? 1 : 0.5), y + (on ? 1 : 0.5), L.cell - (on ? 2 : 1), L.cell - (on ? 2 : 1));
    ctx.font = '9px ' + MONO; ctx.textBaseline = 'top'; ctx.textAlign = 'left';
    ctx.fillStyle = on ? '#ffd36b' : 'rgba(233,226,212,0.55)'; ctx.fillText(String(i + 1), x + 3, y + 2);
    if (s) {
      drawIcon(s.name, x + 4, y + 4, 28, s);
      const wp = WEAPONS[s.name];
      let tag = s.qty > 1 ? String(s.qty) : '';
      if (wp && wp.kind === 'gun') tag = String(countItem(wp.ammo));
      if (tag) { ctx.font = '10px ' + MONO; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillStyle = '#000'; ctx.fillText(tag, x + L.cell - 2, y + L.cell - 1); ctx.fillStyle = '#fff'; ctx.fillText(tag, x + L.cell - 3, y + L.cell - 2); }
      if (s.name === 'Watering Can') {
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(x + 4, y + L.cell - 5, L.cell - 8, 3);
        ctx.fillStyle = '#4aa3c8'; ctx.fillRect(x + 4, y + L.cell - 5, (L.cell - 8) * ((s.water || 0) / CONFIG.farm.canCapacity), 3);
      }
    }
  }
  const sel = inv[state.sel];
  if (sel) {
    ctx.font = '11px ' + MONO; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const label = sel.name + (WEAPONS[sel.name] && WEAPONS[sel.name].kind === 'gun' ? '  (' + countItem(WEAPONS[sel.name].ammo) + ' rounds)' : '');
    const tw = ctx.measureText(label).width + 14;
    panel(Math.round(w / 2 - tw / 2), L.y0 - 30, tw, 18, 0.75);
    ctx.fillStyle = '#ffd36b'; ctx.fillText(label, w / 2, L.y0 - 20.5);
  }
}

function drawHUD(label) {
  const w = window.innerWidth, h = window.innerHeight;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const p = state.player;
  state.uiRects = [];

  panel(8, 8, 172, 102);
  const mh = maxHealth();
  bar(14, 14, 160, 'Health', p.health / mh * 100, '#c0392b', Math.ceil(p.health) + '/' + mh);
  bar(14, 30, 160, 'Food', p.food, '#f26f21', '');
  bar(14, 46, 160, 'Water', p.water, '#3b82c4', '');
  const rr = state.radRate;
  const zone = rr <= -0.9 ? 'Safe camp' : rr < 0 ? 'Regrowth' : rr >= 0.9 ? 'Hot spot' : rr >= 0.4 ? 'Ruins' : 'Wasteland';
  bar(14, 62, 160, 'Rad', p.radiation, '#7fbf3f', zone + (rr >= 0 ? ' +' : ' ') + rr.toFixed(2) + '/s');
  const as = armourStats();
  ctx.font = '10px ' + MONO; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#e9e2d4';
  ctx.fillText('Lv ' + p.level + '   dmg -' + Math.round(as.dmg * 100) + '%   rad -' + Math.round(as.rad * 100) + '%', 14, 86);
  const need = xpNeeded(p.level);
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(14, 96, 160, 4);
  ctx.fillStyle = '#ffd36b'; ctx.fillRect(14, 96, 160 * (p.level >= CONFIG.combat.maxLevel ? 1 : p.xp / need), 4);

  const hr = clockHour();
  panel(w - 138, 8, 130, 20);
  ctx.fillStyle = hr >= 18 || hr < 6 ? '#9fb4ff' : '#ffd36b';
  ctx.font = '11px ' + MONO; ctx.textAlign = 'center';
  ctx.fillText('Day ' + clockDay() + '  ' + fmtClock() + (state.timeMult > 1 ? '  >>' : ''), w - 73, 18.5);
  panel(w - 138, 32, 130, 130);
  ctx.drawImage(mini, w - 133, 37, 120, 120);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(w - 133 + (p.x / TS) * 2 - 1.5, 37 + (p.y / TS) * 2 - 1.5, 3, 3);
  if (state.corpse) { ctx.fillStyle = '#e8003d'; ctx.fillRect(w - 133 + (state.corpse.x / TS) * 2 - 1.5, 37 + (state.corpse.y / TS) * 2 - 1.5, 3, 3); }
  ctx.fillStyle = '#ff5a4a';
  for (const e of enemies) if (Math.hypot(e.x - p.x, e.y - p.y) < 170 || e.raid) ctx.fillRect(w - 133 + (e.x / TS) * 2 - 1, 37 + (e.y / TS) * 2 - 1, 2, 2);

  if (state.raid) {
    const left = enemies.filter(e => e.raid).length;
    ctx.font = '12px ' + MONO; ctx.textAlign = 'center';
    const txt = 'RAID from the ' + SIDE_NAMES[state.raid.side] + '  |  ' + left + ' raider' + (left === 1 ? '' : 's') + ' left';
    const tw = ctx.measureText(txt).width + 24;
    panel(Math.round(w / 2 - tw / 2), 8, tw, 22, 0.85);
    ctx.fillStyle = '#ff7a6a'; ctx.fillText(txt, w / 2, 19.5);
  }

  panel(8, h - 78, 318, 66, 0.72);
  ctx.font = '10px ' + MONO; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#f4efe4'; ctx.fillText(label.length > 50 ? label.slice(0, 49) + '...' : label, 14, h - 68);
  ctx.fillStyle = '#b9b09d';
  ctx.fillText('WASD move  click use  1-9 or wheel hotbar', 14, h - 55);
  ctx.fillText('I bag  C craft  right-click eat/equip  -/= zoom', 14, h - 43);
  ctx.fillText('Test: T time  U plans  G mats  H gear  N raid  K die', 14, h - 31);
  ctx.fillText('Hold click to harvest, till, plant, water or attack.', 14, h - 19);

  drawHotbar(w, h);

  if (state.msgT > 0) {
    ctx.globalAlpha = Math.min(1, state.msgT);
    ctx.font = '12px ' + MONO;
    const tw = ctx.measureText(state.msg).width + 24;
    ctx.fillStyle = 'rgba(0,0,0,0.75)'; ctx.fillRect(w / 2 - tw / 2, h - 108, tw, 26);
    ctx.fillStyle = '#e9e2d4'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(state.msg, w / 2, h - 95);
    ctx.globalAlpha = 1;
  }
  if (state.sleeping) {
    ctx.font = '16px ' + MONO; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#9fb4ff';
    ctx.fillText('Sleeping...', w / 2, h / 2);
  }
  if (state.invOpen) drawInventory(w, h);
  if (state.craftOpen) drawCrafting(w, h);
}

function itemInfo(it) {
  const n = it.name, lines = [];
  if (WEAPONS[n]) {
    const wp = WEAPONS[n];
    lines.push(wp.kind === 'gun' ? 'Pistol. Uses ' + wp.ammo.toLowerCase() + '.' : 'Melee weapon.');
    lines.push('Damage ' + wp.dmg + (wp.kind === 'gun' ? '' : '   Reach ' + wp.reach));
  } else if (ARMOUR[n]) {
    const a = ARMOUR[n];
    lines.push(SLOT_NAMES[a.slot] + ' slot. Right-click to equip.');
    lines.push('Damage resist ' + Math.round(a.dmg * 100) + '%   Radiation resist ' + Math.round(a.rad * 100) + '%');
  } else if (TOOL_ITEMS[n] && (TOOL_ITEMS[n].type === 'axe' || TOOL_ITEMS[n].type === 'pickaxe')) {
    lines.push(CONFIG.tools.names[TOOL_ITEMS[n].tier] + ' ' + TOOL_ITEMS[n].type + '. Select it on the hotbar.');
  } else if (CROPS[n]) {
    lines.push('Plant in tilled soil. Ripe after ' + CROPS[n].days + ' watered days.');
  } else if (ITEM_USE[n]) lines.push('Right-click to use.');
  if (ITEM_DESC[n]) lines.push(ITEM_DESC[n]);
  return lines;
}

function drawInventory(w, h) {
  const cols = 9, cell = 40, pad = 14, eqW = 112;
  const rows = Math.ceil(CONFIG.inventory.slots / cols);
  const pw = pad * 2 + eqW + cols * cell + 6, ph = 292;
  const px = Math.round(w / 2 - pw / 2), py = Math.max(8, Math.round(h / 2 - ph / 2));
  panel(px, py, pw, ph, 0.94);
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.font = '12px ' + MONO; ctx.fillStyle = '#e9e2d4';
  ctx.fillText('Bag and equipment', px + pad, py + 20);
  const inv = state.player.inventory;
  let hover = null, hx = 0, hy = 0;
  const slotBox = (x, y, item, on, accent, onClick) => {
    ctx.fillStyle = accent ? 'rgba(255,211,107,0.09)' : 'rgba(255,255,255,0.06)'; ctx.fillRect(x, y, cell - 4, cell - 4);
    ctx.strokeStyle = accent ? 'rgba(255,211,107,0.4)' : 'rgba(233,226,212,0.18)'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, cell - 5, cell - 5);
    const over = mouse.x >= x && mouse.x < x + cell - 4 && mouse.y >= y && mouse.y < y + cell - 4;
    if (over) { ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.strokeRect(x + 0.5, y + 0.5, cell - 5, cell - 5); if (item) { hover = item; hx = x; hy = y; } }
    if (item) {
      drawIcon(item.name, x + 4, y + 4, 28, item);
      if (item.qty > 1) { ctx.font = '10px ' + MONO; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillStyle = '#000'; ctx.fillText(String(item.qty), x + cell - 4, y + cell - 4); ctx.fillStyle = '#fff'; ctx.fillText(String(item.qty), x + cell - 5, y + cell - 5); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; }
    }
    state.uiRects.push({ x, y, w: cell - 4, h: cell - 4, fn: onClick });
  };
  // equipment column
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#b9b09d'; ctx.fillText('Worn', px + pad, py + 40);
  SLOT_ORDER.forEach((slot, k) => {
    const x = px + pad, y = py + 50 + k * (cell + 2);
    slotBox(x, y, state.player.equip[slot], false, false, btn => equipSlotClick(slot, btn));
    ctx.font = '10px ' + MONO; ctx.fillStyle = '#b9b09d'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(SLOT_NAMES[slot], x + cell + 2, y + 16);
  });
  // grid
  const gx = px + pad + eqW, gy = py + 40;
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#b9b09d'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('Hotbar (keys 1-9)', gx, gy - 2);
  for (let i = 0; i < CONFIG.inventory.slots; i++) {
    const r = Math.floor(i / cols), c = i % cols;
    const x = gx + c * cell, y = gy + 8 + r * cell + (r > 0 ? 8 : 0);
    slotBox(x, y, inv[i], false, r === 0, btn => invSlotClick(i, btn));
    if (r === 0) { ctx.font = '9px ' + MONO; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillStyle = 'rgba(255,211,107,0.8)'; ctx.fillText(String(i + 1), x + 3, y + 2); }
  }
  // stats
  const as = armourStats(), p = state.player;
  const sy = py + 198;
  ctx.font = '11px ' + MONO; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#e9e2d4';
  ctx.fillText('Survivor level ' + p.level + '   XP ' + p.xp + '/' + (p.level >= CONFIG.combat.maxLevel ? 'max' : xpNeeded(p.level)), gx, sy);
  ctx.fillText('Dmg resist ' + Math.round(as.dmg * 100) + '%   Rad resist ' + Math.round(as.rad * 100) + '%   Max HP ' + maxHealth(), gx, sy + 18);
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#b9b09d';
  ctx.fillText('Left-click: pick up and put down.', gx, sy + 42);
  ctx.fillText('Right-click: eat, use or equip.', gx, sy + 56);
  ctx.fillText('I or Esc closes. Held items return to the bag.', gx, sy + 70);
  // tooltip
  if (hover && !state.cursor) {
    const lines = [hover.name].concat(itemInfo(hover));
    ctx.font = '10px ' + MONO;
    const tw = Math.max(...lines.map(l => ctx.measureText(l).width)) + 16, th = lines.length * 14 + 10;
    const tx = Math.min(w - tw - 8, hx + 44), ty = Math.max(8, hy - 4);
    panel(tx, ty, tw, th, 0.97);
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    lines.forEach((l, k) => { ctx.fillStyle = k === 0 ? '#ffd36b' : '#e9e2d4'; ctx.fillText(l, tx + 8, ty + 12 + k * 14); });
  }
  if (state.cursor) drawIcon(state.cursor.name, mouse.x - 14, mouse.y - 14, 28, state.cursor);
}

function drawCrafting(w, h) {
  const rowH = 50, visible = 6, pw = 560, tabsH = 30;
  const list = RECIPES.filter(r => r.cat === CRAFT_TABS[state.craftTab]);
  const maxScroll = Math.max(0, list.length - visible);
  state.craftScroll = Math.min(state.craftScroll, maxScroll);
  const ph = 44 + tabsH + visible * rowH + 36;
  const px = Math.round(w / 2 - pw / 2), py = Math.max(8, Math.round(h / 2 - ph / 2));
  panel(px, py, pw, ph, 0.94);
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.font = '12px ' + MONO; ctx.fillStyle = '#e9e2d4'; ctx.fillText('Crafting', px + 14, py + 18);
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#b9b09d'; ctx.textAlign = 'right';
  ctx.fillText('Blueprints found: ' + state.unlocked.size + '/' + Object.keys(BLUEPRINTS).length, px + pw - 14, py + 18);
  const tw = (pw - 20) / CRAFT_TABS.length;
  CRAFT_TABS.forEach((tab, k) => {
    const x = px + 10 + k * tw, y = py + 32, on = k === state.craftTab;
    ctx.fillStyle = on ? 'rgba(255,211,107,0.2)' : 'rgba(255,255,255,0.05)'; ctx.fillRect(x, y, tw - 3, tabsH - 4);
    ctx.strokeStyle = on ? '#ffd36b' : 'rgba(233,226,212,0.2)'; ctx.strokeRect(x + 0.5, y + 0.5, tw - 4, tabsH - 5);
    ctx.font = '11px ' + MONO; ctx.textAlign = 'center'; ctx.fillStyle = on ? '#ffd36b' : '#b9b09d';
    ctx.fillText(tab, x + (tw - 3) / 2, y + (tabsH - 4) / 2);
    state.uiRects.push({ x, y, w: tw - 3, h: tabsH - 4, fn: () => { state.craftTab = k; state.craftScroll = 0; } });
  });
  const top = py + 40 + tabsH;
  list.slice(state.craftScroll, state.craftScroll + visible).forEach((r, k) => {
    const x = px + 10, y = top + k * rowH, rw = pw - 28, rh = rowH - 4;
    const st = recipeStatus(r);
    const locked = !!(r.unlock && !state.unlocked.has(r.unlock));
    const hover = mouse.x >= x && mouse.x < x + rw && mouse.y >= y && mouse.y < y + rh;
    ctx.fillStyle = st.ok ? (hover ? 'rgba(127,255,127,0.22)' : 'rgba(127,255,127,0.11)') : 'rgba(255,255,255,0.045)';
    ctx.fillRect(x, y, rw, rh);
    if (st.ok) { ctx.strokeStyle = 'rgba(127,255,127,0.55)'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, rw - 1, rh - 1); }
    ctx.globalAlpha = locked ? 0.5 : 1;
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x + 6, y + 5, 36, 36);
    if (r.place) {
      const spr = structSprite(r.place), sc = Math.min(32 / spr.width, 32 / spr.height);
      ctx.drawImage(spr, x + 8 + (32 - spr.width * sc) / 2, y + 7 + (32 - spr.height * sc) / 2, spr.width * sc, spr.height * sc);
    } else drawIcon(Object.keys(r.gives)[0], x + 8, y + 7, 32);
    ctx.font = '12px ' + MONO; ctx.textAlign = 'left'; ctx.fillStyle = '#e9e2d4'; ctx.fillText(r.name, x + 52, y + 14);
    ctx.font = '10px ' + MONO; ctx.fillStyle = '#b9b09d'; ctx.textAlign = 'right';
    ctx.fillText(r.station ? STATION_NAMES[r.station] : 'By hand', x + rw - 8, y + 14); ctx.textAlign = 'left';
    let cx = x + 52;
    if (locked) { ctx.fillStyle = '#d6a84a'; ctx.fillText('Locked. ' + st.why + ', found in the ruins.', cx, y + 33); }
    else {
      for (const name of Object.keys(r.cost)) {
        const have = countItem(name), need = r.cost[name], txt = name + ' ' + have + '/' + need + '   ';
        ctx.fillStyle = have >= need ? '#9fdc8f' : '#e07a6a'; ctx.fillText(txt, cx, y + 33); cx += ctx.measureText(txt).width;
      }
      if (!st.ok && st.why !== 'Missing materials') { ctx.fillStyle = '#d6a84a'; ctx.textAlign = 'right'; ctx.fillText(st.why, x + rw - 8, y + 33); ctx.textAlign = 'left'; }
    }
    ctx.globalAlpha = 1;
    state.uiRects.push({ x, y, w: rw, h: rh, fn: () => tryCraft(r) });
  });
  if (list.length > visible) {
    const tx = px + pw - 14, ty = top, th = visible * rowH - 4;
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(tx, ty, 5, th);
    const thumb = Math.max(18, th * visible / list.length);
    ctx.fillStyle = 'rgba(255,211,107,0.6)'; ctx.fillRect(tx, ty + (th - thumb) * (state.craftScroll / maxScroll), 5, thumb);
  }
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#b9b09d'; ctx.textAlign = 'left';
  ctx.fillText('Stand near a station to use its recipes. Scroll the list with the wheel. C or Esc to close.', px + 14, py + ph - 14);
}

