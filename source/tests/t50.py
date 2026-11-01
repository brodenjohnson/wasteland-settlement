import json
ev = lambda s: pg.evaluate(s)
def shot(n): pg.screenshot(path='out/%s.png' % n)
def click(x, y): pg.mouse.click(x, y); pg.wait_for_timeout(150)
# title -> new game
click(550, 332); pg.wait_for_timeout(300)
print('title closed, game running:', ev('!__g.state.title'))
ev('__g.enemies.length = 0; __g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 })')
print('quests:', ev('Object.keys(__g.state.quests)'), '| bedroll+campfire structs:', ev('[...__g.structs.values()].map(s=>s.type)'))
# menus
for key, name in [('i','inv'), ('c','craft'), ('p','progress'), ('j','journal'), ('b','settle'), ('m','map')]:
    pg.keyboard.press(key); pg.wait_for_timeout(250); shot('menu_' + name); pg.keyboard.press('Escape'); pg.wait_for_timeout(120)
print('paused while menu open?', end=' ')
pg.keyboard.press('c'); pg.wait_for_timeout(200)
t0 = ev('__g.state.gameMinutes'); pg.wait_for_timeout(800); t1 = ev('__g.state.gameMinutes'); print(t1 == t0)
pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
pg.keyboard.press('Escape'); pg.wait_for_timeout(250); shot('menu_pause')
print('pause open:', ev('__g.state.pauseOpen'))
pg.keyboard.press('Escape'); pg.wait_for_timeout(150)
# open crafting and look at the detail pane for the forge and the stove (locked) and campfire
ev('__g.addItem("Wood", 40); __g.addItem("Stone", 20); __g.addItem("Scrap", 30); __g.addItem("Cloth", 10); __g.addItem("Metal plate", 10)')
pg.keyboard.press('c'); pg.wait_for_timeout(250); shot('craft_build')
rects = json.loads(ev('JSON.stringify(__g.state.uiRects)'))
print('ui rects in crafting:', len(rects))
