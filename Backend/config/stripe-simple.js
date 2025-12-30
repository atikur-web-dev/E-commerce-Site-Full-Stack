import dotenv from 'dotenv';

dotenv.config();

console.log(' Using SIMPLE payment mode for Practicum project');

const SimpleStripe = {
  
  paymentIntents: {
    create: async (params) => {
      console.log(` [MOCK] Payment intent created for $${(params.amount / 100).toFixed(2)}`);
      
      return {
        id: 'pi_mock_' + Date.now(),
        client_secret: 'mock_secret_for_presentation',
        status: 'requires_payment_method',
        amount: params.amount,
        currency: params.currency || 'usd',
        metadata: params.metadata,
        created: Math.floor(Date.now() / 1000)
      };
    },
    
    retrieve: async (id) => {
      console.log(` [MOCK] Retrieving payment intent: ${id}`);
      
      return {
        id: id,
        status: 'succeeded',
        amount: 1000,
        currency: 'usd',
        client_secret: 'mock_secret',
        charges: {
          data: [{
            id: 'ch_mock',
            amount: 1000,
            status: 'succeeded',
            receipt_url: 'https://example.com/receipt/mock'
          }]
        }
      };
    },
    
    confirm: async (id) => {
      console.log(` [MOCK] Payment confirmed: ${id}`);
      return {
        id: id,
        status: 'succeeded'
      };
    }
  },
  
  balance: {
    retrieve: async () => ({
      available: [{ amount: 1000000, currency: 'usd' }]
    })
  },
  
  webhooks: {
    constructEvent: () => ({
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_mock' } }
    })
  }
};

// Always return success
export const testStripeConnection = async () => ({
  connected: true,
  mode: 'presentation',
  message: 'Payment system ready for presentation',
  note: 'This is a mock system for Practicum project presentation'
});

export default SimpleStripe;