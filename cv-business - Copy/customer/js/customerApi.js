/**
 * CVPro Studio — Customer API Client
 * Uses relative URLs so the app works on any host (localhost, Cloudflare Tunnel, production).
 */
const CUSTOMER_API = '/api/customer';

class CustomerAPI {
  static _token() {
    return localStorage.getItem('customerToken');
  }

  static async _req(endpoint, options = {}) {
    const token = this._token();
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    };

    const res = await fetch(CUSTOMER_API + endpoint, config);
    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401) {
        CustomerAuth.clearSession();
        window.location.href = '/customer/login.html';
      }
      throw new Error(data.message || 'Request failed');
    }
    return data;
  }

  static async register(payload)       { return this._req('/register', { method: 'POST', body: JSON.stringify(payload) }); }
  static async login(payload)          { return this._req('/login',    { method: 'POST', body: JSON.stringify(payload) }); }
  static async logout()                { return this._req('/logout',   { method: 'POST' }); }
  static async getProfile()            { return this._req('/profile',  { method: 'GET'  }); }
  static async updateProfile(payload)  { return this._req('/profile',  { method: 'PUT',  body: JSON.stringify(payload) }); }
  static async getDashboard()          { return this._req('/dashboard',{ method: 'GET'  }); }
  static async getOrders()             { return this._req('/orders',   { method: 'GET'  }); }
  static async getOrder(id)            { return this._req(`/orders/${id}`, { method: 'GET' }); }
  static async submitRevision(id, payload) {
    return this._req(`/orders/${id}/revision`, { method: 'POST', body: JSON.stringify(payload) });
  }
  static async uploadRevisionFile(id, file) {
    const token = this._token();
    const formData = new FormData();
    formData.append('proofImage', file);
    const res = await fetch(`/api/customer/orders/${id}/revision-file`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Upload failed');
    return data;
  }
}

/* ── Session helpers ── */
class CustomerAuth {
  static isLoggedIn()   { return !!localStorage.getItem('customerToken'); }
  static getToken()     { return localStorage.getItem('customerToken'); }
  static getCustomer()  { try { return JSON.parse(localStorage.getItem('customerData') || 'null'); } catch { return null; } }

  static saveSession(token, customer) {
    localStorage.setItem('customerToken', token);
    localStorage.setItem('customerData',  JSON.stringify(customer));
  }

  static clearSession() {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerData');
  }
}

window.CustomerAPI  = CustomerAPI;
window.CustomerAuth = CustomerAuth;
