const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');
const { uploadProductFiles } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', productController.getAllProducts);
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

// Delete product route
router.delete('/:id', productController.deleteProduct);

module.exports = router;