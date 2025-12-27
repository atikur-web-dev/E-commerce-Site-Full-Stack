import React, { useState } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useCart } from "../../../context/CartContext"; // ✅ CartContext import
import "./Header.css";

const Header = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart(); // ✅ Cart data access
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Calculate cart items count
  const cartItemsCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="logo">
          <Link to="/" className="logo-link">
            <span className="logo-icon">🛒</span>
            <span className="logo-text">ShopEasy</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="nav">
          <ul className="nav-list">
            {/* Public Links - Always Visible */}
            <li className="nav-item">
              <NavLink to="/" className="nav-link" activeClassName="active">
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/shop" className="nav-link" activeClassName="active">
                Shop
              </NavLink>
            </li>

            {/* Cart Link with Badge */}
            <li className="nav-item cart-item">
              <NavLink to="/cart" className="nav-link cart-link" activeClassName="active">
                <span className="cart-icon">🛒</span>
                Cart
                {cartItemsCount > 0 && (
                  <span className="cart-badge">{cartItemsCount}</span>
                )}
              </NavLink>
            </li>

            {/* Conditional Links */}
            {user ? (
              // Logged In User
              <li className="nav-item user-menu">
                <div
                  className="user-profile"
                  onClick={toggleDropdown}
                  onMouseEnter={() => setShowDropdown(true)}
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  <div className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="user-name">{user.name.split(" ")[0]}</span>
                  <span className="dropdown-arrow">▼</span>
                </div>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div
                    className="dropdown-menu"
                    onMouseEnter={() => setShowDropdown(true)}
                    onMouseLeave={() => setShowDropdown(false)}
                  >
                    <div className="user-info">
                      <strong>{user.name}</strong>
                      <small>{user.email}</small>
                    </div>

                    <div className="dropdown-divider"></div>

                    <Link
                      to="/profile"
                      className="dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      👤 Profile
                    </Link>

                    <Link
                      to="/orders"
                      className="dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      📦 My Orders
                    </Link>

                    {/* Checkout Link in Dropdown */}
                    {cartItemsCount > 0 && (
                      <Link
                        to="/checkout"
                        className="dropdown-item checkout-item"
                        onClick={() => setShowDropdown(false)}
                      >
                        💳 Checkout ({cartItemsCount} items)
                      </Link>
                    )}

                    {/* Admin Panel Link (if admin) */}
                    {user.role === "admin" && (
                      <>
                        <div className="dropdown-divider"></div>
                        <Link
                          to="/admin"
                          className="dropdown-item admin-item"
                          onClick={() => setShowDropdown(false)}
                        >
                          👑 Admin Panel
                        </Link>
                      </>
                    )}

                    <div className="dropdown-divider"></div>

                    <button
                      onClick={handleLogout}
                      className="dropdown-item logout-btn"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </li>
            ) : (
              // Not Logged In
              <>
                <li className="nav-item">
                  <NavLink to="/login" className="nav-link btn-login" activeClassName="active">
                    Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/register" className="nav-link btn-register" activeClassName="active">
                    Sign Up
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          {/* Mobile Menu Button */}
          <button className="mobile-menu-btn">
            <span className="menu-icon">☰</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;