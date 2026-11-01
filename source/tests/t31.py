import json
ev = lambda s: pg.evaluate(s)
BX, BY = 28, 98
def tile_screen(tx, ty):
    p = json.loads(ev('JSON.stringify({x:__g.state.player.x,y:__g.state.player.y})'))
    return 550 + ((tx + 0.5) * 16 - p['x']) * 4, 350 + ((ty + 0.5) * 16 - p['y']) * 4
ev('__g.enemies.length = 0; __g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 })')
# base: chest with food and seeds, two bunks
ev('__g.structs.set(%d*128+%d, {type:"chest", hp:90, slots:new Array(27).fill(null)})' % (BY - 1, BX - 3))
ev('__g.structs.set(%d*128+%d, {type:"bunk", hp:90, owner:null}); __g.structs.set(%d*128+%d, {type:"bunk", hp:90, owner:null})' % (BY + 2, BX - 4, BY + 3, BX - 2))
ev('const ch=[...__g.structs.values()].find(s=>s.type==="chest"); ch.slots[0]={name:"Canned food",qty:6}; ch.slots[1]={name:"Radish Seeds",qty:8}; ch.slots[2]={name:"Pistol rounds",qty:10}')
print('survivors found:', ev('JSON.stringify(__g.survivors.map(s=>[s.name, Math.round(s.x/16), Math.round(s.y/16)]))'))
# --- go talk to Marta at the outpost and recruit through the real UI ---
ev('const m=__g.survivors.find(s=>s.name==="Marta Voss"); __g.state.player.x=m.x-20; __g.state.player.y=m.y+6')
pg.wait_for_timeout(500)
m = json.loads(ev('JSON.stringify((()=>{const m=__g.survivors.find(s=>s.name==="Marta Voss"); return {x:m.x,y:m.y}})())'))
p = json.loads(ev('JSON.stringify({x:__g.state.player.x,y:__g.state.player.y})'))
sx, sy = 550 + (m['x'] - p['x']) * 4, 350 + (m['y'] - 10 - p['y']) * 4
pg.mouse.move(sx, sy); pg.wait_for_timeout(120)
print('hover label:', ev('document.title') and '')
pg.mouse.down(); pg.wait_for_timeout(120); pg.mouse.up(); pg.wait_for_timeout(300)
print('talk open:', ev('!!__g.state.talk'), '| line:', ev('__g.state.talk && __g.state.talk.name'))
pg.screenshot(path='out/talk.png')
rects = json.loads(ev('JSON.stringify(__g.state.uiRects)'))
print('buttons:', len(rects))
r = rects[2]; pg.mouse.click(r['x'] + r['w']/2, r['y'] + r['h']/2); pg.wait_for_timeout(300)   # Join my settlement
print('settlers:', ev('JSON.stringify(__g.settlers.map(s=>[s.name,s.job,s.state,s.bed]))'))
# --- she follows home, then works the farm ---
ev('const pl=__g.state.player; pl.x=%d*16+8; pl.y=%d*16+8' % (BX, BY))
# prepare 3 tilled tiles with crops, one ripe, plus an empty tilled tile for planting
for k, tx in enumerate((BX + 2, BX + 3, BX + 4)):
    ev('__g.tilled[%d*128+%d]=1' % (BY + 6, tx))
ev('__g.crops.set(%d*128+%d, {seed:"Radish Seeds", age:3}); __g.crops.set(%d*128+%d, {seed:"Radish Seeds", age:1})' % (BY + 6, BX + 2, BY + 6, BX + 3))
for k in range(30):
    pg.wait_for_timeout(1000)
    s = json.loads(ev('JSON.stringify(__g.settlers.map(s=>({st:s.state,task:s.task&&s.task.kind,x:Math.round(s.x/16),y:Math.round(s.y/16)})))'))
    if k % 5 == 0: print('t+%ds' % k, s, 'crops', ev('JSON.stringify([...__g.crops.entries()].map(([i,c])=>[i%128,Math.floor(i/128),c.age]))'))
chest = ev('JSON.stringify([...__g.structs.values()].find(s=>s.type==="chest").slots.filter(Boolean).map(s=>[s.name,s.qty]))')
print('chest now:', chest)
pg.screenshot(path='out/farm2.png')
