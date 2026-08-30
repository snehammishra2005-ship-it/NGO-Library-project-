// Admin app API client — talks ONLY to /api/admin/*. Every call carries
// the staff bearer token. The public reader endpoints are never used here.

const TOKEN_KEY = 'admin_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request(path, { method = 'GET', body, raw = false } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api/admin${path}`, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
  });
  if (raw) return res;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) tokenStore.clear();
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

const qs = (params) =>
  new URLSearchParams(Object.entries(params || {}).filter(([, v]) => v !== '' && v != null)).toString();

export const api = {
  login: (body) => request('/login', { method: 'POST', body }),
  me: () => request('/me'),

  dashboard: () => request('/dashboard'),

  // books
  listBooks: (p) => request(`/books${qs(p) ? `?${qs(p)}` : ''}`),
  getBook: (id) => request(`/books/${id}`),
  addBook: (body) => request('/books', { method: 'POST', body }),
  updateBook: (id, body) => request(`/books/${id}`, { method: 'PUT', body }),
  deleteBook: (id) => request(`/books/${id}`, { method: 'DELETE' }),

  // members
  listMembers: (p) => request(`/members${qs(p) ? `?${qs(p)}` : ''}`),
  getMember: (id) => request(`/members/${id}`),
  addMember: (body) => request('/members', { method: 'POST', body }),
  updateMember: (id, body) => request(`/members/${id}`, { method: 'PUT', body }),

  // borrowing
  openLoans: () => request('/borrow-log'),
  issue: (body) => request('/borrow-log', { method: 'POST', body }),
  return: (body) => request('/borrow-log/return', { method: 'POST', body }),

  // invoices
  listInvoices: (p) => request(`/invoices${qs(p) ? `?${qs(p)}` : ''}`),
  getInvoice: (id) => request(`/invoices/${id}`),
  addInvoice: (body) => request('/invoices', { method: 'POST', body }),
  setInvoicePayment: (id, payment_status) => request(`/invoices/${id}/payment`, { method: 'PUT', body: { payment_status } }),

  // maintenance
  listMaintenance: (p) => request(`/maintenance${qs(p) ? `?${qs(p)}` : ''}`),
  addMaintenance: (body) => request('/maintenance', { method: 'POST', body }),
  deleteMaintenance: (id) => request(`/maintenance/${id}`, { method: 'DELETE' }),

  // staff
  listStaff: () => request('/staff'),
  addStaff: (body) => request('/staff', { method: 'POST', body }),
  deleteStaff: (id) => request(`/staff/${id}`, { method: 'DELETE' }),

  // reports + catalog (reads book list via public? no — use admin dashboard/report)
  reports: () => request('/reports'),
  reportCsv: () => request('/reports/most-borrowed.csv', { raw: true }),
  audit: () => request('/audit'),
};
