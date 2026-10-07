/* ===== BLOG.JS — listing page ===== */
(function () {
  'use strict';
  const B = window.BlogCommon;
  const PAGE_SIZE = 6;

  const posts = B.getPosts();
  const featured = posts[0];
  const rest = posts.slice(1);

  const state = {
    category: new URLSearchParams(location.search).get('cat') || 'all',
    query: '',
    tag: '',
    shown: PAGE_SIZE
  };

  const $ = id => document.getElementById(id);
  const grid = $('postGrid');
  const empty = $('blogEmpty');
  const loadMore = $('loadMore');
  const resultsInfo = $('resultsInfo');
  const searchInput = $('blogSearch');

  // ── Category counts ──
  const catCounts = posts.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + 1; return acc; }, {});
  const categories = Object.keys(catCounts).sort((a, b) => catCounts[b] - catCounts[a]);

  // ── Hero stats ──
  $('statPosts').textContent = posts.length;
  $('statCats').textContent = categories.length;
  $('statMinutes').textContent = posts.reduce((s, p) => s + p.minutes, 0) + "'";

  // ── Featured article ──
  if (featured) {
    $('featured').innerHTML = `
      <a class="featured-card reveal" href="${B.articleUrl(featured)}">
        <div class="featured-img">
          <img src="${B.esc(featured.cover)}" alt="${B.esc(featured.title)}">
          <span class="featured-flag">★ Νέο άρθρο</span>
        </div>
        <div class="featured-body">
          ${B.categoryBadge(featured.category)}
          <h2>${B.esc(featured.title)}</h2>
          <p>${B.esc(featured.excerpt)}</p>
          <div class="post-meta">
            <span>${B.formatDate(featured.date)}</span><span class="dot"></span><span>${featured.minutes}' ανάγνωση</span>
          </div>
          <span class="btn-primary">Διαβάστε το άρθρο →</span>
        </div>
      </a>`;
  }

  // ── Category chips ──
  function renderChips() {
    const chip = (value, label, count) =>
      `<button class="chip ${state.category === value ? 'active' : ''}" data-cat="${B.esc(value)}"
         ${value !== 'all' ? `style="--cat:${B.categoryColor(value)}"` : ''}>
         ${B.esc(label)} <span class="chip-count">${count}</span></button>`;
    $('catChips').innerHTML = chip('all', 'Όλα', posts.length) +
      categories.map(c => chip(c, c, catCounts[c])).join('');
  }

  // ── Sidebar ──
  function renderSidebar() {
    $('sideCats').innerHTML = categories.map(c => `
      <li><button data-cat="${B.esc(c)}" style="--cat:${B.categoryColor(c)}">
        <span class="side-cat-dot"></span>${B.esc(c)}<span class="side-cat-count">${catCounts[c]}</span>
      </button></li>`).join('');

    // Recommended: one article from each of the first 4 categories (excluding the featured one)
    const picks = [];
    categories.forEach(c => {
      const p = rest.find(x => x.category === c && !picks.includes(x));
      if (p && picks.length < 4) picks.push(p);
    });
    $('sidePosts').innerHTML = picks.map(p => `
      <a class="side-post" href="${B.articleUrl(p)}">
        <img src="${B.esc(p.cover)}" alt="" loading="lazy">
        <div>
          <h5>${B.esc(p.title)}</h5>
          <span>${B.formatDate(p.date)} · ${p.minutes}'</span>
        </div>
      </a>`).join('');

    const tagCounts = {};
    posts.forEach(p => (p.tags || []).forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
    $('tagCloud').innerHTML = Object.keys(tagCounts)
      .sort((a, b) => tagCounts[b] - tagCounts[a])
      .map(t => `<button class="tag ${state.tag === t ? 'active' : ''}" data-tag="${B.esc(t)}">#${B.esc(t)}</button>`)
      .join('');
  }

  // ── Filtering ──
  function filtered() {
    const q = state.query.trim().toLowerCase();
    // When no filter is active, the featured article is shown above — don't repeat it in the grid
    const noFilter = state.category === 'all' && !q && !state.tag;
    return (noFilter ? rest : posts).filter(p => {
      if (state.category !== 'all' && p.category !== state.category) return false;
      if (state.tag && !(p.tags || []).includes(state.tag)) return false;
      if (q) {
        const hay = (p.title + ' ' + p.excerpt + ' ' + (p.tags || []).join(' ') + ' ' + p.category).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function renderGrid() {
    const list = filtered();
    const visible = list.slice(0, state.shown);
    grid.innerHTML = visible.map(B.cardHTML).join('');
    empty.hidden = list.length > 0;
    loadMore.hidden = list.length <= state.shown;

    const parts = [];
    if (state.category !== 'all') parts.push(`κατηγορία <strong>${B.esc(state.category)}</strong>`);
    if (state.tag) parts.push(`ετικέτα <strong>#${B.esc(state.tag)}</strong>`);
    if (state.query.trim()) parts.push(`αναζήτηση «<strong>${B.esc(state.query.trim())}</strong>»`);
    resultsInfo.innerHTML = parts.length
      ? `${list.length} αποτελέσματα για ${parts.join(', ')} <button class="clear-filters" id="clearFilters">✕ Καθαρισμός</button>`
      : `<span class="results-title">Όλα τα άρθρα</span>`;
    const clear = $('clearFilters');
    if (clear) clear.addEventListener('click', resetAll);

    B.initReveal();
  }

  function renderAll() { renderChips(); renderSidebar(); renderGrid(); }

  function setCategory(cat, scroll) {
    state.category = cat;
    state.tag = '';
    state.shown = PAGE_SIZE;
    const url = new URL(location.href);
    if (cat === 'all') url.searchParams.delete('cat'); else url.searchParams.set('cat', cat);
    history.replaceState(null, '', url);
    renderAll();
    if (scroll) $('articles').scrollIntoView({ behavior: 'smooth' });
  }

  function resetAll() {
    state.query = '';
    searchInput.value = '';
    setCategory('all', false);
  }

  // ── Events ──
  $('catChips').addEventListener('click', e => {
    const btn = e.target.closest('[data-cat]');
    if (btn) setCategory(btn.dataset.cat, false);
  });
  $('sideCats').addEventListener('click', e => {
    const btn = e.target.closest('[data-cat]');
    if (btn) setCategory(btn.dataset.cat, true);
  });
  $('tagCloud').addEventListener('click', e => {
    const btn = e.target.closest('[data-tag]');
    if (!btn) return;
    state.tag = state.tag === btn.dataset.tag ? '' : btn.dataset.tag;
    state.category = 'all';
    state.shown = PAGE_SIZE;
    renderAll();
    $('articles').scrollIntoView({ behavior: 'smooth' });
  });
  let searchTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { state.query = searchInput.value; state.shown = PAGE_SIZE; renderGrid(); }, 150);
  });
  loadMore.addEventListener('click', () => { state.shown += PAGE_SIZE; renderGrid(); });
  $('resetFilters').addEventListener('click', resetAll);

  // ── Init ──
  if (state.category !== 'all' && !catCounts[state.category]) state.category = 'all';
  B.initNav();
  renderAll();
})();
