import json
ev = lambda s: pg.evaluate(s)
BX, BY = 28, 98
def shot(n): pg.screenshot(path='out/%s.png' % n)
ev('__g.state.placing = null; __g.enemies.length = 0; __g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 })')
print('names now:', ev('JSON.stringify(Object.keys(__g.WEAPONS).slice(0,6))'), '|', ev('JSON.stringify(Object.keys(__g.ARMOUR).slice(0,8))'))
# 1. workbench radius across the camp
hx, hy = BX, BY
ev('__g.structs.set(%d*128+%d, __g.newStruct("bedroll")); __g.structs.set(%d*128+%d, __g.newStruct("workbench"))' % (hy, hx, hy, hx + 1)); pg.wait_for_timeout(1200)
ev('Object.assign(__g.state, {settleLvl: 3})'); pg.wait_for_timeout(800)
print('camp radius', ev('__g.CAMP.r'))
ev('__g.state.player.x = (%d + 11) * 16; __g.state.player.y = %d * 16' % (hx, hy)); pg.wait_for_timeout(300)
print('workbench 10 tiles away, inside the camp:', ev('__g.stationNear("workbench")'))
ev('__g.state.player.x = (%d + 40) * 16' % hx); pg.wait_for_timeout(300)
print('workbench from far outside the camp:', ev('__g.stationNear("workbench")'))
# 2. gate auto-rotation
for x in (BX - 6, BX - 4): ev('__g.structs.set(%d*128+%d, __g.newStruct("wall"))' % (BY - 10, x))
print('gate between two side walls ->', ev('__g.autoRot("gate", %d, %d, 3)' % (BX - 5, BY - 10)), '(0 = horizontal)')
for y in (BY - 14, BY - 12): ev('__g.structs.set(%d*128+%d, __g.newStruct("wall"))' % (y, BX - 5))
print('gate between walls above and below ->', ev('__g.autoRot("gate", %d, %d, 0)' % (BX - 5, BY - 13)), '(2 = vertical)')
# 3. watering cans
ev('__g.state.player.x = %d * 16; __g.state.player.y = %d * 16' % (BX + 6, BY + 6))
for dx in range(-1, 2):
    for dy in range(-1, 2): ev('__g.tilled && 0')
ev('(()=>{ for (let dy=-1;dy<=1;dy++) for (let dx=-1;dx<=1;dx++) { __g.structs.delete((%d+dy)*128+%d+dx); } })()' % (BY + 6, BX + 6))
print('can defs:', ev('JSON.stringify(Object.entries(__g.CAN_DEF).map(([k,v])=>k+":"+v.cap+"/"+v.area))'))
# 4. enemy levels
ev('__g.state.player.level = 5')
ev('__g.state.player.x = 60*16; __g.state.player.y = 60*16')
lv = json.loads(ev('JSON.stringify(["glowrat","hound","scrapper","husk","brute","chief","kingpin","hollowclaw"].map(t => { const e = __g.spawnEnemy(t, 100, 100, {}); const r = [t, e.lvl, Math.round(e.maxHp), Math.round(__g.scaledStats(e).dmg)]; __g.enemies.pop(); return r; }))'))
print('at player level 5 (type, level, hp, damage):', lv)
