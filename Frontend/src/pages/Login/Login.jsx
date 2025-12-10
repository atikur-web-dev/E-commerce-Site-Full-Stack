import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
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
    });

    setIsSubmitting(false);

    if (result.success) {
      // Remember me functionality
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }

      navigate(from, { replace: true });
    } else {
      // Show API error in form
      setErrors({
        api: result.error || "Login failed. Please try again.",
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to your ShopEasy account</p>
        </div>

        {/* Registration Success Message */}
        {registrationSuccess && (
          <div className="registration-success">
            <div className="success-icon">✓</div>
            <div className="success-text">
              <p>{registrationSuccess}</p>
              <p>Please login with your credentials below.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? "error" : ""}`}
              placeholder="Enter your email"
              disabled={isSubmitting}
              autoComplete="email"
            />
            {errors.email && (
              <span className="error-message">
                <span className="error-icon">⚠</span> {errors.email}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <div className="password-label-row">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? "error" : ""}`}
              placeholder="Enter your password"
              disabled={isSubmitting}
              autoComplete="current-password"
            />
            {errors.password && (
              <span className="error-message">
                <span className="error-icon">⚠</span> {errors.password}
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
              <span className="checkbox-text">Remember me</span>
            </label>
          </div>

          {/* ✅ API Error Display */}
          {errors.api && (
            <div className="api-error-message">
              <span className="error-icon">❌</span>
              <span className="error-text">{errors.api}</span>
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              "Sign In"
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
      </div>
    </div>
  );
};

export default Login;
