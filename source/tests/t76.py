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
saw = False; log = []
for t in range(26):
    pg.wait_for_timeout(1500)
    s = json.loads(ev('JSON.stringify(__g.settlers.map(s=>({n:s.name.split(" ")[0], job:s.job, carry:(s.carry||[]).map(c=>c.qty+" "+c.name), task:s.task&&s.task.kind, st:__g.settlerStatus(s)})))'))
    chest = ev('JSON.stringify([...__g.structs.values()].find(s=>s.type==="chest").slots.filter(Boolean).map(s=>s.name+" "+s.qty))')
    if any(x['carry'] for x in s) and not saw: saw = True; shot('carry')
    if t % 4 == 0 or any(x['carry'] for x in s): log.append((t * 1.5, [(x['n'], x['carry'], x['st']) for x in s], chest))
for l in log[-5:]: print(l)
print('final chest:', ev('JSON.stringify([...__g.structs.values()].find(s=>s.type==="chest").slots.filter(Boolean).map(s=>s.name+" "+s.qty))'))
pg.keyboard.press('b'); pg.wait_for_timeout(400); shot('carry_panel')
