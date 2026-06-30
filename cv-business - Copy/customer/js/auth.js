/**
 * CVPro Studio — Customer Auth Guard
 * Include this on protected customer pages (dashboard, orders, profile).
 * Redirects to login if no valid session exists.
 * Also blocks customers from accessing /admin or /staff paths.
 */
(function () {
  'use strict';

  // Block customers from admin paths
  if (window.location.pathname.startsWith('/admin')) {
    window.location.replace('/customer/login.html');
    return;
  }

  const token    = localStorage.getItem('customerToken');
  const rawData  = localStorage.getItem('customerData');

  if (!token || !rawData) {
    window.location.replace('/customer/login.html');
    return;
  }

  // Expose parsed customer data globally for pages to use
  try {
    window._customer = JSON.parse(rawData);
  } catch (e) {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerData');
    window.location.replace('/customer/login.html');
  }
})();
