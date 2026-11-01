import json
ev = lambda s: pg.evaluate(s)
BX, BY = 28, 98
ev('__g.state.placing = null; __g.enemies.length = 0')
spot = json.loads(ev('''JSON.stringify((()=>{ for (let r=0;r<30;r++) for (let dy=-r;dy<=r;dy++) for (let dx=-r;dx<=r;dx++){ const x=(60+dx)*16+8, y=(60+dy)*16+8; let ok=true; for (let k=-4;k<=4;k++) for (let j=-4;j<=4;j++) if (__g.collides(x+k*16, y+j*16, 10, true)) ok=false; if (ok) return [x,y]; } })())'''))
ev('__g.state.player.x = %d; __g.state.player.y = %d' % tuple(spot)); pg.wait_for_timeout(300)
tx, ty = int(spot[0] // 16), int(spot[1] // 16)
ev('__g.structs.set(%d*128+%d, __g.newStruct("chest")); __g.structs.set(%d*128+%d, __g.newStruct("bunk"))' % (ty - 2, tx, ty - 2, tx + 2))
ev('const c=__g.structs.get(%d*128+%d); c.slots[0]={name:"Wood",qty:7}' % (ty - 2, tx))
ev('__g.state.placing = null'); pg.keyboard.press('3')
def sc(tx2, ty2): return 550 + ((tx2 + 0.5) * 16 - spot[0]) * 4, 350 + ((ty2 + 0.5) * 16 - spot[1]) * 4
x, y = sc(tx, ty - 2); pg.mouse.move(x, y); pg.wait_for_timeout(150); pg.keyboard.press('f'); pg.wait_for_timeout(300)
print('after F on chest: placing', ev('__g.state.placing'), '| moving', ev('!!__g.state.moving'))
x, y = sc(tx - 3, ty - 2); pg.mouse.move(x, y); pg.wait_for_timeout(200); pg.mouse.click(x, y); pg.wait_for_timeout(400)
print('chest moved:', ev('__g.structs.has(%d*128+%d)' % (ty - 2, tx - 3)), '| old spot empty:', ev('!__g.structs.has(%d*128+%d)' % (ty - 2, tx)), '| contents kept:', ev('JSON.stringify((__g.structs.get(%d*128+%d)||{slots:[]}).slots.filter(Boolean))' % (ty - 2, tx - 3)))
x, y = sc(tx + 2, ty - 2); pg.mouse.move(x, y); pg.wait_for_timeout(150); pg.keyboard.press('f'); pg.wait_for_timeout(300)
x, y = sc(tx + 4, ty - 2); pg.mouse.move(x, y); pg.wait_for_timeout(200); pg.mouse.click(x, y); pg.wait_for_timeout(400)
print('bunk moved:', ev('__g.structs.has(%d*128+%d)' % (ty - 2, tx + 4)))
