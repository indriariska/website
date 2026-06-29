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

  loadSettings();

  // Store settings
  document.getElementById('saveStoreSettingsBtn').addEventListener('click', saveStoreSettings);
  
  // Account settings
  document.getElementById('saveAccountSettingsBtn').addEventListener('click', saveAccountSettings);
  
  // Logo preview
  document.getElementById('storeLogo').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        document.getElementById('logoPreview').innerHTML = `<img src="${e.target.result}" alt="Logo Preview">`;
      };
      reader.readAsDataURL(file);
    }
  });
});

async function loadSettings() {
  try {
    // Load store settings
    const response = await AdminAPI.getSettings();
    
    if (response.success) {
      const settings = response.data;
      document.getElementById('storeName').value = settings.storeName || '';
      document.getElementById('storePhone').value = settings.phone || '';
      document.getElementById('storeAddress').value = settings.address || '';
      
      if (settings.logo) {
        document.getElementById('logoPreview').innerHTML = `<img src="${settings.logo}" alt="Current Logo">`;
      }
    }
    
    // Load account info
    const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
    document.getElementById('currentName').value = user.name || '';
    document.getElementById('currentEmail').value = user.email || '';
  } catch (error) {
    console.error('Failed to load settings:', error);
    showToast('Failed to load settings', 'error');
  }
}

async function saveStoreSettings() {
  const storeName = document.getElementById('storeName').value;
  const phone = document.getElementById('storePhone').value;
  const address = document.getElementById('storeAddress').value;
  const logoFile = document.getElementById('storeLogo').files[0];

  if (!storeName) {
    showToast('Store name is required', 'error');
    return;
  }

  const settingsData = {
    storeName,
    phone,
    address,
  };

  try {
    let response;
    if (logoFile) {
      const formData = new FormData();
      Object.keys(settingsData).forEach(key => {
        formData.append(key, settingsData[key]);
      });
      formData.append('logo', logoFile);
      response = await AdminAPI.upload('/settings', formData);
    } else {
      response = await AdminAPI.updateSettings(settingsData);
    }

    if (response.success) {
      showToast('Store settings saved successfully', 'success');
      loadSettings();
    }
  } catch (error) {
    console.error('Failed to save store settings:', error);
    showToast('Failed to save store settings', 'error');
  }
}

async function saveAccountSettings() {
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (newPassword && newPassword !== confirmPassword) {
    showToast('Passwords do not match', 'error');
    return;
  }

  if (newPassword && newPassword.length < 6) {
    showToast('Password must be at least 6 characters', 'error');
    return;
  }

  if (!newPassword) {
    showToast('Please enter a new password or leave blank to keep current', 'warning');
    return;
  }

  try {
    // Note: This would require a backend endpoint to update password
    // For now, we'll show a message
    showToast('Password update requires backend endpoint', 'warning');
  } catch (error) {
    console.error('Failed to update password:', error);
    showToast('Failed to update password', 'error');
  }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
  
  toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
  toast.className = `toast ${type}`;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
