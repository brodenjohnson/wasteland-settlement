import json
ev = lambda s: pg.evaluate(s)
BX, BY = 28, 98
def shot(n): pg.screenshot(path='out/%s.png' % n)
ev('__g.state.title = false'); ev('Object.assign(__g.state.qflags, {storyInit:true, sitesPlaced:true, spawnVar:true, "read:Folded Note":true}); __g.state.intro = null; __g.state.reading = null')
ev('__g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 }); __g.enemies.length = 0')
pg.wait_for_timeout(400)
ev('__g.state.player.x=(%d+0.5)*16; __g.state.player.y=(%d+0.5)*16' % (BX, BY))
for a in range(4): ev('__g.structs.set(%d*128+%d, {type:"bunk", hp:90, rot:0, owner:null})' % (BY + 3, BX - 6 + a * 2))
# real flow for Marta: talk, start, grow tomatoes, hand over
for i in range(3): ev('(()=>{ const s=__g.survivors.find(q=>q.name==="Marta Voss"&&!q.wounded) || __g.survivors.filter(q=>!q.wounded)[0]; __g.recruit(s); })()') if i == 0 else None
ev('__g.state.talk = __g.settlers[0]'); pg.wait_for_timeout(300); ev('__g.startQuest("sq_marta")'); pg.wait_for_timeout(300)
ev('__g.addItem("Tomato", 3)'); pg.wait_for_timeout(600)
print('step 1 done after having tomatoes:', ev('JSON.stringify(__g.state.quests.sq_marta.done)'))
shot('d_hand')
pg.mouse.click(300, 577); pg.wait_for_timeout(500)
print('after hand over: quest', ev('__g.state.quests.sq_marta.status'), '| tomatoes left', ev('__g.countItem("Tomato")'), '| marta farm skill', ev('__g.settlers[0].skills.farm'), '| bag:', ev('JSON.stringify(__g.state.player.inventory.filter(s=>s&&/Tag Card|Tomato Seeds/.test(s.name)).map(s=>s.name+" x"+s.qty))'))
ev('__g.state.talk = null')
# the other nine, programmatically
ev('__g.state.cnt = {}')
for nm, q in json.loads(ev('JSON.stringify(Object.fromEntries(Object.entries(__g.SURV_QUESTS).map(([k,v])=>[k,v.id])))')).items():
    if q == 'sq_marta': continue
    ev('(()=>{ const q = __g.SURV_QUESTS["%s"]; __g.startSurvQuest(null, q); })()' % nm)
ev('(()=>{ const c = __g.state.cnt; c.kRaider = 9; c["k:husk"] = 2; c.raidsDone = 2; c.cooked = 5; })()')
ev('__g.state.codex.places["Whisper Pines"] = 1; __g.state.codex.places["The Ashlands"] = 1; __g.state.codex.places["Fallen City"] = 1')
ev('__g.structs.set(%d*128+%d, {type:"pot", hp:40, rot:0}); __g.structs.set(%d*128+%d, {type:"clinic", hp:100, rot:0}); __g.structs.set(%d*128+%d, {type:"guardpost", hp:240, rot:0}); __g.structs.set(%d*128+%d, {type:"guardpost", hp:240, rot:0})' % (BY - 5, BX - 5, BY - 5, BX - 3, BY - 7, BX + 4, BY - 7, BX + 6))
ev('__g.state.player.x = %f; __g.state.player.y = %f' % (88 * 16 + 8, 22 * 16 + 8))
ev('Object.keys(__g.state.quests).filter(k => k.startsWith("sq_") && k !== "sq_marta").forEach(k => { for (const s of __g.QUEST_DEFS.find(d => d.id === k).steps) __g.questEvent("give:" + k + ":" + s.id); })')
pg.wait_for_timeout(1500)
res = json.loads(ev('JSON.stringify(Object.fromEntries(Object.entries(__g.state.quests).filter(([k]) => k.startsWith("sq_")).map(([k, v]) => [k, v.status])))'))
print('all survivor quests:', res)
print('tag cards in bag/dropped:', ev('JSON.stringify(__g.state.player.inventory.filter(s=>s&&/Tag Card/.test(s.name)).map(s=>s.name).concat(__g.state.drops.filter(d=>/Tag Card/.test(d.name)).map(d=>d.name)))'))
print('rumours added by Wren:', ev('__g.state.markers.filter(m=>m.kind==="rumour").length'))
