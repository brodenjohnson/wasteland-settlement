/* =====================================================================
   HUD PASS 2: portrait, hearts, maroon panels, speech-bubble toasts, glow
   ===================================================================== */
function panel(x, y, w, h, a) {
  const al = a === undefined ? 0.92 : a;
  ctx.fillStyle = 'rgba(40,22,36,' + al + ')';
  ctx.fillRect(x + 1, y, w - 2, h); ctx.fillRect(x, y + 1, w, h - 2);
  ctx.fillStyle = 'rgba(236,224,196,0.9)';
  ctx.fillRect(x + 1, y, w - 2, 1); ctx.fillRect(x + 1, y + h - 1, w - 2, 1); ctx.fillRect(x, y + 1, 1, h - 2); ctx.fillRect(x + w - 1, y + 1, 1, h - 2);
  ctx.fillStyle = 'rgba(150,84,104,0.55)';
  ctx.fillRect(x + 2, y + 1, w - 4, 1); ctx.fillRect(x + 1, y + 2, 1, h - 4);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(x + 2, y + h - 2, w - 4, 1); ctx.fillRect(x + w - 2, y + 2, 1, h - 4);
}
function rrect(x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function bar(x, y, w, label, val, color, right) {
  const f = Math.max(0, Math.min(1, val / 100));
  ctx.fillStyle = '#1a0e16'; ctx.fillRect(x, y, w, 11);
  ctx.fillStyle = 'rgba(236,224,196,0.55)'; ctx.fillRect(x, y, w, 1); ctx.fillRect(x, y + 10, w, 1); ctx.fillRect(x, y, 1, 11); ctx.fillRect(x + w - 1, y, 1, 11);
  ctx.fillStyle = color; ctx.fillRect(x + 1, y + 1, (w - 2) * f, 9);
  ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.fillRect(x + 1, y + 1, (w - 2) * f, 3);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + 1, y + 8, (w - 2) * f, 2);
  ctx.font = '10px ' + MONO; ctx.textBaseline = 'middle';
  ctx.textAlign = 'left'; ctx.fillStyle = '#000'; ctx.fillText(label, x + 5, y + 6.5); ctx.fillStyle = '#fff6e4'; ctx.fillText(label, x + 4, y + 5.5);
  if (right) { ctx.textAlign = 'right'; ctx.fillStyle = '#000'; ctx.fillText(right, x + w - 3, y + 6.5); ctx.fillStyle = '#fff6e4'; ctx.fillText(right, x + w - 4, y + 5.5); }
}
function drawHeart(x, y, frac) {
  const rows = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];
  const fw = Math.round(7 * frac);
  ctx.fillStyle = '#2a1018';
  for (let r = 0; r < rows.length; r++) for (let q = 0; q < 7; q++) if (rows[r][q] === 'X') {
    ctx.fillRect(x + q * 2 - 1, y + r * 2, 2, 2); ctx.fillRect(x + q * 2 + 1, y + r * 2, 2, 2);
    ctx.fillRect(x + q * 2, y + r * 2 - 1, 2, 2); ctx.fillRect(x + q * 2, y + r * 2 + 1, 2, 2);
  }
  for (let r = 0; r < rows.length; r++) for (let q = 0; q < 7; q++) if (rows[r][q] === 'X') {
    ctx.fillStyle = q < fw ? (r === 1 && q === 1 ? '#ffb0b0' : r >= 4 ? '#b83a3a' : '#e24a4a') : '#4a2a34';
    ctx.fillRect(x + q * 2, y + r * 2, 2, 2);
  }
}
function drawPortrait(x, y, w, h) {
  ctx.fillStyle = '#b8482a'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#e0803c'; ctx.fillRect(x, y, w, Math.floor(h * 0.55));
  ctx.fillStyle = 'rgba(255,230,160,0.25)'; ctx.fillRect(x, y, w, 3);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x, y + h - 6, w, 6);
  const look = armourLook();
  const spr = makeSprite('p|0|0|' + look.sig, 14, 20, c => paintPlayer(c, 0, 0, look));
  ctx.drawImage(spr, 3, 1, 12, 11, x + 4, y + 3, w - 8, Math.round((w - 8) * 11 / 12));
  ctx.strokeStyle = '#2a1018'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
}

function drawProjs() {
  for (const pr of state.projs) {
    const len = Math.hypot(pr.vx, pr.vy) || 1, nx = pr.vx / len, ny = pr.vy / len;
    ctx.fillStyle = pr.hostile ? 'rgba(255,120,80,0.5)' : 'rgba(255,230,140,0.5)';
    ctx.fillRect(Math.round(pr.x - nx * 4), Math.round(pr.y - ny * 4), 2, 2);
    ctx.fillRect(Math.round(pr.x - nx * 7), Math.round(pr.y - ny * 7), 1, 1);
    ctx.fillStyle = pr.hostile ? '#ff8a5a' : '#ffe08a';
    ctx.fillRect(Math.round(pr.x - 1), Math.round(pr.y - 1), 3, 2);
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(pr.x, pr.y, 0, pr.x, pr.y, 11);
    g.addColorStop(0, pr.hostile ? 'rgba(255,110,60,0.55)' : 'rgba(255,220,110,0.6)'); g.addColorStop(1, 'rgba(255,200,80,0)');
    ctx.fillStyle = g; ctx.fillRect(pr.x - 11, pr.y - 11, 22, 22);
    ctx.globalCompositeOperation = 'source-over';
  }
  if (state.muzzle > 0) {
    const p = state.player, mx = p.x + p.aimX * 14, my = p.y - 3 + p.aimY * 14;
    ctx.fillStyle = '#fff2b0'; ctx.fillRect(Math.round(mx - 2), Math.round(my - 2), 4, 4);
    ctx.fillStyle = '#ffb040'; ctx.fillRect(Math.round(p.x + p.aimX * 17 - 1), Math.round(p.y - 3 + p.aimY * 17 - 1), 2, 2);
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(mx, my, 0, mx, my, 26);
    g.addColorStop(0, 'rgba(255,200,90,0.75)'); g.addColorStop(1, 'rgba(255,150,40,0)');
    ctx.fillStyle = g; ctx.fillRect(mx - 26, my - 26, 52, 52);
    ctx.globalCompositeOperation = 'source-over';
  }
}

function drawHUD(label) {
  const w = window.innerWidth, h = window.innerHeight;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const p = state.player;
  state.uiRects = [];

  panel(8, 8, 214, 98);
  drawPortrait(14, 14, 44, 44);
  ctx.font = '10px ' + MONO; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#000'; ctx.fillText('Lv ' + p.level, 37, 71); ctx.fillStyle = '#ffd36b'; ctx.fillText('Lv ' + p.level, 36, 70);
  const mh = maxHealth(), nh = Math.ceil(mh / 20);
  for (let k = 0; k < nh; k++) drawHeart(66 + (k % 8) * 18, 14 + Math.floor(k / 8) * 15, Math.max(0, Math.min(1, (p.health - k * 20) / 20)));
  bar(66, 36, 148, 'Food', p.food, '#f26f21', '');
  bar(66, 49, 148, 'Water', p.water, '#3b82c4', '');
  const rr = state.radRate;
  const zone = rr <= -0.9 ? 'Safe camp' : rr < 0 ? 'Regrowth' : rr >= 0.9 ? 'Hot spot' : rr >= 0.4 ? 'Ruins' : 'Wasteland';
  bar(66, 62, 148, 'Rad', p.radiation, '#7fbf3f', zone + (rr >= 0 ? ' +' : ' ') + rr.toFixed(2));
  const as = armourStats();
  ctx.font = '10px ' + MONO; ctx.textAlign = 'left'; ctx.fillStyle = '#e8dcc0';
  ctx.fillText('dmg -' + Math.round(as.dmg * 100) + '%   rad -' + Math.round(as.rad * 100) + '%   hp ' + Math.ceil(p.health) + '/' + mh, 66, 85);
  const need = xpNeeded(p.level);
  ctx.fillStyle = '#1a0e16'; ctx.fillRect(66, 94, 148, 5);
  ctx.fillStyle = '#ffd36b'; ctx.fillRect(67, 95, 146 * (p.level >= CONFIG.combat.maxLevel ? 1 : p.xp / need), 3);

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
    const tw = ctx.measureText(txt).width + 28;
    panel(Math.round(w / 2 - tw / 2), 8, tw, 22, 0.95);
    ctx.fillStyle = '#ff8a7a'; ctx.fillText(txt, w / 2, 19.5);
  }

  panel(8, h - 84, 352, 72, 0.88);
  ctx.font = '10px ' + MONO; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff6e4'; ctx.fillText(label.length > 54 ? label.slice(0, 53) + '...' : label, 16, h - 73);
  ctx.fillStyle = '#c8b8a0';
  ctx.fillText('WASD move   click use   1-9 or wheel hotbar', 16, h - 59);
  ctx.fillText('I bag   C craft   right-click eat/equip   -/= zoom', 16, h - 46);
  ctx.fillText('Test: T time  U plans  G mats  H gear  N raid', 16, h - 33);
  ctx.fillText('Hold click to harvest, till, plant, water or attack.', 16, h - 20);

  drawHotbar(w, h);

  if (state.msgT > 0) {
    ctx.globalAlpha = Math.min(1, state.msgT);
    ctx.font = '13px ' + MONO;
    const tw = Math.min(w - 40, ctx.measureText(state.msg).width + 34), bx = Math.round(w / 2 - tw / 2), by = h - 120;
    ctx.fillStyle = 'rgba(0,0,0,0.28)'; rrect(bx + 2, by + 3, tw, 28, 7); ctx.fill();
    ctx.fillStyle = '#ebe9df'; rrect(bx, by, tw, 28, 7); ctx.fill();
    ctx.strokeStyle = '#c8c4b4'; ctx.lineWidth = 1; rrect(bx + 0.5, by + 0.5, tw - 1, 27, 7); ctx.stroke();
    ctx.fillStyle = '#ebe9df'; ctx.beginPath(); ctx.moveTo(w / 2 - 6, by + 27); ctx.lineTo(w / 2 + 6, by + 27); ctx.lineTo(w / 2, by + 35); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#34343c'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(state.msg, w / 2, by + 14.5);
    ctx.globalAlpha = 1;
  }
  if (state.sleeping) {
    ctx.font = '18px ' + MONO; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#9fb4ff';
    ctx.fillText('Sleeping...', w / 2, h / 2);
  }
  if (state.invOpen) drawInventory(w, h);
  if (state.craftOpen) drawCrafting(w, h);
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
  drawDecor(camX, camY, vw, vh, state.elapsed);
  drawDrops();
  if (state.corpse) drawCorpse(state.corpse, state.elapsed);

  const mwx = (mouse.x * dpr + transX) / scale, mwy = (mouse.y * dpr + transY) / scale;
  state.mwx = mwx; state.mwy = mwy;
  const ax = mwx - p.x, ay = mwy - (p.y - 3), al = Math.hypot(ax, ay) || 1;
  p.aimX = ax / al; p.aimY = ay / al;

  const playerRow = Math.floor((p.y + 5) / TS);
  for (let ty = ty0; ty <= ty1 + 2; ty++) {
    if (ty <= ty1 + 1 && ty < H) for (let tx = tx0; tx <= tx1; tx++) {
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
  drawGrade();
  if (state.sleeping) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = 'rgba(4,6,16,0.82)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  drawHUD(mi.label);
}

