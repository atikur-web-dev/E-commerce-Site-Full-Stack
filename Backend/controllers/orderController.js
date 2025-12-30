import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import asyncHandler from "express-async-handler";

// @desc    Create new order (PRACTICUM VERSION - SIMPLIFIED)
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  try {
    console.log("===  ORDER CREATE REQUEST STARTED ===");
    console.log("User ID:", req.user?._id);
    console.log("Payment Method from request:", req.body?.paymentMethod);
    
    const { shippingAddress, paymentMethod, notes } = req.body;

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.phone) {
      console.log(" Shipping address validation failed");
      return res.status(400).json({
        success: false,
        message: "Please fill all shipping address fields (street, city, state, zip code, phone)",
      });
    }

    console.log(" Looking for user's cart...");
    
    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name price images stock"
    );

    if (!cart) {
      console.log(" Cart not found for user:", req.user._id);
      return res.status(400).json({
        success: false,
        message: "Cart not found. Please add items to cart first.",
      });
    }

    console.log(` Cart found with ${cart.items?.length || 0} items`);

    if (!cart.items || cart.items.length === 0) {
      console.log(" Cart is empty");
      return res.status(400).json({
        success: false,
        message: "Your cart is empty. Please add products to cart.",
      });
    }

    // Check stock availability
    console.log(" Checking stock availability...");
    for (const item of cart.items) {
      if (!item.product) {
        console.log(" Product not found in cart item");
        return res.status(400).json({
          success: false,
          message: "Some products in cart are no longer available",
        });
      }
      
      if (item.product.stock < item.quantity) {
        console.log(` Insufficient stock for ${item.product.name}`);
        return res.status(400).json({
          success: false,
          message: `Sorry, "${item.product.name}" has only ${item.product.stock} items left in stock`,
        });
      }
    }

    console.log(" Stock check passed");

    // Prepare order items
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      image: item.product.images?.[0] || "/default-product.jpg",
    }));

    // Calculate prices
    const itemsPrice = orderItems.reduce(
      (acc, item) => acc + (item.price * item.quantity),
      0
    );
    
    const shippingPrice = itemsPrice > 500 ? 0 : 50;
    const taxPrice = itemsPrice * 0.05;
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    console.log(` Price Calculation:`);
    console.log(`   Items: ৳${itemsPrice}`);
    console.log(`   Shipping: ৳${shippingPrice}`);
    console.log(`   Tax: ৳${taxPrice}`);
    console.log(`   Total: ৳${totalPrice}`);

    // Determine order status based on payment method
    const isPaid = paymentMethod !== "cod"; // COD is not paid yet
    const orderStatus = "confirmed"; // Auto-confirm for demo
    
    console.log(` Payment: ${paymentMethod}, Paid: ${isPaid}, Status: ${orderStatus}`);

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

    console.log(" Saving order to database...");
    const createdOrder = await order.save();
    console.log(" Order saved. ID:", createdOrder._id);

    // Reduce stock
    console.log(" Reducing product stock...");
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }
    console.log(" Stock updated");

    // Clear cart
    console.log(" Clearing user's cart...");
    cart.items = [];
    await cart.save();
    console.log(" Cart cleared");

    // Success message based on payment method
    let message = "";
    if (paymentMethod === "cod") {
      message = "COD order placed successfully! You'll pay when the product arrives.";
    } else {
      message = "Payment successful! Your order is confirmed.";
    }

    console.log("===  ORDER CREATION COMPLETED SUCCESSFULLY ===");
    
    res.status(201).json({
      success: true,
      data: createdOrder,
      message,
      demoNote: "Practicum Project Demo - Order processed successfully",
    });

  } catch (error) {
    console.error("===  ORDER CREATION FAILED ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    // More specific error messages
    let errorMessage = "Error processing order";
    if (error.name === 'ValidationError') {
      errorMessage = "Data validation error. Please check your input.";
    } else if (error.name === 'CastError') {
      errorMessage = "Invalid data format.";
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
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
      .populate("orderItems.product", "name images price");

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
      .populate("orderItems.product", "name images price");

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

// @desc    Clear order history
// @route   DELETE /api/orders/clear-history
// @access  Private
export const clearOrderHistory = asyncHandler(async (req, res) => {
  try {
    const result = await Order.deleteMany({ user: req.user._id });
    
    res.json({
      success: true,
      message: `Successfully cleared ${result.deletedCount} orders from your history`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Clear Order History Error:", error);
    res.status(500).json({
      success: false,
      message: "Error clearing order history",
    });
  }
});