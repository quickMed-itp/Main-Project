const Batch = require('../models/Batch');
const Product = require('../models/Product');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Validation middleware
const validateBatch = (req, res, next) => {
  const { batchNumber, manufacturingDate, expiryDate, quantity, costPrice, sellingPrice } = req.body;
  
  if (!batchNumber || !manufacturingDate || !expiryDate || !quantity || !costPrice || !sellingPrice) {
    return next(new AppError('Please provide all required batch fields', 400));
  }
  
  if (quantity < 0 || costPrice < 0 || sellingPrice < 0) {
    return next(new AppError('Quantity and prices must be positive numbers', 400));
  }
  
  const mfgDate = new Date(manufacturingDate);
  const expDate = new Date(expiryDate);
  
  if (mfgDate >= expDate) {
    return next(new AppError('Expiry date must be after manufacturing date', 400));
  }
  
  next();
};

// Get all batches for a product
exports.getProductBatches = catchAsync(async (req, res, next) => {
  const batches = await Batch.find({ productId: req.params.productId })
    .sort({ manufacturingDate: -1 });
  
  res.status(200).json({
    status: 'success',
    results: batches.length,
    data: {
      batches
    }
  });
});

// Get a specific batch
exports.getBatch = catchAsync(async (req, res, next) => {
  const batch = await Batch.findById(req.params.batchId);
  
  if (!batch) {
    return next(new AppError('No batch found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      batch
    }
  });
});

// Create a new batch
exports.createBatch = [validateBatch, catchAsync(async (req, res, next) => {
  const { productId, batchNumber, manufacturingDate, expiryDate, quantity, costPrice, sellingPrice } = req.body;
  
  const product = await Product.findById(productId);
  
  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  // Check if batch number already exists
  const existingBatch = await Batch.findOne({ batchNumber });
  if (existingBatch) {
    return next(new AppError('Batch number already exists', 400));
  }
  
  const batch = await Batch.create({
    productId,
    batchNumber,
    manufacturingDate,
    expiryDate,
    quantity,
    costPrice,
    sellingPrice,
    status: 'active'
  });
  
  // Update product's total stock
  const totalStock = await Batch.aggregate([
    { $match: { productId: product._id } },
    { $group: { _id: null, total: { $sum: '$quantity' } } }
  ]);
  
  product.totalStock = totalStock[0]?.total || 0;
  await product.save();
  
  res.status(201).json({
    status: 'success',
    data: {
      batch
    }
  });
})];

// Update a batch
exports.updateBatch = [validateBatch, catchAsync(async (req, res, next) => {
  const batch = await Batch.findByIdAndUpdate(req.params.batchId, req.body, {
    new: true,
    runValidators: true
  });
  
  if (!batch) {
    return next(new AppError('No batch found with that ID', 404));
  }
  
  // Update product's total stock
  const product = await Product.findById(batch.productId);
  const totalStock = await Batch.aggregate([
    { $match: { productId: product._id } },
    { $group: { _id: null, total: { $sum: '$quantity' } } }
  ]);
  
  product.totalStock = totalStock[0]?.total || 0;
  await product.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      batch
    }
  });
})];

// Delete a batch
exports.deleteBatch = catchAsync(async (req, res, next) => {
  const batch = await Batch.findById(req.params.batchId);
  
  if (!batch) {
    return next(new AppError('No batch found with that ID', 404));
  }
  
  await Batch.findByIdAndDelete(req.params.batchId);
  
  // Update product's total stock
  const product = await Product.findById(batch.productId);
  const totalStock = await Batch.aggregate([
    { $match: { productId: product._id } },
    { $group: { _id: null, total: { $sum: '$quantity' } } }
  ]);
  
  product.totalStock = totalStock[0]?.total || 0;
  await product.save();
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Get batches by status
exports.getBatchesByStatus = catchAsync(async (req, res, next) => {
  const { status } = req.params;
  
  if (!['active', 'expired', 'depleted'].includes(status)) {
    return next(new AppError('Invalid batch status', 400));
  }
  
  const batches = await Batch.find({ status })
    .populate('productId', 'name brand')
    .sort({ expiryDate: 1 });
  
  res.status(200).json({
    status: 'success',
    results: batches.length,
    data: {
      batches
    }
  });
});

// Get all batches
exports.getAllBatches = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const batches = await Batch.find()
    .populate('productId', 'name brand')
    .sort({ manufacturingDate: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Batch.countDocuments();

  res.status(200).json({
    status: 'success',
    results: batches.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: {
      batches
    }
  });
}); 