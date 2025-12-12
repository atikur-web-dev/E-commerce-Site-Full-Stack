// Backend/routes/analytics.js - নতুন ফাইল তৈরি
import express from "express";
import { protect, admin } from "../middleware/auth.js";
import {
  getDashboardAnalytics,
  getInventoryAnalytics
} from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/dashboard", protect, admin, getDashboardAnalytics);
router.get("/inventory", protect, admin, getInventoryAnalytics);

export default router;