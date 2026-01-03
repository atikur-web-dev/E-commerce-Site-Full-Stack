// Backend/checkAdmin.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

async function checkAdmin() {
  console.log('🔍 Checking Admin Login Issue...\n');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
    
    const User = (await import('./models/User.js')).default;
    
    // 1. Check admin user exists
    const admin = await User.findOne({ email: 'admin@example.com' }).select('+password');
    console.log('\n📋 Admin User Found:', !!admin);
    
    if (admin) {
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
      console.log('Password in DB:', admin.password ? 'Yes (hashed)' : 'No');
      console.log('Password length:', admin.password?.length);
      
      // 2. Test password match
      const testPassword = 'admin123';
      const isMatch = await bcrypt.compare(testPassword, admin.password);
      console.log(`\n🔐 Password "admin123" matches:`, isMatch);
    } else {
      console.log('\n❌ Admin not found in database!');
      console.log('💡 Run: node seedAdmin.js');
    }
    
    // 3. Check all users
    const allUsers = await User.find({});
    console.log('\n👥 All Users:', allUsers.length);
    allUsers.forEach(u => console.log(`- ${u.email} (${u.role})`));
    
    mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAdmin();