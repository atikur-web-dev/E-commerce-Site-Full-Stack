import React, { useState, useEffect } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useCart } from "../../../context/CartContext";
import "./Header.css";

const Header = () => {
  const { user, logout } = useAuth();
  const { cartItems, getTotalItems } = useCart();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setCartCount(getTotalItems());
  }, [cartItems, getTotalItems]);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const navLinks = [
    { path: "/", label: "Home", icon: "🏠" },
    { path: "/shop", label: "Shop", icon: "🛍️" },
    {
      path: "/cart",
      label: "Cart",
      icon: "🛒",
      badge: cartCount > 0 ? cartCount : null,
    },
  ];

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <div className="logo">
            <Link to="/" className="logo-link">
              <div className="logo-icon">⚡</div>
              <div className="logo-text">
                <span className="logo-main">TechShop</span>
                <span className="logo-sub">Electronics Store of Atikur</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <ul className="nav-list">
              {navLinks.map((link) => (
                <li key={link.path} className="nav-item">
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      `nav-link ${isActive ? "active" : ""}`
                    }
                  >
                    <span className="nav-icon">{link.icon}</span>
                    <span className="nav-label">{link.label}</span>
                    {link.badge && (
                      <span className="nav-badge">{link.badge}</span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Actions */}
          <div className="user-actions">
            {user ? (
              <div className="user-menu">
                <div
                  className="user-profile"
                  onClick={toggleDropdown}
                  onMouseEnter={() => setShowDropdown(true)}
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  <div className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <span className="user-name">
                      Hi, {user.name.split(" ")[0]}
                    </span>
                    <span className="user-email">{user.email}</span>
                  </div>
                  <span className="dropdown-arrow">▼</span>
                </div>

                {showDropdown && (
                  <div
                    className="dropdown-menu"
                    onMouseEnter={() => setShowDropdown(true)}
                    onMouseLeave={() => setShowDropdown(false)}
                  >
                    <div className="dropdown-header">
                      <div className="dropdown-avatar">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="dropdown-name">{user.name}</div>
                        <div className="dropdown-email">{user.email}</div>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    
                    <Link
                      to="/profile"
                      className="dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      <span className="item-icon">👤</span>
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to="/orders"
                      className="dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      <span className="item-icon">📦</span>
                      <span>My Orders</span>
                    </Link>
                   
                    <Link
                      to="/profile?tab=wishlist"
                      className="dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      <span className="item-icon">❤️</span>
                      <span>Wishlist</span>
                      <span className="dropdown-badge">
                        {JSON.parse(
                          localStorage.getItem(`wishlist_${user._id}`)
                        )?.length || 0}
                      </span>
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button
                      onClick={handleLogout}
                      className="dropdown-item logout"
                    >
                      <span className="item-icon">🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-outline btn-sm">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            <span className="menu-icon">☰</span>
            {cartCount > 0 && (
              <span className="mobile-cart-badge">{cartCount}</span>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="mobile-nav">
            <div className="mobile-nav-header">
              <h3>Menu</h3>
              <button className="close-menu" onClick={toggleMobileMenu}>
                ×
              </button>
            </div>

            <div className="mobile-nav-links">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `mobile-nav-link ${isActive ? "active" : ""}`
                  }
                  onClick={toggleMobileMenu}
                >
                  <span className="mobile-nav-icon">{link.icon}</span>
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="mobile-nav-badge">{link.badge}</span>
                  )}
                </NavLink>
              ))}

              {user ? (
                <>
                  <div className="mobile-nav-divider"></div>
                  <Link
                    to="/profile"
                    className="mobile-nav-link"
                    onClick={toggleMobileMenu}
                  >
                    <span className="mobile-nav-icon">👤</span>
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/orders"
                    className="mobile-nav-link"
                    onClick={toggleMobileMenu}
                  >
                    <span className="mobile-nav-icon">📦</span>
                    <span>My Orders</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMobileMenu();
                    }}
                    className="mobile-nav-link logout"
                  >
                    <span className="mobile-nav-icon">🚪</span>
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="mobile-nav-divider"></div>
                  <Link
                    to="/login"
                    className="mobile-nav-link"
                    onClick={toggleMobileMenu}
                  >
                    <span className="mobile-nav-icon">🔑</span>
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="mobile-nav-link"
                    onClick={toggleMobileMenu}
                  >
                    <span className="mobile-nav-icon">📝</span>
                    <span>Sign Up</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
