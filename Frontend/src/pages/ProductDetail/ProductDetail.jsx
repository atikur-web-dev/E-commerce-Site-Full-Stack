// ./Frontend/src/pages/ProductDetail/ProductDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useProducts } from "../../context/ProductContext";
import { useAuth } from "../../context/AuthContext";
import "./ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const {
    fetchProductById,
    currentProduct,
    loading,
    error,
    clearCurrentProduct,
  } = useProducts();
  const { isAuthenticated } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load product
  useEffect(() => {
    if (!id) {
      console.error("❌ No product ID in URL");
      return;
    }

    console.log("🔄 ProductDetail: Loading product with ID:", id);

    const loadProduct = async () => {
      try {
        await fetchProductById(id);
        setIsInitialLoad(false);
      } catch (err) {
        console.error("Failed to load product:", err);
      }
    };

    loadProduct();

    // Cleanup function
    return () => {
      console.log("🧹 ProductDetail: Cleaning up...");
      clearCurrentProduct();
    };
  }, [id]);

  // Handle add to cart
  const handleAddToCart = () => {
    if (!isAuthenticated()) {
      alert("Please login to add items to cart");
      navigate("/login");
      return;
    }

    if (currentProduct && currentProduct.stock > 0) {
      const success = addToCart({ ...currentProduct, quantity });
      if (success) {
        alert(`${quantity} ${currentProduct.name} added to cart!`);
      }
    } else {
      alert("This product is out of stock!");
    }
  };

  // Handle quantity change
  const handleQuantityChange = (change) => {
    if (!currentProduct) return;

    const newQuantity = quantity + change;
    const maxQuantity = Math.min(currentProduct.stock, 10);

    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  // Loading state
  if (loading && isInitialLoad) {
    return (
      <div className="product-detail-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !currentProduct) {
    return (
      <div className="product-not-found">
        <h2>Product Not Found</h2>
        <p>{error || "The product you're looking for doesn't exist."}</p>
        <button onClick={() => navigate("/shop")} className="back-to-shop-btn">
          ← Back to Shop
        </button>
      </div>
    );
  }

  // Prepare images
  const productImages =
    currentProduct.images && currentProduct.images.length > 0
      ? currentProduct.images
      : [
          currentProduct.image ||
            "https://via.placeholder.com/600x400?text=No+Image",
        ];

  return (
    <div className="product-detail-container">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <button onClick={() => navigate("/")}>Home</button> /
        <button onClick={() => navigate("/shop")}>Shop</button> /
        <button
          onClick={() => navigate(`/shop?category=${currentProduct.category}`)}
        >
          {currentProduct.category}
        </button>{" "}
        /<span>{currentProduct.name}</span>
      </div>

      <div className="product-detail-grid">
        {/* Left Column - Images */}
        <div className="product-images">
          <div className="main-image">
            <img
              src={productImages[selectedImage]}
              alt={currentProduct.name}
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/600x400?text=No+Image";
              }}
            />
          </div>

          {productImages.length > 1 && (
            <div className="image-thumbnails">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  className={`thumbnail-btn ${
                    selectedImage === index ? "active" : ""
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={img}
                    alt={`${currentProduct.name} view ${index + 1}`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Info */}
        <div className="product-info">
          <div className="product-header">
            <h1 className="product-title">{currentProduct.name}</h1>

            <div className="product-meta">
              <span className="product-category">
                {currentProduct.category}
              </span>
              <span className="product-brand">{currentProduct.brand}</span>
            </div>

            <div className="product-rating">
              <span className="stars">
                {"★".repeat(Math.floor(currentProduct.rating || 0))}
                {"☆".repeat(5 - Math.floor(currentProduct.rating || 0))}
              </span>
              <span className="rating-value">
                ({currentProduct.numReviews || 0} reviews)
              </span>
            </div>
          </div>

          <div className="product-price-section">
            <span className="current-price">
              ${currentProduct.price.toFixed(2)}
            </span>
            {currentProduct.isOnSale && (
              <span className="original-price">
                ${(currentProduct.price * 1.2).toFixed(2)}
              </span>
            )}
          </div>

          <div
            className={`stock-status ${
              currentProduct.stock > 0 ? "in-stock" : "out-of-stock"
            }`}
          >
            {currentProduct.stock > 0
              ? `✅ ${currentProduct.stock} in stock`
              : "❌ Out of stock"}
          </div>

          <div className="product-description">
            <h3>Description</h3>
            <p>{currentProduct.description}</p>
          </div>

          {/* Specifications */}
          {currentProduct.specifications &&
            Object.keys(currentProduct.specifications).length > 0 && (
              <div className="specifications">
                <h3>Specifications</h3>
                <div className="specs-grid">
                  {Object.entries(currentProduct.specifications).map(
                    ([key, value]) => (
                      <div key={key} className="spec-item">
                        <span className="spec-key">{key}:</span>
                        <span className="spec-value">{value}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

          {/* Add to Cart Section */}
          {currentProduct.stock > 0 && (
            <div className="add-to-cart-section">
              <div className="quantity-control">
                <label>Quantity:</label>
                <div className="quantity-input">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    min="1"
                    max={Math.min(currentProduct.stock, 10)}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (
                        val >= 1 &&
                        val <= Math.min(currentProduct.stock, 10)
                      ) {
                        setQuantity(val);
                      }
                    }}
                  />
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= Math.min(currentProduct.stock, 10)}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total Price Display */}
              <div className="total-price-section">
                <div className="price-breakdown">
                  <div className="price-row">
                    <span>Price per item:</span>
                    <span className="price-value">
                      ${currentProduct.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="price-row">
                    <span>Quantity:</span>
                    <span className="quantity-value">{quantity}</span>
                  </div>
                  <div className="price-row total">
                    <span className="total-label">Total:</span>
                    <span className="total-value">
                      ${(currentProduct.price * quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={currentProduct.stock === 0}
              >
                <span className="cart-icon">🛒</span>
                <span>Add to Cart</span>
              </button>
            </div>
          )}

          {/* Warranty */}
          <div className="warranty-info">
            <span className="warranty-icon">🛡️</span>
            <span>{currentProduct.warranty || 12} Months Warranty</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
