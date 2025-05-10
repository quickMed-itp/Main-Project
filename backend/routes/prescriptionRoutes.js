const express = require('express');
const uploadController = require('../controllers/uploadPrescription');
const authController = require('../controllers/authController');
const upload = require('../config/upload');

const router = express.Router();

// Protect all routes
router.use(authController.protect);

// User routes
router
  .route('/')
  .post(upload.array('prescription', 3), uploadController.uploadPrescription)
  .get(uploadController.getUserPrescriptions);

// Admin routes
router.get('/admin/all', authController.restrictTo('admin'), uploadController.getAllPrescriptions);

router
  .route('/:id')
  .get(uploadController.getPrescriptionById)
  .patch(upload.array('prescription', 3), uploadController.updatePrescription)
  .delete(uploadController.deletePrescription);

// Admin/Pharmacy routes
router
  .route('/:id/status')
  .patch(
    authController.restrictTo('admin', 'pharmacy'),
    uploadController.updatePrescriptionStatus
  );

module.exports = router;