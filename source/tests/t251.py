import json
ev = lambda s: pg.evaluate(s)
bad = []
def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok: bad.append(what)
# every Hull vendor can build a day's stock (the armoury and cantina used to throw)
for k in ['general', 'armoury', 'armourer', 'apothecary', 'clinic', 'stockyard', 'scrapyard', 'cantina', 'tinkers', 'reclaimers', 'guard']:
    try:
        n = ev('__g.stockFor({ sid: "t_%s", id: 9000, vendor: "%s" }).length' % (k, k))
        check(n > 0, 'vendor %s stocks %d things' % (k, n))
    except Exception as ex:
        check(False, 'vendor %s throws: %s' % (k, str(ex).splitlines()[0][:80]))
# the wiki data dump works and has the tables wiki.py needs
d = json.loads(ev('JSON.stringify(__g.wikiData())'))
check(all(k in d for k in ['WEAPONS', 'ARMOUR', 'RECIPES', 'VENDOR_STOCK', 'VALUES', 'SKILLS', 'ROSTER']), 'wikiData has every table')
check(d['VENDOR_STOCK']['armoury'].get('Combat Cleaver') == 3, 'armoury gates its best weapons at Hull reputation 3')
# newer builds count toward the camp's level
p0 = ev('__g.settlementPoints()')
ev('''(() => { const O = __g.ORIGIN; [['weaponbench', 6], ['armourbench', 7], ['trough', 8], ['sprinkler', 9]].forEach(([t, dx]) => __g.structs.set((O.y - 6) * 128 + O.x + dx, __g.newStruct(t))); })()''')
pg.wait_for_timeout(1700)
check(ev('__g.settlementPoints()') >= p0 + 7, 'benches, a trough and a sprinkler add camp points (%s to %s)' % (p0, ev('__g.settlementPoints()')))
# the title screen shows the wiki button
ev('__g.settings.cwSeen = true; __g.state.title = true'); pg.wait_for_timeout(500)
pg.screenshot(path='out/t251_title.png')
if bad: errs.append('t251: ' + '; '.join(bad))
