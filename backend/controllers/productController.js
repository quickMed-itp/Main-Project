const Product = require('../models/Product');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const { sendLowStockAlert, sendRestockRequestEmail, testEmailConfiguration } = require('../utils/emailService');
const Batch = require('../models/Batch');
const Supplier = require('../models/Supplier');

// Helper function to calculate total stock from batches
const calculateTotalStock = async (productId) => {
  const product = await Product.findById(productId).populate('batches');
  if (!product) return 0;

  // Sum up all valid batches (not expired and active)
  const totalStock = product.batches.reduce((sum, batch) => {
    if (batch.status === 'active' && new Date(batch.expiryDate) > new Date()) {
      return sum + (batch.remainingQuantity || 0);
    }
    return sum;
  }, 0);

  // Get total ordered quantity
  const orders = await Order.find({
    'items.product': productId,
    status: { $in: ['pending', 'processing', 'shipped'] }
  });

  const orderedQuantity = orders.reduce((sum, order) => {
    const orderItem = order.items.find(item => item.product.toString() === productId.toString());
    return sum + (orderItem ? orderItem.quantity : 0);
  }, 0);

  // Update product with calculated stock
  const finalStock = Math.max(0, totalStock - orderedQuantity);
  await Product.findByIdAndUpdate(productId, { totalStock: finalStock });

  return finalStock;
};

// Validation middleware
const validateProduct = (req, res, next) => {
  const { name, description, brand, category, price } = req.body;
  
  if (!name || !description || !brand || !category || !price) {
    return next(new AppError('Please provide all required fields', 400));
  }
  
  if (name.length < 3) {
    return next(new AppError('Product name must be at least 3 characters long', 400));
  }
  
  if (!['medicine', 'supplements', 'equipment'].includes(category)) {
    return next(new AppError('Invalid category', 400));
  }

  if (isNaN(price) || price < 0) {
    return next(new AppError('Price must be a positive number', 400));
  }
  
  next();
};

// Get all products with filters
exports.getAllProducts = catchAsync(async (req, res) => {
  const { category, search, brand, stockStatus } = req.query;
  
  let query = {};
  
  if (category && category !== 'all') {
    query.category = category;
  }
  
  if (brand && brand !== 'all') {
    query.brand = brand;
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (stockStatus) {
    switch (stockStatus) {
      case 'low':
        query.totalStock = { $lt: 10 };
        break;
      case 'out':
        query.totalStock = 0;
        break;
      case 'in':
        query.totalStock = { $gt: 0 };
        break;
    }
  }
  
  const products = await Product.find(query)
    .populate({
      path: 'batches',
      select: 'batchNumber manufacturingDate expiryDate quantity status',
      options: { sort: { manufacturingDate: -1 } }
    })
    .sort({ updatedAt: -1 });

  // Update stock for each product
  for (const product of products) {
    await calculateTotalStock(product._id);
  }
  
  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products
    }
  });
});

// Get product by ID
exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate({
      path: 'batches',
      select: 'batchNumber manufacturingDate expiryDate quantity costPrice sellingPrice status',
      options: { sort: { manufacturingDate: -1 } }
    });
  
  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  // Update stock
  await calculateTotalStock(product._id);
  
  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
});

// Create new product
exports.createProduct = catchAsync(async (req, res, next) => {
  const files = req.files;
  
  if (!files?.mainImage) {
    return next(new AppError('Please upload a main image for the product', 400));
  }

  const productData = {
    ...req.body,
    mainImage: files.mainImage[0].path,
    totalStock: 0 // Initialize total stock
  };

  // Handle optional subImages
  if (files.subImages) {
    productData.subImages = files.subImages.map(file => file.path);
  }

  const newProduct = await Product.create(productData);
  
  res.status(201).json({
    status: 'success',
    data: {
      product: newProduct
    }
  });
});

// Update product
exports.updateProduct = catchAsync(async (req, res, next) => {
  const updateData = { ...req.body };
  const files = req.files;
  
  // Handle optional main image update
  if (files?.mainImage) {
    updateData.mainImage = files.mainImage[0].path;
  }
  
  // Handle optional sub-images update
  if (files?.subImages) {
    updateData.subImages = files.subImages.map(file => file.path);
  }
  
  const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  });
  
  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  // Update stock after product update
  await calculateTotalStock(product._id);
  
  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
});

// Delete product
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }
  
  // Delete all batches related to this product
  await mongoose.model('Batch').deleteMany({ productId: product._id });
  
  // TODO: Delete associated images from storage
  
  await product.deleteOne();
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Send low stock alert
exports.sendLowStockAlert = catchAsync(async (req, res) => {
  const { products } = req.body;

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid or empty products data'
    });
  }

  // Filter products with low stock (less than 10)
  const lowStockProducts = products.filter(product => product.totalStock < 10);

  if (lowStockProducts.length === 0) {
    return res.status(200).json({
      status: 'success',
      message: 'No products with low stock found'
    });
  }

  try {
    await sendLowStockAlert(lowStockProducts);
    res.status(200).json({
      status: 'success',
      message: `Low stock alert sent for ${lowStockProducts.length} products`
    });
  } catch (emailError) {
    console.error('Email sending failed:', emailError);
    throw new AppError('Failed to send email alert: ' + emailError.message, 500);
  }
});

// Update product stock
exports.updateProductStock = catchAsync(async (req, res, next) => {
  const { quantity } = req.body;
  const productId = req.params.id;

  if (!quantity || typeof quantity !== 'number') {
    return next(new AppError('Please provide a valid quantity', 400));
  }

  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  // Update total stock
  product.totalStock = Math.max(0, product.totalStock + quantity);
  await product.save();

  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
});

// Update product batch stock
exports.updateBatchStock = catchAsync(async (req, res, next) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  // Find the product
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Find the first batch with available stock
  const batch = await Batch.findOne({
    productId,
    remainingQuantity: { $gt: 0 },
    status: 'active'
  }).sort({ manufacturingDate: 1 }); // Get the oldest batch first (FIFO)

  if (!batch) {
    return next(new AppError('No stock available in any batch', 400));
  }

  // Check if batch has enough stock
  if (batch.remainingQuantity < Math.abs(quantity)) {
    return next(new AppError('Insufficient stock in batch', 400));
  }

  // Update batch stock
  batch.remainingQuantity += quantity; // quantity is negative for reduction
  if (batch.remainingQuantity === 0) {
    batch.status = 'depleted';
  }
  await batch.save();

  // Update product total stock
  product.totalStock += quantity;
  await product.save();

  // Return updated product
  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
});

// Send restock request to supplier
exports.sendRestockRequest = async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No products provided for restock request'
      });
    }

    // Get the last 30 days of shipped orders for demand analysis
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrders = await Order.find({
      status: 'shipped',
      createdAt: { $gte: thirtyDaysAgo }
    }).populate({
      path: 'items.product',
      select: 'name brand category'
    });

    // Calculate demand for each product
    const productDemand = {};
    recentOrders.forEach(order => {
      order.items.forEach(item => {
        if (!item.product) return; // Skip if product is not populated
        const productId = item.product._id.toString();
        if (!productDemand[productId]) {
          productDemand[productId] = {
            totalQuantity: 0,
            orderCount: 0
          };
        }
        productDemand[productId].totalQuantity += item.quantity;
        productDemand[productId].orderCount += 1;
      });
    });

    // Prepare products for restock request
    const restockProducts = products.map(product => {
      const demand = productDemand[product._id] || { totalQuantity: 0, orderCount: 0 };
      const averageDailyDemand = demand.totalQuantity / 30;
      const safetyStock = Math.max(averageDailyDemand * 7, 10); // 7 days safety stock, minimum 10 units
      const recommendedQuantity = Math.max(
        Math.ceil(safetyStock * 2), // Minimum order quantity
        Math.ceil(safetyStock - product.totalStock) // Required to reach safety stock
      );

      return {
        name: product.name,
        brand: product.brand,
        category: product.category,
        currentStock: product.totalStock,
        recommendedQuantity,
        demandAnalysis: {
          averageDailyDemand: averageDailyDemand.toFixed(2),
          totalOrders: demand.orderCount,
          totalQuantity: demand.totalQuantity
        }
      };
    });

    // Send email with restock request
    try {
      await sendRestockRequestEmail(restockProducts);
      res.status(200).json({
        status: 'success',
        message: `Restock request sent for ${restockProducts.length} products`,
        data: {
          products: restockProducts,
          emailSent: true
        }
      });
    } catch (emailError) {
      console.error('Error sending restock request email:', emailError);
      // Still return success but indicate email wasn't sent
      res.status(200).json({
        status: 'success',
        message: `Restock request processed for ${restockProducts.length} products (Email not sent)`,
        data: {
          products: restockProducts,
          emailSent: false,
          emailError: emailError.message
        }
      });
    }
  } catch (error) {
    console.error('Error processing restock request:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error processing restock request: ' + error.message
    });
  }
};

// Test email configuration
exports.testEmailConfig = async (req, res) => {
  try {
    const result = await testEmailConfiguration();
    res.status(200).json({
      status: 'success',
      message: 'Test email sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Error testing email configuration:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error testing email configuration: ' + error.message
    });
  }
};