const ORDER_STATUS = {
  MENUNGGU_VERIFIKASI: 'menunggu_verifikasi',
  DIPROSES:           'diproses',
  SELESAI:            'selesai',
  DITOLAK:            'ditolak',
};

const PAYMENT_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};

const PAYMENT_METHODS = {
  BCA: { icon: 'fas fa-university', color: '#005BAC', name: 'Bank BCA' },
  BSI: { icon: 'fas fa-mosque', color: '#00873E', name: 'Bank BSI' },
  BRI: { icon: 'fas fa-building', color: '#003DA5', name: 'Bank BRI' },
  MANDIRI: { icon: 'fas fa-landmark', color: '#003087', name: 'Bank Mandiri' },
  DANA: { icon: 'fas fa-wallet', color: '#108EE9', name: 'DANA' },
  GOPAY: { icon: 'fas fa-mobile-alt', color: '#00AED6', name: 'GoPay' },
};

const TEMPLATE_TYPE = {
  CV: 'CV',
  PORTOFOLIO: 'Portofolio',
};

const TEMPLATE_CATEGORY = {
  BASIC: 'Basic',
  STANDARD: 'Standard',
  PREMIUM: 'Premium',
  PROFESSIONAL: 'Professional',
};

module.exports = {
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  TEMPLATE_TYPE,
  TEMPLATE_CATEGORY,
};
