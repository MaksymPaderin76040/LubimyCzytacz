// Autorzy: Maksym Paderin 76040 i Yahor Dziamyanenka 77143

const SUPABASE_URL = 'https://ranrnrbrurdobdbxgbsz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhbnJucmJydXJkb2JkYnhnYnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyOTYyODMsImV4cCI6MjA5Njg3MjI4M30.whc6MPhDdIhx1e98UVdMKVRnURmffZFOz0XGBTzAwmk';
const API = `${SUPABASE_URL}/rest/v1`;
const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

let allBooks = [];
let allAuthors = [];
let editingId = null;

function esc(str) {
  return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function stars(rating) {
  if (!rating) return '<span style="color:#ccc">Brak oceny</span>';
  return '★'.repeat(rating).split('').map(()=>`<span style="color:#f59e0b">★</span>`).join('') +
         '★'.repeat(5-rating).split('').map(()=>`<span style="color:#ddd">★</span>`).join('');
}

async function loadAuthors() {
  const res = await fetch(`${API}/authors?order=name`, { headers });
  allAuthors = await res.json();
  const opts = `<option value="">— brak —</option>` + allAuthors.map(a=>`<option value="${a.id}">${esc(a.name)}</option>`).join('');
  document.getElementById('author_id').innerHTML = opts;
  document.getElementById('edit_author_id').innerHTML = opts;
}

async function loadBooks() {
  const res = await fetch(`${API}/books?order=created_at.desc&select=*,authors(id,name)`, { headers });
  allBooks = await res.json();
  applyFilters();
}

function getSortedBooks(books) {
  const sort = document.getElementById('sort-select').value;
  const sorted = [...books];
  if (sort === 'title') sorted.sort((a,b) => a.title.localeCompare(b.title, 'pl'));
  if (sort === 'rating') sorted.sort((a,b) => (b.rating||0) - (a.rating||0));
  if (sort === 'date') sorted.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  return sorted;
}

function applyFilters() {
  const q = document.getElementById('search').value.toLowerCase();
  const genre = document.getElementById('genre-filter').value;
  let filtered = allBooks;
  if (q) filtered = filtered.filter(b => {
    const name = b.authors ? b.authors.name : b.author;
    return b.title.toLowerCase().includes(q) || (name||'').toLowerCase().includes(q);
  });
  if (genre) filtered = filtered.filter(b => b.genre === genre);
  renderGrid(getSortedBooks(filtered));
}

function renderGrid(books) {
  const grid = document.getElementById('books-grid');
  document.getElementById('count').textContent = books.length;

  if (!books.length) {
    const hasFilters = document.getElementById('search').value || document.getElementById('genre-filter').value;
    grid.innerHTML = hasFilters
      ? `<div class="empty-state">
           <div class="empty-icon">🔍</div>
           <div class="empty-title">Brak wyników</div>
           <div class="empty-sub">Spróbuj zmienić kryteria wyszukiwania</div>
         </div>`
      : `<div class="empty-state">
           <div class="empty-icon">📚</div>
           <div class="empty-title">Twoja biblioteka jest pusta</div>
           <div class="empty-sub">Dodaj pierwszą książkę używając formularza powyżej!</div>
           <button class="empty-btn" onclick="document.getElementById('title').focus(); window.scrollTo({top:0,behavior:'smooth'})">+ Dodaj pierwszą książkę</button>
         </div>`;
    return;
  }

  grid.innerHTML = books.map(b => {
    const coverHtml = b.cover_url
      ? `<div class="book-cover"><img src="${esc(b.cover_url)}" alt="" onerror="this.parentElement.innerHTML='📖'"/></div>`
      : `<div class="book-cover">📖</div>`;
    const authorName = b.authors ? b.authors.name : b.author;
    const genreBadge = b.genre ? `<div class="genre-badge">${esc(b.genre)}</div>` : '';
    return `
      <div class="book-card" onclick="openModal(${b.id})">
        ${coverHtml}
        <div class="book-body">
          ${genreBadge}
          <h3>${esc(b.title)}</h3>
          <div class="author">${esc(authorName)}</div>
          <div>${stars(b.rating)}</div>
        </div>
        <button class="btn-delete" onclick="deleteBook(event,${b.id})" title="Usuń">✕</button>
      </div>`;
  }).join('');
}

function openModal(id) {
  const b = allBooks.find(x=>x.id===id);
  if (!b) return;
  const authorName = b.authors ? b.authors.name : b.author;
  const coverEl = document.getElementById('modal-cover');
  coverEl.innerHTML = b.cover_url
    ? `<img src="${esc(b.cover_url)}" alt="" onerror="this.parentElement.innerHTML='📖'"/>`
    : '📖';
  document.getElementById('modal-title').textContent = b.title;
  document.getElementById('modal-author-link').innerHTML = b.authors
    ? `<a href="author.html?id=${b.authors.id}" onclick="event.stopPropagation()">${esc(b.authors.name)}</a>`
    : esc(authorName);
  document.getElementById('modal-genre').textContent = b.genre || '';
  document.getElementById('modal-stars').innerHTML = stars(b.rating);
  document.getElementById('modal-desc').textContent = b.description || 'Brak opisu.';
  document.getElementById('modal-date').textContent = 'Dodano: ' + new Date(b.created_at).toLocaleDateString('pl-PL');
  document.getElementById('modal-edit-btn').onclick = () => openEdit(b.id);
  document.getElementById('modal-overlay').classList.add('open');
}

function openEdit(id) {
  const b = allBooks.find(x=>x.id===id);
  if (!b) return;
  editingId = id;
  document.getElementById('edit-title').value = b.title;
  document.getElementById('edit-author-text').value = b.author || '';
  document.getElementById('edit_author_id').value = b.author_id || '';
  document.getElementById('edit-cover').value = b.cover_url || '';
  document.getElementById('edit-description').value = b.description || '';
  document.getElementById('edit-genre').value = b.genre || '';
  const r = document.querySelector(`#edit-form input[name="edit_rating"][value="${b.rating}"]`);
  document.querySelectorAll('#edit-form input[name="edit_rating"]').forEach(i => i.checked = false);
  if (r) r.checked = true;
  document.getElementById('modal-overlay').classList.remove('open');
  document.getElementById('edit-overlay').classList.add('open');
}

document.getElementById('edit-close').addEventListener('click', () => {
  document.getElementById('edit-overlay').classList.remove('open');
});
document.getElementById('edit-overlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
});

document.getElementById('edit-form').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = document.getElementById('edit-submit-btn');
  btn.disabled = true; btn.textContent = 'Zapisywanie...';
  const rEl = document.querySelector('#edit-form input[name="edit_rating"]:checked');
  const authorIdVal = document.getElementById('edit_author_id').value;
  const body = {
    title: document.getElementById('edit-title').value.trim(),
    author: document.getElementById('edit-author-text').value.trim(),
    author_id: authorIdVal ? parseInt(authorIdVal) : null,
    cover_url: document.getElementById('edit-cover').value.trim() || null,
    description: document.getElementById('edit-description').value.trim(),
    genre: document.getElementById('edit-genre').value || null,
    rating: rEl ? parseInt(rEl.value) : null,
  };
  try {
    const res = await fetch(`${API}/books?id=eq.${editingId}`, {
      method: 'PATCH', headers: {...headers,'Prefer':'return=minimal'}, body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error();
    document.getElementById('edit-overlay').classList.remove('open');
    await loadBooks();
  } catch {
    alert('Błąd zapisu.');
  } finally {
    btn.disabled = false; btn.textContent = 'Zapisz zmiany';
  }
});

async function deleteBook(e, id) {
  e.stopPropagation();
  if (!confirm('Usunąć tę książkę?')) return;
  await fetch(`${API}/books?id=eq.${id}`, { method:'DELETE', headers });
  await loadBooks();
}

document.getElementById('modal-close').addEventListener('click', () => {
  document.getElementById('modal-overlay').classList.remove('open');
});
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
});

document.getElementById('search').addEventListener('input', applyFilters);
document.getElementById('genre-filter').addEventListener('change', applyFilters);
document.getElementById('sort-select').addEventListener('change', applyFilters);

document.getElementById('add-form').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = document.getElementById('submit-btn');
  const status = document.getElementById('status');
  const rEl = document.querySelector('input[name="rating"]:checked');
  const authorIdVal = document.getElementById('author_id').value;
  btn.disabled = true; btn.textContent = 'Dodawanie...'; status.textContent = '';
  const body = {
    title: document.getElementById('title').value.trim(),
    author: document.getElementById('author-text').value.trim(),
    author_id: authorIdVal ? parseInt(authorIdVal) : null,
    description: document.getElementById('description').value.trim(),
    cover_url: document.getElementById('cover_url').value.trim() || null,
    genre: document.getElementById('genre').value || null,
    rating: rEl ? parseInt(rEl.value) : null,
  };
  try {
    const res = await fetch(`${API}/books`, {
      method:'POST', headers:{...headers,'Prefer':'return=minimal'}, body:JSON.stringify(body)
    });
    if (!res.ok) throw new Error();
    status.textContent = '✓ Książka dodana!'; status.className = 'status-ok';
    e.target.reset();
    await loadBooks();
  } catch {
    status.textContent = '✗ Nie udało się dodać.'; status.className = 'status-err';
  } finally {
    btn.disabled = false; btn.textContent = 'Dodaj książkę';
  }
});

document.getElementById('add-author-form').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = document.getElementById('add-author-btn');
  btn.disabled = true; btn.textContent = 'Dodawanie...';
  const body = {
    name: document.getElementById('author-name').value.trim(),
    bio: document.getElementById('author-bio').value.trim(),
  };
  try {
    const res = await fetch(`${API}/authors`, {
      method:'POST', headers:{...headers,'Prefer':'return=minimal'}, body:JSON.stringify(body)
    });
    if (!res.ok) throw new Error();
    document.getElementById('author-status').textContent = '✓ Autor dodany!';
    document.getElementById('author-status').className = 'status-ok';
    e.target.reset();
    await loadAuthors();
  } catch {
    document.getElementById('author-status').textContent = '✗ Błąd.';
    document.getElementById('author-status').className = 'status-err';
  } finally {
    btn.disabled = false; btn.textContent = 'Dodaj autora';
  }
});

(async () => {
  await loadAuthors();
  await loadBooks();
})();