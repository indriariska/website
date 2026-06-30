/**
 * CVPro Studio — Admin API Client
 * All requests are sent to http://localhost:3000/api
 * JWT token is read from localStorage on every request.
 */
const API_BASE_URL = 'http://localhost:3000/api';

class AdminAPI {
  // ── Core request helper ────────────────────────────────────────
  static async request(endpoint, options = {}) {
    const token = localStorage.getItem('adminToken');
    const url   = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data     = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          window.location.href = '/admin/login.html';
          throw new Error('Session expired');
        }
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('AdminAPI Error:', error);
      throw error;
    }
  }

  static async get(endpoint)           { return this.request(endpoint, { method: 'GET' }); }
  static async post(endpoint, body)    { return this.request(endpoint, { method: 'POST',   body: JSON.stringify(body) }); }
  static async put(endpoint, body)     { return this.request(endpoint, { method: 'PUT',    body: JSON.stringify(body) }); }
  static async delete(endpoint)        { return this.request(endpoint, { method: 'DELETE' }); }

  static async upload(endpoint, formData) {
    const token = localStorage.getItem('adminToken');
    const url   = `${API_BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Upload failed');
      return data;
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  }

  // ── Auth ──────────────────────────────────────────────────────
  static async login(email, password)  { return this.post('/auth/login', { email, password }); }
  static async getProfile()            { return this.get('/auth/profile'); }

  // ── Orders (service-based) ────────────────────────────────────
  static async getOrders(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.get('/orders' + (qs ? '?' + qs : ''));
  }
  static async getOrder(id)                   { return this.get(`/orders/${id}`); }
  static async updateOrderStatus(id, status, adminNotes, extra = {}) {
    return this.put(`/orders/${id}/status`, { status, adminNotes, ...extra });
  }
  static async updateOrder(id, data)          { return this.put(`/orders/${id}`, data); }
  static async deleteOrder(id)                { return this.delete(`/orders/${id}`); }
  static async getOrderStats()                { return this.get('/orders/stats'); }
  static async uploadDeliveryFile(id, fileOrFormData) {
    // fileOrFormData can be:
    //   - a File object  → wrap in FormData with field "file"
    //   - a FormData already built by caller → use as-is
    let formData;
    if (fileOrFormData instanceof FormData) {
      formData = fileOrFormData;
    } else {
      formData = new FormData();
      formData.append('file', fileOrFormData);
    }
    return this.upload(`/orders/${id}/delivery`, formData);
  }

  // ── Expenses ──────────────────────────────────────────────────
  static async getExpenses()                  { return this.get('/expenses'); }
  static async getExpense(id)                 { return this.get(`/expenses/${id}`); }
  static async createExpense(data)            { return this.post('/expenses', data); }
  static async updateExpense(id, data)        { return this.put(`/expenses/${id}`, data); }
  static async deleteExpense(id)              { return this.delete(`/expenses/${id}`); }

  // ── Settings ──────────────────────────────────────────────────
  static async getSettings()                  { return this.get('/settings'); }
  static async updateSettings(data)           { return this.put('/settings', data); }
  static async uploadSettings(formData)       { return this.upload('/settings', formData); }

  // ── Dashboard ─────────────────────────────────────────────────
  static async getDashboardStats()            { return this.get('/dashboard/stats'); }

  // ── Auth helpers ──────────────────────────────────────────────
  static logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login.html';
  }
}

// Browser-compatible — no module.exports
window.AdminAPI = AdminAPI;
