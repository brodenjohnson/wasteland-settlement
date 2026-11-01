import json
ev = lambda s: pg.evaluate(s)
def shot(n): pg.screenshot(path='out/%s.png' % n)
def hr(h, d=2): ev('__g.state.gameMinutes = %d*1440 + %d' % (d, int(h * 60)))
def talk(picks, wait=800):
    for _ in range(60):
        if not ev('!!__g.state.dlg'): return
        pg.wait_for_timeout(wait)
        labels = json.loads(ev('JSON.stringify(__g.state.dlg.node.choices.filter(c=>__g.evalCond(c.cond)).map(c=>c.label))'))
        if labels:
            want = picks.pop(0) if picks else None
            idx = next((i for i, l in enumerate(labels) if want and want in l), None)
            if idx is None: idx = len(labels) - 1
            ev('__g.chooseOption(%d)' % idx); pg.wait_for_timeout(250)
        else:
            ev('__g.dialogueAdvance()'); pg.wait_for_timeout(100); ev('__g.dialogueAdvance()')
ev('__g.state.placing = null; __g.enemies.length = 0; __g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 }); __g.state.iframes = 9999')
hr(10); ev('__g.enterMap("hull_general", -1, -1)'); pg.wait_for_timeout(4200)
L = json.loads(ev('JSON.stringify(__g.layoutFor(__g.BID.general))'))
ev('__g.state.player.x = (%d+0.5)*16; __g.state.player.y = (%d+0.5)*16' % (L['posts']['counter']['x'] + 2, L['posts']['counter']['y'] + 4)); pg.wait_for_timeout(1500); shot('t_counter')
# services
ev('__g.addItem("Caps", 300)')
d = lambda sid: ev('__g.survivors.find(s=>s.town && s.tid==="%s") || __g.ENT.get(%d)' % (sid, 2000 + int(sid[1:])))
ev('__g.state.player.health = 30; __g.state.player.radiation = 80')
ev('__g.startDialogue("town_n9", __g.ENT.get(2009) || {name:"Doc"})'); talk(['Patch me up'])
print('after the doctor: hp', ev('Math.round(__g.state.player.health)'), '| caps', ev('__g.countItem("Caps")'))
ev('__g.startDialogue("town_n9", __g.ENT.get(2009) || {name:"Doc"})'); talk(['Clear the radiation'])
print('radiation now', ev('Math.round(__g.state.player.radiation)'), '| caps', ev('__g.countItem("Caps")'))
ev('__g.state.gameMinutes = 2*1440 + 22*60'); ev('__g.state.player.energy = 10')
ev('__g.startDialogue("town_n8", __g.ENT.get(2008) || {name:"Birgit"})'); talk(['A bunk'])
print('inn: now', ev('Math.round((__g.state.gameMinutes/60)%24*10)/10'), 'h | hp', ev('Math.round(__g.state.player.health)'), '| energy', ev('__g.state.player.energy'), '| caps', ev('__g.countItem("Caps")'))
# hire a drifter (need a bed in camp; give the camp one)
print('drifter present today:', ev('JSON.stringify(__g.ROSTER.filter(n=>n.drifter!==undefined).map(n=>[n.name,__g.present(n)]))'))
# job board: accept, complete, hand in
ev('__g.startDialogue("board_hub")'); talk(['Water Run'])
print('accepted:', ev('JSON.stringify(Object.keys(__g.state.quests).filter(k=>k.startsWith("bm_")))'))
ev('__g.addItem("Purified Water", 9)'); pg.wait_for_timeout(1500)
print('ready flag:', ev('!!__g.state.qflags.bm_bm_water_ready'))
caps0 = ev('__g.countItem("Caps")'); rep0 = ev('__g.state.rep.hull')
ev('__g.startDialogue("board_hub")'); talk(['Hand in'])
pg.wait_for_timeout(1500)
print('handed in: water left', ev('__g.countItem("Purified Water")'), '| caps', caps0, '->', ev('__g.countItem("Caps")'), '| hull rep', rep0, '->', ev('__g.state.rep.hull'), '| quest', ev('__g.state.quests.bm_water.status'))
# a kill mission
ev('__g.startDialogue("board_hub")'); talk(['Rats in the Hold'])
ev('for (let k = 0; k < 8; k++) { const e = __g.spawnEnemy("glowrat", 100, 100, {}); __g.killEnemy(e); }'); pg.wait_for_timeout(1500)
print('rats ready:', ev('!!__g.state.qflags.bm_bm_rats_ready'))
