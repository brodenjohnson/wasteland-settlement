/* =====================================================================
   AG_BALANCE: measured against a model of player power. Bosses hit for less
   and have more health, so fights are long and winnable with preparation.
   Crop values follow their tier, and the dried-meat exploit is closed.
   ===================================================================== */
Object.assign(ENEMY_TYPES.kingpin, { hp: 700, dmg: 13 });
Object.assign(ENEMY_TYPES.hollowclaw, { hp: 1000, dmg: 18 });
Object.assign(ENEMY_TYPES.chief, { hp: 450, dmg: 15 });
Object.assign(LVL_OFF, { brute: [1, 2], chief: [2, 4], kingpin: [3, 5], hollowclaw: [4, 6] });
CROPS['Healroot Seeds'].regrow = 4;
Object.assign(VALUE, { 'Potato': 9, 'Corn': 16, 'Beans': 7, 'Glowmelon': 34, 'Healroot': 26, 'Corn Seeds': 8, 'Glowmelon Seeds': 17, 'Healroot Seeds': 15,
  'Raw Meat': 4, 'Roast Meat': 9, 'Meat Stew': 24, 'Jerky': 10, 'Dried Fish': 16, 'Roast Corn': 26, 'Corn Chowder': 52, 'Melon Juice': 40, 'Healroot Tonic': 66 });
