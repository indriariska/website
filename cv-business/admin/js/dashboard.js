/**
 * CVPro Studio — Admin Dashboard
 * Displays service order statistics, charts, and latest orders.
 */
document.addEventListener('DOMContentLoaded', function () {
  const token = localStorage.getItem('adminToken');
  const user  = JSON.parse(localStorage.getItem('adminUser') || '{}');

  if (!token) {
    window.location.href = '/admin/login.html';
    return;
  }

  document.getElementById('userName').textContent  = user.name  || 'Admin';
  document.getElementById('userRole').textContent  = user.role === 'admin' ? 'Administrator' : 'Staff';

  document.getElementById('menuToggle').addEventListener('click', function () {
    document.getElementById('sidebar').classList.toggle('open');
  });

  document.getElementById('logoutBtn').addEventListener('click', function () {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login.html';
  });

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
    showToast('Gagal memuat data dashboard', 'error');
  }
}

function updateStats(data) {
  // Primary KPI cards
  setText('totalRevenue',   formatCurrency(data.totalRevenue   || 0));
  setText('totalOrders',    data.totalOrders   || 0);
  setText('grossProfit',    formatCurrency(data.grossProfit    || 0));
  setText('totalCustomers', data.totalCustomers || 0);

  // Secondary stats
  setText('ordersToday',       data.ordersToday       || 0);
  setText('revenueToday',      formatCurrency(data.revenueToday    || 0));
  setText('monthlyRevenue',    formatCurrency(data.monthlyRevenue  || 0));
  setText('monthlyExpenses',   formatCurrency(data.monthlyExpenses || 0));
  setText('netProfit',         formatCurrency(data.netProfit       || 0));

  // Order status breakdown
  setText('pendingOrders',     data.pendingOrders     || 0);
  setText('processingOrders',  data.processingOrders  || 0);
  setText('completedOrders',   data.completedOrders   || 0);
  setText('cancelledOrders',   data.cancelledOrders   || 0);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// ── Charts ──────────────────────────────────────────────────────
let charts = {};

function updateCharts(data) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  // Revenue Chart
  buildChart('revenueChart', 'line', months,
    [{ label: 'Revenue', data: data.monthlyRevenueData || Array(12).fill(0), borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.4 }],
    { currencyY: true }
  );

  // Profit Chart
  buildChart('profitChart', 'bar', months,
    [{ label: 'Profit', data: data.monthlyProfitData || Array(12).fill(0), backgroundColor: '#10b981', borderRadius: 8 }],
    { currencyY: true }
  );

  // Orders Chart
  buildChart('ordersChart', 'line', months,
    [{ label: 'Pesanan', data: data.monthlyOrdersData || Array(12).fill(0), borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', fill: true, tension: 0.4 }],
    { stepY: true }
  );
}

function buildChart(canvasId, type, labels, datasets, opts = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  // Destroy previous instance to avoid canvas reuse error
  if (charts[canvasId]) { charts[canvasId].destroy(); }

  charts[canvasId] = new Chart(canvas.getContext('2d'), {
    type,
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: opts.currencyY
              ? v => 'Rp ' + (v / 1000).toLocaleString('id-ID') + 'k'
              : v => v,
            stepSize: opts.stepY ? 1 : undefined,
          },
        },
      },
    },
  });
}

// ── Tables ───────────────────────────────────────────────────────
function updateTables(data) {
  // Latest Orders
  const latestTbody = document.getElementById('latestOrdersTable');
  if (latestTbody) {
    if (data.latestOrders && data.latestOrders.length > 0) {
      latestTbody.innerHTML = data.latestOrders.map(order => `
        <tr>
          <td><code>#${order.id.substring(0, 8)}</code></td>
          <td>${escHtml(order.customerName)}</td>
          <td>${escHtml(order.serviceType)}</td>
          <td>${formatCurrency(order.price)}</td>
          <td><span class="status-badge ${order.status}">${statusLabel(order.status)}</span></td>
          <td>${formatDate(order.createdAt)}</td>
        </tr>
      `).join('');
    } else {
      latestTbody.innerHTML = '<tr><td colspan="6" class="loading">Belum ada pesanan</td></tr>';
    }
  }

  // Top Services
  const servicesTbody = document.getElementById('topServicesTable');
  if (servicesTbody) {
    if (data.topServices && data.topServices.length > 0) {
      servicesTbody.innerHTML = data.topServices.map(s => `
        <tr>
          <td>${escHtml(s.serviceType)}</td>
          <td>${s.totalOrders}</td>
          <td>${formatCurrency(s.totalRevenue)}</td>
        </tr>
      `).join('');
    } else {
      servicesTbody.innerHTML = '<tr><td colspan="3" class="loading">Belum ada data</td></tr>';
    }
  }
}

// ── Helpers ──────────────────────────────────────────────────────
function formatCurrency(value) {
  return 'Rp ' + (value || 0).toLocaleString('id-ID');
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function statusLabel(status) {
  const map = { pending: 'Pending', paid: 'Dibayar', processing: 'Proses', completed: 'Selesai', cancelled: 'Batal' };
  return map[status] || status;
}

function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
  toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3500);
}
