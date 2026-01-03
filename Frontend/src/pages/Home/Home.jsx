// ./Frontend/src/pages/Home/Home.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../../context/ProductContext";
import ProductList from "../../components/products/ProductList/ProductList";
import "./Home.css";

const Home = () => {
  const { featuredProducts, fetchFeaturedProducts, loading } = useProducts();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  // Hero Slides - Tech related images
  const heroSlides = [
    {
      id: 1,
      title: "TechHub Pro Store",
      subtitle: "Premium Tech Products",
      description: "Latest gadgets, smartphones, laptops and accessories",
      image:
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      buttonText: "Shop Now",
      buttonLink: "/shop",
    },
    {
      id: 2,
      title: "New Arrivals",
      subtitle: "Fresh Collection Just In",
      description: "Discover the latest tech products and accessories",
      image:
        "https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      buttonText: "Explore New",
      buttonLink: "/shop?sort=newest",
    },
    {
      id: 3,
      title: "Smart Devices",
      subtitle: "Upgrade Your Tech",
      description: "Phones, tablets, laptops and gaming consoles",
      image:
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
      buttonText: "View Deals",
      buttonLink: "/shop",
    },
  ];

  // Auto slide change every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const categories = [
    { id: 1, name: "Smartphones", icon: "📱", slug: "Smartphones" },
    { id: 2, name: "Laptops", icon: "💻", slug: "Laptops" },
    { id: 3, name: "Tablets", icon: "📱", slug: "Tablets" },
    { id: 4, name: "Gaming", icon: "🎮", slug: "Gaming" },
    { id: 5, name: "PC Components", icon: "🖥️", slug: "PC Components" },
    { id: 6, name: "Accessories", icon: "🎧", slug: "Accessories" },
    { id: 7, name: "Networking", icon: "📡", slug: "Networking" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="home-container">
      {/* ============ HERO SECTION ============ */}
      <section className="hero-section">
        <div className="hero-slides">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`hero-slide ${index === currentSlide ? "active" : ""}`}
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${slide.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="hero-content">
                <h1 className="hero-title">{slide.title}</h1>
                <h2 className="hero-subtitle">{slide.subtitle}</h2>
                <p className="hero-description">{slide.description}</p>
                <div className="hero-buttons">
                  <Link to={slide.buttonLink} className="btn btn-primary">
                    {slide.buttonText}
                  </Link>
                  <Link to="/shop" className="btn btn-outline">
                    View All Products
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Slide Indicators */}
        <div className="slide-indicators">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? "active" : ""}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section>

      {/* ============ SEARCH BAR ============ */}
      <section className="search-section">
        <div className="search-container">
          <form onSubmit={handleSearch} className="home-search">
            <input
              type="text"
              placeholder="Search products by name, brand or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              <span className="search-icon"></span>
              Search
            </button>
          </form>
        </div>
      </section>

      {/* ============ CATEGORIES SECTION ============ */}
      <section className="categories-section">
        <div className="section-header">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">
            Browse our wide range of tech categories
          </p>
        </div>

        <div className="categories-grid">
          {categories.map((category) => (
            <Link
              to={`/shop?category=${encodeURIComponent(category.slug)}`}
              key={category.id}
              className="category-card"
            >
              <div className="category-icon">{category.icon}</div>
              <h3 className="category-name">{category.name}</h3>
              <span className="category-link">Browse →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ FEATURED PRODUCTS ============ */}
      <section className="featured-section">
        <div className="section-header">
          <h2 className="section-title">Featured Products</h2>
          <p className="section-subtitle">Popular picks from our collection</p>
          <Link to="/shop" className="view-all-btn">
            View All Products
          </Link>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading featured products...</p>
          </div>
        ) : featuredProducts.length > 0 ? (
          <>
            <ProductList
              products={featuredProducts.slice(0, 8)}
              columns={4}
              emptyMessage="No featured products available"
            />
            <div className="view-more-container">
              <Link to="/shop" className="btn btn-secondary">
                View More Products
              </Link>
            </div>
          </>
        ) : (
          <div className="no-products">
            <div className="no-products-icon">📦</div>
            <h3>No Featured Products Yet</h3>
            <p>Check back soon for amazing products!</p>
          </div>
        )}
      </section>

      {/* ============ WHY SHOP WITH US ============ */}
      <section className="benefits-section">
        <h2 className="section-title">Why Shop With TechHub?</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">🚚</div>
            <h3>Free Shipping</h3>
            <p>On orders over $50</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🔄</div>
            <h3>30-Day Returns</h3>
            <p>Easy return policy</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🔒</div>
            <h3>Secure Payment</h3>
            <p>100% safe transactions</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">📞</div>
            <h3>24/7 Support</h3>
            <p>Always here to help</p>
          </div>
        </div>
      </section>

      {/* ============ CTA SECTION ============ */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Upgrade Your Tech?</h2>
          <p>Explore thousands of premium products at unbeatable prices</p>
          <div className="cta-buttons">
            <Link to="/shop" className="btn btn-primary">
              Start Shopping
            </Link>
            <Link to="/shop?category=Smartphones" className="btn btn-outline">
              Shop Smartphones
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
