"""Build the game and publish it to the repo root.
   python3 release.py
Builds game_new.html from the source, then writes ../index.html and ../version.json (the version comes from VERSION),
then rebuilds the player wiki in ../wiki/ (see wiki.py).
Then, from the repo root: git add -A, git commit, git push."""
import json, os, shutil, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
for step in (['assemble.py'], ['build.py']):
    subprocess.run([sys.executable] + step, cwd=HERE, check=True)
subprocess.run(['node', '--check', 'game_new.js'], cwd=HERE, check=True)
shutil.copy(os.path.join(HERE, 'game_new.html'), os.path.join(ROOT, 'index.html'))
v = open(os.path.join(HERE, 'VERSION')).read().strip()
json.dump({'version': v}, open(os.path.join(ROOT, 'version.json'), 'w'))
print('Released version', v, 'to', ROOT)
if subprocess.run([sys.executable, 'wiki.py'], cwd=HERE).returncode: print('WARNING: the wiki was not rebuilt. Fix wiki.py and run it before committing.')
