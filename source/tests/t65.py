import json
ev = lambda s: pg.evaluate(s)
d = ev('''JSON.stringify({
  recipes: __g.RECIPES.map(r => ({id:r.id, name:r.name, cat:r.cat, tier:r.tier, cost:r.cost, skill:r.skill||null, unlock:r.unlock||null, station:r.station||null})),
  quests: __g.QUEST_DEFS.map(q => ({id:q.id, title:q.title, giver:q.giver, steps:q.steps.map(s=>s.text), reward:q.reward}))
})''')
open('out/wikidump.json', 'w').write(d)
print(len(d))
