/* ============================================================
   KONTAK.JS — CVPro Studio
   Alur pemesanan 2-step:
     Step 1: Form data diri + pilih template + pilih metode
     Step 2: Section pembayaran + upload bukti + kirim WA
   ============================================================ */
(function () {
  'use strict';

  /* ----------------------------------------------------------
     DATA PEMBAYARAN
     Load dari API settings, fallback ke hardcoded data
     ---------------------------------------------------------- */
  var PAYMENT_DATA = {
    BCA:     { icon: 'fas fa-university',  color: '#005BAC', name: 'Bank BCA',    holder: 'A.N. Indri Ariska',   number: '123-456-7890' },
    BSI:     { icon: 'fas fa-mosque',      color: '#00873E', name: 'Bank BSI',    holder: 'A.N. Indri Ariska',   number: '7123-4567-890' },
    BRI:     { icon: 'fas fa-building',    color: '#003DA5', name: 'Bank BRI',    holder: 'A.N. Indri Ariska',   number: '0023-0101-5678-901' },
    Mandiri: { icon: 'fas fa-landmark',    color: '#003087', name: 'Bank Mandiri',holder: 'A.N. Indri Ariska',   number: '123-000-4567-890' },
    DANA:    { icon: 'fas fa-wallet',      color: '#108EE9', name: 'DANA',        holder: 'A.N. Indri Ariska',   number: '0838-3009-4365' },
    GoPay:   { icon: 'fas fa-mobile-alt',  color: '#00AED6', name: 'GoPay',       holder: 'A.N. Indri Ariska',   number: '0838-3009-4365' }
  };

  var ADMIN_WA = '6283122172586';

  async function loadPaymentSettings() {
    try {
      const response = await API.getSettings();
      if (response.success && response.data) {
        const settings = response.data;
        if (settings.payment_bca) PAYMENT_DATA.BCA = JSON.parse(settings.payment_bca);
        if (settings.payment_bsi) PAYMENT_DATA.BSI = JSON.parse(settings.payment_bsi);
        if (settings.payment_bri) PAYMENT_DATA.BRI = JSON.parse(settings.payment_bri);
        if (settings.payment_mandiri) PAYMENT_DATA.Mandiri = JSON.parse(settings.payment_mandiri);
        if (settings.payment_dana) PAYMENT_DATA.DANA = JSON.parse(settings.payment_dana);
        if (settings.payment_gopay) PAYMENT_DATA.GoPay = JSON.parse(settings.payment_gopay);
        if (settings.admin_wa) ADMIN_WA = settings.admin_wa;
        console.log('Payment settings loaded from API');
      }
    } catch (error) {
      console.error('Failed to load payment settings, using defaults:', error);
    }
  }

  /* ----------------------------------------------------------
     HELPER FUNCTIONS
     ---------------------------------------------------------- */
  function fmtRp(val) {
    var n = parseInt(val) || 0;
    return n > 0 ? 'Rp' + n.toLocaleString('id-ID') : '-';
  }

  function getVal(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function setTxt(id, txt) {
    var el = document.getElementById(id);
    if (el) el.textContent = txt || '–';
  }

  /* Pilih option berdasarkan value exact match */
  function selectExact(sel, val) {
    if (!sel || !val || val === 'null' || val === 'undefined') return null;
    var v = val.toLowerCase().trim();
    for (var i = 0; i < sel.options.length; i++) {
      if (sel.options[i].value.toLowerCase().trim() === v) {
        sel.selectedIndex = i;
        return sel.options[i];
      }
    }
    return null;
  }

  /* Update field harga dari selected option */
  function updateHargaFromOption(opt) {
    var inp = document.getElementById('harga');
    if (!inp) return;
    var price = opt && opt.dataset && opt.dataset.price ? parseInt(opt.dataset.price) : 0;
    inp.value = price > 0 ? fmtRp(price) : '';
    /* Update summary box juga */
    updateSummaryBox();
  }

  /* Update summary box di atas form */
  function updateSummaryBox() {
    var box  = document.getElementById('orderSummaryBox');
    var tmpl = getVal('template');
    var harga= getVal('harga');

    if (!box) return;

    if (tmpl && tmpl !== 'Sesuaikan saja') {
      box.style.display = 'block';
      setTxt('summaryTemplate', tmpl);
      setTxt('summaryHarga',   harga || '–');

      /* Kategori dari optgroup */
      var sel = document.getElementById('template');
      var cat = '–';
      if (sel && sel.selectedIndex > 0) {
        var optEl = sel.options[sel.selectedIndex];
        cat = optEl.parentElement && optEl.parentElement.label ? optEl.parentElement.label : '–';
      }
      setTxt('summaryCategory', cat);
    } else {
      box.style.display = 'none';
    }
  }

  /* Tampilkan toast notifikasi */
  function showToast(msg, icon) {
    var t = document.createElement('div');
    t.className = 'kp-toast';
    t.innerHTML = '<i class="' + (icon || 'fas fa-check-circle') + '"></i><span>' + msg + '</span>';
    document.body.appendChild(t);
    setTimeout(function () {
      t.classList.add('hide');
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 400);
    }, 3500);
  }

  /* Smooth scroll ke elemen */
  function scrollTo(el) {
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.pageYOffset - 90;
    window.scrollTo({ top: top, behavior: 'smooth' });
  }

  /* Step indicator update */
  function setStep(n) {
    var steps = document.querySelectorAll('.order-step');
    var connectors = document.querySelectorAll('.step-connector');
    steps.forEach(function (s, i) {
      s.classList.remove('active', 'done');
      if (i + 1 < n) s.classList.add('done');
      if (i + 1 === n) s.classList.add('active');
    });
    connectors.forEach(function (c, i) {
      c.classList.toggle('done', i + 1 < n);
    });
  }

  /* ----------------------------------------------------------
     VALIDASI FORM STEP 1
     ---------------------------------------------------------- */
  function validateStep1() {
    var fields = [
      { id: 'nama',             msg: 'Nama lengkap wajib diisi' },
      { id: 'email',            msg: 'Email yang valid wajib diisi' },
      { id: 'whatsapp',         msg: 'Nomor WhatsApp wajib diisi' },
      { id: 'template',         msg: 'Pilih template / layanan terlebih dahulu' },
      { id: 'metode_pembayaran',msg: 'Pilih metode pembayaran terlebih dahulu' }
    ];

    var isValid = true;

    fields.forEach(function (f) {
      var el  = document.getElementById(f.id);
      var err = document.getElementById(f.id + '-error');
      if (!el) return;

      var val = el.value.trim();
      var ok  = !!val;

      if (f.id === 'email' && ok) {
        ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      }
      if (f.id === 'whatsapp' && ok) {
        ok = /^[0-9+\s\-]{8,15}$/.test(val);
      }

      el.classList.toggle('error', !ok);
      if (err) {
        err.textContent = f.msg;
        err.classList.toggle('visible', !ok);
      }

      if (!ok) isValid = false;
    });

    return isValid;
  }

  /* ----------------------------------------------------------
     TAMPILKAN SECTION PEMBAYARAN
     ---------------------------------------------------------- */
  function showPaymentSection() {
    var formSection    = document.getElementById('orderForm');
    var paySection     = document.getElementById('sectionPembayaran');
    var stepsEl        = document.querySelector('.order-steps');

    if (!paySection) return;

    /* Isi ringkasan */
    var tmpl   = getVal('template');
    var harga  = getVal('harga');
    var metode = getVal('metode_pembayaran');

    setTxt('paySummaryTemplate', tmpl   || '–');
    setTxt('paySummaryMetode',   metode || '–');
    setTxt('paySummaryHarga',    harga  || '–');

    /* Isi info bank */
    var bankData = PAYMENT_DATA[metode];
    if (bankData) {
      var iconEl   = document.getElementById('payBankIcon');
      var nameEl   = document.getElementById('payBankName');
      var holderEl = document.getElementById('payBankHolder');
      var numEl    = document.getElementById('payBankNumber');

      if (iconEl)   { iconEl.innerHTML = '<i class="' + bankData.icon + '"></i>'; iconEl.style.background = bankData.color; }
      if (nameEl)   nameEl.textContent   = bankData.name;
      if (holderEl) holderEl.textContent = bankData.holder;
      if (numEl)    numEl.textContent    = bankData.number;
    }

    /* Sembunyikan form, tampilkan pembayaran */
    if (formSection) formSection.style.display = 'none';
    paySection.style.display = 'block';
    setStep(2);

    /* Scroll smooth ke section pembayaran */
    scrollTo(paySection);
  }

  /* ----------------------------------------------------------
     KEMBALI KE FORM
     ---------------------------------------------------------- */
  function backToForm() {
    var formSection  = document.getElementById('orderForm');
    var paySection   = document.getElementById('sectionPembayaran');
    var stepsEl      = document.querySelector('.order-steps');

    if (formSection) formSection.style.display = '';
    if (paySection)  paySection.style.display  = 'none';
    setStep(1);
    scrollTo(formSection);
  }

  /* ----------------------------------------------------------
     COPY NOMOR REKENING
     ---------------------------------------------------------- */
  function initCopyBtn() {
    var copyBtn   = document.getElementById('payCopyBtn');
    var copyToast = document.getElementById('payCopyToast');
    var numEl     = document.getElementById('payBankNumber');

    if (!copyBtn || !numEl) return;

    copyBtn.addEventListener('click', function () {
      var txt = numEl.textContent.replace(/\s+/g, '').replace(/-/g, '');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(function () { onCopied(); });
      } else {
        /* Fallback untuk browser lama */
        var ta = document.createElement('textarea');
        ta.value = txt;
        ta.style.position = 'fixed';
        ta.style.opacity  = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        onCopied();
      }
    });

    function onCopied() {
      copyBtn.classList.add('copied');
      copyBtn.innerHTML = '<i class="fas fa-check"></i> Tersalin!';
      if (copyToast) copyToast.classList.add('show');
      setTimeout(function () {
        copyBtn.classList.remove('copied');
        copyBtn.innerHTML = '<i class="fas fa-copy"></i> Salin';
        if (copyToast) copyToast.classList.remove('show');
      }, 2500);
    }
  }

  /* ----------------------------------------------------------
     UPLOAD BUKTI PEMBAYARAN
     ---------------------------------------------------------- */
  var uploadedFile = null;

  function initUpload() {
    var uploadInput  = document.getElementById('buktiBayar');
    var uploadLabel  = document.querySelector('.pay-upload-label');
    var previewWrap  = document.getElementById('payPreviewWrap');
    var previewImg   = document.getElementById('payPreviewImg');
    var removeBtn    = document.getElementById('payRemoveBtn');
    var uploadText   = document.getElementById('payUploadText');
    var statusEl     = document.getElementById('payStatus');
    var statusIcon   = document.getElementById('payStatusIcon');
    var statusText   = document.getElementById('payStatusText');
    var kirimBtn     = document.getElementById('btnKirimPesanan');

    if (!uploadInput) return;

    uploadInput.addEventListener('change', function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;

      /* Validasi ukuran maks 5MB */
      if (file.size > 5 * 1024 * 1024) {
        showToast('Ukuran file maksimal 5MB', 'fas fa-exclamation-circle');
        uploadInput.value = '';
        return;
      }

      uploadedFile = file;

      /* Update label */
      if (uploadLabel) uploadLabel.classList.add('has-file');
      if (uploadText)  uploadText.textContent = file.name;

      /* Preview gambar */
      if (file.type.startsWith('image/') && previewWrap && previewImg) {
        var reader = new FileReader();
        reader.onload = function (ev) {
          previewImg.src = ev.target.result;
          previewWrap.style.display = 'block';
        };
        reader.readAsDataURL(file);
      } else {
        /* PDF atau non-image: tampilkan ikon */
        if (previewWrap) previewWrap.style.display = 'none';
      }

      /* Update status */
      if (statusEl)   { statusEl.classList.add('success'); }
      if (statusIcon) { statusIcon.className = 'fas fa-check-circle pay-status-icon'; }
      if (statusText) { statusText.textContent = 'Bukti pembayaran berhasil diupload!'; }

      /* Aktifkan tombol kirim */
      if (kirimBtn) kirimBtn.disabled = false;

      showToast('Bukti pembayaran berhasil diupload', 'fas fa-check-circle');
    });

    /* Hapus file */
    if (removeBtn) {
      removeBtn.addEventListener('click', function () {
        uploadedFile = null;
        uploadInput.value = '';
        if (previewWrap)  previewWrap.style.display = 'none';
        if (uploadLabel)  uploadLabel.classList.remove('has-file');
        if (uploadText)   uploadText.textContent = 'Upload Bukti Pembayaran';
        if (statusEl)     statusEl.classList.remove('success');
        if (statusIcon)   statusIcon.className = 'fas fa-hourglass-half pay-status-icon';
        if (statusText)   statusText.textContent = 'Menunggu bukti pembayaran diupload';
        if (kirimBtn)     kirimBtn.disabled = true;
      });
    }

    /* Drag & drop */
    if (uploadLabel) {
      uploadLabel.addEventListener('dragover', function (e) { e.preventDefault(); this.style.borderColor = '#7c3aed'; });
      uploadLabel.addEventListener('dragleave', function ()  { this.style.borderColor = ''; });
      uploadLabel.addEventListener('drop', function (e) {
        e.preventDefault();
        this.style.borderColor = '';
        var dt = e.dataTransfer;
        if (dt && dt.files && dt.files.length) {
          uploadInput.files = dt.files;
          uploadInput.dispatchEvent(new Event('change'));
        }
      });
    }
  }

  /* ----------------------------------------------------------
     FORMAT PESAN WHATSAPP
     ---------------------------------------------------------- */
  function buildWAMessage() {
    var nama   = getVal('nama');
    var email  = getVal('email');
    var wa     = getVal('whatsapp');
    var tmpl   = getVal('template');
    var harga  = getVal('harga');
    var metode = getVal('metode_pembayaran');
    var pesan  = getVal('pesan');

    var msg = 'Halo Admin CVPro Studio,%0A'
      + 'Saya ingin melakukan pemesanan.%0A%0A'
      + '%F0%9F%91%A4 *Nama:* '             + encodeURIComponent(nama   || '-') + '%0A'
      + '%F0%9F%93%A7 *Email:* '            + encodeURIComponent(email  || '-') + '%0A'
      + '%F0%9F%93%B1 *WhatsApp:* '         + encodeURIComponent(wa     || '-') + '%0A'
      + '%F0%9F%93%84 *Template/Layanan:* ' + encodeURIComponent(tmpl   || '-') + '%0A'
      + '%F0%9F%92%B0 *Harga:* '            + encodeURIComponent(harga  || '-') + '%0A'
      + '%F0%9F%8F%A6 *Metode Pembayaran:* '+ encodeURIComponent(metode || '-') + '%0A'
      + '%F0%9F%93%9D *Pesan Tambahan:* '   + encodeURIComponent(pesan  || '-') + '%0A%0A'
      + '%E2%9C%85 Bukti pembayaran sudah diupload.%0A%0A'
      + 'Terima kasih.';

    return 'https://wa.me/' + ADMIN_WA + '?text=' + msg;
  }

  /* ----------------------------------------------------------
     SUBMIT ORDER KE API
     ---------------------------------------------------------- */
  async function submitOrderToAPI() {
    var nama   = getVal('nama');
    var email  = getVal('email');
    var wa     = getVal('whatsapp');
    var tmpl   = getVal('template');
    var harga  = getVal('harga');
    var metode = getVal('metode_pembayaran');
    var pesan  = getVal('pesan');
    var paket  = getVal('paket');

    var orderData = {
      customerName: nama,
      customerEmail: email,
      customerWhatsapp: wa,
      serviceType: tmpl,
      package: paket,
      price: parseInt(harga.replace(/[^0-9]/g, '')) || 0,
      paymentMethod: metode,
      message: pesan
    };

    try {
      const response = await API.createOrder(orderData, uploadedFile);
      if (response.success) {
        console.log('Order submitted to API:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to submit order');
      }
    } catch (error) {
      console.error('Failed to submit order to API:', error);
      throw error;
    }
  }

  /* ----------------------------------------------------------
     MAPPING TEMPLATE NAMES
     Mapping dari template spesifik ke kategori layanan
     ---------------------------------------------------------- */
  function mapTemplateToOption(templateName) {
    if (!templateName) return null;
    
    var mapping = {
      // CV ATS Professional variants
      'CV ATS Software Engineer': 'CV ATS Professional',
      'CV ATS Marketing': 'CV ATS Professional',
      'CV ATS Finance': 'CV ATS Professional',
      'CV ATS Healthcare': 'CV ATS Professional',
      
      // CV Kreatif & Modern variants
      'CV Kreatif Designer': 'CV Kreatif & Modern',
      'CV Kreatif Marketing': 'CV Kreatif & Modern',
      'CV Kreatif Media': 'CV Kreatif & Modern',
      'CV Kreatif Startup': 'CV Kreatif & Modern',
      
      // Portfolio Website variants
      'Portofolio Developer': 'Portfolio Website',
      'Portofolio Designer': 'Portfolio Website',
      'Portofolio Photographer': 'Portfolio Website',
      'Portofolio Writer': 'Portfolio Website',
      
      // LinkedIn variants
      'LinkedIn Tech Professional': 'Optimasi LinkedIn',
      'LinkedIn Executive': 'Optimasi LinkedIn',
      'LinkedIn Creative': 'Optimasi LinkedIn',
      'LinkedIn Fresh Graduate': 'Optimasi LinkedIn'
    };
    
    // Return mapped value or original template name if not in mapping
    return mapping[templateName] || templateName;
  }

  /* ----------------------------------------------------------
     AUTO-FILL DARI URL PARAMS
     ---------------------------------------------------------- */
  var hargaFromURLFlag = false; // Track if harga came from URL (service-level)

  function initAutoFill() {
    var params   = new URLSearchParams(window.location.search);
    var tmplSel  = document.getElementById('template');
    var paketInp = document.getElementById('paket');
    var hargaInp = document.getElementById('harga');

    var tmplParam    = params.get('template');
    var layananParam = params.get('layanan');
    var hargaParam   = params.get('harga');
    var paketParam   = params.get('paket');

    /* Harga parameter check FIRST - set flag if present */
    if (hargaParam && hargaParam !== '0' && hargaParam !== 'null') {
      hargaFromURLFlag = true;
      var n = parseInt(hargaParam);
      if (hargaInp && n > 0) hargaInp.value = fmtRp(n);
    }

    /* Template - dengan mapping untuk template spesifik */
    if (tmplParam) {
      // Map template name to option value
      var mappedTemplate = mapTemplateToOption(tmplParam);
      var m = selectExact(tmplSel, mappedTemplate);
      if (m && !hargaFromURLFlag) updateHargaFromOption(m); // Only update harga if NOT from URL
    } else if (layananParam) {
      // Map layanan name to option value
      var mappedLayanan = mapTemplateToOption(layananParam);
      var mL = selectExact(tmplSel, mappedLayanan);
      if (mL && !hargaFromURLFlag) updateHargaFromOption(mL); // Only update harga if NOT from URL
    }

    /* Paket */
    if (paketParam && paketParam !== 'null' && paketInp) {
      paketInp.value = paketParam;
    }

    updateSummaryBox();
  }

  /* ----------------------------------------------------------
     INIT SEMUA
     ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {

    /* Load payment settings dari API */
    loadPaymentSettings();

    /* Auto-fill dari URL */
    initAutoFill();

    /* Sisipkan step indicator sebelum form */
    var form = document.getElementById('orderForm');
    if (form) {
      var stepsHtml = '<div class="order-steps">'
        + '<div class="order-step active" data-step="1"><span class="step-num">1</span><span>Data Diri</span></div>'
        + '<div class="step-connector"></div>'
        + '<div class="order-step" data-step="2"><span class="step-num">2</span><span>Pembayaran</span></div>'
        + '</div>';
      form.insertAdjacentHTML('beforebegin', stepsHtml);
    }

    /* Update harga saat template berubah */
    var tmplSel = document.getElementById('template');
    if (tmplSel) {
      tmplSel.addEventListener('change', function () {
        // Only update harga if it wasn't set from URL (service-level pricing)
        if (!hargaFromURLFlag) {
          updateHargaFromOption(this.options[this.selectedIndex]);
        }
      });
    }

    /* Tombol "Lanjut ke Pembayaran" */
    var btnLanjut = document.getElementById('btnLanjutPembayaran');
    if (btnLanjut) {
      btnLanjut.addEventListener('click', function () {
        if (!validateStep1()) {
          /* Scroll ke error pertama */
          var firstErr = document.querySelector('.form-control.error');
          if (firstErr) scrollTo(firstErr);
          showToast('Lengkapi semua field yang wajib diisi', 'fas fa-exclamation-triangle');
          return;
        }
        showPaymentSection();
      });
    }

    /* Tombol "Kembali ke Form" */
    var btnBack = document.getElementById('btnBackToForm');
    if (btnBack) {
      btnBack.addEventListener('click', backToForm);
    }

    /* Init copy dan upload */
    initCopyBtn();
    initUpload();

    /* Tombol "Kirim Pesanan ke WhatsApp" */
    var btnKirim = document.getElementById('btnKirimPesanan');
    if (btnKirim) {
      btnKirim.addEventListener('click', async function () {
        if (!uploadedFile) {
          showToast('Upload bukti pembayaran terlebih dahulu', 'fas fa-exclamation-circle');
          return;
        }

        btnKirim.disabled = true;
        btnKirim.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';

        try {
          await submitOrderToAPI();
          showToast('Pesanan berhasil dikirim! Mengalihkan...', 'fas fa-check-circle');
          
          setTimeout(function () {
            window.location.href = 'sukses.html';
          }, 2000);
        } catch (error) {
          console.error('Order submission failed:', error);
          showToast('Gagal mengirim pesanan. Silakan coba lagi.', 'fas fa-exclamation-circle');
          btnKirim.disabled = false;
          btnKirim.innerHTML = '<i class="fas fa-paper-plane"></i> Kirim Pesanan ke WhatsApp';
        }
      });
    }

    /* Real-time validasi field agar error hilang saat diisi */
    var liveFields = ['nama','email','whatsapp','template','metode_pembayaran'];
    liveFields.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', function  () { if (el.classList.contains('error')) validateField(el, id); });
      el.addEventListener('change', function () { if (el.classList.contains('error')) validateField(el, id); });
    });

    function validateField(el, id) {
      var val = el.value.trim();
      var ok  = !!val;
      if (id === 'email' && ok)     ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (id === 'whatsapp' && ok)  ok = /^[0-9+\s\-]{8,15}$/.test(val);

      el.classList.toggle('error', !ok);
      var errEl = document.getElementById(id + '-error');
      if (errEl) errEl.classList.toggle('visible', !ok);
    }

    /* Init step state */
    setStep(1);

  }); /* end DOMContentLoaded */

})(); /* end IIFE */
