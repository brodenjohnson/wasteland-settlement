import json
ev = lambda s: pg.evaluate(s)
BX, BY = 28, 98
ev('__g.state.title = false'); ev('Object.assign(__g.state.qflags, {storyInit:true, sitesPlaced:true, spawnVar:true, "read:Folded Note":true}); __g.state.intro = null; __g.state.reading = null')
ev('__g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 }); __g.enemies.length = 0')
pg.wait_for_timeout(400)
ev('__g.structs.set(%d*128+%d, {type:"bunk", hp:90, rot:0, owner:null})' % (BY + 3, BX - 6))
ev('(()=>{ const s=__g.survivors.filter(q=>!q.wounded)[0]; __g.recruit(s); })()')
cx, cy = BX + 8, BY - 10
def ring(gate):
    for x in range(cx - 3, cx + 4):
        for y in (cy - 3, cy + 3):
            if gate and (x, y) == (cx, cy + 3): ev('__g.structs.set(%d*128+%d, {type:"gate", hp:130, rot:0})' % (y, x))
            else: ev('__g.structs.set(%d*128+%d, {type:"wall", hp:110, rot:0})' % (y, x))
    for y in range(cy - 2, cy + 3):
        for x in (cx - 3, cx + 3): ev('__g.structs.set(%d*128+%d, {type:"wall", hp:110, rot:0})' % (y, x))
ring(True)
ev('(()=>{ const s=__g.settlers[0]; s.state="home"; s.x=(%d+0.5)*16; s.y=(%d+0.5)*16; s.path=null; s.stuckN=0; })()' % (cx, cy))
gx, gy = (cx + 0.5) * 16, (cy + 8.5) * 16
for _ in range(2):
    reached = ev('''(()=>{ const s=__g.settlers[0]; let t=0; for (let k=0;k<1200;k++){ if (__g.settlerGo(s, %f, %f, 0.05, 56)) return [true, k*0.05, Math.round(s.stuckN||0)]; } return [false, 0, Math.round(s.stuckN||0)]; })()''' % (gx, gy))
    print('settler from inside a walled room with a gate -> reached goal:', reached)
    break
# sanity: close the gate with a wall and see how the recovery behaves
ev('__g.structs.set(%d*128+%d, {type:"wall", hp:110, rot:0})' % (cy + 3, cx))
ev('(()=>{ const s=__g.settlers[0]; s.x=(%d+0.5)*16; s.y=(%d+0.5)*16; s.path=null; s.stuckN=0; s.stuckT=0; })()' % (cx, cy))
reached = ev('''(()=>{ const s=__g.settlers[0]; for (let k=0;k<1200;k++){ if (__g.settlerGo(s, %f, %f, 0.05, 56)) return [true, k*0.05]; } return [false, 0]; })()''' % (gx, gy))
print('fully sealed room (no gate): recovered after', reached)
