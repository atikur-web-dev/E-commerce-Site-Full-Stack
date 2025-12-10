import axios from "axios";

// Base URL setup - Backend server er address
const API = axios.create({
  baseURL: "http://localhost:5000/api", // Backend port 5000 e cholbe
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// ==================== REQUEST INTERCEPTOR ====================
// Every request er age token add korbe automatically
API.interceptors.request.use(
  (config) => {
    console.log("Making request to:", config.url);

    // Get token from localStorage
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// ==================== RESPONSE INTERCEPTOR ====================
// Every response handle korbe
API.interceptors.response.use(
  (response) => {
    console.log("Response from:", response.config.url, response.status);
    return response.data; // Direct data return korbe
  },
  (error) => {
    console.error("API Error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });

    // Handle specific errors
    if (error.response?.status === 401) {
      // Unauthorized - token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return Promise.reject(new Error("Session expired. Please login again."));
    }

    if (error.response?.status === 404) {
      return Promise.reject(new Error("Resource not found"));
    }

    if (error.code === "ECONNABORTED") {
      return Promise.reject(
        new Error("Request timeout. Please check your connection.")
      );
    }

    if (!error.response) {
      // Network error
      return Promise.reject(
        new Error("Network error. Please check your internet connection.")
      );
    }

    // Default error message
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Something went wrong!";

    return Promise.reject(new Error(message));
  }
);

// ==================== AUTH SERVICES ====================
export const authAPI = {
  // User registration
  register: async (userData) => {
    try {
      const response = await API.post("/auth/register", userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // User login
  login: async (credentials) => {
    try {
      const response = await API.post("/auth/login", credentials);

      // Save token and user data
      if (response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await API.get("/auth/profile");
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update profile
  updateProfile: async (data) => {
    try {
      const response = await API.put("/auth/profile", data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },
};

// ==================== PRODUCT SERVICES ====================
export const productAPI = {
  // Get all products
  getAllProducts: async () => {
    try {
      const response = await API.get("/products");
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get single product
  getProduct: async (id) => {
    try {
      const response = await API.get(`/products/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Search products
  searchProducts: async (query) => {
    try {
      const response = await API.get(`/products?search=${query}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get by category
  getProductsByCategory: async (category) => {
    try {
      const response = await API.get(`/products/category/${category}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get featured products
  getFeaturedProducts: async () => {
    try {
      const response = await API.get("/products/featured");
      return response;
    } catch (error) {
      throw error;
    }
  },
};

// ==================== CART SERVICES ====================
export const cartAPI = {
  // Get user's cart
  getCart: async () => {
    try {
      const response = await API.get("/cart");
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Add item to cart
  addToCart: async (productId, quantity = 1) => {
    try {
      const response = await API.post("/cart", { productId, quantity });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update cart item quantity
  updateCartItem: async (itemId, quantity) => {
    try {
      const response = await API.put(`/cart/${itemId}`, { quantity });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Remove item from cart
  removeFromCart: async (itemId) => {
    try {
      const response = await API.delete(`/cart/${itemId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Clear entire cart
  clearCart: async () => {
    try {
      const response = await API.delete("/cart");
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get cart count
  getCartCount: async () => {
    try {
      const response = await API.get("/cart");
      return response.data?.items?.length || 0;
    } catch (error) {
      return 0;
    }
  },
};

// ==================== ORDER SERVICES ====================
export const orderAPI = {
  // Create order
  createOrder: async (orderData) => {
    try {
      const response = await API.post("/orders", orderData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get all orders
  getOrders: async () => {
    try {
      const response = await API.get("/orders");
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get single order
  getOrder: async (orderId) => {
    try {
      const response = await API.get(`/orders/${orderId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    try {
      const response = await API.put(`/orders/${orderId}/cancel`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get order status
  getOrderStatus: async (orderId) => {
    try {
      const response = await API.get(`/orders/${orderId}/status`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

// ==================== EXPORT DEFAULT ====================
export default API;
