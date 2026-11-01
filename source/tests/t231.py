import json
ev = lambda s: pg.evaluate(s)
def shot(n): pg.screenshot(path='out/%s.png' % n)
def hr(h, d=2): ev('__g.state.gameMinutes = %d*1440 + %d' % (d, int(h * 60)))
def talk(picks, wait=900):
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
print('roster', ev('__g.ROSTER.length'), '| scripts built', ev('Object.keys(__g.SCRIPTS||{}).filter(k=>k.startsWith("town_")).length'))
hr(10); ev('__g.enterMap("hull", -1, -1)'); pg.wait_for_timeout(4200)
loc = lambda sid, h: json.loads(ev('JSON.stringify(__g.whereAt(__g.ROSTER.find(n=>n.sid==="%s"), %d*1440 + %d))' % (sid, 2, int(h * 60))))
for sid, label in (('n1', 'Mags'), ('n7', 'barkeep Tobias'), ('n25', 'dockhand Marisol'), ('n14', 'night guard Mel'), ('n24', 'Old Walt')):
    print(label, {h: (loc(sid, h)['map'], 'sleeping' if loc(sid, h).get('sleeping') else ('walking' if loc(sid, h).get('walking') else 'at post')) for h in (3, 7.9, 10, 19, 23)})
# who is on the street at 07:50 (commuting) and at midday
hr(7.9); pg.wait_for_timeout(1500); print('on the street at 07:54 (commuting):', ev('__g.survivors.filter(s=>s.town).length'), 'people |', ev('JSON.stringify(__g.survivors.filter(s=>s.town).slice(0,5).map(s=>[s.name, s.walkT>0]))'))
hr(10.5); pg.wait_for_timeout(1500); print('on the street at 10:30:', ev('JSON.stringify(__g.survivors.filter(s=>s.town).map(s=>s.name))'))
# step into the general store
b = ev('JSON.stringify(__g.BID.general)'); b = json.loads(b); door = b['door']['y']*128 + b['door']['x']
ev('__g.state.player.x = (%d+0.5)*16; __g.state.player.y = (%d+0.5)*16' % (b['out']['x'], b['out']['y'])); pg.wait_for_timeout(500)
ev('__g.useInteract(__g.INTERACT.get(%d), %d)' % (door, door)); pg.wait_for_timeout(4200)
print('in', ev('__g.state.map'), '| people inside:', ev('JSON.stringify(__g.survivors.filter(s=>s.town).map(s=>s.name))'))
shot('t_shop')
mags = ev('__g.survivors.find(s=>s.town)')
ev('__g.openTalk(__g.survivors.find(s=>s.town))'); pg.wait_for_timeout(500); print('dialogue:', ev('__g.state.dlg && __g.state.dlg.id'))
talk(["Let me see"]); pg.wait_for_timeout(500)
print('trade open:', ev('!!__g.state.trade'), '| vendor', ev('__g.state.trade && __g.state.trade.name'), '| stock', ev('__g.state.trade && __g.state.trade.stock.length'), '| first items', ev('JSON.stringify(__g.state.trade.stock.slice(0,4).map(s=>[s.name,s.qty,s.price]))'))
print('sell price of Scrap here (general store buys materials at a premium):', ev('__g.sellValue("Scrap")'), 'vs a Machete:', ev('__g.sellValue("Machete")'))
shot('t_trade')
