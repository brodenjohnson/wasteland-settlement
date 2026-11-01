import json
ev = lambda s: pg.evaluate(s)
def talk(picks, wait=800):
    for _ in range(40):
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
BX, BY = 28, 98
ev('__g.state.placing = null; __g.enemies.length = 0; __g.state.iframes = 9999')
ev('__g.structs.set(%d*128+%d, __g.newStruct("bunk")); __g.structs.set(%d*128+%d, __g.newStruct("bunk"))' % (BY + 3, BX - 6, BY + 3, BX - 4))
ev('__g.addItem("Caps", 100)'); ev('__g.state.gameMinutes = 2*1440 + 11*60')   # day 2 -> drifter index (2//3)%4 = 0 (Marl)
ev('__g.state.gameMinutes = 3*1440 + 11*60')   # day 3 -> index 1 (Kestrel)
n = ev('JSON.stringify(__g.ROSTER.filter(n=>n.drifter!==undefined && __g.present(n)).map(n=>n.sid))'); print('present:', n)
sid = json.loads(n)[0]
ent = ev('(()=>{ const n = __g.ROSTER.find(x=>x.sid==="%s"); const e = {id:n.id, tid:n.sid, kind:"survivor", town:true, def:n, name:n.name, job:n.job, bio:"", skills:{farm:2,guard:1,haul:1}, look:{skin:"#c8a080",hair:"#3a2a1a",body:"#6a5a4a",legs:"#3a3a44",accent:"#c03"}, x:%d*16, y:%d*16, home:{x:0,y:0}, wander:0, wx:0, wy:0, dirx:1, walkT:0}; __g.survivors.push(e); window.__d = e; return 1; })()' % (sid, BX, BY))
s0 = ev('__g.settlers.length'); caps0 = ev('__g.countItem("Caps")')
ev('__g.startDialogue("town_%s", window.__d)' % sid); talk(['Work for me'])
print('hired: settlers', s0, '->', ev('__g.settlers.length'), '| caps', caps0, '->', ev('__g.countItem("Caps")'), '| gone flag:', ev('!!__g.state.mapFlags.hull && !!__g.state.mapFlags.hull.gone && !!__g.state.mapFlags.hull.gone["%s"]' % sid))
