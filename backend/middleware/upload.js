const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/appError');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
    // Store only the filename in req.file.path
    req.file = req.file || {};
    req.file.filename = filename;
    cb(null, filename);
  },
});

// File filter to accept only certain file types
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new AppError(
        'Error: Only JPEG, JPG, and PNG files are allowed!',
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

// Combined middleware for product file uploads
const uploadProductFiles = (req, res, next) => {
  upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'subImages', maxCount: 5 }
  ])(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('File size exceeds 5MB limit', 400));
        }
        return next(new AppError(err.message, 400));
      }
      return next(new AppError(err.message, 400));
    }

    // Modify the file paths to store only filenames
    if (req.files) {
      if (req.files.mainImage) {
        req.files.mainImage[0].path = req.files.mainImage[0].filename;
      }
      if (req.files.subImages) {
        req.files.subImages.forEach(file => {
          file.path = file.filename;
        });
      }
    }
    next();
  });
};

module.exports = {
  uploadProductFiles
};