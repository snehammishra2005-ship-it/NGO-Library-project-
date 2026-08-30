// Reader site API client. Talks ONLY to the public API (/api/public/*).
// This app ships nothing but public catalog + reader-account calls; the
// staff back-office is a separate application and is unreachable here.

const TOKEN_KEY = 'reader_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = tokenStore.get();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`/api/public${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  // ---- catalog (read-only) ----
  listBooks: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v != null)
    ).toString();
    return request(`/books${qs ? `?${qs}` : ''}`);
  },
  getBook: (id) => request(`/books/${id}`),
  getGenres: () => request('/books/genres'),

  // ---- reader account ----
  readerLogin: (body) => request('/reader/login', { method: 'POST', body }),
  readerSignup: (body) => request('/reader/signup', { method: 'POST', body }),
  me: () => request('/reader/me', { auth: true }),

  getWishlist: () => request('/reader/wishlist', { auth: true }),
  addWishlist: (bookId) => request('/reader/wishlist', { method: 'POST', body: { bookId }, auth: true }),
  removeWishlist: (bookId) => request(`/reader/wishlist/${bookId}`, { method: 'DELETE', auth: true }),
  getNotify: () => request('/reader/notify', { auth: true }),
  addNotify: (bookId) => request('/reader/notify', { method: 'POST', body: { bookId }, auth: true }),
  removeNotify: (bookId) => request(`/reader/notify/${bookId}`, { method: 'DELETE', auth: true }),
};
