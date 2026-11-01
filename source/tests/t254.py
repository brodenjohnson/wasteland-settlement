import json
ev = lambda s: pg.evaluate(s)
def shot(n): pg.screenshot(path='out/%s.png' % n)
bad = []
def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok: bad.append(what)
R = lambda id: '__g.RECIPES.find(r => r.id === "%s")' % id
unl = lambda id: ev('__g.recipeUnlocked(%s)' % R(id))
why = lambda id: ev('__g.recipeStatus(%s).why || "ok"' % R(id))
ev('__g.state.placing = null; __g.enemies.length = 0; __g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 }); __g.state.nextRaidDay = 1e9; __g.state.storm = null; __g.state.nextStormDay = 1e9; __g.state.gameMinutes = 13*60 + 1440*2')
O = json.loads(ev('JSON.stringify(__g.ORIGIN)'))
put = lambda t, dx, dy: ev('__g.structs.set(%d, __g.newStruct("%s"))' % ((O['y'] + dy) * 128 + O['x'] + dx, t))
tp = lambda dx, dy: ev('__g.state.player.x = (%d + 0.5) * 16; __g.state.player.y = (%d + 0.5) * 16' % (O['x'] + dx, O['y'] + dy))
# stations and tabs
check(ev('__g.RECIPES.every(r => r.cat !== "Weapons" || r.station === "weaponbench") && __g.RECIPES.every(r => r.cat !== "Armour" || r.station === "armourbench")'), 'every weapon is made at the Weapon Bench and every armour piece at the Armour Bench')
check(ev('%s.station' % R('bandage')) == 'medstation' and ev('%s.cat' % R('medkit')) == 'Medical', 'medicine moves to the Medical Station')
check(ev('__g.RECIPES.filter(r => r.id === "banner").length') == 1, 'one banner recipe, not two')
# tier gates
check(unl('machete') and not unl('pistol'), 'Scavenger gear is open from the start, Forge Age is not')
print('  pipe pistol, locked:', why('pistol'))
ev('__g.state.settleLvl = 3'); check(not unl('pistol'), 'Hamlet alone does not open Forge Age')
put('forge', -6, 3); check(unl('pistol') and not unl('scrap_smg'), 'Hamlet and a Forge open Forge Age, not Settlement')
ev('__g.state.settleLvl = 4'); put('anvil', -5, 3); check(unl('scrap_smg') and not unl('rifle'), 'Settlement and an Anvil open the Settlement tier')
ev('__g.state.settleLvl = 6'); put('machineshop', -4, 3); check(not unl('rifle'), 'a Machine Shop without a Generator does not open Industry')
put('generator', -3, 3); check(unl('rifle') and ev('%s.cost["Machined Parts"]' % R('rifle')) == 2, 'with a Generator, Industry opens, and its gear needs Machined Parts')
# walking up to the benches
put('weaponbench', 6, 0); put('medstation', 6, 2); put('workbench', -6, -2)
tp(0, 0)
check(not ev('__g.stationNear("weaponbench")') and ev('__g.stationNear("workbench")'), 'the Workbench works from across the camp, the Weapon Bench does not')
print('  machete from across the camp:', why('machete'))
tp(5, 0)
check(ev('__g.stationNear("weaponbench")') and ev('__g.recipeStatus(%s).why' % R('machete')) != 'Use a Weapon Bench in person', 'standing at the Weapon Bench, it works')
ev('__g.openBench("weaponbench")'); pg.wait_for_timeout(400)
check(ev('__g.state.craftOpen') and ev('__g.CRAFT_TABS[__g.state.craftTab]') == 'Weapons', 'using the Weapon Bench opens the Weapons tab')
ev('__g.addItem("Wood", 20); __g.addItem("Scrap", 30)'); pg.wait_for_timeout(300); shot('t254_weapons'); ev('__g.closePanels && __g.closePanels(); __g.state.craftOpen = false')
# sleeping by day, and getting up
tp(0, 1); ev('__g.state.player.energy = 40')
ev('__g.trySleep()'); pg.wait_for_timeout(300)
check(ev('__g.state.sleeping') and ev('!!__g.state.daySleep'), 'you can sleep at 13:00 when nothing is near')
pg.keyboard.press(' '); pg.wait_for_timeout(300)
check(not ev('__g.state.sleeping'), 'Space stops sleeping')
ev('__g.state.player.energy = 30; __g.trySleep()'); pg.wait_for_timeout(9000)
check(not ev('__g.state.sleeping') and ev('__g.state.player.energy') >= 95, 'a nap ends by itself once you are rested (energy %d)' % ev('__g.state.player.energy'))
# the Clinic Bed
put('clinic', 2, 4); ev('__g.state.player.health = 30; __g.state.player.energy = 30; __g.state.sleepClinic = true; __g.trySleep()'); pg.wait_for_timeout(250); shot('t254_clinic')
h1 = ev('__g.state.player.health')
check(ev('__g.state.sleeping') and h1 > 40, 'sleeping in a Clinic Bed heals fast (30 to %d in a quarter second of fast-forward)' % h1)
ev('__g.stopSleeping()')
# raids grow a little with the camp
r1 = json.loads(ev('(() => { __g.state.settleLvl = 1; const a = __g.pickRaid(3); __g.state.settleLvl = 6; const b = __g.pickRaid(3); return JSON.stringify([a.name, a.mult, b.name, b.mult]); })()'))
print('  raid at camp level 1 and 6:', r1)
# unique blueprints: the Hollow's crossbow brings Whisper
ev('__g.state.settleLvl = 6; __g.addItem("Warden\'s Crossbow", 1)'); pg.wait_for_timeout(2600)
check(ev('__g.countItem("Blueprint: Whisper")') == 1, 'the Hollow\'s crossbow comes with the Whisper blueprint')
check(not unl('whisper'), 'Whisper cannot be made before the blueprint is learned')
ev('(() => { const i = __g.state.player.inventory.findIndex(s => s && s.name === "Blueprint: Whisper"); __g.useItem(i); })()')
check(unl('whisper'), 'learning the blueprint unlocks Whisper')
# old manuals give Crafting experience instead
x0 = ev('__g.state.player.skills.crafting.xp + __g.state.player.skills.crafting.lvl * 1000')
ev('__g.addItem("Blueprint: Forge Plans", 1); (() => { const i = __g.state.player.inventory.findIndex(s => s && s.name === "Blueprint: Forge Plans"); __g.useItem(i); })()')
check(ev('__g.state.player.skills.crafting.xp + __g.state.player.skills.crafting.lvl * 1000') > x0 and ev('__g.countItem("Blueprint: Forge Plans")') == 0, 'an old manual is read for Crafting experience')
# the Tinkers sell no old manuals, and Guild Plate at reputation 5
s0 = json.loads(ev('JSON.stringify(__g.stockFor({ sid: "tk0", id: 9100, vendor: "tinkers" }).map(s => s.name))'))
ev('__g.state.rep.hull = 5; __g.state.mapFlags.hull.stock = {}'); s5 = json.loads(ev('JSON.stringify(__g.stockFor({ sid: "tk5", id: 9101, vendor: "tinkers" }).map(s => s.name))'))
check(not any(n.startswith('Blueprint') for n in s0) and 'Blueprint: Guild Plate' in s5, 'the Tinkers sell Guild Plate at Hull reputation 5, and no old manuals')
# the Progress screen
ev('__g.state.settleLvl = 2; __g.structs.delete(%d)' % ((O['y'] + 3) * 128 + O['x'] - 6)); print('  next step:', ev('__g.nextStep()'))
ev('__g.state.progressOpen = true'); pg.wait_for_timeout(500); shot('t254_progress'); ev('__g.state.progressOpen = false')
if bad: errs.append('t254: ' + '; '.join(bad))
