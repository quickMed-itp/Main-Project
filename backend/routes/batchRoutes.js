const express = require('express');
const batchController = require('../controllers/batchController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes
router.use(authController.protect);
router.use(authController.restrictTo('admin'));

// Batch routes
router
  .route('/')
  .get(batchController.getBatchesByStatus);

router
  .route('/:status')
  .get(batchController.getBatchesByStatus);

router
  .route('/product/:productId')
  .get(batchController.getProductBatches)
  .post(batchController.createBatch);

router
  .route('/:batchId')
  .get(batchController.getBatch)
  .patch(batchController.updateBatch)
  .delete(batchController.deleteBatch);

module.exports = router; 