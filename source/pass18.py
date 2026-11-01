# ---- pass 18: livestock ----
sub1("    for (const n of settlers) if (Math.floor((n.y + 6) / TS) === ty) drawNpc(n);\n    if (ty === playerRow) drawPlayer(p);", "    for (const n of settlers) if (Math.floor((n.y + 6) / TS) === ty) drawNpc(n);\n    drawAnimalsRow(ty);\n    if (ty === playerRow) drawPlayer(p);")
sub1("  } else if (sel.name === 'Sapling') {\n    if (!saplingOk(tx, ty))", "  } else if (ANIMAL_ITEMS[sel.name]) {\n    if (!collides(cx, cy, 10, false) && releaseAnimal(sel.name, cx, cy)) consumeSel(); else if (collides(cx, cy, 10, false)) toast('Set it down on open ground.', 2);\n    state.actCd = 0.5;\n  } else if (sel.name === 'Sapling') {\n    if (!saplingOk(tx, ty))")
sub1("pins: state.pins, conf: state.confiscated,", "pins: state.pins, conf: state.confiscated, animals: animals.map(a => Object.assign({}, a, { tgt: null })),")
sub1("state.confiscated = d.conf || null;", "state.confiscated = d.conf || null; animals.length = 0; for (const a of (d.animals || [])) animals.push(a); lastGM = null; lastDayA = null; ensureSkill();")
sub1("    else if (res.crop) label = res.name + '  (click to harvest)';", "    else if (res.animalLabel) label = res.animalLabel;\n    else if (res.crop) label = res.name + '  (click to harvest)';")
sub1(open('old_chunk.txt').read(), open('new_chunk.txt').read())
sub1("  if (state.storm) {\n    const sp = state.storm.phase, txt =", "  if (state.storm && state.map === 'wastes') {\n    const sp = state.storm.phase, txt =")
src = src.replace(marker_end, P('ak_livestock.js') + P('al_hull.js') + P('am_townfolk.js') + P('an_version.js') + marker_end, 1)
