import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../../context/AuthContext";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    // Check if product is in wishlist when component mounts
    if (user && product?._id) {
      const savedWishlist = JSON.parse(localStorage.getItem(`wishlist_${user._id}`)) || [];
      const isInWishlist = savedWishlist.some(item => item._id === product._id);
      setWishlisted(isInWishlist);
    }
  }, [user, product?._id]);

  const handleAddToCart = async () => {
    if (!user) {
      if (window.confirm("Please login to add items to cart. Go to login page?")) {
        navigate("/login");
      }
      return;
    }

    setLoading(true);
    try {
      await addToCart(product);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add product to cart");
    } finally {
      setLoading(false);
    }
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    
    if (!user) {
      if (window.confirm("Please login to add to wishlist. Go to login page?")) {
        navigate("/login");
      }
      return;
    }
    
    if (!product?._id) return;

    const savedWishlist = JSON.parse(localStorage.getItem(`wishlist_${user._id}`)) || [];
    
    if (wishlisted) {
      const updatedWishlist = savedWishlist.filter(item => item._id !== product._id);
      localStorage.setItem(`wishlist_${user._id}`, JSON.stringify(updatedWishlist));
      setWishlisted(false);
    } else {
      const productToSave = {
        _id: product._id,
        name: product.name,
        price: product.price,
        images: product.images || [],
        image: product.image,
        category: product.category,
        brand: product.brand,
        stock: product.stock,
        originalPrice: product.originalPrice
      };
      
      const updatedWishlist = [...savedWishlist, productToSave];
      localStorage.setItem(`wishlist_${user._id}`, JSON.stringify(updatedWishlist));
      setWishlisted(true);
    }
  };

  // Get product image
  const getProductImage = () => {
    if (product?.images && product.images.length > 0) {
      return product.images[0];
    }
    if (product?.image) {
      return product.image;
    }
    return "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop&crop=center";
  };

  // Get stock status
  const getStockStatus = () => {
    if (!product?.stock || product.stock === 0) {
      return { text: "Out of Stock", className: "out-of-stock" };
    }
    if (product.stock < 5) {
      return { text: `Only ${product.stock} left`, className: "low-stock" };
    }
    return { text: "In Stock", className: "in-stock" };
  };

  const stockStatus = getStockStatus();

  if (!product) {
    return <div className="product-card loading">Loading...</div>;
  }

  return (
    <div className="product-card">
      {/* Product Image */}
      <div className="product-image-container">
        <Link to={`/product/${product._id}`} className="product-image-link">
          <img
            src={getProductImage()}
            alt={product.name}
            className="product-image"
            loading="lazy"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop&crop=center";
              e.target.onerror = null;
            }}
          />
        </Link>
        
        {/* Simple Wishlist Button */}
        <button 
          className={`wishlist-btn ${wishlisted ? "active" : ""}`}
          onClick={handleWishlist}
          title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          {wishlisted ? "❤️" : "🤍"}
        </button>

        {/* Stock Badge */}
        <span className={`stock-badge ${stockStatus.className}`}>
          {stockStatus.text}
        </span>
      </div>

      {/* Product Info */}
      <div className="product-info">
        <div className="product-category">
          <span className="category-badge">{product.category || "Electronics"}</span>
          {product.brand && <span className="brand-badge">{product.brand}</span>}
        </div>

        <h3 className="product-name">
          <Link to={`/product/${product._id}`}>
            {product.name}
          </Link>
        </h3>

        <p className="product-description">
          {product.description?.substring(0, 80) || "High-quality electronics product"}...
        </p>

        <div className="product-rating">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < Math.floor(product.rating || 0) ? "filled" : "empty"}>
                ★
              </span>
            ))}
          </div>
          <span className="rating-count">({product.numReviews || 0})</span>
        </div>

        <div className="product-price">
          <span className="current-price">৳{product.price?.toFixed(2) || "0.00"}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <span className="original-price">৳{product.originalPrice.toFixed(2)}</span>
              <span className="discount-badge">
                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
              </span>
            </>
          )}
        </div>

        <div className="product-actions">
          <button
            onClick={handleAddToCart}
            disabled={loading || product.stock === 0}
            className={`add-to-cart-btn ${product.stock === 0 ? "disabled" : ""}`}
          >
            {loading ? (
              <span className="loading-spinner"></span>
            ) : product.stock === 0 ? (
              "Out of Stock"
            ) : (
              <>
                <span className="cart-icon">🛒</span>
                Add to Cart
              </>
            )}
          </button>
          
          <Link to={`/product/${product._id}`} className="view-details-btn">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;