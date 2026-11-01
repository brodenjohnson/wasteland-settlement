ev = lambda s: pg.evaluate(s)
print(ev("""JSON.stringify(__g.migrateNames({inventory:[{name:'Scrap '+'Axe', qty:1},{name:'Iron '+'Plate', qty:1},{name:'Wood', qty:5}], equip:{head:{name:'Steel '+'Helm'}}}))"""))
