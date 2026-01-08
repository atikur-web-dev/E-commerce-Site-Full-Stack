// Backend/routes/user.js - COMPLETE FIXED VERSION
import express from "express";
import User from "../models/User.js";
import Order from "../models/Order.js";
import { protect, admin } from "../middleware/auth.js";
import asyncHandler from "express-async-handler";

const router = express.Router();

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get("/", protect, admin, asyncHandler(async (req, res) => {
  try {
    console.log("Fetching all users for admin...");
    
    const users = await User.find({})
      .select("-password -resetPasswordToken -resetPasswordExpire")
      .sort({ createdAt: -1 });
    
    console.log(`Found ${users.length} users`);
    
    // Get order statistics for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const userOrders = await Order.find({ user: user._id });
        
        const totalOrders = userOrders.length;
        const totalSpent = userOrders.reduce((sum, order) => sum + order.totalPrice, 0);
        const lastOrder = userOrders.length > 0 
          ? userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
          : null;
        
        return {
          _id: user._id,
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.isActive ? "active" : "inactive",
          phone: user.phone || "Not provided",
          avatar: user.avatar || "",
          shippingAddress: user.shippingAddress || {},
          isActive: user.isActive,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin || user.createdAt,
          orders: totalOrders,
          totalSpent: totalSpent,
          lastOrderDate: lastOrder ? lastOrder.createdAt : null,
          lastOrderAmount: lastOrder ? lastOrder.totalPrice : 0,
          avatarColor: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"][
            Math.floor(Math.random() * 5)
          ]
        };
      })
    );
    
    res.json({
      success: true,
      count: usersWithStats.length,
      data: usersWithStats,
      message: "Users fetched successfully"
    });
    
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
}));

// @desc    Get user by ID with detailed statistics
// @route   GET /api/users/:id
// @access  Private/Admin
router.get("/:id", protect, admin, asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -resetPasswordToken -resetPasswordExpire");
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    // Get user orders with details
    const userOrders = await Order.find({ user: user._id })
      .populate('orderItems.product', 'name images price')
      .sort({ createdAt: -1 });
    
    // Calculate statistics
    const totalOrders = userOrders.length;
    const totalSpent = userOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    const pendingOrders = userOrders.filter(order => 
      ['pending', 'confirmed', 'processing'].includes(order.orderStatus)
    ).length;
    
    // Get recent orders (last 5)
    const recentOrders = userOrders.slice(0, 5).map(order => ({
      _id: order._id,
      orderId: `ORD-${order._id.toString().slice(-8).toUpperCase()}`,
      date: order.createdAt,
      amount: order.totalPrice,
      status: order.orderStatus,
      paymentMethod: order.payment?.method || 'cod',
      items: order.orderItems.length
    }));
    
    // Payment methods used
    const paymentMethods = userOrders.reduce((methods, order) => {
      const method = order.payment?.method || 'cod';
      methods[method] = (methods[method] || 0) + 1;
      return methods;
    }, {});
    
    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          shippingAddress: user.shippingAddress,
          isActive: user.isActive,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
          accountAge: Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))
        },
        statistics: {
          totalOrders,
          totalSpent,
          avgOrderValue,
          pendingOrders,
          completedOrders: userOrders.filter(o => o.orderStatus === 'delivered').length,
          cancelledOrders: userOrders.filter(o => o.orderStatus === 'cancelled').length
        },
        recentOrders,
        paymentMethods,
        allOrders: userOrders.length > 0 ? userOrders.slice(0, 20) : []
      }
    });
    
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
}));

// @desc    Update user (role, status, etc.)
// @route   PUT /api/users/:id
// @access  Private/Admin
router.put("/:id", protect, admin, asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    // Prevent self-modification for certain fields
    const isSelf = user._id.toString() === req.user._id.toString();
    
    // Update fields
    if (req.body.role && !isSelf) user.role = req.body.role;
    if (req.body.isActive !== undefined && !isSelf) user.isActive = req.body.isActive;
    if (req.body.name) user.name = req.body.name;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.avatar) user.avatar = req.body.avatar;
    
    // Update shipping address
    if (req.body.shippingAddress) {
      user.shippingAddress = {
        ...user.shippingAddress,
        ...req.body.shippingAddress
      };
    }
    
    await user.save();
    
    // Return user without sensitive data
    const userResponse = await User.findById(user._id)
      .select("-password -resetPasswordToken -resetPasswordExpire");
    
    res.json({
      success: true,
      message: "User updated successfully",
      data: userResponse
    });
    
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
}));

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete("/:id", protect, admin, asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    // Check if user is trying to delete themselves
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
        message: `Cannot delete user with ${userOrders} orders. Deactivate instead.`
      });
    }
    
    await user.deleteOne();
    
    res.json({
      success: true,
      message: "User deleted successfully"
    });
    
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
}));

// @desc    Get user statistics for admin dashboard
// @route   GET /api/users/stats/summary
// @access  Private/Admin
router.get("/stats/summary", protect, admin, asyncHandler(async (req, res) => {
  try {
    // Total users count
    const totalUsers = await User.countDocuments();
    
    // Active users count
    const activeUsers = await User.countDocuments({ isActive: true });
    
    // Admin users count
    const adminUsers = await User.countDocuments({ role: 'admin' });
    
    // New users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    
    // Users with orders
    const usersWithOrders = await Order.distinct('user');
    const usersWithOrdersCount = usersWithOrders.length;
    
    // Top spending users
    const topSpendingUsers = await Order.aggregate([
      {
        $group: {
          _id: "$user",
          totalSpent: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 }
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
      { $unwind: "$userDetails" },
      {
        $project: {
          userId: "$_id",
          name: "$userDetails.name",
          email: "$userDetails.email",
          totalSpent: 1,
          orderCount: 1
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        adminUsers,
        newUsers,
        usersWithOrdersCount,
        usersWithoutOrders: totalUsers - usersWithOrdersCount,
        topSpendingUsers
      }
    });
    
  } catch (error) {
    console.error("User stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user statistics",
      error: error.message
    });
  }
}));

export default router;