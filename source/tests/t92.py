import json
ev = lambda s: pg.evaluate(s)
BX, BY = 28, 98
def shot(n): pg.screenshot(path='out/%s.png' % n)
ev('__g.state.title = false'); ev('Object.assign(__g.state.qflags, {storyInit:true, sitesPlaced:true, "read:Folded Note":true}); __g.state.intro = null; __g.state.reading = null')
ev('__g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 }); __g.enemies.length = 0')
pg.wait_for_timeout(400)
ev('__g.state.player.x=(%d+0.5)*16; __g.state.player.y=(%d+0.5)*16' % (BX + 3, BY - 1))
for a in range(4): ev('__g.structs.set(%d*128+%d, {type:"bunk", hp:90, rot:0, owner:null})' % (BY + 3, BX - 6 + a * 2))
ev('__g.structs.set(%d*128+%d, {type:"chest", hp:90, rot:0, slots:new Array(27).fill(null)})' % (BY - 2, BX + 2))
ev('__g.structs.set(%d*128+%d, {type:"guardpost", hp:240, rot:0})' % (BY - 3, BX + 6))
ev('const c=[...__g.structs.values()].find(s=>s.type==="chest"); c.slots[0]={name:"Pistol rounds",qty:20}')
for i in range(3): ev('(()=>{ const s=__g.survivors.filter(q=>!q.wounded)[0]; __g.recruit(s); })()')
ev('__g.settlers[0].job="Guard"; __g.settlers[1].job="Hauler"; __g.settlers[2].job="Fisher"; __g.settlers.forEach(s=>{ s.state="home"; s.x=%d*16; s.y=%d*16 })' % (BX + 2, BY))
ev('__g.settlers[0].skills.guard = 3')
# a walled pocket: settler 1 starts boxed in with one gap on the south side
for x in range(BX - 4, BX - 0): 
    ev('__g.structs.set(%d*128+%d, {type:"wall", hp:110, rot:0})' % (BY - 6, x))
pg.wait_for_timeout(9000)
shot('t_scene1')
print([(s.get('name'), s.get('job'), s.get('status'), s.get('onPost')) for s in json.loads(ev('JSON.stringify(__g.settlers.map(s=>({name:s.name.split(" ")[0], job:s.job, status:__g.settlerStatus(s), onPost:s.onPost, x:Math.round(s.x), y:Math.round(s.y)})))'))])
# stuck test: put settler overlapping a wall and one boxed in
ev('__g.structs.set(%d*128+%d, {type:"wall", hp:110, rot:0})' % (BY - 8, BX - 10))
ev('(()=>{ const s=__g.settlers[1]; s.job="Hauler"; s.task=null; s.x=(%d+0.5)*16; s.y=(%d+0.5)*16; })()' % (BX - 10, BY - 8))
pg.wait_for_timeout(1500)
print('settler overlapping a wall now collides?', ev('__g.collides(__g.settlers[1].x, __g.settlers[1].y, 10, true)'))
# pins
ev('__g.togglePin("workbench"); __g.togglePin("wall"); __g.togglePin("hammer")')
pg.keyboard.press('b'); pg.wait_for_timeout(400); shot('t_settle'); pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
ev('__g.state.player.x=(%d+0.5)*16; __g.state.player.y=(%d+0.5)*16' % (BX + 3, BY - 1)); pg.wait_for_timeout(1200)
shot('t_scene2')
