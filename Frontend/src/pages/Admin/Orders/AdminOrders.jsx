// Frontend/src/pages/Admin/Orders/AdminOrders.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./AdminOrders.css";

const AdminOrders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkAction, setBulkAction] = useState("");

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/login");
      return;
    }
    
    // Fetch orders (for now, using demo data)
    setTimeout(() => {
      setOrders(generateDemoOrders());
      setLoading(false);
    }, 1000);
  }, [user, navigate]);

  const generateDemoOrders = () => {
    const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    const paymentMethods = ["card", "cod", "bkash", "nagad"];
    const customers = ["John Doe", "Jane Smith", "Bob Johnson", "Alice Brown", "Charlie Wilson", "David Lee", "Emma Garcia", "Frank Miller"];
    
    return Array.from({ length: 25 }, (_, i) => ({
      id: `ORD-${String(i + 1).padStart(4, '0')}`,
      customer: customers[i % customers.length],
      customerEmail: `${customers[i % customers.length].toLowerCase().replace(' ', '.')}@example.com`,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount: Math.floor(Math.random() * 10000) + 500,
      status: statuses[i % statuses.length],
      paymentMethod: paymentMethods[i % paymentMethods.length],
      items: Math.floor(Math.random() * 5) + 1,
      address: {
        city: ["Dhaka", "Chittagong", "Rajshahi", "Khulna", "Sylhet"][i % 5],
        country: "Bangladesh"
      }
    }));
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    // Date filtering logic
    const orderDate = new Date(order.date);
    const today = new Date();
    const matchesDate = dateFilter === "all" || 
                       (dateFilter === "today" && orderDate.toDateString() === today.toDateString()) ||
                       (dateFilter === "week" && (today - orderDate) < 7 * 24 * 60 * 60 * 1000) ||
                       (dateFilter === "month" && orderDate.getMonth() === today.getMonth());
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleBulkAction = () => {
    if (!bulkAction || selectedOrders.length === 0) {
      alert("Please select orders and choose an action");
      return;
    }

    if (bulkAction === "delete") {
      if (window.confirm(`Are you sure you want to delete ${selectedOrders.length} orders?`)) {
        setOrders(orders.filter(order => !selectedOrders.includes(order.id)));
        setSelectedOrders([]);
        setBulkAction("");
        alert("Orders deleted successfully!");
      }
    } else {
      setOrders(orders.map(order => 
        selectedOrders.includes(order.id) ? { ...order, status: bulkAction } : order
      ));
      setSelectedOrders([]);
      setBulkAction("");
      alert(`Orders status updated to ${bulkAction}!`);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrders(filteredOrders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    alert(`Order ${orderId} status updated to ${newStatus}`);
  };

  const deleteOrder = (orderId) => {
    if (window.confirm(`Are you sure you want to delete order ${orderId}?`)) {
      setOrders(orders.filter(order => order.id !== orderId));
      alert("Order deleted successfully!");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
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
      case 'pending': return '#f59e0b';
      case 'processing': return '#3b82f6';
      case 'shipped': return '#8b5cf6';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPaymentIcon = (method) => {
    switch(method) {
      case 'card': return '💳';
      case 'cod': return '💰';
      case 'bkash': return '📱';
      case 'nagad': return '📲';
      default: return '💳';
    }
  };

  // Statistics calculation
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.amount, 0),
    averageOrder: orders.length > 0 ? orders.reduce((sum, o) => sum + o.amount, 0) / orders.length : 0
  };

  if (loading) {
    return (
      <div className="admin-orders-loading">
        <div className="spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="admin-orders">
      <div className="orders-header">
        <div>
          <h1>Order Management</h1>
          <p>Manage and track customer orders</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary">
            <span className="btn-icon">📥</span>
            Export Orders
          </button>
          <button className="btn btn-primary">
            <span className="btn-icon">📊</span>
            Generate Report
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="orders-stats">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Orders</p>
            <span className="stat-change">+12% from last month</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
            <span className="stat-change warning">Needs attention</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚚</div>
          <div className="stat-content">
            <h3>{stats.processing}</h3>
            <p>Processing</p>
            <span className="stat-change">In progress</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.revenue)}</h3>
            <p>Revenue</p>
            <span className="stat-change success">+8.5% growth</span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="orders-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by order ID, customer name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <label>Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Date</label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        <button
          className="filter-btn"
          onClick={() => {
            setSearchTerm("");
            setStatusFilter("all");
            setDateFilter("all");
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="bulk-actions-bar">
          <div className="bulk-info">
            <strong>{selectedOrders.length}</strong> orders selected
          </div>
          <div className="bulk-controls">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="bulk-select"
            >
              <option value="">Bulk Actions</option>
              <option value="processing">Mark as Processing</option>
              <option value="shipped">Mark as Shipped</option>
              <option value="delivered">Mark as Delivered</option>
              <option value="cancelled">Mark as Cancelled</option>
              <option value="delete">Delete Selected</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction}
              className="apply-bulk-btn"
            >
              Apply
            </button>
            <button
              onClick={() => setSelectedOrders([])}
              className="clear-bulk-btn"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="orders-table-container">
        <div className="table-responsive">
          <table className="orders-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                  />
                </th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Items</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="empty-table">
                    <div className="empty-icon">📦</div>
                    <p>No orders found</p>
                    <p className="empty-subtext">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className={`order-row status-${order.status}`}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                      />
                    </td>
                    <td>
                      <div className="order-id-cell">
                        <strong>{order.id}</strong>
                        <small>{order.address.city}, {order.address.country}</small>
                      </div>
                    </td>
                    <td>
                      <div className="customer-cell">
                        <div className="customer-avatar">
                          {order.customer.charAt(0).toUpperCase()}
                        </div>
                        <div className="customer-details">
                          <strong>{order.customer}</strong>
                          <small>{order.customerEmail}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="date-cell">
                        {formatDate(order.date)}
                      </div>
                    </td>
                    <td className="amount-cell">
                      <strong>{formatCurrency(order.amount)}</strong>
                    </td>
                    <td>
                      <div className="status-cell">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="payment-cell">
                        <span className="payment-icon">
                          {getPaymentIcon(order.paymentMethod)}
                        </span>
                        <span className="payment-method">
                          {order.paymentMethod.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="items-cell">
                        <span className="items-count">{order.items} item{order.items > 1 ? 's' : ''}</span>
                      </div>
                    </td>
                    <td>
                      <div className="order-actions">
                        <button
                          className="action-btn view-btn"
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                          title="View Details"
                        >
                          👁️
                        </button>
                        <div className="status-dropdown">
                          <button className="action-btn status-btn">
                            🔄
                          </button>
                          <div className="status-menu">
                            <button onClick={() => updateOrderStatus(order.id, 'processing')}>Processing</button>
                            <button onClick={() => updateOrderStatus(order.id, 'shipped')}>Shipped</button>
                            <button onClick={() => updateOrderStatus(order.id, 'delivered')}>Delivered</button>
                            <button onClick={() => updateOrderStatus(order.id, 'cancelled')}>Cancel</button>
                          </div>
                        </div>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => deleteOrder(order.id)}
                          title="Delete Order"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Status Legend */}
      <div className="status-legend">
        <h4>Order Status Guide</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="status-dot pending"></span>
            <span>Pending</span>
          </div>
          <div className="legend-item">
            <span className="status-dot processing"></span>
            <span>Processing</span>
          </div>
          <div className="legend-item">
            <span className="status-dot shipped"></span>
            <span>Shipped</span>
          </div>
          <div className="legend-item">
            <span className="status-dot delivered"></span>
            <span>Delivered</span>
          </div>
          <div className="legend-item">
            <span className="status-dot cancelled"></span>
            <span>Cancelled</span>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <div className="pagination-info">
          Showing 1-{Math.min(filteredOrders.length, 10)} of {filteredOrders.length} orders
        </div>
        <div className="pagination-controls">
          <button className="pagination-btn" disabled>
            ← Previous
          </button>
          <div className="pagination-numbers">
            <button className="pagination-number active">1</button>
            <button className="pagination-number">2</button>
            <button className="pagination-number">3</button>
            <span className="pagination-ellipsis">...</span>
            <button className="pagination-number">5</button>
          </div>
          <button className="pagination-btn">
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;