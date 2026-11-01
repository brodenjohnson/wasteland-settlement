import json as _json
open('parts/aa_dialogue_data.js', 'w').write('const DLG_TEXT = ' + _json.dumps(open('parts/dialogue.txt').read()) + ';\n')
# ---- pass 13: dialogue and choice engine ----
sub1("  if (state.savesOpen) drawSaves(w, h);", "  if (state.savesOpen) drawSaves(w, h);\n  if (state.dlg) drawDialogue(w, h);\n  drawDlgFeed(w, h);")
sub1("r < 0.62 ? 'traveller' : r < 0.82 ? 'wounded' : 'cache'", "r < 0.62 ? 'traveller' : r < 0.74 ? 'wounded' : r < 0.88 ? 'raider' : 'cache'")
sub1("pins: state.pins, markers: state.markers,", "pins: state.pins, rep: state.rep, clog: state.choiceLog, markers: state.markers,")
sub1("state.pins = d.pins || []; state.markers", "state.pins = d.pins || []; state.rep = d.rep || { mercy: 0, trust: 0, listeners: 0, hull: 0, raiders: 0 }; state.choiceLog = d.clog || []; state.markers")
sub1("  } else if (type === 'wounded') {", "  } else if (type === 'raider') {\n    const nm = ['Gus', 'Mattias', 'Dell', 'Ferro', 'Bram', 'Tully'][Math.floor(Math.random() * 6)];\n    survivors.push({ id, kind: 'survivor', raider: true, wounded: true, name: nm + ' (wounded raider)', bio: 'A raider with a hole in his side and nobody coming back for him.', skills: { farm: 0, guard: 2, haul: 1 }, look: npcLook(id), x: spot.x, y: spot.y, home: { x: spot.x, y: spot.y }, wander: 0, wx: spot.x, wy: spot.y, dirx: 1, walkT: 0, scared: false });\n    toast('Someone is propped against a rock ahead, holding their side.', 4);\n  } else if (type === 'wounded') {")
# the 'raider' sub1 must run before the marker insertion line; move the marker line to the end again
src = src.replace(marker_end, P('aa_dialogue_data.js') + P('aa_dialogue.js') + marker_end, 1)
