const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const authRouter = require('./routes/authRoutes');
const productRouter = require('./routes/productRoutes');
const cartRouter = require('./routes/cartRoutes');
const orderRouter = require('./routes/orderRoutes');
const profileRouter = require('./routes/profileRoutes');
const prescriptionRouter = require('./routes/prescriptionRoutes');
const contactRouter = require('./routes/contactRoutes');
const feedbackRouter = require('./routes/feedbackRoutes');
const batchRoutes = require('./routes/batchRoutes');
const medicineRouter = require('./routes/medicineRoutes');
const userRoutes = require('./routes/userRoutes');
const supplierRouter = require('./routes/supplierRoutes');
const supportRouter = require('./routes/supportRoutes');

const globalErrorHandler = require('./utils/errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/profile', profileRouter);
app.use('/api/v1/prescriptions', prescriptionRouter);
app.use('/api/v1/feedback', feedbackRouter);
app.use('/api/v1/batches', batchRoutes);
app.use('/api/v1/medicines', medicineRouter);
app.use('/api/users', userRoutes);
app.use('/api/v1/suppliers', supplierRouter);
app.use('/api/v1/support', supportRouter);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Error handling
app.use(globalErrorHandler);

module.exports = app;