import json
ev = lambda s: pg.evaluate(s)
BX, BY = 28, 98
def tile_screen(tx, ty):
    p = json.loads(ev('JSON.stringify({x:__g.state.player.x,y:__g.state.player.y})'))
    return 550 + ((tx + 0.5) * 16 - p['x']) * 4, 350 + ((ty + 0.5) * 16 - p['y']) * 4
ev('__g.state.player.x = (%d+0.5)*16; __g.state.player.y = (%d+0.5)*16' % (BX, BY))
ev('__g.enemies.length = 0; __g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 })')
for n, q in [('Wood', 80), ('Scrap', 40), ('Stone', 10), ('Cloth', 10), ('Canned food', 6), ('Pistol rounds', 10)]: ev('__g.addItem("%s", %d)' % (n, q))
ev('__g.structs.set(%d*128+%d, {type:"workbench", hp:120})' % (BY - 2, BX + 3))
# open the build tab and screenshot
pg.keyboard.press('c'); pg.wait_for_timeout(250); pg.screenshot(path='out/build_tab.png')
pg.keyboard.press('c')
def place(rid, tx, ty):
    ev('__g.state.player.x = (%d+0.5)*16; __g.state.player.y = (%d+3.5)*16' % (tx, ty))
    ev('__g.state.placing = "%s"' % rid)
    x, y = tile_screen(tx, ty); pg.mouse.move(x, y); pg.wait_for_timeout(80); pg.mouse.click(x, y); pg.wait_for_timeout(120)
# a small walled yard east of camp with a gate, plus chest, two bunks, guard post and lamps
for tx in range(BX + 3, BX + 9): place('wall', tx, BY - 4)
for tx in (BX + 3, BX + 4, BX + 6, BX + 7, BX + 8): place('wall', tx, BY + 4)
place('gate', BX + 5, BY + 4)
place('chest', BX - 3, BY - 1); place('bunk', BX - 4, BY + 2); place('bunk', BX - 2, BY + 3)
place('guardpost', BX + 8, BY - 1); place('lamp', BX + 1, BY - 3); place('lamp', BX - 6, BY + 1)
print('structs:', ev('JSON.stringify([...__g.structs.values()].map(s=>s.type).reduce((a,t)=>(a[t]=(a[t]||0)+1,a),{}))'))
print('bunks free:', ev('!!__g.freeBed()'))
# gate: friendly walk-through vs enemy solidity
print('gate solid for friendly/enemy:', ev('__g.solidAt(%d,%d,true)' % (BX + 5, BY + 4)), ev('__g.solidAt(%d,%d,false)' % (BX + 5, BY + 4)))
ev('__g.state.player.x = (%d+0.5)*16; __g.state.player.y = (%d+0.5)*16' % (BX + 5, BY + 2))
pg.keyboard.down('s'); pg.wait_for_timeout(1200); pg.keyboard.up('s')
print('player walked south through the gate to tile y =', ev('Math.floor(__g.state.player.y/16)'), '(gate at', BY + 4, ')')
# the walled yard is closed except for the gate: path from inside to outside for enemies should fail through walls
ev('__g.state.player.x = (%d+0.5)*16; __g.state.player.y = (%d+0.5)*16' % (BX, BY))
pg.wait_for_timeout(300)
pg.screenshot(path='out/base1.png')
