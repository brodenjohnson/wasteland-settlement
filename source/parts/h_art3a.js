/* =====================================================================
   ART PASS 3a: zone-aware ground, cliffs, floors, tall walls, big trees
   ===================================================================== */
PAL[T.CLIFF] = ['#4a4540', '#524c46', '#433e39', '#5a534c', '#3a3631'];
PAL[T.FLOOR] = ['#6a5e50', '#726556', '#625748', '#7a6d5d', '#574d41'];
PAL[T.ASH] = ['#7a7a76', '#82827e', '#706f6c', '#8a8a86', '#64635f'];
PAL[T.RUBBLE] = ['#3e3a37', '#45413d', '#383431', '#4a4642', '#2f2c29'];
let waterDepth = null;

function buildGround() {
  const GW = W * TS, GH = H * TS;
  groundCv = document.createElement('canvas');
  groundCv.width = GW; groundCv.height = GH;
  const g = groundCv.getContext('2d');
  const img = g.createImageData(GW, GH), d = img.data;
  const pal = {};
  for (const k of Object.keys(PAL)) pal[k] = PAL[k].map(h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
  waterDepth = new Uint8Array(W * H);
  for (let ty = 0; ty < H; ty++) for (let tx = 0; tx < W; tx++) {
    const i = ty * W + tx;
    if (tiles[i] !== T.WATER && tiles[i] !== T.SPRING) continue;
    let best = 4;
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
      const nx = tx + dx, ny = ty + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const nt = tiles[ny * W + nx];
      if (nt !== T.WATER && nt !== T.SPRING) best = Math.min(best, Math.max(Math.abs(dx), Math.abs(dy)) - 1);
    }
    waterDepth[i] = Math.max(0, Math.min(3, best));
  }
  const soft = t => t === T.GROUND || t === T.GRASS || t === T.DIRT || t === T.ROAD || t === T.ASH;
  for (let py = 0; py < GH; py++) {
    for (let px = 0; px < GW; px++) {
      const tx = px >> 4, ty = py >> 4, ti = ty * W + tx;
      let t = tiles[ti];
      const lx = px & 15, ly = py & 15;
      const m = Math.min(lx, 15 - lx, ly, 15 - ly);
      if (m < 4 && soft(t)) {
        let ntx = tx, nty = ty;
        if (m === lx) ntx--; else if (m === 15 - lx) ntx++; else if (m === ly) nty--; else nty++;
        if (ntx >= 0 && nty >= 0 && ntx < W && nty < H) {
          const nt = tiles[nty * W + ntx];
          if (nt !== t && (soft(nt) || nt === T.WATER) && bay(px, py) < (4 - m) / 7) t = nt;
        }
      }
      const P = pal[t];
      const cn = hash2(px >> 2, py >> 2, 3), fn = hash2(px, py, 11);
      let idx = cn < 0.2 ? 4 : cn < 0.45 ? 2 : cn < 0.7 ? 0 : cn < 0.9 ? 1 : 3;
      if (fn > 0.94) idx = (idx + 1) % 5; else if (fn < 0.04) idx = (idx + 4) % 5;
      let r = P[idx][0], gg = P[idx][1], b = P[idx][2];
      const z = zoneMap[ti];
      if (t === T.GROUND || t === T.GRASS || t === T.DIRT || t === T.ROAD || t === T.ASH) {
        const n1 = vnoise(px / 26, py / 26, 5) * 0.62 + vnoise(px / 10, py / 10, 6) * 0.38;
        const th = bay(px, py) * 0.09 - 0.045;
        const k = t === T.DIRT ? 0.5 : 1;
        const s1 = z === 2 ? 0.5 : 0.625, s2 = z === 2 ? 0.45 : 0.58;
        if (n1 > s1 + th) { r = r * (1 - 0.24 * k); gg = gg * (1 - 0.16 * k); b = b * (1 - 0.08 * k) + 12 * k; }
        else if (n1 > s2 + th) { r = r * (1 - 0.1 * k); gg = gg * (1 - 0.06 * k); b = b * (1 - 0.03 * k) + 6 * k; }
        else if (t === T.GRASS && n1 < 0.34 + th) { r = r * 1.1 + 12; gg = gg * 1.08 + 10; b = b * 0.92; }
        else if (t === T.GROUND && n1 < 0.3 + th) { r = r * 1.07 + 8; gg = gg * 1.06 + 6; b = b * 0.94; }
        if (z === 2 && t === T.GRASS) {
          const n3 = vnoise(px / 13, py / 13, 8);
          if (n3 > 0.72 + th) { r = r * 1.16 + 22; gg = gg * 1.14 + 20; b = b * 0.9 + 4; }
        }
      } else if (t === T.WATER || t === T.SPRING) {
        const dp = waterDepth[ti], f = 1 - 0.1 * dp;
        r *= f * 0.96; gg *= f; b = b * f + dp * 4;
      } else if (t === T.FLOOR) {
        const bx = tx >> 2, by = ty >> 2;
        if (hash2(bx, by, 37) < 0.55) { if (ly % 5 === 0) { r *= 0.78; gg *= 0.78; b *= 0.78; } else if ((px + (ly / 5 | 0) * 7) % 16 === 0) { r *= 0.8; gg *= 0.8; b *= 0.8; } }
        else if (lx === 0 || ly === 0) { r *= 0.82; gg *= 0.82; b *= 0.84; }
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
      if (e < 0.08) R(g, 'rgba(255,240,170,0.16)', x + ox - 1, y + oy, 6, 2);
    } else if (t === T.ASH) {
      if (a < 0.2) { R(g, 'rgba(0,0,0,0.25)', x + ox, y + oy + 1, 4, 1); R(g, '#a0a09a', x + ox, y + oy, 3, 1); }
      else if (a < 0.28) { R(g, '#2a2624', x + ox, y + oy, 5, 1); R(g, '#3a3430', x + ox + 4, y + oy - 1, 1, 2); }
      else if (a < 0.3) { R(g, '#d86a2a', x + ox, y + oy, 1, 1); R(g, 'rgba(255,140,40,0.3)', x + ox - 1, y + oy - 1, 3, 3); }
    } else if (t === T.DIRT) {
      if (a < 0.2) { R(g, 'rgba(0,0,0,0.28)', x + ox, y + oy + 1, 4, 1); R(g, '#7a5842', x + ox, y + oy, 3, 1); R(g, '#8a6a52', x + ox, y + oy, 1, 1); }
      if (b < 0.06) R(g, '#6a8a4a', x + ox, y + oy, 1, 2);
    } else if (t === T.GRASS) {
      if (a < 0.45) { R(g, '#8fc468', x + ox, y + oy, 1, 3); R(g, '#a8d880', x + ox + 1, y + oy + 1, 1, 2); R(g, '#356a34', x + ox - 1, y + oy + 2, 1, 1); }
      if (b < 0.09) { R(g, '#f4eaa6', x + ox, y + oy, 1, 1); R(g, '#e07a9a', x + ox + 3, y + oy + 2, 1, 1); R(g, '#9ad0f0', x + ox - 2, y + oy + 1, 1, 1); }
      if (zoneMap[i] === 2 && c2 < 0.12) { R(g, '#6a4a30', x + ox, y + oy, 4, 1); R(g, '#8a6a48', x + ox, y + oy, 2, 1); R(g, '#3a6a36', x + ox + 1, y + oy - 1, 2, 1); }
    } else if (t === T.ROAD) {
      if (a < 0.2) { R(g, 'rgba(0,0,0,0.4)', x + ox, y + oy, 1, 4); R(g, 'rgba(0,0,0,0.4)', x + ox + 1, y + oy + 3, 3, 1); }
      if (b < 0.1) R(g, 'rgba(255,255,255,0.1)', x + ox, y + oy, 3, 1);
      if (c2 < 0.05) R(g, '#5a5a62', x + ox, y + oy, 2, 2);
      if (tiles[i - W] === T.ROAD && tiles[i + W] === T.ROAD && tx % 2 === 0 && (ty % 7) === 0) R(g, 'rgba(226,200,96,0.5)', x + 2, y, 10, 1);
    } else if (t === T.FLOOR) {
      if (a < 0.1) R(g, 'rgba(20,14,10,0.3)', x + ox, y + oy, 4, 3);
      if (b < 0.07) { R(g, '#8a7a66', x + ox, y + oy, 3, 1); }
      if (c2 < 0.05) R(g, 'rgba(60,90,50,0.35)', x + ox, y + oy, 5, 3);
    } else if (t === T.CLIFF) {
      R(g, '#5c564f', x, y, TS, TS);
      for (let k = 0; k < 4; k++) R(g, hash2(tx, ty, 80 + k) < 0.5 ? '#6a645c' : '#46413b', x + Math.floor(hash2(tx, ty, 84 + k) * 12), y + k * 4, 4 + Math.floor(hash2(tx, ty, 88 + k) * 6), 2);
      const southOpen = ty + 1 < H && tiles[(ty + 1) * W + tx] !== T.CLIFF;
      const northOpen = ty > 0 && tiles[(ty - 1) * W + tx] !== T.CLIFF;
      if (northOpen) { R(g, '#7a746a', x, y, TS, 2); R(g, '#8a8478', x + 2, y, 5, 1); }
      if (southOpen) {
        R(g, '#38332e', x, y + 7, TS, 9); R(g, '#443e38', x, y + 7, TS, 1);
        for (let k = 0; k < 3; k++) R(g, 'rgba(0,0,0,0.3)', x + 2 + k * 5, y + 8, 1, 8);
        R(g, '#2c2824', x, y + 13, TS, 3);
        R(g, 'rgba(20,34,52,0.34)', x, y + TS, TS, 4);
        if (hash2(tx, ty, 96) < 0.3) R(g, '#4a7a4a', x + 2 + Math.floor(hash2(tx, ty, 97) * 10), y + 7, 3, 2);
      }
    }
    if (t === T.RUBBLE && ty + 1 < H && tiles[i + W] !== T.RUBBLE) {
      R(g, 'rgba(20,34,52,0.36)', x, y + TS, TS, 4);
      R(g, 'rgba(20,34,52,0.2)', x, y + TS + 4, TS, 3);
    }
  }
}

/* ---------- Tall wall sprites, drawn in the row pass so you can walk behind them ---------- */
function paintWall(c, v, front, low) {
  const brick = (x, y, w, h, base) => {
    R(c, base, x, y, w, h); R(c, shade(base, 16), x, y, w, 1); R(c, shade(base, -22), x, y + h - 1, w, 1);
  };
  if (!front) {
    R(c, '#7a756e', 0, 0, 16, 16); R(c, '#8a857c', 0, 0, 16, 2); R(c, '#68635c', 0, 14, 16, 2);
    for (let k = 0; k < 3; k++) R(c, 'rgba(0,0,0,0.16)', 2 + k * 5 + (v % 3), 2 + k * 4, 3, 1);
    if (v % 3 === 0) { R(c, '#8c8880', 5, 5, 4, 2); R(c, '#5f8a4a', 10, 1, 3, 1); }
    if (v % 5 === 0) { R(c, '#a8532a', 3, 2, 1, 3); R(c, '#c4703a', 3, 2, 1, 1); }
    return;
  }
  const top = low ? 18 : 8, faceH = 28 - top;
  if (!low) {
    R(c, '#7a756e', 0, 0, 16, 8); R(c, '#8a857c', 0, 0, 16, 2); R(c, '#9a958c', 2, 0, 5, 1); R(c, '#66615a', 0, 7, 16, 1);
    R(c, 'rgba(0,0,0,0.14)', 3 + (v % 4), 3, 4, 1); R(c, 'rgba(0,0,0,0.14)', 9, 5, 4, 1);
    if (v % 3 === 0) { R(c, '#5f8a4a', 4, 0, 4, 1); R(c, '#7aaa5a', 5, 0, 2, 1); }
    if (v % 4 === 1) { R(c, '#a8532a', 11, -1 + 1, 1, 4); R(c, '#c4703a', 11, 1, 1, 1); R(c, '#a8532a', 13, 2, 1, 3); }
  } else {
    R(c, '#7a756e', 1, 16, 14, 3); R(c, '#8a857c', 2, 15, 6, 2); R(c, '#8a857c', 9, 16, 5, 1); R(c, '#66615a', 1, 18, 14, 1);
    R(c, '#8c8880', 3, 14, 3, 2); R(c, '#a8532a', 12, 13, 1, 3); R(c, '#c4703a', 12, 13, 1, 1);
  }
  const rows = Math.floor(faceH / 5);
  for (let r = 0; r < rows + 1; r++) {
    const y = top + r * 5, h = Math.min(5, 28 - y);
    if (h <= 0) break;
    const off = (r + v) % 2 ? 4 : 0;
    for (let bx = -off; bx < 16; bx += 8) {
      const bw = Math.min(8, 16 - Math.max(0, bx)), x0 = Math.max(0, bx);
      const tone = ['#5e5953', '#66615a', '#57524c', '#6c675f'][(r * 3 + (bx + 16) / 8 + v) % 4 | 0];
      brick(x0, y, bw - (bx < 0 ? 0 : 0), h, tone);
    }
  }
  R(c, 'rgba(10,18,30,0.22)', 0, 24, 16, 4);
  if (!low && v % 4 === 2) {
    R(c, '#2a2723', 3, 12, 10, 8); R(c, '#14120f', 4, 13, 8, 6); R(c, '#7a756e', 2, 20, 12, 1); R(c, '#3a3633', 4, 13, 8, 1);
    R(c, '#2a2f38', 5, 14, 3, 4); R(c, '#4a5666', 5, 14, 1, 2);
  }
  if (v % 6 === 3) { R(c, '#4f8a3a', 2, top, 1, 8); R(c, '#4f8a3a', 3, top + 3, 1, 6); R(c, '#6fae4a', 2, top, 1, 2); R(c, '#4f8a3a', 12, top, 1, 5); }
  if (v % 7 === 4) { R(c, '#c0392b', 6, 14, 5, 1); R(c, '#e8c24a', 7, 16, 3, 1); }
  R(c, 'rgba(0,0,0,0.25)', 5 + (v % 5), top + 6, 1, 6);
}
function drawWall(tx, ty) {
  const i = ty * W + tx;
  const front = !(ty + 1 < H && tiles[i + W] === T.RUBBLE);
  const hv = Math.floor(hash2(tx, ty, 61) * 100), v = hv;
  const low = front && hash2(tx, ty, 62) > 0.84;
  const key = 'wl|' + front + '|' + (v % 7) + '|' + low;
  if (front) {
    const spr = makeSprite(key, 16, 28, c => paintWall(c, v % 7, true, low), true);
    ctx.drawImage(spr, tx * TS - 1, ty * TS - 12 - 1);
  } else {
    const spr = makeSprite(key, 16, 16, c => paintWall(c, v % 7, false, false), true);
    ctx.drawImage(spr, tx * TS - 1, ty * TS - 12 - 1);
  }
}

/* ---------- Trees: taller, with real presence ---------- */
function paintTree(c, v) {
  c.save();
  c.translate(0, 8);
  if (v & 1) { c.translate(28, 0); c.scale(-1, 1); }
  R(c, '#2c2018', 8, 28, 13, 4); R(c, '#4a3626', 9, 27, 11, 2); R(c, '#33241a', 6, 30, 4, 2); R(c, '#33241a', 19, 30, 4, 2);
  R(c, '#4a3626', 11, 12, 7, 17); R(c, '#6e5238', 11, 12, 2, 17); R(c, '#2c1e14', 16, 14, 2, 15); R(c, '#241810', 15, 18, 3, 11);
  R(c, '#8a6a4a', 11, 12, 1, 7); R(c, '#2c1e14', 13, 20, 2, 2); R(c, '#2c1e14', 14, 25, 1, 2);
  const br = '#4a3626', brL = '#6e5238', brD = '#2c1e14';
  R(c, br, 9, 16, 3, 2); R(c, br, 6, 15, 3, 1); R(c, br, 4, 13, 2, 2); R(c, br, 3, 11, 2, 2); R(c, br, 2, 7, 1, 4); R(c, brL, 6, 15, 2, 1); R(c, br, 5, 8, 1, 5); R(c, br, 6, 8, 3, 1);
  R(c, br, 17, 14, 3, 2); R(c, br, 20, 12, 2, 2); R(c, br, 22, 10, 2, 2); R(c, br, 24, 7, 1, 4); R(c, brD, 19, 15, 2, 1); R(c, br, 20, 8, 1, 4); R(c, br, 18, 7, 2, 1);
  R(c, br, 12, 6, 5, 7); R(c, brL, 12, 6, 2, 7); R(c, br, 11, 3, 1, 4); R(c, br, 17, 2, 1, 5); R(c, br, 14, 0, 1, 7); R(c, brL, 14, 0, 1, 3); R(c, br, 15, 4, 3, 1);
  R(c, '#5f8a6a', 4, 14, 5, 2); R(c, '#78a884', 4, 14, 2, 1); R(c, '#4a7058', 5, 16, 1, 4); R(c, '#4a7058', 7, 16, 1, 3);
  R(c, '#5f8a6a', 20, 11, 4, 2); R(c, '#78a884', 20, 11, 2, 1); R(c, '#4a7058', 21, 13, 1, 3);
  R(c, '#c8803a', 22, 7, 2, 1); R(c, '#e0a050', 3, 8, 1, 1); R(c, '#c8803a', 11, 2, 1, 1); R(c, '#d89a4a', 19, 5, 1, 1); R(c, '#a8601e', 6, 6, 1, 1);
  R(c, '#6a8a4a', 12, 24, 3, 2); R(c, '#8aaa5a', 12, 24, 1, 1);
  c.restore();
}
function tri(c, cx, top, h, hw, c1, c2, c3) {
  for (let r = 0; r < h; r++) {
    const w = Math.max(1, Math.round(hw * (r + 1) / h)) * 2 + 1, x = cx - Math.floor(w / 2), sh = Math.max(1, Math.floor(w / 3));
    R(c, c1, x, top + r, w, 1);
    R(c, c2, x, top + r, sh, 1);
    R(c, c3, x + w - sh, top + r, sh, 1);
    if (r % 2 === 0 && w > 4) { R(c, c2, x + sh + 1, top + r, 1, 1); R(c, c3, x + w - sh - 2, top + r, 1, 1); }
    if (r % 3 === 1 && w > 6) { R(c, shade(c1, 22), x + sh + 3, top + r, 2, 1); }
  }
}
function paintPine(c, v) {
  const pals = [['#2f6a4a', '#4a9a62', '#1f4a36'], ['#336e3a', '#58a850', '#234e2c'], ['#2c6458', '#4a9a86', '#1e463e'], ['#a8602a', '#d89a48', '#6a3a1a']];
  const [c1, c2, c3] = pals[v % 4];
  R(c, '#4a3220', 14, 38, 4, 10); R(c, '#6a4a30', 14, 38, 1, 10); R(c, '#33241a', 17, 40, 1, 8); R(c, '#33241a', 11, 46, 10, 2);
  tri(c, 16, 30, 10, 10, c1, c2, c3);
  tri(c, 16, 22, 10, 9, c1, c2, c3);
  tri(c, 16, 14, 10, 7, c1, c2, c3);
  tri(c, 16, 6, 10, 5, c1, c2, c3);
  tri(c, 16, 0, 8, 3, c1, c2, c3);
}
function paintRedwood(c, v) {
  c.save();
  if (v & 1) { c.translate(36, 0); c.scale(-1, 1); }
  const b1 = '#7a4a2e', b2 = '#9a5e38', b3 = '#5a3220', b4 = '#3e2216';
  R(c, b1, 12, 8, 14, 52); R(c, b2, 12, 8, 4, 52); R(c, b3, 22, 8, 4, 52); R(c, b4, 24, 10, 2, 50);
  for (let y = 10; y < 60; y += 3) {
    const h = hash2(y, v, 301);
    R(c, h < 0.5 ? b2 : b3, 12 + Math.floor(hash2(y, v, 302) * 12), y, 1, 3);
    if (h > 0.7) R(c, shade(b1, 26), 14 + Math.floor(h * 7), y, 1, 2);
  }
  R(c, b1, 8, 56, 22, 8); R(c, b2, 8, 56, 5, 8); R(c, b3, 25, 56, 5, 8); R(c, b4, 5, 61, 6, 3); R(c, b4, 27, 61, 6, 3);
  R(c, '#5a7a4a', 12, 30, 5, 3); R(c, '#78a868', 12, 30, 2, 1); R(c, '#4a6a3a', 13, 33, 1, 5); R(c, '#5a7a4a', 12, 46, 4, 2);
  R(c, '#2a1a10', 17, 38, 3, 6); R(c, '#14100c', 18, 39, 1, 4);
  R(c, '#23502f', 4, 0, 28, 8); R(c, '#2f6a3c', 7, 0, 22, 5); R(c, '#3f8a4c', 10, 0, 8, 2); R(c, '#1a3f26', 2, 4, 32, 6); R(c, '#9a5e2a', 20, 2, 5, 2); R(c, '#c8803a', 22, 2, 2, 1);
  R(c, '#2f6a3c', 0, 6, 8, 4); R(c, '#1a3f26', 28, 7, 8, 4);
  c.restore();
}
OBJ_SPR[O.TREE] = { w: 28, h: 40, nv: 2, sw: 20, paint: paintTree };
OBJ_SPR[O.PINE] = { w: 32, h: 48, nv: 4, sw: 20, paint: paintPine };
OBJ_SPR[O.REDWOOD] = { w: 36, h: 64, nv: 2, sw: 28, paint: paintRedwood };

