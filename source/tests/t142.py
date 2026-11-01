ev = lambda s: pg.evaluate(s)
pg.wait_for_timeout(1500)
print('warning gate active:', ev('!__g.settings.cwSeen') if False else 'checking')
pg.screenshot(path='out/g_warn.png')
pg.mouse.click(550, 560); pg.wait_for_timeout(300)   # cycle gore
pg.mouse.click(550, 604); pg.wait_for_timeout(500)   # continue
pg.screenshot(path='out/g_title.png')
ev('__g.state.settingsOpen = true; __g.state.pauseFrom = false'); pg.wait_for_timeout(500)
pg.screenshot(path='out/g_settings.png')
print('gore now:', ev('__g.gore()'))
