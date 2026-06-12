const SUPABASE_URL = 'https://ranrnrbrurdobdbxgbsz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhbnJucmJydXJkb2JkYnhnYnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyOTYyODMsImV4cCI6MjA5Njg3MjI4M30.whc6MPhDdIhx1e98UVdMKVRnURmffZFOz0XGBTzAwmk';

const API = `${SUPABASE_URL}/rest/v1/books`;

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

async function loadBooks() {
  const list = document.getElementById('books-list');
  const count = document.getElementById('count');

  try {
    const res = await fetch(`${API}?order=created_at.desc`, { headers });
    const books = await res.json();

    count.textContent = books.length;

    if (!books.length) {
      list.innerHTML = '<div class="empty">Brak książek. Dodaj pierwszą!</div>';
      return;
    }

    list.innerHTML = books.map(b => `
      <div class="book-item">
        <div class="book-info">
          <h3>${escape(b.title)}</h3>
          <div class="author">${escape(b.author)}</div>
          ${b.description ? `<div class="desc">${escape(b.description)}</div>` : ''}
        </div>
        <div class="book-date">${new Date(b.created_at).toLocaleDateString('pl-PL')}</div>
      </div>
    `).join('');
  } catch (e) {
    list.innerHTML = '<div class="empty">Błąd ładowania danych.</div>';
  }
}

function escape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

document.getElementById('add-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const btn = document.getElementById('submit-btn');
  const status = document.getElementById('status');
  const title = document.getElementById('title').value.trim();
  const author = document.getElementById('author').value.trim();
  const description = document.getElementById('description').value.trim();

  btn.disabled = true;
  btn.textContent = 'Dodawanie...';
  status.textContent = '';
  status.className = '';

  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ title, author, description }),
    });

    if (!res.ok) throw new Error('Błąd serwera');

    status.textContent = '✓ Książka dodana!';
    status.className = 'status-ok';
    e.target.reset();
    await loadBooks();
  } catch (err) {
    status.textContent = '✗ Nie udało się dodać. Spróbuj ponownie.';
    status.className = 'status-err';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Dodaj książkę';
  }
});

loadBooks();
