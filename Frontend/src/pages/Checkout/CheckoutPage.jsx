import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import "./Checkout.css";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    country: "Bangladesh",
    zipCode: "",
    phone: "",
    notes: ""
  });

  // Demo card state
  const [cardDetails, setCardDetails] = useState({
    number: "4242 4242 4242 4242",
    expiry: "12/34",
    cvc: "123",
    name: "Demo User"
  });

  // Calculate totals
  const itemsTotal = getCartTotal();
  const shipping = itemsTotal > 500 ? 0 : 50;
  const tax = itemsTotal * 0.05;
  const grandTotal = itemsTotal + shipping + tax;

  // Auto-fill user data
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
    if (cart.items.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setLoading(true);

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
        
        // Clear cart
        clearCart();
        
        // Show success message
        setTimeout(() => {
          navigate(`/order/${response.data.data._id}`);
        }, 3000);
      }
    } catch (error) {
      console.error("Order error:", error);
      alert(error.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0 && !orderSuccess) {
    return (
      <div className="checkout-empty">
        <h2>🛒 Your cart is empty</h2>
        <p>Add some products to your cart before checkout</p>
        <button onClick={() => navigate("/shop")}>Continue Shopping</button>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="order-success">
        <div className="success-icon">✅</div>
        <h2>🎉 Order Placed Successfully!</h2>
        <p className="success-message">
          {paymentMethod === "cod" 
            ? "Your COD order has been placed. You'll pay when the product arrives."
            : "Payment successful! Your order is confirmed."}
        </p>
        
        {orderDetails && (
          <div className="order-summary">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> {orderDetails._id.slice(-8).toUpperCase()}</p>
            <p><strong>Total Amount:</strong> ৳{orderDetails.totalPrice.toFixed(2)}</p>
            <p><strong>Payment Method:</strong> {orderDetails.payment.method.toUpperCase()}</p>
            <p><strong>Status:</strong> <span className="status-confirmed">Confirmed</span></p>
          </div>
        )}

        <div className="demo-notice">
          <h4>🎓 Practicum Project Demo</h4>
          <p>This is a demonstration of the checkout process. In a real application:</p>
          <ul>
            <li>Real payment gateway integration</li>
            <li>Email confirmation</li>
            <li>SMS notifications</li>
            <li>Order tracking</li>
          </ul>
        </div>

        <div className="action-buttons">
          <button onClick={() => navigate("/orders")}>View My Orders</button>
          <button onClick={() => navigate("/shop")}>Continue Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h2 className="page-title">Checkout</h2>
      
      <div className="checkout-container">
        {/* Left Column - Shipping & Payment */}
        <div className="checkout-left">
          {/* Shipping Address */}
          <div className="checkout-section">
            <h3>🚚 Shipping Address</h3>
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
                />
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
                />
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
                />
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
                />
              </div>
              
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  disabled
                />
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
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Order Notes (Optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any special instructions..."
                rows="3"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="checkout-section">
            <h3>💳 Payment Method</h3>
            
            <div className="payment-methods">
              <div 
                className={`payment-option ${paymentMethod === "cod" ? "selected" : ""}`}
                onClick={() => setPaymentMethod("cod")}
              >
                <div className="option-icon">💰</div>
                <div className="option-content">
                  <h4>Cash on Delivery (COD)</h4>
                  <p>Pay when you receive the product</p>
                  <small>Available in Bangladesh</small>
                </div>
                <div className="option-radio">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    checked={paymentMethod === "cod"}
                    readOnly
                  />
                </div>
              </div>
              
              <div 
                className={`payment-option ${paymentMethod === "card" ? "selected" : ""}`}
                onClick={() => setPaymentMethod("card")}
              >
                <div className="option-icon">💳</div>
                <div className="option-content">
                  <h4>Credit/Debit Card</h4>
                  <p>Pay securely with card</p>
                  <div className="demo-tag">Demo Mode</div>
                </div>
                <div className="option-radio">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    checked={paymentMethod === "card"}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Demo Card Form */}
            {paymentMethod === "card" && (
              <div className="demo-card-form">
                <div className="demo-header">
                  <h4>🎓 Demo Payment Form</h4>
                  <span className="demo-badge">For Presentation Only</span>
                </div>
                
                <div className="demo-info">
                  <p><strong>Note:</strong> This is a demonstration for Practicum project. No real payment will be processed.</p>
                </div>
                
                <div className="card-form">
                  <div className="form-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      name="number"
                      value={cardDetails.number}
                      onChange={handleCardChange}
                      placeholder="4242 4242 4242 4242"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        name="expiry"
                        value={cardDetails.expiry}
                        onChange={handleCardChange}
                        placeholder="MM/YY"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>CVC</label>
                      <input
                        type="text"
                        name="cvc"
                        value={cardDetails.cvc}
                        onChange={handleCardChange}
                        placeholder="123"
                      />
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
                    />
                  </div>
                </div>
                
                <div className="test-cards">
                  <p><strong>💡 Test Cards for Demo:</strong></p>
                  <div className="test-card-list">
                    <div className="test-card">
                      <code>4242 4242 4242 4242</code>
                      <span>Visa (Always succeeds)</span>
                    </div>
                    <div className="test-card">
                      <code>5555 5555 5555 4444</code>
                      <span>Mastercard (Always succeeds)</span>
                    </div>
                    <div className="test-card">
                      <code>4000 0000 0000 0002</code>
                      <span>Visa (Always fails - for testing)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="checkout-right">
          <div className="order-summary-card">
            <h3>Order Summary</h3>
            
            <div className="order-items">
              {cart.items.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-info">
                    <span className="item-name">{item.product?.name || "Product"}</span>
                    <span className="item-quantity">x{item.quantity}</span>
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
                  {shipping === 0 ? "FREE" : `৳${shipping.toFixed(2)}`}
                </span>
              </div>
              
              <div className="price-row">
                <span>Tax (5%)</span>
                <span>৳{tax.toFixed(2)}</span>
              </div>
              
              <div className="price-row total">
                <span><strong>Grand Total</strong></span>
                <span><strong>৳{grandTotal.toFixed(2)}</strong></span>
              </div>
            </div>
            
            <button 
              className="place-order-btn"
              onClick={placeOrder}
              disabled={loading}
            >
              {loading ? "Processing..." : paymentMethod === "cod" ? "Place COD Order" : "Pay Now (Demo)"}
            </button>
            
            <div className="security-note">
              <p>🔒 Your payment information is secure</p>
              <p>📦 Estimated delivery: 3-5 business days</p>
            </div>
            
            <div className="practicum-note">
              <h4>🎓 Practicum Project</h4>
              <p>This checkout system demonstrates:</p>
              <ul>
                <li>Cart management</li>
                <li>Order processing</li>
                <li>Payment simulation</li>
                <li>Database integration</li>
              </ul>
              <small>Presented by: Your Name | Date: January 2026</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;