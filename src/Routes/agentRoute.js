const express = require("express");

const {
  getAgents,
  getAgent,
  createAgent,
  updateAgent,
  deactivateAgent,
  resendPasswordLink,
  activateAgent,
  getAgentDashboardStatistics,
  getAgentProperties,
} = require("../Controllers/agentControler.js");
const protect = require("../Middleware/authMiddleware.js");

const requireRole = require("../Middleware/roleMiddleware.js");

const router = express.Router();

router.post("/:id/resend-password-link", resendPasswordLink);
router.get("/", getAgents);
router.get("/:id", getAgent);
router.post("/", protect, requireRole("admin"), createAgent);
router.patch("/:id", protect, requireRole("admin", "agent"), updateAgent);
router.patch("/:id/deactivate", protect, requireRole("admin"), deactivateAgent);
router.patch("/:id/activate", protect, requireRole("admin"), activateAgent);
router.get(
  "/properties/:id",
  protect,
  requireRole("agent"),
  getAgentProperties,
);
router.get(
  "/dashboard/statistics",
  protect,
  requireRole("agent"),
  getAgentDashboardStatistics,
);

module.exports = router;
