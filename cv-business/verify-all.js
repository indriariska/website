/**
 * CVPro Studio — Full system verification script
 * Run with: node verify-all.js
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Bcrypt = require('./src/utils/bcrypt');
const JWT    = require('./src/utils/jwt');

async function run() {
  const results = [];

  // ── 1. DB table access ──────────────────────────────────────
  const userCount  = await prisma.user.count();
  const custCount  = await prisma.customer.count();
  const ordCount   = await prisma.order.count();
  const fbCount    = await prisma.feedback.count();
  results.push(['users in DB',          userCount,  userCount >= 2]);
  results.push(['customers in DB',      custCount,  true]);
  results.push(['orders in DB',         ordCount,   true]);
  results.push(['feedbacks in DB',      fbCount,    true]);

  // ── 2. Admin & Staff accounts ───────────────────────────────
  const admin = await prisma.user.findUnique({ where: { email: 'admin@cvprostudio.id' } });
  const staff = await prisma.user.findUnique({ where: { email: 'staff@cvprostudio.id' } });

  results.push(['admin user exists',    admin ? admin.email  : 'NOT FOUND',  !!admin]);
  results.push(['admin role = admin',   admin ? admin.role   : '–',           admin?.role === 'admin']);
  results.push(['staff user exists',    staff ? staff.email  : 'NOT FOUND',  !!staff]);
  results.push(['staff role = staff',   staff ? staff.role   : '–',           staff?.role === 'staff']);

  // ── 3. Password verification ─────────────────────────────────
  const adminPwd = admin ? await Bcrypt.compare('admin123', admin.password) : false;
  const staffPwd = staff ? await Bcrypt.compare('staff123', staff.password) : false;
  results.push(['admin password valid', 'admin123', adminPwd]);
  results.push(['staff password valid', 'staff123', staffPwd]);

  // ── 4. JWT round-trip ─────────────────────────────────────────
  let jwtAdmin = false, jwtStaff = false;
  try {
    const tok = JWT.generateToken({ id: 'x', email: admin?.email, role: 'admin' });
    const dec = JWT.verifyToken(tok);
    jwtAdmin = dec.role === 'admin';
  } catch(_) {}
  try {
    const tok = JWT.generateToken({ id: 'y', email: staff?.email, role: 'staff' });
    const dec = JWT.verifyToken(tok);
    jwtStaff = dec.role === 'staff';
  } catch(_) {}
  results.push(['JWT admin token OK',   'admin role', jwtAdmin]);
  results.push(['JWT staff token OK',   'staff role', jwtStaff]);

  // ── 5. Controllers load ───────────────────────────────────────
  const controllers = [
    'authController', 'feedbackController',
    'orderController', 'customerAuthController',
    'expenseController', 'settingsController',
  ];
  for (const name of controllers) {
    let ok = false;
    try { require('./src/controllers/' + name); ok = true; } catch(e) { results.push(['ctrl: ' + name, e.message.substring(0,40), false]); continue; }
    results.push(['ctrl: ' + name, 'loaded', ok]);
  }

  // ── 6. Routes load ────────────────────────────────────────────
  const routeNames = [
    'authRoutes', 'orderRoutes', 'feedbackRoutes',
    'customerRoutes', 'expenseRoutes', 'settingsRoutes',
  ];
  for (const name of routeNames) {
    let ok = false, count = 0;
    try { const r = require('./src/routes/' + name); count = r.stack.length; ok = true; } catch(e) { results.push(['route: ' + name, e.message.substring(0,40), false]); continue; }
    results.push(['route: ' + name, count + ' routes', ok]);
  }

  // ── 7. Frontend files exist ───────────────────────────────────
  const fs = require('fs');
  const frontendFiles = [
    'admin/login.html', 'admin/dashboard.html',
    'admin/orders.html', 'admin/feedback.html',
    'customer/login.html', 'customer/dashboard.html',
    'customer/feedback.html',
  ];
  for (const f of frontendFiles) {
    const exists = fs.existsSync(f);
    results.push(['file: ' + f, exists ? 'exists' : 'MISSING', exists]);
  }

  // ── 8. Sidebar links in admin pages ──────────────────────────
  const adminPages = ['dashboard', 'orders', 'expenses', 'reports', 'settings'];
  for (const p of adminPages) {
    const content = fs.existsSync('admin/' + p + '.html') ? fs.readFileSync('admin/' + p + '.html', 'utf8') : '';
    const hasFb = content.includes('feedback.html');
    results.push(['admin/' + p + '.html has feedback nav', hasFb ? 'yes' : 'NO', hasFb]);
  }

  // ── Print ─────────────────────────────────────────────────────
  console.log('\nCVPro Studio — Full System Verification');
  console.log('='.repeat(58));
  let passed = 0, failed = 0;
  for (const [name, val, ok] of results) {
    const icon = ok ? '✓' : '✗';
    const tag  = ok ? 'PASS' : 'FAIL';
    const disp = String(val).substring(0, 28);
    console.log(icon + ' [' + tag + '] ' + name.padEnd(38) + (disp ? '→ ' + disp : ''));
    ok ? passed++ : failed++;
  }
  console.log('='.repeat(58));
  console.log('Results: ' + passed + ' passed, ' + failed + ' failed');
  console.log(failed === 0 ? '\nALL CHECKS PASSED ✓' : '\nSOME CHECKS FAILED ✗');

  await prisma.$disconnect();
}

run().catch(e => { console.error('VERIFY ERROR:', e.message); process.exit(1); });
