/* =====================================================================
   AK_LIVESTOCK: twohead cows and roach hens. Feed them, keep them well,
   collect milk and eggs, breed them, and treat them when they take sick.
   ===================================================================== */
const animals = [];
SKILLS.husbandry = { name: 'Husbandry', blurb: 'Feeding, breeding and doctoring animals.', perk: l => Math.round((l - 1) * 10) + '% extra milk and eggs' + (l >= 4 ? ', 40% less sickness' : '') + (l >= 6 ? ', faster breeding' : '') + (l >= 8 ? ', bigger yields' : '') };
if (!SKILL_ORDER.includes('husbandry')) SKILL_ORDER.push('husbandry');
function ensureSkill() { const sk = state.player && state.player.skills; if (sk && !sk.husbandry) sk.husbandry = { lvl: 1, xp: 0 }; }
ensureSkill();
const ANIMALS = {
  cow: { name: 'Twohead cow', baby: 'Twohead calf', item: 'Twohead Calf', cap: 6, grow: 3, product: 'Milk', speed: 13, size: 12, hungerDay: 80, meat: [4, 6], hide: 2 },
  hen: { name: 'Roach hen', baby: 'Roach hatchling', item: 'Roach Hatchling', cap: 12, grow: 2, product: 'Roach Egg', speed: 22, size: 8, hungerDay: 90, meat: [1, 2], hide: 0 }
};
const ANIMAL_ITEMS = { 'Twohead Calf': 'cow', 'Roach Hatchling': 'hen' };

/* ---------- Items, recipes, prices ---------- */
Object.assign(ITEM_COL, { 'Milk': '#f0ece0', 'Cheese': '#e8c24a', 'Roach Egg': '#9a8a5a', 'Fried Roach Egg': '#f0e0a0', 'Roach Omelette': '#e8c870', 'Hide': '#8a5a3a', 'Animal Feed': '#c8a86a', 'Beast Tonic': '#7fe8a8', 'Twohead Calf': '#c8b8a0', 'Roach Hatchling': '#7a4a2a' });
Object.assign(ITEM_USE, { 'Milk': { food: 8, water: 18 }, 'Cheese': { food: 42 }, 'Roach Egg': { food: 10, rad: 6 }, 'Fried Roach Egg': { food: 26, heal: 2 }, 'Roach Omelette': { food: 54, heal: 4 } });
Object.assign(FOOD_BUFFS, { 'Cheese': [['hearty', 240]], 'Roach Omelette': [['hearty', 300], ['warm', 200]] });
for (const n of ['Cheese', 'Roach Omelette']) ITEM_DESC[n] = (ITEM_DESC[n] || '') + '  Buff: ' + FOOD_BUFFS[n].map(([b, s]) => BUFFS[b].name + ' (' + BUFFS[b].text + ', ' + Math.round(s / 60 * 10) / 10 + ' min)').join(', ');
Object.assign(ITEM_DESC, { 'Milk': 'Warm, a little blue, and perfectly drinkable. Two heads, one udder.', 'Cheese': 'Pressed at the stove. It keeps and it fills you up.', 'Roach Egg': 'Small, speckled and slightly irradiated. Cook it before you eat it.', 'Fried Roach Egg': 'Fried clean. Not bad at all, if you do not think about it.', 'Roach Omelette': 'Eggs and beans in a pan. Proper food.', 'Hide': 'A thick hide. Cut it into strips for cloth.', 'Animal Feed': 'Mashed vegetables and grain. Put it in a trough, or feed an animal by hand.', 'Beast Tonic': 'Healroot and clean water in a bottle. For an animal that has taken sick. Feed it afterwards.', 'Twohead Calf': 'A two-headed calf. Set it down on open ground and it will wander around your trough.', 'Roach Hatchling': 'A hatchling the size of your thumb. It will grow into a hen.' });
Object.assign(VALUE, { 'Milk': 8, 'Cheese': 26, 'Roach Egg': 7, 'Fried Roach Egg': 14, 'Roach Omelette': 38, 'Hide': 8, 'Animal Feed': 3, 'Beast Tonic': 30, 'Twohead Calf': 90, 'Roach Hatchling': 30 });
for (const n of ['Milk', 'Cheese', 'Roach Egg', 'Fried Roach Egg', 'Roach Omelette', 'Hide', 'Animal Feed', 'Beast Tonic']) ITEM_STACK[n] = 30;
ITEM_STACK['Twohead Calf'] = ITEM_STACK['Roach Hatchling'] = 4;
Object.assign(STRUCT_HP, { trough: 60 }); Object.assign(STATION_NAMES, { trough: 'Feed Trough' });
const lk = (id, cat, name, station, cost, gives, tier, skill) => rc(id, cat, name, station, cost, Object.assign({ gives, tier }, skill ? { skill } : {}));
rc('trough', 'Build', 'Feed Trough', 'workbench', { 'Wood': 6, 'Scrap': 3 }, { place: 'trough', repeat: true, tier: 1 });
lk('feed_r', 'Supplies', 'Animal Feed x3', 'workbench', { 'Radish': 3 }, { 'Animal Feed': 3 }, 1);
lk('feed_c', 'Supplies', 'Animal Feed x5', 'workbench', { 'Corn': 2 }, { 'Animal Feed': 5 }, 2);
lk('tonic', 'Supplies', 'Beast Tonic', 'clinic', { 'Healroot': 1, 'Empty Bottle': 1 }, { 'Beast Tonic': 1 }, 3, ['husbandry', 3]);
lk('hide_cloth', 'Supplies', 'Cloth from Hide', 'workbench', { 'Hide': 1 }, { 'Cloth': 3 }, 1);
lk('cook_cheese', 'Cooking', 'Cheese', 'stove', { 'Milk': 2 }, { 'Cheese': 1 }, 2, ['cooking', 3]);
lk('cook_egg', 'Cooking', 'Fried Roach Egg', 'campfire', { 'Roach Egg': 1 }, { 'Fried Roach Egg': 1 }, 1);
lk('cook_omelette', 'Cooking', 'Roach Omelette', 'stove', { 'Roach Egg': 2, 'Beans': 1 }, { 'Roach Omelette': 1 }, 3, ['cooking', 4]);
Object.assign(RECIPE_DESC, { trough: 'Animals walk to a trough when they are hungry. Fill it with animal feed.', feed_r: 'Mashed radish. Fills a trough.', feed_c: 'Crushed corn. Fills a trough, and a lot of it.', tonic: 'Treats a sick animal. Needs a clinic bed nearby. Feed the animal again afterwards.', hide_cloth: 'Cut into strips and stitched.', cook_cheese: 'Milk, pressed and aged an afternoon.', cook_egg: 'Fry the egg clean.', cook_omelette: 'Two eggs and beans.' });
STRUCT_SPR.trough = { h: 16, paint: c => { R(c, '#5a4630', 1, 7, 14, 7); R(c, '#7a5a3a', 1, 7, 14, 2); R(c, '#3a2e22', 2, 13, 2, 3); R(c, '#3a2e22', 12, 13, 2, 3); R(c, '#2a2118', 3, 9, 10, 3); R(c, '#c8a86a', 4, 9, 8, 2); } };
Object.assign(ITEM_ART, {
  'Milk': q => { q('#f0ece0', 5, 5, 6, 9); q('#ffffff', 5, 5, 2, 8); q('#c8c4b8', 5, 13, 6, 1); q('#8a8a90', 6, 2, 4, 3); q('#4a6a8a', 5, 8, 6, 3); },
  'Cheese': q => { q('#e8c24a', 2, 6, 12, 7); q('#f0d86a', 2, 6, 12, 2); q('#c8a22a', 2, 12, 12, 1); q('#a8801a', 5, 9, 2, 2); q('#a8801a', 10, 8, 2, 2); },
  'Roach Egg': q => { q('#9a8a5a', 5, 4, 6, 9); q('#b8a870', 6, 4, 3, 5); q('#5a4a2a', 7, 9, 1, 1); q('#5a4a2a', 9, 7, 1, 1); q('#7a6a3a', 6, 12, 5, 1); },
  'Fried Roach Egg': q => { q('#e8e0d0', 3, 5, 10, 8); q('#f0ece0', 3, 5, 10, 2); q('#e8a82a', 6, 7, 4, 4); q('#f8c84a', 6, 7, 2, 2); q('#3a3a42', 2, 13, 12, 1); },
  'Roach Omelette': q => { q('#e8c870', 2, 6, 12, 7); q('#f0d890', 2, 6, 12, 2); q('#c8a850', 2, 12, 12, 1); q('#7a9a4a', 5, 8, 2, 1); q('#c0392b', 9, 9, 2, 1); q('#3a3a42', 1, 13, 14, 1); },
  'Hide': q => { q('#8a5a3a', 2, 4, 12, 9); q('#a8704a', 2, 4, 12, 2); q('#6a4228', 3, 12, 10, 1); q('#6a4228', 5, 7, 2, 2); q('#6a4228', 10, 8, 2, 2); q('#c8a080', 2, 4, 1, 9); },
  'Animal Feed': q => { q('#a8884a', 3, 5, 10, 9); q('#c8a86a', 3, 5, 10, 2); q('#6a4a2a', 3, 5, 10, 1); q('#8a6a3a', 6, 8, 4, 3); q('#e8d8a0', 7, 9, 2, 1); },
  'Beast Tonic': q => { q('#7fe8a8', 5, 5, 6, 9); q('#b8ffd0', 5, 5, 2, 8); q('#4a8a62', 5, 13, 6, 1); q('#8a6a3a', 6, 2, 4, 3); q('#c0392b', 7, 8, 2, 2); q('#e8e8e8', 5, 9, 6, 1); },
  'Twohead Calf': q => { q('#c8b8a0', 3, 7, 9, 5); q('#5a4030', 5, 8, 3, 2); q('#c8b8a0', 11, 4, 3, 3); q('#b8a890', 12, 7, 3, 3); q('#e6e0cc', 11, 3, 1, 1); q('#e6e0cc', 13, 3, 1, 1); q('#14120f', 13, 5, 1, 1); q('#14120f', 14, 8, 1, 1); q('#5a4030', 4, 12, 1, 3); q('#5a4030', 10, 12, 1, 3); },
  'Roach Hatchling': q => { q('#7a4a2a', 4, 8, 8, 4); q('#9a6a3a', 5, 8, 6, 1); q('#4a2a18', 11, 7, 3, 3); q('#2a1a10', 13, 5, 1, 2); q('#2a1a10', 14, 6, 1, 2); q('#2a1a10', 4, 12, 1, 2); q('#2a1a10', 7, 12, 1, 2); q('#2a1a10', 10, 12, 1, 2); q('#e8c24a', 13, 8, 1, 1); }
});

/* ---------- Sprites ---------- */
function paintCow(c, f, baby) {
  const l = f ? 1 : 0;
  R(c, '#c8b8a0', 4, 5, 16, 9); R(c, '#d8c8b0', 5, 5, 14, 2); R(c, '#5a4030', 7, 6, 4, 4); R(c, '#5a4030', 13, 8, 4, 4); R(c, '#a89880', 4, 12, 16, 2);
  R(c, '#e8a0a0', 9, 14, 4, 2);
  R(c, '#7a5a40', 5 + l, 14, 2, 4); R(c, '#7a5a40', 9 - l, 14, 2, 4); R(c, '#7a5a40', 14 + l, 14, 2, 4); R(c, '#7a5a40', 18 - l, 14, 2, 4);
  R(c, '#c8b8a0', 18, 1, 6, 6); R(c, '#b8a890', 20, 6, 6, 6); R(c, '#e6e0cc', 19, 0, 1, 2); R(c, '#e6e0cc', 22, 0, 1, 2); R(c, '#e6e0cc', 21, 5, 1, 2); R(c, '#e6e0cc', 25, 5, 1, 2);
  R(c, '#e8a0a0', 22, 4, 2, 2); R(c, '#e8a0a0', 24, 9, 2, 2); R(c, '#14120f', 21, 3, 1, 1); R(c, '#14120f', 23, 8, 1, 1); R(c, '#e8e0d0', 20, 2, 1, 1); R(c, '#5a4030', 3, 5, 1, 6); R(c, '#14120f', 2, 10, 2, 2);
}
function paintHen(c, f, baby) {
  const l = f ? 1 : 0;
  R(c, '#5a3a22', 4, 3, 10, 6); R(c, '#8a5a32', 5, 3, 7, 2); R(c, '#3a2412', 4, 8, 10, 1); R(c, '#7a4a2a', 6, 2, 7, 1);
  R(c, '#4a2a18', 13, 2, 4, 4); R(c, '#e8c24a', 15, 3, 1, 1); R(c, '#2a1a10', 16, 0, 1, 2); R(c, '#2a1a10', 18, 1, 1, 2); R(c, '#2a1a10', 17, 0, 2, 1);
  R(c, '#2a1a10', 5 + l, 9, 1, 3); R(c, '#2a1a10', 8 - l, 9, 1, 3); R(c, '#2a1a10', 11 + l, 9, 1, 3); R(c, '#2a1a10', 3, 5, 2, 1);
}
function drawAnimal(a) {
  const d = ANIMALS[a.type], baby = a.age < d.grow, f = a.moving ? Math.floor(a.walkT * 6) % 2 : 0;
  const w = a.type === 'cow' ? 28 : 20, h = a.type === 'cow' ? 18 : 12, key = 'AN|' + a.type + '|' + f + '|' + (baby ? 1 : 0);
  const spr = makeSprite(key, w, h, c => (a.type === 'cow' ? paintCow : paintHen)(c, f, baby));
  const sc = baby ? 0.62 : 1, bottom = a.y + 6;
  shadowAt(a.x, bottom - 1, (a.type === 'cow' ? 16 : 10) * sc);
  ctx.save(); ctx.translate(Math.round(a.x), Math.round(bottom)); ctx.scale(a.dirx < 0 ? -sc : sc, sc); if (a.sick) ctx.globalAlpha = 0.85; ctx.drawImage(spr, -w / 2, -h); ctx.restore();
  if (a.sick) { ctx.fillStyle = '#9be870'; ctx.fillRect(Math.round(a.x) - 1, Math.round(a.y - h * sc - 4), 3, 3); }
  else if (a.ready > 0) { ctx.fillStyle = '#ffe9a0'; ctx.fillRect(Math.round(a.x) - 1, Math.round(a.y - h * sc - 4 + Math.sin(state.elapsed * 4)), 3, 3); }
  const mx = state.mwx, my = state.mwy;
  if (Math.hypot(mx - a.x, my - (a.y - 2)) < 14) {
    ctx.font = '8px ' + MONO; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    const st = a.sick ? 'SICK' : a.hunger < 30 ? 'hungry' : baby ? 'growing' : a.ready > 0 ? a.ready + ' ready' : 'content';
    const txt = (baby ? d.baby : d.name) + ', ' + st; ctx.fillStyle = '#000'; ctx.fillText(txt, Math.round(a.x) + 0.5, Math.round(a.y - h * sc - 6) + 0.5); ctx.fillStyle = a.sick ? '#9be870' : '#f0e6cc'; ctx.fillText(txt, Math.round(a.x), Math.round(a.y - h * sc - 6));
  }
}
function drawAnimalsRow(ty) { if (state.map !== 'wastes') return; for (const a of animals) if (Math.floor((a.y + 6) / TS) === ty) drawAnimal(a); }

/* ---------- Life: hunger, wandering, days ---------- */
let lastGM = null, lastDayA = null, troughCache = [], troughT = 0;
function releaseAnimal(itemName, x, y) {
  const type = ANIMAL_ITEMS[itemName], d = ANIMALS[type];
  if (animals.filter(a => a.type === type).length >= d.cap) { toast('You do not have room for another ' + d.name.toLowerCase() + '. Build a bigger pen or slaughter one.', 3); return false; }
  animals.push({ id: Math.floor(Math.random() * 1e9), type, x, y, home: { x, y }, dirx: 1, walkT: 0, age: 0, hunger: 70, health: 100, sick: false, sickDays: 0, ready: 0, tgt: null, wait: 0 });
  toast('You set it down. It looks around, unimpressed.', 2.5); return true;
}
function addBaby(type, x, y, home) { animals.push({ id: Math.floor(Math.random() * 1e9), type, x, y, home: { x: home.x, y: home.y }, dirx: 1, walkT: 0, age: 0, hunger: 60, health: 100, sick: false, sickDays: 0, ready: 0, tgt: null, wait: 0 }); }
function troughs() { if (state.elapsed - troughT > 1) { troughT = state.elapsed; troughCache = []; for (const [i, s] of structs) if (s.type === 'trough') troughCache.push({ i, s, x: ((i % W) + 0.5) * TS, y: (Math.floor(i / W) + 0.5) * TS }); } return troughCache; }
function clinicNear() { for (const [i, s] of structs) if (s.type === 'clinic' && (!CAMP.active || inCampTile(i))) return true; return false; }
function husb() { return skillLevel('husbandry'); }
function stepAnimal(a, dt) {
  const d = ANIMALS[a.type], m = (dx, dy) => { const nx = a.x + dx, ny = a.y + dy; if (!collides(nx, a.y, d.size, false)) a.x = nx; if (!collides(a.x, ny, d.size, false)) a.y = ny; };
  a.moving = false;
  if (a.eatT > 0) { a.eatT -= dt; return; }
  const ts = troughs().filter(t => t.s.feed > 0).sort((p, q) => Math.hypot(p.x - a.x, p.y - a.y) - Math.hypot(q.x - a.x, q.y - a.y))[0];
  if (a.hunger < 55 && ts && Math.hypot(ts.x - a.x, ts.y - a.y) < 190) {
    const dx = ts.x - a.x, dy = ts.y + 9 - a.y, L = Math.hypot(dx, dy);
    if (L < d.size + 6) { ts.s.feed -= 1; a.hunger = Math.min(100, a.hunger + 45); a.eatT = 1.4; skillXp('husbandry', 0.3); }
    else { m(dx / L * d.speed * dt, dy / L * d.speed * dt); a.dirx = dx >= 0 ? 1 : -1; a.walkT += dt; a.moving = true; }
    return;
  }
  const near = troughs()[0]; if (near && Math.hypot(near.x - a.home.x, near.y - a.home.y) > 12) a.home = { x: near.x, y: near.y };
  a.wait -= dt;
  if (!a.tgt && a.wait <= 0) { const an = Math.random() * 6.283, r = 10 + Math.random() * 56; a.tgt = { x: a.home.x + Math.cos(an) * r, y: a.home.y + Math.sin(an) * r }; }
  if (a.tgt) { const dx = a.tgt.x - a.x, dy = a.tgt.y - a.y, L = Math.hypot(dx, dy); if (L < 3) { a.tgt = null; a.wait = 1.5 + Math.random() * 4; } else { const ox = a.x, oy = a.y; m(dx / L * d.speed * dt * 0.6, dy / L * d.speed * dt * 0.6); a.dirx = dx >= 0 ? 1 : -1; a.walkT += dt; a.moving = true; if (Math.abs(a.x - ox) + Math.abs(a.y - oy) < 0.01) { a.tgt = null; a.wait = 1; } } }
}
function animalDay() {
  const dead = [];
  const crowd = (a) => animals.filter(b => b !== a && Math.hypot(b.x - a.x, b.y - a.y) < 70).length;
  for (const a of animals) {
    const d = ANIMALS[a.type], adult = a.age >= d.grow;
    if (a.hunger < 15) a.health -= 12; else if (a.hunger > 50) a.health = Math.min(100, a.health + 8);
    if (!a.sick) { let p = 0.015 + (a.hunger < 30 ? 0.07 : 0) + (crowd(a) > 5 ? 0.05 : 0); p *= (husb() >= 4 ? 0.6 : 1) * (clinicNear() ? 0.5 : 1); if (Math.random() < p) { a.sick = true; a.sickDays = 0; toast('A ' + d.name.toLowerCase() + ' looks unwell. Treat it with a Beast Tonic, then feed it.', 5); } }
    else { a.sickDays++; a.health -= 20; }
    if (a.health <= 0) { dead.push(a); continue; }
    if (adult && !a.sick && a.hunger >= 40) { const cap = 3 + (husb() >= 8 ? 1 : 0); a.ready = Math.min(cap, a.ready + 1); }
  }
  for (const a of dead) { animals.splice(animals.indexOf(a), 1); toast('A ' + ANIMALS[a.type].name.toLowerCase() + ' died. ' + (a.sick ? 'It never got its tonic.' : 'It starved.'), 5); }
  for (const type of Object.keys(ANIMALS)) {
    const d = ANIMALS[type], ad = animals.filter(a => a.type === type && a.age >= d.grow && !a.sick && a.hunger >= 60);
    if (ad.length >= 2 && animals.filter(a => a.type === type).length < d.cap && Math.random() < 0.3 + 0.04 * (husb() - 1) + (husb() >= 6 ? 0.1 : 0)) { const p = ad[0]; addBaby(type, p.x + 8, p.y + 6, p.home); skillXp('husbandry', 3); toast('A ' + d.baby.toLowerCase() + ' has been born.', 4); }
  }
  for (const a of animals) a.age += 1;
}
function updateAnimals(dt) {
  if (state.title) return;
  ensureSkill();
  if (state.map !== 'wastes') return;
  const gm = state.gameMinutes;
  if (lastGM === null || gm < lastGM) lastGM = gm;
  const dm = gm - lastGM; lastGM = gm;
  const day = clockDay(); if (lastDayA === null) lastDayA = day; if (day > lastDayA) { for (let k = lastDayA; k < day; k++) animalDay(); lastDayA = day; }
  for (const a of animals) { const d = ANIMALS[a.type]; a.hunger = Math.max(0, a.hunger - dm * d.hungerDay / 1440 * (a.sick ? 0.5 : 1)); stepAnimal(a, dt); }
}
{ const o = updateStorm; updateStorm = function (dt) { o(dt); updateAnimals(dt); }; }

/* ---------- Clicking on animals and troughs ---------- */
{ const o = getTarget; getTarget = function () {
  if (state.map === 'wastes') {
    const p = state.player; let best = null, bd = 10;
    for (const a of animals) { const dd = Math.hypot(state.mwx - a.x, state.mwy - (a.y - 2)); if (dd < bd) { bd = dd; best = a; } }
    if (best) { const dist = Math.hypot(best.x - p.x, best.y - p.y), tx = Math.floor(best.x / TS), ty = Math.floor(best.y / TS); return { tx, ty, i: ty * W + tx, dist, inReach: dist <= CONFIG.player.reach + 10, canHarvest: true, tier: 0, kind: 0, animal: best, res: { name: ANIMALS[best.type].name, item: 'animal', minTier: 0, tool: 'axe', animalLabel: ANIMALS[best.type].name + (best.sick ? '  (sick: use a Beast Tonic)' : best.ready > 0 ? '  (click to collect ' + best.ready + ')' : '  (hold feed to feed it, a melee weapon to slaughter)') } }; }
    const tx = Math.floor(state.mwx / TS), ty = Math.floor(state.mwy / TS);
    if (tx >= 0 && ty >= 0 && tx < W && ty < H) { const i = ty * W + tx, st = structs.get(i); if (st && st.type === 'trough') { const dist = Math.hypot((tx + 0.5) * TS - p.x, (ty + 0.5) * TS - p.y); return { tx, ty, i, dist, inReach: dist <= CONFIG.player.reach, canHarvest: true, tier: 0, kind: 0, trough: st, res: { name: 'Feed Trough', item: 'trough', minTier: 0, tool: 'axe', animalLabel: 'Feed Trough  (hold Animal Feed and click to fill, X to remove)' } }; } }
  }
  return o();
}; }
function animalAction(a) {
  const sel = selItem(), d = ANIMALS[a.type], baby = a.age < d.grow;
  state.actCd = 0.45;
  if (sel && WEAPONS[sel.name] && WEAPONS[sel.name].kind === 'melee') {
    if (a.confirm && state.elapsed < a.confirm) {
      const meat = baby ? 1 : d.meat[0] + Math.floor(Math.random() * (d.meat[1] - d.meat[0] + 1));
      state.drops.push({ x: a.x, y: a.y, name: 'Raw Meat', qty: meat, t: 0 }); if (d.hide && !baby) state.drops.push({ x: a.x + 5, y: a.y, name: 'Hide', qty: d.hide, t: 0 });
      bloodSpray(a.x, a.y - 6, 0.3, -0.2, 5); sfx('hurt'); animals.splice(animals.indexOf(a), 1); toast('Done. It was quick.', 2.5); return;
    }
    a.confirm = state.elapsed + 2.5; toast('Click again to slaughter the ' + d.name.toLowerCase() + '.', 2.5); return;
  }
  if (sel && sel.name === 'Beast Tonic') {
    if (!a.sick) { toast('It is not sick.', 2); return; }
    consumeSel(); a.sick = false; a.sickDays = 0; a.health = Math.min(100, a.health + 30); skillXp('husbandry', 4); burst(a.x, a.y - 8, '#7fe8a8', 8); toast('The tonic works. Feed it, and keep an eye on it.', 3.5); return;
  }
  if (sel && sel.name === 'Animal Feed') { consumeSel(); a.hunger = Math.min(100, a.hunger + 40); a.eatT = 1.2; skillXp('husbandry', 0.5); burst(a.x, a.y - 6, '#c8a86a', 4); return; }
  if (a.ready > 0) {
    const extra = Math.random() < 0.1 * (husb() - 1) ? 1 : 0, n = a.ready + extra;
    if (!spaceFor(d.product, n)) { toast('Bag full.', 1.5); return; }
    addItem(d.product, n); a.ready = 0; skillXp('husbandry', 1.5 * n); sfx('pickup'); state.floats.push({ x: a.x, y: a.y - 16, text: '+' + n + ' ' + d.product, color: '#ffe9a0', life: 1.4 }); return;
  }
  toast(d.name + ': ' + (a.sick ? 'sick, needs a Beast Tonic' : baby ? 'still growing' : a.hunger < 40 ? 'hungry, it will not give anything until it eats' : 'nothing to collect yet') + '.', 3);
}
function troughAction(st) {
  const sel = selItem(); state.actCd = 0.3;
  if (sel && sel.name === 'Animal Feed') { if ((st.feed || 0) >= 12) { toast('The trough is full.', 1.5); return; } st.feed = (st.feed || 0) + 1; consumeSel(); skillXp('husbandry', 0.2); sfx('place'); return; }
  toast('Feed trough: ' + (st.feed || 0) + ' of 12 feed. Hold Animal Feed and click to fill it.', 2.5);
}
{ const o = doTargetAction; doTargetAction = function (t) { if (t && t.animal) return animalAction(t.animal); if (t && t.trough) return troughAction(t.trough); return o(t); }; }
{ const o = isHotbarable; isHotbarable = function (name) { return !!(ANIMAL_ITEMS[name] || name === 'Animal Feed' || name === 'Beast Tonic') || o(name); }; }
{ const o = genStock; genStock = function () {
  const s = o(); for (const [nm, ch] of [['Twohead Calf', 0.25], ['Roach Hatchling', 0.4], ['Animal Feed', 0.5]]) if (Math.random() < ch && !s.some(x => x.name === nm)) s.push({ name: nm, qty: nm === 'Animal Feed' ? 6 : 1, price: Math.ceil(itemValue(nm) * 1.7) });
  return s;
}; }
Object.assign(DBG, { animals, ANIMALS, releaseAnimal, animalDay, updateAnimals, animalAction, troughAction, drawAnimalsRow, ensureSkill, genStock, SKILLS, SKILL_ORDER });
