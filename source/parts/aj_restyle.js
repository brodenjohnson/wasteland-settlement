/* =====================================================================
   AJ_RESTYLE: a grittier look for every older item, and a rebalance of
   weapon power and prices so each tier sits where it should
   ===================================================================== */
/* ---------- Rebalance ---------- */
Object.assign(WEAPONS['Hollowclaw Talon'], { dmg: 52, cd: 0.42 });
WEAPONS["Kingpin's Cleaver"].dmg = 50; WEAPONS['Raider Blade'].dmg = 40;
WEAPONS['Hunting Rifle'].dmg = 64; WEAPONS['Road Rifle'].dmg = 48; WEAPONS['Road Rifle'].cd = 0.75; WEAPONS['Harpoon Gun'].dmg = 90; WEAPONS['Sledgehammer'].dmg = 72; WEAPONS['Sawn-off Shotgun'].dmg = 13; WEAPONS['Crossbow'].dmg = 46;
function wDps(w) { return w.dmg * (w.pellets || 1) * (w.pellets ? 0.7 : 1) / w.cd; }
for (const [n, w] of Object.entries(WEAPONS)) VALUE[n] = Math.max(8, Math.round(wDps(w) * 0.9 + (w.kind === 'gun' ? 5 : 0)));
for (const [n, a] of Object.entries(ARMOUR)) VALUE[n] = Math.max(6, Math.round(a.dmg * 240 + a.rad * 100));

/* ---------- Tools ---------- */
const canFill = (name, item) => { const d = CAN_DEF[name] || CAN_DEF['Watering Can']; return item && item.water > 0 ? Math.min(1, item.water / d.cap) : 0; };
Object.assign(WEAPON_ART, {
  'Rusty Hatchet': q => { q('#6a4a2b', 7, 5, 2, 10); q('#8a8d94', 3, 2, 5, 5); q('#d0d0d8', 3, 2, 1, 5); q('#a8532a', 5, 3, 2, 2); q('#2a2a2a', 7, 6, 2, 1); q('#2a2a2a', 7, 12, 2, 3); },
  'Woodcutter Axe': q => { q('#7a5a30', 7, 4, 2, 12); q('#b8bec6', 2, 1, 6, 6); q('#f0f0f6', 2, 1, 1, 6); q('#4a4e56', 8, 2, 2, 3); q('#6a6e76', 4, 6, 4, 1); q('#2a2a2a', 7, 12, 2, 3); },
  'Chopper': q => { q('#6a4a2b', 7, 4, 2, 12); q('#6a6e76', 2, 1, 7, 7); q('#d0d4dc', 2, 1, 1, 7); q('#1c1410', 6, 1, 1, 2); q('#c0392b', 8, 2, 2, 5); q('#2a2a2a', 7, 11, 2, 4); q('#c8c8d0', 4, 3, 2, 1); },
  'Rusty Pick': q => { q('#6a4a2b', 7, 4, 2, 11); q('#8a8d94', 2, 3, 12, 2); q('#8a8d94', 2, 4, 2, 2); q('#8a8d94', 12, 4, 2, 2); q('#a8532a', 5, 3, 2, 1); q('#a8532a', 10, 3, 1, 1); q('#d0d0d8', 2, 3, 12, 1); },
  'Miners Pick': q => { q('#7a5a30', 7, 4, 2, 11); q('#9aa0a8', 1, 3, 14, 2); q('#9aa0a8', 1, 4, 2, 3); q('#9aa0a8', 13, 4, 2, 3); q('#e8c24a', 7, 11, 2, 3); q('#f0f0f6', 1, 3, 14, 1); q('#4a4e56', 6, 5, 4, 1); },
  'Drill Pick': q => { q('#2a2a2e', 7, 5, 2, 10); q('#c0c4c8', 7, 0, 2, 5); q('#6a6e76', 6, 1, 1, 1); q('#6a6e76', 9, 2, 1, 1); q('#6a6e76', 6, 3, 1, 1); q('#9aa0a8', 2, 4, 12, 2); q('#9aa0a8', 2, 5, 2, 2); q('#9aa0a8', 12, 5, 2, 2); q('#c0392b', 7, 8, 2, 1); },
  'Hoe': q => { q('#6a4a2b', 7, 3, 2, 12); q('#8a8d94', 7, 2, 7, 2); q('#8a8d94', 12, 3, 2, 3); q('#d0d0d8', 7, 2, 7, 1); q('#a8532a', 9, 3, 2, 1); q('#2a2a2a', 7, 11, 2, 3); },
  'Watering Can': (q, c, it) => { q('#7a8aa0', 3, 6, 9, 8); q('#a9bbd0', 3, 6, 9, 2); q('#5a6a80', 3, 13, 9, 1); q('#7a8aa0', 11, 4, 4, 2); q('#7a8aa0', 2, 5, 2, 6); q('#3a3a42', 4, 10, 7, 1); const f = canFill('Watering Can', it); if (f) q('#4aa3c8', 4, 12 - Math.round(5 * f), 7, Math.max(1, Math.round(5 * f))); },
  'Large Watering Can': (q, c, it) => { q('#8a7a58', 2, 5, 10, 9); q('#b8a878', 2, 5, 10, 2); q('#5a4a30', 2, 13, 10, 1); q('#8a7a58', 11, 3, 4, 2); q('#8a7a58', 1, 4, 2, 8); q('#3a3a42', 3, 9, 8, 1); q('#3a3a42', 3, 11, 8, 1); const f = canFill('Large Watering Can', it); if (f) q('#4aa3c8', 3, 12 - Math.round(5 * f), 8, Math.max(1, Math.round(5 * f))); },
  'Pressure Can': (q, c, it) => { q('#6a6e76', 3, 4, 8, 10); q('#9aa0a8', 3, 4, 8, 2); q('#3a3a42', 3, 13, 8, 1); q('#c0392b', 5, 2, 4, 2); q('#2a2a2e', 11, 6, 4, 1); q('#2a2a2e', 14, 6, 1, 4); q('#e8c24a', 6, 7, 2, 2); q('#14120f', 4, 10, 6, 1); const f = canFill('Pressure Can', it); if (f) q('#4aa3c8', 4, 12 - Math.round(2 * f), 6, Math.max(1, Math.round(2 * f))); }
});
/* ---------- Armour, one set at a time ---------- */
const AH = (q, base, hi, deco) => { q(base, 4, 3, 8, 6); q(base, 3, 7, 10, 4); q(hi, 4, 3, 8, 1); q('#14120f', 5, 8, 6, 1); if (deco) deco(q); };
const AB = (q, base, hi, lo, deco) => { q(base, 3, 3, 10, 11); q(base, 1, 3, 3, 6); q(base, 12, 3, 3, 6); q(hi, 3, 3, 10, 1); q(hi, 1, 3, 3, 1); q(hi, 12, 3, 3, 1); q(lo, 3, 13, 10, 1); if (deco) deco(q); };
const AL = (q, base, hi, lo, deco) => { q(base, 4, 2, 8, 4); q(base, 4, 6, 3, 8); q(base, 9, 6, 3, 8); q(hi, 4, 2, 8, 1); q(lo, 4, 13, 3, 1); q(lo, 9, 13, 3, 1); if (deco) deco(q); };
const AF = (q, base, hi, sole, deco) => { q(base, 2, 6, 5, 7); q(base, 9, 6, 5, 7); q(hi, 2, 6, 5, 1); q(hi, 9, 6, 5, 1); q(sole, 2, 12, 5, 2); q(sole, 9, 12, 5, 2); if (deco) deco(q); };
Object.assign(ARMOUR_ART, {
  'Raider Helmet': q => AH(q, '#6a5a4a', '#8a7a6a', q2 => { q2('#4a3a2a', 3, 8, 10, 2); q2('#c8c0a0', 5, 4, 1, 1); q2('#c8c0a0', 10, 4, 1, 1); q2('#a8532a', 7, 3, 2, 5); q2('#c8c8d0', 7, 1, 2, 2); }),
  'Metal Helmet': q => AH(q, '#8a8d94', '#c0c4c8', q2 => { q2('#6a6e76', 9, 5, 2, 2); q2('#3a2a1a', 3, 9, 10, 1); q2('#c0392b', 7, 1, 2, 2); q2('#c0c4c8', 4, 3, 4, 2); }),
  'Combat Helmet': q => AH(q, '#5a6a4a', '#7a8a6a', q2 => { q2('#3a3a30', 4, 6, 8, 1); q2('#2a2a2a', 5, 9, 1, 3); q2('#2a2a2a', 10, 9, 1, 3); q2('#7fd8ff', 5, 7, 6, 1); q2('#4a5a3a', 5, 4, 1, 1); q2('#4a5a3a', 9, 4, 1, 1); }),
  'Patchwork Cap': q => { q('#8a7a5a', 4, 4, 8, 4); q('#a89a76', 4, 4, 8, 1); q('#6a5a3a', 3, 8, 10, 1); q('#a8532a', 5, 5, 2, 2); q('#5a7a8a', 9, 5, 2, 2); q('#3a2a1a', 7, 4, 1, 4); },
  'Riot Helmet': q => AH(q, '#2a3a5a', '#4a5a7a', q2 => { q2('#9fd8e8', 4, 6, 8, 3); q2('#e8f8ff', 5, 6, 2, 1); q2('#1c2a44', 3, 10, 10, 1); }),
  'Hazmat Hood': q => { q('#d8c838', 4, 2, 8, 9); q('#e8dc58', 4, 2, 8, 1); q('#d8f0f6', 5, 5, 6, 3); q('#ffffff', 6, 5, 2, 1); q('#8a8a90', 7, 9, 2, 2); q('#3a3a3a', 4, 4, 1, 6); },
  'Gas Mask': q => { q('#5a6a3a', 4, 3, 8, 6); q('#7a8a5a', 4, 3, 8, 1); q('#14120f', 5, 6, 2, 2); q('#14120f', 9, 6, 2, 2); q('#7fd8ff', 5, 6, 1, 1); q('#7fd8ff', 9, 6, 1, 1); q('#8a8a90', 7, 9, 2, 3); q('#2a2a2a', 4, 5, 8, 1); },
  'Raider Vest': q => AB(q, '#6a5a4a', '#8a7a6a', '#3a2a1a', q2 => { q2('#8a8d94', 4, 5, 3, 3); q2('#8a8d94', 9, 7, 3, 3); q2('#d6a84a', 7, 11, 2, 1); q2('#c8b88a', 7, 3, 1, 8); q2('#a8532a', 5, 9, 2, 1); }),
  'Metal Armour': q => AB(q, '#8a8d94', '#c0c4c8', '#3a2a1a', q2 => { q2('#6a6e76', 7, 3, 2, 11); q2('#9aa0a8', 1, 3, 3, 4); q2('#9aa0a8', 12, 3, 3, 4); q2('#d8d8e0', 4, 4, 1, 1); q2('#d8d8e0', 11, 4, 1, 1); q2('#6a6e76', 9, 8, 2, 2); }),
  'Combat Armour': q => AB(q, '#5a6a4a', '#7a8a6a', '#2a2a2a', q2 => { q2('#4a5a3a', 4, 5, 4, 4); q2('#4a5a3a', 9, 5, 3, 4); q2('#3a3a30', 4, 11, 3, 2); q2('#3a3a30', 9, 11, 3, 2); q2('#c8a040', 7, 12, 2, 1); }),
  'Patchwork Jacket': q => AB(q, '#8a7a5a', '#a89a76', '#6a5a3a', q2 => { q2('#a8532a', 4, 5, 3, 3); q2('#5a7a8a', 9, 8, 3, 3); q2('#3a2a1a', 7, 3, 1, 11); q2('#c8c0a0', 4, 9, 1, 1); }),
  'Riot Vest': q => AB(q, '#2a3a5a', '#4a5a7a', '#1c2a44', q2 => { q2('#1c2a44', 4, 5, 8, 3); q2('#3a4a6a', 1, 3, 3, 3); q2('#e8e8e8', 5, 12, 6, 1); q2('#14120f', 7, 3, 1, 10); }),
  'Hazmat Suit': q => AB(q, '#d8c838', '#e8dc58', '#a89a20', q2 => { q2('#2a2a2a', 3, 8, 10, 1); q2('#e8e8e8', 3, 10, 10, 1); q2('#3a3a3a', 7, 3, 1, 11); q2('#8a8a90', 4, 4, 2, 2); }),
  'Lead Apron': q => { q('#6a7078', 4, 3, 8, 11); q('#8a9098', 4, 3, 8, 1); q('#3a3a3a', 4, 2, 1, 3); q('#3a3a3a', 11, 2, 1, 3); q('#e8c24a', 7, 7, 2, 2); q('#14120f', 7, 7, 1, 1); q('#4a5058', 4, 13, 8, 1); },
  'Raider Leggings': q => AL(q, '#6a5a4a', '#8a7a6a', '#3a2a1a', q2 => { q2('#3a2a1a', 4, 2, 8, 1); q2('#8a8d94', 4, 8, 3, 2); q2('#8a8d94', 9, 8, 3, 2); q2('#a8532a', 5, 4, 2, 1); }),
  'Metal Leg Guards': q => AL(q, '#8a8d94', '#c0c4c8', '#3a3a42', q2 => { q2('#c0c4c8', 4, 8, 3, 2); q2('#c0c4c8', 9, 8, 3, 2); q2('#6a6e76', 6, 6, 1, 7); q2('#6a6e76', 11, 6, 1, 7); }),
  'Combat Leg Guards': q => AL(q, '#5a6a4a', '#7a8a6a', '#2a2a2a', q2 => { q2('#3a3a30', 4, 9, 3, 3); q2('#3a3a30', 9, 9, 3, 3); q2('#4a5a3a', 4, 8, 3, 1); q2('#4a5a3a', 9, 8, 3, 1); }),
  'Patchwork Trousers': q => AL(q, '#8a7a5a', '#a89a76', '#6a5a3a', q2 => { q2('#a8532a', 4, 8, 3, 3); q2('#5a7a8a', 9, 5, 3, 3); q2('#3a2a1a', 6, 6, 1, 7); }),
  'Riot Greaves': q => AL(q, '#2a3a5a', '#4a5a7a', '#1c2a44', q2 => { q2('#3a4a6a', 4, 8, 3, 2); q2('#3a4a6a', 9, 8, 3, 2); q2('#e8e8e8', 4, 3, 8, 1); }),
  'Hazmat Pants': q => AL(q, '#d8c838', '#e8dc58', '#a89a20', q2 => { q2('#2a2a2a', 4, 7, 3, 1); q2('#2a2a2a', 9, 7, 3, 1); q2('#e8e8e8', 4, 11, 3, 1); q2('#e8e8e8', 9, 11, 3, 1); }),
  'Raider Boots': q => AF(q, '#6a5a4a', '#8a7a6a', '#14120f', q2 => { q2('#c8c8c0', 2, 8, 5, 1); q2('#c8c8c0', 9, 8, 5, 1); q2('#a8532a', 5, 10, 2, 1); q2('#a8532a', 12, 10, 2, 1); }),
  'Metal Boots': q => AF(q, '#8a8d94', '#c0c4c8', '#14120f', q2 => { q2('#6a6e76', 2, 9, 5, 1); q2('#6a6e76', 9, 9, 5, 1); q2('#d8d8e0', 3, 7, 1, 1); q2('#d8d8e0', 10, 7, 1, 1); }),
  'Combat Boots': q => AF(q, '#2a2a2a', '#4a4a4a', '#14120f', q2 => { q2('#5a6a4a', 2, 6, 5, 2); q2('#5a6a4a', 9, 6, 5, 2); q2('#c8c8c0', 3, 9, 3, 1); q2('#c8c8c0', 10, 9, 3, 1); }),
  'Patchwork Shoes': q => AF(q, '#8a7a5a', '#a89a76', '#3a2a1a', q2 => { q2('#a8532a', 3, 8, 2, 2); q2('#5a7a8a', 10, 9, 2, 2); q2('#e8e0d0', 2, 7, 5, 1); }),
  'Riot Boots': q => AF(q, '#1c2a44', '#3a4a6a', '#14120f', q2 => { q2('#e8e8e8', 2, 8, 5, 1); q2('#e8e8e8', 9, 8, 5, 1); }),
  'Rubber Boots': q => AF(q, '#2a4a6a', '#4a6a8a', '#14243a', q2 => { q2('#2a4a6a', 2, 3, 5, 3); q2('#2a4a6a', 9, 3, 5, 3); q2('#4a6a8a', 3, 3, 1, 8); q2('#4a6a8a', 10, 3, 1, 8); }),
  'Lead Pendant': q => { q('#6a5a3a', 6, 2, 1, 4); q('#6a5a3a', 9, 2, 1, 4); q('#6a5a3a', 7, 5, 2, 1); q('#6a7078', 5, 6, 6, 6); q('#8a9098', 5, 6, 6, 1); q('#e8c24a', 7, 8, 2, 2); q('#14120f', 7, 8, 1, 1); },
  'Spiked Bracer': q => { q('#5a4a3a', 3, 4, 10, 8); q('#7a6a5a', 3, 4, 10, 1); q('#3a2a1a', 3, 11, 10, 1); q('#c8c8d0', 4, 2, 1, 3); q('#c8c8d0', 7, 1, 1, 4); q('#c8c8d0', 10, 2, 1, 3); q('#c8c8d0', 5, 7, 1, 1); q('#c8c8d0', 9, 8, 1, 1); },
  'Runner Wraps': q => { q('#c8c0a0', 4, 4, 8, 8); q('#a89e80', 4, 6, 8, 1); q('#a89e80', 4, 9, 8, 1); q('#e8e0c8', 4, 4, 8, 1); q('#a8532a', 7, 5, 2, 6); },
  'Geiger Band': q => { q('#3a3a42', 3, 6, 10, 5); q('#5a5a64', 3, 6, 10, 1); q('#14120f', 5, 7, 6, 3); q('#4aff8a', 6, 8, 1, 1); q('#e8c24a', 9, 8, 1, 1); q('#2a2a2e', 7, 5, 2, 1); },
  'Raider Totem': q => { q('#6a5a3a', 7, 2, 2, 12); q('#e6e0cc', 5, 3, 6, 4); q('#14120f', 6, 4, 1, 1); q('#14120f', 9, 4, 1, 1); q('#c0392b', 3, 7, 3, 1); q('#2a6a8a', 10, 7, 3, 1); q('#e8c24a', 4, 8, 1, 3); q('#e8c24a', 11, 8, 1, 3); q('#a8532a', 7, 12, 2, 2); },
  'Loss Prevention Vest': q => AB(q, '#2a3a5a', '#4a5a7a', '#1c2a44', q2 => { q2('#d6c84a', 3, 7, 10, 1); q2('#d6c84a', 3, 10, 10, 1); q2('#e8e8e8', 5, 4, 2, 2); }),
  'Lead-Lined Coat': q => AB(q, '#6a7078', '#8a9098', '#3a3d42', q2 => { q2('#14120f', 7, 3, 1, 11); q2('#3a3d42', 3, 8, 10, 1); q2('#e8c24a', 5, 5, 1, 1); q2('#e8c24a', 10, 5, 1, 1); }),
  'Crabshell Vest': q => AB(q, '#a8503a', '#c26a4a', '#7a3326', q2 => { q2('#c26a4a', 3, 6, 10, 1); q2('#7a3326', 3, 8, 10, 1); q2('#c26a4a', 3, 10, 10, 1); q2('#7a3326', 3, 12, 10, 1); })
});
/* ---------- A little more gritty in the colours ---------- */
for (const [n, col] of Object.entries({ 'Rusty Pipe': '#7a6a5a', 'Machete': '#9a9ca2', 'Combat Cleaver': '#b8bec6' })) { WEAPONS[n].col = col; ITEM_COL[n] = col; }
/* ---------- Food, medicine and ammunition ---------- */
const ITEM_ART = {
  'Radish': q => { q('#4f8a3a', 6, 1, 1, 4); q('#6fae4a', 8, 2, 1, 3); q('#d4506a', 5, 5, 6, 7); q('#e8708a', 5, 5, 6, 2); q('#a8304a', 6, 12, 4, 1); q('#e8e0d0', 7, 13, 2, 2); },
  'Potato': q => { q('#a8804a', 3, 5, 10, 8); q('#c9a45a', 4, 5, 8, 3); q('#7a5a30', 5, 9, 1, 1); q('#7a5a30', 9, 8, 1, 1); q('#7a5a30', 7, 11, 1, 1); },
  'Tomato': q => { q('#4f8a3a', 6, 3, 4, 2); q('#d94a3a', 3, 5, 10, 8); q('#f06a5a', 4, 5, 4, 3); q('#a82a22', 4, 12, 8, 1); },
  'Corn': q => { q('#e8c24a', 6, 2, 4, 11); q('#f0d86a', 6, 2, 1, 11); q('#c8a22a', 7, 4, 1, 1); q('#c8a22a', 8, 7, 1, 1); q('#4f8a3a', 4, 7, 3, 7); q('#6fae4a', 9, 8, 3, 6); },
  'Beans': q => { q('#4f8a3a', 3, 5, 10, 3); q('#6a8a3a', 4, 8, 9, 3); q('#8aaa5a', 4, 5, 9, 1); q('#3a5a2a', 5, 6, 1, 1); q('#3a5a2a', 8, 6, 1, 1); q('#3a5a2a', 11, 9, 1, 1); },
  'Pumpkin': q => { q('#e8803a', 2, 5, 12, 8); q('#f09a5a', 3, 5, 3, 7); q('#c8602a', 7, 5, 2, 8); q('#c8602a', 11, 6, 1, 6); q('#4f8a3a', 7, 2, 2, 3); },
  'Glowmelon': q => { q('#6fc850', 3, 4, 10, 9); q('#9be870', 4, 4, 4, 5); q('#3a7a2a', 7, 4, 1, 9); q('#3a7a2a', 10, 5, 1, 7); q('#d8ff90', 5, 6, 1, 1); q('#d8ff90', 11, 8, 1, 1); },
  'Healroot': q => { q('#7fc8a8', 6, 2, 2, 5); q('#9be8c8', 9, 3, 2, 4); q('#c8b090', 5, 7, 6, 4); q('#a89070', 6, 10, 4, 3); q('#7a6a50', 7, 13, 2, 2); },
  'Bandage': q => { q('#e8e0d0', 2, 6, 12, 4); q('#c8c0b0', 2, 9, 12, 1); q('#c0392b', 7, 6, 2, 4); q('#a8a090', 5, 6, 1, 4); q('#a8a090', 10, 6, 1, 4); },
  'Medkit': q => { q('#e8e8e8', 2, 5, 12, 8); q('#c8c8c8', 2, 12, 12, 1); q('#c0392b', 7, 6, 2, 6); q('#c0392b', 5, 8, 6, 2); q('#3a3a3a', 6, 3, 4, 2); },
  'Rad tabs': q => { q('#e8e0d0', 4, 3, 8, 11); q('#7fbf3f', 5, 6, 6, 5); q('#14120f', 7, 7, 2, 1); q('#14120f', 7, 9, 2, 1); q('#c8c0b0', 4, 3, 8, 2); },
  'Rad-Away': q => { q('#5fd0d6', 5, 4, 6, 10); q('#8fe8ec', 5, 4, 2, 9); q('#3a3a42', 6, 2, 4, 3); q('#e8e8e8', 5, 8, 6, 2); q('#c0392b', 7, 8, 2, 2); },
  'Canned food': q => { q('#b5b5a8', 3, 4, 10, 10); q('#d8d8cc', 3, 4, 10, 2); q('#8a8a80', 3, 13, 10, 1); q('#c0392b', 3, 7, 10, 4); q('#e8e0d0', 6, 8, 4, 2); },
  'Pistol rounds': q => { for (let k = 0; k < 3; k++) { q('#b87333', 3 + k * 4, 6, 3, 8); q('#d6a84a', 3 + k * 4, 9, 3, 5); q('#8a5a2a', 3 + k * 4, 5, 3, 1); } },
  'Shells': q => { for (let k = 0; k < 3; k++) { q('#c0392b', 3 + k * 4, 5, 3, 9); q('#e8c24a', 3 + k * 4, 11, 3, 3); } },
  'Bolts': q => { for (let k = 0; k < 3; k++) { q('#8a6a3a', 4 + k * 4, 3, 1, 11); q('#c8c8d0', 3 + k * 4, 1, 3, 3); q('#c0392b', 3 + k * 4, 12, 3, 2); } }
};
{ const o = iconTo; iconTo = function (g, name, x, y, s, item) {
  const art = ITEM_ART[name];
  if (!art) return o(g, name, x, y, s, item);
  const u = s / 16, q = (c, ax, ay, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x + ax * u), Math.round(y + ay * u), Math.max(1, Math.round(w * u)), Math.max(1, Math.round(h * u))); };
  art(q, ITEM_COL[name], item);
}; }
Object.assign(DBG, { ITEM_ART, wDps, iconTo });
