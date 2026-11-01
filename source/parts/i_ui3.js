/* =====================================================================
   UI 3: item tiers and stats, tooltips with comparisons, map, banner, render
   ===================================================================== */
const TIER_COL = ['#9a948a', '#6fbf5f', '#5aa0e8', '#b070e8'];
const TIER_NAME = ['Junk', 'Scrap grade', 'Iron grade', 'Rare'];
const ITEM_TIER = {
  'Rusty Pipe': 0, 'Scrap Machete': 1, 'Iron Cleaver': 2, 'Scrap Pistol': 2,
  'Scrap Helmet': 1, 'Scrap Vest': 1, 'Scrap Greaves': 1, 'Scrap Boots': 1, 'Spiked Bracer': 1,
  'Iron Helm': 2, 'Iron Plate': 2, 'Iron Greaves': 2, 'Iron Boots': 2, 'Lead Pendant': 2,
  'Hazmat Hood': 2, 'Hazmat Suit': 2, 'Hazmat Pants': 2, 'Rubber Boots': 1,
  'Scrap Axe': 1, 'Scrap Pickaxe': 1, 'Iron Axe': 2, 'Iron Pickaxe': 2, 'Hoe': 1, 'Watering Can': 1
};
function tierOf(name) { return ITEM_TIER[name] !== undefined ? ITEM_TIER[name] : -1; }
function statRows(name) {
  const rows = [], w = WEAPONS[name], a = ARMOUR[name], ti = TOOL_ITEMS[name];
  if (w) {
    rows.push({ k: 'Damage', v: w.dmg, max: 40, fmt: v => String(v) });
    rows.push({ k: 'Speed', v: 1 / w.cd, max: 3, fmt: v => v.toFixed(1) + '/s' });
    rows.push(w.kind === 'gun' ? { k: 'Range', v: w.range, max: 200, fmt: v => String(v) } : { k: 'Reach', v: w.reach, max: 30, fmt: v => String(v) });
  } else if (a) {
    rows.push({ k: 'Defence', v: a.dmg * 100, max: 20, fmt: v => Math.round(v) + '%' });
    rows.push({ k: 'Rad shield', v: a.rad * 100, max: 30, fmt: v => Math.round(v) + '%' });
  } else if (ti && (ti.type === 'axe' || ti.type === 'pickaxe')) {
    rows.push({ k: 'Power', v: CONFIG.tools.power[ti.tier], max: 100, fmt: v => String(v) });
    rows.push({ k: 'Speed', v: 1 / CONFIG.tools.cooldown[ti.tier], max: 3.5, fmt: v => v.toFixed(1) + '/s' });
  } else if (name === 'Watering Can') rows.push({ k: 'Capacity', v: CONFIG.farm.canCapacity, max: 40, fmt: v => String(v) });
  return rows;
}
function compareBase(name) {
  const p = state.player, w = WEAPONS[name], a = ARMOUR[name], ti = TOOL_ITEMS[name];
  if (a) { const eq = p.equip[a.slot]; return eq && eq.name !== name ? eq.name : null; }
  const sel = selItem();
  if (!sel || sel.name === name) return null;
  if (w && WEAPONS[sel.name] && WEAPONS[sel.name].kind === w.kind) return sel.name;
  if (ti && TOOL_ITEMS[sel.name] && TOOL_ITEMS[sel.name].type === ti.type) return sel.name;
  return null;
}
function itemInfo(it) {
  const n = it.name, lines = [];
  if (WEAPONS[n]) lines.push(WEAPONS[n].kind === 'gun' ? 'Pistol. Uses ' + WEAPONS[n].ammo.toLowerCase() + '.' : 'Melee weapon.');
  else if (ARMOUR[n]) lines.push(SLOT_NAMES[ARMOUR[n].slot] + ' slot. Right-click to wear.');
  else if (TOOL_ITEMS[n] && (TOOL_ITEMS[n].type === 'axe' || TOOL_ITEMS[n].type === 'pickaxe')) lines.push('Select it on the hotbar to work with it.');
  else if (CROPS[n]) lines.push('Ripe after ' + CROPS[n].days + ' watered days.');
  else if (ITEM_USE[n]) lines.push('Right-click to use.');
  if (ITEM_DESC[n]) lines.push(ITEM_DESC[n]);
  if (isHotbarable(n)) lines.push('Can sit on the hotbar.');
  return lines;
}
function drawTooltip(item, x, y, w) {
  const lines = itemInfo(item), rows = statRows(item.name), base = compareBase(item.name), baseRows = base ? statRows(base) : [];
  const tr = tierOf(item.name);
  ctx.font = '10px ' + MONO;
  const tw = 214, th = 30 + lines.length * 13 + rows.length * 15 + (base ? 14 : 0) + 8;
  const tx = Math.min(w - tw - 8, x), ty = Math.max(8, y);
  panel(tx, ty, tw, th, 0.97);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.font = '12px ' + MONO; ctx.fillStyle = tr >= 0 ? TIER_COL[tr] : '#ffd36b'; ctx.fillText(item.name, tx + 8, ty + 12);
  ctx.font = '9px ' + MONO; ctx.fillStyle = '#b8a890'; ctx.fillText(tr >= 0 ? TIER_NAME[tr] : 'Material', tx + 8, ty + 24);
  ctx.font = '10px ' + MONO;
  let yy = ty + 38;
  lines.forEach(l => { ctx.fillStyle = '#e8dcc0'; ctx.fillText(l, tx + 8, yy); yy += 13; });
  rows.forEach((r, k) => {
    ctx.fillStyle = '#b8a890'; ctx.fillText(r.k, tx + 8, yy + 2);
    ctx.fillStyle = '#1a0e16'; ctx.fillRect(tx + 72, yy - 3, 70, 8);
    const f = Math.min(1, r.v / r.max);
    ctx.fillStyle = tr >= 0 ? TIER_COL[tr] : '#d6a84a'; ctx.fillRect(tx + 73, yy - 2, 68 * f, 6);
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(tx + 73, yy - 2, 68 * f, 2);
    ctx.fillStyle = '#fff6e4'; ctx.fillText(r.fmt(r.v), tx + 148, yy + 2);
    const br = baseRows.find(q => q.k === r.k);
    if (br) {
      const diff = r.v - br.v;
      if (Math.abs(diff) > 0.001) { ctx.fillStyle = diff > 0 ? '#7fff7f' : '#ff7a6a'; ctx.fillText((diff > 0 ? '+' : '') + (Math.abs(diff) < 10 ? diff.toFixed(1) : Math.round(diff)), tx + 186, yy + 2); }
    }
    yy += 15;
  });
  if (base) { ctx.fillStyle = '#9a8a74'; ctx.fillText('vs ' + base, tx + 8, yy + 2); }
}

function slotFrame(x, y, s, item, accent, over) {
  const tr = item ? tierOf(item.name) : -1;
  ctx.fillStyle = accent ? 'rgba(255,211,107,0.09)' : 'rgba(255,255,255,0.06)'; ctx.fillRect(x, y, s, s);
  if (tr >= 0) { ctx.fillStyle = TIER_COL[tr] + '26'; ctx.fillRect(x, y, s, s); }
  ctx.strokeStyle = tr >= 0 ? TIER_COL[tr] : accent ? 'rgba(255,211,107,0.4)' : 'rgba(233,226,212,0.18)'; ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);
  if (tr >= 1) { ctx.fillStyle = TIER_COL[tr]; ctx.fillRect(x + s - 5, y + 2, 3, 3); }
  if (over) { ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1); }
}

function drawHotbar(w, h) {
  const L = hotbarLayout(w, h), inv = state.player.inventory;
  panel(L.x0 - 6, L.y0 - 6, L.total + 12, L.cell + 12, 0.78);
  for (let i = 0; i < L.n; i++) {
    const x = L.x0 + i * (L.cell + L.gap), y = L.y0, s = inv[i], on = i === state.sel;
    slotFrame(x, y, L.cell, s, on, false);
    if (on) { ctx.strokeStyle = '#ffd36b'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, L.cell - 2, L.cell - 2); }
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
    panel(Math.round(w / 2 - tw / 2), L.y0 - 30, tw, 18, 0.8);
    const tr = tierOf(sel.name);
    ctx.fillStyle = tr >= 0 ? TIER_COL[tr] : '#ffd36b'; ctx.fillText(label, w / 2, L.y0 - 20.5);
  }
}

function drawInventory(w, h) {
  const cols = 9, cell = 40, pad = 14, eqW = 112;
  const pw = pad * 2 + eqW + cols * cell + 6, ph = 326;
  const px = Math.round(w / 2 - pw / 2), py = Math.max(8, Math.round(h / 2 - ph / 2));
  panel(px, py, pw, ph, 0.95);
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.font = '12px ' + MONO; ctx.fillStyle = '#e9e2d4';
  ctx.fillText('Bag and equipment', px + pad, py + 20);
  const inv = state.player.inventory;
  let hover = null, hx = 0, hy = 0;
  const slotBox = (x, y, item, accent, onClick) => {
    const over = mouse.x >= x && mouse.x < x + cell - 4 && mouse.y >= y && mouse.y < y + cell - 4;
    slotFrame(x, y, cell - 4, item, accent, over);
    if (over && item) { hover = item; hx = x; hy = y; }
    if (item) {
      drawIcon(item.name, x + 4, y + 4, 28, item);
      if (item.qty > 1) { ctx.font = '10px ' + MONO; ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillStyle = '#000'; ctx.fillText(String(item.qty), x + cell - 4, y + cell - 4); ctx.fillStyle = '#fff'; ctx.fillText(String(item.qty), x + cell - 5, y + cell - 5); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; }
    }
    state.uiRects.push({ x, y, w: cell - 4, h: cell - 4, fn: onClick });
  };
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#b9b09d'; ctx.fillText('Worn', px + pad, py + 40);
  SLOT_ORDER.forEach((slot, k) => {
    const x = px + pad, y = py + 50 + k * (cell + 2);
    slotBox(x, y, state.player.equip[slot], false, btn => equipSlotClick(slot, btn));
    ctx.font = '10px ' + MONO; ctx.fillStyle = '#b9b09d'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(SLOT_NAMES[slot], x + cell + 2, y + 16);
  });
  const gx = px + pad + eqW, gy = py + 40;
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#d8b878'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('Hotbar (keys 1-9): tools, weapons, seeds, food, medicine only', gx, gy - 2);
  for (let i = 0; i < CONFIG.inventory.slots; i++) {
    const r = Math.floor(i / cols), c = i % cols;
    const x = gx + c * cell, y = gy + 8 + r * cell + (r > 0 ? 8 : 0);
    slotBox(x, y, inv[i], r === 0, btn => invSlotClick(i, btn));
    if (r === 0) { ctx.font = '9px ' + MONO; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillStyle = 'rgba(255,211,107,0.8)'; ctx.fillText(String(i + 1), x + 3, y + 2); }
  }
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#b9b09d'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('Bag', gx, gy + 8 + cell + 4);
  const as = armourStats(), p = state.player;
  const sy = py + 238;
  ctx.font = '11px ' + MONO; ctx.fillStyle = '#e9e2d4';
  ctx.fillText('Survivor level ' + p.level + '   XP ' + p.xp + '/' + (p.level >= CONFIG.combat.maxLevel ? 'max' : xpNeeded(p.level)), gx, sy);
  ctx.fillText('Defence ' + Math.round(as.dmg * 100) + '%   Rad shield ' + Math.round(as.rad * 100) + '%   Max HP ' + maxHealth(), gx, sy + 18);
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#b9b09d';
  ctx.fillText('Left-click: pick up and put down.   Right-click: eat, use or wear.', gx, sy + 40);
  ctx.fillText('I or Esc closes. Held items return to the bag.', gx, sy + 54);
  if (hover && !state.cursor) drawTooltip(hover, hx + 44, hy - 6, w);
  if (state.cursor) drawIcon(state.cursor.name, mouse.x - 14, mouse.y - 14, 28, state.cursor);
}

/* ---------- Map, portrait, HUD ---------- */
function drawPortrait(x, y, w, h) {
  ctx.fillStyle = '#b8482a'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#e0803c'; ctx.fillRect(x, y, w, Math.floor(h * 0.55));
  ctx.fillStyle = 'rgba(255,230,160,0.25)'; ctx.fillRect(x, y, w, 3);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x, y + h - 6, w, 6);
  const look = armourLook();
  const spr = makeSprite('P|0|0|' + look.sig, 18, 30, c => paintPlayer(c, 0, 0, look));
  ctx.drawImage(spr, 3, 1, 14, 14, x + 4, y + 4, w - 8, w - 8);
  ctx.strokeStyle = '#2a1018'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
}
function drawBigMap(w, h) {
  const S = 512, px = Math.round(w / 2 - S / 2 - 6), py = Math.max(8, Math.round(h / 2 - S / 2 - 18));
  panel(px, py, S + 12, S + 36, 0.96);
  ctx.drawImage(mini, px + 6, py + 6, S, S);
  ctx.drawImage(miniFog, px + 6, py + 6, S, S);
  const p = state.player, k = S / (W * TS);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '11px ' + MONO;
  const fogCtx = miniFog.getContext('2d');
  const seen = (tx, ty) => fogCtx.getImageData(Math.floor(tx * 2), Math.floor(ty * 2), 1, 1).data[3] < 200;
  const label = (txt, tx, ty) => { if (!seen(tx, ty)) return; ctx.fillStyle = '#000'; ctx.fillText(txt, px + 6 + tx / W * S + 1, py + 6 + ty / H * S + 1); ctx.fillStyle = '#ffe9b0'; ctx.fillText(txt, px + 6 + tx / W * S, py + 6 + ty / H * S); };
  label('Home Valley', BASE.x, BASE.y);
  for (const z of ZONES) label(z.name, z.x, z.y);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(px + 6 + p.x * k - 3, py + 6 + p.y * k - 3, 6, 6);
  ctx.strokeStyle = '#000'; ctx.strokeRect(px + 6 + p.x * k - 3.5, py + 6 + p.y * k - 3.5, 7, 7);
  if (state.corpse) { ctx.fillStyle = '#e8003d'; ctx.fillRect(px + 6 + state.corpse.x * k - 3, py + 6 + state.corpse.y * k - 3, 6, 6); }
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#c8b8a0'; ctx.textAlign = 'center';
  ctx.fillText('Unexplored areas stay dark. M or Esc closes. White is you.', px + (S + 12) / 2, py + S + 24);
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
  const rz = rr <= -0.9 ? 'Safe camp' : rr < 0 ? 'Regrowth' : rr >= 0.9 ? 'Hot spot' : rr >= 0.4 ? 'Ruins' : 'Open ground';
  bar(66, 62, 148, 'Rad', p.radiation, '#7fbf3f', rz + (rr >= 0 ? ' +' : ' ') + rr.toFixed(2));
  const as = armourStats();
  ctx.font = '10px ' + MONO; ctx.textAlign = 'left'; ctx.fillStyle = '#e8dcc0';
  ctx.fillText('def ' + Math.round(as.dmg * 100) + '%   rad ' + Math.round(as.rad * 100) + '%   hp ' + Math.ceil(p.health) + '/' + mh, 66, 85);
  const need = xpNeeded(p.level);
  ctx.fillStyle = '#1a0e16'; ctx.fillRect(66, 94, 148, 5);
  ctx.fillStyle = '#ffd36b'; ctx.fillRect(67, 95, 146 * (p.level >= CONFIG.combat.maxLevel ? 1 : p.xp / need), 3);

  const hr = clockHour();
  panel(w - 138, 8, 130, 20);
  ctx.fillStyle = hr >= 18 || hr < 6 ? '#9fb4ff' : '#ffd36b';
  ctx.font = '11px ' + MONO; ctx.textAlign = 'center';
  ctx.fillText('Day ' + clockDay() + '  ' + fmtClock() + (state.timeMult > 1 ? '  >>' : ''), w - 73, 18.5);
  panel(w - 138, 32, 130, 146);
  const MS = 124, mx = w - 135, my = 36;
  ctx.drawImage(mini, mx, my, MS, MS);
  ctx.drawImage(miniFog, mx, my, MS, MS);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(mx + p.x / (W * TS) * MS - 1.5, my + p.y / (H * TS) * MS - 1.5, 3, 3);
  if (state.corpse) { ctx.fillStyle = '#e8003d'; ctx.fillRect(mx + state.corpse.x / (W * TS) * MS - 1.5, my + state.corpse.y / (H * TS) * MS - 1.5, 3, 3); }
  ctx.fillStyle = '#ff5a4a';
  for (const e of enemies) if (!e.hidden && (Math.hypot(e.x - p.x, e.y - p.y) < 200 || e.raid)) ctx.fillRect(mx + e.x / (W * TS) * MS - 1, my + e.y / (H * TS) * MS - 1, 2, 2);
  ctx.font = '10px ' + MONO; ctx.textAlign = 'center'; ctx.fillStyle = '#e8dcc0';
  ctx.fillText(ZONE_NAMES[state.zone] + '  (M map)', w - 73, my + MS + 11);

  if (state.raid) {
    const left = enemies.filter(e => e.raid).length;
    ctx.font = '12px ' + MONO; ctx.textAlign = 'center';
    const txt = 'RAID from the ' + state.raid.dirName + '  |  ' + left + ' raider' + (left === 1 ? '' : 's') + ' left';
    const tw = ctx.measureText(txt).width + 28;
    panel(Math.round(w / 2 - tw / 2), 8, tw, 22, 0.95);
    ctx.fillStyle = '#ff8a7a'; ctx.fillText(txt, w / 2, 19.5);
  }
  if (state.banner) {
    const a = Math.min(1, state.banner.t, (3.6 - state.banner.t) * 3);
    ctx.globalAlpha = Math.max(0, a);
    ctx.font = '22px ' + MONO; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const ty = state.raid ? 70 : 58;
    ctx.fillStyle = '#000'; ctx.fillText(state.banner.text, w / 2 + 2, ty + 2);
    ctx.fillStyle = '#ffe9b0'; ctx.fillText(state.banner.text, w / 2, ty);
    const tw2 = ctx.measureText(state.banner.text).width;
    ctx.fillStyle = 'rgba(255,233,176,0.7)'; ctx.fillRect(w / 2 - tw2 / 2 - 24, ty + 16, tw2 + 48, 1);
    ctx.globalAlpha = 1;
  }

  panel(8, h - 84, 352, 72, 0.88);
  ctx.font = '10px ' + MONO; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff6e4'; ctx.fillText(label.length > 54 ? label.slice(0, 53) + '...' : label, 16, h - 73);
  ctx.fillStyle = '#c8b8a0';
  ctx.fillText('WASD move   click use   1-9 or wheel hotbar', 16, h - 59);
  ctx.fillText('I bag   C craft   M map   right-click eat/wear', 16, h - 46);
  ctx.fillText('Test: T time  U plans  G mats  H gear  N raid', 16, h - 33);
  ctx.fillText('Hold click to harvest, till, plant, water or attack.', 16, h - 20);

  drawHotbar(w, h);

  if (state.msgT > 0) {
    ctx.globalAlpha = Math.min(1, state.msgT);
    ctx.font = '13px ' + MONO;
    const tw = Math.min(w - 40, ctx.measureText(state.msg).width + 34), bx = Math.round(w / 2 - tw / 2), by = h - 124;
    ctx.fillStyle = 'rgba(0,0,0,0.28)'; rrect(bx + 2, by + 3, tw, 28, 7); ctx.fill();
    ctx.fillStyle = '#ebe9df'; rrect(bx, by, tw, 28, 7); ctx.fill();
    ctx.strokeStyle = '#c8c4b4'; ctx.lineWidth = 1; rrect(bx + 0.5, by + 0.5, tw - 1, 27, 7); ctx.stroke();
    ctx.fillStyle = '#ebe9df'; ctx.beginPath(); ctx.moveTo(w / 2 - 6, by + 27); ctx.lineTo(w / 2 + 6, by + 27); ctx.lineTo(w / 2, by + 35); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#34343c'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(state.msg, w / 2, by + 14.5);
    ctx.globalAlpha = 1;
  }
  if (state.sleeping) { ctx.font = '18px ' + MONO; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#9fb4ff'; ctx.fillText('Sleeping...', w / 2, h / 2); }
  if (state.invOpen) drawInventory(w, h);
  if (state.craftOpen) drawCrafting(w, h);
  if (state.mapOpen) drawBigMap(w, h);
}

function render() {
  const p = state.player;
  const vw = canvas.width / scale, vh = canvas.height / scale;
  const worldW = W * TS, worldH = H * TS;
  let camX = worldW <= vw ? (worldW - vw) / 2 : Math.max(0, Math.min(worldW - vw, p.x - vw / 2));
  let camY = worldH <= vh ? (worldH - vh) / 2 : Math.max(0, Math.min(worldH - vh, p.y - vh / 2));
  let transX = Math.round(camX * scale), transY = Math.round(camY * scale);
  if (state.shakeT > 0) { const m = Math.min(1, state.shakeT * 3) * 4 * dpr; transX += Math.round((Math.random() - 0.5) * m * 2); transY += Math.round((Math.random() - 0.5) * m * 2); }
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
  for (let ty = ty0; ty <= ty1 + 4; ty++) {
    if (ty < H) for (let tx = tx0; tx <= tx1; tx++) {
      const i = ty * W + tx;
      if (tiles[i] === T.RUBBLE) drawWall(tx, ty);
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
    for (const e of enemies) if (!e.hidden && Math.floor((e.y + ENEMY_TYPES[e.type].size / 2) / TS) === ty) drawEnemy(e);
    if (ty === playerRow) drawPlayer(p);
  }
  drawProjs();
  drawSlash();
  drawEffects();
  drawPlacementGhost();
  drawClouds(camX, camY, vw, vh, state.elapsed);
  drawShafts(camX, camY, vw, vh, state.elapsed);

  const mi = describeMouse();
  if (mi.ok) {
    ctx.strokeStyle = mi.ring; ctx.lineWidth = 1 / scale * 1.5;
    ctx.strokeRect(mi.tx * TS + 0.5, mi.ty * TS + 0.5, TS - 1, TS - 1);
  }

  drawLighting(transX, transY, Math.max(darkness(clockHour()), state.zDark));
  drawRadVignette();
  if (state.ambushWarn > 0) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const a = 0.18 + 0.12 * Math.sin(state.elapsed * 14), r = Math.hypot(canvas.width, canvas.height) / 2;
    const g = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, r * 0.4, canvas.width / 2, canvas.height / 2, r);
    g.addColorStop(0, 'rgba(120,10,10,0)'); g.addColorStop(1, 'rgba(160,20,20,' + a + ')');
    ctx.fillStyle = g; ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  drawGrade();
  if (state.sleeping) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = 'rgba(4,6,16,0.82)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  drawHUD(mi.label);
}

