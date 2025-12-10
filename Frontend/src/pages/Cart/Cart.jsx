// ./Frontend/src/pages/Cart/Cart.jsx - COMPLETE
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import "./Cart.css";

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    loading,
    error,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    loadCartFromBackend,
  } = useCart();

  const { isAuthenticated } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      alert("Please login to view your cart");
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Handle quantity change
  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      updateQuantity(itemId, newQuantity);
    }
  };

  // Handle remove item
  const handleRemoveItem = async (itemId, productName) => {
    if (window.confirm(`Remove ${productName} from cart?`)) {
      await removeFromCart(itemId);
    }
  };

  // Handle clear cart
  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      await clearCart();
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    setCheckoutLoading(true);
    // Simulate checkout process
    setTimeout(() => {
      alert("Checkout functionality will be implemented in Day 5!");
      setCheckoutLoading(false);
    }, 1000);
  };

  // Handle refresh cart
  const handleRefreshCart = async () => {
    await loadCartFromBackend();
  };

  // Loading state
  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-loading">
          <div className="spinner"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }
  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="cart-header">
            <h1>Your Shopping Cart</h1>
            <button
              onClick={() => navigate("/shop")}
              className="continue-shopping-btn"
            >
              ← Continue Shopping
            </button>
          </div>

          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <button onClick={() => navigate("/shop")} className="shop-now-btn">
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        {/* Header */}
        <div className="cart-header">
          <h1>Your Shopping Cart</h1>
          <div className="cart-header-actions">
            <button onClick={handleRefreshCart} className="refresh-cart-btn">
              🔄 Refresh Cart
            </button>
            <button
              onClick={() => navigate("/shop")}
              className="continue-shopping-btn"
            >
              ← Continue Shopping
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="cart-error">
            <p>⚠️ {error}</p>
            <button onClick={handleRefreshCart}>Try Again</button>
          </div>
        )}

        {/* Cart Content */}
        <div className="cart-content">
          {/* Cart Items */}
          <div className="cart-items-section">
            <div className="cart-items-header">
              <h2>Cart Items ({getTotalItems()})</h2>
              <button onClick={handleClearCart} className="clear-cart-btn">
                🗑️ Clear Cart
              </button>
            </div>

            <div className="cart-items">
              {cartItems.map((item) => {
                const product = item.product || item;
                const itemId = item._id;
                const productId = product._id;

                return (
                  <div key={itemId} className="cart-item">
                    {/* Product Image */}
                    <div className="cart-item-image">
                      <Link to={`/product/${productId}`}>
                        <img
                          src={
                            product.image ||
                            product.images?.[0] ||
                            "https://via.placeholder.com/150"
                          }
                          alt={product.name}
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/150x150?text=No+Image";
                          }}
                        />
                      </Link>
                    </div>

                    {/* Product Info */}
                    <div className="cart-item-info">
                      <div className="cart-item-header">
                        <h3 className="cart-item-name">
                          <Link to={`/product/${productId}`}>
                            {product.name}
                          </Link>
                        </h3>
                        <span className="cart-item-price">
                          ${(product.price || 0).toFixed(2)}
                        </span>
                      </div>

                      <div className="cart-item-details">
                        <span className="cart-item-category">
                          {product.category}
                        </span>
                        <span className="cart-item-brand">{product.brand}</span>
                      </div>

                      {/* Stock Status */}
                      <div
                        className={`cart-item-stock ${
                          product.stock > 0 ? "in-stock" : "out-of-stock"
                        }`}
                      >
                        {product.stock > 0
                          ? `✅ ${product.stock} in stock`
                          : "❌ Out of stock"}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="cart-item-quantity">
                      <div className="quantity-control">
                        <button
                          onClick={() =>
                            handleQuantityChange(itemId, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="quantity-btn minus"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          min="1"
                          max="10"
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (val >= 1 && val <= 10) {
                              handleQuantityChange(itemId, val);
                            }
                          }}
                          className="quantity-input"
                        />
                        <button
                          onClick={() =>
                            handleQuantityChange(itemId, item.quantity + 1)
                          }
                          disabled={
                            item.quantity >= 10 ||
                            item.quantity >= product.stock
                          }
                          className="quantity-btn plus"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(itemId, product.name)}
                        className="remove-item-btn"
                      >
                        Remove
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="cart-item-total">
                      <span className="item-total-label">Item Total:</span>
                      <span className="item-total-price">
                        ${((product.price || 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h2>Order Summary</h2>

            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal ({getTotalItems()} items)</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <span className="free-shipping">FREE</span>
              </div>

              <div className="summary-row">
                <span>Tax</span>
                <span>${(getTotalPrice() * 0.1).toFixed(2)}</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row total">
                <span>Total</span>
                <span className="total-price">
                  ${(getTotalPrice() * 1.1).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="checkout-btn"
            >
              {checkoutLoading ? (
                <>
                  <span className="spinner-small"></span>
                  Processing...
                </>
              ) : (
                "Proceed to Checkout"
              )}
            </button>

            {/* Payment Methods */}
            <div className="payment-methods">
              <p>We accept:</p>
              <div className="payment-icons">
                <span>💳</span>
                <span>🏦</span>
                <span>📱</span>
                <span>💰</span>
              </div>
            </div>

            {/* Security Info */}
            <div className="security-info">
              <span className="security-icon">🔒</span>
              <span>Secure checkout · SSL encrypted</span>
            </div>

            {/* Continue Shopping */}
            <div className="continue-shopping">
              <Link to="/shop" className="back-to-shop">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
