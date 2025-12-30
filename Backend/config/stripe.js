// Backend/config/stripe.js
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Test if Stripe key is configured
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn(' STRIPE_SECRET_KEY is not set in .env file');
}

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key', {
  apiVersion: '2023-10-16',
  timeout: 10000, // 10 seconds timeout
});

console.log('Stripe Key Length:', process.env.STRIPE_SECRET_KEY.length);
console.log('Stripe Key First 10 chars:', process.env.STRIPE_SECRET_KEY.substring(0, 10));
console.log('Stripe Key Last 10 chars:', process.env.STRIPE_SECRET_KEY.substring(process.env.STRIPE_SECRET_KEY.length - 10));

// Test connection function
export const testStripeConnection = async () => {
  try {
    console.log('🔌 Testing Stripe connection...');
    
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('dummy')) {
      console.log(' Using dummy Stripe key - will simulate payments');
      return {
        connected: false,
        mode: 'simulation',
        message: 'Using test mode with dummy key'
      };
    }
    
    
    const balance = await stripe.balance.retrieve();
    
    console.log(' Stripe connection successful!');
    console.log(` Available balance: $${(balance.available[0]?.amount / 100).toFixed(2)}`);
    console.log(` Currency: ${balance.available[0]?.currency}`);
    
    return {
      connected: true,
      mode: 'test',
      balance: {
        available: balance.available[0]?.amount || 0,
        currency: balance.available[0]?.currency || 'usd'
      }
    };
  } catch (error) {
    console.error(' Stripe connection failed:', error.message);
    
    
    if (error.type === 'StripeAuthenticationError') {
      console.log(' Please check your STRIPE_SECRET_KEY in .env file');
      console.log(' Get test keys from: https://dashboard.stripe.com/test/apikeys');
    }
    
    return {
      connected: false,
      error: error.message,
      mode: 'failed'
    };
  }
};

export default stripe;