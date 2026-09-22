const express = require("express");

const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
} = require("../Controllers/propertyController");
const protect = require("../Middleware/authMiddleware");
const requireRole = require("../Middleware/roleMiddleware");

const router = express.Router();

router.get("/", getProperties);
router.get("/:id", getProperty);
router.post("/", protect, requireRole("admin", "agent"), createProperty);
router.patch("/:id", protect, requireRole("agent"), updateProperty);
router.delete("/:id", protect, requireRole("admin", "agent"), deleteProperty);

module.exports = router;
