/* =====================================================================
   AT_PROGRESSION: crafting tiers tied to camp levels (docs/CRAFTING_PLAN.md).
   Each camp level unlocks a station, and the Forge, Anvil and Machine Shop
   switch their tier on across the camp. Weapons, armour and medicine are made
   in person at their own stations. Blueprints are for unique items only.
   Also: sleeping at any hour, the Clinic Bed, gentler raid scaling, and the
   Progress screen laid out by camp level.
   ===================================================================== */
const OLD_BP = new Set(Object.keys(BLUEPRINTS));
const WALKUP = new Set(['weaponbench', 'armourbench', 'medstation']);
const BENCH_TAB = { weaponbench: 'Weapons', armourbench: 'Armour', medstation: 'Medical' };
const TIER_GATE = { 2: { lvl: 3, st: ['forge'] }, 3: { lvl: 4, st: ['anvil'] }, 4: { lvl: 6, st: ['machineshop', 'generator'] } };

/* ---------- New stations ---------- */
CRAFT_TABS.push('Medical');
Object.assign(STATION_NAMES, { medstation: 'Medical Station', generator: 'Generator', machineshop: 'Machine Shop' });
Object.assign(STRUCT_HP, { medstation: 110, generator: 220, machineshop: 260 });
STRUCT_SPR.medstation = { h: 16, paint: c => { R(c, '#3a3a40', 1, 8, 14, 7); R(c, '#d8d8dc', 1, 7, 14, 2); R(c, '#2a2a30', 2, 14, 2, 2); R(c, '#2a2a30', 12, 14, 2, 2); R(c, '#e8e8ec', 4, 2, 8, 6); R(c, '#c0392b', 7, 3, 2, 4); R(c, '#c0392b', 6, 4, 4, 2); R(c, '#7ab0d0', 2, 5, 2, 2); R(c, '#e8c24a', 12, 5, 2, 2); } };
STRUCT_SPR.generator = { h: 18, paint: c => { R(c, '#2a2a30', 1, 6, 14, 11); R(c, '#4a6a3a', 2, 6, 12, 8); R(c, '#5a7a4a', 2, 6, 12, 2); R(c, '#14120f', 4, 9, 3, 3); R(c, '#e8c24a', 10, 9, 2, 2); R(c, '#8a8d94', 6, 1, 2, 5); R(c, '#5a5a64', 5, 0, 4, 2); R(c, '#2a2a30', 2, 15, 2, 2); R(c, '#2a2a30', 12, 15, 2, 2); } };
STRUCT_SPR.machineshop = { h: 20, paint: c => { R(c, '#3a3a42', 0, 8, 16, 11); R(c, '#5a5a64', 0, 8, 16, 2); R(c, '#2a2a30', 1, 18, 2, 2); R(c, '#2a2a30', 13, 18, 2, 2); R(c, '#8a8d94', 2, 2, 5, 6); R(c, '#c8c8d0', 3, 3, 3, 1); R(c, '#14120f', 4, 5, 1, 3); R(c, '#6a6e76', 9, 4, 6, 4); R(c, '#e8702a', 11, 6, 2, 1); R(c, '#d6a84a', 2, 11, 12, 1); } };
Object.assign(RECIPE_DESC, {
  workbench: 'The first crafting station. Tools, building parts and furniture are made here, from anywhere in your camp.', medstation: 'Bandages, rad tabs, medkits and tonics are made here, in person.', generator: 'Powers the Machine Shop. Turrets in the camp fire faster while it runs.',
  machineshop: 'Turns steel into machined parts and switches on the Industry tier. Needs a Generator.', weaponbench: 'Every weapon and all ammunition are made here, in person.',
  armourbench: 'Every piece of armour is made here, in person.', forge: 'Smelts metal plate. Building one switches on the Forge Age tier.', anvil: 'Makes steel ingots. Building one switches on the Settlement tier.'
});

/* ---------- New items ---------- */
Object.assign(ITEM_USE, { 'Trauma Kit': { heal: 140 } });
for (const [n, col, v, d] of [['Machined Parts', '#8a8d94', 30, 'Turned and pressed steel. The Industry tier is built from it.'], ['Trauma Kit', '#c0392b', 90, 'A proper surgical kit. Heals 140 in one go.']]) { ITEM_COL[n] = col; ITEM_STACK[n] = n === 'Trauma Kit' ? 5 : 50; VALUE[n] = v; ITEM_DESC[n] = d; }

/* ---------- Every recipe: where it is made, and its tier ---------- */
{ const k = RECIPES.findIndex(r => r.id === 'banner' && r.name === 'Banner'); if (k >= 0) RECIPES.splice(k, 1); }
const TIER_OF = {};
'machete spear crowbar rebar zipgun spiked_bat bolts scrap_helm scrap_vest scrap_greaves scrap_boots bracer pad_cap pad_jacket pad_trousers pad_shoes runner_wraps scrap_axe scrap_pick hoe can rod hammer bandage gate guardpost barricade forge anvil purifier stove clinic pipe sink sprinkler pipe_buried turret rack weaponbench armourbench trough rug table chair pot bookshelf banner stonewall tyrewall skullpike barrelfire feed_r feed_c hide_cloth bottles'.split(' ').forEach(id => TIER_OF[id] = 1);
'cleaver pistol rounds sawnoff shells crossbow prod scatter iron_helm iron_plate iron_greaves iron_boots scav_helm scav_body scav_legs scav_feet haz_hood haz_suit haz_pants rubber_boots lead_pendant geiger_band skull_neck iron_axe iron_pick can2 plate scrapwall floor_stone roof_scrap trap radtabs floor_tile floor_concrete'.split(' ').forEach(id => TIER_OF[id] = 2);
'scrap_smg sledge skullmace roadrifle bone_helm bone_body bone_legs bone_feet cap_helm cap_body cap_legs cap_feet gas_mask lead_apron ingot medkit can3 tonic'.split(' ').forEach(id => TIER_OF[id] = 3);
'steel_cleaver rifle ripsaw harpoon steel_helm steel_plate steel_greaves steel_boots steel_axe steel_pick steelwall'.split(' ').forEach(id => TIER_OF[id] = 4);
const MED_IDS = new Set(['bandage', 'radtabs', 'medkit', 'tonic']);
for (const r of RECIPES) {
  if (r.cat === 'Cooking') continue;
  if (TIER_OF[r.id]) r.tier = TIER_OF[r.id];
  if (r.cat === 'Weapons') r.station = 'weaponbench';
  else if (r.cat === 'Armour') r.station = 'armourbench';
  else if (MED_IDS.has(r.id)) { r.station = 'medstation'; r.cat = 'Medical'; }
  else if (r.id === 'plate') r.station = 'forge';
  else if (r.id === 'ingot') r.station = 'anvil';
  else if (r.id === 'steel_axe' || r.id === 'steel_pick') r.station = 'machineshop';
  else if (r.station && r.station !== 'workbench') r.station = 'workbench';
  r.unlock = null; if (!(r.skill && r.skill[0] === 'husbandry')) r.skill = null;
  if (r.tier === 4 && ['Weapons', 'Armour', 'Tools'].includes(r.cat)) r.cost = Object.assign({}, r.cost, { 'Machined Parts': 2 });
  if (r.id === 'steelwall') r.cost = Object.assign({}, r.cost, { 'Machined Parts': 1 });
}
rc('medstation', 'Build', 'Medical Station', 'workbench', { 'Wood': 6, 'Scrap': 4, 'Cloth': 4 }, { place: 'medstation', tier: 1 });
rc('generator', 'Build', 'Generator', 'workbench', { 'Scrap': 20, 'Metal plate': 6, 'Steel Ingot': 2 }, { place: 'generator', tier: 1 });
rc('machineshop', 'Build', 'Machine Shop', 'workbench', { 'Steel Ingot': 6, 'Metal plate': 10, 'Scrap': 20 }, { place: 'machineshop', tier: 1 });
rc('parts', 'Supplies', 'Machined Parts x2', 'machineshop', { 'Steel Ingot': 1, 'Scrap': 4 }, { gives: { 'Machined Parts': 2 }, tier: 4 });
rc('radaway', 'Medical', 'Rad-Away', 'medstation', { 'Purified Water': 1, 'Glowmelon': 1, 'Cloth': 1 }, { gives: { 'Rad-Away': 1 }, tier: 3 });
rc('trauma', 'Medical', 'Trauma Kit', 'medstation', { 'Medkit': 1, 'Machined Parts': 1, 'Healroot': 1 }, { gives: { 'Trauma Kit': 1 }, tier: 4 });
Object.assign(SL_REQ, { forge: 3, purifier: 2, anvil: 4, turret: 4, clinic: 3, pipe: 4, sink: 4, sprinkler: 4, pipe_buried: 4, generator: 5, machineshop: 6 });
delete SL_REQ.steelwall;

/* ---------- Tiers switch on when the camp is big enough and the station is built ---------- */
function campHas(type) { const v = wastesView(); if (!v) return false; for (const [, st] of v.structs) if (st.type === type) return true; return false; }
function tierOpen(t) { const g = TIER_GATE[t]; return !g || (settlementLevel() >= g.lvl && g.st.every(campHas)); }
const aN = n => (/^[AEIOU]/.test(n) ? 'an ' : 'a ') + n;
function tierGateText(t) { const g = TIER_GATE[t]; return g ? SL_NAMES[g.lvl - 1] + ' camp and ' + g.st.map(s => aN(STATION_NAMES[s])).join(' and ') : ''; }
{ const o = recipeUnlocked; recipeUnlocked = function (r) { return o(r) && (r.cat === 'Cooking' || tierOpen(r.tier || 1)); }; }
{ const o = unlockText; unlockText = function (r) {
  const t = o(r);
  if (r.cat === 'Cooking' || tierOpen(r.tier || 1)) return t;
  const s = 'the ' + TIER_NAMES[r.tier - 1] + ' tier (' + tierGateText(r.tier) + ')';
  return t ? s + ', plus ' + t : s;
}; }
function nearStation(type) {
  const p = state.player;
  for (const [si, st] of structs) { if (st.type !== type) continue; if (Math.hypot(((si % W) + 0.5) * TS - p.x, (Math.floor(si / W) + 0.5) * TS - p.y) <= CONFIG.player.craftRange) return true; }
  return false;
}
{ const o = stationNear; stationNear = function (type) { return WALKUP.has(type) ? nearStation(type) : o(type); }; }
{ const o = recipeStatus; recipeStatus = function (r) {
  const s = o(r);
  if (!s.ok && r.station && WALKUP.has(r.station) && recipeUnlocked(r) && !nearStation(r.station)) return { ok: false, why: 'Use a ' + STATION_NAMES[r.station] + ' in person' };
  return s;
}; }
// the Clean Water quest no longer waits on the forge
{ const q = QUEST_DEFS.find(d => d.id === 'water'); if (q && q.steps[0]) { q.steps[0].text = 'Grow your camp to an Outpost (camp level 2)'; q.steps[0].check = () => settlementLevel() >= 2; delete q.steps[0].event; } }

/* ---------- Walking up to a station opens its part of the crafting menu ---------- */
{ const o = getTarget; getTarget = function () {
  const t = o(); if (t) return t;
  const tx = Math.floor(state.mwx / TS), ty = Math.floor(state.mwy / TS);
  if (tx < 0 || ty < 0 || tx >= W || ty >= H) return null;
  const i = ty * W + tx, st = structs.get(i); if (!st) return null;
  const p = state.player, dist = Math.hypot((tx + 0.5) * TS - p.x, (ty + 0.5) * TS - p.y), base = { tx, ty, i, dist, inReach: dist <= CONFIG.player.reach + 8, canHarvest: true, tier: 0, kind: 0 };
  if (WALKUP.has(st.type)) return Object.assign(base, { res: { name: STATION_NAMES[st.type] + '  (click to craft)', item: '', bench: st.type, minTier: 0, tool: 'axe' } });
  if (st.type === 'clinic') return Object.assign(base, { res: { name: 'Clinic Bed  (click to sleep and heal)', item: '', clinicBed: true, minTier: 0, tool: 'axe' } });
  return null;
}; }
function openBench(type) { closePanels(); state.craftOpen = true; state.craftTab = Math.max(0, CRAFT_TABS.indexOf(BENCH_TAB[type])); state.craftScroll = 0; sfx('click'); }
{ const o = doTargetAction; doTargetAction = function (t) {
  if (t && t.res && t.res.bench) { if (t.inReach) openBench(t.res.bench); else toast('Walk up to the ' + STATION_NAMES[t.res.bench] + ' to use it.', 2); state.actCd = 0.4; return; }
  if (t && t.res && t.res.clinicBed) { if (!t.inReach) { toast('Walk up to the bed.', 2); return; } state.sleepClinic = true; trySleep(); if (!state.sleeping) state.sleepClinic = false; state.actCd = 0.8; return; }
  if (t && t.res && t.res.bed) state.sleepClinic = false;
  return o(t);
}; }

/* ---------- Sleep at any hour when it is safe, and get up when you like ---------- */
{ const o = sleepBlockReason; sleepBlockReason = function () {
  const h = clockHour(), p = state.player;
  if (state.raid || (h >= CONFIG.raids.startHour && h < CONFIG.raids.endHour && clockDay() >= state.nextRaidDay)) return 'Raiders are about. You cannot sleep.';
  if (state.storm) return 'The storm is too loud to sleep through.';
  if (enemies.some(e => !e.hidden && Math.hypot(e.x - p.x, e.y - p.y) < 220)) return 'Something is close. You cannot sleep.';
  return null;
}; }
{ const o = trySleep; trySleep = function () { o(); if (state.sleeping) { const h = clockHour(); state.daySleep = h >= 6 && h < 20; } }; }
{ const o = wakeUp; wakeUp = function () {
  if (state.daySleep && !state.forceWake) return;
  const early = state.daySleep || state.forceWake;
  state.daySleep = false; state.forceWake = false; state.sleepClinic = false;
  if (early) { state.sleeping = false; toast('You get up.', 2.5); return; }
  o();
}; }
function stopSleeping() { if (!state.sleeping) return; state.forceWake = true; wakeUp(); }
let stopRect = null;
{ const o = drawHUD; drawHUD = function (...a) {
  o(...a); stopRect = null;
  if (!state.sleeping || state.title) return;
  const w = window.innerWidth, h = window.innerHeight; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  stopRect = { x: Math.round(w / 2 - 90), y: Math.round(h / 2 + 30), w: 180, h: 30 };
  button(stopRect.x, stopRect.y, stopRect.w, stopRect.h, 'Stop sleeping (Space)', () => stopSleeping());
  if (state.sleepClinic) { ctx.font = '11px ' + MONO; ctx.textAlign = 'center'; ctx.fillStyle = '#9fdc8f'; ctx.fillText('The Clinic Bed is patching you up.', w / 2, h / 2 + 76); }
}; }
window.addEventListener('mousedown', e => { const r = stopRect; if (!state.sleeping || !r) return; if (e.clientX >= r.x && e.clientX <= r.x + r.w && e.clientY >= r.y && e.clientY <= r.y + r.h) { stopSleeping(); e.stopImmediatePropagation(); } }, true);
window.addEventListener('keydown', e => { if (state.sleeping && !state.title && (e.key === ' ' || e.key === 'Escape')) { stopSleeping(); e.preventDefault(); e.stopImmediatePropagation(); } }, true);

/* ---------- Raids grow a little with the camp ---------- */
{ const o = pickRaid; pickRaid = function (day) { const rk = o(day); return Object.assign({}, rk, { mult: rk.mult * (0.85 + 0.07 * (settlementLevel() - 1)) }); }; }
{ const o = startRaid; startRaid = function (day) {
  o(day);
  const lv = settlementLevel();
  if (state.raid && lv >= 4 && Math.random() < 0.6) { const e0 = enemies.find(e => e.raid); if (e0) { spawnEnemy(lv >= 6 || Math.random() < 0.5 ? 'brute' : 'sniper', e0.x + 24, e0.y, { raid: true }); state.raid.total++; } }
}; }

/* ---------- The Generator: turrets fire faster ---------- */
{ const o = updateStructures; updateStructures = function (dt) {
  o(dt);
  if (state.map !== 'wastes' || !campHas('generator')) return;
  for (const [, st] of structs) if (st.type === 'turret' && st.cd > 0) st.cd = Math.max(0, st.cd - dt * 0.33);
}; }

/* ---------- Crafting skill: no longer a gate, it saves materials ---------- */
SKILLS.crafting.perk = l => Math.round((l - 1) * 4) + '% chance to get half of an ingredient back';
{ const o = tryCraft; tryCraft = function (r) {
  const out = !r.place && r.cat !== 'Cooking' && r.gives ? Object.keys(r.gives)[0] : null, before = out ? countItem(out) : 0;
  o(r);
  if (!out || countItem(out) <= before || Math.random() >= 0.04 * (skillLevel('crafting') - 1)) return;
  const ks = Object.keys(r.cost || {}); if (!ks.length) return;
  const k = ks[Math.floor(Math.random() * ks.length)], q = Math.max(1, Math.floor(r.cost[k] / 2));
  addItem(k, q); toast('Careful work. You saved ' + q + ' ' + k + '.', 2.5);
}; }

/* ---------- Unique blueprints, and what the old manuals are good for now ---------- */
const UNIQUES = [
  { key: 'u_whisper', name: 'Whisper', id: 'whisper', cat: 'Weapons', st: 'weaponbench', tier: 2, cost: { 'Metal plate': 4, 'Scrap': 6, 'Cloth': 2 }, from: "Warden's Crossbow", where: 'The Hollow' },
  { key: 'u_breaker', name: 'Breaker', id: 'breaker', cat: 'Weapons', st: 'weaponbench', tier: 3, cost: { 'Steel Ingot': 3, 'Wood': 4, 'Metal plate': 2 }, from: 'Hollowclaw Talon', where: 'Deepcut' },
  { key: 'u_debt', name: 'Debt Collector', id: 'debtcollector', cat: 'Weapons', st: 'weaponbench', tier: 3, cost: { 'Steel Ingot': 2, 'Metal plate': 4, 'Wood': 3 }, flag: 'varro:done', where: 'Greybridge Depot' },
  { key: 'u_leadweave', name: 'Leadweave Cloak', id: 'leadweave', cat: 'Armour', st: 'armourbench', tier: 3, cost: { 'Cloth': 8, 'Metal plate': 4, 'Steel Ingot': 1 }, from: 'Lead-Lined Coat', where: 'Pylon 3' },
  { key: 'u_harpoon', name: 'Harpooners Coat', id: 'harpooncoat', cat: 'Armour', st: 'armourbench', tier: 3, cost: { 'Hide': 4, 'Cloth': 4, 'Metal plate': 2 }, from: 'Manifest Case', where: 'The Tidewrack' },
  { key: 'u_guild', name: 'Guild Plate', id: 'guild', cat: 'Armour', st: 'armourbench', tier: 4, set: ['Guild Helm', 'Guild Plate', 'Guild Greaves', 'Guild Boots'], where: 'Tinkers’ Guildhall' }
];
const UNIQUE_BP = UNIQUES.map(u => u.key);
Object.assign(WEAPONS, {
  'Whisper': { kind: 'gun', dmg: 52, cd: 0.85, speed: 280, range: 210, ammo: 'Pistol rounds', col: '#3a3e46' },
  'Breaker': { kind: 'melee', dmg: 74, cd: 0.9, reach: 30, kb: 340, col: '#7a7e86' },
  'Debt Collector': { kind: 'gun', dmg: 14, pellets: 7, spread: 0.4, cd: 1.2, speed: 240, range: 110, ammo: 'Shells', col: '#5a4030' }
});
Object.assign(ARMOUR, {
  'Leadweave Cloak': { slot: 'body', dmg: 0.14, rad: 0.45, col: '#4a5260' }, 'Harpooners Coat': { slot: 'body', dmg: 0.22, rad: 0.1, col: '#3a4a3a' },
  'Guild Helm': { slot: 'head', dmg: 0.16, rad: 0.02, col: '#b08a3a' }, 'Guild Plate': { slot: 'body', dmg: 0.3, rad: 0.08, col: '#b08a3a' }, 'Guild Greaves': { slot: 'legs', dmg: 0.2, rad: 0.02, col: '#9a7a32' }, 'Guild Boots': { slot: 'feet', dmg: 0.12, rad: 0.02, col: '#7a6230' }
});
SETS.guild = ['Guild Helm', 'Guild Plate', 'Guild Greaves', 'Guild Boots'];
Object.assign(ITEM_DESC, {
  'Whisper': 'A pistol with a long, quiet barrel. Slow to fire and very hard to forget.', 'Breaker': 'A two-handed maul with a head made from a brake drum. It moves people.',
  'Debt Collector': 'A double-barrel shotgun with a name scratched on the stock. Not yours.', 'Leadweave Cloak': 'A cloak with lead thread woven through it. Heavy, and the best thing between you and the radiation.',
  'Harpooners Coat': 'Oiled hide and sailcloth, stitched for men who went over the side on purpose.', 'Guild Helm': 'Tinkers’ work: riveted brass over steel.', 'Guild Plate': 'Tinkers’ work. The best plate anyone still makes.',
  'Guild Greaves': 'Tinkers’ work: jointed so you can still run.', 'Guild Boots': 'Tinkers’ work: steel toes, brass buckles.'
});
for (const n of ['Whisper', 'Breaker', 'Debt Collector', 'Leadweave Cloak', 'Harpooners Coat', ...SETS.guild]) { ITEM_STACK[n] = 1; ITEM_COL[n] = (WEAPONS[n] || ARMOUR[n]).col; ITEM_TIER[n] = 3; }
Object.assign(WEAPON_ART, {
  'Whisper': (q, c) => { q(c, 2, 5, 12, 3); q('#5a5e66', 2, 5, 12, 1); q('#14120f', 13, 6, 1, 1); q('#2a2a30', 8, 8, 3, 5); q('#4a3020', 8, 9, 3, 3); q(c, 6, 8, 2, 2); },
  'Breaker': (q, c) => { q('#5a3a22', 7, 5, 2, 11); q('#2a1c10', 7, 9, 2, 1); q(c, 3, 0, 10, 6); q('#9a9ea6', 3, 0, 10, 1); q('#4a4e56', 3, 5, 10, 1); q('#14120f', 7, 2, 2, 2); },
  'Debt Collector': (q, c) => { q('#6a6e76', 1, 5, 11, 2); q('#4a4e56', 1, 7, 11, 1); q('#5a3a22', 10, 6, 5, 3); q('#3a2416', 12, 9, 3, 4); q('#14120f', 1, 5, 1, 3); } });
Object.assign(ARMOUR_ART, {
  'Leadweave Cloak': (q, c) => { q(c, 3, 2, 10, 13); q('#6a7280', 4, 2, 8, 1); q('#8a929e', 5, 5, 1, 9); q('#8a929e', 10, 5, 1, 9); q('#2a2e36', 7, 2, 2, 3); },
  'Harpooners Coat': (q, c) => { q(c, 3, 3, 10, 12); q('#5a6a5a', 3, 3, 10, 1); q('#6a4a2a', 7, 3, 2, 12); q('#c8a040', 5, 7, 1, 1); q('#c8a040', 5, 10, 1, 1); },
  'Guild Helm': (q, c) => { q(c, 3, 3, 10, 8); q('#e0c070', 4, 3, 8, 1); q('#14120f', 5, 7, 6, 1); q('#7a5a20', 7, 1, 2, 2); },
  'Guild Plate': (q, c) => { q(c, 3, 2, 10, 12); q('#e0c070', 3, 2, 10, 1); q('#7a5a20', 7, 4, 2, 9); q('#e0c070', 5, 6, 1, 1); q('#e0c070', 10, 6, 1, 1); },
  'Guild Greaves': (q, c) => { q(c, 4, 2, 3, 12); q(c, 9, 2, 3, 12); q('#e0c070', 4, 7, 3, 1); q('#e0c070', 9, 7, 3, 1); },
  'Guild Boots': (q, c) => { q(c, 3, 6, 4, 7); q(c, 9, 6, 4, 7); q('#3a2a12', 2, 12, 5, 2); q('#3a2a12', 8, 12, 5, 2); q('#e0c070', 3, 8, 4, 1); q('#e0c070', 9, 8, 4, 1); } });
for (const u of UNIQUES) {
  BLUEPRINTS[u.key] = u.name; const bp = 'Blueprint: ' + u.name; BP_ITEMS[bp] = u.key;
  ITEM_COL[bp] = '#e8c86a'; ITEM_STACK[bp] = 1; VALUE[bp] = 80; ITEM_DESC[bp] = 'A unique blueprint. Right-click it to learn how to make the ' + u.name + '.';
  if (u.set) { const costs = [{ 'Steel Ingot': 2, 'Machined Parts': 2, 'Cloth': 1 }, { 'Steel Ingot': 4, 'Machined Parts': 3, 'Cloth': 2 }, { 'Steel Ingot': 3, 'Machined Parts': 2, 'Cloth': 1 }, { 'Steel Ingot': 2, 'Machined Parts': 1, 'Hide': 1 }];
    u.set.forEach((n, k) => rc(u.id + '_' + k, u.cat, n, u.st, costs[k], { unlock: u.key, tier: u.tier, gives: { [n]: 1 } })); }
  else rc(u.id, u.cat, u.name, u.st, u.cost, { unlock: u.key, tier: u.tier, gives: { [u.name]: 1 } });
}
function ownsItem(n) { if (countItem(n)) return true; const eq = state.player.equip; for (const k in eq) if (eq[k] && eq[k].name === n) return true; return false; }
let bpT = 0;
function grantBlueprints(dt) {
  bpT -= dt; if (bpT > 0 || state.title) return; bpT = 2;
  for (const u of UNIQUES) {
    if (!u.from && !u.flag) continue;
    const got = state.qflags['bp:' + u.key]; if (got) continue;
    const hit = u.flag ? qf(u.flag) : (ownsItem(u.from) || (u.from === 'Manifest Case' && qf('lamplighter_done')));
    if (!hit) continue;
    state.qflags['bp:' + u.key] = true; const bp = 'Blueprint: ' + u.name;
    if (spaceFor(bp, 1)) addItem(bp, 1); else state.drops.push({ x: state.player.x, y: state.player.y + 6, name: bp, qty: 1, t: 0 });
    toast('Tucked in among the spoils from ' + u.where + ': ' + bp + '.', 5); sfx('pickup');
  }
}
{ const o = updateStorm; updateStorm = function (dt) { o(dt); grantBlueprints(dt); sleepTick(dt); }; }
{ const o = useItem; useItem = function (i) {
  const s = state.player.inventory[i];
  if (s && BP_ITEMS[s.name] && OLD_BP.has(BP_ITEMS[s.name])) {
    skillXp('crafting', 60); toast('An old manual. Nothing in it you could not work out yourself now, but reading it sharpens your hand. Crafting experience.', 4.5); sfx('levelup');
    s.qty -= 1; if (s.qty <= 0) state.player.inventory[i] = null; return;
  }
  o(i);
}; }
for (const k of OLD_BP) { const n = 'Blueprint: ' + BLUEPRINTS[k]; ITEM_DESC[n] = 'An old manual. Read it for Crafting experience.'; VALUE[n] = 20; }
{ const o = VENDORS.tinkers.list; VENDORS.tinkers.list = function (rs, rep) {
  const out = o(rs, rep).filter(([n]) => !BP_ITEMS[n]);
  if (rep >= 5 && !state.unlocked.has('u_guild')) out.unshift(['Blueprint: Guild Plate', 1]);
  return out;
}; }

/* ---------- The Clinic Bed heals you while you sleep, and naps end when you are rested ---------- */
function sleepTick(dt) {
  if (!state.sleeping) return;
  const p = state.player, gh = dt * (1440 / CONFIG.time.dayLengthSec) * effMult() / 60;
  if (state.sleepClinic) p.health = Math.min(maxHealth(), p.health + 25 * gh);
  if (state.daySleep && p.energy >= 99 && (!state.sleepClinic || p.health >= maxHealth() - 0.5)) { state.forceWake = true; wakeUp(); }
}

/* ---------- The Progress screen, laid out by camp level ---------- */
const LEVEL_UNLOCKS = ['Workbench, Weapon Bench, Armour Bench, Medical Station', 'Stove, Water Purifier, stone walls, furniture', 'Forge, Clinic Bed', 'Anvil, turrets, pipes and sprinklers', 'Generator', 'Machine Shop'];
function nextStep() {
  const lv = settlementLevel(), pts = Math.floor(settlementPoints());
  for (let t = 2; t <= 4; t++) {
    if (tierOpen(t)) continue;
    const g = TIER_GATE[t];
    if (lv < g.lvl) return 'Your camp has ' + pts + ' of the ' + SL_STEPS[g.lvl - 1] + ' points it needs to become a ' + SL_NAMES[g.lvl - 1] + '. Then build a ' + g.st.map(s => STATION_NAMES[s]).join(' and a ') + ' to open ' + TIER_NAMES[t - 1] + '.';
    const miss = g.st.filter(s => !campHas(s)).map(s => STATION_NAMES[s]);
    return 'Build a ' + miss.join(' and a ') + ' in your camp to open ' + TIER_NAMES[t - 1] + '.';
  }
  return lv < 6 ? 'Every crafting tier is open. Your camp has ' + pts + ' of ' + SL_STEPS[lv] + ' points to the next level.' : 'Every crafting tier is open. Unique blueprints are out there to find.';
}
{ const o = drawProgress; drawProgress = function (w, h) {
  o(w, h);
  const pw = 900, ph = 560, px = Math.round(w / 2 - pw / 2), py = Math.max(46, Math.round(h / 2 - ph / 2)), tx0 = px + 320, tw = pw - 334;
  panel(tx0 - 8, py + 30, tw + 16, ph - 40, 1);
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.font = '12px ' + MONO; ctx.fillStyle = '#e9e2d4'; ctx.fillText('Camp and crafting', tx0, py + 46);
  // next step
  ctx.fillStyle = 'rgba(255,211,107,0.1)'; ctx.fillRect(tx0, py + 58, tw, 46); ctx.strokeStyle = 'rgba(255,211,107,0.5)'; ctx.strokeRect(tx0 + 0.5, py + 58.5, tw - 1, 45);
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#ffe9b0'; ctx.fillText('Next step', tx0 + 8, py + 68);
  ctx.fillStyle = '#e8dcc0'; wrapText(nextStep(), tw - 16).slice(0, 2).forEach((l, k) => ctx.fillText(l, tx0 + 8, py + 82 + k * 12));
  // the ladder
  const lv = settlementLevel(); let y = py + 118;
  SL_NAMES.forEach((n, k) => {
    const done = lv > k, now = lv === k + 1;
    ctx.fillStyle = now ? 'rgba(255,211,107,0.12)' : 'rgba(255,255,255,0.03)'; ctx.fillRect(tx0, y - 8, tw, 17);
    ctx.font = '10px ' + MONO; ctx.textAlign = 'left'; ctx.fillStyle = done ? '#9fdc8f' : '#8a7e6c'; ctx.fillText((k + 1) + ' ' + n, tx0 + 6, y);
    ctx.fillStyle = '#b8a890'; ctx.fillText(SL_STEPS[k] + ' pts', tx0 + 110, y); ctx.fillStyle = done ? '#e8dcc0' : '#8a7e6c'; ctx.fillText(LEVEL_UNLOCKS[k], tx0 + 170, y);
    y += 18;
  });
  // the tiers
  y += 6; let hover = null;
  for (let t = 1; t <= 4; t++) {
    const list = RECIPES.filter(r => r.cat !== 'Cooking' && (r.tier || 1) === t), got = list.filter(recipeUnlocked).length, open = tierOpen(t);
    ctx.font = '11px ' + MONO; ctx.textAlign = 'left'; ctx.fillStyle = open ? '#9fdc8f' : '#ffd36b'; ctx.fillText('Tier ' + t + ': ' + TIER_NAMES[t - 1] + (TIER_GATE[t] ? '  (' + tierGateText(t) + ')' : ''), tx0, y);
    ctx.textAlign = 'right'; ctx.fillStyle = '#b8a890'; ctx.fillText(got + ' / ' + list.length, tx0 + tw, y); y += 10;
    const CS = 22, cols = Math.floor(tw / CS);
    list.forEach((r, k) => {
      const x = tx0 + (k % cols) * CS, y2 = y + Math.floor(k / cols) * CS, un = recipeUnlocked(r);
      ctx.fillStyle = un ? 'rgba(127,255,127,0.08)' : 'rgba(0,0,0,0.35)'; ctx.fillRect(x, y2, CS - 2, CS - 2);
      ctx.globalAlpha = un ? 1 : 0.35; drawIcon(Object.keys(r.gives || {})[0] || r.name, x + 2, y2 + 2, CS - 6); ctx.globalAlpha = 1;
      if (mouse.x >= x && mouse.x < x + CS && mouse.y >= y2 && mouse.y < y2 + CS) hover = { r, x, y: y2 };
    });
    y += Math.ceil(list.length / cols) * CS + 10;
  }
  if (hover) {
    const r = hover.r, st = recipeStatus(r), lines = [r.name, 'Made at: ' + (r.station ? STATION_NAMES[r.station] : 'by hand') + (WALKUP.has(r.station) ? ' (in person)' : ''), st.ok ? 'Ready to make' : st.why];
    const bw = 300, bx = Math.min(hover.x + 24, px + pw - bw - 8), by = hover.y - 4;
    ctx.fillStyle = 'rgba(14,10,16,0.96)'; ctx.fillRect(bx, by, bw, 50); ctx.strokeStyle = '#ffd36b'; ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, 49);
    ctx.textAlign = 'left'; ctx.font = '10px ' + MONO; lines.forEach((l, k) => { ctx.fillStyle = k === 0 ? '#ffe9b0' : k === 2 && !st.ok ? '#ff9a6a' : '#e8dcc0'; ctx.fillText(wrapText(l, bw - 12)[0], bx + 6, by + 10 + k * 15); });
  }
}; }

Object.assign(DBG, { useItem, tierOpen, campHas, nearStation, openBench, stopSleeping, nextStep, UNIQUES, recipeUnlocked, recipeStatus, stationNear, trySleep, wakeUp, sleepBlockReason, pickRaid, startRaid, CRAFT_TABS });
