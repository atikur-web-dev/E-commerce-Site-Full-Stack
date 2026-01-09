// Frontend/src/pages/Admin/Dashboard/AdminDashboard.jsx 
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
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
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch orders for recent orders
      const ordersResponse = await fetch("http://localhost:5000/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Fetch users for customer count
      const usersResponse = await fetch("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Fetch products for product count
      const productsResponse = await fetch("http://localhost:5000/api/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const [ordersData, usersData, productsData] = await Promise.all([
        ordersResponse.json(),
        usersResponse.json(),
        productsResponse.json(),
      ]);

      // Calculate stats
      if (ordersData.success) {
        const totalRevenue = ordersData.data.reduce((sum, order) => sum + order.totalPrice, 0);
        const totalOrders = ordersData.data.length;
        
        // Get recent orders (last 5)
        const recent = ordersData.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(order => ({
            id: order._id,
            orderId: `ORD-${order._id.toString().slice(-8).toUpperCase()}`,
            customer: order.user?.name || "Unknown",
            date: new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }),
            amount: order.totalPrice,
            status: order.orderStatus,
          }));
        
        setRecentOrders(recent);
        setStats(prev => ({
          ...prev,
          totalRevenue,
          totalOrders,
        }));
      }

      if (usersData.success) {
        setStats(prev => ({
          ...prev,
          totalCustomers: usersData.count || 0,
        }));
      }

      if (productsData.success) {
        setStats(prev => ({
          ...prev,
          totalProducts: productsData.length || 0,
        }));
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Use demo data as fallback
      setRecentOrders(generateDemoOrders());
    } finally {
      setLoading(false);
    }
  };

  const generateDemoOrders = () => {
    return [
      { id: "1", orderId: "#ORD-001", customer: "John Doe", date: "Jan 1, 2026", amount: 1299, status: "Delivered" },
      { id: "2", orderId: "#ORD-002", customer: "Jane Smith", date: "Dec 31, 2025", amount: 899, status: "Processing" },
      { id: "3", orderId: "#ORD-003", customer: "Bob Johnson", date: "Dec 30, 2025", amount: 2499, status: "Pending" },
      { id: "4", orderId: "#ORD-004", customer: "Alice Brown", date: "Dec 29, 2025", amount: 549, status: "Delivered" },
      { id: "5", orderId: "#ORD-005", customer: "Charlie Wilson", date: "Dec 28, 2025", amount: 1199, status: "Shipped" },
    ];
  };

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
    },
    {
      title: "Orders",
      icon: "📦",
      path: "/admin/orders",
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
      value: `৳${stats.totalRevenue.toLocaleString()}`,
      change: "+12.5%",
      icon: "💰",
      color: "#10b981",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      change: "+8.2%",
      icon: "📦",
      color: "#3b82f6",
    },
    {
      title: "Products",
      value: stats.totalProducts.toLocaleString(),
      change: "+5.1%",
      icon: "🛍️",
      color: "#8b5cf6",
    },
    {
      title: "Customers",
      value: stats.totalCustomers.toLocaleString(),
      change: "+15.3%",
      icon: "👥",
      color: "#f59e0b",
    },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

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
            <h1>Dashboard Overview</h1>
            <p className="welcome-text">
              Welcome back, <strong>{user?.name}</strong>
            </p>
          </div>
          <div className="header-right">
            <button className="btn btn-primary" onClick={fetchDashboardData}>
              <span className="btn-icon">↻</span>
              Refresh Data
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
                          {order.orderId}
                        </Link>
                      </td>
                      <td>{order.customer}</td>
                      <td>{order.date}</td>
                      <td className="amount">{formatCurrency(order.amount)}</td>
                      <td>
                        <span className={`status-badge status-${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <Link 
                          to={`/admin/orders/${order.id}`}
                          className="action-btn view-btn"
                        >
                          View
                        </Link>
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
              <Link to="/admin/users" className="action-link">
                View Customers →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;