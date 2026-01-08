// Backend/controllers/adminController.js - COMPLETE VERSION
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
export const getAdminStats = asyncHandler(async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    // Get total revenue (sum of all delivered orders)
    const revenueResult = await Order.aggregate([
      {
        $match: {
          orderStatus: "delivered",
          isPaid: true
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" }
        }
      }
    ]);
    
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    
    // Get recent orders (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    // Get low stock products (stock < 5)
    const lowStockProducts = await Product.countDocuments({
      stock: { $lt: 5, $gt: 0 }
    });
    
    // Get out of stock products
    const outOfStockProducts = await Product.countDocuments({
      stock: 0
    });
    
    // Get recent users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Get order status breakdown
    const orderStatusBreakdown = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          orderStatus: "delivered",
          isPaid: true
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 6 }
    ]);
    
    // Get top selling products
    const topProducts = await Order.aggregate([
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.product",
          name: { $first: "$orderItems.name" },
          totalSold: { $sum: "$orderItems.quantity" },
          revenue: { $sum: { $multiply: ["$orderItems.quantity", "$orderItems.price"] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);
    
    // Get user growth
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 }
    ]);
    
    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue,
          recentOrders,
          recentUsers,
          lowStockProducts,
          outOfStockProducts
        },
        orderStatusBreakdown,
        monthlyRevenue,
        topProducts,
        userGrowth,
        lastUpdated: new Date()
      }
    });
    
  } catch (error) {
    console.error("Admin dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching admin dashboard stats",
      error: error.message
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUserStats = asyncHandler(async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort({ createdAt: -1 });
    
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    
    // User growth (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    // User with most orders
    const topUsers = await Order.aggregate([
      {
        $group: {
          _id: "$user",
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$totalPrice" }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      { $unwind: "$userDetails" }
    ]);
    
    res.json({
      success: true,
      data: {
        users,
        stats: {
          totalUsers,
          activeUsers,
          adminUsers,
          newUsersThisWeek,
          topUsers
        }
      }
    });
    
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user statistics",
      error: error.message
    });
  }
});

// @desc    Get sales statistics
// @route   GET /api/admin/sales-report
// @access  Private/Admin
export const getSalesStats = asyncHandler(async (req, res) => {
  try {
    // Today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todaySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow },
          isPaid: true
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 }
        }
      }
    ]);
    
    // This week's sales
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: weekAgo },
          isPaid: true
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          dailySales: { $sum: "$totalPrice" },
          dailyOrders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // This month's sales
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    
    const monthlySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: monthAgo },
          isPaid: true
        }
      },
      {
        $group: {
          _id: { $week: "$createdAt" },
          weeklySales: { $sum: "$totalPrice" },
          weeklyOrders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Payment method breakdown
    const paymentBreakdown = await Order.aggregate([
      {
        $group: {
          _id: "$payment.method",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalPrice" }
        }
      }
    ]);
    
    // Top customers
    const topCustomers = await Order.aggregate([
      {
        $match: { isPaid: true }
      },
      {
        $group: {
          _id: "$user",
          totalSpent: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      { $unwind: "$userDetails" }
    ]);
    
    res.json({
      success: true,
      data: {
        today: todaySales[0] || { totalSales: 0, orderCount: 0 },
        weekly: weeklySales,
        monthly: monthlySales,
        paymentBreakdown,
        topCustomers
      }
    });
    
  } catch (error) {
    console.error("Sales stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sales statistics",
      error: error.message
    });
  }
});

// @desc    Get product statistics
// @route   GET /api/admin/product-stats
// @access  Private/Admin
export const getProductStats = asyncHandler(async (req, res) => {
  try {
    // Product counts by category
    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalStock: { $sum: "$stock" },
          avgPrice: { $avg: "$price" }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Stock status
    const stockStatus = await Product.aggregate([
      {
        $facet: {
          inStock: [
            { $match: { stock: { $gt: 10 } } },
            { $count: "count" }
          ],
          lowStock: [
            { $match: { stock: { $gt: 0, $lte: 10 } } },
            { $count: "count" }
          ],
          outOfStock: [
            { $match: { stock: 0 } },
            { $count: "count" }
          ]
        }
      }
    ]);
    
    // Top viewed products (if you have view count field)
    const topViewed = await Product.find()
      .sort({ views: -1 })
      .limit(10)
      .select('name views price stock');
    
    // Recently added products
    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name price stock category createdAt');
    
    // Price range distribution
    const priceDistribution = await Product.aggregate([
      {
        $bucket: {
          groupBy: "$price",
          boundaries: [0, 500, 1000, 2000, 5000, 10000],
          default: "Other",
          output: {
            count: { $sum: 1 },
            minPrice: { $min: "$price" },
            maxPrice: { $max: "$price" },
            avgStock: { $avg: "$stock" }
          }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        categoryStats,
        stockStatus: stockStatus[0],
        topViewed,
        recentProducts,
        priceDistribution
      }
    });
    
  } catch (error) {
    console.error("Product stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product statistics",
      error: error.message
    });
  }
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = asyncHandler(async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!role || !['admin', 'user'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'admin' or 'user'"
      });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Cannot change own role
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role"
      });
    }
    
    user.role = role;
    await user.save();
    
    res.json({
      success: true,
      message: `User role updated to ${role}`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user role",
      error: error.message
    });
  }
});

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
export const updateUserStatus = asyncHandler(async (req, res) => {
  try {
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean"
      });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Cannot deactivate yourself
    if (user._id.toString() === req.user._id.toString() && !isActive) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account"
      });
    }
    
    user.isActive = isActive;
    await user.save();
    
    res.json({
      success: true,
      message: `User status updated to ${isActive ? 'active' : 'inactive'}`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
    
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user status",
      error: error.message
    });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Cannot delete yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account"
      });
    }
    
    // Check if user has orders
    const userOrders = await Order.countDocuments({ user: user._id });
    
    if (userOrders > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete user with ${userOrders} orders. Delete orders first or deactivate the user.`
      });
    }
    
    await user.deleteOne();
    
    res.json({
      success: true,
      message: "User deleted successfully",
      deletedUserId: user._id
    });
    
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message
    });
  }
});