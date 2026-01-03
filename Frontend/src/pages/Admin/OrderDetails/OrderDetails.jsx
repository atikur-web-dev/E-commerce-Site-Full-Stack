// Frontend/src/pages/Admin/OrderDetails/OrderDetails.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import axios from "../../../services/api";
import "./OrderDetails.css";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [statusHistory, setStatusHistory] = useState([]);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/login");
      return;
    }

    fetchOrderDetails();
  }, [id, user, navigate]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Generate demo order data
      setTimeout(() => {
        const demoOrder = {
          id: id || "ORD-00123",
          customer: {
            id: "user_123",
            name: "John Doe",
            email: "john@example.com",
            phone: "+880 1234 567890",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
          },
          status: "processing",
          paymentMethod: "card",
          paymentStatus: "paid",
          orderDate: new Date().toISOString(),
          shippingDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          shippingAddress: {
            name: "John Doe",
            street: "123 Main Street",
            city: "Dhaka",
            state: "Dhaka",
            zipCode: "1212",
            country: "Bangladesh",
            phone: "+880 1234 567890"
          },
          billingAddress: {
            name: "John Doe",
            street: "123 Main Street",
            city: "Dhaka",
            state: "Dhaka",
            zipCode: "1212",
            country: "Bangladesh"
          },
          items: [
            {
              id: "prod_1",
              name: "iPhone 15 Pro",
              price: 129999,
              quantity: 1,
              image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=100&h=100&fit=crop",
              total: 129999
            },
            {
              id: "prod_2",
              name: "AirPods Pro",
              price: 24999,
              quantity: 2,
              image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=100&h=100&fit=crop",
              total: 49998
            }
          ],
          subtotal: 179997,
          shippingFee: 120,
          tax: 9000,
          discount: 5000,
          total: 184117,
          notes: "Please handle with care",
          trackingNumber: "TRK-789456123",
          shippingMethod: "Express Delivery"
        };

        setOrder(demoOrder);
        
        // Generate status history
        setStatusHistory([
          { status: "pending", date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), note: "Order placed by customer" },
          { status: "confirmed", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), note: "Order confirmed and payment verified" },
          { status: "processing", date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), note: "Order is being processed" }
        ]);
        
        setLoading(false);
      }, 1000);

    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Failed to load order details");
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      setUpdating(true);
      
      // Simulate API call
      setTimeout(() => {
        setOrder(prev => ({ ...prev, status: newStatus }));
        
        // Add to status history
        const newHistory = {
          status: newStatus,
          date: new Date().toISOString(),
          note: note || `Status updated to ${newStatus}`
        };
        setStatusHistory(prev => [...prev, newHistory]);
        setNote("");
        
        alert(`Order status updated to ${newStatus}`);
        setUpdating(false);
      }, 500);

    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update order status");
      setUpdating(false);
    }
  };

  const updateShippingInfo = async () => {
    if (!order.trackingNumber.trim()) {
      alert("Please enter tracking number");
      return;
    }

    try {
      setUpdating(true);
      
      // Simulate API call
      setTimeout(() => {
        alert("Shipping information updated successfully!");
        setUpdating(false);
      }, 500);

    } catch (err) {
      console.error("Error updating shipping:", err);
      alert("Failed to update shipping information");
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#3b82f6';
      case 'processing': return '#8b5cf6';
      case 'shipped': return '#06b6d4';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPaymentIcon = (method) => {
    switch(method) {
      case 'card': return '💳';
      case 'cod': return '💰';
      case 'bkash': return '📱';
      case 'nagad': return '📲';
      default: return '💳';
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="order-details-loading">
        <div className="spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-details-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Order</h3>
        <p>{error}</p>
        <button onClick={fetchOrderDetails} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-not-found">
        <div className="not-found-icon">📦</div>
        <h3>Order Not Found</h3>
        <p>The order you're looking for doesn't exist.</p>
        <Link to="/admin/orders" className="back-link">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="order-details">
      {/* Header */}
      <div className="order-header">
        <div>
          <h1>Order #{order.id}</h1>
          <div className="order-meta">
            <span className="order-date">Placed on {formatDate(order.orderDate)}</span>
            <span className="order-status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
              {order.status.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate("/admin/orders")}>
            ← Back to Orders
          </button>
          <button className="btn btn-primary" onClick={handlePrintInvoice}>
            🖨️ Print Invoice
          </button>
        </div>
      </div>

      <div className="order-content">
        {/* Left Column */}
        <div className="order-main">
          {/* Order Items */}
          <div className="order-section">
            <div className="section-header">
              <h3>Order Items</h3>
              <span className="item-count">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
            </div>
            <div className="order-items">
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="item-details">
                    <div className="item-header">
                      <h4>{item.name}</h4>
                      <span className="item-price">{formatCurrency(item.price)}</span>
                    </div>
                    <div className="item-meta">
                      <span className="quantity">Quantity: {item.quantity}</span>
                      <span className="sku">SKU: PROD-{item.id.split('_')[1]?.toUpperCase()}</span>
                    </div>
                    <div className="item-total">
                      Total: <strong>{formatCurrency(item.total)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-section">
            <h3>Order Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="label">Subtotal</span>
                <span className="value">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="summary-item">
                <span className="label">Shipping Fee</span>
                <span className="value">{formatCurrency(order.shippingFee)}</span>
              </div>
              <div className="summary-item">
                <span className="label">Tax</span>
                <span className="value">{formatCurrency(order.tax)}</span>
              </div>
              <div className="summary-item">
                <span className="label">Discount</span>
                <span className="value discount">-{formatCurrency(order.discount)}</span>
              </div>
              <div className="summary-item total">
                <span className="label">Total Amount</span>
                <span className="value">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="order-section">
            <h3>Shipping Information</h3>
            <div className="shipping-info">
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Shipping Method</span>
                  <span className="value">{order.shippingMethod}</span>
                </div>
                <div className="info-item">
                  <span className="label">Tracking Number</span>
                  <div className="tracking-input">
                    <input
                      type="text"
                      value={order.trackingNumber || ""}
                      onChange={(e) => setOrder(prev => ({ ...prev, trackingNumber: e.target.value }))}
                      placeholder="Enter tracking number"
                    />
                    <button
                      className="update-btn"
                      onClick={updateShippingInfo}
                      disabled={updating}
                    >
                      {updating ? "Updating..." : "Update"}
                    </button>
                  </div>
                </div>
                <div className="info-item">
                  <span className="label">Estimated Delivery</span>
                  <span className="value">{formatDate(order.deliveryDate)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="order-sidebar">
          {/* Customer Information */}
          <div className="sidebar-section">
            <h3>Customer Information</h3>
            <div className="customer-card">
              <div className="customer-avatar">
                <img src={order.customer.avatar} alt={order.customer.name} />
              </div>
              <div className="customer-details">
                <h4>{order.customer.name}</h4>
                <p className="customer-email">{order.customer.email}</p>
                <p className="customer-phone">{order.customer.phone}</p>
                <Link to={`/admin/users/${order.customer.id}`} className="view-profile">
                  View Profile →
                </Link>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="sidebar-section">
            <h3>Update Order Status</h3>
            <div className="status-actions">
              {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                <button
                  key={status}
                  className={`status-btn ${order.status === status ? 'active' : ''}`}
                  onClick={() => updateOrderStatus(status)}
                  disabled={updating || order.status === status}
                  style={{ backgroundColor: getStatusColor(status) }}
                >
                  {status.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="status-note">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note about this status update..."
                rows="3"
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="sidebar-section">
            <h3>Shipping Address</h3>
            <div className="address-card">
              <p><strong>{order.shippingAddress.name}</strong></p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              <p>{order.shippingAddress.country}</p>
              <p className="phone">📱 {order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* Payment Information */}
          <div className="sidebar-section">
            <h3>Payment Information</h3>
            <div className="payment-card">
              <div className="payment-method">
                <span className="payment-icon">{getPaymentIcon(order.paymentMethod)}</span>
                <span className="payment-text">{order.paymentMethod.toUpperCase()}</span>
              </div>
              <div className={`payment-status ${order.paymentStatus}`}>
                <span className="status-dot"></span>
                {order.paymentStatus.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Order Notes */}
          <div className="sidebar-section">
            <h3>Order Notes</h3>
            <div className="notes-card">
              <p>{order.notes || "No special notes for this order."}</p>
            </div>
          </div>

          {/* Status History */}
          <div className="sidebar-section">
            <h3>Status History</h3>
            <div className="history-timeline">
              {statusHistory.map((item, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-marker" style={{ backgroundColor: getStatusColor(item.status) }}></div>
                  <div className="timeline-content">
                    <div className="timeline-status">{item.status.toUpperCase()}</div>
                    <div className="timeline-date">{formatDate(item.date)}</div>
                    <div className="timeline-note">{item.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;