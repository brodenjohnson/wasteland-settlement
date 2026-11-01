import json
ev = lambda s: pg.evaluate(s)
def shot(n): pg.screenshot(path='out/%s.png' % n)
def tp(x, y): ev('__g.state.player.x = (%s + 0.5) * 16; __g.state.player.y = (%s + 0.5) * 16' % (x, y)); pg.wait_for_timeout(900)
ev('__g.state.placing = null; __g.enemies.length = 0; __g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 }); __g.state.iframes = 9999')
ev('__g.state.gameMinutes = 12*60 + 24*60*2')    # midday
pt = ev('JSON.stringify(__g.state.mapFlags.hull && __g.state.mapFlags.hull.portal)')
print('hull portal in the wastes:', pt)
ev('__g.enterMap("hull", -1, -1)'); pg.wait_for_timeout(4200)
print('map:', ev('__g.state.map'), '| zone', ev('__g.state.zone'), '| buildings', ev('__g.HB.length'), '| entered at', ev('JSON.stringify([Math.floor(__g.state.player.x/16), Math.floor(__g.state.player.y/16)])'))
shot('h_gate'); tp(58, 63); shot('h_plaza'); tp(30, 60); shot('h_north'); tp(34, 69); shot('h_south'); tp(50, 90); shot('h_homes'); tp(64, 44); shot('h_ship')
# walk into the general store and back out
b = ev('JSON.stringify(__g.BID.general)')
import json as J; b = J.loads(b)
tp(b['out']['x'], b['out']['y'])
door = b['door']['y'] * 128 + b['door']['x']
print('door interact:', ev('JSON.stringify(!!__g.INTERACT.get(%d))' % door))
ev('__g.useInteract(__g.INTERACT.get(%d), %d)' % (door, door)); pg.wait_for_timeout(1200); shot('h_loading'); pg.wait_for_timeout(2800)
print('inside:', ev('__g.state.map'), '| player tile', ev('JSON.stringify([Math.floor(__g.state.player.x/16), Math.floor(__g.state.player.y/16)])'))
shot('h_inside')
L = J.loads(ev('JSON.stringify(__g.layoutFor(__g.BID.general))'))
ex = L['exit']['y'] * 128 + L['exit']['x']
ev('__g.useInteract(__g.INTERACT.get(%d), %d)' % (ex, ex)); pg.wait_for_timeout(4000)
print('back outside:', ev('__g.state.map'), '| player tile', ev('JSON.stringify([Math.floor(__g.state.player.x/16), Math.floor(__g.state.player.y/16)])'), '| expected', b['out'])
