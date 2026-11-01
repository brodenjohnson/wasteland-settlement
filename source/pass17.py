# ---- pass 17: farming, irrigation, building ----
sub1("function pipeLike(j) { const s = structs.get(j); return s && (s.type === 'pipe' || s.type === 'purifier' || s.type === 'sink') ? 1 : 0; }", "function pipeLike(j) { const s = structs.get(j); return ((s && (s.type === 'pipe' || s.type === 'purifier' || s.type === 'sink' || s.type === 'sprinkler')) || buried[j]) ? 1 : 0; }")
# planting needs the right farming level
sub1("    crops.set(i, { seed: sel.name, age: 0 });\n    skillXp('farming', 1.5);", "    if (skillLevel('farming') < (CROPS[sel.name].lvl || 1)) { toast(CROPS[sel.name].produce + ' needs Farming level ' + CROPS[sel.name].lvl + '.', 2.5); state.actCd = 0.5; return; }\n    crops.set(i, { seed: sel.name, age: 0 });\n    skillXp('farming', 1.5);")
# yields and perks
sub1("const seeds = 1 + Math.floor(Math.random() * 2);\n  if (!spaceFor(c.produce, 1)", "const seeds = 1 + Math.floor(Math.random() * 2) + (skillLevel('farming') >= 4 ? 1 : 0);\n  if (!spaceFor(c.produce, 1)")
sub1("addItem(c.produce, 1 + (Math.random() < 0.1 * (skillLevel('farming') - 1) ? 1 : 0));", "addItem(c.produce, (c.yield || 1) + (Math.random() < 0.1 * (skillLevel('farming') - 1) ? 1 : 0));")
sub1("    if (wet[i]) { const before = cropRipe(c); c.age += 1;", "    if (wet[i] || (skillLevel('farming') >= 6 && Math.random() < 0.35)) { const before = cropRipe(c); c.age += 1;")
# floors and roofs: more kinds
sub1("(kind === 'wood' ? paintFloorWood : paintFloorStone)(c, v)", "(FLOOR_PAINT[kind] || paintFloorStone)(c, v)")
sub1("floorSprite(floors[i] === 1 ? 'wood' : 'stone', v)", "floorSprite(FLOOR_KINDS[floors[i]] || 'stone', v)")
sub1("floorSprite(r.fl === 1 ? 'wood' : 'stone', 0)", "floorSprite(FLOOR_KINDS[r.fl] || 'stone', 0)")
sub1("refundDrops(roofs[i] === 1 ? 'roof_wood' : 'roof_scrap', cx, cy)", "refundDrops(ROOF_REC[roofs[i]] || 'roof_scrap', cx, cy)")
sub1("refundDrops(floors[i] === 1 ? 'floor_wood' : 'floor_stone', cx, cy)", "refundDrops(FLOOR_REC[floors[i]] || 'floor_stone', cx, cy)")
sub1("const base = scrap ? ['#6e7178', '#7a7d84', '#60636a'] : ['#8a4a32', '#9a5638', '#7a3e2a'];", "const base = scrap === 3 ? ['#a8903a', '#b89e46', '#8a7430'] : (scrap === 2 || scrap === true) ? ['#6e7178', '#7a7d84', '#60636a'] : ['#8a4a32', '#9a5638', '#7a3e2a'];")
sub1("paintRoof(c, v, mask, kind === 2)", "paintRoof(c, v, mask, kind)")
sub1("paintRoof(c, 0, 15, false)", "paintRoof(c, 0, 15, 1)")
sub1("paintRoof(c, 0, 15, true)", "paintRoof(c, 0, 15, 2)")
# buried pipe placement
sub1("  if (r && r.layer === 'roof') return !roofs[i];", "  if (r && r.layer === 'buried') return !buried[i];\n  if (r && r.layer === 'roof') return !roofs[i];")
sub1("  if (r.layer === 'floor') floors[i] = r.fl;", "  if (r.layer === 'buried') buried[i] = 1;\n  else if (r.layer === 'floor') floors[i] = r.fl;")
# saving
sub1("tilled: b64(tilled), wet: b64(wet),", "tilled: b64(tilled), wet: b64(wet), buried: b64(buried),")
sub1("unb64(d.tilled, tilled);", "unb64(d.tilled, tilled); if (d.buried) unb64(d.buried, buried); else buried.fill(0);")
# merchants stock the new seeds
sub1("const pool = ['Radish Seeds', 'Potato Seeds', 'Tomato Seeds',", "const pool = ['Radish Seeds', 'Potato Seeds', 'Tomato Seeds', 'Corn Seeds', 'Bean Seeds', 'Pumpkin Seeds', 'Glowmelon Seeds', 'Healroot Seeds',")
src = src.replace(marker_end, P('af_farm.js') + P('ag_balance.js') + P('ah_tidewrack.js') + P('ai_arsenal.js') + P('aj_restyle.js') + marker_end, 1)

sub1("addItem(cr.seed, seeds); skillXp('farming', 4);", "addItem(cr.seed, seeds); skillXp('farming', 5 * (c.tier || 1));")
