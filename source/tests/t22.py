import json, time
ev = lambda s: pg.evaluate(s)
BX, BY = 28, 98
ev('__g.enemies.length = 0; __g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 })')
ev('__g.structs.set(%d*128+%d, {type:"workbench", hp:120}); __g.structs.set(%d*128+%d, {type:"barricade", hp:90})' % (BY, BX+4, BY+2, BX+5))
for tryn in range(3):
    ev('__g.state.raid = null; __g.enemies.length = 0; __g.startRaid(2)')
    n = ev('__g.enemies.filter(e=>e.raid).length')
    d0 = ev('Math.round(Math.min(...__g.enemies.filter(e=>e.raid).map(e=>Math.hypot(e.x-%d*16, e.y-%d*16)/16)))' % (BX, BY))
    print('raid try', tryn, 'raiders', n, 'closest start (tiles):', d0, ev('__g.state.raid.dirName'))
# stand far away so they go for structures, and move the player out of sight
ev('__g.state.player.x = (%d-14)*16; __g.state.player.y = (%d+10)*16' % (BX, BY))
for k in range(14):
    pg.wait_for_timeout(4000)
    ds = json.loads(ev('JSON.stringify(__g.enemies.filter(e=>e.raid).map(e=>Math.round(Math.hypot(e.x-%d*16, e.y-%d*16)/16)))' % (BX, BY)))
    st = ev('[...__g.structs.values()].map(s=>s.type+":"+Math.round(s.hp)).join(",")')
    print('t+%ds dist: %s | %s' % ((k+1)*4, ds, st))
    if not ds or 'workbench' not in st: break
pg.screenshot(path='out/raid3.png')
