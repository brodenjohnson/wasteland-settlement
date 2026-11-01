import json
ev = lambda s: pg.evaluate(s)
def slot(name): return ev("__g.state.player.inventory.findIndex(s=>s&&s.name==='%s')" % name)
def hold(x, y, ms):
    pg.mouse.move(x, y); pg.wait_for_timeout(60); pg.mouse.down(); pg.wait_for_timeout(ms); pg.mouse.up(); pg.wait_for_timeout(80)
pg.keyboard.press('h'); pg.wait_for_timeout(100)
print('ambient enemies:', ev('__g.enemies.length'), 'spawn pts', ev('__g.state.spawnPts.length'))
# wipe ambient to isolate the test
ev('__g.enemies.length = 0; __g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 })')
p = json.loads(ev('JSON.stringify({x:__g.state.player.x,y:__g.state.player.y})'))
e = json.loads(ev('JSON.stringify((()=>{const e=__g.spawnEnemy("glowrat", %f, %f, {raid:true}); return {id:e.id}})())' % (p['x'] + 40, p['y'])))
pg.keyboard.press(str(slot('Rusty Pipe') + 1))
for k in range(8):
    hold(550 + 20*3, 350, 300)
    print('t', k, ev('JSON.stringify(__g.enemies.map(e=>[e.type,Math.round(e.x-__g.state.player.x),Math.round(e.y-__g.state.player.y),Math.round(e.hp)]))'), 'hp', ev('Math.round(__g.state.player.health)'))
    if ev('__g.enemies.length') == 0: break
print('xp', ev('__g.state.player.xp'), 'drops', ev('JSON.stringify(__g.state.drops.map(d=>[d.name,d.qty]))'))
# pistol on a raid hound at range
ev('__g.spawnEnemy("hound", %f, %f, {raid:true})' % (p['x'] - 90, p['y']))
pg.keyboard.press(str(slot('Pipe Pistol') + 1))
for k in range(6):
    hold(550 - 60*3, 350, 450)
    print('p', k, ev('JSON.stringify(__g.enemies.map(e=>[e.type,Math.round(e.x-__g.state.player.x),Math.round(e.y-__g.state.player.y),Math.round(e.hp)]))'), 'hp', ev('Math.round(__g.state.player.health)'), 'rounds', ev("__g.state.player.inventory.filter(s=>s&&s.name==='Pistol rounds').reduce((a,s)=>a+s.qty,0)"))
    if ev('__g.enemies.length') == 0: break
