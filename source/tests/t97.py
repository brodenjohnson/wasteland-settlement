import json
ev = lambda s: pg.evaluate(s)
BX, BY = 28, 98
def shot(n): pg.screenshot(path='out/%s.png' % n)
ev('__g.state.title = false'); ev('Object.assign(__g.state.qflags, {storyInit:true, sitesPlaced:true, spawnVar:true, "read:Folded Note":true}); __g.state.intro = null; __g.state.reading = null')
ev('__g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 }); __g.enemies.length = 0')
pg.wait_for_timeout(400)
import collections
tally = collections.Counter(json.loads(ev('JSON.stringify(Array.from({length: 20}, () => __g.pickRaid(7).name))')))
print('20 raid picks on day 7:', dict(tally))
print('day 2 raids only use:', set(json.loads(ev('JSON.stringify(Array.from({length: 20}, () => (__g.state.raidCount = 0, __g.pickRaid(2).name)))'))))
# siege through the n key
ev('__g.state.raidCount = 4; __g.state.gameMinutes = 7 * 1440 + 19 * 60')
ev('__g.state.player.x=(%d+0.5)*16; __g.state.player.y=(%d+0.5)*16' % (BX, BY))
pg.keyboard.press('n'); pg.wait_for_timeout(800)
print('siege banner:', ev('JSON.stringify(__g.state.raid)'), '| enemies:', ev('JSON.stringify(Object.entries(__g.enemies.reduce((a,e)=>(a[e.type]=(a[e.type]||0)+1,a),{})))'))
shot('e_siege')
