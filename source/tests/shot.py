import sys, json, os
from playwright.sync_api import sync_playwright
path = sys.argv[1]; out = sys.argv[2]
script = sys.argv[3] if len(sys.argv) > 3 else ''
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1100, 'height': 700})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append('console:' + m.text) if m.type == 'error' else None)
    pg.goto('file://' + path)
    pg.wait_for_timeout(600)
    if os.environ.get('LEGACY'):
        pg.wait_for_timeout(1200)
        pg.evaluate("__g.newCharacter(); __g.state.creating.name = 'Tester'; __g.beginGame();")
        pg.wait_for_timeout(600)
        pg.evaluate("(() => { const O = __g.ORIGIN; __g.structs.set(O.y*128+O.x, __g.newStruct('bedroll')); __g.structs.set(O.y*128+O.x+2, __g.newStruct('campfire')); Object.assign(__g.state.qflags, {storyInit:true, sitesPlaced:true, spawnVar:true, 'read:Folded Note':true}); __g.state.intro = null; __g.state.reading = null; })()")
        pg.wait_for_timeout(900)
    if script:
        exec(open(script).read())
    pg.screenshot(path=out)
    print('ERRORS:', errs if errs else 'none')
    b.close()
