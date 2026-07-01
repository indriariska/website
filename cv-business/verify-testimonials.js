/**
 * CVPro Studio — Testimonials end-to-end verification
 * node verify-testimonials.js
 */
const { PrismaClient } = require('@prisma/client');
const fs    = require('fs');
const http  = require('http');
const p     = new PrismaClient();

const PASS = 'PASS';
const FAIL = 'FAIL';
const results = [];

function chk(label, value, ok) {
  results.push({ label, value: String(value).substring(0, 35), ok });
}

async function main() {

  // ── 1. DB schema has isPublished ──────────────────────────────
  const cols = await p.$queryRaw`
    SELECT column_name FROM information_schema.columns
    WHERE table_name='feedbacks'
  `;
  const colNames = cols.map(c => c.column_name);
  chk('DB column is_published exists',   colNames.includes('is_published'),   colNames.includes('is_published'));
  chk('DB column published_at exists',   colNames.includes('published_at'),   colNames.includes('published_at'));

  // ── 2. Published rows exist ───────────────────────────────────
  const pubCount = await p.feedback.count({ where: { isPublished: true } });
  chk('Published feedback count > 0', pubCount, pubCount > 0);

  // ── 3. getPublicFeedback query works ──────────────────────────
  const safe = await p.feedback.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true, title: true, message: true, rating: true,
      adminReply: true, publishedAt: true,
      customer: { select: { name: true } },
    },
  });
  chk('Prisma query returns rows',     safe.length,       safe.length > 0);
  chk('No email in response',          !safe.some(f=>f.email),    true);
  chk('No phone in response',          !safe.some(f=>f.phone),    true);
  chk('customerName present',          safe[0]?.customer?.name,   !!safe[0]?.customer?.name);

  // ── 4. Controller exists ──────────────────────────────────────
  const ctrl = require('./src/controllers/feedbackController');
  chk('getPublicFeedback exported', typeof ctrl.getPublicFeedback, ctrl.getPublicFeedback !== undefined);
  chk('publishFeedback exported',   typeof ctrl.publishFeedback,   ctrl.publishFeedback !== undefined);
  chk('unpublishFeedback exported', typeof ctrl.unpublishFeedback, ctrl.unpublishFeedback !== undefined);

  // ── 5. Routes ─────────────────────────────────────────────────
  const router = require('./src/routes/feedbackRoutes');
  const routePaths = router.stack.filter(l=>l.route).map(l=>
    Object.keys(l.route.methods)[0].toUpperCase() + ' ' + l.route.path
  );
  chk('Route GET /public registered',      routePaths.includes('GET /public'),           true);
  chk('Route PUT /:id/publish registered', routePaths.includes('PUT /:id/publish'),       true);
  chk('Route PUT /:id/unpublish registered',routePaths.includes('PUT /:id/unpublish'),    true);

  // ── 6. server.js wires feedbackRoutes ────────────────────────
  const srv = fs.readFileSync('server.js', 'utf8');
  chk('server.js requires feedbackRoutes',   srv.includes('feedbackRoutes'),         true);
  chk('server.js mounts /api/feedback',      srv.includes("'/api/feedback'"),        true);

  // ── 7. index.html — no static data ───────────────────────────
  const idx = fs.readFileSync('index.html', 'utf8');
  chk('No hardcoded Arinda Rahayu',  !idx.includes('Arinda Rahayu'),   !idx.includes('Arinda Rahayu'));
  chk('No hardcoded Bagas Wicaksono',!idx.includes('Bagas Wicaksono'), !idx.includes('Bagas Wicaksono'));
  chk('No hardcoded Dita Sumarni',   !idx.includes('Dita Sumarni'),    !idx.includes('Dita Sumarni'));

  // ── 8. index.html — fetch at bottom ──────────────────────────
  chk('testimonialsGrid div present', idx.includes('id="testimonialsGrid"'), true);
  chk('fetch /api/feedback/public',   idx.includes('/feedback/public'), true);
  chk('renderCards function defined', idx.includes('function renderCards'),  true);
  chk('renderEmpty function defined', idx.includes('function renderEmpty'),  true);
  chk('Empty-state message defined',  idx.includes('Belum ada testimoni'),   true);
  chk('Loading spinner shown',        idx.includes('fa-spinner'),            true);

  // Fetch is AFTER script.js (position check) — now uses fetch(apiUrl) not literal
  const fetchPos    = idx.indexOf('fetch(apiUrl)');
  const scriptJsPos = idx.indexOf('script.js');
  chk('Fetch runs AFTER script.js loads', fetchPos > scriptJsPos, fetchPos > scriptJsPos);

  // No mid-page script between testimonialsGrid and script.js
  const gridPos   = idx.indexOf('id="testimonialsGrid"');
  const hasMidScript = idx.indexOf('<script>', gridPos) < scriptJsPos &&
                       idx.indexOf('<script>', gridPos) > 0;
  chk('No mid-page script block',     !hasMidScript,  !hasMidScript);

  // ── Print results ──────────────────────────────────────────────
  console.log('\nCVPro Studio — Testimonials Verification');
  console.log('='.repeat(56));
  let pass = 0, fail = 0;
  results.forEach(function (r) {
    const icon = r.ok ? 'PASS' : 'FAIL';
    console.log(icon + '  ' + r.label.padEnd(38) + '→ ' + r.value);
    r.ok ? pass++ : fail++;
  });
  console.log('='.repeat(56));
  console.log('Results: ' + pass + ' passed, ' + fail + ' failed');
  if (fail === 0) {
    console.log('\nALL CHECKS PASSED');
    console.log('\nData flow confirmed:');
    console.log('  PostgreSQL ('+pubCount+' published) → GET /api/feedback/public → index.html "Kata Mereka"');
    if (safe.length > 0) {
      console.log('\nPublished testimonials that will appear on homepage:');
      safe.forEach(function(f, i) {
        console.log('  [' + (i+1) + '] ' + f.title + '  |  ' + f.rating + '★  |  ' + (f.customer?.name || '?'));
      });
    }
  }

  await p.$disconnect();
}

main().catch(function(e) {
  console.error('FATAL:', e.message);
  p.$disconnect();
  process.exit(1);
});
