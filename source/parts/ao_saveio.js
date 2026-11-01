/* =====================================================================
   AO_SAVEIO: export a character and all their saves to a file, and import
   one back. Saves live in one browser, so this is the only way to move or
   back them up. Also the quorum quest fix.
   ===================================================================== */
const EXPORT_FORMAT = 'wasteland-settlement-export';
async function exportData(id) {
  const ch = state.chars.find(c => c.id === id); if (!ch) return null;
  const saves = [];
  for (const s of SLOTS) {
    const rec = await dbGet('saves', id + '/' + s); if (!rec) continue;
    saves.push({ slot: s, meta: await dbGet('meta', id + '/' + s) || null, json: await gunzip(rec.data) });
  }
  return saves.length ? { format: EXPORT_FORMAT, v: 1, build: BUILD, exported: Date.now(), char: ch, saves } : null;
}
async function exportChar(id) {
  let d; try { d = await exportData(id); } catch (e) { toast('Could not read those saves to export them.', 3.5); return; }
  if (!d) { toast('That character has no saves to export yet.', 3); return; }
  const name = (d.char.name || 'survivor').replace(/[^A-Za-z0-9-]+/g, '_');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(d)], { type: 'application/json' }));
  a.download = 'wasteland-' + name + '-day' + (d.char.day || 1) + '.json';
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  toast('Exported ' + d.char.name + ' (' + d.saves.length + ' save' + (d.saves.length > 1 ? 's' : '') + '). Keep the file somewhere safe.', 4);
}
async function importText(text) {
  let d; try { d = JSON.parse(text); } catch (e) { d = null; }
  if (!d || d.format !== EXPORT_FORMAT || !d.char || !Array.isArray(d.saves)) { toast('That file is not a Wasteland Settlement export.', 3.5); return null; }
  const saves = d.saves.filter(s => SLOTS.includes(s.slot) && typeof s.json === 'string');
  for (const s of saves) { try { JSON.parse(s.json); } catch (e) { toast('That export is damaged. Nothing was imported.', 3.5); return null; } }
  if (!saves.length) { toast('That export has no saves in it.', 3); return null; }
  // never overwrite: a character already in this browser comes in as a second copy
  const id = d.char.id && !state.chars.some(c => c.id === d.char.id) ? d.char.id : 'c' + Date.now().toString(36) + 'i';
  try {
    for (const s of saves) {
      const key = id + '/' + s.slot, m = s.meta || {};
      await dbPut('saves', { key, charId: id, slot: s.slot, data: await gzip(s.json) });
      await dbPut('meta', { key, charId: id, slot: s.slot, savedAt: m.savedAt || Date.now(), level: m.level || 1, day: m.day || 1, bytes: s.json.length });
    }
    await dbPut('chars', Object.assign({}, d.char, { id, lastPlayed: Date.now() }));
  } catch (e) { toast('Could not write the import here (' + ((e && e.name) || 'storage error') + ').', 4); return null; }
  await refreshChars(); state.selChar = id; state.confirmDel = null;
  toast('Imported ' + d.char.name + ' with ' + saves.length + ' save' + (saves.length > 1 ? 's' : '') + '.', 4);
  return id;
}
function pickImportFile() {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json';
  inp.onchange = () => { const f = inp.files && inp.files[0]; if (f) f.text().then(importText, () => toast('Could not read that file.', 3)); };
  inp.click();
}
{ const o = drawChars; drawChars = function (w, h) {
  o(w, h);
  const pw = 700, ph = 420, px = Math.round(w / 2 - pw / 2), py = Math.round(h / 2 - ph / 2);
  button(px + 148, py + ph - 50, 100, 28, 'Import', () => pickImportFile());
  if (state.chars.some(c => c.id === state.selChar)) button(px + 494, py + ph - 50, 80, 28, 'Export', () => exportChar(state.selChar));
}; }
{ const o = drawSaves; drawSaves = function (w, h) {
  o(w, h);
  const pw = 520, ph = 330, px = Math.round(w / 2 - pw / 2), py = Math.round(h / 2 - ph / 2);
  if (state.charId) button(px + 20, py + ph - 38, 170, 26, 'Export this character', () => doSave('auto', false).then(() => exportChar(state.charId)));
}; }

/* ---------- Quorum: reaching the console means you got past the Listeners, whichever way ---------- */
{ const st = QUEST_DEFS.find(q => q.id === 'quorum').steps.find(s => s.id === 'chapel'), o = st.check; st.check = () => o() || qf('console:read'); }

Object.assign(DBG, { exportData, exportChar, importText });
