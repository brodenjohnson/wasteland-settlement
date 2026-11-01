import json
ev = lambda s: pg.evaluate(s)
BX, BY = 28, 98
def tile_screen(tx, ty):
    p = json.loads(ev('JSON.stringify({x:__g.state.player.x,y:__g.state.player.y})'))
    return 550 + ((tx + 0.5) * 16 - p['x']) * 4, 350 + ((ty + 0.5) * 16 - p['y']) * 4
ev('__g.enemies.length = 0; __g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 })')
pg.mouse.click(400, 400); pg.wait_for_timeout(100)
# --- chop a tree: it should drop saplings; plant one; it should grow after 3 days ---
tree = json.loads(ev('JSON.stringify((()=>{ for (let r=6;r<22;r++) for (let a=0;a<360;a+=7){ const x=Math.round(%d+Math.cos(a*0.0175)*r), y=Math.round(%d+Math.sin(a*0.0175)*r); if (__g.objs[y*128+x]===1) return [x,y]; } return null; })())' % (BX, BY)))
print('tree:', tree)
tx, ty = tree
ev('__g.addItem("Rusty Hatchet",1)'); ai = ev('__g.state.player.inventory.findIndex(s=>s&&s.name==="Rusty Hatchet")'); pg.keyboard.press(str(ai + 1))
ev('__g.state.player.x=(%d+0.5)*16; __g.state.player.y=(%d+1.6)*16' % (tx, ty)); pg.wait_for_timeout(150)
x, y = tile_screen(tx, ty); pg.mouse.move(x, y); pg.wait_for_timeout(80); pg.mouse.down(); pg.wait_for_timeout(2500); pg.mouse.up(); pg.wait_for_timeout(200)
print('tree gone:', ev('__g.objs[%d]===0' % (ty * 128 + tx)), 'drops:', ev('JSON.stringify(__g.state.drops.map(d=>d.name+" "+d.qty))'))
ev('__g.state.player.y += 4'); pg.wait_for_timeout(600)
print('saplings in bag:', ev('(__g.state.player.inventory.find(s=>s&&s.name==="Sapling")||{}).qty'))
si = ev('__g.state.player.inventory.findIndex(s=>s&&s.name==="Sapling")')
if si >= 0:
    pg.keyboard.press(str(si + 1))
    x, y = tile_screen(tx, ty); pg.mouse.move(x, y); pg.wait_for_timeout(80); pg.mouse.down(); pg.wait_for_timeout(250); pg.mouse.up(); pg.wait_for_timeout(150)
    print('sapling planted:', ev('__g.saplings.size'))
    for d in range(3):
        ev('__g.state.gameMinutes = (Math.floor(__g.state.gameMinutes/1440)+1)*1440 - 0.5'); pg.wait_for_timeout(500)
    print('sapling after 3 nights ->', ev('__g.saplings.size'), 'tree object kind:', ev('__g.objs[%d]' % (ty * 128 + tx)))
# --- radiation storm ---
ev('__g.state.player.x=(%d+0.5)*16-20; __g.state.player.y=(%d+0.5)*16' % (BX + 6, BY + 8))
ev('__g.state.player.radiation = 0')
before = json.loads(ev('JSON.stringify({o:Array.from(__g.objs).filter(Boolean).length, t:Array.from(__g.objs).filter(v=>v===1||v===7||v===8).length, s:__g.structs.size})'))
ev('__g.state.storm = {phase:"active", t:0}; __g.state.stormI = 1')
pg.wait_for_timeout(4000)
print('storm: radRate outside a roof (valley, safe -1.0 baseline):', ev('__g.state.radRate.toFixed(2)'), 'radiation', ev('__g.state.player.radiation.toFixed(1)'))
pg.screenshot(path='out/storm.png')
# under a roof
ev('__g.roofs[%d*128+%d] = 1; __g.state.player.x=(%d+0.5)*16; __g.state.player.y=(%d+0.5)*16' % (BY + 8, BX + 6, BX + 6, BY + 8)); pg.wait_for_timeout(600)
print('under a roof radRate:', ev('__g.state.radRate.toFixed(2)'))
ev('__g.stormAftermath()'); pg.wait_for_timeout(200)
after = json.loads(ev('JSON.stringify({o:Array.from(__g.objs).filter(Boolean).length, t:Array.from(__g.objs).filter(v=>v===1||v===7||v===8).length, s:__g.structs.size})'))
print('objects before/after storm:', before, after)
# --- low health effect ---
ev('__g.state.storm = null; __g.state.stormI = 0; __g.state.player.health = 28'); pg.wait_for_timeout(900)
pg.screenshot(path='out/lowhp.png')
ev('__g.state.player.health = 55'); pg.wait_for_timeout(700)
pg.screenshot(path='out/midhp.png')
