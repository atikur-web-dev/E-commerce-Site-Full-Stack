// Frontend/src/pages/Admin/UserDetails/UserDetails.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import axios from "../../../services/api";
import "./UserDetails.css";

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [user, setUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentUser?.role !== "admin") {
      navigate("/login");
      return;
    }

    fetchUserDetails();
    fetchUserOrders();
  }, [id, currentUser, navigate]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Generate demo user data
      setTimeout(() => {
        const demoUser = {
          id: id || "user_123",
          name: "John Doe",
          email: "john@example.com",
          phone: "+880 1234 567890",
          role: "user",
          status: "active",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
          joinedDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          shippingAddress: {
            street: "123 Main Street",
            city: "Dhaka",
            state: "Dhaka",
            zipCode: "1212",
            country: "Bangladesh"
          },
          billingAddress: {
            street: "123 Main Street",
            city: "Dhaka",
            state: "Dhaka",
            zipCode: "1212",
            country: "Bangladesh"
          },
          preferences: {
            newsletter: true,
            marketingEmails: false,
            notifications: true
          },
          totalOrders: 15,
          totalSpent: 254500,
          averageOrderValue: 16966,
          notes: [
            { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), text: "First time customer, purchased iPhone" },
            { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), text: "Requested refund for defective product" }
          ]
        };

        setUser(demoUser);
        
        // Calculate user stats
        setUserStats({
          orderCount: demoUser.totalOrders,
          totalRevenue: demoUser.totalSpent,
          avgOrderValue: demoUser.averageOrderValue,
          orderFrequency: Math.round(demoUser.totalOrders / 6), // per month
          customerLifetime: Math.round((Date.now() - new Date(demoUser.joinedDate).getTime()) / (1000 * 60 * 60 * 24))
        });
        
        setLoading(false);
      }, 1000);

    } catch (err) {
      console.error("Error fetching user:", err);
      setError("Failed to load user details");
      setLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    try {
      // Generate demo orders for this user
      setTimeout(() => {
        const orders = Array.from({ length: 8 }, (_, i) => ({
          id: `ORD-${String(i + 1).padStart(5, '0')}`,
          date: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: ["delivered", "processing", "shipped", "delivered"][i % 4],
          total: Math.floor(Math.random() * 50000) + 10000,
          items: Math.floor(Math.random() * 5) + 1,
          paymentMethod: ["card", "cod", "bkash"][i % 3]
        })).sort((a, b) => new Date(b.date) - new Date(a.date));

        setUserOrders(orders);
      }, 1200);
    } catch (err) {
      console.error("Error fetching user orders:", err);
    }
  };

  const updateUserRole = async (newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      setUpdating(true);
      
      // Simulate API call
      setTimeout(() => {
        setUser(prev => ({ ...prev, role: newRole }));
        alert(`User role updated to ${newRole}`);
        setUpdating(false);
      }, 500);

    } catch (err) {
      console.error("Error updating role:", err);
      alert("Failed to update user role");
      setUpdating(false);
    }
  };

  const updateUserStatus = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to change this user's status to ${newStatus}?`)) {
      return;
    }

    try {
      setUpdating(true);
      
      // Simulate API call
      setTimeout(() => {
        setUser(prev => ({ ...prev, status: newStatus }));
        alert(`User status updated to ${newStatus}`);
        setUpdating(false);
      }, 500);

    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update user status");
      setUpdating(false);
    }
  };

  const addNote = () => {
    if (!note.trim()) {
      alert("Please enter a note");
      return;
    }

    const newNote = {
      date: new Date().toISOString(),
      text: note
    };

    setUser(prev => ({
      ...prev,
      notes: [newNote, ...prev.notes]
    }));
    
    setNote("");
    alert("Note added successfully");
  };

  const sendEmail = () => {
    const subject = "Message from Admin";
    const body = "Dear " + user.name + ",\n\n";
    window.open(`mailto:${user.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
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
      case 'active': return '#10b981';
      case 'inactive': return '#6b7280';
      case 'suspended': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return '#8b5cf6';
      case 'user': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getOrderStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#f59e0b';
      case 'processing': return '#3b82f6';
      case 'shipped': return '#8b5cf6';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="user-details-loading">
        <div className="spinner"></div>
        <p>Loading user details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-details-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading User</h3>
        <p>{error}</p>
        <button onClick={fetchUserDetails} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-not-found">
        <div className="not-found-icon">👤</div>
        <h3>User Not Found</h3>
        <p>The user you're looking for doesn't exist.</p>
        <Link to="/admin/users" className="back-link">
          ← Back to Users
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "📊 Overview", icon: "📊" },
    { id: "orders", label: "📦 Orders", icon: "📦" },
    { id: "activity", label: "📈 Activity", icon: "📈" },
    { id: "notes", label: "📝 Notes", icon: "📝" }
  ];

  return (
    <div className="user-details">
      {/* Header */}
      <div className="user-header">
        <div className="header-left">
          <div className="user-avatar-large">
            <img src={user.avatar} alt={user.name} />
            <div className="status-indicator" style={{ backgroundColor: getStatusColor(user.status) }}></div>
          </div>
          <div className="user-basic-info">
            <h1>{user.name}</h1>
            <div className="user-meta">
              <span className="user-email">{user.email}</span>
              <span className="user-id">ID: {user.id}</span>
            </div>
            <div className="user-badges">
              <span className="role-badge" style={{ backgroundColor: getRoleColor(user.role) }}>
                {user.role.toUpperCase()}
              </span>
              <span className="status-badge" style={{ backgroundColor: getStatusColor(user.status) }}>
                {user.status.toUpperCase()}
              </span>
              <span className="member-since">
                Member since {formatDate(user.joinedDate)}
              </span>
            </div>
          </div>
        </div>
        <div className="header-right">
          <button className="btn btn-secondary" onClick={() => navigate("/admin/users")}>
            ← Back to Users
          </button>
          <button className="btn btn-primary" onClick={sendEmail}>
            ✉️ Send Email
          </button>
        </div>
      </div>

      {/* User Stats */}
      <div className="user-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>{userStats?.orderCount || 0}</h3>
            <p>Total Orders</p>
            <span className="stat-trend positive">+2 this month</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{formatCurrency(userStats?.totalRevenue || 0)}</h3>
            <p>Total Spent</p>
            <span className="stat-trend positive">+12% from last month</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{formatCurrency(userStats?.avgOrderValue || 0)}</h3>
            <p>Avg. Order Value</p>
            <span className="stat-trend positive">+8% growth</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <h3>{userStats?.customerLifetime || 0}</h3>
            <p>Days as Customer</p>
            <span className="stat-trend">Loyal customer</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="user-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "overview" && (
          <div className="overview-content">
            {/* Left Column */}
            <div className="overview-left">
              {/* Personal Information */}
              <div className="info-card">
                <h3>Personal Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Full Name</span>
                    <span className="value">{user.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Email Address</span>
                    <span className="value">{user.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Phone Number</span>
                    <span className="value">{user.phone || "Not provided"}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Account Type</span>
                    <span className="value">{user.role.toUpperCase()}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Account Status</span>
                    <span className="value">{user.status.toUpperCase()}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Last Login</span>
                    <span className="value">{formatDateTime(user.lastLogin)}</span>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="info-card">
                <h3>Address Information</h3>
                <div className="address-section">
                  <h4>Shipping Address</h4>
                  <div className="address-details">
                    <p>{user.shippingAddress?.street || "Not provided"}</p>
                    <p>{user.shippingAddress?.city}, {user.shippingAddress?.state} {user.shippingAddress?.zipCode}</p>
                    <p>{user.shippingAddress?.country}</p>
                  </div>
                </div>
                <div className="address-section">
                  <h4>Billing Address</h4>
                  <div className="address-details">
                    <p>{user.billingAddress?.street || "Not provided"}</p>
                    <p>{user.billingAddress?.city}, {user.billingAddress?.state} {user.billingAddress?.zipCode}</p>
                    <p>{user.billingAddress?.country}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="overview-right">
              {/* Quick Actions */}
              <div className="actions-card">
                <h3>Quick Actions</h3>
                <div className="action-buttons">
                  <button
                    className="action-btn role-btn"
                    onClick={() => updateUserRole(user.role === 'admin' ? 'user' : 'admin')}
                    disabled={updating}
                  >
                    {user.role === 'admin' ? "👤 Make User" : "🛡️ Make Admin"}
                  </button>
                  <div className="status-actions">
                    {['active', 'inactive', 'suspended'].map(status => (
                      <button
                        key={status}
                        className={`status-action-btn ${user.status === status ? 'active' : ''}`}
                        onClick={() => updateUserStatus(status)}
                        disabled={updating || user.status === status}
                        style={{ backgroundColor: getStatusColor(status) }}
                      >
                        {status.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <button className="action-btn reset-btn">
                    🔄 Reset Password
                  </button>
                  <button className="action-btn delete-btn" onClick={() => alert("Delete feature coming soon!")}>
                    🗑️ Delete Account
                  </button>
                </div>
              </div>

              {/* Preferences */}
              <div className="preferences-card">
                <h3>Preferences</h3>
                <div className="preferences-list">
                  <div className="preference-item">
                    <span className="preference-label">Newsletter Subscription</span>
                    <span className={`preference-status ${user.preferences?.newsletter ? 'on' : 'off'}`}>
                      {user.preferences?.newsletter ? "ON" : "OFF"}
                    </span>
                  </div>
                  <div className="preference-item">
                    <span className="preference-label">Marketing Emails</span>
                    <span className={`preference-status ${user.preferences?.marketingEmails ? 'on' : 'off'}`}>
                      {user.preferences?.marketingEmails ? "ON" : "OFF"}
                    </span>
                  </div>
                  <div className="preference-item">
                    <span className="preference-label">Notifications</span>
                    <span className={`preference-status ${user.preferences?.notifications ? 'on' : 'off'}`}>
                      {user.preferences?.notifications ? "ON" : "OFF"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="activity-card">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-icon login">🔑</div>
                    <div className="activity-content">
                      <p>Last login from Dhaka, Bangladesh</p>
                      <small>{formatDateTime(user.lastLogin)}</small>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon order">📦</div>
                    <div className="activity-content">
                      <p>Placed order #ORD-00123</p>
                      <small>2 days ago</small>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-icon update">✏️</div>
                    <div className="activity-content">
                      <p>Updated profile information</p>
                      <small>1 week ago</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="orders-content">
            <div className="orders-header">
              <h3>Order History</h3>
              <span className="orders-count">{userOrders.length} orders</span>
            </div>
            <div className="orders-table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty-orders">
                        <div className="empty-icon">📦</div>
                        <p>No orders found for this user</p>
                      </td>
                    </tr>
                  ) : (
                    userOrders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <Link to={`/admin/orders/${order.id}`} className="order-link">
                            {order.id}
                          </Link>
                        </td>
                        <td>{formatDate(order.date)}</td>
                        <td>
                          <span className="order-status" style={{ backgroundColor: getOrderStatusColor(order.status) }}>
                            {order.status}
                          </span>
                        </td>
                        <td>{order.items} item{order.items > 1 ? 's' : ''}</td>
                        <td className="order-total">{formatCurrency(order.total)}</td>
                        <td>
                          <span className="payment-method">{order.paymentMethod.toUpperCase()}</span>
                        </td>
                        <td>
                          <button
                            className="view-order-btn"
                            onClick={() => navigate(`/admin/orders/${order.id}`)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "notes" && (
          <div className="notes-content">
            <div className="notes-header">
              <h3>Customer Notes</h3>
              <div className="add-note-form">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note about this customer..."
                  rows="3"
                />
                <button className="add-note-btn" onClick={addNote}>
                  Add Note
                </button>
              </div>
            </div>
            <div className="notes-list">
              {user.notes?.length === 0 ? (
                <div className="no-notes">
                  <div className="no-notes-icon">📝</div>
                  <p>No notes added yet</p>
                  <p className="hint">Add your first note about this customer</p>
                </div>
              ) : (
                user.notes?.map((noteItem, index) => (
                  <div key={index} className="note-item">
                    <div className="note-header">
                      <span className="note-date">{formatDateTime(noteItem.date)}</span>
                      <span className="note-author">Admin</span>
                    </div>
                    <div className="note-body">
                      <p>{noteItem.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetails;