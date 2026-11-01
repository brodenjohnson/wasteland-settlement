import json
ev = lambda s: pg.evaluate(s)
ev('__g.state.title = false')
ev('__g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 }); __g.enemies.length = 0')
ev('__g.state.player.x = 60*16; __g.state.player.y = 60*16')
pg.wait_for_timeout(300)
ev('__g.addItem("Pipe Pistol",1); __g.addItem("Pistol rounds",30); __g.addItem("Machete",1)')
gi = ev('__g.state.player.inventory.findIndex(s=>s&&s.name==="Pipe Pistol")')
mi = ev('__g.state.player.inventory.findIndex(s=>s&&s.name==="Machete")')
def enemy_screen():
    d = json.loads(ev('JSON.stringify({ex:__g.enemies[0].x, ey:__g.enemies[0].y, px:__g.state.player.x, py:__g.state.player.y, hp:__g.enemies[0].hp})'))
    return 550 + (d['ex'] - d['px']) * 4, 350 + (d['ey'] - d['py']) * 4 - 40, d['hp']
for label, slot, dist in [('pistol at 90px', gi, 90), ('machete at 18px', mi, 18)]:
    pg.keyboard.press(str(slot + 1))
    ev('__g.enemies.length = 0; __g.spawnEnemy("glowrat", __g.state.player.x + %d, __g.state.player.y, {})' % dist)
    pg.wait_for_timeout(150)
    d = json.loads(ev('JSON.stringify({ex:__g.enemies[0].x, ey:__g.enemies[0].y, hp:__g.enemies[0].hp})'))
    hp0 = d['hp']; sx, sy = 550 + dist * 4, 350
    for _ in range(6):
        pg.mouse.move(sx, sy); pg.wait_for_timeout(60)
        m = json.loads(ev('JSON.stringify({x:__g.state.mwx,y:__g.state.mwy})'))
        sx += (d['ex'] - m['x']) * 4; sy += ((d['ey'] - 4) - m['y']) * 4
    print('  aim error px:', round(m['x'] - d['ex'], 1), round(m['y'] - (d['ey'] - 4), 1))
    pg.mouse.move(sx, sy); pg.wait_for_timeout(80); pg.mouse.down(); pg.wait_for_timeout(700); pg.mouse.up(); pg.wait_for_timeout(100)
    alive = ev('__g.enemies.filter(e=>e.hp>0).length')
    print(label, '| start hp', hp0, '| enemies still alive:', alive, '| pistol rounds left:', ev('__g.countItem("Pistol rounds")'))
