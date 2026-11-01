import json
ev = lambda s: pg.evaluate(s)
def shot(n): pg.screenshot(path='out/%s.png' % n)
def hr(h, d=2): ev('__g.state.gameMinutes = %d*1440 + %d' % (d, int(h * 60)))
ev('__g.state.placing = null; __g.enemies.length = 0; __g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 }); __g.state.iframes = 9999')
# 1. in through the marsh gangway
pt = json.loads(ev('JSON.stringify(__g.state.mapFlags.hull.portal)'))
ev('__g.state.player.x = (%d + 0.5) * 16; __g.state.player.y = (%d + 1) * 16' % (pt['x'], pt['y']))
ev('__g.useInteract(__g.INTERACT.get(%d), %d)' % (pt['i'], pt['i'])); pg.wait_for_timeout(4200)
print('through the gangway:', ev('__g.state.map'), '| at', ev('JSON.stringify([Math.floor(__g.state.player.x/16), Math.floor(__g.state.player.y/16)])'))
gate = 64 * 128 + 8
ev('__g.state.player.x = 9.5 * 16; __g.state.player.y = 64.5 * 16'); pg.wait_for_timeout(300)
ev('__g.useInteract(__g.INTERACT.get(%d), %d)' % (gate, gate)); pg.wait_for_timeout(4200)
print('out the west gate:', ev('__g.state.map'), '| near the portal:', ev('Math.hypot(__g.state.player.x/16 - %d, __g.state.player.y/16 - %d) < 4' % (pt['x'], pt['y'])))
# 2. a real click on a shopkeeper
hr(10); ev('__g.enterMap("hull_general", -1, -1)'); pg.wait_for_timeout(4200)
L = json.loads(ev('JSON.stringify(__g.layoutFor(__g.BID.general))'))
ev('__g.state.player.x = (%d+0.5)*16; __g.state.player.y = (%d+3)*16' % (L['posts']['counter']['x'], L['posts']['counter']['y'])); pg.wait_for_timeout(1200)
shot('t_counter')
mags = json.loads(ev('JSON.stringify(__g.survivors.filter(s=>s.town).map(s=>[s.name, s.x, s.y]))'))
print('in the shop:', mags)
pl = json.loads(ev('JSON.stringify([__g.state.player.x, __g.state.player.y])'))
x = 550 + (mags[0][1] - pl[0]) * 4; y = 350 + (mags[0][2] - 6 - pl[1]) * 4
pg.mouse.move(x, y); pg.wait_for_timeout(300); pg.mouse.down(); pg.wait_for_timeout(500); pg.mouse.up(); pg.wait_for_timeout(1200)
print('click on Mags opened:', ev('__g.state.dlg && __g.state.dlg.id'), '| or talk panel:', ev('!!__g.state.talk'))
ev('__g.state.dlg = null; __g.state.talk = null')
# 3. hiring a drifter
ev('__g.BASE && 0')
ev('__g.addItem("Caps", 100)')
dr = json.loads(ev('JSON.stringify(__g.ROSTER.filter(n=>n.drifter!==undefined && __g.present(n)).map(n=>[n.sid, n.name]))'))
print('drifter on the books today:', dr)
# 4. night in the boulevard
ev('__g.enterMap("hull", -1, -1)'); pg.wait_for_timeout(4200); hr(23.2); ev('__g.state.player.x = 55.5*16; __g.state.player.y = 64.5*16'); pg.wait_for_timeout(2000); shot('t_night')
print('dark now:', ev('__g.MAPDEFS.hull.dark'), '| on the street at 23:00:', ev('JSON.stringify(__g.survivors.filter(s=>s.town).map(s=>s.name))'))
