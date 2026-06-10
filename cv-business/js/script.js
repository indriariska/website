/* ============================================
   SCRIPT.JS - CV Business Website
   ============================================ */

/* ============================================
   1. NAVBAR SCROLL EFFECT
   ============================================ */
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

/* ============================================
   2. HAMBURGER MENU
   ============================================ */
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');
const mobileNavClose = document.querySelector('.mobile-nav-close');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    mobileNav.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
}

if (mobileNavClose) {
  mobileNavClose.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  });
}

// Close mobile nav on link click
document.querySelectorAll('.mobile-nav .nav-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ============================================
   3. SMOOTH SCROLL
   ============================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ============================================
   4. FADE-IN ANIMATION ON SCROLL
   ============================================ */
function initFadeIn() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  // Observe all fade-in elements
  document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right').forEach(el => {
    observer.observe(el);
  });
}

/* ============================================
   5. ACTIVE NAV LINK
   ============================================ */
function setActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .mobile-nav .nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ============================================
   6. MODAL TEMPLATE PREVIEW
   ============================================ */
function initModals() {
  const modal = document.getElementById('templateModal');
  if (!modal) return;

  const modalTitle = document.getElementById('modalTitle');
  const modalPreview = document.getElementById('modalPreview');
  const modalInfoTitle = document.getElementById('modalInfoTitle');
  const modalInfoDesc = document.getElementById('modalInfoDesc');
  const modalClose = modal.querySelector('.modal-close');

  // Template data
  const templates = {
    'modern-cv': {
      title: 'CV Modern Professional',
      desc: 'Desain modern dengan sidebar berwarna, cocok untuk posisi kreatif dan teknologi. Tampilan elegan dengan warna ungu-biru.',
      class: 'tmpl-modern',
      type: 'CV'
    },
    'clean-cv': {
      title: 'CV Clean & Minimalist',
      desc: 'Tampilan bersih dan minimalis, sangat cocok untuk CV ATS (Applicant Tracking System). Mudah dibaca oleh sistem HR.',
      class: 'tmpl-clean',
      type: 'CV'
    },
    'creative-cv': {
      title: 'CV Creative Dark',
      desc: 'Desain kreatif dengan background gelap yang elegan. Cocok untuk desainer, fotografer, dan posisi kreatif.',
      class: 'tmpl-creative',
      type: 'CV'
    },
    'minimal-cv': {
      title: 'CV Minimal Elegant',
      desc: 'Desain minimalis dengan sentuhan warm tone. Profesional dan elegan, cocok untuk berbagai industri.',
      class: 'tmpl-minimal',
      type: 'CV'
    },
    'elegant-cv': {
      title: 'CV Elegant Green',
      desc: 'Desain elegan bernuansa hijau tua yang mewah. Cocok untuk posisi manajemen dan profesional.',
      class: 'tmpl-elegant',
      type: 'CV'
    },
    'bold-cv': {
      title: 'CV Bold & Vibrant',
      desc: 'Desain bold dengan gradien vivid yang mencolok. Sempurna untuk industri kreatif dan marketing.',
      class: 'tmpl-bold',
      type: 'CV'
    },
    'porto1': {
      title: 'Portofolio Ocean Blue',
      desc: 'Website portofolio dengan tema biru laut yang profesional. Cocok untuk developer, desainer web, dan kreatif digital.',
      class: 'tmpl-porto1',
      type: 'Portofolio'
    },
    'porto2': {
      title: 'Portofolio Forest Green',
      desc: 'Website portofolio dengan tema hijau yang segar. Cocok untuk fotografer, ilustrator, dan seniman.',
      class: 'tmpl-porto2',
      type: 'Portofolio'
    },
    'porto3': {
      title: 'Portofolio Warm Amber',
      desc: 'Website portofolio dengan tema amber yang hangat. Cocok untuk arsitek, interior desainer, dan kreatif.',
      class: 'tmpl-porto3',
      type: 'Portofolio'
    },
    'porto4': {
      title: 'Portofolio Royal Purple',
      desc: 'Website portofolio dengan tema ungu kerajaan yang mewah. Cocok untuk brand strategist dan marketing.',
      class: 'tmpl-porto4',
      type: 'Portofolio'
    }
  };

  // Preview buttons
  document.querySelectorAll('.btn-preview').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const tmplId = this.dataset.template;
      const data = templates[tmplId];
      if (!data) return;

      modalTitle.textContent = data.title;
      modalInfoTitle.textContent = data.title;
      modalInfoDesc.textContent = data.desc;

      // Render preview
      modalPreview.className = 'modal-preview-inner ' + data.class;
      modalPreview.innerHTML = `
        <div class="modal-watermark">SAMPLE</div>
        <div class="tmpl-header">
          <div class="tmpl-avatar">👤</div>
          <div class="tmpl-info">
            <div class="tmpl-name"></div>
            <div class="tmpl-role"></div>
          </div>
        </div>
        <div class="tmpl-line w-full"></div>
        <div class="tmpl-line w-3-4"></div>
        <div class="tmpl-line w-1-2"></div>
        <div class="tmpl-line w-full"></div>
        <div class="tmpl-line w-2-3"></div>
        <div class="tmpl-line w-3-4"></div>
        <div class="tmpl-line w-1-2"></div>
      `;

      // Set pesan button
      const pesanBtn = modal.querySelector('#modalPesanBtn');
      if (pesanBtn) {
        pesanBtn.dataset.templateName = data.title;
        pesanBtn.addEventListener('click', function() {
          pilihTemplate(data.title);
        });
      }

      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  // Pilih template buttons
  document.querySelectorAll('.btn-pilih').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const tmplId = this.dataset.template;
      const data = templates[tmplId];
      if (!data) return;
      pilihTemplate(data.title);
    });
  });

  // Close modal
  modalClose.addEventListener('click', () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

/* ============================================
   7. PILIH TEMPLATE → AUTO-FILL FORM
   ============================================ */
function pilihTemplate(templateName) {
  // Save to sessionStorage
  sessionStorage.setItem('selectedTemplate', templateName);

  // Close modal if open
  const modal = document.getElementById('templateModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Redirect to kontak page
  window.location.href = 'kontak.html?template=' + encodeURIComponent(templateName);
}

/* ============================================
   8. AUTO-FILL TEMPLATE FROM URL PARAM
   ============================================ */
function autoFillTemplate() {
  const urlParams = new URLSearchParams(window.location.search);
  const templateParam = urlParams.get('template');
  const sessionTemplate = sessionStorage.getItem('selectedTemplate');
  const template = templateParam || sessionTemplate;

  if (template) {
    const select = document.getElementById('template');
    if (select) {
      // Try to match
      for (let opt of select.options) {
        if (opt.value.toLowerCase().includes(template.toLowerCase()) ||
            template.toLowerCase().includes(opt.value.toLowerCase())) {
          opt.selected = true;
          break;
        }
      }
      // If no match, set first content option
      if (select.selectedIndex === 0 && select.options.length > 1) {
        // Just keep as is
      }
    }

    // Clear session
    sessionStorage.removeItem('selectedTemplate');
  }
}

/* ============================================
   9. FORM VALIDATION & SUBMIT
   ============================================ */
function initFormValidation() {
  const form = document.getElementById('orderForm');
  if (!form) return;

  // Auto-fill template
  autoFillTemplate();

  const fields = ['nama', 'email', 'whatsapp', 'layanan', 'template', 'pesan'];
  const errorMessages = {
    nama: 'Nama lengkap wajib diisi',
    email: 'Email yang valid wajib diisi',
    whatsapp: 'Nomor WhatsApp wajib diisi',
    layanan: 'Pilih layanan yang diinginkan',
    template: 'Pilih template yang diinginkan',
    pesan: 'Pesan tambahan wajib diisi'
  };

  // Real-time validation
  fields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (!field) return;

    field.addEventListener('blur', () => validateField(field, fieldId));
    field.addEventListener('input', () => {
      if (field.classList.contains('error')) {
        validateField(field, fieldId);
      }
    });
  });

  // Form submit
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    let isValid = true;

    fields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (!field) return;
      if (!validateField(field, fieldId)) {
        isValid = false;
      }
    });

    if (!isValid) {
      // Scroll to first error
      const firstError = form.querySelector('.form-control.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return;
    }

    // Show loading state
    const btn = form.querySelector('.btn-submit');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
    btn.disabled = true;

    // Submit form to Netlify
    const formData = new FormData(form);

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData).toString()
    })
    .then(() => {
      window.location.href = 'sukses.html';
    })
    .catch(() => {
      // Fallback: redirect anyway (Netlify handles it)
      window.location.href = 'sukses.html';
    });
  });

  function validateField(field, fieldId) {
    const errorEl = document.getElementById(fieldId + '-error');
    const value = field.value.trim();
    let isValid = true;

    if (!value) {
      isValid = false;
    } else if (fieldId === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) isValid = false;
    } else if (fieldId === 'whatsapp') {
      const waRegex = /^[0-9+\s-]{9,15}$/;
      if (!waRegex.test(value)) isValid = false;
    }

    if (!isValid) {
      field.classList.add('error');
      if (errorEl) {
        errorEl.textContent = errorMessages[fieldId] || 'Field ini wajib diisi';
        errorEl.classList.add('visible');
      }
    } else {
      field.classList.remove('error');
      if (errorEl) {
        errorEl.classList.remove('visible');
      }
    }

    return isValid;
  }
}

/* ============================================
   10. COUNTER ANIMATION
   ============================================ */
function animateCounter(el, target, duration = 2000) {
  let start = 0;
  const increment = target / (duration / 16);
  const timer = setInterval(() => {
    start += increment;
    if (start >= target) {
      el.textContent = target + (el.dataset.suffix || '');
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(start) + (el.dataset.suffix || '');
    }
  }, 16);
}

function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = 'true';
        const target = parseInt(entry.target.dataset.target);
        animateCounter(entry.target, target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

/* ============================================
   11. INIT ALL
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  initFadeIn();
  initModals();
  initFormValidation();
  initCounters();

  // Trigger scroll for navbar on load
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  }
});
