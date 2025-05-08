const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  batchNumber: {
    type: String,
    required: [true, 'Batch number is required'],
    unique: true
  },
  manufacturingDate: {
    type: Date,
    required: [true, 'Manufacturing date is required']
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  costPrice: {
    type: Number,
    required: [true, 'Cost price is required'],
    min: [0, 'Cost price cannot be negative']
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Selling price is required'],
    min: [0, 'Selling price cannot be negative']
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'depleted'],
    default: 'active'
  }
}, { timestamps: true });

// Index for faster queries
batchSchema.index({ productId: 1, batchNumber: 1 }, { unique: true });
batchSchema.index({ expiryDate: 1 });

// Middleware to check expiry date
batchSchema.pre('save', function(next) {
  if (this.manufacturingDate >= this.expiryDate) {
    next(new Error('Expiry date must be after manufacturing date'));
  }
  next();
});

module.exports = mongoose.model('Batch', batchSchema); 