import json
ev = lambda s: pg.evaluate(s)
def shot(n): pg.screenshot(path='out/%s.png' % n)
def talk(pick_seq, wait=2300):
    # advance a dialogue, picking choices from the sequence when they appear
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
ev('Object.assign(__g.state.qflags, {chapterOne:true})')
print('camp portal registered:', ev('JSON.stringify(__g.state.mapFlags.camp && __g.state.mapFlags.camp.portal)'), '| interact entries:', ev('__g.INTERACT.size'))
# meet Mara and trust her
ev('__g.state.player.x = 60*16; __g.state.player.y = 60*16'); ev('__g.spawnEncounter("stranger")'); pg.wait_for_timeout(300)
print('stranger present:', ev('__g.encNpcs.some(n=>n.stranger)'))
ev('__g.startDialogue("mara_ask", __g.encNpcs.find(n=>n.stranger))'); talk([1])
print('after Mara: quest', ev('__g.state.quests.stranger && __g.state.quests.stranger.status'), '| camp known', ev('!!__g.state.qflags.camp_known'), '| tracked marker', ev('JSON.stringify(__g.state.markers.filter(m=>m.tracked).map(m=>m.label))'))
# walk to the camp portal
pt = json.loads(ev('JSON.stringify(__g.state.mapFlags.camp.portal)'))
ev('__g.state.player.x = (%d + 0.5) * 16; __g.state.player.y = (%d + 1) * 16' % (pt['x'], pt['y']))
ev('__g.useInteract(__g.INTERACT.get(%d), %d)' % (pt['i'], pt['i'])); pg.wait_for_timeout(3200)
print('entered:', ev('__g.state.map'), '| dialogue:', ev('__g.state.dlg && __g.state.dlg.id'))
pg.wait_for_timeout(1500); shot('k_trap')
talk([3])   # put your hands up
print('captured: bag items', ev('__g.state.player.inventory.filter(Boolean).length'), '| confiscated stash:', ev('!!__g.state.confiscated'), '| in cell at', ev('JSON.stringify([Math.floor(__g.state.player.x/16), Math.floor(__g.state.player.y/16)])'), '| cell', ev('JSON.stringify(__g.MAPDEFS.camp.cell)'))
shot('k_cell')
# escape: remains then door
rem = json.loads(ev('JSON.stringify([...__g.INTERACT.entries()].find(([i,it])=>it.kind==="remains")[0])'))
door = json.loads(ev('JSON.stringify([...__g.INTERACT.entries()].find(([i,it])=>it.kind==="cagedoor")[0])'))
ev('__g.useInteract(__g.INTERACT.get(%d), %d)' % (door, door)); print('door before shiv:', ev('JSON.stringify(__g.state.mapFlags.camp.cageOpen||false)'))
ev('__g.useInteract(__g.INTERACT.get(%d), %d)' % (rem, rem)); print('shiv obtained:', ev('__g.countItem("Shiv")'))
ev('__g.useInteract(__g.INTERACT.get(%d), %d)' % (door, door)); pg.wait_for_timeout(400)
print('cage open:', ev('!!__g.state.mapFlags.camp.cageOpen'), '| door wall gone:', ev('!__g.structs.has(%d)' % door))
gear = json.loads(ev('JSON.stringify([...__g.INTERACT.entries()].find(([i,it])=>it.kind==="gear")[0])'))
ev('__g.state.player.x = (%d %% 128 + 0.5) * 16; __g.state.player.y = (Math.floor(%d / 128) + 1) * 16' % (gear, gear))
ev('__g.useInteract(__g.INTERACT.get(%d), %d)' % (gear, gear)); pg.wait_for_timeout(500)
print('gear back: confiscated', ev('!!__g.state.confiscated'), '| inventory items', ev('__g.state.player.inventory.filter(Boolean).length'), '| shiv kept:', ev('__g.countItem("Shiv")'))
print('quest steps so far:', ev('JSON.stringify(__g.state.quests.stranger.done)'))
