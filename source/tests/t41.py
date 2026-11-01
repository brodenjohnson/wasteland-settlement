import json
ev = lambda s: pg.evaluate(s)
BX, BY = 28, 98
def tile_screen(tx, ty):
    p = json.loads(ev('JSON.stringify({x:__g.state.player.x,y:__g.state.player.y})'))
    return 550 + ((tx + 0.5) * 16 - p['x']) * 4, 350 + ((ty + 0.5) * 16 - p['y']) * 4
def click_tile(tx, ty):
    x, y = tile_screen(tx, ty); pg.mouse.move(x, y); pg.wait_for_timeout(70); pg.mouse.click(x, y); pg.wait_for_timeout(120)
ev('__g.enemies.length = 0; __g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 })')
pg.mouse.click(400, 400); pg.wait_for_timeout(100)
for n, q in [('Metal plate', 10), ('Scrap', 40), ('Stone', 10), ('Wood', 40)]: ev('__g.addItem("%s", %d)' % (n, q))
ev('__g.state.unlocked.add("forge"); __g.state.unlocked.add("ironwork")')
ev('__g.structs.set(%d*128+%d, {type:"workbench", hp:120, rot:0}); __g.structs.set(%d*128+%d, {type:"forge", hp:160, rot:0})' % (BY, BX + 2, BY + 1, BX + 2))
# find the valley pond
pond = ev('(()=>{ for(let y=%d-12;y<=%d+4;y++) for(let x=%d;x<=%d+16;x++){ if(__g.tiles[y*128+x]===6) return [x,y]; } return null; })()' % (BY, BY, BX, BX))
print('pond tile:', pond)
px, py = pond
# purifier far from water must be rejected, next to water accepted
ev('__g.state.player.x=(%d+0.5)*16; __g.state.player.y=(%d+0.5)*16' % (BX + 2, BY + 4))
ev('__g.state.placing="purifier"'); click_tile(BX + 2, BY + 6)
print('purifier away from water placed?', ev('[...__g.structs.values()].some(s=>s.type==="purifier")'), '| toast:', ev('__g.state.msg'))
ev('__g.state.player.x=(%d+0.5)*16; __g.state.player.y=(%d+6.5)*16' % (px, py))
ev('__g.state.placing="purifier"'); spot = None
for dx, dy in [(0, 4), (1, 4), (-1, 4), (3, 3), (-3, 3), (0, -4), (4, 0), (-4, 0)]:
    if ev('__g.placeValid(%d,%d)' % (px + dx, py + dy)): spot = (px + dx, py + dy); break
print('valid purifier spot beside the pond:', spot)
if spot: click_tile(*spot)
print('purifier placed next to water:', ev('[...__g.structs.values()].some(s=>s.type==="purifier")'))
# bottles: craft, fill at spring and purifier, drink
ev('__g.addItem("Empty Bottle", 3)')
bi = ev('__g.state.player.inventory.findIndex(s=>s&&s.name==="Empty Bottle")')
pg.keyboard.press(str(bi + 1))
ev('__g.state.player.x=(%d+0.5)*16; __g.state.player.y=(%d+2.5)*16' % (px, py))
pg.wait_for_timeout(100)
x, y = tile_screen(px, py); pg.mouse.move(x, y); pg.wait_for_timeout(80); pg.mouse.down(); pg.wait_for_timeout(250); pg.mouse.up(); pg.wait_for_timeout(150)
inv = lambda: ev('JSON.stringify(__g.state.player.inventory.filter(Boolean).map(s=>s.name+" x"+s.qty).filter(n=>/Bottle|Water/.test(n)))')
print('after filling at the spring:', inv())
pur = [(i % 128, i // 128) for i, s in json.loads(ev('JSON.stringify([...__g.structs.entries()].map(([i,s])=>[i,s.type]))')) if s == 'purifier']
if pur:
    ev('__g.state.player.x=(%d+0.5)*16; __g.state.player.y=(%d+1.5)*16' % pur[0])
    pg.keyboard.press(str(bi + 1)); pg.wait_for_timeout(100)
    x, y = tile_screen(*pur[0]); pg.mouse.move(x, y); pg.wait_for_timeout(80); pg.mouse.down(); pg.wait_for_timeout(250); pg.mouse.up(); pg.wait_for_timeout(150)
    print('after filling at the purifier:', inv())
wi = ev('__g.state.player.inventory.findIndex(s=>s&&s.name==="Purified Water")')
ev('__g.state.player.water = 20; __g.state.player.radiation = 10')
pg.keyboard.press(str(wi + 1)); pg.mouse.click(550, 200, button='right'); pg.wait_for_timeout(150)
print('drank purified water: water', ev('Math.round(__g.state.player.water)'), 'rad', ev('__g.state.player.radiation'), '| bottles now:', inv())
