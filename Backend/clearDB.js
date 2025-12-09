// Backend folder-এ clearDB.js নামে একটি ফাইল তৈরি করো
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const clearDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");

    // Get all collections
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
      console.log(`🗑️ Clearing collection: ${collection.collectionName}`);
      await collection.deleteMany({});
    }

    console.log("✅ All collections cleared");
    process.exit();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

clearDatabase();
