import json
ev = lambda s: pg.evaluate(s)
BX, BY = 28, 98
ev('__g.state.title = false'); ev('Object.assign(__g.state.qflags, {storyInit:true, sitesPlaced:true, "read:Folded Note":true}); __g.state.intro = null; __g.state.reading = null')
ev('__g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 }); __g.enemies.length = 0')
pg.wait_for_timeout(500)
ev('__g.state.player.x=(%d+0.5)*16; __g.state.player.y=(%d+0.5)*16' % (BX, BY))
for a in range(2): ev('__g.structs.set(%d*128+%d, {type:"bunk", hp:90, rot:0, owner:null})' % (BY + 2, BX - 6 + a * 2))
ev('__g.structs.set(%d*128+%d, {type:"chest", hp:90, rot:0, slots:new Array(27).fill(null)})' % (BY - 2, BX + 2))
ev('const c=[...__g.structs.values()].find(s=>s.type==="chest"); c.slots[0]={name:"Wood",qty:60}; c.slots[1]={name:"Scrap",qty:40}')
ev('(()=>{ const s=__g.survivors.filter(q=>!q.wounded)[0]; __g.recruit(s); })()')
ev('__g.structs.set(%d*128+%d, {type:"wall", hp:10, maxHp:110, rot:0})' % (BY + 6, BX - 2))
ev('(()=>{ const s=__g.settlers[0]; s.job="Builder"; s.state="home"; s.x=%d*16; s.y=(%d+3)*16; s.task=null; })()' % (BX, BY))


for k in range(10):
    pg.wait_for_timeout(2000)
    print(k, ev('JSON.stringify((s=>({x:Math.round(s.x),y:Math.round(s.y),task:!!s.task,workT:s.workT&&+s.workT.toFixed(2),stuckN:s.stuckN, gv:s._gv}))(__g.settlers[0]))'), '| wall hp', ev('Math.round(__g.structs.get(%d*128+%d).hp)' % (BY + 6, BX - 2)))
