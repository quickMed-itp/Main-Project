const Batch = require('../models/Batch');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Generate unique batch number
const generateBatchNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `BATCH-${timestamp}-${random}`;
};

// Validation middleware
const validateBatch = (req, res, next) => {
  const { manufacturingDate, expiryDate, quantity, costPrice, sellingPrice } = req.body;
  
  if (!manufacturingDate || !expiryDate || !quantity || !costPrice || !sellingPrice) {
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

// Update batch status based on remainingQuantity
const updateBatchStatus = async (batch) => {
  if (batch.remainingQuantity <= 0) {
    batch.status = 'depleted';
  } else if (new Date(batch.expiryDate) <= new Date()) {
    batch.status = 'expired';
  } else {
    batch.status = 'active';
  }
  await batch.save();
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
  const batch = await Batch.findById(req.params.batchId)
    .populate('productId', 'name brand')
    .populate('supplierId', 'name');
  
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
exports.createBatch = catchAsync(async (req, res, next) => {
  const {
    productId,
    supplierId,
    batchNumber,
    manufacturingDate,
    expiryDate,
    quantity,
    costPrice,
    sellingPrice
  } = req.body;

  // Validate required fields
  if (!productId || !supplierId || !batchNumber || !manufacturingDate || !expiryDate || !quantity || !costPrice || !sellingPrice) {
    return next(new AppError('All fields are required', 400));
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  // Check if supplier exists
  const supplier = await Supplier.findById(supplierId);
  if (!supplier) {
    return next(new AppError('Supplier not found', 404));
  }

  // Check if batch number already exists
  const existingBatch = await Batch.findOne({ batchNumber });
  if (existingBatch) {
    return next(new AppError('Batch number already exists', 400));
  }

  // Create new batch
  const batch = await Batch.create({
    productId,
    supplierId,
    batchNumber,
    manufacturingDate,
    expiryDate,
    quantity,
    remainingQuantity: quantity,
    costPrice,
    sellingPrice
  });

  // Update product stock
  product.stock += quantity;
  await product.save();

  res.status(201).json({
    status: 'success',
    data: {
      batch
    }
  });
});

// Update a batch
exports.updateBatch = catchAsync(async (req, res, next) => {
  const { batchId } = req.params;
  const {
    supplierId,
    manufacturingDate,
    expiryDate,
    quantity,
    costPrice,
    sellingPrice
  } = req.body;

  // Find the batch
  const batch = await Batch.findById(batchId);
  if (!batch) {
    return next(new AppError('Batch not found', 404));
  }

  // Check if supplier exists if being updated
  if (supplierId) {
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return next(new AppError('Supplier not found', 404));
    }
  }

  // Calculate stock difference
  const stockDifference = quantity - batch.quantity;

  // Update batch
  const updatedBatch = await Batch.findByIdAndUpdate(
    batchId,
    {
      supplierId: supplierId || batch.supplierId,
      manufacturingDate: manufacturingDate || batch.manufacturingDate,
      expiryDate: expiryDate || batch.expiryDate,
      quantity: quantity || batch.quantity,
      remainingQuantity: quantity || batch.quantity,
      costPrice: costPrice || batch.costPrice,
      sellingPrice: sellingPrice || batch.sellingPrice
    },
    { new: true, runValidators: true }
  );

  if (!updatedBatch) {
    return next(new AppError('Failed to update batch', 400));
  }

  // Update product stock if quantity changed
  if (stockDifference !== 0) {
    const product = await Product.findById(batch.productId);
    if (product) {
      product.stock += stockDifference;
      await product.save();
    }
  }

  // Populate the updated batch with product and supplier details
  const populatedBatch = await Batch.findById(updatedBatch._id)
    .populate('productId', 'name brand')
    .populate('supplierId', 'name');

  res.status(200).json({
    status: 'success',
    data: {
      batch: populatedBatch
    }
  });
});

// Update batch stock
exports.updateBatchStock = catchAsync(async (req, res, next) => {
  const { quantity } = req.body;
  const batch = await Batch.findById(req.params.batchId);
  
  if (!batch) {
    return next(new AppError('No batch found with that ID', 404));
  }

  // Update remainingQuantity
  batch.remainingQuantity += quantity;
  
  // Ensure remainingQuantity doesn't exceed quantity
  if (batch.remainingQuantity > batch.quantity) {
    return next(new AppError('Remaining quantity cannot exceed total quantity', 400));
  }
  
  // Ensure remainingQuantity doesn't go below 0
  if (batch.remainingQuantity < 0) {
    return next(new AppError('Insufficient stock in batch', 400));
  }

  // Update status based on remainingQuantity
  await updateBatchStatus(batch);
  
  // Update product's total stock
  const product = await Product.findById(batch.productId);
  const totalStock = await Batch.aggregate([
    { $match: { productId: product._id } },
    { $group: { _id: null, total: { $sum: '$remainingQuantity' } } }
  ]);
  
  product.totalStock = totalStock[0]?.total || 0;
  await product.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      batch
    }
  });
});

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
    { $group: { _id: null, total: { $sum: '$remainingQuantity' } } }
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
  const batches = await Batch.find()
    .populate('productId', 'name brand')
    .populate('supplierId', 'name');

  res.status(200).json({
    status: 'success',
    results: batches.length,
    data: {
      batches
    }
  });
});

// Get batches expiring within 7 days
exports.getExpiringBatches = catchAsync(async (req, res, next) => {
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  
  const batches = await Batch.find({
    expiryDate: { $lte: sevenDaysFromNow },
    status: 'active'
  })
    .populate('productId', 'name brand')
    .sort({ expiryDate: 1 });
  
  // Emit the expiring batches event
  const io = req.app.get('io');
  if (io) {
    io.emit('expiringBatches', {
      batches: batches.map(batch => ({
        id: batch._id,
        productName: batch.productId.name,
        batchNumber: batch.batchNumber,
        expiryDate: batch.expiryDate,
        daysUntilExpiry: Math.ceil((new Date(batch.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      }))
    });
  }
  
  res.status(200).json({
    status: 'success',
    results: batches.length,
    data: {
      batches
    }
  });
}); 