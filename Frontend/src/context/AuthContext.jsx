import React, { createContext, useState, useContext, useEffect } from "react";
import API, { authAPI } from "../services/api";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Error parsing user:", error);
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null
  );

  // ==================== HELPER FUNCTIONS ====================
  const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete API.defaults.headers.common["Authorization"];
    setUser(null);
    setToken(null);
    setError("");
  };

  const saveAuthData = (newToken, userData) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
    API.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    setUser(userData);
    setToken(newToken);
  };

  // ==================== USE EFFECT ====================
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (savedToken && savedUser) {
        try {
          API.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
          const userData = await authAPI.getProfile();

          if (userData) {
            setUser(userData);
            setToken(savedToken);
            localStorage.setItem("user", JSON.stringify(userData));
          } else {
            clearAuth();
          }
        } catch (err) {
          console.error("Session verification failed:", err.message);
          clearAuth();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // ==================== AUTH FUNCTIONS ====================
  const login = async (credentials) => {
    try {
      setError("");
      setLoading(true);

      console.log("🔐 Login attempt:", credentials.email);

      // Call API - returns direct data (not response.data)
      const response = await authAPI.login(credentials);

      console.log("📥 Login response:", response);

      if (response?.token) {
        const userData = response.user || response;
        console.log("✅ Token received, saving...");
        saveAuthData(response.token, userData);
        console.log("✅ Login successful!");

        return {
          success: true,
          data: userData,
          message: "Login successful!",
        };
      } else {
        console.error("❌ No token in response:", response);
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("❌ Login error details:", err);

      let errorMessage = "Login failed. Please try again.";

      if (err.message.includes("Invalid") || err.message.includes("invalid")) {
        errorMessage = "Invalid email or password";
      } else if (err.message.includes("User not found")) {
        errorMessage = "No account found with this email";
      } else if (err.message.includes("Network")) {
        errorMessage =
          "Cannot connect to server. Check your internet connection.";
      } else {
        errorMessage = err.message;
      }

      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError("");
      setLoading(true);

      console.log("👤 Registration attempt:", userData.email);

      // Call API - returns direct data
      const response = await authAPI.register(userData);

      console.log("📥 Register response:", response);

      if (response?.token) {
        const userObj = response.user || response;
        console.log("✅ Token received, saving...");
        saveAuthData(response.token, userObj);
        console.log("✅ Registration successful!");

        return {
          success: true,
          data: userObj,
          message: "Registration successful!",
        };
      } else {
        console.error("❌ No token in response:", response);
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("❌ Registration error details:", err);

      let errorMessage = "Registration failed. Please try again.";

      if (
        err.message.includes("already exists") ||
        err.message.includes("duplicate")
      ) {
        errorMessage = "User already exists with this email";
      } else if (
        err.message.includes("Password") &&
        err.message.includes("6")
      ) {
        errorMessage = "Password must be at least 6 characters";
      } else if (err.message.includes("Network")) {
        errorMessage =
          "Cannot connect to server. Check your internet connection.";
      } else if (
        err.message.includes("Email") &&
        err.message.includes("invalid")
      ) {
        errorMessage = "Please enter a valid email address";
      } else {
        errorMessage = err.message;
      }

      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log("👋 Logging out user");
    clearAuth();
    setTimeout(() => {
      window.location.href = "/login?logout=success";
    }, 100);
  };

  const updateProfile = async (userData) => {
    try {
      setError("");
      setLoading(true);

      const response = await authAPI.updateProfile(userData);

      if (response) {
        const updatedUser = { ...user, ...response };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);

        if (response.token) {
          saveAuthData(response.token, updatedUser);
        }

        return {
          success: true,
          data: response,
          message: "Profile updated successfully!",
        };
      }
    } catch (err) {
      let errorMessage = "Profile update failed";
      if (err.message.includes("Session expired")) {
        errorMessage = "Session expired. Please login again.";
        clearAuth();
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getProfile = async () => {
    try {
      setLoading(true);

      const userData = await authAPI.getProfile();

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      return { success: true, data: userData };
    } catch (err) {
      console.error("Get profile error:", err);
      if (
        err.message.includes("Session expired") ||
        err.message.includes("Unauthorized")
      ) {
        clearAuth();
        return { success: false, error: "Session expired" };
      }
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const syncUserProfile = async () => await getProfile();

  // ==================== UTILITY FUNCTIONS ====================
  const hasToken = () => !!token;
  const getAuthHeader = () =>
    token ? { Authorization: `Bearer ${token}` } : {};
  const isAdmin = () => user?.role === "admin";

  // ==================== CONTEXT VALUE ====================
  const value = {
    // State
    user,
    loading,
    error,
    token,

    // Auth functions
    login,
    register,
    logout,
    updateProfile,
    getProfile,
    syncUserProfile,

    // Utility functions
    hasToken,
    getAuthHeader,
    isAdmin,
    isAuthenticated: () => !!user && !!token, // ✅ CHANGED TO FUNCTION

    // Error handling
    clearError: () => setError(""),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
