# ---- pass 7: codex, quick-stack, difficulty presets ----
sub1("  if (state.journalOpen) drawJournal(w, h);", "  if (state.journalOpen) drawJournal(w, h);\n  if (state.codexOpen) drawCodex(w, h);")
sub1("  if (k === 'j') toggleHub('journalOpen');", "  if (k === 'j') toggleHub('journalOpen');\n  if (k === 'o') toggleHub('codexOpen');\n  if (k === 'q' && state.chestOpen !== null) quickStack();")
sub1("if (state.craftOpen) state.craftScroll = Math.max(0, state.craftScroll + d); else", "if (state.craftOpen) state.craftScroll = Math.max(0, state.craftScroll + d); else if (state.codexOpen) state.codexScroll = Math.max(0, state.codexScroll + d); else")
sub1("corpse: state.corpse, drops: state.drops, fog:", "corpse: state.corpse, drops: state.drops, codex: state.codex, fog:")
sub1("state.firstMerchant = d.firstMerchant;", "state.firstMerchant = d.firstMerchant; state.codex = d.codex || { creatures: {}, items: {}, people: {}, places: {} };")
sub1("const n = Math.min(12, 3 + Math.floor(day * 0.9));", "const n = Math.max(2, Math.round(Math.min(12, 3 + Math.floor(day * 0.9)) * (settings.raidScale || 1)));")
sub1("state.radRate = (base > 0 ? base * (1 - armourStats().rad) : base) + stormRadAt();", "state.radRate = (base > 0 ? base * (1 - armourStats().rad) * (settings.radScale || 1) : base) + stormRadAt();")
sub1("fillRect(px + 91, y + 29, 148 * (full ? 1 : p.xp / need), 6)", "fillRect(px + 91, y + 29, 148 * (full ? 1 : Math.min(1, p.xp / need)), 6)")
sub1("V sound   Esc menu', x, y);", "V sound   O codex   Esc menu', x, y);")
import re as _re
_m = _re.search(r"^  toggleRow\(x, y, rw, 'Survival difficulty'.*$", src, _re.M)
if not _m: raise Exception('difficulty row not found')
src = src[:_m.start()] + "  toggleRow(x, y, rw, 'Difficulty', 'Hunger, thirst, radiation and raid size together.', (DIFFS[settings.diff] || DIFFS.normal).label, () => { cycleDiff(); }, true); y += 42;" + src[_m.end():]
src = src.replace(marker_end, P('p_extras.js') + marker_end, 1)
