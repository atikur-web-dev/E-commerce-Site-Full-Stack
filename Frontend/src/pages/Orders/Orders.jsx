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

  // Generate mock orders for demonstration
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
          { name: "iPhone 15 Pro", quantity: 1, price: 999.99, image: "" },
          { name: "AirPods Pro", quantity: 1, price: 250.0, image: "" },
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
          { name: "Samsung Galaxy S24", quantity: 1, price: 899.99, image: "" },
          { name: "Galaxy Watch 6", quantity: 1, price: 299.99, image: "" },
          { name: "Phone Case", quantity: 2, price: 20.0, image: "" },
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
          { name: "Wireless Earbuds", quantity: 1, price: 149.99, image: "" },
          { name: "Power Bank", quantity: 2, price: 299.99, image: "" },
        ],
      },
    ];
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
        return "✅";
      case "shipped":
        return "🚚";
      case "processing":
        return "🔄";
      case "pending":
        return "⏳";
      case "cancelled":
        return "❌";
      default:
        return "📦";
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
        <div className="spinner spinner-lg"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>📦 My Orders</h1>
        <p>Track and manage all your orders in one place</p>
      </div>

      {error && (
        <div className="alert alert-warning">
          <strong>Demo Mode:</strong> {error} Using demonstration data.
        </div>
      )}

      

      {orders.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-icon">📭</div>
          <h3>No Orders Yet</h3>
          <p>You haven't placed any orders. Start shopping now!</p>
          <button onClick={() => navigate("/shop")} className="btn btn-primary">
            Start Shopping
          </button>
        </div>
      ) : (
        <>
          {/* Orders Summary */}
          <div className="orders-summary">
            <div className="summary-card">
              <h3>{orders.length}</h3>
              <p>Total Orders</p>
            </div>
            <div className="summary-card">
              <h3>
                ৳
                {orders
                  .reduce((sum, order) => sum + order.totalPrice, 0)
                  .toFixed(2)}
              </h3>
              <p>Total Spent</p>
            </div>
            <div className="summary-card">
              <h3>
                {orders.filter((o) => o.orderStatus === "delivered").length}
              </h3>
              <p>Delivered</p>
            </div>
          </div>

          {/* Orders List */}
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h4>
                      Order #
                      {order.orderNumber || order._id.slice(-8).toUpperCase()}
                    </h4>
                    <p className="order-date">
                      Placed on: {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="order-status">
                    <span
                      className={`status-badge status-${getStatusColor(
                        order.orderStatus
                      )}`}
                    >
                      {getStatusIcon(order.orderStatus)}{" "}
                      {order.orderStatus.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="order-items">
                  {order.orderItems?.slice(0, 3).map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="item-image">
                        <img
                          src={
                            item.image ||
                            item.product?.images?.[0] ||
                            "/default-product.jpg"
                          }
                          alt={item.name}
                          onError={(e) => {
                            e.target.src = "/default-product.jpg";
                            e.target.onerror = null;
                          }}
                        />
                      </div>
                      <div className="item-details">
                        <h5>{item.name}</h5>
                        <p>
                          Qty: {item.quantity} × ৳{item.price.toFixed(2)}
                        </p>
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
                      Total: ৳{order.totalPrice?.toFixed(2) || "0.00"}
                    </strong>
                    <small>
                      Payment: {order.payment?.method?.toUpperCase() || "COD"}
                    </small>
                  </div>
                  <div className="order-actions">
                    <button
                      onClick={() => navigate(`/order/${order._id}`)}
                      className="btn btn-outline btn-sm"
                    >
                      View Details
                    </button>
                    {order.orderStatus === "pending" && (
                      <button className="btn btn-danger btn-sm">
                        Cancel Order
                      </button>
                    )}
                    {order.orderStatus === "delivered" && (
                      <button className="btn btn-success btn-sm">
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

      {/* Order Timeline Explanation */}
      <div className="order-timeline-info">
        <h3>📋 Order Status Guide</h3>
        <div className="timeline-steps">
          <div className="timeline-step">
            <span className="step-icon">🛒</span>
            <h4>Order Placed</h4>
            <p>Your order has been received</p>
          </div>
          <div className="timeline-step">
            <span className="step-icon">🔄</span>
            <h4>Processing</h4>
            <p>Preparing your order for shipment</p>
          </div>
          <div className="timeline-step">
            <span className="step-icon">🚚</span>
            <h4>Shipped</h4>
            <p>Order is on its way to you</p>
          </div>
          <div className="timeline-step">
            <span className="step-icon">✅</span>
            <h4>Delivered</h4>
            <p>Order successfully delivered</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
