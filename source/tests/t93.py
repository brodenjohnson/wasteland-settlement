import json
ev = lambda s: pg.evaluate(s)
BX, BY = 28, 98
def shot(n): pg.screenshot(path='out/%s.png' % n)
ev('__g.state.title = false'); ev('Object.assign(__g.state.qflags, {storyInit:true, sitesPlaced:true, "read:Folded Note":true}); __g.state.intro = null; __g.state.reading = null')
ev('__g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 }); __g.enemies.length = 0')
pg.wait_for_timeout(1200)
# buffs: eat food
ev('__g.addItem("Fish Stew", 1); __g.addItem("Raw Fish", 2); __g.addItem("Roast Meat", 1)')
ev('__g.state.player.food = 20; __g.state.player.radiation = 0')
for nm in ['Fish Stew', 'Raw Fish', 'Roast Meat']:
    idx = ev('__g.state.player.inventory.findIndex(s=>s&&s.name==="%s")' % nm)
    hb = idx + 1 if idx < 9 else None
    if hb: pg.keyboard.press(str(hb)); pg.mouse.click(550, 200, button='right'); pg.wait_for_timeout(250)
print('buffs:', ev('JSON.stringify(__g.state.buffs.map(b=>b.id))'), '| rad after raw fish:', round(ev('__g.state.player.radiation'), 1), '| radRes', ev('__g.buffFx("radRes")'), 'stamRegen', ev('__g.buffFx("stamRegen")'), 'dmg', ev('__g.buffFx("dmg")'))
# settlement level
print('level before:', ev('__g.settlementLabel()'))
for a in range(4): ev('__g.structs.set(%d*128+%d, {type:"bunk", hp:90, rot:0, owner:null})' % (BY + 3, BX - 6 + a * 2))
ev('__g.structs.set(%d*128+%d, {type:"guardpost", hp:240, rot:0}); __g.structs.set(%d*128+%d, {type:"guardpost", hp:240, rot:0}); __g.structs.set(%d*128+%d, {type:"chest", hp:90, rot:0, slots:new Array(27).fill(null)})' % (BY - 3, BX + 6, BY - 3, BX - 6, BY - 2, BX + 2))
for i in range(3): ev('(()=>{ const s=__g.survivors.filter(q=>!q.wounded)[0]; __g.recruit(s); })()')
pg.wait_for_timeout(2500)
print('level after beds, towers and settlers:', ev('__g.settlementLabel()'), '| stove gated?', ev('JSON.stringify(__g.RECIPES.find(r=>r.id==="stove") && [__g.recipeStatus(__g.RECIPES.find(r=>r.id==="stove")).why])'))
# markers
print('rumours:', ev('JSON.stringify(__g.state.markers.map(m=>[m.kind,m.revealed,m.label]))'))
pg.keyboard.press('m'); pg.wait_for_timeout(400)
pg.mouse.click(520, 330); pg.wait_for_timeout(300)
print('markers after a map click:', ev('JSON.stringify(__g.state.markers.map(m=>[m.kind,m.label,m.tracked]))'), '| compass target:', ev('JSON.stringify(__g.compassTarget())'))
shot('b_map')
pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
# reveal a rumour by walking to it
mk = json.loads(ev('JSON.stringify(__g.state.markers.find(m=>m.kind==="rumour"))'))
ev('__g.state.player.x = %f*16; __g.state.player.y = %f*16' % (mk['poi']['x'] + 4, mk['poi']['y'])); pg.wait_for_timeout(1500)
print('rumour after arriving:', ev('JSON.stringify(__g.state.markers.find(m=>m.kind==="rumour"&&m.revealed))'))
ev('__g.state.player.x=%d*16; __g.state.player.y=%d*16' % (BX, BY)); pg.wait_for_timeout(800)
shot('b_hud')
