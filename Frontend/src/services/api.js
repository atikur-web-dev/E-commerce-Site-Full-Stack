import axios from "axios";

// ==================== CONFIGURATION ====================
const API_BASE_URL = "http://localhost:5000/api";
const REQUEST_TIMEOUT = 15000; // 15 seconds

// ==================== AXIOS INSTANCE ====================
const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: REQUEST_TIMEOUT,
  withCredentials: false,
});

// ==================== REQUEST INTERCEPTOR ====================
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==================== RESPONSE INTERCEPTOR ====================
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ==================== API FUNCTIONS ====================

// ✅ CORRECTED Auth API - WITHOUT .then() chains
export const authAPI = {
  // Register - returns full response object
  register: (userData) => API.post("/auth/register", userData),

  // Login - returns full response object
  login: (credentials) => API.post("/auth/login", credentials),

  // Get profile
  getProfile: () => API.get("/auth/profile"),

  // Update profile
  updateProfile: (userData) => API.put("/auth/profile", userData),
};

// ✅ Product API
export const productAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (
        params[key] !== undefined &&
        params[key] !== null &&
        params[key] !== ""
      ) {
        queryParams.append(key, params[key]);
      }
    });
    const queryString = queryParams.toString();
    return API.get(`/products${queryString ? `?${queryString}` : ""}`);
  },

  getFeatured: () => API.get("/products/featured"),
  getByCategory: (category) => API.get(`/products/category/${category}`),
  getById: (id) => API.get(`/products/${id}`),
  search: (query) => API.get(`/products?search=${encodeURIComponent(query)}`),
  create: (productData) => API.post("/products", productData),
  update: (id, productData) => API.put(`/products/${id}`, productData),
  delete: (id) => API.delete(`/products/${id}`),
};

// ✅ Cart API
export const cartAPI = {
  getCart: () => API.get("/cart"),
  addToCart: (productData) => API.post("/cart", productData),
  updateCartItem: (itemId, quantity) =>
    API.put(`/cart/${itemId}`, { quantity }),
  removeFromCart: (itemId) => API.delete(`/cart/${itemId}`),
  clearCart: () => API.delete("/cart"),
};

// ✅ Order API
export const orderAPI = {
  createOrder: (orderData) => API.post("/orders", orderData),
  getMyOrders: () => API.get("/orders/myorders"),
  getOrderById: (id) => API.get(`/orders/${id}`),
  updateToPaid: (id, paymentData) => API.put(`/orders/${id}/pay`, paymentData),
};

// ✅ Test API
export const testAPI = {
  testBackend: () => API.get("/test"),
  healthCheck: () => API.get("/health"),
  corsTest: () => API.get("/cors-test"),
};

// Export default API instance
export default API;
