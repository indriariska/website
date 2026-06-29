const API_BASE_URL = 'http://localhost:3000/api';

class AdminAPI {
  static async request(endpoint, options = {}) {
    const token = localStorage.getItem('adminToken');
    const url = `${API_BASE_URL}${endpoint}`;
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
      const data = await response.json();

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
    const token = localStorage.getItem('adminToken');
    const url = `${API_BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
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

  static async login(email, password) {
    return this.post('/auth/login', { email, password });
  }

  static async getProfile() {
    return this.get('/auth/profile');
  }

  // Customers
  static async getCustomers() {
    return this.get('/customers');
  }

  static async getCustomer(id) {
    return this.get(`/customers/${id}`);
  }

  static async createCustomer(data) {
    return this.post('/customers', data);
  }

  static async updateCustomer(id, data) {
    return this.put(`/customers/${id}`, data);
  }

  static async deleteCustomer(id) {
    return this.delete(`/customers/${id}`);
  }

  // Products
  static async getProducts() {
    return this.get('/products');
  }

  static async getProduct(id) {
    return this.get(`/products/${id}`);
  }

  static async createProduct(data, imageFile = null) {
    if (imageFile) {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
      formData.append('image', imageFile);
      return this.upload('/products', formData);
    }
    return this.post('/products', data);
  }

  static async updateProduct(id, data, imageFile = null) {
    if (imageFile) {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
      formData.append('image', imageFile);
      return this.upload(`/products/${id}`, formData);
    }
    return this.put(`/products/${id}`, data);
  }

  static async deleteProduct(id) {
    return this.delete(`/products/${id}`);
  }

  // Orders
  static async getOrders() {
    return this.get('/orders');
  }

  static async getOrder(id) {
    return this.get(`/orders/${id}`);
  }

  static async updateOrderStatus(id, status) {
    return this.put(`/orders/${id}/status`, { status });
  }

  static async deleteOrder(id) {
    return this.delete(`/orders/${id}`);
  }

  static async getOrderStats() {
    return this.get('/orders/stats');
  }

  // Expenses
  static async getExpenses() {
    return this.get('/expenses');
  }

  static async getExpense(id) {
    return this.get(`/expenses/${id}`);
  }

  static async createExpense(data) {
    return this.post('/expenses', data);
  }

  static async updateExpense(id, data) {
    return this.put(`/expenses/${id}`, data);
  }

  static async deleteExpense(id) {
    return this.delete(`/expenses/${id}`);
  }

  // Settings
  static async getSettings() {
    return this.get('/settings');
  }

  static async updateSettings(data) {
    return this.put('/settings', data);
  }

  // Dashboard Stats
  static async getDashboardStats() {
    return this.get('/dashboard/stats');
  }

  static logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login.html';
  }
}

module.exports = AdminAPI;
