import json
ev = lambda s: pg.evaluate(s)
BX, BY = 28, 98
ev('__g.enemies.length = 0; __g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 })')
ev('__g.structs.set(%d*128+%d, {type:"chest", hp:90, slots:new Array(27).fill(null)})' % (BY - 1, BX - 3))
for k in range(3): ev('__g.structs.set(%d*128+%d, {type:"bunk", hp:90, owner:null})' % (BY + 3, BX - 6 + k * 2))
for nm in ['Dex Harlan', 'Sam Oduya', 'Wren Alvarez']: ev('__g.recruit(__g.survivors.find(s=>s.name==="%s"))' % nm)
ev('__g.settlers.forEach((s,k)=>{ s.state="home"; s.x=(%d+k*2)*16; s.y=%d*16; s.job="Hauler" })' % (BX, BY))
ev('__g.state.player.x=%d*16; __g.state.player.y=%d*16' % (BX - 4, BY))
for k in range(40):
    pg.wait_for_timeout(1000)
    if k % 10 == 9: print('t+%ds chest:' % (k + 1), ev('JSON.stringify([...__g.structs.values()].find(s=>s.type==="chest").slots.filter(Boolean).map(s=>s.name+" "+s.qty))'), '| tasks', ev('JSON.stringify(__g.settlers.map(s=>s.task&&s.task.kind))'))
pg.keyboard.press('p'); pg.wait_for_timeout(300); pg.screenshot(path='out/settlers_panel.png'); pg.keyboard.press('Escape')
# open the chest through the real click path
ch = ev('[...__g.structs.entries()].find(([i,s])=>s.type==="chest")[0]')
ev('__g.state.player.x=(%d+0.5)*16+14; __g.state.player.y=(%d+0.5)*16+14' % (ch % 128, ch // 128))
pg.wait_for_timeout(200)
p = json.loads(ev('JSON.stringify({x:__g.state.player.x,y:__g.state.player.y})'))
x, y = 550 + (((ch % 128) + 0.5) * 16 - p['x']) * 4, 350 + (((ch // 128) + 0.5) * 16 - p['y']) * 4
pg.mouse.move(x, y); pg.wait_for_timeout(100); pg.mouse.down(); pg.wait_for_timeout(100); pg.mouse.up(); pg.wait_for_timeout(300)
print('chest open:', ev('__g.state.chestOpen === %d' % ch), 'inv open:', ev('__g.state.invOpen'))
pg.screenshot(path='out/chest_panel.png')
