/* =====================================================================
   AS_CHAPTER3: The Long Table. Marta's case, the capacity of the valley,
   the Cantor on the radio, Priya's answer, the Listeners at the gate, the
   Cantor in his chapel, and the ten at the table. The writing is in
   parts/dialogue_ch3.txt.
   ===================================================================== */
parseScripts(CH3_TEXT);
const TEN = new Set(SURVIVOR_DEFS.map(d => d.name));

/* ---------- The case and its papers ---------- */
for (const [n, col] of [['Sealed Case', '#22222a'], ['The Long Table', '#d8d0b8'], ['Minutes of the Vote', '#c8c0a8'], ['Director Code Card', '#e8e0c8']]) { STORY_ITEMS.add(n); ITEM_STACK[n] = 1; ITEM_COL[n] = col; }
ITEM_DESC['Sealed Case'] = 'Black, brass corners, tape across the lid in your handwriting. Right-click it to open it.';
for (const n of ['The Long Table', 'Minutes of the Vote', 'Director Code Card']) ITEM_DESC[n] = 'Readable. Open your bag and right-click it.';
Object.assign(DOCS, {
  'The Long Table': { title: 'The Long Table: a plan in stages', text: 'A plan for receiving the Cradle, one stage at a time.\n\nStage one. Twelve beds. Clean water for forty. A wall that holds. Wake twelve: the medics and the cooks first, because they will keep the rest alive.\n\nStage two. Forty beds. Two clean water sources. A clinic. Wake forty.\n\nStage three and on. Do not draw the next stage until the boxes for the last one are filled in. WATER. FOOD. BEDS. WALLS. If a box is empty, nobody new sits down.\n\nThe table is long because it has to be. Set a place before you wake anyone to sit at it.\n\nPlant the seeds. Keep them alive. They matter more than you do.' },
  'Minutes of the Vote': { title: 'Continuity Board, minutes (blacked out)', text: 'EXTRAORDINARY SESSION. CRADLE ALLOCATION.\n\nPresent: ████████, ████████, ████████ and others.\n\nMotion: that places in the Cradle be allocated in three tiers. Tier one: ████████. Tier two: ████████. Tier three: staff and dependants, as available.\n\nDiscussion: ██████████████████████. The Chair noted that the allocation "reflects contribution". It was not recorded to what.\n\nVote: for, ██. Against, ██. Abstaining, ██. Carried.\n\nSigned for the Board: ████████. Countersigned: ████████.\n\nThe names were blacked out by hand, with a marker, carefully. Whoever did it wanted the names gone and the tiers kept.' },
  'Director Code Card': { title: 'A laminated card', text: 'DIRECTOR OVERRIDE. FINAL AUTHORISATION.\n\n4471 0911 2306\n\nDIRECTOR ONLY. DO NOT CARRY WITH THE ROSTER.\n\nOn the back, in your handwriting: Do the sum again. Then do it once more, for the ones who aren’t on the list.' }
});
{ const o = useItem; useItem = function (i) {
  const s = state.player.inventory[i];
  if (s && s.name === 'Sealed Case') { closePanels(); startDialogue('ch3_case_open'); return; }
  o(i);
}; }

/* ---------- The capacity of the valley: what the Long Table is measured against ---------- */
function wastesView() {
  if (state.map === 'wastes') return { structs, tilled, settlers };
  const s = STASH.wastes; return s ? { structs: s.structs, tilled: s.arrays.tilled, settlers: s.settlers } : null;
}
function capacity() {
  const v = wastesView(); if (!v || !state.hearth) return { total: 0, beds: 0, food: 0, water: 0, safety: 0 };
  const n = types => { let c = 0; for (const [, st] of v.structs) if (types.includes(st.type)) c++; return c; };
  let till = 0; for (let i = 0; i < v.tilled.length; i++) if (v.tilled[i]) till++;
  const beds = n(['bunk']) * 3;
  const food = Math.round(till * 0.6 + animals.length * 4);
  const water = n(['purifier']) * 25 + n(['sink']) * 5;
  const safety = n(['wall', 'scrapwall', 'stonewall', 'steelwall', 'tyrewall']) + n(['gate']) * 3 + n(['guardpost']) * 12 + n(['turret']) * 15 + n(['trap']) * 2 + v.settlers.filter(s => s.job === 'Guard').length * 8;
  return { total: Math.min(beds, food, water, safety), beds, food, water, safety };
}
{ const o = evalAtom; evalAtom = function (t) {
  const m = t.match(/^capacity(>=|<=|>|<)(\d+)$/);
  if (m) { const v = capacity().total, k = +m[2]; return m[1] === '>=' ? v >= k : m[1] === '<=' ? v <= k : m[1] === '>' ? v > k : v < k; }
  return o(t);
}; }
{ const o = drawSettlement; drawSettlement = function (w, h) {
  o(w, h);
  if (!state.qflags.case_opened) return;
  const pw = 900, ph = 540, px = Math.round(w / 2 - pw / 2), py = Math.max(46, Math.round(h / 2 - ph / 2)), c = capacity();
  const bx = px + 14, by = py + ph - 178, bw = 236, bh = 140;
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(bx, by, bw, bh); ctx.strokeStyle = 'rgba(255,211,107,0.5)'; ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = '11px ' + MONO; ctx.fillStyle = '#ffe9b0'; ctx.fillText('The Long Table', bx + 10, by + 14);
  ctx.font = '10px ' + MONO; ctx.fillStyle = '#e8dcc0'; ctx.fillText('Could take in about ' + c.total + ' of the', bx + 10, by + 32); ctx.fillText('3,012 sleepers today.', bx + 10, by + 46);
  const parts = [['Beds', c.beds], ['Food', c.food], ['Water', c.water], ['Safety', c.safety]], lo = Math.min(...parts.map(p => p[1])), mx = Math.max(40, ...parts.map(p => p[1]));
  parts.forEach(([k, v], j) => {
    const x = bx + 10 + (j % 2) * 110, y = by + 66 + Math.floor(j / 2) * 30;
    ctx.fillStyle = v === lo ? '#ff9a6a' : '#b8a890'; ctx.fillText(k + ' ' + v, x, y);
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(x, y + 9, 96, 5); ctx.fillStyle = v === lo ? '#e8704a' : '#7fbf7f'; ctx.fillRect(x, y + 9, 96 * Math.min(1, v / mx), 5);
  });
  ctx.fillStyle = '#8a7a64'; ctx.fillText('The weakest sets the number.', bx + 10, by + 128);
}; }

/* ---------- The quests ---------- */
function npcAt(name) {
  if (state.map !== 'wastes') return null;
  return settlers.find(s => s.name === name) || survivors.find(s => s.name === name) || null;
}
function npcGone(name) {
  if (state.map !== 'wastes') return false;
  return !npcAt(name) && !state.downed.some(d => d.s.name === name);
}
const npcTarget = name => () => { const n = npcAt(name); return n ? { x: n.x, y: n.y, label: name } : null; };
function chapelTarget() {
  if (state.map === 'tidewrack') return tideTarget(4);
  const tp = state.towerPortal; return state.map === 'wastes' && tp ? { x: (tp.x + 0.5) * TS, y: (tp.y + 0.5) * TS, label: 'Down to the coast' } : null;
}
QUEST_DEFS.push(
  { id: 'ch3_case', title: 'What Marta Knows', giver: 'Your own voice', desc: 'The recording at the Cradle door told you to go home and ask Marta what is in the case. It said she would pretend not to know.',
    steps: [{ id: 'find', text: 'Ask Marta Voss about the case', event: 'ch3:marta', target: () => npcGone('Marta Voss') && state.hearth ? { x: (state.hearth.x + 0.5) * TS, y: (state.hearth.y + 0.5) * TS, label: 'Her bunk' } : npcTarget('Marta Voss')() },
            { id: 'open', text: 'Open the case', event: 'ch3:case' }],
    reward: { xp: 200, items: [] }, next: ['ch3_radio'] },
  { id: 'ch3_radio', title: 'Ten Voices', giver: 'Dex Harlan, without meaning to', desc: 'Dex heard nine voices on the radio at night, then ten. Something near you has been answering the broadcast, and whatever follows the broadcast follows the answer.',
    steps: [{ id: 'priya', text: 'Ask Priya Nair about the radio', event: 'ch3:priya', target: npcTarget('Priya Nair') }],
    reward: { xp: 150, items: [] }, next: ['ch3_listeners'] },
  { id: 'ch3_listeners', title: 'They Come to Listen', giver: 'The Cantor', desc: 'The Listeners have heard the answer. They are coming to see who it calls. After that, the Cantor wants a word, in his own chapel.',
    steps: [{ id: 'arrive', text: 'Be at your camp after dark. They are coming.', event: 'ch3:listeners', target: () => state.map === 'wastes' && state.hearth ? { x: (state.hearth.x + 0.5) * TS, y: (state.hearth.y + 0.5) * TS, label: 'Your camp' } : null },
            { id: 'chapel', text: 'Face the Cantor at Chapel Row', event: 'ch3:cantor', target: chapelTarget }],
    reward: { xp: 300, items: [{ name: 'Medkit', qty: 2 }] }, next: ['ch3_table'] },
  { id: 'ch3_table', title: 'The Long Table', giver: 'The plan in the case', desc: 'Set a long table at home and sit the ten down. Do the sum again, with them this time.',
    steps: [{ id: 'table', text: 'Build a Table in your camp', check: () => { const v = wastesView(); if (!v) return false; for (const [, st] of v.structs) if (st.type === 'table') return true; return false; } },
            { id: 'sit', text: 'Talk to one of the ten and call everyone to the table', event: 'ch3:table' }],
    reward: { xp: 100, items: [] }, next: [] }
);

/* ---------- Effects the chapter's script uses ---------- */
{ const o = applyEffect; applyEffect = function (e, c) {
  let m;
  if (e === 'opencase') {
    if (state.qflags.case_opened) return;
    state.qflags.case_opened = true; if (countItem('Sealed Case')) takeItems({ 'Sealed Case': 1 });
    for (const n of ['The Long Table', 'Minutes of the Vote', 'Director Code Card']) { if (spaceFor(n, 1)) addItem(n, 1); else state.drops.push({ x: state.player.x, y: state.player.y + 6, name: n, qty: 1, t: 0 }); }
    questEvent('ch3:case'); sfx('pickup');
  } else if (e === 'priyaquiet') state.qflags.priya_quiet = true;
  else if (e === 'priyabait') state.qflags.priya_bait = true;
  else if (e === 'cantorwin') { state.qflags.cantor_debated = true; questEvent('ch3:cantor'); }
  else if (e === 'cantorfight') cantorFight(c && c.npc);
  else if (e === 'cantorspare') { state.qflags.cantor_spared = true; if (c && c.npc) removeNpc(c.npc); questEvent('ch3:cantor'); }
  else if (e === 'cantorkill') { state.qflags.cantor_dead = true; if (c && c.npc) removeNpc(c.npc); questEvent('ch3:cantor'); }
  else if ((m = e.match(/^tablelean:(\w+)$/))) state.qflags['lean_' + m[1]] = true;
  else o(e, c);
}; }

/* ---------- Talking to the ten ---------- */
function tableSeats() {
  const here = new Set(settlers.map(s => s.name));
  const LINES = {
    'Marta Voss': 'Marta sits nearest the plan, as if it might need watering.', 'Dex Harlan': 'Dex counts the chairs. Then he counts them again.',
    'Wren Alvarez': 'Wren sits with her back to the wall, where she can see the gate.', 'Old Tomas': 'Old Tomas puts a jar of honey in the middle without a word.',
    'Ripley Cho': 'Ripley reads the water figures in the plan and starts checking the arithmetic in the margin.', 'Sam Oduya': 'Sam takes the chair at the far end, nearest the road, out of habit.',
    'Lena Fischer': 'Lena has brought bandages. Nobody asks why.', 'Boone Keller': 'Boone stands behind the last chair until somebody tells him to sit.',
    'Priya Nair': state.qflags.priya_quiet ? 'Priya keeps one ear turned towards a radio she is not listening to any more.' : 'Priya has the radio in her lap. It is still answering.',
    'Juno Park': 'Juno sets a place for everyone, then one more, and does not say who it is for.' };
  const c = capacity(), sat = [...TEN].filter(n => here.has(n));
  let t = '=== ch3_table_seats\n~ You put the table in the middle of the camp, where the light is. Nobody sits at the head of it. Nobody wants to.\n';
  if (!sat.length) t += '~ Nobody comes. None of the ten live here. You sit at the long table on your own, which is its own kind of answer.\n';
  for (const n of sat) t += '~ ' + LINES[n] + '\n';
  t += '~ You read them the number. The valley could feed, water, house and keep safe about ' + c.total + ' people today, if the door opened tomorrow. ' + c.total + ' of three thousand and twelve.\n';
  const lo = [['beds', c.beds], ['food', c.food], ['water', c.water], ['safety', c.safety]].sort((a, b) => a[1] - b[1])[0][0];
  t += '~ Somebody points out that it is the ' + lo + ' holding the number down. Somebody always does.\n> ch3_table\n';
  parseScripts(t);
}
{ const o = drawTalk; drawTalk = function (w, h) {
  o(w, h);
  const n = state.talk;
  if (!n || !TEN.has(n.name) || n.scared || state.dlg) return;
  const pw = 600, ph = 184, px = Math.round(w / 2 - pw / 2), py = h - ph - 70, by = py + ph - 64;
  const qa = id => state.quests[id] && state.quests[id].status === 'active';
  let label = null, go = null;
  if (n.name === 'Marta Voss' && qa('ch3_case') && !qf('ch3:marta')) { label = 'Ask about the case'; go = 'ch3_marta'; }
  else if (n.name === 'Priya Nair' && qa('ch3_radio') && !qf('ch3:priya')) { label = 'Ask about the radio'; go = 'ch3_priya'; }
  else if (n.name === 'Boone Keller' && state.qflags.case_opened && !state.qflags.boone_asked) { label = 'Ask about the watch'; go = 'ch3_boone'; }
  else if (n.kind === 'settler' && qa('ch3_table') && state.quests.ch3_table.done.table && !qf('ch3:table')) { label = 'Call everyone to the table'; go = 'ch3_table_seats'; }
  if (!label) return;
  button(px + 12, by, 300, 22, label, () => {
    if (go === 'ch3_boone') state.qflags.boone_asked = true;
    if (go === 'ch3_table_seats') tableSeats();
    state.talk = null; startDialogue(go, n);
  }, true);
}; }

/* ---------- The Listeners: a raid that sings, or a ring of people sitting outside your wall ---------- */
RAID_KINDS.listeners = { name: 'The Listeners, singing', mult: 1, minDay: 99999, hint: 'They are not here to steal. Do not let them reach the walls.', pool: () => ['zealot', 'zealot', 'zealot', 'scrapper'] };
{ const o = pickRaid; pickRaid = function (day) {
  if (state.qflags.listener_raid_pending) { delete state.qflags.listener_raid_pending; RAID_KINDS.listeners.mult = state.qflags.priya_bait ? 1.5 : state.qflags.priya_quiet ? 0.7 : 1; return RAID_KINDS.listeners; }
  return o(day);
}; }
{ const o = questEvent; questEvent = function (name) {
  o(name);
  if (name === 'raidEnd' && state.qflags.listener_raid) {
    delete state.qflags.listener_raid; state.qflags.listeners_fought = true;
    const fl = state.mapFlags.tidewrack = state.mapFlags.tidewrack || {}; fl.chapelOpen = true;
    o('ch3:listeners'); setTimeout(() => { if (!state.dlg) startDialogue('ch3_listeners_after'); }, 600);
    toast('A bell pole lies in the dirt with a strip of cloth tied to it. CHAPEL ROW. HE IS WAITING.', 6);
  }
}; }

/* ---------- The Cantor in his chapel ---------- */
Object.assign(ENEMY_TYPES, { cantor: { name: 'The Cantor', hp: 640, dmg: 15, speed: 44, size: 13, aggro: 300, atkCd: 1.1, xp: 260, structMult: 2, boss: true } });
Object.assign(ENEMY_SPR, { cantor: { w: 24, h: 34, paint: (c, f) => { paintHuman2(c, f, { legs: '#2a2a30', body: '#d8d0bc', skin: '#a88a72', eye: '#14120f', hood: '#c8c0a8', accent: '#c8a040', club: true, bulk: true }); R(c, '#c8a040', 10, 13, 4, 3); R(c, '#8a6a20', 11, 15, 2, 1); } } });
Object.assign(LVL_OFF, { cantor: [4, 6] });
DROPS.cantor = [{ n: 'Caps', c: 1, a: 60, b: 110 }, { n: 'Medkit', c: 1, a: 1, b: 2 }, { n: 'Human Skull', c: 1, a: 1, b: 1 }];
CREATURE_LORE.cantor = 'He used to read the weather on a company radio. Now he reads the broadcast, and he has never once been wrong about what it wants.';
function cantorNpc(x, y, beaten) {
  return { id: beaten ? 962 : 961, kind: 'survivor', cantor: true, beaten: !!beaten, name: 'The Cantor', bio: 'Older than his voice. He listens with his whole face.', skills: { farm: 0, guard: 3, haul: 0 },
    look: npcLook(961), x, y, home: { x, y }, wander: 0, wx: x, wy: y, dirx: -1, walkT: 0, scared: false };
}
{ const o = MAPDEFS.tidewrack.setup; MAPDEFS.tidewrack.setup = function (rooms) {
  const q = state.quests.ch3_listeners, live = q && q.status === 'active' && q.done.arrive && !qf('ch3:cantor');
  if (live) { const fl = state.mapFlags.tidewrack = state.mapFlags.tidewrack || {}; fl.chapelOpen = true; }
  o.call(this, rooms);
  const r4 = rooms[4];
  if (r4 && ((live && !state.qflags.cantor_fighting) || state.qflags.cantor_debated)) survivors.push(cantorNpc((r4.cx + 0.5) * TS, (r4.cy - 1.5) * TS));
}; }
function cantorFight(npc) {
  const x = npc ? npc.x : state.player.x + 60, y = npc ? npc.y : state.player.y;
  if (npc) removeNpc(npc);
  state.qflags.cantor_fighting = true;
  const b = spawnEnemy('cantor', x, y, {}); b.aggro = true;
  for (let k = 0; k < 3; k++) { const z = spawnEnemy('zealot', x + (k - 1) * 40, y + 50, {}); z.aggro = true; }
  sfx('horn'); state.shakeT = 0.4;
}
{ const o = updateEnemies; updateEnemies = function (dt) {
  for (const e of enemies) {
    if (e.type !== 'cantor' || e.hp <= 0) continue;
    const mx = e.maxHp || ENEMY_TYPES.cantor.hp;
    if (!e.bells && e.hp < mx * 0.5) { e.bells = true; for (let k = 0; k < 2; k++) { const z = spawnEnemy('zealot', e.x + (k ? 50 : -50), e.y - 30, {}); z.aggro = true; } toast('The Cantor rings his bell. More of them come out of the pews.', 3.5); sfx('horn'); }
    if (!e.down && e.hp <= mx * 0.15) {
      e.down = true; enemies.splice(enemies.indexOf(e), 1);
      survivors.push(cantorNpc(e.x, e.y, true)); delete state.qflags.cantor_fighting;
      toast('The Cantor goes down on one knee. The bells stop.', 4); sfx('thunder'); break;
    }
  }
  o(dt);
}; }
{ const o = killEnemy; killEnemy = function (e) { o(e); if (e.type === 'cantor' && !e.down) { state.qflags.cantor_dead = true; delete state.qflags.cantor_fighting; questEvent('ch3:cantor'); toast('The Cantor is dead. Somewhere, a radio goes on reading the call sign to nobody.', 5); } }; }
{ const o = openTalk; openTalk = function (npc) {
  if (npc && npc.cantor) {
    if (npc.beaten) { startDialogue('ch3_cantor_beaten', npc); return; }
    if (qf('ch3:cantor')) { toast('The Cantor is listening to the radio. He does not look up.', 3); return; }
    startDialogue('ch3_cantor', npc); return;
  }
  o(npc);
}; }
function drawCantorBar(w) {
  const b = enemies.find(e => e.type === 'cantor' && Math.hypot(e.x - state.player.x, e.y - state.player.y) < 420);
  if (!b || state.title) return;
  const mx = b.maxHp || ENEMY_TYPES.cantor.hp, f = Math.max(0, b.hp / mx), bw = 360, x = Math.round(w / 2 - bw / 2), y = 64;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); panel(x - 8, y - 8, bw + 16, 34, 0.9);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '11px ' + MONO; ctx.fillStyle = '#ffe9b0'; ctx.fillText('The Cantor', w / 2, y + 4);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x, y + 14, bw, 6); ctx.fillStyle = b.bells ? '#ff4a3a' : '#c8a040'; ctx.fillRect(x, y + 14, bw * f, 6);
}
{ const o = drawStorm; drawStorm = function () { o(); drawCantorBar(window.innerWidth); }; }

/* ---------- The chapter's clock: start it, run the sermons, send the Listeners ---------- */
const qActive = id => state.quests[id] && state.quests[id].status === 'active';
{ const o = questTick; questTick = function () {
  o();
  if (state.title || !state.qflags) return;
  if (state.qflags.chapter_two_done && !state.quests.ch3_case) startQuest('ch3_case');
  // Marta is gone: the case is under her empty bunk
  if (qActive('ch3_case') && !qf('ch3:marta') && npcGone('Marta Voss') && state.hearth && !state.dlg && Math.hypot(state.player.x - (state.hearth.x + 0.5) * TS, state.player.y - (state.hearth.y + 0.5) * TS) < 5 * TS) startDialogue('ch3_case_alone');
  // Priya is gone: the radio goes quiet on its own
  if (qActive('ch3_radio') && !qf('ch3:priya') && npcGone('Priya Nair')) { state.qflags.priya_quiet = true; questEvent('ch3:priya'); toast('Without Priya, nobody answers the broadcast. It goes on asking.', 5); }
  // none of the ten live here: walking up to the table is enough
  if (qActive('ch3_table') && state.quests.ch3_table.done.table && !qf('ch3:table') && !state.dlg && state.map === 'wastes' && !settlers.some(s => TEN.has(s.name))) {
    const p = state.player, tx = Math.floor(p.x / TS), ty = Math.floor(p.y / TS);
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const st = structs.get((ty + dy) * W + tx + dx); if (st && st.type === 'table' && !state.dlg) { tableSeats(); startDialogue('ch3_table_seats'); } }
  }
  const h = clockHour();
  // the Cantor on the radio, one sermon a night
  const sn = state.qflags.sermons || 0;
  if (state.quests.ch3_case && sn < 4 && state.map === 'wastes' && h >= 21 && !state.dlg && !state.raid && !anyMenuOpen() && state.qflags.sermon_day !== clockDay()) {
    state.qflags.sermons = sn + 1; state.qflags.sermon_day = clockDay(); startDialogue('cantor_sermon_' + (sn + 1));
  }
  // the Listeners come after dark, at least six hours after Priya talks
  if (qActive('ch3_listeners')) {
    if (state.qflags.lst_start === undefined) state.qflags.lst_start = state.gameMinutes;
    if (!qf('ch3:listeners') && !state.qflags.listener_raid && state.map === 'wastes' && state.hearth && !state.sleeping && !state.raid && !state.dlg && h >= 19 && h < 23 && state.gameMinutes - state.qflags.lst_start >= 360) {
      if (repOf('listeners') >= 2 || (state.qflags.priya_quiet && repOf('listeners') >= 1)) { const fl = state.mapFlags.tidewrack = state.mapFlags.tidewrack || {}; fl.chapelOpen = true; startDialogue('ch3_listeners_peace'); }
      else { state.qflags.listener_raid = true; state.qflags.listener_raid_pending = true; startRaid(clockDay()); }
    }
  }
}; }
Object.assign(DBG, { capacity, tableSeats, cantorFight, ch3: () => ({ q: ['ch3_case', 'ch3_radio', 'ch3_listeners', 'ch3_table'].map(id => id + ':' + (state.quests[id] ? state.quests[id].status : '-')).join(' ') }) });
