const Prescription = require('../models/Prescription');

exports.uploadPrescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please upload a file'
      });
    }
    
    const prescription = await Prescription.create({
      userId: req.user._id,
      filePath: req.file.path
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        prescription
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getUserPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ userId: req.user._id }).sort('-createdAt');
    
    res.status(200).json({
      status: 'success',
      results: prescriptions.length,
      data: {
        prescriptions
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};