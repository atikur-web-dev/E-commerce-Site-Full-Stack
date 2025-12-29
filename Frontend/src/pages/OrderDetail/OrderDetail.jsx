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
      // Generate demo order for presentation
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
          image: ""
        },
        {
          product: { name: "AirPods Pro", images: [""] },
          name: "AirPods Pro",
          quantity: 1,
          price: 250.00,
          image: ""
        },
        {
          product: { name: "Apple Watch Series 9", images: [""] },
          name: "Apple Watch Series 9",
          quantity: 1,
          price: 399.99,
          image: ""
        },
        {
          product: { name: "USB-C Cable", images: [""] },
          name: "USB-C Cable",
          quantity: 2,
          price: 20.00,
          image: ""
        }
      ]
    };
  };

  const getStatusSteps = () => {
    const steps = [
      { status: "pending", label: "Order Placed", icon: "🛒", date: order?.createdAt },
      { status: "processing", label: "Processing", icon: "🔄", date: order?.createdAt },
      { status: "shipped", label: "Shipped", icon: "🚚", date: order?.createdAt },
      { status: "delivered", label: "Delivered", icon: "✅", date: order?.deliveredAt }
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

  if (loading) {
    return (
      <div className="order-detail-loading">
        <div className="spinner spinner-lg"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-not-found">
        <div className="not-found-icon">❌</div>
        <h3>Order Not Found</h3>
        <p>The order you're looking for doesn't exist.</p>
        <button onClick={() => navigate("/orders")} className="btn btn-primary">
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      {/* Demo Notice */}
      {error && (
        <div className="demo-notice">
          <h3>Project Demo</h3>
          <p><strong>Note:</strong> {error} This page demonstrates order tracking features.</p>
        </div>
      )}

      <div className="order-header">
        <div className="order-title">
          <h1>Order #{order.orderNumber}</h1>
          <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="order-status-badge">
          <span className={`status-badge status-${order.orderStatus}`}>
            {order.orderStatus.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Order Timeline */}
      <div className="order-timeline card">
        <h3>📋 Order Tracking</h3>
        <div className="timeline">
          {getStatusSteps().map((step, index) => (
            <div key={step.status} className={`timeline-step ${step.completed ? "completed" : ""} ${step.active ? "active" : ""}`}>
              <div className="step-icon">{step.icon}</div>
              <div className="step-content">
                <h4>{step.label}</h4>
                {step.date && <p>{formatDate(step.date)}</p>}
              </div>
              {index < getStatusSteps().length - 1 && (
                <div className="timeline-connector"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="order-details-grid">
        {/* Left Column - Order Items */}
        <div className="order-items-section card">
          <h3>📦 Order Items ({order.orderItems?.length || 0})</h3>
          <div className="items-list">
            {order.orderItems?.map((item, index) => (
              <div key={index} className="order-item-detail">
                <div className="item-image">
                  <img 
                    src={item.image || item.product?.images?.[0] || "/default-product.jpg"} 
                    alt={item.name}
                    onError={(e) => {
                      e.target.src = "/default-product.jpg";
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
            <div className="price-row">
              <span>Items Total</span>
              <span>৳{order.itemsPrice?.toFixed(2) || "0.00"}</span>
            </div>
            <div className="price-row">
              <span>Shipping</span>
              <span className={order.shippingPrice === 0 ? "free" : ""}>
                {order.shippingPrice === 0 ? "FREE" : `৳${order.shippingPrice?.toFixed(2) || "0.00"}`}
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

        {/* Right Column - Order Info */}
        <div className="order-info-section">
          {/* Shipping Address */}
          <div className="info-card card">
            <h3>🚚 Shipping Address</h3>
            <div className="address-details">
              <p><strong>{user?.name || "Demo User"}</strong></p>
              <p>{order.shippingAddress?.street}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
              <p>{order.shippingAddress?.country} - {order.shippingAddress?.zipCode}</p>
              <p>📞 {order.shippingAddress?.phone}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="info-card card">
            <h3>💳 Payment Information</h3>
            <div className="payment-details">
              <p><strong>Method:</strong> {order.payment?.method?.toUpperCase() || "COD"}</p>
              <p><strong>Status:</strong> <span className={`payment-status ${order.payment?.status}`}>
                {order.payment?.status?.toUpperCase() || "PENDING"}
              </span></p>
              {order.payment?.transactionId && (
                <p><strong>Transaction ID:</strong> {order.payment.transactionId}</p>
              )}
              {order.payment?.paidAt && (
                <p><strong>Paid on:</strong> {formatDate(order.payment.paidAt)}</p>
              )}
            </div>
          </div>

          {/* Order Actions */}
          <div className="info-card card">
            <h3>⚡ Order Actions</h3>
            <div className="order-actions">
              <button className="btn btn-outline btn-block" onClick={handlePrintInvoice}>
                🖨️ Print Invoice
              </button>
              {order.orderStatus === "pending" && (
                <button className="btn btn-danger btn-block">
                  ❌ Cancel Order
                </button>
              )}
              {order.orderStatus === "delivered" && (
                <button className="btn btn-success btn-block">
                  🔄 Request Return
                </button>
              )}
              <button 
                onClick={() => navigate("/orders")}
                className="btn btn-secondary btn-block"
              >
                📋 Back to Orders
              </button>
            </div>
          </div>

         
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;