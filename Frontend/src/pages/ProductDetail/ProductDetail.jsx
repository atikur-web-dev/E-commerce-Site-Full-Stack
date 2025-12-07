import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useProducts } from "../../context/ProductContext";
import "./ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { fetchProductById } = useProducts();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Fetch product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        console.log("🔄 Loading product ID:", id);

        // Try to fetch from backend
        const response = await fetch(
          `http://localhost:5000/api/products/${id}`
        );

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Product data:", data);

          if (data.product) {
            setProduct(data.product);
          } else {
            setError("Product not found");
          }
        } else {
          // If backend fails, use mock data
          console.log("⚠️ Backend failed, using mock data");
          setProduct(getMockProduct(id));
        }
      } catch (err) {
        console.error("❌ Error:", err);
        setError("Failed to load product");
        // Use mock data as fallback
        setProduct(getMockProduct(id));
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // Mock data fallback
  const getMockProduct = (productId) => {
    const mockProducts = {
      1: {
        _id: "1",
        name: "iPhone 15 Pro",
        price: 1299.99,
        images: [
          "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500",
        ],
        category: "Electronics",
        rating: 4.8,
        description:
          "Latest Apple smartphone with A17 Pro chip and titanium design. Features advanced camera system and all-day battery life.",
        stock: 50,
        isFeatured: true,
        brand: "Apple",
      },
      2: {
        _id: "2",
        name: "Nike Air Max 270",
        price: 129.99,
        images: [
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
        ],
        category: "Fashion",
        rating: 4.5,
        description:
          "Comfortable running shoes with Max Air cushioning. Perfect for daily wear and workouts.",
        stock: 100,
        isFeatured: true,
        brand: "Nike",
      },
      3: {
        _id: "3",
        name: "MacBook Pro 16-inch",
        price: 2499.99,
        images: [
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
        ],
        category: "Electronics",
        rating: 4.9,
        description:
          "Professional laptop with M3 Pro chip for creators. Features Liquid Retina XDR display.",
        stock: 25,
        isFeatured: true,
        brand: "Apple",
      },
    };

    return mockProducts[productId] || null;
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error && !product) {
    return (
      <div className="product-not-found">
        <div className="container">
          <h1>Error Loading Product</h1>
          <p>{error}</p>
          <Link to="/shop" className="btn btn-primary">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  // Handle product not found
  if (!product) {
    return (
      <div className="product-not-found">
        <div className="container">
          <h1>Product Not Found</h1>
          <p>Sorry, the product you're looking for doesn't exist.</p>
          <Link to="/shop" className="btn btn-primary">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  // Prepare images
  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : [
          product.image ||
            "https://via.placeholder.com/500x500?text=Product+Image",
        ];

  // Handle add to cart
  const handleAddToCart = () => {
    if (product.stock > 0) {
      const cartItem = {
        ...product,
        quantity: quantity,
      };
      addToCart(cartItem);
      alert(`${quantity} ${product.name} added to cart!`);
    } else {
      alert("This product is out of stock!");
    }
  };

  // Handle quantity change
  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    const maxQuantity = Math.min(product.stock, 10);

    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/" className="breadcrumb-link">
            Home
          </Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/shop" className="breadcrumb-link">
            Shop
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </nav>

        {/* Product Content */}
        <div className="product-detail-content">
          {/* Image Gallery */}
          <div className="product-gallery">
            <div className="main-image">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/500x500?text=Product+Image";
                }}
              />
            </div>
            {productImages.length > 1 && (
              <div className="image-thumbnails">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${
                      selectedImage === index ? "active" : ""
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info">
            <div className="product-header">
              <h1 className="product-title">{product.name}</h1>
              {product.brand && (
                <p className="product-brand">Brand: {product.brand}</p>
              )}
              <div className="product-rating">
                <span className="stars">
                  {"★".repeat(Math.floor(product.rating || 0))}
                  {"☆".repeat(5 - Math.floor(product.rating || 0))}
                </span>
                <span className="rating-value">({product.rating || 0})</span>
              </div>
            </div>

            <p className="product-category">Category: {product.category}</p>

            <div className="product-price-section">
              <span className="product-price">${product.price.toFixed(2)}</span>
              <span
                className={`product-stock ${
                  product.stock > 0 ? "in-stock" : "out-of-stock"
                }`}
              >
                {product.stock > 0
                  ? `In Stock (${product.stock} available)`
                  : "Out of Stock"}
              </span>
            </div>

            <p className="product-description">{product.description}</p>

            {/* Add to Cart Section */}
            {product.stock > 0 ? (
              <div className="add-to-cart-section">
                <div className="quantity-selector">
                  <label htmlFor="quantity">Quantity:</label>
                  <div className="quantity-controls">
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="quantity-display">{quantity}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= Math.min(product.stock, 10)}
                    >
                      +
                    </button>
                  </div>
                  <span className="max-quantity">
                    Max: {Math.min(product.stock, 10)} per order
                  </span>
                </div>
                <button
                  className="btn btn-primary add-to-cart-btn"
                  onClick={handleAddToCart}
                >
                  Add to Cart - ${(product.price * quantity).toFixed(2)}
                </button>
              </div>
            ) : (
              <button className="btn btn-secondary" disabled>
                Out of Stock
              </button>
            )}

            {/* Back to Shop Button */}
            <div className="action-buttons">
              <button
                className="btn btn-outline"
                onClick={() => navigate("/shop")}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
