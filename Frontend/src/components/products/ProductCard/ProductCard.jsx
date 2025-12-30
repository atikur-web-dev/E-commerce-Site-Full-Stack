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

  useEffect(() => {
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
      // Show success feedback
      document.querySelector(`#cart-btn-${product._id}`).classList.add('added');
      setTimeout(() => {
        document.querySelector(`#cart-btn-${product._id}`).classList.remove('added');
      }, 1000);
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
      // Feedback animation
      e.target.classList.add('removed');
      setTimeout(() => e.target.classList.remove('removed'), 300);
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
        originalPrice: product.originalPrice,
        rating: product.rating,
        description: product.description
      };
      
      const updatedWishlist = [...savedWishlist, productToSave];
      localStorage.setItem(`wishlist_${user._id}`, JSON.stringify(updatedWishlist));
      setWishlisted(true);
      // Feedback animation
      e.target.classList.add('added');
      setTimeout(() => e.target.classList.remove('added'), 300);
    }
  };

  const getProductImage = () => {
    if (imageError) {
      return "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop&crop=center";
    }
    if (product?.images && product.images.length > 0) {
      return product.images[0];
    }
    if (product?.image) {
      return product.image;
    }
    return "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop&crop=center";
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
    <div className="product-card">
      {/* Discount Badge */}
      {discount > 0 && (
        <div className="discount-badge">
          -{discount}%
        </div>
      )}

      {/* Product Image */}
      <div className="product-image-container">
        <Link to={`/product/${product._id}`} className="product-image-link">
          <div className="image-wrapper">
            <img
              src={getProductImage()}
              alt={product.name}
              className="product-image"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          </div>
        </Link>
        
        {/* Wishlist Button - Top Right */}
        <button 
          className={`wishlist-btn ${wishlisted ? "active" : ""}`}
          onClick={handleWishlist}
          title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill={wishlisted ? "#ef4444" : "none"} 
            stroke={wishlisted ? "#ef4444" : "#6b7280"} 
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        {/* Stock Status - Top Left */}
        <div className={`stock-status ${stockStatus.className}`}>
          {stockStatus.text}
        </div>

        {/* Quick View Overlay */}
        <div className="quick-view-overlay">
          <Link to={`/product/${product._id}`} className="quick-view-btn">
            Quick View
          </Link>
        </div>
      </div>

      {/* Product Info */}
      <div className="product-info">
        {/* Category */}
        <div className="product-category">
          <span className="category-tag">{product.category || "Electronics"}</span>
          {product.brand && (
            <span className="brand-tag">{product.brand}</span>
          )}
        </div>

        {/* Product Name */}
        <h3 className="product-name">
          <Link to={`/product/${product._id}`} title={product.name}>
            {product.name.length > 50 ? product.name.substring(0, 50) + "..." : product.name}
          </Link>
        </h3>

        {/* Rating */}
        <div className="product-rating">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <span 
                key={i} 
                className={`star ${i < Math.floor(product.rating || 0) ? "filled" : ""}`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="rating-text">
            ({product.rating?.toFixed(1) || "0.0"}) • {product.numReviews || 0} reviews
          </span>
        </div>

        {/* Description */}
        <p className="product-description">
          {product.description?.substring(0, 70) || "Premium quality product with excellent features..."}
        </p>

        {/* Price */}
        <div className="product-price">
          <div className="price-main">
            <span className="current-price">৳{product.price?.toFixed(2) || "0.00"}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="original-price">
                ৳{product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          
        </div>

        {/* Actions */}
        <div className="product-actions">
          <button
            id={`cart-btn-${product._id}`}
            onClick={handleAddToCart}
            disabled={loading || !stockStatus.available}
            className={`add-to-cart-btn ${!stockStatus.available ? "disabled" : ""}`}
          >
            {loading ? (
              <span className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </span>
            ) : !stockStatus.available ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="cart-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Out of Stock
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="cart-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
                Add to Cart
              </>
            )}
          </button>
          
          <Link to={`/product/${product._id}`} className="view-details-btn">
            <svg xmlns="http://www.w3.org/2000/svg" className="details-icon" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            View Details
          </Link>
        </div>

        {/* Features */}
        <div className="product-features">
          <span className="feature">
            <svg xmlns="http://www.w3.org/2000/svg" className="feature-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Free Shipping
          </span>
          <span className="feature">
            <svg xmlns="http://www.w3.org/2000/svg" className="feature-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            1 Year Warranty
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;