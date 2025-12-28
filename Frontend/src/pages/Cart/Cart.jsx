import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import "./Cart.css";

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, getTotalPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState({});
  const [loading, setLoading] = useState(false);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating({ ...updating, [itemId]: true });
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setUpdating({ ...updating, [itemId]: false });
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (window.confirm("Are you sure you want to remove this item?")) {
      try {
        await removeFromCart(itemId);
      } catch (error) {
        console.error("Error removing item:", error);
      }
    }
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      try {
        await clearCart();
      } catch (error) {
        console.error("Error clearing cart:", error);
      }
    }
  };

  // Calculate totals safely
  const calculateTotals = () => {
    if (!cartItems || cartItems.length === 0) {
      return { subtotal: 0, shipping: 0, tax: 0, total: 0 };
    }

    const subtotal = getTotalPrice();
    const shipping = subtotal > 500 ? 0 : 50;
    const tax = subtotal * 0.05;
    const total = subtotal + shipping + tax;

    return { subtotal, shipping, tax, total };
  };

  const { subtotal, shipping, tax, total } = calculateTotals();

  if (loading) {
    return (
      <div className="cart-loading">
        <div className="spinner"></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="empty-cart">
        <div className="empty-icon">🛒</div>
        <h2>Your Shopping Cart is Empty</h2>
        <p>Add some amazing gadgets to get started!</p>
        <Link to="/shop" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="page-title">🛒 Shopping Cart</h1>
        <p className="page-subtitle">Review and manage your items</p>
        
        <div className="cart-content">
          {/* Cart Items Section */}
          <div className="cart-items-section">
            <div className="cart-header">
              <h2>Your Items ({cartItems.length})</h2>
              <button onClick={handleClearCart} className="clear-all-btn">
                Clear All
              </button>
            </div>
            
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item._id || item.product?._id} className="cart-item">
                  {/* Item Image */}
                  <div className="item-image">
                    <img 
                      src={item.product?.images?.[0] || item.image || "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=150&h=150&fit=crop"} 
                      alt={item.product?.name || item.name || "Product"}
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=150&h=150&fit=crop";
                        e.target.onerror = null;
                      }}
                    />
                  </div>
                  
                  {/* Item Details */}
                  <div className="item-details">
                    <h3 className="item-name">
                      <Link to={`/product/${item.product?._id || item._id}`}>
                        {item.product?.name || item.name || "Product"}
                      </Link>
                    </h3>
                    <p className="item-category">{item.product?.category || "Electronics"}</p>
                    <p className="item-price">
                      ৳{(item.product?.price || item.price || 0).toFixed(2)} each
                    </p>
                    {item.product?.stock && item.product.stock < 10 && (
                      <p className="stock-warning">⚠️ Only {item.product.stock} left in stock</p>
                    )}
                  </div>
                  
                  {/* Quantity Controls */}
                  <div className="item-quantity">
                    <div className="quantity-control">
                      <button 
                        onClick={() => handleUpdateQuantity(item._id || item.product?._id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || updating[item._id]}
                        className="quantity-btn"
                      >
                        −
                      </button>
                      <span className="quantity">
                        {updating[item._id] ? (
                          <span className="mini-spinner"></span>
                        ) : (
                          item.quantity
                        )}
                      </span>
                      <button 
                        onClick={() => handleUpdateQuantity(item._id || item.product?._id, item.quantity + 1)}
                        disabled={updating[item._id] || (item.product?.stock && item.quantity >= item.product.stock)}
                        className="quantity-btn"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  {/* Item Total & Actions */}
                  <div className="item-total">
                    <div className="total-price">
                      ৳{((item.product?.price || item.price || 0) * item.quantity).toFixed(2)}
                    </div>
                    <button 
                      onClick={() => handleRemoveItem(item._id || item.product?._id)}
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Order Summary Section */}
          <div className="order-summary-section">
            <div className="summary-card">
              <h3>📋 Order Summary</h3>
              
              <div className="summary-details">
                <div className="summary-row">
                  <span>Subtotal ({cartItems.length} items)</span>
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
                  <span><strong>Grand Total</strong></span>
                  <span><strong>৳{total.toFixed(2)}</strong></span>
                </div>
                
                <div className="shipping-info">
                  {subtotal < 500 ? (
                    <p className="free-shipping-note">
                      🎁 Add ৳{(500 - subtotal).toFixed(2)} more to get FREE shipping!
                    </p>
                  ) : (
                    <p className="free-shipping-note">
                      🎉 You qualify for FREE shipping!
                    </p>
                  )}
                </div>
              </div>

              <button 
                onClick={handleProceedToCheckout}
                className="checkout-btn btn-primary"
                disabled={cartItems.length === 0}
              >
                {user ? "Proceed to Checkout" : "Login to Checkout"}
              </button>
              
              <div className="payment-security">
                <p className="security-note">🔒 Secure & Encrypted Payment</p>
                <div className="payment-methods">
                  <span className="payment-icon">💳</span>
                  <span className="payment-icon">📱</span>
                  <span className="payment-icon">💰</span>
                </div>
              </div>
              
              <Link to="/shop" className="continue-shopping">
                ← Continue Shopping
              </Link>
            </div>
            
            {/* Cart Benefits */}
            <div className="cart-benefits">
              <h4>🛡️ Shop with Confidence</h4>
              <ul>
                <li>✅ 30-Day Return Policy</li>
                <li>✅ Free Shipping over ৳500</li>
                <li>✅ 24/7 Customer Support</li>
                <li>✅ Secure Payment</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;