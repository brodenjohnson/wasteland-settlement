import json
ev = lambda s: pg.evaluate(s)
ev('__g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 }); __g.enemies.length = 0')
ev('__g.state.title = false'); pg.wait_for_timeout(300)
ev('__g.state.player.x = 24*16; __g.state.player.y = 98*16'); pg.wait_for_timeout(300)
print('moveMult:', ev('__g.moveMult()'), '| energy', ev('__g.state.player.energy'), '| stamina', ev('__g.state.player.stamina'), '| collides east:', ev('__g.collides(__g.state.player.x + 2, __g.state.player.y, 10)'))
x0 = ev('__g.state.player.x'); pg.keyboard.down('d')
for k in range(5):
    pg.wait_for_timeout(200); print(k, round(ev('__g.state.player.x') - x0, 1), 'moving', ev('__g.state.player.moving'), 'kb', round(ev('__g.state.player.kbx'), 1))
pg.keyboard.up('d')

pg.wait_for_timeout(400)
ev('__g.state.player.x = 20*16+8; __g.state.player.y = 98*16+8'); pg.wait_for_timeout(300)
print('clear east:', not ev('__g.collides(__g.state.player.x + 30, __g.state.player.y, 10)'))
x0 = ev('__g.state.player.x'); pg.keyboard.down('d'); pg.wait_for_timeout(600); x1 = ev('__g.state.player.x'); pg.keyboard.up('d')
pg.wait_for_timeout(300); ev('__g.state.player.x = 20*16+8; __g.state.player.y = 98*16+8'); pg.wait_for_timeout(300)
x2 = ev('__g.state.player.x'); pg.keyboard.down('d'); pg.keyboard.down('Shift'); pg.wait_for_timeout(600); x3 = ev('__g.state.player.x'); stam = ev('__g.state.player.stamina'); pg.keyboard.up('Shift'); pg.keyboard.up('d')
print('walk 0.6s:', round(x1 - x0, 1), 'px | sprint 0.6s:', round(x3 - x2, 1), 'px | stamina', round(stam))
