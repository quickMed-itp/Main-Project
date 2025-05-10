const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');
const { uploadProductFiles } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', productController.getAllProducts);

// Test email configuration (must be before :id route)
router.get('/test-email', productController.testEmailConfig);

// Get product by ID
router.get('/:id', productController.getProduct);

// Protected routes (admin only)
router.use(authController.protect);
router.use(authController.restrictTo('admin'));

// Create product route
router.post(
  '/',
  uploadProductFiles,
  productController.createProduct
);

// Update product route
router.patch(
  '/:id',
  uploadProductFiles,
  productController.updateProduct
);

// Add the new route for updating stock
router.patch('/:id/stock', productController.updateProductStock);

// Add new route for batch stock update
router.patch('/:productId/batch-stock', productController.updateBatchStock);

// Delete product route
router.delete('/:id', productController.deleteProduct);

// Low stock alert route
router.post('/low-stock-alert', productController.sendLowStockAlert);

// Restock request route
router.post('/restock-request', productController.sendRestockRequest);

module.exports = router;