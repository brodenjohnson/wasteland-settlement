import json, random
ev = lambda s: pg.evaluate(s)
pg.keyboard.press('h'); pg.keyboard.press('g'); pg.keyboard.press('u'); pg.wait_for_timeout(100)
# fps probe
fps = ev('new Promise(r => { let n = 0; const t0 = performance.now(); (function f(){ n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else r(n / 2); })(); })')
print('fps ~', fps)
# soak: wander around with random keys/clicks for 25s, with a raid and fast time
ev('__g.startRaid(3)')
keys = ['w', 'a', 's', 'd']
for step in range(50):
    k = random.choice(keys)
    pg.keyboard.down(k); pg.wait_for_timeout(250); pg.keyboard.up(k)
    if step % 7 == 0:
        pg.keyboard.press(str(random.randint(1, 9)))
        pg.mouse.move(random.randint(300, 800), random.randint(200, 500)); pg.mouse.down(); pg.wait_for_timeout(300); pg.mouse.up()
    if step == 25: pg.keyboard.press('t')
p = ev('JSON.stringify({hp:Math.round(__g.state.player.health), lvl:__g.state.player.level, enemies:__g.enemies.length, drops:__g.state.drops.length})')
print('after soak:', p)
pg.keyboard.press('c'); pg.wait_for_timeout(100)
for tab in range(5):
    rects = json.loads(ev('JSON.stringify(__g.state.uiRects)'))
    r = rects[tab]; pg.mouse.click(r['x'] + r['w']/2, r['y'] + r['h']/2); pg.wait_for_timeout(120)
    if tab == 3:
        pg.mouse.wheel(0, 300); pg.wait_for_timeout(150)
        pg.screenshot(path='out/armour_tab.png')
