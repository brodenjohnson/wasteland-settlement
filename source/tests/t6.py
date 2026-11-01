import json
ev = lambda s: pg.evaluate(s)
pg.keyboard.press('h'); pg.keyboard.press('g'); pg.keyboard.press('u'); pg.wait_for_timeout(100)
# --- inventory UI: open, pick up a slot, drop onto another, right-click equip ---
pg.keyboard.press('i'); pg.wait_for_timeout(250)
rects = json.loads(ev('JSON.stringify(__g.state.uiRects)'))
print('inv rects', len(rects))   # 5 equip + 27 slots
def center(r): return r['x'] + r['w']/2, r['y'] + r['h']/2
slotr = rects[5:]
# left-click slot 0 (pipe) then slot 20 (empty) -> moves pipe to bag
pg.mouse.click(*center(slotr[0])); pg.wait_for_timeout(100)
print('cursor:', ev('JSON.stringify(__g.state.cursor)'))
pg.mouse.click(*center(slotr[20])); pg.wait_for_timeout(100)
print('slot20:', ev('JSON.stringify(__g.state.player.inventory[20])'), 'slot0:', ev('JSON.stringify(__g.state.player.inventory[0])'))
# right-click Raider Vest to equip
vi = ev("__g.state.player.inventory.findIndex(s=>s&&s.name==='Raider Vest')")
pg.mouse.click(*center(slotr[vi]), button='right'); pg.wait_for_timeout(100)
print('equip body:', ev('JSON.stringify(__g.state.player.equip.body)'))
pg.mouse.move(*center(slotr[vi])); pg.wait_for_timeout(150)
pg.screenshot(path='out/inv.png')
pg.keyboard.press('i'); pg.wait_for_timeout(100)
# --- death drops everything incl. equipment, then corpse run restores ---
ev('__g.state.player.x += 120'); ev('__g.die("You died of testing.")'); pg.wait_for_timeout(150)
print('after die inv count:', ev('__g.state.player.inventory.filter(Boolean).length'), 'corpse items:', ev('__g.state.corpse.items.length'), 'equip:', ev('JSON.stringify(__g.state.player.equip)'))
ev('__g.state.player.x = __g.state.corpse.x; __g.state.player.y = __g.state.corpse.y'); pg.wait_for_timeout(200)
print('recovered inv count:', ev('__g.state.player.inventory.filter(Boolean).length'), 'corpse', ev('!!__g.state.corpse'))
# --- raiders wreck structures when the player is not around ---
ev('__g.structs.set(30*60+34, {type:"workbench", hp:120}); __g.structs.set(31*60+35, {type:"barricade", hp:90})')
ev('__g.state.player.x = 5*16; __g.state.player.y = 5*16')   # far corner
ev('__g.state.gameMinutes = 24*60*1 + 19*60 + 5')
pg.wait_for_timeout(500)
ev('__g.enemies.filter(e=>e.raid).forEach(e => { e.x = 36*16; e.y = 30*16; e.home = {x:e.x,y:e.y}; })')
pg.wait_for_timeout(7000)
print('structs:', ev('[...__g.structs.values()].map(s=>s.type+":"+Math.round(s.hp)).join(",")'), 'toast:', ev('__g.state.msg'))
