const API = {
  token: localStorage.getItem('netsage-token') || '',
  async request(path, options = {}) {
    const headers = { ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}), ...options.headers };
    const response = await fetch(path, { ...options, headers });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
    return data;
  },
  async auth(action, fields) { const result = await this.request(`/api/auth/${action}`, { method: 'POST', body: JSON.stringify(fields) }); this.token = result.token; localStorage.setItem('netsage-token', result.token); return result.user; },
  me() { return this.request('/api/auth/me'); },
  diagnose(fields) { return this.request('/api/diagnoses', { method: 'POST', body: JSON.stringify(fields) }); },
  list() { return this.request('/api/diagnoses'); },
  review(id, fields) { return this.request(`/api/diagnoses/${id}/review`, { method: 'PATCH', body: JSON.stringify(fields) }); }
};
