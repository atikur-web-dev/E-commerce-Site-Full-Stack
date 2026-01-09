import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
await mongoose.connect(process.env.MONGODB_URI);
console.log(' Connected to MongoDB');

// Check Product schema
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: false }, 
  price: { type: Number, required: true },
  category: { type: String, required: true },
  brand: { type: String, required: false }, 
  image: { type: String, required: false },
  images: [{ type: String }], 
  stock: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  specifications: { type: mongoose.Schema.Types.Mixed, default: {} },
  warranty: { type: Number, default: 12 },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', ProductSchema);

// Create a test product with minimal fields
const testProduct = new Product({
  name: 'Test Product Fix',
  price: 99.99,
  category: 'electronics',
  images: ['test.jpg'], 
  stock: 10
});

try {
  await testProduct.save();
  console.log(' Test product created successfully');
  console.log('Product schema is working correctly');
} catch (error) {
  console.error(' Error creating test product:', error.message);
  
  // Check what fields are actually required
  const schemaPaths = Product.schema.paths;
  console.log('\n Required fields in Product schema:');
  for (const [path, schemaType] of Object.entries(schemaPaths)) {
    if (schemaType.isRequired) {
      console.log(`  - ${path}: ${schemaType.instance}`);
    }
  }
}

// Update existing products to add missing fields
try {
  const result = await Product.updateMany(
    { 
      $or: [
        { image: { $exists: false } },
        { brand: { $exists: false } },
        { description: { $exists: false } }
      ]
    },
    {
      $set: {
        image: 'https://via.placeholder.com/300',
        brand: 'Generic',
        description: 'Product description not available',
        images: ['https://via.placeholder.com/300']
      }
    }
  );
  
  console.log(` Updated ${result.modifiedCount} products with default values`);
} catch (error) {
  console.error(' Error updating products:', error.message);
}

await mongoose.disconnect();
console.log(' MongoDB Disconnected');