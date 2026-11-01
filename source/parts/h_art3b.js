/* =====================================================================
   ART PASS 3b: bigger animated characters with visible armour, enemies, decor, water, clouds
   ===================================================================== */
function armourLook() {
  const eq = state.player.equip, look = {};
  for (const k of SLOT_ORDER) look[k] = eq[k] ? eq[k].name : null;
  look.sig = SLOT_ORDER.map(k => look[k] || '-').join(',');
  return look;
}
const AC = n => ARMOUR[n].col;
function overlayHead(c, name, dir, side) {
  const col = AC(name);
  if (name === 'Scrap Helmet') {
    R(c, col, 3, 0, 12, 6); R(c, shade(col, 26), 4, 0, 9, 1); R(c, shade(col, -30), 3, 5, 12, 2); R(c, shade(col, 20), 3, 2, 1, 4);
    if (dir === 0) R(c, '#12100e', 5, 7, 8, 2); else if (side) R(c, '#12100e', 9, 7, 5, 2);
    R(c, '#d8d4c8', 5, 2, 1, 1); R(c, '#d8d4c8', 12, 2, 1, 1); R(c, '#a8532a', 8, 3, 3, 1);
  } else if (name === 'Iron Helm') {
    R(c, col, 3, 0, 12, 7); R(c, shade(col, 38), 4, 0, 5, 2); R(c, shade(col, -32), 3, 6, 12, 1);
    if (dir === 0) { R(c, shade(col, -45), 8, 4, 2, 7); R(c, '#12100e', 5, 7, 3, 1); R(c, '#12100e', 10, 7, 3, 1); }
    else if (side) R(c, '#12100e', 10, 7, 3, 1);
    R(c, '#c0392b', 8, -2, 3, 3); R(c, '#e05a4a', 9, -2, 1, 2);
  } else if (name === 'Hazmat Hood') {
    R(c, col, 3, 0, 12, 11); R(c, shade(col, 26), 4, 0, 8, 2); R(c, shade(col, -34), 3, 9, 12, 2);
    if (dir === 0) { R(c, '#d8f0f6', 5, 4, 8, 3); R(c, '#ffffff', 6, 4, 2, 1); R(c, '#7aa8b4', 5, 6, 8, 1); R(c, '#8a8a90', 7, 8, 4, 3); R(c, '#4a4a50', 8, 9, 2, 1); }
    else if (side) { R(c, '#d8f0f6', 9, 4, 5, 3); R(c, '#ffffff', 10, 4, 1, 1); R(c, '#8a8a90', 12, 8, 3, 3); }
    R(c, '#3a3a3a', 3, 3, 1, 6);
  }
}
function overlayBody(c, name, dir, side) {
  const col = AC(name), tx = side ? 5 : 3, tw = side ? 8 : 12;
  if (name === 'Scrap Vest') {
    R(c, col, tx, 11, tw, 9); R(c, shade(col, 26), tx + 1, 11, Math.max(3, tw / 3 | 0), 4); R(c, shade(col, -26), tx + tw - 5, 15, 4, 4);
    R(c, '#c8b88a', tx + (tw >> 1), 11, 1, 9); R(c, '#3b2a1c', tx + 1, 10, 2, 3); R(c, '#a8532a', tx + tw - 4, 12, 2, 2); R(c, '#2a2420', tx, 19, tw, 1);
  } else if (name === 'Iron Plate') {
    R(c, col, tx, 11, tw, 9); R(c, shade(col, 38), tx + 1, 11, 3, 6); R(c, shade(col, -30), tx + (tw >> 1) - 1, 11, 2, 9); R(c, shade(col, 22), tx, 11, tw, 1);
    R(c, col, tx - 2, 10, 4, 4); R(c, shade(col, 38), tx - 2, 10, 4, 1); R(c, col, tx + tw - 2, 10, 4, 4); R(c, shade(col, 38), tx + tw - 2, 10, 4, 1);
    R(c, '#3b2a1c', tx, 19, tw, 1); R(c, '#d6a84a', tx + (tw >> 1), 19, 2, 1);
  } else if (name === 'Hazmat Suit') {
    R(c, col, tx - 1, 11, tw + 2, 9); R(c, shade(col, 28), tx, 11, tw, 2); R(c, shade(col, -30), tx, 18, tw, 2); R(c, '#222', tx - 1, 15, tw + 2, 1);
    R(c, '#e8d848', tx + 1, 15, 1, 1); R(c, '#e8d848', tx + 4, 15, 1, 1); R(c, shade(col, -30), tx + 2, 12, 3, 3); R(c, '#3a3a3a', tx + 2, 11, 1, 9); R(c, '#3a3a3a', tx + tw - 3, 11, 1, 9);
  }
}
function overlayLeg(c, name, x, w, lift) {
  const col = AC(name);
  if (name === 'Scrap Greaves') { R(c, col, x, 20, w, 4); R(c, shade(col, 24), x, 20, w, 1); R(c, shade(col, -28), x, 24, w, 1); R(c, '#3b2a1c', x, 22, w, 1); R(c, '#a8532a', x + 1, 21, 2, 1); }
  else if (name === 'Iron Greaves') { R(c, col, x, 20, w, 6 - lift); R(c, shade(col, 40), x, 20, w, 1); R(c, shade(col, 40), x + 1, 23, w - 2, 2); R(c, shade(col, -30), x + w - 1, 20, 1, 6 - lift); }
  else if (name === 'Hazmat Pants') { R(c, col, x - 1, 20, w + 2, 6 - lift); R(c, shade(col, 26), x - 1, 20, w + 2, 1); R(c, shade(col, -30), x + w - 1, 21, 1, 5 - lift); R(c, '#222', x - 1, 24, w + 2, 1); }
}
function overlayFoot(c, name, x, w, lift) {
  const col = AC(name), y = 25 - lift;
  if (name === 'Scrap Boots') { R(c, col, x - 1, y, w + 2, 3); R(c, shade(col, 28), x - 1, y, w + 2, 1); R(c, '#c8c8c0', x - 1, y + 1, 2, 1); R(c, '#a8532a', x + w - 1, y + 1, 2, 1); }
  else if (name === 'Iron Boots') { R(c, col, x - 1, y - 2, w + 2, 5); R(c, shade(col, 40), x - 1, y - 2, w + 2, 1); R(c, shade(col, -30), x - 1, y + 2, w + 2, 1); R(c, shade(col, 40), x, y, 2, 1); }
  else if (name === 'Rubber Boots') { R(c, col, x - 1, y - 5, w + 2, 8); R(c, shade(col, 36), x, y - 5, 2, 7); R(c, shade(col, -34), x + w - 1, y - 4, 1, 7); R(c, '#14243a', x - 1, y + 2, w + 2, 1); }
}
function paintPlayer(c, dir, frame, look) {
  c.translate(0, 2);
  const skin = '#e8bc90', skinD = '#c99a72', hair = '#3a2418', hairL = '#5a3a28';
  const jacket = '#4f7a52', jD = shade(jacket, -34), jL = shade(jacket, 22);
  const pants = '#3f4a5e', pD = shade(pants, -28), boots = '#3a2e28';
  const pack = '#d8702a', packD = '#a8501e', packL = '#f09a50', scarf = '#e8c24a';
  const l1 = frame === 1 ? 2 : 0, l3 = frame === 3 ? 2 : 0, a1 = frame === 1 ? 1 : frame === 3 ? -1 : 0;
  const bodyArm = look.body === 'Hazmat Suit' ? AC(look.body) : look.body === 'Iron Plate' ? '#7a828c' : jacket;
  const side = dir >= 2;
  c.save();
  if (dir === 2) { c.translate(18, 0); c.scale(-1, 1); }
  if (!side) {
    R(c, pants, 4, 20, 5, 7 - l1); R(c, pD, 8, 20, 1, 7 - l1); R(c, pants, 10, 20, 5, 7 - l3); R(c, pD, 14, 20, 1, 7 - l3);
    R(c, boots, 3, 26 - l1, 6, 2); R(c, shade(boots, 26), 3, 26 - l1, 6, 1); R(c, boots, 10, 26 - l3, 6, 2); R(c, shade(boots, 26), 10, 26 - l3, 6, 1);
    if (look.legs) { overlayLeg(c, look.legs, 4, 5, l1); overlayLeg(c, look.legs, 10, 5, l3); }
    if (look.feet) { overlayFoot(c, look.feet, 4, 5, l1); overlayFoot(c, look.feet, 10, 5, l3); }
    if (dir === 1) {
      R(c, jacket, 3, 11, 12, 10); R(c, jD, 3, 19, 12, 2);
      R(c, pack, 3, 10, 12, 11); R(c, packL, 3, 10, 12, 1); R(c, packL, 3, 11, 1, 8); R(c, packD, 3, 20, 12, 1); R(c, packD, 14, 11, 1, 9);
      R(c, packD, 4, 14, 10, 1); R(c, '#e8d8b0', 4, 8, 10, 3); R(c, '#c8b88a', 4, 10, 10, 1); R(c, '#3b2a1c', 8, 14, 2, 3); R(c, '#d6a84a', 9, 15, 1, 1);
      R(c, bodyArm, 0, 11, 3, 8 - a1); R(c, shade(bodyArm, -30), 0, 11, 1, 8); R(c, bodyArm, 15, 11, 3, 8 + a1); R(c, shade(bodyArm, -30), 17, 11, 1, 8);
      R(c, skin, 0, 19 - a1, 3, 2); R(c, skin, 15, 19 + a1, 3, 2);
      R(c, scarf, 4, 9, 10, 2);
      R(c, skin, 4, 0, 10, 10); R(c, hair, 4, 0, 10, 10); R(c, hairL, 5, 0, 6, 2); R(c, shade(hair, -20), 4, 7, 10, 3); R(c, skinD, 6, 9, 6, 1);
      if (look.body) overlayBody(c, look.body, 1, false);
    } else {
      R(c, jacket, 3, 11, 12, 10); R(c, jL, 3, 11, 12, 1); R(c, jL, 3, 12, 1, 8); R(c, jD, 14, 12, 1, 8); R(c, jD, 3, 20, 12, 1);
      R(c, jD, 5, 14, 4, 1); R(c, jD, 10, 14, 3, 3); R(c, '#3b2a1c', 3, 18, 12, 1); R(c, '#d6a84a', 8, 18, 2, 1); R(c, jL, 8, 12, 1, 6);
      R(c, packD, 5, 11, 1, 8); R(c, packD, 12, 11, 1, 8); R(c, pack, 15, 12, 2, 5); R(c, pack, 1, 12, 2, 5);
      R(c, bodyArm, 0, 11, 3, 8 + a1); R(c, shade(bodyArm, -30), 0, 11, 1, 8); R(c, bodyArm, 15, 11, 3, 8 - a1); R(c, shade(bodyArm, -30), 17, 11, 1, 8);
      R(c, skin, 0, 19 + a1, 3, 2); R(c, skin, 15, 19 - a1, 3, 2);
      R(c, scarf, 4, 9, 10, 3); R(c, shade(scarf, -50), 4, 11, 10, 1); R(c, shade(scarf, 30), 5, 9, 4, 1);
      R(c, skin, 4, 0, 10, 10); R(c, skinD, 4, 8, 10, 1); R(c, skinD, 6, 9, 6, 1);
      R(c, hair, 4, 0, 10, 4); R(c, hair, 4, 3, 2, 5); R(c, hair, 12, 3, 2, 5); R(c, hairL, 5, 0, 6, 1); R(c, hair, 6, 3, 3, 1); R(c, hair, 10, 3, 2, 1);
      R(c, skin, 3, 5, 1, 2); R(c, skin, 14, 5, 1, 2);
      R(c, '#241810', 6, 5, 2, 2); R(c, '#241810', 11, 5, 2, 2); R(c, '#ffffff', 6, 5, 1, 1); R(c, '#ffffff', 11, 5, 1, 1);
      R(c, hair, 6, 4, 3, 1); R(c, hair, 10, 4, 3, 1); R(c, '#b07a5c', 9, 7, 1, 1); R(c, '#a8604a', 8, 8, 3, 1);
      if (look.body) overlayBody(c, look.body, 0, false);
      if (look.acc === 'Lead Pendant') { R(c, '#b0b0b0', 7, 11, 1, 2); R(c, '#b0b0b0', 11, 11, 1, 2); R(c, AC('Lead Pendant'), 8, 13, 3, 3); R(c, '#e8c24a', 9, 14, 1, 1); }
      if (look.acc === 'Spiked Bracer') { R(c, AC('Spiked Bracer'), 15, 16, 3, 3); R(c, '#e8e8e8', 15, 15, 1, 1); R(c, '#e8e8e8', 17, 15, 1, 1); R(c, '#e8e8e8', 16, 19, 1, 1); }
    }
    if (look.head) overlayHead(c, look.head, dir, false);
  } else {
    R(c, pants, 6 - l1, 20, 5, 7); R(c, pD, 10 - l1, 20, 1, 7); R(c, pants, 8 + l3, 20, 5, 7); R(c, pD, 12 + l3, 20, 1, 7);
    R(c, boots, 6 - l1, 26, 6, 2); R(c, shade(boots, 26), 6 - l1, 26, 6, 1); R(c, boots, 8 + l3, 26, 6, 2); R(c, shade(boots, 26), 8 + l3, 26, 6, 1);
    if (look.legs) { overlayLeg(c, look.legs, 6 - l1, 5, 0); overlayLeg(c, look.legs, 8 + l3, 5, 0); }
    if (look.feet) { overlayFoot(c, look.feet, 6 - l1, 5, 0); overlayFoot(c, look.feet, 8 + l3, 5, 0); }
    R(c, pack, 1, 10, 5, 11); R(c, packL, 1, 10, 5, 1); R(c, packL, 1, 11, 1, 8); R(c, packD, 1, 20, 5, 1); R(c, packD, 3, 14, 3, 1); R(c, '#e8d8b0', 1, 8, 5, 3); R(c, '#c8b88a', 1, 10, 5, 1);
    R(c, jacket, 5, 11, 8, 10); R(c, jL, 5, 11, 8, 1); R(c, jD, 12, 12, 1, 8); R(c, jD, 5, 20, 8, 1); R(c, '#3b2a1c', 5, 18, 8, 1); R(c, '#d6a84a', 11, 18, 1, 1); R(c, jD, 7, 14, 3, 3);
    if (look.body) overlayBody(c, look.body, 2, true);
    R(c, bodyArm, 8, 11 - a1, 3, 8); R(c, shade(bodyArm, -30), 8, 11, 1, 8); R(c, skin, 8, 19, 3, 2);
    if (look.acc === 'Spiked Bracer') { R(c, AC('Spiked Bracer'), 8, 16, 3, 3); R(c, '#e8e8e8', 8, 15, 1, 1); R(c, '#e8e8e8', 10, 15, 1, 1); }
    R(c, scarf, 5, 9, 8, 3); R(c, shade(scarf, -50), 5, 11, 8, 1); R(c, shade(scarf, 30), 6, 9, 3, 1);
    R(c, skin, 4, 0, 10, 10); R(c, skinD, 4, 8, 10, 1);
    R(c, hair, 4, 0, 8, 4); R(c, hair, 4, 3, 4, 6); R(c, hairL, 5, 0, 5, 1); R(c, hair, 10, 2, 3, 2);
    R(c, '#241810', 11, 5, 2, 2); R(c, '#ffffff', 11, 5, 1, 1); R(c, hair, 10, 4, 3, 1); R(c, skinD, 14, 6, 1, 1); R(c, '#a8604a', 11, 8, 2, 1);
    if (look.head) overlayHead(c, look.head, 2, true);
  }
  c.restore();
}

function drawHeld(p, dir, bob, behind) {
  const sel = selItem();
  if (!sel) return;
  const k = iconKind(sel.name);
  if (!['axe', 'pickaxe', 'hoe', 'can', 'melee', 'pistol'].includes(k)) return;
  if ((dir === 1) !== behind) return;
  const spr = makeSprite('h|' + sel.name, 16, 16, g => iconTo(g, sel.name, 0, 0, 16, null));
  const ax = p.aimX, ay = p.aimY;
  let hx = p.x + (dir === 3 ? 5 : dir === 2 ? -5 : dir === 1 ? -6 : 6), hy = p.y - 6 + bob;
  const gun = k === 'pistol';
  let rot = Math.atan2(ay, ax) + (gun ? 0 : Math.PI / 2);
  if (state.swing && !gun) {
    const pr = Math.min(1, state.swing.t / state.swing.dur);
    rot += (pr - 0.5) * 2.4; hx += ax * Math.sin(pr * Math.PI) * 5; hy += ay * Math.sin(pr * Math.PI) * 5;
  }
  ctx.save();
  ctx.translate(Math.round(hx), Math.round(hy));
  ctx.rotate(rot);
  if (gun && ax < 0) ctx.scale(1, -1);
  if (gun) ctx.drawImage(spr, -4, -9); else ctx.drawImage(spr, -9, -17);
  ctx.restore();
}
function drawPlayer(p) {
  const dir = iconDir(p), frame = p.moving ? Math.floor(p.walkT * 8) % 4 : 0;
  const look = armourLook();
  const key = 'P|' + dir + '|' + frame + '|' + look.sig;
  const spr = makeSprite(key, 18, 30, c => paintPlayer(c, dir, frame, look));
  const walkBob = (p.moving && (frame === 1 || frame === 3)) ? -1 : 0;
  const idleBob = !p.moving && Math.floor(state.elapsed * 1.6) % 2 === 1 ? 1 : 0;
  let ox = 0, oy = 0;
  if (state.swing) { const pr = Math.min(1, state.swing.t / state.swing.dur), a = Math.sin(pr * Math.PI) * 2; ox = p.aimX * a; oy = p.aimY * a; }
  shadowAt(p.x, p.y + 6, 14);
  drawHeld(p, dir, walkBob, true);
  if (state.iframes > 0 && Math.floor(state.elapsed * 20) % 2 === 0) ctx.globalAlpha = 0.45;
  drawFlipped(spr, p.x + ox, p.y + 7 + walkBob + oy, false);
  ctx.globalAlpha = 1;
  if (state.hurtT > 0) { ctx.globalAlpha = state.hurtT * 2.4; drawFlipped(whiteSprite(key, spr), p.x + ox, p.y + 7 + walkBob + oy, false); ctx.globalAlpha = 1; }
  if (idleBob) { /* breathing: handled by the 1px shift below */ }
  drawHeld(p, dir, walkBob, false);
}

/* ---------- Enemies, larger and more detailed ---------- */
function paintHuman2(c, f, o) {
  c.translate(0, 2);
  const l = f ? 2 : 0, bw = o.bulk ? 2 : 0, hy = o.hunch ? 3 : 1;
  R(c, o.legs, 4, 20, 4, 7 - l); R(c, shade(o.legs, -26), 7, 20, 1, 7 - l); R(c, o.legs, 10, 20, 4, 5 + l); R(c, shade(o.legs, -26), 13, 20, 1, 5 + l);
  R(c, o.boots || '#2a2420', 3, 27 - l, 5, 2); R(c, o.boots || '#2a2420', 10, 25 + l, 5, 2);
  R(c, o.body, 3 - bw, 10 + hy, 12 + bw * 2, 10 - hy + 1); R(c, shade(o.body, 20), 3 - bw, 10 + hy, 12 + bw * 2, 1); R(c, shade(o.body, -30), 3 - bw, 19, 12 + bw * 2, 2); R(c, shade(o.body, -24), 14 + bw, 11 + hy, 1, 8);
  R(c, shade(o.body, -18), 0 - bw, 11 + hy, 3, 8); R(c, shade(o.body, -18), 15 + bw, 11 + hy, 3, 8);
  R(c, o.skin, 0 - bw, 19 + hy - 1, 3, 2); R(c, o.skin, 15 + bw, 19 + hy - 1, 3, 2);
  R(c, o.skin, 5, hy, 9, 9); R(c, shade(o.skin, -26), 5, hy + 7, 9, 2);
  if (o.hair) { R(c, o.hair, 5, hy, 9, 3); R(c, shade(o.hair, 24), 6, hy, 5, 1); }
  if (o.hood) { R(c, o.hood, 4, hy - 1, 11, 6); R(c, shade(o.hood, -30), 4, hy + 4, 11, 1); R(c, shade(o.hood, 22), 5, hy - 1, 6, 1); R(c, o.hood, 4, hy + 4, 2, 5); R(c, o.hood, 13, hy + 4, 2, 5); }
  if (o.plate) { R(c, o.plate, 1 - bw, 10 + hy, 5, 4); R(c, o.plate, 12 + bw, 10 + hy, 5, 4); R(c, shade(o.plate, 36), 1 - bw, 10 + hy, 5, 1); R(c, shade(o.plate, 36), 12 + bw, 10 + hy, 5, 1); R(c, shade(o.plate, -30), 1 - bw, 13 + hy, 5, 1); }
  if (o.accent) { R(c, o.accent, 5, hy + 2, 9, 2); R(c, shade(o.accent, -40), 5, hy + 3, 9, 1); R(c, o.accent, 14, hy + 3, 2, 3); }
  if (o.mask) { R(c, o.mask, 6, hy + 6, 7, 3); R(c, '#14120f', 8, hy + 7, 3, 1); }
  if (o.ribs) { for (let k = 0; k < 4; k++) R(c, o.ribs, 5, 12 + hy + k * 2, 8, 1); R(c, shade(o.body, -40), 3 - bw, 13 + hy, 2, 6); }
  R(c, o.eye, 7, hy + 4, 2, 2); R(c, o.eye, 11, hy + 4, 2, 2);
  if (o.glow) { R(c, o.glow, 7, hy + 4, 2, 2); R(c, o.glow, 11, hy + 4, 2, 2); R(c, '#ffffff', 8, hy + 4, 1, 1); R(c, '#ffffff', 12, hy + 4, 1, 1); }
  if (o.gun) { R(c, '#2a2a30', 12, 14 + hy, 8, 3); R(c, '#6a6a74', 17, 13 + hy, 3, 2); R(c, '#3b2a1c', 12, 17 + hy, 3, 3); R(c, '#8a8a94', 13, 14 + hy, 5, 1); }
  if (o.club) { R(c, '#6b4a2b', 16, 8 + hy, 2, 12); R(c, '#8a8d94', 15, 4 + hy, 4, 5); R(c, '#c8c8d0', 15, 4 + hy, 4, 1); R(c, '#a8532a', 16, 6 + hy, 2, 1); }
  if (o.rags) { R(c, o.rags, 3 - bw, 19, 4, 5); R(c, o.rags, 11 + bw, 19, 4, 4); }
}
function paintGlowrat(c, f) {
  c.translate(0, 1);
  const lg = f ? 1 : 0;
  R(c, '#8a6a6a', 0, 6, 4, 1); R(c, '#8a6a6a', 0, 5 + lg, 2, 1); R(c, '#b08888', 0, 4 + lg, 1, 2);
  R(c, '#4e5c60', 3, 3, 10, 6); R(c, '#6a7a7e', 3, 3, 10, 1); R(c, '#7a8a8e', 4, 8, 8, 1); R(c, '#3e4a4e', 3, 7, 3, 2);
  R(c, '#4e5c60', 12, 3, 5, 5); R(c, '#8a6a6a', 12, 1, 2, 2); R(c, '#b08888', 12, 1, 1, 1); R(c, '#d88a8a', 17, 6, 1, 1); R(c, '#e8e0d0', 15, 8, 1, 1);
  R(c, '#b6e85a', 14, 4, 2, 2); R(c, '#ffffff', 14, 4, 1, 1); R(c, '#8fd04a', 5, 4, 2, 1); R(c, '#8fd04a', 9, 5, 1, 2); R(c, '#8fd04a', 7, 3, 1, 1);
  R(c, '#2e3a3e', 4 + lg, 9, 3, 2); R(c, '#2e3a3e', 10 - lg, 9, 3, 2);
}
function paintHound(c, f) {
  c.translate(0, 1);
  const lg = f ? 2 : 0;
  R(c, '#7a756f', 0, 4, 5, 2); R(c, '#7a756f', 1, 2 + (lg ? 1 : 0), 3, 2); R(c, '#5a5652', 0, 5, 3, 1);
  R(c, '#5a5652', 4, 5, 15, 4); R(c, '#7a756f', 4, 8, 15, 5); R(c, '#8a857f', 5, 8, 12, 1); R(c, '#4a4642', 4, 12, 15, 1);
  for (let k = 0; k < 5; k++) R(c, '#5a5652', 7 + k * 2, 5, 1, 2);
  R(c, '#7a756f', 18, 3, 7, 7); R(c, '#3e3b38', 18, 1, 3, 3); R(c, '#5a5652', 22, 7, 4, 3); R(c, '#14120f', 25, 7, 1, 2);
  R(c, '#d83a2a', 21, 4, 2, 2); R(c, '#ff9a7a', 21, 4, 1, 1); R(c, '#e8e0d0', 22, 10, 1, 2); R(c, '#e8e0d0', 24, 10, 1, 1);
  R(c, '#5a5652', 5 + lg, 13, 3, 4); R(c, '#5a5652', 9 - lg, 13, 3, 4); R(c, '#5a5652', 15 + lg, 13, 3, 4); R(c, '#5a5652', 19 - lg, 13, 3, 4);
  R(c, '#d8d4c8', 5 + lg, 16, 3, 1); R(c, '#d8d4c8', 15 + lg, 16, 3, 1);
}
const ENEMY_SPR = {
  glowrat: { w: 19, h: 13, paint: paintGlowrat },
  hound: { w: 27, h: 18, paint: paintHound },
  husk: { w: 22, h: 34, paint: (c, f) => paintHuman2(c, f, { legs: '#4a4a40', body: '#8a9078', skin: '#a3b08a', eye: '#20160f', glow: '#b6e85a', ribs: '#dcdcc4', hunch: true, bulk: true, rags: '#5a5a48' }) },
  scrapper: { w: 22, h: 31, paint: (c, f) => paintHuman2(c, f, { legs: '#4a3a2a', body: '#6a4a3a', skin: '#c9a07a', eye: '#20160f', hair: '#2a1d14', accent: '#c0392b', plate: '#8a8d94', club: true }) },
  gunner: { w: 22, h: 31, paint: (c, f) => paintHuman2(c, f, { legs: '#2f3a2f', body: '#4a5a4a', skin: '#c9a07a', eye: '#20160f', hood: '#3a4a3a', accent: '#d6a84a', mask: '#5a5a62', gun: true }) }
};
function drawEnemy(e) {
  if (e.hidden) return;
  const d = ENEMY_TYPES[e.type], spec = ENEMY_SPR[e.type];
  const frame = Math.floor(e.walkT * 6) % 2;
  const key = 'E|' + e.type + '|' + frame;
  let spr = makeSprite(key, spec.w, spec.h, c => spec.paint(c, frame));
  if (e.flash > 0) spr = whiteSprite(key, spr);
  const lunge = e.lunge > 0 ? Math.sin((e.lunge / 0.2) * Math.PI) * 4 * e.dirx : 0;
  const bob = Math.floor(e.walkT * 6) % 2 && e.type !== 'hound' ? -1 : 0;
  const bottom = e.y + d.size / 2 + 2;
  shadowAt(e.x, bottom - 1, d.size + 8);
  drawFlipped(spr, e.x + lunge, bottom + bob, e.dirx < 0);
  if (e.hp < e.maxHp) {
    const bw = Math.max(12, d.size + 6), x = Math.round(e.x - bw / 2), y = Math.round(bottom - spec.h - 4);
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(x - 1, y - 1, bw + 2, 4);
    ctx.fillStyle = '#e8503a'; ctx.fillRect(x, y, Math.max(0, bw * e.hp / e.maxHp), 2);
  }
  if (e.type === 'husk') {
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(e.x, bottom - spec.h + 8, 0, e.x, bottom - spec.h + 8, 14);
    g.addColorStop(0, 'rgba(160,230,60,0.28)'); g.addColorStop(1, 'rgba(160,230,60,0)');
    ctx.fillStyle = g; ctx.fillRect(e.x - 14, bottom - spec.h - 6, 28, 28);
    ctx.globalCompositeOperation = 'source-over';
  }
}

/* ---------- Decor: forest floor, furniture, reeds and lily pads ---------- */
function paintTable(c) { R(c, '#4a3320', 1, 7, 2, 5); R(c, '#4a3320', 11, 7, 2, 5); R(c, '#8a5a2b', 0, 3, 14, 5); R(c, '#a87a45', 0, 3, 14, 1); R(c, '#6b4220', 0, 7, 14, 1); R(c, '#d8cdb5', 3, 4, 3, 2); R(c, '#8a8d94', 9, 4, 3, 2); }
function paintShelf(c) { R(c, '#4a3320', 0, 0, 14, 16); R(c, '#6b4a2b', 1, 1, 12, 14); for (let k = 0; k < 3; k++) { R(c, '#3a2816', 1, 4 + k * 5, 12, 1); } R(c, '#c0392b', 2, 1, 3, 3); R(c, '#d6a84a', 6, 2, 3, 2); R(c, '#4a6a8a', 10, 1, 2, 3); R(c, '#8a8d94', 2, 6, 4, 3); R(c, '#e8e0d0', 8, 7, 4, 2); R(c, '#6a8a4a', 3, 11, 3, 3); R(c, '#a8532a', 8, 11, 4, 3); }
function paintBed(c) { R(c, '#4a3320', 0, 6, 16, 4); R(c, '#7a8a9a', 1, 2, 14, 6); R(c, '#9aaabb', 1, 2, 14, 2); R(c, '#e8e0d0', 1, 2, 4, 4); R(c, '#5a6a7a', 6, 5, 9, 3); R(c, '#3a2816', 0, 9, 2, 2); R(c, '#3a2816', 14, 9, 2, 2); }
function paintSack(c) { R(c, '#8a7a5a', 1, 2, 7, 6); R(c, '#a8987a', 1, 2, 7, 2); R(c, '#6a5a3a', 1, 7, 7, 1); R(c, '#5a4a2a', 3, 1, 3, 2); }
function paintLog(c) { R(c, '#4a3320', 0, 2, 18, 6); R(c, '#6b4a2b', 0, 2, 18, 2); R(c, '#2c1e14', 0, 6, 18, 2); R(c, '#c8a070', 0, 3, 2, 4); R(c, '#8a6a48', 1, 4, 1, 2); R(c, '#4f8a3a', 5, 1, 5, 2); R(c, '#6fae4a', 6, 1, 2, 1); R(c, '#d8cdb5', 12, 1, 3, 1); }
function paintMushroom(c, v) { const cols = ['#c0392b', '#d6a84a', '#8a6aaa']; R(c, '#e8e0d0', 2, 3, 2, 3); R(c, cols[v % 3], 0, 1, 6, 3); R(c, shade(cols[v % 3], 40), 1, 1, 2, 1); R(c, '#fff', 4, 2, 1, 1); }
function paintReed(c, v, fr) { const s = fr ? 1 : 0; R(c, '#5a7a3a', 1, 2, 1, 8); R(c, '#7a9a4a', 1 + s, 0, 1, 3); R(c, '#5a7a3a', 3, 3, 1, 7); R(c, '#7a9a4a', 3 + s, 1, 1, 3); R(c, '#5a3a22', 3 + s, 0, 1, 2); R(c, '#5a7a3a', 5, 4, 1, 6); R(c, '#7a9a4a', 5 + s, 2, 1, 3); }
function paintLily(c, v, fr) { R(c, '#2f6a3c', 1, 2, 6, 3); R(c, '#4f9a4a', 1, 2, 5, 2); R(c, '#14301e', 4, 3, 3, 1); if (v === 0) { R(c, '#f0a0c0', 3, 0 + fr, 2, 2); R(c, '#fff0f4', 3, 0 + fr, 1, 1); } }
function paintBones(c) { R(c, '#d8cdb5', 1, 3, 8, 1); R(c, '#bfb59c', 2, 4, 6, 1); R(c, '#e8dfc8', 0, 2, 2, 2); R(c, '#e8dfc8', 8, 2, 2, 2); R(c, '#d8cdb5', 4, 0, 1, 3); R(c, '#e8dfc8', 5, 1, 3, 3); R(c, '#14120f', 6, 2, 1, 1); }
Object.assign(DECOR_SPR, {
  table: { w: 14, h: 12, nv: 1, outline: true, paint: paintTable }, shelf: { w: 14, h: 16, nv: 1, outline: true, paint: paintShelf },
  bed: { w: 16, h: 11, nv: 1, outline: true, paint: paintBed }, sack: { w: 8, h: 8, nv: 1, outline: true, paint: paintSack },
  log: { w: 18, h: 8, nv: 1, outline: true, paint: paintLog }, mushroom: { w: 6, h: 6, nv: 3, outline: true, paint: paintMushroom },
  reed: { w: 7, h: 10, nv: 1, anim: true, outline: false, paint: paintReed }, lily: { w: 8, h: 6, nv: 2, anim: true, outline: false, paint: paintLily },
  bones: { w: 10, h: 6, nv: 1, outline: true, paint: paintBones }
});
const shafts = [];
function makeDecor() {
  decor.length = 0; shafts.length = 0;
  const nearRuin = (tx, ty) => ruins.some(r => tx >= r.x0 - 3 && tx <= r.x0 + r.w + 2 && ty >= r.y0 - 3 && ty <= r.y0 + r.h + 2);
  const waterNear = (tx, ty) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const t = tiles[(ty + dy) * W + tx + dx]; if (t === T.WATER) return true; } return false; };
  for (let ty = 2; ty < H - 2; ty++) for (let tx = 2; tx < W - 2; tx++) {
    const i = ty * W + tx, t = tiles[i], z = zoneMap[i];
    const r = hash2(tx, ty, 51), r2 = hash2(tx, ty, 52), r3 = hash2(tx, ty, 53), r4 = hash2(tx, ty, 54);
    const x = tx * TS + 4 + Math.floor(r2 * 8), y = ty * TS + 8 + Math.floor(r3 * 8);
    let kind = null;
    if (t === T.WATER && waterDepth && waterDepth[i] <= 1 && r < 0.14) { decor.push({ kind: 'lily', x: tx * TS + 8, y: ty * TS + 11, v: r4 < 0.4 ? 0 : 1, ph: r2 * 6 }); continue; }
    if (objs[i] || structs.has(i) || t === T.WATER || t === T.SPRING || t === T.RUBBLE || t === T.CLIFF || t === T.FLOOR) continue;
    if (t === T.GRASS) {
      if (z === 2) kind = r < 0.8 ? 'grass' : r < 0.9 ? 'fern' : r < 0.93 ? 'log' : r < 0.96 ? 'mushroom' : 'flower';
      else kind = r < 0.7 ? 'grass' : r < 0.8 ? 'fern' : r < 0.88 ? 'flower' : null;
      if (waterNear(tx, ty) && r < 0.5) kind = 'reed';
      if (kind === 'grass' && z === 2 && r2 < 0.4) decor.push({ kind: 'fern', x: x + 3, y: y - 2, v: 0, ph: r * 9 });
    } else if (t === T.GROUND && radMap[i] > -0.9) {
      const near = nearRuin(tx, ty);
      kind = r < 0.17 ? 'dry' : r < (near ? 0.205 : 0.182) ? 'debris' : r < (near ? 0.217 : 0.185) ? 'barrel' : r < (near ? 0.227 : 0.187) ? 'tyre' : r < (near ? 0.232 : 0.188) ? 'sign' : r < (near ? 0.236 : 0.1895) ? 'bones' : null;
      if (waterNear(tx, ty) && r < 0.4) kind = 'reed';
    } else if (t === T.ASH) kind = r < 0.1 ? 'dry' : r < 0.125 ? 'bones' : r < 0.14 ? 'debris' : null;
    else if (t === T.ROAD) kind = r < 0.05 ? 'debris' : r < 0.07 ? 'tyre' : null;
    else if (t === T.DIRT && radMap[i] <= -0.9) kind = r < 0.025 ? 'dry' : null;
    if (kind) decor.push({ kind, x, y, v: Math.floor(r4 * 3), ph: r2 * 6 });
    if (z === 2 && t === T.GRASS && hash2(tx >> 2, ty >> 2, 71) > 0.78 && (tx & 3) === 0 && (ty & 3) === 0) shafts.push({ x: tx * TS, y: ty * TS - 20, ph: r * 6 });
  }
  const props = { house: ['table', 'bed', 'shelf', 'sack'], cabin: ['bed', 'table', 'shelf', 'sack'], hut: ['bed', 'sack', 'sack'], shack: ['bed', 'sack', 'barrel'], office: ['table', 'shelf', 'shelf', 'sack'],
    bunker: ['shelf', 'shelf', 'sack', 'barrel'], armoury: ['shelf', 'shelf', 'shelf', 'table'], outpost: ['table', 'sack', 'barrel'], shed: ['sack', 'barrel', 'tyre'], pump: ['barrel', 'barrel', 'tyre'] };
  for (const rn of ruins) {
    const list = props[rn.kind] || ['sack'];
    list.forEach((kind, n) => {
      for (let t = 0; t < 40; t++) {
        const x = rn.x0 + 1 + Math.floor(hash2(rn.x0 + n, rn.y0, 90 + t) * (rn.w - 2)), y = rn.y0 + 1 + Math.floor(hash2(rn.y0 + n, rn.x0, 120 + t) * (rn.h - 2));
        const i = y * W + x;
        if (tiles[i] === T.FLOOR && !objs[i]) { decor.push({ kind, x: x * TS + 8, y: y * TS + 14, v: 0, ph: 0 }); break; }
      }
    });
  }
}
function drawDecor(camX, camY, vw, vh, time) {
  for (const d of decor) {
    if (d.x < camX - 20 || d.x > camX + vw + 20 || d.y < camY - 4 || d.y > camY + vh + 24) continue;
    const sp = DECOR_SPR[d.kind];
    const fr = sp.anim ? Math.floor(time * 1.3 + d.ph) % 2 : 0;
    const spr = decorSprite(d.kind, d.v % sp.nv, fr);
    if (sp.outline && d.kind !== 'bones' && d.kind !== 'mushroom') shadowAt(d.x, d.y - 1, sp.w - 2);
    ctx.drawImage(spr, d.x - Math.round(spr.width / 2), d.y - spr.height + 1);
  }
}

/* ---------- Water that looks like water ---------- */
function drawGroundOverlay(tx, ty, time) {
  const i = ty * W + tx, t = tiles[i], x = tx * TS, y = ty * TS;
  if (t === T.WATER || t === T.SPRING) {
    const ph = time * 0.9 + tx * 1.7 + ty * 2.3, dp = waterDepth ? waterDepth[i] : 1;
    const hi = t === T.WATER ? '200,255,140' : '255,255,255';
    for (let k = 0; k < 3; k++) {
      const wx = Math.round(((Math.sin(ph + k * 2.1) + 1) / 2) * 9) + 2, wy = 3 + k * 5 + Math.round(Math.sin(ph * 1.3 + k));
      ctx.fillStyle = 'rgba(' + hi + ',' + (0.14 + 0.06 * (3 - dp) / 3) + ')'; ctx.fillRect(x + wx, y + wy, 3 + k, 1);
    }
    if (hash2(tx * 7 + Math.floor(time * 3), ty, 55) > 0.93) { ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fillRect(x + 2 + Math.floor(hash2(tx, ty + Math.floor(time * 3), 56) * 11), y + 3 + Math.floor(hash2(ty, tx, 57) * 9), 1, 1); }
    ctx.fillStyle = t === T.WATER ? 'rgba(210,255,150,0.34)' : 'rgba(255,255,255,0.42)';
    const wat = k => k === T.WATER || k === T.SPRING;
    if (ty > 0 && !wat(tiles[i - W])) { ctx.fillRect(x, y, TS, 1); ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(x, y + 1, TS, 1); ctx.fillStyle = t === T.WATER ? 'rgba(210,255,150,0.34)' : 'rgba(255,255,255,0.42)'; }
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
  if ((t === T.GROUND || t === T.ASH) && rr >= 0.85) {
    ctx.fillStyle = 'rgba(170,230,60,' + (0.05 + (rr - 0.85) * 0.2 + 0.05 * Math.sin(time * 3 + tx + ty)) + ')';
    ctx.fillRect(x, y, TS, TS);
    if (hash2(tx, ty, 41) < 0.12) { const a = (Math.floor(time * 2) + tx) % 2; ctx.fillStyle = 'rgba(210,255,120,0.55)'; ctx.fillRect(x + 3 + a * 6, y + 5 + a * 3, 1, 1); }
  } else if ((t === T.GROUND || t === T.FLOOR) && rr >= 0.4) {
    ctx.fillStyle = 'rgba(150,170,60,0.07)'; ctx.fillRect(x, y, TS, TS);
  }
  if (rr <= -0.9 && ((tx + ty) & 1) === 0) {
    ctx.fillStyle = 'rgba(127,224,192,0.3)';
    if (tx + 1 < W && radMap[i + 1] > -0.9) ctx.fillRect(x + TS - 1, y + 2, 1, 12);
    if (tx > 0 && radMap[i - 1] > -0.9) ctx.fillRect(x, y + 2, 1, 12);
    if (ty + 1 < H && radMap[i + W] > -0.9) ctx.fillRect(x + 2, y + TS - 1, 12, 1);
    if (ty > 0 && radMap[i - W] > -0.9) ctx.fillRect(x + 2, y, 12, 1);
  }
  const cr = crops.get(i);
  if (cr) drawCrop(cr, tx, ty);
}

/* ---------- Drifting cloud shadows and forest light shafts ---------- */
let cloudCv = null, shaftCv = null;
function buildClouds() {
  const S = 256;
  cloudCv = document.createElement('canvas'); cloudCv.width = S; cloudCv.height = S;
  const g = cloudCv.getContext('2d');
  const pn = (x, y, s, P) => {
    const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
    const hh = (a, b) => hash2(((a % P) + P) % P, ((b % P) + P) % P, s);
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const a = hh(x0, y0), b = hh(x0 + 1, y0), c = hh(x0, y0 + 1), d = hh(x0 + 1, y0 + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
  for (let py = 0; py < S; py++) for (let px = 0; px < S; px++) {
    const n = pn(px / 32, py / 32, 12, 8) * 0.7 + pn(px / 16, py / 16, 13, 16) * 0.3;
    if (n > 0.57 + bay(px, py) * 0.09 - 0.045) { g.fillStyle = 'rgba(16,28,44,0.3)'; g.fillRect(px, py, 1, 1); }
  }
  shaftCv = document.createElement('canvas'); shaftCv.width = 28; shaftCv.height = 64;
  const s = shaftCv.getContext('2d');
  for (let y = 0; y < 64; y++) for (let x = 0; x < 28; x++) {
    const cx = 6 + y * 0.28, dx = Math.abs(x - cx), a = Math.max(0, 1 - dx / 6) * (1 - Math.abs(y - 32) / 40);
    if (a > 0.05 && bay(x, y) < a) { s.fillStyle = 'rgba(255,236,160,' + (0.5 * a) + ')'; s.fillRect(x, y, 1, 1); }
  }
}
function drawClouds(camX, camY, vw, vh, time) {
  if (!cloudCv) buildClouds();
  const dk = darkness(clockHour());
  ctx.globalAlpha = Math.max(0, 1 - dk * 1.1);
  if (ctx.globalAlpha > 0.02) {
    const ox = (time * 4.5) % 256, oy = (time * 1.8) % 256;
    for (let y = Math.floor((camY - oy) / 256) * 256 + oy; y < camY + vh; y += 256) for (let x = Math.floor((camX - ox) / 256) * 256 + ox; x < camX + vw; x += 256) ctx.drawImage(cloudCv, Math.round(x), Math.round(y));
  }
  ctx.globalAlpha = 1;
}
function drawShafts(camX, camY, vw, vh, time) {
  if (!shaftCv) buildClouds();
  const dk = darkness(clockHour());
  if (dk > 0.6) return;
  ctx.globalCompositeOperation = 'lighter';
  for (const s of shafts) {
    if (s.x < camX - 30 || s.x > camX + vw + 10 || s.y < camY - 70 || s.y > camY + vh + 10) continue;
    ctx.globalAlpha = (0.55 + 0.25 * Math.sin(time * 0.7 + s.ph)) * (1 - dk * 1.4);
    ctx.drawImage(shaftCv, Math.round(s.x), Math.round(s.y));
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
}

