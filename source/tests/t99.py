import json
ev = lambda s: pg.evaluate(s)
open('out/wiki8.json', 'w').write(ev('''JSON.stringify({
 enemies: Object.fromEntries(Object.entries(__g.ENEMY_TYPES).map(([k,v]) => [k, {name:v.name, hp:v.hp, dmg:v.dmg, speed:v.speed, aggro:v.aggro, xp:v.xp, ranged:!!v.ranged}])),
 weapons: Object.fromEntries(Object.entries(__g.WEAPONS).map(([k,v]) => [k, {kind:v.kind, dmg:v.dmg, cd:v.cd, reach:v.reach||null, pellets:v.pellets||null, ammo:v.ammo||null}])),
 armour: Object.fromEntries(Object.entries(__g.ARMOUR).map(([k,v]) => [k, {slot:v.slot, dmg:v.dmg, rad:v.rad}])),
 quests: Object.fromEntries(Object.entries(__g.SURV_QUESTS).map(([k,v]) => [k, {id:v.id, title:v.title, intro:v.intro, steps:v.steps.map(s=>s.text), reward:v.reward}])),
 bios: __g.BIO2, cards: __g.TAG_CARDS, raids: Object.values(__g.RAID_KINDS).map(r => ({name:r.name, minDay:r.minDay, mult:r.mult, hint:r.hint})),
 recipes: __g.RECIPES.map(r => ({id:r.id, name:r.name, cat:r.cat, tier:r.tier, cost:r.cost}))
})'''))
