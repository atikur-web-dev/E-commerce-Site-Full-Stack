import mongoose from 'mongoose';

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
  },
  {
    name: "Samsung Galaxy",
    description: "Android smartphone",
    price: 899.99,
    category: "Electronics",
    brand: "Samsung",
    image: "https://picsum.photos/200",
    stock: 75,
    rating: 4.7,
    numReviews: 95,
    isFeatured: false,
  }
];

async function insertProducts() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/shopeasy');
    console.log('‚úÖ Connected to MongoDB');

    // Drop collection
    await mongoose.connection.db.collection('products').drop().catch(() => {
      console.log('‚ö†Ô∏è Collection already dropped or not exists');
    });
    console.log('Ì∑ëÔ∏è Cleared products collection');

    // Insert
    const result = await mongoose.connection.db.collection('products').insertMany(products);
    console.log(`Ì≥¶ Inserted ${result.insertedCount} products`);

    // Verify
    const count = await mongoose.connection.db.collection('products').countDocuments();
    console.log(`Ì≥ä Total products in database: ${count}`);

    // Show inserted products
    const inserted = await mongoose.connection.db.collection('products').find().toArray();
    console.log('\nÌ¥ç Inserted products:');
    inserted.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} - $${p.price} (${p.category})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('‚ùå Error:', error.message);
    process.exit(1);
  }
}

insertProducts();
