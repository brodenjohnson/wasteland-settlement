import json
ev = lambda s: pg.evaluate(s)
def talk(picks, wait=1500):
    for _ in range(80):
        if not ev('!!__g.state.dlg'): return
        pg.wait_for_timeout(wait)
        labels = json.loads(ev('JSON.stringify(__g.state.dlg.node.choices.filter(c=>__g.evalCond(c.cond)).map(c=>c.label))'))
        if labels:
            want = picks.pop(0) if picks else None
            idx = next((i for i, l in enumerate(labels) if want and want in l), None)
            if idx is None: idx = len(labels) - 1
            ev('__g.chooseOption(%d)' % idx); pg.wait_for_timeout(250)
        else:
            ev('__g.dialogueAdvance()'); pg.wait_for_timeout(120); ev('__g.dialogueAdvance()')
ev('__g.state.placing = null; __g.enemies.length = 0; __g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 })')
ev('__g.state.player.health = 100; __g.state.iframes = 9999; __g.state.gameMinutes = 12*60*3 + 6*60 + 30')
ev('__g.enterMap("tidewrack", -1, -1)'); pg.wait_for_timeout(3600)
od = ev('__g.survivors.find(s=>s.odile)')
# 1. meet Odile, ask a few questions, take the job
ev('__g.startDialogue("odile_intro", __g.survivors.find(s=>s.odile))')
talk(['Who are you', 'What is the Cradle', 'What did I do', 'What do you need', 'How do I get'] + ['Nothing'])
print('quest lamplighter:', ev('__g.state.quests.lamplighter && __g.state.quests.lamplighter.status'), '| asked flags:', ev('JSON.stringify(Object.keys(__g.state.qflags).filter(k=>k.startsWith("ask_")))'))
# 2. the case needs low tide
r3 = json.loads(ev('JSON.stringify(__g.MAPDEFS.tidewrack.rooms_[3])'))
case = json.loads(ev('JSON.stringify([...__g.INTERACT.entries()].find(([i,it])=>it.kind==="case")[0])'))
ev('__g.state.gameMinutes = 12*60*3 + 30')   # high tide
ev('__g.useInteract(__g.INTERACT.get(%d), %d)' % (case, case)); print('case at high tide:', ev('__g.countItem("Manifest Case")'), '(should be 0)')
ev('__g.state.gameMinutes = 12*60*3 + 6*60 + 60')  # low tide
ev('__g.useInteract(__g.INTERACT.get(%d), %d)' % (case, case)); print('case at low tide:', ev('__g.countItem("Manifest Case")'), '| quest step 1 done:', ev('JSON.stringify(__g.state.quests.lamplighter.done)'))
# 3. bring it back
ev('__g.startDialogue("odile_hub", __g.survivors.find(s=>s.odile))'); talk(['I have the case', 'What is the quorum', 'Nothing'])
print('after handing it over: logs', ev('__g.countItem("Director Log 2")'), ev('__g.countItem("Director Log 3")'), '| case gone:', ev('__g.countItem("Manifest Case") === 0'), '| lamplighter:', ev('__g.state.quests.lamplighter.status'), '| quorum:', ev('__g.state.quests.quorum && __g.state.quests.quorum.status'))
# 4. read a log -> echo flashback
mem0 = ev('__g.memoryScore()')
ev('__g.questEvent("read:Director Log 2"); __g.state.qflags["read:Director Log 2"] = true'); pg.wait_for_timeout(900)
print('echo fired:', ev('!!__g.state.dlg && __g.state.dlg.id'), '| memory', mem0, '->', ev('__g.memoryScore()')); talk([])
# 5. the console, short then full
r5 = json.loads(ev('JSON.stringify(__g.MAPDEFS.tidewrack.rooms_[5])'))
con = json.loads(ev('JSON.stringify([...__g.INTERACT.entries()].find(([i,it])=>it.kind==="console")[0])'))
ev('__g.useInteract(__g.INTERACT.get(%d), %d)' % (con, con)); pg.wait_for_timeout(500); print('console with', ev('__g.tagsHeld()'), 'tags ->', ev('__g.state.dlg && __g.state.dlg.id')); talk([])
for k in range(1, 7): ev('__g.addItem("Tag Card %d", 1)' % k)
print('tags held now:', ev('__g.tagsHeld()'))
ev('__g.useInteract(__g.INTERACT.get(%d), %d)' % (con, con)); pg.wait_for_timeout(500); print('console with 6 tags ->', ev('__g.state.dlg && __g.state.dlg.id')); talk([], 1200)
print('chapter two done:', ev('!!__g.state.qflags.chapter_two_done'), '| quorum quest:', ev('__g.state.quests.quorum.status'), '| log:', ev('JSON.stringify(__g.state.choiceLog.slice(-1).map(l=>l.text))'))
