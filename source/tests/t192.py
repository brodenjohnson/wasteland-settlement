import json
ev = lambda s: pg.evaluate(s)
print('crop value per tile-day after the pass:')
for r in json.loads(ev('''JSON.stringify(Object.entries(__g.CROPS).map(([k,c])=>{ const yld=(c.yield||1), rg=c.regrow||0, v=__g.itemValue(c.produce); return [c.produce, "T"+c.tier, Math.round(((rg? yld*v/rg : yld*v/c.days))*10)/10]; }))''')): print(' ', r)
print('jerky: ingredients', ev('__g.itemValue("Raw Meat")*2'), '-> output', ev('__g.itemValue("Jerky")*2'))
res = []
for L in (3, 5, 8, 10):
    ev('__g.state.player.level = %d' % L)
    row = [L]
    for t in ('kingpin', 'chief', 'hollowclaw'):
        e = json.loads(ev('JSON.stringify((()=>{ const e = __g.spawnEnemy("%s", 100, 100, {}); __g.enemies.pop(); const s = __g.scaledStats(e); return [e.lvl, Math.round(e.maxHp), Math.round(s.dmg)]; })())' % t)); row.append((t, e))
    res.append(row)
for r in res: print('player L%d:' % r[0], r[1:])
