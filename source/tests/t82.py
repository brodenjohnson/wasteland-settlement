import json
ev = lambda s: pg.evaluate(s)
def shot(n): pg.screenshot(path='out/%s.png' % n)
ev('__g.state.title = false')
ev('__g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 }); __g.enemies.length = 0')
pg.mouse.click(300, 300); pg.wait_for_timeout(6500); pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
pg.mouse.click(300, 300); pg.wait_for_timeout(2500)
print('music engine:', ev('JSON.stringify({ctx: !!(__g.MUS && __g.MUS.ctx), state: __g.MUS && __g.MUS.ctx && __g.MUS.ctx.state, mood: __g.MUS && __g.MUS.mood, busGain: __g.MUS && __g.MUS.bus && Number(__g.MUS.bus.gain.value.toFixed(3))})'))
ev('__g.state.player.x = 5*16; __g.state.player.y = 5*16'); pg.wait_for_timeout(2500)
print('mood out in the wastes:', ev('__g.MUS.mood'))
ev('__g.spawnEnemy("scrapper", __g.state.player.x + 70, __g.state.player.y, {})'); pg.wait_for_timeout(3000)
print('mood with an enemy near:', ev('__g.MUS.mood'))
ev('__g.enemies.length = 0; __g.state.player.x = 28*16; __g.state.player.y = 98*16'); pg.wait_for_timeout(2500)
print('mood back home:', ev('__g.MUS.mood'))
# crafting with a kit button
BX, BY = 28, 98
ev('__g.structs.set(%d*128+%d, {type:"workbench", hp:120, rot:0})' % (BY, BX + 2))
ev('__g.addItem("Wood", 60); __g.addItem("Scrap", 40); __g.addItem("Cloth", 10)')
pg.keyboard.press('c'); pg.wait_for_timeout(500); shot('k_craft')
