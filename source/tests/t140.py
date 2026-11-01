import json
ev = lambda s: pg.evaluate(s)
def shot(n): pg.screenshot(path='out/%s.png' % n)
ev('__g.state.placing = null; __g.enemies.length = 0; __g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 })')
ev('__g.state.player.x = 60*16; __g.state.player.y = 60*16'); pg.wait_for_timeout(300)
ev('__g.addItem("Machete", 1)'); mi = ev('__g.state.player.inventory.findIndex(s=>s&&s.name==="Machete")'); pg.keyboard.press(str(mi + 1))
# a few kills: light, then a heavy one that gibs
for i, (t, dmg) in enumerate([('hound', 30), ('scrapper', 40), ('husk', 400), ('stalker', 40)]):
    ev('(()=>{ const e = __g.spawnEnemy("%s", __g.state.player.x + %d, __g.state.player.y + %d, {}); e.cd = 99; __g.damageEnemy(e, %d, 1, 0.2, 60); })()' % (t, 30 + i * 22, -20 + (i % 2) * 40, dmg))
    pg.wait_for_timeout(120)
pg.wait_for_timeout(500)
print('blood decals:', ev('__g.state.blood.filter(b=>b.k==="d").length'), '| bodies:', ev('__g.state.blood.filter(b=>b.k==="c").length'), '| gibs in flight:', ev('__g.state.gibs.length'))
shot('g_kills')
pg.wait_for_timeout(2500); shot('g_after')
print('decals after the gibs landed:', ev('__g.state.blood.filter(b=>b.k==="d").length'))
# wounds on the player and the warning screens
ev('__g.state.player.health = 28'); pg.wait_for_timeout(900); shot('g_wounded')
ev('__g.state.player.health = 100; __g.state.title = false')
# gore off check
ev('__g.state.player.health = 100'); ev('window.__x = 0'); 
n0 = ev('__g.state.blood.length')
ev('__g.gore = __g.gore; 0')
