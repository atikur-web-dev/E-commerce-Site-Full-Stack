// Frontend/src/pages/Shop/Shop.jsx
import React, { useState, useEffect } from "react";
import { useProducts } from "../../context/ProductContext";
import ProductCard from "../../components/products/ProductCard/ProductCard";
import { useLocation, useNavigate } from "react-router-dom";
import "./Shop.css";

const Shop = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    products: allProducts,
    categories,
    loading,
    error,
    fetchProducts,
  } = useProducts();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Parse URL parameters on component mount and when URL changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlCategory = searchParams.get("category");
    const urlSearch = searchParams.get("search");
    const urlSort = searchParams.get("sort");

    console.log("🔗 URL Parameters:", {
      category: urlCategory,
      search: urlSearch,
      sort: urlSort,
    });

    if (urlCategory) {
      console.log(`✅ Setting category from URL: ${urlCategory}`);
      setSelectedCategory(urlCategory);
    }

    if (urlSearch) {
      setSearchQuery(urlSearch);
    }

    if (urlSort) {
      setSortBy(urlSort);
    }

    // Load products
    fetchProducts();
  }, [location.search]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (selectedCategory !== "all") {
      params.set("category", selectedCategory);
    }

    if (searchQuery.trim()) {
      params.set("search", searchQuery);
    }

    if (sortBy !== "newest") {
      params.set("sort", sortBy);
    }

    const queryString = params.toString();
    const newUrl = queryString ? `/shop?${queryString}` : "/shop";

    // Update URL without reloading page
    navigate(newUrl, { replace: true });

    console.log(`🔄 URL Updated: ${newUrl}`);
  }, [selectedCategory, searchQuery, sortBy, navigate]);

  // Filter products whenever filters or products change
  useEffect(() => {
    console.log("🔍 Filtering products...", {
      totalProducts: allProducts.length,
      selectedCategory,
      searchQuery,
      sortBy,
    });

    let result = [...allProducts];

    // 1. Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter(
        (product) =>
          product.category &&
          product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
      console.log(
        `📁 After category filter (${selectedCategory}): ${result.length} products`
      );
    }

    // 2. Apply search filter
    if (searchQuery.trim()) {
      result = result.filter(
        (product) =>
          (product.name &&
            product.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (product.description &&
            product.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (product.brand &&
            product.brand.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      console.log(
        `🔎 After search filter (${searchQuery}): ${result.length} products`
      );
    }

    // 3. Apply sorting
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        console.log("📈 Sorted: Price Low to High");
        break;
      case "price-high":
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        console.log("📉 Sorted: Price High to Low");
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        console.log("⭐ Sorted: Rating High to Low");
        break;
      default:
        // newest stays as is (default sort from backend)
        console.log("🆕 Sorted: Newest First");
        break;
    }

    setFilteredProducts(result);
    console.log(`✅ Final filtered products: ${result.length}`);
  }, [allProducts, selectedCategory, searchQuery, sortBy]);

  const handleCategoryChange = (category) => {
    console.log(`🎯 Category changed to: ${category}`);
    setSelectedCategory(category);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log(`🔍 Searching for: ${searchQuery}`);
    // Search is handled by useEffect
  };

  const handleSortChange = (sortType) => {
    console.log(`📊 Sort changed to: ${sortType}`);
    setSortBy(sortType);
  };

  const handleClearFilters = () => {
    console.log("🗑️ Clearing all filters");
    setSelectedCategory("all");
    setSearchQuery("");
    setSortBy("newest");
  };

  // Get available categories from products
  const availableCategories = [
    "all",
    ...new Set(
      allProducts
        .map((p) => p.category)
        .filter(Boolean)
        .sort()
    ),
  ];

  return (
    <div className="shop-page">
      {/* Hero Section */}
      <div className="shop-hero">
        <div className="hero-content">
          <h1>TechHub Pro Store</h1>
          <p>Premium Technology & Electronics at Best Prices</p>
          <div className="hero-features">
            <span>🚚 Free Shipping</span>
            <span>⭐ Premium Quality</span>
            <span>🔒 Secure Checkout</span>
          </div>
          <div className="hero-actions">
            <button onClick={() => navigate("/")} className="btn-home">
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
      {/* Active Filters Display */}
      {(selectedCategory !== "all" || searchQuery || sortBy !== "newest") && (
        <div className="active-filters">
          <h3>Active Filters:</h3>
          <div className="filter-tags">
            {selectedCategory !== "all" && (
              <span className="filter-tag">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory("all")}>×</button>
              </span>
            )}
            {searchQuery && (
              <span className="filter-tag">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery("")}>×</button>
              </span>
            )}
            {sortBy !== "newest" && (
              <span className="filter-tag">
                Sort:{" "}
                {sortBy === "price-low"
                  ? "Price Low to High"
                  : sortBy === "price-high"
                  ? "Price High to Low"
                  : "Rating"}
                <button onClick={() => setSortBy("newest")}>×</button>
              </span>
            )}
            <button onClick={handleClearFilters} className="clear-all-btn">
              Clear All Filters
            </button>
          </div>
        </div>
      )}
      {/* Filters */}
      <div className="shop-filters">
        <div className="filters-container">
          {/* Search */}
          <form onSubmit={handleSearch} className="search-bar">
            <input
              type="text"
              placeholder="Search products by name, brand or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              🔍 Search
            </button>
          </form>

          <div className="filter-controls">
            {/* Category Select */}
            <div className="filter-group">
              <label htmlFor="category-select">Category:</label>
              <select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="category-select"
              >
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Products" : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Select */}
            <div className="filter-group">
              <label htmlFor="sort-select">Sort by:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="sort-select"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rating</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      {/* Products */}
      <div className="shop-content">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button onClick={fetchProducts} className="retry-button">
              Try Again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="no-products">
            <div className="no-products-icon">📦</div>
            <h3>No products found</h3>
            <p>Try a different search or category.</p>
            <div className="no-products-actions">
              <button onClick={handleClearFilters} className="btn btn-primary">
                Clear All Filters
              </button>
              <button onClick={() => navigate("/")} className="btn btn-outline">
                Back to Home
              </button>
            </div>
            <div className="debug-info">
              <p>Debug Info:</p>
              <ul>
                <li>Total Products: {allProducts.length}</li>
                <li>Selected Category: {selectedCategory}</li>
                <li>Search Query: {searchQuery || "(empty)"}</li>
                <li>
                  Available Categories:{" "}
                  {availableCategories.filter((c) => c !== "all").join(", ")}
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            <div className="products-header">
              <div className="products-count">
                <p>
                  Showing <strong>{filteredProducts.length}</strong> of{" "}
                  <strong>{allProducts.length}</strong> products
                </p>
                {selectedCategory !== "all" && (
                  <p className="current-category">
                    Category: <strong>{selectedCategory}</strong>
                  </p>
                )}
              </div>
              <div className="view-controls">
                <button
                  onClick={() => navigate("/")}
                  className="btn-home-small"
                >
                  ← Home
                </button>
              </div>
            </div>

            <div className="products-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                />
              ))}
            </div>

            <div className="products-footer">
              <p>
                Found {filteredProducts.length} products matching your criteria
              </p>
              {filteredProducts.length < allProducts.length && (
                <button onClick={handleClearFilters} className="show-all-btn">
                  Show All Products ({allProducts.length})
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Shop;
