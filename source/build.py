import re
html = open('game.html').read()
js = open('game_new.js').read()
html = re.sub(r'<script>.*</script>', lambda m: '<script>\n' + js + '\n</script>', html, flags=re.S)
html = html.replace('Wasteland Settlement - Chunk 4', 'Wasteland Settlement - Batch 2')
html = html.replace('</head>', '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;600&display=swap" rel="stylesheet"></head>')
html = html.replace('BUILD_ID_PLACEHOLDER', open('VERSION').read().strip())
html = html.replace('Wasteland Settlement - Batch 2', 'Wasteland Settlement')
open('game_new.html', 'w').write(html)
