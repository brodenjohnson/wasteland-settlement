import json
ev = lambda s: pg.evaluate(s)
def slot(name): return ev("__g.state.player.inventory.findIndex(s=>s&&s.name==='%s')" % name)
def tile_screen(tx, ty):
    p = json.loads(ev('JSON.stringify({x:__g.state.player.x,y:__g.state.player.y})'))
    return 550 + ((tx + 0.5) * 16 - p['x']) * 3, 350 + ((ty + 0.5) * 16 - p['y']) * 3
def hold(x, y, ms):
    pg.mouse.move(x, y); pg.wait_for_timeout(60); pg.mouse.down(); pg.wait_for_timeout(ms); pg.mouse.up(); pg.wait_for_timeout(80)
pg.keyboard.press('h')   # gear kit
pg.wait_for_timeout(100)
for n in ['Hoe', 'Watering Can', 'Radish Seeds', 'Rusty Pipe', 'Pipe Pistol', 'Raider Helmet']:
    print(n, 'slot', slot(n))
# --- farming ---
tx, ty = 28, 31
x, y = tile_screen(tx, ty)
pg.keyboard.press(str(slot('Hoe') + 1)); hold(x, y, 200)
print('tilled:', ev('__g.tilled[%d]' % (ty * 60 + tx)))
pg.keyboard.press(str(slot('Radish Seeds') + 1)); hold(x, y, 120)
print('crops:', ev('__g.crops.size'))
pg.keyboard.press(str(slot('Watering Can') + 1)); hold(x, y, 150)
print('wet:', ev('__g.wet[%d]' % (ty * 60 + tx)), 'can water', ev("__g.state.player.inventory.find(s=>s&&s.name==='Watering Can').water"))
ev('__g.state.gameMinutes = 24*60 - 0.5'); pg.wait_for_timeout(400)
print('crop age after midnight:', ev('JSON.stringify([...__g.crops.values()])'))
ev('[...__g.crops.values()][0].age = 3'); pg.wait_for_timeout(100)
pg.screenshot(path='out/farm.png')
pg.keyboard.press(str(slot('Rusty Pipe') + 1)); hold(x, y, 120)
print('after harvest crops:', ev('__g.crops.size'), 'radish:', ev("(__g.state.player.inventory.find(s=>s&&s.name==='Radish')||{}).qty"))
# --- equip armour via right click ---
pg.keyboard.press(str(slot('Raider Helmet') + 1)); pg.mouse.click(550, 200, button='right'); pg.wait_for_timeout(120)
print('equip:', ev('JSON.stringify(__g.state.player.equip)'))
# --- melee combat ---
p = json.loads(ev('JSON.stringify({x:__g.state.player.x,y:__g.state.player.y})'))
ev('__g.spawnEnemy("glowrat", %f, %f)' % (p['x'] + 26, p['y']))
ex, ey = 550 + 26*3, 350 + 0
pg.keyboard.press(str(slot('Rusty Pipe') + 1)); hold(ex, ey, 1600)
print('enemies after melee:', ev('__g.enemies.length'), 'drops', ev('__g.state.drops.length'), 'xp', ev('__g.state.player.xp'), 'hp', ev('Math.round(__g.state.player.health)'))
# --- pistol ---
ev('__g.spawnEnemy("hound", %f, %f)' % (p['x'] - 70, p['y']))
pg.keyboard.press(str(slot('Pipe Pistol') + 1)); hold(550 - 70*3, 350, 1500)
print('enemies after pistol:', ev('__g.enemies.length'), 'rounds', ev("__g.state.player.inventory.filter(s=>s&&s.name==='Pistol rounds').reduce((a,s)=>a+s.qty,0)"))
pg.screenshot(path='out/combat.png')
