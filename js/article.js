/* ===== ARTICLE.JS — single article page ===== */
(function () {
  'use strict';
  const B = window.BlogCommon;
  const root = document.getElementById('articleRoot');
  const posts = B.getPosts();
  const slug = new URLSearchParams(location.search).get('slug');
  const index = posts.findIndex(p => p.slug === slug);
  const post = posts[index];

  B.initNav();

  // Category-specific call to action shown under every article
  const CTA_BY_CATEGORY = {
    'Hardware':  ['Αναβάθμιση ή επισκευή υπολογιστή;', 'Εγκαθιστούμε SSD, RAM και κάρτες γραφικών με μεταφορά δεδομένων — συνήθως την ίδια μέρα.'],
    'Δίκτυα':    ['Αδύναμο WiFi ή συχνές αποσυνδέσεις;', 'Κάνουμε μέτρηση κάλυψης, εγκατάσταση Mesh/router και πλήρη ρύθμιση στον χώρο σας.'],
    'Κινητά':    ['Σπασμένη οθόνη ή μπαταρία που δεν κρατάει;', 'Αντικατάσταση οθόνης, μπαταρίας και θύρας φόρτισης με ποιοτικά ανταλλακτικά και εγγύηση.'],
    'Software':  ['Αργός υπολογιστής ή προβλήματα με τα Windows;', 'Format, καθαρή εγκατάσταση και ρύθμιση προγραμμάτων χωρίς να χάσετε τα αρχεία σας.'],
    'Ασφάλεια':  ['Ανησυχείτε για ιούς ή απώλεια δεδομένων;', 'Αφαίρεση malware, ρύθμιση backup και θωράκιση των συσκευών σας από την ομάδα μας.'],
    'Επισκευές': ['Η συσκευή σας χρειάζεται επισκευή;', 'Δωρεάν διάγνωση και ξεκάθαρη τιμή πριν ξεκινήσει οποιαδήποτε εργασία.']
  };

  if (!post) { renderNotFound(); return; }

  // ── SEO / meta ──
  document.title = `${post.title} — Bytefixer Blog`;
  setMeta('name', 'description', post.excerpt);
  setMeta('property', 'og:title', post.title);
  setMeta('property', 'og:description', post.excerpt);
  setMeta('property', 'og:image', new URL(post.cover, location.href).href);
  injectJsonLd();

  // ── Prepare content: give every h2 an id for the table of contents ──
  const tmp = document.createElement('div');
  tmp.innerHTML = post.content;
  const headings = [...tmp.querySelectorAll('h2')];
  headings.forEach((h, i) => { h.id = `section-${i + 1}`; });
  const contentHTML = tmp.innerHTML;

  const older = posts[index + 1];
  const newer = posts[index - 1];
  const related = getRelated(post, 3);
  const [ctaTitle, ctaText] = CTA_BY_CATEGORY[post.category] || CTA_BY_CATEGORY['Επισκευές'];
  const pageUrl = location.href;
  const shareText = encodeURIComponent(post.title);
  const shareUrl = encodeURIComponent(pageUrl);

  root.innerHTML = `
    <article>
      <header class="article-hero">
        <div class="blog-hero-glow"></div>
        <div class="container article-hero-inner">
          <nav class="breadcrumb" aria-label="breadcrumb">
            <a href="index.html">Αρχική</a><span>›</span>
            <a href="blog.html">Blog</a><span>›</span>
            <a href="blog.html?cat=${encodeURIComponent(post.category)}">${B.esc(post.category)}</a>
          </nav>
          ${B.categoryBadge(post.category)}
          <h1>${B.esc(post.title)}</h1>
          <p class="article-lead">${B.esc(post.excerpt)}</p>
          <div class="article-meta">
            <div class="author-mini">
              <img src="icons/logo.jpg" alt="">
              <div><strong>Ομάδα Bytefixer</strong><span>Τεχνικοί επισκευών</span></div>
            </div>
            <div class="article-meta-items">
              <span>📅 ${B.formatDate(post.date)}</span>
              <span>⏱ ${post.minutes}' ανάγνωση</span>
            </div>
          </div>
        </div>
      </header>

      <div class="container">
        <figure class="article-cover">
          <img src="${B.esc(post.cover)}" alt="${B.esc(post.title)}">
        </figure>
      </div>

      <div class="container article-layout">
        <div class="article-main">
          <div class="article-body" id="articleBody">${contentHTML}</div>

          ${(post.tags || []).length ? `
          <div class="article-tags">
            ${post.tags.map(t => `<a class="tag" href="blog.html">#${B.esc(t)}</a>`).join('')}
          </div>` : ''}

          <div class="share-box">
            <span>Σας φάνηκε χρήσιμο; Μοιραστείτε το:</span>
            <div class="share-buttons">
              <a class="share-btn fb" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07"/></svg>
              </a>
              <a class="share-btn wa" target="_blank" rel="noopener" href="https://wa.me/?text=${shareText}%20${shareUrl}" aria-label="WhatsApp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36A9.43 9.43 0 0 1 2.6 12.04C2.6 6.84 6.84 2.6 12.05 2.6c2.52 0 4.89.98 6.67 2.77a9.36 9.36 0 0 1 2.76 6.68c0 5.2-4.23 9.44-9.43 9.44M20.08 4A11.3 11.3 0 0 0 12.05.67C5.79.67.69 5.77.69 12.04c0 2 .52 3.96 1.52 5.68L.6 23.6l6.02-1.58a11.3 11.3 0 0 0 5.43 1.38h.01c6.26 0 11.36-5.1 11.36-11.37 0-3.04-1.18-5.89-3.33-8.04"/></svg>
              </a>
              <a class="share-btn vb" href="viber://forward?text=${shareText}%20${shareUrl}" aria-label="Viber">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </a>
              <button class="share-btn copy" id="copyLink" aria-label="Αντιγραφή συνδέσμου">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </button>
              <button class="share-btn native" id="nativeShare" aria-label="Κοινοποίηση" hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              </button>
            </div>
          </div>

          <div class="article-cta">
            <div class="article-cta-glow"></div>
            <h3>${B.esc(ctaTitle)}</h3>
            <p>${B.esc(ctaText)}</p>
            <div class="article-cta-actions">
              <a href="tel:+306933194753" class="btn-primary">📞 693 319 4753</a>
              <a href="index.html#pricing" class="btn-ghost">Δείτε τις τιμές</a>
            </div>
          </div>

          <div class="author-box">
            <img src="icons/logo.jpg" alt="Bytefixer">
            <div>
              <span class="author-label">Συντάκτης</span>
              <h4>Ομάδα Bytefixer</h4>
              <p>Τεχνικοί με καθημερινή εμπειρία σε επισκευές υπολογιστών, κινητών και δικτύων. Γράφουμε για όσα βλέπουμε στον πάγκο μας — για να λύνετε τα μικρά προβλήματα μόνοι σας και να ξέρετε πότε χρειάζεστε επαγγελματία.</p>
            </div>
          </div>

          <nav class="post-nav">
            ${older ? `
            <a class="post-nav-item prev" href="${B.articleUrl(older)}">
              <span class="post-nav-label">← Προηγούμενο</span>
              <span class="post-nav-title">${B.esc(older.title)}</span>
            </a>` : '<span></span>'}
            ${newer ? `
            <a class="post-nav-item next" href="${B.articleUrl(newer)}">
              <span class="post-nav-label">Επόμενο →</span>
              <span class="post-nav-title">${B.esc(newer.title)}</span>
            </a>` : '<span></span>'}
          </nav>
        </div>

        <aside class="article-aside">
          ${headings.length > 1 ? `
          <div class="side-card toc">
            <h4 class="side-title">Περιεχόμενα</h4>
            <ol class="toc-list" id="tocList">
              ${headings.map(h => `<li><a href="#${h.id}" data-target="${h.id}">${B.esc(h.textContent)}</a></li>`).join('')}
            </ol>
          </div>` : ''}
          <div class="side-card side-cta compact">
            <h4>Χρειάζεστε βοήθεια;</h4>
            <p>Δωρεάν διάγνωση στο κατάστημα.</p>
            <a href="tel:+306933194753" class="btn-primary">📞 Καλέστε μας</a>
          </div>
        </aside>
      </div>

      ${related.length ? `
      <section class="related-section">
        <div class="container">
          <div class="related-head">
            <h2>Σχετικά <span class="gradient-text">άρθρα</span></h2>
            <a href="blog.html" class="btn-ghost small">Όλα τα άρθρα →</a>
          </div>
          <div class="post-grid three">${related.map(B.cardHTML).join('')}</div>
        </div>
      </section>` : ''}
    </article>`;

  initProgress();
  initToc();
  initShare();
  B.initReveal();

  // ───────── helpers ─────────
  function setMeta(attr, key, value) {
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
    el.setAttribute('content', value);
  }

  function injectJsonLd() {
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      image: new URL(post.cover, location.href).href,
      datePublished: post.date,
      author: { '@type': 'Organization', name: 'Bytefixer' },
      publisher: { '@type': 'Organization', name: 'Bytefixer', logo: { '@type': 'ImageObject', url: new URL('icons/logo.jpg', location.href).href } },
      keywords: (post.tags || []).join(', ')
    });
    document.head.appendChild(s);
  }

  function getRelated(current, n) {
    const others = posts.filter(p => p.slug !== current.slug);
    const score = p => (p.category === current.category ? 3 : 0) +
      (p.tags || []).filter(t => (current.tags || []).includes(t)).length;
    return others.map(p => ({ p, s: score(p) }))
      .sort((a, b) => b.s - a.s || b.p.date.localeCompare(a.p.date))
      .slice(0, n).map(x => x.p);
  }

  function initProgress() {
    const bar = document.getElementById('readProgress');
    const body = document.getElementById('articleBody');
    const update = () => {
      const rect = body.getBoundingClientRect();
      const total = body.offsetHeight - window.innerHeight * 0.6;
      const pct = Math.min(100, Math.max(0, (-rect.top + window.innerHeight * 0.2) / total * 100));
      bar.style.width = pct + '%';
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  function initToc() {
    const toc = document.getElementById('tocList');
    if (!toc) return;
    const links = [...toc.querySelectorAll('a')];
    toc.addEventListener('click', e => {
      const a = e.target.closest('a');
      if (!a) return;
      e.preventDefault();
      const target = document.getElementById(a.dataset.target);
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
      history.replaceState(null, '', `${location.pathname}${location.search}#${a.dataset.target}`);
    });
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          links.forEach(l => l.classList.toggle('active', l.dataset.target === entry.target.id));
        }
      });
    }, { rootMargin: '-90px 0px -65% 0px' });
    headings.forEach(h => obs.observe(document.getElementById(h.id)));
  }

  function initShare() {
    const toast = document.getElementById('toast');
    const showToast = msg => {
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2200);
    };
    document.getElementById('copyLink').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(pageUrl); showToast('✓ Ο σύνδεσμος αντιγράφηκε'); }
      catch { showToast('Αντιγράψτε τον σύνδεσμο από τη γραμμή διευθύνσεων'); }
    });
    const native = document.getElementById('nativeShare');
    if (navigator.share) {
      native.hidden = false;
      native.addEventListener('click', () => navigator.share({ title: post.title, text: post.excerpt, url: pageUrl }).catch(() => {}));
    }
  }

  function renderNotFound() {
    document.title = 'Το άρθρο δεν βρέθηκε — Bytefixer Blog';
    root.innerHTML = `
      <section class="not-found">
        <div class="container">
          <div class="not-found-code">404</div>
          <h1>Το άρθρο δεν βρέθηκε</h1>
          <p>Ίσως ο σύνδεσμος έχει αλλάξει. Δείτε τα πιο πρόσφατα άρθρα μας:</p>
          <div class="post-grid three">${posts.slice(0, 3).map(B.cardHTML).join('')}</div>
          <a href="blog.html" class="btn-primary">← Επιστροφή στο Blog</a>
        </div>
      </section>`;
    B.initReveal();
  }
})();
