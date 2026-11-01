import json
ev = lambda s: pg.evaluate(s)
BX, BY = 28, 98
def shot(n): pg.screenshot(path='out/%s.png' % n)
ev('__g.state.title = false'); ev('Object.assign(__g.state.qflags, {storyInit:true, sitesPlaced:true, spawnVar:true, "read:Folded Note":true}); __g.state.intro = null; __g.state.reading = null')
ev('__g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 }); __g.enemies.length = 0')
pg.wait_for_timeout(400)
ev('__g.state.player.x=(%d+0.5)*16; __g.state.player.y=(%d+0.5)*16' % (BX, BY))
for a in range(2): ev('__g.structs.set(%d*128+%d, {type:"bunk", hp:90, rot:0, owner:null})' % (BY + 3, BX - 6 + a * 2))
# --- shotgun pellets ---
ev('__g.addItem("Sawn-off Shotgun", 1); __g.addItem("Shells", 10)')
gi = ev('__g.state.player.inventory.findIndex(s=>s&&s.name==="Sawn-off Shotgun")'); pg.keyboard.press(str(gi + 1))
ev('__g.spawnEnemy("hound", __g.state.player.x + 50, __g.state.player.y, {})')
pg.wait_for_timeout(150)
d = json.loads(ev('JSON.stringify({ex:__g.enemies[0].x, ey:__g.enemies[0].y})'))
sx, sy = 550 + 50 * 4, 350
for _ in range(6):
    pg.mouse.move(sx, sy); pg.wait_for_timeout(60); m = json.loads(ev('JSON.stringify({x:__g.state.mwx,y:__g.state.mwy})')); sx += (d['ex'] - m['x']) * 4; sy += ((d['ey'] - 4) - m['y']) * 4
pg.mouse.move(sx, sy); pg.wait_for_timeout(80); pg.mouse.down(); pg.wait_for_timeout(1200); pg.mouse.up(); pg.wait_for_timeout(200)
print('shotgun vs hound: alive', ev('__g.enemies.filter(e=>e.hp>0).length'), '| shells left', ev('__g.countItem("Shells")'))
ev('__g.enemies.length = 0')
# --- armour overlays ---
for n in ['Riot Helmet', 'Riot Vest', 'Riot Greaves', 'Riot Boots', 'Runner Wraps']:
    ev('__g.state.player.equip.%s = {name: "%s", qty: 1}' % ({'Riot Helmet':'head','Riot Vest':'body','Riot Greaves':'legs','Riot Boots':'feet','Runner Wraps':'acc'}[n], n))
pg.wait_for_timeout(500); shot('d_riot')
ev('__g.state.player.equip.head = {name:"Gas Mask", qty:1}; __g.state.player.equip.body = {name:"Lead Apron", qty:1}; __g.state.player.equip.legs = {name:"Patchwork Trousers", qty:1}; __g.state.player.equip.feet = {name:"Patchwork Shoes", qty:1}')
pg.wait_for_timeout(500); shot('d_chem')
print('armour stats now:', ev('JSON.stringify(__g.armourStats ? __g.armourStats() : null)'))
ev('Object.keys(__g.state.player.equip).forEach(k => __g.state.player.equip[k] = null)')
# --- survivor quest through the talk panel ---
for i in range(2): ev('(()=>{ const s=__g.survivors.find(q=>q.name==="Marta Voss"&&!q.wounded) || __g.survivors.filter(q=>!q.wounded)[0]; __g.recruit(s); })()')
nm = ev('__g.settlers[0].name'); print('settler for the quest test:', nm)
q = json.loads(ev('JSON.stringify(Object.fromEntries(Object.entries(__g.SURV_QUESTS).map(([k,v])=>[k,v.id])))'))
ev('__g.state.talk = __g.settlers[0]; __g.state.talkLine = "hello"'); pg.wait_for_timeout(300); shot('d_talk')
pg.mouse.click(300, 577); pg.wait_for_timeout(300)
print('quest started:', ev('JSON.stringify(Object.keys(__g.state.quests).filter(k=>k.startsWith("sq_")))'), '| line:', ev('__g.state.talkLine')[:70])
