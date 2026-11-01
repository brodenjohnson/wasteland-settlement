/* =====================================================================
   AI_ARSENAL: every weapon gets its own art, three wastelander armour sets,
   weapon and armour benches, skulls, pikes, and raider-style building
   ===================================================================== */
/* ---------- New weapons ---------- */
Object.assign(WEAPONS, {
  'Rebar Club': { kind: 'melee', dmg: 18, cd: 0.42, reach: 22, kb: 170, col: '#7a6a5a' },
  'Cattle Prod': { kind: 'melee', dmg: 26, cd: 0.5, reach: 24, kb: 100, col: '#d6c84a' },
  'Skull Mace': { kind: 'melee', dmg: 46, cd: 0.62, reach: 23, kb: 240, col: '#cfc8b0' },
  'Ripsaw': { kind: 'melee', dmg: 74, cd: 0.95, reach: 26, kb: 260, col: '#c0c4c8' },
  'Zip Gun': { kind: 'gun', dmg: 20, cd: 0.45, speed: 220, range: 150, ammo: 'Pistol rounds', col: '#6a6a74' },
  'Road Rifle': { kind: 'gun', dmg: 44, cd: 0.8, speed: 290, range: 240, ammo: 'Pistol rounds', col: '#6a5a4a' },
  'Scatter Pipe': { kind: 'gun', dmg: 12, pellets: 7, spread: 0.4, cd: 1.0, speed: 240, range: 105, ammo: 'Shells', col: '#8a8d94' },
  'Harpoon Gun': { kind: 'gun', dmg: 70, cd: 1.5, speed: 330, range: 260, ammo: 'Bolts', col: '#4a4e56' }
});
const NEW_ARM = {
  'Welder Mask': { slot: 'head', dmg: 0.07, col: '#5a5e66' }, 'Tyre Harness': { slot: 'body', dmg: 0.16, col: '#2a2a2e' }, 'Hose Greaves': { slot: 'legs', dmg: 0.11, col: '#2a2a2e' }, 'Work Boots': { slot: 'feet', dmg: 0.06, col: '#5a4a2a' },
  'Skull Helm': { slot: 'head', dmg: 0.12, col: '#4a3a2a' }, 'Bone Harness': { slot: 'body', dmg: 0.22, col: '#4a3a2a' }, 'Spiked Leggings': { slot: 'legs', dmg: 0.15, col: '#4a3a2a' }, 'Bone Boots': { slot: 'feet', dmg: 0.09, col: '#4a3a2a' },
  'Hockey Helm': { slot: 'head', dmg: 0.13, col: '#e8e4da' }, 'Plate Duster': { slot: 'body', dmg: 0.25, rad: 0.05, col: '#4a3e32' }, 'Chain Greaves': { slot: 'legs', dmg: 0.17, col: '#6a6e76' }, 'Steel Toe Boots': { slot: 'feet', dmg: 0.10, col: '#3a3a40' },
  'Skull Necklace': { slot: 'acc', dmg: 0.06, col: '#e6e0cc' }
};
Object.assign(ARMOUR, NEW_ARM);
for (const k of Object.keys(ARMOUR)) { if (typeof ARMOUR[k].rad !== 'number') ARMOUR[k].rad = 0; if (typeof ARMOUR[k].dmg !== 'number') ARMOUR[k].dmg = 0; }
ITEM_COL['Human Skull'] = '#e6e0cc'; ITEM_STACK['Human Skull'] = 20; ITEM_DESC['Human Skull'] = 'Somebody\u2019s. Raiders collect them. So, it turns out, can you.';
for (const k of [...Object.keys(NEW_ARM), 'Rebar Club', 'Cattle Prod', 'Skull Mace', 'Ripsaw', 'Zip Gun', 'Road Rifle', 'Scatter Pipe', 'Harpoon Gun']) { ITEM_COL[k] = (WEAPONS[k] || ARMOUR[k]).col; ITEM_STACK[k] = 1; }
Object.assign(ITEM_DESC, { 'Rebar Club': 'A length of rebar with a lump of concrete still on the end.', 'Cattle Prod': 'Still holds a charge, and it stings.', 'Skull Mace': 'Heavy, ugly and exactly the point.', 'Ripsaw': 'A chainsaw bar on a frame. It screams, and so does what it hits.', 'Zip Gun': 'One pipe, one nail, one rubber band. Do not trust it with your hand.', 'Road Rifle': 'A lever-action built from road signs and spite.', 'Scatter Pipe': 'Two pipes wired together. Close range only.', 'Harpoon Gun': 'Fires a barbed bolt hard enough to pin a man to a door.',
  'Welder Mask': 'A welder\u2019s helmet with the lens knocked out and a better one put in.', 'Tyre Harness': 'Straps and a cut tyre over the shoulders. Surprisingly good.', 'Hose Greaves': 'Coiled hose bound round the shins.', 'Work Boots': 'Steel-toed, resoled twice and yellow-laced.',
  'Skull Helm': 'A leather cap with a skull stitched to the front.', 'Bone Harness': 'Ribs, mostly human, laced across a leather vest.', 'Spiked Leggings': 'Studded leather with the studs pointing outward.', 'Bone Boots': 'Shin guards made from things that used to be shins.',
  'Hockey Helm': 'A goalie mask with the paint chipped off. It makes a fine face.', 'Plate Duster': 'A long leather coat with road-sign plates sewn in.', 'Chain Greaves': 'Chain link wrapped and wired over the legs.', 'Steel Toe Boots': 'Boots that will go through a door, or a person.', 'Skull Necklace': 'A string of small skulls. People notice.' });
Object.assign(VALUE, { 'Human Skull': 6, 'Rebar Club': 14, 'Cattle Prod': 34, 'Skull Mace': 56, 'Ripsaw': 96, 'Zip Gun': 12, 'Road Rifle': 64, 'Scatter Pipe': 52, 'Harpoon Gun': 110,
  'Welder Mask': 18, 'Tyre Harness': 36, 'Hose Greaves': 22, 'Work Boots': 14, 'Skull Helm': 34, 'Bone Harness': 62, 'Spiked Leggings': 38, 'Bone Boots': 26, 'Hockey Helm': 40, 'Plate Duster': 74, 'Chain Greaves': 46, 'Steel Toe Boots': 30, 'Skull Necklace': 30 });

/* ---------- Art: every weapon, and the new gear ---------- */
const WEAPON_ART = {
  'Rusty Pipe': (q, c) => { q(c, 7, 0, 3, 12); q('#a89a86', 7, 0, 1, 12); q('#5a4a3a', 7, 3, 3, 1); q('#2a2a2a', 7, 9, 3, 5); q('#c8c0a0', 7, 10, 3, 1); q('#c8c0a0', 7, 12, 3, 1); },
  'Machete': (q, c) => { q(c, 9, 0, 2, 2); q(c, 8, 2, 3, 7); q('#f0f0f6', 8, 2, 1, 7); q('#6a6c72', 11, 2, 1, 7); q('#3a3a3a', 6, 9, 5, 1); q('#5a3a22', 7, 10, 3, 5); q('#2a1c10', 7, 11, 3, 1); q('#2a1c10', 7, 13, 3, 1); },
  'Combat Cleaver': (q, c) => { q(c, 5, 1, 7, 8); q('#f0f0f6', 5, 1, 1, 8); q('#1c1410', 9, 3, 2, 2); q('#8a8d94', 5, 8, 7, 1); q('#3b2a1c', 6, 9, 5, 1); q('#3b2a1c', 7, 10, 3, 5); q('#a8532a', 7, 12, 3, 1); },
  'Chain Cleaver': (q, c) => { q('#9a9ea6', 5, 1, 7, 8); q('#f0f0f6', 5, 1, 1, 8); q('#4a4e56', 11, 2, 1, 1); q('#4a4e56', 11, 4, 1, 1); q('#4a4e56', 11, 6, 1, 1); q('#3b2a1c', 6, 9, 5, 1); q('#3b2a1c', 7, 10, 3, 4); q('#c8c8d0', 4, 10, 1, 1); q('#c8c8d0', 3, 11, 1, 1); q('#c8c8d0', 4, 12, 1, 1); q('#c8c8d0', 3, 13, 1, 1); },
  'Spear': (q, c) => { q('#7a5a30', 7, 3, 2, 13); q('#d4dae2', 7, 0, 2, 4); q('#f0f0f6', 7, 0, 1, 3); q('#d4dae2', 6, 3, 4, 1); q('#c0392b', 9, 6, 2, 2); q('#c0392b', 9, 8, 1, 2); },
  'Crowbar': (q, c) => { q('#4a4e56', 7, 3, 2, 12); q('#4a4e56', 5, 0, 4, 2); q('#4a4e56', 5, 0, 2, 4); q('#6a6e76', 6, 14, 4, 2); q('#a8302a', 7, 9, 2, 3); },
  'Nail Board': (q, c) => { q('#9a7a4a', 6, 0, 4, 14); q('#7a5a30', 7, 2, 1, 9); q('#c8c8d0', 5, 2, 1, 1); q('#c8c8d0', 10, 4, 1, 1); q('#c8c8d0', 5, 6, 1, 1); q('#c8c8d0', 10, 8, 1, 1); q('#2a2a2a', 6, 10, 4, 4); },
  'Fire Axe': (q, c) => { q('#7a5a30', 7, 4, 2, 12); q('#d4dae2', 3, 1, 4, 6); q('#f0f0f6', 3, 1, 1, 6); q('#c0392b', 7, 1, 3, 5); q('#8a2a22', 7, 5, 3, 1); },
  'Sledgehammer': (q, c) => { q('#7a5a30', 7, 5, 2, 11); q('#8a8d94', 3, 1, 10, 5); q('#f0f0f6', 3, 1, 10, 1); q('#3a3a42', 3, 5, 10, 1); q('#3a3a42', 7, 6, 2, 1); q('#2a2a2a', 7, 12, 2, 4); },
  'Raider Blade': (q, c) => { q(c, 7, 0, 3, 10); q('#f0f0f6', 7, 0, 1, 10); q(c, 6, 1, 1, 1); q(c, 10, 2, 1, 1); q(c, 6, 4, 1, 1); q(c, 10, 5, 1, 1); q(c, 6, 7, 1, 1); q('#7d1418', 7, 10, 3, 3); q('#e6e0cc', 7, 13, 3, 2); },
  'Shiv': (q, c) => { q(c, 8, 4, 2, 7); q('#f0f0f6', 8, 4, 1, 7); q('#6a5a3a', 7, 11, 4, 4); q('#c8c0a0', 7, 12, 4, 1); },
  "Kingpin's Cleaver": (q, c) => { q('#d6a84a', 5, 1, 7, 8); q('#f0f0f6', 5, 1, 1, 8); q('#8a6a20', 9, 3, 2, 2); q('#e8c24a', 5, 8, 7, 1); q('#e8c24a', 6, 9, 5, 1); q('#3b2a1c', 7, 10, 3, 5); q('#7d1418', 7, 12, 3, 1); },
  'Hollowclaw Talon': (q, c) => { q('#e6e0cc', 9, 0, 2, 3); q('#e6e0cc', 8, 3, 3, 4); q('#c8c0a8', 7, 6, 3, 4); q('#9a9078', 7, 9, 2, 1); q('#6a6a74', 7, 10, 3, 1); q('#3b2a1c', 7, 11, 3, 4); q('#6a6a74', 7, 13, 3, 1); },
  'Rebar Club': (q, c) => { q('#7a6a5a', 7, 0, 3, 13); q('#5a4a3a', 7, 2, 3, 1); q('#5a4a3a', 7, 5, 3, 1); q('#5a4a3a', 7, 8, 3, 1); q('#9a9a94', 6, 0, 5, 3); q('#7a7a76', 6, 2, 5, 1); q('#2a2a2a', 7, 11, 3, 4); },
  'Cattle Prod': (q, c) => { q('#3a3a42', 7, 3, 2, 11); q('#d6c84a', 6, 0, 4, 3); q('#8fe8ff', 5, 1, 1, 1); q('#8fe8ff', 10, 0, 1, 1); q('#8fe8ff', 10, 2, 1, 1); q('#3b2a1c', 7, 10, 2, 5); q('#c0392b', 7, 8, 2, 1); },
  'Skull Mace': (q, c) => { q('#6b4a2b', 7, 6, 2, 10); q('#e6e0cc', 5, 0, 6, 6); q('#c8c0a8', 5, 5, 6, 1); q('#1c1410', 6, 2, 1, 2); q('#1c1410', 9, 2, 1, 2); q('#1c1410', 7, 4, 2, 1); q('#c8c8d0', 4, 1, 1, 2); q('#c8c8d0', 11, 1, 1, 2); q('#c8c8d0', 7, 0, 2, 1); },
  'Ripsaw': (q, c) => { q('#c0c4c8', 7, 0, 2, 9); q('#3a3a42', 6, 1, 1, 1); q('#3a3a42', 9, 2, 1, 1); q('#3a3a42', 6, 3, 1, 1); q('#3a3a42', 9, 4, 1, 1); q('#3a3a42', 6, 5, 1, 1); q('#3a3a42', 9, 6, 1, 1); q('#a8501e', 5, 8, 6, 5); q('#7d3414', 5, 12, 6, 1); q('#2a2a2a', 6, 13, 4, 2); q('#e8c24a', 9, 9, 1, 1); },
  'Pipe Pistol': (q, c) => { q('#6a6a74', 3, 5, 11, 2); q('#c8c0a0', 5, 5, 1, 2); q('#c8c0a0', 9, 5, 1, 2); q('#2a2a30', 13, 5, 2, 2); q('#5a3a22', 3, 7, 3, 5); q('#2a2a30', 7, 7, 1, 2); },
  'Zip Gun': (q, c) => { q('#6a6a74', 5, 5, 8, 2); q('#8a6a3a', 3, 6, 3, 4); q('#c0392b', 7, 5, 1, 3); q('#c8c8d0', 11, 7, 1, 1); q('#2a2a30', 12, 5, 1, 2); },
  'Revolver': (q, c) => { q('#6a6a74', 8, 5, 7, 2); q('#8a8d94', 6, 4, 3, 4); q('#c8c8d0', 6, 4, 3, 1); q('#4a4a52', 3, 5, 4, 3); q('#5a3a22', 2, 7, 3, 5); q('#2a2a30', 5, 8, 1, 2); },
  'Rattler SMG': (q, c) => { q('#5a5a62', 2, 5, 12, 3); q('#7a7a82', 2, 5, 12, 1); q('#2a2a30', 6, 8, 2, 6); q('#2a2a30', 13, 5, 3, 2); q('#3b2a1c', 0, 5, 3, 2); q('#2a2a30', 4, 8, 2, 3); },
  'Sawn-off Shotgun': (q, c) => { q('#6a6a74', 7, 4, 9, 2); q('#6a6a74', 7, 6, 9, 2); q('#9a9ea6', 7, 4, 9, 1); q('#6a4a2a', 1, 6, 7, 3); q('#3a2a1a', 1, 8, 5, 3); q('#2a2a30', 6, 5, 2, 3); },
  'Pump Shotgun': (q, c) => { q('#5a4a3a', 5, 5, 11, 2); q('#4a4a52', 5, 7, 9, 1); q('#3b2a1c', 8, 7, 3, 2); q('#6a4a2a', 0, 6, 6, 3); q('#2a2a30', 6, 6, 2, 3); },
  'Scatter Pipe': (q, c) => { q('#8a8d94', 4, 4, 12, 2); q('#8a8d94', 4, 6, 12, 2); q('#c8c8d0', 4, 4, 12, 1); q('#c0392b', 9, 4, 1, 4); q('#8a6a3a', 0, 6, 5, 3); q('#2a2a30', 15, 5, 1, 2); },
  'Hunting Rifle': (q, c) => { q('#6a4a2a', 0, 6, 5, 3); q('#4a4a52', 5, 6, 11, 2); q('#2a2a30', 7, 4, 5, 2); q('#7fd8ff', 11, 4, 1, 1); q('#6a4a2a', 6, 8, 5, 1); q('#2a2a30', 5, 8, 1, 2); },
  'Road Rifle': (q, c) => { q('#6a4a2a', 0, 6, 6, 3); q('#5a5a62', 6, 6, 10, 2); q('#8a8d94', 6, 6, 10, 1); q('#4a4a52', 5, 8, 3, 2); q('#3a3a42', 6, 9, 2, 1); q('#c8c8d0', 15, 5, 1, 1); },
  'Crossbow': (q, c) => { q('#7a5a3a', 11, 1, 2, 12); q('#e6e0cc', 12, 2, 1, 10); q('#6a4a2a', 2, 6, 10, 3); q('#c8c8d0', 3, 6, 12, 1); q('#3a3a3a', 6, 9, 1, 2); },
  "Warden's Crossbow": (q, c) => { q('#6a5a3a', 11, 1, 2, 12); q('#e6e0cc', 12, 2, 1, 10); q('#4a3a2a', 2, 6, 10, 3); q('#c8a040', 3, 8, 8, 1); q('#e8e4d8', 3, 6, 12, 1); q('#c8a040', 11, 6, 2, 3); },
  'Harpoon Gun': (q, c) => { q('#4a4e56', 4, 5, 11, 3); q('#6a6e76', 4, 5, 11, 1); q('#c8c8d0', 13, 6, 3, 1); q('#c8c8d0', 15, 5, 1, 3); q('#a8501e', 6, 8, 4, 3); q('#7d3414', 6, 10, 4, 1); q('#5a3a22', 2, 6, 3, 5); }
};
const ARMOUR_ART = {
  'Welder Mask': (q, c) => { q(c, 4, 2, 8, 8); q('#7a7e86', 4, 2, 8, 1); q('#14120f', 5, 6, 6, 2); q('#7fd8ff', 5, 6, 2, 1); q('#7fd8ff', 9, 6, 2, 1); q('#3a2a1a', 4, 4, 8, 1); },
  'Skull Helm': (q, c) => { q(c, 4, 3, 8, 6); q('#5a4a3a', 4, 3, 8, 1); q('#e6e0cc', 6, 4, 4, 4); q('#1c1410', 6, 5, 1, 2); q('#1c1410', 9, 5, 1, 2); q('#1c1410', 7, 7, 2, 1); q('#cfc8b0', 3, 2, 1, 3); q('#cfc8b0', 12, 2, 1, 3); },
  'Hockey Helm': (q, c) => { q(c, 4, 2, 8, 10); q('#c8c4ba', 4, 2, 8, 1); q('#c0392b', 4, 4, 8, 1); q('#14120f', 5, 6, 2, 1); q('#14120f', 9, 6, 2, 1); q('#14120f', 6, 9, 1, 1); q('#14120f', 8, 9, 1, 1); q('#14120f', 10, 9, 1, 1); },
  'Tyre Harness': (q, c) => { q('#3a3a40', 3, 4, 10, 10); q('#6a4a2a', 3, 8, 10, 1); q('#6a4a2a', 5, 4, 1, 10); q('#6a4a2a', 10, 4, 1, 10); q(c, 1, 3, 4, 5); q(c, 11, 3, 4, 5); q('#4a4a50', 1, 4, 4, 1); q('#4a4a50', 11, 4, 4, 1); },
  'Bone Harness': (q, c) => { q(c, 3, 3, 10, 11); q('#e6e0cc', 4, 5, 8, 1); q('#e6e0cc', 4, 7, 8, 1); q('#e6e0cc', 4, 9, 8, 1); q('#cfc8b0', 7, 3, 2, 11); q('#e6e0cc', 1, 2, 3, 3); q('#e6e0cc', 12, 2, 3, 3); q('#1c1410', 2, 3, 1, 1); q('#1c1410', 13, 3, 1, 1); },
  'Plate Duster': (q, c) => { q(c, 3, 3, 10, 12); q('#8a8d94', 3, 3, 10, 3); q('#8a8d94', 1, 3, 3, 3); q('#8a8d94', 12, 3, 3, 3); q('#3a2e24', 3, 3, 10, 1); q('#c8a040', 7, 8, 2, 1); q('#2a2218', 7, 6, 2, 9); },
  'Hose Greaves': (q, c) => { q(c, 4, 2, 8, 4); q(c, 4, 6, 3, 8); q(c, 9, 6, 3, 8); q('#c8481e', 4, 7, 3, 1); q('#c8481e', 4, 10, 3, 1); q('#c8481e', 9, 7, 3, 1); q('#c8481e', 9, 10, 3, 1); },
  'Spiked Leggings': (q, c) => { q(c, 4, 2, 8, 4); q(c, 4, 6, 3, 8); q(c, 9, 6, 3, 8); q('#c8c8d0', 3, 7, 1, 2); q('#c8c8d0', 7, 9, 1, 2); q('#c8c8d0', 8, 7, 1, 2); q('#c8c8d0', 12, 9, 1, 2); q('#c8c8d0', 5, 3, 1, 1); q('#c8c8d0', 10, 3, 1, 1); },
  'Chain Greaves': (q, c) => { q(c, 4, 2, 8, 4); q(c, 4, 6, 3, 8); q(c, 9, 6, 3, 8); for (let k = 0; k < 4; k++) { q('#9a9ea6', 4 + (k % 2), 6 + k * 2, 1, 1); q('#9a9ea6', 9 + (k % 2), 6 + k * 2, 1, 1); q('#9a9ea6', 5 + ((k + 1) % 2) * 1, 7 + k * 2, 1, 1); } },
  'Work Boots': (q, c) => { q(c, 2, 6, 5, 7); q(c, 9, 6, 5, 7); q('#e8c24a', 3, 7, 3, 1); q('#e8c24a', 10, 7, 3, 1); q('#14120f', 2, 12, 5, 2); q('#14120f', 9, 12, 5, 2); },
  'Bone Boots': (q, c) => { q(c, 2, 8, 5, 5); q(c, 9, 8, 5, 5); q('#e6e0cc', 2, 4, 5, 4); q('#e6e0cc', 9, 4, 5, 4); q('#cfc8b0', 3, 5, 1, 2); q('#cfc8b0', 10, 5, 1, 2); q('#14120f', 2, 12, 5, 2); q('#14120f', 9, 12, 5, 2); },
  'Steel Toe Boots': (q, c) => { q(c, 2, 5, 5, 8); q(c, 9, 5, 5, 8); q('#c0c4c8', 2, 11, 6, 2); q('#c0c4c8', 9, 11, 6, 2); q('#14120f', 2, 13, 6, 1); q('#14120f', 9, 13, 6, 1); },
  'Skull Necklace': (q, c) => { q('#6a5a3a', 4, 3, 1, 4); q('#6a5a3a', 11, 3, 1, 4); q('#6a5a3a', 5, 7, 1, 1); q('#6a5a3a', 10, 7, 1, 1); q('#e6e0cc', 6, 8, 4, 4); q('#1c1410', 7, 9, 1, 1); q('#1c1410', 9, 9, 1, 1); q('#e6e0cc', 4, 8, 2, 2); q('#e6e0cc', 10, 8, 2, 2); }
};
{ const o = iconTo; iconTo = function (g, name, x, y, s, item) {
  const art = WEAPON_ART[name] || ARMOUR_ART[name];
  if (!art) return o(g, name, x, y, s, item);
  const u = s / 16, col = ITEM_COL[name] || '#cccccc';
  const q = (c, ax, ay, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x + ax * u), Math.round(y + ay * u), Math.max(1, Math.round(w * u)), Math.max(1, Math.round(h * u))); };
  const qc = (a, b, c2, d, e) => (typeof a === 'string' && a[0] === '#') ? q(a, b, c2, d, e) : q(col, a, b, c2, d);
  art(qc, col, item);
}; }
{ const o = overlayHead; overlayHead = function (c, name0, dir, side) {
  const col = ARMOUR[name0] && ARMOUR[name0].col;
  if (name0 === 'Welder Mask') { R(c, col, 3, 0, 12, 9); R(c, shade(col, 26), 4, 0, 8, 1); R(c, '#3a2a1a', 3, 2, 12, 1); if (dir === 0) { R(c, '#14120f', 4, 4, 10, 3); R(c, '#7fd8ff', 5, 5, 3, 1); R(c, '#7fd8ff', 10, 5, 3, 1); } else if (side) { R(c, '#14120f', 9, 4, 5, 3); R(c, '#7fd8ff', 10, 5, 2, 1); } }
  else if (name0 === 'Skull Helm') { R(c, col, 3, 0, 12, 6); R(c, shade(col, 22), 4, 0, 8, 1); R(c, '#cfc8b0', 2, 0, 2, 3); R(c, '#cfc8b0', 14, 0, 2, 3); if (dir === 0) { R(c, '#e6e0cc', 6, 1, 6, 4); R(c, '#14120f', 7, 2, 1, 2); R(c, '#14120f', 10, 2, 1, 2); R(c, '#14120f', 8, 4, 2, 1); } else if (side) { R(c, '#e6e0cc', 9, 1, 4, 3); R(c, '#14120f', 11, 2, 1, 1); } }
  else if (name0 === 'Hockey Helm') { R(c, col, 3, 0, 12, 11); R(c, shade(col, -26), 3, 9, 12, 2); R(c, '#c0392b', 3, 2, 12, 1); if (dir === 0) { R(c, '#14120f', 5, 4, 3, 1); R(c, '#14120f', 10, 4, 3, 1); R(c, '#14120f', 7, 7, 1, 1); R(c, '#14120f', 9, 7, 1, 1); R(c, '#14120f', 11, 7, 1, 1); R(c, '#14120f', 8, 9, 2, 1); } else if (side) { R(c, '#14120f', 10, 4, 3, 1); R(c, '#14120f', 11, 7, 1, 1); R(c, '#14120f', 12, 9, 1, 1); } }
  else o(c, name0, dir, side);
}; }
{ const o = overlayBody; overlayBody = function (c, name0, dir, side) {
  const col = ARMOUR[name0] && ARMOUR[name0].col, tx = side ? 5 : 3, tw = side ? 8 : 12;
  if (name0 === 'Tyre Harness') { R(c, '#3a3a40', tx, 11, tw, 9); R(c, '#6a4a2a', tx, 14, tw, 1); R(c, '#6a4a2a', tx + 1, 11, 1, 9); R(c, '#6a4a2a', tx + tw - 2, 11, 1, 9); R(c, col, tx - 2, 10, 4, 5); R(c, col, tx + tw - 2, 10, 4, 5); R(c, '#4a4a50', tx - 2, 11, 4, 1); R(c, '#4a4a50', tx + tw - 2, 11, 4, 1); R(c, '#c8a040', tx + (tw >> 1), 14, 1, 1); }
  else if (name0 === 'Bone Harness') { R(c, col, tx, 11, tw, 9); R(c, '#e6e0cc', tx + 1, 12, tw - 2, 1); R(c, '#e6e0cc', tx + 1, 14, tw - 2, 1); R(c, '#e6e0cc', tx + 1, 16, tw - 2, 1); R(c, '#cfc8b0', tx + (tw >> 1), 11, 1, 9); R(c, '#e6e0cc', tx - 2, 9, 3, 3); R(c, '#e6e0cc', tx + tw - 1, 9, 3, 3); R(c, '#14120f', tx - 1, 10, 1, 1); R(c, '#14120f', tx + tw, 10, 1, 1); R(c, '#2a2218', tx, 19, tw, 1); }
  else if (name0 === 'Plate Duster') { R(c, col, tx - 1, 11, tw + 2, 12); R(c, '#8a8d94', tx, 11, tw, 3); R(c, shade('#8a8d94', 30), tx, 11, tw, 1); R(c, '#8a8d94', tx - 2, 10, 4, 3); R(c, '#8a8d94', tx + tw - 2, 10, 4, 3); R(c, '#3a2e24', tx, 10, tw, 1); R(c, '#2a2218', tx + (tw >> 1), 14, 1, 9); R(c, '#c8a040', tx + (tw >> 1) - 1, 15, 3, 1); R(c, shade(col, -30), tx - 1, 22, tw + 2, 1); }
  else o(c, name0, dir, side);
}; }
{ const o = overlayLeg; overlayLeg = function (c, name0, x, w, lift) {
  const col = ARMOUR[name0] && ARMOUR[name0].col;
  if (name0 === 'Hose Greaves') { R(c, col, x, 20, w, 6 - lift); R(c, '#c8481e', x, 21, w, 1); R(c, '#c8481e', x, 23, w, 1); R(c, '#14120f', x, 25 - lift, w, 1); }
  else if (name0 === 'Spiked Leggings') { R(c, col, x, 20, w, 6 - lift); R(c, '#c8c8d0', x + 1, 21, 1, 1); R(c, '#c8c8d0', x + w - 2, 23, 1, 1); R(c, '#c8c8d0', x - 1, 22, 1, 2); R(c, '#c8c8d0', x + w, 22, 1, 2); R(c, shade(col, -26), x, 25 - lift, w, 1); }
  else if (name0 === 'Chain Greaves') { R(c, col, x, 20, w, 6 - lift); for (let k = 0; k < 3; k++) { R(c, '#9a9ea6', x + (k % 2), 21 + k * 2, 1, 1); R(c, '#9a9ea6', x + 2 + (k % 2), 22 + k * 2, 1, 1); } R(c, shade(col, -30), x, 25 - lift, w, 1); }
  else o(c, name0, x, w, lift);
}; }
{ const o = overlayFoot; overlayFoot = function (c, name0, x, w, lift) {
  const col = ARMOUR[name0] && ARMOUR[name0].col, y = 25 - lift;
  if (name0 === 'Work Boots') { R(c, col, x - 1, y - 1, w + 2, 4); R(c, '#e8c24a', x, y - 1, w, 1); R(c, '#14120f', x - 1, y + 2, w + 2, 1); }
  else if (name0 === 'Bone Boots') { R(c, col, x - 1, y, w + 2, 3); R(c, '#e6e0cc', x - 1, y - 3, w + 2, 3); R(c, '#cfc8b0', x, y - 2, 1, 1); R(c, '#14120f', x - 1, y + 2, w + 2, 1); }
  else if (name0 === 'Steel Toe Boots') { R(c, col, x - 1, y - 2, w + 2, 5); R(c, '#c0c4c8', x + w - 2, y, 3, 2); R(c, shade(col, 30), x - 1, y - 2, w + 2, 1); R(c, '#14120f', x - 1, y + 2, w + 2, 1); }
  else o(c, name0, x, w, lift);
}; }

/* ---------- Benches and recipes ---------- */
Object.assign(STRUCT_HP, { weaponbench: 140, armourbench: 120, skullpike: 40, barrelfire: 60, tyrewall: 170, banner: 50 });
Object.assign(STATION_NAMES, { weaponbench: 'Weapon Bench', armourbench: 'Armour Bench', skullpike: 'Skull Pike', barrelfire: 'Barrel Fire', tyrewall: 'Tyre Wall', banner: 'Raider Banner' });
LIGHT_R.barrelfire = 74;
const arecipe = (id, cat, name, station, cost, gives, tier, skill) => rc(id, cat, name, station, cost, Object.assign({ gives, tier }, skill ? { skill } : {}));
rc('weaponbench', 'Build', 'Weapon Bench', 'workbench', { 'Wood': 10, 'Scrap': 14, 'Metal plate': 4 }, { place: 'weaponbench', tier: 2, skill: ['crafting', 3] });
rc('armourbench', 'Build', 'Armour Bench', 'workbench', { 'Wood': 8, 'Cloth': 8, 'Scrap': 10, 'Metal plate': 3 }, { place: 'armourbench', tier: 2, skill: ['crafting', 3] });
rc('skullpike', 'Decor', 'Skull Pike', 'workbench', { 'Wood': 3, 'Human Skull': 1 }, { place: 'skullpike', repeat: true, tier: 1 });
rc('barrelfire', 'Decor', 'Barrel Fire', 'workbench', { 'Scrap': 8, 'Wood': 4 }, { place: 'barrelfire', tier: 1 });
rc('tyrewall', 'Structure', 'Tyre Wall', 'workbench', { 'Scrap': 5, 'Cloth': 1 }, { place: 'tyrewall', repeat: true, tier: 1 });
rc('banner', 'Decor', 'Raider Banner', 'workbench', { 'Wood': 3, 'Cloth': 4 }, { place: 'banner', tier: 1 });
arecipe('rebar', 'Weapons', 'Rebar Club', 'workbench', { 'Scrap': 6 }, { 'Rebar Club': 1 }, 1);
arecipe('zipgun', 'Weapons', 'Zip Gun', 'workbench', { 'Scrap': 8, 'Wood': 2 }, { 'Zip Gun': 1 }, 1);
arecipe('prod', 'Weapons', 'Cattle Prod', 'weaponbench', { 'Metal plate': 2, 'Scrap': 6, 'Cloth': 1 }, { 'Cattle Prod': 1 }, 2, ['crafting', 3]);
arecipe('skullmace', 'Weapons', 'Skull Mace', 'weaponbench', { 'Wood': 4, 'Scrap': 8, 'Human Skull': 1 }, { 'Skull Mace': 1 }, 2, ['crafting', 4]);
arecipe('roadrifle', 'Weapons', 'Road Rifle', 'weaponbench', { 'Metal plate': 5, 'Wood': 4, 'Scrap': 6 }, { 'Road Rifle': 1 }, 2, ['combat', 4]);
arecipe('scatter', 'Weapons', 'Scatter Pipe', 'weaponbench', { 'Metal plate': 3, 'Scrap': 8, 'Wood': 2 }, { 'Scatter Pipe': 1 }, 2, ['combat', 4]);
arecipe('ripsaw', 'Weapons', 'Ripsaw', 'weaponbench', { 'Metal plate': 8, 'Scrap': 12, 'Cloth': 2 }, { 'Ripsaw': 1 }, 3, ['crafting', 6]);
arecipe('harpoon', 'Weapons', 'Harpoon Gun', 'weaponbench', { 'Metal plate': 6, 'Scrap': 10, 'Cloth': 2 }, { 'Harpoon Gun': 1 }, 3, ['combat', 6]);
if (!RECIPES.some(r => r.gives && r.gives.Shells)) arecipe('shells', 'Weapons', 'Shells x6', 'weaponbench', { 'Scrap': 3, 'Metal plate': 1 }, { 'Shells': 6 }, 2, ['combat', 3]);
if (!RECIPES.some(r => r.gives && r.gives.Bolts)) arecipe('bolts', 'Weapons', 'Bolts x8', 'weaponbench', { 'Scrap': 3, 'Wood': 1 }, { 'Bolts': 8 }, 2, ['combat', 3]);
[['scav_helm', 'Welder Mask', { 'Scrap': 6, 'Cloth': 1 }, 2, 3], ['scav_body', 'Tyre Harness', { 'Scrap': 10, 'Cloth': 4 }, 2, 3], ['scav_legs', 'Hose Greaves', { 'Scrap': 8, 'Cloth': 3 }, 2, 3], ['scav_feet', 'Work Boots', { 'Scrap': 5, 'Cloth': 2 }, 2, 3],
 ['bone_helm', 'Skull Helm', { 'Scrap': 4, 'Cloth': 2, 'Human Skull': 2 }, 3, 4], ['bone_body', 'Bone Harness', { 'Scrap': 8, 'Cloth': 4, 'Human Skull': 3 }, 3, 4], ['bone_legs', 'Spiked Leggings', { 'Scrap': 8, 'Metal plate': 2, 'Human Skull': 1 }, 3, 4], ['bone_feet', 'Bone Boots', { 'Scrap': 5, 'Cloth': 2, 'Human Skull': 1 }, 3, 4],
 ['cap_helm', 'Hockey Helm', { 'Metal plate': 3, 'Cloth': 2 }, 3, 5], ['cap_body', 'Plate Duster', { 'Metal plate': 7, 'Cloth': 6, 'Scrap': 4 }, 3, 5], ['cap_legs', 'Chain Greaves', { 'Metal plate': 5, 'Scrap': 6 }, 3, 5], ['cap_feet', 'Steel Toe Boots', { 'Metal plate': 3, 'Cloth': 2 }, 3, 5],
 ['skull_neck', 'Skull Necklace', { 'Human Skull': 2, 'Scrap': 1 }, 2, 3]].forEach(([id, name, cost, tier, lvl]) => arecipe(id, 'Armour', name, 'armourbench', cost, { [name]: 1 }, tier, ['crafting', lvl]));
Object.assign(RECIPE_DESC, { weaponbench: 'A vise, a grinder and a wall of hooks. New weapons, shells and bolts are made here.', armourbench: 'A dressmaker\u2019s dummy bolted to a welding table. Wastelander armour is made here.', skullpike: 'A skull on a pike. Raiders hesitate when they see it, which is the whole point. Each one weakens raiders by 2%, up to 20%.', barrelfire: 'An oil drum with a fire in it. Lights the night and keeps the dark back.', tyrewall: 'Stacked tyres packed with dirt. Cheap and hard to break.', banner: 'A rag on a pole. It says who lives here.' });
['weaponbench', 'armourbench', 'barrelfire', 'banner'].forEach(id => { const r = RECIPES.find(q => q.id === id); KIT_BY_NAME['Kit: ' + r.name] = r; ITEM_COL['Kit: ' + r.name] = '#c8a062'; ITEM_DESC['Kit: ' + r.name] = 'A packed up ' + r.name + '. Put it on the hotbar, then click to set it down.'; ITEM_STACK['Kit: ' + r.name] = 1; });
STRUCT_SPR.weaponbench = { h: 16, paint: c => { R(c, '#3a2e22', 1, 8, 14, 7); R(c, '#5a4630', 1, 8, 14, 2); R(c, '#2a2118', 2, 14, 2, 2); R(c, '#2a2118', 12, 14, 2, 2); R(c, '#6a6e76', 2, 5, 4, 3); R(c, '#9a9ea6', 2, 5, 4, 1); R(c, '#4a4e56', 9, 3, 5, 5); R(c, '#c8c8d0', 10, 4, 3, 1); R(c, '#a8501e', 7, 6, 2, 2); R(c, '#3a3a42', 3, 2, 1, 3); R(c, '#8a8d94', 6, 1, 4, 1); } };
STRUCT_SPR.armourbench = { h: 16, paint: c => { R(c, '#3a2e22', 1, 10, 14, 5); R(c, '#5a4630', 1, 10, 14, 2); R(c, '#2a2118', 2, 14, 2, 2); R(c, '#2a2118', 12, 14, 2, 2); R(c, '#6a4a2a', 7, 2, 2, 8); R(c, '#4a3a2a', 5, 3, 6, 5); R(c, '#8a8d94', 5, 3, 6, 1); R(c, '#e8c24a', 7, 5, 2, 1); R(c, '#c8481e', 11, 7, 3, 3); R(c, '#e6e0cc', 2, 8, 3, 2); } };
STRUCT_SPR.skullpike = { h: 24, paint: c => { R(c, '#5a4a30', 7, 6, 2, 17); R(c, '#3a2e1c', 7, 6, 1, 17); R(c, '#e6e0cc', 5, 1, 6, 6); R(c, '#c8c0a8', 5, 6, 6, 1); R(c, '#1c1410', 6, 3, 1, 2); R(c, '#1c1410', 9, 3, 1, 2); R(c, '#1c1410', 7, 5, 2, 1); R(c, '#e6e0cc', 4, 9, 3, 3); R(c, '#e6e0cc', 9, 13, 3, 3); R(c, '#1c1410', 5, 10, 1, 1); R(c, '#1c1410', 10, 14, 1, 1); R(c, '#2a2218', 5, 22, 6, 1); R(c, '#7d1418', 7, 8, 2, 1); } };
STRUCT_SPR.barrelfire = { h: 20, paint: c => { R(c, '#5a3a2a', 3, 8, 10, 10); R(c, '#7a4a32', 3, 8, 10, 2); R(c, '#3a2418', 3, 14, 10, 1); R(c, '#2a2a2e', 3, 11, 10, 1); R(c, '#14120f', 4, 7, 8, 2); R(c, '#e8803a', 5, 3, 6, 5); R(c, '#ffd36b', 6, 4, 4, 3); R(c, '#fff0b0', 7, 5, 2, 2); R(c, '#c0392b', 5, 5, 1, 2); R(c, '#c0392b', 10, 4, 1, 3); } };
STRUCT_SPR.tyrewall = { h: 16, paint: c => { for (let k = 0; k < 2; k++) for (let j = 0; j < 2; j++) { const x = 1 + j * 7, y = 1 + k * 7; R(c, '#1c1c20', x, y, 7, 7); R(c, '#2a2a30', x + 1, y + 1, 5, 5); R(c, '#14120f', x + 2, y + 2, 3, 3); R(c, '#3a3a40', x, y, 7, 1); } R(c, '#5a4630', 1, 14, 14, 1); } };
STRUCT_SPR.banner = { h: 24, paint: c => { R(c, '#5a4a30', 3, 2, 2, 21); R(c, '#7d1418', 5, 3, 9, 9); R(c, '#9a1a1e', 5, 3, 9, 2); R(c, '#5a0c10', 5, 11, 9, 1); R(c, '#e6e0cc', 8, 5, 4, 3); R(c, '#1c1410', 9, 6, 1, 1); R(c, '#1c1410', 11, 6, 1, 1); R(c, '#e6e0cc', 9, 8, 2, 1); R(c, '#7d1418', 7, 12, 2, 2); R(c, '#7d1418', 11, 12, 2, 1); R(c, '#2a2218', 1, 22, 6, 1); } };

/* ---------- Skulls: where they come from, and what a pike does ---------- */
const SKULL_FOES = { gunner: 0.22, scrapper: 0.22, sapper: 0.2, sniper: 0.25, zealot: 0.25, chief: 1, kingpin: 1 };
{ const o = killEnemy; killEnemy = function (e) {
  o(e);
  const ch = SKULL_FOES[e.type];
  if (ch && Math.random() < ch) { const n = e.type === 'chief' ? 2 : e.type === 'kingpin' ? 3 : 1; state.drops.push({ x: e.x + 4, y: e.y, name: 'Human Skull', qty: n, t: 0 }); }
}; }
function pikeCount() { let n = 0; for (const [i, s] of structs) if (s.type === 'skullpike' && (!CAMP.active || inCampTile(i))) n++; return n; }
{ const o = updateEnemies; updateEnemies = function (dt) {
  if (state.map === 'wastes') for (const e of enemies) if (e.raid && !e._fear) { e._fear = true; const f = 1 - Math.min(0.2, 0.02 * pikeCount()); if (f < 1) { e.hp = Math.round(e.hp * f); e.maxHp = Math.round((e.maxHp || e.hp) * f); } }
  o(dt);
}; }
{ const o = genStock; genStock = function () {
  const stock = o(), pool = ['Rebar Club', 'Zip Gun', 'Cattle Prod', 'Road Rifle', 'Welder Mask', 'Tyre Harness', 'Work Boots', 'Hose Greaves', 'Skull Necklace'], nm = pool[Math.floor(Math.random() * pool.length)];
  if (!stock.some(s => s.name === nm)) stock.push({ name: nm, qty: 1, price: Math.max(2, Math.ceil(itemValue(nm) * 1.9)) });
  return stock;
}; }
Object.assign(DBG, { WEAPON_ART, ARMOUR_ART, pikeCount, iconTo, overlayHead, overlayBody, overlayLeg, overlayFoot, genStock, killEnemy });
