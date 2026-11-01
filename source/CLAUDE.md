# Wasteland Settlement: project guide for Claude

A post-nuclear survival, farming and settlement game for the browser. Single HTML file, vanilla JavaScript on a canvas, no dependencies. Hobby project by Broden Johnson (Gold Coast, Australia), built iteratively with Claude. Current version is in `VERSION`.

## Start here
Read this file, then `docs/HANDOFF.md` (current state, open questions, the Chapter Three starting plan), then `docs/STORY.md` and `docs/STORY_BIBLE.md` (the full story bible, if present). Keep these up to date as you work: update `docs/STORY.md` after each chapter, and add anything a future session would need to this file.

## How we work
- Australian English. Plain, a little dry. No emojis. No em dashes. Never "genuinely" or "honestly". Challenge dilution and overextension: if a request spreads the project thin, say so and suggest an order.
- Build in tested increments. After each feature, run the regression list, then publish. Say plainly what you did not do.
- Broden decides direction. Claude may reorder the roadmap and overrule suggestions where it has a good reason, and says why.

## Layout (this folder is `source/` inside the repo)
- `game.js`: the original base game (an IIFE). `game.html`: the page shell (fonts, canvas, a placeholder script).
- `parts/*.js`: feature modules. Files are named in roughly build order (`a_` to `z_`, then `aa_` to `an_`). `parts/dialogue.txt` is the story script.
- `pass4.py` ... `pass18.py`: patch scripts applied by `assemble.py`. Each pass uses `sub1(old, new)` to replace an exact string in the assembled source (it fails loudly if the string is not found) and inserts modules before `marker_end`.
- `assemble.py` builds `game_new.js`. `build.py` wraps it into `game_new.html` and stamps the version. `release.py` does both and writes `../index.html` and `../version.json`.
- `tests/`: Playwright tests. `python3 tests/run.py regression` runs the regression list. See below.

## Build
```
python3 assemble.py && node --check game_new.js && python3 build.py
```
Or `python3 release.py` to also publish to the repo root. On Windows, `python3` may be the Microsoft Store stub: use `python` instead. A build that fails `node --check` is broken: read the line it names in `game_new.js`.

## Architecture rules that have bitten us
1. All modules share one scope (the IIFE). A new top-level `const` or `function` can clash with an existing name (we have hit `R`, `pick`, `isFood`-style collisions). `node --check` reports "already declared". Prefix or rename.
2. Extend behaviour by wrapping, not editing: `{ const o = fn; fn = function (...args) { ...; return o(...args); }; }`. Pass **all** arguments through (a wrapper that dropped the second argument once broke W and S movement).
3. `window.__g` is built from `DBG`. `Object.assign(DBG, { fn })` captures the function **at that moment**. If you wrap `fn` afterwards, re-export it, or tests will call the old version. The game itself calls by name, so it uses the newest wrapper.
4. Map arrays (`tiles`, `objs`, `floors`, `buried` and friends) are shared by every map. `MAP_ARR` lists them; `snapshotMap`/`applyMap` swap them on a map change. A new per-map array must be added to `MAP_ARR`.
5. Dungeon and town maps regenerate from their definition each time they are loaded. Only `objs`, `crateLoot`, `spawnPts`, fog and `state.mapFlags[id]` are saved for them. **Structs placed in `setup`/`gen` are not saved**, so derive their state from `mapFlags` when generating.
6. Item names are keys everywhere (recipes, loot, saves, dialogue). Renames happen as plain string replacement at the end of `assemble.py` (`RENAMES`). Old saves are migrated by `OLD_NAMES` in `parts/ad_polish.js`, written as concatenated strings so the rename pass does not rewrite them. Never rename an item without a migration.
7. Saves: `serialize`/`loadGame` are patched in pass files (search for `conf:` and `animals:`). New saved state needs a default for old saves. Never break loading an older save without saying so.
8. Strings in JS use single quotes in the data tables: avoid apostrophes in item names or use double quotes (`"Kingpin's Cleaver"`).
9. Text size is scaled globally by overriding `ctx.font` (setting `textScale`, default 1.2), so fixed-width UI can overflow. Check screens after UI changes.

## Systems, briefly
- **Maps**: `MAPDEFS[id]` with `gen`/`setup`, `entry`, `dark` (a number or a getter), `theme`. `enterMap(id, tx, ty)` fades, swaps maps, then calls `onArrive`. Portals are `INTERACT` entries of `kind: 'portal'` (`to`, `tx`, `ty`, `locked`, `label`, `sign`). Other kinds: terminal, case, relay, board, innbed, and so on (see `useInteract` wrappers).
- **Dialogue** (`parts/aa_dialogue.js`, `parts/dialogue.txt`, and scripts generated at runtime with `parseScripts(text)`): `=== node`, `Name: text`, `~ narration`, `@ effects`, `> next`, `* [Tag N] label => target | if cond | do effects`. Conditions: `flag:`, `item:Name>=N`, `rep.track>=N`, `skill.x>=N`, `memory>=N`, `quest:id=status`, joined with `&`, negated with `!`. Effects are added by wrapping `applyEffect`.
- **Quests**: `QUEST_DEFS` with steps that complete by `check()` or `event`. `questEvent(name)` fires events. Rewards pay on completion.
- **Story state**: `state.qflags`, `state.rep` (mercy, trust, listeners, hull, raiders), `memoryScore()` counts documents read and echoes seen.
- **Combat**: enemies get a level from the player's level plus an offset (`LVL_OFF`). Bosses sit higher. Balance was modelled (see `parts/ag_balance.js`). Prepared players should win narrowly; unprepared should lose.
- **Town (the Hull)**: `parts/al_hull.js` (layout, buildings, interiors) and `parts/am_townfolk.js` (roster, schedules, vendors, job board). Buildings and people are data. Everyone has a work place, a home bed and a schedule driven by `state.gameMinutes`.
- **Livestock**: `parts/ak_livestock.js`. **Farming**: `parts/af_farm.js`. **Gear and art**: `parts/ai_arsenal.js`, `parts/aj_restyle.js`.

## Testing
Needs `pip install playwright` and `playwright install chromium`.
```
python3 assemble.py && python3 build.py
python3 tests/run.py regression      # a test passes when its last line is "ERRORS: none"
python3 tests/run.py t220 t232       # specific tests
```
Tests are small scripts run by `tests/shot.py` with `LEGACY=1` (creates a character, places a bedroll and campfire at the origin, skips the intro). They drive the game through `window.__g`. A test that creates its own character goes in `NO_LEGACY` in `tests/run.py`.
- World clicks need a held mouse (`mouse.down`, wait about 350ms, `mouse.up`), not `click`.
- Teleport the player to a clear spot before testing (a spot inside an obstacle makes movement tests meaningless).
- Spawn points only spawn enemies when the player is more than about 260px away. Teleport far first.
- Write a new test for each new feature, and run the regression list before publishing.

## Release
1. Bump `VERSION` (for example `0.9.1`) and add a line to `../CHANGELOG.md`.
2. `python3 release.py`.
3. From the repo root: `git add -A`, `git commit -m "0.9.1: what changed"`, `git push`.
GitHub Pages serves `index.html` from the repo root. The title screen shows the build and tells players when `version.json` is newer than their build.

## Roadmap (Broden's decisions)
Done: core game, saves, maps, dialogue, dark pass, the Kind Stranger and Varro, the Hollowclaw and Deepcut, the Tidewrack (Chapter Two), farming and livestock, arsenal and gear art, the Hull town, save export and import (`parts/ao_saveio.js`, pass 19).
Next, in a likely order:
1. **Chapter Three**: Marta's case and the long table. The Tidewrack console tells the player: "Go home. Ask Marta what is in the case." Priya answers the radio. The Cantor appears as antagonist.
2. **Faction layer** for the Hull: guild membership with ranks, rep-gated quests, a bounty board at the Guard HQ. The Archive and the Pit are shuttered buildings waiting for content.
3. **Per-area feel pass**: props, palettes and ambience for each region.
4. **Chapter Four and endings**: the Roster choice (Long Table, Ark, Mercy, the Cantor's way).
5. Later: torches and light, status effects and chems, companions (a dog), settler minds, frame suits (power armour equivalents), a possible Boston setting.
Known limits: animals only roam the main map and are not attacked by raids; commuting townsfolk walk straight along streets; only the job board raises Hull reputation; counters and some creature art are first-pass.
See `docs/STORY.md` for the story and its decisions.
