# ---- pass 20: the world atlas, Phase 1a (docs/WORLD_DESIGN.md): place registry, discovery, found logs, map memory ----
src = src.replace(marker_end, P('au_atlas.js') + marker_end, 1)
# thread headers in Found logs are not entries, so the codex counts leave them out
sub1("const total = lists.reduce((a, l) => a + l.length, 0), found = lists.reduce((a, l) => a + l.filter(e => e.found).length, 0);",
     "const total = lists.reduce((a, l) => a + l.filter(e => !e.hdr).length, 0), found = lists.reduce((a, l) => a + l.filter(e => e.found && !e.hdr).length, 0);")
sub1("nm + ' ' + lists[k].filter(e => e.found).length + '/' + lists[k].length", "nm + ' ' + lists[k].filter(e => e.found && !e.hdr).length + '/' + lists[k].filter(e => !e.hdr).length")
