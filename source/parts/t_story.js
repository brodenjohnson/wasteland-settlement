/* =====================================================================
   STORY: the note, three missions, documents, map pins
   Draft text. This is a skeleton for the story pass.
   ===================================================================== */
const DOCS = {
  'Folded Note': { title: 'A note, folded small', text: 'If you are reading this, it worked and you remember nothing. Good. That was the plan.\n\nDo not go to the city. Do not trust the radio.\n\nStart with the depot office in the scrapyard. Third drawer. The tag in there will fit your wrist.\n\nThe valley is safe because I made it safe. Plant the seeds. Keep them alive. They matter more than you do.\n\nSorry about the headache.\n\nYou' },
  'Dispatch Slip': { title: 'Depot Dispatch, Form 11-B', text: 'Eleven in. Eleven out.\nOne valley, one gate, one pump.\n\nTags issued to all eleven. Unit 11 to collect last.\n\nThe pump house keeps the ledger. Water first, questions after.\n\nAuthorised by: [name blacked out]' },
  'Pump Ledger': { title: 'Pump House 4, water log', text: 'Day 1. Eleven on the register. Eleven asleep.\n\nDay 212. Power failing. Water still clean. Pump running off the old valley feed.\n\nDay 380. Register says eleven. I count ten in the ruins. One is missing and I know which.\n\nDay 381. Tag numbers are stamped on the wall. Four digits scratched on the back of each: 4471. The tower in the ashlands still answers on it. Take the tag. Do not take the stairs.' },
  'Signal Tape': { title: 'Tape 11, Ash Tower', text: '... wake group acknowledged. Seed stock confirmed. Eleven tags, one answering.\n\nUnit 11, if you are hearing this: you did not do this to yourself. You asked us to do it to you.\n\nThe coast is the next stop. Bring the seeds. Bring the ten.\n\nDo not trust the radio.\n\nThat is us. That is the radio.' }
};
const STORY_ITEMS = new Set(['Folded Note', 'Dispatch Slip', 'Pump Ledger', 'Signal Tape', 'Brass Tag']);
Object.assign(ITEM_COL, { 'Folded Note': '#e6d8b0', 'Dispatch Slip': '#d8cba0', 'Pump Ledger': '#b8a070', 'Signal Tape': '#8a8f98', 'Brass Tag': '#c8a040' });
Object.keys(DOCS).forEach(n => { ITEM_DESC[n] = 'Readable. Open your bag and right-click it.'; });
ITEM_DESC['Brass Tag'] = 'A brass tag stamped 11. It fits your wrist. Four digits are scratched on the back: 4471.';
const SITE_DEFS = {
  depot: { def: RUIN_DEFS[1], label: 'Depot Office', crate: { items: [{ name: 'Brass Tag', qty: 1 }, { name: 'Dispatch Slip', qty: 1 }], story: 'depot' } },
  pump: { def: RUIN_DEFS[15], label: 'Pump House', crate: { items: [{ name: 'Pump Ledger', qty: 1 }], story: 'pump' } },
  bunker: { def: RUIN_DEFS[7], label: 'The Ash Tower bunker', crate: { items: [{ name: 'Signal Tape', qty: 1 }], story: 'bunker', requires: 'Brass Tag', hint: 'The radio room has a slot shaped like a brass tag.' } }
};
function sitePos(key) { const d = SITE_DEFS[key].def; return { x: (d.x + d.w / 2) * TS, y: (d.y + d.h / 2) * TS }; }
function nearSite(key, r) { return () => { const s = sitePos(key), p = state.player; return Math.hypot(p.x - s.x, p.y - s.y) < r * TS; }; }
function siteTarget(key) { return () => Object.assign({ label: SITE_DEFS[key].label }, sitePos(key)); }
function placeStorySites() {
  for (const key of Object.keys(SITE_DEFS)) {
    const d = SITE_DEFS[key].def, cx = d.x + Math.floor(d.w / 2), cy = d.y + Math.floor(d.h / 2);
    let spot = null;
    for (let r = 0; r < 6 && !spot; r++) for (let dy = -r; dy <= r && !spot; dy++) for (let dx = -r; dx <= r && !spot; dx++) {
      const x = cx + dx, y = cy + dy, i = y * W + x;
      if (x > d.x && y > d.y && x < d.x + d.w - 1 && y < d.y + d.h - 1 && tiles[i] === T.FLOOR && !objs[i]) spot = i;
    }
    if (spot === null) { spot = cy * W + cx; }
    objs[spot] = O.CRATE; crateLoot.set(spot, JSON.parse(JSON.stringify(SITE_DEFS[key].crate)));
    SITE_DEFS[key].tile = spot;
  }
  buildMinimap();
}
QUEST_DEFS.push(
  { id: 'note', title: 'Third Drawer', giver: 'A note in your handwriting', desc: 'You woke in the valley with nothing but a note in your coat, written in your own hand, by someone who clearly knew a lot more than you do. It points to a depot office in the scrapyard.',
    steps: [
      { id: 'read', text: 'Read the note (open your bag, right-click it)', event: 'read:Folded Note' },
      { id: 'reach', text: 'Find the Depot Office in the Scrapyard', check: nearSite('depot', 7), target: siteTarget('depot') },
      { id: 'drawer', text: 'Open the crate in the Depot Office', event: 'story:depot' },
      { id: 'slip', text: 'Read the Dispatch Slip', event: 'read:Dispatch Slip' }
    ], reward: { xp: 80, items: [{ name: 'Bandage', qty: 2 }, { name: 'Canned food', qty: 2 }] }, next: ['pump'] },
  { id: 'pump', title: 'The Pump House', giver: 'The Dispatch Slip', desc: 'Eleven in, eleven out, and a ledger at the pump house in the Toxic Marsh. The water out there is not for drinking, so pack something for the radiation.',
    steps: [
      { id: 'reach', text: 'Reach the Pump House in the Toxic Marsh', check: nearSite('pump', 7), target: siteTarget('pump') },
      { id: 'ledger', text: 'Find the pump ledger', event: 'story:pump' },
      { id: 'read', text: 'Read the Pump Ledger', event: 'read:Pump Ledger' }
    ], reward: { xp: 110, items: [{ name: 'Rad-Away', qty: 2 }, { name: 'Metal plate', qty: 3 }] }, next: ['signal'] },
  { id: 'signal', title: 'The Signal', giver: 'The Pump Ledger', desc: 'Four digits on the back of the brass tag: 4471. The tower in the ashlands still answers on it. Whatever is up there knows who you are.',
    steps: [
      { id: 'reach', text: 'Reach the bunker under the Ash Tower, in the Ashlands', check: nearSite('bunker', 7), target: siteTarget('bunker') },
      { id: 'tape', text: 'Open the radio room crate (it wants your brass tag)', event: 'story:bunker' },
      { id: 'listen', text: 'Listen to the Signal Tape', event: 'read:Signal Tape' }
    ], reward: { xp: 180, items: [{ name: 'Rad-Away', qty: 2 }, { name: 'Pistol rounds', qty: 10 }] }, next: [] }
);
{ const o = openCrate; openCrate = function (t) {
  const loot = crateLoot.get(t.i);
  if (loot && loot.requires && countItem(loot.requires) <= 0) { toast(loot.hint || 'It is locked.', 3.5); state.actCd = 0.6; return; }
  const had = objs[t.i]; o(t);
  if (loot && loot.story && objs[t.i] !== had) { questEvent('story:' + loot.story); toast('You found something worth reading.', 3); }
}; }
{ const o = sellItem; sellItem = function (i, all) { const s = state.player.inventory[i]; if (s && STORY_ITEMS.has(s.name)) { toast('You are keeping that.', 2); return; } o(i, all); }; }
{ const o = useItem; useItem = function (i) { const s = state.player.inventory[i]; if (s && DOCS[s.name]) { closePanels(); state.reading = s.name; return; } o(i); }; }
{ const o = anyMenuOpen; anyMenuOpen = function () { return !!state.reading || o(); }; }
{ const o = closePanels; closePanels = function () { if (state.reading) { questEvent('read:' + state.reading); state.reading = null; } o(); }; }
{ const o = startQuest; startQuest = function (id) { o(id); if (id === 'pump' || id === 'signal') state.pinned = id; }; }
{ const o = questTick; questTick = function () {
  o();
  if (state.quests.signal && state.quests.signal.status === 'done' && !state.qflags.chapterOne) { state.qflags.chapterOne = true; toast('Chapter one complete. The signal points north-west, past the edge of the map. More soon.', 8); }
}; }
function updateStory(dt) {
  if (state.title) return;
  if (!state.qflags.storyInit && state.quests.welcome) {
    state.qflags.storyInit = true;
    startQuest('note'); addItem('Folded Note', 1);
    if (!state.qflags.sitesPlaced) { placeStorySites(); state.qflags.sitesPlaced = true; }
    state.intro = { t: 0 };
  }
  if (state.qflags.storyInit && !state.qflags.sitesPlaced) { placeStorySites(); state.qflags.sitesPlaced = true; }
  if (state.intro) {
    state.intro.t += dt;
    if (state.intro.t > 5) { state.intro = null; if (!state.qflags['read:Folded Note']) { closePanels(); state.reading = 'Folded Note'; } }
  }
}
function currentTarget() {
  const q = activeQuest(); if (!q) return null;
  const qs = state.quests[q.id], step = q.steps.find(s => !qs.done[s.id]);
  return step && step.target ? step.target() : null;
}
{ const o = drawTracker; drawTracker = function () {
  o();
  const q = activeQuest(); if (!q) return;
  const qs = state.quests[q.id], step = q.steps.find(s => !qs.done[s.id]);
  if (!step || !step.target) return;
  const t = step.target(), p = state.player, dx = t.x - p.x, dy = t.y - p.y, dist = Math.hypot(dx, dy) / TS;
  const y = 138 + 26 + wrapText(step.text, 196).length * 12 + 8;
  panel(8, y, 214, 22, 0.8);
  if (dist < 7) { ctx.font = '10px ' + MONO; ctx.fillStyle = '#9fdc8f'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(t.label + ': you are here', 16, y + 11.5); return; }
  const a = Math.atan2(dy, dx);
  ctx.save(); ctx.translate(26, y + 11); ctx.rotate(a); ctx.fillStyle = '#ffd36b'; ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-5, -6); ctx.lineTo(-2, 0); ctx.lineTo(-5, 6); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.font = '10px ' + MONO; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#e8dcc0'; ctx.fillText(t.label + '  ' + Math.round(dist) + ' tiles', 42, y + 11.5);
}; }
{ const o = drawBigMap; drawBigMap = function (w, h) {
  o(w, h);
  const t = currentTarget(); if (!t) return;
  const S = 512, px = Math.round(w / 2 - S / 2 - 6), py = Math.max(46, Math.round(h / 2 - S / 2 - 18));
  const mx = px + 6 + t.x / TS / W * S, my = py + 6 + t.y / TS / H * S;
  ctx.fillStyle = '#000'; ctx.beginPath(); ctx.moveTo(mx, my + 1); ctx.lineTo(mx + 7, my - 8); ctx.lineTo(mx, my - 15); ctx.lineTo(mx - 7, my - 8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#e8003d'; ctx.beginPath(); ctx.moveTo(mx, my - 1); ctx.lineTo(mx + 5, my - 8); ctx.lineTo(mx, my - 13); ctx.lineTo(mx - 5, my - 8); ctx.closePath(); ctx.fill();
  ctx.font = '11px ' + MONO; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#000'; ctx.fillText(t.label + '?', mx + 1, my - 22); ctx.fillStyle = '#ffe9b0'; ctx.fillText(t.label + '?', mx, my - 23);
}; }
function drawReader(w, h) {
  const d = DOCS[state.reading]; if (!d) { state.reading = null; return; }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, w, h);
  ctx.font = '13px ' + MONO;
  const pw = 520, lines = []; d.text.split('\n').forEach(par => { if (!par) lines.push(''); else wrapText(par, pw - 64).forEach(l => lines.push(l)); });
  const ph = Math.min(h - 60, 110 + lines.length * 19), px = Math.round(w / 2 - pw / 2), py = Math.round(h / 2 - ph / 2);
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(px + 5, py + 6, pw, ph);
  ctx.fillStyle = '#d8c79a'; ctx.fillRect(px, py, pw, ph);
  ctx.fillStyle = '#c9b784'; for (let k = 0; k < 6; k++) ctx.fillRect(px + 8 + k * 83 % (pw - 20), py + 6, 14, 2);
  ctx.strokeStyle = '#7a5a30'; ctx.lineWidth = 2; ctx.strokeRect(px + 1, py + 1, pw - 2, ph - 2);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = '15px ' + MONO; ctx.fillStyle = '#5a3a1a'; ctx.fillText(d.title, px + 30, py + 30);
  ctx.fillStyle = '#9a8350'; ctx.fillRect(px + 30, py + 44, pw - 60, 1);
  ctx.font = '13px ' + MONO; ctx.fillStyle = '#3a2a18'; lines.forEach((l, k) => ctx.fillText(l, px + 32, py + 68 + k * 19));
  const bx = px + pw - 130, by = py + ph - 38, over = mouse.x >= bx && mouse.x < bx + 110 && mouse.y >= by && mouse.y < by + 26;
  ctx.fillStyle = over ? '#8a5a2b' : '#6b4a2b'; ctx.fillRect(bx, by, 110, 26); ctx.strokeStyle = '#3a2816'; ctx.lineWidth = 1; ctx.strokeRect(bx + 0.5, by + 0.5, 109, 25);
  ctx.font = '11px ' + MONO; ctx.textAlign = 'center'; ctx.fillStyle = '#f4e8c8'; ctx.fillText('Put it away', bx + 55, by + 13.5);
  state.uiRects.push({ x: bx, y: by, w: 110, h: 26, fn: () => closePanels() });
}
function drawIntro(w, h) {
  const t = state.intro.t, a = t < 3.2 ? 1 : Math.max(0, 1 - (t - 3.2) / 1.8);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = 'rgba(0,0,0,' + a + ')'; ctx.fillRect(0, 0, w, h);
  const ta = t < 0.8 ? t / 0.8 : t < 2.6 ? 1 : Math.max(0, 1 - (t - 2.6) / 0.8);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '16px ' + MONO; ctx.fillStyle = 'rgba(232,220,192,' + ta + ')';
  ctx.fillText(t < 1.7 ? 'You wake in a valley you do not know.' : 'There is a note in your coat.', w / 2, h / 2);
}

