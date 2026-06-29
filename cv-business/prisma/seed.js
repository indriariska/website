const { PrismaClient } = require('@prisma/client');
const Bcrypt = require('../src/utils/bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create admin user
  const adminPassword = await Bcrypt.hash('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@store.com' },
    update: {},
    create: {
      email: 'admin@store.com',
      password: adminPassword,
      name: 'Admin',
      role: 'admin',
    },
  });
  console.log('Admin user created:', admin.email);

  // Create staff user
  const staffPassword = await Bcrypt.hash('staff123');
  const staff = await prisma.user.upsert({
    where: { email: 'staff@store.com' },
    update: {},
    create: {
      email: 'staff@store.com',
      password: staffPassword,
      name: 'Staff',
      role: 'staff',
    },
  });
  console.log('Staff user created:', staff.email);

  // Create customers
  const customers = [
    { name: 'Budi Santoso', phone: '081234567890', address: 'Jl. Merdeka No. 1, Jakarta' },
    { name: 'Siti Rahayu', phone: '082345678901', address: 'Jl. Sudirman No. 45, Bandung' },
    { name: 'Ahmad Wijaya', phone: '083456789012', address: 'Jl. Gatot Subroto No. 10, Surabaya' },
  ];

  const createdCustomers = [];
  for (const customer of customers) {
    const created = await prisma.customer.upsert({
      where: { id: customer.name.replace(/\s/g, '-').toLowerCase() },
      update: {},
      create: {
        id: customer.name.replace(/\s/g, '-').toLowerCase(),
        ...customer,
      },
    });
    createdCustomers.push(created);
  }
  console.log('Customers created');

  // Create products
  const products = [
    {
      name: 'Laptop ASUS Vivobook',
      description: 'Laptop tipis dengan performa tinggi untuk produktivitas',
      category: 'Elektronik',
      purchasePrice: 7000000,
      sellingPrice: 8500000,
      stock: 10,
    },
    {
      name: 'Mouse Logitech Wireless',
      description: 'Mouse wireless ergonomis dengan baterai tahan lama',
      category: 'Aksesoris',
      purchasePrice: 150000,
      sellingPrice: 250000,
      stock: 50,
    },
    {
      name: 'Keyboard Mechanical RGB',
      description: 'Keyboard mechanical dengan lampu RGB dan switch biru',
      category: 'Aksesoris',
      purchasePrice: 400000,
      sellingPrice: 650000,
      stock: 30,
    },
    {
      name: 'Monitor Samsung 24 inch',
      description: 'Monitor IPS 24 inch dengan resolusi Full HD',
      category: 'Elektronik',
      purchasePrice: 1500000,
      sellingPrice: 2200000,
      stock: 15,
    },
    {
      name: 'Headset Gaming Razer',
      description: 'Headset gaming dengan suara surround dan mic noise-canceling',
      category: 'Aksesoris',
      purchasePrice: 800000,
      sellingPrice: 1200000,
      stock: 20,
    },
  ];

  const createdProducts = [];
  for (const product of products) {
    const created = await prisma.product.upsert({
      where: { id: product.name.replace(/\s/g, '-').toLowerCase() },
      update: {},
      create: {
        id: product.name.replace(/\s/g, '-').toLowerCase(),
        ...product,
      },
    });
    createdProducts.push(created);
  }
  console.log('Products created');

  // Create orders with order items
  const order1 = await prisma.order.create({
    data: {
      customerId: createdCustomers[0].id,
      totalPrice: 2500000,
      totalCost: 1550000,
      profit: 950000,
      status: 'completed',
      paymentMethod: 'transfer',
      orderItems: {
        create: [
          {
            productId: createdProducts[1].id,
            quantity: 2,
            price: 250000,
          },
          {
            productId: createdProducts[2].id,
            quantity: 3,
            price: 650000,
          },
        ],
      },
    },
  });
  console.log('Order 1 created');

  const order2 = await prisma.order.create({
    data: {
      customerId: createdCustomers[1].id,
      totalPrice: 10700000,
      totalCost: 8500000,
      profit: 2200000,
      status: 'pending',
      paymentMethod: 'e-wallet',
      orderItems: {
        create: [
          {
            productId: createdProducts[0].id,
            quantity: 1,
            price: 8500000,
          },
          {
            productId: createdProducts[3].id,
            quantity: 1,
            price: 2200000,
          },
        ],
      },
    },
  });
  console.log('Order 2 created');

  // Create expenses
  const expenses = [
    { title: 'Sewa Toko Bulan Januari', amount: 5000000, description: 'Biaya sewa tempat usaha' },
    { title: 'Listrik dan Air', amount: 800000, description: 'Tagihan utilitas bulanan' },
    { title: 'Gaji Karyawan', amount: 15000000, description: 'Gaji karyawan bulan ini' },
    { title: 'Iklan Facebook Ads', amount: 2000000, description: 'Campaign promosi produk baru' },
  ];

  for (const expense of expenses) {
    await prisma.expense.upsert({
      where: { id: expense.title.replace(/\s/g, '-').toLowerCase() },
      update: {},
      create: {
        id: expense.title.replace(/\s/g, '-').toLowerCase(),
        ...expense,
      },
    });
  }
  console.log('Expenses created');

  // Create settings
  const settings = await prisma.setting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      storeName: 'Toko Elektronik Maju',
      phone: '021-12345678',
      address: 'Jl. Raya Utama No. 123, Jakarta',
      logo: '/uploads/logo.png',
    },
  });
  console.log('Settings created');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
