"""Build the player wiki into ../wiki/ from the game's own data and the pages in wiki_pages/.
   python3 wiki.py                 loads game_new.html in a headless browser and reads __g.wikiData()
   python3 wiki.py --data d.json   uses a saved dump instead
Each file in wiki_pages/ is an HTML fragment. Its first line is <!-- title: Page title | one-line summary -->.
A line <!-- gen:name --> is replaced by the generated block of that name (see GEN below).
The wiki is spoiler-free: story items, documents, story quests and story characters are left out on purpose.
Needs Playwright (pip install playwright, playwright install chromium) unless --data is given."""
import html, json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
SRC = os.path.join(HERE, 'wiki_pages'); OUT = os.path.join(ROOT, 'wiki')

def load_data():
    if '--data' in sys.argv: return json.load(open(sys.argv[sys.argv.index('--data') + 1], encoding='utf-8'))
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file:///' + os.path.join(HERE, 'game_new.html').replace('\\', '/')); pg.wait_for_timeout(1500)
        d = json.loads(pg.evaluate('JSON.stringify(__g.wikiData())')); b.close()
        if errs: raise SystemExit('game errors while loading: ' + '; '.join(errs))
        return d

D = load_data()
STORY = set(D['STORY_ITEMS'])
STORY_QUESTS = {'note', 'pump', 'signal', 'stairs', 'stranger', 'lamplighter', 'quorum'}
STATIONS = D['STATION_NAMES']
BOSS_WHERE = {'kingpin': 'Greybridge Depot', 'hollowclaw': 'Deepcut', 'wrackmother': 'The Tidewrack', 'chief': 'Raids (the warband)'}
SCHED = {'shop': 'Works 8:00 to 18:00, then the cantina. Home by 22:00.', 'office': 'Works 8:00 to 17:00, then the cantina until 20:00.',
         'late': 'Behind the bar 14:00 to 2:00. Sleeps through the morning.', 'night': 'At the barracks from 18:00, on post 22:00 to 6:00. Sleeps by day.',
         'dock': 'On the dock 7:00 to 17:00.', 'idle': 'Out and about 8:00 to 20:00.', 'drifter': 'Passes through on a rotation. Sleeps at the inn.'}

e = lambda s: html.escape(str(s), quote=True)
def slug(s): return re.sub(r'[^a-z0-9]+', '-', str(s).lower()).strip('-')
def pct(x): return '%d%%' % round(x * 100)
def num(x, d=1): return (('%%.%df' % d) % x).rstrip('0').rstrip('.') if isinstance(x, float) else str(x)
def table(head, rows, cls=''):
    h = ''.join('<th>%s</th>' % e(c) for c in head)
    b = ''.join('<tr%s>%s</tr>' % (' id="%s"' % r[0] if isinstance(r, tuple) and r[0] else '', ''.join('<td>%s</td>' % c for c in (r[1] if isinstance(r, tuple) else r))) for r in rows)
    return '<div class="tw"><table class="%s"><thead><tr>%s</tr></thead><tbody>%s</tbody></table></div>' % (cls, h, b)
def costs(c): return ', '.join('%s %s' % (q, link(n)) for n, q in c.items()) if c else 'Free'
def ilist(items): return ', '.join('%s%s' % (link(i['name']), ' x%s' % i['qty'] if i.get('qty', 1) > 1 else '') for i in items if i['name'] not in STORY) or 'None'

# where each item lives in the wiki, so names can link to their entry
PAGE_OF = {}
def link(n):
    p = PAGE_OF.get(n)
    return '<a href="%s.html#%s">%s</a>' % (p, slug(n), e(n)) if p else e(n)

W, A, TOOLS, CROPS = D['WEAPONS'], D['ARMOUR'], D['TOOL_ITEMS'], D['CROPS']
AMMO = {w['ammo'] for w in W.values() if w.get('ammo')}
ALL = set(D['VALUES']) - STORY
def category(n):
    if n in W: return 'weapons'
    if n in A: return 'armour'
    if n in TOOLS: return 'items'
    if n in CROPS or n in D['FARM_PRODUCE'] or n in D['COOKED'] or n in ('Animal Feed', 'Milk', 'Roach Egg', 'Cheese', 'Twohead Calf', 'Roach Hatchling', 'Beast Tonic'): return 'farming'
    return 'items'
for n in ALL: PAGE_OF[n] = category(n)

# where to get things
SRC_OF = {}
def add_src(n, s):
    if n in STORY: return
    SRC_OF.setdefault(n, [])
    if s not in SRC_OF[n]: SRC_OF[n].append(s)
for r in D['RECIPES']:
    for n in (r.get('gives') or {}): add_src(n, ('Crafted at ' + STATIONS.get(r['station'], r['station'])) if r.get('station') else 'Crafted by hand')
VNAME = {}
for b in D['HB']:
    if b.get('kind') not in ('house', 'closed'): VNAME[b['id']] = b['name']
for k, stock in D['VENDOR_STOCK'].items():
    for n, rep in stock.items(): add_src(n, 'Sold at ' + VNAME.get(k, k) + (' (Hull reputation %d)' % rep if rep > 0 else ''))
ENAME = {k: v['name'] for k, v in D['ENEMY_TYPES'].items()}
for k, drops in D['DROPS'].items():
    for d in drops: add_src(d['n'], 'Dropped by ' + ENAME.get(k, k))
for k, v in D['SKULL_FOES'].items(): add_src('Human Skull', 'Dropped by ' + ENAME.get(k, k))
for q in D['QUEST_DEFS']:
    if q['id'] in STORY_QUESTS: continue
    for i in q['reward']['items']: add_src(i['name'], 'Reward: ' + q['title'])
for a in D['ANIMALS'].values():
    add_src(a['product'], 'Collected from a ' + a['name']); add_src('Raw Meat', 'Slaughtering a ' + a['name'])
    if a.get('hide'): add_src('Hide', 'Slaughtering a ' + a['name'])
for k, dg in D['DUNGEONS'].items():
    if dg.get('reward'): add_src(dg['reward'], 'Found at the end of ' + dg['name'])
def where(n): return '; '.join(SRC_OF.get(n, [])) or 'Found in the world'

# ---------------- generated blocks ----------------
def g_difficulty():
    return table(['Difficulty', 'Hunger and thirst', 'Raid size', 'Radiation', 'Enemy toughness'],
                 [[e(v['label']), pct(v['drain']), pct(v['raidScale']), pct(v['radScale']), pct(v['enemyScale'])] for v in D['DIFFS'].values()])
def g_survival():
    s, c, t = D['CONFIG']['survival'], D['CONFIG']['combat'], D['CONFIG']['time']
    rows = [['A full day', '%d real minutes (24 game hours)' % (t['dayLengthSec'] // 60)],
            ['Hunger drain', '%s per game hour' % num(s['foodDrainPerGameHour'])], ['Thirst drain', '%s per game hour' % num(s['waterDrainPerGameHour'])],
            ['Starving', '%s health a second' % num(s['starvationDamagePerSec'])], ['Dehydrated', '%s health a second' % num(s['thirstDamagePerSec'])],
            ['Healing on your own', '%s health a second while hunger and thirst are above %d' % (num(s['regenPerSec']), s['regenMinFoodWater'])],
            ['A drink', '+%d thirst' % s['drinkRestore']], ['Max level', str(c['maxLevel'])], ['Per level', '+%d max health, +%s damage' % (c['hpPerLevel'], pct(c['dmgPerLevel']))],
            ['Damage resistance cap', pct(c['dmgResCap'])], ['Radiation resistance cap', pct(c['radResCap'])],
            ['Bag', '%d slots, stacks of up to %d, %d on the hotbar' % (D['CONFIG']['inventory']['slots'], D['CONFIG']['inventory']['stackSize'], D['CONFIG']['hotbar'])]]
    return table(['', ''], rows, 'kv')
def g_healing():
    rows = []
    for n, u in sorted(D['ITEM_USE'].items()):
        if n in STORY or not (u.get('heal') or u.get('rad')): continue
        fx = []
        if u.get('heal'): fx.append('+%d health' % u['heal'])
        if u.get('rad'): fx.append('%+d radiation' % u['rad'])
        if u.get('food'): fx.append('+%d hunger' % u['food'])
        if u.get('water'): fx.append('+%d thirst' % u['water'])
        rows.append([link(n), ', '.join(fx)])
    return table(['Item', 'Effect'], rows)
def g_buffs():
    by = {}
    for food, bl in D['FOOD_BUFFS'].items():
        for b, secs in bl: by.setdefault(b, []).append('%s (%d s)' % (link(food), secs))
    return table(['Buff', 'Effect', 'From'], [('buff-' + k, [e(b['name']), e(b['text']), ', '.join(by.get(k, []))]) for k, b in D['BUFFS'].items()])
def g_camp_levels():
    need = {}
    for sid, lvl in D['SL_REQ'].items(): need.setdefault(lvl, []).append(STATIONS.get(sid) or next((r['name'] for r in D['RECIPES'] if r['id'] == sid), sid))
    return table(['Level', 'Name', 'Safe zone radius', 'Unlocks'], [[str(i + 1), e(n), '%d tiles' % D['CAMP_RADII'][i], e(', '.join(sorted(need.get(i + 1, []))) or '-')] for i, n in enumerate(D['SL_NAMES'])])
def g_raids():
    return table(['Raid', 'From day', 'Size', 'Advice'], [[e(r['name']), str(max(r['minDay'], D['CONFIG']['raids']['firstDay'])), pct(r['mult']), e(r['hint'])] for r in D['RAID_KINDS'].values()])
def g_jobs(): return '<ul>' + ''.join('<li>%s</li>' % e(j) for j in D['JOBS']) + '</ul>'
def g_skills():
    out = []
    for k in D['SKILL_ORDER']:
        s = D['SKILLS'][k]
        out.append('<h3 id="%s">%s</h3><p>%s</p>' % (k, e(s['name']), e(s['blurb'])) + table(['Level', 'Bonus'], [[str(l), e(t)] for l, t in s['perks']]))
    return ''.join(out)
def g_recipes():
    out = []
    for tab in D['CRAFT_TABS']:
        rs = [r for r in D['RECIPES'] if r['cat'] == tab]
        if not rs: continue
        rows = []
        for r in rs:
            gate = []
            if r.get('unlock'): gate.append('Needs ' + link('Blueprint: ' + D['BLUEPRINTS'].get(r['unlock'], r['unlock'])))
            if r['id'] in D['SL_REQ']: gate.append('Camp level %d' % D['SL_REQ'][r['id']])
            if r.get('skill'): gate.append('%s %d' % (r['skill'][0].title(), r['skill'][1]))
            hp = D['STRUCT_HP'].get(r.get('place')) if r.get('place') else None
            rows.append((slug(r['name']) if not r.get('gives') else '', [link(r['name']) if r.get('gives') else e(r['name']), e(STATIONS.get(r['station'], r['station']) if r.get('station') else 'By hand'),
                         costs(r['cost']), ', '.join(gate) or '-', e(D['RECIPE_DESC'].get(r['id'], '')) + (' <span class="dim">%d hp</span>' % hp if hp else '')]))
        out.append('<h3 id="tab-%s">%s</h3>' % (slug(tab), e(tab)) + table(['Recipe', 'Made at', 'Cost', 'Needs', 'Notes'], rows))
    return ''.join(out)
def g_blueprints():
    return table(['Blueprint', 'Unlocks'], [(slug('Blueprint: ' + n), [link('Blueprint: ' + n), ', '.join(e(r['name']) for r in D['RECIPES'] if r.get('unlock') == k)]) for k, n in D['BLUEPRINTS'].items()])
def tier(n): t = D['ITEM_TIER'].get(n); return e(D['TIER_NAME'][t]) if t is not None else '-'
def g_weapons(kind):
    rows = []
    for n, w in sorted(W.items(), key=lambda x: x[1]['dmg'] / x[1]['cd']):
        if (w['kind'] == 'melee') != (kind == 'melee'): continue
        extra = ('%d' % w['reach']) if kind == 'melee' else ('%d, %s' % (w['range'], link(w['ammo'])))
        rows.append((slug(n), ['<b>%s</b>' % e(n), str(w['dmg']), '%ss' % num(w['cd'], 2), '<b>%s</b>' % num(round(w['dmg'] / w['cd'], 1)), extra, tier(n), str(D['VALUES'].get(n, '-')), e(where(n))]))
    return table(['Weapon', 'Damage', 'Swing' if kind == 'melee' else 'Fire rate', 'Damage a second', 'Reach' if kind == 'melee' else 'Range, ammo', 'Grade', 'Value', 'Where to get it'], rows)
def g_ammo(): return table(['Ammo', 'Used by', 'Value', 'Where to get it'], [(slug(a), [e(a), ', '.join(link(n) for n, w in W.items() if w.get('ammo') == a), str(D['VALUES'].get(a, '-')), e(where(a))]) for a in sorted(AMMO)])
SET_NAMES = {'raider': 'Raider', 'patch': 'Patchwork', 'scav': 'Scavenger Rig', 'metal': 'Metal', 'riot': 'Riot', 'bone': 'Bone Raider', 'haz': 'Hazmat', 'cap': 'Road Captain', 'combat': 'Combat'}
def g_armour():
    out, used = [], set()
    sets = sorted(D['SETS'].items(), key=lambda kv: sum(A[p]['dmg'] for p in kv[1] if p in A))
    rows = []
    for k, parts in sets:
        ps = [p for p in parts if p in A]; used |= set(ps)
        rows.append([e(SET_NAMES.get(k, k.title())), pct(sum(A[p]['dmg'] for p in ps)), pct(sum(A[p].get('rad', 0) for p in ps)), ', '.join(link(p) for p in ps)])
    out.append('<h3>Sets at a glance</h3>' + table(['Set', 'Protection (full set)', 'Radiation shield', 'Pieces'], rows))
    prow = []
    for k, parts in sets:
        for p in parts:
            if p in A: prow.append((slug(p), ['<b>%s</b>' % e(p), e(SET_NAMES.get(k, k)), e(D['SLOT_NAMES'][A[p]['slot']]), pct(A[p]['dmg']), pct(A[p].get('rad', 0)), str(D['VALUES'].get(p, '-')), e(where(p))]))
    for p, a in sorted(A.items()):
        if p not in used: prow.append((slug(p), ['<b>%s</b>' % e(p), '-', e(D['SLOT_NAMES'][a['slot']]), pct(a['dmg']), pct(a.get('rad', 0)), str(D['VALUES'].get(p, '-')), e(where(p))]))
    out.append('<h3>Every piece</h3>' + table(['Piece', 'Set', 'Slot', 'Protection', 'Radiation shield', 'Value', 'Where to get it'], prow))
    return ''.join(out)
def g_tools():
    return table(['Tool', 'Type', 'Tier', 'Value', 'Where to get it'], [(slug(n), ['<b>%s</b>' % e(n), e(t['type']), str(t.get('tier', '-')), str(D['VALUES'].get(n, '-')), e(where(n))]) for n, t in sorted(TOOLS.items(), key=lambda x: (x[1]['type'], x[1].get('tier', 0)))])
def item_rows(names):
    rows = []
    for n in sorted(names):
        u = D['ITEM_USE'].get(n, {}); fx = []
        for k, lab in (('food', 'hunger'), ('water', 'thirst'), ('heal', 'health')):
            if u.get(k): fx.append('+%d %s' % (u[k], lab))
        if u.get('rad'): fx.append('%+d radiation' % u['rad'])
        rows.append((slug(n), ['<b>%s</b>' % e(n), e(D['ITEM_DESC'].get(n, '')), ', '.join(fx) or '-', str(D['VALUES'].get(n, '-')), str(D['HULL_PRICE'].get(n, '-')), e(where(n))]))
    return table(['Item', 'Description', 'Effect', 'Value', 'Hull price', 'Where to get it'], rows)
ITEMS = [n for n in ALL if PAGE_OF[n] == 'items' and n not in TOOLS]
BPS = set(D['BP_ITEMS'])
def g_items_materials(): return item_rows([n for n in ITEMS if not (n.startswith('Kit: ') and n not in SRC_OF) and n not in BPS and n not in AMMO and not D['ITEM_USE'].get(n) and n != 'Caps'])
def g_items_food(): return item_rows([n for n in ITEMS if D['ITEM_USE'].get(n, {}).get('food') or D['ITEM_USE'].get(n, {}).get('water')])
def g_items_medicine(): return item_rows([n for n in ITEMS if n in D['ITEM_USE'] and not (D['ITEM_USE'][n].get('food') or D['ITEM_USE'][n].get('water'))])
def g_items_blueprints(): return item_rows([n for n in ITEMS if n in BPS])
def g_crops():
    rows = []
    for seed, c in sorted(CROPS.items(), key=lambda x: (x[1]['tier'], x[1]['days'])):
        p = c['produce']; per = 2 if p == 'Pumpkin' else 1
        rows.append((slug(seed), ['<b>%s</b>' % e(p), str(c['tier']), str(c['lvl']), str(c['days']), ('every %d days' % c['regrow']) if c.get('regrow') else 'No', str(D['VALUES'].get(p, '-')),
                     link(seed) + ' (%s)' % D['VALUES'].get(seed, '-')]))
        PAGE_OF[p] = 'farming'
    return table(['Crop', 'Tier', 'Farming level', 'Days to grow', 'Regrows', 'Value each', 'Seed (value)'], rows)
def g_produce(): return item_rows([n for n in ALL if PAGE_OF[n] == 'farming' and n not in D['COOKED']])
def g_cooking():
    rows = []
    for r in D['RECIPES']:
        if r['cat'] != 'Cooking': continue
        n = next(iter(r.get('gives') or {r['name']: 1})); u = D['ITEM_USE'].get(n, {})
        fx = ['+%d %s' % (u[k], l) for k, l in (('food', 'hunger'), ('water', 'thirst'), ('heal', 'health')) if u.get(k)]
        if u.get('rad'): fx.append('%+d radiation' % u['rad'])
        bf = ', '.join('<a href="survival.html#buff-%s">%s</a>' % (b, e(D['BUFFS'][b]['name'])) for b, s in D['FOOD_BUFFS'].get(n, []))
        gate = '%s %d' % (r['skill'][0].title(), r['skill'][1]) if r.get('skill') else ''
        rows.append((slug(n), ['<b>%s</b>' % e(n), e(STATIONS.get(r['station'], r['station'] or 'By hand')), costs(r['cost']), ', '.join(fx) or '-', bf or '-', gate or '-', str(D['VALUES'].get(n, '-'))]))
    return table(['Dish', 'Cooked at', 'Ingredients', 'Effect', 'Buff', 'Needs', 'Value'], rows)
def g_animals():
    rows = []
    for k, a in D['ANIMALS'].items():
        rows.append([e(a['name']), link(a['item']), str(a['cap']), '%d days' % a['grow'], link(a['product']), '%d to %d %s' % (a['meat'][0], a['meat'][1], link('Raw Meat')) + (', %d %s' % (a['hide'], link('Hide')) if a.get('hide') else '')])
    return table(['Animal', 'Bought as', 'Most you can keep', 'Grows up in', 'Gives daily', 'Slaughter'], rows)
def mob_places(k):
    out = []
    for z, mobs in D['SPAWN_DEFS'].items():
        if any(m[0] == k for m in mobs): out.append(D['ZONE_NAMES'][int(z)])
    for m in D['MAPDEFS'].values():
        if any(x[0] == k for x in (m.get('mobs') or [])) and m['name'] not in out: out.append(m['name'])
    if k in BOSS_WHERE: out.append(BOSS_WHERE[k])
    return out
def lvl(k):
    lo, hi = D['LVL_OFF'].get(k, [0, 0])
    f = lambda x: 'your level' if x == 0 else ('%+d' % x)
    return f(lo) if lo == hi else '%s to %s' % (f(lo), f(hi))
def g_creatures(boss):
    out = []
    for k, t in D['ENEMY_TYPES'].items():
        isb = bool(t.get('boss')) or k in BOSS_WHERE
        if isb != boss: continue
        drops = ', '.join('%s (%s)' % (link(d['n']), pct(d['c'])) for d in D['DROPS'].get(k, []) if d['n'] not in STORY)
        if k in D['SKULL_FOES']: drops += (', ' if drops else '') + '%s (%s)' % (link('Human Skull'), pct(D['SKULL_FOES'][k]))
        stats = table(['Health', 'Damage', 'Speed', 'XP', 'Level'], [[str(t['hp']), str(t['dmg']), str(t['speed']), str(t['xp']), lvl(k)]])
        out.append('<section class="card" id="%s"><h3>%s</h3><p class="lore">%s</p>%s<p><b>Found in:</b> %s</p><p><b>Drops:</b> %s</p></section>' % (
            k, e(t['name']), e(D['CREATURE_LORE'].get(k, '')), stats, e(', '.join(mob_places(k)) or 'Raids'), drops or 'Nothing worth taking'))
    return ''.join(out)
def g_zones():
    out = []
    for i, z in enumerate(D['ZONE_NAMES']):
        mobs = D['SPAWN_DEFS'].get(str(i)) or next((m['mobs'] for m in D['MAPDEFS'].values() if m['name'] == z and m.get('mobs')), None) or []
        dg = next((x for x in D['DUNGEONS'].values() if x['name'] == z), None)
        extra = ('<p><b>Way in:</b> %s. <b>At the end:</b> %s</p>' % (e(dg['label']), link(dg['reward']))) if dg else ''
        out.append('<section class="card" id="%s"><h3>%s</h3><p class="lore">%s</p>%s<p><b>Creatures:</b> %s</p></section>' % (
            slug(z), e(z), e(D['PLACE_LORE'].get(z, '')), extra, ', '.join('<a href="creatures.html#%s">%s</a>' % (m[0], e(ENAME.get(m[0], m[0]))) for m in mobs) or 'People, mostly'))
    return ''.join(out)
def g_hull_buildings():
    rows = []
    for b in D['HB']:
        if b['kind'] == 'house': continue
        staff = [r['name'] for r in D['ROSTER'] if r.get('work') and r['work'][0] == b['id']]
        rows.append((slug(b['name']), ['<b>%s</b>' % e(b['name']), 'Shuttered for now' if b['kind'] == 'closed' else e(b['kind'].title()), e(', '.join(staff)) or '-']))
    return table(['Building', 'Kind', 'Who works there'], rows)
def g_hull_people():
    bn = {b['id']: b['name'] for b in D['HB']}
    rows = []
    for r in D['ROSTER']:
        place = bn.get(r['work'][0]) if r.get('work') else {'dock1': 'The dock', 'dock2': 'The dock', 'bench': 'A plaza bench', 'plaza1': 'The plaza', 'gate1': 'The gate'}.get(r.get('post'), 'Around town')
        rows.append((slug(r['name']), ['<b>%s</b>' % e(r['name']), e(r['job']), e(place), e(bn.get(r['home'][0], '-')), e(SCHED.get(r['sched'], ''))]))
    return table(['Name', 'Job', 'Works at', 'Lives at', 'Routine'], rows)
def g_hull_vendors():
    out = []
    for r in D['ROSTER']:
        v = r.get('vendor')
        if not v: continue
        stock = D['VENDOR_STOCK'].get(v, {})
        if any(x.get('vendor') == v for x in D['ROSTER'][:D['ROSTER'].index(r)]): continue
        always = sorted(n for n, rep in stock.items() if rep <= 0 and n not in STORY)
        gated = sorted((rep, n) for n, rep in stock.items() if rep > 0)
        g = ''.join('<li>Hull reputation %d: %s</li>' % (rep, ', '.join(link(n) for rr, n in gated if rr == rep)) for rep in sorted({x[0] for x in gated}))
        out.append('<section class="card" id="vendor-%s"><h3>%s <span class="dim">(%s)</span></h3><p><b>May stock:</b> %s</p>%s</section>' % (
            v, e(VNAME.get(v, v)), e(r['name']), ', '.join(link(n) for n in always), '<ul>%s</ul>' % g if g else ''))
    return ''.join(out)
def g_hull_jobs():
    return table(['Job', 'What it asks', 'Reward'], [(m['id'], ['<b>%s</b>' % e(m['title']), e(m['blurb']), '%d XP, %s' % (m['reward']['xp'], ilist(m['reward']['items']))]) for m in D['MISSIONS']])
RUIN = {'outpost': 'a ruined outpost', 'shed': 'a ruined shed', 'cabin': 'an old cabin', 'hut': 'a hut', 'bunker': 'a bunker', 'house': 'a ruined house', 'shack': 'a shack'}
def g_survivors():
    out = []
    for s in D['SURVIVOR_DEFS']:
        q = D['SURV_QUESTS'].get(s['name'], {}); sk = s['skills']
        steps = ''.join('<li>%s</li>' % e(st['text']) for st in q.get('steps', []))
        quest = '<p><b>Their favour: %s.</b> &ldquo;%s&rdquo;</p><ol>%s</ol><p><b>Reward:</b> %d XP, %s</p>' % (e(q['title']), e(q['intro']), steps, q['reward']['xp'], ilist(q['reward']['items'])) if q else ''
        out.append('<section class="card" id="%s"><h3>%s</h3><p class="lore">%s</p><p><b>Found at:</b> %s. <b>Skills:</b> Farm %d, Guard %d, Haul %d</p>%s</section>' % (
            slug(s['name']), e(s['name']), e(D['BIO2'].get(s['name'], s['bio'])), RUIN.get(s['ruin'], s['ruin']), sk['farm'], sk['guard'], sk['haul'], quest))
    return ''.join(out)
def g_starter_quests():
    out = []
    for q in D['QUEST_DEFS']:
        if q['id'] in STORY_QUESTS or q['id'].startswith(('sq_', 'bm_')): continue
        steps = ''.join('<li>%s</li>' % e(s['text']) for s in q['steps'])
        out.append('<section class="card" id="q-%s"><h3>%s</h3><p class="lore">%s</p><ol>%s</ol><p><b>Reward:</b> %d XP, %s</p></section>' % (q['id'], e(q['title']), e(q['desc']), steps, q['reward']['xp'], ilist(q['reward']['items'])))
    return ''.join(out)
def g_changelog():
    txt = open(os.path.join(ROOT, 'CHANGELOG.md'), encoding='utf-8').read()
    out = []
    for line in txt.splitlines():
        if line.startswith('## '): out.append('<h3>Version %s</h3><ul>' % e(line[3:]))
        elif line.startswith('- ') and out: out[-1] += '<li>%s</li>' % e(line[2:])
    return ''.join(x + '</ul>' for x in out)

GEN = {'difficulty': g_difficulty, 'survival': g_survival, 'healing': g_healing, 'buffs': g_buffs, 'camp_levels': g_camp_levels, 'raids': g_raids, 'jobs': g_jobs,
       'skills': g_skills, 'recipes': g_recipes, 'blueprints': g_blueprints, 'weapons_melee': lambda: g_weapons('melee'), 'weapons_ranged': lambda: g_weapons('gun'),
       'ammo': g_ammo, 'armour': g_armour, 'tools': g_tools, 'items_materials': g_items_materials, 'items_food': g_items_food, 'items_medicine': g_items_medicine,
       'items_blueprints': g_items_blueprints, 'crops': g_crops, 'produce': g_produce, 'cooking': g_cooking, 'animals': g_animals, 'creatures': lambda: g_creatures(False),
       'bosses': lambda: g_creatures(True), 'zones': g_zones, 'hull_buildings': g_hull_buildings, 'hull_people': g_hull_people, 'hull_vendors': g_hull_vendors,
       'hull_jobs': g_hull_jobs, 'survivors': g_survivors, 'starter_quests': g_starter_quests, 'changelog': g_changelog}

ORDER = ['index', 'getting-started', 'survival', 'settlement', 'skills', 'crafting', 'weapons', 'armour', 'items', 'farming', 'creatures', 'places', 'the-hull', 'people', 'quests', 'whats-new']
CSS = open(os.path.join(SRC, 'wiki.css'), encoding='utf-8').read()
def read_page(name):
    raw = open(os.path.join(SRC, name + '.html'), encoding='utf-8').read()
    m = re.match(r'<!-- title: (.*?) \| (.*?) -->\n', raw)
    if not m: raise SystemExit(name + '.html needs a title line')
    return m.group(1), m.group(2), raw[m.end():]
PAGES = {n: read_page(n) for n in ORDER}
# crops first, so produce links resolve to the farming page
g_crops()
VERSION = open(os.path.join(HERE, 'VERSION')).read().strip()
os.makedirs(OUT, exist_ok=True)
index = []
for name in ORDER:
    title, blurb, body = PAGES[name]
    for key in re.findall(r'<!-- gen:(\w+) -->', body):
        if key not in GEN: raise SystemExit('%s.html: unknown block %s' % (name, key))
        body = body.replace('<!-- gen:%s -->' % key, GEN[key]())
    body = re.sub(r'<h2>([^<]+)</h2>', lambda m: '<h2 id="%s">%s</h2>' % (slug(m.group(1)), m.group(1)), body)
    for i, t in re.findall(r'<(?:section|tr|h3)[^>]* id="([^"]+)"[^>]*>\s*(?:<td>)?\s*(?:<h3>)?(?:<b>)?([^<]+)', body):
        index.append({'t': html.unescape(t.strip()), 'u': '%s.html#%s' % (name, i), 'p': title})
    if name != 'index': index.append({'t': title, 'u': name + '.html', 'p': 'Page'})
    nav = ''.join('<a href="%s.html"%s>%s</a>' % (n, ' aria-current="page"' if n == name else '', e(PAGES[n][0] if n != 'index' else 'Home')) for n in ORDER)
    page = '''<!doctype html>
<html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>%s</title><meta name="description" content="%s">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;600&display=swap" rel="stylesheet">
<style>%s</style></head>
<body><header><a class="brand" href="index.html">Wasteland Settlement <span>Wiki</span></a><a class="play" href="../index.html">Play the game</a>
<button class="menu" aria-expanded="false" aria-controls="nav" onclick="document.body.classList.toggle('navopen');this.setAttribute('aria-expanded',document.body.classList.contains('navopen'))">Pages</button></header>
<div class="wrap"><nav id="nav">%s</nav><main><h1>%s</h1><p class="blurb">%s</p>%s
<footer>Written for version %s. Numbers on these pages come straight from the game, so they match the build. No story spoilers.</footer></main></div>
<script src="search.js"></script></body></html>''' % (e(title if name != 'index' else 'Wasteland Settlement Wiki'), e(blurb), CSS, nav, e(title), e(blurb), body, e(VERSION))
    open(os.path.join(OUT, name + '.html'), 'w', encoding='utf-8').write(page)
seen = set(); idx = [x for x in index if not (x['u'] in seen or seen.add(x['u']))]
js = open(os.path.join(SRC, 'search.js'), encoding='utf-8').read()
open(os.path.join(OUT, 'search.js'), 'w', encoding='utf-8').write('const WIKI_INDEX = ' + json.dumps(idx, ensure_ascii=False) + ';\n' + js)
missing = sorted(n for n in ALL if n not in SRC_OF and PAGE_OF.get(n) in ('weapons', 'armour'))
print('Wiki: %d pages, %d index entries, written to %s' % (len(ORDER), len(idx), OUT) + ('. No source found for: ' + ', '.join(missing) if missing else ''))
