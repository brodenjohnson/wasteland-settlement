import json
ev = lambda s: pg.evaluate(s)
BX, BY = 28, 98
def tile_screen(tx, ty):
    p = json.loads(ev('JSON.stringify({x:__g.state.player.x,y:__g.state.player.y})'))
    return 550 + ((tx + 0.5) * 16 - p['x']) * 4, 350 + ((ty + 0.5) * 16 - p['y']) * 4
def click_tile(tx, ty):
    ev('__g.state.player.x=(%d+0.5)*16; __g.state.player.y=(%d+3.5)*16' % (tx, ty))
    pg.wait_for_timeout(40)
    x, y = tile_screen(tx, ty); pg.mouse.move(x, y); pg.wait_for_timeout(60); pg.mouse.click(x, y); pg.wait_for_timeout(100)
ev('__g.enemies.length = 0; __g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 })')
pg.mouse.click(400, 400); pg.wait_for_timeout(200)
print('audio context created:', ev('!!__g.AUD.ac'), ev('__g.AUD.ac && __g.AUD.ac.state'))
# 1. water source near the start
ev('__g.state.player.x=(%d+4)*16; __g.state.player.y=(%d-3)*16' % (BX, BY)); pg.wait_for_timeout(500)
pg.screenshot(path='out/valley_water.png')
water = ev('(()=>{let n=0; for(let y=%d-12;y<=%d+12;y++) for(let x=%d-14;x<=%d+14;x++){ const t=__g.tiles[y*128+x]; if(t===2||t===6) n++; } return n;})()' % (BY, BY, BX, BX))
print('water tiles within 14 tiles of the bedroll:', water)
# 2. storage-fed crafting: wood and scrap only in a chest, empty bag
ev('__g.state.player.x=(%d+0.5)*16; __g.state.player.y=(%d+0.5)*16' % (BX, BY))
ev('__g.state.player.inventory.fill(null)')
ev('__g.structs.set(%d*128+%d, {type:"chest", hp:90, rot:0, slots:new Array(27).fill(null)})' % (BY - 2, BX - 3))
ev('const ch=[...__g.structs.values()].find(s=>s.type==="chest"); ch.slots[0]={name:"Wood",qty:50}; ch.slots[3]={name:"Wood",qty:50}; ch.slots[4]={name:"Wood",qty:50}; ch.slots[5]={name:"Wood",qty:50}; ch.slots[6]={name:"Cloth",qty:20}; ch.slots[1]={name:"Scrap",qty:30}; ch.slots[2]={name:"Stone",qty:10}')
print('count Wood with empty bag in valley:', ev('__g.countItem("Wood")'))
pg.keyboard.press('c'); pg.wait_for_timeout(250)
rects = json.loads(ev('JSON.stringify(__g.state.uiRects)'))
print('craft tabs:', ev('JSON.stringify(__g.CONFIG && 0)') and '', len([r for r in rects]))
r = rects[6]; pg.mouse.click(r['x'] + r['w']/2, r['y'] + r['h']/2); pg.wait_for_timeout(150)   # row 0 = Workbench
print('placing:', ev('__g.state.placing'))
click_tile(BX + 2, BY + 1)
print('workbench built from chest materials:', ev('[...__g.structs.values()].some(s=>s.type==="workbench")'), 'wood left in chests:', ev('__g.chestCount("Wood")'))
print('away from base, count Wood:', (ev('__g.state.player.x = 5*16; __g.state.player.y = 5*16'), ev('__g.countItem("Wood")'))[1])
ev('__g.state.player.x=(%d+0.5)*16; __g.state.player.y=(%d+0.5)*16' % (BX, BY))
# 3. walls with drag-placing, a rotated bunk and a roof over a small room
ev('__g.state.player.x=(%d+0.5)*16; __g.state.player.y=(%d+5.5)*16' % (BX, BY))
ev('__g.state.placing = "floor_wood"')
for tx in range(BX - 1, BX + 4):
    for ty in range(BY + 1, BY + 4): ev('__g.state.placing = "floor_wood"'), click_tile(tx, ty)
for tx in range(BX - 2, BX + 5): ev('__g.state.placing = "wall"'), click_tile(tx, BY)
for tx in range(BX - 2, BX + 5): ev('__g.state.placing = "wall"'), click_tile(tx, BY + 4)
for ty in range(BY + 1, BY + 4): ev('__g.state.placing = "wall"'), click_tile(BX - 2, ty), ev('__g.state.placing = "wall"'), click_tile(BX + 4, ty)
ev('__g.state.placing = "bunk"; __g.state.placeRot = 2'); click_tile(BX, BY + 1)
ev('__g.state.placing = "bunk"; __g.state.placeRot = 3'); click_tile(BX + 2, BY + 1)
for tx in range(BX - 2, BX + 5):
    for ty in range(BY, BY + 5): ev('__g.state.placing = "roof_wood"'), click_tile(tx, ty)
print('floors/roofs/structs:', ev('[__g.floors.filter(Boolean).length, __g.roofs.filter(Boolean).length, __g.structs.size]'))
pg.keyboard.press('Escape')
ev('__g.state.player.x=(%d+5.5)*16; __g.state.player.y=(%d+6.5)*16' % (BX, BY)); pg.wait_for_timeout(700)
pg.screenshot(path='out/room_roof_on.png')
ev('__g.state.player.x=(%d+1.5)*16; __g.state.player.y=(%d+2.5)*16' % (BX, BY)); pg.wait_for_timeout(900)
pg.screenshot(path='out/room_inside.png')
