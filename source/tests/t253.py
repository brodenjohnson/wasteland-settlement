import json
ev = lambda s: pg.evaluate(s)
def shot(n): pg.screenshot(path='out/%s.png' % n)
bad = []
def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok: bad.append(what)
def to_choices():
    return ev('''(() => { for (let k = 0; k < 300; k++) { const d = __g.state.dlg; if (!d) return 'END';
      const vis = d.node.choices.filter(c => __g.evalCond(c.cond)), pg = d.node.pages[d.page];
      if (vis.length && d.page >= d.node.pages.length - 1 && (!pg || d.shown >= pg.text.length)) return vis.map(c => c.label).join(' | ');
      __g.dialogueAdvance(); } return 'STUCK'; })()''')
def pick(sub):
    k = ev('(() => { const d = __g.state.dlg; const vis = d.node.choices.filter(c => __g.evalCond(c.cond)); const k = vis.findIndex(c => c.label.includes(%s)); __g.chooseOption(k); return k; })()' % json.dumps(sub))
    if k < 0: bad.append('no choice containing ' + sub)
def finish(): return to_choices()
qs = lambda id: ev('__g.state.quests["%s"] ? __g.state.quests["%s"].status : "none"' % (id, id))
ev('__g.state.placing = null; __g.enemies.length = 0; __g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 }); __g.state.iframes = 99999; __g.state.nextRaidDay = 1e9; __g.state.raid = null; __g.state.gameMinutes = 10*60 + 1440*3')
# Chapter Two is done: Chapter Three starts by itself
ev('__g.state.qflags.chapter_two_done = true'); pg.wait_for_timeout(800)
check(qs('ch3_case') == 'active', 'Chapter Three starts once Chapter Two is done')
# Marta, recruited, with a bunk and some of a camp around her
ev('''(() => { const O = __g.ORIGIN; for (let k = 0; k < 6; k++) __g.structs.set((O.y+4)*128 + O.x - 3 + k, __g.newStruct('bunk')); })()''')
ev('(() => { const m = __g.survivors.find(s => s.name === "Marta Voss"); __g.recruit(m); })()'); pg.wait_for_timeout(300)
check(ev('__g.settlers.some(s => s.name === "Marta Voss")'), 'Marta has joined the camp')
ev('__g.startDialogue("ch3_marta", __g.settlers.find(s => s.name === "Marta Voss"))')
print('  marta:', to_choices()); pick('recording'); print('  ask:', to_choices())
pick('dig up'); print('  given:', to_choices())
check(ev('__g.countItem("Sealed Case")') == 1 and ev('!!__g.state.qflags["ch3:marta"]'), 'Marta hands over the case')
pick('Open it with me'); finish(); pg.wait_for_timeout(400)
check(ev('__g.countItem("The Long Table") + __g.countItem("Minutes of the Vote") + __g.countItem("Director Code Card")') == 3 and ev('__g.countItem("Sealed Case")') == 0, 'the case holds the plan, the minutes and the card')
pg.wait_for_timeout(800)
check(qs('ch3_case') == 'done' and qs('ch3_radio') == 'active', 'Ten Voices starts after the case')
# the capacity readout
cap = json.loads(ev('JSON.stringify(__g.capacity())'))
print('  capacity:', cap)
check(cap['beds'] == 18 and cap['total'] == min(cap['beds'], cap['food'], cap['water'], cap['safety']), 'capacity takes the weakest of beds, food, water and safety')
ev('__g.state.dlg = null; __g.state.settlersOpen = true'); pg.wait_for_timeout(500); shot('t253_capacity'); ev('__g.state.settlersOpen = false')
# a sermon comes on the radio at night
ev('__g.state.gameMinutes = 21*60 + 30 + 1440*3'); pg.wait_for_timeout(900)
check(ev('__g.state.dlg && __g.state.dlg.id') == 'cantor_sermon_1', 'the Cantor preaches on the radio at night'); finish(); pg.wait_for_timeout(300)
# Priya
ev('(() => { const p = __g.survivors.find(s => s.name === "Priya Nair"); __g.recruit(p); })()')
ev('__g.startDialogue("ch3_priya", __g.settlers.find(s => s.name === "Priya Nair"))'); to_choices(); pick('Dex'); print('  priya:', to_choices())
pick('Stop answering'); finish(); pg.wait_for_timeout(800)
check(ev('!!__g.state.qflags.priya_quiet') and qs('ch3_listeners') == 'active', 'Priya goes quiet and the Listeners are coming')
# the Listeners come after dark and they are not friendly
ev('__g.state.rep.listeners = 0; __g.state.gameMinutes += 24*60; __g.state.gameMinutes = Math.floor(__g.state.gameMinutes/1440)*1440 + 20*60'); pg.wait_for_timeout(1200)
raid = ev('__g.state.raid && __g.state.raid.kind')
check(raid == 'The Listeners, singing' and ev('__g.enemies.some(e => e.type === "zealot" && e.raid)'), 'the Listeners raid the camp (%s)' % raid)
ev('__g.enemies.filter(e => e.raid).forEach(e => __g.damageEnemy(e, 99999, 0, 0, 0))'); pg.wait_for_timeout(1500)
finish(); pg.wait_for_timeout(300)
check(ev('!!__g.state.qflags["ch3:listeners"]') and ev('__g.state.mapFlags.tidewrack.chapelOpen'), 'after the raid, Chapel Row is open and waiting')
# the Cantor: lose the argument, win the fight, spare him
ev('__g.enterMap("tidewrack", -1, -1)'); pg.wait_for_timeout(3000)
c = ev('(() => { const c = __g.survivors.find(s => s.cantor); return c ? [c.x, c.y] : null; })()')
check(c is not None, 'the Cantor is in his chapel')
ev('__g.state.player.x = %d; __g.state.player.y = %d' % (c[0], c[1] + 30)); pg.wait_for_timeout(500); shot('t253_chapel')
ev('__g.startDialogue("ch3_cantor", __g.survivors.find(s => s.cantor))'); print('  cantor:', to_choices())
pick('The Cradle is empty'); finish(); pg.wait_for_timeout(500)
check(ev('__g.enemies.some(e => e.type === "cantor")'), 'a lie starts the fight')
shot('t253_fight')
ev('(() => { const b = __g.enemies.find(e => e.type === "cantor"); __g.damageEnemy(b, b.hp * 0.9, 0, 0, 0); })()'); pg.wait_for_timeout(800)
beaten = ev('(() => { const c = __g.survivors.find(s => s.cantor && s.beaten); return !!c; })()')
check(beaten, 'the Cantor goes down on one knee')
ev('__g.startDialogue("ch3_cantor_beaten", __g.survivors.find(s => s.cantor && s.beaten))'); to_choices(); pick('Go'); finish(); pg.wait_for_timeout(800)
check(ev('!!__g.state.qflags.cantor_spared') and qs('ch3_listeners') == 'done' and qs('ch3_table') == 'active', 'sparing the Cantor ends the step and starts The Long Table')
# home, a table, the ten
ev('__g.enterMap("wastes", -1, -1)'); pg.wait_for_timeout(3000)
ev('(() => { const O = __g.ORIGIN; __g.structs.set((O.y+2)*128 + O.x + 3, __g.newStruct("table")); })()'); pg.wait_for_timeout(800)
check(ev('__g.state.quests.ch3_table.done.table'), 'building a table ticks the first step')
ev('__g.tableSeats(); __g.startDialogue("ch3_table_seats", __g.settlers.find(s => s.name === "Marta Voss"))')
print('  table:', to_choices()); shot('t253_table')
pick('in stages'); finish(); pg.wait_for_timeout(800)
check(ev('!!__g.state.qflags.chapter_three_done') and ev('!!__g.state.qflags.lean_long') and qs('ch3_table') == 'done', 'the long table ends Chapter Three')
# the papers are readable and count towards Memory
m0 = ev('__g.memoryScore()')
ev('__g.questEvent && __g.questEvent("read:The Long Table")')
print('  memory before and after reading the plan:', m0, ev('__g.memoryScore()'))
if bad: errs.append('t253: ' + '; '.join(bad))
