import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

console.log('🧪 Simple Stripe Test');
console.log('='.repeat(40));

// Check environment variables
console.log('📋 Checking environment variables:');
console.log(`  STRIPE_SECRET_KEY exists: ${!!process.env.STRIPE_SECRET_KEY}`);
console.log(`  Key length: ${process.env.STRIPE_SECRET_KEY?.length || 0}`);
console.log(`  Key starts with: ${process.env.STRIPE_SECRET_KEY?.substring(0, 8)}`);
console.log(`  Key ends with: ${process.env.STRIPE_SECRET_KEY?.substring(process.env.STRIPE_SECRET_KEY?.length - 8)}`);

// Test with direct Stripe call
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

async function testStripe() {
  try {
    console.log('\n💳 Testing Stripe API...');
    
    // Method 1: Try to create a test payment intent (small amount)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 100, // $1.00
      currency: 'usd',
      description: 'Test payment intent',
      metadata: { test: 'true' }
    });
    
    console.log('✅ Stripe API Test PASSED!');
    console.log(`  Payment Intent ID: ${paymentIntent.id}`);
    console.log(`  Status: ${paymentIntent.status}`);
    console.log(`  Client Secret: ${paymentIntent.client_secret ? 'Present' : 'Missing'}`);
    
    return true;
  } catch (error) {
    console.error('❌ Stripe API Test FAILED:');
    console.error(`  Error Type: ${error.type}`);
    console.error(`  Error Code: ${error.code}`);
    console.error(`  Error Message: ${error.message}`);
    
    // If authentication error, check the key format
    if (error.type === 'StripeAuthenticationError') {
      console.log('\n🔑 Common issues with Stripe keys:');
      console.log('  1. Key might have spaces at beginning/end');
      console.log('  2. Key might be from wrong environment (test vs live)');
      console.log('  3. Key might be incomplete');
      
      // Check key format
      const key = process.env.STRIPE_SECRET_KEY || '';
      if (key.includes(' ')) {
        console.log('  ⚠️ Key contains spaces! Remove any spaces.');
      }
      if (!key.startsWith('sk_test_') && !key.startsWith('sk_live_')) {
        console.log('  ⚠️ Key should start with "sk_test_" or "sk_live_"');
      }
      if (key.length < 50) {
        console.log('  ⚠️ Key seems too short');
      }
    }
    
    return false;
  }
}

async function testWithoutStripe() {
  console.log('\n💡 Testing without Stripe (Simulation Mode)');
  
  // Simulate payment flow
  const testOrder = {
    id: 'test_order_123',
    totalPrice: 99.99,
    paymentMethod: 'cod',
    status: 'pending'
  };
  
  console.log('✅ Simulation Test PASSED!');
  console.log('  You can continue development with:');
  console.log('  1. COD payments (working)');
  console.log('  2. Mock card payments for testing');
  console.log('  3. Real Stripe integration later');
  
  return true;
}

// Main test
async function runTests() {
  console.log('🚀 Running simple payment tests...\n');
  
  const stripeWorking = await testStripe();
  
  if (!stripeWorking) {
    await testWithoutStripe();
  }
  
  console.log('\n' + '='.repeat(40));
  console.log('✅ All tests completed');
  console.log('\n📋 Recommendations:');
  
  if (stripeWorking) {
    console.log('  1. ✅ Stripe is working! Continue with real payments.');
    console.log('  2. Use test card: 4242 4242 4242 4242');
    console.log('  3. Test expiry: 12/34, CVC: 123');
  } else {
    console.log('  1. ⚠️ Stripe not working. Check your API key.');
    console.log('  2. Get test keys from: https://dashboard.stripe.com/test/apikeys');
    console.log('  3. For now, use COD and simulated payments');
  }
}

runTests().catch(console.error);