import json
ev = lambda s: pg.evaluate(s)
def shot(n): pg.screenshot(path='out/%s.png' % n)
BX, BY = 28, 98
pg.mouse.click(550, 332); pg.wait_for_timeout(300)
ev('__g.enemies.length = 0; __g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 })')
ev('__g.state.player.x=%d*16; __g.state.player.y=%d*16' % (BX, BY + 3))
# --- encounters: merchant, trade ---
ev('__g.state.player.x=60*16; __g.state.player.y=60*16')
ok = ev('__g.spawnEncounter("merchant")'); print('merchant spawned:', ok, '| npcs:', ev('__g.encNpcs.length'))
m = json.loads(ev('JSON.stringify({n:__g.encNpcs[0].name, stock:__g.encNpcs[0].stock.map(s=>s.name+" "+s.qty+"x"+s.price)})')); print(m)
ev('__g.addItem("Scrap", 20); __g.addItem("Wood", 20); __g.addItem("Berries", 8); __g.addItem("Raw Fish", 4)')
ev('__g.openTrade(__g.encNpcs[0])'); pg.wait_for_timeout(300); shot('trade')
si = ev('__g.state.player.inventory.findIndex(s=>s&&s.name==="Scrap")')
ev('__g.sellItem(%d, true)' % si)
print('caps after selling 20 scrap:', ev('__g.countItem("Caps")'), '(scrap worth', ev('__g.itemValue("Scrap")'), 'each)')
cheap = ev('(()=>{ const n=__g.encNpcs[0]; return n.stock.findIndex(s=>s.price<=__g.countItem("Caps")); })()')
ev('__g.buyItem(__g.encNpcs[0], %d, 1)' % cheap if cheap >= 0 else '0')
print('bought index', cheap, '| caps left:', ev('__g.countItem("Caps")'), '| quest flags:', ev('JSON.stringify(Object.keys(__g.state.qflags))'))
ev('__g.state.trade = null')
# other encounter kinds
for k in ['traveller', 'wounded', 'cache']:
    ev('__g.encNpcs.length = 0'); print(k, 'spawned:', ev('__g.spawnEncounter("%s")' % k))
# --- journal quest steps tick on conditions ---
ev('__g.state.player.x=%d*16; __g.state.player.y=%d*16' % (BX, BY + 3))
ev('__g.addItem("Wood", 10); __g.addItem("Scrap", 6)'); ev('__g.questTick()')
print('welcome steps done:', ev('JSON.stringify(__g.state.quests.welcome.done)'))
# --- save and load round trip ---
ev('__g.structs.set(%d*128+%d, __g.newStruct("chest")); __g.structs.get(%d*128+%d).slots[0]={name:"Stone",qty:9}' % (BY + 6, BX, BY + 6, BX))
ev('__g.floors[%d*128+%d]=1' % (BY + 7, BX)); ev('__g.skillXp("farming", 60)')
print('saved:', ev('__g.saveGame(false)'), '| has save:', ev('__g.hasSave()'))
ev('__g.structs.clear(); __g.floors.fill(0); __g.state.player.skills.farming.lvl = 1; __g.state.player.inventory.fill(null)')
print('loaded:', ev('__g.loadGame()'), '| structs:', ev('__g.structs.size'), '| chest:', ev('JSON.stringify([...__g.structs.values()].find(s=>s.type==="chest")?.slots[0])'), '| floor:', ev('__g.floors[%d*128+%d]' % (BY + 7, BX)), '| farming lvl:', ev('__g.state.player.skills.farming.lvl'), '| wood in bag:', ev('__g.countItem("Wood")'))
# --- settlers: jobs, job xp, fisher, death setting ---
ev('__g.structs.set(%d*128+%d, __g.newStruct("bunk")); __g.structs.set(%d*128+%d, __g.newStruct("bunk"))' % (BY - 3, BX - 5, BY - 3, BX - 3))
ev('__g.survivors.forEach(s => { s.scared = false })')
sv = ev('__g.survivors.filter(s=>!s.wounded).slice(0,2).map(s=>s.name)'); print('recruiting', sv)
for i in range(2):
    ev('(()=>{ const s=__g.survivors.filter(q=>!q.wounded)[0]; __g.recruit(s); })()')
print('settlers:', ev('__g.settlers.map(s=>s.name+" "+s.job)'))
ev('__g.settlers[0].job = "Fisher"; __g.settlers[0].state = "home"; __g.settlers[0].x = %d*16; __g.settlers[0].y = (%d-2)*16' % (BX, BY))
ev('__g.structs.set(%d*128+%d, __g.newStruct("chest"))' % (BY - 4, BX + 2))
ev('__g.state.player.x=%d*16; __g.state.player.y=%d*16' % (BX + 3, BY - 3))
ev('__g.state.timeMult = 12'); pg.wait_for_timeout(9000); ev('__g.state.timeMult = 1')
print('fisher status:', ev('JSON.stringify({job:__g.settlers[0].job, xp:__g.settlers[0].jobXp, lvl:__g.jobLevel(__g.settlers[0],"Fisher")})'))
print('fish in chests:', ev('[...__g.structs.values()].filter(s=>s.type==="chest").map(s=>(s.slots||[]).filter(Boolean).map(x=>x.name+" "+x.qty))'))
# death modes
ev('__g.settings.permaDeath = false'); n0 = ev('__g.settlers.length')
ev('__g.hurtSettler(__g.settlers[1], 9999)'); print('revive mode: settlers', n0, '->', ev('__g.settlers.length'), '| downed:', ev('__g.state.downed.length'))
ev('__g.state.gameMinutes += 1500; __g.updateDowned()'); print('after a day: settlers', ev('__g.settlers.length'), 'downed', ev('__g.state.downed.length'))
ev('__g.settings.permaDeath = true; __g.hurtSettler(__g.settlers[1], 9999)'); print('permanent mode: settlers', ev('__g.settlers.length'), 'downed', ev('__g.state.downed.length'))
ev('__g.settings.permaDeath = false')
shot('settlement_tab')
