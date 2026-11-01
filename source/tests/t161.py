import json
ev = lambda s: pg.evaluate(s)
print(ev('JSON.stringify({title: __g.state.title, menu: __g.anyMenuOpen(), intro: !!__g.state.intro, reading: __g.state.reading, faint: !!__g.state.faint, sleeping: __g.state.sleeping, trans: !!__g.state.transition, dlg: !!__g.state.dlg, placing: __g.state.placing, mm: __g.moveMult()})'))
ev('__g.state.player.x = 60*16; __g.state.player.y = 60*16')
p0 = json.loads(ev('JSON.stringify([__g.state.player.x, __g.state.player.y])'))
pg.keyboard.down('w'); pg.wait_for_timeout(700)
print('while holding w: keys', ev('JSON.stringify(Object.keys(window.__keys||{}))'), '| pos', ev('JSON.stringify([__g.state.player.x, __g.state.player.y])'), '| moving', ev('__g.state.player.moving'))
pg.keyboard.up('w')
print('collides at 60,59.5:', ev('__g.collides(60*16, 59.5*16, 10, true)'), '| at 60,60:', ev('__g.collides(60*16, 60*16, 10, true)'), '| at 61,60:', ev('__g.collides(61*16, 60*16, 10, true)'))
