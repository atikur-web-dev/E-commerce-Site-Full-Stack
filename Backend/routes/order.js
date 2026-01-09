// Backend/routes/order.js - COMPLETE FIXED VERSION
import express from 'express';
import {
  createOrder,
  getOrderByIdUser,
  getOrderByIdAdmin,
  getMyOrders,
  getOrders,
  getAllOrders,
  updateOrderToPaid,
  updateOrderToDelivered,
  cancelOrder,
  updateOrderStatus,
  clearOrderHistory,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// ========== PUBLIC ROUTES ==========
// None

// ========== PROTECTED ROUTES ==========
router.use(protect);

// Create new order
router.post('/', createOrder);

// Get user's orders
router.get('/myorders', getMyOrders);

// Get specific order (user access - checks ownership)
router.get('/:id', getOrderByIdUser);

// Update order to paid
router.put('/:id/pay', updateOrderToPaid);

// Cancel order
router.put('/:id/cancel', cancelOrder);

// Clear order history
router.delete('/clear-history', clearOrderHistory);

// ========== ADMIN ROUTES ==========
router.use(admin);

// Get all orders (admin view)
router.get('/', getOrders);

// Alternative get all orders
router.get('/all', getAllOrders);

// Admin access to any order
router.get('/admin/:id', getOrderByIdAdmin);

// Update order to delivered
router.put('/:id/deliver', updateOrderToDelivered);

// Update order status (admin)
router.put('/:id/status', updateOrderStatus);

export default router;