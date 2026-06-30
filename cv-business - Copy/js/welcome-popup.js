/**
 * CVPro Studio — Welcome Popup
 * Shows "Cara Pemesanan" guide on first visit only.
 * State stored in localStorage key: cvpro_welcome_seen
 * Matches existing site design (Poppins, purple gradient, same radius/shadow).
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'cvpro_welcome_seen';

  /* Only show once */
  if (localStorage.getItem(STORAGE_KEY)) return;

  /* Don't show on customer portal or admin pages */
  var path = window.location.pathname;
  if (path.startsWith('/customer') || path.startsWith('/admin')) return;

  function createPopup() {
    /* ── Overlay ── */
    var overlay = document.createElement('div');
    overlay.id = 'cvproWelcomeOverlay';
    overlay.style.cssText = [
      'position:fixed;inset:0;z-index:99999',
      'background:rgba(30,27,75,0.72)',
      'display:flex;align-items:center;justify-content:center',
      'padding:20px',
      'animation:cvproFadeIn 0.35s ease',
      'backdrop-filter:blur(4px)',
    ].join(';');

    /* ── Card ── */
    var card = document.createElement('div');
    card.style.cssText = [
      'background:#fff',
      'border-radius:24px',
      'max-width:520px;width:100%',
      'padding:40px 36px 32px',
      'box-shadow:0 30px 80px rgba(124,58,237,0.25)',
      'position:relative',
      'animation:cvproSlideUp 0.4s ease',
      'font-family:Poppins,sans-serif',
      'max-height:90vh;overflow-y:auto',
    ].join(';');

    /* ── Close (X) button ── */
    var closeX = document.createElement('button');
    closeX.setAttribute('aria-label', 'Tutup');
    closeX.style.cssText = [
      'position:absolute;top:16px;right:16px',
      'background:none;border:none;cursor:pointer',
      'color:#9ca3af;font-size:1.3rem;line-height:1',
      'transition:color 0.2s',
    ].join(';');
    closeX.innerHTML = '<i class="fas fa-times"></i>';
    closeX.onmouseenter = function(){ closeX.style.color = '#7c3aed'; };
    closeX.onmouseleave = function(){ closeX.style.color = '#9ca3af'; };
    closeX.onclick = dismiss;

    /* ── Icon badge ── */
    var badge = document.createElement('div');
    badge.style.cssText = [
      'width:64px;height:64px;border-radius:18px',
      'background:linear-gradient(135deg,#7c3aed,#3b82f6)',
      'display:flex;align-items:center;justify-content:center',
      'margin:0 auto 20px',
      'font-size:1.6rem;color:#fff',
      'box-shadow:0 10px 30px rgba(124,58,237,0.3)',
    ].join(';');
    badge.innerHTML = '<i class="fas fa-file-alt"></i>';

    /* ── Title ── */
    var title = document.createElement('h2');
    title.style.cssText = [
      'text-align:center;font-size:1.4rem;font-weight:800',
      'background:linear-gradient(135deg,#7c3aed,#3b82f6)',
      '-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text',
      'margin-bottom:6px',
    ].join(';');
    title.textContent = 'Cara Pemesanan';

    /* ── Subtitle ── */
    var sub = document.createElement('p');
    sub.style.cssText = 'text-align:center;font-size:0.9rem;color:#6b7280;margin-bottom:24px;';
    sub.textContent = 'Selamat datang di CVPro Studio.';

    /* ── Steps ── */
    var steps = [
      { n: '1', text: 'Daftar akun terlebih dahulu.' },
      { n: '2', text: 'Login ke akun Anda.' },
      { n: '3', text: 'Pilih layanan yang diinginkan.' },
      { n: '4', text: 'Isi formulir pemesanan.' },
      { n: '5', text: 'Upload bukti pembayaran.' },
      { n: '6', text: 'Pantau progres pesanan melalui Dashboard Customer.' },
      { n: '7', text: 'Download hasil setelah pesanan selesai.' },
    ];

    var stepsWrap = document.createElement('ol');
    stepsWrap.style.cssText = [
      'list-style:none;padding:0;margin:0 0 28px',
      'display:flex;flex-direction:column;gap:10px',
    ].join(';');

    steps.forEach(function (s) {
      var li = document.createElement('li');
      li.style.cssText = [
        'display:flex;align-items:flex-start;gap:12px',
        'padding:10px 14px;border-radius:12px',
        'background:#f5f3ff;transition:background 0.2s',
      ].join(';');
      li.onmouseenter = function(){ li.style.background='#ede9fe'; };
      li.onmouseleave = function(){ li.style.background='#f5f3ff'; };

      var num = document.createElement('span');
      num.style.cssText = [
        'min-width:26px;height:26px;border-radius:50%',
        'background:linear-gradient(135deg,#7c3aed,#3b82f6)',
        'color:#fff;font-size:0.75rem;font-weight:700',
        'display:flex;align-items:center;justify-content:center;flex-shrink:0',
      ].join(';');
      num.textContent = s.n;

      var txt = document.createElement('span');
      txt.style.cssText = 'font-size:0.88rem;color:#374151;line-height:1.5;padding-top:3px;';
      txt.textContent = s.text;

      li.appendChild(num);
      li.appendChild(txt);
      stepsWrap.appendChild(li);
    });

    /* ── Buttons ── */
    var btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;';

    function makeBtn(label, icon, href, style) {
      var a = document.createElement('a');
      a.href = href;
      a.style.cssText = [
        'flex:1;min-width:120px;padding:12px 16px',
        'border-radius:50px;text-align:center',
        'font-family:Poppins,sans-serif;font-size:0.88rem;font-weight:600',
        'text-decoration:none;display:flex;align-items:center;justify-content:center;gap:7px',
        'transition:all 0.25s',
        style,
      ].join(';');
      a.innerHTML = '<i class="fas ' + icon + '"></i>' + label;
      a.onclick = function(){ localStorage.setItem(STORAGE_KEY, '1'); };
      return a;
    }

    var btnDaftar = makeBtn('Daftar Sekarang', 'fa-user-plus', '/customer/register.html',
      'background:linear-gradient(135deg,#7c3aed,#3b82f6);color:#fff;box-shadow:0 6px 20px rgba(124,58,237,0.3)');
    btnDaftar.onmouseenter = function(){ btnDaftar.style.transform='translateY(-2px)'; btnDaftar.style.boxShadow='0 10px 28px rgba(124,58,237,0.4)'; };
    btnDaftar.onmouseleave = function(){ btnDaftar.style.transform=''; btnDaftar.style.boxShadow='0 6px 20px rgba(124,58,237,0.3)'; };

    var btnLogin = makeBtn('Login', 'fa-sign-in-alt', '/customer/login.html',
      'background:#fff;color:#7c3aed;border:2px solid #7c3aed');
    btnLogin.onmouseenter = function(){ btnLogin.style.background='#f5f3ff'; };
    btnLogin.onmouseleave = function(){ btnLogin.style.background='#fff'; };

    var btnTutup = document.createElement('button');
    btnTutup.style.cssText = [
      'flex:1;min-width:100px;padding:12px 16px',
      'border-radius:50px;border:2px solid #e5e7eb',
      'background:#fff;color:#9ca3af',
      'font-family:Poppins,sans-serif;font-size:0.88rem;font-weight:600',
      'cursor:pointer;transition:all 0.25s',
    ].join(';');
    btnTutup.textContent = 'Tutup';
    btnTutup.onmouseenter = function(){ btnTutup.style.borderColor='#9ca3af'; btnTutup.style.color='#6b7280'; };
    btnTutup.onmouseleave = function(){ btnTutup.style.borderColor='#e5e7eb'; btnTutup.style.color='#9ca3af'; };
    btnTutup.onclick = dismiss;

    btnRow.appendChild(btnDaftar);
    btnRow.appendChild(btnLogin);
    btnRow.appendChild(btnTutup);

    /* ── Note ── */
    var note = document.createElement('p');
    note.style.cssText = 'text-align:center;font-size:0.75rem;color:#9ca3af;margin-top:16px;';
    note.textContent = 'Panduan ini hanya muncul sekali. Selamat memesan! 🎉';

    /* ── Assemble ── */
    card.appendChild(closeX);
    card.appendChild(badge);
    card.appendChild(title);
    card.appendChild(sub);
    card.appendChild(stepsWrap);
    card.appendChild(btnRow);
    card.appendChild(note);
    overlay.appendChild(card);

    /* Click outside to dismiss */
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) dismiss();
    });

    /* ESC key */
    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') { dismiss(); document.removeEventListener('keydown', escHandler); }
    });

    return overlay;
  }

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1');
    var el = document.getElementById('cvproWelcomeOverlay');
    if (el) {
      el.style.animation = 'cvproFadeOut 0.25s ease forwards';
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 280);
    }
  }

  /* ── Keyframes (injected once) ── */
  function injectStyles() {
    if (document.getElementById('cvproPopupStyles')) return;
    var style = document.createElement('style');
    style.id = 'cvproPopupStyles';
    style.textContent = [
      '@keyframes cvproFadeIn{from{opacity:0}to{opacity:1}}',
      '@keyframes cvproFadeOut{from{opacity:1}to{opacity:0}}',
      '@keyframes cvproSlideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}',
      '@media(max-width:480px){',
      '  #cvproWelcomeOverlay > div{padding:28px 20px 24px !important;}',
      '}',
    ].join('');
    document.head.appendChild(style);
  }

  /* ── Mount when DOM ready ── */
  function mount() {
    injectStyles();
    document.body.appendChild(createPopup());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

})();
