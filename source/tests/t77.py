import json
ev = lambda s: pg.evaluate(s)
BX, BY = 28, 98
ev('__g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 }); __g.enemies.length = 0')
ev('__g.state.title = false'); ev('__g.state.qflags.storyInit = true; __g.state.qflags.sitesPlaced = true; __g.state.qflags["read:Folded Note"] = true; __g.state.intro = null')
ev('__g.state.player.x=(%d+0.5)*16; __g.state.player.y=(%d+0.5)*16' % (BX, BY))
for a in range(3): ev('__g.structs.set(%d*128+%d, {type:"bunk", hp:90, rot:0, owner:null})' % (BY + 2, BX - 4 + a * 2))
ev('__g.structs.set(%d*128+%d, {type:"chest", hp:90, rot:0, slots:new Array(27).fill(null)})' % (BY - 3, BX + 3))
ev('(()=>{ const s=__g.survivors.filter(q=>!q.wounded)[0]; __g.recruit(s); })()')
ev('__g.settlers[0].job = "Hauler"; __g.settlers[0].state = "home"; __g.settlers[0].x = %d*16; __g.settlers[0].y = (%d-1)*16; __g.settlers[0].carry = [{name:"Wood", qty:9}]' % (BX, BY))
print('chest tile', (BX + 3, BY - 3), 'goal px', ((BX + 3 + 0.5) * 16, (BY - 3 + 0.5) * 16 + 12))
for k in range(8):
    pg.wait_for_timeout(600)
    print(k, ev('JSON.stringify(((s)=>({x:Math.round(s.x),y:Math.round(s.y),st:s.state,task:s.task&&s.task.kind,carry:(s.carry||[]).length,dep:s.depositNow,job:s.job}))(__g.settlers[0]))'))
print(ev('JSON.stringify([...__g.structs.values()].find(s=>s.type==="chest").slots.filter(Boolean))'))
