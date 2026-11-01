"""Balance model: player power against enemy power, by level and gear tier.
   python tools/balance.py                 loads game_new.html headless and reads __g.wikiData()
   python tools/balance.py --data d.json   uses a saved dump (wiki.py's format)
   python tools/balance.py --proposal      also models the level 11 to 20 proposal in docs/WORLD_DESIGN.md
It reads the real numbers from the build: weapons, armour, enemies, LVL_OFF, healing items, CONFIG.combat.
Prints three tables:
  1. the XP curve (today, and the proposal)
  2. the gear a player has at each tier (best melee and gun DPS, best armour)
  3. fights: time to kill (TTK) against time to die (TTD) for normal enemies and bosses. A ratio
     TTD/TTK above 1 means the player wins a straight fight. Bosses count four healing items.
The model is deliberately simple: no dodging, no knockback, every hit lands, one enemy at a time."""
import json, os, sys
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def load():
    if '--data' in sys.argv: return json.load(open(sys.argv[sys.argv.index('--data') + 1], encoding='utf-8'))
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page()
        pg.goto('file:///' + os.path.join(HERE, 'game_new.html').replace('\\', '/')); pg.wait_for_timeout(1500)
        pg.evaluate("__g.newCharacter(); __g.state.creating.name = 'Model'; __g.beginGame()"); pg.wait_for_timeout(1500)
        d = json.loads(pg.evaluate('JSON.stringify(__g.wikiData())')); b.close(); return d

D = load(); C = D['CONFIG']['combat']; PROPOSAL = '--proposal' in sys.argv
TIER = {}
for r in D['RECIPES']:
    for n in (r.get('gives') or {}): TIER[n] = r.get('tier')
for n, t in D['ITEM_TIER'].items(): TIER.setdefault(n, t)

# ---------- the curve ----------
def xp_need(l, prop=False):
    """XP to go from level l to l+1. Levels 1 to 10 are the live formula, untouched."""
    return C['xpBase'] + C['xpPerLevel'] * (l - 1)
def max_level(prop): return 20 if prop else C['maxLevel']
def hp_at(l, prop=False):
    if not prop or l <= 10: return 100 + C['hpPerLevel'] * (l - 1)
    return hp_at(10) + 2 * (l - 10)                    # gentler above 10: +2 a level, not +3
def dmg_at(l, prop=False):
    if not prop or l <= 10: return 1 + C['dmgPerLevel'] * (l - 1)
    return dmg_at(10) + 0.015 * (l - 10)                # +1.5% a level, not +2.5%
def perk_dmg(l, prop):                                  # the proposal's combat perks: a pick at 12, 14, 16, 18, 20
    if not prop or l < 12: return 0, 0
    picks = (l - 10) // 2
    return 0.04 * min(picks, 2), 0.03 * max(0, min(picks - 2, 2))   # assume two damage picks, then two toughness picks

# ---------- gear ----------
def gear(tier):
    best = {'melee': (0, ''), 'gun': (0, '')}
    for n, w in D['WEAPONS'].items():
        t = TIER.get(n)
        if t is None or t > tier: continue
        dps = w['dmg'] * (w.get('pellets') or 1) * (0.6 if w.get('pellets') else 1) / w['cd']   # pellets: about 60% land
        k = 'gun' if w['kind'] == 'gun' else 'melee'
        if dps > best[k][0]: best[k] = (dps, n)
    slots = {}
    for n, a in D['ARMOUR'].items():
        t = TIER.get(n)
        if t is None or t > tier: continue
        if a['dmg'] > slots.get(a['slot'], (0, ''))[0]: slots[a['slot']] = (a['dmg'], n)
    res = min(C['dmgResCap'], sum(v[0] for v in slots.values()))
    return best, res

def enemy(type, lv, prop=False):
    """Health, damage per hit, seconds between hits. Health x1.2 is u_core.js on Normal."""
    e = D['ENEMY_TYPES'][type]; bossy = e.get('boss') or type == 'chief'
    per = 0.015 if bossy else 0.025
    hp = e['hp'] * 1.2 * (1 + 0.05 * (lv - 1)); dmg = e['dmg'] * (1 + per * (min(lv, 10) - 1))
    if lv > 10: dmg *= 1 + (0.06 if prop else per) * (lv - 10)       # proposal: +6% a level above 10
    return hp, dmg, e.get('atkCd', 1)

def pierce(lv, prop):
    """Proposal: armour stops less against enemies above level 10, down to 60% of its rating at level 20."""
    return 1 - 0.04 * max(0, lv - 10) if prop else 1

def fight(l, tier, type, lv, prop=False, heals=0, pack=1):
    (b, res) = gear(tier)
    pd, pt = perk_dmg(l, prop)
    pdps = b['melee'][0] * (dmg_at(l, prop) + pd)
    ehp, hit, cd = enemy(type, lv, prop)
    ttk = ehp / pdps * pack
    inc = min(hit / cd * pack, hit / C['iframes'])          # after a hit you cannot be hurt for C['iframes'] seconds
    ttd = (hp_at(l, prop) + heals) / (inc * (1 - min(C['dmgResCap'], res * pierce(lv, prop) + pt)))
    return ttk, ttd

def tier_at(l):            # the gear tier a player is expected to hold at each level
    return 1 if l <= 2 else 2 if l <= 5 else 3 if l <= 8 else 4

# ---------- print ----------
prop = PROPOSAL
print('1. XP CURVE' + (' (proposal to 20)' if prop else ' (live)'))
tot = 0
for l in range(1, max_level(prop)):
    tot += xp_need(l, prop)
    if l in (1, 5, 9) or l >= 9 and (l % 2 == 1 or l == max_level(prop) - 1):
        print('  level %2d -> %2d: %4d XP, %5d total, hp %3d, damage x%.3f' % (l, l + 1, xp_need(l, prop), tot, hp_at(l + 1, prop), dmg_at(l + 1, prop)))
print()
print('2. GEAR BY TIER')
for t in range(0, 5):
    (b, res) = gear(t)
    print('  tier %d: melee %5.1f dps (%s), gun %5.1f dps (%s), armour %d%%' % (t, b['melee'][0], b['melee'][1], b['gun'][0], b['gun'][1], round(res * 100)))
print()
print('3. FIGHTS (melee, expected tier for the level; enemy at the top of its LVL_OFF band)')
BOSSES = ['chief', 'kingpin', 'hollowclaw', 'wrackmother', 'cantor']
NORMAL = ['husk', 'brute', 'drowned', 'zealot']
lvls = [2, 4, 6, 8, 10] + ([12, 14, 16, 18, 20] if prop else [])
print('  %-12s' % 'level' + ''.join('%14d' % l for l in lvls))
for typ in NORMAL + BOSSES:
    off = D['LVL_OFF'].get(typ, [0, 1])[1]; heals = 4 * 70 if typ in BOSSES else 0
    row = []
    for l in lvls:
        ttk, ttd = fight(l, tier_at(l), typ, l + off, prop, heals)
        row.append('%5.1f/%5.1f %s' % (ttk, ttd, '+' if ttd > ttk else '-'))
    print('  %-12s' % typ + ''.join('%14s' % r for r in row))
print('  (each cell is TTK/TTD in seconds; + the player wins a straight fight, - they lose. Bosses: four medkits.)')
print()
print('3b. PACKS: three at once, no healing')
print('  %-12s' % 'level' + ''.join('%14d' % l for l in lvls))
for typ in NORMAL:
    off = D['LVL_OFF'].get(typ, [0, 1])[1]; row = []
    for l in lvls:
        ttk, ttd = fight(l, tier_at(l), typ, l + off, prop, 0, 3)
        row.append('%5.1f/%5.1f %s' % (ttk, ttd, '+' if ttd > ttk else '-'))
    print('  %-12s' % typ + ''.join('%14s' % r for r in row))
print()
print('3c. NO ARMOUR (tier-appropriate weapon, bare skin), single enemy')
for typ in ['husk', 'brute']:
    off = D['LVL_OFF'].get(typ, [0, 1])[1]; row = []
    for l in lvls:
        (b, _) = gear(tier_at(l)); pdps = b['melee'][0] * dmg_at(l, prop); ehp, hit, cd = enemy(typ, l + off, prop)
        row.append('%5.1f/%5.1f' % (ehp / pdps, hp_at(l, prop) / (hit / cd)))
    print('  %-12s' % typ + ''.join('%14s' % r for r in row))
if prop:
    print()
    print('4. PLACE-SET LEVELS: brute, single, no healing, tier 4 gear. Player at the bottom of the band, then the top.')
    for name, lo, hi in [('1 Valley', 1, 6), ('2 Coast', 4, 9), ('3 Dustbowl', 6, 11), ('5 Ridge', 8, 13), ('4 Foundry', 9, 14), ('6 Meridian', 12, 18), ('7 Deep', 15, 20)]:
        cells = []
        for pl in (lo, hi):
            lv = hi                       # the hardest enemy in the band
            ttk, ttd = fight(max(pl, 1), 4, 'brute', lv, prop)
            cells.append('you L%-2d vs L%-2d %4.1f/%5.1f' % (pl, lv, ttk, ttd))
        print('  %-11s %s   %s' % (name, cells[0], cells[1]))
