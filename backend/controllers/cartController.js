const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
    
    if (!cart) {
      return res.status(200).json({
        status: 'success',
        data: {
          cart: {
            items: [],
            total: 0
          }
        }
      });
    }
    
    const total = cart.items.reduce((sum, item) => {
      return sum + (item.productId.price * item.quantity);
    }, 0);
    
    res.status(200).json({
      status: 'success',
      data: {
        cart: {
          items: cart.items,
          total
        }
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'No product found with that ID'
      });
    }
    
    if (product.inStock < quantity) {
      return res.status(400).json({
        status: 'fail',
        message: 'Not enough items in stock'
      });
    }
    
    let cart = await Cart.findOne({ userId: req.user._id });
    
    if (!cart) {
      cart = await Cart.create({
        userId: req.user._id,
        items: [{ productId, quantity }]
      });
    } else {
      const existingItemIndex = cart.items.findIndex(
        item => item.productId.toString() === productId
      );
      
      if (existingItemIndex >= 0) {
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
      
      await cart.save();
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        cart
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({
        status: 'fail',
        message: 'No cart found for this user'
      });
    }
    
    const itemIndex = cart.items.findIndex(
      item => item._id.toString() === req.params.itemId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'No item found with that ID in your cart'
      });
    }
    
    const product = await Product.findById(cart.items[itemIndex].productId);
    if (product.inStock < quantity) {
      return res.status(400).json({
        status: 'fail',
        message: 'Not enough items in stock'
      });
    }
    
    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        cart
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({
        status: 'fail',
        message: 'No cart found for this user'
      });
    }
    
    cart.items = cart.items.filter(
      item => item._id.toString() !== req.params.itemId
    );
    
    await cart.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        cart
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndDelete({ userId: req.user._id });
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};