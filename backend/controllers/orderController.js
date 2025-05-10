const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const Batch = require('../models/Batch');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const nodemailer = require('nodemailer');
const { sendOrderRequestEmail } = require('../utils/emailService');

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

// Get all orders (admin only)
exports.getAllOrders = catchAsync(async (req, res, next) => {
  try {
    const { status, startDate, endDate, search } = req.query;
    
    // Build query
    const query = {};
    
    // Filter by status if provided
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Filter by date range if provided
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }
    
    // Search by order number or customer name
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get orders with populated fields
    const orders = await Order.find(query)
      .populate({
        path: 'customer',
        select: 'name email phone'
      })
      .populate({
        path: 'items.product',
        select: 'name brand category price'
      })
      .sort({ createdAt: -1 });
    
    // Calculate summary statistics
    const summary = {
      total: orders.length,
      pending: orders.filter(order => order.status === 'pending').length,
      processing: orders.filter(order => order.status === 'processing').length,
      shipped: orders.filter(order => order.status === 'shipped').length,
      delivered: orders.filter(order => order.status === 'delivered').length,
      cancelled: orders.filter(order => order.status === 'cancelled').length,
      totalAmount: orders.reduce((sum, order) => sum + order.totalAmount, 0)
    };
    
    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: {
        orders,
        summary
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    next(new AppError('Error fetching orders: ' + error.message, 500));
  }
});

// Helper function to generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
};

// Create new order
exports.createOrder = catchAsync(async (req, res, next) => {
  const { items, shippingAddress, paymentMethod } = req.body;
  const userId = req.user.id;

  // Validate items
  if (!items || !Array.isArray(items) || items.length === 0) {
    return next(new AppError('Please provide order items', 400));
    }
    
  // Calculate total amount and validate stock
  let totalAmount = 0;
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      return next(new AppError(`Product not found: ${item.product}`, 404));
      }

    if (product.totalStock < item.quantity) {
      return next(new AppError(`Insufficient stock for ${product.name}`, 400));
    }

    totalAmount += product.price * item.quantity;
  }

  // Create order
    const order = await Order.create({
    user: userId,
    items,
      totalAmount,
    shippingAddress,
    paymentMethod
  });

  // Populate order details for email
  const populatedOrder = await Order.findById(order._id)
    .populate('user', 'name email')
    .populate('items.product', 'name price');

  // Send order request email
  try {
    await sendOrderRequestEmail({
      orderNumber: order._id,
      items: populatedOrder.items,
      totalAmount: order.totalAmount,
      customerName: populatedOrder.user.name,
      customerEmail: populatedOrder.user.email
    });
  } catch (error) {
    console.error('Error sending order request email:', error);
    // Don't fail the order creation if email fails
  }
    
    res.status(201).json({
      status: 'success',
      data: {
        order
      }
    });
    });

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

  const order = await Order.findById(id).populate('items.productId');
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

      // Update product total stock
      const updatedProduct = await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { totalStock: -item.quantity } },
        { new: true }
      );

      if (!updatedProduct) {
        return next(new AppError(`Failed to update stock for product: ${product.name}`, 500));
    }

      // Check if product stock is below threshold (e.g., 20% of typical order quantity)
      const stockThreshold = Math.max(10, Math.ceil(item.quantity * 0.2));
      if (updatedProduct.totalStock <= stockThreshold) {
        // Send low stock alert email
        await sendOutOfStockEmail(updatedProduct, item.quantity);
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

// Cancel order
exports.cancelOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    return next(new AppError('No order found with that ID', 404));
  }

  // Check if user is authorized to cancel this order
  if (req.user.role !== 'admin' && order.customer.toString() !== req.user._id.toString()) {
    return next(new AppError('You are not authorized to cancel this order', 403));
  }

  // Check if order can be cancelled
  if (!['pending', 'processing'].includes(order.status)) {
    return next(new AppError('This order cannot be cancelled', 400));
  }

  // Update order status
  order.status = 'cancelled';
  await order.save();

  // Populate the updated order
  const updatedOrder = await Order.findById(order._id)
    .populate('customer', 'name email')
    .populate('items.product', 'name price');

  res.status(200).json({
    status: 'success',
    data: {
      order: updatedOrder
    }
  });
});