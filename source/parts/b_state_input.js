const state = {
  player: {
    x: spawn.x, y: spawn.y, aimX: 1, aimY: 0,
    health: 100, food: 100, water: 100, radiation: 0,
    inventory: new Array(CONFIG.inventory.slots).fill(null),
    equip: { head: null, body: null, legs: null, feet: null, acc: null },
    xp: 0, level: 1, kbx: 0, kby: 0, walkT: 0, moving: false
  },
  sel: 0, cursor: null, corpse: null,
  swing: null, swingCd: 0, actCd: 0, slash: null, muzzle: 0, iframes: 0, hurtT: 0,
  particles: [], floats: [], drops: [], projs: [], spawnPts: [], damage: new Map(), shake: new Map(),
  invOpen: false, craftOpen: false, craftTab: 0, craftScroll: 0, placing: null, unlocked: new Set(), uiRects: [], radRate: 0,
  sleeping: false, lastDay: 1, raid: null, nextRaidDay: CONFIG.raids.firstDay, raidsSurvived: 0,
  lastReachMsg: -10, lastFullMsg: -10, mwx: 0, mwy: 0,
  elapsed: 0,
  timeMult: 1,
  gameMinutes: CONFIG.time.startHour * 60,
  msg: '', msgT: 0
};

function toast(text, secs = 4) { state.msg = text; state.msgT = secs; }

/* =====================================================================
   INPUT
   ===================================================================== */
const keys = {};
const mouse = { x: 0, y: 0, down: false };
const zoomSteps = [2, 3, 4, 5];
let zoomLevel = CONFIG.zoom;

function changeZoom(dir) {
  const idx = zoomSteps.indexOf(zoomLevel);
  zoomLevel = zoomSteps[Math.min(zoomSteps.length - 1, Math.max(0, idx + dir))];
  resize();
}

window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  keys[k] = true;
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'tab'].includes(k)) e.preventDefault();
  if (e.repeat) return;
  if (k.length === 1 && k >= '1' && k <= '9') state.sel = Number(k) - 1;
  if (k === 't') { state.timeMult = state.timeMult === 1 ? CONFIG.time.fastMultiplier : 1; toast(state.timeMult === 1 ? 'Time: normal' : 'Time: fast forward'); }
  if (k === 'g') addTestScrap();
  if (k === 'h') testGearKit();
  if (k === 'n') { if (!state.raid) startRaid(clockDay()); }
  if (k === 'i' || k === 'tab') togglePanel('inv');
  if (k === 'c') togglePanel('craft');
  if (k === 'escape') closePanels();
  if (k === 'u') unlockAllTest();
  if (k === 'k') die();
  if (k === '-' || k === '_') changeZoom(-1);
  if (k === '=' || k === '+') changeZoom(1);
});
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; mouse.down = false; });
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mousedown', e => {
  if (state.sleeping) return;
  if (state.craftOpen || state.invOpen) { if (e.button === 0 || e.button === 2) uiClick(e.clientX, e.clientY, e.button); return; }
  if (e.button === 2) { if (state.placing) state.placing = null; else useItem(state.sel); return; }
  if (e.button !== 0) return;
  if (state.placing) { tryPlace(); return; }
  mouse.down = true;
});
window.addEventListener('mouseup', e => { if (e.button === 0) mouse.down = false; });
window.addEventListener('contextmenu', e => e.preventDefault());
window.addEventListener('wheel', e => {
  if (state.craftOpen) { state.craftScroll = Math.max(0, state.craftScroll + (e.deltaY > 0 ? 1 : -1)); return; }
  if (state.invOpen) return;
  state.sel = (state.sel + (e.deltaY > 0 ? 1 : CONFIG.hotbar - 1)) % CONFIG.hotbar;
}, { passive: true });

/* Panels */
function putItem(item) {
  if (stackMax(item.name) > 1) return addItem(item.name, item.qty) === 0;
  const inv = state.player.inventory;
  const i = inv.indexOf(null);
  if (i < 0) return false;
  inv[i] = item;
  return true;
}
function returnCursor() {
  const c = state.cursor;
  if (!c) return;
  state.cursor = null;
  if (!putItem(c)) state.drops.push({ x: state.player.x, y: state.player.y + 6, name: c.name, qty: c.qty, t: 0 });
}
function closePanels() {
  returnCursor();
  state.invOpen = false; state.craftOpen = false; state.placing = null;
}
function togglePanel(which) {
  const wasOpen = which === 'inv' ? state.invOpen : state.craftOpen;
  closePanels();
  if (which === 'inv') state.invOpen = !wasOpen; else state.craftOpen = !wasOpen;
}

