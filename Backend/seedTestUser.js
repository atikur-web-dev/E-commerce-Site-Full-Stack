import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Check if test user exists
    const existingUser = await User.findOne({ email: "test@example.com" });

    if (existingUser) {
      console.log("✅ Test user already exists");
      console.log("Email: test@example.com");
      console.log("Password: password123");
      process.exit(0);
    }

    // Create test user
    const hashedPassword = await bcrypt.hash("password123", 10);

    const testUser = new User({
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword,
      role: "user",
    });

    await testUser.save();
    console.log("✅ Test user created successfully!");
    console.log("📧 Email: test@example.com");
    console.log("🔑 Password: password123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating test user:", error);
    process.exit(1);
  }
};

createTestUser();
