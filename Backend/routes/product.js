import express from 'express';
import { uploadSingle, uploadMultiple, checkFileUpload } from '../middleware/upload.js';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory,
  uploadProductImage,
  uploadMultipleImages,
  deleteProductImage,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProductById);

// Protected routes
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

// Image Upload Routes
router.post('/upload', protect, admin, uploadSingle, checkFileUpload, uploadProductImage);
router.post('/upload-multiple', protect, admin, uploadMultiple, checkFileUpload, uploadMultipleImages);
router.delete('/image/:publicId', protect, admin, deleteProductImage);

export default router;
