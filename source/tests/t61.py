import json
ev = lambda s: pg.evaluate(s)
def shot(n): pg.screenshot(path='out/%s.png' % n)
pg.wait_for_timeout(600); shot('m_title')
ev('__g.state.title = false')
ev('__g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 }); __g.enemies.length = 0')
ev('__g.state.player.xp = 40; __g.addItem("Wood",30); __g.addItem("Scrap",20); __g.addItem("Stone",12)')
for key, name in [('i','m_inv'),('c','m_craft'),('m','m_map'),('p','m_prog'),('j','m_journal'),('b','m_settle')]:
    pg.keyboard.press(key); pg.wait_for_timeout(450); shot(name); pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
pg.keyboard.press('Escape'); pg.wait_for_timeout(300); shot('m_pause')
