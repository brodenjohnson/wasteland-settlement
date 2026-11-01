/* =====================================================================
   CONTENT: skills, a tiered crafting tree, fishing, cooking, steel gear,
   clinics, decorations, defences, and movable structures
   ===================================================================== */
const SKILLS = {
  gathering: { name: 'Gathering', blurb: 'Chopping, mining and scrounging.', perk: l => '+' + Math.round((l - 1) * 5) + '% tool power, ' + Math.round((l - 1) * 6) + '% chance of extra materials' },
  farming: { name: 'Farming', blurb: 'Planting, watering and harvesting.', perk: l => Math.round((l - 1) * 10) + '% chance of an extra harvest' },
  crafting: { name: 'Crafting', blurb: 'Building and making things. Opens higher tiers.', perk: l => 'Tier unlocks at levels 3, 5, 6 and 7' },
  combat: { name: 'Combat', blurb: 'Fighting off whatever comes for you.', perk: l => '+' + Math.round((l - 1) * 3) + '% damage' },
  fishing: { name: 'Fishing', blurb: 'Patience, mostly.', perk: l => 'Faster bites, wider catch window, rarer fish (level ' + l + ')' },
  cooking: { name: 'Cooking', blurb: 'Turning ingredients into proper meals.', perk: l => Math.round((l - 1) * 8) + '% chance of an extra serving' },
  exploring: { name: 'Exploring', blurb: 'Discovering regions, caches and strange places.', perk: l => '+' + Math.round((l - 1) * 2) + '% move speed' }
};
const SKILL_ORDER = ['gathering', 'farming', 'crafting', 'combat', 'fishing', 'cooking', 'exploring'];
function skillNeed(l) { return 20 + 25 * (l - 1); }
function skillLevel(name) { return state.player.skills[name].lvl; }
function skillXp(name, amt) {
  const sk = state.player.skills[name];
  if (!sk) return;
  if (sk.lvl < 10) {
    sk.xp += amt;
    while (sk.lvl < 10 && sk.xp >= skillNeed(sk.lvl)) {
      sk.xp -= skillNeed(sk.lvl); sk.lvl++;
      toast(SKILLS[name].name + ' reached level ' + sk.lvl + '.', 3.5); sfx('levelup');
      state.floats.push({ x: state.player.x, y: state.player.y - 26, text: SKILLS[name].name + ' ' + sk.lvl, color: '#ffd36b', life: 1.8 });
    }
  }
  gainXp(name === 'combat' ? amt : amt * 0.5);
}
function gatherMult() { return 1 + 0.05 * (skillLevel('gathering') - 1); }
function dmgScale() { return 1 + CONFIG.combat.dmgPerLevel * (state.player.level - 1) + 0.03 * (skillLevel('combat') - 1); }

/* ---------- Items ---------- */
Object.assign(WEAPONS, {
  'Steel Cleaver': { kind: 'melee', dmg: 52, cd: 0.5, reach: 26, kb: 240, col: '#9fb0c8' },
  'Hunting Rifle': { kind: 'gun', dmg: 52, cd: 0.95, speed: 300, range: 260, ammo: 'Pistol rounds', col: '#6a5a4a' }
});
Object.assign(ARMOUR, {
  'Steel Helm': { slot: 'head', dmg: 0.14, rad: 0, col: '#9fb0c8' }, 'Steel Plate': { slot: 'body', dmg: 0.26, rad: 0, col: '#8ea0bc' },
  'Steel Greaves': { slot: 'legs', dmg: 0.18, rad: 0, col: '#8294b0' }, 'Steel Boots': { slot: 'feet', dmg: 0.11, rad: 0, col: '#7688a4' }
});
Object.assign(TOOL_ITEMS, { 'Steel Axe': { type: 'axe', tier: 3 }, 'Steel Pickaxe': { type: 'pickaxe', tier: 3 }, 'Fishing Rod': { type: 'rod', tier: 1 } });
for (const k of ['Steel Cleaver', 'Hunting Rifle', 'Steel Helm', 'Steel Plate', 'Steel Greaves', 'Steel Boots', 'Steel Axe', 'Steel Pickaxe', 'Fishing Rod']) ITEM_STACK[k] = 1;
ITEM_STACK['Caps'] = 9999;
Object.assign(ITEM_COL, {
  'Fishing Rod': '#8a6a3a', 'Raw Fish': '#8ab0c0', 'Glowfish': '#9be870', 'Golden Carp': '#e8c24a', 'Cooked Fish': '#d89a5a', 'Cooked Glowfish': '#c8a050',
  'Baked Potato': '#c9a45a', 'Berry Mash': '#a03a5a', 'Veg Stew': '#b8683a', 'Fish Stew': '#c88a4a', 'Tomato Soup': '#d94a3a', 'Medkit': '#e8e0d0',
  'Steel Ingot': '#9fb0c8', 'Caps': '#e8c24a', 'Steel Axe': '#9fb0c8', 'Steel Pickaxe': '#9fb0c8', 'Blueprint': '#d8cdb5'
});
Object.assign(ITEM_USE, {
  'Raw Fish': { food: 8 }, 'Glowfish': { food: 8, rad: 10 }, 'Golden Carp': { food: 12 }, 'Cooked Fish': { food: 30, heal: 4 }, 'Cooked Glowfish': { food: 28, rad: 3, heal: 3 },
  'Baked Potato': { food: 38, heal: 3 }, 'Berry Mash': { food: 22, water: 6 }, 'Veg Stew': { food: 62, heal: 12 }, 'Fish Stew': { food: 75, heal: 16 },
  'Tomato Soup': { food: 40, water: 25, heal: 6 }, 'Medkit': { heal: 70 }
});
Object.assign(ITEM_DESC, {
  'Fishing Rod': 'Select it and click water to cast. Click again the moment you see the !', 'Raw Fish': 'Cook it for much more food.', 'Glowfish': 'Pulled from irradiated water. Cook it, and mind the radiation.',
  'Golden Carp': 'A rare catch. Eats fine, sells better.', 'Cooked Fish': 'A proper meal.', 'Cooked Glowfish': 'Cooking takes most of the radiation out.', 'Baked Potato': 'Filling and simple.',
  'Berry Mash': 'Sweet, and a little water too.', 'Veg Stew': 'Hearty. Heals as it feeds.', 'Fish Stew': 'The best thing you can eat out here.', 'Tomato Soup': 'Food and water in one bowl.',
  'Medkit': 'Heals a lot, fast.', 'Steel Ingot': 'Smelted from iron ore. The basis of steel gear.', 'Caps': 'Bottle caps. What merchants take.',
  'Steel Axe': 'Cuts through almost anything.', 'Steel Pickaxe': 'Breaks almost anything.', 'Steel Cleaver': 'Heavy, sharp, and slow to forget.', 'Hunting Rifle': 'Long range. Slow to fire, hard to survive.'
});
Object.assign(ITEM_TIER, { 'Fishing Rod': 1, 'Steel Cleaver': 3, 'Hunting Rifle': 3, 'Steel Helm': 3, 'Steel Plate': 3, 'Steel Greaves': 3, 'Steel Boots': 3, 'Steel Axe': 3, 'Steel Pickaxe': 3 });
Object.assign(BLUEPRINTS, { steel: 'Steelworking', fort: 'Fortifications', anvil: 'Anvil Techniques', kitchen: 'Kitchen Craft' });
const BP_ITEMS = {};
for (const k of Object.keys(BLUEPRINTS)) BP_ITEMS['Blueprint: ' + BLUEPRINTS[k]] = k;
for (const k of Object.keys(BP_ITEMS)) { ITEM_COL[k] = '#d8cdb5'; ITEM_STACK[k] = 1; ITEM_DESC[k] = 'Right-click to learn it.'; }
const VALUE = {
  'Wood': 2, 'Scrap': 2, 'Stone': 2, 'Iron ore': 6, 'Metal plate': 9, 'Cloth': 4, 'Berries': 2, 'Radish': 5, 'Potato': 7, 'Tomato': 8, 'Raw Fish': 5, 'Glowfish': 4, 'Golden Carp': 40,
  'Cooked Fish': 14, 'Cooked Glowfish': 12, 'Baked Potato': 14, 'Berry Mash': 9, 'Veg Stew': 28, 'Fish Stew': 36, 'Tomato Soup': 22, 'Canned food': 10, 'Rad tabs': 14, 'Rad-Away': 30,
  'Bandage': 8, 'Medkit': 30, 'Pistol rounds': 6, 'Radish Seeds': 3, 'Potato Seeds': 4, 'Tomato Seeds': 5, 'Sapling': 4, 'Empty Bottle': 3, 'Spring Water': 4, 'Purified Water': 8, 'Steel Ingot': 24,
  'Scrap Axe': 14, 'Scrap Pickaxe': 14, 'Hoe': 12, 'Watering Can': 14, 'Fishing Rod': 16, 'Iron Axe': 38, 'Iron Pickaxe': 38, 'Steel Axe': 90, 'Steel Pickaxe': 90,
  'Rusty Pipe': 2, 'Scrap Machete': 24, 'Iron Cleaver': 70, 'Steel Cleaver': 140, 'Scrap Pistol': 60, 'Hunting Rifle': 180
};
for (const k of Object.keys(ARMOUR)) { const t = ITEM_TIER[k] || 1; VALUE[k] = [8, 20, 55, 120][Math.max(0, Math.min(3, t))] + Math.round((ARMOUR[k].dmg + ARMOUR[k].rad) * 100); }
for (const k of Object.keys(BP_ITEMS)) VALUE[k] = 70;
function itemValue(name) { return VALUE[name] || 2; }
{ const o = iconKind; iconKind = function (n) {
  if (n === 'Caps') return 'coin';
  if (n === 'Fishing Rod') return 'rod';
  if (/Fish$|Glowfish|Golden Carp/.test(n)) return 'fish';
  if (/Stew|Soup|Mash|Baked Potato/.test(n)) return 'meal';
  if (n === 'Medkit') return 'med';
  if (n === 'Steel Ingot') return 'ingot';
  if (/^Blueprint/.test(n)) return 'paper';
  return o(n);
}; }

/* ---------- Structures ---------- */
const NONSOLID = new Set(['bedroll', 'rug', 'trap']);
const WALLTYPES = new Set(['wall', 'scrapwall', 'stonewall', 'steelwall']);
Object.assign(STRUCT_HP, { bedroll: 90, campfire: 150, stove: 140, anvil: 200, clinic: 100, rug: 30, table: 70, chair: 40, bookshelf: 80, banner: 40, pot: 30, stonewall: 420, steelwall: 800, trap: 50, turret: 200 });
Object.assign(STATION_NAMES, { bedroll: 'Bedroll', campfire: 'Campfire', stove: 'Stove', anvil: 'Anvil', clinic: 'Clinic Bed', rug: 'Rug', table: 'Table', chair: 'Chair', bookshelf: 'Bookshelf', banner: 'Banner', pot: 'Potted Plant', stonewall: 'Stone Wall', steelwall: 'Steel Wall', trap: 'Spike Trap', turret: 'Scrap Turret' });
Object.assign(LIGHT_R, { campfire: 70, stove: 30 });
function paintBedrollS(c) { paintBedroll(c); }
function paintCampfire(c) { R(c, '#26211c', 3, 8, 10, 6); R(c, '#6a665f', 2, 10, 3, 3); R(c, '#6a665f', 11, 10, 3, 3); R(c, '#6a665f', 5, 12, 6, 2); R(c, '#8a8680', 2, 10, 3, 1); R(c, '#8a8680', 11, 10, 3, 1); R(c, '#4a3320', 4, 10, 8, 2); }
function paintStove(c) { R(c, '#2a2a30', 4, 0, 3, 7); R(c, '#4a4a54', 4, 0, 1, 7); R(c, '#3e4046', 1, 6, 14, 14); R(c, '#5a5d64', 1, 6, 14, 2); R(c, '#14120f', 3, 10, 10, 7); R(c, '#8a8d94', 2, 8, 12, 1); R(c, '#4a4d54', 1, 18, 14, 2); R(c, '#a8532a', 12, 9, 2, 2); }
function paintAnvil(c) { R(c, '#2a2a30', 4, 10, 8, 4); R(c, '#3e4046', 3, 6, 10, 5); R(c, '#6a6e78', 2, 4, 12, 3); R(c, '#9aa0aa', 2, 4, 12, 1); R(c, '#6a6e78', 12, 5, 3, 2); R(c, '#14120f', 5, 13, 6, 1); R(c, '#a8532a', 5, 3, 3, 1); }
function paintClinic(c) { R(c, '#4a3320', 1, 8, 14, 8); R(c, '#e8e4dc', 2, 3, 12, 8); R(c, '#ffffff', 2, 3, 4, 4); R(c, '#c8c4bc', 2, 10, 12, 1); R(c, '#c0392b', 9, 5, 3, 1); R(c, '#c0392b', 10, 4, 1, 3); R(c, '#3a2816', 0, 15, 16, 1); }
function paintRug(c) { R(c, '#7a3a3a', 1, 2, 14, 12); R(c, '#a85a4a', 2, 3, 12, 10); R(c, '#e8c24a', 2, 3, 12, 1); R(c, '#e8c24a', 2, 12, 12, 1); R(c, '#4a6a8a', 5, 5, 6, 6); R(c, '#e8e0d0', 7, 7, 2, 2); }
function paintTable2(c) { R(c, '#4a3320', 2, 8, 2, 6); R(c, '#4a3320', 12, 8, 2, 6); R(c, '#8a5a2b', 0, 4, 16, 5); R(c, '#a87a45', 0, 4, 16, 1); R(c, '#6b4220', 0, 8, 16, 1); R(c, '#d8cdb5', 3, 5, 3, 2); R(c, '#6a8a4a', 10, 3, 3, 3); }
function paintChair(c, back) { R(c, '#4a3320', 3, 10, 2, 5); R(c, '#4a3320', 10, 10, 2, 5); R(c, '#8a5a2b', 2, 7, 11, 4); R(c, '#a87a45', 2, 7, 11, 1); if (!back) { R(c, '#6b4a2b', 2, 1, 11, 6); R(c, '#8a6238', 2, 1, 11, 1); } else { R(c, '#6b4a2b', 2, 11, 11, 3); } }
function paintBookshelf(c) {
  R(c, '#4a3320', 0, 0, 16, 20); R(c, '#6b4a2b', 1, 1, 14, 18);
  const cols = ['#c0392b', '#4a6a8a', '#d6a84a', '#6a8a4a', '#8a4a8a', '#e8e0d0'];
  for (let k = 0; k < 3; k++) { R(c, '#3a2816', 1, 6 + k * 6, 14, 1); for (let x = 0; x < 6; x++) R(c, cols[(x + k * 2) % 6], 2 + x * 2, 2 + k * 6, 2, 4); }
}
function paintBanner(c) { R(c, '#4a3320', 7, 0, 2, 24); R(c, '#8a2a22', 3, 2, 10, 14); R(c, '#b03a30', 3, 2, 10, 2); R(c, '#e8c24a', 6, 6, 4, 4); R(c, '#14120f', 7, 7, 2, 2); R(c, '#8a2a22', 3, 15, 3, 3); R(c, '#8a2a22', 10, 15, 3, 3); R(c, '#e8c24a', 3, 2, 10, 1); }
function paintPot(c) { R(c, '#a8532a', 4, 9, 8, 6); R(c, '#c4703a', 3, 8, 10, 2); R(c, '#7a3a1a', 4, 14, 8, 1); R(c, '#3f7a3c', 3, 2, 4, 6); R(c, '#5fae4a', 8, 1, 5, 7); R(c, '#86cc66', 5, 3, 2, 2); R(c, '#e07a9a', 9, 1, 2, 2); }
function paintWallStone(c, back, mask) {
  const L = mask & 1, Rr = mask & 2, x0 = L ? 0 : 3, x1 = Rr ? 16 : 13;
  R(c, '#6a665f', x0, 4, x1 - x0, 20); R(c, '#8a867f', x0, 4, x1 - x0, 3); R(c, '#4a4640', x0, 21, x1 - x0, 3);
  for (let y = 8; y < 21; y += 4) { R(c, '#3e3a35', x0, y, x1 - x0, 1); const off = ((y >> 2) & 1) * 4; for (let x = x0 + off; x < x1; x += 8) R(c, '#3e3a35', x, y, 1, 4); }
  R(c, '#5f8a4a', x0 + 2, 4, 3, 1); R(c, '#9a968f', x0 + 1, 4, 5, 1);
}
function paintWallSteel(c, back, mask) {
  const L = mask & 1, Rr = mask & 2, x0 = L ? 0 : 3, x1 = Rr ? 16 : 13;
  R(c, '#5a6272', x0, 3, x1 - x0, 21); R(c, '#8a96aa', x0, 3, x1 - x0, 3); R(c, '#2e3440', x0, 21, x1 - x0, 3);
  for (let x = x0 + 2; x < x1 - 1; x += 5) { R(c, '#3e4656', x, 6, 1, 15); R(c, '#aab4c8', x + 1, 6, 1, 15); }
  for (let y = 8; y < 20; y += 6) for (let x = x0 + 1; x < x1; x += 5) R(c, '#c8d0e0', x, y, 1, 1);
  R(c, '#2a2a30', x0, 2, x1 - x0, 1); for (let x = x0 + 1; x < x1; x += 3) { R(c, '#2a2a30', x, 0, 1, 3); R(c, '#c9c9cf', x, 0, 1, 1); }
}
function paintTrap(c) { R(c, '#3e4046', 1, 8, 14, 6); R(c, '#5a5d64', 1, 8, 14, 1); for (let x = 2; x < 14; x += 3) { R(c, '#c9c9cf', x, 3, 2, 6); R(c, '#ffffff', x, 3, 1, 2); } R(c, '#a8532a', 4, 12, 2, 1); }
function paintTurret(c) { R(c, '#3e4046', 3, 12, 10, 8); R(c, '#5a5d64', 2, 10, 12, 3); R(c, '#2a2a30', 5, 5, 6, 6); R(c, '#6a6e78', 9, 6, 6, 3); R(c, '#c9c9cf', 14, 6, 1, 3); R(c, '#a8532a', 6, 13, 4, 1); R(c, '#d6a84a', 6, 7, 2, 2); }
Object.assign(STRUCT_SPR, {
  bedroll: { h: 16, paint: paintBedrollS }, campfire: { h: 16, paint: paintCampfire }, stove: { h: 20, paint: paintStove }, anvil: { h: 16, paint: paintAnvil },
  clinic: { h: 16, paint: paintClinic }, rug: { h: 16, paint: paintRug }, table: { h: 16, paint: paintTable2 }, chair: { h: 16, paint: paintChair },
  bookshelf: { h: 20, paint: paintBookshelf }, banner: { h: 24, paint: paintBanner }, pot: { h: 16, paint: paintPot },
  stonewall: { h: 24, paint: paintWallStone }, steelwall: { h: 24, paint: paintWallSteel }, trap: { h: 16, paint: paintTrap }, turret: { h: 20, paint: paintTurret }
});
function wallLike(j) { const s = structs.get(j); return s && (WALLTYPES.has(s.type) || s.type === 'gate' || s.type === 'guardpost') ? 1 : 0; }
function nearestStructOf(type, x, y) {
  let best = null, bd = 1e9;
  for (const [i, st] of structs) if (st.type === type) { const sx = ((i % W) + 0.5) * TS, sy = (Math.floor(i / W) + 0.5) * TS, d = Math.hypot(sx - x, sy - y); if (d < bd) { bd = d; best = { i, x: sx, y: sy }; } }
  return best;
}
function comfort() {
  let c = 0;
  for (const [, st] of structs) c += ({ rug: 1, table: 1, chair: 1, bookshelf: 2, banner: 1.5, pot: 1, lamp: 0.5, clinic: 1 })[st.type] || 0;
  return Math.min(20, c);
}
function jobEff(s) { return (1 + 0.08 * (jobLevel(s, s.job) - 1)) * (1 + comfort() * 0.012); }
function updateStructures(dt) {
  const p = state.player;
  for (const [i, st] of structs) {
    const cx = ((i % W) + 0.5) * TS, cy = (Math.floor(i / W) + 0.5) * TS;
    st.cd = Math.max(0, (st.cd || 0) - dt);
    if (st.type === 'turret') {
      if (st.cd > 0) continue;
      const foe = nearestFoe(cx, cy - 8, 150);
      const ta = foe ? Math.atan2(foe.y - (cy - 8), foe.x - cx) : 0;
      if (foe && lineClear(cx + Math.cos(ta) * 11, cy - 8 + Math.sin(ta) * 11, foe.x, foe.y, true)) {
        if ((st.ammo || 0) <= 0 && chestCount('Pistol rounds') >= 1) { st.ammo = chestTake('Pistol rounds', 5); }
        if ((st.ammo || 0) > 0) {
          st.ammo--; st.cd = 0.7;
          const a = Math.atan2(foe.y - (cy - 8), foe.x - cx);
          state.projs.push({ x: cx, y: cy - 8, vx: Math.cos(a) * 250, vy: Math.sin(a) * 250, dmg: 16, life: 0.7, hostile: false, from: 'Turret' });
          sfx('gun');
        }
      }
    } else if (st.type === 'trap') {
      for (const e of enemies) if (!e.hidden && st.cd <= 0 && Math.hypot(e.x - cx, e.y - cy) < 9) { damageEnemy(e, 24, 0, -1, 30); st.cd = 1; st.hp -= 7; sfx('hit'); }
      if (st.hp <= 0) structs.delete(i);
    } else if (st.type === 'clinic') {
      if (Math.hypot(p.x - cx, p.y - cy) < 56 && p.health < maxHealth() && !state.sleeping) p.health = Math.min(maxHealth(), p.health + 2.4 * dt);
      for (const s of settlers) if (Math.hypot(s.x - cx, s.y - cy) < 56 && s.health < s.maxHealth) s.health = Math.min(s.maxHealth, s.health + 3.2 * dt);
    }
  }
}

/* ---------- Fishing ---------- */
function fishingClick(t) {
  const F = state.fish, sk = skillLevel('fishing');
  state.actCd = 0.5; mouse.down = false;
  if (!F) {
    state.fish = { phase: 'wait', t: 0, wait: Math.max(1.4, (2.5 + Math.random() * 4.5) * (1 - 0.05 * (sk - 1))), tx: t.tx, ty: t.ty, dirty: !!t.res.dirty };
    sfx('swing'); return;
  }
  if (F.phase === 'bite') { catchFish(F); state.fish = null; return; }
  state.fish = null; toast('You reel in an empty line.', 1.5);
}
function catchFish(F) {
  const sk = skillLevel('fishing'), r = Math.random();
  let name;
  if (F.dirty) name = r < 0.88 ? 'Glowfish' : 'Raw Fish';
  else name = r < 0.04 + 0.014 * sk ? 'Golden Carp' : 'Raw Fish';
  if (!spaceFor(name, 1)) state.drops.push({ x: state.player.x, y: state.player.y + 6, name, qty: 1, t: 0 }); else addItem(name, 1);
  skillXp('fishing', name === 'Golden Carp' ? 14 : 6); questEvent('fished'); sfx('pickup');
  state.floats.push({ x: (F.tx + 0.5) * TS, y: F.ty * TS, text: '+1 ' + name, color: '#9fe8ff', life: 1.4 });
  burst((F.tx + 0.5) * TS, (F.ty + 0.5) * TS, '#cfe6ee', 8);
}
function updateFishing(dt) {
  const F = state.fish;
  if (!F) return;
  const p = state.player, sel = selItem();
  if (Math.hypot((F.tx + 0.5) * TS - p.x, (F.ty + 0.5) * TS - p.y) > 70 || !sel || sel.name !== 'Fishing Rod') { state.fish = null; return; }
  F.t += dt;
  if (F.phase === 'wait' && F.t >= F.wait) { F.phase = 'bite'; F.t = 0; sfx('pickup'); burst((F.tx + 0.5) * TS, (F.ty + 0.5) * TS, '#ffffff', 6); }
  else if (F.phase === 'bite') {
    if (mouse.down && state.actCd <= 0) { catchFish(F); state.fish = null; state.actCd = 0.5; mouse.down = false; return; }
    if (F.t > 1.15 + 0.08 * (skillLevel('fishing') - 1)) { state.fish = null; toast('It got away.', 1.5); }
  }
}
function drawFishing() {
  const F = state.fish;
  if (!F) return;
  const p = state.player, bx = (F.tx + 0.5) * TS, by = (F.ty + 0.5) * TS + (F.phase === 'bite' ? Math.sin(state.elapsed * 30) * 1.2 : Math.sin(state.elapsed * 2) * 0.6);
  ctx.strokeStyle = 'rgba(240,240,230,0.8)'; ctx.lineWidth = 1 / scale * 1.2;
  ctx.beginPath(); ctx.moveTo(p.x + p.aimX * 8, p.y - 8); ctx.quadraticCurveTo((p.x + bx) / 2, Math.min(p.y, by) - 14, bx, by); ctx.stroke();
  ctx.fillStyle = '#e8503a'; ctx.fillRect(Math.round(bx) - 1, Math.round(by) - 2, 3, 2); ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(bx) - 1, Math.round(by), 3, 2);
  if (F.phase === 'bite') { ctx.fillStyle = '#ffd36b'; ctx.font = '12px ' + MONO; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', Math.round(p.x), Math.round(p.y - 32 + Math.sin(state.elapsed * 20) * 1.5)); }
}

/* ---------- Recipes, tiers and skill unlocks ---------- */
function rc(id, cat, name, station, cost, o) { const r = Object.assign({ id, cat, name, station, cost, unlock: null }, o || {}); RECIPES.push(r); return r; }
CRAFT_TABS.length = 0; CRAFT_TABS.push('Build', 'Structure', 'Defence', 'Decor', 'Tools', 'Weapons', 'Armour', 'Cooking', 'Supplies');
RECIPES.forEach(r => { if (r.id === 'barricade' || r.id === 'guardpost') r.cat = 'Defence'; if (r.id === 'lamp') r.cat = 'Decor'; });
rc('bedroll', 'Build', 'Bedroll', null, { 'Cloth': 4, 'Wood': 2 }, { place: 'bedroll' });
rc('campfire', 'Build', 'Campfire', null, { 'Wood': 6, 'Stone': 4 }, { place: 'campfire' });
rc('stove', 'Build', 'Stove', 'workbench', { 'Scrap': 12, 'Metal plate': 3, 'Stone': 6 }, { place: 'stove', skill: ['cooking', 3], unlock: 'kitchen' });
rc('anvil', 'Build', 'Anvil', 'forge', { 'Metal plate': 8, 'Stone': 6, 'Scrap': 6 }, { place: 'anvil', unlock: 'anvil', skill: ['crafting', 6] });
rc('clinic', 'Build', 'Clinic Bed', 'workbench', { 'Wood': 12, 'Cloth': 10, 'Metal plate': 2 }, { place: 'clinic', unlock: 'medicine', skill: ['crafting', 5] });
rc('stonewall', 'Structure', 'Stone Wall', 'workbench', { 'Stone': 6, 'Scrap': 1 }, { place: 'stonewall', repeat: true, skill: ['gathering', 3] });
rc('steelwall', 'Structure', 'Steel Wall', 'anvil', { 'Steel Ingot': 2, 'Metal plate': 2 }, { place: 'steelwall', repeat: true, unlock: 'fort', skill: ['crafting', 7] });
rc('trap', 'Defence', 'Spike Trap', 'workbench', { 'Scrap': 8, 'Wood': 4 }, { place: 'trap', repeat: true, skill: ['combat', 3] });
rc('turret', 'Defence', 'Scrap Turret', 'forge', { 'Metal plate': 6, 'Scrap': 14, 'Stone': 4 }, { place: 'turret', unlock: 'fort', skill: ['combat', 6] });
rc('rug', 'Decor', 'Rug', null, { 'Cloth': 4 }, { place: 'rug', repeat: true, skill: ['crafting', 2] });
rc('table', 'Decor', 'Table', null, { 'Wood': 8 }, { place: 'table', skill: ['crafting', 2] });
rc('chair', 'Decor', 'Chair', null, { 'Wood': 5 }, { place: 'chair', repeat: true, skill: ['crafting', 2] });
rc('bookshelf', 'Decor', 'Bookshelf', 'workbench', { 'Wood': 12, 'Cloth': 3 }, { place: 'bookshelf', skill: ['crafting', 4] });
rc('banner', 'Decor', 'Banner', 'workbench', { 'Cloth': 6, 'Wood': 3 }, { place: 'banner', skill: ['crafting', 4] });
rc('pot', 'Decor', 'Potted Plant', null, { 'Scrap': 3, 'Sapling': 1 }, { place: 'pot', repeat: true, skill: ['crafting', 2] });
rc('rod', 'Tools', 'Fishing Rod', 'workbench', { 'Wood': 3, 'Scrap': 2, 'Cloth': 1 }, { gives: { 'Fishing Rod': 1 } });
rc('steel_axe', 'Tools', 'Steel Axe', 'anvil', { 'Steel Ingot': 3, 'Wood': 3 }, { gives: { 'Steel Axe': 1 }, unlock: 'steel', skill: ['crafting', 7] });
rc('steel_pick', 'Tools', 'Steel Pickaxe', 'anvil', { 'Steel Ingot': 3, 'Wood': 3 }, { gives: { 'Steel Pickaxe': 1 }, unlock: 'steel', skill: ['crafting', 7] });
rc('steel_cleaver', 'Weapons', 'Steel Cleaver', 'anvil', { 'Steel Ingot': 5, 'Wood': 2 }, { gives: { 'Steel Cleaver': 1 }, unlock: 'steel', skill: ['crafting', 7] });
rc('rifle', 'Weapons', 'Hunting Rifle', 'anvil', { 'Steel Ingot': 5, 'Metal plate': 4, 'Wood': 3 }, { gives: { 'Hunting Rifle': 1 }, unlock: 'firearms', skill: ['combat', 7] });
rc('steel_helm', 'Armour', 'Steel Helm', 'anvil', { 'Steel Ingot': 4 }, { gives: { 'Steel Helm': 1 }, unlock: 'steel', skill: ['crafting', 7] });
rc('steel_plate', 'Armour', 'Steel Plate', 'anvil', { 'Steel Ingot': 8, 'Cloth': 2 }, { gives: { 'Steel Plate': 1 }, unlock: 'steel', skill: ['crafting', 7] });
rc('steel_greaves', 'Armour', 'Steel Greaves', 'anvil', { 'Steel Ingot': 6 }, { gives: { 'Steel Greaves': 1 }, unlock: 'steel', skill: ['crafting', 7] });
rc('steel_boots', 'Armour', 'Steel Boots', 'anvil', { 'Steel Ingot': 4 }, { gives: { 'Steel Boots': 1 }, unlock: 'steel', skill: ['crafting', 7] });
rc('ingot', 'Supplies', 'Steel Ingot', 'forge', { 'Iron ore': 3, 'Scrap': 2 }, { gives: { 'Steel Ingot': 1 }, unlock: 'steel', skill: ['crafting', 6] });
rc('medkit', 'Supplies', 'Medkit', 'clinic', { 'Cloth': 4, 'Rad tabs': 1, 'Bandage': 2 }, { gives: { 'Medkit': 1 }, skill: ['crafting', 5] });
rc('cook_fish', 'Cooking', 'Cooked Fish', 'campfire', { 'Raw Fish': 1 }, { gives: { 'Cooked Fish': 1 } });
rc('cook_glow', 'Cooking', 'Cooked Glowfish', 'campfire', { 'Glowfish': 1 }, { gives: { 'Cooked Glowfish': 1 } });
rc('cook_potato', 'Cooking', 'Baked Potato', 'campfire', { 'Potato': 1 }, { gives: { 'Baked Potato': 1 } });
rc('cook_mash', 'Cooking', 'Berry Mash', 'campfire', { 'Berries': 4 }, { gives: { 'Berry Mash': 1 } });
rc('cook_veg', 'Cooking', 'Veg Stew', 'stove', { 'Potato': 1, 'Radish': 1, 'Tomato': 1 }, { gives: { 'Veg Stew': 1 } });
rc('cook_fishstew', 'Cooking', 'Fish Stew', 'stove', { 'Raw Fish': 2, 'Potato': 1, 'Tomato': 1 }, { gives: { 'Fish Stew': 1 } });
rc('cook_soup', 'Cooking', 'Tomato Soup', 'stove', { 'Tomato': 2, 'Purified Water': 1 }, { gives: { 'Tomato Soup': 1, 'Empty Bottle': 1 } });
const TIER_NAMES = ['Scavenger', 'Forge Age', 'Settlement', 'Industry'];
const TIER_LISTS = {
  1: ['bedroll', 'workbench', 'barricade', 'wall', 'bunk', 'chest', 'lamp', 'floor_wood', 'roof_wood', 'campfire', 'scrap_axe', 'scrap_pick', 'hoe', 'can', 'rod', 'machete', 'scrap_helm', 'scrap_vest', 'scrap_greaves', 'scrap_boots', 'bracer', 'bandage', 'bottles', 'cook_fish', 'cook_glow', 'cook_potato', 'cook_mash'],
  2: ['forge', 'scrapwall', 'gate', 'floor_stone', 'roof_scrap', 'guardpost', 'purifier', 'plate', 'iron_axe', 'iron_pick', 'cleaver', 'pistol', 'rounds', 'iron_helm', 'iron_plate', 'iron_greaves', 'iron_boots', 'lead_pendant', 'haz_hood', 'haz_suit', 'haz_pants', 'rubber_boots', 'radtabs', 'stove', 'stonewall', 'trap', 'rug', 'table', 'chair', 'pot'],
  3: ['clinic', 'anvil', 'turret', 'bookshelf', 'banner', 'medkit', 'ingot', 'cook_veg', 'cook_fishstew', 'cook_soup'],
  4: ['steelwall', 'steel_axe', 'steel_pick', 'steel_cleaver', 'rifle', 'steel_helm', 'steel_plate', 'steel_greaves', 'steel_boots']
};
for (const t of Object.keys(TIER_LISTS)) for (const id of TIER_LISTS[t]) { const r = RECIPES.find(q => q.id === id); if (r) r.tier = Number(t); }
RECIPES.forEach(r => { if (!r.tier) r.tier = 1; });
/* skills open some recipes that used to need a blueprint */
const SKILL_ALT = { forge: ['crafting', 3], ironwork: ['crafting', 4], medicine: ['farming', 3], hazmat: ['crafting', 6], firearms: ['combat', 5] };
RECIPES.forEach(r => { if (r.unlock && !r.skill && SKILL_ALT[r.unlock]) r.skill = SKILL_ALT[r.unlock]; });
const RECIPE_DESC = {
  workbench: 'The first crafting station. Tools, armour and early weapons all start here.', forge: 'Smelts scrap into metal plate and forges iron gear. Glows at night.',
  purifier: 'Must be built right beside water. Fills bottles and watering cans with cleaner water, and gives you a drink with far less radiation.',
  chest: 'Stores 27 stacks. While you are in the valley, anything inside counts when you craft or build. Settlers eat from it.', bunk: 'A bed for one settler. No bed, no recruit. Can be rotated lying vertical.',
  bedroll: 'Your respawn point, and where you sleep. Rebuild it if raiders wreck it. Pick it up with F to move it.', campfire: 'Cooks simple meals: fish, potatoes, berries. Warm light at night.', stove: 'A proper cooking station for stews and soups. Also does everything a campfire does.',
  anvil: 'Needed for steel tools, weapons and armour.', clinic: 'Heals you and settlers standing nearby, and makes medkits.', barricade: 'A cheap decoy that raiders will stop and chew on.',
  wall: 'Connects to its neighbours automatically. Cheap and decent.', scrapwall: 'Sturdier than wood. Corrugated and ugly and fine.', stonewall: 'Heavy stone. Takes a lot of punching.', steelwall: 'The toughest wall you can build.',
  gate: 'You and your settlers walk through. Raiders have to break it. Rotate to face either way.', guardpost: 'A tower where guard settlers stand watch. Lights up at night.', lamp: 'Keeps the dark back. Settlers like a lit camp.',
  trap: 'Spikes that hurt anything stepping on them. Wears out. Walkable.', turret: 'Fires on enemies by itself, using pistol rounds from your chests.', floor_wood: 'Planks underfoot. Click and drag to lay a whole room.',
  floor_stone: 'Stone paving. Click and drag to lay a whole yard.', roof_wood: 'Fades when you are under it. Shelters you from radiation storms.', roof_scrap: 'Metal roofing. Fades when you are under it and shelters from storms.',
  rug: 'Decoration. Makes the camp feel lived in, which makes settlers work a little faster.', table: 'Decoration for now.', chair: 'Rotate to face any direction.', bookshelf: 'Decoration that really lifts the mood.',
  banner: 'A flag for your camp.', pot: 'Uses a sapling. A little green indoors.', rod: 'Cast at water, click when the line twitches.', ingot: 'Iron ore and scrap, smelted into steel.', medkit: 'Heals 70 health in one go.'
};
{ const o = rc; }

/* ---------- Recipe status, stations and crafting, now with skills and tiers ---------- */
const STATION_ALIAS = { campfire: ['campfire', 'stove'] };
function stationNear(type) {
  const p = state.player, types = STATION_ALIAS[type] || [type];
  for (const [si, st] of structs) {
    if (!types.includes(st.type)) continue;
    const dx = ((si % W) + 0.5) * TS - p.x, dy = (Math.floor(si / W) + 0.5) * TS - p.y;
    if (Math.hypot(dx, dy) <= CONFIG.player.craftRange) return true;
  }
  return false;
}
function recipeUnlocked(r) { if (!r.unlock && !r.skill) return true; return !!((r.unlock && state.unlocked.has(r.unlock)) || (r.skill && skillLevel(r.skill[0]) >= r.skill[1])); }
function unlockText(r) {
  const a = r.unlock ? BLUEPRINTS[r.unlock] : null, b = r.skill ? SKILLS[r.skill[0]].name : null;
  return (a ? 'the ' + a + ' blueprint' : '') + (a && b ? ' or ' : '') + (b ? b + ' level ' + r.skill[1] : '');
}
function recipeStatus(r) {
  if (!recipeUnlocked(r)) return { ok: false, why: 'Needs ' + unlockText(r) };
  if (r.station && !stationNear(r.station)) return { ok: false, why: 'Needs a ' + STATION_NAMES[r.station] + ' nearby' };
  if (!canAfford(r.cost)) return { ok: false, why: 'Missing materials' };
  return { ok: true, why: 'Ready' };
}
function tryCraft(r) {
  const st = recipeStatus(r);
  if (!st.ok) { toast(st.why + '.', 2); return; }
  if (r.place) {
    state.placing = r.id; state.craftOpen = false; state.menuClosedForPlacing = true; state.placeRot = 0;
    toast('Click to place the ' + r.name + '. R rotates, right-click or Esc cancels.', 5);
    return;
  }
  for (const k of Object.keys(r.gives)) if (!spaceFor(k, r.gives[k])) { toast('Bag full.', 2); return; }
  takeItems(r.cost);
  let bonus = false;
  for (const k of Object.keys(r.gives)) {
    let q = r.gives[k];
    if (r.cat === 'Cooking' && k !== 'Empty Bottle' && Math.random() < 0.08 * (skillLevel('cooking') - 1)) { q += 1; bonus = true; }
    addItem(k, q);
  }
  sfx('craft');
  skillXp(r.cat === 'Cooking' ? 'cooking' : 'crafting', 2 + 2 * (r.tier || 1));
  questEvent('crafted:' + r.id); if (r.cat === 'Cooking') questEvent('cooked');
  state.floats.push({ x: state.player.x, y: state.player.y - 14, text: 'Crafted ' + r.name + (bonus ? ' (extra serving!)' : ''), color: '#7fff7f', life: 1.4 });
}

/* ---------- Structures can be picked up and moved (F), not just destroyed ---------- */
function placingRecipe() {
  if (state.moving) return { id: '__move', name: STATION_NAMES[state.moving.st.type], place: state.moving.st.type, cost: {}, repeat: false };
  return RECIPES.find(q => q.id === state.placing);
}
function tryMove() {
  const tx = Math.floor(state.mwx / TS), ty = Math.floor(state.mwy / TS), i = ty * W + tx, p = state.player;
  const st = structs.get(i);
  if (!st) { toast('Hover a structure within reach and press F to pick it up and move it.', 2.5); return; }
  if (Math.hypot((tx + 0.5) * TS - p.x, (ty + 0.5) * TS - p.y) > 80) { toast('Too far away.', 1.5); return; }
  if (st.type === 'bunk' || st.type === 'chest') { /* keep contents and owners */ }
  structs.delete(i);
  state.moving = { st, from: i };
  state.placing = '__move'; state.placeRot = st.rot || 0; state.closeForMove = true;
  closeMenusOnly();
  toast('Moving ' + STATION_NAMES[st.type] + '. Click to put it down, R rotates, Esc puts it back.', 4);
}
function cancelPlacing() {
  if (state.moving) {
    const m = state.moving, i = m.from;
    if (!structs.has(i)) structs.set(i, m.st); else state.drops.push({ x: ((i % W) + 0.5) * TS, y: (Math.floor(i / W) + 0.5) * TS, name: 'Scrap', qty: 2, t: 0 });
    state.moving = null;
  }
  state.placing = null;
}
function closeMenusOnly() { state.invOpen = false; state.craftOpen = false; state.mapOpen = false; state.settlersOpen = false; state.progressOpen = false; state.journalOpen = false; state.settingsOpen = false; state.pauseOpen = false; state.chestOpen = null; state.talk = null; state.trade = null; }

