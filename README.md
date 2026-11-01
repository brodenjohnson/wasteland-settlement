# Wasteland Settlement

A post-nuclear survival, farming and settlement game that runs in your browser. One page, no install, no accounts. Desktop browser recommended.

## Play
Open the link the host gave you. WASD to move, hold the left mouse button to use or attack, I for your bag, C for crafting, M for the map, P for progress, J for the journal.

- **Saves** are kept in your own browser, one set per character. They are not shared between computers or browsers, and clearing site data for this page deletes them.
- **Updates:** when a new version is published the title screen and an in-game message say so. Refresh the page (Ctrl+Shift+R, or Cmd+Shift+R on a Mac). Your saves are kept.
- This is a hobby project and it is for adults (18 and over). Bugs are expected. Tell the host what you were doing when something broke.

## For the host
- The published game is `index.html` at the repo root, served by GitHub Pages (Settings, Pages, Deploy from a branch, `main`, `/ (root)`).
- The source, build system and tests are in `source/`. Read `source/CLAUDE.md` first. It is written for Claude as well as for people, so Claude in VS Code can pick the project up where it was left.
- To publish an update: bump `source/VERSION`, add a line to `CHANGELOG.md`, run `python3 source/release.py`, then `git add -A`, `git commit`, `git push`. It is live a minute or two later.
