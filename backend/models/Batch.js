const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, 'Supplier is required']
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
  remainingQuantity: {
    type: Number,
    required: [true, 'Remaining quantity is required'],
    min: [0, 'Remaining quantity cannot be negative']
  },
  costPrice: {
    type: Number,
    required: [true, 'Cost price is required'],
    min: [0.01, 'Cost price must be at least 0.01']
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Selling price is required'],
    min: [0.01, 'Selling price must be at least 0.01']
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
batchSchema.index({ supplierId: 1 });

// Middleware to check expiry date and remaining quantity
batchSchema.pre('save', function(next) {
  if (this.manufacturingDate >= this.expiryDate) {
    next(new Error('Expiry date must be after manufacturing date'));
  }
  if (this.remainingQuantity > this.quantity) {
    this.remainingQuantity = this.quantity;
  }
  next();
});

const Batch = mongoose.model('Batch', batchSchema);

module.exports = Batch; 