/* ===== BLOG COMMON — shared helpers for blog.html & article.html ===== */
(function () {
  'use strict';

  const MONTHS = ['Ιανουαρίου', 'Φεβρουαρίου', 'Μαρτίου', 'Απριλίου', 'Μαΐου', 'Ιουνίου',
    'Ιουλίου', 'Αυγούστου', 'Σεπτεμβρίου', 'Οκτωβρίου', 'Νοεμβρίου', 'Δεκεμβρίου'];

  // Accent colour per category (keeps badges consistent across pages)
  const CATEGORY_COLORS = {
    'Hardware':  '#3b82f6',
    'Δίκτυα':    '#38bdf8',
    'Κινητά':    '#38bdf8',
    'Software':  '#34d399',
    'Ασφάλεια':  '#fb923c',
    'Επισκευές': '#facc15'
  };

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function formatDate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return `${d} ${MONTHS[m - 1]} ${y}`;
  }

  function readTime(html) {
    const words = html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  }

  function categoryColor(cat) {
    return CATEGORY_COLORS[cat] || '#3b82f6';
  }

  function articleUrl(post) {
    return `article.html?slug=${encodeURIComponent(post.slug)}`;
  }

  // Posts sorted newest → oldest, enriched with computed fields
  function getPosts() {
    return (window.BLOG_POSTS || [])
      .map(p => Object.assign({}, p, { minutes: readTime(p.content) }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  function categoryBadge(cat) {
    return `<span class="cat-badge" style="--cat:${categoryColor(cat)}">${esc(cat)}</span>`;
  }

  // Standard article card used in grids and "related" sections
  function cardHTML(post) {
    return `
      <a class="post-card reveal" href="${articleUrl(post)}">
        <div class="post-card-img">
          <img src="${esc(post.cover)}" alt="${esc(post.title)}" loading="lazy">
          ${categoryBadge(post.category)}
        </div>
        <div class="post-card-body">
          <div class="post-meta">
            <span>${formatDate(post.date)}</span><span class="dot"></span><span>${post.minutes}' ανάγνωση</span>
          </div>
          <h3>${esc(post.title)}</h3>
          <p>${esc(post.excerpt)}</p>
          <span class="read-more">Διαβάστε <span class="arrow">→</span></span>
        </div>
      </a>`;
  }

  // Mobile nav toggle
  function initNav() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (!toggle || !links) return;
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      links.classList.toggle('open');
      document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
    });
  }

  // Fade-in on scroll for anything with .reveal (call again after re-rendering)
  let revealObserver = null;
  function initReveal() {
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    }
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => revealObserver.observe(el));
  }

  window.BlogCommon = {
    esc, formatDate, readTime, categoryColor, articleUrl,
    getPosts, categoryBadge, cardHTML, initNav, initReveal
  };
})();
