/* =====================================================================
   SOUND: every effect is synthesised in the browser, no audio files
   ===================================================================== */
const AUD = { ac: null, master: null, noise: null, muted: false, last: {}, windGain: null, windFilter: null, hb: 0 };
function audioInit() {
  if (AUD.ac) { if (AUD.ac.state === 'suspended') AUD.ac.resume(); return; }
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ac = new AC();
    AUD.ac = ac;
    AUD.master = ac.createGain(); AUD.master.gain.value = 0.55; AUD.master.connect(ac.destination);
    const len = Math.floor(ac.sampleRate * 1.5), buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    AUD.noise = buf;
    const src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
    const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 420; f.Q.value = 0.6;
    const g = ac.createGain(); g.gain.value = 0;
    src.connect(f); f.connect(g); g.connect(AUD.master); src.start();
    AUD.windFilter = f; AUD.windGain = g;
  } catch (e) { AUD.ac = null; }
}
['pointerdown', 'keydown'].forEach(n => window.addEventListener(n, () => audioInit()));
function aTone(freq, dur, type, vol, slide, delay) {
  const ac = AUD.ac;
  if (!ac || AUD.muted) return;
  const t = ac.currentTime + (delay || 0), o = ac.createOscillator(), g = ac.createGain();
  o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(AUD.master); o.start(t); o.stop(t + dur + 0.03);
}
function aNoise(dur, vol, ftype, f0, f1, delay, q) {
  const ac = AUD.ac;
  if (!ac || AUD.muted || !AUD.noise) return;
  const t = ac.currentTime + (delay || 0), s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = AUD.noise; f.type = ftype || 'lowpass'; f.Q.value = q || 0.7;
  f.frequency.setValueAtTime(f0, t); if (f1 && f1 !== f0) f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(AUD.master); s.start(t, Math.random() * 0.8); s.stop(t + dur + 0.03);
}
const SFX_GAP = { step: 0.12, geiger: 0.015, beat: 0.2, hit: 0.05, click: 0.03, rustle: 0.1, chop: 0.1, mine: 0.1 };
function sfx(name, arg) {
  if (!AUD.ac || AUD.muted) return;
  const now = AUD.ac.currentTime, gap = SFX_GAP[name] || 0.03;
  if (AUD.last[name] && now - AUD.last[name] < gap) return;
  AUD.last[name] = now;
  switch (name) {
    case 'step':
      if (arg === T.GRASS) aNoise(0.07, 0.07, 'bandpass', 1000, 500, 0, 1);
      else if (arg === T.ROAD || arg === 'floor' || arg === T.FLOOR) aNoise(0.05, 0.08, 'bandpass', 1900, 900, 0, 1);
      else if (arg === T.ASH) aNoise(0.09, 0.07, 'lowpass', 700, 250);
      else aNoise(0.08, 0.07, 'lowpass', 520, 240);
      break;
    case 'swing': aNoise(0.14, 0.14, 'bandpass', 2400, 600, 0, 0.8); break;
    case 'hit': aTone(160, 0.12, 'square', 0.16, 50); aNoise(0.08, 0.2, 'lowpass', 1800, 300); break;
    case 'kill': aTone(120, 0.25, 'sawtooth', 0.14, 40); break;
    case 'gun': aNoise(0.16, 0.35, 'lowpass', 5000, 300); aTone(260, 0.12, 'square', 0.2, 40); break;
    case 'empty': aTone(900, 0.03, 'square', 0.06); break;
    case 'chop': aTone(190, 0.09, 'square', 0.16, 80); aNoise(0.07, 0.18, 'lowpass', 2000, 400); break;
    case 'mine': aTone(1100, 0.09, 'triangle', 0.12, 700); aNoise(0.05, 0.14, 'highpass', 3000, 3000); break;
    case 'rustle': aNoise(0.18, 0.1, 'bandpass', 3200, 1800); break;
    case 'pickup': aTone(660, 0.07, 'sine', 0.1); aTone(990, 0.09, 'sine', 0.1, 0, 0.06); break;
    case 'open': aTone(300, 0.12, 'triangle', 0.12, 500); aTone(600, 0.15, 'sine', 0.1, 900, 0.08); break;
    case 'craft': [523, 659, 784].forEach((f, i) => aTone(f, 0.14, 'triangle', 0.12, 0, i * 0.07)); break;
    case 'place': aTone(120, 0.1, 'square', 0.2, 60); aNoise(0.06, 0.14, 'lowpass', 900, 300); break;
    case 'break': aNoise(0.25, 0.22, 'lowpass', 2500, 200); aTone(90, 0.2, 'sawtooth', 0.12, 40); break;
    case 'drink': for (let k = 0; k < 4; k++) aNoise(0.06, 0.1, 'bandpass', 500 + k * 120, 900, k * 0.08, 3); break;
    case 'eat': aNoise(0.05, 0.12, 'bandpass', 1400, 800); aNoise(0.05, 0.12, 'bandpass', 1400, 800, 0.1); break;
    case 'hurt': aTone(150, 0.2, 'sawtooth', 0.22, 50); aNoise(0.1, 0.2, 'lowpass', 1500, 200); break;
    case 'die': aTone(260, 0.9, 'sawtooth', 0.2, 35); aNoise(0.6, 0.15, 'lowpass', 1200, 100); break;
    case 'levelup': [523, 659, 784, 1046].forEach((f, i) => aTone(f, 0.16, 'triangle', 0.13, 0, i * 0.08)); break;
    case 'horn': aTone(110, 0.9, 'sawtooth', 0.18); aTone(165, 0.9, 'sawtooth', 0.12); aTone(110, 0.9, 'sawtooth', 0.18, 0, 1.0); aTone(165, 0.9, 'sawtooth', 0.12, 0, 1.0); break;
    case 'sting': aTone(300, 0.6, 'sawtooth', 0.14, 260); aTone(317, 0.6, 'sawtooth', 0.14, 270); break;
    case 'jump': aTone(220, 0.14, 'sawtooth', 0.14, 80); aNoise(0.12, 0.18, 'bandpass', 2000, 700); break;
    case 'click': aTone(1200, 0.025, 'square', 0.05); break;
    case 'geiger': aNoise(0.012, 0.22, 'highpass', 3500, 3500); break;
    case 'beat': aTone(60, 0.12, 'sine', 0.4, 35); aTone(55, 0.14, 'sine', 0.32, 32, 0.17); break;
    case 'thunder': aNoise(1.3, 0.4, 'lowpass', 500, 60); break;
  }
}
function sfxToggle() {
  audioInit();
  AUD.muted = !AUD.muted;
  if (AUD.windGain) AUD.windGain.gain.value = 0;
  toast('Sound ' + (AUD.muted ? 'off' : 'on'), 1.5);
}
function updateAudio(dt) {
  if (!AUD.ac || AUD.muted) return;
  const p = state.player, z = state.zone, dk = darkness(clockHour()), si = state.stormI || 0;
  const target = 0.02 + (z === 2 ? 0.03 : 0) + dk * 0.015 + si * 0.14;
  AUD.windGain.gain.value += (target - AUD.windGain.gain.value) * Math.min(1, dt * 1.5);
  AUD.windFilter.frequency.value = 380 + si * 520 + Math.sin(state.elapsed * 0.4) * 80;
  const rr = state.radRate;
  if (rr > 0.1 && !state.sleeping && Math.random() < dt * Math.min(40, rr * 14)) sfx('geiger');
  const frac = p.health / maxHealth();
  if (frac < 0.45 && !state.sleeping) { AUD.hb -= dt; if (AUD.hb <= 0) { sfx('beat'); AUD.hb = 0.45 + frac * 1.3; } }
}
{ const o = attackMelee; attackMelee = function (w) { sfx('swing'); o(w); }; }
{ const o = fireGun; fireGun = function (w) { sfx(countItem(w.ammo) <= 0 ? 'empty' : 'gun'); o(w); }; }
{ const o = damageEnemy; damageEnemy = function (e, d, nx, ny, kb) { sfx('hit'); o(e, d, nx, ny, kb); }; }
{ const o = killEnemy; killEnemy = function (e) { sfx('kill'); o(e); }; }
{ const o = hurtPlayer; hurtPlayer = function (a, b, c, d) { const before = state.player.health; o(a, b, c, d); if (state.player.health < before) sfx('hurt'); }; }
{ const o = die; die = function (r) { sfx('die'); o(r); }; }
{ const o = harvestResource; harvestResource = function (t) { sfx(t.canHarvest ? (t.res.tool === 'axe' ? (t.res.item === 'Berries' ? 'rustle' : 'chop') : 'mine') : 'mine'); o(t); }; }
{ const o = openCrate; openCrate = function (t) { const had = objs[t.i]; o(t); if (objs[t.i] !== had) sfx('open'); }; }
{ const o = drinkFrom; drinkFrom = function (t) { sfx('drink'); o(t); }; }
{ const o = gainXp; gainXp = function (n) { const l = state.player.level; o(n); if (state.player.level > l) sfx('levelup'); }; }
{ const o = startRaid; startRaid = function (d) { o(d); sfx('horn'); }; }
{ const o = fireAmbush; fireAmbush = function (z) { o(z); sfx('sting'); }; }
{ const o = revealEnemy; revealEnemy = function (e) { o(e); sfx('jump'); }; }
{ const o = uiClick; uiClick = function (x, y, b) { sfx('click'); o(x, y, b); }; }
{ const o = recruit; recruit = function (n) { const r = o(n); if (r) sfx('levelup'); return r; }; }

/* ---------- Low health: the screen drains of colour, the edges go red, the heart pounds ---------- */
function drawLowHealth() {
  const p = state.player, frac = p.health / maxHealth();
  if (frac >= 0.6 || state.sleeping) return;
  const t = Math.min(1, (0.6 - frac) / 0.5);
  const bpm = 60 + t * 80, pulse = Math.pow(Math.max(0, Math.sin(state.elapsed * bpm / 60 * Math.PI * 2)), 3);
  const W2 = canvas.width, H2 = canvas.height;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'saturation';
  ctx.fillStyle = 'rgba(128,128,128,' + (0.78 * t) + ')'; ctx.fillRect(0, 0, W2, H2);
  ctx.globalCompositeOperation = 'source-over';
  const r = Math.hypot(W2, H2) / 2, g = ctx.createRadialGradient(W2 / 2, H2 / 2, r * (0.78 - 0.5 * t), W2 / 2, H2 / 2, r);
  g.addColorStop(0, 'rgba(90,0,0,0)'); g.addColorStop(1, 'rgba(110,4,8,' + (0.2 + 0.5 * t + 0.25 * pulse * t) + ')');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W2, H2);
  if (t > 0.5) { ctx.fillStyle = 'rgba(0,0,0,' + (0.18 * (t - 0.5) * 2 * (0.6 + 0.4 * pulse)) + ')'; ctx.fillRect(0, 0, W2, H2); }
}

