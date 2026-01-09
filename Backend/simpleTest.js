// Backend/simpleTest.js
const mongoose = require('mongoose');
require('dotenv').config();

async function simpleTest() {
  console.log(" Simple MongoDB Test");
  
  try {
    // Connect
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(" MongoDB Connected");
    
    // Get User model
    const User = require('./models/User.js');
    
    // Check admin
    const admin = await User.findOne({ email: 'admin@example.com' });
    console.log('\n Admin Check:');
    console.log('Exists:', !!admin);
    if (admin) {
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
      console.log('Active:', admin.isActive);
    }
    
    // Check all users
    const users = await User.find({});
    console.log('\n Total Users:', users.length);
    
    mongoose.connection.close();
    console.log('\n Test Done!');
    
  } catch (err) {
    console.error(' Error:', err.message);
  }
}

simpleTest();