import json, os
ev = lambda s: pg.evaluate(s)
ROUTE = os.environ.get('ROUTE', 'fight')
def talk(picks, wait=1400):
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
            ev('__g.dialogueAdvance()'); pg.wait_for_timeout(120); ev('__g.dialogueAdvance()')
ev('__g.state.placing = null; __g.enemies.length = 0; __g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 })')
ev('__g.state.player.health = 100; __g.state.iframes = 9999; __g.state.gameMinutes = 12*60*3 + 6*60 + 30')
ev('__g.enterMap("tidewrack", -1, -1)'); pg.wait_for_timeout(3600)
gate0 = ev('[...__g.structs.values()].filter(s=>s.type==="scrapwall").length')
if ROUTE == 'mercy': ev('__g.state.rep.listeners = 2')
if ROUTE == 'lie_win': ev('__g.state.rep.listeners = 1')
if ROUTE == 'lie_lose': ev('__g.state.rep.listeners = 0')
if ROUTE == 'confess': ev('__g.state.qflags.lamplighter_done = true; ["Folded Note","Dispatch Slip","Pump Ledger"].forEach(n => __g.state.qflags["read:"+n] = true)')
if ROUTE == 'culvert':
    cul = json.loads(ev('JSON.stringify([...__g.INTERACT.entries()].find(([i,it])=>it.kind==="culvert")[0])'))
    ev('__g.useInteract(__g.INTERACT.get(%d), %d)' % (cul, cul)); pg.wait_for_timeout(600)
    r5 = json.loads(ev('JSON.stringify(__g.MAPDEFS.tidewrack.rooms_[5])'))
    print('culvert: now in the breakwater room:', ev('Math.floor(__g.state.player.x/16) >= %d' % r5['x']), '| chapel flag:', ev('!!__g.state.qflags.chapel_open'))
else:
    pick = {'fight': 'Stand aside', 'mercy': 'tags returned', 'lie_win': 'broadcast', 'lie_lose': 'broadcast', 'confess': 'I remember'}[ROUTE]
    ev('__g.startDialogue("listener_gate", __g.survivors.find(s=>s.listener))'); talk([pick])
    print('route', ROUTE, '| gate open:', ev('!![__g.state.mapFlags.tidewrack.chapelOpen]') and ev('!!__g.state.mapFlags.tidewrack.chapelOpen'), '| listeners left:', ev('__g.survivors.filter(s=>s.listener).length'), '| hostile zealots:', ev('__g.enemies.filter(e=>e.type==="zealot").length'), '| listeners rep:', ev('__g.state.rep.listeners'), '| gate walls:', gate0, '->', ev('[...__g.structs.values()].filter(s=>s.type==="scrapwall").length'))
