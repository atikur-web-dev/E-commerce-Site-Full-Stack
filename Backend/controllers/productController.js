// Backend/controllers/productController.js
import Product from "../models/Product.js";
import asyncHandler from "express-async-handler";
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  try {
    console.log(" Fetching all products...");
    const products = await Product.find({});

    // Debug: Check first product's images
    if (products.length > 0) {
      console.log(" First product data:", {
        name: products[0].name,
        images: products[0].images,
        imagesType: typeof products[0].images,
        imagesLength: products[0].images?.length
      });
    }

    console.log(` Total products: ${products.length}`);
    res.json(products);
  } catch (error) {
    console.error(" Get Products Error:", error);
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

    console.log(` [API] Category requested: "${category}"`);

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
      ` [API] Found ${products.length} products for "${decodedCategory}"`
    );

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
    console.log(` Fetching product by ID: ${req.params.id}`);
    
    const product = await Product.findById(req.params.id);

    if (product) {
      console.log(" Product found:", {
        name: product.name,
        hasImages: !!product.images,
        images: product.images,
        imagesLength: product.images?.length
      });
      
      res.json(product);
    } else {
      console.log(" Product not found for ID:", req.params.id);
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(" Get Product By ID Error:", error);
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
    console.log(` Featured products: ${products.length}`);
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
    console.log(" Creating new product...");
    
    // Handle images - convert to array format
    let imagesArray = [];
    
    if (req.body.images && Array.isArray(req.body.images)) {
      imagesArray = req.body.images;
    } else if (req.body.images && typeof req.body.images === 'string') {
      imagesArray = [req.body.images];
    } else if (req.body.image) {
      imagesArray = [req.body.image];
    } else {
      imagesArray = ["/default-product.jpg"];
    }
    
    console.log("📸 Product images to save:", imagesArray);

    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      brand: req.body.brand,
      images: imagesArray, // Use images array
      stock: req.body.stock || 0,
      rating: 0,
      numReviews: 0,
      specifications: req.body.specifications || {},
      warranty: req.body.warranty || 12,
      isFeatured: req.body.isFeatured || false,
      isNewArrival: req.body.isNewArrival || true,
      isBestSeller: req.body.isBestSeller || false,
    });

    const createdProduct = await product.save();
    
    console.log(" Product created successfully:", createdProduct._id);
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error(" Create Product Error:", error);
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
    console.log(`✏️ Updating product: ${req.params.id}`);
    
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = req.body.name || product.name;
      product.description = req.body.description || product.description;
      product.price = req.body.price || product.price;
      product.category = req.body.category || product.category;
      product.brand = req.body.brand || product.brand;
      
      // Handle images update
      if (req.body.images !== undefined) {
        if (Array.isArray(req.body.images)) {
          product.images = req.body.images;
        } else if (typeof req.body.images === 'string') {
          product.images = [req.body.images];
        }
        console.log("📸 Updated images:", product.images);
      }
      
      product.stock = req.body.stock || product.stock;
      product.specifications = req.body.specifications || product.specifications;
      product.warranty = req.body.warranty || product.warranty;
      product.isFeatured = req.body.isFeatured !== undefined ? req.body.isFeatured : product.isFeatured;
      product.isNewArrival = req.body.isNewArrival !== undefined ? req.body.isNewArrival : product.isNewArrival;
      product.isBestSeller = req.body.isBestSeller !== undefined ? req.body.isBestSeller : product.isBestSeller;

      const updatedProduct = await product.save();
      
      console.log(" Product updated successfully");
      res.json(updatedProduct);
    } else {
      console.log(" Product not found for update");
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(" Update Product Error:", error);
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
      console.log(" Product deleted:", req.params.id);
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

export const testCloudinaryConnection = asyncHandler(async (req, res) => {
  try {
    console.log(' Testing Cloudinary connection...');
    
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    
    if (!cloudName || !apiKey) {
      return res.status(400).json({
        success: false,
        message: 'Cloudinary credentials are not configured',
        missing: {
          cloudName: !cloudName,
          apiKey: !apiKey,
          apiSecret: !process.env.CLOUDINARY_API_SECRET,
        },
        help: 'Please check your .env file for CLOUDINARY_* variables',
      });
    }
    
    const configCheck = {
      cloudName: cloudName,
      apiKeyPresent: !!apiKey,
      apiSecretPresent: !!process.env.CLOUDINARY_API_SECRET,
    };
    
    console.log(' Cloudinary configuration check:', configCheck);
    
    res.status(200).json({
      success: true,
      message: 'Cloudinary connection test successful',
      timestamp: new Date().toISOString(),
      configuration: configCheck,
    });
    
  } catch (error) {
    console.error(' Unexpected error in testCloudinaryConnection:', error);
    res.status(500).json({
      success: false,
      message: 'Unexpected error occurred',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});