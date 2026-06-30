# Template Images Structure

This folder contains the template preview and full template images for the CV & Portfolio website.

## Folder Structure

```
assets/templates/
├── preview/          # Thumbnail/cuplikan gambar untuk tampilan di halaman Beranda
│   ├── cv-basic-clean.jpg
│   ├── cv-modern-professional.jpg
│   ├── cv-creative-dark.jpg
│   ├── cv-luxury-gold.jpg
│   ├── portfolio-simple-clean.jpg
│   ├── portfolio-ocean-blue.jpg
│   ├── portfolio-premium.jpg
│   └── portfolio-professional.jpg
└── full/             # Gambar template penuh untuk preview di modal
    ├── cv-basic-clean-full.jpg
    ├── cv-modern-professional-full.jpg
    ├── cv-creative-dark-full.jpg
    ├── cv-luxury-gold-full.jpg
    ├── portfolio-simple-clean-full.jpg
    ├── portfolio-ocean-blue-full.jpg
    ├── portfolio-premium-full.jpg
    └── portfolio-professional-full.jpg
```

## Image Naming Convention

### Preview Images (preview/)
- Nama file: `[nama-template].jpg`
- Ukuran yang disarankan: 400px x 300px (landscape)
- Format: JPG atau PNG
- Tujuan: Thumbnail/cuplikan yang tampil di halaman Beranda

### Full Template Images (full/)
- Nama file: `[nama-template]-full.jpg`
- Ukuran yang disarankan: 800px x 1130px (A4 ratio) atau sesuai kebutuhan
- Format: JPG atau PNG
- Tujuan: Template penuh yang tampil saat diklik di modal detail

## Cara Mengganti Template

1. Siapkan 2 gambar untuk setiap template:
   - 1 gambar preview (thumbnail/cuplikan)
   - 1 gambar template penuh

2. Beri nama file sesuai konvensi di atas:
   - Preview: `nama-template.jpg`
   - Full: `nama-template-full.jpg`

3. Letakkan file di folder yang sesuai:
   - Preview → `assets/templates/preview/`
   - Full → `assets/templates/full/`

4. Pastikan nama file di HTML (index.html) sesuai dengan nama file yang Anda buat.

## Contoh

Jika Anda memiliki template "CV Modern Blue":

1. Buat 2 gambar:
   - `cv-modern-blue.jpg` (preview/thumbnail)
   - `cv-modern-blue-full.jpg` (template penuh)

2. Letakkan di folder:
   - `assets/templates/preview/cv-modern-blue.jpg`
   - `assets/templates/full/cv-modern-blue-full.jpg`

3. Update HTML di index.html:
   ```html
   <img src="assets/templates/preview/cv-modern-blue.jpg" 
        alt="CV Modern Blue Preview" 
        class="template-preview-image" 
        data-full-image="assets/templates/full/cv-modern-blue-full.jpg"
        data-template="cv-modern-blue" 
        data-package="Standard" 
        data-price="199000"
        data-title="CV Modern Blue"
        data-desc="Deskripsi template..."
        data-type="CV"
        data-category="Standard">
   ```

## Tips

- **Preview Images**: Gunakan cuplikan bagian atas template (header + sebagian konten) agar user melihat gambaran singkat
- **Full Images**: Pastikan resolusi cukup tinggi agar detail template terlihat jelas saat di-zoom
- **Format**: JPG untuk foto/gradient, PNG untuk transparansi
- **Ukuran File**: Kompres gambar agar website tetap cepat (disarankan < 500KB per gambar)

## Template yang Saat Ini Digunakan

### CV Templates
1. cv-basic-clean.jpg / cv-basic-clean-full.jpg
2. cv-modern-professional.jpg / cv-modern-professional-full.jpg
3. cv-creative-dark.jpg / cv-creative-dark-full.jpg
4. cv-luxury-gold.jpg / cv-luxury-gold-full.jpg

### Portfolio Templates
1. portfolio-simple-clean.jpg / portfolio-simple-clean-full.jpg
2. portfolio-ocean-blue.jpg / portfolio-ocean-blue-full.jpg
3. portfolio-premium.jpg / portfolio-premium-full.jpg
4. portfolio-professional.jpg / portfolio-professional-full.jpg
