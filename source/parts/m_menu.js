/* =====================================================================
   MENUS: hub tabs, pause, settings, title, progress, journal, settlement,
   improved crafting, trading, talking, and saving
   ===================================================================== */
const SETTINGS_KEY = 'wasteland.settings.v1', SAVE_KEY = 'wasteland.save.v1';
const settings = { volume: 0.55, muted: false, pauseInMenus: true, permaDeath: false, drain: 1, shake: true, lowHp: true, autosave: true };
try { Object.assign(settings, JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')); } catch (e) { /* storage may be unavailable */ }
function saveSettings() { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) { /* ignore */ } }
function applySettings() { AUD.muted = settings.muted; if (AUD.master) AUD.master.gain.value = settings.volume; saveSettings(); }
AUD.muted = settings.muted;
{ const o = audioInit; audioInit = function () { o(); if (AUD.master) AUD.master.gain.value = settings.volume; }; }
sfxToggle = function () { audioInit(); settings.muted = !settings.muted; applySettings(); if (AUD.windGain) AUD.windGain.gain.value = 0; toast('Sound ' + (settings.muted ? 'off' : 'on'), 1.5); };

/* ---------- Saving ---------- */
function b64(u8) { let s = ''; for (let i = 0; i < u8.length; i += 4096) s += String.fromCharCode.apply(null, u8.subarray(i, i + 4096)); return btoa(s); }
function unb64(str, target) { const s = atob(str); for (let i = 0; i < s.length && i < target.length; i++) target[i] = s.charCodeAt(i); }
function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; } }
function serialize() {
  const p = state.player;
  return {
    v: 1, savedAt: Date.now(), gameMinutes: state.gameMinutes, lastDay: state.lastDay, nextRaidDay: state.nextRaidDay, nextStormDay: state.nextStormDay, raidsSurvived: state.raidsSurvived,
    player: { x: p.x, y: p.y, health: p.health, food: p.food, water: p.water, radiation: p.radiation, inventory: p.inventory, equip: p.equip, xp: p.xp, level: p.level, skills: p.skills },
    spawn: { x: spawn.x, y: spawn.y }, sel: state.sel, unlocked: [...state.unlocked], quests: state.quests, qflags: state.qflags, pinned: state.pinned, zonesSeen: state.zonesSeen, firstMerchant: state.firstMerchant,
    objs: b64(objs), floors: b64(floors), roofs: b64(roofs), tilled: b64(tilled), wet: b64(wet),
    structs: [...structs].map(([i, s]) => [i, s]), crops: [...crops], saplings: [...saplings], crateLoot: [...crateLoot],
    settlers: settlers.map(s => Object.assign({}, s, { path: null, task: null })), survivors: survivors.map(s => Object.assign({}, s)), downed: state.downed.map(d => ({ s: Object.assign({}, d.s, { path: null, task: null }), returnAt: d.returnAt })),
    spawnPts: state.spawnPts.map(sp => ({ type: sp.type, x: sp.x, y: sp.y, respawnAt: sp.respawnAt, hidden: sp.hidden, dead: !(sp.e && enemies.some(e => e.id === sp.e)) })),
    corpse: state.corpse, drops: state.drops, fog: miniFog.toDataURL()
  };
}
function saveGame(manual) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(serialize())); if (manual) toast('Game saved.', 2); return true; }
  catch (e) { if (manual) toast('Could not save here (browser storage is unavailable).', 3.5); return false; }
}
function loadGame() {
  let d;
  try { d = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { d = null; }
  if (!d) { toast('No saved game found.', 2); return false; }
  const p = state.player;
  Object.assign(p, { x: d.player.x, y: d.player.y, health: d.player.health, food: d.player.food, water: d.player.water, radiation: d.player.radiation, inventory: d.player.inventory, equip: d.player.equip, xp: d.player.xp, level: d.player.level, skills: d.player.skills });
  spawn.x = d.spawn.x; spawn.y = d.spawn.y;
  state.gameMinutes = d.gameMinutes; state.lastDay = d.lastDay; state.nextRaidDay = d.nextRaidDay; state.nextStormDay = d.nextStormDay; state.raidsSurvived = d.raidsSurvived || 0;
  state.sel = d.sel || 0; state.unlocked = new Set(d.unlocked); state.quests = d.quests; state.qflags = d.qflags; state.pinned = d.pinned; state.zonesSeen = d.zonesSeen || {}; state.firstMerchant = d.firstMerchant;
  unb64(d.objs, objs); unb64(d.floors, floors); unb64(d.roofs, roofs); unb64(d.tilled, tilled); unb64(d.wet, wet);
  structs.clear(); for (const [i, s] of d.structs) structs.set(i, s);
  crops.clear(); for (const [i, c] of d.crops) crops.set(i, c);
  saplings.clear(); for (const [i, c] of d.saplings) saplings.set(i, c);
  crateLoot.clear(); for (const [i, l] of d.crateLoot) crateLoot.set(i, l);
  settlers.length = 0; for (const s of d.settlers) settlers.push(s);
  survivors.length = 0; for (const s of d.survivors) survivors.push(s);
  state.downed = d.downed || [];
  claimed.clear(); badUntil.clear(); encNpcs.length = 0;
  enemies.length = 0; state.projs.length = 0; state.drops = d.drops || []; state.corpse = d.corpse || null; state.fish = null; state.moving = null; state.raid = null; state.storm = null; state.stormI = 0;
  state.spawnPts = d.spawnPts.map((sp, idx) => ({ type: sp.type, x: sp.x, y: sp.y, respawnAt: sp.respawnAt, hidden: sp.hidden, e: null }));
  d.spawnPts.forEach((sp, idx) => { if (!sp.dead) state.spawnPts[idx].e = spawnEnemy(sp.type, sp.x, sp.y, { spawnIdx: idx, hidden: sp.hidden }).id; });
  buildMinimap();
  const img = new Image(); img.onload = () => { const f = miniFog.getContext('2d'); f.globalCompositeOperation = 'source-over'; f.clearRect(0, 0, miniFog.width, miniFog.height); f.drawImage(img, 0, 0); }; img.src = d.fog;
  closePanels(); roofRegion = new Set(); roofFade = 0;
  toast('Game loaded.', 2.5);
  return true;
}
{ const o = newDayTick; newDayTick = function () { o(); if (settings.autosave && !state.title) saveGame(false); }; }

/* ---------- Menu hub ---------- */
function anyMenuOpen() { return state.invOpen || state.craftOpen || state.mapOpen || state.settlersOpen || state.progressOpen || state.journalOpen || state.settingsOpen || state.pauseOpen || !!state.talk || !!state.trade; }
function hubOpen() { return state.invOpen || state.craftOpen || state.mapOpen || state.settlersOpen || state.progressOpen || state.journalOpen || state.settingsOpen; }
const MENU_TABS = [['Inventory', 'invOpen'], ['Crafting', 'craftOpen'], ['Map', 'mapOpen'], ['Progress', 'progressOpen'], ['Journal', 'journalOpen'], ['Settlement', 'settlersOpen'], ['Settings', 'settingsOpen']];
function openMenu(flag) { closePanels(); state.menuScroll = 0; state[flag] = true; }
function toggleHub(flag) { const o = !state[flag]; closePanels(); state.menuScroll = 0; state[flag] = o; }
function drawMenuTabs(w, h) {
  const tw = 104, total = MENU_TABS.length * tw, x0 = Math.round(w / 2 - total / 2), y = 8;
  panel(x0 - 6, y - 4, total + 12, 32, 0.92);
  ctx.font = '11px ' + MONO; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  MENU_TABS.forEach(([name, flag], k) => {
    const x = x0 + k * tw, on = !!state[flag], over = mouse.x >= x && mouse.x < x + tw - 4 && mouse.y >= y && mouse.y < y + 24;
    ctx.fillStyle = on ? 'rgba(255,211,107,0.22)' : over ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'; ctx.fillRect(x, y, tw - 4, 24);
    ctx.strokeStyle = on ? '#ffd36b' : 'rgba(233,226,212,0.2)'; ctx.strokeRect(x + 0.5, y + 0.5, tw - 5, 23);
    ctx.fillStyle = on ? '#ffd36b' : '#c8b8a0'; ctx.fillText(name, x + (tw - 4) / 2, y + 12.5);
    state.uiRects.push({ x, y, w: tw - 4, h: 24, fn: () => openMenu(flag) });
  });
}
function drawTracker() {
  const q = activeQuest();
  if (!q) return;
  const qs = state.quests[q.id], step = q.steps.find(s => !qs.done[s.id]);
  if (!step) return;
  ctx.font = '10px ' + MONO;
  const lines = wrapText(step.text, 196);
  panel(8, 112, 214, 26 + lines.length * 12, 0.8);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffd36b'; ctx.fillText(q.title + '   (J)', 16, 124);
  ctx.fillStyle = '#e8dcc0'; lines.forEach((l, k) => ctx.fillText(l, 16, 138 + k * 12));
}
function sortBag() {
  const inv = state.player.inventory, lo = CONFIG.hotbar, items = [];
  for (let i = lo; i < inv.length; i++) if (inv[i]) { items.push(inv[i]); inv[i] = null; }
  const cat = n => ARMOUR[n] ? 1 : WEAPONS[n] || TOOL_ITEMS[n] ? 0 : ITEM_USE[n] ? 2 : CROPS[n] ? 3 : 4;
  items.sort((a, b) => cat(a.name) - cat(b.name) || a.name.localeCompare(b.name));
  let k = lo;
  for (const s of items) { const same = k > lo && inv[k - 1] && inv[k - 1].name === s.name && stackMax(s.name) > 1 && inv[k - 1].qty < stackMax(s.name); if (same) { const n = Math.min(stackMax(s.name) - inv[k - 1].qty, s.qty); inv[k - 1].qty += n; s.qty -= n; if (s.qty <= 0) continue; } inv[k++] = s; }
  toast('Bag sorted.', 1.2);
}

/* ---------- Crafting, with a detail pane ---------- */
function resultName(r) { return r.gives ? Object.keys(r.gives)[0] : null; }
function drawRecipeIcon(r, x, y, s) {
  if (r.place) { const spr = structSprite(r.place, 0, 0), sc = Math.min(s / spr.width, s / spr.height); ctx.drawImage(spr, x + (s - spr.width * sc) / 2, y + (s - spr.height * sc) / 2, spr.width * sc, spr.height * sc); }
  else drawIcon(resultName(r), x, y, s);
}
function drawStatBlock(name, x, y, w) {
  const rows = statRows(name), base = compareBase(name), baseRows = base ? statRows(base) : [], tr = tierOf(name);
  ctx.font = '10px ' + MONO; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  rows.forEach(r => {
    ctx.fillStyle = '#b8a890'; ctx.fillText(r.k, x, y + 2);
    ctx.fillStyle = '#1a0e16'; ctx.fillRect(x + 66, y - 3, w - 150, 8);
    const f = Math.min(1, r.v / r.max);
    ctx.fillStyle = tr >= 0 ? TIER_COL[tr] : '#d6a84a'; ctx.fillRect(x + 67, y - 2, (w - 152) * f, 6);
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(x + 67, y - 2, (w - 152) * f, 2);
    ctx.fillStyle = '#fff6e4'; ctx.fillText(r.fmt(r.v), x + w - 80, y + 2);
    const br = baseRows.find(q => q.k === r.k);
    if (br) { const diff = r.v - br.v; if (Math.abs(diff) > 0.001) { ctx.fillStyle = diff > 0 ? '#7fff7f' : '#ff7a6a'; ctx.fillText((diff > 0 ? '+' : '') + (Math.abs(diff) < 10 ? diff.toFixed(1) : Math.round(diff)), x + w - 34, y + 2); } }
    y += 15;
  });
  if (rows.length && base) { ctx.fillStyle = '#9a8a74'; ctx.fillText('compared with ' + base, x, y + 2); y += 14; }
  return y;
}
function recipeInfoLines(r) {
  const lines = [], res = resultName(r);
  if (RECIPE_DESC[r.id]) lines.push(RECIPE_DESC[r.id]);
  if (res) { if (ITEM_DESC[res]) lines.push(ITEM_DESC[res]); for (const l of itemInfo({ name: res })) if (!lines.includes(l)) lines.push(l); }
  if (r.place && STRUCT_HP[r.place]) lines.push('Health ' + STRUCT_HP[r.place] + (LIGHT_R[r.place] ? '   Light radius ' + LIGHT_R[r.place] : ''));
  return lines;
}
function drawCrafting(w, h) {
  const rowH = 46, visible = 7, listW = 540, detW = 244, pw = listW + detW + 28, tabsH = 30;
  const list = RECIPES.filter(r => r.cat === CRAFT_TABS[state.craftTab]);
  const maxScroll = Math.max(0, list.length - visible);
  state.craftScroll = Math.min(state.craftScroll, maxScroll);
  const ph = 44 + tabsH + visible * rowH + 40;
  const px = Math.round(w / 2 - pw / 2), py = Math.max(46, Math.round(h / 2 - ph / 2));
  panel(px, py, pw, ph, 0.95);
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.font = '12px ' + MONO; ctx.fillStyle = '#e9e2d4'; ctx.fillText('Crafting', px + 14, py + 18);
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#b9b09d'; ctx.textAlign = 'right';
  ctx.fillText('Blueprints ' + state.unlocked.size + '/' + Object.keys(BLUEPRINTS).length + '   Crafting level ' + skillLevel('crafting'), px + listW, py + 18);
  const tw = (listW - 8) / CRAFT_TABS.length;
  CRAFT_TABS.forEach((tab, k) => {
    const x = px + 10 + k * tw, y = py + 32, on = k === state.craftTab;
    ctx.fillStyle = on ? 'rgba(255,211,107,0.2)' : 'rgba(255,255,255,0.05)'; ctx.fillRect(x, y, tw - 3, tabsH - 4);
    ctx.strokeStyle = on ? '#ffd36b' : 'rgba(233,226,212,0.2)'; ctx.strokeRect(x + 0.5, y + 0.5, tw - 4, tabsH - 5);
    ctx.font = '10px ' + MONO; ctx.textAlign = 'center'; ctx.fillStyle = on ? '#ffd36b' : '#b9b09d';
    ctx.fillText(tab, x + (tw - 3) / 2, y + (tabsH - 4) / 2);
    state.uiRects.push({ x, y, w: tw - 3, h: tabsH - 4, fn: () => { state.craftTab = k; state.craftScroll = 0; state.craftSel = null; } });
  });
  const top = py + 40 + tabsH;
  let sel = list.find(r => r.id === state.craftSel) || list[0];
  list.slice(state.craftScroll, state.craftScroll + visible).forEach((r, k) => {
    const x = px + 10, y = top + k * rowH, rw = listW - 22, rh = rowH - 4;
    const st = recipeStatus(r), locked = !recipeUnlocked(r);
    const hover = mouse.x >= x && mouse.x < x + rw && mouse.y >= y && mouse.y < y + rh;
    if (hover) sel = r;
    const isSel = sel && sel.id === r.id;
    ctx.fillStyle = isSel ? 'rgba(255,211,107,0.14)' : st.ok ? 'rgba(127,255,127,0.09)' : 'rgba(255,255,255,0.04)'; ctx.fillRect(x, y, rw, rh);
    ctx.strokeStyle = isSel ? '#ffd36b' : st.ok ? 'rgba(127,255,127,0.4)' : 'rgba(233,226,212,0.1)'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, rw - 1, rh - 1);
    ctx.globalAlpha = locked ? 0.5 : 1;
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x + 5, y + 4, 34, 34);
    drawRecipeIcon(r, x + 7, y + 6, 30);
    ctx.font = '12px ' + MONO; ctx.textAlign = 'left'; ctx.fillStyle = '#e9e2d4'; ctx.fillText(r.name, x + 48, y + 12);
    ctx.font = '10px ' + MONO; ctx.fillStyle = '#b9b09d'; ctx.textAlign = 'right';
    ctx.fillText('Tier ' + r.tier + '   ' + (r.station ? STATION_NAMES[r.station] : 'By hand'), x + rw - 8, y + 12); ctx.textAlign = 'left';
    let cx = x + 48;
    if (locked) { ctx.fillStyle = '#d6a84a'; ctx.fillText('Locked', cx, y + 30); }
    else for (const name of Object.keys(r.cost)) {
      const have = countItem(name), need = r.cost[name], txt = name + ' ' + have + '/' + need + '   ';
      ctx.fillStyle = have >= need ? '#9fdc8f' : '#e07a6a'; ctx.fillText(txt, cx, y + 30); cx += ctx.measureText(txt).width;
    }
    ctx.globalAlpha = 1;
    state.uiRects.push({ x, y, w: rw, h: rh, fn: () => { state.craftSel = r.id; } });
  });
  if (list.length > visible) {
    const tx = px + listW - 8, ty = top, th = visible * rowH - 4;
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(tx, ty, 5, th);
    const thumb = Math.max(18, th * visible / list.length);
    ctx.fillStyle = 'rgba(255,211,107,0.6)'; ctx.fillRect(tx, ty + (th - thumb) * (state.craftScroll / maxScroll), 5, thumb);
  }
  // detail pane
  const dx = px + listW + 16, dw = detW - 2;
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(dx - 6, py + 38, dw + 10, ph - 78);
  if (sel) {
    let y = py + 52;
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(dx, y - 6, 48, 48); drawRecipeIcon(sel, dx + 2, y - 4, 44);
    ctx.textAlign = 'left'; ctx.font = '13px ' + MONO; ctx.fillStyle = tierOf(resultName(sel) || '') >= 0 ? TIER_COL[tierOf(resultName(sel))] : '#ffe9b0'; ctx.fillText(sel.name, dx + 56, y + 6);
    ctx.font = '10px ' + MONO; ctx.fillStyle = '#b8a890'; ctx.fillText('Tier ' + sel.tier + ': ' + TIER_NAMES[sel.tier - 1], dx + 56, y + 21);
    ctx.fillText((sel.place ? 'Structure' : 'Item') + (sel.gives && Object.values(sel.gives)[0] > 1 ? '  x' + Object.values(sel.gives)[0] : ''), dx + 56, y + 34);
    y += 54;
    ctx.font = '10px ' + MONO;
    const unl = recipeUnlocked(sel);
    if (!unl) { ctx.fillStyle = '#d6a84a'; wrapText('Locked. Needs ' + unlockText(sel) + '.', dw).forEach(l => { ctx.fillText(l, dx, y); y += 13; }); y += 4; }
    ctx.fillStyle = '#e8dcc0';
    for (const para of recipeInfoLines(sel)) for (const l of wrapText(para, dw)) { if (y < py + ph - 150) { ctx.fillText(l, dx, y); y += 13; } }
    y += 4;
    const res = resultName(sel);
    if (res) y = drawStatBlock(res, dx, y, dw);
    ctx.fillStyle = '#b8a890'; ctx.fillText('Needs', dx, y + 2); y += 14;
    for (const name of Object.keys(sel.cost)) {
      const have = countItem(name), need = sel.cost[name];
      drawIcon(name, dx, y - 6, 12);
      ctx.fillStyle = have >= need ? '#9fdc8f' : '#e07a6a'; ctx.fillText(name + '  ' + have + '/' + need, dx + 18, y + 1); y += 14;
    }
    if (sel.station) { const near = stationNear(sel.station); ctx.fillStyle = near ? '#9fdc8f' : '#e07a6a'; ctx.fillText((near ? 'At ' : 'Needs ') + 'a ' + STATION_NAMES[sel.station] + (near ? '' : ' nearby'), dx, y + 1); y += 14; }
    const st = recipeStatus(sel);
    button(dx, py + ph - 76, dw, 26, st.ok ? (sel.place ? 'Place it' : 'Craft') : (!recipeUnlocked(sel) ? 'Locked' : st.why.length > 30 ? 'Missing something' : st.why), () => tryCraft(sel), st.ok);
  }
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#b9b09d'; ctx.textAlign = 'left';
  ctx.fillText('Hover to inspect, click to select, then craft. Chest contents count inside the valley.', px + 14, py + ph - 14);
}

/* ---------- Progress: level, skills and the tiered tree ---------- */
function drawRecipeTip(r, x, y, w) {
  const lines = recipeInfoLines(r), unl = recipeUnlocked(r), res = resultName(r), tr = res ? tierOf(res) : -1;
  ctx.font = '10px ' + MONO;
  const tw = 230, wrapped = lines.flatMap(l => wrapText(l, tw - 16));
  const rows = res ? statRows(res).length : 0, th = 40 + wrapped.length * 13 + rows * 15 + (unl ? 0 : 30) + 28;
  const tx = Math.min(w - tw - 8, x), ty = Math.max(46, Math.min(y, window.innerHeight - th - 8));
  panel(tx, ty, tw, th, 0.97);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.font = '12px ' + MONO; ctx.fillStyle = tr >= 0 ? TIER_COL[tr] : '#ffe9b0'; ctx.fillText(r.name, tx + 8, ty + 13);
  ctx.font = '9px ' + MONO; ctx.fillStyle = '#b8a890'; ctx.fillText('Tier ' + r.tier + ' (' + TIER_NAMES[r.tier - 1] + ')   ' + (r.station ? 'at a ' + STATION_NAMES[r.station] : 'by hand'), tx + 8, ty + 26);
  ctx.font = '10px ' + MONO;
  let yy = ty + 42;
  if (!unl) { ctx.fillStyle = '#d6a84a'; wrapText('Locked: needs ' + unlockText(r) + '.', tw - 16).forEach(l => { ctx.fillText(l, tx + 8, yy); yy += 13; }); yy += 4; }
  ctx.fillStyle = '#e8dcc0'; wrapped.forEach(l => { ctx.fillText(l, tx + 8, yy); yy += 13; });
  if (res) yy = drawStatBlock(res, tx + 8, yy + 4, tw - 16);
  ctx.fillStyle = '#b8a890'; ctx.fillText('Costs: ' + Object.keys(r.cost).map(k => r.cost[k] + ' ' + k).join(', '), tx + 8, yy + 8);
}
function drawProgress(w, h) {
  const pw = 900, ph = 560, px = Math.round(w / 2 - pw / 2), py = Math.max(46, Math.round(h / 2 - ph / 2));
  panel(px, py, pw, ph, 0.95);
  const p = state.player, as = armourStats();
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.font = '12px ' + MONO; ctx.fillStyle = '#e9e2d4'; ctx.fillText('Character and progression', px + 14, py + 18);
  // left: character
  let y = py + 40;
  drawPortrait(px + 14, y, 64, 64);
  ctx.font = '14px ' + MONO; ctx.fillStyle = '#ffe9b0'; ctx.fillText('Survivor level ' + p.level, px + 90, y + 14);
  const need = xpNeeded(p.level), full = p.level >= CONFIG.combat.maxLevel;
  ctx.fillStyle = '#1a0e16'; ctx.fillRect(px + 90, y + 28, 150, 8); ctx.fillStyle = '#ffd36b'; ctx.fillRect(px + 91, y + 29, 148 * (full ? 1 : p.xp / need), 6);
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#b8a890'; ctx.fillText(full ? 'Max level' : p.xp + ' / ' + need + ' XP to the next level', px + 90, y + 48);
  ctx.fillText('Every skill you train also feeds your level.', px + 90, y + 62);
  y += 80;
  const stats = [['Health', Math.ceil(p.health) + ' / ' + maxHealth()], ['Damage', 'x' + dmgScale().toFixed(2)], ['Defence', Math.round(as.dmg * 100) + '%'], ['Radiation shield', Math.round(as.rad * 100) + '%'],
    ['Move speed', '+' + Math.round((skillLevel('exploring') - 1) * 2) + '%'], ['Max health per level', '+' + CONFIG.combat.hpPerLevel]];
  ctx.font = '10px ' + MONO;
  stats.forEach(([k, v], i) => { const cx = px + 14 + (i % 2) * 152, cy = y + Math.floor(i / 2) * 18; ctx.fillStyle = '#b8a890'; ctx.textAlign = 'left'; ctx.fillText(k, cx, cy); ctx.fillStyle = '#fff6e4'; ctx.textAlign = 'right'; ctx.fillText(v, cx + 140, cy); });
  y += 66;
  ctx.textAlign = 'left'; ctx.font = '12px ' + MONO; ctx.fillStyle = '#e9e2d4'; ctx.fillText('Skills', px + 14, y); y += 16;
  SKILL_ORDER.forEach(k => {
    const sk = p.skills[k], d = SKILLS[k], over = mouse.x >= px + 10 && mouse.x < px + 300 && mouse.y >= y - 6 && mouse.y < y + 34;
    ctx.fillStyle = over ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)'; ctx.fillRect(px + 10, y - 6, 290, 38);
    ctx.font = '11px ' + MONO; ctx.fillStyle = '#ffe9b0'; ctx.textAlign = 'left'; ctx.fillText(d.name, px + 16, y + 4);
    ctx.fillStyle = '#b8a890'; ctx.textAlign = 'right'; ctx.fillText('Level ' + sk.lvl + (sk.lvl >= 10 ? ' (max)' : ''), px + 294, y + 4);
    ctx.fillStyle = '#1a0e16'; ctx.fillRect(px + 16, y + 11, 278, 5); ctx.fillStyle = '#6fbf5f'; ctx.fillRect(px + 17, y + 12, 276 * (sk.lvl >= 10 ? 1 : sk.xp / skillNeed(sk.lvl)), 3);
    ctx.font = '9px ' + MONO; ctx.fillStyle = '#9a8a74'; ctx.textAlign = 'left'; ctx.fillText(d.perk(sk.lvl), px + 16, y + 24);
    y += 40;
  });
  // right: tech tree
  const tx0 = px + 320, tw = pw - 334;
  ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(tx0 - 6, py + 34, tw + 12, ph - 48);
  ctx.textAlign = 'left'; ctx.font = '12px ' + MONO; ctx.fillStyle = '#e9e2d4'; ctx.fillText('Crafting tree', tx0, py + 48);
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#b8a890'; ctx.textAlign = 'right';
  ctx.fillText('Locked recipes show what unlocks them. Hover for details.', tx0 + tw, py + 48);
  let ty = py + 66, hover = null, hx = 0, hy = 0;
  for (let t = 1; t <= 4; t++) {
    const list = RECIPES.filter(r => r.tier === t), got = list.filter(recipeUnlocked).length;
    ctx.textAlign = 'left'; ctx.font = '11px ' + MONO; ctx.fillStyle = got === list.length ? '#9fdc8f' : '#ffd36b'; ctx.fillText('Tier ' + t + ': ' + TIER_NAMES[t - 1], tx0, ty);
    ctx.fillStyle = '#b8a890'; ctx.textAlign = 'right'; ctx.fillText(got + ' / ' + list.length + ' unlocked', tx0 + tw, ty); ty += 10;
    const cols = Math.floor(tw / 40);
    list.forEach((r, k) => {
      const x = tx0 + (k % cols) * 40, y2 = ty + Math.floor(k / cols) * 40, un = recipeUnlocked(r);
      const over = mouse.x >= x && mouse.x < x + 36 && mouse.y >= y2 && mouse.y < y2 + 36;
      ctx.fillStyle = un ? 'rgba(127,255,127,0.1)' : 'rgba(255,255,255,0.04)'; ctx.fillRect(x, y2, 36, 36);
      ctx.strokeStyle = over ? '#ffffff' : un ? 'rgba(127,255,127,0.4)' : 'rgba(233,226,212,0.15)'; ctx.strokeRect(x + 0.5, y2 + 0.5, 35, 35);
      ctx.globalAlpha = un ? 1 : 0.35; drawRecipeIcon(r, x + 4, y2 + 4, 28); ctx.globalAlpha = 1;
      if (!un) { ctx.fillStyle = '#d6a84a'; ctx.font = '10px ' + MONO; ctx.textAlign = 'right'; ctx.fillText('?', x + 33, y2 + 29); }
      if (over) { hover = r; hx = x + 40; hy = y2; }
    });
    ty += Math.ceil(list.length / cols) * 40 + 14;
  }
  if (hover) drawRecipeTip(hover, hx, hy, w);
}

/* ---------- Journal ---------- */
function drawJournal(w, h) {
  const pw = 780, ph = 440, px = Math.round(w / 2 - pw / 2), py = Math.max(46, Math.round(h / 2 - ph / 2));
  panel(px, py, pw, ph, 0.95);
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.font = '12px ' + MONO; ctx.fillStyle = '#e9e2d4'; ctx.fillText('Journal', px + 14, py + 18);
  const ids = Object.keys(state.quests).sort((a, b) => (state.quests[a].status === 'active' ? 0 : 1) - (state.quests[b].status === 'active' ? 0 : 1));
  if (!state.jsel || !state.quests[state.jsel]) state.jsel = ids[0];
  let y = py + 40;
  ids.forEach(id => {
    const d = QUEST_DEFS.find(q => q.id === id), qs = state.quests[id], on = state.jsel === id;
    ctx.fillStyle = on ? 'rgba(255,211,107,0.16)' : 'rgba(255,255,255,0.05)'; ctx.fillRect(px + 10, y, 220, 34);
    ctx.strokeStyle = on ? '#ffd36b' : 'rgba(233,226,212,0.18)'; ctx.strokeRect(px + 10.5, y + 0.5, 219, 33);
    ctx.font = '11px ' + MONO; ctx.fillStyle = qs.status === 'done' ? '#7fbf7f' : '#ffe9b0'; ctx.textAlign = 'left'; ctx.fillText(d.title, px + 18, y + 12);
    ctx.font = '9px ' + MONO; ctx.fillStyle = '#b8a890'; ctx.fillText(qs.status === 'done' ? 'Completed' : d.steps.filter(s => qs.done[s.id]).length + ' of ' + d.steps.length + ' steps' + (state.pinned === id ? '   (tracked)' : ''), px + 18, y + 25);
    state.uiRects.push({ x: px + 10, y, w: 220, h: 34, fn: () => { state.jsel = id; } });
    y += 38;
  });
  const d = QUEST_DEFS.find(q => q.id === state.jsel), dx = px + 250, dw = pw - 270;
  ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(dx - 8, py + 34, dw + 16, ph - 48);
  if (d) {
    const qs = state.quests[d.id];
    let yy = py + 54;
    ctx.textAlign = 'left'; ctx.font = '15px ' + MONO; ctx.fillStyle = '#ffe9b0'; ctx.fillText(d.title, dx, yy);
    ctx.font = '10px ' + MONO; ctx.fillStyle = '#b8a890'; ctx.fillText('From: ' + d.giver, dx, yy + 18); yy += 40;
    ctx.font = '11px ' + MONO; ctx.fillStyle = '#e8dcc0';
    wrapText(d.desc, dw).forEach(l => { ctx.fillText(l, dx, yy); yy += 15; }); yy += 8;
    ctx.fillStyle = '#e9e2d4'; ctx.fillText('Objectives', dx, yy); yy += 18;
    d.steps.forEach(s => {
      const done = qs.done[s.id];
      ctx.fillStyle = done ? '#7fbf7f' : '#e8dcc0'; ctx.fillText((done ? '[x] ' : '[ ] ') + s.text, dx + 4, yy); yy += 17;
    });
    yy += 10; ctx.fillStyle = '#e9e2d4'; ctx.fillText('Reward', dx, yy); yy += 16;
    ctx.fillStyle = '#ffd36b'; ctx.fillText(d.reward.xp + ' XP, ' + d.reward.items.map(i => i.qty + ' ' + i.name).join(', '), dx + 4, yy);
    if (qs.status === 'active') button(dx, py + ph - 56, 150, 24, state.pinned === d.id ? 'Tracking this quest' : 'Track this quest', () => { state.pinned = d.id; }, state.pinned === d.id);
  }
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#b9b09d'; ctx.textAlign = 'left'; ctx.fillText('New entries appear as you play. J or Esc closes.', px + 14, py + ph - 14);
}

/* ---------- Settlement manager ---------- */
function drawSettlement(w, h) {
  const pw = 900, ph = 540, px = Math.round(w / 2 - pw / 2), py = Math.max(46, Math.round(h / 2 - ph / 2));
  panel(px, py, pw, ph, 0.95);
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.font = '12px ' + MONO; ctx.fillStyle = '#e9e2d4'; ctx.fillText('Settlement', px + 14, py + 18);
  // left: overview
  let y = py + 44;
  const chests = chestList(), slots = chests.reduce((a, c) => a + c.st.slots.filter(Boolean).length, 0), cap = chests.length * 27;
  const rows = [['Settlers', settlers.length + ' of ' + bedCount() + ' beds'], ['Recovering', String(state.downed.length)], ['Comfort', comfort().toFixed(1) + ' (+' + Math.round(comfort() * 1.2) + '% work speed)'],
    ['Storage', chests.length + ' chests, ' + slots + '/' + cap + ' slots'], ['Walls', String(structCount(['wall', 'scrapwall', 'stonewall', 'steelwall']))], ['Gates', String(structCount(['gate']))],
    ['Guard posts', String(structCount(['guardpost']))], ['Turrets and traps', structCount(['turret']) + ' and ' + structCount(['trap'])], ['Raids survived', String(state.raidsSurvived)]];
  ctx.font = '10px ' + MONO;
  rows.forEach(([k, v]) => { ctx.fillStyle = '#b8a890'; ctx.textAlign = 'left'; ctx.fillText(k, px + 14, y); ctx.fillStyle = '#fff6e4'; ctx.textAlign = 'right'; ctx.fillText(v, px + 250, y); y += 17; });
  y += 10; ctx.textAlign = 'left'; ctx.font = '12px ' + MONO; ctx.fillStyle = '#e9e2d4'; ctx.fillText('In storage', px + 14, y); y += 16;
  const tot = {};
  for (const c of chests) for (const s of c.st.slots) if (s) tot[s.name] = (tot[s.name] || 0) + s.qty;
  const names = Object.keys(tot).sort((a, b) => tot[b] - tot[a]).slice(0, 14);
  ctx.font = '10px ' + MONO;
  if (!names.length) { ctx.fillStyle = '#9a8a74'; ctx.fillText(chests.length ? 'The chests are empty.' : 'Build a Storage Chest first.', px + 14, y); }
  names.forEach((n, k) => { const cx = px + 14 + (k % 2) * 124, cy = y + Math.floor(k / 2) * 17; drawIcon(n, cx, cy - 6, 12); ctx.fillStyle = '#e8dcc0'; ctx.textAlign = 'left'; ctx.fillText(n + ' ' + tot[n], cx + 16, cy); });
  // right: settlers
  const rx = px + 276, rw = pw - 290;
  ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(rx - 6, py + 34, rw + 12, ph - 48);
  const cardH = 112, vis = Math.floor((ph - 70) / cardH);
  const all = settlers.concat(state.downed.map(d => d.s));
  state.settleScroll = Math.max(0, Math.min(state.settleScroll || 0, Math.max(0, all.length - vis)));
  if (!all.length) { ctx.textAlign = 'left'; ctx.font = '11px ' + MONO; ctx.fillStyle = '#b9b09d'; ctx.fillText('No settlers yet. Find survivors in the ruins (look for the ? above their heads).', rx, py + 60); }
  all.slice(state.settleScroll, state.settleScroll + vis).forEach((s, k) => {
    const downed = state.downed.some(d => d.s === s), y0 = py + 44 + k * cardH;
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(rx, y0, rw, cardH - 6);
    ctx.drawImage(npcSprite(s, 0), 3, 1, 18, 18, rx + 6, y0 + 6, 48, 48);
    ctx.textAlign = 'left'; ctx.font = '12px ' + MONO; ctx.fillStyle = '#ffe9b0'; ctx.fillText(s.name, rx + 62, y0 + 14);
    ctx.font = '10px ' + MONO; ctx.fillStyle = downed ? '#e8a07a' : '#b8a890';
    const dn = state.downed.find(d => d.s === s);
    ctx.fillText(downed ? 'Recovering. Back in ' + Math.max(1, Math.round((dn.returnAt - state.gameMinutes) / 60)) + ' hours' : settlerStatus(s), rx + 62, y0 + 29);
    bar(rx + 62, y0 + 38, 90, 'HP', s.health / s.maxHealth * 100, '#c0392b', '');
    bar(rx + 158, y0 + 38, 90, 'Fed', s.hunger, '#f26f21', '');
    ctx.font = '9px ' + MONO; ctx.fillStyle = '#9a8a74'; ctx.fillText('Innate skills:  farm ' + s.skills.farm + '  guard ' + s.skills.guard + '  haul ' + s.skills.haul, rx + 62, y0 + 62);
    JOBS.slice(1).forEach((j, jk) => {
      const jx = rx + 6 + jk * 120, jy = y0 + 72, lv = jobLevel(s, j), xp = (s.jobXp && s.jobXp[j]) || 0, nextLv = Math.pow(lv, 2) * 8, prevLv = Math.pow(lv - 1, 2) * 8;
      ctx.font = '9px ' + MONO; ctx.fillStyle = s.job === j ? '#ffd36b' : '#b8a890'; ctx.fillText(j + ' lv ' + lv, jx, jy + 4);
      ctx.fillStyle = '#1a0e16'; ctx.fillRect(jx, jy + 10, 100, 4); ctx.fillStyle = s.job === j ? '#ffd36b' : '#6a8a5a'; ctx.fillRect(jx + 1, jy + 11, 98 * (lv >= 10 ? 1 : Math.max(0, Math.min(1, (xp - prevLv) / (nextLv - prevLv)))), 2);
    });
    if (!downed) {
      button(rx + rw - 296, y0 + 8, 130, 22, 'Job: ' + s.job + ' >', () => { s.job = JOBS[(JOBS.indexOf(s.job) + 1) % JOBS.length]; s.task = null; });
      button(rx + rw - 160, y0 + 8, 70, 22, 'Talk', () => openTalk(s));
      button(rx + rw - 84, y0 + 8, 74, 22, 'Dismiss', () => dismissSettler(s));
    }
  });
  if (all.length > vis) { ctx.font = '9px ' + MONO; ctx.fillStyle = '#9a8a74'; ctx.textAlign = 'right'; ctx.fillText('Scroll with the wheel (' + (state.settleScroll + 1) + '-' + Math.min(all.length, state.settleScroll + vis) + ' of ' + all.length + ')', rx + rw, py + ph - 14); }
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#b9b09d'; ctx.textAlign = 'left'; ctx.fillText('Settlers get better at a job by doing it.', px + 14, py + ph - 14);
}

/* ---------- Settings, pause and title ---------- */
function toggleRow(x, y, w, label, hint, valueText, fn, on) {
  ctx.font = '11px ' + MONO; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#e8dcc0'; ctx.fillText(label, x, y + 8);
  ctx.font = '9px ' + MONO; ctx.fillStyle = '#9a8a74'; ctx.fillText(hint, x, y + 22);
  button(x + w - 170, y, 170, 24, valueText, fn, on);
}
function drawSettings(w, h, standalone) {
  const pw = 560, ph = 470, px = Math.round(w / 2 - pw / 2), py = Math.max(46, Math.round(h / 2 - ph / 2));
  panel(px, py, pw, ph, 0.97);
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.font = '13px ' + MONO; ctx.fillStyle = '#e9e2d4'; ctx.fillText('Settings', px + 16, py + 20);
  let y = py + 44; const x = px + 18, rw = pw - 36;
  toggleRow(x, y, rw, 'Sound', 'Footsteps, combat, wind, Geiger clicks. (V toggles it.)', settings.muted ? 'Off' : 'On', () => { settings.muted = !settings.muted; applySettings(); }, !settings.muted); y += 42;
  toggleRow(x, y, rw, 'Volume', 'Master volume', Math.round(settings.volume * 100) + '%   (click to change)', () => { settings.volume = settings.volume >= 0.95 ? 0.15 : settings.volume + 0.2; settings.volume = Math.round(settings.volume * 100) / 100; applySettings(); sfx('craft'); }); y += 42;
  toggleRow(x, y, rw, 'Pause in menus', 'The world waits while a menu is open.', settings.pauseInMenus ? 'On' : 'Off', () => { settings.pauseInMenus = !settings.pauseInMenus; saveSettings(); }, settings.pauseInMenus); y += 42;
  toggleRow(x, y, rw, 'When a settler falls', 'Knocked out for a day then back (default), or gone for good.', settings.permaDeath ? 'Permanent death' : 'Return after a day', () => { settings.permaDeath = !settings.permaDeath; saveSettings(); }, !settings.permaDeath); y += 42;
  toggleRow(x, y, rw, 'Survival difficulty', 'How fast hunger and thirst drain.', settings.drain < 0.9 ? 'Relaxed' : settings.drain > 1.1 ? 'Harsh' : 'Normal', () => { settings.drain = settings.drain < 0.9 ? 1 : settings.drain > 1.1 ? 0.6 : 1.4; saveSettings(); }); y += 42;
  toggleRow(x, y, rw, 'Screen shake', 'Ambush and impact shake.', settings.shake ? 'On' : 'Off', () => { settings.shake = !settings.shake; saveSettings(); }, settings.shake); y += 42;
  toggleRow(x, y, rw, 'Low health effect', 'Colour drains and the edges turn red as you get hurt.', settings.lowHp ? 'On' : 'Off', () => { settings.lowHp = !settings.lowHp; saveSettings(); }, settings.lowHp); y += 42;
  toggleRow(x, y, rw, 'Autosave', 'Saves each morning and when you sleep.', settings.autosave ? 'On' : 'Off', () => { settings.autosave = !settings.autosave; saveSettings(); }, settings.autosave); y += 46;
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#b8a890'; ctx.textAlign = 'left';
  ctx.fillText('WASD move   click use   1-9 or wheel hotbar   right-click eat/wear   R rotate   F move   X remove', x, y); y += 14;
  ctx.fillText('I bag   C craft   M map   P progress   J journal   B settlement   V sound   Esc menu', x, y);
  if (standalone) button(px + pw - 110, py + ph - 38, 94, 26, 'Back', () => { state.settingsOpen = false; if (state.pauseFrom) state.pauseOpen = true; });
}
function drawPause(w, h) {
  const pw = 320, ph = 330, px = Math.round(w / 2 - pw / 2), py = Math.round(h / 2 - ph / 2);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillRect(0, 0, w, h);
  panel(px, py, pw, ph, 0.97);
  ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.font = '18px ' + MONO; ctx.fillStyle = '#ffe9b0'; ctx.fillText('Paused', w / 2, py + 28);
  const bx = px + 40, bw = pw - 80; let y = py + 56;
  button(bx, y, bw, 32, 'Resume', () => { state.pauseOpen = false; }); y += 40;
  button(bx, y, bw, 32, 'Save game', () => saveGame(true)); y += 40;
  button(bx, y, bw, 32, hasSave() ? 'Load game' : 'Load game (no save yet)', () => { if (hasSave()) { loadGame(); state.pauseOpen = false; } }); y += 40;
  button(bx, y, bw, 32, 'Menu: Inventory, crafting, map...', () => openMenu('invOpen')); y += 40;
  button(bx, y, bw, 32, 'Settings', () => { state.pauseOpen = false; state.settingsOpen = true; state.pauseFrom = true; }); y += 40;
  button(bx, y, bw, 32, 'Return to title', () => { saveGame(false); closePanels(); state.title = true; }); y += 40;
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#b8a890'; ctx.fillText('Esc to resume', w / 2, py + ph - 16);
}
function drawTitle(w, h) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = 'rgba(8,6,12,0.66)'; ctx.fillRect(0, 0, w, h);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '44px ' + MONO; ctx.fillStyle = '#000'; ctx.fillText('WASTELAND SETTLEMENT', w / 2 + 3, h * 0.26 + 3); ctx.fillStyle = '#ffe9b0'; ctx.fillText('WASTELAND SETTLEMENT', w / 2, h * 0.26);
  ctx.font = '13px ' + MONO; ctx.fillStyle = '#c8b8a0'; ctx.fillText('The world ended. You are still here. Build something.', w / 2, h * 0.26 + 38);
  const bw = 260, bx = Math.round(w / 2 - bw / 2); let y = Math.round(h * 0.45);
  if (state.settingsOpen) { drawSettings(w, h, true); return; }
  if (hasSave()) { button(bx, y, bw, 36, 'Continue', () => { if (loadGame()) state.title = false; }, true); y += 46; }
  button(bx, y, bw, 36, state.titleConfirm ? 'Really start over? Click again' : 'New game', () => { if (hasSave() && !state.titleConfirm) { state.titleConfirm = true; return; } state.titleConfirm = false; state.title = false; }); y += 46;
  button(bx, y, bw, 36, 'Settings', () => { state.settingsOpen = true; state.pauseFrom = false; });
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#8a7a64'; ctx.fillText('Your game saves in this browser. Use Esc in-game for the menu.', w / 2, Math.round(h * 0.45) + 160);
}

/* ---------- Talking and trading ---------- */
function drawTalk(w, h) {
  const n = state.talk;
  if (!n) return;
  const pw = 600, ph = 184, px = Math.round(w / 2 - pw / 2), py = h - ph - 70;
  panel(px, py, pw, ph, 0.96);
  ctx.fillStyle = '#2a1a22'; ctx.fillRect(px + 12, py + 12, 72, 72);
  ctx.drawImage(npcSprite(n, 0), 3, 1, 18, 18, px + 14, py + 14, 68, 68);
  ctx.strokeStyle = '#2a1018'; ctx.strokeRect(px + 12.5, py + 12.5, 71, 71);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.font = '14px ' + MONO; ctx.fillStyle = '#ffe9b0'; ctx.fillText(n.name, px + 98, py + 22);
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#b8a890';
  const sk = n.skills || { farm: 0, guard: 0, haul: 0 };
  const sub = n.kind === 'settler' ? 'Settler, ' + n.job.toLowerCase() + ' (level ' + jobLevel(n, n.job) + ')' : n.kind === 'merchant' ? 'Travelling merchant' : n.kind === 'traveller' ? 'Traveller' : n.wounded ? 'Wounded survivor' : 'Survivor';
  ctx.fillText(sub + (n.kind === 'merchant' || n.kind === 'traveller' ? '' : '   Farm ' + sk.farm + '  Guard ' + sk.guard + '  Haul ' + sk.haul), px + 98, py + 40);
  ctx.font = '12px ' + MONO; ctx.fillStyle = '#e8dcc0';
  wrapText(state.talkLine || '', pw - 114).slice(0, 4).forEach((l, k) => ctx.fillText(l, px + 98, py + 62 + k * 16));
  const by = py + ph - 34;
  if (n.kind === 'merchant') {
    button(px + 12, by, 130, 24, 'Trade', () => openTrade(n), true);
    button(px + 148, by, 170, 24, 'Ask about the road', () => { state.talkLine = npcReply(n, 'road'); });
  } else if (n.kind === 'traveller') {
    button(px + 12, by, 170, 24, n.used ? 'Already shared' : 'Ask for rumours', () => {
      if (n.used) { state.talkLine = 'I have told you what I know.'; return; }
      n.used = true;
      const targets = HOT_SPOTS.concat(ruins.map(r => ({ x: r.x0 + r.w / 2, y: r.y0 + r.h / 2 })));
      const t = targets[Math.floor(Math.random() * targets.length)];
      revealFogR(Math.round(t.x), Math.round(t.y), 16); skillXp('exploring', 8);
      state.talkLine = RUMOURS[Math.floor(Math.random() * RUMOURS.length)] + ' (They sketch something onto your map.)';
    });
    button(px + 188, by, 170, 24, 'Share some food', () => {
      const f = ['Canned food', 'Cooked Fish', 'Baked Potato', 'Radish', 'Potato', 'Berries'].find(q => countItem(q) > 0);
      if (!f) { state.talkLine = 'You have nothing to share.'; return; }
      takeItems({ [f]: 1 }); addItem('Caps', 12); sfx('pickup');
      state.talkLine = 'Kind of you. Here, take these, I have no use for them.';
    });
  } else if (n.kind === 'survivor') {
    if (n.scared) { ctx.fillStyle = '#ff9a8a'; ctx.font = '11px ' + MONO; ctx.fillText('They are too frightened to talk. Clear the monsters nearby first.', px + 98, by - 8); }
    else {
      button(px + 12, by, 120, 24, 'Who are you?', () => { state.talkLine = npcReply(n, 'bio'); });
      button(px + 138, by, 130, 24, 'What can you do?', () => { state.talkLine = npcReply(n, 'skills'); });
      if (n.wounded && !n.healed) button(px + 274, by, 150, 24, 'Use a Bandage', () => { if (countItem('Bandage') > 0) { takeItems({ 'Bandage': 1 }); n.healed = true; skillXp('exploring', 6); state.talkLine = 'Thank you. I mean it. I can walk now.'; sfx('eat'); } else state.talkLine = 'You have no Bandage on you.'; });
      else { const free = freeBed(); button(px + 274, by, 190, 24, free ? 'Join my settlement' : 'Join (needs a free bed)', () => { if (recruit(n)) state.talk = null; }, !!free); }
    }
  } else {
    button(px + 12, by, 110, 24, 'How are you?', () => { state.talkLine = npcReply(n, 'status'); });
    button(px + 128, by, 100, 24, 'Backstory', () => { state.talkLine = npcReply(n, 'bio'); });
    button(px + 234, by, 160, 24, 'Job: ' + n.job + ' >', () => { n.job = JOBS[(JOBS.indexOf(n.job) + 1) % JOBS.length]; n.task = null; state.talkLine = 'Okay. ' + (n.job === 'Idle' ? 'Taking it easy.' : n.job + ' it is.'); });
    button(px + 400, by, 70, 24, 'Dismiss', () => { dismissSettler(n); state.talk = null; });
  }
  button(px + pw - 100, by, 88, 24, 'Leave', () => { state.talk = null; });
}
function drawTrade(w, h) {
  const n = state.trade;
  if (!n) return;
  const pw = 760, ph = 460, px = Math.round(w / 2 - pw / 2), py = Math.max(30, Math.round(h / 2 - ph / 2));
  panel(px, py, pw, ph, 0.97);
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.font = '13px ' + MONO; ctx.fillStyle = '#ffe9b0'; ctx.fillText(n.name + ' will trade', px + 16, py + 20);
  ctx.textAlign = 'right'; ctx.fillStyle = '#e8c24a'; ctx.fillText(countItem('Caps') + ' caps', px + pw - 16, py + 20);
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#b8a890'; ctx.textAlign = 'left';
  ctx.fillText('Their stock. Click to buy one, right-click to buy five.', px + 16, py + 44);
  ctx.fillText('Your things. Click to sell one, right-click to sell the stack. Half value.', px + 392, py + 44);
  const cell = 56, cols = 6;
  let hover = null, hx = 0, hy = 0, hprice = '';
  n.stock.forEach((s, i) => {
    const x = px + 16 + (i % cols) * cell, y = py + 58 + Math.floor(i / cols) * (cell + 8), over = mouse.x >= x && mouse.x < x + cell - 4 && mouse.y >= y && mouse.y < y + cell - 4;
    slotFrame(x, y, cell - 4, s, false, over);
    drawIcon(s.name, x + 8, y + 5, 36);
    ctx.font = '10px ' + MONO; ctx.textAlign = 'right'; ctx.fillStyle = '#fff'; ctx.fillText('x' + s.qty, x + cell - 7, y + 12);
    ctx.textAlign = 'center'; ctx.fillStyle = countItem('Caps') >= s.price ? '#e8c24a' : '#a86a5a'; ctx.fillText(s.price + 'c', x + (cell - 4) / 2, y + cell - 8);
    if (over) { hover = s; hx = x; hy = y; hprice = 'Buy for ' + s.price + ' caps'; }
    state.uiRects.push({ x, y, w: cell - 4, h: cell - 4, fn: b => buyItem(n, i, b === 2 ? 5 : 1) });
  });
  const inv = state.player.inventory;
  let k = 0;
  inv.forEach((s, i) => {
    if (!s || s.name === 'Caps') return;
    const x = px + 392 + (k % 6) * cell, y = py + 58 + Math.floor(k / 6) * (cell + 8), over = mouse.x >= x && mouse.x < x + cell - 4 && mouse.y >= y && mouse.y < y + cell - 4;
    k++;
    slotFrame(x, y, cell - 4, s, false, over);
    drawIcon(s.name, x + 8, y + 5, 36);
    ctx.font = '10px ' + MONO; ctx.textAlign = 'right'; ctx.fillStyle = '#fff'; if (s.qty > 1) ctx.fillText('x' + s.qty, x + cell - 7, y + 12);
    ctx.textAlign = 'center'; ctx.fillStyle = '#e8c24a'; ctx.fillText(sellValue(s.name) + 'c', x + (cell - 4) / 2, y + cell - 8);
    if (over) { hover = s; hx = x; hy = y; hprice = 'Sell for ' + sellValue(s.name) + ' caps' + (s.qty > 1 ? ' each' : ''); }
    state.uiRects.push({ x, y, w: cell - 4, h: cell - 4, fn: b => sellItem(i, b === 2) });
  });
  button(px + pw - 100, py + ph - 38, 84, 26, 'Done', () => { state.trade = null; });
  if (hover) { drawTooltip(hover, hx + 50, hy, w); ctx.font = '10px ' + MONO; ctx.textAlign = 'left'; ctx.fillStyle = '#e8c24a'; ctx.fillText(hprice, px + 16, py + ph - 24); }
}

