// Backend folder-এ একটি test script তৈরি করো
// checkCategories.js
import mongoose from "mongoose";
import Product from "./models/Product.js";
import dotenv from "dotenv";

dotenv.config();

const checkCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // All unique categories in database
    const categories = await Product.distinct("category");
    console.log("\n📊 CATEGORIES IN DATABASE:");
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. "${cat}"`);
    });

    // Count products per category
    console.log("\n📈 PRODUCTS PER CATEGORY:");
    for (const category of categories) {
      const count = await Product.countDocuments({ category });
      console.log(`   ${category}: ${count} products`);
    }

    process.exit();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

checkCategories();
