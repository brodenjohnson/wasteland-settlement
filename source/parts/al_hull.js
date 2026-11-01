/* =====================================================================
   AL_HULL: the town. A beached container ship, a boulevard, an avenue, and a
   building for everyone. Every building is its own map behind a loading fade.
   ===================================================================== */
ZONE_NAMES.push('The Hull'); const HULL_ZONE = ZONE_NAMES.length - 1;
PLACE_LORE['The Hull'] = 'A container ship that ran aground in the marsh and was never refloated. People moved into the boxes. Then they built a town around it.';
THEMES.hull = { [T.CLIFF]: ['#6a3a2a', '#74422f', '#5e3325', '#7c4a36', '#4a281e'], [T.FLOOR]: ['#8a7a5a', '#92825f', '#82724f', '#9a8a68', '#6e6044'] };
THEMES.hullin = { [T.CLIFF]: ['#3a2e24', '#42352a', '#33281f', '#4a3c30', '#2a2018'], [T.FLOOR]: ['#7a5a3a', '#82623f', '#6e5034', '#8a6a46', '#5e4429'] };
const XA = 64, YB = 64, YS = 87;               // avenue column, boulevard row, second street row
const HB = [];
const addB = o => { o.cx = o.x + (o.w >> 1); HB.push(o); return o; };
// north band, doors face south onto the boulevard
addB({ id: 'general', name: "Mags' General Store", kind: 'general', band: 'A', x: 10, w: 11, col: '#7a4a32', awn: '#c0392b', icon: 'bag' });
addB({ id: 'armoury', name: 'The Armoury', kind: 'armoury', band: 'A', x: 24, w: 11, col: '#4a4e56', awn: '#8a8d94', icon: 'gun' });
addB({ id: 'armourer', name: 'Plate and Patch', kind: 'armourer', band: 'A', x: 38, w: 10, col: '#5a4a3a', awn: '#a8532a', icon: 'helm' });
addB({ id: 'apothecary', name: 'The Drip Apothecary', kind: 'apothecary', band: 'A', x: 51, w: 9, col: '#3a5a5a', awn: '#7fe8a8', icon: 'cross' });
addB({ id: 'cantina', name: 'The Rusty Anchor', kind: 'cantina', band: 'A', x: 68, w: 13, col: '#6a3a2a', awn: '#e8c24a', icon: 'mug' });
addB({ id: 'inn', name: 'The Berth Inn', kind: 'inn', band: 'A', x: 84, w: 12, col: '#4a5a6a', awn: '#5a8ac8', icon: 'bed' });
addB({ id: 'tinkers', name: "Tinkers' Guildhall", kind: 'guild', band: 'A', x: 99, w: 15, col: '#5a4a30', awn: '#d6a84a', icon: 'gear', faction: 'tinkers' });
// the superstructure, doors face south onto the avenue
addB({ id: 'council', name: 'Council Hall', kind: 'council', band: 'C', x: 56, w: 17, col: '#4a4a52', awn: '#9aa0a8', icon: 'flag' });
// south band, doors face north onto the boulevard
addB({ id: 'clinic', name: 'The Hull Clinic', kind: 'clinic', band: 'B', x: 10, w: 12, col: '#d8d8d0', awn: '#c0392b', icon: 'cross' });
addB({ id: 'stockyard', name: 'Stockyard and Seed', kind: 'stockyard', band: 'B', x: 25, w: 14, col: '#6a5a3a', awn: '#7a9a4a', icon: 'wheat' });
addB({ id: 'scrapyard', name: 'Gannet Scrap', kind: 'scrapyard', band: 'B', x: 42, w: 11, col: '#5a4a40', awn: '#a8501e', icon: 'gear' });
addB({ id: 'guard', name: 'Harbour Guard HQ', kind: 'hq', band: 'B', x: 68, w: 15, col: '#3a4a6a', awn: '#5a7ac8', icon: 'shield', faction: 'guard' });
addB({ id: 'reclaimers', name: "Reclaimers' Lodge", kind: 'guild', band: 'B', x: 86, w: 13, col: '#4a5a3a', awn: '#9aba5a', icon: 'compass', faction: 'reclaimers' });
addB({ id: 'archive', name: 'The Archive', kind: 'closed', band: 'B', x: 102, w: 8, col: '#4a4a4a', awn: '#6a6a6a', icon: 'book', closed: 'The Archive is shuttered. Someone has painted a note on the door: "Back when the lights are on."' });
addB({ id: 'pit', name: 'The Pit', kind: 'closed', band: 'B', x: 112, w: 8, col: '#5a2a2a', awn: '#8a2a2a', icon: 'fist', closed: 'The fighting pit is closed for repairs. Someone has been bleeding on the door.' });
// cargo homes, doors face north onto the second street
const HOMES = [[10, 'house1', 'Cargo Home 1'], [22, 'house2', 'Cargo Home 2'], [34, 'house3', 'Cargo Home 3'], [46, 'house4', 'Cargo Home 4'], [70, 'house5', 'Cargo Home 5'], [82, 'house6', 'Cargo Home 6'], [94, 'house7', 'Cargo Home 7'], [106, 'house8', 'Cargo Home 8']];
const HOMECOL = ['#7a4a32', '#4a6a5a', '#6a4a6a', '#5a6a8a', '#8a6a3a', '#5a5a6a', '#6a3a3a', '#3a5a6a'];
HOMES.forEach(([x, id, name], k) => addB({ id, name, kind: 'house', band: 'H', x, w: 9, col: HOMECOL[k], awn: '#3a2e24', icon: 'door' }));
const BAND = { A: { y: 47, h: 12 }, C: { y: 28, h: 11 }, B: { y: 70, h: 12 }, H: { y: 90, h: 9 } };
for (const b of HB) {
  const bd = BAND[b.band]; b.y = bd.y; b.h = bd.h;
  const south = b.band === 'A' || b.band === 'C';
  b.door = { x: b.cx, y: south ? b.y + b.h - 1 : b.y }; b.out = { x: b.cx, y: south ? b.y + b.h : b.y - 1 };
  b.chain = b.band === 'H' ? [[b.cx, b.out.y], [b.cx, YS], [XA, YS], [XA, YB]] : b.band === 'C' ? [[XA, b.out.y], [XA, YB]] : [[b.cx, b.out.y], [b.cx, YB]];
}
const BID = Object.fromEntries(HB.map(b => [b.id, b]));
Object.assign(DBG, { HB, BID });

/* ---------- Interiors: pure layout, so people can be placed before a map exists ---------- */
function layoutFor(b) {
  if (b._lay) return b._lay;
  const k = b.kind, L = { posts: {}, beds: [], seats: [], decor: [], blocks: [], rooms: [], lights: [], carpets: [], clinicBeds: [] };
  const size = { general: [22, 14], armoury: [22, 14], armourer: [22, 14], apothecary: [20, 14], stockyard: [24, 14], scrapyard: [22, 14], cantina: [28, 16], inn: [36, 18], clinic: [26, 14], guild: [40, 20], hq: [42, 20], council: [40, 20], house: [14, 10] }[k] || [20, 12];
  const rw = size[0], rh = size[1], rx = 60 - (rw >> 1), ry = 56 - (rh >> 1);
  L.rw = rw; L.rh = rh; L.rx = rx; L.ry = ry; L.exit = { x: rx + (rw >> 1), y: ry + rh }; L.entry = { x: rx + (rw >> 1), y: ry + rh - 2 };
  const shelfRow = (y, n, step) => { for (let j = 0; j < n; j++) L.decor.push({ kind: 'shelf', x: (rx + 3 + j * step) * TS + 8, y: y * TS + 14 }); };
  if (['general', 'armoury', 'armourer', 'apothecary', 'stockyard', 'scrapyard'].includes(k)) {
    shelfRow(ry + 1, Math.floor((rw - 4) / 3), 3);
    for (let x = rx + 5; x < rx + rw - 5; x++) L.blocks.push([x, ry + 5]);
    L.counter = { x0: rx + 5, x1: rx + rw - 6, y: ry + 5 };
    L.posts.counter = { x: rx + (rw >> 1), y: ry + 3 }; L.posts.floor = { x: rx + (rw >> 1) + 3, y: ry + 8 };
    L.decor.push({ kind: 'barrel', x: (rx + 2) * TS + 8, y: (ry + rh - 3) * TS + 12 }, { kind: 'sack', x: (rx + rw - 3) * TS + 8, y: (ry + rh - 3) * TS + 12 }, { kind: 'table', x: (rx + 2) * TS + 8, y: (ry + 8) * TS + 12 });
    L.seats.push({ x: rx + 3, y: ry + 10 });
  } else if (k === 'cantina') {
    for (let x = rx + 4; x < rx + 19; x++) L.blocks.push([x, ry + 4]);
    L.counter = { x0: rx + 4, x1: rx + 18, y: ry + 4 };
    L.posts.counter = { x: rx + 11, y: ry + 2 }; L.posts.floor = { x: rx + 11, y: ry + 6 };
    shelfRow(ry + 1, 5, 3);
    [[6, 9], [13, 9], [20, 9], [9, 13], [17, 13], [24, 13]].forEach(([dx, dy]) => { L.decor.push({ kind: 'table', x: (rx + dx) * TS + 8, y: (ry + dy) * TS + 12 }); L.seats.push({ x: rx + dx - 1, y: ry + dy }, { x: rx + dx + 1, y: ry + dy }); });
    L.lights.push({ x: rx + 22, y: ry + 3 });
  } else if (k === 'inn') {
    for (let x = rx + 3; x < rx + 12; x++) L.blocks.push([x, ry + 5]);
    L.counter = { x0: rx + 3, x1: rx + 11, y: ry + 5 }; L.posts.counter = { x: rx + 7, y: ry + 3 }; L.posts.floor = { x: rx + 7, y: ry + 8 };
    for (let r = 0; r < 4; r++) { const x0 = rx + 15 + r * 5; L.rooms.push({ x: x0, y: ry + 1, w: 5, h: 7, door: { x: x0 + 2, y: ry + 8 } }); L.beds.push({ x: x0 + 1, y: ry + 2, room: r }); L.carpets.push([x0, ry + 1, 5, 7]); }
    L.guestBed = L.beds[3]; L.decor.push({ kind: 'table', x: (rx + 6) * TS + 8, y: (ry + 12) * TS + 12 }, { kind: 'table', x: (rx + 10) * TS + 8, y: (ry + 14) * TS + 12 });
    L.seats.push({ x: rx + 5, y: ry + 12 }, { x: rx + 7, y: ry + 12 }, { x: rx + 9, y: ry + 14 }, { x: rx + 11, y: ry + 14 });
  } else if (k === 'clinic') {
    for (let x = rx + 3; x < rx + 12; x++) L.blocks.push([x, ry + 4]);
    L.counter = { x0: rx + 3, x1: rx + 11, y: ry + 4 }; L.posts.counter = { x: rx + 7, y: ry + 2 }; L.posts.floor = { x: rx + 7, y: ry + 7 }; L.posts.ward = { x: rx + 18, y: ry + 6 };
    for (let j = 0; j < 4; j++) L.clinicBeds.push({ x: rx + 14 + j * 3, y: ry + 3 });
    L.rooms.push({ x: rx + 3, y: ry + 8, w: 8, h: 5, door: { x: rx + 6, y: ry + 8 } }); L.beds.push({ x: rx + 4, y: ry + 10, room: 0 }, { x: rx + 9, y: ry + 10, room: 0 }); L.carpets.push([rx + 3, ry + 8, 8, 5]);
    L.seats.push({ x: rx + 16, y: ry + 10 });
  } else if (k === 'guild' || k === 'hq' || k === 'council') {
    for (let x = rx + 6; x < rx + 16; x++) L.blocks.push([x, ry + 4]);
    L.counter = { x0: rx + 6, x1: rx + 15, y: ry + 4 }; L.posts.counter = { x: rx + 10, y: ry + 2 }; L.posts.floor = { x: rx + 12, y: ry + 8 };
    shelfRow(ry + 1, 4, 3); L.decor.push({ kind: 'table', x: (rx + 24) * TS + 8, y: (ry + 6) * TS + 12 }, { kind: 'table', x: (rx + 30) * TS + 8, y: (ry + 6) * TS + 12 }, { kind: 'barrel', x: (rx + rw - 3) * TS + 8, y: (ry + 3) * TS + 12 });
    L.seats.push({ x: rx + 23, y: ry + 6 }, { x: rx + 25, y: ry + 6 }, { x: rx + 29, y: ry + 6 }, { x: rx + 31, y: ry + 6 });
    const n = k === 'hq' ? 6 : k === 'council' ? 4 : 5, rwid = Math.floor((rw - 2) / n);
    for (let r = 0; r < n; r++) { const x0 = rx + 1 + r * rwid; L.rooms.push({ x: x0, y: ry + 9, w: rwid, h: 8, door: { x: x0 + (rwid >> 1), y: ry + 9 } }); L.beds.push({ x: x0 + 1, y: ry + 11, room: r }); L.carpets.push([x0, ry + 9, rwid, 8]); }
  } else if (k === 'house') {
    for (let j = 0; j < 4; j++) L.beds.push({ x: rx + 2 + j * 3, y: ry + 2 });
    L.decor.push({ kind: 'table', x: (rx + 7) * TS + 8, y: (ry + 6) * TS + 12 }, { kind: 'barrel', x: (rx + 12) * TS + 8, y: (ry + 3) * TS + 12 }, { kind: 'sack', x: (rx + 12) * TS + 8, y: (ry + 7) * TS + 12 });
    L.seats.push({ x: rx + 6, y: ry + 6 }, { x: rx + 8, y: ry + 6 }); L.posts.floor = { x: rx + 7, y: ry + 7 }; L.carpets.push([rx + 4, ry + 5, 6, 3]);
  }
  L.lights.push({ x: rx + (rw >> 1), y: ry + (rh >> 1) });
  return (b._lay = L);
}
function genInterior(def) {
  const b = def.bld, L = layoutFor(b), rng = mulberry32(def.seed);
  emptyMap(def); waterDepth = new Uint8Array(W * H).fill(1);
  for (let i = 0; i < W * H; i++) shade_[i] = Math.floor(rng() * 4);
  for (let y = L.ry; y < L.ry + L.rh; y++) for (let x = L.rx; x < L.rx + L.rw; x++) tiles[y * W + x] = T.FLOOR;
  tiles[L.exit.y * W + L.exit.x] = T.FLOOR;
  for (const [x, y] of L.blocks) tiles[y * W + x] = T.CLIFF;
  for (const r of L.rooms) {
    for (let x = r.x; x < r.x + r.w; x++) { tiles[(r.y) * W + x] = T.CLIFF; tiles[(r.y + r.h - 1) * W + x] = T.CLIFF; }
    for (let y = r.y; y < r.y + r.h; y++) { tiles[y * W + r.x] = T.CLIFF; tiles[y * W + r.x + r.w - 1] = T.CLIFF; }
    tiles[r.door.y * W + r.door.x] = T.FLOOR; tiles[r.door.y * W + r.door.x + 1 - 1] = T.FLOOR;
  }
  for (const [x, y, w, h] of L.carpets) for (let yy = y + 1; yy < y + h - 1; yy++) for (let xx = x + 1; xx < x + w - 1; xx++) floors[yy * W + xx] = 5;
  if (b.kind === 'clinic') for (let y = L.ry + 1; y < L.ry + 8; y++) for (let x = L.rx + 1; x < L.rx + L.rw - 1; x++) if (!tiles[y * W + x] !== T.CLIFF) floors[y * W + x] = 3;
  if (L.counter) { decor.push({ kind: 'counter', x: ((L.counter.x0 + L.counter.x1 + 1) / 2) * TS, y: (L.counter.y + 1) * TS - 1, v: 0, ph: 0, wide: (L.counter.x1 - L.counter.x0 + 1) * TS }); }
  for (const d of L.decor) decor.push({ kind: d.kind, x: d.x, y: d.y, v: 0, ph: 0 });
  const bedKind = b.kind === 'clinic' ? 'clinic' : 'bunk';
  for (const bd of L.beds) structs.set(bd.y * W + bd.x, newStruct('bunk'));
  for (const cb of L.clinicBeds) structs.set(cb.y * W + cb.x, newStruct('clinic'));
  for (const l of L.lights) MAP_LIGHTS.push({ x: (l.x + 0.5) * TS, y: (l.y + 0.5) * TS, r: 170 });
  INTERACT.set(L.exit.y * W + L.exit.x, { kind: 'portal', up: true, label: 'Out to the street', to: 'hull', tx: b.out.x, ty: b.out.y });
  if (L.guestBed) INTERACT.set(L.guestBed.y * W + L.guestBed.x + 1, { kind: 'innbed', label: 'Guest bunk (15 caps)' });
  def.rooms_ = []; decor.sort((p, q) => p.y - q.y);
}
for (const b of HB) {
  if (b.kind === 'closed') continue;
  MAPDEFS['hull_' + b.id] = { id: 'hull_' + b.id, name: b.name, title: b.name, sub: b.kind === 'house' ? 'Somebody lives here' : '', zone: HULL_ZONE, theme: 'hullin', seed: 9000 + HB.indexOf(b), dark: 0.16, rad: 0, rooms: 0, density: 0, bld: b, gen: genInterior, mobs: [],
    entry() { return layoutFor(b).entry; }, target() { return null; } };
}

/* ---------- Sprites ---------- */
const BICON = {
  bag: c => { R(c, '#e8dcc0', 0, 2, 8, 7); R(c, '#a8803a', 1, 0, 6, 3); R(c, '#6a4a20', 2, 4, 4, 1); }, gun: c => { R(c, '#2a2a30', 0, 3, 8, 2); R(c, '#2a2a30', 1, 5, 2, 4); R(c, '#c8c8d0', 6, 3, 2, 1); },
  helm: c => { R(c, '#c8c8d0', 1, 1, 6, 5); R(c, '#14120f', 2, 4, 4, 1); R(c, '#c8c8d0', 0, 5, 8, 3); }, cross: c => { R(c, '#ffffff', 3, 0, 2, 8); R(c, '#ffffff', 0, 3, 8, 2); },
  mug: c => { R(c, '#e8e0d0', 1, 1, 5, 7); R(c, '#e8c24a', 1, 1, 5, 2); R(c, '#e8e0d0', 6, 2, 2, 4); }, bed: c => { R(c, '#e8e0d0', 0, 4, 8, 3); R(c, '#e8e0d0', 0, 1, 2, 7); R(c, '#c0392b', 2, 4, 5, 2); },
  gear: c => { R(c, '#d6a84a', 2, 2, 4, 4); R(c, '#d6a84a', 3, 0, 2, 8); R(c, '#d6a84a', 0, 3, 8, 2); R(c, '#14120f', 3, 3, 2, 2); }, flag: c => { R(c, '#e8e0d0', 1, 0, 1, 8); R(c, '#c0392b', 2, 0, 5, 4); },
  wheat: c => { R(c, '#e8c24a', 3, 0, 2, 6); R(c, '#e8c24a', 1, 1, 2, 2); R(c, '#e8c24a', 5, 1, 2, 2); R(c, '#6a8a3a', 3, 6, 2, 2); }, shield: c => { R(c, '#c8c8d0', 1, 0, 6, 5); R(c, '#c8c8d0', 2, 5, 4, 2); R(c, '#3a4a6a', 3, 1, 2, 4); },
  compass: c => { R(c, '#e8e0d0', 1, 1, 6, 6); R(c, '#14120f', 3, 3, 2, 2); R(c, '#c0392b', 4, 1, 1, 3); }, book: c => { R(c, '#8a5a3a', 1, 1, 6, 6); R(c, '#e8e0d0', 2, 2, 4, 4); R(c, '#6a4a2a', 4, 1, 1, 6); },
  fist: c => { R(c, '#c8a080', 1, 2, 6, 5); R(c, '#a88060', 1, 2, 6, 1); R(c, '#8a2a2a', 0, 7, 8, 1); }, door: c => { R(c, '#e8dcc0', 2, 1, 4, 7); R(c, '#14120f', 5, 4, 1, 1); }
};
function paintBuilding(c, b, W2, H2) {
  const top = b.band === 'B' || b.band === 'H', col = b.col, dk = shade(col, -30), lt = shade(col, 22);
  R(c, dk, 0, 0, W2, H2); R(c, col, 1, 1, W2 - 2, H2 - 2);
  for (let x = 3; x < W2 - 3; x += 4) { R(c, lt, x, 4, 1, H2 - 8); R(c, dk, x + 2, 4, 1, H2 - 8); }
  R(c, shade(col, 38), 0, 0, W2, 3); R(c, 'rgba(0,0,0,0.3)', 0, H2 - 3, W2, 3);
  for (let k = 0; k < Math.max(2, W2 >> 5); k++) R(c, 'rgba(120,50,20,0.35)', 6 + k * 28, 6, 3, 14 + (k * 7) % 12);
  const dy = top ? 0 : H2 - 26, dx = (W2 >> 1) - 10, wy = top ? 28 : 14;
  R(c, '#14120f', dx, dy + (top ? 0 : 0), 20, 26); R(c, b.closed ? '#3a2a1a' : '#7a5a30', dx + 2, dy + (top ? 0 : 2), 16, 24); R(c, '#2a2018', dx + 9, dy + (top ? 0 : 2), 2, 24); R(c, '#c8a040', dx + 14, dy + 13, 2, 2);
  const awY = top ? 26 : H2 - 34; R(c, b.awn, dx - 6, awY, 32, 6); for (let k = 0; k < 8; k++) R(c, shade(b.awn, k % 2 ? -26 : 20), dx - 6 + k * 4, awY, 4, 6); R(c, 'rgba(0,0,0,0.25)', dx - 6, awY + 6, 32, 2);
  const sx = Math.max(4, dx - 30), sy = top ? 6 : 6; R(c, '#14120f', sx, sy, 22, 14); R(c, '#e8dcc0', sx + 1, sy + 1, 20, 12); const gi = c; gi.save(); gi.translate(sx + 7, sy + 3); (BICON[b.icon] || BICON.door)(c); gi.restore();
  if (W2 > 70) { R(c, '#14120f', W2 - dx - 22, 14 + (top ? 20 : 0), 18, 12); R(c, '#9acfe0', W2 - dx - 20, 16 + (top ? 20 : 0), 14, 8); R(c, '#14120f', 14, 14 + (top ? 20 : 0), 18, 12); R(c, '#9acfe0', 16, 16 + (top ? 20 : 0), 14, 8); }
  R(c, shade(col, -52), 0, 0, 1, H2); R(c, shade(col, -52), W2 - 1, 0, 1, H2);
}
function registerBuildingSprites() {
  for (const b of HB) { const w = b.w * TS, h = b.h * TS + 4; DECOR_SPR['bld_' + b.id] = { w, h, nv: 1, outline: false, paint: c => paintBuilding(c, b, w, h) }; }
}
registerBuildingSprites();
Object.assign(DECOR_SPR, {
  container: { w: 46, h: 26, nv: 6, outline: false, paint: (c, v) => { const cols = ['#a8501e', '#3a5a8a', '#5a7a3a', '#8a3a3a', '#d6a84a', '#5a5a64'], col = cols[v % 6]; R(c, shade(col, -34), 0, 2, 46, 24); R(c, col, 1, 3, 44, 22); for (let x = 3; x < 44; x += 3) R(c, shade(col, -16), x, 4, 1, 20); R(c, shade(col, 30), 0, 2, 46, 2); R(c, 'rgba(0,0,0,0.3)', 0, 23, 46, 3); R(c, '#14120f', 22, 4, 1, 20); R(c, 'rgba(255,255,255,0.15)', 4, 6, 8, 2); } },
  bridge: { w: 96, h: 80, nv: 1, outline: false, paint: c => { R(c, '#3a3a42', 6, 30, 84, 50); R(c, '#4a4a54', 8, 32, 80, 46); R(c, '#e8e0d0', 14, 12, 68, 22); R(c, '#cfc8b8', 14, 30, 68, 4); R(c, '#14120f', 18, 16, 60, 8); R(c, '#9acfe0', 20, 17, 56, 6); R(c, '#3a3a42', 40, 2, 16, 12); R(c, '#c0392b', 44, 0, 8, 4); for (let x = 12; x < 86; x += 6) R(c, '#2a2a30', x, 40, 1, 36); R(c, '#e8c24a', 8, 52, 80, 2); } },
  counter: { w: 64, h: 18, nv: 1, outline: false, paint: c => { R(c, '#3a2a1a', 0, 4, 64, 14); R(c, '#7a5a30', 0, 2, 64, 5); R(c, '#9a7a4a', 0, 2, 64, 1); R(c, '#2a1c10', 0, 16, 64, 2); for (let x = 4; x < 62; x += 8) R(c, '#2a1c10', x, 8, 1, 8); } },
  gatearch: { w: 56, h: 52, nv: 1, outline: false, paint: c => { R(c, '#3a2e24', 0, 0, 10, 52); R(c, '#3a2e24', 46, 0, 10, 52); R(c, '#4a3c30', 0, 0, 56, 12); R(c, '#14120f', 4, 14, 48, 2); R(c, '#c8a040', 12, 3, 32, 6); R(c, '#14120f', 14, 4, 28, 4); R(c, '#e8dcc0', 16, 5, 24, 2); R(c, '#6a3a2a', 0, 40, 10, 12); R(c, '#6a3a2a', 46, 40, 10, 12); } },
  hulltank: { w: 28, h: 32, nv: 1, outline: false, paint: c => { R(c, '#3a3a42', 2, 8, 24, 22); R(c, '#5a5a64', 4, 8, 20, 4); R(c, '#4a6a8a', 4, 14, 20, 12); R(c, '#7ab0d0', 6, 15, 8, 3); R(c, '#14120f', 2, 28, 24, 3); R(c, '#2a2a30', 12, 2, 4, 8); R(c, '#8a8d94', 10, 0, 8, 3); } },
  board: { w: 34, h: 30, nv: 1, outline: false, paint: c => { R(c, '#3a2a1a', 2, 6, 30, 22); R(c, '#6a4a2a', 4, 8, 26, 18); R(c, '#e8dcc0', 6, 10, 8, 6); R(c, '#e8dcc0', 16, 11, 7, 5); R(c, '#e8dcc0', 8, 18, 9, 6); R(c, '#c8b890', 20, 18, 8, 6); R(c, '#c0392b', 9, 10, 1, 1); R(c, '#c0392b', 19, 11, 1, 1); R(c, '#3a2a1a', 6, 26, 4, 4); R(c, '#3a2a1a', 24, 26, 4, 4); R(c, '#e8c24a', 12, 1, 10, 6); R(c, '#14120f', 14, 3, 6, 2); } }
});
const BOARD_TILE = { x: 58, y: 63 };

/* ---------- The town map ---------- */
function genHull(def) {
  const rng = mulberry32(def.seed);
  emptyMap(def); waterDepth = new Uint8Array(W * H).fill(1);
  for (let i = 0; i < W * H; i++) shade_[i] = Math.floor(rng() * 4);
  const fill = (x0, y0, x1, y1, t) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) tiles[y * W + x] = t; };
  fill(6, 8, 121, 105, T.FLOOR); fill(3, 106, 124, 124, T.WATER); fill(58, 100, 70, 112, T.FLOOR);
  fill(12, 10, 116, 38, T.CLIFF);                               // the ship
  const road = (x0, y0, x1, y1, f) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { floors[y * W + x] = f; } };
  road(6, 62, 121, 66, 4); road(63, 39, 65, 105, 4); road(6, 85, 121, 88, 4); road(52, 59, 76, 69, 3); road(58, 100, 70, 112, 1);
  for (let y = 39; y < 62; y++) for (let x = 63; x <= 65; x++) tiles[y * W + x] = T.FLOOR;
  for (const b of HB) {
    fill(b.x, b.y, b.x + b.w - 1, b.y + b.h - 1, T.CLIFF);
    tiles[b.door.y * W + b.door.x] = T.FLOOR; tiles[b.out.y * W + b.out.x] = T.FLOOR;
    for (let dx = -1; dx <= 1; dx++) { const yy = b.out.y, xx = b.door.x + dx; floors[yy * W + xx] = 2; floors[b.door.y * W + xx] = 2; }
    decor.push({ kind: 'bld_' + b.id, x: (b.x + b.w / 2) * TS, y: (b.y + b.h) * TS + 2, v: 0, ph: 0 });
    INTERACT.set(b.door.y * W + b.door.x, b.closed ? { kind: 'portal', label: b.name, sign: b.name, to: 'hull', tx: b.out.x, ty: b.out.y, locked: () => b.closed } : { kind: 'portal', label: b.name, sign: b.name, to: 'hull_' + b.id, tx: -1, ty: -1 });
  }
  // the ship: containers stacked along its deck, a bridge, and the west gate
  for (let row = 0; row < 3; row++) for (let k = 0; k < 11; k++) { const x = 14 + k * 9 + (row % 2) * 4, y = 20 + row * 8; if (x > 52 && x < 77 && row === 2) continue; decor.push({ kind: 'container', x: x * TS + 22, y: y * TS + 26, v: Math.floor(rng() * 6), ph: 0 }); }
  decor.push({ kind: 'bridge', x: 64 * TS, y: 27 * TS, v: 0, ph: 0 });
  decor.push({ kind: 'gatearch', x: 7 * TS + 8, y: 66 * TS, v: 0, ph: 0 });
  decor.push({ kind: 'board', x: (BOARD_TILE.x + 0.5) * TS, y: (BOARD_TILE.y + 1) * TS, v: 0, ph: 0 }, { kind: 'hulltank', x: 70 * TS, y: 62 * TS, v: 0, ph: 0 });
  INTERACT.set(BOARD_TILE.y * W + BOARD_TILE.x, { kind: 'board', label: 'Job board' });
  INTERACT.set(64 * W + 8, { kind: 'portal', up: true, label: 'West gate, out to the marsh', to: 'wastes', get tx() { return state.mapFlags.hull.portal ? state.mapFlags.hull.portal.x : 0; }, get ty() { return state.mapFlags.hull.portal ? state.mapFlags.hull.portal.y + 1 : 0; } });
  for (let k = 0; k < 90; k++) { const x = 8 + Math.floor(rng() * 112), y = 40 + Math.floor(rng() * 64), i = y * W + x; if (tiles[i] !== T.FLOOR || floors[i] || structs.has(i)) continue; let ok = true; for (const b of HB) if (x > b.x - 2 && x < b.x + b.w + 1 && y > b.y - 2 && y < b.y + b.h + 1) ok = false; if (ok) decor.push({ kind: ['barrel', 'sack', 'debris', 'barrel', 'sign'][Math.floor(rng() * 5)], x: x * TS + 8, y: y * TS + 12, v: Math.floor(rng() * 3), ph: 0 }); }
  for (let x = 12; x < 120; x += 9) for (const y of [61, 67]) { const i = y * W + x; if (tiles[i] === T.FLOOR && !structs.has(i)) structs.set(i, newStruct('lamp')); }
  for (let x = 14; x < 120; x += 12) { const i = 85 * W + x; if (tiles[i] === T.FLOOR && !structs.has(i)) structs.set(i, newStruct('lamp')); }
  decor.sort((p, q) => p.y - q.y); def.rooms_ = [];
}
const hourNow = () => (state.gameMinutes / 60) % 24;
MAPDEFS.hull = { id: 'hull', name: 'The Hull', title: 'The Hull', sub: 'A container ship, aground', zone: HULL_ZONE, theme: 'hull', seed: 8801, rooms: 0, rad: 0, density: 0, mobs: [], gen: genHull,
  get dark() { const h = hourNow(); return h < 5 || h >= 21 ? 0.6 : h < 7 ? 0.6 * (7 - h) / 2 : h < 19 ? 0 : 0.6 * (h - 19) / 2; },
  entry() { return { x: 10, y: 64 }; }, target() { return null; } };

/* ---------- The way in, and a loading screen with the building's name ---------- */
function hullPortalEntry() { return { kind: 'portal', label: 'Gangway to The Hull', to: 'hull', tx: -1, ty: -1, onEnter() { state.qflags.hull_found = true; } }; }
function setHullPortal(into) {
  const fl = state.mapFlags.hull = state.mapFlags.hull || {};
  if (!fl.portal) { const s = dungeonSpot(5); if (!s) return; fl.portal = s; }
  (into || INTERACT).set(fl.portal.i, hullPortalEntry());
}
{ const o = placeStorySites; placeStorySites = function () { o(); setHullPortal(); }; }
{ const o = loadGame; loadGame = function () {
  const ok = o();
  if (ok) { const fl = state.mapFlags.hull; if (fl && fl.portal) { const tgt = state.map === 'wastes' ? INTERACT : (STASH.wastes && STASH.wastes.interact); if (tgt) tgt.set(fl.portal.i, hullPortalEntry()); } }
  return ok;
}; }
setHullPortal();
{ const o = drawStorm; drawStorm = function () {
  o();
  const tr = state.transition; if (!tr) return;
  const d = MAPDEFS[tr.id]; if (!d || !d.title) return;
  const a = tr.phase === 'out' ? Math.min(1, tr.t / 0.35) : Math.max(0, 1 - tr.t / 0.45); if (a < 0.4) return;
  const w = window.innerWidth, h = window.innerHeight; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.globalAlpha = Math.min(1, (a - 0.4) / 0.4);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '22px ' + MONO; ctx.fillStyle = '#ffe9b0'; ctx.fillText(d.title, w / 2, h / 2 - 6);
  if (d.sub) { ctx.font = '11px ' + MONO; ctx.fillStyle = '#b8a890'; ctx.fillText(d.sub, w / 2, h / 2 + 20); } ctx.globalAlpha = 1;
}; }
{ const o = drawInteract; drawInteract = function (i, tx, ty, time) {
  const it = INTERACT.get(i);
  if (it && it.sign && Math.hypot((tx + 0.5) * TS - state.player.x, (ty + 0.5) * TS - state.player.y) < 150) {
    ctx.font = '8px ' + MONO; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; const y = ty * TS + (BID[it.to && it.to.replace('hull_', '')] && (BID[it.to.replace('hull_', '')].band === 'B' || BID[it.to.replace('hull_', '')].band === 'H') ? -4 : -12);
    ctx.fillStyle = '#000'; ctx.fillText(it.sign, Math.round(tx * TS + 8) + 0.5, y + 0.5); ctx.fillStyle = '#ffe9b0'; ctx.fillText(it.sign, Math.round(tx * TS + 8), y);
  }
  if (it && (it.kind === 'portal' || it.kind === 'board') && it.sign !== undefined) return;
  if (it && it.kind === 'board') return;
  o(i, tx, ty, time);
}; }
Object.assign(DBG, { layoutFor, genHull, hourNow, setHullPortal });
