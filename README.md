# 📚 LubimyCzytаć

Prosta aplikacja webowa inspirowana serwisem LubimyCzytać.pl, zbudowana jako projekt semestralny na kurs *Wprowadzenie do technologii internetowych*.

🔗 **[Zobacz aplikację na żywo](https://maksympaderin76040.github.io/LubimyCzytacz/)**

---

## Funkcje

- ➕ Dodawanie książek z tytułem, autorem, opisem, okładką i oceną
- 📋 Przeglądanie listy książek w układzie siatki
- 🔍 Wyszukiwanie po tytule i autorze
- 🎭 Filtrowanie po gatunku literackim
- 🔃 Sortowanie po dacie, tytule i ocenie
- ✏️ Edytowanie i usuwanie książek
- 👤 Zarządzanie autorami z osobnymi stronami
- 🔗 Relacja autor ↔ książki
- ⭐ System oceniania (1–5 gwiazdek)

## Technologie

| Warstwa | Technologia |
|--------|-------------|
| Frontend | HTML, CSS, JavaScript (vanilla) |
| Baza danych | PostgreSQL (Supabase) |
| API | Supabase REST API |
| Hosting | GitHub Pages |

## Struktura projektu

```
LubimyCzytacz/
├── index.html      # Strona główna — lista i dodawanie książek
├── authors.html    # Lista wszystkich autorów
├── author.html     # Strona szczegółowa autora
├── app.js          # Logika aplikacji (pobieranie, dodawanie, edycja)
└── README.md
```

## Uruchomienie lokalne

Wystarczy otworzyć `index.html` w przeglądarce — aplikacja łączy się z bazą danych przez API, nie wymaga lokalnego serwera.

## Baza danych

Projekt korzysta z **Supabase** — hostowanej bazy PostgreSQL z automatycznym REST API.

Schemat tabel:

```sql
-- Autorzy
CREATE TABLE authors (
  id          bigint generated always as identity primary key,
  name        text not null,
  bio         text,
  created_at  timestamptz default now()
);

-- Książki
CREATE TABLE books (
  id          bigint generated always as identity primary key,
  title       text not null,
  author      text not null,
  author_id   bigint references authors(id) on delete set null,
  description text,
  cover_url   text,
  genre       text,
  rating      integer check (rating >= 1 and rating <= 5),
  created_at  timestamptz default now()
);
```

---

*Projekt semestralny — Wprowadzenie do technologii internetowych*
