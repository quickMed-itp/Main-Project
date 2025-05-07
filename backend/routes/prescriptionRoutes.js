const express = require('express');
const uploadController = require('../controllers/uploadPrescription');
const authController = require('../controllers/authController');
const upload = require('../config/upload');

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .post(upload.single('prescription'), uploadController.uploadPrescription)
  .get(uploadController.getUserPrescriptions);

module.exports = router;