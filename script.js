// Utility
function byId(id) { return document.getElementById(id); }
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

// Site-wide
(function siteInit() {
  const y = new Date().getFullYear();
  document.querySelectorAll('#year').forEach(el => el.textContent = y);
  const aboutLink = document.getElementById('about-link');
  if (aboutLink) {
    aboutLink.addEventListener('click', (e) => {
      e.preventDefault();
      alert("This is a personal research site. Opinions only, not advice.");
    });
  }
})();

// Data source: list of articles (add your files here)
const ARTICLE_INDEX = [
  { slug: 'semiconductorpackaging', file: 'articles/semiconductor-packaging.json' },
  { slug: 'topglove', file: 'articles/topglove.json' },
  { slug: 'anothercompany', file: 'articles/anothercompany.json' }
];

// Homepage & archive rendering
(function renderLists() {
  const listEl = document.getElementById('articles-list');
  const archiveEl = document.getElementById('archive-list');
  if (!listEl && !archiveEl) return;

  Promise.all(ARTICLE_INDEX.map(meta => fetch(meta.file).then(r => r.json().then(j => ({...j, slug: meta.slug})))))
    .then(items => {
      // Sort newest first
      items.sort((a,b) => new Date(b.date) - new Date(a.date));

      function renderTo(target) {
        const frag = document.createDocumentFragment();
        items.forEach(it => {
          const div = document.createElement('div');
          div.className = 'article-item';
          const link = document.createElement('a');
          link.className = 'title';
          link.href = `article.html?slug=${encodeURIComponent(it.slug)}`;
          link.textContent = it.title;
          const meta = document.createElement('div');
          meta.className = 'meta';
          meta.textContent = `${formatDate(it.date)} · ${it.tags.join(', ')}`;
          div.appendChild(link);
          div.appendChild(meta);
          frag.appendChild(div);
        });
        target.appendChild(frag);
      }

      if (listEl) renderTo(listEl);
      if (archiveEl) renderTo(archiveEl);
    })
    .catch(err => {
      console.error('Error loading index', err);
      if (listEl) listEl.textContent = 'No articles available.';
      if (archiveEl) archiveEl.textContent = 'No articles available.';
    });
})();

// Article page rendering
(function renderArticle() {
  const container = document.getElementById('article');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const found = ARTICLE_INDEX.find(a => a.slug === slug) || ARTICLE_INDEX[0];

  fetch(found.file)
    .then(r => r.json())
    .then(data => {
      byId('title').textContent = data.title;
      byId('date').textContent = formatDate(data.date);
      byId('tags').textContent = data.tags.join(', ');
      byId('summary').textContent = data.summary;
      byId('doc-title').textContent = `Thoughts Researched — ${data.title}`;
      byId('doc-desc').setAttribute('content', data.summary);

      const contentEl = byId('content');
      contentEl.innerHTML = '';
      data.content.forEach(block => {
        if (block.type === 'h3') {
          const h = document.createElement('h3');
          h.textContent = block.text;
          contentEl.appendChild(h);
        } else if (block.type === 'p') {
          const p = document.createElement('p');
          p.textContent = block.text;
          contentEl.appendChild(p);
        } else if (block.type === 'blockquote') {
          const q = document.createElement('blockquote');
          q.textContent = block.text;
          contentEl.appendChild(q);
        } else if (block.type === 'list') {
          const ul = document.createElement(block.ordered ? 'ol' : 'ul');
          block.items.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            ul.appendChild(li);
          });
          contentEl.appendChild(ul);
        } else if (block.type === 'hr') {
          contentEl.appendChild(document.createElement('hr'));
        }
      });
    })
    .catch(err => {
      console.error('Error loading article', err);
      byId('content').textContent = 'Article could not be loaded.';
    });

})();





