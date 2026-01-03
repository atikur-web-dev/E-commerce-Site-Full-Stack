// Frontend/src/pages/Admin/Dashboard/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    // Check if user is admin
    const userData = JSON.parse(localStorage.getItem("user"));
    
    if (!userData) {
      navigate("/login");
      return;
    }
    
    if (userData.role !== "admin") {
      alert("Access denied! Admin only.");
      navigate("/");
      return;
    }
    
    setUser(userData);
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const adminMenu = [
    {
      title: "Dashboard",
      icon: "📊",
      path: "/admin/dashboard",
    },
    {
      title: "Products",
      icon: "🛍️",
      path: "/admin/products",
      submenu: [
        { title: "All Products", path: "/admin/products" },
        { title: "Add New", path: "/admin/products/add" },
        { title: "Categories", path: "/admin/products/categories" },
      ],
    },
    {
      title: "Orders",
      icon: "📦",
      path: "/admin/orders",
      badge: "5",
    },
    {
    title: "Customers",
    icon: "👥",
    path: "/admin/users", 
  },
    {
      title: "Analytics",
      icon: "📈",
      path: "/admin/analytics",
    },
    {
      title: "Settings",
      icon: "⚙️",
      path: "/admin/settings",
    },
  ];

  const statsData = [
    {
      title: "Total Revenue",
      value: "৳25,840",
      change: "+12.5%",
      icon: "💰",
      color: "#10b981",
    },
    {
      title: "Total Orders",
      value: "1,248",
      change: "+8.2%",
      icon: "📦",
      color: "#3b82f6",
    },
    {
      title: "Products",
      value: "567",
      change: "+5.1%",
      icon: "🛍️",
      color: "#8b5cf6",
    },
    {
      title: "Customers",
      value: "3,245",
      change: "+15.3%",
      icon: "👥",
      color: "#f59e0b",
    },
  ];

  const recentOrders = [
    { id: "#ORD-001", customer: "John Doe", date: "Jan 1, 2026", amount: "৳1,299", status: "Delivered" },
    { id: "#ORD-002", customer: "Jane Smith", date: "Dec 31, 2025", amount: "৳899", status: "Processing" },
    { id: "#ORD-003", customer: "Bob Johnson", date: "Dec 30, 2025", amount: "৳2,499", status: "Pending" },
    { id: "#ORD-004", customer: "Alice Brown", date: "Dec 29, 2025", amount: "৳549", status: "Delivered" },
    { id: "#ORD-005", customer: "Charlie Wilson", date: "Dec 28, 2025", amount: "৳1,199", status: "Shipped" },
  ];

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🛡️</span>
            {sidebarOpen && <span className="logo-text">Admin Panel</span>}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          {sidebarOpen && (
            <div className="user-details">
              <h4>{user?.name || "Admin User"}</h4>
              <p className="user-role">
                <span className="role-badge">Administrator</span>
              </p>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {adminMenu.map((item) => (
            <div key={item.title} className="nav-item-wrapper">
              <Link
                to={item.path}
                className={`nav-item ${
                  window.location.pathname === item.path ? "active" : ""
                }`}
              >
                <span className="nav-icon">{item.icon}</span>
                {sidebarOpen && (
                  <>
                    <span className="nav-title">{item.title}</span>
                    {item.badge && (
                      <span className="nav-badge">{item.badge}</span>
                    )}
                  </>
                )}
              </Link>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="go-to-store" onClick={() => navigate("/")}>
            <span className="nav-icon">🏠</span>
            {sidebarOpen && <span>Go to Store</span>}
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <h1>Admin Dashboard</h1>
            <p className="welcome-text">
              Welcome back, <strong>{user?.name}</strong>
            </p>
          </div>
          <div className="header-right">
            <button className="header-btn notification-btn">
              <span className="btn-icon">🔔</span>
              <span className="notification-badge">3</span>
            </button>
            <button className="header-btn profile-btn">
              <span className="avatar-small">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Stats Grid */}
          <div className="stats-grid">
            {statsData.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon" style={{ color: stat.color }}>
                    {stat.icon}
                  </div>
                  <span className="stat-change positive">{stat.change}</span>
                </div>
                <div className="stat-body">
                  <h3 className="stat-value">{stat.value}</h3>
                  <p className="stat-title">{stat.title}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Orders Table */}
          <div className="recent-orders-card">
            <div className="card-header">
              <h3>Recent Orders</h3>
              <Link to="/admin/orders" className="view-all">
                View All →
              </Link>
            </div>
            <div className="table-responsive">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <Link to={`/admin/orders/${order.id}`} className="order-id">
                          {order.id}
                        </Link>
                      </td>
                      <td>{order.customer}</td>
                      <td>{order.date}</td>
                      <td className="amount">{order.amount}</td>
                      <td>
                        <span className={`status-badge status-${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <button className="action-btn view-btn">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-grid">
            <div className="quick-action-card">
              <div className="action-icon add-product">➕</div>
              <h4>Add New Product</h4>
              <p>Add a new product to your store</p>
              <Link to="/admin/products/add" className="action-link">
                Add Product →
              </Link>
            </div>
            <div className="quick-action-card">
              <div className="action-icon manage-orders">📋</div>
              <h4>Manage Orders</h4>
              <p>Process and manage customer orders</p>
              <Link to="/admin/orders" className="action-link">
                View Orders →
              </Link>
            </div>
            <div className="quick-action-card">
              <div className="action-icon analytics">📊</div>
              <h4>View Analytics</h4>
              <p>Check store performance and insights</p>
              <Link to="/admin/analytics" className="action-link">
                View Analytics →
              </Link>
            </div>
            <div className="quick-action-card">
              <div className="action-icon customers">👥</div>
              <h4>Customer Insights</h4>
              <p>View and manage customer data</p>
              <Link to="/admin/customers" className="action-link">
                View Customers →
              </Link>
            </div>
          </div>

          {/* Product Performance */}
          <div className="product-performance">
            <div className="card-header">
              <h3>Top Selling Products</h3>
            </div>
            <div className="performance-list">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="performance-item">
                  <div className="product-info">
                    <div className="product-image">
                      <img
                        src={`https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop&auto=format&q=60`}
                        alt={`Product ${item}`}
                      />
                    </div>
                    <div>
                      <h4>Product Name {item}</h4>
                      <p className="product-category">Electronics</p>
                    </div>
                  </div>
                  <div className="product-stats">
                    <div className="stat">
                      <span className="stat-label">Sold:</span>
                      <span className="stat-value">1,245</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Revenue:</span>
                      <span className="stat-value">৳24,900</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Stock:</span>
                      <span className="stat-value">156</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;