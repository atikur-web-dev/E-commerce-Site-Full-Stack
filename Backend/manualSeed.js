// manualSeed.js
const mongoose = require('mongoose');

const products = [
  {
    name: "iPhone 15 Pro",
    description: "Latest Apple smartphone",
    price: 1299.99,
    category: "Electronics",
    brand: "Apple",
    image: "https://picsum.photos/200",
    stock: 50,
    rating: 4.8,
    numReviews: 120,
    isFeatured: true,
  },
  {
    name: "Nike Shoes",
    description: "Running shoes",
    price: 129.99,
    category: "Fashion",
    brand: "Nike",
    image: "https://picsum.photos/200",
    stock: 100,
    rating: 4.5,
    numReviews: 89,
    isFeatured: true,
  }
];

async function insertProducts() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/shopeasy');
    console.log('✅ Connected');
    
    // Drop collection
    await mongoose.connection.db.collection('products').drop().catch(() => {});
    console.log('���️ Cleared collection');
    
    // Insert
    const result = await mongoose.connection.db.collection('products').insertMany(products);
    console.log(`��� Inserted ${result.insertedCount} products`);
    
    // Verify
    const count = await mongoose.connection.db.collection('products').countDocuments();
    console.log(`��� Total products: ${count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

insertProducts();
