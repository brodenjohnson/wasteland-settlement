import json
ev = lambda s: pg.evaluate(s)
open('out/docs.json', 'w').write(ev('JSON.stringify({docs: __g.DOCS, quests: __g.QUEST_DEFS.filter(q => ["note","pump","signal"].includes(q.id)).map(q => ({id:q.id,title:q.title,giver:q.giver,desc:q.desc,steps:q.steps.map(s=>s.text),reward:q.reward}))})'))
