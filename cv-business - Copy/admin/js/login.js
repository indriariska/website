document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');
  const loginBtn = document.getElementById('loginBtn');
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');

  // Check if already logged in
  const token = localStorage.getItem('adminToken');
  if (token) {
    window.location.href = '/admin/dashboard.html';
  }

  // Toggle password visibility
  togglePassword.addEventListener('click', function () {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    const icon = this.querySelector('i');
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
  });

  // Handle login form submission
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Validate inputs
    if (!email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    // Show loading state
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Logging in...</span>';

    try {
      const response = await AdminAPI.login(email, password);

      if (response.success) {
        // Store token and user data
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('adminUser', JSON.stringify(response.data.user));

        showToast('Login successful! Redirecting...', 'success');

        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = '/admin/dashboard.html';
        }, 1000);
      } else {
        showToast(response.message || 'Login failed', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast(error.message || 'Login failed. Please try again.', 'error');
    } finally {
      // Reset button state
      loginBtn.disabled = false;
      loginBtn.innerHTML = '<span>Login</span> <i class="fas fa-arrow-right"></i>';
    }
  });

  // Toast notification function
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
});
