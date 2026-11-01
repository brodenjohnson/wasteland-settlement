# Handoff

Written at the end of a long design and build session in a claude.ai chat. The new session starts with no memory of that chat. Everything it needs should be in this repo.

## First message to paste into the new session
> Read `source/CLAUDE.md`, then `source/docs/HANDOFF.md`, then `source/docs/STORY.md` and `source/docs/STORY_BIBLE.md`. Run the build and the regression list so we know the baseline is green. Then summarise where the project stands in ten lines, tell me what you would build for Chapter Three and in what order, and ask me anything you need decided before you start.

## State (version 0.10.0)
Chapter Three is built and playable (see `docs/STORY.md`). Next: Chapter Four (the Roster and the endings), then the faction layer.

### Earlier state (0.9.0)
Working and tested: character creation and multiple saves, survival, crafting with benches, settlement and settlers with jobs, raids, farming with tiers and irrigation, livestock, weapons and armour with their own art, the dialogue engine with reputation and consequences, the Spine and the Tidewrack (Chapter Two), the Kind Stranger mission and the Kingpin, the Hollowclaw and Deepcut, three extra dungeons, the Hull town (37 residents with schedules, 10 vendors, clinic, inn, job board).
Baseline: the regression list in `tests/run.py` passes (a test passes when its last line is `ERRORS: none`).

## Broden's standing decisions
- Our own names and lore, not Fallout's. Caps, Rad-Away and Rad tabs stay for now.
- Dark tone, 18 and over, gore setting with a first-launch warning.
- Bosses are mostly people. Betrayal missions follow the Kind Stranger template.
- Claude may reorder the roadmap and overrule suggestions, and says why.
- Prefers that Claude decides and builds, then explains plainly what it did and did not do.

## Chapter Three: approved 2026-11-01
The questions below were answered and the build order approved. The decisions are in `docs/STORY.md` under Chapter 3, and they override the proposal that follows. In short: the case holds the plan, the Director code and the redacted vote minutes; the Cantor is a debate or a fight; a capacity readout is built early; settlers cannot die unless a setting allows it; the Hull gets one document. Save export and import comes first.

### The original proposal
The Tidewrack console ends Chapter Two with the player's own recording: "Go home. Ask Marta what is in the case. She will pretend not to know. She knows."
1. **Marta.** She lives in the greenhouse in the Wastes. Her case was labelled in the player's hand ("Not for eating. Not yet."). She never opened it. A conversation with branching and Memory checks. The player chooses whether to open it.
2. **The case.** Proposal: the minutes of the Long Table (the vote on who sleeps and who does not) plus something that makes the Director override possible. This is where the player learns what they signed.
3. **Priya answers the radio** at Pylon 3. The list of names, and the voice reading the call sign that she has heard in person. She will not say whose.
4. **The Cantor.** A Listener leader who treats the broadcast as scripture. Wants the Cradle opened for everyone, or for no one. A boss fight, or a debate, or both, depending on reputation and Memory.
5. **Set up Chapter Four:** the Roster choice. Endings: the Long Table, the Ark, Mercy, the Cantor's way.
Questions for Broden before building: what is in the case; whether the Cantor is a fight, a debate or both; how much of the Long Table the player sees; whether the Hull has a role (the Archive building is shuttered and waiting).

## Known limits and ideas
- Animals only roam the main map, and raids ignore them.
- Townsfolk commute in straight lines along streets. Only the job board raises Hull reputation. Killing or stealing from townsfolk has no effect yet.
- First-pass art: some creatures, calves and hatchlings, counters.
- The Archive and the Pit are shuttered and ready for content.
- Save export and import is in (0.9.1). Tell friends to export before big updates.
- Saves are per browser. Every update must keep older saves loading, and say so when it cannot.

## The player wiki
At `/wiki/` on GitHub Pages, built by `wiki.py` on every release. Spoiler-free by Broden's decision. Keep its prose in `wiki_pages/` current as features land.

## Where things live outside this repo
- The full story bible was a Claude Doc in claude.ai. It is now in `docs/STORY_BIBLE.md` (transcribed from the PDF export, 2026-11-01), and this repo is the source of truth for the story.
- Earlier chat transcripts exist but are not needed. This handoff and the code carry what matters.
