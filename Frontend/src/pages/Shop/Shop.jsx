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

  // Handle sort - REMOVE THIS FUNCTION
  // Since we don't have backend sorting, we'll sort locally
  const handleSortChange = (sortType) => {
    setSortBy(sortType);
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
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case "newest":
      default:
        return sorted;
    }
  };

  const sortedProducts = getSortedProducts();

  // Debug info
  useEffect(() => {
    console.log("🛒 Shop Component:");
    console.log("   Products:", products.length);
    console.log("   Categories:", categories);
    console.log("   Loading:", loading);
    console.log("   Error:", error);
  }, [products, loading, error]);

  return (
    <div className="shop-page">
      {/* Hero Section */}
      {/* Hero Section */}
      <div className="shop-hero">
        <h1>TechHub Pro Store</h1>
        <p>
          Premium Tech Products - Smartphones • Laptops • PC Components •
          Accessories
        </p>
        <div className="tech-tags">
          <span className="tech-tag">🚀 Latest Technology</span>
          <span className="tech-tag">⚡ Fast Delivery</span>
          <span className="tech-tag">🛡️ 1 Year Warranty</span>
          <span className="tech-tag">💯 Authentic Products</span>
        </div>
      </div>

      {/* Debug Info - Remove after testing */}
      <div
        style={{
          background: "#f0f0f0",
          padding: "10px",
          margin: "10px",
          borderRadius: "5px",
        }}
      >
        <small>
          Products: {products.length} | Categories: {categories.length} |
          Loading: {loading ? "Yes" : "No"} | Error: {error || "None"}
        </small>
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

          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="category-select"
          >
            <option value="all">All Tech Products</option>
            <option value="Smartphones">Smartphones</option>
            <option value="Laptops">Laptops</option>
            <option value="Tablets">Tablets</option>
            <option value="Gaming">Gaming</option>
            <option value="PC Components">PC Components</option>
            <option value="Accessories">Accessories</option>
            <option value="Networking">Networking</option>
          </select>
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
            <button onClick={() => fetchProducts()} className="retry-button">
              Load All Products
            </button>
          </div>
        ) : (
          <>
            <div className="products-count">
              <p>Showing {sortedProducts.length} products</p>
            </div>

            <div className="products-grid">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Shop;
