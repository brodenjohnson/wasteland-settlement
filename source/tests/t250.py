import json
ev = lambda s: pg.evaluate(s)
def shot(n): pg.screenshot(path='out/%s.png' % n)
bad = []
def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok: bad.append(what)
# a stuck quorum quest: console read, chapel flag never set
ev('__g.state.quests.quorum = { status: "active", done: { tags: true } }; __g.state.qflags["console:read"] = true; delete __g.state.qflags.chapel_open')
pg.wait_for_timeout(1500)
check(ev('__g.state.quests.quorum.status') == 'done', 'quorum completes once the console is read, chapel skipped')
# save twice, export
ev('__g.addItem("Wood", 41)')
ev('__g.doSave("1", true)'); pg.wait_for_timeout(1200)
ev('__g.doSave("auto", false)'); pg.wait_for_timeout(1200)
cid = ev('__g.state.charId')
d = ev('__g.exportData("%s").then(d => JSON.stringify(d))' % cid)
dd = json.loads(d)
check(dd['format'] == 'wasteland-settlement-export' and sorted(s['slot'] for s in dd['saves']) == ['1', 'auto'], 'export holds both saves')
check(json.loads(dd['saves'][0]['json'])['char']['name'] == 'Tester', 'exported save is readable JSON with the character')
# delete, then import
ev('__g.deleteChar("%s")' % cid); pg.wait_for_timeout(800)
check(ev('__g.state.chars.length') == 0, 'character deleted')
nid = ev('__g.importText(%s)' % json.dumps(d))
check(nid == cid, 'import restores the original id when free')
check(ev('__g.state.chars.length') == 1 and ev('__g.state.chars[0].name') == 'Tester', 'character is back in the list')
# importing again does not overwrite
nid2 = ev('__g.importText(%s)' % json.dumps(d))
check(nid2 and nid2 != cid and ev('__g.state.chars.length') == 2, 'second import comes in as a copy')
# junk is refused
check(ev('__g.importText("{\\"hello\\":1}")') is None and ev('__g.state.chars.length') == 2, 'junk file is refused')
# the characters screen, with the new buttons
ev("__g.settings.cwSeen = true"); ev('__g.state.title = true; __g.state.charsOpen = true; __g.state.selChar = "%s"' % cid); pg.wait_for_timeout(500)
shot('t250_chars')
# load the imported save (the page reloads because a game is running)
ev('__g.loadSlot("%s", "1")' % cid); pg.wait_for_timeout(4000)
check(ev('__g.state.charId') == cid and ev('__g.countItem("Wood")') >= 41, 'imported save loads with its items')
if bad: errs.append('t250: ' + '; '.join(bad))
