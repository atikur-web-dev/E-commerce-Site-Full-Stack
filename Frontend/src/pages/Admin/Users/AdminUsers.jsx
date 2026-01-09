// Frontend/src/pages/Admin/Users/AdminUsers.jsx 
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./AdminUsers.css";

const AdminUsers = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [viewMode, setViewMode] = useState("table");
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    admins: 0,
    totalOrders: 0,
    totalRevenue: 0,
    averageSpent: 0,
  });

  useEffect(() => {
    if (currentUser?.role !== "admin") {
      navigate("/login");
      return;
    }

    fetchRealUsers();
  }, [currentUser, navigate]);

  // Fetch real users from MongoDB
  const fetchRealUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      console.log("Fetching real users from API...");
      
      // Fetch users
      const usersResponse = await fetch("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!usersResponse.ok) {
        throw new Error(`HTTP ${usersResponse.status}: Failed to fetch users`);
      }

      const usersData = await usersResponse.json();
      console.log("Real users from MongoDB:", usersData);

      if (usersData.success && usersData.data) {
        setUsers(usersData.data);
        
        // Calculate statistics
        const totalUsers = usersData.data.length;
        const activeUsers = usersData.data.filter(u => u.status === "active").length;
        const adminUsers = usersData.data.filter(u => u.role === "admin").length;
        const totalOrders = usersData.data.reduce((sum, u) => sum + (u.orders || 0), 0);
        const totalRevenue = usersData.data.reduce((sum, u) => sum + (u.totalSpent || 0), 0);
        const averageSpent = totalUsers > 0 ? totalRevenue / totalUsers : 0;
        
        setStats({
          total: totalUsers,
          active: activeUsers,
          admins: adminUsers,
          totalOrders,
          totalRevenue,
          averageSpent,
        });
      } else {
        setError(usersData.message || "Failed to fetch users");
        // Fallback to demo data
        setUsers(generateDemoUsers());
        calculateDemoStats();
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.message || "Failed to load users from server");
      
      // Fallback to demo data if API fails
      console.log("Using demo data as fallback");
      const demoUsers = generateDemoUsers();
      setUsers(demoUsers);
      calculateDemoStats(demoUsers);
    } finally {
      setLoading(false);
    }
  };

  // Demo data generator (fallback)
  const generateDemoUsers = () => {
    const roles = ["user", "user", "user", "admin"];
    const statuses = ["active", "active", "active", "inactive"];
    const names = [
      "John Doe", "Jane Smith", "Bob Johnson", "Alice Brown", 
      "Charlie Wilson", "David Lee", "Emma Garcia", "Frank Miller",
      "Grace Taylor", "Henry White", "Ivy Clark", "Jack Evans"
    ];
    
    return Array.from({ length: 20 }, (_, i) => ({
      _id: `user_${i + 1}`,
      id: `user_${i + 1}`,
      name: names[i % names.length],
      email: `${names[i % names.length].toLowerCase().replace(" ", ".")}${i + 1}@example.com`,
      role: roles[i % roles.length],
      status: statuses[i % statuses.length],
      phone: `01${Math.floor(Math.random() * 90000000) + 10000000}`,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      orders: Math.floor(Math.random() * 50),
      totalSpent: Math.floor(Math.random() * 50000) + 1000,
      avatarColor: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"][i % 5],
      isActive: statuses[i % statuses.length] === "active"
    }));
  };

  const calculateDemoStats = (demoUsers) => {
    if (!demoUsers) demoUsers = users;
    
    const totalUsers = demoUsers.length;
    const activeUsers = demoUsers.filter(u => u.status === "active").length;
    const adminUsers = demoUsers.filter(u => u.role === "admin").length;
    const totalOrders = demoUsers.reduce((sum, u) => sum + (u.orders || 0), 0);
    const totalRevenue = demoUsers.reduce((sum, u) => sum + (u.totalSpent || 0), 0);
    const averageSpent = totalUsers > 0 ? totalRevenue / totalUsers : 0;
    
    setStats({
      total: totalUsers,
      active: activeUsers,
      admins: adminUsers,
      totalOrders,
      totalRevenue,
      averageSpent,
    });
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user._id && user._id.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map((u) => u._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Update user status with real API call
  const updateUserStatus = async (userId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const isActive = newStatus === "active";

      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update local state
        setUsers(
          users.map((user) =>
            user._id === userId
              ? {
                  ...user,
                  status: newStatus,
                  isActive: isActive
                }
              : user
          )
        );
        
        // Update stats
        const activeCount = users.map(u => 
          u._id === userId ? (newStatus === "active" ? 1 : 0) : (u.status === "active" ? 1 : 0)
        ).reduce((a, b) => a + b, 0);
        
        setStats(prev => ({ ...prev, active: activeCount }));

        alert(`User status updated to ${newStatus}`);
      } else {
        throw new Error(data.message || "Failed to update user status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert(`Failed to update user status: ${err.message}`);
    }
  };

  // Update user role with real API call
  const updateUserRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update local state
        setUsers(
          users.map((user) =>
            user._id === userId
              ? {
                  ...user,
                  role: newRole,
                }
              : user
          )
        );
        
        // Update stats
        const adminCount = users.map(u => 
          u._id === userId ? (newRole === "admin" ? 1 : 0) : (u.role === "admin" ? 1 : 0)
        ).reduce((a, b) => a + b, 0);
        
        setStats(prev => ({ ...prev, admins: adminCount }));

        alert(`User role updated to ${newRole}`);
      } else {
        throw new Error(data.message || "Failed to update user role");
      }
    } catch (err) {
      console.error("Error updating role:", err);
      alert(`Failed to update user role: ${err.message}`);
    }
  };

  // Delete user with real API call
  const deleteUser = async (userId) => {
    try {
      // Check if trying to delete self
      const userToDelete = users.find(u => u._id === userId);
      if (userToDelete?.email === currentUser?.email) {
        alert("You cannot delete your own account!");
        return;
      }

      if (!window.confirm(`Are you sure you want to delete user ${userToDelete?.name}? This action cannot be undone.`)) {
        return;
      }

      const token = localStorage.getItem("token");
      
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update local state
        setUsers(users.filter((user) => user._id !== userId));
        setSelectedUsers(selectedUsers.filter((id) => id !== userId));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          total: prev.total - 1,
          active: userToDelete.status === "active" ? prev.active - 1 : prev.active,
          admins: userToDelete.role === "admin" ? prev.admins - 1 : prev.admins
        }));
        
        alert("User deleted successfully!");
      } else {
        throw new Error(data.message || "Failed to delete user");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      alert(`Failed to delete user: ${err.message}`);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      alert("Please select users first");
      return;
    }

    if (action === "delete") {
      if (!window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
        return;
      }
      
      // Delete users one by one
      const deletePromises = selectedUsers.map(userId => deleteUser(userId));
      await Promise.all(deletePromises);
      setSelectedUsers([]);
      
    } else {
      // Update status for selected users
      const updatePromises = selectedUsers.map(userId => 
        updateUserStatus(userId, action)
      );
      await Promise.all(updatePromises);
      setSelectedUsers([]);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#10b981";
      case "inactive":
        return "#6b7280";
      case "suspended":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "#8b5cf6";
      case "user":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  };

  if (loading) {
    return (
      <div className="admin-users-loading">
        <div className="spinner"></div>
        <p>Loading users from database...</p>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <div className="users-header">
        <div>
          <h1>Customer Management</h1>
          <p>Manage and view all registered users</p>
          {error && users.length > 0 && (
            <div className="warning-banner">
              <span>⚠️</span> Using demo data: {error}
            </div>
          )}
        </div>
        <div className="header-actions">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
              title="Table View"
            >
              📊
            </button>
            <button
              className={`toggle-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              🏠
            </button>
          </div>
          <button className="btn btn-primary" onClick={fetchRealUsers}>
            <span className="btn-icon">🔄</span>
            Refresh
          </button>
          <button className="btn btn-secondary">
            <span className="btn-icon">📥</span>
            Export Users
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="users-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Users</p>
            <span className="stat-change">
              +{Math.floor(stats.total * 0.12)} this month
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.active}</h3>
            <p>Active Users</p>
            <span className="stat-change success">
              {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% active
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛡️</div>
          <div className="stat-content">
            <h3>{stats.admins}</h3>
            <p>Administrators</p>
            <span className="stat-change">
              {stats.total > 0 ? Math.round((stats.admins / stats.total) * 100) : 0}% of total
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.totalRevenue)}</h3>
            <p>Total Revenue</p>
            <span className="stat-change success">
              {formatCurrency(stats.averageSpent)} avg per user
            </span>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="users-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, email or user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <label>Role</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button
          className="filter-btn"
          onClick={() => {
            setSearchTerm("");
            setRoleFilter("all");
            setStatusFilter("all");
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="bulk-actions-bar">
          <div className="bulk-info">
            <strong>{selectedUsers.length}</strong> users selected
          </div>
          <div className="bulk-controls">
            <select
              onChange={(e) => handleBulkAction(e.target.value)}
              className="bulk-select"
              defaultValue=""
            >
              <option value="" disabled>
                Bulk Actions
              </option>
              <option value="active">Mark as Active</option>
              <option value="inactive">Mark as Inactive</option>
              <option value="delete">Delete Selected</option>
            </select>
            <button
              onClick={() => setSelectedUsers([])}
              className="clear-bulk-btn"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Users Table View */}
      {viewMode === "table" ? (
        <div className="users-table-container">
          <div className="table-responsive">
            <table className="users-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        selectedUsers.length === filteredUsers.length &&
                        filteredUsers.length > 0
                      }
                    />
                  </th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Joined Date</th>
                  <th>Last Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="empty-table">
                      <div className="empty-icon">👤</div>
                      <p>No users found</p>
                      <p className="empty-subtext">
                        Try adjusting your filters
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className={`user-row status-${user.status}`}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => handleSelectUser(user._id)}
                        />
                      </td>
                      <td>
                        <div className="user-cell">
                          <div
                            className="user-avatar"
                            style={{ backgroundColor: user.avatarColor || "#3b82f6" }}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="user-details">
                            <strong>{user.name}</strong>
                            <small>{user.email}</small>
                            <small className="user-id">ID: {user._id.substring(0, 8)}...</small>
                            {user.phone && <small>Phone: {user.phone}</small>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className="role-badge"
                          style={{ backgroundColor: getRoleColor(user.role) }}
                        >
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: getStatusColor(user.status),
                          }}
                        >
                          {user.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div className="orders-cell">
                          <strong>{user.orders || 0}</strong>
                          <small>orders</small>
                        </div>
                      </td>
                      <td className="spent-cell">
                        <strong>{formatCurrency(user.totalSpent || 0)}</strong>
                      </td>
                      <td>
                        <div className="date-cell">
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td>
                        <div className="date-cell">
                          {formatDate(user.lastLogin)}
                          {user.lastLogin && (
                            <small className="time-ago">
                              (
                              {Math.floor(
                                (new Date() - new Date(user.lastLogin)) /
                                  (1000 * 60 * 60 * 24)
                              )}{" "}
                              days ago)
                            </small>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="user-actions">
                          <button
                            className="action-btn view-btn"
                            onClick={() => navigate(`/admin/users/${user._id}`)}
                            title="View Profile"
                          >
                            👁️
                          </button>
                          <div className="status-dropdown">
                            <button className="action-btn status-btn">
                              🔄
                            </button>
                            <div className="status-menu">
                              <button
                                onClick={() =>
                                  updateUserStatus(user._id, "active")
                                }
                                disabled={user.status === "active"}
                              >
                                Active
                              </button>
                              <button
                                onClick={() =>
                                  updateUserStatus(user._id, "inactive")
                                }
                                disabled={user.status === "inactive"}
                              >
                                Inactive
                              </button>
                            </div>
                          </div>
                          <div className="role-dropdown">
                            <button className="action-btn role-btn">🛡️</button>
                            <div className="role-menu">
                              <button
                                onClick={() => updateUserRole(user._id, "admin")}
                                disabled={user.role === "admin" || user.email === currentUser?.email}
                              >
                                Make Admin
                              </button>
                              <button
                                onClick={() => updateUserRole(user._id, "user")}
                                disabled={user.role === "user" || user.email === currentUser?.email}
                              >
                                Make User
                              </button>
                            </div>
                          </div>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => deleteUser(user._id)}
                            title="Delete User"
                            disabled={user.email === currentUser?.email}
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
      ) : (
        /* Users Grid View */
        <div className="users-grid">
          {filteredUsers.length === 0 ? (
            <div className="empty-grid">
              <div className="empty-icon">👤</div>
              <p>No users found</p>
              <p className="empty-subtext">Try adjusting your filters</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user._id} className="user-card">
                <div className="card-header">
                  <div
                    className="user-avatar-large"
                    style={{ backgroundColor: user.avatarColor || "#3b82f6" }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-badges">
                    <span
                      className="role-badge"
                      style={{ backgroundColor: getRoleColor(user.role) }}
                    >
                      {user.role.toUpperCase()}
                    </span>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(user.status) }}
                    >
                      {user.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="card-body">
                  <h3>{user.name}</h3>
                  <p className="user-email">{user.email}</p>
                  {user.phone && <p className="user-phone">📱 {user.phone}</p>}
                  <p className="user-id">ID: {user._id.substring(0, 12)}...</p>

                  <div className="user-stats">
                    <div className="stat">
                      <div className="stat-value">{user.orders || 0}</div>
                      <div className="stat-label">Orders</div>
                    </div>
                    <div className="stat">
                      <div className="stat-value">
                        {formatCurrency(user.totalSpent || 0)}
                      </div>
                      <div className="stat-label">Spent</div>
                    </div>
                  </div>

                  <div className="user-dates">
                    <p>Joined: {formatDate(user.createdAt)}</p>
                    <p>Last Active: {formatDate(user.lastLogin)}</p>
                  </div>
                </div>

                <div className="card-footer">
                  <button
                    className="action-btn view-btn"
                    onClick={() => navigate(`/admin/users/${user._id}`)}
                    title="View Profile"
                  >
                    👁️ View
                  </button>
                  <button
                    className="action-btn edit-btn"
                    onClick={() => navigate(`/admin/users/${user._id}/edit`)}
                    title="Edit User"
                  >
                    ✏️ Edit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* User Statistics */}
      <div className="user-statistics">
        <div className="stats-card">
          <h3>User Distribution</h3>
          <div className="distribution">
            <div className="distribution-item">
              <div className="distribution-bar">
                <div
                  className="bar-fill user-fill"
                  style={{
                    width: `${
                      stats.total > 0 ? ((stats.total - stats.admins) / stats.total) * 100 : 0
                    }%`,
                  }}
                ></div>
              </div>
              <div className="distribution-label">
                <span className="dot user-dot"></span>
                <span>
                  Regular Users ({stats.total - stats.admins})
                </span>
              </div>
            </div>
            <div className="distribution-item">
              <div className="distribution-bar">
                <div
                  className="bar-fill admin-fill"
                  style={{
                    width: `${
                      stats.total > 0 ? (stats.admins / stats.total) * 100 : 0
                    }%`,
                  }}
                ></div>
              </div>
              <div className="distribution-label">
                <span className="dot admin-dot"></span>
                <span>
                  Admins ({stats.admins})
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <h3>Activity Status</h3>
          <div className="activity-stats">
            <div className="activity-item">
              <div className="activity-value">{stats.active}</div>
              <div className="activity-label">Active Users</div>
            </div>
            <div className="activity-item">
              <div className="activity-value">
                {stats.total - stats.active}
              </div>
              <div className="activity-label">Inactive</div>
            </div>
            <div className="activity-item">
              <div className="activity-value">
                {stats.totalOrders}
              </div>
              <div className="activity-label">Total Orders</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <div className="pagination-info">
          Showing 1-{Math.min(filteredUsers.length, 10)} of {filteredUsers.length} users
          {users.length > 0 && (
            <span className="data-source">
              {error ? ' (Demo Data)' : ' (Live from MongoDB)'}
            </span>
          )}
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

export default AdminUsers;