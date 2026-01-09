// Frontend/src/pages/Admin/UserDetails/UserDetails.jsx 
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./UserDetails.css";

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser?.role !== "admin") {
      navigate("/login");
      return;
    }

    fetchUserDetails();
  }, [id, currentUser, navigate]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch user details: HTTP ${response.status}`
        );
      }

      const data = await response.json();

      if (data.success) {
        setUser(data.data.user);
        setOrders(data.data.allOrders || []);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "৳0";
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "#f59e0b";
      case "confirmed":
        return "#3b82f6";
      case "processing":
        return "#8b5cf6";
      case "shipped":
        return "#10b981";
      case "delivered":
        return "#059669";
      case "cancelled":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const handleBack = () => {
    navigate("/admin/users");
  };

  if (loading) {
    return (
      <div className="user-details-loading">
        <div className="spinner"></div>
        <p>Loading user details...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="user-details-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading User</h3>
        <p>{error || "User not found"}</p>
        <button onClick={handleBack} className="back-btn">
          ← Back to Users
        </button>
      </div>
    );
  }

  // Calculate statistics
  const totalOrders = orders.length;
  const totalSpent = orders.reduce(
    (sum, order) => sum + (order.totalPrice || 0),
    0
  );
  const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
  const completedOrders = orders.filter(
    (o) => o.orderStatus === "delivered"
  ).length;
  const pendingOrders = orders.filter((o) =>
    ["pending", "confirmed", "processing"].includes(o.orderStatus)
  ).length;
  const accountAge = Math.floor(
    (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="user-details-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <button onClick={handleBack} className="back-btn">
            <span className="back-icon">←</span> Back to Users
          </button>
          <h1>Customer Details</h1>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={fetchUserDetails}>
            <i className="refresh-icon">↻</i> Refresh
          </button>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="user-profile-card">
        <div className="profile-header">
          <div className="avatar-container">
            {/* <div className="user-avatar">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div> */}
            <div className="user-info">
              <h2 className="user-name">{user.name}</h2>
              <p className="user-email">{user.email}</p>
              <div className="user-tags">
                <span className={`tag role ${user.role}`}>
                  {user.role === "admin" ? "Administrator" : "Customer"}
                </span>
                <span
                  className={`tag status ${
                    user.isActive ? "active" : "inactive"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <div className="stat-value">{totalOrders}</div>
                <div className="stat-label">Total Orders</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <div className="stat-value">{formatCurrency(totalSpent)}</div>
                <div className="stat-label">Total Spent</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-value">
                  {formatCurrency(avgOrderValue)}
                </div>
                <div className="stat-label">Avg. Order</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <div className="stat-value">{accountAge}</div>
                <div className="stat-label">Days Active</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <span className="tab-icon">📋</span>
            Overview
          </button>
          <button
            className={`tab ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <span className="tab-icon">📦</span>
            Orders
            {orders.length > 0 && (
              <span className="badge">{orders.length}</span>
            )}
          </button>
          <button
            className={`tab ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            <span className="tab-icon">👤</span>
            Details
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "overview" && (
            <div className="overview-tab">
              <div className="cards-grid">
                {/* Account Information */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">
                      <span className="card-icon">👤</span>
                      Account Information
                    </h3>
                  </div>
                  <div className="card-body">
                    <div className="info-item">
                      <label>Email Address</label>
                      <p>{user.email}</p>
                    </div>
                    <div className="info-item">
                      <label>Phone Number</label>
                      <p>{user.phone || "Not provided"}</p>
                    </div>
                    <div className="info-item">
                      <label>Account Created</label>
                      <p>{formatDate(user.createdAt)}</p>
                    </div>
                    <div className="info-item">
                      <label>Last Login</label>
                      <p>{formatDate(user.lastLogin)}</p>
                    </div>
                  </div>
                </div>

                {/* Order Statistics */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">
                      <span className="card-icon">📊</span>
                      Order Statistics
                    </h3>
                  </div>
                  <div className="card-body">
                    <div className="stats-grid">
                      <div className="stat-box">
                        <div className="stat-number">{totalOrders}</div>
                        <div className="stat-text">Total Orders</div>
                      </div>
                      <div className="stat-box">
                        <div className="stat-number">{completedOrders}</div>
                        <div className="stat-text">Completed</div>
                      </div>
                      <div className="stat-box">
                        <div className="stat-number">{pendingOrders}</div>
                        <div className="stat-text">Pending</div>
                      </div>
                      <div className="stat-box">
                        <div className="stat-number">
                          {
                            orders.filter((o) => o.orderStatus === "cancelled")
                              .length
                          }
                        </div>
                        <div className="stat-text">Cancelled</div>
                      </div>
                    </div>
                    <div className="revenue-info">
                      <div className="revenue-item">
                        <span>Total Revenue:</span>
                        <strong>{formatCurrency(totalSpent)}</strong>
                      </div>
                      <div className="revenue-item">
                        <span>Average Order:</span>
                        <strong>{formatCurrency(avgOrderValue)}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">
                      <span className="card-icon">📦</span>
                      Recent Orders
                    </h3>
                    {orders.length > 0 && (
                      <button
                        className="view-all-btn"
                        onClick={() => setActiveTab("orders")}
                      >
                        View All
                      </button>
                    )}
                  </div>
                  <div className="card-body">
                    {orders.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-icon">📦</div>
                        <p>No orders found</p>
                      </div>
                    ) : (
                      <div className="orders-list">
                        {orders.slice(0, 3).map((order) => (
                          <div key={order._id} className="order-item">
                            <div className="order-info">
                              <span className="order-id">
                                {`ORD-${
                                  order._id
                                    ?.toString()
                                    .slice(-8)
                                    .toUpperCase() || "N/A"
                                }`}
                              </span>
                              <span className="order-date">
                                {formatDate(order.createdAt)}
                              </span>
                            </div>
                            <div className="order-meta">
                              <span className="order-amount">
                                {formatCurrency(order.totalPrice)}
                              </span>
                              <span
                                className="order-status"
                                style={{
                                  backgroundColor: getStatusColor(
                                    order.orderStatus
                                  ),
                                }}
                              >
                                {order.orderStatus || "Unknown"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Details */}
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">
                      <span className="card-icon">📝</span>
                      Account Details
                    </h3>
                  </div>
                  <div className="card-body">
                    <div className="detail-item">
                      <label>User ID</label>
                      <p className="user-id">{user._id}</p>
                    </div>
                    <div className="detail-item">
                      <label>Account Type</label>
                      <span className={`type-badge ${user.role}`}>
                        {user.role === "admin"
                          ? "Administrator"
                          : "Regular User"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Member Since</label>
                      <p>{accountAge} days</p>
                    </div>
                    <div className="detail-item">
                      <label>Shipping Address</label>
                      <p>
                        {user.shippingAddress?.street
                          ? `${user.shippingAddress.street}, ${user.shippingAddress.city}`
                          : "Not set"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="orders-tab">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">
                    <span className="card-icon">📦</span>
                    Order History
                  </h3>
                  <span className="order-count">{orders.length} orders</span>
                </div>
                <div className="card-body">
                  {orders.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📦</div>
                      <h4>No Orders Found</h4>
                      <p>This customer hasn't placed any orders yet.</p>
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="orders-table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Payment</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => (
                            <tr key={order._id}>
                              <td>
                                <Link
                                  to={`/admin/orders/${order._id}`}
                                  className="order-link"
                                >
                                  {`ORD-${
                                    order._id
                                      ?.toString()
                                      .slice(-8)
                                      .toUpperCase() || "N/A"
                                  }`}
                                </Link>
                              </td>
                              <td className="order-date-cell">
                                {formatDate(order.createdAt)}
                              </td>
                              <td className="order-items-cell">
                                {order.orderItems?.length || 0} items
                              </td>
                              <td className="order-total-cell">
                                {formatCurrency(order.totalPrice)}
                              </td>
                              <td>
                                <span
                                  className="status-badge"
                                  style={{
                                    backgroundColor: getStatusColor(
                                      order.orderStatus
                                    ),
                                  }}
                                >
                                  {order.orderStatus || "Unknown"}
                                </span>
                              </td>
                              <td>
                                <div className="payment-cell">
                                  <span className="payment-method">
                                    {order.payment?.method?.toUpperCase() ||
                                      "COD"}
                                  </span>
                                  <span
                                    className={`payment-status ${
                                      order.isPaid ? "paid" : "pending"
                                    }`}
                                  >
                                    {order.isPaid ? "Paid" : "Pending"}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <div className="action-cell">
                                  <Link
                                    to={`/admin/orders/${order._id}`}
                                    className="action-btn"
                                  >
                                    View
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "details" && (
            <div className="details-tab">
              <div className="cards-grid">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">
                      <span className="card-icon">👤</span>
                      Personal Information
                    </h3>
                  </div>
                  <div className="card-body">
                    <div className="detail-section">
                      <div className="detail-item">
                        <label>Full Name</label>
                        <p>{user.name}</p>
                      </div>
                      <div className="detail-item">
                        <label>Email Address</label>
                        <p>{user.email}</p>
                      </div>
                      <div className="detail-item">
                        <label>Phone Number</label>
                        <p>{user.phone || "Not provided"}</p>
                      </div>
                    </div>

                    <div className="detail-section">
                      <div className="detail-item">
                        <label>Account Status</label>
                        <span
                          className={`status-indicator ${
                            user.isActive ? "active" : "inactive"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <label>User Role</label>
                        <span className={`role-indicator ${user.role}`}>
                          {user.role === "admin" ? "Administrator" : "Customer"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <label>Account Created</label>
                        <p>{formatDate(user.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">
                      <span className="card-icon">🏠</span>
                      Shipping Address
                    </h3>
                  </div>
                  <div className="card-body">
                    {user.shippingAddress?.street ? (
                      <div className="address-card">
                        <div className="address-line">
                          <strong>{user.shippingAddress.street}</strong>
                        </div>
                        <div className="address-line">
                          {user.shippingAddress.city},{" "}
                          {user.shippingAddress.state}
                        </div>
                        <div className="address-line">
                          {user.shippingAddress.zipCode},{" "}
                          {user.shippingAddress.country}
                        </div>
                        {user.shippingAddress.phone && (
                          <div className="address-line">
                            📱 {user.shippingAddress.phone}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="empty-address">
                        <div className="empty-icon">🏠</div>
                        <p>No shipping address provided</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">
                      <span className="card-icon">📊</span>
                      Activity Summary
                    </h3>
                  </div>
                  <div className="card-body">
                    <div className="activity-list">
                      <div className="activity-item">
                        <div className="activity-icon">📅</div>
                        <div className="activity-content">
                          <div className="activity-title">Account Created</div>
                          <div className="activity-time">
                            {formatDate(user.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="activity-item">
                        <div className="activity-icon">🔑</div>
                        <div className="activity-content">
                          <div className="activity-title">Last Login</div>
                          <div className="activity-time">
                            {formatDate(user.lastLogin)}
                          </div>
                        </div>
                      </div>
                      <div className="activity-item">
                        <div className="activity-icon">📦</div>
                        <div className="activity-content">
                          <div className="activity-title">First Order</div>
                          <div className="activity-time">
                            {orders.length > 0
                              ? formatDate(orders[orders.length - 1].createdAt)
                              : "No orders yet"}
                          </div>
                        </div>
                      </div>
                      <div className="activity-item">
                        <div className="activity-icon">💰</div>
                        <div className="activity-content">
                          <div className="activity-title">Lifetime Value</div>
                          <div className="activity-value">
                            {formatCurrency(totalSpent)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
