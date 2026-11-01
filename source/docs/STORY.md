# Story and decisions

(The full story bible is `docs/STORY_BIBLE.md`, and this repo is the source of truth for the story. This is the working summary. Where the two disagree, what is built wins, then this file, then the bible's later sections.)

## The truth
The dying Cradle vault holds 3,012 sleepers. Dark layer: the Cradle holds the people who caused the war. Architects (about 40), Beneficiaries (about 600), and The Rest (about 2,400). The player is the Director (Unit 11), one of the Architects, identified by signature. The vault is failing and cannot hold everyone: a capacity dilemma. A late-game "Roster" choice decides who to wake. Choices matter throughout.
Tone: bleak, dark, 18 and over, with gore settings (off, some, full; default full) and a first-launch warning.

## Characters
- **Odile Marr** (the Warden, Unit 12): voice on tape, then in person at Lamp Cove on the Tidewrack. "Only answers what is asked."
- **The ten survivors** (each has a Tag Card, paid by their favour). As built, all ten live in open ruins in the Wastes: Marta Voss (the Wastes, holds the case), Dex Harlan (the Scrapyard), Wren Alvarez, Old Tomas and Juno Park (Whisper Pines), Ripley Cho (the Ashlands), Sam Oduya (the Quarry), Lena Fischer and Boone Keller (Fallen City), Priya Nair (the Toxic Marsh). The bible placed several of them in dungeons; that was never built. `docs/WORLD_DESIGN.md` section 10 proposes moving four to later regions as a chain.
- **The Listeners**: heard the broadcast and decided it was a voice. They keep Chapel Row.
- **The Cantor**: antagonist, to appear in Chapter Three.
- Quorum: 6 of 11 tags (the player's own does not count).

## Chapters
1. The note, the depot, the pump house, the Ash Tower signal.
2. The Spine (relays), then the Tidewrack: The Lamplighter (Manifest Case at low tide, Director Logs 2 and 3), Quorum (six Tag Cards, past the Listeners five ways, the console: "WAKE QUORUM 6 OF 11, PROJECTED LOSS ON A PARTIAL WAKE: 41 PERCENT", and a recording of the player: "Go home. Ask Marta what is in the case."). DONE.
3. Marta's case, the Long Table. Priya answers the radio. The Cantor. DONE (0.10.0). What is built:
   - **What Marta Knows** (`ch3_case`): starts when Chapter Two ends. Marta pretends not to know; Memory 4, honesty (if you told her about the note or trust is 2+) or pushing her (trust -1) gets the case. Open it with her (trust +1) or alone. If Marta is gone, the case is under her empty bunk.
   - **The case**: The Long Table (the staged plan), Minutes of the Vote (names blacked out, tiers kept) and the Director Code Card. Each has an echo and counts toward Memory.
   - **Capacity**: the settlement panel shows the Long Table box once the case is open: beds (bunks x3), food (tilled x0.6 + animals x4), water (purifiers x25 + sinks x5) and safety (walls, gates, posts, turrets, traps, guards). The weakest sets the number. Dialogue can test `capacity>=N`.
   - **The Cantor's sermons**: four, one a night after 21:00, once the chapter starts.
   - **Ten Voices** (`ch3_radio`): Priya admits she answers the broadcast. Stop answering (smaller Listener raid) or keep answering (bigger). Memory 3 lets you ask whose voice, and she will not say yet. Boone's watch scene is optional once the case is open.
   - **They Come to Listen** (`ch3_listeners`): after dark, six hours or more later. Listener rep 2+ (or 1+ if Priya went quiet) means they sit outside the wall in peace; otherwise a Listener raid. Either way Chapel Row opens. The Cantor debate wins with Memory 5 (case opened), capacity 20+, or Listener rep 3+. A lie or a weak capacity case starts a boss fight; at 15% he kneels, spare or kill.
   - **The Long Table** (`ch3_table`): build a Table, then call the ten (settlers among them sit and get a line each). Choice sets `lean_long`, `lean_ark` or `lean_mercy` for Chapter Four. Sets `chapter_three_done`.
   Flags Chapter Four can read: case_with_marta, priya_quiet/priya_bait, boone_forgiven, listeners_fought, cantor_debated/cantor_spared/cantor_dead, lean_*.
   Decided 2026-11-01:
   - **The case** holds the Long Table plan (staged wakes as the valley grows), the Director code the console asks for, and the minutes of the vote on who sleeps with the names blacked out. The player learns that someone chose, not who. The Architects stay hidden until Chapter Four.
   - **The Cantor** is both a debate and a fight. Memory or Listener reputation opens the debate. Losing it, or refusing, turns it into a fight. He preaches on the radio before he appears.
   - **Capacity**: a readout of how many sleepers the valley could hold, from beds, food, water and defence. Chapter Four's endings read it.
   - **The Listeners come to the valley** as an event at the player's camp.
   - **Settlers cannot die** unless a setting allows it (off by default).
   - **The Hull** gets one document in Chapter Three. The Archive waits for the faction layer.
   - Build order: save export and import first, then Marta and the case, capacity, the Cantor's sermons, Priya at Pylon 3 (with Dex's and Boone's payoffs), the Listeners at the valley, the Cantor, the long table scene.
4. Roster endings: Long Table, Ark, Mercy, the Cantor's way. TO DO. The Cradle's power runs out; the Roster is read; capacity sets how many can be kept alive. The Architects are revealed here, not before.

## Design decisions
- Original names and lore, not Fallout's. A Boston/Commonwealth setting is possible later using real geography with our own factions. (Caps, Rad-Away and Rad tabs are still in the game; Broden chose to leave them for now.)
- Bosses are mostly people, plus a few apex animals. Betrayal missions follow the Kind Stranger template: a likeable stranger, a noticing check, a trap or an alarm, an escape, a kingpin, a real choice.
- Dialogue choices carry checks (Memory, skills) and move five reputation tracks.
