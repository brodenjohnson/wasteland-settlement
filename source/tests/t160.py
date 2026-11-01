import json
ev = lambda s: pg.evaluate(s)
ev('__g.state.placing = null; __g.enemies.length = 0')
spot = json.loads(ev('''JSON.stringify((()=>{ for (let r=0;r<30;r++) for (let dy=-r;dy<=r;dy++) for (let dx=-r;dx<=r;dx++){ const x=(60+dx)*16+8, y=(60+dy)*16+8; let ok=true; for (let k=-4;k<=4;k++) for (let j=-4;j<=4;j++) if (__g.collides(x+k*16, y+j*16, 10, true)) ok=false; if (ok) return [x,y]; } })())'''))
ev('__g.state.player.x = %d; __g.state.player.y = %d' % tuple(spot)); pg.wait_for_timeout(300)
def pos(): return json.loads(ev('JSON.stringify([Math.round(__g.state.player.x), Math.round(__g.state.player.y)])'))
for key in ['w', 's', 'a', 'd']:
    p0 = pos(); pg.keyboard.down(key); pg.wait_for_timeout(500); pg.keyboard.up(key); pg.wait_for_timeout(150)
    print(key, 'moved', [a - b for a, b in zip(pos(), p0)])
