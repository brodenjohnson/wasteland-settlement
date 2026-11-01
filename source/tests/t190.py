import json
ev = lambda s: pg.evaluate(s)
print('=== CROP ECONOMY (sell price is usually half of value; per tile, ignoring water) ===')
rows = json.loads(ev('''JSON.stringify(Object.entries(__g.CROPS).map(([k,c])=>{ const days=c.days, yld=(c.yield||1), regrow=c.regrow||0; const cycle = regrow? regrow : days; const val=__g.itemValue(c.produce); const per = regrow ? (yld*val)/regrow : (yld*val)/days; return [c.produce, c.tier, c.lvl, days, regrow, yld, val, Math.round(per*10)/10]; }))'''))
print('crop, tier, lvl, days, regrow, yield, value, value per tile-day (raw)')
for r in rows: print(' ', r)
print('=== DISHES: food restored per ingredient value, and sale value vs ingredients ===')
d = json.loads(ev('''JSON.stringify(__g.RECIPES.filter(r=>r.cat==="Cooking").map(r=>{ const out=Object.keys(r.gives)[0]; const outv=__g.itemValue(out)*r.gives[out]; const inv=Object.entries(r.cost).reduce((a,[k,q])=>a+__g.itemValue(k)*q,0); const u=__g.ITEM_USE?__g.ITEM_USE[out]:null; return [out, r.station, inv, outv, Math.round(outv/inv*100)/100, u?JSON.stringify(u):""]; }))'''))
for r in d: print(' ', r)
