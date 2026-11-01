/* =====================================================================
   AN_VERSION: the build number, shown on the title screen, and a check that
   tells players when a newer version has been published.
   ===================================================================== */
const BUILD = 'BUILD_ID_PLACEHOLDER';
let newerBuild = null, versionCheckT = -999;
function checkVersion() {
  if (!/^https?:/.test(location.protocol)) return;
  fetch('version.json?t=' + Date.now(), { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(j => {
    if (j && j.version && j.version !== BUILD && !newerBuild) { newerBuild = j.version; toast('A newer version (' + j.version + ') has been published. Refresh the page to get it. Your saves are kept.', 9); }
  }).catch(() => {});
}
{ const o = updateStorm; updateStorm = function (dt) { o(dt); if (state.elapsed - versionCheckT > 600) { versionCheckT = state.elapsed; checkVersion(); } }; }
{ const o = drawStorm; drawStorm = function () {
  o();
  if (!state.title) return;
  const w = window.innerWidth, h = window.innerHeight; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.font = '10px ' + MONO;
  ctx.fillStyle = 'rgba(184,168,144,0.8)'; ctx.fillText('Wasteland Settlement  v' + BUILD, w / 2, h - 10);
  if (newerBuild) { ctx.font = '12px ' + MONO; ctx.fillStyle = '#ffd36b'; ctx.fillText('A newer version (' + newerBuild + ') is out. Refresh the page to get it.', w / 2, h - 28); }
}; }
Object.assign(DBG, { BUILD, checkVersion });
