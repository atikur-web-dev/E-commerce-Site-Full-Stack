// Backend/controllers/orderController.js
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import asyncHandler from "express-async-handler";

// @desc    Create new order (without payment)
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, notes } = req.body;

    // Get user's cart with product details
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name price images stock category brand"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No items in cart",
      });
    }

    // Check stock availability (but don't reduce yet)
    const stockErrors = [];
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        stockErrors.push({
          product: item.product.name,
          available: item.product.stock,
          requested: item.quantity
        });
      }
    }

    if (stockErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Some items are out of stock",
        errors: stockErrors,
      });
    }

    // Prepare order items
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.price,
      image: item.product.images[0] || "",
    }));

    // Calculate prices
    const itemsPrice = orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const shippingPrice = itemsPrice > 500 ? 0 : 50; // Free shipping above 500
    const taxPrice = itemsPrice * 0.05; // 5% tax
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    // Create order with initial status
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      payment: {
        method: paymentMethod || "cod",
        status: "pending", // Always start as pending
      },
      paymentStatus: "pending",
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      notes,
      orderStatus: "pending",
    });

    const createdOrder = await order.save();

    // If COD, we can mark as confirmed (but not paid)
    if (paymentMethod === "cod") {
      createdOrder.orderStatus = "confirmed";
      createdOrder.payment.status = "pending"; // COD is paid on delivery
      await createdOrder.save();
      
      // For COD, reduce stock immediately
      for (const item of createdOrder.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock -= item.quantity;
          await product.save();
        }
      }
      
      // Clear cart for COD orders
      cart.items = [];
      await cart.save();
    }

    // Return response based on payment method
    const response = {
      success: true,
      data: createdOrder,
      message: paymentMethod === "cod" 
        ? "COD order created successfully. You will pay on delivery." 
        : "Order created successfully. Please proceed to payment.",
      nextStep: paymentMethod === "cod" 
        ? "order_confirmed" 
        : "make_payment",
      requiresPayment: paymentMethod !== "cod",
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating order",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
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
      .populate("orderItems.product", "name images category brand");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if user owns the order or is admin
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order",
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
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("orderItems.product", "name images")
      .sort("-createdAt");

    res.json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    console.error("Get My Orders Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .populate("orderItems.product", "name")
      .sort("-createdAt");

    res.json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @desc    Update order to paid (after successful payment)
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = asyncHandler(async (req, res) => {
  try {
    const { paymentIntentId, transactionId } = req.body;
    
    const order = await Order.findById(req.params.id).populate("orderItems.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if already paid
    if (order.isPaid) {
      return res.status(400).json({
        success: false,
        message: "Order is already paid",
      });
    }

    // Check authorization
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this order",
      });
    }

    // Use the instance method to confirm order and reduce stock
    await order.confirmAndReduceStock();
    
    // Update payment details
    order.payment.transactionId = transactionId || paymentIntentId || `TXN${Date.now()}`;
    order.payment.paidAt = Date.now();
    
    // Clear user's cart
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [], totalPrice: 0, totalItems: 0 } }
    );

    const updatedOrder = await order.save();

    res.json({
      success: true,
      data: updatedOrder,
      message: "Order payment confirmed successfully",
    });
  } catch (error) {
    console.error("Update Order Paid Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating payment",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @desc    Update order to delivered
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

    // Check if order is paid (for non-COD orders)
    if (order.payment.method !== "cod" && !order.isPaid) {
      return res.status(400).json({
        success: false,
        message: "Order must be paid before delivery",
      });
    }

    // For COD orders, mark as paid on delivery
    if (order.payment.method === "cod" && !order.isPaid) {
      order.isPaid = true;
      order.payment.status = "paid";
      order.paymentStatus = "paid";
      order.payment.paidAt = Date.now();
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
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("orderItems.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check authorization
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this order",
      });
    }

    // Check if order can be cancelled
    if (order.orderStatus === "shipped" || order.orderStatus === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled after shipping",
      });
    }

    // If order was paid, refund logic would go here
    if (order.isPaid) {
      // TODO: Implement refund logic
      order.payment.status = "refunded";
      order.paymentStatus = "refunded";
    }

    // Restore stock if order was confirmed/paid
    if (order.orderStatus === "confirmed" || order.isPaid) {
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

    order.orderStatus = "cancelled";
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
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});