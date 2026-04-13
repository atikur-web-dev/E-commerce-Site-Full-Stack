import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Product from "./models/Product.js";
import Order from "./models/Order.js";

dotenv.config();

const migrateData = async () => {
  try {
  
    await mongoose.connect("mongodb://127.0.0.1:27017/shopeasy");
    console.log("Connected to local DB");
    
    const users = await User.find({});
    const products = await Product.find({});
    const orders = await Order.find({});
    
    console.log(`Found: ${users.length} users, ${products.length} products, ${orders.length} orders`);
    
   
    await mongoose.disconnect();
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to Atlas");
    
   
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    
    await User.insertMany(users);
    await Product.insertMany(products);
    await Order.insertMany(orders);
    
    console.log(" Migration complete!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateData();