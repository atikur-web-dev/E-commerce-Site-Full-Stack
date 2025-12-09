// ./Frontend/src/components/products/ProductCard/ProductCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../../context/AuthContext";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated()) {
      const shouldLogin = window.confirm(
        "Please login to add items to cart. Go to login page?"
      );
      if (shouldLogin) {
        window.location.href = "/login";
      }
      return;
    }

    const success = addToCart({ ...product, quantity: 1 });

    if (success) {
      // Success animation
      const btn = e.currentTarget;
      const originalText = btn.innerHTML;
      btn.innerHTML = "✓ Added!";
      btn.classList.add("added");

      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.remove("added");
      }, 1500);
    }
  };

  // Calculate discount price
  const hasDiscount = product.discount > 0;
  const discountedPrice = hasDiscount
    ? (product.price * (100 - product.discount)) / 100
    : product.price;

  // Stock status
  const isInStock = product.countInStock > 0 || product.stock > 0;
  const stockCount = product.countInStock || product.stock || 0;

  return (
    <div className="product-card">
      {/* Discount Badge */}
      {hasDiscount && (
        <div className="discount-badge">-{product.discount}%</div>
      )}

      {/* Product Image */}
      <div className="product-image-wrapper">
        <Link to={`/product/${product._id || product.id}`}>
          <img
            src={
              product.image ||
              product.images?.[0] ||
              "https://via.placeholder.com/300x200?text=No+Image"
            }
            alt={product.name}
            className="product-image"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/300x200?text=No+Image";
            }}
          />
        </Link>

        {/* Quick View Button */}
      </div>

      {/* Product Info */}
      <div className="product-info">
        {/* Category */}
        <div className="product-category">
          {product.category || "Uncategorized"}
        </div>
        {/* Product Name */}
        <h3 className="product-name">
          <Link to={`/product/${product._id || product.id}`}>
            {product.name}
          </Link>
        </h3>
        {/* Rating */}
        <div className="product-rating">
          <div className="stars">
            {"★".repeat(Math.floor(product.rating || 0))}
            {"☆".repeat(5 - Math.floor(product.rating || 0))}
          </div>
          <span className="rating-count">({product.numReviews || 0})</span>
        </div>
        {/* Description */}
        <p className="product-description">
          {product.description
            ? product.description.length > 80
              ? `${product.description.substring(0, 80)}...`
              : product.description
            : "No description available"}
        </p>
        {/* Price Section */}
        <div className="price-section">
          <div className="price-container">
            <span className="current-price">${discountedPrice.toFixed(2)}</span>
            {hasDiscount && (
              <span className="original-price">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div
            className={`stock-status ${
              isInStock ? "in-stock" : "out-of-stock"
            }`}
          >
            {isInStock ? `🟢 ${stockCount} in stock` : "🔴 Out of stock"}
          </div>
        </div>
        {/* Action Buttons */}
        // ProductCard.jsx এর view details button section
        <div className="product-actions">
          <button
            className={`add-to-cart-btn ${!isInStock ? "disabled" : ""}`}
            onClick={handleAddToCart}
            disabled={!isInStock}
          >
            <span className="cart-icon">🛒</span>
            <span className="btn-text">
              {isInStock ? "Add to Cart" : "Out of Stock"}
            </span>
          </button>

          <Link
            to={`/product/${product._id || product.id}`}
            className="view-details-btn"
          >
            <span className="details-text">View Details</span>
            <span className="details-arrow">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
