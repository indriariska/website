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



  // Template data - 48 templates total

  const templates = {

    // CV Basic (6 templates) - Rp99.000

    'cv-basic-1': {

      title: 'CV Basic Clean',

      desc: 'Desain bersih dan simpel, cocok untuk pemula. Format standar yang mudah dibaca.',

      class: 'tmpl-basic-1',

      type: 'CV',

      category: 'Basic',

      package: 'Basic',

      price: 99000

    },

    'cv-basic-2': {

      title: 'CV Basic Simple',

      desc: 'Tampilan minimalis dengan layout klasik. Cocok untuk berbagai posisi entry-level.',

      class: 'tmpl-basic-2',

      type: 'CV',

      category: 'Basic',

      package: 'Basic',

      price: 99000

    },

    'cv-basic-3': {

      title: 'CV Basic Classic',

      desc: 'Desain klasik yang timeless. Profesional dan elegan untuk pelamar kerja.',

      class: 'tmpl-basic-3',

      type: 'CV',

      category: 'Basic',

      package: 'Basic',

      price: 99000

    },

    'cv-basic-4': {

      title: 'CV Basic Standard',

      desc: 'Format standar ATS-friendly. Sistem pembacaan HR akan mudah memproses CV ini.',

      class: 'tmpl-basic-4',

      type: 'CV',

      category: 'Basic',

      package: 'Basic',

      price: 99000

    },

    'cv-basic-5': {

      title: 'CV Basic Minimal',

      desc: 'Minimalis namun informatif. Fokus pada konten tanpa dekorasi berlebih.',

      class: 'tmpl-basic-5',

      type: 'CV',

      category: 'Basic',

      package: 'Basic',

      price: 99000

    },

    'cv-basic-6': {

      title: 'CV Basic Professional',

      desc: 'Desain profesional sederhana. Cocok untuk industri formal dan korporat.',

      class: 'tmpl-basic-6',

      type: 'CV',

      category: 'Basic',

      package: 'Basic',

      price: 99000

    },

    // CV Standard (6 templates) - Rp199.000

    'cv-standard-1': {

      title: 'CV Modern Professional',

      desc: 'Desain modern dengan sidebar berwarna, cocok untuk posisi kreatif dan teknologi.',

      class: 'tmpl-modern',

      type: 'CV',

      category: 'Standard',

      package: 'Standard',

      price: 199000

    },

    'cv-standard-2': {

      title: 'CV Clean & Minimalist',

      desc: 'Tampilan bersih dan minimalis, sangat cocok untuk CV ATS. Mudah dibaca oleh sistem HR.',

      class: 'tmpl-clean',

      type: 'CV',

      category: 'Standard',

      package: 'Standard',

      price: 199000

    },

    'cv-standard-3': {

      title: 'CV Two Column',

      desc: 'Layout dua kolom yang efisien. Maksimalkan ruang untuk informasi penting.',

      class: 'tmpl-twocol',

      type: 'CV',

      category: 'Standard',

      package: 'Standard',

      price: 199000

    },

    'cv-standard-4': {

      title: 'CV Sidebar Accent',

      desc: 'Desain dengan sidebar aksen warna. Modern dan menarik perhatian recruiter.',

      class: 'tmpl-sidebar',

      type: 'CV',

      category: 'Standard',

      package: 'Standard',

      price: 199000

    },

    'cv-standard-5': {

      title: 'CV Professional Blue',

      desc: 'Nuansa biru profesional yang terpercaya. Cocok untuk posisi manajerial.',

      class: 'tmpl-problue',

      type: 'CV',

      category: 'Standard',

      package: 'Standard',

      price: 199000

    },

    'cv-standard-6': {

      title: 'CV Executive Style',

      desc: 'Gaya eksekutif dengan layout terstruktur. Impresif untuk posisi senior.',

      class: 'tmpl-exec',

      type: 'CV',

      category: 'Standard',

      package: 'Standard',

      price: 199000

    },

    // CV Premium (6 templates) - Rp499.000

    'cv-premium-1': {

      title: 'CV Creative Dark',

      desc: 'Desain kreatif dengan background gelap yang elegan. Cocok untuk desainer dan kreatif.',

      class: 'tmpl-creative',

      type: 'CV',

      category: 'Premium',

      package: 'Premium',

      price: 499000

    },

    'cv-premium-2': {

      title: 'CV Minimal Elegant',

      desc: 'Desain minimalis dengan sentuhan warm tone. Profesional dan elegan.',

      class: 'tmpl-minimal',

      type: 'CV',

      category: 'Premium',

      package: 'Premium',

      price: 499000

    },

    'cv-premium-3': {

      title: 'CV Elegant Green',

      desc: 'Desain elegan bernuansa hijau tua yang mewah. Cocok untuk posisi manajemen.',

      class: 'tmpl-elegant',

      type: 'CV',

      category: 'Premium',

      package: 'Premium',

      price: 499000

    },

    'cv-premium-4': {

      title: 'CV Bold & Vibrant',

      desc: 'Desain bold dengan gradien vivid yang mencolok. Sempurna untuk industri kreatif.',

      class: 'tmpl-bold',

      type: 'CV',

      category: 'Premium',

      package: 'Premium',

      price: 499000

    },

    'cv-premium-5': {

      title: 'CV Gradient Modern',

      desc: 'Gradien modern yang eye-catching. Stand out dari pelamar lain.',

      class: 'tmpl-gradient',

      type: 'CV',

      category: 'Premium',

      package: 'Premium',

      price: 499000

    },

    'cv-premium-6': {

      title: 'CV Infographic Style',

      desc: 'Style infographic dengan visual elements. Menarik dan mudah dipahami.',

      class: 'tmpl-info',

      type: 'CV',

      category: 'Premium',

      package: 'Premium',

      price: 499000

    },

    // CV Professional (6 templates) - Rp799.000

    'cv-professional-1': {

      title: 'CV Luxury Gold',

      desc: 'Desain mewah dengan aksen emas. Untuk posisi C-level dan eksekutif senior.',

      class: 'tmpl-luxury',

      type: 'CV',

      category: 'Professional',

      package: 'Professional',

      price: 799000

    },

    'cv-professional-2': {

      title: 'CV Executive Premium',

      desc: 'Premium executive CV dengan layout sophisticated. Impresif dan authoritative.',

      class: 'tmpl-execc',

      type: 'CV',

      category: 'Professional',

      package: 'Professional',

      price: 799000

    },

    'cv-professional-3': {

      title: 'CV Corporate Elite',

      desc: 'Desain elite untuk korporat top-tier. Professional dan berkelas.',

      class: 'tmpl-elite',

      type: 'CV',

      category: 'Professional',

      package: 'Professional',

      price: 799000

    },

    'cv-professional-4': {

      title: 'CV Designer Pro',

      desc: 'CV profesional untuk desainer senior. Kreatif namun tetap formal.',

      class: 'tmpl-designer',

      type: 'CV',

      category: 'Professional',

      package: 'Professional',

      price: 799000

    },

    'cv-professional-5': {

      title: 'CV Tech Lead',

      desc: 'CV khusus untuk tech leadership. Highlight technical expertise dan leadership.',

      class: 'tmpl-tech',

      type: 'CV',

      category: 'Professional',

      package: 'Professional',

      price: 799000

    },

    'cv-professional-6': {

      title: 'CV Consultant Expert',

      desc: 'CV untuk consultant dan expert. Professional dengan struktur yang jelas.',

      class: 'tmpl-consult',

      type: 'CV',

      category: 'Professional',

      package: 'Professional',

      price: 799000

    },

    // Portfolio Basic (6 templates) - Rp99.000

    'porto-basic-1': {

      title: 'Portofolio Simple Clean',

      desc: 'Portofolio sederhana dan bersih. Cocok untuk showcase project awal karir.',

      class: 'tmpl-porto1',

      type: 'Portofolio',

      category: 'Basic',

      package: 'Basic',

      price: 99000

    },

    'porto-basic-2': {

      title: 'Portofolio Minimal Start',

      desc: 'Minimalis untuk pemula. Fokus pada karya tanpa distraksi.',

      class: 'tmpl-porto2',

      type: 'Portofolio',

      category: 'Basic',

      package: 'Basic',

      price: 99000

    },

    'porto-basic-3': {

      title: 'Portofolio Basic Grid',

      desc: 'Layout grid sederhana. Tampilkan project dengan rapi dan terorganisir.',

      class: 'tmpl-porto3',

      type: 'Portofolio',

      category: 'Basic',

      package: 'Basic',

      price: 99000

    },

    'porto-basic-4': {

      title: 'Portofolio Clean Layout',

      desc: 'Layout bersih yang mudah dinavigasi. User-friendly untuk visitors.',

      class: 'tmpl-porto4',

      type: 'Portofolio',

      category: 'Basic',

      package: 'Basic',

      price: 99000

    },

    'porto-basic-5': {

      title: 'Portofolio Starter',

      desc: 'Template starter untuk portofolio pertama. Simple namun effective.',

      class: 'tmpl-porto5',

      type: 'Portofolio',

      category: 'Basic',

      package: 'Basic',

      price: 99000

    },

    'porto-basic-6': {

      title: 'Portofolio Entry Level',

      desc: 'Cocok untuk entry-level professionals. Showcase skill dan project awal.',

      class: 'tmpl-porto6',

      type: 'Portofolio',

      category: 'Basic',

      package: 'Basic',

      price: 99000

    },

    // Portfolio Standard (6 templates) - Rp199.000

    'porto-standard-1': {

      title: 'Portofolio Ocean Blue',

      desc: 'Website portofolio dengan tema biru laut yang profesional. Cocok untuk developer.',

      class: 'tmpl-porto7',

      type: 'Portofolio',

      category: 'Standard',

      package: 'Standard',

      price: 199000

    },

    'porto-standard-2': {

      title: 'Portofolio Forest Green',

      desc: 'Website portofolio dengan tema hijau yang segar. Cocok untuk fotografer.',

      class: 'tmpl-porto8',

      type: 'Portofolio',

      category: 'Standard',

      package: 'Standard',

      price: 199000

    },

    'porto-standard-3': {

      title: 'Portofolio Warm Amber',

      desc: 'Website portofolio dengan tema amber yang hangat. Cocok untuk arsitek.',

      class: 'tmpl-porto9',

      type: 'Portofolio',

      category: 'Standard',

      package: 'Standard',

      price: 199000

    },

    'porto-standard-4': {

      title: 'Portofolio Royal Purple',

      desc: 'Website portofolio dengan tema ungu kerajaan yang mewah. Cocok untuk strategist.',

      class: 'tmpl-porto10',

      type: 'Portofolio',

      category: 'Standard',

      package: 'Standard',

      price: 199000

    },

    'porto-standard-5': {

      title: 'Portofolio Modern Dark',

      desc: 'Tema dark mode modern. Trendy dan eye-catching untuk kreatif digital.',

      class: 'tmpl-porto11',

      type: 'Portofolio',

      category: 'Standard',

      package: 'Standard',

      price: 199000

    },

    'porto-standard-6': {

      title: 'Portofolio Light Clean',

      desc: 'Light theme yang clean dan professional. Cocok untuk berbagai industri.',

      class: 'tmpl-porto12',

      type: 'Portofolio',

      category: 'Standard',

      package: 'Standard',

      price: 199000

    },

    // Portfolio Premium (6 templates) - Rp499.000

    'porto-premium-1': {

      title: 'Portofolio Creative Pro',

      desc: 'Portofolio kreatif premium dengan animations. Untuk kreatif profesional.',

      class: 'tmpl-porto13',

      type: 'Portofolio',

      category: 'Premium',

      package: 'Premium',

      price: 499000

    },

    'porto-premium-2': {

      title: 'Portofolio Interactive',

      desc: 'Interactive elements yang engaging. User experience yang memorable.',

      class: 'tmpl-porto14',

      type: 'Portofolio',

      category: 'Premium',

      package: 'Premium',

      price: 499000

    },

    'porto-premium-3': {

      title: 'Portofolio Gallery Style',

      desc: 'Style gallery yang artistic. Showcase karya dengan cara yang unik.',

      class: 'tmpl-porto15',

      type: 'Portofolio',

      category: 'Premium',

      package: 'Premium',

      price: 499000

    },

    'porto-premium-4': {

      title: 'Portofolio Bold Design',

      desc: 'Desain bold yang mencolok. Stand out dari portofolio lain.',

      class: 'tmpl-porto16',

      type: 'Portofolio',

      category: 'Premium',

      package: 'Premium',

      price: 499000

    },

    'porto-premium-5': {

      title: 'Portofolio Gradient Flow',

      desc: 'Gradient flow yang modern dan smooth. Visual yang pleasing.',

      class: 'tmpl-porto17',

      type: 'Portofolio',

      category: 'Premium',

      package: 'Premium',

      price: 499000

    },

    'porto-premium-6': {

      title: 'Portofolio Minimal Premium',

      desc: 'Minimalis tapi premium. Clean dengan attention to detail.',

      class: 'tmpl-porto18',

      type: 'Portofolio',

      category: 'Premium',

      package: 'Premium',

      price: 499000

    },

    // Portfolio Professional (6 templates) - Rp799.000

    'porto-professional-1': {

      title: 'Portofolio Agency Elite',

      desc: 'Portofolio agency-level dengan sophisticated design. Untuk senior professionals.',

      class: 'tmpl-porto19',

      type: 'Portofolio',

      category: 'Professional',

      package: 'Professional',

      price: 799000

    },

    'porto-professional-2': {

      title: 'Portofolio Corporate Pro',

      desc: 'Corporate professional portofolio. Untuk B2B dan enterprise clients.',

      class: 'tmpl-porto20',

      type: 'Portofolio',

      category: 'Professional',

      package: 'Professional',

      price: 799000

    },

    'porto-professional-3': {

      title: 'Portofolio Expert Showcase',

      desc: 'Showcase untuk industry experts. Highlight expertise dan achievements.',

      class: 'tmpl-porto21',

      type: 'Portofolio',

      category: 'Professional',

      package: 'Professional',

      price: 799000

    },

    'porto-professional-4': {

      title: 'Portofolio Luxury Brand',

      desc: 'Luxury brand portofolio. Premium dan high-end appearance.',

      class: 'tmpl-porto22',

      type: 'Portofolio',

      category: 'Professional',

      package: 'Professional',

      price: 799000

    },

    'porto-professional-5': {

      title: 'Portofolio Award Winning',

      desc: 'Design award-winning quality. Untuk top-tier kreatif professionals.',

      class: 'tmpl-porto23',

      type: 'Portofolio',

      category: 'Professional',

      package: 'Professional',

      price: 799000

    },

    'porto-professional-6': {

      title: 'Portofolio Master Class',

      desc: 'Master class portofolio design. The ultimate professional showcase.',

      class: 'tmpl-porto24',

      type: 'Portofolio',

      category: 'Professional',

      package: 'Professional',

      price: 799000

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

      const packageName = this.dataset.package;

      const price = this.dataset.price;

      

      // If it's a link (anchor tag), let it handle the navigation

      if (this.tagName === 'A') return;

      

      const data = templates[tmplId];

      if (!data) return;

      pilihTemplate(data.title, packageName || data.package, price || data.price);

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

function pilihTemplate(templateName, packageName, price) {

  // Save to sessionStorage

  sessionStorage.setItem('selectedTemplate', templateName);

  sessionStorage.setItem('selectedPackage', packageName);

  sessionStorage.setItem('selectedPrice', price);



  // Close modal if open

  const modal = document.getElementById('templateModal');

  if (modal) {

    modal.classList.remove('active');

    document.body.style.overflow = '';

  }



  // Redirect to kontak page with parameters

  const params = new URLSearchParams();

  params.set('template', templateName);

  params.set('paket', packageName);

  params.set('harga', price);

  window.location.href = 'kontak.html?' + params.toString();

}



/* ============================================

   8. AUTO-FILL TEMPLATE FROM URL PARAM

   ============================================ */

function autoFillTemplate() {

  const urlParams = new URLSearchParams(window.location.search);

  const templateParam = urlParams.get('template');

  const paketParam = urlParams.get('paket');

  const hargaParam = urlParams.get('harga');

  const sessionTemplate = sessionStorage.getItem('selectedTemplate');

  const sessionPackage = sessionStorage.getItem('selectedPackage');

  const sessionPrice = sessionStorage.getItem('selectedPrice');

  

  const template = templateParam || sessionTemplate;

  const paket = paketParam || sessionPackage;

  const harga = hargaParam || sessionPrice;



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

  }



  // Auto-fill package

  if (paket) {

    const paketSelect = document.getElementById('paket');

    if (paketSelect) {

      for (let opt of paketSelect.options) {

        if (opt.value.toLowerCase().includes(paket.toLowerCase()) ||

            paket.toLowerCase().includes(opt.value.toLowerCase())) {

          opt.selected = true;

          break;

        }

      }

    }

  }



  // Auto-fill price

  if (harga) {

    const hargaInput = document.getElementById('harga');

    if (hargaInput) {

      hargaInput.value = harga;

    }

  }



  // Clear session

  sessionStorage.removeItem('selectedTemplate');

  sessionStorage.removeItem('selectedPackage');

  sessionStorage.removeItem('selectedPrice');

}



/* ============================================

   9. FORM VALIDATION & SUBMIT

   ============================================ */

function initFormValidation() {

  const form = document.getElementById('orderForm');

  if (!form) return;



  // Auto-fill template

  autoFillTemplate();



  const fields = ['nama', 'email', 'whatsapp', 'template', 'metode_pembayaran'];

  const errorMessages = {

    nama: 'Nama lengkap wajib diisi',

    email: 'Email yang valid wajib diisi',

    whatsapp: 'Nomor WhatsApp wajib diisi',

    template: 'Pilih template yang diinginkan',

    metode_pembayaran: 'Pilih metode pembayaran'

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



  // Auto-price calculation when template is selected

  const templateSelect = document.getElementById('template');

  if (templateSelect) {

    templateSelect.addEventListener('change', function() {

      const selectedOption = this.options[this.selectedIndex];

      const price = selectedOption.dataset.price;

      const hargaInput = document.getElementById('harga');

      if (hargaInput && price) {

        hargaInput.value = price;

      }

    });

  }



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

   10. TEMPLATE CATEGORY FILTER

   ============================================ */

function initTemplateFilter() {

  const filterTabs = document.querySelectorAll('.template-filter-tab');

  const templateCards = document.querySelectorAll('.template-card');



  if (!filterTabs.length || !templateCards.length) return;



  // Check for URL parameters for auto-filter

  const params = new URLSearchParams(window.location.search);

  const typeParam = params.get('type');

  const packageParam = params.get('package');



  // Auto-filter based on URL parameters

  if (typeParam && packageParam) {

    // Filter by both type and package

    templateCards.forEach(card => {

      const cardType = card.dataset.type;

      const cardPackage = card.dataset.package;

      const typeMatch = typeParam.toLowerCase() === 'cv' ? cardType === 'CV' : cardType === 'Portofolio';

      const packageMatch = cardPackage === packageParam;

      card.style.display = (typeMatch && packageMatch) ? 'block' : 'none';

    });



    // Update active tab to reflect the filter

    filterTabs.forEach(tab => {

      tab.classList.remove('active');

      if (tab.dataset.filter === packageParam) {

        tab.classList.add('active');

      }

    });

  } else if (typeParam) {

    // Filter by type only

    templateCards.forEach(card => {

      const cardType = card.dataset.type;

      const typeMatch = typeParam.toLowerCase() === 'cv' ? cardType === 'CV' : cardType === 'Portofolio';

      card.style.display = typeMatch ? 'block' : 'none';

    });



    // Update active tab

    filterTabs.forEach(tab => {

      tab.classList.remove('active');

      if (tab.dataset.filter === typeParam.toLowerCase()) {

        tab.classList.add('active');

      }

    });

  }



  filterTabs.forEach(tab => {

    tab.addEventListener('click', function() {

      // Remove active class from all tabs

      filterTabs.forEach(t => t.classList.remove('active'));

      // Add active class to clicked tab

      this.classList.add('active');



      const filter = this.dataset.filter;



      // Show/hide template cards based on filter

      templateCards.forEach(card => {

        const cardCategory = card.dataset.category;

        const cardType = card.dataset.type;

        const cardPackage = card.dataset.package;



        if (filter === 'all') {

          card.style.display = 'block';

        } else if (filter === 'cv') {

          card.style.display = cardType === 'CV' ? 'block' : 'none';

        } else if (filter === 'portfolio') {

          card.style.display = cardType === 'Portofolio' ? 'block' : 'none';

        } else {

          // Specific package filter (e.g., Basic, Standard, Premium, Professional)

          // Show all templates with this package regardless of type

          card.style.display = cardPackage === filter ? 'block' : 'none';

        }

      });

    });

  });

}



/* ============================================

   11. TEMPLATE REVIEWS

   ============================================ */

const templateReviews = {

  'cv-basic-1': [

    { name: 'Andi Pratama', rating: 5, comment: 'Saya sangat puas dengan desain CV ini karena tampilannya profesional dan mudah dibaca oleh recruiter. Layout-nya juga rapi dan cocok digunakan untuk melamar pekerjaan formal.' },

    { name: 'Siti Rahma', rating: 5, comment: 'Template ini membantu saya membuat CV yang jauh lebih menarik dibanding sebelumnya. Desain modern dan tetap terlihat profesional saat dicetak.' },

    { name: 'Budi Santoso', rating: 4, comment: 'Informasi tersusun dengan rapi dan mudah dibaca. Saya mendapatkan banyak respon positif setelah menggunakan desain CV ini.' }

  ],

  'cv-basic-2': [

    { name: 'Rina Wati', rating: 5, comment: 'Desain minimalis yang sangat cocok untuk fresh graduate seperti saya. Format ATS-friendly membuat CV saya lolos screening sistem perusahaan besar.' },

    { name: 'Dedi Kurniawan', rating: 5, comment: 'Sangat membantu saya dalam membuat CV pertama. Layout yang simpel namun profesional membuat recruiter fokus pada pengalaman saya.' }

  ],

  'cv-basic-3': [

    { name: 'Eko Prasetyo', rating: 5, comment: 'Desain klasik yang timeless dan tidak pernah ketinggalan zaman. Sangat cocok untuk melamar di perusahaan dengan budaya kerja formal dan konservatif.' },

    { name: 'Fitri Handayani', rating: 4, comment: 'Format ATS-friendly yang benar-benar efektif. CV saya berhasil lolos sistem screening dan mendapatkan panggilan interview.' }

  ],

  'cv-basic-4': [

    { name: 'Agus Setiawan', rating: 5, comment: 'Standar yang sangat baik untuk CV ATS. Keyword tersusun dengan rapi sehingga mudah terbaca oleh sistem rekrutmen otomatis.' },

    { name: 'Dewi Sartika', rating: 5, comment: 'Mudah dibaca oleh rekruter dan sistem ATS. Saya mendapatkan respon lebih banyak setelah menggunakan template ini.' }

  ],

  'cv-basic-5': [

    { name: 'Hendra Gunawan', rating: 5, comment: 'Minimalis namun tetap informatif dengan struktur yang jelas. Sangat membantu HRD untuk menemukan informasi penting dengan cepat.' },

    { name: 'Lina Marlina', rating: 4, comment: 'Cocok sekali untuk entry level seperti saya. Desain bersih membuat pengalaman kerja saya lebih menonjol.' }

  ],

  'cv-basic-6': [

    { name: 'Irfan Hakim', rating: 5, comment: 'Profesional sederhana dengan layout yang sangat rapi. Keyword penting tersusun strategis untuk lolos ATS screening.' },

    { name: 'Maya Sari', rating: 5, comment: 'Hasil sangat memuaskan dan melebihi ekspektasi saya. CV terlihat profesional meskipun saya fresh graduate.' }

  ],

  'cv-standard-1': [

    { name: 'Rudi Hartono', rating: 5, comment: 'Desain modern dengan sidebar berwarna yang sangat menarik perhatian recruiter. CV saya terlihat lebih profesional dan berbeda dari pelamar lain.' },

    { name: 'Ani Susanti', rating: 5, comment: 'Sangat profesional dengan layout yang modern namun tetap rapi. Sidebar berwarna memberikan aksen yang elegan tanpa berlebihan.' }

  ],

  'cv-standard-2': [

    { name: 'Bambang Pamungkas', rating: 5, comment: 'ATS-friendly dan sangat mudah dibaca oleh sistem rekrutmen. Format bersih membuat keyword penting mudah ditemukan oleh HRD.' },

    { name: 'Citra Kirana', rating: 4, comment: 'Clean dan minimalis dengan struktur yang sangat terorganisir. Saya mendapatkan banyak panggilan interview setelah menggunakan template ini.' }

  ],

  'cv-standard-3': [

    { name: 'Doni Tata', rating: 5, comment: 'Layout dua kolom yang sangat efisien memaksimalkan ruang satu halaman. Informasi penting tersusun dengan rapi dan mudah dibaca.' },

    { name: 'Elsa Pitaloka', rating: 5, comment: 'Sangat terstruktur dan profesional. Layout dua kolom membuat CV saya terlihat lebih padat namun tetap mudah dipahami.' }

  ],

  'cv-standard-4': [

    { name: 'Fajar Nugraha', rating: 5, comment: 'Desain dengan sidebar aksen warna yang memberikan kesan modern. CV saya terlihat lebih fresh dan menarik perhatian recruiter.' },

    { name: 'Gita Gutawa', rating: 4, comment: 'Menarik dan profesional dengan kombinasi warna yang pas. Sidebar aksen membuat informasi kontak dan skill lebih menonjol.' }

  ],

  'cv-standard-5': [

    { name: 'Hesti Kleopatra', rating: 5, comment: 'Nuansa biru profesional yang memberikan kesan terpercaya dan stabil. Sangat cocok untuk melamar posisi manajerial dan profesional.' },

    { name: 'Indra Bekti', rating: 5, comment: 'Sesuai ekspektasi dan melebihi kualitas template lain yang pernah saya coba. Warna biru memberikan kesan yang sangat profesional.' }

  ],

  'cv-standard-6': [

    { name: 'Joko Anwar', rating: 5, comment: 'Gaya eksekutif dengan layout yang sangat terstruktur dan formal. Sangat cocok untuk melamar posisi senior dan manajerial.' },

    { name: 'Kiki Amalia', rating: 4, comment: 'Kualitas premium dengan desain yang sophisticated. CV saya terlihat seperti buatan profesional mahal.' }

  ],

  'cv-premium-1': [

    { name: 'Laudya Cynthia', rating: 5, comment: 'Desain kreatif dengan background gelap yang sangat elegan dan unik. Sempurna untuk desainer dan kreatif yang ingin menonjolkan visual.' },

    { name: 'Maudy Ayunda', rating: 5, comment: 'Sangat unik dan menarik dengan konsep dark mode yang modern. CV saya terlihat berbeda dari pelamar lain dan mendapatkan banyak pujian.' }

  ],

  'cv-premium-2': [

    { name: 'Nirina Zubir', rating: 5, comment: 'Minimalis dengan warm tone yang memberikan kesan elegan dan hangat. Sangat cocok untuk industri kreatif yang menghargai estetika.' },

    { name: 'Olivia Jensen', rating: 4, comment: 'Elegan dan modern dengan kombinasi warna yang sangat harmonis. Desain minimalis membuat konten lebih fokus dan mudah dibaca.' }

  ],

  'cv-premium-3': [

    { name: 'Pevita Pearce', rating: 5, comment: 'Elegan bernuansa hijau tua yang mewah dan sophisticated. Sangat cocok untuk posisi manajemen yang membutuhkan kesan premium.' },

    { name: 'Qory Sandiora', rating: 5, comment: 'Desain premium dengan detail yang sangat diperhatikan. Warna hijau tua memberikan kesan yang berkelas dan profesional.' }

  ],

  'cv-premium-4': [

    { name: 'Raisa Andriana', rating: 5, comment: 'Desain bold dengan gradien vivid yang sangat mencolok dan modern. Sempurna untuk industri kreatif dan startup yang menghargai inovasi.' },

    { name: 'Sheryl Sheinafia', rating: 4, comment: 'Eye-catching dengan gradien yang sangat estetik. CV saya benar-benar menonjol di antara ratusan pelamar lain.' }

  ],

  'cv-premium-5': [

    { name: 'Titi DJ', rating: 5, comment: 'Gradien modern yang eye-catching dan sangat contemporary. Desain ini membuat CV saya terlihat fresh dan up-to-date.' },

    { name: 'Ussy Sulistiawaty', rating: 5, comment: 'Sangat kreatif dengan penggunaan gradien yang artistik. CV saya mendapatkan banyak komentar positif dari recruiter.' }

  ],

  'cv-premium-6': [

    { name: 'Vania Larissa', rating: 5, comment: 'Style infographic dengan visual elements yang sangat kreatif dan informatif. Sempurna untuk menyajikan data dan skill dengan cara visual.' },

    { name: 'Wulan Guritno', rating: 4, comment: 'Profesional dan kreatif dengan balance yang tepat antara visual dan konten. Infographic membuat skill saya lebih mudah dipahami.' }

  ],

  'cv-professional-1': [

    { name: 'Yuki Kato', rating: 5, comment: 'Desain mewah dengan aksen emas yang memberikan kesan luxury dan authoritative. Sangat cocok untuk posisi C-level dan eksekutif senior.' },

    { name: 'Zaskia Sungkar', rating: 5, comment: 'Luxury premium dengan detail yang sangat diperhatikan. Aksen emas memberikan kesan yang berkelas dan sophisticated untuk posisi top.' }

  ],

  'cv-professional-2': [

    { name: 'Alya Rohali', rating: 5, comment: 'Premium executive CV dengan layout sophisticated yang sangat impresif. Memberikan kesan authority dan leadership yang kuat.' },

    { name: 'Bella Shofie', rating: 5, comment: 'Kualitas terbaik dengan desain yang benar-benar executive. CV saya terlihat seperti buatan konsultan profesional mahal.' }

  ],

  'cv-professional-3': [

    { name: 'Cici Tegal', rating: 5, comment: 'Desain elite untuk korporat top-tier yang memberikan kesan professional dan berkelas. Sangat cocok untuk perusahaan multinasional.' },

    { name: 'Dian Sastro', rating: 5, comment: 'Sangat profesional dengan layout yang terstruktur dan formal. CV saya berhasil menonjol di antara pelamar senior lain.' }

  ],

  'cv-professional-4': [

    { name: 'Eka Pertiwi', rating: 5, comment: 'CV profesional untuk desainer senior dengan balance yang tepat antara kreativitas dan formalitas. Desain yang sophisticated namun tetap ATS-friendly.' },

    { name: 'Fanny Fadillah', rating: 4, comment: 'Desain premium dengan detail yang sangat diperhatikan. Sangat cocok untuk desainer yang ingin menunjukkan portfolio dengan cara profesional.' }

  ],

  'cv-professional-5': [

    { name: 'Gisella Anastasia', rating: 5, comment: 'CV khusus tech leadership yang highlight technical expertise dan leadership dengan cara yang sangat efektif. Layout yang strategis untuk CTO/VP level.' },

    { name: 'Hana Pertiwi', rating: 5, comment: 'Sesuai untuk senior dengan fokus pada achievement dan impact. CV saya berhasil mendapatkan posisi Director di perusahaan tech.' }

  ],

  'cv-professional-6': [

    { name: 'Iis Dahlia', rating: 5, comment: 'CV untuk consultant dan expert dengan struktur yang sangat jelas dan profesional. Layout yang memudahkan klien memahami expertise saya.' },

    { name: 'Jenita Janet', rating: 4, comment: 'Profesional executive dengan fokus pada hasil dan impact. CV saya membantu mendapatkan klien konsultasi yang lebih premium.' }

  ],

  'porto-basic-1': [

    { name: 'Kiki Fatmala', rating: 5, comment: 'Portofolio sederhana dan bersih yang sangat cocok untuk showcase project awal karir. Layout yang mudah dinavigasi membuat karya saya lebih menonjol.' },

    { name: 'Lucky Hakim', rating: 5, comment: 'Mudah digunakan dengan struktur yang sangat terorganisir. Sangat membantu fresh graduate untuk menampilkan project dengan cara profesional.' }

  ],

  'porto-basic-2': [

    { name: 'Melly Goeslaw', rating: 5, comment: 'Minimalis untuk pemula dengan fokus pada karya tanpa distraksi. Sangat cocok untuk menampilkan project pertama dengan cara yang elegan.' },

    { name: 'Nia Ramadhani', rating: 4, comment: 'Cocok untuk starter yang ingin portofolio terlihat profesional. Layout bersih membuat karya lebih fokus dan mudah dinavigasi.' }

  ],

  'porto-basic-3': [

    { name: 'Olla Ramlan', rating: 5, comment: 'Layout grid sederhana yang sangat efektif untuk menampilkan multiple project. Tampilan rapi membuat portofolio terlihat profesional dan terorganisir.' },

    { name: 'Pia Zebadiah', rating: 5, comment: 'Clean dan simple dengan grid layout yang sangat user-friendly. Sangat membantu visitor untuk melihat semua project dengan cepat.' }

  ],

  'porto-basic-4': [

    { name: 'Rina Nose', rating: 5, comment: 'Layout bersih yang mudah dinavigasi dan sangat user-friendly. Visitor dapat dengan mudah menemukan project yang mereka cari.' },

    { name: 'Sandra Dewi', rating: 4, comment: 'Profesional dengan struktur yang sangat terorganisir. Sangat cocok untuk menampilkan project dengan cara yang clean dan modern.' }

  ],

  'porto-basic-5': [

    { name: 'Tika Putri', rating: 5, comment: 'Template starter untuk portofolio pertama yang sangat mudah dikustomisasi. Layout yang simple namun effective untuk showcase karya.' },

    { name: 'Ungu Silver', rating: 5, comment: 'Sangat membantu pemula untuk membuat portofolio yang terlihat profesional. Struktur yang jelas membuat karya lebih menonjol.' }

  ],

  'porto-basic-6': [

    { name: 'Vicky Shu', rating: 5, comment: 'Cocok untuk entry-level professionals yang ingin showcase skill dan project awal. Layout yang clean membuat portofolio terlihat profesional.' },

    { name: 'Wendy Wilson', rating: 4, comment: 'Simple dan clean dengan fokus pada konten project. Sangat membantu saya mendapatkan client pertama untuk freelance work.' }

  ],

  'porto-standard-1': [

    { name: 'Yenny Wahid', rating: 5, comment: 'Tema biru laut profesional yang memberikan kesan trustworthy dan modern. Sangat cocok untuk showcase project dengan nuansa korporat.' },

    { name: 'Zoraya Perucha', rating: 5, comment: 'Desain modern dengan layout yang sangat terstruktur dan profesional. Sangat membantu menampilkan project dengan cara yang elegan.' }

  ],

  'porto-standard-2': [

    { name: 'Ade Irawan', rating: 5, comment: 'Tema hijau yang segar dan memberikan kesan growth dan innovation. Sangat cocok untuk startup dan tech company portfolio.' },

    { name: 'Baim Wong', rating: 4, comment: 'Fresh dan modern dengan warna hijau yang eye-catching. Layout yang clean membuat project lebih menonjol.' }

  ],

  'porto-standard-3': [

    { name: 'Caisar Aditya', rating: 5, comment: 'Tema amber yang hangat dan memberikan kesan creativity dan energy. Sangat cocok untuk designer dan creative professional.' },

    { name: 'Deddy Corbuzier', rating: 5, comment: 'Profesional dengan warna amber yang unik dan memorable. Layout yang terstruktur membuat project showcase sangat efektif.' }

  ],

  'porto-standard-4': [

    { name: 'Eko Patrio', rating: 5, comment: 'Tema ungu kerajaan yang mewah dan sophisticated. Sangat cocok untuk premium brand dan luxury service portfolio.' },

    { name: 'Feri Irawan', rating: 4, comment: 'Luxury design dengan detail yang sangat diperhatikan. Warna ungu memberikan kesan premium dan berkelas.' }

  ],

  'porto-standard-5': [

    { name: 'Gilang Dirga', rating: 5, comment: 'Tema dark mode modern yang sangat trendi dan sophisticated. Sangat cocok untuk tech dan creative portfolio yang ingin terlihat cutting-edge.' },

    { name: 'Hengky Kurniawan', rating: 5, comment: 'Sangat keren dengan dark mode yang nyaman di mata. Layout modern membuat project showcase sangat impresif.' }

  ],

  'porto-standard-6': [

    { name: 'Indra Birowo', rating: 5, comment: 'Light theme clean dan professional yang sangat mudah dibaca. Sangat cocok untuk corporate portfolio dengan fokus pada clarity.' },

    { name: 'Johan Sutrisno', rating: 4, comment: 'Clean dan modern dengan layout yang sangat terorganisir. Sangat membantu menampilkan project dengan cara yang profesional.' }

  ],

  'porto-premium-1': [

    { name: 'Kiki Amalia', rating: 5, comment: 'Kreatif premium dengan animations yang smooth dan sophisticated. Sangat cocok untuk creative director dan senior designer yang ingin showcase dengan style.' },

    { name: 'Lulu Tobing', rating: 5, comment: 'Sangat interaktif dengan micro-interactions yang membuat portfolio engaging. Visitor betah lebih lama menjelajahi karya saya.' }

  ],

  'porto-premium-2': [

    { name: 'Marissa Nasution', rating: 5, comment: 'Interactive elements yang engaging dan membuat portfolio sangat memorable. Hover effects dan transitions sangat smooth dan professional.' },

    { name: 'Nana Mirdad', rating: 4, comment: 'Modern dan kreatif dengan interactivity yang tidak berlebihan. Balance yang tepat antara visual dan usability.' }

  ],

  'porto-premium-3': [

    { name: 'Ovi Sovianti', rating: 5, comment: 'Style gallery artistic yang sangat cocok untuk visual artist dan photographer. Layout masonry membuat karya terlihat seperti galeri seni.' },

    { name: 'Puput Melati', rating: 5, comment: 'Artistic design dengan composition yang sangat diperhatikan. Sangat membantu menampilkan visual work dengan cara yang estetik.' }

  ],

  'porto-premium-4': [

    { name: 'Ria Irawan', rating: 5, comment: 'Desain bold yang mencolok dan sangat eye-catching. Sangat cocok untuk brand yang ingin statement visual yang kuat.' },

    { name: 'Sita Nursanti', rating: 4, comment: 'Bold dan modern dengan kontras yang sangat baik. Layout yang unik membuat portfolio benar-benar menonjol.' }

  ],

  'porto-premium-5': [

    { name: 'Titi Dwijayati', rating: 5, comment: 'Gradient flow modern smooth yang sangat contemporary dan sophisticated. Memberikan kesan premium dan cutting-edge.' },

    { name: 'Uthe Shahraz', rating: 5, comment: 'Smooth gradient dengan transisi yang sangat halus. Sangat cocok untuk tech startup dan modern brand portfolio.' }

  ],

  'porto-premium-6': [

    { name: 'Vina Panduwinata', rating: 5, comment: 'Minimalis tapi premium dengan detail yang sangat diperhatikan. Less is more approach yang sangat efektif untuk showcase karya.' },

    { name: 'Widyawati', rating: 4, comment: 'Premium minimalis dengan whitespace yang sangat diperhitungkan. Sangat membantu karya lebih fokus dan menonjol.' }

  ],

  'porto-professional-1': [

    { name: 'Yessy Gusman', rating: 5, comment: 'Agency-level sophisticated design yang sangat profesional dan polished. Sangat cocok untuk senior creative dan agency owner.' },

    { name: 'Zaskia Mecca', rating: 5, comment: 'High-end quality dengan detail yang sangat diperhatikan. Portfolio saya terlihat seperti buatan agency mahal.' }

  ],

  'porto-professional-2': [

    { name: 'Ayu Dewi', rating: 5, comment: 'Corporate professional untuk B2B dengan layout yang sangat terstruktur dan formal. Sangat cocok untuk consultant dan enterprise level.' },

    { name: 'Bianca Liza', rating: 5, comment: 'Corporate design dengan fokus pada professionalism dan credibility. Sangat membantu mendapatkan klien B2B premium.' }

  ],

  'porto-professional-3': [

    { name: 'Cathy Sharon', rating: 5, comment: 'Showcase untuk industry experts dengan layout yang highlight expertise dan achievement. Sangat cocok untuk thought leader dan speaker.' },

    { name: 'Dian Nitami', rating: 4, comment: 'Expert showcase dengan struktur yang sangat jelas dan profesional. Sangat membantu menampilkan credibility dengan cara yang efektif.' }

  ],

  'porto-professional-4': [

    { name: 'Eva Celia', rating: 5, comment: 'Luxury brand premium high-end dengan detail yang sangat diperhatikan. Sangat cocok untuk luxury brand dan high-end service provider.' },

    { name: 'Fanny Bauty', rating: 5, comment: 'Luxury premium dengan estetika yang sangat sophisticated. Portfolio saya berhasil mendapatkan klien high-end.' }

  ],

  'porto-professional-5': [

    { name: 'Gita Sinaga', rating: 5, comment: 'Design award-winning quality yang sangat impresif dan polished. Sangat cocok untuk award-winning designer dan creative director.' },

    { name: 'Hani Motola', rating: 4, comment: 'Award winning dengan layout yang sangat sophisticated. Portfolio saya mendapatkan pengakuan dari industry peers.' }

  ],

  'porto-professional-6': [

    { name: 'Icha Nabilah', rating: 5, comment: 'Master class portofolio design dengan detail yang sangat diperhatikan. Sangat cocok untuk senior professional yang ingin showcase dengan style.' },

    { name: 'Jesica Iskandar', rating: 5, comment: 'Master quality dengan layout yang sangat sophisticated dan professional. Portfolio saya terlihat seperti buatan expert.' }

  ],

  // Service Reviews

  'cv-ats-1': [

    { name: 'Reza Rahadian', rating: 5, comment: 'CV ATS yang dibuat sangat profesional dan berhasil lolos screening perusahaan besar. Keyword tersusun strategis sehingga mudah terbaca oleh sistem rekrutmen.' },

    { name: 'Maudy Ayunda', rating: 5, comment: 'Sangat membantu dalam mendapatkan panggilan interview dari perusahaan top-tier. Format ATS yang benar-benar efektif.' },

    { name: 'Chicco Jerikho', rating: 4, comment: 'Format ATS yang benar-benar efektif dan mudah digunakan. CV saya lolos screening sistem yang sebelumnya selalu gagal.' }

  ],

  'cv-ats-2': [

    { name: 'Adipati Dolken', rating: 5, comment: 'Optimasi keyword yang sangat tepat untuk industri marketing dan digital. CV saya berhasil mendapatkan perhatian HRD dari perusahaan yang saya incar.' },

    { name: 'Pevita Pearce', rating: 5, comment: 'CV ATS yang bersih dan mudah dibaca HRD. Layout yang simpel namun profesional membuat informasi penting mudah ditemukan.' }

  ],

  'cv-ats-3': [

    { name: 'Rio Dewanto', rating: 5, comment: 'Format ATS untuk keuangan sangat sesuai standar internasional. CV saya lolos screening perusahaan multinasional dan mendapatkan interview.' },

    { name: 'Atiqah Hasiholan', rating: 4, comment: 'Profesional dan ATS-friendly dengan struktur yang sangat jelas. Sangat membantu fresh graduate di bidang keuangan.' }

  ],

  'cv-ats-4': [

    { name: 'Ario Bayu', rating: 5, comment: 'CV ATS untuk bidang kesehatan sangat membantu dalam melamar rumah sakit besar. Format yang sesuai standar medis internasional.' },

    { name: 'Bunga Citra', rating: 5, comment: 'Sesuai dengan standar ATS industri kesehatan dan sangat profesional. CV saya berhasil lolos screening sistem rumah sakit.' }

  ],

  'cv-kreatif-1': [

    { name: 'Dian Sastro', rating: 5, comment: 'Desain visual yang sangat menarik dan unik dengan sentuhan artistik yang profesional. CV saya benar-benar menonjol di antara pelamar lain.' },

    { name: 'Luna Maya', rating: 5, comment: 'CV kreatif yang membuat saya standout dan mendapatkan perhatian recruiter. Balance yang tepat antara kreativitas dan profesionalitas.' }

  ],

  'cv-kreatif-2': [

    { name: 'Nicholas Saputra', rating: 5, comment: 'Desain modern yang sangat cocok untuk marketing dan creative industry. Visual yang eye-catching namun tetap mudah dibaca.' },

    { name: 'Titi Kamal', rating: 4, comment: 'Kreatif dan profesional dengan layout yang sangat contemporary. Sangat cocok untuk posisi yang membutuhkan visual sense.' }

  ],

  'cv-kreatif-3': [

    { name: 'Doni Tata', rating: 5, comment: 'Desain eye-catching untuk industri media dan entertainment yang sangat impresif. CV saya mendapatkan banyak pujian dari HRD.' },

    { name: 'Raffi Ahmad', rating: 5, comment: 'Sangat kreatif dan modern dengan visual yang sangat memorable. Sangat cocok untuk creative professional.' }

  ],

  'cv-kreatif-4': [

    { name: 'Gading Marten', rating: 5, comment: 'Desain modern yang sangat cocok untuk startup dan tech company. Visual yang fresh dan contemporary.' },

    { name: 'Gisella Anastasia', rating: 4, comment: 'Fresh dan kreatif dengan layout yang sangat user-friendly. Sangat membantu menonjolkan skill kreatif saya.' }

  ],

  'porto-1': [

    { name: 'Iqbaal Ramadhan', rating: 5, comment: 'Website portofolio developer yang sangat profesional dengan layout yang clean dan modern. Sangat membantu showcase project dengan cara yang impresif.' },

    { name: 'Zaskia Sungkar', rating: 5, comment: 'Desain responsif dan modern yang bekerja sempurna di semua device. Portfolio saya terlihat sangat profesional dan mudah dinavigasi.' }

  ],

  'porto-2': [

    { name: 'Rizky Febian', rating: 5, comment: 'Portofolio designer yang sangat estetik dengan visual yang sangat diperhatikan. Layout yang artistic membuat karya lebih menonjol.' },

    { name: 'Aisyah Aqilah', rating: 5, comment: 'Website portofolio yang memukau dengan design yang sangat polished. Sangat cocok untuk visual designer dan illustrator.' }

  ],

  'porto-3': [

    { name: 'Budi Doremi', rating: 5, comment: 'Portofolio fotografer yang sangat elegan dengan layout yang fokus pada visual. Gallery yang sangat user-friendly dan estetik.' },

    { name: 'Nagita Slavina', rating: 4, comment: 'Desain yang sangat profesional dengan attention to detail yang luar biasa. Sangat membantu menampilkan karya fotografi dengan cara terbaik.' }

  ],

  'porto-4': [

    { name: 'Ernest Prakasa', rating: 5, comment: 'Portofolio writer yang sangat rapi dengan layout yang fokus pada konten dan readability. Sangat cocok untuk copywriter dan content creator.' },

    { name: 'Mira Rachmawati', rating: 5, comment: 'Website portofolio yang mudah dinavigasi dengan struktur yang sangat terorganisir. Sangat membantu menampilkan tulisan dengan cara yang profesional.' }

  ],

  'linkedin-1': [

    { name: 'Reza Rahadian', rating: 5, comment: 'Optimasi LinkedIn untuk teknologi sangat membantu dalam meningkatkan visibility saya. Profil saya mendapatkan lebih banyak connection dan job offer.' },

    { name: 'Maudy Ayunda', rating: 5, comment: 'Profil LinkedIn yang sangat profesional dan optimized untuk recruiter. Sangat membantu dalam networking dan mendapatkan opportunity.' }

  ],

  'linkedin-2': [

    { name: 'Adipati Dolken', rating: 5, comment: 'Optimasi LinkedIn untuk eksekutif sangat tepat dengan fokus pada leadership dan achievement. Profil saya terlihat sangat authoritative.' },

    { name: 'Pevita Pearce', rating: 5, comment: 'Profile yang sangat executive dan profesional dengan keyword yang strategis. Sangat membantu mendapatkan perhatian recruiter senior.' }

  ],

  'linkedin-3': [

    { name: 'Rio Dewanto', rating: 5, comment: 'Optimasi LinkedIn untuk kreatif sangat membantu menonjolkan portfolio dan creative work. Profil saya lebih menarik dan engaging.' },

    { name: 'Atiqah Hasiholan', rating: 4, comment: 'Profile yang menarik dan profesional dengan balance yang tepat antara kreativitas dan formalitas. Sangat cocok untuk creative professional.' }

  ],

  'linkedin-4': [

    { name: 'Ario Bayu', rating: 5, comment: 'Optimasi LinkedIn untuk fresh graduate sangat membantu dalam membangun profil profesional dari nol. Profil saya terlihat siap untuk entry-level.' },

    { name: 'Bunga Citra', rating: 5, comment: 'Profile yang sangat profesional untuk pemula dengan highlight pada education dan skill. Sangat membantu mendapatkan first job.' }

  ]

};



function initReviewButtons() {

  const reviewButtons = document.querySelectorAll('.btn-review');

  const reviewModal = document.getElementById('reviewModal');

  const reviewModalTitle = document.getElementById('reviewModalTitle');

  const reviewModalContent = document.getElementById('reviewModalContent');



  reviewButtons.forEach(btn => {

    btn.addEventListener('click', function(e) {

      e.stopPropagation();

      // Check for both data-template and data-service attributes

      const templateId = this.dataset.template || this.dataset.service;

      const reviews = templateReviews[templateId];



      if (!reviews) {

        reviewModalContent.innerHTML = '<p style="text-align:center;color:var(--gray)">Belum ada review untuk item ini.</p>';

      } else {

        let reviewsHTML = '<div class="reviews-list">';

        reviews.forEach(review => {

          const stars = '⭐'.repeat(review.rating);

          reviewsHTML += `

            <div class="review-item">

              <div class="review-rating">${stars}</div>

              <div class="review-name">${review.name}</div>

              <div class="review-comment">"${review.comment}"</div>

            </div>

          `;

        });

        reviewsHTML += '</div>';

        reviewModalContent.innerHTML = reviewsHTML;

      }



      // Get template name from templates object or use default

      let templateName = 'Template';

      if (templates[templateId]) {

        templateName = templates[templateId].title;

      } else if (templateId) {

        // For service reviews, create a readable name

        templateName = templateId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

      }

      reviewModalTitle.textContent = `Review: ${templateName}`;

      reviewModal.classList.add('active');

      document.body.style.overflow = 'hidden';

    });

  });

}



function closeReviewModal() {

  const reviewModal = document.getElementById('reviewModal');

  if (reviewModal) {

    reviewModal.classList.remove('active');

    document.body.style.overflow = '';

  }

}



// Close modal when clicking outside

document.addEventListener('click', function(e) {

  const reviewModal = document.getElementById('reviewModal');

  if (reviewModal && e.target === reviewModal) {

    closeReviewModal();

  }

});



// Close modal on Escape key

document.addEventListener('keydown', function(e) {

  if (e.key === 'Escape') {

    closeReviewModal();

  }

});



/* ============================================

   11. COUNTER ANIMATION

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

   13. LAYANAN PAGE FILTERING

   ============================================ */

function initLayananFilter() {

  const layananCards = document.querySelectorAll('.layanan-card');

  const serviceGroups = document.querySelectorAll('.service-examples-group');

  

  if (!layananCards.length || !serviceGroups.length) return;



  // Hide all service groups initially

  serviceGroups.forEach(group => {

    group.style.display = 'none';

  });



  // Add click handlers to layanan cards

  layananCards.forEach((card, index) => {

    card.style.cursor = 'pointer';

    card.addEventListener('click', function() {

      // Hide all groups

      serviceGroups.forEach(group => {

        group.style.display = 'none';

      });

      

      // Show corresponding group

      if (serviceGroups[index]) {

        serviceGroups[index].style.display = 'block';

        // Scroll to the examples section

        serviceGroups[index].scrollIntoView({ behavior: 'smooth', block: 'start' });

      }

    });

  });



  // Show first group by default

  if (serviceGroups[0]) {

    serviceGroups[0].style.display = 'block';

  }

}



/* ============================================

   14. INIT ALL

   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  setActiveNav();

  initFadeIn();

  initModals();

  initFormValidation();

  initCounters();

  initTemplateFilter();

  initReviewButtons();

  initLayananFilter();



  // Trigger scroll for navbar on load

  if (window.scrollY > 50) {

    navbar.classList.add('scrolled');

  }

});

