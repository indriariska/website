document.addEventListener('DOMContentLoaded', function () {
  // Check authentication
  const token = localStorage.getItem('adminToken');
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
  
  if (!token) {
    window.location.href = '/admin/login.html';
    return;
  }

  // Set user info
  document.getElementById('userName').textContent = user.name || 'Admin';
  document.getElementById('userRole').textContent = user.role === 'admin' ? 'Administrator' : 'Staff';

  // Sidebar toggle
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  
  menuToggle.addEventListener('click', function () {
    sidebar.classList.toggle('open');
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', function () {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login.html';
  });

  // Load dashboard data
  loadDashboardData();
});

async function loadDashboardData() {
  try {
    const stats = await AdminAPI.getDashboardStats();
    
    if (stats.success) {
      updateStats(stats.data);
      updateCharts(stats.data);
      updateTables(stats.data);
    }
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    showToast('Failed to load dashboard data', 'error');
  }
}

function updateStats(data) {
  document.getElementById('totalRevenue').textContent = formatCurrency(data.totalRevenue || 0);
  document.getElementById('totalOrders').textContent = data.totalOrders || 0;
  document.getElementById('grossProfit').textContent = formatCurrency(data.grossProfit || 0);
  document.getElementById('totalCustomers').textContent = data.totalCustomers || 0;
  document.getElementById('ordersToday').textContent = data.ordersToday || 0;
  document.getElementById('revenueToday').textContent = formatCurrency(data.revenueToday || 0);
  document.getElementById('monthlyRevenue').textContent = formatCurrency(data.monthlyRevenue || 0);
  document.getElementById('monthlyExpenses').textContent = formatCurrency(data.monthlyExpenses || 0);
  document.getElementById('netProfit').textContent = formatCurrency(data.netProfit || 0);
  document.getElementById('totalProducts').textContent = data.totalProducts || 0;
}

function updateCharts(data) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Revenue Chart
  const revenueCtx = document.getElementById('revenueChart').getContext('2d');
  new Chart(revenueCtx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [{
        label: 'Revenue',
        data: data.monthlyRevenueData || Array(12).fill(0),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatCurrency(value);
            },
          },
        },
      },
    },
  });

  // Profit Chart
  const profitCtx = document.getElementById('profitChart').getContext('2d');
  new Chart(profitCtx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [{
        label: 'Profit',
        data: data.monthlyProfitData || Array(12).fill(0),
        backgroundColor: '#10b981',
        borderRadius: 8,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return formatCurrency(value);
            },
          },
        },
      },
    },
  });

  // Orders Chart
  const ordersCtx = document.getElementById('ordersChart').getContext('2d');
  new Chart(ordersCtx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [{
        label: 'Orders',
        data: data.monthlyOrdersData || Array(12).fill(0),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
    },
  });
}

function updateTables(data) {
  // Latest Orders
  const latestOrdersTable = document.getElementById('latestOrdersTable');
  if (data.latestOrders && data.latestOrders.length > 0) {
    latestOrdersTable.innerHTML = data.latestOrders.map(order => `
      <tr>
        <td>#${order.id.substring(0, 8)}</td>
        <td>${order.customer?.name || 'Unknown'}</td>
        <td>${formatCurrency(order.totalPrice)}</td>
        <td><span class="status-badge ${order.status}">${order.status}</span></td>
        <td>${formatDate(order.createdAt)}</td>
      </tr>
    `).join('');
  } else {
    latestOrdersTable.innerHTML = '<tr><td colspan="5" class="loading">No orders yet</td></tr>';
  }

  // Low Stock Products
  const lowStockTable = document.getElementById('lowStockTable');
  if (data.lowStockProducts && data.lowStockProducts.length > 0) {
    lowStockTable.innerHTML = data.lowStockProducts.map(product => `
      <tr>
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td><span style="color: #ef4444; font-weight: 600;">${product.stock}</span></td>
        <td>${formatCurrency(product.sellingPrice)}</td>
      </tr>
    `).join('');
  } else {
    lowStockTable.innerHTML = '<tr><td colspan="4" class="loading">No low stock products</td></tr>';
  }

  // Best Selling Products
  const bestSellingTable = document.getElementById('bestSellingTable');
  if (data.bestSellingProducts && data.bestSellingProducts.length > 0) {
    bestSellingTable.innerHTML = data.bestSellingProducts.map(product => `
      <tr>
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>${product.totalSold || 0}</td>
        <td>${formatCurrency(product.totalRevenue || 0)}</td>
      </tr>
    `).join('');
  } else {
    bestSellingTable.innerHTML = '<tr><td colspan="4" class="loading">No sales data yet</td></tr>';
  }
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
