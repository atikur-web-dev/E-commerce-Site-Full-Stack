import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-logo">ShopEasy</h3>
            <p className="footer-description">
              Your one-stop destination for quality products at amazing prices.
            </p>
            <div className="social-links">
              <a href="#" className="social-link">
                📘
              </a>
              <a href="#" className="social-link">
                🐦
              </a>
              <a href="#" className="social-link">
                📷
              </a>
              <a href="#" className="social-link">
                💼
              </a>
            </div>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li>
                <Link to="/" className="footer-link">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="footer-link">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/cart" className="footer-link">
                  Cart
                </Link>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Contact Info</h4>
            <div className="contact-info">
              <p className="contact-item">📧 support@shopeasy.com</p>
              <p className="contact-item">📞 +880 1234-567890</p>
              <p className="contact-item">📍 Dhaka, Bangladesh</p>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 ShopEasy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
