/* ============================================================
   TEMPLATE.JS  —  CVPro Studio
   Fitur: Detail Modal, Review Modal, Fullscreen Modal,
          Filter Tab, Image Fallback, Pesan → kontak.html
   ============================================================ */

/* ----------------------------------------------------------
   1. DATA REVIEW
   ---------------------------------------------------------- */
var REVIEWS = {
  _default: [
    { name: 'Arinda R.',  job: 'Marketing Exec · Jakarta',  stars: 5, text: 'Template-nya keren! Langsung dapat 3 panggilan interview dalam seminggu.' },
    { name: 'Bagas W.',   job: 'Freelance Designer · Yogya', stars: 5, text: 'Desain elegan dan profesional. Klien saya sangat terkesan.' },
    { name: 'Dita S.',    job: 'Software Engineer · Bandung',stars: 5, text: 'Lolos screening ATS perusahaan MNC. Sangat recommended!' }
  ],
  'cv-basic-1':      [{ name:'Rina A.',  job:'Fresh Graduate · Surabaya', stars:5, text:'Simpel tapi profesional. Langsung dipanggil interview!' },
                      { name:'Andi P.',  job:'Admin Staff · Jakarta',     stars:5, text:'Format bersih, sangat mudah diisi datanya.' }],
  'cv-basic-2':      [{ name:'Sinta M.', job:'HRD Intern · Bekasi',       stars:5, text:'Minimalis dan rapi. Atasan saya bilang CV-nya eye-catching.' }],
  'cv-standard-1':   [{ name:'Kevin L.', job:'UI/UX Designer · Jakarta',  stars:5, text:'Sidebar warna-warni bikin CV saya standout dari yang lain!' },
                      { name:'Maya S.',  job:'Product Manager · Bandung',  stars:5, text:'Modern dan berbeda. HRD bilang paling menarik di antara pelamar.' }],
  'cv-premium-1':    [{ name:'Doni F.',  job:'Graphic Designer · Bali',   stars:5, text:'Desain dark-nya elegan banget. Cocok banget untuk portofolio desainer.' }],
  'porto-standard-1':[{ name:'Dhani K.', job:'Web Developer · Semarang',  stars:5, text:'Portofolio saya jadi jauh lebih profesional. Dapat 5 project baru!' },
                      { name:'Lestari M.',job:'UI Designer · Bali',       stars:5, text:'Ocean blue-nya elegan. Client saya sangat terkesan.' }]
};

/* ----------------------------------------------------------
   2. FITUR PER KATEGORI
   ---------------------------------------------------------- */
var FITUR = {
  CV: {
    Basic:        ['1 halaman CV profesional','Format ATS-friendly','File PDF','2x revisi gratis','Konsultasi konten'],
    Standard:     ['1–2 halaman CV','Format ATS-friendly','File PDF + Word editable','Cover letter','Revisi tidak terbatas'],
    Premium:      ['1–2 halaman CV','Format ATS-friendly','File PDF + Word editable','Cover letter','Infographic elemen','Revisi tidak terbatas'],
    Professional: ['Hingga 3 halaman CV','Format ATS-friendly','File PDF + Word editable','Cover letter','Optimasi LinkedIn','Ekspres 6 jam','Revisi tidak terbatas']
  },
  Portofolio: {
    Basic:        ['1 halaman website','Responsif mobile & desktop','Deploy ke Netlify/Vercel','Revisi gratis'],
    Standard:     ['3–5 halaman website','Responsif mobile & desktop','Animasi modern','Deploy gratis','Revisi tidak terbatas'],
    Premium:      ['5+ halaman website','Animasi interaktif','Custom domain setup','Deploy + panduan update','Revisi tidak terbatas'],
    Professional: ['Halaman tak terbatas','Animasi premium','Custom domain + SSL','Deploy + maintenance 1 bulan','SEO dasar','Revisi tidak terbatas']
  }
};

/* ----------------------------------------------------------
   3. HELPER FUNCTIONS
   ---------------------------------------------------------- */
function fmtHarga(p) {
  var n = parseInt(p) || 0;
  return n > 0 ? 'Rp' + n.toLocaleString('id-ID') : 'Hubungi Kami';
}

function renderStars(n) {
  var html = '';
  for (var i = 0; i < 5; i++) {
    html += '<i class="fas fa-star" style="color:' + (i < n ? '#f59e0b' : '#d1d5db') + ';font-size:0.88rem"></i>';
  }
  return html;
}

/* Ambil data dari tombol → cari img.template-preview-image di card terdekat */
function getDataFromBtn(btn) {
  var card = btn.closest('.template-card');
  if (!card) return null;

  /* Coba dari img.template-preview-image */
  var img = card.querySelector('.template-preview-image');
  if (img) {
    return {
      id:         img.dataset.template  || '',
      title:      img.dataset.title     || card.querySelector('h4') ? card.querySelector('h4').textContent.trim() : 'Template',
      desc:       img.dataset.desc      || '',
      type:       img.dataset.type      || 'CV',
      category:   img.dataset.category  || 'Basic',
      package:    img.dataset.package   || img.dataset.paket || 'Basic',
      price:      img.dataset.price     || '99000',
      previewSrc: img.src               || '',
      fullSrc:    img.dataset.fullImage || img.src || ''
    };
  }

  /* Fallback: ambil dari data-* di tombol sendiri */
  var tmplId   = btn.dataset.template || '';
  var titleEl  = card.querySelector('h4');
  var priceEl  = card.dataset.price   || btn.dataset.price || '99000';
  return {
    id:         tmplId,
    title:      titleEl ? titleEl.textContent.trim() : 'Template',
    desc:       'Hubungi kami untuk info lebih lanjut tentang template ini.',
    type:       card.dataset.type     || 'CV',
    category:   card.dataset.category || 'Basic',
    package:    card.dataset.package  || 'Basic',
    price:      priceEl,
    previewSrc: '',
    fullSrc:    ''
  };
}

function buildURL(data) {
  var p = new URLSearchParams();
  if (data.title && data.title !== 'Template') p.set('template', data.title);
  if (data.price)   p.set('harga',  data.price);
  if (data.package) p.set('paket',  data.package);
  return 'kontak.html?' + p.toString();
}

/* ----------------------------------------------------------
   4. MODAL MANAGEMENT
   ---------------------------------------------------------- */
function closeAll() {
  // START PORTFOLIO VIDEO
  // Pause dan reset video saat modal ditutup
  var videoEl = document.querySelector('#tpDetailVideo');
  if (videoEl) {
    videoEl.pause();
    videoEl.currentTime = 0;
  }
  // END PORTFOLIO VIDEO
  
  document.querySelectorAll('.tp-modal').forEach(function(m) {
    m.classList.remove('tp-modal--open');
    m.setAttribute('aria-hidden', 'true');
  });
  document.body.style.overflow = '';
}

function openModal(id) {
  closeAll();
  var m = document.getElementById(id);
  if (!m) return;
  m.classList.add('tp-modal--open');
  m.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

/* ----------------------------------------------------------
   5. MODAL DETAIL
   ---------------------------------------------------------- */
function openDetail(data) {
  var m = document.getElementById('tpDetailModal');
  if (!m) return;

  // START PORTFOLIO VIDEO
  var isPortofolio = data.type === 'Portofolio';
  var imgWrapEl = m.querySelector('#tpDetailImgWrap');
  var videoWrapEl = m.querySelector('#tpDetailVideoWrap');
  var videoEl = m.querySelector('#tpDetailVideo');
  var fullscreenBtn = m.querySelector('#tpDetailFullscreenBtn');
  
  if (isPortofolio) {
    // Tampilkan video, sembunyikan gambar
    if (imgWrapEl) imgWrapEl.style.display = 'none';
    if (videoWrapEl) videoWrapEl.style.display = 'block';
    if (videoEl) {
      // START PORTFOLIO VIDEO - Deteksi path video berdasarkan lokasi HTML
      var videoPath = 'assets/images/vidio1.mp4';
      if (window.location.pathname.includes('/projek/')) {
        videoPath = '../assets/images/vidio1.mp4';
      }
      videoEl.src = videoPath;
      // END PORTFOLIO VIDEO
      videoEl.play().catch(function(e) { console.log('Autoplay blocked:', e); });
    }
    // Sembunyikan tombol fullscreen untuk Portofolio
    if (fullscreenBtn) fullscreenBtn.style.display = 'none';
  } else {
    // Tampilkan gambar, sembunyikan video
    if (videoWrapEl) videoWrapEl.style.display = 'none';
    if (imgWrapEl) imgWrapEl.style.display = 'block';
    if (fullscreenBtn) fullscreenBtn.style.display = 'block';
    
    /* Gambar preview dengan fallback SVG */
    var imgEl = m.querySelector('#tpDetailImg');
    if (imgEl) {
      imgEl.src = '';
      imgEl.onerror = function() { this.src = makePlaceholderSVG(data); this.onerror = null; };
      imgEl.src = data.previewSrc || makePlaceholderSVG(data);
      imgEl.alt = data.title;
      /* klik gambar → buka fullscreen */
      imgWrapEl && (imgWrapEl.style.cursor = 'zoom-in');
      imgEl.onclick = function() { openFullscreen(data); };
    }
  }
  // END PORTFOLIO VIDEO

  /* Teks */
  setText(m, '#tpDetailTitle',    data.title);
  setText(m, '#tpDetailDesc',     data.desc || 'Hubungi kami untuk detail lebih lanjut.');
  setText(m, '#tpDetailType',     data.type);
  setText(m, '#tpDetailCategory', data.category);
  setText(m, '#tpDetailPackage',  'Paket ' + data.package);
  setText(m, '#tpDetailPrice',    fmtHarga(data.price));

  /* Fitur */
  var map   = FITUR[data.type] || FITUR.CV;
  var feats = map[data.category] || map.Basic;
  var ul    = m.querySelector('#tpDetailFitur');
  if (ul) {
    ul.innerHTML = feats.map(function(f) {
      return '<li style="display:flex;align-items:flex-start;gap:8px;font-size:0.86rem;color:#6b7280;margin-bottom:7px">'
           + '<i class="fas fa-check-circle" style="color:#7c3aed;flex-shrink:0;margin-top:2px"></i>' + f + '</li>';
    }).join('');
  }

  /* Tombol Pesan */
  var orderBtn = m.querySelector('#tpDetailOrderBtn');
  if (orderBtn) orderBtn.href = buildURL(data);

  /* Tombol Fullscreen */
  var fsBtn = m.querySelector('#tpDetailFullscreenBtn');
  if (fsBtn) { fsBtn.onclick = function() { openFullscreen(data); }; }

  openModal('tpDetailModal');
}

/* ----------------------------------------------------------
   6. MODAL REVIEW
   ---------------------------------------------------------- */
function openReview(data) {
  var m = document.getElementById('tpReviewModal');
  if (!m) return;

  setText(m, '#tpReviewTemplateName', data.title);

  var reviews = REVIEWS[data.id] || REVIEWS._default;
  var avg     = reviews.reduce(function(s,r){ return s + r.stars; }, 0) / reviews.length;

  setText(m, '#tpReviewAvg',   avg.toFixed(1));
  setText(m, '#tpReviewCount', reviews.length + ' ulasan');

  var starsEl = m.querySelector('#tpReviewStars');
  if (starsEl) starsEl.innerHTML = renderStars(Math.round(avg));

  var listEl = m.querySelector('#tpReviewList');
  if (listEl) {
    listEl.innerHTML = reviews.map(function(r) {
      return '<div class="tp-review-item">'
        + '<div class="tp-review-header">'
        + '<div class="tp-review-avatar">' + r.name.charAt(0) + '</div>'
        + '<div class="tp-review-meta"><strong>' + r.name + '</strong><span>' + r.job + '</span></div>'
        + '<div class="tp-review-stars">' + renderStars(r.stars) + '</div>'
        + '</div>'
        + '<p class="tp-review-text">"' + r.text + '"</p>'
        + '</div>';
    }).join('');
  }

  openModal('tpReviewModal');
}

/* ----------------------------------------------------------
   7. MODAL FULLSCREEN
   ---------------------------------------------------------- */
function openFullscreen(data) {
  var m = document.getElementById('tpFullscreenModal');
  if (!m) return;

  setText(m, '#tpFullscreenTitle', data.title);

  var loader = m.querySelector('#tpFullscreenLoader');
  var imgEl  = m.querySelector('#tpFullscreenImg');

  if (imgEl) {
    if (loader) loader.style.display = 'flex';
    imgEl.style.display = 'none';
    imgEl.src = '';
    imgEl.onload  = function() { if(loader) loader.style.display='none'; imgEl.style.display='block'; };
    imgEl.onerror = function() { if(loader) loader.style.display='none'; this.src=makePlaceholderSVG(data); imgEl.style.display='block'; this.onerror=null; };
    imgEl.src = data.fullSrc || data.previewSrc || makePlaceholderSVG(data);
  }

  var orderBtn = m.querySelector('#tpFullscreenOrderBtn');
  if (orderBtn) orderBtn.href = buildURL(data);

  openModal('tpFullscreenModal');
}

/* ----------------------------------------------------------
   8. PLACEHOLDER SVG (jika gambar belum ada)
   ---------------------------------------------------------- */
function makePlaceholderSVG(data) {
  var colors = { Basic:'#7c3aed', Standard:'#3b82f6', Premium:'#f59e0b', Professional:'#10b981' };
  var bg  = colors[data.category] || '#7c3aed';
  var lbl = (data.title || 'Template').substring(0, 28);
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">'
    + '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="' + bg + '"/><stop offset="100%" stop-color="' + bg + '88"/></linearGradient></defs>'
    + '<rect width="600" height="400" fill="url(#g)"/>'
    + '<rect x="40" y="40" width="520" height="320" rx="14" fill="rgba(255,255,255,0.07)"/>'
    + '<rect x="60" y="68" width="88" height="88" rx="44" fill="rgba(255,255,255,0.18)"/>'
    + '<rect x="168" y="76" width="180" height="14" rx="7" fill="rgba(255,255,255,0.65)"/>'
    + '<rect x="168" y="100" width="120" height="10" rx="5" fill="rgba(255,255,255,0.38)"/>'
    + '<rect x="60" y="178" width="480" height="9" rx="5" fill="rgba(255,255,255,0.22)"/>'
    + '<rect x="60" y="198" width="380" height="9" rx="5" fill="rgba(255,255,255,0.16)"/>'
    + '<rect x="60" y="218" width="440" height="9" rx="5" fill="rgba(255,255,255,0.13)"/>'
    + '<rect x="60" y="248" width="200" height="9" rx="5" fill="rgba(255,255,255,0.22)"/>'
    + '<rect x="60" y="268" width="320" height="9" rx="5" fill="rgba(255,255,255,0.14)"/>'
    + '<text x="300" y="356" text-anchor="middle" font-family="Poppins,sans-serif" font-size="13" font-weight="600" fill="rgba(255,255,255,0.4)">SAMPLE — ' + lbl + '</text>'
    + '</svg>';
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

/* ----------------------------------------------------------
   9. HELPER: set text ke elemen
   ---------------------------------------------------------- */
function setText(parent, sel, val) {
  var el = parent.querySelector(sel);
  if (el && val != null && val !== 'undefined' && val !== 'null') el.textContent = val;
}

/* ----------------------------------------------------------
   10. IMAGE FALLBACK — semua .template-preview-image
   ---------------------------------------------------------- */
function initImageFallback() {
  document.querySelectorAll('.template-preview-image').forEach(function(img) {
    function applyFallback() {
      var data = {
        title:    img.dataset.title    || 'Template',
        category: img.dataset.category || 'Basic',
        type:     img.dataset.type     || 'CV'
      };
      img.src = makePlaceholderSVG(data);
      img.onerror = null; /* cegah infinite loop */
    }

    img.addEventListener('error', applyFallback);

    /* Jika browser sudah coba load dan gagal (complete = true tapi broken) */
    if (img.complete && img.naturalWidth === 0) {
      applyFallback();
    }
  });
}

/* ----------------------------------------------------------
   11. BIND SEMUA TOMBOL DI KARTU TEMPLATE
   ---------------------------------------------------------- */
function bindButtons() {
  /* Lihat Detail */
  document.querySelectorAll('.btn-preview').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var data = getDataFromBtn(this);
      if (data) openDetail(data);
    });
  });

  /* Lihat Review */
  document.querySelectorAll('.btn-review').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var data = getDataFromBtn(this);
      if (data) openReview(data);
    });
  });

  /* Pesan Template */
  document.querySelectorAll('.btn-pilih').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var data = getDataFromBtn(this);
      if (data) window.location.href = buildURL(data);
    });
  });
}

/* ----------------------------------------------------------
   12. BIND TUTUP MODAL
   ---------------------------------------------------------- */
function bindClose() {
  /* Semua tombol .tp-modal__close */
  document.querySelectorAll('.tp-modal__close').forEach(function(btn) {
    btn.addEventListener('click', closeAll);
  });

  /* Klik di backdrop (luar box) */
  document.querySelectorAll('.tp-modal').forEach(function(m) {
    m.addEventListener('click', function(e) {
      if (e.target === this) closeAll();
    });
  });

  /* Escape key */
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeAll();
  });
}

/* ----------------------------------------------------------
   13. FILTER TABS
   ---------------------------------------------------------- */
function initFilterTabs() {
  var tabs  = document.querySelectorAll('.template-filter-tab');
  var cards = document.querySelectorAll('#templateGrid .template-card');
  if (!tabs.length) return;

  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) { t.classList.remove('active'); });
      this.classList.add('active');

      var f = (this.dataset.filter || 'all').toLowerCase();
      var visible = 0;

      cards.forEach(function(card) {
        var type = (card.dataset.type     || '').toLowerCase();
        var cat  = (card.dataset.category || '').toLowerCase();
        var pkg  = (card.dataset.package  || '').toLowerCase();

        /* Normalise: "portofolio" matches filter "portfolio" */
        var typeNorm = type.replace('portofolio', 'portfolio');

        var show = f === 'all'
          || typeNorm === f
          || type === f
          || cat.toLowerCase() === f
          || pkg.toLowerCase() === f;

        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });

      var badge = document.querySelector('.template-section-header .badge');
      if (badge) badge.textContent = visible + ' Template';
    });
  });
}

/* ----------------------------------------------------------
   14. INIT
   ---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function() {
  initImageFallback();
  initFilterTabs();
  bindButtons();
  bindClose();
});
