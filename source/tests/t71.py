import json
ev = lambda s: pg.evaluate(s)
BX, BY = 28, 98
def shot(n): pg.screenshot(path='out/%s.png' % n)
ev('__g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 }); __g.enemies.length = 0')
ev('__g.state.title = false'); ev('__g.state.qflags.storyInit = true; __g.state.qflags.sitesPlaced = true; __g.state.qflags["read:Folded Note"] = true')
pg.wait_for_timeout(500)
# --- stamina / sprint ---
ev('__g.state.player.x = 40*16; __g.state.player.y = 80*16'); pg.wait_for_timeout(400)
p0 = json.loads(ev('JSON.stringify({x:__g.state.player.x})'))
pg.keyboard.down('d'); pg.wait_for_timeout(800); a = json.loads(ev('JSON.stringify({x:__g.state.player.x})'))['x']
pg.keyboard.down('Shift'); pg.wait_for_timeout(800); bb = json.loads(ev('JSON.stringify({x:__g.state.player.x, st:__g.state.player.stamina, sp:__g.state.sprinting})'))
pg.keyboard.up('Shift'); pg.keyboard.up('d')
print('walk 0.8s moved', round(a - p0['x']), 'px | sprint 0.8s moved', round(bb["x"] - a), 'px | sprinting:', bb["sp"], '| stamina after:', round(bb["st"]))
pg.wait_for_timeout(2500); print('stamina regen after rest:', round(ev('__g.state.player.stamina')))
# --- fatigue ---
ev('__g.state.player.energy = 28'); pg.wait_for_timeout(800); shot('f_tired')
ev('__g.state.player.energy = 0.2'); pg.wait_for_timeout(1500)
print('collapsed:', ev('!!__g.state.faint')); shot('f_faint')
ev('__g.state.faint.t = 0.05'); pg.wait_for_timeout(600)
print('woke from faint, energy:', round(ev('__g.state.player.energy')), '| faint:', ev('!!__g.state.faint'))
# sleeping restores
ev('__g.state.player.energy = 20; __g.state.sleeping = true; __g.state.gameMinutes = 22*60'); pg.wait_for_timeout(3000)
e1 = ev('__g.state.player.energy'); ev('__g.state.sleeping = false')
print('energy after 3s asleep (from 20):', round(e1))
# --- kits ---
ev('__g.state.player.x=(%d+0.5)*16; __g.state.player.y=(%d+0.5)*16' % (BX, BY))
for n, q in [('Wood', 60), ('Scrap', 40), ('Stone', 20)]: ev('__g.addItem("%s", %d)' % (n, q))
ev('__g.structs.set(%d*128+%d, {type:"workbench", hp:120, rot:0})' % (BY, BX + 2))
pg.keyboard.press('c'); pg.wait_for_timeout(300); shot('k_craft')
ev('__g.craftKit(__g.RECIPES.find(r=>r.id==="chest"))')
ev('__g.craftKit(__g.RECIPES.find(r=>r.id==="wall"))'); ev('__g.craftKit(__g.RECIPES.find(r=>r.id==="floor_wood"))')
pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
print('kits in bag:', ev('JSON.stringify(__g.state.player.inventory.filter(s=>s&&/^Kit/.test(s.name)).map(s=>s.name+" x"+s.qty))'))
ki = ev('__g.state.player.inventory.findIndex(s=>s&&s.name==="Kit: Storage Chest")')
print('chest kit slot (hotbar?):', ki)
