/**
 * CVPro Studio — Admin Orders Page
 * Full status set + download file upload + revision display.
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

  document.getElementById('searchInput').addEventListener('input',  debounce(filterAndRenderOrders, 300));
  document.getElementById('statusFilter').addEventListener('change', filterAndRenderOrders);
  document.getElementById('dateFrom').addEventListener('change',    filterAndRenderOrders);
  document.getElementById('dateTo').addEventListener('change',      filterAndRenderOrders);
  document.getElementById('exportBtn').addEventListener('click', exportCSV);

  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('orderModal').addEventListener('click', function (e) {
    if (e.target === this) closeModal();
  });

  // Populate status filter with full status set
  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) {
    statusFilter.innerHTML = `
      <option value="">Semua Status</option>
      <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
      <option value="verifikasi_pembayaran">Verifikasi Pembayaran</option>
      <option value="pembayaran_terverifikasi">Pembayaran Terverifikasi</option>
      <option value="antrian">Antrian</option>
      <option value="diproses">Diproses</option>
      <option value="revisi">Revisi</option>
      <option value="selesai">Selesai</option>
      <option value="dibatalkan">Dibatalkan</option>
      <option value="ditolak">Ditolak</option>
    `;
  }
});

let allOrders = [];

// ── Load ──────────────────────────────────────────────────────────
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
      <td>
        <span class="status-badge ${order.status}">${statusLabel(order.status)}</span>
        ${order.revisionNote ? '<br><small style="color:#f59e0b;font-size:11px"><i class="fas fa-edit"></i> Ada Revisi</small>' : ''}
      </td>
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

    let proofHtml = '<em style="color:#9ca3af">Belum ada bukti pembayaran</em>';
    if (o.proofImageUrl) {
      const imgSrc = o.proofImageUrl.startsWith('http') ? o.proofImageUrl : 'http://localhost:3000' + o.proofImageUrl;
      proofHtml = `
        <a href="${escHtml(imgSrc)}" target="_blank">
          <img src="${escHtml(imgSrc)}" alt="Bukti Pembayaran"
               style="max-width:100%;border-radius:8px;margin-top:6px;border:1px solid #e5e7eb;cursor:pointer"
               title="Klik untuk lihat penuh">
        </a>
        <p style="font-size:0.8rem;color:#6b7280;margin-top:4px"><i class="fas fa-external-link-alt"></i> Klik untuk memperbesar</p>`;
    }

    // Parse downloadFiles JSON if present
    let downloadFilesHtml = '';
    if (o.downloadFiles) {
      try {
        const files = JSON.parse(o.downloadFiles);
        if (Array.isArray(files) && files.length > 0) {
          downloadFilesHtml = '<div style="margin-top:8px">' +
            files.map(f => {
              const src = f.url.startsWith('http') ? f.url : 'http://localhost:3000' + f.url;
              return `<a href="${escHtml(src)}" target="_blank" class="btn-secondary" style="margin-right:6px;margin-bottom:6px;display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:8px;font-size:0.82rem">
                <i class="fas fa-download"></i> ${escHtml(f.label || 'Download')}
              </a>`;
            }).join('') + '</div>';
        }
      } catch(_) {}
    }
    if (!downloadFilesHtml && o.downloadUrl) {
      const src = o.downloadUrl.startsWith('http') ? o.downloadUrl : 'http://localhost:3000' + o.downloadUrl;
      downloadFilesHtml = `<a href="${escHtml(src)}" target="_blank" class="btn-secondary" style="margin-top:8px;display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:8px;font-size:0.82rem">
        <i class="fas fa-download"></i> Download Hasil
      </a>`;
    }

    // Revision from customer
    let revisionHtml = '';
    if (o.revisionNote) {
      const revFileSrc = o.revisionFileUrl
        ? `<a href="${o.revisionFileUrl.startsWith('http') ? o.revisionFileUrl : 'http://localhost:3000' + o.revisionFileUrl}" target="_blank" style="color:#7c3aed;font-size:0.82rem"><i class="fas fa-paperclip"></i> Lihat File Revisi</a>`
        : '';
      revisionHtml = `
        <div class="detail-section" style="border-left:3px solid #f59e0b;padding-left:12px">
          <h3 style="color:#d97706"><i class="fas fa-edit"></i> Permintaan Revisi dari Pelanggan</h3>
          <p style="white-space:pre-wrap;font-size:0.9rem;color:#374151;background:#fffbeb;padding:12px;border-radius:8px;margin-top:8px">${escHtml(o.revisionNote)}</p>
          ${revFileSrc}
        </div>`;
    }

    document.getElementById('orderModalBody').innerHTML = `
      <div class="order-detail">

        <div class="detail-section">
          <h3>Informasi Pelanggan</h3>
          <div class="detail-grid">
            <div><label>Nama</label><span>${escHtml(o.customerName)}</span></div>
            <div><label>Email</label><span>${escHtml(o.customerEmail)}</span></div>
            <div><label>WhatsApp</label>
              <span><a href="https://wa.me/${escHtml(o.customerWhatsapp.replace(/\D/g,''))}" target="_blank">${escHtml(o.customerWhatsapp)}</a></span>
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

        ${o.message ? `
        <div class="detail-section">
          <h3>Pesan dari Pelanggan</h3>
          <p style="white-space:pre-wrap;font-size:0.9rem;color:#374151;background:#f9fafb;padding:12px;border-radius:8px">${escHtml(o.message)}</p>
        </div>` : ''}

        ${revisionHtml}

        ${o.adminNotes ? `
        <div class="detail-section">
          <h3>Catatan Admin</h3>
          <p style="white-space:pre-wrap;font-size:0.9rem;color:#374151">${escHtml(o.adminNotes)}</p>
        </div>` : ''}

        <div class="detail-section">
          <h3>Bukti Pembayaran</h3>
          ${proofHtml}
        </div>

        ${downloadFilesHtml ? `
        <div class="detail-section">
          <h3>File Hasil (Customer Download)</h3>
          ${downloadFilesHtml}
        </div>` : ''}

        <!-- ── Status Buttons ── -->
        <div class="detail-section">
          <h3>Ubah Status</h3>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">
            <button class="btn-primary" onclick="setOrderStatus('${o.id}','menunggu_verifikasi')" style="background:#f59e0b;border-color:#f59e0b;font-size:0.82rem;padding:7px 12px">
              <i class="fas fa-hourglass-half"></i> Menunggu Verifikasi
            </button>
            <button class="btn-primary" onclick="setOrderStatus('${o.id}','verifikasi_pembayaran')" style="background:#8b5cf6;border-color:#8b5cf6;font-size:0.82rem;padding:7px 12px">
              <i class="fas fa-search-dollar"></i> Verifikasi Pembayaran
            </button>
            <button class="btn-primary" onclick="setOrderStatus('${o.id}','pembayaran_terverifikasi')" style="background:#0ea5e9;border-color:#0ea5e9;font-size:0.82rem;padding:7px 12px">
              <i class="fas fa-check-double"></i> Pembayaran Terverifikasi
            </button>
            <button class="btn-primary" onclick="setOrderStatus('${o.id}','antrian')" style="background:#6366f1;border-color:#6366f1;font-size:0.82rem;padding:7px 12px">
              <i class="fas fa-list-ol"></i> Antrian
            </button>
            <button class="btn-primary" onclick="setOrderStatus('${o.id}','diproses')" style="background:#3b82f6;border-color:#3b82f6;font-size:0.82rem;padding:7px 12px">
              <i class="fas fa-cog"></i> Diproses
            </button>
            <button class="btn-primary" onclick="setOrderStatus('${o.id}','revisi')" style="background:#f97316;border-color:#f97316;font-size:0.82rem;padding:7px 12px">
              <i class="fas fa-edit"></i> Revisi
            </button>
            <button class="btn-primary" onclick="setOrderStatus('${o.id}','selesai')" style="background:#10b981;border-color:#10b981;font-size:0.82rem;padding:7px 12px">
              <i class="fas fa-check-circle"></i> Selesai
            </button>
            <button class="btn-primary" onclick="setOrderStatus('${o.id}','dibatalkan')" style="background:#9ca3af;border-color:#9ca3af;font-size:0.82rem;padding:7px 12px">
              <i class="fas fa-ban"></i> Dibatalkan
            </button>
            <button class="btn-primary" onclick="setOrderStatus('${o.id}','ditolak')" style="background:#ef4444;border-color:#ef4444;font-size:0.82rem;padding:7px 12px">
              <i class="fas fa-times-circle"></i> Ditolak
            </button>
          </div>
        </div>

        <!-- ── Upload Download Files ── -->
        <div class="detail-section" id="uploadFilesSection_${o.id}">
          <h3><i class="fas fa-upload"></i> Upload File Hasil untuk Pelanggan</h3>
          <p style="font-size:0.82rem;color:#6b7280;margin-bottom:10px">
            Upload file CV, Portofolio, atau Cover Letter. Pelanggan bisa download setelah status <strong>Selesai</strong>.
          </p>
          <div style="display:flex;flex-direction:column;gap:10px">

            <div style="background:#f9fafb;border:1.5px dashed #c4b5fd;border-radius:10px;padding:14px 16px">
              <p style="font-size:0.8rem;font-weight:600;color:#7c3aed;margin-bottom:10px"><i class="fas fa-file-upload"></i> Upload File Langsung</p>
              <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
                <input type="text" id="fileLabelInput_${o.id}" placeholder="Label (cth: CV PDF, Cover Letter)"
                  style="flex:1;min-width:140px;padding:8px 12px;border:1px solid #e5e7eb;border-radius:8px;font-family:inherit;font-size:0.85rem;outline:none">
                <input type="file" id="filePickerInput_${o.id}" accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.png,.jpg,.jpeg"
                  style="flex:2;min-width:180px;font-size:0.83rem;font-family:inherit">
                <button onclick="uploadAndAddFile('${o.id}')" class="btn-primary" style="font-size:0.82rem;padding:8px 14px" id="uploadFileBtn_${o.id}">
                  <i class="fas fa-upload"></i> Upload & Tambah
                </button>
              </div>
              <p style="font-size:0.75rem;color:#9ca3af;margin-top:6px">PDF, DOCX, ZIP, PNG, JPG — maks. 50MB</p>
            </div>

            <div style="position:relative;text-align:center;color:#9ca3af;font-size:0.78rem;padding:4px 0">
              <span style="background:#fff;padding:0 10px">atau tempel URL manual</span>
              <hr style="position:absolute;top:50%;left:0;right:0;border:none;border-top:1px solid #e5e7eb;z-index:-1">
            </div>

            <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
              <input type="text" id="fileUrlInput_${o.id}" placeholder="URL file (misal: /uploads/file.pdf)"
                style="flex:2;min-width:200px;padding:8px 12px;border:1px solid #e5e7eb;border-radius:8px;font-family:inherit;font-size:0.85rem;outline:none">
              <button onclick="addDownloadFile('${o.id}')" class="btn-secondary" style="font-size:0.82rem;padding:8px 14px">
                <i class="fas fa-plus"></i> Tambah URL
              </button>
            </div>

            <div id="downloadFilesList_${o.id}" style="font-size:0.82rem;color:#6b7280">
              ${buildDownloadFilesList(o)}
            </div>
            <button onclick="saveDownloadFiles('${o.id}')" class="btn-primary" style="font-size:0.82rem;padding:8px 16px;align-self:flex-start" id="saveFilesBtn_${o.id}">
              <i class="fas fa-save"></i> Simpan File & Set Selesai
            </button>
          </div>
        </div>

        <div style="display:flex;gap:10px;margin-top:16px">
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

// ── Download files list builder (existing files already on order) ─
function buildDownloadFilesList(order) {
  const files = [];
  if (order.downloadFiles) {
    try {
      const parsed = JSON.parse(order.downloadFiles);
      if (Array.isArray(parsed)) files.push(...parsed);
    } catch(_) {}
  }
  if (order.downloadUrl && files.length === 0) {
    files.push({ label: 'File Hasil', url: order.downloadUrl });
  }
  if (files.length === 0) return '<em style="color:#9ca3af">Belum ada file</em>';
  return files.map((f, i) => {
    const src = f.url.startsWith('http') ? f.url : 'http://localhost:3000' + f.url;
    return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;
        background:#f5f3ff;padding:7px 10px;border-radius:8px">
      <i class="fas fa-file-alt" style="color:#7c3aed;flex-shrink:0"></i>
      <span style="flex:1;word-break:break-all">${escHtml(f.label || f.url)}</span>
      <a href="${escHtml(src)}" target="_blank"
         style="color:#7c3aed;font-size:0.78rem;text-decoration:none;flex-shrink:0" title="Preview">
        <i class="fas fa-external-link-alt"></i>
      </a>
    </div>`;
  }).join('');
}

// ── Manage pending download files (in-memory before save) ─────────
let _pendingFiles = [];
let _pendingOrderId = null;

window.addDownloadFile = function(orderId) {
  if (_pendingOrderId !== orderId) { _pendingFiles = []; _pendingOrderId = orderId; }
  const label = document.getElementById(`fileLabelInput_${orderId}`)?.value.trim();
  const url   = document.getElementById(`fileUrlInput_${orderId}`)?.value.trim();
  if (!url) { showToast('URL file wajib diisi', 'error'); return; }
  _pendingFiles.push({ label: label || url, url });
  if (document.getElementById(`fileLabelInput_${orderId}`))
    document.getElementById(`fileLabelInput_${orderId}`).value = '';
  if (document.getElementById(`fileUrlInput_${orderId}`))
    document.getElementById(`fileUrlInput_${orderId}`).value   = '';
  refreshPendingList(orderId);
  showToast('File ditambahkan', 'success');
};

window.removeDownloadFile = function(idx) {
  _pendingFiles.splice(idx, 1);
  // Re-render list after removal (use current orderId)
  if (_pendingOrderId) refreshPendingList(_pendingOrderId);
};

// ── Refresh the in-UI pending files list ──────────────────────────
function refreshPendingList(orderId) {
  const listEl = document.getElementById(`downloadFilesList_${orderId}`);
  if (!listEl) return;
  if (_pendingFiles.length === 0) {
    listEl.innerHTML = '<em style="color:#9ca3af">Belum ada file ditambahkan</em>';
    return;
  }
  listEl.innerHTML = _pendingFiles.map((f, i) =>
    `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;
       background:#f5f3ff;padding:7px 10px;border-radius:8px">
      <i class="fas fa-file-alt" style="color:#7c3aed;flex-shrink:0"></i>
      <span style="flex:1;word-break:break-all">${escHtml(f.label)}</span>
      <a href="${escHtml(f.url.startsWith('http') ? f.url : 'http://localhost:3000' + f.url)}"
         target="_blank" style="color:#7c3aed;font-size:0.78rem;text-decoration:none;flex-shrink:0"
         title="Preview">
        <i class="fas fa-external-link-alt"></i>
      </a>
      <button onclick="window.removeDownloadFile(${i})"
        style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:0.85rem;flex-shrink:0"
        title="Hapus"><i class="fas fa-times"></i></button>
    </div>`
  ).join('');
}

// ── Upload file to server then add to pending list ────────────────
window.uploadAndAddFile = async function(orderId) {
  if (_pendingOrderId !== orderId) { _pendingFiles = []; _pendingOrderId = orderId; }

  const filePicker = document.getElementById(`filePickerInput_${orderId}`);
  const labelInput = document.getElementById(`fileLabelInput_${orderId}`);
  const uploadBtn  = document.getElementById(`uploadFileBtn_${orderId}`);

  if (!filePicker || !filePicker.files || filePicker.files.length === 0) {
    showToast('Pilih file terlebih dahulu', 'error');
    return;
  }

  const file  = filePicker.files[0];
  const label = (labelInput?.value.trim()) || file.name;

  // Disable button while uploading
  if (uploadBtn) {
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengupload...';
  }

  try {
    const res = await AdminAPI.uploadDeliveryFile(orderId, file);

    if (!res.success) throw new Error(res.message || 'Upload gagal');

    // Add to pending list
    _pendingFiles.push({ label, url: res.data.fileUrl });

    // Clear inputs
    filePicker.value = '';
    if (labelInput) labelInput.value = '';

    refreshPendingList(orderId);
    showToast(`File "${label}" berhasil diupload`, 'success');
  } catch (err) {
    console.error('uploadAndAddFile error:', err);
    showToast('Upload gagal: ' + err.message, 'error');
  } finally {
    if (uploadBtn) {
      uploadBtn.disabled = false;
      uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload & Tambah';
    }
  }
};

window.saveDownloadFiles = async function(orderId) {
  if (_pendingOrderId !== orderId) _pendingFiles = [];
  if (_pendingFiles.length === 0) { showToast('Tambahkan minimal 1 file terlebih dahulu', 'error'); return; }

  if (!orderId || orderId === 'undefined' || orderId === 'null') {
    showToast('ID pesanan tidak valid', 'error');
    return;
  }

  const saveBtn = document.getElementById(`saveFilesBtn_${orderId}`);
  if (saveBtn) { saveBtn.disabled = true; saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...'; }

  try {
    // Single PUT /orders/:id/status call — staffOrAdmin accessible.
    // Controller handles downloadFiles, downloadUrl, completedAt in one shot.
    const res = await AdminAPI.updateOrderStatus(orderId, 'selesai', undefined, {
      downloadFiles: JSON.stringify(_pendingFiles),
      downloadUrl:   _pendingFiles[0]?.url || null,
    });

    if (res.success) {
      showToast(`${_pendingFiles.length} file disimpan — status diubah ke Selesai`, 'success');
      _pendingFiles    = [];
      _pendingOrderId  = null;
      closeModal();
      loadOrders();
    } else {
      throw new Error(res.message || 'Gagal menyimpan');
    }
  } catch (err) {
    console.error('saveDownloadFiles error:', err);
    showToast('Gagal menyimpan: ' + err.message, 'error');
    if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = '<i class="fas fa-save"></i> Simpan File & Set Selesai'; }
  }
};

// ── Set Status ────────────────────────────────────────────────────
async function setOrderStatus(id, newStatus) {
  let notes = undefined;
  if (newStatus === 'ditolak' || newStatus === 'dibatalkan') {
    notes = prompt(`Alasan ${statusLabel(newStatus)} (opsional):`, '') || undefined;
  }

  try {
    const response = await AdminAPI.updateOrderStatus(id, newStatus, notes);
    if (response.success) {
      showToast(`Status → ${statusLabel(newStatus)}`, 'success');
      closeModal();
      loadOrders();
    }
  } catch (error) {
    showToast('Gagal: ' + error.message, 'error');
  }
}

// ── Delete ────────────────────────────────────────────────────────
async function deleteOrder(id) {
  if (!confirm('Yakin hapus pesanan ini?')) return;
  try {
    const response = await AdminAPI.deleteOrder(id);
    if (response.success) { showToast('Pesanan dihapus', 'success'); loadOrders(); }
  } catch (error) { showToast('Gagal hapus', 'error'); }
}

// ── Export CSV ────────────────────────────────────────────────────
function exportCSV() {
  const headers = ['ID','Nama','Email','WA','Layanan','Paket','Harga','Metode','Status','Tanggal'];
  const rows = allOrders.map(o => [
    o.id, o.customerName, o.customerEmail, o.customerWhatsapp,
    o.serviceType, o.package||'', o.price, o.paymentMethod,
    statusLabel(o.status), new Date(o.createdAt).toISOString().split('T')[0],
  ]);
  const csv = [headers,...rows].map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF'+csv], {type:'text/csv;charset=utf-8;'});
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `pesanan-cvpro-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ── Helpers ───────────────────────────────────────────────────────
function closeModal() { document.getElementById('orderModal').classList.remove('show'); }

function formatCurrency(v) { return 'Rp ' + (v||0).toLocaleString('id-ID'); }

function formatDate(ds) {
  return new Date(ds).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'});
}

function statusLabel(status) {
  const map = {
    menunggu_verifikasi:       'Menunggu Verifikasi',
    verifikasi_pembayaran:     'Verifikasi Pembayaran',
    pembayaran_terverifikasi:  'Pembayaran Terverifikasi',
    antrian:                   'Antrian',
    diproses:                  'Diproses',
    revisi:                    'Revisi',
    selesai:                   'Selesai',
    dibatalkan:                'Dibatalkan',
    ditolak:                   'Ditolak',
    // legacy
    pending: 'Menunggu Verifikasi', paid: 'Pembayaran Terverifikasi',
    processing: 'Diproses', completed: 'Selesai', cancelled: 'Dibatalkan',
  };
  return map[status] || status;
}

function escHtml(str) {
  return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function debounce(fn, ms) {
  let t;
  return function(...args){ clearTimeout(t); t=setTimeout(()=>fn(...args), ms); };
}

function showToast(message, type='success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  const icon = type==='success' ? 'fa-check-circle' : 'fa-exclamation-circle';
  toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
  toast.className = `toast ${type} show`;
  setTimeout(()=>toast.classList.remove('show'), 3500);
}
