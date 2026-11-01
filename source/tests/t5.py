import json
ev = lambda s: pg.evaluate(s)
pg.keyboard.press('h'); pg.keyboard.press('g'); pg.keyboard.press('u'); pg.wait_for_timeout(100)
ev('__g.structs.set(30*60+34, {type:"workbench", hp:120}); __g.structs.set(31*60+35, {type:"barricade", hp:90})')
ev('__g.state.gameMinutes = 24*60*1 + 19*60 + 5'); pg.wait_for_timeout(500)
print('raid active:', ev('!!__g.state.raid'), 'raiders', ev('__g.enemies.filter(e=>e.raid).length'), ev('__g.state.msg'))
pg.wait_for_timeout(14000)
print('structs:', ev('[...__g.structs.values()].map(s=>s.type+":"+Math.round(s.hp)).join(",")'), 'raiders', ev('__g.enemies.filter(e=>e.raid).length'), 'hp', ev('Math.round(__g.state.player.health)'))
pg.screenshot(path='out/raid.png')
