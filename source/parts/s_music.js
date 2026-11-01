/* =====================================================================
   MUSIC: slow generative score that follows the time of day and danger
   ===================================================================== */
if (settings.music === undefined) settings.music = true;
if (settings.musicVol === undefined) settings.musicVol = 0.4;
const MUS = { bus: null, send: null, pad: null, plk: null, drum: null, drone: null, nextChord: 0, chordI: 0, nextPluck: 0, nextBeat: 0, beat: 0, dangerUntil: 0, mood: 'day', droneOsc: null };
const mHz = m => 440 * Math.pow(2, (m - 69) / 12);
const CH_DAY = [[45, 52, 57, 60, 64], [41, 48, 53, 57, 60], [48, 55, 60, 64, 67], [43, 50, 55, 59, 62]];
const CH_NIGHT = [[40, 47, 52, 55], [38, 45, 50, 53, 57], [36, 43, 48, 52], [35, 42, 47, 50]];
const PENTA = [57, 60, 62, 64, 67, 69, 72, 74];
function musicInit() {
  const ac = AUD.ac;
  if (!ac || MUS.bus) return;
  MUS.bus = ac.createGain(); MUS.bus.gain.value = 0;
  const mk = v => { const g = ac.createGain(); g.gain.value = v; g.connect(MUS.bus); return g; };
  MUS.pad = mk(0); MUS.plk = mk(0); MUS.drum = mk(0); MUS.drone = mk(0);
  const dly = ac.createDelay(1.5); dly.delayTime.value = 0.43;
  const fb = ac.createGain(), lp = ac.createBiquadFilter(); fb.gain.value = 0.4;
  lp.type = 'lowpass'; lp.frequency.value = 1700;
  MUS.send = ac.createGain(); MUS.send.gain.value = 0.6;
  MUS.send.connect(dly); dly.connect(lp); lp.connect(fb); fb.connect(dly); lp.connect(MUS.bus);
  MUS.bus.connect(AUD.master);
  const o = ac.createOscillator(), o2 = ac.createOscillator(), f = ac.createBiquadFilter();
  o.type = 'sawtooth'; o.frequency.value = mHz(28); o2.type = 'sine'; o2.frequency.value = mHz(40); f.type = 'lowpass'; f.frequency.value = 220;
  o.connect(f); o2.connect(f); f.connect(MUS.drone); o.start(); o2.start();
}
function mOsc(dest, freq, t, dur, type, vol, att, rel, send, det) {
  const ac = AUD.ac, o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.value = freq; if (det) o.detune.value = det;
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + att); g.gain.setValueAtTime(vol, t + Math.max(att, dur - rel)); g.gain.linearRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(dest); if (send) g.connect(MUS.send);
  o.start(t); o.stop(t + dur + 0.05);
}
function mNoise(dest, t, dur, vol, ftype, f0) {
  const ac = AUD.ac, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = AUD.noise; f.type = ftype; f.frequency.value = f0;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(dest); s.start(t, Math.random() * 0.8); s.stop(t + dur + 0.05);
}
function musicMood() {
  const now = AUD.ac.currentTime;
  if (state.raid || state.ambushWarn > 0 || enemies.some(e => !e.hidden && e.hp > 0 && Math.hypot(e.x - state.player.x, e.y - state.player.y) < 130)) MUS.dangerUntil = now + 7;
  if (now < MUS.dangerUntil) return 'danger';
  if (state.storm && state.storm.phase !== 'pass') return 'storm';
  return darkness(clockHour()) > 0.5 ? 'night' : 'day';
}
let musClock = 0;
function updateMusic() {
  const ac = AUD.ac;
  if (!ac) return;
  musicInit();
  if (!MUS.bus) return;
  const now = ac.currentTime, on = settings.music !== false && !settings.muted;
  MUS.bus.gain.setTargetAtTime(on ? settings.musicVol * (state.sleeping ? 0.3 : 1) : 0, now, 0.5);
  if (!on) return;
  const mood = state.title ? 'day' : musicMood();
  if (mood !== MUS.mood) { MUS.mood = mood; if (mood === 'danger') MUS.nextBeat = now + 0.1; }
  const L = { day: [1, 1, 0, 0], night: [0.8, 0.5, 0, 0.35], danger: [0.3, 0, 1, 0.9], storm: [0.35, 0, 0, 1] }[mood];
  MUS.pad.gain.setTargetAtTime(L[0], now, 2); MUS.plk.gain.setTargetAtTime(L[1], now, 2); MUS.drum.gain.setTargetAtTime(L[2], now, 0.5); MUS.drone.gain.setTargetAtTime(L[3] * 0.22, now, 2);
  if (!MUS.nextChord) MUS.nextChord = now + 0.2;
  while (MUS.nextChord < now + 1.5) {
    const set = mood === 'night' || mood === 'storm' ? CH_NIGHT : CH_DAY, ch = set[MUS.chordI++ % set.length], t = Math.max(MUS.nextChord, now + 0.05), len = 14;
    ch.forEach((m, k) => { mOsc(MUS.pad, mHz(m), t, len + 4, 'triangle', 0.045, 3.5, 4.5, 0, -5 + k); mOsc(MUS.pad, mHz(m), t, len + 4, 'sine', 0.035, 3.5, 4.5, 0, 6 - k); });
    MUS.nextChord += len;
  }
  if (now >= MUS.nextPluck) {
    if (mood === 'day' || mood === 'night') {
      const m = PENTA[Math.floor(Math.random() * PENTA.length)] - (mood === 'night' ? 12 : 0);
      mOsc(MUS.plk, mHz(m), now + 0.02, 2.6, mood === 'night' ? 'sine' : 'triangle', 0.08, 0.01, 2.4, true, 0);
    }
    MUS.nextPluck = now + (mood === 'night' ? 4 + Math.random() * 6 : 2 + Math.random() * 4);
  }
  if (mood === 'danger') {
    const spb = 60 / 96;
    while (MUS.nextBeat < now + 0.3) {
      const t = Math.max(MUS.nextBeat, now), b = MUS.beat++ % 8;
      mOsc(MUS.drum, 120, t, 0.16, 'sine', 0.5, 0.005, 0.15, false);
      if (b % 2 === 1) mNoise(MUS.drum, t, 0.18, 0.28, 'bandpass', 1800);
      mNoise(MUS.drum, t + spb / 2, 0.05, 0.1, 'highpass', 6000);
      if (b % 4 === 3 || b % 4 === 0) mOsc(MUS.drum, mHz(b < 4 ? 40 : 43), t + spb / 2, 0.3, 'sawtooth', 0.12, 0.01, 0.25, false);
      MUS.nextBeat += spb;
    }
  } else MUS.nextBeat = now + 0.1;
}
{ const o = render; render = function () { o(); updateMusic(); }; }

