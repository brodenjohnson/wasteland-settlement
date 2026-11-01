ev = lambda s: pg.evaluate(s)
pg.wait_for_timeout(1200)
print('cliffs in the old wall band, ignoring the map edge:', ev('(()=>{ let c=0; for (let y=64;y<=118;y++) for (let x=6;x<=64;x++){ const d=Math.hypot(x-28,y-98); if (d>23&&d<33 && __g.tiles[y*128+x]===7) c++; } return c; })()'))
print('cliffs anywhere on the map interior:', ev('(()=>{ let c=0; for (let y=6;y<=121;y++) for (let x=6;x<=121;x++){ if (__g.tiles[y*128+x]===7) c++; } return c; })()'))
