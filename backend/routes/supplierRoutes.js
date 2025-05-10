const express = require('express');
const supplierController = require('../controllers/supplierController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(supplierController.getAllSuppliers)
  .post(supplierController.createSupplier);

router
  .route('/:id')
  .get(supplierController.getSupplier)
  .patch(supplierController.updateSupplier)
  .delete(supplierController.deleteSupplier);

router.get('/stats/supplier-stats', supplierController.getSupplierStats);

module.exports = router; 