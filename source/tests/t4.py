import json
ev = lambda s: pg.evaluate(s)
def slot(name): return ev("__g.state.player.inventory.findIndex(s=>s&&s.name==='%s')" % name)
pg.keyboard.press('h'); pg.keyboard.press('g'); pg.keyboard.press('u'); pg.wait_for_timeout(100)
# put a workbench + barricade into the world for the raid to chew on
ev('__g.structs.set(30*60+34, {type:"workbench", hp:120}); __g.structs.set(31*60+35, {type:"barricade", hp:90})')
# --- sleeping: daytime refusal, then night success ---
pg.mouse.move(550, 350 - 5*3)
pg.mouse.move(550, 350); 
ev('__g.trySleep()'); print('day sleep ->', ev('__g.state.sleeping'), ev('__g.state.msg'))
ev('__g.state.gameMinutes = 21*60'); ev('__g.trySleep()'); print('night sleep ->', ev('__g.state.sleeping'))
pg.wait_for_timeout(2500)
print('after sleep: sleeping', ev('__g.state.sleeping'), 'hour', ev('__g.clockHour().toFixed(1)'), 'day', ev('__g.clockDay()'), 'food', ev('Math.round(__g.state.player.food)'))
# --- raid on day 2 ---
ev('__g.state.gameMinutes = 24*60*1 + 19*60 + 5'); pg.wait_for_timeout(400)
print('raid active:', ev('!!__g.state.raid'), 'raiders', ev('__g.enemies.filter(e=>e.raid).length'))
pg.wait_for_timeout(9000)
print('structs:', ev('[...__g.structs.values()].map(s=>s.type+":"+Math.round(s.hp)).join(",")'), 'raiders', ev('__g.enemies.filter(e=>e.raid).length'), 'hp', ev('Math.round(__g.state.player.health)'))
pg.screenshot(path='out/raid.png')
