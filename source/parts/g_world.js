/* =====================================================================
   WORLD 2: one big open map. A walled home valley, then distinct wild regions.
   ===================================================================== */
const ZONES = [
  { id: 'forest', zid: 2, name: 'Whisper Pines', x: 30, y: 36, r: 27, danger: 1.0 },
  { id: 'ash', zid: 3, name: 'The Ashlands', x: 88, y: 24, r: 20, danger: 0.85 },
  { id: 'city', zid: 4, name: 'Fallen City', x: 102, y: 54, r: 22, danger: 1.2 },
  { id: 'marsh', zid: 5, name: 'Toxic Marsh', x: 100, y: 102, r: 22, danger: 1.1 },
  { id: 'quarry', zid: 6, name: 'The Quarry', x: 70, y: 114, r: 11, danger: 0.75 },
  { id: 'yard', zid: 7, name: 'The Scrapyard', x: 64, y: 78, r: 12, danger: 0.75 }
];
const ZONE_NAMES = ['The Wastes', 'Home Valley', 'Whisper Pines', 'The Ashlands', 'Fallen City', 'Toxic Marsh', 'The Quarry', 'The Scrapyard'];
const OASES = [{ x: 62, y: 62, r: 5 }, { x: 14, y: 64, r: 4.5 }, { x: 116, y: 80, r: 4.5 }, { x: 58, y: 34, r: 4.5 }];
const HOT_SPOTS = [];
const HOT_DEFS = [[92, 96], [108, 110], [112, 88], [94, 28], [108, 38], [78, 110]];
const GATES = [-Math.PI / 2, 0];
const zoneMap = new Uint8Array(W * H);
const RUIN_DEFS = [
  { x: 60, y: 90, w: 9, h: 7, kind: 'outpost', loot: 'forge' },
  { x: 62, y: 72, w: 9, h: 7, kind: 'office', loot: 'ironwork' },
  { x: 70, y: 83, w: 6, h: 5, kind: 'shed' },
  { x: 66, y: 106, w: 7, h: 6, kind: 'shed' },
  { x: 26, y: 33, w: 9, h: 7, kind: 'cabin', loot: 'medicine' },
  { x: 40, y: 48, w: 6, h: 5, kind: 'hut' },
  { x: 14, y: 22, w: 7, h: 6, kind: 'hut' },
  { x: 84, y: 18, w: 9, h: 8, kind: 'bunker', rich: true },
  { x: 100, y: 52, w: 11, h: 9, kind: 'armoury', loot: 'firearms', rich: true },
  { x: 90, y: 44, w: 7, h: 6, kind: 'house' },
  { x: 112, y: 46, w: 8, h: 7, kind: 'house' },
  { x: 88, y: 62, w: 8, h: 7, kind: 'house' },
  { x: 112, y: 62, w: 9, h: 7, kind: 'house' },
  { x: 100, y: 68, w: 7, h: 6, kind: 'house' },
  { x: 96, y: 36, w: 7, h: 6, kind: 'house' },
  { x: 98, y: 98, w: 9, h: 8, kind: 'pump', loot: 'hazmat' },
  { x: 88, y: 108, w: 6, h: 5, kind: 'shack' },
  { x: 112, y: 94, w: 6, h: 5, kind: 'shack' }
];
const DENS = {
  0: { tree: 0.014, rock: 0.012, scrap: 0.006, ore: 0.001, pine: 0.02, bush: 0.01 },
  1: { tree: 0.028, rock: 0.022, scrap: 0.014, bush: 0.012, pine: 0.03 },
  2: { redwood: 0.026, pine: 0.2, bush: 0.014, rock: 0.01, tree: 0.035 },
  3: { tree: 0.07, rock: 0.014, scrap: 0.012, ore: 0.003 },
  4: { scrap: 0.03, rock: 0.012, tree: 0.012 },
  5: { tree: 0.035, bush: 0.02, scrap: 0.01, pine: 0.02 },
  6: { rock: 0.13, ore: 0.05, scrap: 0.02 },
  7: { scrap: 0.13, rock: 0.012, tree: 0.006 }
};
const LOOT_FIXED = {
  starter: { items: [{ name: 'Wood', qty: 8 }, { name: 'Scrap', qty: 8 }, { name: 'Canned food', qty: 2 }, { name: 'Bandage', qty: 2 }, { name: 'Potato Seeds', qty: 3 }, { name: 'Cloth', qty: 2 }] },
  forge: { bp: 'forge', items: [{ name: 'Wood', qty: 6 }, { name: 'Scrap', qty: 8 }, { name: 'Stone', qty: 4 }, { name: 'Canned food', qty: 1 }] },
  ironwork: { bp: 'ironwork', items: [{ name: 'Metal plate', qty: 2 }, { name: 'Scrap', qty: 10 }, { name: 'Wood', qty: 6 }, { name: 'Cloth', qty: 2 }] },
  medicine: { bp: 'medicine', items: [{ name: 'Cloth', qty: 4 }, { name: 'Canned food', qty: 2 }, { name: 'Tomato Seeds', qty: 3 }, { name: 'Rad tabs', qty: 1 }] },
  firearms: { bp: 'firearms', items: [{ name: 'Metal plate', qty: 4 }, { name: 'Pistol rounds', qty: 6 }, { name: 'Scrap', qty: 8 }] },
  hazmat: { bp: 'hazmat', items: [{ name: 'Cloth', qty: 6 }, { name: 'Rad-Away', qty: 1 }, { name: 'Metal plate', qty: 2 }] }
};
function rollLoot(rng, rich) {
  const pool = [['Scrap', 6, 12, 1], ['Wood', 4, 8, 0.9], ['Stone', 3, 6, 0.5], ['Cloth', 2, 4, 0.7], ['Canned food', 1, 2, 0.6], ['Radish Seeds', 2, 4, 0.3],
    ['Potato Seeds', 2, 3, 0.25], ['Tomato Seeds', 1, 2, 0.2], ['Pistol rounds', 2, 4, 0.3], ['Bandage', 1, 2, 0.4], ['Metal plate', 1, 3, 0.3],
    ['Rad tabs', 1, 1, 0.2], ['Iron ore', 2, 3, rich ? 0.6 : 0.1], ['Rad-Away', 1, 1, rich ? 0.5 : 0.05]];
  const items = [];
  for (const [n, a, b, c] of pool) if (rng() < c * (rich ? 1.4 : 1)) items.push({ name: n, qty: a + Math.floor(rng() * (b - a + 1)) });
  if (items.length < 2) items.push({ name: 'Scrap', qty: 5 }, { name: 'Wood', qty: 3 });
  return { items };
}

function generate() {
  const rng = mulberry32(CONFIG.seed);
  const noise = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) noise[i] = rng();
  for (let i = 0; i < W * H; i++) shade_[i] = Math.floor(rng() * 4);
  const nz = (x, y, s, sc) => vnoise(x / sc, y / sc, s);
  const inb = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const bdist = (x, y) => Math.hypot(x - BASE.x, y - BASE.y);

  // regions
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x;
    if (bdist(x, y) < 23.5) { zoneMap[i] = 1; continue; }
    let best = 0, bd = 1e9;
    for (const z of ZONES) {
      const d = (Math.hypot(x - z.x, y - z.y) + (nz(x, y, 77, 7) - 0.5) * 7) / z.r;
      if (d < 1 && d < bd) { bd = d; best = z.zid; }
    }
    zoneMap[i] = best;
  }
  // terrain per region
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, z = zoneMap[i];
    let t = T.GROUND;
    if (z === 2) t = nz(x, y, 91, 8) > 0.34 ? T.GRASS : T.GROUND;
    else if (z === 3) t = T.ASH;
    else if (z === 5) { t = nz(x, y, 90, 6) > 0.64 ? T.WATER : nz(x, y, 92, 9) > 0.42 ? T.GRASS : T.GROUND; }
    else if (z === 0 && nz(x, y, 93, 12) > 0.74) t = T.GRASS;
    tiles[i] = t;
  }

  // home valley: big dirt yard, grass, a clean spring
  const dirtR = 11.5;
  for (let y = BASE.y - 24; y <= BASE.y + 24; y++) for (let x = BASE.x - 24; x <= BASE.x + 24; x++) {
    if (!inb(x, y)) continue;
    const i = y * W + x;
    if (zoneMap[i] !== 1) continue;
    const dx = (x - BASE.x) / dirtR, dy = (y - BASE.y) / (dirtR * 0.82);
    if (dx * dx + dy * dy < 1 + (noise[i] - 0.5) * 0.55) tiles[i] = T.DIRT;
    else if (nz(x, y, 94, 8) > 0.6) tiles[i] = T.GRASS;
  }
  const spring = (sx, sy, rad) => {
    for (let y = Math.floor(sy - rad - 1); y <= Math.ceil(sy + rad + 1); y++) for (let x = Math.floor(sx - rad - 1); x <= Math.ceil(sx + rad + 1); x++) {
      if (!inb(x, y)) continue;
      const i = y * W + x, d = Math.hypot(x - sx, y - sy);
      if (tiles[i] === T.CLIFF) continue;
      if (d < rad + (noise[i] - 0.5) * 1.4 && tiles[i] !== T.DIRT) tiles[i] = T.GRASS;
      if (d < 1.4) tiles[i] = T.SPRING;
    }
  };
  spring(BASE.x + 14, BASE.y - 8, 4.4);
  for (const o of OASES) spring(o.x, o.y, o.r);

  // the wall of cliffs around the home valley, with gates
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dh = bdist(x, y), i = y * W + x;
    if (dh < 23.2 || dh > 33) continue;
    const ang = Math.atan2(y - BASE.y, x - BASE.x);
    let gate = false, gateNear = false;
    for (const g of GATES) {
      let df = Math.abs(ang - g); if (df > Math.PI) df = 2 * Math.PI - df;
      if (dh * df < 3.6) gate = true;
      if (dh * df < 5) gateNear = true;
    }
    if (gateNear) reserved[i] = 1;
    if (dh < 26.6 + (noise[i] - 0.5) * 0.9) { if (gate) { if (tiles[i] === T.WATER) tiles[i] = T.GROUND; } else tiles[i] = T.CLIFF; }
  }

  // roads
  const road = (pts, w) => {
    for (let k = 0; k < pts.length - 1; k++) {
      const x0 = pts[k][0], y0 = pts[k][1], x1 = pts[k + 1][0], y1 = pts[k + 1][1];
      const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2);
      for (let s = 0; s <= n; s++) {
        const f = s / n, cx = x0 + (x1 - x0) * f + (nz(s, k, 71, 6) - 0.5) * 3, cy = y0 + (y1 - y0) * f + (nz(k, s, 72, 6) - 0.5) * 3;
        for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
          const x = Math.round(cx) + dx, y = Math.round(cy) + dy;
          if (!inb(x, y) || Math.hypot(x - cx, y - cy) > w / 2) continue;
          const j = y * W + x, t = tiles[j];
          if (t === T.GROUND || t === T.GRASS || t === T.ASH) tiles[j] = T.ROAD;
        }
      }
    }
  };
  road([[BASE.x + 27, BASE.y], [62, 98], [64, 84], [80, 66], [98, 58]], 2.6);
  road([[BASE.x, BASE.y - 27], [28, 70], [30, 60]], 2.6);
  road([[62, 98], [68, 108], [70, 114]], 2.4);
  road([[98, 58], [100, 78], [98, 94]], 2.4);
  road([[98, 58], [92, 38], [88, 26]], 2.4);
  road([[86, 48], [118, 48]], 2.2); road([[86, 60], [118, 60]], 2.2); road([[94, 38], [94, 72]], 2.2); road([[108, 40], [108, 72]], 2.2);

  // ruined buildings with real floors
  const makeRuin = d => {
    const x = d.x, y = d.y, w = d.w, h = d.h;
    for (let yy = y - 1; yy <= y + h; yy++) for (let xx = x - 1; xx <= x + w; xx++) {
      if (!inb(xx, yy)) continue;
      const i = yy * W + xx;
      if (tiles[i] === T.WATER || tiles[i] === T.CLIFF) tiles[i] = T.GROUND;
      reserved[i] = 1;
    }
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) {
      const edge = xx === x || xx === x + w - 1 || yy === y || yy === y + h - 1;
      const i = yy * W + xx;
      tiles[i] = edge && rng() > 0.12 ? T.RUBBLE : T.FLOOR;
    }
    const dx = x + 2 + Math.floor(rng() * (w - 5));
    for (let k = 0; k < 2; k++) tiles[(y + h - 1) * W + dx + k] = T.FLOOR;
    const dy = y + 2 + Math.floor(rng() * (h - 5));
    for (let k = 0; k < 2; k++) tiles[(dy + k) * W + x] = T.FLOOR;
    ruins.push({ x0: x, y0: y, w, h, kind: d.kind, loot: d.loot, rich: !!d.rich });
  };
  for (const d of RUIN_DEFS) makeRuin(d);

  // hot spots
  for (const [hx, hy] of HOT_DEFS) {
    HOT_SPOTS.push({ x: hx, y: hy, r: 3.2 });
    for (let y = hy - 5; y <= hy + 5; y++) for (let x = hx - 5; x <= hx + 5; x++) {
      if (inb(x, y) && Math.hypot(x - hx, y - hy) < 4.3) { const i = y * W + x; reserved[i] = 1; if (tiles[i] === T.WATER) tiles[i] = T.GROUND; }
    }
  }

  // world border cliffs, two tiles thick
  for (let x = 0; x < W; x++) for (let k = 0; k < 2; k++) { tiles[k * W + x] = T.CLIFF; tiles[(H - 1 - k) * W + x] = T.CLIFF; }
  for (let y = 0; y < H; y++) for (let k = 0; k < 2; k++) { tiles[y * W + k] = T.CLIFF; tiles[y * W + W - 1 - k] = T.CLIFF; }

  // objects by region density
  const noRedwoodNear = (x, y) => { for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { if (inb(x + dx, y + dy) && objs[(y + dy) * W + x + dx] === O.REDWOOD) return false; } return true; };
  for (let y = 3; y < H - 3; y++) for (let x = 3; x < W - 3; x++) {
    const i = y * W + x;
    if (reserved[i] || objs[i] || bdist(x, y) < 7) continue;
    const t = tiles[i], d = DENS[zoneMap[i]];
    if (!d) continue;
    let kind = 0;
    if (t === T.GRASS) {
      if (d.redwood && rng() < d.redwood && noRedwoodNear(x, y)) kind = O.REDWOOD;
      else if (d.pine && rng() < d.pine) kind = O.PINE;
      else if (d.bush && rng() < d.bush) kind = O.BUSH;
      else if (d.rock && rng() < d.rock) kind = O.ROCK;
    } else if (t === T.GROUND || t === T.ASH) {
      if (d.tree && rng() < d.tree) kind = O.TREE;
      else if (d.rock && rng() < d.rock) kind = O.ROCK;
      else if (d.scrap && rng() < d.scrap) kind = O.SCRAP;
      else if (d.ore && rng() < d.ore) kind = O.ORE;
    }
    if (kind) objs[i] = kind;
  }
  // berry bushes and pines around springs
  const ringStuff = (sx, sy, rad) => {
    let n = 0, t = 0;
    while (n < 6 && t < 300) { t++; const x = Math.round(sx + (rng() - 0.5) * rad * 2), y = Math.round(sy + (rng() - 0.5) * rad * 2); if (!inb(x, y)) continue; const i = y * W + x; if (tiles[i] === T.GRASS && !objs[i] && Math.hypot(x - sx, y - sy) > 2) { objs[i] = O.BUSH; n++; } }
    n = 0; t = 0;
    while (n < 9 && t < 500) { t++; const a = rng() * 6.283, rr = rad * (0.5 + rng() * 0.8), x = Math.round(sx + Math.cos(a) * rr), y = Math.round(sy + Math.sin(a) * rr); if (!inb(x, y)) continue; const i = y * W + x; if (tiles[i] === T.GRASS && !objs[i] && Math.hypot(x - sx, y - sy) > 2.4) { objs[i] = O.PINE; n++; } }
  };
  ringStuff(BASE.x + 14, BASE.y - 8, 4.4);
  for (const o of OASES) ringStuff(o.x, o.y, o.r);

  // supply crates: starter cache at home, one or two in each ruin, a rich one at every hot spot
  const putCrate = (x, y, loot) => { const i = y * W + x; if (inb(x, y) && !objs[i] && tiles[i] !== T.WATER && tiles[i] !== T.CLIFF) { objs[i] = O.CRATE; crateLoot.set(i, loot); return true; } return false; };
  putCrate(BASE.x - 8, BASE.y - 5, LOOT_FIXED.starter);
  putCrate(BASE.x + 9, BASE.y + 7, rollLoot(rng, false));
  for (const r of ruins) {
    const copies = r.rich ? 2 : 1;
    for (let c = 0; c < copies; c++) {
      for (let t = 0; t < 200; t++) {
        const x = r.x0 + 2 + Math.floor(rng() * (r.w - 4)), y = r.y0 + 2 + Math.floor(rng() * (r.h - 4));
        if (tiles[y * W + x] !== T.FLOOR) continue;
        const loot = c === 0 && r.loot ? LOOT_FIXED[r.loot] : rollLoot(rng, r.rich);
        if (putCrate(x, y, loot)) break;
      }
    }
  }
  for (const hs of HOT_SPOTS) putCrate(hs.x, hs.y, rollLoot(rng, true));

  computeRadiation();
}

function computeRadiation() {
  const S = CONFIG.survival;
  const inRuin = new Uint8Array(W * H);
  for (const r of ruins) {
    for (let y = r.y0 - 1; y <= r.y0 + r.h; y++) for (let x = r.x0 - 1; x <= r.x0 + r.w; x++) {
      if (x >= 0 && y >= 0 && x < W && y < H) inRuin[y * W + x] = 1;
    }
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, t = tiles[i];
    let rate = S.ambientRad;
    if (t === T.ASH) rate = 0.3;
    if (inRuin[i]) rate = S.ruinRad;
    let shore = false;
    if (t !== T.WATER) {
      for (let dy = -2; dy <= 2 && !shore; dy++) for (let dx = -2; dx <= 2; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < W && ny < H && tiles[ny * W + nx] === T.WATER) { shore = true; break; }
      }
    }
    if (shore) rate = Math.max(rate, S.shoreRad);
    for (const hs of HOT_SPOTS) {
      const d = Math.hypot(x - hs.x, y - hs.y);
      if (d < hs.r) rate = Math.max(rate, 0.9 + 0.9 * (1 - d / hs.r));
    }
    if (t === T.GRASS || t === T.SPRING) rate = S.greenRad;
    if (Math.hypot(x - BASE.x, y - BASE.y) <= S.baseZoneRadius) rate = S.baseRad;
    radMap[i] = rate;
  }
}

/* ---------- Minimap with fog of war ---------- */
const miniFog = document.createElement('canvas');
function buildMinimap() {
  mini.width = W * 2; mini.height = H * 2;
  const m = mini.getContext('2d');
  const cols = ['#8c8650', '#5a3c2a', '#4a8a44', '#68645f', '#44464e', '#4f8a4a', '#5ab4d6', '#4a4540', '#7a6a58', '#6a6a68'];
  const objCols = [null, '#3b2a1c', '#b8b8c0', '#8d8a83', '#e29a55', '#d6a84a', '#4f8a3a', '#2f6a3a', '#2a5a34'];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x;
    m.fillStyle = cols[tiles[i]] || '#000';
    m.fillRect(x * 2, y * 2, 2, 2);
    if (radMap[i] >= 0.85) { m.fillStyle = 'rgba(210,230,60,0.85)'; m.fillRect(x * 2, y * 2, 2, 2); }
    if (objs[i] && objCols[objs[i]]) { m.fillStyle = objCols[objs[i]]; m.fillRect(x * 2, y * 2, 2, 2); }
  }
  m.strokeStyle = 'rgba(127,224,192,0.8)'; m.lineWidth = 1;
  m.beginPath(); m.arc(BASE.x * 2 + 1, BASE.y * 2 + 1, CONFIG.survival.baseZoneRadius * 2, 0, Math.PI * 2); m.stroke();
  if (miniFog.width !== W * 2) {
    miniFog.width = W * 2; miniFog.height = H * 2;
    const f = miniFog.getContext('2d');
    f.fillStyle = 'rgba(8,6,10,0.97)'; f.fillRect(0, 0, W * 2, H * 2);
    f.globalCompositeOperation = 'destination-out';
    const hg = f.createRadialGradient(BASE.x * 2, BASE.y * 2, 40, BASE.x * 2, BASE.y * 2, 60);
    hg.addColorStop(0, 'rgba(0,0,0,1)'); hg.addColorStop(1, 'rgba(0,0,0,0)');
    f.fillStyle = hg; f.beginPath(); f.arc(BASE.x * 2, BASE.y * 2, 60, 0, 6.3); f.fill();
    f.globalCompositeOperation = 'source-over';
  }
}
function revealFog(tx, ty) {
  const f = miniFog.getContext('2d');
  f.globalCompositeOperation = 'destination-out';
  const g = f.createRadialGradient(tx * 2, ty * 2, 8, tx * 2, ty * 2, 28);
  g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  f.fillStyle = g; f.beginPath(); f.arc(tx * 2, ty * 2, 28, 0, 6.3); f.fill();
  f.globalCompositeOperation = 'source-over';
}

/* ---------- Spawn points across every region ---------- */
const SPAWN_DEFS = {
  2: [['hound', 8], ['husk', 4], ['glowrat', 5], ['scrapper', 2]],
  3: [['hound', 5], ['husk', 3], ['glowrat', 2]],
  4: [['scrapper', 5], ['gunner', 4], ['hound', 3], ['husk', 2]],
  5: [['glowrat', 8], ['husk', 5], ['hound', 2]],
  6: [['scrapper', 3], ['gunner', 2], ['glowrat', 2]],
  7: [['scrapper', 3], ['glowrat', 3], ['gunner', 1]],
  0: [['hound', 12], ['glowrat', 7]]
};
function makeSpawns() {
  const rng = mulberry32(CONFIG.seed + 99);
  const add = (type, x, y, hidden) => { state.spawnPts.push({ type, x: (x + 0.5) * TS, y: (y + 0.5) * TS, e: null, respawnAt: 0, hidden: !!hidden }); };
  const hiddenChance = { 2: 0.55, 5: 0.5, 3: 0.35, 0: 0.2, 4: 0.15, 6: 0.1, 7: 0.1 };
  for (const zid of Object.keys(SPAWN_DEFS).map(Number)) {
    for (const [type, count] of SPAWN_DEFS[zid]) {
      for (let n = 0; n < count; n++) {
        for (let t = 0; t < 400; t++) {
          const x = 4 + Math.floor(rng() * (W - 8)), y = 4 + Math.floor(rng() * (H - 8)), i = y * W + x;
          if (zoneMap[i] !== zid || solidAt(x, y) || tiles[i] === T.FLOOR) continue;
          if (Math.hypot(x - BASE.x, y - BASE.y) < 32) continue;
          add(type, x, y, rng() < (hiddenChance[zid] || 0) && tiles[i] !== T.ROAD);
          break;
        }
      }
    }
  }
  const garrison = { outpost: ['glowrat', 'glowrat'], office: ['scrapper', 'scrapper', 'gunner'], shed: ['glowrat', 'scrapper'], cabin: ['hound', 'husk'], hut: ['hound', 'glowrat'],
    bunker: ['scrapper', 'gunner', 'husk'], armoury: ['gunner', 'gunner', 'scrapper', 'scrapper'], house: ['scrapper', 'glowrat'], pump: ['husk', 'husk', 'glowrat'], shack: ['glowrat', 'husk'] };
  for (const r of ruins) {
    for (const type of garrison[r.kind] || ['glowrat']) {
      for (let t = 0; t < 100; t++) {
        const x = r.x0 + 1 + Math.floor(rng() * (r.w - 2)), y = r.y0 + 1 + Math.floor(rng() * (r.h - 2));
        if (!solidAt(x, y)) { add(type, x, y, false); break; }
      }
    }
  }
  for (const hs of HOT_SPOTS) {
    for (let n = 0; n < 2; n++) {
      for (let t = 0; t < 100; t++) {
        const x = Math.floor(hs.x - 3 + rng() * 6), y = Math.floor(hs.y - 3 + rng() * 6);
        if (!solidAt(x, y)) { add('husk', x, y, false); break; }
      }
    }
  }
  state.spawnPts.forEach((sp, idx) => { const e = spawnEnemy(sp.type, sp.x, sp.y, { spawnIdx: idx, hidden: sp.hidden }); sp.e = e.id; });
}

