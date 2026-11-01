/* =====================================================================
   AP_WIKI: hands the game's data tables to wiki.py, which builds the player
   wiki from them, so the wiki's numbers always match the build. Nothing in
   the game calls this.
   ===================================================================== */
function wikiData() {
  const plain = v => JSON.parse(JSON.stringify(v, (k, x) => x instanceof Set ? [...x] : x instanceof Map ? Object.fromEntries(x) : typeof x === 'function' ? undefined : x));
  const T = { CONFIG, RES, ITEM_USE, TOOL_ITEMS, STATION_NAMES, BLUEPRINTS, BP_ITEMS, WEAPONS, ARMOUR, SLOT_NAMES, CROPS, ITEM_DESC, ENEMY_TYPES, DROPS, STRUCT_HP, CRAFT_TABS, RECIPES,
    ZONE_NAMES, SPAWN_DEFS, TIER_NAME, ITEM_TIER, JOBS, SURVIVOR_DEFS, SKILL_ORDER, VALUE, TIER_NAMES, RECIPE_DESC, QUEST_DEFS, DIFFS, CREATURE_LORE, PLACE_LORE, STORY_ITEMS,
    BUFFS, FOOD_BUFFS, SL_NAMES, SL_REQ, RAID_KINDS, BIO2, SURV_QUESTS, CAMP_RADII, LVL_OFF, DUNGEONS, FARM_PRODUCE, COOKED, ANIMALS, ROSTER, SETS, MISSIONS, HB, SKULL_FOES,
    SKILLS: Object.fromEntries(Object.entries(SKILLS).map(([k, s]) => [k, { name: s.name, blurb: s.blurb, perks: [1, 2, 4, 6, 8, 10].map(l => [l, s.perk ? s.perk(l) : '']) }])),
    MAPDEFS: Object.fromEntries(Object.entries(MAPDEFS).map(([k, m]) => [k, { id: m.id, name: m.name, theme: m.theme, zone: m.zone, rad: m.rad, mobs: m.mobs, boss: m.boss }])) };
  const out = {}; for (const k in T) out[k] = plain(T[k]);
  const names = new Set([...Object.keys(VALUE), ...Object.keys(BP_ITEMS), ...Object.keys(ITEM_DESC), ...Object.keys(WEAPONS), ...Object.keys(ARMOUR)]);
  for (const r of RECIPES) for (const n in (r.gives || {})) names.add(n);
  out.VALUES = {}; out.HULL_PRICE = {};
  for (const n of names) { out.VALUES[n] = itemValue(n); out.HULL_PRICE[n] = Math.max(2, Math.ceil(itemValue(n) * 1.6 * (BP_ITEMS[n] ? 2.2 : 1))); }
  // every item a vendor can stock, and the lowest Hull reputation that unlocks it
  out.VENDOR_STOCK = {};
  for (const k in VENDORS) {
    const seen = {};
    for (const rep of [-5, 0, 1, 2, 3, 4, 5, 10]) for (let s = 1; s <= 40; s++) { const rs = mulb(s * 7919 + rep); for (const [n] of VENDORS[k].list(rs, rep)) if (seen[n] === undefined || rep < seen[n]) seen[n] = rep; }
    out.VENDOR_STOCK[k] = seen;
  }
  return out;
}
{ const o = drawTitle; drawTitle = function (w, h) {
  o(w, h);
  if (settings.cwSeen && !state.creating && !state.settingsOpen && !state.charsOpen) button(w - 150, h - 46, 130, 28, 'Player wiki', () => window.open('wiki/index.html', '_blank'));
}; }
Object.assign(DBG, { wikiData, stockFor });
