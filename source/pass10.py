# ---- pass 10: saves, characters, character creation ----
for n in ['hasSave', 'saveGame', 'drawTitle']:
    remove_func(n)
sub1("const skin = '#e8bc90', skinD = '#c99a72', hair = '#3a2418', hairL = '#5a3a28';", "const skin = PLOOK.skin, skinD = shade(PLOOK.skin, -28), hair = plookHair(), hairL = shade(plookHair(), 26);")
sub1("const jacket = '#4f7a52', jD = shade(jacket, -34), jL = shade(jacket, 22);", "const jacket = PLOOK.jacket, jD = shade(jacket, -34), jL = shade(jacket, 22);")
sub1("scarf = '#e8c24a';", "scarf = PLOOK.scarf;")
sub1("    if (look.head) overlayHead(c, look.head, 2, true);\n  }\n  c.restore();", "    if (look.head) overlayHead(c, look.head, 2, true);\n  }\n  playerExtras(c, dir, look);\n  c.restore();")
sub1("look.sig = SLOT_ORDER.map(k => look[k] || '-').join(',');", "look.sig = SLOT_ORDER.map(k => look[k] || '-').join(',') + '|' + plookSig();")
sub1("  let d;\n  try { d = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { d = null; }\n  if (!d) { toast('No saved game found.', 2); return false; }", "  const d = state.pendingLoad; state.pendingLoad = null; state.lastLoaded = d;\n  if (!d) { toast('No saved game found.', 2); return false; }")
sub1("const d = JSON.parse(localStorage.getItem(SAVE_KEY)); state.player.energy", "const d = state.lastLoaded; state.player.energy")
sub1("button(bx, y, bw, 32, 'Save game', () => saveGame(true)); y += 40;", "button(bx, y, bw, 32, 'Save game', () => { state.pauseOpen = false; state.savesOpen = { mode: 'save' }; state.confirmDel = null; }); y += 40;")
sub1("button(bx, y, bw, 32, hasSave() ? 'Load game' : 'Load game (no save yet)', () => { if (hasSave()) { loadGame(); state.pauseOpen = false; } }); y += 40;", "button(bx, y, bw, 32, 'Load game', () => { state.pauseOpen = false; state.savesOpen = { mode: 'load' }; }); y += 40;")
sub1("  if (state.codexOpen) drawCodex(w, h);", "  if (state.codexOpen) drawCodex(w, h);\n  if (state.savesOpen) drawSaves(w, h);")
sub1("  state.uiRects = [];\n\n  panel(8, 8, 214, 124);", "  state.uiRects = [];\n  if (state.title) { drawTitle(w, h); return; }\n\n  panel(8, 8, 214, 124);")

src = src.replace(marker_end, P('x_saves.js') + marker_end, 1)
