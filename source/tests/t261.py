# World atlas Phase 1a: place registry, discovery and pips, the region counter, found logs, codex pictures, map memory cap.
import json
ev = lambda s: pg.evaluate(s)
def shot(n): pg.screenshot(path='out/%s.png' % n)
bad = []
def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok: bad.append(what)
ev('__g.state.placing = null; __g.enemies.length = 0; __g.state.iframes = 9999; __g.state.gameMinutes = 12*60 + 1440*2')
def tp(x, y): ev('__g.state.player.x = (%s + 0.5) * 16; __g.state.player.y = (%s + 0.5) * 16' % (x, y)); pg.wait_for_timeout(900)

# the registry
check(ev('__g.PLACES.length') >= 11, 'the registry holds the existing places')
c = json.loads(ev('JSON.stringify(__g.regionCount(1))'))
check(c['total'] == 10, 'Region 1 counts ten places (%s)' % c)
check(ev('__g.PLACES.filter(p => p.region === 1).every(p => p.at())'), 'every Region 1 place has a spot on the map')
check(not ev('__g.placeSeen("deepcut")'), 'Deepcut starts undiscovered')

# walking up to a place discovers it, with a stinger and a marker
p = json.loads(ev('JSON.stringify(__g.PLACES.find(p => p.id === "deepcut").at())'))
tp(p['x'] + 3, p['y'] - 2)
check(ev('__g.placeSeen("deepcut")'), 'getting close discovers Deepcut')
check(ev('!!__g.state.stinger && __g.state.stinger.title === "Deepcut"'), 'a stinger shows the name')
shot('t261_stinger')
check(ev('__g.state.markers.filter(m => m.placeId === "deepcut").length') == 1, 'one marker for Deepcut')
check(ev('!!__g.state.codex.places["Deepcut"]'), 'the codex has Deepcut')
check(not ev('__g.poiList().some(q => q.name === "Deepcut")'), 'a found place does not come back as a rumour')
# landmarks show from further away
a = json.loads(ev('JSON.stringify(__g.PLACES.find(p => p.id === "ashtower").at())'))
tp(a['x'] + 22, a['y'] + 8)
check(ev('__g.placeSeen("ashtower")'), 'the Ash Tower is seen from 23 tiles')
# a marked rumour becomes the place marker, not a second one
ev('__g.markHull()')
h = json.loads(ev('JSON.stringify(__g.PLACES.find(p => p.id === "hull").at())'))
tp(h['x'] - 4, h['y'] - 4)
check(ev('__g.placeSeen("hull")') and ev('__g.state.markers.filter(m => m.label === "The Hull").length') == 1, 'the Hull rumour turns into its place marker')
check(json.loads(ev('JSON.stringify(__g.regionCount(1))'))['found'] == 3, 'the counter reads 3')

# the big map with pips and the counter
ev('__g.state.stinger = null; __g.state.mapOpen = true'); pg.wait_for_timeout(500); shot('t261_map'); ev('__g.state.mapOpen = false')

# found logs and pictures in the codex
ev('__g.state.qflags["read:Folded Note"] = true')
rows = json.loads(ev('JSON.stringify(__g.codexUniverse()[4])'))
check(any(r['key'].startswith('thread:') for r in rows), 'found logs are grouped by thread')
check(any(r['key'] == 'doc:Folded Note' and r['found'] for r in rows), 'a read document shows in found logs')
check(ev('__g.threadCounts()["The Eleven"].read') >= 1, 'the thread counts what you have read')
for k, sel in [(0, '"glowrat"'), (1, '"Rusty Pipe"'), (2, '"Marta Voss"'), (3, '"Deepcut"'), (4, '"doc:Folded Note"')]:
    ev('__g.state.codex.creatures.glowrat = 1; __g.state.codex.people["Marta Voss"] = 1; __g.state.codex.items["Rusty Pipe"] = 1; __g.state.codexOpen = true; __g.state.codexTab = %d; __g.state.codexSel[%d] = %s' % (k, k, sel))
    pg.wait_for_timeout(350)
    if k in (0, 3, 4): shot('t261_codex%d' % k)
ev('__g.state.codexOpen = false')

# entering a map discovers its place
ev('__g.switchMap("hollow", -1, -1)'); pg.wait_for_timeout(900)
check(ev('__g.placeSeen("hollow")'), 'going into the Hollow discovers it')

# memory: only a few maps are kept; an evicted one comes back with what you dropped
ev('__g.state.drops.push({ x: __g.state.player.x + 90, y: __g.state.player.y, name: "Scrap", qty: 3, t: 0 })')
for m in ['megamart', 'pylon3', 'spine', 'deepcut', 'hull_inn', 'wastes']:
    ev('__g.switchMap("%s", -1, -1)' % m); pg.wait_for_timeout(250)
keys = ev('Object.keys(__g.STASH)')
check(len(keys) <= 5 and 'hollow' not in keys, 'old maps are let go of (%s)' % keys)
check(ev('!!__g.SAVED.hollow'), 'the Hollow is packed instead')
ev('__g.switchMap("hollow", -1, -1)'); pg.wait_for_timeout(900)
check(ev('__g.state.map') == 'hollow' and ev('__g.state.drops.some(d => d.name === "Scrap" && d.qty === 3)'), 'back in the Hollow, the dropped scrap is still there')
ev('__g.switchMap("wastes", 64, 64)'); pg.wait_for_timeout(600)

# saving keeps it, and an old save without places is filled in from what it has visited
ev('__g.doSave("2", true)'); pg.wait_for_timeout(1500)
cid = ev('__g.state.charId')
pg.reload(); pg.wait_for_timeout(2500); ev('__g.loadSlot("%s", "2")' % cid); pg.wait_for_timeout(3000)
check(ev('__g.placeSeen("deepcut") && __g.placeSeen("hull")'), 'discoveries survive a save and load')
ev('__g.state.places = {}; __g.backfillPlaces()')
check(ev('__g.placeSeen("hollow") && __g.placeSeen("megamart")') and not ev('__g.placeSeen("depot")'), 'an old save counts the places it already visited')
check(ev('__g.state.markers.filter(m => m.placeId === "hollow").length') == 1, 'and puts them on the map')
print('ERRORS: ' + ('none' if not bad else ', '.join(bad)))
