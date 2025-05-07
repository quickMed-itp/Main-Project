const Product = require('../models/Product');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const mongoose = require('mongoose');

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
  
  res.status(200).json({
    status: 'success',
    data: {
      product
    }
  });
});

// Create new product
// Create new product
exports.createProduct = catchAsync(async (req, res, next) => {
  const files = req.files;
  
  if (!files?.mainImage) {
    return next(new AppError('Please upload a main image for the product', 400));
  }

  const productData = {
    ...req.body,
    mainImage: files.mainImage[0].path
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