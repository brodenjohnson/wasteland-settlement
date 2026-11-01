import json
ev = lambda s: pg.evaluate(s)
def shot(n): pg.screenshot(path='out/%s.png' % n)
def run_until_done(maxn=12, pick=None):
    for k in range(maxn):
        if not ev('!!__g.state.dlg'): return
        n = ev('__g.state.dlg.node')
        pg.wait_for_timeout(2600)
        vis = ev('__g.state.dlg.node.choices.filter(c=>__g.evalCond(c.cond)).length')
        if vis and pick is not None: pg.keyboard.press(str(pick)); pg.wait_for_timeout(300); pick = 1; continue
        pg.keyboard.press('Space'); pg.wait_for_timeout(250); pg.keyboard.press('Space'); pg.wait_for_timeout(250)
ev('__g.state.placing = null'); ev('__g.enemies.length = 0')
ev('__g.addItem("Bandage", 3); __g.addItem("Canned food", 2)')
ev('__g.state.player.x = 40*16; __g.state.player.y = 80*16'); pg.wait_for_timeout(300)
# a wounded raider
ev('__g.spawnEncounter("raider")'); pg.wait_for_timeout(300)
r = ev('(()=>{ const n = __g.survivors.find(s=>s.raider); return n && n.name; })()')
print('raider spawned:', r)
ev('__g.startDialogue("raider_wounded", __g.survivors.find(s=>s.raider))'); pg.wait_for_timeout(3500); shot('d_raider')
print('options:', ev('JSON.stringify(__g.state.dlg.node.choices.map(c=>[c.tag, c.label.slice(0,28)]))'))
pg.keyboard.press('Space'); pg.wait_for_timeout(300); pg.wait_for_timeout(2500)
pg.keyboard.press('1'); pg.wait_for_timeout(400)         # patch him up
print('after choosing to patch him: node', ev('__g.state.dlg && __g.state.dlg.id'), '| mercy', ev('__g.state.rep.mercy'), '| bandages left', ev('__g.countItem("Bandage")'))
run_until_done(8, pick=2)
print('end: mercy', ev('__g.state.rep.mercy'), 'trust', ev('__g.state.rep.trust'), '| raider gone:', ev('!__g.survivors.some(s=>s.raider)'), '| log:', ev('JSON.stringify(__g.state.choiceLog.map(l=>l.text))'), '| rumours:', ev('__g.state.markers.filter(m=>m.kind==="rumour").length'))
# the other way: finish a second raider
ev('__g.spawnEncounter("raider")'); pg.wait_for_timeout(300)
ev('__g.startDialogue("raider_wounded", __g.survivors.find(s=>s.raider))'); pg.wait_for_timeout(2500); pg.keyboard.press('Space'); pg.wait_for_timeout(2500)
pg.keyboard.press('3'); pg.wait_for_timeout(500)
run_until_done(4)
print('after finishing him: mercy', ev('__g.state.rep.mercy'), '| scrap', ev('__g.countItem("Scrap")'))
# hungry traveller
ev('__g.spawnEncounter("traveller")'); pg.wait_for_timeout(300)
ev('__g.startDialogue("traveller_hungry", __g.encNpcs[0])'); pg.wait_for_timeout(2600); pg.keyboard.press('Space'); pg.wait_for_timeout(2500)
pg.keyboard.press('1'); pg.wait_for_timeout(400); run_until_done(4)
print('after feeding a traveller: mercy', ev('__g.state.rep.mercy'), '| canned food left', ev('__g.countItem("Canned food")'))
# journal pages
ev('__g.state.journalOpen = true'); ev('__g.state.journalPage = 1'); pg.wait_for_timeout(500); shot('d_journal_log')
ev('__g.state.journalPage = 2'); pg.wait_for_timeout(500); shot('d_journal_q')
