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

      console.log(" Login attempt:", credentials.email);

      const response = await authAPI.login(credentials);

      console.log(" Login response:", response);

      if (response?.token) {
        const userData = {
          _id: response._id,
          name: response.name,
          email: response.email,
          phone: response.phone || "",
          role: response.role || 'user',
          avatar: response.avatar || "",
          shippingAddress: response.shippingAddress || {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "Bangladesh"
          },
          createdAt: response.createdAt
        };
        
        console.log(" Token received, saving...");
        saveAuthData(response.token, userData);
        console.log(" Login successful!");

        return {
          success: true,
          data: userData,
          message: "Login successful!",
        };
      } else {
        console.error(" No token in response:", response);
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error(" Login error details:", err);

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

      console.log(" Registration attempt:", userData.email);

      const response = await authAPI.register(userData);

      console.log(" Register response:", response);

      if (response?.token) {
        const userObj = {
          _id: response._id,
          name: response.name,
          email: response.email,
          role: response.role || 'user',
          createdAt: response.createdAt
        };
        
        console.log(" Token received, saving...");
        saveAuthData(response.token, userObj);
        console.log(" Registration successful!");

        return {
          success: true,
          data: userObj,
          message: "Registration successful!",
        };
      } else {
        console.error(" No token in response:", response);
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error(" Registration error details:", err);

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
    console.log(" Logging out user");
    clearAuth();
    setTimeout(() => {
      window.location.href = "/login?logout=success";
    }, 100);
  };

  // Simple user update function
  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  // Update Profile with Image Upload
  const updateProfile = async (userData) => {
    try {
      setError("");
      setLoading(true);

      console.log("🔧 Updating profile with:", {
        name: userData.name,
        hasAvatar: !!userData.avatar,
        avatarType: userData.avatar ? (userData.avatar.startsWith('data:') ? 'base64' : 'url') : 'none'
      });

      // Prepare FormData for file upload
      const formData = new FormData();
      formData.append('name', userData.name);
      if (userData.phone) formData.append('phone', userData.phone);
      
      // Append shipping address if exists
      if (userData.shippingAddress) {
        formData.append('shippingAddress[street]', userData.shippingAddress.street || '');
        formData.append('shippingAddress[city]', userData.shippingAddress.city || '');
        formData.append('shippingAddress[state]', userData.shippingAddress.state || '');
        formData.append('shippingAddress[zipCode]', userData.shippingAddress.zipCode || '');
        formData.append('shippingAddress[country]', userData.shippingAddress.country || 'Bangladesh');
      }

      // Handle avatar upload
      if (userData.avatar && userData.avatar.startsWith('data:image')) {
        try {
          // Convert base64 to blob
          const response = await fetch(userData.avatar);
          const blob = await response.blob();
          formData.append('avatar', blob, 'profile-avatar.jpg');
          console.log(" Avatar blob created:", blob.size, "bytes");
        } catch (blobError) {
          console.error(" Error creating blob:", blobError);
          // Fallback: send as base64 string
          formData.append('avatar', userData.avatar);
        }
      }

      // Get token
      const token = localStorage.getItem("token");
      
      // Send request
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // Note: Don't set Content-Type for FormData, browser sets it automatically with boundary
        },
        body: formData
      });

      const data = await response.json();
      console.log(" Profile update response:", data);

      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      if (data.success) {
        // Update local user state
        const updatedUser = { 
          ...user, 
          name: data.user.name,
          phone: data.user.phone || "",
          avatar: data.user.avatar || "",
          shippingAddress: data.user.shippingAddress || {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "Bangladesh"
          }
        };
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        // Update token if new one provided
        if (data.token) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
          API.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        }

        return {
          success: true,
          data: data.user,
          message: data.message || "Profile updated successfully!"
        };
      } else {
        throw new Error(data.message || 'Profile update failed');
      }
    } catch (err) {
      console.error(" Update profile error:", err);
      
      let errorMessage = "Profile update failed. Please try again.";
      
      if (err.message.includes('Session') || err.message.includes('expired')) {
        errorMessage = "Session expired. Please login again.";
        clearAuth();
      } else if (err.message.includes('Image') || err.message.includes('upload')) {
        errorMessage = "Image upload failed. Please try with a smaller image (max 2MB).";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
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
    updateUser,

    // Utility functions
    hasToken,
    getAuthHeader,
    isAdmin,
    isAuthenticated: () => !!user && !!token,

    // Error handling
    clearError: () => setError(""),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;