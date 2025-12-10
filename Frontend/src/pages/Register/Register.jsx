import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
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

  const { register, error: apiError } = useAuth();
  const navigate = useNavigate();

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

    // Clear success message when user starts typing again
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
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
    // Clear previous errors
    setErrors({});

    const userData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    };

    console.log("Registering user:", userData);

    const result = await register(userData);

    setIsSubmitting(false);

    if (result.success) {
      // ✅ SUCCESS
      setSuccessMessage(
        "🎉 Registration successful! Please login with your credentials."
      );

      // Clear form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login", {
          state: {
            registeredEmail: userData.email,
            message: "Registration successful! Please login.",
          },
        });
      }, 3000);
    } else {
      // ✅ ERROR: Show specific error message
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
      <div className="register-card">
        <div className="register-header">
          <h1 className="register-title">Create Account</h1>
          <p className="register-subtitle">Join ShopEasy today</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form" noValidate>
          {/* Success Message */}
          {successMessage && (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <div className="success-text">
                <p>{successMessage}</p>
                <p className="redirect-text">
                  Redirecting to login page in 3 seconds...
                </p>
              </div>
            </div>
          )}

          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? "error" : ""}`}
              placeholder="Enter your full name"
              disabled={isSubmitting || successMessage}
              autoComplete="name"
            />
            {errors.name && (
              <span className="error-message">
                <span className="error-icon">⚠</span> {errors.name}
              </span>
            )}
          </div>

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
              disabled={isSubmitting || successMessage}
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
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? "error" : ""}`}
              placeholder="At least 6 characters"
              disabled={isSubmitting || successMessage}
              autoComplete="new-password"
            />
            {errors.password && (
              <span className="error-message">
                <span className="error-icon">⚠</span> {errors.password}
              </span>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`form-input ${errors.confirmPassword ? "error" : ""}`}
              placeholder="Confirm your password"
              disabled={isSubmitting || successMessage}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <span className="error-message">
                <span className="error-icon">⚠</span> {errors.confirmPassword}
              </span>
            )}
          </div>

          {/* ✅ API Error Display */}
          {errors.api && (
            <div className="api-error-message">
              <span className="error-icon">❌</span>
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
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : successMessage ? (
              "✓ Registration Successful!"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Already have account */}
        <div className="login-redirect">
          <p className="redirect-text">
            Already have an account?{" "}
            <Link to="/login" className="redirect-link">
              Sign in here
            </Link>
          </p>
        </div>

        <div className="register-footer">
          <p className="terms-text">
            By creating an account, you agree to our{" "}
            <a href="/terms" className="terms-link">
              Terms
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

export default Register;
