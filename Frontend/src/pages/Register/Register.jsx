// Frontend/src/pages/Register/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaUserPlus,
  FaShieldAlt,
  FaEye,
  FaEyeSlash,
  FaCheck,
} from "react-icons/fa";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, error: apiError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
    setSuccessMessage("");
    setErrors({});

    const userData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    };

    const result = await register(userData);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage(
        "Registration successful! Please login with your credentials.",
      );
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login", {
          state: {
            registeredEmail: userData.email,
            message: "Registration successful! Please login.",
          },
        });
      }, 3000);
    } else {
      if (result.error.includes("already exists")) {
        setErrors({
          email:
            "This email is already registered. Please use a different email or try logging in.",
        });
      } else if (result.error.includes("Password")) {
        setErrors({
          password: result.error,
        });
      } else {
        setErrors({ api: result.error });
      }
    }
  };

  return (
    <div className="register-container">
      {/* Professional Background Image with Overlay */}
      <div className="register-background">
        <div className="background-overlay"></div>
        <div className="background-pattern"></div>
      </div>

      {/* Animated Gradient Orbs */}
      <div className="gradient-orb orb-1"></div>
      <div className="gradient-orb orb-2"></div>
      <div className="gradient-orb orb-3"></div>

      <div className="register-card">
        <div className="register-header">
          <div className="header-icon-wrapper">
            <div className="header-icon">
              <FaUserPlus className="icon-pulse" />
            </div>
          </div>
          <h1 className="register-title">Create Account</h1>
          <p className="register-subtitle">
            Join us and start your journey today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="register-form" noValidate>
          {successMessage && (
            <div className="success-message">
              <div className="success-icon-wrapper">
                <FaCheckCircle className="success-icon" />
              </div>
              <div className="success-text">
                <p className="success-title">{successMessage}</p>
                <p className="redirect-text">
                  Redirecting to login page in 3 seconds...
                </p>
              </div>
            </div>
          )}

          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              <FaUser className="label-icon" />
              <span> Full Name</span>
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-input ${errors.name ? "error" : ""}`}
                placeholder="Your Name"
                disabled={isSubmitting || successMessage}
                autoComplete="name"
              />
              {formData.name && !errors.name && (
                <FaCheckCircle className="input-success-icon" />
              )}
            </div>
            {errors.name && (
              <span className="error-message">
                <FaExclamationCircle className="error-icon" />
                <span>{errors.name}</span>
              </span>
            )}
          </div>

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
                disabled={isSubmitting || successMessage}
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
            <label htmlFor="password" className="form-label">
              <FaLock className="label-icon" />
              <span> Password</span>
            </label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? "error" : ""}`}
                placeholder=""
                disabled={isSubmitting || successMessage}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting || successMessage}
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

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              <FaCheck className="label-icon" />
              <span> Confirm Password</span>
            </label>
            <div className="input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-input ${errors.confirmPassword ? "error" : ""}`}
                placeholder=""
                disabled={isSubmitting || successMessage}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isSubmitting || successMessage}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="error-message">
                <FaExclamationCircle className="error-icon" />
                <span>{errors.confirmPassword}</span>
              </span>
            )}
          </div>

          {errors.api && (
            <div className="api-error-message">
              <FaExclamationCircle className="api-error-icon" />
              <span className="error-text">{errors.api}</span>
            </div>
          )}

          {/* Terms & Conditions */}
          <div className="terms-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                required
                className="checkbox-input"
                disabled={isSubmitting || successMessage}
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-text">
                I agree to the{" "}
                <a href="/terms" className="terms-link">
                  Terms & Conditions
                </a>{" "}
                and{" "}
                <a href="/privacy" className="terms-link">
                  Privacy Policy
                </a>
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting || successMessage}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="spinner-icon" />
                <span>Creating Account...</span>
              </>
            ) : successMessage ? (
              <>
                <FaCheckCircle />
                <span>Registration Successful!</span>
              </>
            ) : (
              <>
                <FaUserPlus />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        <div className="login-redirect">
          <p className="redirect-text">
            Already have an account?{" "}
            <Link to="/login" className="redirect-link">
              Sign in here
            </Link>
          </p>
        </div>

        <div className="register-footer">
          <div className="security-badge">
            <FaShieldAlt className="shield-icon" />
            <span>Your data is protected with enterprise-grade security</span>
          </div>
          <p className="terms-text">
            By creating an account, you agree to our Terms of Service and
            Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
