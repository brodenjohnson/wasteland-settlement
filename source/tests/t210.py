import json
ev = lambda s: pg.evaluate(s)
print(ev('JSON.stringify(Object.fromEntries(Object.entries(__g.ARMOUR).map(([k,a])=>[k,[a.slot,a.dmg,a.rad||0]])))'))
print(ev('JSON.stringify(Object.fromEntries(Object.entries(__g.WEAPONS).filter(([k,w])=>w.kind==="gun").map(([k,w])=>[k,w])))'))
print(ev('JSON.stringify(__g.RECIPES.filter(r=>r.cat==="Weapons"||r.cat==="Armour").map(r=>[r.id,r.name,r.station,r.tier,JSON.stringify(r.cost),r.unlock||"",r.skill?r.skill.join(":"):""]))'))
print(ev('JSON.stringify(Object.keys(__g.ITEM_USE).slice(0,3))'), ev('typeof __g.STATION_NAMES'), ev('JSON.stringify(Object.keys(__g.DROPS))'))
