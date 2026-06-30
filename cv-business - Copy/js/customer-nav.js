/**
 * CVPro Studio — Customer Navbar Injector
 * Appends Login/Register or Dashboard/My Orders/Logout
 * to the existing website navbar without modifying any HTML.
 *
 * Include this script at the BOTTOM of every existing page
 * (just before </body>) alongside the existing script.js.
 */
(function () {
  'use strict';

  var isLoggedIn = !!localStorage.getItem('customerToken');
  var custRaw    = localStorage.getItem('customerData');
  var customer   = null;

  try { customer = custRaw ? JSON.parse(custRaw) : null; } catch (_) {}

  /* ── Inject into DESKTOP nav (.nav-links ul) ── */
  function injectDesktopNav() {
    var navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    // Remove any previously injected items (safe re-run)
    navLinks.querySelectorAll('[data-cust-nav]').forEach(function (el) { el.remove(); });

    if (isLoggedIn && customer) {
      // Dashboard + My Orders + Logout
      var items = [
        { href: '/customer/dashboard.html', icon: 'fas fa-th-large', label: 'Dashboard' },
        { href: '/customer/orders.html',    icon: 'fas fa-shopping-bag', label: 'Pesanan Saya' },
        { href: '/customer/profile.html',   icon: 'fas fa-user', label: customer.name ? customer.name.split(' ')[0] : 'Profil' },
      ];

      items.forEach(function (item) {
        var li = document.createElement('li');
        li.setAttribute('data-cust-nav', '1');
        li.innerHTML = '<a href="' + item.href + '" class="nav-link">' +
          '<i class="' + item.icon + '" style="margin-right:5px;font-size:0.85em"></i>' + item.label + '</a>';
        navLinks.appendChild(li);
      });

      // Logout button
      var logoutLi = document.createElement('li');
      logoutLi.setAttribute('data-cust-nav', '1');
      logoutLi.innerHTML = '<a href="#" class="nav-link" id="custNavLogout" style="color:#f87171">' +
        '<i class="fas fa-sign-out-alt" style="margin-right:5px;font-size:0.85em"></i>Logout</a>';
      navLinks.appendChild(logoutLi);

      document.getElementById('custNavLogout').addEventListener('click', function (e) {
        e.preventDefault();
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerData');
        window.location.reload();
      });

    } else {
      // Login + Register
      var loginLi = document.createElement('li');
      loginLi.setAttribute('data-cust-nav', '1');
      loginLi.innerHTML = '<a href="/customer/login.html" class="nav-link">' +
        '<i class="fas fa-sign-in-alt" style="margin-right:5px;font-size:0.85em"></i>Login</a>';
      navLinks.appendChild(loginLi);

      var registerLi = document.createElement('li');
      registerLi.setAttribute('data-cust-nav', '1');
      registerLi.innerHTML = '<a href="/customer/register.html" class="nav-link nav-cta">' +
        '<i class="fas fa-user-plus" style="margin-right:5px;font-size:0.85em"></i>Daftar</a>';
      navLinks.appendChild(registerLi);
    }
  }

  /* ── Inject into MOBILE nav (.mobile-nav) ── */
  function injectMobileNav() {
    var mobileNav = document.querySelector('.mobile-nav');
    if (!mobileNav) return;

    mobileNav.querySelectorAll('[data-cust-nav]').forEach(function (el) { el.remove(); });

    var divider = document.createElement('hr');
    divider.setAttribute('data-cust-nav', '1');
    divider.style.cssText = 'border:none;border-top:1px solid rgba(255,255,255,0.15);margin:8px 0';
    mobileNav.appendChild(divider);

    if (isLoggedIn && customer) {
      var mobileItems = [
        { href: '/customer/dashboard.html', icon: 'fas fa-th-large', label: 'Dashboard' },
        { href: '/customer/orders.html',    icon: 'fas fa-shopping-bag', label: 'Pesanan Saya' },
        { href: '/customer/profile.html',   icon: 'fas fa-user', label: 'Profil Saya' },
      ];

      mobileItems.forEach(function (item) {
        var a = document.createElement('a');
        a.setAttribute('data-cust-nav', '1');
        a.href = item.href;
        a.className = 'nav-link';
        a.innerHTML = '<i class="' + item.icon + '" style="margin-right:8px"></i>' + item.label;
        mobileNav.appendChild(a);
      });

      var logoutA = document.createElement('a');
      logoutA.setAttribute('data-cust-nav', '1');
      logoutA.href = '#';
      logoutA.className = 'nav-link';
      logoutA.style.color = '#f87171';
      logoutA.innerHTML = '<i class="fas fa-sign-out-alt" style="margin-right:8px"></i>Logout';
      logoutA.addEventListener('click', function (e) {
        e.preventDefault();
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerData');
        window.location.reload();
      });
      mobileNav.appendChild(logoutA);

    } else {
      var loginA = document.createElement('a');
      loginA.setAttribute('data-cust-nav', '1');
      loginA.href = '/customer/login.html';
      loginA.className = 'nav-link';
      loginA.innerHTML = '<i class="fas fa-sign-in-alt" style="margin-right:8px"></i>Login';
      mobileNav.appendChild(loginA);

      var regA = document.createElement('a');
      regA.setAttribute('data-cust-nav', '1');
      regA.href = '/customer/register.html';
      regA.className = 'btn-primary';
      regA.style.marginTop = '8px';
      regA.innerHTML = '<i class="fas fa-user-plus" style="margin-right:8px"></i>Daftar';
      mobileNav.appendChild(regA);
    }
  }

  /* ── Run after DOM is ready ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      injectDesktopNav();
      injectMobileNav();
    });
  } else {
    injectDesktopNav();
    injectMobileNav();
  }

})();
