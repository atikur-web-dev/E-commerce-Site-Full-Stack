import Product from "../models/Product.js";

// @desc    Get all products - SIMPLE VERSION
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    console.log("📦 Getting products...");

    // SIMPLE: Just find all products
    const products = await Product.find({});

    console.log(`✅ Found ${products.length} products`);

    // SIMPLE response format
    res.json({
      success: true,
      products: products, // Direct products array
      count: products.length,
    });
  } catch (error) {
    console.error("❌ Get Products Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json({
        success: true,
        product: product,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
  } catch (error) {
    console.error("Get Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true }).limit(4);

    res.json({
      success: true,
      products: products,
      count: products.length,
    });
  } catch (error) {
    console.error("Featured Products Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
export const getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({
      category: req.params.category,
    });

    res.json({
      success: true,
      products: products,
      category: req.params.category,
      count: products.length,
    });
  } catch (error) {
    console.error("Category Products Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Other functions (optional)
export const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    const createdProduct = await product.save();

    res.status(201).json({
      success: true,
      product: createdProduct,
      message: "Product created successfully",
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      Object.keys(req.body).forEach((key) => {
        product[key] = req.body[key];
      });

      const updatedProduct = await product.save();

      res.json({
        success: true,
        product: updatedProduct,
        message: "Product updated successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({
        success: true,
        message: "Product deleted successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
