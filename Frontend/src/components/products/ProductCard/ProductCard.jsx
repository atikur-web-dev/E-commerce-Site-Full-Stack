import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ ...product, quantity: 1 });
  };

  // Tech icons by category
  const getCategoryIcon = (category) => {
    switch (category) {
      case "Smartphones":
        return "📱";
      case "Laptops":
        return "💻";
      case "PC Components":
        return "⚡";
      case "Accessories":
        return "🎧";
      default:
        return "🔧";
    }
  };

  // Tech specs preview
  const getTechSpecs = () => {
    if (!product.specifications) return null;

    switch (product.category) {
      case "Smartphones":
        return `${product.specifications.ram || "8GB"} RAM • ${
          product.specifications.display || "6.1-inch"
        }`;
      case "Laptops":
        return `${product.specifications.processor || "Intel i7"} • ${
          product.specifications.ram || "16GB"
        }`;
      case "PC Components":
        return `${product.specifications.memory || "16GB"} • ${
          product.specifications.clock || "3.5GHz"
        }`;
      case "Accessories":
        return `${product.specifications.features || "Wireless"} • ${
          product.specifications.battery || "20h battery"
        }`;
      default:
        return null;
    }
  };

  // Stock status
  const isInStock = product.stock > 0;
  const stockStatus = isInStock ? `${product.stock} in stock` : "Out of stock";

  // Price formatting
  const formattedPrice = product.price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

  // Rating stars
  const renderStars = () => {
    const fullStars = Math.floor(product.rating || 0);
    const hasHalfStar = (product.rating || 0) % 1 >= 0.5;

    return (
      <div className="product-rating">
        {"★".repeat(fullStars)}
        {hasHalfStar && "⯪"}
        {"☆".repeat(5 - fullStars - (hasHalfStar ? 1 : 0))}
        <span className="rating-value">
          ({product.rating?.toFixed(1) || "0.0"})
        </span>
      </div>
    );
  };

  return (
    <div className="product-card">
      {/* Tech Badges */}
      <div className="tech-badges">
        {product.isFeatured && (
          <span className="tech-badge featured">Featured</span>
        )}
        {product.isNewArrival && <span className="tech-badge new">New</span>}
        {product.isBestSeller && (
          <span className="tech-badge bestseller">Bestseller</span>
        )}
        {!isInStock && (
          <span className="tech-badge out-of-stock">Out of Stock</span>
        )}
      </div>

      {/* Product Image */}
      <div className="product-image-container">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop";
          }}
        />

        {/* Quick Actions Overlay */}
        <div className="quick-actions">
          <button className="quick-action-btn" title="Quick View">
            👁️
          </button>
          <button className="quick-action-btn" title="Add to Wishlist">
            ❤️
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="product-info">
        {/* Category */}
        <div className="product-category">
          <span className="category-icon">
            {getCategoryIcon(product.category)}
          </span>
          {product.category}
        </div>

        {/* Product Name */}
        <h3 className="product-name">
          <Link to={`/product/${product._id || product.id}`}>
            {product.name}
          </Link>
        </h3>

        {/* Tech Specs Preview */}
        {getTechSpecs() && (
          <div className="tech-specs-preview">
            <span className="spec-item">{getTechSpecs()}</span>
          </div>
        )}

        {/* Description (Truncated) */}
        <p className="product-description">
          {product.description.length > 100
            ? `${product.description.substring(0, 100)}...`
            : product.description}
        </p>

        {/* Rating */}
        {renderStars()}

        {/* Price & Stock */}
        <div className="product-price-section">
          <div className="price-container">
            <span className="product-price">
              <span className="currency">$</span>
              {formattedPrice}
            </span>
            {product.isOnSale && (
              <span className="original-price">
                ${(product.price * 1.2).toFixed(2)}
              </span>
            )}
          </div>

          <div
            className={`stock-status ${
              isInStock ? "in-stock" : "out-of-stock"
            }`}
          >
            {isInStock ? `✅ ${stockStatus}` : `❌ ${stockStatus}`}
          </div>
        </div>

        {/* Warranty */}
        {product.warranty && (
          <div className="warranty-info">
            <span className="warranty-icon">🛡️</span>
            <span className="warranty-text">
              {product.warranty} Months Warranty
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="product-actions">
          <button
            className={`add-to-cart-btn ${!isInStock ? "disabled" : ""}`}
            onClick={handleAddToCart}
            disabled={!isInStock}
          >
            <span className="cart-icon">🛒</span>
            {isInStock ? "Add to Cart" : "Out of Stock"}
          </button>

          <Link
            to={`/product/${product._id || product.id}`}
            className="view-details-btn"
            title="View Details"
          >
            👁️
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
