import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import asyncHandler from "express-async-handler";

// @desc    Create new order (PRACTICUM VERSION - SIMPLIFIED)
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, notes } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name price images stock"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    // Check stock (simplified for practicum)
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Sorry, "${item.product.name}" has only ${item.product.stock} items left`,
        });
      }
    }

    // Prepare order items
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.price,
      image: item.product.images[0] || "/default-product.jpg",
    }));

    // Calculate prices
    const itemsPrice = orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const shippingPrice = itemsPrice > 500 ? 0 : 50; // Free shipping above 500
    const taxPrice = itemsPrice * 0.05; // 5% tax
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    // For Practicum: Always mark as paid/confirmed for smooth demo
    const isPaid = paymentMethod !== "cod"; // Card payments auto-paid
    const orderStatus = "confirmed"; // Auto-confirm for presentation
    
    // Create order
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      payment: {
        method: paymentMethod || "cod",
        status: isPaid ? "paid" : "pending",
      },
      paymentStatus: isPaid ? "paid" : "pending",
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      notes: notes || "",
      orderStatus,
      isPaid,
      paidAt: isPaid ? Date.now() : null,
    });

    // Reduce stock (for practicum demo)
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    const createdOrder = await order.save();

    // Clear cart
    cart.items = [];
    await cart.save();

    // Response for practicum presentation
    let message = "";
    if (paymentMethod === "cod") {
      message = "🎉 COD order placed successfully! You'll pay when the product arrives.";
    } else {
      message = "✅ Payment successful! Your order is confirmed.";
    }

    res.status(201).json({
      success: true,
      data: createdOrder,
      message,
      demoNote: "Practicum Project Demo - Order processed successfully",
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing order",
      demoNote: "This is a demo error for presentation purposes",
    });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("orderItems.product", "name images");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Simple authorization for practicum
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort("-createdAt")
      .populate("orderItems.product", "name image");

    res.json({
      success: true,
      data: orders,
      count: orders.length,
      demoNote: orders.length === 0 
        ? "No orders yet. Try placing an order!" 
        : `Found ${orders.length} orders`
    });
  } catch (error) {
    console.error("Get My Orders Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
    });
  }
});

// @desc    Get all orders (Admin - Simplified for Practicum)
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req, res) => {
  try {
    // Simple admin check for practicum
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const orders = await Order.find({})
      .populate("user", "name email")
      .sort("-createdAt");

    res.json({
      success: true,
      data: orders,
      count: orders.length,
      demoNote: "Admin view - All orders displayed",
    });
  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Update order to paid (Simplified for Practicum)
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // For practicum: simple authorization
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Mark as paid
    order.isPaid = true;
    order.paidAt = Date.now();
    order.payment.status = "paid";
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    
    // Add demo transaction ID
    order.payment.transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const updatedOrder = await order.save();

    res.json({
      success: true,
      data: updatedOrder,
      message: "Order marked as paid",
      demoNote: "Payment simulation for practicum demo",
    });
  } catch (error) {
    console.error("Update Order Paid Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating payment",
    });
  }
});

// @desc    Update order to delivered (Simplified)
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Simple admin check
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    // For COD orders, mark as paid on delivery
    if (order.payment.method === "cod" && !order.isPaid) {
      order.isPaid = true;
      order.payment.status = "paid";
      order.paymentStatus = "paid";
      order.paidAt = Date.now();
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.orderStatus = "delivered";

    const updatedOrder = await order.save();

    res.json({
      success: true,
      data: updatedOrder,
      message: "Order marked as delivered",
    });
  } catch (error) {
    console.error("Update Order Deliver Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating delivery status",
    });
  }
});

// @desc    Cancel order (Simplified)
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check authorization
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Check if order can be cancelled
    if (order.orderStatus === "shipped" || order.orderStatus === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel shipped/delivered orders",
      });
    }

    // Restore stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    order.orderStatus = "cancelled";
    if (order.isPaid) {
      order.payment.status = "refunded";
      order.paymentStatus = "refunded";
    }

    const updatedOrder = await order.save();

    res.json({
      success: true,
      data: updatedOrder,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling order",
    });
  }
});