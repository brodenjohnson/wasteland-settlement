/* =====================================================================
   EXTRAS: codex, quick-stack to chests, difficulty presets
   ===================================================================== */
state.codexOpen = false; state.codexTab = 0; state.codexScroll = 0; state.codexSel = {};
state.codex = { creatures: {}, items: {}, people: {}, places: {} };
if (settings.raidScale === undefined) settings.raidScale = 1;
if (settings.radScale === undefined) settings.radScale = 1;
if (!settings.diff) settings.diff = 'normal';
const DIFFS = { relaxed: { label: 'Relaxed', drain: 0.6, raidScale: 0.7, radScale: 0.7 }, normal: { label: 'Normal', drain: 1, raidScale: 1, radScale: 1 }, harsh: { label: 'Harsh', drain: 1.4, raidScale: 1.4, radScale: 1.25 } };
function applyDiff() { const d = DIFFS[settings.diff] || DIFFS.normal; settings.drain = d.drain; settings.raidScale = d.raidScale; settings.radScale = d.radScale; saveSettings(); }
function cycleDiff() { const order = ['relaxed', 'normal', 'harsh']; settings.diff = order[(order.indexOf(settings.diff) + 1) % 3]; applyDiff(); toast('Difficulty: ' + DIFFS[settings.diff].label, 2); }
applyDiff();
MENU_TABS.splice(6, 0, ['Codex', 'codexOpen']);
{ const o = closePanels; closePanels = function () { state.codexOpen = false; o(); }; }
{ const o = closeMenusOnly; closeMenusOnly = function () { state.codexOpen = false; o(); }; }
{ const o = anyMenuOpen; anyMenuOpen = function () { return state.codexOpen || o(); }; }
{ const o = hubOpen; hubOpen = function () { return state.codexOpen || o(); }; }
{ const o = addItem; addItem = function (name, qty, inv) { if (!inv || inv === state.player.inventory) state.codex.items[name] = 1; return o(name, qty, inv); }; }

const CREATURE_LORE = {
  glowrat: 'A rat that drank from the wrong puddle. The glowing eyes are the only polite thing about it.',
  hound: 'Wild dogs gone lean and grey. They run in the open, and they are quicker than you are.',
  husk: 'Something that used to be a person. Slow, heavy, and it does not stop.',
  scrapper: 'A raider with a club and a bad attitude. Takes what it cannot scrap.',
  gunner: 'A raider with a pistol who would rather not get close.'
};
const PLACE_LORE = {
  'The Wastes': 'Open ground between everything else. Mild radiation, the odd ambush, and now and then a merchant.',
  'Home Valley': 'A cliff-walled valley with two gates. Radiation-free, and the only place that feels safe.',
  'Whisper Pines': 'Dense forest. Dark under the canopy, and things wait in it until you are close.',
  'The Ashlands': 'Grey flats in the north-east with a steady, low radiation. Ash hounds roam here.',
  'Fallen City': 'Broken towers in the east. Rich crates, raiders, and an armoury.',
  'Toxic Marsh': 'Irradiated shallows in the south-east. The water here is not for drinking.',
  'The Quarry': 'Stone and iron ore in the south. Good for materials.',
  'The Scrapyard': 'Heaps of scrap and a few buildings still standing.'
};
let codexT = 0;
function codexFind(cat, key, label, val, quiet) {
  if (state.codex[cat][key]) return;
  state.codex[cat][key] = val || 1;
  if (!quiet) { toast('Codex updated: ' + label, 2.5); sfx('pickup'); }
}
function updateCodex(dt) {
  codexT -= dt;
  if (codexT > 0 || state.title) return;
  codexT = 0.5;
  const p = state.player;
  for (const e of enemies) if (!e.hidden && Math.hypot(e.x - p.x, e.y - p.y) < 190) codexFind('creatures', e.type, ENEMY_TYPES[e.type].name);
  for (const s of survivors) if (Math.hypot(s.x - p.x, s.y - p.y) < 150) codexFind('people', s.name, s.name);
  for (const s of settlers) codexFind('people', s.name, s.name, 1, true);
  for (const n of encNpcs) if (n.name && Math.hypot(n.x - p.x, n.y - p.y) < 150) codexFind('people', n.name, n.name, { kind: n.kind, bio: n.bio });
  const zn = ZONE_NAMES[state.zone];
  if (zn) codexFind('places', zn, zn, 1, zn === 'Home Valley' || zn === 'The Wastes');
}
{ const o = updateStorm; updateStorm = function (dt) { o(dt); updateCodex(dt); }; }
const CODEX_TABS = ['Creatures', 'Items', 'People', 'Places'];
function codexUniverse() {
  const c = state.codex;
  const items = [...new Set([...Object.keys(ITEM_COL), ...Object.keys(WEAPONS), ...RECIPES.flatMap(r => r.gives ? Object.keys(r.gives) : [])])].filter(n => !/^Kit: /.test(n)).sort();
  const names = SURVIVOR_DEFS.map(d => d.name);
  Object.keys(c.people).forEach(n => { if (!names.includes(n)) names.push(n); });
  return [
    Object.keys(ENEMY_TYPES).map(k => ({ key: k, label: ENEMY_TYPES[k].name, found: !!c.creatures[k] })),
    items.map(n => ({ key: n, label: n, found: !!c.items[n] })).sort((a, b) => (b.found - a.found) || a.label.localeCompare(b.label)),
    names.map(n => ({ key: n, label: n, found: !!c.people[n] })).sort((a, b) => b.found - a.found),
    ZONE_NAMES.map(n => ({ key: n, label: n, found: !!c.places[n] }))
  ];
}
function codexDetail(tab, key, dx, y, dw) {
  const line = (t, col, f) => { ctx.font = (f || 11) + 'px ' + MONO; ctx.fillStyle = col || '#e8dcc0'; ctx.fillText(t, dx, y); y += (f || 11) + 6; };
  const para = (t, col) => { ctx.font = '11px ' + MONO; ctx.fillStyle = col || '#e8dcc0'; wrapText(t, dw).forEach(l => { ctx.fillText(l, dx, y); y += 15; }); y += 4; };
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  if (tab === 0) {
    const t = ENEMY_TYPES[key];
    line(t.name, '#ffe9b0', 15); y += 4; para(CREATURE_LORE[key] || '');
    line('Health ' + t.hp + '    Damage ' + t.dmg + '    Speed ' + t.speed, '#b8a890', 10);
    line('Notices you from ' + t.aggro + ' px    XP ' + t.xp + (t.ranged ? '    Ranged' : ''), '#b8a890', 10); y += 6;
    line('May drop', '#e9e2d4');
    (DROPS[key] || []).forEach(d => line(d.n + '  (' + Math.round(d.c * 100) + '%)', '#ffd36b', 10));
  } else if (tab === 1) {
    drawIcon(key, dx, y - 8, 44); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.font = '15px ' + MONO; ctx.fillStyle = '#ffe9b0'; ctx.fillText(key, dx + 56, y + 14); y += 58;
    if (ITEM_DESC[key]) para(ITEM_DESC[key]);
    line('Trade value: about ' + itemValue(key) + ' caps', '#b8a890', 10); y += 4;
    if (statRows(key).length) { drawStatBlock(key, dx, y + 6, Math.min(dw, 320)); y += statRows(key).length * 16 + 40; }
    const rs = RECIPES.filter(r => r.gives && r.gives[key]);
    rs.forEach(r => { line('Craft: ' + Object.keys(r.cost).map(k => r.cost[k] + ' ' + k).join(', ') + '  (tier ' + (r.tier || 1) + ')', '#8fd0ff', 10); });
  } else if (tab === 2) {
    const d = SURVIVOR_DEFS.find(q => q.name === key), v = state.codex.people[key];
    line(key, '#ffe9b0', 15); y += 4;
    if (d) { para(d.bio); line('Found near: ' + d.ruin, '#b8a890', 10); line('Farming ' + d.skills.farm + '    Guarding ' + d.skills.guard + '    Hauling ' + d.skills.haul, '#b8a890', 10); }
    else if (v && v.bio) { para(v.bio); line(v.kind === 'merchant' ? 'Travelling merchant' : 'Traveller', '#b8a890', 10); }
  } else {
    line(key, '#ffe9b0', 15); y += 4; para(PLACE_LORE[key] || '');
  }
}
function drawCodex(w, h) {
  const pw = 860, ph = 520, px = Math.round(w / 2 - pw / 2), py = Math.max(46, Math.round(h / 2 - ph / 2));
  panel(px, py, pw, ph, 0.96);
  const lists = codexUniverse();
  const total = lists.reduce((a, l) => a + l.length, 0), found = lists.reduce((a, l) => a + l.filter(e => e.found).length, 0);
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.font = '12px ' + MONO; ctx.fillStyle = '#e9e2d4'; ctx.fillText('Codex', px + 14, py + 18);
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#b8a890'; ctx.fillText(found + ' of ' + total + ' discovered', px + 70, py + 18);
  CODEX_TABS.forEach((nm, k) => button(px + 14 + k * 134, py + 34, 128, 24, nm + ' ' + lists[k].filter(e => e.found).length + '/' + lists[k].length, () => { state.codexTab = k; state.codexScroll = 0; }, state.codexTab === k));
  const tab = state.codexTab, list = lists[tab], rows = 17, rh = 24, ly = py + 70;
  state.codexScroll = Math.max(0, Math.min(state.codexScroll, list.length - rows));
  if (!state.codexSel[tab] || !list.some(e => e.key === state.codexSel[tab])) state.codexSel[tab] = (list.find(e => e.found) || list[0]).key;
  list.slice(state.codexScroll, state.codexScroll + rows).forEach((e, n) => {
    const y = ly + n * rh, on = state.codexSel[tab] === e.key;
    ctx.fillStyle = on ? 'rgba(255,211,107,0.16)' : 'rgba(255,255,255,0.05)'; ctx.fillRect(px + 14, y, 250, rh - 2);
    ctx.strokeStyle = on ? '#ffd36b' : 'rgba(233,226,212,0.14)'; ctx.strokeRect(px + 14.5, y + 0.5, 249, rh - 3);
    ctx.font = '11px ' + MONO; ctx.textAlign = 'left'; ctx.fillStyle = e.found ? '#ffe9b0' : '#6f6558'; ctx.fillText(e.found ? e.label : '???', px + 22, y + 11);
    state.uiRects.push({ x: px + 14, y, w: 250, h: rh - 2, fn: () => { state.codexSel[tab] = e.key; } });
  });
  if (list.length > rows) { ctx.font = '9px ' + MONO; ctx.fillStyle = '#9a8a74'; ctx.fillText('Wheel scrolls  (' + (state.codexScroll + 1) + '-' + Math.min(list.length, state.codexScroll + rows) + ' of ' + list.length + ')', px + 14, ly + rows * rh + 8); }
  const dx = px + 290, dw = pw - 310;
  ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(dx - 12, py + 66, dw + 24, ph - 84);
  const sel = list.find(e => e.key === state.codexSel[tab]);
  if (sel && sel.found) codexDetail(tab, sel.key, dx, py + 92, dw);
  else { ctx.font = '12px ' + MONO; ctx.fillStyle = '#8a7e6c'; ctx.textAlign = 'left'; ctx.fillText('Not discovered yet.', dx, py + 92); ctx.font = '10px ' + MONO; ctx.fillText(tab === 0 ? 'Get close enough to see one.' : tab === 1 ? 'Pick one up, craft it or trade for it.' : tab === 2 ? 'Meet them out in the wasteland.' : 'Go and have a look.', dx, py + 112); }
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#b9b09d'; ctx.textAlign = 'left'; ctx.fillText('The codex fills in as you explore. O or Esc closes.', px + 14, py + ph - 14);
}

/* ---------- Quick-stack: bag items that the open chest already holds ---------- */
function quickStack() {
  const st = structs.get(state.chestOpen);
  if (!st || !st.slots) return;
  const inv = state.player.inventory; let moved = 0;
  for (let i = CONFIG.hotbar; i < inv.length; i++) {
    const s = inv[i];
    if (!s || !st.slots.some(c => c && c.name === s.name)) continue;
    const max = ITEM_STACK[s.name] || CONFIG.inventory.stackSize;
    for (const c of st.slots) if (c && c.name === s.name && c.qty < max && s.qty > 0) { const n = Math.min(max - c.qty, s.qty); c.qty += n; s.qty -= n; moved += n; }
    if (s.qty > 0) { const f = st.slots.findIndex(c => !c); if (f >= 0) { st.slots[f] = Object.assign({}, s); moved += s.qty; s.qty = 0; } }
    if (s.qty <= 0) inv[i] = null;
  }
  toast(moved ? 'Stacked ' + moved + ' items into the chest.' : 'Nothing in your bag matches this chest yet.', 2);
  if (moved) sfx('pickup');
}
{ const o = drawChestPanel; drawChestPanel = function (w, h) {
  o(w, h);
  if (state.chestOpen === null) return;
  const cols = 9, cell = 40, pad = 14, pw = pad * 2 + 112 + cols * cell + 6, ph = 168;
  const ipy = Math.max(8, Math.round(h / 2 - 326 / 2)) + 100, px = Math.round(w / 2 - pw / 2), py = ipy - ph - 8;
  button(px + pad, py + 36, 96, 22, 'Quick-stack (Q)', quickStack);
}; }

