// Backend/controllers/adminController.js
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// Get admin dashboard stats
export const getAdminStats = asyncHandler(async (req, res) => {
  // তোমার analyticsController.js এর similar code
});