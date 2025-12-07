// seedProducts.js - SIMPLE VERSION
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";

dotenv.config();

const sampleProducts = [
  {
    name: "iPhone 15 Pro",
    description: "Latest Apple smartphone with A17 Pro chip",
    price: 1299.99,
    category: "Electronics",
    brand: "Apple",
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400",
    ],
    stock: 50,
    rating: 4.8,
    numReviews: 120,
    isFeatured: true,
  },
  {
    name: "Nike Air Max 270",
    description: "Comfortable running shoes",
    price: 129.99,
    category: "Fashion",
    brand: "Nike",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"],
    stock: 100,
    rating: 4.5,
    numReviews: 89,
    isFeatured: true,
  },
  {
    name: "Samsung Galaxy S23",
    description: "Powerful Android smartphone",
    price: 899.99,
    category: "Electronics",
    brand: "Samsung",
    images: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400",
    ],
    stock: 75,
    rating: 4.7,
    numReviews: 95,
    isFeatured: false,
  },
  {
    name: "Leather Jacket",
    description: "Genuine leather jacket",
    price: 199.99,
    category: "Fashion",
    brand: "LeatherCraft",
    images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400"],
    stock: 30,
    rating: 4.3,
    numReviews: 45,
    isFeatured: false,
  },
  {
    name: "MacBook Pro",
    description: "Professional laptop",
    price: 2499.99,
    category: "Electronics",
    brand: "Apple",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
    ],
    stock: 25,
    rating: 4.9,
    numReviews: 210,
    isFeatured: true,
  },
];

async function seedDatabase() {
  try {
    console.log(" Seeding database...");

    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/shopeasy"
    );
    console.log(" Connected to MongoDB");

    // Clear existing products
    await Product.deleteMany({});
    console.log(" Cleared existing products");

    // Insert sample products
    await Product.insertMany(sampleProducts);
    console.log(` Inserted ${sampleProducts.length} products`);

    // Verify
    const count = await Product.countDocuments();
    console.log(` Total products in database: ${count}`);

    console.log("\n Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error(" Seeding error:", error.message);
    process.exit(1);
  }
}

seedDatabase();
