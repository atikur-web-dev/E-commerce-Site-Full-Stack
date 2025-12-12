// Backend/controllers/analyticsController.js - নতুন ফাইল তৈরি
import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

// @desc    Get sales analytics dashboard data
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
export const getDashboardAnalytics = asyncHandler(async (req, res) => {
  try {
    // 1. Sales Summary
    const salesSummary = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" },
          avgOrderValue: { $avg: "$totalPrice" },
          completedOrders: {
            $sum: { $cond: [{ $eq: ["$orderStatus", "Delivered"] }, 1, 0] }
          }
        }
      }
    ]);

    // 2. Recent Orders (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentOrders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          dailyOrders: { $sum: 1 },
          dailyRevenue: { $sum: "$totalPrice" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 3. Top Selling Products
    const topProducts = await Order.aggregate([
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          productName: { $first: "$orderItems.name" },
          totalSold: { $sum: "$orderItems.quantity" },
          totalRevenue: { $sum: { $multiply: ["$orderItems.quantity", "$orderItems.price"] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    // 4. Category-wise Sales
    const categorySales = await Order.aggregate([
      { $unwind: "$orderItems" },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.product",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.category",
          categoryName: { $first: "$productDetails.category" },
          totalItemsSold: { $sum: "$orderItems.quantity" },
          categoryRevenue: { $sum: { $multiply: ["$orderItems.quantity", "$orderItems.price"] } }
        }
      },
      { $sort: { categoryRevenue: -1 } }
    ]);

    // 5. User Statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] } },
          // Last 30 days signups
          recentSignups: {
            $sum: {
              $cond: [{
                $gte: ["$createdAt", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)]
              }, 1, 0]
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        salesSummary: salesSummary[0] || {},
        recentOrders,
        topProducts,
        categorySales,
        userStats: userStats[0] || {},
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard analytics",
      error: error.message
    });
  }
});

// @desc    Get inventory analytics
// @route   GET /api/analytics/inventory
// @access  Private/Admin
export const getInventoryAnalytics = asyncHandler(async (req, res) => {
  try {
    const inventoryStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStockValue: { $sum: { $multiply: ["$price", "$stock"] } },
          averageStock: { $avg: "$stock" },
          lowStockItems: {
            $sum: { $cond: [{ $and: [{ $gt: ["$stock", 0] }, { $lte: ["$stock", 10] }] }, 1, 0] }
          },
          outOfStockItems: {
            $sum: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] }
          },
          inStockItems: {
            $sum: { $cond: [{ $gt: ["$stock", 10] }, 1, 0] }
          }
        }
      }
    ]);

    // Products need restocking (stock < 5)
    const needRestocking = await Product.find({ stock: { $lt: 5 } })
      .select("name stock price category")
      .sort({ stock: 1 })
      .limit(20);

    // Best selling products (based on sales in orders)
    const bestSellers = await Order.aggregate([
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          productName: { $first: "$orderItems.name" },
          totalSold: { $sum: "$orderItems.quantity" },
          currentStock: { $first: "$orderItems.stock" }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $unwind: "$productInfo" },
      {
        $addFields: {
          stockAfterSales: { $subtract: ["$productInfo.stock", "$totalSold"] }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        inventorySummary: inventoryStats[0] || {},
        needRestocking,
        bestSellers,
        reportGenerated: new Date()
      }
    });
  } catch (error) {
    console.error("Inventory analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching inventory analytics",
      error: error.message
    });
  }
});