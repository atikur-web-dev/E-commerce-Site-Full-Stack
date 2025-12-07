import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./Header.css";

const Header = () => {
  const { user, logout } = useAuth();
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
              <Link to="/" className="nav-link">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/shop" className="nav-link">
                Shop
              </Link>
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
                      Profile
                    </Link>

                    <Link
                      to="/orders"
                      className="dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      My Orders
                    </Link>

                    <div className="dropdown-divider"></div>

                    <button
                      onClick={handleLogout}
                      className="dropdown-item logout-btn"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </li>
            ) : (
              // Not Logged In
              <>
                <li className="nav-item">
                  <Link to="/login" className="nav-link btn-login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/register" className="nav-link btn-register">
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
