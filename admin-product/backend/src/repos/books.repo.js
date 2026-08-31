// ---------------------------------------------------------------------
//  Books repository. Every function has a mock path (in-memory store) and
//  an oracle path (parameterized SQL via config/db.query). Controllers
//  never touch either backend directly.
// ---------------------------------------------------------------------
import { isMock } from '../config/env.js';
import { db, nextId, nowIso, deriveStatus } from '../data/store.js';
import { query } from '../config/db.js';

const PUBLIC_COLS = `
  book_id, title, author, isbn, genre, description, cover_image_url,
  shelf_location, total_copies, available_copies, status, added_on`;

// ---- list + search/filter -------------------------------------------
export async function listBooks({ q, genre, availability, sort } = {}) {
  if (isMock) {
    let rows = [...db.books];
    if (q) {
      const needle = q.toLowerCase();
      rows = rows.filter(
        (b) =>
          b.title.toLowerCase().includes(needle) ||
          b.author.toLowerCase().includes(needle) ||
          (b.isbn || '').includes(needle)
      );
    }
    if (genre) rows = rows.filter((b) => (b.genre || '').toLowerCase() === genre.toLowerCase());
    if (availability === 'available') rows = rows.filter((b) => b.available_copies > 0);
    if (availability === 'checked_out') rows = rows.filter((b) => b.available_copies === 0);

    rows.sort((a, b) => {
      if (sort === 'title') return a.title.localeCompare(b.title);
      if (sort === 'author') return a.author.localeCompare(b.author);
      return new Date(b.added_on) - new Date(a.added_on); // newest first (default)
    });
    return rows.map(stripInternal);
  }

  // Oracle path — build binds dynamically but keep values parameterized.
  const where = [];
  const binds = {};
  if (q) {
    where.push(`(LOWER(title) LIKE :q OR LOWER(author) LIKE :q OR isbn LIKE :qraw)`);
    binds.q = `%${q.toLowerCase()}%`;
    binds.qraw = `%${q}%`;
  }
  if (genre) { where.push(`LOWER(genre) = :genre`); binds.genre = genre.toLowerCase(); }
  if (availability === 'available') where.push(`available_copies > 0`);
  if (availability === 'checked_out') where.push(`available_copies = 0`);

  const orderBy =
    sort === 'title' ? 'title' : sort === 'author' ? 'author' : 'added_on DESC';
  const sql = `SELECT ${PUBLIC_COLS} FROM books
               ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
               ORDER BY ${orderBy}`;
  const { rows } = await query(sql, binds);
  return rows.map(lowerKeys);
}

// ---- single book -----------------------------------------------------
export async function getBook(id) {
  if (isMock) {
    const b = db.books.find((x) => x.book_id === Number(id));
    return b ? stripInternal(b) : null;
  }
  const { rows } = await query(
    `SELECT ${PUBLIC_COLS} FROM books WHERE book_id = :id`,
    { id: Number(id) }
  );
  return rows[0] ? lowerKeys(rows[0]) : null;
}

// Count a search hit for the "most-searched" dashboard metric.
export async function bumpSearchCount(id) {
  if (isMock) {
    const b = db.books.find((x) => x.book_id === Number(id));
    if (b) b.search_count += 1;
    return;
  }
  await query(`UPDATE books SET search_count = search_count + 1 WHERE book_id = :id`, {
    id: Number(id),
  });
}

// ---- create ----------------------------------------------------------
export async function createBook(data) {
  const total = Number(data.total_copies ?? 1);
  const available = Number(data.available_copies ?? total);
  if (isMock) {
    const row = {
      book_id: nextId('book'),
      title: data.title,
      author: data.author,
      isbn: data.isbn || null,
      genre: data.genre || null,
      description: data.description || null,
      cover_image_url: data.cover_image_url || null,
      shelf_location: data.shelf_location || null,
      total_copies: total,
      available_copies: available,
      status: deriveStatus(available),
      search_count: 0,
      added_on: nowIso(),
    };
    db.books.push(row);
    return stripInternal(row);
  }
  const { outBinds } = await query(
    `INSERT INTO books (title, author, isbn, genre, description, cover_image_url,
                        shelf_location, total_copies, available_copies)
     VALUES (:title, :author, :isbn, :genre, :description, :cover_image_url,
             :shelf_location, :total_copies, :available_copies)
     RETURNING book_id INTO :id`,
    {
      title: data.title, author: data.author, isbn: data.isbn || null,
      genre: data.genre || null, description: data.description || null,
      cover_image_url: data.cover_image_url || null,
      shelf_location: data.shelf_location || null,
      total_copies: total, available_copies: available,
      id: { dir: (await import('oracledb')).default.BIND_OUT, type: (await import('oracledb')).default.NUMBER },
    }
  );
  return getBook(outBinds.id[0]);
}

// ---- update ----------------------------------------------------------
export async function updateBook(id, data) {
  if (isMock) {
    const b = db.books.find((x) => x.book_id === Number(id));
    if (!b) return null;
    const fields = ['title', 'author', 'isbn', 'genre', 'description',
      'cover_image_url', 'shelf_location', 'total_copies', 'available_copies'];
    for (const f of fields) if (data[f] !== undefined) b[f] = data[f];
    b.total_copies = Number(b.total_copies);
    b.available_copies = Math.max(0, Math.min(Number(b.available_copies), b.total_copies));
    b.status = deriveStatus(b.available_copies);
    return stripInternal(b);
  }

  const allowed = ['title', 'author', 'isbn', 'genre', 'description',
    'cover_image_url', 'shelf_location', 'total_copies', 'available_copies'];
  const sets = [];
  const binds = { id: Number(id) };
  for (const f of allowed) {
    if (data[f] !== undefined) { sets.push(`${f} = :${f}`); binds[f] = data[f]; }
  }
  if (!sets.length) return getBook(id);
  const { rowsAffected } = await query(
    `UPDATE books SET ${sets.join(', ')} WHERE book_id = :id`, binds
  );
  if (!rowsAffected) return null;
  return getBook(id);
}

// ---- delete ----------------------------------------------------------
export async function deleteBook(id) {
  if (isMock) {
    const i = db.books.findIndex((x) => x.book_id === Number(id));
    if (i === -1) return false;
    db.books.splice(i, 1);
    // clean up dependent rows so mock stays consistent
    db.wishlist = db.wishlist.filter((w) => w.book_id !== Number(id));
    db.notifyRequests = db.notifyRequests.filter((n) => n.book_id !== Number(id));
    return true;
  }
  await query(`DELETE FROM wishlist WHERE book_id = :id`, { id: Number(id) });
  await query(`DELETE FROM notify_requests WHERE book_id = :id`, { id: Number(id) });
  const { rowsAffected } = await query(`DELETE FROM books WHERE book_id = :id`, { id: Number(id) });
  return rowsAffected > 0;
}

// ---- distinct genres for filter dropdown -----------------------------
export async function listGenres() {
  if (isMock) {
    return [...new Set(db.books.map((b) => b.genre).filter(Boolean))].sort();
  }
  const { rows } = await query(
    `SELECT DISTINCT genre FROM books WHERE genre IS NOT NULL ORDER BY genre`
  );
  return rows.map((r) => r.GENRE);
}

// ---- helpers ---------------------------------------------------------
function stripInternal(b) {
  const { search_count, ...pub } = b; // eslint-disable-line no-unused-vars
  return { ...pub };
}
// Oracle returns UPPERCASE keys; normalize to the lowercase shape the API uses.
function lowerKeys(row) {
  const out = {};
  for (const k of Object.keys(row)) out[k.toLowerCase()] = row[k];
  return out;
}
