// Backend/routes/product.js - COMPLETE CORRECT VERSION
import express from "express";
import {
  getProducts,
  getProductsByCategory,
  getProductById,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  // Week 4, Day 2: Image Upload Functions
  uploadProductImage,
  uploadMultipleImages,
  deleteProductImage,
  testCloudinaryConnection,
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/auth.js";
import { uploadSingle, uploadMultiple, checkFileUpload } from "../middleware/upload.js";

const router = express.Router();

// ====================== SPECIFIC ROUTES FIRST ======================

// ✅ MUST BE FIRST: Test Cloudinary connection
router.get("/test-upload", protect, admin, testCloudinaryConnection);

// ✅ Image Upload Routes
router.post(
  "/upload",
  protect,
  admin,
  uploadSingle,
  checkFileUpload,
  uploadProductImage
);

router.post(
  "/upload-multiple",
  protect,
  admin,
  uploadMultiple,
  checkFileUpload,
  uploadMultipleImages
);

router.delete("/image/:publicId", protect, admin, deleteProductImage);

// ✅ Featured products route
router.get("/featured", getFeaturedProducts);

// ✅ Category products route
router.get("/category/:category", getProductsByCategory);

// ====================== DYNAMIC ROUTES LAST ======================

// Get all products & Create product (DYNAMIC - MUST BE LAST)
router.route("/")
  .get(getProducts)
  .post(protect, admin, createProduct);

// Get single product, Update, Delete (DYNAMIC - MUST BE LAST)
router.route("/:id")
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

export default router;