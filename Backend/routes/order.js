// Backend/routes/order.js
import express from 'express';
import {
  createOrder,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderToPaid,
  updateOrderToDelivered,
  cancelOrder,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes - none
// router.get("/", protect, admin, getAllOrders);
// Protected routes
router.route('/')
  .post(protect, createOrder) // Create new order
  .get(protect, admin, getOrders); // Get all orders (admin)

router.route('/myorders').get(protect, getMyOrders); // Get user's orders

router.route('/:id')
  .get(protect, getOrderById); // Get order by ID

router.route('/:id/pay').put(protect, updateOrderToPaid); // Update order to paid

router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered); // Update order to delivered (admin)

router.route('/:id/cancel').put(protect, cancelOrder); // Cancel order

export default router;