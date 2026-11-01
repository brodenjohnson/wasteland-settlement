/* =====================================================================
   ART PASS 2: graded palette, dithered shadows, big trees, decor, coloured outlines
   ===================================================================== */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function bay(x, y) { return BAYER[((y & 3) << 2) | (x & 3)] / 16; }
function vnoise(x, y, s) {
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
  const a = hash2(x0, y0, s), b = hash2(x0 + 1, y0, s), c = hash2(x0, y0 + 1, s), d = hash2(x0 + 1, y0 + 1, s);
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function makeSprite(key, w, h, paint, outline) {
  if (spriteCache[key]) return spriteCache[key];
  const cv = document.createElement('canvas');
  cv.width = w + 2; cv.height = h + 2;
  const c = cv.getContext('2d');
  c.translate(1, 1);
  paint(c);
  c.setTransform(1, 0, 0, 1, 0, 0);
  if (outline !== false) {
    const W2 = cv.width, H2 = cv.height;
    const img = c.getImageData(0, 0, W2, H2), d = img.data;
    const out = new Uint8ClampedArray(d);
    for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) {
      const i = (y * W2 + x) * 4;
      if (d[i + 3] > 0) continue;
      let r = 0, g = 0, b = 0, n = 0;
      const take = j => { if (d[j + 3] > 0) { r += d[j]; g += d[j + 1]; b += d[j + 2]; n++; } };
      if (x > 0) take(i - 4);
      if (x < W2 - 1) take(i + 4);
      if (y > 0) take(i - W2 * 4);
      if (y < H2 - 1) take(i + W2 * 4);
      if (n) { out[i] = (r / n) * 0.34; out[i + 1] = (g / n) * 0.3; out[i + 2] = Math.min(255, (b / n) * 0.42 + 16); out[i + 3] = 240; }
    }
    img.data.set(out);
    c.putImageData(img, 0, 0);
  }
  spriteCache[key] = cv;
  return cv;
}

function shadowAt(cx, cy, w) {
  const key = 'sh|' + w;
  let cv = spriteCache[key];
  if (!cv) {
    const h = Math.max(4, Math.round(w * 0.4));
    cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const g = cv.getContext('2d');
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const dx = (x + 0.5 - w / 2) / (w / 2), dy = (y + 0.5 - h / 2) / (h / 2), d = dx * dx + dy * dy;
      if (d > 1) continue;
      if (d > 0.5 && ((x + y) & 1)) continue;
      g.fillStyle = d > 0.5 ? 'rgba(18,30,46,0.24)' : 'rgba(18,30,46,0.36)';
      g.fillRect(x, y, 1, 1);
    }
    spriteCache[key] = cv;
  }
  ctx.drawImage(cv, Math.round(cx - cv.width / 2) + 2, Math.round(cy - cv.height / 2 + 1));
}

/* ---------- Ground: warm khaki highlights, cool dithered shadows, dappled light ---------- */
PAL[T.GROUND] = ['#8c8650', '#948e55', '#827c4a', '#9c965c', '#767043'];
PAL[T.DIRT]   = ['#5a3c2a', '#634331', '#52362a', '#6c4a36', '#472e22'];
PAL[T.WATER]  = ['#3f7a3a', '#478640', '#397036', '#4e9246', '#33632f'];
PAL[T.ROAD]   = ['#3e4048', '#44464e', '#383a42', '#4a4c55', '#32343b'];
PAL[T.GRASS]  = ['#4f8a4a', '#5a9650', '#467d43', '#66a05a', '#3d6e3c'];

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
          if (nt !== t && nt !== T.RUBBLE && bay(px, py) < (4 - m) / 7) t = nt;
        }
      }
      const P = pal[t];
      const cn = hash2(px >> 2, py >> 2, 3), fn = hash2(px, py, 11);
      let idx = cn < 0.2 ? 4 : cn < 0.45 ? 2 : cn < 0.7 ? 0 : cn < 0.9 ? 1 : 3;
      if (fn > 0.94) idx = (idx + 1) % 5; else if (fn < 0.04) idx = (idx + 4) % 5;
      let r = P[idx][0], gg = P[idx][1], b = P[idx][2];
      if (t === T.GROUND || t === T.GRASS || t === T.DIRT || t === T.ROAD) {
        const n1 = vnoise(px / 26, py / 26, 5) * 0.62 + vnoise(px / 10, py / 10, 6) * 0.38;
        const th = bay(px, py) * 0.09 - 0.045;
        const k = t === T.DIRT ? 0.5 : 1;
        if (n1 > 0.625 + th) { r = r * (1 - 0.22 * k); gg = gg * (1 - 0.15 * k); b = b * (1 - 0.08 * k) + 12 * k; }
        else if (n1 > 0.58 + th) { r = r * (1 - 0.1 * k); gg = gg * (1 - 0.06 * k); b = b * (1 - 0.03 * k) + 6 * k; }
        else if (t === T.GRASS && n1 < 0.34 + th) { r = r * 1.1 + 12; gg = gg * 1.08 + 10; b = b * 0.92; }
        else if (t === T.GROUND && n1 < 0.3 + th) { r = r * 1.07 + 8; gg = gg * 1.06 + 6; b = b * 0.94; }
      }
      const o = (py * GW + px) * 4;
      d[o] = r > 255 ? 255 : r; d[o + 1] = gg > 255 ? 255 : gg; d[o + 2] = b > 255 ? 255 : b; d[o + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);

  for (let ty = 0; ty < H; ty++) for (let tx = 0; tx < W; tx++) {
    const i = ty * W + tx, t = tiles[i], x = tx * TS, y = ty * TS;
    const a = hash2(tx, ty, 21), b = hash2(tx, ty, 22), c2 = hash2(tx, ty, 23), e = hash2(tx, ty, 24);
    const ox = 2 + Math.floor(b * 10), oy = 3 + Math.floor(c2 * 9);
    if (t === T.GROUND) {
      if (a < 0.14) { R(g, 'rgba(20,30,40,0.3)', x + ox, y + oy + 1, 4, 1); R(g, '#8c8a78', x + ox, y + oy, 3, 1); R(g, '#a8a690', x + ox, y + oy, 1, 1); R(g, '#6a6858', x + ox + 2, y + oy, 1, 1); }
      else if (a < 0.22) { R(g, '#5a6a38', x + ox, y + oy, 1, 3); R(g, '#7a8a4a', x + ox + 1, y + oy + 1, 1, 2); R(g, '#4a5a30', x + ox - 1, y + oy + 1, 1, 2); R(g, '#9aa65a', x + ox, y + oy, 1, 1); }
      else if (a < 0.26) { R(g, 'rgba(24,18,12,0.35)', x + ox, y + oy, 5, 1); R(g, 'rgba(24,18,12,0.3)', x + ox + 4, y + oy + 1, 1, 3); R(g, 'rgba(24,18,12,0.25)', x + ox + 2, y + oy + 2, 1, 2); }
      else if (a < 0.275) { R(g, '#e0d6bc', x + ox, y + oy, 3, 1); R(g, '#bfb59c', x + ox + 2, y + oy + 1, 1, 1); R(g, '#e0d6bc', x + ox + 3, y + oy - 1, 1, 1); }
      else if (a < 0.29) { R(g, '#b8bcc4', x + ox, y + oy, 2, 1); R(g, '#d8dce4', x + ox, y + oy, 1, 1); }
      if (e < 0.08) { R(g, 'rgba(255,240,170,0.16)', x + ox - 1, y + oy, 6, 2); }
    } else if (t === T.DIRT) {
      if (a < 0.2) { R(g, 'rgba(0,0,0,0.28)', x + ox, y + oy + 1, 4, 1); R(g, '#7a5842', x + ox, y + oy, 3, 1); R(g, '#8a6a52', x + ox, y + oy, 1, 1); }
      if (b < 0.06) { R(g, '#6a8a4a', x + ox, y + oy, 1, 2); }
    } else if (t === T.GRASS) {
      if (a < 0.45) { R(g, '#8fc468', x + ox, y + oy, 1, 3); R(g, '#a8d880', x + ox + 1, y + oy + 1, 1, 2); R(g, '#356a34', x + ox - 1, y + oy + 2, 1, 1); }
      if (b < 0.09) { R(g, '#f4eaa6', x + ox, y + oy, 1, 1); R(g, '#e07a9a', x + ox + 3, y + oy + 2, 1, 1); R(g, '#9ad0f0', x + ox - 2, y + oy + 1, 1, 1); }
    } else if (t === T.ROAD) {
      if (a < 0.2) { R(g, 'rgba(0,0,0,0.4)', x + ox, y + oy, 1, 4); R(g, 'rgba(0,0,0,0.4)', x + ox + 1, y + oy + 3, 3, 1); }
      if (b < 0.1) R(g, 'rgba(255,255,255,0.1)', x + ox, y + oy, 3, 1);
      if (c2 < 0.05) { R(g, '#5a5a62', x + ox, y + oy, 2, 2); }
      if (ty === 41 && tiles[i - W] === T.ROAD && tx % 2 === 0) R(g, 'rgba(226,200,96,0.55)', x + 2, y, 10, 1);
    }
  }

  for (let ty = 0; ty < H; ty++) for (let tx = 0; tx < W; tx++) {
    if (tiles[ty * W + tx] !== T.RUBBLE) continue;
    const x = tx * TS, y = ty * TS;
    const southOpen = ty + 1 < H && tiles[(ty + 1) * W + tx] !== T.RUBBLE;
    const topH = southOpen ? 10 : 16;
    R(g, '#68645f', x, y, TS, topH);
    R(g, '#7e7a74', x, y, TS, 2);
    R(g, '#59554f', x, y + 2, TS, 1);
    for (let k = 0; k < 3; k++) R(g, 'rgba(0,0,0,0.2)', x, y + 3 + k * 4, TS, 1);
    const off = (ty & 1) * 4;
    for (let k = 0; k < 3; k++) R(g, 'rgba(0,0,0,0.18)', x + ((k * 6 + off + tx * 3) % 14), y + 2 + k * 4, 1, 4);
    if (hash2(tx, ty, 31) < 0.45) R(g, '#8c8880', x + 3 + Math.floor(hash2(tx, ty, 32) * 8), y + 1, 3, 2);
    if (hash2(tx, ty, 35) < 0.18) { R(g, '#5f8a4a', x + 2 + Math.floor(hash2(tx, ty, 36) * 10), y, 3, 1); R(g, '#7aaa5a', x + 3 + Math.floor(hash2(tx, ty, 36) * 10), y, 1, 1); }
    if (southOpen) {
      R(g, '#403c3a', x, y + 10, TS, 6);
      R(g, '#524e4a', x, y + 10, TS, 1);
      for (let k = 0; k < 2; k++) R(g, 'rgba(0,0,0,0.28)', x, y + 12 + k * 3, TS, 1);
      R(g, 'rgba(0,0,0,0.22)', x + ((tx * 5) % 12), y + 11, 1, 3);
      R(g, 'rgba(20,34,52,0.34)', x, y + TS, TS, 3);
      R(g, 'rgba(20,34,52,0.2)', x, y + TS + 3, TS, 2);
      if (hash2(tx, ty, 33) < 0.3) { R(g, '#4a7a4a', x + 2 + Math.floor(hash2(tx, ty, 34) * 10), y + 13, 2, 2); R(g, '#6a9a5a', x + 2 + Math.floor(hash2(tx, ty, 34) * 10), y + 13, 1, 1); }
    }
  }
}

/* ---------- Bigger, more detailed trees ---------- */
function paintTree(c, v) {
  c.save();
  if (v & 1) { c.translate(24, 0); c.scale(-1, 1); }
  R(c, '#33241a', 7, 28, 11, 4); R(c, '#4a3626', 8, 27, 9, 2);
  R(c, '#4a3626', 10, 12, 5, 17); R(c, '#6e5238', 10, 12, 2, 17); R(c, '#2c1e14', 14, 14, 1, 15); R(c, '#241810', 13, 18, 2, 11);
  R(c, '#8a6a4a', 10, 12, 1, 6); R(c, '#2c1e14', 11, 20, 2, 2); R(c, '#2c1e14', 12, 24, 1, 2);
  const br = '#4a3626', brL = '#6e5238', brD = '#2c1e14';
  R(c, br, 8, 16, 3, 1); R(c, br, 6, 15, 2, 1); R(c, br, 4, 13, 2, 2); R(c, br, 3, 11, 2, 2); R(c, br, 2, 8, 1, 3);
  R(c, brL, 6, 15, 2, 1); R(c, brL, 4, 13, 1, 1); R(c, br, 5, 9, 1, 4); R(c, br, 6, 9, 2, 1);
  R(c, br, 14, 14, 2, 1); R(c, br, 16, 13, 2, 1); R(c, br, 18, 11, 2, 2); R(c, br, 20, 9, 2, 2); R(c, br, 21, 6, 1, 3);
  R(c, brD, 16, 14, 2, 1); R(c, br, 17, 9, 1, 3); R(c, br, 15, 8, 2, 1);
  R(c, br, 11, 7, 3, 6); R(c, brL, 11, 7, 1, 6); R(c, br, 10, 5, 1, 3); R(c, br, 14, 4, 1, 4); R(c, br, 12, 2, 1, 5); R(c, brL, 12, 2, 1, 2);
  R(c, '#5f8a6a', 4, 14, 4, 2); R(c, '#78a884', 4, 14, 2, 1); R(c, '#4a7058', 5, 16, 1, 3); R(c, '#4a7058', 7, 16, 1, 2);
  R(c, '#5f8a6a', 17, 12, 3, 2); R(c, '#78a884', 17, 12, 1, 1); R(c, '#4a7058', 18, 14, 1, 2);
  R(c, '#c8803a', 19, 8, 2, 1); R(c, '#e0a050', 3, 9, 1, 1); R(c, '#c8803a', 9, 4, 1, 1); R(c, '#d89a4a', 16, 6, 1, 1); R(c, '#a8601e', 6, 7, 1, 1);
  R(c, '#6a8a4a', 10, 24, 2, 2); R(c, '#8aaa5a', 10, 24, 1, 1);
  c.restore();
}
function tri(c, cx, top, h, hw, c1, c2, c3) {
  for (let r = 0; r < h; r++) {
    const w = Math.max(1, Math.round(hw * (r + 1) / h)) * 2 + 1, x = cx - Math.floor(w / 2), sh = Math.max(1, Math.floor(w / 3));
    R(c, c1, x, top + r, w, 1);
    R(c, c2, x, top + r, sh, 1);
    R(c, c3, x + w - sh, top + r, sh, 1);
    if (r % 2 === 0 && w > 4) { R(c, c2, x + sh + 1, top + r, 1, 1); R(c, c3, x + w - sh - 2, top + r, 1, 1); }
  }
}
function paintPine(c, v) {
  const pals = [['#2f6a4a', '#4a9a62', '#1f4a36'], ['#336e3a', '#58a850', '#234e2c'], ['#2c6458', '#4a9a86', '#1e463e'], ['#a8602a', '#d89a48', '#6a3a1a']];
  const [c1, c2, c3] = pals[v % 4];
  R(c, '#4a3220', 11, 25, 3, 7); R(c, '#6a4a30', 11, 25, 1, 7); R(c, '#33241a', 13, 27, 1, 5);
  R(c, '#33241a', 9, 30, 7, 2);
  tri(c, 12, 20, 8, 8, c1, c2, c3);
  tri(c, 12, 14, 8, 7, c1, c2, c3);
  tri(c, 12, 8, 8, 6, c1, c2, c3);
  tri(c, 12, 2, 8, 4, c1, c2, c3);
  R(c, c2, 12, 1, 1, 2);
}
function paintRock(c) {
  R(c, '#4a4740', 3, 11, 10, 4); R(c, '#7a7770', 3, 8, 10, 5); R(c, '#8d8a83', 5, 5, 6, 5); R(c, '#a39f97', 6, 5, 3, 1);
  R(c, '#5f5c56', 3, 12, 10, 2); R(c, '#6a675f', 9, 8, 3, 4); R(c, '#aaa69d', 5, 6, 1, 3);
  R(c, '#6b8a5a', 5, 5, 3, 1); R(c, '#58784a', 4, 6, 2, 1); R(c, '#7aa068', 6, 5, 1, 1); R(c, '#3a3834', 8, 9, 1, 3); R(c, '#3a3834', 7, 11, 2, 1);
}

/* ---------- Player: green jacket, orange pack, scarf ---------- */
function paintPlayer(c, dir, frame, look) {
  const skin = '#e8bc90', skinD = '#c99a72', hair = '#3a2418', hairL = '#5a3a28';
  const jacket = look.body || '#4f7a52', jD = shade(jacket, -34), jL = shade(jacket, 22);
  const pants = look.legs || '#3f4a5e', pD = shade(pants, -28);
  const boots = look.feet || '#3a2e28', pack = '#d8702a', packD = '#a8501e', packL = '#f09a50', scarf = '#e8c24a';
  const l1 = frame === 1 ? 1 : 0, l3 = frame === 3 ? 1 : 0;
  const helm = () => { if (look.head) { R(c, look.head, 3, 0, 9, 3); R(c, shade(look.head, -35), 3, 3, 9, 1); R(c, shade(look.head, 28), 4, 0, 6, 1); } };
  if (dir < 2) {
    R(c, pants, 4, 13, 3, 5 - l1); R(c, pD, 6, 13, 1, 5 - l1); R(c, pants, 8, 13, 3, 5 - l3); R(c, pD, 10, 13, 1, 5 - l3);
    R(c, boots, 4, 18 - l1, 3, 2); R(c, shade(boots, 26), 4, 18 - l1, 3, 1); R(c, boots, 8, 18 - l3, 3, 2); R(c, shade(boots, 26), 8, 18 - l3, 3, 1);
    if (dir === 1) {
      R(c, jacket, 3, 7, 9, 7); R(c, jD, 3, 13, 9, 1);
      R(c, pack, 3, 7, 9, 7); R(c, packL, 3, 7, 9, 1); R(c, packL, 3, 8, 1, 5); R(c, packD, 3, 13, 9, 1); R(c, packD, 11, 8, 1, 5);
      R(c, packD, 4, 10, 7, 1); R(c, '#e8d8b0', 5, 6, 5, 1); R(c, '#c8b88a', 5, 7, 5, 1);
      R(c, jD, 1, 8, 2, 5); R(c, jD, 12, 8, 2, 5); R(c, skin, 1, 13, 2, 2); R(c, skin, 12, 13, 2, 2);
      R(c, scarf, 4, 6, 7, 1);
      R(c, skin, 4, 1, 7, 6); R(c, hair, 4, 1, 7, 6); R(c, hairL, 5, 1, 4, 1); R(c, skinD, 5, 6, 5, 1);
    } else {
      R(c, jacket, 3, 7, 9, 7); R(c, jL, 3, 7, 9, 1); R(c, jL, 3, 8, 1, 5); R(c, jD, 11, 8, 1, 5); R(c, jD, 3, 13, 9, 1);
      R(c, jD, 4, 10, 3, 1); R(c, '#3b2a1c', 3, 12, 9, 1); R(c, '#d6a84a', 7, 12, 1, 1);
      R(c, packD, 5, 7, 1, 6); R(c, packD, 9, 7, 1, 6); R(c, pack, 12, 8, 1, 3); R(c, pack, 2, 8, 1, 3);
      R(c, jacket, 1, 8, 2, 5); R(c, jD, 1, 8, 1, 5); R(c, jacket, 12, 8, 2, 5); R(c, jD, 13, 8, 1, 5);
      R(c, skin, 1, 13, 2, 2); R(c, skin, 12, 13, 2, 2);
      R(c, scarf, 4, 6, 7, 2); R(c, shade(scarf, -50), 4, 7, 7, 1);
      R(c, skin, 4, 1, 7, 6); R(c, skinD, 5, 6, 5, 1);
      R(c, hair, 4, 1, 7, 2); R(c, hair, 4, 3, 1, 3); R(c, hair, 10, 3, 1, 3); R(c, hairL, 5, 1, 4, 1); R(c, hair, 5, 3, 2, 1);
      R(c, '#241810', 5, 4, 1, 1); R(c, '#241810', 9, 4, 1, 1); R(c, '#b07a5c', 7, 5, 1, 1);
    }
    helm();
  } else {
    c.save();
    if (dir === 2) { c.translate(14, 0); c.scale(-1, 1); }
    R(c, pants, 5 - l1, 13, 3, 5); R(c, pD, 7 - l1, 13, 1, 5); R(c, pants, 7 + l3, 13, 3, 5); R(c, pD, 9 + l3, 13, 1, 5);
    R(c, boots, 5 - l1, 18, 4, 2); R(c, shade(boots, 26), 5 - l1, 18, 4, 1); R(c, boots, 7 + l3, 18, 4, 2); R(c, shade(boots, 26), 7 + l3, 18, 4, 1);
    R(c, pack, 1, 7, 4, 7); R(c, packL, 1, 7, 4, 1); R(c, packL, 1, 8, 1, 5); R(c, packD, 1, 13, 4, 1); R(c, packD, 2, 10, 3, 1); R(c, '#e8d8b0', 1, 6, 4, 1);
    R(c, jacket, 4, 7, 7, 7); R(c, jL, 4, 7, 7, 1); R(c, jD, 4, 13, 7, 1); R(c, jD, 10, 8, 1, 5); R(c, '#3b2a1c', 4, 12, 7, 1); R(c, '#d6a84a', 9, 12, 1, 1);
    R(c, jacket, 6, 8, 3, 5); R(c, jD, 6, 8, 1, 5); R(c, skin, 6, 13, 3, 2);
    R(c, scarf, 4, 6, 7, 2); R(c, shade(scarf, -50), 4, 7, 7, 1);
    R(c, skin, 4, 1, 7, 6); R(c, skinD, 4, 6, 7, 1);
    R(c, hair, 4, 1, 5, 3); R(c, hair, 4, 3, 2, 3); R(c, hairL, 5, 1, 3, 1); R(c, hair, 8, 2, 2, 1);
    R(c, '#241810', 9, 4, 1, 1); R(c, '#b07a5c', 11, 4, 1, 1); R(c, skinD, 8, 5, 1, 1);
    if (look.head) { R(c, look.head, 3, 0, 8, 3); R(c, shade(look.head, -35), 3, 3, 8, 1); R(c, shade(look.head, 28), 4, 0, 5, 1); }
    c.restore();
  }
}

/* ---------- Object sprite table ---------- */
OBJ_SPR[O.TREE] = { w: 24, h: 32, nv: 2, sw: 18, paint: paintTree };
OBJ_SPR[O.PINE] = { w: 24, h: 32, nv: 4, sw: 18, paint: paintPine };
function drawObject(kind, tx, ty, s) {
  const spec = OBJ_SPR[kind];
  if (!spec) return;
  const w = spec.w || 16, nv = spec.nv || 2, v = s % nv;
  const spr = makeSprite('o|' + kind + '|' + v, w, spec.h, c => spec.paint(c, v));
  shadowAt(tx * TS + 8, ty * TS + 13, spec.sw || 14);
  ctx.drawImage(spr, tx * TS - 1 - (w - 16) / 2, ty * TS - (spec.h - 16) - 1);
}

/* ---------- Decor: swaying grass, ferns, flowers, wasteland clutter ---------- */
const decor = [];
function paintGrass(c, v, fr, dry) {
  const cols = dry ? ['#6a6a3a', '#8e8e4c', '#b4b266'] : ['#2f6a3c', '#4f9a4a', '#86cc66'];
  const sets = [[[1, 7, 4], [3, 7, 6], [5, 7, 5], [7, 7, 3]], [[0, 7, 3], [2, 7, 5], [4, 7, 7], [6, 7, 4], [8, 7, 3]], [[1, 7, 5], [3, 7, 3], [5, 7, 6], [7, 7, 4]]];
  for (const [x, y0, h] of sets[v % 3]) for (let k = 0; k < h; k++) {
    const px = x + (k >= h - 2 && fr ? 1 : 0);
    R(c, k >= h - 1 ? cols[2] : k > h / 2 ? cols[1] : cols[0], px, y0 - k, 1, 1);
  }
}
function paintFern(c, v, fr) {
  const a = '#2f6a3c', b = '#4f9a4a', l = '#86cc66', s = fr ? 1 : 0;
  R(c, a, 5, 7, 1, 1); R(c, b, 4, 6, 3, 1); R(c, l, 3 + s, 5, 2, 1); R(c, l, 6 + s, 5, 2, 1); R(c, b, 2, 6, 2, 1); R(c, b, 7, 6, 2, 1);
  R(c, a, 1, 7, 3, 1); R(c, a, 7, 7, 3, 1); R(c, l, 5, 4, 1, 3); R(c, b, 4, 4 + s, 1, 1); R(c, b, 6, 4 + s, 1, 1);
}
function paintFlower(c, v) {
  const cols = ['#f4eaa6', '#e07a9a', '#9ad0f0'];
  R(c, '#3f7a3c', 3, 4, 1, 4); R(c, '#4f9a4a', 2, 6, 1, 1); R(c, cols[v % 3], 2, 2, 3, 2); R(c, '#fff4c0', 3, 3, 1, 1);
}
function paintDebris(c, v) {
  R(c, '#4a4744', 1, 6, 11, 3); R(c, '#7a766f', 1, 4, 5, 3); R(c, '#8c8880', 2, 4, 3, 1); R(c, '#6a665f', 6, 5, 5, 3);
  R(c, '#a8532a', 7, 3, 1, 3); R(c, '#c4703a', 7, 3, 1, 1); R(c, '#a8532a', 9, 2, 1, 4); R(c, '#58544e', 4, 7, 3, 1);
  if (v === 1) { R(c, '#8c8880', 8, 5, 3, 2); R(c, '#a39f97', 8, 5, 2, 1); }
}
function paintBarrel(c, v) {
  const col = v === 1 ? '#3a6a8a' : '#a8532a';
  R(c, '#2a2420', 0, 9, 9, 2); R(c, col, 0, 2, 9, 8); R(c, shade(col, 30), 1, 2, 2, 8); R(c, shade(col, -40), 6, 2, 2, 8);
  R(c, '#2a2a30', 0, 4, 9, 1); R(c, '#2a2a30', 0, 7, 9, 1); R(c, '#6a8a2a', 1, 1, 7, 2); R(c, '#a6e04a', 2, 1, 3, 1);
}
function paintTyre(c) {
  R(c, '#24242a', 1, 3, 9, 6); R(c, '#34343c', 2, 3, 7, 1); R(c, '#14141a', 4, 5, 3, 2); R(c, '#4a4a54', 2, 8, 6, 1);
}
function paintSign(c) {
  R(c, '#4a3320', 4, 6, 2, 8); R(c, '#7a5a30', 0, 1, 10, 6); R(c, '#9a7440', 0, 1, 10, 1); R(c, '#3b2a1c', 1, 3, 6, 1); R(c, '#3b2a1c', 1, 5, 4, 1);
  R(c, '#c0392b', 7, 3, 2, 2);
}
const DECOR_SPR = {
  grass: { w: 9, h: 8, nv: 3, anim: true, outline: false, paint: (c, v, f) => paintGrass(c, v, f, false) },
  dry: { w: 9, h: 8, nv: 3, anim: true, outline: false, paint: (c, v, f) => paintGrass(c, v, f, true) },
  fern: { w: 11, h: 8, nv: 1, anim: true, outline: false, paint: paintFern },
  flower: { w: 6, h: 8, nv: 3, outline: false, paint: paintFlower },
  debris: { w: 13, h: 10, nv: 2, outline: true, paint: paintDebris },
  barrel: { w: 10, h: 12, nv: 2, outline: true, paint: paintBarrel },
  tyre: { w: 11, h: 10, nv: 1, outline: true, paint: paintTyre },
  sign: { w: 11, h: 15, nv: 1, outline: true, paint: paintSign }
};
function decorSprite(kind, v, fr) {
  const sp = DECOR_SPR[kind];
  return makeSprite('d|' + kind + '|' + v + '|' + fr, sp.w, sp.h, c => sp.paint(c, v, fr), sp.outline);
}
function makeDecor() {
  const nearRuin = (tx, ty) => ruins.some(r => tx >= r.x0 - 3 && tx <= r.x0 + r.w + 2 && ty >= r.y0 - 3 && ty <= r.y0 + r.h + 2);
  for (let ty = 1; ty < H - 1; ty++) for (let tx = 1; tx < W - 1; tx++) {
    const i = ty * W + tx, t = tiles[i];
    if (objs[i] || structs.has(i) || t === T.WATER || t === T.SPRING || t === T.RUBBLE) continue;
    const r = hash2(tx, ty, 51), r2 = hash2(tx, ty, 52), r3 = hash2(tx, ty, 53), r4 = hash2(tx, ty, 54);
    const x = tx * TS + 4 + Math.floor(r2 * 8), y = ty * TS + 8 + Math.floor(r3 * 8);
    let kind = null;
    if (t === T.GRASS) kind = r < 0.7 ? 'grass' : r < 0.8 ? 'fern' : r < 0.88 ? 'flower' : null;
    else if (t === T.GROUND && radMap[i] > -0.9) {
      const near = nearRuin(tx, ty);
      kind = r < 0.17 ? 'dry' : r < (near ? 0.205 : 0.182) ? 'debris' : r < (near ? 0.217 : 0.185) ? 'barrel' : r < (near ? 0.227 : 0.187) ? 'tyre' : r < (near ? 0.232 : 0.188) ? 'sign' : null;
    } else if (t === T.ROAD) kind = r < 0.05 ? 'debris' : r < 0.07 ? 'tyre' : null;
    else if (t === T.DIRT && radMap[i] <= -0.9) kind = r < 0.025 ? 'dry' : null;
    if (kind) decor.push({ kind, x, y, v: Math.floor(r4 * 3), ph: r2 * 6 });
  }
}
function drawDecor(camX, camY, vw, vh, time) {
  for (const d of decor) {
    if (d.x < camX - 16 || d.x > camX + vw + 16 || d.y < camY - 4 || d.y > camY + vh + 20) continue;
    const sp = DECOR_SPR[d.kind];
    const fr = sp.anim ? Math.floor(time * 1.3 + d.ph) % 2 : 0;
    const spr = decorSprite(d.kind, d.v % sp.nv, fr);
    if (d.kind === 'barrel' || d.kind === 'tyre' || d.kind === 'sign' || d.kind === 'debris') shadowAt(d.x, d.y - 1, sp.w - 2);
    ctx.drawImage(spr, d.x - Math.round(spr.width / 2), d.y - spr.height + 1);
  }
}

/* ---------- Camp marker, now with a warm glow ---------- */
function drawBaseMarker(time) {
  const bx = BASE.x * TS, by = BASE.y * TS;
  ctx.drawImage(makeSprite('bed', 16, 16, paintBedroll), bx - 1, by - 1);
  const fx = (BASE.x + 2) * TS, fy = BASE.y * TS;
  shadowAt(fx + 8, fy + 14, 14);
  ctx.fillStyle = '#26211c'; ctx.fillRect(fx + 3, fy + 8, 10, 6);
  ctx.fillStyle = '#6a665f'; ctx.fillRect(fx + 2, fy + 10, 3, 3); ctx.fillRect(fx + 11, fy + 10, 3, 3); ctx.fillRect(fx + 5, fy + 12, 6, 2);
  ctx.fillStyle = '#8a8680'; ctx.fillRect(fx + 2, fy + 10, 3, 1); ctx.fillRect(fx + 11, fy + 10, 3, 1);
  ctx.fillStyle = '#4a3320'; ctx.fillRect(fx + 4, fy + 10, 8, 2);
  const fl = Math.floor(time * 8) % 4;
  ctx.fillStyle = '#d6451a'; ctx.fillRect(fx + 5, fy + 5 - fl % 2, 6, 6 + fl % 2);
  ctx.fillStyle = '#f26f21'; ctx.fillRect(fx + 6, fy + 4 - fl % 3, 4, 6 + fl % 3);
  ctx.fillStyle = '#ffd36b'; ctx.fillRect(fx + 7, fy + 6 - fl % 2, 2, 4);
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(fx + 8, fy + 8, 0, fx + 8, fy + 8, 30);
  g.addColorStop(0, 'rgba(255,150,60,' + (0.28 + 0.06 * Math.sin(time * 9)) + ')'); g.addColorStop(1, 'rgba(255,150,60,0)');
  ctx.fillStyle = g; ctx.fillRect(fx - 24, fy - 24, 64, 64);
  ctx.globalCompositeOperation = 'source-over';
}

/* ---------- Colour grade: warm light, cool shadow, vignette, faint scanlines ---------- */
let scanPat = null;
function drawGrade() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const W2 = canvas.width, H2 = canvas.height;
  ctx.globalCompositeOperation = 'soft-light';
  const g = ctx.createLinearGradient(0, 0, W2, H2);
  g.addColorStop(0, 'rgba(255,210,110,0.32)'); g.addColorStop(0.55, 'rgba(180,190,150,0.1)'); g.addColorStop(1, 'rgba(80,140,170,0.2)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W2, H2);
  ctx.globalCompositeOperation = 'source-over';
  const r = Math.hypot(W2, H2) / 2, v = ctx.createRadialGradient(W2 / 2, H2 / 2, r * 0.5, W2 / 2, H2 / 2, r);
  v.addColorStop(0, 'rgba(10,16,26,0)'); v.addColorStop(1, 'rgba(10,16,26,0.45)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W2, H2);
  if (!scanPat) {
    const sc = document.createElement('canvas'); sc.width = 2; sc.height = 3;
    const sg = sc.getContext('2d'); sg.fillStyle = 'rgba(0,0,0,0.07)'; sg.fillRect(0, 2, 2, 1);
    scanPat = ctx.createPattern(sc, 'repeat');
  }
  ctx.fillStyle = scanPat; ctx.fillRect(0, 0, W2, H2);
}

