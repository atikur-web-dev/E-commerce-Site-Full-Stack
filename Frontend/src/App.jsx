// Frontend/src/App.jsx 
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProductProvider } from "./context/ProductContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";

// Import Pages
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Shop from "./pages/Shop/Shop";
import Cart from "./pages/Cart/Cart";
import ProductDetail from "./pages/ProductDetail/ProductDetail";
import Checkout from "./pages/Checkout/CheckoutPage";
import Orders from "./pages/Orders/Orders";
import OrderDetail from "./pages/OrderDetail/OrderDetail";
import Profile from "./pages/Profile/Profile";

// Import Admin Pages
import AdminDashboard from "./pages/Admin/Dashboard/AdminDashboard";
import AdminProducts from "./pages/Admin/Products/AdminProducts";
import AdminOrders from "./pages/Admin/Orders/AdminOrders";
import AdminAnalytics from "./pages/Admin/Analytics/AdminAnalytics";
import AdminSettings from "./pages/Admin/Settings/AdminSettings";
import ProductAddEdit from "./pages/Admin/ProductAddEdit/ProductAddEdit";
import OrderDetails from "./pages/Admin/OrderDetails/OrderDetails";

// IMPORT THESE FILES 
import AdminUsers from "./pages/Admin/Users/AdminUsers";
import UserDetails from "./pages/Admin/UserDetails/UserDetails";

import "./App.css";
import Header from "./components/common/Header/Header";
import Footer from "./components/common/Footer/Footer";

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <ProductProvider>
            <CartProvider>
              <div className="app">
                <Header />
                <main className="main-content">
                  <Routes>
                    {/* ========== PUBLIC ROUTES ========== */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />

                    {/* ========== PROTECTED ROUTES ========== */}
                    <Route
                      path="/checkout"
                      element={
                        <ProtectedRoute>
                          <Checkout />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/orders"
                      element={
                        <ProtectedRoute>
                          <Orders />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/order/:id"
                      element={
                        <ProtectedRoute>
                          <OrderDetail />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />

                    {/* ========== ADMIN ROUTES ========== */}
                    <Route
                      path="/admin/dashboard"
                      element={
                        <ProtectedRoute requireAdmin={true}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/admin/products"
                      element={
                        <ProtectedRoute requireAdmin={true}>
                          <AdminProducts />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/products/add"
                      element={
                        <ProtectedRoute requireAdmin={true}>
                          <ProductAddEdit />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/products/edit/:id"
                      element={
                        <ProtectedRoute requireAdmin={true}>
                          <ProductAddEdit />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/admin/orders"
                      element={
                        <ProtectedRoute requireAdmin={true}>
                          <AdminOrders />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/orders/:id"
                      element={
                        <ProtectedRoute requireAdmin={true}>
                          <OrderDetails />
                        </ProtectedRoute>
                      }
                    />

                    {/* ========== USERS MANAGEMENT ROUTES ========== */}
                    <Route
                      path="/admin/users"
                      element={
                        <ProtectedRoute requireAdmin={true}>
                          <AdminUsers />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/users/:id"
                      element={
                        <ProtectedRoute requireAdmin={true}>
                          <UserDetails />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/admin/analytics"
                      element={
                        <ProtectedRoute requireAdmin={true}>
                          <AdminAnalytics />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/admin/settings"
                      element={
                        <ProtectedRoute requireAdmin={true}>
                          <AdminSettings />
                        </ProtectedRoute>
                      }
                    />

                    {/* ========== 404 PAGE ========== */}
                    <Route
                      path="*"
                      element={
                        <div style={{ padding: "50px", textAlign: "center" }}>
                          <h1>404 - Page Not Found</h1>
                          <p>The page you're looking for doesn't exist.</p>
                          <div style={{ marginTop: "20px" }}>
                            <a
                              href="/"
                              style={{
                                color: "#3b82f6",
                                textDecoration: "none",
                              }}
                            >
                              ← Go back to Home
                            </a>
                          </div>
                        </div>
                      }
                    />
                  </Routes>
                </main>
                <Footer />
              </div>
            </CartProvider>
          </ProductProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
