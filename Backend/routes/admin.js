// Backend/routes/admin.js - NEW FILE
import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import {
  getAdminStats,
  getUserStats,
  getSalesStats,
  getProductStats,
  updateUserRole,
  updateUserStatus,
  deleteUser
} from '../controllers/adminController.js';

const router = express.Router();

// All routes protected and admin only
router.use(protect);
router.use(admin);

// Dashboard stats
router.get('/dashboard-stats', getAdminStats);

// User management
router.get('/users', getUserStats);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Sales reports
router.get('/sales-report', getSalesStats);

// Product management
router.get('/product-stats', getProductStats);

export default router;