/* =====================================================================
   X_SAVES: characters, save files, character creation, new title screen
   Storage: IndexedDB (compressed), with a localStorage fallback
   ===================================================================== */
state.chars = []; state.metaAll = []; state.savesReady = false; state.charId = null; state.char = null; state.creating = null; state.charsOpen = false; state.savesOpen = null; state.dirty = false; state.lastSlot = null; state.selChar = null; state.confirmDel = null;

/* ---------- Look ---------- */
const LOOK_OPTS = {
  skin: ['#f3d0b0', '#e8bc90', '#d4a074', '#b57e55', '#8a5a3a', '#5e3b26'],
  hair: ['#14100c', '#3a2418', '#6b4426', '#a8742e', '#d0a050', '#8a8a8a', '#b8442a', '#4a6aa8'],
  style: ['short', 'buzz', 'long', 'bald'], feature: ['none', 'beard', 'scar'],
  jacket: ['#4f7a52', '#6a5a3a', '#4a5a7a', '#7a4a4a', '#5a5a5a', '#7a6a2a'],
  scarf: ['#e8c24a', '#c0392b', '#4aa8c8', '#e8e0d0', '#7fbf7f']
};
const DEFAULT_LOOK = { skin: '#e8bc90', hair: '#3a2418', style: 'short', feature: 'none', jacket: '#4f7a52', scarf: '#e8c24a' };
let PLOOK = Object.assign({}, DEFAULT_LOOK);
function mixHex(a, b, t) { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16); const f = (s) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t); return '#' + ((1 << 24) | (f(16) << 16) | (f(8) << 8) | f(0)).toString(16).slice(1); }
function plookSig() { const l = PLOOK; return [l.skin, l.hair, l.style, l.feature, l.jacket, l.scarf].join('.'); }
function plookHair() { return PLOOK.style === 'bald' ? shade(PLOOK.skin, -8) : PLOOK.style === 'buzz' ? mixHex(PLOOK.skin, PLOOK.hair, 0.55) : PLOOK.hair; }
function playerExtras(c, dir, look) {
  const hair = PLOOK.hair, hd = shade(hair, -12), noHat = !look.head;
  if (PLOOK.style === 'long' && noHat) {
    if (dir === 0) { R(c, hair, 3, 5, 2, 8); R(c, hd, 3, 11, 2, 2); R(c, hair, 13, 5, 2, 8); R(c, hd, 14, 11, 1, 2); }
    else if (dir === 1) { R(c, hair, 4, 8, 10, 7); R(c, hd, 4, 13, 10, 2); }
    else { R(c, hair, 3, 6, 4, 9); R(c, hd, 3, 13, 4, 2); }
  }
  if (PLOOK.feature === 'beard' && dir !== 1 && !(look.head === 'Gas Mask')) {
    if (dir === 0) { R(c, hd, 5, 7, 8, 2); R(c, hd, 6, 9, 6, 1); R(c, shade(hd, 20), 7, 8, 4, 1); }
    else { R(c, hd, 9, 7, 4, 3); R(c, shade(hd, 20), 10, 8, 2, 1); }
  }
  if (PLOOK.feature === 'scar' && dir !== 1) {
    if (dir === 0) { R(c, '#b8665c', 5, 5, 1, 1); R(c, '#b8665c', 6, 6, 1, 1); R(c, '#b8665c', 7, 7, 1, 1); R(c, '#d98a80', 5, 4, 1, 1); }
    else { R(c, '#b8665c', 10, 5, 1, 1); R(c, '#b8665c', 11, 6, 1, 1); R(c, '#b8665c', 12, 7, 1, 1); }
  }
}
const NAME_POOL = ['Ash', 'Rowan', 'Jules', 'Casey', 'Morgan', 'Sasha', 'Quinn', 'Remy', 'Avery', 'Drew', 'Kit', 'Sloane', 'Ellis', 'Wynn', 'Harper', 'Reese', 'Tully', 'Marlow', 'Blair', 'Nico'];
const pick = a => a[Math.floor(Math.random() * a.length)];
function randomLook() { return { skin: pick(LOOK_OPTS.skin), hair: pick(LOOK_OPTS.hair), style: pick(LOOK_OPTS.style), feature: pick(LOOK_OPTS.feature), jacket: pick(LOOK_OPTS.jacket), scarf: pick(LOOK_OPTS.scarf) }; }
function lookSprite(look, dir) {
  const saved = PLOOK; PLOOK = look;
  const spr = makeSprite('PC|' + dir + '|' + plookSig(), 18, 30, c => paintPlayer(c, dir, 0, { sig: '', head: null, body: null, legs: null, feet: null, acc: null }));
  PLOOK = saved; return spr;
}

/* ---------- Storage ---------- */
const DBX = { db: null, failed: false };
function dbOpen() {
  return new Promise((res, rej) => {
    if (DBX.db) return res(DBX.db);
    if (typeof indexedDB === 'undefined') return rej(new Error('no indexedDB'));
    const r = indexedDB.open('wasteland.v2', 1);
    r.onupgradeneeded = () => { const d = r.result; d.createObjectStore('chars', { keyPath: 'id' }); d.createObjectStore('saves', { keyPath: 'key' }); d.createObjectStore('meta', { keyPath: 'key' }); };
    r.onsuccess = () => { DBX.db = r.result; res(DBX.db); };
    r.onerror = () => rej(r.error);
  });
}
const LSX = 'wl2.';
async function dbPut(store, val) {
  if (!DBX.failed) try { const db = await dbOpen(); return await new Promise((res, rej) => { const t = db.transaction(store, 'readwrite'); t.objectStore(store).put(val); t.oncomplete = () => res(); t.onerror = () => rej(t.error); }); } catch (e) { DBX.failed = true; }
  localStorage.setItem(LSX + store + '.' + (val.id || val.key), JSON.stringify(val));
}
async function dbGet(store, key) {
  if (!DBX.failed) try { const db = await dbOpen(); return await new Promise((res, rej) => { const r = db.transaction(store).objectStore(store).get(key); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); } catch (e) { DBX.failed = true; }
  const s = localStorage.getItem(LSX + store + '.' + key); return s ? JSON.parse(s) : undefined;
}
async function dbDel(store, key) {
  if (!DBX.failed) try { const db = await dbOpen(); return await new Promise((res, rej) => { const t = db.transaction(store, 'readwrite'); t.objectStore(store).delete(key); t.oncomplete = () => res(); t.onerror = () => rej(t.error); }); } catch (e) { DBX.failed = true; }
  localStorage.removeItem(LSX + store + '.' + key);
}
async function dbAll(store) {
  if (!DBX.failed) try { const db = await dbOpen(); return await new Promise((res, rej) => { const r = db.transaction(store).objectStore(store).getAll(); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); } catch (e) { DBX.failed = true; }
  const out = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith(LSX + store + '.')) out.push(JSON.parse(localStorage.getItem(k))); } return out;
}
async function gzip(str) {
  if (typeof CompressionStream === 'undefined') return { raw: str };
  const cs = new CompressionStream('gzip'), w = cs.writable.getWriter();
  w.write(new TextEncoder().encode(str)); w.close();
  return { gz: new Uint8Array(await new Response(cs.readable).arrayBuffer()) };
}
async function gunzip(o) {
  if (o.raw !== undefined) return o.raw;
  const ds = new DecompressionStream('gzip'), w = ds.writable.getWriter();
  w.write(o.gz); w.close();
  return new TextDecoder().decode(await new Response(ds.readable).arrayBuffer());
}
async function refreshChars() {
  try { state.chars = (await dbAll('chars')).sort((a, b) => b.lastPlayed - a.lastPlayed); state.metaAll = await dbAll('meta'); } catch (e) { state.chars = []; state.metaAll = []; }
}
const SLOTS = ['auto', '1', '2', '3'];
function slotName(s) { return s === 'auto' ? 'Autosave' : 'Save ' + s; }
function metaFor(charId, slot) { return state.metaAll.find(m => m.key === charId + '/' + slot); }
function ago(ts) { const m = Math.floor((Date.now() - ts) / 60000); return m < 1 ? 'just now' : m < 60 ? m + ' min ago' : m < 1440 ? Math.floor(m / 60) + ' h ago' : new Date(ts).toLocaleDateString(); }
function hasSave() { return state.chars.length > 0; }

/* ---------- Save and load ---------- */
function saveGame(manual, slot) {
  if (!state.charId || state.title) return false;
  slot = slot || (manual ? (state.lastSlot || '1') : 'auto');
  doSave(slot, manual);
  return true;
}
async function doSave(slot, manual) {
  try {
    const d = serialize(); d.char = state.char; d.v = 2;
    const json = JSON.stringify(d), data = await gzip(json), now = Date.now(), day = clockDay(), level = state.player.level;
    const key = state.charId + '/' + slot;
    await dbPut('saves', { key, charId: state.charId, slot, data });
    await dbPut('meta', { key, charId: state.charId, slot, savedAt: now, level, day, bytes: json.length });
    await dbPut('chars', Object.assign({}, state.char, { id: state.charId, lastPlayed: now, level, day }));
    await refreshChars();
    if (slot !== 'auto') state.lastSlot = slot;
    if (manual) toast('Saved to ' + slotName(slot) + '.', 2);
  } catch (e) { if (manual) toast('Could not save here (' + ((e && e.name) || 'storage error') + ').', 3.5); }
}
function startPlaying() { state.title = false; state.dirty = true; state.creating = null; state.charsOpen = false; PLOOK = Object.assign({}, state.char.look); }
async function loadSlot(charId, slot) {
  if (state.dirty) { try { sessionStorage.setItem('wasteland.boot', JSON.stringify({ action: 'load', charId, slot })); location.reload(); } catch (e) { toast('Could not switch character here. Reload the page and try again.', 4); } return; }
  const rec = await dbGet('saves', charId + '/' + slot), ch = state.chars.find(c => c.id === charId);
  if (!rec) { toast('That save is empty.', 2); return; }
  let d; try { d = JSON.parse(await gunzip(rec.data)); } catch (e) { toast('That save file is damaged.', 3); return; }
  state.char = d.char || { name: ch ? ch.name : 'Survivor', look: ch ? ch.look : DEFAULT_LOOK }; state.charId = charId; state.lastSlot = slot === 'auto' ? state.lastSlot : slot;
  state.pendingLoad = d;
  if (loadGame()) { startPlaying(); state.player.name = state.char.name; }
}
async function loadCurrent(slot) {
  if (!state.charId) return;
  const rec = await dbGet('saves', state.charId + '/' + slot);
  if (!rec) { toast('That save is empty.', 2); return; }
  let d; try { d = JSON.parse(await gunzip(rec.data)); } catch (e) { toast('That save file is damaged.', 3); return; }
  state.pendingLoad = d; state.savesOpen = null;
  if (loadGame()) { state.player.name = state.char.name; }
}
async function deleteChar(id) {
  for (const s of SLOTS) { await dbDel('saves', id + '/' + s); await dbDel('meta', id + '/' + s); }
  await dbDel('chars', id); await refreshChars(); state.selChar = null; state.confirmDel = null;
}
function newCharacter() {
  if (state.dirty) { try { sessionStorage.setItem('wasteland.boot', JSON.stringify({ action: 'new' })); location.reload(); } catch (e) { toast('Reload the page to start a new character.', 4); } return; }
  state.creating = { name: '', look: randomLook() };
  state.charsOpen = false;
}
function beginGame() {
  const cr = state.creating, name = cr.name.trim();
  if (!name) { toast('Give your character a name.', 2); return; }
  state.charId = 'c' + Date.now().toString(36); state.char = { name, look: Object.assign({}, cr.look), created: Date.now() };
  startPlaying(); state.player.name = name;
  setTimeout(() => saveGame(false, 'auto'), 1500);
}
window.addEventListener('keydown', e => {
  const cr = state.creating;
  if (!cr || !state.title) return;
  if (e.key === 'Backspace') { cr.name = cr.name.slice(0, -1); e.preventDefault(); }
  else if (e.key === 'Enter') { beginGame(); e.preventDefault(); }
  else if (e.key === 'Escape') { state.creating = null; e.preventDefault(); }
  else if (e.key.length === 1 && /[A-Za-z' \-]/.test(e.key) && cr.name.length < 14) { cr.name += e.key; e.preventDefault(); }
});
(async function bootSaves() {
  await refreshChars();
  let intent = null;
  try { intent = JSON.parse(sessionStorage.getItem('wasteland.boot')); sessionStorage.removeItem('wasteland.boot'); } catch (e) { intent = null; }
  state.savesReady = true;
  if (intent && intent.action === 'new') newCharacter();
  else if (intent && intent.action === 'load') await loadSlot(intent.charId, intent.slot);
})();
{ const o = closePanels; closePanels = function () { state.savesOpen = null; o(); }; }
{ const o = anyMenuOpen; anyMenuOpen = function () { return !!state.savesOpen || o(); }; }

/* ---------- Screens ---------- */
function drawSavesPanelRows(x, y, w, charId, mode, onLoad) {
  SLOTS.forEach((s, k) => {
    const m = metaFor(charId, s), ry = y + k * 52, cur = state.charId === charId;
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(x, ry, w, 46);
    ctx.strokeStyle = 'rgba(233,226,212,0.16)'; ctx.strokeRect(x + 0.5, ry + 0.5, w - 1, 45);
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = '12px ' + MONO; ctx.fillStyle = m ? '#ffe9b0' : '#7a6e5c'; ctx.fillText(slotName(s), x + 12, ry + 15);
    ctx.font = '10px ' + MONO; ctx.fillStyle = '#b8a890'; ctx.fillText(m ? 'Day ' + m.day + '   Level ' + m.level + '   ' + ago(m.savedAt) : 'Empty', x + 12, ry + 32);
    if (mode === 'save') {
      if (s === 'auto') { ctx.textAlign = 'right'; ctx.fillStyle = '#7a6e5c'; ctx.fillText('written automatically', x + w - 12, ry + 23); }
      else { const sure = state.confirmDel === 'ow' + s; button(x + w - 130, ry + 10, 118, 26, sure ? 'Overwrite?' : m ? 'Overwrite' : 'Save here', () => { if (m && !sure) { state.confirmDel = 'ow' + s; return; } state.confirmDel = null; doSave(s, true); state.savesOpen = null; }, sure); }
    } else if (m) button(x + w - 130, ry + 10, 118, 26, 'Load', () => onLoad(s), true);
  });
}
function drawSaves(w, h) {
  const pw = 520, ph = 330, px = Math.round(w / 2 - pw / 2), py = Math.round(h / 2 - ph / 2), mode = state.savesOpen.mode;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, w, h);
  panel(px, py, pw, ph, 0.97);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '16px ' + MONO; ctx.fillStyle = '#ffe9b0'; ctx.fillText(mode === 'save' ? 'Save game' : 'Load game', w / 2, py + 24);
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#b8a890'; ctx.fillText(state.char ? state.char.name : '', w / 2, py + 42);
  drawSavesPanelRows(px + 20, py + 58, pw - 40, state.charId, mode, s => { loadCurrent(s); });
  button(px + pw - 110, py + ph - 38, 90, 26, 'Back', () => { state.savesOpen = null; state.pauseOpen = true; });
}
function drawCharCard(x, y, w, ch, on) {
  ctx.fillStyle = on ? 'rgba(255,211,107,0.16)' : 'rgba(255,255,255,0.05)'; ctx.fillRect(x, y, w, 66);
  ctx.strokeStyle = on ? '#ffd36b' : 'rgba(233,226,212,0.2)'; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, 65);
  const spr = lookSprite(ch.look, 0); ctx.imageSmoothingEnabled = false; ctx.drawImage(spr, 3, 1, 14, 14, x + 8, y + 8, 50, 50);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = '13px ' + MONO; ctx.fillStyle = '#ffe9b0'; ctx.fillText(ch.name, x + 68, y + 22);
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#b8a890'; ctx.fillText('Level ' + (ch.level || 1) + '   Day ' + (ch.day || 1), x + 68, y + 40); ctx.fillText(ago(ch.lastPlayed), x + 68, y + 54);
  state.uiRects.push({ x, y, w, h: 66, fn: () => { state.selChar = ch.id; state.confirmDel = null; } });
}
function drawChars(w, h) {
  const pw = 700, ph = 420, px = Math.round(w / 2 - pw / 2), py = Math.round(h / 2 - ph / 2);
  panel(px, py, pw, ph, 0.97);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '16px ' + MONO; ctx.fillStyle = '#ffe9b0'; ctx.fillText('Characters', w / 2, py + 24);
  if (!state.selChar && state.chars.length) state.selChar = state.chars[0].id;
  state.chars.slice(0, 5).forEach((ch, k) => drawCharCard(px + 20, py + 50 + k * 72, 250, ch, state.selChar === ch.id));
  const sel = state.chars.find(c => c.id === state.selChar);
  if (!state.chars.length) { ctx.font = '12px ' + MONO; ctx.fillStyle = '#8a7e6c'; ctx.fillText('No characters yet.', px + 145, py + 100); }
  if (sel) {
    ctx.textAlign = 'left'; ctx.font = '12px ' + MONO; ctx.fillStyle = '#e8dcc0'; ctx.fillText(sel.name + '\u2019s saves', px + 296, py + 58);
    drawSavesPanelRows(px + 296, py + 74, 384, sel.id, 'load', s => loadSlot(sel.id, s));
    const sure = state.confirmDel === 'del' + sel.id;
    button(px + 296, py + ph - 50, 190, 28, sure ? 'Really delete? Click again' : 'Delete character', () => { if (!sure) { state.confirmDel = 'del' + sel.id; return; } deleteChar(sel.id); }, sure);
  }
  button(px + 20, py + ph - 50, 120, 28, 'New character', () => newCharacter());
  button(px + pw - 120, py + ph - 50, 100, 28, 'Back', () => { state.charsOpen = false; });
}
function swatchRow(x, y, key, opts, look) {
  opts.forEach((c, k) => { const sx = x + k * 26, on = look[key] === c; ctx.fillStyle = '#000'; ctx.fillRect(sx - 1, y - 1, 24, 24); ctx.fillStyle = c; ctx.fillRect(sx, y, 22, 22); if (on) { ctx.strokeStyle = '#ffd36b'; ctx.lineWidth = 2; ctx.strokeRect(sx - 2, y - 2, 26, 26); ctx.lineWidth = 1; } state.uiRects.push({ x: sx, y, w: 22, h: 22, fn: () => { look[key] = c; } }); });
}
function cycleRow(x, y, key, opts, look) {
  const i = opts.indexOf(look[key]);
  button(x, y, 26, 24, '<', () => { look[key] = opts[(i + opts.length - 1) % opts.length]; });
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '11px ' + MONO; ctx.fillStyle = '#e8dcc0'; ctx.fillText(look[key], x + 82, y + 12.5);
  button(x + 138, y, 26, 24, '>', () => { look[key] = opts[(i + 1) % opts.length]; });
}
function drawCreation(w, h) {
  const cr = state.creating, pw = 700, ph = 440, px = Math.round(w / 2 - pw / 2), py = Math.round(h / 2 - ph / 2);
  PLOOK = cr.look;
  panel(px, py, pw, ph, 0.97);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '16px ' + MONO; ctx.fillStyle = '#ffe9b0'; ctx.fillText('Who are you?', w / 2, py + 26);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(px + 24, py + 52, 230, 300); ctx.strokeStyle = 'rgba(233,226,212,0.2)'; ctx.strokeRect(px + 24.5, py + 52.5, 229, 299);
  ctx.imageSmoothingEnabled = false;
  const front = lookSprite(cr.look, 0), side = lookSprite(cr.look, 3);
  ctx.drawImage(front, px + 40, py + 70, front.width * 6.2, front.height * 6.2);
  ctx.drawImage(side, px + 168, py + 220, side.width * 2.6, side.height * 2.6);
  const lx = px + 290; let y = py + 56;
  ctx.textAlign = 'left'; ctx.font = '10px ' + MONO; ctx.fillStyle = '#b8a890'; ctx.fillText('Name', lx, y);
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(lx, y + 10, 270, 30); ctx.strokeStyle = '#ffd36b'; ctx.strokeRect(lx + 0.5, y + 10.5, 269, 29);
  ctx.font = '14px ' + MONO; ctx.fillStyle = cr.name ? '#fff6e4' : '#6a5e50'; ctx.textBaseline = 'middle';
  const cursor = Math.floor(performance.now() / 500) % 2 ? '|' : '';
  ctx.fillText(cr.name ? cr.name + cursor : 'Type a name' + cursor, lx + 10, y + 26);
  button(lx + 280, y + 10, 100, 30, 'Random', () => { cr.name = pick(NAME_POOL); cr.look = randomLook(); });
  y += 62;
  const rows = [['Skin', 'skin', 'sw'], ['Hair colour', 'hair', 'sw'], ['Hair style', 'style', 'cy'], ['Feature', 'feature', 'cy'], ['Jacket', 'jacket', 'sw'], ['Scarf', 'scarf', 'sw']];
  for (const [label, key, kind] of rows) {
    ctx.textAlign = 'left'; ctx.font = '10px ' + MONO; ctx.fillStyle = '#b8a890'; ctx.fillText(label, lx, y + 12);
    if (kind === 'sw') swatchRow(lx + 110, y, key, LOOK_OPTS[key], cr.look); else cycleRow(lx + 110, y - 1, key, LOOK_OPTS[key], cr.look);
    y += 38;
  }
  ctx.textAlign = 'left'; ctx.font = '10px ' + MONO; ctx.fillStyle = '#8a7a64'; ctx.fillText('Type to enter a name. Enter begins.', lx, py + ph - 70);
  button(px + 24, py + ph - 50, 110, 30, 'Back', () => { state.creating = null; });
  button(px + pw - 154, py + ph - 50, 130, 30, 'Begin', () => beginGame(), !!cr.name.trim());
}
function drawTitle(w, h) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = 'rgba(8,6,12,0.66)'; ctx.fillRect(0, 0, w, h);
  if (state.creating) { drawCreation(w, h); return; }
  if (state.settingsOpen) { drawSettings(w, h, true); return; }
  if (state.charsOpen) { drawChars(w, h); return; }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '44px ' + MONO; ctx.fillStyle = '#000'; ctx.fillText('WASTELAND SETTLEMENT', w / 2 + 3, h * 0.26 + 3); ctx.fillStyle = '#ffe9b0'; ctx.fillText('WASTELAND SETTLEMENT', w / 2, h * 0.26);
  ctx.font = '13px ' + MONO; ctx.fillStyle = '#c8b8a0'; ctx.fillText('The world ended. You are still here. Build something.', w / 2, h * 0.26 + 38);
  const bw = 280, bx = Math.round(w / 2 - bw / 2); let y = Math.round(h * 0.45);
  if (!state.savesReady) { ctx.font = '11px ' + MONO; ctx.fillStyle = '#8a7a64'; ctx.fillText('Loading saves...', w / 2, y + 16); return; }
  const last = state.chars[0];
  if (last) {
    const metas = state.metaAll.filter(m => m.charId === last.id).sort((a, b) => b.savedAt - a.savedAt), m0 = metas[0];
    button(bx, y, bw, 38, 'Continue: ' + last.name + (m0 ? ', day ' + m0.day : ''), () => { if (m0) loadSlot(last.id, m0.slot); }, true); y += 48;
  }
  button(bx, y, bw, 38, 'New character', () => newCharacter()); y += 48;
  if (state.chars.length) { button(bx, y, bw, 38, 'Characters and saves (' + state.chars.length + ')', () => { state.charsOpen = true; state.selChar = null; }); y += 48; }
  button(bx, y, bw, 38, 'Settings', () => { state.settingsOpen = true; state.pauseFrom = false; });
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#8a7a64'; ctx.fillText('Saved in this browser. Esc in game opens the menu.', w / 2, Math.round(h * 0.45) + 232);
}
Object.assign(DBX, { dbAll, dbGet, dbDel, dbPut });
Object.assign(DBG, { newCharacter, beginGame, doSave, loadSlot, deleteChar, refreshChars, lookSprite, randomLook, LOOK_OPTS, SLOTS });
