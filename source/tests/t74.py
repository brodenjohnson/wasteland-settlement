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
ev("__g.state.settleLvl = 4"); ev('__g.skillXp("crafting", 20000)'); print('crafting level:', ev('__g.skillLevel("crafting")'))
for n, q in [('Wood', 80), ('Scrap', 80), ('Stone', 40), ('Metal plate', 40), ('Empty Bottle', 3)]: ev('__g.addItem("%s", %d)' % (n, q))
for rid in ['pipe', 'pipe', 'pipe', 'pipe', 'sink', 'wall', 'wall', 'wall']: ev('__g.craftKit(__g.RECIPES.find(r=>r.id==="%s"))' % rid)
print('kits:', ev('JSON.stringify(__g.state.player.inventory.filter(s=>s&&/^Kit/.test(s.name)).map(s=>s.name+" x"+s.qty))'))
# kit placement from the hotbar: far from any workbench
ev('__g.state.player.x = 60*16; __g.state.player.y = 100*16'); pg.wait_for_timeout(200)
wi = ev('__g.state.player.inventory.findIndex(s=>s&&s.name==="Kit: Wooden Wall")'); pg.keyboard.press(str(wi + 1)); pg.wait_for_timeout(300)
print('placing armed by selecting the kit:', ev('__g.state.placing'))
for k in range(3): click_tile(60 + k, 98)
print('walls placed away from base:', ev('[...__g.structs.values()].filter(s=>s.type==="wall").length'), '| kits left:', ev('(__g.state.player.inventory.find(s=>s&&s.name==="Kit: Wooden Wall")||{qty:0}).qty'), '| placing now:', ev('__g.state.placing'))
ev('__g.state.pauseOpen = false'); pg.wait_for_timeout(200)
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
ki = ev('__g.state.player.inventory.findIndex(s=>s&&s.name==="Kit: Pipe")'); pg.keyboard.press(str(ki + 1)); pg.wait_for_timeout(200)
for tx, ty in pipes: click_tile(tx, ty)
print('pipes placed:', ev('[...__g.structs.values()].filter(s=>s.type==="pipe").length'))
ev('__g.state.placing = null; __g.state.pauseOpen = false'); pg.wait_for_timeout(100)
si = ev('__g.state.player.inventory.findIndex(s=>s&&s.name==="Kit: Sink")'); pg.keyboard.press(str(si + 1)); pg.wait_for_timeout(200)
click_tile(spot[0] + 1, pipes[-1][1])
print('sink placed:', ev('[...__g.structs.entries()].filter(([i,s])=>s.type==="sink").length'))
sink = ev('[...__g.structs.entries()].find(([i,s])=>s.type==="sink")[0]')
print('sink connected to purifier:', ev('__g.sinkConnected(%d)' % sink))
# fill a bottle at the sink
bi = ev('__g.state.player.inventory.findIndex(s=>s&&s.name==="Empty Bottle")'); pg.keyboard.press(str(bi + 1))
ev('__g.state.player.x=(%d+0.5)*16; __g.state.player.y=(%d+1.5)*16' % (sink % 128 + 0, sink // 128 + 1)); pg.wait_for_timeout(200)
x, y = tile_screen(sink % 128, sink // 128); pg.mouse.move(x, y); pg.wait_for_timeout(100); pg.mouse.down(); pg.wait_for_timeout(300); pg.mouse.up(); pg.wait_for_timeout(200)
print('bottles:', ev('JSON.stringify(__g.state.player.inventory.filter(s=>s&&/Bottle|Water/.test(s.name)).map(s=>s.name+" x"+s.qty))'))
# an unconnected sink should refuse
ev('__g.structs.delete(%d*128+%d)' % (pipes[1][1], pipes[1][0]))
print('after cutting a pipe, connected:', ev('__g.sinkConnected(%d)' % sink))
ev('__g.state.player.x=(%d+0.5)*16; __g.state.player.y=(%d+3.0)*16' % (spot[0], spot[1])); pg.wait_for_timeout(500)
shot('plumb')
