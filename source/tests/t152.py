import json
ev = lambda s: pg.evaluate(s)
def talk(wait=2000):
    for _ in range(30):
        if not ev('!!__g.state.dlg'): return
        pg.wait_for_timeout(wait)
        if ev('__g.state.dlg.node.choices.filter(c=>__g.evalCond(c.cond)).length'): ev('__g.chooseOption(0)')
        else: ev('__g.dialogueAdvance()'); pg.wait_for_timeout(150); ev('__g.dialogueAdvance()')
ev('__g.state.placing = null; __g.enemies.length = 0; __g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 })')
ev('Object.assign(__g.state.qflags, {chapterOne:true, camp_known:true, mara_exposed:true})')
before = ev('__g.state.player.inventory.filter(Boolean).length')
pt = json.loads(ev('JSON.stringify(__g.state.mapFlags.camp.portal)'))
ev('__g.state.player.x = (%d + 0.5) * 16; __g.state.player.y = (%d + 1) * 16' % (pt['x'], pt['y']))
ev('__g.useInteract(__g.INTERACT.get(%d), %d)' % (pt['i'], pt['i'])); pg.wait_for_timeout(3200)
print('exposed path: dialogue', ev('__g.state.dlg && __g.state.dlg.id'))
talk()
print('armed and alarmed: confiscated', ev('!!__g.state.confiscated'), '| gear intact', ev('__g.state.player.inventory.filter(Boolean).length') == before, '| guards on you:', ev('__g.enemies.filter(e=>e.aggro).length'))
# now die while captured (fresh run of the capture)
ev('__g.enemies.length = 0'); ev('__g.addItem("Wood", 12)')
ev('__g.applyCapture()'); print('captured: bag', ev('__g.state.player.inventory.filter(Boolean).length'))
ev('__g.state.player.health = 0.2; __g.state.player.radiation = 100'); pg.wait_for_timeout(3000)
print('after dying in the cage: map', ev('__g.state.map'), '| confiscated', ev('!!__g.state.confiscated'), '| wood back', ev('__g.countItem("Wood")'))
