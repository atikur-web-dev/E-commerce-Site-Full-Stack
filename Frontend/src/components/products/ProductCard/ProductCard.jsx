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
      alert("Please login to add items to cart");
      window.location.href = "/login";
      return;
    }

    addToCart({
      ...product,
      quantity: 1,
    });
  };

  // Check if product is in stock
  const isInStock = product.countInStock > 0 || product.stock > 0;
  const stockCount = product.countInStock || product.stock || 0;

  return (
    <div className="product-card">
      {/* Product Image */}
      <div className="product-image">
        <Link to={`/product/${product._id || product.id}`}>
          <img
            src={
              product.image ||
              product.images?.[0] ||
              "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80"
            }
            alt={product.name}
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/400x300?text=No+Image";
            }}
          />
        </Link>

        {/* Stock Badge */}
        {!isInStock && <div className="out-of-stock-badge">Out of Stock</div>}
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

        {/* Brand */}
        <div className="product-brand">{product.brand || "Generic Brand"}</div>

        {/* Rating */}
        <div className="product-rating">
          <div className="stars">
            {"★".repeat(Math.floor(product.rating || 0))}
            {"☆".repeat(5 - Math.floor(product.rating || 0))}
          </div>
          <span className="rating-count">({product.numReviews || 0})</span>
        </div>

        {/* Price */}
        <div className="product-price">
          <span className="price">${product.price?.toFixed(2) || "0.00"}</span>
        </div>

        {/* Action Buttons */}
        <div className="product-actions">
          <button
            className={`add-to-cart-btn ${!isInStock ? "disabled" : ""}`}
            onClick={handleAddToCart}
            disabled={!isInStock}
          >
            {isInStock ? "Add to Cart" : "Out of Stock"}
          </button>

          <Link
            to={`/product/${product._id || product.id}`}
            className="view-details-btn"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
