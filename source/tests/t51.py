import json
ev = lambda s: pg.evaluate(s)
def shot(n): pg.screenshot(path='out/%s.png' % n)
BX, BY = 28, 98
def scr(tx, ty):
    p = json.loads(ev('JSON.stringify({x:__g.state.player.x,y:__g.state.player.y})'))
    return 550 + ((tx + 0.5) * 16 - p['x']) * 4, 350 + ((ty + 0.5) * 16 - p['y']) * 4
pg.mouse.click(550, 332); pg.wait_for_timeout(300)
ev('__g.enemies.length = 0; __g.state.spawnPts.forEach(s => { s.e = null; s.respawnAt = 1e9 })')
ev('__g.state.player.x=%d*16; __g.state.player.y=%d*16' % (BX, BY + 3))
for n, q in [('Wood', 80), ('Stone', 40), ('Scrap', 60), ('Cloth', 20), ('Metal plate', 20), ('Iron ore', 10)]: ev('__g.addItem("%s", %d)' % (n, q))
# --- skills gate the tree (skill-only recipes are now locked) ---
print('rug unlocked at crafting 1:', ev('__g.recipeUnlocked(__g.RECIPES.find(r=>r.id==="rug"))'), '| stonewall:', ev('__g.recipeUnlocked(__g.RECIPES.find(r=>r.id==="stonewall"))'))
ev('__g.skillXp("crafting", 200)'); print('crafting level after xp:', ev('__g.skillLevel("crafting")'), '| rug now:', ev('__g.recipeUnlocked(__g.RECIPES.find(r=>r.id==="rug"))'))
# --- cooking at the starting campfire ---
ev('__g.addItem("Raw Fish", 2); __g.addItem("Potato", 2)')
ev('__g.state.player.x=(%d+2.5)*16; __g.state.player.y=(%d+1.5)*16' % (BX, BY)); pg.wait_for_timeout(200)
ev('__g.tryCraft(__g.RECIPES.find(r=>r.id==="cook_fish"))'); ev('__g.tryCraft(__g.RECIPES.find(r=>r.id==="cook_potato"))')
inv = lambda: ev('JSON.stringify(__g.state.player.inventory.filter(Boolean).map(s=>s.name+" x"+s.qty).filter(n=>/Fish|Potato|Stew/.test(n)))')
print('cooked at campfire:', inv(), '| cooking xp:', ev('JSON.stringify(__g.state.player.skills.cooking)'))
print('stew needs a stove:', ev('__g.recipeStatus(__g.RECIPES.find(r=>r.id==="cook_veg")).why'))
# --- fishing ---
pond = ev('(()=>{ for(let y=%d-14;y<=%d+4;y++) for(let x=%d;x<=%d+16;x++){ if(__g.tiles[y*128+x]===6) return [x,y]; } return null; })()' % (BY, BY, BX, BX))
px, py = pond
ev('__g.addItem("Fishing Rod", 1)'); ri = ev('__g.state.player.inventory.findIndex(s=>s&&s.name==="Fishing Rod")'); pg.keyboard.press(str(ri + 1))
ev('__g.state.player.x=(%d+0.5)*16; __g.state.player.y=(%d+2.5)*16' % (px, py)); pg.wait_for_timeout(200)
x, y = scr(px, py); pg.mouse.move(x, y); pg.wait_for_timeout(100); pg.mouse.down(); pg.wait_for_timeout(120); pg.mouse.up(); pg.wait_for_timeout(200)
print('line cast:', ev('JSON.stringify(__g.state.fish && {phase:__g.state.fish.phase})'))
ev('__g.state.fish.wait = 0.1'); pg.wait_for_timeout(250)
print('bite phase:', ev('__g.state.fish && __g.state.fish.phase'))
pg.mouse.down(); pg.wait_for_timeout(150); pg.mouse.up(); pg.wait_for_timeout(300)
print('caught:', inv(), '| fishing skill:', ev('JSON.stringify(__g.state.player.skills.fishing)'))
# --- moving the bed (F), then placing it elsewhere ---
ev('__g.state.player.x=(%d+0.5)*16; __g.state.player.y=(%d+3.5)*16' % (BX, BY)); pg.wait_for_timeout(150)
bx, by = scr(BX, BY); pg.mouse.move(bx, by); pg.wait_for_timeout(120); pg.keyboard.press('f'); pg.wait_for_timeout(150)
print('moving bedroll:', ev('!!__g.state.moving'), 'bedroll struct still in map?', ev('[...__g.structs.values()].some(s=>s.type==="bedroll")'))
tx, ty = BX - 4, BY + 2; x, y = scr(tx, ty); pg.mouse.move(x, y); pg.wait_for_timeout(120); pg.mouse.click(x, y); pg.wait_for_timeout(200)
print('bedroll moved:', ev('[...__g.structs.entries()].filter(([i,s])=>s.type==="bedroll").map(([i])=>[i%128, Math.floor(i/128)])'), '| respawn point:', ev('[Math.floor(__g.spawn.x/16), Math.floor(__g.spawn.y/16)]'))
# chest contents survive a move
ev('__g.structs.set(%d*128+%d, __g.newStruct("chest")); __g.structs.get(%d*128+%d).slots[0] = {name:"Wood", qty:7}' % (BY + 5, BX + 1, BY + 5, BX + 1))
ev('__g.state.player.x=(%d+0.5)*16; __g.state.player.y=(%d+6.5)*16' % (BX + 1, BY + 5)); pg.wait_for_timeout(150)
cx, cy = scr(BX + 1, BY + 5); pg.mouse.move(cx, cy); pg.wait_for_timeout(120); pg.keyboard.press('f'); pg.wait_for_timeout(100)
x, y = scr(BX + 3, BY + 5); pg.mouse.move(x, y); pg.wait_for_timeout(120); pg.mouse.click(x, y); pg.wait_for_timeout(150)
print('chest contents after move:', ev('JSON.stringify([...__g.structs.values()].find(s=>s.type==="chest").slots[0])'))
