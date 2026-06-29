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

  // Update status filter options to match new statuses
  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) {
    statusFilter.innerHTML = `
      <option value="">Semua Status</option>
      <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
      <option value="diproses">Diproses</option>
      <option value="selesai">Selesai</option>
      <option value="ditolak">Ditolak</option>
    `;
  }
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
        <small style="color:#6b7280">${escHtml(order.customerWhatsapp)}</small><br>
        <small style="color:#9ca3af">${escHtml(order.customerEmail)}</small>
      </td>
      <td>
        ${escHtml(order.serviceType)}<br>
        ${order.package ? `<small style="color:#6b7280">${escHtml(order.package)}</small>` : ''}
      </td>
      <td>${formatCurrency(order.price)}</td>
      <td>${escHtml(order.paymentMethod)}</td>
      <td><span class="status-badge ${order.status}">${statusLabel(order.status)}</span></td>
      <td>${formatDate(order.createdAt)}</td>
      <td>
        <button class="btn-action" onclick="viewOrder('${order.id}')" title="Lihat Detail">
          <i class="fas fa-eye"></i>
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

    // Build proof image HTML
    let proofHtml = '<em style="color:#9ca3af">Belum ada bukti pembayaran</em>';
    if (o.proofImageUrl) {
      const imgSrc = o.proofImageUrl.startsWith('http')
        ? o.proofImageUrl
        : 'http://localhost:3000' + o.proofImageUrl;
      proofHtml = `
        <a href="${escHtml(imgSrc)}" target="_blank">
          <img src="${escHtml(imgSrc)}" alt="Bukti Pembayaran"
               style="max-width:100%;border-radius:8px;margin-top:6px;border:1px solid #e5e7eb;cursor:pointer"
               title="Klik untuk lihat penuh">
        </a>
        <p style="font-size:0.8rem;color:#6b7280;margin-top:4px">
          <i class="fas fa-external-link-alt"></i> Klik gambar untuk memperbesar
        </p>`;
    }

    document.getElementById('orderModalBody').innerHTML = `
      <div class="order-detail">

        <div class="detail-section">
          <h3>Informasi Pelanggan</h3>
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
          <h3>Informasi Layanan</h3>
          <div class="detail-grid">
            <div><label>Order ID</label><span><code>${o.id}</code></span></div>
            <div><label>Layanan</label><span>${escHtml(o.serviceType)}</span></div>
            <div><label>Paket</label><span>${escHtml(o.package || '–')}</span></div>
            <div><label>Harga</label><span>${formatCurrency(o.price)}</span></div>
            <div><label>Metode Bayar</label><span>${escHtml(o.paymentMethod)}</span></div>
            <div><label>Status</label><span class="status-badge ${o.status}">${statusLabel(o.status)}</span></div>
            <div><label>Tanggal Pesan</label><span>${formatDate(o.createdAt)}</span></div>
            ${o.completedAt ? `<div><label>Tanggal Selesai</label><span>${formatDate(o.completedAt)}</span></div>` : ''}
          </div>
        </div>

        ${(o.message) ? `
        <div class="detail-section">
          <h3>Pesan dari Pelanggan</h3>
          <p style="white-space:pre-wrap;font-size:0.9rem;color:#374151;background:#f9fafb;padding:12px;border-radius:8px">${escHtml(o.message)}</p>
        </div>` : ''}

        ${(o.adminNotes) ? `
        <div class="detail-section">
          <h3>Catatan Admin</h3>
          <p style="white-space:pre-wrap;font-size:0.9rem;color:#374151">${escHtml(o.adminNotes)}</p>
        </div>` : ''}

        <div class="detail-section">
          <h3>Bukti Pembayaran</h3>
          ${proofHtml}
        </div>

        <div class="modal-actions" style="display:flex;flex-wrap:wrap;gap:10px;margin-top:20px">
          <button class="btn-primary" onclick="setOrderStatus('${o.id}', 'menunggu_verifikasi')" style="background:#f59e0b;border-color:#f59e0b">
            <i class="fas fa-hourglass-half"></i> Verifikasi
          </button>
          <button class="btn-primary" onclick="setOrderStatus('${o.id}', 'diproses')" style="background:#3b82f6;border-color:#3b82f6">
            <i class="fas fa-cog"></i> Proses
          </button>
          <button class="btn-primary" onclick="setOrderStatus('${o.id}', 'selesai')" style="background:#10b981;border-color:#10b981">
            <i class="fas fa-check-circle"></i> Selesai
          </button>
          <button class="btn-primary" onclick="setOrderStatus('${o.id}', 'ditolak')" style="background:#ef4444;border-color:#ef4444">
            <i class="fas fa-times-circle"></i> Tolak
          </button>
          <a href="https://wa.me/${o.customerWhatsapp.replace(/\D/g,'')}" target="_blank" class="btn-secondary">
            <i class="fab fa-whatsapp"></i> Hubungi WA
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

// ── Set Status Directly (from modal buttons) ──────────────────────
async function setOrderStatus(id, newStatus) {
  const notes = newStatus === 'ditolak'
    ? prompt('Alasan penolakan (opsional):', '')
    : null;

  try {
    const response = await AdminAPI.updateOrderStatus(id, newStatus, notes || undefined);
    if (response.success) {
      showToast(`Status berhasil diubah ke: ${statusLabel(newStatus)}`, 'success');
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
    statusLabel(o.status),
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
  const map = {
    menunggu_verifikasi: 'Menunggu Verifikasi',
    diproses:            'Diproses',
    selesai:             'Selesai',
    ditolak:             'Ditolak',
    // Legacy fallbacks
    pending:     'Menunggu Verifikasi',
    paid:        'Diproses',
    processing:  'Diproses',
    completed:   'Selesai',
    cancelled:   'Ditolak',
  };
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
