// Auth check for admin pages
(function() {
  'use strict';

  const token = localStorage.getItem('adminToken');
  const currentPath = window.location.pathname;
  
  // Public admin pages (no auth required)
  const publicPages = ['/admin/login.html', '/admin/'];
  
  // If not authenticated and trying to access protected page
  if (!token && !publicPages.includes(currentPath)) {
    window.location.href = '/admin/login.html';
    return;
  }

  // If authenticated and trying to access login page
  if (token && currentPath === '/admin/login.html') {
    window.location.href = '/admin/dashboard.html';
    return;
  }

  // Set up periodic token validation
  if (token) {
    // Check token validity every 5 minutes
    setInterval(async function() {
      try {
        await AdminAPI.getProfile();
      } catch (error) {
        // Token invalid, redirect to login
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/login.html';
      }
    }, 5 * 60 * 1000);
  }
})();
