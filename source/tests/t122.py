import json
ev = lambda s: pg.evaluate(s)
def shot(n): pg.screenshot(path='out/%s.png' % n)
ev('Object.assign(__g.state.qflags, {chapterOne: true}); __g.state.placing = null'); ev('__g.enemies.length = 0')
ev('Object.keys(__g.state.quests).forEach(k => {})')
before = json.loads(ev('JSON.stringify({objs: Array.from(__g.objs).filter(Boolean).length, structs: __g.structs.size})'))
ev('__g.enterMap("spine", 12, 64)'); pg.wait_for_timeout(2600)
print('in', ev('__g.state.map'), '| quest started by entering?', ev('JSON.stringify(Object.keys(__g.state.quests).filter(k=>k==="stairs"))'))
rooms = json.loads(ev('JSON.stringify(__g.MAPDEFS.spine.rooms_.map(r=>[r.cx,r.cy]))'))
relays = json.loads(ev('JSON.stringify([...__g.INTERACT.entries()].filter(([i,it])=>it.kind==="relay").map(([i,it])=>[i, it.n]))'))
print('rooms:', rooms, '| relays:', relays)
# use each relay through the real action path
for i, n in relays:
    ev('__g.state.player.x = %d*16 + 8 + 0; __g.state.player.y = (%d+1)*16' % (i % 128, i // 128))
    ev('__g.useInteract(__g.INTERACT.get(%d), %d)' % (i, i)); pg.wait_for_timeout(300)
print('relays done:', ev('JSON.stringify(__g.state.mapFlags.spine)'), '| lights:', ev('__g.MAP_LIGHTS.length'))
print('hatch locked reason now:', ev('(()=>{ const it=[...__g.INTERACT.values()].find(x=>x.to==="tidewrack"); return it.locked(); })()'))
# save in the Spine, then check the packed state
ev('__g.state.spawnPts[0].respawnAt = 1e12; __g.state.spawnPts[0].e = null')
d = json.loads(ev('JSON.stringify((()=>{ const s = __g.snapshotMap(); const p = __g.packMap(s, __g.state.mapFlags.spine); return {keys: Object.keys(p), flags: p.flags, sp: p.spawnPts.length}; })())'))
print('packed spine:', d)
# go back up
up = json.loads(ev('JSON.stringify([...__g.INTERACT.entries()].find(([i,it])=>it.up).slice(0,1))'))[0]
ev('__g.state.player.x = %d*16 + 8; __g.state.player.y = (%d+1)*16' % (up % 128, up // 128))
ev('__g.useInteract(__g.INTERACT.get(%d), %d)' % (up, up)); pg.wait_for_timeout(2600)
after = json.loads(ev('JSON.stringify({objs: Array.from(__g.objs).filter(Boolean).length, structs: __g.structs.size})'))
print('back on', ev('__g.state.map'), '| overworld before/after:', before, after, '| player at', ev('JSON.stringify([Math.floor(__g.state.player.x/16), Math.floor(__g.state.player.y/16)])'), '| portal at', ev('JSON.stringify(__g.state.towerPortal)'))
shot('m_back')
