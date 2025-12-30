import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateProfile, logout, syncUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  
  // User state
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: ""
  });
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    shippingAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Bangladesh"
    },
    avatar: ""
  });

  // Orders and wishlist state
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    loadAllData();
  }, [user, navigate]);

  const loadAllData = () => {
    // Load user data
    setUserData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      avatar: user.avatar || ""
    });

    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      shippingAddress: user.shippingAddress || {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "Bangladesh"
      },
      avatar: user.avatar || ""
    });

    setImagePreview(user.avatar || "");

    // Load wishlist from localStorage
    loadWishlist();
    
    // Load orders from localStorage
    loadOrders();
  };

  const loadWishlist = () => {
    const savedWishlist = JSON.parse(localStorage.getItem(`wishlist_${user._id}`)) || [];
    setWishlist(savedWishlist);
  };

  const loadOrders = () => {
    // Check localStorage first
    const savedOrders = JSON.parse(localStorage.getItem(`orders_${user._id}`));
    
    if (savedOrders && savedOrders.length > 0) {
      setOrders(savedOrders);
    } else {
      // Create initial orders if none exist
      const initialOrders = createInitialOrders();
      setOrders(initialOrders);
      localStorage.setItem(`orders_${user._id}`, JSON.stringify(initialOrders));
    }
  };

  const createInitialOrders = () => {
    return [
      {
        _id: "order_1_" + Date.now(),
        orderNumber: "ORD-2024-001",
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        totalPrice: 1250.00,
        status: "Delivered",
        items: 2,
        products: [
          { name: "Wireless Headphones", price: 450.00, quantity: 1 },
          { name: "USB-C Cable", price: 800.00, quantity: 1 }
        ]
      },
      {
        _id: "order_2_" + Date.now(),
        orderNumber: "ORD-2024-002",
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        totalPrice: 899.99,
        status: "Processing",
        items: 1,
        products: [
          { name: "Smart Watch", price: 899.99, quantity: 1 }
        ]
      }
    ];
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith("shippingAddress.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("❌ Image size should be less than 2MB");
        return;
      }

      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData(prev => ({
          ...prev,
          avatar: base64String
        }));
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    } else {
      alert("❌ Please select a valid image file (JPG, PNG, GIF)");
    }
  };

  const handleSaveProfile = async () => {
    if (!formData.name.trim()) {
      alert("❌ Name is required");
      return;
    }

    setSaving(true);
    try {
      // Prepare data for backend
      const updateData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        shippingAddress: formData.shippingAddress
      };

      // Only send avatar if it's a new base64 image
      if (formData.avatar && formData.avatar !== user.avatar && formData.avatar.startsWith("data:image")) {
        updateData.avatar = formData.avatar;
      }

      console.log("🚀 Sending profile update...");

      const response = await updateProfile(updateData);
      
      if (response.success) {
        // Refresh user data
        await syncUserProfile();
        
        // Update local state
        const updatedUser = JSON.parse(localStorage.getItem('user'));
        if (updatedUser) {
          setUserData({
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            avatar: updatedUser.avatar
          });
          
          setImagePreview(updatedUser.avatar || "");
        }
        
        alert("✅ Profile updated successfully!");
        setActiveTab("dashboard");
      } else {
        alert("❌ Failed to update profile: " + response.error);
      }
    } catch (error) {
      console.error("❌ Profile update error:", error);
      alert("❌ Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const removeFromWishlist = (productId) => {
    const updatedWishlist = wishlist.filter(item => item._id !== productId);
    setWishlist(updatedWishlist);
    localStorage.setItem(`wishlist_${user._id}`, JSON.stringify(updatedWishlist));
    alert("✅ Item removed from wishlist");
  };

  const clearWishlist = () => {
    if (window.confirm("⚠️ Are you sure you want to clear your entire wishlist?")) {
      setWishlist([]);
      localStorage.setItem(`wishlist_${user._id}`, JSON.stringify([]));
      alert("✅ Wishlist cleared successfully");
    }
  };

  const clearOrderHistory = () => {
    if (window.confirm("⚠️ Are you sure you want to permanently delete ALL your order history? This action cannot be undone!")) {
      // Clear from state
      setOrders([]);
      
      // Clear from localStorage
      localStorage.removeItem(`orders_${user._id}`);
      
      // Clear initialization flag
      localStorage.removeItem(`orders_initialized_${user._id}`);
      
      alert("✅ Order history has been permanently deleted!");
    }
  };

  const addTestOrder = () => {
    const newOrder = {
      _id: `order_${Date.now()}`,
      orderNumber: `ORD-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      totalPrice: Math.floor(Math.random() * 5000) + 500,
      status: ["Pending", "Processing", "Shipped", "Delivered"][Math.floor(Math.random() * 4)],
      items: Math.floor(Math.random() * 5) + 1,
      products: [
        { name: "Test Product " + (orders.length + 1), price: 1000, quantity: 1 }
      ]
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem(`orders_${user._id}`, JSON.stringify(updatedOrders));
    alert("✅ Test order added successfully");
  };

  const handleLogout = () => {
    logout();
  };

  // Calculate stats
  const totalSpent = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  const totalOrders = orders.length;
  const totalWishlist = wishlist.length;

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
      <div className="profile-container">
        {/* Sidebar */}
        <div className="profile-sidebar">
          <div className="user-card">
            <div className="user-avatar">
              {imagePreview ? (
                <img src={imagePreview} alt={userData.name} className="avatar-image" />
              ) : userData.avatar ? (
                <img src={userData.avatar} alt={userData.name} className="avatar-image" />
              ) : (
                <div className="avatar-placeholder">
                  {userData.name.charAt(0).toUpperCase()}
                </div>
              )}
              
              <label className="avatar-upload">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                />
                Change Photo
              </label>
            </div>
            
            <h3 className="user-name">{userData.name}</h3>
            <p className="user-email">{userData.email}</p>
            <p className="user-phone">{userData.phone || "No phone number"}</p>
            
            <div className="user-stats">
              <div className="stat-item">
                <div className="stat-value">{totalOrders}</div>
                <div className="stat-label">Orders</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{totalWishlist}</div>
                <div className="stat-label">Wishlist</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">৳{totalSpent.toFixed(2)}</div>
                <div className="stat-label">Spent</div>
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </button>
            <button 
              className={`nav-item ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              My Orders
            </button>
            <button 
              className={`nav-item ${activeTab === "wishlist" ? "active" : ""}`}
              onClick={() => setActiveTab("wishlist")}
            >
              Wishlist
            </button>
            <button 
              className={`nav-item ${activeTab === "update" ? "active" : ""}`}
              onClick={() => setActiveTab("update")}
            >
              Update Profile
            </button>
            <button 
              className="nav-item logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="profile-content">
          {activeTab === "dashboard" && (
            <div className="dashboard-tab">
              <div className="dashboard-header">
                <div>
                  <h2>Welcome back, {userData.name}</h2>
                  <p className="dashboard-subtitle">Here is your account overview</p>
                </div>
                <div className="dashboard-actions">
                  <button 
                    className="action-btn secondary"
                    onClick={addTestOrder}
                  >
                    Add Test Order
                  </button>
                  <button 
                    className="action-btn danger"
                    onClick={clearOrderHistory}
                    disabled={orders.length === 0}
                  >
                    Clear History
                  </button>
                </div>
              </div>
              
              <div className="dashboard-cards">
                <div className="dashboard-card">
                  <div className="card-header">
                    <h3>Recent Orders</h3>
                    <span className="card-badge">{totalOrders}</span>
                  </div>
                  {orders.length > 0 ? (
                    <div className="recent-orders">
                      {orders.slice(0, 3).map(order => (
                        <div key={order._id} className="order-item">
                          <div className="order-info">
                            <strong>{order.orderNumber || `Order #${order._id.slice(-6)}`}</strong>
                            <span className={`status ${(order.status || "Pending").toLowerCase()}`}>
                              {order.status || "Pending"}
                            </span>
                          </div>
                          <div className="order-price">
                            ৳{order.totalPrice?.toFixed(2) || "0.00"}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-data">No orders yet</p>
                  )}
                  <button 
                    className="view-all-btn"
                    onClick={() => setActiveTab("orders")}
                  >
                    View All Orders
                  </button>
                </div>

                <div className="dashboard-card">
                  <div className="card-header">
                    <h3>Wishlist Items</h3>
                    <span className="card-badge">{totalWishlist}</span>
                  </div>
                  {wishlist.length > 0 ? (
                    <div className="wishlist-preview">
                      {wishlist.slice(0, 3).map(item => (
                        <div key={item._id} className="wishlist-item">
                          <span className="item-name">{item.name}</span>
                          <span className="item-price">৳{item.price?.toFixed(2) || "0.00"}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-data">No items in wishlist</p>
                  )}
                  <button 
                    className="view-all-btn"
                    onClick={() => setActiveTab("wishlist")}
                  >
                    View Wishlist
                  </button>
                </div>

                <div className="dashboard-card">
                  <div className="card-header">
                    <h3>Account Details</h3>
                  </div>
                  <div className="account-info">
                    <div className="info-row">
                      <span>Name:</span>
                      <span className="info-value">{userData.name}</span>
                    </div>
                    <div className="info-row">
                      <span>Email:</span>
                      <span className="info-value">{userData.email}</span>
                    </div>
                    <div className="info-row">
                      <span>Phone:</span>
                      <span className="info-value">{userData.phone || "Not set"}</span>
                    </div>
                    <div className="info-row">
                      <span>Member Since:</span>
                      <span className="info-value">{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button 
                    className="view-all-btn"
                    onClick={() => setActiveTab("update")}
                  >
                    Update Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="orders-tab">
              <div className="orders-header">
                <h2>My Orders ({orders.length})</h2>
                <div className="orders-actions">
                  <button 
                    className="action-btn primary"
                    onClick={addTestOrder}
                  >
                    Add Test Order
                  </button>
                  <button 
                    className="action-btn danger"
                    onClick={clearOrderHistory}
                    disabled={orders.length === 0}
                  >
                    Clear All Orders
                  </button>
                </div>
              </div>
              
              {orders.length > 0 ? (
                <div className="orders-list">
                  {orders.map(order => (
                    <div key={order._id} className="order-card">
                      <div className="order-header">
                        <div>
                          <h4>Order #{order.orderNumber || order._id.slice(-6)}</h4>
                          <p className="order-date">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <span className={`status-badge ${(order.status || "pending").toLowerCase().replace(/\s+/g, '-')}`}>
                          {order.status || "Pending"}
                        </span>
                      </div>
                      
                      <div className="order-details">
                        <div className="detail-item">
                          <span>Total Price:</span>
                          <strong>৳{order.totalPrice?.toFixed(2) || "0.00"}</strong>
                        </div>
                        <div className="detail-item">
                          <span>Items:</span>
                          <span>{order.items || 1} item{order.items > 1 ? 's' : ''}</span>
                        </div>
                        {order.products && (
                          <div className="detail-item">
                            <span>Products:</span>
                            <span className="products-list">
                              {order.products.map(p => p.name).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="order-actions">
                        <button 
                          className="view-details-btn"
                          onClick={() => alert(`Order details for ${order.orderNumber}`)}
                        >
                          View Details
                        </button>
                        <button 
                          className="track-btn"
                          onClick={() => alert(`Tracking order ${order.orderNumber}`)}
                        >
                          Track Order
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📦</div>
                  <h3>No Orders Yet</h3>
                  <p>You haven't placed any orders yet.</p>
                  <div className="empty-actions">
                    <button 
                      className="shop-btn"
                      onClick={() => navigate("/shop")}
                    >
                      Start Shopping
                    </button>
                    <button 
                      className="action-btn secondary"
                      onClick={addTestOrder}
                    >
                      Add Test Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "wishlist" && (
            <div className="wishlist-tab">
              <div className="wishlist-header">
                <h2>My Wishlist ({wishlist.length})</h2>
                <div className="wishlist-actions">
                  <button 
                    className="action-btn secondary"
                    onClick={() => navigate("/shop")}
                  >
                    Browse Products
                  </button>
                  {wishlist.length > 0 && (
                    <button 
                      className="action-btn danger"
                      onClick={clearWishlist}
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>
              
              {wishlist.length > 0 ? (
                <div className="wishlist-grid">
                  {wishlist.map(product => (
                    <div key={product._id} className="wishlist-card">
                      <div className="product-image">
                        <img 
                          src={product.images?.[0] || product.image || "/placeholder.jpg"} 
                          alt={product.name}
                          onError={(e) => {
                            e.target.src = "/placeholder.jpg";
                            e.target.onerror = null;
                          }}
                        />
                        <button 
                          className="remove-wishlist-btn"
                          onClick={() => removeFromWishlist(product._id)}
                          title="Remove from wishlist"
                        >
                          ×
                        </button>
                      </div>
                      
                      <div className="product-info">
                        <h4>{product.name}</h4>
                        <p className="product-category">{product.category || "General"}</p>
                        
                        <div className="product-price">
                          <span className="current">৳{product.price?.toFixed(2) || "0.00"}</span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="original">৳{product.originalPrice.toFixed(2)}</span>
                          )}
                        </div>
                        
                        <div className="product-stock">
                          <span className={`stock-badge ${(product.stock > 0 ? 'in-stock' : 'out-of-stock')}`}>
                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                        
                        <div className="product-actions">
                          <button 
                            className="view-btn"
                            onClick={() => navigate(`/product/${product._id}`)}
                          >
                            View Product
                          </button>
                          <button 
                            className="add-to-cart-btn"
                            onClick={() => alert(`${product.name} added to cart!`)}
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">❤️</div>
                  <h3>Your Wishlist is Empty</h3>
                  <p>Save items you love to buy them later.</p>
                  <button 
                    className="shop-btn"
                    onClick={() => navigate("/shop")}
                  >
                    Browse Products
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "update" && (
            <div className="update-tab">
              <h2>Update Profile</h2>
              
              <div className="update-form">
                <div className="form-section">
                  <h3>Personal Information</h3>
                  
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      className="form-input"
                      disabled
                      readOnly
                    />
                    <small className="form-note">Email cannot be changed</small>
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

                <div className="form-section">
                  <h3>Profile Picture</h3>
                  <div className="avatar-upload-section">
                    <div className="current-avatar">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="avatar-preview" />
                      ) : (
                        <div className="avatar-preview placeholder">
                          {userData.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="upload-instructions">
                      <p>Upload a new profile picture</p>
                      <ul>
                        <li>Max file size: 2MB</li>
                        <li>Supported formats: JPG, PNG, GIF</li>
                        <li>Recommended size: 300x300 pixels</li>
                      </ul>
                      <label className="upload-btn">
                        Choose Image
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageUpload}
                        />
                      </label>
                      {selectedFile && (
                        <p className="file-info">
                          Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Shipping Address</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Street Address</label>
                      <input
                        type="text"
                        name="shippingAddress.street"
                        value={formData.shippingAddress.street}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="House no, Road no, Area"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        name="shippingAddress.city"
                        value={formData.shippingAddress.city}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Dhaka"
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>State/Division</label>
                      <input
                        type="text"
                        name="shippingAddress.state"
                        value={formData.shippingAddress.state}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Dhaka Division"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>ZIP Code</label>
                      <input
                        type="text"
                        name="shippingAddress.zipCode"
                        value={formData.shippingAddress.zipCode}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="1200"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Country</label>
                    <select
                      name="shippingAddress.country"
                      value={formData.shippingAddress.country}
                      onChange={handleInputChange}
                      className="form-input"
                    >
                      <option value="Bangladesh">Bangladesh</option>
                      <option value="India">India</option>
                      <option value="USA">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    className="save-btn"
                    onClick={handleSaveProfile}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-small"></span>
                        Saving...
                      </>
                    ) : "Save Changes"}
                  </button>
                  
                  <button 
                    className="cancel-btn"
                    onClick={() => {
                      setActiveTab("dashboard");
                      loadAllData();
                      setSelectedFile(null);
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </button>
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