document.addEventListener('DOMContentLoaded', function () {
  const token = localStorage.getItem('adminToken');
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
  
  if (!token) {
    window.location.href = '/admin/login.html';
    return;
  }

  document.getElementById('userName').textContent = user.name || 'Admin';
  document.getElementById('userRole').textContent = user.role === 'admin' ? 'Administrator' : 'Staff';

  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  
  menuToggle.addEventListener('click', function () {
    sidebar.classList.toggle('open');
  });

  document.getElementById('logoutBtn').addEventListener('click', function () {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login.html';
  });

  loadCustomers();

  // Filter listeners
  document.getElementById('searchInput').addEventListener('input', debounce(loadCustomers, 300));

  // Modal listeners
  document.getElementById('addCustomerBtn').addEventListener('click', () => openCustomerModal());
  document.getElementById('closeModal').addEventListener('click', closeCustomerModal);
  document.getElementById('cancelBtn').addEventListener('click', closeCustomerModal);
  document.getElementById('customerModal').addEventListener('click', function(e) {
    if (e.target === this) closeCustomerModal();
  });
  document.getElementById('saveCustomerBtn').addEventListener('click', saveCustomer);

  // Orders modal listeners
  document.getElementById('closeOrdersModal').addEventListener('click', closeOrdersModal);
  document.getElementById('customerOrdersModal').addEventListener('click', function(e) {
    if (e.target === this) closeOrdersModal();
  });
});

let allCustomers = [];

async function loadCustomers() {
  try {
    const response = await AdminAPI.getCustomers();
    
    if (response.success) {
      allCustomers = response.data;
      filterAndRenderCustomers();
    }
  } catch (error) {
    console.error('Failed to load customers:', error);
    showToast('Failed to load customers', 'error');
  }
}

function filterAndRenderCustomers() {
  const search = document.getElementById('searchInput').value.toLowerCase();

  let filtered = allCustomers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(search) ||
      (customer.phone && customer.phone.includes(search)) ||
      (customer.address && customer.address.toLowerCase().includes(search));
    
    return matchesSearch;
  });

  renderCustomers(filtered);
}

function renderCustomers(customers) {
  const tbody = document.getElementById('customersTable');
  
  if (customers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="loading">No customers found</td></tr>';
    return;
  }

  tbody.innerHTML = customers.map(customer => {
    const totalOrders = customer.orders?.length || 0;
    const totalSpending = customer.orders?.reduce((sum, order) => sum + order.totalPrice, 0) || 0;
    
    return `
      <tr>
        <td>${customer.name}</td>
        <td>${customer.phone}</td>
        <td>${customer.address || '-'}</td>
        <td>${totalOrders}</td>
        <td>${formatCurrency(totalSpending)}</td>
        <td>${formatDate(customer.createdAt)}</td>
        <td>
          <button class="btn-action" onclick="viewOrders('${customer.id}')" title="View Orders">
            <i class="fas fa-shopping-bag"></i>
          </button>
          <button class="btn-action" onclick="editCustomer('${customer.id}')" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-action danger" onclick="deleteCustomer('${customer.id}')" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function openCustomerModal(customer = null) {
  const modal = document.getElementById('customerModal');
  const title = document.getElementById('customerModalTitle');
  const form = document.getElementById('customerForm');
  
  form.reset();
  document.getElementById('customerId').value = '';
  
  if (customer) {
    title.textContent = 'Edit Customer';
    document.getElementById('customerId').value = customer.id;
    document.getElementById('customerName').value = customer.name;
    document.getElementById('customerPhone').value = customer.phone;
    document.getElementById('customerAddress').value = customer.address || '';
  } else {
    title.textContent = 'Add Customer';
  }
  
  modal.classList.add('show');
}

function closeCustomerModal() {
  document.getElementById('customerModal').classList.remove('show');
}

async function saveCustomer() {
  const id = document.getElementById('customerId').value;
  const name = document.getElementById('customerName').value;
  const phone = document.getElementById('customerPhone').value;
  const address = document.getElementById('customerAddress').value;

  if (!name || !phone) {
    showToast('Please fill in all required fields', 'error');
    return;
  }

  const customerData = {
    name,
    phone,
    address,
  };

  try {
    let response;
    if (id) {
      response = await AdminAPI.updateCustomer(id, customerData);
    } else {
      response = await AdminAPI.createCustomer(customerData);
    }

    if (response.success) {
      showToast(id ? 'Customer updated successfully' : 'Customer created successfully', 'success');
      closeCustomerModal();
      loadCustomers();
    }
  } catch (error) {
    console.error('Failed to save customer:', error);
    showToast('Failed to save customer', 'error');
  }
}

async function editCustomer(id) {
  const customer = allCustomers.find(c => c.id === id);
  if (!customer) return;

  try {
    const response = await AdminAPI.getCustomer(id);
    if (response.success) {
      openCustomerModal(response.data);
    }
  } catch (error) {
    console.error('Failed to load customer:', error);
    showToast('Failed to load customer details', 'error');
  }
}

async function deleteCustomer(id) {
  const customer = allCustomers.find(c => c.id === id);
  if (!customer) return;

  const orderCount = customer.orders?.length || 0;
  if (orderCount > 0) {
    if (!confirm(`This customer has ${orderCount} order(s). Deleting this customer will also delete all associated orders. Are you sure?`)) {
      return;
    }
  } else {
    if (!confirm('Are you sure you want to delete this customer?')) {
      return;
    }
  }

  try {
    const response = await AdminAPI.deleteCustomer(id);
    
    if (response.success) {
      showToast('Customer deleted successfully', 'success');
      loadCustomers();
    }
  } catch (error) {
    console.error('Failed to delete customer:', error);
    showToast('Failed to delete customer', 'error');
  }
}

async function viewOrders(id) {
  const customer = allCustomers.find(c => c.id === id);
  if (!customer) return;

  try {
    const response = await AdminAPI.getCustomer(id);
    
    if (response.success) {
      const customerData = response.data;
      const modalBody = document.getElementById('customerOrdersBody');
      
      if (customerData.orders && customerData.orders.length > 0) {
        modalBody.innerHTML = `
          <div class="customer-info">
            <h3>${customerData.name}</h3>
            <p>Phone: ${customerData.phone}</p>
            <p>Total Orders: ${customerData.orders.length}</p>
            <p>Total Spending: ${formatCurrency(customerData.orders.reduce((sum, order) => sum + order.totalPrice, 0))}</p>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${customerData.orders.map(order => `
                <tr>
                  <td><code>${order.id.substring(0, 8)}</code></td>
                  <td>${formatCurrency(order.totalPrice)}</td>
                  <td><span class="status-badge ${order.status}">${order.status}</span></td>
                  <td>${formatDate(order.createdAt)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      } else {
        modalBody.innerHTML = `
          <div class="customer-info">
            <h3>${customerData.name}</h3>
            <p>Phone: ${customerData.phone}</p>
          </div>
          <p style="text-align: center; color: var(--gray-500); padding: 20px;">No orders yet</p>
        `;
      }
      
      document.getElementById('customerOrdersModal').classList.add('show');
    }
  } catch (error) {
    console.error('Failed to load customer orders:', error);
    showToast('Failed to load customer orders', 'error');
  }
}

function closeOrdersModal() {
  document.getElementById('customerOrdersModal').classList.remove('show');
}

function formatCurrency(value) {
  return 'Rp ' + (value || 0).toLocaleString('id-ID');
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
  
  toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
  toast.className = `toast ${type}`;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
