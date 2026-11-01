import json
ev = lambda s: pg.evaluate(s)
BX, BY = 28, 98
ev('__g.state.placing = null; __g.enemies.length = 0; __g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 })')
ev('__g.state.player.x=(%d+0.5)*16; __g.state.player.y=(%d+0.5)*16' % (BX, BY))
for a in range(2): ev('__g.structs.set(%d*128+%d, __g.newStruct("bunk"))' % (BY + 3, BX - 6 + a * 2))
ev('__g.structs.set(%d*128+%d, __g.newStruct("chest"))' % (BY - 3, BX + 4))
ev('const c=[...__g.structs.values()].find(s=>s.type==="chest"); c.slots[0]={name:"Canned food",qty:4}; c.slots[1]={name:"Cooked Fish",qty:2}')
ev('(()=>{ const s=__g.survivors.filter(q=>!q.wounded)[0]; __g.recruit(s); })()')
ev('__g.settlers[0].job = "Idle"; __g.settlers[0].hunger = 15; __g.settlers[0].state = "home"; __g.settlers[0].x = %d*16; __g.settlers[0].y = %d*16' % (BX, BY))
for k in range(8):
    pg.wait_for_timeout(2500)
    print(k, ev('JSON.stringify((s=>({x:Math.round(s.x),y:Math.round(s.y),hunger:Math.round(s.hunger),task:s.task,say:s.say}))(__g.settlers[0]))'), '| chest food:', ev('JSON.stringify([...__g.structs.values()].find(s=>s.type==="chest").slots.filter(Boolean).map(s=>s.name+" "+s.qty))'))
print('chestFood fn:', ev('typeof __g.chestFood'))
