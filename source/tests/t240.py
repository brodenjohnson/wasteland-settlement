ev = lambda s: pg.evaluate(s)
print('build:', ev('__g.BUILD'), '| title:', ev('document.title'))
