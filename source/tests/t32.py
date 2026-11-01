import json
ev = lambda s: pg.evaluate(s)
BX, BY = 28, 98
ev('__g.enemies.length = 0; __g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 })')
ev('__g.structs.set(%d*128+%d, {type:"chest", hp:90, slots:new Array(27).fill(null)})' % (BY - 1, BX - 3))
for k in range(3): ev('__g.structs.set(%d*128+%d, {type:"bunk", hp:90, owner:null})' % (BY + 3, BX - 6 + k * 2))
ev('const ch=[...__g.structs.values()].find(s=>s.type==="chest"); ch.slots[0]={name:"Canned food",qty:4}; ch.slots[1]={name:"Pistol rounds",qty:12}')
# recruit three survivors directly
for nm in ['Dex Harlan', 'Ripley Cho', 'Marta Voss']:
    ev('__g.recruit(__g.survivors.find(s=>s.name==="%s"))' % nm)
ev('__g.settlers.forEach((s,k)=>{ s.state="home"; s.x=(%d+k*2)*16; s.y=%d*16; })' % (BX, BY))
ev('__g.settlers.find(s=>s.name==="Dex Harlan").job="Hauler"; __g.settlers.find(s=>s.name==="Ripley Cho").job="Guard"; __g.settlers.find(s=>s.name==="Marta Voss").job="Idle"')
ev('__g.state.player.x=%d*16; __g.state.player.y=%d*16' % (BX - 4, BY))
print('settlers:', ev('JSON.stringify(__g.settlers.map(s=>[s.name,s.job,s.skills]))'))
# hauler gathers valley resources into the chest
for k in range(24):
    pg.wait_for_timeout(1000)
    if k % 6 == 5: print('hauler t+%ds chest:' % (k + 1), ev('JSON.stringify([...__g.structs.values()].find(s=>s.type==="chest").slots.filter(Boolean).map(s=>s.name+" "+s.qty))'))
# guard fights a raider
ev('const g=__g.settlers.find(s=>s.name==="Ripley Cho"); __g.spawnEnemy("hound", g.x+90, g.y, {raid:true})')
for k in range(14):
    pg.wait_for_timeout(1000)
    n = ev('__g.enemies.filter(e=>e.raid).length')
    if n == 0: print('guard killed the hound after ~%ds' % (k + 1)); break
else: print('guard did not kill the hound')
print('rounds left in chest:', ev('[...__g.structs.values()].find(s=>s.type==="chest").slots.filter(s=>s&&s.name==="Pistol rounds").reduce((a,s)=>a+s.qty,0)'))
# hunger: starving settler eats from the chest
ev('const m=__g.settlers.find(s=>s.name==="Marta Voss"); m.hunger=15')
for k in range(14):
    pg.wait_for_timeout(1000)
    h = ev('Math.round(__g.settlers.find(s=>s.name==="Marta Voss").hunger)')
    if h > 40: print('Marta ate: hunger now', h, 'after ~%ds' % (k + 1)); break
else: print('Marta did not eat, hunger', h)
print('food left in chest:', ev('[...__g.structs.values()].find(s=>s.type==="chest").slots.filter(s=>s&&s.name==="Canned food").reduce((a,s)=>a+s.qty,0)'))
# a raid with settlers present: they should not all die, guards help
ev('__g.startRaid(3)')
pg.wait_for_timeout(15000)
print('after 15s of raid: settlers alive', ev('__g.settlers.length'), 'raiders left', ev('__g.enemies.filter(e=>e.raid).length'))
pg.keyboard.press('p'); pg.wait_for_timeout(300)
pg.screenshot(path='out/settlers_panel.png')
