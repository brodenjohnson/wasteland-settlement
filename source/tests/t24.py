import json, random
ev = lambda s: pg.evaluate(s)
print('init ms since navigation start:', round(ev('window.__initMs')))
pg.keyboard.press('h'); pg.keyboard.press('g'); pg.keyboard.press('u'); pg.wait_for_timeout(100)
spots = [(28,70),(30,42),(62,70),(100,56),(96,100),(88,26),(70,112),(60,92),(30,60),(14,64)]
fpsl = []
for k, (tx, ty) in enumerate(spots):
    ev('__g.state.player.x = %d*16+8; __g.state.player.y = %d*16+8; __g.state.player.health = 100' % (tx, ty))
    for step in range(10):
        key = random.choice('wasd'); pg.keyboard.down(key); pg.wait_for_timeout(260); pg.keyboard.up(key)
        if step % 3 == 0:
            pg.keyboard.press(str(random.randint(1, 9))); pg.mouse.move(random.randint(300, 800), random.randint(200, 500)); pg.mouse.down(); pg.wait_for_timeout(250); pg.mouse.up()
    fpsl.append(ev('new Promise(r => { let n = 0; const t0 = performance.now(); (function f(){ n++; if (performance.now() - t0 < 700) requestAnimationFrame(f); else r(n / 0.7); })(); })'))
print('fps by region:', [round(f) for f in fpsl])
print('enemies', ev('__g.enemies.length'), 'level', ev('__g.state.player.level'), 'zone', ev('__g.state.zone'))
pg.keyboard.press('m'); pg.wait_for_timeout(250)
pg.screenshot(path='out/map2.png')
