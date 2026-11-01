import json
ev = lambda s: pg.evaluate(s)
BX, BY = 28, 98
pg.keyboard.press('h'); pg.wait_for_timeout(150)
sets = {
  'scrap': {'head':'Raider Helmet','body':'Raider Vest','legs':'Raider Leggings','feet':'Raider Boots','acc':'Spiked Bracer'},
  'iron': {'head':'Metal Helmet','body':'Metal Armour','legs':'Metal Leg Guards','feet':'Metal Boots','acc':'Lead Pendant'},
  'haz': {'head':'Hazmat Hood','body':'Hazmat Suit','legs':'Hazmat Pants','feet':'Rubber Boots','acc':'Lead Pendant'},
}
for name, s in sets.items():
    ev('Object.assign(__g.state.player.equip, ' + json.dumps({k: {'name': v, 'qty': 1} for k, v in s.items()}) + ')')
    pg.wait_for_timeout(250)
    pg.screenshot(path='out/arm_%s.png' % name, clip={'x': 450, 'y': 220, 'width': 200, 'height': 200})
# tooltip comparison: iron plate vs scrap vest equipped
ev('Object.assign(__g.state.player.equip, {body:{name:"Raider Vest",qty:1}})')
ev('__g.addItem("Metal Armour",1); __g.addItem("Combat Cleaver",1); __g.addItem("Miners Pick",1)')
pg.keyboard.press('i'); pg.wait_for_timeout(250)
rects = json.loads(ev('JSON.stringify(__g.state.uiRects)'))
idx = ev("__g.state.player.inventory.findIndex(s=>s&&s.name==='Metal Armour')")
r = rects[5 + idx]; pg.mouse.move(r['x'] + 10, r['y'] + 10); pg.wait_for_timeout(250)
pg.screenshot(path='out/tip.png')
pg.keyboard.press('Escape'); pg.wait_for_timeout(100)
pg.keyboard.press('m'); pg.wait_for_timeout(250)
pg.screenshot(path='out/map.png')
