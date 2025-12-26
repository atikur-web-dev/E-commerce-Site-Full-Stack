// Backend/routes/payment.js - COMPLETE NEW FILE
import express from 'express';
import { protect } from '../middleware/auth.js';

// Import functions - CORRECT NAMES
import {
  getStripeConfig,
  createPaymentIntent,
  confirmPayment,
  getPaymentIntentStatus,
  testPaymentEndpoint,
  handleStripeWebhook, // ✅ This is the correct name
} from '../controllers/paymentController.js';

const router = express.Router();

// ====================== PUBLIC ROUTES ======================
// Stripe webhook (NO protect middleware)
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Get Stripe configuration
router.get('/config', getStripeConfig);

// ====================== PROTECTED ROUTES ======================
// Test endpoint
router.get('/test', protect, testPaymentEndpoint); // ✅ Changed from testPayment

// Create payment intent
router.post('/create-payment-intent', protect, createPaymentIntent);

// Confirm payment
router.post('/confirm', protect, confirmPayment);

// Get payment intent status
router.get('/intent/:paymentIntentId', protect, getPaymentIntentStatus);

export default router;