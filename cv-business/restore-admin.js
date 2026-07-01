/**
 * CVPro Studio — Restore Admin / Staff accounts only.
 * Run once with:  node restore-admin.js
 * Safe to run even when server is running.
 * Does NOT touch orders, customers, expenses, settings, or feedback.
 */
const { PrismaClient } = require('@prisma/client');
const Bcrypt = require('./src/utils/bcrypt');
const prisma = new PrismaClient();

async function main() {
  console.log('Restoring admin & staff user accounts...\n');

  const adminPwd = await Bcrypt.hash('admin123');
  const admin = await prisma.user.upsert({
    where:  { email: 'admin@cvprostudio.id' },
    update: { password: adminPwd, name: 'Indri Ariska', role: 'admin' },
    create: { email: 'admin@cvprostudio.id', password: adminPwd, name: 'Indri Ariska', role: 'admin' },
  });
  console.log('✓ Admin  :', admin.email, ' role:', admin.role);

  const staffPwd = await Bcrypt.hash('staff123');
  const staff = await prisma.user.upsert({
    where:  { email: 'staff@cvprostudio.id' },
    update: { password: staffPwd, name: 'Tim CVPro', role: 'staff' },
    create: { email: 'staff@cvprostudio.id', password: staffPwd, name: 'Tim CVPro', role: 'staff' },
  });
  console.log('✓ Staff  :', staff.email, ' role:', staff.role);

  const total = await prisma.user.count();
  console.log('\nTotal users in database:', total);
  console.log('\nLogin credentials:');
  console.log('  Admin : admin@cvprostudio.id  /  admin123');
  console.log('  Staff : staff@cvprostudio.id  /  staff123');
}

main()
  .then(() => { console.log('\nRestore complete.'); })
  .catch(e => { console.error('ERROR:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
