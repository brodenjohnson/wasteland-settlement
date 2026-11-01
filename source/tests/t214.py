import json
ev = lambda s: pg.evaluate(s)
ev('''(() => {
  const cv = document.createElement('canvas'); cv.id = 'sheet'; cv.width = 1100; cv.height = 700; cv.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;background:#1a1612';
  document.body.appendChild(cv); const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.font = '9px monospace';
  const tools = ['Rusty Hatchet','Woodcutter Axe','Chopper','Rusty Pick','Miners Pick','Drill Pick','Hoe','Watering Can','Large Watering Can','Pressure Can'];
  const items = Object.keys(__g.ITEM_ART);
  const old = Object.keys(__g.ARMOUR).filter(n => !['Welder Mask','Tyre Harness','Hose Greaves','Work Boots','Skull Helm','Bone Harness','Spiked Leggings','Bone Boots','Hockey Helm','Plate Duster','Chain Greaves','Steel Toe Boots','Skull Necklace'].includes(n));
  const all = [...tools.map(n=>[n,{water:Math.round((__g.CAN_DEF[n]||{cap:20}).cap*0.6)}]), ...items.map(n=>[n,null]), ...old.map(n=>[n,null])];
  all.forEach(([n, it], i) => { const x = 8 + (i % 11) * 99, y = 6 + Math.floor(i / 11) * 76; g.fillStyle = '#2a241c'; g.fillRect(x, y, 92, 70); __g.iconTo(g, n, x + 22, y + 2, 48, it); g.fillStyle = '#e8dcc0'; g.fillText(n.slice(0, 15), x + 3, y + 66); });
})()''')
pg.wait_for_timeout(500); pg.screenshot(path='out/sheet2.png')
rows = json.loads(ev('JSON.stringify(Object.entries(__g.WEAPONS).map(([n,w])=>[n, w.kind, Math.round(__g.wDps(w)), __g.itemValue(n)]).sort((a,b)=>a[2]-b[2]))'))
print('weapon dps and value (sorted):'); print([ (r[0], r[2], r[3]) for r in rows])
arm = json.loads(ev('''JSON.stringify((()=>{ const sets = {}; for (const [n,a] of Object.entries(__g.ARMOUR)) { if (a.slot==="acc") continue; const k = n; sets[k]=[a.slot,a.dmg,a.rad]; } return sets; })())'''))
