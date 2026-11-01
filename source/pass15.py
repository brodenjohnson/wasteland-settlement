# ---- pass 15: the kind stranger ----
sub1("r < 0.74 ? 'wounded' : r < 0.88 ? 'raider' : 'cache'", "r < 0.74 ? 'wounded' : r < 0.88 ? 'raider' : (r < 0.95 && !state.qflags.mara_seen && clockDay() >= 2) ? 'stranger' : 'cache'")
sub1("  } else if (type === 'raider') {", "  } else if (type === 'stranger') {\n    encNpcs.push({ id, kind: 'traveller', stranger: true, name: 'Mara Quill', look: npcLook(id), x: spot.x, y: spot.y, dirx: 1, walkT: 0, ttl: 420, used: false, skills: { farm: 0, guard: 0, haul: 0 }, bio: 'A woman who needs your help, and who says so very quickly.' });\n    toast('Someone is waving at you from the road ahead.', 4);\n  } else if (type === 'raider') {")
sub1("pins: state.pins, rep: state.rep,", "pins: state.pins, conf: state.confiscated, rep: state.rep,")
sub1("state.pins = d.pins || []; state.rep = d.rep ||", "state.pins = d.pins || []; state.confiscated = d.conf || null; state.rep = d.rep ||")
src = src.replace(marker_end, P('ac_trap.js') + marker_end, 1)
