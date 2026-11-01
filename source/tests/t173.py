import json
ev = lambda s: pg.evaluate(s)
def shot(n): pg.screenshot(path='out/%s.png' % n)
BX, BY = 28, 98
ev('__g.state.placing = null; __g.enemies.length = 0; __g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 })')
ev('__g.state.player.x=(%d+0.5)*16; __g.state.player.y=(%d+0.5)*16' % (BX, BY))
for a in range(2): ev('__g.structs.set(%d*128+%d, __g.newStruct("bunk"))' % (BY + 3, BX - 6 + a * 2))
ev('__g.structs.set(%d*128+%d, __g.newStruct("chest"))' % (BY - 3, BX + 4))
ev('const c=[...__g.structs.values()].find(s=>s.type==="chest"); c.slots[0]={name:"Canned food",qty:4}')
ev('(()=>{ const s=__g.survivors.filter(q=>!q.wounded)[0]; __g.recruit(s); })()')
ev('__g.settlers[0].job = "Idle"; __g.settlers[0].hunger = 15; __g.settlers[0].state = "home"; __g.settlers[0].x = %d*16; __g.settlers[0].y = %d*16' % (BX + 3, BY - 1))
seen = []
for k in range(24):
    pg.wait_for_timeout(500)
    s = json.loads(ev('JSON.stringify((s=>({eating:s.eating, h:Math.round(s.hunger), st:__g.settlerStatus(s)}))(__g.settlers[0]))'))
    if s['eating'] and 'eating' not in [x[0] for x in seen]: seen.append(('eating', s['st'])); shot('e_eating')
    if not seen or seen[-1][0] != s['st']: seen.append((s['st'], s['h']))
print('timeline:', seen[:8], '| final hunger', ev('Math.round(__g.settlers[0].hunger)'))
# text size on a few screens
ev('__g.state.craftOpen = true'); pg.wait_for_timeout(500); shot('e_craft_large')
ev('__g.state.craftOpen = false; __g.state.invOpen = true'); pg.wait_for_timeout(500); shot('e_inv_large')
