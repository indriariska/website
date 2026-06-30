/**
 * CVPro Studio — Express Server
 * Service-based CV & Portfolio business backend.
 */
require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const rateLimit = require('express-rate-limit');
const path     = require('path');
const fs       = require('fs');

const errorHandler = require('./src/middleware/errorHandler');
const notFound     = require('./src/middleware/notFound');

const authRoutes      = require('./src/routes/authRoutes');
const orderRoutes     = require('./src/routes/orderRoutes');
const expenseRoutes   = require('./src/routes/expenseRoutes');
const settingsRoutes  = require('./src/routes/settingsRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const customerRoutes  = require('./src/routes/customerRoutes');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Ensure uploads directories exist ─────────────────────────────
const uploadsDir  = path.join(__dirname, 'uploads');
const deliveryDir = path.join(__dirname, 'uploads', 'delivery');
if (!fs.existsSync(uploadsDir))  fs.mkdirSync(uploadsDir,  { recursive: true });
if (!fs.existsSync(deliveryDir)) fs.mkdirSync(deliveryDir, { recursive: true });

// ── Security & parsing ────────────────────────────────────────────
app.use(helmet({
  // Allow inline scripts/styles for the admin panel
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static file serving ───────────────────────────────────────────
app.use('/uploads', express.static(uploadsDir));

// ── Rate limiting ─────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

// ── API routes ────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/orders',    orderRoutes);
app.use('/api/expenses',  expenseRoutes);
app.use('/api/settings',  settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/customer',  customerRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CVPro Studio API is running',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth:      '/api/auth',
      orders:    '/api/orders',
      expenses:  '/api/expenses',
      settings:  '/api/settings',
      dashboard: '/api/dashboard',
      customer:  '/api/customer',
    },
  });
});

// ── Serve admin & customer-facing static files ───────────────────
app.use('/admin',    express.static(path.join(__dirname, 'admin')));
app.use('/customer', express.static(path.join(__dirname, 'customer')));
app.use(express.static(path.join(__dirname, '.')));

// ── Error handlers ────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\nCVPro Studio API running on port ${PORT}`);
  console.log(`Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
