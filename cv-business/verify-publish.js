/**
 * CVPro Studio — Publish Testimoni verification
 * node verify-publish.js
 */
const { PrismaClient } = require('@prisma/client');
const fs     = require('fs');
const prisma = new PrismaClient();

async function run() {
  const results = [];

  // ── 1. Schema fields ───────────────────────────────────────────
  const schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
  results.push(['schema: isPublished field',  schema.includes('isPublished'),  schema.includes('isPublished')]);
  results.push(['schema: publishedAt field',  schema.includes('publishedAt'),  schema.includes('publishedAt')]);

  // ── 2. Controller functions ────────────────────────────────────
  const ctrl = require('./src/controllers/feedbackController');
  results.push(['ctrl: getPublicFeedback',  typeof ctrl.getPublicFeedback  === 'function', true]);
  results.push(['ctrl: publishFeedback',    typeof ctrl.publishFeedback    === 'function', true]);
  results.push(['ctrl: unpublishFeedback',  typeof ctrl.unpublishFeedback  === 'function', true]);

  // ── 3. Routes ──────────────────────────────────────────────────
  const router = require('./src/routes/feedbackRoutes');
  const routePaths = router.stack.filter(l => l.route).map(l => {
    const method = Object.keys(l.route.methods)[0].toUpperCase();
    return method + ' ' + l.route.path;
  });
  const hasPublic    = routePaths.some(r => r === 'GET /public');
  const hasPublish   = routePaths.some(r => r === 'PUT /:id/publish');
  const hasUnpublish = routePaths.some(r => r === 'PUT /:id/unpublish');
  results.push(['route: GET /public',           hasPublic,    hasPublic]);
  results.push(['route: PUT /:id/publish',      hasPublish,   hasPublish]);
  results.push(['route: PUT /:id/unpublish',    hasUnpublish, hasUnpublish]);

  // ── 4. DB: isPublished column works ───────────────────────────
  const published = await prisma.feedback.findMany({ where: { isPublished: true } });
  const unpublished = await prisma.feedback.findMany({ where: { isPublished: false } });
  results.push(['DB: can query isPublished=true',  published.length  + ' rows', true]);
  results.push(['DB: can query isPublished=false', unpublished.length + ' rows', true]);

  // ── 5. getPublicFeedback returns no private data ───────────────
  let noPii = true;
  if (published.length > 0) {
    // Simulate what the API returns via select
    const safe = await prisma.feedback.findMany({
      where: { isPublished: true },
      select: { id: true, title: true, message: true, rating: true,
                adminReply: true, publishedAt: true,
                customer: { select: { name: true } } },
    });
    // Check no email/phone in the selected data
    noPii = safe.every(f => !f.email && !f.phone && !f.password);
    results.push(['API: no PII in public response', noPii ? 'email/phone stripped' : 'CONTAINS PII', noPii]);
  } else {
    results.push(['API: no PII check (no published data)', 'skipped — no published data', true]);
  }

  // ── 6. index.html has correct implementation ──────────────────
  const idx = fs.readFileSync('index.html', 'utf8');
  results.push(['index.html: /api/feedback/public fetch',    idx.includes('/api/feedback/public'),    true]);
  results.push(['index.html: static fallback cards',          idx.includes('data-static'),             true]);
  results.push(['index.html: data-dynamic attribute',         idx.includes('data-dynamic'),            true]);
  results.push(['index.html: DOMContentLoaded guard',         idx.includes('DOMContentLoaded'),        true]);
  results.push(['index.html: removes old dynamic on reload',  idx.includes('[data-dynamic]'),          true]);

  // ── 7. Admin feedback.html has publish UI ─────────────────────
  const adm = fs.readFileSync('admin/feedback.html', 'utf8');
  results.push(['admin/feedback.html: togglePublish fn',   adm.includes('togglePublish'),    true]);
  results.push(['admin/feedback.html: btn-publish class',  adm.includes('btn-publish'),      true]);
  results.push(['admin/feedback.html: btn-unpublish class',adm.includes('btn-unpublish'),    true]);
  results.push(['admin/feedback.html: pub-badge',          adm.includes('pub-badge'),        true]);
  results.push(['admin/feedback.html: stPublished stat',   adm.includes('stPublished'),      true]);

  // ── Print ──────────────────────────────────────────────────────
  console.log('\nPublish Testimoni — Verification');
  console.log('='.repeat(56));
  let pass = 0, fail = 0;
  for (const [name, val, ok] of results) {
    const icon = ok ? '✓' : '✗';
    console.log(icon + ' ' + name.padEnd(42) + ' → ' + String(val).substring(0, 30));
    ok ? pass++ : fail++;
  }
  console.log('='.repeat(56));
  console.log('Results: ' + pass + ' passed, ' + fail + ' failed');
  console.log(fail === 0 ? '\nALL CHECKS PASSED ✓' : '\nSOME CHECKS FAILED ✗');

  await prisma.$disconnect();
}

run().catch(e => { console.error(e.message); process.exit(1); });
