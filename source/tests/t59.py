ev = lambda s: pg.evaluate(s)
ev('__g.state.title = false')
ev('__g.state.player.x = 60*16; __g.state.player.y = 60*16'); pg.wait_for_timeout(800)
r = ev('''(()=>{ const t = (f, n=60) => { const a = performance.now(); for (let i=0;i<n;i++) f(); return +((performance.now()-a)/n).toFixed(2); };
 const out = {};
 out.render = t(() => __g.render());
 out.updateEnemies = t(() => __g.updateEnemies(0.016));
 out.updateSettlers = t(() => __g.updateSettlers(0.016));
 out.updateStructures = t(() => __g.updateStructures(0.016));
 const ft0 = __g.ctx.fillText; 
 return JSON.stringify(out); })()''')
print(r)
