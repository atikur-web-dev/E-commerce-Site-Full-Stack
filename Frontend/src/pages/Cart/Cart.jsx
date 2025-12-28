import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import "./Cart.css";

const Cart = () => {
  const { cart, updateCartItem, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState({});

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating({ ...updating, [itemId]: true });
    try {
      await updateCartItem(itemId, newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setUpdating({ ...updating, [itemId]: false });
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (window.confirm("Are you sure you want to remove this item?")) {
      await removeFromCart(itemId);
    }
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  // Calculate totals
  const subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = subtotal > 500 ? 0 : 50;
  const tax = subtotal * 0.05;
  const total = subtotal + shipping + tax;

  if (cart.items.length === 0) {
    return (
      <div className="empty-cart">
        <div className="empty-cart-icon">🛒</div>
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added any items to your cart yet.</p>
        <Link to="/shop" className="btn btn-primary">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>🛒 Shopping Cart</h1>
        <p>You have {cart.items.length} item{cart.items.length > 1 ? 's' : ''} in your cart</p>
      </div>

      <div className="cart-container">
        {/* Cart Items */}
        <div className="cart-items-section">
          <div className="cart-items-header">
            <h3>Cart Items</h3>
            <button onClick={clearCart} className="clear-cart-btn">
              Clear Cart
            </button>
          </div>

          <div className="cart-items-list">
            {cart.items.map((item) => (
              <div key={item._id} className="cart-item">
                {/* Product Image */}
                <div className="cart-item-image">
                  <img 
                    src={item.product?.images?.[0] || "/default-product.jpg"} 
                    alt={item.product?.name}
                    onError={(e) => {
                      e.target.src = "/default-product.jpg";
                      e.target.onerror = null;
                    }}
                  />
                </div>

                {/* Product Info */}
                <div className="cart-item-info">
                  <Link to={`/product/${item.product?._id}`} className="product-name">
                    {item.product?.name || "Product"}
                  </Link>
                  <div className="product-meta">
                    <span className="product-category">{item.product?.category}</span>
                    <span className="product-brand">{item.product?.brand}</span>
                  </div>
                  <div className="stock-status">
                    {item.product?.stock > 0 ? (
                      <span className="in-stock">✅ In Stock</span>
                    ) : (
                      <span className="out-of-stock">❌ Out of Stock</span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="cart-item-quantity">
                  <div className="quantity-controls">
                    <button 
                      onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                      disabled={item.quantity <= 1 || updating[item._id]}
                      className="quantity-btn"
                    >
                      −
                    </button>
                    <span className="quantity-display">
                      {updating[item._id] ? (
                        <span className="spinner spinner-sm"></span>
                      ) : (
                        item.quantity
                      )}
                    </span>
                    <button 
                      onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                      disabled={updating[item._id]}
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="cart-item-price">
                  <div className="unit-price">৳{item.price.toFixed(2)}</div>
                  <div className="total-price">
                    ৳{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>

                {/* Remove Button */}
                <button 
                  onClick={() => handleRemoveItem(item._id)}
                  className="remove-item-btn"
                  title="Remove item"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-summary-section">
          <div className="order-summary-card">
            <h3>Order Summary</h3>
            
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>৳{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="summary-row">
                <span>Shipping</span>
                <span className={shipping === 0 ? "free" : ""}>
                  {shipping === 0 ? "FREE" : `৳${shipping.toFixed(2)}`}
                </span>
              </div>
              
              <div className="summary-row">
                <span>Tax (5%)</span>
                <span>৳{tax.toFixed(2)}</span>
              </div>
              
              <div className="summary-divider"></div>
              
              <div className="summary-row total">
                <span><strong>Total</strong></span>
                <span><strong>৳{total.toFixed(2)}</strong></span>
              </div>
              
              <div className="shipping-note">
                {subtotal < 500 ? (
                  <p>🎁 Add ৳{(500 - subtotal).toFixed(2)} more for FREE shipping!</p>
                ) : (
                  <p>🎉 You qualify for FREE shipping!</p>
                )}
              </div>
            </div>

            <button 
              onClick={handleProceedToCheckout}
              className="checkout-btn btn-primary"
            >
              {user ? "Proceed to Checkout" : "Login to Checkout"}
            </button>

            <div className="payment-methods">
              <p>🔒 Secure Payment</p>
              <div className="payment-icons">
                <span>💳</span>
                <span>📱</span>
                <span>💰</span>
              </div>
            </div>

            <div className="cart-features">
              <h4>🛡️ Shop with Confidence</h4>
              <ul>
                <li>✅ 7-Day Return Policy</li>
                <li>✅ Secure Payment</li>
                <li>✅ Fast Delivery</li>
                <li>✅ 24/7 Support</li>
              </ul>
            </div>
          </div>

          {/* Continue Shopping */}
          <Link to="/shop" className="continue-shopping">
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;