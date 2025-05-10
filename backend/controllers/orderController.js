const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const Batch = require('../models/Batch');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Helper function to send out-of-stock email
const sendOutOfStockEmail = async (product, quantity) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const emailSubject = `Out of Stock Alert: ${product.name}`;
  const emailBody = `
    <h2>Out of Stock Alert</h2>
    <p>The following product is out of stock:</p>
    <ul>
      <li><strong>Product:</strong> ${product.name}</li>
      <li><strong>Required Quantity:</strong> ${quantity}</li>
      <li><strong>Current Stock:</strong> ${product.stock}</li>
      <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
    </ul>
    <p>Please place an order with the supplier to restock this product.</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: emailSubject,
      html: emailBody
    });
    console.log(`Out of stock email sent for ${product.name}`);
  } catch (error) {
    console.error('Error sending out of stock email:', error);
  }
};

// Get all orders (Admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort('-createdAt');
    
    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: {
        orders
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Helper function to generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
};

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ 
        status: 'fail',
        message: 'Your cart is empty'
      });
    }
    
    // Check stock availability
    for (const item of cart.items) {
      const product = await Product.findById(item.productId._id);
      if (product.totalStock < item.quantity) {
        return res.status(400).json({
          status: 'fail',
          message: `Not enough stock for ${product.name}`
        });
      }
    }
    
    const orderItems = cart.items.map(item => ({
      productId: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      quantity: item.quantity
    }));
    
    const totalAmount = orderItems.reduce(
      (sum, item) => sum + (item.price * item.quantity), 0
    );

    // Get user information
    const user = await User.findById(req.user._id);
    
    // Generate order number and set default payment method if not provided
    const orderNumber = generateOrderNumber();
    const paymentMethod = req.body.paymentMethod || 'visa'; // Default to visa if not specified
    
    const order = await Order.create({
      userId: req.user._id,
      orderNumber,
      customer: user.name || user.email,
      items: orderItems,
      totalAmount,
      shippingAddress: req.body.shippingAddress || req.user.address,
      status: 'pending',
      paymentMethod,
      paymentDetails: req.body.paymentDetails || {
        cardType: paymentMethod,
        lastFourDigits: '****'
      }
    });
    
    // Clear the cart
    await Cart.findByIdAndDelete(cart._id);
    
    res.status(201).json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('items.productId');
    
    if (!order) {
      return res.status(404).json({
        status: 'fail',
        message: 'No order found with that ID'
      });
    }

    // Check if user is admin or the order owner
    if (req.user.role !== 'admin' && order.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to view this order'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Update order
exports.updateOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status, updateStock } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // If the order is being shipped and stock needs to be updated
  if (status === 'shipped' && updateStock) {
    // Update stock for each item in the order
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return next(new AppError(`Product not found: ${item.productId}`, 404));
      }

      // Find the first batch with available stock
      const batch = await Batch.findOne({
        productId: item.productId,
        remainingQuantity: { $gt: 0 },
        status: 'active'
      }).sort({ manufacturingDate: 1 }); // Get the oldest batch first (FIFO)

      if (!batch) {
        // Send out of stock email
        await sendOutOfStockEmail(product, item.quantity);
        return next(new AppError(`No stock available for product: ${product.name}`, 400));
      }

      // Check if batch has enough stock
      if (batch.remainingQuantity < item.quantity) {
        // Calculate remaining quantity needed
        const remainingNeeded = item.quantity - batch.remainingQuantity;
        // Send out of stock email with remaining quantity needed
        await sendOutOfStockEmail(product, remainingNeeded);
        return next(new AppError(`Insufficient stock in batch for product: ${product.name}`, 400));
      }

      // Update batch stock
      batch.remainingQuantity -= item.quantity;
      if (batch.remainingQuantity === 0) {
        batch.status = 'depleted';
      }
      await batch.save();

      // Update product stock
      product.stock -= item.quantity;
      await product.save();

      // Check if product stock is below threshold (e.g., 20% of typical order quantity)
      const stockThreshold = Math.max(10, Math.ceil(item.quantity * 0.2));
      if (product.stock <= stockThreshold) {
        // Send low stock alert email
        await sendOutOfStockEmail(product, item.quantity);
      }
    }
  }

  // Update order status
  order.status = status;
  await order.save();

  // Populate the updated order
  const updatedOrder = await Order.findById(id)
    .populate('userId', 'name email')
    .populate('items.productId', 'name price');

  res.status(200).json({
    status: 'success',
    data: {
      order: updatedOrder
    }
  });
});

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        status: 'fail',
        message: 'No order found with that ID'
      });
    }

    // Only admin can delete orders
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to delete orders'
      });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { inStock: item.quantity }
      });
    }

    await Order.findByIdAndDelete(req.params.id);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('items.productId')
      .sort('-createdAt');
    
    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: {
        orders
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};