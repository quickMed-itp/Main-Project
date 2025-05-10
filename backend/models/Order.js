const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customer: {
    type: String,
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  shippingAddress: {
    label: String,
    houseNumber: String,
    streetName: String,
    villageArea: String,
    townCity: String,
    district: String,
    postalCode: String,
    fullAddress: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['visa', 'mastercard'],
    required: true
  },
  paymentDetails: {
    cardType: String,
    lastFourDigits: String
  },
  trackingNumber: {
    type: String
  },
  adminNotes: {
    type: String
  },
  estimatedDelivery: {
    type: Date
  },
  actualDelivery: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Add virtual for formatted date
orderSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString();
});

// Add method to update status
orderSchema.methods.updateStatus = async function(newStatus) {
  this.status = newStatus;
  if (newStatus === 'delivered') {
    this.actualDelivery = new Date();
  }
  return this.save();
};

// Add method to add admin notes
orderSchema.methods.addAdminNote = async function(note) {
  this.adminNotes = note;
  return this.save();
};

// Add method to update tracking
orderSchema.methods.updateTracking = async function(trackingNumber) {
  this.trackingNumber = trackingNumber;
  return this.save();
};

module.exports = mongoose.model('Order', orderSchema);