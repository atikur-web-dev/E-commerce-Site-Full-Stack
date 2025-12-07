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
      console.log("🔄 Fetching all products...");
      const response = await productAPI.getAllProducts();
      console.log("📥 API Response:", response);

      // ✅ FIX: Backend returns { success: true, products: [...], count: 3 }
      let productsArray = [];

      if (response && response.success && Array.isArray(response.products)) {
        productsArray = response.products;
        console.log("✅ Using response.products, count:", productsArray.length);
      } else if (response && Array.isArray(response)) {
        productsArray = response;
        console.log("✅ Using direct array, count:", productsArray.length);
      } else if (response && response.data && Array.isArray(response.data)) {
        productsArray = response.data;
        console.log("✅ Using response.data, count:", productsArray.length);
      } else {
        console.log("⚠️ Unexpected format:", response);
        productsArray = [];
      }

      console.log("📦 Final products:", productsArray);
      setProducts(productsArray);

      return { success: true, products: productsArray };
    } catch (err) {
      console.error("❌ Error:", err);
      setError(err.message || "Failed to load products");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // ==================== FETCH FEATURED PRODUCTS ====================
  const fetchFeaturedProducts = async () => {
    try {
      const response = await productAPI.getFeaturedProducts();
      const featuredArray = response.data || [];
      setFeaturedProducts(featuredArray);
      return { success: true, products: featuredArray };
    } catch (err) {
      console.error("Featured products error:", err);
      return { success: false, error: err.message };
    }
  };

  // ==================== FETCH SINGLE PRODUCT ====================
  const fetchProductById = async (id) => {
    setLoading(true);
    setError("");

    try {
      const response = await productAPI.getProduct(id);
      const product = response.data || response;
      setCurrentProduct(product);
      return { success: true, product };
    } catch (err) {
      setError(err.message || "Product not found");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // ==================== SEARCH PRODUCTS ====================
  const searchProducts = async (query) => {
    setLoading(true);

    try {
      const response = await productAPI.searchProducts(query);
      const searchResults = response.data || [];
      setProducts(searchResults);
      return { success: true, products: searchResults };
    } catch (err) {
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
      const response = await productAPI.getProductsByCategory(category);
      const categoryProducts = response.data || [];
      setProducts(categoryProducts);
      return { success: true, products: categoryProducts };
    } catch (err) {
      setError(err.message || "Category error");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // ==================== CLEAR CURRENT PRODUCT ====================
  const clearCurrentProduct = () => {
    setCurrentProduct(null);
  };

  // ==================== USE EFFECTS ====================
  // Initialize
  useEffect(() => {
    const initialize = async () => {
      await fetchProducts();
      await fetchFeaturedProducts();
    };
    initialize();
  }, []);

  // Update categories
  useEffect(() => {
    getCategories();
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
