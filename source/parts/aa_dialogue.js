/* =====================================================================
   AA_DIALOGUE: scripted conversations with choices, checks, reputation,
   a consequence log, Echoes (flashbacks), and the journal pages for them.
   Writing lives in dialogue.txt.
   ===================================================================== */
state.rep = { mercy: 0, trust: 0, listeners: 0, hull: 0, raiders: 0 }; state.choiceLog = []; state.dlg = null; state.journalPage = 0; state.dlgFeed = [];
const REP_NAMES = { mercy: 'Mercy', trust: 'Trust of the ten', listeners: 'The Listeners', hull: 'The Hull', raiders: 'Raiders' };
const SCRIPTS = {};
function parseChoice(s) {
  const parts = s.split(' | '), head = parts[0];
  const c = { tag: null, n: 0, label: '', target: 'END', cond: '', effects: [] };
  let h = head, m = h.match(/^\[([A-Za-z]+)(?: (\d+))?\]\s*/);
  if (m) { c.tag = m[1]; c.n = m[2] ? +m[2] : 0; h = h.slice(m[0].length); }
  const ar = h.lastIndexOf(' => ');
  if (ar >= 0) { c.label = h.slice(0, ar).trim(); c.target = h.slice(ar + 4).trim(); } else c.label = h.trim();
  for (const p of parts.slice(1)) {
    if (p.startsWith('if ')) c.cond = p.slice(3).trim();
    else if (p.startsWith('do ')) c.effects = p.slice(3).split(';').map(x => x.trim()).filter(Boolean);
  }
  return c;
}
function parseScripts(txt) {
  let cur = null;
  for (let line of txt.split('\n')) {
    line = line.replace(/\s+$/, '');
    const t = line.trim();
    if (!t || t.startsWith('//')) continue;
    if (line.startsWith('=== ')) { cur = { id: line.slice(4).trim(), pages: [], choices: [], enter: [], next: null }; cur.echo = cur.id.startsWith('echo_'); SCRIPTS[cur.id] = cur; continue; }
    if (!cur) continue;
    if (line.startsWith('@ ')) cur.enter.push(...line.slice(2).split(';').map(x => x.trim()).filter(Boolean));
    else if (line.startsWith('> ')) cur.next = line.slice(2).trim();
    else if (line.startsWith('* ')) cur.choices.push(parseChoice(line.slice(2)));
    else if (line.startsWith('~ ')) cur.pages.push({ speaker: '~', text: line.slice(2) });
    else { const m = line.match(/^([A-Za-z][A-Za-z' ]{0,22}):\s*(.*)$/); if (m) cur.pages.push({ speaker: m[1], text: m[2] }); else if (cur.pages.length) cur.pages[cur.pages.length - 1].text += ' ' + t; }
  }
}
parseScripts(DLG_TEXT);
function memoryScore() { let n = 0; for (const k of Object.keys(state.qflags)) if (k.startsWith('read:') || k.startsWith('echo:')) n++; return n; }
function repOf(k) { return state.rep[k] || 0; }
function valueOf(key) {
  if (key.startsWith('rep.')) return repOf(key.slice(4));
  if (key.startsWith('skill.')) return skillLevel(key.slice(6));
  if (key === 'memory') return memoryScore();
  if (key === 'day') return clockDay();
  if (key === 'level') return state.player.level;
  return 0;
}
function evalAtom(t) {
  let m;
  if ((m = t.match(/^flag:(.+)$/))) return !!state.qflags[m[1]];
  if ((m = t.match(/^item:(.+?)(?:>=(\d+))?$/))) return countItem(m[1]) >= (m[2] ? +m[2] : 1);
  if ((m = t.match(/^quest:(\w+)=(\w+)$/))) { const q = state.quests[m[1]]; return (q ? q.status : 'none') === m[2]; }
  if ((m = t.match(/^((?:rep|skill)\.\w+|memory|day|level)(>=|<=|>|<|=)(-?\d+)$/))) { const v = valueOf(m[1]), n = +m[3]; return m[2] === '>=' ? v >= n : m[2] === '<=' ? v <= n : m[2] === '>' ? v > n : m[2] === '<' ? v < n : v === n; }
  return false;
}
function evalCond(s) { if (!s) return true; return s.split('&').every(t => { t = t.trim(); const neg = t[0] === '!'; const r = evalAtom(neg ? t.slice(1) : t); return neg ? !r : r; }); }
function checkOf(c) {
  if (!c.tag || !c.n) return { ok: true };
  const tg = c.tag.toLowerCase();
  if (tg === 'memory') return { ok: memoryScore() >= c.n, need: 'Memory ' + c.n };
  if (['combat', 'exploring', 'gathering', 'crafting', 'fishing', 'farming', 'cooking'].includes(tg)) return { ok: skillLevel(tg) >= c.n, need: c.tag + ' ' + c.n };
  return { ok: true };
}
function repAdd(k, n) {
  const before = repOf(k); state.rep[k] = Math.max(-10, Math.min(10, before + n));
  state.dlgFeed.push({ text: (REP_NAMES[k] || k) + (n > 0 ? ' +' : ' ') + n, t: 3, col: n > 0 ? '#9fe8ff' : '#ff9a8a' }); sfx('pickup');
}
function logChoice(text) { state.choiceLog.push({ day: clockDay(), text }); }
function removeNpc(n) { if (!n) return; let i = survivors.indexOf(n); if (i >= 0) survivors.splice(i, 1); i = encNpcs.indexOf(n); if (i >= 0) encNpcs.splice(i, 1); }
function applyEffect(e, c) {
  let m;
  if (e === 'end') c.ended = true;
  else if ((m = e.match(/^flag:(.+)$/))) state.qflags[m[1]] = true;
  else if ((m = e.match(/^unflag:(.+)$/))) delete state.qflags[m[1]];
  else if ((m = e.match(/^rep\.(\w+)([+-]\d+)$/))) repAdd(m[1], +m[2]);
  else if ((m = e.match(/^give:(.+?)(?: x(\d+))?$/))) { const q = m[2] ? +m[2] : 1; if (spaceFor(m[1], q)) addItem(m[1], q); else state.drops.push({ x: state.player.x, y: state.player.y + 6, name: m[1], qty: q, t: 0 }); state.dlgFeed.push({ text: '+' + q + ' ' + m[1], t: 3, col: '#ffd36b' }); }
  else if ((m = e.match(/^take:(.+?)(?: x(\d+))?$/))) { const q = m[2] ? +m[2] : 1; if (countItem(m[1]) >= q) takeItems({ [m[1]]: q }); }
  else if ((m = e.match(/^caps:(\d+)$/))) { addItem('Caps', +m[1]); state.dlgFeed.push({ text: '+' + m[1] + ' caps', t: 3, col: '#ffd36b' }); }
  else if ((m = e.match(/^xp:(\d+)$/))) gainXp(+m[1]);
  else if ((m = e.match(/^quest:start (\w+)$/))) { startQuest(m[1]); state.pinned = m[1]; }
  else if ((m = e.match(/^event:(.+)$/))) questEvent(m[1]);
  else if ((m = e.match(/^log:(.+)$/))) logChoice(m[1]);
  else if ((m = e.match(/^toast:(.+)$/))) toast(m[1], 3);
  else if ((m = e.match(/^heal:(\d+)$/))) state.player.health = Math.min(maxHealth(), state.player.health + +m[1]);
  else if ((m = e.match(/^hurt:(\d+)$/))) { if (+m[1]) state.player.health = Math.max(1, state.player.health - +m[1]); }
  else if (e === 'recruit') { if (c.npc && !recruit(c.npc)) toast('You have no free bed for them yet.', 3); }
  else if (e === 'removeNpc') c.remove = true;
  else if (e === 'rumour') addRumour();
}
function applyEffects(list, c) { for (const e of list) applyEffect(e, c); }
function startDialogue(id, npc) {
  if (!SCRIPTS[id]) return false;
  closePanels();
  state.dlg = { id: null, node: null, page: 0, shown: 0, last: performance.now(), npc, ctx: { npc, ended: false, remove: false } };
  gotoNode(id);
  return true;
}
function gotoNode(id) {
  const d = state.dlg;
  if (!d) return;
  if (id === 'END' || !SCRIPTS[id]) return endDialogue();
  const n = SCRIPTS[id];
  d.id = id; d.node = n; d.page = 0; d.shown = 0; d.last = performance.now();
  if (n.echo) { state.qflags['echo:' + id] = true; sfx('beat'); }
  applyEffects(n.enter, d.ctx);
}
function endDialogue() {
  const d = state.dlg;
  if (d && d.ctx.remove) removeNpc(d.npc);
  state.dlg = null;
}
function chooseOption(k) {
  const d = state.dlg;
  if (!d || !d.node) return;
  const vis = d.node.choices.filter(c => evalCond(c.cond)), c = vis[k];
  if (!c || !checkOf(c).ok) return;
  sfx('click');
  applyEffects(c.effects, d.ctx);
  gotoNode(c.target);
}
function dialogueAdvance() {
  const d = state.dlg;
  if (!d || !d.node) return;
  const pg = d.node.pages[d.page];
  if (pg && d.shown < pg.text.length) { d.shown = pg.text.length; return; }
  if (d.page < d.node.pages.length - 1) { d.page++; d.shown = 0; d.last = performance.now(); return; }
  if (!d.node.choices.filter(c => evalCond(c.cond)).length) { if (d.node.next) gotoNode(d.node.next); else endDialogue(); }
}
const TAG_COL = { Honest: '#9fe8ff', Lie: '#ffd36b', Mercy: '#7fdc9f', Ruthless: '#ff6a6a', Item: '#e8c24a', Memory: '#c8a0ff', Combat: '#ff8a7a', Exploring: '#8fd0ff', Gathering: '#b8d88a', Crafting: '#e8b878', Fishing: '#78c8e8' };
function drawDialoguePortrait(x, y, s, speaker, d) {
  ctx.fillStyle = '#2a1a22'; ctx.fillRect(x, y, s, s);
  ctx.imageSmoothingEnabled = false;
  if (speaker === 'You') { const spr = lookSprite(state.char ? state.char.look : DEFAULT_LOOK, 0); ctx.drawImage(spr, 3, 1, 14, 14, x + 2, y + 2, s - 4, s - 4); }
  else if (d.npc && SCRIPTS_NPC_OK(d.npc)) ctx.drawImage(npcSprite(d.npc, 0), 3, 1, 18, 18, x + 2, y + 2, s - 4, s - 4);
  else { ctx.fillStyle = '#4a3a44'; ctx.fillRect(x + s * 0.28, y + s * 0.2, s * 0.44, s * 0.5); ctx.fillStyle = '#e8dcc0'; ctx.font = '22px ' + MONO; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(speaker.charAt(0), x + s / 2, y + s / 2); }
  ctx.strokeStyle = '#2a1018'; ctx.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);
}
function SCRIPTS_NPC_OK(n) { return !!(n && n.look); }
function drawDialogue(w, h) {
  const d = state.dlg;
  if (!d || !d.node) return;
  const now = performance.now(), n = d.node;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const pg = n.pages[d.page] || { speaker: '', text: '' };
  if (pg && d.shown < pg.text.length) d.shown = Math.min(pg.text.length, d.shown + (now - d.last) / 1000 * (n.echo ? 40 : 75));
  d.last = now;
  const done = !pg.text || d.shown >= pg.text.length, lastPage = d.page >= n.pages.length - 1;
  const vis = n.choices.filter(c => evalCond(c.cond));
  if (n.echo) {
    ctx.fillStyle = 'rgba(4,2,8,0.88)'; ctx.fillRect(0, 0, w, h);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '11px ' + MONO; ctx.fillStyle = '#8a7a9a'; ctx.fillText('A memory, or something like one', w / 2, h * 0.3 - 40);
    ctx.font = '15px ' + MONO; ctx.fillStyle = '#d8d0e8';
    const shown = pg.text.slice(0, Math.floor(d.shown));
    wrapText(pg.text, Math.min(620, w - 80)).forEach((l, k) => { const vs = pg.text.indexOf(l); ctx.fillStyle = vs >= d.shown ? 'rgba(0,0,0,0)' : '#d8d0e8'; ctx.fillText(l.slice(0, Math.max(0, Math.floor(d.shown) - vs)), w / 2, h * 0.4 + k * 24); });
    ctx.font = '10px ' + MONO; ctx.fillStyle = '#6a5e7a'; ctx.fillText(done ? (lastPage ? 'Click to wake up' : 'Click to continue') : '', w / 2, h * 0.7);
    state.uiRects.push({ x: 0, y: 0, w, h, fn: () => { if (done && lastPage && !vis.length && !n.next) endDialogue(); else dialogueAdvance(); } });
    return;
  }
  ctx.fillStyle = 'rgba(0,0,0,0.38)'; ctx.fillRect(0, 0, w, h);
  const showChoices = done && lastPage && vis.length, btnH = 28, ph = 150 + (showChoices ? vis.length * (btnH + 4) + 6 : (done && lastPage ? 34 : 0));
  const pw = Math.min(740, w - 40), px = Math.round(w / 2 - pw / 2), py = h - ph - 36;
  panel(px, py, pw, ph, 0.97);
  state.uiRects.push({ x: px, y: py, w: pw, h: 150, fn: () => dialogueAdvance() });
  const sp = pg.speaker === '~' ? '' : pg.speaker;
  if (sp) drawDialoguePortrait(px + 14, py + 14, 84, sp, d);
  const tx = sp ? px + 112 : px + 20, tw = pw - (sp ? 130 : 40);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  if (sp) { ctx.font = '14px ' + MONO; ctx.fillStyle = sp === 'You' ? '#9fe8ff' : '#ffe9b0'; ctx.fillText(sp === 'You' && state.char ? state.char.name : sp, tx, py + 24); }
  ctx.font = pg.speaker === '~' ? 'italic 12px ' + MONO : '12px ' + MONO; ctx.fillStyle = pg.speaker === '~' ? '#c8bca8' : '#f0e6cc';
  wrapText(pg.text, tw).forEach((l, k) => { const vs = pg.text.indexOf(l); ctx.fillText(l.slice(0, Math.max(0, Math.floor(d.shown) - vs)), tx, py + (sp ? 52 : 34) + k * 17); });
  if (!done || !lastPage) { ctx.font = '9px ' + MONO; ctx.fillStyle = '#8a7a64'; ctx.textAlign = 'right'; ctx.fillText(done ? 'click to continue' : '', px + pw - 14, py + 138); }
  if (showChoices) {
    let y = py + 154;
    vis.forEach((c, k) => {
      const ck = checkOf(c), col = TAG_COL[c.tag] || '#e8dcc0', bx = px + 14, bw = pw - 28, over = ck.ok && mouse.x >= bx && mouse.x < bx + bw && mouse.y >= y && mouse.y < y + btnH;
      ctx.fillStyle = !ck.ok ? 'rgba(255,255,255,0.03)' : over ? 'rgba(255,211,107,0.22)' : 'rgba(255,255,255,0.07)'; ctx.fillRect(bx, y, bw, btnH);
      ctx.strokeStyle = !ck.ok ? 'rgba(233,226,212,0.1)' : over ? '#ffd36b' : 'rgba(233,226,212,0.28)'; ctx.strokeRect(bx + 0.5, y + 0.5, bw - 1, btnH - 1);
      ctx.textAlign = 'left'; ctx.font = '11px ' + MONO; ctx.fillStyle = ck.ok ? '#8a7a64' : '#4a4034'; ctx.fillText((k + 1) + '.', bx + 8, y + btnH / 2 + 0.5);
      let x0 = bx + 28;
      if (c.tag) { const tg = '[' + c.tag + (c.n ? ' ' + c.n : '') + ']'; ctx.fillStyle = ck.ok ? col : '#5a4a44'; ctx.fillText(tg, x0, y + btnH / 2 + 0.5); x0 += ctx.measureText(tg).width + 8; }
      ctx.fillStyle = ck.ok ? '#fff6e4' : '#6a5e50'; ctx.fillText(c.label + (ck.ok ? '' : '  (needs ' + ck.need + ')'), x0, y + btnH / 2 + 0.5);
      if (ck.ok) state.uiRects.push({ x: bx, y, w: bw, h: btnH, fn: () => chooseOption(k) });
      y += btnH + 4;
    });
  } else if (done && lastPage) {
    button(px + pw - 130, py + ph - 38, 116, 26, n.next ? 'Continue' : 'End', () => { if (n.next) gotoNode(n.next); else endDialogue(); }, true);
  }
}
function drawDlgFeed(w, h) {
  let y = 64;
  for (let k = state.dlgFeed.length - 1; k >= 0; k--) {
    const f = state.dlgFeed[k]; f.t -= 1 / 60; if (f.t <= 0) { state.dlgFeed.splice(k, 1); continue; }
  }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '12px ' + MONO;
  for (const f of state.dlgFeed) { ctx.globalAlpha = Math.min(1, f.t); ctx.fillStyle = '#000'; ctx.fillText(f.text, w / 2 + 1, y + 1); ctx.fillStyle = f.col; ctx.fillText(f.text, w / 2, y); y += 18; }
  ctx.globalAlpha = 1;
}
window.addEventListener('keydown', e => {
  if (!state.dlg || state.title) return;
  const k = e.key;
  if (/^[1-9]$/.test(k)) { chooseOption(+k - 1); e.preventDefault(); e.stopImmediatePropagation(); }
  else if (k === ' ' || k === 'Enter') { dialogueAdvance(); e.preventDefault(); e.stopImmediatePropagation(); }
}, true);
{ const o = closePanels; closePanels = function () { if (state.dlg) { state.dlg = null; } o(); }; }
{ const o = anyMenuOpen; anyMenuOpen = function () { return !!state.dlg || o(); }; }
{ const o = openTalk; openTalk = function (npc) {
  if (npc.raider && SCRIPTS.raider_wounded) { startDialogue('raider_wounded', npc); return; }
  if (npc.kind === 'traveller' && !npc.asked && SCRIPTS.traveller_hungry) { npc.asked = true; startDialogue('traveller_hungry', npc); return; }
  o(npc);
}; }
{ const o = startSurvQuest; startSurvQuest = function (n, q) { const id = q.id + '_ask'; if (SCRIPTS[id]) { startDialogue(id, n); return; } o(n, q); }; }
{ const o = drawTalk; drawTalk = function (w, h) {
  o(w, h);
  const n = state.talk;
  if (!n || (n.kind !== 'settler' && n.kind !== 'survivor') || n.scared) return;
  const q = SURV_QUESTS[n.name]; if (!q) return;
  const qs = state.quests[q.id];
  if (qs && qs.status === 'done' && SCRIPTS[q.id + '_done'] && !state.qflags['dlg:' + q.id + '_done']) {
    const pw = 600, ph = 184, px = Math.round(w / 2 - pw / 2), py = h - ph - 70, by = py + ph - 34 - 30;
    button(px + 330, by, 250, 22, 'Talk about their tag card', () => { state.qflags['dlg:' + q.id + '_done'] = true; startDialogue(q.id + '_done', n); }, true);
  }
}; }
{ const o = questEvent; questEvent = function (name) {
  o(name);
  const m = name.match(/^read:(.+)$/);
  if (m && SCRIPTS['echo_' + m[1]] && !state.qflags['echo:echo_' + m[1]]) setTimeout(() => { if (!state.dlg) startDialogue('echo_' + m[1]); }, 400);
}; }

/* ---------- Journal pages: What you did, and the Questions board ---------- */
const QUESTIONS = [
  { q: 'Who am I?', clues: [['flag:read:Folded Note', 'A note in your own handwriting says it worked and you remember nothing.'], ['item:Brass Tag', 'A brass tag stamped 11 fits your wrist.'], ['flag:read:Signal Tape', 'The tape calls you Unit 11.']] },
  { q: 'Who wrote the dispatch slip and the ledger?', clues: [['flag:read:Dispatch Slip', 'The slip is authorised by a name that has been blacked out.'], ['flag:read:Pump Ledger', 'The ledger keeper counted ten in the ruins and knew who was missing.']] },
  { q: 'Who is the voice on the tape?', clues: [['flag:read:Signal Tape', 'A voice says you asked for this.'], ['quest:sq_priya=done', 'Priya has heard the voice in person and will not say whose.']] },
  { q: 'Who is the twelfth name?', clues: [['quest:sq_sam=done', 'Sam remembers a twelfth line on the manifest, crossed out in thick ink.'], ['flag:read:Pump Ledger', 'Someone kept the pump ledger who was never on the register.']] },
  { q: 'Why can the ten not remember?', clues: [['quest:sq_lena=done', 'Lena says the sleepers were kept under, slowly, and woken one by one.'], ['quest:sq_tomas=done', 'Tomas was put on the list for the bees. He does not know who decided that.']] },
  { q: 'Who marked the ruin doors?', clues: [['quest:sq_wren=done', 'An eleven is scratched on every ruin door. Wren did not do it.']] },
  { q: 'What are the Husks?', clues: [['quest:sq_boone=done', 'Boone believes one of them used to be his crewmate.'], ['flag:met_raider', 'The raiders came from the city, following the signal.']] },
  { q: 'Who built the bunker under the tower?', clues: [['quest:sq_ripley=done', 'Ripley says the bunker plans carry a signature, and implies it is yours.']] },
  { q: 'What is in Marta\u2019s case?', clues: [['quest:sq_marta=done', 'The case was labelled in your hand: not for eating, not yet.']] },
  { q: 'Who answers the radio each night?', clues: [['quest:sq_dex=done', 'Dex counted nine voices on the first night and ten on the next.']] },
  { q: 'What is at the coast?', clues: [['flag:read:Signal Tape', 'The tape says the coast is the next stop.'], ['flag:raider_signal', 'Raiders walked toward the signal for free food and beds.']] },
  { q: 'Why did I ask to forget?', clues: [] }
];
function qAnswered(q) { return q.answer && evalCond(q.answer); }
function drawJournalPage(w, h) {
  const pw = 780, ph = 440, px = Math.round(w / 2 - pw / 2), py = Math.max(46, Math.round(h / 2 - ph / 2));
  panel(px, py, pw, ph, 0.95);
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.font = '12px ' + MONO; ctx.fillStyle = '#e9e2d4'; ctx.fillText('Journal', px + 14, py + 18);
  if (state.journalPage === 1) {
    ctx.font = '11px ' + MONO; ctx.fillStyle = '#e9e2d4'; ctx.fillText('Where you stand', px + 16, py + 52);
    let y = py + 78;
    for (const k of Object.keys(REP_NAMES)) {
      const v = repOf(k);
      ctx.font = '10px ' + MONO; ctx.fillStyle = '#c8b8a0'; ctx.textAlign = 'left'; ctx.fillText(REP_NAMES[k], px + 16, y);
      ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(px + 16, y + 10, 190, 8); ctx.fillStyle = 'rgba(233,226,212,0.5)'; ctx.fillRect(px + 110, y + 8, 1, 12);
      ctx.fillStyle = v >= 0 ? '#7fbfd0' : '#c0614a'; ctx.fillRect(px + 111 + (v < 0 ? v * 9.4 : 0), y + 10, Math.abs(v) * 9.4, 8);
      ctx.textAlign = 'right'; ctx.fillStyle = '#b8a890'; ctx.fillText((v > 0 ? '+' : '') + v, px + 212, y); y += 34;
    }
    ctx.textAlign = 'left'; ctx.font = '9px ' + MONO; ctx.fillStyle = '#8a7a64';
    wrapText('Reputation moves as you choose. Nobody sees the number, but they all feel it.', 200).forEach((l, k) => ctx.fillText(l, px + 16, y + 10 + k * 12));
    const dx = px + 250, dw = pw - 270;
    ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(dx - 8, py + 34, dw + 16, ph - 48);
    ctx.font = '11px ' + MONO; ctx.fillStyle = '#e9e2d4'; ctx.fillText('What you did', dx, py + 52);
    const log = state.choiceLog.slice().reverse();
    let yy = py + 76;
    if (!log.length) { ctx.font = '10px ' + MONO; ctx.fillStyle = '#7a6e5c'; ctx.fillText('Nothing yet that anyone will remember.', dx, yy); }
    log.slice(0, 15).forEach(e => { ctx.font = '10px ' + MONO; ctx.fillStyle = '#9a8a74'; ctx.fillText('Day ' + e.day, dx, yy); ctx.fillStyle = '#e8dcc0'; const ls = wrapText(e.text, dw - 70); ls.forEach((l, k) => ctx.fillText(l, dx + 62, yy + k * 13)); yy += Math.max(1, ls.length) * 13 + 6; });
  } else {
    const sel = state.qsel === undefined ? 0 : state.qsel;
    let y = py + 40;
    QUESTIONS.forEach((qq, k) => {
      const found = qq.clues.filter(c => evalCond(c[0])).length, on = sel === k;
      ctx.fillStyle = on ? 'rgba(255,211,107,0.16)' : 'rgba(255,255,255,0.05)'; ctx.fillRect(px + 10, y, 240, 28);
      ctx.strokeStyle = on ? '#ffd36b' : 'rgba(233,226,212,0.18)'; ctx.strokeRect(px + 10.5, y + 0.5, 239, 27);
      ctx.textAlign = 'left'; ctx.font = '10px ' + MONO; ctx.fillStyle = qAnswered(qq) ? '#7fbf7f' : '#ffe9b0'; ctx.fillText(qq.q.length > 34 ? qq.q.slice(0, 33) + '...' : qq.q, px + 18, y + 10);
      ctx.font = '8px ' + MONO; ctx.fillStyle = '#9a8a74'; ctx.fillText(found + ' clue' + (found === 1 ? '' : 's'), px + 18, y + 21);
      state.uiRects.push({ x: px + 10, y, w: 240, h: 28, fn: () => { state.qsel = k; } });
      y += 31;
    });
    const qq = QUESTIONS[sel], dx = px + 272, dw = pw - 292;
    ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(dx - 8, py + 34, dw + 16, ph - 48);
    ctx.textAlign = 'left'; ctx.font = '14px ' + MONO; ctx.fillStyle = '#ffe9b0'; ctx.fillText(qq.q, dx, py + 56);
    ctx.font = '10px ' + MONO; ctx.fillStyle = qAnswered(qq) ? '#7fbf7f' : '#b8a890'; ctx.fillText(qAnswered(qq) ? 'Answered' : 'Open', dx, py + 74);
    let yy = py + 100; ctx.font = '11px ' + MONO;
    const found = qq.clues.filter(c => evalCond(c[0]));
    if (!found.length) { ctx.fillStyle = '#7a6e5c'; ctx.fillText('No clues yet.', dx, yy); }
    found.forEach(c => { ctx.fillStyle = '#e8dcc0'; wrapText('- ' + c[1], dw).forEach(l => { ctx.fillText(l, dx, yy); yy += 16; }); yy += 4; });
    if (qq.clues.length > found.length) { ctx.fillStyle = '#6a5e50'; ctx.fillText((qq.clues.length - found.length) + ' more to find.', dx, yy + 6); }
  }
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#b9b09d'; ctx.textAlign = 'left'; ctx.fillText('J or Esc closes.', px + 14, py + ph - 14);
}
{ const o = drawJournal; drawJournal = function (w, h) {
  const pw = 780, px = Math.round(w / 2 - pw / 2), py = Math.max(46, Math.round(h / 2 - 440 / 2));
  if (!state.journalPage) o(w, h); else drawJournalPage(w, h);
  ['Quests', 'What you did', 'Questions'].forEach((nm, k) => button(px + pw - 330 + k * 108, py + 6, 104, 22, nm, () => { state.journalPage = k; }, state.journalPage === k));
}; }
Object.assign(DBG, { SCRIPTS, startDialogue, chooseOption, dialogueAdvance, endDialogue, evalCond, repAdd, memoryScore, QUESTIONS, parseScripts, applyEffect });
