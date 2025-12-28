import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addToCart(product._id, 1);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setTimeout(() => setAdding(false), 500);
    }
  };

  // Get default image
  const productImage = product.images?.[0] || product.image || "/default-product.jpg";

  return (
    <div className="product-card">
      {/* Product Image */}
      <div className="product-image-container">
        <Link to={`/product/${product._id}`}>
          <img 
            src={productImage} 
            alt={product.name}
            className="product-image"
            onError={(e) => {
              e.target.src = "/default-product.jpg";
              e.target.onerror = null;
            }}
          />
        </Link>
        
        {/* Product Badges */}
        {product.stock < 5 && product.stock > 0 && (
          <span className="stock-badge low-stock">Low Stock: {product.stock}</span>
        )}
        {product.stock === 0 && (
          <span className="stock-badge out-of-stock">Out of Stock</span>
        )}
        {product.isFeatured && (
          <span className="featured-badge">🔥 Featured</span>
        )}
        
        {/* Quick View Button */}
        <button className="quick-view-btn">
          👁️ Quick View
        </button>
      </div>

      {/* Product Info */}
      <div className="product-info">
        <div className="product-category">
          <span className="category-tag">{product.category}</span>
          {product.brand && <span className="brand-tag">{product.brand}</span>}
        </div>
        
        <Link to={`/product/${product._id}`} className="product-name">
          {product.name}
        </Link>
        
        <p className="product-description">
          {product.description?.substring(0, 60) || "Premium quality product"}...
        </p>
        
        {/* Rating */}
        <div className="product-rating">
          <div className="stars">
            {"★".repeat(Math.floor(product.rating || 0))}
            {"☆".repeat(5 - Math.floor(product.rating || 0))}
          </div>
          <span className="rating-count">({product.numReviews || 0})</span>
        </div>

        {/* Price and Actions */}
        <div className="product-footer">
          <div className="price-section">
            <span className="current-price">৳{product.price?.toFixed(2) || "0.00"}</span>
            {product.originalPrice && (
              <span className="original-price">৳{product.originalPrice.toFixed(2)}</span>
            )}
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || adding}
            className={`add-to-cart-btn ${product.stock === 0 ? "disabled" : ""}`}
          >
            {adding ? (
              <span className="spinner"></span>
            ) : product.stock === 0 ? (
              "Out of Stock"
            ) : (
              <>
                <span className="cart-icon">🛒</span>
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;