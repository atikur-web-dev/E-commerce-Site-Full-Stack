// Frontend/src/pages/Login/Login.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaUserShield,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaSignInAlt,
  FaShieldAlt,
} from "react-icons/fa";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState("");
  const [userType, setUserType] = useState("user"); // 'user' or 'admin'
  const [showPassword, setShowPassword] = useState(false);

  const { login, error: apiError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path and registration message if any
  const from = location.state?.from?.pathname || "/";
  const registeredEmail = location.state?.registeredEmail || "";
  const regMessage = location.state?.message || "";

  // Auto-fill email if coming from registration
  useEffect(() => {
    if (registeredEmail) {
      setFormData((prev) => ({
        ...prev,
        email: registeredEmail,
      }));
      setRegistrationSuccess(regMessage);
    }
  }, [registeredEmail, regMessage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Clear registration success message
    if (registrationSuccess) {
      setRegistrationSuccess("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    // Clear previous errors
    setErrors({});

    const result = await login({
      email: formData.email,
      password: formData.password,
      userType: userType, // Add userType to login data
    });

    setIsSubmitting(false);

    if (result.success) {
      // Remember me functionality
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }

      //  FIX: Get user from result.data, NOT localStorage
      const loggedInUser =
        result.data || JSON.parse(localStorage.getItem("user"));

      // Redirect based on role
      if (loggedInUser?.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } else {
      // Show API error in form
      setErrors({
        api: result.error || "Login failed. Please try again.",
      });
    }
  };

  return (
    <div className="login-container">
      {/* Professional Background Image with Overlay */}
      <div className="login-background">
        <div className="background-overlay"></div>
        <div className="background-pattern"></div>
      </div>

      {/* Animated Gradient Orbs */}
      <div className="gradient-orb orb-1"></div>
      <div className="gradient-orb orb-2"></div>
      <div className="gradient-orb orb-3"></div>

      <div className="login-card">
        <div className="login-header">
          <div className="header-icon-wrapper">
            <div className="header-icon">
              <FaSignInAlt className="icon-pulse" />
            </div>
          </div>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to continue your journey</p>
        </div>

        {/* User Type Selector */}
        <div className="user-type-selector">
          <div
            className={`user-type-option ${
              userType === "user" ? "active" : ""
            }`}
            onClick={() => setUserType("user")}
          >
            <div className="user-type-icon">
              <FaUser />
            </div>
            <div className="user-type-content">
              <h4>User Login</h4>
              <p>Access shopping features</p>
            </div>
            <div className="user-type-check">
              {userType === "user" && <FaCheckCircle className="checkmark" />}
            </div>
          </div>

          <div
            className={`user-type-option ${
              userType === "admin" ? "active" : ""
            }`}
            onClick={() => setUserType("admin")}
          >
            <div className="user-type-icon">
              <FaUserShield />
            </div>
            <div className="user-type-content">
              <h4>Admin Login</h4>
              <p>Access admin dashboard</p>
            </div>
            <div className="user-type-check">
              {userType === "admin" && <FaCheckCircle className="checkmark" />}
            </div>
          </div>
        </div>

        {/* Registration Success Message */}
        {registrationSuccess && (
          <div className="success-message">
            <div className="success-icon-wrapper">
              <FaCheckCircle className="success-icon" />
            </div>
            <div className="success-text">
              <p className="success-title">{registrationSuccess}</p>
              <p className="success-subtitle">
                Please login with your credentials below.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <FaEnvelope className="label-icon" />
              <span> Email Address</span>
            </label>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? "error" : ""}`}
                placeholder="you@example.com"
                disabled={isSubmitting}
                autoComplete="email"
              />
              {formData.email && !errors.email && (
                <FaCheckCircle className="input-success-icon" />
              )}
            </div>
            {errors.email && (
              <span className="error-message">
                <FaExclamationCircle className="error-icon" />
                <span>{errors.email}</span>
              </span>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <div className="password-label-row">
              <label htmlFor="password" className="form-label">
                <FaLock className="label-icon" />
                <span> Password</span>
              </label>
              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
            </div>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? "error" : ""}`}
                placeholder=""
                disabled={isSubmitting}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <span className="error-message">
                <FaExclamationCircle className="error-icon" />
                <span>{errors.password}</span>
              </span>
            )}
          </div>

          {/* Remember Me */}
          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="checkbox-input"
                disabled={isSubmitting}
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-text">Remember me for 30 days</span>
            </label>
          </div>

          {/* API Error Display */}
          {errors.api && (
            <div className="api-error-message">
              <FaExclamationCircle className="api-error-icon" />
              <span className="error-text">{errors.api}</span>
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <FaSpinner className="spinner-icon" />
                <span>
                  {userType === "admin"
                    ? "Signing in as Admin..."
                    : "Signing in..."}
                </span>
              </>
            ) : (
              <>
                <FaSignInAlt />
                <span>
                  Sign in as {userType === "admin" ? "Admin" : "User"}
                </span>
              </>
            )}
          </button>
        </form>

        {/* Sign up link */}
        <div className="signup-redirect">
          <p className="redirect-text">
            Don't have an account?{" "}
            <Link to="/register" className="redirect-link">
              Create one now
            </Link>
          </p>
        </div>

        {/* Footer with Security Badge */}
        <div className="login-footer">
          <div className="security-badge">
            <FaShieldAlt className="shield-icon" />
            <span>Secure login with enterprise-grade encryption</span>
          </div>
          <p className="terms-text">
            By signing in, you agree to our{" "}
            <a href="/terms" className="terms-link">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="terms-link">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
