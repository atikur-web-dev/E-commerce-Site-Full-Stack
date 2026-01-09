// Frontend/src/context/ProductContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { productAPI } from "../services/api";

const ProductContext = createContext();

export const useProducts = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentProduct, setCurrentProduct] = useState(null);
  const [categories, setCategories] = useState([]);

  // ==================== FETCH ALL PRODUCTS ====================
  const fetchProducts = async (params = {}) => {
    setLoading(true);
    setError("");

    try {
      console.log(" [ProductContext] Fetching all products...");
      const response = await productAPI.getAllProducts();
      console.log(" [ProductContext] API Response:", response);

      let productsArray = [];

      // তোমার backend format: সরাসরি array বা { products: [...] }
      if (response && Array.isArray(response)) {
        // Case 1: Direct array
        productsArray = response;
        console.log(" [ProductContext] Format: Direct array");
      } else if (
        response &&
        response.products &&
        Array.isArray(response.products)
      ) {
        // Case 2: { products: [...] }
        productsArray = response.products;
        console.log(" [ProductContext] Format: { products: [...] }");
      } else if (
        response &&
        response.success &&
        Array.isArray(response.products)
      ) {
        // Case 3: { success: true, products: [...] }
        productsArray = response.products;
        console.log(
          " [ProductContext] Format: { success: true, products: [...] }"
        );
      } else if (response && response.data && Array.isArray(response.data)) {
        // Case 4: { data: [...] }
        productsArray = response.data;
        console.log(" [ProductContext] Format: { data: [...] }");
      } else {
        console.log(
          " [ProductContext] Unexpected format, defaulting to empty array:",
          response
        );
        productsArray = [];
      }

      console.log(
        ` [ProductContext] ${productsArray.length} products loaded`
      );
      setProducts(productsArray);

      // Extract categories
      const uniqueCategories = [
        ...new Set(productsArray.map((p) => p.category).filter(Boolean)),
      ];
      setCategories(uniqueCategories);

      return { success: true, products: productsArray };
    } catch (err) {
      console.error(" [ProductContext] Fetch error:", err);
      setError(err.message || "Failed to load products");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // ==================== FETCH FEATURED PRODUCTS ====================
  const fetchFeaturedProducts = async () => {
    try {
      console.log(" [ProductContext] Fetching featured products...");
      const response = await productAPI.getFeaturedProducts();
      console.log(" [ProductContext] Featured response:", response);

      let featuredArray = [];

      if (response && Array.isArray(response)) {
        featuredArray = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        featuredArray = response.data;
      } else if (
        response &&
        response.products &&
        Array.isArray(response.products)
      ) {
        featuredArray = response.products;
      }

      console.log(
        `⭐ [ProductContext] ${featuredArray.length} featured products loaded`
      );
      setFeaturedProducts(featuredArray);
      return { success: true, products: featuredArray };
    } catch (err) {
      console.error("[ProductContext] Featured products error:", err);
      return { success: false, error: err.message };
    }
  };

  // ==================== FETCH SINGLE PRODUCT (FIXED) ====================
  const fetchProductById = async (id) => {
    setLoading(true);
    setError("");
    setCurrentProduct(null);

    try {
      console.log(` [ProductContext] Fetching product ID: ${id}`);
      console.log(` [ProductContext] Calling: productAPI.getProduct(${id})`);

      const response = await productAPI.getProduct(id);
      console.log(" [ProductContext] Product API Response:", response);
      console.log(" [ProductContext] Response Type:", typeof response);
      console.log(" [ProductContext] Has _id?", response?._id ? "YES" : "NO");

      let productData = null;

      // তোমার backend সরাসরি product object return করে
      // Example: {_id: "6936fb9ba02e69839c4f7518", name: "iPhone 15 Pro Max", ...}
      if (response && response._id) {
        console.log(" [ProductContext] Format: Direct product object");
        productData = response;
      }
      // যদি wrapped format থাকে
      else if (response && response.product && response.product._id) {
        console.log(" [ProductContext] Format: Wrapped in 'product' field");
        productData = response.product;
      } else if (response && response.data && response.data._id) {
        console.log(" [ProductContext] Format: Wrapped in 'data' field");
        productData = response.data;
      } else if (
        response &&
        response.success &&
        response.product &&
        response.product._id
      ) {
        console.log(
          " [ProductContext] Format: { success: true, product: {...} }"
        );
        productData = response.product;
      } else {
        console.error(" [ProductContext] Unknown response format:", response);
        throw new Error("Product not found or invalid response format");
      }

      console.log(
        " [ProductContext] Setting product data:",
        productData.name
      );
      setCurrentProduct(productData);
      return { success: true, product: productData };
    } catch (err) {
      console.error(" [ProductContext] Product fetch error:", err);
      setError(err.message || "Product not found");
      return { success: false, error: err.message };
    } finally {
      console.log(" [ProductContext] Loading complete");
      setLoading(false);
    }
  };

  // ==================== SEARCH PRODUCTS ====================
  const searchProducts = async (query) => {
    setLoading(true);

    try {
      console.log(` [ProductContext] Searching for: "${query}"`);
      const response = await productAPI.searchProducts(query);

      let searchResults = [];

      if (response && Array.isArray(response)) {
        searchResults = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        searchResults = response.data;
      } else if (
        response &&
        response.products &&
        Array.isArray(response.products)
      ) {
        searchResults = response.products;
      }

      console.log(` [ProductContext] Found ${searchResults.length} results`);
      setProducts(searchResults);
      return { success: true, products: searchResults };
    } catch (err) {
      console.error("[ProductContext] Search error:", err);
      setError(err.message || "Search failed");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // ==================== GET CATEGORIES ====================
  const getCategories = () => {
    if (products.length > 0) {
      const uniqueCategories = [
        ...new Set(products.map((p) => p.category).filter(Boolean)),
      ];
      setCategories(uniqueCategories);
      return uniqueCategories;
    }
    return [];
  };

  // ==================== FETCH BY CATEGORY ====================
  const fetchProductsByCategory = async (category) => {
    setLoading(true);

    try {
      console.log(` [ProductContext] Fetching category: "${category}"`);
      const response = await productAPI.getProductsByCategory(category);

      let categoryProducts = [];

      if (response && Array.isArray(response)) {
        categoryProducts = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        categoryProducts = response.data;
      } else if (
        response &&
        response.products &&
        Array.isArray(response.products)
      ) {
        categoryProducts = response.products;
      }

      console.log(
        ` [ProductContext] ${categoryProducts.length} products in category`
      );
      setProducts(categoryProducts);
      return { success: true, products: categoryProducts };
    } catch (err) {
      console.error("[ProductContext] Category error:", err);
      setError(err.message || "Category error");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // ==================== CLEAR CURRENT PRODUCT ====================
  const clearCurrentProduct = () => {
    console.log(" [ProductContext] Clearing current product");
    setCurrentProduct(null);
  };

  // ==================== USE EFFECTS ====================
  // Initialize
  useEffect(() => {
    console.log(" [ProductContext] Initializing...");
    const initialize = async () => {
      await fetchProducts();
      await fetchFeaturedProducts();
    };
    initialize();
  }, []);

  // Update categories when products change
  useEffect(() => {
    if (products.length > 0) {
      getCategories();
    }
  }, [products]);

  // ==================== CONTEXT VALUE ====================
  const value = {
    // State
    products,
    featuredProducts,
    currentProduct,
    categories,
    loading,
    error,

    // Actions
    fetchProducts,
    fetchFeaturedProducts,
    fetchProductById,
    searchProducts,
    getCategories,
    fetchProductsByCategory,
    clearCurrentProduct,
  };

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
};
