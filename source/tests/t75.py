import json
ev = lambda s: pg.evaluate(s)
BX, BY = 28, 98
def shot(n): pg.screenshot(path='out/%s.png' % n)
def tile_screen(tx, ty):
    p = json.loads(ev('JSON.stringify({x:__g.state.player.x,y:__g.state.player.y})'))
    return 550 + ((tx + 0.5) * 16 - p['x']) * 4, 350 + ((ty + 0.5) * 16 - p['y']) * 4
def click_tile(tx, ty):
    ev('__g.state.player.x=(%d+0.5)*16; __g.state.player.y=(%d+2.5)*16' % (tx, ty)); pg.wait_for_timeout(60)
    x, y = tile_screen(tx, ty); pg.mouse.move(x, y); pg.wait_for_timeout(80); pg.mouse.click(x, y); pg.wait_for_timeout(120)
ev('__g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 }); __g.enemies.length = 0')
ev('__g.state.title = false'); ev('__g.state.qflags.storyInit = true; __g.state.qflags.sitesPlaced = true; __g.state.qflags["read:Folded Note"] = true; __g.state.intro = null')
pg.wait_for_timeout(300)
ev('__g.skillXp("crafting", 20000)'); print('crafting level:', ev('__g.skillLevel("crafting")'))
for n, q in [('Wood', 80), ('Scrap', 80), ('Stone', 40), ('Metal plate', 40), ('Empty Bottle', 3)]: ev('__g.addItem("%s", %d)' % (n, q))
for rid in ['pipe', 'pipe', 'pipe', 'pipe', 'sink', 'wall', 'wall', 'wall']: ev('__g.craftKit(__g.RECIPES.find(r=>r.id==="%s"))' % rid)
print('kits:', ev('JSON.stringify(__g.state.player.inventory.filter(s=>s&&/^Kit/.test(s.name)).map(s=>s.name+" x"+s.qty))'))
# kit placement from the hotbar: far from any workbench
ev('__g.state.player.x = 60*16; __g.state.player.y = 100*16'); pg.wait_for_timeout(200)
wi = ev('__g.state.player.inventory.findIndex(s=>s&&s.name==="Kit: Wooden Wall")'); pg.keyboard.press(str(wi + 1)); pg.wait_for_timeout(300)
print('placing armed by selecting the kit:', ev('__g.state.placing'))
for k in range(3): click_tile(60 + k, 98)
print('walls placed away from base:', ev('[...__g.structs.values()].filter(s=>s.type==="wall").length'), '| kits left:', ev('(__g.state.player.inventory.find(s=>s&&s.name==="Kit: Wooden Wall")||{qty:0}).qty'), '| placing now:', ev('__g.state.placing'))
pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
print('after Esc placing:', ev('__g.state.placing'), '(stays off while still selected)')
# plumbing at the valley pond
pond = ev('(()=>{ for(let y=%d-12;y<=%d+4;y++) for(let x=%d;x<=%d+16;x++){ if(__g.tiles[y*128+x]===6) return [x,y]; } return null; })()' % (BY, BY, BX, BX))
px, py = pond; print('pond at', pond)
spot = None
for dx, dy in [(0, 4), (1, 4), (-1, 4), (3, 3), (-3, 3), (0, -4), (4, 0), (-4, 0)]:
    ev('__g.state.placing = "purifier"; __g.state.player.x=(%d+0.5)*16; __g.state.player.y=(%d+3.5)*16' % (px + dx, py + dy))
    if ev('__g.placeValid(%d,%d)' % (px + dx, py + dy)): spot = (px + dx, py + dy); break
ev('__g.state.placing = null')
print('purifier spot', spot)
ev('__g.structs.set(%d*128+%d, {type:"purifier", hp:100, rot:0})' % (spot[1], spot[0]))
pipes = [(spot[0], spot[1] + 1 + k) for k in range(4)]
ki = ev('__g.state.player.inventory.findIndex(s=>s&&s.name==="Kit: Pipe")'); print('pipe kit slot', ki)
pg.keyboard.press(str(ki + 1)); pg.wait_for_timeout(300)
print('placing:', ev('__g.state.placing'), '| kitSlot', ev('__g.state.kitSlot'), '| sel', ev('__g.state.sel'), '| menu', ev('__g.anyMenuOpen()'), '| hold', ev('__g.state.kitHold'))
tx, ty = pipes[0]
ev('__g.state.player.x=(%d+0.5)*16; __g.state.player.y=(%d+2.5)*16' % (tx, ty)); pg.wait_for_timeout(100)
x, y = tile_screen(tx, ty); pg.mouse.move(x, y); pg.wait_for_timeout(150)
print('mouse tile', ev('[Math.floor(__g.state.mwx/16), Math.floor(__g.state.mwy/16)]'), 'target', [tx, ty], '| valid', ev('__g.placeValid(%d,%d)' % (tx, ty)), '| obj', ev('__g.objs[%d*128+%d]' % (ty, tx)), '| tile', ev('__g.tiles[%d*128+%d]' % (ty, tx)))
