// Backend/middleware/upload.js
import multer from 'multer';
import path from 'path';

// Configure storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter,
});

// Single file upload
export const uploadSingle = upload.single('image');

// Multiple files upload
export const uploadMultiple = upload.array('images', 10); // max 10 files

// Middleware to check if file exists
export const checkFileUpload = (req, res, next) => {
  if (!req.file && !req.files) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded. Please upload an image.',
    });
  }
  next();
};