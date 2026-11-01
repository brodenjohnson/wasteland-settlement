import json
ev = lambda s: pg.evaluate(s)
print(ev('JSON.stringify({tools:Object.keys(__g.TOOL_ITEMS||{}), weapons:Object.keys(__g.WEAPONS), armour:Object.keys(__g.ARMOUR)})'))
