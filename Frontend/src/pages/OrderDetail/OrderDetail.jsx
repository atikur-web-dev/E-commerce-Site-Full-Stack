// Frontend/src/pages/OrderDetail/OrderDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import "./OrderDetail.css";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchOrder();
  }, [id, user]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setOrder(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      setError("Failed to load order details. Using demo data.");
      setOrder(generateDemoOrder());
    } finally {
      setLoading(false);
    }
  };

  const generateDemoOrder = () => {
    return {
      _id: id || "demo_order_123",
      orderNumber: `ORD-${id?.slice(-8)?.toUpperCase() || "12345678"}`,
      totalPrice: 2499.99,
      itemsPrice: 2399.99,
      shippingPrice: 0,
      taxPrice: 100,
      orderStatus: "delivered",
      payment: {
        method: "card",
        status: "paid",
        transactionId: "txn_123456789",
        paidAt: "2024-01-10T10:30:00Z"
      },
      shippingAddress: {
        street: "123 Demo Street",
        city: "Dhaka",
        state: "Dhaka Division",
        country: "Bangladesh",
        zipCode: "1200",
        phone: "+8801712345678"
      },
      createdAt: "2024-01-10T09:15:00Z",
      deliveredAt: "2024-01-12T14:20:00Z",
      orderItems: [
        {
          product: { name: "iPhone 15 Pro", images: [""] },
          name: "iPhone 15 Pro",
          quantity: 1,
          price: 999.99,
          image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200&h=200&fit=crop"
        },
        {
          product: { name: "AirPods Pro", images: [""] },
          name: "AirPods Pro",
          quantity: 1,
          price: 250.00,
          image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=200&h=200&fit=crop"
        },
        {
          product: { name: "Apple Watch Series 9", images: [""] },
          name: "Apple Watch Series 9",
          quantity: 1,
          price: 399.99,
          image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&h=200&fit=crop"
        },
        {
          product: { name: "USB-C Cable", images: [""] },
          name: "USB-C Cable",
          quantity: 2,
          price: 20.00,
          image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200&h=200&fit=crop"
        }
      ]
    };
  };

  const getStatusSteps = () => {
    const steps = [
      { status: "pending", label: "Order Placed", date: order?.createdAt },
      { status: "processing", label: "Processing", date: order?.createdAt },
      { status: "shipped", label: "Shipped", date: order?.createdAt },
      { status: "delivered", label: "Delivered", date: order?.deliveredAt }
    ];

    const currentStatusIndex = steps.findIndex(step => step.status === order?.orderStatus);
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentStatusIndex,
      active: index === currentStatusIndex
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return (
          <svg className="status-icon" viewBox="0 0 24 24">
            <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
          </svg>
        );
      case "processing":
        return (
          <svg className="status-icon" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        );
      case "shipped":
        return (
          <svg className="status-icon" viewBox="0 0 24 24">
            <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
        );
      case "delivered":
        return (
          <svg className="status-icon" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm-1 14H5c-.55 0-1-.45-1-1V8l6.94 4.34c.65.41 1.47.41 2.12 0L20 8v9c0 .55-.45 1-1 1z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="order-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-not-found">
        <div className="not-found-icon">
          <svg viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </div>
        <h3>Order Not Found</h3>
        <p>The order you're looking for doesn't exist.</p>
        <button onClick={() => navigate("/orders")} className="btn btn-primary">
          <span className="btn-icon">←</span>
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      <div className="order-header-section">
        <div className="order-header">
          <div className="order-title">
            <h1>Order #{order.orderNumber}</h1>
            <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="order-status-badge">
            <span className={`status-badge status-${order.orderStatus}`}>
              {getStatusIcon(order.orderStatus)}
              {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Order Timeline */}
      <div className="order-timeline-card">
        <div className="timeline-header">
          <h3>Order Tracking</h3>
          <p>Track your order journey</p>
        </div>
        <div className="timeline-container">
          <div className="timeline-track">
            {getStatusSteps().map((step, index) => (
              <div key={step.status} className={`timeline-step ${step.completed ? "completed" : ""} ${step.active ? "active" : ""}`}>
                <div className="step-marker">
                  <div className="step-icon">
                    {getStatusIcon(step.status)}
                  </div>
                  <div className="step-connector"></div>
                </div>
                <div className="step-content">
                  <h4>{step.label}</h4>
                  {step.date && <p>{formatDate(step.date)}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="order-details-grid">
        {/* Left Column - Order Items */}
        <div className="order-items-section">
          <div className="section-header">
            <h3>Order Items ({order.orderItems?.length || 0})</h3>
            <p>Products included in this order</p>
          </div>
          <div className="items-list">
            {order.orderItems?.map((item, index) => (
              <div key={index} className="order-item-detail">
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
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p className="item-sku">SKU: {item.product?._id?.slice(-8) || "SKU-" + index}</p>
                </div>
                <div className="item-quantity">
                  <span>Qty: {item.quantity}</span>
                </div>
                <div className="item-price">
                  <span className="unit-price">৳{item.price.toFixed(2)} each</span>
                  <span className="total-price">৳{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
          <div className="price-breakdown">
            <div className="section-header">
              <h4>Price Breakdown</h4>
            </div>
            <div className="price-rows">
              <div className="price-row">
                <span>Items Total</span>
                <span>৳{order.itemsPrice?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="price-row">
                <span>Shipping</span>
                <span className={order.shippingPrice === 0 ? "free" : ""}>
                  {order.shippingPrice === 0 ? (
                    <>
                      <span className="free-badge">FREE</span>
                    </>
                  ) : `৳${order.shippingPrice?.toFixed(2) || "0.00"}`}
                </span>
              </div>
              <div className="price-row">
                <span>Tax</span>
                <span>৳{order.taxPrice?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="price-row total">
                <span><strong>Grand Total</strong></span>
                <span><strong>৳{order.totalPrice?.toFixed(2) || "0.00"}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Order Info */}
        <div className="order-info-section">
          {/* Shipping Address */}
          <div className="info-card">
            <div className="section-header">
              <h3>Shipping Address</h3>
              <p>Delivery information</p>
            </div>
            <div className="address-details">
              <div className="address-line">
                <svg className="icon" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <div>
                  <strong>{user?.name || "Demo User"}</strong>
                  <p>{order.shippingAddress?.street}</p>
                  <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                  <p>{order.shippingAddress?.country} - {order.shippingAddress?.zipCode}</p>
                </div>
              </div>
              <div className="address-line">
                <svg className="icon" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
                <div>
                  <p>{order.shippingAddress?.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="info-card">
            <div className="section-header">
              <h3>Payment Information</h3>
              <p>Payment details</p>
            </div>
            <div className="payment-details">
              <div className="detail-row">
                <span>Method:</span>
                <span className="payment-method">{order.payment?.method?.toUpperCase() || "COD"}</span>
              </div>
              <div className="detail-row">
                <span>Status:</span>
                <span className={`payment-status ${order.payment?.status}`}>
                  {order.payment?.status?.toUpperCase() || "PENDING"}
                </span>
              </div>
              {order.payment?.transactionId && (
                <div className="detail-row">
                  <span>Transaction ID:</span>
                  <span className="transaction-id">{order.payment.transactionId}</span>
                </div>
              )}
              {order.payment?.paidAt && (
                <div className="detail-row">
                  <span>Paid on:</span>
                  <span>{formatDate(order.payment.paidAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Actions */}
          <div className="info-card">
            <div className="section-header">
              <h3>Order Actions</h3>
              <p>Manage your order</p>
            </div>
            <div className="order-actions">
              <button className="btn btn-outline btn-block" onClick={handlePrintInvoice}>
                <svg className="btn-icon" viewBox="0 0 24 24">
                  <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
                </svg>
                Print Invoice
              </button>
              {order.orderStatus === "pending" && (
                <button className="btn btn-danger btn-block">
                  <svg className="btn-icon" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                  Cancel Order
                </button>
              )}
              {order.orderStatus === "delivered" && (
                <button className="btn btn-success btn-block">
                  <svg className="btn-icon" viewBox="0 0 24 24">
                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                  </svg>
                  Request Return
                </button>
              )}
              <button 
                onClick={() => navigate("/orders")}
                className="btn btn-secondary btn-block"
              >
                <svg className="btn-icon" viewBox="0 0 24 24">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
                Back to Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;