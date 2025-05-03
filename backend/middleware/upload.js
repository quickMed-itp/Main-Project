const multer = require('multer');
const path = require('path');
const AppError = require('../utils/appError');

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter to accept only certain file types
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new AppError(
        'Error: Only JPEG, JPG, PNG, and PDF files are allowed!',
        400
      ),
      false
    );
  }
};

// Initialize multer with configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

// Middleware to handle single file upload
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new AppError('File size exceeds 5MB limit', 400));
          }
          return next(new AppError(err.message, 400));
        } else if (err) {
          return next(new AppError(err.message, 400));
        }
      }
      next();
    });
  };
};

// Middleware to handle multiple file uploads
const uploadMultiple = (fieldName, maxCount) => {
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new AppError('File size exceeds 5MB limit', 400));
          }
          return next(new AppError(err.message, 400));
        } else if (err) {
          return next(new AppError(err.message, 400));
        }
      }
      next();
    });
  };
};

module.exports = {
  uploadSingle,
  uploadMultiple,
};