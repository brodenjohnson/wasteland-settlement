import json
ev = lambda s: pg.evaluate(s)
BX, BY = 28, 98
def shot(n): pg.screenshot(path='out/%s.png' % n)
ev('__g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 }); __g.enemies.length = 0')
ev('__g.state.title = false'); ev('__g.state.qflags.storyInit = true; __g.state.qflags.sitesPlaced = true; __g.state.qflags["read:Folded Note"] = true; __g.state.intro = null')
ev('__g.state.player.x=(%d+0.5)*16; __g.state.player.y=(%d+0.5)*16' % (BX, BY))
for a in range(3): ev('__g.structs.set(%d*128+%d, {type:"bunk", hp:90, rot:0, owner:null})' % (BY + 2, BX - 4 + a * 2))
ev('__g.structs.set(%d*128+%d, {type:"chest", hp:90, rot:0, slots:new Array(27).fill(null)})' % (BY - 3, BX + 3))
for i in range(2): ev('(()=>{ const s=__g.survivors.filter(q=>!q.wounded)[0]; __g.recruit(s); })()')
ev('__g.settlers[0].job = "Hauler"; __g.settlers[1].job = "Fisher"; __g.settlers.forEach(s => { s.state = "home"; s.x = %d*16; s.y = (%d-1)*16 })' % (BX, BY))
for k in range(16):
    pg.wait_for_timeout(2500)
    print(k * 2.5, ev('JSON.stringify(__g.settlers.map(s=>({n:s.name.split(" ")[0],x:Math.round(s.x),y:Math.round(s.y),st:s.state,task:s.task&&s.task.kind,carry:(s.carry||[]).map(c=>c.qty+" "+c.name),dep:s.depositNow,t:Math.round(s.carryT||0),path:s.path?s.path.length:0})))'))
print('chest:', ev('JSON.stringify([...__g.structs.values()].find(s=>s.type==="chest").slots.filter(Boolean))'))
