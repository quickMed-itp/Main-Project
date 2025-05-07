const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const OrderAdmin = require('../models/OrderAdmin');
const User = require('../models/User');

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
      if (product.inStock < item.quantity) {
        return res.status(400).json({
          status: 'fail',
          message: `Not enough stock for ${product.name}`
        });
      }
    }
    
    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.productId._id, {
        $inc: { inStock: -item.quantity }
      });
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
    
    const order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress: req.body.shippingAddress || req.user.address,
      status: 'pending'
    });

    // Get user information
    const user = await User.findById(req.user._id);
    
    // Create entry in OrderAdmin table
    await OrderAdmin.create({
      orderId: order._id.toString(),
      customer: user.name || user.email,
      date: new Date(),
      amount: totalAmount,
      status: 'shipped'
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
exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        status: 'fail',
        message: 'No order found with that ID'
      });
    }

    // Check if user is admin or the order owner
    if (req.user.role !== 'admin' && order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update this order'
      });
    }

    // Only allow status update for non-admin users
    if (req.user.role !== 'admin') {
      req.body = { status: req.body.status };
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('userId', 'name email');

    // Update OrderAdmin table if status is changed
    if (req.body.status) {
      await OrderAdmin.findOneAndUpdate(
        { orderId: req.params.id },
        { status: req.body.status }
      );
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        order: updatedOrder
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

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

    // Delete from both Order and OrderAdmin tables
    await Order.findByIdAndDelete(req.params.id);
    await OrderAdmin.findOneAndDelete({ orderId: req.params.id });
    
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