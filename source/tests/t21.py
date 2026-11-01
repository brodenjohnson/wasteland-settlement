import json, time
ev = lambda s: pg.evaluate(s)
BX, BY = 28, 98
fps = ev('new Promise(r => { let n = 0; const t0 = performance.now(); (function f(){ n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else r(n / 2); })(); })')
print('fps at home ~', fps)
# ---- ambush in the forest ----
ev('__g.enemies.length = 0; __g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 })')
ev('__g.state.player.x = 30*16+8; __g.state.player.y = 42*16+8'); pg.wait_for_timeout(300)
ev('__g.state.threat = 9999'); pg.wait_for_timeout(400)
print('warn state:', ev('__g.state.ambushWarn.toFixed(2)'), ev('__g.state.msg'))
pg.wait_for_timeout(2400)
amb = ev('__g.enemies.filter(e=>e.ambush).length')
print('ambushers spawned:', amb)
pg.wait_for_timeout(1800)
print('ambusher distances:', ev('JSON.stringify(__g.enemies.filter(e=>e.ambush).map(e=>Math.round(Math.hypot(e.x-__g.state.player.x,e.y-__g.state.player.y))))'))
pg.screenshot(path='out/ambush.png')
# ---- hidden enemy reveal ----
ev('__g.enemies.length = 0')
e = json.loads(ev('JSON.stringify((()=>{const p=__g.state.player; const e=__g.spawnEnemy("hound", p.x+90, p.y, {hidden:true}); return {id:e.id}})())'))
pg.wait_for_timeout(300)
print('hidden before:', ev('__g.enemies[0].hidden'))
ev('__g.state.player.x += 60'); pg.wait_for_timeout(300)
print('hidden after approach:', ev('__g.enemies[0].hidden'), ev('__g.state.msg'))
# ---- raid pathing through the valley gates ----
ev('__g.enemies.length = 0; __g.state.player.x = (%d+0.5)*16; __g.state.player.y = (%d+0.5)*16' % (BX, BY))
ev('__g.structs.set(%d*128+%d, {type:"workbench", hp:120}); __g.structs.set(%d*128+%d, {type:"barricade", hp:90})' % (BY, BX+4, BY+2, BX+5))
ev('__g.startRaid(2)')
print('raid:', ev('JSON.stringify(__g.state.raid)'))
t0 = time.time()
for k in range(12):
    pg.wait_for_timeout(4000)
    ds = json.loads(ev('JSON.stringify(__g.enemies.filter(e=>e.raid).map(e=>Math.round(Math.hypot(e.x-%d*16, e.y-%d*16)/16)))' % (BX, BY)))
    st = ev('[...__g.structs.values()].map(s=>s.type+":"+Math.round(s.hp)).join(",")')
    print('t+%ds raider tile-dist to base: %s | structs %s | hp %s' % ((k+1)*4, ds, st, ev('Math.round(__g.state.player.health)')))
    if not ds: break
pg.screenshot(path='out/raid2.png')
