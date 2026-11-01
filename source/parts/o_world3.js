/* =====================================================================
   WORLD 3: quests, encounters, merchants, settler progression, placing and moving
   ===================================================================== */
const encNpcs = [];

/* ---------- Placement, rotation and moving (now aware of moved structures) ---------- */
function placeValid(tx, ty) {
  if (tx < 1 || ty < 1 || tx >= W - 1 || ty >= H - 1) return false;
  const i = ty * W + tx, t = tiles[i], p = state.player;
  const r = placingRecipe();
  if (t === T.WATER || t === T.SPRING || t === T.RUBBLE || t === T.CLIFF) return false;
  const dx = (tx + 0.5) * TS - p.x, dy = (ty + 0.5) * TS - p.y;
  if (Math.hypot(dx, dy) > 96) return false;
  if (r && r.layer === 'floor') return !objs[i] && !tilled[i] && !crops.has(i) && !floors[i] && !saplings.has(i);
  if (r && r.layer === 'roof') return !roofs[i];
  if (objs[i] || structs.has(i) || saplings.has(i) || crops.has(i)) return false;
  if (r && !NONSOLID.has(r.place) && Math.abs(dx) < 14 && Math.abs(dy) < 14) return false;
  if (r && r.place === 'purifier' && !waterAdjacent(tx, ty)) return false;
  return true;
}
function tryPlace() {
  const r = placingRecipe();
  if (!r) { state.placing = null; return; }
  const tx = Math.floor(state.mwx / TS), ty = Math.floor(state.mwy / TS), i = ty * W + tx;
  if (!placeValid(tx, ty)) { toast(r.place === 'purifier' ? 'The purifier has to be built right next to water.' : 'Cannot place that here. Pick a clear tile close to you.', 2.2); return; }
  if (state.moving) {
    const st = state.moving.st;
    st.rot = state.placeRot; structs.set(i, st);
    if (st.type === 'bedroll') { spawn.x = (tx + 0.5) * TS; spawn.y = (ty + 0.5) * TS; }
    state.moving = null; state.placing = null; sfx('place'); toast('Moved.', 1.5);
    return;
  }
  if (!canAfford(r.cost)) { toast('Missing materials.', 2); state.placing = null; return; }
  takeItems(r.cost);
  if (r.layer === 'floor') floors[i] = r.fl;
  else if (r.layer === 'roof') roofs[i] = r.rf;
  else { structs.set(i, newStruct(r.place, state.placeRot)); if (r.place === 'bedroll') { spawn.x = (tx + 0.5) * TS; spawn.y = (ty + 0.5) * TS; } }
  sfx('place'); skillXp('crafting', 0.6 + (r.tier || 1) * 0.6); questEvent('placed:' + r.place);
  if (!r.repeat || !canAfford(r.cost)) { state.placing = null; toast(r.name + ' placed.', 2.5); }
}
function updatePlaceDrag() {
  if (!state.placing || !mouse.down) return;
  const r = placingRecipe();
  if (!r || !r.repeat) return;
  const ti = Math.floor(state.mwy / TS) * W + Math.floor(state.mwx / TS);
  if (ti !== state.lastPlaceTile) { state.lastPlaceTile = ti; tryPlace(); }
}
function drawPlacementGhost() {
  if (!state.placing) return;
  const r = placingRecipe();
  if (!r) return;
  const tx = Math.floor(state.mwx / TS), ty = Math.floor(state.mwy / TS);
  const ok = placeValid(tx, ty);
  ctx.globalAlpha = 0.65;
  if (r.layer === 'roof') ctx.drawImage(roofSprite(r.rf, roofMask(tx, ty), 0), tx * TS - 1, ty * TS - 11);
  else if (r.layer === 'floor') ctx.drawImage(floorSprite(r.fl === 1 ? 'wood' : 'stone', 0), tx * TS - 1, ty * TS - 1);
  else drawStruct({ type: r.place, rot: state.placeRot }, tx, ty);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = ok ? 'rgba(127,255,127,0.95)' : 'rgba(255,90,70,0.95)'; ctx.lineWidth = 1 / scale * 1.5;
  ctx.strokeRect(tx * TS + 0.5, ty * TS + 0.5, TS - 1, TS - 1);
}

/* ---------- Quests ---------- */
function structCount(types) { let n = 0; for (const [, st] of structs) if (types.includes(st.type)) n++; return n; }
function hasStruct(t) { return structCount([t]) > 0; }
function qf(name) { return !!state.qflags[name]; }
const QUEST_DEFS = [
  { id: 'welcome', title: 'A Roof and a Fire', giver: 'The Valley', desc: 'The valley is quiet, for now. Get a foothold: a bench to work at, tools in your hands, a bed and a place to keep your things, and food growing in the dirt. Then go and find someone else still alive.',
    steps: [
      { id: 'mats', text: 'Gather 10 wood and 6 scrap', check: () => countItem('Wood') >= 10 && countItem('Scrap') >= 6 },
      { id: 'bench', text: 'Build a Workbench (C, Build tab)', event: 'placed:workbench' },
      { id: 'axe', text: 'Craft a Scrap Axe', event: 'crafted:scrap_axe' },
      { id: 'hoe', text: 'Craft a Hoe and a Watering Can', check: () => qf('crafted:hoe') && qf('crafted:can') },
      { id: 'plant', text: 'Till some soil and plant a seed', event: 'planted' },
      { id: 'bed', text: 'Build a Bunk Bed and a Storage Chest', check: () => hasStruct('bunk') && hasStruct('chest') },
      { id: 'recruit', text: 'Find a survivor and bring them home', event: 'recruited' }
    ], reward: { xp: 60, items: [{ name: 'Canned food', qty: 3 }, { name: 'Bandage', qty: 2 }] }, next: ['water', 'mouths', 'hold'] },
  { id: 'water', title: 'Clean Water', giver: 'Your own throat', desc: 'Every drop out here carries something. The valley pond is the cleanest you will find, and a purifier beside it makes it cleaner still.',
    steps: [
      { id: 'forgeOrSkill', text: 'Unlock the forge (blueprint, or Crafting level 3)', check: () => state.unlocked.has('forge') || skillLevel('crafting') >= 3 },
      { id: 'purifier', text: 'Build a Water Purifier beside the pond', event: 'placed:purifier' },
      { id: 'bottle', text: 'Fill a bottle at the purifier', event: 'bottle:Purified Water' }
    ], reward: { xp: 45, items: [{ name: 'Empty Bottle', qty: 4 }] }, next: [] },
  { id: 'mouths', title: 'Mouths to Feed', giver: 'Your settlers', desc: 'Settlers will eat what is in the chest, and they work better when fed. Fish the pond, and learn what a campfire is for.',
    steps: [
      { id: 'rod', text: 'Craft a Fishing Rod', event: 'crafted:rod' },
      { id: 'fish', text: 'Catch a fish', event: 'fished' },
      { id: 'cook', text: 'Cook something at a campfire', event: 'cooked' },
      { id: 'ate', text: 'Watch a settler eat from the chest', event: 'settlerAte' }
    ], reward: { xp: 50, items: [{ name: 'Potato Seeds', qty: 4 }, { name: 'Tomato Seeds', qty: 4 }] }, next: [] },
  { id: 'hold', title: 'Hold the Gate', giver: 'The cliffs', desc: 'Raiders will come through the valley gates. Make them regret it.',
    steps: [
      { id: 'walls', text: 'Build 8 wall pieces', check: () => structCount(['wall', 'scrapwall', 'stonewall', 'steelwall']) >= 8 },
      { id: 'gate', text: 'Build a Gate', event: 'placed:gate' },
      { id: 'post', text: 'Build a Guard Post', event: 'placed:guardpost' },
      { id: 'raid', text: 'Survive a raid', event: 'raidEnd' }
    ], reward: { xp: 90, items: [{ name: 'Pistol rounds', qty: 8 }, { name: 'Scrap', qty: 10 }] }, next: [] },
  { id: 'trade', title: 'Something to Sell', giver: 'A stranger on the road', desc: 'Merchants wander the wastes. Find one, and learn what your spare scrap is worth.',
    steps: [{ id: 'met', text: 'Meet a travelling merchant', event: 'metMerchant' }, { id: 'sold', text: 'Sell something to them', event: 'sold' }, { id: 'bought', text: 'Buy something from them', event: 'bought' }],
    reward: { xp: 60, items: [{ name: 'Caps', qty: 50 }] }, next: [] },
  { id: 'explore', title: 'Beyond the Gates', giver: 'Curiosity', desc: 'The valley is small. See some of what lies outside it.',
    steps: [{ id: 'zones', text: 'Visit 3 different regions', check: () => Object.keys(state.zonesSeen).filter(z => z !== '1' && z !== '0').length >= 3 }, { id: 'crate', text: 'Open a supply crate in the wild', event: 'crate' }],
    reward: { xp: 70, items: [{ name: 'Rad-Away', qty: 1 }, { name: 'Cloth', qty: 6 }] }, next: [] }
];
function questState(id) { return state.quests[id]; }
function startQuest(id) { if (state.quests[id]) return; state.quests[id] = { status: 'active', done: {} }; const d = QUEST_DEFS.find(q => q.id === id); toast('New journal entry: ' + d.title, 4); sfx('craft'); }
function questEvent(name) { if (state.qflags) state.qflags[name] = true; }
function questTick() {
  for (const d of QUEST_DEFS) {
    const qs = state.quests[d.id];
    if (!qs || qs.status !== 'active') continue;
    let all = true;
    for (const s of d.steps) {
      if (!qs.done[s.id]) {
        const ok = s.event ? qf(s.event) : s.check();
        if (ok) { qs.done[s.id] = true; toast('Quest step done: ' + s.text, 3); sfx('pickup'); } else all = false;
      }
    }
    if (all) {
      qs.status = 'done';
      gainXp(d.reward.xp);
      for (const it of d.reward.items) { if (!spaceFor(it.name, it.qty)) state.drops.push({ x: state.player.x, y: state.player.y + 6, name: it.name, qty: it.qty, t: 0 }); else addItem(it.name, it.qty); }
      toast('Quest complete: ' + d.title + '. +' + d.reward.xp + ' XP.', 5); sfx('levelup');
      for (const n of d.next || []) startQuest(n);
    }
  }
  if (state.day2seen === undefined && clockDay() >= 2) { state.day2seen = true; startQuest('explore'); }
}
function activeQuest() {
  const pin = state.pinned && state.quests[state.pinned] && state.quests[state.pinned].status === 'active' ? state.pinned : null;
  const id = pin || Object.keys(state.quests).find(k => state.quests[k].status === 'active');
  return id ? QUEST_DEFS.find(q => q.id === id) : null;
}
{ const o = recruit; recruit = function (n) { const r = o(n); if (r) questEvent('recruited'); return r; }; }
{ const o = fillBottle; fillBottle = function (name) { const had = countItem(name); o(name); if (countItem(name) > had) questEvent('bottle:' + name); }; }
{ const o = openCrate; openCrate = function (t) { const had = objs[t.i]; o(t); if (objs[t.i] !== had) { questEvent('crate'); skillXp('exploring', 5); } }; }

/* ---------- Random encounters ---------- */
const MERCHANT_NAMES = ['Hollis the Pedlar', 'Gran Odette', 'Quill', 'Big Marv', 'Sister Pell', 'Tobias Reed'];
const TRAVELLER_NAMES = ['Ash', 'Corbin', 'The Walker', 'Mina', 'Old Dutch', 'Fen'];
const RUMOURS = [
  'There is a bunker up in the ashes. Someone in uniform is still in it, they say.', 'The marsh water glows at night. Do not drink it. Do not ask me how I know.',
  'Raiders come in on the second day of every cycle, always at dusk. Always.', 'Radiation storms scour the whole map. A roof over your head is the only thing that stops them.',
  'I saw a hot spot with a crate in the middle. Whoever left it knew exactly what they were doing.', 'Saplings. Plant saplings. The wasteland forgets how to grow trees if you let it.',
  'The scrapyard foreman kept a ledger of everything he ever owned. Some of it was worth keeping.', 'If you hear grass moving where there is no wind, run.'
];
function genStock() {
  const stock = [], add = (name, qty, mult) => { if (!stock.some(s => s.name === name)) stock.push({ name, qty, price: Math.max(2, Math.ceil(itemValue(name) * (mult || 1.7))) }); };
  const pool = ['Radish Seeds', 'Potato Seeds', 'Tomato Seeds', 'Pistol rounds', 'Bandage', 'Rad tabs', 'Empty Bottle', 'Canned food', 'Cloth', 'Metal plate', 'Sapling', 'Fishing Rod', 'Hoe', 'Watering Can', 'Rad-Away', 'Medkit'];
  const n = 6 + Math.floor(Math.random() * 3);
  while (stock.length < n) { const nm = pool[Math.floor(Math.random() * pool.length)]; add(nm, nm.includes('Seeds') || nm === 'Pistol rounds' || nm === 'Cloth' ? 4 + Math.floor(Math.random() * 8) : 1 + Math.floor(Math.random() * 3)); }
  const gear = ['Scrap Machete', 'Scrap Pistol', 'Iron Cleaver', 'Iron Helm', 'Scrap Vest', 'Scrap Boots', 'Hazmat Hood', 'Rubber Boots', 'Lead Pendant', 'Iron Axe'];
  add(gear[Math.floor(Math.random() * gear.length)], 1, 1.9);
  const locked = Object.keys(BP_ITEMS).filter(k => !state.unlocked.has(BP_ITEMS[k]));
  if (locked.length && Math.random() < 0.55) add(locked[Math.floor(Math.random() * locked.length)], 1, 2.2);
  return stock;
}
let encSeq = 0;
function walkableSpot(minD, maxD) {
  const p = state.player;
  for (let k = 0; k < 90; k++) {
    const a = Math.atan2(p.aimY, p.aimX) + (Math.random() - 0.5) * 2, d = minD + Math.random() * (maxD - minD);
    const x = p.x + Math.cos(a) * d, y = p.y + Math.sin(a) * d, tx = Math.floor(x / TS), ty = Math.floor(y / TS);
    if (tx < 4 || ty < 4 || tx >= W - 4 || ty >= H - 4 || solidAt(tx, ty, true) || (radMap[ty * W + tx] || 0) <= -0.9 || zoneMap[ty * W + tx] === 1) continue;
    return { x, y, tx, ty };
  }
  return null;
}
function spawnEncounter(type) {
  const spot = walkableSpot(150, 190);
  if (!spot) return false;
  const id = 300 + (encSeq++);
  if (type === 'merchant') {
    const nm = MERCHANT_NAMES[Math.floor(Math.random() * MERCHANT_NAMES.length)];
    encNpcs.push({ id, kind: 'merchant', name: nm, look: npcLook(id), x: spot.x, y: spot.y, dirx: -1, walkT: 0, ttl: 300, stock: genStock(), skills: { farm: 0, guard: 0, haul: 0 }, bio: 'A wandering pedlar with a handcart and a talent for finding what people need.', home: { x: spot.x, y: spot.y } });
    toast('A travelling merchant has set up ahead of you.', 4);
  } else if (type === 'traveller') {
    const nm = TRAVELLER_NAMES[Math.floor(Math.random() * TRAVELLER_NAMES.length)];
    encNpcs.push({ id, kind: 'traveller', name: nm, look: npcLook(id), x: spot.x, y: spot.y, dirx: 1, walkT: 0, ttl: 240, used: false, skills: { farm: 0, guard: 0, haul: 0 }, bio: 'Someone walking the long way round, same as you.', home: { x: spot.x, y: spot.y } });
    toast('Someone is sitting by the road ahead.', 4);
  } else if (type === 'wounded') {
    const nm = ['Pip', 'Hana', 'Rourke', 'Tess', 'Callum', 'Idris'][Math.floor(Math.random() * 6)] + ' ' + ['Marsh', 'Okoro', 'Lind', 'Bakshi', 'Voight'][Math.floor(Math.random() * 5)];
    survivors.push({ id, kind: 'survivor', wounded: true, name: nm, bio: 'Hurt, hungry, and a long way from anywhere. They would rather not die out here.', skills: { farm: Math.floor(Math.random() * 3), guard: Math.floor(Math.random() * 3), haul: Math.floor(Math.random() * 3) }, look: npcLook(id), x: spot.x, y: spot.y, home: { x: spot.x, y: spot.y }, wander: 0, wx: spot.x, wy: spot.y, dirx: 1, walkT: 0, scared: false });
    toast('Someone is slumped against a rock ahead. They look hurt.', 4);
  } else {
    const i = spot.ty * W + spot.tx;
    if (objs[i]) return false;
    objs[i] = O.CRATE; crateLoot.set(i, rollLoot(Math.random, true));
    toast('You spot an abandoned camp ahead. Something is still in the crate.', 4);
    if (Math.random() < 0.45) for (let k = 0; k < 2; k++) { const s2 = walkableSpot(60, 110); if (s2) spawnEnemy(['hound', 'scrapper'][k % 2], s2.x, s2.y, { hidden: true }); }
    buildMinimap();
  }
  skillXp('exploring', 4);
  return true;
}
function maybeEncounter(z) {
  if (encNpcs.length) return false;
  const chance = state.firstMerchant ? 0.38 : 0.62;
  if (Math.random() >= chance) return false;
  const r = Math.random();
  const type = !state.firstMerchant && clockDay() >= 2 ? 'merchant' : r < 0.34 ? 'merchant' : r < 0.62 ? 'traveller' : r < 0.82 ? 'wounded' : 'cache';
  if (!spawnEncounter(type)) return false;
  state.firstMerchant = state.firstMerchant || type === 'merchant';
  state.threat = 0; state.threatLimit = 28 + Math.random() * 30;
  return true;
}
function updateEncounters(dt) {
  const p = state.player;
  for (let k = encNpcs.length - 1; k >= 0; k--) {
    const n = encNpcs[k];
    n.ttl -= dt; n.walkT += dt * 0.2;
    if (Math.hypot(n.x - p.x, n.y - p.y) > 430 || n.ttl <= 0) { if (state.trade === n) state.trade = null; if (state.talk === n) state.talk = null; encNpcs.splice(k, 1); }
  }
}

/* ---------- Trading ---------- */
function openTrade(npc) { closePanels(); state.trade = npc; questEvent('metMerchant'); }
function buyItem(npc, idx, qty) {
  const s = npc.stock[idx];
  if (!s) return;
  let n = Math.min(qty, s.qty);
  while (n > 0 && (countItem('Caps') < s.price * n || !spaceFor(s.name, n))) n--;
  if (n <= 0) { toast(countItem('Caps') < s.price ? 'Not enough caps.' : 'Bag full.', 1.8); return; }
  takeItems({ 'Caps': s.price * n }); addItem(s.name, n); s.qty -= n;
  if (s.qty <= 0) npc.stock.splice(idx, 1);
  sfx('pickup'); questEvent('bought'); state.floats.push({ x: state.player.x, y: state.player.y - 16, text: '-' + s.price * n + ' caps', color: '#e8c24a', life: 1.1 });
}
function sellValue(name) { return Math.max(1, Math.floor(itemValue(name) * 0.5)); }
function sellItem(i, all) {
  const inv = state.player.inventory, s = inv[i];
  if (!s || s.name === 'Caps') return;
  const n = all ? s.qty : 1, gain = sellValue(s.name) * n;
  s.qty -= n; if (s.qty <= 0) inv[i] = null;
  addItem('Caps', gain); sfx('pickup'); questEvent('sold');
  state.floats.push({ x: state.player.x, y: state.player.y - 16, text: '+' + gain + ' caps', color: '#e8c24a', life: 1.1 });
}
{ const o = useItem; useItem = function (i) {
  const s = state.player.inventory[i];
  if (s && BP_ITEMS[s.name]) {
    state.unlocked.add(BP_ITEMS[s.name]); toast('Blueprint learned: ' + BLUEPRINTS[BP_ITEMS[s.name]] + '.', 4); sfx('levelup');
    s.qty -= 1; if (s.qty <= 0) state.player.inventory[i] = null; return;
  }
  o(i);
}; }
function npcReply(npc, topic) {
  if (npc.kind === 'merchant') {
    if (topic === 'road') return RUMOURS[Math.floor(Math.random() * RUMOURS.length)];
    return 'Caps, scrap, a good story. Whatever you have, I have a price for it.';
  }
  if (npc.kind === 'traveller') {
    if (topic === 'bio') return npc.bio;
    return 'Sit a minute. The road is long, and nobody out here has anything good to say about it.';
  }
  if (npc.kind === 'survivor') {
    if (topic === 'bio') return npc.bio;
    if (topic === 'skills') return 'I can ' + [npc.skills.farm ? 'grow things (' + npc.skills.farm + '/3)' : '', npc.skills.guard ? 'hold a line (' + npc.skills.guard + '/3)' : '', npc.skills.haul ? 'haul and scavenge (' + npc.skills.haul + '/3)' : ''].filter(Boolean).join(', ') + '.';
    if (npc.wounded && !npc.healed) return 'Please... do you have anything for this? A bandage? I will not be any trouble.';
    return 'Who\u2019s there? ...You\u2019re not one of them. Do you have somewhere safe?';
  }
  if (topic === 'bio') return npc.bio;
  if (topic === 'status') {
    if (npc.hunger < 30) return 'I\u2019m starving. Is there any food in the chests?';
    if (npc.health < npc.maxHealth * 0.5) return 'I\u2019m hurt, but I\u2019ll cope.';
    return npc.job === 'Idle' ? 'Give me something to do and I\u2019ll do it.' : 'All good. Busy with my ' + npc.job.toLowerCase() + ' work. I\u2019m level ' + jobLevel(npc, npc.job) + ' at it now.';
  }
  return 'Hey, boss.';
}

/* ---------- Settlers: job levels, fishing, and the death setting ---------- */
JOBS.push('Fisher');
function jobLevel(s, job) { const xp = (s.jobXp && s.jobXp[job]) || 0; return Math.min(10, 1 + Math.floor(Math.sqrt(xp / 8))); }
function settlerXp(s, job, amt) {
  if (!s.jobXp) s.jobXp = {};
  const before = jobLevel(s, job);
  s.jobXp[job] = (s.jobXp[job] || 0) + amt;
  if (jobLevel(s, job) > before) { toast(s.name + ' reached ' + job + ' level ' + jobLevel(s, job) + '.', 3); state.floats.push({ x: s.x, y: s.y - 24, text: job + ' ' + jobLevel(s, job), color: '#ffd36b', life: 1.6 }); }
}
function settlerStatus(s) {
  if (s.state === 'follow') return 'Following you home';
  if (state.stormI > 0.35) return 'Sheltering from the storm';
  if (nearestFoe(s.x, s.y, 190)) return s.job === 'Guard' ? 'Fighting' : 'Taking cover';
  if (s.hunger < 40 && chestFood()) return 'Heading to eat';
  if (s.health < s.maxHealth * 0.5 && structCount(['clinic'])) return 'Healing at the clinic';
  if (darkness(clockHour()) > 0.7 && s.bed !== null) return 'Sleeping';
  if (s.task) return ({ harvest: 'Harvesting crops', water: 'Watering crops', plant: 'Planting seeds', sapling: 'Planting a sapling', haul: 'Gathering resources', fish: 'Fishing' })[s.task.kind] || 'Working';
  if (s.job === 'Guard') return 'On watch';
  if (s.job === 'Idle') return 'Idle';
  return 'Looking for work';
}
let fishSpots = null;
function getFishSpots() {
  if (fishSpots) return fishSpots;
  fishSpots = [];
  for (let y = BASE.y - 22; y <= BASE.y + 22; y++) for (let x = BASE.x - 22; x <= BASE.x + 22; x++) {
    if (x < 1 || y < 1 || x >= W - 1 || y >= H - 1 || tiles[y * W + x] !== T.SPRING) continue;
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const nx = x + dx, ny = y + dy;
      if (nx > 0 && ny > 0 && nx < W && ny < H && !solidAt(nx, ny, true) && !fishSpots.some(f => f.x === nx && f.y === ny)) fishSpots.push({ x: nx, y: ny, wx: x, wy: y });
    }
  }
  return fishSpots;
}
function fisherTick(s, dt) {
  if (!chestList().length || !getFishSpots().length) { idleWander(s, dt); return; }
  const spots = getFishSpots();
  if (!s.task) s.task = { kind: 'fish', spot: spots[Math.abs(s.id * 7) % spots.length] };
  const sp = s.task.spot, gx = (sp.x + 0.5) * TS, gy = (sp.y + 0.5) * TS;
  if (Math.hypot(s.x - gx, s.y - gy) > 6 && !settlerGo(s, gx, gy, dt, 40)) return;
  s.dirx = sp.wx > sp.x ? 1 : sp.wx < sp.x ? -1 : s.dirx;
  s.workT += dt;
  if (s.workT < (10 - 0.7 * Math.max(s.skills.farm, s.skills.haul)) / jobEff(s)) return;
  s.workT = 0;
  storeItem(Math.random() < 0.03 + 0.01 * jobLevel(s, 'Fisher') ? 'Golden Carp' : 'Raw Fish', 1);
  settlerXp(s, 'Fisher', 4);
  state.floats.push({ x: s.x, y: s.y - 22, text: '+1 fish', color: '#9fe8ff', life: 1.2 });
}
function hurtSettler(s, dmg) {
  s.health -= dmg; s.flash = 0.15;
  state.floats.push({ x: s.x, y: s.y - 20, text: '-' + Math.round(dmg), color: '#ff9a6a', life: 0.8 });
  if (s.health > 0) return;
  const ix = settlers.indexOf(s); if (ix >= 0) settlers.splice(ix, 1);
  for (const [i, id] of claimed) if (id === s.id) claimed.delete(i);
  if (state.talk === s) state.talk = null;
  burst(s.x, s.y - 6, '#a83a30', 12);
  s.task = null; s.path = null;
  if (settings.permaDeath) {
    if (s.bed !== null && structs.get(s.bed)) structs.get(s.bed).owner = null;
    toast(s.name + ' was killed.', 5);
  } else {
    state.downed.push({ s, returnAt: state.gameMinutes + 1440 });
    toast(s.name + ' was knocked out. They will be back on their feet in a day.', 5);
  }
}
function updateDowned() {
  for (let k = state.downed.length - 1; k >= 0; k--) {
    const d = state.downed[k];
    if (state.gameMinutes < d.returnAt) continue;
    const s = d.s, bed = s.bed !== null && structs.get(s.bed) ? s.bed : null;
    s.health = s.maxHealth; s.hunger = Math.max(s.hunger, 50); s.state = 'home'; s.task = null;
    if (bed !== null) { s.x = ((bed % W) + 0.5) * TS; s.y = (Math.floor(bed / W) + 0.5) * TS + 10; } else { s.x = BASE.x * TS; s.y = BASE.y * TS; }
    settlers.push(s); state.downed.splice(k, 1);
    toast(s.name + ' is back on their feet.', 4);
  }
}

