import json
ev = lambda s: pg.evaluate(s)
def slot(n): return ev("__g.state.player.inventory.findIndex(s=>s&&s.name==='%s')" % n)
pg.keyboard.press('h'); pg.wait_for_timeout(100)
tx, ty = 29, 31   # next to the player
x, y = 550 + ((tx + 0.5) * 16 - ev('__g.state.player.x')) * 3, 350 + ((ty + 0.5) * 16 - ev('__g.state.player.y')) * 3
def hold(ms): pg.mouse.move(x, y); pg.wait_for_timeout(60); pg.mouse.down(); pg.wait_for_timeout(ms); pg.mouse.up(); pg.wait_for_timeout(80)
pg.keyboard.press(str(slot('Hoe') + 1)); hold(200)
pg.keyboard.press(str(slot('Radish Seeds') + 1)); hold(120)
ev('[...__g.crops.values()][0].age = 3'); pg.wait_for_timeout(100)
pg.keyboard.press(str(slot('Rusty Pipe') + 1)); hold(150)
print('crops left:', ev('__g.crops.size'), 'radish:', ev("(__g.state.player.inventory.find(s=>s&&s.name==='Radish')||{}).qty"))
