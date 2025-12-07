import React, { useState, useEffect } from "react";
import { useProducts } from "../../context/ProductContext";
import ProductCard from "../../components/products/ProductCard/ProductCard";
import "./Shop.css";

const Shop = () => {
  const {
    products,
    categories,
    loading,
    error,
    fetchProducts,
    fetchProductsByCategory,
    searchProducts,
  } = useProducts();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchProducts(searchQuery);
    } else {
      fetchProducts();
    }
  };

  // Handle category filter
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category === "all") {
      fetchProducts();
    } else {
      fetchProductsByCategory(category);
    }
  };

  // Handle sort
  const handleSortChange = (sortType) => {
    setSortBy(sortType);
    const params = {};

    switch (sortType) {
      case "price-low":
        params.sort = "price";
        break;
      case "price-high":
        params.sort = "-price";
        break;
      case "rating":
        params.sort = "-rating";
        break;
      default:
        params.sort = "-createdAt";
    }

    fetchProducts(params);
  };

  // Sort products locally for display
  const getSortedProducts = () => {
    let sorted = [...products];

    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price);
      case "rating":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "newest":
      default:
        return sorted;
    }
  };

  const sortedProducts = getSortedProducts();

  return (
    <div className="shop-page">
      {/* Hero Section */}
      <div className="shop-hero">
        <h1>Our Products</h1>
        <p>Discover amazing products at great prices</p>
      </div>

      {/* Filters and Search */}
      <div className="shop-filters">
        <div className="filters-container">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="search-bar">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              🔍
            </button>
          </form>

          {/* Category Filter */}
          <div className="category-filter">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="category-select"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div className="sort-filter">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="shop-content">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button onClick={() => fetchProducts()} className="retry-button">
              Try Again
            </button>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="no-products">
            <p>No products found. Try a different search or category.</p>
          </div>
        ) : (
          <>
            <div className="products-count">
              <p>Showing {sortedProducts.length} products</p>
            </div>

            <div className="products-grid">
              {sortedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Shop;
