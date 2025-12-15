// Backend/controllers/paymentController.js
import asyncHandler from 'express-async-handler';
import stripe from '../config/stripe.js';
import Order from '../models/Order.js';

// @desc    Get Stripe configuration
// @route   GET /api/payment/config
// @access  Public
export const getStripeConfig = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    currency: 'usd',
    country: 'US',
    apiVersion: '2023-10-16',
  });
});

// @desc    Create payment intent for order
// @route   POST /api/payment/create-payment-intent
// @access  Private
export const createPaymentIntent = asyncHandler(async (req, res) => {
  try {
    const { orderId, paymentMethodId } = req.body;
    const userId = req.user._id;
    
    console.log(`💳 Creating payment intent for order: ${orderId}`);
    
    // Find the order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }
    
    // Verify order belongs to user
    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this order',
      });
    }
    
    // Check if already paid
    if (order.isPaid) {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid',
      });
    }
    
    // Convert amount to cents (Stripe expects smallest currency unit)
    const amountInCents = Math.round(order.totalPrice * 100);
    
    // Create payment intent
    const paymentIntentParams = {
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        orderId: order._id.toString(),
        userId: userId.toString(),
        orderTotal: order.totalPrice,
      },
      description: `Payment for ShopEasy Order #${order._id.toString().slice(-8)}`,
    };
    
    // Add payment method if provided
    if (paymentMethodId) {
      paymentIntentParams.payment_method = paymentMethodId;
      paymentIntentParams.confirm = true;
      paymentIntentParams.return_url = `${process.env.FRONTEND_URL}/order/${order._id}/payment-success`;
    }
    
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);
    
    // Update order with payment intent details
    order.payment.paymentIntentId = paymentIntent.id;
    order.payment.clientSecret = paymentIntent.client_secret;
    order.stripePayment = {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
      currency: paymentIntent.currency,
      amount: paymentIntent.amount,
    };
    
    await order.save();
    
    res.status(200).json({
      success: true,
      message: 'Payment intent created successfully',
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      requiresAction: paymentIntent.status === 'requires_action' || paymentIntent.status === 'requires_confirmation',
      nextAction: paymentIntent.next_action,
    });
    
  } catch (error) {
    console.error('❌ Payment intent creation error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message,
      type: error.type,
      code: error.code,
    });
  }
});

// @desc    Confirm payment intent
// @route   POST /api/payment/confirm-payment
// @access  Private
export const confirmPayment = asyncHandler(async (req, res) => {
  try {
    const { paymentIntentId, paymentMethodId } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
      return_url: `${process.env.FRONTEND_URL}/payment-success`,
    });
    
    // Find and update order
    const order = await Order.findOne({ 'payment.paymentIntentId': paymentIntentId });
    
    if (order) {
      order.stripePayment.status = paymentIntent.status;
      
      if (paymentIntent.status === 'succeeded') {
        order.markAsPaid({
          id: paymentIntent.id,
          status: paymentIntent.status,
          email_address: paymentIntent.receipt_email,
        });
      }
      
      await order.save();
    }
    
    res.status(200).json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret,
        nextAction: paymentIntent.next_action,
      },
    });
    
  } catch (error) {
    console.error('❌ Payment confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment confirmation failed',
      error: error.message,
    });
  }
});

// @desc    Get payment intent status
// @route   GET /api/payment/intent/:paymentIntentId
// @access  Private
export const getPaymentIntentStatus = asyncHandler(async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    res.status(200).json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        clientSecret: paymentIntent.client_secret,
        created: new Date(paymentIntent.created * 1000),
        charges: paymentIntent.charges?.data?.map(charge => ({
          id: charge.id,
          amount: charge.amount,
          status: charge.status,
          receiptUrl: charge.receipt_url,
        })),
      },
    });
    
  } catch (error) {
    console.error('❌ Payment intent retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment intent',
      error: error.message,
    });
  }
});

// @desc    Test payment endpoint
// @route   GET /api/payment/test
// @access  Private
export const testPaymentEndpoint = asyncHandler(async (req, res) => {
  try {
    // Test Stripe connection
    const stripeTest = await import('../config/stripe.js').then(m => m.testStripeConnection());
    
    res.status(200).json({
      success: true,
      message: 'Payment API is working',
      timestamp: new Date().toISOString(),
      stripe: stripeTest,
      endpoints: {
        config: 'GET /api/payment/config',
        createIntent: 'POST /api/payment/create-payment-intent',
        confirmPayment: 'POST /api/payment/confirm-payment',
        getStatus: 'GET /api/payment/intent/:paymentIntentId',
      },
      testCards: [
        {
          number: '4242 4242 4242 4242',
          exp: '12/34',
          cvc: '123',
          description: 'Visa (success)'
        },
        {
          number: '4000 0000 0000 0002',
          exp: '12/34',
          cvc: '123',
          description: 'Visa (payment failed)'
        },
        {
          number: '5555 5555 5555 4444',
          exp: '12/34',
          cvc: '123',
          description: 'Mastercard (success)'
        },
      ],
      note: 'These are test cards. No real money will be charged.',
    });
    
  } catch (error) {
    console.error('Payment test error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment test failed',
      error: error.message,
    });
  }
});

// @desc    Handle Stripe webhook
// @route   POST /api/payment/webhook
// @access  Public
export const handleStripeWebhook = asyncHandler(async (req, res) => {
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
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`🔔 Stripe webhook received: ${event.type}`);

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event.data.object);
      break;
      
    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(event.data.object);
      break;
      
    case 'payment_intent.canceled':
      await handlePaymentIntentCanceled(event.data.object);
      break;
      
    case 'charge.succeeded':
      console.log('Charge succeeded:', event.data.object.id);
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
});

// Helper: Handle successful payment
const handlePaymentIntentSucceeded = async (paymentIntent) => {
  try {
    const order = await Order.findOne({ 'payment.paymentIntentId': paymentIntent.id });
    
    if (order) {
      await order.markAsPaid({
        id: paymentIntent.id,
        status: paymentIntent.status,
        email_address: paymentIntent.receipt_email,
      });
      
      console.log(`✅ Order ${order._id} marked as paid via webhook`);
    }
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
};

// Helper: Handle failed payment
const handlePaymentIntentFailed = async (paymentIntent) => {
  try {
    const order = await Order.findOne({ 'payment.paymentIntentId': paymentIntent.id });
    
    if (order) {
      order.payment.status = 'failed';
      order.stripePayment.status = paymentIntent.status;
      order.stripePayment.lastPaymentError = paymentIntent.last_payment_error;
      
      await order.save();
      console.log(`❌ Order ${order._id} payment failed`);
    }
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
};

// Helper: Handle canceled payment
const handlePaymentIntentCanceled = async (paymentIntent) => {
  console.log(`Payment intent canceled: ${paymentIntent.id}`);
};