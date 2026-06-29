/**
 * CVPro Studio — Admin Orders Page
 * Displays and manages service orders from customers.
 */
document.addEventListener('DOMContentLoaded', function () {
  const token = localStorage.getItem('adminToken');
  const user  = JSON.parse(localStorage.getItem('adminUser') || '{}');

  if (!token) { window.location.href = '/admin/login.html'; return; }

  document.getElementById('userName').textContent = user.name  || 'Admin';
  document.getElementById('userRole').textContent = user.role === 'admin' ? 'Administrator' : 'Staff';

  document.getElementById('menuToggle').addEventListener('click', function () {
    document.getElementById('sidebar').classList.toggle('open');
  });

  document.getElementById('logoutBtn').addEventListener('click', function () {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login.html';
  });

  loadOrders();

  // Filter listeners
  document.getElementById('searchInput').addEventListener('input',  debounce(filterAndRenderOrders, 300));
  document.getElementById('statusFilter').addEventListener('change', filterAndRenderOrders);
  document.getElementById('dateFrom').addEventListener('change',    filterAndRenderOrders);
  document.getElementById('dateTo').addEventListener('change',      filterAndRenderOrders);

  // Export CSV
  document.getElementById('exportBtn').addEventListener('click', exportCSV);

  // Modal close
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('orderModal').addEventListener('click', function (e) {
    if (e.target === this) closeModal();
  });
});

let allOrders = [];

// ── Load ─────────────────────────────────────────────────────────
async function loadOrders() {
  try {
    const response = await AdminAPI.getOrders();
    if (response.success) {
      allOrders = response.data;
      filterAndRenderOrders();
    }
  } catch (error) {
    console.error('Failed to load orders:', error);
    showToast('Gagal memuat data pesanan', 'error');
  }
}

// ── Filter & Render ───────────────────────────────────────────────
function filterAndRenderOrders() {
  const search   = (document.getElementById('searchInput').value  || '').toLowerCase();
  const status   = document.getElementById('statusFilter').value;
  const dateFrom = document.getElementById('dateFrom').value;
  const dateTo   = document.getElementById('dateTo').value;

  const filtered = allOrders.filter(order => {
    const matchSearch =
      order.id.toLowerCase().includes(search) ||
      order.customerName.toLowerCase().includes(search) ||
      order.customerEmail.toLowerCase().includes(search) ||
      order.serviceType.toLowerCase().includes(search);

    const matchStatus = !status || order.status === status;

    let matchDate = true;
    if (dateFrom) matchDate = matchDate && new Date(order.createdAt) >= new Date(dateFrom);
    if (dateTo)   matchDate = matchDate && new Date(order.createdAt) <= new Date(dateTo + 'T23:59:59');

    return matchSearch && matchStatus && matchDate;
  });

  renderOrders(filtered);
}

function renderOrders(orders) {
  const tbody = document.getElementById('ordersTable');
  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="loading">Tidak ada pesanan ditemukan</td></tr>';
    return;
  }

  tbody.innerHTML = orders.map(order => `
    <tr>
      <td><code>#${order.id.substring(0, 8)}</code></td>
      <td>
        <strong>${escHtml(order.customerName)}</strong><br>
        <small style="color:#6b7280">${escHtml(order.customerWhatsapp)}</small>
      </td>
      <td>
        ${escHtml(order.serviceType)}<br>
        ${order.package ? `<small style="color:#6b7280">${escHtml(order.package)}</small>` : ''}
      </td>
      <td>${formatCurrency(order.price)}</td>
      <td><span class="status-badge ${order.status}">${statusLabel(order.status)}</span></td>
      <td>${escHtml(order.paymentMethod)}</td>
      <td>${formatDate(order.createdAt)}</td>
      <td>
        <button class="btn-action" onclick="viewOrder('${order.id}')" title="Lihat Detail">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn-action" onclick="updateStatus('${order.id}')" title="Ubah Status">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-action danger" onclick="deleteOrder('${order.id}')" title="Hapus">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

// ── View Order Detail ─────────────────────────────────────────────
async function viewOrder(id) {
  try {
    const response = await AdminAPI.getOrder(id);
    if (!response.success) return;
    const o = response.data;

    const proofHtml = o.proofImageUrl
      ? `<a href="${escHtml(o.proofImageUrl)}" target="_blank">
           <img src="${escHtml(o.proofImageUrl)}" alt="Bukti Bayar"
                style="max-width:100%;border-radius:8px;margin-top:6px;border:1px solid #e5e7eb">
         </a>`
      : '<em style="color:#9ca3af">Belum ada bukti pembayaran</em>';

    document.getElementById('orderModalBody').innerHTML = `
      <div class="order-detail">
        <div class="detail-section">
          <h3>Informasi Pesanan</h3>
          <div class="detail-grid">
            <div><label>Order ID</label><span><code>${o.id}</code></span></div>
            <div><label>Tanggal</label><span>${formatDate(o.createdAt)}</span></div>
            <div><label>Status</label><span class="status-badge ${o.status}">${statusLabel(o.status)}</span></div>
            <div><label>Selesai</label><span>${o.completedAt ? formatDate(o.completedAt) : '–'}</span></div>
          </div>
        </div>

        <div class="detail-section">
          <h3>Data Pelanggan</h3>
          <div class="detail-grid">
            <div><label>Nama</label><span>${escHtml(o.customerName)}</span></div>
            <div><label>Email</label><span>${escHtml(o.customerEmail)}</span></div>
            <div><label>WhatsApp</label>
              <span>
                <a href="https://wa.me/${escHtml(o.customerWhatsapp.replace(/\D/g,''))}" target="_blank">
                  ${escHtml(o.customerWhatsapp)}
                </a>
              </span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3>Detail Layanan</h3>
          <div class="detail-grid">
            <div><label>Layanan</label><span>${escHtml(o.serviceType)}</span></div>
            <div><label>Paket</label><span>${escHtml(o.package || '–')}</span></div>
            <div><label>Harga</label><span>${formatCurrency(o.price)}</span></div>
            <div><label>Metode Bayar</label><span>${escHtml(o.paymentMethod)}</span></div>
          </div>
        </div>

        <div class="detail-section">
          <h3>Bukti Pembayaran</h3>
          ${proofHtml}
        </div>

        ${o.adminNotes ? `
        <div class="detail-section">
          <h3>Catatan Admin</h3>
          <p style="white-space:pre-wrap;font-size:0.9rem;color:#374151">${escHtml(o.adminNotes)}</p>
        </div>` : ''}

        <div class="modal-actions">
          <button class="btn-primary" onclick="updateStatus('${o.id}')">
            <i class="fas fa-edit"></i> Ubah Status
          </button>
          <a href="https://wa.me/${o.customerWhatsapp.replace(/\D/g,'')}" target="_blank" class="btn-secondary">
            <i class="fab fa-whatsapp"></i> Hubungi via WA
          </a>
        </div>
      </div>
    `;

    document.getElementById('orderModal').classList.add('show');
  } catch (error) {
    console.error('Failed to load order:', error);
    showToast('Gagal memuat detail pesanan', 'error');
  }
}

// ── Update Status ─────────────────────────────────────────────────
async function updateStatus(id) {
  const order = allOrders.find(o => o.id === id);
  if (!order) return;

  const options = ['pending', 'paid', 'processing', 'completed', 'cancelled'];
  const newStatus = prompt(
    `Status saat ini: ${statusLabel(order.status)}\n\nMasukkan status baru:\n${options.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
    order.status
  );

  if (!newStatus || !options.includes(newStatus)) return;

  const notes = prompt('Catatan admin (opsional):', order.adminNotes || '');

  try {
    const response = await AdminAPI.updateOrderStatus(id, newStatus, notes || undefined);
    if (response.success) {
      showToast('Status pesanan berhasil diperbarui', 'success');
      closeModal();
      loadOrders();
    }
  } catch (error) {
    console.error('Failed to update order status:', error);
    showToast('Gagal memperbarui status', 'error');
  }
}

// ── Delete Order ──────────────────────────────────────────────────
async function deleteOrder(id) {
  if (!confirm('Yakin ingin menghapus pesanan ini? Tindakan ini tidak bisa dibatalkan.')) return;

  try {
    const response = await AdminAPI.deleteOrder(id);
    if (response.success) {
      showToast('Pesanan berhasil dihapus', 'success');
      loadOrders();
    }
  } catch (error) {
    console.error('Failed to delete order:', error);
    showToast('Gagal menghapus pesanan', 'error');
  }
}

// ── Export CSV ────────────────────────────────────────────────────
function exportCSV() {
  const headers = ['ID', 'Nama', 'Email', 'WhatsApp', 'Layanan', 'Paket', 'Harga', 'Metode', 'Status', 'Tanggal'];
  const rows = allOrders.map(o => [
    o.id,
    o.customerName,
    o.customerEmail,
    o.customerWhatsapp,
    o.serviceType,
    o.package || '',
    o.price,
    o.paymentMethod,
    o.status,
    new Date(o.createdAt).toISOString().split('T')[0],
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = `pesanan-cvpro-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ── Helpers ───────────────────────────────────────────────────────
function closeModal() {
  document.getElementById('orderModal').classList.remove('show');
}

function formatCurrency(v) {
  return 'Rp ' + (v || 0).toLocaleString('id-ID');
}

function formatDate(ds) {
  return new Date(ds).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusLabel(status) {
  const map = { pending: 'Pending', paid: 'Dibayar', processing: 'Diproses', completed: 'Selesai', cancelled: 'Dibatalkan' };
  return map[status] || status;
}

function escHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function debounce(fn, ms) {
  let t;
  return function (...args) { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
  toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3500);
}
