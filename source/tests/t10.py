import json
ev = lambda s: pg.evaluate(s)
pg.keyboard.press('h'); pg.keyboard.press('u'); pg.wait_for_timeout(100)
def shot(name, x, y, wait=700):
    ev('__g.state.player.x = %d*16; __g.state.player.y = %d*16' % (x, y)); pg.wait_for_timeout(wait)
    pg.screenshot(path='out/%s.png' % name)
shot('v_forest', 16, 28)      # green zone 0 with spring
shot('v_ruin', 12, 16)
shot('v_road', 30, 39)
ev('__g.state.gameMinutes = 19*60+30'); shot('v_dusk', 33, 31)
