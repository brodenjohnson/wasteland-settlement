// Search box on the home page. WIKI_INDEX is written above this by wiki.py.
(function () {
  const box = document.getElementById('search'), list = document.getElementById('results');
  if (!box || !list) return;
  box.addEventListener('input', () => {
    const q = box.value.trim().toLowerCase();
    list.innerHTML = '';
    if (q.length < 2) return;
    const hits = WIKI_INDEX.filter(x => x.t.toLowerCase().includes(q)).sort((a, b) => a.t.toLowerCase().indexOf(q) - b.t.toLowerCase().indexOf(q)).slice(0, 25);
    for (const h of hits) {
      const li = document.createElement('li'), a = document.createElement('a'), s = document.createElement('small');
      a.href = h.u; a.textContent = h.t; s.textContent = h.p; li.append(a, s); list.append(li);
    }
    if (!hits.length) { const li = document.createElement('li'); li.textContent = 'Nothing by that name.'; list.append(li); }
  });
})();
