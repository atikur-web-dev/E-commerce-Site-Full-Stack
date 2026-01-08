// Frontend/src/pages/Admin/UserDetails/UserDetails.jsx - PROFESSIONAL VERSION
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
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

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
      
      // Fetch user details
      const userResponse = await fetch(`http://localhost:5000/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error(`Failed to fetch user details: HTTP ${userResponse.status}`);
      }

      const userData = await userResponse.json();
      
      if (userData.success) {
        setUser(userData.data.user);
        setOrders(userData.data.allOrders || []);
        setEditData(userData.data.user);
      } else {
        setError(userData.message);
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
      minute: "2-digit"
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
    switch(status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#3b82f6';
      case 'processing': return '#8b5cf6';
      case 'shipped': return '#10b981';
      case 'delivered': return '#059669';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
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
  const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
  const completedOrders = orders.filter(o => o.orderStatus === 'delivered').length;
  const pendingOrders = orders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.orderStatus)).length;
  const accountAge = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="user-details-container">
      {/* Header with Breadcrumb */}
      <div className="breadcrumb-header">
        <div className="breadcrumb">
          <Link to="/admin/dashboard" className="breadcrumb-item">Dashboard</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/admin/users" className="breadcrumb-item">Customers</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item active">{user.name}</span>
        </div>
        
        <div className="header-actions">
          <button className="btn btn-outline" onClick={fetchUserDetails}>
            <span className="btn-icon">↻</span>
            Refresh
          </button>
          <button className="btn btn-secondary" onClick={handleBack}>
            ← Back
          </button>
        </div>
      </div>

      {/* User Profile Header */}
      <div className="user-profile-header">
        <div className="user-avatar-section">
          <div className="user-avatar-large">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="user-info-main">
            <h1 className="user-name">{user.name}</h1>
            <div className="user-meta">
              <span className="user-email">{user.email}</span>
              {user.phone && <span className="user-phone">• 📱 {user.phone}</span>}
            </div>
            <div className="user-tags">
              <span className={`user-tag role-${user.role}`}>
                {user.role === 'admin' ? 'Administrator' : 'Customer'}
              </span>
              <span className={`user-tag status-${user.isActive ? 'active' : 'inactive'}`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="user-tag id-tag">
                ID: {user._id.substring(0, 8)}...
              </span>
            </div>
          </div>
        </div>

        <div className="user-stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>{totalOrders}</h3>
              <p>Total Orders</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>{formatCurrency(totalSpent)}</h3>
              <p>Total Spent</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{formatCurrency(avgOrderValue)}</h3>
              <p>Avg Order Value</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>{accountAge}</h3>
              <p>Days Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span className="tab-icon">📋</span>
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <span className="tab-icon">📦</span>
          Orders
          {orders.length > 0 && <span className="tab-badge">{orders.length}</span>}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          <span className="tab-icon">👤</span>
          Details
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content-wrapper">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="grid-layout">
              {/* Account Information */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Account Information</h3>
                </div>
                <div className="card-body">
                  <div className="info-row">
                    <span className="info-label">Email Address</span>
                    <span className="info-value">{user.email}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Phone Number</span>
                    <span className="info-value">{user.phone || 'Not provided'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Account Created</span>
                    <span className="info-value">{formatDate(user.createdAt)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Last Login</span>
                    <span className="info-value">{formatDate(user.lastLogin)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Account Status</span>
                    <span className={`info-value status-indicator ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Statistics */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Order Statistics</h3>
                </div>
                <div className="card-body">
                  <div className="stats-grid">
                    <div className="stat-item">
                      <div className="stat-number">{totalOrders}</div>
                      <div className="stat-label">Total Orders</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">{completedOrders}</div>
                      <div className="stat-label">Completed</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">{pendingOrders}</div>
                      <div className="stat-label">Pending</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">
                        {orders.filter(o => o.orderStatus === 'cancelled').length}
                      </div>
                      <div className="stat-label">Cancelled</div>
                    </div>
                  </div>
                  <div className="revenue-section">
                    <div className="revenue-item">
                      <span className="revenue-label">Total Revenue</span>
                      <span className="revenue-value">{formatCurrency(totalSpent)}</span>
                    </div>
                    <div className="revenue-item">
                      <span className="revenue-label">Average Order</span>
                      <span className="revenue-value">{formatCurrency(avgOrderValue)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Recent Orders</h3>
                  {orders.length > 0 && (
                    <Link to="#" className="view-all" onClick={() => setActiveTab('orders')}>
                      View All
                    </Link>
                  )}
                </div>
                <div className="card-body">
                  {orders.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📦</div>
                      <p>No orders found</p>
                    </div>
                  ) : (
                    <div className="recent-orders">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order._id} className="recent-order-item">
                          <div className="order-info">
                            <span className="order-id">
                              ORD-{order._id.toString().slice(-8).toUpperCase()}
                            </span>
                            <span className="order-date">{formatDate(order.createdAt)}</span>
                          </div>
                          <div className="order-details">
                            <span className="order-amount">{formatCurrency(order.totalPrice)}</span>
                            <span 
                              className="order-status"
                              style={{ backgroundColor: getStatusColor(order.orderStatus?.toLowerCase()) }}
                            >
                              {order.orderStatus}
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
                  <h3 className="card-title">Account Details</h3>
                </div>
                <div className="card-body">
                  <div className="detail-row">
                    <span className="detail-label">User ID</span>
                    <span className="detail-value code">{user._id}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Account Type</span>
                    <span className={`detail-value ${user.role}`}>
                      {user.role === 'admin' ? 'Administrator' : 'Regular User'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Member Since</span>
                    <span className="detail-value">{accountAge} days</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Shipping Address</span>
                    <span className="detail-value">
                      {user.shippingAddress?.street 
                        ? `${user.shippingAddress.street}, ${user.shippingAddress.city}`
                        : 'Not set'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-tab">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Order History</h3>
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
                  <div className="orders-table-container">
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
                              <Link to={`/admin/orders/${order._id}`} className="order-link">
                                ORD-{order._id.toString().slice(-8).toUpperCase()}
                              </Link>
                            </td>
                            <td className="order-date">{formatDate(order.createdAt)}</td>
                            <td className="order-items">
                              {order.orderItems?.length || 0} items
                            </td>
                            <td className="order-total">{formatCurrency(order.totalPrice)}</td>
                            <td>
                              <span 
                                className="status-badge"
                                style={{ backgroundColor: getStatusColor(order.orderStatus?.toLowerCase()) }}
                              >
                                {order.orderStatus}
                              </span>
                            </td>
                            <td>
                              <div className="payment-info">
                                <span className="payment-method">
                                  {order.payment?.method?.toUpperCase() || 'COD'}
                                </span>
                                <span className={`payment-status ${order.isPaid ? 'paid' : 'pending'}`}>
                                  {order.isPaid ? 'Paid' : 'Pending'}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <Link 
                                  to={`/admin/orders/${order._id}`}
                                  className="btn-action view-btn"
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

        {activeTab === 'details' && (
          <div className="details-tab">
            <div className="grid-layout">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Personal Information</h3>
                </div>
                <div className="card-body">
                  <div className="detail-section">
                    <h4>Basic Details</h4>
                    <div className="detail-item">
                      <label>Full Name</label>
                      <div className="detail-value">{user.name}</div>
                    </div>
                    <div className="detail-item">
                      <label>Email Address</label>
                      <div className="detail-value">{user.email}</div>
                    </div>
                    <div className="detail-item">
                      <label>Phone Number</label>
                      <div className="detail-value">{user.phone || 'Not provided'}</div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Account Information</h4>
                    <div className="detail-item">
                      <label>User Role</label>
                      <div className={`detail-value role-badge ${user.role}`}>
                        {user.role === 'admin' ? 'Administrator' : 'Customer'}
                      </div>
                    </div>
                    <div className="detail-item">
                      <label>Account Status</label>
                      <div className={`detail-value status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    <div className="detail-item">
                      <label>Account Created</label>
                      <div className="detail-value">{formatDate(user.createdAt)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Shipping Address</h3>
                </div>
                <div className="card-body">
                  {user.shippingAddress?.street ? (
                    <div className="address-card">
                      <div className="address-line">
                        <strong>{user.shippingAddress.street}</strong>
                      </div>
                      <div className="address-line">
                        {user.shippingAddress.city}, {user.shippingAddress.state}
                      </div>
                      <div className="address-line">
                        {user.shippingAddress.zipCode}, {user.shippingAddress.country}
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
                  <h3 className="card-title">Account Activity</h3>
                </div>
                <div className="card-body">
                  <div className="activity-list">
                    <div className="activity-item">
                      <div className="activity-icon">📅</div>
                      <div className="activity-content">
                        <div className="activity-title">Account Created</div>
                        <div className="activity-time">{formatDate(user.createdAt)}</div>
                      </div>
                    </div>
                    <div className="activity-item">
                      <div className="activity-icon">🔑</div>
                      <div className="activity-content">
                        <div className="activity-title">Last Login</div>
                        <div className="activity-time">{formatDate(user.lastLogin)}</div>
                      </div>
                    </div>
                    <div className="activity-item">
                      <div className="activity-icon">📦</div>
                      <div className="activity-content">
                        <div className="activity-title">First Order</div>
                        <div className="activity-time">
                          {orders.length > 0 ? formatDate(orders[orders.length - 1].createdAt) : 'No orders yet'}
                        </div>
                      </div>
                    </div>
                    <div className="activity-item">
                      <div className="activity-icon">💰</div>
                      <div className="activity-content">
                        <div className="activity-title">Lifetime Value</div>
                        <div className="activity-time">{formatCurrency(totalSpent)}</div>
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
  );
};

export default UserDetails;