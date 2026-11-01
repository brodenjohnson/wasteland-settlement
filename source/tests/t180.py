import json
ev = lambda s: pg.evaluate(s)
def shot(n): pg.screenshot(path='out/%s.png' % n)
ev('__g.state.placing = null; __g.enemies.length = 0; __g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 })')
spot = json.loads(ev('''JSON.stringify((()=>{ for (let r=0;r<30;r++) for (let dy=-r;dy<=r;dy++) for (let dx=-r;dx<=r;dx++){ const x=(60+dx)*16+8, y=(60+dy)*16+8; let ok=true; for (let k=-6;k<=6;k++) for (let j=-5;j<=5;j++) if (__g.collides(x+k*16, y+j*16, 10, true)) ok=false; if (ok) return [x,y]; } })())'''))
tx, ty = int(spot[0] // 16), int(spot[1] // 16)
ev('__g.state.player.x = %d; __g.state.player.y = %d' % tuple(spot))
print('crops:', ev('JSON.stringify(Object.entries(__g.CROPS).map(([k,c])=>c.produce+" T"+c.tier+" L"+c.lvl))'))
print('cooking recipes:', ev('__g.RECIPES.filter(r=>r.cat==="Cooking").length'), '| rack/sprinkler/buried:', ev('JSON.stringify(["rack","sprinkler","pipe_buried","floor_tile","floor_concrete","floor_carpet","roof_thatch"].map(id=>!!__g.RECIPES.find(r=>r.id===id)))'))
print('farming level now:', ev('__g.skillLevel("farming")'))
# planting a level 5 crop at level 1
ev('__g.tilled[%d*128+%d] = 1; __g.addItem("Pumpkin Seeds", 2)' % (ty - 2, tx)); mi = ev('__g.state.player.inventory.findIndex(s=>s&&s.name==="Pumpkin Seeds")'); pg.keyboard.press(str(mi + 1)); ev('__g.state.player.inventory[%d]' % mi)
def sc(x2, y2): return 550 + ((x2 + 0.5) * 16 - spot[0]) * 4, 350 + ((y2 + 0.5) * 16 - spot[1]) * 4
x, y = sc(tx, ty - 2); pg.mouse.move(x, y); pg.wait_for_timeout(200); pg.mouse.down(); pg.wait_for_timeout(450); pg.mouse.up(); pg.wait_for_timeout(300)
print('pumpkin at level 1 planted?', ev('__g.crops.has(%d*128+%d)' % (ty - 2, tx)), '(should be False)')
ev('__g.skillXp("farming", 99999)'); pg.wait_for_timeout(300); print('farming level after boost:', ev('__g.skillLevel("farming")'))
pg.mouse.down(); pg.wait_for_timeout(450); pg.mouse.up(); pg.wait_for_timeout(300)
print('pumpkin planted at level 5+:', ev('__g.crops.has(%d*128+%d)' % (ty - 2, tx)))
ev('__g.crops.get(%d*128+%d).age = 9' % (ty - 2, tx)); ev('__g.state.player.inventory.fill(null)')
pg.keyboard.press('1'); pg.wait_for_timeout(150); pg.mouse.down(); pg.wait_for_timeout(700); pg.mouse.up(); pg.wait_for_timeout(300)
print('harvest: pumpkins in bag', ev('__g.countItem("Pumpkin")'), '(base yield 2, plus perks) | seeds', ev('__g.countItem("Pumpkin Seeds")'))
print('farm value perk at level 8+: Pumpkin sells for', ev('__g.itemValue("Pumpkin")'), '(base 22)')
# irrigation: purifier ... buried pipe under a wall ... sprinkler, with tilled soil around it
ev('__g.structs.set(%d*128+%d, __g.newStruct("purifier"))' % (ty + 3, tx - 5))
for x2 in range(tx - 4, tx + 1): ev('__g.buried[%d*128+%d] = 1' % (ty + 3, x2))
ev('__g.structs.set(%d*128+%d, __g.newStruct("wall"))' % (ty + 3, tx - 2))     # a wall sitting on top of the buried pipe
ev('__g.structs.set(%d*128+%d, __g.newStruct("sprinkler"))' % (ty + 3, tx + 1)); ev('__g.buried[%d*128+%d] = 1' % (ty + 3, tx + 1))
for dx in range(-2, 4):
    for dy in (1, 2, 4, 5): ev('__g.tilled[%d*128+%d] = 1' % (ty + dy, tx + dx))
print('sprinkler connected through the wall:', ev('__g.sinkConnected(%d*128+%d)' % (ty + 3, tx + 1)))
ev('__g.wet.fill(0)'); ev('__g.runSprinklers(2)'); pg.wait_for_timeout(300)
print('tiles watered by the sprinkler:', ev('(()=>{ let n=0; for (let dy=-4;dy<=4;dy++) for (let dx=-4;dx<=4;dx++) if (__g.wet[(%d+dy)*128+%d+dx]) n++; return n; })()' % (ty + 3, tx + 1)))
ev('__g.structs.delete(%d*128+%d)' % (ty + 3, tx - 2))
print('connection when the pipe is cut (a gap in the buried line):', end=' '); ev('__g.buried[%d*128+%d] = 0' % (ty + 3, tx - 3)); print(ev('__g.sinkConnected(%d*128+%d)' % (ty + 3, tx + 1))); ev('__g.buried[%d*128+%d] = 1' % (ty + 3, tx - 3))
# floors and roof kinds
for k, f in enumerate((3, 4, 5, 1, 2)): ev('__g.floors[%d*128+%d] = %d' % (ty - 4, tx - 2 + k, f))
for k in range(3): ev('__g.roofs[%d*128+%d] = 3' % (ty - 5, tx - 1 + k))
pg.wait_for_timeout(400); shot('f_build')
# drying rack
ev('__g.structs.set(%d*128+%d, __g.newStruct("rack"))' % (ty, tx + 3)); ev('__g.addItem("Raw Meat", 4)')
print('rack in reach:', ev('__g.stationNear("rack")'), '| can craft jerky:', ev('!!__g.RECIPES.find(r=>r.id==="cook_jerky")'))
