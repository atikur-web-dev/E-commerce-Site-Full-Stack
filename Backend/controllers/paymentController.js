// Backend/controllers/paymentController.js - NEW FILE
import asyncHandler from 'express-async-handler';
import stripe from '../config/stripe.js';
import Order from '../models/Order.js';

// @desc    Create payment intent
// @route   POST /api/payment/create-payment-intent
// @access  Private
export const createPaymentIntent = asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.body;
    
    // Find the order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }
    
    // Check if order belongs to user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }
    
    // Check if already paid
    if (order.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid',
      });
    }
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalPrice * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
      },
      description: `Payment for order #${order._id}`,
    });
    
    res.status(200).json({
      success: true,
      message: 'Payment intent created',
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });
    
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment intent',
      error: error.message,
    });
  }
});

// @desc    Get Stripe publishable key
// @route   GET /api/payment/config
// @access  Public
export const getStripeConfig = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    currency: 'usd',
  });
});

// @desc    Process webhook from Stripe
// @route   POST /api/payment/webhook
// @access  Public (Stripe calls this)
export const handleWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handleSuccessfulPayment(paymentIntent);
      break;
      
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await handleFailedPayment(failedPayment);
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
});

// Helper function: Handle successful payment
const handleSuccessfulPayment = async (paymentIntent) => {
  try {
    const { orderId } = paymentIntent.metadata;
    
    const order = await Order.findById(orderId);
    
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: paymentIntent.id,
        status: paymentIntent.status,
        email_address: paymentIntent.receipt_email,
      };
      
      await order.save();
      console.log(`✅ Order ${orderId} marked as paid`);
    }
  } catch (error) {
    console.error('Error updating order after payment:', error);
  }
};

// Helper function: Handle failed payment
const handleFailedPayment = async (paymentIntent) => {
  console.log(`❌ Payment failed for intent: ${paymentIntent.id}`);
  // You can update order status or send notification
};

// @desc    Test payment endpoint
// @route   GET /api/payment/test
// @access  Private
export const testPayment = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Payment API is working',
    endpoints: {
      config: 'GET /api/payment/config',
      createIntent: 'POST /api/payment/create-payment-intent',
      webhook: 'POST /api/payment/webhook',
    },
    testCards: {
      success: '4242 4242 4242 4242',
      fail: '4000 0000 0000 0002',
    },
  });
});