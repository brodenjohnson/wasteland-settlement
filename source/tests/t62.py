import json
ev = lambda s: pg.evaluate(s)
def shot(n): pg.screenshot(path='out/%s.png' % n)
ev('__g.state.title = false')
ev('__g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 }); __g.enemies.length = 0')
pg.wait_for_timeout(900)
print('start codex:', ev('JSON.stringify([Object.keys(__g.state.codex.creatures), Object.keys(__g.state.codex.items), Object.keys(__g.state.codex.people), Object.keys(__g.state.codex.places)])'))
# meet a creature, pick things up, walk near a survivor, visit a zone
ev('__g.addItem("Wood", 5); __g.addItem("Machete", 1); __g.addItem("Purified Water", 1)')
ev('const s = __g.survivors[0]; __g.state.player.x = s.x + 40; __g.state.player.y = s.y')
ev('__g.spawnEnemy("hound", __g.state.player.x + 60, __g.state.player.y - 60, {})'); ev('__g.spawnEnemy("husk", __g.state.player.x - 60, __g.state.player.y - 60, {})')
pg.wait_for_timeout(1200)
print('after exploring:', ev('JSON.stringify([Object.keys(__g.state.codex.creatures), Object.keys(__g.state.codex.items), Object.keys(__g.state.codex.people), Object.keys(__g.state.codex.places)])'))
ev('__g.enemies.length = 0')
pg.keyboard.press('o'); pg.wait_for_timeout(400); shot('c_creatures')
for k, nm in [(1, 'c_items'), (2, 'c_people'), (3, 'c_places')]:
    ev('__g.state.codexTab = %d' % k); pg.wait_for_timeout(300)
    if k == 1: ev('__g.state.codexSel[1] = "Machete"'); pg.wait_for_timeout(200)
    shot(nm)
print('codex tab visible and others close it:', ev('__g.state.codexOpen'))
pg.keyboard.press('i'); pg.wait_for_timeout(200)
print('inventory opened closes codex:', ev('__g.state.codexOpen === false && __g.state.invOpen'))
pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
# quick-stack
BX, BY = 28, 98
ev('__g.state.player.x=(%d+0.5)*16; __g.state.player.y=(%d+0.5)*16' % (BX, BY))
ev('__g.structs.set(%d*128+%d, {type:"chest", hp:90, rot:0, slots:new Array(27).fill(null)})' % (BY - 1, BX + 1))
ev('const ch = __g.structs.get(%d*128+%d); ch.slots[0] = {name:"Wood", qty:10}; ch.slots[1] = {name:"Scrap", qty:4}; __g.addItem("Wood", 20); __g.addItem("Scrap", 8); __g.addItem("Stone", 5)' % (BY - 1, BX + 1))
ev('__g.state.chestOpen = %d*128+%d; __g.state.invOpen = true' % (BY - 1, BX + 1)); pg.wait_for_timeout(300)
pg.keyboard.press('q'); pg.wait_for_timeout(200)
print('chest after quick-stack:', ev('JSON.stringify(__g.structs.get(%d*128+%d).slots.filter(Boolean).map(s=>s.name+" "+s.qty))' % (BY - 1, BX + 1)),
      '| bag keeps Stone:', ev('!!__g.state.player.inventory.find(s=>s&&s.name==="Stone")'), '| bag wood left:', ev('(__g.state.player.inventory.find(s=>s&&s.name==="Wood")||{qty:0}).qty'))
shot('c_chest')
pg.keyboard.press('Escape')
# difficulty + save/load of codex
pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
ev('__g.settings.diff = "normal"')
ev('__g.saveGame(true)'); ev('__g.state.codex = {creatures:{},items:{},people:{},places:{}}'); ev('__g.loadGame()')
print('codex after load:', ev('JSON.stringify([Object.keys(__g.state.codex.creatures), Object.keys(__g.state.codex.people).length])'))
