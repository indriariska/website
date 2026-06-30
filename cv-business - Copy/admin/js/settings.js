/**
 * CVPro Studio — Admin Settings Page
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

  loadSettings();

  document.getElementById('saveStoreSettingsBtn').addEventListener('click', saveStoreSettings);
  document.getElementById('saveAccountSettingsBtn').addEventListener('click', saveAccountSettings);

  // Logo preview
  const logoInput = document.getElementById('storeLogo');
  if (logoInput) {
    logoInput.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        document.getElementById('logoPreview').innerHTML = `<img src="${ev.target.result}" alt="Logo Preview" style="max-height:80px">`;
      };
      reader.readAsDataURL(file);
    });
  }
});

async function loadSettings() {
  try {
    const response = await AdminAPI.getSettings();
    if (!response.success) return;
    const s = response.data;

    setVal('storeName',    s.businessName);
    setVal('ownerName',    s.ownerName);
    setVal('storePhone',   s.phone);
    setVal('storeWhatsapp', s.whatsapp);
    setVal('storeEmail',   s.email);
    setVal('storeAddress', s.address);
    setVal('storeInstagram', s.instagram);

    if (s.logo) {
      document.getElementById('logoPreview').innerHTML =
        `<img src="${s.logo}" alt="Logo" style="max-height:80px">`;
    }

    // Load account info from localStorage
    const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
    setVal('currentName',  user.name);
    setVal('currentEmail', user.email);
  } catch (error) {
    console.error('Failed to load settings:', error);
    showToast('Gagal memuat pengaturan', 'error');
  }
}

function setVal(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value || '';
}

async function saveStoreSettings() {
  const businessName = document.getElementById('storeName').value;
  if (!businessName) { showToast('Nama bisnis wajib diisi', 'error'); return; }

  const data = {
    businessName,
    ownerName:  document.getElementById('ownerName').value,
    phone:      document.getElementById('storePhone').value,
    whatsapp:   document.getElementById('storeWhatsapp').value,
    email:      document.getElementById('storeEmail').value,
    address:    document.getElementById('storeAddress').value,
    instagram:  document.getElementById('storeInstagram').value,
  };

  const logoFile = document.getElementById('storeLogo').files[0];

  try {
    let response;
    if (logoFile) {
      const formData = new FormData();
      Object.keys(data).forEach(k => formData.append(k, data[k]));
      formData.append('logo', logoFile);
      response = await AdminAPI.uploadSettings(formData);
    } else {
      response = await AdminAPI.updateSettings(data);
    }

    if (response.success) {
      showToast('Pengaturan berhasil disimpan', 'success');
      loadSettings();
    }
  } catch (error) {
    console.error('Failed to save settings:', error);
    showToast('Gagal menyimpan pengaturan', 'error');
  }
}

async function saveAccountSettings() {
  const newPassword     = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (!newPassword) { showToast('Masukkan password baru', 'warning'); return; }
  if (newPassword.length < 6) { showToast('Password minimal 6 karakter', 'error'); return; }
  if (newPassword !== confirmPassword) { showToast('Password tidak cocok', 'error'); return; }

  try {
    const response = await AdminAPI.post('/auth/change-password', { newPassword });
    if (response.success) {
      showToast('Password berhasil diperbarui', 'success');
      document.getElementById('newPassword').value     = '';
      document.getElementById('confirmPassword').value = '';
    }
  } catch (error) {
    console.error('Failed to update password:', error);
    showToast('Gagal memperbarui password', 'error');
  }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle';
  toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3500);
}
