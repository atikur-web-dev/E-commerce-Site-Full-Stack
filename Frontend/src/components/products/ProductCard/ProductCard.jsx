// Frontend/src/components/products/ProductCard/ProductCard.jsx
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
  const [imageError, setImageError] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (user && product?._id) {
      const savedWishlist = JSON.parse(localStorage.getItem(`wishlist_${user._id}`)) || [];
      const isInWishlist = savedWishlist.some(item => item._id === product._id);
      setWishlisted(isInWishlist);
    }
  }, [user, product?._id]);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!user) {
      if (window.confirm("Please login to add items to cart. Go to login page?")) {
        navigate("/login");
      }
      return;
    }

    setLoading(true);
    try {
      await addToCart(product);
      // Success feedback
      const btn = document.querySelector(`#cart-btn-${product._id}`);
      btn.classList.add('success');
      setTimeout(() => btn.classList.remove('success'), 1000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add product to cart");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async (e) => {
    e.stopPropagation();
    if (!user) {
      if (window.confirm("Please login to proceed to checkout. Go to login page?")) {
        navigate("/login");
      }
      return;
    }

    setLoading(true);
    try {
      await addToCart(product);
      navigate("/checkout");
    } catch (error) {
      console.error("Error processing buy now:", error);
      alert("Failed to process order");
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
        rating: product.rating,
        description: product.description
      };
      
      const updatedWishlist = [...savedWishlist, productToSave];
      localStorage.setItem(`wishlist_${user._id}`, JSON.stringify(updatedWishlist));
      setWishlisted(true);
    }
  };

  const getProductImage = () => {
    if (imageError) {
      return "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&h=350&fit=crop&crop=center";
    }
    if (product?.images && product.images.length > 0) {
      return product.images[0];
    }
    if (product?.image) {
      return product.image;
    }
    return "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&h=350&fit=crop&crop=center";
  };

  const getStockStatus = () => {
    if (!product?.stock || product.stock === 0) {
      return { text: "Out of Stock", className: "out-of-stock", available: false };
    }
    if (product.stock < 5) {
      return { text: `Only ${product.stock} left`, className: "low-stock", available: true };
    }
    return { text: "In Stock", className: "in-stock", available: true };
  };

  const calculateDiscount = () => {
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round((1 - product.price / product.originalPrice) * 100);
    }
    return 0;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const discount = calculateDiscount();
  const stockStatus = getStockStatus();

  if (!product) {
    return (
      <div className="product-card-skeleton">
        <div className="image-skeleton"></div>
        <div className="info-skeleton">
          <div className="title-skeleton"></div>
          <div className="price-skeleton"></div>
          <div className="button-skeleton"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`product-card ${!stockStatus.available ? 'out-of-stock-card' : ''}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Only Discount Badge - No New Badge */}
      {discount > 0 && (
        <div className="discount-badge">
          <span className="badge-text">{discount}% OFF</span>
        </div>
      )}

      {/* Wishlist Button */}
      <button 
        className={`wishlist-btn ${wishlisted ? "active" : ""}`}
        onClick={handleWishlist}
        title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <svg className="heart-icon" viewBox="0 0 24 24" fill={wishlisted ? "#ef4444" : "none"} stroke={wishlisted ? "#ef4444" : "#374151"}>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>

      {/* FIXED: Product Image with Simplified Structure */}
      <div className="product-image-container">
        <Link to={`/product/${product._id}`} className="image-link">
          <img
            src={getProductImage()}
            alt={product.name}
            className="product-image"
            loading="lazy"
            onError={() => setImageError(true)}
          />
          
          {/* Hover Overlay */}
          <div className="image-hover-overlay">
            <div className="overlay-content">
              <button className="quick-view-btn">
                <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                Quick View
              </button>
            </div>
          </div>
        </Link>
      </div>

      {/* Product Info */}
      <div className="product-content">
        {/* Category & Brand */}
        <div className="product-meta">
          <span className="product-category">{product.category || "Electronics"}</span>
          {product.brand && (
            <>
              <span className="separator">•</span>
              <span className="product-brand">{product.brand}</span>
            </>
          )}
        </div>

        {/* Product Name */}
        <h3 className="product-title">
          <Link to={`/product/${product._id}`} className="title-link">
            {product.name}
          </Link>
        </h3>

        {/* Rating */}
        <div className="rating-container">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <svg 
                key={i}
                className={`star-icon ${i < Math.floor(product.rating || 0) ? "filled" : ""}`}
                viewBox="0 0 24 24"
                fill={i < Math.floor(product.rating || 0) ? "#FBBF24" : "#E5E7EB"}
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
          </div>
          <span className="rating-score">{product.rating?.toFixed(1) || "0.0"}</span>
          <span className="review-count">({product.numReviews || 0})</span>
        </div>

        {/* Stock Status */}
        <div className={`stock-status ${stockStatus.className}`}>
          <svg className="stock-icon" viewBox="0 0 20 20" fill="currentColor">
            {stockStatus.available ? (
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            ) : (
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            )}
          </svg>
          <span>{stockStatus.text}</span>
        </div>

        {/* Price */}
        <div className="price-section">
          <div className="price-main">
            <span className="current-price">{formatPrice(product.price || 0)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="original-price">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          {discount > 0 && (
            <div className="savings">
              Save {formatPrice(product.originalPrice - product.price)}
            </div>
          )}
        </div>

        {/* Top Actions - 50% 50% */}
        <div className="top-actions">
          <button
            onClick={handleAddToCart}
            disabled={loading || !stockStatus.available}
            className={`add-to-cart-btn ${!stockStatus.available ? "disabled" : ""}`}
            id={`cart-btn-${product._id}`}
          >
            {loading ? (
              <span className="button-loader"></span>
            ) : !stockStatus.available ? (
              <>
                <svg className="cart-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                Out of Stock
              </>
            ) : (
              <>
                <svg className="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                Add to Cart
              </>
            )}
          </button>

          <Link 
            to={`/product/${product._id}`}
            className="view-details-btn"
          >
            <svg className="details-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            View Details
          </Link>
        </div>

        {/* Bottom Buy Now Button - Full Width */}
        <button
          onClick={handleBuyNow}
          disabled={loading || !stockStatus.available}
          className={`buy-now-btn ${!stockStatus.available ? "disabled" : ""}`}
        >
          {loading ? (
            <span className="button-loader"></span>
          ) : !stockStatus.available ? (
            <>
              <svg className="buy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Out of Stock
            </>
          ) : (
            <>
              <svg className="buy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
              Buy Now
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;