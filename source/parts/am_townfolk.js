/* =====================================================================
   AM_TOWNFOLK: everyone in the Hull has a job, a workplace, a bed, and a
   routine that follows the clock. Vendors, services and the job board.
   ===================================================================== */
const OUT = { plaza1: { x: 55, y: 63 }, plaza2: { x: 74, y: 63 }, bench: { x: 60, y: 65 }, gate1: { x: 11, y: 63 }, gate2: { x: 11, y: 65 }, dock1: { x: 62, y: 101 }, dock2: { x: 66, y: 103 }, tank: { x: 69, y: 64 } };
// id, name, job, sched, work [building, spot], home [building, bed], vendor, extra
const RN = (id, name, job, sched, work, home, vendor, x) => Object.assign({ id: 2000 + id, sid: 'n' + id, name, job, sched, work, home, vendor }, x || {});
const ROSTER = [
  RN(1, 'Mags Holloway', 'Shopkeeper', 'shop', ['general', 'counter'], ['house1', 0], 'general'), RN(2, 'Brannock Teague', 'Weaponsmith', 'shop', ['armoury', 'counter'], ['house2', 0], 'armoury'),
  RN(3, 'Dee Calloway', 'Armourer', 'shop', ['armourer', 'counter'], ['house3', 0], 'armourer'), RN(4, 'Ysolde Fenn', 'Apothecary', 'shop', ['apothecary', 'counter'], ['house4', 0], 'apothecary'),
  RN(5, 'Gus Harrow', 'Stockman', 'shop', ['stockyard', 'counter'], ['house5', 0], 'stockyard'), RN(6, 'Nell Gannet', 'Scrap dealer', 'shop', ['scrapyard', 'counter'], ['house6', 0], 'scrapyard'),
  RN(7, 'Tobias Reed', 'Barkeep', 'late', ['cantina', 'counter'], ['house7', 0], 'cantina'), RN(8, 'Birgit Odd', 'Innkeeper', 'shop', ['inn', 'counter'], ['inn', 0], null),
  RN(9, 'Doc Halvard Moss', 'Doctor', 'shop', ['clinic', 'counter'], ['clinic', 0], 'clinic'), RN(10, 'Nurse Ines Calder', 'Nurse', 'shop', ['clinic', 'ward'], ['clinic', 1], 'clinic'),
  RN(11, 'Mayor Edda Strand', 'Mayor', 'office', ['council', 'counter'], ['council', 0], null), RN(12, 'Clerk Pim Orsted', 'Clerk', 'office', ['council', 'floor'], ['council', 1], null),
  RN(13, 'Captain Josephine Rook', 'Guard captain', 'office', ['guard', 'counter'], ['guard', 0], null), RN(14, 'Guard Mel Tarn', 'Night guard', 'night', ['guard', 'floor'], ['guard', 1], null, { post: 'gate1' }),
  RN(15, 'Guard Orin Pike', 'Guard', 'office', ['guard', 'floor'], ['guard', 2], null), RN(16, 'Guard Sasha Brandt', 'Night guard', 'night', ['guard', 'floor'], ['guard', 3], null, { post: 'plaza2' }),
  RN(17, 'Quartermaster Hobb Larsen', 'Quartermaster', 'office', ['guard', 'floor'], ['guard', 4], 'guard'),
  RN(18, 'Guildmaster Ferris Kell', 'Guildmaster', 'office', ['tinkers', 'counter'], ['tinkers', 0], 'tinkers'), RN(19, 'Tinker Wick', 'Tinker', 'office', ['tinkers', 'floor'], ['tinkers', 1], null), RN(20, 'Tinker Odalys', 'Tinker', 'office', ['tinkers', 'floor'], ['tinkers', 2], null),
  RN(21, 'Warden Cass Merrow', 'Reclaimer', 'office', ['reclaimers', 'counter'], ['reclaimers', 0], 'reclaimers'), RN(22, 'Scout Tam Linden', 'Scout', 'dock', null, ['reclaimers', 1], null, { post: 'dock1' }), RN(23, 'Scout Ilsa Bram', 'Scout', 'office', ['reclaimers', 'floor'], ['reclaimers', 2], null),
  RN(24, 'Old Walt', 'Retired', 'idle', null, ['house1', 1], null, { post: 'bench' }), RN(25, 'Marisol Trent', 'Dockhand', 'dock', null, ['house2', 1], null, { post: 'dock1' }), RN(26, 'Jonah Trent', 'Dockhand', 'dock', null, ['house2', 2], null, { post: 'dock2' }),
  RN(27, 'Hester Kay', 'Seamstress', 'shop', ['armourer', 'floor'], ['house3', 1], null), RN(28, 'Lorne Pask', 'Farmhand', 'shop', ['stockyard', 'floor'], ['house5', 1], null), RN(29, 'Bettina Gull', 'Cook', 'shop', ['cantina', 'floor'], ['house7', 1], null),
  RN(30, 'Ravi Soames', 'Scrapper', 'shop', ['scrapyard', 'floor'], ['house6', 1], null), RN(31, 'Ottilie Brandt', 'Herbalist', 'shop', ['apothecary', 'floor'], ['house8', 0], null), RN(32, 'Caleb Wren', 'Dockhand', 'dock', null, ['house8', 1], null, { post: 'dock2' }),
  RN(33, 'Vera Lindqvist', 'Gossip', 'idle', null, ['house4', 1], null, { post: 'plaza1' }),
  RN(34, 'Marl', 'Drifter', 'drifter', null, ['inn', 1], null, { drifter: 0 }), RN(35, 'Kestrel', 'Drifter', 'drifter', null, ['inn', 1], null, { drifter: 1 }), RN(36, 'Dunn', 'Drifter', 'drifter', null, ['inn', 2], null, { drifter: 2 }), RN(37, 'Aya', 'Drifter', 'drifter', null, ['inn', 2], null, { drifter: 3 })
];
const NID = Object.fromEntries(ROSTER.map(n => [n.id, n]));
Object.assign(DBG, { ROSTER, OUT });

/* ---------- Schedules ---------- */
const inb = (b, spot, idx) => ({ b, spot, idx }), outp = k => ({ out: OUT[k], k });
function segs(n) {
  const home = inb(n.home[0], 'bed', n.home[1]), hometab = inb(n.home[0], 'seat', n.id), work = n.work ? inb(n.work[0], n.work[1], n.id) : null, seat = inb('cantina', 'seat', n.id);
  switch (n.sched) {
    case 'shop': return [[0, 6, home], [6, 8, hometab], [8, 18, work], [18, 21, seat], [21, 22, hometab], [22, 24, home]];
    case 'office': return [[0, 6, home], [6, 8, hometab], [8, 17, work], [17, 20, inb('cantina', 'seat', n.id + 3)], [20, 22, hometab], [22, 24, home]];
    case 'late': return [[0, 2, work], [2, 3, hometab], [3, 11, home], [11, 14, hometab], [14, 24, work]];
    case 'night': return [[0, 6, outp(n.post)], [6, 7, hometab], [7, 15, home], [15, 18, hometab], [18, 22, work], [22, 24, outp(n.post)]];
    case 'dock': return [[0, 6, home], [6, 7, hometab], [7, 17, outp(n.post)], [17, 21, seat], [21, 22, hometab], [22, 24, home]];
    case 'idle': return [[0, 6, home], [6, 8, hometab], [8, 20, outp(n.post)], [20, 22, seat], [22, 24, home]];
    case 'drifter': return [[0, 7, home], [7, 9, hometab], [9, 20, outp(['plaza1', 'plaza2', 'bench', 'tank'][n.drifter])], [20, 22, seat], [22, 24, home]];
  }
  return [[0, 24, home]];
}
function spotXY(l) {
  if (l.out) return { x: (l.out.x + 0.5) * TS, y: (l.out.y + 0.5) * TS, out: true };
  const L = layoutFor(BID[l.b]); let t;
  if (l.spot === 'bed') t = L.beds[l.idx % L.beds.length];
  else if (l.spot === 'seat') t = L.seats[(l.idx || 0) % Math.max(1, L.seats.length)] || L.posts.floor;
  else t = L.posts[l.spot] || L.posts.floor || L.posts.counter;
  t = t || { x: L.rx + 2, y: L.ry + 2 };
  const off = l.spot === 'floor' ? (((l.idx || 0) * 7) % 5 - 2) : 0;
  return { x: (t.x + 0.5 + off) * TS, y: (t.y + 0.5) * TS, b: l.b, bed: l.spot === 'bed' };
}
const sameLoc = (a, b) => (a.out && b.out && a.k === b.k) || (a.b && b.b && a.b === b.b);
function chainOf(l) { if (l.out) { const o = l.out, p = [[o.x, o.y], [o.x, YB]]; return p.map(q => [(q[0] + 0.5) * TS, (q[1] + 0.5) * TS]); } return BID[l.b].chain.map(q => [(q[0] + 0.5) * TS, (q[1] + 0.5) * TS]); }
function routePos(la, lb, f) {
  const pts = [...chainOf(la), ...chainOf(lb).reverse()], d = [0]; for (let i = 1; i < pts.length; i++) d.push(d[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const T2 = d[d.length - 1] * f; let i = 1; while (i < pts.length - 1 && d[i] < T2) i++;
  const seg = Math.max(1e-6, d[i] - d[i - 1]), u = Math.min(1, Math.max(0, (T2 - d[i - 1]) / seg));
  return { x: pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, y: pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u, dx: pts[i][0] - pts[i - 1][0] };
}
function whereAt(n, gm) {
  const h = (gm / 60) % 24, S = n._segs || (n._segs = segs(n));
  let i = S.findIndex(s => h >= s[0] && h < s[1]); if (i < 0) i = 0;
  const seg = S[i], prev = S[(i - 1 + S.length) % S.length], t = h - seg[0];
  if (t < 0.5 && !sameLoc(prev[2], seg[2])) { const p = routePos(prev[2], seg[2], t / 0.5); return { map: 'hull', x: p.x, y: p.y, walking: true, dx: p.dx }; }
  const s = spotXY(seg[2]);
  return { map: s.out ? 'hull' : 'hull_' + s.b, x: s.x, y: s.y, sleeping: !!s.bed, walking: false };
}
Object.assign(DBG, { whereAt, segs, spotXY });

/* ---------- Dialogue, written per person ---------- */
const CHAT = {
  shop: ['Business is steady. People always need things they cannot make and cannot steal.', 'Do not haggle before noon. I have not had my tea.', 'If it is broken, I sell the parts. If it is not, I sell the whole.'],
  smith: ['A good blade is just a bad idea that somebody took seriously.', 'Bring me skulls and I will make you something people cross the road to avoid.', 'Everything I sell works. That is more than the road can say.'],
  med: ['Boil everything. Then boil it again.', 'Bring me healroot and I will keep you alive. Bring me excuses and I will charge you.', 'The marsh makes the best herbs and the worst water.'],
  farm: ['The cows have two heads and one opinion. Feed them on time.', 'Roach hens are the best layers on the coast. Just do not look them in the eye.', 'Everything is easier once it eats regularly.'],
  scrap: ['One person\u2019s rubble is my mortgage.', 'Scrap, plate, ore. I buy it all and I never ask where it was.', 'Do not bring me anything that is still ticking.'],
  bar: ['Water is free. Everything else has a price.', 'You hear things in here. I try not to hear them back.', 'The fish stew is fine. Do not ask what kind.'],
  inn: ['A bunk is fifteen caps. Boots stay on the floor.', 'Everyone is welcome. Not everyone is welcome back.', 'I have not lost a guest in nine years. A few have left in a hurry.'],
  doc: ['Hold still. This will hurt, and then it will hurt less.', 'I have treated raiders, Listeners and a man who swore he was a lighthouse.', 'Radiation does not care how brave you are.'],
  mayor: ['The Hull has stood eleven winters. It will stand a twelfth if people keep paying their way.', 'A town is just a lot of people agreeing not to kill each other. It is fragile.', 'I need people who finish what they start. The job board is full of work for them.'],
  clerk: ['The job board is in the plaza. Everyone reads it. Few finish it.', 'We keep records. Paper is the one thing the war did not use up.', 'Do the jobs, bring back proof, and the Hull will remember.'],
  guard: ['Keep your weapon down in the street and we will get along.', 'The gate stays shut at night. Do not ask nicely.', 'Raiders test the wall every few weeks. It holds. So far.'],
  guild: ['Everything here was something else first.', 'Bring us a blueprint worth reading and we will make it.', 'The guild takes members who can fix things. Or who can break them usefully.'],
  scout: ['Every ruin has a door. Half of them are not doors.', 'The coast changes. The tide takes things and gives different things back.', 'If you find a lighthouse, do not open it at night.'],
  dock: ['The ship will never sail again. We have all made our peace with that.', 'Tide is in, tide is out. The work stays the same.', 'Mind the planks. The third one is a liar.'],
  res: ['Quiet street, mostly. That is how we like it.', 'It is not much, but it has a roof and a lock.', 'Folk come and go. The Hull stays.'],
  drift: ['I will carry things, dig things, and keep my mouth shut. Mostly.', 'The road ran out on me. I am looking for something that does not.', 'I can work. I just need a bed that is not a doorway.']
};
const CHATKEY = { Shopkeeper: 'shop', Weaponsmith: 'smith', Armourer: 'smith', Apothecary: 'med', Stockman: 'farm', 'Scrap dealer': 'scrap', Barkeep: 'bar', Innkeeper: 'inn', Doctor: 'doc', Nurse: 'doc', Mayor: 'mayor', Clerk: 'clerk', 'Guard captain': 'guard', Guard: 'guard', 'Night guard': 'guard', Quartermaster: 'guard', Guildmaster: 'guild', Tinker: 'guild', Reclaimer: 'guild', Scout: 'scout', Dockhand: 'dock', Retired: 'res', Seamstress: 'res', Farmhand: 'farm', Cook: 'bar', Scrapper: 'scrap', Herbalist: 'med', Gossip: 'res', Drifter: 'drift' };
const GREET = ['Afternoon. What do you need?', 'Yes?', 'Keep it short, there is a queue. Well. There will be.', 'Go on.', 'You look like you need something.'];
function scriptText(n) {
  const k = CHATKEY[n.job] || 'res', lines = CHAT[k], sp = n.name.replace(/[^A-Za-z' ]/g, '').slice(0, 22), id = 'town_' + n.sid;
  let t = '=== ' + id + '\n' + sp + ': ' + GREET[n.id % GREET.length] + '\n';
  if (n.vendor) t += '* "Let me see what you have." => ' + id + '_trade\n';
  if (n.job === 'Doctor') t += '* "Patch me up (25 caps)." => doc_heal | if item:Caps>=25\n* "Clear the radiation (35 caps)." => doc_rad | if item:Caps>=35\n';
  if (n.job === 'Innkeeper') t += '* "A bunk for the night (15 caps)." => inn_bunk | if item:Caps>=15\n';
  if (n.job === 'Barkeep') t += '* "What have you heard? (10 caps)" => bar_rumour | if item:Caps>=10\n';
  if (n.job === 'Mayor') t += '* "How do I stand with the Hull?" => mayor_rep\n* "What does the Hull need?" => mayor_need\n';
  if (n.job === 'Clerk') t += '* "How does the job board work?" => clerk_board\n';
  if (n.job === 'Reclaimer') t += '* "Any rumours worth walking to? (20 caps)" => bar_rumour2 | if item:Caps>=20\n';
  if (n.job === 'Guard captain') t += '* "Anything I should know about the wall?" => guard_wall\n';
  if (n.drifter !== undefined) t += '* "Work for me. A bed and a share (40 caps)." => ' + id + '_hire | if item:Caps>=40\n';
  t += '* "How is life here?" => ' + id + '_chat\n* "Heard anything?" => ' + id + '_rumour\n* "Never mind." => ' + id + '_bye\n\n';
  t += '=== ' + id + '_chat\n' + sp + ': ' + lines[(n.id) % lines.length] + '\n> ' + id + '\n\n';
  t += '=== ' + id + '_rumour\n@ rumour\n' + sp + ': ' + lines[(n.id + 1) % lines.length] + '\n~ They look over your shoulder, then at your hands, and lower their voice. Something to go and see, they say. You mark it on your map.\n\n';
  t += '=== ' + id + '_bye\n' + sp + ': ' + lines[(n.id + 2) % lines.length] + '\n\n';
  t += '=== ' + id + '_trade\n@ trade\n' + sp + ': Have a look.\n\n';
  if (n.drifter !== undefined) t += '=== ' + id + '_hire\n@ hire\n' + sp + ': Done. Point me at the work.\n';
  return t;
}
const SHARED = `
=== doc_heal
@ take:Caps x25; heal:999; log:Doc Moss patched you up
Doc Halvard Moss: Hold still. ...There. Try not to get shot in the same place.

=== doc_rad
@ take:Caps x35; curerad; log:Doc Moss cleared the radiation from your blood
Doc Halvard Moss: Chelation. It is unpleasant and it works. Drink water for a day.

=== inn_bunk
@ take:Caps x15; innsleep
Birgit Odd: Room four, end of the corridor. Boots on the floor. Breakfast is a rumour.

=== bar_rumour
@ take:Caps x10; rumour
Tobias Reed: A man in here swore he saw something on the map that was not on the map. Might be worth a look.

=== bar_rumour2
@ take:Caps x20; rumour
Warden Cass Merrow: Fresh from a scout's notebook. I would not go alone.

=== mayor_rep
Mayor Edda Strand: ...
* "Well?" => mayor_rep_a | if rep.hull<=0
* "Well?" => mayor_rep_b | if rep.hull>=1 & rep.hull<=3
* "Well?" => mayor_rep_c | if rep.hull>=4

=== mayor_rep_a
Mayor Edda Strand: You are a stranger. Nothing wrong with that. Strangers get fair prices and no favours.

=== mayor_rep_b
Mayor Edda Strand: People know your name. A few of them know your face. That is a start. The shops give you slightly better prices now.

=== mayor_rep_c
Mayor Edda Strand: The Hull trusts you. That is not a thing I say lightly. Shopkeepers keep their best stock for you now, and prices have come down.

=== mayor_need
Mayor Edda Strand: Water, food, medicine, and people who do not run when something comes over the wall. Check the board in the plaza. I read every notice.

=== clerk_board
Pim Orsted: Take a notice off the board and the job is yours. Come back with the goods or the proof, and hand it in at the same board. Each job done makes the town think a little better of you.

=== guard_wall
Captain Josephine Rook: The wall is fine. The gate is fine. What worries me is what we have not yet been asked to deal with.
`;
parseScripts(SHARED); for (const n of ROSTER) parseScripts(scriptText(n));

/* ---------- Vendors ---------- */
const WP = ['Rusty Pipe', 'Rebar Club', 'Zip Gun', 'Spear', 'Crowbar', 'Machete', 'Pipe Pistol', 'Nail Board', 'Revolver', 'Cattle Prod', 'Fire Axe', 'Scatter Pipe', 'Pump Shotgun', 'Road Rifle', 'Crossbow'], WPH = ['Combat Cleaver', 'Hunting Rifle', 'Ripsaw', 'Harpoon Gun', 'Skull Mace', 'Raider Blade'];
const SETS = { raider: ['Raider Helmet', 'Raider Vest', 'Raider Leggings', 'Raider Boots'], patch: ['Patchwork Cap', 'Patchwork Jacket', 'Patchwork Trousers', 'Patchwork Shoes'], scav: ['Welder Mask', 'Tyre Harness', 'Hose Greaves', 'Work Boots'], metal: ['Metal Helmet', 'Metal Armour', 'Metal Leg Guards', 'Metal Boots'], riot: ['Riot Helmet', 'Riot Vest', 'Riot Greaves', 'Riot Boots'], bone: ['Skull Helm', 'Bone Harness', 'Spiked Leggings', 'Bone Boots'], cap: ['Hockey Helm', 'Plate Duster', 'Chain Greaves', 'Steel Toe Boots'], combat: ['Combat Helmet', 'Combat Armour', 'Combat Leg Guards', 'Combat Boots'], haz: ['Hazmat Hood', 'Hazmat Suit', 'Hazmat Pants', 'Rubber Boots'] };
const MATS = new Set(['Wood', 'Scrap', 'Stone', 'Cloth', 'Iron ore', 'Metal plate', 'Steel Ingot']);
const isFood = n => !!(ITEM_USE[n] && (ITEM_USE[n].food || ITEM_USE[n].water)), isFarm = n => FARM_PRODUCE.has(n) || ['Milk', 'Roach Egg', 'Raw Meat', 'Hide', 'Cheese'].includes(n) || !!CROPS[n];
const VENDORS = {
  general: { buys: n => MATS.has(n), list: (rs, rep) => [['Wood', 30], ['Scrap', 30], ['Stone', 24], ['Cloth', 16], ['Empty Bottle', 8], ['Canned food', 6], ['Bandage', 6], ['Pistol rounds', 20], ['Rusty Hatchet', 1], ['Rusty Pick', 1], ['Hoe', 1], ['Watering Can', 1], ['Fishing Rod', 1], ['Large Watering Can', 1]] },
  armoury: { buys: n => !!WEAPONS[n], list: (rs, rep) => [...pickN(rs, WP, 9).map(n => [n, 1]), ...(rep >= 3 ? pickN(rs, WPH, 3).map(n => [n, 1]) : []), ['Pistol rounds', 30], ['Shells', 20], ['Bolts', 20]] },
  armourer: { buys: n => !!ARMOUR[n], list: (rs, rep) => { const sets = ['raider', 'patch', 'scav', 'metal', 'riot'].concat(rep >= 2 ? ['bone', 'haz'] : [], rep >= 4 ? ['cap', 'combat'] : []); const out = []; for (const s of pickN(rs, sets, 3)) for (const p of SETS[s]) out.push([p, 1]); return out.concat([['Skull Necklace', 1], ['Geiger Band', 1], ['Lead Pendant', 1], ['Runner Wraps', 1], ['Raider Totem', 1]].filter(() => rs() < 0.5)); } },
  apothecary: { buys: n => ['Healroot', 'Glowmelon', 'Bandage', 'Medkit', 'Rad-Away', 'Rad tabs', 'Beast Tonic', 'Healroot Tonic', 'Melon Juice'].includes(n), list: () => [['Bandage', 12], ['Medkit', 4], ['Rad-Away', 6], ['Rad tabs', 10], ['Beast Tonic', 4], ['Healroot Tonic', 3], ['Melon Juice', 3], ['Purified Water', 8], ['Empty Bottle', 10], ['Healroot Seeds', 3]] },
  clinic: { buys: n => ['Bandage', 'Medkit', 'Rad-Away', 'Healroot', 'Healroot Tonic'].includes(n), list: () => [['Bandage', 10], ['Medkit', 3], ['Rad-Away', 5], ['Beast Tonic', 2], ['Healroot Tonic', 2]] },
  stockyard: { buys: n => isFarm(n), list: (rs, rep) => [['Radish Seeds', 10], ['Potato Seeds', 10], ['Tomato Seeds', 8], ['Corn Seeds', 6], ['Bean Seeds', 6], ['Pumpkin Seeds', 4], ['Glowmelon Seeds', 3], ['Healroot Seeds', 2], ['Animal Feed', 20], ['Twohead Calf', 2], ['Roach Hatchling', 4], ['Sapling', 5]] },
  scrapyard: { buys: n => MATS.has(n) || ['Hide'].includes(n), list: (rs, rep) => [['Scrap', 60], ['Metal plate', 10], ['Iron ore', 10], ['Stone', 20]].concat(rep >= 3 ? [['Steel Ingot', 2]] : []) },
  cantina: { buys: n => isFood(n), list: (rs) => [...pickN(rs, ['Roast Meat', 'Cooked Fish', 'Veg Stew', 'Fish Stew', 'Tomato Soup', 'Corn Chowder', 'Pumpkin Stew', 'Cheese', 'Roach Omelette', 'Baked Potato', 'Bean Mash'], 7).map(n => [n, 3]), ['Purified Water', 10], ['Milk', 4]] },
  tinkers: { buys: n => !!TOOL_ITEMS[n] || MATS.has(n), list: (rs, rep) => [...Object.keys(BP_ITEMS).filter(k => !state.unlocked.has(BP_ITEMS[k])).map(n => [n, 1]), ['Miners Pick', 1], ['Woodcutter Axe', 1], ['Pressure Can', 1], ['Metal plate', 6], ['Kit: Weapon Bench', 1], ['Kit: Armour Bench', 1]] },
  reclaimers: { buys: n => !!ARMOUR[n] || n === 'Human Skull' || n === 'Iron ore', list: () => [['Rad-Away', 5], ['Gas Mask', 1], ['Geiger Band', 1], ['Hazmat Suit', 1], ['Canned food', 8], ['Empty Bottle', 8], ['Medkit', 2]] },
  guard: { buys: n => !!WEAPONS[n] || n === 'Human Skull', list: (rs, rep) => [...SETS.riot.map(n => [n, 1]), ['Pistol rounds', 40], ['Shells', 30], ['Bolts', 30], ['Medkit', 3]].concat(rep >= 3 ? SETS.combat.map(n => [n, 1]) : []) }
};
function mulb(seed) { return mulberry32(seed >>> 0); }
function pickN(rs, arr, n) { const a = arr.slice(), out = []; while (out.length < n && a.length) out.push(a.splice(Math.floor(rs() * a.length), 1)[0]); return out; }
function stockFor(n) {
  const fl = state.mapFlags.hull = state.mapFlags.hull || {}; fl.stock = fl.stock || {};
  const day = clockDay(), rep = state.rep.hull || 0, cur = fl.stock[n.sid];
  if (cur && cur.day === day) return cur.items;
  const rs = mulb(day * 977 + n.id * 31), V = VENDORS[n.vendor], mult = 1.6 * (1 - 0.02 * Math.max(-5, Math.min(10, rep)));
  const items = []; for (const [name, q] of V.list(rs, rep)) { if (items.some(s => s.name === name)) continue; const bp = BP_ITEMS[name] ? 2.2 : 1; items.push({ name, qty: q > 1 ? Math.max(1, Math.round(q * (0.6 + rs() * 0.8))) : 1, price: Math.max(2, Math.ceil(itemValue(name) * mult * bp)) }); }
  fl.stock[n.sid] = { day, items }; return items;
}
{ const o = sellValue; sellValue = function (name) { const t = state.trade; let v = o(name); if (t && t.town) { if (t.buys && t.buys(name)) v = Math.round(v * 1.4); v = Math.round(v * (1 + 0.02 * Math.max(-5, Math.min(10, state.rep.hull || 0)))); } return Math.max(1, v); }; }

/* ---------- The people themselves ---------- */
const ENT = new Map(); let ready_t = 0;
function gone() { const fl = state.mapFlags.hull = state.mapFlags.hull || {}; return fl.gone = fl.gone || {}; }
function present(n) { if (gone()[n.sid]) return false; if (n.drifter !== undefined) return Math.floor(clockDay() / 3) % 4 === n.drifter; return true; }
function entityFor(n) {
  let e = ENT.get(n.id);
  if (!e) { e = { id: n.id, tid: n.sid, kind: 'survivor', town: true, def: n, name: n.name, job: n.job, bio: n.job, skills: { farm: 1 + (n.id % 2), guard: 1 + (n.id % 3), haul: 1 }, look: npcLook(n.id), x: 0, y: 0, home: { x: 0, y: 0 }, wander: 0, wx: 0, wy: 0, dirx: 1, walkT: 0, scared: false }; ENT.set(n.id, e); }
  return e;
}
function updateTown(dt) {
  if (state.title) return;
  if (state.elapsed - ready_t > 1) { ready_t = state.elapsed; for (const m of MISSIONS) { const q = state.quests[m.id]; if (q && q.status === 'active') { if (m.check()) state.qflags['bm_' + m.id + '_ready'] = true; else delete state.qflags['bm_' + m.id + '_ready']; } } }
  if (!String(state.map).startsWith('hull')) return;
  const gm = state.gameMinutes;
  for (const n of ROSTER) {
    const e = ENT.get(n.id), on = present(n) ? whereAt(n, gm) : null, here = on && on.map === state.map;
    if (!here) { if (e) { const i = survivors.indexOf(e); if (i >= 0) survivors.splice(i, 1); } continue; }
    const ent = entityFor(n); if (!survivors.includes(ent)) survivors.push(ent);
    const ox = ent.x;
    ent.x = on.x; ent.y = on.y; ent.home.x = on.x; ent.home.y = on.y; ent.wx = on.x; ent.wy = on.y; ent.sleeping = !!on.sleeping;
    if (on.walking) { ent.dirx = on.dx >= 0 ? 1 : -1; ent.walkT += dt; } else ent.walkT = 0;
  }
}
{ const o = updateStorm; updateStorm = function (dt) { o(dt); updateTown(dt); }; }
{ const o = drawNpc; drawNpc = function (n) {
  if (!n.town) return o(n);
  const frame = Math.floor(n.walkT * 6) % 2, bottom = n.y + 7;
  if (n.sleeping) {
    ctx.fillStyle = '#e8e0d0'; ctx.fillRect(Math.round(n.x) - 5, Math.round(n.y) - 3, 6, 6); ctx.fillStyle = n.look.skin; ctx.fillRect(Math.round(n.x) - 4, Math.round(n.y) - 4, 4, 4); ctx.fillStyle = n.look.hair; ctx.fillRect(Math.round(n.x) - 4, Math.round(n.y) - 5, 4, 2);
    ctx.fillStyle = n.look.body; ctx.fillRect(Math.round(n.x), Math.round(n.y) - 3, 8, 6); ctx.fillStyle = '#c0392b'; ctx.fillRect(Math.round(n.x) + 1, Math.round(n.y) - 3, 6, 2);
    ctx.font = '8px ' + MONO; ctx.textAlign = 'center'; ctx.fillStyle = '#cfe8ff'; ctx.fillText('Zz', Math.round(n.x), Math.round(n.y - 10 + Math.sin(state.elapsed * 2) * 1.5)); return;
  }
  shadowAt(n.x, bottom - 1, 14); drawFlipped(npcSprite(n, frame), n.x, bottom, n.dirx < 0);
  const v = n.def && n.def.vendor, mark = v ? '$' : n.job === 'Doctor' || n.job === 'Nurse' ? '+' : n.job === 'Innkeeper' ? 'z' : n.job === 'Drifter' ? '...' : null;
  if (mark) { ctx.fillStyle = mark === '+' ? '#ff6a6a' : '#ffd36b'; ctx.font = '12px ' + MONO; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(mark, Math.round(n.x), Math.round(bottom - 35 + Math.sin(state.elapsed * 4))); }
  if (Math.hypot(state.mwx - n.x, state.mwy - (n.y - 6)) < 14) { ctx.font = '8px ' + MONO; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; const t = n.name + ', ' + n.job.toLowerCase(); ctx.fillStyle = '#000'; ctx.fillText(t, Math.round(n.x) + 0.5, Math.round(bottom - 38) + 0.5); ctx.fillStyle = '#ffe9b0'; ctx.fillText(t, Math.round(n.x), Math.round(bottom - 38)); }
}; }
{ const o = openTalk; openTalk = function (npc) {
  if (npc.town) {
    if (npc.sleeping) { toast(npc.name + ' is asleep. Come back in the morning.', 2.5); return; }
    const n = npc.def; if (n.vendor) { npc.stock = stockFor(n); npc.buys = VENDORS[n.vendor].buys; }
    closePanels(); startDialogue('town_' + n.sid, npc); return;
  }
  o(npc);
}; }
{ const o = applyEffect; applyEffect = function (e, c) {
  if (e === 'trade' && c.npc) { const npc = c.npc; c.ended = true; setTimeout(() => { state.dlg = null; openTrade(npc); }, 60); }
  else if (e === 'curerad') { state.player.radiation = 0; toast('Your blood runs clean.', 3); }
  else if (e === 'innsleep') { const gm = state.gameMinutes, hr = (gm / 60) % 24, day0 = Math.floor(gm / 1440); state.gameMinutes = (day0 + (hr >= 6.5 ? 1 : 0)) * 1440 + 6.5 * 60; const p = state.player; p.health = maxHealth(); p.energy = 100; toast('You wake in a real bed. It is a very odd feeling.', 4); }
  else if (e === 'hire' && c.npc) { if (countItem('Caps') < 40) { toast('You cannot afford that.', 2); } else if (recruit(c.npc)) { takeItems({ Caps: 40 }); gone()[c.npc.tid] = true; c.remove = true; state.qflags.hired_drifter = true; } }
  else o(e, c);
}; }
{ const o = useInteract; useInteract = function (it, i) {
  if (it.kind === 'board') { startDialogue('board_hub'); return; }
  if (it.kind === 'innbed') { startDialogue('inn_bunk'); return; }
  o(it, i);
}; }
Object.assign(DBG, { stockFor, VENDORS, updateTown, ENT, present, openTalk, useInteract, applyEffect, sellValue, scriptText });

/* ---------- The job board ---------- */
const MISSIONS = [
  { id: 'bm_rats', title: 'Rats in the Hold', blurb: 'Clear eight glowrats out of the cargo hold.', goal: 'Kill eight glowrats', check: () => since('bm_rats', 'k:glowrat') >= 8, reward: { xp: 80, items: [{ name: 'Caps', qty: 60 }, { name: 'Bandage', qty: 3 }] } },
  { id: 'bm_water', title: 'Water Run', blurb: 'The tank is low. Eight bottles of purified water.', goal: 'Bring eight Purified Water', check: () => countItem('Purified Water') >= 8, take: { 'Purified Water': 8 }, reward: { xp: 70, items: [{ name: 'Caps', qty: 70 }] } },
  { id: 'bm_brute', title: 'A Brute at the Wall', blurb: 'Something large keeps testing the wall. Put it down.', goal: 'Kill a brute', check: () => since('bm_brute', 'k:brute') >= 1, reward: { xp: 110, items: [{ name: 'Caps', qty: 90 }, { name: 'Metal plate', qty: 4 }] } },
  { id: 'bm_dairy', title: 'Milk and Eggs', blurb: 'The cantina wants four milk and three roach eggs.', goal: 'Bring four Milk and three Roach Eggs', check: () => countItem('Milk') >= 4 && countItem('Roach Egg') >= 3, take: { 'Milk': 4, 'Roach Egg': 3 }, reward: { xp: 90, items: [{ name: 'Caps', qty: 110 }, { name: 'Beast Tonic', qty: 2 }] } },
  { id: 'bm_bones', title: 'Bones for the Gate', blurb: 'The wall needs three skulls on pikes. People notice that.', goal: 'Bring three Human Skulls', check: () => countItem('Human Skull') >= 3, take: { 'Human Skull': 3 }, reward: { xp: 70, items: [{ name: 'Caps', qty: 50 }, { name: 'Skull Necklace', qty: 1 }] } },
  { id: 'bm_scout', title: 'Scout the Deepcut', blurb: 'We lost a survey crew in the Deepcut mine. Go and look.', goal: 'Enter Deepcut', check: () => !!state.qflags['entered:deepcut'], reward: { xp: 130, items: [{ name: 'Caps', qty: 100 }, { name: 'Metal plate', qty: 6 }] } }
];
function boardScript() {
  let t = '=== board_hub\n~ A sheet of corrugated iron with a lot of nails in it. Most of the notices are about people who owe somebody something. A few of them are about work.\n';
  for (const m of MISSIONS) t += '* "' + m.title + ': ' + m.blurb + '" => ' + m.id + '_accept | if !flag:' + m.id + '_taken\n* "Hand in: ' + m.title + '" => ' + m.id + '_done | if flag:' + m.id + '_taken & !flag:' + m.id + '_done & flag:bm_' + m.id + '_ready\n';
  t += '* "Leave it." => board_leave\n\n=== board_leave\n~ You leave the notices where they are. They will still be there.\n\n';
  for (const m of MISSIONS) {
    t += '=== ' + m.id + '_accept\n@ flag:' + m.id + '_taken; quest:start ' + m.id + '; log:You took the notice: ' + m.title + '\n~ You pull the notice off its nail and fold it into your pocket. ' + m.blurb + '\n> board_hub\n\n';
    const takes = m.take ? Object.entries(m.take).map(([k, v]) => 'take:' + k + ' x' + v + '; ').join('') : '';
    t += '=== ' + m.id + '_done\n@ ' + takes + 'event:board:' + m.id + '; flag:' + m.id + '_done; rep.hull+1; log:You finished the job: ' + m.title + '\n~ You pin the proof to the board. A clerk you have never seen takes it down, nods, and counts out your pay.\n> board_hub\n\n';
  }
  return t;
}
parseScripts(boardScript());
for (const m of MISSIONS) QUEST_DEFS.push({ id: m.id, title: m.title, giver: 'The job board', desc: m.blurb, steps: [{ id: 'do', text: m.goal, check: m.check }, { id: 'report', text: 'Hand it in at the job board in the plaza', event: 'board:' + m.id }], reward: m.reward, next: [] });
{ const o = startQuest; startQuest = function (id) { o(id); if (String(id).startsWith('bm_') && state.quests[id]) state.quests[id].base = Object.assign({}, state.cnt); }; }
Object.assign(DBG, { MISSIONS, startQuest });
Object.assign(VALUE, { 'Kit: Weapon Bench': 70, 'Kit: Armour Bench': 65, 'Large Watering Can': 40, 'Pressure Can': 90, 'Watering Can': 14, 'Woodcutter Axe': 38, 'Miners Pick': 38, 'Rusty Hatchet': 14, 'Rusty Pick': 14, 'Hoe': 12, 'Fishing Rod': 16 });
