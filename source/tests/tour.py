import json, time
ev = lambda s: pg.evaluate(s)
t0 = time.time()
print('zone check:', ev('JSON.stringify([__g.CONFIG.mapW, __g.enemies.length, __g.state.spawnPts.length])'))
ev('__g.state.timeMult = 1')
def shot(name, tx, ty, wait=900):
    ev('__g.state.player.x = %d*16+8; __g.state.player.y = %d*16+8' % (tx, ty)); pg.wait_for_timeout(wait)
    pg.screenshot(path='out/%s.png' % name)
shot('z_gate', 28, 71)       # north gate of the valley wall
shot('z_forest', 30, 42)
shot('z_ruins', 62, 70)      # scrapyard office
shot('z_city', 100, 56)
shot('z_marsh', 96, 100)
shot('z_ash', 88, 26)
print('done tour')
