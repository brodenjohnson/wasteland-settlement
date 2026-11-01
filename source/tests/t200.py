import json
ev = lambda s: pg.evaluate(s)
def shot(n): pg.screenshot(path='out/%s.png' % n)
def talk(picks, wait=1700):
    # picks: list of label substrings, chosen in order whenever a choice list appears
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
            ev('__g.dialogueAdvance()'); pg.wait_for_timeout(150); ev('__g.dialogueAdvance()')
ev('__g.state.placing = null; __g.enemies.length = 0; __g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 })')
ev('__g.state.player.health = 100; __g.state.iframes = 9999')
ev('__g.state.gameMinutes = 12*60*3 + 6*60 + 30')     # low tide, 30 minutes in
ev('__g.enterMap("tidewrack", -1, -1)'); pg.wait_for_timeout(3600)
D = json.loads(ev('JSON.stringify(__g.MAPDEFS.tidewrack.rooms_.map(r=>[r.x,r.y,r.w,r.h]))'))
print('map', ev('__g.state.map'), '| rooms (x,y,w,h):', D)
print('flood tiles:', ev('__g.flood.size'), '| low tide now:', ev('!__g.tideIsHigh()'), '| Odile present:', ev('__g.survivors.some(s=>s.odile)'), '| Listeners:', ev('__g.survivors.filter(s=>s.listener).length'), '| gate structs:', ev('[...__g.structs.values()].filter(s=>s.type==="scrapwall").length'))
r1 = json.loads(ev('JSON.stringify(__g.MAPDEFS.tidewrack.rooms_[1])'))
ev('__g.state.player.x = (%d - 2) * 16; __g.state.player.y = (%d + 1.5) * 16' % (r1['cx'], r1['cy'])); pg.wait_for_timeout(1200); shot('t_cove')
# tide behaviour: high tide blocks the flood zone, and throws you out
r3 = json.loads(ev('JSON.stringify(__g.MAPDEFS.tidewrack.rooms_[3])'))
ev('__g.state.player.x = (%d + 0.5) * 16; __g.state.player.y = (%d + 3.5) * 16' % (r3['cx'], r3['cy'])); pg.wait_for_timeout(800)
print('standing on the sea floor at low tide: blocked?', ev('__g.collides(__g.state.player.x, __g.state.player.y, 10, true)'))
shot('t_low')
ev('__g.state.gameMinutes = 12*60*3 + 30'); pg.wait_for_timeout(2200)    # high tide
print('after the tide came in: blocked?', ev('__g.collides((%d+0.5)*16, (%d+3.5)*16, 10, true)' % (r3['cx'], r3['cy'])), '| player was thrown to dry ground:', ev('!__g.flood.has(Math.floor(__g.state.player.y/16)*128+Math.floor(__g.state.player.x/16))'))
shot('t_high')
