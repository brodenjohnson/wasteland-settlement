# World atlas spike (Phase 0). Not in the regression list: it measures, it does not check.
# Prints: map generation times, render cost, memory held by stashed maps, save size raw and gzipped.
import json
ev = lambda s: pg.evaluate(s)
bad = []
ev('__g.state.placing = null; __g.enemies.length = 0; __g.state.iframes = 9999; __g.state.gameMinutes = 12*60 + 1440*2')
pg.wait_for_timeout(500)

def heap(): return ev('performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : -1')

def render_ms(n=120):
    return ev('''(() => { const t0 = performance.now(); for (let k = 0; k < %d; k++) __g.render(); return (performance.now() - t0) / %d; })()''' % (n, n))

def save_size():
    return json.loads(ev('''(async () => {
      const s = JSON.stringify(__g.serialize());
      const cs = new CompressionStream('gzip'), w = cs.writable.getWriter(); w.write(new TextEncoder().encode(s)); w.close();
      const gz = (await new Response(cs.readable).arrayBuffer()).byteLength;
      const d = JSON.parse(s), per = {};
      for (const k of Object.keys(d.mapStates || {})) { const m = d.mapStates[k]; per[k] = { all: JSON.stringify(m).length, fog: (m.fog || '').length, objs: (m.objs || '').length }; }
      return JSON.stringify({ raw: s.length, gz, per, top: Object.entries(d).map(([k, v]) => [k, JSON.stringify(v === undefined ? null : v).length]).sort((a, b) => b[1] - a[1]).slice(0, 8) });
    })()'''))

print('--- baseline, Wastes only')
print('heap MB', heap())
print('render ms/frame in the Wastes: %.2f' % render_ms())
s0 = save_size(); print('save raw %d B, gzip %d B' % (s0['raw'], s0['gz'])); print('largest keys', s0['top'])

print('--- generate every map once (switchMap, no fade)')
ids = ev('Object.keys(__g.MAPDEFS)')
times = {}
for id in ids:
    if id == 'wastes': continue
    t = ev('''(() => { const t0 = performance.now(); __g.switchMap("%s", -1, -1); return performance.now() - t0; })()''' % id)
    times[id] = round(t, 1)
for id in sorted(times, key=lambda k: -times[k])[:10]: print('  %-18s %6.1f ms' % (id, times[id]))
print('maps generated %d, mean %.1f ms, max %.1f ms' % (len(times), sum(times.values()) / len(times), max(times.values())))
ev('__g.switchMap("tidewrack", -1, -1)'); pg.wait_for_timeout(300)
print('render ms/frame on the Tidewrack: %.2f' % render_ms())
ev('__g.switchMap("hull", -1, -1)'); pg.wait_for_timeout(300)
print('render ms/frame in the Hull: %.2f' % render_ms())
ev('__g.switchMap("wastes", 64, 64)'); pg.wait_for_timeout(300)

print('--- memory')
stashed = ev('Object.keys(__g.STASH).length')
gbytes = ev('(() => { let b = 0; for (const k of Object.keys(__g.STASH)) { const g = __g.STASH[k].ground; if (g) b += g.width * g.height * 4; } return b; })()')
abytes = ev('(() => { let b = 0; for (const k of Object.keys(__g.STASH)) for (const a of Object.values(__g.STASH[k].arrays)) b += a.byteLength; return b; })()')
print('stashed maps %d, ground canvases %.1f MB, tile arrays %.1f MB, JS heap now %d MB' % (stashed, gbytes / 1048576, abytes / 1048576, heap()))
print('one ground canvas: %.1f MB' % (gbytes / max(1, stashed) / 1048576))

print('--- save after visiting everything')
s1 = save_size(); print('save raw %d B, gzip %d B' % (s1['raw'], s1['gz']))
fog = sum(v['fog'] for v in s1['per'].values()); objs = sum(v['objs'] for v in s1['per'].values()); allm = sum(v['all'] for v in s1['per'].values())
print('per-map states %d B total over %d maps (fog images %d B, objs %d B)' % (allm, len(s1['per']), fog, objs))
print('largest keys', s1['top'])
print('ERRORS: ' + ('none' if not bad else ', '.join(bad)))
