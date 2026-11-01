"""Run one or more tests against the current build.
   python3 tests/run.py t51 t52          run named tests
   python3 tests/run.py regression       run the regression list
Needs: pip install playwright && playwright install chromium
Each test is a script run by shot.py with the game loaded and a test character created (LEGACY=1).
A test passes when its last line is 'ERRORS: none'. Some tests print their own result on the last line instead; read them."""
import os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
HTML = os.path.join(ROOT, 'game_new.html'); OUT = os.path.join(ROOT, 'out'); os.makedirs(OUT, exist_ok=True)
REGRESSION = 't51 t52 t54 t62 t74 t92 t93 t94 t95 t96 t97 t98 t120 t122 t130 t141 t150 t152 t160 t171 t180 t212 t151 t173 t201 t220 t100 t123'.split()
names = REGRESSION if sys.argv[1:] == ['regression'] else sys.argv[1:]
NO_LEGACY = {'t123'}  # these create their own character, so the LEGACY setup gets in the way
for n in names:
    script = os.path.join(HERE, n + '.py')
    env = dict(os.environ, LEGACY='1') if n not in NO_LEGACY else {k: v for k, v in os.environ.items() if k != 'LEGACY'}
    try:
        r = subprocess.run([sys.executable, os.path.join(HERE, 'shot.py'), HTML, os.path.join(OUT, n + '.png'), script], cwd=ROOT, env=env, capture_output=True, text=True, timeout=120)
        lines = [l for l in (r.stdout + r.stderr).splitlines() if l.strip()]
        print(n + ': ' + (lines[-1][:140] if lines else 'no output'))
    except subprocess.TimeoutExpired:
        print(n + ': TIMEOUT')
