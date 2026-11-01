import json
ev = lambda s: pg.evaluate(s)
def shot(n): pg.screenshot(path='out/%s.png' % n)
pg.wait_for_timeout(1500)
ev('__g.newCharacter()'); pg.wait_for_timeout(300)
ev('__g.state.creating.name = "Tess"'); ev('__g.beginGame()'); pg.wait_for_timeout(1200)
ev('Object.assign(__g.state.qflags, {storyInit:true, sitesPlaced:true, spawnVar:true, "read:Folded Note":true}); __g.state.intro = null; __g.state.reading = null')
ev('__g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 }); __g.enemies.length = 0')
print('start: bag =', ev('JSON.stringify(__g.state.player.inventory.slice(0,6).map(s=>s&&s.name))'), '| bedroll structs:', ev('[...__g.structs.values()].filter(s=>s.type==="bedroll").length'), '| hearth:', ev('__g.state.hearth'))
ox, oy = ev('__g.ORIGIN.x'), ev('__g.ORIGIN.y')
ring = ev('(()=>{ let c=0; for (let y=%d-34;y<=%d+34;y++) for (let x=%d-34;x<=%d+34;x++){ const d=Math.hypot(x-%d,y-%d); if (d>23&&d<33 && __g.tiles[y*128+x]===7) c++; } return c; })()' % (oy, oy, ox, ox, ox, oy))
print('cliff tiles where the valley wall used to be:', ring)
pg.wait_for_timeout(1500)
print('radiation rate standing at the start (no hearth yet):', round(ev('__g.state.radRate'), 2))
# place the bedroll kit by real clicks, a few tiles from the player
ki = ev('__g.state.player.inventory.findIndex(s=>s&&s.name==="Kit: Bedroll")'); pg.keyboard.press(str(ki + 1)); pg.wait_for_timeout(200)
px, py = ev('__g.state.player.x'), ev('__g.state.player.y')
tx, ty = int(px // 16) + 3, int(py // 16)
sx, sy = 550 + ((tx + 0.5) * 16 - px) * 4, 350 + ((ty + 0.5) * 16 - py) * 4
for _ in range(3):
    pg.mouse.move(sx, sy); pg.wait_for_timeout(150); pg.mouse.click(sx, sy); pg.wait_for_timeout(500)
    if ev('[...__g.structs.values()].some(s=>s.type==="bedroll")'): break
pg.wait_for_timeout(800)
print('bedroll placed:', ev('[...__g.structs.values()].some(s=>s.type==="bedroll")'), '| hearth:', ev('JSON.stringify(__g.state.hearth)'), '| camp radius:', ev('__g.CAMP.r'), '| BASE now', ev('JSON.stringify([__g.ORIGIN.x, __g.ORIGIN.y])'), '->', ev('JSON.stringify(__g.state.hearth && [__g.state.hearth.x, __g.state.hearth.y])'))
ev('__g.state.player.x = (__g.state.hearth.x + 3) * 16; __g.state.player.y = __g.state.hearth.y * 16'); pg.wait_for_timeout(800)
print('rad rate inside the zone:', round(ev('__g.state.radRate'), 2))
ev('__g.state.player.x = (__g.state.hearth.x + 11) * 16'); pg.wait_for_timeout(800)
print('rad rate 11 tiles out (just outside the level 1 zone):', round(ev('__g.state.radRate'), 2))
ev('__g.state.player.x = (__g.state.hearth.x + 3) * 16'); pg.wait_for_timeout(600); shot('c_camp1')
# the zone grows with the camp
ev('__g.state.settleLvl = 3'); pg.wait_for_timeout(900)
print('camp radius at level 3:', ev('__g.CAMP.r'), '| 11 tiles out is now inside?', ev('__g.inCampTile(__g.state.hearth.i + 11)'))
# move the hearth far away: remove it and place another bedroll
far = int(ev('__g.state.hearth.x')) + 25
ev('__g.structs.delete(__g.state.hearth.i); __g.structs.set(%d*128+%d, __g.newStruct("bedroll"))' % (ev('__g.state.hearth.y'), far)); pg.wait_for_timeout(900)
print('hearth moved to x:', ev('__g.state.hearth.x'), '| BASE.x:', ev('JSON.stringify(__g.ORIGIN)'), '| zone active:', ev('__g.CAMP.active'))
