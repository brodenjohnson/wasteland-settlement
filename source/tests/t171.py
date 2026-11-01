import json
ev = lambda s: pg.evaluate(s)
def shot(n): pg.screenshot(path='out/%s.png' % n)
BX, BY = 28, 98
ev('__g.state.placing = null; __g.enemies.length = 0; __g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 })')
spot = json.loads(ev('''JSON.stringify((()=>{ for (let r=0;r<30;r++) for (let dy=-r;dy<=r;dy++) for (let dx=-r;dx<=r;dx++){ const x=(60+dx)*16+8, y=(60+dy)*16+8; let ok=true; for (let k=-4;k<=4;k++) for (let j=-4;j<=4;j++) if (__g.collides(x+k*16, y+j*16, 10, true)) ok=false; if (ok) return [x,y]; } })())'''))
tx, ty = int(spot[0] // 16), int(spot[1] // 16)
ev('__g.state.player.x = %d; __g.state.player.y = %d' % tuple(spot))
# watering with the big can
ev('(()=>{ for (let dy=-1;dy<=1;dy++) for (let dx=-1;dx<=1;dx++) { __g.tilled[(%d+dy)*128+%d+dx] = 1; } })()' % (ty - 3, tx))
ev('__g.addItem("Pressure Can", 1)')
ev('(()=>{ const can = __g.state.player.inventory.find(s=>s&&s.name==="Pressure Can"); can.water = 90; __g.waterArea(can, %d, %d); window.__w = can.water; })()' % (tx, ty - 3))
print('pressure can: water left', ev('window.__w'), '| wet tiles in the 3x3:', ev('(()=>{ let n=0; for (let dy=-1;dy<=1;dy++) for (let dx=-1;dx<=1;dx++) if (__g.wet[(%d+dy)*128+%d+dx]) n++; return n; })()' % (ty - 3, tx)))
# X removes soil, crop, sapling
def sc(x2, y2): return 550 + ((x2 + 0.5) * 16 - spot[0]) * 4, 350 + ((y2 + 0.5) * 16 - spot[1]) * 4
ev('__g.state.placing = null; __g.tilled[%d*128+%d] = 1; __g.crops.set(%d*128+%d, {seed:"Radish Seeds", age:1}); __g.saplings.set(%d*128+%d, {age:1})' % (ty + 2, tx - 2, ty + 2, tx, ty + 2, tx + 2)); pg.keyboard.press('3')
ev('__g.tilled[%d*128+%d] = 1' % (ty + 2, tx))
for ox in (-2, 0, 2):
    x, y = sc(tx + ox, ty + 2); pg.mouse.move(x, y); pg.wait_for_timeout(150); pg.keyboard.press('x'); pg.wait_for_timeout(250)
print('after X: soil gone', ev('!__g.tilled[%d*128+%d]' % (ty + 2, tx - 2)), '| crop gone', ev('!__g.crops.has(%d*128+%d)' % (ty + 2, tx)), '| sapling gone', ev('!__g.saplings.has(%d*128+%d)' % (ty + 2, tx + 2)), '| drops:', ev('JSON.stringify(__g.state.drops.map(d=>d.name))'))
# exploring: dungeons and open-world finds
print('dungeon portals on the overworld:', ev('JSON.stringify(Object.entries(__g.DUNGEONS).map(([id,D])=>[id, !!(__g.state.mapFlags[id] && __g.state.mapFlags[id].portal)]))'))
print('world POIs:', ev('__g.state.mapFlags.poi.list.length'), '| camps and convoys:', ev('JSON.stringify(__g.state.mapFlags.poi.list.reduce((a,p)=>(a[p.kind]=(a[p.kind]||0)+1,a),{}))'))
