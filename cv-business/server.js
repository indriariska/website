require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const errorHandler = require('./src/middleware/errorHandler');
const notFound = require('./src/middleware/notFound');

const authRoutes = require('./src/routes/authRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const productRoutes = require('./src/routes/productRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const expenseRoutes = require('./src/routes/expenseRoutes');
const settingsRoutes = require('./src/routes/settingsRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

app.get('/', (req, res) => {
  res.json({
    message: 'Store Management API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      customers: '/api/customers',
      products: '/api/products',
      orders: '/api/orders',
      expenses: '/api/expenses',
      settings: '/api/settings',
      dashboard: '/api/dashboard',
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Serve admin static files
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// Serve customer website static files
app.use(express.static(path.join(__dirname, '.')));

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
