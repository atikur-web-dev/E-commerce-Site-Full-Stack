// Backend/routes/payment.js - NEW FILE
import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createPaymentIntent,
  getStripeConfig,
  handleWebhook,
  testPayment,
} from '../controllers/paymentController.js';

const router = express.Router();

// Test route
router.get('/test', protect, testPayment);

// Get Stripe config
router.get('/config', getStripeConfig);

// Create payment intent
router.post('/create-payment-intent', protect, createPaymentIntent);

// Stripe webhook (NO protect middleware - Stripe calls this directly)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;