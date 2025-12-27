import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

const shippingAddressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
    default: "Bangladesh",
  },
  zipCode: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
});

const paymentSchema = new mongoose.Schema({
  method: {
    type: String,
    required: true,
    enum: ["cod", "card", "bkash", "nogod", "stripe"],
    default: "cod",
  },
  status: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending",
  },
  transactionId: String,
  paymentIntentId: String,
  clientSecret: String,
  paidAt: Date,
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    payment: paymentSchema,
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    orderStatus: {
      type: String,
      required: true,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: Date,
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: Date,
    notes: String,
    
    // Stripe Payment Details
    stripePayment: {
      paymentIntentId: String,
      clientSecret: String,
      status: {
        type: String,
        enum: ["requires_payment_method", "requires_confirmation", "requires_action", "processing", "requires_capture", "canceled", "succeeded"],
        default: "requires_payment_method"
      },
      currency: {
        type: String,
        default: "usd"
      },
      amount: Number,
      receiptUrl: String,
      lastPaymentError: mongoose.Schema.Types.Mixed,
    },
    
    paymentResult: {
      id: String,
      status: String,
      email_address: String,
      update_time: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate totals before saving
orderSchema.pre("save", function (next) {
  // Calculate items price
  this.itemsPrice = this.orderItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  
  // Calculate total price
  this.totalPrice = this.itemsPrice + this.shippingPrice + this.taxPrice;
  
  // Update isPaid based on paymentStatus
  if (this.paymentStatus === "paid") {
    this.isPaid = true;
    if (!this.paidAt) {
      this.paidAt = Date.now();
    }
  }
  
  // Update isDelivered based on order status
  if (this.orderStatus === "delivered" && !this.isDelivered) {
    this.isDelivered = true;
    this.deliveredAt = Date.now();
  }
  
  next();
});

// Virtual for formatted order number
orderSchema.virtual("orderNumber").get(function() {
  return `ORD-${this._id.toString().slice(-8).toUpperCase()}`;
});

// Instance method to mark as paid and reduce stock
orderSchema.methods.confirmAndReduceStock = async function() {
  try {
    // Update payment status
    this.isPaid = true;
    this.paidAt = Date.now();
    this.payment.status = "paid";
    this.paymentStatus = "paid";
    this.orderStatus = "confirmed";
    
    // Import Product model dynamically to avoid circular dependency
    const Product = mongoose.model("Product");
    
    // Reduce stock for each product
    for (const item of this.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock -= item.quantity;
        await product.save();
      }
    }
    
    return await this.save();
  } catch (error) {
    console.error("Error confirming order and reducing stock:", error);
    throw error;
  }
};

// Instance method to mark as paid from webhook
orderSchema.methods.markAsPaid = function(paymentResult) {
  this.isPaid = true;
  this.paidAt = Date.now();
  this.payment.status = "paid";
  this.paymentStatus = "paid";
  this.orderStatus = "confirmed";
  
  if (this.stripePayment) {
    this.stripePayment.status = "succeeded";
  }
  
  if (paymentResult) {
    this.paymentResult = {
      id: paymentResult.id || paymentResult.paymentIntentId,
      status: paymentResult.status,
      email_address: paymentResult.receipt_email || paymentResult.email_address,
      update_time: paymentResult.created ? new Date(paymentResult.created * 1000) : new Date(),
    };
    
    this.payment.transactionId = paymentResult.id || paymentResult.paymentIntentId;
    this.payment.paidAt = Date.now();
  }
  
  return this.save();
};

// Instance method to update Stripe payment
orderSchema.methods.updateStripePayment = function(paymentIntent) {
  if (!this.stripePayment) {
    this.stripePayment = {};
  }
  
  this.stripePayment.status = paymentIntent.status;
  this.stripePayment.amount = paymentIntent.amount;
  
  if (paymentIntent.last_payment_error) {
    this.stripePayment.lastPaymentError = paymentIntent.last_payment_error;
  }
  
  if (paymentIntent.charges?.data?.[0]?.receipt_url) {
    this.stripePayment.receiptUrl = paymentIntent.charges.data[0].receipt_url;
  }
  
  return this.save();
};

// Static method to find by payment intent
orderSchema.statics.findByPaymentIntentId = function(paymentIntentId) {
  return this.findOne({
    $or: [
      { 'payment.paymentIntentId': paymentIntentId },
      { 'stripePayment.paymentIntentId': paymentIntentId }
    ]
  });
};

const Order = mongoose.model("Order", orderSchema);

export default Order;