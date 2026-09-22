const express = require("express");

const {
  getAdminDashboardStatistics,
} = require("../Controllers/adminController");

const protect = require("../Middleware/authMiddleware");
const requireRole = require("../Middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/dashboard/statistics",
  protect,
  requireRole("admin"),
  getAdminDashboardStatistics,
);

module.exports = router;
