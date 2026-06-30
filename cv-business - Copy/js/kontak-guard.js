/**
 * CVPro Studio — Kontak Guard & Auto-fill
 * - Checks customer JWT on kontak.html (order form page)
 * - If NOT logged in: shows overlay → redirects to login
 * - If logged in: auto-fills nama, email, whatsapp from session
 *
 * Must be loaded AFTER js/api.js (for API.getSettings)
 * and AFTER js/customerApi.js (for CustomerAuth).
 */
(function () {
  'use strict';

  var LOGIN_URL    = '/customer/login.html';
  var REDIRECT_KEY = 'cvpro_after_login';

  /* ── CustomerAuth shim (in case customerApi.js not loaded on this page) ── */
  function isLoggedIn() {
    return !!localStorage.getItem('customerToken');
  }

  function getCustomerData() {
    try {
      return JSON.parse(localStorage.getItem('customerData') || 'null');
    } catch (_) {
      return null;
    }
  }

  /* ── Guard: block the form if not logged in ── */
  function runGuard() {
    if (isLoggedIn()) {
      /* Logged in — proceed, auto-fill will run after DOM ready */
      return;
    }

    /* Save current URL so login can redirect back */
    localStorage.setItem(REDIRECT_KEY, window.location.href);

    /* Show a blocking overlay instead of immediate redirect
       so the user sees a friendly message */
    function showLoginOverlay() {
      /* Inject keyframe once */
      if (!document.getElementById('guardStyles')) {
        var st = document.createElement('style');
        st.id = 'guardStyles';
        st.textContent = '@keyframes gFadeIn{from{opacity:0}to{opacity:1}}@keyframes gSlideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}';
        document.head.appendChild(st);
      }

      var overlay = document.createElement('div');
      overlay.style.cssText = [
        'position:fixed;inset:0;z-index:88888',
        'background:rgba(30,27,75,0.85);backdrop-filter:blur(6px)',
        'display:flex;align-items:center;justify-content:center;padding:20px',
        'animation:gFadeIn 0.3s ease',
        'font-family:Poppins,sans-serif',
      ].join(';');

      var card = document.createElement('div');
      card.style.cssText = [
        'background:#fff;border-radius:20px',
        'max-width:420px;width:100%;padding:40px 32px',
        'text-align:center',
        'box-shadow:0 24px 60px rgba(124,58,237,0.25)',
        'animation:gSlideUp 0.35s ease',
      ].join(';');

      var icon = document.createElement('div');
      icon.style.cssText = [
        'width:60px;height:60px;border-radius:16px',
        'background:linear-gradient(135deg,#7c3aed,#3b82f6)',
        'display:flex;align-items:center;justify-content:center',
        'margin:0 auto 18px;font-size:1.5rem;color:#fff',
      ].join(';');
      icon.innerHTML = '<i class="fas fa-lock"></i>';

      var heading = document.createElement('h3');
      heading.style.cssText = 'font-size:1.15rem;font-weight:800;color:#1e1b4b;margin-bottom:10px;';
      heading.textContent = 'Login Diperlukan';

      var msg = document.createElement('p');
      msg.style.cssText = 'font-size:0.88rem;color:#6b7280;line-height:1.6;margin-bottom:24px;';
      msg.textContent = 'Silakan login terlebih dahulu sebelum melakukan pemesanan.';

      var btnLogin = document.createElement('a');
      btnLogin.href = LOGIN_URL + '?redirect=' + encodeURIComponent(window.location.href);
      btnLogin.style.cssText = [
        'display:inline-flex;align-items:center;gap:8px',
        'padding:13px 28px;border-radius:50px',
        'background:linear-gradient(135deg,#7c3aed,#3b82f6)',
        'color:#fff;font-family:Poppins,sans-serif;font-size:0.9rem;font-weight:600',
        'text-decoration:none;margin-bottom:12px',
        'box-shadow:0 6px 20px rgba(124,58,237,0.3)',
        'transition:all 0.25s',
      ].join(';');
      btnLogin.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login Sekarang';
      btnLogin.onmouseenter = function(){ btnLogin.style.transform='translateY(-2px)'; };
      btnLogin.onmouseleave = function(){ btnLogin.style.transform=''; };

      var orText = document.createElement('p');
      orText.style.cssText = 'font-size:0.82rem;color:#9ca3af;margin:8px 0;';
      orText.textContent = 'Belum punya akun?';

      var btnDaftar = document.createElement('a');
      btnDaftar.href = '/customer/register.html';
      btnDaftar.style.cssText = [
        'display:inline-flex;align-items:center;gap:7px',
        'padding:11px 24px;border-radius:50px',
        'border:2px solid #7c3aed;color:#7c3aed',
        'font-family:Poppins,sans-serif;font-size:0.88rem;font-weight:600',
        'text-decoration:none;transition:all 0.2s',
      ].join(';');
      btnDaftar.innerHTML = '<i class="fas fa-user-plus"></i> Daftar Sekarang';
      btnDaftar.onmouseenter = function(){ btnDaftar.style.background='#f5f3ff'; };
      btnDaftar.onmouseleave = function(){ btnDaftar.style.background=''; };

      card.appendChild(icon);
      card.appendChild(heading);
      card.appendChild(msg);
      card.appendChild(btnLogin);
      card.appendChild(orText);
      card.appendChild(btnDaftar);
      overlay.appendChild(card);
      document.body.appendChild(overlay);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showLoginOverlay);
    } else {
      showLoginOverlay();
    }
  }

  /* ── Auto-fill customer data into the form ── */
  function autoFillForm() {
    if (!isLoggedIn()) return;

    var cust = getCustomerData();

    /* Also try fetching fresh profile if session data has phone missing */
    function fill(data) {
      var namaEl = document.getElementById('nama');
      var emailEl = document.getElementById('email');
      var waEl    = document.getElementById('whatsapp');

      if (namaEl && data.name) {
        namaEl.value = data.name;
        /* make readonly with visual cue */
        namaEl.setAttribute('readonly', 'true');
        namaEl.style.background  = 'var(--light, #f5f3ff)';
        namaEl.style.cursor      = 'not-allowed';
        namaEl.style.borderColor = '#c4b5fd';
        namaEl.title = 'Diisi otomatis dari akun Anda';
      }

      if (emailEl && data.email) {
        emailEl.value = data.email;
        emailEl.setAttribute('readonly', 'true');
        emailEl.style.background  = 'var(--light, #f5f3ff)';
        emailEl.style.cursor      = 'not-allowed';
        emailEl.style.borderColor = '#c4b5fd';
        emailEl.title = 'Diisi otomatis dari akun Anda';
      }

      if (waEl && data.phone) {
        waEl.value = data.phone;
        waEl.setAttribute('readonly', 'true');
        waEl.style.background  = 'var(--light, #f5f3ff)';
        waEl.style.cursor      = 'not-allowed';
        waEl.style.borderColor = '#c4b5fd';
        waEl.title = 'Diisi otomatis dari akun Anda';
      } else if (waEl) {
        /* WhatsApp editable if not in profile */
        waEl.removeAttribute('readonly');
        waEl.style.background  = '';
        waEl.style.cursor      = '';
      }

      /* Show auto-fill notice banner */
      var form = document.getElementById('orderForm');
      if (form && !document.getElementById('autoFillNotice')) {
        var notice = document.createElement('div');
        notice.id = 'autoFillNotice';
        notice.style.cssText = [
          'display:flex;align-items:center;gap:10px',
          'background:linear-gradient(135deg,#ede9fe,#dbeafe)',
          'border-radius:12px;padding:12px 16px;margin-bottom:18px',
          'font-size:0.83rem;color:#5b21b6;font-weight:500',
          'border-left:3px solid #7c3aed',
        ].join(';');
        notice.innerHTML = '<i class="fas fa-user-check" style="color:#7c3aed;font-size:1rem"></i>' +
          '<span>Data diri diisi otomatis dari akun <strong>' +
          escHtml(data.name || '') + '</strong>. ' +
          '<a href="/customer/dashboard.html" style="color:#7c3aed;font-weight:700;text-decoration:none">Lihat Dashboard</a></span>';
        form.insertAdjacentElement('afterbegin', notice);
      }
    }

    function escHtml(s) {
      return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    if (cust) {
      fill(cust);
      /* Also try to fetch fresh data for phone number */
      if (typeof CustomerAPI !== 'undefined') {
        CustomerAPI.getProfile().then(function (res) {
          if (res.success) fill(res.data);
        }).catch(function () {});
      }
    } else if (typeof CustomerAPI !== 'undefined') {
      CustomerAPI.getProfile().then(function (res) {
        if (res.success) fill(res.data);
      }).catch(function () {});
    }
  }

  /* ── Run guard immediately ── */
  runGuard();

  /* ── Run auto-fill after DOM ready ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoFillForm);
  } else {
    autoFillForm();
  }

  /* ── Handle redirect after login ── */
  /* If customer just came back from login page, we can clear the redirect key */
  if (isLoggedIn()) {
    var pendingRedirect = localStorage.getItem(REDIRECT_KEY);
    /* Check if current URL matches the pending redirect — if so, clear it */
    if (pendingRedirect && pendingRedirect === window.location.href) {
      localStorage.removeItem(REDIRECT_KEY);
    }
  }

})();
