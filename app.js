const SUPABASE_URL = 'https://ranrnrbrurdobdbxgbsz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhbnJucmJydXJkb2JkYnhnYnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyOTYyODMsImV4cCI6MjA5Njg3MjI4M30.whc6MPhDdIhx1e98UVdMKVRnURmffZFOz0XGBTzAwmk';
const API = `${SUPABASE_URL}/rest/v1/books`;
const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

let allBooks = [];

function esc(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function stars(rating) {
  if (!rating) return '';
  const filled = '★'.repeat(rating);
  const empty = '★'.repeat(5 - rating);
  return `<span style="color:#f59e0b">${filled}</span><span style="color:#ddd">${empty}</span>`;
}

function renderGrid(books) {
  const grid = document.getElementById('books-grid');
  document.getElementById('count').textContent = books.length;

  if (!books.length) {
    grid.innerHTML = '<div class="empty">Brak wyników.</div>';
    return;
  }

  grid.innerHTML = books.map(b => {
    const coverHtml = b.cover_url
      ? `<div class="book-cover"><img src="${esc(b.cover_url)}" alt="okładka" onerror="this.parentElement.innerHTML='📖'"/></div>`
      : `<div class="book-cover">📖</div>`;

    return `
      <div class="book-card" onclick="openModal(${b.id})">
        ${coverHtml}
        <div class="book-body">
          <h3>${esc(b.title)}</h3>
          <div class="author">${esc(b.author)}</div>
          <div class="stars">${stars(b.rating)}</div>
        </div>
        <button class="btn-delete" onclick="deleteBook(event, ${b.id})" title="Usuń">✕</button>
      </div>
    `;
  }).join('');
}

async function loadBooks() {
  try {
    const res = await fetch(`${API}?order=created_at.desc`, { headers });
    allBooks = await res.json();
    renderGrid(allBooks);
  } catch (e) {
    document.getElementById('books-grid').innerHTML = '<div class="empty">Błąd ładowania.</div>';
  }
}

async function deleteBook(e, id) {
  e.stopPropagation();
  if (!confirm('Usunąć tę książkę?')) return;
  await fetch(`${API}?id=eq.${id}`, { method: 'DELETE', headers });
  await loadBooks();
}

function openModal(id) {
  const b = allBooks.find(x => x.id === id);
  if (!b) return;

  const coverEl = document.getElementById('modal-cover');
  if (b.cover_url) {
    coverEl.innerHTML = `<img src="${esc(b.cover_url)}" alt="okładka" onerror="this.parentElement.innerHTML='📖'"/>`;
  } else {
    coverEl.innerHTML = '📖';
  }

  document.getElementById('modal-title').textContent = b.title;
  document.getElementById('modal-author').textContent = b.author;
  document.getElementById('modal-stars').innerHTML = stars(b.rating) || 'Brak oceny';
  document.getElementById('modal-desc').textContent = b.description || 'Brak opisu.';
  document.getElementById('modal-date').textContent = 'Dodano: ' + new Date(b.created_at).toLocaleDateString('pl-PL');

  document.getElementById('modal-overlay').classList.add('open');
}

document.getElementById('modal-close').addEventListener('click', () => {
  document.getElementById('modal-overlay').classList.remove('open');
});
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
});

document.getElementById('search').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  const filtered = allBooks.filter(b =>
    b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
  );
  renderGrid(filtered);
});

document.getElementById('add-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('submit-btn');
  const status = document.getElementById('status');
  const ratingEl = document.querySelector('input[name="rating"]:checked');

  btn.disabled = true;
  btn.textContent = 'Dodawanie...';
  status.textContent = '';

  const body = {
    title: document.getElementById('title').value.trim(),
    author: document.getElementById('author').value.trim(),
    description: document.getElementById('description').value.trim(),
    cover_url: document.getElementById('cover_url').value.trim() || null,
    rating: ratingEl ? parseInt(ratingEl.value) : null,
  };

  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error();
    status.textContent = '✓ Książka dodana!';
    status.className = 'status-ok';
    e.target.reset();
    await loadBooks();
  } catch {
    status.textContent = '✗ Nie udało się dodać.';
    status.className = 'status-err';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Dodaj książkę';
  }
});

loadBooks();