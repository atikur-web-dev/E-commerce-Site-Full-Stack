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

  // Fetch all products
  const fetchProducts = async (params = {}) => {
    setLoading(true);
    setError("");

    try {
      const response = await productAPI.getAll(params);
      setProducts(response.data.products || []);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to fetch products";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Fetch featured products
  const fetchFeaturedProducts = async () => {
    setLoading(true);

    try {
      const response = await productAPI.getFeatured();
      setFeaturedProducts(response.data.products || []);
      return { success: true, data: response.data };
    } catch (err) {
      console.error("Error fetching featured products:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Fetch single product by ID
  const fetchProductById = async (id) => {
    setLoading(true);
    setError("");

    try {
      const response = await productAPI.getById(id);
      setCurrentProduct(response.data.product);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Product not found";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Search products
  const searchProducts = async (query) => {
    setLoading(true);

    try {
      const response = await productAPI.search(query);
      setProducts(response.data.products || []);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Search failed";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories from products
  const getCategories = () => {
    const uniqueCategories = [
      ...new Set(products.map((product) => product.category)),
    ];
    setCategories(uniqueCategories);
    return uniqueCategories;
  };

  // Get products by category
  const fetchProductsByCategory = async (category) => {
    setLoading(true);

    try {
      const response = await productAPI.getByCategory(category);
      setProducts(response.data.products || []);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to fetch category products";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Clear current product
  const clearCurrentProduct = () => {
    setCurrentProduct(null);
  };

  // Initialize data
  useEffect(() => {
    const initializeProducts = async () => {
      await Promise.all([fetchProducts(), fetchFeaturedProducts()]);
    };

    initializeProducts();
  }, []);

  // Update categories when products change
  useEffect(() => {
    if (products.length > 0) {
      getCategories();
    }
  }, [products]);

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
