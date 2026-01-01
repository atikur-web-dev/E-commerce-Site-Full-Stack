import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import "./Checkout.css";

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    country: "Bangladesh",
    zipCode: "",
    phone: "",
    notes: ""
  });

  const [cardDetails, setCardDetails] = useState({
    number: "4242 4242 4242 4242",
    expiry: "12/34",
    cvc: "123",
    name: "Demo User"
  });

  // Calculate totals
  const itemsTotal = getTotalPrice();
  const shipping = itemsTotal > 500 ? 0 : 50;
  const tax = itemsTotal * 0.05;
  const grandTotal = itemsTotal + shipping + tax;

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        phone: user.phone || "",
        street: user.address?.street || "",
        city: user.address?.city || "",
        state: user.address?.state || "",
        zipCode: user.address?.zipCode || ""
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const required = ["street", "city", "state", "zipCode", "phone"];
    for (const field of required) {
      if (!formData[field].trim()) {
        alert(`Please fill in ${field}`);
        return false;
      }
    }
    return true;
  };

  const placeOrder = async () => {
    if (!validateForm()) return;
    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setLoading(true);
    setActiveStep(3);

    try {
      const orderData = {
        shippingAddress: formData,
        paymentMethod,
        notes: formData.notes
      };

      const response = await axios.post(
        "http://localhost:5000/api/orders",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setOrderSuccess(true);
        setOrderDetails(response.data.data);
        
        clearCart();
        
        setTimeout(() => {
          navigate(`/order/${response.data.data._id}`);
        }, 5000);
      }
    } catch (error) {
      console.error("Order error:", error);
      alert(error.response?.data?.message || "Failed to place order");
      setActiveStep(2);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !orderSuccess) {
    return (
      <div className="checkout-empty">
        <div className="empty-cart-icon">🛒</div>
        <h2>Your Cart is Empty</h2>
        <p>Add some amazing gadgets to your cart before checkout</p>
        <button 
          onClick={() => navigate("/shop")}
          className="btn btn-primary"
        >
          🛍️ Continue Shopping
        </button>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="order-success-page">
        <div className="success-animation">
          <div className="checkmark">✓</div>
        </div>
        
        <div className="success-header">
          <h1> Order Placed Successfully!</h1>
          <p className="success-subtitle">
            {paymentMethod === "cod" 
              ? "Your COD order has been confirmed. You'll pay when the product arrives."
              : "Payment successful! Your order is confirmed and being processed."}
          </p>
        </div>
        
        {orderDetails && (
          <div className="order-details-card">
            <div className="details-header">
              <h3>📦 Order Details</h3>
              <span className="order-badge">#{orderDetails._id.slice(-8).toUpperCase()}</span>
            </div>
            
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Order ID:</span>
                <span className="detail-value">{orderDetails._id.slice(-8).toUpperCase()}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Total Amount:</span>
                <span className="detail-value price">৳{orderDetails.totalPrice.toFixed(2)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Payment Method:</span>
                <span className={`detail-value method ${paymentMethod}`}>
                  {orderDetails.payment.method.toUpperCase()}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className="detail-value status-confirmed">✅ Confirmed</span>
              </div>
            </div>
          </div>
        )}

        <div className="order-timeline">
          <div className="timeline-item active">
            <div className="timeline-icon">1</div>
            <div className="timeline-content">
              <h4>Order Confirmed</h4>
              <p>Your order has been received</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-icon">2</div>
            <div className="timeline-content">
              <h4>Processing</h4>
              <p>Preparing your items</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-icon">3</div>
            <div className="timeline-content">
              <h4>Shipped</h4>
              <p>On its way to you</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-icon">4</div>
            <div className="timeline-content">
              <h4>Delivered</h4>
              <p>Arriving soon</p>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button 
            onClick={() => navigate("/orders")}
            className="btn btn-primary btn-lg"
          >
            📋 View My Orders
          </button>
          <button 
            onClick={() => navigate("/shop")}
            className="btn btn-outline btn-lg"
          >
            🛍️ Continue Shopping
          </button>
        </div>

        <div className="delivery-info">
          <div className="info-card">
            <div className="info-icon">📧</div>
            <div className="info-content">
              <h4>Email Confirmation</h4>
              <p>Order details sent to your email</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">📞</div>
            <div className="info-content">
              <h4>Need Help?</h4>
              <p>Contact: +880 1234 567890</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">🚚</div>
            <div className="info-content">
              <h4>Delivery</h4>
              <p>Estimated: 3-5 business days</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <h1>🛒 Checkout</h1>
        <p>Complete your purchase in just a few steps</p>
      </div>

      {/* Checkout Steps */}
      <div className="checkout-steps">
        <div className={`step ${activeStep >= 1 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-content">
            <h4>Shipping</h4>
            <p>Address Details</p>
          </div>
        </div>
        <div className={`step ${activeStep >= 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-content">
            <h4>Payment</h4>
            <p>Choose Method</p>
          </div>
        </div>
        <div className={`step ${activeStep >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-content">
            <h4>Confirm</h4>
            <p>Review & Pay</p>
          </div>
        </div>
      </div>

      <div className="checkout-container">
        <div className="checkout-left">
          {/* Shipping Address Section */}
          <div className="checkout-section">
            <div className="section-header">
              <div className="section-icon">📍</div>
              <div>
                <h3>Shipping Address</h3>
                <p className="section-subtitle">Where should we deliver your order?</p>
              </div>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Street Address *</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="123 Main Street"
                  required
                  className="form-input"
                />
                <div className="input-icon"></div>
              </div>
              
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Dhaka"
                  required
                  className="form-input"
                />
                <div className="input-icon"></div>
              </div>
              
              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="Dhaka Division"
                  required
                  className="form-input"
                />
                <div className="input-icon"></div>
              </div>
              
              <div className="form-group">
                <label>ZIP Code *</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  placeholder="1200"
                  required
                  className="form-input"
                />
                <div className="input-icon"></div>
              </div>
              
              <div className="form-group">
                <label>Country</label>
                <div className="country-input">
                  <span className="country-flag">🇧🇩</span>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    disabled
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+8801XXXXXXXXX"
                  required
                  className="form-input"
                />
                <div className="input-icon"></div>
              </div>
            </div>
            
            <div className="form-group">
              <label>
                <span className="label-icon">📝</span>
                Order Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any special instructions, delivery preferences, or notes..."
                rows="3"
                className="form-textarea"
              />
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="checkout-section">
            <div className="section-header">
              <div className="section-icon">💳</div>
              <div>
                <h3>Payment Method</h3>
                <p className="section-subtitle">Choose how you want to pay</p>
              </div>
            </div>
            
            <div className="payment-methods">
              <div 
                className={`payment-option ${paymentMethod === "cod" ? "selected" : ""}`}
                onClick={() => {
                  setPaymentMethod("cod");
                  setActiveStep(2);
                }}
              >
                <div className="option-icon">💰</div>
                <div className="option-content">
                  <h4>Cash on Delivery (COD)</h4>
                  <p>Pay when you receive the product</p>
                  <div className="option-tags">
                    <span className="tag popular">Most Popular</span>
                    <span className="tag available">Available in Bangladesh</span>
                  </div>
                </div>
                <div className="option-check">
                  <div className={`checkmark ${paymentMethod === "cod" ? 'checked' : ''}`}>
                    {paymentMethod === "cod" && ''}
                  </div>
                </div>
              </div>
              
              <div 
                className={`payment-option ${paymentMethod === "card" ? "selected" : ""}`}
                onClick={() => {
                  setPaymentMethod("card");
                  setActiveStep(2);
                }}
              >
                <div className="option-icon">💳</div>
                <div className="option-content">
                  <h4>Credit/Debit Card</h4>
                  <p>Pay securely with card</p>
                  <div className="option-tags">
                    <span className="tag demo">Demo Mode</span>
                    <span className="tag secure">Secure Payment</span>
                  </div>
                </div>
                <div className="option-check">
                  <div className={`checkmark ${paymentMethod === "card" ? 'checked' : ''}`}>
                    {paymentMethod === "card" && ''}
                  </div>
                </div>
              </div>
            </div>

            {paymentMethod === "card" && (
              <div className="demo-card-form">
                <div className="demo-header">
                  <h4>
                    <span className="demo-icon">🔒</span>
                    Demo Payment Form
                  </h4>
                  <span className="demo-badge">For Presentation Only</span>
                </div>
                
                <div className="demo-info">
                  <p>
                    <span className="info-icon">ℹ️</span>
                    <strong>Note:</strong> This is a demonstration for Practicum project. No real payment will be processed.
                  </p>
                </div>
                
                <div className="card-form">
                  <div className="form-group">
                    <label>Card Number</label>
                    <div className="card-input">
                      <input
                        type="text"
                        name="number"
                        value={cardDetails.number}
                        onChange={handleCardChange}
                        placeholder="4242 4242 4242 4242"
                        className="form-input"
                      />
                      <div className="card-icon">💳</div>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <div className="card-input">
                        <input
                          type="text"
                          name="expiry"
                          value={cardDetails.expiry}
                          onChange={handleCardChange}
                          placeholder="MM/YY"
                          className="form-input"
                        />
                        <div className="card-icon">📅</div>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>CVC</label>
                      <div className="card-input">
                        <input
                          type="text"
                          name="cvc"
                          value={cardDetails.cvc}
                          onChange={handleCardChange}
                          placeholder="123"
                          className="form-input"
                        />
                        <div className="card-icon">🔒</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Cardholder Name</label>
                    <input
                      type="text"
                      name="name"
                      value={cardDetails.name}
                      onChange={handleCardChange}
                      placeholder="Demo User"
                      className="form-input"
                    />
                  </div>
                </div>
                
                <div className="test-cards">
                  <h5>
                    <span className="test-icon"></span>
                    Test Cards for Demo
                  </h5>
                  <div className="test-card-list">
                    <div className="test-card">
                      <div className="test-card-header">
                        <span className="card-type visa">VISA</span>
                        <span className="card-status success">Always succeeds</span>
                      </div>
                      <code>4242 4242 4242 4242</code>
                    </div>
                    <div className="test-card">
                      <div className="test-card-header">
                        <span className="card-type mastercard">MASTERCARD</span>
                        <span className="card-status success">Always succeeds</span>
                      </div>
                      <code>5555 5555 5555 4444</code>
                    </div>
                    <div className="test-card">
                      <div className="test-card-header">
                        <span className="card-type visa">VISA</span>
                        <span className="card-status fail">Always fails</span>
                      </div>
                      <code>4000 0000 0000 0002</code>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="checkout-right">
          <div className="order-summary-card">
            <div className="summary-header">
              <h3>📋 Order Summary</h3>
              <span className="item-count">{cartItems.length} items</span>
            </div>
            
            <div className="order-items">
              {cartItems.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-image">
                    <img 
                      src={item.product?.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop"} 
                      alt={item.product?.name}
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop";
                        e.target.onerror = null;
                      }}
                    />
                  </div>
                  <div className="item-info">
                    <h4 className="item-name">{item.product?.name || "Product"}</h4>
                    <p className="item-specs">Qty: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    ৳{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="price-breakdown">
              <div className="price-row">
                <span>Items Total</span>
                <span>৳{itemsTotal.toFixed(2)}</span>
              </div>
              
              <div className="price-row">
                <span>Shipping</span>
                <span className={shipping === 0 ? "free" : ""}>
                  {shipping === 0 ? (
                    <>
                      <span className="free-badge">FREE</span>
                      <span className="free-note">(Order over ৳500)</span>
                    </>
                  ) : `৳${shipping.toFixed(2)}`}
                </span>
              </div>
              
              <div className="price-row">
                <span>Tax (5%)</span>
                <span>৳{tax.toFixed(2)}</span>
              </div>
              
              <div className="price-row total">
                <span><strong>Grand Total</strong></span>
                <span className="grand-total">৳{grandTotal.toFixed(2)}</span>
              </div>
            </div>
            
            <button 
              className="place-order-btn"
              onClick={placeOrder}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Processing Order...
                </>
              ) : paymentMethod === "cod" ? (
                <>
                  <span className="btn-icon">✓</span>
                  Place COD Order
                </>
              ) : (
                <>
                  <span className="btn-icon">💳</span>
                  Pay Now (Demo)
                </>
              )}
            </button>
            
            <div className="security-info">
              <div className="security-item">
                <span className="security-icon">🔒</span>
                <span>Your payment information is secure</span>
              </div>
              <div className="security-item">
                <span className="security-icon">🔄</span>
                <span>Easy returns within 7 days</span>
              </div>
              <div className="security-item">
                <span className="security-icon">📦</span>
                <span>Estimated delivery: 3-5 business days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;