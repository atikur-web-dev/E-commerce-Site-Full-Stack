import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Import models
import User from "./models/User.js";
import Product from "./models/Product.js";
import Cart from "./models/Cart.js";
import Order from "./models/Order.js";

// Import routes
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/product.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/order.js";
import analyticsRoutes from "./routes/analytics.js"; // ✅ NEW IMPORT

// Load environment variables
dotenv.config();

const app = express();

// ====================== CORS CONFIGURATION ======================
const allowedOrigins = [
  "http://localhost:5173", // Vite default port
  "http://localhost:3000", // Create React App default
  "http://localhost:5000", // Backend itself
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5000",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`CORS blocked: ${origin}`);
      callback(
        new Error(`CORS policy does not allow access from ${origin}`),
        false
      );
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
  ],
  exposedHeaders: ["Authorization", "X-Total-Count"],
  optionsSuccessStatus: 200,
  preflightContinue: false,
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));
// ================================================================

// ====================== MIDDLEWARE ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Powered-By", "ShopEasy Backend");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});
// =======================================================

// Database connection function with timeout
const connectDB = async () => {
  console.log(" Attempting to connect to MongoDB...");

  // Set connection timeout
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(
      () => reject(new Error("MongoDB connection timeout after 10 seconds")),
      10000
    );
  });

  try {
    const connectionPromise = mongoose.connect(
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/shopeasy",
      {
        serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds
        maxPoolSize: 10, // Maximum number of connections
        minPoolSize: 2, // Minimum number of connections
        retryWrites: true,
        w: "majority",
      }
    );

    // Race between connection and timeout
    await Promise.race([connectionPromise, timeoutPromise]);

    console.log(" MongoDB Connected Successfully!");
    console.log(` Database: ${mongoose.connection.name}`);
    console.log(` Host: ${mongoose.connection.host}`);
    console.log(` Port: ${mongoose.connection.port}`);
    console.log(
      ` Connections: ${
        mongoose.connection.readyState === 1 ? "Active" : "Inactive"
      }`
    );

    return true;
  } catch (error) {
    console.error(" MongoDB Connection Failed:", error.message);
    console.log(" Troubleshooting Tips:");
    console.log("1. Check if MongoDB is running:");
    console.log('   Windows: Run "services.msc" and start MongoDB');
    console.log(
      '   Mac/Linux: Run "brew services start mongodb-community" or "sudo service mongod start"'
    );
    console.log("2. Try connecting with: mongosh");
    console.log("3. Or use MongoDB Atlas (cloud)");
    console.log(
      "4. Default connection string: mongodb://127.0.0.1:27017/shopeasy"
    );

    // Don't exit - continue without DB for development
    console.log("  Continuing without database connection...");
    return false;
  }
};

// ====================== API ROUTES ======================
// Authentication Routes
app.use("/api/auth", authRoutes);

// Product Routes
app.use("/api/products", productRoutes);

// Cart Routes
app.use("/api/cart", cartRoutes);

// Order Routes
app.use("/api/orders", orderRoutes);

// Analytics Routes - ✅ NEW ROUTE
app.use("/api/analytics", analyticsRoutes);

// Test Route
app.get("/api/test", (req, res) => {
  res.json({
    message: "API is working!",
    server: "Express.js",
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Not Connected",
    cors: {
      enabled: true,
      allowedOrigins: allowedOrigins,
    },
    data: {
      user: "Test User",
      products: 10,
      timestamp: new Date().toISOString(),
    },
  });
});

// CORS test route
app.get("/api/cors-test", (req, res) => {
  res.json({
    success: true,
    message: "CORS is working!",
    origin: req.headers.origin || "No origin header",
    timestamp: new Date().toISOString(),
    allowedOrigins: allowedOrigins,
  });
});

// Analytics test route - ✅ NEW ROUTE
app.get("/api/analytics/test", (req, res) => {
  res.json({
    message: "Analytics API is working!",
    version: "1.0.0",
    endpoints: {
      dashboard: "GET /api/analytics/dashboard (Admin)",
      inventory: "GET /api/analytics/inventory (Admin)",
    },
    features: [
      "Sales analytics and reporting",
      "Inventory management insights",
      "Category-wise performance",
      "Top selling products",
      "User growth statistics",
    ],
    timestamp: new Date().toISOString(),
  });
});

// Home Route
app.get("/", (req, res) => {
  res.json({
    message: "ShopEasy Backend API is running!",
    version: "3.1.0", // ✅ UPDATED VERSION
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Not Connected",
    frontend: "http://localhost:5173",
    cors: {
      enabled: true,
      allowedOrigins: allowedOrigins,
    },
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        profile: "GET /api/auth/profile (Protected)",
        updateProfile: "PUT /api/auth/profile (Protected)",
      },
      products: {
        getAll: "GET /api/products",
        getFeatured: "GET /api/products/featured",
        getByCategory: "GET /api/products/category/:category",
        getSingle: "GET /api/products/:id",
        create: "POST /api/products (Admin)",
        update: "PUT /api/products/:id (Admin)",
        delete: "DELETE /api/products/:id (Admin)",
      },
      cart: {
        get: "GET /api/cart (Protected)",
        add: "POST /api/cart (Protected)",
        update: "PUT /api/cart/:itemId (Protected)",
        remove: "DELETE /api/cart/:itemId (Protected)",
        clear: "DELETE /api/cart (Protected)",
      },
      orders: {
        create: "POST /api/orders (Protected)",
        myOrders: "GET /api/orders/myorders (Protected)",
        getSingle: "GET /api/orders/:id (Protected)",
        getAll: "GET /api/orders (Admin)",
        pay: "PUT /api/orders/:id/pay (Protected)",
        deliver: "PUT /api/orders/:id/deliver (Admin)",
      },
      analytics: { // ✅ NEW SECTION
        dashboard: "GET /api/analytics/dashboard (Admin)",
        inventory: "GET /api/analytics/inventory (Admin)",
        test: "GET /api/analytics/test",
      },
    },
    documentation: "http://localhost:5000/health",
  });
});

// Health Check Route
app.get("/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMap = {
    0: "Disconnected",
    1: "Connected",
    2: "Connecting",
    3: "Disconnecting",
  };

  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database: statusMap[dbStatus] || "Unknown",
    uptime: process.uptime(),
    server: "Express.js",
    version: "3.1.0", // ✅ UPDATED VERSION
    cors: {
      enabled: true,
      allowedOrigins: allowedOrigins,
      requestOrigin: req.headers.origin || "No origin",
    },
    authentication: "JWT Enabled",
    models: ["User", "Product", "Cart", "Order"],
    routes: [
      "/api/auth",
      "/api/products",
      "/api/cart",
      "/api/orders",
      "/api/analytics", // ✅ NEW ROUTE
    ],
    features: {
      advancedAnalytics: true, // ✅ NEW FEATURE
      realTimeReports: true,
      inventoryTracking: true,
      salesDashboard: true,
    },
  });
});
// ===================================================

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(" Server Error:", err.stack);

  // Handle CORS errors
  if (err.message.includes("CORS")) {
    return res.status(403).json({
      message: "CORS Error: Access from this origin is not allowed",
      error: err.message,
      allowedOrigins: allowedOrigins,
    });
  }

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : {},
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    requestedUrl: req.originalUrl,
    availableEndpoints: [
      "/",
      "/health",
      "/api/test",
      "/api/cors-test",
      "/api/analytics/test", // ✅ NEW ENDPOINT
      "/api/auth/register",
      "/api/auth/login",
      "/api/auth/profile",
      "/api/products",
      "/api/products/featured",
      "/api/cart",
      "/api/orders/myorders",
    ],
    timestamp: new Date().toISOString(),
  });
});

// Server configuration
const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  console.log(" Starting ShopEasy Backend Server...");
  console.log(` Port: ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(` CORS Allowed Origins: ${allowedOrigins.join(", ")}`);

  try {
    // Try to connect to DB but don't fail if it doesn't work
    await connectDB();

    app.listen(PORT, () => {
      console.log(`
       ==============================================
         ShopEasy Backend Server Started Successfully!
       ==============================================
       Port: ${PORT}
       Environment: ${process.env.NODE_ENV || "development"}
       Database Status: ${
         mongoose.connection.readyState === 1
           ? " Connected "
           : " Not Connected "
       }
       Frontend URL: http://localhost:5173
       Health Check: http://localhost:${PORT}/health
       CORS Test: http://localhost:${PORT}/api/cors-test
       Analytics Test: http://localhost:${PORT}/api/analytics/test
       
        Auth Routes: 
         • Register: POST http://localhost:${PORT}/api/auth/register
         • Login: POST http://localhost:${PORT}/api/auth/login
         • Profile: GET http://localhost:${PORT}/api/auth/profile
       
        Product Routes:
         • All Products: GET http://localhost:${PORT}/api/products
         • Featured: GET http://localhost:${PORT}/api/products/featured
         • By Category: GET http://localhost:${PORT}/api/products/category/:category
       
        Cart Routes:
         • Get Cart: GET http://localhost:${PORT}/api/cart
         • Add to Cart: POST http://localhost:${PORT}/api/cart
         • Clear Cart: DELETE http://localhost:${PORT}/api/cart
       
        Order Routes:
         • Create Order: POST http://localhost:${PORT}/api/orders
         • My Orders: GET http://localhost:${PORT}/api/orders/myorders
       
        Analytics Routes: - ✅ NEW
         • Dashboard: GET http://localhost:${PORT}/api/analytics/dashboard (Admin)
         • Inventory: GET http://localhost:${PORT}/api/analytics/inventory (Admin)
       
        Main Route: http://localhost:${PORT}/
       ==============================================
      `);
    });
  } catch (error) {
    console.error(" Failed to start server:", error.message);

    // Even if DB fails, start the server for API testing
    app.listen(PORT, () => {
      console.log(`  Server started without database on port ${PORT}`);
      console.log(` API available at http://localhost:${PORT}`);
      console.log(` CORS configured for: ${allowedOrigins.join(", ")}`);
    });
  }
};

// Start the server
startServer().catch((error) => {
  console.error(" Fatal Error:", error);
  process.exit(1);
});