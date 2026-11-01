import json
ev = lambda s: pg.evaluate(s)
def shot(n): pg.screenshot(path='out/%s.png' % n)
ev('__g.state.placing = null; __g.enemies.length = 0; __g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 })')
ev('__g.state.player.x = 60*16; __g.state.player.y = 60*16'); pg.wait_for_timeout(300)
for i, t in enumerate(['hound', 'scrapper', 'gunner']):
    ev('(()=>{ const e = __g.spawnEnemy("%s", __g.state.player.x + %d, __g.state.player.y + %d, {}); e.cd = 99; e.hp = 6; __g.damageEnemy(e, 12, 1, 0.1, 40); })()' % (t, 28 + i * 24, -24 + i * 22))
ev('(()=>{ const e = __g.spawnEnemy("brute", __g.state.player.x - 40, __g.state.player.y, {}); e.cd = 99; __g.damageEnemy(e, 900, -1, 0.1, 40); })()')
pg.wait_for_timeout(2600)
print('bodies:', ev('__g.state.blood.filter(b=>b.k==="c").map(b=>b.type).join(",")'), '| decals:', ev('__g.state.blood.filter(b=>b.k==="d").length'))
shot('g_corpses')
ev('__g.state.player.health = 28'); pg.wait_for_timeout(1000); shot('g_wounded')
