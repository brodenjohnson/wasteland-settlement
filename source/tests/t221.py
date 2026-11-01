import json
ev = lambda s: pg.evaluate(s)
ev('__g.state.placing = null; __g.enemies.length = 0; __g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 })')
spot = json.loads(ev('''JSON.stringify((()=>{ for (let r=0;r<60;r++) for (let dy=-r;dy<=r;dy++) for (let dx=-r;dx<=r;dx++){ const x=(60+dx)*16+8, y=(60+dy)*16+8; let ok=true; for (let k=-6;k<=6;k++) for (let j=-4;j<=4;j++) if (__g.collides(x+k*16, y+j*16, 10, true)) ok=false; if (ok) return [x,y]; } })())'''))
tx, ty = int(spot[0] // 16), int(spot[1] // 16)
ev('__g.state.player.x = %d; __g.state.player.y = %d' % tuple(spot))
ev('__g.structs.set(%d*128+%d, __g.newStruct("trough")); __g.structs.get(%d*128+%d).feed = 8' % (ty + 1, tx + 2, ty + 1, tx + 2))
ev('__g.releaseAnimal("Roach Hatchling", %d, %d)' % (spot[0] + 20, spot[1] + 40))
ev('__g.releaseAnimal("Twohead Calf", %d, %d)' % (spot[0] - 30, spot[1] + 40))
ev('__g.animals.forEach(a => { a.age = 5; a.hunger = 20 })')
for k in range(6):
    pg.wait_for_timeout(1500)
    print(k, ev('JSON.stringify(__g.animals.map(a=>[a.type, Math.round(a.x-%d), Math.round(a.y-%d), Math.round(a.hunger), a.moving, !!a.tgt]))' % ((tx + 2.5) * 16, (ty + 1.5) * 16 + 9)), 'feed', ev('__g.structs.get(%d*128+%d).feed' % (ty + 1, tx + 2)))
