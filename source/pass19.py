# ---- pass 19: save export and import, the wiki hooks, the Hull's dressing, ways in at the map edges, Chapter Three ----
# roads that lead to the ways in: the Hull in the south-east corner, MegaMart on the east edge, Pylon 3 north of the Ash Tower
sub1("road([[98, 58], [100, 78], [98, 94]], 2.4);", "road([[98, 58], [100, 78], [98, 94]], 2.4); road([[100, 91], [107, 92], [111, 95], [111, 106], [113, 111], [118, 118]], 2.4); road([[88, 26], [94, 17], [100, 11]], 2.2);")
sub1("road([[86, 60], [118, 60]], 2.2);", "road([[86, 60], [122, 60]], 2.2);")
src = src.replace(marker_end, P('ao_saveio.js') + P('ap_wiki.js') + P('aq_hullart.js') + P('ar_places.js') + marker_end, 1)
