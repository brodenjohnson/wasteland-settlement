/* =====================================================================
   AQ_HULLART: dressing for the Hull. Rubble, junk, market stalls, washing
   lines, dock gear, drum fires and ground grime, all drawn as decor so
   nothing blocks the townsfolk's routes.
   ===================================================================== */
Object.assign(DECOR_SPR, {
  rubble: { w: 22, h: 13, nv: 3, outline: true, paint: (c, v) => {
    const g = ['#6a6660', '#7a766e', '#5a5650'];
    R(c, g[v], 1, 6, 9, 6); R(c, shade(g[v], 18), 2, 6, 7, 2); R(c, g[(v + 1) % 3], 8, 3, 8, 9); R(c, shade(g[(v + 1) % 3], 20), 9, 3, 6, 2);
    R(c, g[(v + 2) % 3], 14, 7, 7, 5); R(c, '#3a3632', 1, 11, 20, 2);
    R(c, '#8a4a2a', 11, 0, 1, 6); R(c, '#8a4a2a', 12, 1, 1, 1); if (v !== 1) { R(c, '#7a3a20', 4, 2, 1, 5); R(c, '#7a3a20', 5, 1, 1, 1); }
    R(c, '#4a4640', 6, 9, 2, 1); R(c, '#4a4640', 16, 9, 2, 1); } },
  crates: { w: 16, h: 17, nv: 2, outline: true, paint: (c, v) => {
    const box = (x, y, s) => { R(c, '#4a3220', x, y, s, s); R(c, '#8a6238', x + 1, y + 1, s - 2, s - 2); R(c, '#6a4a2a', x + 1, y + (s >> 1), s - 2, 1); R(c, '#6a4a2a', x + (s >> 1), y + 1, 1, s - 2); R(c, '#a07848', x + 1, y + 1, s - 2, 1); };
    box(0, 8, 9); box(7, 8, 9); if (v) box(3, 0, 9); else { R(c, '#3a3a42', 4, 4, 8, 4); R(c, '#5a5a64', 5, 4, 6, 1); } } },
  planter: { w: 18, h: 13, nv: 2, outline: true, paint: (c, v) => {
    R(c, '#4a3220', 0, 6, 18, 7); R(c, '#7a5a30', 1, 7, 16, 5); R(c, '#3a2a18', 1, 6, 16, 1);
    for (let x = 2; x < 16; x += 3) { R(c, '#3a6a2a', x, 1 + (x % 2), 2, 5); R(c, '#5a8a3a', x, 1 + (x % 2), 1, 2); }
    if (v) { R(c, '#c0392b', 5, 3, 2, 2); R(c, '#c0392b', 11, 2, 2, 2); } else { R(c, '#e8c24a', 8, 2, 2, 2); } } },
  bench: { w: 22, h: 11, nv: 1, outline: true, paint: c => {
    R(c, '#5a4028', 0, 0, 22, 2); R(c, '#7a5a38', 0, 4, 22, 3); R(c, '#9a7a4a', 0, 4, 22, 1); R(c, '#2a2a30', 2, 7, 2, 4); R(c, '#2a2a30', 18, 7, 2, 4); R(c, '#2a2a30', 2, 2, 1, 2); R(c, '#2a2a30', 19, 2, 1, 2); } },
  stall: { w: 34, h: 30, nv: 3, outline: true, paint: (c, v) => {
    const aw = ['#c0392b', '#3a6a8a', '#d6a84a'][v];
    R(c, '#3a2a1a', 2, 8, 2, 22); R(c, '#3a2a1a', 30, 8, 2, 22);
    for (let k = 0; k < 8; k++) R(c, k % 2 ? shade(aw, -28) : aw, 1 + k * 4, 2, 4, 8); R(c, 'rgba(0,0,0,0.3)', 1, 10, 32, 2);
    R(c, '#4a3220', 3, 18, 28, 10); R(c, '#7a5a30', 3, 18, 28, 3);
    const goods = [['#c0392b', '#e8c24a', '#5a8a3a'], ['#8a8d94', '#5a5a64', '#c8a040'], ['#e8dcc0', '#c8b890', '#8a6238']][v];
    for (let k = 0; k < 6; k++) R(c, goods[k % 3], 5 + k * 4, 15 + (k % 2), 3, 3); } },
  clothes: { w: 40, h: 24, nv: 2, outline: false, paint: (c, v) => {
    R(c, '#3a2a1a', 1, 2, 2, 22); R(c, '#3a2a1a', 37, 2, 2, 22); R(c, '#14120f', 0, 23, 4, 1); R(c, '#14120f', 36, 23, 4, 1);
    for (let x = 3; x < 37; x++) R(c, '#b8a890', x, 4 + Math.round(Math.sin((x - 3) / 34 * Math.PI) * 3), 1, 1);
    const cols = v ? ['#7a4a4a', '#e8e0d0', '#4a5a7a', '#6a5a3a'] : ['#4f7a52', '#c8b890', '#8a3a3a', '#e8c24a'];
    [[6, 6, 6], [14, 8, 5], [22, 7, 7], [31, 5, 4]].forEach(([x, h, w], k) => { const y = 5 + Math.round(Math.sin((x - 3) / 34 * Math.PI) * 3); R(c, cols[k], x, y, w, h); R(c, shade(cols[k], -24), x, y + h - 1, w, 1); }); } },
  scrapheap: { w: 26, h: 16, nv: 2, outline: true, paint: (c, v) => {
    R(c, '#4a4640', 1, 9, 24, 7); R(c, '#6a6a72', 3, 6, 10, 6); R(c, '#8a8d94', 4, 6, 8, 1); R(c, '#8a4a2a', 12, 3, 9, 8); R(c, '#a8602e', 13, 3, 7, 2);
    R(c, '#2a2a30', 6, 2, 2, 6); R(c, '#2a2a30', 7, 1, 6, 1); R(c, '#3a3a42', 18, 10, 6, 5); R(c, '#14120f', 20, 11, 2, 2);
    if (v) { R(c, '#2a2a2e', 0, 11, 7, 5); R(c, '#4a4a4e', 2, 12, 3, 3); } } },
  sandbags: { w: 26, h: 11, nv: 1, outline: true, paint: c => {
    for (let k = 0; k < 4; k++) { R(c, '#7a6a4a', 1 + k * 6, 5, 6, 5); R(c, '#9a8a62', 2 + k * 6, 5, 4, 1); R(c, '#5a4a32', 1 + k * 6, 9, 6, 1); }
    for (let k = 0; k < 3; k++) { R(c, '#8a7a56', 4 + k * 6, 1, 6, 5); R(c, '#a89a72', 5 + k * 6, 1, 4, 1); } } },
  bollard: { w: 9, h: 11, nv: 1, outline: true, paint: c => { R(c, '#2a2a30', 1, 3, 7, 8); R(c, '#4a4a54', 2, 3, 5, 2); R(c, '#14120f', 0, 1, 9, 3); R(c, '#5a5a64', 1, 1, 7, 1); R(c, '#8a5a2a', 2, 6, 5, 1); } },
  rope: { w: 12, h: 7, nv: 1, outline: false, paint: c => { R(c, '#8a7a4a', 1, 1, 10, 5); R(c, '#a89a62', 2, 1, 8, 1); R(c, '#6a5a32', 3, 3, 6, 1); R(c, '#5a4a28', 5, 2, 2, 3); } },
  fishcrate: { w: 15, h: 10, nv: 2, outline: true, paint: (c, v) => {
    R(c, '#4a3220', 0, 3, 15, 7); R(c, '#7a5a30', 1, 4, 13, 2); for (let k = 0; k < 4; k++) R(c, v ? '#9fb8c8' : '#c8a87a', 2 + k * 3, 2, 3, 2); R(c, '#e8e0d0', 3, 2, 1, 1); } },
  net: { w: 22, h: 8, nv: 1, outline: false, paint: c => { for (let x = 0; x < 22; x += 2) for (let y = 1; y < 8; y += 2) R(c, (x + y) % 4 ? '#5a6a5a' : '#4a5a4a', x, y, 1, 1); R(c, '#c8a040', 4, 2, 2, 2); R(c, '#c8a040', 15, 4, 2, 2); } },
  drumfire: { w: 12, h: 18, nv: 1, anim: true, outline: true, paint: (c, v, fr) => {
    R(c, '#3a2a22', 1, 7, 10, 11); R(c, '#5a3a2a', 2, 7, 8, 2); R(c, '#2a1a14', 1, 12, 10, 1); R(c, '#7a3a20', 3, 10, 2, 5);
    R(c, '#e8702a', 3, 2 + fr, 6, 5 - fr); R(c, '#ffd36b', 4, 4, 4, 3); R(c, '#fff6c8', 5, 5 - fr, 2, 2); if (fr) R(c, '#e8702a', 2, 1, 2, 2); else R(c, '#e8702a', 8, 0, 2, 3); } },
  rust: { w: 8, h: 30, nv: 3, outline: false, paint: (c, v) => { for (let y = 0; y < 30; y++) { const w = Math.max(1, 4 - Math.floor(y / 9) + ((y + v) % 3 === 0 ? 1 : 0)); R(c, y < 6 ? 'rgba(150,70,30,0.6)' : 'rgba(120,55,25,0.45)', 2 + ((y * (v + 1)) % 2), y, w, 1); } } },
  oilstain: { w: 20, h: 9, nv: 3, outline: false, paint: (c, v) => { R(c, 'rgba(10,8,12,0.55)', 3, 2, 14, 5); R(c, 'rgba(10,8,12,0.45)', 1, 3, 18, 3); if (v === 1) R(c, 'rgba(90,60,120,0.25)', 7, 3, 5, 2); if (v === 2) R(c, 'rgba(10,8,12,0.3)', 15, 0, 4, 3); } },
  crack: { w: 18, h: 8, nv: 3, outline: false, paint: (c, v) => { let x = 1, y = 3 + v % 2; for (let k = 0; k < 8; k++) { R(c, 'rgba(10,8,12,0.8)', x, y, 2, 1); x += 2; y += (k + v) % 3 === 0 ? 1 : (k + v) % 3 === 1 ? -1 : 0; y = Math.max(0, Math.min(7, y)); } if (v !== 0) R(c, 'rgba(10,8,12,0.45)', 8, 4, 1, 3); } },
  puddle: { w: 22, h: 9, nv: 2, outline: false, paint: (c, v) => { R(c, 'rgba(34,46,58,0.85)', 3, 2, 16, 5); R(c, 'rgba(34,46,58,0.8)', 1, 3, 20, 3); R(c, 'rgba(160,190,210,0.35)', 5 + v * 4, 3, 5, 1); R(c, 'rgba(120,60,30,0.25)', 2, 5, 4, 1); } },
  litter: { w: 14, h: 6, nv: 3, outline: false, paint: (c, v) => { R(c, '#c8b890', 1 + v, 1, 3, 2); R(c, '#e8dcc0', 7, 3, 2, 2); if (v) R(c, '#8a3a3a', 10, 1, 2, 1); else R(c, '#4a6a8a', 10, 2, 3, 1); R(c, '#6a6a72', 4, 4, 2, 1); } },
  weeds: { w: 10, h: 8, nv: 2, outline: false, paint: (c, v) => { R(c, '#4a6a2a', 2, 3, 1, 5); R(c, '#5a7a32', 4, 1, 1, 7); R(c, '#4a6a2a', 6, 4, 1, 4); R(c, '#6a8a3a', 3, 2, 1, 1); if (v) { R(c, '#5a7a32', 8, 3, 1, 5); R(c, '#c8b84a', 5, 0, 1, 1); } } }
});
function dressHull() {
  const rng = mulberry32(8807), free = (x, y) => { const i = y * W + x; return tiles[i] === T.FLOOR && !structs.has(i) && !INTERACT.has(i); };
  const put = (kind, x, y, v) => decor.push({ kind, x: x * TS + 8, y: y * TS + 13, v: v === undefined ? Math.floor(rng() * 6) : v, ph: rng() * 2 });
  const nearBld = (x, y, m) => HB.some(b => x > b.x - m - 1 && x < b.x + b.w + m && y > b.y - m - 1 && y < b.y + b.h + m);
  const lane = (x, y) => floors[y * W + x] === 4 || floors[y * W + x] === 2;
  // by each door, props that fit the trade
  const BYKIND = { general: ['crates', 'barrel'], armoury: ['crates', 'sandbags'], armourer: ['crates', 'tyre'], apothecary: ['planter', 'barrel'], stockyard: ['planter', 'sack'], scrapyard: ['scrapheap', 'tyre'],
    cantina: ['bench', 'barrel'], inn: ['bench', 'planter'], guild: ['crates', 'scrapheap'], council: ['planter', 'bench'], clinic: ['bench', 'planter'], hq: ['sandbags', 'crates'], house: ['crates', 'planter'], closed: ['rubble', 'rubble'] };
  for (const b of HB) {
    const ks = BYKIND[b.kind] || ['barrel', 'crates'], y = b.y + b.h;
    const kit = ks.concat(['barrel', 'crates', 'sack', 'planter', 'tyre']);
    for (let x = b.x; x < b.x + b.w; x += 2 + Math.floor(rng() * 2)) if (Math.abs(x - b.door.x) > 2 && free(x, y)) put(x === b.x || x >= b.x + b.w - 2 ? ks[x === b.x ? 0 : 1] : kit[Math.floor(rng() * kit.length)], x, y);
    if (b.kind === 'closed') for (let k = 0; k < 4; k++) { const x = b.x + Math.floor(rng() * b.w), yy = y + Math.floor(rng() * 2); if (Math.abs(x - b.door.x) > 1 && free(x, yy)) put('rubble', x, yy); }
  }
  // washing lines between the cargo homes
  for (const b of HB) if (b.kind === 'house') { const x = b.x + b.w + 1, y = b.y + (b.h >> 1); if (free(x, y) && !nearBld(x + 1, y, 0)) put('clothes', x, y); }
  // market stalls around the plaza, and drum fires that burn at night
  [[54, 60, 0], [74, 60, 1], [54, 68, 2], [74, 68, 0]].forEach(([x, y, v]) => { if (free(x, y)) put('stall', x, y, v); });
  [[52, 64], [76, 64], [59, 101], [69, 101], [11, 60], [11, 68]].forEach(([x, y]) => { if (free(x, y)) { put('drumfire', x, y, 0); MAP_LIGHTS.push({ x: (x + 0.5) * TS, y: (y + 0.5) * TS, r: 120 }); } });
  // the dock
  for (let y = 102; y <= 111; y += 3) { if (free(58, y)) put('bollard', 58, y, 0); if (free(70, y)) put('bollard', 70, y, 0); }
  [[60, 104, 'rope'], [68, 106, 'fishcrate'], [61, 109, 'fishcrate'], [67, 110, 'net'], [62, 102, 'rope']].forEach(([x, y, k]) => { if (free(x, y)) put(k, x, y); });
  // rust running down the ship, and rubble along its foot
  for (let x = 13; x < 116; x += 3 + Math.floor(rng() * 4)) decor.push({ kind: 'rust', x: x * TS + 8, y: 38 * TS + 14, v: Math.floor(rng() * 3), ph: 0 });
  for (let k = 0; k < 26; k++) { const x = 13 + Math.floor(rng() * 102), y = 39 + Math.floor(rng() * 3); if (free(x, y) && !lane(x, y)) put(rng() < 0.7 ? 'rubble' : 'scrapheap', x, y); }
  // junk off the main lanes
  for (let k = 0; k < 260; k++) {
    const x = 8 + Math.floor(rng() * 112), y = 40 + Math.floor(rng() * 64);
    if (!free(x, y) || floors[y * W + x] === 4 || floors[y * W + x] === 3 || nearBld(x, y, 0)) continue;
    put(['rubble', 'rubble', 'crates', 'scrapheap', 'tyre', 'barrel', 'planter'][Math.floor(rng() * 7)], x, y);
  }
  // ground grime everywhere, roads included
  for (let k = 0; k < 900; k++) {
    const x = 7 + Math.floor(rng() * 114), y = 39 + Math.floor(rng() * 66);
    if (tiles[y * W + x] !== T.FLOOR || nearBld(x, y, -1)) continue;
    const r = rng(), kind = r < 0.3 ? 'crack' : r < 0.5 ? 'oilstain' : r < 0.68 ? 'litter' : r < 0.84 ? 'weeds' : 'puddle';
    decor.push({ kind, x: x * TS + Math.floor(rng() * 10) + 3, y: y * TS + 8 + Math.floor(rng() * 6), v: Math.floor(rng() * 3), ph: 0 });
  }
  decor.sort((p, q) => p.y - q.y);
}
{ const o = MAPDEFS.hull.gen; MAPDEFS.hull.gen = function (def) { o(def); dressHull(); }; }
