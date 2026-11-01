import re, sys
src = open('game.js').read()
P = lambda n: open('parts/' + n).read()

def span(src, name):
    m = re.search(r'^function %s\(' % re.escape(name), src, re.M)
    if not m: raise Exception('missing function ' + name)
    i = src.index('{', src.index(')', m.start()))
    depth = 0; j = i
    while True:
        ch = src[j]
        if ch == '{': depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0: break
        j += 1
    end = j + 1
    while end < len(src) and src[end] == '\n': end += 1
    return m.start(), end

def remove_func(name):
    global src
    a, b = span(src, name); src = src[:a] + src[b:]

def replace_func(name, new):
    global src
    a, b = span(src, name); src = src[:a] + new.strip() + '\n\n' + src[b:]

def remove_const_array(name):
    global src
    m = re.search(r'^const %s = \[' % name, src, re.M)
    if not m: raise Exception('missing const ' + name)
    end = src.index('\n];', m.start()) + 3
    while end < len(src) and src[end] == '\n': end += 1
    src = src[:m.start()] + src[end:]

def sub1(old, new, count=1):
    global src
    if src.count(old) < 1: raise Exception('not found: ' + old[:70])
    src = src.replace(old, new, count)

# 1. rename the tile-variant array so the new shade() colour helper can exist
src = re.sub(r'\bshade\[', 'shade_[', src)
sub1('const shade = new Uint8Array', 'const shade_ = new Uint8Array')

# 2. old data that is replaced by the new tables
for n in ['RECIPES', 'CRATE_LOOT', 'HOT_LOOT']: remove_const_array(n)
sub1('const tiles = new Uint8Array(W * H);', P('a_data.js') + 'const tiles = new Uint8Array(W * H);')

# 3. state + input block
a = src.index('const state = {')
w = src.index("window.addEventListener('wheel'", a)
b = src.index('}, { passive: true });', w) + len('}, { passive: true });')
newstate = P('b_state_input.js')
newstate = newstate.replace("  if (state.placing) { tryPlace(); return; }\n  mouse.down = true;",
  "  if (e.button === 0) { const hb = hotbarHit(e.clientX, e.clientY); if (hb >= 0) { state.sel = hb; return; } }\n  if (state.placing) { tryPlace(); return; }\n  mouse.down = true;")
src = src[:a] + newstate.strip() + src[b:]

# 4. remove or replace old functions
for n in ['toolTier', 'addTestScrap', 'unlockAllTest', 'die', 'getTarget', 'burst', 'updateHarvest', 'updatePlayer', 'updateTime',
          'drawTile', 'drawObject', 'drawBaseMarker', 'drawPlayer', 'drawLighting', 'bar', 'drawHUD', 'drawInventory',
          'drawStruct', 'useItem', 'uiClick', 'drawCrafting', 'render']:
    remove_func(n)

# 5. patches to kept functions
sub1("state.radRate = base > 0 ? base * (1 - S.radProtection) : base;", "state.radRate = base > 0 ? base * (1 - armourStats().rad) : base;")
sub1("Math.min(100, p.health + S.regenPerSec * dt)", "Math.min(maxHealth(), p.health + S.regenPerSec * dt)")
sub1("* state.timeMult / 60;", "* effMult() / 60;")
sub1("state.swingCd = 0.6;", "state.actCd = 0.6;")
sub1("structs.set(ty * W + tx, { type: r.place });", "structs.set(ty * W + tx, { type: r.place, hp: STRUCT_HP[r.place] });")

# 6. new modules before the main loop
art = P('c_art.js')
art = art.replace("function drawIcon(name, x, y, s) {", "function drawIcon(name, x, y, s, item) {")
art = art.replace("{ const s2 = selItemFor(name); if (s2 && s2.water > 0) q('#4aa3c8', 4, 8, 7, 2); } break;", "if (item && item.water > 0) q('#4aa3c8', 4, 8, 7, 2); break;")
art = art.replace("drawIcon(sel.name, Math.round(hx), Math.round(hy), 11);", "drawIcon(sel.name, Math.round(hx), Math.round(hy), 11, sel);")
marker = 'let last = performance.now();'
src = src.replace(marker, P('b_systems.js') + art + '\n' + P('d_render.js') + '\n' + marker)

marker_end = 'let last = performance.now();'

# ---- art/HUD pass 2 ----
for n in ['makeSprite', 'shadowAt', 'buildGround', 'paintTree', 'paintRock', 'paintPlayer', 'drawObject', 'drawBaseMarker', 'panel', 'bar', 'drawHUD', 'drawProjs', 'render']:
    remove_func(n)
sub1("const O = { NONE: 0, TREE: 1, SCRAP: 2, ROCK: 3, ORE: 4, CRATE: 5, BUSH: 6 };", "const O = { NONE: 0, TREE: 1, SCRAP: 2, ROCK: 3, ORE: 4, CRATE: 5, BUSH: 6, PINE: 7 };")
sub1("'Supply crate', 'Berry bush'];", "'Supply crate', 'Berry bush', 'Pine tree'];")
sub1("color: '#c0392b' }\n};", "color: '#c0392b' },\n  [O.PINE]:  { name: 'Pine tree', item: 'Wood', tool: 'axe', minTier: 0, hp: 110, yield: [4, 6], color: '#3f6e2e' }\n};")
sub1("{ objs[i] = O.BUSH; n++; }\n    }\n  }", "{ objs[i] = O.BUSH; n++; }\n    }\n  }\n  for (const z of GREEN_ZONES) {\n    let n = 0, t = 0;\n    while (n < 11 && t < 600) {\n      t++;\n      const ang = rng() * 6.283, rad = z.r * (0.45 + rng() * 0.75);\n      const x = Math.round(z.x + Math.cos(ang) * rad), y = Math.round(z.y + Math.sin(ang) * rad);\n      if (x < 1 || y < 1 || x >= W - 1 || y >= H - 1) continue;\n      const i = y * W + x;\n      if (tiles[i] === T.GRASS && !objs[i] && Math.hypot(x - z.x, y - z.y) > 2.2) { objs[i] = O.PINE; n++; }\n    }\n  }")
sub1("'#e29a55', '#d6a84a', '#4f8a3a'];", "'#e29a55', '#d6a84a', '#4f8a3a', '#2f6a3a'];")
sub1("const MONO = 'ui-monospace, Menlo, Consolas, monospace';", "const MONO = '\"Pixelify Sans\", ui-monospace, Menlo, Consolas, monospace';")
src = src.replace(marker_end, P('e_art2.js') + P('f_hud2.js') + marker_end, 1)

# ---- pass 3: big world, bigger characters, item stats ----
def remove_const_obj(name):
    global src
    m = re.search(r'^const %s = \{' % name, src, re.M)
    if not m: raise Exception('missing const obj ' + name)
    i = src.index('{', m.start()); depth = 0; j = i
    while True:
        if src[j] == '{': depth += 1
        elif src[j] == '}':
            depth -= 1
            if depth == 0: break
        j += 1
    end = j + 1
    while end < len(src) and src[end] in ';\n': end += 1
    src = src[:m.start()] + src[end:]

for n in ['generate', 'computeRadiation', 'buildMinimap', 'makeSpawns', 'updateEnemies', 'spawnEnemy', 'updateSpawns', 'startRaid', 'addItem', 'putItem', 'invSlotClick',
          'buildGround', 'paintTree', 'paintPine', 'paintPlayer', 'drawPlayer', 'armourLook', 'drawEnemy', 'makeDecor', 'drawDecor', 'drawGroundOverlay',
          'drawHotbar', 'drawInventory', 'itemInfo', 'drawPortrait', 'drawHUD', 'render', 'paintHuman', 'paintGlowrat', 'paintHound']:
    remove_func(n)
remove_const_obj('ENEMY_SPR')
for n in ['CRATE_LOOT', 'HOT_LOOT', 'GREEN_ZONES', 'HOT_SPOTS']: remove_const_array(n)

a_, b_ = span(src, 'drawIcon')
body = src[a_:b_]
body = body.replace("q(shade(col, -20), 9, 10, 4, 4);\n  }\n}", "q(shade(col, -20), 9, 10, 4, 4);\n  }\n  const tr = typeof ITEM_TIER !== 'undefined' ? ITEM_TIER[name] : undefined;\n  if (tr >= 2) { q('#ffffff', 2, 2, 1, 1); q('#dff0ff', 3, 2, 1, 1); q('#dff0ff', 2, 3, 1, 1); } else if (tr === 1) { q('#a8532a', 12, 12, 2, 1); q('#7a3a1a', 13, 13, 1, 1); }\n}")
body = body.replace('function drawIcon(name, x, y, s, item) {', 'function iconTo(g, name, x, y, s, item) {').replace('ctx.', 'g.')
body += 'function drawIcon(name, x, y, s, item) { iconTo(ctx, name, x, y, s, item); }\n\n'
src = src[:a_] + body + src[b_:]

sub1("const T = { GROUND: 0, DIRT: 1, WATER: 2, RUBBLE: 3, ROAD: 4, GRASS: 5, SPRING: 6 };", "const T = { GROUND: 0, DIRT: 1, WATER: 2, RUBBLE: 3, ROAD: 4, GRASS: 5, SPRING: 6, CLIFF: 7, FLOOR: 8, ASH: 9 };")
sub1("PINE: 7 };", "PINE: 7, REDWOOD: 8 };")
sub1("'Regrowth', 'Clean spring'];", "'Regrowth', 'Clean spring', 'Cliff', 'Ruined floor', 'Ash'];")
sub1("'Berry bush', 'Pine tree'];", "'Berry bush', 'Pine tree', 'Redwood'];")
sub1("color: '#3f6e2e' }\n};", "color: '#3f6e2e' },\n  [O.REDWOOD]: { name: 'Redwood', item: 'Wood', tool: 'axe', minTier: 1, hp: 240, yield: [8, 12], color: '#7a4a2e' }\n};")
sub1("|| t === T.RUBBLE || objs[i] !== O.NONE || structs.has(i);", "|| t === T.RUBBLE || t === T.CLIFF || objs[i] !== O.NONE || structs.has(i);")
sub1("t === T.SPRING || t === T.RUBBLE || objs[i] || structs.has(i)) return false;", "t === T.SPRING || t === T.RUBBLE || t === T.CLIFF || objs[i] || structs.has(i)) return false;")
sub1("mapW: 60,\n  mapH: 60,", "mapW: 128,\n  mapH: 128,")
sub1("zoom: 3,", "zoom: 4,")
sub1("baseZoneRadius: 10,", "baseZoneRadius: 22,")
sub1("const BASE = { x: 30, y: 30 };", "const BASE = { x: 28, y: 98 };")
sub1("CONFIG.inventory.slots = 27;", "CONFIG.inventory.slots = 36;")
sub1("[2, 3, 4, 5]", "[3, 4, 5, 6]")
sub1("sleeping: false, lastDay: 1, raid: null,", "sleeping: false, lastDay: 1, raid: null, zone: 1, banner: null, zDark: 0, threat: 0, threatLimit: 40, ambushWarn: 0, shakeT: 0, lastJumpMsg: -10, mapOpen: false,")
sub1("if (k === 'c') togglePanel('craft');", "if (k === 'c') togglePanel('craft');\n  if (k === 'm') { const o = !state.mapOpen; closePanels(); state.mapOpen = o; }")
sub1("state.invOpen = false; state.craftOpen = false; state.placing = null;\n}\nfunction togglePanel", "state.invOpen = false; state.craftOpen = false; state.placing = null; state.mapOpen = false;\n}\nfunction togglePanel")
src = src.replace(marker_end, P('g_world.js') + P('g_sys2.js') + P('h_art3a.js') + P('h_art3b.js') + P('i_ui3.js') + marker_end, 1)

exec(open('pass4.py').read())
exec(open('pass5.py').read())
exec(open('pass6.py').read())
exec(open('pass7.py').read())
exec(open('pass8.py').read())
exec(open('pass9.py').read())
exec(open('pass10.py').read())
exec(open('pass11.py').read())
exec(open('pass12.py').read())
exec(open('pass13.py').read())
exec(open('pass14.py').read())
exec(open('pass15.py').read())
exec(open('pass16.py').read())
exec(open('pass17.py').read())
exec(open('pass18.py').read())
exec(open('pass19.py').read())
exec(open('pass20.py').read())

# 7. main loop and init
a = src.index('function frame(now) {')
src = src[:a] + '''function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const paused = state.title || (anyMenuOpen() && settings.pauseInMenus);
  if (paused) { mouse.down = false; }
  else {
    updateTime(dt);
    updatePlayer(dt);
    updateActions(dt);
    updateEnemies(dt);
    updateSettlers(dt);
    updateSurvivors(dt);
    updateProjs(dt);
    updateSpawns();
    updateRaids();
    updateEffects(dt);
    updateSurvival(dt);
    updateZone(dt);
    updateStorm(dt);
    updateAudio(dt);
    updateRoofFade(dt);
    updatePlaceDrag();
    updateFishing(dt);
    updateStructures(dt);
    updateEncounters(dt);
    updateDowned();
    state.qT = (state.qT || 0) + dt;
    if (state.qT > 0.6) { state.qT = 0; questTick(); }
  }
  if (state.msgT > 0) state.msgT -= dt;
  render();
  requestAnimationFrame(frame);
}

generate();
buildGround();
buildMinimap();
makeSpawns();
makeSurvivors();
initBase();
makeDecor();
resize();
if (document.fonts && document.fonts.load) document.fonts.load('12px "Pixelify Sans"');
addItem('Rusty Pipe', 1);
addItem('Radish Seeds', 6);
window.__initMs = performance.now();
window.__g = { ...DBG, settlerStatus, moveMult, movePlayer, collides, craftKit, sinkConnected, KIT_BY_NAME, DOCS, SITE_DEFS, sitePos, MUS, carryTotal, pipeMask, render, drawHUD, updateEnemies, updateStructures, updateSettlers, updateAudio, updateStorm, ctx, spawn, tryCraft, RECIPES, recipeStatus, jobLevel, settlerXp, hurtSettler, maybeEncounter, genStock, buyItem, sellItem, questTick, serialize, hasSave, structCount, skillLevel, updateStructures, updateDowned, itemValue, settings, saveGame, loadGame, QUEST_DEFS, encNpcs, spawnEncounter, openTrade, skillXp, tryMove, anyMenuOpen, newStruct, openMenu, recipeUnlocked, floors, roofs, saplings, plantSapling, saplingOk, stormAftermath, AUD, sfx, fillBottle, placeValid, countItem, takeItems, chestCount, drawLowHealth, solidAt, findPath, tryPlace, settlers, survivors, recruit, freeBed, claimed, deconstruct, state, enemies, crops, structs, tilled, wet, objs, tiles, radMap, CONFIG, startRaid, spawnEnemy, die, addItem, putItem, clockHour, clockDay, trySleep, damageEnemy, hurtPlayer, tileActions };
toast('You wake in an open valley with a spring and trees. Put your bedroll down somewhere you can live with. M opens the map.', 8);
requestAnimationFrame(frame);
})();
'''

sub1("reach: 28, craftRange: 56", "reach: 34, craftRange: 80")
sub1("CONFIG.player.reach + 8) { tooFar(); return; }", "CONFIG.player.reach + 6) { tooFar(); return; }")

sub1("if (h >= 6 && h < 12) wakeUp();", "if (h >= 6 && h < 20) wakeUp();")
import re as _re2
src = _re2.sub(r"(\w+)\.name === 'Watering Can'", r"isCanName(\1.name)", src)
RENAMES = [('Scrap Axe','Rusty Hatchet'),('Scrap Pickaxe','Rusty Pick'),('Iron Axe','Woodcutter Axe'),('Iron Pickaxe','Miners Pick'),('Steel Axe','Chopper'),('Steel Pickaxe','Drill Pick'),
 ('Scrap Machete','Machete'),('Iron Cleaver','Combat Cleaver'),('Steel Cleaver','Chain Cleaver'),('Scrap Pistol','Pipe Pistol'),('Scrap SMG','Rattler SMG'),('Spiked Bat','Nail Board'),
 ('Scrap Helmet','Raider Helmet'),('Scrap Vest','Raider Vest'),('Scrap Greaves','Raider Leggings'),('Scrap Boots','Raider Boots'),
 ('Iron Helm','Metal Helmet'),('Iron Plate','Metal Armour'),('Iron Greaves','Metal Leg Guards'),('Iron Boots','Metal Boots'),
 ('Steel Helm','Combat Helmet'),('Steel Plate','Combat Armour'),('Steel Greaves','Combat Leg Guards'),('Steel Boots','Combat Boots'),
 ('Padded Cap','Patchwork Cap'),('Padded Jacket','Patchwork Jacket'),('Padded Trousers','Patchwork Trousers'),('Padded Shoes','Patchwork Shoes')]
for _a, _b in RENAMES: src = src.replace(_a, _b)
src = src.replace("replace(/^Steel /, 'Iron ')", "replace(/^Combat /, 'Metal ')")
src = src.replace("  if (state.corpse && state.corpse.items.length)", "  if (state.corpse && state.corpse.items.length)")
open('game_new.js', 'w').write(src)
print('lines', len(src.splitlines()))
