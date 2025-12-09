// Backend/simpleSeed.js নামে নতুন ফাইল
import mongoose from "mongoose";
import Product from "./models/Product.js";
import dotenv from "dotenv";

dotenv.config();

const simpleProducts = [
  // Smartphones - lowercase রাখছি
  {
    name: "iPhone 15 Pro",
    description: "Latest iPhone",
    price: 999,
    category: "smartphones",
    brand: "Apple",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500",
    stock: 10,
    rating: 4.5,
    numReviews: 100,
  },
  {
    name: "Samsung S24",
    description: "New Samsung flagship",
    price: 899,
    category: "smartphones",
    brand: "Samsung",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500",
    stock: 15,
    rating: 4.3,
    numReviews: 80,
  },
  {
    name: "Google Pixel 8",
    description: "Best camera phone",
    price: 799,
    category: "smartphones",
    brand: "Google",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500",
    stock: 8,
    rating: 4.6,
    numReviews: 60,
  },
  {
    name: "OnePlus 12",
    description: "Flagship killer",
    price: 699,
    category: "smartphones",
    brand: "OnePlus",
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500",
    stock: 12,
    rating: 4.4,
    numReviews: 45,
  },

  // Laptops
  {
    name: "MacBook Pro",
    description: "Apple laptop",
    price: 1999,
    category: "laptops",
    brand: "Apple",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
    stock: 5,
    rating: 4.8,
    numReviews: 150,
  },
  {
    name: "Dell XPS",
    description: "Windows laptop",
    price: 1499,
    category: "laptops",
    brand: "Dell",
    image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500",
    stock: 8,
    rating: 4.6,
    numReviews: 120,
  },
  {
    name: "Lenovo ThinkPad",
    description: "Business laptop",
    price: 1299,
    category: "laptops",
    brand: "Lenovo",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500",
    stock: 10,
    rating: 4.5,
    numReviews: 90,
  },
  {
    name: "ASUS ROG",
    description: "Gaming laptop",
    price: 1799,
    category: "laptops",
    brand: "ASUS",
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500",
    stock: 6,
    rating: 4.7,
    numReviews: 75,
  },
];

const seedSimple = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");

    // Clear existing
    await Product.deleteMany({});
    console.log("🗑️ Old products deleted");

    // Insert new
    await Product.insertMany(simpleProducts);
    console.log(`✅ ${simpleProducts.length} products added`);

    // Show summary
    const categories = {};
    simpleProducts.forEach((p) => {
      categories[p.category] = (categories[p.category] || 0) + 1;
    });

    console.log("\n📊 Summary:");
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} products`);
    });

    process.exit();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

seedSimple();
