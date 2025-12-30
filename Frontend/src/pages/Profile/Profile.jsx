import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    // Check URL for tab parameter
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['profile', 'orders', 'wishlist', 'security', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    
    // Load user data
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      street: user.address?.street || "",
      city: user.address?.city || "",
      state: user.address?.state || "",
      zipCode: user.address?.zipCode || "",
    });
    
    // Load wishlist from localStorage
    const savedWishlist = JSON.parse(localStorage.getItem(`wishlist_${user._id}`)) || [];
    setWishlist(savedWishlist);
    
    // Fetch orders
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
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
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:5000/api/auth/profile",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (response.data.success) {
        updateProfile(response.data.user);
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const removeFromWishlist = (productId) => {
    const updatedWishlist = wishlist.filter(item => item._id !== productId);
    setWishlist(updatedWishlist);
    localStorage.setItem(`wishlist_${user._id}`, JSON.stringify(updatedWishlist));
  };

  const clearWishlist = () => {
    setWishlist([]);
    localStorage.setItem(`wishlist_${user._id}`, JSON.stringify([]));
  };

  const getTotalSpent = () => {
    return orders.reduce((total, order) => total + order.totalPrice, 0);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Update URL without page reload
    const url = new URL(window.location);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url);
  };

  if (!user) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>👤 My Profile</h1>
        <p>Manage your account, orders, and wishlist</p>
      </div>

      <div className="profile-container">
        {/* Sidebar */}
        <div className="profile-sidebar">
          <div className="user-summary">
            <div className="user-avatar-large">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h3>{user.name}</h3>
            <p className="user-email">{user.email}</p>
            <p className="user-member">Member since: {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="sidebar-menu">
            <button 
              className={`menu-item ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => handleTabChange("profile")}
            >
              <span className="menu-icon">👤</span>
              <span>My Profile</span>
            </button>
            <button 
              className={`menu-item ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => handleTabChange("orders")}
            >
              <span className="menu-icon">📦</span>
              <span>My Orders</span>
              <span className="menu-badge">{orders.length}</span>
            </button>
            <button 
              className={`menu-item ${activeTab === "wishlist" ? "active" : ""}`}
              onClick={() => handleTabChange("wishlist")}
            >
              <span className="menu-icon">❤️</span>
              <span>Wishlist</span>
              <span className="menu-badge">{wishlist.length}</span>
            </button>
            <button 
              className={`menu-item ${activeTab === "security" ? "active" : ""}`}
              onClick={() => handleTabChange("security")}
            >
              <span className="menu-icon">🔒</span>
              <span>Security</span>
            </button>
            <button 
              className={`menu-item ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => handleTabChange("settings")}
            >
              <span className="menu-icon">⚙️</span>
              <span>Settings</span>
            </button>
          </div>

          <div className="sidebar-stats">
            <div className="stat-item">
              <span className="stat-icon">📦</span>
              <div className="stat-content">
                <h4>{orders.length}</h4>
                <p>Total Orders</p>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">💰</span>
              <div className="stat-content">
                <h4>৳{getTotalSpent().toFixed(2)}</h4>
                <p>Total Spent</p>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">❤️</span>
              <div className="stat-content">
                <h4>{wishlist.length}</h4>
                <p>Wishlisted Items</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="profile-content">
          {activeTab === "profile" && (
            <div className="profile-section">
              <div className="section-header">
                <h2>Personal Information</h2>
                <p>Update your personal details and contact information</p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled
                  />
                  <small className="form-help">Email cannot be changed</small>
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="+8801XXXXXXXXX"
                  />
                </div>
              </div>

              <div className="section-header">
                <h3>Shipping Address</h3>
                <p>Default delivery address for your orders</p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Street Address</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Dhaka"
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Dhaka Division"
                  />
                </div>
                <div className="form-group">
                  <label>ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="1200"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  className="btn btn-primary"
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button 
                  className="btn btn-outline"
                  onClick={() => navigate("/")}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="profile-section">
              <div className="section-header">
                <h2>My Orders</h2>
                <p>Track and manage all your orders</p>
              </div>

              {orders.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <h3>No Orders Yet</h3>
                  <p>You haven't placed any orders yet. Start shopping now!</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate("/shop")}
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="orders-table">
                  {orders.slice(0, 5).map(order => (
                    <div key={order._id} className="order-row">
                      <div className="order-info">
                        <h4>Order #{order.orderNumber || order._id.slice(-8)}</h4>
                        <p className="order-date">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="order-status">
                        <span className={`status-badge ${order.orderStatus}`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      <div className="order-total">
                        <strong>৳{order.totalPrice?.toFixed(2)}</strong>
                      </div>
                      <div className="order-actions">
                        <button 
                          className="btn btn-sm btn-outline"
                          onClick={() => navigate(`/order/${order._id}`)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {orders.length > 5 && (
                    <div className="view-all">
                      <button 
                        className="btn btn-outline"
                        onClick={() => navigate("/orders")}
                      >
                        View All Orders
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "wishlist" && (
            <div className="profile-section">
              <div className="section-header">
                <div className="section-header-content">
                  <h2>My Wishlist</h2>
                  <p>Your saved items for later</p>
                </div>
                {wishlist.length > 0 && (
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={clearWishlist}
                  >
                    Clear All
                  </button>
                )}
              </div>

              {wishlist.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">❤️</div>
                  <h3>Your Wishlist is Empty</h3>
                  <p>Save items you love to buy them later</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate("/shop")}
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <div className="wishlist-grid">
                  {wishlist.map(product => (
                    <div key={product._id} className="wishlist-item">
                      <div className="wishlist-image">
                        <img 
                          src={product.images?.[0] || product.image || "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&h=200&fit=crop"} 
                          alt={product.name}
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&h=200&fit=crop";
                            e.target.onerror = null;
                          }}
                        />
                      </div>
                      <div className="wishlist-info">
                        <h4>{product.name}</h4>
                        <p className="wishlist-category">{product.category || "Electronics"}</p>
                        <div className="wishlist-price">
                          <span className="current-price">৳{product.price?.toFixed(2) || "0.00"}</span>
                          {product.originalPrice && (
                            <span className="original-price">৳{product.originalPrice.toFixed(2)}</span>
                          )}
                        </div>
                        <div className="wishlist-stock">
                          <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                      <div className="wishlist-actions">
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => navigate(`/product/${product._id}`)}
                        >
                          View Details
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => removeFromWishlist(product._id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "security" && (
            <div className="profile-section">
              <div className="section-header">
                <h2>Security Settings</h2>
                <p>Manage your password and account security</p>
              </div>

              <div className="security-cards">
                <div className="security-card">
                  <div className="card-icon">🔒</div>
                  <h3>Change Password</h3>
                  <p>Update your password to keep your account secure</p>
                  <button className="btn btn-outline">Change Password</button>
                </div>
                <div className="security-card">
                  <div className="card-icon">📱</div>
                  <h3>Two-Factor Authentication</h3>
                  <p>Add an extra layer of security to your account</p>
                  <button className="btn btn-outline">Enable 2FA</button>
                </div>
                <div className="security-card">
                  <div className="card-icon">👁️</div>
                  <h3>Privacy Settings</h3>
                  <p>Control what information is visible to others</p>
                  <button className="btn btn-outline">Privacy Settings</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="profile-section">
              <div className="section-header">
                <h2>Account Settings</h2>
                <p>Customize your account preferences</p>
              </div>

              <div className="settings-list">
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Email Notifications</h4>
                    <p>Receive updates about orders and promotions</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>SMS Notifications</h4>
                    <p>Get order updates via SMS</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Newsletter Subscription</h4>
                    <p>Receive our weekly newsletter with deals</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Dark Mode</h4>
                    <p>Switch to dark theme</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;