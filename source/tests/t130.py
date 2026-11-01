import json
ev = lambda s: pg.evaluate(s)
def shot(n): pg.screenshot(path='out/%s.png' % n)
ev('__g.state.placing = null'); ev('__g.enemies.length = 0')
print('scripts parsed:', ev('Object.keys(__g.SCRIPTS).length'), '| sample node pages:', ev('__g.SCRIPTS.sq_marta_ask.pages.length'), 'choices:', ev('__g.SCRIPTS.sq_marta_ask.choices.length'))
# 1. an Echo from reading the note
ev('__g.addItem("Folded Note", 1)'); ev('__g.state.reading = "Folded Note"'); pg.wait_for_timeout(300)
pg.keyboard.press('Escape'); pg.wait_for_timeout(1500)
print('echo started after reading:', ev('!!__g.state.dlg'), '| node:', ev('__g.state.dlg && __g.state.dlg.id'))
pg.wait_for_timeout(2200); shot('d_echo')
for _ in range(4): pg.keyboard.press('Space'); pg.wait_for_timeout(250)
pg.wait_for_timeout(2500)
for _ in range(4): pg.mouse.click(550, 350); pg.wait_for_timeout(250)
print('echo finished, memory score now:', ev('__g.memoryScore()'), '| dialogue open:', ev('!!__g.state.dlg'))
# 2. a survivor conversation through the real talk panel
BX, BY = 28, 98
for a in range(2): ev('__g.structs.set(%d*128+%d, __g.newStruct("bunk"))' % (BY + 2, BX - 4 + a * 2))
ev('(()=>{ const s=__g.survivors.find(q=>q.name==="Marta Voss"); __g.recruit(s); })()')
ev('__g.state.talk = __g.settlers.find(s=>s.name==="Marta Voss")'); pg.wait_for_timeout(300)
pg.mouse.click(300, 577); pg.wait_for_timeout(400)
print('dialogue open:', ev('__g.state.dlg && __g.state.dlg.id'))
pg.wait_for_timeout(3500); shot('d_marta1')
for _ in range(3): pg.keyboard.press('Space'); pg.wait_for_timeout(200)
pg.wait_for_timeout(2500)
print('choices visible:', ev('__g.state.dlg.node.choices.filter(c=>__g.evalCond(c.cond)).length'))
shot('d_marta2')
pg.keyboard.press('2'); pg.wait_for_timeout(300)   # say nothing
print('node now:', ev('__g.state.dlg && __g.state.dlg.id'))
for _ in range(6):
    if not ev('!!__g.state.dlg'): break
    pg.keyboard.press('Space'); pg.wait_for_timeout(300); pg.wait_for_timeout(1800)
print('quest started:', ev('__g.state.quests.sq_marta && __g.state.quests.sq_marta.status'), '| log:', ev('JSON.stringify(__g.state.choiceLog)'), '| dialogue still open:', ev('!!__g.state.dlg'))
