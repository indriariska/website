/**
 * CVPro Studio — Database Seed
 * Creates admin user, sample orders, expenses, and settings.
 */
const { PrismaClient } = require('@prisma/client');
const Bcrypt = require('../src/utils/bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting CVPro Studio seed...');

  // ── Admin user ──────────────────────────────────────────────
  const adminPassword = await Bcrypt.hash('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cvprostudio.id' },
    update: {},
    create: {
      email: 'admin@cvprostudio.id',
      password: adminPassword,
      name: 'Indri Ariska',
      role: 'admin',
    },
  });
  console.log('Admin user created:', admin.email);

  // Staff user
  const staffPassword = await Bcrypt.hash('staff123');
  const staff = await prisma.user.upsert({
    where: { email: 'staff@cvprostudio.id' },
    update: {},
    create: {
      email: 'staff@cvprostudio.id',
      password: staffPassword,
      name: 'Tim CVPro',
      role: 'staff',
    },
  });
  console.log('Staff user created:', staff.email);

  // ── Sample Orders ────────────────────────────────────────────
  const sampleOrders = [
    {
      customerName: 'Arinda Rahayu',
      customerEmail: 'arinda@gmail.com',
      customerWhatsapp: '081234567890',
      serviceType: 'CV ATS Professional',
      package: 'Standard',
      price: 199000,
      paymentMethod: 'BCA',
      status: 'completed',
      adminNotes: 'CV selesai, sudah dikirim via email.',
      completedAt: new Date('2025-05-10'),
    },
    {
      customerName: 'Bagas Wicaksono',
      customerEmail: 'bagas@gmail.com',
      customerWhatsapp: '082345678901',
      serviceType: 'Portofolio Creative Pro',
      package: 'Premium',
      price: 499000,
      paymentMethod: 'DANA',
      status: 'completed',
      adminNotes: 'Portofolio website telah deploy.',
      completedAt: new Date('2025-05-15'),
    },
    {
      customerName: 'Dita Sumarni',
      customerEmail: 'dita@gmail.com',
      customerWhatsapp: '083456789012',
      serviceType: 'CV Modern Professional',
      package: 'Standard',
      price: 199000,
      paymentMethod: 'BSI',
      status: 'processing',
      adminNotes: 'Sedang dikerjakan.',
    },
    {
      customerName: 'Rizky Pratama',
      customerEmail: 'rizky@gmail.com',
      customerWhatsapp: '084567890123',
      serviceType: 'CV Luxury Gold',
      package: 'Professional',
      price: 799000,
      paymentMethod: 'Mandiri',
      status: 'pending',
    },
    {
      customerName: 'Sari Dewi',
      customerEmail: 'sari@gmail.com',
      customerWhatsapp: '085678901234',
      serviceType: 'Optimasi LinkedIn',
      package: 'Standard',
      price: 200000,
      paymentMethod: 'GoPay',
      status: 'completed',
      completedAt: new Date('2025-06-01'),
    },
    {
      customerName: 'Ahmad Fauzi',
      customerEmail: 'fauzi@gmail.com',
      customerWhatsapp: '086789012345',
      serviceType: 'Portofolio Agency Elite',
      package: 'Professional',
      price: 799000,
      paymentMethod: 'BRI',
      status: 'paid',
      adminNotes: 'Pembayaran sudah diverifikasi, menunggu pengerjaan.',
    },
  ];

  for (const order of sampleOrders) {
    await prisma.order.create({ data: order });
  }
  console.log(`${sampleOrders.length} sample orders created`);

  // ── Sample Expenses ──────────────────────────────────────────
  const expenses = [
    { title: 'Langganan Adobe Creative Cloud', amount: 350000, category: 'Software', description: 'Lisensi bulanan untuk desain CV' },
    { title: 'Hosting & Domain Website', amount: 200000, category: 'Infrastruktur', description: 'Biaya hosting bulanan + domain cvprostudio.id' },
    { title: 'Iklan Instagram Ads', amount: 500000, category: 'Marketing', description: 'Campaign promosi bulan Juni' },
    { title: 'Pulsa & Internet', amount: 150000, category: 'Operasional', description: 'Koneksi internet untuk kerja' },
  ];

  for (const expense of expenses) {
    await prisma.expense.create({ data: expense });
  }
  console.log(`${expenses.length} sample expenses created`);

  // ── Business Settings ────────────────────────────────────────
  const paymentBca = JSON.stringify({ icon: 'fas fa-university', color: '#005BAC', name: 'Bank BCA', holder: 'A.N. Indri Ariska', number: '123-456-7890' });
  const paymentBsi = JSON.stringify({ icon: 'fas fa-mosque', color: '#00873E', name: 'Bank BSI', holder: 'A.N. Indri Ariska', number: '7123-4567-890' });
  const paymentBri = JSON.stringify({ icon: 'fas fa-building', color: '#003DA5', name: 'Bank BRI', holder: 'A.N. Indri Ariska', number: '0023-0101-5678-901' });
  const paymentMandiri = JSON.stringify({ icon: 'fas fa-landmark', color: '#003087', name: 'Bank Mandiri', holder: 'A.N. Indri Ariska', number: '123-000-4567-890' });
  const paymentDana = JSON.stringify({ icon: 'fas fa-wallet', color: '#108EE9', name: 'DANA', holder: 'A.N. Indri Ariska', number: '0838-3009-4365' });
  const paymentGopay = JSON.stringify({ icon: 'fas fa-mobile-alt', color: '#00AED6', name: 'GoPay', holder: 'A.N. Indri Ariska', number: '0838-3009-4365' });

  const settings = await prisma.setting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      businessName: 'CVPro Studio',
      ownerName: 'Indri Ariska',
      phone: '+62 83830094365',
      whatsapp: '6283122172584',
      email: 'indriariska469@gmail.com',
      address: 'Indonesia',
      instagram: 'ftryy.z.a_',
      paymentBca,
      paymentBsi,
      paymentBri,
      paymentMandiri,
      paymentDana,
      paymentGopay,
    },
  });
  console.log('Business settings created:', settings.businessName);

  console.log('\nSeed completed! Login credentials:');
  console.log('  Admin : admin@cvprostudio.id / admin123');
  console.log('  Staff : staff@cvprostudio.id / staff123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
