# Wasteland Settlement: source

The build system, modules and tests for the game. The published game is `../index.html`.

- Read `CLAUDE.md` first. It is the guide for working on this project, for people and for Claude.
- Build: `python3 assemble.py && node --check game_new.js && python3 build.py`
- Test: `python3 tests/run.py regression` (needs `pip install playwright` and `playwright install chromium`)
- Release: bump `VERSION`, then `python3 release.py`, then commit and push from the repo root.
