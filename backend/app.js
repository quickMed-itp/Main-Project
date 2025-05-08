const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');

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

const globalErrorHandler = require('./utils/errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/profile', profileRouter);
app.use('/api/v1/prescriptions', prescriptionRouter);
app.use('/api/v1/contact', contactRouter);
app.use('/api/v1/feedback', feedbackRouter);
app.use('/api/v1/batches', batchRoutes);
app.use('/api/v1/medicines', medicineRouter);

// Error handling
app.use(globalErrorHandler);

module.exports = app;