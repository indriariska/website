/**
 * CVPro Studio — WhatsApp Link Generator
 * Builds a wa.me link with a pre-filled, structured message.
 */

const ADMIN_WA = '6283122172584';

/**
 * Generate a WhatsApp consultation link for an order.
 * @param {object} order  — Prisma Order record (or partial)
 * @param {string} [customMessage] — Optional extra message from customer
 * @returns {string} Full wa.me URL
 */
function generateWhatsAppLink(order, customMessage) {
  const orderId      = order.id            ? order.id.substring(0, 8).toUpperCase() : '–';
  const customerName = order.customerName  || '–';
  const serviceType  = order.serviceType   || '–';
  const status       = order.status        || '–';
  const message      = customMessage || order.revisionNote || '';

  const text = [
    'Halo Admin CVPro Studio,',
    '',
    'Saya ingin konsultasi / revisi order.',
    '',
    `Order ID  : ${orderId}`,
    `Nama      : ${customerName}`,
    `Layanan   : ${serviceType}`,
    `Status    : ${status}`,
    message ? `Pesan     : ${message}` : null,
    '',
    'Mohon bantuan admin. Terima kasih.',
  ]
    .filter(line => line !== null)
    .join('\n');

  return `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(text)}`;
}

/**
 * Attach whatsappLink to an order object (non-destructive).
 * Returns a new object — original is untouched.
 */
function withWhatsAppLink(order, customMessage) {
  if (!order) return order;
  return {
    ...order,
    whatsappLink: generateWhatsAppLink(order, customMessage),
  };
}

module.exports = { generateWhatsAppLink, withWhatsAppLink, ADMIN_WA };
