import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import "./ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `http://localhost:5000/api/products/${id}`
      );

      if (response.data) {
        setProduct(response.data);
        console.log("✅ Product loaded:", response.data.name);
        console.log("📸 Product images:", response.data.images);
      } else {
        setError("Product not found");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setError("Failed to load product. Using demo data.");

      // Demo data for presentation
      setProduct(generateDemoProduct());
    } finally {
      setLoading(false);
    }
  };

  const generateDemoProduct = () => {
    return {
      _id: id || "demo_product_123",
      name: "Samsung Galaxy S24 Ultra",
      description:
        "AI-powered smartphone with S Pen, 200MP camera, Snapdragon 8 Gen 3 processor",
      price: 1199.99,
      category: "Smartphones",
      brand: "Samsung",
      images: [
        "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600",
        "https://images.unsplash.com/photo-1610945265084-0e34e5519bbf?w=600",
        "https://images.unsplash.com/photo-1610945265074-0e34e5519bbf?w=600",
      ],
      stock: 20,
      rating: 4.7,
      numReviews: 89,
      isNewArrival: true,
      specifications: {
        display: "6.8-inch Dynamic AMOLED 2X",
        processor: "Snapdragon 8 Gen 3",
        ram: "12GB",
        storage: "512GB",
        battery: "5000mAh",
        camera: "200MP + 50MP + 12MP + 10MP",
        os: "Android 14 with One UI 6.1",
      },
      warranty: 12,
    };
  };

  const handleAddToCart = () => {
    if (!user) {
      alert("Please login to add items to cart");
      navigate("/login");
      return;
    }

    if (product && product.stock > 0) {
      addToCart({ ...product, quantity });
      alert(`${quantity} ${product.name} added to cart!`);
    } else {
      alert("This product is out of stock!");
    }
  };

  const handleQuantityChange = (change) => {
    if (!product) return;

    const newQuantity = quantity + change;
    const maxQuantity = Math.min(product.stock, 10);

    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  // Get images array safely
  const getProductImages = () => {
    if (!product) return ["https://via.placeholder.com/600x400?text=No+Image"];

    if (
      product.images &&
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      return product.images;
    }

    if (product.image) {
      return [product.image];
    }

    return ["https://via.placeholder.com/600x400?text=No+Image"];
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
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

  const productImages = getProductImages();

  return (
    <div className="product-detail-container">
      {/* Demo Notice */}
      {error && (
        <div className="demo-notice">
          <h3>🎓 Practicum Project Demo</h3>
          <p>
            <strong>Note:</strong> {error}
          </p>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <button onClick={() => navigate("/")}>Home</button> /
        <button onClick={() => navigate("/shop")}>Shop</button> /
        <button onClick={() => navigate(`/shop?category=${product.category}`)}>
          {product.category}
        </button>{" "}
        /<span>{product.name}</span>
      </div>

      <div className="product-detail-grid">
        {/* Left Column - Images */}
        <div className="product-images">
          <div className="main-image">
            <img
              src={productImages[selectedImage]}
              alt={product.name}
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/600x400?text=No+Image";
                e.target.onerror = null;
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
                    alt={`${product.name} view ${index + 1}`}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/100x100?text=Image";
                      e.target.onerror = null;
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Info */}
        <div className="product-info">
          <div className="product-header">
            <h1 className="product-title">{product.name}</h1>

            <div className="product-meta">
              <span className="product-category">{product.category}</span>
              <span className="product-brand">{product.brand}</span>
            </div>

            <div className="product-rating">
              <span className="stars">
                {"★".repeat(Math.floor(product.rating || 0))}
                {"☆".repeat(5 - Math.floor(product.rating || 0))}
              </span>
              <span className="rating-value">
                ({product.numReviews || 0} reviews)
              </span>
            </div>
          </div>

          <div className="product-price-section">
            <span className="current-price">৳{product.price?.toFixed(2)}</span>
            {product.isOnSale && (
              <span className="original-price">
                ৳{(product.price * 1.2).toFixed(2)}
              </span>
            )}
          </div>

          <div
            className={`stock-status ${
              product.stock > 0 ? "in-stock" : "out-of-stock"
            }`}
          >
            {product.stock > 0
              ? `✅ ${product.stock} in stock`
              : "❌ Out of stock"}
          </div>

          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          {/* Specifications */}
          {product.specifications &&
            Object.keys(product.specifications).length > 0 && (
              <div className="specifications">
                <h3>Specifications</h3>
                <div className="specs-grid">
                  {Object.entries(product.specifications).map(
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
          {product.stock > 0 && (
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
                    max={Math.min(product.stock, 10)}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val >= 1 && val <= Math.min(product.stock, 10)) {
                        setQuantity(val);
                      }
                    }}
                  />
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= Math.min(product.stock, 10)}
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
                      ৳{product.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="price-row">
                    <span>Quantity:</span>
                    <span className="quantity-value">{quantity}</span>
                  </div>
                  <div className="price-row total">
                    <span className="total-label">Total:</span>
                    <span className="total-value">
                      ৳{(product.price * quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <span className="cart-icon">🛒</span>
                <span>Add to Cart</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
