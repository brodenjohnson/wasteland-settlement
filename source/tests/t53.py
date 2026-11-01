import json
ev = lambda s: pg.evaluate(s)
BX, BY = 28, 98
pg.mouse.click(550, 332); pg.wait_for_timeout(300)
ev('Object.assign(__g.state.qflags, {storyInit:true, sitesPlaced:true, spawnVar:true, "read:Folded Note":true}); __g.state.intro = null; __g.state.reading = null')
ev('__g.enemies.length = 0; __g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 })')
ev('__g.structs.set(%d*128+%d, __g.newStruct("bunk")); __g.structs.set(%d*128+%d, __g.newStruct("bunk"))' % (BY - 3, BX - 5, BY - 3, BX - 3))
ev('__g.structs.set(%d*128+%d, __g.newStruct("chest"))' % (BY - 4, BX + 2))
ev('__g.survivors.forEach(s => { s.scared = false })')
for i in range(2): ev('(()=>{ const s=__g.survivors.filter(q=>!q.wounded)[0]; __g.recruit(s); })()')
ev('__g.settlers[0].job = "Fisher"; __g.settlers[1].job = "Hauler"; __g.settlers.forEach(s => { s.state = "home"; s.x = %d*16; s.y = (%d-1)*16 })' % (BX, BY))
ev('__g.state.player.x=%d*16; __g.state.player.y=%d*16' % (BX + 3, BY - 3))
for k in range(4):
    pg.wait_for_timeout(10000)
    print('t+%ds' % (10 * (k + 1)), ev('JSON.stringify(__g.settlers.map(s=>({n:s.name.split(" ")[0], job:s.job, xp:s.jobXp, task:s.task&&s.task.kind})))'))
print('chest:', ev('[...__g.structs.values()].filter(s=>s.type==="chest").map(s=>(s.slots||[]).filter(Boolean).map(x=>x.name+" "+x.qty))'))
pg.keyboard.press('b'); pg.wait_for_timeout(300); pg.screenshot(path='out/settlement_tab.png')
