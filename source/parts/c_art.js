/* =====================================================================
   ART: baked ground, outlined sprites, icons
   ===================================================================== */
const R = (c, col, x, y, w, h) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const cl = v => Math.max(0, Math.min(255, v));
  return 'rgb(' + cl((n >> 16) + amt) + ',' + cl(((n >> 8) & 255) + amt) + ',' + cl((n & 255) + amt) + ')';
}
function hash2(x, y, s) {
  let h = (x * 374761393 + y * 668265263 + s * 1274126177) | 0;
  h = (h ^ (h >>> 13)) * 1274126177 | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const spriteCache = {};
function makeSprite(key, w, h, paint) {
  if (spriteCache[key]) return spriteCache[key];
  const cv = document.createElement('canvas');
  cv.width = w + 2; cv.height = h + 2;
  const c = cv.getContext('2d');
  c.translate(1, 1);
  paint(c);
  c.setTransform(1, 0, 0, 1, 0, 0);
  const W2 = cv.width, H2 = cv.height;
  const img = c.getImageData(0, 0, W2, H2), d = img.data;
  const out = new Uint8ClampedArray(d);
  for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) {
    const i = (y * W2 + x) * 4;
    if (d[i + 3] > 0) continue;
    const n = (x > 0 && d[i - 1] > 0) || (x < W2 - 1 && d[i + 7] > 0) || (y > 0 && d[i - W2 * 4 + 3] > 0) || (y < H2 - 1 && d[i + W2 * 4 + 3] > 0);
    if (n) { out[i] = 24; out[i + 1] = 17; out[i + 2] = 14; out[i + 3] = 235; }
  }
  img.data.set(out);
  c.putImageData(img, 0, 0);
  spriteCache[key] = cv;
  return cv;
}
function whiteSprite(key, spr) {
  const k = 'w|' + key;
  if (spriteCache[k]) return spriteCache[k];
  const cv = document.createElement('canvas');
  cv.width = spr.width; cv.height = spr.height;
  const c = cv.getContext('2d');
  c.drawImage(spr, 0, 0);
  c.globalCompositeOperation = 'source-in';
  c.fillStyle = 'rgba(255,255,255,0.88)';
  c.fillRect(0, 0, cv.width, cv.height);
  spriteCache[k] = cv;
  return cv;
}
function shadowAt(cx, cy, w) {
  ctx.fillStyle = 'rgba(10,8,6,0.3)';
  const x = Math.round(cx - w / 2), y = Math.round(cy);
  ctx.fillRect(x + 2, y - 1, w - 4, 1);
  ctx.fillRect(x, y, w, 2);
  ctx.fillRect(x + 2, y + 2, w - 4, 1);
}

/* ---------- Ground, baked once into one big canvas ---------- */
const PAL = {};
PAL[T.GROUND] = ['#6e6249', '#74684d', '#685c44', '#7a6e52', '#615640'];
PAL[T.DIRT]   = ['#4a3626', '#523b2a', '#46321f', '#5a4230', '#3e2c1e'];
PAL[T.WATER]  = ['#3b6634', '#427239', '#365e30', '#487d3e', '#315829'];
PAL[T.RUBBLE] = ['#4a4744', '#524f4b', '#43403d', '#5a5652', '#3a3835'];
PAL[T.ROAD]   = ['#3a3a3e', '#404044', '#35353a', '#46464b', '#2f2f34'];
PAL[T.GRASS]  = ['#587c38', '#628640', '#4f7233', '#6b9046', '#466a2e'];
PAL[T.SPRING] = ['#3f93b8', '#4aa3c8', '#3a8bb0', '#56afd4', '#357fa4'];
let groundCv = null;

function buildGround() {
  const GW = W * TS, GH = H * TS;
  groundCv = document.createElement('canvas');
  groundCv.width = GW; groundCv.height = GH;
  const g = groundCv.getContext('2d');
  const img = g.createImageData(GW, GH), d = img.data;
  const pal = {};
  for (const k of Object.keys(PAL)) pal[k] = PAL[k].map(h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
  for (let py = 0; py < GH; py++) {
    for (let px = 0; px < GW; px++) {
      const tx = px >> 4, ty = py >> 4;
      let t = tiles[ty * W + tx];
      const lx = px & 15, ly = py & 15;
      const m = Math.min(lx, 15 - lx, ly, 15 - ly);
      if (m < 4 && t !== T.RUBBLE) {
        let ntx = tx, nty = ty;
        if (m === lx) ntx--; else if (m === 15 - lx) ntx++; else if (m === ly) nty--; else nty++;
        if (ntx >= 0 && nty >= 0 && ntx < W && nty < H) {
          const nt = tiles[nty * W + ntx];
          if (nt !== t && nt !== T.RUBBLE && hash2(px, py, 7) < (4 - m) / 8) t = nt;
        }
      }
      const P = pal[t];
      const cn = hash2(px >> 2, py >> 2, 3), fn = hash2(px, py, 11);
      let idx = cn < 0.2 ? 4 : cn < 0.45 ? 2 : cn < 0.7 ? 0 : cn < 0.9 ? 1 : 3;
      if (fn > 0.94) idx = (idx + 1) % 5; else if (fn < 0.04) idx = (idx + 4) % 5;
      const col = P[idx], o = (py * GW + px) * 4;
      d[o] = col[0]; d[o + 1] = col[1]; d[o + 2] = col[2]; d[o + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);

  // ground details
  for (let ty = 0; ty < H; ty++) for (let tx = 0; tx < W; tx++) {
    const i = ty * W + tx, t = tiles[i], x = tx * TS, y = ty * TS;
    const a = hash2(tx, ty, 21), b = hash2(tx, ty, 22), c2 = hash2(tx, ty, 23);
    const ox = 2 + Math.floor(b * 10), oy = 3 + Math.floor(c2 * 9);
    if (t === T.GROUND) {
      if (a < 0.16) { R(g, 'rgba(0,0,0,0.28)', x + ox, y + oy + 1, 3, 1); R(g, '#8a7e66', x + ox, y + oy, 2, 1); R(g, '#a39880', x + ox, y + oy, 1, 1); }
      else if (a < 0.26) { R(g, '#4a5a34', x + ox, y + oy, 1, 3); R(g, '#5f7240', x + ox + 1, y + oy + 1, 1, 2); R(g, '#4a5a34', x + ox - 1, y + oy + 1, 1, 2); }
      else if (a < 0.30) { R(g, 'rgba(20,14,8,0.35)', x + ox, y + oy, 4, 1); R(g, 'rgba(20,14,8,0.3)', x + ox + 3, y + oy + 1, 1, 3); }
      else if (a < 0.315) { R(g, '#d8cdb5', x + ox, y + oy, 3, 1); R(g, '#b9ae96', x + ox + 2, y + oy + 1, 1, 1); }
    } else if (t === T.DIRT) {
      if (a < 0.18) { R(g, 'rgba(0,0,0,0.25)', x + ox, y + oy + 1, 3, 1); R(g, '#6b4f38', x + ox, y + oy, 2, 1); }
    } else if (t === T.GRASS) {
      if (a < 0.4) { R(g, '#7fae52', x + ox, y + oy, 1, 3); R(g, '#8fbe5e', x + ox + 1, y + oy + 1, 1, 2); R(g, '#3f6a2a', x + ox - 1, y + oy + 2, 1, 1); }
      if (b < 0.07) { R(g, '#f0e6a0', x + ox, y + oy, 1, 1); R(g, '#d96a8a', x + ox + 3, y + oy + 2, 1, 1); }
    } else if (t === T.ROAD) {
      if (a < 0.2) { R(g, 'rgba(0,0,0,0.4)', x + ox, y + oy, 1, 4); R(g, 'rgba(0,0,0,0.4)', x + ox + 1, y + oy + 3, 3, 1); }
      if (b < 0.1) R(g, 'rgba(255,255,255,0.08)', x + ox, y + oy, 3, 1);
      if (ty === 41 && tiles[i - W] === T.ROAD && tx % 2 === 0) R(g, 'rgba(214,190,90,0.5)', x + 2, y, 10, 1);
    }
  }

  // walls: top face and front face, drawn after the ground so shadows land on it
  for (let ty = 0; ty < H; ty++) for (let tx = 0; tx < W; tx++) {
    if (tiles[ty * W + tx] !== T.RUBBLE) continue;
    const x = tx * TS, y = ty * TS;
    const southOpen = ty + 1 < H && tiles[(ty + 1) * W + tx] !== T.RUBBLE;
    const topH = southOpen ? 10 : 16;
    R(g, '#5d5955', x, y, TS, topH);
    R(g, '#6e6a65', x, y, TS, 2);
    for (let k = 0; k < 3; k++) { R(g, 'rgba(0,0,0,0.18)', x, y + 3 + k * 4, TS, 1); }
    const off = (ty & 1) * 4;
    for (let k = 0; k < 3; k++) R(g, 'rgba(0,0,0,0.16)', x + ((k * 6 + off + tx * 3) % 14), y + 2 + k * 4, 1, 4);
    if (hash2(tx, ty, 31) < 0.4) R(g, '#7a766f', x + 3 + Math.floor(hash2(tx, ty, 32) * 8), y + 1, 3, 2);
    if (southOpen) {
      R(g, '#3a3734', x, y + 10, TS, 6);
      R(g, '#46423e', x, y + 10, TS, 1);
      for (let k = 0; k < 2; k++) R(g, 'rgba(0,0,0,0.25)', x, y + 12 + k * 3, TS, 1);
      R(g, 'rgba(0,0,0,0.2)', x + ((tx * 5) % 12), y + 11, 1, 3);
      R(g, 'rgba(0,0,0,0.3)', x, y + TS, TS, 3);
      if (hash2(tx, ty, 33) < 0.25) R(g, '#4a6a3a', x + 2 + Math.floor(hash2(tx, ty, 34) * 10), y + 13, 2, 2);
    }
  }
}

/* ---------- Object painters (tile occupies the bottom 16 rows of each sprite) ---------- */
function paintTree(c, v) {
  const f = v & 1 ? -1 : 1;
  R(c, '#3e2d22', 7, 10, 3, 14); R(c, '#5a4332', 7, 10, 1, 14); R(c, '#2c2018', 9, 12, 1, 12);
  R(c, '#4a382a', 5, 22, 7, 2); R(c, '#3a2b20', 4, 23, 2, 1); R(c, '#3a2b20', 11, 23, 2, 1);
  const br = '#4a382a', brL = '#6a523c';
  R(c, br, f > 0 ? 9 : 3, 12, 5, 1); R(c, br, f > 0 ? 13 : 3, 8, 1, 5); R(c, brL, f > 0 ? 12 : 4, 8, 1, 1);
  R(c, br, f > 0 ? 3 : 9, 15, 5, 1); R(c, br, f > 0 ? 3 : 12, 12, 1, 4);
  R(c, br, 7, 5, 1, 6); R(c, br, 4, 5, 4, 1); R(c, br, 9, 3, 1, 4); R(c, brL, 7, 5, 1, 1);
  R(c, '#7a6a3a', f > 0 ? 13 : 2, 7, 1, 1); R(c, '#7a6a3a', 9, 2, 1, 1); R(c, '#7a6a3a', 4, 4, 1, 1);
}
function paintScrap(c) {
  R(c, '#4a4d54', 2, 11, 12, 4); R(c, '#8a8d94', 2, 8, 12, 4); R(c, '#6e7178', 4, 5, 7, 5); R(c, '#a9acb3', 4, 5, 7, 2);
  R(c, '#c9c9cf', 6, 6, 2, 1); R(c, '#a8532a', 3, 11, 4, 2); R(c, '#c4703a', 3, 11, 4, 1); R(c, '#3e4046', 9, 10, 4, 3);
  R(c, '#8a8d94', 10, 7, 3, 3); R(c, '#d6a84a', 11, 8, 1, 1);
}
function paintRock(c) {
  R(c, '#4a4740', 3, 11, 10, 4); R(c, '#7a7770', 3, 8, 10, 5); R(c, '#8d8a83', 5, 5, 6, 5); R(c, '#a39f97', 6, 5, 3, 1);
  R(c, '#5f5c56', 3, 12, 10, 2); R(c, '#6a675f', 9, 8, 3, 4); R(c, '#aaa69d', 5, 6, 1, 3);
}
function paintOre(c) {
  R(c, '#3e3c38', 2, 10, 12, 5); R(c, '#56534e', 2, 7, 12, 6); R(c, '#6a665f', 4, 4, 8, 5); R(c, '#7a766f', 5, 4, 4, 1);
  R(c, '#a8532a', 4, 9, 3, 2); R(c, '#a8532a', 9, 6, 3, 2); R(c, '#a8532a', 7, 11, 4, 2);
  R(c, '#e29a55', 5, 9, 1, 1); R(c, '#e29a55', 10, 6, 1, 1); R(c, '#e29a55', 8, 11, 1, 1); R(c, '#f2c27a', 10, 7, 1, 1);
}
function paintCrate(c) {
  R(c, '#4a3320', 2, 13, 12, 2); R(c, '#7a5a30', 2, 5, 12, 9); R(c, '#9a7440', 2, 5, 12, 3); R(c, '#b08a50', 3, 5, 4, 1);
  R(c, '#3b2a1c', 2, 9, 12, 1); R(c, '#3b2a1c', 7, 5, 2, 9); R(c, '#d6a84a', 7, 8, 2, 3); R(c, '#f2d27a', 7, 8, 1, 1);
  R(c, '#5a4128', 3, 11, 3, 1); R(c, '#5a4128', 10, 7, 3, 1);
}
function paintBush(c) {
  R(c, '#2f5a24', 2, 9, 12, 6); R(c, '#3f6e2e', 2, 6, 12, 7); R(c, '#4f8a3a', 4, 4, 8, 6); R(c, '#6fae4a', 5, 4, 3, 2);
  R(c, '#c0392b', 4, 8, 2, 2); R(c, '#e85a4a', 4, 8, 1, 1); R(c, '#c0392b', 9, 6, 2, 2); R(c, '#e85a4a', 9, 6, 1, 1); R(c, '#c0392b', 11, 10, 2, 2); R(c, '#a8281c', 6, 11, 2, 2);
}
const OBJ_SPR = {};
OBJ_SPR[O.TREE] = { h: 24, paint: paintTree };
OBJ_SPR[O.SCRAP] = { h: 16, paint: paintScrap };
OBJ_SPR[O.ROCK] = { h: 16, paint: paintRock };
OBJ_SPR[O.ORE] = { h: 16, paint: paintOre };
OBJ_SPR[O.CRATE] = { h: 16, paint: paintCrate };
OBJ_SPR[O.BUSH] = { h: 16, paint: paintBush };

function drawObject(kind, tx, ty, s) {
  const spec = OBJ_SPR[kind];
  if (!spec) return;
  const spr = makeSprite('o|' + kind + '|' + (s & 1), 16, spec.h, c => spec.paint(c, s & 1));
  shadowAt(tx * TS + 8, ty * TS + 13, 12);
  ctx.drawImage(spr, tx * TS - 1, ty * TS - (spec.h - 16) - 1);
}

/* ---------- Structures ---------- */
function paintWorkbench(c) {
  R(c, '#4a3320', 2, 10, 2, 6); R(c, '#4a3320', 12, 10, 2, 6); R(c, '#6b4a2b', 2, 13, 12, 1);
  R(c, '#8a5a2b', 1, 6, 14, 5); R(c, '#a87a45', 1, 6, 14, 1); R(c, '#6b4220', 1, 10, 14, 1);
  R(c, '#c9ced6', 3, 3, 6, 2); R(c, '#8a8d94', 3, 4, 6, 1); R(c, '#6b4a2b', 8, 4, 3, 2);
  R(c, '#a8532a', 11, 3, 3, 3); R(c, '#d6a84a', 12, 4, 1, 1);
}
function paintForge(c) {
  R(c, '#55524c', 10, 0, 4, 5); R(c, '#6a665f', 10, 0, 1, 5);
  R(c, '#4a4742', 1, 14, 14, 6); R(c, '#6a665f', 1, 5, 14, 11); R(c, '#7a766f', 1, 5, 14, 2);
  R(c, '#55524c', 1, 14, 14, 2);
  R(c, '#1c1410', 4, 9, 8, 7); R(c, '#2a1d16', 4, 9, 8, 1);
  R(c, '#3a3834', 2, 8, 12, 1);
}
function paintPurifier(c) {
  R(c, '#3e4046', 2, 17, 12, 3); R(c, '#5a6068', 2, 5, 12, 13); R(c, '#78808a', 2, 5, 12, 2); R(c, '#4a5058', 11, 6, 3, 12);
  R(c, '#2a3a4a', 4, 9, 6, 7); R(c, '#4aa3c8', 4, 11, 6, 5); R(c, '#9fdcff', 5, 11, 2, 1);
  R(c, '#8a8d94', 6, 2, 4, 4); R(c, '#a9acb3', 6, 2, 4, 1); R(c, '#a8532a', 3, 4, 3, 1);
  R(c, '#3e4046', 5, 18, 2, 2);
}
function paintBarricade(c) {
  R(c, '#4a3320', 1, 13, 14, 2); R(c, '#7a5a30', 1, 6, 14, 3); R(c, '#9a7440', 1, 6, 14, 1);
  R(c, '#6b4a2b', 1, 10, 14, 3); R(c, '#3b2a1c', 3, 5, 1, 9); R(c, '#3b2a1c', 12, 5, 1, 9);
  R(c, '#a9acb3', 2, 3, 1, 3); R(c, '#a9acb3', 7, 2, 1, 4); R(c, '#a9acb3', 12, 3, 1, 3);
}
const STRUCT_SPR = {
  workbench: { h: 16, paint: paintWorkbench }, forge: { h: 20, paint: paintForge },
  purifier: { h: 20, paint: paintPurifier }, barricade: { h: 16, paint: paintBarricade }
};
function structSprite(type) {
  const spec = STRUCT_SPR[type];
  return makeSprite('s|' + type, 16, spec.h, spec.paint);
}
function drawStruct(st, tx, ty) {
  const spec = STRUCT_SPR[st.type];
  if (!spec) return;
  shadowAt(tx * TS + 8, ty * TS + 14, 14);
  ctx.drawImage(structSprite(st.type), tx * TS - 1, ty * TS - (spec.h - 16) - 1);
  if (st.type === 'forge') {
    const fl = Math.floor(state.elapsed * 6) % 3;
    ctx.fillStyle = '#f26f21'; ctx.fillRect(tx * TS + 5, ty * TS + 3 - fl + 7, 6, 5 + fl);
    ctx.fillStyle = '#ffd36b'; ctx.fillRect(tx * TS + 7, ty * TS + 5 - fl + 7, 2, 3 + fl);
  }
  if (st.hp !== undefined && st.hp < STRUCT_HP[st.type]) {
    const x = tx * TS + 2, y = ty * TS - (spec.h - 16) - 3;
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(x - 1, y - 1, 14, 4);
    ctx.fillStyle = '#e8503a'; ctx.fillRect(x, y, Math.max(0, 12 * st.hp / STRUCT_HP[st.type]), 2);
  }
}

/* ---------- Camp furniture ---------- */
function paintBedroll(c) {
  R(c, '#3a2a22', 1, 11, 14, 2); R(c, '#7a3b2e', 1, 6, 14, 6); R(c, '#9a4b3c', 1, 6, 14, 2);
  R(c, '#d8cdb5', 1, 6, 4, 6); R(c, '#efe6cf', 1, 6, 4, 2); R(c, '#5a2a22', 6, 9, 9, 1);
}
function drawBaseMarker(time) {
  const bx = BASE.x * TS, by = BASE.y * TS;
  ctx.drawImage(makeSprite('bed', 16, 16, paintBedroll), bx - 1, by - 1);
  const fx = (BASE.x + 2) * TS, fy = BASE.y * TS;
  ctx.fillStyle = 'rgba(10,8,6,0.3)'; ctx.fillRect(fx + 1, fy + 13, 14, 3);
  ctx.fillStyle = '#26211c'; ctx.fillRect(fx + 3, fy + 8, 10, 6);
  ctx.fillStyle = '#6a665f'; ctx.fillRect(fx + 2, fy + 10, 3, 3); ctx.fillRect(fx + 11, fy + 10, 3, 3); ctx.fillRect(fx + 5, fy + 12, 6, 2);
  ctx.fillStyle = '#8a8680'; ctx.fillRect(fx + 2, fy + 10, 3, 1); ctx.fillRect(fx + 11, fy + 10, 3, 1);
  ctx.fillStyle = '#4a3320'; ctx.fillRect(fx + 4, fy + 10, 8, 2);
  const fl = Math.floor(time * 8) % 4;
  ctx.fillStyle = '#d6451a'; ctx.fillRect(fx + 5, fy + 5 - fl % 2, 6, 6 + fl % 2);
  ctx.fillStyle = '#f26f21'; ctx.fillRect(fx + 6, fy + 4 - fl % 3, 4, 6 + fl % 3);
  ctx.fillStyle = '#ffd36b'; ctx.fillRect(fx + 7, fy + 6 - fl % 2, 2, 4);
}

/* ---------- Characters ---------- */
function armourLook() {
  const eq = state.player.equip, col = k => eq[k] && ARMOUR[eq[k].name] ? ARMOUR[eq[k].name].col : null;
  const look = { head: col('head'), body: col('body'), legs: col('legs'), feet: col('feet') };
  look.sig = [look.head, look.body, look.legs, look.feet].join(',');
  return look;
}
function paintPlayer(c, dir, frame, look) {
  const skin = '#e0b48a', hair = '#2a1d14';
  const jacket = look.body || '#2f7f8a', jD = shade(jacket, -30), jL = shade(jacket, 20);
  const pants = look.legs || '#3b4252', boots = look.feet || '#2a2420';
  const l1 = frame === 1 ? 1 : 0, l3 = frame === 3 ? 1 : 0;
  if (dir < 2) {
    R(c, pants, 4, 13, 3, 5 - l1); R(c, pants, 8, 13, 3, 5 - l3);
    R(c, boots, 4, 18 - l1, 3, 2); R(c, boots, 8, 18 - l3, 3, 2);
    R(c, jacket, 3, 7, 9, 7); R(c, jD, 3, 12, 9, 2); R(c, jL, 4, 7, 7, 1); R(c, '#3b2a1c', 3, 12, 9, 1);
    R(c, jD, 1, 8, 2, 5); R(c, jD, 12, 8, 2, 5); R(c, skin, 1, 13, 2, 2); R(c, skin, 12, 13, 2, 2);
    R(c, '#c0392b', 4, 6, 7, 2);
    R(c, skin, 4, 1, 7, 6);
    if (dir === 0) {
      R(c, hair, 4, 1, 7, 2); R(c, hair, 4, 3, 1, 2); R(c, hair, 10, 3, 1, 2);
      R(c, '#20160f', 5, 4, 1, 1); R(c, '#20160f', 9, 4, 1, 1); R(c, '#c99a72', 7, 5, 1, 1);
    } else { R(c, hair, 4, 1, 7, 6); R(c, '#c0392b', 4, 6, 7, 1); }
    if (look.head) { R(c, look.head, 3, 0, 9, 3); R(c, shade(look.head, -35), 3, 3, 9, 1); R(c, shade(look.head, 25), 4, 0, 6, 1); }
  } else {
    c.save();
    if (dir === 2) { c.translate(14, 0); c.scale(-1, 1); }
    R(c, pants, 5 - l1, 13, 3, 5); R(c, pants, 7 + l3, 13, 3, 5);
    R(c, boots, 5 - l1, 18, 4, 2); R(c, boots, 7 + l3, 18, 4, 2);
    R(c, jacket, 4, 7, 7, 7); R(c, jD, 4, 12, 7, 2); R(c, jL, 5, 7, 5, 1); R(c, '#3b2a1c', 4, 12, 7, 1);
    R(c, jD, 6, 8, 3, 5); R(c, skin, 6, 13, 3, 2);
    R(c, '#c0392b', 4, 6, 7, 2);
    R(c, skin, 4, 1, 7, 6);
    R(c, hair, 4, 1, 5, 3); R(c, hair, 4, 3, 2, 3);
    R(c, '#20160f', 9, 4, 1, 1); R(c, '#c99a72', 11, 4, 1, 1);
    if (look.head) { R(c, look.head, 3, 0, 8, 3); R(c, shade(look.head, -35), 3, 3, 8, 1); R(c, shade(look.head, 25), 4, 0, 5, 1); }
    c.restore();
  }
}

function paintHuman(c, frame, o) {
  const l = frame ? 1 : 0, bw = o.bulk ? 2 : 0;
  R(c, o.legs, 4, 14, 3, 5 - l); R(c, o.legs, 8, 14, 3, 4 + l);
  R(c, '#2a2420', 4, 19 - l, 3, 1); R(c, '#2a2420', 8, 18 + l, 3, 1);
  R(c, o.body, 3 - bw / 2, 8 + (o.hunch ? 1 : 0), 9 + bw, 7); R(c, shade(o.body, -28), 3 - bw / 2, 13, 9 + bw, 2); R(c, shade(o.body, 18), 4 - bw / 2, 8 + (o.hunch ? 1 : 0), 7 + bw, 1);
  R(c, shade(o.body, -22), 1 - bw / 2, 9 + (o.hunch ? 1 : 0), 2, 6); R(c, shade(o.body, -22), 12 + bw / 2, 9 + (o.hunch ? 1 : 0), 2, 6);
  R(c, o.skin, 1 - bw / 2, 14 + (o.hunch ? 1 : 0), 2, 2); R(c, o.skin, 12 + bw / 2, 14 + (o.hunch ? 1 : 0), 2, 2);
  const hy = o.hunch ? 3 : 2;
  R(c, o.skin, 4, hy, 7, 6);
  if (o.hair) { R(c, o.hair, 4, hy, 7, 2); }
  if (o.plate) { R(c, o.plate, 2 - bw / 2, 8, 4, 3); R(c, o.plate, 9 + bw / 2, 8, 4, 3); R(c, shade(o.plate, 30), 2 - bw / 2, 8, 4, 1); R(c, shade(o.plate, 30), 9 + bw / 2, 8, 4, 1); }
  if (o.accent) R(c, o.accent, 4, hy + 1, 7, 1);
  if (o.ribs) { R(c, o.ribs, 5, 10, 5, 1); R(c, o.ribs, 5, 12, 5, 1); }
  R(c, o.eye, 5, hy + 3, 1, 1); R(c, o.eye, 9, hy + 3, 1, 1);
  if (o.glow) { R(c, o.glow, 4, hy + 3, 1, 1); R(c, o.glow, 10, hy + 3, 1, 1); }
  if (o.gun) { R(c, '#2a2a30', 11, 12, 5, 2); R(c, '#6a6a74', 14, 11, 2, 1); R(c, '#3b2a1c', 11, 14, 2, 2); }
  if (o.club) { R(c, '#6b4a2b', 13, 8, 2, 8); R(c, '#8a8d94', 12, 6, 4, 3); }
}
function paintGlowrat(c, f) {
  const lg = f ? 1 : 0;
  R(c, '#8a6a6a', 0, 5, 3, 1); R(c, '#8a6a6a', 0, 4 + lg, 1, 1);
  R(c, '#4e5c60', 3, 3, 8, 5); R(c, '#6a7a7e', 3, 3, 8, 1); R(c, '#7a8a8e', 4, 7, 6, 1);
  R(c, '#4e5c60', 10, 3, 4, 4); R(c, '#8a6a6a', 10, 2, 2, 1); R(c, '#d88a8a', 13, 5, 1, 1);
  R(c, '#b6e85a', 12, 4, 1, 1); R(c, '#8fd04a', 5, 4, 1, 1); R(c, '#8fd04a', 8, 5, 1, 1); R(c, '#8fd04a', 6, 3, 1, 1);
  R(c, '#2e3a3e', 4 + lg, 8, 2, 1); R(c, '#2e3a3e', 9 - lg, 8, 2, 1);
}
function paintHound(c, f) {
  const lg = f ? 1 : 0;
  R(c, '#7a756f', 0, 3, 4, 1); R(c, '#7a756f', 1, 2 + lg, 2, 1);
  R(c, '#5a5652', 3, 4, 11, 3); R(c, '#7a756f', 3, 6, 11, 4); R(c, '#8a857f', 4, 6, 9, 1);
  R(c, '#7a756f', 13, 2, 5, 5); R(c, '#3e3b38', 13, 1, 2, 2); R(c, '#5a5652', 16, 5, 3, 2); R(c, '#1a1816', 18, 5, 1, 1);
  R(c, '#d83a2a', 15, 3, 1, 1); R(c, '#ff7a5a', 15, 3, 1, 0);
  R(c, '#5a5652', 4 + lg, 10, 2, 3); R(c, '#5a5652', 7 - lg, 10, 2, 3); R(c, '#5a5652', 11 + lg, 10, 2, 3); R(c, '#5a5652', 13 - lg, 10, 2, 3);
  R(c, '#d8cdb5', 15, 7, 1, 1);
}
const ENEMY_SPR = {
  glowrat: { w: 15, h: 9, paint: paintGlowrat },
  hound: { w: 19, h: 13, paint: paintHound },
  husk: { w: 14, h: 20, paint: (c, f) => paintHuman(c, f, { legs: '#4a4a40', body: '#8a9078', skin: '#a3b08a', eye: '#20160f', glow: '#b6e85a', ribs: '#d8d8c0', hunch: true, bulk: true }) },
  scrapper: { w: 14, h: 20, paint: (c, f) => paintHuman(c, f, { legs: '#4a3a2a', body: '#6a4a3a', skin: '#c9a07a', eye: '#20160f', hair: '#2a1d14', accent: '#c0392b', plate: '#8a8d94', club: true }) },
  gunner: { w: 16, h: 20, paint: (c, f) => paintHuman(c, f, { legs: '#2f3a2f', body: '#4a5a4a', skin: '#c9a07a', eye: '#20160f', hair: '#3a4a3a', accent: '#d6a84a', gun: true }) }
};
function drawFlipped(spr, cx, bottom, flip) {
  const x = Math.round(cx), y = Math.round(bottom) - spr.height + 1;
  if (flip) { ctx.save(); ctx.translate(x, 0); ctx.scale(-1, 1); ctx.drawImage(spr, -Math.round(spr.width / 2), y); ctx.restore(); }
  else ctx.drawImage(spr, x - Math.round(spr.width / 2), y);
}
function drawEnemy(e) {
  const d = ENEMY_TYPES[e.type], spec = ENEMY_SPR[e.type];
  const frame = Math.floor(e.walkT * 6) % 2;
  const key = 'e|' + e.type + '|' + frame;
  let spr = makeSprite(key, spec.w, spec.h, c => spec.paint(c, frame));
  if (e.flash > 0) spr = whiteSprite(key, spr);
  const bottom = e.y + d.size / 2 + 1;
  shadowAt(e.x, bottom - 1, d.size + 4);
  drawFlipped(spr, e.x, bottom, e.dirx < 0);
  if (e.hp < e.maxHp) {
    const bw = Math.max(10, d.size + 4), x = Math.round(e.x - bw / 2), y = Math.round(bottom - spec.h - 4);
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(x - 1, y - 1, bw + 2, 4);
    ctx.fillStyle = '#e8503a'; ctx.fillRect(x, y, Math.max(0, bw * e.hp / e.maxHp), 2);
  }
}

function iconDir(p) {
  const ax = p.aimX, ay = p.aimY;
  return Math.abs(ax) > Math.abs(ay) ? (ax < 0 ? 2 : 3) : (ay < 0 ? 1 : 0);
}
function drawPlayer(p) {
  const dir = iconDir(p), frame = p.moving ? Math.floor(p.walkT * 8) % 4 : 0;
  const look = armourLook();
  const spr = makeSprite('p|' + dir + '|' + frame + '|' + look.sig, 14, 20, c => paintPlayer(c, dir, frame, look));
  const bob = (p.moving && (frame === 1 || frame === 3)) ? -1 : 0;
  shadowAt(p.x, p.y + 5, 12);
  if (state.iframes > 0 && Math.floor(state.elapsed * 20) % 2 === 0) ctx.globalAlpha = 0.45;
  drawFlipped(spr, p.x, p.y + 6 + bob, false);
  ctx.globalAlpha = 1;
  if (state.hurtT > 0) { ctx.globalAlpha = state.hurtT * 2.4; drawFlipped(whiteSprite('p|' + dir + '|' + frame + '|' + look.sig, spr), p.x, p.y + 6 + bob, false); ctx.globalAlpha = 1; }
  // held item
  const sel = selItem();
  if (sel && !ARMOUR[sel.name]) {
    const k = iconKind(sel.name);
    if (['axe', 'pickaxe', 'hoe', 'can', 'melee', 'pistol'].includes(k)) {
      let hx = p.x + (dir === 3 ? 4 : dir === 2 ? -12 : dir === 1 ? -11 : 3), hy = p.y - 5 + (dir === 1 ? -2 : 0);
      if (state.swing) { const pr = Math.min(1, state.swing.t / state.swing.dur), a = Math.sin(pr * Math.PI) * 6; hx += p.aimX * a; hy += p.aimY * a; }
      ctx.globalAlpha = dir === 1 ? 0.85 : 1;
      drawIcon(sel.name, Math.round(hx), Math.round(hy), 11);
      ctx.globalAlpha = 1;
    }
  }
}

function drawCrop(cr, tx, ty) {
  const c = CROPS[cr.seed], ripe = cropRipe(cr);
  const ratio = Math.min(1, cr.age / c.days);
  const stage = ripe ? 4 : cr.age === 0 ? 0 : 1 + Math.min(2, Math.floor(ratio * 3));
  const spr = makeSprite('c|' + c.id + '|' + stage, 16, 16, g => paintCrop(g, stage, c));
  ctx.drawImage(spr, tx * TS - 1, ty * TS - 1);
}
function paintCrop(g, stage, c) {
  const g1 = '#4f8a3a', g2 = '#6fae4a', g3 = '#3a6e2e';
  if (stage === 0) { R(g, '#3e2d22', 6, 11, 4, 2); R(g, '#7a6240', 7, 10, 2, 1); return; }
  if (stage === 1) { R(g, g1, 7, 9, 1, 4); R(g, g2, 5, 9, 2, 1); R(g, g2, 9, 8, 2, 1); return; }
  if (stage === 2) { R(g, g3, 7, 6, 2, 7); R(g, g1, 4, 7, 3, 2); R(g, g1, 9, 7, 3, 2); R(g, g2, 5, 6, 2, 1); R(g, g2, 9, 6, 2, 1); return; }
  if (stage === 3) { R(g, g3, 7, 4, 2, 9); R(g, g1, 3, 6, 4, 3); R(g, g1, 9, 6, 4, 3); R(g, g2, 4, 5, 3, 1); R(g, g2, 9, 5, 3, 1); R(g, g1, 5, 3, 2, 2); R(g, g1, 9, 3, 2, 2); return; }
  R(g, g3, 7, 4, 2, 9); R(g, g1, 3, 5, 4, 3); R(g, g1, 9, 5, 4, 3); R(g, g2, 4, 4, 3, 1); R(g, g2, 9, 4, 3, 1);
  if (c.id === 'radish') { R(g, c.col, 5, 11, 3, 3); R(g, '#e87a90', 5, 11, 1, 1); R(g, c.col, 9, 11, 3, 3); R(g, '#e87a90', 9, 11, 1, 1); }
  else if (c.id === 'potato') { R(g, '#f0e6a0', 6, 3, 2, 2); R(g, '#f0e6a0', 10, 5, 2, 2); R(g, c.col, 5, 12, 3, 2); R(g, c.col, 9, 12, 3, 2); }
  else { R(g, c.col, 4, 7, 3, 3); R(g, '#f27a6a', 4, 7, 1, 1); R(g, c.col, 10, 8, 3, 3); R(g, '#f27a6a', 10, 8, 1, 1); R(g, c.col, 6, 11, 3, 3); R(g, '#f27a6a', 6, 11, 1, 1); }
}

/* ---------- Icons (used in the hotbar, bag, crafting and as dropped items) ---------- */
function drawIcon(name, x, y, s) {
  const u = s / 16, col = ITEM_COL[name] || '#cccccc';
  const q = (c, ax, ay, w, h) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x + ax * u), Math.round(y + ay * u), Math.max(1, Math.round(w * u)), Math.max(1, Math.round(h * u))); };
  const k = iconKind(name), dark = '#1c1410', wood = '#7a5a30';
  switch (k) {
    case 'axe': q(wood, 7, 3, 2, 12); q(col, 3, 2, 7, 5); q('#f0f0f6', 3, 2, 2, 5); q(dark, 3, 6, 7, 1); break;
    case 'pickaxe': q(wood, 7, 4, 2, 11); q(col, 2, 3, 12, 2); q(col, 2, 4, 2, 3); q(col, 12, 4, 2, 3); q('#f0f0f6', 2, 3, 12, 1); break;
    case 'hoe': q(wood, 7, 3, 2, 12); q(col, 7, 2, 7, 2); q(col, 12, 3, 2, 4); q('#f0f0f6', 7, 2, 7, 1); break;
    case 'can': q(col, 3, 6, 9, 8); q('#a9bbd0', 3, 6, 9, 2); q(col, 11, 4, 4, 2); q(col, 2, 5, 2, 6); q(dark, 4, 10, 7, 1);
      { const s2 = selItemFor(name); if (s2 && s2.water > 0) q('#4aa3c8', 4, 8, 7, 2); } break;
    case 'melee': q(col, 7, 1, 3, 9); q('#f0f0f6', 7, 1, 1, 9); q('#6b4a2b', 4, 10, 9, 2); q('#3b2a1c', 7, 12, 3, 4); break;
    case 'pistol': q('#3a3a42', 2, 6, 11, 3); q(col, 3, 6, 10, 1); q('#2a2a30', 12, 5, 3, 2); q('#3b2a1c', 3, 9, 4, 5); q('#1c1c20', 8, 9, 2, 2); break;
    case 'ammo': q('#b87333', 3, 5, 3, 9); q('#d6a84a', 3, 8, 3, 6); q('#b87333', 7, 5, 3, 9); q('#d6a84a', 7, 8, 3, 6); q('#b87333', 11, 5, 3, 9); q('#d6a84a', 11, 8, 3, 6); break;
    case 'head': q(col, 4, 3, 8, 6); q(shade(col, 25), 4, 3, 8, 1); q(col, 3, 7, 10, 4); q(dark, 5, 8, 6, 1); q(shade(col, -30), 3, 10, 10, 1); break;
    case 'body': q(col, 3, 3, 10, 11); q(col, 1, 3, 3, 5); q(col, 12, 3, 3, 5); q(shade(col, 25), 3, 3, 10, 1); q(shade(col, -30), 3, 12, 10, 2); q(dark, 7, 3, 2, 3); break;
    case 'legs': q(col, 4, 2, 8, 4); q(col, 4, 6, 3, 8); q(col, 9, 6, 3, 8); q(shade(col, 25), 4, 2, 8, 1); q(shade(col, -30), 4, 12, 3, 2); q(shade(col, -30), 9, 12, 3, 2); break;
    case 'feet': q(col, 2, 6, 5, 7); q(col, 9, 6, 5, 7); q(shade(col, -35), 2, 12, 5, 2); q(shade(col, -35), 9, 12, 5, 2); q(shade(col, 25), 2, 6, 5, 1); q(shade(col, 25), 9, 6, 5, 1); break;
    case 'acc': q('#6a6a74', 7, 2, 2, 3); q(col, 5, 5, 6, 7); q(shade(col, 30), 5, 5, 6, 1); q(dark, 7, 7, 2, 3); break;
    case 'seed': q('#d8cdb5', 4, 3, 8, 11); q('#efe6cf', 4, 3, 8, 2); q(col, 5, 6, 6, 5); q(dark, 6, 7, 4, 1); break;
    case 'produce': q(col, 4, 6, 8, 8); q(col, 5, 5, 6, 10); q(shade(col, 40), 5, 6, 2, 2); q('#4f8a3a', 7, 2, 2, 4); q('#6fae4a', 9, 3, 3, 2); break;
    case 'tin': q(col, 4, 4, 8, 10); q('#d8d8d0', 4, 6, 8, 3); q('#c0392b', 5, 7, 6, 1); q('#8a8a82', 4, 4, 8, 1); break;
    case 'med': q('#e8e0d0', 6, 2, 4, 3); q(col, 4, 5, 8, 9); q(shade(col, 40), 4, 5, 8, 2); q('#ffffff', 6, 8, 4, 1); q('#ffffff', 7, 7, 2, 3); break;
    default: q(col, 3, 7, 10, 7); q(shade(col, 35), 3, 7, 10, 3); q(shade(col, -35), 3, 13, 10, 1); q(shade(col, -20), 9, 10, 4, 4);
  }
}
function selItemFor(name) { const s = selItem(); return s && s.name === name ? s : null; }

