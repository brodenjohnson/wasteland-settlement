import json
ev = lambda s: pg.evaluate(s)
def shot(n): pg.screenshot(path='out/%s.png' % n)
def talk(pick_seq, wait=2300):
    for _ in range(40):
        if not ev('!!__g.state.dlg'): return
        pg.wait_for_timeout(wait)
        vis = ev('__g.state.dlg.node.choices.filter(c=>__g.evalCond(c.cond)).length')
        if vis:
            k = pick_seq.pop(0) if pick_seq else 1
            ev('__g.chooseOption(%d)' % (k - 1)); pg.wait_for_timeout(250)
        else:
            ev('__g.dialogueAdvance()'); pg.wait_for_timeout(200); ev('__g.dialogueAdvance()')
ev('__g.state.placing = null; __g.enemies.length = 0; __g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 })')
ev('Object.assign(__g.state.qflags, {chapterOne:true, camp_known:true, mara_trusted:true}); __g.startQuest("stranger")')
ev('Object.assign(__g.state.player, {health: 100}); __g.addItem("Machete", 1); __g.addItem("Caps", 200)')
mi = ev('__g.state.player.inventory.findIndex(s=>s&&s.name==="Machete")'); pg.keyboard.press(str(mi + 1))
ev('__g.state.mapFlags.camp = {arrived: true}; __g.enterMap("camp", -1, -1)'); pg.wait_for_timeout(3000)
pg.wait_for_timeout(2500)
print('enemies spawned from afar:', ev('JSON.stringify(__g.enemies.map(e=>e.type))'))
r5 = json.loads(ev('JSON.stringify(__g.MAPDEFS.camp.rooms_[5])'))
# go to the pit, wait for the boss to spawn and the intro to fire
ev('__g.state.player.x = (%d - 6 + 0.5) * 16; __g.state.player.y = (%d + 0.5) * 16' % (r5['cx'], r5['cy'])); pg.wait_for_timeout(2500)
print('boss alive:', ev('__g.enemies.some(e=>e.type==="kingpin")'), '| intro dialogue:', ev('__g.state.dlg && __g.state.dlg.id'))
pg.wait_for_timeout(1500); shot('k_varro')
talk([4])    # the jaw line, so the fight begins
print('fight on:', ev('!__g.state.dlg'), '| boss hp', ev('Math.round(__g.enemies.find(e=>e.type==="kingpin").hp)'), '/', ev('__g.enemies.find(e=>e.type==="kingpin").maxHp'))
ev('__g.state.player.health = 100'); ev('__g.state.iframes = 999')
# phase 1
ev('(()=>{ const e = __g.enemies.find(x=>x.type==="kingpin"); e.hp = e.maxHp * 0.6; })()'); pg.wait_for_timeout(700)
print('phase 1: enemies now', ev('__g.enemies.length'), '(guards called)')
ev('(()=>{ const e = __g.enemies.find(x=>x.type==="kingpin"); e.hp = e.maxHp * 0.3; })()'); pg.wait_for_timeout(700)
print('phase 2 enraged:', ev('!!__g.enemies.find(x=>x.type==="kingpin").p2'))
shot('k_boss')
ev('(()=>{ const e = __g.enemies.find(x=>x.type==="kingpin"); e.hp = e.maxHp * 0.1; })()'); pg.wait_for_timeout(800)
print('surrender: boss gone from the enemy list:', ev('!__g.enemies.some(e=>e.type==="kingpin")'), '| beaten Varro present:', ev('__g.survivors.some(s=>s.boss)'))
ev('__g.enemies.length = 0')
ev('__g.startDialogue("varro_surrender", __g.survivors.find(s=>s.boss))'); talk([1])
print('after sparing him: mercy', ev('__g.state.rep.mercy'), '| flags spared', ev('!!__g.state.qflags.varro_spared'), '| caps', ev('__g.countItem("Caps")'), '| quest', ev('__g.state.quests.stranger.status'), '| log', ev('JSON.stringify(__g.state.choiceLog.slice(-1).map(l=>l.text))'))
