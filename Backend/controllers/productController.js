// Backend/controllers/productController.js
import Product from "../models/Product.js";
import asyncHandler from "express-async-handler";

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
