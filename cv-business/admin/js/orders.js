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

  loadOrders();

  // Filter listeners
  document.getElementById('searchInput').addEventListener('input', debounce(loadOrders, 300));
  document.getElementById('statusFilter').addEventListener('change', loadOrders);
  document.getElementById('dateFrom').addEventListener('change', loadOrders);
  document.getElementById('dateTo').addEventListener('change', loadOrders);

  // Modal close
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('orderModal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });
});

let allOrders = [];

async function loadOrders() {
  try {
    const response = await AdminAPI.getOrders();
    
    if (response.success) {
      allOrders = response.data;
      filterAndRenderOrders();
    }
  } catch (error) {
    console.error('Failed to load orders:', error);
    showToast('Failed to load orders', 'error');
  }
}

function filterAndRenderOrders() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const status = document.getElementById('statusFilter').value;
  const dateFrom = document.getElementById('dateFrom').value;
  const dateTo = document.getElementById('dateTo').value;

  let filtered = allOrders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(search) ||
      (order.customer && order.customer.name.toLowerCase().includes(search));
    
    const matchesStatus = !status || order.status === status;
    
    let matchesDate = true;
    if (dateFrom) {
      matchesDate = matchesDate && new Date(order.createdAt) >= new Date(dateFrom);
    }
    if (dateTo) {
      matchesDate = matchesDate && new Date(order.createdAt) <= new Date(dateTo);
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  renderOrders(filtered);
}

function renderOrders(orders) {
  const tbody = document.getElementById('ordersTable');
  
  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="loading">No orders found</td></tr>';
    return;
  }

  tbody.innerHTML = orders.map(order => `
    <tr>
      <td><code>${order.id.substring(0, 8)}</code></td>
      <td>${order.customer?.name || 'Unknown'}</td>
      <td>${order.orderItems?.length || 0} items</td>
      <td>${formatCurrency(order.totalPrice)}</td>
      <td><span class="status-badge ${order.status}">${order.status}</span></td>
      <td>${order.paymentMethod}</td>
      <td>${formatDate(order.createdAt)}</td>
      <td>
        <button class="btn-action" onclick="viewOrder('${order.id}')" title="View Details">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn-action" onclick="updateStatus('${order.id}')" title="Update Status">
          <i class="fas fa-edit"></i>
        </button>
        ${order.status === 'cancelled' ? `
          <button class="btn-action danger" onclick="deleteOrder('${order.id}')" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        ` : ''}
      </td>
    </tr>
  `).join('');
}

async function viewOrder(id) {
  try {
    const response = await AdminAPI.getOrder(id);
    
    if (response.success) {
      const order = response.data;
      const modalBody = document.getElementById('orderModalBody');
      
      modalBody.innerHTML = `
        <div class="order-detail">
          <div class="detail-section">
            <h3>Order Information</h3>
            <div class="detail-grid">
              <div>
                <label>Order ID:</label>
                <span><code>${order.id}</code></span>
              </div>
              <div>
                <label>Date:</label>
                <span>${formatDate(order.createdAt)}</span>
              </div>
              <div>
                <label>Status:</label>
                <span class="status-badge ${order.status}">${order.status}</span>
              </div>
              <div>
                <label>Payment Method:</label>
                <span>${order.paymentMethod}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Customer Information</h3>
            <div class="detail-grid">
              <div>
                <label>Name:</label>
                <span>${order.customer?.name || 'Unknown'}</span>
              </div>
              <div>
                <label>Phone:</label>
                <span>${order.customer?.phone || '-'}</span>
              </div>
              <div>
                <label>Address:</label>
                <span>${order.customer?.address || '-'}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Order Items</h3>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${order.orderItems.map(item => `
                  <tr>
                    <td>${item.product?.name || 'Unknown'}</td>
                    <td>${item.quantity}</td>
                    <td>${formatCurrency(item.price)}</td>
                    <td>${formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="detail-section">
            <h3>Order Summary</h3>
            <div class="summary-row">
              <span>Total Cost:</span>
              <span>${formatCurrency(order.totalCost)}</span>
            </div>
            <div class="summary-row">
              <span>Total Price:</span>
              <span>${formatCurrency(order.totalPrice)}</span>
            </div>
            <div class="summary-row highlight">
              <span>Gross Profit:</span>
              <span>${formatCurrency(order.profit)}</span>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn-primary" onclick="printInvoice('${order.id}')">
              <i class="fas fa-print"></i>
              Print Invoice
            </button>
            <button class="btn-secondary" onclick="updateStatus('${order.id}')">
              <i class="fas fa-edit"></i>
              Update Status
            </button>
          </div>
        </div>
      `;
      
      document.getElementById('orderModal').classList.add('show');
    }
  } catch (error) {
    console.error('Failed to load order:', error);
    showToast('Failed to load order details', 'error');
  }
}

async function updateStatus(id) {
  const order = allOrders.find(o => o.id === id);
  if (!order) return;

  const newStatus = prompt(`Current status: ${order.status}\n\nEnter new status (pending/processing/completed/cancelled):`, order.status);
  
  if (!newStatus || !['pending', 'processing', 'completed', 'cancelled'].includes(newStatus)) {
    return;
  }

  try {
    const response = await AdminAPI.updateOrderStatus(id, newStatus);
    
    if (response.success) {
      showToast('Order status updated successfully', 'success');
      closeModal();
      loadOrders();
    }
  } catch (error) {
    console.error('Failed to update order status:', error);
    showToast('Failed to update order status', 'error');
  }
}

async function deleteOrder(id) {
  if (!confirm('Are you sure you want to delete this order?')) {
    return;
  }

  try {
    const response = await AdminAPI.deleteOrder(id);
    
    if (response.success) {
      showToast('Order deleted successfully', 'success');
      loadOrders();
    }
  } catch (error) {
    console.error('Failed to delete order:', error);
    showToast('Failed to delete order', 'error');
  }
}

function printInvoice(id) {
  const order = allOrders.find(o => o.id === id);
  if (!order) return;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
    <head>
      <title>Invoice #${id.substring(0, 8)}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        .header { text-align: center; margin-bottom: 40px; }
        .info { margin-bottom: 20px; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .table th { background: #f5f5f5; }
        .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>INVOICE</h1>
        <p>Order #${id.substring(0, 8)}</p>
        <p>Date: ${formatDate(order.createdAt)}</p>
      </div>
      <div class="info">
        <h3>Customer: ${order.customer?.name || 'Unknown'}</h3>
        <p>Phone: ${order.customer?.phone || '-'}</p>
        <p>Address: ${order.customer?.address || '-'}</p>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${order.orderItems.map(item => `
            <tr>
              <td>${item.product?.name || 'Unknown'}</td>
              <td>${item.quantity}</td>
              <td>${formatCurrency(item.price)}</td>
              <td>${formatCurrency(item.price * item.quantity)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="total">
        Total: ${formatCurrency(order.totalPrice)}
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
}

function closeModal() {
  document.getElementById('orderModal').classList.remove('show');
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
