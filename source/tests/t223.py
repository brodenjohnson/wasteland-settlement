import json
ev = lambda s: pg.evaluate(s)
print('has serialize/loadGame:', ev('[typeof __g.serialize, typeof __g.loadGame]'))
ev('__g.releaseAnimal("Twohead Calf", 500, 500); __g.releaseAnimal("Roach Hatchling", 540, 520); __g.animals[0].age = 7; __g.animals[0].ready = 2')
d = ev('JSON.stringify(__g.serialize())') if ev('typeof __g.serialize') == 'function' else None
print('saved animals in payload:', (len(json.loads(d).get('animals', [])) if d else 'n/a'))
if d:
    ev('__g.animals.length = 0')
    ev('__g.state.pendingLoad = JSON.parse(%s); __g.loadGame()' % json.dumps(d))
    print('after load:', ev('JSON.stringify(__g.animals.map(a=>[a.type, a.age, a.ready]))'))
