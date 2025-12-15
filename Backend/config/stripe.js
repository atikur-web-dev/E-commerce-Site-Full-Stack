// Backend/config/stripe.js
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Test function to verify connection
export const testStripeConnection = async () => {
  try {
    const balance = await stripe.balance.retrieve();
    console.log('✅ Stripe connection successful');
    console.log('Available balance:', balance.available[0]?.amount || 0);
    return true;
  } catch (error) {
    console.error('❌ Stripe connection failed:', error.message);
    return false;
  }
};

export default stripe;