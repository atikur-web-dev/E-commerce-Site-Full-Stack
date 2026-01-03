// Frontend/src/pages/Admin/Settings/AdminSettings.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./AdminUsers.css";

const AdminUsers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/login");
      return;
    }
    
    // Fetch users (for now, using demo data)
    setTimeout(() => {
      setUsers(generateDemoUsers());
      setLoading(false);
    }, 1000);
  }, [user, navigate]);

  const generateDemoUsers = () => {
    const roles = ["user", "user", "user", "admin"]; // More users, fewer admins
    const statuses = ["active", "active", "active", "inactive", "suspended"];
    const names = [
      "John Doe", "Jane Smith", "Bob Johnson", "Alice Brown", 
      "Charlie Wilson", "David Lee", "Emma Garcia", "Frank Miller",
      "Grace Taylor", "Henry White", "Ivy Clark", "Jack Evans"
    ];
    
    return Array.from({ length: 20 }, (_, i) => ({
      id: `user_${i + 1}`,
      name: names[i % names.length],
      email: `${names[i % names.length].toLowerCase().replace(' ', '.')}${i + 1}@example.com`,
      role: roles[i % roles.length],
      status: statuses[i % statuses.length],
      joinedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      orders: Math.floor(Math.random() * 50),
      totalSpent: Math.floor(Math.random() * 50000) + 1000,
      lastActive: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      avatarColor: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"][i % 5]
    }));
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const updateUserStatus = (userId, newStatus) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
    alert(`User status updated to ${newStatus}`);
  };

  const updateUserRole = (userId, newRole) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
    alert(`User role updated to ${newRole}`);
  };

  const deleteUser = (userId) => {
    if (window.confirm(`Are you sure you want to delete this user? This action cannot be undone.`)) {
      setUsers(users.filter(user => user.id !== userId));
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
      alert("User deleted successfully!");
    }
  };

  const handleBulkAction = (action) => {
    if (selectedUsers.length === 0) {
      alert("Please select users first");
      return;
    }

    if (action === "delete") {
      if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
        setUsers(users.filter(user => !selectedUsers.includes(user.id)));
        setSelectedUsers([]);
        alert("Users deleted successfully!");
      }
    } else {
      setUsers(users.map(user => 
        selectedUsers.includes(user.id) ? { ...user, status: action } : user
      ));
      setSelectedUsers([]);
      alert(`Users status updated to ${action}!`);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  // Statistics calculation
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    admins: users.filter(u => u.role === 'admin').length,
    totalOrders: users.reduce((sum, u) => sum + u.orders, 0),
    totalRevenue: users.reduce((sum, u) => sum + u.totalSpent, 0),
    averageSpent: users.length > 0 ? users.reduce((sum, u) => sum + u.totalSpent, 0) / users.length : 0
  };

  if (loading) {
    return (
      <div className="admin-users-loading">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <div className="users-header">
        <div>
          <h1>Customer Management</h1>
          <p>Manage and view all registered users</p>
        </div>
        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              📊
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              🏠
            </button>
          </div>
          <button className="btn btn-primary">
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
            <span className="stat-change">+{Math.floor(stats.total * 0.12)} this month</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.active}</h3>
            <p>Active Users</p>
            <span className="stat-change success">{Math.round((stats.active / stats.total) * 100)}% active</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛡️</div>
          <div className="stat-content">
            <h3>{stats.admins}</h3>
            <p>Administrators</p>
            <span className="stat-change">{Math.round((stats.admins / stats.total) * 100)}% of total</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.totalRevenue)}</h3>
            <p>Total Revenue</p>
            <span className="stat-change success">{formatCurrency(stats.averageSpent)} avg per user</span>
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
            <option value="suspended">Suspended</option>
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
              <option value="" disabled>Bulk Actions</option>
              <option value="active">Mark as Active</option>
              <option value="inactive">Mark as Inactive</option>
              <option value="suspended">Suspend Users</option>
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
      {viewMode === 'table' ? (
        <div className="users-table-container">
          <div className="table-responsive">
            <table className="users-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
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
                      <p className="empty-subtext">Try adjusting your filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className={`user-row status-${user.status}`}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                        />
                      </td>
                      <td>
                        <div className="user-cell">
                          <div 
                            className="user-avatar"
                            style={{ backgroundColor: user.avatarColor }}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="user-details">
                            <strong>{user.name}</strong>
                            <small>{user.email}</small>
                            <small className="user-id">ID: {user.id}</small>
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
                          style={{ backgroundColor: getStatusColor(user.status) }}
                        >
                          {user.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div className="orders-cell">
                          <strong>{user.orders}</strong>
                          <small>orders</small>
                        </div>
                      </td>
                      <td className="spent-cell">
                        <strong>{formatCurrency(user.totalSpent)}</strong>
                      </td>
                      <td>
                        <div className="date-cell">
                          {formatDate(user.joinedDate)}
                        </div>
                      </td>
                      <td>
                        <div className="date-cell">
                          {formatDate(user.lastActive)}
                          <small className="time-ago">
                            ({Math.floor((new Date() - new Date(user.lastActive)) / (1000 * 60 * 60 * 24))} days ago)
                          </small>
                        </div>
                      </td>
                      <td>
                        <div className="user-actions">
                          <button
                            className="action-btn view-btn"
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                            title="View Profile"
                          >
                            👁️
                          </button>
                          <div className="status-dropdown">
                            <button className="action-btn status-btn">
                              🔄
                            </button>
                            <div className="status-menu">
                              <button onClick={() => updateUserStatus(user.id, 'active')}>Active</button>
                              <button onClick={() => updateUserStatus(user.id, 'inactive')}>Inactive</button>
                              <button onClick={() => updateUserStatus(user.id, 'suspended')}>Suspend</button>
                            </div>
                          </div>
                          <div className="role-dropdown">
                            <button className="action-btn role-btn">
                              🛡️
                            </button>
                            <div className="role-menu">
                              <button onClick={() => updateUserRole(user.id, 'admin')}>Make Admin</button>
                              <button onClick={() => updateUserRole(user.id, 'user')}>Make User</button>
                            </div>
                          </div>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => deleteUser(user.id)}
                            title="Delete User"
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
              <div key={user.id} className="user-card">
                <div className="card-header">
                  <div 
                    className="user-avatar-large"
                    style={{ backgroundColor: user.avatarColor }}
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
                  <p className="user-id">ID: {user.id}</p>
                  
                  <div className="user-stats">
                    <div className="stat">
                      <div className="stat-value">{user.orders}</div>
                      <div className="stat-label">Orders</div>
                    </div>
                    <div className="stat">
                      <div className="stat-value">{formatCurrency(user.totalSpent)}</div>
                      <div className="stat-label">Spent</div>
                    </div>
                  </div>
                  
                  <div className="user-dates">
                    <p>Joined: {formatDate(user.joinedDate)}</p>
                    <p>Last Active: {formatDate(user.lastActive)}</p>
                  </div>
                </div>
                
                <div className="card-footer">
                  <button
                    className="action-btn view-btn"
                    onClick={() => navigate(`/admin/users/${user.id}`)}
                    title="View Profile"
                  >
                    👁️ View
                  </button>
                  <button
                    className="action-btn edit-btn"
                    onClick={() => alert(`Edit ${user.name}`)}
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
                  style={{ width: `${(users.filter(u => u.role === 'user').length / users.length) * 100}%` }}
                ></div>
              </div>
              <div className="distribution-label">
                <span className="dot user-dot"></span>
                <span>Regular Users ({users.filter(u => u.role === 'user').length})</span>
              </div>
            </div>
            <div className="distribution-item">
              <div className="distribution-bar">
                <div 
                  className="bar-fill admin-fill"
                  style={{ width: `${(users.filter(u => u.role === 'admin').length / users.length) * 100}%` }}
                ></div>
              </div>
              <div className="distribution-label">
                <span className="dot admin-dot"></span>
                <span>Admins ({users.filter(u => u.role === 'admin').length})</span>
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
              <div className="activity-value">{users.filter(u => u.status === 'inactive').length}</div>
              <div className="activity-label">Inactive</div>
            </div>
            <div className="activity-item">
              <div className="activity-value">{users.filter(u => u.status === 'suspended').length}</div>
              <div className="activity-label">Suspended</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <div className="pagination-info">
          Showing 1-{Math.min(filteredUsers.length, 10)} of {filteredUsers.length} users
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