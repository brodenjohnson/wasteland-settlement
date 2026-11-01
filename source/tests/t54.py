import json
ev = lambda s: pg.evaluate(s)
BX, BY = 28, 98
pg.mouse.click(550, 332); pg.wait_for_timeout(300)
ev('__g.enemies.length = 0; __g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 })')
ev('__g.state.player.x=%d*16; __g.state.player.y=%d*16' % (BX, BY + 6))
# turret with ammo in a chest
ev('__g.structs.set(%d*128+%d, __g.newStruct("turret")); __g.structs.set(%d*128+%d, __g.newStruct("chest")); __g.structs.get(%d*128+%d).slots[0]={name:"Pistol rounds",qty:20}' % (BY + 3, BX + 6, BY + 4, BX + 7, BY + 4, BX + 7))
ev('__g.spawnEnemy("glowrat", (%d+6)*16 + 80, (%d+3)*16, {})' % (BX, BY))
hp0 = ev('__g.enemies[0].hp'); pg.wait_for_timeout(3500)
print('turret vs glowrat: hp', hp0, '->', ev('__g.enemies.length ? __g.enemies[0].hp : "dead"'), '| chest rounds left:', ev('__g.chestCount("Pistol rounds")'))
# spike trap
ev('__g.enemies.length = 0; __g.structs.set(%d*128+%d, __g.newStruct("trap"))' % (BY + 8, BX - 6))
print('spawn ok:', ev('(()=>{ const e = __g.spawnEnemy("glowrat", (%d-6)*16+8, (%d+8)*16+8, {}); return [!!e, __g.enemies.length]; })()' % (BX, BY))); ev('if (__g.enemies[0]) { __g.enemies[0].hp = 200; __g.enemies[0].maxHp = 200; }')
pg.wait_for_timeout(1500); print('trap damage: enemy hp', ev('__g.enemies.length ? __g.enemies[0].hp : "dead"'), '| trap hp', ev('[...__g.structs.values()].find(s=>s.type==="trap")?.hp'))
# clinic heals the player
ev('__g.enemies.length = 0; __g.structs.set(%d*128+%d, __g.newStruct("clinic")); __g.state.player.x=(%d+0.5)*16; __g.state.player.y=(%d+1.2)*16; __g.state.player.health = 30' % (BY + 2, BX - 3, BX - 3, BY + 2))
pg.wait_for_timeout(3000); print('clinic healing: health 30 ->', round(ev('__g.state.player.health')))
# steel gear renders and stats
ev('["Combat Helmet","Combat Armour","Combat Leg Guards","Combat Boots"].forEach(n => __g.addItem(n,1)); __g.addItem("Chopper",1); __g.addItem("Hunting Rifle",1)')
for n in ["Combat Helmet","Combat Armour","Combat Leg Guards","Combat Boots"]:
    ev('(()=>{ const i = __g.state.player.inventory.findIndex(s=>s&&s.name==="%s"); __g.useItem && 0; })()' % n)
ev('(()=>{ const p=__g.state.player; const set=(slot,n)=>{ p.equip[slot]={name:n,qty:1}; p.inventory.forEach((s,i)=>{ if(s&&s.name===n) p.inventory[i]=null; }); }; set("head","Combat Helmet"); set("body","Combat Armour"); set("legs","Combat Leg Guards"); set("feet","Combat Boots"); })()')
ev('__g.state.player.health = 100; __g.structs.delete(%d*128+%d)' % (BY + 2, BX - 3))
pg.wait_for_timeout(500); pg.screenshot(path='out/steel.png')
print('armour defence now:', ev('Math.round(__g.CONFIG && 0)'), ev('JSON.stringify(Object.values(__g.state.player.equip).map(s=>s&&s.name))'))
# low health + inventory with Sort button
pg.keyboard.press('i'); pg.wait_for_timeout(300); pg.screenshot(path='out/inv_sort.png')
