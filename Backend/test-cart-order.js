import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';
import Cart from './models/Cart.js';
import Product from './models/Product.js';
import User from './models/User.js';

dotenv.config();

// Mock request object for testing controllers
const createMockRequest = (userData = {}, body = {}) => ({
  user: {
    _id: userData._id || new mongoose.Types.ObjectId(),
    role: userData.role || 'user'
  },
  body,
  params: {}
});

const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

class CartOrderTester {
  constructor() {
    this.testUser = null;
    this.testProducts = [];
    this.testCart = null;
  }

  async setupTestData() {
    console.log('🧪 Setting up test data...');
    
    // Create test user
    this.testUser = new User({
      _id: new mongoose.Types.ObjectId(),
      name: 'Test User',
      email: 'test@example.com',
      password: 'test123',
      role: 'user'
    });
    
    // Create test products
    this.testProducts = [
      new Product({
        _id: new mongoose.Types.ObjectId(),
        name: 'Test Product 1',
        price: 100,
        stock: 10,
        images: ['test1.jpg'],
        category: 'electronics'
      }),
      new Product({
        _id: new mongoose.Types.ObjectId(),
        name: 'Test Product 2',
        price: 200,
        stock: 5,
        images: ['test2.jpg'],
        category: 'gadgets'
      })
    ];
    
    // Create test cart
    this.testCart = new Cart({
      user: this.testUser._id,
      items: [
        {
          product: this.testProducts[0]._id,
          quantity: 2,
          price: this.testProducts[0].price
        },
        {
          product: this.testProducts[1]._id,
          quantity: 1,
          price: this.testProducts[1].price
        }
      ]
    });
    
    // Save all to database
    await this.testUser.save();
    await Product.insertMany(this.testProducts);
    await this.testCart.save();
    
    console.log('✅ Test data setup complete');
  }

  async testCreateOrder() {
    console.log('\n🧪 Testing createOrder function...');
    
    const mockReq = createMockRequest(
      { _id: this.testUser._id },
      {
        shippingAddress: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          country: 'Bangladesh',
          zipCode: '1200',
          phone: '0123456789'
        },
        paymentMethod: 'cod',
        notes: 'Test order'
      }
    );
    
    const mockRes = createMockResponse();
    
    // Import the controller
    const { createOrder } = await import('./controllers/orderController.js');
    
    try {
      await createOrder(mockReq, mockRes);
      
      const response = mockRes.json.mock.calls[0][0];
      
      if (response.success) {
        console.log('✅ createOrder test PASSED');
        console.log(`   Order ID: ${response.data._id}`);
        console.log(`   Order Status: ${response.data.orderStatus}`);
        console.log(`   Payment Method: ${response.data.payment.method}`);
        return response.data;
      } else {
        console.log('❌ createOrder test FAILED');
        console.log(`   Error: ${response.message}`);
        return null;
      }
    } catch (error) {
      console.error('❌ createOrder test ERROR:', error.message);
      return null;
    }
  }

  async testGetMyOrders() {
    console.log('\n🧪 Testing getMyOrders function...');
    
    const mockReq = createMockRequest({ _id: this.testUser._id });
    const mockRes = createMockResponse();
    
    // Import the controller
    const { getMyOrders } = await import('./controllers/orderController.js');
    
    try {
      await getMyOrders(mockReq, mockRes);
      
      const response = mockRes.json.mock.calls[0][0];
      
      if (response.success) {
        console.log('✅ getMyOrders test PASSED');
        console.log(`   Found ${response.count} orders`);
        return response.data;
      } else {
        console.log('❌ getMyOrders test FAILED');
        return null;
      }
    } catch (error) {
      console.error('❌ getMyOrders test ERROR:', error.message);
      return null;
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Cart → Order Flow Tests');
    console.log('='.repeat(50));
    
    // Connect to MongoDB
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      return;
    }
    
    // Setup test data
    await this.setupTestData();
    
    // Run tests
    const order = await this.testCreateOrder();
    if (order) {
      await this.testGetMyOrders();
    }
    
    // Cleanup
    await this.cleanup();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ All Cart→Order tests completed');
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up test data...');
    try {
      if (this.testUser) {
        await User.deleteOne({ _id: this.testUser._id });
      }
      if (this.testProducts.length > 0) {
        await Product.deleteMany({ 
          _id: { $in: this.testProducts.map(p => p._id) }
        });
      }
      if (this.testCart) {
        await Cart.deleteOne({ _id: this.testCart._id });
      }
      
      // Delete any test orders
      await Order.deleteMany({ user: this.testUser?._id });
      
      console.log('✅ Cleanup completed');
    } catch (error) {
      console.error('❌ Cleanup error:', error.message);
    }
    
    await mongoose.disconnect();
  }
}

// Run the tests
const tester = new CartOrderTester();

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
  process.exit(1);
});

// Run tests
tester.runAllTests().catch(console.error);