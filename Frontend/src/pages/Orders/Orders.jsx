// Frontend/src/pages/Orders/Orders.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import "./Orders.css";

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showClearModal, setShowClearModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/orders/myorders",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders. Please try again.");
      // For demo purposes, create mock orders
      setOrders(generateMockOrders());
    } finally {
      setLoading(false);
    }
  };

  const generateMockOrders = () => {
    return [
      {
        _id: "order_1",
        orderNumber: "ORD-123456",
        totalPrice: 2499.99,
        orderStatus: "delivered",
        payment: { method: "card", status: "paid" },
        createdAt: "2024-01-10",
        orderItems: [
          { 
            name: "iPhone 15 Pro", 
            quantity: 1, 
            price: 999.99, 
            image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200&h=200&fit=crop" 
          },
          { 
            name: "AirPods Pro", 
            quantity: 1, 
            price: 250.0, 
            image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=200&h=200&fit=crop" 
          },
        ],
      },
      {
        _id: "order_2",
        orderNumber: "ORD-789012",
        totalPrice: 1599.98,
        orderStatus: "shipped",
        payment: { method: "cod", status: "pending" },
        createdAt: "2024-01-08",
        orderItems: [
          { 
            name: "Samsung Galaxy S24", 
            quantity: 1, 
            price: 899.99, 
            image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop" 
          },
          { 
            name: "Galaxy Watch 6", 
            quantity: 1, 
            price: 299.99, 
            image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&h=200&fit=crop" 
          },
          { 
            name: "Phone Case", 
            quantity: 2, 
            price: 20.0, 
            image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200&h=200&fit=crop" 
          },
        ],
      },
      {
        _id: "order_3",
        orderNumber: "ORD-345678",
        totalPrice: 749.97,
        orderStatus: "processing",
        payment: { method: "card", status: "paid" },
        createdAt: "2024-01-05",
        orderItems: [
          { 
            name: "Wireless Earbuds", 
            quantity: 1, 
            price: 149.99, 
            image: "https://images.unsplash.com/photo-1590658165737-15a047b8b5e8?w=200&h=200&fit=crop" 
          },
          { 
            name: "Power Bank", 
            quantity: 2, 
            price: 299.99, 
            image: "https://images.unsplash.com/photo-1605276373954-0c4a0dac5b12?w=200&h=200&fit=crop" 
          },
        ],
      },
    ];
  };

  const handleClearHistory = () => {
    setShowClearModal(true);
  };

  const confirmClearHistory = async () => {
    setDeleting(true);
    
    setTimeout(() => {
      setShowAnimation(true);
      
      setTimeout(() => {
        setOrders([]);
        setShowClearModal(false);
        setDeleting(false);
        setShowAnimation(false);
        
        setError("Order history cleared successfully!");
        
        setTimeout(() => {
          setError("");
        }, 3000);
      }, 1000);
    }, 1500);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "success";
      case "shipped":
        return "info";
      case "processing":
        return "warning";
      case "pending":
        return "secondary";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return "check";
      case "shipped":
        return "truck";
      case "processing":
        return "refresh";
      case "pending":
        return "clock";
      case "cancelled":
        return "x";
      default:
        return "package";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="loading-spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>Order History</h1>
        <p>Track and manage all your orders in one place</p>
      </div>

      {error && (
        <div className={`alert ${orders.length === 0 ? 'alert-success' : 'alert-warning'}`}>
          <span className="alert-icon">
            {orders.length === 0 ? "✓" : "!"}
          </span>
          {error}
        </div>
      )}

      {orders.length > 0 && (
        <div className="clear-history-section">
          <div className="clear-history-content">
            <h3>Manage Your Order History</h3>
            <p>You have {orders.length} orders in your history</p>
          </div>
          <button 
            className="clear-history-btn"
            onClick={handleClearHistory}
          >
            <span className="btn-icon">🗑️</span>
            Clear All History
          </button>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-icon">
            <svg className="icon" viewBox="0 0 24 24">
              <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm7 6c-1.65 0-3-1.35-3-3V5h6v6c0 1.65-1.35 3-3 3zm7-6c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
            </svg>
          </div>
          <h3>No Orders Yet</h3>
          <p>You haven't placed any orders. Start shopping now!</p>
          <button onClick={() => navigate("/shop")} className="btn btn-primary">
            <span className="btn-icon">🛍️</span>
            Start Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="orders-summary">
            <div className="summary-card">
              <div className="summary-icon">
                <svg className="icon" viewBox="0 0 24 24">
                  <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                </svg>
              </div>
              <h3>{orders.length}</h3>
              <p>Total Orders</p>
            </div>
            <div className="summary-card">
              <div className="summary-icon">
                <svg className="icon" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3>
                ৳{orders.reduce((sum, order) => sum + order.totalPrice, 0).toFixed(2)}
              </h3>
              <p>Total Spent</p>
            </div>
            <div className="summary-card">
              <div className="summary-icon">
                <svg className="icon" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <h3>{orders.filter((o) => o.orderStatus === "delivered").length}</h3>
              <p>Delivered</p>
            </div>
            <div className="summary-card">
              <div className="summary-icon">
                <svg className="icon" viewBox="0 0 24 24">
                  <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                </svg>
              </div>
              <h3>{orders.filter((o) => o.orderStatus !== "delivered").length}</h3>
              <p>In Progress</p>
            </div>
          </div>

          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h4>
                      Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                    </h4>
                    <p className="order-date">
                      <span className="date-icon">
                        <svg className="icon" viewBox="0 0 24 24">
                          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                        </svg>
                      </span>
                      Placed on: {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="order-status">
                    <span className={`status-badge status-${getStatusColor(order.orderStatus)}`}>
                      <span className={`status-icon ${getStatusIcon(order.orderStatus)}`}></span>
                      {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="order-items">
                  {order.orderItems?.slice(0, 3).map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="item-image">
                        <img
                          src={item.image || item.product?.images?.[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop"}
                          alt={item.name}
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop";
                            e.target.onerror = null;
                          }}
                        />
                      </div>
                      <div className="item-details">
                        <h5>{item.name}</h5>
                        <p>Qty: {item.quantity} × ৳{item.price.toFixed(2)}</p>
                      </div>
                      <div className="item-price">
                        ৳{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                  {order.orderItems?.length > 3 && (
                    <div className="more-items">
                      + {order.orderItems.length - 3} more items
                    </div>
                  )}
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    <strong>
                      <span className="total-icon">
                        <svg className="icon" viewBox="0 0 24 24">
                          <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                        </svg>
                      </span>
                      Total: ৳{order.totalPrice?.toFixed(2) || "0.00"}
                    </strong>
                    <small>
                      <span className="payment-icon">
                        <svg className="icon" viewBox="0 0 24 24">
                          <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                        </svg>
                      </span>
                      Payment: {order.payment?.method?.toUpperCase() || "COD"}
                    </small>
                  </div>
                  <div className="order-actions">
                    <button
                      onClick={() => navigate(`/order/${order._id}`)}
                      className="btn btn-outline btn-sm"
                    >
                      <span className="btn-icon">👁️</span>
                      View Details
                    </button>
                    {order.orderStatus === "pending" && (
                      <button className="btn btn-danger btn-sm">
                        <span className="btn-icon">❌</span>
                        Cancel Order
                      </button>
                    )}
                    {order.orderStatus === "delivered" && (
                      <button className="btn btn-success btn-sm">
                        <span className="btn-icon">📄</span>
                        Download Invoice
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="order-timeline-info">
        <h3>Order Status Guide</h3>
        <div className="timeline-steps">
          <div className="timeline-step">
            <span className="step-icon">
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
              </svg>
            </span>
            <h4>Order Placed</h4>
            <p>Your order has been received</p>
          </div>
          <div className="timeline-step">
            <span className="step-icon">
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </span>
            <h4>Processing</h4>
            <p>Preparing your order for shipment</p>
          </div>
          <div className="timeline-step">
            <span className="step-icon">
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              </svg>
            </span>
            <h4>Shipped</h4>
            <p>Order is on its way to you</p>
          </div>
          <div className="timeline-step">
            <span className="step-icon">
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm-1 14H5c-.55 0-1-.45-1-1V8l6.94 4.34c.65.41 1.47.41 2.12 0L20 8v9c0 .55-.45 1-1 1zm-7-7L4 6h16l-8 5z"/>
              </svg>
            </span>
            <h4>Delivered</h4>
            <p>Order successfully delivered</p>
          </div>
        </div>
      </div>

      {showClearModal && (
        <div className="clear-modal-overlay">
          <div className="clear-modal">
            <div className="modal-header">
              <h3>Clear Order History</h3>
              <button 
                className="modal-close"
                onClick={() => setShowClearModal(false)}
              >
                <svg className="icon" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              {showAnimation ? (
                <div className="deleting-animation">
                  <div className="trash-icon">
                    <svg className="icon" viewBox="0 0 24 24">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                  </div>
                  <p>Clearing your order history...</p>
                  <div className="loading-bar">
                    <div className="loading-progress"></div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="warning-icon">
                    <svg className="icon" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                  </div>
                  <p>Are you sure you want to clear your entire order history?</p>
                  <p className="warning-text">
                    <strong>This action cannot be undone!</strong><br/>
                    You will lose all your order records.
                  </p>
                  
                  <div className="order-stats">
                    <p>
                      <span className="stat-icon">📊</span>
                      Total Orders: {orders.length}
                    </p>
                    <p>
                      <span className="stat-icon">💰</span>
                      Total Spent: ৳{orders.reduce((sum, order) => sum + order.totalPrice, 0).toFixed(2)}
                    </p>
                  </div>
                </>
              )}
            </div>
            
            <div className="modal-footer">
              {!showAnimation && (
                <>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowClearModal(false)}
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={confirmClearHistory}
                    disabled={deleting}
                  >
                    {deleting ? "Clearing..." : "Yes, Clear All"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;