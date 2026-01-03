// Backend/seedAdmin.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const createAdminUser = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@example.com" });
    
    if (existingAdmin) {
      console.log("✅ Admin user already exists!");
      console.log("📧 Email:", existingAdmin.email);
      console.log("🛡️ Role:", existingAdmin.role);
      console.log("🔑 Password: admin123");
      
      // Check if role is admin
      if (existingAdmin.role !== 'admin') {
        console.log("⚠️ User exists but role is not admin. Updating...");
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log("✅ Role updated to admin!");
      }
      
      process.exit(0);
    }

    // Create admin user
    console.log("🛠️ Creating admin user...");
    
    const adminUser = new User({
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123",
      role: "admin",
      phone: "+880 1234567890",
      avatar: "",
      isActive: true,
      shippingAddress: {
        street: "Admin Street",
        city: "Dhaka",
        state: "Dhaka",
        zipCode: "1200",
        country: "Bangladesh"
      }
    });

    await adminUser.save();
    
    console.log("✅ Admin user created successfully!");
    console.log("📧 Email: admin@example.com");
    console.log("🔑 Password: admin123");
    console.log("🛡️ Role: admin");
    console.log("💡 Now you can login with these credentials");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    process.exit(1);
  }
};

createAdminUser();