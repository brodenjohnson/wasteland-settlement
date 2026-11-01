ev = lambda s: pg.evaluate(s)
ev('(()=>{ const p = __g.state.player; for (const n of ["Skull Helm","Bone Harness","Spiked Leggings","Bone Boots"]) p.equip[__g.ARMOUR[n].slot] = {name:n, qty:1}; })()')
pg.wait_for_timeout(800); pg.screenshot(path='out/a_hud.png', clip={'x':0,'y':0,'width':300,'height':140})
