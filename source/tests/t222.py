ev = lambda s: pg.evaluate(s)
ev('__g.state.sel = 8')
ev('__g.state.craftOpen = false')
pg.keyboard.press('p'); pg.wait_for_timeout(800); pg.screenshot(path='out/l_progress.png')
