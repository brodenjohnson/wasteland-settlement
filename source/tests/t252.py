import json
ev = lambda s: pg.evaluate(s)
def shot(n): pg.screenshot(path='out/%s.png' % n)
bad = []
def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok: bad.append(what)
ev('__g.state.placing = null; __g.enemies.length = 0; __g.state.iframes = 9999; __g.state.gameMinutes = 12*60 + 1440*2')
# the ways in sit at the edges
port = lambda id: json.loads(ev('JSON.stringify(__g.state.mapFlags["%s"].portal)' % id))
h, m, p3 = port('hull'), port('megamart'), port('pylon3')
check(h['x'] >= 115 and h['y'] >= 115, 'the Hull gangway is in the south-east corner (%d, %d)' % (h['x'], h['y']))
check(m['x'] >= 118, 'MegaMart is on the east edge (%d, %d)' % (m['x'], m['y']))
check(p3['y'] <= 14, 'Pylon 3 is north of the Ash Tower (%d, %d)' % (p3['x'], p3['y']))
check(ev('__g.INTERACT.get(%d) && __g.INTERACT.get(%d).to' % (h['i'], h['i'])) == 'hull', 'the gangway is usable')
check(ev('__g.tiles[%d] === 4 || __g.tiles[%d] === 4 || __g.tiles[%d] === 4' % (h['i'] - 1, h['i'] - 129, h['i'] - 128)), 'a road reaches the gangway')
# an old save with the old spots gets moved on load
ev('''(() => { const f = __g.state.mapFlags; f.megamart.portal = { x: 103, y: 58, i: 58*128+103 }; delete f.megamart.edge; __g.INTERACT.set(58*128+103, { kind: 'portal', to: 'megamart', label: 'old' }); })()''')
ev('__g.doSave("2", true)'); pg.wait_for_timeout(1500)
cid = ev('__g.state.charId')
pg.reload(); pg.wait_for_timeout(2500); ev('__g.loadSlot("%s", "2")' % cid); pg.wait_for_timeout(3500)
m2 = port('megamart')
check(m2['x'] >= 118 and ev('__g.INTERACT.has(58*128+103)') is False and ev('__g.INTERACT.get(%d).to' % m2['i']) == 'megamart', 'an old save moves MegaMart to the edge')
# hearing about the Hull
check(not ev('!!__g.state.qflags.hull_marked'), 'the Hull starts unmarked')
ev('__g.state.player.x = 100*16; __g.state.player.y = 102*16'); pg.wait_for_timeout(1200)
check(ev('!!__g.state.qflags.hull_marked') and ev('__g.state.markers.some(m => m.label === "The Hull")'), 'reaching the marsh marks the Hull on the map')
# safe in town: no ambush however long you walk
ev('__g.enterMap("hull", -1, -1)'); pg.wait_for_timeout(3500)
ev('__g.state.threat = 999'); pg.wait_for_timeout(1500)
check(ev('__g.state.ambushWarn') == 0 and ev('__g.enemies.length') == 0, 'no ambushes in the Hull')
# every building lets you move on arrival
stuck = []
for bn in ev('Object.keys(__g.MAPDEFS).filter(k => k.startsWith("hull_"))'):
    ev('__g.enterMap("%s", -1, -1)' % bn); pg.wait_for_timeout(2800)
    if ev('(() => { const p = __g.state.player; return __g.collides(p.x, p.y, 10, true) || [[0,-8],[0,8],[-8,0],[8,0]].every(([dx,dy]) => __g.collides(p.x+dx, p.y+dy, 10, true)); })()'): stuck.append(bn)
    if bn in ('hull_guard', 'hull_tinkers'): shot('t252_' + bn)
check(not stuck, 'no building traps you at the door' + (': ' + ', '.join(stuck) if stuck else ''))
ev('__g.enterMap("hull", -1, -1)'); pg.wait_for_timeout(3200)
def tp(x, y): ev('__g.state.player.x = (%s + 0.5) * 16; __g.state.player.y = (%s + 0.5) * 16' % (x, y)); pg.wait_for_timeout(700)
tp(64, 64); shot('t252_plaza'); tp(30, 66); shot('t252_street'); tp(64, 104); shot('t252_dock'); tp(40, 42); shot('t252_ship')
ev('__g.state.gameMinutes = 23*60 + 1440*2'); tp(64, 64); pg.wait_for_timeout(600); shot('t252_night')
if bad: errs.append('t252: ' + '; '.join(bad))
