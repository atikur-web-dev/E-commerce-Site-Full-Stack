// Backend/checkAdminPassword.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function checkPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');
    
    const User = (await import('./models/User.js')).default;
    
    // Find admin user WITH password
    const admin = await User.findOne({ 
      email: 'admin@example.com' 
    }).select('+password');
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      return;
    }
    
    console.log('📋 Admin User Details:');
    console.log('- Email:', admin.email);
    console.log('- Role:', admin.role);
    console.log('- Created:', admin.createdAt);
    console.log('- Last Login:', admin.lastLogin);
    console.log('- Hashed Password:', admin.password.substring(0, 20) + '...');
    
    // Test different passwords
    console.log('\n🔐 Password Testing:');
    
    const testPasswords = [
      'admin123',
      'Admin123',
      'admin@123',
      'admin',
      'password',
      '123456'
    ];
    
    for (const testPass of testPasswords) {
      const isMatch = await bcrypt.compare(testPass, admin.password);
      console.log(`"${testPass}" -> ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
    }
    
    // Show raw hash for manual check
    console.log('\n🔍 Hash Info:');
    console.log('Hash length:', admin.password.length);
    console.log('Hash starts with:', admin.password.substring(0, 7));
    console.log('Hash type:', admin.password.startsWith('$2a$') ? 'bcrypt' : 'Unknown');
    
    mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkPassword();