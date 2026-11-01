import json
ev = lambda s: pg.evaluate(s)
names = json.loads(ev('JSON.stringify(Object.keys(__g.WEAPONS))'))
arm = json.loads(ev('JSON.stringify(Object.keys(__g.ARMOUR))'))
print(len(names), 'weapons,', len(arm), 'armour pieces')
ev('''(() => {
  const cv = document.createElement('canvas'); cv.id = 'sheet'; cv.width = 1100; cv.height = 700; cv.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;background:#1a1612';
  document.body.appendChild(cv); const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.font = '9px monospace'; g.fillStyle = '#e8dcc0';
  const W = Object.keys(__g.WEAPONS), A = Object.keys(__g.ARMOUR);
  W.forEach((n, i) => { const x = 10 + (i % 10) * 108, y = 8 + Math.floor(i / 10) * 74; g.fillStyle = '#2a241c'; g.fillRect(x, y, 100, 66); __g.iconTo(g, n, x + 26, y + 2, 48, null); g.fillStyle = '#e8dcc0'; g.fillText(n.slice(0, 16), x + 3, y + 63); });
  const base = 8 + 3 * 74 + 10;
  A.forEach((n, i) => { const x = 10 + (i % 11) * 98, y = base + Math.floor(i / 11) * 74; g.fillStyle = '#2a241c'; g.fillRect(x, y, 92, 66); __g.iconTo(g, n, x + 22, y + 2, 48, null); g.fillStyle = '#e8dcc0'; g.fillText(n.slice(0, 15), x + 3, y + 63); });
})()''')
pg.wait_for_timeout(500); pg.screenshot(path='out/sheet.png')
