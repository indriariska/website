const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function cleanup() {
  const del = await p.order.deleteMany({});
  console.log('Deleted all orders:', del.count);
  const expDel = await p.expense.deleteMany({});
  console.log('Deleted expenses:', expDel.count);
  const setDel = await p.setting.deleteMany({});
  console.log('Deleted settings:', setDel.count);
  await p.$disconnect();
}

cleanup().catch(e => { console.error(e); process.exit(1); });
