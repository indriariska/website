/**
 * Diagnose the feedbacks table — run with: node check-db.js
 */
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // 1. Check actual DB columns
  const cols = await p.$queryRaw`
    SELECT column_name, data_type, column_default
    FROM information_schema.columns
    WHERE table_name = 'feedbacks'
    ORDER BY ordinal_position
  `;
  console.log('\nfeedbacks table columns in PostgreSQL:');
  cols.forEach(c => console.log(`  ${c.column_name}  (${c.data_type})  default=${c.column_default}`));

  // 2. Check total rows
  const total = await p.feedback.count();
  console.log('\nTotal feedback rows:', total);

  // 3. Try querying isPublished = true
  try {
    const pub = await p.feedback.findMany({ where: { isPublished: true } });
    console.log('Rows with isPublished=true:', pub.length);
    if (pub.length > 0) {
      console.log('First published item:', {
        id:          pub[0].id.substring(0,8),
        title:       pub[0].title,
        isPublished: pub[0].isPublished,
        publishedAt: pub[0].publishedAt,
      });
    }
  } catch (e) {
    console.error('isPublished query ERROR:', e.message);
  }

  // 4. Simulate getPublicFeedback
  try {
    const safe = await p.feedback.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true, title: true, message: true, rating: true,
        adminReply: true, publishedAt: true,
        customer: { select: { name: true } },
      },
    });
    console.log('\ngetPublicFeedback simulation — rows returned:', safe.length);
    safe.forEach((f, i) => console.log(`  [${i+1}] ${f.title} | rating=${f.rating} | customer=${f.customer?.name}`));
  } catch (e) {
    console.error('getPublicFeedback simulation ERROR:', e.message);
  }
}

main()
  .catch(e => { console.error('FATAL:', e.message); process.exit(1); })
  .finally(() => p.$disconnect());
