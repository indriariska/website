// Use relative API path so the app works on any host (localhost, Cloudflare Tunnel, production)
const API_BASE_URL = '/api';

class API {
  static async request(endpoint, options = {}) {
    const url = API_BASE_URL + endpoint;
    // Attach customer token if present (links order to customer account)
    const customerToken = localStorage.getItem('customerToken');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(customerToken ? { Authorization: `Bearer ${customerToken}` } : {}),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  static async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  static async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  static async put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  static async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  static async upload(endpoint, formData) {
    const url = API_BASE_URL + endpoint;
    // Attach customer token if present (so order gets linked to customer account)
    const customerToken = localStorage.getItem('customerToken');
    const headers = {};
    if (customerToken) headers['Authorization'] = `Bearer ${customerToken}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      return data;
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  }

  static async getTemplates(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.get(`/templates?${params}`);
  }

  static async getTemplateById(id) {
    return this.get(`/templates/${id}`);
  }

  static async getReviews(templateId = null) {
    const params = templateId ? `?templateId=${templateId}` : '';
    return this.get(`/reviews${params}`);
  }

  static async getTestimonials() {
    return this.get('/testimonials');
  }

  static async getGallery(category = null) {
    const params = category ? `?category=${category}` : '';
    return this.get(`/gallery${params}`);
  }

  static async getTeamMembers() {
    return this.get('/team');
  }

  static async getSettings() {
    return this.get('/settings');
  }

  static async createOrder(orderData, proofFile = null) {
    if (proofFile) {
      const formData = new FormData();
      Object.keys(orderData).forEach(key => {
        formData.append(key, orderData[key]);
      });
      formData.append('proofImage', proofFile);
      return this.upload('/orders', formData);
    }
    return this.post('/orders', orderData);
  }

  static async login(email, password) {
    return this.post('/auth/login', { email, password });
  }

  static async register(email, password, name) {
    return this.post('/auth/register', { email, password, name });
  }
}

// Browser-compatible — no module.exports
window.API = API;
