import json
ev = lambda s: pg.evaluate(s)
BX, BY = 28, 98
def shot(n): pg.screenshot(path='out/%s.png' % n)
ev('__g.state.title = false'); ev('Object.assign(__g.state.qflags, {storyInit:true, sitesPlaced:true, spawnVar:true, "read:Folded Note":true}); __g.state.intro = null; __g.state.reading = null')
ev('__g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 }); __g.enemies.length = 0')
pg.wait_for_timeout(400)
# lineup
ev('__g.state.player.x = 60*16; __g.state.player.y = 60*16; __g.state.iframes = 99')
types = ['glowrat','hound','stalker','spitter','bloater','scrapper','gunner','sniper','sapper','husk','brute','chief']
for i, t in enumerate(types):
    ev('__g.spawnEnemy("%s", __g.state.player.x + %d, __g.state.player.y + %d, {}); __g.enemies[__g.enemies.length-1].home = {x: __g.enemies[__g.enemies.length-1].x, y: __g.enemies[__g.enemies.length-1].y}' % (t, -80 + (i % 6) * 32, -20 + (i // 6) * 50))
ev('__g.enemies.forEach(e => { e.cd = 99; e.hidden = false })')
pg.wait_for_timeout(200)
# freeze them by setting speed? just screenshot quickly
ev('window.__freeze = true'); shot('c_lineup')
print('types alive:', ev('JSON.stringify(__g.enemies.map(e=>e.type+":"+e.maxHp))'))
ev('__g.enemies.length = 0')
# sapper blows a wall
ev('__g.state.player.x=(%d+0.5)*16; __g.state.player.y=(%d+4.5)*16; __g.state.iframes = 0' % (BX, BY))
ev('__g.structs.set(%d*128+%d, {type:"wall", hp:110, maxHp:110, rot:0})' % (BY - 4, BX))
ev('__g.spawnEnemy("sapper", (%d+0.5)*16, (%d-8)*16, {raid:true})' % (BX, BY))
pg.wait_for_timeout(9000)
w = ev('__g.structs.get(%d*128+%d)' % (BY - 4, BX))
print('sapper vs wall -> wall:', 'destroyed or hurt' if (w is None or w['hp'] < 110) else 'untouched', w and w['hp'], '| sappers left:', ev('__g.enemies.filter(e=>e.type==="sapper").length'))
# bloater cloud
ev('__g.enemies.length = 0; __g.state.player.x=(%d+0.5)*16; __g.state.player.y=(%d+0.5)*16; __g.state.player.radiation=0' % (BX + 20, BY + 12))
ev('(()=>{ const e = __g.spawnEnemy("bloater", __g.state.player.x + 10, __g.state.player.y, {}); __g.damageEnemy(e, 9999, 1, 0, 0); })()')
pg.wait_for_timeout(2500)
print('clouds:', ev('__g.state.clouds.length'), '| radiation after standing in it:', round(ev('__g.state.player.radiation'), 1))
# chief rout
ev('__g.enemies.length = 0; __g.state.clouds.length = 0')
ev('__g.spawnEnemy("scrapper", __g.state.player.x + 120, __g.state.player.y, {raid:true}); __g.spawnEnemy("gunner", __g.state.player.x - 120, __g.state.player.y, {raid:true}); const c = __g.spawnEnemy("chief", __g.state.player.x, __g.state.player.y - 90, {raid:true}); __g.damageEnemy(c, 9999, 0, 0, 0)')
pg.wait_for_timeout(5000)
print('raiders left after chief died:', ev('__g.enemies.filter(e=>e.raid).length'))
