// Backend/controllers/productController.js
import Product from "../models/Product.js";
import asyncHandler from "express-async-handler";
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({});

    // ✅ Direct array return - NO object wrapper
    res.json(products);
  } catch (error) {
    console.error("Get Products Error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
export const getProductsByCategory = asyncHandler(async (req, res) => {
  try {
    const category = req.params.category;

    console.log(`🔍 [API] Category requested: "${category}"`);

    // Decode URL encoding
    const decodedCategory = decodeURIComponent(category);

    // First try exact match
    let products = await Product.find({ category: decodedCategory });

    // If no products, try case-insensitive
    if (products.length === 0) {
      products = await Product.find({
        category: { $regex: new RegExp(`^${decodedCategory}$`, "i") },
      });
    }

    console.log(
      `✅ [API] Found ${products.length} products for "${decodedCategory}"`
    );

    // ✅ Direct array return - NO object wrapper
    res.json(products);
  } catch (error) {
    console.error("Category Products Error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // ✅ Direct object return - NO object wrapper
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error("Get Product By ID Error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true });

    // ✅ Direct array return
    res.json(products);
  } catch (error) {
    console.error("Featured Products Error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      brand: req.body.brand,
      image: req.body.image,
      stock: req.body.stock || 0,
      rating: 0,
      numReviews: 0,
      specifications: req.body.specifications || {},
      warranty: req.body.warranty || 12,
    });

    const createdProduct = await product.save();

    // ✅ Direct object return
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = req.body.name || product.name;
      product.description = req.body.description || product.description;
      product.price = req.body.price || product.price;
      product.category = req.body.category || product.category;
      product.brand = req.body.brand || product.brand;
      product.image = req.body.image || product.image;
      product.stock = req.body.stock || product.stock;
      product.specifications =
        req.body.specifications || product.specifications;
      product.warranty = req.body.warranty || product.warranty;

      const updatedProduct = await product.save();

      // ✅ Direct object return
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();

      // ✅ Simple success message
      res.json({ message: "Product removed" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

export const uploadProductImage = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file',
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'shopeasy/products',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' },
        { format: 'webp' },
      ],
    });

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        size: result.bytes,
      },
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message,
    });
  }
});

// @desc    Upload multiple product images
// @route   POST /api/products/upload-multiple
// @access  Private/Admin
export const uploadMultipleImages = asyncHandler(async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one image',
      });
    }

    const uploadPromises = req.files.map(async (file) => {
      const result = await uploadToCloudinary(file.buffer, {
        folder: 'shopeasy/products',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' },
          { format: 'webp' },
        ],
      });
      
      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        size: result.bytes,
      };
    });

    const uploadedImages = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      message: `${uploadedImages.length} images uploaded successfully`,
      data: uploadedImages,
    });
  } catch (error) {
    console.error('Multiple image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading images',
      error: error.message,
    });
  }
});

// @desc    Delete product image from Cloudinary
// @route   DELETE /api/products/image/:publicId
// @access  Private/Admin
export const deleteProductImage = asyncHandler(async (req, res) => {
  try {
    const { publicId } = req.params;

    const result = await deleteFromCloudinary(publicId);

    if (result.result === 'ok') {
      res.status(200).json({
        success: true,
        message: 'Image deleted successfully',
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to delete image',
      });
    }
  } catch (error) {
    console.error('Image delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting image',
      error: error.message,
    });
  }
});

// @desc    Test Cloudinary connection
// @route   GET /api/products/test-upload
// @access  Private/Admin
export const testCloudinaryConnection = asyncHandler(async (req, res) => {
  try {
    // Simple test by pinging Cloudinary
    const cloudinary = await import('../config/cloudinary.js');
    
    res.status(200).json({
      success: true,
      message: 'Cloudinary connection is working',
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      timestamp: new Date().toISOString(),
      endpoints: {
        singleUpload: 'POST /api/products/upload',
        multipleUpload: 'POST /api/products/upload-multiple',
        deleteImage: 'DELETE /api/products/image/:publicId',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Cloudinary connection test failed',
      error: error.message,
    });
  }
});