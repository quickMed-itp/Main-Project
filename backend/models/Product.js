const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [3, 'Product name must be at least 3 characters long']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true
  },
  brand: {
    type: String,
    required: [true, 'Product brand is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: {
      values: ['medicine', 'supplements', 'equipment'],
      message: 'Category must be either medicine, supplements, or equipment'
    }
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  mainImage: {
    type: String,
    required: [true, 'Product main image is required']
  },
  subImages: [{
    type: String
  }],
  totalStock: {
    type: Number,
    default: 0,
    min: 0
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
productSchema.index({ name: 1, brand: 1 }, { unique: true });
productSchema.index({ category: 1 });
productSchema.index({ totalStock: 1 });

// Virtual populate for batches
productSchema.virtual('batches', {
  ref: 'Batch',
  localField: '_id',
  foreignField: 'productId'
});

// Update timestamps on save
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);